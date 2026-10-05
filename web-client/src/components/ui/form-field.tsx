"use client";

import { AlertCircle } from "lucide-react";
import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
};

interface FormFieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: React.ReactElement<FieldControlProps>;
  description?: React.ReactNode;
  error?: React.ReactNode;
  id?: string;
  label: React.ReactNode;
  optionalLabel?: string;
  required?: boolean;
}

/**
 * Connects a label, help text, error message, and form control with the
 * appropriate accessible relationships. It works with native controls and
 * Foodee primitives such as Input, Textarea, and SelectTrigger.
 */
function FormField({
  children,
  className,
  description,
  error,
  id,
  label,
  optionalLabel = "Không bắt buộc",
  required = false,
  ...props
}: FormFieldProps) {
  const generatedId = React.useId().replace(/:/g, "");
  const controlId = children.props.id ?? id ?? `field-${generatedId}`;
  const descriptionId = description
    ? `${controlId}-description`
    : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [
    children.props["aria-describedby"],
    descriptionId,
    errorId,
  ]
    .filter(Boolean)
    .join(" ");

  const control = React.cloneElement(children, {
    id: controlId,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : children.props["aria-invalid"],
    "aria-required": required || children.props["aria-required"],
  });

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <div className="flex min-h-5 items-baseline justify-between gap-3">
        <Label htmlFor={controlId}>
          {label}
          {required ? (
            <>
              <span
                className="ml-1 text-destructive"
                aria-hidden="true"
              >
                *
              </span>
              <span className="sr-only"> (bắt buộc)</span>
            </>
          ) : null}
        </Label>
        {!required ? (
          <span className="text-xs font-medium text-muted-foreground">
            {optionalLabel}
          </span>
        ) : null}
      </div>

      {control}

      {description ? (
        <p
          id={descriptionId}
          className="text-sm leading-5 text-muted-foreground"
        >
          {description}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-sm font-medium leading-5 text-destructive"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export { FormField };
export type { FormFieldProps };
