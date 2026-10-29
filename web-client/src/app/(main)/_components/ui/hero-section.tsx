"use client";

import { useGeo } from "@/context/geolocation-context";
import { SparklesIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import HeroSearch from "../home/hero-search";

const ImageSearchModal = dynamic(() => import("../image-search"), {
  ssr: false,
});

export default function HeroSection() {
  const { location } = useGeo();
  const [openImageModal, setOpenImageModal] = useState(false);

  return (
    <section
      className="relative min-h-[33rem] overflow-hidden bg-foreground text-white sm:min-h-[35rem] lg:min-h-[37rem]"
      aria-labelledby="home-hero-title"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/assets/hero.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-foreground/95 via-foreground/72 to-foreground/15" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-20 mx-auto flex min-h-[33rem] max-w-screen-2xl items-center px-4 py-12 sm:min-h-[35rem] sm:px-6 lg:min-h-[37rem] lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-control backdrop-blur">
            <SparklesIcon
              className="h-4 w-4 text-emerald-300"
              aria-hidden="true"
            />
            Món ngon gần bạn, giao nhanh mỗi ngày
          </div>

          <h1
            id="home-hero-title"
            className="type-display max-w-xl text-white tracking-tight"
          >
            Món ngon nóng hổi, giao tận nơi trong 25 phút.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
            Đại tiệc ẩm thực Việt Nam chuẩn vị truyền thống. Hơn 60 món ăn đặc sắc từ 
            phở, bún đậu đến bánh mì giòn rụm với cam kết bồi hoàn 100% nếu không hài lòng.
          </p>

          <HeroSearch
            lat={location?.lat}
            lng={location?.lng}
            onOpenImageSearch={() => setOpenImageModal(true)}
          />

          {/* Trending Food Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-emerald-300">🔥 Xu hướng:</span>
            {[
              { name: "Phở bò", query: "Phở" },
              { name: "Cơm tấm", query: "Cơm tấm" },
              { name: "Bún đậu", query: "Bún đậu" },
              { name: "Bánh mì chảo", query: "Bánh mì chảo" },
              { name: "Bún bò Huế", query: "Bún bò Huế" },
              { name: "Trà sen vàng", query: "Trà sen" },
            ].map((chip) => (
              <a
                key={chip.name}
                href={`/search?search=${encodeURIComponent(chip.query)}`}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold text-white/95 backdrop-blur transition hover:border-emerald-400 hover:bg-white/20 hover:scale-105"
              >
                {chip.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {openImageModal ? (
        <ImageSearchModal
          open={openImageModal}
          onClose={() => setOpenImageModal(false)}
        />
      ) : null}
    </section>
  );
}
