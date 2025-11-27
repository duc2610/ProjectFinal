# Script de doc bien moi truong tu frontend/.env va backend/.env
# Su dung: .\load-env.ps1

# Doc frontend/.env
if (Test-Path "./frontend/.env") {
    Get-Content "./frontend/.env" | ForEach-Object {
        # Bo qua dong trong va comment
        if ($_ -and $_ -notmatch '^\s*#') {
            # Xu ly format: KEY = VALUE hoac KEY=VALUE
            if ($_ -match '^\s*([^#=]+?)\s*=\s*(.+?)\s*$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Xoa dau nhay neu co
                if ($value -match '^["''](.+)["'']$') {
                    $value = $matches[1]
                }
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
            }
        }
    }
    Write-Host "[OK] Da doc bien moi truong tu frontend/.env" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Khong tim thay file frontend/.env" -ForegroundColor Yellow
}

# Doc backend/.env
if (Test-Path "./backend/.env") {
    Get-Content "./backend/.env" | ForEach-Object {
        # Bo qua dong trong va comment
        if ($_ -and $_ -notmatch '^\s*#') {
            # Xu ly format: KEY = VALUE hoac KEY=VALUE
            if ($_ -match '^\s*([^#=]+?)\s*=\s*(.+?)\s*$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Xoa dau nhay neu co
                if ($value -match '^["''](.+)["'']$') {
                    $value = $matches[1]
                }
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
            }
        }
    }
    Write-Host "[OK] Da doc bien moi truong tu backend/.env" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Khong tim thay file backend/.env" -ForegroundColor Yellow
}

