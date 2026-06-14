import anyio
import pytest
from fastapi import HTTPException

from app import ai
from app.ai import client as ai_client
from app.images import providers as image_providers
from app.images.prompts import imagePlanningPrompt
from app.schemas import OutlineSection, PptRequest
from app.services import presentation_generation
from app.template_engine import loader as template_loader


class FakeResponse:
    def __init__(self, status_code: int, payload: dict):
        self.status_code = status_code
        self._payload = payload
        self.text = str(payload)

    def json(self):
        return self._payload


class FakeAsyncClient:
    def __init__(self, responses: list[FakeResponse]):
        self.responses = responses
        self.calls = 0
        self.posts = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, _exc_type, _exc, _tb):
        return False

    async def post(self, *_args, **_kwargs):
        self.posts.append(_kwargs)
        response = self.responses[self.calls]
        self.calls += 1
        return response

    async def get(self, *_args, **_kwargs):
        self.posts.append(_kwargs)
        response = self.responses[self.calls]
        self.calls += 1
        return response


class FailingAsyncClient:
    async def __aenter__(self):
        return self

    async def __aexit__(self, _exc_type, _exc, _tb):
        return False

    async def post(self, *_args, **_kwargs):
        raise ai_client.httpx.ConnectError("connection failed")


def test_call_llm_does_not_retry_transient_gateway_errors(monkeypatch):
    client = FakeAsyncClient([FakeResponse(502, {"error": {"message": "Bad Gateway"}})])

    monkeypatch.setattr(ai_client.httpx, "AsyncClient", lambda: client)
    monkeypatch.setattr(ai_client, "BASE_URL", "https://example.test")
    monkeypatch.setattr(ai_client, "API_KEY", "test-key")
    monkeypatch.setattr(ai_client, "MODEL_FLASH", "flash-model")

    with pytest.raises(HTTPException) as exc_info:
        anyio.run(ai_client.call_llm, "system", "user")

    assert client.calls == 1
    assert exc_info.value.status_code == 502


def test_call_llm_uses_flash_model_for_text_generation(monkeypatch):
    client = FakeAsyncClient([FakeResponse(200, {"choices": [{"message": {"content": "{}"}}]})])

    monkeypatch.setattr(ai_client.httpx, "AsyncClient", lambda: client)
    monkeypatch.setattr(ai_client, "BASE_URL", "https://example.test")
    monkeypatch.setattr(ai_client, "API_KEY", "test-key")
    monkeypatch.setattr(ai_client, "MODEL_FLASH", "flash-model")

    anyio.run(ai_client.call_llm, "system", "user")

    assert client.posts[0]["json"]["model"] == "flash-model"
    assert client.posts[0]["timeout"] == 180


def test_call_llm_wraps_transport_errors(monkeypatch):
    monkeypatch.setattr(ai_client.httpx, "AsyncClient", lambda: FailingAsyncClient())
    monkeypatch.setattr(ai_client, "BASE_URL", "https://example.test")
    monkeypatch.setattr(ai_client, "API_KEY", "test-key")
    monkeypatch.setattr(ai_client, "MODEL_FLASH", "flash-model")

    with pytest.raises(HTTPException) as exc_info:
        anyio.run(ai_client.call_llm, "system", "user")

    assert exc_info.value.status_code == 502
    assert "LLM API 请求失败" in exc_info.value.detail


def test_generate_ppt_rejects_templates_without_slots(monkeypatch):
    async def fail_call_llm(_system_prompt, _user_prompt):
        raise AssertionError("call_llm should not be called without template slots")

    monkeypatch.setattr(
        template_loader,
        "load_template",
        lambda _theme: [
            {
                "id": "empty-cover",
                "role": "cover",
                "description": "Cover without fillable slots",
                "elements": [
                    {
                        "id": "title",
                        "type": "text",
                        "x": 0,
                        "y": 0,
                        "width": 10,
                        "height": 10,
                        "fontSize": 20,
                        "content": "",
                    }
                ],
            }
        ],
    )
    monkeypatch.setattr(presentation_generation, "call_llm", fail_call_llm)
    request = PptRequest(
        prompt="Make a deck",
        title="No Slots",
        layout="16x9",
        theme="warm-editorial",
        sections=[OutlineSection(id="s1", title="Intro", content="Intro content")],
        pageCount=1,
    )

    with pytest.raises(HTTPException) as exc_info:
        anyio.run(presentation_generation.generatePpt, request)

    assert exc_info.value.status_code == 422
    assert "没有可填充 slots" in exc_info.value.detail


def test_generate_ppt_sends_only_content_inputs_and_templates_to_llm(monkeypatch):
    captured = {}

    async def fake_call_llm(_system_prompt, user_prompt):
        captured["user_prompt"] = user_prompt
        return {
            "choices": [
                {
                    "message": {
                        "content": '{"slides":[{"id":"cover","elements":[{"id":"title","content":"Compact Deck"}]}]}'
                    }
                }
            ]
        }

    monkeypatch.setattr(
        template_loader,
        "load_template",
        lambda _theme: [
            {
                "id": "cover",
                "role": "cover",
                "description": "Cover slide",
                "elements": [
                    {
                        "id": "title",
                        "type": "text",
                        "x": 0,
                        "y": 0,
                        "width": 10,
                        "height": 10,
                        "fontSize": 20,
                        "content": "",
                        "description": "Main title",
                        "recommendlength": "5-15",
                    }
                ],
            }
        ],
    )
    monkeypatch.setattr(presentation_generation, "call_llm", fake_call_llm)
    request = PptRequest(
        prompt="Make a deck",
        title="Compact Deck",
        layout="16x9",
        theme="minimalist",
        sections=[OutlineSection(id="s1", title="Intro", content="Intro content")],
        pageCount=12,
    )

    presentation = anyio.run(presentation_generation.generatePpt, request)
    user_prompt = ai.json.loads(captured["user_prompt"])

    assert set(user_prompt) == {"prompt", "title", "sections", "pageCount", "templates"}
    assert user_prompt["sections"] == [
        {"id": "s1", "title": "Intro", "content": "Intro content"}
    ]
    assert user_prompt["pageCount"] == 11
    assert "id" not in user_prompt["templates"][0]
    assert user_prompt["templates"][0]["role"] == "cover"
    assert user_prompt["templates"][0]["elements"][0]["id"] == "title"
    assert presentation.title == "Compact Deck"


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_generate_ppt_runs_image_planning_and_fulfillment_without_schema_metadata(monkeypatch):
    template = [
        {
            "id": "tpl-1",
            "role": "content",
            "elements": [
                {
                    "id": "txt-1",
                    "type": "text",
                    "x": 10,
                    "y": 10,
                    "width": 40,
                    "height": 10,
                    "content": "",
                    "fontSize": 24,
                    "description": "title",
                    "recommendlength": "20",
                },
                {
                    "id": "img-1",
                    "type": "image",
                    "x": 50,
                    "y": 20,
                    "width": 40,
                    "height": 30,
                    "src": "",
                    "alt": "main visual",
                },
            ],
        }
    ]

    monkeypatch.setattr(template_loader, "load_template", lambda _theme: template)

    async def fake_call_llm(system_prompt, user_prompt):
        if system_prompt == imagePlanningPrompt:
            planned = ai.json.loads(user_prompt)
            return {
                "choices": [
                    {
                        "message": {
                            "content": ai.json.dumps(
                                {
                                    "images": [
                                        {
                                            "slideId": planned["images"][0]["slideId"],
                                            "elementId": planned["images"][0]["elementId"],
                                            "generateBy": "ai",
                                            "imagePrompt": "clean automation visual",
                                        }
                                    ]
                                }
                            )
                        }
                    }
                ]
            }
        return {
            "choices": [
                {
                    "message": {
                        "content": '{"slides":[{"templateId":"tpl-1","elements":[{"id":"txt-1","content":"Automation"}]}]}'
                    }
                }
            ]
        }

    async def fake_generate_ai_image(prompt, width, height):
        assert prompt == "clean automation visual"
        assert width == 40
        assert height == 30
        return "data:image/png;base64,abc"

    monkeypatch.setattr(presentation_generation, "call_llm", fake_call_llm)
    monkeypatch.setattr(presentation_generation, "generate_ai_image_src", fake_generate_ai_image)
    monkeypatch.setattr(presentation_generation, "search_stock_image_src", lambda prompt, width, height: None)

    request = PptRequest(
        prompt="make a deck",
        title="Deck",
        layout="16x9",
        theme="minimalist",
        sections=[OutlineSection(id="sec-1", title="One", content="Automation")],
        pageCount=2,
    )

    result = await presentation_generation.generatePpt(request)
    dumped = result.model_dump()
    image = dumped["slides"][0]["elements"][1]

    assert image["src"] == "data:image/png;base64,abc"
    assert "generateBy" not in image
    assert "imagePrompt" not in image


@pytest.mark.anyio
async def test_generate_image_plan_accepts_top_level_list_response(monkeypatch, capsys):
    presentation = ai.Presentation.model_validate(
        {
            "id": "deck-1",
            "title": "Deck",
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

    async def fake_call_llm(_system_prompt, _user_prompt):
        return {
            "choices": [
                {
                    "message": {
                        "content": ai.json.dumps(
                            [
                                {
                                    "slideId": "slide-1",
                                    "elementId": "img-1",
                                    "generateBy": "stock",
                                    "imagePrompt": "office workflow",
                                }
                            ]
                        )
                    }
                }
            ]
        }

    monkeypatch.setattr(presentation_generation, "call_llm", fake_call_llm)

    assert await presentation_generation.generate_image_plan(presentation) == [
        {
            "slideId": "slide-1",
            "elementId": "img-1",
            "generateBy": "stock",
            "imagePrompt": "office workflow",
        }
    ]
    output = capsys.readouterr().out
    assert "[IMAGE_PLAN]" in output
    assert "slideId=slide-1" in output
    assert "elementId=img-1" in output
    assert "generateBy=stock" in output
    assert "imagePrompt=office workflow" in output


@pytest.mark.anyio
async def test_generate_ai_image_src_uses_photo_model(monkeypatch):
    client = FakeAsyncClient([FakeResponse(200, {"data": [{"b64_json": "abc"}]})])

    monkeypatch.setattr(image_providers.httpx, "AsyncClient", lambda: client)
    monkeypatch.setattr(image_providers, "BASE_URL", "https://images.example.test")
    monkeypatch.setattr(image_providers, "API_KEY", "image-key")
    monkeypatch.setattr(image_providers, "MODEL_PHOTO", "photo-model")

    result = await image_providers.generate_ai_image_src("visual prompt", 40, 30)

    assert result == "data:image/png;base64,abc"
    assert client.posts[0]["json"]["model"] == "photo-model"
    assert client.posts[0]["json"]["aspect_ratio"] == "4:3"
    assert client.posts[0]["json"]["image_size"] == "1K"
    assert "size" not in client.posts[0]["json"]
    assert "response_format" not in client.posts[0]["json"]
    assert client.posts[0]["headers"]["Authorization"] == "Bearer image-key"


@pytest.mark.anyio
async def test_search_stock_image_src_uses_pexels_key(monkeypatch):
    client = FakeAsyncClient(
        [
            FakeResponse(
                200,
                {
                    "photos": [
                        {
                            "src": {
                                "original": "https://images.example.test/photo.png",
                                "large2x": "https://images.example.test/photo-large.png",
                            }
                        }
                    ]
                },
            )
        ]
    )

    monkeypatch.setattr(image_providers.httpx, "AsyncClient", lambda: client)
    monkeypatch.setattr(image_providers, "PEXELS_KEY", "pexels-key")

    result = await image_providers.search_stock_image_src("office workflow", 16, 9)

    assert result == "https://images.example.test/photo.png?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop&crop=entropy"
    assert client.posts[0]["headers"]["Authorization"] == "pexels-key"
    assert client.posts[0]["params"] == {
        "query": "office workflow",
        "per_page": 1,
        "orientation": "landscape",
    }


@pytest.mark.anyio
async def test_search_stock_image_src_uses_portrait_orientation_and_crop_size(monkeypatch):
    client = FakeAsyncClient(
        [
            FakeResponse(
                200,
                {
                    "photos": [
                        {
                            "src": {
                                "original": "https://images.example.test/photo.png",
                            }
                        }
                    ]
                },
            )
        ]
    )

    monkeypatch.setattr(image_providers.httpx, "AsyncClient", lambda: client)
    monkeypatch.setattr(image_providers, "PEXELS_KEY", "pexels-key")

    result = await image_providers.search_stock_image_src("portrait workflow", 9, 16)

    assert result == "https://images.example.test/photo.png?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop&crop=entropy"
    assert client.posts[0]["params"] == {
        "query": "portrait workflow",
        "per_page": 1,
        "orientation": "portrait",
    }
