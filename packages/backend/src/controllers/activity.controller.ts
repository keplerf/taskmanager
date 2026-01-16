import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { activityService } from '../services/index.js';

export async function getItemActivities(
  req: AuthenticatedRequest & { params: { itemId: string }; query: { limit?: string; offset?: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const activities = await activityService.getItemActivities(req.params.itemId, limit, offset);
    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
}
