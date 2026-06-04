import { usePresentationStore } from "@/stores/presentationStore"
import {
  getLineHeight,
  getPptFontFace,
  htmlToPlainText,
  toPptxPercent,
} from "@/lib/presentationLayout"
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
      const x = toPptxPercent(item.x)
      const y = toPptxPercent(item.y)
      const w = toPptxPercent(item.width)
      const h = toPptxPercent(item.height)

      if (item.type === "text") {
        newSlide.addText(htmlToPlainText(item.content), {
          x,
          y,
          w,
          h,
          fontSize: item.fontSize * 0.75, // Web 使用 960px 宽度 (96 DPI), PPT 使用 720pt (10 inches). 转换系数为 0.75
          color: item.color ? item.color.replace("#", "") : "000000",
          bold: item.bold,
          align: item.align || "left",
          valign: "top", // 网页绝对定位的文字默认都是顶部对齐
          fontFace: getPptFontFace(item.font),
          lineSpacing: item.fontSize * 0.75 * getLineHeight(item.lineHeight), // 使用绝对 pt 值计算行高
          margin: 0,
          wrap: true,
          autoFit: false,
        })
      } 
      else if (item.type === "image") {
        // PptxGenJS needs raw base64 data without the 'data:image/...;base64,' prefix for the data field.
        const isBase64 = item.src.startsWith("data:");
        let imgData = item.src;
        if (isBase64) {
          // PptxGenJS expects "image/png;base64,iVBORw..." (without the "data:" prefix)
          imgData = item.src.replace(/^data:/, "");
        }

        newSlide.addImage({
          ...(isBase64 ? { data: imgData } : { path: item.src }),
          x,
          y,
          w,
          h,
          altText: item.alt,
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
