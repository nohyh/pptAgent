from app.ai.prompts import pptPrompt


def test_ppt_prompt_does_not_ask_content_llm_to_fill_image_src():
    assert "content/src/height" not in pptPrompt
    assert '"src": string' not in pptPrompt
    assert "src填写图片URL" not in pptPrompt
    assert "content/height" in pptPrompt
