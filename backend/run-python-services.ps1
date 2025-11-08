# PowerShell wrapper script để chạy Python services với Docker
# Có thể chạy từ thư mục root của backend
# Usage: .\run-python-services.ps1 [command] [service]

param(
    [Parameter(Position=0)]
    [string]$Command = "start",
    
    [Parameter(Position=1)]
    [string]$Service = "all"
)

$scriptPath = Join-Path $PSScriptRoot "python-service\run-docker.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Host "[ERROR] Script not found at: $scriptPath" -ForegroundColor Red
    Write-Host "Please make sure you're running this from the backend root directory." -ForegroundColor Yellow
    exit 1
}

# Execute the actual script
& $scriptPath -Command $Command -Service $Service

