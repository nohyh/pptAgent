from app.config import API_KEY,BASE_URL,MODEL
from fastapi import APIRouter, Body, HTTPException
from app.prompts import outlinePrompt
import httpx
import json
import uuid
from app.schemas import OutlineResponse
from pydantic import ValidationError

router = APIRouter()

def call_llm(systemPrompt:str,userPrompt:str):
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
    ai_res = call_llm(outlinePrompt,prompt)
    return handleOutlineRes(ai_res)


        
