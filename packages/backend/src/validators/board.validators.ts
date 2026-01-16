import { z } from 'zod';

export const createBoardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Board name is required'),
    description: z.string().optional(),
    workspaceId: z.string().uuid('Invalid workspace ID'),
  }),
});

export const updateBoardSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid board ID'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    isArchived: z.boolean().optional(),
  }),
});

export const createColumnSchema = z.object({
  body: z.object({
    boardId: z.string().uuid('Invalid board ID'),
    title: z.string().min(1, 'Column title is required'),
    type: z.enum([
      'TEXT', 'LONG_TEXT', 'NUMBER', 'STATUS', 'DATE', 'PERSON',
      'CHECKBOX', 'LINK', 'EMAIL', 'PHONE', 'RATING', 'TAGS',
      'TIMELINE', 'FILE', 'FORMULA'
    ]),
    position: z.number().int().min(0).optional(),
    settings: z.record(z.unknown()).optional(),
  }),
});

export const createGroupSchema = z.object({
  body: z.object({
    boardId: z.string().uuid('Invalid board ID'),
    name: z.string().min(1, 'Group name is required'),
    color: z.string().optional(),
    position: z.number().int().min(0).optional(),
  }),
});

export const createItemSchema = z.object({
  body: z.object({
    groupId: z.string().uuid('Invalid group ID'),
    name: z.string().min(1, 'Item name is required'),
    position: z.number().int().min(0).optional(),
  }),
});

export const updateItemValueSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid item ID'),
    columnId: z.string().uuid('Invalid column ID'),
  }),
  body: z.object({
    value: z.unknown(),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid item ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Item name is required').optional(),
    position: z.number().int().min(0).optional(),
    createdById: z.string().uuid('Invalid user ID').optional(),
  }),
});

export const deleteItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid item ID'),
  }),
});

export const moveItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid item ID'),
  }),
  body: z.object({
    groupId: z.string().uuid('Invalid group ID'),
    position: z.number().int().min(0).optional(),
  }),
});

export const updateItemAssigneesSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid item ID'),
  }),
  body: z.object({
    userIds: z.array(z.string().uuid('Invalid user ID')),
  }),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>['body'];
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>['body'];
export type CreateColumnInput = z.infer<typeof createColumnSchema>['body'];
export type CreateGroupInput = z.infer<typeof createGroupSchema>['body'];
export type CreateItemInput = z.infer<typeof createItemSchema>['body'];
export type UpdateItemInput = z.infer<typeof updateItemSchema>['body'];
export type MoveItemInput = z.infer<typeof moveItemSchema>['body'];
export type UpdateItemAssigneesInput = z.infer<typeof updateItemAssigneesSchema>['body'];
