# Script để tạo migration baseline cho SQL Server
# Chạy script này khi bạn muốn tạo bộ migration mới cho SQL Server từ đầu

Write-Host "=== Creating SQL Server Migration Baseline ===" -ForegroundColor Cyan

# Đảm bảo đang ở đúng thư mục
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Join-Path $scriptPath ".."
Set-Location $projectPath

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow

# Kiểm tra connection string
Write-Host "`nChecking connection string..." -ForegroundColor Yellow
$appsettingsPath = Join-Path $projectPath "appsettings.json"
if (Test-Path $appsettingsPath) {
    $appsettings = Get-Content $appsettingsPath | ConvertFrom-Json
    $connStr = $appsettings.ConnectionStrings.MyCnn
    
    if ($connStr -and $connStr -notmatch "Host=" -and $connStr -notmatch "postgresql://") {
        Write-Host "✓ Connection string appears to be SQL Server" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARNING: Connection string appears to be PostgreSQL!" -ForegroundColor Red
        Write-Host "Please update appsettings.json to use SQL Server connection string" -ForegroundColor Yellow
        Read-Host "Press Enter to continue anyway, or Ctrl+C to cancel"
    }
} else {
    Write-Host "⚠ appsettings.json not found" -ForegroundColor Yellow
}

# Hỏi xem có muốn drop database không
Write-Host "`nDo you want to DROP the existing SQL Server database?" -ForegroundColor Yellow
Write-Host "This will DELETE ALL DATA in the database!" -ForegroundColor Red
$dropDb = Read-Host "Drop database? (y/N)"

if ($dropDb -eq "y" -or $dropDb -eq "Y") {
    Write-Host "`nDropping database..." -ForegroundColor Yellow
    dotnet ef database drop --context ToeicGeniusDbContextSqlServer --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠ Database drop failed or database doesn't exist (this is OK)" -ForegroundColor Yellow
    }
}

# Tạo migration baseline
Write-Host "`nCreating migration baseline..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationName = "DatabaseV0.3_SqlServer_Baseline_$timestamp"

dotnet ef migrations add $migrationName `
    --context ToeicGeniusDbContextSqlServer `
    --output-dir Migrations/SqlServer

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Migration baseline created successfully!" -ForegroundColor Green
    Write-Host "Migration file: Migrations/SqlServer/$migrationName.cs" -ForegroundColor Cyan
    
    # Hỏi xem có muốn apply migration không
    Write-Host "`nDo you want to apply the migration to the database?" -ForegroundColor Yellow
    $applyMigration = Read-Host "Apply migration? (Y/n)"
    
    if ($applyMigration -ne "n" -and $applyMigration -ne "N") {
        Write-Host "`nApplying migration..." -ForegroundColor Yellow
        dotnet ef database update --context ToeicGeniusDbContextSqlServer
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Migration applied successfully!" -ForegroundColor Green
        } else {
            Write-Host "`n✗ Migration application failed" -ForegroundColor Red
        }
    }
} else {
    Write-Host "`n✗ Migration creation failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
