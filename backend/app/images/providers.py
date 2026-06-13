import httpx

from app.config import API_KEY, BASE_URL, MODEL_PHOTO, PEXELS_KEY
from app.images.assets import extract_image_src_from_openai_payload


ALLOWED_ASPECT_RATIOS = (
    ("1:1", 1, 1),
    ("3:2", 3, 2),
    ("2:3", 2, 3),
    ("3:4", 3, 4),
    ("1:4", 1, 4),
    ("4:1", 4, 1),
    ("4:3", 4, 3),
    ("4:5", 4, 5),
    ("5:4", 5, 4),
    ("1:8", 1, 8),
    ("8:1", 8, 1),
    ("9:16", 9, 16),
    ("16:9", 16, 9),
    ("21:9", 21, 9),
    ("9:21", 9, 21),
)
ASPECT_RATIO_TOLERANCE = 0.02
DEFAULT_IMAGE_SIZE = "1K"

#返回合适的比例
def _resolve_aspect_ratio(width: float, height: float) -> str | None:
    if width <= 0 or height <= 0:
        return None
    ratio = width / height
    for label, ratio_width, ratio_height in ALLOWED_ASPECT_RATIOS:
        if abs(ratio - ratio_width / ratio_height) <= ASPECT_RATIO_TOLERANCE:
            return label
    return None


async def generate_ai_image_src(prompt: str, width: float = 100, height: float = 100) -> str | None:
    """通过配置的 OpenAI 兼容图像端点生成一个图像资产。"""
    if not BASE_URL or not API_KEY or not MODEL_PHOTO:
        return None
    aspect_ratio = _resolve_aspect_ratio(width, height)
    if aspect_ratio is None:
        return None
    try:
        payload = {
            "model": MODEL_PHOTO,
            "prompt": prompt,
            "n": 1,
            "aspect_ratio": aspect_ratio,
            "image_size": DEFAULT_IMAGE_SIZE,
        }
        headers = {"Authorization": f"Bearer {API_KEY}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL.rstrip('/')}/images/generations",
                headers=headers,
                json=payload,
                timeout=60,
            )
        if response.status_code != 200:
            return None
        return extract_image_src_from_openai_payload(response.json())
    except Exception:
        return None

#搜索图片的方式
async def search_stock_image_src(prompt: str, width: float = 100, height: float = 100) -> str | None:
    return await _search_pexels_image(prompt)


async def _search_pexels_image(prompt: str) -> str | None:
    if not PEXELS_KEY:
        return None
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.pexels.com/v1/search",
            params={"query": prompt, "per_page": 1, "orientation": "landscape"},
            headers={"Authorization": PEXELS_KEY},
            timeout=30,
        )
    if response.status_code != 200:
        return None
    data = response.json()
    photos = data.get("photos")
    if not photos:
        return None
    src = photos[0].get("src", {})
    return src.get("large2x") or src.get("large") or src.get("original")
