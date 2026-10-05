import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MinusCircle,
  XCircle,
} from "lucide-react";
import React from "react";

export type StatusVariant =
  | "pending"
  | "approved"
  | "rejected"
  | "disabled"
  | "warning";

interface StatusConfig {
  variant: StatusVariant;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  classes: string;
}

function resolveStatus(
  status: string | undefined | null,
): StatusConfig {
  const normalized = (status || "").toLowerCase().trim();

  // Pending / Processing / Chờ duyệt / Chờ xử lý
  if (
    [
      "pending",
      "chờ duyệt",
      "chờ xử lý",
      "processing",
      "in progress",
      "chờ giao",
      "preparing",
    ].includes(normalized)
  ) {
    return {
      variant: "pending",
      label: "Chờ xử lý",
      icon: Clock,
      classes:
        "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    };
  }

  // Approved / Active / Completed / Available / Đang hoạt động / Hoàn thành
  if (
    [
      "approved",
      "active",
      "available",
      "complete",
      "completed",
      "success",
      "đã duyệt",
      "hoạt động",
      "đang hoạt động",
      "hoàn thành",
      "đã giao",
    ].includes(normalized)
  ) {
    return {
      variant: "approved",
      label: "Đang hoạt động",
      icon: CheckCircle2,
      classes:
        "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    };
  }

  // Rejected / Cancelled / Failed / Từ chối / Đã hủy
  if (
    [
      "rejected",
      "cancelled",
      "canceled",
      "failed",
      "error",
      "từ chối",
      "đã hủy",
      "thất bại",
    ].includes(normalized)
  ) {
    return {
      variant: "rejected",
      label: "Từ chối",
      icon: XCircle,
      classes:
        "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    };
  }

  // Disabled / Inactive / Hidden / Vô hiệu hóa / Tạm dừng
  if (
    [
      "disabled",
      "inactive",
      "hidden",
      "suspended",
      "vô hiệu hóa",
      "đã khóa",
      "tạm dừng",
      "ẩn",
    ].includes(normalized)
  ) {
    return {
      variant: "disabled",
      label: "Vô hiệu hóa",
      icon: MinusCircle,
      classes:
        "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
    };
  }

  // Fallback
  return {
    variant: "warning",
    label: status || "Không xác định",
    icon: AlertTriangle,
    classes:
      "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700",
  };
}

export interface StatusBadgeProps {
  status: string | undefined | null;
  /** Custom label override if you want to display specific text */
  label?: string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  showIcon = true,
  size = "md",
}) => {
  const config = resolveStatus(status);
  const IconComponent = config.icon;
  const displayLabel = label || config.label;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border shadow-2xs select-none transition-colors",
        config.classes,
        sizeClasses[size],
        className,
      )}
      data-status={config.variant}
      title={`Trạng thái: ${displayLabel}`}
    >
      {showIcon && (
        <IconComponent
          className={cn("shrink-0", iconSizes[size])}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
