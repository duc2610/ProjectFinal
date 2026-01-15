# Hướng dẫn Dual Migration Setup (SQL Server + PostgreSQL)

## Cấu trúc

```
Migrations/
├── Postgres/          # Migrations cho PostgreSQL (Render production)
│   ├── 20251021174001_DatabaseV0.3.cs
│   └── ...
├── SqlServer/         # Migrations cho SQL Server (Local development)
│   └── (sẽ được tạo mới)
└── DesignTime/       # Design-time factories
    ├── DesignTimeDbContextFactoryPostgres.cs
    └── DesignTimeDbContextFactorySqlServer.cs
```

## Tạo Migration Mới

### Cho PostgreSQL (Render)

```bash
cd backend/ToeicGenius

# Đảm bảo connection string trong appsettings.json là PostgreSQL
# Hoặc set environment variable:
$env:DB_PROVIDER = "postgres"

# Tạo migration
dotnet ef migrations add TenMigrationMoi --context ToeicGeniusDbContextPostgres --output-dir Migrations/Postgres
```

Migration sẽ được tạo với:
- Namespace: `ToeicGenius.Migrations.Postgres`
- `[DbContext(typeof(ToeicGeniusDbContextPostgres))]`
- Types: `text`, `varchar`, `uuid`, `timestamp`, `boolean`, `double precision`

### Cho SQL Server (Local)

```bash
cd backend/ToeicGenius

# Đảm bảo connection string trong appsettings.json là SQL Server
# Hoặc set environment variable:
$env:DB_PROVIDER = "sqlserver"

# Tạo migration
dotnet ef migrations add TenMigrationMoi --context ToeicGeniusDbContextSqlServer --output-dir Migrations/SqlServer
```

Migration sẽ được tạo với:
- Namespace: `ToeicGenius.Migrations.SqlServer`
- `[DbContext(typeof(ToeicGeniusDbContextSqlServer))]`
- Types: `nvarchar`, `datetime2`, `uniqueidentifier`, `bit`, `float`

## Tạo Migration Baseline cho SQL Server

Nếu bạn chưa có migration nào cho SQL Server, cần tạo baseline từ model hiện tại:

```bash
cd backend/ToeicGenius

# 1. Đảm bảo connection string là SQL Server
# 2. Drop database local (nếu không cần giữ data):
dotnet ef database drop --context ToeicGeniusDbContextSqlServer --force

# 3. Tạo migration baseline đầu tiên:
dotnet ef migrations add DatabaseV0.3_SqlServer_Baseline --context ToeicGeniusDbContextSqlServer --output-dir Migrations/SqlServer

# 4. Apply migration:
dotnet ef database update --context ToeicGeniusDbContextSqlServer
```

## Apply Migrations

### Tự động (Runtime)

`Program.cs` sẽ tự động detect provider và apply migrations đúng:
- PostgreSQL → dùng `ToeicGeniusDbContextPostgres` → migrations từ `Migrations.Postgres`
- SQL Server → dùng `ToeicGeniusDbContextSqlServer` → migrations từ `Migrations.SqlServer`

### Thủ công

**PostgreSQL:**
```bash
dotnet ef database update --context ToeicGeniusDbContextPostgres
```

**SQL Server:**
```bash
dotnet ef database update --context ToeicGeniusDbContextSqlServer
```

## Lưu ý

1. **Không mix migrations**: Mỗi provider chỉ dùng migrations của riêng nó
2. **Namespace khác nhau**: Postgres dùng `ToeicGenius.Migrations.Postgres`, SQL Server dùng `ToeicGenius.Migrations.SqlServer`
3. **History table riêng**: Mỗi provider có `__EFMigrationsHistory` riêng (cùng tên nhưng trong schema khác nhau)
4. **Tạo migration mới**: Luôn chỉ định đúng `--context` và `--output-dir` khi tạo migration mới
