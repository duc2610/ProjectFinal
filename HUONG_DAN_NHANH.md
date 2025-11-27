# Hướng dẫn nhanh - Chạy Docker

## 🚀 Các bước nhanh (5 phút)

### Bước 1: Mở PowerShell
Mở PowerShell và di chuyển vào thư mục root của dự án:
```powershell
cd D:\Fall2025\ProjectFinal
```

### Bước 2: Kiểm tra môi trường (Tùy chọn nhưng khuyến nghị)
```powershell
.\check-docker.ps1
```

### Bước 3: Chạy Docker Compose
```powershell
docker-compose up -d
```

**Đợi 2-5 phút** để Docker download images và build (lần đầu tiên)

### Bước 4: Kiểm tra trạng thái
```powershell
docker-compose ps
```

Đảm bảo tất cả services đều "Up"

### Bước 5: Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:7100/swagger

---

## 📋 Checklist nhanh

Trước khi chạy:
- [ ] Docker Desktop đã cài đặt và đang chạy
- [ ] Đã mở PowerShell trong thư mục `backend`
- [ ] Port 3000, 7100, 14333 không bị chiếm

Sau khi chạy:
- [ ] Tất cả containers đều "Up" (`docker-compose ps`)
- [ ] Frontend mở được: http://localhost:3000
- [ ] Backend mở được: http://localhost:7100/swagger

---

## 🔧 Lệnh thường dùng

### Xem logs
```powershell
docker-compose logs -f
```

### Dừng tất cả
```powershell
docker-compose down
```

### Restart một service
```powershell
docker-compose restart api
docker-compose restart frontend
```

### Xem trạng thái
```powershell
docker-compose ps
```

---

## ❌ Xử lý lỗi nhanh

### Port đã được sử dụng
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :7100

# Dừng process đó hoặc thay đổi port trong docker-compose.yml
```

### SQL Server chưa sẵn sàng
```powershell
# Đợi 30-60 giây rồi kiểm tra lại
docker-compose logs sqlserver
```

### Rebuild lại từ đầu
```powershell
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Tài liệu chi tiết

Xem file `HUONG_DAN_CHAY_DOCKER.md` để có hướng dẫn đầy đủ và chi tiết hơn.

---

## 💡 Mẹo

1. **Lần đầu chạy**: Có thể mất 10-15 phút để download images
2. **Kiểm tra logs**: Luôn kiểm tra logs nếu có vấn đề: `docker-compose logs -f [service-name]`
3. **SQL Server**: Cần 30-60 giây để khởi động hoàn toàn
4. **Port conflict**: Nếu port bị chiếm, thay đổi trong `docker-compose.yml`

---

Chúc bạn thành công! 🎉

