"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const RECENT_ORDERS = [
  {
    customer: "Chị Minh Trang (Quận 1)",
    item: "1 suất Phở bò tái lăn Hà Nội",
    time: "2 phút trước",
    image: "http://localhost:9000/foodee/food-images/pho-bo-tai-lan.jpg",
  },
  {
    customer: "Anh Tuấn Kiệt (Bình Thạnh)",
    item: "1 Bánh mì chảo đặc biệt",
    time: "4 phút trước",
    image: "http://localhost:9000/foodee/food-images/banh-mi-chao.jpg",
  },
  {
    customer: "Bạn Thuỳ Dung (Quận 3)",
    item: "2 ly Trà sen vàng củ năng",
    time: "1 phút trước",
    image: "http://localhost:9000/foodee/food-images/tra-sen.jpg",
  },
  {
    customer: "Anh Quốc Bảo (Thủ Đức)",
    item: "1 mẹt Bún đậu mắm tôm đặc sản",
    time: "5 phút trước",
    image: "http://localhost:9000/foodee/food-images/bun-dau-mam-tom.jpg",
  },
  {
    customer: "Chị Ngọc Mai (Quận 7)",
    item: "1 đĩa Cơm tấm sườn bì chả trứng",
    time: "3 phút trước",
    image: "http://localhost:9000/foodee/food-images/com-tam-suon-bi-cha.jpg",
  },
  {
    customer: "Anh Duy Hoàng (Phú Nhuận)",
    item: "1 suất Nem nướng Nha Trang",
    time: "6 phút trước",
    image: "http://localhost:9000/foodee/food-images/nem-nuong.jpg",
  },
];

export default function LiveOrderTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Initial delay before showing first ticker
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 3000);

    // Interval to cycle through orders
    const cycleInterval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % RECENT_ORDERS.length);
        setVisible(true);
      }, 600); // fade out duration
    }, 7500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleInterval);
    };
  }, []);

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [currentIndex]);

  if (dismissed) return null;

  const currentOrder = RECENT_ORDERS[currentIndex];

  return (
    <aside
      aria-label="Thông báo đơn hàng trực tiếp"
      className={`fixed bottom-6 left-6 z-30 hidden max-w-sm sm:block transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md ring-1 ring-black/5 sm:max-w-md">
        {/* Dish thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-xs">
          <Image
            src={imgError ? "/mascot_background_removed.png" : currentOrder.image}
            alt={currentOrder.item}
            fill
            sizes="48px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Khách vừa đặt món</span>
            <span className="text-slate-400 font-normal">• {currentOrder.time}</span>
          </div>

          <p className="truncate text-xs font-semibold text-slate-800">
            {currentOrder.item}
          </p>
          <p className="truncate text-[11px] text-slate-500">
            {currentOrder.customer}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="ml-1 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Đóng thông báo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
