"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  FileCheck,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import React, {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

export interface FileUploadProps {
  label?: string;
  description?: string;
  value?: string | null;
  onChange?: (file: File | null, previewUrl: string | null) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  acceptedTypesLabel?: string;
  disabled?: boolean;
  className?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
}

const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Component tải lên tệp ảnh chuẩn hóa:
 * - Hỗ trợ kéo thả (drag & drop) và chọn tệp
 * - Giới hạn dung lượng và kiểm tra định dạng
 * - Hiển thị ảnh xem trước (preview) và nút xóa/thay đổi
 * - Hiển thị tiến trình tải lên (progress bar)
 * - Thông báo lỗi trực quan đạt chuẩn accessibility
 */
export function FileUpload({
  label = "Tải lên hình ảnh",
  description,
  value,
  onChange,
  maxSizeMB = 2,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  acceptedTypesLabel = "PNG, JPG, WEBP hoặc GIF",
  disabled = false,
  className,
  isUploading = false,
  uploadProgress,
  error: externalError,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    value || null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value
  React.useEffect(() => {
    if (value !== undefined) {
      setPreviewUrl(value);
    }
  }, [value]);

  const error = externalError || internalError;

  const validateFile = (file: File): boolean => {
    setInternalError(null);

    // Validate type
    if (
      acceptedTypes.length > 0 &&
      !acceptedTypes.includes(file.type)
    ) {
      setInternalError(
        `Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp ${acceptedTypesLabel}.`,
      );
      return false;
    }

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setInternalError(
        `Dung lượng tệp (${fileSizeMB}MB) vượt quá giới hạn cho phép là ${maxSizeMB}MB.`,
      );
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onChange?.(file, objectUrl);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isUploading) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    if (disabled || isUploading) return;
    setPreviewUrl(null);
    setInternalError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChange?.(null, null);
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {label && (
        <label className="block text-sm font-semibold text-foreground">
          {label}
        </label>
      )}

      {/* Upload Zone or Preview */}
      {previewUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-2xs">
          <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={previewUrl}
              alt="Xem trước hình ảnh"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Đang tải lên...{" "}
                  {uploadProgress ? `${uploadProgress}%` : ""}
                </span>
                {uploadProgress !== undefined && (
                  <div className="w-36 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
              <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Đã chọn ảnh thành công</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => inputRef.current?.click()}
                className="text-xs h-8"
              >
                Đổi ảnh khác
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={disabled || isUploading}
                onClick={handleRemove}
                aria-label="Xóa ảnh"
                className="h-8 px-2.5"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() =>
            !disabled && !isUploading && inputRef.current?.click()
          }
          onKeyDown={(e) => {
            if (
              (e.key === "Enter" || e.key === " ") &&
              !disabled &&
              !isUploading
            ) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label="Khu vực tải ảnh lên, nhấn phím Enter để chọn tệp từ máy tính"
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            dragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border bg-card/50 hover:bg-muted/40 hover:border-primary/50",
            disabled
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "",
          )}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <UploadCloud
              className="h-6 w-6 text-primary"
              aria-hidden="true"
            />
          </div>

          <p className="text-sm font-semibold text-foreground text-center">
            Kéo và thả ảnh vào đây, hoặc{" "}
            <span className="text-primary underline">
              chọn từ thiết bị
            </span>
          </p>

          <p className="text-xs text-muted-foreground mt-1 text-center">
            {acceptedTypesLabel} — Tối đa {maxSizeMB}MB
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
        aria-hidden="true"
      />

      {/* Description */}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Error Feedback */}
      {error && (
        <div
          className="flex items-center gap-1.5 text-xs font-medium text-destructive animate-fade-in"
          role="alert"
        >
          <AlertCircle
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
