"use client";

import Footer from "@/components/footer";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeo } from "@/context/geolocation-context";
import {
  BadgePercent,
  MapPinned,
  Store,
  Utensils,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import RestaurantCard from "./_components/restaurant-card";
import CategorySection from "./_components/ui/category";
import FoodGrid from "./_components/ui/food-grid";
import FoodRow from "./_components/ui/food-row";
import HeroSection from "./_components/ui/hero-section";
import PromotionSection from "./_components/ui/promotion";
import { useHomeData } from "./_hooks/use-home-data";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);

const StatsSkeleton = () => (
  <section
    className="grid gap-3 border-y border-border/70 py-4 sm:grid-cols-2 lg:grid-cols-4"
    aria-label="Đang tải tổng quan"
  >
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 rounded-xl bg-card/70 px-4 py-3 shadow-control ring-1 ring-border/70"
      >
        <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </section>
);

const PromotionSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
    <Skeleton className="h-52 w-full rounded-2xl" />
    <Skeleton className="h-52 w-full rounded-2xl" />
  </div>
);

const RestaurantSkeleton = () => (
  <div className="relative min-h-[620px] w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card lg:min-h-[520px]">
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      <Skeleton className="h-[430px] w-full rounded-none lg:h-full" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-6 w-1/4 rounded-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

const FoodRowSkeleton = () => (
  <div className="flex gap-5 overflow-hidden pb-4">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="w-[280px] shrink-0 space-y-3">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    ))}
  </div>
);

const CategorySkeleton = () => (
  <div className="flex gap-3 overflow-hidden pb-4">
    {[...Array(6)].map((_, index) => (
      <div
        key={index}
        className="flex min-w-24 flex-col items-center space-y-2 rounded-xl border border-border bg-card p-4"
      >
        <Skeleton className="h-11 w-11 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    ))}
  </div>
);

const FoodGridSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {[...Array(8)].map((_, index) => (
      <div key={index} className="space-y-3">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    ))}
  </div>
);

function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="mb-6 max-w-2xl">
      <p className="type-metadata font-bold text-primary">
        {eyebrow}
      </p>
      <h2 id={id} className="type-section-title mt-2">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function Home() {
  const { location } = useGeo();
  const {
    foods,
    topSellingFoods,
    nearbyFoods,
    restaurants,
    categories,
    promotions,
    statuses,
    retry,
  } = useHomeData(location?.lat, location?.lng);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredFoods = useMemo(
    () =>
      activeCategory === "All"
        ? foods
        : foods.filter(
            (food) => food.category?.name === activeCategory,
          ),
    [activeCategory, foods],
  );

  const getFoodsByRestaurantId = useCallback(
    (restaurantId: string) => {
      const restaurant = restaurants.find(
        (item) => item.id === restaurantId,
      );
      if (restaurant?.foods?.length) return restaurant.foods;
      return foods.filter(
        (food) => food.restaurant?.id === restaurantId,
      );
    },
    [foods, restaurants],
  );

  const homeStats = useMemo(
    () => [
      {
        label: "Món sẵn sàng",
        value: foods.length,
        icon: Utensils,
      },
      {
        label: "Cửa hàng",
        value: restaurants.length,
        icon: Store,
      },
      {
        label: "Ưu đãi",
        value: promotions.length,
        icon: BadgePercent,
      },
      {
        label: "Gần bạn",
        value: nearbyFoods.length,
        icon: MapPinned,
      },
    ],
    [
      foods.length,
      nearbyFoods.length,
      promotions.length,
      restaurants.length,
    ],
  );

  const isOverviewLoading = Object.values(statuses).some(
    (status) => status === "loading" || status === "idle",
  );
  const allSectionsFailed = Object.values(statuses).every(
    (status) => status === "error",
  );

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <div className="border-t border-border/50">
        <div className="mx-auto max-w-screen-2xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          {isOverviewLoading ? (
            <StatsSkeleton />
          ) : (
            <section
              className="grid gap-3 border-y border-border/70 py-4 sm:grid-cols-2 lg:grid-cols-4"
              aria-label="Tổng quan Foodee"
            >
              {homeStats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-control ring-1 ring-border/70"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xl font-black leading-none text-foreground">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {allSectionsFailed ? (
            <ErrorState
              className="my-12"
              title="Chưa thể tải trang chủ"
              description="Các dịch vụ dữ liệu đang không phản hồi. Vui lòng thử lại sau ít phút."
              actionLabel="Tải lại dữ liệu"
              onAction={() => void retry()}
            />
          ) : (
            <>
              <section
                className="py-10"
                aria-labelledby="promotion-title"
              >
                <SectionHeading
                  eyebrow="Tiết kiệm hơn"
                  title="Ưu đãi đặc biệt"
                  id="promotion-title"
                />
                {statuses.promotions === "loading" ||
                statuses.promotions === "idle" ? (
                  <PromotionSkeleton />
                ) : statuses.promotions === "error" ? (
                  <ErrorState
                    title="Chưa thể tải ưu đãi"
                    description="Các món ăn và nhà hàng khác vẫn có thể sử dụng."
                    actionLabel="Thử lại"
                    onAction={() => void retry()}
                  />
                ) : statuses.promotions === "empty" ? (
                  <EmptyState
                    title="Chưa có ưu đãi mới"
                    description="Foodee sẽ cập nhật khuyến mãi ngay khi có."
                  />
                ) : (
                  <PromotionSection promotions={promotions} />
                )}
              </section>

              <section
                className="py-10 lg:py-12"
                aria-labelledby="restaurant-section-title"
              >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="type-metadata font-bold text-primary">
                      Nhà hàng nổi bật
                    </p>
                    <h2
                      id="restaurant-section-title"
                      className="type-section-title mt-2"
                    >
                      Cửa hàng đáng thử hôm nay
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                      Chọn nhanh quán ngon, xem món bán chạy và đặt
                      ngay trong vài thao tác.
                    </p>
                  </div>
                </div>
                {statuses.restaurants === "loading" ||
                statuses.restaurants === "idle" ? (
                  <RestaurantSkeleton />
                ) : statuses.restaurants === "error" ? (
                  <ErrorState
                    title="Chưa thể tải nhà hàng"
                    description="Bạn vẫn có thể khám phá các danh sách món ăn bên dưới."
                    actionLabel="Thử lại"
                    onAction={() => void retry()}
                  />
                ) : statuses.restaurants === "empty" ? (
                  <EmptyState
                    title="Không có nhà hàng đang hoạt động"
                    description="Hiện chưa có nhà hàng phù hợp với khu vực của bạn."
                  />
                ) : (
                  <RestaurantCard
                    restaurants={restaurants}
                    getFoods={getFoodsByRestaurantId}
                  />
                )}
              </section>

              <div className="surface-panel px-3 py-2 sm:px-5">
                {statuses.topSelling === "loading" ||
                statuses.topSelling === "idle" ? (
                  <FoodRowSkeleton />
                ) : statuses.topSelling === "error" ? (
                  <ErrorState
                    title="Chưa thể tải món bán chạy"
                    actionLabel="Thử lại"
                    onAction={() => void retry()}
                  />
                ) : statuses.topSelling === "empty" ? (
                  <EmptyState title="Chưa có dữ liệu món bán chạy" />
                ) : (
                  <FoodRow
                    foods={topSellingFoods}
                    formatPrice={formatPrice}
                    name="Món đang được gọi nhiều"
                    viewAllLink="/search?sort=most_buy"
                  />
                )}
              </div>

              <div className="surface-panel mt-8 bg-surface/75 px-3 py-2 sm:px-5">
                {statuses.nearby === "loading" ||
                statuses.nearby === "idle" ? (
                  <FoodRowSkeleton />
                ) : statuses.nearby === "error" ? (
                  <ErrorState
                    title="Chưa thể tải món gần bạn"
                    actionLabel="Thử lại"
                    onAction={() => void retry()}
                  />
                ) : statuses.nearby === "empty" ? (
                  <EmptyState title="Chưa có món phù hợp gần bạn" />
                ) : (
                  <FoodRow
                    foods={nearbyFoods}
                    formatPrice={formatPrice}
                    name="Gần vị trí của bạn"
                    viewAllLink="/search?sort=nearby"
                  />
                )}
              </div>

              <section className="mt-10">
                {statuses.categories === "loading" ||
                statuses.categories === "idle" ? (
                  <>
                    <SectionHeading
                      eyebrow="Khám phá nhanh"
                      title="Danh mục món ăn"
                    />
                    <CategorySkeleton />
                  </>
                ) : statuses.categories === "error" ? (
                  <ErrorState
                    title="Chưa thể tải danh mục"
                    actionLabel="Thử lại"
                    onAction={() => void retry()}
                  />
                ) : statuses.categories === "empty" ? (
                  <EmptyState title="Chưa có danh mục món ăn" />
                ) : (
                  <CategorySection
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                  />
                )}
              </section>

              <section className="surface-panel mt-2 p-3 sm:p-5">
                {statuses.foods === "loading" ||
                statuses.foods === "idle" ? (
                  <>
                    <SectionHeading
                      eyebrow="Tất cả lựa chọn"
                      title="Món ăn dành cho bạn"
                    />
                    <FoodGridSkeleton />
                  </>
                ) : statuses.foods === "error" ? (
                  <ErrorState
                    title="Chưa thể tải danh sách món ăn"
                    actionLabel="Thử lại"
                    onAction={() => void retry()}
                  />
                ) : filteredFoods.length === 0 ? (
                  <EmptyState
                    title="Không tìm thấy món ăn"
                    description="Danh mục này chưa có món đang phục vụ."
                  />
                ) : (
                  <FoodGrid
                    name={
                      activeCategory === "All"
                        ? "Tất cả món ăn"
                        : activeCategory
                    }
                    foods={filteredFoods}
                    formatPrice={formatPrice}
                  />
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
