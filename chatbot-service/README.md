# 🤖 Foodee Chatbot Service (AI Server)

> Microservice Python (**FastAPI**) chuyên trách xử lý AI / LLM cho chatbot đặt món và chăm sóc khách hàng của nền tảng **Foodee** — hoạt động độc lập và tách biệt khỏi NestJS Core Backend.

---

## 🏗️ 1. Cấu trúc Thư mục

```text
chatbot-service/
├── app/
│   ├── models/                # Pydantic Request/Response models
│   │   ├── chat_request.py    # GeneralReplyRequest, ParseOrderItemsRequest, ChatMenuItem
│   │   └── chat_response.py   # GeneralReplyResponse, ParseOrderItemsResponse, OrderItem
│   ├── routers/               # FastAPI Blueprints
│   │   └── chat.py            # /api/chat (health, general-reply, parse-order-items)
│   ├── services/              # Core AI & Prompt Engineering Services
│   │   ├── llm_service.py     # Gọi Gemini API hoặc Local LLM (OpenAI-compatible)
│   │   ├── prompt_service.py  # Xây dựng prompt & thuật toán lọc/xếp hạng thực đơn
│   │   └── response_parser.py # Bóc tách JSON, chuẩn hóa danh sách món & chặn hallucination
│   ├── auth.py                # Xác thực nội bộ token qua header X-AI-Service-Token
│   ├── config.py              # Pydantic BaseSettings quản lý biến môi trường
│   ├── main.py                # Entrypoint FastAPI, CORS middleware & route registration
│   └── models_registry.py     # Danh mục Metadata các model LLM hỗ trợ (Gemini & Local)
├── evaluation/                # Bộ đánh giá & kiểm thử chất lượng AI (40 ca test)
│   ├── cases.json             # Bộ dữ liệu 40 test cases thực đơn giả định
│   ├── run_eval.py            # CLI Runner chạy benchmark & tính độ trễ/độ chính xác
│   └── test_*.py              # Bộ 16+ Pytest test cases
├── Dockerfile                 # Multi-stage production container (python:3.11-slim)
├── requirements.txt           # Danh sách thư viện runtime tối giản (< 120MB)
├── .env.example               # File mẫu cấu hình biến môi trường
└── README.md                  # Tài liệu hướng dẫn tích hợp & vận hành
```

---

## ⚙️ 2. Yêu cầu & Cài đặt

- **Python:** `>= 3.11`
- **LM Studio / vLLM / Ollama** (nếu chạy local model) hoặc **Google Gemini API Key** (nếu dùng cloud).

### Cài đặt môi trường ảo:

```bash
# 1. Tạo virtual environment
python -m venv venv

# 2. Kích hoạt môi trường:
# Windows (PowerShell / CMD):
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# 3. Cài đặt dependencies
pip install -r requirements.txt
```

---

## 🔑 3. Cấu hình Biến môi trường (`.env`)

Sao chép từ file mẫu:

```bash
cp .env.example .env
```

| Biến | Kiểu | Mô tả | Mặc định |
|------|:----:|--------|----------|
| `AI_SERVER_PORT` | `int` | Cổng HTTP lắng nghe của server | `8000` |
| `AI_ALLOWED_ORIGINS` | `str` | Danh sách Origin CORS (cách nhau dấu phẩy) | `http://localhost:3000,http://localhost:3001` |
| `AI_SERVICE_TOKEN` | `str` | Token bí mật cho NestJS gọi vào; **Bắt buộc** | `""` |
| `LLM_PROVIDER` | `str` | Chọn nhà cung cấp LLM: `"local"` hoặc `"gemini"` | `"local"` |
| `GEMINI_API_KEY` | `str` | API Key Google Gemini (bắt buộc khi `LLM_PROVIDER=gemini`) | `""` |
| `GEMINI_MODEL` | `str` | Tên model Gemini muốn sử dụng | `gemini-3.1-flash-lite` |
| `CHAT_LLM_BASE_URL` | `str` | URL endpoint OpenAI-compatible của Local LLM | `http://127.0.0.1:1234/v1` |
| `CHAT_LLM_MODEL` | `str` | Tên model chạy trên Local server | `qwen/qwen2.5-vl-7b` |
| `CHAT_LLM_TEMPERATURE` | `float`| Nhiệt độ sinh từ của Local LLM (0.0 - 1.0) | `0.3` |
| `CHAT_LLM_TIMEOUT_MS` | `int` | Thời gian timeout mỗi lần gọi LLM (ms) | `8000` |

> [!IMPORTANT]
> **Bảo mật Service-to-Service:**  
> Giá trị `AI_SERVICE_TOKEN` phải được tạo ngẫu nhiên, đủ mạnh và giống nhau ở cả hai file `core-api/.env` và `chatbot-service/.env`. Mọi request gọi vào `/api/chat/*` đều phải đính kèm header:  
> `X-AI-Service-Token: <AI_SERVICE_TOKEN>`

---

## 🧠 4. Danh mục Model Hỗ trợ (`app/models_registry.py`)

Hệ thống tích hợp sẵn danh mục quản lý model (Model Registry Catalog) tối ưu cho tác vụ hội thoại đặt món:

### Google Gemini:
* `gemini-3.1-flash-lite` *(Mặc định)*: Tốc độ cao, tối ưu chi phí và độ trễ phản hồi.
* `gemini-1.5-flash`: Cân bằng tốc độ và khả năng suy luận cấu trúc JSON.
* `gemini-1.5-pro`: Khả năng suy luận cao, phù hợp các ca hội thoại dài nhiều lượt.

### Local LLM (qua LM Studio / vLLM / Ollama):
* `qwen/qwen2.5-vl-7b` *(Mặc định)*: Mô hình thị giác - ngôn ngữ đa phương thức, hiểu tiếng Việt xuất sắc.
* `qwen/qwen2.5-7b-instruct`: Tối ưu hóa phản hồi chỉ dẫn bằng tiếng Việt tự nhiên.
* `meta-llama/Llama-3.2-3B-Instruct`: Mô hình siêu nhẹ, độ trễ thấp phù hợp máy cấu hình vừa phải.

---

## 🚀 5. Khởi chạy Server

```bash
# Môi trường Development (tự động reload khi sửa code):
uvicorn app.main:app --reload --port 8000

# Môi trường Production:
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Kiểm tra trạng thái server:
```bash
curl http://localhost:8000/health
```

---

## 📡 6. Chi tiết API Endpoints

### 6.1. Nhóm System & Monitoring

| Method | Path | Bảo mật | Mô tả |
|--------|------|:-------:|-------|
| `GET` | `/health` | Không | Kiểm tra trạng thái server và model LLM đang kích hoạt |
| `GET` | `/ready` | Không | Kubernetes/Docker Readiness probe (báo lỗi `503` nếu chưa có token) |
| `GET` | `/api/models` | Không | Liệt kê catalog model (`?provider=local` hoặc `?provider=gemini`) |
| `GET` | `/api/chat/health` | Không | Health check riêng của router chat (`{"status": "ok"}`) |

---

### 6.2. Nhóm Nghiệp vụ Chatbot (Yêu cầu Header `X-AI-Service-Token`)

#### 💬 1. `POST /api/chat/general-reply`
Trả lời hội thoại tự nhiên với khách hàng, tư vấn món ăn từ thực đơn truyền vào và đưa ra gợi ý tương tác.

* **Request Body:**
```json
{
  "userMessage": "Quán mình có món gì ngon thanh đạm không em?",
  "menuFlat": [
    {
      "id": "food-01",
      "name": "Gỏi cuốn tôm thịt",
      "price": 35000,
      "description": "Tươi mát, ít dầu mỡ",
      "image": "https://example.com/goicuon.jpg",
      "link": "/menu/food-01",
      "restaurantId": "res-01"
    }
  ]
}
```

* **Response Body (`200 OK`):**
```json
{
  "reply": "Dạ quán có Gỏi cuốn tôm thịt rất thanh mát và ít dầu mỡ, bạn có muốn thử không ạ?",
  "suggestions": [
    {
      "id": "food-01",
      "name": "Gỏi cuốn tôm thịt",
      "price": 35000,
      "image": "https://example.com/goicuon.jpg",
      "link": "/menu/food-01"
    }
  ],
  "action": null
}
```

---

#### 🛒 2. `POST /api/chat/parse-order-items`
Bóc tách danh sách món ăn và số lượng cụ thể từ câu nói đặt hàng tự nhiên của khách để đưa vào giỏ hàng.

* **Request Body:**
```json
{
  "userMessage": "Cho anh 2 suất bún bò với 1 cốc trà đá nhé",
  "menuFlat": [
    {
      "id": "food-10",
      "name": "Bún bò Huế đặc biệt",
      "price": 55000,
      "restaurantId": "res-01"
    },
    {
      "id": "food-11",
      "name": "Trà đá",
      "price": 5000,
      "restaurantId": "res-01"
    }
  ]
}
```

* **Response Body (`200 OK`):**
```json
{
  "orderItems": [
    {
      "id": "food-10",
      "name": "Bún bò Huế đặc biệt",
      "quantity": 2,
      "price": 0,
      "restaurantId": "res-01"
    },
    {
      "id": "food-11",
      "name": "Trà đá",
      "quantity": 1,
      "price": 0,
      "restaurantId": "res-01"
    }
  ]
}
```
*(Nếu người dùng không đặt món nào trong thực đơn, `orderItems` trả về mảng rỗng `[]`)*

---

### 6.3. Quy ước Mã lỗi HTTP (Error Handling)

Hệ thống phân tách lỗi rõ ràng giữa lỗi cấu hình, xác thực và lỗi từ nhà cung cấp LLM:

| HTTP Status | Code (`detail.code`) | Nguyên nhân |
|:-----------:|:---------------------|-------------|
| `401` | `unauthorized_service` | Thiếu hoặc sai header `X-AI-Service-Token`. |
| `503` | `service_not_configured` | Chưa cấu hình `AI_SERVICE_TOKEN` hoặc thiếu `GEMINI_API_KEY`. |
| `503` | `upstream_unavailable` | Không thể kết nối tới server LLM (LM Studio / Gemini endpoint). |
| `504` | `upstream_timeout` | Quá thời gian chờ phản hồi từ LLM (`CHAT_LLM_TIMEOUT_MS`). |
| `502` | `invalid_llm_output` | LLM trả về văn bản không đúng định dạng JSON yêu cầu. |
| `502` | `upstream_http_error` | Nhà cung cấp LLM phản hồi mã lỗi HTTP (kèm `upstream_status`). |

---

## 🐳 7. Chạy với Docker

### 7.1. Chạy độc lập Container

```bash
# Build image
docker build -t foodee-chatbot .

# Chạy container
docker run -d --name foodee-chatbot \
  -p 8000:8000 \
  --env-file .env \
  foodee-chatbot
```

> [!TIP]
> **Kết nối Local LLM trên máy host từ Docker:**  
> Khi `LLM_PROVIDER=local` nhưng LM Studio/vLLM đang chạy trên máy tính ngoài container:  
> - Không dùng `127.0.0.1:1234` (vì đó là chính bên trong container).  
> - Đặt `CHAT_LLM_BASE_URL=http://host.docker.internal:1234/v1` trong file `.env`.

### 7.2. Tích hợp trong Docker Compose toàn hệ thống

Trong file `docker-compose.yml` ở thư mục gốc của dự án, service được cấu hình với tên `ai-server`:
- Giao tiếp qua mạng nội bộ Docker (`foodee-network`).
- NestJS Core API kết nối qua biến: `AI_SERVER_URL=http://ai-server:8000`.
- Tự động kiểm tra sức khỏe thông qua endpoint `/ready`.

---

## 🧪 8. Kiểm thử & Đánh giá (Evaluation & Testing)

Thư mục [`evaluation/`](evaluation/README.md) cung cấp bộ 40 ca dữ liệu giả lập (synthetic cases) để kiểm tra tính ổn định của prompt và khả năng bóc tách đơn hàng:

```bash
# 1. Chạy toàn bộ 16+ unit tests của bộ evaluation
python -m pytest evaluation/ -q

# 2. Chạy đánh giá toàn bộ 40 test cases và xuất báo cáo kết quả
python -m evaluation.run_eval --output evaluation/results/baseline.json

# 3. Thử nghiệm kết nối nhanh với 1 case duy nhất
python -m evaluation.run_eval --output evaluation/results/probe.json --limit 1
```
