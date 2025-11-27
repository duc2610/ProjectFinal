# Hướng dẫn cài đặt cho Khách hàng

## ✅ Yêu cầu hệ thống

### Chỉ cần cài đặt Docker!

Với Docker, bạn **KHÔNG CẦN** cài đặt:
- ❌ .NET SDK
- ❌ Node.js
- ❌ SQL Server
- ❌ Python
- ❌ Bất kỳ phần mềm nào khác

**Tất cả đã được đóng gói sẵn trong Docker containers!**

---

## 📦 Bước 1: Cài đặt Docker

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
   - Mở PowerShell hoặc Command Prompt
   - Chạy lệnh:
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

---

## 📋 Bước 2: Yêu cầu hệ thống

### Tối thiểu:
- **RAM**: 8GB (khuyến nghị 16GB)
- **Ổ cứng**: 20GB trống
- **CPU**: 2 cores (khuyến nghị 4 cores)
- **Hệ điều hành**: Windows 10/11, macOS 10.15+, hoặc Linux

### Lưu ý:
- Docker Desktop cần **WSL 2** trên Windows 10/11
- Đảm bảo **Virtualization** được bật trong BIOS (nếu cần)

---

## 🚀 Bước 3: Chạy dự án

### 1. Giải nén dự án (nếu nhận file nén)

Giải nén vào thư mục bất kỳ, ví dụ: `C:\Projects\ToeicGenius`

### 2. Mở PowerShell/Terminal

**Windows:**
- Nhấn `Win + X` → Chọn "Windows PowerShell" hoặc "Terminal"
- Di chuyển vào thư mục dự án:
  ```powershell
  cd C:\Projects\ToeicGenius
  ```

**macOS/Linux:**
```bash
cd ~/Projects/ToeicGenius
```

### 3. (Tùy chọn) Tạo file .env

Nếu bạn có file `.env` từ nhà phát triển, đặt nó trong thư mục root của dự án.

Nếu không có, dự án sẽ dùng các giá trị mặc định.

### 4. Chạy dự án

**Cách 1: Sử dụng script (Dễ nhất)**
```powershell
# Windows
.\run-docker.ps1

# macOS/Linux
chmod +x run-docker.sh
./run-docker.sh
```

**Cách 2: Chạy thủ công**
```powershell
docker-compose up -d
```

### 5. Đợi khởi động

- Lần đầu tiên: **5-15 phút** (download images và build)
- Các lần sau: **1-3 phút**

Bạn sẽ thấy các thông báo build và download images.

### 6. Kiểm tra trạng thái

```powershell
docker-compose ps
```

Tất cả services phải có status "Up" hoặc "Up (healthy)".

### 7. Truy cập ứng dụng

Mở trình duyệt và truy cập:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:7100/swagger

---

## 🔧 Xử lý lỗi thường gặp

### Lỗi: "Docker daemon is not running"

**Giải pháp:**
- Mở Docker Desktop
- Đợi Docker Desktop khởi động hoàn toàn
- Kiểm tra icon Docker ở system tray phải màu xanh

### Lỗi: "Port already in use"

**Giải pháp:**
- Kiểm tra port 3000, 7100, 14333 có đang được dùng không
- Đóng các ứng dụng đang dùng port này
- Hoặc thay đổi port trong `docker-compose.yml`

### Lỗi: "WSL 2 installation is incomplete"

**Giải pháp (Windows):**
1. Cài đặt WSL 2:
   ```powershell
   wsl --install
   ```
2. Khởi động lại máy tính
3. Mở Docker Desktop lại

### Lỗi: "Insufficient memory"

**Giải pháp:**
- Tăng RAM cho Docker Desktop:
  - Mở Docker Desktop → Settings → Resources
  - Tăng Memory lên ít nhất 4GB (khuyến nghị 8GB)
  - Apply & Restart

### Lỗi: Build failed

**Giải pháp:**
```powershell
# Xóa cache và build lại
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng cung cấp:
1. Hệ điều hành và phiên bản
2. Output của `docker --version` và `docker-compose --version`
3. Output của `docker-compose ps`
4. Logs: `docker-compose logs`

---

## 📝 Tóm tắt nhanh

1. ✅ Cài đặt Docker Desktop
2. ✅ Giải nén dự án
3. ✅ Mở PowerShell/Terminal trong thư mục dự án
4. ✅ Chạy: `docker-compose up -d`
5. ✅ Đợi 5-15 phút (lần đầu)
6. ✅ Truy cập: http://localhost:3000

**Chỉ cần Docker, không cần cài đặt gì khác!** 🎉

---

## 🔄 Các lệnh hữu ích

### Dừng ứng dụng:
```powershell
docker-compose down
```

### Xem logs:
```powershell
docker-compose logs -f
```

### Restart:
```powershell
docker-compose restart
```

### Xem trạng thái:
```powershell
docker-compose ps
```

---

## ⚠️ Lưu ý quan trọng

1. **Không tắt Docker Desktop** khi đang sử dụng ứng dụng
2. **Lần đầu chạy** sẽ mất thời gian để download images (có thể 5-15 phút)
3. **Database** được lưu trong Docker volume, không bị mất khi restart
4. **Port 3000, 7100, 14333** phải trống (không bị ứng dụng khác dùng)

---

Chúc bạn sử dụng thành công! 🚀

