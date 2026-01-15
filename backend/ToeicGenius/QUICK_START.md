# Quick Start - Migration Tự Động Nhận Diện Database

## Đã Setup Sẵn

1. 2 DbContext riêng: `ToeicGeniusDbContextSqlServer` và `ToeicGeniusDbContextPostgres`
2. 2 DesignTimeFactory để tạo migration đúng provider
3. 2 thư mục migrations: `Migrations/SqlServer` và `Migrations/Postgres`
4. Program.cs tự động nhận diện provider từ connection string

## Cách Sử Dụng

### 1. Tạo Migration Mới (Cả 2 Provider)

**Cách 1: Dùng Script (Khuyến nghị)**

**Windows (PowerShell):**
```powershell
.\scripts\create-migration.ps1 -MigrationName "AddNewTable"
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/create-migration.sh
./scripts/create-migration.sh AddNewTable
```

**Cách 2: Chạy Thủ Công**

**Tạo migration cho SQL Server:**
```bash
dotnet ef migrations add MigrationName_SqlServer `
  -c ToeicGeniusDbContextSqlServer `
  -o Migrations/SqlServer `
  --project backend/ToeicGenius/ToeicGenius.csproj
```

**Tạo migration cho PostgreSQL:**
```bash
# Set connection string PostgreSQL trước (hoặc dùng appsettings.json)
dotnet ef migrations add MigrationName_Postgres `
  -c ToeicGeniusDbContextPostgres `
  -o Migrations/Postgres `
  --project backend/ToeicGenius/ToeicGenius.csproj
```

### 2. Chạy Migration

**Local (SQL Server):**
```bash
dotnet ef database update `
  -c ToeicGeniusDbContextSqlServer `
  --project backend/ToeicGenius/ToeicGenius.csproj
```

**Production/Render (PostgreSQL):**
- **Tự động**: Khi deploy lên Render, `Program.cs` sẽ tự động:
  1. Nhận diện PostgreSQL từ connection string
  2. Chạy `context.Database.Migrate()` với migrations trong `Migrations/Postgres`

**Hoặc chạy thủ công:**
```bash
dotnet ef database update `
  -c ToeicGeniusDbContextPostgres `
  --project backend/ToeicGenius/ToeicGenius.csproj
```

## Kiểm Tra Provider Hiện Tại

**Trong code (Program.cs):**
```csharp
var dbProvider = context.Database.IsSqlServer() ? "SQL Server" : "PostgreSQL";
```

**Từ connection string:**
- SQL Server: `Server=...;Database=...;...`
- PostgreSQL: `Host=...;Database=...;...` hoặc `postgresql://...`

## Xem Chi Tiết

Xem file `MIGRATION_GUIDE.md` để biết thêm chi tiết.
