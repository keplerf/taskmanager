import { Router } from 'express';
import { activityController, boardController } from '../controllers/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createBoardSchema,
  updateBoardSchema,
  createColumnSchema,
  createGroupSchema,
  createItemSchema,
  updateItemValueSchema,
  updateItemSchema,
  deleteItemSchema,
  moveItemSchema,
  updateItemAssigneesSchema,
} from '../validators/board.validators.js';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createBoardSchema), boardController.createBoard);
router.get('/:id', boardController.getBoard);
router.patch('/:id', validate(updateBoardSchema), boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);

router.post('/columns', validate(createColumnSchema), boardController.createColumn);
router.post('/groups', validate(createGroupSchema), boardController.createGroup);
router.post('/items', validate(createItemSchema), boardController.createItem);
router.patch('/items/:itemId', validate(updateItemSchema), boardController.updateItem);
router.delete('/items/:itemId', validate(deleteItemSchema), boardController.deleteItem);
router.patch('/items/:itemId/move', validate(moveItemSchema), boardController.moveItem);
router.patch(
  '/items/:itemId/assignees',
  validate(updateItemAssigneesSchema),
  boardController.updateItemAssignees
);
router.patch(
  '/items/:itemId/values/:columnId',
  validate(updateItemValueSchema),
  boardController.updateItemValue
);
router.get('/items/:itemId/activities', activityController.getItemActivities);

export default router;
