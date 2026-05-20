# BomboBrowser 🥁

Navegador web basado en Firefox creado por un Valenciano.

## Instalación

### Linux (cualquier distro)
```bash
curl -sL https://github.com/Topperzito/bombobrowser/releases/latest/download/bombobrowser-linux-x86_64.AppImage -o bombobrowser.AppImage
chmod +x bombobrowser.AppImage
./bombobrowser.AppImage
```

O instala con el script:
```bash
bash <(curl -sL https://github.com/Topperzito/bombobrowser/raw/main/installers/linux-install.sh)
```

### Windows
Descarga el `.exe` de [Releases](https://github.com/Topperzito/bombobrowser/releases) y ejecuta.

### macOS
Descarga el `.dmg` de [Releases](https://github.com/Topperzito/bombobrowser/releases) y arrastra al `Applications`.

## Compilar desde código

```bash
git clone https://github.com/mozilla/gecko-dev.git
cd gecko-dev
git clone https://github.com/Topperzito/bombobrowser.git patches
rsync -av patches/patches/ .
cp patches/.mozconfig .
./mach build
```

## Actualizaciones

El navegador checkea automáticamente GitHub Releases al iniciar.

## Licencia

Mozilla Public License 2.0 — basado en Firefox.
