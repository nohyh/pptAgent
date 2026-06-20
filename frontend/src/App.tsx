import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import Outline from "@/pages/Outline"
import Editor from "@/pages/Editor"
import AppShell from "@/components/AppShell"
import { useAuthStore } from "@/stores/authStore"

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth)
//应用启动时初始化一次
  useEffect(() => {
    void initAuth()
  }, [initAuth])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell><Home /></AppShell>} />
        <Route path="/outline" element={<Outline />} />
        <Route path="/editor" element={<AppShell><Editor /></AppShell>} />
      </Routes>
    </BrowserRouter>
  )
}
