import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/index.js';
import type { RegisterInput, LoginInput, RefreshTokenInput, LogoutInput } from '../validators/auth.validators.js';

export async function register(
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(
  req: Request<unknown, unknown, RefreshTokenInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.refreshTokens(req.body.refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request<unknown, unknown, LogoutInput>,
  res: Response,
  next: NextFunction
) {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
}
