/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/**
 * BomboBrowser self-update system.
 *
 * Queries the GitHub Releases API once per session (after an idle delay) and
 * shows a non-intrusive notification bar when a newer version is available.
 *
 * NOTE: This file is loaded via browser-main.js using
 *   Services.scriptloader.loadSubScript(
 *     "chrome://browser/content/bomboUpdate.js", this);
 * The inline copy inside browser-main.js must be kept in sync with this file.
 */

var gBomboUpdate = {
  OWNER: "Topperzito",
  REPO: "bombobrowser",
  CURRENT_VERSION: "1.0.0",

  _notified: false,

  init() {
    Services.tm.idleDispatch(() => this._check(), 10000);
  },

  async _check() {
    const url = `https://api.github.com/repos/${this.OWNER}/${this.REPO}/releases/latest`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return;

      const data = await resp.json();
      const latest = data.tag_name.replace(/^v/, "");

      if (!this._isNewer(latest, this.CURRENT_VERSION)) return;
      if (this._notified) return;
      this._notified = true;

      const asset = this._findAsset(data.assets);
      if (!asset) return;

      this._showBar(latest, asset.browser_download_url, asset.name);
    } catch (_e) {
      // Network or parse error — fail silently
    }
  },

  /**
   * Returns true when `latest` is semantically greater than `current`.
   * Both arguments are dot-separated version strings, e.g. "1.2.3".
   */
  _isNewer(latest, current) {
    const l = latest.split(".").map(Number);
    const c = current.split(".").map(Number);
    const len = Math.max(l.length, c.length);
    for (let i = 0; i < len; i++) {
      const lv = l[i] || 0;
      const cv = c[i] || 0;
      if (lv > cv) return true;
      if (lv < cv) return false;
    }
    return false;
  },

  /** Pick the release asset that matches the running OS. */
  _findAsset(assets) {
    let plat;
    switch (Services.appinfo.OS) {
      case "WINNT":  plat = "win64";  break;
      case "Darwin": plat = "macos";  break;
      default:       plat = "linux";  break;
    }

    // Prefer .tar.bz2 for the matching platform
    for (const a of assets) {
      if (a.name.includes(plat) && a.name.endsWith(".tar.bz2")) return a;
    }
    // Fall back to any asset for this platform
    for (const a of assets) {
      if (a.name.includes(plat)) return a;
    }
    // Last resort: first asset in the list
    return assets[0] ?? null;
  },

  // ---------------------------------------------------------------------------
  // UI helpers
  // ---------------------------------------------------------------------------

  _showBar(version, url, filename) {
    const doc = window.browsingContext.topChromeWindow.document;
    if (doc.getElementById("bombo-update-notification")) return;

    const box = doc.createElement("box");
    box.id = "bombo-update-notification";
    box.setAttribute("align", "center");
    Object.assign(box.style, {
      background:   "#1a1a2e",
      color:        "#e0e0e0",
      padding:      "8px 16px",
      fontSize:     "13px",
      cursor:       "pointer",
      borderBottom: "1px solid #2ea043",
    });

    const inner = doc.createElement("hbox");
    inner.setAttribute("align", "center");
    inner.setAttribute("flex", "1");
    inner.style.justifyContent = "space-between";

    const label = doc.createElement("label");
    label.textContent = `BomboBrowser ${version} disponible —`;
    label.style.marginRight = "4px";

    const link = doc.createElement("label");
    link.setAttribute("crop", "end");
    link.textContent = "Descargar actualización";
    Object.assign(link.style, {
      color:          "#2ea043",
      textDecoration: "underline",
      cursor:         "pointer",
    });
    link.addEventListener("click", e => {
      e.stopPropagation();
      this._downloadUpdate(url, filename, version);
    });

    const close = doc.createElement("label");
    close.textContent = "✕";
    Object.assign(close.style, {
      cursor:     "pointer",
      marginLeft: "12px",
      color:      "#888",
    });
    close.addEventListener("click", e => {
      e.stopPropagation();
      box.remove();
    });

    inner.append(label, link, close);
    box.appendChild(inner);
    box.addEventListener("click", () =>
      this._downloadUpdate(url, filename, version)
    );

    const nav = doc.getElementById("navigator-toolbox");
    if (nav) nav.parentNode.insertBefore(box, nav);
  },

  _downloadUpdate(url, filename, version) {
    const doc = window.browsingContext.topChromeWindow.document;

    // Remove any existing update UI
    for (const id of ["bombo-update-notification", "bombo-update-progress"]) {
      doc.getElementById(id)?.remove();
    }

    const box = doc.createElement("box");
    box.id = "bombo-update-progress";
    box.setAttribute("align", "center");
    Object.assign(box.style, {
      background: "#1a1a2e",
      color:      "#e0e0e0",
      padding:    "8px 16px",
      fontSize:   "13px",
    });

    const statusLabel = doc.createElement("label");
    statusLabel.textContent = "Descargando actualización...";
    box.appendChild(statusLabel);

    const nav = doc.getElementById("navigator-toolbox");
    if (nav) nav.parentNode.insertBefore(box, nav);

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    xhr.onprogress = e => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        statusLabel.textContent = `Descargando actualización... ${pct}%`;
      }
    };

    xhr.onload = () => {
      if (!xhr.response) {
        statusLabel.textContent = "Error: respuesta vacía.";
        box.style.background = "#da3633";
        return;
      }

      // Build destination path: ~/Downloads/bombobrowser-<version>.tar.bz2
      const file = Cc["@mozilla.org/file/directory_service;1"]
        .getService(Ci.nsIProperties)
        .get("Home", Ci.nsIFile);
      file.append("Downloads");
      if (!file.exists() || !file.isDirectory()) {
        file.create(Ci.nsIFile.DIRECTORY_TYPE, 0o755);
      }
      file.append(`bombobrowser-${version}.tar.bz2`);

      try {
        // nsIFileOutputStream.write() expects a string — convert via BinaryInputStream
        const fos = Cc["@mozilla.org/network/file-output-stream;1"]
          .createInstance(Ci.nsIFileOutputStream);
        // 0x02 = PR_WRONLY, 0x08 = PR_CREATE_FILE, 0x20 = PR_TRUNCATE
        fos.init(file, 0x02 | 0x08 | 0x20, 0o644, 0);

        const bos = Cc["@mozilla.org/binaryoutputstream;1"]
          .createInstance(Ci.nsIBinaryOutputStream);
        bos.setOutputStream(fos);
        bos.writeByteArray(new Uint8Array(xhr.response));
        bos.close();
        fos.close();

        statusLabel.textContent = "Descarga completa. Reinicia para aplicar.";
        box.style.background = "#2ea043";

        const restart = doc.createElement("label");
        restart.textContent = "Reiniciar ahora";
        Object.assign(restart.style, {
          color:          "white",
          textDecoration: "underline",
          cursor:         "pointer",
          marginLeft:     "12px",
        });
        restart.addEventListener("click", () =>
          Services.startup.quit(
            Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart
          )
        );
        box.appendChild(restart);
      } catch (_e) {
        statusLabel.textContent = "Error al guardar la actualización.";
        box.style.background = "#da3633";
      }
    };

    xhr.onerror = () => {
      statusLabel.textContent = "Error de descarga. Inténtalo más tarde.";
      box.style.background = "#da3633";
    };

    xhr.send();
  },

  _getDownloadFile(name) {
    const file = Cc["@mozilla.org/file/directory_service;1"]
      .getService(Ci.nsIProperties)
      .get("Home", Ci.nsIFile);
    file.append("Downloads");
    if (!file.exists() || !file.isDirectory()) {
      file.create(Ci.nsIFile.DIRECTORY_TYPE, 0o755);
    }
    file.append(name);
    return file;
  },
};

window.addEventListener("load", () => gBomboUpdate.init(), { once: true });
