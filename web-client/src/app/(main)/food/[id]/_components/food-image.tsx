"use client";

import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import {
  TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface FoodImageProps {
  imageUrls: string[];
  name: string;
  status?: string;
  discountPercent?: number;
}

export default function FoodImage({
  imageUrls,
  name,
  status,
  discountPercent,
}: FoodImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const slideRef = useRef<HTMLDivElement>(null);

  // Use fallback image if imageUrls is empty
  const rawImages =
    imageUrls && imageUrls.length > 0
      ? imageUrls
      : ["/images/placeholder-food.jpg"];

  const images = rawImages.map((url, idx) =>
    failedImages[idx] || !url ? "/images/placeholder-food.jpg" : url
  );

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  // Handle transitions
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [images.length, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
    setTimeout(() => setIsTransitioning(false), 400);
  }, [images.length, isTransitioning]);

  // Auto-rotate images if multiple
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      if (!isTransitioning && !isDragging) {
        goToNext();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [goToNext, images.length, isDragging, isTransitioning]);

  // Touch handlers for mobile swiping with visual feedback
  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    setTouchStart(e.targetTouches[0].clientX);
    setTranslateX(0);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;

    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    const containerWidth = slideRef.current?.offsetWidth || 1;
    const dragDistance = currentTouch - touchStart;
    const dragPercentage = (dragDistance / containerWidth) * 100;

    const limitedDrag = Math.max(Math.min(dragPercentage, 30), -30);
    setTranslateX(limitedDrag);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) {
      setTranslateX(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
    setTranslateX(0);
  };

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_20px_50px_rgb(15_23_42/0.12)] md:aspect-square">
        <div
          className="relative h-full w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          ref={slideRef}
        >
          {images.map((image, index) => (
            <div
              key={index}
              style={{
                transform:
                  index === currentIndex
                    ? `translateX(${translateX}%)`
                    : "none",
              }}
              className={`absolute inset-0 transition-all duration-400 ${
                index === currentIndex
                  ? "opacity-100 z-10"
                  : index === (currentIndex + 1) % images.length
                    ? "opacity-0 translate-x-full z-5 pointer-events-none"
                    : index ===
                        (currentIndex - 1 + images.length) %
                          images.length
                      ? "opacity-0 -translate-x-full z-5 pointer-events-none"
                      : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={image}
                alt={`${name} - Ảnh ${index + 1}`}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
                onLoad={() => {
                  if (index === currentIndex) setIsLoading(false);
                }}
                onError={() => handleImageError(index)}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />
            </div>
          ))}

          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted">
              <ImageIcon className="h-10 w-10 animate-pulse text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md transition hover:bg-white hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md transition hover:bg-white hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Badges */}
        <div className="absolute left-4 top-4 z-30 flex flex-wrap gap-2">
          {status && status !== "available" && (
            <span className="rounded-full bg-destructive px-3 py-1.5 text-xs font-black uppercase text-destructive-foreground shadow-lg">
              {status === "unavailable" ? "Tạm hết hàng" : status}
            </span>
          )}
        </div>

        {discountPercent && discountPercent > 0 ? (
          <div className="absolute right-4 top-4 z-30">
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-black text-secondary-foreground shadow-lg">
              -{discountPercent}%
            </span>
          </div>
        ) : null}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 z-30 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(idx);
                  setTimeout(() => setIsTransitioning(false), 400);
                }
              }}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                idx === currentIndex
                  ? "border-primary shadow-md scale-105"
                  : "border-border opacity-65 hover:opacity-100"
              }`}
              aria-label={`Xem ảnh ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                onError={() => handleImageError(idx)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

