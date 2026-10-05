import { Button } from "@/components/ui/button";
import { FoodPreview } from "@/interface";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import FoodCard from "../food-card";

interface FoodRowProps {
  foods: FoodPreview[];
  formatPrice: (price: number) => string;
  name: string;
  maxItems?: number;
  viewAllLink?: string;
}

export default function FoodRow({
  foods,
  formatPrice,
  name,
  maxItems = 4,
  viewAllLink,
}: FoodRowProps) {
  const displayFoods = foods.slice(0, maxItems);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollControls = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 4);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth <
        container.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    updateScrollControls();
    window.addEventListener("resize", updateScrollControls);
    return () =>
      window.removeEventListener("resize", updateScrollControls);
  }, [displayFoods.length, updateScrollControls]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-7 sm:py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="type-metadata font-bold text-primary">
            Gợi ý hôm nay
          </p>
          <h2 className="type-section-title mt-2">
            {name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll controls */}
          <div className="hidden md:flex gap-2">
            <Button
              onClick={scrollLeft}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg bg-card"
              aria-label="Cuộn danh sách sang trái"
              disabled={!canScrollLeft}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            <Button
              onClick={scrollRight}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg bg-card"
              aria-label="Cuộn danh sách sang phải"
              disabled={!canScrollRight}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </div>

          {viewAllLink && foods.length > maxItems && (
            <Button variant="ghost" asChild className="text-primary">
              <Link href={viewAllLink}>
                Xem tất cả{" "}
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        {foods.length > 0 ? (
          <div
            ref={scrollContainerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scroll-smooth"
            onScroll={updateScrollControls}
            aria-label={name}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {displayFoods.map((food) => (
              <div
                key={food.id}
                className="w-[272px] shrink-0 snap-start"
              >
                <FoodCard food={food} formatPrice={formatPrice} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-base text-muted-foreground">
              Chưa có món ăn trong danh mục này.
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-4 left-0 top-0 w-6 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute bottom-4 right-0 top-0 w-6 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
