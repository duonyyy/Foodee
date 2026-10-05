"use client";

import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback-state";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { guestService } from "@/api/guest";
import { FoodDetail, FoodPreview, Topping } from "@/interface";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import FoodRow from "../../_components/ui/food-row";
import { Action } from "./_components/action";
import FoodDescription from "./_components/food-description";
import FoodImage from "./_components/food-image";
import FoodBasicInfo from "./_components/food-info";
import LoadingState from "./_components/loading";
import PriceSection from "./_components/price";
import RestaurantInfo from "./_components/restaurant-info";
import RestaurantLink from "./_components/restaurant-link";
import ReviewsSection from "./_components/review";

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const foodId = params.id as string;
  const { addToCart, addToCartWithToppings } = useCart();

  const [food, setFood] = useState<FoodDetail | null>(null);
  const [sameRestaurant, setSameRestaurant] = useState<FoodPreview[]>([]);
  const [sameCategory, setSameCategory] = useState<FoodPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);
  const [isMobileAdding, setIsMobileAdding] = useState(false);

  useEffect(() => {
    const fetchFood = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const foundFood = await guestService.food.getFoodById(foodId);
        if (foundFood) {
          setFood(foundFood);

          // Fetch related foods in parallel without blocking main render
          Promise.allSettled([
            foundFood.category?.id
              ? guestService.food.getFoodsByCategory(
                  foundFood.category.id,
                  1,
                  4
                )
              : Promise.resolve({ items: [] }),
            foundFood.restaurant?.id
              ? guestService.food.getFoodsByRestaurant(
                  foundFood.restaurant.id,
                  1,
                  4
                )
              : Promise.resolve({ items: [] }),
          ]).then(([catRes, restRes]) => {
            if (catRes.status === "fulfilled" && catRes.value?.items) {
              setSameCategory(
                catRes.value.items.filter((item: FoodPreview) => item.id !== foodId)
              );
            }
            if (restRes.status === "fulfilled" && restRes.value?.items) {
              setSameRestaurant(
                restRes.value.items.filter((item: FoodPreview) => item.id !== foodId)
              );
            }
          });
        } else {
          setFood(null);
        }
      } catch (error) {
        console.error("Error fetching food:", error);
        setFetchError("Không thể tải thông tin món ăn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (foodId) {
      fetchFood();
    }
  }, [foodId]);

  if (loading) {
    return <LoadingState />;
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <ErrorState
          title="Lỗi tải thông tin món ăn"
          description={fetchError}
          actionLabel="Tải lại trang"
          onAction={() => window.location.reload()}
          className="max-w-md bg-card shadow-lg"
        />
      </div>
    );
  }

  if (!food) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <EmptyState
          title="Không tìm thấy món ăn"
          description="Món ăn bạn đang tìm kiếm không tồn tại hoặc đã ngừng phục vụ."
          actionLabel="Khám phá món khác"
          onAction={() => router.push("/search")}
          className="max-w-md bg-card shadow-lg"
        />
      </div>
    );
  }

  // Calculate current price with discounts and selected toppings
  const basePrice = Number(food.price) || 0;
  const discount = Number(food.discountPercent) || 0;
  const unitPriceAfterDiscount =
    discount > 0 ? basePrice * (1 - discount / 100) : basePrice;

  const toppings = food.toppings || [];
  const selectedToppingsPrice = toppings
    .filter((t: Topping) => selectedToppingIds.includes(t.id))
    .reduce((sum: number, t: Topping) => sum + (Number(t.price) || 0), 0);

  const totalCalculatedPrice = (unitPriceAfterDiscount + selectedToppingsPrice) * quantity;
  const isAvailable = food.status === "available" || !food.status;

  const handleMobileAddToCart = async () => {
    if (!isAvailable || !food.id) return;
    try {
      setIsMobileAdding(true);
      if (toppings.length > 0 && selectedToppingIds.length > 0) {
        addToCartWithToppings(food, selectedToppingIds, quantity);
      } else {
        await addToCart(food.id, quantity);
      }
    } finally {
      setIsMobileAdding(false);
    }
  };

  const handleMobileBuyNow = async () => {
    if (!isAvailable || !food.id) return;
    try {
      setIsMobileAdding(true);
      if (toppings.length > 0 && selectedToppingIds.length > 0) {
        addToCartWithToppings(food, selectedToppingIds, quantity, () =>
          router.push("/checkout")
        );
      } else {
        await addToCart(food.id, quantity, () => router.push("/checkout"));
      }
    } finally {
      setIsMobileAdding(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-12%] top-[28rem] h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <main className="mx-auto max-w-screen-2xl px-4 py-6 pb-32 sm:px-6 sm:pb-16 lg:px-8 lg:py-10">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-bold text-muted-foreground shadow-xs backdrop-blur transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <Link
            href="/search"
            className="text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            Món ăn
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="max-w-[200px] truncate text-sm font-bold text-foreground sm:max-w-xs">
            {food.name}
          </span>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          {/* Cột trái: Ảnh & Badge tin cậy */}
          <div className="space-y-5">
            <FoodImage
              imageUrls={food.imageUrls || (food.image ? [food.image] : [])}
              name={food.name}
              status={food.status}
              discountPercent={food.discountPercent}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: BadgeCheck,
                  label: "Món chuẩn quán",
                  text: "Thông tin minh bạch",
                },
                {
                  icon: Truck,
                  label: "Giao tận nơi",
                  text: `${food.restaurant?.deliveryTime || "25-35"} phút`,
                },
                {
                  icon: ShieldCheck,
                  label: "Đặt an tâm",
                  text: "Giỏ hàng bảo toàn",
                },
              ].map(({ icon: Icon, label, text }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-card/75 p-4 shadow-xs backdrop-blur"
                >
                  <Icon className="mb-2.5 h-5 w-5 text-primary" />
                  <p className="text-sm font-black text-foreground">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cột phải: Thông tin & Thao tác đặt món */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-[0_24px_80px_rgb(15_23_42/0.10)] backdrop-blur sm:p-7">
              <FoodBasicInfo
                name={food.name}
                starReview={food.rating || 0}
                purchasedNumber={food.purchasedNumber || 0}
                categoryName={food.category?.name || "Ẩm thực"}
                categoryId={food.category?.id}
                totalReviews={food.reviews?.length || food.totalReviews || 0}
              />

              <div className="mt-5">
                <RestaurantInfo
                  restaurantName={food.restaurant?.name || "Nhà hàng đối tác"}
                  deliveryTime={food.restaurant?.deliveryTime}
                />
              </div>

              <div className="mt-5">
                <FoodDescription description={food.description} />
              </div>

              <div className="mt-5 space-y-4">
                <PriceSection
                  price={Number(food.price)}
                  discountPercent={food.discountPercent || 0}
                  formatPrice={formatPrice}
                />

                <Action
                  food={food}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  selectedToppingIds={selectedToppingIds}
                  onToppingsChange={setSelectedToppingIds}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface/80 p-3.5 text-xs text-muted-foreground shadow-xs backdrop-blur">
              <Clock3 className="h-4 w-4 shrink-0 text-secondary" />
              Giá và thời gian giao hàng có thể thay đổi tùy theo khoảng cách thực tế.
            </div>
          </div>
        </section>

        {/* Đánh giá & Liên kết nhà hàng */}
        <div className="mt-12 grid gap-6 xl:grid-cols-[1fr_0.86fr]">
          <ReviewsSection
            rating={food.rating || 0}
            foodId={foodId}
            previewReviews={
              food.reviews
                ? food.reviews.map((r) => ({
                    id: r.id || "",
                    userName: r.user?.name || "Ẩn danh",
                    rating: r.rating,
                    comment: r.comment,
                    date: r.createdAt
                      ? new Date(r.createdAt).toISOString()
                      : "",
                  }))
                : []
            }
          />
          {food.restaurant?.id && (
            <RestaurantLink
              restaurantId={food.restaurant.id}
              restaurantName={food.restaurant.name}
              restaurantImage={food.restaurant.avatar || food.image}
              restaurantDescription={
                food.restaurant.description ||
                `${food.restaurant.name} chuyên phục vụ các món ngon chất lượng. Thời gian giao hàng trung bình ${food.restaurant.deliveryTime || 30} phút.`
              }
            />
          )}
        </div>

        {/* Danh sách món liên quan */}
        <div className="mt-12 space-y-8">
          {sameRestaurant.length > 0 && (
            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-xs backdrop-blur sm:p-6">
              <FoodRow
                foods={sameRestaurant}
                formatPrice={formatPrice}
                name={`Món khác từ ${food.restaurant?.name || "nhà hàng này"}`}
                maxItems={4}
                viewAllLink={`/restaurant/${food.restaurant?.id}`}
              />
            </div>
          )}

          {sameCategory.length > 0 && (
            <div className="rounded-2xl border border-border/80 bg-surface/75 p-4 shadow-xs backdrop-blur sm:p-6">
              <FoodRow
                foods={sameCategory}
                formatPrice={formatPrice}
                name={`Món ${food.category?.name || ""} tương tự`}
                maxItems={4}
                viewAllLink={`/search?categories=${food.category?.id}`}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar */}
      {isAvailable && (
        <aside
          aria-label="Thanh đặt món nhanh"
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-3 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md sm:hidden"
        >
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground">
                Tổng ({quantity} món)
              </p>
              <p className="truncate text-lg font-black text-primary">
                {formatPrice(totalCalculatedPrice)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                onClick={handleMobileAddToCart}
                disabled={isMobileAdding}
                size="sm"
                className="h-11 rounded-xl bg-primary px-4 text-xs font-black text-primary-foreground shadow-md"
              >
                {isMobileAdding ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Thêm giỏ
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleMobileBuyNow}
                disabled={isMobileAdding}
                size="sm"
                className="h-11 rounded-xl bg-foreground px-4 text-xs font-black text-background shadow-md"
              >
                <Zap className="h-4 w-4 text-amber-400" />
                Mua ngay
              </Button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

