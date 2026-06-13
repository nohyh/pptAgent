import base64
from typing import Any

#占位图片
def placeholder_data_url() -> str:
    svg = (
        "<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'>"
        "<rect width='1600' height='900' fill='#f1f5f9'/>"
        "<path d='M0 900L1600 0' stroke='#cbd5e1' stroke-width='8'/>"
        "<circle cx='800' cy='450' r='120' fill='none' stroke='#94a3b8' stroke-width='8'/>"
        "</svg>"
    )
    encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    return f"data:image/svg+xml;base64,{encoded}"

#规范化图片src
def normalize_image_src(src: str | None) -> str | None:
    if not src:
        return None
    if src.startswith("data:image/") or src.startswith("http://") or src.startswith("https://"):
        return src
    return None


def extract_image_src_from_openai_payload(payload: dict[str, Any]) -> str | None:
    data = payload.get("data")
    if not isinstance(data, list) or not data:
        return None
    item = data[0]
    if not isinstance(item, dict):
        return None
    url = item.get("url")
    if isinstance(url, str) and url:
        return url
    b64_json = item.get("b64_json")
    if isinstance(b64_json, str) and b64_json:
        return f"data:image/png;base64,{b64_json}"
    return None
