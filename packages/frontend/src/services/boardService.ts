import { api } from "./api";
import type { ApiResponse, Board, Item, Activity } from "../types";
import type { CreateBoardRequest, UpdateBoardRequest, CreateColumnRequest, CreateGroupRequest } from "../../../shared/src/types/api/boards.api";

export async function createBoard(data: CreateBoardRequest) {
  const response = await api.post<ApiResponse<Board>>("/boards", data);
  return response.data.data;
}

export async function getBoard(id: string) {
  const response = await api.get<ApiResponse<Board>>(`/boards/${id}`);
  return response.data.data;
}

export async function updateBoard(
  id: string,
  data: UpdateBoardRequest
) {
  const response = await api.patch<ApiResponse<Board>>(`/boards/${id}`, data);
  return response.data.data;
}

export async function deleteBoard(id: string) {
  await api.delete(`/boards/${id}`);
}

export async function createColumn(data: CreateColumnRequest) {
  const response = await api.post<ApiResponse<unknown>>(
    "/boards/columns",
    data
  );
  return response.data.data;
}

export async function createGroup(data: CreateGroupRequest) {
  const response = await api.post<ApiResponse<unknown>>("/boards/groups", data);
  return response.data.data;
}

export async function createItem(data: { groupId: string; name: string }) {
  const response = await api.post<ApiResponse<Item>>("/boards/items", data);
  return response.data.data;
}

export async function updateItemValue(
  itemId: string,
  columnId: string,
  value: unknown
) {
  const response = await api.patch<ApiResponse<unknown>>(
    `/boards/items/${itemId}/values/${columnId}`,
    { value }
  );
  return response.data.data;
}

export async function updateItem(
  itemId: string,
  data: { name?: string; position?: number; createdById?: string }
) {
  const response = await api.patch<ApiResponse<Item>>(
    `/boards/items/${itemId}`,
    data
  );
  return response.data.data;
}

export async function deleteItem(itemId: string) {
  await api.delete(`/boards/items/${itemId}`);
}

export async function moveItemToGroup(
  itemId: string,
  groupId: string,
  position?: number
) {
  const response = await api.patch<ApiResponse<unknown>>(
    `/boards/items/${itemId}/move`,
    { groupId, position }
  );
  return response.data.data;
}

export async function updateItemAssignees(itemId: string, userIds: string[]) {
  const response = await api.patch<ApiResponse<Item>>(
    `/boards/items/${itemId}/assignees`,
    { userIds }
  );
  return response.data.data;
}

export async function getItemActivities(
  itemId: string,
  limit = 50,
  offset = 0
) {
  const response = await api.get<ApiResponse<Activity[]>>(
    `/boards/items/${itemId}/activities?limit=${limit}&offset=${offset}`
  );
  return response.data.data;
}

// Re-export Activity type for backwards compatibility
export type { Activity } from "../types";
