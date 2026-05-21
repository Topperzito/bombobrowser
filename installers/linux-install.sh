#!/bin/bash
# BomboBrowser Linux installer
# Downloads and installs the latest BomboBrowser release from GitHub.
#
# Usage:
#   bash <(curl -sL https://github.com/Topperzito/bombobrowser/raw/main/installers/linux-install.sh)
#   bash linux-install.sh [version] [install_dir]
#
# Arguments (both optional):
#   version     Release tag without the leading 'v' (default: latest)
#   install_dir Installation prefix (default: $HOME/.local)

set -euo pipefail

VERSION="${1:-latest}"
REPO="Topperzito/bombobrowser"
PREFIX="${2:-$HOME/.local}"

BINDIR="$PREFIX/bin"
ICONDIR="$PREFIX/share/icons/hicolor"
APPDIR="$PREFIX/share/applications"

echo "=== BomboBrowser Installer ==="
echo ""

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)  PLAT="linux-x86_64"  ;;
    aarch64) PLAT="linux-aarch64" ;;
    *)
        echo "ERROR: Unsupported architecture: $ARCH" >&2
        exit 1
        ;;
esac

# Resolve the tarball URL
if [ "$VERSION" = "latest" ]; then
    API_URL="https://api.github.com/repos/$REPO/releases/latest"
    echo "Querying latest release..."
    RELEASE_JSON=$(curl -fsSL "$API_URL")
    VERSION=$(echo "$RELEASE_JSON" | grep '"tag_name"' | head -1 | sed 's/.*"tag_name": *"v\?\([^"]*\)".*/\1/')
    echo "Latest version: $VERSION"
fi

# Build download URL — the build pipeline produces a date-stamped tarball,
# e.g. bombobrowser-20240601-x86_64.tar.gz
# We search the release assets for any tarball matching the platform.
if [ -z "${RELEASE_JSON:-}" ]; then
    RELEASE_JSON=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/tags/v$VERSION")
fi

TARBALL_URL=$(echo "$RELEASE_JSON" \
    | grep '"browser_download_url"' \
    | grep "$PLAT" \
    | grep '\.tar\.gz' \
    | head -1 \
    | sed 's/.*"browser_download_url": *"\([^"]*\)".*/\1/')

if [ -z "$TARBALL_URL" ]; then
    echo "ERROR: No tarball asset found for platform '$PLAT' in release v$VERSION." >&2
    echo "Check https://github.com/$REPO/releases for available assets." >&2
    exit 1
fi

# Download and extract to a temp directory
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

TARBALL="$TMPDIR/bombobrowser.tar.gz"
echo "Downloading: $TARBALL_URL"
curl -#L "$TARBALL_URL" -o "$TARBALL"

echo "Extracting..."
tar xzf "$TARBALL" -C "$TMPDIR"

PKG_DIR=$(find "$TMPDIR" -maxdepth 1 -type d -name 'bombobrowser-*' | head -1)
if [ -z "$PKG_DIR" ]; then
    echo "ERROR: Could not locate extracted package directory." >&2
    exit 1
fi

# Install binary
mkdir -p "$BINDIR"
install -m755 "$PKG_DIR/bombobrowser" "$BINDIR/bombobrowser"
echo "  Binary:  $BINDIR/bombobrowser"

# Install icons
if [ -d "$PKG_DIR/icons" ]; then
    for icon in "$PKG_DIR/icons"/*.png; do
        size=$(basename "$icon" .png)
        DEST="$ICONDIR/${size}x${size}/apps/bombobrowser.png"
        mkdir -p "$(dirname "$DEST")"
        install -m644 "$icon" "$DEST"
        echo "  Icon:    $DEST"
    done
fi

# Create .desktop file
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
echo "  Desktop: $APPDIR/bombobrowser.desktop"

# Refresh caches
if command -v xdg-desktop-menu &>/dev/null; then
    xdg-desktop-menu forceupdate 2>/dev/null || true
fi
if command -v gtk-update-icon-cache &>/dev/null; then
    gtk-update-icon-cache -f -t "$ICONDIR" 2>/dev/null || true
fi

echo ""
echo "✅ BomboBrowser $VERSION installed!"
echo ""
echo "=== USAGE ==="
echo "  Run from terminal: bombobrowser"
echo "  Or launch from your application menu as 'BomboBrowser'"
echo ""
echo "Updates are managed automatically from within the browser."
