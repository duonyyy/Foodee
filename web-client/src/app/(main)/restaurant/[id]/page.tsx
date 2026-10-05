"use client";

import { guestService } from "@/api/guest";
import { userApi } from "@/api/user";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback-state";
import { useAuth } from "@/context/auth-context";
import { useGeo } from "@/context/geolocation-context";
import { useAuthModal } from "@/context/modal-context";
import { ConversationType, FoodPreview, Restaurant } from "@/interface";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FloatingRestaurantCartBar } from "./_components/floating-cart-bar";
import { RestaurantHeader } from "./_components/header";
import { RestaurantInfo } from "./_components/info";
import { RestaurantMenu } from "./_components/menu";
import { RestaurantSkeleton } from "./_components/skeleton";

export default function RestaurantPage() {
  const { id } = useParams();
  const { location } = useGeo();
  const { getToken, user } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();

  const restaurantId = id as string;

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<FoodPreview[]>([]);
  const [creatingConversation, setCreatingConversation] = useState(false);

  useEffect(() => {
    const getRestaurantData = async () => {
      if (!restaurantId) return;
      try {
        setLoading(true);
        setFetchError(null);
        const data = await guestService.restaurant.getRestaurantById(
          restaurantId,
          location?.lat,
          location?.lng
        );

        if (data) {
          setRestaurant(data);
          setFoods(data.foods || []);
        } else {
          setRestaurant(null);
        }
      } catch (error) {
        console.error("Failed to fetch restaurant data:", error);
        setFetchError("Không thể tải thông tin nhà hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    getRestaurantData();
  }, [restaurantId, location?.lat, location?.lng]);

  const handleStartConversation = async () => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để nhắn tin với nhà hàng");
      openModal("login");
      return;
    }

    const token = await getToken();
    if (!token || !restaurant) {
      toast.error("Không thể kết nối trò chuyện lúc này");
      return;
    }

    try {
      setCreatingConversation(true);
      const conversationData = {
        restaurantId: restaurant.id,
        conversationType: ConversationType.CUSTOMER_SHOP,
      };

      await userApi.messenger.createOrGetConversation(token, conversationData);
      router.push("/messenger");
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Không thể tạo cuộc trò chuyện với nhà hàng");
    } finally {
      setCreatingConversation(false);
    }
  };

  if (loading) {
    return <RestaurantSkeleton />;
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <ErrorState
          title="Lỗi tải thông tin nhà hàng"
          description={fetchError}
          actionLabel="Tải lại trang"
          onAction={() => window.location.reload()}
          className="max-w-md bg-card shadow-lg"
        />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <EmptyState
          title="Không tìm thấy nhà hàng"
          description="Nhà hàng này không tồn tại hoặc đã tạm dừng hoạt động trên hệ thống."
          actionLabel="Khám phá nhà hàng khác"
          onAction={() => router.push("/search")}
          className="max-w-md bg-card shadow-lg"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 sm:pb-36">
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
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
            Nhà hàng
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="max-w-[200px] truncate text-sm font-bold text-foreground sm:max-w-xs">
            {restaurant.name}
          </span>
        </div>

        {/* Restaurant Header Banner */}
        <RestaurantHeader restaurant={restaurant} />

        <div className="mt-6 space-y-6">
          {/* Restaurant Info Summary */}
          <RestaurantInfo restaurant={restaurant} />

          {/* Contact Actions */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Liên hệ & Đặt bàn
                </h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Trao đổi trực tiếp với quán để hỏi thông tin món ăn, yêu cầu chế biến hoặc hỗ trợ đơn hàng.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={handleStartConversation}
                  disabled={creatingConversation}
                  className="h-11 gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  {creatingConversation ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  <span>
                    {creatingConversation ? "Đang kết nối..." : "Nhắn tin với quán"}
                  </span>
                </Button>

                {restaurant.phoneNumber && (
                  <a
                    href={`tel:${restaurant.phoneNumber}`}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:bg-muted"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Gọi {restaurant.phoneNumber}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Restaurant Menu with FoodCard pattern */}
          <RestaurantMenu foods={foods} formatPrice={formatPrice} />
        </div>
      </main>

      {/* Persistent Floating Cart Bar */}
      <FloatingRestaurantCartBar
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
    </div>
  );
}