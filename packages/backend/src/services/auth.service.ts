import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validators.js';

const RESET_TOKEN_EXPIRY_HOURS = 1;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

const DEFAULT_ORG_SLUG = 'default-organization';

async function getOrCreateDefaultOrganization(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) {
  let org = await tx.organization.findUnique({
    where: { slug: DEFAULT_ORG_SLUG },
  });

  if (!org) {
    org = await tx.organization.create({
      data: {
        name: 'Default Organization',
        slug: DEFAULT_ORG_SLUG,
      },
    });
  }

  return org;
}

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });

    // Get or create the default organization - all users join this
    const defaultOrg = await getOrCreateDefaultOrganization(tx);

    // Add user to the default organization
    await tx.organizationUser.create({
      data: {
        userId: newUser.id,
        organizationId: defaultOrg.id,
        role: 'MEMBER',
      },
    });

    // If user provided a custom organization name, also create that
    if (input.organizationName) {
      const org = await tx.organization.create({
        data: {
          name: input.organizationName,
          slug: generateSlug(input.organizationName),
        },
      });

      await tx.organizationUser.create({
        data: {
          userId: newUser.id,
          organizationId: org.id,
          role: 'OWNER',
        },
      });

      // Create default workspace for the new user
      const defaultWorkspace = await tx.workspace.create({
        data: {
          name: 'Main Workspace',
          description: 'Your default workspace',
          organizationId: org.id,
        },
      });

      await tx.workspaceUser.create({
        data: {
          userId: newUser.id,
          workspaceId: defaultWorkspace.id,
          role: 'OWNER',
        },
      });

      // Create default boards in the workspace
      const firstBoard = await tx.board.create({
        data: {
          name: 'My First Board',
          description: 'Get started with your first board',
          workspaceId: defaultWorkspace.id,
        },
      });

      await tx.board.create({
        data: {
          name: 'Project Tasks',
          description: 'Manage your project tasks here',
          workspaceId: defaultWorkspace.id,
        },
      });

      // Create default columns for the first board
      const statusColumn = await tx.boardColumn.create({
        data: {
          boardId: firstBoard.id,
          title: 'Status',
          type: 'STATUS',
          position: 0,
          settings: {
            labels: [
              { id: '1', label: 'To Do', color: '#c4c4c4' },
              { id: '2', label: 'In Progress', color: '#fdab3d' },
              { id: '3', label: 'Done', color: '#00c875' },
            ],
          },
        },
      });

      const dateColumn = await tx.boardColumn.create({
        data: {
          boardId: firstBoard.id,
          title: 'Due Date',
          type: 'DATE',
          position: 1,
        },
      });

      const tagsColumn = await tx.boardColumn.create({
        data: {
          boardId: firstBoard.id,
          title: 'Tags',
          type: 'TAGS',
          position: 2,
          settings: {
            tags: [
              { id: '1', label: 'Important', color: '#e2445c' },
              { id: '2', label: 'Urgent', color: '#ff642e' },
              { id: '3', label: 'Feature', color: '#00c875' },
            ],
          },
        },
      });

      // Create default item group
      const defaultGroup = await tx.itemGroup.create({
        data: {
          boardId: firstBoard.id,
          name: 'Tasks',
          color: '#579bfc',
          position: 0,
        },
      });

      // Create default items
      const item1 = await tx.item.create({
        data: {
          groupId: defaultGroup.id,
          name: 'Welcome to your first board!',
          position: 0,
          createdById: newUser.id,
        },
      });

      const item2 = await tx.item.create({
        data: {
          groupId: defaultGroup.id,
          name: 'Complete your profile setup',
          position: 1,
          createdById: newUser.id,
        },
      });

      // Add values to items
      await tx.itemValue.create({
        data: {
          itemId: item1.id,
          columnId: statusColumn.id,
          value: { labelId: '1' }, // To Do
        },
      });

      await tx.itemValue.create({
        data: {
          itemId: item1.id,
          columnId: dateColumn.id,
          value: { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }, // 7 days from now
        },
      });

      await tx.itemValue.create({
        data: {
          itemId: item1.id,
          columnId: tagsColumn.id,
          value: { tagIds: ['1', '3'] }, // Important, Feature
        },
      });

      await tx.itemValue.create({
        data: {
          itemId: item2.id,
          columnId: statusColumn.id,
          value: { labelId: '2' }, // In Progress
        },
      });

      await tx.itemValue.create({
        data: {
          itemId: item2.id,
          columnId: dateColumn.id,
          value: { date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }, // 3 days from now
        },
      });

      await tx.itemValue.create({
        data: {
          itemId: item2.id,
          columnId: tagsColumn.id,
          value: { tagIds: ['2'] }, // Urgent
        },
      });
    } else {
      // For users without custom organization, create a workspace in the default org
      const defaultWorkspace = await tx.workspace.create({
        data: {
          name: `${newUser.firstName}'s Workspace`,
          description: 'Your default workspace',
          organizationId: defaultOrg.id,
        },
      });

      await tx.workspaceUser.create({
        data: {
          userId: newUser.id,
          workspaceId: defaultWorkspace.id,
          role: 'OWNER',
        },
      });
    }

    return newUser;
  });

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isValidPassword = await comparePassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(refreshToken: string) {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const newAccessToken = signAccessToken({ userId: payload.userId });
    const newRefreshToken = signRefreshToken({ userId: payload.userId });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always return success to prevent email enumeration
  if (!user || !user.isActive) {
    return { message: 'If an account exists, a reset link has been sent' };
  }

  // Invalidate any existing unused tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Generate secure token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      token: resetToken,
      userId: user.id,
      expiresAt,
    },
  });

  // For now, log to console (later replace with email service)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  console.log('\n========================================');
  console.log('PASSWORD RESET LINK:');
  console.log(resetUrl);
  console.log('========================================\n');

  return { message: 'If an account exists, a reset link has been sent' };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  if (!resetToken.user.isActive) {
    throw ApiError.badRequest('Account is inactive');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all refresh tokens for security
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { message: 'Password reset successfully' };
}

// Utility function to add all existing users to the default organization
export async function migrateUsersToDefaultOrganization() {
  return prisma.$transaction(async (tx) => {
    // Get or create default organization
    let defaultOrg = await tx.organization.findUnique({
      where: { slug: DEFAULT_ORG_SLUG },
    });

    if (!defaultOrg) {
      defaultOrg = await tx.organization.create({
        data: {
          name: 'Default Organization',
          slug: DEFAULT_ORG_SLUG,
        },
      });
    }

    // Get all users not in the default organization
    const usersNotInDefaultOrg = await tx.user.findMany({
      where: {
        organizationUsers: {
          none: {
            organizationId: defaultOrg.id,
          },
        },
      },
    });

    // Add them to the default organization
    for (const user of usersNotInDefaultOrg) {
      await tx.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: defaultOrg.id,
          role: 'MEMBER',
        },
      });
    }

    return { migratedCount: usersNotInDefaultOrg.length, organizationId: defaultOrg.id };
  });
}
