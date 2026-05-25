import copy
from app.templates import Template

ExampleSlides = copy.deepcopy(Template["claude"])

# Let's populate the text fields of the slides
# Slide 1: Cover
ExampleSlides[0]["elements"][2]["content"] = "AI PRESENTATION AGENT"  # kicker
ExampleSlides[0]["elements"][3]["content"] = "AI 驱动的幻灯片编辑器"  # title
ExampleSlides[0]["elements"][4]["content"] = "从结构化 JSON 到极致视觉呈现的全新工作流"  # subtitle
ExampleSlides[0]["elements"][6]["content"] = "V1.0.0 发布版"  # footer

# Slide 2: Image-text
ExampleSlides[1]["elements"][0]["content"] = "为何选择极致的版式设计？"  # title
ExampleSlides[1]["elements"][2]["content"] = "传统的幻灯片工具往往让用户在对齐、配色和字体选择上浪费大量时间。我们通过标准化的 Presentation JSON 模式，将内容生成与视觉样式完美解耦，让设计回归纯粹与高效。"  # body
ExampleSlides[1]["elements"][5]["content"] = "图1. 传统设计与模块化设计的对比说明"  # caption

# Slide 3: Image-text 02
ExampleSlides[2]["elements"][2]["content"] = "核心设计理念"  # kicker
ExampleSlides[2]["elements"][3]["content"] = "极简主义与呼吸感"  # title
ExampleSlides[2]["elements"][4]["content"] = "留白不是空间的浪费，而是视觉的聚焦。我们坚持温和的暖色调杂志感与充足的呼吸感，使每一张幻灯片都如同精美的艺术画册。"  # body
ExampleSlides[2]["elements"][5]["content"] = "注：支持多种屏幕比例自适应"  # note

# Slide 4: Image-text 03
ExampleSlides[3]["elements"][2]["content"] = "核心架构"  # kicker
ExampleSlides[3]["elements"][3]["content"] = "单一数据源"  # title
ExampleSlides[3]["elements"][4]["content"] = "Presentation JSON 是编辑器的唯一事实来源。无论是前端的 React 交互预览，还是后端的 PPTX 高保真导出，均基于同一套 JSON 规范进行渲染。"  # body

# Slide 5: Text 01
ExampleSlides[4]["elements"][0]["content"] = "开发计划"  # kicker
ExampleSlides[4]["elements"][1]["content"] = "未来的双引擎驱动"  # title
ExampleSlides[4]["elements"][3]["content"] = "前端 React 渲染器专注于极致的实时交互体验、实时拖拽和智能排版微调，让用户能直观看到每一个像素的调整效果。"  # body-left
ExampleSlides[4]["elements"][4]["content"] = "后端 Python 渲染器则专注于生成纯净、无冗余的 native PPTX 文件，支持离线演示和企业级高质量排版定制。"  # body-right
ExampleSlides[4]["elements"][5]["content"] = "05"  # number

# Slide 6: Text 02
ExampleSlides[5]["elements"][2]["content"] = "“Less is More.”"  # quote
ExampleSlides[5]["elements"][3]["content"] = "—— 密斯·凡·德·罗（Mies van der Rohe）"  # detail
ExampleSlides[5]["elements"][4]["content"] = "现代主义建筑大师的极简宣言"  # foot

# Slide 7: Section 01
ExampleSlides[6]["elements"][0]["content"] = "02 / APPENDIX"  # index
ExampleSlides[6]["elements"][2]["content"] = "附录与参考标准"  # title
ExampleSlides[6]["elements"][3]["content"] = "项目规范与 Presentation JSON 详细结构参数定义说明书"  # subtitle

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
            "content": "分阶段说明产品开发、市场推广和团队建设的关键里程碑与时间节点。"
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
            "content": "总结项目的核心价值主张，展望未来发展愿景，给出明确的行动呼吁。"
        }
    ]
}

mock_presentation_slides = [
    # 幻灯片 1：高级杂志风封面
    {
        "id": "slide-01",
        "background": "#faf9f6", # ivory background
        "elements": [
            {
                "id": "elem-sidebar",
                "type": "block",
                "shapeType": "rect",
                "x": 0,
                "y": 0,
                "width": 32,
                "height": 100,
                "backgroundColor": "#f0eee6",
            },
            {
                "id": "elem-accent-line",
                "type": "block",
                "shapeType": "rect",
                "x": 8,
                "y": 15,
                "width": 4,
                "height": 0.8,
                "backgroundColor": "#c85a47",
            },
            {
                "id": "elem-chapter",
                "type": "text",
                "content": "CHAPTER 01",
                "x": 8,
                "y": 18,
                "width": 20,
                "height": 5,
                "fontSize": 14,
                "color": "#c85a47",
                "bold": True,
                "align": "left",
            },
            {
                "id": "elem-sidebar-desc",
                "type": "text",
                "content": "Exploring the fundamentals of warm editorial aesthetics and how they elevate digital presentations to feel like premium printed magazines.",
                "x": 8,
                "y": 26,
                "width": 16,
                "height": 30,
                "fontSize": 15,
                "color": "#7a776c",
                "align": "left",
            },
            {
                "id": "elem-title",
                "type": "text",
                "content": "The Art of Simplicity",
                "x": 38,
                "y": 14,
                "width": 55,
                "height": 15,
                "fontSize": 56,
                "color": "#2c2a25",
                "bold": True,
                "align": "left",
                "font": "Georgia, serif",
            },
            {
                "id": "elem-subtitle",
                "type": "text",
                "content": "Crafting meaningful digital experiences through minimalist design.",
                "x": 38,
                "y": 31,
                "width": 55,
                "height": 10,
                "fontSize": 22,
                "color": "#5c5a52",
                "align": "left",
            },
            {
                "id": "elem-image",
                "type": "image",
                "src": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
                "alt": "Elegant office architecture",
                "x": 38,
                "y": 45,
                "width": 55,
                "height": 45,
            }
        ]
    },
    # 幻灯片 2：图文内容页
    {
        "id": "slide-02",
        "background": "#faf9f6",
        "elements": [
            {
                "id": "elem-s2-title",
                "type": "text",
                "content": "Why Editorial Design?",
                "x": 10,
                "y": 15,
                "width": 80,
                "height": 15,
                "fontSize": 48,
                "color": "#2c2a25",
                "bold": True,
                "align": "left",
                "font": "Georgia, serif",
            },
            {
                "id": "elem-s2-line",
                "type": "block",
                "shapeType": "rect",
                "x": 10,
                "y": 32,
                "width": 80,
                "height": 0.2,
                "backgroundColor": "#d1cfc5",
            },
            {
                "id": "elem-s2-text",
                "type": "text",
                "content": "Editorial design focuses on typography, grid systems, and intentional whitespace. It transforms dense information into a readable, pacing-driven narrative that guides the eye naturally.",
                "x": 10,
                "y": 40,
                "width": 40,
                "height": 40,
                "fontSize": 24,
                "color": "#5c5a52",
                "align": "left",
            },
            {
                "id": "elem-s2-image",
                "type": "image",
                "src": "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=800",
                "alt": "Magazine layout",
                "x": 55,
                "y": 40,
                "width": 35,
                "height": 45,
            }
        ]
    },
    # 幻灯片 3：名言/强调页
    {
        "id": "slide-03",
        "background": "#e8e4d9",
        "elements": [
            { "id": "s3-q", "type": "text", "content": "\"Simplicity is the ultimate sophistication.\"", "x": 20, "y": 35, "width": 60, "height": 20, "fontSize": 48, "color": "#2c2a25", "align": "center", "font": "Georgia, serif", "bold": True },
            { "id": "s3-a", "type": "text", "content": "— Leonardo da Vinci", "x": 20, "y": 60, "width": 60, "height": 10, "fontSize": 24, "color": "#c85a47", "align": "center" }
        ]
    },
    # 幻灯片 4：大图背景页
    {
        "id": "slide-04",
        "background": "#faf9f6",
        "elements": [
            { "id": "s4-img", "type": "image", "src": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200", "x": 5, "y": 5, "width": 90, "height": 60 },
            { "id": "s4-t", "type": "text", "content": "A New Perspective", "x": 10, "y": 72, "width": 80, "height": 15, "fontSize": 40, "color": "#2c2a25", "bold": True, "font": "Georgia, serif" },
            { "id": "s4-d", "type": "text", "content": "Changing the way we look at digital spaces and physical environments.", "x": 10, "y": 85, "width": 80, "height": 10, "fontSize": 20, "color": "#5c5a52" }
        ]
    },
    # 幻灯片 5：三列特性页
    {
        "id": "slide-05",
        "background": "#faf9f6",
        "elements": [
            { "id": "s5-t", "type": "text", "content": "Core Principles", "x": 10, "y": 15, "width": 80, "height": 15, "fontSize": 40, "color": "#2c2a25", "bold": True, "font": "Georgia, serif" },
            { "id": "s5-b1", "type": "block", "shapeType": "rect", "x": 10, "y": 35, "width": 24, "height": 40, "backgroundColor": "#f0eee6" },
            { "id": "s5-t1", "type": "text", "content": "Clarity", "x": 12, "y": 40, "width": 20, "height": 10, "fontSize": 24, "color": "#c85a47", "bold": True },
            { "id": "s5-d1", "type": "text", "content": "Remove the non-essential. Focus purely on the core message.", "x": 12, "y": 50, "width": 20, "height": 20, "fontSize": 16, "color": "#5c5a52" },
            { "id": "s5-b2", "type": "block", "shapeType": "rect", "x": 38, "y": 35, "width": 24, "height": 40, "backgroundColor": "#f0eee6" },
            { "id": "s5-t2", "type": "text", "content": "Warmth", "x": 40, "y": 40, "width": 20, "height": 10, "fontSize": 24, "color": "#c85a47", "bold": True },
            { "id": "s5-d2", "type": "text", "content": "Use colors and textures that invite engagement and trust.", "x": 40, "y": 50, "width": 20, "height": 20, "fontSize": 16, "color": "#5c5a52" },
            { "id": "s5-b3", "type": "block", "shapeType": "rect", "x": 66, "y": 35, "width": 24, "height": 40, "backgroundColor": "#f0eee6" },
            { "id": "s5-t3", "type": "text", "content": "Rhythm", "x": 68, "y": 40, "width": 20, "height": 10, "fontSize": 24, "color": "#c85a47", "bold": True },
            { "id": "s5-d3", "type": "text", "content": "Establish a natural reading flow and structural hierarchy.", "x": 68, "y": 50, "width": 20, "height": 20, "fontSize": 16, "color": "#5c5a52" }
        ]
    },
    # 幻灯片 6：深色流程页
    {
        "id": "slide-06",
        "background": "#2c2a25", # Dark background
        "elements": [
            { "id": "s6-t", "type": "text", "content": "The Process", "x": 10, "y": 15, "width": 80, "height": 15, "fontSize": 40, "color": "#faf9f6", "bold": True, "font": "Georgia, serif" },
            { "id": "s6-num1", "type": "text", "content": "01", "x": 10, "y": 40, "width": 10, "height": 10, "fontSize": 32, "color": "#c85a47", "font": "Georgia, serif" },
            { "id": "s6-dt1", "type": "text", "content": "Discovery & Research", "x": 20, "y": 42, "width": 70, "height": 10, "fontSize": 20, "color": "#e8e4d9" },
            { "id": "s6-num2", "type": "text", "content": "02", "x": 10, "y": 55, "width": 10, "height": 10, "fontSize": 32, "color": "#c85a47", "font": "Georgia, serif" },
            { "id": "s6-dt2", "type": "text", "content": "Concept Development", "x": 20, "y": 57, "width": 70, "height": 10, "fontSize": 20, "color": "#e8e4d9" },
            { "id": "s6-num3", "type": "text", "content": "03", "x": 10, "y": 70, "width": 10, "height": 10, "fontSize": 32, "color": "#c85a47", "font": "Georgia, serif" },
            { "id": "s6-dt3", "type": "text", "content": "Refinement & Delivery", "x": 20, "y": 72, "width": 70, "height": 10, "fontSize": 20, "color": "#e8e4d9" }
        ]
    },
    # 幻灯片 7：左图右文
    {
        "id": "slide-07",
        "background": "#faf9f6",
        "elements": [
            { "id": "s7-img", "type": "image", "src": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800", "x": 10, "y": 20, "width": 35, "height": 60 },
            { "id": "s7-t", "type": "text", "content": "Inspiration", "x": 50, "y": 30, "width": 40, "height": 15, "fontSize": 40, "color": "#2c2a25", "bold": True, "font": "Georgia, serif" },
            { "id": "s7-d", "type": "text", "content": "Every great design begins with an even better story. We draw inspiration from nature, architecture, and classic editorial prints.", "x": 50, "y": 48, "width": 40, "height": 30, "fontSize": 20, "color": "#5c5a52" }
        ]
    },
    # 幻灯片 8：结束页
    {
        "id": "slide-08",
        "background": "#faf9f6",
        "elements": [
            { "id": "s8-b", "type": "block", "shapeType": "rect", "x": 48, "y": 30, "width": 4, "height": 6, "backgroundColor": "#c85a47" },
            { "id": "s8-t", "type": "text", "content": "Thank You", "x": 20, "y": 45, "width": 60, "height": 15, "fontSize": 56, "color": "#2c2a25", "bold": True, "align": "center", "font": "Georgia, serif" },
            { "id": "s8-d", "type": "text", "content": "hello@example.com  |  www.example.com", "x": 20, "y": 65, "width": 60, "height": 10, "fontSize": 18, "color": "#c85a47", "align": "center" }
        ]
    }
]

mock_presentation = {
    "id": "pres-001",
    "title": "项目商业计划书",
    "layout": "16x9",
    "theme": "warm-editorial",
    "slides": ExampleSlides + mock_presentation_slides
}
