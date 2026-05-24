import type { Presentation } from "@/types/presentation";
import { create } from "zustand";
import { mockPresentation} from  "@/mock/presentationData"
import { useEditorStore, type EditorState } from "./editorStore";
import apiClient from "@/api/apiClient";
interface PresentationState {
  presentation: Presentation | null;

  setPresentation: (data: Presentation) => void;

  setTitle: (newTitle: string) => void;

  updateElement :(slideId:string,elementId:string,updates:any)=>void;
  deleteElement: (slideId: string, elementId: string) => void;
  moveElement: (slideId: string, elementId: string, direction: "up" | "down") => void;

  generatePresentation: () => Promise<void>
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
    }),

    deleteElement:(slideId,elementId)=>set((state)=>{
        if (!state.presentation) return state;
        return{
            presentation:{
                ...state.presentation,
                slides: state.presentation.slides.map((slide)=>{
                    if(slide.id!==slideId) return slide;
                return {
                    ...slide,
                    elements:slide.elements.filter((el)=>el.id!==elementId)
                }})
            }
        }
    }),

    moveElement:(slideId,elementId,direction)=>set((state)=>{
        if (!state.presentation) return state;
        return{
            presentation:{
                ...state.presentation,
                slides: state.presentation.slides.map((slide)=>{
                    if(slide.id!==slideId) return slide;
                const idx = slide.elements.findIndex((el)=>el.id===elementId);
                if (idx === -1) return slide;
                const newIdx = direction === "up" ? idx + 1 : idx - 1;
                if (newIdx < 0 || newIdx >= slide.elements.length) return slide;
                const elements = [...slide.elements];
                [elements[idx], elements[newIdx]] = [elements[newIdx], elements[idx]];
                return {
                    ...slide,
                    elements
                }})
            }
        }
    }),

    generatePresentation: async()=>{
        const {prompt,title,sections,style,pageCount,verbosity}=useEditorStore.getState()
        const res = await apiClient.post("/generatePpt",{
            prompt,
            layout:"16x9",
            theme:style,
            title,
            sections,
            pageCount,
            verbosity
        })
        set({
            presentation: res.data
        })
    }
}))

export{usePresentationStore}