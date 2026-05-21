# BomboBrowser Windows Installer
# Descarga e instala la última versión de BomboBrowser en Windows.
#
# Uso (PowerShell como administrador):
#   irm https://github.com/Topperzito/bombobrowser/raw/main/installers/windows-install.ps1 | iex
#
# O descarga el .exe desde:
#   https://github.com/Topperzito/bombobrowser/releases/latest

[CmdletBinding()]
param(
    [string]$Version = "latest",
    [string]$InstallDir = "$env:ProgramFiles\BomboBrowser"
)

$ErrorActionPreference = "Stop"
$Repo = "Topperzito/bombobrowser"

Write-Host "=== BomboBrowser Windows Installer ===" -ForegroundColor Cyan
Write-Host ""

# Obtener la última versión
if ($Version -eq "latest") {
    Write-Host "Consultando última versión..." -NoNewline
    $release = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest"
    $Version = $release.tag_name -replace '^v', ''
    Write-Host " $Version" -ForegroundColor Green
}

# Buscar el asset .exe o .zip para Windows
$asset = $release.assets | Where-Object {
    $_.name -match 'win' -and ($_.name -match '\.exe$' -or $_.name -match '\.zip$')
} | Select-Object -First 1

if (-not $asset) {
    Write-Error "No se encontró instalador de Windows en la release $Version."
    Write-Host "Descarga manualmente desde: https://github.com/$Repo/releases" -ForegroundColor Yellow
    exit 1
}

$TmpDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
New-Item -ItemType Directory -Path $TmpDir | Out-Null

try {
    $outFile = Join-Path $TmpDir $asset.name
    Write-Host "Descargando: $($asset.browser_download_url)"
    Invoke-WebRequest $asset.browser_download_url -OutFile $outFile

    if ($asset.name -match '\.exe$') {
        # NSIS installer — ejecutar directamente
        Write-Host "Ejecutando instalador..."
        Start-Process -FilePath $outFile -ArgumentList "/S", "/D=$InstallDir" -Wait
    } elseif ($asset.name -match '\.zip$') {
        # ZIP — extraer manualmente
        Write-Host "Extrayendo en $InstallDir..."
        New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
        Expand-Archive -Path $outFile -DestinationPath $InstallDir -Force

        # Crear acceso directo en escritorio
        $WshShell = New-Object -comObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\BomboBrowser.lnk")
        $Shortcut.TargetPath = "$InstallDir\bombobrowser.exe"
        $Shortcut.IconLocation = "$InstallDir\bombobrowser.exe"
        $Shortcut.Save()
        Write-Host "  Acceso directo creado en el escritorio." -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "BomboBrowser $Version instalado correctamente." -ForegroundColor Green
    Write-Host "Busca 'BomboBrowser' en el menú de inicio o en el escritorio."

} finally {
    Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue
}
