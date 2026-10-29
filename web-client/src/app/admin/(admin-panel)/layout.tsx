"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import { UserProvider, Permission } from "@/context/user-context";
import { adminService } from "@/api/admin";
import { useAuth } from "@/context/auth-context";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HomeIcon, LoaderCircle, ShieldAlert, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/ui/command-palette";



// Path mapping for breadcrumbs
const pathMap: Record<string, { label: string; parent?: string }> = {
  "/admin": { label: "Tổng quan" },
  "/admin/users": { label: "Quản lý người dùng" },
  "/admin/stores": { label: "Quản lý cửa hàng" },
  "/admin/foods": { label: "Quản lý món ăn" },
  "/admin/orders": { label: "Quản lý đơn hàng" },
  "/admin/categories": { label: "Danh mục món ăn" },
  "/admin/shippers": { label: "Quản lý tài xế" },
  "/admin/promotions": { label: "Quản lý mã giảm giá" },
  "/admin/role": { label: "Vai trò & Phân quyền" },
  "/admin/roles": { label: "Vai trò & Phân quyền" },
};

/**
 * Layout component dành cho trang admin.
 * - Xác thực người dùng và chuyển hướng nếu cần
 * - Cung cấp UserProvider để chia sẻ quyền với các component con
 * - Hiển thị sidebar điều hướng
 * - Hiển thị breadcrumb để định vị vị trí hiện tại
 * - Bao bọc nội dung trang admin trong một layout nhất quán
 * 
 * @component
 * @param {Object} props - Props của component
 * @param {React.ReactNode} props.children - Các component con sẽ được hiển thị trong layout
 * @returns {JSX.Element} Layout admin với sidebar, breadcrumb và nội dung chính
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(true); // New loading state
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { getToken, user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        console.log(
          "User not authenticated, skipping permission fetch",
        );
        setPermissions([]);
        setIsPermissionsLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          console.error("Token not found");
          setPermissions([]);
          setIsPermissionsLoading(false);
          return;
        }

        const response = await adminService.getMyRole(token);
        const data = response as {
          role: string;
          permissions: string[];
        };
        setPermissions(data.permissions as Permission[]);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        setPermissions([]);
      } finally {
        setIsPermissionsLoading(false); // Always resolve loading state
      }
    };

    void fetchPermissions();
  }, [getToken, user]);

  // Show a loading indicator until permissions are fetched
  if (isPermissionsLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="text-center" role="status" aria-live="polite">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Đang kiểm tra quyền truy cập
          </p>
        </div>
      </div>
    );
  }

  // Optional: Handle unauthenticated case
  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <section className="max-w-md rounded-xl border border-border bg-card p-7 text-center shadow-card">
          <ShieldAlert className="mx-auto h-9 w-9 text-secondary" />
          <h1 className="mt-4 text-xl font-black text-foreground">
            Cần đăng nhập quản trị
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Hãy đăng nhập bằng tài khoản được cấp quyền để tiếp tục.
          </p>
          <Link
            href="/auth/login"
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"
          >
            Đăng nhập
          </Link>
        </section>
      </div>
    );
  }

  const matchedPath = Object.keys(pathMap).find(
    (p) => pathname === p || (p !== "/admin" && pathname.startsWith(p))
  );
  const page = pathMap[pathname] ?? (matchedPath ? pathMap[matchedPath] : { label: "Quản trị Foodee" });

    return (
      <UserProvider permissions={permissions}>
      <div className="flex min-h-screen bg-slate-50/70 dark:bg-muted/20">
        <Sidebar />
        <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
          {/* Sticky Modern Topbar */}
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-card/85 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/75 sm:px-6 lg:px-8">
            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href="/admin"
                        aria-label="Về tổng quan quản trị"
                        className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <HomeIcon className="h-4 w-4" />
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathname !== "/admin" && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{page.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Quick Actions & Command Palette Trigger */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="hidden md:flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted px-3 py-1.5 text-xs text-muted-foreground transition shadow-2xs hover:border-primary/40 focus:outline-none"
              >
                <Search className="h-3.5 w-3.5 text-primary" />
                <span>Tìm nhanh (người dùng, đơn, quán)...</span>
                <kbd className="ml-1 rounded bg-card border border-border px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground shadow-2xs">
                  Ctrl K
                </kbd>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hệ thống trực tuyến</span>
              </div>

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition hover:bg-muted"
              >
                <span>Trang khách</span>
                <span className="text-muted-foreground text-xs">↗</span>
              </Link>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="mx-auto max-w-[1600px] space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-6">
              {children}
            </div>
          </div>
          </main>
        </div>

        {/* Global Command Palette */}
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </div>
    </UserProvider>
  );
}
