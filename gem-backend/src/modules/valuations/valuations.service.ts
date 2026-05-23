import prisma from "../../config/database";
import { createError } from "../../middleware/error.middleware";
import { notificationService } from "../../services/notification.service";

export const valuationsService = {
  async submit(
    gemId: string,
    buyerId: string,
    data: { reservationId: string; offeredPrice: number; message?: string },
  ) {
    const gem = await prisma.gem.findUnique({ where: { id: gemId } });
    if (!gem || gem.status !== "approved")
      throw createError("Gem not available", 404);

    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
    });
    if (
      !reservation ||
      reservation.buyerId !== buyerId ||
      reservation.gemId !== gemId
    ) {
      throw createError("Invalid reservation", 400);
    }
    if (reservation.status !== "active")
      throw createError("Reservation is not active", 400);
    if (reservation.expiresAt < new Date())
      throw createError("Reservation has expired", 400);

    // Check for existing valuation on this reservation
    const existing = await prisma.valuation.findFirst({
      where: { reservationId: data.reservationId },
    });
    if (existing)
      throw createError(
        "You already submitted a valuation for this reservation",
        409,
      );

    const valuation = await prisma.valuation.create({
      data: {
        gemId,
        buyerId,
        reservationId: data.reservationId,
        offeredPrice: data.offeredPrice,
        message: data.message,
      },
      include: {
        buyer: { select: { id: true, fullName: true, email: true } },
        gem: { select: { id: true, title: true, sellerId: true } },
      },
    });

    // Notify seller
    await notificationService.create(
      valuation.gem.sellerId,
      "valuation_submitted",
      "New Valuation Submitted",
      `${valuation.buyer.fullName || "A buyer"} submitted a valuation of $${data.offeredPrice} for "${valuation.gem.title}"`,
      { gemId, valuationId: valuation.id },
    );

    return valuation;
  },

  async getGemValuations(gemId: string, sellerId: string) {
    const gem = await prisma.gem.findUnique({ where: { id: gemId } });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.sellerId !== sellerId) throw createError("Forbidden", 403);

    return prisma.valuation.findMany({
      where: { gemId },
      include: {
        buyer: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        reservation: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async selectValuation(valuationId: string, sellerId: string) {
    const valuation = await prisma.valuation.findUnique({
      where: { id: valuationId },
      include: {
        gem: true,
        buyer: { select: { id: true, fullName: true, email: true } },
      },
    });
    if (!valuation) throw createError("Valuation not found", 404);
    if (valuation.gem.sellerId !== sellerId)
      throw createError("Forbidden", 403);
    if (valuation.isSelected)
      throw createError("Valuation already selected", 400);
    if (valuation.gem.status !== "approved")
      throw createError("Gem is not approved", 400);

    // Run in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark this valuation as selected
      await tx.valuation.update({
        where: { id: valuationId },
        data: { isSelected: true },
      });

      // Update reservation status
      await tx.reservation.update({
        where: { id: valuation.reservationId },
        data: { status: "selected" },
      });

      // Mark gem as sold
      await tx.gem.update({
        where: { id: valuation.gemId },
        data: { status: "sold" },
      });

      // Create chat room
      const chatRoom = await tx.chatRoom.create({
        data: {
          gemId: valuation.gemId,
          sellerId,
          buyerId: valuation.buyerId,
          valuationId,
        },
      });

      return chatRoom;
    });

    // Notify buyer
    await notificationService.create(
      valuation.buyerId,
      "valuation_selected",
      "Your Valuation Was Selected!",
      `Congratulations! The seller selected your valuation for "${valuation.gem.title}". A chat room has been opened.`,
      { gemId: valuation.gemId, chatRoomId: result.id },
    );

    return result;
  },

  async getBuyerValuations(buyerId: string) {
    return prisma.valuation.findMany({
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
};
