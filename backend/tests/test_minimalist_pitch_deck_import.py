import json
from pathlib import Path
from app.mocks import mock_presentation, minimalist_pitch_deck_mock_presentation
from app.schemas import Presentation

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "app" / "templates"


def test_minimalist_pitch_deck_template_and_mock_are_registered():
    minimalist_path = TEMPLATES_DIR / "minimalist.json"
    assert minimalist_path.exists()
    with open(minimalist_path, "r", encoding="utf-8") as f:
        minimalist_templates = json.load(f)

    assert len(minimalist_templates) == 14

    assert mock_presentation is minimalist_pitch_deck_mock_presentation
    assert mock_presentation["title"] == "Minimalist Pitch Deck"
    assert mock_presentation["theme"] == "Minimalist Pitch Deck"
    assert len(mock_presentation["slides"]) == 14
    assert mock_presentation["slides"][0]["id"] == "minimalist-cover"
    assert any(
        element["type"] == "text" and element["content"] == "Minimalist\nPitch Deck"
        for element in mock_presentation["slides"][0]["elements"]
    )
    assert any(
        element["type"] == "text" and element["content"] == "Table of contents"
        for element in mock_presentation["slides"][2]["elements"]
    )
    assert any(
        element["type"] == "text" and element["content"] == "4,498,300,000"
        for element in mock_presentation["slides"][9]["elements"]
    )
    assert not mock_presentation["slides"][0]["id"].startswith("minimalist-pitch-deck-slide")

    Presentation.model_validate(mock_presentation)
