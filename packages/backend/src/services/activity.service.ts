import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import type { ActivityType } from '@prisma/client';

interface LogActivityParams {
  itemId: string;
  userId: string;
  action: ActivityType;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  description?: string;
}

export async function logActivity(params: LogActivityParams) {
  return prisma.itemActivity.create({
    data: {
      itemId: params.itemId,
      userId: params.userId,
      action: params.action,
      field: params.field,
      oldValue: params.oldValue !== undefined ? (params.oldValue as Prisma.InputJsonValue) : Prisma.JsonNull,
      newValue: params.newValue !== undefined ? (params.newValue as Prisma.InputJsonValue) : Prisma.JsonNull,
      description: params.description,
    },
  });
}

export async function getItemActivities(itemId: string, limit = 50, offset = 0) {
  return prisma.itemActivity.findMany({
    where: { itemId },
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
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}
