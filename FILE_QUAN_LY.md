# Hướng dẫn quản lý các file Docker trong dự án

## 📁 Cấu trúc file hiện tại

### ✅ File mới (ở thư mục root) - **SỬ DỤNG CÁC FILE NÀY**

```
ProjectFinal/
├── docker-compose.yml      ← File chính để chạy TẤT CẢ services
├── run-docker.ps1          ← Script chạy tất cả services
├── check-docker.ps1        ← Script kiểm tra môi trường
└── .env                    ← File cấu hình (tùy chọn, tự tạo)
```

**Cách sử dụng:**
```powershell
cd D:\Fall2025\ProjectFinal
.\run-docker.ps1
```

---

### ⚠️ File cũ (trong thư mục backend) - **CÓ THỂ XÓA HOẶC GIỮ LẠI**

#### 1. `backend/docker-compose.yml`
- **Mục đích cũ**: Chạy từ thư mục backend
- **Trạng thái**: Đã được thay thế bởi file ở root
- **Hành động**: **CÓ THỂ XÓA** (hoặc giữ lại để backup)

#### 2. `backend/run-docker.ps1`
- **Mục đích cũ**: Script chạy Docker từ thư mục backend
- **Trạng thái**: Đã được thay thế bởi file ở root
- **Hành động**: **CÓ THỂ XÓA** (hoặc giữ lại để backup)

#### 3. `backend/check-docker.ps1`
- **Mục đích cũ**: Script kiểm tra từ thư mục backend
- **Trạng thái**: Đã được thay thế bởi file ở root
- **Hành động**: **CÓ THỂ XÓA** (hoặc giữ lại để backup)

---

### 🔧 File chuyên dụng (có thể vẫn cần)

#### 4. `backend/run-python-services.ps1` và `.sh`
- **Mục đích**: Chỉ chạy riêng Python services (Writing API và Speaking API)
- **Khi nào dùng**: Nếu bạn chỉ muốn chạy Python services mà không chạy backend/frontend
- **Hành động**: **GIỮ LẠI** nếu bạn cần chạy riêng Python services

#### 5. `backend/python-service/run-docker.ps1` và `.sh`
- **Mục đích**: Script riêng cho Python services (có thể có cấu hình khác)
- **Khi nào dùng**: Nếu bạn muốn chạy Python services theo cách riêng
- **Hành động**: **GIỮ LẠI** nếu bạn cần

---

## 🗑️ Khuyến nghị: Xóa các file không cần thiết

### Các file có thể xóa an toàn:

1. ✅ `backend/docker-compose.yml` - Đã có bản mới ở root
2. ✅ `backend/run-docker.ps1` - Đã có bản mới ở root  
3. ✅ `backend/check-docker.ps1` - Đã có bản mới ở root

### Các file nên giữ lại:

1. ⚠️ `backend/run-python-services.ps1` - Có thể cần để chạy riêng Python services
2. ⚠️ `backend/run-python-services.sh` - Tương tự cho Linux/Mac
3. ⚠️ `backend/python-service/run-docker.ps1` và `.sh` - Script riêng cho Python services

---

## 📝 Script xóa file cũ (tùy chọn)

Nếu bạn muốn xóa các file cũ, chạy script sau trong PowerShell:

```powershell
# Di chuyển vào thư mục backend
cd D:\Fall2025\ProjectFinal\backend

# Xóa các file cũ (chỉ xóa nếu chắc chắn)
Remove-Item docker-compose.yml -ErrorAction SilentlyContinue
Remove-Item run-docker.ps1 -ErrorAction SilentlyContinue
Remove-Item check-docker.ps1 -ErrorAction SilentlyContinue

Write-Host "Đã xóa các file cũ" -ForegroundColor Green
```

**Lưu ý**: Script này chỉ xóa 3 file chính. Các file Python services sẽ được giữ lại.

---

## 🔄 So sánh cách sử dụng

### Cách cũ (từ thư mục backend):
```powershell
cd D:\Fall2025\ProjectFinal\backend
.\run-docker.ps1
```

### Cách mới (từ thư mục root) - **KHUYẾN NGHỊ**:
```powershell
cd D:\Fall2025\ProjectFinal
.\run-docker.ps1
```

**Lợi ích của cách mới:**
- ✅ File docker-compose.yml ở cùng cấp với backend và frontend (dễ hiểu hơn)
- ✅ Cấu trúc rõ ràng hơn
- ✅ Dễ quản lý hơn khi có nhiều services

---

## ❓ Câu hỏi thường gặp

### Q: Tôi có thể giữ cả 2 file docker-compose.yml không?
**A**: Có, nhưng không khuyến nghị. Chỉ nên dùng file ở root để tránh nhầm lẫn.

### Q: Nếu tôi xóa file cũ, có ảnh hưởng gì không?
**A**: Không, vì bạn đã có file mới ở root. Chỉ cần đảm bảo chạy từ thư mục root.

### Q: File run-python-services.ps1 có cần thiết không?
**A**: Chỉ cần nếu bạn muốn chạy riêng Python services. Nếu luôn chạy tất cả services cùng lúc, không cần.

### Q: Tôi có thể chạy từ thư mục backend với file cũ không?
**A**: Có, nhưng không khuyến nghị. Nên dùng file mới ở root để nhất quán.

---

## 📌 Tóm tắt

| File | Vị trí | Trạng thái | Hành động |
|------|--------|------------|-----------|
| docker-compose.yml | root/ | ✅ Mới | **SỬ DỤNG** |
| docker-compose.yml | backend/ | ⚠️ Cũ | Xóa hoặc giữ backup |
| run-docker.ps1 | root/ | ✅ Mới | **SỬ DỤNG** |
| run-docker.ps1 | backend/ | ⚠️ Cũ | Xóa hoặc giữ backup |
| check-docker.ps1 | root/ | ✅ Mới | **SỬ DỤNG** |
| check-docker.ps1 | backend/ | ⚠️ Cũ | Xóa hoặc giữ backup |
| run-python-services.* | backend/ | 🔧 Chuyên dụng | Giữ lại nếu cần |

---

**Khuyến nghị cuối cùng**: Xóa 3 file cũ trong `backend/` và chỉ sử dụng các file ở root để tránh nhầm lẫn.

