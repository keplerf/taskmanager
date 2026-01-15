import type { ColumnType } from '../../constants/columnTypes.js';

export interface Board {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  title: string;
  type: ColumnType;
  width: number;
  position: number;
  settings: ColumnSettings | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColumnSettings {
  options?: StatusOption[];
  dateFormat?: string;
  includeTime?: boolean;
  unit?: string;
  decimalPlaces?: number;
}

export interface StatusOption {
  id: string;
  label: string;
  color: string;
}

export interface ItemGroup {
  id: string;
  boardId: string;
  name: string;
  color: string;
  position: number;
  collapsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  groupId: string;
  name: string;
  position: number;
  createdById: string;
  updatedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemValue {
  id: string;
  itemId: string;
  columnId: string;
  value: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardWithColumns extends Board {
  columns: BoardColumn[];
}

export interface BoardFull extends Board {
  columns: BoardColumn[];
  groups: ItemGroupWithItems[];
}

export interface ItemGroupWithItems extends ItemGroup {
  items: ItemWithValues[];
}

export interface ItemWithValues extends Item {
  values: ItemValue[];
  assignees: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  }[];
}
