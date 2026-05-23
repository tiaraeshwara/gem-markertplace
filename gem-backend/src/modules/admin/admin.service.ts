import prisma from "../../config/database";
import { createError } from "../../middleware/error.middleware";
import { notificationService } from "../../services/notification.service";

export const adminService = {
  async getDashboardStats() {
    const [
      totalUsers,
      totalGems,
      pendingReviews,
      approvedGems,
      soldGems,
      totalReservations,
      totalValuations,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: "admin" } } }),
      prisma.gem.count(),
      prisma.gem.count({ where: { status: "pending_review" } }),
      prisma.gem.count({ where: { status: "approved" } }),
      prisma.gem.count({ where: { status: "sold" } }),
      prisma.reservation.count(),
      prisma.valuation.count(),
    ]);

    const recentListings = await prisma.gem.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { seller: { select: { fullName: true, email: true } } },
    });

    return {
      totalUsers,
      totalGems,
      pendingReviews,
      approvedGems,
      soldGems,
      totalReservations,
      totalValuations,
      recentListings,
    };
  },

  async getPendingGems() {
    return prisma.gem.findMany({
      where: { status: "pending_review" },
      include: {
        seller: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        images: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async getAllGems(status?: string) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    return prisma.gem.findMany({
      where,
      include: {
        seller: { select: { id: true, fullName: true, email: true } },
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { reservations: true, valuations: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async approveGem(gemId: string, adminId: string) {
    const gem = await prisma.gem.findUnique({ where: { id: gemId } });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.status !== "pending_review")
      throw createError("Gem is not pending review", 400);

    const updated = await prisma.gem.update({
      where: { id: gemId },
      data: {
        status: "approved",
        adminId,
        reviewedAt: new Date(),
        rejectionNote: null,
      },
    });

    await notificationService.create(
      gem.sellerId,
      "gem_approved",
      "Gem Approved!",
      `Your gem listing "${gem.title}" has been approved and is now live on the marketplace.`,
      { gemId },
    );

    return updated;
  },

  async rejectGem(gemId: string, adminId: string, reason: string) {
    const gem = await prisma.gem.findUnique({ where: { id: gemId } });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.status !== "pending_review")
      throw createError("Gem is not pending review", 400);

    const updated = await prisma.gem.update({
      where: { id: gemId },
      data: {
        status: "rejected",
        adminId,
        reviewedAt: new Date(),
        rejectionNote: reason,
      },
    });

    await notificationService.create(
      gem.sellerId,
      "gem_rejected",
      "Gem Listing Update",
      `Your gem listing "${gem.title}" was not approved. Reason: ${reason}. You can edit and resubmit.`,
      { gemId },
    );

    return updated;
  },

  async getAllUsers(role?: string) {
    const where: Record<string, unknown> = {};
    if (role) where.role = role;

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { gemsAsSeller: true, reservations: true, valuations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw createError("User not found", 404);
    if (user.role === "admin")
      throw createError("Cannot deactivate admin accounts", 403);

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });
  },

  async getAllChatRooms() {
    return prisma.chatRoom.findMany({
      include: {
        gem: { select: { id: true, title: true } },
        seller: { select: { id: true, fullName: true, email: true } },
        buyer: { select: { id: true, fullName: true, email: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
