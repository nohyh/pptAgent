/**
 * PptxGenJS 实验脚本
 * 
 * 用法：在 Editor 页面的「导出 PPTX」按钮的 onClick 里调用 testExport()
 * 或者在浏览器控制台里导入调用
 * 
 * 目的：让你亲手感受 PptxGenJS 需要什么数据
 */
import pptxgen from "pptxgenjs"

export function testExport() {
  // ═══ 1. 创建演示文稿 ═══
  const pptx = new pptxgen()

  // 演示文稿级别的设置
  pptx.layout = "LAYOUT_16x9"  // 16:9 布局，标准宽屏
  // 默认幻灯片大小: 10 x 5.625 英寸 (宽 x 高)
  // 所有 x/y/w/h 的单位都是 **英寸**

  // ═══ 2. 第一页：标题页 ═══
  const slide1 = pptx.addSlide()

  // 添加文字
  slide1.addText("这是标题", {
    x: 1,        // 距左边 1 英寸
    y: 1.5,      // 距顶部 1.5 英寸
    w: 8,        // 宽 8 英寸
    h: 1.2,      // 高 1.2 英寸
    fontSize: 36, // 字号 36pt
    fontFace: "Microsoft YaHei",  // 字体
    color: "141413",    // 颜色（不带 #）
    bold: true,
    align: "center",     // 水平对齐: left / center / right
    valign: "middle",    // 垂直对齐: top / middle / bottom
  })

  // 添加副标题
  slide1.addText("副标题文字在这里", {
    x: 1,
    y: 3,
    w: 8,
    h: 0.8,
    fontSize: 18,
    fontFace: "Microsoft YaHei",
    color: "5e5d59",
    align: "center",
  })

  // 设置幻灯片背景色
  slide1.background = { fill: "f5f4ed" }

  // ═══ 3. 第二页：文字 + 图片 ═══
  const slide2 = pptx.addSlide()
  slide2.background = { fill: "ffffff" }

  // 添加文字
  slide2.addText("内容页标题", {
    x: 0.5,
    y: 0.3,
    w: 5,
    h: 0.8,
    fontSize: 24,
    fontFace: "Microsoft YaHei",
    color: "141413",
    bold: true,
  })

  // 添加段落文字（多段文字用数组）
  slide2.addText([
    { text: "第一行正文内容", options: { fontSize: 14, color: "5e5d59", breakLine: true } },
    { text: "第二行正文内容", options: { fontSize: 14, color: "5e5d59", breakLine: true } },
    { text: "加粗的重点内容", options: { fontSize: 14, color: "c96442", bold: true } },
  ], {
    x: 0.5,
    y: 1.3,
    w: 4.5,
    h: 3,
    fontFace: "Microsoft YaHei",
    valign: "top",
    lineSpacing: 28,  // 行间距
  })

  // 添加图片（用网络 URL）
  slide2.addImage({
    path: "https://picsum.photos/400/300",  // 图片URL
    x: 5.5,
    y: 1,
    w: 4,
    h: 3,
    rounding: true,  // 圆角
  })

  // ═══ 4. 第三页：形状 ═══
  const slide3 = pptx.addSlide()

  // 添加矩形形状
  slide3.addShape(pptx.ShapeType.rect, {
    x: 1,
    y: 1,
    w: 3,
    h: 2,
    fill: { color: "c96442" },  // 填充色
    line: { color: "b53333", width: 1 },  // 边框
    rectRadius: 0.2,  // 圆角半径（英寸）
  })

  // 形状 + 文字组合
  slide3.addText("形状内的文字", {
    shape: pptx.ShapeType.roundRect,
    x: 5,
    y: 1,
    w: 4,
    h: 2,
    fill: { color: "e8e6dc" },
    fontSize: 16,
    color: "4d4c48",
    align: "center",
    valign: "middle",
    rectRadius: 0.3,
  })

  // ═══ 5. 导出下载 ═══
  pptx.writeFile({ fileName: "测试导出.pptx" })
    .then(() => console.log("✅ PPTX 导出成功！"))
    .catch((err) => console.error("❌ 导出失败：", err))
}
