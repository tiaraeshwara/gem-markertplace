import { z } from "zod";

export const createGemSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    weightCarats: z.coerce.number().positive("Weight must be positive"),
    color: z.string().optional(),
    clarity: z.string().optional(),
    cut: z.string().optional(),
    dimensions: z
      .object({
        length: z.number().optional(),
        width: z.number().optional(),
        depth: z.number().optional(),
      })
      .optional(),
    origin: z.string().optional(),
    treatment: z.string().optional(),
    certificateNo: z.string().optional(),
    askingPrice: z.coerce.number().positive("Asking price must be positive"),
  }),
});

export const updateGemSchema = createGemSchema.partial();

export const gemQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(12),
    category: z.string().optional(),
    minWeight: z.coerce.number().optional(),
    maxWeight: z.coerce.number().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    color: z.string().optional(),
    origin: z.string().optional(),
    clarity: z.string().optional(),
    cut: z.string().optional(),
    search: z.string().optional(),
    sort: z
      .enum(["newest", "price_asc", "price_desc", "weight_asc", "weight_desc"])
      .optional(),
  }),
});

export type CreateGemInput = z.infer<typeof createGemSchema>["body"];
export type GemQueryInput = z.infer<typeof gemQuerySchema>["query"];
