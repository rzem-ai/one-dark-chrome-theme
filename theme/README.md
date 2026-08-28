# One Dark — Chrome theme

Repaints Chrome's frame, tab strip, toolbar, bookmarks bar and New Tab page in the
Atom **One Dark** palette. The whole extension is `manifest.json`; a theme carries no
JavaScript, HTML, icons or permissions.

Built from a Claude Design handoff — mockups `4a` (default window), `4b` (incognito)
and `4c` (downloads bubble), with the key set from `4d`. The design bundle itself is
not in this repo.

## Install for testing

```
chrome://extensions → Developer mode on → Load unpacked → select this theme/ directory
```

Reload the unpacked item after each edit. Frame colours occasionally need a full Chrome
restart before they take.

## Validate and package

```sh
node scripts/validate-theme.mjs      # from the repo root
./scripts/package.sh                 # → dist/one-dark-<version>.zip
```

The validator checks every key against the tables Chrome actually reads
(`kOverwritableColorTable`, `kTintTable`, `kDisplayProperties` and the image table in
`browser_theme_pack.cc`, plus the shape rules in `theme_handler.cc`), and checks the
three One Dark design invariants. Run it before every upload — see
[Failure modes](#failure-modes) for why.

The zip has `manifest.json` at its root, which is what the Web Store expects.

## The palette

| Role | Hex | RGB |
|---|---|---|
| Frame / app surface | `#21252b` | 33, 37, 43 |
| Frame, darker (inactive + incognito) | `#1c1f24` | 28, 31, 36 |
| Toolbar / active tab | `#282c34` | 40, 44, 52 |
| Selection / raised fill | `#3e4451` | 62, 68, 81 |
| Text, bright (active tab) | `#dcdfe4` | 220, 223, 228 |
| Text, primary (mono-1) | `#abb2bf` | 171, 178, 191 |
| Text, secondary (mono-2) | `#828997` | 130, 137, 151 |
| Blue (links) | `#61afef` | 97, 175, 239 |

Three rules, in priority order:

1. **The frame is one step darker than the toolbar** — `#21252b` against `#282c34`.
   That single step is the identity of the theme. Inactive tabs sit at frame level,
   the active tab at toolbar level.
2. **Text is a three-step ramp** — `#dcdfe4` active tab only, `#abb2bf` toolbar icons
   and bookmark text, `#828997` inactive tab titles.
3. **Accent is rationed** — the only hue the theme places is `ntp_link` blue. Favicon
   colours come from sites. Do not add hue anywhere else.

`frame` and `background_tab` are equal on purpose, so inactive tabs merge into the
frame. If you change one, change both — the validator warns when they drift.

## Themable, deliberately unset

`omnibox_background`, `omnibox_text` and `toolbar_text` are valid keys — all three sit
in `kOverwritableColorTable` in Chromium `main`, so the omnibox pill **is** themable:

```cpp
{"omnibox_background", TP::COLOR_OMNIBOX_BACKGROUND},
{"omnibox_text",       TP::COLOR_OMNIBOX_TEXT},
{"toolbar_text",       TP::COLOR_TOOLBAR_TEXT},
```

The manifest leaves them out on purpose, matching the design: mockup `4a` draws the
omnibox as Chrome-derived under a "drawn approximate" caption, so there is no designed
value to ship, and rule 3 above rations accent. Adding them is a design decision, not a
bug fix.

If you do want the omnibox on-palette, it's three lines. The values below are `4a`'s
drawn approximations (`#353b45` pill, `#c9cfd8` text) plus mono-1 for toolbar text — a
starting point to put in front of the designer, not a decision:

```json
"omnibox_background": [53, 59, 69],
"omnibox_text": [201, 207, 216],
"toolbar_text": [171, 178, 191]
```

## What the theme genuinely cannot do

- **The 2px blue rule down the left of the omnibox** (mockups `1a`/`3a`) — it's a
  border, not a fill, and no key reaches it. Would need a separate extension, which
  cannot be combined with a theme.
- **Per-tab hue tinting** (mockup `1c`).
- **The incognito chip, the incognito landing card, its toggle** (mockup `3b`) —
  Chrome-owned. `frame_incognito` and the `*_incognito` tab keys are all you get.
  There is no `incognito` opt-in for themes.
- **The downloads shelf** (mockup `3c`) — removed in Chrome 114. Downloads are a
  toolbar bubble now; the bubble surface, its text and its progress bar are derived and
  keep Chrome's blue.
- **Menu popups, tab hover, the toolbar/page separator, extension icons, the profile
  avatar, the search-engine glyph, fonts, radii, tab shape.**

Chrome also derives, and re-contrasts, more than you'd expect: recent versions compute
surface and text colours from `frame`/`toolbar` through their own colour pipeline. If a
derived colour lands wrong, nudge `frame`/`toolbar` — don't hunt for a key that doesn't
exist.

## Failure modes

A bad value fails in one of three ways, and only the first is loud:

| Mistake | What Chrome does |
|---|---|
| Wrong shape — not an array, not 3–4 entries, non-integer RGB | Rejects the whole extension with `kInvalidThemeColors` |
| RGB outside 0–255, or a bad alpha | Passes install, then that one key is **silently dropped** |
| Unknown key name | Passes install, **silently ignored** |

The last two are why a typo looks like a working theme that just doesn't apply, and why
the validator treats both as errors. Values are integer arrays, RGB — no hex strings,
no CSS names. A fourth entry is alpha: `0`/`1` as an integer, or `0.0`–`1.0` as a float.

## Testing checklist

- Window focused vs unfocused (`frame` vs `frame_inactive`)
- Active vs background tab; hover on a background tab; a pinned tab; tab-strip overflow
- Bookmarks bar with and without items
- New Tab page
- Incognito window, focused and unfocused
- A download in progress
- Maximised vs restored
- OS in both light and dark mode — Chrome's own preference changes what it derives
- Browser colour setting at default, then with a user-set dynamic colour, which can
  override the theme
- Both platforms: macOS draws its own traffic lights on the frame; Windows 11 caption
  buttons take only an image (`theme_window_control_background`), not a colour. The
  mockups depict macOS.

Installing this silently replaces whatever theme the user currently has — Chrome allows
one at a time.

## Web Store notes

`version` must be bumped on every upload; select the theme category during upload. The
listing needs 1280×800 (or 640×400) screenshots and a 440×280 promo tile — capture
those from a real themed Chrome window, not from the HTML mockup. No logo exists for
this theme; render "One Dark" in Geist 600 if a mark is needed.

If you ever add images they must be PNG, or they won't render
([crbug.com/1200459](https://crbug.com/1200459)). Images override colours and make the
theme brittle across platforms — resist. `ntp_logo_alternate: 1` in `properties` swaps
to the white Google logo, worth trying if the coloured logo reads badly on `#21252b`,
but check the current NTP still honours it before shipping it.
