export const ORGANIZATION_PERMISSIONS = {
  OWNER: ['manage_organization', 'manage_members', 'manage_billing', 'manage_workspaces', 'view_all'],
  ADMIN: ['manage_members', 'manage_workspaces', 'view_all'],
  MEMBER: ['view_workspaces', 'create_workspaces'],
} as const;

export const WORKSPACE_PERMISSIONS = {
  OWNER: ['manage_workspace', 'manage_members', 'manage_boards', 'edit_items', 'view_all'],
  ADMIN: ['manage_members', 'manage_boards', 'edit_items', 'view_all'],
  MEMBER: ['manage_boards', 'edit_items', 'view_all'],
  VIEWER: ['view_all'],
} as const;

export type OrganizationPermission = typeof ORGANIZATION_PERMISSIONS[keyof typeof ORGANIZATION_PERMISSIONS][number];
export type WorkspacePermission = typeof WORKSPACE_PERMISSIONS[keyof typeof WORKSPACE_PERMISSIONS][number];
