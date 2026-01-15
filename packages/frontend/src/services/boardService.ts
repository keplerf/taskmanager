import { api } from './api';

interface ItemValue {
  id: string;
  columnId: string;
  value: unknown;
}

interface Item {
  id: string;
  name: string;
  position: number;
  groupId: string;
  values: ItemValue[];
}

interface ItemGroup {
  id: string;
  name: string;
  color: string;
  position: number;
  collapsed: boolean;
  items: Item[];
}

interface BoardColumn {
  id: string;
  title: string;
  type: string;
  width: number;
  position: number;
}

interface Board {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  isArchived: boolean;
  columns: BoardColumn[];
  groups: ItemGroup[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function createBoard(data: {
  name: string;
  description?: string;
  workspaceId: string;
}) {
  const response = await api.post<ApiResponse<Board>>('/boards', data);
  return response.data.data;
}

export async function getBoard(id: string) {
  const response = await api.get<ApiResponse<Board>>(`/boards/${id}`);
  return response.data.data;
}

export async function updateBoard(
  id: string,
  data: { name?: string; description?: string; isArchived?: boolean }
) {
  const response = await api.patch<ApiResponse<Board>>(`/boards/${id}`, data);
  return response.data.data;
}

export async function deleteBoard(id: string) {
  await api.delete(`/boards/${id}`);
}

export async function createColumn(data: {
  boardId: string;
  title: string;
  type: string;
  position?: number;
}) {
  const response = await api.post<ApiResponse<unknown>>('/boards/columns', data);
  return response.data.data;
}

export async function createGroup(data: {
  boardId: string;
  name: string;
  color?: string;
}) {
  const response = await api.post<ApiResponse<unknown>>('/boards/groups', data);
  return response.data.data;
}

export async function createItem(data: { groupId: string; name: string }) {
  const response = await api.post<ApiResponse<unknown>>('/boards/items', data);
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
  data: { name?: string; position?: number }
) {
  const response = await api.patch<ApiResponse<unknown>>(
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
