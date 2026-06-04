import type { Presentation } from "@/types/presentation"

type PresentationLayout = Presentation["layout"]
type PptxPercent = `${number}%`

const DESIGN_WIDTH_PT: Record<PresentationLayout, number> = {
  "16x9": 960,
  "4x3": 720,
}

const SLIDE_ASPECT_RATIO: Record<PresentationLayout, string> = {
  "16x9": "16 / 9",
  "4x3": "4 / 3",
}

const DEFAULT_CSS_FONT = "Arial, Helvetica, sans-serif"
const DEFAULT_PPT_FONT = "Arial"
const DEFAULT_LINE_HEIGHT = 1.5

export function toPptxPercent(value: number): PptxPercent {
  return `${Number(value.toFixed(4))}%`
}

export function getSlideAspectRatio(layout: PresentationLayout): string {
  return SLIDE_ASPECT_RATIO[layout]
}

export function getCssFontSize(fontSize: number, layout: PresentationLayout): string {
  return `${Number(((fontSize / DESIGN_WIDTH_PT[layout]) * 100).toFixed(4))}cqi`
}

export function getCssFontFamily(font?: string): string {
  return font || DEFAULT_CSS_FONT
}

export function getPptFontFace(font?: string): string {
  return (font || DEFAULT_PPT_FONT).split(",")[0].trim().replace(/^['"]|['"]$/g, "")
}

export function getLineHeight(lineHeight?: number): number {
  return lineHeight || DEFAULT_LINE_HEIGHT
}

export function plainTextToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br>")
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<div><br\s*\/?><\/div>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<div[^>]*>/gi, "\n")
    .replace(/<\/div>/gi, "")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n|\n$/g, "")
}
