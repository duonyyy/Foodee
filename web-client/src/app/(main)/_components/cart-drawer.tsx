"use client";

import { EmptyState } from "@/components/ui/feedback-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/cart-context";
import { useCartDrawer } from "@/context/cart-drawer-context";
import { Info, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import CartGroupByRestaurant from "./grouped-cart";

export default function CartDrawer() {
  const { isOpen, closeCartDrawer } = useCartDrawer();
  const { groupedCartItems, getTotalItems } = useCart();
  const router = useRouter();

  const totalItems = getTotalItems();

  const handleExploreFood = () => {
    closeCartDrawer();
    router.push("/search");
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCartDrawer();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col p-5 sm:max-w-md md:max-w-lg sm:p-6"
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg font-black text-foreground">
                  Giỏ hàng của bạn
                </SheetTitle>
                {totalItems > 0 && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-black text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </div>
              <SheetDescription className="text-xs text-muted-foreground">
                Kiểm tra món đã chọn trước khi thanh toán.
              </SheetDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCartDrawer}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Đóng giỏ hàng"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Multi-restaurant Rule Notice */}
        {groupedCartItems.length > 1 && (
          <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              Giỏ hàng có món từ <strong>{groupedCartItems.length} nhà hàng</strong>. Đơn hàng được thanh toán riêng theo từng quán để tối ưu giao nhận.
            </p>
          </div>
        )}

        {/* Cart Content */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {groupedCartItems.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="Giỏ hàng đang trống"
                description="Bạn chưa chọn món ăn nào. Khám phá hàng trăm món ngon hấp dẫn xung quanh bạn ngay!"
                actionLabel="Khám phá món ăn"
                onAction={handleExploreFood}
                className="bg-card shadow-xs"
              />
            </div>
          ) : (
            <div className="space-y-5 pb-6">
              {groupedCartItems.map((group) => (
                <CartGroupByRestaurant
                  key={group.restaurant.id || group.restaurant.name}
                  restaurant={group.restaurant}
                  items={group.items}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

