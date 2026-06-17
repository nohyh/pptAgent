import asyncio
from collections.abc import Awaitable, Callable

from app.images.assets import normalize_image_src, placeholder_data_url
from app.images.planner import ImagePlanMap, is_pending_image_src
from app.schemas import Presentation


ImageProviderFunc = Callable[[str, float, float], Awaitable[str | None]]
SLIDE_LAYOUT_SIZE = {
    "16x9": (16, 9),
    "4x3": (4, 3),
}


def _stock_slot_size(layout: str, element) -> tuple[float, float]:
    slide_width, slide_height = SLIDE_LAYOUT_SIZE.get(layout, (16, 9))
    return element.width * slide_width, element.height * slide_height

#生成单张图片
async def _fill_one_image(
    slide_id: str,
    element,
    layout: str,
    image_plan_map: ImagePlanMap,
    generate_ai_image: ImageProviderFunc | None,
    search_stock_image: ImageProviderFunc | None,
) -> None:
    plan = image_plan_map.get((slide_id, element.id))
    if not plan:
        element.src = placeholder_data_url()
        return

    prompt = plan["imagePrompt"]
    generate_by = plan["generateBy"]

    try:
        src = None
        if generate_by == "stock" and search_stock_image is not None:
            #搜图的情况
            stock_width, stock_height = _stock_slot_size(layout, element)
            src = normalize_image_src(await search_stock_image(prompt, stock_width, stock_height))
            if src:
                element.src = src
                return

        if generate_ai_image is not None:
            #ai生成的情况
            src = normalize_image_src(await generate_ai_image(prompt, element.width, element.height))
            if src:
                element.src = src
                return

        if generate_by == "ai" and search_stock_image is not None:
            #ai失败的话，回退到搜图
            stock_width, stock_height = _stock_slot_size(layout, element)
            src = normalize_image_src(await search_stock_image(prompt, stock_width, stock_height))
            if src:
                element.src = src
                return

        element.src = placeholder_data_url()
    except Exception:
        element.src = placeholder_data_url()


async def fill_presentation_images(
    presentation: Presentation,
    image_plan_map: ImagePlanMap,
    generate_ai_image: ImageProviderFunc | None,
    search_stock_image: ImageProviderFunc | None,
    timeout_seconds: float = 60,
) -> None:
    tasks = []
    for slide in presentation.slides:
        for element in slide.elements:
            if element.type != "image":
                continue
            if not is_pending_image_src(element.src):
                continue
            tasks.append(
                _fill_one_image(
                    slide.id,
                    element,
                    presentation.layout,
                    image_plan_map,
                    generate_ai_image,
                    search_stock_image,
                )
            )

    if not tasks:
        return

    try:
        #并发生成图片
        await asyncio.wait_for(
            asyncio.gather(*tasks, return_exceptions=True),
            timeout=timeout_seconds,
        )
    except asyncio.TimeoutError:
        #超时了的话，就给每个图片都填上默认图
        for slide in presentation.slides:
            for element in slide.elements:
                if element.type == "image" and is_pending_image_src(element.src):
                    element.src = placeholder_data_url()


def assert_no_pending_images(presentation: Presentation) -> None:
    #检查是不是还有没填的图片
    pending = []
    for slide in presentation.slides:
        for element in slide.elements:
            if element.type == "image" and is_pending_image_src(element.src):
                pending.append(f"{slide.id}/{element.id}")
    if pending:
        raise ValueError(f"Pending images remain: {', '.join(pending)}")
