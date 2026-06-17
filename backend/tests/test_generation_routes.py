from fastapi.testclient import TestClient

from main import app


def test_mock_outline_route_returns_static_outline():
    client = TestClient(app)

    response = client.get("/mockOutline")

    assert response.status_code == 200
    outline = response.json()
    assert outline["title"] == "项目商业计划书"
    assert len(outline["sections"]) > 0


def test_mock_presentation_route_returns_elegant_bachelor_thesis_mock():
    client = TestClient(app)

    response = client.get("/mockPresentation")

    assert response.status_code == 200
    presentation = response.json()
    assert presentation["title"] == "Elegant Bachelor Thesis"
    assert presentation["theme"] == "Elegant Bachelor Thesis"
    assert presentation["slides"][0]["id"] == "elegant-slide-1"
    assert any(
        element["type"] == "text" and "Elegant Bachelor Thesis" in element["content"]
        for element in presentation["slides"][0]["elements"]
    )
