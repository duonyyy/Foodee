# 🧪 Chiến lược Kiểm thử Toàn diện & Đảm bảo Chất lượng (Testing & QA Strategy)

> Tài liệu này mô tả chi tiết chiến lược kiểm thử đa tầng, ma trận bài test trên cả 4 phân hệ và các bộ tiêu chuẩn kiểm tra chất lượng phần mềm trong hệ thống **Foodee**.

---

## 📑 Mục lục
1. [Tháp Kiểm thử Chất lượng (Testing Pyramid)](#1-tháp-kiểm-thử-chất-lượng-testing-pyramid)
2. [Tầng 1: Kiểm thử Backend Core API (Jest Suite)](#2-tầng-1-kiểm-thử-backend-core-api-jest-suite)
3. [Tầng 2: Kiểm thử Giao diện Web Client (Playwright E2E Matrix)](#3-tầng-2-kiểm-thử-giao-diện-web-client-playwright-e2e-matrix)
4. [Tầng 3: Kiểm thử Đánh giá Trợ lý ảo AI Chatbot (LLM Benchmark)](#4-tầng-3-kiểm-thử-đánh-giá-trợ-lý-ảo-ai-chatbot-llm-benchmark)
5. [Tầng 4: Kiểm thử AI Thị giác Máy tính (Vision Pytest Matrix)](#5-tầng-4-kiểm-thử-ai-thị-giác-máy-tính-vision-pytest-matrix)
6. [Hàng rào Kiểm duyệt Tự động (Automated Quality Gates)](#6-hàng-rào-kiểm-duyệt-tự-động-automated-quality-gates)

---

## 1. Tháp Kiểm thử Chất lượng (Testing Pyramid)

Hệ thống Foodee tuân thủ mô hình kiểm định chất lượng phần mềm hiện đại nhằm đảm bảo tính ổn định tối đa trước khi đưa lên môi trường Production:

```text
               ▲
              / \     [ E2E & Visual Regression ]
             /   \    10 Bộ kịch bản Playwright (Web Client)
            /─────\
           /       \   [ AI Benchmark & Model Tests ]
          /         \  40 Ca hội thoại (Chatbot) + 90+ Tests (Vision AI)
         /───────────\
        /             \ [ Integration Tests ]
       /               \ Core API với PostgreSQL & Redis Thật
      /─────────────────\
     /                   \ [ Unit Tests ]
    /                     \ Ranh giới 14 Domain Modules (Jest)
   ─────────────────────────
```

---

## 2. Tầng 1: Kiểm thử Backend Core API (Jest Suite)

Core API được bao phủ bởi 3 cấp độ kiểm thử bằng Jest:

### 2.1. Cấu trúc bài test:
* **Unit Tests (`test/unit/`):** Kiểm tra tính đúng đắn của logic tính toán tiền giảm giá voucher, máy trạng thái đơn hàng (Order State Machine), bộ lọc quyền hạn RBAC và các dịch vụ độc lập không phụ thuộc CSDL bên ngoài.
* **Integration Tests (`test/integration/`):** Sử dụng CSDL PostgreSQL và Redis thực tế để kiểm tra tính toàn vẹn của các giao dịch đa bảng, cơ chế khóa bi quan (Pessimistic Locking) và lưu trữ Outbox Events.
* **E2E Tests (`test/e2e/`):** Giả lập toàn bộ chu trình HTTP request từ lúc client gửi request, qua Middleware, Guard, Interceptor đến Controller và nhận JSON phản hồi.

### 2.2. Lệnh thực thi:
```bash
cd core-api

# Chạy toàn bộ Unit Tests
npm run test:unit

# Chạy Integration Tests
npm run test:integration

# Chạy End-to-End Tests
npm run test:e2e

# Đo lường độ bao phủ mã nguồn (Code Coverage)
npm run test:cov
```

---

## 3. Tầng 2: Kiểm thử Giao diện Web Client (Playwright E2E Matrix)

Thư mục `web-client/tests/e2e/` chứa **10 bộ kịch bản kiểm thử toàn diện** được viết bằng Playwright nhằm mô phỏng hành vi thao tác thực tế của người dùng:

| Tên File Kịch bản | Phạm vi & Nghiệp vụ Kiểm thử |
|:---|:---|
| [`phase1-home.spec.ts`](../web-client/tests/e2e/phase1-home.spec.ts) | Kiểm tra render trang chủ, tìm kiếm quán ăn, danh mục món nổi bật và thanh điều hướng. |
| [`phase3-cart.spec.ts`](../web-client/tests/e2e/phase3-cart.spec.ts) | Kiểm tra thêm món vào giỏ, chọn Topping kèm theo, tăng/giảm số lượng và tính tổng tiền giỏ hàng. |
| [`phase3-flow-verification.spec.ts`](../web-client/tests/e2e/phase3-flow-verification.spec.ts) | Xác minh toàn bộ luồng từ duyệt quán ➔ chọn món ➔ nhập địa chỉ ➔ chọn voucher ➔ đặt hàng. |
| [`phase4-dashboard-chart.spec.ts`](../web-client/tests/e2e/phase4-dashboard-chart.spec.ts) | Kiểm tra hiển thị biểu đồ thống kê doanh thu và báo cáo tăng trưởng của Chủ quán và Admin. |
| [`phase4-form-modal.spec.ts`](../web-client/tests/e2e/phase4-form-modal.spec.ts) | Kiểm tra các Form nhập liệu: Tạo/Sửa món ăn, cập nhật giờ hoạt động, modal duyệt quán. |
| [`phase4-layout-nav.spec.ts`](../web-client/tests/e2e/phase4-layout-nav.spec.ts) | Kiểm tra thanh điều hướng phản hồi theo vai trò (Customer, Restaurant Owner, Admin). |
| [`phase4-table-filter.spec.ts`](../web-client/tests/e2e/phase4-table-filter.spec.ts) | Kiểm tra tính năng lọc đơn hàng theo trạng thái, sắp xếp theo thời gian và phân trang dữ liệu. |
| [`phase5-responsive-visual.spec.ts`](../web-client/tests/e2e/phase5-responsive-visual.spec.ts) | **Responsive Matrix & Visual Regression:** Kiểm thử hiển thị trên Mobile (375px), Tablet (768px) và Desktop (1440px). |
| [`phase5-smoke-matrix.spec.ts`](../web-client/tests/e2e/phase5-smoke-matrix.spec.ts) | Smoke test kiểm tra nhanh tính khả dụng của toàn bộ các tuyến đường chính trong hệ thống. |
| [`restaurant-ui-upgrade.spec.ts`](../web-client/tests/e2e/restaurant-ui-upgrade.spec.ts) | Kiểm tra trang chi tiết quán ăn, hiệu ứng Sticky Navigation thực đơn và Floating Cart Bar trên điện thoại. |

### Lệnh thực thi:
```bash
cd web-client

# Chạy không giao diện (Headless Mode)
npm run test:e2e

# Chạy với giao diện tương tác trực quan (Playwright UI Mode)
npx playwright test --ui
```

---

## 4. Tầng 3: Kiểm thử Đánh giá Trợ lý ảo AI Chatbot (LLM Benchmark)

Thư mục `chatbot-service/evaluation/` được trang bị bộ benchmark độc lập với **40 kịch bản hội thoại thực tế** (`cases.json`) để lượng hóa năng lực của mô hình LLM (Gemini / Qwen):

### 4.1. Các chỉ số đo lường (Evaluation Metrics):
1. **Intent Classification Accuracy (Độ chính xác phân loại ý định):** Nhận biết chính xác người dùng muốn đặt món, hỏi giá, tham khảo thực đơn hay yêu cầu hủy đơn.
2. **Entity & Parameter Extraction (Bóc tách thực thể):** Trích xuất đúng tên món ăn, số lượng và các ghi chú tùy chọn (ví dụ: *"ít ngọt"*, *"không lấy đá"*, *"cho nhiều ớt"*).
3. **Menu Grounding Rate (Tỷ lệ khớp thực đơn):** Đảm bảo bot chỉ tư vấn và tạo đơn cho các món có thực trong menu của quán, không sinh ảo giác (hallucination).
4. **Response Latency (Độ trễ phản hồi):** Đo lường thời gian từ lúc nhận câu hỏi đến lúc hoàn tất câu trả lời (Mục tiêu: < 2.5s).

### 4.2. Lệnh thực thi:
```bash
cd chatbot-service

# Chạy bộ test đơn vị và kiểm thử kết nối
python -m pytest evaluation/ -q

# Chạy kiểm thử benchmark toàn diện
python -m evaluation.run_eval --limit 1
```

---

## 5. Tầng 4: Kiểm thử AI Thị giác Máy tính (Vision Pytest Matrix)

Thư mục `vision-service/tests/` bao gồm **16 tập tin kiểm thử với hơn 90+ test cases** kiểm tra chặt chẽ độ tin cậy của Pipeline AI nhận diện món:

* `test_api.py`: Kiểm thử hợp đồng API `/detect`, xử lý lỗi định dạng ảnh không hợp lệ.
* `test_cache.py`: Kiểm thử cơ chế **LRU Cache** lưu kết quả nhận diện của ảnh trùng lặp để tiết kiệm GPU.
* `test_tracking.py`: Kiểm thử thuật toán **IoU Tracking** nhằm khử hiện tượng nhấp nháy (flickering) và đếm trùng món khi nhận diện qua video stream.
* `test_concurrency.py`: Kiểm thử khả năng chịu tải khi có nhiều người dùng đồng thời gửi ảnh.
* `test_inference.py`: Kiểm thử độ chính xác của mô hình **YOLOv8 Nano** và **Google LiteRT EfficientNet-B2** trên bộ dữ liệu kiểm định chuẩn (`golden_dataset.json`).

### Lệnh thực thi:
```bash
cd vision-service

# Chạy toàn bộ các bài test của Vision AI
pytest tests/ -v
```

---

## 6. Hàng rào Kiểm duyệt Tự động (Automated Quality Gates)

Để đảm bảo chất lượng mã nguồn luôn ở mức cao nhất, mã nguồn trước khi tích hợp vào nhánh chính bắt buộc phải vượt qua các rào cản kiểm duyệt:

1. **Linting Check:** Không có bất kỳ lỗi vi phạm cú pháp nào (`npm run lint` hoặc `flake8`).
2. **Formatting Check:** Code tuân thủ đúng chuẩn Prettier / Black (`npm run format:check`).
3. **Type Safety:** Không có lỗi kiểu dữ liệu TypeScript (`npm run build`).
4. **All Tests Pass:** 100% các bài Unit Test và Integration Test phải có trạng thái Passed.
