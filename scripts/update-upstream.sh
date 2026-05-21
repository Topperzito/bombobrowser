#!/bin/bash
# Merge the latest Firefox ESR security updates into the current branch.
# Runs automatically via GitHub Actions (daily cron) but can also be
# executed locally.
#
# Usage: bash scripts/update-upstream.sh
set -euo pipefail

UPSTREAM_URL="https://github.com/mozilla/gecko-dev.git"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "=== BomboBrowser: Actualizando desde upstream Firefox ==="
echo "Rama actual: $CURRENT_BRANCH"

# ── 1. Ensure the upstream remote exists ────────────────────────────────────
if ! git remote | grep -q "^upstream$"; then
    echo "[1/4] Añadiendo remote 'upstream'..."
    git remote add upstream "$UPSTREAM_URL"
else
    echo "[1/4] Remote 'upstream' ya existe."
fi

# ── 2. Fetch upstream tags only (avoid downloading full history) ─────────────
echo "[2/4] Fetching upstream tags..."
git fetch upstream --tags --no-tags 2>/dev/null \
    || git fetch upstream 'refs/tags/FIREFOX_*_ESR:refs/tags/FIREFOX_*_ESR' --depth=1 \
    || git fetch upstream

# ── 3. Find the latest ESR tag ───────────────────────────────────────────────
echo "[3/4] Buscando última versión ESR..."

LATEST_ESR=$(git tag -l "FIREFOX_*_ESR" --sort=-version:refname | head -1)
LATEST_RELEASE=$(git tag -l "FIREFOX_*_RELEASE" --sort=-version:refname | grep -v "ESR" | head -1 || true)

echo "   Última ESR:     ${LATEST_ESR:-none}"
echo "   Última Release: ${LATEST_RELEASE:-none}"

# Prefer ESR for security-focused builds
TARGET="${LATEST_ESR:-$LATEST_RELEASE}"

if [ -z "$TARGET" ]; then
    echo "ERROR: No se encontraron tags FIREFOX_*_ESR ni FIREFOX_*_RELEASE." >&2
    echo "       Ejecuta 'git fetch upstream --tags' manualmente." >&2
    exit 1
fi

echo "   Target: $TARGET"

# ── 4. Merge ─────────────────────────────────────────────────────────────────
echo "[4/4] Aplicando merge de seguridad ($TARGET)..."
git checkout "$CURRENT_BRANCH"

# Tags are local references after fetch — merge them directly (not upstream/TAG)
if git merge --no-edit "$TARGET"; then
    echo ""
    echo "✅ Merge sin conflictos. Versión base actualizada a: $TARGET"
    echo "   GitHub Actions compilará automáticamente al hacer push."
else
    echo "" >&2
    echo "⚠️  HUBO CONFLICTOS con $TARGET." >&2
    echo "   Para cancelar:  git merge --abort" >&2
    echo "   Para continuar: resuelve los conflictos, luego git add . && git merge --continue" >&2
    exit 1
fi
