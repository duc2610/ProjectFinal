# Hướng dẫn cài đặt Docker trên Windows

## Bước 1: Kiểm tra yêu cầu hệ thống

Docker Desktop yêu cầu:
- Windows 10 64-bit: Pro, Enterprise, hoặc Education (Build 19041 trở lên)
- Windows 11 64-bit: Home hoặc Pro (version 21H2 trở lên)
- WSL 2 (Windows Subsystem for Linux 2) - sẽ được cài đặt tự động
- Virtualization enabled trong BIOS

## Bước 2: Tải Docker Desktop

1. Truy cập: https://www.docker.com/products/docker-desktop/
2. Click **"Download for Windows"**
3. File tải về sẽ có tên: `Docker Desktop Installer.exe`

## Bước 3: Cài đặt Docker Desktop

1. **Chạy file installer** vừa tải về
2. **Chọn các tùy chọn:**
   - ✅ Use WSL 2 instead of Hyper-V (khuyến nghị)
   - ✅ Add shortcut to desktop (tùy chọn)
3. Click **"Ok"** để bắt đầu cài đặt
4. **Chờ quá trình cài đặt hoàn tất** (có thể mất 5-10 phút)
5. Click **"Close and restart"** để khởi động lại máy

## Bước 4: Khởi động Docker Desktop

1. Sau khi khởi động lại, tìm **Docker Desktop** trong Start Menu
2. Chạy Docker Desktop
3. Chấp nhận **Terms of Service**
4. Chờ Docker Desktop khởi động hoàn tất (biểu tượng Docker sẽ xuất hiện ở system tray)

## Bước 5: Kiểm tra cài đặt

Mở PowerShell hoặc Command Prompt và chạy:

```powershell
# Kiểm tra Docker version
docker --version

# Kiểm tra Docker Compose version
docker compose version

# Kiểm tra Docker đang chạy
docker ps
```

Nếu các lệnh trên chạy thành công, Docker đã được cài đặt đúng!

## Bước 6: Cấu hình Docker Desktop (Tùy chọn)

1. Click vào biểu tượng Docker ở system tray
2. Chọn **Settings**
3. Trong **Resources**, bạn có thể điều chỉnh:
   - CPU: Khuyến nghị ít nhất 2 cores
   - Memory: Khuyến nghị ít nhất 4GB
   - Disk: Đảm bảo có đủ dung lượng (ít nhất 20GB)

## Troubleshooting

### Lỗi: "WSL 2 installation is incomplete"

**Giải pháp:**
1. Tải WSL 2 update từ: https://aka.ms/wsl2kernel
2. Cài đặt file `.msi` vừa tải
3. Khởi động lại máy
4. Chạy lại Docker Desktop

### Lỗi: "Hardware assisted virtualization and data execution protection must be enabled"

**Giải pháp:**
1. Khởi động lại máy và vào **BIOS/UEFI**
2. Tìm và bật:
   - **Virtualization Technology** (Intel VT-x hoặc AMD-V)
   - **Hyper-V** (nếu có)
3. Lưu và khởi động lại

### Docker Desktop không khởi động

**Giải pháp:**
1. Đảm bảo **Windows Update** đã được cập nhật đầy đủ
2. Kiểm tra **Windows Features**:
   - Mở "Turn Windows features on or off"
   - Đảm bảo **Virtual Machine Platform** và **Windows Subsystem for Linux** đã được bật
3. Khởi động lại máy

### Lỗi: "Docker daemon is not running"

**Giải pháp:**
1. Mở Docker Desktop
2. Đợi cho đến khi biểu tượng Docker ở system tray không còn hiển thị "starting"
3. Nếu vẫn lỗi, thử:
   - Restart Docker Desktop
   - Restart máy tính

## Sau khi cài đặt xong

Sau khi Docker đã được cài đặt và chạy thành công, bạn có thể:

1. **Tạo file `.env`** ở thư mục root của backend với các API keys
2. **Chạy Python services:**
   ```powershell
   .\run-python-services.ps1 start
   ```

## Tài liệu tham khảo

- [Docker Desktop for Windows Documentation](https://docs.docker.com/desktop/windows/)
- [WSL 2 Installation Guide](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Docker Desktop Release Notes](https://docs.docker.com/desktop/release-notes/)

## Lưu ý

- Docker Desktop cần chạy liên tục để các containers hoạt động
- Đảm bảo Docker Desktop đã khởi động trước khi chạy các lệnh docker
- Lần đầu tiên pull images có thể mất thời gian (tùy thuộc vào tốc độ internet)

