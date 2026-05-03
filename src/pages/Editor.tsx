import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Send,
  Download,
  Maximize2,
} from "lucide-react"
import SlideCanvas from "@/components/slideCanvas"
import { testExport } from "@/scratch/testExport"

const MOCK_SLIDES = Array.from({ length: 12 }, (_, i) => i + 1)

export default function Editor() {
  const navigate = useNavigate()

  return (
    <main className="flex h-screen flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-12 items-center gap-3 px-5 sm:px-6">
          {/* Left: back */}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-sans text-[0.8125rem] text-olive-gray transition-all duration-200 hover:bg-border-warm hover:text-foreground"
            onClick={() => navigate("/outline")}
          >
            <ArrowLeft className="size-4" />
            返回大纲
          </button>
          <span className="text-ring">/</span>
          <span className="truncate font-sans text-[0.8125rem] font-medium text-stone-gray">
            预览与编辑
          </span>

          {/* Right: actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-ivory px-3 py-1.5 font-sans text-[0.75rem] font-medium text-olive-gray shadow-[0_0_0_1px_rgba(209,207,197,0.2)] transition-all duration-200 hover:bg-white hover:text-foreground hover:shadow-[0px_0px_0px_1px_rgba(209,207,197,0.45)]"
            >
              <Maximize2 className="size-3" />
              演示
            </button>
            <button
              type="button"
              onClick={testExport}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-sans text-[0.75rem] font-medium text-primary-foreground shadow-[0_0_0_1px_var(--primary)] transition-all duration-200 hover:bg-primary/90 hover:shadow-cta"
            >
              <Download className="size-3" />
              导出 PPTX
            </button>
          </div>
        </div>
      </header>

      {/* Main content: Thumbnails + PPT area + Chat panel */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Slide thumbnail strip */}
        <nav className="hidden w-[88px] shrink-0 flex-col border-r border-border bg-ivory/50 lg:flex">
          <div className="flex-1 overflow-y-auto px-2.5 py-3">
            <div className="space-y-2">
              {MOCK_SLIDES.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`group relative w-full rounded-lg transition-all duration-200 ${
                    n === 1
                      ? "shadow-[0_0_0_2px_var(--primary)]"
                      : "shadow-[0_0_0_1px_rgba(209,207,197,0.35)] hover:shadow-[0_0_0_1px_rgba(209,207,197,0.7)]"
                  }`}
                >
                  {/* Slide thumbnail placeholder */}
                  <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg bg-ivory">
                    <span className={`font-sans text-[0.5625rem] tabular-nums ${n === 1 ? 'font-semibold text-primary' : 'text-warm-silver'}`}>
                      {n}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Center: PPT display area */}
        <section className="relative flex min-w-0 flex-1 flex-col">
          {/* Slide canvas */}
          <div className="flex flex-1 items-center justify-center p-6 lg:p-8">
            <div className="animate-scale-in relative flex aspect-[16/9] w-full max-w-[960px] flex-col items-center justify-center rounded-2xl border border-border bg-ivory shadow-[0px_0px_0px_1px_rgba(209,207,197,0.3),0px_12px_40px_rgba(20,20,19,0.06)]">
              <SlideCanvas/>
            </div>
          </div>

          {/* Bottom slide navigator */}
          <div className="shrink-0 border-t border-border bg-background">
            <div className="mx-auto flex h-11 max-w-[960px] items-center justify-center gap-4 px-5">
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg text-warm-silver transition-all duration-200 hover:bg-border-warm hover:text-charcoal-warm"
                disabled
              >
                <ChevronLeft className="size-4" />
              </button>

              <span className="min-w-[64px] text-center font-sans text-[0.75rem] tabular-nums text-stone-gray">
                <span className="font-medium text-foreground">1</span>
                <span className="mx-1 text-ring">/</span>
                <span>12</span>
              </span>

              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg text-warm-silver transition-all duration-200 hover:bg-border-warm hover:text-charcoal-warm"
                disabled
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Right: AI Chat panel */}
        <aside className="flex w-[340px] shrink-0 flex-col border-l border-border bg-ivory xl:w-[380px]">
          {/* Chat header */}
          <div className="shrink-0 border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div>
                <p className="font-heading text-[0.875rem] font-medium leading-tight text-foreground">
                  AI 助手
                </p>
                <p className="font-sans text-[0.6875rem] text-warm-silver">
                  协作编辑 PPT
                </p>
              </div>
            </div>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="flex flex-col items-center justify-center pt-16">
              {/* Empty state illustration */}
              <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-background ring-1 ring-border-warm">
                <Send className="size-5 -rotate-45 text-ring" />
              </div>
              <p className="font-heading text-[0.9375rem] font-medium text-charcoal-warm">
                开始协作
              </p>
              <p className="mt-1.5 max-w-[200px] text-center font-sans text-[0.8125rem] leading-relaxed text-warm-silver">
                发送消息，让 AI 帮你修改和完善幻灯片
              </p>

              {/* Quick action chips */}
              <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                {["优化排版", "精简文字", "添加数据图", "调整配色"].map(
                  (label) => (
                    <button
                      key={label}
                      type="button"
                      className="rounded-lg border border-border bg-ivory px-2.5 py-1 font-sans text-[0.6875rem] text-stone-gray shadow-[0px_0px_0px_1px_rgba(209,207,197,0.15)] transition-all duration-200 hover:border-border-warm hover:text-olive-gray hover:shadow-[0px_0px_0px_1px_rgba(209,207,197,0.4)]"
                      disabled
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Chat input bar */}
          <div className="shrink-0 border-t border-border p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2 shadow-[0_0_0_1px_rgba(209,207,197,0.2)] transition-shadow duration-200 focus-within:border-border-warm focus-within:shadow-[0px_0px_0px_1px_rgba(209,207,197,0.5)]">
              <input
                type="text"
                className="min-w-0 flex-1 bg-transparent px-2 font-sans text-[0.8125rem] text-foreground outline-none placeholder:text-ring-deep"
                placeholder="输入消息..."
                disabled
              />
              <button
                type="button"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-border-warm text-ring-deep transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:hover:bg-border-warm disabled:hover:text-ring-deep"
                disabled
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
