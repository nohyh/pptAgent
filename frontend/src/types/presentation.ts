// 1. 基础元素接口（所有元素都有的共同属性）
interface BaseElement {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: "text" | "image" | "block" | "table"  // 关键：用于区分是什么类型的元素
}

export interface TextElement extends BaseElement {
  type: "text"
  content: string
  font?: string   // 可选，不传就用默认
  fontSize: number     
  color?: string        
  bold?: boolean
  align?: "left" | "center" | "right"
}

export interface ImageElement extends BaseElement {
  type: "image"
  src: string
  alt?: string
}

export interface BlockElement extends BaseElement {
  type: "block"
  shapeType: "rect"|"circle"|"roundRect"
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
}

export interface TableElement extends BaseElement {
  type: "table"
  markdown: string      
} //  这一部分和想象不符，暂时废弃

// 3. 把所有元素联合起来
export type SlideElement = TextElement | ImageElement | BlockElement | TableElement

// 4. 单页幻灯片
export interface Slide {
  id: string
  background?: string   
  elements: SlideElement[]  // 所有元素都在一个数组里，依靠数组顺序决定层级
}

// 5. 整个 PPT 数据
export interface Presentation {
  id: string
  title: string
  layout: "16x9" | "4x3"
  theme: string
  slides: Slide[]
}