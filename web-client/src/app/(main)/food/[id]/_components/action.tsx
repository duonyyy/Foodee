"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/context/cart-context";
import { FoodDetail, FoodPreview, Topping } from "@/interface";
import {
  AlertTriangle,
  Check,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface ActionProps {
  food: FoodDetail | FoodPreview;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  selectedToppingIds?: string[];
  onToppingsChange?: (ids: string[]) => void;
}

export const Action: React.FC<ActionProps> = ({
  food,
  quantity,
  onQuantityChange,
  selectedToppingIds: externalSelectedToppingIds,
  onToppingsChange: externalOnToppingsChange,
}) => {
  const { addToCart, addToCartWithToppings } = useCart();
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [internalToppingIds, setInternalToppingIds] = useState<string[]>([]);

  const selectedToppingIds =
    externalSelectedToppingIds ?? internalToppingIds;
  const setSelectedToppingIds =
    externalOnToppingsChange ?? setInternalToppingIds;

  const isAvailable = food.status === "available" || !food.status;
  const isUnavailable = food.status === "unavailable";
  const isPending = food.status === "pending";

  const toppings = (food as FoodDetail).toppings || [];

  const handleToggleTopping = (toppingId: string) => {
    setSelectedToppingIds(
      selectedToppingIds.includes(toppingId)
        ? selectedToppingIds.filter((id) => id !== toppingId)
        : [...selectedToppingIds, toppingId]
    );
  };

  const handleAddToCart = async () => {
    if (!isAvailable) {
      toast.error("Món ăn này hiện không có sẵn để đặt");
      return;
    }

    if (!food.id) {
      toast.error("Thông tin món ăn không hợp lệ");
      return;
    }

    try {
      setIsAddingToCart(true);

      if (toppings.length > 0 && selectedToppingIds.length > 0) {
        addToCartWithToppings(
          food as FoodDetail,
          selectedToppingIds,
          quantity
        );
      } else {
        await addToCart(food.id, quantity);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAvailable) {
      toast.error("Món ăn này hiện không có sẵn");
      return;
    }

    if (!food.id) {
      toast.error("Thông tin món ăn không hợp lệ");
      return;
    }

    try {
      setIsAddingToCart(true);

      if (toppings.length > 0 && selectedToppingIds.length > 0) {
        addToCartWithToppings(
          food as FoodDetail,
          selectedToppingIds,
          quantity,
          () => router.push("/checkout")
        );
      } else {
        await addToCart(food.id, quantity, () => router.push("/checkout"));
      }
    } catch (error) {
      console.error("Error in buy now:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";

      if (navigator.share) {
        await navigator.share({
          title: food.name,
          text: `Xem món ngon ${food.name} trên Foodee`,
          url: currentUrl,
        });
        toast.success("Đã chia sẻ thành công!");
      } else {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("Đã sao chép liên kết món ăn vào clipboard!");
      }
    } catch {
      toast.error("Không thể chia sẻ. Vui lòng thử lại.");
    } finally {
      setTimeout(() => setIsSharing(false), 1200);
    }
  };

  const formatToppingPrice = (price: number | string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price) || 0);
  };

  return (
    <div className="space-y-4">
      {/* Trạng thái không khả dụng */}
      {isUnavailable && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm font-bold">
            Món ăn hiện tạm hết hàng. Quý khách vui lòng chọn món khác.
          </div>
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm font-bold">
            Món ăn đang chờ phê duyệt từ ban quản trị.
          </div>
        </div>
      )}

      {/* Topping list nếu có */}
      {isAvailable && toppings.length > 0 && (
        <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Topping tùy chọn
            </h3>
            <span className="text-xs text-muted-foreground">
              (Chọn nhiều)
            </span>
          </div>

          <div className="space-y-2.5">
            {toppings.map((topping: Topping) => {
              const isChecked = selectedToppingIds.includes(topping.id);
              const toppingPrice = Number(topping.price) || 0;

              return (
                <label
                  key={topping.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 transition ${
                    isChecked
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/70 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleToggleTopping(topping.id)}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {topping.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    +{formatToppingPrice(toppingPrice)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Số lượng */}
      {isAvailable && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-3 shadow-sm">
          <div>
            <span className="text-sm font-bold text-foreground">
              Số lượng
            </span>
            <p className="text-xs text-muted-foreground">
              Tối đa 99 phần mỗi lượt đặt
            </p>
          </div>

          <div className="flex items-center overflow-hidden rounded-lg border border-border bg-background shadow-xs">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="grid h-11 w-11 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
              disabled={quantity <= 1}
              aria-label="Giảm số lượng"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="grid h-11 min-w-12 place-items-center border-x border-border px-2 text-sm font-black">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => onQuantityChange(Math.min(99, quantity + 1))}
              className="grid h-11 w-11 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
              disabled={quantity >= 99}
              aria-label="Tăng số lượng"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        {isAvailable ? (
          <>
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="h-12 rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              {isAddingToCart ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Thêm vào giỏ ({quantity})
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleBuyNow}
              disabled={isAddingToCart}
              className="h-12 rounded-xl bg-foreground text-sm font-black text-background shadow-lg transition hover:-translate-y-0.5 hover:bg-foreground/90"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              Mua ngay
            </Button>
          </>
        ) : (
          <div className="sm:col-span-2">
            <Button
              disabled
              className="h-12 w-full cursor-not-allowed rounded-xl bg-muted text-muted-foreground"
            >
              <AlertTriangle className="h-4 w-4" />
              {isUnavailable ? "Tạm hết hàng" : "Chưa khả dụng"}
            </Button>
          </div>
        )}
      </div>

      {/* Share action */}
      <div className="border-t border-border/80 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 w-full rounded-lg bg-card/80 font-bold transition hover:bg-muted"
          onClick={handleShare}
          disabled={isSharing}
        >
          {isSharing ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600">Đã sao chép liên kết!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Chia sẻ món ăn
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

