"use client";

import type { GuestPromotionResponse } from "@/api/guest/promotion.api";
import { useNotification } from "@/components/ui/notification";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PromotionSectionProps {
  promotions: GuestPromotionResponse[];
}

function getPromotionTypeLabel(type: string) {
  if (type === "FOOD_DISCOUNT") return "Giảm giá món ăn";
  if (type === "SHIPPING_DISCOUNT") return "Giảm phí vận chuyển";
  return "Ưu đãi Foodee";
}

export default function PromotionSection({
  promotions,
}: PromotionSectionProps) {
  const { showNotification } = useNotification();
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(
    null,
  );

  const visiblePromotions = promotions.slice(
    startIndex,
    startIndex + 2,
  );
  const canPrevious = startIndex > 0;
  const canNext = startIndex + 2 < promotions.length;

  const changePage = (nextDirection: "left" | "right") => {
    if (nextDirection === "left" && canPrevious) {
      setDirection("left");
      setStartIndex((current) => Math.max(0, current - 2));
    }
    if (nextDirection === "right" && canNext) {
      setDirection("right");
      setStartIndex((current) =>
        Math.min(promotions.length - 1, current + 2),
      );
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showNotification(`Đã sao chép mã ${code}.`, "success");
    } catch {
      showNotification(
        `Không thể sao chép tự động. Mã ưu đãi là ${code}.`,
        "warning",
      );
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p
          className="text-sm text-muted-foreground"
          aria-live="polite"
        >
          Đang xem {startIndex + 1}–
          {Math.min(startIndex + 2, promotions.length)} trong{" "}
          {promotions.length} ưu đãi
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => changePage("left")}
            disabled={!canPrevious}
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-control transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            aria-label="Xem ưu đãi trước"
          >
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => changePage("right")}
            disabled={!canNext}
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-control transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            aria-label="Xem ưu đãi tiếp theo"
          >
            <ChevronRightIcon
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {visiblePromotions.map((promotion) => (
          <article
            key={promotion.id}
            className={`relative h-56 overflow-hidden rounded-2xl border border-border bg-muted shadow-card ${
              direction === "right"
                ? "motion-safe:animate-fade-in-right"
                : ""
            } ${
              direction === "left"
                ? "motion-safe:animate-fade-in-left"
                : ""
            }`}
            onAnimationEnd={() => setDirection(null)}
          >
            <Image
              src={promotion.image || "/images/placeholder-food.jpg"}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/45 to-black/10 p-6">
              <h3 className="text-xl font-bold text-white">
                {getPromotionTypeLabel(promotion.type)}
              </h3>
              {promotion.description ? (
                <p className="mb-3 mt-1 line-clamp-2 text-sm text-white/85">
                  {promotion.description}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void copyCode(promotion.code)}
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-control transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`Sao chép mã ưu đãi ${promotion.code}`}
              >
                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                {promotion.code}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
