import { Button } from "@/components/ui/button";
import { MessageSquareText, Star } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";

const ReviewModal = dynamic(() => import("./review-modal"), { ssr: false });

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  const safeRating = Number(rating) || 0;
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(safeRating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-bold text-foreground">
        {safeRating.toFixed(1)}
      </span>
    </div>
  );
};

interface ReviewsSectionProps {
  rating?: number;
  foodId: string;
  previewReviews?: {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export default function ReviewsSection({
  rating = 0,
  foodId,
  previewReviews = [],
}: ReviewsSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-lg border border-border bg-card/75 p-5 shadow-sm backdrop-blur">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-primary">
            Cảm nhận thực tế
          </p>
          <h2 className="mt-1 text-2xl font-black text-foreground">
            Đánh giá và nhận xét
          </h2>
        </div>
        <div className="rounded-full bg-yellow-100 px-3 py-1.5">
          <StarRating rating={rating} />
        </div>
      </div>

      <div className="mb-4 space-y-3">
        {previewReviews.length > 0 ? (
          previewReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-border bg-background/70 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="font-black text-foreground">
                  {review.userName}
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {review.comment}
              </p>
              <div className="mt-3 text-xs font-semibold text-muted-foreground">
                {review.date
                  ? new Date(review.date).toLocaleDateString("vi-VN")
                  : ""}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-8 text-center">
            <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="font-bold text-foreground">
              Chưa có nhận xét nào
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy là người đầu tiên chia sẻ cảm nhận về món này.
            </p>
          </div>
        )}
      </div>
      <Button
        variant="outline"
        className="h-11 w-full rounded-md bg-card font-bold"
        onClick={() => setOpen(true)}
      >
        Xem tất cả đánh giá
      </Button>
      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        foodId={foodId}
      />
    </section>
  );
}
