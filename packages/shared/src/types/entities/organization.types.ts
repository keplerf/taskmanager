import type { OrganizationRole } from './user.types.js';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationUser {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  createdAt: Date;
}

export interface OrganizationWithUsers extends Organization {
  users: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    role: OrganizationRole;
  }[];
}
