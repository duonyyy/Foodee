import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import React, { ReactNode } from "react";

export interface BreadcrumbStep {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbStep[];
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  className,
}) => {
  return (
    <header className={cn("mb-6 space-y-3", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Đường dẫn trang"
          className="text-xs text-muted-foreground"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Về trang chủ quản trị"
              >
                <Home className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">Trang chủ</span>
              </Link>
            </li>
            {breadcrumbs.map((step, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={idx} className="flex items-center gap-1.5">
                  <ChevronRight
                    className="h-3 w-3 text-muted-foreground/60"
                    aria-hidden="true"
                  />
                  {isLast || !step.href ? (
                    <span
                      className="font-semibold text-foreground"
                      aria-current="page"
                    >
                      {step.label}
                    </span>
                  ) : (
                    <Link
                      href={step.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {step.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
