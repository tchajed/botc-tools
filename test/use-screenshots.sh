#!/bin/bash

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR/.."

cp test/screenshots/roles-top.png screenshots/roles.png
cp test/screenshots/night.png screenshots/night.png
cp test/screenshots/assign/2-complete.png screenshots/assign.png
cp test/screenshots/assign/3-bag.png screenshots/townsquare.png
cp test/screenshots/assign/4-show-char.png screenshots/character.png

for file in screenshots/*.png; do
  (
    mogrify -resize '50%' "$file"
    optipng -quiet "$file"
  ) &
done
wait
