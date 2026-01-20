import { api } from './api';
import type {
  ApiResponse,
  Workspace,
  WorkspaceWithBoards,
  WorkspaceUser,
  Organization,
  AvailableUser,
} from '../types';

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

export async function getWorkspaceUsers(workspaceId: string) {
  const response = await api.get<ApiResponse<WorkspaceUser[]>>(`/workspaces/${workspaceId}/users`);
  return response.data.data;
}

export async function getUserOrganizations() {
  const response = await api.get<ApiResponse<Organization[]>>('/workspaces/organizations');
  return response.data.data;
}

export async function getAvailableUsers(workspaceId: string) {
  const response = await api.get<ApiResponse<AvailableUser[]>>(`/workspaces/${workspaceId}/available-users`);
  return response.data.data;
}

export async function addUserToWorkspace(workspaceId: string, userId: string, role?: string) {
  const response = await api.post<ApiResponse<WorkspaceUser>>(`/workspaces/${workspaceId}/users`, { userId, role });
  return response.data.data;
}

export async function getWorkspaceTags(workspaceId: string) {
  const response = await api.get<ApiResponse<string[]>>(`/workspaces/${workspaceId}/tags`);
  return response.data.data;
}

// Re-export types for backwards compatibility
export type { WorkspaceUser, Organization, AvailableUser } from '../types';
