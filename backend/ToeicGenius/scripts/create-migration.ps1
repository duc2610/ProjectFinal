# PowerShell script to create migrations for both SQL Server and PostgreSQL
# Usage: .\scripts\create-migration.ps1 -MigrationName "AddNewFeature"

param(
    [Parameter(Mandatory=$true)]
    [string]$MigrationName
)

$projectPath = "backend/ToeicGenius/ToeicGenius.csproj"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Migrations for: $MigrationName" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if connection string is set
$connStr = $env:ConnectionStrings__MyCnn
if (-not $connStr) {
    Write-Host "Warning: ConnectionStrings__MyCnn not set. Using appsettings.json..." -ForegroundColor Yellow
}

# Create SQL Server migration
Write-Host "`n[1/2] Creating SQL Server migration..." -ForegroundColor Green
dotnet ef migrations add "${MigrationName}_SqlServer" `
    -c ToeicGeniusDbContextSqlServer `
    -o Migrations/SqlServer `
    --project $projectPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create SQL Server migration!" -ForegroundColor Red
    exit 1
}

# Create PostgreSQL migration
Write-Host "`n[2/2] Creating PostgreSQL migration..." -ForegroundColor Green
dotnet ef migrations add "${MigrationName}_Postgres" `
    -c ToeicGeniusDbContextPostgres `
    -o Migrations/Postgres `
    --project $projectPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create PostgreSQL migration!" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✓ Migrations created successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SQL Server: Migrations/SqlServer/${MigrationName}_SqlServer.cs" -ForegroundColor White
Write-Host "PostgreSQL: Migrations/Postgres/${MigrationName}_Postgres.cs" -ForegroundColor White
