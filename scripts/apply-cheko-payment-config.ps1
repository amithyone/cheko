# Write CheckoutNow credentials into Electron userData (Cheko Settings store)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env.local"
$configDir = Join-Path $env:APPDATA "Cheko POS"
$configPath = Join-Path $configDir "cheko-config.json"

if (-not (Test-Path $envFile)) {
  Write-Error ".env.local not found. Create it from .env.example first."
}

$vars = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $vars[$matches[1].Trim()] = $matches[2].Trim()
  }
}

$terminalId = $vars["CHEKO_TERMINAL_ID"]
$signingKey = $vars["CHEKO_SIGNING_KEY"]
$merchantBankName = if ($vars["CHEKO_MERCHANT_BANK"]) { $vars["CHEKO_MERCHANT_BANK"] } else { "RUBIES MFB" }
$maskedAccountSuffix = if ($vars["CHEKO_MASKED_SUFFIX"]) { $vars["CHEKO_MASKED_SUFFIX"] } else { "***4863" }
if (-not $terminalId -or -not $signingKey) {
  Write-Error "CHEKO_TERMINAL_ID and CHEKO_SIGNING_KEY required in .env.local"
}

$store = @{ payment = @{
  provider = "checkoutnow"
  testMode = $true
  terminalId = $terminalId
  merchantId = "MCH-$terminalId"
  apiKey = $vars["CHEKO_API_KEY"]
  signingKey = $signingKey
  signatureAlg = if ($vars["CHEKO_SIGNATURE_ALG"]) { $vars["CHEKO_SIGNATURE_ALG"] } else { "ed25519" }
  merchantBankName = $merchantBankName
  maskedAccountSuffix = $maskedAccountSuffix
}}

if (Test-Path $configPath) {
  $existing = Get-Content $configPath -Raw | ConvertFrom-Json
  if ($existing.terminal) { $store.terminal = $existing.terminal }
  if ($existing.payment -and $existing.payment.merchantId -and -not $vars["CHEKO_MERCHANT_ID"]) {
    $store.payment.merchantId = $existing.payment.merchantId
  }
}

# Allow explicit merchant + api key in .env.local
if ($vars["CHEKO_MERCHANT_ID"]) { $store.payment.merchantId = $vars["CHEKO_MERCHANT_ID"] }
if ($vars["CHEKO_API_KEY"]) { $store.payment.apiKey = $vars["CHEKO_API_KEY"] }

New-Item -ItemType Directory -Force -Path $configDir | Out-Null
$store | ConvertTo-Json -Depth 4 | Set-Content -Path $configPath -Encoding UTF8
Write-Host "Saved payment config to $configPath" -ForegroundColor Green
Write-Host "Restart Cheko desktop (npm run dev:desktop) if it is running."
