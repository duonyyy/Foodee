"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNotification } from "@/components/ui/notification";
import { useCart } from "@/context/cart-context";
import { FoodPreview } from "@/interface/index";
import {
  ClockIcon,
  ImageOffIcon,
  MapPinIcon,
  ShoppingCartIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FoodCardProps {
  food: FoodPreview;
  formatPrice: (price: number) => string;
}

export default function FoodCard({
  food,
  formatPrice,
}: FoodCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [imageError, setImageError] = useState(false);

  const basePrice = Number(food.price) || 0;
  const discount = Number(food.discountPercent) || 0;
  const finalPrice =
    discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
  const imageSource =
    imageError || !food.image
      ? "/images/placeholder-food.jpg"
      : food.image;
  const rating = Number(food.rating) || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!food.id) {
      console.error("Food ID is missing");
      return;
    }
    addToCart(food.id);
    showNotification(`Đã thêm ${food.name} vào giỏ hàng.`, "success");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!food.id) {
      console.error("Food ID is missing");
      return;
    }
    addToCart(food.id);
    router.push("/checkout");
  };

  return (
    <Card
      variant="interactive"
      className="group relative flex h-full min-h-[408px] flex-col overflow-hidden rounded-2xl border-border/80 bg-card shadow-control transition-shadow duration-300 hover:shadow-card"
    >
      <Link
        href={`/food/${food.id}`}
        className="relative h-48 flex-shrink-0 overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:h-52"
        aria-label={`Xem chi tiết món ${food.name}`}
      >
        <Image
          src={imageSource}
          alt={food.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 288px"
          onError={() => setImageError(true)}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-75 transition group-hover:opacity-90" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {discount > 0 && (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground shadow-lg">
              -{discount}%
            </span>
          )}
          {food.popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-foreground shadow-lg">
              <SparklesIcon className="h-3.5 w-3.5 text-primary" />
              Phổ biến
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
            <StarIcon className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
            {rating > 0 ? rating.toFixed(1) : "Mới"}
          </div>
        </div>

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <ImageOffIcon className="mx-auto mb-2 h-10 w-10" />
              <p className="text-xs font-semibold">
                Không có hình ảnh
              </p>
            </div>
          </div>
        )}
      </Link>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="min-h-[84px]">
          <h3 className="line-clamp-2 text-base font-black leading-6 text-foreground sm:text-lg">
            <Link
              href={`/food/${food.id}`}
              className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {food.name}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 min-h-[44px] text-sm leading-5 text-muted-foreground">
            {food.description}
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Giá món
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="text-xl font-black text-primary">
                  {formatPrice(finalPrice)}
                </span>
                {discount > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground line-through">
                    {formatPrice(basePrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-xs font-semibold text-muted-foreground">
            <p className="flex min-w-0 items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">
                {food.restaurant?.name || "Nhà hàng"}
              </span>
            </p>
            {food.restaurant?.deliveryTime && (
              <p className="flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 shrink-0 text-secondary" />
                {food.restaurant.deliveryTime} phút
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="sm"
              className="h-10 w-full rounded-lg bg-card font-bold"
              aria-label={`Thêm ${food.name} vào giỏ hàng`}
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Giỏ hàng
            </Button>
            <Button
              onClick={handleBuyNow}
              size="sm"
              className="h-10 w-full rounded-lg font-bold"
              aria-label={`Mua ngay món ${food.name}`}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
