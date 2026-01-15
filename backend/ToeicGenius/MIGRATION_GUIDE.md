# Hướng Dẫn Migration Tự Động Nhận Diện Database Provider

## 📋 Tổng Quan

Hệ thống này tự động nhận diện database provider (SQL Server hoặc PostgreSQL) và chạy migration phù hợp:
- **Local (SQL Server)**: Tạo migrations trong `Migrations/SqlServer` → Chạy với SQL Server
- **Production/Render (PostgreSQL)**: Tạo migrations trong `Migrations/Postgres` → Chạy với PostgreSQL
- **Program.cs**: Tự động nhận diện provider từ connection string và chạy migration đúng

## ⚠️ Lưu Ý Quan Trọng

**Khi chạy `dotnet ef database update` hoặc khi deploy:**
- EF Core sẽ tự động tìm migrations dựa trên **provider hiện tại** trong connection string
- Nếu connection string là PostgreSQL → Tìm migrations trong `Migrations/Postgres`
- Nếu connection string là SQL Server → Tìm migrations trong `Migrations/SqlServer`
- **Bạn cần đảm bảo tạo migration cho cả 2 provider** khi có thay đổi schema

## 🏗️ Cấu Trúc

```
backend/ToeicGenius/
├── Migrations/
│   ├── SqlServer/          # Migrations cho SQL Server (local)
│   ├── Postgres/           # Migrations cho PostgreSQL (Render)
│   └── DesignTime/         # Design-time factories
├── Repositories/Persistence/
│   ├── ToeicGeniusDbContext.cs              # Base context
│   ├── ToeicGeniusDbContextSqlServer.cs     # SQL Server context
│   └── ToeicGeniusDbContextPostgres.cs       # PostgreSQL context
└── Program.cs              # Tự động nhận diện provider
```

## 🔧 Cấu Hình

### 1. Local Development (SQL Server)

**appsettings.json** hoặc **appsettings.Development.json**:
```json
{
  "ConnectionStrings": {
    "MyCnn": "Server=localhost;Database=ToeicGenius;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "DbProvider": "sqlserver"  // Hoặc không cần, sẽ tự động nhận diện từ connection string
}
```

### 2. Production/Render (PostgreSQL)

**Environment Variables trên Render**:
```
ConnectionStrings__MyCnn=postgresql://user:password@host:port/database
DB_PROVIDER=postgres  // Hoặc không cần, sẽ tự động nhận diện từ connection string
```

## 📝 Tạo Migration Mới

### Tạo Migration cho SQL Server (Local)

```bash
# Đảm bảo connection string trong appsettings.json trỏ đến SQL Server
dotnet ef migrations add MigrationName_SqlServer `
  -c ToeicGeniusDbContextSqlServer `
  -o Migrations/SqlServer `
  --project backend/ToeicGenius/ToeicGenius.csproj
```

**Ví dụ:**
```bash
dotnet ef migrations add AddNewTable_SqlServer `
  -c ToeicGeniusDbContextSqlServer `
  -o Migrations/SqlServer
```

### Tạo Migration cho PostgreSQL (Render)

```bash
# Đảm bảo connection string trong appsettings.json trỏ đến PostgreSQL
# Hoặc set environment variable: ConnectionStrings__MyCnn=postgresql://...
dotnet ef migrations add MigrationName_Postgres `
  -c ToeicGeniusDbContextPostgres `
  -o Migrations/Postgres `
  --project backend/ToeicGenius/ToeicGenius.csproj
```

**Ví dụ:**
```bash
dotnet ef migrations add AddNewTable_Postgres `
  -c ToeicGeniusDbContextPostgres `
  -o Migrations/Postgres
```

## 🚀 Chạy Migration

### Local (SQL Server)

```bash
dotnet ef database update `
  -c ToeicGeniusDbContextSqlServer `
  --project backend/ToeicGenius/ToeicGenius.csproj
```

### Production/Render (PostgreSQL)

**Tự động**: Khi deploy lên Render, `Program.cs` sẽ tự động:
1. Nhận diện PostgreSQL từ connection string
2. Chạy `context.Database.Migrate()` với migrations trong `Migrations/Postgres`

**Hoặc chạy thủ công:**
```bash
dotnet ef database update `
  -c ToeicGeniusDbContextPostgres `
  --project backend/ToeicGenius/ToeicGenius.csproj
```

## 🔄 Quy Trình Làm Việc

### Khi thêm tính năng mới:

1. **Thay đổi Entity/Model** trong code
2. **Tạo migration cho SQL Server** (local):
   ```bash
   dotnet ef migrations add FeatureName_SqlServer -c ToeicGeniusDbContextSqlServer -o Migrations/SqlServer
   ```
3. **Test trên local** với SQL Server
4. **Tạo migration cho PostgreSQL** (production):
   ```bash
   # Set connection string PostgreSQL trước
   $env:ConnectionStrings__MyCnn="postgresql://..."
   dotnet ef migrations add FeatureName_Postgres -c ToeicGeniusDbContextPostgres -o Migrations/Postgres
   ```
5. **Commit cả 2 migration files** vào Git
6. **Deploy lên Render** → Tự động chạy migration PostgreSQL

## ⚠️ Lưu Ý Quan Trọng

1. **Luôn tạo migration cho cả 2 provider** khi có thay đổi schema
2. **Đặt tên migration giống nhau** (chỉ khác suffix `_SqlServer` và `_Postgres`)
3. **Kiểm tra migration files** trước khi commit:
   - SQL Server: `Migrations/SqlServer/...`
   - PostgreSQL: `Migrations/Postgres/...`
4. **Không chỉnh sửa migration cũ** đã chạy trên production
5. **Nếu cần rollback**, tạo migration mới để revert thay vì xóa migration cũ

## 🐛 Troubleshooting

### Lỗi: "Unable to create an object of type 'ToeicGeniusDbContext'"

**Nguyên nhân**: Thiếu DesignTimeFactory

**Giải pháp**: Đảm bảo các file sau tồn tại:
- `Migrations/DesignTime/DesignTimeDbContextFactorySqlServer.cs`
- `Migrations/DesignTime/DesignTimeDbContextFactoryPostgres.cs`

### Lỗi: "No migrations found"

**Nguyên nhân**: Migration files không ở đúng thư mục

**Giải pháp**: Kiểm tra:
- SQL Server migrations: `Migrations/SqlServer/`
- PostgreSQL migrations: `Migrations/Postgres/`

### Lỗi: "Provider not recognized"

**Nguyên nhân**: Connection string không đúng format

**Giải pháp**: 
- SQL Server: `Server=...;Database=...;...`
- PostgreSQL: `Host=...;Database=...;...` hoặc `postgresql://...`

## 📚 Tài Liệu Tham Khảo

- [EF Core Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [Multiple Providers](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/providers)
