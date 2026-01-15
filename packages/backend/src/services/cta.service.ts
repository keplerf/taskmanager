import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateCtaInput {
  itemId: string;
  label: string;
  url?: string;
  type?: 'LINK' | 'BUTTON' | 'ACTION';
  color?: string;
  position?: number;
}

export interface UpdateCtaInput {
  label?: string;
  url?: string;
  type?: 'LINK' | 'BUTTON' | 'ACTION';
  color?: string;
  position?: number;
}

async function verifyItemAccess(itemId: string, userId: string) {
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

  return item;
}

async function verifyCtaAccess(ctaId: string, userId: string) {
  const cta = await prisma.itemCta.findUnique({
    where: { id: ctaId },
    include: {
      item: {
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
      },
    },
  });

  if (!cta || cta.item.group.board.workspace.users.length === 0) {
    throw ApiError.notFound('CTA not found');
  }

  return cta;
}

export async function getCtasByItemId(itemId: string, userId: string) {
  await verifyItemAccess(itemId, userId);

  return prisma.itemCta.findMany({
    where: { itemId },
    orderBy: { position: 'asc' },
  });
}

export async function createCta(input: CreateCtaInput, userId: string) {
  await verifyItemAccess(input.itemId, userId);

  const maxPosition = await prisma.itemCta.aggregate({
    where: { itemId: input.itemId },
    _max: { position: true },
  });

  return prisma.itemCta.create({
    data: {
      itemId: input.itemId,
      label: input.label,
      url: input.url,
      type: input.type,
      color: input.color,
      position: input.position ?? (maxPosition._max.position ?? -1) + 1,
    },
  });
}

export async function updateCta(ctaId: string, input: UpdateCtaInput, userId: string) {
  await verifyCtaAccess(ctaId, userId);

  return prisma.itemCta.update({
    where: { id: ctaId },
    data: input,
  });
}

export async function deleteCta(ctaId: string, userId: string) {
  await verifyCtaAccess(ctaId, userId);

  await prisma.itemCta.delete({ where: { id: ctaId } });
}

export async function reorderCtas(itemId: string, ctaIds: string[], userId: string) {
  await verifyItemAccess(itemId, userId);

  const updates = ctaIds.map((id, index) =>
    prisma.itemCta.update({
      where: { id },
      data: { position: index },
    })
  );

  await prisma.$transaction(updates);

  return prisma.itemCta.findMany({
    where: { itemId },
    orderBy: { position: 'asc' },
  });
}
