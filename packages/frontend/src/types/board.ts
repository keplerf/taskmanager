import type { UserInfo } from './user';

/**
 * Value stored for an item in a specific column
 */
export interface ItemValue {
  id: string;
  columnId: string;
  value: unknown;
}

/**
 * Assignee relationship for an item
 */
export interface ItemAssignee {
  user: UserInfo;
}

/**
 * Board item (task/row)
 */
export interface Item {
  id: string;
  name: string;
  position: number;
  groupId: string;
  createdAt: string;
  values: ItemValue[];
  createdBy: UserInfo | null;
  assignees: ItemAssignee[];
}

/**
 * Group of items within a board
 */
export interface ItemGroup {
  id: string;
  name: string;
  color: string;
  position: number;
  collapsed: boolean;
  items: Item[];
}

/**
 * Column definition for a board
 */
export interface BoardColumn {
  id: string;
  title: string;
  type: string;
  width: number;
  position: number;
  settings?: Record<string, unknown>;
}

/**
 * Complete board data with columns and groups
 */
export interface BoardData {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  columns: BoardColumn[];
  groups: ItemGroup[];
}

/**
 * Board with archive status (used in API responses)
 */
export interface Board extends BoardData {
  isArchived: boolean;
}

/**
 * Minimal board info for lists and references
 */
export interface BoardSummary {
  id: string;
  name: string;
  description: string | null;
  isArchived?: boolean;
}

/**
 * Activity log entry for an item
 */
export interface Activity {
  id: string;
  action: string;
  field: string | null;
  oldValue: unknown;
  newValue: unknown;
  description: string | null;
  createdAt: string;
  user: UserInfo;
}

/**
 * Board store state
 */
export interface BoardState {
  boardData: BoardData | null;
  selectedItemId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setBoardData: (data: BoardData) => void;
  setSelectedItemId: (itemId: string | null) => void;

  // Optimistic updates
  updateItemName: (itemId: string, name: string) => void;
  updateItemValue: (itemId: string, columnId: string, value: unknown) => void;
  updateItemOwner: (itemId: string, owner: UserInfo | null) => void;
  updateItemAssignees: (itemId: string, assignees: ItemAssignee[]) => void;
  deleteItemOptimistic: (itemId: string) => void;
  moveItemOptimistic: (itemId: string, targetGroupId: string, position: number) => void;

  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}
