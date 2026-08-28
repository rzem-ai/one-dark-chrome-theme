#!/usr/bin/env node
// Validates theme/manifest.json against the tables Chrome actually reads.
//
// The key lists below are transcribed from Chromium `main`:
//   chrome/browser/themes/browser_theme_pack.cc
//     kOverwritableColorTable, kTintTable, kDisplayProperties, kPersistingImages
//   chrome/common/extensions/manifest_handlers/theme_handler.cc
//     LoadColors / LoadTints / LoadImages
// Verified 2026-08-28. Re-check them if a future Chrome changes behaviour.
//
// Usage: node scripts/validate-theme.mjs [path/to/manifest.json]

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const COLOR_KEYS = new Set([
  'background_tab',
  'background_tab_inactive',
  'background_tab_incognito',
  'background_tab_incognito_inactive',
  'bookmark_text',
  'button_background',
  'frame',
  'frame_inactive',
  'frame_incognito',
  'frame_incognito_inactive',
  'ntp_background',
  'ntp_header',
  'ntp_link',
  'ntp_text',
  'omnibox_background',
  'omnibox_text',
  'tab_background_text',
  'tab_background_text_inactive',
  'tab_background_text_incognito',
  'tab_background_text_incognito_inactive',
  'tab_text',
  'toolbar',
  'toolbar_button_icon',
  'toolbar_text',
  // Legacy alias: BrowserThemePack maps it onto ntp_header when ntp_header is absent.
  'ntp_section',
]);

const TINT_KEYS = new Set([
  'background_tab',
  'buttons',
  'frame',
  'frame_inactive',
  'frame_incognito',
  'frame_incognito_inactive',
]);

const PROPERTY_KEYS = new Set([
  'ntp_background_alignment',
  'ntp_background_repeat',
  'ntp_logo_alternate',
]);

const IMAGE_KEYS = new Set([
  'theme_frame',
  'theme_frame_inactive',
  'theme_frame_incognito',
  'theme_frame_incognito_inactive',
  'theme_toolbar',
  'theme_tab_background',
  'theme_tab_background_inactive',
  'theme_tab_background_incognito',
  'theme_tab_background_incognito_inactive',
  'theme_ntp_background',
  'theme_frame_overlay',
  'theme_frame_overlay_inactive',
  'theme_button_background',
  'theme_ntp_attribution',
  'theme_window_control_background',
]);

// Keys a theme extension must not carry — Chrome rejects a theme that also
// declares runtime surface.
const NON_THEME_KEYS = [
  'action',
  'background',
  'chrome_url_overrides',
  'content_scripts',
  'host_permissions',
  'icons',
  'options_page',
  'permissions',
  'web_accessible_resources',
];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const manifestPath = resolve(process.argv[2] ?? 'theme/manifest.json');
if (!existsSync(manifestPath)) {
  console.error(`not found: ${manifestPath}`);
  process.exit(2);
}
const root = dirname(manifestPath);

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (e) {
  console.error(`${manifestPath}: invalid JSON — ${e.message}`);
  process.exit(2);
}

// --- manifest shell -------------------------------------------------------

if (manifest.manifest_version !== 3) {
  err(`manifest_version must be 3, got ${JSON.stringify(manifest.manifest_version)}`);
}
if (typeof manifest.name !== 'string' || !manifest.name.trim()) {
  err('name must be a non-empty string');
}
if (!/^\d+(\.\d+){0,3}$/.test(String(manifest.version ?? ''))) {
  err(`version must be 1–4 dot-separated integers, got ${JSON.stringify(manifest.version)}`);
} else if (String(manifest.version).split('.').some((p) => Number(p) > 65535)) {
  err(`version parts must each be 0–65535, got ${manifest.version}`);
}
if (typeof manifest.description !== 'string' || !manifest.description.trim()) {
  warn('description is empty — the Web Store listing uses it');
} else if (manifest.description.length > 132) {
  err(`description must be ≤132 characters, got ${manifest.description.length}`);
}
for (const key of NON_THEME_KEYS) {
  if (key in manifest) err(`"${key}" cannot appear in a theme — themes carry no runtime surface`);
}
if (!manifest.theme || typeof manifest.theme !== 'object' || Array.isArray(manifest.theme)) {
  err('theme must be an object');
  report();
}
for (const section of Object.keys(manifest.theme)) {
  if (!['colors', 'images', 'tints', 'properties'].includes(section)) {
    warn(`theme.${section} is not a recognised section — Chrome ignores it silently`);
  }
}

// --- colours --------------------------------------------------------------

const colors = manifest.theme.colors ?? {};
for (const [key, value] of Object.entries(colors)) {
  const at = `theme.colors.${key}`;

  if (!COLOR_KEYS.has(key)) {
    // Not a load failure — kOverwritableColorTable lookup returns -1 and the
    // entry is dropped, so the theme installs looking half-applied.
    err(`${at}: not a key Chrome reads; it will be silently ignored`);
    continue;
  }
  // theme_handler.cc LoadColors: these three shapes fail the whole install.
  if (!Array.isArray(value)) {
    err(`${at}: must be an array — this fails the entire theme load`);
    continue;
  }
  if (value.length !== 3 && value.length !== 4) {
    err(`${at}: must have 3 (RGB) or 4 (RGBA) entries, got ${value.length} — this fails the entire theme load`);
    continue;
  }
  const [r, g, b, a] = value;
  for (const [i, c] of [r, g, b].entries()) {
    if (!Number.isInteger(c)) {
      err(`${at}[${i}]: must be an integer, got ${JSON.stringify(c)} — this fails the entire theme load`);
    } else if (c < 0 || c > 255) {
      // Passes the manifest handler, then BrowserThemePack drops it silently.
      err(`${at}[${i}]: must be 0–255, got ${c} — this key is silently dropped`);
    }
  }
  if (value.length === 4) {
    if (typeof a !== 'number') {
      err(`${at}[3]: alpha must be a number — this fails the entire theme load`);
    } else if (Number.isInteger(a) ? a !== 0 && a !== 1 : a < 0 || a > 1) {
      err(`${at}[3]: alpha must be 0/1 as an integer or 0.0–1.0 as a float, got ${a} — this key is silently dropped`);
    }
  }
}

// --- tints, properties, images -------------------------------------------

for (const [key, value] of Object.entries(manifest.theme.tints ?? {})) {
  const at = `theme.tints.${key}`;
  if (!TINT_KEYS.has(key)) {
    err(`${at}: not a tint key Chrome reads; it will be silently ignored`);
    continue;
  }
  if (!Array.isArray(value) || value.length !== 3 || value.some((n) => typeof n !== 'number')) {
    err(`${at}: must be 3 numbers [h, s, l] — this fails the entire theme load`);
    continue;
  }
  value.forEach((n, i) => {
    if (n !== -1 && (n < 0 || n > 1)) {
      err(`${at}[${i}]: HSL tints are 0.0–1.0, or -1 for "no change", got ${n}`);
    }
  });
}

for (const key of Object.keys(manifest.theme.properties ?? {})) {
  if (!PROPERTY_KEYS.has(key)) {
    err(`theme.properties.${key}: not a property Chrome reads; it will be silently ignored`);
  }
}

for (const [key, value] of Object.entries(manifest.theme.images ?? {})) {
  const at = `theme.images.${key}`;
  if (!IMAGE_KEYS.has(key)) {
    err(`${at}: not an image key Chrome reads; it will be silently ignored`);
    continue;
  }
  if (typeof value !== 'string') {
    err(`${at}: must be a path string — this fails the entire theme load`);
    continue;
  }
  if (!value.toLowerCase().endsWith('.png')) {
    err(`${at}: theme images must be PNG (crbug.com/1200459), got "${value}"`);
  }
  if (!existsSync(resolve(root, value))) {
    err(`${at}: file not found — "${value}"`);
  }
}

// --- One Dark design invariants ------------------------------------------
// From the handoff's "Colour intent" rules; violating these is a design
// regression, not a Chrome error.

const hex = (rgb) => '#' + rgb.slice(0, 3).map((c) => c.toString(16).padStart(2, '0')).join('');
const usable = (k) => (Array.isArray(colors[k]) && colors[k].length >= 3 ? colors[k] : null);

const luminance = ([r, g, b]) =>
  [r, g, b]
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (fg, bg) => {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

const frame = usable('frame');
const toolbar = usable('toolbar');
const backgroundTab = usable('background_tab');

// Rule 4: inactive tabs merge into the frame.
if (frame && backgroundTab && hex(frame) !== hex(backgroundTab)) {
  warn(`frame ${hex(frame)} and background_tab ${hex(backgroundTab)} differ — the design keeps them equal so inactive tabs merge into the frame`);
}
// Rule 1: the frame sits one step darker than the toolbar.
if (frame && toolbar && luminance(frame) >= luminance(toolbar)) {
  warn(`frame ${hex(frame)} is not darker than toolbar ${hex(toolbar)} — that single step is the identity of the theme`);
}
// Rule 9: contrast floor on the weakest pair.
for (const [fgKey, bgKey] of [
  ['tab_background_text', 'background_tab'],
  ['tab_text', 'toolbar'],
  ['bookmark_text', 'toolbar'],
  ['toolbar_button_icon', 'toolbar'],
  ['ntp_text', 'ntp_background'],
  ['ntp_link', 'ntp_background'],
]) {
  const fg = usable(fgKey);
  const bg = usable(bgKey);
  if (!fg || !bg) continue;
  const ratio = contrast(fg, bg);
  if (ratio < 4.5) {
    warn(`${fgKey} ${hex(fg)} on ${bgKey} ${hex(bg)} is ${ratio.toFixed(2)}:1 — below the 4.5:1 floor`);
  }
}

// --- report ---------------------------------------------------------------

function report() {
  for (const w of warnings) console.log(`warn  ${w}`);
  for (const e of errors) console.log(`error ${e}`);
  const n = Object.keys(colors).length;
  if (errors.length === 0) {
    console.log(`\nok — ${manifestPath}: ${n} colour key${n === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`);
    process.exit(0);
  }
  console.log(`\nfailed — ${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`);
  process.exit(1);
}

report();
