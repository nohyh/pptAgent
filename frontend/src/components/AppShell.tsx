import { useState, type CSSProperties, type ReactNode, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PanelLeftClose, UserRound, Trash2 } from "lucide-react"
import {usePresentationStore} from "@/stores/presentationStore"
const USER_PROFILE = {
  name: "Ice",
  plan: "Pro Plan",
  email: "ice@example.com",
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const sidebarWidth = expanded ? "clamp(220px, 14.285vw, 280px)" : "64px"
  const projects = usePresentationStore((state) => state.projects);
  const fetchProjects = usePresentationStore((state) => state.fetchProjects);
  const loadProject = usePresentationStore((state) => state.loadProject);
  const deleteProject = usePresentationStore((state) => state.deleteProject);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);
  return (
    <div
      className="min-h-screen bg-background"
      style={{ "--app-sidebar-width": sidebarWidth } as CSSProperties}
    >
      <aside
        className={`fixed left-0 top-0 z-30 hidden h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[8px_0_30px_rgba(20,20,19,0.04)] transition-[width] duration-300 md:flex md:flex-col ${
          expanded ? "" : "cursor-ew-resize"
        }`}
        style={{ width: "var(--app-sidebar-width)" }}
        onClick={() => {
          if (!expanded) setExpanded(true)
        }}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          <Link
            to="/"
            className={`flex min-w-0 items-center gap-2.5 ${expanded ? "flex-1" : "mx-auto"}`}
            aria-label="PPT Agent"
            onClick={(event) => {
              if (!expanded) {
                event.preventDefault()
                setExpanded(true)
              }
              event.stopPropagation()
            }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-deep-dark font-heading text-[1rem] font-medium text-ivory shadow-[0_0_0_1px_rgba(48,48,46,0.12)]">
              P
            </span>
            {expanded && (
              <span className="truncate font-heading text-[1rem] font-medium tracking-normal">
                PPT Agent
              </span>
            )}
          </Link>
          {expanded && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setExpanded(false)
              }}
              className="flex size-9 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="收起侧边栏"
              title="收起侧边栏"
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 px-2 py-4 overflow-y-auto">
          {expanded && (
            <div className="space-y-2">
              <p className="px-2.5 pb-1 font-sans text-[0.625rem] font-medium uppercase tracking-[0.5px] text-sidebar-foreground/45">
                Recent
              </p>
              {projects.map((project) => (
                <div key={project.id} className="group relative flex items-center justify-between rounded-xl hover:bg-sidebar-accent transition-colors duration-150">
                  <button
                    type="button"
                    onClick={async () => {
                      await loadProject(project.id);
                      navigate("/editor");
                    }}
                    className="flex-1 px-3 py-2.5 text-left font-sans text-[0.8125rem] leading-snug text-sidebar-foreground/75 hover:text-sidebar-accent-foreground truncate"
                  >
                    <span className="truncate block">{project.title || "未命名演示文稿"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={async (event) => {
                      event.stopPropagation();
                      await deleteProject(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 mr-2 rounded-lg text-sidebar-foreground/45 hover:bg-black/5 hover:text-destructive transition-all duration-200"
                    title="删除项目"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative border-t border-sidebar-border px-3 py-3">
          <button
            type="button"
            className={`flex h-10 cursor-pointer items-center overflow-hidden rounded-xl border border-white/45 bg-ivory/35 text-charcoal-warm shadow-[0_14px_38px_rgba(20,20,19,0.1),0_0_0_1px_rgba(209,207,197,0.5)] backdrop-blur-xl transition-all duration-300 hover:bg-ivory/65 hover:text-foreground ${
              expanded ? "w-full justify-start px-2.5" : "mx-auto w-10 justify-center"
            }`}
            aria-label="打开用户菜单"
            title="用户"
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-warm-sand text-charcoal-warm shadow-[0_0_0_1px_rgba(209,207,197,0.65)]">
              <UserRound className="size-4" />
            </span>
            {expanded && (
              <span className="ml-2.5 flex min-w-0 flex-1 items-center gap-2 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-[0.8125rem] font-medium leading-tight text-foreground">
                    {USER_PROFILE.name}
                  </span>
                  <span className="mt-0.5 block truncate font-sans text-[0.6875rem] leading-tight text-stone-gray">
                    {USER_PROFILE.email}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-warm-sand px-2 py-1 font-sans text-[0.625rem] font-medium text-charcoal-warm">
                  {USER_PROFILE.plan}
                </span>
              </span>
            )}
          </button>
        </div>
      </aside>

      <div
        className="min-h-screen transition-[margin-left] duration-300 md:ml-[var(--app-sidebar-width)]"
      >
        {children}
      </div>
    </div>
  )
}
