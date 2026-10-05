"use client";

import FoodCard from "@/app/(main)/_components/food-card";
import { EmptyState } from "@/components/ui/feedback-state";
import { Input } from "@/components/ui/input";
import { FoodPreview } from "@/interface";
import {
  Flame,
  Percent,
  Search,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MenuCategoryItem, StickyCategoryNav } from "./sticky-category-nav";

interface RestaurantMenuProps {
  foods: FoodPreview[];
  formatPrice: (price: number) => string;
}

interface FoodSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  foods: FoodPreview[];
}

export function RestaurantMenu({ foods, formatPrice }: RestaurantMenuProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Search filtering
  const filteredFoods = useMemo(() => {
    if (!searchTerm.trim()) return foods;
    const term = searchTerm.toLowerCase().trim();
    return foods.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term) ||
        f.category?.name?.toLowerCase().includes(term)
    );
  }, [foods, searchTerm]);

  // Section Groups
  const sections: FoodSection[] = useMemo(() => {
    const list: FoodSection[] = [];

    // 1. Món bán chạy (soldCount > 0 or popular)
    const bestSellers = foods
      .filter((f) => (f.soldCount && f.soldCount > 0) || f.popular)
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

    if (bestSellers.length > 0) {
      list.push({
        id: "bestseller",
        name: "Món bán chạy",
        icon: <Flame className="h-4 w-4 text-amber-500" />,
        foods: bestSellers,
      });
    }

    // 2. Món đang giảm giá
    const discounted = foods.filter(
      (f) => f.discountPercent && f.discountPercent > 0
    );
    if (discounted.length > 0) {
      list.push({
        id: "discounted",
        name: "Khuyến mãi",
        icon: <Percent className="h-4 w-4 text-secondary" />,
        foods: discounted,
      });
    }

    // 3. Phân nhóm theo danh mục thực tế của nhà hàng
    const categoryMap = new Map<string, { name: string; foods: FoodPreview[] }>();
    const uncategorized: FoodPreview[] = [];

    for (const food of foods) {
      if (food.category?.id && food.category?.name) {
        if (!categoryMap.has(food.category.id)) {
          categoryMap.set(food.category.id, {
            name: food.category.name,
            foods: [],
          });
        }
        categoryMap.get(food.category.id)!.foods.push(food);
      } else {
        uncategorized.push(food);
      }
    }

    categoryMap.forEach((val, catId) => {
      list.push({
        id: `cat-${catId}`,
        name: val.name,
        icon: <UtensilsCrossed className="h-4 w-4 text-primary" />,
        foods: val.foods,
      });
    });

    if (uncategorized.length > 0) {
      list.push({
        id: "uncategorized",
        name: "Món ăn khác",
        icon: <Sparkles className="h-4 w-4 text-emerald-600" />,
        foods: uncategorized,
      });
    }

    return list;
  }, [foods]);

  // Categories list for Sticky Nav
  const navCategories: MenuCategoryItem[] = useMemo(() => {
    const items: MenuCategoryItem[] = [
      {
        id: "all",
        name: "Tất cả món",
        count: foods.length,
        icon: <UtensilsCrossed className="h-4 w-4 text-primary" />,
      },
    ];

    sections.forEach((sec) => {
      items.push({
        id: sec.id,
        name: sec.name,
        count: sec.foods.length,
        icon: sec.icon,
      });
    });

    return items;
  }, [foods.length, sections]);

  // Handle Tab Click -> Smooth scroll to section
  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);

    if (categoryId === "all") {
      const el = document.getElementById("restaurant-menu-top");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const targetEl = document.getElementById(`section-${categoryId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ScrollSpy with IntersectionObserver
  useEffect(() => {
    if (searchTerm.trim()) return; // Disable scrollspy while searching

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible section with highest intersection ratio
        const visibleEntry = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          const sectionId = visibleEntry.target.id.replace("section-", "");
          setActiveCategory(sectionId);
        }
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: [0.1, 0.5],
      }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(`section-${sec.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, searchTerm]);

  return (
    <div id="restaurant-menu-top" className="mt-8 space-y-6">
      {/* Menu Header & Quick In-Shop Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">
            Thực đơn món ăn ({foods.length})
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Chọn món yêu thích và đặt món trực tiếp từ nhà hàng
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm món trong thực đơn..."
            className="h-11 rounded-2xl border-border/80 bg-card pl-10 pr-9 text-sm shadow-xs focus-visible:ring-primary"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Sticky Category Tabs Bar */}
      {!searchTerm && (
        <StickyCategoryNav
          categories={navCategories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Search Result Mode */}
      {searchTerm.trim() ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-muted-foreground">
              Kết quả cho &ldquo;<span className="text-foreground font-black">{searchTerm}</span>&rdquo; ({filteredFoods.length} món)
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Xóa tìm kiếm
            </button>
          </div>

          {filteredFoods.length === 0 ? (
            <EmptyState
              title="Không tìm thấy món ăn"
              description={`Không có món nào trong thực đơn khớp với từ khóa "${searchTerm}".`}
              actionLabel="Xóa tìm kiếm"
              onAction={() => setSearchTerm("")}
              className="my-6 bg-card"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFoods.map((food) => (
                <div key={food.id || food.name} className="h-full">
                  <FoodCard food={food} formatPrice={formatPrice} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Normal Menu Mode: Organized by Sections with ScrollSpy anchors */
        <div className="space-y-12">
          {sections.length === 0 ? (
            <EmptyState
              title="Thực đơn đang cập nhật"
              description="Nhà hàng hiện chưa có món ăn nào trong thực đơn."
              className="my-6 bg-card"
            />
          ) : (
            sections.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-36 space-y-4"
              >
                {/* Category Section Header */}
                <div className="flex items-center gap-3 border-b border-border/80 pb-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground sm:text-xl">
                      {section.name}
                    </h3>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-black text-muted-foreground">
                    {section.foods.length} món
                  </span>
                </div>

                {/* Food Cards Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {section.foods.map((food) => (
                    <div key={food.id || food.name} className="h-full">
                      <FoodCard food={food} formatPrice={formatPrice} />
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}
    </div>
  );
}