# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Chrome **theme** extension in the Atom One Dark palette. The entire shipped product is
`theme/manifest.json` — 21 colour keys. Themes carry no JavaScript, HTML, icons or
permissions, so there is no app code, no build step and no test suite. Everything else in
the repo is tooling around that one file.

## Commands

```sh
node scripts/validate-theme.mjs          # defaults to theme/manifest.json; takes an optional path arg
./scripts/package.sh                     # validates, then → dist/one-dark-<version>.zip
./scripts/render-store-assets.sh         # store/*.html → store/*.png at exact listing sizes
```

No dependencies and no `package.json`. Node 24 and `zip` are the only requirements.

Manual testing is the only integration test: `chrome://extensions` → Developer mode →
Load unpacked → select `theme/`. Reload the unpacked item after each edit; frame colours
occasionally need a full Chrome restart before they take.

### Reading validator output

A clean run prints **one warning and exits 0**:

```
warn  tab_background_text #828997 on background_tab #21252b is 4.38:1 — below the 4.5:1 floor
ok — .../theme/manifest.json: 21 colour keys, 1 warning
```

That warning is deliberate (it preserves the mono-2 step in the text ramp). One warning is
the passing state, not something to fix. Only errors set a non-zero exit.

## Architecture

- **`theme/manifest.json`** — the product.
- **`scripts/validate-theme.mjs`** — the only real logic. Its `COLOR_KEYS`, `TINT_KEYS`,
  `PROPERTY_KEYS` and `IMAGE_KEYS` sets are transcribed by hand from Chromium `main`
  (`browser_theme_pack.cc`'s `kOverwritableColorTable`/`kTintTable`/`kDisplayProperties`/
  `kPersistingImages`, and `theme_handler.cc`'s `LoadColors`/`LoadTints`/`LoadImages`),
  **verified 2026-08-28**. Adding a manifest key means adding it to the matching set here,
  or the validator rejects it as "not a key Chrome reads". Re-check the transcription
  against Chromium if Chrome behaviour changes.
- **`scripts/package.sh`** — zips the *contents* of `theme/` at the archive root (the Web
  Store expects `manifest.json` at top level, not under `theme/`), excluding dotfiles,
  `README.md` and `Cached Theme.pak` (Chrome writes that into `theme/` when the directory
  is loaded unpacked), then asserts the root `manifest.json` is present.
- **`store/`** — Chrome Web Store listing material, not shipped in the extension:
  `listing.md` (copy, category, privacy answers) and the promo tile / store icon as HTML
  rendered to PNG by `scripts/render-store-assets.sh`, which fails if the output is not
  exactly 440×280 / 128×128. Note the store icon is a *listing* asset uploaded in the
  console — `icons` in a theme manifest is an error, so the two are unrelated.
- **`.github/workflows/build.yml`** — Node 24. Validates and packages on every push and
  PR. A push to `main` publishes a GitHub Release tagged `v<manifest version>`; a `v*` tag
  push does the same and additionally fails if the tag disagrees with the manifest. Both
  paths skip with a notice when that version is already released, so the release job is
  idempotent and only fires on an actual version bump.

### Why the validator exists (the central design fact)

Bad theme values usually fail **silently**. Only a wrong *shape* — not an array, wrong
length, non-integer RGB — fails the extension load. An out-of-range number or a misspelled
key installs cleanly and is then discarded, so a typo looks like a working theme that just
doesn't apply in places. The validator therefore hard-errors on all three cases, and its
messages say which failure mode each one is. Keep that distinction when adding checks:

- **errors** = Chrome-level breakage (loud rejection *or* silent drop)
- **warnings** = One Dark design invariants — a design regression, not a Chrome error

## Design invariants

Enforced as warnings by the validator; documented with rationale in `theme/README.md`.

1. **`frame` is one step darker than `toolbar`** (`#21252b` vs `#282c34`). That step is
   the identity of the theme.
2. **`frame` equals `background_tab`** so inactive tabs merge into the frame. Change one,
   change both.
3. **Three-step text ramp** (`#dcdfe4` / `#abb2bf` / `#828997`) and **accent is rationed** —
   `ntp_link` blue is the only hue the theme places. Don't add hue elsewhere.

## Do not "fix" these

- **The 4.38:1 contrast warning** — deliberate, see above.
- **`omnibox_background`, `omnibox_text`, `toolbar_text`** — valid, themable keys left out
  on purpose because the design has no value for the omnibox pill. Adding them is a design
  decision to raise with the user, not a bug fix. `theme/README.md` has the candidate values.
- **Missing icons/permissions/background** — themes cannot carry them; the validator's
  `NON_THEME_KEYS` errors if they appear.
- **Chrome-derived surfaces** — menus, tab hover, the downloads bubble, the incognito chip,
  the omnibox left rule. `theme/README.md` lists what a theme genuinely cannot reach. If a
  derived colour lands wrong, nudge `frame`/`toolbar`; don't hunt for a key that doesn't exist.

## Releasing

Bump `theme/manifest.json`'s `version` and push to `main` — CI tags and releases it.
Pushing `main` without a bump releases nothing.

```sh
git commit -am 'One Dark 1.1.0' && git push origin main
```

Tagging by hand still works, but the tag must match the manifest exactly or the job fails.

## Further reading

`theme/README.md` is the deep reference: full palette table, the failure-mode table, the
manual testing checklist, Web Store notes, and the provenance of the design (a Claude
Design handoff — mockups `4a`/`4b`/`4c`/`4d`; the bundle is not in this repo). Read it
before changing colours or debugging why something didn't apply.
