# Script kiểm tra môi trường Docker trước khi chạy
# Sử dụng: .\check-docker.ps1
# Chạy từ thư mục root của dự án

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kiểm tra môi trường Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Kiểm tra Docker
Write-Host "1. Kiểm tra Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Docker đã cài đặt: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Docker chưa được cài đặt hoặc không tìm thấy" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   ✗ Docker chưa được cài đặt" -ForegroundColor Red
    $allGood = $false
}

# Kiểm tra Docker đang chạy
Write-Host ""
Write-Host "2. Kiểm tra Docker đang chạy..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Docker đang chạy" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Docker không chạy. Vui lòng khởi động Docker Desktop." -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   ✗ Docker không chạy. Vui lòng khởi động Docker Desktop." -ForegroundColor Red
    $allGood = $false
}

# Kiểm tra Docker Compose
Write-Host ""
Write-Host "3. Kiểm tra Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Docker Compose đã cài đặt: $composeVersion" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Docker Compose chưa được cài đặt" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   ✗ Docker Compose chưa được cài đặt" -ForegroundColor Red
    $allGood = $false
}

# Kiểm tra file docker-compose.yml
Write-Host ""
Write-Host "4. Kiểm tra file docker-compose.yml..." -ForegroundColor Yellow
if (Test-Path "docker-compose.yml") {
    Write-Host "   ✓ File docker-compose.yml tồn tại" -ForegroundColor Green
} else {
    Write-Host "   ✗ File docker-compose.yml không tìm thấy" -ForegroundColor Red
    Write-Host "     Vui lòng chạy script này trong thư mục root của dự án" -ForegroundColor Yellow
    $allGood = $false
}

# Kiểm tra port đang sử dụng
Write-Host ""
Write-Host "5. Kiểm tra port đang sử dụng..." -ForegroundColor Yellow

$ports = @(3000, 7100, 14333, 8001, 8002)
$portsInUse = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $portsInUse += $port
        Write-Host "   ⚠ Port $port đang được sử dụng" -ForegroundColor Yellow
    }
}

if ($portsInUse.Count -eq 0) {
    Write-Host "   ✓ Tất cả port đều sẵn sàng" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Các port sau đang được sử dụng: $($portsInUse -join ', ')" -ForegroundColor Yellow
    Write-Host "     Bạn có thể cần dừng các ứng dụng đang dùng port này" -ForegroundColor Yellow
}

# Kiểm tra thư mục frontend
Write-Host ""
Write-Host "6. Kiểm tra thư mục frontend..." -ForegroundColor Yellow
if (Test-Path "./frontend") {
    Write-Host "   ✓ Thư mục frontend tồn tại" -ForegroundColor Green
} else {
    Write-Host "   ✗ Thư mục frontend không tìm thấy" -ForegroundColor Red
    $allGood = $false
}

# Kiểm tra thư mục backend
Write-Host ""
Write-Host "7. Kiểm tra thư mục backend..." -ForegroundColor Yellow
if (Test-Path "./backend/ToeicGenius") {
    Write-Host "   ✓ Thư mục backend/ToeicGenius tồn tại" -ForegroundColor Green
} else {
    Write-Host "   ✗ Thư mục backend/ToeicGenius không tìm thấy" -ForegroundColor Red
    $allGood = $false
}

# Kiểm tra thư mục python services
Write-Host ""
Write-Host "8. Kiểm tra Python services..." -ForegroundColor Yellow
if (Test-Path "./backend/python-service") {
    Write-Host "   ✓ Thư mục python-service tồn tại" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Thư mục python-service không tìm thấy (có thể không cần thiết)" -ForegroundColor Yellow
}

# Tổng kết
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  ✓ Tất cả kiểm tra đều OK!" -ForegroundColor Green
    Write-Host "  Bạn có thể chạy: docker-compose up -d" -ForegroundColor Cyan
} else {
    Write-Host "  ✗ Có một số vấn đề cần xử lý" -ForegroundColor Red
    Write-Host "  Vui lòng sửa các lỗi trên trước khi tiếp tục" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

