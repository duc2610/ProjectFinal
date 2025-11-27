# Hướng dẫn chạy dự án với Docker

## Yêu cầu
- Docker Desktop đã được cài đặt và đang chạy
- Docker Compose (thường đi kèm với Docker Desktop)

## Cấu trúc dự án
Dự án bao gồm:
- **Backend**: .NET 8.0 API (chạy trên port 8080)
- **Frontend**: React + Vite (chạy trên port 8081)
- **SQL Server**: Database (chạy trên port 14333)
- **Python Services**: Writing API (port 8002) và Speaking API (port 8001)

## Cách chạy

### 1. Di chuyển vào thư mục backend
```bash
cd backend
```

### 2. Tạo file .env (tùy chọn)
Bạn có thể tạo file `.env` trong thư mục `backend` để cấu hình các biến môi trường:

```env
# Database
MSSQL_SA_PASSWORD=YourStrong@Passw0rd

# JWT
JWT_ISSUER=Capstone_SEP490_G22
JWT_AUDIENCE=Capstone_SEP490_G22
JWT_SECRET_KEY=your-secret-key-here
JWT_EXPIRE_MINUTES=30

# Mail Settings
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

# Gemini API (cho Python services)
GEMINI_API_KEY=your-gemini-api-key

# Azure Speech (cho Speaking API)
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=your-azure-region

# Frontend
# Lưu ý: Backend trong Docker chạy HTTP, không phải HTTPS
# Nếu bạn muốn dùng HTTPS, cần cấu hình certificate trong Docker
FRONTEND_API_BASE_URL=http://localhost:7100
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Default Accounts
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

**Lưu ý**: Nếu không tạo file `.env`, docker-compose sẽ sử dụng các giá trị mặc định.

### 3. Chạy Docker Compose
```bash
docker-compose up -d
```

Lệnh này sẽ:
- Build các Docker images cho backend, frontend và Python services
- Tạo và khởi động các containers
- Thiết lập network và volumes

### 4. Kiểm tra trạng thái
```bash
docker-compose ps
```

Bạn sẽ thấy các containers đang chạy:
- `toeic-backend` (port 8080)
- `toeic-frontend` (port 8081)
- `toeic-sql` (port 14333)
- `toeic-writing-api` (port 8002)
- `toeic-speaking-api` (port 8001)

### 5. Xem logs
```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f api
docker-compose logs -f frontend
```

### 6. Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:7100 (hoặc http://localhost:5045)
- **SQL Server**: localhost:14333

## Các lệnh hữu ích

### Dừng tất cả containers
```bash
docker-compose down
```

### Dừng và xóa volumes (bao gồm database)
```bash
docker-compose down -v
```

### Rebuild images
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Restart một service cụ thể
```bash
docker-compose restart api
docker-compose restart frontend
```

### Xem logs của một service
```bash
docker-compose logs -f api
```

## Xử lý lỗi

### Backend không kết nối được database
- Đợi SQL Server khởi động hoàn toàn (có thể mất 30-60 giây)
- Kiểm tra password trong biến môi trường `MSSQL_SA_PASSWORD`
- Xem logs: `docker-compose logs sqlserver`

### Frontend không kết nối được backend
- Kiểm tra `FRONTEND_API_BASE_URL` trong file `.env` hoặc docker-compose.yml
- Đảm bảo backend đã khởi động: `docker-compose logs api`
- Kiểm tra network: `docker network inspect toeic-network`

### Port đã được sử dụng
Nếu port bị chiếm, bạn có thể thay đổi trong `docker-compose.yml`:
```yaml
ports:
  - "8082:8080"  # Thay đổi port bên trái
```

## Lưu ý
- Lần đầu chạy có thể mất vài phút để download images và build
- SQL Server cần thời gian để khởi động (30-60 giây)
- Backend sẽ tự động chạy migrations khi khởi động
- Frontend được build với các biến môi trường tại thời điểm build, không phải runtime
- **Quan trọng**: Backend trong Docker chạy HTTP (không phải HTTPS). Nếu bạn cần HTTPS, cần cấu hình certificate hoặc dùng reverse proxy như nginx với SSL
- Frontend mặc định sẽ trỏ đến `http://localhost:7100` khi chạy Docker. Nếu bạn muốn dùng HTTPS, cần override biến môi trường `FRONTEND_API_BASE_URL=https://localhost:7100` và cấu hình HTTPS cho backend

