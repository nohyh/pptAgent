import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUp } from "lucide-react"
import { useEditorStore } from "@/stores/editorStore"
import { useAuthStore } from "@/stores/authStore"

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const generateOutline = useEditorStore((s) => s.generateOutline)
  const isGeneratingOutline = useEditorStore((s) => s.isGeneratingOutline)
  const user = useAuthStore((s) => s.user)
  const openAuthDialog = useAuthStore((s) => s.openAuthDialog)
  const navigate = useNavigate()
  const hasPrompt = prompt.trim().length > 0

  const handleSubmit = async () => {
    //防止连点
    if (!hasPrompt || isGeneratingOutline) return
    if (!user) {
      openAuthDialog()
      return
    }
    const generatePromise = generateOutline(prompt)
    navigate("/outline")
    await generatePromise
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* 微妙的背景装饰图案 */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 0.5px, transparent 0)`,
          backgroundSize: '48px 48px',
        }}
      />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1180px] flex-col justify-center px-5 py-12 sm:px-8 lg:px-14">
        <div className="relative w-full max-w-[1030px]">
          {/* 问候语 */}
          <p className="animate-fade-up-delay-1 mb-3 font-sans text-[clamp(1.45rem,2.8vw,2rem)] leading-none text-olive-gray">
            你好，{user?.email || "访客"}
          </p>

          {/* 主标题 — Anthropic 衬线字体风格 */}
          <h1 className="animate-fade-up-delay-2 font-heading text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.08] tracking-normal text-foreground">
            今天想做什么PPT?
          </h1>

          {/* 自行车线条小人动画 */}
          <div className="pointer-events-none absolute -top-6 right-12 hidden animate-fade-up-delay-3 opacity-[0.38] lg:block xl:right-20">
            <svg
              viewBox="0 0 200 155"
              className="h-[168px] w-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* ── 踏板起伏包装器 — 骑行者的重心偏移带动整个自行车起伏 ── */}
              <g>
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-1.2;0,0.3;0,0" keyTimes="0;0.3;0.7;1" dur="0.8s" repeatCount="indefinite" />

                {/* ── 后轮 ── */}
                <g>
                  <circle cx="52" cy="112" r="22" stroke="#87867f" strokeWidth="1.4" />
                  <g>
                    <line x1="52" y1="90" x2="52" y2="134" stroke="#b0aea5" strokeWidth="0.6" />
                    <line x1="30" y1="112" x2="74" y2="112" stroke="#b0aea5" strokeWidth="0.6" />
                    <line x1="36" y1="96" x2="68" y2="128" stroke="#b0aea5" strokeWidth="0.6" />
                    <line x1="68" y1="96" x2="36" y2="128" stroke="#b0aea5" strokeWidth="0.6" />
                    <animateTransform attributeName="transform" type="rotate" from="0 52 112" to="360 52 112" dur="1.6s" repeatCount="indefinite" />
                  </g>
                  <circle cx="52" cy="112" r="2.5" fill="#87867f" />
                </g>

                {/* ── 前轮 ── */}
                <g>
                  <circle cx="148" cy="112" r="22" stroke="#87867f" strokeWidth="1.4" />
                  <g>
                    <line x1="148" y1="90" x2="148" y2="134" stroke="#b0aea5" strokeWidth="0.6" />
                    <line x1="126" y1="112" x2="170" y2="112" stroke="#b0aea5" strokeWidth="0.6" />
                    <line x1="132" y1="96" x2="164" y2="128" stroke="#b0aea5" strokeWidth="0.6" />
                    <line x1="164" y1="96" x2="132" y2="128" stroke="#b0aea5" strokeWidth="0.6" />
                    <animateTransform attributeName="transform" type="rotate" from="0 148 112" to="360 148 112" dur="1.6s" repeatCount="indefinite" />
                  </g>
                  <circle cx="148" cy="112" r="2.5" fill="#87867f" />
                </g>

                {/* ── 自行车车架 ── */}
                <path
                  d="M62,62 L80,98 L52,112 M62,62 L52,112 M62,62 L132,58 L80,98 M132,58 L148,112"
                  stroke="#5e5d59"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 车座 */}
                <line x1="56" y1="61" x2="68" y2="61" stroke="#5e5d59" strokeWidth="2.5" strokeLinecap="round" />
                {/* 车把 */}
                <line x1="130" y1="53" x2="137" y2="56" stroke="#5e5d59" strokeWidth="2" strokeLinecap="round" />
                <line x1="130" y1="53" x2="128" y2="48" stroke="#5e5d59" strokeWidth="2" strokeLinecap="round" />

                {/* ── 曲柄脚踏板 (旋转) ── */}
                <g>
                  <line x1="68" y1="98" x2="92" y2="98" stroke="#5e5d59" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="68" cy="98" r="2" fill="#c96442" />
                  <circle cx="92" cy="98" r="2" fill="#c96442" />
                  <animateTransform attributeName="transform" type="rotate" from="0 80 98" to="360 80 98" dur="1.6s" repeatCount="indefinite" />
                </g>

                {/* ── 骑行者：头部 (伴有轻微起伏) ── */}
                <circle cx="72" cy="28" r="8" stroke="#5e5d59" strokeWidth="1.5" fill="#f5f4ed">
                  <animate attributeName="cy" values="28;26.5;28;27.2;28" keyTimes="0;0.25;0.5;0.75;1" dur="0.8s" repeatCount="indefinite" />
                </circle>

                {/* ── 骑行者：身体 (伴有起伏，前倾) ── */}
                <line x1="72" y1="36" x2="64" y2="63" stroke="#5e5d59" strokeWidth="1.5" strokeLinecap="round">
                  <animate attributeName="y1" values="36;34.5;36;35.2;36" keyTimes="0;0.25;0.5;0.75;1" dur="0.8s" repeatCount="indefinite" />
                </line>

                {/* ── 骑行者：手臂 (伴有起伏) ── */}
                <path d="M68,46 Q95,44 130,54" stroke="#5e5d59" strokeWidth="1.3" strokeLinecap="round" fill="none">
                  <animate attributeName="d" values="M68,46 Q95,44 130,54;M68,44.5 Q95,42.5 130,54;M68,46 Q95,44 130,54;M68,45.2 Q95,43.2 130,54;M68,46 Q95,44 130,54" keyTimes="0;0.25;0.5;0.75;1" dur="0.8s" repeatCount="indefinite" />
                </path>

                {/* ── 骑行者：腿 1 (前侧，具有发力感) ── */}
                {/* 关键帧时间：下踩动作较快 (0→0.2)，底部停留 (0.2→0.35)，上抬动作较慢 (0.35→1) */}
                <line x1="64" y1="65" x2="92" y2="98" stroke="#5e5d59" strokeWidth="1.5" strokeLinecap="round">
                  <animate attributeName="x2" values="92;80;68;74;80;86;92" keyTimes="0;0.15;0.35;0.5;0.65;0.82;1" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="y2" values="98;110;98;89;86;89;98" keyTimes="0;0.15;0.35;0.5;0.65;0.82;1" dur="1.6s" repeatCount="indefinite" />
                </line>

                {/* ── 骑行者：腿 2 (后侧，具有发力感，180° 相位差) ── */}
                <line x1="64" y1="65" x2="68" y2="98" stroke="#5e5d59" strokeWidth="1.5" strokeLinecap="round" opacity="0.55">
                  <animate attributeName="x2" values="68;80;92;86;80;74;68" keyTimes="0;0.15;0.35;0.5;0.65;0.82;1" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="y2" values="98;86;98;107;110;107;98" keyTimes="0;0.15;0.35;0.5;0.65;0.82;1" dur="1.6s" repeatCount="indefinite" />
                </line>
              </g>

              {/* ── 地面线条 ── */}
              <line x1="18" y1="138" x2="182" y2="138" stroke="#d1cfc5" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="3 5" />
            </svg>
          </div>

          {/* 输入框容器 */}
          <div className="animate-fade-up-delay-3 shadow-input-container relative mt-10 rounded-[32px] border border-border bg-ivory p-5 transition-shadow duration-300 focus-within:shadow-[0_0_0_1px_rgba(201,100,66,0.4),0_18px_48px_rgba(20,20,19,0.1)] sm:p-7">
            <label htmlFor="presentation-prompt" className="sr-only">
              Presentation prompt
            </label>
            <textarea
              id="presentation-prompt"
              className="min-h-[104px] w-full resize-none bg-transparent pb-14 pr-14 font-sans text-[1.2rem] leading-[1.6] text-foreground outline-none placeholder:text-warm-silver sm:text-[1.35rem]"
              placeholder="描述你想要的PPT — 主题、内容、受众..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  handleSubmit()
                }
              }}
              rows={2}
            />

            {/* 提交按钮 */}
            <button
              type="button"
              className={`absolute bottom-5 right-5 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-blue motion-reduce:transition-none sm:bottom-7 sm:right-7 ${
                hasPrompt
                  ? "shadow-cta translate-y-0 scale-100 opacity-100 duration-300"
                  : "pointer-events-none translate-y-1.5 scale-[0.88] opacity-0 shadow-[0_0_0_1px_rgba(201,100,66,0)] duration-200"
              }`}
              aria-hidden={!hasPrompt}
              aria-label="提交提示词"
              disabled={!hasPrompt || isGeneratingOutline}
              title="提交提示词"
              onClick={handleSubmit}
            >
              <ArrowUp className="size-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
