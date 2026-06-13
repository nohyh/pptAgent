from typing import Any

import httpx
from fastapi import HTTPException

from app.config import API_KEY_2, BASE_URL_2, MODEL_FLASH_2


async def call_llm(systemPrompt: str, userPrompt: Any) -> dict[str, Any]:
    if not BASE_URL_2 or not API_KEY_2 or not MODEL_FLASH_2:
        raise HTTPException(status_code=500, detail="LLM 配置缺失")
    url = f"{BASE_URL_2}/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY_2}"
    }
    payload = {
        "model": MODEL_FLASH_2,
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
