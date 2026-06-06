from typing import Any
from app.config import API_KEY, BASE_URL, MODEL, MODEL_2, MODEL_3, MODEL_4
from fastapi import APIRouter, Body, HTTPException
from app.prompts import outlinePrompt, pptPrompt
import httpx
import json
import uuid
from pathlib import Path
from app.schemas import OutlineResponse, PptRequest, Presentation
from pydantic import ValidationError
from app.template_slots import filter_templates_for_ai, hydrate_presentation

router = APIRouter()
TEMPLATE_DIR = Path(__file__).parent / "templates"

# 根据theme，加载对应的模板json
def load_template(theme):
    for name in (theme, "claude"):
        path = TEMPLATE_DIR / f"{name}.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    return None

# 通用的调用大模型的方法
async def call_llm(systemPrompt: str, userPrompt: Any) -> dict[str, Any]:
    model = MODEL_4 or MODEL_3 or MODEL_2 or MODEL
    if not BASE_URL or not API_KEY or not model:
        raise HTTPException(status_code=500, detail="LLM 配置缺失")
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    payload = {
        "model": model,
        "messages": [{"role": "system", "content": systemPrompt}, {"role": "user", "content": userPrompt}],
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=180)
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"LLM API 请求失败: {e}")

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"LLM API 请求失败: status={response.status_code}")

    try:
        return response.json()
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"LLM API 响应不是 JSON: {e}")

# 处理大模型返回的大纲
def handleOutlineRes(ai_res: dict[str, Any]):
    content = ai_res["choices"][0]["message"]["content"]
    try:
        data = json.loads(_strip_markdown_json(content))
        for section in data["sections"]:
            section["id"] = str(uuid.uuid4())
        validated_data = OutlineResponse.model_validate(data)
        return validated_data
    except (json.JSONDecodeError, KeyError, TypeError, ValidationError) as e:
        raise HTTPException(status_code=422, detail="AI 返回的格式不合规")

@router.post("/generateOutline")
async def generateOutline(prompt: str = Body(..., embed=True)):
    ai_res = await call_llm(outlinePrompt, prompt)
    return handleOutlineRes(ai_res)

def handlePptRes(ai_res: dict[str, Any], request: PptRequest, templates: list[dict]):
    content = ai_res["choices"][0]["message"]["content"]
    try:
        data = json.loads(_strip_markdown_json(content))
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

@router.post("/generatePpt")
async def generatePpt(request: PptRequest):
    templates = load_template(request.theme)
    if templates is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    filtered_templates = filter_templates_for_ai(templates)
    if not any(template.get("elements") for template in filtered_templates):
        raise HTTPException(status_code=422, detail="当前模板没有可填充 slots")
    req = {
        "prompt": request.prompt,
        "title": request.title,
        "sections": [section.model_dump() for section in request.sections],
        "pageCount": request.pageCount,
        "templates": filtered_templates,
    }
    user_prompt = json.dumps(req, ensure_ascii=False)
    ai_res = await call_llm(
        pptPrompt,
        user_prompt
    )
    return handlePptRes(ai_res, request, templates)

# 去除大模型返回的markdown格式的json
def _strip_markdown_json(content: str) -> str:
    content = content.strip()
    if content.startswith("```"):
        lines = content.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        content = "\n".join(lines).strip()
    return content
