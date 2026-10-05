"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodPreview } from "@/interface";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { userApi } from "@/api/user";
import { useAuth } from "@/context/auth-context";
import { Plus, Edit2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/feedback-state";

export default function FoodListPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [foods, setFoods] = useState<FoodPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const fetchFoods = async () => {
    if (!restaurantId) return;
    setLoading(true);
    await userApi.food
      .getFoodsByRestaurant(restaurantId)
      .then((fetchedFoods) => {
        const formattedFoods = fetchedFoods.map((food: FoodPreview) => ({
          ...food,
          price: parseFloat(food.price.toString()),
        }));
        setFoods(formattedFoods);
      })
      .catch(() => setFoods([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/unauthorized");
      return;
    }
    setToken(token);
    if (!restaurantId) return;
    setLoading(true);
    fetchFoods();
  }, [restaurantId]);

  const handleToggle = async (foodId: string, checked: boolean) => {
    const newStatus = checked ? "available" : "hidden";
    if (!token) return;
    await userApi.food.updateFoodStatus(token, foodId, newStatus);
    setFoods((prev) =>
      prev.map((food) =>
        food.id === foodId ? { ...food, status: newStatus } : food
      )
    );
  };

  return (
    <div className="py-4 px-2 sm:px-4 max-w-5xl mx-auto space-y-6">
      {/* Unified Page Header */}
      <PageHeader
        title="Thực đơn món ăn"
        description="Quản lý các món ăn, giá bán và trạng thái kinh doanh của quán"
        breadcrumbs={[
          { label: "Nhà hàng", href: `/restaurant/${restaurantId}/edit` },
          { label: "Thực đơn" },
        ]}
        actions={
          <Button
            onClick={() =>
              router.push(
                `/restaurant/${restaurantId}/edit/food-list/create-food`
              )
            }
            className="flex items-center gap-2 font-semibold shadow-2xs"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Thêm món mới</span>
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Đang tải danh sách món ăn...</p>
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          title="Chưa có món ăn nào trong thực đơn"
          description="Hãy tạo món ăn đầu tiên để bắt đầu bán hàng và tiếp cận khách hàng trên Foodee!"
          actionLabel="Tạo món ăn mới"
          onAction={() =>
            router.push(
              `/restaurant/${restaurantId}/edit/food-list/create-food`
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {foods.map((food) => (
            <Card
              key={food.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-card border border-border transition-all duration-200 hover:shadow-sm"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted">
                <Image
                  src={food.image || "/images/placeholder-food.jpg"}
                  alt={food.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 w-full min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-1.5">
                    <h2 className="font-bold text-lg text-foreground truncate">
                      {food.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={
                          food.status === "available" ? "available" : "hidden"
                        }
                        size="sm"
                      />
                      <Switch
                        checked={food.status === "available"}
                        onCheckedChange={(checked) =>
                          handleToggle(food.id!, checked)
                        }
                        id={`switch-${food.id}`}
                        aria-label={`Trạng thái hiển thị món ${food.name}`}
                      />
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {food.description || "Chưa có mô tả"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-primary font-bold text-lg">
                      {food.price.toLocaleString("vi-VN")}₫
                    </span>
                    {food.category && (
                      <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                        {food.category.name}
                      </span>
                    )}
                    {food.tag && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                        {food.tag}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-4 pt-3 border-t border-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 font-medium"
                    aria-label={`Chỉnh sửa món ${food.name}`}
                    onClick={() =>
                      router.push(
                        `/restaurant/${restaurantId}/edit/food-list/update-food/${food.id}`
                      )
                    }
                  >
                    <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Chỉnh sửa</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Floating action button on mobile */}
      <Button
        onClick={() =>
          router.push(
            `/restaurant/${restaurantId}/edit/food-list/create-food`
          )
        }
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg p-3.5 sm:hidden"
        aria-label="Thêm món ăn mới"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </Button>
    </div>
  );
}