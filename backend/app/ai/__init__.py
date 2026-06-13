import json

from app.schemas import Presentation

__all__ = [
    "Presentation",
    "_strip_markdown_json",
    "call_llm",
    "generateOutline",
    "generatePpt",
    "generate_ai_image_src",
    "generate_image_plan",
    "handleOutlineRes",
    "handlePptRes",
    "json",
    "load_template",
    "router",
    "search_stock_image_src",
    "strip_markdown_json",
]


def __getattr__(name: str):
    if name == "call_llm":
        from app.ai.client import call_llm

        return call_llm
    if name in {"_strip_markdown_json", "strip_markdown_json"}:
        from app.ai.parsing import _strip_markdown_json, strip_markdown_json

        return _strip_markdown_json if name == "_strip_markdown_json" else strip_markdown_json
    if name == "router":
        from app.api.routes.generation import router

        return router
    if name in {"generateOutline", "handleOutlineRes"}:
        from app.services.outline_generation import generateOutline, handleOutlineRes

        return generateOutline if name == "generateOutline" else handleOutlineRes
    if name in {"generatePpt", "generate_image_plan", "handlePptRes"}:
        from app.services.presentation_generation import generatePpt, generate_image_plan, handlePptRes

        return {
            "generatePpt": generatePpt,
            "generate_image_plan": generate_image_plan,
            "handlePptRes": handlePptRes,
        }[name]
    if name in {"generate_ai_image_src", "search_stock_image_src"}:
        from app.images.providers import generate_ai_image_src, search_stock_image_src

        return generate_ai_image_src if name == "generate_ai_image_src" else search_stock_image_src
    if name == "load_template":
        from app.template_engine.loader import load_template

        return load_template
    raise AttributeError(name)
