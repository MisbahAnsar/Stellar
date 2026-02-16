# Deploy Script (uses Stellar CLI: `stellar` command)
$ErrorActionPreference = "Stop"

# Prefer stellar (v25+), fallback to soroban
$cli = $null
if (Get-Command stellar -ErrorAction SilentlyContinue) {
    $cli = "stellar"
} elseif (Get-Command soroban -ErrorAction SilentlyContinue) {
    $cli = "soroban"
}
if (-not $cli) {
    Write-Error "Neither 'stellar' nor 'soroban' found. Install Stellar CLI: cargo install stellar-cli (you may already have it as stellar-cli v25)."
    exit 1
}
Write-Host "Using CLI: $cli"

Write-Host "Configuring Identity 'alice'..."
try {
    & $cli keys address alice 2>$null | Out-Null
}
catch {
    Write-Host "Creating identity alice..."
    if ($cli -eq "stellar") {
        stellar keys generate alice
    } else {
        soroban keys generate --global alice --network testnet
    }
}

Write-Host "Configuring Network 'testnet'..."
if ($cli -eq "stellar") {
    $prevErrPref = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    stellar network use testnet 2>&1 | Out-Null
    $ErrorActionPreference = $prevErrPref
} else {
    $networks = soroban network ls
    if ($networks -notmatch "testnet") {
        soroban network add --global testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015"
    }
}

Write-Host "Funding Identity 'alice'..."
try {
    if ($cli -eq "stellar") {
        stellar keys fund alice
    } else {
        soroban keys fund alice --network testnet
    }
}
catch {
    Write-Host "Funding warning (might be already funded or Friendbot down): $_"
}

Write-Host "Deploying Contract..."
$wasmPath = "smart-contract/target/wasm32-unknown-unknown/release/buy_me_a_coffee.wasm"

if (-not (Test-Path $wasmPath)) {
    Write-Error "WASM file not found at $wasmPath"
    exit 1
}

if ($cli -eq "stellar") {
    $contractId = stellar contract deploy --wasm $wasmPath --source-account alice --network testnet
} else {
    $contractId = soroban contract deploy --wasm $wasmPath --source alice --network testnet
}
$contractId = $contractId.Trim()

if (-not $contractId) {
    Write-Error "Deployment failed to return a Contract ID."
    exit 1
}

Write-Host "Contract Deployed! ID: $contractId"

# Save to frontend .env.local
$envPath = "frontend/.env.local"
"NEXT_PUBLIC_CONTRACT_ID=$contractId" | Out-File -FilePath $envPath -Encoding utf8
"NEXT_PUBLIC_BUY_ME_A_COFFEE_CONTRACT_ID=$contractId" | Out-File -FilePath $envPath -Append -Encoding utf8
"NEXT_PUBLIC_STELLAR_NETWORK=testnet" | Out-File -FilePath $envPath -Append -Encoding utf8

Write-Host "Saved Contract ID to $envPath"

# Initialize contract
Write-Host "Initializing Contract..."
if ($cli -eq "stellar") {
    stellar contract invoke --id $contractId --source-account alice --network testnet -- initialize --admin alice
} else {
    soroban contract invoke --id $contractId --source alice --network testnet -- initialize --admin alice
}

Write-Host "Contract Initialized."

# TypeScript bindings
Write-Host "Generating TypeScript Bindings..."
$bindingsDir = "frontend/contracts"
if (-not (Test-Path $bindingsDir)) {
    New-Item -ItemType Directory -Force -Path $bindingsDir | Out-Null
}
if ($cli -eq "stellar") {
    stellar contract bindings typescript --network testnet --contract-id $contractId --output-dir $bindingsDir --overwrite
} else {
    soroban contract bindings typescript --wasm $wasmPath --output-dir $bindingsDir --overwrite
}
Write-Host "Bindings generated in $bindingsDir"

Write-Host "Building Bindings..."
Push-Location $bindingsDir
cmd /c "npm install"
cmd /c "npm run build"
Pop-Location
Write-Host "Bindings Built."
