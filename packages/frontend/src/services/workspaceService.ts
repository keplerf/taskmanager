import { api } from './api';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
  organizationId: string;
}

interface WorkspaceWithBoards extends Workspace {
  boards: {
    id: string;
    name: string;
    description: string | null;
    isArchived: boolean;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getWorkspaces() {
  const response = await api.get<ApiResponse<WorkspaceWithBoards[]>>('/workspaces');
  return response.data.data;
}

export async function getWorkspace(id: string) {
  const response = await api.get<ApiResponse<WorkspaceWithBoards>>(`/workspaces/${id}`);
  return response.data.data;
}

export async function createWorkspace(data: {
  name: string;
  organizationId: string;
  description?: string;
}) {
  const response = await api.post<ApiResponse<Workspace>>('/workspaces', data);
  return response.data.data;
}

export async function updateWorkspace(
  id: string,
  data: { name?: string; description?: string; color?: string }
) {
  const response = await api.patch<ApiResponse<Workspace>>(
    `/workspaces/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteWorkspace(id: string) {
  await api.delete(`/workspaces/${id}`);
}
