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
import { HomeIcon, LoaderCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";



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
      <div className="flex min-h-screen bg-muted/40">
        <Sidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px] space-y-4">
            <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
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

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
