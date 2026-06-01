import { useRef } from "react"
import { usePresentationStore } from "@/stores/presentationStore"
import type { SlideElement, TextElement, ImageElement, BlockElement } from "@/types/presentation"
import {
  Type,
  Image,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Move,
  Maximize2,
  Upload,
  Trash2,
} from "lucide-react"

interface EditorDialogProps {
  selectedElement: SlideElement | undefined
  slideId: string
}

// ─── 通用：位置 & 尺寸面板 ──────────────────────────
const PositionSection = ({
  element,
  slideId,
  updateElement,
}: {
  element: SlideElement
  slideId: string
  updateElement: (slideId: string, elementId: string, updates: any) => void
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-stone-gray">
      <Move className="size-3.5" />
      <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-wide">
        位置与尺寸
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "X", key: "x", value: element.x },
        { label: "Y", key: "y", value: element.y },
        { label: "W", key: "width", value: element.width },
        { label: "H", key: "height", value: element.height },
      ].map(({ label, key, value }) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="font-sans text-[0.6875rem] text-warm-silver">{label} (%)</span>
          <input
            type="number"
            step="0.5"
            value={value}
            onChange={(e) =>
              updateElement(slideId, element.id, { [key]: parseFloat(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-sans text-[0.8125rem] text-foreground outline-none transition-all duration-200 focus:border-border-warm focus:shadow-[0_0_0_1px_rgba(209,207,197,0.5)]"
          />
        </label>
      ))}
    </div>
  </div>
)

// ─── 文本属性面板 ───────────────────────────────────
const TextPanel = ({
  element,
  slideId,
  updateElement,
}: {
  element: TextElement
  slideId: string
  updateElement: (slideId: string, elementId: string, updates: any) => void
}) => (
  <div className="space-y-5">
    {/* 内容 */}
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-stone-gray">
        <Type className="size-3.5" />
        <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-wide">
          文本内容
        </span>
      </div>
      <textarea
        value={element.content}
        onChange={(e) => updateElement(slideId, element.id, { content: e.target.value })}
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-sans text-[0.8125rem] leading-relaxed text-foreground outline-none transition-all duration-200 placeholder:text-ring-deep focus:border-border-warm focus:shadow-[0_0_0_1px_rgba(209,207,197,0.5)]"
        placeholder="输入文本内容..."
      />
    </div>

    {/* 字体 & 字号 & 行距 */}
    <div className="grid grid-cols-3 gap-3">
      <label className="flex flex-col gap-1">
        <span className="font-sans text-[0.6875rem] text-warm-silver">字体</span>
        <select
          value={element.font || ""}
          onChange={(e) => updateElement(slideId, element.id, { font: e.target.value || undefined })}
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-sans text-[0.8125rem] text-foreground outline-none transition-all duration-200 focus:border-border-warm focus:shadow-[0_0_0_1px_rgba(209,207,197,0.5)]"
        >
          <option value="">默认</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Helvetica, sans-serif">Helvetica</option>
          <option value="Times New Roman, serif">Times New Roman</option>
          <option value="Courier New, monospace">Courier New</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-sans text-[0.6875rem] text-warm-silver">字号</span>
        <input
          type="number"
          min={8}
          max={200}
          value={element.fontSize}
          onChange={(e) =>
            updateElement(slideId, element.id, { fontSize: parseInt(e.target.value) || 16 })
          }
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-sans text-[0.8125rem] text-foreground outline-none transition-all duration-200 focus:border-border-warm focus:shadow-[0_0_0_1px_rgba(209,207,197,0.5)]"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-sans text-[0.6875rem] text-warm-silver">行距</span>
        <input
          type="number"
          step="0.1"
          min={0.5}
          max={3}
          value={element.lineHeight || 1.5}
          onChange={(e) =>
            updateElement(slideId, element.id, { lineHeight: parseFloat(e.target.value) || 1.5 })
          }
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-sans text-[0.8125rem] text-foreground outline-none transition-all duration-200 focus:border-border-warm focus:shadow-[0_0_0_1px_rgba(209,207,197,0.5)]"
        />
      </label>
    </div>

    {/* 颜色 */}
    <label className="flex flex-col gap-1">
      <span className="font-sans text-[0.6875rem] text-warm-silver">文字颜色</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={element.color || "#000000"}
          onChange={(e) => updateElement(slideId, element.id, { color: e.target.value })}
          className="size-8 cursor-pointer rounded-lg border border-border bg-background p-0.5"
        />
        <input
          type="text"
          value={element.color || "#000000"}
          onChange={(e) => updateElement(slideId, element.id, { color: e.target.value })}
          className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 font-sans text-[0.8125rem] text-foreground outline-none transition-all duration-200 focus:border-border-warm focus:shadow-[0_0_0_1px_rgba(209,207,197,0.5)]"
        />
      </div>
    </label>

    {/* 粗体 & 对齐 */}
    <div className="space-y-2">
      <span className="font-sans text-[0.6875rem] text-warm-silver">样式</span>
      <div className="flex items-center gap-1.5">
        {/* 粗体 */}
        <button
          type="button"
          onClick={() => updateElement(slideId, element.id, { bold: !element.bold })}
          className={`flex size-8 items-center justify-center rounded-lg border transition-all duration-200 ${
            element.bold
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-olive-gray hover:bg-border-warm"
          }`}
        >
          <Bold className="size-3.5" />
        </button>

        {/* 分隔线 */}
        <div className="mx-1 h-5 w-px bg-border" />

        {/* 对齐 */}
        {(["left", "center", "right"] as const).map((align) => {
          const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
          return (
            <button
              key={align}
              type="button"
              onClick={() => updateElement(slideId, element.id, { align })}
              className={`flex size-8 items-center justify-center rounded-lg border transition-all duration-200 ${
                element.align === align
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-olive-gray hover:bg-border-warm"
              }`}
            >
              <Icon className="size-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  </div>
)

// ─── 图片属性面板 ───────────────────────────────────
const ImagePanel = ({
  element,
  slideId,
  updateElement,
}: {
  element: ImageElement
  slideId: string
  updateElement: (slideId: string, elementId: string, updates: any) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateElement(slideId, element.id, { src: reader.result })
      }
    }
    reader.readAsDataURL(file)
    // 清空 value 以便重复选择同一文件
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      {/* 替换图片按钮 */}
      <div className="space-y-1">
        <span className="font-sans text-[0.6875rem] text-warm-silver">替换图片</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 font-sans text-[0.8125rem] text-olive-gray transition-all duration-200 hover:border-border-warm hover:bg-border-warm hover:text-foreground"
        >
          <Upload className="size-3.5" />
          从本地选择图片
        </button>
      </div>

      {/* Alt 文本 */}
      <label className="flex flex-col gap-1">
        <span className="font-sans text-[0.6875rem] text-warm-silver">替代文本</span>
        <input
          type="text"
          value={element.alt || ""}
          onChange={(e) =>
            updateElement(slideId, element.id, { alt: e.target.value || undefined })
          }
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-sans text-[0.8125rem] text-foreground outline-none transition-all duration-200 focus:border-border-warm focus:shadow-[0_0_0_1px_rgba(209,207,197,0.5)]"
          placeholder="图片描述..."
        />
      </label>
    </div>
  )
}

// ─── 形状属性面板 ───────────────────────────────────
const BlockPanel = ({
  element,
  slideId,
  updateElement,
}: {
  element: BlockElement
  slideId: string
  updateElement: (slideId: string, elementId: string, updates: any) => void
}) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 text-stone-gray">
      <Square className="size-3.5" />
      <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-wide">
        形状
      </span>
    </div>

    {/* 形状类型 */}
    <div className="space-y-2">
      <span className="font-sans text-[0.6875rem] text-warm-silver">形状类型</span>
      <div className="flex items-center gap-1.5">
        {([
          { value: "rect", label: "矩形" },
          { value: "roundRect", label: "圆角" },
          { value: "circle", label: "圆形" },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => updateElement(slideId, element.id, { shapeType: value })}
            className={`flex-1 rounded-lg border px-3 py-1.5 font-sans text-[0.75rem] transition-all duration-200 ${
              element.shapeType === value
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border bg-background text-olive-gray hover:bg-border-warm"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    {/* 背景色 */}
    <label className="flex flex-col gap-1">
      <span className="font-sans text-[0.6875rem] text-warm-silver">背景色</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={element.backgroundColor || "#ffffff"}
          onChange={(e) => updateElement(slideId, element.id, { backgroundColor: e.target.value })}
          className="size-8 cursor-pointer rounded-lg border border-border bg-background p-0.5"
        />
        <input
          type="text"
          value={element.backgroundColor || ""}
          onChange={(e) => updateElement(slideId, element.id, { backgroundColor: e.target.value })}
          className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 font-sans text-[0.8125rem] text-foreground outline-none transition-all duration-200 focus:border-border-warm focus:shadow-[0_0_0_1px_rgba(209,207,197,0.5)]"
          placeholder="#ffffff"
        />
      </div>
    </label>

    {/* 边框 */}
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1">
        <span className="font-sans text-[0.6875rem] text-warm-silver">边框颜色</span>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={element.borderColor || "#000000"}
            onChange={(e) => updateElement(slideId, element.id, { borderColor: e.target.value })}
            className="size-7 cursor-pointer rounded border border-border bg-background p-0.5"
          />
          <input
            type="text"
            value={element.borderColor || ""}
            onChange={(e) => updateElement(slideId, element.id, { borderColor: e.target.value })}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 font-sans text-[0.75rem] text-foreground outline-none transition-all duration-200 focus:border-border-warm"
            placeholder="#000"
          />
        </div>
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-sans text-[0.6875rem] text-warm-silver">边框宽度</span>
        <input
          type="number"
          min={0}
          max={20}
          value={element.borderWidth || 0}
          onChange={(e) =>
            updateElement(slideId, element.id, { borderWidth: parseInt(e.target.value) || 0 })
          }
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-sans text-[0.8125rem] text-foreground outline-none transition-all duration-200 focus:border-border-warm focus:shadow-[0_0_0_1px_rgba(209,207,197,0.5)]"
        />
      </label>
    </div>
  </div>
)

// ─── 主组件 ─────────────────────────────────────────
const EditorDialog = ({ selectedElement, slideId }: EditorDialogProps) => {
  const updateElement = usePresentationStore((state) => state.updateElement);
  const deleteElement = usePresentationStore((state) => state.deleteElement);

  if (!selectedElement) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-10">
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-background ring-1 ring-border-warm">
          <Maximize2 className="size-4 text-ring" />
        </div>
        <p className="font-heading text-[0.875rem] font-medium text-charcoal-warm">
          元素属性
        </p>
        <p className="mt-1 text-center font-sans text-[0.75rem] leading-relaxed text-warm-silver">
          选中幻灯片中的元素
          <br />
          即可在此编辑属性
        </p>
      </div>
    )
  }

  // 元素类型标签
  const typeLabels: Record<string, { label: string; icon: typeof Type }> = {
    text: { label: "文本", icon: Type },
    image: { label: "图片", icon: Image },
    block: { label: "形状", icon: Square },
    table: { label: "表格", icon: Square },
  }
  const { label, icon: TypeIcon } = typeLabels[selectedElement.type] || typeLabels.text

  return (
    <div className="space-y-5">
      {/* 标题栏 */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <TypeIcon className="size-3.5 text-primary" />
        </div>
        <div>
          <p className="font-sans text-[0.8125rem] font-medium text-foreground">{label}</p>
          <p className="font-sans text-[0.6875rem] text-warm-silver">ID: {selectedElement.id}</p>
        </div>
      </div>

      {/* 位置 & 尺寸（所有类型共享） */}
      <PositionSection element={selectedElement} slideId={slideId} updateElement={updateElement} />

      {/* 分隔线 */}
      <div className="border-t border-border" />

      {/* 类型专属面板 */}
      {selectedElement.type === "text" && (
        <TextPanel element={selectedElement} slideId={slideId} updateElement={updateElement} />
      )}
      {selectedElement.type === "image" && (
        <ImagePanel element={selectedElement} slideId={slideId} updateElement={updateElement} />
      )}
      {selectedElement.type === "block" && (
        <BlockPanel element={selectedElement} slideId={slideId} updateElement={updateElement} />
      )}

      {/* 分隔线 */}
      <div className="border-t border-border" />

      {/* 删除元素 */}
      <button
        type="button"
        onClick={() => {
          deleteElement(slideId, selectedElement.id)
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-sans text-[0.8125rem] text-red-600 transition-all duration-200 hover:bg-red-100 hover:border-red-300"
      >
        <Trash2 className="size-3.5" />
        删除元素
      </button>
    </div>
  )
}

export { EditorDialog }