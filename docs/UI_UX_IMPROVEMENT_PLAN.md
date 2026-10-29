# KẾ HOẠCH CHI TIẾT NÂNG CẤP TOÀN DIỆN GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX)
## PHÂN HỆ ADMIN PANEL & KÊNH NHÀ HÀNG (PARTNER PORTAL) — FOODEE PLATFORM

> **Tài liệu đặc tả kỹ thuật & thiết kế giao diện (Technical & UI/UX Specification)**  
> **Phiên bản:** 2.0 (Toàn diện)  
> **Nền tảng:** Next.js 15 (App Router), React 19, Tailwind CSS 3.4, Lucide Icons, Chart.js 4, Apollo Client (GraphQL WS), Mapbox GL.

---

## MỤC LỤC
1. [TỔNG QUAN, MỤC TIÊU & CHỈ SỐ ĐO LƯỜNG (KPIs)](#1-tổng-quan-mục-tiêu--chỉ-số-đo-lường-kpis)
2. [HỆ THỐNG QUY CHUẨN THIẾT KẾ (DESIGN SYSTEM FOODEE 2.0)](#2-hệ-thống-quy-chuẩn-thiết-kế-design-system-foodee-20)
3. [CHI TIẾT THIẾT KẾ KÊNH NHÀ HÀNG (RESTAURANT OWNER PORTAL)](#3-chi-tiết-thiết-kế-kênh-nhà-hàng-restaurant-owner-portal)
   - [3.1. Hệ thống Điều phối & Bếp (KDS - Kitchen Display System Kanban)](#31-hệ-thống-điều-phối--bếp-kds---kitchen-display-system-kanban)
   - [3.2. Quản lý Thực đơn & Trình soạn thảo Món ăn 2 Cột (WYSIWYG Live Preview)](#32-quản-lý-thực-đơn--trình-soạn-thảo-món-ăn-2-cột-wysiwyg-live-preview)
   - [3.3. Quy trình Đăng ký & Onboarding Đối tác 4 Bước (`my-shop`)](#33-quy-trình-đăng-ký--onboarding-đối-tác-4-bước-my-shop)
   - [3.4. Báo cáo Doanh thu & Bản đồ Nhiệt Giờ Cao Điểm (`statistics`)](#34-báo-cáo-doanh-thu--bản-đồ-nhiệt-giờ-cao-điểm-statistics)
4. [CHI TIẾT THIẾT KẾ KÊNH QUẢN TRỊ HỆ THỐNG (ADMIN PANEL)](#4-chi-tiết-thiết-kế-kênh-quản-trị-hệ-thống-admin-panel)
   - [4.1. Khung Điều Hướng Đa Nhiệm: Collapsible Sidebar & Glassmorphism Topbar](#41-khung-điều-hướng-đa-nhiệm-collapsible-sidebar--glassmorphism-topbar)
   - [4.2. Thanh Tìm Kiếm Toàn Cục Siêu Tốc (Command Palette `Ctrl + K`)](#42-thanh-tìm-kiếm-toàn-cục-siêu-tốc-command-palette-ctrl--k)
   - [4.3. Bảng Dữ Liệu Thông Minh (Smart Data Table: Sticky, Density, Export)](#43-bảng-dữ-liệu-thông-minh-smart-data-table-sticky-density-export)
   - [4.4. Trung Tâm Điều Hành Executive Dashboard & Action Center](#44-trung-tâm-điều-hành-executive-dashboard--action-center)
5. [CẤU TRÚC TỆP TIN & QUẢN LÝ DỮ LIỆU (FILE TREE & DATA ARCHITECTURE)](#5-cấu-trúc-tệp-tin--quản-lý-dữ-liệu-file-tree--data-architecture)
6. [LỘ TRÌNH THỰC HIỆN TỪNG BƯỚC & TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)](#6-lộ-trình-thực-hiện-từng-bước--tiêu-chí-nghiệm-thu-acceptance-criteria)

---

## 1. TỔNG QUAN, MỤC TIÊU & CHỈ SỐ ĐO LƯỜNG (KPIs)

### 1.1. Hiện trạng & Thách thức
- **Kênh Nhà Hàng (`/restaurant/[id]/edit`)**:
  - Giao diện đơn hàng hiện tại là danh sách phẳng, khó theo dõi khi vào giờ cao điểm (20-50 đơn cùng lúc). Nhân viên bếp không phân biệt được đơn nào đang chờ nhận, đơn nào đang chế biến, đơn nào tài xế đã đến lấy.
  - Khi một món hết nguyên liệu, chủ quán phải bấm vào trang chỉnh sửa chi tiết của món đó, sửa checkbox rồi nhấn lưu. Quy trình này mất 4-5 bước và mất tới 20-30 giây.
  - Form tạo món mới (`create-food`) không cho người bán xem trước hình ảnh, badge giảm giá hiển thị như thế nào, dẫn đến lỗi vỡ ảnh hoặc tên quá dài ngoài trang chủ.
- **Kênh Quản Trị Hệ Thống (`/admin`)**:
  - Sidebar chiếm cố định 280px không thể thu gọn, làm hẹp không gian xem dữ liệu người dùng, đối tác, tài xế.
  - Breadcrumb bị đặt trong một thẻ Card riêng biệt nằm giữa trang, chiếm diện tích và gây đứt đoạn thị giác.
  - Chưa có phím tắt thao tác nhanh, Admin phải click qua lại giữa các menu để tìm một mã đơn hoặc một cửa hàng.

### 1.2. Mục tiêu định lượng cụ thể
| Chỉ số (Metric) | Hiện tại | Mục tiêu sau nâng cấp | Lợi ích mang lại |
| :--- | :--- | :--- | :--- |
| **Thời gian nhận & chuyển đơn vào bếp** | ~15 giây / đơn | **$\le$ 2 giây** (1 click / Phím Space) | Giảm thời gian chờ món cho thực khách |
| **Thao tác Bật/Tắt còn món** | 4 bước (~25 giây) | **1 click trực tiếp** ($\le$ 1 giây) | Tránh tình trạng khách đặt phải món đã hết |
| **Không gian hiển thị bảng dữ liệu Admin** | 70% chiều ngang | **$\ge$ 92%** (khi thu gọn Sidebar) | Hiển thị trọn vẹn 10-12 cột dữ liệu mà không cần cuộn ngang |
| **Tốc độ tra cứu thông tin (Search)** | 3-4 lần click | **$\le$ 1 giây** qua `Ctrl + K` | Admin xử lý khiếu nại tức thời |
| **Lỗi TypeScript & Lint** | Cảnh báo phân tán | **0 lỗi, 0 cảnh báo thừa** | Mã nguồn ổn định tuyệt đối |

---

## 2. HỆ THỐNG QUY CHUẨN THIẾT KẾ (DESIGN SYSTEM FOODEE 2.0)

### 2.1. Bảng màu Semantic Token
```css
/* Core Brand Colors */
--brand-primary: #059669;        /* emerald-600: Nút chính, thương hiệu, điểm nhấn */
--brand-primary-hover: #047857;  /* emerald-700 */
--brand-primary-soft: #ecfdf5;   /* emerald-50: Nền badge, hàng được chọn */

/* Status Colors */
--status-pending: #f59e0b;       /* amber-500: Đơn mới chờ xác nhận */
--status-cooking: #0284c7;       /* sky-600: Bếp đang chế biến */
--status-ready: #8b5cf6;         /* violet-500: Chờ tài xế nhận món */
--status-delivering: #6366f1;    /* indigo-500: Tài xế đang trên đường giao */
--status-success: #10b981;       /* emerald-500: Giao thành công / Hoàn tất */
--status-danger: #ef4444;        /* rose-500: Đơn bị hủy / Món hết hàng */

/* Neutral Surfaces */
--surface-canvas: #f8fafc;       /* slate-50: Nền toàn trang */
--surface-card: #ffffff;         /* Trắng thuần: Nền thẻ, panel, modal */
--surface-border: #e2e8f0;       /* slate-200: Đường viền mịn */
--text-title: #0f172a;           /* slate-900: Tiêu đề, trọng số 700 */
--text-body: #334155;            /* slate-700: Nội dung chính */
--text-muted: #64748b;           /* slate-500: Mô tả phụ, timestamp */
```

### 2.2. Typography & Khoảng cách (Spacing)
- **Font gia đình**: `Be Vietnam Pro` (Import qua `next/font/google`).
- **Phân cấp cỡ chữ**:
  - `Display / Page Title`: `text-2xl font-bold tracking-tight text-slate-900`
  - `Section Title`: `text-lg font-semibold text-slate-800`
  - `Card Header / Table Header`: `text-xs font-bold uppercase tracking-wider text-slate-500`
  - `Body Standard`: `text-sm text-slate-700 leading-relaxed`
  - `Caption / Badge`: `text-[11px] font-semibold`
- **Border Radius**:
  - Nút bấm & Input: `rounded-xl` (10px - 12px)
  - Card & Bảng: `rounded-2xl` (16px)
  - Modal / Dialog: `rounded-3xl` (24px)

---

## 3. CHI TIẾT THIẾT KẾ KÊNH NHÀ HÀNG (RESTAURANT OWNER PORTAL)

### 3.1. Hệ thống Điều phối & Bếp (KDS - Kitchen Display System Kanban)
*Tệp tin chính:* `web-client/src/app/(owner)/restaurant/[id]/edit/order-list/page.tsx`

#### A. Wireframe Layout giao diện KDS Kanban Board:
```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [🔊 Âm thanh: BẬT]  [Bộ lọc: Hôm nay ▼]  [Tìm mã đơn: Q ]     [⚡ Chế độ: [Kanban] | [Danh sách] ]      │
├───────────────────┬──────────────────────┬──────────────────────┬──────────────────────────────────────┤
│ 1. CHỜ XÁC NHẬN   │ 2. ĐANG NẤU (BẾP)    │ 3. CHỜ TÀI XẾ LẤY    │ 4. ĐANG GIAO / HOÀN TẤT              │
│ (3 đơn) [Cảnh báo]│ (4 đơn)              │ (2 đơn)              │ (18 đơn)                             │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────────────────────┤
│ ┌───────────────┐ │ ┌──────────────────┐ │ ┌──────────────────┐ │ ┌──────────────────────────────────┐ │
│ │ Đơn #FD-8921  │ │ │ Đơn #FD-8919     │ │ │ Đơn #FD-8914     │ │ │ Đơn #FD-8902 - 12:15             │ │
│ │ ⏱️ 2 phút trước │ │ │ ⏱️ 12 phút trước  │ │ │ Shipper: Lê Nam  │ │ │ 2 món • 145.000 đ                 │ │
│ │ • 2x Phở Bò   │ │ │ • 1x Cơm Tấm Sườn│ │ │ 🛵 59-P1 882.12  │ │ │ ✓ Hoàn tất                       │ │
│ │   (Ít bánh)   │ │ │   (Trứng lòng đào│ │ │ Đã đóng gói xong │ └──────────────────────────────────┘ │
│ │ • 1x Trà Sen  │ │ │ • 1x Canh Chua   │ │ │                  │ ┌──────────────────────────────────┐ │
│ │ Tổng: 135.000đ│ │ │ Ghi chú: Giao lẹ │ │ [ Chi tiết ]       │ │ Đơn #FD-8898 - 12:08             │ │
│ │               │ │                    │ └──────────────────┘ │ │ 3 món • 210.000 đ                 │ │
│ │ [ NHẬN ĐƠN ]  │ │ │ [ BÁO XONG MÓN ] │                      │ │ ✓ Hoàn tất                       │ │
│ │ [ HỦY ĐƠN ]   │ │ │ [ In phiếu bếp ] │                      │ └──────────────────────────────────┘ │
│ └───────────────┘ │ └──────────────────┘ │                      │                                      │
└───────────────────┴──────────────────────┴──────────────────────┴──────────────────────────────────────┘
```

#### B. Cơ chế vận hành & Kỹ thuật chi tiết:
1. **Âm thanh cảnh báo**:
   - Tích hợp âm thanh chuông đôi (Ding-Dong) âm lượng chuẩn qua `<audio>` hoặc Web Audio API. Khi nhận WebSocket event `orderCreated`, chuông tự động phát lại mỗi 15 giây cho đến khi nhân viên bấm "Nhận đơn".
2. **Cảnh báo quá hạn (SLA Alert)**:
   - Đơn ở cột *Chờ xác nhận* $> 3$ phút: Viền chuyển sang màu cam nhấp nháy (`animate-pulse border-amber-500`).
   - Đơn $> 5$ phút: Viền chuyển sang đỏ đậm (`border-rose-600 bg-rose-50/30`), badge hiển thị "⚠️ Quá giờ nhận!".
3. **Thao tác 1 chạm & Phím tắt bàn phím**:
   - Phím `Space` hoặc `Enter`: Nhận ngay đơn đầu tiên trong hàng đợi.
   - Nút `In phiếu bếp`: Kích hoạt `window.print()` với định dạng hóa đơn in nhiệt 80mm (Thermal POS format), chỉ in danh sách món ăn và ghi chú của khách.
4. **Xử lý lạc quan (Optimistic UI)**:
   - Khi bấm chuyển trạng thái, thẻ đơn hàng di chuyển tức thì sang cột tiếp theo trên UI trước khi API trả về, rollback kèm thông báo lỗi nếu mạng mất kết nối.

---

### 3.2. Quản lý Thực đơn & Trình soạn thảo Món ăn 2 Cột (WYSIWYG Live Preview)
*Tệp tin chính:* 
- `web-client/src/app/(owner)/restaurant/[id]/edit/food-list/page.tsx`
- `web-client/src/app/(owner)/restaurant/[id]/edit/food-list/create-food/page.tsx`
- `web-client/src/app/(owner)/restaurant/[id]/edit/food-list/update-food/[foodId]/page.tsx`

#### A. Bật/Tắt còn món nhanh (Quick Stock Switch):
Ngay tại bảng danh sách món (`food-list`), thay vì hiển thị badge tĩnh:
```tsx
// Cột trạng thái món ăn có Switch tương tác trực tiếp
<div className="flex items-center gap-2">
  <Switch 
    checked={food.isAvailable}
    onCheckedChange={(checked) => handleToggleAvailability(food.id, checked)}
    disabled={updatingId === food.id}
  />
  <span className={cn(
    "text-xs font-semibold",
    food.isAvailable ? "text-emerald-600" : "text-slate-400"
  )}>
    {food.isAvailable ? "Còn hàng" : "Hết hàng"}
  </span>
</div>
```
- Gọi trực tiếp mutation cập nhật trạng thái món ăn (`PATCH /foods/:id`), hiển thị `toast.success` trong góc màn hình.

#### B. Trình soạn thảo món ăn Split-Pane (Live Preview):
```
┌────────────────────────────────────────────────────────┬──────────────────────────────────────────┐
│ CỘT TRÁI: FORM NHẬP LIỆU CHI TIẾT (60%)                │ CỘT PHẢI: XEM TRƯỚC THỰC TẾ (40% - STICKY)│
├────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Tên món ăn:                                            │ 📱 HIỂN THỊ NGOÀI TRANG CHỦ:            │
│ [ Phở bò tái lăn đặc biệt Hà Nội              ]        │ ┌──────────────────────────────────────┐ │
│                                                        │ │ [             ẢNH MÓN ĂN           ] │ │
│ Danh mục:           Giá niêm yết:     Khuyến mãi:      │ │ │ 🏷️ -20% GIẢM      ⭐ 4.9 (150+)    │ │
│ [ Món nước ▼ ]      [ 65.000 đ ]      [ 20% ]          │ │ ──────────────────────────────────── │ │
│                                                        │ │ Phở bò tái lăn đặc biệt Hà Nội       │ │
│ Ảnh món ăn (Kéo thả hoặc tải lên MinIO):               │ │ 52.000 đ  ~~65.000 đ~~               │ │
│ ┌────────────────────────────────────────────────────┐ │ │ ⏱️ 15-20 phút  •  🔥 Bán chạy         │ │
│ │ 📷 Kéo thả ảnh món ăn chuẩn nét vào đây            │ │ │ [ 🛒 Thêm vào giỏ hàng ]          │ │
│ └────────────────────────────────────────────────────┘ │ └──────────────────────────────────────┘ │
│                                                        │                                          │
│ Mô tả món ăn:                                          │ 💡 Gợi ý hình ảnh:                       │
│ [ Bò xào lăn thơm phức tỏi, nước dùng ngọt thanh...]   │ • Kích thước tỉ lệ chuẩn 4:3 (800x600px) │
│                                                        │ • Chụp đủ sáng, cận cảnh để kích thích   │
│ Tùy chọn Topping (Thêm topping):                       │   vị giác người dùng.                    │
│ • Quẩy giòn (+5.000 đ)  [ Xóa ]                        │                                          │
│ • Trứng chần (+10.000 đ) [ Xóa ]                       │                                          │
│                                                        │                                          │
│ [ Lưu món ăn ]    [ Hủy bỏ ]                           │                                          │
└────────────────────────────────────────────────────────┴──────────────────────────────────────────┘
```

---

### 3.3. Quy trình Đăng ký & Onboarding Đối tác 4 Bước (`my-shop`)
*Tệp tin chính:* `web-client/src/app/(owner)/my-shop/page.tsx`

Thay thế form dài nguyên khối bằng thanh tiến trình trực quan (**Progress Stepper**):
1. **Bước 1: Thương hiệu quán**: Tên quán, SĐT liên hệ, Ảnh logo tròn (Avatar) và Ảnh bìa ngang (Banner), Mô tả ngắn gọn phong cách ẩm thực.
2. **Bước 2: Địa chỉ & Tọa độ Mapbox**: 
   - Thanh tìm kiếm địa chỉ tự động gợi ý qua Mapbox Geocoding.
   - Bản đồ tương tác trực quan cho phép kéo thả con ghim vị trí để lấy tọa độ chuẩn xác tuyệt đối đến từng mét.
3. **Bước 3: Vận hành & Giấy tờ**:
   - Cấu hình giờ mở cửa / đóng cửa các ngày trong tuần (có nút "Áp dụng cho cả tuần").
   - Tải lên ảnh Giấy phép đăng ký kinh doanh và Giấy chứng nhận Vệ sinh An toàn Thực phẩm.
4. **Bước 4: Hoàn tất & Kích hoạt**:
   - Hiển thị bản tóm tắt hồ sơ quán.
   - Nút `[ Gửi duyệt hồ sơ ]` kèm cam kết quy chuẩn dịch vụ của Foodee.

---

### 3.4. Báo cáo Doanh thu & Bản đồ Nhiệt Giờ Cao Điểm (`statistics`)
*Tệp tin chính:* `web-client/src/app/(owner)/restaurant/[id]/edit/statistics/page.tsx`

Bổ sung các thành phần trực quan:
1. **Biểu đồ nhiệt giờ cao điểm (Hourly Peak Heatmap)**:
   - Trục hoành là 24 giờ trong ngày (0h $\rightarrow$ 23h), trục tung là các ngày trong tuần (T2 $\rightarrow$ CN).
   - Màu sắc từ nhạt (xanh nhạt: ít khách) đến đậm (xanh ngọc sẫm: cực đông khách), giúp chủ quán tối ưu lịch ca làm việc của đầu bếp.
2. **Bảng phân tích món bán chạy & lợi nhuận**:
   - Cột: Xếp hạng (#1, #2, #3), Ảnh món, Tên món, Số lượng bán ra, Tổng doanh thu, Đánh giá trung bình.

---

## 4. CHI TIẾT THIẾT KẾ KÊNH QUẢN TRỊ HỆ THỐNG (ADMIN PANEL)

### 4.1. Khung Điều Hướng Đa Nhiệm: Collapsible Sidebar & Glassmorphism Topbar
*Tệp tin chính:* 
- `web-client/src/app/admin/(admin-panel)/layout.tsx`
- `web-client/src/components/ui/sidebar.tsx`

#### A. Cơ chế Thu Gọn Sidebar (Mini-mode):
```
CHẾ ĐỘ MỞ RỘNG (260px)              CHẾ ĐỘ THU GỌN (72px)
┌──────────────────────────────┐    ┌────────┐
│ [ Logo Foodee ]      [◀ Thu] │    │ [Logo] │
│ ──────────────────────────── │    │ [▶ Mở] │
│ 📊 Tổng quan                 │    │ ──────────────── │
│ 👥 Quản lý người dùng        │    │ 📊 (Hover Tooltip: Tổng quan)
│ 🏪 Quản lý cửa hàng          │    │ 👥 (Hover Tooltip: Người dùng)
│ 🍲 Quản lý món ăn            │    │ 🏪 (Hover Tooltip: Cửa hàng)
│ 📦 Quản lý đơn hàng          │    │ 🍲 (Hover Tooltip: Món ăn)
│ 🛵 Quản lý tài xế            │    │ 📦 (Hover Tooltip: Đơn hàng)
│ 🎟️ Quản lý khuyến mãi        │    │ 🛵 (Hover Tooltip: Tài xế)
│ 🛡️ Phân quyền & Vai trò      │    │ 🛡️ (Hover Tooltip: Phân quyền)
└──────────────────────────────┘    └────────┘
```
- Khi thu gọn, icon được căn giữa hoàn hảo, hỗ trợ Radix UI Tooltip bật sang phải hiển thị tên mục menu.
- Lưu trạng thái thu gọn vào `localStorage.getItem("admin_sidebar_collapsed")` để giữ nguyên trạng thái khi chuyển trang.

#### B. Thanh Topbar Kính Mờ Hợp Nhất (Sticky Topbar):
- Vị trí: `sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-card/85 px-6 backdrop-blur-md`.
- **Bên trái**: Nút toggle sidebar + Breadcrumb phẳng thanh thoát:  
  `Admin / Quản lý cửa hàng / Chi tiết quán`
- **Ở giữa**: Thanh tìm kiếm giả (nút bấm) kích hoạt Command Palette:  
  `[ 🔍 Tìm nhanh tài khoản, quán, đơn hàng...  Ctrl+K ]`
- **Bên phải**:
  - Đèn trạng thái hệ thống: `🟢 Server Online (v2.4)`
  - Chuông thông báo hoạt động hệ thống (System Alerts).
  - Avatar Admin + Dropdown menu (Hồ sơ cá nhân, Cài đặt hệ thống, Đăng xuất).

---

### 4.2. Thanh Tìm Kiếm Toàn Cục Siêu Tốc (Command Palette `Ctrl + K`)
*Tệp tin tạo mới:* `web-client/src/components/ui/command-palette.tsx`

Giao diện popup mở ra ở trung tâm màn hình khi người dùng nhấn `Ctrl + K` hoặc `Cmd + K`:
```
┌────────────────────────────────────────────────────────────────────────┐
│  🔍  Gõ từ khóa để tìm kiếm...                                   [ESC] │
├────────────────────────────────────────────────────────────────────────┤
│ ĐIỀU HƯỚNG NHANH                                                       │
│   📊 Đi tới Thống kê tổng quan                                         │
│   👥 Đi tới Quản lý người dùng                                         │
│   🏪 Đi tới Quản lý danh sách cửa hàng                                 │
│                                                                        │
│ CỬA HÀNG (STORES)                                                      │
│   🏪 Cơm Tấm Ba Ghiền - Quận Phú Nhuận       [Đang hoạt động]          │
│   🏪 Phở Thìn Lò Đúc - Quận 1                [Chờ duyệt hồ sơ]         │
│                                                                        │
│ ĐƠN HÀNG GẦN ĐÂY (ORDERS)                                              │
│   📦 Đơn #FD-9921 - Nguyễn Văn A (135.000 đ) [Chờ giao hàng]           │
│   📦 Đơn #FD-9920 - Trần Thị B   (250.000 đ) [Hoàn tất]               │
│                                                                        │
│ PHÍM TẮT: ↑↓ Chọn  •  Enter Mở trang  •  Esc Đóng                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3. Bảng Dữ Liệu Thông Minh (Smart Data Table: Sticky, Density, Export)
*Tệp tin chính:* `web-client/src/app/admin/(admin-panel)/_components/table.tsx`

Nâng cấp các tính năng cao cấp cho bảng dữ liệu:
1. **Sticky Header**: `thead` có class `sticky top-0 z-10 bg-slate-100/90 backdrop-blur`. Khi cuộn danh sách hàng ngàn dòng, thanh tiêu đề cột không bao giờ bị khuất.
2. **Density Switcher (Mật độ dòng)**:
   - Chế độ **Thoải mái (Comfortable)**: Padding `py-4`, hiển thị avatar to, badge rõ ràng.
   - Chế độ **Gọn gàng (Compact)**: Padding `py-2`, font chữ `text-xs`, hiển thị được 18-20 dòng trên 1 màn hình máy tính xách tay.
3. **Nút Xuất File Báo Cáo (Export Data)**:
   - Nút `[ 📥 Xuất Excel / CSV ]`: Xuất dữ liệu bảng hiện hành kèm tên cột tiếng Việt chuẩn UTF-8, phục vụ in ấn hoặc đối soát kế toán.
4. **Bộ Lọc Phân Loại Nhanh (Tab Pills)**:
   - Thanh tab nhanh phía trên bảng: `Tất cả (128) | Chờ duyệt (5) | Đang hoạt động (118) | Đã khóa (5)`.

---

### 4.4. Trung Tâm Điều Hành Executive Dashboard & Action Center
*Tệp tin chính:* `web-client/src/app/admin/(admin-panel)/page.tsx`

1. **Bộ 4 Thẻ KPI Tăng Trưởng**:
   - **Tổng doanh thu sàn (GMV)**: Giá trị VND, tỉ lệ tăng trưởng tuần $(\uparrow 14.2\%)$.
   - **Tổng đơn hàng hoàn tất**: Số lượng đơn, tỉ lệ thành công $(\uparrow 98.4\%)$.
   - **Cửa hàng đối tác**: Số quán hoạt động, số quán mới đăng ký trong tuần.
   - **Đội ngũ tài xế**: Số tài xế đang online bật nhận cuốc.
2. **Action Center (Hàng đợi xử lý khẩn cấp)**:
   - Đặt ngay góc trên bên phải dashboard:
     - 🔔 **5 Cửa hàng mới nộp hồ sơ chờ duyệt**: Có nút `Xem hồ sơ` và `Duyệt nhanh`.
     - ⚠️ **2 Đơn hàng bị khiếu nại**: Cần Admin can thiệp hoàn tiền.

---

## 5. CẤU TRÚC TỆP TIN & QUẢN LÝ DỮ LIỆU (FILE TREE & DATA ARCHITECTURE)

```
web-client/src/
├── app/
│   ├── (owner)/
│   │   ├── my-shop/
│   │   │   └── page.tsx                     # Form Wizard 4 bước đăng ký quán
│   │   └── restaurant/[id]/edit/
│   │       ├── layout.tsx                   # Layout quản trị quán (Header + Sidebar)
│   │       ├── _components/
│   │       │   ├── sidebar.tsx              # Sidebar menu đối tác
│   │       │   └── commom.tsx               # Form thông tin cơ bản
│   │       ├── order-list/
│   │       │   ├── page.tsx                 # KDS Kanban & Table view đơn hàng
│   │       │   └── _components/
│   │       │       ├── kitchen-kanban.tsx   # [MỚI] Component bảng Kanban 4 cột
│   │       │       └── order-detail-modal.tsx
│   │       ├── food-list/
│   │       │   ├── page.tsx                 # Danh sách món có Switch toggle còn/hết
│   │       │   ├── create-food/page.tsx     # [MỚI] Form 2 cột Live Preview tạo món
│   │       │   └── update-food/[foodId]/page.tsx # Form 2 cột cập nhật món
│   │       └── statistics/
│   │           └── page.tsx                 # Thống kê + Heatmap giờ cao điểm
│   └── admin/
│       ├── (admin-panel)/
│       │   ├── layout.tsx                   # Khung Admin (Sticky topbar + Breadcrumb)
│       │   ├── page.tsx                     # Executive Dashboard + Action Center
│       │   └── _components/
│       │       ├── table.tsx                # Smart Data Table (Sticky, Density)
│       │       ├── header.tsx               # Header trang chuẩn hóa
│       │       └── search-and-filter.tsx    # Thanh lọc đa năng
│       └── ...
└── components/
    └── ui/
        ├── sidebar.tsx                      # Admin Sidebar hỗ trợ Collapsible mode
        └── command-palette.tsx              # [MỚI] Popup tìm kiếm nhanh Ctrl+K
```

---

## 6. LỘ TRÌNH THỰC HIỆN TỪNG BƯỚC & TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

### Phase 1: Hoàn thiện Kênh Nhà Hàng (Dự kiến 3 bước)
- [ ] **Bước 1.1**: Xây dựng component `kitchen-kanban.tsx` và tích hợp vào `order-list/page.tsx`. Thêm chuông cảnh báo âm thanh và nút nhận đơn 1 chạm.
  - *Tiêu chí nghiệm thu*: Bấm chuyển trạng thái đơn mượt mà, nhận đơn mới qua websocket lập tức xuất hiện ở cột 1 và phát chuông.
- [ ] **Bước 1.2**: Thêm `Switch` bật/tắt còn món trực tiếp tại `food-list/page.tsx`.
  - *Tiêu chí nghiệm thu*: Gạt switch cập nhật ngay `isAvailable` lên server mà không reload trang.
- [ ] **Bước 1.3**: Tái cấu trúc trang `create-food` và `update-food` thành giao diện 2 cột có Card Live Preview.
  - *Tiêu chí nghiệm thu*: Gõ tên, nhập giá, chọn ảnh đến đâu thì card bên phải cập nhật tức thì đến đó.

### Phase 2: Hiện đại hóa Khung Admin Panel (Dự kiến 2 bước)
- [ ] **Bước 2.1**: Nâng cấp `components/ui/sidebar.tsx` và `admin/(admin-panel)/layout.tsx` với chế độ thu gọn Mini Sidebar (72px) và Topbar kính mờ.
  - *Tiêu chí nghiệm thu*: Bấm nút thu gọn/mở rộng chuyển động mượt mà bằng CSS transitions, ghi nhớ trạng thái sau khi refresh F5.
- [ ] **Bước 2.2**: Xây dựng `command-palette.tsx` kích hoạt bằng tổ hợp phím `Ctrl + K`.
  - *Tiêu chí nghiệm thu*: Bấm `Ctrl + K` bật modal tìm kiếm, hỗ trợ phím mũi tên lên/xuống và phím `Enter` để nhảy trang.

### Phase 3: Nâng cấp Smart Table & Dashboard (Dự kiến 2 bước)
- [ ] **Bước 3.1**: Cập nhật `table.tsx` với Sticky Header, tùy chọn Compact/Comfortable density và nút xuất file Excel.
  - *Tiêu chí nghiệm thu*: Cuộn danh sách dài thì tiêu đề cột vẫn cố định; Bấm xuất Excel tải về file sạch sẽ.
- [ ] **Bước 3.2**: Thiết kế lại Dashboard `/admin/page.tsx` với Action Center duyệt quán mới.
  - *Tiêu chí nghiệm thu*: Hiển thị trực quan các hồ sơ quán đang chờ duyệt kèm nút phê duyệt nhanh.

### Phase 4: Kiểm thử toàn diện & Đóng gói
- [ ] Chạy `npm run typecheck` $\rightarrow$ Đạt 0 lỗi.
- [ ] Chạy `npm run lint` $\rightarrow$ Đạt 0 lỗi.
- [ ] Chạy `npm run build` $\rightarrow$ Thành công biên dịch toàn bộ các trang.
