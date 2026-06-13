import { useNavigate } from "react-router-dom"
import{useState}from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Send,
  Download,
  Maximize2,
  AlertCircle,
} from "lucide-react"
import {usePresentationStore} from "@/stores/presentationStore"
import SlideCanvas from "@/components/slideCanvas"
import { exportPresentation } from "@/scratch/exportPresentation"
import {EditorDialog} from "@/pages/EditorDialog"
import { getSlideAspectRatio } from "@/lib/presentationLayout"

export default function Editor() {
  const [slidesIndex, setSlideIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const presentation = usePresentationStore((state) => state.presentation);
  const isLoading = usePresentationStore((state) => state.isLoading);
  const generateError = usePresentationStore((state) => state.generateError);
  const slides = presentation?.slides || [];
  const currentSlide = slides[slidesIndex];
  const selectedElement = currentSlide?.elements?.find(e=>e.id===selectedId);
  const slideAspectRatio = getSlideAspectRatio(presentation?.layout || "16x9");

  const selectSlide = (index: number) => {
    setSlideIndex(index);
    setSelectedId(null);
  };

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
              onClick={exportPresentation}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-sans text-[0.75rem] font-medium text-primary-foreground shadow-[0_0_0_1px_var(--primary)] transition-all duration-200 hover:bg-primary/90 hover:shadow-cta"
            >
              <Download className="size-3" />
              导出 PPTX
            </button>
          </div>
        </div>
      </header>

      {/* Main content: Thumbnails + PPT area + Chat panel */}
      {isLoading ? (
        <div className="flex min-h-0 flex-1 animate-pulse">
          <nav className="hidden w-52 shrink-0 border-r border-border bg-ivory/50 lg:block">
            <div className="space-y-3 px-4 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-lg bg-background p-2 shadow-[0_0_0_1px_rgba(209,207,197,0.35)]">
                  <div className="aspect-[16/9] rounded bg-stone-gray/10" />
                  <div className="mt-2 h-2 w-8 rounded-full bg-stone-gray/10" />
                </div>
              ))}
            </div>
          </nav>

          <section className="flex min-w-0 flex-1 flex-col bg-background">
            <div className="flex flex-1 items-center justify-center p-6 lg:p-8">
              <div className="w-full max-w-[1120px]">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-sans text-[0.8125rem] text-stone-gray">正在生成 PPT...</p>
                  <div className="h-2 w-16 rounded-full bg-stone-gray/10" />
                </div>
                <div
                  className="rounded-2xl border border-border bg-ivory p-8 shadow-[0px_0px_0px_1px_rgba(209,207,197,0.3),0px_12px_40px_rgba(20,20,19,0.06)]"
                  style={{ aspectRatio: slideAspectRatio }}
                >
                  <div className="grid h-full grid-cols-[1fr_0.72fr] gap-8">
                    <div className="flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="h-5 w-2/3 rounded-full bg-stone-gray/15" />
                        <div className="h-3 w-5/6 rounded-full bg-stone-gray/10" />
                        <div className="h-3 w-3/5 rounded-full bg-stone-gray/10" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 rounded-lg bg-background" />
                        <div className="h-20 rounded-lg bg-background" />
                        <div className="h-20 rounded-lg bg-background" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-28 rounded-lg bg-background" />
                      <div className="h-3 w-4/5 rounded-full bg-stone-gray/10" />
                      <div className="h-3 w-3/5 rounded-full bg-stone-gray/10" />
                      <div className="mt-8 h-28 rounded-lg bg-background" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="hidden w-[300px] shrink-0 border-l border-border bg-ivory px-5 py-5 xl:block xl:w-[320px]">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg bg-background p-4">
                  <div className="h-3 w-2/5 rounded-full bg-stone-gray/15" />
                  <div className="mt-4 h-9 rounded bg-stone-gray/10" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : generateError ? (
        <section className="flex min-h-0 flex-1 items-center justify-center px-5">
          <div className="w-full max-w-md rounded-2xl border border-border bg-ivory px-7 py-8 text-center shadow-[0px_0px_0px_1px_rgba(209,207,197,0.25),0px_16px_44px_rgba(20,20,19,0.06)]">
            <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-xl bg-background text-destructive shadow-[0_0_0_1px_rgba(209,207,197,0.5)]">
              <AlertCircle className="size-5" />
            </div>
            <h1 className="font-heading text-[1.5rem] font-medium text-foreground">生成失败</h1>
            <p className="mt-3 font-sans text-[0.875rem] leading-relaxed text-stone-gray">{generateError}</p>
            <button
              type="button"
              className="mt-7 rounded-full bg-neutral-900 px-6 py-3 font-sans text-[0.875rem] font-medium text-[#F5F0E8] transition-all hover:bg-neutral-800"
              onClick={() => navigate("/outline")}
            >
              返回大纲
            </button>
          </div>
        </section>
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* Left: Slide thumbnail strip */}
          <nav className="hidden w-52 shrink-0 flex-col border-r border-border bg-ivory/50 lg:flex">
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => selectSlide(index)}
                    className={`group relative w-full overflow-hidden rounded-lg transition-all duration-200 ${
                      slidesIndex === index
                        ? "shadow-[0_0_0_2px_var(--primary)]"
                        : "shadow-[0_0_0_1px_rgba(209,207,197,0.35)] hover:shadow-[0_0_0_1px_rgba(209,207,197,0.7)]"
                    }`}
                  >
                    <div className="pointer-events-none flex w-full items-center justify-center bg-ivory" style={{ aspectRatio: slideAspectRatio }}>
                      <SlideCanvas slide={slide} layout={presentation?.layout}/>
                    </div>  
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Center: PPT display area */}
          <section onClick={() => setSelectedId?.(null)}  className="relative flex min-w-0 flex-1 flex-col">
            {/* Slide canvas */}
            <div className="flex flex-1 items-center justify-center p-6 lg:p-8">
              <div className="animate-scale-in relative flex w-full max-w-[1120px] flex-col items-center justify-center rounded-2xl border border-border bg-ivory shadow-[0px_0px_0px_1px_rgba(209,207,197,0.3),0px_12px_40px_rgba(20,20,19,0.06)]" style={{ aspectRatio: slideAspectRatio }}>
                {currentSlide && <SlideCanvas slide={currentSlide} layout={presentation?.layout} setSelectedId={setSelectedId} selectedId={selectedId} />}
              </div>
            </div>

            {/* Bottom slide navigator */}
            <div className="shrink-0 border-t border-border bg-background">
              <div className="mx-auto flex h-11 max-w-[1120px] items-center justify-center gap-4 px-5">
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-lg text-warm-silver transition-all duration-200 hover:bg-border-warm hover:text-charcoal-warm"
                  onClick={()=>selectSlide(slidesIndex-1)}
                  disabled = {slidesIndex===0}
                >
                  <ChevronLeft className="size-4" />
                </button>

                <span className="min-w-[64px] text-center font-sans text-[0.75rem] tabular-nums text-stone-gray">
                  <span className="font-medium text-foreground">{slidesIndex+1}</span>
                  <span className="mx-1 text-ring">/</span>
                  <span>{slides.length}</span>
                </span>

                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-lg text-warm-silver transition-all duration-200 hover:bg-border-warm hover:text-charcoal-warm"
                  onClick={()=>selectSlide(slidesIndex+1)}
                  disabled ={slidesIndex ===slides.length-1}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Right: Properties panel */}
          <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-ivory xl:w-[320px]">
            {/* Properties area */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <EditorDialog selectedElement={selectedElement} slideId={currentSlide?.id} />
            </div>

            {/* AI Chat input bar (bottom) */}
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
      )}
    </main>
  )
}
