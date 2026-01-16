import { Router } from 'express';
import { workspaceController } from '../controllers/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', workspaceController.getWorkspaces);
router.get('/organizations', workspaceController.getUserOrganizations);
router.get('/:id', workspaceController.getWorkspace);
router.get('/:id/users', workspaceController.getWorkspaceUsers);
router.get('/:id/available-users', workspaceController.getAvailableUsers);
router.get('/:id/tags', workspaceController.getWorkspaceTags);
router.post('/', workspaceController.createWorkspace);
router.post('/:id/users', workspaceController.addUserToWorkspace);
router.patch('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

export default router;
