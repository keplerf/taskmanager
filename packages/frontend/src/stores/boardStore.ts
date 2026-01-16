import { create } from 'zustand';

interface ItemValue {
  id: string;
  columnId: string;
  value: unknown;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface Item {
  id: string;
  name: string;
  position: number;
  groupId: string;
  createdAt: string;
  values: ItemValue[];
  createdBy: UserInfo | null;
  assignees: { user: UserInfo }[];
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
  settings?: Record<string, unknown>;
}

interface BoardData {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  columns: BoardColumn[];
  groups: ItemGroup[];
}

interface BoardState {
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
  updateItemAssignees: (itemId: string, assignees: { user: UserInfo }[]) => void;
  deleteItemOptimistic: (itemId: string) => void;
  moveItemOptimistic: (itemId: string, targetGroupId: string, position: number) => void;

  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  boardData: null,
  selectedItemId: null,
  isLoading: false,
  error: null,

  setBoardData: (boardData) => set({ boardData }),
  setSelectedItemId: (selectedItemId) => set({ selectedItemId }),

  // Optimistic update for item name
  updateItemName: (itemId, name) =>
    set((state) => {
      if (!state.boardData) return state;
      return {
        boardData: {
          ...state.boardData,
          groups: state.boardData.groups.map((group) => ({
            ...group,
            items: group.items.map((item) =>
              item.id === itemId ? { ...item, name } : item
            ),
          })),
        },
      };
    }),

  // Optimistic update for item value
  updateItemValue: (itemId, columnId, value) =>
    set((state) => {
      if (!state.boardData) return state;
      return {
        boardData: {
          ...state.boardData,
          groups: state.boardData.groups.map((group) => ({
            ...group,
            items: group.items.map((item) => {
              if (item.id !== itemId) return item;
              const existingValue = item.values.find((v) => v.columnId === columnId);
              if (existingValue) {
                return {
                  ...item,
                  values: item.values.map((v) =>
                    v.columnId === columnId ? { ...v, value } : v
                  ),
                };
              }
              return {
                ...item,
                values: [...item.values, { id: crypto.randomUUID(), columnId, value }],
              };
            }),
          })),
        },
      };
    }),

  // Optimistic update for item owner
  updateItemOwner: (itemId, owner) =>
    set((state) => {
      if (!state.boardData) return state;
      return {
        boardData: {
          ...state.boardData,
          groups: state.boardData.groups.map((group) => ({
            ...group,
            items: group.items.map((item) =>
              item.id === itemId ? { ...item, createdBy: owner } : item
            ),
          })),
        },
      };
    }),

  // Optimistic update for item assignees
  updateItemAssignees: (itemId, assignees) =>
    set((state) => {
      if (!state.boardData) return state;
      return {
        boardData: {
          ...state.boardData,
          groups: state.boardData.groups.map((group) => ({
            ...group,
            items: group.items.map((item) =>
              item.id === itemId ? { ...item, assignees } : item
            ),
          })),
        },
      };
    }),

  // Optimistic delete
  deleteItemOptimistic: (itemId) =>
    set((state) => {
      if (!state.boardData) return state;
      return {
        boardData: {
          ...state.boardData,
          groups: state.boardData.groups.map((group) => ({
            ...group,
            items: group.items.filter((item) => item.id !== itemId),
          })),
        },
        selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId,
      };
    }),

  // Optimistic move
  moveItemOptimistic: (itemId, targetGroupId, position) =>
    set((state) => {
      if (!state.boardData) return state;

      let itemToMove: Item | null = null;
      const groups = state.boardData.groups.map((group) => {
        const item = group.items.find((i) => i.id === itemId);
        if (item) {
          itemToMove = { ...item, groupId: targetGroupId, position };
          return {
            ...group,
            items: group.items.filter((i) => i.id !== itemId),
          };
        }
        return group;
      });

      if (!itemToMove) return state;

      return {
        boardData: {
          ...state.boardData,
          groups: groups.map((group) =>
            group.id === targetGroupId
              ? { ...group, items: [...group.items, itemToMove!] }
              : group
          ),
        },
      };
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
