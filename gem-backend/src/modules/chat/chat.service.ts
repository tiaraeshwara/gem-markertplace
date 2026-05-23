import prisma from "../../config/database";
import { createError } from "../../middleware/error.middleware";

export const chatService = {
  async getUserRooms(userId: string) {
    return prisma.chatRoom.findMany({
      where: {
        isActive: true,
        OR: [{ sellerId: userId }, { buyerId: userId }],
      },
      include: {
        gem: {
          select: {
            id: true,
            title: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        seller: { select: { id: true, fullName: true, avatarUrl: true } },
        buyer: { select: { id: true, fullName: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getRoomMessages(roomId: string, userId: string, page = 1, limit = 50) {
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw createError("Chat room not found", 404);
    if (room.sellerId !== userId && room.buyerId !== userId)
      throw createError("Forbidden", 403);

    const [total, messages] = await Promise.all([
      prisma.message.count({ where: { roomId } }),
      prisma.message.findMany({
        where: { roomId },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: { roomId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    return { messages, total, page, totalPages: Math.ceil(total / limit) };
  },

  async sendMessage(roomId: string, senderId: string, content: string) {
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room || !room.isActive)
      throw createError("Chat room not found or inactive", 404);
    if (room.sellerId !== senderId && room.buyerId !== senderId) {
      throw createError("Forbidden", 403);
    }

    return prisma.message.create({
      data: { roomId, senderId, content },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });
  },

  async verifyRoomAccess(roomId: string, userId: string) {
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) return false;
    return room.sellerId === userId || room.buyerId === userId;
  },
};
