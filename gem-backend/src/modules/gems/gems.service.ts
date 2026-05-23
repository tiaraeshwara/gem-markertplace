import prisma from "../../config/database";
import { uploadService } from "../../services/upload.service";
import { createError } from "../../middleware/error.middleware";
import type { CreateGemInput, GemQueryInput } from "./gems.schema";

const GEM_INCLUDE = {
  images: { orderBy: { order: "asc" as const } },
  seller: {
    select: { id: true, fullName: true, avatarUrl: true, email: true },
  },
};

export const gemsService = {
  async listApproved(query: GemQueryInput) {
    const {
      page,
      limit,
      category,
      minWeight,
      maxWeight,
      minPrice,
      maxPrice,
      color,
      origin,
      clarity,
      cut,
      search,
      sort,
    } = query;

    const where: Record<string, unknown> = { status: "approved" };
    if (category) where.category = { equals: category, mode: "insensitive" };
    if (color) where.color = { contains: color, mode: "insensitive" };
    if (origin) where.origin = { contains: origin, mode: "insensitive" };
    if (clarity) where.clarity = { contains: clarity, mode: "insensitive" };
    if (cut) where.cut = { contains: cut, mode: "insensitive" };
    if (minWeight || maxWeight)
      where.weightCarats = {
        ...(minWeight && { gte: minWeight }),
        ...(maxWeight && { lte: maxWeight }),
      };
    if (minPrice || maxPrice)
      where.askingPrice = {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      };
    if (search)
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case "price_asc":
        orderBy.askingPrice = "asc";
        break;
      case "price_desc":
        orderBy.askingPrice = "desc";
        break;
      case "weight_asc":
        orderBy.weightCarats = "asc";
        break;
      case "weight_desc":
        orderBy.weightCarats = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const [total, gems] = await Promise.all([
      prisma.gem.count({ where }),
      prisma.gem.findMany({
        where,
        include: GEM_INCLUDE,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { gems, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getById(id: string, userId?: string) {
    const gem = await prisma.gem.findUnique({
      where: { id },
      include: {
        ...GEM_INCLUDE,
        _count: { select: { reservations: true, valuations: true } },
      },
    });
    if (!gem) throw createError("Gem not found", 404);

    // Non-approved gems only visible to seller or admin
    if (gem.status !== "approved" && gem.sellerId !== userId) {
      throw createError("Gem not found", 404);
    }

    return gem;
  },

  async create(sellerId: string, data: CreateGemInput) {
    return prisma.gem.create({
      data: {
        sellerId,
        title: data.title,
        description: data.description,
        category: data.category,
        weightCarats: data.weightCarats,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        dimensions: data.dimensions as Record<string, unknown> | undefined,
        origin: data.origin,
        treatment: data.treatment,
        certificateNo: data.certificateNo,
        askingPrice: data.askingPrice,
        status: "draft",
      },
      include: GEM_INCLUDE,
    });
  },

  async update(id: string, sellerId: string, data: Partial<CreateGemInput>) {
    const gem = await prisma.gem.findUnique({ where: { id } });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.sellerId !== sellerId) throw createError("Forbidden", 403);
    if (!["draft", "rejected"].includes(gem.status)) {
      throw createError("Can only edit draft or rejected gems", 400);
    }

    return prisma.gem.update({
      where: { id },
      data: {
        ...data,
        dimensions: data.dimensions as Record<string, unknown> | undefined,
        status: "draft",
        rejectionNote: null,
      },
      include: GEM_INCLUDE,
    });
  },

  async delete(id: string, sellerId: string) {
    const gem = await prisma.gem.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.sellerId !== sellerId) throw createError("Forbidden", 403);
    if (gem.status === "approved" || gem.status === "sold") {
      throw createError("Cannot delete approved or sold gems", 400);
    }

    // Delete images from cloudinary
    for (const img of gem.images) {
      if (img.publicId) {
        await uploadService.deleteFile(img.publicId).catch(console.error);
      }
    }

    await prisma.gem.delete({ where: { id } });
  },

  async submitForReview(id: string, sellerId: string) {
    const gem = await prisma.gem.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.sellerId !== sellerId) throw createError("Forbidden", 403);
    if (!["draft", "rejected"].includes(gem.status)) {
      throw createError("Gem is not in draft or rejected status", 400);
    }
    if (gem.images.length === 0)
      throw createError("Please upload at least one image", 400);

    return prisma.gem.update({
      where: { id },
      data: { status: "pending_review" },
      include: GEM_INCLUDE,
    });
  },

  async getSellerGems(sellerId: string) {
    return prisma.gem.findMany({
      where: { sellerId },
      include: GEM_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  async addImages(
    gemId: string,
    sellerId: string,
    files: Express.Multer.File[],
  ) {
    const gem = await prisma.gem.findUnique({
      where: { id: gemId },
      include: { images: true },
    });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.sellerId !== sellerId) throw createError("Forbidden", 403);

    const uploaded = await Promise.all(
      files.map((file) =>
        uploadService.uploadImage(file.buffer, file.mimetype, "gems"),
      ),
    );

    const hasPrimary = gem.images.some((i) => i.isPrimary);
    const startOrder = gem.images.length;

    const images = await prisma.$transaction(
      uploaded.map((result, idx) =>
        prisma.gemImage.create({
          data: {
            gemId,
            url: result.secure_url,
            publicId: result.public_id,
            isPrimary: !hasPrimary && idx === 0,
            order: startOrder + idx,
          },
        }),
      ),
    );

    return images;
  },

  async removeImage(gemId: string, imageId: string, sellerId: string) {
    const gem = await prisma.gem.findUnique({ where: { id: gemId } });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.sellerId !== sellerId) throw createError("Forbidden", 403);

    const image = await prisma.gemImage.findFirst({
      where: { id: imageId, gemId },
    });
    if (!image) throw createError("Image not found", 404);

    if (image.publicId) {
      await uploadService.deleteFile(image.publicId).catch(console.error);
    }

    await prisma.gemImage.delete({ where: { id: imageId } });

    // If deleted image was primary, promote first remaining image
    if (image.isPrimary) {
      const firstImage = await prisma.gemImage.findFirst({
        where: { gemId },
        orderBy: { order: "asc" },
      });
      if (firstImage) {
        await prisma.gemImage.update({
          where: { id: firstImage.id },
          data: { isPrimary: true },
        });
      }
    }
  },

  async uploadCertificate(
    gemId: string,
    sellerId: string,
    file: Express.Multer.File,
  ) {
    const gem = await prisma.gem.findUnique({ where: { id: gemId } });
    if (!gem) throw createError("Gem not found", 404);
    if (gem.sellerId !== sellerId) throw createError("Forbidden", 403);

    const result = await uploadService.uploadFile(
      file.buffer,
      file.mimetype,
      "certificates",
    );

    return prisma.gem.update({
      where: { id: gemId },
      data: { certificateUrl: result.secure_url },
      include: GEM_INCLUDE,
    });
  },
};
