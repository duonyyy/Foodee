"use client";

import { useCart } from "@/context/cart-context";
import { useCartDrawer } from "@/context/cart-drawer-context";
import { FoodPreview } from "@/interface";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Minus, Plus, Store, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80";

interface Props {
  restaurant: FoodPreview["restaurant"];
  items: {
    uuid: string;
    foodId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    discountPercent?: number;
    toppings?: {
      id: string;
      name: string;
      price: number;
    }[];
  }[];
}

export default function CartGroupByRestaurant({ restaurant, items }: Props) {
  const { updateQuantity, removeFromCart } = useCart();
  const { closeCartDrawer } = useCartDrawer();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const getDiscountedPrice = (price: number, discountPercent?: number) => {
    if (!discountPercent || discountPercent <= 0) return price;
    return price - (price * discountPercent) / 100;
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const total = items.reduce((acc, item) => {
    const basePrice = getDiscountedPrice(item.price, item.discountPercent);
    const toppingTotal =
      item.toppings?.reduce((sum, t) => sum + Number(t.price), 0) || 0;
    return acc + (basePrice + toppingTotal) * item.quantity;
  }, 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-xs transition hover:border-border/80 sm:p-5">
      {/* Restaurant Header */}
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            {restaurant.avatar ? (
              <Image
                src={restaurant.avatar}
                alt={restaurant.name}
                width={36}
                height={36}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <Store className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/restaurant/${restaurant.id}`}
              onClick={closeCartDrawer}
              className="block truncate text-sm font-black text-foreground hover:text-primary transition-colors"
              title={restaurant.name}
            >
              {restaurant.name}
            </Link>
            {restaurant.deliveryTime && (
              <p className="text-[11px] font-bold text-muted-foreground">
                Giao trong ~{restaurant.deliveryTime} phút
              </p>
            )}
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-black text-primary">
          {totalItemsCount} món
        </span>
      </div>

      {/* Item List */}
      <div className="space-y-3.5 divide-y divide-border/60">
        {items.map((item) => {
          const discountedPrice = getDiscountedPrice(
            item.price,
            item.discountPercent
          );
          const toppingTotal =
            item.toppings?.reduce((sum, t) => sum + Number(t.price), 0) || 0;
          const itemTotal = (discountedPrice + toppingTotal) * item.quantity;
          const isImgError = imageErrors[item.uuid];
          const imgSrc = isImgError
            ? PLACEHOLDER_IMAGE
            : item.image || PLACEHOLDER_IMAGE;

          return (
            <div
              key={item.uuid}
              className="relative flex gap-3 pt-3.5 first:pt-0"
            >
              {/* Item Thumbnail */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={imgSrc}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  onError={() => handleImageError(item.uuid)}
                />
              </div>

              {/* Item Details */}
              <div className="flex flex-1 flex-col justify-between min-w-0 pr-8">
                <div>
                  <Link
                    href={`/food/${item.foodId}`}
                    onClick={closeCartDrawer}
                    className="block line-clamp-1 text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>

                  {/* Pricing Breakdown */}
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                    {item.discountPercent && item.discountPercent > 0 ? (
                      <>
                        <span className="font-bold text-primary">
                          {formatPrice(discountedPrice)}
                        </span>
                        <span className="line-through text-muted-foreground text-[11px]">
                          {formatPrice(item.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-foreground">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  {/* Toppings list */}
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.toppings.map((topping) => (
                        <span
                          key={topping.id}
                          className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          +{topping.name} ({formatPrice(topping.price)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-lg border border-border bg-background shadow-2xs">
                    <button
                      type="button"
                      className="grid h-7 w-7 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
                      onClick={() =>
                        updateQuantity(item.uuid, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      aria-label={`Giảm số lượng ${item.name}`}
                    >
                      <Minus className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <span
                      className="grid h-7 min-w-7 place-items-center px-1.5 text-xs font-black text-foreground"
                      aria-label={`Số lượng ${item.name}: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="grid h-7 w-7 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
                      onClick={() =>
                        updateQuantity(item.uuid, item.quantity + 1)
                      }
                      disabled={item.quantity >= 99}
                      aria-label={`Tăng số lượng ${item.name}`}
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>

                  <span className="text-xs font-black text-foreground">
                    {formatPrice(itemTotal)}
                  </span>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item.uuid)}
                type="button"
                className="absolute right-0 top-3 first:top-0 grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                title={`Xóa ${item.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Subtotal & Checkout Action */}
      <div className="mt-4 border-t border-border/80 pt-3.5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground">
            Tạm tính quán
          </span>
          <span className="text-sm font-black text-primary">
            {formatPrice(total)}
          </span>
        </div>

        <Link
          href={`/checkout?restaurantId=${restaurant.id}`}
          onClick={closeCartDrawer}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-[0.99]"
        >
          <span>Thanh toán ({totalItemsCount} món • {formatPrice(total)})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
