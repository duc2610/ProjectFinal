# Tóm Tắt Setup: Migration Tự Động Nhận Diện Database

## Đã Hoàn Thành

### 1. Tạo 2 DbContext Riêng
- `ToeicGeniusDbContextSqlServer` - Cho SQL Server (local)
- `ToeicGeniusDbContextPostgres` - Cho PostgreSQL (Render)

### 2. Tạo DesignTimeFactory Cho Mỗi Provider
- `DesignTimeDbContextFactorySqlServer.cs` - Để tạo migration SQL Server
- `DesignTimeDbContextFactoryPostgres.cs` - Để tạo migration PostgreSQL

### 3. Tạo Thư Mục Migrations Riêng
- `Migrations/SqlServer/` - Chứa migrations cho SQL Server
- `Migrations/Postgres/` - Chứa migrations cho PostgreSQL

### 4. Cập Nhật Program.cs
- Tự động nhận diện provider từ connection string
- Đăng ký đúng DbContext dựa trên provider
- Tự động chạy migration khi deploy

### 5. Tạo Scripts Helper
- `scripts/create-migration.ps1` - PowerShell script
- `scripts/create-migration.sh` - Bash script

### 6. Tạo Tài Liệu Hướng Dẫn
- `MIGRATION_GUIDE.md` - Hướng dẫn chi tiết
- `QUICK_START.md` - Quick start guide
- `README_MIGRATIONS.md` - Giải thích cách hoạt động

## Cách Sử Dụng

### Tạo Migration Mới

**Cách 1: Dùng Script (Khuyến nghị)**
```powershell
.\scripts\create-migration.ps1 -MigrationName "AddNewTable"
```

**Cách 2: Chạy Thủ Công**
```bash
# SQL Server
dotnet ef migrations add MigrationName_SqlServer -c ToeicGeniusDbContextSqlServer -o Migrations/SqlServer

# PostgreSQL
dotnet ef migrations add MigrationName_Postgres -c ToeicGeniusDbContextPostgres -o Migrations/Postgres
```

### Chạy Migration

**Local (SQL Server):**
```bash
dotnet ef database update -c ToeicGeniusDbContextSqlServer
```

**Production/Render (PostgreSQL):**
- Tự động chạy khi deploy (không cần làm gì)
- Hoặc chạy thủ công:
```bash
dotnet ef database update -c ToeicGeniusDbContextPostgres
```

## Cấu Hình

### Local (SQL Server)
**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "MyCnn": "Server=localhost;Database=ToeicGenius;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### Production/Render (PostgreSQL)
**Environment Variables:**
```
ConnectionStrings__MyCnn=postgresql://user:password@host:port/database
```

## Lưu Ý Quan Trọng

1. **Luôn tạo migration cho cả 2 provider** khi có thay đổi schema
2. **Đặt tên migration giống nhau** (chỉ khác suffix `_SqlServer` và `_Postgres`)
3. **Commit cả 2 migration files** vào Git
4. **Không chỉnh sửa migration cũ** đã chạy trên production

## Tài Liệu Tham Khảo

- `MIGRATION_GUIDE.md` - Hướng dẫn chi tiết đầy đủ
- `QUICK_START.md` - Quick start guide
- `README_MIGRATIONS.md` - Giải thích cách hoạt động

## Kiểm Tra

Sau khi setup, kiểm tra:
1. Có thể tạo migration cho SQL Server
2. Có thể tạo migration cho PostgreSQL
3. Local chạy được với SQL Server
4. Render deploy được với PostgreSQL

## Hoàn Thành!

Bây giờ bạn có thể:
- Tạo migration riêng cho từng provider
- Tự động nhận diện database khi deploy
- Không cần chỉnh tay migration files
