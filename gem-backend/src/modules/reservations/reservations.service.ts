import prisma from "../../config/database";
import { createError } from "../../middleware/error.middleware";
import { notificationService } from "../../services/notification.service";

const RESERVATION_HOURS = 24;

export const reservationsService = {
  async create(gemId: string, buyerId: string) {
    const gem = await prisma.gem.findUnique({ where: { id: gemId } });
    if (!gem || gem.status !== "approved")
      throw createError("Gem not available", 404);

    // Check if buyer already has active reservation
    const existing = await prisma.reservation.findFirst({
      where: { gemId, buyerId, status: "active" },
    });
    if (existing)
      throw createError(
        "You already have an active reservation for this gem",
        409,
      );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESERVATION_HOURS);

    const reservation = await prisma.reservation.create({
      data: { gemId, buyerId, status: "active", expiresAt },
      include: {
        gem: { select: { id: true, title: true, sellerId: true } },
        buyer: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Notify seller
    await notificationService.create(
      reservation.gem.sellerId,
      "reservation_created",
      "New Reservation",
      `${reservation.buyer.fullName || "A buyer"} reserved your gem "${reservation.gem.title}"`,
      { gemId, reservationId: reservation.id },
    );

    return reservation;
  },

  async cancel(reservationId: string, buyerId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) throw createError("Reservation not found", 404);
    if (reservation.buyerId !== buyerId) throw createError("Forbidden", 403);
    if (reservation.status !== "active")
      throw createError("Reservation is not active", 400);

    return prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "cancelled" },
    });
  },

  async getBuyerReservations(buyerId: string) {
    return prisma.reservation.findMany({
      where: { buyerId },
      include: {
        gem: {
          select: {
            id: true,
            title: true,
            category: true,
            askingPrice: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getGemReservations(gemId: string, sellerId: string) {
    const gem = await prisma.gem.findUnique({ where: { id: gemId } });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.sellerId !== sellerId) throw createError("Forbidden", 403);

    return prisma.reservation.findMany({
      where: { gemId },
      include: {
        buyer: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
