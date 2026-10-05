import { Clock, MapPin, Phone, Truck } from 'lucide-react';
import { Restaurant } from '@/interface';

interface RestaurantInfoProps {
  restaurant: Restaurant;
}

export function RestaurantInfo({ restaurant }: RestaurantInfoProps) {
  const addressText = [
    restaurant.address?.street,
    restaurant.address?.ward,
    restaurant.address?.district,
    restaurant.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 mb-6">
      <h2 className="text-lg font-black text-foreground mb-3">Thông tin nhà hàng</h2>
      {restaurant.description && (
        <p className="text-sm leading-6 text-muted-foreground mb-5">
          {restaurant.description}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/60 p-3.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">Giờ hoạt động</p>
            <p className="truncate text-sm font-black text-foreground">
              {restaurant.openTime && restaurant.closeTime
                ? `${restaurant.openTime} - ${restaurant.closeTime}`
                : "Đang mở cửa"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/60 p-3.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">Địa chỉ quán</p>
            <p className="line-clamp-2 text-sm font-bold text-foreground">
              {addressText || "Chưa cập nhật địa chỉ"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/60 p-3.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Phone className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">Hotline liên hệ</p>
            <p className="truncate text-sm font-black text-foreground">
              {restaurant.phoneNumber || "Chưa có số"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/60 p-3.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary/10 text-secondary">
            <Truck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">Thời gian giao</p>
            <p className="truncate text-sm font-black text-foreground">
              {restaurant.deliveryTime ? `~${restaurant.deliveryTime} phút` : "25-35 phút"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}