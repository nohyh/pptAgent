import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FlaskConical, Loader2, LogOut, MessageSquarePlus, PanelLeftClose, Trash2, UserRound, X } from "lucide-react"
import { fetchProjectApi, projectKeys, queryClient } from "@/lib/projectQueries"
import { useAuthStore } from "@/stores/authStore"
import { useEditorStore } from "@/stores/editorStore"
import { usePresentationStore } from "@/stores/presentationStore"

function AuthDialog() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const authDialogOpen = useAuthStore((state) => state.authDialogOpen)
  const authError = useAuthStore((state) => state.authError)
  const loading = useAuthStore((state) => state.loading)
  const closeAuthDialog = useAuthStore((state) => state.closeAuthDialog)
  const signIn = useAuthStore((state) => state.signIn)
  const signUp = useAuthStore((state) => state.signUp)

  if (!authDialogOpen) return null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (mode === "signIn") {
      await signIn(email, password)
    } else {
      await signUp(email, password)
    }
  }

  return (
    <div className="absolute bottom-16 left-3 right-3 z-40 rounded-2xl border border-sidebar-border bg-ivory p-4 text-charcoal-warm shadow-[0_18px_48px_rgba(20,20,19,0.16),0_0_0_1px_rgba(209,207,197,0.55)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-[1rem] font-medium text-foreground">
            {mode === "signIn" ? "登录" : "注册"}
          </h2>
          <p className="mt-1 font-sans text-[0.75rem] text-stone-gray">
            登录后可生成和保存项目
          </p>
        </div>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-lg text-stone-gray hover:bg-background hover:text-foreground"
          onClick={closeAuthDialog}
          title="关闭"
        >
          <X className="size-4" />
        </button>
      </div>

      <form className="space-y-3" onSubmit={submit}>
        <input
          type="email"
          className="h-10 w-full rounded-lg border border-border-warm bg-white px-3 font-sans text-[0.8125rem] outline-none focus:ring-2 focus:ring-focus-blue"
          placeholder="邮箱"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          className="h-10 w-full rounded-lg border border-border-warm bg-white px-3 font-sans text-[0.8125rem] outline-none focus:ring-2 focus:ring-focus-blue"
          placeholder="密码"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
        {authError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 font-sans text-[0.75rem] leading-relaxed text-destructive">
            {authError}
          </p>
        )}
        <button
          type="submit"
          className="flex h-10 w-full items-center justify-center rounded-lg bg-neutral-900 font-sans text-[0.8125rem] font-medium text-[#F5F0E8] hover:bg-neutral-800 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : mode === "signIn" ? "登录" : "注册"}
        </button>
      </form>

      <button
        type="button"
        className="mt-3 w-full text-center font-sans text-[0.75rem] text-stone-gray hover:text-primary"
        onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
      >
        {mode === "signIn" ? "没有账号？注册" : "已有账号？登录"}
      </button>
    </div>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title?: string } | null>(null)
  const sidebarWidth = expanded ? "clamp(220px, 14.285vw, 280px)" : "64px"
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog)
  const signOut = useAuthStore((state) => state.signOut)
  const projects = usePresentationStore((state) => state.projects)
  const fetchProjects = usePresentationStore((state) => state.fetchProjects)
  const loadProject = usePresentationStore((state) => state.loadProject)
  const deleteProject = usePresentationStore((state) => state.deleteProject)
   //清空当前项目状态，清空撤回以及前进的栈，清空错误信息
  const clearPresentation = usePresentationStore((state) => state.clearPresentation)
  //假数据模式
  const useMockMode = useEditorStore((state) => state.useMockMode)
  const setUseMockMode = useEditorStore((state) => state.setUseMockMode)
  const navigate = useNavigate()
  const email = profile?.email || user?.email || "未登录"
  //后门
  const isJamesAccount = email.toLowerCase() === "jamesel398@gmail.com"
  const hasNoQuota = Boolean(profile && !profile.is_unlimited_quota && profile.generation_quota <= 0)

  const startNewChat = () => {
    clearPresentation()
    useEditorStore.getState().reset()
    navigate("/")
  }

  useEffect(() => {
    if (user) {
      void fetchProjects()
    } else {
      usePresentationStore.setState({ projects: [] })
    }
  }, [fetchProjects, user])

  return (
    <div
      className="min-h-screen bg-background"
      style={{ "--app-sidebar-width": sidebarWidth } as CSSProperties}
    >
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-sidebar-border bg-ivory p-5 text-charcoal-warm shadow-[0_24px_72px_rgba(20,20,19,0.22)]">
            <h2 className="font-heading text-[1.05rem] font-medium text-foreground">
              删除项目
            </h2>
            <p className="mt-2 font-sans text-[0.8125rem] leading-relaxed text-stone-gray">
              确认删除「{deleteTarget.title || "未命名演示文稿"}」？删除后无法从历史列表恢复。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="h-9 rounded-lg border border-border-warm bg-white px-3 font-sans text-[0.8125rem] text-charcoal-warm hover:bg-background"
                onClick={() => setDeleteTarget(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="h-9 rounded-lg bg-destructive px-3 font-sans text-[0.8125rem] font-medium text-white hover:bg-destructive/90"
                onClick={async () => {
                  const projectId = deleteTarget.id
                  setDeleteTarget(null)
                  await deleteProject(projectId)
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

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

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
          {expanded && hasNoQuota && (
            <div className="mb-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 font-sans text-[0.75rem] leading-relaxed text-destructive">
              生成额度已用完，可继续查看和编辑历史项目。
            </div>
          )}

          {/* 侧边栏入口只负责创建新的生成上下文，生成阶段仍由 outline/editor store 驱动。 */}
          <button
            type="button"
            className={`mb-4 flex h-10 items-center rounded-xl text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
              expanded ? "w-full justify-start gap-2.5 px-3" : "mx-auto w-10 justify-center"
            }`}
            onClick={(event) => {
              event.stopPropagation()
              startNewChat()
            }}
            title="New Chat"
          >
            <MessageSquarePlus className="size-4" />
            {expanded && (
              <span className="font-sans text-[0.8125rem] font-medium">
                New Chat
              </span>
            )}
          </button>

          {expanded && (
            <div className="space-y-2">
              <p className="px-2.5 pb-1 font-sans text-[0.625rem] font-medium uppercase tracking-[0.5px] text-sidebar-foreground/45">
                Recent
              </p>
              {!user ? (
                <p className="px-2.5 py-2 font-sans text-[0.8125rem] leading-relaxed text-stone-gray">
                  登录后查看历史
                </p>
              ) : projects.length === 0 ? (
                <p className="px-2.5 py-2 font-sans text-[0.8125rem] leading-relaxed text-stone-gray">
                  暂无历史项目
                </p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="group relative flex items-center justify-between rounded-xl transition-colors duration-150 hover:bg-sidebar-accent">
                    <button
                      type="button"
                      onClick={async () => {
                        if (project.isPending) {
                          navigate("/editor")
                          return
                        }
                        await loadProject(project.id)
                        navigate("/editor")
                      }}
                      onMouseEnter={() => {
                        if (project.isPending) return
                        void queryClient.prefetchQuery({
                          queryKey: projectKeys.detail(project.id),
                          queryFn: () => fetchProjectApi(project.id),
                        })
                      }}
                      className="flex-1 truncate px-3 py-2.5 text-left font-sans text-[0.8125rem] leading-snug text-sidebar-foreground/75 hover:text-sidebar-accent-foreground"
                    >
                      <span className="flex items-center gap-2">
                        {project.isPending && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                        <span className="block truncate">{project.title || "未命名演示文稿"}</span>
                      </span>
                    </button>
                    {!project.isPending && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setDeleteTarget({ id: project.id, title: project.title })
                        }}
                        className="mr-2 rounded-lg p-1.5 text-sidebar-foreground/45 opacity-0 transition-all duration-200 hover:bg-black/5 hover:text-destructive group-hover:opacity-100"
                        title="删除项目"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative border-t border-sidebar-border px-3 py-3">
          <AuthDialog />
          {user && userMenuOpen && expanded && (
            <div className="absolute bottom-16 left-3 right-3 z-40 rounded-xl border border-sidebar-border bg-ivory p-2 shadow-[0_14px_38px_rgba(20,20,19,0.12)]">
              {isJamesAccount && (
                /* Demo 账号专用：一键切到 mock 链路，便于无成本演示完整 UI。 */
                <button
                  type="button"
                  className="mb-1 flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-sans text-[0.8125rem] text-charcoal-warm hover:bg-background"
                  onClick={() => setUseMockMode(!useMockMode)}
                >
                  <FlaskConical className="size-4" />
                  {useMockMode ? "关闭 Mock 演示" : "启动 Mock 演示"}
                </button>
              )}
              <button
                type="button"
                className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-sans text-[0.8125rem] text-charcoal-warm hover:bg-background"
                onClick={async () => {
                  await signOut()
                  usePresentationStore.setState({ projects: [], presentation: null })
                  queryClient.clear()
                  setUserMenuOpen(false)
                }}
              >
                <LogOut className="size-4" />
                退出登录
              </button>
            </div>
          )}
          <button
            type="button"
            className={`flex h-10 cursor-pointer items-center overflow-hidden rounded-xl border border-white/45 bg-ivory/35 text-charcoal-warm shadow-[0_14px_38px_rgba(20,20,19,0.1),0_0_0_1px_rgba(209,207,197,0.5)] backdrop-blur-xl transition-all duration-300 hover:bg-ivory/65 hover:text-foreground ${
              expanded ? "w-full justify-start px-2.5" : "mx-auto w-10 justify-center"
            }`}
            aria-label="打开用户菜单"
            title="用户"
            onClick={(event) => {
              event.stopPropagation()
              if (!expanded) {
                setExpanded(true)
                return
              }
              if (user) {
                setUserMenuOpen((open) => !open)
              } else {
                openAuthDialog()
              }
            }}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-warm-sand text-charcoal-warm shadow-[0_0_0_1px_rgba(209,207,197,0.65)]">
              <UserRound className="size-4" />
            </span>
            {expanded && (
              <span className="ml-2.5 flex min-w-0 flex-1 items-center gap-2 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-[0.8125rem] font-medium leading-tight text-foreground">
                    {user ? "已登录" : "未登录"}
                  </span>
                  <span className="mt-0.5 block truncate font-sans text-[0.6875rem] leading-tight text-stone-gray">
                    {email}
                  </span>
                </span>
                {user && profile && (
                  <span className="shrink-0 rounded-full bg-warm-sand px-2 py-1 font-sans text-[0.625rem] font-medium text-charcoal-warm">
                    {profile.is_unlimited_quota ? "不限" : `${profile.generation_quota} 次`}
                  </span>
                )}
              </span>
            )}
          </button>
        </div>
      </aside>

      <div className="min-h-screen transition-[margin-left] duration-300 md:ml-[var(--app-sidebar-width)]">
        {children}
      </div>
    </div>
  )
}
