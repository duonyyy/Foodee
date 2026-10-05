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
  Home,
  LogOut,
  Menu,
  MessageCircle,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "statistics", label: "Thống kê", icon: BarChart3 },
  { href: "basic-info", label: "Thông tin cơ bản", icon: Home },
  { href: "food-list", label: "Thực đơn", icon: UtensilsCrossed },
  { href: "order-list", label: "Đơn hàng", icon: ShoppingBag },
  { href: "messenger", label: "Tin nhắn", icon: MessageCircle },
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
  const { logout } = useAuth();
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
        "flex flex-col h-full bg-primary text-primary-foreground p-6",
        className,
      )}
    >
      {/* Khu vực logo */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="bg-primary-foreground/10 p-3 rounded-full mb-3 shadow-inner">
          <ChefHat
            className="h-8 w-8 text-primary-foreground"
            aria-hidden="true"
          />
        </div>
        <Link
          href="/"
          onClick={onNavigate}
          className="text-xl font-bold tracking-tight text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Foodee Chủ quán
        </Link>
        <span className="text-xs text-primary-foreground/75 mt-1 font-medium">
          Bảng điều khiển nhà hàng
        </span>
      </div>

      {/* Điều hướng */}
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
                "flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors group select-none",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground shadow-xs font-semibold"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
              )}
            >
              <item.icon
                className="mr-3 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Đăng xuất */}
      <div className="mt-auto pt-4 border-t border-primary-foreground/15">
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-2.5 text-sm font-medium text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          onClick={handleLogout}
        >
          <LogOut
            className="mr-3 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <span>Đăng xuất</span>
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside
      className="hidden lg:flex w-64 flex-col h-screen bg-primary text-primary-foreground border-r border-border/10 shadow-md shrink-0"
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
        className="h-10 w-10 text-foreground hover:bg-muted"
        aria-label="Mở menu quản lý nhà hàng"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-primary text-primary-foreground border-none"
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
