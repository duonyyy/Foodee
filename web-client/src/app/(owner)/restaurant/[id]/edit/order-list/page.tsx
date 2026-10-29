"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { useOrderCreatedSubscription } from "@/hooks/use-order-subscription";
import { useAuth } from "@/context/auth-context";
import { userApi } from "@/api/user";
import { Order } from "@/interface";
import dynamic from "next/dynamic";
import {
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  History,
  Eye,
  Volume2,
  VolumeX,
  Phone,
  ChefHat,
  Bike,
  Kanban,
  LayoutGrid,
  Search,
} from "lucide-react";
import { useSubscription } from "@apollo/client";
import { ORDER_STATUS_SUBSCRIPTION } from "@/lib/graphql/subscriptions/orderSubscriptions";
import { adminService } from "@/api/admin";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KitchenKanban } from "./_components/kitchen-kanban";

const OrderDetailModal = dynamic(
  () => import("./_components/order-detail-modal").then((mod) => mod.OrderDetailModal),
  { ssr: false }
);

export default function OrderListPage() {
  const { getToken } = useAuth();
  const params = useParams();
  const restaurantId = params.id as string;
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/receive.mp3");
      audioRef.current.volume = 0.7;
    }
  }, []);

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // Fetch all orders for the restaurant
  const fetchAllOrders = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const token = getToken();
      if (token) {
        const response = await userApi.order.getOrdersByMyRestaurant(token, 1, 50);
        setAllOrders(response.items || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [restaurantId, getToken]);

  const { newOrders, clearNewOrders } = useOrderCreatedSubscription(
    restaurantId || ""
  );

  // Handle new incoming orders
  useEffect(() => {
    if (newOrders && newOrders.length > 0) {
      playNotificationSound();
      toast.info(`Có ${newOrders.length} đơn hàng mới vừa đặt!`);

      setAllOrders((prev) => {
        const existingIds = new Set(prev.map((order) => order.id));
        const uniqueNewOrders = newOrders.filter(
          (order) => !existingIds.has(order.id)
        );
        return [...uniqueNewOrders, ...prev];
      });

      clearNewOrders();
    }
  }, [newOrders, clearNewOrders]);

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrders((prev) => new Set(prev).add(orderId));
      const token = getToken();
      if (!token) throw new Error("Không có token xác thực");

      await userApi.order.updateOrderStatus(token, orderId, newStatus);

      const updateOrderInList = (orderList: Order[]) =>
        orderList.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        );

      setAllOrders(updateOrderInList);

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
        });
      }

      toast.success(
        newStatus === "confirmed"
          ? "Đã nhận đơn và chuyển cho bếp chuẩn bị!"
          : newStatus === "canceled"
          ? "Đã hủy đơn hàng"
          : "Đã cập nhật trạng thái đơn"
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Keyboard shortcut to quickly accept the oldest pending order
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.code === "Space" || e.key === "Enter") {
        const firstPending = allOrders.find((o) => o.status === "pending");
        if (firstPending && !updatingOrders.has(firstPending.id)) {
          e.preventDefault();
          handleUpdateOrderStatus(firstPending.id, "confirmed");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allOrders, updatingOrders]);

  // Status counts for tabs
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: allOrders.length,
      pending: 0,
      confirmed: 0,
      delivering: 0,
      completed: 0,
      canceled: 0,
    };
    allOrders.forEach((o) => {
      const s = o.status || "pending";
      if (res[s] !== undefined) res[s]++;
    });
    return res;
  }, [allOrders]);

  // Filter orders based on status & search query
  const filteredOrders = useMemo(() => {
    let result = allOrders;
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          order.user?.name?.toLowerCase().includes(q) ||
          order.user?.phone?.includes(q)
      );
    }
    return result;
  }, [allOrders, statusFilter, searchQuery]);

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getElapsedTimeText = (createdAt: string) => {
    try {
      const diffMin = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / 60000
      );
      if (diffMin <= 1) return "Vừa xong";
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHour = Math.floor(diffMin / 60);
      return `${diffHour} giờ trước`;
    } catch {
      return "";
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setModalLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Chưa đăng nhập");
      const freshOrderData = await adminService.Order.getOrderById(token, order.id);
      setSelectedOrder(freshOrderData as unknown as Order);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const OrderStatusSubscriber = ({ order }: { order: Order }) => {
    useSubscription(ORDER_STATUS_SUBSCRIPTION, {
      variables: { orderId: order.id },
      onData: ({ data }) => {
        if (data.data?.orderStatusUpdated) {
          const updated = data.data.orderStatusUpdated;
          const updater = (prev: Order[]) =>
            prev.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o));
          setAllOrders(updater);
        }
      },
    });
    return null;
  };

  // Incomplete orders
  const incompleteOrders = allOrders.filter(
    (order) => order.status !== "completed" && order.status !== "canceled"
  );

  return (
    <div className="py-2 px-1 sm:px-2 max-w-6xl mx-auto space-y-6">
      {/* Realtime Subscription Watchers */}
      {incompleteOrders.map((order) => (
        <OrderStatusSubscriber key={order.id} order={order} />
      ))}

      {/* 1. Header */}
      <PageHeader
        title="Quản lý Đơn hàng & Bếp"
        description="Tiếp nhận, xử lý món và theo dõi đơn hàng thời gian thực của quán"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: `/restaurant/${restaurantId}/edit/statistics` },
          { label: "Đơn hàng & Bếp" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="gap-2 font-medium"
              title={soundEnabled ? "Tắt chuông báo đơn mới" : "Bật chuông báo đơn mới"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="h-4 w-4 text-emerald-600" />
                  <span className="hidden sm:inline">Chuông: Bật</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                  <span className="hidden sm:inline">Chuông: Tắt</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAllOrders()}
              className="gap-1.5 font-medium"
            >
              <History className="h-4 w-4" />
              <span>Làm mới</span>
            </Button>
          </div>
        }
      />

      {/* 2. Controls Toolbar & Quick Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn (#XXXXXX), tên khách, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-800 dark:text-amber-400">
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-amber-500/30 text-[10px] font-mono shadow-xs">Space</kbd>
            <span>Nhận nhanh đơn mới</span>
          </div>

          <div className="flex items-center rounded-xl border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Kanban className="h-3.5 w-3.5 text-primary" />
              <span>Bếp Kanban (KDS)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Thẻ danh sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter("pending")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            statusFilter === "pending"
              ? "border-amber-500 bg-amber-500/10 shadow-sm"
              : "border-border/80 bg-card hover:bg-accent"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              Chờ xác nhận
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{counts.pending}</p>
        </div>

        <div
          onClick={() => setStatusFilter("confirmed")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            statusFilter === "confirmed"
              ? "border-blue-500 bg-blue-500/10 shadow-sm"
              : "border-border/80 bg-card hover:bg-accent"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
              Đang làm món
            </span>
            <ChefHat className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{counts.confirmed}</p>
        </div>

        <div
          onClick={() => setStatusFilter("delivering")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            statusFilter === "delivering"
              ? "border-purple-500 bg-purple-500/10 shadow-sm"
              : "border-border/80 bg-card hover:bg-accent"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
              Đang giao hàng
            </span>
            <Bike className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2">{counts.delivering}</p>
        </div>

        <div
          onClick={() => setStatusFilter("completed")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            statusFilter === "completed"
              ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
              : "border-border/80 bg-card hover:bg-accent"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Đã hoàn thành
            </span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{counts.completed}</p>
        </div>
      </div>

      {/* 4. Kanban View vs Table View */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">Đang tải danh sách đơn...</p>
        </div>
      ) : viewMode === "kanban" ? (
        <KitchenKanban
          orders={filteredOrders}
          updatingOrders={updatingOrders}
          onUpdateStatus={handleUpdateOrderStatus}
          onViewOrder={handleViewOrder}
          getElapsedTimeText={getElapsedTimeText}
        />
      ) : (
        <div className="space-y-4">
          {/* Filter Navigation Tabs for List View */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60 text-xs">
            {[
              { key: "all", label: "Tất cả", count: counts.all },
              { key: "pending", label: "Chờ xác nhận", count: counts.pending },
              { key: "confirmed", label: "Đang làm món", count: counts.confirmed },
              { key: "delivering", label: "Đang giao", count: counts.delivering },
              { key: "completed", label: "Hoàn tất", count: counts.completed },
              { key: "canceled", label: "Đã hủy", count: counts.canceled },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    statusFilter === tab.key
                      ? "bg-background/25 text-inherit"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-14 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-base font-bold text-foreground">Không có đơn hàng nào</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Không tìm thấy đơn hàng nào khớp với "${searchQuery}".`
                  : statusFilter === "all"
                  ? "Hiện tại quán chưa có đơn hàng nào."
                  : `Không có đơn hàng nào trong trạng thái "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingOrders.has(order.id);
            const isPending = order.status === "pending";
            const isConfirmed = order.status === "confirmed";
            const elapsedTime = getElapsedTimeText(order.createdAt);

            return (
              <div
                key={order.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md ${
                  isPending
                    ? "border-amber-400/80 shadow-sm ring-1 ring-amber-400/30"
                    : "border-border/80"
                }`}
              >
                {/* Order Top Bar */}
                <div>
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-foreground">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            {elapsedTime}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={order.status || "pending"} size="sm" />
                  </div>

                  {/* Customer Information */}
                  <div className="py-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{order.user?.name || "Khách hàng"}</span>
                      </div>
                      {order.user?.phone && (
                        <a
                          href={`tel:${order.user.phone}`}
                          className="flex items-center gap-1 font-bold text-primary hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{order.user.phone}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <p className="line-clamp-2">
                        {order.address
                          ? [
                              order.address.street,
                              order.address.ward,
                              order.address.district,
                              order.address.city,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : "Giao tận nơi"}
                      </p>
                    </div>

                    {order.note && (
                      <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-2.5 text-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                        <span className="font-bold">Ghi chú của khách:</span>{" "}
                        <span>{order.note}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions & Price */}
                <div className="mt-2 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Tổng tiền đơn</span>
                    <span className="text-lg font-black text-primary">
                      {(order.total || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="h-9 px-3 rounded-xl gap-1 text-xs font-semibold"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Chi tiết</span>
                    </Button>

                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}
                          className="h-9 px-4 rounded-xl gap-1.5 text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-sm"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>{isUpdating ? "Đang xử lý..." : "Nhận đơn"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateOrderStatus(order.id, "canceled")}
                          className="h-9 px-2.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}

                    {isConfirmed && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isUpdating}
                        onClick={() => handleUpdateOrderStatus(order.id, "delivering")}
                        className="h-9 px-3.5 rounded-xl gap-1.5 text-xs font-bold bg-purple-600 text-white hover:bg-purple-700"
                      >
                        <ChefHat className="h-3.5 w-3.5" />
                        <span>Báo xong món</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdateStatus={handleUpdateOrderStatus}
        isUpdating={selectedOrder ? updatingOrders.has(selectedOrder.id) : false}
        refetchOrders={fetchAllOrders}
        isLoading={modalLoading}
      />
    </div>
  );
}