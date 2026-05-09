import { usePresentationStore } from "@/stores/presentationStore"
import pptxgen from "pptxgenjs"

export function exportPresentation() {
  const presentation = usePresentationStore.getState().presentation
  if (!presentation) {
    return
  }
  const pptx = new pptxgen()
  // 1. 设置整体布局比例
  if (presentation.layout === "16x9") {
    pptx.layout = "LAYOUT_16x9"
  } else if (presentation.layout === "4x3") {
    pptx.layout = "LAYOUT_4x3"
  }
  // 2. 遍历幻灯片
  const slides = presentation.slides || []
  for (const slide of slides) {
    const newSlide = pptx.addSlide()
    // 格式化背景色 (PptxGen 要求去掉 #)
    if (slide.background) {
      newSlide.background = { fill: slide.background.replace("#", "") }
    }
    // 3. 遍历渲染每个元素
    for (const item of slide.elements) {
      const x = `${item.x}%`
      const y = `${item.y}%`
      const w = `${item.width}%`
      const h = `${item.height}%`

      if (item.type === "text") {
        newSlide.addText(item.content, {
          x,
          y,
          w,
          h,
          fontSize: item.fontSize, // 我们恰好用的是绝对大小，可以直接映射为字号
          color: item.color ? item.color.replace("#", "") : "000000",
          bold: item.bold,
          align: item.align || "left",
          valign: "top", // 网页绝对定位的文字默认都是顶部对齐
          // 网页常用字体族往往是 "Georgia, serif"，而 PPT 里只能接受确切的字体名 "Georgia"
          fontFace: item.font ? item.font.split(",")[0].trim() : "Arial",
        })
      } 
      else if (item.type === "image") {
        newSlide.addImage({
          path: item.src,
          x,
          y,
          w,
          h,
          sizing: { type: "cover", w, h } // 对应我们在网页里写的 objectFit: "cover"
        })
      } 
      else if (item.type === "block") {
        // 映射形状类型
        let shapeType = pptx.ShapeType.rect
        if (item.shapeType === "circle") shapeType = pptx.ShapeType.ellipse
        if (item.shapeType === "roundRect") shapeType = pptx.ShapeType.roundRect

        newSlide.addShape(shapeType, {
          x,
          y,
          w,
          h,
          fill: item.backgroundColor ? { color: item.backgroundColor.replace("#", "") } : undefined,
          line: item.borderWidth ? { 
            color: item.borderColor?.replace("#", "") || "000000", 
            width: item.borderWidth 
          } : undefined,
        })
      }
    }
  }

  // 4. 触发下载
  const fileName = `${presentation.title || "未命名演示文稿"}.pptx`
  pptx.writeFile({ fileName })
    .then(() => console.log(`✅ ${fileName} 导出成功！`))
    .catch((err) => console.error("❌ 导出失败：", err))
}
