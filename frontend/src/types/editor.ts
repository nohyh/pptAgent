import type  {Presentation, Slide} from "@/types/presentation"
export interface SlideCanvasProps{
    slide: Slide;
    layout?: Presentation["layout"];
    selectedId?:string|null;
    setSelectedId?:(id:string|null)=>void;
}
