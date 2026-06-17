import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import Outline from "@/pages/Outline"
import Editor from "@/pages/Editor"
import AppShell from "@/components/AppShell"

export default function App() {
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
