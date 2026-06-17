import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Undo2,
  Redo2,
} from "lucide-react"
import {usePresentationStore} from "@/stores/presentationStore"
import SlideCanvas from "@/components/slideCanvas"
import { exportPresentation } from "@/scratch/exportPresentation"
import {EditorDialog} from "@/pages/EditorDialog"
import { getSlideAspectRatio } from "@/lib/presentationLayout"

export default function Editor() {
  const [slidesIndex, setSlideIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const presentation = usePresentationStore((state) => state.presentation);
  const isLoading = usePresentationStore((state) => state.isLoading);
  const generateError = usePresentationStore((state) => state.generateError);
  const deleteElement = usePresentationStore((state) => state.deleteElement);
  const undo = usePresentationStore((state) => state.undo);
  const redo = usePresentationStore((state) => state.redo);
  const clearHistory = usePresentationStore((state) => state.clearHistory);
  const canUndo = usePresentationStore((state) => state.history.length > 0);
  const canRedo = usePresentationStore((state) => state.future.length > 0);
  const slides = presentation?.slides || [];
  const currentSlide = slides[slidesIndex];
  const selectedElement = currentSlide?.elements?.find(e=>e.id===selectedId);
  const slideAspectRatio = getSlideAspectRatio(presentation?.layout || "16x9");

  const selectSlide = (index: number) => {
    if (index === slidesIndex) return;
    clearHistory();
    setSlideIndex(index);
    setSelectedId(null);
  };

  const handleExport = async () => {
    setExportStatus("正在导出...");
    try {
      const fileName = await exportPresentation();
      setExportStatus(fileName ? "导出成功" : "没有可导出的 PPT");
    } catch (error) {
      console.error("导出失败", error);
      setExportStatus("导出失败");
    }
  };

  useEffect(() => {
    const isEditingTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      if (!element) return false;
      return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      const commandKey = event.ctrlKey || event.metaKey;

      if (commandKey && key === "z") {
        event.preventDefault();
        if (!currentSlide?.id) return;
        if (event.shiftKey) {
          redo(currentSlide.id);
        } else {
          undo(currentSlide.id);
        }
        return;
      }

      if (commandKey && key === "y") {
        event.preventDefault();
        if (currentSlide?.id) {
          redo(currentSlide.id);
        }
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedId && currentSlide?.id) {
        event.preventDefault();
        deleteElement(currentSlide.id, selectedId);
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide?.id, deleteElement, redo, selectedId, undo]);

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
            {exportStatus && (
              <span className="font-sans text-[0.75rem] text-stone-gray">{exportStatus}</span>
            )}
            <button
              type="button"
              onClick={() => currentSlide?.id && undo(currentSlide.id)}
              disabled={!canUndo || !currentSlide?.id}
              title="撤销"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-ivory text-olive-gray shadow-[0_0_0_1px_rgba(209,207,197,0.2)] transition-all duration-200 hover:bg-white hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => currentSlide?.id && redo(currentSlide.id)}
              disabled={!canRedo || !currentSlide?.id}
              title="重做"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-ivory text-olive-gray shadow-[0_0_0_1px_rgba(209,207,197,0.2)] transition-all duration-200 hover:bg-white hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Redo2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!presentation}
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
        <div className="flex min-h-0 flex-1">
          <nav className="hidden w-52 shrink-0 flex-col border-r border-border bg-ivory/50 lg:flex">
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`group relative w-full overflow-hidden rounded-lg transition-all duration-200 ${
                      i === 1
                        ? "shadow-[0_0_0_2px_var(--primary)]"
                        : "shadow-[0_0_0_1px_rgba(209,207,197,0.35)]"
                    }`}
                  >
                    <div className="pointer-events-none flex w-full items-center justify-center bg-ivory" style={{ aspectRatio: slideAspectRatio }}>
                      <div className="h-full w-full p-3">
                        <div className="mb-2 h-2.5 w-2/3 rounded-full skeleton-shimmer" />
                        <div className="h-2 w-4/5 rounded-full skeleton-shimmer" />
                        <div className="mt-4 h-8 rounded skeleton-shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </nav>

          <section className="relative flex min-w-0 flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center p-6 lg:p-8">
              <div
                className="relative flex w-full max-w-[1120px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-ivory shadow-[0px_0px_0px_1px_rgba(209,207,197,0.3),0px_12px_40px_rgba(20,20,19,0.06)]"
                style={{ aspectRatio: slideAspectRatio }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(232,230,220,0.35) 1px, transparent 1px), linear-gradient(rgba(232,230,220,0.35) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                  }}
                  aria-hidden="true"
                />
                <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-border-warm bg-ivory/85 px-3 py-1.5 shadow-[0_10px_26px_rgba(20,20,19,0.08)] backdrop-blur-sm">
                  <span className="flex size-2.5 rounded-full bg-primary loading-dot" />
                  <span className="font-sans text-[0.75rem] font-medium text-primary">
                    正在生成 PPT
                  </span>
                </div>
                <div
                  className="relative grid h-full w-full grid-cols-[1fr_0.72fr] gap-8 p-8"
                >
                  <div className="flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="h-7 w-2/3 rounded-full skeleton-shimmer" />
                      <div className="h-3 w-5/6 rounded-full skeleton-shimmer" />
                      <div className="h-3 w-3/5 rounded-full skeleton-shimmer" />
                      <div className="h-3 w-4/5 rounded-full skeleton-shimmer" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-20 rounded-lg skeleton-shimmer" />
                      <div className="h-20 rounded-lg skeleton-shimmer" />
                      <div className="h-20 rounded-lg skeleton-shimmer" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-28 rounded-lg skeleton-shimmer" />
                    <div className="h-3 w-4/5 rounded-full skeleton-shimmer" />
                    <div className="h-3 w-3/5 rounded-full skeleton-shimmer" />
                    <div className="mt-8 h-28 rounded-lg skeleton-shimmer" />
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-background">
              <div className="mx-auto flex h-11 max-w-[1120px] items-center justify-center gap-4 px-5">
                <div className="size-7 rounded-lg skeleton-shimmer" />
                <div className="h-3 w-16 rounded-full skeleton-shimmer" />
                <div className="size-7 rounded-lg skeleton-shimmer" />
              </div>
            </div>
          </section>

          <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-ivory xl:w-[320px]">
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <div className="flex flex-col items-center justify-center px-5 py-10">
                <div className="mb-3 size-10 rounded-xl skeleton-shimmer" />
                <div className="h-4 w-20 rounded-full skeleton-shimmer" />
                <div className="mt-3 h-3 w-32 rounded-full skeleton-shimmer" />
                <div className="mt-2 h-3 w-24 rounded-full skeleton-shimmer" />
              </div>
              <div className="mt-4 space-y-5">
                <div className="space-y-3">
                  <div className="h-3 w-24 rounded-full skeleton-shimmer" />
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 rounded-lg skeleton-shimmer" />
                    ))}
                  </div>
                </div>
                <div className="border-t border-border" />
                <div className="space-y-3">
                  <div className="h-3 w-20 rounded-full skeleton-shimmer" />
                  <div className="h-20 rounded-lg skeleton-shimmer" />
                </div>
              </div>
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
      ) : !presentation ? (
        <section className="flex min-h-0 flex-1 items-center justify-center px-5">
          <div className="w-full max-w-md rounded-2xl border border-border bg-ivory px-7 py-8 text-center shadow-[0px_0px_0px_1px_rgba(209,207,197,0.25),0px_16px_44px_rgba(20,20,19,0.06)]">
            <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-xl bg-background text-primary shadow-[0_0_0_1px_rgba(209,207,197,0.5)]">
              <AlertCircle className="size-5" />
            </div>
            <h1 className="font-heading text-[1.5rem] font-medium text-foreground">暂无演示文稿</h1>
            <p className="mt-3 font-sans text-[0.875rem] leading-relaxed text-stone-gray">
              请先生成大纲并创建 PPT。
            </p>
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
          </aside>
        </div>
      )}
    </main>
  )
}
