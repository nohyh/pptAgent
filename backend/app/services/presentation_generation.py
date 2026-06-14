from typing import Any

import json
from fastapi import HTTPException
from pydantic import ValidationError

from app.ai.client import call_llm
from app.ai.parsing import strip_markdown_json
from app.ai.prompts import pptPrompt
from app.images.fulfillment import assert_no_pending_images, fill_presentation_images
from app.images.planner import build_image_plan_map, collect_pending_image_slots
from app.images.prompts import imagePlanningPrompt
from app.images.providers import generate_ai_image_src, search_stock_image_src
from app.schemas import PptRequest, Presentation
from app.template_engine import loader as template_loader
from app.template_engine.slots import filter_templates_for_ai, hydrate_presentation


def handlePptRes(ai_res: dict[str, Any], request: PptRequest, templates: list[dict]):
    content = ai_res["choices"][0]["message"]["content"]
    try:
        data = json.loads(strip_markdown_json(content))
        presentation = hydrate_presentation(
            data,
            templates,
            title=request.title,
            layout=request.layout,
            theme=request.theme,
        )
        return Presentation.model_validate(presentation)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail="AI 返回的格式不合规")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail="AI 返回的格式不合规")
    except ValueError as e:
        raise HTTPException(status_code=422, detail="AI 返回的格式不合规")


async def generate_image_plan(presentation: Presentation) -> list[dict[str, Any]]:
    """规划待处理的图片资产，而不将规划元数据写入 Presentation JSON。"""
    slots = collect_pending_image_slots(presentation)
    if not slots:
        return []
    user_prompt = json.dumps(
        {
            "images": slots
        },
        ensure_ascii=False
    )
    ai_res = await call_llm(imagePlanningPrompt, user_prompt)
    content = ai_res["choices"][0]["message"]["content"]
    data = json.loads(strip_markdown_json(content))
    if isinstance(data, list):
        images = data
    elif isinstance(data, dict):
        images = data.get("images")
    else:
        images = None
    if not isinstance(images, list):
        raise HTTPException(status_code=422, detail="AI 图片规划返回格式不合规")
    for image in images:
        print(
            "[IMAGE_PLAN] "
            f"slideId={image.get('slideId')} "
            f"elementId={image.get('elementId')} "
            f"generateBy={image.get('generateBy')} "
            f"imagePrompt={image.get('imagePrompt')}"
        )
    return images


async def generatePpt(request: PptRequest):
    #加载模板
    templates = template_loader.load_template(request.theme)
    if templates is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    # 过滤模板，只暴露必要部分
    filtered_templates = filter_templates_for_ai(templates)
    if not any(template.get("elements") for template in filtered_templates):
        raise HTTPException(status_code=422, detail="当前模板没有可填充 slots")
    req = {
        "prompt": request.prompt,
        "title": request.title,
        "sections": [section.model_dump() for section in request.sections],
        "pageCount": request.pageCount-1,
        "templates": filtered_templates,
    }
    #第一次调用大模型，填充ppt中的文本内容
    user_prompt = json.dumps(req, ensure_ascii=False)
    ai_res = await call_llm(
        pptPrompt,
        user_prompt
    )
    #填充模板，返回presentation对象
    presentation = handlePptRes(ai_res, request, templates)
    #生成图片规划
    #大模型交互，进行图片规划
    image_plan = await generate_image_plan(presentation)
    #数据校验和结构转化
    image_plan_map = build_image_plan_map(image_plan)
    #填充ppt中的图片
    await fill_presentation_images(
        presentation,
        image_plan_map=image_plan_map,
        generate_ai_image=generate_ai_image_src,
        search_stock_image=search_stock_image_src,
    )
    assert_no_pending_images(presentation)
    return presentation
