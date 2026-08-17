# Stop NEXUS backend/frontend processes
$ports = @(8000, 5173, 5174)

Write-Host "=== Stopping NEXUS processes ===" -ForegroundColor Cyan

foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        $procId = $conn.OwningProcess
        if ($procId -and $procId -ne 0) {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "Stopping $($proc.ProcessName) (PID $procId) on port $port" -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# Also stop orphaned uvicorn/python windows titled from backend path
Get-Process -Name "python", "uvicorn" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping $($_.ProcessName) (PID $($_.Id))" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2
Write-Host "Done. Run .\scripts\start.ps1 to restart." -ForegroundColor Green
