/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var gBomboUpdate = {
  OWNER: "Topperzito",
  REPO: "bombobrowser",
  CURRENT_VERSION: "1.0.0",

  _notified: false,

  init() {
    Services.tm.idleDispatch(() => this._check(), 10000);
  },

  async _check() {
    let url = `https://api.github.com/repos/${this.OWNER}/${this.REPO}/releases/latest`;
    try {
      let resp = await fetch(url);
      if (!resp.ok) return;
      let data = await resp.json();
      let latest = data.tag_name.replace(/^v/, "");

      if (!this._isNewer(latest, this.CURRENT_VERSION)) return;
      if (this._notified) return;
      this._notified = true;

      let asset = this._findAsset(data.assets);
      if (!asset) return;

      this._showBar(latest, asset.browser_download_url, asset.name);
    } catch (e) {}
  },

  _isNewer(latest, current) {
    let l = latest.split(".").map(Number);
    let c = current.split(".").map(Number);
    for (let i = 0; i < Math.max(l.length, c.length); i++) {
      if ((l[i] || 0) > (c[i] || 0)) return true;
      if ((l[i] || 0) < (c[i] || 0)) return false;
    }
    return false;
  },

  _findAsset(assets) {
    let plat = "";
    if (Services.appinfo.OS === "WINNT") plat = "win64";
    else if (Services.appinfo.OS === "Darwin") plat = "macos";
    else plat = "linux";

    for (let a of assets) {
      if (a.name.includes(plat) && a.name.endsWith(".tar.bz2")) return a;
    }
    for (let a of assets) {
      if (a.name.includes(plat)) return a;
    }
    return assets[0];
  },

  _showBar(version, url, filename) {
    let doc = window.browsingContext.topChromeWindow.document;
    if (doc.getElementById("bombo-update-notification")) return;

    let box = doc.createElement("box");
    box.id = "bombo-update-notification";
    box.setAttribute("align", "center");
    box.style.background = "#1a1a2e";
    box.style.color = "#e0e0e0";
    box.style.padding = "8px 16px";
    box.style.fontSize = "13px";
    box.style.cursor = "pointer";
    box.style.borderBottom = "1px solid #2ea043";

    let inner = doc.createElement("hbox");
    inner.setAttribute("align", "center");
    inner.setAttribute("flex", "1");
    inner.style.justifyContent = "space-between";

    let label = doc.createElement("label");
    label.textContent = `BomboBrowser ${version} disponible —`;
    label.style.marginRight = "4px";

    let link = doc.createElement("label");
    link.setAttribute("crop", "end");
    link.textContent = "Descargar actualización";
    link.style.color = "#2ea043";
    link.style.textDecoration = "underline";
    link.style.cursor = "pointer";
    link.addEventListener("click", (e) => {
      e.stopPropagation();
      this._downloadUpdate(url, filename, version);
    });

    let close = doc.createElement("label");
    close.textContent = "✕";
    close.style.cursor = "pointer";
    close.style.marginLeft = "12px";
    close.style.color = "#888";
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      box.remove();
    });

    inner.appendChild(label);
    inner.appendChild(link);
    inner.appendChild(close);
    box.appendChild(inner);

    box.addEventListener("click", () => this._downloadUpdate(url, filename, version));

    let nav = doc.getElementById("navigator-toolbox");
    if (nav) nav.parentNode.insertBefore(box, nav);
  },

  _downloadUpdate(url, filename, version) {
    let doc = window.browsingContext.topChromeWindow.document;
    let bar = doc.getElementById("bombo-update-notification");
    if (bar) bar.remove();

    let box = doc.createElement("box");
    box.id = "bombo-update-progress";
    box.setAttribute("align", "center");
    box.style.background = "#1a1a2e";
    box.style.color = "#e0e0e0";
    box.style.padding = "8px 16px";
    box.style.fontSize = "13px";

    let label = doc.createElement("label");
    label.textContent = "Descargando actualización...";
    box.appendChild(label);

    let nav = doc.getElementById("navigator-toolbox");
    if (nav) nav.parentNode.insertBefore(box, nav);

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    xhr.onprogress = (e) => {
      if (e.lengthComputable) {
        let pct = Math.round((e.loaded / e.total) * 100);
        label.textContent = `Descargando actualización... ${pct}%`;
      }
    };

    xhr.onload = () => {
      let data = new Uint8Array(xhr.response);
      let file = this._getDownloadFile("bombobrowser-" + version + ".tar.bz2");
      if (!file) return;

      try {
        let fos = Cc["@mozilla.org/network/file-output-stream;1"]
          .createInstance(Ci.nsIFileOutputStream);
        fos.init(file, 0x02 | 0x08 | 0x20, 0o644, 0);
        fos.write(data, data.length);
        fos.close();

        label.textContent = "Descarga completa. Reinicia el navegador para aplicar.";
        box.style.background = "#2ea043";

        let restart = doc.createElement("label");
        restart.textContent = "Reiniciar ahora";
        restart.style.color = "white";
        restart.style.textDecoration = "underline";
        restart.style.cursor = "pointer";
        restart.style.marginLeft = "12px";
        restart.addEventListener("click", () => {
          Services.startup.quit(
            Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart
          );
        });
        box.appendChild(restart);
      } catch (e) {
        label.textContent = "Error al guardar la actualización.";
        box.style.background = "#da3633";
      }
    };

    xhr.onerror = () => {
      label.textContent = "Error de descarga. Inténtalo más tarde.";
      box.style.background = "#da3633";
    };

    xhr.send();
  },

  _getDownloadFile(name) {
    let file = Cc["@mozilla.org/file/directory_service;1"]
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
