"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  LayoutDashboard,
  Users,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Tag,
  ShieldCheck,
  ExternalLink,
  Plus,
  ArrowRight,
  FolderOpen,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: "Điều hướng" | "Thao tác nhanh" | "Khám phá";
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commandItems: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-dashboard",
        title: "Bảng điều khiển & Thống kê",
        category: "Điều hướng",
        icon: LayoutDashboard,
        href: "/admin",
        keywords: ["thong ke", "dashboard", "tong quan", "doanh thu"],
      },
      {
        id: "nav-users",
        title: "Quản lý người dùng & khách hàng",
        category: "Điều hướng",
        icon: Users,
        href: "/admin/users",
        keywords: ["user", "nguoi dung", "tai khoan", "khach hang"],
      },
      {
        id: "nav-stores",
        title: "Quản lý cửa hàng & quán ăn",
        category: "Điều hướng",
        icon: Store,
        href: "/admin/stores",
        keywords: ["store", "nha hang", "cua hang", "quan an", "doi tac"],
      },
      {
        id: "nav-foods",
        title: "Quản lý món ăn & thực đơn",
        category: "Điều hướng",
        icon: UtensilsCrossed,
        href: "/admin/foods",
        keywords: ["food", "mon an", "thuc don", "menu"],
      },
      {
        id: "nav-orders",
        title: "Quản lý đơn hàng toàn sàn",
        category: "Điều hướng",
        icon: ShoppingBag,
        href: "/admin/orders",
        keywords: ["order", "don hang", "hoa don", "giao dich"],
      },
      {
        id: "nav-categories",
        title: "Danh mục món ăn",
        category: "Điều hướng",
        icon: FolderOpen,
        href: "/admin/categories",
        keywords: ["category", "danh muc", "phan loai"],
      },
      {
        id: "nav-shippers",
        title: "Quản lý tài xế & shipper",
        category: "Điều hướng",
        icon: Bike,
        href: "/admin/shippers",
        keywords: ["shipper", "tai xe", "giao hang"],
      },
      {
        id: "nav-promotions",
        title: "Quản lý mã giảm giá (Vouchers)",
        category: "Điều hướng",
        icon: Tag,
        href: "/admin/promotions",
        keywords: ["promotion", "voucher", "khuyen mai", "giam gia"],
      },
      {
        id: "nav-roles",
        title: "Vai trò & Phân quyền hệ thống",
        category: "Điều hướng",
        icon: ShieldCheck,
        href: "/admin/role",
        keywords: ["role", "vai tro", "quyen", "permission", "rbac"],
      },

      // Quick Actions
      {
        id: "act-create-food",
        title: "Thêm món ăn mới",
        category: "Thao tác nhanh",
        icon: Plus,
        href: "/admin/foods",
        keywords: ["tao mon", "them mon", "new food"],
      },
      {
        id: "act-create-promo",
        title: "Tạo voucher khuyến mãi mới",
        category: "Thao tác nhanh",
        icon: Plus,
        href: "/admin/promotions",
        keywords: ["tao voucher", "them ma", "new promo"],
      },
      {
        id: "act-home",
        title: "Xem giao diện khách hàng (Trang chủ Foodee)",
        category: "Khám phá",
        icon: ExternalLink,
        href: "/",
        keywords: ["trang chu", "khach hang", "home", "client"],
      },
    ],
    []
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return commandItems;
    const q = query.toLowerCase().trim();
    return commandItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [commandItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onOpenChange(false);
      setQuery("");
      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [onOpenChange, router]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredItems, selectedIndex, handleSelect]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Tìm kiếm toàn cục Admin</DialogTitle>

        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/70 bg-card">
          <Search className="h-4 w-4 text-primary shrink-0" />
          <input
            type="text"
            placeholder="Tìm chức năng, người dùng, cửa hàng, đơn hàng... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground text-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono rounded bg-muted text-muted-foreground border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              Không tìm thấy kết quả phù hợp với &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors text-xs font-semibold ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-muted/70"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-muted/50 text-muted-foreground border-border"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-xs">{item.title}</p>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-muted/30 text-[11px] text-muted-foreground">
          <span>
            Dùng phím <kbd className="font-mono font-bold">↑</kbd>{" "}
            <kbd className="font-mono font-bold">↓</kbd> để di chuyển,{" "}
            <kbd className="font-mono font-bold">Enter</kbd> để mở
          </span>
          <span className="font-bold text-primary">Foodee Command</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
