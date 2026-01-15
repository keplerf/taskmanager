import { Router } from 'express';
import { ctaController } from '../controllers/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// Get all CTAs for an item
router.get('/items/:itemId/ctas', ctaController.getCtasByItem);

// Create a new CTA
router.post('/ctas', ctaController.createCta);

// Update a CTA
router.patch('/ctas/:ctaId', ctaController.updateCta);

// Delete a CTA
router.delete('/ctas/:ctaId', ctaController.deleteCta);

// Reorder CTAs for an item
router.patch('/items/:itemId/ctas/reorder', ctaController.reorderCtas);

export default router;
