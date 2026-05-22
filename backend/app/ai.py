from app.config import API_KEY,BASE_URL,MODEL
from fastapi import APIRouter, Body
from app.prompts import outlinePrompt
import httpx
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

@router.post("/generateOutline")
async def generateOutline(userPrompt: str = Body(...)):
    ai_res = call_llm(outlinePrompt,userPrompt)
    return handleOutlineRes(ai_res)

def handleOutlineRes(ai_res: dict):
    content =  ai_res["choices"][0]["message"]["content"]
    try:
        validated_data = OutlineResponse.model_validate_json(content)
        return validated_data
    except ValidationError as e:
        raise 
        HTTPException(status_code=422, detail=f"AI 返回的格式不合规: {e}")
        

