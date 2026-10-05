# 🍲 Foodee Core API & Background Worker

> Trung tâm xử lý nghiệp vụ backend (Core Backend & Background Worker) cho hệ sinh thái giao đồ ăn **Foodee**, được xây dựng trên nền tảng **NestJS**, **TypeORM**, **PostgreSQL**, **Redis / BullMQ** theo kiến trúc module hóa cao cấp **Feature-Sliced Architecture**.

---

## 🏗️ 1. Tổng quan Kiến trúc Hệ thống

Mã nguồn được tổ chức 100% theo kiến trúc **Feature-Sliced Modular Architecture** tại thư mục `src/features/`. Mỗi tính năng (Feature) là một đơn vị độc lập, tự đóng gói (self-contained), bảo toàn ranh giới nghiệp vụ nghiêm ngặt và chỉ giao tiếp với các feature khác thông qua `public-api.ts`.

```text
core-api/src/
├── features/                  # Toàn bộ Domain Business Logic
│   ├── analytics/             # Báo cáo, thống kê, projection doanh thu sàn & đối tác
│   ├── auth/                  # Xác thực người dùng, JWT, OTP, Google OAuth, Driver Login
│   ├── communications/        # Tin nhắn trực tiếp (Messenger) và AI Chatbot Hub
│   ├── delivery/              # Quản lý giao hàng, điều phối shipper, tính thu nhập tài xế
│   ├── locations/             # Quản lý sổ địa chỉ khách hàng & tích hợp Mapbox Geocoding
│   ├── menu/                  # Món ăn (Food), danh mục (Category) và hệ thống Topping
│   ├── notifications/         # Thông báo đa kênh (In-app, Firebase Push, Outbox Pattern)
│   ├── orders/                # State machine đơn hàng, tính giá server-side, snapshots
│   ├── payments/              # Cổng thanh toán MoMo / VNPay, Webhook Idempotency & Đối soát
│   ├── promotions/            # Khuyến mãi, voucher giảm giá, quản lý lượt đổi mã (Redemptions)
│   ├── restaurants/           # Hồ sơ quán, onboarding đối tác, thẩm định duyệt quán
│   ├── reviews/               # Đánh giá món ăn & tài xế với ràng buộc hoàn tất đơn hàng
│   ├── system-constraints/    # Cấu hình giới hạn hệ thống & tham số vận hành
│   ├── users/                 # Quản lý tài khoản, hồ sơ và phân quyền RBAC (Role-Based Access)
│   └── features.module.ts     # Module tổng hợp liên kết toàn bộ features
├── infra/                     # Adapters hạ tầng kỹ thuật (Infrastructure Layer)
│   ├── cache/                 # Redis Cache & PubSub (ioredis)
│   ├── database/              # Quản lý kết nối TypeORM, Connection Pool & Entity Registry
│   ├── logging/               # Structured JSON Logger (Pino) & HTTP Request Redaction
│   ├── mapbox/                # Định vị địa lý, Geocoding & tính ma trận khoảng cách
│   ├── minio/                 # S3-compatible Object Storage (ảnh món ăn, giấy phép quán)
│   ├── payment-gateways/      # Adapter cổng thanh toán VNPay & MoMo Sandbox/Production
│   └── queue/                 # BullMQ Queue Service & Background Processors
├── entities/                  # TypeORM Entities toàn hệ thống (Mapped to domain features)
├── common/                    # Guards, Interceptors, Filters, Decorators & Request Context
├── config/                    # Cấu hình TypeORM, MinIO, Firebase, CORS & Security Guards
├── migrations/                # 37+ File migrations cấu trúc bảng & dữ liệu mẫu (Seed Data)
├── main.ts                    # Entrypoint HTTP Core API Server (Port 3001, Swagger: /api)
└── worker.ts                  # Entrypoint Background Queue Worker (Xử lý hàng đợi BullMQ)
```

---

## ⚙️ 2. Yêu cầu Hệ thống

* **Node.js:** `>= 20.x`
* **PostgreSQL:** `>= 16`
* **Redis:** `>= 7` (Dùng cho Cache & BullMQ Queue)
* **MinIO:** S3-compatible Object Storage (Port 9000)
* **Docker & Docker Compose** (Khuyến nghị cho môi trường development và staging)

---

## 🚀 3. Hướng dẫn Cài đặt & Khởi chạy

### 3.1. Cài đặt Dependencies

```bash
cd core-api
npm install
```

### 3.2. Cấu hình Biến môi trường (`.env`)

Sao chép từ file mẫu:
```bash
cp .env.example .env
```

Các nhóm biến môi trường quan trọng:

| Nhóm | Biến | Mô tả | Mặc định |
|:---|:---|:---|:---|
| **Server** | `PORT` | Cổng HTTP của Core API | `3001` |
| | `API_URL` | URL công khai của API | `http://localhost:3001` |
| | `FRONTEND_URL` | URL Frontend được phép gọi CORS | `http://localhost:3000` |
| **Database** | `DB_HOST` | Địa chỉ máy chủ PostgreSQL | `localhost` |
| | `DB_PORT` | Cổng PostgreSQL | `5432` |
| | `DB_USERNAME` | Tên đăng nhập database | `postgres` |
| | `DB_PASSWORD` | Mật khẩu database | `your_password` |
| | `DB_NAME` | Tên database | `foodee_db` |
| | `DB_POOL_MAX` | Số kết nối tối đa trong pool | `10` |
| **Cache & Queue**| `REDIS_HOST` | Địa chỉ máy chủ Redis | `localhost` |
| | `REDIS_PORT` | Cổng Redis | `6379` |
| **Security** | `JWT_SECRET` | Khóa bí mật ký JWT Token | `your_super_secret_jwt_key` |
| | `JWT_EXPIRATION` | Thời hạn sống của JWT Token | `3600s` (hoặc `7d`) |
| **MinIO Storage**| `MINIO_ENDPOINT` | Địa chỉ MinIO Server | `localhost` |
| | `MINIO_PORT` | Cổng dịch vụ MinIO | `9000` |
| | `MINIO_BUCKET` | Tên bucket lưu trữ ảnh | `foodee` |
| | `MINIO_PUBLIC_ENDPOINT` | URL công khai để client tải ảnh | `http://localhost:9000` |
| **Microservices**| `AI_SERVER_URL` | Địa chỉ dịch vụ Chatbot AI | `http://localhost:8000` |
| | `AI_SERVICE_TOKEN` | Token bí mật gọi Chatbot (khớp với chatbot-service) | `your_random_token` |
| | `FOOD_AI_URL` | Địa chỉ dịch vụ Vision AI nhận diện món | `http://localhost:5000` |
| **Bản đồ** | `MAPBOX_ACCESS_TOKEN` | Token Mapbox tính khoảng cách & geocoding | — |
| **Thanh toán** | `MOMO_*` | Bộ cấu hình MoMo Gateway Sandbox | — |
| | `VNPAY_*` | Bộ cấu hình VNPay Gateway Sandbox | — |

---

### 3.3. Quản lý Cơ sở Dữ liệu & Migrations

Thư mục `src/migrations/` chứa **37 migrations** đã được thiết lập sẵn, bao gồm cấu trúc bảng toàn hệ thống và các tệp dữ liệu mẫu (Seed Data) cho 10+ nhà hàng, thực đơn, topping và tài khoản admin:

```bash
# 1. Chạy toàn bộ migrations để tạo bảng và nạp dữ liệu mẫu
npm run migration:run

# 2. Xem danh sách migrations đã áp dụng / chưa áp dụng
npm run migration:show

# 3. Rollback migration gần nhất nếu cần hoàn tác
npm run migration:revert

# 4. Tự động sinh migration mới khi thay đổi Entity
npm run migration:generate -- -n <TenMigration>
```

---

### 3.4. Khởi chạy Ứng dụng

#### Chế độ API Server (HTTP REST & Swagger):
```bash
# Môi trường Development (tự động reload khi sửa code):
npm run start:dev

# Môi trường Production:
npm run build
npm run start:prod
```
* **Core API Endpoint:** `http://localhost:3001`
* **Swagger API Documentation:** `http://localhost:3001/api`
* **Health Check:** `http://localhost:3001/health`

#### Chế độ Background Worker (Xử lý hàng đợi BullMQ):
Worker chạy tách biệt khỏi API server để đảm bảo tải nặng không ảnh hưởng đến độ trễ HTTP request:
```bash
npm run start:worker
```
*Worker phụ trách: Xử lý Outbox Events, gửi thông báo đẩy (Push Notifications), tính toán thu nhập đối tác và đối soát trạng thái thanh toán.*

---

## 🔗 4. Tích hợp Hệ sinh thái Microservices

`core-api` đóng vai trò là nhạc trưởng trung tâm kết nối toàn bộ các dịch vụ:

```text
                     ┌─────────────────────────┐
                     │   Next.js Web Client    │
                     │  (Customer/Owner/Admin) │
                     └────────────┬────────────┘
                                  │ HTTP / JWT
                                  ▼
┌──────────────────┐       ┌──────────────┐       ┌──────────────────┐
│  Chatbot Service │ ◄───► │   Core API   │ ◄───► │  Vision Service  │
│ (FastAPI / LLM)  │       │  (NestJS)    │       │ (Flask / LiteRT) │
└──────────────────┘       └──────┬───────┘       └──────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ PostgreSQL 16    │     │ Redis 7 / BullMQ │     │ MinIO S3 Storage │
│ (TypeORM Data)   │     │ (Cache & Worker) │     │ (Media Assets)   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

1. **AI Chatbot Service (`/api/chat`):** Chuyển tiếp câu thoại của người dùng và danh sách thực đơn tóm tắt sang `chatbot-service` qua header `X-AI-Service-Token` để nhận phản hồi và bóc tách đơn hàng.
2. **AI Vision Service:** Kết nối kiểm tra tình trạng dịch vụ và hỗ trợ tìm kiếm quán ăn theo nhãn 30 món ăn Việt Nam.
3. **MinIO Object Storage:** Tự động tạo signed URLs và quản trị tập trung hình ảnh đại diện, banner quán ăn và thực đơn.
4. **Cổng thanh toán MoMo & VNPay:** Xử lý luồng thanh toán chuyển hướng, kiểm tra chữ ký số IPN Webhook chống giả mạo và bảo đảm tính Idempotency.

---

## 📜 5. Tổng quan API & Tài liệu Chi tiết

Tài liệu chi tiết hơn 100+ endpoints với đầy đủ tham số request/response được ghi nhận tại file [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

### Các Nhóm Endpoint Chính:
* **`/auth/*`:** Đăng ký, đăng nhập (Email, Google OAuth, Tài xế), gửi mã OTP, cấp lại mật khẩu.
* **`/foods/*` & `/category/*`:** Quản lý món ăn, phân trang, lọc theo giá/danh mục, quản lý Topping.
* **`/restaurant/*`:** Xem thực đơn nhà hàng, cập nhật thông tin quán, quản lý giờ hoạt động.
* **`/orders/*`:** Tạo đơn hàng, áp dụng mã khuyến mãi, cập nhật trạng thái đơn (State Machine).
* **`/payment/*`:** Khởi tạo giao dịch thanh toán MoMo/VNPay, xử lý Webhook IPN đối soát.
* **`/delivery/*` & `/shippers/*`:** Tiếp nhận đơn giao hàng, cập nhật vị trí GPS shipper thời gian thực.
* **`/reviews/*`:** Đánh giá món ăn và chất lượng dịch vụ shipper sau khi đơn hàng hoàn tất.
* **`/dashboard/*` & `/analytics/*`:** Thống kê doanh thu, báo cáo hiệu suất tài xế cho Admin và Chủ quán.
* **`/chat` & `/messenger/*`:** Hội thoại trực tiếp và gửi lệnh đặt món cho trợ lý ảo.

---

## 🛡️ 6. Quy chuẩn Ranh giới Kiến trúc (Architecture Guidelines)

Hệ thống tuân thủ các nguyên tắc thiết kế phần mềm nghiêm ngặt:

1. **Giao tiếp Cross-Feature:** Mọi feature muốn gọi tính năng của feature khác bắt buộc phải import thông qua `src/features/<feature>/public-api.ts`. Tuyệt đối cấm import sâu vào các file nội bộ của feature khác.
2. **Quyền sở hữu Entity (Single Responsibility):** Mỗi Entity trong database chỉ thuộc quyền quản lý của một Feature duy nhất. Các feature khác chỉ được sử dụng Snapshot DTO hoặc Port công khai.
3. **Không dùng `forwardRef()`:** Giải quyết phụ thuộc vòng (Circular Dependencies) thông qua Interface Port, Facade Pattern hoặc Event-Driven Outbox Pattern.
4. **Chống lỗi BOLA / IDOR:** Mọi endpoint nhạy cảm đều có Guard kiểm tra quyền sở hữu (`ownerId === actor.userId` hoặc quyền `ADMINISTRATOR`).
5. **Đảm bảo Idempotency:** Mọi giao dịch thanh toán, webhook đối soát và xử lý sự kiện đều có cơ chế chống xử lý lặp lại (Idempotent Event Processing).

---

## 🧪 7. Kiểm thử Tự động (Testing)

Dự án trang bị đầy đủ các tầng kiểm thử bằng Jest:

```bash
# 1. Chạy toàn bộ Unit Tests
npm run test:unit

# 2. Chạy Integration Tests
npm run test:integration

# 3. Chạy End-to-End (E2E) Tests
npm run test:e2e

# 4. Kiểm tra độ bao phủ mã nguồn (Coverage)
npm run test:cov

# 5. Kiểm tra chất lượng mã nguồn & ranh giới kiến trúc (Linting)
npm run lint
npm run format:check
```
