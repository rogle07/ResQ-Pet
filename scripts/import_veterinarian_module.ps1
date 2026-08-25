# PowerShell Script to automatically integrate the Veterinarian Module into a target ResQPet project
param(
    [string]$TargetProjectRoot = "."
)

Set-Location $TargetProjectRoot
Write-Host "🚀 Starting Automated Veterinarian Module Integration..." -ForegroundColor Cyan

# 1. Ensure target directories exist
$targetDirs = @(
    "frontend/src/types",
    "frontend/src/data",
    "frontend/src/components/veterinarian",
    "frontend/src/pages/veterinarian",
    "backend/src/models",
    "backend/src/controllers",
    "backend/src/routes"
)

foreach ($dir in $targetDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created folder: $dir" -ForegroundColor Gray
    }
}

# 2. Copy source files if package folder exists
if (Test-Path "veterinarian-package") {
    Write-Host "Copying files from package..." -ForegroundColor Yellow
    if (Test-Path "veterinarian-package/frontend") {
        Copy-Item -Recurse -Force "veterinarian-package/frontend/src/types/*" "frontend/src/types/"
        Copy-Item -Recurse -Force "veterinarian-package/frontend/src/data/*" "frontend/src/data/"
        Copy-Item -Recurse -Force "veterinarian-package/frontend/src/components/veterinarian/*" "frontend/src/components/veterinarian/"
        Copy-Item -Recurse -Force "veterinarian-package/frontend/src/pages/veterinarian/*" "frontend/src/pages/veterinarian/"
    }
    if (Test-Path "veterinarian-package/backend") {
        Copy-Item -Recurse -Force "veterinarian-package/backend/src/models/*" "backend/src/models/"
        Copy-Item -Recurse -Force "veterinarian-package/backend/src/controllers/*" "backend/src/controllers/"
        Copy-Item -Recurse -Force "veterinarian-package/backend/src/routes/*" "backend/src/routes/"
    }
}

Write-Host "✅ Veterinarian Full-Stack Module files imported successfully!" -ForegroundColor Green
