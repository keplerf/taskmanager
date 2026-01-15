import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export async function getWorkspacesByUser(userId: string) {
  return prisma.workspace.findMany({
    where: {
      users: { some: { userId } },
    },
    include: {
      boards: {
        where: { isArchived: false },
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      _count: {
        select: { boards: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWorkspaceById(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      users: {
        where: { userId },
      },
      boards: {
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!workspace || workspace.users.length === 0) {
    throw ApiError.notFound('Workspace not found');
  }

  return workspace;
}

export async function createWorkspace(
  name: string,
  organizationId: string,
  userId: string,
  description?: string
) {
  const orgUser = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
  });

  if (!orgUser) {
    throw ApiError.forbidden('You do not belong to this organization');
  }

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name,
        description,
        organizationId,
      },
    });

    await tx.workspaceUser.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: 'OWNER',
      },
    });

    return workspace;
  });
}

export async function updateWorkspace(
  workspaceId: string,
  userId: string,
  data: { name?: string; description?: string; color?: string }
) {
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
  });

  if (!workspaceUser || !['OWNER', 'ADMIN'].includes(workspaceUser.role)) {
    throw ApiError.forbidden('You do not have permission to update this workspace');
  }

  return prisma.workspace.update({
    where: { id: workspaceId },
    data,
  });
}

export async function deleteWorkspace(workspaceId: string, userId: string) {
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
  });

  if (!workspaceUser || workspaceUser.role !== 'OWNER') {
    throw ApiError.forbidden('Only workspace owners can delete workspaces');
  }

  await prisma.workspace.delete({ where: { id: workspaceId } });
}
