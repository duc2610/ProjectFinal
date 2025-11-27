# Hướng dẫn cập nhật code với Docker

## 🔄 Khi nào cần thay đổi file Docker?

### ❌ KHÔNG CẦN thay đổi khi:
- ✅ Cập nhật code trong backend (C#)
- ✅ Cập nhật code trong frontend (React/JavaScript)
- ✅ Thay đổi logic, thêm tính năng mới
- ✅ Sửa bug, refactor code
- ✅ Cập nhật dependencies (package.json, .csproj)

### ⚠️ CẦN thay đổi khi:
- 🔧 Thay đổi cấu trúc thư mục (di chuyển file/folder)
- 🔧 Thêm/xóa services mới
- 🔧 Thay đổi port
- 🔧 Thay đổi biến môi trường mới
- 🔧 Thay đổi database connection string format
- 🔧 Thêm volume mới
- 🔧 Thay đổi network configuration

---

## 📝 Quy trình cập nhật code

### Cách 1: Rebuild và restart (Khuyến nghị)

#### Khi code thay đổi:

```powershell
# Di chuyển vào thư mục root
cd D:\Fall2025\ProjectFinal

# Rebuild images và restart containers
docker-compose up -d --build
```

**Lệnh này sẽ:**
- Build lại images với code mới
- Tự động restart containers
- Giữ nguyên volumes (database không bị mất)

#### Rebuild một service cụ thể:

```powershell
# Chỉ rebuild backend
docker-compose up -d --build api

# Chỉ rebuild frontend
docker-compose up -d --build frontend

# Chỉ rebuild Python services
docker-compose up -d --build writing-api
docker-compose up -d --build speaking-api
```

---

### Cách 2: Rebuild không cache (khi cần build lại hoàn toàn)

```powershell
# Rebuild tất cả từ đầu (xóa cache)
docker-compose build --no-cache
docker-compose up -d
```

**Khi nào dùng:**
- Khi có vấn đề với build cache
- Khi thay đổi Dockerfile
- Khi dependencies thay đổi nhiều

---

### Cách 3: Restart nhanh (không rebuild)

```powershell
# Chỉ restart containers (không rebuild)
docker-compose restart

# Restart một service cụ thể
docker-compose restart api
docker-compose restart frontend
```

**Khi nào dùng:**
- Khi chỉ thay đổi biến môi trường trong `.env`
- Khi chỉ cần reload configuration
- ⚠️ **Lưu ý**: Code mới sẽ KHÔNG được áp dụng nếu không rebuild!

---

## 🔍 Kiểm tra code mới đã được áp dụng

### 1. Xem logs để kiểm tra
```powershell
# Xem logs của backend
docker-compose logs -f api

# Xem logs của frontend
docker-compose logs -f frontend
```

### 2. Kiểm tra trong browser
- Frontend: http://localhost:3000 (hard refresh: Ctrl+F5)
- Backend: http://localhost:7100/swagger

### 3. Kiểm tra version/build time
```powershell
# Xem thông tin image
docker images

# Xem thông tin container
docker-compose ps
```

---

## 📦 Các trường hợp cụ thể

### 1. Cập nhật code Backend (.NET)

```powershell
# Rebuild backend
docker-compose up -d --build api

# Xem logs
docker-compose logs -f api
```

**Lưu ý:**
- Code C# sẽ được compile lại trong Dockerfile
- Migrations sẽ tự động chạy khi container khởi động (nếu có)

---

### 2. Cập nhật code Frontend (React)

```powershell
# Rebuild frontend
docker-compose up -d --build frontend

# Xem logs
docker-compose logs -f frontend
```

**Lưu ý:**
- Frontend được build trong Dockerfile (npm run build)
- Sau khi rebuild, hard refresh browser (Ctrl+F5) để xóa cache

---

### 3. Cập nhật dependencies

#### Backend (NuGet packages):
```powershell
# Rebuild backend (sẽ restore packages mới)
docker-compose up -d --build api
```

#### Frontend (npm packages):
```powershell
# Rebuild frontend (sẽ install packages mới)
docker-compose up -d --build frontend
```

**Lưu ý:** Nếu thay đổi nhiều dependencies, nên dùng `--no-cache`:
```powershell
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

### 4. Thay đổi biến môi trường

#### Cách 1: Sửa file `.env`
```powershell
# Sửa file .env trong thư mục root
notepad .env

# Restart services (không cần rebuild)
docker-compose restart
```

#### Cách 2: Sửa trực tiếp trong `docker-compose.yml`
```yaml
environment:
  - NEW_VARIABLE=value
```

Sau đó rebuild:
```powershell
docker-compose up -d --build
```

---

### 5. Thay đổi Dockerfile

Nếu bạn sửa Dockerfile, cần rebuild:

```powershell
# Rebuild với --no-cache để đảm bảo build lại từ đầu
docker-compose build --no-cache api
docker-compose up -d api
```

---

## 🚀 Workflow khuyến nghị

### Khi phát triển hàng ngày:

```powershell
# 1. Cập nhật code trong IDE
# 2. Rebuild và restart
docker-compose up -d --build

# 3. Kiểm tra logs
docker-compose logs -f

# 4. Test trong browser
```

### Khi có thay đổi lớn:

```powershell
# 1. Dừng tất cả
docker-compose down

# 2. Rebuild từ đầu
docker-compose build --no-cache

# 3. Khởi động lại
docker-compose up -d

# 4. Kiểm tra
docker-compose ps
docker-compose logs -f
```

---

## ⚡ Tips và Tricks

### 1. Rebuild nhanh chỉ service cần thiết
```powershell
# Chỉ rebuild service bạn đang làm việc
docker-compose up -d --build api
```

### 2. Xem thay đổi real-time (Development mode)

**Backend:** Có thể mount volume để code tự động reload:
```yaml
# Trong docker-compose.yml (chỉ dùng cho development)
volumes:
  - ./backend/ToeicGenius:/app
```

**Frontend:** Có thể chạy dev server thay vì build:
```yaml
# Chạy Vite dev server thay vì build static
command: npm run dev
```

### 3. Xóa images cũ để tiết kiệm dung lượng
```powershell
# Xóa images không dùng
docker image prune -a

# Xóa tất cả images của dự án
docker-compose down --rmi all
```

---

## ❓ Câu hỏi thường gặp

### Q: Code mới không hiển thị sau khi rebuild?
**A**: 
1. Kiểm tra logs: `docker-compose logs -f [service]`
2. Hard refresh browser (Ctrl+F5)
3. Đảm bảo đã rebuild: `docker-compose up -d --build`
4. Kiểm tra code đã được commit/save chưa

### Q: Rebuild mất quá nhiều thời gian?
**A**: 
- Chỉ rebuild service cần thiết: `docker-compose up -d --build api`
- Sử dụng cache: không dùng `--no-cache` trừ khi cần
- Xem Dockerfile có thể tối ưu layer caching

### Q: Database bị mất sau khi rebuild?
**A**: 
- Database được lưu trong volume, không bị mất khi rebuild
- Chỉ mất khi dùng `docker-compose down -v`
- Kiểm tra volume: `docker volume ls`

### Q: Có cần rebuild khi chỉ sửa comment?
**A**: 
- Backend: Có (vì C# cần compile)
- Frontend: Có (vì cần build lại bundle)
- Nhưng thường rất nhanh vì Docker cache

---

## 📋 Checklist cập nhật code

- [ ] Code đã được lưu/commit
- [ ] Chạy `docker-compose up -d --build [service]`
- [ ] Kiểm tra logs không có lỗi
- [ ] Test trong browser
- [ ] Hard refresh browser nếu cần (Ctrl+F5)
- [ ] Kiểm tra database vẫn còn dữ liệu

---

## 🎯 Tóm tắt

**Câu trả lời ngắn gọn:**
- ❌ **KHÔNG** cần viết lại Dockerfile/docker-compose.yml khi chỉ cập nhật code
- ✅ **CHỈ CẦN** rebuild: `docker-compose up -d --build`
- 🔧 **CHỈ CẦN** sửa Docker files khi thay đổi cấu trúc, port, services mới

**Lệnh thường dùng nhất:**
```powershell
docker-compose up -d --build
```

