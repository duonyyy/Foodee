# 🛍️ Foodee Web Client (Next.js 15 Frontend)

> Nền tảng ứng dụng web hiện đại cho hệ sinh thái giao đồ ăn **Foodee**, được xây dựng trên **Next.js 15 (App Router)**, **React 19**, **TypeScript** và **Tailwind CSS**. Tích hợp đa phân hệ người dùng (Khách hàng, Chủ quán và Quản trị viên), kết hợp tính năng **Tìm kiếm món ăn bằng Camera AI** và **Trợ lý ảo đặt món tự nhiên**.

---

## 🏛️ 1. Các Phân hệ Người dùng & Tính năng Cốt lõi

Ứng dụng được thiết kế theo mô hình **All-in-One Multi-portal** với ba phân hệ chính:

### 1.1. Phân hệ Khách hàng (`(main)`)
* **Khám phá ẩm thực thông minh (`/`):** Hero search tìm kiếm món ăn/quán ngon, danh mục phân loại, các chương trình khuyến mãi và quán được đề xuất gần nhất.
* **Tìm kiếm món ăn bằng Ảnh & Camera AI (`ImageSearchModal`):** Người dùng có thể tải ảnh hoặc chụp ảnh trực tiếp từ camera. Hệ thống kết nối với **Vision Service** để nhận diện 30 món ăn Việt Nam, hiển thị bounding box tương tác và chuyển tiếp ngay đến danh sách quán phục vụ món đó.
* **Trợ lý ảo đặt món AI (`ChatWidget`):** Widget trò chuyện thông minh nổi ở góc màn hình. Cho phép tìm kiếm món ăn bằng ngôn ngữ tự nhiên, hiển thị thẻ món ăn (`FoodCard`), và hỗ trợ quy trình chốt đơn hàng từng bước (`OrderCard`).
* **Bản đồ tương tác Mapbox (`/map`):** Định vị GPS tự động, tìm quán ăn xung quanh trên bản đồ số Mapbox và tính toán khoảng cách/phí giao hàng chuẩn xác.
* **Thực đơn nhà hàng & Tùy biến món (`/restaurant/[id]`, `/food/[id]`):** Xem danh mục món, lựa chọn kích cỡ (Size), danh sách Topping phong phú và ghi chú cho quán.
* **Giỏ hàng gom nhóm (`GroupedCart` & `CartDrawer`):** Tự động phân chia giỏ hàng theo từng nhà hàng độc lập, tính toán giá server-side, áp dụng voucher khuyến mãi.
* **Thanh toán đa kênh (`/checkout`):** Hỗ trợ ví MoMo, VNPay và thanh toán tiền mặt (COD).
* **Theo dõi đơn hàng thời gian thực (`/order/[id]`):** Cập nhật trạng thái chế biến món ăn và lộ trình tài xế giao hàng.
* **Quản lý tài khoản & Sổ địa chỉ (`/profile`):** Quản lý hồ sơ, lịch sử giao dịch và danh sách địa chỉ giao hàng thường dùng.

### 1.2. Phân hệ Chủ quán / Đối tác Nhà hàng (`(owner)`)
* **Kênh quản lý quán (`/owner/my-shop`):** Bật/tắt trạng thái mở cửa của quán, cập nhật thông tin giới thiệu, giờ hoạt động và ảnh bìa qua MinIO.
* **Quản lý Thực đơn & Topping:** Thêm mới, chỉnh sửa giá bán, tải ảnh món ăn, thiết lập danh mục món và các nhóm Topping đi kèm.
* **Tiếp nhận đơn hàng Realtime:** Nhận thông báo âm thanh và pop-up tức thì khi có đơn đặt món mới, xác nhận chuẩn bị món và bàn giao cho tài xế.

### 1.3. Phân hệ Quản trị viên Sàn (`/admin`)
* **Dashboard thống kê:** Biểu đồ doanh thu (Chart.js), phân tích số lượng đơn hàng, tăng trưởng khách hàng và nhà hàng theo chu kỳ.
* **Kiểm duyệt & Quản lý Nhà hàng (`/admin/stores`):** Thẩm định hồ sơ đối tác quán mới đăng ký lên sàn, duyệt hoặc khóa nhà hàng.
* **Quản lý Thực đơn & Danh mục (`/admin/foods`, `/admin/categories`):** Giám sát toàn bộ món ăn và quản lý danh mục ẩm thực sàn.
* **Quản lý Đơn hàng & Tài xế (`/admin/orders`, `/admin/shippers`):** Điều phối giao vận, giám sát trạng thái đơn hàng toàn hệ thống.
* **Chiến dịch Khuyến mãi (`/admin/promotions`):** Tạo và phân phối mã giảm giá, voucher toàn sàn hoặc theo từng thương hiệu.
* **Phân quyền & Tài khoản (`/admin/role`, `/admin/users`):** Kiểm soát phân quyền RBAC (`super_admin`, `administrator`).

---

## 🏗️ 2. Cấu trúc Thư mục Dự án

```text
web-client/
├── src/
│   ├── app/
│   │   ├── (main)/            # Route Group cho Khách hàng
│   │   │   ├── _components/   # Component riêng: ImageSearch, CartDrawer, HeroSearch,...
│   │   │   ├── checkout/      # Trang đặt hàng & thanh toán
│   │   │   ├── food/          # Chi tiết món ăn & chọn topping
│   │   │   ├── map/           # Bản đồ số tìm quán ăn Mapbox
│   │   │   ├── messenger/     # Khung chat tin nhắn trực tiếp
│   │   │   ├── order/         # Theo dõi lộ trình & lịch sử đơn hàng
│   │   │   ├── profile/       # Hồ sơ cá nhân & sổ địa chỉ
│   │   │   ├── restaurant/    # Trang thực đơn nhà hàng
│   │   │   ├── search/        # Tìm kiếm món ăn & bộ lọc đa tiêu chí
│   │   │   └── page.tsx       # Trang chủ sàn Foodee
│   │   ├── (owner)/           # Route Group cho Chủ quán (/owner/my-shop)
│   │   ├── admin/             # Route Group cho Super Admin (/admin/...)
│   │   ├── api/               # Next.js Route Handlers
│   │   │   ├── auth/          # Callback OAuth & kiểm tra session
│   │   │   ├── chat/          # Proxy gọi sang NestJS AI Chatbot
│   │   │   └── media/         # Upload & Delete ảnh thông qua MinIO Storage
│   │   ├── layout.tsx         # Root Layout, font, Provider & Toaster
│   │   └── not-found.tsx      # Trang 404 tùy biến
│   ├── components/            # UI Components dùng chung
│   │   ├── common/            # ChatWidget, Map, DatePicker
│   │   │   └── chatbot/       # Toàn bộ UI component của AI Chatbot (FoodCard, OrderCard,...)
│   │   ├── ui/                # Thư viện component nguyên tử (Button, Card, Dialog, Input,...)
│   │   ├── footer.tsx         # Chân trang sàn
│   │   └── navigation.tsx     # Thanh điều hướng chính
│   ├── context/               # React Context Providers
│   │   ├── auth-context.tsx   # Quản lý đăng nhập, JWT token & Google OAuth
│   │   ├── cart-context.tsx   # Quản lý giỏ hàng gom nhóm đa quán
│   │   ├── geolocation-context.tsx # Quản lý vị trí GPS & Mapbox Geocoding
│   │   └── modal-context.tsx  # Điều khiển đóng/mở AuthModal, FoodModal
│   ├── hooks/                 # Custom React Hooks
│   ├── lib/                   # Utility helpers, MinIO client & cấu hình chung
│   ├── middleware.ts          # Middleware bảo mật phân quyền RBAC & route protection
│   └── styles/                # Global CSS & Tailwind configuration
├── tests/                     # Kiểm thử Tự động E2E (Playwright)
│   └── e2e/                   # 10 kịch bản test: Home, Cart, Flow, Dashboard, Visual,...
├── Dockerfile                 # Multi-stage production build (Node 20 Alpine, standalone)
├── docker-compose.yml         # Container orchestration riêng cho frontend
├── env.local.example          # File mẫu cấu hình biến môi trường
├── package.json               # Dependencies & scripts thực thi
└── tailwind.config.ts         # Cấu hình màu sắc, animation & token thiết kế
```

---

## 🛠️ 3. Công nghệ & Thư viện Sử dụng

* **Core:** Next.js 15 (App Router, Turbopack, Standalone Output), React 19, TypeScript 5.
* **Styling & UI Kit:** Tailwind CSS v3.4, Radix UI Primitives, Lucide React, Headless UI, Sonner (Toast notifications), Vaul (Drawer).
* **Bản đồ & Định vị:** Mapbox GL (`mapbox-gl`), Mapbox GL Geocoder.
* **Biểu đồ & Dashboard:** Chart.js, React-Chartjs-2.
* **Lưu trữ & Media:** MinIO S3-compatible Client (quản trị tập trung hình ảnh).
* **Kiểm thử:** Playwright E2E Testing Suite.

---

## ⚙️ 4. Cấu hình Biến Môi trường (`.env.local`)

Sao chép từ file mẫu:
```bash
cp env.local.example .env.local
```

### 4.1. Biến Phía Trình duyệt (`NEXT_PUBLIC_*` — Biên dịch lúc Build):
| Biến môi trường | Ý nghĩa & Mô tả | Giá trị Mặc định |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | URL kết nối tới NestJS Core API Backend | `http://localhost:3001` |
| `NEXT_PUBLIC_FOOD_AI_URL` | URL kết nối tới Vision AI Service (Nhận diện món qua ảnh) | `http://localhost:5000` |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | URL Callback đăng nhập Google OAuth | `http://localhost:3000/api/auth/callback/google` |
| `NEXT_PUBLIC_CLIENT_ID` | Google Client ID dùng cho xác thực tài khoản | — |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Token bản đồ Mapbox để render bản đồ và geocoding | — |

### 4.2. Biến Server-Side (Next.js Node.js Runtime & MinIO Storage):
| Biến môi trường | Ý nghĩa & Mô tả | Giá trị Mặc định |
|:---|:---|:---|
| `INTERNAL_API_URL` | URL gọi nội bộ tới backend trong Docker network để xác thực token | `http://localhost:3001` (hoặc `http://api:3001`) |
| `MINIO_ENDPOINT` | Địa chỉ máy chủ MinIO Object Storage | `localhost` (hoặc `minio`) |
| `MINIO_PORT` | Cổng dịch vụ MinIO | `9000` |
| `MINIO_USE_SSL` | Bật/tắt giao thức SSL/HTTPS cho MinIO | `false` |
| `MINIO_ACCESS_KEY` | Access Key kết nối MinIO (phải khớp với backend) | — |
| `MINIO_SECRET_KEY` | Secret Key kết nối MinIO (phải khớp với backend) | — |
| `MINIO_BUCKET` | Tên Bucket chứa ảnh media | `foodee` |
| `MINIO_PUBLIC_ENDPOINT` | URL công khai để trình duyệt xem ảnh MinIO | `http://localhost:9000` |

---

## 🚀 5. Hướng dẫn Cài đặt & Khởi chạy

### 5.1. Chạy trên Môi trường Local (Node.js)

#### 1. Yêu cầu:
* Node.js `>= 20.x`
* npm `>= 10.x`

#### 2. Cài đặt dependencies:
```bash
npm install
```

#### 3. Chạy môi trường phát triển (Development):
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

#### 4. Các lệnh Build cho Môi trường Production:
```bash
# Build chuẩn Next.js
npm run build

# Build tối ưu bộ nhớ RAM cho server cấu hình thấp (1GB RAM)
npm run build:minimal

# Chạy server production sau khi build
npm run start
```

---

### 5.2. Chạy với Docker & Docker Compose

Dự án đã cấu hình sẵn Dockerfile Multi-stage tối ưu dung lượng (chỉ giữ lại bản `standalone` xuất từ Next.js) và chạy dưới user không đặc quyền `nextjs`.

#### Chạy độc lập Frontend Container:
```bash
# Build và chạy ngầm
docker compose up -d --build

# Xem log container
docker compose logs -f foodee-fe

# Dừng container
docker compose down
```

> [!NOTE]
> Các biến `NEXT_PUBLIC_*` bắt buộc phải truyền qua `args` trong `docker-compose.yml` hoặc `--build-arg` lúc `docker build` vì Next.js đóng gói các giá trị này vào mã nguồn HTML/JS tĩnh trong quá trình build.

---

## 🛡️ 6. Bảo mật & Middleware Phân quyền (RBAC)

File [`src/middleware.ts`](src/middleware.ts) đóng vai trò cổng kiểm soát truy cập (Gatekeeper) tại edge:
* **Bảo vệ tuyến `/admin/*`:** Kiểm tra token người dùng gửi tới backend endpoint `/role/user-role-and-permission`. Chỉ cho phép người dùng có quyền `administrator` hoặc `super_admin` truy cập. Nếu không hợp lệ sẽ tự động điều hướng sang `/unauthorized`.
* **Bảo vệ tuyến `/owner/*`:** Kiểm tra quyền chủ cửa hàng thông qua `/auth/check`. Chặn mọi truy cập trái phép vào trang chỉnh sửa thực đơn và nhận đơn của quán.
* **Bảo vệ các tác vụ Khách hàng:** Tự động yêu cầu đăng nhập đối với các luồng thanh toán `/checkout`, xem lịch sử đơn hàng `/order` và hồ sơ cá nhân `/profile`.

---

## 🧪 7. Kiểm thử Tự động E2E (Playwright Test Suite)

Thư mục `tests/e2e/` chứa 10 bộ kịch bản kiểm thử toàn diện từ giao diện đến luồng nghiệp vụ:

```bash
# Chạy toàn bộ các bài kiểm thử E2E Playwright
npm run test:e2e

# Chạy với giao diện đồ họa trực quan (UI Mode)
npx playwright test --ui

# Chạy riêng kịch bản luồng giỏ hàng và đặt món
npx playwright test tests/e2e/phase3-cart.spec.ts
```
