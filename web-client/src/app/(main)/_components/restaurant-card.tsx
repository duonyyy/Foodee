"use client";

import { useNotification } from "@/components/ui/notification";
import { useCart } from "@/context/cart-context";
import { FoodPreview, Restaurant } from "@/interface";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  ShoppingBag,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface RestaurantCardProps {
  restaurants: Restaurant[];
  getFoods: (restaurantId: string) => FoodPreview[];
}

const formatPrice = (price: number | string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const getFoodImage = (food: FoodPreview) =>
  food.image || food.imageUrls?.[0] || "/images/placeholder-food.jpg";

const isStoreOpen = (openTime?: string, closeTime?: string) => {
  if (!openTime || !closeTime) return null;
  try {
    const now = new Date();
    const [openHour, openMin] = openTime.split(":").map(Number);
    const [closeHour, closeMin] = closeTime.split(":").map(Number);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (closeMinutes > openMinutes) {
      return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    } else {
      return nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
    }
  } catch {
    return null;
  }
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurants,
  getFoods,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [showFoods, setShowFoods] = useState(false);

  const activeRestaurant = restaurants[activeIndex];
  const foods = activeRestaurant ? getFoods(activeRestaurant.id) : [];
  const rating = activeRestaurant?.rating;
  const isOpen = activeRestaurant
    ? isStoreOpen(
        activeRestaurant.openTime,
        activeRestaurant.closeTime,
      )
    : true;

  useEffect(() => {
    setShowFoods(false);
    const timer = setTimeout(() => setShowFoods(true), 220);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  if (!activeRestaurant) return null;

  const changeRestaurant = (
    nextIndex: number,
    nextDirection: "left" | "right",
  ) => {
    setIsChanging(true);
    setDirection(nextDirection);
    setActiveIndex(nextIndex);
    setTimeout(() => setIsChanging(false), 420);
  };

  const nextRestaurant = () => {
    changeRestaurant((activeIndex + 1) % restaurants.length, "right");
  };

  const prevRestaurant = () => {
    changeRestaurant(
      (activeIndex - 1 + restaurants.length) % restaurants.length,
      "left",
    );
  };

  const handleAddToCart = (
    e: React.MouseEvent,
    food: FoodPreview,
  ) => {
    e.stopPropagation();
    if (food.id) {
      addToCart(food.id);
      showNotification(
        `Đã thêm ${food.name} vào giỏ hàng.`,
        "success",
      );
    }
  };

  const handleBuyNow = (e: React.MouseEvent, food: FoodPreview) => {
    e.stopPropagation();
    if (!food.id) return;
    addToCart(food.id);
    router.push("/checkout");
  };

  return (
    <section className="relative w-full overflow-hidden rounded-lg border border-border/80 bg-card shadow-[0_24px_80px_rgb(15_23_42/0.10)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgb(34_197_94/0.16),transparent_32%),radial-gradient(circle_at_88%_0%,rgb(249_115_22/0.13),transparent_30%)]" />
      <div className="relative grid min-h-[620px] grid-cols-1 lg:min-h-[520px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[430px] overflow-hidden lg:min-h-full">
          <Image
            src={
              activeRestaurant.backgroundImage ||
              "/images/placeholder-food.jpg"
            }
            alt={activeRestaurant.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={`object-cover transition-all duration-700 ease-out ${
              isChanging
                ? "scale-110 opacity-60 blur-[1px]"
                : "scale-100 opacity-100"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/44 to-black/18" />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
            <div className="flex max-w-[62%] flex-wrap gap-2">
              {restaurants.map((restaurant, idx) => (
                <button
                  key={restaurant.id}
                  onClick={() =>
                    changeRestaurant(
                      idx,
                      idx > activeIndex ? "right" : "left",
                    )
                  }
                  className="group grid h-11 w-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={`Xem nhà hàng ${idx + 1}`}
                  aria-current={
                    idx === activeIndex ? "true" : undefined
                  }
                >
                  <span
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? "w-9 bg-white shadow-lg"
                        : "w-2.5 bg-white/45 group-hover:bg-white/80"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-sm font-bold text-white shadow-lg backdrop-blur-md">
              <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
              {rating != null ? rating : "Chưa có đánh giá"}
            </div>
          </div>

          {restaurants.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-3 sm:px-5">
              <button
                onClick={prevRestaurant}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/35 text-white shadow-xl backdrop-blur-md transition hover:bg-white hover:text-foreground active:scale-95"
                aria-label="Nhà hàng trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextRestaurant}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/35 text-white shadow-xl backdrop-blur-md transition hover:bg-white hover:text-foreground active:scale-95"
                aria-label="Nhà hàng tiếp theo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7 lg:p-8">
            <div
              className={`max-w-xl transition-all duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
                isChanging
                  ? `opacity-0 ${direction === "right" ? "translate-x-10" : "-translate-x-10"}`
                  : "translate-x-0 opacity-100"
              }`}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-xs font-bold uppercase text-white/90 backdrop-blur-md">
                <Flame className="h-3.5 w-3.5 text-orange-300" />
                Nhà hàng nổi bật
              </div>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                {activeRestaurant.name}
              </h2>
              {activeRestaurant.description && (
                <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                  {activeRestaurant.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2.5 text-sm font-semibold text-white">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 backdrop-blur-md ${
                    isOpen === null
                      ? "bg-white/15 text-white"
                      : isOpen
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-red-500/20 text-red-200"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOpen === null
                        ? "bg-white/70"
                        : isOpen
                          ? "bg-emerald-400 motion-safe:animate-pulse"
                          : "bg-red-400"
                    }`}
                  />
                  {isOpen === null
                    ? "Chưa cập nhật giờ hoạt động"
                    : isOpen
                      ? "Đang mở cửa"
                      : "Đã đóng cửa"}
                </span>
                {activeRestaurant.distance && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-2 backdrop-blur-md">
                    <MapPin className="h-4 w-4 text-primary-300" />
                    {activeRestaurant.distance} km
                  </span>
                )}
                {activeRestaurant.deliveryTime && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-2 backdrop-blur-md">
                    <Clock className="h-4 w-4 text-orange-200" />
                    {activeRestaurant.deliveryTime} phút
                  </span>
                )}
              </div>

              <Link
                href={`/restaurant/${activeRestaurant.id}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-extrabold text-foreground shadow-xl transition hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground sm:w-auto"
              >
                Xem cửa hàng
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col bg-card/95 p-4 backdrop-blur sm:p-6 lg:p-7">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Best sellers
              </div>
              <h2 className="text-2xl font-black text-foreground">
                Menu nổi tiếng
              </h2>
            </div>
            <Link
              href={`/restaurant/${activeRestaurant.id}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary transition hover:text-primary-700"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-stable">
            {foods.length > 0 ? (
              foods.map((food, index) => (
                <article
                  key={food.id}
                  className={`group grid grid-cols-[88px_1fr] gap-3 rounded-xl border border-border/80 bg-background/80 p-2.5 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-card motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none sm:grid-cols-[108px_1fr] ${
                    showFoods
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <Link
                    href={`/food/${food.id}`}
                    className="relative aspect-square overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Xem chi tiết món ${food.name}`}
                  >
                    <Image
                      src={getFoodImage(food)}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover transition duration-700 group-hover:scale-105 motion-reduce:transition-none"
                    />
                    {Number(food.discountPercent) > 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-black text-white shadow">
                        -{Number(food.discountPercent)}%
                      </span>
                    ) : null}
                  </Link>

                  <div className="flex min-w-0 flex-col justify-between py-1">
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-base font-extrabold leading-6 text-foreground sm:text-lg">
                          <Link
                            href={`/food/${food.id}`}
                            className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {food.name}
                          </Link>
                        </h3>
                        {food.popular && (
                          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-[11px] font-bold text-yellow-800 sm:inline-flex">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            Hot
                          </span>
                        )}
                      </div>
                      {food.description && (
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground sm:line-clamp-2">
                          {food.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-base font-black text-primary">
                        {formatPrice(food.price)}
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button
                          onClick={(e) => handleAddToCart(e, food)}
                          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-95"
                          aria-label={`Thêm ${food.name} vào giỏ`}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Thêm
                        </button>
                        <button
                          onClick={(e) => handleBuyNow(e, food)}
                          className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-3 text-xs font-bold text-background transition hover:bg-primary active:scale-95"
                          aria-label={`Mua ngay món ${food.name}`}
                        >
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/70 px-6 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Utensils className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Không có món ăn nào trong menu của nhà hàng này.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantCard;
