# 🍜 Foodee Vision Service — Vietnamese Food Detection & Classification

> Microservice AI thị giác máy tính (**Computer Vision**) chuyên trách phát hiện và phân loại **30 món ăn truyền thống Việt Nam** từ hình ảnh và video. Được xây dựng trên nền tảng **Flask**, tối ưu hóa inference bằng sự kết hợp giữa **YOLOv8** (Object Detection) và **Google LiteRT / EfficientNet-B2** (30-class Classification) đạt độ trễ siêu thấp và khả năng mở rộng cao trong môi trường Production.

---

## 🏗️ 1. Cấu trúc Thư mục

```text
vision-service/
├── app/
│   ├── api/                   # Modular Controller Blueprints
│   │   ├── __init__.py        # API Blueprint aggregator
│   │   ├── web.py             # GET / (Web Demo UI trực quan)
│   │   ├── image.py           # POST /image (Nhận diện món ăn trong ảnh)
│   │   ├── video.py           # POST /video & GET /video (Phân tích & tracking video)
│   │   ├── download.py        # GET /download/<type> (Tải ảnh/video kết quả)
│   │   └── health.py          # GET /health & GET /ready (Liveness & Readiness probes)
│   ├── services/              # Core Business & AI Processing Services
│   │   ├── cache.py           # Thread-safe LRU + TTL Classification Cache
│   │   ├── inference.py       # Pipeline YOLOv8 + LiteRT / TFLite với Letterbox
│   │   ├── media.py           # Xử lý video, vẽ bounding box & H.264 Web Streaming
│   │   ├── model_manager.py   # Quản lý metadata, SHA-256 checksum & model warmup
│   │   ├── storage.py         # Sandbox lưu trữ job cô lập theo UUID (chống Path Traversal)
│   │   └── tracking.py        # FoodTracker dựa trên IoU & khử trùng lặp vật thể
│   ├── templates/
│   │   └── demo.html          # Giao diện Web Demo test trực tiếp trên trình duyệt
│   ├── config.py              # Dynamic configuration & biến môi trường
│   ├── labels.py              # Danh mục 30 nhãn món ăn Việt Nam
│   ├── observability.py       # Structured JSON Logging & theo dõi X-Request-ID
│   ├── routes.py              # Backward-compatibility router chuyển tiếp về app.api
│   └── validators.py          # Kiểm định Magic Bytes nhị phân & đuôi file upload
├── models/                    # Trọng số mô hình AI & Registry
│   ├── classification/        # EfficientNet-B2 Float16 LiteRT (.tflite) & PyTorch (.pth)
│   ├── detection/             # YOLOv8 nano Object Detection (.pt)
│   └── model_registry.json    # Danh mục metadata, input shape & mã băm SHA-256
├── notebooks/
│   └── foodok.ipynb           # Jupyter Notebook huấn luyện và thử nghiệm mô hình
├── samples/                   # Dữ liệu ảnh và video mẫu để kiểm thử
│   ├── images/                # Ảnh mẫu: phở, bún bò huế, cơm tấm, bánh pía,...
│   └── videos/                # Video mẫu phục vụ kiểm thử pipeline video
├── scripts/                   # Công cụ đánh giá & chuyển đổi mô hình
│   ├── convert_pth_to_onnx.py # Chuyển đổi PyTorch checkpoint sang định dạng ONNX
│   ├── convert_saved_model_to_tflite.py # Lượng tử hóa float16 sang TFLite / LiteRT
│   ├── evaluate_models.py     # Đánh giá Accuracy, F1-Score & Confusion Matrix
│   └── model_ops.py           # Kiểm tra tính toàn vẹn và cập nhật model_registry.json
├── tests/                     # 90+ Comprehensive Pytest Test Suite
│   ├── golden_dataset.json    # Bộ benchmark kiểm soát sai số và chống hồi quy độ trễ
│   └── test_*.py              # Test cases: API, Cache, Concurrency, E2E, Media, Storage,...
├── Dockerfile                 # Multi-stage production container (python:3.11-slim, non-root)
├── docker-compose.yml         # File compose chạy độc lập vision-service
├── gunicorn.conf.py           # Cấu hình Gunicorn gthread workers & quản lý tái chế RAM
├── requirements.txt           # Runtime dependencies tối giản (< 200MB, ai-edge-litert)
├── requirements-dev.txt       # Dependencies kiểm thử & phát triển (pytest, pytest-xdist)
├── requirements-conversion.txt# Dependencies chuyển đổi mô hình (onnx, tf)
├── requirements-training.txt  # Dependencies huấn luyện (torch, torchvision)
├── .env.example               # Mẫu cấu hình biến môi trường
└── README.md                  # Tài liệu hướng dẫn sử dụng & vận hành
```

---

## 🍽️ 2. Danh mục 30 Món ăn Việt Nam Hỗ trợ

Mô hình được huấn luyện chuyên sâu để nhận diện chính xác 30 món ăn đặc trưng của ba miền Bắc - Trung - Nam:

| STT | Tên món | STT | Tên món | STT | Tên món |
|:---:|:---|:---:|:---|:---:|:---|
| **1** | Bánh bèo | **11** | Bánh pía | **21** | Canh chua |
| **2** | Bánh bột lọc | **12** | Bánh tét | **22** | Cao lầu |
| **3** | Bánh căn | **13** | Bánh tráng nướng | **23** | Cháo lòng |
| **4** | Bánh canh | **14** | Bánh xèo | **24** | Cơm tấm |
| **5** | Bánh chưng | **15** | Bún bò Huế | **25** | Gỏi cuốn |
| **6** | Bánh cuốn | **16** | Bún đậu mắm tôm | **26** | Hủ tiếu |
| **7** | Bánh đúc | **17** | Bún mắm | **27** | Mì Quảng |
| **8** | Bánh giò | **18** | Bún riêu | **28** | Nem chua |
| **9** | Bánh khọt | **19** | Bún thịt nướng | **29** | Phở |
| **10** | Bánh mì | **20** | Cá kho tộ | **30** | Xôi xéo |

---

## 🧠 3. Kiến trúc Pipeline AI Hai giai đoạn (Two-Stage Pipeline)

Dịch vụ áp dụng mô hình phân tầng hiệu năng cao để tối ưu tốc độ và độ chính xác:

```text
[ Ảnh/Frame Video ] 
        │
        ▼
┌────────────────────────────────────────┐
│  Giai đoạn 1: YOLOv8 Nano Detection    │ ──► Định vị bounding boxes (ROI) của thức ăn
│  (Input: 1x3x640x640, PyTorch CPU)     │     Lọc ngưỡng tin cậy & NMS IoU
└────────────────────────────────────────┘
        │
        ▼ Bóc tách từng vùng món ăn (Crop ROIs)
┌────────────────────────────────────────┐
│  Giai đoạn 2: EfficientNet-B2 LiteRT   │ ──► Phân loại chi tiết vào 30 lớp món ăn Việt
│  (Input: 1x260x260x3, Float16 LiteRT)  │     Tích hợp Letterbox & LRU Cache tăng tốc
└────────────────────────────────────────┘
        │
        ▼
[ Kết quả JSON: Danh sách món, Tọa độ Bbox & Tỷ lệ tin cậy ]
```

* **Object Detection:** YOLOv8 nano fine-tuned chuyên biệt cho vùng thức ăn (`models/detection/detection.pt`).
* **Classification:** EfficientNet-B2 lượng tử hóa Float16 chạy trên **Google LiteRT** (`ai-edge-litert`), tối ưu độ trễ xử lý chỉ từ 15ms - 35ms trên CPU.
* **Warmup tự động:** Tự động kích hoạt inference mồi khi service khởi động để loại bỏ hoàn toàn độ trễ Cold-Start cho người dùng đầu tiên.
* **Toàn vẹn mô hình (`model_registry.json`):** Kiểm tra mã băm SHA-256 lúc khởi động để bảo đảm trọng số không bị chỉnh sửa trái phép.

---

## 🚀 4. Hướng dẫn Cài đặt & Khởi chạy

### Cách 1: Chạy với Docker / Docker Compose (Khuyên dùng cho Production)

#### Chạy độc lập Service này:
```bash
# Build và chạy ngầm
docker compose up --build -d

# Xem log thời gian thực
docker compose logs -f
```
* Service sẵn sàng tại: `http://localhost:5000`
* Giao diện Web Demo test tại: `http://localhost:5000/`

#### Tích hợp trong Docker Compose toàn dự án (`foodee-be`):
Trong `docker-compose.yml` ở thư mục gốc, service mang tên `food-ai` (container `foodee-vision`). NestJS Core API kết nối qua biến môi trường:
```bash
FOOD_AI_URL=http://food-ai:5000
```

---

### Cách 2: Khởi chạy Môi trường Local (Python Virtualenv)

#### 1. Yêu cầu hệ thống:
* **Python:** `>= 3.11`
* **FFmpeg** (tùy chọn, phục vụ xuất codec H.264 cho video)

#### 2. Cài đặt môi trường ảo:
```bash
# Tạo môi trường ảo
python -m venv .venv

# Kích hoạt môi trường ảo:
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Cài đặt dependencies (bản development gồm pytest)
pip install -r requirements-dev.txt
```

#### 3. Cấu hình file `.env`:
```bash
cp .env.example .env
```

#### 4. Khởi chạy Server:

* **Môi trường Development (Flask auto-reload):**
```bash
flask --app app run --host=0.0.0.0 --port=5000
```

* **Môi trường Production (Gunicorn Multi-worker đa luồng):**
```bash
gunicorn --config gunicorn.conf.py app:app
```

---

## 📡 5. Chi tiết API Endpoints & Ví dụ cURL

### 5.1. Nhóm System, Web UI & Monitoring

| Method | Path | Mô tả |
|:------:|:-----|:------|
| `GET` | `/` | **Web Demo UI:** Giao diện trực quan tải ảnh/video và xem kết quả |
| `GET` | `/health` | **Liveness Probe:** Kiểm tra tiến trình server đang hoạt động |
| `GET` | `/ready` | **Readiness Probe:** Kiểm tra mô hình AI trong RAM & storage sẵn sàng |
| `GET` | `/video` | Xem hoặc stream video đã xử lý gần nhất |

#### Ví dụ kiểm tra `/ready`:
```bash
curl -X GET http://localhost:5000/ready
```
**Response (`200 OK`):**
```json
{
  "status": "ready",
  "checks": {
    "classifier_model": true,
    "detection_model": true,
    "storage_ready": true
  },
  "models": {
    "detection": { "loaded": true, "path": "models/detection/detection.pt" },
    "classifier_tflite": { "loaded": true, "path": "models/classification/classifier_b2_finetuned_from_pth_float16.tflite" }
  },
  "version": "1.0.0"
}
```

---

### 5.2. Nhóm Nghiệp vụ Nhận diện Món ăn

#### 📸 1. `POST /image` — Nhận diện Món ăn trong Ảnh
Hỗ trợ trường multipart `image` hoặc `file`. Định dạng chấp nhận: `.jpg`, `.jpeg`, `.png`, `.webp` (tối đa 10 MB).

```bash
curl -X POST http://localhost:5000/image \
  -F "image=@samples/images/pho.jpg"
```

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "job_id": "9f1c7d2e4a8b...",
  "total_detections": 1,
  "detections": [
    {
      "class_id": 28,
      "class_name": "Phở",
      "detection_confidence": 0.98,
      "classification_confidence": 0.81,
      "bbox": {
        "x1": 87,
        "y1": 25,
        "x2": 219,
        "y2": 146
      }
    }
  ],
  "class_counts": {
    "Phở": 1
  }
}
```

---

#### 🎥 2. `POST /video` — Nhận diện & Đếm Món ăn trong Video
Phân tích frame theo FPS target, theo dõi quỹ đạo đối tượng với thuật toán `FoodTracker IoU` và khử trùng lặp (không đếm 1 bát phở thành nhiều lần qua các frame).

```bash
curl -X POST http://localhost:5000/video \
  -F "file=@samples/videos/output_video.mp4"
```

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "job_id": "4d8e2f1a6c0b...",
  "video_processed": true,
  "total_items": 9,
  "food_detections": [
    { "food_name": "Bánh chưng", "count": 5 },
    { "food_name": "Bánh giò", "count": 3 },
    { "food_name": "Bánh tét", "count": 1 }
  ]
}
```

---

#### 📥 3. `GET /download/<file_type>` — Tải Ảnh/Video Kết quả
Tải file kết quả có vẽ bounding box và nhãn nhận diện theo mã `job_id` cô lập.
* `file_type`: `image` hoặc `video`.

```bash
# Tải ảnh đã vẽ bounding box:
curl "http://localhost:5000/download/image?job_id=9f1c7d2e4a8b..." --output result.jpg

# Tải video kết quả H.264:
curl "http://localhost:5000/download/video?job_id=4d8e2f1a6c0b..." --output result.mp4
```

---

## ⚙️ 6. Bảng Biến Môi trường Cấu hình (`.env`)

| Biến môi trường | Kiểu | Mặc định | Ý nghĩa & Mô tả |
|:---|:---:|:---:|:---|
| `FOOD_DETECTION_MODEL` | `str` | `models/detection/detection.pt` | Đường dẫn file trọng số YOLOv8 Detection |
| `FOOD_CLASSIFIER_MODEL` | `str` | `models/classification/classifier_b2_finetuned_from_pth_float16.tflite` | Đường dẫn model LiteRT Classifier |
| `FOOD_UPLOAD_FOLDER` | `str` | `runtime` | Thư mục lưu trữ tạm các job xử lý |
| `FOOD_DETECTION_CONFIDENCE` | `float`| `0.1` | Ngưỡng tin cậy tối thiểu để phát hiện vật thể YOLO |
| `FOOD_DETECTION_IOU` | `float`| `0.35` | Ngưỡng NMS IoU gộp bounding boxes trùng lặp |
| `FOOD_CLASSIFICATION_CONFIDENCE` | `float`| `0.5` | Ngưỡng tin cậy phân loại (nếu dưới ngưỡng gán nhãn `Unknown`) |
| `FOOD_VIDEO_TARGET_FPS` | `float`| `6.0` | Tần suất lấy mẫu frame phân tích trong video |
| `FOOD_TFLITE_THREADS` | `int` | `4` | Số luồng CPU thực thi LiteRT Interpreter |
| `FOOD_TRACK_IOU_THRESHOLD` | `float`| `0.3` | Ngưỡng IoU matching tracking giữa các frame video |
| `FOOD_TRACK_MAX_MISSED` | `int` | `3` | Số sample liên tiếp biến mất trước khi hủy track |
| `FOOD_MAX_IMAGE_BYTES` | `int` | `10485760` (10MB) | Dung lượng ảnh tối đa cho phép tải lên |
| `FOOD_MAX_UPLOAD_BYTES` | `int` | `104857600` (100MB)| Dung lượng tối đa request upload (HTTP 413) |
| `FOOD_CACHE_SIZE` | `int` | `1024` | Số lượng ROI crop lưu trong in-memory LRU Cache |
| `FOOD_CACHE_TTL` | `float`| `60.0` | Thời gian sống (giây) của mỗi entry trong cache |
| `FOOD_LETTERBOX_ENABLED` | `bool` | `false` | Bật/tắt padding bảo toàn tỷ lệ khung hình Letterbox |
| `FOOD_ALLOWED_ORIGINS` | `str` | `*` | Cấu hình CORS Allowed Origins (cách nhau dấu phẩy) |
| `FOOD_SKIP_WARMUP` | `bool` | `false` | Bỏ qua bước warmup model khi cần khởi động tức thì |
| **Cấu hình Gunicorn (Production)** | | | |
| `GUNICORN_BIND` | `str` | `0.0.0.0:5000` | Socket IP và Port lắng nghe |
| `GUNICORN_WORKERS` | `int` | `2` | Số lượng tiến trình Gunicorn worker |
| `GUNICORN_THREADS` | `int` | `2` | Số luồng `gthread` cho mỗi worker |
| `GUNICORN_TIMEOUT` | `int` | `120` | Timeout tối đa (giây) cho tác vụ phân tích video |

---

## 🚨 7. Quy ước Mã lỗi HTTP (Error Handling)

Hệ thống trả về mã lỗi JSON chuẩn hóa dạng: `{"success": false, "error": "...", "code": "..."}`:

| HTTP Status | Error Code (`code`) | Nguyên nhân |
|:-----------:|:--------------------|:------------|
| `400` | `MISSING_FILE_PART` | Thiếu file upload trong form multipart (cần đặt tên `image` hoặc `file`). |
| `400` | `EMPTY_FILENAME` | Người dùng gửi request upload nhưng không chọn file. |
| `400` | `IMAGE_DECODE_FAILED` | File ảnh bị hỏng không thể giải mã qua OpenCV. |
| `400` | `INVALID_VIDEO` | File video không có frame hoặc bị hỏng cấu trúc. |
| `400` | `INVALID_JOB_ID` | Tham số `job_id` chứa ký tự nguy hiểm (chặn Path Traversal). |
| `404` | `FILE_NOT_FOUND` | Không tìm thấy file download tương ứng với `job_id`. |
| `404` | `VIDEO_NOT_FOUND` | Chưa có video nào được xử lý để hiển thị. |
| `413` | `IMAGE_TOO_LARGE` | Ảnh vượt quá kích thước 10 MB cho phép. |
| `413` | `PAYLOAD_TOO_LARGE` | Dung lượng upload vượt quá 100 MB. |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Đuôi mở rộng không hỗ trợ (chỉ nhận JPG, PNG, WEBP cho ảnh; MP4, MOV, AVI cho video). |
| `415` | `INVALID_IMAGE_BYTES` | File giả mạo đuôi ảnh (không khớp Magic Bytes nhị phân hợp lệ). |
| `415` | `INVALID_VIDEO_BYTES` | File giả mạo đuôi video (không khớp Magic Bytes nhị phân hợp lệ). |
| `500` | `PROCESSING_FAILED` | Lỗi xảy ra trong quá trình encode video hoặc xử lý frame. |
| `503` | `NOT_READY` | Mô hình AI chưa nạp xong vào RAM hoặc storage chưa cấp quyền ghi. |

---

## 🛡️ 8. Bảo mật & Tối ưu Hiệu năng (Hardening & Performance)

* **Xác thực Magic Bytes nhị phân:** Kiểm tra trực tiếp các byte đầu (`FF D8 FF`, `89 50 4E 47`, `RIFF...WEBP`, `ftyp/moov`), ngăn chặn 100% việc tải lên shell script hay mã độc ngụy trang đuôi ảnh/video.
* **Sandbox & Ngăn chặn Path Traversal:** Mọi kết quả xử lý được phân vùng theo thư mục `runtime/jobs/{uuid4}/`. Tuyệt đối chặn ký tự `..`, `/` và `\` trong tham số `job_id`.
* **Thread-safe LRU Cache + TTL:** Lưu trữ kết quả phân loại của các vùng ảnh tương tự nhau, giúp tăng tốc độ xử lý video lên **200% - 300%** đối với các cảnh quay tĩnh.
* **Vectorized ImageNet Normalization:** Tiền xử lý ma trận ảnh bằng toán tử vectorized NumPy thay thế vòng lặp tuần tự, giảm thời gian xử lý tiền kỳ xuống dưới **1ms / crop**.
* **Bảo vệ quyền hạn Container:** Image Docker sử dụng user không đặc quyền `appuser` (UID `10001`), tuân thủ chuẩn an toàn thông tin container nghiêm ngặt.

---

## 🧪 9. Kiểm thử Tự động & Công cụ Mô hình (Testing & Scripts)

### 9.1. Chạy Bộ kiểm thử tự động (90+ Pytest Cases):
```bash
# Chạy toàn bộ test suite
pytest tests/ -v

# Chạy kiểm thử song song đa tiến trình (tăng tốc test)
pytest tests/ -n auto -q

# Chạy riêng kiểm thử hiệu năng & độ trễ
pytest tests/test_performance.py -v
```

### 9.2. Công cụ Đánh giá & Chuyển đổi Mô hình (`scripts/`):

```bash
# 1. Đánh giá độ chính xác, Confusion Matrix & F1-Score trên golden dataset:
python scripts/evaluate_models.py

# 2. Kiểm tra tính toàn vẹn SHA-256 và đồng bộ registry:
python scripts/model_ops.py --verify

# 3. Chuyển đổi trọng số PyTorch sang ONNX:
python scripts/convert_pth_to_onnx.py

# 4. Lượng tử hóa sang TFLite / LiteRT Float16:
python scripts/convert_saved_model_to_tflite.py
```
