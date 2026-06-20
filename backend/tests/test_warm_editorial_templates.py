import json
from pathlib import Path
from app.mocks import warm_editorial_mock_presentation
from app.schemas import Presentation

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "app" / "templates"
MOCKS_DIR = Path(__file__).resolve().parent.parent / "app" / "mocks"

EXPECTED_CORE_TEMPLATE_IDS = [
    "warm-cover-01",
    "warm-section-01",
    "warm-split-statement-01",
    "warm-four-cards-01",
    "warm-duo-compare-01",
    "warm-timeline-01",
    "warm-stacked-kpi-ledger-01",
]


def test_warm_editorial_templates_define_core_layouts_without_layout_type_metadata():
    claude_path = TEMPLATES_DIR / "claude.json"
    assert claude_path.exists()
    with open(claude_path, "r", encoding="utf-8") as f:
        claude_templates = json.load(f)

    template_ids = [template["id"] for template in claude_templates]

    assert all("layoutType" not in template for template in claude_templates)
    assert all(template_id in template_ids for template_id in EXPECTED_CORE_TEMPLATE_IDS)


def test_mock_presentation_preserves_existing_slides_before_core_layout_showcase():
    slide_ids = [slide["id"] for slide in warm_editorial_mock_presentation["slides"]]

    assert slide_ids[:4] == [
        "claude-text-01",
        "claude-data-01",
        "claude-grid-01",
        "claude-thanks-01",
    ]
    assert slide_ids[4:11] == EXPECTED_CORE_TEMPLATE_IDS


def test_elegant_bachelor_slides_are_migrated_into_warm_editorial():
    with open(TEMPLATES_DIR / "claude.json", "r", encoding="utf-8") as f:
        claude_templates = json.load(f)

    template_ids = {template["id"] for template in claude_templates}
    mock_ids = {slide["id"] for slide in warm_editorial_mock_presentation["slides"]}

    assert not (MOCKS_DIR / "elegant_bachelor_thesis.json").exists()
    assert "claude-thesis-slide-2" in template_ids
    assert "claude-thesis-slide-22" in template_ids
    assert "claude-thesis-slide-2" in mock_ids
    assert "claude-thesis-slide-22" in mock_ids
    Presentation.model_validate(warm_editorial_mock_presentation)


def test_warm_editorial_template_matches_mock_and_defines_text_slots():
    with open(TEMPLATES_DIR / "claude.json", "r", encoding="utf-8") as f:
        claude_templates = json.load(f)

    assert len(claude_templates) == len(warm_editorial_mock_presentation["slides"])
    roles = [template.get("role") for template in claude_templates]
    assert len(set(roles)) == len(roles)
    assert next(template for template in claude_templates if template["id"] == "claude-thanks-01")["role"] == "thanks"

    for template in claude_templates:
        assert template.get("role")
        assert template.get("description")
        assert "?" not in template.get("description")
        assert "content slide template" not in template.get("description").lower()
        for element in template["elements"]:
            if element["type"] != "text":
                continue
            if template.get("role") == "thanks":
                assert element.get("content")
                continue
            assert element.get("content") == ""
            assert element.get("description")
            assert element.get("recommendlength")
            assert "?" not in element.get("description")
            assert "specific text for this element" not in element.get("description").lower()
