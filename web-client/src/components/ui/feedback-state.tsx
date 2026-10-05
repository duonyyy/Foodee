import { AlertCircle, Inbox } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedbackStateProps {
  className?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function FeedbackState({
  className,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  tone,
}: FeedbackStateProps & {
  icon: React.ReactNode;
  tone: "empty" | "error";
}) {
  return (
    <section
      className={cn(
        "flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center",
        tone === "empty"
          ? "border-border bg-muted/20"
          : "border-destructive/30 bg-destructive/5",
        className,
      )}
      aria-live={tone === "error" ? "polite" : undefined}
    >
      <div
        className={cn(
          "mb-4 grid h-12 w-12 place-items-center rounded-full",
          tone === "empty"
            ? "bg-primary/10 text-primary"
            : "bg-destructive/10 text-destructive",
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          className="mt-5"
          variant={tone === "error" ? "outline" : "default"}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}

export function EmptyState(props: FeedbackStateProps) {
  return (
    <FeedbackState
      {...props}
      icon={<Inbox className="h-6 w-6" />}
      tone="empty"
    />
  );
}

export function ErrorState(props: FeedbackStateProps) {
  return (
    <FeedbackState
      {...props}
      icon={<AlertCircle className="h-6 w-6" />}
      tone="error"
    />
  );
}
