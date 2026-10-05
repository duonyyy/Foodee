"use client";

import { Textarea } from "@/components/ui/textarea";
import { MessageSquareQuote } from "lucide-react";

interface OrderNoteSectionProps {
  orderNote: string;
  onOrderNoteChange: (note: string) => void;
}

export const OrderNoteSection = ({
  orderNote,
  onOrderNoteChange,
}: OrderNoteSectionProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
      <div className="flex items-center gap-2.5 border-b border-border/80 pb-3.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <MessageSquareQuote className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-black text-foreground">
            Ghi chú cho đơn hàng (tuỳ chọn)
          </h2>
          <p className="text-xs text-muted-foreground">
            Yêu cầu khẩu vị, không cay, ít đá hoặc dặn dò tài xế giao hàng
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Textarea
          id="order-note"
          className="min-h-[90px] rounded-xl border border-border bg-background/60 p-3.5 text-sm leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          rows={3}
          value={orderNote}
          onChange={(e) => onOrderNoteChange(e.target.value)}
          placeholder="Ví dụ: Lấy nhiều nước mắm, không để ớt, gọi điện trước khi đến 5 phút..."
          maxLength={250}
        />
        <div className="mt-1.5 flex justify-end text-[11px] font-medium text-muted-foreground">
          {orderNote.length}/250 ký tự
        </div>
      </div>
    </div>
  );
};