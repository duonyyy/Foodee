# 🍲 Foodee Core API

> Backend dịch vụ trung tâm (Core API & Background Worker) cho nền tảng giao đồ ăn **Foodee**, được xây dựng trên nền tảng **NestJS**, **TypeORM**, **PostgreSQL** và kiến trúc **Feature-Sliced Modular Architecture**.

---

## 🏗️ 1. Tổng quan Kiến trúc

Hệ thống được tổ chức 100% theo kiến trúc **Feature-Sliced Architecture** tại thư mục `src/features/`. Mỗi tính năng (Feature) là một đơn vị độc lập, tự đóng gói (self-contained) và chỉ giao tiếp với các feature khác thông qua `public-api.ts`.

```text
core-api/src/
├── features/                  # Toàn bộ domain logic nghiệp vụ
│   ├── analytics/             # Báo cáo, thống kê, projection doanh thu
│   ├── auth/                  # Xác thực người dùng, JWT, OTP, Google OAuth
│   ├── communications/        # Tin nhắn trực tiếp (Messenger) và AI Chatbot
│   ├── delivery/              # Quản lý giao hàng, điều phối shipper, chứng chỉ tài xế
│   ├── locations/             # Quản lý sổ địa chỉ giao hàng của khách
│   ├── menu/                  # Món ăn (Food), danh mục (Category), Topping
│   ├── notifications/         # Thông báo đa kênh (In-app, push, outbox)
│   ├── orders/                # Đơn hàng, tính giá server-side, state machine
│   ├── payments/              # Cổng thanh toán MoMo / VNPay, Webhook, đối soát Outbox
│   ├── promotions/            # Khuyến mãi, mã giảm giá, voucher
│   ├── restaurants/           # Quản lý nhà hàng, onboarding hồ sơ quán, duyệt đối tác
│   ├── reviews/               # Đánh giá món ăn và shipper
│   ├── system-constraints/    # Cấu hình ràng buộc hệ thống
│   ├── users/                 # Quản lý người dùng, hồ sơ, phân quyền RBAC
│   └── features.module.ts     # Module tổng hợp toàn bộ features
├── infra/                     # Adapter hạ tầng kỹ thuật
│   ├── cache/                 # Redis Cache & PubSub
│   ├── database/              # TypeORM & PostgreSQL connection management
│   ├── logging/               # Logging chuẩn hóa & redact thông tin nhạy cảm
│   ├── mapbox/                # Định vị, tính khoảng cách địa lý
│   ├── minio/                 # S3-compatible Object Storage (ảnh món ăn, chứng chỉ)
│   ├── payment-gateways/      # Adapter cổng thanh toán VNPay & MoMo
│   └── queue/                 # BullMQ Queue Service
├── entities/                  # TypeORM Entities toàn hệ thống
├── common/                    # Guards, Interceptors, Filters, Decorators dùng chung
├── config/                    # Cấu hình TypeORM, MinIO, Firebase Admin
├── main.ts                    # Entrypoint HTTP Core API (Port 3001)
└── worker.ts                  # Entrypoint Background Worker
```

---

## ⚙️ 2. Yêu cầu Hệ thống

- **Node.js:** >= 20.x
- **PostgreSQL:** >= 16
- **Redis:** >= 7 (dùng cho Cache & BullMQ Queue)
- **MinIO:** S3-compatible Object Storage
- **Docker & Docker Compose** (tùy chọn nhưng khuyến nghị)

---

## 🚀 3. Hướng dẫn Cài đặt & Khởi chạy

### 3.1. Cài đặt Dependencies

```bash
cd core-api
npm install
```

### 3.2. Cấu hình Biến môi trường

Sao chép file mẫu:

```bash
cp .env.example .env
```

Các biến môi trường cơ bản cần cấu hình trong `.env`:

```env
# Server
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=foodee_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO Object Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=miniouser
MINIO_SECRET_KEY=miniopassword
MINIO_BUCKET_NAME=foodee-bucket

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=7d

# Microservices URLs
AI_SERVER_URL=http://localhost:8000
AI_SERVICE_TOKEN=<same-random-value-as-chatbot-service>
FOOD_AI_URL=http://localhost:5000
```

### 3.3. Chạy Database Migrations

```bash
npm run migration:run
```

### 3.4. Khởi chạy Ứng dụng

#### Chế độ Development (API Server):
```bash
npm run start:dev
```
Core API sẽ lắng nghe tại `http://localhost:3001`. Swagger API Docs tại `http://localhost:3001/api/docs`.

#### Chế độ Background Worker (Xử lý hàng đợi BullMQ):
```bash
npm run start:worker
```

---

## 📜 4. Các Lệnh Thao tác Thường dùng

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run build` | Biên dịch TypeScript sang JavaScript (`dist/`) |
| `npm run lint` | Kiểm tra cú pháp và ranh giới kiến trúc module (`eslint`) |
| `npm run lint:fix` | Tự động sửa lỗi lint có thể sửa |
| `npm run format:check` | Kiểm tra định dạng code với Prettier |
| `npm run format` | Tự động format toàn bộ source code |
| `npm run test:unit` | Chạy bộ Unit Tests |
| `npm run test:integration` | Chạy bộ Integration Tests |
| `npm run test:e2e` | Chạy bộ End-to-End Tests |
| `npm run migration:generate -- -n <MigrationName>` | Tự động sinh file migration từ entity changes |
| `npm run migration:run` | Chạy các migrations chưa áp dụng |
| `npm run migration:revert` | Rollback migration gần nhất |

---

## 🛡️ 5. Quy chuẩn Ranh giới Tính năng (Architecture Rules)

1. **Giao tiếp Cross-Feature:** Mọi feature muốn gọi tính năng của feature khác bắt buộc phải import qua `src/features/<feature>/public-api.ts`. Tuyệt đối không import file nội bộ của feature khác.
2. **Quyền sở hữu Entity:** Mỗi Entity trong database chỉ thuộc quyền quản lý của một Feature duy nhất. Feature khác không được inject repository trực tiếp mà phải sử dụng Snapshot DTO bất biến hoặc port/contract công khai.
3. **Không dùng `forwardRef()`:** Giải quyết phụ thuộc vòng thông qua Port, Facade hoặc Event/Outbox pattern.
4. **Kiểm soát Quyền & Bảo mật:** Mọi endpoint nhạy cảm phải kiểm tra quyền sở hữu resource (`ownerId === actor.userId`), chống lỗi BOLA/IDOR.
