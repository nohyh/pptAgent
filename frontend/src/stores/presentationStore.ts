import type { BlockElement, ImageElement, Presentation, Slide, SlideElement, TableElement, TextElement } from "@/types/presentation";
import { create } from "zustand";
import { useEditorStore } from "./editorStore";
import apiClient from "@/api/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";

type ElementUpdate =
    | Partial<TextElement>
    | Partial<ImageElement>
    | Partial<BlockElement>
    | Partial<TableElement>;

interface PresentationState {
  presentation: Presentation | null;
  history: Slide[];
  future: Slide[];

  setPresentation: (data: Presentation) => void;

  setTitle: (newTitle: string) => void;

  updateElement :(slideId:string,elementId:string,updates:ElementUpdate)=>void;
  deleteElement: (slideId: string, elementId: string) => void;
  undo: (slideId: string) => void;
  redo: (slideId: string) => void;
  clearHistory: () => void;

  generatePresentation: () => Promise<void>
  
  isLoading:boolean;
  generateError: string | null;
}

const HISTORY_LIMIT = 30;
const USE_MOCK_PRESENTATION = import.meta.env.VITE_USE_MOCK_PRESENTATION === "true";

function pushHistory(history: Slide[], slide: Slide): Slide[] {
    return [...history, slide].slice(-HISTORY_LIMIT);
}

const usePresentationStore =  create<PresentationState>((set)=>({
    presentation :null,
    history:[],
    future:[],
    isLoading:false,
    generateError:null,
    setPresentation :(newPresentation)=>set({
        presentation: newPresentation,
        history: [],
        future: [],
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
        const currentSlide = state.presentation.slides.find((slide) => slide.id === slideId);
        if (!currentSlide) return state;
        const nextPresentation = {
            ...state.presentation,
            slides: state.presentation.slides.map((slide)=>{
                if(slide.id!==slideId) return slide;
            return {
                ...slide,
                elements:slide.elements.map((el)=>{
                    if(el.id!==elementId) return el;
                    return{...el,...updates} as SlideElement;
                })
            }})
        };
        return{
            presentation: nextPresentation,
            history: pushHistory(state.history, currentSlide),
            future: [],
        }
    }),

    deleteElement:(slideId,elementId)=>set((state)=>{
        if (!state.presentation) return state;
        const currentSlide = state.presentation.slides.find((slide) => slide.id === slideId);
        if (!currentSlide) return state;
        const nextPresentation = {
            ...state.presentation,
            slides: state.presentation.slides.map((slide)=>{
                if(slide.id!==slideId) return slide;
            return {
                ...slide,
                elements:slide.elements.filter((el)=>el.id!==elementId)
            }})
        };
        return{
            presentation: nextPresentation,
            //保存撤销历史状态
            history: pushHistory(state.history, currentSlide),
            //清空未来状态
            future: [],
        }
    }),

    undo:(slideId)=>set((state)=>{
        if (!state.presentation || state.history.length === 0) return state;
        //获取上一个页面状态
        const previous = state.history[state.history.length - 1];
        if (previous.id !== slideId) return state;
        const currentSlide = state.presentation.slides.find((slide) => slide.id === slideId);
        if (!currentSlide) return state;
        return {
            presentation: {
                ...state.presentation,
                slides: state.presentation.slides.map((slide) =>
                    slide.id === slideId ? previous : slide
                ),
            },
            //去掉刚刚获取的上一个页面状态
            history: state.history.slice(0, -1),
            //将当前页面状态加入未来状态
            future: [currentSlide, ...state.future].slice(0, HISTORY_LIMIT),
        }
    }),

    redo:(slideId)=>set((state)=>{
        if (!state.presentation || state.future.length === 0) return state;
        //获取下一个页面状态
        const next = state.future[0];
        if (next.id !== slideId) return state;
        const currentSlide = state.presentation.slides.find((slide) => slide.id === slideId);
        if (!currentSlide) return state;
        return {
            presentation: {
                ...state.presentation,
                slides: state.presentation.slides.map((slide) =>
                    slide.id === slideId ? next : slide
                ),
            },
            //将当前页面状态加入撤销历史
            history: pushHistory(state.history, currentSlide),
            //去掉下一个页面状态
            future: state.future.slice(1),
        }
    }),

    clearHistory: () => set({
        history: [],
        future: [],
    }),


    generatePresentation: async()=>{
        const {prompt,title,sections,style,pageCount}=useEditorStore.getState()
        set({isLoading:true, generateError:null})
        try {
            const res = USE_MOCK_PRESENTATION
                ? await apiClient.get("/mockPresentation")
                : await apiClient.post("/generatePpt",{
                    prompt,
                    layout:"16x9",
                    theme:style,
                    title,
                    sections,
                    pageCount
                })
            set({
                presentation: res.data,
                history: [],
                future: [],
            })
        } catch (error) {
            set({
                generateError: getApiErrorMessage(error, "PPT 生成失败，请稍后重试。")
            })
        } finally {
            set({isLoading:false})
        }
    }
}))

export{usePresentationStore}
