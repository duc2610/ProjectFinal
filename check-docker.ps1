# Script kiem tra moi truong Docker truoc khi chay
# Su dung: .\check-docker.ps1
# Chay tu thu muc root cua du an

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kiem tra moi truong Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Kiem tra Docker
Write-Host "1. Kiem tra Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Docker da cai dat: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Docker chua duoc cai dat hoac khong tim thay" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   [ERROR] Docker chua duoc cai dat" -ForegroundColor Red
    $allGood = $false
}

# Kiem tra Docker dang chay
Write-Host ""
Write-Host "2. Kiem tra Docker dang chay..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Docker dang chay" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Docker khong chay. Vui long khoi dong Docker Desktop." -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   [ERROR] Docker khong chay. Vui long khoi dong Docker Desktop." -ForegroundColor Red
    $allGood = $false
}

# Kiem tra Docker Compose
Write-Host ""
Write-Host "3. Kiem tra Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Docker Compose da cai dat: $composeVersion" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Docker Compose chua duoc cai dat" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   [ERROR] Docker Compose chua duoc cai dat" -ForegroundColor Red
    $allGood = $false
}

# Kiem tra file docker-compose.yml
Write-Host ""
Write-Host "4. Kiem tra file docker-compose.yml..." -ForegroundColor Yellow
if (Test-Path "docker-compose.yml") {
    Write-Host "   [OK] File docker-compose.yml ton tai" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] File docker-compose.yml khong tim thay" -ForegroundColor Red
    Write-Host "     Vui long chay script nay trong thu muc root cua du an" -ForegroundColor Yellow
    $allGood = $false
}

# Kiem tra port dang su dung
Write-Host ""
Write-Host "5. Kiem tra port dang su dung..." -ForegroundColor Yellow

$ports = @(3000, 7100, 14333, 8001, 8002)
$portsInUse = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $portsInUse += $port
        Write-Host "   [WARNING] Port $port dang duoc su dung" -ForegroundColor Yellow
    }
}

if ($portsInUse.Count -eq 0) {
    Write-Host "   [OK] Tat ca port deu san sang" -ForegroundColor Green
} else {
    Write-Host "   [WARNING] Cac port sau dang duoc su dung: $($portsInUse -join ', ')" -ForegroundColor Yellow
    Write-Host "     Ban co the can dung cac ung dung dang dung port nay" -ForegroundColor Yellow
}

# Kiem tra thu muc frontend
Write-Host ""
Write-Host "6. Kiem tra thu muc frontend..." -ForegroundColor Yellow
if (Test-Path "./frontend") {
    Write-Host "   [OK] Thu muc frontend ton tai" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Thu muc frontend khong tim thay" -ForegroundColor Red
    $allGood = $false
}

# Kiem tra thu muc backend
Write-Host ""
Write-Host "7. Kiem tra thu muc backend..." -ForegroundColor Yellow
if (Test-Path "./backend/ToeicGenius") {
    Write-Host "   [OK] Thu muc backend/ToeicGenius ton tai" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Thu muc backend/ToeicGenius khong tim thay" -ForegroundColor Red
    $allGood = $false
}

# Kiem tra thu muc python services
Write-Host ""
Write-Host "8. Kiem tra Python services..." -ForegroundColor Yellow
if (Test-Path "./backend/python-service") {
    Write-Host "   [OK] Thu muc python-service ton tai" -ForegroundColor Green
} else {
    Write-Host "   [WARNING] Thu muc python-service khong tim thay (co the khong can thiet)" -ForegroundColor Yellow
}

# Tong ket
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  [OK] Tat ca kiem tra deu OK!" -ForegroundColor Green
    Write-Host "  Ban co the chay: docker-compose up -d" -ForegroundColor Cyan
} else {
    Write-Host "  [ERROR] Co mot so van de can xu ly" -ForegroundColor Red
    Write-Host "  Vui long sua cac loi tren truoc khi tiep tuc" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
