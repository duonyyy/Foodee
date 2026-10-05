"use client";

import { Button } from "@/components/ui/button";
import { Category } from "@/interface";
import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

interface CategorySectionProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function CategorySection({
  categories,
  activeCategory,
  setActiveCategory,
}: CategorySectionProps) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const allCategories = [
    "All",
    ...categories.map((item) => item.name),
  ];

  const selectByIndex = (index: number) => {
    const normalizedIndex =
      (index + allCategories.length) % allCategories.length;
    setActiveCategory(allCategories[normalizedIndex]);
    itemRefs.current[normalizedIndex]?.focus();
    itemRefs.current[normalizedIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectByIndex(index + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectByIndex(index - 1);
    }
  };

  return (
    <section className="py-7 sm:py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="type-metadata font-bold text-primary">
            Khám phá nhanh
          </p>
          <h2 className="type-section-title mt-2">Danh mục món ăn</h2>
        </div>
        <Button variant="ghost" asChild className="text-primary">
          <Link href="/search">
            Xem tất cả <ChevronRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3"
        aria-label="Chọn danh mục món ăn"
      >
        <button
          ref={(node) => {
            itemRefs.current[0] = node;
          }}
          onClick={() => setActiveCategory("All")}
          onKeyDown={(event) => handleKeyDown(event, 0)}
          aria-pressed={activeCategory === "All"}
          className={`flex h-16 min-w-fit snap-start items-center gap-2 rounded-xl border px-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            activeCategory === "All"
              ? "border-primary bg-primary text-primary-foreground shadow-control"
              : "border-border/80 bg-card text-foreground hover:border-primary/40 hover:bg-accent"
          }`}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-background/60 text-base">
            🍽️
          </span>
          <span className="whitespace-nowrap text-sm font-bold">Tất cả</span>
        </button>

        {categories.map((category, index) => (
          <button
            key={category.id}
            ref={(node) => {
              itemRefs.current[index + 1] = node;
            }}
            onClick={() => setActiveCategory(category.name)}
            onKeyDown={(event) => handleKeyDown(event, index + 1)}
            aria-pressed={activeCategory === category.name}
            className={`flex h-16 min-w-fit snap-start items-center gap-2 rounded-xl border px-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeCategory === category.name
                ? "border-primary bg-primary text-primary-foreground shadow-control"
                : "border-border/80 bg-card text-foreground hover:border-primary/40 hover:bg-accent"
            }`}
          >
            <Image
              src={category.image || "/images/placeholder-food.jpg"}
              alt=""
              width={44}
              height={44}
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="whitespace-nowrap text-sm font-bold">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
