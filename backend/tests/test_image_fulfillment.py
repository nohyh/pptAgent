import pytest

from app.images.assets import extract_image_src_from_openai_payload
from app.images.fulfillment import assert_no_pending_images, fill_presentation_images
from app.schemas import ImageElement, Presentation


@pytest.fixture
def anyio_backend():
    return "asyncio"


def make_pending_presentation(src=""):
    return Presentation.model_validate(
        {
            "id": "deck-1",
            "title": "Demo",
            "layout": "16x9",
            "theme": "minimalist",
            "slides": [
                {
                    "id": "slide-1",
                    "elements": [
                        {
                            "id": "img-1",
                            "type": "image",
                            "x": 10,
                            "y": 10,
                            "width": 40,
                            "height": 30,
                            "src": src,
                            "alt": "fallback alt",
                        }
                    ],
                }
            ],
        }
    )


def first_image(presentation: Presentation) -> ImageElement:
    element = presentation.slides[0].elements[0]
    assert isinstance(element, ImageElement)
    return element


@pytest.mark.anyio
async def test_fill_presentation_images_writes_ai_src_from_plan_map():
    async def fake_ai(prompt: str, width: float, height: float) -> str:
        assert prompt == "clean business visual"
        assert width == 40
        assert height == 30
        return "data:image/png;base64,abc"

    presentation = make_pending_presentation("")
    plan_map = {
        ("slide-1", "img-1"): {
            "generateBy": "ai",
            "imagePrompt": "clean business visual",
        }
    }

    await fill_presentation_images(
        presentation,
        image_plan_map=plan_map,
        generate_ai_image=fake_ai,
        search_stock_image=None,
    )

    image = first_image(presentation)
    assert image.src == "data:image/png;base64,abc"
    assert not hasattr(image, "generateBy")
    assert not hasattr(image, "imagePrompt")


@pytest.mark.anyio
async def test_fill_presentation_images_falls_back_from_stock_to_ai():
    async def fake_stock(prompt: str, width: float, height: float) -> str | None:
        assert prompt == "clean business visual"
        assert width == 640
        assert height == 270
        return None

    async def fake_ai(prompt: str, width: float, height: float) -> str:
        assert prompt == "clean business visual"
        assert width == 40
        assert height == 30
        return "data:image/png;base64,abc"

    presentation = make_pending_presentation("")
    plan_map = {
        ("slide-1", "img-1"): {
            "generateBy": "stock",
            "imagePrompt": "clean business visual",
        }
    }

    await fill_presentation_images(
        presentation,
        image_plan_map=plan_map,
        generate_ai_image=fake_ai,
        search_stock_image=fake_stock,
    )

    image = first_image(presentation)
    assert image.src == "data:image/png;base64,abc"


@pytest.mark.anyio
async def test_fill_presentation_images_passes_slide_adjusted_size_to_stock_provider():
    seen = {}

    async def fake_stock(prompt: str, width: float, height: float) -> str:
        seen["prompt"] = prompt
        seen["width"] = width
        seen["height"] = height
        return "https://example.test/photo.png"

    presentation = make_pending_presentation("")
    image = first_image(presentation)
    image.width = 50
    image.height = 50
    plan_map = {
        ("slide-1", "img-1"): {
            "generateBy": "stock",
            "imagePrompt": "clean business visual",
        }
    }

    await fill_presentation_images(
        presentation,
        image_plan_map=plan_map,
        generate_ai_image=None,
        search_stock_image=fake_stock,
    )

    assert seen == {
        "prompt": "clean business visual",
        "width": 800,
        "height": 450,
    }
    assert image.src == "https://example.test/photo.png"


@pytest.mark.anyio
async def test_fill_presentation_images_uses_placeholder_when_plan_missing():
    presentation = make_pending_presentation("")

    await fill_presentation_images(
        presentation,
        image_plan_map={},
        generate_ai_image=None,
        search_stock_image=None,
    )

    image = first_image(presentation)
    assert image.src.startswith("data:image/svg+xml;base64,")


def test_assert_no_pending_images_rejects_empty_src():
    presentation = make_pending_presentation("")

    with pytest.raises(ValueError, match="Pending images remain"):
        assert_no_pending_images(presentation)


def test_extract_image_src_from_b64_json_payload():
    payload = {"data": [{"b64_json": "abc"}]}

    assert extract_image_src_from_openai_payload(payload) == "data:image/png;base64,abc"


def test_extract_image_src_from_url_payload():
    payload = {"data": [{"url": "https://example.com/image.png"}]}

    assert extract_image_src_from_openai_payload(payload) == "https://example.com/image.png"
