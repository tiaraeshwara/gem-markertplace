import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../config/database";
import { config } from "../../config";
import { emailService } from "../../services/email.service";
import { createError } from "../../middleware/error.middleware";
import type { RegisterInput, LoginInput } from "./auth.schema";

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign({ id: userId, email, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });

  const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  });

  return { accessToken, refreshToken };
};

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw createError("Email already registered", 409);

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role as "seller" | "buyer",
        phone: data.phone,
        verifyToken,
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        isVerified: true,
      },
    });

    // Send verification email (non-blocking)
    emailService
      .sendVerificationEmail(user.email, user.fullName || "", verifyToken)
      .catch(console.error);

    return user;
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.isActive) throw createError("Invalid credentials", 401);

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) throw createError("Invalid credentials", 401);

    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role,
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    };
  },

  async refreshToken(token: string) {
    let payload: { id: string };
    try {
      payload = jwt.verify(token, config.jwt.refreshSecret) as { id: string };
    } catch {
      throw createError("Invalid refresh token", 401);
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw createError("Refresh token expired", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) throw createError("User not found", 401);

    // Rotate: delete old, create new
    await prisma.refreshToken.delete({ where: { token } });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.email,
      user.role,
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt },
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  },

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) throw createError("Invalid verification token", 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    });
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    emailService
      .sendPasswordResetEmail(user.email, user.fullName || "", resetToken)
      .catch(console.error);
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) throw createError("Invalid or expired reset token", 400);

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw createError("User not found", 404);
    return user;
  },
};
