export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublic = Omit<User, 'isActive'>;

export interface UserWithOrganizations extends User {
  organizations: {
    id: string;
    name: string;
    role: OrganizationRole;
  }[];
}

export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
