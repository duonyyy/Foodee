import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full resize-y rounded-lg border border-input bg-card/70 px-3.5 py-3 text-base text-foreground shadow-control outline-none transition-[border-color,background-color,box-shadow] placeholder:text-muted-foreground hover:border-primary/40 focus-visible:border-primary focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-0 disabled:border-disabled disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-100 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/15 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
