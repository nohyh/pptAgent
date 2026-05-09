import type { Presentation } from "@/types/presentation";

export const mockPresentation: Presentation = {
  id: "pres-001",
  title: "The Art of Simplicity",
  layout: "16x9",
  theme: "Warm Editorial",
  slides: [
    // 幻灯片 1：高级杂志风封面
    {
      id: "slide-01",
      background: "#faf9f6", // ivory background
      elements: [
        {
          id: "elem-sidebar",
          type: "block",
          shapeType: "rect",
          x: 0,
          y: 0,
          width: 32,
          height: 100,
          backgroundColor: "#f0eee6",
        },
        {
          id: "elem-accent-line",
          type: "block",
          shapeType: "rect",
          x: 8,
          y: 15,
          width: 4,
          height: 0.8,
          backgroundColor: "#c85a47",
        },
        {
          id: "elem-chapter",
          type: "text",
          content: "CHAPTER 01",
          x: 8,
          y: 18,
          width: 20,
          height: 5,
          fontSize: 14,
          color: "#c85a47",
          bold: true,
          align: "left",
        },
        {
          id: "elem-sidebar-desc",
          type: "text",
          content: "Exploring the fundamentals of warm editorial aesthetics and how they elevate digital presentations to feel like premium printed magazines.",
          x: 8,
          y: 26,
          width: 16,
          height: 30,
          fontSize: 15,
          color: "#7a776c",
          align: "left",
        },
        {
          id: "elem-title",
          type: "text",
          content: "The Art of Simplicity",
          x: 38,
          y: 14,
          width: 55,
          height: 15,
          fontSize: 56,
          color: "#2c2a25",
          bold: true,
          align: "left",
          font: "Georgia, serif",
        },
        {
          id: "elem-subtitle",
          type: "text",
          content: "Crafting meaningful digital experiences through minimalist design.",
          x: 38,
          y: 31,
          width: 55,
          height: 10,
          fontSize: 22,
          color: "#5c5a52",
          align: "left",
        },
        {
          id: "elem-image",
          type: "image",
          src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
          alt: "Elegant office architecture",
          x: 38,
          y: 45,
          width: 55,
          height: 45,
        }
      ]
    },
    // 幻灯片 2：图文内容页
    {
      id: "slide-02",
      background: "#faf9f6",
      elements: [
        {
          id: "elem-s2-title",
          type: "text",
          content: "Why Editorial Design?",
          x: 10,
          y: 15,
          width: 80,
          height: 15,
          fontSize: 48,
          color: "#2c2a25",
          bold: true,
          align: "left",
          font: "Georgia, serif",
        },
        {
          id: "elem-s2-line",
          type: "block",
          shapeType: "rect",
          x: 10,
          y: 32,
          width: 80,
          height: 0.2,
          backgroundColor: "#d1cfc5",
        },
        {
          id: "elem-s2-text",
          type: "text",
          content: "Editorial design focuses on typography, grid systems, and intentional whitespace. It transforms dense information into a readable, pacing-driven narrative that guides the eye naturally.",
          x: 10,
          y: 40,
          width: 40,
          height: 40,
          fontSize: 24,
          color: "#5c5a52",
          align: "left",
        },
        {
          id: "elem-s2-image",
          type: "image",
          src: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=800",
          alt: "Magazine layout",
          x: 55,
          y: 40,
          width: 35,
          height: 45,
        }
      ]
    },
    // 幻灯片 3：名言/强调页
    {
      id: "slide-03",
      background: "#e8e4d9",
      elements: [
        { id: "s3-q", type: "text", content: "\"Simplicity is the ultimate sophistication.\"", x: 20, y: 35, width: 60, height: 20, fontSize: 48, color: "#2c2a25", align: "center", font: "Georgia, serif", bold: true },
        { id: "s3-a", type: "text", content: "— Leonardo da Vinci", x: 20, y: 60, width: 60, height: 10, fontSize: 24, color: "#c85a47", align: "center" }
      ]
    },
    // 幻灯片 4：大图背景页
    {
      id: "slide-04",
      background: "#faf9f6",
      elements: [
        { id: "s4-img", type: "image", src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200", x: 5, y: 5, width: 90, height: 60 },
        { id: "s4-t", type: "text", content: "A New Perspective", x: 10, y: 72, width: 80, height: 15, fontSize: 40, color: "#2c2a25", bold: true, font: "Georgia, serif" },
        { id: "s4-d", type: "text", content: "Changing the way we look at digital spaces and physical environments.", x: 10, y: 85, width: 80, height: 10, fontSize: 20, color: "#5c5a52" }
      ]
    },
    // 幻灯片 5：三列特性页
    {
      id: "slide-05",
      background: "#faf9f6",
      elements: [
        { id: "s5-t", type: "text", content: "Core Principles", x: 10, y: 15, width: 80, height: 15, fontSize: 40, color: "#2c2a25", bold: true, font: "Georgia, serif" },
        { id: "s5-b1", type: "block", shapeType: "rect", x: 10, y: 35, width: 24, height: 40, backgroundColor: "#f0eee6" },
        { id: "s5-t1", type: "text", content: "Clarity", x: 12, y: 40, width: 20, height: 10, fontSize: 24, color: "#c85a47", bold: true },
        { id: "s5-d1", type: "text", content: "Remove the non-essential. Focus purely on the core message.", x: 12, y: 50, width: 20, height: 20, fontSize: 16, color: "#5c5a52" },
        { id: "s5-b2", type: "block", shapeType: "rect", x: 38, y: 35, width: 24, height: 40, backgroundColor: "#f0eee6" },
        { id: "s5-t2", type: "text", content: "Warmth", x: 40, y: 40, width: 20, height: 10, fontSize: 24, color: "#c85a47", bold: true },
        { id: "s5-d2", type: "text", content: "Use colors and textures that invite engagement and trust.", x: 40, y: 50, width: 20, height: 20, fontSize: 16, color: "#5c5a52" },
        { id: "s5-b3", type: "block", shapeType: "rect", x: 66, y: 35, width: 24, height: 40, backgroundColor: "#f0eee6" },
        { id: "s5-t3", type: "text", content: "Rhythm", x: 68, y: 40, width: 20, height: 10, fontSize: 24, color: "#c85a47", bold: true },
        { id: "s5-d3", type: "text", content: "Establish a natural reading flow and structural hierarchy.", x: 68, y: 50, width: 20, height: 20, fontSize: 16, color: "#5c5a52" }
      ]
    },
    // 幻灯片 6：深色流程页
    {
      id: "slide-06",
      background: "#2c2a25", // Dark background
      elements: [
        { id: "s6-t", type: "text", content: "The Process", x: 10, y: 15, width: 80, height: 15, fontSize: 40, color: "#faf9f6", bold: true, font: "Georgia, serif" },
        { id: "s6-num1", type: "text", content: "01", x: 10, y: 40, width: 10, height: 10, fontSize: 32, color: "#c85a47", font: "Georgia, serif" },
        { id: "s6-dt1", type: "text", content: "Discovery & Research", x: 20, y: 42, width: 70, height: 10, fontSize: 20, color: "#e8e4d9" },
        { id: "s6-num2", type: "text", content: "02", x: 10, y: 55, width: 10, height: 10, fontSize: 32, color: "#c85a47", font: "Georgia, serif" },
        { id: "s6-dt2", type: "text", content: "Concept Development", x: 20, y: 57, width: 70, height: 10, fontSize: 20, color: "#e8e4d9" },
        { id: "s6-num3", type: "text", content: "03", x: 10, y: 70, width: 10, height: 10, fontSize: 32, color: "#c85a47", font: "Georgia, serif" },
        { id: "s6-dt3", type: "text", content: "Refinement & Delivery", x: 20, y: 72, width: 70, height: 10, fontSize: 20, color: "#e8e4d9" }
      ]
    },
    // 幻灯片 7：左图右文
    {
      id: "slide-07",
      background: "#faf9f6",
      elements: [
        { id: "s7-img", type: "image", src: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800", x: 10, y: 20, width: 35, height: 60 },
        { id: "s7-t", type: "text", content: "Inspiration", x: 50, y: 30, width: 40, height: 15, fontSize: 40, color: "#2c2a25", bold: true, font: "Georgia, serif" },
        { id: "s7-d", type: "text", content: "Every great design begins with an even better story. We draw inspiration from nature, architecture, and classic editorial prints.", x: 50, y: 48, width: 40, height: 30, fontSize: 20, color: "#5c5a52" }
      ]
    },
    // 幻灯片 8：结束页
    {
      id: "slide-08",
      background: "#faf9f6",
      elements: [
        { id: "s8-b", type: "block", shapeType: "rect", x: 48, y: 30, width: 4, height: 6, backgroundColor: "#c85a47" },
        { id: "s8-t", type: "text", content: "Thank You", x: 20, y: 45, width: 60, height: 15, fontSize: 56, color: "#2c2a25", bold: true, align: "center", font: "Georgia, serif" },
        { id: "s8-d", type: "text", content: "hello@example.com  |  www.example.com", x: 20, y: 65, width: 60, height: 10, fontSize: 18, color: "#c85a47", align: "center" }
      ]
    }
  ]
};
