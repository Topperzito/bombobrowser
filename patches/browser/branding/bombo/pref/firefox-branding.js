/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Brand-specific preferences for BomboBrowser

// Disable the built-in Firefox welcome / onboarding pages
pref("startup.homepage_override_url",                   "");
pref("startup.homepage_welcome_url",                    "");
pref("startup.homepage_welcome_url.additional",         "");
pref("browser.aboutwelcome.enabled",                    false);
pref("browser.newtabpage.activity-stream.migrationPing", "");

// Disable Firefox's own update mechanism entirely
// (BomboBrowser uses its own gBomboUpdate system via the GitHub Releases API)
pref("app.update.enabled",                              false);
pref("app.update.auto",                                 false);
pref("app.update.checkInstallTime",                     false);
pref("app.update.checkInstallTime.days",                0);
pref("app.update.interval",                             0);
pref("app.update.promptWaitTime",                       86400);
pref("app.update.badgeWaitTime",                        0);
pref("app.update.url",                                  "");
pref("app.update.url.manual",                           "");
pref("app.update.url.details",                          "");
