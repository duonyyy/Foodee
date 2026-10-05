# Foodee AI Server

Server Python (FastAPI) xử lý AI/LLM cho chatbot Foodee — tách riêng từ NestJS backend.

## Cài đặt

```bash
# Tạo virtual environment
python -m venv venv

# Kích hoạt (Windows)
venv\Scripts\activate

# Kích hoạt (Linux/Mac)
source venv/bin/activate

# Cài dependencies
pip install -r requirements.txt
```

## Cấu hình

Copy `.env.example` thành `.env` và điền các giá trị:

```bash
cp .env.example .env
```

| Biến | Mô tả | Mặc định |
|------|--------|----------|
| `AI_SERVER_PORT` | Port server | `8000` |
| `AI_ALLOWED_ORIGINS` | Origin được phép khi expose AI service để debug | `http://localhost:3001` |
| `AI_SERVICE_TOKEN` | Token nội bộ cho NestJS gọi hai endpoint chat; bắt buộc | — |
| `LLM_PROVIDER` | `"local"` hoặc `"gemini"` | `"local"` |
| `GEMINI_API_KEY` | API key Google Gemini | — |
| `GEMINI_MODEL` | Model Gemini | `gemini-3.1-flash-lite` |
| `CHAT_LLM_BASE_URL` | URL LM Studio/vLLM | `http://127.0.0.1:1234/v1` |
| `CHAT_LLM_MODEL` | Tên model local | `qwen/qwen2.5-vl-7b` |
| `CHAT_LLM_TEMPERATURE` | Temperature | `0.3` |
| `CHAT_LLM_TIMEOUT_MS` | Timeout (ms) | `8000` |

## Chạy server

```bash
# Development (auto-reload)
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/health` | Health check |
| `GET` | `/ready` | Sẵn sàng khi đã cấu hình token nội bộ |
| `POST` | `/api/chat/general-reply` | Trả lời chat thông thường |
| `POST` | `/api/chat/parse-order-items` | Parse yêu cầu đặt món |

Hai endpoint `POST` yêu cầu header `X-AI-Service-Token`. Tạo **một** giá trị ngẫu nhiên
đủ dài và đặt cùng giá trị đó vào `core-api/.env` và `chatbot-service/.env` dưới tên
`AI_SERVICE_TOKEN`; không commit hay gửi token qua chat. Mặc định Docker Compose chỉ
cho NestJS gọi service trong mạng nội bộ, không publish cổng `8000` ra host. Nếu chạy
NestJS ngoài Docker để phát triển, chạy chatbot service trên localhost và đặt
`AI_SERVER_URL=http://localhost:8000` trong `core-api/.env`. CORS không thay thế xác thực.

## Docker

```bash
docker build -t foodee-ai .
docker run -p 127.0.0.1:8000:8000 --env-file .env foodee-ai
```

Khi `LLM_PROVIDER=local` nhưng LM Studio/vLLM chạy trên máy host, container không
được dùng `127.0.0.1:1234`: địa chỉ này là chính container. Dùng
`http://host.docker.internal:1234/v1` trong `CHAT_LLM_BASE_URL`.

## Đánh giá chatbot

Bộ 40 ca dữ liệu giả, công cụ chạy lại và báo cáo baseline nằm trong
[`evaluation/`](evaluation/README.md). Kết quả này chỉ đo hai endpoint AI;
chưa xác nhận chất lượng trên khách hàng thật hoặc luồng tạo đơn NestJS.
Lỗi provider trả mã riêng (`502` khi upstream HTTP lỗi, `503` khi không kết nối
hoặc thiếu cấu hình, `504` khi hết thời gian). JSON model sai định dạng trả
`502` với `detail.code=invalid_llm_output`; JSON array rỗng hợp lệ vẫn trả
`200` với `orderItems=[]`. NestJS hiển thị hai tình huống bằng thông báo khác nhau.
