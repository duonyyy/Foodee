"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useCartDrawer } from "@/context/cart-drawer-context";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

interface FloatingCartBarProps {
  restaurantId: string;
  restaurantName?: string;
}

export function FloatingRestaurantCartBar({
  restaurantId,
  restaurantName,
}: FloatingCartBarProps) {
  const { cartItems } = useCart();
  const { openCartDrawer } = useCartDrawer();

  const { itemCount, subtotal } = useMemo(() => {
    const relevantItems = cartItems.filter(
      (item) =>
        item.restaurantId === restaurantId ||
        item.restaurant?.id === restaurantId
    );

    const count = relevantItems.reduce((acc, item) => acc + item.quantity, 0);

    const total = relevantItems.reduce((acc, item) => {
      const basePrice = Number(item.price) || 0;
      const discount = Number(item.discountPercent) || 0;
      const unitPrice =
        discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
      const toppingsPrice = (item.toppings || []).reduce(
        (tAcc, t) => tAcc + (Number(t.price) || 0),
        0
      );
      return acc + (unitPrice + toppingsPrice) * item.quantity;
    }, 0);

    return { itemCount: count, subtotal: total };
  }, [cartItems, restaurantId]);

  if (itemCount === 0) return null;

  return (
    <aside
      aria-label="Thanh giỏ hàng hiện tại"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 sm:bottom-6"
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-3 text-white shadow-[0_12px_40px_rgb(5,150,105,0.35)] backdrop-blur-md sm:p-3.5">
        {/* Left: Cart Icon & Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white shadow-inner sm:h-11 sm:w-11">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-black text-amber-950 shadow-md">
              {itemCount}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold text-white/80 sm:text-xs">
              {restaurantName ? `Giỏ hàng: ${restaurantName}` : `Giỏ hàng của quán`}
            </p>
            <p className="truncate text-base font-black text-white sm:text-lg">
              {formatPrice(subtotal)}
            </p>
          </div>
        </div>

        {/* Right: Trigger Cart Drawer CTA */}
        <Button
          type="button"
          onClick={openCartDrawer}
          className="h-10 shrink-0 gap-1.5 rounded-xl bg-white px-4 text-xs font-black text-emerald-950 shadow-md transition-all hover:bg-white/90 active:scale-95 sm:h-11 sm:px-5 sm:text-sm"
        >
          <span>Xem giỏ hàng</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
