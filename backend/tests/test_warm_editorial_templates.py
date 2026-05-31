import json
from pathlib import Path
from app.mocks import warm_editorial_mock_presentation

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "app" / "templates"

EXPECTED_LAYOUT_TYPES = [
    "cover",
    "section",
    "split-statement",
    "four-cards",
    "duo-compare",
    "timeline",
    "stacked-kpi-ledger",
    "image-hero",
]


def test_warm_editorial_templates_define_core_layout_types():
    claude_path = TEMPLATES_DIR / "claude.json"
    assert claude_path.exists()
    with open(claude_path, "r", encoding="utf-8") as f:
        claude_templates = json.load(f)

    layout_types = {template.get("layoutType") for template in claude_templates}

    assert set(EXPECTED_LAYOUT_TYPES).issubset(layout_types)


def test_mock_presentation_preserves_existing_slides_before_core_layout_showcase():
    layout_types = [slide.get("layoutType") for slide in warm_editorial_mock_presentation["slides"]]

    assert layout_types[:4] == [None, None, None, None]
    assert layout_types[4:] == EXPECTED_LAYOUT_TYPES
