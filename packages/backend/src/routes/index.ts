import { Router } from 'express';
import authRoutes from './auth.routes.js';
import boardRoutes from './board.routes.js';
import ctaRoutes from './cta.routes.js';
import workspaceRoutes from './workspace.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/boards', boardRoutes);
router.use('/boards', ctaRoutes);
router.use('/workspaces', workspaceRoutes);

export default router;
