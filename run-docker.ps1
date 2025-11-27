# Script để chạy Docker Compose cho dự án ToeicGenius
# Sử dụng: .\run-docker.ps1
# Chạy từ thư mục root của dự án

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ToeicGenius Docker Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Docker có đang chạy không
Write-Host "Đang kiểm tra Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker đang chạy" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker không chạy. Vui lòng khởi động Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Đang khởi động các services..." -ForegroundColor Yellow
Write-Host ""

# Chạy docker-compose
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Services đã được khởi động!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend:   http://localhost:7100" -ForegroundColor Cyan
    Write-Host "SQL Server: localhost:14333" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Để xem logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "Để dừng services:" -ForegroundColor Yellow
    Write-Host "  docker-compose down" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Có lỗi xảy ra khi khởi động services." -ForegroundColor Red
    Write-Host "Vui lòng kiểm tra logs: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

