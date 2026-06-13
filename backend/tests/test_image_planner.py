import pytest

from app.images.planner import (
    PENDING_IMAGE_SRC,
    build_image_plan_map,
    collect_pending_image_slots,
    is_pending_image_src,
)
from app.schemas import Presentation


def make_presentation(src=""):
    return Presentation.model_validate(
        {
            "id": "deck-1",
            "title": "Demo",
            "layout": "16x9",
            "theme": "minimalist",
            "slides": [
                {
                    "id": "slide-1",
                    "background": "#ffffff",
                    "elements": [
                        {
                            "id": "text-1",
                            "type": "text",
                            "x": 10,
                            "y": 10,
                            "width": 40,
                            "height": 10,
                            "content": "Supply chain automation",
                            "fontSize": 24,
                        },
                        {
                            "id": "img-1",
                            "type": "image",
                            "x": 52,
                            "y": 20,
                            "width": 38,
                            "height": 40,
                            "src": src,
                            "alt": "main visual",
                        },
                    ],
                }
            ],
        }
    )


def test_is_pending_image_src_accepts_empty_string_and_sentinel():
    assert is_pending_image_src("")
    assert is_pending_image_src(PENDING_IMAGE_SRC)
    assert not is_pending_image_src("data:image/png;base64,abc")
    assert not is_pending_image_src("https://example.com/image.png")


def test_collect_pending_image_slots_handles_empty_template_src():
    slots = collect_pending_image_slots(make_presentation(""))

    assert slots == [
        {
            "slideId": "slide-1",
            "elementId": "img-1",
            "slideIndex": 0,
            "slideText": "Supply chain automation",
            "slot": {
                "x": 52,
                "y": 20,
                "width": 38,
                "height": 40,
                "aspectRatio": None,
                "alt": "main visual",
            },
        }
    ]


def test_collect_pending_image_slots_uses_allowed_provider_aspect_ratio():
    presentation = Presentation.model_validate(
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
                            "src": "",
                            "alt": "main visual",
                        }
                    ],
                }
            ],
        }
    )

    assert collect_pending_image_slots(presentation)[0]["slot"]["aspectRatio"] == "4:3"


def test_collect_pending_image_slots_handles_pending_sentinel():
    slots = collect_pending_image_slots(make_presentation(PENDING_IMAGE_SRC))

    assert len(slots) == 1
    assert slots[0]["elementId"] == "img-1"


def test_build_image_plan_map_returns_backend_only_plan_by_element_key():
    plan_map = build_image_plan_map(
        [
            {
                "slideId": "slide-1",
                "elementId": "img-1",
                "generateBy": "ai",
                "imagePrompt": "A clean supply chain automation visual",
            }
        ]
    )

    assert plan_map == {
        ("slide-1", "img-1"): {
            "generateBy": "ai",
            "imagePrompt": "A clean supply chain automation visual",
        }
    }


def test_build_image_plan_map_rejects_invalid_generate_by():
    with pytest.raises(ValueError, match="Invalid generateBy"):
        build_image_plan_map(
            [
                {
                    "slideId": "slide-1",
                    "elementId": "img-1",
                    "generateBy": "web",
                    "imagePrompt": "bad",
                }
            ]
        )
