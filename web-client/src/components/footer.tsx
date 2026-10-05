import { MapPinIcon, PhoneIcon, UserIcon } from "@/components/icon";
import Brand from "@/components/ui/brand";
import {
  ArrowUpRightIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";

const footerNavs = [
  {
    label: "Khám phá",
    items: [
      { href: "/search", name: "Tìm món ăn" },
      { href: "/map", name: "Nhà hàng gần bạn" },
      { href: "/about", name: "Về Foodee" },
    ],
  },
  {
    label: "Tài khoản",
    items: [
      { href: "/order", name: "Đơn hàng của tôi" },
      { href: "/profile", name: "Hồ sơ cá nhân" },
      { href: "/my-shop", name: "Cửa hàng của tôi" },
    ],
  },
] as const;

const serviceNotes = [
  {
    title: "Đặt món rõ ràng",
    description: "Giá và ưu đãi được trình bày trước khi thanh toán.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Theo dõi thuận tiện",
    description: "Xem lại trạng thái đơn hàng ngay trong tài khoản.",
    icon: ClockIcon,
  },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-secondary/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-screen-2xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="grid gap-10 rounded-3xl border border-background/10 bg-background/[0.04] p-6 shadow-floating backdrop-blur-sm md:p-8 lg:grid-cols-[1.2fr_0.9fr_1fr] lg:gap-12">
          <section aria-labelledby="footer-brand-title">
            <h2 id="footer-brand-title" className="sr-only">
              Foodee
            </h2>
            <Brand variant="light" width={196} />

            <p className="mt-5 max-w-md text-sm leading-6 text-background/75">
              Tìm món phù hợp, khám phá nhà hàng gần bạn và đặt giao
              trong một trải nghiệm gọn gàng.
            </p>

            <address className="mt-7 space-y-4 not-italic">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-background/10">
                  <MapPinIcon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-background/55">
                    Địa chỉ
                  </p>
                  <p className="mt-1 text-sm leading-6 text-background/85">
                    Trường Đại học Công nghệ Thông tin
                    <br />
                    ĐHQG TP.HCM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-background/10">
                  <PhoneIcon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-background/55">
                    Hotline
                  </p>
                  <p className="mt-1 text-sm text-background/85">
                    Đang cập nhật
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-background/10">
                  <UserIcon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-background/55">
                    Đại diện pháp luật
                  </p>
                  <p className="mt-1 text-sm text-background/85">
                    admin
                  </p>
                </div>
              </div>
            </address>
          </section>

          <nav
            aria-label="Liên kết cuối trang"
            className="grid grid-cols-2 gap-8"
          >
            {footerNavs.map((nav) => (
              <div key={nav.label}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-background">
                  {nav.label}
                </h2>
                <ul className="mt-5 space-y-2">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-background/70 transition-colors hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
                      >
                        {item.name}
                        <ArrowUpRightIcon
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <section aria-labelledby="footer-service-title">
            <p className="type-metadata text-background/55">
              Trải nghiệm Foodee
            </p>
            <h2
              id="footer-service-title"
              className="mt-2 font-display text-2xl font-bold text-background"
            >
              Mỗi lựa chọn đều dễ hiểu.
            </h2>
            <div className="mt-5 space-y-3">
              {serviceNotes.map(
                ({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-2xl border border-background/10 bg-background/[0.05] p-4"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/10 text-background">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-background">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-background/65">
                        {description}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-background/10 pt-6 text-sm text-background/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Foodee.</p>
          <p>Sinh viên UIT.</p>
        </div>
      </div>
    </footer>
  );
}
