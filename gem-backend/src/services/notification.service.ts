import prisma from "../config/database";
import type { Server } from "socket.io";

let io: Server | null = null;

export const setSocketServer = (server: Server) => {
  io = server;
};

export const notificationService = {
  async create(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) {
    const notification = await prisma.notification.create({
      data: { userId, type, title, body, data: data as object | undefined },
    });

    // Emit real-time notification if socket server is set
    if (io) {
      io.to(`user:${userId}`).emit("notification", notification);
    }

    return notification;
  },

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  async markOneRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  },

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
