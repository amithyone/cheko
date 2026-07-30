# One-time setup: real BLE checkout broadcast on Windows (dev / pilot)
# Run in PowerShell: .\scripts\setup-broadcast-ble.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Cheko BLE Broadcast Setup ===" -ForegroundColor Cyan

# 1. Python 3.12
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Python 3.12 via winget..."
  winget install Python.Python.3.12 --accept-package-agreements --accept-source-agreements
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

python --version

# 2. Sidecar deps (bleak 3.x pulls WinRT wheels for Python 3.12 BLE GATT)
Write-Host "Installing Flask sidecar + WinRT BLE (bleak)..."
python -m pip install --upgrade pip
python -m pip install -r broadcast-sidecar/requirements.txt

# 3. checkout_broadcast SDK (signing only — bank API not required for BLE broadcast)
Write-Host "Installing checkout_broadcast SDK..."
if (-not (Test-Path "vendor/checkout_broadcast/sdk/python")) {
  Write-Host "Cloning checkout_broadcast SDK..."
  git clone --depth 1 https://github.com/amithyone/checkout_broadcast.git vendor/checkout_broadcast
}
python -m pip install -e vendor/checkout_broadcast/sdk/python

Write-Host "Verifying WinRT BLE import..."
python -c "from winrt.windows.devices.bluetooth.genericattributeprofile import GattServiceProvider; print('WinRT BLE OK')"

Write-Host ""
Write-Host "Done. Restart Cheko desktop app (npm run dev:desktop)." -ForegroundColor Green
Write-Host "Set the SAME signing key + terminal ID in Cheko Settings and your receive app." -ForegroundColor Yellow
Write-Host "Service UUID: cbbc0001-0000-4000-8000-000000000001" -ForegroundColor Yellow
