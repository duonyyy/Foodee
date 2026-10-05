"use client";

import { userApi } from "@/api/user";
import dynamic from "next/dynamic";
import StatCard from "@/components/ui/chart/stat-card";

const BarChart = dynamic(() => import("@/components/ui/chart/bar-chart"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-muted/40" />,
});

const LineChart = dynamic(() => import("@/components/ui/chart/line-chart"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-muted/40" />,
});
import { EmptyState } from "@/components/ui/feedback-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import {
  Calendar,
  CircleDollarSign,
  ShoppingBag,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface TopFood {
  id: string;
  name: string;
  image: string;
  soldCount: number;
  revenue: number;
}

function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthOptions() {
  const now = new Date();
  const year = now.getFullYear();
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const m = (i + 1).toString().padStart(2, "0");
    months.push(`${year}-${m}`);
  }
  return months.reverse();
}

export default function StatisticsPage() {
  const params = useParams();
  const restaurantId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;
  const { getToken } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    getCurrentMonthString(),
  );
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [topFoods, setTopFoods] = useState<TopFood[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [orderData, setOrderData] = useState<number[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);

    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Use Promise.allSettled for maximum resilience against partial API downtime
    Promise.allSettled([
      userApi.restaurant.getOrderCountByMonth(token, selectedMonth),
      userApi.restaurant.getRevenueByMonth(token, selectedMonth),
      userApi.restaurant.getTopFoods(restaurantId),
      userApi.restaurant.getMyChartData(token),
    ])
      .then(([orderRes, revRes, topRes, chartRes]) => {
        if (orderRes.status === "fulfilled") {
          setOrderCount(orderRes.value || 0);
        }

        if (revRes.status === "fulfilled") {
          setRevenue(revRes.value || 0);
        }

        if (
          topRes.status === "fulfilled" &&
          Array.isArray(topRes.value)
        ) {
          const mappedTopFoods: TopFood[] = topRes.value.map(
            (food) => {
              const soldCount = Number(food.soldCount) || 0;
              const price = Number(food.price) || 0;
              const discountPercent =
                Number(food.discountPercent) || 0;
              const finalPrice =
                discountPercent > 0
                  ? price * (1 - discountPercent / 100)
                  : price;
              return {
                id: food.id || "",
                name: food.name || "",
                image: food.image || "/images/placeholder-food.jpg",
                soldCount: soldCount,
                revenue: soldCount * finalPrice,
              };
            },
          );
          setTopFoods(mappedTopFoods);
        }

        if (chartRes.status === "fulfilled" && chartRes.value) {
          const cData = chartRes.value;
          if (Array.isArray(cData.days)) {
            setChartLabels(cData.days);
          }
          if (Array.isArray(cData.orderCounts)) {
            setOrderData(cData.orderCounts);
          }
          if (Array.isArray(cData.revenues)) {
            setRevenueData(cData.revenues);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load statistics:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [restaurantId, selectedMonth, getToken]);

  const monthLabel = `Tháng ${Number(selectedMonth.slice(5))}/${selectedMonth.slice(0, 4)}`;

  return (
    <div className="max-w-6xl mx-auto py-8 px-3 sm:px-6 space-y-8">
      {/* Unified Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Báo cáo & Thống kê"
          description={`Theo dõi doanh thu, sản lượng đơn và các món bán chạy nhất (${monthLabel})`}
          breadcrumbs={[
            {
              label: "Quản lý nhà hàng",
              href: `/restaurant/${restaurantId}/edit`,
            },
            { label: "Báo cáo thống kê" },
          ]}
        />

        {/* Time Period Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger
              className="w-[180px] h-10 rounded-xl bg-card"
              aria-label="Chọn kỳ báo cáo tháng"
            >
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((m) => (
                <SelectItem key={m} value={m}>
                  {`Tháng ${Number(m.slice(5))} - ${m.slice(0, 4)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3 Unified Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Đơn hàng hoàn tất"
          value={
            loading
              ? "--"
              : `${orderCount.toLocaleString("vi-VN")} đơn`
          }
          periodLabel={`trong ${monthLabel}`}
          icon={<ShoppingBag className="w-5 h-5" />}
          isLoading={loading}
        />

        <StatCard
          title="Tổng doanh thu"
          value={
            loading
              ? "--"
              : revenue.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
          }
          periodLabel={`trong ${monthLabel}`}
          icon={
            <CircleDollarSign className="w-5 h-5 text-emerald-600" />
          }
          isLoading={loading}
        />

        <StatCard
          title="Món bán chạy nhất"
          value={
            loading ? "--" : topFoods[0]?.name || "Chưa có dữ liệu"
          }
          previousValue={
            topFoods[0]
              ? `Đã bán: ${topFoods[0].soldCount} phần`
              : undefined
          }
          periodLabel={`trong ${monthLabel}`}
          icon={<Trophy className="w-5 h-5 text-amber-500" />}
          isLoading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h3 className="font-bold text-foreground text-sm sm:text-base">
              Lượng đơn theo thời gian
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              Đơn vị: đơn
            </span>
          </div>
          <LineChart
            data={orderData}
            labels={chartLabels}
            label="Đơn hàng"
            unit="đơn"
            color="#2563EB"
            fillColor="rgba(37, 99, 235, 0.1)"
            emptyMessage="Chưa có dữ liệu đơn hàng trong tháng này."
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h3 className="font-bold text-foreground text-sm sm:text-base">
              Doanh thu theo thời gian
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              Đơn vị: VNĐ
            </span>
          </div>
          <BarChart
            data={revenueData}
            labels={chartLabels}
            label="Doanh thu"
            unit="đ"
            backgroundColor="#059669"
            emptyMessage="Chưa có dữ liệu doanh thu trong tháng này."
          />
        </div>
      </div>

      {/* Top Selling Foods List */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <UtensilsCrossed className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            Top các món ăn bán chạy
          </h2>
        </div>

        {topFoods.length === 0 && !loading ? (
          <EmptyState
            title="Chưa có món ăn bán ra"
            description="Dữ liệu các món bán chạy sẽ được cập nhật khi các đơn hàng hoàn tất."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {topFoods.map((food, index) => (
              <div
                key={food.id || index}
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                  <Image
                    src={food.image}
                    alt={food.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      #{index + 1}
                    </span>
                    <h4 className="font-semibold text-foreground text-sm truncate">
                      {food.name}
                    </h4>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>
                      Đã bán:{" "}
                      <strong className="text-foreground">
                        {food.soldCount}
                      </strong>
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {food.revenue.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
