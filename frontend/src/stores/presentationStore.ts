import type { Presentation } from "@/types/presentation";
import { create } from "zustand";
import { useEditorStore } from "./editorStore";
import apiClient from "@/api/apiClient";
interface PresentationState {
  presentation: Presentation | null;

  setPresentation: (data: Presentation) => void;

  setTitle: (newTitle: string) => void;

  updateElement :(slideId:string,elementId:string,updates:any)=>void;
  deleteElement: (slideId: string, elementId: string) => void;

  generatePresentation: () => Promise<void>
  
  isLoading:boolean;
}
const usePresentationStore =  create<PresentationState>((set)=>({
    presentation :null,
    isLoading:false,
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


    generatePresentation: async()=>{
        const {prompt,title,sections,style,pageCount,verbosity}=useEditorStore.getState()
        set({isLoading:true})
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
            presentation: res.data,
            isLoading:false
        })
    }
}))

export{usePresentationStore}