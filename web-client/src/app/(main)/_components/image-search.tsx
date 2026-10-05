"use client";

import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Search,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useRef, useState } from "react";

interface Detection {
  bbox: { x1: number; y1: number; x2: number; y2: number };
  class_id: number;
  class_name: string;
  classification_confidence: number;
  detection_confidence: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const MAX_FILE_SIZE_MB = 2;
const PRIMARY_BOX_COLOR = "hsl(var(--primary))";
const FOOD_AI_URL = process.env.NEXT_PUBLIC_FOOD_AI_URL?.replace(/\/$/, "");

export default function ImageSearchModal({ open, onClose }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [classCounts, setClassCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [imgNatural, setImgNatural] = useState({ width: 1, height: 1 });

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const resetImage = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setDetections([]);
    setClassCounts({});
    setError(null);
    setHoveredIdx(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetImage();
    onClose();
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một tệp hình ảnh hợp lệ.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Ảnh tối đa ${MAX_FILE_SIZE_MB}MB. Vui lòng chọn ảnh nhỏ hơn.`);
      return;
    }

    setError(null);
    setDetections([]);
    setClassCounts({});
    setLoading(true);
    setImageUrl(URL.createObjectURL(file));

    if (!FOOD_AI_URL) {
      setError("Dịch vụ nhận diện món ăn chưa được cấu hình.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${FOOD_AI_URL}/image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Không thể nhận diện ảnh lúc này.");

      const data = (await res.json()) as {
        detections?: Detection[];
        class_counts?: Record<string, number>;
      };

      setDetections(data.detections || []);
      setClassCounts(data.class_counts || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || loading) return;
    await handleFile(file);
  };

  const handleDetectionSearch = (className: string) => {
    router.push(`/search?search=${encodeURIComponent(className)}`);
    handleClose();
  };

  const renderBoxes = () => {
    if (!imgRef.current || detections.length === 0) return null;

    const img = imgRef.current;
    const scaleX = img.width / imgNatural.width;
    const scaleY = img.height / imgNatural.height;

    return detections.map((det, idx) => {
      const { x1, y1, x2, y2 } = det.bbox;
      const isHovered = hoveredIdx === idx;

      return (
        <button
          key={`${det.class_name}-${idx}`}
          type="button"
          title={`Tìm ${det.class_name}`}
          onClick={() => handleDetectionSearch(det.class_name)}
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
          className="absolute z-10 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{
            left: x1 * scaleX,
            top: y1 * scaleY,
            width: (x2 - x1) * scaleX,
            height: (y2 - y1) * scaleY,
            border: `2px solid ${PRIMARY_BOX_COLOR}`,
            background: isHovered
              ? "hsl(var(--primary) / 0.2)"
              : "hsl(var(--primary) / 0.08)",
            boxShadow: isHovered
              ? "0 0 0 4px hsl(var(--primary) / 0.16)"
              : "0 8px 24px rgb(15 23 42 / 0.12)",
          }}
          aria-label={`Tìm kiếm ${det.class_name}`}
        >
          {isHovered && (
            <span className="absolute left-0 top-0 rounded-br-xl rounded-tl-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
              {det.class_name} ({(det.detection_confidence * 100).toFixed(0)}%)
            </span>
          )}
        </button>
      );
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={handleClose}
      role="presentation"
    >
      <section
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-search-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 id="image-search-title" className="text-lg font-extrabold text-slate-950">
                Tìm kiếm bằng hình ảnh
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Tải ảnh món ăn lên, Foodee sẽ nhận diện và gợi ý kết quả tìm kiếm phù hợp.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Đóng tìm kiếm bằng hình ảnh"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto lg:grid-cols-[1fr_300px]">
          <main className="min-h-[420px] bg-slate-50 p-5 sm:p-6">
            {!imageUrl ? (
              <button
                type="button"
                onClick={() => !loading && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                disabled={loading}
                className="flex h-full min-h-[360px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center shadow-sm transition hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Chọn hoặc kéo thả ảnh để tìm kiếm"
              >
                <input
                  id="imageSearchInput"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-slate-950">
                  Tải ảnh món ăn lên
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Chọn ảnh rõ món ăn hoặc kéo thả vào khu vực này. Hỗ trợ PNG, JPG,
                  WEBP, GIF tối đa {MAX_FILE_SIZE_MB}MB.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
                  <ImagePlus className="h-4 w-4" />
                  Chọn ảnh
                </span>
              </button>
            ) : (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4">
                <div className="relative inline-block max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                  <Image
                    width={imgNatural.width || 800}
                    height={imgNatural.height || 600}
                    unoptimized
                    ref={imgRef}
                    src={imageUrl}
                    alt="Ảnh đã tải lên để tìm kiếm"
                    className="block max-h-[54vh] max-w-full object-contain"
                    onLoad={(event) => {
                      const img = event.currentTarget;
                      setImgNatural({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                      });
                    }}
                  />
                  {renderBoxes()}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white"
                  onClick={resetImage}
                  disabled={loading}
                >
                  Chọn ảnh khác
                </Button>
              </div>
            )}
          </main>

          <aside className="border-t border-slate-200 bg-white p-5 lg:border-l lg:border-t-0">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase text-slate-500">
                  Trạng thái
                </h3>
                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                  {loading ? (
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      Đang nhận diện ảnh...
                    </div>
                  ) : error ? (
                    <div className="flex items-start gap-3 text-sm font-semibold text-red-600">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                      {error}
                    </div>
                  ) : detections.length > 0 ? (
                    <div className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      Đã tìm thấy {detections.length} kết quả. Chọn nhãn trên ảnh hoặc bên dưới để tìm kiếm.
                    </div>
                  ) : imageUrl ? (
                    <div className="text-sm leading-6 text-slate-500">
                      Không tìm thấy món ăn rõ ràng trong ảnh này.
                    </div>
                  ) : (
                    <div className="text-sm leading-6 text-slate-500">
                      Chưa có ảnh nào được tải lên.
                    </div>
                  )}
                </div>
              </div>

              {Object.keys(classCounts).length > 0 && (
                <div>
                  <h3 className="text-sm font-extrabold uppercase text-slate-500">
                    Kết quả nhận diện
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(classCounts).map(([name, count]) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleDetectionSearch(name)}
                        className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <Search className="h-3.5 w-3.5" />
                        {name}
                        <span className="rounded-full bg-white/70 px-1.5 text-xs">
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
