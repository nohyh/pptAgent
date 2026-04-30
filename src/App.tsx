import { useState } from "react"
import { ArrowUp } from "lucide-react"

export default function App() {
  const [prompt, setPrompt] = useState("")
  const hasPrompt = prompt.trim().length > 0

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col justify-center px-5 py-12 sm:px-8 lg:px-14">
        <div className="w-full max-w-[1030px]">
          <p className="mb-3 font-sans text-[clamp(1.45rem,2.8vw,2rem)] leading-none text-[#141413]">
            你好，Ice
          </p>
          <h1 className="font-heading text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.08] tracking-normal text-[#141413]">
            今天想做什么PPT?
          </h1>

          <div className="relative mt-10 rounded-[32px] border border-[#f0eee6] bg-[#fffefa] p-5 shadow-[0_0_0_1px_rgba(209,207,197,0.72),0_18px_48px_rgba(20,20,19,0.08)] sm:p-7">
            <label htmlFor="presentation-prompt" className="sr-only">
              Presentation prompt
            </label>
            <textarea
              id="presentation-prompt"
              className="min-h-[104px] w-full resize-none bg-transparent pb-14 pr-14 font-sans text-[1.35rem] leading-relaxed text-[#141413] outline-none placeholder:text-[#87867f]"
              placeholder="描述你想要的PPT"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={2}
            />

            <button
              type="button"
              className={`absolute bottom-5 right-5 flex size-11 items-center justify-center rounded-xl bg-[#c96442] text-[#faf9f5] transition-[opacity,transform,box-shadow,background-color] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:bg-[#b85a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3898ec] motion-reduce:transition-none sm:bottom-7 sm:right-7 ${
                hasPrompt
                  ? "translate-y-0 scale-100 opacity-100 shadow-[0_0_0_1px_#c96442,0_8px_20px_rgba(201,100,66,0.18)] duration-200"
                  : "pointer-events-none translate-y-1 scale-[0.92] opacity-0 shadow-[0_0_0_1px_rgba(201,100,66,0)] duration-150"
              }`}
              aria-hidden={!hasPrompt}
              aria-label="提交提示词"
              disabled={!hasPrompt}
              title="提交提示词"
            >
              <ArrowUp className="size-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
