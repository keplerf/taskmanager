import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/index.js';
import type { RegisterInput, LoginInput, RefreshTokenInput, LogoutInput, ForgotPasswordInput, ResetPasswordInput } from '../validators/auth.validators.js';

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

export async function forgotPassword(
  req: Request<unknown, unknown, ForgotPasswordInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request<unknown, unknown, ResetPasswordInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function migrateUsers(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.migrateUsersToDefaultOrganization();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
