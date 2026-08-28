#!/usr/bin/env bash
# Renders the Chrome Web Store listing images from store/*.html at exact sizes.
# These are listing assets only — package.sh never zips them into the extension.
set -euo pipefail

cd "$(dirname "$0")/.."

chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [ ! -x "$chrome" ]; then
  echo "error: Chrome not found at $chrome — set CHROME=/path/to/chrome" >&2
  exit 1
fi

render() {
  local name=$1 w=$2 h=$3
  "$chrome" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 \
    --virtual-time-budget=4000 \
    --window-size="${w},${h}" \
    --screenshot="store/${name}.png" \
    "file://$PWD/store/${name}.html" >/dev/null 2>&1
  # Chrome exits 0 even when it writes nothing, so check the file itself.
  local got
  got=$(sips -g pixelWidth -g pixelHeight "store/${name}.png" 2>/dev/null \
        | awk '/pixelWidth/{w=$2} /pixelHeight/{h=$2} END{print w"x"h}')
  if [ "$got" != "${w}x${h}" ]; then
    echo "error: store/${name}.png is ${got}, expected ${w}x${h}" >&2
    exit 1
  fi
  echo "rendered store/${name}.png (${got})"
}

render promo-tile 440 280
render store-icon 128 128
