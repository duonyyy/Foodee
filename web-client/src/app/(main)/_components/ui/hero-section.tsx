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
              className="h-4 w-4 text-orange-200"
              aria-hidden="true"
            />
            Món ngon gần bạn, giao nhanh mỗi ngày
          </div>

          <h1
            id="home-hero-title"
            className="type-display max-w-xl text-white"
          >
            Một bữa ngon, đúng lúc bạn cần.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85 md:text-lg">
            Khám phá quán gần bạn, chọn món yêu thích và đặt giao
            trong vài thao tác gọn gàng.
          </p>

          <HeroSearch
            lat={location?.lat}
            lng={location?.lng}
            onOpenImageSearch={() => setOpenImageModal(true)}
          />
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
