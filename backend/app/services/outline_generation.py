import json
import uuid
from typing import Any

from fastapi import HTTPException
from pydantic import ValidationError

from app.ai.client import call_llm
from app.ai.parsing import strip_markdown_json
from app.ai.prompts import outlinePrompt
from app.config import DEBUG_RAW_AI_RESPONSE
from app.schemas import OutlineResponse

#规范化ai直接返回的大纲
def handleOutlineRes(ai_res: dict[str, Any]):
    content = ai_res["choices"][0]["message"]["content"]
    try:
        data = json.loads(strip_markdown_json(content))
        for section in data["sections"]:
            section["id"] = str(uuid.uuid4())
        validated_data = OutlineResponse.model_validate(data)
        return validated_data
    except (json.JSONDecodeError, KeyError, TypeError, ValidationError) as e:
        raise HTTPException(status_code=422, detail="AI 返回的格式不合规")


async def generateOutline(prompt: str):
    ai_res = await call_llm(outlinePrompt, prompt)
    if DEBUG_RAW_AI_RESPONSE:
        print(f"[OUTLINE_AI] {ai_res['choices'][0]['message']['content']}")
    return handleOutlineRes(ai_res)
