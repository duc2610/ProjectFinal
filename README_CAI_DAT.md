# Hướng dẫn cài đặt nhanh - ToeicGenius

## 🎯 Yêu cầu duy nhất: Docker

**Chỉ cần cài đặt Docker Desktop, không cần cài đặt gì khác!**

---

## 📥 Bước 1: Cài đặt Docker

### Windows:
1. Tải: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop
3. Kiểm tra: Mở PowerShell, chạy `docker --version`

### macOS:
1. Tải: https://www.docker.com/products/docker-desktop
2. Cài đặt và mở Docker Desktop
3. Kiểm tra: Mở Terminal, chạy `docker --version`

### Linux:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

---

## 🚀 Bước 2: Chạy dự án

1. **Mở PowerShell/Terminal** trong thư mục dự án

2. **Chạy lệnh:**
   ```powershell
   docker-compose up -d
   ```

3. **Đợi 5-15 phút** (lần đầu tiên)

4. **Truy cập:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:7100/swagger

---

## ✅ Kiểm tra

```powershell
docker-compose ps
```

Tất cả services phải "Up"

---

## ❓ Gặp vấn đề?

Xem file `HUONG_DAN_CAI_DAT_KHACH_HANG.md` để có hướng dẫn chi tiết.

---

**Chỉ cần Docker, không cần cài đặt .NET, Node.js, SQL Server hay Python!** 🎉

