"use client";

import { Badge } from "@/components/ui/badge";
import { Restaurant } from "@/interface";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Share2,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const [bgError, setBgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const bgImage =
    bgError || !restaurant.backgroundImage
      ? "/images/default-restaurant-bg.jpg"
      : restaurant.backgroundImage;

  const avatarImage =
    avatarError || !restaurant.avatar
      ? "/images/default-restaurant-avatar.jpg"
      : restaurant.avatar;

  const addressText = [
    restaurant.address?.street,
    restaurant.address?.ward,
    restaurant.address?.district,
    restaurant.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const ratingValue = Number(restaurant.rating || 0);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: restaurant.name,
          text: `Khám phá món ngon tại ${restaurant.name} trên Foodee!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết nhà hàng vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-3xl sm:h-[340px] lg:h-[380px] shadow-card">
      {/* Background Banner Image */}
      <Image
        src={bgImage}
        alt={restaurant.name}
        fill
        className="object-cover brightness-[0.65] transition duration-700 hover:scale-105"
        priority
        onError={() => setBgError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />

      {/* Top right quick actions (Share button) */}
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3.5 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur-md transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Chia sẻ nhà hàng"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* Bottom Main Content */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:p-6 lg:p-8">
        {/* Avatar */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/90 bg-muted shadow-2xl sm:h-28 sm:w-28 lg:h-32 lg:w-32">
          <Image
            src={avatarImage}
            alt={restaurant.name}
            fill
            className="object-cover"
            onError={() => setAvatarError(true)}
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-white">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-white drop-shadow-sm">
              {restaurant.name}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-black text-white shadow-sm backdrop-blur-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đối tác chính thức
            </span>

            {/* Glowing Live Open Indicator */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-300 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Đang mở cửa
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/90 sm:text-sm">
            {addressText ? (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary-lighter" />
                <span className="max-w-md truncate">{addressText}</span>
              </div>
            ) : null}

            {restaurant.openTime && restaurant.closeTime ? (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0 text-amber-300" />
                <span>
                  {restaurant.openTime} - {restaurant.closeTime}
                </span>
              </div>
            ) : null}

            {restaurant.phoneNumber ? (
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 shrink-0 text-white/80" />
                <span>{restaurant.phoneNumber}</span>
              </div>
            ) : null}
          </div>

          {/* Badges Bar */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {ratingValue > 0 ? (
              <Badge className="gap-1 bg-amber-500 text-white shadow-sm hover:bg-amber-600 font-black">
                <Star className="h-3.5 w-3.5 fill-white" />
                {ratingValue.toFixed(1)}
              </Badge>
            ) : (
              <Badge className="gap-1 bg-amber-500/80 text-white shadow-sm font-black">
                <Star className="h-3.5 w-3.5 fill-white" />
                Mới
              </Badge>
            )}

            {restaurant.deliveryTime ? (
              <Badge className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 font-black">
                <Truck className="h-3.5 w-3.5" />
                Giao trong ~{restaurant.deliveryTime} phút
              </Badge>
            ) : (
              <Badge className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 font-black">
                <Truck className="h-3.5 w-3.5" />
                Giao trong ~25-35 phút
              </Badge>
            )}

            {restaurant.distance ? (
              <Badge
                variant="outline"
                className="gap-1 border-white/30 bg-black/40 text-white backdrop-blur-sm font-bold"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Khoảng cách: {restaurant.distance} km
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}