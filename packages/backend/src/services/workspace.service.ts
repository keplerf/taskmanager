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
      users: {
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
      _count: {
        select: { boards: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWorkspaceById(workspaceId: string, userId: string) {
  // First check if user has access
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!workspaceUser) {
    throw ApiError.notFound('Workspace not found');
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      users: {
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
      boards: {
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!workspace) {
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

export async function getWorkspaceUsers(workspaceId: string, userId: string) {
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
  });

  if (!workspaceUser) {
    throw ApiError.forbidden('You do not have access to this workspace');
  }

  const users = await prisma.workspaceUser.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          email: true,
        },
      },
    },
  });

  return users.map((wu) => ({
    ...wu.user,
    role: wu.role,
  }));
}

export async function getUserOrganizations(userId: string) {
  const orgUsers = await prisma.organizationUser.findMany({
    where: { userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return orgUsers.map((ou) => ou.organization);
}

export async function getAvailableUsersForWorkspace(workspaceId: string, userId: string) {
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!workspaceUser) {
    throw ApiError.forbidden('You do not have access to this workspace');
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { organizationId: true },
  });

  if (!workspace) {
    throw ApiError.notFound('Workspace not found');
  }

  // Get existing workspace member IDs
  const existingUserIds = new Set(
    (
      await prisma.workspaceUser.findMany({
        where: { workspaceId },
        select: { userId: true },
      })
    ).map((wu) => wu.userId)
  );

  // Get ALL users in the organization
  const allOrgUsers = await prisma.organizationUser.findMany({
    where: {
      organizationId: workspace.organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Return all users with isMember flag
  return allOrgUsers.map((ou) => ({
    ...ou.user,
    isMember: existingUserIds.has(ou.user.id),
  }));
}

export async function getWorkspaceTags(workspaceId: string, userId: string) {
  // Check user access
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!workspaceUser) {
    throw ApiError.forbidden('You do not have access to this workspace');
  }

  // Get all tag values from items in this workspace
  const tagValues = await prisma.itemValue.findMany({
    where: {
      column: {
        type: 'TAGS',
        board: {
          workspaceId,
        },
      },
    },
    select: {
      value: true,
    },
  });

  // Extract unique tags from all values
  const uniqueTags = new Set<string>();
  for (const item of tagValues) {
    if (Array.isArray(item.value)) {
      for (const tag of item.value) {
        if (typeof tag === 'string' && tag.trim()) {
          uniqueTags.add(tag.trim());
        }
      }
    }
  }

  return Array.from(uniqueTags).sort();
}

export async function addUserToWorkspace(
  workspaceId: string,
  targetUserId: string,
  currentUserId: string,
  role: 'MEMBER' | 'ADMIN' | 'VIEWER' = 'MEMBER'
) {
  const currentWorkspaceUser = await prisma.workspaceUser.findUnique({
    where: { userId_workspaceId: { userId: currentUserId, workspaceId } },
  });

  if (!currentWorkspaceUser || !['OWNER', 'ADMIN'].includes(currentWorkspaceUser.role)) {
    throw ApiError.forbidden('You do not have permission to add users');
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { organizationId: true },
  });

  if (!workspace) {
    throw ApiError.notFound('Workspace not found');
  }

  const orgUser = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: targetUserId,
        organizationId: workspace.organizationId,
      },
    },
  });

  if (!orgUser) {
    throw ApiError.badRequest('User must be a member of the organization');
  }

  return prisma.workspaceUser.create({
    data: {
      userId: targetUserId,
      workspaceId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}
