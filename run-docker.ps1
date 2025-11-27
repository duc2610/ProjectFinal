# Script de chay Docker Compose cho du an ToeicGenius
# Su dung: .\run-docker.ps1
# Chay tu thu muc root cua du an

# Doc bien moi truong tu frontend/.env va backend/.env
if (Test-Path "./load-env.ps1") {
    . ./load-env.ps1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ToeicGenius Docker Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiem tra Docker co dang chay khong
Write-Host "Dang kiem tra Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Docker dang chay" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Docker khong chay. Vui long khoi dong Docker Desktop." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Docker khong chay. Vui long khoi dong Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Dang khoi dong cac services..." -ForegroundColor Yellow
Write-Host ""

# Chay docker-compose
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Services da duoc khoi dong!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend:   http://localhost:7100" -ForegroundColor Cyan
    Write-Host "SQL Server: localhost:14333" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "De xem logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "De dung services:" -ForegroundColor Yellow
    Write-Host "  docker-compose down" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Co loi xay ra khi khoi dong services." -ForegroundColor Red
    Write-Host "Vui long kiem tra logs: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
