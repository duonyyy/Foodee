"use client";

import { useEffect, useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodPreview } from "@/interface";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { userApi } from "@/api/user";
import { useAuth } from "@/context/auth-context";
import {
  Plus,
  Edit2,
  Loader2,
  Search,
  ExternalLink,
  UtensilsCrossed,
  EyeOff,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/feedback-state";
import { toast } from "sonner";

export default function FoodListPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [foods, setFoods] = useState<FoodPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "hidden">("all");

  const fetchFoods = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const fetchedFoods = await userApi.food.getFoodsByRestaurant(restaurantId);
      const formattedFoods = (fetchedFoods || []).map((food: FoodPreview) => ({
        ...food,
        price: parseFloat(food.price.toString()),
      }));
      setFoods(formattedFoods);
    } catch {
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeToken = getToken();
    if (!activeToken) {
      router.push("/unauthorized");
      return;
    }
    setToken(activeToken);
    if (!restaurantId) return;
    fetchFoods();
  }, [restaurantId]);

  const handleToggle = async (foodId: string, foodName: string, checked: boolean) => {
    const newStatus = checked ? "available" : "hidden";
    if (!token) return;
    try {
      await userApi.food.updateFoodStatus(token, foodId, newStatus);
      setFoods((prev) =>
        prev.map((food) =>
          food.id === foodId ? { ...food, status: newStatus } : food
        )
      );
      toast.success(
        checked
          ? `Đã mở bán lại món "${foodName}"`
          : `Đã tạm ẩn món "${foodName}" khỏi thực đơn`
      );
    } catch {
      toast.error("Không thể cập nhật trạng thái món lúc này");
    }
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    foods.forEach((f) => {
      if (f.category?.id && f.category?.name) {
        map.set(f.category.id, f.category.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [foods]);

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // 1. Search Query
      const matchSearch =
        !searchQuery.trim() ||
        food.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (food.description &&
          food.description.toLowerCase().includes(searchQuery.trim().toLowerCase()));

      // 2. Category
      const matchCategory =
        selectedCategory === "all" || food.category?.id === selectedCategory;

      // 3. Status
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && food.status === "available") ||
        (statusFilter === "hidden" && food.status !== "available");

      return matchSearch && matchCategory && matchStatus;
    });
  }, [foods, searchQuery, selectedCategory, statusFilter]);

  const activeCount = useMemo(
    () => foods.filter((f) => f.status === "available").length,
    [foods]
  );
  const hiddenCount = foods.length - activeCount;

  return (
    <div className="py-2 px-1 sm:px-2 max-w-6xl mx-auto space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Thực đơn món ăn"
        description="Quản lý món ăn, tùy chỉnh giá bán, bật/tắt trạng thái kinh doanh của quán"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: `/restaurant/${restaurantId}/edit/statistics` },
          { label: "Thực đơn món" },
        ]}
        actions={
          <Button
            onClick={() =>
              router.push(`/restaurant/${restaurantId}/edit/food-list/create-food`)
            }
            className="flex items-center gap-2 font-bold shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Thêm món mới</span>
          </Button>
        }
      />

      {/* 2. Top Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground">Tổng số món</p>
          <p className="text-2xl font-black text-foreground mt-1">{foods.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Đang phục vụ
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900/50 p-4 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <EyeOff className="h-3.5 w-3.5" />
            Tạm ẩn / Hết món
          </p>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{hiddenCount}</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm món theo tên hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-border"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Tất cả ({foods.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("available")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === "available"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Đang bán ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("hidden")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === "hidden"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Đã ẩn ({hiddenCount})
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-border/50 text-xs">
            <span className="font-semibold text-muted-foreground shrink-0">Danh mục:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-3 py-1 font-semibold transition shrink-0 ${
                selectedCategory === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted/70 text-muted-foreground hover:bg-accent"
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3 py-1 font-semibold transition shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-foreground text-background"
                    : "bg-muted/70 text-muted-foreground hover:bg-accent"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Food List Rendering */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold">Đang đồng bộ thực đơn của quán...</p>
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          title="Chưa có món ăn nào trong thực đơn"
          description="Hãy đăng món ăn đầu tiên để bắt đầu bán hàng và tiếp cận khách hàng trên Foodee!"
          actionLabel="Tạo món ăn mới ngay"
          onAction={() =>
            router.push(`/restaurant/${restaurantId}/edit/food-list/create-food`)
          }
        />
      ) : filteredFoods.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <UtensilsCrossed className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-bold text-foreground">Không tìm thấy món ăn phù hợp</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Không có món ăn nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setStatusFilter("all");
            }}
            className="mt-4"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredFoods.map((food) => {
            const isAvailable = food.status === "available";
            return (
              <Card
                key={food.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4.5 bg-card border transition-all duration-200 hover:border-primary/40 hover:shadow-md ${
                  !isAvailable ? "opacity-75 bg-muted/20" : ""
                }`}
              >
                {/* Food Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-muted">
                  <Image
                    src={food.image || "/images/placeholder-food.jpg"}
                    alt={food.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded">
                        Tạm ẩn
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 w-full min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base text-foreground truncate hover:text-primary transition-colors">
                          {food.name}
                        </h2>
                        {food.popular && (
                          <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            🔥 Bán chạy
                          </span>
                        )}
                      </div>

                      {/* Status Toggle */}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isAvailable ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {isAvailable ? "Đang bán" : "Đã ẩn"}
                        </span>
                        <Switch
                          checked={isAvailable}
                          onCheckedChange={(checked) =>
                            handleToggle(food.id!, food.name, checked)
                          }
                          id={`switch-${food.id}`}
                          aria-label={`Trạng thái món ${food.name}`}
                        />
                      </div>
                    </div>

                    <p className="text-muted-foreground text-xs line-clamp-2 mb-2.5">
                      {food.description || "Chưa có mô tả chi tiết."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-primary font-black text-base">
                        {food.price.toLocaleString("vi-VN")}₫
                      </span>
                      {Number(food.discountPercent) > 0 && (
                        <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-600">
                          -{food.discountPercent}%
                        </span>
                      )}
                      {food.category && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {food.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs">
                    <span className="text-muted-foreground">
                      Đã bán: <strong className="text-foreground">{food.soldCount || food.purchasedNumber || 0}</strong> suất
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/food/${food.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded"
                        title="Xem trang món của khách"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Xem món</span>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 rounded-lg flex items-center gap-1.5 font-semibold"
                        onClick={() =>
                          router.push(
                            `/restaurant/${restaurantId}/edit/food-list/update-food/${food.id}`
                          )
                        }
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Chỉnh sửa</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <Button
        onClick={() =>
          router.push(`/restaurant/${restaurantId}/edit/food-list/create-food`)
        }
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-xl p-3.5 sm:hidden bg-primary text-white"
        aria-label="Thêm món ăn mới"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </Button>
    </div>
  );
}