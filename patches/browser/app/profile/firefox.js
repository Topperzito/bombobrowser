#filter dumbComments emptyLines substitution

// -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// ===========================================================================
// BomboBrowser privacy-hardening preferences
// These are applied ON TOP of the base Firefox preferences.
// ===========================================================================

// --- Telemetry / data collection ---
pref("toolkit.telemetry.enabled",               false);
pref("toolkit.telemetry.unified",               false);
pref("toolkit.telemetry.archive.enabled",       false);
pref("toolkit.telemetry.newProfilePing.enabled",false);
pref("toolkit.telemetry.shutdownPingSender.enabled", false);
pref("toolkit.telemetry.updatePing.enabled",    false);
pref("toolkit.telemetry.bhrPing.enabled",       false);
pref("toolkit.telemetry.firstShutdownPing.enabled", false);
pref("datareporting.healthreport.uploadEnabled",false);
pref("datareporting.policy.dataSubmissionEnabled", false);

// --- Studies / experiments ---
pref("app.shield.optoutstudies.enabled",        false);
pref("app.normandy.enabled",                    false);
pref("app.normandy.api_url",                    "");

// --- Crash reporter ---
pref("breakpad.reportURL",                      "");
pref("browser.tabs.crashReporting.sendReport",  false);

// --- Pocket ---
pref("extensions.pocket.enabled",               false);

// --- Firefox Accounts / Sync ---
pref("identity.fxaccounts.enabled",             false);

// --- WebRTC IP leak prevention ---
pref("media.peerconnection.enabled",            false);
pref("media.peerconnection.ice.default_address_only", true);
pref("media.peerconnection.ice.no_host",        true);

// --- HTTPS-Only mode ---
pref("dom.security.https_only_mode",            true);
pref("dom.security.https_only_mode_ever_enabled", true);

// --- Tracking protection ---
pref("privacy.trackingprotection.enabled",      true);
pref("privacy.trackingprotection.pbmode.enabled", true);
pref("privacy.trackingprotection.cryptomining.enabled", true);
pref("privacy.trackingprotection.fingerprinting.enabled", true);
pref("privacy.fingerprintingProtection",        true);
pref("privacy.resistFingerprinting",            true);
pref("privacy.resistFingerprinting.block_mozAddonManager", true);

// --- Third-party cookies ---
pref("network.cookie.cookieBehavior",           1);  // block third-party cookies

// --- Predictive features disabled ---
pref("network.prefetch-next",                   false);
pref("network.dns.disablePrefetch",             true);
pref("network.dns.disablePrefetchFromHTTPS",    true);
pref("network.predictor.enabled",               false);
pref("network.predictor.enable-prefetch",       false);
pref("browser.urlbar.speculativeConnect.enabled", false);

// --- Safe browsing (pings disabled, local list still active) ---
pref("browser.safebrowsing.malware.enabled",    true);
pref("browser.safebrowsing.phishing.enabled",   true);
pref("browser.safebrowsing.downloads.enabled",  false);
pref("browser.safebrowsing.provider.google4.reportMalwareMistakeURL", "");
pref("browser.safebrowsing.provider.google4.reportPhishMistakeURL",   "");
pref("browser.safebrowsing.provider.google4.reportURL",               "");

// --- Geolocation ---
pref("geo.enabled",                             false);
pref("geo.provider.network.url",                "");

// --- Clear on shutdown ---
pref("privacy.sanitize.sanitizeOnShutdown",     true);
pref("privacy.clearOnShutdown.history",         true);
pref("privacy.clearOnShutdown.formdata",        true);
pref("privacy.clearOnShutdown.downloads",       true);
pref("privacy.clearOnShutdown.cookies",         true);
pref("privacy.clearOnShutdown.cache",           true);
pref("privacy.clearOnShutdown.sessions",        true);
pref("privacy.clearOnShutdown.offlineApps",     false);
pref("privacy.clearOnShutdown.siteSettings",    false);
pref("privacy.clearOnShutdown.openWindows",     false);
// v2 keys (Firefox 124+)
pref("privacy.clearOnShutdown_v2.historyFormDataAndDownloads", true);
pref("privacy.clearOnShutdown_v2.browsingHistoryAndDownloads", true);
pref("privacy.clearOnShutdown_v2.cookiesAndStorage",           true);
pref("privacy.clearOnShutdown_v2.cache",                       true);
pref("privacy.clearOnShutdown_v2.siteSettings",                false);
pref("privacy.clearOnShutdown_v2.formdata",                    false);

// --- Do Not Track ---
pref("privacy.donottrackheader.enabled",        true);

// --- Firefox View / welcome / onboarding ---
pref("browser.aboutwelcome.enabled",            false);
pref("browser.startup.homepage_override.mstone", "ignore");
pref("browser.newtabpage.activity-stream.feeds.telemetry",      false);
pref("browser.newtabpage.activity-stream.telemetry",            false);
pref("browser.newtabpage.activity-stream.feeds.snippets",       false);
pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
pref("browser.newtabpage.activity-stream.showSponsored",        false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.newtabpage.activity-stream.default.sites",        "");

// --- Misc privacy ---
pref("browser.send_pings",                      false);
pref("beacon.enabled",                          false);
pref("dom.battery.enabled",                     false);

// ===========================================================================
// Standard Firefox desktop preferences (kept from upstream)
// ===========================================================================

#ifdef XP_UNIX
  #ifndef XP_MACOSX
    #define UNIX_BUT_NOT_MAC
  #endif
#endif

#ifdef XP_MACOSX
  pref("browser.hiddenWindowChromeURL", "chrome://browser/content/hiddenWindowMac.xhtml");
#endif

// Extensions
pref("extensions.abuseReport.enabled",                          true);
pref("extensions.logging.enabled",                              false);
pref("extensions.strictCompatibility",                          false);
pref("extensions.webextOptionalPermissionPrompts",              true);
pref("extensions.postDownloadThirdPartyPrompt",                 true);
pref("extensions.getAddons.cache.enabled",                      true);
pref("extensions.getAddons.get.url",                            "https://services.addons.mozilla.org/api/v4/addons/search/?guid=%IDS%&lang=%LOCALE%");
pref("extensions.getAddons.search.browseURL",                   "https://addons.mozilla.org/%LOCALE%/firefox/search?q=%TERMS%&platform=%OS%&appver=%VERSION%");
pref("extensions.getAddons.link.url",                           "https://addons.mozilla.org/%LOCALE%/firefox/");
pref("extensions.getAddons.langpacks.url",                      "https://services.addons.mozilla.org/api/v4/addons/language-tools/?app=firefox&type=language&appversion=%VERSION%");
pref("extensions.getAddons.discovery.api_url",                  "https://services.addons.mozilla.org/api/v4/discovery/?lang=%LOCALE%&edition=%DISTRIBUTION%");
pref("extensions.getAddons.browserMappings.url",                "https://services.addons.mozilla.org/api/v5/addons/browser-mappings/?browser=%BROWSER%");
pref("extensions.recommendations.privacyPolicyUrl",             "https://www.mozilla.org/privacy/firefox/?utm_source=firefox-browser&utm_medium=firefox-browser&utm_content=privacy-policy-link#addons");
pref("extensions.recommendations.themeRecommendationUrl",       "https://color.firefox.com/?utm_source=firefox-browser&utm_medium=firefox-browser&utm_content=theme-footer-link");
pref("extensions.update.autoUpdateDefault",                     true);
pref("extensions.systemAddon.update.url",                       "https://aus5.mozilla.org/update/3/SystemAddons/%VERSION%/%BUILD_ID%/%BUILD_TARGET%/%LOCALE%/%CHANNEL%/%OS_VERSION%/%DISTRIBUTION%/%DISTRIBUTION_VERSION%/update.xml");
pref("extensions.systemAddon.update.enabled",                   true);
pref("extensions.autoDisableScopes",                            15);
pref("extensions.startupScanScopes",                            0);
pref("extensions.geckoProfiler.acceptedExtensionIds",           "geckoprofiler@mozilla.com,quantum-foxfooding@mozilla.com,raptor@mozilla.org");
pref("extensions.webextensions.remote",                         true);
pref("extensions.langpacks.signatures.required",                true);
pref("xpinstall.signatures.required",                           true);
pref("extensions.dataCollectionPermissions.enabled",            true);

pref("browser.dictionaries.download.url",                       "https://addons.mozilla.org/%LOCALE%/firefox/language-tools/");

// App update timers (update checks are done by BomboBrowser's own mechanism)
pref("app.update.checkInstallTime",                             false);
pref("app.update.timerMinimumDelay",                            120);
pref("app.update.timerFirstInterval",                           30000);

// Session history
pref("browser.sessionhistory.max_entries",                      50);

// Privacy segmentation UI
pref("browser.privacySegmentation.preferences.show",           false);

// URL bar
pref("browser.urlbar.suggest.history",                          true);
pref("browser.urlbar.shortcuts.history",                        true);

// Popups
pref("privacy.popups.showBrowserMessage",                       true);
