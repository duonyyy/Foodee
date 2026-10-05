"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, CheckIcon, Info, Loader2, Receipt, Tag, Truck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80";

interface OrderSummaryProps {
  displayCartItems: any[];
  totalPrice: number;
  shippingFee: number;
  distance: number;
  total: number;
  calculating: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  onOrder: () => void;
  formatPrice?: (price: number | undefined | null) => string;
  promotions?: { id: string; code: string; description?: string; minOrder?: number; discountPercent?: number }[];
  selectedPromotionCode?: string | null;
  onSelectPromotion?: (promotionCode: string) => void;
}

export const OrderSummary = ({
  displayCartItems,
  totalPrice,
  shippingFee,
  distance,
  total,
  calculating,
  canSubmit,
  isSubmitting,
  onOrder,
  formatPrice: customFormatPrice,
  promotions = [],
  selectedPromotionCode,
  onSelectPromotion,
}: OrderSummaryProps) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const formatPrice = (price: number | undefined | null): string => {
    if (customFormatPrice) return customFormatPrice(price);
    if (typeof price !== "number" || isNaN(price)) return "0 ₫";
    return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const getDiscountedPrice = (price: number, discountPercent?: number) => {
    if (!discountPercent || discountPercent <= 0) return price;
    return price - (price * discountPercent) / 100;
  };

  const itemsFoodTotal = displayCartItems.reduce((acc, item) => {
    const discounted = getDiscountedPrice(Number(item.price), item.discountPercent);
    const toppingTotal = (item.toppings || []).reduce(
      (sum: number, t: any) => sum + Number(t.price),
      0
    );
    return acc + (discounted + toppingTotal) * item.quantity;
  }, 0);

  const effectiveFoodTotal = totalPrice > 0 ? totalPrice : itemsFoodTotal;
  const calculatedDiscount = Math.max(0, effectiveFoodTotal + shippingFee - total);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2.5 border-b border-border/80 pb-3.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Receipt className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-black text-foreground">Tóm tắt đơn hàng</h2>
          <p className="text-xs text-muted-foreground">Chi tiết số tiền cần thanh toán</p>
        </div>
      </div>

      {/* Mini item list */}
      <div className="mt-3.5 max-h-56 space-y-2.5 overflow-y-auto pr-1">
        {displayCartItems.map((item) => {
          const discounted = getDiscountedPrice(Number(item.price), item.discountPercent);
          const toppingTotal = (item.toppings || []).reduce(
            (sum: number, t: any) => sum + Number(t.price),
            0
          );
          const itemTotal = (discounted + toppingTotal) * item.quantity;
          const key = item.uuid || item.id;
          const isError = imageErrors[key];
          const imgSrc = isError ? PLACEHOLDER_IMAGE : item.image || PLACEHOLDER_IMAGE;

          return (
            <div key={key} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={imgSrc}
                    alt={item.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                    onError={() => setImageErrors((prev) => ({ ...prev, [key]: true }))}
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-foreground truncate">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground">x{item.quantity}</div>
                </div>
              </div>
              <div className="font-black text-foreground shrink-0">{formatPrice(itemTotal)}</div>
            </div>
          );
        })}
      </div>

      {/* Promotion Selector */}
      <div className="mt-4 border-t border-border/80 pt-4">
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Tag className="h-3.5 w-3.5 text-primary" /> Mã khuyến mãi
          </label>
          {promotions.length > 0 ? (
            <Select
              value={selectedPromotionCode ?? "none"}
              onValueChange={(val) => onSelectPromotion?.(val)}
            >
              <SelectTrigger
                className="h-8 max-w-[180px] rounded-lg border border-border bg-background px-2.5 text-xs font-semibold"
                aria-label="Chọn mã khuyến mãi"
              >
                <SelectValue placeholder="Chọn mã ưu đãi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">
                  Không áp dụng
                </SelectItem>
                {promotions.map((promo) => (
                  <SelectItem key={promo.id} value={promo.code} className="text-xs">
                    <span className="font-bold">{promo.code}</span>
                    {promo.description ? ` - ${promo.description}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-muted-foreground">Chưa có mã ưu đãi</span>
          )}
        </div>

        {selectedPromotionCode && selectedPromotionCode !== "none" && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>
              Đã chọn mã <strong className="font-black">{selectedPromotionCode}</strong>
              {calculatedDiscount > 0
                ? ` (Giảm ${formatPrice(calculatedDiscount)})`
                : ""}
            </span>
          </div>
        )}
      </div>

      {/* Calculation breakdown */}
      <div className="mt-4 space-y-2.5 border-t border-border/80 pt-4 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Tạm tính món ({displayCartItems.length} món):</span>
          <span className="font-bold text-foreground">{formatPrice(effectiveFoodTotal)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" /> Phí vận chuyển {distance > 0 ? `(${distance} km)` : ""}:
          </span>
          <span className="font-bold text-foreground">
            {calculating ? "Đang tính..." : formatPrice(shippingFee)}
          </span>
        </div>

        {calculatedDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Giảm giá khuyến mãi:</span>
            <span className="font-black">-{formatPrice(calculatedDiscount)}</span>
          </div>
        )}

        <div className="flex items-baseline justify-between border-t border-border/80 pt-3 text-sm">
          <span className="font-black text-foreground">Tổng thanh toán:</span>
          <div className="text-right">
            <div className="text-xl font-black text-primary">
              {calculating ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Đang tính toán...
                </span>
              ) : (
                formatPrice(total)
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">Đã bao gồm VAT & phí dịch vụ</div>
          </div>
        </div>
      </div>

      {/* Order CTA */}
      <div className="mt-5">
        <Button
          type="button"
          className="h-12 w-full rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-60 disabled:pointer-events-none"
          disabled={!canSubmit || calculating || isSubmitting}
          onClick={onOrder}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo đơn hàng...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 stroke-[3]" /> Xác nhận đặt hàng
            </span>
          )}
        </Button>

        {!canSubmit && !calculating && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-amber-500" /> Vui lòng chọn địa chỉ giao hàng để tiếp tục
          </p>
        )}
      </div>
    </div>
  );
};
