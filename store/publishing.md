# Publishing One Dark to the Chrome Web Store

Every place you have to go, in the order you have to go there. Steps marked
**browser** happen in a Google console; **repo** steps happen here.

| # | Step | Where | Blocked on |
|---|---|---|---|
| 1 | Register a developer account | [Developer Dashboard](https://chrome.google.com/webstore/devconsole) | one-time fee, email verification |
| 2 | Get the zip | [releases](https://github.com/rzem-ai/one-dark-chrome-theme/releases/tag/v1.0.0) or `./scripts/package.sh` | — |
| 3 | Capture screenshots | your own Chrome window | **only you can do this** |
| 4 | Create the item and upload | [Developer Dashboard](https://chrome.google.com/webstore/devconsole) | steps 1–2 |
| 5 | Fill the store listing | same console, *Store listing* tab | [`store/listing.md`](listing.md) |
| 6 | Fill the privacy tab | same console, *Privacy practices* tab | — |
| 7 | Submit for review | same console | steps 3–6 |

---

## 1. Register a developer account — browser

Go to the **[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)**
and sign in with the Google account that should own the listing. Choose deliberately —
moving a published item between accounts later is a support request, not a setting.

You will be asked for a one-time registration fee and a verified contact email before
anything can be published. Google's own walkthrough is
**[Register your developer account](https://developer.chrome.com/docs/webstore/register)**.

## 2. Get the zip — repo

Either download `one-dark-1.0.0.zip` from the
**[v1.0.0 release](https://github.com/rzem-ai/one-dark-chrome-theme/releases/tag/v1.0.0)**,
or build it yourself:

```sh
./scripts/package.sh        # → dist/one-dark-1.0.0.zip
```

Both produce an archive with `manifest.json` at the root, which is what the uploader
expects. Nothing else needs to be in it.

## 3. Capture screenshots — your Chrome window

**This is the only step nothing can do for you.** The theme paints browser chrome,
which sits outside any page's viewport, so no automation, page capture or HTML mockup
can produce a real screenshot.

Load the theme first — `chrome://extensions` → Developer mode → Load unpacked →
select `theme/`. Then capture at **1280×800** or **640×400** (macOS: `⌘⇧4`, then space
to grab a whole window; crop or shoot into a window sized to spec).

Google's size and format rules: **[Supplying images](https://developer.chrome.com/docs/webstore/images)**.
The [testing checklist](../theme/README.md#testing-checklist) doubles as a shot list —
the frames worth having are a focused window with several tabs, a populated bookmarks
bar, and the New Tab page.

## 4. Create the item and upload — browser

In the **[dashboard](https://chrome.google.com/webstore/devconsole)**, use **+ New item**
and upload the zip from step 2. The manifest is read on upload, so the name, version and
short description come across automatically.

## 5. Fill the store listing — browser

Still in the console, on the **Store listing** tab. All the copy is written for you in
**[`store/listing.md`](listing.md)** — description, category and the attribution line.
Two things to know while you are there:

- **Category is Themes.**
- **The 128×128 store icon is uploaded here, not declared in the manifest.** `icons` is
  a key a theme must not carry, so its absence from `manifest.json` is correct. Upload
  [`store/store-icon.png`](store-icon.png) and [`store/promo-tile.png`](promo-tile.png)
  in this tab.

Reference: **[Prepare your listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)**.

## 6. Fill the privacy tab — browser

Mandatory even though every answer is trivial for a theme: no permissions, no remote
code, no data collection. The single-purpose statement and the exact answers are in
[`store/listing.md`](listing.md#privacy-practices).

Reference: **[Fill out the privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)**.

## 7. Submit — browser

Submit from the console. Turnaround ranges from hours to several days; see
**[the review process](https://developer.chrome.com/docs/webstore/review-process)**.

You can publish immediately on approval, or set visibility to **Unlisted** first if you
want to inspect the live listing before it becomes discoverable. Unlisted is the low-risk
choice for a first publish — the item is real and installable by link, but not in search.

---

## Shipping an update later

The version is coupled three ways — manifest, git tag, store upload — and the manifest
drives all of it:

1. Bump `version` in [`theme/manifest.json`](../theme/manifest.json).
2. Commit and push to `main`. CI tags `v<version>` and
   [publishes a release](https://github.com/rzem-ai/one-dark-chrome-theme/releases)
   with the zip attached.
3. Upload that zip in the console under **Package**, then submit again.

The store rejects a re-upload at an existing version, which is the same rule CI applies
when it decides whether to cut a release. Forget to bump and both refuse you.

## Reference

- **[Program policies](https://developer.chrome.com/docs/webstore/program-policies)** —
  worth a skim before submitting, particularly the naming section. "One Dark" is heavily
  used and the palette originates with Atom, which is why
  [`listing.md`](listing.md#item-name) recommends listing as *One Dark for Chrome* with
  an explicit non-affiliation line.
- **[Publishing overview](https://developer.chrome.com/docs/webstore/publish)**
- **[Themes documentation](https://developer.chrome.com/docs/extensions/develop/ui/themes)**
- [`theme/README.md`](../theme/README.md) — the palette, its rules, and what a Chrome
  theme genuinely cannot repaint.
