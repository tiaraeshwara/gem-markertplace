import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, ChevronLeft } from "lucide-react";
import { gemsApi } from "@/api";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GEM_CATEGORIES } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3, "At least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Required"),
  weightCarats: z.coerce.number().positive("Must be positive"),
  askingPrice: z.coerce.number().positive("Must be positive"),
  color: z.string().optional(),
  clarity: z.string().optional(),
  cut: z.string().optional(),
  origin: z.string().optional(),
  treatment: z.string().optional(),
  dimensions: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function GemFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<
    { id: string; url: string; isPrimary: boolean }[]
  >([]);
  const [certificate, setCertificate] = useState<File | null>(null);

  const { data: gem } = useQuery({
    queryKey: ["gem", id],
    queryFn: () => gemsApi.getOne(id!).then((r) => r.data),
    enabled: isEdit,
    onSuccess: (data: Record<string, unknown>) => {
      Object.entries(data).forEach(([key, value]) => {
        if (key in schema.shape && value !== null && value !== undefined) {
          setValue(key as keyof FormData, value as string);
        }
      });
      if (Array.isArray(data.images))
        setExistingImages(data.images as typeof existingImages);
    },
  } as Parameters<typeof useQuery>[0]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onDrop = useCallback((accepted: File[]) => {
    setImages((prev) => [...prev, ...accepted].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 10 * 1024 * 1024,
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== "") formData.append(k, String(v));
      });
      images.forEach((img) => formData.append("images", img));
      if (certificate) formData.append("certificate", certificate);

      if (isEdit) return gemsApi.update(id!, formData);
      return gemsApi.create(formData);
    },
    onSuccess: (res) => {
      toast({
        title: isEdit ? "Updated!" : "Created!",
        description: "Your listing has been saved.",
      });
      navigate(`/seller/gems/${res.data.id}/bids`);
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (gemId: string) => gemsApi.submitForReview(gemId),
    onSuccess: () => {
      toast({
        title: "Submitted for review",
        description: "Admin will review your listing shortly.",
      });
      navigate("/seller/gems");
    },
  });

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Listing" : "New Gem Listing"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-6"
      >
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Natural Ruby 2.5ct"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-destructive text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select
                  onValueChange={(v) => setValue("category", v)}
                  defaultValue={gem?.category as string}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GEM_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="weightCarats">Weight (carats) *</Label>
                <Input
                  id="weightCarats"
                  type="number"
                  step="0.01"
                  placeholder="2.50"
                  {...register("weightCarats")}
                />
                {errors.weightCarats && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.weightCarats.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="askingPrice">Asking Price (USD) *</Label>
              <Input
                id="askingPrice"
                type="number"
                step="0.01"
                placeholder="1000"
                {...register("askingPrice")}
              />
              {errors.askingPrice && (
                <p className="text-destructive text-xs mt-1">
                  {errors.askingPrice.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe your gem..."
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {(
              [
                "color",
                "clarity",
                "cut",
                "origin",
                "treatment",
                "dimensions",
              ] as const
            ).map((field) => (
              <div key={field}>
                <Label htmlFor={field} className="capitalize">
                  {field}
                </Label>
                <Input
                  id={field}
                  placeholder={`Enter ${field}`}
                  {...register(field)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.url}
                      alt=""
                      className="h-20 w-20 object-cover rounded-md"
                    />
                    {img.isPrimary && (
                      <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] text-center">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop images here"
                  : "Drag & drop or click to upload (max 10 images, 10MB each)"}
              </p>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-20 w-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((imgs) => imgs.filter((_, j) => j !== i))
                      }
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer border rounded-md px-4 py-2 hover:bg-accent transition-colors">
                <FileText className="h-4 w-4" />
                <span className="text-sm">
                  Upload Certificate (PDF, max 20MB)
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,image/*"
                  onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                />
              </label>
              {certificate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {certificate.name}
                  </span>
                  <button type="button" onClick={() => setCertificate(null)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Saving..."
              : isEdit
                ? "Update Listing"
                : "Save as Draft"}
          </Button>
          {isEdit && gem?.status === "draft" && (
            <Button
              type="button"
              disabled={submitReviewMutation.isPending}
              onClick={() => submitReviewMutation.mutate(id!)}
            >
              Submit for Review
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
