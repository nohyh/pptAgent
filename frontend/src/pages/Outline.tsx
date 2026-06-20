import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  ChevronDown,
  Check,
} from "lucide-react"
import { MAX_OUTLINE_SECTIONS, MAX_PAGE_COUNT, useEditorStore } from "@/stores/editorStore"
import { usePresentationStore } from "@/stores/presentationStore"
import { useAuthStore } from "@/stores/authStore"

const generatePresentation = usePresentationStore.getState().generatePresentation
const STYLES = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "极简 现代 ",
    preview: "#f5edefff",
    accent: "#6642c9ff",
    icon: "/minimalist.png"
  },
  {
    id: "claude",
    name: "Claude",
    description: "暖色 编辑 ",
    preview: "#f6efe4",
    accent: "#b15f38",
    icon: "/anthropic.png"
  }
]

function getMinPageCount(sectionCount: number): number {
  return Math.min(MAX_PAGE_COUNT, sectionCount * 2 + 2)
}

function PageCountSelect({
  value,
  options,
  onChange,
}: {
  value: number
  options: number[]
  onChange: (value: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null
        if (!event.currentTarget.contains(nextTarget)) setOpen(false)
      }}
    >
      <button
        type="button"
        className="flex h-9 w-full items-center justify-between rounded-lg border border-border-warm bg-ivory px-3 font-sans text-[0.8125rem] font-medium text-charcoal-warm shadow-[0_0_0_1px_rgba(209,207,197,0.2)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-blue"
        aria-expanded={open}
        aria-label="选择页数"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{value} 页</span>
        <ChevronDown className={`size-3.5 text-stone-gray transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-52 overflow-auto rounded-lg border border-border-warm bg-ivory p-1 shadow-[0_12px_30px_rgba(20,20,19,0.1),0_0_0_1px_rgba(209,207,197,0.35)]">
          {options.map((option) => {
            const selected = option === value
            return (
              <button
                key={option}
                type="button"
                className={`flex h-8 w-full items-center justify-between rounded-md px-2.5 font-sans text-[0.8125rem] transition-colors ${
                  selected
                    ? "bg-warm-sand text-foreground"
                    : "text-olive-gray hover:bg-background hover:text-foreground"
                }`}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                <span>{option} 页</span>
                {selected && <Check className="size-3.5 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Outline() {
  const navigate = useNavigate()
  const title = useEditorStore((s) => s.title)
  const sections = useEditorStore((s) => s.sections)
  const style = useEditorStore((s) => s.style)
  const pageCount = useEditorStore((s) => s.pageCount)
  const setTitle = useEditorStore((s) => s.setTitle)
  const updateSection = useEditorStore((s) => s.updateSection)
  const addSection = useEditorStore((s) => s.addSection)
  const removeSection = useEditorStore((s) => s.removeSection)
  const setStyle = useEditorStore((s) => s.setStyle)
  const setPageCount = useEditorStore((s) => s.setPageCount)
  const isGeneratingOutline = useEditorStore((s) => s.isGeneratingOutline)
  const outlineError = useEditorStore((s) => s.outlineError)
  const isGeneratingPresentation = usePresentationStore((s) => s.isLoading)
  const profile = useAuthStore((s) => s.profile)

  const minPages = getMinPageCount(sections.length)
  const pageOptions = Array.from(
    { length: Math.max(0, MAX_PAGE_COUNT - minPages + 1) },
    (_, index) => minPages + index,
  )
  const canAddSection = sections.length < MAX_OUTLINE_SECTIONS
  const hasNoQuota = Boolean(profile && !profile.is_unlimited_quota && profile.generation_quota <= 0)

  useEffect(() => {
    if (pageCount < minPages) {
      setPageCount(minPages)
    }
  }, [minPages, pageCount, setPageCount])

  const handleGenerate = async () => {
    if (isGeneratingPresentation || hasNoQuota) return
    // 先触发生成，这会同步把 isLoading 设为 true
    const generatePromise = generatePresentation();
    // 然后再跳转，这样跳过去瞬间 isLoading 就已经是 true，完美无缝衔接骨架屏
    navigate('/editor');
    await generatePromise;
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
        {isGeneratingOutline ? (
          <div className="flex w-full gap-10 lg:gap-14">
            <section className="min-w-0 flex-1">
              <div className="mb-10">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-2.5 rounded-full bg-primary loading-dot" />
                  <span className="font-sans text-[0.75rem] font-medium text-primary">
                    正在生成大纲
                  </span>
                </div>
                <div className="mb-3 h-3 w-20 rounded-full skeleton-shimmer" />
                <div className="h-[52px] w-3/4 rounded-xl skeleton-shimmer" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl border border-border bg-ivory px-5 py-7 shadow-[0_0_0_1px_rgba(209,207,197,0.2)]">
                    <div className="flex items-start gap-3">
                      <div className="size-7 shrink-0 rounded-lg skeleton-shimmer" />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="h-4 w-1/3 rounded-full skeleton-shimmer" />
                        <div className="h-3 w-full rounded-full skeleton-shimmer" />
                        <div className="h-3 w-4/5 rounded-full skeleton-shimmer" />
                        <div className="h-3 w-2/3 rounded-full skeleton-shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ring py-3">
                <div className="size-4 rounded-full skeleton-shimmer" />
                <div className="h-3 w-16 rounded-full skeleton-shimmer" />
              </div>
            </section>

            <aside className="hidden w-[288px] shrink-0 md:block">
              <div className="sticky top-[88px] space-y-8">
                <fieldset>
                  <div className="mb-4 h-3 w-16 rounded-full skeleton-shimmer" />
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 shadow-[0_0_0_1px_rgba(209,207,197,0.45)]">
                    <div className="size-9 shrink-0 rounded-lg skeleton-shimmer" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-20 rounded-full skeleton-shimmer" />
                      <div className="h-2.5 w-24 rounded-full skeleton-shimmer" />
                    </div>
                    <div className="size-4 rounded-full skeleton-shimmer" />
                  </div>
                </fieldset>
                <div className="h-px bg-border-warm" />
                <fieldset>
                  <div className="mb-4 h-3 w-10 rounded-full skeleton-shimmer" />
                  <div className="h-9 rounded-lg skeleton-shimmer" />
                  <div className="mx-auto mt-2 h-2.5 w-28 rounded-full skeleton-shimmer" />
                </fieldset>
                <div className="h-px bg-border-warm" />
                <div className="h-11 rounded-full bg-neutral-900/80 shadow-lg">
                  <div className="mx-auto h-full w-20 rounded-full skeleton-shimmer opacity-30" />
                </div>
              </div>
            </aside>
          </div>
        ) : outlineError ? (
          <section className="flex min-h-[calc(100vh-9rem)] w-full items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-border bg-ivory px-7 py-8 text-center shadow-[0px_0px_0px_1px_rgba(209,207,197,0.25),0px_16px_44px_rgba(20,20,19,0.06)]">
              <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-xl bg-background text-destructive shadow-[0_0_0_1px_rgba(209,207,197,0.5)]">
                <AlertCircle className="size-5" />
              </div>
              <h1 className="font-heading text-[1.5rem] font-medium text-foreground">生成失败</h1>
              <p className="mt-3 font-sans text-[0.875rem] leading-relaxed text-stone-gray">{outlineError}</p>
              <button
                type="button"
                className="mt-7 rounded-full bg-neutral-900 px-6 py-3 font-sans text-[0.875rem] font-medium text-[#F5F0E8] transition-all hover:bg-neutral-800"
                onClick={() => navigate("/")}
              >
                返回首页
              </button>
            </div>
          </section>
        ) : (
          <>
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
                      className="flex size-5 items-center justify-center rounded-full border border-border-warm bg-ivory text-ring-deep opacity-0 shadow-[0px_2px_8px_rgba(20,20,19,0.06)] transition-all duration-200 hover:border-primary hover:text-primary hover:shadow-[0px_0px_0px_2px_rgba(201,100,66,0.12)] disabled:cursor-not-allowed disabled:opacity-20 group-hover:opacity-100"
                      onClick={() => addSection(i)}
                      disabled={!canAddSection}
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
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ring py-3 font-sans text-[0.875rem] text-stone-gray transition-all duration-300 hover:border-primary hover:bg-ivory hover:text-primary hover:shadow-[0px_0px_0px_1px_rgba(201,100,66,0.15)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-ring disabled:hover:bg-transparent disabled:hover:text-stone-gray disabled:hover:shadow-none"
            onClick={() => addSection(sections.length - 1)}
            disabled={!canAddSection}
          >
            <Plus className="size-4" />
            {canAddSection ? "添加章节" : "最多 10 个章节"}
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
              <PageCountSelect
                value={Math.max(pageCount, minPages)}
                options={pageOptions}
                onChange={setPageCount}
              />
              <p className="mt-2 text-center font-sans text-[0.6875rem] text-ring-deep">
                {sections.length} 个章节，范围 {minPages}–{MAX_PAGE_COUNT} 页
              </p>
            </fieldset>

            {/* Generate button */}
            <button
              type="button"
              className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-neutral-900 px-6 py-3.5 font-sans text-[0.9375rem] font-medium text-[#F5F0E8] shadow-lg transition-all duration-300 hover:bg-neutral-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 active:translate-y-px"
              onClick={handleGenerate}
              disabled={isGeneratingPresentation || hasNoQuota}
            >
              {hasNoQuota ? "生成额度不足" : "生成 PPT"}
            </button>
            {hasNoQuota && (
              <p className="mt-2 text-center font-sans text-[0.75rem] text-destructive">
                额度已用完，可继续编辑大纲和历史项目。
              </p>
            )}
          </div>
        </aside>
          </>
        )}
      </div>

      {/* Mobile bottom bar for generate */}
      {!isGeneratingOutline && !outlineError && (
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 p-4 backdrop-blur-md md:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 font-sans text-[0.9375rem] font-medium text-[#F5F0E8] shadow-lg transition-all hover:bg-neutral-800"
          onClick={handleGenerate}
          disabled={isGeneratingPresentation || hasNoQuota}
        >
          {hasNoQuota ? "生成额度不足" : "生成 PPT"}
        </button>
      </div>
      )}
    </main>
  )
}
