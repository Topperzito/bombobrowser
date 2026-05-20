/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-env mozilla/browser-window */

// prettier-ignore
// eslint-disable-next-line no-lone-blocks
{
  Services.scriptloader.loadSubScript("chrome://browser/content/browser-init.js", this);
  Services.scriptloader.loadSubScript("chrome://global/content/contentAreaUtils.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/browser-captivePortal.js", this);
  if (AppConstants.MOZ_DATA_REPORTING) {
    // Data submission info bar disabled for BomboBrowser
  }
  if (!AppConstants.MOZILLA_OFFICIAL) {
    // Development helpers disabled for BomboBrowser
  }
  Services.scriptloader.loadSubScript("chrome://browser/content/browser-pageActions.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/sidebar/browser-sidebar.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/browser-customtitlebar.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/browser-unified-extensions.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/tabbrowser/tab.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/tabbrowser/tabbrowser.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/tabbrowser/tabgroup.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/tabbrowser/tabgroup-menu.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/tabbrowser/tabs.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/places/places-menupopup.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/search/autocomplete-popup.js", this);
  Services.scriptloader.loadSubScript("chrome://browser/content/search/searchbar.js", this);
}

// BomboBrowser self-update system (inlined to avoid jar.mn modifications)
{
  const gBomboUpdate = {
    OWNER: "Topperzito",
    REPO: "bombobrowser",
    CURRENT_VERSION: "1.0.0",
    _notified: false,
    init() {
      Services.tm.idleDispatch(() => this._check(), 10000);
    },
    async _check() {
      try {
        let resp = await fetch(`https://api.github.com/repos/${this.OWNER}/${this.REPO}/releases/latest`);
        if (!resp.ok) return;
        let data = await resp.json();
        let latest = data.tag_name.replace(/^v/, "");
        if (!this._isNewer(latest, this.CURRENT_VERSION) || this._notified) return;
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
      for (let a of assets) { if (a.name.includes(plat) && a.name.endsWith(".tar.bz2")) return a; }
      for (let a of assets) { if (a.name.includes(plat)) return a; }
      return assets[0];
    },
    _showBar(version, url, filename) {
      let doc = window.browsingContext.topChromeWindow.document;
      if (doc.getElementById("bombo-update-notification")) return;
      let box = doc.createElement("box");
      box.id = "bombo-update-notification";
      box.setAttribute("align", "center");
      Object.assign(box.style, { background: "#1a1a2e", color: "#e0e0e0", padding: "8px 16px", fontSize: "13px", cursor: "pointer", borderBottom: "1px solid #2ea043" });
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
      Object.assign(link.style, { color: "#2ea043", textDecoration: "underline", cursor: "pointer" });
      link.addEventListener("click", e => { e.stopPropagation(); this._downloadUpdate(url, filename, version); });
      let close = doc.createElement("label");
      close.textContent = "✕";
      Object.assign(close.style, { cursor: "pointer", marginLeft: "12px", color: "#888" });
      close.addEventListener("click", e => { e.stopPropagation(); box.remove(); });
      inner.append(label, link, close);
      box.appendChild(inner);
      box.addEventListener("click", () => this._downloadUpdate(url, filename, version));
      let nav = doc.getElementById("navigator-toolbox");
      if (nav) nav.parentNode.insertBefore(box, nav);
    },
    _downloadUpdate(url, filename, version) {
      let doc = window.browsingContext.topChromeWindow.document;
      let existing = doc.getElementById("bombo-update-notification") || doc.getElementById("bombo-update-progress");
      if (existing) existing.remove();
      let box = doc.createElement("box");
      box.id = "bombo-update-progress";
      box.setAttribute("align", "center");
      Object.assign(box.style, { background: "#1a1a2e", color: "#e0e0e0", padding: "8px 16px", fontSize: "13px" });
      let statusLabel = doc.createElement("label");
      statusLabel.textContent = "Descargando actualización...";
      box.appendChild(statusLabel);
      let nav = doc.getElementById("navigator-toolbox");
      if (nav) nav.parentNode.insertBefore(box, nav);
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";
      xhr.onprogress = e => { if (e.lengthComputable) statusLabel.textContent = `Descargando actualización... ${Math.round(e.loaded / e.total * 100)}%`; };
      xhr.onload = () => {
        let file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("Home", Ci.nsIFile);
        file.append("Downloads");
        if (!file.exists() || !file.isDirectory()) file.create(Ci.nsIFile.DIRECTORY_TYPE, 0o755);
        file.append("bombobrowser-" + version + ".tar.bz2");
        try {
          let fos = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
          fos.init(file, 0x02 | 0x08 | 0x20, 0o644, 0);
          fos.write(new Uint8Array(xhr.response), xhr.response.byteLength);
          fos.close();
          statusLabel.textContent = "Descarga completa. Reinicia para aplicar.";
          box.style.background = "#2ea043";
          let restart = doc.createElement("label");
          restart.textContent = "Reiniciar ahora";
          Object.assign(restart.style, { color: "white", textDecoration: "underline", cursor: "pointer", marginLeft: "12px" });
          restart.addEventListener("click", () => Services.startup.quit(Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart));
          box.appendChild(restart);
        } catch (e) { statusLabel.textContent = "Error al guardar la actualización."; box.style.background = "#da3633"; }
      };
      xhr.onerror = () => { statusLabel.textContent = "Error de descarga."; box.style.background = "#da3633"; };
      xhr.send();
    },
  };
  window.addEventListener("load", () => gBomboUpdate.init(), { once: true });
}

window.onload = gBrowserInit.onLoad.bind(gBrowserInit);
window.onunload = gBrowserInit.onUnload.bind(gBrowserInit);
window.onclose = WindowIsClosing;

window.addEventListener(
  "MozBeforeInitialXULLayout",
  gBrowserInit.onBeforeInitialXULLayout.bind(gBrowserInit),
  { once: true }
);

// The listener of DOMContentLoaded must be set on window, rather than
// document, because the window can go away before the event is fired.
// In that case, we don't want to initialize anything, otherwise we
// may be leaking things because they will never be destroyed after.
window.addEventListener(
  "DOMContentLoaded",
  gBrowserInit.onDOMContentLoaded.bind(gBrowserInit),
  { once: true }
);
