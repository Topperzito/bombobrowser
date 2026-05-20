# BomboBrowser 🥁

**Navegador web basado en Firefox con privacidad reforzada.**

BomboBrowser es un fork de [Mozilla Firefox](https://www.mozilla.org/firefox/)
–al igual que [LibreWolf](https://librewolf.net/) o [Waterfox](https://www.waterfox.net/)–
que parte del potente motor Gecko de Mozilla y lo ajusta con una configuración
centrada en la privacidad, identidad visual propia y un sistema de
actualizaciones independiente.

---

## Tabla de contenidos

- [Características](#características)
- [Instalación](#instalación)
  - [Linux](#linux)
  - [Windows](#windows)
  - [macOS](#macos)
- [Compilar desde código](#compilar-desde-código)
  - [Requisitos](#requisitos)
  - [Compilación manual](#compilación-manual)
  - [Opciones de compilación](#opciones-de-compilación)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Actualizaciones](#actualizaciones)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## Características

| Característica | Descripción |
|---|---|
| 🔒 **Navegación privada permanente** | Sin historial ni cookies persistentes entre sesiones |
| 🔐 **HTTPS-Only por defecto** | Todas las conexiones se fuerzan a HTTPS |
| 🛡️ **Protección antirrastreo máxima** | Bloqueo de rastreadores, cookies de terceros y fingerprinting |
| 🚫 **Sin telemetría** | No se envían datos de uso a ningún servidor externo |
| 📡 **WebRTC desactivado** | Evita posibles filtraciones de IP real |
| 🌐 **Sin precarga predictiva** | No se adivinan ni precargan enlaces |
| 📦 **Actualizaciones vía GitHub** | Sistema propio de actualización integrado en el navegador |
| 🥁 **Marca personalizada** | Logo, nombre, colores e iconos propios |
| 🧹 **Experiencia limpia** | Sin Pocket, sin asistente de bienvenida, sin campañas |

---

## Instalación

### Linux

**Opción 1 — AppImage** (funciona en cualquier distribución):

```bash
curl -sL https://github.com/Topperzito/bombobrowser/releases/latest/download/bombobrowser-linux-x86_64.AppImage \
  -o bombobrowser.AppImage
chmod +x bombobrowser.AppImage
./bombobrowser.AppImage
```

**Opción 2 — Script de instalación** (instala en `~/.local/bin` y crea entrada de menú):

```bash
bash <(curl -sL https://github.com/Topperzito/bombobrowser/raw/main/installers/linux-install.sh)
```

**Opción 3 — Tarball + instalación manual**:

```bash
curl -sL https://github.com/Topperzito/bombobrowser/releases/latest/download/bombobrowser-YYYYMMDD-x86_64.tar.gz \
  -o bombobrowser.tar.gz
tar xzf bombobrowser.tar.gz
cd bombobrowser-*-x86_64
sudo ./install.sh
```

### Windows

1. Descarga el instalador `.exe` desde [Releases](https://github.com/Topperzito/bombobrowser/releases)
2. Ejecuta el instalador y sigue los pasos

### macOS

1. Descarga el archivo `.dmg` desde [Releases](https://github.com/Topperzito/bombobrowser/releases)
2. Abre el `.dmg` y arrastra BomboBrowser a la carpeta de Aplicaciones
3. Si macOS bloquea la apertura:  
   `xattr -d com.apple.quarantine /Applications/BomboBrowser.app`

---

## Compilar desde código

### Requisitos

- **Sistema**: Linux (Ubuntu 24.04+), macOS 13+, Windows 10+
- **RAM**: 8 GB mínimo (16 GB recomendado)
- **Disco**: 15 GB libres
- **Tiempo**: 1–3 horas

**Dependencias (Ubuntu/Debian)**:

```bash
sudo apt-get update
sudo apt-get install -y \
  clang llvm rustc cargo lld \
  nasm yasm \
  libgtk-3-dev libdbus-glib-1-dev \
  libpulse-dev libasound2-dev \
  libx11-xcb-dev libxt-dev \
  libxext-dev libxrender-dev \
  libxrandr-dev libxdamage-dev \
  libxfixes-dev libxcomposite-dev \
  libxss-dev libxcursor-dev \
  libcairo2-dev libpango1.0-dev \
  libgdk-pixbuf-2.0-dev \
  pkg-config autoconf \
  python3-pip python3-venv \
  nodejs \
  curl
```

**Rust y cbindgen**:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
cargo install cbindgen
```

### Compilación manual

```bash
# 1. Clonar Firefox
git clone --depth=1 https://github.com/mozilla/gecko-dev.git firefox-src
cd firefox-src

# 2. Clonar BomboBrowser
git clone https://github.com/Topperzito/bombobrowser.git patches-repo

# 3. Aplicar parches
rsync -av patches-repo/patches/ .
cp patches-repo/patches/.mozconfig .

# 4. Compilar
python3 ./mach build -j$(nproc)

# 5. (Opcional) Empaquetar
python3 ./mach package
```

El binario compilado estará en:
```
obj-x86_64-pc-linux-gnu/dist/bin/firefox
```

### Opciones de compilación

El archivo `.mozconfig` contiene las opciones de compilación. Algunas opciones
que puedes ajustar:

| Opción | Descripción |
|---|---|
| `--enable-debug` | Incluye símbolos de depuración |
| `--enable-tests` | Incluye los tests unitarios |
| `--enable-release` | Perfil de compilación para distribución |
| `--enable-optimize="-O2"` | Nivel de optimización del compilador |
| `--disable-nodejs` | Usa el Node.js del sistema |
| `--with-wasm-sandboxed-libraries` | Activa librerías WASM (requiere WASI SDK) |

---

## Arquitectura del proyecto

```
bombobrowser/
├── .github/workflows/
│   ├── build.yml              # Compilación automática (GitHub Actions)
│   ├── security-merge.yml     # Fusión diaria de parches de seguridad upstream
│   └── release.yml            # Publicación de releases en GitHub
├── patches/
│   ├── .mozconfig             # Opciones de compilación
│   ├── browser/
│   │   ├── app/profile/firefox.js   # Preferencias del navegador
│   │   └── base/content/            # Interfaz de usuario
│   │       ├── bomboUpdate.js       # Sistema de actualizaciones
│   │       ├── browser-main.js
│   │       ├── browser-menubar.inc
│   │       ├── browser-sets.inc
│   │       ├── browser-sets.js
│   │       ├── navigator-toolbox.inc.xhtml
│   │       ├── popup-notifications.inc.xhtml
│   │       └── aboutDialog.xhtml
│   └── browser/branding/bombo/
│       ├── configure.sh       # MOZ_APP_DISPLAYNAME
│       ├── content/           # Logos, iconos, CSS
│       ├── locales/           # Traducciones
│       └── pref/              # Preferencias de marca
├── install.sh                 # Instalador para tarball
├── installers/
│   └── linux-install.sh       # Script de instalación Linux
├── scripts/
│   └── update-upstream.sh     # Script para fusionar cambios upstream
└── README.md
```

### Flujo de CI/CD

```
[1] git push
    │
    ▼
[2] GitHub Actions: build.yml
    │
    ├─ Instala dependencias
    ├─ Clona gecko-dev (Firefox)
    ├─ Aplica parches de BomboBrowser
    ├─ Compila con ./mach build
    │
    ▼
[3] ¿Compilación exitosa?
    │
    ├─ Sí → Empaqueta .tar.gz → sube artifact
    │
    └─ No  → Error visible en Actions
```

---

## Actualizaciones

BomboBrowser incluye un sistema de actualizaciones propio integrado en el
navegador.

- Al iniciar, consulta la API de **GitHub Releases**
- Si hay una versión más reciente, aparece una barra de notificación
- Haz clic para descargar y reiniciar cuando termine

Además, el workflow `security-merge.yml` se ejecuta **diariamente** para
fusionar los parches de seguridad de la última versión ESR de Firefox. Si hay
conflictos, se crea un issue automáticamente.

---

## Contribuir

¿Quieres colaborar? 

- **Reportar bugs**: abre un [issue](https://github.com/Topperzito/bombobrowser/issues)
- **Sugerencias**: usa la etiqueta "enhancement"
- **Pull Requests**: haz fork, crea una rama, modifica `patches/` y abre PR

---

## Licencia

Este proyecto es una adaptación de **[Mozilla Firefox](https://www.mozilla.org/firefox/)**
distribuida bajo la **Mozilla Public License 2.0**.

El código fuente original de Firefox se encuentra en
[mozilla/gecko-dev](https://github.com/mozilla/gecko-dev)
y también está bajo MPL 2.0.

Puedes usar, modificar y distribuir este software de acuerdo con los términos
de la MPL 2.0. Para más información:
https://www.mozilla.org/MPL/2.0/

---

Hecho con ❤️ y 🥁 por un Valenciano.
