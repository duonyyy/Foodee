import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { FoodSuggestion } from "./types";

interface ChatFoodCardProps {
  food: FoodSuggestion;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(Number(price)) + "đ";

export default function ChatFoodCard({ food }: ChatFoodCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = imageError || !food.image ? "/images/placeholder-food.jpg" : food.image;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-28 w-full bg-slate-100">
        <Image
          src={imageSrc}
          alt={food.name}
          fill
          className="object-cover"
          sizes="320px"
          onError={() => setImageError(true)}
        />
      </div>

      <div className="space-y-3 p-3">
        <div>
          <h4 className="line-clamp-1 text-sm font-bold text-slate-900">
            {food.name}
          </h4>
          {food.restaurantName && (
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
              {food.restaurantName}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-primary">
              {formatPrice(food.price)}
            </p>
            {food.rating !== undefined && (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {food.rating.toFixed(1)}
              </p>
            )}
          </div>

          <Link
            href={food.link}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Xem món ${food.name}`}
          >
            Xem món
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
