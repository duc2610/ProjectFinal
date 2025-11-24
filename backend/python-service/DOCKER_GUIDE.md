# Hướng dẫn chạy Python Services với Docker

## Tổng quan

Dự án có 2 Python services:
- **speaking-assessment**: API đánh giá kỹ năng nói (port 8001)
- **writing-assessment**: API đánh giá kỹ năng viết (port 8002)

## Yêu cầu

- **Docker và Docker Compose đã được cài đặt**
  - Nếu chưa có, xem hướng dẫn: [DOCKER_INSTALLATION.md](./DOCKER_INSTALLATION.md)
  - Hoặc tải Docker Desktop từ: https://www.docker.com/products/docker-desktop/
- File `.env` hoặc biến môi trường với các API keys cần thiết

## Các biến môi trường cần thiết

Tạo file `.env` ở thư mục root của backend (cùng cấp với `docker-compose.yml`) với nội dung:

```env
# Gemini AI (bắt buộc cho cả 2 services)
GEMINI_API_KEY=your_gemini_api_key_here

# Azure Speech (chỉ cần cho speaking-assessment)
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_region_here
```

## Cách chạy

### Phương pháp 1: Sử dụng Script Helper (Khuyến nghị)

Chúng tôi đã tạo các script helper để dễ dàng quản lý services:

**Trên Linux/Mac:**
```bash
cd python-service
chmod +x run-docker.sh
./run-docker.sh start
```

**Trên Windows (PowerShell):**
```powershell
cd python-service
.\run-docker.ps1 start
```

**Các lệnh có sẵn:**
- `./run-docker.sh start [all|writing|speaking]` - Khởi động services
- `./run-docker.sh stop [all|writing|speaking]` - Dừng services
- `./run-docker.sh restart [all|writing|speaking]` - Khởi động lại
- `./run-docker.sh logs [all|writing|speaking]` - Xem logs
- `./run-docker.sh status` - Xem trạng thái
- `./run-docker.sh rebuild [all|writing|speaking]` - Rebuild và khởi động

**Ví dụ:**
```bash
# Khởi động tất cả services
./run-docker.sh start

# Chỉ khởi động Writing API
./run-docker.sh start writing

# Xem logs của Speaking API
./run-docker.sh logs speaking

# Rebuild tất cả services
./run-docker.sh rebuild all
```

### Phương pháp 2: Sử dụng Docker Compose trực tiếp

### 1. Chạy tất cả services cùng lúc

Từ thư mục root của backend (nơi có file `docker-compose.yml`):

```bash
docker-compose up -d
```

Lệnh này sẽ:
- Build Docker images cho cả 2 services
- Khởi động containers
- Chạy ở chế độ background (`-d`)

### 2. Chạy từng service riêng lẻ

**Chỉ chạy Writing API:**
```bash
docker-compose up -d writing-api
```

**Chỉ chạy Speaking API:**
```bash
docker-compose up -d speaking-api
```

### 3. Xem logs

**Xem logs của tất cả services:**
```bash
docker-compose logs -f
```

**Xem logs của từng service:**
```bash
# Writing API
docker-compose logs -f writing-api

# Speaking API
docker-compose logs -f speaking-api
```

### 4. Dừng services

**Dừng tất cả services:**
```bash
docker-compose down
```

**Dừng và xóa volumes (nếu có):**
```bash
docker-compose down -v
```

### 5. Rebuild images

Nếu bạn đã thay đổi code và cần rebuild:

```bash
# Rebuild và khởi động lại
docker-compose up -d --build

# Hoặc rebuild từng service
docker-compose up -d --build writing-api
docker-compose up -d --build speaking-api
```

## Kiểm tra services đang chạy

### Kiểm tra containers

```bash
docker-compose ps
```

### Kiểm tra health

**Writing API:**
```bash
curl http://localhost:8002/health
```

**Speaking API:**
```bash
curl http://localhost:8001/health
```

### Kiểm tra root endpoints

**Writing API:**
```bash
curl http://localhost:8002/
```

**Speaking API:**
```bash
curl http://localhost:8001/
```

## Cấu trúc Docker

### Speaking Assessment Service

- **Dockerfile**: `python-service/python-services/speaking-assessment/Dockerfile`
- **Port**: 8001
- **Dependencies**: 
  - Python 3.11
  - FFmpeg (cho xử lý audio)
  - Azure Speech SDK
  - Gemini AI

### Writing Assessment Service

- **Dockerfile**: `python-service/python-services/writing-assessment/Dockerfile`
- **Port**: 8002
- **Dependencies**:
  - Python 3.11
  - Gemini AI

## Troubleshooting

### 1. Lỗi "Cannot connect to Docker daemon"

Đảm bảo Docker Desktop đang chạy (trên Windows/Mac) hoặc Docker daemon đang chạy (trên Linux).

### 2. Lỗi "Port already in use"

Nếu port 8001 hoặc 8002 đã được sử dụng:

**Cách 1**: Thay đổi port trong `docker-compose.yml`:
```yaml
ports:
  - "8003:8001"  # Thay đổi port bên ngoài
```

**Cách 2**: Dừng service đang sử dụng port đó.

### 3. Lỗi thiếu biến môi trường

Đảm bảo file `.env` đã được tạo và có đầy đủ các biến môi trường cần thiết.

### 4. Lỗi build Docker image

**Xóa cache và rebuild:**
```bash
docker-compose build --no-cache
docker-compose up -d
```

### 5. Xem logs chi tiết để debug

```bash
# Xem logs của container
docker-compose logs writing-api
docker-compose logs speaking-api

# Xem logs real-time
docker-compose logs -f writing-api
```

### 6. Vào trong container để debug

```bash
# Vào container của writing-api
docker-compose exec writing-api bash

# Vào container của speaking-api
docker-compose exec speaking-api bash
```

## Các lệnh hữu ích khác

### Xem thông tin chi tiết về containers

```bash
docker-compose ps
docker ps
```

### Dừng và xóa tất cả (bao gồm images)

```bash
docker-compose down --rmi all
```

### Restart một service cụ thể

```bash
docker-compose restart writing-api
docker-compose restart speaking-api
```

### Xem resource usage

```bash
docker stats
```

## Lưu ý

1. **API Keys**: Không commit file `.env` vào git. Thêm `.env` vào `.gitignore`.

2. **Ports**: Đảm bảo ports 8001 và 8002 không bị conflict với các services khác.

3. **Health Checks**: Cả 2 services đều có health checks tự động. Docker sẽ tự động restart nếu service không healthy.

4. **Networks**: Cả 2 services đều nằm trong network `toeic-network` và có thể giao tiếp với nhau qua tên service (`writing-api`, `speaking-api`).

## Ví dụ sử dụng API

### Writing API - Part 1 (Write Sentence)

```bash
curl -X POST "http://localhost:8002/assess/sentence" \
  -F "text=The man is reading a book" \
  -F "question_number=1" \
  -F "image=@path/to/image.jpg"
```

### Speaking API - Part 1 (Read Aloud)

```bash
curl -X POST "http://localhost:8001/assess" \
  -F "file=@path/to/audio.wav" \
  -F "question_type=read_aloud" \
  -F "question_number=1" \
  -F "reference_text=The quick brown fox jumps over the lazy dog"
```

## Tài liệu tham khảo

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

