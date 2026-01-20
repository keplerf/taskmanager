import { create } from 'zustand';
import type { BoardState, Item } from '../types';

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
