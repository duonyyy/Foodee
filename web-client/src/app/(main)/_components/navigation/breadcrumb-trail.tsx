"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRightIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

const pathLabels: Record<string, string> = {
  "/search": "Tìm kiếm món ăn",
  "/food": "Món ăn",
  "/food/[id]": "Chi tiết món ăn",
  "/restaurant": "Nhà hàng",
  "/restaurant/[id]": "Chi tiết nhà hàng",
  "/restaurant/[id]/all": "Tất cả món ăn",
  "/restaurant/[id]/edit": "Chỉnh sửa nhà hàng",
  "/order": "Đơn hàng",
  "/order/[id]": "Chi tiết đơn hàng",
  "/checkout": "Thanh toán",
  "/profile": "Hồ sơ cá nhân",
  "/messenger": "Trò chuyện",
  "/map": "Bản đồ nhà hàng",
  "/my-shop": "Cửa hàng của tôi",
  "/about": "Giới thiệu",
};

function matchesTemplate(template: string, path: string) {
  const templateSegments = template.split("/").filter(Boolean);
  const pathSegments = path.split("/").filter(Boolean);

  return (
    templateSegments.length === pathSegments.length &&
    templateSegments.every(
      (segment, index) =>
        segment === "[id]" || segment === pathSegments[index],
    )
  );
}

function getLabel(path: string) {
  if (pathLabels[path]) return pathLabels[path];

  const template = Object.keys(pathLabels).find((candidate) =>
    matchesTemplate(candidate, path),
  );
  return template ? pathLabels[template] : null;
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [
    { href: "/", label: "Trang chủ" },
  ];

  segments.forEach((_, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = getLabel(href);
    if (label) crumbs.push({ href, label });
  });

  return crumbs;
}

export default function BreadcrumbTrail() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <div className="sticky top-[var(--app-header-height)] z-40 border-b border-border/80 bg-background/92 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl px-4 py-2.5 sm:px-6 lg:px-8">
        <Breadcrumb aria-label="Điều hướng phân cấp">
          <BreadcrumbList className="flex-nowrap overflow-hidden">
            {breadcrumbs.map((crumb, index) => {
              const isCurrent = index === breadcrumbs.length - 1;
              return (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem className="min-w-0 shrink">
                    {isCurrent ? (
                      <BreadcrumbPage
                        className="min-w-0 font-semibold text-primary"
                        title={crumb.label}
                      >
                        <span className="block max-w-[12rem] truncate">
                          {crumb.label}
                        </span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={crumb.href}
                          className="flex min-h-8 min-w-0 items-center gap-1.5 text-muted-foreground hover:text-primary"
                          title={crumb.label}
                        >
                          {crumb.href === "/" ? (
                            <HomeIcon
                              className="h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />
                          ) : null}
                          <span className="block max-w-[7rem] truncate sm:max-w-[10rem]">
                            {crumb.label}
                          </span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isCurrent ? (
                    <BreadcrumbSeparator>
                      <ChevronRightIcon className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  ) : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
