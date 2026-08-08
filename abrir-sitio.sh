#!/bin/sh
cd "$(dirname "$0")"
node scripts/build-config.mjs && node scripts/build-pages.mjs
(sleep 1 && open http://localhost:4321 2>/dev/null || xdg-open http://localhost:4321 2>/dev/null) &
node servidor.mjs
