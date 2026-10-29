"use client";

import { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { Restaurant } from "@/interface";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Store, MapPin, Clock, Phone, Image as ImageIcon, Save, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";

const MapboxSearch = dynamic(() => import("@/components/mapbox-search"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-xl bg-muted/40 animate-pulse border border-border" />,
});

interface CommonInfoFormProps {
  restaurant: Partial<Restaurant>;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  loading: boolean;
  authLoading: boolean;
  hideAddressInput?: boolean;
  handleAddressSelect?: (address: { full: string; latitude: number; longitude: number }) => void;
  addressSelects?: React.ReactNode;
}

export function CommonInfoForm({
  restaurant,
  handleInputChange,
  handleSubmit,
  saving,
  loading,
  authLoading,
  hideAddressInput = false,
  handleAddressSelect,
}: CommonInfoFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. General Brand Information */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Thông tin thương hiệu
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tên quán, câu giới thiệu và nhận diện xuất hiện với khách hàng
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div>
            <Label htmlFor="name" className="text-xs font-bold text-foreground">
              Tên Nhà Hàng / Quán Ăn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={restaurant.name ?? ""}
              onChange={handleInputChange}
              placeholder="VD: Phở Bò Gia Truyền 1986"
              className="mt-1.5 h-11 rounded-xl bg-background border-border font-medium"
              required
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-xs font-bold text-foreground">
              Mô Tả & Giới Thiệu Quán
            </Label>
            <Textarea
              id="description"
              name="description"
              value={restaurant.description ?? ""}
              onChange={handleInputChange}
              placeholder="Kể đôi nét về hương vị đặc trưng, nguyên liệu tươi sạch của quán..."
              className="mt-1.5 rounded-xl bg-background border-border text-sm"
              rows={3}
              disabled={saving}
            />
          </div>

          {/* Visual Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                <span>Logo / Ảnh Đại Diện</span>
              </Label>
              {restaurant.avatar ? (
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-border shadow-xs">
                  <Image
                    src={restaurant.avatar}
                    alt="Logo"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Chưa có logo</p>
              )}
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                <span>Ảnh Bìa Nhà Hàng</span>
              </Label>
              {restaurant.backgroundImage ? (
                <div className="relative h-20 w-full rounded-xl overflow-hidden border border-border shadow-xs">
                  <Image
                    src={restaurant.backgroundImage}
                    alt="Ảnh bìa"
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Chưa có ảnh bìa</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Address & Geolocation */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Vị trí & Địa chỉ đón hàng
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tọa độ chuẩn xác giúp shipper và khách hàng tính phí giao hàng tối ưu
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {hideAddressInput && handleAddressSelect && !loading && !authLoading ? (
            <div className="space-y-3">
              <MapboxSearch
                key="common-info-mapbox-search"
                onAddressSelect={handleAddressSelect}
                initialAddress={restaurant.address?.street || ""}
                initialLatitude={restaurant.latitude}
                initialLongitude={restaurant.longitude}
                height="320px"
                className="rounded-2xl border border-border overflow-hidden"
                placeholder="Nhập địa chỉ nhà hàng để ghim tọa độ..."
              />

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs space-y-1">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Địa chỉ hiện tại của quán:
                </p>
                <p className="text-foreground font-medium pl-5">
                  {restaurant.address?.street
                    ? `${restaurant.address.street}, ${restaurant.address.ward || ""}, ${restaurant.address.district || ""}, ${restaurant.address.city || ""}`
                    : "Chưa ghim địa chỉ"}
                </p>
              </div>
            </div>
          ) : (
            <Input
              id="address"
              name="address"
              value={
                typeof restaurant.address === "string"
                  ? restaurant.address
                  : restaurant.address
                  ? `${restaurant.address.street}, ${restaurant.address.ward}, ${restaurant.address.district}, ${restaurant.address.city}`
                  : ""
              }
              onChange={handleInputChange}
              placeholder="Số nhà, đường, phường, quận..."
              className="h-11 rounded-xl bg-background border-border"
              disabled={saving}
            />
          )}
        </CardContent>
      </Card>

      {/* 3. Operating Hours & Hotline */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Giờ hoạt động & Hotline
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Thời gian mở cửa phục vụ và số điện thoại liên hệ với quán
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div>
            <Label htmlFor="phoneNumber" className="text-xs font-bold text-foreground flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>Hotline Quán</span>
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={restaurant.phoneNumber ?? ""}
              onChange={handleInputChange}
              placeholder="09xx xxx xxx"
              className="mt-1.5 h-11 rounded-xl bg-background border-border"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="openTime" className="text-xs font-bold text-foreground">
              Giờ Mở Cửa
            </Label>
            <Input
              id="openTime"
              name="openTime"
              type="time"
              value={restaurant.openTime ?? "08:00"}
              onChange={handleInputChange}
              className="mt-1.5 h-11 rounded-xl bg-background border-border"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="closeTime" className="text-xs font-bold text-foreground">
              Giờ Đóng Cửa
            </Label>
            <Input
              id="closeTime"
              name="closeTime"
              type="time"
              value={restaurant.closeTime ?? "22:00"}
              onChange={handleInputChange}
              className="mt-1.5 h-11 rounded-xl bg-background border-border"
              disabled={saving}
            />
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-4 pb-4 px-6 border-t border-border/60 bg-muted/10 rounded-b-2xl">
          <span className="text-xs text-muted-foreground">
            Thông tin sẽ cập nhật tức thì trên ứng dụng khách hàng
          </span>
          <Button
            type="submit"
            disabled={saving || loading || authLoading}
            className="h-10 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}