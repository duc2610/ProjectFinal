# 📖 Hướng Dẫn Chi Tiết: Migration Tự Động Nhận Diện Database

## 🎯 Mục Đích

Hệ thống này cho phép bạn:
- ✅ **Local**: Dùng SQL Server với migrations riêng
- ✅ **Render (Production)**: Dùng PostgreSQL với migrations riêng  
- ✅ **Tự động nhận diện**: Không cần chỉnh tay code khi deploy

## 📁 Cấu Trúc Files Đã Tạo

```
backend/ToeicGenius/
├── Migrations/
│   ├── SqlServer/                                    # ← Migrations cho SQL Server
│   ├── Postgres/                                     # ← Migrations cho PostgreSQL
│   ├── DesignTime/
│   │   ├── DesignTimeDbContextFactorySqlServer.cs   # ← Factory cho SQL Server
│   │   └── DesignTimeDbContextFactoryPostgres.cs    # ← Factory cho PostgreSQL
│   └── BaseMigration.cs                             # ← Helper class (optional)
├── Repositories/Persistence/
│   ├── ToeicGeniusDbContext.cs                      # ← Base context (giữ nguyên)
│   ├── ToeicGeniusDbContextSqlServer.cs             # ← Context cho SQL Server
│   └── ToeicGeniusDbContextPostgres.cs              # ← Context cho PostgreSQL
├── scripts/
│   ├── create-migration.ps1                        # ← Script PowerShell
│   └── create-migration.sh                         # ← Script Bash
├── Program.cs                                        # ← Tự động nhận diện provider
├── MIGRATION_GUIDE.md                               # ← Hướng dẫn chi tiết
├── QUICK_START.md                                   # ← Quick start guide
└── README_MIGRATIONS.md                             # ← File này
```

## 🔧 Cách Hoạt Động

### 1. Tự Động Nhận Diện Provider

**Program.cs** tự động nhận diện database provider từ:
1. Biến môi trường `DbProvider` hoặc `DB_PROVIDER`
2. Connection string (nếu chứa `Host=` hoặc `postgresql://` → PostgreSQL)

```csharp
var usePostgres =
    string.Equals(dbProvider, "postgres", StringComparison.OrdinalIgnoreCase) ||
    connStr.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
    connStr.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);
```

### 2. Tạo Migration

Khi bạn chạy:
```bash
dotnet ef migrations add MigrationName_SqlServer -c ToeicGeniusDbContextSqlServer -o Migrations/SqlServer
```

EF Core sẽ:
1. Dùng `DesignTimeDbContextFactorySqlServer` để tạo context với SQL Server
2. Tạo migration file trong `Migrations/SqlServer/`
3. Migration sẽ có namespace `ToeicGenius.Migrations.SqlServer`

### 3. Chạy Migration

Khi deploy lên Render:
1. `Program.cs` nhận diện PostgreSQL từ connection string
2. Tự động chạy `context.Database.Migrate()`
3. EF Core sẽ tìm migrations trong namespace `ToeicGenius.Migrations` (mặc định)

**⚠️ Vấn đề**: EF Core sẽ tìm migrations trong namespace mặc định `ToeicGenius.Migrations`, không phải `ToeicGenius.Migrations.Postgres`.

**✅ Giải pháp**: Cần cấu hình migrations assembly hoặc dùng cách khác (xem phần dưới).

## 🔄 Quy Trình Làm Việc Thực Tế

### Bước 1: Thay Đổi Model/Entity

Ví dụ: Thêm property mới vào `User` entity.

### Bước 2: Tạo Migration cho SQL Server (Local)

```bash
# Đảm bảo appsettings.json có connection string SQL Server
dotnet ef migrations add AddNewProperty_SqlServer `
  -c ToeicGeniusDbContextSqlServer `
  -o Migrations/SqlServer
```

### Bước 3: Test trên Local

```bash
dotnet ef database update -c ToeicGeniusDbContextSqlServer
```

### Bước 4: Tạo Migration cho PostgreSQL (Production)

```bash
# Set connection string PostgreSQL (hoặc dùng appsettings.json với PostgreSQL)
$env:ConnectionStrings__MyCnn="postgresql://user:pass@host:port/db"
dotnet ef migrations add AddNewProperty_Postgres `
  -c ToeicGeniusDbContextPostgres `
  -o Migrations/Postgres
```

### Bước 5: Commit và Deploy

```bash
git add Migrations/SqlServer/AddNewProperty_SqlServer.cs
git add Migrations/Postgres/AddNewProperty_Postgres.cs
git commit -m "Add new property to User entity"
git push
```

Render sẽ tự động:
1. Build project
2. Nhận diện PostgreSQL từ connection string
3. Chạy migrations trong `Migrations/Postgres`

## ⚠️ Lưu Ý Quan Trọng

### Vấn Đề Hiện Tại

EF Core sẽ tìm migrations dựa trên **namespace của migration class**, không phải thư mục. Khi bạn tạo migration với `-o Migrations/Postgres`, namespace vẫn là `ToeicGenius.Migrations`, không phải `ToeicGenius.Migrations.Postgres`.

### Giải Pháp Tạm Thời

**Cách 1: Dùng 2 DbContext riêng và đăng ký đúng DbContext**

Cập nhật `Program.cs` để đăng ký đúng DbContext dựa trên provider:

```csharp
if (usePostgres)
{
    builder.Services.AddDbContext<ToeicGeniusDbContextPostgres>(options =>
    {
        options.UseNpgsql(connStr);
    });
    // Đăng ký base context cho các service khác
    builder.Services.AddScoped<ToeicGeniusDbContext>(sp => 
        sp.GetRequiredService<ToeicGeniusDbContextPostgres>());
}
else
{
    builder.Services.AddDbContext<ToeicGeniusDbContextSqlServer>(options =>
    {
        options.UseSqlServer(connStr);
    });
    // Đăng ký base context cho các service khác
    builder.Services.AddScoped<ToeicGeniusDbContext>(sp => 
        sp.GetRequiredService<ToeicGeniusDbContextSqlServer>());
}
```

**Cách 2: Giữ nguyên cách hiện tại và chỉ định migrations assembly**

Cấu hình migrations assembly trong `UseNpgsql` và `UseSqlServer`:

```csharp
if (usePostgres)
{
    options.UseNpgsql(connStr, npgsqlOptions =>
    {
        npgsqlOptions.MigrationsAssembly("ToeicGenius");
        // Chỉ định migrations namespace (nếu cần)
    });
}
```

**Cách 3: Dùng cùng 1 migration file cho cả 2 provider (như hiện tại)**

Giữ nguyên cách hiện tại: 1 migration file với code tự động nhận diện provider (dùng `migrationBuilder.ActiveProvider`).

## 🎯 Khuyến Nghị

**Nếu bạn muốn đơn giản nhất:**
- ✅ Dùng **PostgreSQL ở cả local và production**
- ✅ Chỉ cần 1 bộ migrations
- ✅ Không cần chỉnh tay migration files

**Nếu bạn muốn dùng SQL Server ở local:**
- ✅ Dùng **Cách 1** (2 DbContext riêng và đăng ký đúng)
- ✅ Hoặc **Cách 3** (1 migration file với code tự động nhận diện)

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Connection string đúng format
2. DesignTimeFactory đúng provider
3. Migration files ở đúng thư mục
4. Namespace của migration class
