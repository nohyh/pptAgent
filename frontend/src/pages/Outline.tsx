import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Minus,
  GripVertical,
} from "lucide-react"
import { useEditorStore, type Verbosity } from "@/stores/editorStore"
import { usePresentationStore } from "@/stores/presentationStore"

const generatePresentation = usePresentationStore.getState().generatePresentation
const STYLES = [
  {
    id: "apple",
    name: "Apple",
    description: "留白充足 黑白产品感 蓝色动作色",
    preview: "#f5f5f7",
    accent: "#0066cc",
  },
  {
    id: "warm-editorial",
    name: "Anthropic",
    description: "温和的颜色 简单的界面 清晰的排版",
    preview: "#f5f4ed",
    accent: "#c96442",
    icon: "/anthropic.png"
  }
]

const VERBOSITY_OPTIONS: { id: Verbosity; label: string; desc: string }[] = [
  { id: "detailed", label: "详细", desc: "每页包含完整的段落与数据说明" },
  { id: "moderate", label: "适中", desc: "每页保留关键要点与简要说明" },
  { id: "brief", label: "少量", desc: "每页仅保留核心关键词与短句" },
]

function clampPageCount(value: number, min: number): number {
  return Math.max(min, Math.min(50, value))
}

export default function Outline() {
  const navigate = useNavigate()
  const title = useEditorStore((s) => s.title)
  const sections = useEditorStore((s) => s.sections)
  const style = useEditorStore((s) => s.style)
  const pageCount = useEditorStore((s) => s.pageCount)
  const verbosity = useEditorStore((s) => s.verbosity)
  const setTitle = useEditorStore((s) => s.setTitle)
  const updateSection = useEditorStore((s) => s.updateSection)
  const addSection = useEditorStore((s) => s.addSection)
  const removeSection = useEditorStore((s) => s.removeSection)
  const setStyle = useEditorStore((s) => s.setStyle)
  const setPageCount = useEditorStore((s) => s.setPageCount)
  const setVerbosity = useEditorStore((s) => s.setVerbosity)

  const minPages = sections.length

  const handlePageChange = (delta: number) => {
    setPageCount(clampPageCount(pageCount + delta, minPages))
  }

  const handleGenerate = async () => {
    await generatePresentation()
    navigate('/editor')
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-5 sm:px-8">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-sans text-[0.8125rem] text-olive-gray transition-all duration-200 hover:bg-border-warm hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="size-4" />
            返回
          </button>
          <span className="text-ring">/</span>
          <span className="truncate font-sans text-[0.8125rem] font-medium text-stone-gray">
            编辑大纲
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px] gap-10 px-5 py-10 sm:px-8 lg:gap-14">
        {/* Left: Outline */}
        <section className="animate-fade-up min-w-0 flex-1">
          {/* Title */}
          <div className="mb-10">
            <label className="mb-3 block font-sans text-[0.625rem] font-medium uppercase tracking-[0.5px] text-stone-gray">
              演示文稿标题
            </label>
            <input
              type="text"
              className="w-full border-b-2 border-transparent bg-transparent pb-2 font-heading text-[2.25rem] font-medium leading-[1.15] text-foreground outline-none transition-colors duration-300 placeholder:text-ring-deep focus:border-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入标题"
            />
          </div>



          {/* Sections */}
          <ul className="space-y-3">
            {sections.map((section, i) => (
              <li
                key={section.id}
                className="group relative rounded-2xl border border-border bg-ivory py-8 px-5 shadow-[0_0_0_1px_rgba(209,207,197,0.2)] transition-all duration-300 hover:border-border-warm hover:shadow-card"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Drag handle hint */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-60">
                  <GripVertical className="size-4 text-ring-deep" />
                </div>

                {/* Section header row */}
                <div className="mb-3 flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-background font-sans text-[0.6875rem] font-semibold tabular-nums text-primary ring-1 ring-border-warm">
                    {i + 1}
                  </span>

                  <input
                    type="text"
                    className="flex-1 bg-transparent font-heading text-[1.0625rem] font-medium leading-snug text-foreground outline-none placeholder:text-warm-silver"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(section.id, { title: e.target.value })
                    }
                    placeholder="章节标题"
                  />

                  {/* Delete button */}
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 rounded-lg p-1.5 text-ring-deep opacity-0 transition-all duration-200 hover:bg-border hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => removeSection(section.id)}
                    disabled={sections.length <= 1}
                    title="删除章节"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="ml-10">
                  <textarea
                    className="w-full resize-none bg-transparent font-sans text-[0.9375rem] leading-[1.6] text-olive-gray outline-none placeholder:text-ring-deep"
                    value={section.content}
                    onChange={(e) =>
                      updateSection(section.id, { content: e.target.value })
                    }
                    rows={4}
                    placeholder="章节描述"
                  />
                </div>

                {/* Insert between sections — appears below each card on hover */}
                {i < sections.length - 1 && (
                  <div className="absolute -bottom-2.5 left-1/2 z-10 -translate-x-1/2">
                    <button
                      type="button"
                      className="flex size-5 items-center justify-center rounded-full border border-border-warm bg-ivory text-ring-deep opacity-0 shadow-[0px_2px_8px_rgba(20,20,19,0.06)] transition-all duration-200 hover:border-primary hover:text-primary hover:shadow-[0px_0px_0px_2px_rgba(201,100,66,0.12)] group-hover:opacity-100"
                      onClick={() => addSection(i)}
                      title="在此处插入章节"
                    >
                      <Plus className="size-2.5" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Add section button */}
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ring py-3 font-sans text-[0.875rem] text-stone-gray transition-all duration-300 hover:border-primary hover:bg-ivory hover:text-primary hover:shadow-[0px_0px_0px_1px_rgba(201,100,66,0.15)]"
            onClick={() => addSection(sections.length - 1)}
          >
            <Plus className="size-4" />
            添加章节
          </button>
        </section>

        {/* Right: Settings sidebar */}
        <aside className="hidden w-[288px] shrink-0 md:block">
          <div className="animate-fade-up-delay-1 sticky top-[88px] space-y-8">
            {/* Style picker */}
            <fieldset>
              <legend className="mb-4 font-sans text-[0.625rem] font-medium uppercase tracking-[0.5px] text-stone-gray">
                选择风格
              </legend>
              <div className="space-y-1.5">
                {STYLES.map((s) => {
                  const selected = style === s.id
                  return (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                        selected
                          ? "bg-ivory shadow-[0_0_0_1.5px_var(--primary)]"
                          : "bg-transparent hover:bg-ivory hover:shadow-[0_0_0_1px_rgba(209,207,197,0.45)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="style"
                        className="sr-only"
                        value={s.id}
                        checked={selected}
                        onChange={() => setStyle(s.id)}
                      />
                      <span
                        className={`relative flex size-9 shrink-0 overflow-hidden items-center justify-center rounded-lg transition-shadow duration-200 ${
                          selected
                            ? "ring-2 ring-primary/30"
                            : "ring-1 ring-border-warm"
                        }`}
                        style={{ background: s.preview }}
                      >
                        {s.icon ? (
                          <img 
                            src={s.icon} 
                            alt={s.name} 
                            className={`size-full object-cover transition-transform duration-200 ${selected ? 'scale-110' : 'scale-100'}`}
                          />
                        ) : (
                          <span
                            className="size-2.5 rounded-full transition-transform duration-200"
                            style={{
                              background: s.accent,
                              transform: selected ? 'scale(1.2)' : 'scale(1)',
                            }}
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className={`block truncate font-sans text-[0.8125rem] font-medium transition-colors duration-200 ${selected ? 'text-foreground' : 'text-charcoal-warm'}`}>
                          {s.name}
                        </span>
                        <span className="block truncate font-sans text-[0.75rem] text-stone-gray">
                          {s.description}
                        </span>
                      </span>
                      {selected && (
                        <span className="ml-auto flex size-4 items-center justify-center rounded-full bg-primary">
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="#faf9f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />

            {/* Page count */}
            <fieldset>
              <legend className="mb-4 font-sans text-[0.625rem] font-medium uppercase tracking-[0.5px] text-stone-gray">
                页数
              </legend>
              <div className="flex items-stretch gap-0 overflow-hidden rounded-xl border border-border-warm bg-ivory shadow-[0px_0px_0px_1px_rgba(209,207,197,0.25)]">
                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center rounded-l-xl px-3.5 py-2.5 text-olive-gray transition-all duration-200 hover:bg-border hover:text-foreground active:bg-border-warm disabled:cursor-not-allowed disabled:text-ring disabled:hover:bg-transparent"
                  onClick={() => handlePageChange(-1)}
                  disabled={pageCount <= minPages}
                >
                  <Minus className="size-4" />
                </button>
                <div className="flex flex-1 items-center justify-center border-x border-border">
                  <input
                    type="number"
                    className="w-full min-w-0 bg-transparent text-center font-heading text-[1.5rem] font-medium tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={pageCount}
                    min={minPages}
                    max={50}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val)) {
                        setPageCount(clampPageCount(val, minPages))
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center rounded-r-xl px-3.5 py-2.5 text-olive-gray transition-all duration-200 hover:bg-border hover:text-foreground active:bg-border-warm disabled:cursor-not-allowed disabled:text-ring disabled:hover:bg-transparent"
                  onClick={() => handlePageChange(1)}
                  disabled={pageCount >= 50}
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-center font-sans text-[0.6875rem] text-ring-deep">
                {minPages}–50 页
              </p>
            </fieldset>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />

            {/* Verbosity */}
            <fieldset>
              <legend className="mb-4 font-sans text-[0.625rem] font-medium uppercase tracking-[0.5px] text-stone-gray">
                文字简略
              </legend>
              <div className="space-y-1.5">
                {VERBOSITY_OPTIONS.map((v) => {
                  const selected = verbosity === v.id
                  return (
                    <label
                      key={v.id}
                      className={`flex cursor-pointer flex-col rounded-xl px-3.5 py-3 transition-all duration-200 ${
                        selected
                          ? "bg-ivory shadow-[0_0_0_1.5px_var(--primary)]"
                          : "bg-transparent hover:bg-ivory hover:shadow-[0_0_0_1px_rgba(209,207,197,0.45)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="verbosity"
                        className="sr-only"
                        value={v.id}
                        checked={selected}
                        onChange={() => setVerbosity(v.id)}
                      />
                      <span className="flex items-center justify-between">
                        <span className={`font-sans text-[0.8125rem] font-medium transition-colors duration-200 ${selected ? 'text-foreground' : 'text-charcoal-warm'}`}>
                          {v.label}
                        </span>
                        {selected && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-primary">
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="#faf9f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 font-sans text-[0.75rem] leading-relaxed text-stone-gray">
                        {v.desc}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {/* Generate button */}
            <button
              type="button"
              className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-neutral-900 px-6 py-3.5 font-sans text-[0.9375rem] font-medium text-[#F5F0E8] shadow-lg transition-all duration-300 hover:bg-neutral-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 active:translate-y-px"
              onClick={handleGenerate}
            >
              生成 PPT
            </button>
          </div>
        </aside>
      </div>handleGenerate

      {/* Mobile bottom bar for generate */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 p-4 backdrop-blur-md md:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 font-sans text-[0.9375rem] font-medium text-[#F5F0E8] shadow-lg transition-all hover:bg-neutral-800"
          onClick={handleGenerate}
        >
          生成 PPT
        </button>
      </div>
    </main>
  )
}
