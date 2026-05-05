import type { Presentation } from "@/types/presentation";
import { create } from "zustand";
import { mockPresentation} from  "@/mock/presentationData"
interface PresentationState {
  presentation: Presentation | null;
  
  setPresentation: (data: Presentation) => void;
  
  setTitle: (newTitle: string) => void;

  updateElement :(slideId:string,elementId:string,updates:any)=>void;
}
const usePresentationStore =  create<PresentationState>((set)=>({
    presentation :mockPresentation,
    setPresentation :(newPresentation)=>set({
        presentation: newPresentation
    }),

    setTitle :(newTitle)=>set((state)=>{
        if(!state.presentation)return state;
        return {
            presentation:{
                ...state.presentation,
                title:newTitle
            }
        }
    }),

    updateElement:(slideId,elementId,updates)=>set((state)=>{
        if (!state.presentation) return state; 
        return{
            presentation:{
                ...state.presentation,
                slides: state.presentation.slides.map((slide)=>{
                    if(slide.id!==slideId) return slide;
                return {
                    ...slide,
                    elements:slide.elements.map((el)=>{
                        if(el.id!==elementId) return el;
                        return{...el,...updates};
                    })
                }})
            }
        }
    })
}))

export{usePresentationStore} 