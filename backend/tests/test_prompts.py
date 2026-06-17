from app.ai.prompts import pptPrompt


def test_ppt_prompt_does_not_ask_content_llm_to_fill_image_src():
    assert "content/src/height" not in pptPrompt
    assert '"src": string' not in pptPrompt
    assert "src填写图片URL" not in pptPrompt
    assert "content/height" in pptPrompt


def test_ppt_prompt_tells_llm_to_fill_tables_as_structured_rows():
    assert "rows必须是二维字符串数组" in pptPrompt
    assert "每一行必须是数组" in pptPrompt
    assert "不要把表格写成Markdown、CSV、TSV或单个字符串" in pptPrompt
    assert "第一行通常是表头" not in pptPrompt
