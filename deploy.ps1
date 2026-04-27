# deploy.ps1 — Build the React SPA and publish to /assets + index.html
#
# Usage (from project root):
#   .\deploy.ps1
#   .\deploy.ps1 -Base "/"          # for root-of-domain deploy

param(
    [string]$Base = "/edf-explorer/"
)

$root = $PSScriptRoot

Write-Host "Building..." -ForegroundColor Cyan
Push-Location "$root\app"
$env:PUBLIC_BASE = $Base
& ".\node_modules\.bin\vite.exe" build --config vite.config.prod.ts
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "Build failed"; exit 1 }
Pop-Location

# Sync built assets -> /assets  (emptyOutDir already cleaned dist/)
Write-Host "Syncing assets..." -ForegroundColor Cyan
Remove-Item "$root\assets\*" -Force -ErrorAction SilentlyContinue
Copy-Item "$root\app\dist\assets\*" "$root\assets\" -Force

# Patch index.html with new asset hashes
Write-Host "Patching index.html..." -ForegroundColor Cyan
$jsFile  = (Get-ChildItem "$root\assets\index-*.js"  | Sort-Object LastWriteTime -Desc | Select-Object -First 1).Name
$cssFile = (Get-ChildItem "$root\assets\index-*.css" | Sort-Object LastWriteTime -Desc | Select-Object -First 1).Name

$html = [System.IO.File]::ReadAllText("$root\index.html", [System.Text.Encoding]::UTF8)
$html = $html -replace 'assets/index-[^"]+\.js',  "assets/$jsFile"
$html = $html -replace 'assets/index-[^"]+\.css', "assets/$cssFile"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$root\index.html", $html, $utf8NoBom)

Write-Host "Done.  JS=$jsFile  CSS=$cssFile" -ForegroundColor Green

# Package for cPanel
Write-Host "Packaging web/edf-explorer.zip..." -ForegroundColor Cyan
$webDir = "$root\web"
$zipPath = "$webDir\edf-explorer.zip"
New-Item -ItemType Directory -Force $webDir | Out-Null
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
function Add-ToZip($z, $file, $entry) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($z, $file, $entry, 'Optimal') | Out-Null
}
foreach ($f in @("index.html","favicon.svg","feedback.js",".htaccess","robots.txt")) {
    $p = Join-Path $root $f
    if (Test-Path $p) { Add-ToZip $zip $p $f }
}
foreach ($f in Get-ChildItem "$root\assets" -File) { Add-ToZip $zip $f.FullName "assets/$($f.Name)" }
foreach ($f in Get-ChildItem "$root\data"   -File) { Add-ToZip $zip $f.FullName "data/$($f.Name)"   }
$zip.Dispose()

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "Ready: web\edf-explorer.zip ($sizeMB MB)" -ForegroundColor Green
