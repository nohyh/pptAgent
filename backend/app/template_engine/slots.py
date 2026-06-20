from copy import deepcopy
import uuid

# 可由 AI 填充内容的可编辑占位符属性名（例如文本、表格 rows 和柱状图/列表的高度）
EDITABLE_PLACEHOLDER_KEYS = {"content", "height", "rows"}

# 仅模板内部使用的元数据属性名（在生成最终演示文稿时需要从 JSON 中剔除）
TEMPLATE_ONLY_KEYS = {
    "description",
    "recommendlength",
    "recommendLength",
    "role",
    "layoutType",
    "generateBy",
    "imagePrompt",
}

# 固定尾页（如“谢谢”页）的 role 标识符
FIXED_TAIL_ROLE = "thanks"


def filter_templates_for_ai(templates: list[dict]) -> list[dict]:
    """
    过滤模板，只保留 AI 需要的字段
    """
    filtered_templates = []
    for template in templates:
        # 如果是固定的感谢页就跳过（感谢页不需要 AI 填充内容）
        if template.get("role") == FIXED_TAIL_ROLE:
            continue
        filtered_template = {
            "role": template.get("role", ""),
            "description": template.get("description", ""),
            "elements": [],
        }

        # 遍历幻灯片的各个元素，进行过滤，只保留需要的属性
        for element in template.get("elements", []):
            editable_fields = _editable_fields(element)
            if not editable_fields:
                # 如果该元素没有任何可由 AI 填充的占位符（即不需要 AI 填充），则不发给 AI
                continue
            filtered_element = {
                "id": element.get("id", ""),
                "type": element.get("type", ""),
                "description": element.get("description", ""),
                "recommendlength": _recommend_length(element),
            }
            # 合并可编辑的占位符字段（如 content: ""，告诉 AI 这里需要填写）
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
    """
    将 AI 输出的填充内容与原始 PPT 模板拼接，填充成一个完整可用的 Presentation JSON。
    """
    # 建立 ID 和 Role 到模板的映射，方便快速查找
    templates_by_id = {template.get("id"): template for template in templates}
    templates_by_role = _templates_by_role(templates)
    slides = []
    selected_template_ids = set()

    # 按照 AI 规划的幻灯片顺序依次进行填充
    for planned_slide in plan.get("slides", []):
        # 优先使用 templateId 寻找匹配的原始模板，若找不到则通过唯一角色（role）进行匹配
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

        # 深拷贝一份模板作为当前幻灯片的基底，在上面进行内容填充
        slide = deepcopy(template)
        # 获取 AI 对当前幻灯片元素所做的填充值（以元素 ID 为 Key 的字典）
        changes_by_id = _changes_by_id(planned_slide)
        # 记录每个元素允许被编辑的字段集合（从原始模板中提取哪些字段是空占位符）
        allowed_fields_by_id = {
            element.get("id"): set(_editable_fields(element))
            for element in slide.get("elements", [])
            if _editable_fields(element)
        }

        # 安全性校验：防止 AI 返回了不存在的元素 ID
        unknown_ids = set(changes_by_id) - set(allowed_fields_by_id)
        if unknown_ids:
            raise ValueError(f"Unknown content id(s): {', '.join(sorted(unknown_ids))}")

        # 将 AI 填充的字段值写入到拷贝出来的幻灯片元素中
        for element in slide.get("elements", []):
            element_id = element.get("id")
            if element_id not in changes_by_id:
                continue
            # 过滤出合法的修改项
            changes = {
                key: value
                for key, value in changes_by_id[element_id].items()
                if key in allowed_fields_by_id[element_id]
            }
            for field, value in changes.items():
                coerced_value = _coerce_value(value, element.get(field))
                # 特殊逻辑：如果是高度自适应且初始高度为 0 的占位块，
                # 填充高度后需要根据增加的高度向上调整 y 轴坐标，避免元素向下溢出
                if field == "height" and _is_zero_height_placeholder(element):
                    element["y"] = element["y"] + element["height"] - coerced_value
                element[field] = coerced_value

        # 生成新的随机 ID，并将完成填充的幻灯片加入列表
        slides.append(_finalize_slide(slide))

    # 如果有且仅有一个固定感谢页（如 role="thanks"），且 AI 规划中没包含它，则自动在末尾追加
    tail_template = _template_by_unique_role({"role": FIXED_TAIL_ROLE}, templates_by_role)
    if tail_template is not None and tail_template.get("id") not in selected_template_ids:
        slides.append(_finalize_slide(deepcopy(tail_template)))

    # 清理掉用于模板引擎的辅助字段后，返回最终 Presentation 结果
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
    """
    从填充完成的 Presentation JSON 中清理掉只属于模板引擎内部的辅助元数据（如 description 等）。
    """
    cleaned = deepcopy(presentation)
    for slide in cleaned.get("slides", []):
        for key in TEMPLATE_ONLY_KEYS:
            slide.pop(key, None)
        for element in slide.get("elements", []):
            for key in TEMPLATE_ONLY_KEYS:
                element.pop(key, None)
    return cleaned


def _recommend_length(element: dict) -> str:
    """
    安全地获取元素的推荐字数/长度（兼容 recommendlength 和 recommendLength 两种命名）。
    """
    return element.get("recommendlength", element.get("recommendLength", ""))


def _templates_by_role(templates: list[dict]) -> dict:
    """
    将模板按 role 字段进行分组归类，方便后续通过角色快速查找对应的幻灯片布局。
    """
    by_role = {}
    for template in templates:
        role = template.get("role")
        if not role:
            continue
        by_role.setdefault(role, []).append(template)
    return by_role


def _template_by_unique_role(planned_slide: dict, templates_by_role: dict):
    """
    如果某个 role 在所有模板中只对应一个模板幻灯片，则返回该唯一模板，否则返回 None。
    """
    role = planned_slide.get("role")
    matches = templates_by_role.get(role, [])
    if len(matches) == 1:
        return matches[0]
    return None


def _finalize_slide(slide: dict) -> dict:
    """
    为生成的幻灯片以及其中的所有元素分配全新的唯一 UUID（UUIDv4），防止 ID 冲突。
    """
    slide["id"] = str(uuid.uuid4())
    for element in slide.get("elements", []):
        element["id"] = str(uuid.uuid4())
    return slide


def _editable_fields(element: dict) -> dict:
    """
    提取某个元素中，可由 AI 进行编辑/填充的占位符字段及其当前值（如 content: ""，height: 0）。
    只有当元素具有 description 且声明了推荐长度时，才会被视为具有 AI 编辑协议的元素。
    """
    if not _has_ai_contract(element):
        return {}
    return {
        key: element[key]
        for key in EDITABLE_PLACEHOLDER_KEYS
        if key in element and _is_placeholder_value(element[key])
    }


def _has_ai_contract(element: dict) -> bool:
    """
    判断一个元素是否具备 AI 填充契约：必须同时包含 description 字段且规定了 recommendlength 长度。
    """
    return bool(element.get("description")) and bool(_recommend_length(element))


def _is_placeholder_value(value) -> bool:
    """
    判断某个字段值是否是初始占位值（空字符串 ""、数值 0 或空表格 rows）。
    """
    if isinstance(value, list):
        return len(value) == 0
    return value == "" or value == 0


def _is_zero_height_placeholder(element: dict) -> bool:
    """
    判断是否是高度为 0 且具有有效 y 轴坐标的占位块元素。
    """
    return element.get("height") == 0 and isinstance(element.get("y"), (int, float))


def _changes_by_id(planned_slide: dict) -> dict:
    """
    从 AI 返回的幻灯片填充数据中，按元素 ID 过滤出所有真正被 AI 填写的内容变更数据，
    排除回显的元数据字段（如 type、description）。
    """
    contents = planned_slide.get("contents", planned_slide.get("elements", []))
    return {
        item.get("id"): {
            key: value
            for key, value in item.items()
            if key in EDITABLE_PLACEHOLDER_KEYS
        }
        for item in contents
        if item.get("id")
    }


def _coerce_value(value, template_value):
    """
    类型强制转换：将 AI 填充的数据转换为与模板定义相匹配的数据类型。
    如果模板原值是数值（int/float），则强制转换为 float，否则转为 str。
    """
    if isinstance(template_value, list):
        return _coerce_table_rows(value)
    if isinstance(template_value, (int, float)):
        if value is None or value == "":
            return 0
        return float(value)
    if value is None:
        return ""
    return str(value)


def _coerce_table_rows(value) -> list[list[str]]:
    """
    将 AI 返回的表格 rows 规范成二维字符串数组，避免单元格里混入数字或 None。
    """
    if not isinstance(value, list):
        return []
    rows = []
    for row in value:
        if not isinstance(row, list):
            continue
        rows.append(["" if cell is None else str(cell) for cell in row])
    return rows
