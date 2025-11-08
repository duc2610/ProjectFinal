# Python Services

Các Python services cho hệ thống đánh giá TOEIC.

## Services

- **speaking-assessment** (Port 8001): API đánh giá kỹ năng nói
- **writing-assessment** (Port 8002): API đánh giá kỹ năng viết

## Quick Start

### 0. Cài đặt Docker (Nếu chưa có)

**Nếu bạn chưa cài Docker, xem hướng dẫn chi tiết tại:** [DOCKER_INSTALLATION.md](./DOCKER_INSTALLATION.md)

**Tóm tắt nhanh:**
1. Tải Docker Desktop từ: https://www.docker.com/products/docker-desktop/
2. Cài đặt và khởi động lại máy
3. Mở Docker Desktop và đợi nó khởi động xong
4. Kiểm tra: `docker --version` và `docker compose version`

### 1. Tạo file `.env`

Tạo file `.env` ở thư mục root của backend với nội dung:

```env
GEMINI_API_KEY=your_gemini_api_key_here
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_region_here
```

### 2. Chạy với Docker

**Cách 1: Chạy từ thư mục root (Khuyến nghị - Dễ nhất)**

```powershell
# Windows (từ thư mục backend)
.\run-python-services.ps1 start

# Linux/Mac (từ thư mục backend)
chmod +x run-python-services.sh
./run-python-services.sh start
```

**Cách 2: Chạy từ thư mục python-service**

```bash
# Linux/Mac
cd python-service
chmod +x run-docker.sh
./run-docker.sh start

# Windows
cd python-service
.\run-docker.ps1 start
```

**Cách 3: Sử dụng Docker Compose trực tiếp**

```bash
# Từ thư mục root có docker-compose.yml
docker compose up -d
# Hoặc (nếu dùng v1)
docker-compose up -d
```

### 3. Kiểm tra services

```bash
# Kiểm tra health
curl http://localhost:8001/health  # Speaking API
curl http://localhost:8002/health  # Writing API
```

## Tài liệu chi tiết

Xem file [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) để biết hướng dẫn chi tiết.

## Cấu trúc

```
python-service/
├── python-services/
│   ├── speaking-assessment/
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   └── requirements.txt
│   └── writing-assessment/
│       ├── Dockerfile
│       ├── main.py
│       └── requirements.txt
├── run-docker.sh          # Script helper (Linux/Mac)
├── run-docker.ps1         # Script helper (Windows)
├── DOCKER_GUIDE.md        # Hướng dẫn chi tiết
└── README.md              # File này
```

