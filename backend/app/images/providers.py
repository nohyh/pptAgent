import httpx
from urllib.parse import urlencode, urlsplit, urlunsplit

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
# Pexels 搜索只支持横图/竖图/方图；精确比例靠后面的 CDN 裁剪参数保证。
STOCK_IMAGE_LONG_EDGE = 1920
STOCK_ORIENTATION_SQUARE_TOLERANCE = 0.05

#返回合适的比例
def resolve_aspect_ratio(width: float, height: float) -> str | None:
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
    aspect_ratio = resolve_aspect_ratio(width, height)
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
    return await _search_pexels_image(prompt, width, height)


def _resolve_stock_orientation(width: float, height: float) -> str:
    # 搜索阶段只做大方向过滤，减少拿到构图方向完全不匹配的照片。
    if width <= 0 or height <= 0:
        return "landscape"
    ratio = width / height
    if abs(ratio - 1) <= STOCK_ORIENTATION_SQUARE_TOLERANCE:
        return "square"
    if ratio > 1:
        return "landscape"
    return "portrait"


def _resolve_stock_crop_size(width: float, height: float) -> tuple[int, int]:
    # 固定长边为 1920，短边按图片框比例反推，避免返回图片被拉伸变形。
    if width <= 0 or height <= 0:
        width = height = 1
    if width >= height:
        return STOCK_IMAGE_LONG_EDGE, max(1, round(STOCK_IMAGE_LONG_EDGE * height / width))
    return max(1, round(STOCK_IMAGE_LONG_EDGE * width / height)), STOCK_IMAGE_LONG_EDGE


def _build_stock_crop_url(src: str, width: float, height: float) -> str:
    target_width, target_height = _resolve_stock_crop_size(width, height)
    parts = urlsplit(src)
    # 覆盖原 URL 的 query，让 Pexels/imgix 按目标宽高云端裁剪。
    query = urlencode(
        {
            "auto": "compress",
            "cs": "tinysrgb",
            "w": target_width,
            "h": target_height,
            "fit": "crop",
            "crop": "entropy",
        }
    )
    return urlunsplit((parts.scheme, parts.netloc, parts.path, query, parts.fragment))


async def _search_pexels_image(prompt: str, width: float, height: float) -> str | None:
    if not PEXELS_KEY:
        return None
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.pexels.com/v1/search",
            params={
                "query": prompt,
                "per_page": 1,
                "orientation": _resolve_stock_orientation(width, height),
            },
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
    # 优先用 original，避免在 Pexels 已经缩放过的尺寸上二次裁剪。
    image_src = src.get("original") or src.get("large2x") or src.get("large")
    if not image_src:
        return None
    return _build_stock_crop_url(image_src, width, height)
