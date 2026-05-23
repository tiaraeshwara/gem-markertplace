import { Response, NextFunction } from "express";
import { gemsService } from "./gems.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import {
  createGemSchema,
  updateGemSchema,
  gemQuerySchema,
} from "./gems.schema";

export const gemsController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = gemQuerySchema.safeParse({ query: req.query });
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      const result = await gemsService.listApproved(parsed.data.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gem = await gemsService.getById(req.params.id, req.user?.id);
      res.json(gem);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Handle JSON in multipart form
      if (req.body.dimensions && typeof req.body.dimensions === "string") {
        req.body.dimensions = JSON.parse(req.body.dimensions);
      }
      const parsed = createGemSchema.safeParse({ body: req.body });
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      const gem = await gemsService.create(req.user!.id, parsed.data.body);
      res.status(201).json(gem);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.body.dimensions && typeof req.body.dimensions === "string") {
        req.body.dimensions = JSON.parse(req.body.dimensions);
      }
      const parsed = updateGemSchema.safeParse({ body: req.body });
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      const gem = await gemsService.update(
        req.params.id,
        req.user!.id,
        parsed.data.body || {},
      );
      res.json(gem);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await gemsService.delete(req.params.id, req.user!.id);
      res.json({ message: "Gem deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  async submitForReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gem = await gemsService.submitForReview(
        req.params.id,
        req.user!.id,
      );
      res.json(gem);
    } catch (err) {
      next(err);
    }
  },

  async myGems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gems = await gemsService.getSellerGems(req.user!.id);
      res.json(gems);
    } catch (err) {
      next(err);
    }
  },

  async addImages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ message: "No images provided" });
        return;
      }
      const images = await gemsService.addImages(
        req.params.id,
        req.user!.id,
        files,
      );
      res.status(201).json(images);
    } catch (err) {
      next(err);
    }
  },

  async removeImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await gemsService.removeImage(
        req.params.id,
        req.params.imageId,
        req.user!.id,
      );
      res.json({ message: "Image removed" });
    } catch (err) {
      next(err);
    }
  },

  async uploadCertificate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ message: "No certificate file provided" });
        return;
      }
      const gem = await gemsService.uploadCertificate(
        req.params.id,
        req.user!.id,
        file,
      );
      res.json(gem);
    } catch (err) {
      next(err);
    }
  },
};
