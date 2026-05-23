import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse({ body: req.body });
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      const user = await authService.register(parsed.data.body);
      res
        .status(201)
        .json({
          message: "Registration successful. Please verify your email.",
          user,
        });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse({ body: req.body });
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      const result = await authService.login(parsed.data.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ message: "Refresh token required" });
        return;
      }
      const tokens = await authService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await authService.logout(refreshToken);
      res.json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = verifyEmailSchema.safeParse({ body: req.body });
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      await authService.verifyEmail(parsed.data.body.token);
      res.json({ message: "Email verified successfully" });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = forgotPasswordSchema.safeParse({ body: req.body });
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      await authService.forgotPassword(parsed.data.body.email);
      res.json({
        message: "If your email is registered, you will receive a reset link.",
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = resetPasswordSchema.safeParse({ body: req.body });
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      await authService.resetPassword(
        parsed.data.body.token,
        parsed.data.body.password,
      );
      res.json({ message: "Password reset successfully" });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
