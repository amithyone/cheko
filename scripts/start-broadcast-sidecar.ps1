# Start BLE broadcast sidecar with credentials from .env.local
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$configPath = Join-Path $env:APPDATA "Cheko POS\cheko-config.json"

$envFile = Join-Path $root ".env.local"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim()
      Set-Item -Path "env:$name" -Value $value
    }
  }
  Write-Host "Loaded .env.local" -ForegroundColor Green
} else {
  Write-Host 'No .env.local - using Cheko Settings / defaults' -ForegroundColor Yellow
}

if (Test-Path $configPath) {
  $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
  if ($cfg.payment) {
    # Cheko Settings wins over .env.local (matches sidecar cheko_config.py)
    if ($cfg.payment.terminalId) { $env:CHEKO_TERMINAL_ID = $cfg.payment.terminalId }
    if ($cfg.payment.signingKey) { $env:CHEKO_SIGNING_KEY = $cfg.payment.signingKey }
    if ($cfg.payment.signatureAlg) { $env:CHEKO_SIGNATURE_ALG = $cfg.payment.signatureAlg }
    if ($cfg.payment.merchantBankName) { $env:CHEKO_MERCHANT_BANK = $cfg.payment.merchantBankName }
    if ($cfg.payment.maskedAccountSuffix) { $env:CHEKO_MASKED_SUFFIX = $cfg.payment.maskedAccountSuffix }
  }
  Write-Host "Loaded Cheko Settings from $configPath" -ForegroundColor Green
}

if (-not $env:CHEKO_SIGNATURE_ALG) { $env:CHEKO_SIGNATURE_ALG = "ed25519" }

$py = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
if (-not (Test-Path $py)) { $py = "python" }

$env:PYTHONPATH = Join-Path $root "vendor\checkout_broadcast\sdk\python"
if (-not $env:CHEKO_BROADCAST_TRANSPORT) { $env:CHEKO_BROADCAST_TRANSPORT = "ble" }

Write-Host "Terminal: $($env:CHEKO_TERMINAL_ID)" -ForegroundColor Cyan
Write-Host "Signature alg: $($env:CHEKO_SIGNATURE_ALG)" -ForegroundColor Cyan
Write-Host "Bank: $($env:CHEKO_MERCHANT_BANK)" -ForegroundColor Cyan
Write-Host "Masked suffix: $($env:CHEKO_MASKED_SUFFIX)" -ForegroundColor Cyan
Write-Host "Transport: $($env:CHEKO_BROADCAST_TRANSPORT)" -ForegroundColor Cyan
$sidecar = Join-Path (Join-Path $root 'broadcast-sidecar') 'server.py'
& $py $sidecar