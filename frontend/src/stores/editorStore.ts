import { create } from "zustand"
import  apiClient from "@/api/apiClient"
import { getApiErrorMessage } from "@/lib/apiError"

export interface OutlineSection {
  id: string
  title: string
  content: string
}

export interface EditorState {
  prompt: string
  title: string
  sections: OutlineSection[]
  style: string
  pageCount: number
  isGeneratingOutline: boolean
  outlineError: string | null

  setPrompt: (prompt: string) => void
  setTitle: (title: string) => void
  updateSection: (id: string, patch: Partial<OutlineSection>) => void
  addSection: (afterIndex: number) => void
  removeSection: (id: string) => void
  setStyle: (style: string) => void
  setPageCount: (count: number) => void
  generateOutline: (prompt: string) => Promise<void>
}

let nextId = 0
function uid() {
  return `section-${++nextId}`
}//为每个section创建一个id

export const useEditorStore = create<EditorState>((set) => ({
  prompt: "",
  title: "",
  sections: [],
  style: "warm-editorial",
  pageCount: 12,
  isGeneratingOutline: false,
  outlineError: null,

  setPrompt: (prompt) => set({ prompt }),
  setTitle: (title) => set({ title }),
  updateSection: (id, patch) =>
    set((s) => ({
      sections: s.sections.map((sec) =>
        sec.id === id ? { ...sec, ...patch } : sec,
      ),
    })),
  addSection: (afterIndex) =>
    set((s) => {
      const newSection: OutlineSection = {
        id: uid(),
        title: "",
        content: "",
      }
      const updated = [...s.sections]
      updated.splice(afterIndex + 1, 0, newSection)
      return { sections: updated }
    }),
  removeSection: (id) =>
    set((s) => {
      if (s.sections.length <= 1) return s
      return { sections: s.sections.filter((sec) => sec.id !== id) }
    }),
  setStyle: (style) => set({ style }),
  setPageCount: (count) => set({ pageCount: count }),

  generateOutline: async (prompt) => {
    set({ isGeneratingOutline: true, outlineError: null, prompt })
    try {
      const res = await apiClient.post("/generateOutline",{prompt})
      set({
        title: res.data.title || "未命名演示文稿",
        sections: res.data.sections,
      })
    } catch (error) {
      set({
        outlineError: getApiErrorMessage(error, "大纲生成失败，请稍后重试。"),
      })
    } finally {
      set({ isGeneratingOutline: false })
    }
  },
}))
