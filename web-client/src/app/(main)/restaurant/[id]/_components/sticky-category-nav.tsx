"use client";

import { useEffect, useRef } from "react";

export interface MenuCategoryItem {
  id: string;
  name: string;
  count: number;
  icon?: React.ReactNode;
}

interface StickyCategoryNavProps {
  categories: MenuCategoryItem[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function StickyCategoryNav({
  categories,
  activeCategory,
  onSelectCategory,
}: StickyCategoryNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeCategory]);

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Thanh danh mục thực đơn"
      className="sticky top-16 z-30 -mx-4 border-y border-border/80 bg-background/95 px-4 py-2.5 backdrop-blur-md shadow-xs transition-all sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 sm:top-20"
    >
      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex items-center gap-2 overflow-x-auto scroll-smooth py-0.5"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              ref={isActive ? activeTabRef : null}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-sm select-none ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "border border-border/70 bg-card text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              {cat.icon && <span className="shrink-0">{cat.icon}</span>}
              <span>{cat.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
