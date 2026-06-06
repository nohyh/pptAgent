import anyio
import pytest
from fastapi import HTTPException

from app import ai
from app.schemas import OutlineSection, PptRequest


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


class FailingAsyncClient:
    async def __aenter__(self):
        return self

    async def __aexit__(self, _exc_type, _exc, _tb):
        return False

    async def post(self, *_args, **_kwargs):
        raise ai.httpx.ConnectError("connection failed")


def test_call_llm_does_not_retry_transient_gateway_errors(monkeypatch):
    client = FakeAsyncClient([FakeResponse(502, {"error": {"message": "Bad Gateway"}})])

    monkeypatch.setattr(ai.httpx, "AsyncClient", lambda: client)
    monkeypatch.setattr(ai, "BASE_URL", "https://example.test")
    monkeypatch.setattr(ai, "API_KEY", "test-key")
    monkeypatch.setattr(ai, "MODEL_2", "test-model")

    with pytest.raises(HTTPException) as exc_info:
        anyio.run(ai.call_llm, "system", "user")

    assert client.calls == 1
    assert exc_info.value.status_code == 502


def test_call_llm_falls_back_to_primary_model(monkeypatch):
    client = FakeAsyncClient([FakeResponse(200, {"choices": [{"message": {"content": "{}"}}]})])

    monkeypatch.setattr(ai.httpx, "AsyncClient", lambda: client)
    monkeypatch.setattr(ai, "BASE_URL", "https://example.test")
    monkeypatch.setattr(ai, "API_KEY", "test-key")
    monkeypatch.setattr(ai, "MODEL", "primary-model")
    monkeypatch.setattr(ai, "MODEL_2", None)
    monkeypatch.setattr(ai, "MODEL_3", None)
    monkeypatch.setattr(ai, "MODEL_4", None)

    anyio.run(ai.call_llm, "system", "user")

    assert client.posts[0]["json"]["model"] == "primary-model"
    assert client.posts[0]["timeout"] == 180


def test_call_llm_wraps_transport_errors(monkeypatch):
    monkeypatch.setattr(ai.httpx, "AsyncClient", lambda: FailingAsyncClient())
    monkeypatch.setattr(ai, "BASE_URL", "https://example.test")
    monkeypatch.setattr(ai, "API_KEY", "test-key")
    monkeypatch.setattr(ai, "MODEL_2", "test-model")

    with pytest.raises(HTTPException) as exc_info:
        anyio.run(ai.call_llm, "system", "user")

    assert exc_info.value.status_code == 502
    assert "LLM API 请求失败" in exc_info.value.detail


def test_generate_ppt_rejects_templates_without_slots(monkeypatch):
    async def fail_call_llm(_system_prompt, _user_prompt):
        raise AssertionError("call_llm should not be called without template slots")

    monkeypatch.setattr(
        ai,
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
    monkeypatch.setattr(ai, "call_llm", fail_call_llm)
    request = PptRequest(
        prompt="Make a deck",
        title="No Slots",
        layout="16x9",
        theme="warm-editorial",
        sections=[OutlineSection(id="s1", title="Intro", content="Intro content")],
        pageCount=1,
    )

    with pytest.raises(HTTPException) as exc_info:
        anyio.run(ai.generatePpt, request)

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
        ai,
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
    monkeypatch.setattr(ai, "call_llm", fake_call_llm)
    request = PptRequest(
        prompt="Make a deck",
        title="Compact Deck",
        layout="16x9",
        theme="minimalist",
        sections=[OutlineSection(id="s1", title="Intro", content="Intro content")],
        pageCount=12,
    )

    presentation = anyio.run(ai.generatePpt, request)
    user_prompt = ai.json.loads(captured["user_prompt"])

    assert set(user_prompt) == {"prompt", "title", "sections", "pageCount", "templates"}
    assert user_prompt["sections"] == [
        {"id": "s1", "title": "Intro", "content": "Intro content"}
    ]
    assert user_prompt["pageCount"] == 12
    assert "id" not in user_prompt["templates"][0]
    assert user_prompt["templates"][0]["role"] == "cover"
    assert user_prompt["templates"][0]["elements"][0]["id"] == "title"
    assert presentation.title == "Compact Deck"
