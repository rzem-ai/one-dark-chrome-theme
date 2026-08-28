# Chrome Web Store listing

Copy for the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).
Not shipped in the extension — `scripts/package.sh` only zips `theme/`.

## Item name

**One Dark for Chrome**

The manifest currently says `One Dark`. "One Dark" alone is heavily used and the
palette originates with Atom, so a listing under the bare name can read as the
official article — a naming/impersonation risk at review. Adopting this name means
editing `theme/manifest.json` and bumping `version`; it is a decision, not a fix.

## Short description

Taken from `theme/manifest.json`'s `description`, capped at 132 characters. Current
value, which fits and needs no change:

> The Atom One Dark palette for Chrome.

If the name changes, this still reads correctly.

## Detailed description

> One Dark repaints Chrome's frame, tab strip, toolbar, bookmarks bar and New Tab
> page in the Atom One Dark palette — the dark grey-blues that editor users have had
> in their terminal and editor for years, now in the browser around them.
>
> The theme is built on three rules:
>
> • The frame sits one step darker than the toolbar (#21252b against #282c34). That
>   single step is the whole identity — the active tab lifts, inactive tabs recede
>   into the frame instead of competing with it.
>
> • Text runs a three-step ramp, brightest on the active tab and dimmest on inactive
>   tab titles, so the tab you are actually on is obvious at a glance.
>
> • Accent is rationed. The only colour the theme places is the New Tab link blue.
>   Everything else is greyscale, which leaves your favicons as the only saturated
>   thing on screen — easier to scan a wide tab strip that way.
>
> No permissions, no scripts, no data collection. A Chrome theme is a single
> manifest of colour values; this one has 21 and nothing else. It cannot see your
> browsing, because there is no code in it to see anything.
>
> Open source under the MIT licence.
> https://github.com/rzem-ai/one-dark-chrome-theme
>
> The One Dark palette originates with Atom's one-dark-syntax and one-dark-ui
> themes (also MIT). This is an independent theme, not affiliated with Atom or
> GitHub.

That closing attribution is the part worth keeping verbatim — it is what separates
"a One Dark theme" from "the One Dark theme" if a reviewer looks twice.

## Category and language

- Category: **Themes**
- Language: English (UK or US — pick one and keep the copy consistent; the text
  above uses "colour", so UK)

## Privacy practices

A theme has no runtime surface, so every answer is the trivial one. Expect to state:

- Single purpose: *"Applies a colour theme to the Chrome browser interface."*
- No permissions are requested, so no permission justifications are required.
- No remote code.
- Data collection: **none**, every category.
- The certification checkbox that the data disclosures are accurate.

## Assets

| Asset | Size | Status |
|---|---|---|
| Store icon | 128×128 PNG | `store/store-icon.png` |
| Small promo tile | 440×280 PNG | `store/promo-tile.png` |
| Screenshots | 1280×800 or 640×400 PNG | **you must capture these** |

Screenshots have to come from a real themed Chrome window — the theme paints browser
chrome, which sits outside any page viewport and cannot be captured by automation or
reproduced from a mockup. `theme/README.md`'s testing checklist doubles as a shot
list; the useful frames are a focused window with several tabs open, a populated
bookmarks bar, and the New Tab page.
