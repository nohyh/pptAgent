from typing import Any

from contextlib import contextmanager
import json
from time import perf_counter
from fastapi import HTTPException
from pydantic import ValidationError

from app.ai.client import call_llm
from app.ai.parsing import strip_markdown_json
from app.ai.prompts import jsonRepairPrompt, pptPrompt
from app.config import DEBUG_RAW_AI_RESPONSE
from app.images.fulfillment import assert_no_pending_images, fill_presentation_images
from app.images.planner import build_image_plan_map, collect_pending_image_slots
from app.images.prompts import imagePlanningPrompt
from app.images.providers import generate_ai_image_src, search_stock_image_src
from app.schemas import PptRequest, Presentation
from app.template_engine import loader as template_loader
from app.template_engine.slots import filter_templates_for_ai, hydrate_presentation


@contextmanager
def log_ppt_stage(stage: str):
    start = perf_counter()
    try:
        yield
    except Exception as exc:
        duration_ms = int((perf_counter() - start) * 1000)
        print(
            "[PPT_STAGE] "
            f"stage={stage} status=failed duration_ms={duration_ms} "
            f"error={type(exc).__name__}"
        )
        raise
    else:
        duration_ms = int((perf_counter() - start) * 1000)
        print(f"[PPT_STAGE] stage={stage} status=success duration_ms={duration_ms}")


def _ai_content(ai_res: dict[str, Any]) -> str:
    return ai_res["choices"][0]["message"]["content"]


def handlePptRes(ai_res: dict[str, Any], request: PptRequest, templates: list[dict]):
    content = _ai_content(ai_res)
    try:
        # AI 只返回模板槽位数据；真正的布局和固定元素由后端模板引擎补齐。
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
    try:
        data = json.loads(strip_markdown_json(content))
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="AI 图片规划返回格式不合规")
    if isinstance(data, list):
        images = data
    elif isinstance(data, dict):
        images = data.get("images")
    else:
        images = None
    if not isinstance(images, list):
        raise HTTPException(status_code=422, detail="AI 图片规划返回格式不合规")
    for image in images:
        # 调试提示词时重点看 generateBy 和 imagePrompt，最终不会写进 Presentation JSON。
        print(
            "[IMAGE_PLAN] "
            f"slideId={image.get('slideId')} "
            f"elementId={image.get('elementId')} "
            f"generateBy={image.get('generateBy')} "
            f"imagePrompt={image.get('imagePrompt')}"
        )
    return images


async def repair_ppt_content_json(
    *,
    raw_content: str,
    request: PptRequest,
    filtered_templates: list[dict],
    error_detail: str,
) -> dict[str, Any]:
    # 只在结构解析失败后做一次修复，避免把正常生成链路变成多轮对话。
    repair_input = json.dumps(
        {
            "error": error_detail,
            "title": request.title,
            "pageCount": request.pageCount - 1,
            "templates": filtered_templates,
            "rawContent": raw_content,
        },
        ensure_ascii=False,
    )
    return await call_llm(jsonRepairPrompt, repair_input)


async def generatePpt(request: PptRequest):
    # 加载完整模板；完整模板只给后端使用，避免让 AI 接触过多布局细节。
    with log_ppt_stage("template_load"):
        templates = template_loader.load_template(request.theme)
        if templates is None:
            raise HTTPException(status_code=404, detail="模板不存在")
        # 过滤模板，只暴露 AI 必须填写的槽位，减少 token 和格式漂移。
        filtered_templates = filter_templates_for_ai(templates)
        if not any(template.get("elements") for template in filtered_templates):
            raise HTTPException(status_code=422, detail="当前模板没有可填充 slots")
    req = {
        "prompt": request.prompt,
        "title": request.title,
        "sections": [section.model_dump() for section in request.sections],
        # 前端页数包含自动追加的 thanks 页，这里让内容页生成数量预留 1 页。
        "pageCount": request.pageCount-1,
        "templates": filtered_templates,
    }
    # 第一阶段：生成每页要填入模板槽位的结构化文本。
    user_prompt = json.dumps(req, ensure_ascii=False)
    with log_ppt_stage("ppt_content"):
        ai_res = await call_llm(
            pptPrompt,
            user_prompt
        )
    if DEBUG_RAW_AI_RESPONSE:
        print(f"[PPT_AI] {_ai_content(ai_res)}")
    # 第二阶段：后端模板水合并做 Pydantic 校验，失败时统一返回 422。
    try:
        with log_ppt_stage("template_hydration"):
            presentation = handlePptRes(ai_res, request, templates)
    except HTTPException as exc:
        if exc.status_code != 422:
            raise
        with log_ppt_stage("ppt_content_repair"):
            ai_res = await repair_ppt_content_json(
                raw_content=_ai_content(ai_res),
                request=request,
                filtered_templates=filtered_templates,
                error_detail=str(exc.detail),
            )
        if DEBUG_RAW_AI_RESPONSE:
            print(f"[PPT_AI_REPAIR] {_ai_content(ai_res)}")
        with log_ppt_stage("template_hydration_retry"):
            presentation = handlePptRes(ai_res, request, templates)
    # 第三阶段：只对 pending 图片槽做规划和填充，保持最终 JSON 干净。
    with log_ppt_stage("image_planning"):
        image_plan = await generate_image_plan(presentation)
        image_plan_map = build_image_plan_map(image_plan)
    with log_ppt_stage("image_fulfillment"):
        # 生成图片
        await fill_presentation_images(
            presentation,
            image_plan_map=image_plan_map,
            generate_ai_image=generate_ai_image_src,
            search_stock_image=search_stock_image_src,
        )
        assert_no_pending_images(presentation)
    return presentation
