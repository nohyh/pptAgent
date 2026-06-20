from fastapi.testclient import TestClient

from main import app


def test_mock_outline_route_returns_static_outline():
    client = TestClient(app)

    response = client.get("/mockOutline")

    assert response.status_code == 200
    outline = response.json()
    assert outline["title"] == "项目商业计划书"
    assert len(outline["sections"]) > 0


def test_mock_presentation_route_returns_minimalist_pitch_deck_mock():
    client = TestClient(app)

    response = client.get("/mockPresentation")

    assert response.status_code == 200
    presentation = response.json()
    assert presentation["title"] == "Minimalist Pitch Deck"
    assert presentation["theme"] == "Minimalist Pitch Deck"
    assert presentation["slides"][0]["id"] == "minimalist-cover"
    assert any(
        element["type"] == "text" and "Minimalist" in element["content"]
        for element in presentation["slides"][0]["elements"]
    )
