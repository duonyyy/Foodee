"use client";

import { Banknote, Check, CreditCard, Wallet } from "lucide-react";
import Image from "next/image";

interface PaymentSectionProps {
  paymentMethod: string;
  showOnlineDropdown?: boolean;
  onPaymentMethodChange: (method: string) => void;
  onToggleDropdown?: () => void;
}

export const PaymentSection = ({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentSectionProps) => {
  const methods = [
    {
      id: "cod",
      title: "Tiền mặt khi nhận hàng (COD)",
      description: "Thanh toán trực tiếp cho shipper khi đơn hàng được giao tới nơi.",
      icon: <Banknote className="h-5 w-5 text-emerald-500" />,
      badge: "Phổ biến",
    },
    {
      id: "momo",
      title: "Ví điện tử MoMo",
      description: "Quét mã QR MoMo hoặc thanh toán qua ứng dụng di động.",
      icon: <Wallet className="h-5 w-5 text-pink-500" />,
      logo: "/assets/momo.png",
    },
    {
      id: "vnpay",
      title: "Cổng thanh toán VNPAY",
      description: "Hỗ trợ quét mã VNPAY-QR, thẻ ATM nội địa và Internet Banking.",
      icon: <CreditCard className="h-5 w-5 text-blue-500" />,
      logo: "/assets/vnpay.png",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
      <div className="flex items-center gap-2.5 border-b border-border/80 pb-3.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <CreditCard className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-black text-foreground">
            Phương thức thanh toán
          </h2>
          <p className="text-xs text-muted-foreground">
            Chọn cách thức thanh toán phù hợp và an toàn nhất với bạn
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {methods.map((method) => {
          const isSelected = paymentMethod === method.id;

          return (
            <label
              key={method.id}
              className={`relative flex min-h-[58px] cursor-pointer items-start justify-between gap-3 rounded-xl border p-3.5 transition ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                  : "border-border bg-card/60 hover:border-primary/40 hover:bg-card"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onPaymentMethodChange(method.id)}
                  className="sr-only"
                />

                <div
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 bg-background"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {method.logo ? (
                      <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded">
                        <Image
                          src={method.logo}
                          alt={method.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      method.icon
                    )}
                    <span className="text-sm font-black text-foreground">
                      {method.title}
                    </span>
                    {method.badge && (
                      <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};