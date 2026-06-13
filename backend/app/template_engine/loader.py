import json
from pathlib import Path


TEMPLATE_DIR = Path(__file__).resolve().parents[1] / "templates"


def load_template(theme):
    for name in (theme, "claude"):
        path = TEMPLATE_DIR / f"{name}.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    return None
