import { create } from "zustand"
import  apiClient from "@/api/apiClient"
import { getApiErrorMessage } from "@/lib/apiError"

export const MAX_OUTLINE_SECTIONS = 10
export const MAX_PAGE_COUNT = 30

//获取页数的下限
function getMinPageCount(sectionCount: number) {
  return sectionCount * 2 + 2
}

// 确定页数的上下限
function clampPageCount(count: number, sectionCount: number) {
  return Math.max(getMinPageCount(sectionCount), Math.min(MAX_PAGE_COUNT, count))
}

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
//是否使用mock数据
const USE_MOCK_PRESENTATION = import.meta.env.VITE_USE_MOCK_PRESENTATION === "true"

function uid() {
  return `section-${++nextId}`
}//为每个section创建一个id

export const useEditorStore = create<EditorState>((set) => ({
  prompt: "",
  title: "",
  sections: [],
  style: "minimalist",
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
      if (s.sections.length >= MAX_OUTLINE_SECTIONS) return s
      const newSection: OutlineSection = {
        id: uid(),
        title: "",
        content: "",
      }
      const updated = [...s.sections]
      updated.splice(afterIndex + 1, 0, newSection)
      return {
        sections: updated,
        pageCount: clampPageCount(s.pageCount, updated.length),
      }
    }),
  removeSection: (id) =>
    set((s) => {
      if (s.sections.length <= 1) return s
      const updated = s.sections.filter((sec) => sec.id !== id)
      return {
        sections: updated,
        pageCount: clampPageCount(s.pageCount, updated.length),
      }
    }),
  setStyle: (style) => set({ style }),
  setPageCount: (count) => set((s) => ({ pageCount: clampPageCount(count, s.sections.length) })),

  generateOutline: async (prompt) => {
    set({ isGeneratingOutline: true, outlineError: null, prompt })
    try {
      const res = USE_MOCK_PRESENTATION
        ? await apiClient.get("/mockOutline")
        : await apiClient.post("/generateOutline",{prompt})
      const sections = (res.data.sections || []).slice(0, MAX_OUTLINE_SECTIONS)
      set({
        title: res.data.title || "未命名演示文稿",
        sections,
        pageCount: clampPageCount(12, sections.length),
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
