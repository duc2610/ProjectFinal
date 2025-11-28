# Script de rebuild frontend sau khi thay doi file .env
# Su dung: .\rebuild-frontend.ps1
# Chay tu thu muc root cua du an

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Rebuild Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Doc bien moi truong tu frontend/.env va backend/.env
if (Test-Path "./load-env.ps1") {
    Write-Host "Dang doc bien moi truong tu .env files..." -ForegroundColor Yellow
    . ./load-env.ps1
    Write-Host ""
}

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
Write-Host "Dang rebuild frontend (co the mat 2-3 phut)..." -ForegroundColor Yellow
Write-Host ""

# Rebuild frontend
docker-compose build --no-cache frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Dang restart frontend..." -ForegroundColor Yellow
    docker-compose up -d frontend
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  Frontend da duoc rebuild thanh cong!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Luu y: Hard refresh trinh duyet (Ctrl+F5) de xem thay doi" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "[ERROR] Co loi xay ra khi restart frontend." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "[ERROR] Co loi xay ra khi rebuild frontend." -ForegroundColor Red
    Write-Host "Vui long kiem tra logs: docker-compose logs frontend" -ForegroundColor Yellow
    exit 1
}

