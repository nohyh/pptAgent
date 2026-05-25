import JSZip from "jszip"
import type {
  BlockElement,
  ImageElement,
  Presentation,
  Slide,
  SlideElement,
  TextElement,
} from "@/types/presentation"

const DEFAULT_SLIDE_SIZE = {
  cx: 12_192_000,
  cy: 6_858_000,
}

const RELATIONSHIP_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

type SlideSize = {
  cx: number
  cy: number
}

type Box = {
  x: number
  y: number
  width: number
  height: number
}

type Relationship = {
  id: string
  target: string
  type: string
}

export async function importPptxToPresentation(file: File): Promise<Presentation> {
  return parsePptxArrayBuffer(await file.arrayBuffer(), file.name)
}

export async function parsePptxArrayBuffer(
  arrayBuffer: ArrayBuffer,
  sourceName = "导入的 PPT"
): Promise<Presentation> {
  const zip = await JSZip.loadAsync(arrayBuffer)
  const presentationXml = await readZipText(zip, "ppt/presentation.xml")
  const presentationDoc = parseXml(presentationXml)
  const slideSize = readSlideSize(presentationDoc)
  const slidePaths = await readSlidePaths(zip, presentationDoc)
  const slides = await Promise.all(
    slidePaths.map((slidePath, slideIndex) => parseSlide(zip, slidePath, slideIndex, slideSize))
  )

  if (slides.length === 0) {
    throw new Error("没有在 PPTX 中找到可解析的幻灯片")
  }

  return {
    id: `imported-${Date.now()}`,
    title: cleanTitle(sourceName),
    layout: slideSize.cx / slideSize.cy < 1.55 ? "4x3" : "16x9",
    theme: "Imported PPTX",
    slides,
  }
}

async function parseSlide(
  zip: JSZip,
  slidePath: string,
  slideIndex: number,
  slideSize: SlideSize
): Promise<Slide> {
  const slideXml = await readZipText(zip, slidePath)
  const slideDoc = parseXml(slideXml)
  const rels = await readRelationships(zip, relationshipPathFor(slidePath))
  const elements: SlideElement[] = []

  for (const shape of descendants(slideDoc.documentElement, "sp")) {
    const box = readBox(shape, slideSize)
    if (!box) continue

    const shapeElements = parseShape(shape, slideIndex, elements.length, box)
    elements.push(...shapeElements)
  }

  for (const picture of descendants(slideDoc.documentElement, "pic")) {
    const image = await parsePicture(zip, picture, slidePath, slideIndex, elements.length, slideSize, rels)
    if (image) elements.push(image)
  }

  return {
    id: `slide-${slideIndex + 1}`,
    background: readSlideBackground(slideDoc) || "#ffffff",
    elements,
  }
}

function parseShape(shape: Element, slideIndex: number, elementIndex: number, box: Box): SlideElement[] {
  const elements: SlideElement[] = []
  const spPr = firstChild(shape, "spPr")
  const fillColor = spPr ? readDirectSolidFill(spPr) : undefined
  const line = spPr ? readLine(spPr) : undefined
  const content = readText(shape)
  const geometry = spPr ? readShapeType(spPr) : "rect"

  if (fillColor || line?.borderColor) {
    const block: BlockElement = {
      id: `slide-${slideIndex + 1}-element-${elementIndex + elements.length + 1}-block`,
      type: "block",
      shapeType: geometry,
      ...box,
      backgroundColor: fillColor,
      borderColor: line?.borderColor,
      borderWidth: line?.borderWidth,
    }
    elements.push(block)
  }

  if (content.trim().length > 0) {
    const textStyle = readTextStyle(shape)
    const text: TextElement = {
      id: `slide-${slideIndex + 1}-element-${elementIndex + elements.length + 1}-text`,
      type: "text",
      content,
      ...box,
      font: textStyle.font,
      fontSize: textStyle.fontSize,
      color: textStyle.color,
      bold: textStyle.bold,
      align: textStyle.align,
    }
    elements.push(text)
  }

  return elements
}

async function parsePicture(
  zip: JSZip,
  picture: Element,
  slidePath: string,
  slideIndex: number,
  elementIndex: number,
  slideSize: SlideSize,
  rels: Map<string, Relationship>
): Promise<ImageElement | null> {
  const box = readBox(picture, slideSize)
  const blip = firstDescendant(picture, "blip")
  const relationshipId = blip?.getAttributeNS(RELATIONSHIP_NS, "embed") || blip?.getAttribute("r:embed")
  if (!box || !relationshipId) return null

  const rel = rels.get(relationshipId)
  if (!rel) return null

  const imagePath = resolveTarget(slidePath, rel.target)
  const imageFile = zip.file(imagePath)
  if (!imageFile) return null

  const base64 = await imageFile.async("base64")
  const image: ImageElement = {
    id: `slide-${slideIndex + 1}-element-${elementIndex + 1}-image`,
    type: "image",
    src: `data:${mimeTypeFor(imagePath)};base64,${base64}`,
    alt: readPictureAlt(picture),
    ...box,
  }
  return image
}

async function readSlidePaths(zip: JSZip, presentationDoc: Document): Promise<string[]> {
  const rels = await readRelationships(zip, "ppt/_rels/presentation.xml.rels")
  const orderedPaths = descendants(presentationDoc.documentElement, "sldId")
    .map((slideId) => slideId.getAttributeNS(RELATIONSHIP_NS, "id") || slideId.getAttribute("r:id"))
    .filter((id): id is string => Boolean(id))
    .map((id) => rels.get(id))
    .filter((rel): rel is Relationship => Boolean(rel))
    .map((rel) => resolveTarget("ppt/presentation.xml", rel.target))

  if (orderedPaths.length > 0) return orderedPaths

  return Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((a, b) => slideNumber(a) - slideNumber(b))
}

async function readRelationships(zip: JSZip, relsPath: string): Promise<Map<string, Relationship>> {
  const file = zip.file(relsPath)
  const map = new Map<string, Relationship>()
  if (!file) return map

  const doc = parseXml(await file.async("text"))
  for (const rel of descendants(doc.documentElement, "Relationship")) {
    const id = rel.getAttribute("Id")
    const target = rel.getAttribute("Target")
    const type = rel.getAttribute("Type") || ""
    if (id && target) {
      map.set(id, { id, target, type })
    }
  }
  return map
}

function readSlideSize(doc: Document): SlideSize {
  const size = firstDescendant(doc.documentElement, "sldSz")
  const cx = toNumber(size?.getAttribute("cx"), DEFAULT_SLIDE_SIZE.cx)
  const cy = toNumber(size?.getAttribute("cy"), DEFAULT_SLIDE_SIZE.cy)
  return { cx, cy }
}

function readSlideBackground(doc: Document): string | undefined {
  const bg = firstDescendant(doc.documentElement, "bg")
  return bg ? readSolidFill(bg) : undefined
}

function readBox(element: Element, slideSize: SlideSize): Box | null {
  const xfrm = firstDescendant(element, "xfrm")
  const off = xfrm ? firstChild(xfrm, "off") : undefined
  const ext = xfrm ? firstChild(xfrm, "ext") : undefined
  if (!off || !ext) return null

  const x = toPercent(toNumber(off.getAttribute("x")), slideSize.cx)
  const y = toPercent(toNumber(off.getAttribute("y")), slideSize.cy)
  const width = toPercent(toNumber(ext.getAttribute("cx")), slideSize.cx)
  const height = toPercent(toNumber(ext.getAttribute("cy")), slideSize.cy)
  return { x, y, width, height }
}

function readText(shape: Element): string {
  const txBody = firstChild(shape, "txBody")
  if (!txBody) return ""

  return descendants(txBody, "p")
    .map((paragraph) => descendants(paragraph, "t").map((text) => text.textContent || "").join(""))
    .filter((paragraph) => paragraph.trim().length > 0)
    .join("\n")
}

function readTextStyle(shape: Element) {
  const rPr = firstDescendant(shape, "rPr") || firstDescendant(shape, "defRPr")
  const pPr = firstDescendant(shape, "pPr")
  const latin = rPr ? firstDescendant(rPr, "latin") : undefined
  const algn = pPr?.getAttribute("algn")
  const fontSize = toNumber(rPr?.getAttribute("sz"), 2400) / 100

  return {
    font: latin?.getAttribute("typeface") || undefined,
    fontSize,
    color: rPr ? readSolidFill(rPr) : undefined,
    bold: rPr?.getAttribute("b") === "1" || rPr?.getAttribute("b") === "true",
    align: normalizeAlign(algn),
  }
}

function readLine(spPr: Element): { borderColor?: string; borderWidth?: number } | undefined {
  const line = firstChild(spPr, "ln")
  if (!line) return undefined

  return {
    borderColor: readSolidFill(line),
    borderWidth: Math.max(0.5, Math.round((toNumber(line.getAttribute("w"), 0) / 12_700) * 10) / 10),
  }
}

function readShapeType(spPr: Element): "rect" | "circle" | "roundRect" {
  const prst = firstDescendant(spPr, "prstGeom")?.getAttribute("prst")
  if (prst === "ellipse" || prst === "arc") return "circle"
  if (prst === "roundRect") return "roundRect"
  return "rect"
}

function readSolidFill(element: Element): string | undefined {
  const fill = firstDescendant(element, "solidFill")
  return fill ? colorFromSolidFill(fill) : undefined
}

function readDirectSolidFill(element: Element): string | undefined {
  const fill = firstChild(element, "solidFill")
  return fill ? colorFromSolidFill(fill) : undefined
}

function colorFromSolidFill(fill: Element): string | undefined {
  if (!fill) return undefined

  const srgb = firstDescendant(fill, "srgbClr")?.getAttribute("val")
  if (srgb) return `#${srgb}`

  const scheme = firstDescendant(fill, "schemeClr")?.getAttribute("val")
  return scheme ? schemeColorFallback(scheme) : undefined
}

function readPictureAlt(picture: Element): string {
  const cNvPr = firstDescendant(picture, "cNvPr")
  return cNvPr?.getAttribute("descr") || cNvPr?.getAttribute("name") || "Imported image"
}

function normalizeAlign(value: string | null | undefined): "left" | "center" | "right" {
  if (value === "ctr" || value === "center") return "center"
  if (value === "r" || value === "right") return "right"
  return "left"
}

function schemeColorFallback(value: string): string | undefined {
  const colors: Record<string, string> = {
    bg1: "#ffffff",
    tx1: "#111111",
    bg2: "#f5f4ed",
    tx2: "#4d4c48",
    accent1: "#c96442",
    accent2: "#5e5d59",
    accent3: "#87867f",
    accent4: "#d97757",
    accent5: "#30302e",
    accent6: "#e8e6dc",
  }
  return colors[value]
}

function firstChild(element: Element, localName: string): Element | undefined {
  return Array.from(element.children).find((child) => child.localName === localName)
}

function firstDescendant(element: Element, localName: string): Element | undefined {
  return descendants(element, localName)[0]
}

function descendants(element: Element, localName: string): Element[] {
  return Array.from(element.getElementsByTagName("*")).filter((child) => child.localName === localName)
}

function parseXml(xml: string): Document {
  const doc = new DOMParser().parseFromString(xml, "application/xml")
  const parserError = doc.getElementsByTagName("parsererror")[0]
  if (parserError) {
    throw new Error(parserError.textContent || "PPTX XML 解析失败")
  }
  return doc
}

async function readZipText(zip: JSZip, path: string): Promise<string> {
  const file = zip.file(path)
  if (!file) {
    throw new Error(`PPTX 文件缺少 ${path}`)
  }
  return file.async("text")
}

function relationshipPathFor(path: string): string {
  const slash = path.lastIndexOf("/")
  const dir = path.slice(0, slash)
  const file = path.slice(slash + 1)
  return `${dir}/_rels/${file}.rels`
}

function resolveTarget(sourcePath: string, target: string): string {
  if (target.startsWith("/")) return target.slice(1)

  const sourceDir = sourcePath.slice(0, sourcePath.lastIndexOf("/"))
  const parts = `${sourceDir}/${target}`.split("/")
  const resolved: string[] = []

  for (const part of parts) {
    if (!part || part === ".") continue
    if (part === "..") {
      resolved.pop()
    } else {
      resolved.push(part)
    }
  }
  return resolved.join("/")
}

function mimeTypeFor(path: string): string {
  const lower = path.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".gif")) return "image/gif"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".svg")) return "image/svg+xml"
  return "application/octet-stream"
}

function slideNumber(path: string): number {
  return Number(path.match(/slide(\d+)\.xml$/)?.[1] || 0)
}

function cleanTitle(sourceName: string): string {
  return sourceName.replace(/\.pptx$/i, "") || "导入的 PPT"
}

function toNumber(value: string | null | undefined, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toPercent(value: number, total: number): number {
  return Math.round((value / total) * 10_000) / 100
}
