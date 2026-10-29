"use client";

import { guestService } from "@/api/guest";
import { userApi } from "@/api/user";
import { Badge } from "@/components/ui/badge";
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
import { FoodDetail, Topping } from "@/interface";
import {
  ArrowLeft,
  Camera,
  Clock,
  Eye,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Tag,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FoodForm = {
  name: string;
  description: string;
  price: string;
  discountPercent: string;
  categoryId: string;
  preparationTime: string;
  image: string;
  imageUrls: string[];
};

export default function UpdateFoodPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { showNotification } = useNotification();
  const params = useParams();
  const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;
  const foodId = Array.isArray(params.foodId)
    ? params.foodId[0]
    : params.foodId;

  const [form, setForm] = useState<FoodForm>({
    name: "",
    description: "",
    price: "",
    discountPercent: "",
    categoryId: "",
    preparationTime: "",
    image: "",
    imageUrls: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [toppingName, setToppingName] = useState("");
  const [toppingPrice, setToppingPrice] = useState("");
  const [toppingLoading, setToppingLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryLoading(true);
      try {
        const data = await guestService.category.getCategories(1, 100);
        setCategories(data.items || []);
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

  // Fetch food data
  useEffect(() => {
    const fetchFood = async () => {
      if (!foodId) return;
      setInitialLoading(true);
      try {
        const token = getToken?.();
        if (!token || !restaurantId)
          throw new Error("Phiên đăng nhập hết hạn hoặc thiếu mã nhà hàng");
        const food: FoodDetail = await userApi.food.getFoodById(token, foodId);

        let categoryId = food.category?.id || "";
        if (
          categoryId &&
          categories.length > 0 &&
          !categories.some((cat) => cat.id === categoryId)
        ) {
          categoryId = "";
        }

        setForm({
          name: food.name || "",
          description: food.description || "",
          price: food.price?.toString() || "",
          discountPercent: food.discountPercent?.toString() || "",
          categoryId,
          preparationTime: food.preparationTime?.toString() || "",
          image: food.image || "",
          imageUrls: food.imageUrls || [],
        });
        setPreview(food.image || "");
        setImagePreviews(food.imageUrls || []);
      } catch (err) {
        console.error("Failed to fetch food:", err);
        showNotification("Không thể tải dữ liệu món ăn", "error");
      } finally {
        setInitialLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchFood();
    }
  }, [foodId, categories, restaurantId, getToken, showNotification]);

  // Fetch toppings
  useEffect(() => {
    const fetchToppings = async () => {
      if (!foodId) return;
      try {
        const data = await userApi.food.getToppings(foodId);
        setToppings(data);
      } catch (err) {
        console.error("Failed to fetch toppings:", err);
        setToppings([]);
      }
    };
    fetchToppings();
  }, [foodId]);

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

    setImageFiles((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) =>
      URL.createObjectURL(file),
    );
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setForm((prev) => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddTopping = async () => {
    if (!toppingName.trim() || !toppingPrice.trim()) {
      showNotification(
        "Vui lòng nhập tên và giá cho topping",
        "warning",
      );
      return;
    }

    const priceValue = parseFloat(toppingPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      showNotification("Giá topping phải lớn hơn 0đ", "error");
      return;
    }

    setToppingLoading(true);
    try {
      const token = getToken();
      if (!token || !foodId) return;

      const newTopping = await userApi.food.addTopping(token, foodId, {
        name: toppingName.trim(),
        price: priceValue.toString(),
      } as Topping);

      setToppings((prev) => [...prev, newTopping]);
      setToppingName("");
      setToppingPrice("");
      showNotification("Đã thêm topping thành công", "success");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Thêm topping thất bại";
      showNotification(msg, "error");
    } finally {
      setToppingLoading(false);
    }
  };

  const handleRemoveTopping = async (toppingId: string) => {
    setToppingLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      await userApi.food.removeTopping(token, toppingId);
      setToppings((prev) => prev.filter((t) => t.id !== toppingId));
      showNotification("Đã xóa topping", "success");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Xóa topping thất bại";
      showNotification(msg, "error");
    } finally {
      setToppingLoading(false);
    }
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

    if (!preview && !imageFile && !form.image) {
      newErrors.image = "Vui lòng tải lên ảnh đại diện món ăn.";
    }

    if (form.discountPercent) {
      const discount = Number(form.discountPercent);
      if (discount < 0 || discount > 100) {
        newErrors.discountPercent = "Phần trăm giảm giá từ 0 đến 100%.";
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
      if (!token || !restaurantId || !foodId)
        throw new Error(
          "Phiên đăng nhập hết hạn hoặc thiếu mã nhà hàng",
        );

      let imageUrl = form.image || "";

      // 1. Cover image upload if newly selected
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
              `Lỗi khi lấy URL: ${signedUrlResponse.statusText}`,
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
          headers: { "Content-Type": imageFile.type },
        });
        if (!minioUploadResponse.ok) {
          throw new Error(
            `Tải ảnh lên thất bại: ${minioUploadResponse.statusText}`,
          );
        }
        imageUrl = publicUrl;
      }

      // 2. New Gallery images upload
      const uploadedUrls: string[] = [...(form.imageUrls || [])];
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
                headers: { "Content-Type": file.type },
              });
              if (minioUploadResponse.ok) {
                uploadedUrls.push(publicUrl);
              }
            }
          }
        }
      }

      setUploadProgress(90);
      const updateData = {
        ...form,
        restaurantId,
        image: imageUrl,
        imageUrls: uploadedUrls,
        preparationTime:
          form.preparationTime?.trim() === ""
            ? null
            : Number(form.preparationTime),
      };

      await userApi.food.updateFood(token, foodId, updateData);
      setUploadProgress(100);

      showNotification("Cập nhật món ăn thành công!", "success");
      setTimeout(() => {
        router.push(`/restaurant/${restaurantId}/edit/food-list`);
      }, 700);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Cập nhật món ăn thất bại";
      showNotification(msg, "error");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const selectedCategoryName =
    categories.find((c) => c.id === form.categoryId)?.name ||
    "Chưa phân loại";

  const numPrice = Number(form.price) || 0;
  const numDiscount = Number(form.discountPercent) || 0;
  const discountedPrice =
    numDiscount > 0 ? numPrice * (1 - numDiscount / 100) : numPrice;

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">
          Đang tải thông tin món ăn...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={loading}
            className="flex items-center gap-1.5 font-medium rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại thực đơn</span>
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Mã món: #{foodId?.slice(-6)}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Chỉnh sửa món ăn
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cập nhật giá, khuyến mãi, danh mục và quản lý các loại topping đi
            kèm
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
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
                      description="Tên món hiển thị trên menu"
                      error={errors.name}
                      required
                    >
                      <Input
                        id="foodName"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ví dụ: Cơm tấm sườn bì chả"
                        disabled={loading}
                        className="h-10 rounded-xl"
                      />
                    </FormField>

                    <FormField
                      label="Giá bán (VNĐ)"
                      description="Giá gốc niêm yết của món"
                      error={errors.price}
                      required
                    >
                      <Input
                        id="foodPrice"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="45000"
                        disabled={loading}
                        min="1000"
                        className="h-10 rounded-xl"
                      />
                    </FormField>

                    <FormField
                      label="Giảm giá (%)"
                      description="Phần trăm ưu đãi (0 - 100%)"
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
                      description="Phân loại để khách dễ tìm kiếm"
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
                      description="Thời gian làm xong món trung bình"
                      error={errors.preparationTime}
                    >
                      <Input
                        id="foodPrepTime"
                        name="preparationTime"
                        type="number"
                        value={form.preparationTime}
                        onChange={handleChange}
                        placeholder="15"
                        min="1"
                        disabled={loading}
                        className="h-10 rounded-xl"
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Mô tả món ăn"
                    description="Mô tả hương vị, nguyên liệu đặc trưng, khẩu phần"
                    error={errors.description}
                  >
                    <Textarea
                      id="foodDescription"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Mô tả chi tiết nguyên liệu, hương vị đặc sắc..."
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
                  {/* Cover Image */}
                  <FileUpload
                    label="Ảnh đại diện món ăn *"
                    description="Ảnh chất lượng cao hiển thị trên danh sách tìm kiếm và thực đơn (Tối đa 5MB)"
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

                  {/* Additional Gallery */}
                  <div className="space-y-3 pt-4 border-t border-border/60">
                    <div className="flex items-baseline justify-between">
                      <label className="text-sm font-semibold text-foreground">
                        Thư viện ảnh bổ sung ({imagePreviews.length} ảnh)
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
                          Chọn thêm ảnh phụ cho món ăn
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
                              onClick={() => handleRemoveGalleryImage(idx)}
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

              {/* Section 3: Topping Management */}
              <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
                <div className="bg-muted/50 px-6 py-3.5 border-b border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-bold text-foreground">
                      Tùy chọn Topping ({toppings.length})
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Khách có thể chọn thêm khi đặt
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Add Topping Form */}
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                    <p className="text-xs font-semibold text-foreground">
                      Thêm topping mới
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <div className="sm:col-span-3">
                        <Input
                          placeholder="Tên topping (ví dụ: Trứng ốp la, Phô mai...)"
                          value={toppingName}
                          onChange={(e) => setToppingName(e.target.value)}
                          className="h-10 rounded-xl"
                          disabled={toppingLoading}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Giá thêm (VNĐ)"
                          type="number"
                          value={toppingPrice}
                          onChange={(e) => setToppingPrice(e.target.value)}
                          className="h-10 rounded-xl"
                          min="1000"
                          disabled={toppingLoading}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddTopping}
                        disabled={
                          toppingLoading ||
                          !toppingName.trim() ||
                          !toppingPrice.trim()
                        }
                        className="rounded-xl font-medium"
                      >
                        {toppingLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            <span>Đang thêm...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1.5" />
                            <span>Thêm topping</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Toppings List */}
                  <div className="space-y-2">
                    {toppings.map((topping) => (
                      <div
                        key={topping.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {topping.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold"
                          >
                            +{Number(topping.price).toLocaleString("vi-VN")} đ
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTopping(topping.id)}
                          disabled={toppingLoading}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-8 w-8 p-0"
                          title="Xóa topping"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {toppings.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-6">
                        Chưa có món ăn kèm hoặc topping nào được cấu hình
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Live Customer Card Preview & Submit */}
            <div className="space-y-6">
              {/* Live Preview Card */}
              <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden sticky top-20">
                <div className="bg-muted/50 px-4 py-3 border-b border-border/70 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    Xem trước hiển thị với khách
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Food Card Preview */}
                  <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xs group">
                    <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
                      {preview ? (
                        <Image
                          src={preview}
                          alt="Xem trước món ăn"
                          fill
                          className="object-cover"
                          sizes="300px"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                          <UtensilsCrossed className="w-8 h-8 opacity-40" />
                          <span className="text-xs">Chưa có ảnh món</span>
                        </div>
                      )}

                      {numDiscount > 0 && (
                        <div className="absolute top-2.5 left-2.5 bg-red-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-full shadow-xs">
                          -{numDiscount}%
                        </div>
                      )}

                      {form.preparationTime && (
                        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{form.preparationTime} phút</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                          {selectedCategoryName}
                        </span>
                      </div>

                      <h4 className="font-bold text-foreground text-sm line-clamp-1">
                        {form.name || "Tên món ăn của bạn"}
                      </h4>

                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">
                        {form.description ||
                          "Mô tả món ăn sẽ hiển thị tại đây khi thực khách lướt menu..."}
                      </p>

                      <div className="pt-2 border-t border-border flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-primary">
                            {discountedPrice.toLocaleString("vi-VN")} đ
                          </span>
                          {numDiscount > 0 && (
                            <span className="text-xs text-muted-foreground line-through">
                              {numPrice.toLocaleString("vi-VN")} đ
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {toppings.length} topping
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full font-bold h-11 rounded-xl shadow-xs"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span>Đang lưu ({uploadProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1.5" />
                          <span>Lưu thay đổi</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
                      className="w-full rounded-xl"
                    >
                      Hủy bỏ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}