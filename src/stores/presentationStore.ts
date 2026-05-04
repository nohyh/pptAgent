import type { Presentation } from "@/types/presentation";
import { create } from "zustand";
import { mockPresentation} from  "@/mock/presentationData"
interface PresentationState {
  presentation: Presentation | null;
  
  setPresentation: (data: Presentation) => void;
  
  setTitle: (newTitle: string) => void;
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
    })
}))

export{usePresentationStore} 