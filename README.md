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
```

No dependencies; Node 22 and `zip` are all you need.

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
uploading the zip as a build artifact.

Pushing a `v*` tag additionally publishes a GitHub Release with the zip attached. The
tag must match `theme/manifest.json`'s `version` or the release job fails — a mismatched
version ships a zip the Web Store rejects as a duplicate.

```sh
# bump theme/manifest.json to 1.1.0 first
git tag v1.1.0 && git push origin v1.1.0
```

## Notes

[`theme/README.md`](theme/README.md) has the detail: the full palette and its three
rules, which keys are themable but deliberately unset (the omnibox pill — `4a` draws it
as Chrome-derived, so there's no designed value to ship), what Chrome won't let a theme
touch at all, the failure-mode table, a testing checklist, and Web Store notes.

## Licence

[MIT](LICENSE). The One Dark palette originates with
[Atom's one-dark-syntax and one-dark-ui themes](https://github.com/atom/atom), also MIT.
