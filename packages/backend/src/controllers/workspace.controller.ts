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
