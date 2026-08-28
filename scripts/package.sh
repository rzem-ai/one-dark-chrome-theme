#!/usr/bin/env bash
# Validates the theme and zips it for the Chrome Web Store.
# Output: dist/one-dark-<version>.zip
set -euo pipefail

cd "$(dirname "$0")/.."

node scripts/validate-theme.mjs theme/manifest.json

version=$(node -e 'process.stdout.write(require("./theme/manifest.json").version)')
out="dist/one-dark-${version}.zip"

mkdir -p dist
rm -f "$out"

# The zip must contain manifest.json at its root, not a theme/ directory.
# README.md is developer docs — it ships to no one.
( cd theme && zip -q -r -X "../$out" . -x '.*' -x '__MACOSX/*' -x 'README.md' )

if ! unzip -l "$out" | grep -q ' manifest.json$'; then
  echo "error: $out has no manifest.json at its root" >&2
  exit 1
fi

echo "packaged $out ($(du -h "$out" | cut -f1))"
echo "upload at https://chrome.google.com/webstore/devconsole — remember to bump version on every upload"
