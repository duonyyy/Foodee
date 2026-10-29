"use client";

import { useNotification } from "@/components/ui/notification";
import { useCart } from "@/context/cart-context";
import { FoodPreview } from "@/interface/index";
import {
  CheckIcon,
  ImageOffIcon,
  PlusIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface FoodCardProps {
  food: FoodPreview;
  formatPrice: (price: number) => string;
}

export default function FoodCard({
  food,
  formatPrice,
}: FoodCardProps) {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const basePrice = Number(food.price) || 0;
  const discount = Number(food.discountPercent) || 0;
  const finalPrice =
    discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
  const imageSource =
    imageError || !food.image
      ? "/images/placeholder-food.jpg"
      : food.image;
  const rating = Number(food.rating) || 4.9;
  const soldCount = food.soldCount || food.purchasedNumber || 150;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!food.id) {
      console.error("Food ID is missing");
      return;
    }
    addToCart(food.id);
    setIsAdded(true);
    showNotification(`Đã thêm ${food.name} vào giỏ hàng!`, "success");
    setTimeout(() => setIsAdded(false), 900);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_12px_28px_-6px_rgba(22,163,74,0.18)] dark:border-border">
      {/* 1. Image Container & Badges */}
      <Link
        href={`/food/${food.id}`}
        className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Xem chi tiết món ${food.name}`}
      >
        <Image
          src={imageSource}
          alt={food.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          onError={() => setImageError(true)}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />

        {/* Ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity group-hover:opacity-75" />

        {/* Top Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="rounded-lg bg-primary px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-sm tracking-wide">
              GIẢM {discount}%
            </span>
          )}
          {food.popular && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-950 shadow-sm">
              🔥 Bán chạy #1
            </span>
          )}
        </div>

        {/* Bottom Pills on image: Delivery Time & Rating */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <span className="text-emerald-400">⚡</span>
            <span>{food.restaurant?.deliveryTime || "25"} phút</span>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
            <StarIcon className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-300 font-normal">
              ({soldCount}+)
            </span>
          </div>
        </div>

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="text-center text-slate-400">
              <ImageOffIcon className="mx-auto mb-1.5 h-7 w-7" />
              <p className="text-xs font-semibold">Hình ảnh đang cập nhật</p>
            </div>
          </div>
        )}
      </Link>

      {/* 2. Content & Quick Add */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div>
          {/* Verified Partner Tag */}
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-bold text-emerald-600">✓ Quán chuẩn</span>
            <span className="opacity-40">•</span>
            <span className="truncate font-medium">
              {food.restaurant?.name || "Bếp Nhà Foodee"}
            </span>
          </div>

          {/* Dish Name */}
          <h3 className="line-clamp-1 text-[15px] font-bold text-slate-900 group-hover:text-primary transition-colors">
            <Link href={`/food/${food.id}`} className="hover:underline">
              {food.name}
            </Link>
          </h3>

          {/* Description */}
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {food.description}
          </p>
        </div>

        {/* 3. Price & Quick-Add Button */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-primary">
                {formatPrice(finalPrice)}
              </span>
              {discount > 0 && (
                <span className="text-xs font-medium text-slate-400 line-through">
                  {formatPrice(basePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Circular Quick Add Button */}
          <button
            onClick={handleAddToCart}
            className={`group/btn relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
              isAdded
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105"
                : "bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/90 hover:scale-110"
            }`}
            title={`Thêm ${food.name} vào giỏ`}
            aria-label={`Thêm ${food.name} vào giỏ hàng`}
          >
            {isAdded ? (
              <CheckIcon className="h-5 w-5 stroke-[2.5]" />
            ) : (
              <PlusIcon className="h-5 w-5 stroke-[2.5] transition-transform duration-200 group-hover/btn:rotate-90" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
