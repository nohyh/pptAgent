import type { BlockElement, ImageElement, Presentation, Slide, SlideElement, TableElement, TextElement } from "@/types/presentation";
import { create } from "zustand";
import { useEditorStore } from "./editorStore";
import apiClient from "@/api/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";
import {
    fetchProjectApi,
    fetchProjectsApi,
    projectKeys,
    queryClient,
    type ProjectSummary,
} from "@/lib/projectQueries";
import { useAuthStore } from "@/stores/authStore";

type ElementUpdate =
    | Partial<TextElement>
    | Partial<ImageElement>
    | Partial<BlockElement>
    | Partial<TableElement>;

interface PresentationState {
 projects: ProjectSummary[];
  presentation: Presentation | null;
  history: Slide[];
  future: Slide[];
  fetchProjects:()=>Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setPresentation: (data: Presentation) => void;
  clearPresentation: () => void;

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
const PENDING_PROJECT_ID = "__pending_generation__";
const USE_MOCK_PRESENTATION = import.meta.env.VITE_USE_MOCK_PRESENTATION === "true";

function pushHistory(history: Slide[], slide: Slide): Slide[] {
    return [...history, slide].slice(-HISTORY_LIMIT);
}

function moveProjectToTop(projects: ProjectSummary[], presentation: Presentation): ProjectSummary[] {
    const summary = {
        id: presentation.id,
        title: presentation.title || "未命名演示文稿",
    };
    return [
        summary,
        ...projects.filter((project) => project.id !== presentation.id),
    ];
}

function cacheProjectAtTop(presentation: Presentation) {
    // 详情缓存和列表缓存同步更新，侧边栏点击最近项目时可以直接命中本地数据。
    queryClient.setQueryData(projectKeys.detail(presentation.id), presentation);
    queryClient.setQueryData<ProjectSummary[]>(projectKeys.list, (projects = []) =>
        moveProjectToTop(projects, presentation),
    );
}

// 编辑器的每次手动修改都会更新 Presentation JSON，这里做轻量防抖保存。
let t :ReturnType<typeof setTimeout>|null = null
function debounceSave(presentation:Presentation){
    if (!useAuthStore.getState().user || !presentation.id) return;
    cacheProjectAtTop(presentation);
    usePresentationStore.setState((state) => ({
        projects: moveProjectToTop(state.projects, presentation),
    }));
    if(t) clearTimeout(t);
    t=setTimeout(()=>{
        apiClient.put<Presentation>("/project",presentation)
            .then((res) => {
                cacheProjectAtTop(res.data);
                usePresentationStore.setState((state) => ({
                    projects: moveProjectToTop(state.projects, res.data),
                }));
                queryClient.invalidateQueries({ queryKey: projectKeys.list });
            })
            .catch((error) => {
                usePresentationStore.setState({
                    generateError: getApiErrorMessage(error, "自动保存失败，请确认登录状态后重试。")
                })
            })
    },1000);
}

const usePresentationStore =  create<PresentationState>((set,get)=>({
    projects:[],
    presentation :null,
    history:[],
    future:[],
    isLoading:false,
    generateError:null,
    //获取项目列表
    fetchProjects:async ()=>{
        if (!useAuthStore.getState().user) {
            set({ projects: [] });
            queryClient.removeQueries({ queryKey: projectKeys.list });
            return;
        }
        try {
            // 项目列表通过 TanStack Query 缓存，避免每次展开侧边栏都重新请求。
            const projects = await queryClient.fetchQuery({
                queryKey: projectKeys.list,
                queryFn: fetchProjectsApi,
            });
            const pendingProjects = get().projects.filter((project) => project.isPending);
            set({
                projects: [
                    ...pendingProjects,
                    ...projects.filter((project) => !pendingProjects.some((pending) => pending.id === project.id)),
                ],
            });
        } catch (error) {
            set({
                generateError: getApiErrorMessage(error, "项目列表获取失败，请稍后重试。")
            })
        }
    },
    loadProject: async (projectId: string) => {
        if (projectId === PENDING_PROJECT_ID) return;
        set({ isLoading: true, generateError: null });
        try {
            // 最近项目 hover 时会预取详情；命中缓存即可秒开编辑器。
            const cached = queryClient.getQueryData<Presentation>(projectKeys.detail(projectId));
            const presentation = cached ?? await queryClient.fetchQuery({
                queryKey: projectKeys.detail(projectId),
                queryFn: () => fetchProjectApi(projectId),
            });
            set({
                presentation,
                history: [],
                future: [],
            });
        } catch (error) {
            set({
                generateError: getApiErrorMessage(error, "加载项目失败，请稍后重试。")
            });
        } finally {
            set({ isLoading: false });
        }
    },
    deleteProject: async (projectId: string) => {
        const previousProjects = get().projects;
        const previousList = queryClient.getQueryData<ProjectSummary[]>(projectKeys.list);
        const previousDetail = queryClient.getQueryData<Presentation>(projectKeys.detail(projectId));
        const previousPresentation = get().presentation;

        set((state) => ({
            projects: state.projects.filter((project) => project.id !== projectId),
            presentation: state.presentation?.id === projectId ? null : state.presentation,
            generateError: null,
        }));
        queryClient.setQueryData<ProjectSummary[]>(projectKeys.list, (projects = []) =>
            projects.filter((project) => project.id !== projectId),
        );
        queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });

        try {
            await apiClient.delete(`/project/${projectId}`);
            queryClient.invalidateQueries({ queryKey: projectKeys.list });
        } catch (error) {
            queryClient.setQueryData(projectKeys.list, previousList);
            if (previousDetail) {
                queryClient.setQueryData(projectKeys.detail(projectId), previousDetail);
            }
            set({
                projects: previousProjects,
                presentation: previousPresentation,
                generateError: getApiErrorMessage(error, "删除项目失败，请稍后重试。")
            });
        }
    },
    setPresentation :(newPresentation)=>{
        cacheProjectAtTop(newPresentation);
        set({
            presentation: newPresentation,
            projects: moveProjectToTop(get().projects, newPresentation),
            history: [],
            future: [],
        })
    },
    clearPresentation: () => set({
        presentation: null,
        history: [],
        future: [],
        generateError: null,
    }),

    setTitle :(newTitle)=>set((state)=>{
        if(!state.presentation)return state;
        const nextPresentation = {
            ...state.presentation,
            title:newTitle
        };
        debounceSave(nextPresentation);
        return {
            presentation: nextPresentation
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
        //异步保存到数据库
        debounceSave(nextPresentation);
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
        //异步保存到数据库
        debounceSave(nextPresentation);
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
        const nextPresentation = {
            ...state.presentation,
            slides: state.presentation.slides.map((slide) =>
                slide.id === slideId ? previous : slide
            ),
        };
        //异步保存到数据库
        debounceSave(nextPresentation);
        return {
            presentation: nextPresentation,
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
        const nextPresentation = {
            ...state.presentation,
            slides: state.presentation.slides.map((slide) =>
                slide.id === slideId ? next : slide
            ),
        };
        //异步保存到数据库
        debounceSave(nextPresentation);
        return {
            presentation: nextPresentation,
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
        const auth = useAuthStore.getState();
        if (!auth.user) {
            auth.openAuthDialog();
            set({ generateError: "请先登录后再生成 PPT。" });
            return;
        }
        const {prompt,title,sections,style,pageCount}=useEditorStore.getState()
        const pendingTitle = title || "未命名演示文稿";
        // 点击生成后先把 pending 项目放到 Recent 顶部，生成完成后再替换为真实项目。
        set((state) => ({
            isLoading:true,
            generateError:null,
            projects: [
                { id: PENDING_PROJECT_ID, title: pendingTitle, isPending: true },
                ...state.projects.filter((project) => project.id !== PENDING_PROJECT_ID),
            ],
        }))
        try {
            const res = USE_MOCK_PRESENTATION || useEditorStore.getState().useMockMode
                ? await apiClient.get("/mockPresentation")
                : await apiClient.post("/generatePpt",{
                    prompt,
                    layout:"16x9",
                    theme:style,
                    title,
                    sections,
                    pageCount
                })
                //保存到数据库
                const saved = await apiClient.post<Presentation>("/project",{
                    presentation_data: res.data,
                })
                cacheProjectAtTop(saved.data);
                queryClient.invalidateQueries({ queryKey: projectKeys.list });
                await useAuthStore.getState().refreshProfile();
                //刷新项目列表
                await get().fetchProjects();
            set({
                presentation: saved.data,
                history: [],
                future: [],
                projects: get().projects.filter((project) => project.id !== PENDING_PROJECT_ID),
            })
        } catch (error) {
            set({
                generateError: getApiErrorMessage(error, "PPT 生成失败，请稍后重试。"),
                projects: get().projects.filter((project) => project.id !== PENDING_PROJECT_ID),
            })
        } finally {
            set({isLoading:false})
        }
    }
}))

export{usePresentationStore}
