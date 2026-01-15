import { Router } from 'express';
import { workspaceController } from '../controllers/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', workspaceController.getWorkspaces);
router.get('/:id', workspaceController.getWorkspace);
router.post('/', workspaceController.createWorkspace);
router.patch('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

export default router;
