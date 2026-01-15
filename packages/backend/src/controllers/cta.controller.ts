import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ctaService } from '../services/index.js';
import type { CreateCtaInput, UpdateCtaInput } from '../services/cta.service.js';

export async function getCtasByItem(
  req: AuthenticatedRequest & { params: { itemId: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const ctas = await ctaService.getCtasByItemId(req.params.itemId, req.userId!);
    res.json({ success: true, data: ctas });
  } catch (error) {
    next(error);
  }
}

export async function createCta(
  req: AuthenticatedRequest & { body: CreateCtaInput },
  res: Response,
  next: NextFunction
) {
  try {
    const cta = await ctaService.createCta(req.body, req.userId!);
    res.status(201).json({ success: true, data: cta });
  } catch (error) {
    next(error);
  }
}

export async function updateCta(
  req: AuthenticatedRequest & { params: { ctaId: string }; body: UpdateCtaInput },
  res: Response,
  next: NextFunction
) {
  try {
    const cta = await ctaService.updateCta(req.params.ctaId, req.body, req.userId!);
    res.json({ success: true, data: cta });
  } catch (error) {
    next(error);
  }
}

export async function deleteCta(
  req: AuthenticatedRequest & { params: { ctaId: string } },
  res: Response,
  next: NextFunction
) {
  try {
    await ctaService.deleteCta(req.params.ctaId, req.userId!);
    res.json({ success: true, data: { message: 'CTA deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

export async function reorderCtas(
  req: AuthenticatedRequest & { params: { itemId: string }; body: { ctaIds: string[] } },
  res: Response,
  next: NextFunction
) {
  try {
    const ctas = await ctaService.reorderCtas(req.params.itemId, req.body.ctaIds, req.userId!);
    res.json({ success: true, data: ctas });
  } catch (error) {
    next(error);
  }
}
