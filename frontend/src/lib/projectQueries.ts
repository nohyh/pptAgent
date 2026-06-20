import { QueryClient } from "@tanstack/react-query"
import apiClient from "@/api/apiClient"
import type { Presentation } from "@/types/presentation"

export interface ProjectSummary {
  id: string
  title: string
  isPending?: boolean
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    },
  },
})

export const projectKeys = {
  list: ["projects"] as const,
  detail: (projectId: string) => ["project", projectId] as const,
}

export async function fetchProjectsApi(): Promise<ProjectSummary[]> {
  const res = await apiClient.get<ProjectSummary[]>("/projects")
  return res.data
}

export async function fetchProjectApi(projectId: string): Promise<Presentation> {
  const res = await apiClient.get<Presentation>(`/projects/${projectId}`)
  return res.data
}
