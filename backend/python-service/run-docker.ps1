# PowerShell script helper để chạy Python services với Docker
# Usage: .\run-docker.ps1 [command] [service]
# Commands: start, stop, restart, logs, status, rebuild

param(
    [Parameter(Position=0)]
    [string]$Command = "start",
    
    [Parameter(Position=1)]
    [string]$Service = "all"
)

# Function to print colored messages
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Detect Docker Compose command (v1: docker-compose, v2: docker compose)
function Get-DockerComposeCommand {
    # Try docker compose (v2) first - this is the modern way
    $dockerCmd = Get-Command "docker" -ErrorAction SilentlyContinue
    if ($dockerCmd) {
        $output = docker compose version 2>&1
        if ($LASTEXITCODE -eq 0) {
            return "docker compose"
        }
    }
    
    # Try docker-compose (v1) - legacy standalone
    $dockerComposeV1 = Get-Command "docker-compose" -ErrorAction SilentlyContinue
    if ($dockerComposeV1) {
        return "docker-compose"
    }
    
    return $null
}

# Check if Docker is installed and running
function Test-Docker {
    $dockerCmd = Get-Command "docker" -ErrorAction SilentlyContinue
    if (-not $dockerCmd) {
        Write-Error "Docker is not installed or not in PATH!"
        Write-Host ""
        Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        Write-Host "After installation, make sure Docker Desktop is running."
        exit 1
    }
    
    # Check if Docker daemon is running
    try {
        $null = docker ps 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker daemon is not running!"
            Write-Host ""
            Write-Host "Please start Docker Desktop and try again."
            exit 1
        }
    } catch {
        Write-Error "Cannot connect to Docker daemon!"
        Write-Host ""
        Write-Host "Please make sure Docker Desktop is running."
        exit 1
    }
    
    # Check Docker Compose
    $composeCmd = Get-DockerComposeCommand
    if (-not $composeCmd) {
        Write-Error "Docker Compose is not available!"
        Write-Host ""
        Write-Host "Docker Compose should be included with Docker Desktop."
        Write-Host "If you're using Docker Compose v2, make sure Docker Desktop is up to date."
        exit 1
    }
    
    return $composeCmd
}

# Global variable to store docker compose command
$script:DockerComposeCmd = $null

# Check if .env file exists
function Test-EnvFile {
    $envPath = Join-Path (Split-Path $PSScriptRoot -Parent) ".env"
    if (-not (Test-Path $envPath)) {
        Write-Warn ".env file not found!"
        Write-Host "Please create .env file in the backend root directory with:"
        Write-Host "  - GEMINI_API_KEY"
        Write-Host "  - AZURE_SPEECH_KEY (for speaking-api)"
        Write-Host "  - AZURE_SPEECH_REGION (for speaking-api)"
        Write-Host ""
        $response = Read-Host "Continue anyway? (y/n)"
        if ($response -ne "y" -and $response -ne "Y") {
            exit 1
        }
    }
}

# Start services
function Start-Services {
    Write-Info "Starting Python services..."
    Test-EnvFile
    
    # Check Docker and get compose command
    $script:DockerComposeCmd = Test-Docker
    Write-Info "Using: $script:DockerComposeCmd"
    
    $rootDir = Split-Path $PSScriptRoot -Parent
    Set-Location $rootDir
    
    $composeArgs = if ($script:DockerComposeCmd -eq "docker compose") {
        @("compose", "up", "-d")
    } else {
        @("up", "-d")
    }
    
    if ($Service -eq "all") {
        & docker $composeArgs
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to start services!"
            exit 1
        }
        Write-Info "All services started!"
    }
    elseif ($Service -eq "writing") {
        $composeArgs += "writing-api"
        & docker $composeArgs
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to start writing-api!"
            exit 1
        }
        Write-Info "Writing API started!"
    }
    elseif ($Service -eq "speaking") {
        $composeArgs += "speaking-api"
        & docker $composeArgs
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to start speaking-api!"
            exit 1
        }
        Write-Info "Speaking API started!"
    }
    else {
        Write-Error "Unknown service: $Service"
        Write-Host "Available services: all, writing, speaking"
        exit 1
    }
    
    Write-Host ""
    Write-Info "Services status:"
    $statusArgs = if ($script:DockerComposeCmd -eq "docker compose") {
        @("compose", "ps")
    } else {
        @("ps")
    }
    & docker $statusArgs
}

# Stop services
function Stop-Services {
    Write-Info "Stopping Python services..."
    $script:DockerComposeCmd = Test-Docker
    $rootDir = Split-Path $PSScriptRoot -Parent
    Set-Location $rootDir
    
    if ($Service -eq "all") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "down") } else { @("down") }
        & docker $args
        Write-Info "All services stopped!"
    }
    elseif ($Service -eq "writing") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "stop", "writing-api") } else { @("stop", "writing-api") }
        & docker $args
        Write-Info "Writing API stopped!"
    }
    elseif ($Service -eq "speaking") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "stop", "speaking-api") } else { @("stop", "speaking-api") }
        & docker $args
        Write-Info "Speaking API stopped!"
    }
    else {
        Write-Error "Unknown service: $Service"
        exit 1
    }
}

# Restart services
function Restart-Services {
    Write-Info "Restarting Python services..."
    $script:DockerComposeCmd = Test-Docker
    $rootDir = Split-Path $PSScriptRoot -Parent
    Set-Location $rootDir
    
    if ($Service -eq "all") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "restart") } else { @("restart") }
        & docker $args
        Write-Info "All services restarted!"
    }
    elseif ($Service -eq "writing") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "restart", "writing-api") } else { @("restart", "writing-api") }
        & docker $args
        Write-Info "Writing API restarted!"
    }
    elseif ($Service -eq "speaking") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "restart", "speaking-api") } else { @("restart", "speaking-api") }
        & docker $args
        Write-Info "Speaking API restarted!"
    }
    else {
        Write-Error "Unknown service: $Service"
        exit 1
    }
}

# Show logs
function Show-Logs {
    $script:DockerComposeCmd = Test-Docker
    $rootDir = Split-Path $PSScriptRoot -Parent
    Set-Location $rootDir
    
    if ($Service -eq "all") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "logs", "-f") } else { @("logs", "-f") }
        & docker $args
    }
    elseif ($Service -eq "writing") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "logs", "-f", "writing-api") } else { @("logs", "-f", "writing-api") }
        & docker $args
    }
    elseif ($Service -eq "speaking") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "logs", "-f", "speaking-api") } else { @("logs", "-f", "speaking-api") }
        & docker $args
    }
    else {
        Write-Error "Unknown service: $Service"
        exit 1
    }
}

# Show status
function Show-Status {
    $script:DockerComposeCmd = Test-Docker
    $rootDir = Split-Path $PSScriptRoot -Parent
    Set-Location $rootDir
    
    Write-Info "Services status:"
    $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "ps") } else { @("ps") }
    & docker $args
    Write-Host ""
    Write-Info "Health checks:"
    Write-Host "Writing API: http://localhost:8002/health"
    Write-Host "Speaking API: http://localhost:8001/health"
}

# Rebuild services
function Rebuild-Services {
    Write-Info "Rebuilding Python services..."
    Test-EnvFile
    $script:DockerComposeCmd = Test-Docker
    $rootDir = Split-Path $PSScriptRoot -Parent
    Set-Location $rootDir
    
    if ($Service -eq "all") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "up", "-d", "--build") } else { @("up", "-d", "--build") }
        & docker $args
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to rebuild services!"
            exit 1
        }
        Write-Info "All services rebuilt and started!"
    }
    elseif ($Service -eq "writing") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "up", "-d", "--build", "writing-api") } else { @("up", "-d", "--build", "writing-api") }
        & docker $args
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to rebuild writing-api!"
            exit 1
        }
        Write-Info "Writing API rebuilt and started!"
    }
    elseif ($Service -eq "speaking") {
        $args = if ($script:DockerComposeCmd -eq "docker compose") { @("compose", "up", "-d", "--build", "speaking-api") } else { @("up", "-d", "--build", "speaking-api") }
        & docker $args
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to rebuild speaking-api!"
            exit 1
        }
        Write-Info "Speaking API rebuilt and started!"
    }
    else {
        Write-Error "Unknown service: $Service"
        exit 1
    }
}

# Show help
function Show-Help {
    Write-Host "Usage: .\run-docker.ps1 [command] [service]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start     Start services (default)"
    Write-Host "  stop      Stop services"
    Write-Host "  restart   Restart services"
    Write-Host "  logs      Show logs (follow mode)"
    Write-Host "  status    Show services status"
    Write-Host "  rebuild   Rebuild and start services"
    Write-Host "  help      Show this help message"
    Write-Host ""
    Write-Host "Services:"
    Write-Host "  all       All services (default)"
    Write-Host "  writing   Writing API only"
    Write-Host "  speaking  Speaking API only"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\run-docker.ps1 start              # Start all services"
    Write-Host "  .\run-docker.ps1 start writing     # Start writing API only"
    Write-Host "  .\run-docker.ps1 logs speaking     # Show speaking API logs"
    Write-Host "  .\run-docker.ps1 rebuild all       # Rebuild all services"
}

# Main
switch ($Command.ToLower()) {
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    "rebuild" {
        Rebuild-Services
    }
    "help" {
        Show-Help
    }
    "--help" {
        Show-Help
    }
    "-h" {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}

