"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80";

interface Topping {
  id: string;
  name: string;
  price: number;
}

interface CartItemDisplay {
  uuid: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  discountPercent?: number;
  restaurant?: { name: string };
  toppings?: Topping[];
}

interface CartItemsSectionProps {
  displayCartItems: CartItemDisplay[];
  onUpdateQuantity: (uuid: string, qty: number) => void;
  onRemoveFromCart: (uuid: string) => void;
  formatPrice: (price: number) => string;
}

export const CartItemsSection = ({
  displayCartItems,
  onUpdateQuantity,
  onRemoveFromCart,
  formatPrice,
}: CartItemsSectionProps) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (uuid: string) => {
    setImageErrors((prev) => ({ ...prev, [uuid]: true }));
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount || discount <= 0) return price;
    return price - (price * discount) / 100;
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
      <div className="flex items-center gap-2.5 border-b border-border/80 pb-3.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <ShoppingBag className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-black text-foreground">
            Món ăn đã chọn ({displayCartItems.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Kiểm tra và điều chỉnh số lượng trước khi đặt
          </p>
        </div>
      </div>

      <div className="mt-3.5 divide-y divide-border/60">
        {displayCartItems.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            Giỏ hàng của bạn đang trống.
          </div>
        ) : (
          displayCartItems.map((item) => {
            const discountedPrice = getDiscountedPrice(item.price, item.discountPercent);
            const toppingTotal =
              item.toppings?.reduce((sum, t) => sum + Number(t.price), 0) || 0;
            const itemTotal = (discountedPrice + toppingTotal) * item.quantity;
            const isError = imageErrors[item.uuid];
            const imgSrc = isError
              ? PLACEHOLDER_IMAGE
              : item.image || PLACEHOLDER_IMAGE;

            return (
              <div key={item.uuid} className="flex items-start gap-3.5 py-4 first:pt-2 last:pb-0">
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

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-black text-sm text-foreground line-clamp-1">
                    {item.name}
                  </div>
                  {item.restaurant?.name && (
                    <div className="text-xs font-semibold text-muted-foreground">
                      {item.restaurant.name}
                    </div>
                  )}

                  <div className="text-xs flex items-center gap-1.5 pt-0.5">
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

                  {/* Topping list */}
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.toppings.map((topping: any) => (
                        <span
                          key={topping.id}
                          className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          +{topping.name} ({formatPrice(Number(topping.price))})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="inline-flex items-center rounded-lg border border-border bg-background shadow-2xs">
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
                        onClick={() => onUpdateQuantity(item.uuid, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        aria-label={`Giảm số lượng ${item.name}`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="grid h-7 min-w-7 place-items-center px-1.5 text-xs font-black text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
                        onClick={() => onUpdateQuantity(item.uuid, Math.min(99, item.quantity + 1))}
                        disabled={item.quantity >= 99}
                        aria-label={`Tăng số lượng ${item.name}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onRemoveFromCart(item.uuid)}
                      aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                      title={`Xóa ${item.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm font-black text-foreground text-right shrink-0">
                  {formatPrice(itemTotal)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
