import pytest
from fastapi import HTTPException

from app.template_engine.slots import clean_presentation, filter_templates_for_ai, hydrate_presentation

from app.services.presentation_generation import handlePptRes
from app.schemas import OutlineSection, PptRequest, TextElement


def test_filter_templates_for_ai_only_exposes_documented_empty_fields():
    templates = [
        {
            "id": "cover",
            "role": "cover",
            "description": "Cover slide",
            "background": "#000000",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                },
                {
                    "id": "hero",
                    "type": "image",
                    "x": 10,
                    "y": 20,
                    "width": 40,
                    "height": 30,
                    "src": "",
                    "description": "Hero image",
                    "recommendLength": "80",
                },
                {
                    "id": "directory-number",
                    "type": "text",
                    "x": 0,
                    "y": 0,
                    "width": 4,
                    "height": 4,
                    "content": "01",
                    "description": "",
                    "recommendlength": "",
                },
                {
                    "id": "bar-height",
                    "type": "block",
                    "x": 0,
                    "y": 20,
                    "width": 8,
                    "height": 0,
                    "description": "Chart bar height, integer 0-32.",
                    "recommendlength": "1-5",
                },
                {
                    "id": "rule",
                    "type": "block",
                    "x": 0,
                    "y": 0,
                    "width": 100,
                    "height": 1,
                },
            ],
        }
    ]

    filtered = filter_templates_for_ai(templates)

    assert filtered == [
        {
            "role": "cover",
            "description": "Cover slide",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "description": "Main title",
                    "recommendlength": "5-15",
                    "content": "",
                },
                {
                    "id": "bar-height",
                    "type": "block",
                    "description": "Chart bar height, integer 0-32.",
                    "recommendlength": "1-5",
                    "height": 0,
                },
            ],
        }
    ]


def test_filter_templates_for_ai_excludes_fixed_thanks_template():
    templates = [
        {
            "id": "cover",
            "role": "cover",
            "description": "Cover slide",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                }
            ],
        },
        {
            "id": "thanks",
            "role": "thanks",
            "description": "Fixed ending slide",
            "background": "#000000",
            "elements": [
                {
                    "id": "thanks-title",
                    "type": "text",
                    "content": "THANKS",
                }
            ],
        },
    ]

    filtered = filter_templates_for_ai(templates)

    assert [template["role"] for template in filtered] == ["cover"]


def test_filter_templates_does_not_expose_image_src_to_content_llm():
    templates = [
        {
            "id": "tpl-1",
            "role": "content",
            "elements": [
                {
                    "id": "img-1",
                    "type": "image",
                    "x": 50,
                    "y": 20,
                    "width": 40,
                    "height": 30,
                    "src": "",
                    "alt": "main visual",
                    "description": "Main visual",
                    "recommendlength": "image",
                },
                {
                    "id": "txt-1",
                    "type": "text",
                    "x": 10,
                    "y": 10,
                    "width": 40,
                    "height": 10,
                    "content": "",
                    "fontSize": 24,
                    "description": "Title",
                    "recommendlength": "5-15",
                },
            ],
        }
    ]

    filtered = filter_templates_for_ai(templates)

    assert filtered[0]["elements"] == [
        {
            "id": "txt-1",
            "type": "text",
            "description": "Title",
            "recommendlength": "5-15",
            "content": "",
        }
    ]


def test_filter_templates_for_ai_exposes_table_rows():
    templates = [
        {
            "id": "table-slide",
            "role": "kpi-dashboard",
            "description": "KPI table slide",
            "elements": [
                {
                    "id": "table-1",
                    "type": "table",
                    "x": 10,
                    "y": 20,
                    "width": 80,
                    "height": 40,
                    "rows": [],
                    "fontSize": 10,
                    "description": "A 7-row, 4-column KPI table.",
                    "recommendlength": "7 rows x 4 columns, each cell 2-12 chars",
                }
            ],
        }
    ]

    filtered = filter_templates_for_ai(templates)

    assert filtered[0]["elements"] == [
        {
            "id": "table-1",
            "type": "table",
            "description": "A 7-row, 4-column KPI table.",
            "recommendlength": "7 rows x 4 columns, each cell 2-12 chars",
            "rows": [],
        }
    ]


def test_hydrate_presentation_fills_content_without_changing_template_shape():
    templates = [
        {
            "id": "cover",
            "role": "cover",
            "background": "#000000",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                },
                {
                    "id": "hero",
                    "type": "image",
                    "x": 10,
                    "y": 20,
                    "width": 40,
                    "height": 30,
                    "src": "",
                    "description": "Hero image",
                    "recommendlength": "80",
                },
                {
                    "id": "bar-height",
                    "type": "block",
                    "x": 5,
                    "y": 60,
                    "width": 10,
                    "height": 0,
                    "shapeType": "rect",
                    "description": "Chart bar height, integer 0-32.",
                    "recommendlength": "1-5",
                },
            ],
        }
    ]
    plan = {
        "slides": [
            {
                "templateId": "cover",
                "contents": [
                    {"id": "title", "content": "New Title"},
                    {"id": "bar-height", "height": 24},
                ],
            }
        ]
    }

    presentation = hydrate_presentation(
        plan,
        templates,
        title="Demo",
        layout="16x9",
        theme="minimalist",
    )

    slide = presentation["slides"][0]
    assert slide["id"] != "cover"
    assert slide["background"] == "#000000"
    assert slide["elements"][0]["content"] == "New Title"
    assert slide["elements"][0]["x"] == 1
    assert slide["elements"][0]["fontSize"] == 20
    assert slide["elements"][1]["src"] == ""
    assert slide["elements"][2]["y"] == 36
    assert slide["elements"][2]["height"] == 24


def test_hydrate_presentation_rejects_missing_required_text_content():
    templates = [
        {
            "id": "three-columns",
            "role": "three-columns",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                },
                {
                    "id": "body",
                    "type": "text",
                    "x": 1,
                    "y": 20,
                    "width": 30,
                    "height": 20,
                    "fontSize": 10,
                    "content": "",
                    "description": "Required body text.",
                    "recommendlength": "50-80",
                },
            ],
        }
    ]
    plan = {
        "slides": [
            {
                "templateId": "three-columns",
                "contents": [{"id": "title", "content": "Only Title"}],
            }
        ]
    }

    with pytest.raises(ValueError, match="Missing required content"):
        hydrate_presentation(
            plan,
            templates,
            title="Demo",
            layout="16x9",
            theme="minimalist",
        )


def test_handle_ppt_res_reports_missing_required_content_detail():
    templates = [
        {
            "id": "three-columns",
            "role": "three-columns",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                },
                {
                    "id": "body",
                    "type": "text",
                    "x": 1,
                    "y": 20,
                    "width": 30,
                    "height": 20,
                    "fontSize": 10,
                    "content": "",
                    "description": "Required body text.",
                    "recommendlength": "50-80",
                },
            ],
        }
    ]
    ai_res = {
        "choices": [
            {
                "message": {
                    "content": '{"slides":[{"templateId":"three-columns","contents":[{"id":"title","content":"Only Title"}]}]}'
                }
            }
        ]
    }
    request = PptRequest(
        prompt="Demo",
        title="Demo",
        layout="16x9",
        theme="minimalist",
        sections=[OutlineSection(id="s1", title="Intro", content="Intro content")],
        pageCount=2,
    )

    with pytest.raises(HTTPException) as exc_info:
        handlePptRes(ai_res, request, templates)

    assert exc_info.value.status_code == 422
    assert "Missing required content: body.content" in exc_info.value.detail


def test_hydrate_presentation_allows_documented_optional_blank_content():
    templates = [
        {
            "id": "cover",
            "role": "cover",
            "elements": [
                {
                    "id": "cover-footer-date",
                    "type": "text",
                    "x": 1,
                    "y": 90,
                    "width": 20,
                    "height": 5,
                    "fontSize": 10,
                    "content": "",
                    "description": "制作/汇报日期，如果用户没有提供，请留空。",
                    "recommendlength": "2-10",
                },
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                },
            ],
        }
    ]
    plan = {
        "slides": [
            {
                "templateId": "cover",
                "contents": [{"id": "title", "content": "Filled Title"}],
            }
        ]
    }

    presentation = hydrate_presentation(
        plan,
        templates,
        title="Demo",
        layout="16x9",
        theme="minimalist",
    )

    assert presentation["slides"][0]["elements"][0]["content"] == ""


def test_hydrate_presentation_fills_table_rows_without_markdown():
    templates = [
        {
            "id": "table-slide",
            "role": "kpi-dashboard",
            "background": "#ffffff",
            "elements": [
                {
                    "id": "table-1",
                    "type": "table",
                    "x": 10,
                    "y": 20,
                    "width": 80,
                    "height": 40,
                    "rows": [],
                    "fontSize": 10,
                    "description": "A KPI table.",
                    "recommendlength": "3 rows x 2 columns",
                }
            ],
        }
    ]
    plan = {
        "slides": [
            {
                "templateId": "table-slide",
                "elements": [
                    {
                        "id": "table-1",
                        "rows": [
                            ["Metric", "Value"],
                            ["Revenue", "$4M"],
                            ["Profit", "$3.9M"],
                        ],
                    }
                ],
            }
        ]
    }

    presentation = hydrate_presentation(
        plan,
        templates,
        title="Table Deck",
        layout="16x9",
        theme="minimalist",
    )
    table = presentation["slides"][0]["elements"][0]

    assert table["type"] == "table"
    assert table["rows"] == [
        ["Metric", "Value"],
        ["Revenue", "$4M"],
        ["Profit", "$3.9M"],
    ]
    assert "markdown" not in table


def test_hydrate_presentation_appends_fixed_thanks_template():
    templates = [
        {
            "id": "cover",
            "role": "cover",
            "background": "#ffffff",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                }
            ],
        },
        {
            "id": "thanks",
            "role": "thanks",
            "description": "Fixed ending slide",
            "background": "#000000",
            "elements": [
                {
                    "id": "thanks-title",
                    "type": "text",
                    "x": 0,
                    "y": 40,
                    "width": 100,
                    "height": 20,
                    "content": "THANKS",
                }
            ],
        },
    ]
    plan = {
        "slides": [
            {
                "role": "cover",
                "elements": [{"id": "title", "content": "Demo"}],
            }
        ]
    }

    presentation = hydrate_presentation(
        plan,
        templates,
        title="Demo",
        layout="16x9",
        theme="minimalist",
    )

    assert len(presentation["slides"]) == 2
    assert presentation["slides"][-1]["background"] == "#000000"
    assert presentation["slides"][-1]["elements"][0]["content"] == "THANKS"
    assert "role" not in presentation["slides"][-1]


def test_hydrate_presentation_ignores_echoed_slot_metadata():
    templates = [
        {
            "id": "cover",
            "role": "cover",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                }
            ],
        }
    ]
    plan = {
        "slides": [
            {
                "templateId": "cover",
                "contents": [
                    {
                        "id": "title",
                        "type": "text",
                        "description": "Main title",
                        "recommendlength": "5-15",
                        "content": "New Title",
                    }
                ],
            }
        ]
    }

    presentation = hydrate_presentation(
        plan,
        templates,
        title="Demo",
        layout="16x9",
        theme="minimalist",
    )

    assert presentation["slides"][0]["elements"][0]["content"] == "New Title"


def test_hydrate_presentation_ignores_echoed_layout_fields():
    templates = [
        {
            "id": "cover",
            "role": "cover",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                }
            ],
        }
    ]
    plan = {
        "slides": [
            {
                "id": "cover",
                "elements": [
                    {
                        "id": "title",
                        "type": "text",
                        "x": 99,
                        "y": 99,
                        "width": 99,
                        "height": 99,
                        "fontSize": 99,
                        "content": "New Title",
                    }
                ],
            }
        ]
    }

    presentation = hydrate_presentation(
        plan,
        templates,
        title="Demo",
        layout="16x9",
        theme="minimalist",
    )

    element = presentation["slides"][0]["elements"][0]
    assert element["content"] == "New Title"
    assert element["x"] == 1
    assert element["height"] == 10
    assert element["fontSize"] == 20


def test_hydrate_presentation_accepts_filled_simplified_template():
    templates = [
        {
            "id": "cover",
            "role": "cover",
            "background": "#000000",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                }
            ],
        }
    ]
    plan = {
        "slides": [
            {
                "id": "cover",
                "role": "cover",
                "description": "Cover slide",
                "elements": [
                    {
                        "id": "title",
                        "type": "text",
                        "description": "Main title",
                        "recommendlength": "5-15",
                        "content": "Filled Template Title",
                    }
                ],
            }
        ]
    }

    presentation = hydrate_presentation(
        plan,
        templates,
        title="Demo",
        layout="16x9",
        theme="minimalist",
    )

    assert presentation["slides"][0]["elements"][0]["content"] == "Filled Template Title"


def test_hydrate_presentation_falls_back_to_unique_role_when_slide_id_is_generated():
    templates = [
        {
            "id": "minimalist-cover",
            "role": "cover",
            "background": "#000000",
            "elements": [
                {
                    "id": "cover-title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                }
            ],
        }
    ]
    plan = {
        "slides": [
            {
                "id": "cover-page",
                "role": "cover",
                "elements": [
                    {
                        "id": "cover-title",
                        "type": "text",
                        "content": "Generated Role Title",
                    }
                ],
            }
        ]
    }

    presentation = hydrate_presentation(
        plan,
        templates,
        title="Demo",
        layout="16x9",
        theme="minimalist",
    )

    slide = presentation["slides"][0]
    assert slide["background"] == "#000000"
    assert slide["elements"][0]["content"] == "Generated Role Title"


def test_hydrate_presentation_accepts_role_only_slide_selection():
    templates = [
        {
            "id": "minimalist-cover",
            "role": "cover",
            "background": "#000000",
            "elements": [
                {
                    "id": "cover-title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                }
            ],
        }
    ]
    plan = {
        "slides": [
            {
                "role": "cover",
                "description": "Cover slide",
                "elements": [
                    {
                        "id": "cover-title",
                        "type": "text",
                        "content": "Role Only Title",
                    }
                ],
            }
        ]
    }

    presentation = hydrate_presentation(
        plan,
        templates,
        title="Demo",
        layout="16x9",
        theme="minimalist",
    )

    slide = presentation["slides"][0]
    assert slide["background"] == "#000000"
    assert slide["elements"][0]["content"] == "Role Only Title"


def test_clean_presentation_removes_template_only_metadata():
    presentation = {
        "id": "deck",
        "title": "Demo",
        "layout": "16x9",
        "theme": "minimalist",
        "slides": [
            {
                "id": "slide",
                "role": "cover",
                "description": "Template metadata",
                "background": "#fff",
                "elements": [
                    {
                        "id": "title",
                        "type": "text",
                        "x": 0,
                        "y": 0,
                        "width": 10,
                        "height": 10,
                        "fontSize": 20,
                        "content": "Demo",
                        "description": "AI contract",
                        "recommendlength": "5-15",
                    }
                ],
            }
        ],
    }

    cleaned = clean_presentation(presentation)

    assert "role" not in cleaned["slides"][0]
    assert "description" not in cleaned["slides"][0]
    assert "description" not in cleaned["slides"][0]["elements"][0]
    assert "recommendlength" not in cleaned["slides"][0]["elements"][0]


def test_handle_ppt_res_hydrates_ai_slot_content_into_presentation():
    ai_res = {
        "choices": [
            {
                "message": {
                    "content": '{"slides":[{"templateId":"cover","contents":[{"id":"title","content":"AI Slot Deck"}]}]}'
                }
            }
        ]
    }
    request = PptRequest(
        prompt="Make a deck",
        title="AI Slot Deck",
        layout="16x9",
        theme="minimalist",
        sections=[OutlineSection(id="s1", title="Intro", content="Intro content")],
        pageCount=1,
    )
    templates = [
        {
            "id": "cover",
            "role": "cover",
            "description": "Cover slide",
            "background": "#000000",
            "elements": [
                {
                    "id": "title",
                    "type": "text",
                    "x": 1,
                    "y": 2,
                    "width": 30,
                    "height": 10,
                    "fontSize": 20,
                    "content": "",
                    "description": "Main title",
                    "recommendlength": "5-15",
                }
            ],
        }
    ]

    presentation = handlePptRes(ai_res, request, templates)

    assert presentation.title == "AI Slot Deck"
    element = presentation.slides[0].elements[0]
    assert isinstance(element, TextElement)
    assert element.content == "AI Slot Deck"
