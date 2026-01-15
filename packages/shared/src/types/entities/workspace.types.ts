import type { WorkspaceRole } from './user.types.js';

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceUser {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  createdAt: Date;
}

export interface WorkspaceWithBoards extends Workspace {
  boards: {
    id: string;
    name: string;
    description: string | null;
    isArchived: boolean;
  }[];
}
