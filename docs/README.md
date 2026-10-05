# 📚 Foodee Documentation Center

Chào mừng bạn đến với trung tâm tài liệu kỹ thuật của hệ thống **Foodee** — Nền tảng đặt đồ ăn thông minh tích hợp Trí tuệ nhân tạo (AI Vision & AI Chatbot).

Thư mục `docs/` chứa toàn bộ các bản thiết kế kiến trúc, đặc tả cơ sở dữ liệu, quy chuẩn bảo mật, chiến lược kiểm thử và cẩm nang vận hành dành cho nhà phát triển, kỹ sư vận hành và ban thẩm định đồ án.

---

## 🗺️ Bản đồ Tài liệu Kỹ thuật

| Tài liệu | Nội dung Chính | Đối tượng Sử dụng |
|:---|:---|:---|
| 🏛️ [**Kiến trúc Hệ thống (ARCHITECTURE.md)**](ARCHITECTURE.md) | Sơ đồ phân tầng tổng thể, luồng dữ liệu (Sequence Diagrams) cho Đặt hàng, Thanh toán, AI Vision Pipeline và Chatbot LLM, quy chuẩn Feature-Sliced. | Nhà phát triển, Kiến trúc sư phần mềm |
| 🗄️ [**Thiết kế Cơ sở Dữ liệu (DATABASE_DESIGN.md)**](DATABASE_DESIGN.md) | Mô hình ERD chi tiết 27 thực thể qua 37 migrations, Transactional Outbox Pattern, máy trạng thái đơn hàng (State Machine) và chiến lược đánh Index. | Database Admin, Backend Developer |
| 🛡️ [**Bảo mật & Phân quyền (SECURITY_AND_RBAC.md)**](SECURITY_AND_RBAC.md) | Ma trận phân quyền RBAC (5 vai trò), xác thực JWT HttpOnly Cookie, bảo vệ tài nguyên chống IDOR/BOLA, chữ ký số Webhook HMAC và bảo mật liên dịch vụ. | Chuyên viên bảo mật, Backend/Frontend Dev |
| 🧪 [**Chiến lược Kiểm thử Toàn diện (TESTING_STRATEGY.md)**](TESTING_STRATEGY.md) | Ma trận kiểm thử 4 phân hệ: Jest (Core API), Playwright E2E 10 kịch bản (Web Client), 40 ca benchmark hội thoại (Chatbot AI) và 90+ Pytest (Vision AI). | QA/QC, Kỹ sư kiểm thử, Nhà phát triển |
| 🛠️ [**Sổ tay Vận hành & Giám sát (OPERATIONS_RUNBOOK.md)**](OPERATIONS_RUNBOOK.md) | Ma trận Healthcheck, quy trình sao lưu & phục hồi thảm họa (PostgreSQL/MinIO), và cẩm nang xử lý sự cố thực chiến (Troubleshooting). | SRE, DevOps, Vận hành hệ thống |
| 🚀 [**Hướng dẫn Triển khai Production (PRODUCTION_DEPLOYMENT.md)**](PRODUCTION_DEPLOYMENT.md) | Quy trình phát hành bản dựng Docker Compose Production (`compose.prod.yml`), cấu hình Nginx SSL, biến môi trường và điều kiện nghiệm thu. | DevOps, Triển khai hạ tầng |

---

## 🧭 Hướng dẫn Điều hướng theo Vai trò

### 1. Dành cho Ban Thẩm định Đồ án & Giảng viên Đánh giá
1. Bắt đầu với [Kiến trúc Hệ thống](ARCHITECTURE.md) để nắm bắt bức tranh toàn cảnh và 2 điểm nhấn công nghệ AI.
2. Tham khảo [Thiết kế Cơ sở Dữ liệu](DATABASE_DESIGN.md) để xem mô hình dữ liệu chuẩn hóa và cơ chế Outbox Pattern chống mất mát dữ liệu.
3. Đọc [Bảo mật & Phân quyền](SECURITY_AND_RBAC.md) và [Chiến lược Kiểm thử](TESTING_STRATEGY.md) để đánh giá độ hoàn thiện và chất lượng phần mềm.

### 2. Dành cho Lập trình viên mới tham gia dự án (Onboarding)
1. Đọc [Kiến trúc Hệ thống](ARCHITECTURE.md) để nắm quy tắc phân chia 14 domain module qua `public-api.ts`.
2. Xem [Thiết kế Cơ sở Dữ liệu](DATABASE_DESIGN.md) để hiểu quan hệ giữa các bảng.
3. Tham khảo các tài liệu README chi tiết của từng dịch vụ:
   * [Core API & Worker](../core-api/README.md) & [Danh mục API](../core-api/API_DOCUMENTATION.md)
   * [Web Client](../web-client/README.md)
   * [Chatbot Service](../chatbot-service/README.md)
   * [Vision Service](../vision-service/README.md)

### 3. Dành cho Kỹ sư Vận hành & Triển khai (DevOps / SRE)
1. Thực hiện theo [Hướng dẫn Triển khai Production](PRODUCTION_DEPLOYMENT.md).
2. Lưu giữ [Sổ tay Vận hành](OPERATIONS_RUNBOOK.md) để phục vụ giám sát sức khỏe container và xử lý sự cố khẩn cấp.
