# Hướng dẫn đầy đủ - Dự án ToeicGenius với Docker

## 📑 Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt Docker](#cài-đặt-docker)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [Chạy dự án lần đầu](#chạy-dự-án-lần-đầu)
5. [Quản lý Database](#quản-lý-database)
6. [Cập nhật code](#cập-nhật-code)
7. [Quản lý và xử lý lỗi](#quản-lý-và-xử-lý-lỗi)
8. [Các lệnh thường dùng](#các-lệnh-thường-dùng)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)
10. [Tóm tắt nhanh](#tóm-tắt-nhanh)

---

## 🎯 Giới thiệu

### Yêu cầu duy nhất: Docker

Với Docker, bạn **KHÔNG CẦN** cài đặt:
- ❌ .NET SDK
- ❌ Node.js
- ❌ SQL Server
- ❌ Python
- ❌ Bất kỳ phần mềm nào khác

**Tất cả đã được đóng gói sẵn trong Docker containers!**

### Các services trong dự án:
- **Backend**: .NET 8.0 API (port 7100)
- **Frontend**: React + Vite (port 3000)
- **SQL Server**: Database (port 14333)
- **Writing API**: Python service (port 8002)
- **Speaking API**: Python service (port 8001)

---

## 📦 Cài đặt Docker

### Windows:

1. **Tải Docker Desktop:**
   - Truy cập: https://www.docker.com/products/docker-desktop
   - Tải phiên bản cho Windows
   - File tải về: `Docker Desktop Installer.exe`

2. **Cài đặt:**
   - Chạy file installer
   - Làm theo hướng dẫn cài đặt
   - **Quan trọng**: Chọn "Use WSL 2 instead of Hyper-V" (nếu được hỏi)
   - Khởi động lại máy tính nếu được yêu cầu

3. **Khởi động Docker Desktop:**
   - Mở Docker Desktop từ Start Menu
   - Đợi Docker Desktop khởi động hoàn toàn (icon Docker ở system tray phải màu xanh)
   - Lần đầu có thể mất 1-2 phút

4. **Kiểm tra cài đặt:**
   ```powershell
   docker --version
   docker-compose --version
   ```
   - Nếu hiển thị version số → Cài đặt thành công!

### macOS:

1. **Tải Docker Desktop:**
   - Truy cập: https://www.docker.com/products/docker-desktop
   - Tải phiên bản cho Mac (Intel hoặc Apple Silicon)

2. **Cài đặt:**
   - Mở file `.dmg` đã tải
   - Kéo Docker vào Applications
   - Mở Docker từ Applications
   - Làm theo hướng dẫn

3. **Kiểm tra:**
   ```bash
   docker --version
   docker-compose --version
   ```

### Linux (Ubuntu/Debian):

```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user vào docker group (tùy chọn)
sudo usermod -aG docker $USER

# Cài đặt Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Kiểm tra
docker --version
docker compose version
```

### Yêu cầu hệ thống:

- **RAM**: 8GB (khuyến nghị 16GB)
- **Ổ cứng**: 20GB trống
- **CPU**: 2 cores (khuyến nghị 4 cores)
- **Hệ điều hành**: Windows 10/11, macOS 10.15+, hoặc Linux

**Lưu ý:**
- Docker Desktop cần **WSL 2** trên Windows 10/11
- Đảm bảo **Virtualization** được bật trong BIOS (nếu cần)

---

## 📁 Cấu trúc dự án

### Cấu trúc thư mục:

```
ProjectFinal/
├── docker-compose.yml      ← File chính để chạy TẤT CẢ services
├── run-docker.ps1          ← Script chạy tất cả services
├── check-docker.ps1        ← Script kiểm tra môi trường
├── backend/
│   ├── .env                ← File cấu hình cho backend và Python services
│   ├── ToeicGenius/        ← Backend .NET
│   └── python-service/     ← Python services
└── frontend/
    └── .env                ← File cấu hình cho frontend
```

### File quan trọng:

- **`docker-compose.yml`**: Cấu hình tất cả services
- **`run-docker.ps1`**: Script tự động chạy Docker
- **`check-docker.ps1`**: Script kiểm tra môi trường
- **`backend/.env`**: File cấu hình biến môi trường cho backend và Python services (đã có sẵn)
- **`frontend/.env`**: File cấu hình biến môi trường cho frontend (đã có sẵn)

---

## 🚀 Chạy dự án lần đầu

### Bước 1: Di chuyển vào thư mục root

```powershell
cd D:\Fall2025\ProjectFinal
```

**Kiểm tra**: Bạn phải thấy file `docker-compose.yml` trong thư mục hiện tại:
```powershell
dir docker-compose.yml
```

### Bước 2: Kiểm tra file .env

Dự án đã có sẵn các file `.env` trong từng thư mục:

**File `backend/.env`** - Chứa cấu hình cho backend và Python services:
```env
GEMINI_API_KEY=your-gemini-api-key-here
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=your-azure-region
```

**File `frontend/.env`** - Chứa cấu hình cho frontend:
```env
VITE_API_BASE_URL=https://localhost:7100/
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Lưu ý**: 
- Các file `.env` đã có sẵn trong dự án
- Bạn có thể chỉnh sửa các giá trị trong các file này nếu cần
- Docker Compose sẽ tự động đọc các biến môi trường từ các file này
- Các giá trị mặc định trong `docker-compose.yml` sẽ được sử dụng nếu không có trong file `.env`

### Bước 3: Chạy Docker Compose

**Cách 1: Sử dụng script tự động (Khuyến nghị)**
```powershell
.\run-docker.ps1
```

Script sẽ:
- Kiểm tra Docker đang chạy
- Tự động build và khởi động tất cả services
- Hiển thị thông tin truy cập

**Cách 2: Chạy thủ công**
```powershell
docker-compose up -d
```

**Giải thích lệnh:**
- `docker-compose up`: Khởi động các services
- `-d`: Chạy ở chế độ background (detached mode)

**Quá trình này sẽ:**
1. Download các Docker images cần thiết (lần đầu có thể mất 5-10 phút)
2. Build images cho backend, frontend và Python services
3. Tạo network và volumes
4. Khởi động các containers

**Thời gian**: Lần đầu có thể mất 5-15 phút tùy tốc độ internet và máy tính.

### Bước 4: Kiểm tra trạng thái

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

### Bước 5: Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:7100/swagger

---

## 🗄️ Quản lý Database

### Database được xử lý tự động

✅ **Những gì đã được cấu hình:**
1. SQL Server tự động chạy trong Docker container
2. Database được tạo tự động khi backend khởi động (nếu chưa có)
3. Dữ liệu được lưu vĩnh viễn trong Docker volume (không bị mất khi restart)
4. Migrations sẽ được chạy tự động khi backend khởi động

### Thông tin Database

- **Server**: `toeic-sql` (từ container) hoặc `localhost,14333` (từ máy host)
- **Database**: `ToeicGeniusV2`
- **Username**: `sa`
- **Password**: `YourStrong@Passw0rd` (hoặc giá trị trong biến môi trường `MSSQL_SA_PASSWORD`)

### Quy trình khởi tạo Database

**Lần đầu tiên chạy:**
1. SQL Server container khởi động (30-60 giây)
2. Backend container khởi động và kết nối đến SQL Server
3. Database `ToeicGeniusV2` được tạo tự động (nếu chưa có)
4. Migrations được chạy tự động để tạo tables
5. Default accounts được tạo (Admin, TestCreator, Examinee)

**Các lần sau:**
- Database và dữ liệu vẫn còn nguyên
- Chỉ cần restart containers, không cần tạo lại database

### Lưu trữ dữ liệu (Persistence)

**Docker Volume:**
Dữ liệu được lưu trong Docker volume tên `sql_data`

**Dữ liệu không bị mất khi:**
- ✅ Restart containers: `docker-compose restart`
- ✅ Rebuild images: `docker-compose up -d --build`
- ✅ Restart máy tính
- ✅ Update code

**Dữ liệu CHỈ bị mất khi:**
- ⚠️ Xóa volume: `docker-compose down -v`
- ⚠️ Xóa container và volume thủ công

### Default Accounts

Khi database được khởi tạo, các tài khoản mặc định sẽ được tạo:

- **Admin**: `admin@toeicgenius.com` / `Admin@123`
- **Test Creator**: `creator@toeicgenius.com` / `Creator@123`
- **Examinee**: `examinee@toeicgenius.com` / `Examinee@123`

**Lưu ý**: Các tài khoản này chỉ được tạo lần đầu. Nếu đã có, sẽ không tạo lại.

### Kết nối đến Database từ bên ngoài

**Sử dụng SQL Server Management Studio (SSMS):**
1. Tải SSMS: https://aka.ms/ssmsfullsetup
2. Kết nối với thông tin:
   - Server name: `localhost,14333`
   - Authentication: SQL Server Authentication
   - Login: `sa`
   - Password: `YourStrong@Passw0rd` (hoặc giá trị trong `docker-compose.yml`)

**Sử dụng command line:**
```powershell
docker exec -it toeic-sql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd"
```

### Backup và Restore Database

**Backup:**
```powershell
# Backup database
docker exec toeic-sql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "BACKUP DATABASE ToeicGeniusV2 TO DISK='/var/opt/mssql/backup/ToeicGeniusV2.bak'"

# Copy file backup ra ngoài
docker cp toeic-sql:/var/opt/mssql/backup/ToeicGeniusV2.bak ./backup/
```

**Restore:**
```powershell
# Copy file backup vào container
docker cp ./backup/ToeicGeniusV2.bak toeic-sql:/var/opt/mssql/backup/

# Restore database
docker exec toeic-sql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "RESTORE DATABASE ToeicGeniusV2 FROM DISK='/var/opt/mssql/backup/ToeicGeniusV2.bak' WITH REPLACE"
```

### Xóa và tạo lại Database

**Xóa tất cả dữ liệu:**
```powershell
# Dừng và xóa containers + volumes
docker-compose down -v

# Khởi động lại (database mới sẽ được tạo)
docker-compose up -d
```

**Cảnh báo**: Lệnh này sẽ **XÓA TẤT CẢ DỮ LIỆU**!

---

## 🔄 Cập nhật code

### Khi nào cần thay đổi file Docker?

**❌ KHÔNG CẦN thay đổi khi:**
- ✅ Cập nhật code trong backend (C#)
- ✅ Cập nhật code trong frontend (React/JavaScript)
- ✅ Thay đổi logic, thêm tính năng mới
- ✅ Sửa bug, refactor code
- ✅ Cập nhật dependencies (package.json, .csproj)

**⚠️ CẦN thay đổi khi:**
- 🔧 Thay đổi cấu trúc thư mục (di chuyển file/folder)
- 🔧 Thêm/xóa services mới
- 🔧 Thay đổi port
- 🔧 Thay đổi biến môi trường mới
- 🔧 Thay đổi database connection string format
- 🔧 Thêm volume mới
- 🔧 Thay đổi network configuration

### Quy trình cập nhật code

**Cách 1: Rebuild và restart (Khuyến nghị)**
```powershell
# Rebuild images và restart containers
docker-compose up -d --build
```

**Lệnh này sẽ:**
- Build lại images với code mới
- Tự động restart containers
- Giữ nguyên volumes (database không bị mất)

**Rebuild một service cụ thể:**
```powershell
# Chỉ rebuild backend
docker-compose up -d --build api

# Chỉ rebuild frontend
docker-compose up -d --build frontend

# Chỉ rebuild Python services
docker-compose up -d --build writing-api
docker-compose up -d --build speaking-api
```

**Cách 2: Rebuild không cache (khi cần build lại hoàn toàn)**
```powershell
# Rebuild tất cả từ đầu (xóa cache)
docker-compose build --no-cache
docker-compose up -d
```

**Khi nào dùng:**
- Khi có vấn đề với build cache
- Khi thay đổi Dockerfile
- Khi dependencies thay đổi nhiều

**Cách 3: Restart nhanh (không rebuild)**
```powershell
# Chỉ restart containers (không rebuild)
docker-compose restart

# Restart một service cụ thể
docker-compose restart api
docker-compose restart frontend
```

**Khi nào dùng:**
- Khi chỉ thay đổi biến môi trường trong `backend/.env` hoặc `frontend/.env`
- Khi chỉ cần reload configuration
- ⚠️ **Lưu ý**: Code mới sẽ KHÔNG được áp dụng nếu không rebuild!

### Kiểm tra code mới đã được áp dụng

1. **Xem logs:**
   ```powershell
   docker-compose logs -f api
   docker-compose logs -f frontend
   ```

2. **Kiểm tra trong browser:**
   - Frontend: http://localhost:3000 (hard refresh: Ctrl+F5)
   - Backend: http://localhost:7100/swagger

3. **Kiểm tra version/build time:**
   ```powershell
   docker images
   docker-compose ps
   ```

### Các trường hợp cụ thể

**1. Cập nhật code Backend (.NET):**
```powershell
docker-compose up -d --build api
docker-compose logs -f api
```

**2. Cập nhật code Frontend (React):**
```powershell
docker-compose up -d --build frontend
docker-compose logs -f frontend
```
**Lưu ý**: Sau khi rebuild, hard refresh browser (Ctrl+F5) để xóa cache.

**3. Cập nhật dependencies:**
```powershell
# Backend (NuGet packages)
docker-compose up -d --build api

# Frontend (npm packages)
docker-compose up -d --build frontend
```

**4. Thay đổi biến môi trường:**
```powershell
# Sửa file .env trong backend hoặc frontend
notepad backend/.env
notepad frontend/.env

# Restart services (không cần rebuild)
docker-compose restart
```

---

## 🔧 Quản lý và xử lý lỗi

### Xem logs

**Xem logs của tất cả services:**
```powershell
docker-compose logs -f
```

**Xem logs của từng service:**
```powershell
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f sqlserver
docker-compose logs -f writing-api
docker-compose logs -f speaking-api
```

**Xem logs chi tiết:**
```powershell
# Xem logs của 100 dòng cuối
docker-compose logs --tail=100 api

# Xem logs từ một thời điểm cụ thể
docker-compose logs --since 10m api
```

### Xử lý lỗi thường gặp

**Lỗi: "Docker daemon is not running"**
- Mở Docker Desktop
- Đợi Docker Desktop khởi động hoàn toàn
- Kiểm tra icon Docker ở system tray phải màu xanh

**Lỗi: "Port already in use"**
```powershell
# Kiểm tra port nào đang bị chiếm
netstat -ano | findstr :7100
netstat -ano | findstr :3000
netstat -ano | findstr :14333

# Dừng ứng dụng đang dùng port đó, hoặc thay đổi port trong docker-compose.yml
```

**Lỗi: "SQL Server chưa sẵn sàng"**
```powershell
# Đợi SQL Server khởi động (30-60 giây)
docker-compose logs sqlserver

# Nếu vẫn lỗi, restart SQL Server
docker-compose restart sqlserver
```

**Lỗi: "WSL 2 installation is incomplete" (Windows)**
```powershell
# Cài đặt WSL 2
wsl --install

# Khởi động lại máy tính
# Mở Docker Desktop lại
```

**Lỗi: "Insufficient memory"**
- Tăng RAM cho Docker Desktop:
  - Mở Docker Desktop → Settings → Resources
  - Tăng Memory lên ít nhất 4GB (khuyến nghị 8GB)
  - Apply & Restart

**Lỗi: "Build failed"**
```powershell
# Xóa cache và build lại
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Lỗi: "Cannot connect to SQL Server"**
```powershell
# Kiểm tra SQL Server đã khởi động
docker-compose logs sqlserver

# Đợi thêm 30-60 giây
# Restart SQL Server
docker-compose restart sqlserver
```

**Lỗi: "Database does not exist"**
- Database sẽ được tạo tự động khi backend khởi động
- Nếu không, chạy migrations thủ công (xem phần Database)

**Lỗi: "Code mới không hiển thị sau khi rebuild"**
1. Kiểm tra logs: `docker-compose logs -f [service]`
2. Hard refresh browser (Ctrl+F5)
3. Đảm bảo đã rebuild: `docker-compose up -d --build`
4. Kiểm tra code đã được commit/save chưa

### Xử lý sự cố nâng cao

**Xóa tất cả và bắt đầu lại:**
```powershell
# Dừng và xóa tất cả
docker-compose down -v

# Xóa images (nếu cần)
docker-compose down --rmi all

# Build lại từ đầu
docker-compose build --no-cache
docker-compose up -d
```

**Vào trong container để debug:**
```powershell
# Vào container backend
docker exec -it toeic-backend /bin/bash

# Vào container frontend
docker exec -it toeic-frontend /bin/sh

# Vào container SQL Server
docker exec -it toeic-sql /bin/bash
```

**Kiểm tra kết nối giữa các services:**
```powershell
# Kiểm tra network
docker network inspect toeic-network

# Test kết nối từ container này sang container khác
docker exec toeic-backend ping -c 3 toeic-sql
docker exec toeic-backend ping -c 3 writing-api
docker exec toeic-backend ping -c 3 speaking-api
```

---

## 📋 Các lệnh thường dùng

### Quản lý containers

**Dừng tất cả services:**
```powershell
docker-compose down
```
**Lưu ý**: Lệnh này dừng containers nhưng không xóa volumes (database vẫn giữ nguyên)

**Dừng và xóa tất cả (bao gồm database):**
```powershell
docker-compose down -v
```
**Cảnh báo**: Lệnh này sẽ xóa tất cả dữ liệu trong database!

**Restart một service cụ thể:**
```powershell
docker-compose restart api
docker-compose restart frontend
docker-compose restart sqlserver
```

**Rebuild và restart một service:**
```powershell
docker-compose build --no-cache api
docker-compose up -d api
```

### Xem thông tin

**Xem trạng thái:**
```powershell
docker-compose ps
```

**Xem thông tin chi tiết:**
```powershell
# Xem thông tin tất cả containers
docker ps -a

# Xem thông tin network
docker network inspect toeic-network

# Xem thông tin volumes
docker volume ls

# Xem sử dụng tài nguyên
docker stats
```

### Xem logs

```powershell
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f api
```

---

## ❓ Câu hỏi thường gặp

### Q: Khách hàng có cần cài đặt gì ngoài Docker không?
**A**: Không, chỉ cần Docker Desktop. Tất cả đã được đóng gói sẵn trong Docker containers.

### Q: Database có được tạo tự động không?
**A**: Có, database sẽ được tạo tự động khi backend khởi động lần đầu. Migrations cũng được chạy tự động.

### Q: Dữ liệu có bị mất khi restart không?
**A**: Không, dữ liệu được lưu trong Docker volume và không bị mất khi restart, rebuild, hoặc update code. Chỉ mất khi chạy `docker-compose down -v`.

### Q: Có cần rebuild khi cập nhật code không?
**A**: Có, cần chạy `docker-compose up -d --build` để rebuild images với code mới. Không cần sửa Dockerfile hay docker-compose.yml.

### Q: Rebuild mất quá nhiều thời gian?
**A**: 
- Chỉ rebuild service cần thiết: `docker-compose up -d --build api`
- Sử dụng cache: không dùng `--no-cache` trừ khi cần
- Lần đầu sẽ mất thời gian để download images

### Q: Port đã được sử dụng?
**A**: 
- Kiểm tra port: `netstat -ano | findstr :7100`
- Dừng ứng dụng đang dùng port đó
- Hoặc thay đổi port trong `docker-compose.yml`

### Q: SQL Server chưa sẵn sàng?
**A**: 
- SQL Server cần 30-60 giây để khởi động hoàn toàn
- Kiểm tra logs: `docker-compose logs sqlserver`
- Đợi thêm thời gian hoặc restart: `docker-compose restart sqlserver`

### Q: Có thể chạy từ thư mục backend không?
**A**: Không khuyến nghị. Nên chạy từ thư mục root để sử dụng file `docker-compose.yml` ở đó.

---

## 📝 Tóm tắt nhanh

### Cài đặt và chạy lần đầu:

```powershell
# 1. Cài đặt Docker Desktop
# 2. Di chuyển vào thư mục root
cd D:\Fall2025\ProjectFinal

# 3. Chạy Docker Compose
docker-compose up -d

# 4. Kiểm tra trạng thái
docker-compose ps

# 5. Truy cập ứng dụng
# Frontend: http://localhost:3000
# Backend: http://localhost:7100/swagger
```

### Cập nhật code:

```powershell
# Rebuild và restart
docker-compose up -d --build

# Hoặc chỉ rebuild một service
docker-compose up -d --build api
```

### Các lệnh thường dùng:

```powershell
# Xem logs
docker-compose logs -f

# Dừng tất cả
docker-compose down

# Restart
docker-compose restart

# Xem trạng thái
docker-compose ps
```

### Checklist hoàn chỉnh:

Trước khi báo lỗi, hãy kiểm tra:
- [ ] Docker Desktop đã khởi động và chạy
- [ ] Đã chạy `docker-compose up -d` thành công
- [ ] Tất cả containers đều "Up" (kiểm tra bằng `docker-compose ps`)
- [ ] Đã đợi đủ thời gian cho SQL Server khởi động (30-60 giây)
- [ ] Đã kiểm tra logs không có lỗi nghiêm trọng
- [ ] Port 3000, 7100, 14333 không bị chiếm bởi ứng dụng khác
- [ ] Đã kiểm tra firewall không chặn các port này

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng cung cấp:
1. Output của `docker-compose ps`
2. Logs của service bị lỗi: `docker-compose logs [service-name]`
3. Output của `docker --version` và `docker-compose --version`
4. Mô tả chi tiết lỗi và các bước đã thực hiện

---

## 🎉 Kết luận

**Chỉ cần Docker, không cần cài đặt gì khác!**

- ✅ SQL Server tự động chạy trong Docker
- ✅ Database được tạo tự động
- ✅ Migrations chạy tự động
- ✅ Dữ liệu được lưu vĩnh viễn
- ✅ Code mới chỉ cần rebuild, không cần sửa Docker files

**Chúc bạn sử dụng thành công!** 🚀

