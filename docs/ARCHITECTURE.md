# 🏛️ Tài liệu Thiết kế Kiến trúc Hệ thống (System Architecture)

> Tài liệu này mô tả chi tiết mô hình kiến trúc tổng thể, các luồng dữ liệu nghiệp vụ chính (Sequence Diagrams) và các quy chuẩn thiết kế phần mềm của toàn bộ hệ sinh thái **Foodee**.

---

## 📑 Mục lục
1. [Mô hình Phân tầng Tổng thể](#1-mô-hình-phân-tầng-tổng-thể)
2. [Các Luồng Dữ liệu Nghiệp vụ Chính (Sequence Diagrams)](#2-các-luồng-dữ-liệu-nghiệp-vụ-chính-sequence-diagrams)
   * [2.1. Luồng Đặt món, Thanh toán & Điều phối Giao hàng](#21-luồng-đặt-món-thanh-toán--điều-phối-giao-hàng)
   * [2.2. Luồng Thị giác Máy tính Nhận diện Món ăn (Two-Stage Vision AI)](#22-luồng-thị-giác-máy-tính-nhận-diện-món-ăn-two-stage-vision-ai)
   * [2.3. Luồng Đặt món bằng Ngôn ngữ Tự nhiên qua Trợ lý ảo (MiXiBot LLM)](#23-luồng-đặt-món-bằng-ngôn-ngữ-tự-nhiên-qua-trợ-lý-ảo-mixibot-llm)
3. [Kiến trúc Module Hóa Backend (Feature-Sliced Domain Architecture)](#3-kiến-trúc-module-hóa-backend-feature-sliced-domain-architecture)
4. [Tách biệt Xử lý Đồng bộ (API) và Bất đồng bộ (Queue Worker)](#4-tách-biệt-xử-lý-đồng-bộ-api-và-bất-đồng-bộ-queue-worker)
5. [Quy chuẩn Giao tiếp Liên Dịch vụ (Inter-Service Communication)](#5-quy-chuẩn-giao-tiếp-liên-dịch-vụ-inter-service-communication)

---

## 1. Mô hình Phân tầng Tổng thể

Hệ sinh thái Foodee được tổ chức theo mô hình phân tầng chặt chẽ nhằm tối ưu hóa tính độc lập, khả năng mở rộng quy mô và độ tin cậy:

```mermaid
flowchart TD
    subgraph ClientLayer [" 1. Client Layer (Người dùng & Thiết bị) "]
        CustomerApp["🌐 Khách hàng (Đặt món, Giỏ hàng, Bản đồ)"]
        OwnerPortal["🏪 Chủ quán (Quản lý Menu, Tiếp nhận đơn realtime)"]
        AdminDashboard["📊 Quản trị viên (Dashboard thống kê, Phân quyền RBAC)"]
    end

    subgraph GatewayLayer [" 2. Gateway & Proxy Layer "]
        Nginx["🛡️ Nginx Alpine Reverse Proxy\nSSL Termination • Port 80/443"]
    end

    subgraph ApplicationLayer [" 3. Core Application Layer "]
        WebClient["🛍️ Web Client (Next.js 15, React 19, Tailwind CSS)\nCổng giao diện All-in-One"]
        CoreAPI["🍲 Core API Server (NestJS 11, TypeORM)\n14 Domain Features • REST API"]
        BackgroundWorker["⚙️ Background Queue Worker (BullMQ + Redis)\nXử lý Outbox, Thông báo đẩy, Thống kê"]
    end

    subgraph AILayer [" 4. AI Specialized Services Layer "]
        VisionService["🍜 Vision AI Service (Flask, YOLOv8, LiteRT)\nNhận diện 30 món ăn Việt Nam từ Ảnh/Video"]
        ChatbotService["🤖 Chatbot AI Service (FastAPI, Google Gemini / Local Qwen)\nTrợ lý ảo phân tích câu lệnh đặt món tự nhiên"]
    end

    subgraph DataLayer [" 5. Data & Storage Layer "]
        Postgres[("🐘 PostgreSQL 16\nCSDL Quan hệ chính")]
        RedisStore[("⚡ Redis 7\nCache phân tán & BullMQ State")]
        MinIOStore[("📦 MinIO S3 Object Storage\nQuản trị tập trung hình ảnh media")]
    end

    subgraph ExternalLayer [" 6. External Third-Party Layer "]
        MapboxAPI["🗺️ Mapbox GL & Geocoding"]
        MoMoGate["💳 MoMo Payment Gateway"]
        VNPayGate["🏦 VNPay Payment Gateway"]
    end

    CustomerApp --> Nginx
    OwnerPortal --> Nginx
    AdminDashboard --> Nginx

    Nginx --> WebClient
    Nginx --> CoreAPI
    Nginx --> MinIOStore

    WebClient -->|HTTP / JWT| CoreAPI
    WebClient -->|Upload Media| VisionService

    CoreAPI -->|X-AI-Service-Token| ChatbotService
    CoreAPI -->|Health & Category Lookup| VisionService
    CoreAPI --> Postgres
    CoreAPI --> RedisStore
    CoreAPI --> MinIOStore
    CoreAPI --> MapboxAPI
    CoreAPI --> MoMoGate
    CoreAPI --> VNPayGate

    BackgroundWorker --> RedisStore
    BackgroundWorker --> Postgres
```

---

## 2. Các Luồng Dữ liệu Nghiệp vụ Chính (Sequence Diagrams)

### 2.1. Luồng Đặt món, Thanh toán & Điều phối Giao hàng

Luồng đặt hàng kết hợp chặt chẽ giữa **Idempotent Webhook** và **Transactional Outbox Pattern** để đảm bảo không thất thoát dữ liệu và không bao giờ trừ tiền trùng lặp:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Khách hàng
    participant Web as 🌐 Web Client
    participant API as 🍲 Core API
    participant DB as 🐘 PostgreSQL
    participant Gate as 💳 Cổng MoMo / VNPay
    participant Redis as ⚡ Redis Queue
    participant Worker as ⚙️ BullMQ Worker
    actor Shipper as 🛵 Tài xế

    Customer->>Web: Chọn món, áp mã giảm giá & bấm "Thanh toán"
    Web->>API: POST /orders/checkout (Dữ liệu giỏ hàng, Phương thức thanh toán)
    API->>DB: Transaction: Tạo Order (PENDING), Giữ chỗ Promotion, Lưu Checkout
    API->>Gate: Khởi tạo giao dịch (OrderInfo, Amount, ReturnUrl, NotifyUrl)
    Gate-->>API: Trả về Payment URL / QR Code
    API-->>Web: Trả về link chuyển hướng
    Web->>Customer: Điều hướng sang trang thanh toán của Cổng

    Customer->>Gate: Xác thực và hoàn tất thanh toán
    Gate->>API: POST /payment/webhook (IPN Callback + Chữ ký số HMAC)
    
    rect rgb(240, 248, 255)
    Note over API,DB: Xử lý Idempotency & Outbox Pattern
    API->>API: Xác minh chữ ký số HMAC-SHA256
    API->>DB: Kiểm tra bảng payment_webhooks (Chống replay attack)
    API->>DB: Transaction: Cập nhật Order -> CONFIRMED, Ghi OutboxEvent (ORDER_CONFIRMED)
    API-->>Gate: Trả về HTTP 200 { resultCode: 0 }
    end

    API->>Redis: Trigger Queue Event
    Redis->>Worker: Nhận Event ORDER_CONFIRMED
    Worker->>DB: Tìm kiếm tài xế gần quán nhất (Khoảng cách GPS)
    Worker->>DB: Tạo bản ghi PendingShipperAssignment
    Worker->>Shipper: Gửi Push Notification đơn hàng mới
    Shipper->>API: POST /delivery/accept (Nhận chuyến giao hàng)
    API->>DB: Cập nhật trạng thái đơn -> PREPARING / PICKED_UP
```

---

### 2.2. Luồng Thị giác Máy tính Nhận diện Món ăn (Two-Stage Vision AI)

Quy trình nhận diện sử dụng kết hợp **YOLOv8 Nano** để khoanh vùng (ROI) và **Google LiteRT Float16 (EfficientNet-B2)** để phân loại chính xác 30 món ăn Việt Nam:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Người dùng
    participant Web as 🌐 Web Client (Camera UI)
    participant Vision as 🍜 Vision Service (Flask)
    participant ModelYOLO as 📦 YOLOv8 Nano
    participant ModelLiteRT as ⚡ LiteRT (EfficientNet-B2)
    participant Core as 🍲 Core API
    participant DB as 🐘 PostgreSQL

    User->>Web: Bật Camera / Tải lên hình ảnh món ăn
    Web->>Vision: POST /detect (Multipart image/video frame)
    
    rect rgb(255, 250, 240)
    Note over Vision,ModelLiteRT: Two-Stage AI Inference Pipeline
    Vision->>Vision: Kiểm tra LRU Cache (Khử trùng lặp ảnh tương tự)
    Vision->>ModelYOLO: Phát hiện các vùng có đồ ăn (Bounding Boxes ROI)
    ModelYOLO-->>Vision: Trả về danh sách coordinates [x1, y1, x2, y2]
    loop Cho từng Bounding Box
        Vision->>Vision: Crop & Preprocess (Resize 260x260, Normalize)
        Vision->>ModelLiteRT: Chạy phân loại 30 món đặc sản Việt Nam
        ModelLiteRT-->>Vision: Trả về Class ID, Nhãn tiếng Việt & Tỷ lệ tin cậy (%)
    end
    Vision->>Vision: Áp dụng IoU Tracking (Khử nhấp nháy nếu là video)
    end

    Vision-->>Web: Trả về JSON: Danh sách món nhận diện được kèm Bounding Box
    Web->>User: Hiển thị Bounding Box & Tên món trực quan trên ảnh

    User->>Web: Bấm vào nhãn món: "Phở Bò"
    Web->>Core: GET /foods/search-by-dish?dishName=Phở Bò&lat=...&lng=...
    Core->>DB: Truy vấn quán ăn gần nhất đang bán món "Phở Bò"
    DB-->>Core: Danh sách quán ăn kèm khoảng cách và giá bán
    Core-->>Web: Hiển thị danh sách quán ăn cho người dùng chọn
```

---

### 2.3. Luồng Đặt món bằng Ngôn ngữ Tự nhiên qua Trợ lý ảo (MiXiBot LLM)

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Khách hàng
    participant Web as 🌐 Web Client (Khung Chat)
    participant Core as 🍲 Core API (/api/chat)
    participant DB as 🐘 PostgreSQL
    participant Bot as 🤖 Chatbot Service (FastAPI)
    participant LLM as 🧠 LLM Engine (Gemini / Qwen)

    User->>Web: Gõ tin nhắn: "Cho mình 2 suất bún bò huế ít cay với 1 trà tắc quán Anh Béo"
    Web->>Core: POST /chat (restaurantId, message, conversationHistory)
    Core->>DB: Trích xuất thực đơn tóm tắt (Menu Snapshot) của quán Anh Béo
    Core->>Bot: POST /agent/chat (Header: X-AI-Service-Token, Message, Context)
    
    rect rgb(240, 255, 240)
    Note over Bot,LLM: Intent Extraction & Function Calling
    Bot->>LLM: Gửi Prompt kèm Function Schema (extract_order_items, clarify_options)
    LLM-->>Bot: Phân tích cú pháp: 
    Note over Bot: Item 1: Bún bò huế (Qty: 2, Note: "ít cay")<br/>Item 2: Trà tắc (Qty: 1)
    Bot->>Bot: Đối soát tên món trong menu snapshot để lấy FoodID và giá chuẩn
    end

    Bot-->>Core: Trả về: { reply: "...", draftOrder: [ { foodId, qty, options } ] }
    Core-->>Web: Phản hồi hội thoại + Card xác nhận đơn hàng gợi ý
    Web->>User: Hiển thị câu trả lời và Button "Thêm vào giỏ hàng ngay"
```

---

## 3. Kiến trúc Module Hóa Backend (Feature-Sliced Domain Architecture)

Dự án áp dụng chặt chẽ kiến trúc **Feature-Sliced Architecture** trong `core-api/src/features`. Hệ thống bao gồm **14 domain features** độc lập:

```text
core-api/src/features/
├── auth/                 # Xác thực JWT, Google OAuth, Đổi mật khẩu, OTP
├── users/                # Quản lý tài khoản, hồ sơ cá nhân và phân quyền RBAC
├── restaurants/          # Quản lý hồ sơ nhà hàng, giờ mở/đóng cửa, kiểm duyệt quán
├── menu/                 # Thực đơn, danh mục món ăn (Category), món ăn (Food) & Topping
├── orders/               # Máy trạng thái đơn hàng (Order State Machine), giỏ hàng
├── payments/             # Tích hợp MoMo, VNPay, đối soát Webhook Idempotent
├── delivery/             # Quản lý hồ sơ tài xế (Shipper Profile), điều phối chuyến
├── promotions/           # Quản lý voucher, quy tắc giảm giá, kiểm tra điều kiện áp dụng
├── reviews/              # Đánh giá món ăn, chấm điểm phục vụ tài xế
├── communications/       # Trò chuyện tin nhắn trực tiếp giữa Khách - Quán - Tài xế
├── notifications/        # Hệ thống thông báo đẩy (In-app, Firebase)
├── locations/            # Tọa độ địa lý, tính toán khoảng cách Mapbox
├── system-constraints/   # Ràng buộc cấu hình động toàn hệ thống
└── analytics/            # Báo cáo doanh thu, phân tích số liệu sàn thương mại
```

### Quy chuẩn Ranh giới Bắt buộc (Architecture Enforcements):
1. **Giao tiếp qua Public API:** Mọi tương tác xuyên module bắt buộc phải import qua file `public-api.ts` tại thư mục gốc của feature đó (ví dụ: `import { OrdersService } from '@/features/orders/public-api'`).
2. **Quyền sở hữu Thực thể (Entity Ownership):** Mỗi Entity trong CSDL chỉ thuộc quyền sở hữu của duy nhất một Feature. Không một Feature nào được phép ghi trực tiếp vào Entity của Feature khác.
3. **Cấm Phụ thuộc Vòng (`forwardRef`):** Tuyệt đối cấm sử dụng `forwardRef()` trong NestJS Module. Các giao tiếp phụ thuộc vòng phải được tách thành Port/Adapter, Facade hoặc phát sự kiện bất đồng bộ qua Outbox Pattern.

---

## 4. Tách biệt Xử lý Đồng bộ (API) và Bất đồng bộ (Queue Worker)

Hệ thống phân tách rạch ròi giữa 2 tiến trình Node.js:

| Đặc điểm | Tiến trình API (`npm run start:dev`) | Tiến trình Worker (`npm run start:worker`) |
|:---|:---|:---|
| **Mục tiêu** | Phản hồi các HTTP request từ người dùng với độ trễ thấp nhất (< 100ms) | Xử lý các tác vụ nền tiêu tốn thời gian mà không gây nghẽn luồng chính |
| **Công nghệ** | NestJS HTTP Server, Fastify/Express engine | BullMQ Processor, Redis Streams / Job Queue |
| **Trách nhiệm** | Tiếp nhận đơn, kiểm tra tính hợp lệ dữ liệu, xác thực thanh toán | Quét bảng Outbox Event, gửi email hóa đơn, gửi thông báo đẩy Firebase, tìm tài xế giao hàng, tổng hợp doanh thu |
| **Khả năng chịu lỗi**| Tự động rollback transaction nếu có lỗi | Hỗ trợ Exponential Backoff Retry (thử lại tối đa 5 lần nếu bên thứ ba gặp sự cố) |

---

## 5. Quy chuẩn Giao tiếp Liên Dịch vụ (Inter-Service Communication)

Để bảo đảm tính an toàn khi các dịch vụ trao đổi dữ liệu với nhau trong môi trường phân tán:

1. **Khách hàng ➔ Core API:** Sử dụng JWT Token lưu trữ an toàn trong Cookie `HttpOnly; SameSite=Lax; Secure`.
2. **Core API ➔ AI Services (Chatbot & Vision):** Sử dụng Header nội bộ bí mật:
   ```http
   X-AI-Service-Token: <AI_SERVICE_TOKEN>
   ```
   Các dịch vụ AI sẽ từ chối mọi yêu cầu không mang token này hoặc token không khớp với cấu hình môi trường.
3. **Cổng Thanh toán ➔ Core API:** Sử dụng mã hóa kiểm tra tính toàn vẹn dữ liệu **HMAC-SHA256**. Mọi Webhook request có chữ ký không hợp lệ sẽ bị từ chối ngay lập tức trước khi phân tích nội dung đơn hàng.
