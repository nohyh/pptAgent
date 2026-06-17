import json
from pathlib import Path
from app.mocks import mock_presentation, minimalist_pitch_deck_mock_presentation, elegant_bachelor_thesis_mock_presentation
from app.schemas import Presentation

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "app" / "templates"


def test_minimalist_pitch_deck_template_and_mock_are_registered():
    minimalist_path = TEMPLATES_DIR / "minimalist.json"
    assert minimalist_path.exists()
    with open(minimalist_path, "r", encoding="utf-8") as f:
        minimalist_templates = json.load(f)

    assert len(minimalist_templates) == 14

    assert mock_presentation is elegant_bachelor_thesis_mock_presentation
    assert elegant_bachelor_thesis_mock_presentation["title"] == "Elegant Bachelor Thesis"
    Presentation.model_validate(mock_presentation)

    assert minimalist_pitch_deck_mock_presentation["title"] == "Minimalist Pitch Deck"
    assert minimalist_pitch_deck_mock_presentation["theme"] == "Minimalist Pitch Deck"
    assert len(minimalist_pitch_deck_mock_presentation["slides"]) == 14
    assert minimalist_pitch_deck_mock_presentation["slides"][0]["id"] == "minimalist-cover"
    assert any(
        element["type"] == "text" and element["content"] == "Minimalist\nPitch Deck"
        for element in minimalist_pitch_deck_mock_presentation["slides"][0]["elements"]
    )
    assert any(
        element["type"] == "text" and element["content"] == "Table of contents"
        for element in minimalist_pitch_deck_mock_presentation["slides"][2]["elements"]
    )
    assert any(
        element["type"] == "text" and element["content"] == "4,498,300,000"
        for element in minimalist_pitch_deck_mock_presentation["slides"][9]["elements"]
    )
    kpi_template = next(template for template in minimalist_templates if template["id"] == "minimalist-kpi-dashboard")
    kpi_template_ids = {element["id"] for element in kpi_template["elements"]}
    assert "kpi-table" in kpi_template_ids
    assert all(not element_id.startswith("kpi-row-") for element_id in kpi_template_ids)
    assert all(not element_id.startswith("kpi-header-") for element_id in kpi_template_ids)
    assert all(not element_id.startswith("kpi-table-line-") for element_id in kpi_template_ids)

    kpi_mock = next(slide for slide in minimalist_pitch_deck_mock_presentation["slides"] if slide["id"] == "minimalist-kpi-dashboard")
    kpi_table = next(element for element in kpi_mock["elements"] if element["id"] == "kpi-table")
    assert kpi_table["type"] == "table"
    assert "headerRows" not in kpi_table
    assert kpi_table["rows"][0] == ["Product", "Units", "Revenue", "Returns"]
    assert "markdown" not in kpi_table
    assert minimalist_templates[-1]["role"] == "thanks"
    assert minimalist_pitch_deck_mock_presentation["slides"][-1]["id"] == "minimalist-thanks"
    assert minimalist_pitch_deck_mock_presentation["slides"][-1]["background"] == "#000000"
    assert minimalist_pitch_deck_mock_presentation["slides"][-1]["elements"][0]["y"] == 43
    assert minimalist_pitch_deck_mock_presentation["slides"][-1]["elements"][0]["height"] == 14
    assert minimalist_pitch_deck_mock_presentation["slides"][-1]["elements"][0]["fontSize"] == 72
    assert minimalist_pitch_deck_mock_presentation["slides"][-1]["elements"][0]["content"] == "THANKS"
    assert not minimalist_pitch_deck_mock_presentation["slides"][0]["id"].startswith("minimalist-pitch-deck-slide")

    Presentation.model_validate(minimalist_pitch_deck_mock_presentation)
