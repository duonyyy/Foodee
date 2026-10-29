"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChefHat,
  ExternalLink,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "statistics", label: "Thống kê", icon: BarChart3, badge: null },
  { href: "order-list", label: "Đơn hàng & Bếp", icon: ShoppingBag, badge: "Live" },
  { href: "food-list", label: "Thực đơn món", icon: UtensilsCrossed, badge: null },
  { href: "basic-info", label: "Thông tin quán", icon: Home, badge: null },
  { href: "messenger", label: "Tin nhắn khách", icon: MessageCircle, badge: null },
];

interface SidebarNavProps {
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNavContent({
  onNavigate,
  className,
}: SidebarNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { logout, user } = useAuth();
  const restaurantId = params.id;

  const currentRestaurantId = Array.isArray(restaurantId)
    ? restaurantId[0]
    : restaurantId;
  const basePath = currentRestaurantId
    ? `/restaurant/${currentRestaurantId}/edit`
    : "/";

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card text-foreground border-r border-border/80 p-5",
        className,
      )}
    >
      {/* 1. Header Logo & Merchant Brand */}
      <div className="mb-6 pb-5 border-b border-border/60">
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex items-center gap-3 focus:outline-none"
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center transition-transform group-hover:scale-105">
            <ChefHat className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                Foodee
              </span>
              <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                Đối tác
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Kênh quản lý quán ăn
            </p>
          </div>
        </Link>
      </div>

      {/* 2. Public Store Quick Link */}
      {currentRestaurantId && (
        <div className="mb-5">
          <Link
            href={`/restaurant/${currentRestaurantId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/40"
            title="Mở xem trang nhà hàng của bạn như khách hàng nhìn thấy"
          >
            <span className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span>Xem trang của quán</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </div>
      )}

      {/* 3. Navigation Links */}
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2 px-2">
        Quản lý vận hành
      </div>
      <nav
        className="flex-1 space-y-1.5"
        aria-label="Điều hướng chủ quán"
      >
        {navItems.map((item) => {
          const fullPath =
            basePath !== "/"
              ? `${basePath}/${item.href}`
              : `/${item.href}`;
          const isBasePathActive =
            item.href === "basic-info" && pathname === basePath;
          const isSubPathActive =
            pathname === fullPath ||
            pathname.startsWith(`${fullPath}/`);
          const isActive = isBasePathActive || isSubPathActive;

          return (
            <Link
              key={item.href}
              href={fullPath}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group select-none",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 animate-pulse",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 4. User profile & Logout */}
      <div className="mt-auto pt-4 border-t border-border/70 space-y-2">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center font-bold text-xs text-foreground ring-1 ring-border">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || "Chủ quán"}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                <span>{(user.name || "U")[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {user.name || "Chủ quán"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user.email || user.phone || "Đối tác Foodee"}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Đăng xuất</span>
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside
      className="hidden lg:flex w-64 flex-col h-screen bg-card shrink-0 sticky top-0"
      aria-label="Sidebar điều hướng chủ quán"
    >
      <SidebarNavContent />
    </aside>
  );
}

export function MobileOwnerNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-10 w-10 text-foreground hover:bg-accent rounded-xl border border-border"
        aria-label="Mở menu quản lý nhà hàng"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-card text-foreground border-r border-border"
        >
          <div className="sr-only">
            <SheetTitle>Menu quản lý nhà hàng</SheetTitle>
          </div>
          <SidebarNavContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
