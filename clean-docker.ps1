# Script de don dep Docker - TAT CA TRONG 1 FILE
# Su dung: .\clean-docker.ps1
# Chay tu thu muc root cua du an

param(
    [switch]$All,           # Dọn dẹp toàn bộ
    [switch]$Compact,       # Dọn dẹp + Compact VHDX (Windows)
    [switch]$Safe           # Dọn dẹp an toàn (mặc định)
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Don dep Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Hien thi dung luong hien tai
Write-Host "Dang kiem tra dung luong hien tai..." -ForegroundColor Yellow
docker system df
Write-Host ""

# Neu khong co tham so, hien thi menu
if (-not $All -and -not $Compact -and -not $Safe) {
    Write-Host "Chon phuong thuc don dep:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Don dep an toan (Mac dinh - Khuyen nghị)" -ForegroundColor Green
    Write-Host "     - Xoa build cache" -ForegroundColor White
    Write-Host "     - Xoa images/containers/networks khong su dung" -ForegroundColor White
    Write-Host "     - GIU LAI images/containers/volumes dang chay" -ForegroundColor White
    Write-Host "     - CHUA giai phong dung luong o C: tren Windows" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  2. Don dep toan bo (Can than)" -ForegroundColor Yellow
    Write-Host "     - Xoa TAT CA build cache" -ForegroundColor White
    Write-Host "     - Xoa TAT CA images/containers/volumes KHONG DANG CHAY" -ForegroundColor White
    Write-Host "     - GIU LAI images/containers/volumes DANG CHAY" -ForegroundColor White
    Write-Host "     - CHUA giai phong dung luong o C: tren Windows" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  3. Don dep + Compact VHDX (Windows - Giai phong dung luong o C:)" -ForegroundColor Cyan
    Write-Host "     - TAT CA tinh nang cua 'Don dep toan bo'" -ForegroundColor White
    Write-Host "     - Tu dong shutdown WSL2" -ForegroundColor White
    Write-Host "     - Tu dong compact VHDX file (neu co Hyper-V)" -ForegroundColor White
    Write-Host "     - GIAI PHONG DUNG LUONG O C: THUC SU" -ForegroundColor Green
    Write-Host "     - Co the mat 5-10 phut" -ForegroundColor Yellow
    Write-Host ""
    
    $choice = Read-Host "Nhap lua chon (1/2/3) hoac Enter de chon mac dinh (1)"
    
    if ([string]::IsNullOrWhiteSpace($choice)) {
        $choice = "1"
    }
    
    switch ($choice) {
        "1" { $Safe = $true }
        "2" { $All = $true }
        "3" { $Compact = $true }
        default { 
            Write-Host "Lua chon khong hop le. Su dung mac dinh (1)." -ForegroundColor Yellow
            $Safe = $true
        }
    }
}

# Thuc hien don dep
if ($Compact) {
    # Don dep toan bo + Compact VHDX
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  CANH BAO: Don dep TOAN BO + Compact VHDX" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Script nay se:" -ForegroundColor Yellow
    Write-Host "  - Xoa TAT CA build cache" -ForegroundColor White
    Write-Host "  - Xoa TAT CA images/containers/volumes KHONG DANG CHAY" -ForegroundColor White
    Write-Host "  - Shutdown WSL2" -ForegroundColor White
    Write-Host "  - Compact VHDX file (giai phong dung luong o C:)" -ForegroundColor White
    Write-Host ""
    Write-Host "NHUNG SE GIU LAI:" -ForegroundColor Green
    Write-Host "  - Images, containers, volumes DANG CHAY" -ForegroundColor White
    Write-Host "  - Database volume (sql_data) DANG CHAY" -ForegroundColor White
    Write-Host ""
    
    $confirm = Read-Host "Ban co chac muon tiep tuc? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host ""
        Write-Host "Da huy." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "Buoc 1: Dang don dep trong Docker..." -ForegroundColor Yellow
    docker builder prune -af
    docker image prune -af
    docker container prune -f
    docker network prune -f
    docker volume prune -f
    
    Write-Host ""
    Write-Host "Buoc 2: Dang shutdown WSL2..." -ForegroundColor Yellow
    wsl --shutdown
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "Buoc 3: Dang compact VHDX file..." -ForegroundColor Yellow
    $vhdxPath = "$env:LOCALAPPDATA\Docker\wsl\data\ext4.vhdx"
    if (Test-Path $vhdxPath) {
        Write-Host "Tim thay VHDX file: $vhdxPath" -ForegroundColor Green
        Write-Host "Dang compact file (co the mat 2-5 phut)..." -ForegroundColor Yellow
        
        try {
            if (Get-Command Optimize-VHD -ErrorAction SilentlyContinue) {
                Optimize-VHD -Path $vhdxPath -Mode Full
                Write-Host "[OK] Da compact VHDX file" -ForegroundColor Green
            } else {
                Write-Host "[WARNING] Optimize-VHD khong co san" -ForegroundColor Yellow
                Write-Host "Vui long compact thu cong trong Docker Desktop:" -ForegroundColor Yellow
                Write-Host "  Settings -> Resources -> Advanced -> Clean / Purge data" -ForegroundColor White
            }
        } catch {
            Write-Host "[WARNING] Khong the compact VHDX: $_" -ForegroundColor Yellow
            Write-Host "Vui long compact thu cong trong Docker Desktop:" -ForegroundColor Yellow
            Write-Host "  Settings -> Resources -> Advanced -> Clean / Purge data" -ForegroundColor White
        }
    } else {
        Write-Host "[WARNING] Khong tim thay VHDX file" -ForegroundColor Yellow
        Write-Host "Vui long compact thu cong trong Docker Desktop:" -ForegroundColor Yellow
        Write-Host "  Settings -> Resources -> Advanced -> Clean / Purge data" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Buoc 4: Khoi dong lai Docker Desktop" -ForegroundColor Yellow
    Write-Host "Vui long khoi dong lai Docker Desktop thu cong" -ForegroundColor Cyan
    
} elseif ($All) {
    # Don dep toan bo
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  CANH BAO: Don dep TOAN BO" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Script nay se xoa:" -ForegroundColor Yellow
    Write-Host "  - TAT CA build cache" -ForegroundColor White
    Write-Host "  - TAT CA images KHONG DANG CHAY" -ForegroundColor White
    Write-Host "  - TAT CA containers KHONG DANG CHAY" -ForegroundColor White
    Write-Host "  - TAT CA volumes KHONG DANG CHAY" -ForegroundColor White
    Write-Host "  - TAT CA networks KHONG DANG CHAY" -ForegroundColor White
    Write-Host ""
    Write-Host "NHUNG SE GIU LAI:" -ForegroundColor Green
    Write-Host "  - Images, containers, volumes DANG CHAY" -ForegroundColor White
    Write-Host "  - Database volume (sql_data) DANG CHAY" -ForegroundColor White
    Write-Host ""
    
    $confirm = Read-Host "Ban co chac muon tiep tuc? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host ""
        Write-Host "Da huy." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "Dang don dep..." -ForegroundColor Yellow
    docker builder prune -af
    docker image prune -af
    docker container prune -f
    docker network prune -f
    docker volume prune -f
    
} else {
    # Don dep an toan (mac dinh)
    Write-Host ""
    Write-Host "Dang don dep an toan..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. Xoa build cache..." -ForegroundColor Cyan
    docker builder prune -f
    
    Write-Host "2. Xoa images khong su dung..." -ForegroundColor Cyan
    docker image prune -f
    
    Write-Host "3. Xoa containers da dung..." -ForegroundColor Cyan
    docker container prune -f
    
    Write-Host "4. Xoa networks khong su dung..." -ForegroundColor Cyan
    docker network prune -f
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Da don dep xong!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Hien thi dung luong sau khi don dep
Write-Host "Dung luong sau khi don dep:" -ForegroundColor Cyan
docker system df
Write-Host ""

# Hien thi luu y
if ($Compact) {
    Write-Host "Luu y:" -ForegroundColor Yellow
    Write-Host "  - Da giai phong dung luong o C: (sau khi compact VHDX)" -ForegroundColor Green
    Write-Host "  - Vui long khoi dong lai Docker Desktop" -ForegroundColor White
} elseif ($All) {
    Write-Host "Luu y:" -ForegroundColor Yellow
    Write-Host "  - Da xoa TAT CA images/containers/volumes khong su dung" -ForegroundColor White
    Write-Host "  - Images/containers/volumes DANG CHAY van con" -ForegroundColor White
    Write-Host "  - CHUA giai phong dung luong o C: tren Windows (can compact VHDX)" -ForegroundColor Yellow
    Write-Host "  - Chay: .\clean-docker.ps1 -Compact de giai phong dung luong o C:" -ForegroundColor Cyan
} else {
    Write-Host "Luu y:" -ForegroundColor Yellow
    Write-Host "  - Build cache da duoc xoa" -ForegroundColor White
    Write-Host "  - Images/containers/volumes DANG CHAY KHONG bi xoa" -ForegroundColor White
    Write-Host "  - Database volume KHONG bi xoa" -ForegroundColor White
    Write-Host "  - CHUA giai phong dung luong o C: tren Windows (can compact VHDX)" -ForegroundColor Yellow
    Write-Host "  - Chay: .\clean-docker.ps1 -Compact de giai phong dung luong o C:" -ForegroundColor Cyan
}
Write-Host ""
