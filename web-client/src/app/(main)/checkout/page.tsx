"use client";

import { GuestPromotionResponse, guestService } from "@/api/guest";
import dynamic from "next/dynamic";

const MapboxSearch = dynamic(() => import("@/components/mapbox-search"), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-full animate-pulse rounded-xl border border-input bg-muted/40" />
  ),
});
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  HelpCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { AddressSection } from "./_components/address-section";
import { CartItemsSection } from "./_components/cart-item-section";
import { EmptyCart } from "./_components/emty-cart";
import { OrderNoteSection } from "./_components/order-note-section";
import { OrderSummary } from "./_components/order-summary";
import { PaymentSection } from "./_components/payment-section";
import { useCheckout } from "./_hook/checkout";

function CheckoutPageInner() {
  const [promotions, setPromotions] = useState<GuestPromotionResponse[]>([]);
  const [selectedAddressType, setSelectedAddressType] = useState<"saved" | "custom">("saved");
  const [selectedAddress, setSelectedAddress] = useState<{
    full: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);

  const {
    displayCartItems,
    initialLoading,
    userAddresses,
    selectedUserAddressId,
    paymentMethod,
    showOnlineDropdown,
    orderNote,
    setPaymentMethod,
    setShowOnlineDropdown,
    setOrderNote,
    handleSetDefaultAddress,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleOrder,
    formatPrice,
    calculation,
    calculating,
    promotionCode,
    setPromotionCode,
    isSubmitting,
  } = useCheckout({
    selectedAddressType,
    selectedAddress,
  });

  useEffect(() => {
    guestService.promotion.getActivePromotions(1, 20).then((res) => {
      setPromotions(res.items || []);
    });
  }, []);

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setShowOnlineDropdown(false);
  };

  const restaurantId = displayCartItems?.[0]?.restaurant?.id;
  const hasDeliveryAddress =
    selectedAddressType === "saved"
      ? Boolean(selectedUserAddressId)
      : Boolean(selectedAddress?.full);
  const canSubmitOrder = hasDeliveryAddress && Boolean(calculation);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.1),transparent_30%),radial-gradient(circle_at_100%_25%,hsl(var(--secondary)/0.1),transparent_28%)]">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Header */}
        <header className="mb-8 rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                <ShieldCheck className="h-4 w-4" /> Thanh toán an toàn & bảo mật
              </p>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Hoàn tất đơn hàng
              </h1>
              <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Xác nhận món ăn, vị trí nhận hàng và phương thức thanh toán trước khi gửi đơn.
              </p>
            </div>

            {restaurantId && (
              <Link
                href={`/restaurant/${restaurantId}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Quay về quán
              </Link>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-border/80 pt-3.5 text-xs font-semibold text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" /> Phí vận chuyển và thời gian giao dự kiến được tính tự động từ vị trí quán đến bạn.
          </div>
        </header>

        {initialLoading ? (
          <div
            className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center shadow-xs"
            role="status"
            aria-live="polite"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm font-bold text-foreground">Đang tải thông tin đơn hàng...</p>
          </div>
        ) : !displayCartItems || displayCartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* LEFT COLUMN: 4 Sections */}
            <div className="flex-1 flex flex-col gap-6">
              {/* 1. Cart Items */}
              <CartItemsSection
                displayCartItems={displayCartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                formatPrice={formatPrice}
              />

              {/* 2. Delivery Address */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
                <div className="flex items-center gap-2.5 border-b border-border/80 pb-3.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Địa chỉ giao hàng</h2>
                    <p className="text-xs text-muted-foreground">Chọn nơi nhận món để tính phí vận chuyển chính xác</p>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <fieldset>
                    <legend className="sr-only">Cách chọn địa chỉ giao hàng</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label
                        className={`relative flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs font-bold transition ${
                          selectedAddressType === "saved"
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                            : "border-border bg-background/60 hover:border-primary/40 hover:bg-card"
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressType"
                          value="saved"
                          checked={selectedAddressType === "saved"}
                          onChange={() => setSelectedAddressType("saved")}
                          className="sr-only"
                        />
                        <div
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                            selectedAddressType === "saved"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                        >
                          {selectedAddressType === "saved" && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-foreground">Dùng địa chỉ đã lưu</span>
                          <p className="text-[11px] font-normal text-muted-foreground">Chọn từ sổ địa chỉ tài khoản</p>
                        </div>
                      </label>

                      <label
                        className={`relative flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs font-bold transition ${
                          selectedAddressType === "custom"
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                            : "border-border bg-background/60 hover:border-primary/40 hover:bg-card"
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressType"
                          value="custom"
                          checked={selectedAddressType === "custom"}
                          onChange={() => setSelectedAddressType("custom")}
                          className="sr-only"
                        />
                        <div
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                            selectedAddressType === "custom"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                        >
                          {selectedAddressType === "custom" && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-foreground">Nhập địa chỉ mới</span>
                          <p className="text-[11px] font-normal text-muted-foreground">Tìm kiếm vị trí trên bản đồ</p>
                        </div>
                      </label>
                    </div>
                  </fieldset>

                  {selectedAddressType === "saved" && (
                    <AddressSection
                      userAddresses={userAddresses}
                      selectedUserAddressId={selectedUserAddressId}
                      onSetDefaultAddress={handleSetDefaultAddress}
                    />
                  )}

                  {selectedAddressType === "custom" && (
                    <div className="space-y-3 pt-1">
                      <MapboxSearch
                        onAddressSelect={(address) => setSelectedAddress(address)}
                        placeholder="Nhập số nhà, tên đường, phường xã để tìm kiếm..."
                      />
                      {selectedAddress?.full ? (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            <strong>Đã chọn:</strong> {selectedAddress.full}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          <HelpCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>Vui lòng chọn địa chỉ từ gợi ý bản đồ để hệ thống lấy tọa độ tính phí giao.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Payment Method */}
              <PaymentSection
                paymentMethod={paymentMethod}
                showOnlineDropdown={showOnlineDropdown}
                onPaymentMethodChange={handlePaymentMethodChange}
                onToggleDropdown={() => setShowOnlineDropdown((prev) => !prev)}
              />

              {/* 4. Order Note */}
              <OrderNoteSection
                orderNote={orderNote}
                onOrderNoteChange={setOrderNote}
              />
            </div>

            {/* RIGHT COLUMN: Sticky Order Summary */}
            <div className="w-full lg:sticky lg:top-24 lg:w-[380px] lg:self-start">
              <OrderSummary
                displayCartItems={displayCartItems}
                totalPrice={calculation?.foodTotal ?? 0}
                shippingFee={calculation?.shippingFee ?? 0}
                distance={calculation?.distance ?? 0}
                total={calculation?.total ?? 0}
                calculating={calculating}
                canSubmit={canSubmitOrder}
                isSubmitting={isSubmitting}
                onOrder={() => handleOrder(selectedAddressType, selectedAddress)}
                formatPrice={formatPrice}
                promotions={promotions}
                selectedPromotionCode={promotionCode}
                onSelectPromotion={(code) =>
                  setPromotionCode(code === "none" ? null : code)
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <CheckoutPageInner />
    </Suspense>
  );
}

