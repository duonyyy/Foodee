"use client";

import Footer from "@/components/footer";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeo } from "@/context/geolocation-context";
import {
  Award,
  CreditCard,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { GuestPromotionResponse } from "@/api/guest/promotion.api";
import { PromotionType } from "@/interface";
import RestaurantCard from "./_components/restaurant-card";
import CategorySection from "./_components/ui/category";
import FoodGrid from "./_components/ui/food-grid";
import FoodRow from "./_components/ui/food-row";
import HeroSection from "./_components/ui/hero-section";
import PromotionSection from "./_components/ui/promotion";
import { useHomeData } from "./_hooks/use-home-data";

const DEFAULT_PROMOTIONS: GuestPromotionResponse[] = [
  {
    id: "promo-welcome",
    code: "FOODEENEW",
    description: "Giảm 30% tối đa 50.000đ cho đơn hàng đầu tiên từ 100.000đ khi đặt qua Foodee.",
    type: PromotionType.FOOD_DISCOUNT,
    discountPercent: 30,
    image: "/assets/hero.png",
  },
  {
    id: "promo-freeship",
    code: "FREESHIP25",
    description: "Miễn phí vận chuyển 25.000đ cho đơn từ 11h - 13h trong bán kính 5km.",
    type: PromotionType.SHIPPING_DISCOUNT,
    discountAmount: 25000,
    image: "/assets/hero.png",
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);

const goldenGuarantees = [
  {
    title: "Bảo hiểm đơn hàng 100%",
    description: "Hoàn tiền hoặc đổi món mới nếu đổ vỡ hoặc sai món",
    icon: ShieldCheck,
    badge: "An tâm tuyệt đối",
    color: "text-amber-500 bg-amber-500/10 border-amber-200/60",
  },
  {
    title: "Giao nóng trong 25 phút",
    description: "Túi nhiệt 3 lớp chuyên dụng, giữ trọn độ sốt giòn",
    icon: Zap,
    badge: "Siêu tốc độ",
    color: "text-orange-500 bg-orange-500/10 border-orange-200/60",
  },
  {
    title: "100% Quán chuẩn ATTP",
    description: "Kiểm duyệt giấy chứng nhận an toàn thực phẩm",
    icon: Award,
    badge: "Chính hãng",
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-200/60",
  },
  {
    title: "Thanh toán bảo mật đa kênh",
    description: "MoMo, VNPAY, ZaloPay, Thẻ & Tiền mặt (COD)",
    icon: CreditCard,
    badge: "Bảo mật PCI",
    color: "text-blue-500 bg-blue-500/10 border-blue-200/60",
  },
];

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

  const allSectionsFailed = Object.values(statuses).every(
    (status) => status === "error",
  );

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <div className="border-t border-border/50">
        <div className="mx-auto max-w-screen-2xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <section
            className="grid gap-4 py-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="4 Cam Kết Vàng Foodee"
          >
            {goldenGuarantees.map(({ title, description, icon: Icon, badge, color }) => (
              <div
                key={title}
                className="group relative flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
              >
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {description}
                  </p>
                  <span className="mt-2 inline-block text-[11px] font-bold text-primary">
                    ✓ {badge}
                  </span>
                </div>
              </div>
            ))}
          </section>

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
                ) : statuses.promotions === "empty" || promotions.length === 0 ? (
                  <PromotionSection promotions={DEFAULT_PROMOTIONS} />
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
