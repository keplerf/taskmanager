import type { UserInfo } from './user';
import type { BoardSummary } from './board';

/**
 * Base workspace information
 */
export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
  organizationId: string;
}

/**
 * User membership in a workspace (returned with workspace data)
 */
export interface WorkspaceMember {
  user: UserInfo;
}

/**
 * Workspace with its boards and users
 */
export interface WorkspaceWithBoards extends Workspace {
  boards: BoardSummary[];
  users?: WorkspaceMember[];
}

/**
 * User within a workspace context (with role)
 */
export interface WorkspaceUser extends UserInfo {
  email: string;
  role: string;
}

/**
 * Organization basic info
 */
export interface Organization {
  id: string;
  name: string;
}

/**
 * User available to be added to a workspace
 */
export interface AvailableUser extends UserInfo {
  email: string;
  isMember: boolean;
}
