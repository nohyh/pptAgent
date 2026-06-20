import type { Session, User } from "@supabase/supabase-js"
import { create } from "zustand"
import apiClient from "@/api/apiClient"
import { getApiErrorMessage } from "@/lib/apiError"
import { hasSupabaseConfig, supabase } from "@/lib/supabaseClient"

interface UserProfile {
  id: string
  email: string | null
  generation_quota: number
  is_unlimited_quota: boolean
}

interface AuthState {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  authDialogOpen: boolean
  authError: string | null
  initAuth: () => Promise<void>
  openAuthDialog: () => void
  closeAuthDialog: () => void
  signUp: (email: string, password: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

let authInitialized = false
export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  authDialogOpen: false,
  authError: null,
  
//初始化认证状态，恢复用户关闭页面前的登录状态，并建立状态监听
  initAuth: async () => {
    if (authInitialized) return
    authInitialized = true
    set({ loading: true })
    const { data } = await supabase.auth.getSession()
    set({
      session: data.session,
      user: data.session?.user ?? null,
      loading: false,
    })
    //重新获取用户业务数据
    if (data.session) await get().refreshProfile()
      // 
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        profile: session ? get().profile : null,
      })
      if (session) void get().refreshProfile()
    })
  },

  openAuthDialog: () => set({ authDialogOpen: true, authError: null }),
  closeAuthDialog: () => set({ authDialogOpen: false, authError: null }),

  signUp: async (email, password) => {
    if (!hasSupabaseConfig) {
      set({ authError: "Supabase 前端配置缺失" })
      return false
    }
    set({ loading: true, authError: null })
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      set({ loading: false, authError: getApiErrorMessage(error, "注册失败，请稍后重试。") })
      return false
    }
    if (!data.session) {
      set({
        loading: false,
        authError: "注册成功，请检查邮箱验证，或直接登录。",
      })
      return true
    }
    set({
      session: data.session,
      user: data.user,
      loading: false,
      authDialogOpen: false,
    })
    if (data.session) await get().refreshProfile()
    return true
  },

  signIn: async (email, password) => {
    if (!hasSupabaseConfig) {
      set({ authError: "Supabase 前端配置缺失" })
      return false
    }
    set({ loading: true, authError: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ loading: false, authError: getApiErrorMessage(error, "登录失败，请稍后重试。") })
      return false
    }
    set({
      session: data.session,
      user: data.user,
      loading: false,
      authDialogOpen: false,
    })
    await get().refreshProfile()
    return true
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({
      session: null,
      user: null,
      profile: null,
      loading: false,
      authDialogOpen: false,
      authError: null,
    })
  },

  refreshProfile: async () => {
    if (!get().session) {
      set({ profile: null })
      return
    }
    try {
      const res = await apiClient.get<UserProfile>("/me")
      set({ profile: res.data })
    } catch (error) {
      set({ authError: getApiErrorMessage(error, "用户信息刷新失败") })
    }
  },
}))
