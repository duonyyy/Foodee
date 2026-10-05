'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FoodDetail, Topping } from '@/interface';
import { formatPrice } from '@/lib/utils';
import { ImageOff, Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ToppingSelectModalProps {
  open: boolean;
  onClose: () => void;
  food: FoodDetail;
  toppings?: Topping[];
  initialQuantity?: number;
  onConfirm: (selectedToppingIds: string[], quantity?: number) => void;
}

export const ToppingSelectModal = ({
  open,
  onClose,
  food,
  toppings,
  initialQuantity = 1,
  onConfirm,
}: ToppingSelectModalProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [qty, setQty] = useState(initialQuantity);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setQty(Math.max(1, initialQuantity));
      setImgError(false);
    }
  }, [open, initialQuantity]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const rawToppings = toppings || food.toppings || [];
  const availableToppings = Array.isArray(rawToppings) ? rawToppings : [];
  const selectedToppings = availableToppings.filter((t) =>
    selectedIds.includes(t.id!)
  );
  const toppingsTotal = selectedToppings.reduce(
    (sum, t) => sum + (Number(t.price) || 0),
    0
  );

  const basePrice = Number(food.price) || 0;
  const discount = Number(food.discountPercent) || 0;
  const foodPriceAfterDiscount =
    discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
  const singleItemTotal = foodPriceAfterDiscount + toppingsTotal;
  const grandTotal = singleItemTotal * qty;

  const imageSource = imgError || !food.image ? '/images/placeholder-food.jpg' : food.image;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card p-0 shadow-2xl sm:max-w-md">
        {/* Header with Title & Close */}
        <DialogHeader className="relative border-b border-border/60 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-foreground sm:text-lg">
                  Tùy chỉnh món ăn
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Chọn topping và số lượng trước khi thêm vào giỏ
                </DialogDescription>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-border bg-background/80 text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Đóng tùy chỉnh món"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="max-h-[calc(90vh-190px)] overflow-y-auto px-5 py-4 space-y-5 sm:px-6">
          {/* Food Presentation Card */}
          <div className="flex gap-4 rounded-2xl border border-border/80 bg-muted/30 p-3.5 sm:p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted sm:h-24 sm:w-24">
              <Image
                src={imageSource}
                alt={food.name}
                fill
                className="object-cover"
                onError={() => setImgError(true)}
              />
              {imgError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                  <ImageOff className="h-6 w-6" />
                </div>
              )}
              {discount > 0 && (
                <span className="absolute left-1 top-1 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-black text-secondary-foreground shadow">
                  -{discount}%
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h3 className="line-clamp-1 text-base font-black text-foreground">
                {food.name}
              </h3>
              {food.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {food.description}
                </p>
              )}
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-black text-primary">
                  {formatPrice(foodPriceAfterDiscount)}
                </span>
                {discount > 0 && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(basePrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Toppings Checklist */}
          {availableToppings.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Chọn Topping kèm theo
                </h4>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  Tùy chọn
                </span>
              </div>

              <div className="space-y-2">
                {availableToppings.map((topping) => {
                  const isChecked = selectedIds.includes(topping.id!);
                  return (
                    <label
                      key={topping.id}
                      onClick={() => handleToggle(topping.id!)}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-all select-none ${
                        isChecked
                          ? 'border-primary bg-primary/5 text-foreground shadow-xs ring-1 ring-primary/30'
                          : 'border-border/80 bg-card hover:border-border hover:bg-muted/30 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`topping-${topping.id}`}
                          checked={isChecked}
                          onCheckedChange={() => handleToggle(topping.id!)}
                          className="h-4 w-4 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <span className="text-sm font-bold">
                          {topping.name}
                        </span>
                      </div>

                      <span
                        className={`rounded-lg px-2 py-0.5 text-xs font-black ${
                          isChecked
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        +{formatPrice(Number(topping.price) || 0)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-muted/30 p-3.5">
            <div>
              <p className="text-sm font-black text-foreground">Số lượng món</p>
              <p className="text-xs text-muted-foreground">
                Tăng hoặc giảm phần ăn này
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-xs">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={qty <= 1}
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                aria-label="Giảm số lượng"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>

              <span className="min-w-[28px] text-center text-sm font-black text-foreground">
                {qty}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={qty >= 99}
                onClick={() => setQty((prev) => Math.min(99, prev + 1))}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                aria-label="Tăng số lượng"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer with Dynamic Total & Confirm CTA */}
        <div className="border-t border-border/80 bg-card p-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground">
                Tổng cộng ({qty} phần)
              </p>
              <p className="text-xl font-black text-primary">
                {formatPrice(grandTotal)}
              </p>
            </div>

            <Button
              type="button"
              onClick={() => onConfirm(selectedIds, qty)}
              className="h-11 flex-1 gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Thêm vào giỏ hàng</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
