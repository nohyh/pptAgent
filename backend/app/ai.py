from typing import Any
from app.config import API_KEY,BASE_URL,MODEL
from fastapi import APIRouter, Body, HTTPException
from app.prompts import outlinePrompt,pptPrompt
import httpx
import json
import uuid
from app.schemas import OutlineResponse, PptRequest,PptResponse, Presentation
from app.mocks import mockOutline, mock_presentation
from pydantic import ValidationError

router = APIRouter()

def call_llm(systemPrompt:str,userPrompt:Any):
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    payload = {
        "model": MODEL,
        "messages": [{"role":"system","content":systemPrompt},{"role":"user","content":userPrompt}],
    }
    
    response = httpx.post(url, headers=headers, json=payload,timeout=120)
    return response.json()

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
    # ai_res = call_llm(outlinePrompt,prompt)
    # return handleOutlineRes(ai_res)
    return mockOutline

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
    #pptRequest_json = request.model_dump_json(by_alias=True, indent=2)
    #ai_res = call_llm(pptPrompt,pptRequest_json)
    #return handlePptRes(ai_res)
    return mock_presentation
