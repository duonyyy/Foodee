import { Clock, MapPin } from "lucide-react";

interface RestaurantInfoProps {
  restaurantName: string;
  deliveryTime?: string | number;
}

const RestaurantInfo = ({
  restaurantName,
  deliveryTime,
}: RestaurantInfoProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card/70 p-3 shadow-sm">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Nhà hàng
          </p>
          <p className="truncate text-sm font-black text-foreground">
            {restaurantName}
          </p>
        </div>
      </div>
      {deliveryTime && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card/70 p-3 shadow-sm">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary/10 text-secondary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Giao hàng
            </p>
            <p className="text-sm font-black text-foreground">
              {deliveryTime} phút
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantInfo;
