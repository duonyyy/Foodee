"use client";

import { guestService } from "@/api/guest";
import { userApi } from "@/api/user";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useNotification } from "@/components/ui/notification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Plus,
  Save,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateFoodPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const { showNotification } = useNotification();
  const restaurantId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPercent: "",
    categoryId: "",
    preparationTime: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryLoading(true);
      try {
        const res = await guestService.category.getCategories(1, 100);
        setCategories(res.items);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
        showNotification("Không thể tải danh mục món ăn", "error");
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, [showNotification]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageUrlsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) => file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== files.length) {
      showNotification(
        "Một số ảnh có kích thước quá lớn (>5MB) đã bị loại bỏ",
        "warning",
      );
    }

    setImageFiles(validFiles);
    setImagePreviews(
      validFiles.map((file) => URL.createObjectURL(file)),
    );
    if (validFiles.length > 0) {
      showNotification(
        `Đã chọn ${validFiles.length} ảnh phụ`,
        "success",
      );
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập tên món ăn.";
    }

    if (!form.price || Number(form.price) <= 0) {
      newErrors.price = "Giá món ăn phải lớn hơn 0đ.";
    }

    if (!form.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục cho món ăn.";
    }

    if (!imageFile) {
      newErrors.image = "Vui lòng tải lên ảnh đại diện món ăn.";
    }

    if (form.discountPercent) {
      const discount = Number(form.discountPercent);
      if (discount < 0 || discount > 100) {
        newErrors.discountPercent =
          "Phần trăm giảm giá từ 0 đến 100%.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!validateForm()) {
      showNotification(
        "Vui lòng hoàn thành các trường bắt buộc",
        "error",
      );
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      const token = getToken();
      if (!token || !restaurantId)
        throw new Error(
          "Phiên đăng nhập hết hạn hoặc thiếu mã nhà hàng",
        );

      let imageUrl = "";

      // 1. Cover image upload
      if (imageFile) {
        setUploadProgress(25);
        const apiRequestBody = {
          fileName: imageFile.name,
          fileType: imageFile.type,
          folder: "food-images",
          isPublic: true,
        };
        const signedUrlResponse = await fetch("/api/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiRequestBody),
        });

        if (!signedUrlResponse.ok) {
          const errorData = await signedUrlResponse
            .json()
            .catch(() => ({ message: "Không thể lấy URL tải lên." }));
          throw new Error(
            errorData.message ||
              `Lỗi khi lấy URL tải lên: ${signedUrlResponse.statusText}`,
          );
        }
        const { url: signedUrl, publicUrl } =
          await signedUrlResponse.json();
        if (!signedUrl || !publicUrl)
          throw new Error("Không nhận được URL hợp lệ từ máy chủ.");

        setUploadProgress(50);
        const minioUploadResponse = await fetch(signedUrl, {
          method: "PUT",
          body: imageFile,
          headers: {
            "Content-Type": imageFile.type,
          },
        });
        if (!minioUploadResponse.ok) {
          throw new Error(
            `Tải ảnh lên lưu trữ thất bại: ${minioUploadResponse.statusText}`,
          );
        }
        imageUrl = publicUrl;
      }

      // 2. Gallery images upload
      const imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadProgress(60);
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const apiRequestBody = {
            fileName: file.name,
            fileType: file.type,
            folder: "food-images",
            isPublic: true,
          };
          const signedUrlResponse = await fetch("/api/media/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiRequestBody),
          });

          if (signedUrlResponse.ok) {
            const { url: signedUrl, publicUrl } =
              await signedUrlResponse.json();
            if (signedUrl && publicUrl) {
              const minioUploadResponse = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: {
                  "Content-Type": file.type,
                },
              });
              if (minioUploadResponse.ok) {
                imageUrls.push(publicUrl);
              }
            }
          }
          setUploadProgress(60 + (i + 1) * (20 / imageFiles.length));
        }
      }

      if (!imageUrl && imageUrls.length > 0) {
        imageUrl = imageUrls[0];
      }

      setUploadProgress(90);
      await userApi.food.createFood(token, {
        ...form,
        restaurantId,
        image: imageUrl,
        imageUrls,
      });

      setUploadProgress(100);
      showNotification("Tạo món ăn mới thành công!", "success");

      setTimeout(() => {
        router.push(`/restaurant/${restaurantId}/edit/food-list`);
      }, 700);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Tạo món ăn thất bại";
      showNotification(msg, "error");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation back and Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={loading}
            className="flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại thực đơn</span>
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Thêm món ăn mới
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Cung cấp chi tiết món ăn, giá bán và hình ảnh hiển thị
              cho thực khách
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="bg-muted/50 px-6 py-3.5 border-b border-border/70 flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Thông tin cơ bản
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label="Tên món ăn"
                  description="Tên món ăn sẽ hiển thị nổi bật trên menu"
                  error={errors.name}
                  required
                >
                  <Input
                    id="foodName"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ví dụ: Cơm sườn nướng mật ong"
                    disabled={loading}
                    className="h-10 rounded-xl"
                  />
                </FormField>

                <FormField
                  label="Giá bán (VNĐ)"
                  description="Giá niêm yết của món ăn"
                  error={errors.price}
                  required
                >
                  <Input
                    id="foodPrice"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Ví dụ: 45000"
                    disabled={loading}
                    min="1000"
                    className="h-10 rounded-xl"
                  />
                </FormField>

                <FormField
                  label="Giảm giá (%)"
                  description="Phần trăm khuyến mãi áp dụng riêng cho món này"
                  error={errors.discountPercent}
                >
                  <Input
                    id="foodDiscount"
                    name="discountPercent"
                    type="number"
                    value={form.discountPercent}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    max="100"
                    disabled={loading}
                    className="h-10 rounded-xl"
                  />
                </FormField>

                <FormField
                  label="Danh mục món ăn"
                  description="Nhóm danh mục phân loại món"
                  error={errors.categoryId}
                  required
                >
                  <Select
                    value={form.categoryId}
                    onValueChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        categoryId: value,
                      }));
                      if (errors.categoryId) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.categoryId;
                          return next;
                        });
                      }
                    }}
                    disabled={categoryLoading || loading}
                  >
                    <SelectTrigger
                      id="foodCategory"
                      className="h-10 rounded-xl"
                    >
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Thời gian chế biến (phút)"
                  description="Thời gian dự kiến để làm xong món"
                  error={errors.preparationTime}
                >
                  <Input
                    id="foodPrepTime"
                    name="preparationTime"
                    type="number"
                    value={form.preparationTime}
                    onChange={handleChange}
                    placeholder="Ví dụ: 15"
                    min="1"
                    disabled={loading}
                    className="h-10 rounded-xl"
                  />
                </FormField>
              </div>

              <FormField
                label="Mô tả món ăn"
                description="Mô tả hương vị, nguyên liệu, khẩu phần để thực khách dễ lựa chọn"
                error={errors.description}
              >
                <Textarea
                  id="foodDescription"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả món ăn, gia vị đặc trưng, thành phần dinh dưỡng..."
                  rows={3}
                  disabled={loading}
                  className="rounded-xl resize-none"
                />
              </FormField>
            </div>
          </div>

          {/* Section 2: Image Upload */}
          <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="bg-muted/50 px-6 py-3.5 border-b border-border/70 flex items-center gap-2.5">
              <Camera className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Hình ảnh món ăn
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Cover Image with FileUpload */}
              <FileUpload
                label="Ảnh đại diện món ăn *"
                description="Hình ảnh chính hiển thị trong danh sách và tìm kiếm (PNG, JPG, WEBP tối đa 5MB)"
                value={preview}
                onChange={(file, previewUrl) => {
                  setImageFile(file);
                  setPreview(previewUrl);
                  if (errors.image) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.image;
                      return next;
                    });
                  }
                }}
                maxSizeMB={5}
                isUploading={loading}
                uploadProgress={
                  uploadProgress > 0 ? uploadProgress : undefined
                }
                disabled={loading}
                error={errors.image}
              />

              {/* Gallery Images */}
              <div className="space-y-3 pt-4 border-t border-border/60">
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Thư viện ảnh bổ sung (Tùy chọn)
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Tối đa 5MB mỗi ảnh
                  </span>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/20 transition-colors">
                  <Input
                    id="foodGallery"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    onChange={handleImageUrlsChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="foodGallery"
                    className="cursor-pointer flex flex-col items-center gap-2 py-2"
                  >
                    <Plus className="w-6 h-6 text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      Thêm nhiều ảnh phụ cho món ăn
                    </span>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {imagePreviews.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative h-20 w-full overflow-hidden rounded-xl border border-border bg-muted group"
                      >
                        <Image
                          src={src}
                          alt={`Ảnh phụ ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveGalleryImage(idx)
                          }
                          aria-label={`Xóa ảnh phụ ${idx + 1}`}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="font-bold min-w-40 h-11 shadow-2xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Đang lưu ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>Tạo món ăn</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
