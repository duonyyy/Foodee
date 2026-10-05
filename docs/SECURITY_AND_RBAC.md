# 🛡️ Kiến trúc Bảo mật & Phân quyền (Security & RBAC Architecture)

> Tài liệu này mô tả chi tiết các tầng bảo vệ đa lớp (Defense-in-Depth), mô hình phân quyền dựa trên vai trò (Role-Based Access Control - RBAC), cơ chế phòng chống các lỗ hổng OWASP hàng đầu và bảo mật liên dịch vụ trong hệ thống **Foodee**.

---

## 📑 Mục lục
1. [Mô hình Bảo vệ Đa tầng (Defense-in-Depth)](#1-mô-hình-bảo-vệ-đa-tầng-defense-in-depth)
2. [Cơ chế Xác thực (Authentication)](#2-cơ-chế-xác-thực-authentication)
3. [Ma trận Phân quyền Vai trò (RBAC Matrix)](#3-ma-trận-phân-quyền-vai-trò-rbac-matrix)
4. [Cổng Kiểm soát Truy cập Phía Frontend (Edge Middleware Gatekeeper)](#4-cổng-kiểm-soát-truy-cập-phía-frontend-edge-middleware-gatekeeper)
5. [Phòng chống Lỗ hổng OWASP & Kiểm soát Sở hữu Tài nguyên (BOLA / IDOR)](#5-phòng-chống-lỗ-hổng-owasp--kiểm-soát-sở-hữu-tài-nguyên-bola--idor)
6. [Bảo mật Giao tiếp Liên Dịch vụ (Inter-Service Authentication)](#6-bảo-mật-giao-tiếp-liên-dịch-vụ-inter-service-authentication)
7. [Bảo mật Cổng Thanh toán & Chữ ký số Webhook (HMAC-SHA256)](#7-bảo-mật-cổng-thanh-toán--chữ-ký-số-webhook-hmac-sha256)

---

## 1. Mô hình Bảo vệ Đa tầng (Defense-in-Depth)

Hệ thống Foodee thiết lập 4 vành đai bảo mật liên hoàn:

```text
[ Vành đai 1: Mạng & Gateway ]
   ├── Nginx SSL Termination (TLS 1.2/1.3)
   ├── Giới hạn cổng: Chỉ công khai Port 80/443 (DB, Redis, AI giấu kín trong Docker network)
   └── Rate Limiting & Chặn IP bất thường

[ Vành đai 2: Frontend Edge Gatekeeper ]
   ├── Next.js Middleware (src/middleware.ts)
   └── Kiểm soát Token & Điều hướng tức thì trước khi render trang

[ Vành đai 3: Backend Core API Security ]
   ├── NestJS Throttler: Giới hạn tần suất gọi API chống Brute-force
   ├── Helmet: Bổ sung các HTTP Security Headers (X-Content-Type-Options, X-Frame-Options)
   ├── CORS Whitelist: Chỉ cho phép nguồn tin cậy kết nối
   └── ValidationPipe: Lọc dữ liệu đầu vào tự động (class-validator) chống Injection

[ Vành đai 4: Quyền hạn & Sở hữu Tài nguyên ]
   ├── JwtAuthGuard + RolesGuard + PermissionsGuard
   └── Ownership Guard: Kiểm tra IDOR/BOLA (actor.userId === resource.ownerId)
```

---

## 2. Cơ chế Xác thực (Authentication)

### 2.1. Quản lý Token qua Cookie An toàn (HttpOnly Cookie)
Thay vì lưu JWT Token trong `localStorage` (dễ bị tin tặc đánh cắp qua lỗ hổng XSS), Foodee áp dụng cơ chế Cookie bảo mật cao:

* **Tên Cookie:** `access_token` và `refresh_token`
* **Thuộc tính cấu hình:**
  * `HttpOnly = true`: Chặn mã JavaScript trên trình duyệt đọc hoặc can thiệp vào token.
  * `Secure = true`: Chỉ truyền tải qua giao thức mã hóa HTTPS (trên production).
  * `SameSite = 'Lax'`: Ngăn chặn các cuộc tấn công giả mạo yêu cầu chéo trang (Cross-Site Request Forgery - CSRF).
* **Thời gian sống:**
  * `access_token`: 15 phút (Giảm thiểu rủi ro nếu token bị lộ).
  * `refresh_token`: 7 ngày (Dùng để tự động gia hạn phiên làm việc của người dùng).

### 2.2. Đăng nhập Đa kênh (Local & Google OAuth 2.0)
* Mật khẩu tài khoản cục bộ được băm bằng thuật toán **bcrypt** với salt rounds = 10.
* Đăng nhập qua Google sử dụng thư viện `google-auth-library` để giải mã và xác minh chữ ký `id_token` do Google cấp phát trước khi tạo phiên.

---

## 3. Ma trận Phân quyền Vai trò (RBAC Matrix)

Hệ thống phân định 5 nhóm vai trò người dùng với phạm vi quyền hạn tách bạch:

| Chức năng / Quyền hạn | Khách hàng (`customer`) | Tài xế (`shipper`) | Chủ quán (`restaurant_owner`) | Quản trị viên (`administrator`) | Quản trị cấp cao (`super_admin`) |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Xem menu & Tìm kiếm món bằng AI** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Đặt món & Thanh toán trực tuyến** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Đánh giá món & Chấm điểm dịch vụ**| ✅ | ❌ | ❌ | ❌ | ✅ |
| **Bật/Tắt trạng thái sẵn sàng giao** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Nhận cuốc & Cập nhật GPS chuyến** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Quản lý thực đơn & Topping quán**  | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Tiếp nhận / Từ chối đơn hàng quán**| ❌ | ❌ | ✅ | ❌ | ✅ |
| **Xem thống kê doanh thu của quán**  | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Phê duyệt / Từ chối hồ sơ nhà hàng**| ❌ | ❌ | ❌ | ✅ | ✅ |
| **Khóa tài khoản vi phạm**           | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Phân quyền vai trò & Cấu hình sàn**| ❌ | ❌ | ❌ | ❌ | ✅ |

### Kỹ thuật Hiện thực trên NestJS:
1. `@UseGuards(JwtAuthGuard, RolesGuard)`
2. Decorator `@Roles('restaurant_owner', 'administrator')`
3. Decorator `@RequirePermissions('MENU.UPDATE')`

---

## 4. Cổng Kiểm soát Truy cập Phía Frontend (Edge Middleware Gatekeeper)

File [`web-client/src/middleware.ts`](../web-client/src/middleware.ts) đóng vai trò người gác cổng tại tầng Edge của Next.js:

```mermaid
flowchart TD
    Req["Request từ Trình duyệt"] --> MatchPath{"Tuyến đường được yêu cầu?"}
    
    MatchPath -->|"/admin/*"| CheckAdmin{"Có Token & Role là Admin?"}
    CheckAdmin -->|Có| Allow["Cho phép truy cập"]
    CheckAdmin -->|Không| DenyAdmin["Điều hướng sang /unauthorized hoặc /login"]

    MatchPath -->|"/owner/*"| CheckOwner{"Có Token & Role là Owner?"}
    CheckOwner -->|Có| Allow
    CheckOwner -->|Không| DenyOwner["Điều hướng sang /unauthorized"]

    MatchPath -->|"/checkout", "/order/*"| CheckAuth{"Người dùng đã đăng nhập?"}
    CheckAuth -->|Có| Allow
    CheckAuth -->|Không| RedirectLogin["Lưu returnUrl & Điều hướng sang /login"]

    MatchPath -->|Công khai: "/", "/restaurant/*"| Allow
```

---

## 5. Phòng chống Lỗ hổng OWASP & Kiểm soát Sở hữu Tài nguyên (BOLA / IDOR)

**BOLA / IDOR (Broken Object-Level Authorization)** là lỗ hổng bảo mật phổ biến nhất trong các ứng dụng đặt món (ví dụ: Khách hàng A đổi ID trên URL thành ID đơn hàng của khách hàng B để xem trộm hoặc hủy đơn).

**Cơ chế phòng thủ của Foodee:**
Mọi phương thức xử lý đơn hàng, thông tin cá nhân và quản lý quán ăn đều bắt buộc thực hiện kiểm tra quyền sở hữu kép:

```typescript
// Ví dụ kiểm tra quyền sở hữu tại OrdersService:
const order = await this.orderRepository.findOne({ where: { id: orderId } });
if (!order) {
  throw new NotFoundException('Đơn hàng không tồn tại');
}

// Kiểm tra quyền sở hữu: Người thao tác phải là chủ đơn HOẶC là Admin
const isOwner = order.userId === actor.userId;
const isAdmin = actor.roles.includes('administrator') || actor.roles.includes('super_admin');

if (!isOwner && !isAdmin) {
  throw new ForbiddenException('Bạn không có quyền truy cập hoặc chỉnh sửa đơn hàng này');
}
```

---

## 6. Bảo mật Giao tiếp Liên Dịch vụ (Inter-Service Authentication)

Các dịch vụ AI (`chatbot-service` và `vision-service`) không mở cổng công khai ra ngoài Internet mà chỉ nhận yêu cầu từ `core-api` trong mạng nội bộ Docker.

Để xác thực mọi yêu cầu từ `core-api`, các dịch vụ AI yêu cầu header bắt buộc:
```http
X-AI-Service-Token: <AI_SERVICE_TOKEN>
```

* Nếu thiếu header hoặc giá trị không trùng khớp với biến môi trường nội bộ, dịch vụ AI sẽ lập tức trả về mã lỗi `HTTP 403 Forbidden`.
* Cơ chế này ngăn chặn tuyệt đối việc kẻ tấn công lợi dụng dịch vụ AI để bòn rút tài nguyên tính toán (CPU/GPU) của hệ thống.

---

## 7. Bảo mật Cổng Thanh toán & Chữ ký số Webhook (HMAC-SHA256)

Khi cổng thanh toán MoMo hoặc VNPay gửi thông báo trạng thái giao dịch (IPN Callback) về Core API:

1. **Kiểm tra Chữ ký số (Signature Verification):**
   * Core API trích xuất các tham số từ payload (số tiền, mã đơn hàng, mã giao dịch).
   * Tạo chuỗi định dạng chuẩn (Raw Signature String).
   * Tính toán chữ ký HMAC-SHA256 bằng khóa bí mật `SECRET_KEY` được chia sẻ từ nhà mạng.
   * So sánh chữ ký vừa tính với `signature` mà MoMo/VNPay gửi tới. Nếu có bất kỳ sự sai lệch nào (dấu hiệu dữ liệu bị can thiệp trên đường truyền), request bị từ chối lập tức.
2. **Chống Replay Attack (Tấn công gửi lại gói tin):**
   * Mã giao dịch `transaction_id` được đối soát với CSDL. Nếu giao dịch đã hoàn tất trước đó, hệ thống không lặp lại luồng cộng tiền/xác nhận đơn.
