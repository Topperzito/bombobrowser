#!/bin/bash
# Instalador de BomboBrowser para Arch Linux y derivados (Manjaro, EndeavourOS, etc.)
# También funciona en cualquier distribución Linux.
#
# Uso:
#   bash <(curl -sL https://github.com/Topperzito/bombobrowser/raw/main/installers/arch-install.sh)
#
# Con yay/paru (Arch AUR) — método recomendado para Arch:
#   yay -S bombobrowser-bin
#   paru -S bombobrowser-bin

set -euo pipefail

REPO="Topperzito/bombobrowser"
PREFIX="${HOME}/.local"   # Instala sin root; cambia a /usr para instalación global

BINDIR="$PREFIX/bin"
ICONDIR="$PREFIX/share/icons/hicolor"
APPDIR="$PREFIX/share/applications"

echo "=== BomboBrowser — Instalador para Arch/Linux ==="
echo ""

# Detectar si es Arch y si tiene yay/paru
_is_arch() {
    command -v pacman &>/dev/null
}

_has_aur() {
    command -v yay &>/dev/null || command -v paru &>/dev/null
}

if _is_arch && _has_aur; then
    echo "Arch Linux detectado con helper AUR."
    echo ""
    echo "Se recomienda instalar desde el AUR para gestión automática de actualizaciones:"
    echo ""
    if command -v yay &>/dev/null; then
        echo "  yay -S bombobrowser-bin"
        echo ""
        read -rp "¿Instalar con yay ahora? [S/n] " _resp
        [[ "${_resp,,}" != "n" ]] && exec yay -S bombobrowser-bin
    elif command -v paru &>/dev/null; then
        echo "  paru -S bombobrowser-bin"
        echo ""
        read -rp "¿Instalar con paru ahora? [S/n] " _resp
        [[ "${_resp,,}" != "n" ]] && exec paru -S bombobrowser-bin
    fi
    echo ""
    echo "Continuando con instalación manual desde GitHub Releases..."
fi

# Detectar arquitectura
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)  PLAT="linux-x86_64"  ;;
    aarch64) PLAT="linux-aarch64" ;;
    *) echo "ERROR: Arquitectura no soportada: $ARCH" >&2; exit 1 ;;
esac

# Obtener la última versión
echo "Consultando última versión en GitHub..."
RELEASE_JSON=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest")
VERSION=$(echo "$RELEASE_JSON" | grep '"tag_name"' | head -1 \
    | sed 's/.*"tag_name": *"v\?\([^"]*\)".*/\1/')
echo "Versión: $VERSION"

# Encontrar la URL del tarball
TARBALL_URL=$(echo "$RELEASE_JSON" \
    | grep '"browser_download_url"' \
    | grep "$PLAT" \
    | grep '\.tar\.gz' \
    | head -1 \
    | sed 's/.*"browser_download_url": *"\([^"]*\)".*/\1/')

if [ -z "$TARBALL_URL" ]; then
    echo "ERROR: No se encontró tarball para $PLAT en la release $VERSION" >&2
    echo "Mira los assets en: https://github.com/$REPO/releases" >&2
    exit 1
fi

# Descargar y extraer
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "Descargando: $TARBALL_URL"
curl -#L "$TARBALL_URL" -o "$TMPDIR/bombobrowser.tar.gz"
tar xzf "$TMPDIR/bombobrowser.tar.gz" -C "$TMPDIR"

PKG_DIR=$(find "$TMPDIR" -maxdepth 1 -type d -name 'bombobrowser-*' | head -1)
[ -z "$PKG_DIR" ] && { echo "ERROR: No se encontró el directorio extraído." >&2; exit 1; }

# Instalar
mkdir -p "$BINDIR"
install -m755 "$PKG_DIR/bombobrowser" "$BINDIR/bombobrowser"
echo "  ✅ Binario:  $BINDIR/bombobrowser"

if [ -d "$PKG_DIR/icons" ]; then
    for icon in "$PKG_DIR/icons"/*.png; do
        sz=$(basename "$icon" .png)
        DEST="$ICONDIR/${sz}x${sz}/apps/bombobrowser.png"
        mkdir -p "$(dirname "$DEST")"
        install -m644 "$icon" "$DEST"
    done
    echo "  ✅ Iconos instalados"
fi

mkdir -p "$APPDIR"
cat > "$APPDIR/bombobrowser.desktop" << DESKTOP
[Desktop Entry]
Name=BomboBrowser
Comment=Navegador privado basado en Firefox
Exec=$BINDIR/bombobrowser %u
Icon=bombobrowser
Terminal=false
Type=Application
Categories=Network;WebBrowser;
StartupWMClass=BomboBrowser
MimeType=text/html;text/xml;application/xhtml+xml;x-scheme-handler/http;x-scheme-handler/https;
DESKTOP
echo "  ✅ Menú de aplicaciones configurado"

# Añadir ~/.local/bin al PATH si no está
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo ""
    echo "⚠️  $BINDIR no está en tu PATH."
    echo "   Añade esto a tu ~/.bashrc o ~/.zshrc:"
    echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
fi

# Refrescar caches
command -v xdg-desktop-menu &>/dev/null && xdg-desktop-menu forceupdate 2>/dev/null || true
command -v gtk-update-icon-cache &>/dev/null && gtk-update-icon-cache -f -t "$ICONDIR" 2>/dev/null || true

echo ""
echo "✅ BomboBrowser $VERSION instalado correctamente."
echo ""
echo "Ejecuta: bombobrowser"
echo "O búscalo en el menú de aplicaciones."
