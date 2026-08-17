# NEXUS Platform Startup Script
$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$BackendPath = Join-Path $Root "backend"
$FrontendPath = Join-Path $Root "frontend"
$CitizenPath = Join-Path $Root "apps\citizen"
$Uvicorn = Join-Path $BackendPath ".venv\Scripts\uvicorn.exe"

Write-Host "=== NEXUS Platform Startup ===" -ForegroundColor Cyan
Write-Host "Project root: $Root" -ForegroundColor DarkGray

function Test-BackendHealthy {
    try {
        $h = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 2
        return ($h.status -eq "healthy")
    } catch { return $false }
}

function Test-PortListening([int]$Port) {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    return ($null -ne $conn)
}

function Stop-PortProcess([int]$Port) {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        $procId = $conn.OwningProcess
        if ($procId -gt 0) {
            Write-Host "  Freeing port $Port (PID $procId)..." -ForegroundColor Yellow
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
}

function Get-FrontendPort {
    if (Test-PortListening 5173) { return 5173 }
    return 5173
}

$DockerPath = Join-Path $Root "infrastructure\docker"

function Start-Postgres {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "  Docker not found - DB will run in memory mode." -ForegroundColor DarkGray
        return
    }
    Write-Host "  Starting PostgreSQL (Docker)..." -ForegroundColor Green
    Push-Location $DockerPath
    docker compose up postgres -d 2>$null
    Pop-Location
    Start-Sleep -Seconds 4
}

# ── Database ──
Write-Host ""
Write-Host "[0/3] PostgreSQL (Docker)" -ForegroundColor Cyan
Start-Postgres

# ── Backend venv ──
$Pip = Join-Path $BackendPath ".venv\Scripts\pip.exe"
if (-not (Test-Path (Join-Path $BackendPath ".venv"))) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    Push-Location $BackendPath
    python -m venv .venv
    Pop-Location
}

if (-not (Test-Path $Uvicorn)) {
    if (-not (Test-Path $Pip)) {
        Write-Host "ERROR: Python venv is broken. Delete backend\.venv and run this script again." -ForegroundColor Red
        exit 1
    }
    Write-Host "Installing backend dependencies (uvicorn missing)..." -ForegroundColor Yellow
    Push-Location $BackendPath
    & $Pip install -r requirements.txt
    Pop-Location
}

if (-not (Test-Path $Uvicorn)) {
    Write-Host "ERROR: uvicorn still not found after pip install." -ForegroundColor Red
    Write-Host "  Try: cd backend; python -m venv .venv; .\.venv\Scripts\pip.exe install -r requirements.txt" -ForegroundColor DarkGray
    exit 1
}

# ── Backend ──
Write-Host ""
Write-Host "[1/3] Backend (port 8000)" -ForegroundColor Cyan

if (Test-BackendHealthy) {
    Write-Host "  Already running and healthy." -ForegroundColor Green
} else {
    if (Test-PortListening 8000) {
        Write-Host "  Port 8000 blocked - freeing..." -ForegroundColor Yellow
        Stop-PortProcess 8000
        Start-Sleep -Seconds 2
    }

    Write-Host "  Starting uvicorn..." -ForegroundColor Green
    Start-Process -FilePath $Uvicorn `
        -WorkingDirectory $BackendPath `
        -ArgumentList @("app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000", "--env-file", ".env") `
        -WindowStyle Normal

    Write-Host "  Waiting for health check..." -ForegroundColor Yellow
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        if (Test-BackendHealthy) { $ready = $true; break }
        Start-Sleep -Seconds 1
    }

    if ($ready) {
        Write-Host "  Backend is healthy." -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Backend did not respond on :8000" -ForegroundColor Red
    }
}

# ── Frontend deps ──
if (-not (Test-Path (Join-Path $FrontendPath "node_modules"))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $FrontendPath
    npm install
    Pop-Location
}

# ── Frontend ──
Write-Host ""
Write-Host "[2/3] Command Center (port 5173)" -ForegroundColor Cyan

if (Test-PortListening 5173) {
    Write-Host "  Already running on port 5173." -ForegroundColor Green
    Write-Host '  Do NOT run npm run dev again.' -ForegroundColor Yellow
} else {
    if (Test-PortListening 5174) {
        Write-Host '  Citizen app is on 5174 - starting Command Center on 5173...' -ForegroundColor DarkGray
    }

    Write-Host "  Starting Vite dev server..." -ForegroundColor Green
    Start-Process -FilePath "cmd.exe" `
        -WorkingDirectory $FrontendPath `
        -ArgumentList @("/k", "npm run dev") `
        -WindowStyle Normal

    Start-Sleep -Seconds 5

    if (-not (Test-PortListening 5173)) {
        Write-Host "  WARNING: Frontend did not start. Check the cmd window for errors." -ForegroundColor Red
    } else {
        Write-Host "  Frontend started." -ForegroundColor Green
        Write-Host '  Do NOT run npm run dev again.' -ForegroundColor Yellow
    }
}

# ── Citizen app ──
Write-Host ""
Write-Host "[3/3] Citizen App (port 5174)" -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $CitizenPath "node_modules"))) {
    Write-Host "  Installing citizen app dependencies..." -ForegroundColor Yellow
    Push-Location $CitizenPath
    npm install
    Pop-Location
}

if (Test-PortListening 5174) {
    Write-Host "  Already running on port 5174." -ForegroundColor Green
} else {
    Write-Host "  Starting citizen app..." -ForegroundColor Green
    Start-Process -FilePath "cmd.exe" `
        -WorkingDirectory $CitizenPath `
        -ArgumentList @("/k", "npm run dev") `
        -WindowStyle Normal
    Start-Sleep -Seconds 4
    if (Test-PortListening 5174) {
        Write-Host "  Citizen app started." -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Citizen app did not start." -ForegroundColor Red
    }
}

$frontendPort = Get-FrontendPort
$frontendUrl = "http://localhost:" + $frontendPort

Write-Host ""
Write-Host "=== NEXUS is ready ===" -ForegroundColor Cyan
Write-Host "  Backend:         http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Command Center:  $frontendUrl" -ForegroundColor White
Write-Host "  Citizen App:     http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host 'Open the Frontend URL in your browser.' -ForegroundColor Green
Write-Host 'To stop everything: .\scripts\stop.ps1' -ForegroundColor DarkGray
