import type { Board, BoardColumn, ItemGroup, Item, ItemValue, BoardFull } from '../entities/board.types.js';
import type { ColumnType } from '../../constants/columnTypes.js';

export interface CreateBoardRequest {
  name: string;
  description?: string;
  workspaceId: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  isArchived?: boolean;
}

export interface CreateColumnRequest {
  boardId: string;
  title: string;
  type: ColumnType;
  position?: number;
  settings?: Record<string, unknown>;
}

export interface UpdateColumnRequest {
  title?: string;
  width?: number;
  position?: number;
  settings?: Record<string, unknown>;
}

export interface CreateGroupRequest {
  boardId: string;
  name: string;
  color?: string;
  position?: number;
}

export interface UpdateGroupRequest {
  name?: string;
  color?: string;
  position?: number;
  collapsed?: boolean;
}

export interface CreateItemRequest {
  groupId: string;
  name: string;
  position?: number;
}

export interface UpdateItemRequest {
  name?: string;
  groupId?: string;
  position?: number;
}

export interface UpdateItemValueRequest {
  value: unknown;
}

export type BoardResponse = Board;
export type BoardFullResponse = BoardFull;
export type ColumnResponse = BoardColumn;
export type GroupResponse = ItemGroup;
export type ItemResponse = Item;
export type ItemValueResponse = ItemValue;
