import { MapPinIcon } from "@/components/icon";
import Brand from "@/components/ui/brand";
import {
  ArrowUpRightIcon,
  CheckCircle2,
  ClockIcon,
  FileCheck,
  Headphones,
  Lock,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";

const footerNavs = [
  {
    label: "Khám phá ẩm thực",
    items: [
      { href: "/search", name: "Thực đơn 61 món ngon" },
      { href: "/search?sort=hot", name: "Món bán chạy nhất" },
      { href: "/map", name: "Quán ăn gần bạn" },
      { href: "/about", name: "Về Foodee Fresh" },
    ],
  },
  {
    label: "Dành cho khách hàng",
    items: [
      { href: "/order", name: "Theo dõi đơn hàng" },
      { href: "/profile", name: "Tài khoản cá nhân" },
      { href: "/my-shop", name: "Đăng ký mở quán đối tác" },
      { href: "/about", name: "Chính sách bồi hoàn 100%" },
    ],
  },
] as const;

const paymentMethods = [
  "MoMo",
  "ZaloPay",
  "VNPAY-QR",
  "ShopeePay",
  "Visa",
  "Mastercard",
  "JCB",
  "Tiền mặt (COD)",
];

const serviceNotes = [
  {
    title: "Cam kết chuẩn ATTP",
    description: "100% đối tác được kiểm duyệt giấy tờ an toàn vệ sinh thực phẩm.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Giao nóng trong 25 phút",
    description: "Túi giữ nhiệt chuyên dụng 3 lớp giữ trọn vị giòn sốt thơm ngon.",
    icon: ClockIcon,
  },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      {/* Decorative ambient gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-screen-2xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-sm md:p-10 lg:grid-cols-[1.3fr_0.9fr_1fr] lg:gap-12">
          {/* 1. Legal Entity & Address */}
          <section aria-labelledby="footer-brand-title">
            <h2 id="footer-brand-title" className="sr-only">
              Foodee Việt Nam
            </h2>
            <Brand variant="light" width={196} />

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Công ty Cổ phần Công nghệ Ẩm thực Foodee Việt Nam
            </p>

            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
              Nền tảng đặt món trực tuyến chuẩn mực với hơn 60 món ăn truyền thống Việt Nam, 
              giao nhanh trong 25 phút với cam kết hoàn tiền 100% nếu không hài lòng.
            </p>

            <address className="mt-6 space-y-3.5 not-italic text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-400">
                  <MapPinIcon className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Trụ sở chính
                  </p>
                  <p className="mt-0.5 leading-snug">
                    Tòa nhà Foodee Tower, Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-400">
                  <Headphones className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Tổng đài hỗ trợ 24/7 (Cả Lễ, Tết)
                  </p>
                  <p className="mt-0.5 font-bold text-white">
                    1900 6868 <span className="font-normal text-xs text-slate-400">(1.000đ/phút)</span> • cskh@foodee.vn
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-blue-400">
                  <FileCheck className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Pháp lý doanh nghiệp
                  </p>
                  <p className="mt-0.5 text-xs text-slate-300">
                    GPĐKKD: 0317892345 do Sở KH&ĐT TP.HCM cấp • Giấy chứng nhận ATTP số: 458/2024/ATTP-BCT
                  </p>
                </div>
              </div>
            </address>
          </section>

          {/* 2. Quick Links */}
          <nav
            aria-label="Liên kết chân trang"
            className="grid grid-cols-2 gap-8"
          >
            {footerNavs.map((nav) => (
              <div key={nav.label}>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  {nav.label}
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {item.name}
                        <ArrowUpRightIcon
                          className="h-3.5 w-3.5 opacity-60"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* 3. Guarantees & Trust Badges */}
          <section aria-labelledby="footer-service-title" className="space-y-4">
            <h2
              id="footer-service-title"
              className="text-sm font-bold uppercase tracking-wider text-white"
            >
              Cam kết dịch vụ & Bảo chứng
            </h2>

            <div className="space-y-3">
              {serviceNotes.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Regulatory & Security Badges */}
            <div className="pt-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Chứng nhận bảo mật & Pháp lý
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đã Đăng Ký Bộ Công Thương
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  <Lock className="h-3.5 w-3.5" />
                  SSL 256-bit PCI-DSS
                </span>
              </div>
            </div>

            {/* Accepted Payments */}
            <div className="pt-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Phương thức thanh toán
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {paymentMethods.map((pm) => (
                  <span
                    key={pm}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300"
                  >
                    {pm}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Foodee Food Delivery Platform. Bản quyền thuộc về Công ty CP Công nghệ Ẩm thực Foodee Việt Nam.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-white transition-colors">Quy chế hoạt động</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
