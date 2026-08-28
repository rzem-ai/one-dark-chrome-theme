# One Dark — Chrome theme

[![build](https://github.com/rzem-ai/one-dark-chrome-theme/actions/workflows/build.yml/badge.svg)](https://github.com/rzem-ai/one-dark-chrome-theme/actions/workflows/build.yml)

A Google Chrome theme in the Atom **One Dark** palette. It repaints the frame, tab
strip, toolbar, bookmarks bar and New Tab page.

The whole extension is one `manifest.json` — 21 colour keys, no JavaScript, no HTML, no
icons, no permissions. Themes can't have any of that.

<table>
<tr><td>Frame</td><td><code>#21252b</code></td><td>Toolbar / active tab</td><td><code>#282c34</code></td></tr>
<tr><td>Frame, darker</td><td><code>#1c1f24</code></td><td>Active tab text</td><td><code>#dcdfe4</code></td></tr>
<tr><td>Raised fill</td><td><code>#3e4451</code></td><td>Icons, bookmark text</td><td><code>#abb2bf</code></td></tr>
<tr><td>NTP links</td><td><code>#61afef</code></td><td>Inactive tab text</td><td><code>#828997</code></td></tr>
</table>

## Install

Grab the zip from the [latest release](../../releases/latest), unzip it, then:

```
chrome://extensions → Developer mode on → Load unpacked → select the unzipped folder
```

Or clone this repo and load the `theme/` directory directly. Reload the unpacked item
after each edit — frame colours occasionally need a full Chrome restart.

## Develop

```sh
node scripts/validate-theme.mjs   # check the manifest
./scripts/package.sh              # → dist/one-dark-<version>.zip
./scripts/render-store-assets.sh  # → store/*.png for the Web Store listing
```

No dependencies; Node 24 and `zip` are all you need. Rendering the listing images
additionally needs Chrome, which you have if you are developing a Chrome theme.

`scripts/validate-theme.mjs` checks every key against the tables Chrome actually reads
— `kOverwritableColorTable`, `kTintTable`, `kDisplayProperties` and the image table in
`chrome/browser/themes/browser_theme_pack.cc`, plus the shape rules in
`chrome/common/extensions/manifest_handlers/theme_handler.cc` — and checks the three
One Dark colour invariants (frame darker than toolbar, frame equal to `background_tab`,
contrast floors).

It exists because **bad theme values usually fail silently**. Only a wrong *shape* —
not an array, wrong length, non-integer RGB — fails the load. An out-of-range number or
a misspelled key name installs cleanly and is then discarded, so a typo looks like a
working theme that just doesn't apply in places. The validator treats both as errors.

Expect one warning on a clean run: `tab_background_text` `#828997` on `#21252b` is
4.38:1, the theme's weakest pair. That's a deliberate design decision, kept for the
mono-2 step in the text ramp.

## CI

`.github/workflows/build.yml` validates and packages on every push and pull request,
uploading the zip as a build artifact. It runs on Node 24.

Pushing to `main` publishes a GitHub Release with the zip attached, tagged `v<version>`
from `theme/manifest.json`. That version is the source of truth: if a release for it
already exists the job logs a notice and stops, so a release goes out exactly when you
bump the manifest — not on every push.

```sh
# bump theme/manifest.json to 1.1.0, then
git commit -am 'One Dark 1.1.0' && git push origin main
```

Pushing a `v*` tag publishes the same way, and additionally fails if the tag disagrees
with the manifest — a mismatched version ships a zip the Web Store rejects as a duplicate.

## Publishing

**[`store/publishing.md`](store/publishing.md) is the walkthrough** — every console and
documentation link in the order you need them.

[`store/`](store) also holds the material those steps ask for:
[`listing.md`](store/listing.md) with the copy and privacy answers, plus the 440×280
promo tile and 128×128 store icon rendered from HTML by
`./scripts/render-store-assets.sh`. Screenshots are the one asset that cannot be
generated — the theme paints browser chrome, so they have to be captured from a real
themed window.

## Notes

[`theme/README.md`](theme/README.md) has the detail: the full palette and its three
rules, which keys are themable but deliberately unset (the omnibox pill — `4a` draws it
as Chrome-derived, so there's no designed value to ship), what Chrome won't let a theme
touch at all, the failure-mode table, a testing checklist, and Web Store notes.

## Licence

[MIT](LICENSE). The One Dark palette originates with
[Atom's one-dark-syntax and one-dark-ui themes](https://github.com/atom/atom), also MIT.
