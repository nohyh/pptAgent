from typing import Any
from app.config import API_KEY,BASE_URL,MODEL
from fastapi import APIRouter, Body, HTTPException
from app.prompts import outlinePrompt,pptPrompt
import httpx
import json
import uuid
from pathlib import Path
from app.schemas import OutlineResponse, PptRequest,PptResponse, Presentation
from app.mocks import mockOutline, mock_presentation
from pydantic import ValidationError

router = APIRouter()
TEMPLATE_DIR = Path(__file__).parent / "templates"
#根据theme，加载对应的模板json
def load_template(theme):
    for name in (theme, "claude"):
        path = TEMPLATE_DIR / f"{name}.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    return None

# 通用的调用大模型的方法
async def call_llm(systemPrompt:str,userPrompt:Any):
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    payload = {
        "model": MODEL,
        "messages": [{"role":"system","content":systemPrompt},{"role":"user","content":userPrompt}],
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload, timeout=300)
        try:
            return response.json()
        except Exception as e:
            print(f"LLM API Error! Status: {response.status_code}, Response: {response.text}")
            raise e

# 处理大模型返回的大纲
def handleOutlineRes(ai_res: dict):
    content =  ai_res["choices"][0]["message"]["content"]
    print(content)
    data = json.loads(content)
    for section in data["sections"]:
        section["id"] = str(uuid.uuid4())
    
    try:
        validated_data = OutlineResponse.model_validate(data)
        return validated_data
    except ValidationError as e:
        raise HTTPException(status_code=422, detail="AI 返回的格式不合规")

@router.post("/generateOutline")
async def generateOutline(prompt: str = Body(...,embed=True)):
    ai_res = await call_llm(outlinePrompt,prompt)
    return handleOutlineRes(ai_res)
    # return mockOutline

def handlePptRes(ai_res: dict):
    content =  ai_res["choices"][0]["message"]["content"]
    print(content)
    data = json.loads(content)
    data["id"] = str(uuid.uuid4())
    for slide in data["slides"]:
        slide["id"] = str(uuid.uuid4())
        for element in slide["elements"]:
            element["id"] = str(uuid.uuid4())
    try:
        validated_data = Presentation.model_validate(data)
        return validated_data
    except ValidationError as e:
        raise HTTPException(status_code=422, detail="AI 返回的格式不合规")

@router.post("/generatePpt")
async def generatePpt(request:PptRequest):
    req = request.model_dump(by_alias=True)
    req["templates"] = load_template(request.theme)

    ai_res = await call_llm(
       pptPrompt,
        json.dumps(req, ensure_ascii=False)
    )

    return handlePptRes(ai_res)
    # return mock_presentation
