#!/bin/bash
# BomboBrowser system installer
# Usage: sudo ./install.sh
# Must be run as root (invoked automatically by the packaging script).
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root (use sudo)." >&2
    exit 1
fi

BINDIR=/usr/local/bin
ICONDIR=/usr/local/share/icons/hicolor
APPDIR=/usr/local/share/applications
DOCDIR=/usr/local/share/doc/bombobrowser

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing BomboBrowser..."

# Binary
install -Dm755 "$SCRIPT_DIR/bombobrowser" "$BINDIR/bombobrowser"
echo "  Binary:  $BINDIR/bombobrowser"

# Icons
if [ -d "$SCRIPT_DIR/icons" ]; then
    for icon in "$SCRIPT_DIR/icons"/*.png; do
        [ -f "$icon" ] || continue
        size=$(basename "$icon" .png)
        install -Dm644 "$icon" "$ICONDIR/${size}x${size}/apps/bombobrowser.png"
        echo "  Icon:    $ICONDIR/${size}x${size}/apps/bombobrowser.png"
    done
fi

# Desktop entry
install -Dm644 "$SCRIPT_DIR/bombobrowser.desktop" "$APPDIR/bombobrowser.desktop"
echo "  Desktop: $APPDIR/bombobrowser.desktop"

# Uninstaller
if [ -f "$SCRIPT_DIR/uninstall.sh" ]; then
    install -Dm755 "$SCRIPT_DIR/uninstall.sh" "/usr/local/share/doc/bombobrowser/uninstall.sh"
    echo "  Uninstaller: /usr/local/share/doc/bombobrowser/uninstall.sh"
fi

# Documentation
if [ -d "$SCRIPT_DIR/docs" ]; then
    mkdir -p "$DOCDIR"
    cp -r "$SCRIPT_DIR/docs/"* "$DOCDIR/"
    echo "  Docs:    $DOCDIR"
fi

# Refresh icon cache and desktop database
if command -v gtk-update-icon-cache &>/dev/null; then
    gtk-update-icon-cache -f -t "$ICONDIR" 2>/dev/null || true
fi
if command -v update-desktop-database &>/dev/null; then
    update-desktop-database "$APPDIR" 2>/dev/null || true
fi
if command -v update-mime-database &>/dev/null; then
    update-mime-database /usr/local/share/mime 2>/dev/null || true
fi

echo ""
echo "BomboBrowser installed successfully!"
echo "Run 'bombobrowser' to start."
