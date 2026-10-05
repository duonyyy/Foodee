import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

// Use the type directly instead of creating an empty interface
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "motion-safe:animate-pulse rounded-md bg-muted",
        className,
      )}
      {...props}
    />
  );
}
