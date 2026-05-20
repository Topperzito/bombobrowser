#!/bin/bash
# Script para fusionar seguridad upstream de Firefox
# Uso: bash scripts/update-upstream.sh
# Este script se ejecuta automáticamente via GitHub Actions (cron diario)

set -e

UPSTREAM="https://github.com/mozilla/gecko-dev.git"
BRANCH="upstream-security"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "=== BomboBrowser: Actualizando desde upstream Firefox ==="

# Añadir upstream si no existe
if ! git remote | grep -q upstream; then
    echo "[1/4] Añadiendo remote upstream..."
    git remote add upstream "$UPSTREAM"
fi

echo "[2/4] Fetching upstream..."
git fetch upstream --depth=1 --tags 2>/dev/null || git fetch upstream

echo "[3/4] Buscando última versión estable..."
# Obtener la versión más reciente de Firefox (ESR o Release)
LATEST_TAG=$(git tag -l "FIREFOX_*_RELEASE" --sort=-version:refname | head -5 | grep -v "ESR" | head -1)
LATEST_ESR=$(git tag -l "FIREFOX_*_ESR" --sort=-version:refname | head -1)

echo "   Última Release: $LATEST_TAG"
echo "   Última ESR: $LATEST_ESR"

echo "[4/4] Aplicando merge de seguridad..."
git checkout "$CURRENT_BRANCH"
if git merge --no-edit "upstream/$LATEST_TAG" 2>/dev/null; then
    echo "✅ Merge sin conflictos"
    echo "Versión base actualizada a: $LATEST_TAG"
    echo "AHORA: GitHub Actions compilará automáticamente"
else
    echo "⚠️  HUBO CONFLICTOS. Resuélvelos manualmente:"
    echo "   git merge --abort   # para cancelar"
    echo "   # o resolver conflictos y continuar"
    exit 1
fi
