from typing import Any

from app.images.providers import resolve_aspect_ratio
from app.schemas import Presentation


# 代表待处理（未填充）图片的占位符源字符串
PENDING_IMAGE_SRC = "__PENDING_IMAGE__"

# 图片策划映射类型别名，键为 (slide_id, element_id)，值为图片获取的方案定义 (包含获取方式和提示词)
ImagePlanMap = dict[tuple[str, str], dict[str, str]]


def is_pending_image_src(src: str | None) -> bool:
    """
    判断图片的源地址（src）是否为待处理的占位值。
    """
    return src is None or src == "" or src == PENDING_IMAGE_SRC


# 提取幻灯片中的文本
def _slide_text(slide) -> str:
    """
    提取并拼接幻灯片中所有文本元素的内容，作为生成图片时的上下文语义背景。
    """
    parts = []
    for element in slide.elements:
        if element.type == "text":
            content = getattr(element, "content", "")
            if content:
                parts.append(content)
    return "\n".join(parts)


def collect_pending_image_slots(presentation: Presentation) -> list[dict[str, Any]]:
    """
    扫描并收集演示文稿中所有状态为“待填充”的图片插槽，
    并提取出其对应幻灯片的文本内容、插槽大小和宽高比标签，返回给 AI 供其做图片策划。
    """
    slots = []
    for slide_index, slide in enumerate(presentation.slides):
        # 获取当前页的文本，让 AI 知道这张幻灯片讲的是什么，方便配图
        text = _slide_text(slide)
        for element in slide.elements:
            if element.type != "image":
                continue
            if not is_pending_image_src(element.src):
                # 如果图片已经有了真实源（即不是待处理占位符），就跳过
                continue
            slots.append(
                {
                    "slideId": slide.id,
                    "elementId": element.id,
                    "slideIndex": slide_index,
                    "slideText": text,
                    "slot": {
                        "x": element.x,
                        "y": element.y,
                        "width": element.width,
                        "height": element.height,
                        "aspectRatio": resolve_aspect_ratio(element.width, element.height),
                        "alt": element.alt or "",
                    },
                }
            )
    return slots


def build_image_plan_map(plan_items: list[dict[str, Any]]) -> ImagePlanMap:
    """
    将 AI 生成的图片获取方案列表进行合法性验证，并整理映射为以 (slide_id, element_id) 为键的哈希字典，
    方便后端逻辑在填充图片时快速检索对应的方案。
    """
    plan_map: ImagePlanMap = {}
    for item in plan_items:
        slide_id = str(item.get("slideId") or "").strip()
        element_id = str(item.get("elementId") or "").strip()
        generate_by = str(item.get("generateBy") or "").strip()
        image_prompt = str(item.get("imagePrompt") or "").strip()

        # 合法性校验
        if not slide_id or not element_id:
            raise ValueError("Image plan item missing slideId or elementId")
        if generate_by not in {"ai", "stock"}:
            raise ValueError(f"Invalid generateBy for image {element_id}")
        if not image_prompt:
            raise ValueError(f"Missing imagePrompt for image {element_id}")

        # 写入映射
        plan_map[(slide_id, element_id)] = {
            "generateBy": generate_by,
            "imagePrompt": image_prompt,
        }
    return plan_map
