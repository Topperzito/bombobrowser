#!/bin/bash
# Instalador para Linux (AppImage)
# Ejecutar: bash bombobrowser-installer.sh

set -e

VERSION="${1:-latest}"
REPO="daniel-ingresa/bombobrowser"
INSTALL_DIR="${2:-$HOME/.local/bin}"

echo "=== BomboBrowser Installer ==="
echo ""

# Detectar arquitectura
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)  PLAT="linux-x86_64" ;;
    aarch64) PLAT="linux-aarch64" ;;
    *)       echo "Arquitectura no soportada: $ARCH"; exit 1 ;;
esac

# Crear directorio
mkdir -p "$INSTALL_DIR"

# Descargar
if [ "$VERSION" = "latest" ]; then
    URL="https://github.com/$REPO/releases/latest/download/bombobrowser-$PLAT.AppImage"
else
    URL="https://github.com/$REPO/releases/download/v$VERSION/bombobrowser-$PLAT.AppImage"
fi

echo "Descargando BomboBrowser para $PLAT..."
echo "  $URL"

curl -#L "$URL" -o "$INSTALL_DIR/bombobrowser.AppImage"
chmod +x "$INSTALL_DIR/bombobrowser.AppImage"

echo ""
echo "✅ Instalado en: $INSTALL_DIR/bombobrowser.AppImage"
echo ""

# Opcional: crear entrada de menú
if command -v xdg-desktop-menu &>/dev/null; then
    echo "Creando entrada en el menú..."

    mkdir -p "$HOME/.local/share/applications"
    mkdir -p "$HOME/.local/share/icons/hicolor/128x128/apps"

    cat > "$HOME/.local/share/applications/bombobrowser.desktop" << DESKTOP
[Desktop Entry]
Name=BomboBrowser
Comment=Navegador privado basado en Firefox
Exec=$INSTALL_DIR/bombobrowser.AppImage
Icon=bombobrowser
Terminal=false
Type=Application
Categories=Network;WebBrowser;
StartupWMClass=BomboBrowser
DESKTOP

    # Descargar icono
    curl -sL "https://github.com/$REPO/raw/main/patches/branding/default128.png" \
        -o "$HOME/.local/share/icons/hicolor/128x128/apps/bombobrowser.png"

    xdg-desktop-menu forceupdate 2>/dev/null || true
    echo "✅ Entrada de menú creada"
fi

echo ""
echo "=== USO ==="
echo "  Ejecutar: $INSTALL_DIR/bombobrowser.AppImage"
echo "  o desde el menú de aplicaciones como 'BomboBrowser'"
echo ""
echo "Las actualizaciones se gestionan automáticamente desde el navegador."
