"use client";

import { Button } from "@/components/ui/button";
import type { FoodPreview } from "@/interface";
import {
  CameraIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { useFoodSuggestions } from "../../_hooks/use-food-suggestions";

interface HeroSearchProps {
  lat?: number;
  lng?: number;
  onOpenImageSearch: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);

export default function HeroSearch({
  lat,
  lng,
  onOpenImageSearch,
}: HeroSearchProps) {
  const router = useRouter();
  const generatedId = useId().replaceAll(":", "");
  const inputId = `hero-search-${generatedId}`;
  const listboxId = `hero-suggestions-${generatedId}`;
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isNavigating, startTransition] = useTransition();
  const { items, status, debouncedQuery, isDebouncing } =
    useFoodSuggestions(query, lat, lng);

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  const navigateToSearch = () => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || isNavigating) return;

    setIsOpen(false);
    const params = new URLSearchParams({ search: normalizedQuery });
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  const selectSuggestion = (food: FoodPreview) => {
    if (!food.id) return;
    setQuery(food.name);
    setIsOpen(false);
    startTransition(() => {
      router.push(`/food/${food.id}`);
    });
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "Enter" && activeIndex < 0) {
      event.preventDefault();
      navigateToSearch();
      return;
    }

    if (!items.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % items.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current <= 0 ? items.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(items[activeIndex]);
    }
  };

  const isLoading = status === "loading" || isDebouncing;
  const liveMessage = isLoading
    ? "Đang tìm gợi ý món ăn."
    : status === "success"
      ? `Có ${items.length} gợi ý.`
      : status === "empty"
        ? "Không tìm thấy gợi ý."
        : status === "error"
          ? "Không thể tải gợi ý."
          : "";

  return (
    <div
      className="relative mt-8 max-w-2xl"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <form
        className="flex flex-col gap-2 rounded-2xl border border-white/20 bg-card p-2 shadow-floating sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          navigateToSearch();
        }}
        role="search"
        aria-label="Tìm món ăn"
      >
        <div className="relative flex min-h-14 flex-1 items-center">
          <SearchIcon
            className="ml-4 mr-3 h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor={inputId} className="sr-only">
            Tìm món ăn
          </label>
          <input
            id={inputId}
            className="min-w-0 flex-1 bg-transparent py-3 pr-14 text-base font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
            type="search"
            placeholder="Bạn muốn ăn gì hôm nay?"
            value={query}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen && query.trim().length > 0}
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="button"
            className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tìm kiếm bằng hình ảnh"
            onClick={onOpenImageSearch}
          >
            <CameraIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <Button
          type="submit"
          size="lg"
          loading={isNavigating}
          loadingLabel="Đang mở kết quả tìm kiếm"
          disabled={!query.trim()}
          className="rounded-xl px-7 text-base font-bold"
        >
          Tìm kiếm
        </Button>
      </form>

      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>

      {isOpen && query.trim() ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={`Gợi ý cho ${query}`}
          className="absolute left-0 right-0 top-full z-30 mt-3 max-h-[min(24rem,55vh)] overflow-y-auto rounded-2xl border border-border bg-card p-2 text-foreground shadow-floating"
        >
          {isLoading ? (
            <div
              className="flex min-h-24 items-center justify-center gap-2 px-4 text-sm text-muted-foreground"
              role="status"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none" />
              Đang tìm món phù hợp…
            </div>
          ) : status === "success" ? (
            <>
              <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Gợi ý phù hợp
              </p>
              <div className="space-y-1">
                {items.map((food, index) => {
                  const discount = Number(food.discountPercent) || 0;
                  const basePrice = Number(food.price) || 0;
                  const finalPrice =
                    discount > 0
                      ? basePrice * (1 - discount / 100)
                      : basePrice;
                  return (
                    <button
                      id={`${listboxId}-option-${index}`}
                      key={food.id}
                      type="button"
                      role="option"
                      aria-selected={activeIndex === index}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectSuggestion(food)}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        activeIndex === index
                          ? "bg-accent"
                          : "hover:bg-accent/70"
                      }`}
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={
                            food.image ||
                            "/images/placeholder-food.jpg"
                          }
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-foreground">
                          {food.name}
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-3">
                          <span className="truncate text-xs text-muted-foreground">
                            {food.restaurant?.name || "Foodee"}
                          </span>
                          <span className="shrink-0 text-sm font-bold text-primary">
                            {formatPrice(finalPrice)}
                          </span>
                        </span>
                      </span>
                      <ChevronRightIcon
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={navigateToSearch}
                className="mt-2 flex min-h-11 w-full items-center justify-center rounded-xl border-t border-border px-4 text-sm font-bold text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Xem tất cả kết quả
              </button>
            </>
          ) : status === "error" ? (
            <div className="px-4 py-6 text-center">
              <p className="font-semibold text-foreground">
                Chưa thể tải gợi ý
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Bạn vẫn có thể nhấn Enter để mở trang tìm kiếm.
              </p>
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="font-semibold text-foreground">
                Không tìm thấy món phù hợp
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Thử từ khóa ngắn hơn hoặc tên món khác.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
