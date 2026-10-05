# 🛠️ Sổ tay Vận hành, Giám sát & Xử lý Sự cố (Operations & Troubleshooting Runbook)

> Tài liệu này đóng vai trò là cẩm nang vận hành dành cho kỹ sư hệ thống (SRE / DevOps) nhằm giám sát sức khỏe dịch vụ, thực hiện sao lưu/phục hồi thảm họa và xử lý nhanh các sự cố phát sinh trên môi trường Production của **Foodee**.

---

## 📑 Mục lục
1. [Ma trận Giám sát Sức khỏe Dịch vụ (Healthcheck Matrix)](#1-ma-trận-giám-sát-sức-khỏe-dịch-vụ-healthcheck-matrix)
2. [Quy trình Sao lưu & Phục hồi Thảm họa (Backup & Disaster Recovery)](#2-quy-trình-sao-lưu--phục-hồi-thảm-họa-backup--disaster-recovery)
   * [2.1. Sao lưu & Khôi phục Cơ sở dữ liệu PostgreSQL](#21-sao-lưu--khôi-phục-cơ-sở-dữ-liệu-postgresql)
   * [2.2. Sao lưu & Đồng bộ Tệp tin MinIO Object Storage](#22-sao-lưu--đồng-bộ-tệp-tin-minio-object-storage)
3. [Cẩm nang Xử lý Sự cố Thực chiến (Troubleshooting Playbooks)](#3-cẩm-nang-xử-lý-sự-cố-thực-chiến-troubleshooting-playbooks)
   * [3.1. Sự cố: Hàng đợi BullMQ bị nghẽn (Queue Stalls)](#31-sự-cố-hàng-đợi-bullmq-bị-nghẽn-queue-stalls)
   * [3.2. Sự cố: Cạn kiệt Hồ kết nối CSDL (Connection Pool Exhaustion)](#32-sự-cố-cạn-kiệt-hồ-kết-nối-csdl-connection-pool-exhaustion)
   * [3.3. Sự cố: Vision AI phản hồi chậm hoặc tràn bộ nhớ RAM](#33-sự-cố-vision-ai-phản-hồi-chậm-hoặc-tràn-bộ-nhớ-ram)
   * [3.4. Sự cố: Sự kiện Outbox Pattern bị ứ đọng](#34-sự-cố-sự-kiện-outbox-pattern-bị-ứ-đọng)
4. [Các Lệnh Quản trị Hệ thống Thường dùng](#4-các-lệnh-quản-trị-hệ-thống-thường-dùng)

---

## 1. Ma trận Giám sát Sức khỏe Dịch vụ (Healthcheck Matrix)

Mọi dịch vụ trong hệ thống đều cung cấp các điểm cuối (endpoints) tự kiểm tra sức khỏe nhằm phối hợp với Docker Healthcheck và các hệ thống giám sát như Prometheus / Uptime Kuma:

| Dịch vụ | Cổng Container | Lệnh / Endpoint Kiểm tra | Kết quả Mong đợi | Hành động khi Thất bại |
|:---|:---:|:---|:---:|:---|
| **Nginx Proxy** | `80`, `443` | `curl -f http://localhost/` | `HTTP 200` | Kiểm tra cấu hình `nginx.conf` và chứng chỉ SSL TLS |
| **Web Client** | `3000` | `curl -f http://localhost:3000/` | `HTTP 200` | Kiểm tra lỗi build Next.js hoặc thiếu biến `NEXT_PUBLIC_*` |
| **Core API** | `3001` | `curl -f http://localhost:3001/health` | `{"status":"ok"}` | Kiểm tra kết nối tới Postgres và Redis |
| **Chatbot AI** | `8000` | `curl -f http://localhost:8000/health` | `{"status":"healthy"}` | Kiểm tra API Key Gemini hoặc dung lượng RAM mô hình |
| **Vision AI** | `5000` | `curl -f http://localhost:5000/health` | `{"status":"healthy"}` | Kiểm tra tệp model weights YOLO / LiteRT đã nạp vào bộ nhớ |
| **PostgreSQL** | `5432` | `pg_isready -U postgres` | `accepting connections` | Kiểm tra dung lượng ổ đĩa Disk Full và RAM khả dụng |
| **Redis Store** | `6379` | `redis-cli ping` | `PONG` | Kiểm tra trạng thái bộ nhớ Redis và kết nối socket |
| **MinIO Storage**| `9000` | `curl -f http://localhost:9000/minio/health/ready` | `HTTP 200` | Kiểm tra quyền truy cập volume mount của thư mục data |

---

## 2. Quy trình Sao lưu & Phục hồi Thảm họa (Backup & Disaster Recovery)

### 2.1. Sao lưu & Khôi phục Cơ sở dữ liệu PostgreSQL

#### Lệnh Sao lưu Trực tuyến (Online Backup):
Sao lưu toàn bộ dữ liệu kèm cấu trúc bảng dưới dạng nén nhị phân an toàn (`-Fc`):
```bash
# Thực hiện trên máy chủ Production
docker compose -f compose.prod.yml exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > /secure-backups/foodee-db-$(date -u +%Y%m%dT%H%M%SZ).dump
```

#### Lệnh Phục hồi Dữ liệu (Restore Drill):
```bash
# Khôi phục vào CSDL mới trong môi trường cô lập:
docker compose -f compose.prod.yml exec -T postgres \
  sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' \
  < /secure-backups/foodee-db-20261005T120000Z.dump
```

### 2.2. Sao lưu & Đồng bộ Tệp tin MinIO Object Storage

Sử dụng công cụ chính thức **MinIO Client (`mc`)** để đồng bộ hình ảnh đại diện và thực đơn:
```bash
# 1. Cấu hình alias kết nối tới MinIO
mc alias set localminio http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

# 2. Đồng bộ toàn bộ bucket foodee sang thư mục lưu trữ ngoài host
mc mirror localminio/foodee /secure-backups/minio-media-backup/
```

---

## 3. Cẩm nang Xử lý Sự cố Thực chiến (Troubleshooting Playbooks)

### 3.1. Sự cố: Hàng đợi BullMQ bị nghẽn (Queue Stalls)
* **Triệu chứng:** Đơn hàng đã thanh toán thành công nhưng không thấy hệ thống điều phối tài xế và không gửi được thông báo.
* **Nguyên nhân:** Tiến trình `core-api worker` bị dừng đột ngột hoặc Redis bị ngắt kết nối.
* **Quy trình xử lý:**
  1. Kiểm tra trạng thái container worker:
     ```bash
     docker compose ps foodee-worker
     ```
  2. Xem log chi tiết để xác định job đang bị lỗi:
     ```bash
     docker compose logs --tail=100 -f foodee-worker
     ```
  3. Khởi động lại tiến trình worker để giải phóng các job bị khóa (Stalled jobs):
     ```bash
     docker compose restart foodee-worker
     ```

### 3.2. Sự cố: Cạn kiệt Hồ kết nối CSDL (Connection Pool Exhaustion)
* **Triệu chứng:** Người dùng gặp lỗi `500 Internal Server Error`, log ghi nhận `QueryFailedError: remaining connection slots are reserved for non-replication superuser connections`.
* **Nguyên nhân:** Có truy vấn chạy ngầm quá lâu không đóng transaction, hoặc lượng truy cập đồng thời vượt quá giới hạn pool size.
* **Quy trình xử lý:**
  1. Kiểm tra danh sách các truy vấn đang chạy trên PostgreSQL:
     ```sql
     SELECT pid, now() - query_start AS duration, query, state 
     FROM pg_stat_activity 
     WHERE state != 'idle' ORDER BY duration DESC;
     ```
  2. Hủy các truy vấn bị treo quá lâu:
     ```sql
     SELECT pg_terminate_backend(<pid_của_truy_vấn_bị_treo>);
     ```
  3. Tăng giới hạn `max_connections` trong PostgreSQL hoặc điều chỉnh `poolSize: 20` trong cấu hình TypeORM của `core-api`.

### 3.3. Sự cố: Vision AI phản hồi chậm hoặc tràn bộ nhớ RAM
* **Triệu chứng:** Endpoint `/detect` mất hơn 5 giây để phản hồi hoặc container `foodee-vision` bị hệ điều hành tắt do lỗi OOM (Out Of Memory).
* **Quy trình xử lý:**
  1. Kiểm tra mức tiêu thụ RAM của container Vision:
     ```bash
     docker stats foodee-vision
     ```
  2. Giảm bớt số lượng worker tiến trình Flask/Gunicorn trong tệp cấu hình triển khai.
  3. Đảm bảo mô hình LiteRT đang chạy ở chế độ **Float16** thay vì Float32 để giảm 50% dung lượng RAM chiếm dụng.

### 3.4. Sự cố: Sự kiện Outbox Pattern bị ứ đọng
* **Triệu chứng:** Bảng `outbox_events` có số lượng bản ghi `status = 'PENDING'` tăng cao liên tục.
* **Quy trình xử lý:**
  1. Chạy câu lệnh kiểm tra số lượng bản ghi tồn đọng:
     ```sql
     SELECT count(*) FROM outbox_events WHERE status = 'PENDING';
     ```
  2. Kiểm tra log của tiến trình Outbox Dispatcher xem có bị lỗi kết nối với Redis hay không.
  3. Kiểm tra xem Redis có bị đầy bộ nhớ RAM hay không bằng lệnh `redis-cli info memory`.

---

## 4. Các Lệnh Quản trị Hệ thống Thường dùng

```bash
# Xem mức sử dụng tài nguyên CPU/RAM của toàn bộ container theo thời gian thực
docker stats --no-stream

# Kiểm tra log của một dịch vụ cụ thể trong 10 phút gần nhất
docker compose logs --since=10m -f foodee-api

# Khởi động lại toàn bộ hệ sinh thái mà không làm mất dữ liệu ổ đĩa
docker compose down && docker compose up -d

# Dọn dẹp các image và volume rác không còn sử dụng
docker system prune -f
```
