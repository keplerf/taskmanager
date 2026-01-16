import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { logActivity } from './activity.service.js';
import type {
  CreateBoardInput,
  UpdateBoardInput,
  CreateColumnInput,
  CreateGroupInput,
  CreateItemInput,
  UpdateItemInput,
  MoveItemInput,
} from '../validators/board.validators.js';

export async function createBoard(input: CreateBoardInput, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: input.workspaceId },
    include: {
      users: { where: { userId } },
    },
  });

  if (!workspace || workspace.users.length === 0) {
    throw ApiError.forbidden('You do not have access to this workspace');
  }

  const board = await prisma.board.create({
    data: {
      name: input.name,
      description: input.description,
      workspaceId: input.workspaceId,
    },
  });

  // Create default group
  await prisma.itemGroup.create({
    data: {
      boardId: board.id,
      name: 'New Group',
      position: 0,
    },
  });

  return board;
}

export async function getBoardById(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: { orderBy: { position: 'asc' } },
      groups: {
        orderBy: { position: 'asc' },
        include: {
          items: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              name: true,
              position: true,
              groupId: true,
              createdAt: true,
              values: true,
              createdBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
              assignees: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      workspace: {
        include: {
          users: { where: { userId } },
        },
      },
    },
  });

  if (!board || board.workspace.users.length === 0) {
    throw ApiError.notFound('Board not found');
  }

  return board;
}

export async function updateBoard(boardId: string, input: UpdateBoardInput, userId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      workspace: {
        include: {
          users: { where: { userId } },
        },
      },
    },
  });

  if (!board || board.workspace.users.length === 0) {
    throw ApiError.notFound('Board not found');
  }

  return prisma.board.update({
    where: { id: boardId },
    data: input,
  });
}

export async function deleteBoard(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      workspace: {
        include: {
          users: { where: { userId, role: { in: ['OWNER', 'ADMIN'] } } },
        },
      },
    },
  });

  if (!board || board.workspace.users.length === 0) {
    throw ApiError.forbidden('You do not have permission to delete this board');
  }

  await prisma.board.delete({ where: { id: boardId } });
}

export async function createColumn(input: CreateColumnInput) {
  const maxPosition = await prisma.boardColumn.aggregate({
    where: { boardId: input.boardId },
    _max: { position: true },
  });

  return prisma.boardColumn.create({
    data: {
      boardId: input.boardId,
      title: input.title,
      type: input.type,
      position: input.position ?? (maxPosition._max.position ?? -1) + 1,
      settings: input.settings as Parameters<typeof prisma.boardColumn.create>[0]['data']['settings'],
    },
  });
}

export async function createGroup(input: CreateGroupInput) {
  const maxPosition = await prisma.itemGroup.aggregate({
    where: { boardId: input.boardId },
    _max: { position: true },
  });

  return prisma.itemGroup.create({
    data: {
      boardId: input.boardId,
      name: input.name,
      color: input.color,
      position: input.position ?? (maxPosition._max.position ?? -1) + 1,
    },
  });
}

export async function createItem(input: CreateItemInput, userId: string) {
  const maxPosition = await prisma.item.aggregate({
    where: { groupId: input.groupId },
    _max: { position: true },
  });

  const item = await prisma.item.create({
    data: {
      groupId: input.groupId,
      name: input.name,
      position: input.position ?? (maxPosition._max.position ?? -1) + 1,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  // Log activity
  await logActivity({
    itemId: item.id,
    userId,
    action: 'CREATED',
    description: `Created item "${item.name}"`,
  });

  return item;
}

export async function updateItemValue(
  itemId: string,
  columnId: string,
  value: unknown,
  userId?: string
) {
  // Get existing value and column info for activity logging
  const existingValue = await prisma.itemValue.findUnique({
    where: { itemId_columnId: { itemId, columnId } },
    include: { column: { select: { title: true } } },
  });

  const result = await prisma.itemValue.upsert({
    where: {
      itemId_columnId: { itemId, columnId },
    },
    update: { value: value as object },
    create: {
      itemId,
      columnId,
      value: value as object,
    },
    include: { column: { select: { title: true } } },
  });

  // Log activity if userId is provided
  if (userId) {
    const fieldName = result.column?.title || 'field';
    await logActivity({
      itemId,
      userId,
      action: 'FIELD_CHANGED',
      field: fieldName,
      oldValue: existingValue?.value,
      newValue: value,
      description: `Updated ${fieldName}`,
    });
  }

  return result;
}

export async function updateItem(itemId: string, input: UpdateItemInput, userId: string) {
  const existingItem = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      group: {
        include: {
          board: {
            include: {
              workspace: {
                include: {
                  users: { where: { userId } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!existingItem || existingItem.group.board.workspace.users.length === 0) {
    throw ApiError.notFound('Item not found');
  }

  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: {
      ...input,
      updatedById: userId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  // Log activity for name change
  if (input.name !== undefined && input.name !== existingItem.name) {
    await logActivity({
      itemId,
      userId,
      action: 'FIELD_CHANGED',
      field: 'name',
      oldValue: existingItem.name,
      newValue: input.name,
      description: `Changed name from "${existingItem.name}" to "${input.name}"`,
    });
  }

  return updatedItem;
}

export async function deleteItem(itemId: string, userId: string) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      group: {
        include: {
          board: {
            include: {
              workspace: {
                include: {
                  users: { where: { userId } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!item || item.group.board.workspace.users.length === 0) {
    throw ApiError.forbidden('You do not have permission to delete this item');
  }

  await prisma.item.delete({ where: { id: itemId } });
}

export async function moveItem(itemId: string, input: MoveItemInput, userId: string) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      group: {
        include: {
          board: {
            include: {
              workspace: {
                include: {
                  users: { where: { userId } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!item || item.group.board.workspace.users.length === 0) {
    throw ApiError.notFound('Item not found');
  }

  const targetGroup = await prisma.itemGroup.findUnique({
    where: { id: input.groupId },
  });

  if (!targetGroup || targetGroup.boardId !== item.group.boardId) {
    throw ApiError.badRequest('Target group must be in the same board');
  }

  const maxPosition = await prisma.item.aggregate({
    where: { groupId: input.groupId },
    _max: { position: true },
  });

  return prisma.item.update({
    where: { id: itemId },
    data: {
      groupId: input.groupId,
      position: input.position ?? (maxPosition._max.position ?? -1) + 1,
      updatedById: userId,
    },
  });
}

export async function updateItemAssignees(itemId: string, userIds: string[], currentUserId: string) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      assignees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      group: {
        include: {
          board: {
            include: {
              workspace: {
                include: {
                  users: { where: { userId: currentUserId } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!item || item.group.board.workspace.users.length === 0) {
    throw ApiError.notFound('Item not found');
  }

  // Track current assignees for activity logging
  const currentAssigneeIds = item.assignees.map((a) => a.user.id);
  const addedIds = userIds.filter((id) => !currentAssigneeIds.includes(id));
  const removedIds = currentAssigneeIds.filter((id) => !userIds.includes(id));

  // Delete all existing assignees and create new ones
  await prisma.$transaction([
    prisma.itemAssignee.deleteMany({ where: { itemId } }),
    ...userIds.map((userId) =>
      prisma.itemAssignee.create({
        data: { itemId, userId },
      })
    ),
  ]);

  // Log activity for added assignees
  for (const userId of addedIds) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    if (user) {
      await logActivity({
        itemId,
        userId: currentUserId,
        action: 'ASSIGNEE_ADDED',
        newValue: { userId, name: `${user.firstName} ${user.lastName}` },
        description: `Added ${user.firstName} ${user.lastName} as assignee`,
      });
    }
  }

  // Log activity for removed assignees
  for (const userId of removedIds) {
    const removedUser = item.assignees.find((a) => a.user.id === userId)?.user;
    if (removedUser) {
      await logActivity({
        itemId,
        userId: currentUserId,
        action: 'ASSIGNEE_REMOVED',
        oldValue: { userId, name: `${removedUser.firstName} ${removedUser.lastName}` },
        description: `Removed ${removedUser.firstName} ${removedUser.lastName} from assignees`,
      });
    }
  }

  // Return the updated item with assignees
  return prisma.item.findUnique({
    where: { id: itemId },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });
}
