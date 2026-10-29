"use client";

import { userApi } from "@/api/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { Restaurant } from "@/interface";
import {
  Camera,
  CheckCircle2,
  Clock,
  FileCheck,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Sparkles,
  Store,
  UploadCloud,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Import MapboxSearch component dynamically to prevent SSR issues
const MapboxSearch = dynamic(
  () => import("@/components/mapbox-search"),
  {
    ssr: false,
    loading: () => (
      <div className="h-11 rounded-xl bg-muted/60 animate-pulse border border-border" />
    ),
  },
);

interface RestaurantFormData {
  name: string;
  address: string;
  description: string;
  phoneNumber: string;
  openTime: string;
  closeTime: string;
  licenseCode: string;
  latitude?: number;
  longitude?: number;
}

export default function MyShopPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshingData, setRefreshingData] = useState(false);

  const [form, setForm] = useState<RestaurantFormData>({
    name: "",
    address: "",
    description: "",
    phoneNumber: "",
    openTime: "07:00",
    closeTime: "22:00",
    licenseCode: "",
  });

  // File states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  // Image previews
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const fetchMyShop = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token || !user) return null;

      const response = await userApi.restaurant.getMyRestaurant(token);
      if (response && response.id) {
        setRestaurant(response);
        return response;
      } else {
        setRestaurant(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setRestaurant(null);
      return null;
    }
  }, [user, getToken]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchMyShop();
      setLoading(false);
    };

    loadInitialData();
  }, [fetchMyShop]);

  // Navigate to management dashboard if approved
  useEffect(() => {
    if (!restaurant) return;
    if (restaurant.status === "approved") {
      router.push(`/restaurant/${restaurant.id}/edit`);
    }
  }, [restaurant, router]);

  const handleAddressSelect = useCallback(
    (addressData: { full: string; latitude: number; longitude: number }) => {
      setForm((prev) => ({
        ...prev,
        address: addressData.full,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
      }));
    },
    [],
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước tệp không được vượt quá 5MB");
        return;
      }
      setFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên cửa hàng");
      return;
    }
    if (!form.address.trim()) {
      toast.error("Vui lòng chọn hoặc nhập địa chỉ cửa hàng");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token || !user) throw new Error("Chưa đăng nhập");

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      formData.append("ownerId", user.id);
      if (avatarFile) formData.append("avatar", avatarFile);
      if (backgroundFile) formData.append("backgroundImage", backgroundFile);
      if (certificateFile)
        formData.append("certificateImage", certificateFile);

      await userApi.restaurant.createRestaurantWithFiles(token, formData);
      toast.success(
        "Gửi hồ sơ đăng ký thành công! Hệ thống sẽ duyệt sớm nhất.",
      );

      setRefreshingData(true);
      await fetchMyShop();
      setRefreshingData(false);
    } catch (err) {
      toast.error("Có lỗi xảy ra khi tạo cửa hàng, vui lòng thử lại!");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">
          Đang tải thông tin cửa hàng...
        </p>
      </div>
    );
  }

  // State A: Pending approval
  if (restaurant && restaurant.status === "pending") {
    const fullAddress = [
      restaurant.address?.street,
      restaurant.address?.ward,
      restaurant.address?.district,
      restaurant.address?.city,
    ]
      .filter(Boolean)
      .join(", ") || "Chưa cập nhật địa chỉ";

    return (
      <div className="max-w-4xl mx-auto py-8 px-3 sm:px-6 space-y-8">
        <PageHeader
          title="Hồ sơ cửa hàng của bạn"
          description="Theo dõi tiến độ thẩm định hồ sơ đăng ký kinh doanh trên Foodee"
          breadcrumbs={[
            { label: "Trang chủ", href: "/" },
            { label: "Cửa hàng của tôi" },
          ]}
        />

        {/* Status Tracker Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-50/70 via-background to-card shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">
                    Hồ sơ đang chờ phê duyệt
                  </h2>
                  <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 font-semibold text-xs">
                    Chờ duyệt
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Quản trị viên Foodee đang tiến hành xác thực thông tin và giấy
                  phép của quán
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRefreshingData(true);
                fetchMyShop().finally(() => setRefreshingData(false));
              }}
              disabled={refreshingData}
              className="rounded-xl shrink-0"
            >
              {refreshingData ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Đang làm mới...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Kiểm tra lại trạng thái
                </>
              )}
            </Button>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  1. Gửi hồ sơ
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Đã tiếp nhận thông tin đầy đủ vào hệ thống
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-amber-500/40 bg-amber-500/5">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Clock className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  2. Thẩm định
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Đang xét duyệt giấy phép kinh doanh (1-3 ngày)
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-muted/30 opacity-70">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  3. Kích hoạt
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Mở cổng bán hàng và nhận đơn từ khách
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Information Preview Card */}
        <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="relative h-44 w-full bg-muted">
            {restaurant.backgroundImage ? (
              <Image
                src={restaurant.backgroundImage}
                alt="Ảnh bìa quán"
                fill
                className="object-cover"
                sizes="800px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center justify-center">
                <Store className="w-10 h-10 text-white/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Avatar & Title overlay */}
            <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white bg-card shadow-md shrink-0">
                {restaurant.avatar ? (
                  <Image
                    src={restaurant.avatar}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                    {restaurant.name?.charAt(0) || "F"}
                  </div>
                )}
              </div>
              <div className="text-white min-w-0">
                <h3 className="text-xl font-bold truncate">
                  {restaurant.name}
                </h3>
                <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {restaurant.openTime || "07:00"} -{" "}
                    {restaurant.closeTime || "22:00"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">
                    Địa chỉ nhà hàng
                  </p>
                  <p className="text-xs font-semibold text-foreground line-clamp-2 mt-0.5">
                    {fullAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">
                    Số điện thoại liên hệ
                  </p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">
                    {restaurant.phoneNumber || "Chưa cung cấp"}
                  </p>
                </div>
              </div>
            </div>

            {restaurant.description && (
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Mô tả quán:{" "}
                </span>
                {restaurant.description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // State B: Register new shop form
  return (
    <div className="max-w-4xl mx-auto py-8 px-3 sm:px-6 space-y-8">
      <PageHeader
        title="Đăng ký mở quán mới"
        description="Tham gia mạng lưới đối tác Foodee để tiếp cận hàng triệu khách hàng thân thiết"
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Đăng ký cửa hàng" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Brand Info */}
        <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="bg-muted/50 px-6 py-3.5 border-b border-border/70 flex items-center gap-2.5">
            <Store className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              1. Thông tin thương hiệu quán
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                label="Tên cửa hàng / quán ăn"
                description="Tên quán chính thức hiển thị trên ứng dụng"
                required
              >
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Cơm tấm Ba Ghiền"
                  required
                  className="h-10 rounded-xl"
                  disabled={submitting}
                />
              </FormField>

              <FormField
                label="Số điện thoại hotline"
                description="Số điện thoại để liên hệ đặt đơn và xác nhận"
                required
              >
                <Input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Ví dụ: 0901234567"
                  className="h-10 rounded-xl"
                  disabled={submitting}
                />
              </FormField>
            </div>

            <FormField
              label="Giới thiệu về quán"
              description="Nêu bật đặc trưng món ăn, phong cách ẩm thực của quán"
            >
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Giới thiệu các món đặc sản, nguyên liệu tươi ngon..."
                rows={3}
                className="rounded-xl resize-none"
                disabled={submitting}
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Address & Location */}
        <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="bg-muted/50 px-6 py-3.5 border-b border-border/70 flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              2. Địa chỉ kinh doanh & Bản đồ
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">
                Tìm kiếm địa chỉ trên bản đồ *
              </label>
              <MapboxSearch
                key="mapbox-search"
                onAddressSelect={handleAddressSelect}
                placeholder="Nhập địa chỉ hoặc tên địa điểm quán..."
                className="mb-3"
                debounceTime={1200}
              />
            </div>

            {form.address && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                <p className="text-xs font-semibold text-emerald-700">
                  Địa chỉ đã ghim tọa độ:
                </p>
                <p className="text-sm font-medium text-foreground">
                  {form.address}
                </p>
                {form.latitude && form.longitude && (
                  <p className="text-[11px] text-muted-foreground">
                    Tọa độ GPS: {form.latitude.toFixed(6)},{" "}
                    {form.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            )}

            <FormField
              label="Chi tiết số nhà, tên đường (Có thể điều chỉnh thủ công nếu cần)"
              required
            >
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Số nhà, ngõ/ngách, tên đường, phường, quận..."
                required
                className="h-10 rounded-xl"
                disabled={submitting}
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Operating Hours & Legal */}
        <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="bg-muted/50 px-6 py-3.5 border-b border-border/70 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              3. Giờ hoạt động & Pháp lý
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                label="Giờ mở cửa phục vụ"
                description="Thời điểm quán bắt đầu nhận đơn"
              >
                <Input
                  type="time"
                  name="openTime"
                  value={form.openTime}
                  onChange={handleChange}
                  className="h-10 rounded-xl"
                  disabled={submitting}
                />
              </FormField>

              <FormField
                label="Giờ đóng cửa"
                description="Thời điểm quán ngừng nhận đơn"
              >
                <Input
                  type="time"
                  name="closeTime"
                  value={form.closeTime}
                  onChange={handleChange}
                  className="h-10 rounded-xl"
                  disabled={submitting}
                />
              </FormField>
            </div>

            <FormField
              label="Mã số đăng ký kinh doanh / Giấy phép VSATTP"
              description="Dãy số mã số thuế hoặc số giấy phép kinh doanh"
            >
              <Input
                name="licenseCode"
                value={form.licenseCode}
                onChange={handleChange}
                placeholder="Ví dụ: 0312345678"
                className="h-10 rounded-xl"
                disabled={submitting}
              />
            </FormField>
          </div>
        </div>

        {/* Section 4: Visuals & Documents */}
        <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="bg-muted/50 px-6 py-3.5 border-b border-border/70 flex items-center gap-2.5">
            <Camera className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              4. Hình ảnh nhận diện & Hồ sơ pháp lý
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Logo / Avatar */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Logo / Avatar quán
                </label>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) =>
                    handleFileChange(e, setAvatarFile, setAvatarPreview)
                  }
                  className="hidden"
                  id="avatarInput"
                  disabled={submitting}
                />
                {avatarPreview ? (
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-border mx-auto group">
                    <Image
                      src={avatarPreview}
                      alt="Logo preview"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFile(
                          setAvatarFile,
                          setAvatarPreview,
                          avatarInputRef,
                        )
                      }
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="avatarInput"
                    className="border-2 border-dashed border-border rounded-2xl h-28 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/30 transition-colors p-3 text-center"
                  >
                    <UploadCloud className="w-6 h-6 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground">
                      Tải lên Logo
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Vuông, tối đa 5MB
                    </span>
                  </label>
                )}
              </div>

              {/* Cover Banner */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Ảnh bìa quán ăn
                </label>
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) =>
                    handleFileChange(
                      e,
                      setBackgroundFile,
                      setBackgroundPreview,
                    )
                  }
                  className="hidden"
                  id="backgroundInput"
                  disabled={submitting}
                />
                {backgroundPreview ? (
                  <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-border group">
                    <Image
                      src={backgroundPreview}
                      alt="Ảnh bìa preview"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFile(
                          setBackgroundFile,
                          setBackgroundPreview,
                          backgroundInputRef,
                        )
                      }
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="backgroundInput"
                    className="border-2 border-dashed border-border rounded-2xl h-28 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/30 transition-colors p-3 text-center"
                  >
                    <UploadCloud className="w-6 h-6 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground">
                      Tải lên Ảnh bìa
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Ngang, tối đa 5MB
                    </span>
                  </label>
                )}
              </div>

              {/* Certificate */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Ảnh Giấy phép kinh doanh
                </label>
                <input
                  ref={certificateInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, application/pdf"
                  onChange={(e) =>
                    handleFileChange(
                      e,
                      setCertificateFile,
                      setCertificatePreview,
                    )
                  }
                  className="hidden"
                  id="certificateInput"
                  disabled={submitting}
                />
                {certificatePreview ? (
                  <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-border group">
                    <Image
                      src={certificatePreview}
                      alt="Giấy phép preview"
                      fill
                      className="object-contain bg-muted"
                      sizes="200px"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFile(
                          setCertificateFile,
                          setCertificatePreview,
                          certificateInputRef,
                        )
                      }
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="certificateInput"
                    className="border-2 border-dashed border-border rounded-2xl h-28 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/30 transition-colors p-3 text-center"
                  >
                    <FileCheck className="w-6 h-6 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground">
                      Tải lên Giấy phép
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Ảnh hoặc PDF, tối đa 5MB
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            disabled={submitting}
            className="rounded-xl"
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            disabled={submitting}
            className="font-bold min-w-48 h-11 rounded-xl shadow-xs"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Đang xử lý hồ sơ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Gửi hồ sơ đăng ký mở quán</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
