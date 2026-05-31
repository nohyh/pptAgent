import json
from pathlib import Path

MOCKS_DIR = Path(__file__).resolve().parent / "mocks"

def load_mock_presentation(filename: str) -> dict:
    path = MOCKS_DIR / filename
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

# Load fully complete static mock presentations
warm_editorial_mock_presentation = load_mock_presentation("claude.json")
minimalist_pitch_deck_mock_presentation = load_mock_presentation("minimalist.json")

mock_presentation = minimalist_pitch_deck_mock_presentation

mockOutline = {
    "title": "项目商业计划书",
    "sections": [
        {
            "id": "sec-1",
            "title": "项目背景与目标",
            "content": "介绍项目的发起背景、核心目标以及预期成果，阐述项目的战略意义与业务价值。"
        },
        {
            "id": "sec-2",
            "title": "市场分析与机会",
            "content": "分析目标市场的规模、增长趋势、竞争格局，识别关键市场机会与潜在风险。"
        },
        {
            "id": "sec-3",
            "title": "产品方案与核心能力",
            "content": "详细说明产品的核心功能、技术架构、创新点以及相对于竞品的差异化优势。"
        },
        {
            "id": "sec-4",
            "title": "商业模式与盈利路径",
            "content": "阐述收入模型、定价策略、成本结构以及盈亏平衡时间表。"
        },
        {
            "id": "sec-5",
            "title": "实施路线图",
            "content": "分阶段说明产品开发、市场推广 and 团队建设的关键里程碑与时间节点。"
        },
        {
            "id": "sec-6",
            "title": "团队介绍与资源需求",
            "content": "介绍核心团队成员背景、关键岗位需求以及所需的资金与资源支持。"
        },
        {
            "id": "sec-7",
            "title": "风险分析与应对策略",
            "content": "识别项目面临的主要风险，包括技术风险、市场风险和运营风险，并给出应对措施。"
        },
        {
            "id": "sec-8",
            "title": "总结与展望",
            "content": "总结项目的核心价值主张，展望未来发展愿景，给出明确 of 行动呼吁。"
        }
    ]
}
