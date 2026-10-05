import { RotateCcw } from "lucide-react";
import type { OrderPreview } from "./types";

interface OrderCardProps {
  order: OrderPreview;
  index: number;
  onSelect: (message: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(Number(amount)) + "đ";

export default function OrderCard({ order, index, onSelect }: OrderCardProps) {
  const summary = order.orderDetails
    .map((detail) => `${detail.quantity} ${detail.foodName}`)
    .join(", ");

  return (
    <button
      type="button"
      onClick={() => onSelect(String(index + 1))}
      className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Đặt lại đơn ${index + 1}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">Đơn #{index + 1}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {summary}
          </p>
        </div>
        <p className="shrink-0 text-sm font-extrabold text-primary">
          {formatCurrency(order.totalAmount)}
        </p>
      </div>

      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
        <RotateCcw className="h-3.5 w-3.5" />
        Đặt lại đơn này
      </span>
    </button>
  );
}
