import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { workspaceService } from '../services/index.js';

export async function getWorkspaces(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const workspaces = await workspaceService.getWorkspacesByUser(req.userId!);
    res.json({ success: true, data: workspaces });
  } catch (error) {
    next(error);
  }
}

export async function getWorkspace(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const workspace = await workspaceService.getWorkspaceById(req.params.id, req.userId!);
    res.json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
}

export async function createWorkspace(
  req: AuthenticatedRequest & {
    body: { name: string; organizationId: string; description?: string };
  },
  res: Response,
  next: NextFunction
) {
  try {
    const workspace = await workspaceService.createWorkspace(
      req.body.name,
      req.body.organizationId,
      req.userId!,
      req.body.description
    );
    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
}

export async function updateWorkspace(
  req: AuthenticatedRequest & {
    params: { id: string };
    body: { name?: string; description?: string; color?: string };
  },
  res: Response,
  next: NextFunction
) {
  try {
    const workspace = await workspaceService.updateWorkspace(
      req.params.id,
      req.userId!,
      req.body
    );
    res.json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkspace(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) {
  try {
    await workspaceService.deleteWorkspace(req.params.id, req.userId!);
    res.json({ success: true, data: { message: 'Workspace deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

export async function getWorkspaceUsers(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const users = await workspaceService.getWorkspaceUsers(req.params.id, req.userId!);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function getUserOrganizations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const organizations = await workspaceService.getUserOrganizations(req.userId!);
    res.json({ success: true, data: organizations });
  } catch (error) {
    next(error);
  }
}

export async function getAvailableUsers(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const users = await workspaceService.getAvailableUsersForWorkspace(req.params.id, req.userId!);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function addUserToWorkspace(
  req: AuthenticatedRequest & { params: { id: string }; body: { userId: string; role?: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const workspaceUser = await workspaceService.addUserToWorkspace(
      req.params.id,
      req.body.userId,
      req.userId!,
      req.body.role as 'MEMBER' | 'ADMIN' | 'VIEWER'
    );
    res.status(201).json({ success: true, data: workspaceUser });
  } catch (error) {
    next(error);
  }
}

export async function getWorkspaceTags(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const tags = await workspaceService.getWorkspaceTags(req.params.id, req.userId!);
    res.json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
}
