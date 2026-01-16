import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { boardService } from '../services/index.js';
import type {
  CreateBoardInput,
  UpdateBoardInput,
  CreateColumnInput,
  CreateGroupInput,
  CreateItemInput,
  UpdateItemInput,
  MoveItemInput,
  UpdateItemAssigneesInput,
} from '../validators/board.validators.js';

export async function createBoard(
  req: AuthenticatedRequest & { body: CreateBoardInput },
  res: Response,
  next: NextFunction
) {
  try {
    const board = await boardService.createBoard(req.body, req.userId!);
    res.status(201).json({ success: true, data: board });
  } catch (error) {
    next(error);
  }
}

export async function getBoard(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const board = await boardService.getBoardById(req.params.id, req.userId!);
    res.json({ success: true, data: board });
  } catch (error) {
    next(error);
  }
}

export async function updateBoard(
  req: AuthenticatedRequest & { params: { id: string }; body: UpdateBoardInput },
  res: Response,
  next: NextFunction
) {
  try {
    const board = await boardService.updateBoard(req.params.id, req.body, req.userId!);
    res.json({ success: true, data: board });
  } catch (error) {
    next(error);
  }
}

export async function deleteBoard(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) {
  try {
    await boardService.deleteBoard(req.params.id, req.userId!);
    res.json({ success: true, data: { message: 'Board deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

export async function createColumn(
  req: AuthenticatedRequest & { body: CreateColumnInput },
  res: Response,
  next: NextFunction
) {
  try {
    const column = await boardService.createColumn(req.body);
    res.status(201).json({ success: true, data: column });
  } catch (error) {
    next(error);
  }
}

export async function createGroup(
  req: AuthenticatedRequest & { body: CreateGroupInput },
  res: Response,
  next: NextFunction
) {
  try {
    const group = await boardService.createGroup(req.body);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
}

export async function createItem(
  req: AuthenticatedRequest & { body: CreateItemInput },
  res: Response,
  next: NextFunction
) {
  try {
    const item = await boardService.createItem(req.body, req.userId!);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function updateItemValue(
  req: AuthenticatedRequest & { params: { itemId: string; columnId: string }; body: { value: unknown } },
  res: Response,
  next: NextFunction
) {
  try {
    const value = await boardService.updateItemValue(
      req.params.itemId,
      req.params.columnId,
      req.body.value,
      req.userId
    );
    res.json({ success: true, data: value });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(
  req: AuthenticatedRequest & { params: { itemId: string }; body: UpdateItemInput },
  res: Response,
  next: NextFunction
) {
  try {
    const item = await boardService.updateItem(req.params.itemId, req.body, req.userId!);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function deleteItem(
  req: AuthenticatedRequest & { params: { itemId: string } },
  res: Response,
  next: NextFunction
) {
  try {
    await boardService.deleteItem(req.params.itemId, req.userId!);
    res.json({ success: true, data: { message: 'Item deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

export async function moveItem(
  req: AuthenticatedRequest & { params: { itemId: string }; body: MoveItemInput },
  res: Response,
  next: NextFunction
) {
  try {
    const item = await boardService.moveItem(req.params.itemId, req.body, req.userId!);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function updateItemAssignees(
  req: AuthenticatedRequest & { params: { itemId: string }; body: UpdateItemAssigneesInput },
  res: Response,
  next: NextFunction
) {
  try {
    const item = await boardService.updateItemAssignees(
      req.params.itemId,
      req.body.userIds,
      req.userId!
    );
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}
