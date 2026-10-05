"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import React, { ReactNode } from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: string;
  isPositive?: boolean;
  periodLabel?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

/**
 * Component thẻ thống kê chuẩn hóa cho Admin và Owner:
 * - Hiển thị giá trị chính nổi bật
 * - Hiển thị xu hướng tăng/giảm với icon và màu tương phản cao
 * - Thời gian đo / kỳ so sánh rõ ràng
 * - Skeleton loading state
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  previousValue,
  change,
  isPositive,
  periodLabel = "so với kỳ trước",
  icon,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-card p-5 rounded-2xl border border-border shadow-2xs space-y-3",
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-44" />
      </div>
    );
  }

  const hasTrend = change !== undefined && change !== "";

  return (
    <div
      className={cn(
        "bg-card p-5 rounded-2xl border border-border shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3",
        className,
      )}
    >
      {/* Card Header: Title & Icon */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        {icon && (
          <div
            className="p-2 rounded-xl bg-primary/10 text-primary shrink-0"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {value}
        </div>

        {/* Previous Value caption if provided */}
        {previousValue !== undefined && previousValue !== "" && (
          <p className="text-xs text-muted-foreground">
            Kỳ trước:{" "}
            <strong className="font-semibold text-foreground/80">
              {previousValue}
            </strong>
          </p>
        )}
      </div>

      {/* Trend & Measurement Period Footer */}
      {(hasTrend || periodLabel) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-xs">
          {hasTrend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-xs",
                isPositive === true
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : isPositive === false
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                    : "bg-muted text-muted-foreground",
              )}
              aria-label={
                isPositive === true
                  ? `Tăng ${change}`
                  : isPositive === false
                    ? `Giảm ${change}`
                    : `Thay đổi ${change}`
              }
            >
              {isPositive === true ? (
                <TrendingUp
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
              ) : isPositive === false ? (
                <TrendingDown
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <Minus
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
              )}
              <span>{change}</span>
            </span>
          )}

          {periodLabel && (
            <span className="text-muted-foreground font-medium">
              {periodLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
