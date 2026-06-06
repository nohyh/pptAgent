from copy import deepcopy
import uuid

EDITABLE_PLACEHOLDER_KEYS = {"content", "src", "height"}
TEMPLATE_ONLY_KEYS = {"description", "recommendlength", "recommendLength", "role", "layoutType"}
AI_ECHO_KEYS = {"type", "description", "recommendlength", "recommendLength"}
FIXED_TAIL_ROLE = "thanks"


def filter_templates_for_ai(templates: list[dict]) -> list[dict]:
    filtered_templates = []
    for template in templates:
        if template.get("role") == FIXED_TAIL_ROLE:
            continue
        filtered_template = {
            "role": template.get("role", ""),
            "description": template.get("description", ""),
            "elements": [],
        }
        if "layoutType" in template:
            filtered_template["layoutType"] = template.get("layoutType")

        for element in template.get("elements", []):
            editable_fields = _editable_fields(element)
            if not editable_fields:
                continue
            filtered_element = {
                "id": element.get("id", ""),
                "type": element.get("type", ""),
                "description": element.get("description", ""),
                "recommendlength": _recommend_length(element),
            }
            filtered_element.update(editable_fields)
            filtered_template["elements"].append(filtered_element)

        filtered_templates.append(filtered_template)

    return filtered_templates


def hydrate_presentation(
    plan: dict,
    templates: list[dict],
    *,
    title: str,
    layout: str,
    theme: str,
) -> dict:
    templates_by_id = {template.get("id"): template for template in templates}
    templates_by_role = _templates_by_role(templates)
    slides = []
    selected_template_ids = set()

    for planned_slide in plan.get("slides", []):
        template_id = (
            planned_slide.get("templateId")
            or planned_slide.get("template_id")
            or planned_slide.get("id")
        )
        template = templates_by_id.get(template_id)
        if template is None:
            template = _template_by_unique_role(planned_slide, templates_by_role)
        if template is None:
            raise ValueError(f"Unknown templateId: {template_id}")
        selected_template_ids.add(template.get("id"))

        slide = deepcopy(template)
        changes_by_id = _changes_by_id(planned_slide)
        allowed_fields_by_id = {
            element.get("id"): set(_editable_fields(element))
            for element in slide.get("elements", [])
            if _editable_fields(element)
        }

        unknown_ids = set(changes_by_id) - set(allowed_fields_by_id)
        if unknown_ids:
            raise ValueError(f"Unknown content id(s): {', '.join(sorted(unknown_ids))}")

        for element in slide.get("elements", []):
            element_id = element.get("id")
            if element_id not in changes_by_id:
                continue
            changes = {
                key: value
                for key, value in changes_by_id[element_id].items()
                if key in allowed_fields_by_id[element_id]
            }
            for field, value in changes.items():
                coerced_value = _coerce_value(value, element.get(field))
                if field == "height" and _is_zero_height_placeholder(element):
                    element["y"] = element["y"] + element["height"] - coerced_value
                element[field] = coerced_value

        slides.append(_finalize_slide(slide))

    tail_template = _template_by_unique_role({"role": FIXED_TAIL_ROLE}, templates_by_role)
    if tail_template is not None and tail_template.get("id") not in selected_template_ids:
        slides.append(_finalize_slide(deepcopy(tail_template)))

    return clean_presentation(
        {
            "id": str(uuid.uuid4()),
            "title": title,
            "layout": layout,
            "theme": theme,
            "slides": slides,
        }
    )


def clean_presentation(presentation: dict) -> dict:
    cleaned = deepcopy(presentation)
    for slide in cleaned.get("slides", []):
        for key in TEMPLATE_ONLY_KEYS:
            slide.pop(key, None)
        for element in slide.get("elements", []):
            for key in TEMPLATE_ONLY_KEYS:
                element.pop(key, None)
    return cleaned


def _recommend_length(element: dict) -> str:
    return element.get("recommendlength", element.get("recommendLength", ""))


def _templates_by_role(templates: list[dict]) -> dict:
    by_role = {}
    for template in templates:
        role = template.get("role")
        if not role:
            continue
        by_role.setdefault(role, []).append(template)
    return by_role


def _template_by_unique_role(planned_slide: dict, templates_by_role: dict):
    role = planned_slide.get("role")
    matches = templates_by_role.get(role, [])
    if len(matches) == 1:
        return matches[0]
    return None


def _finalize_slide(slide: dict) -> dict:
    slide["id"] = str(uuid.uuid4())
    for element in slide.get("elements", []):
        element["id"] = str(uuid.uuid4())
    return slide


def _editable_fields(element: dict) -> dict:
    if not _has_ai_contract(element):
        return {}
    return {
        key: element[key]
        for key in EDITABLE_PLACEHOLDER_KEYS
        if key in element and _is_placeholder_value(element[key])
    }


def _has_ai_contract(element: dict) -> bool:
    return bool(element.get("description")) and bool(_recommend_length(element))


def _is_placeholder_value(value) -> bool:
    return value == "" or value == 0


def _is_zero_height_placeholder(element: dict) -> bool:
    return element.get("height") == 0 and isinstance(element.get("y"), (int, float))


def _changes_by_id(planned_slide: dict) -> dict:
    contents = planned_slide.get("contents", planned_slide.get("elements", []))
    return {
        item.get("id"): {
            key: value
            for key, value in item.items()
            if key in EDITABLE_PLACEHOLDER_KEYS and key not in AI_ECHO_KEYS
        }
        for item in contents
        if item.get("id")
    }


def _coerce_value(value, template_value):
    if isinstance(template_value, (int, float)):
        if value is None or value == "":
            return 0
        return float(value)
    if value is None:
        return ""
    return str(value)
