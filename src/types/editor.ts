import {Slide} from "@/types/presentation"
export interface SlideCanvasProps{
    slide: Slide;
    selectedId?:string|null;
    setSelectedId?:(id:string|null)=>void;
}