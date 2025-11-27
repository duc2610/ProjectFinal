# Hướng dẫn chi tiết chạy dự án ToeicGenius với Docker

## Bước 1: Kiểm tra Docker đã cài đặt

### 1.1. Kiểm tra Docker Desktop
Mở PowerShell hoặc Command Prompt và chạy lệnh:
```powershell
docker --version
```

**Kết quả mong đợi**: Hiển thị phiên bản Docker (ví dụ: `Docker version 24.0.0`)

**Nếu chưa cài đặt**:
1. Tải Docker Desktop từ: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop
3. Đợi Docker Desktop khởi động hoàn toàn (icon Docker ở system tray phải màu xanh)

### 1.2. Kiểm tra Docker đang chạy
```powershell
docker ps
```

**Kết quả mong đợi**: Hiển thị danh sách containers (có thể trống nếu chưa chạy container nào)

**Nếu lỗi**: Docker Desktop chưa khởi động, hãy mở Docker Desktop và đợi nó khởi động xong.

### 1.3. Kiểm tra Docker Compose
```powershell
docker-compose --version
```

**Kết quả mong đợi**: Hiển thị phiên bản Docker Compose (ví dụ: `Docker Compose version v2.20.0`)

---

## Bước 2: Chuẩn bị môi trường

### 2.1. Di chuyển vào thư mục root của dự án
Mở PowerShell hoặc Command Prompt, di chuyển đến thư mục root của dự án:
```powershell
cd D:\Fall2025\ProjectFinal
```

**Kiểm tra**: Bạn phải thấy file `docker-compose.yml` trong thư mục hiện tại:
```powershell
dir docker-compose.yml
```

**Cấu trúc thư mục mong đợi**:
```
ProjectFinal/
├── docker-compose.yml  ← File này
├── backend/
│   └── ToeicGenius/
└── frontend/
```

### 2.2. (Tùy chọn) Tạo file .env
Nếu bạn muốn cấu hình các biến môi trường tùy chỉnh, tạo file `.env` trong thư mục root của dự án:

**Cách 1: Tạo bằng PowerShell**
```powershell
New-Item -Path .env -ItemType File
```

**Cách 2: Tạo bằng Notepad**
```powershell
notepad .env
```

**Nội dung file .env mẫu** (copy và paste vào file .env):
```env
# Database
MSSQL_SA_PASSWORD=YourStrong@Passw0rd

# JWT
JWT_ISSUER=Capstone_SEP490_G22
JWT_AUDIENCE=Capstone_SEP490_G22
JWT_SECRET_KEY=your-secret-key-here-change-this
JWT_EXPIRE_MINUTES=30

# Mail Settings (nếu cần)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@toeicgenius.com

# AWS (nếu sử dụng)
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your-bucket-name
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key

# Gemini API (cho Python services - bắt buộc nếu dùng Writing/Speaking)
GEMINI_API_KEY=your-gemini-api-key-here

# Azure Speech (cho Speaking API - bắt buộc nếu dùng Speaking)
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=your-azure-region

# Frontend
FRONTEND_API_BASE_URL=http://localhost:7100
VITE_GOOGLE_CLIENT_ID=your-google-client-id-if-needed

# Default Accounts (tùy chọn)
ADMIN_EMAIL=admin@toeicgenius.com
ADMIN_NAME=System Admin
ADMIN_PASSWORD=Admin@123
CREATOR_EMAIL=creator@toeicgenius.com
CREATOR_NAME=Test Creator
CREATOR_PASSWORD=Creator@123
EXAMINEE_EMAIL=examinee@toeicgenius.com
EXAMINEE_NAME=Regular Examinee
EXAMINEE_PASSWORD=Examinee@123
```

**Lưu ý**: 
- Nếu không tạo file `.env`, Docker sẽ dùng các giá trị mặc định trong `docker-compose.yml`
- Các giá trị quan trọng cần thay đổi: `GEMINI_API_KEY`, `MSSQL_SA_PASSWORD`, `JWT_SECRET_KEY`

---

## Bước 3: Chạy Docker Compose

### 3.1. Cách 1: Sử dụng script tự động (Khuyến nghị)

Chạy script PowerShell:
```powershell
.\run-docker.ps1
```

Script sẽ:
- Kiểm tra Docker đang chạy
- Tự động build và khởi động tất cả services
- Hiển thị thông tin truy cập

### 3.2. Cách 2: Chạy thủ công

#### Bước 3.2.1: Build và khởi động tất cả services
```powershell
docker-compose up -d
```

**Giải thích lệnh**:
- `docker-compose up`: Khởi động các services
- `-d`: Chạy ở chế độ background (detached mode)

**Quá trình này sẽ**:
1. Download các Docker images cần thiết (lần đầu có thể mất 5-10 phút)
2. Build images cho backend, frontend và Python services
3. Tạo network và volumes
4. Khởi động các containers

**Thời gian**: Lần đầu có thể mất 5-15 phút tùy tốc độ internet và máy tính.

#### Bước 3.2.2: Kiểm tra trạng thái
Sau khi chạy lệnh, đợi khoảng 30 giây rồi kiểm tra:
```powershell
docker-compose ps
```

**Kết quả mong đợi**: Tất cả services có status là "Up" hoặc "Up (healthy)":
```
NAME                  STATUS
toeic-backend         Up
toeic-frontend        Up
toeic-sql             Up
toeic-writing-api     Up (healthy)
toeic-speaking-api    Up (healthy)
```

---

## Bước 4: Kiểm tra logs và xử lý lỗi

### 4.1. Xem logs của tất cả services
```powershell
docker-compose logs -f
```

**Giải thích**: 
- `-f`: Theo dõi logs real-time (nhấn `Ctrl+C` để thoát)

### 4.2. Xem logs của từng service

**Backend (API)**:
```powershell
docker-compose logs -f api
```

**Frontend**:
```powershell
docker-compose logs -f frontend
```

**SQL Server**:
```powershell
docker-compose logs -f sqlserver
```

**Writing API**:
```powershell
docker-compose logs -f writing-api
```

**Speaking API**:
```powershell
docker-compose logs -f speaking-api
```

### 4.3. Kiểm tra lỗi thường gặp

#### Lỗi: Port đã được sử dụng
**Triệu chứng**: 
```
Error: bind: address already in use
```

**Giải pháp**:
1. Kiểm tra port nào đang bị chiếm:
```powershell
netstat -ano | findstr :7100
netstat -ano | findstr :3000
netstat -ano | findstr :14333
```

2. Dừng ứng dụng đang dùng port đó, hoặc thay đổi port trong `docker-compose.yml`

#### Lỗi: SQL Server chưa sẵn sàng
**Triệu chứng**: Backend không kết nối được database

**Giải pháp**:
1. Đợi SQL Server khởi động (30-60 giây)
2. Kiểm tra logs:
```powershell
docker-compose logs sqlserver
```

3. Nếu vẫn lỗi, restart SQL Server:
```powershell
docker-compose restart sqlserver
```

#### Lỗi: Frontend không build được
**Triệu chứng**: Lỗi khi build frontend image

**Giải pháp**:
1. Kiểm tra logs:
```powershell
docker-compose logs frontend
```

2. Rebuild frontend:
```powershell
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### Lỗi: Backend không build được
**Triệu chứng**: Lỗi khi build backend image

**Giải pháp**:
1. Kiểm tra logs:
```powershell
docker-compose logs api
```

2. Rebuild backend:
```powershell
docker-compose build --no-cache api
docker-compose up -d api
```

---

## Bước 5: Truy cập ứng dụng

### 5.1. Kiểm tra services đã sẵn sàng

Chạy lệnh để xem trạng thái:
```powershell
docker-compose ps
```

Đảm bảo tất cả services đều "Up".

### 5.2. Truy cập Frontend
Mở trình duyệt và truy cập:
```
http://localhost:3000
```

**Kết quả mong đợi**: Giao diện ứng dụng ToeicGenius hiển thị

### 5.3. Truy cập Backend API
Mở trình duyệt và truy cập:
```
http://localhost:7100/swagger
```

**Kết quả mong đợi**: Swagger UI hiển thị các API endpoints

### 5.4. Kiểm tra API hoạt động
Thử gọi một API đơn giản:
```powershell
curl http://localhost:7100/api/health
```

Hoặc mở trong trình duyệt:
```
http://localhost:7100/api/health
```

---

## Bước 6: Các lệnh quản lý thường dùng

### 6.1. Dừng tất cả services
```powershell
docker-compose down
```

**Lưu ý**: Lệnh này dừng containers nhưng không xóa volumes (database vẫn giữ nguyên)

### 6.2. Dừng và xóa tất cả (bao gồm database)
```powershell
docker-compose down -v
```

**Cảnh báo**: Lệnh này sẽ xóa tất cả dữ liệu trong database!

### 6.3. Restart một service cụ thể
```powershell
# Restart backend
docker-compose restart api

# Restart frontend
docker-compose restart frontend

# Restart SQL Server
docker-compose restart sqlserver
```

### 6.4. Rebuild và restart một service
```powershell
# Rebuild và restart backend
docker-compose build --no-cache api
docker-compose up -d api

# Rebuild và restart frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### 6.5. Xem thông tin chi tiết về containers
```powershell
# Xem thông tin tất cả containers
docker ps -a

# Xem thông tin network
docker network inspect toeic-network

# Xem thông tin volumes
docker volume ls
```

### 6.6. Xem sử dụng tài nguyên
```powershell
docker stats
```

Nhấn `Ctrl+C` để thoát.

---

## Bước 7: Kiểm tra kết nối giữa các services

### 7.1. Kiểm tra network
```powershell
docker network inspect toeic-network
```

**Kết quả mong đợi**: Tất cả containers đều trong cùng một network

### 7.2. Test kết nối từ container này sang container khác
```powershell
# Test từ backend đến SQL Server
docker exec toeic-backend ping -c 3 toeic-sql

# Test từ backend đến Writing API
docker exec toeic-backend ping -c 3 writing-api

# Test từ backend đến Speaking API
docker exec toeic-backend ping -c 3 speaking-api
```

---

## Bước 8: Xử lý sự cố nâng cao

### 8.1. Xóa tất cả và bắt đầu lại
```powershell
# Dừng và xóa tất cả
docker-compose down -v

# Xóa images (nếu cần)
docker-compose down --rmi all

# Build lại từ đầu
docker-compose build --no-cache
docker-compose up -d
```

### 8.2. Kiểm tra logs chi tiết
```powershell
# Xem logs của 100 dòng cuối
docker-compose logs --tail=100 api

# Xem logs từ một thời điểm cụ thể
docker-compose logs --since 10m api
```

### 8.3. Vào trong container để debug
```powershell
# Vào container backend
docker exec -it toeic-backend /bin/bash

# Vào container frontend
docker exec -it toeic-frontend /bin/sh

# Vào container SQL Server
docker exec -it toeic-sql /bin/bash
```

### 8.4. Kiểm tra database
```powershell
# Kết nối đến SQL Server từ container
docker exec -it toeic-sql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd"
```

---

## Checklist hoàn chỉnh

Trước khi báo lỗi, hãy kiểm tra:

- [ ] Docker Desktop đã khởi động và chạy
- [ ] Đã chạy `docker-compose up -d` thành công
- [ ] Tất cả containers đều "Up" (kiểm tra bằng `docker-compose ps`)
- [ ] Đã đợi đủ thời gian cho SQL Server khởi động (30-60 giây)
- [ ] Đã kiểm tra logs không có lỗi nghiêm trọng
- [ ] Port 3000, 7100, 14333 không bị chiếm bởi ứng dụng khác
- [ ] Đã kiểm tra firewall không chặn các port này

---

## Liên hệ hỗ trợ

Nếu gặp vấn đề, hãy cung cấp:
1. Output của `docker-compose ps`
2. Logs của service bị lỗi: `docker-compose logs [service-name]`
3. Output của `docker --version` và `docker-compose --version`
4. Mô tả chi tiết lỗi và các bước đã thực hiện

---

## Tóm tắt nhanh

```powershell
# 1. Di chuyển vào thư mục root của dự án
cd D:\Fall2025\ProjectFinal

# 2. Chạy Docker Compose
docker-compose up -d

# 3. Kiểm tra trạng thái
docker-compose ps

# 4. Xem logs (nếu cần)
docker-compose logs -f

# 5. Truy cập ứng dụng
# Frontend: http://localhost:3000
# Backend: http://localhost:7100/swagger
```

Chúc bạn thành công! 🚀

