import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import Outline from "@/pages/Outline"
import Editor from "@/pages/Editor"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/outline" element={<Outline />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  )
}
