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

export interface WorkspaceUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
  role: string;
}

export async function getWorkspaceUsers(workspaceId: string) {
  const response = await api.get<ApiResponse<WorkspaceUser[]>>(`/workspaces/${workspaceId}/users`);
  return response.data.data;
}

export interface Organization {
  id: string;
  name: string;
}

export async function getUserOrganizations() {
  const response = await api.get<ApiResponse<Organization[]>>('/workspaces/organizations');
  return response.data.data;
}

export interface AvailableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  isMember: boolean;
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
