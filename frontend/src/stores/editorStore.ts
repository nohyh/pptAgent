import { create } from "zustand"
import  apiClient from "@/api/apiClient"

export interface OutlineSection {
  id: string
  title: string
  content: string
}

export type Verbosity = "detailed" | "moderate" | "brief"

export interface EditorState {
  prompt: string
  title: string
  sections: OutlineSection[]
  style: string
  pageCount: number
  verbosity: Verbosity

  setPrompt: (prompt: string) => void
  setTitle: (title: string) => void
  updateSection: (id: string, patch: Partial<OutlineSection>) => void
  addSection: (afterIndex: number) => void
  removeSection: (id: string) => void
  setStyle: (style: string) => void
  setPageCount: (count: number) => void
  setVerbosity: (v: Verbosity) => void
  generateOutline: (prompt: string) => void
}

let nextId = 0
function uid() {
  return `section-${++nextId}`
}//为每个section创建一个id

export const useEditorStore = create<EditorState>((set) => ({
  prompt: "",
  title: "",
  sections: [],
  style: "apple",
  pageCount: 12,
  verbosity: "moderate",

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
  setVerbosity: (v) => set({ verbosity: v }),

  generateOutline: async (prompt) => {
    const res = await apiClient.post("/generateOutline",{prompt})
    set({
      prompt,
      title: res.data.title || "未命名演示文稿",
      sections: res.data.sections
    })
  },
}))
