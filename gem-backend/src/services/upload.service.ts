import cloudinary from "../config/cloudinary";

export const uploadService = {
  async uploadImage(
    buffer: Buffer,
    mimeType: string,
    folder: string,
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `gemvault/${folder}`,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed"));
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );
      uploadStream.end(buffer);
    });
  },

  async uploadFile(
    buffer: Buffer,
    mimeType: string,
    folder: string,
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const resourceType = mimeType === "application/pdf" ? "raw" : "image";
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `gemvault/${folder}`, resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed"));
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );
      uploadStream.end(buffer);
    });
  },

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  },
};
