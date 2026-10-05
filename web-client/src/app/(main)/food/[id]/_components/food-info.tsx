import { Flame, MessageSquare, Star } from "lucide-react";
import Link from "next/link";

interface FoodBasicInfoProps {
  name: string;
  starReview: number;
  purchasedNumber: number;
  categoryName: string;
  categoryId?: string;
  totalReviews?: number;
}

const FoodBasicInfo = ({
  name,
  starReview,
  purchasedNumber,
  categoryName,
  categoryId,
  totalReviews,
}: FoodBasicInfoProps) => {
  const ratingValue = Number(starReview || 0);

  return (
    <div className="space-y-3">
      <div>
        {categoryId ? (
          <Link
            href={`/search?categories=${categoryId}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black uppercase text-primary transition hover:bg-primary/20"
          >
            <Flame className="h-3.5 w-3.5" />
            {categoryName}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black uppercase text-primary">
            <Flame className="h-3.5 w-3.5" />
            {categoryName}
          </span>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-600 dark:text-amber-400">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{ratingValue > 0 ? ratingValue.toFixed(1) : "Mới"}</span>
          </div>

          {typeof totalReviews === "number" && totalReviews > 0 ? (
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {totalReviews} đánh giá
            </div>
          ) : null}

          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            {purchasedNumber > 0 ? `${purchasedNumber}+ đã bán` : "Món mới"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodBasicInfo;

