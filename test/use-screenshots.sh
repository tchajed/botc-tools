#!/bin/bash

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR/.."

cp test/screenshots/roles-top.png screenshots/roles.png
cp test/screenshots/night.png screenshots/night.png
cp test/screenshots/assign/2-complete.png screenshots/assign.png
cp test/screenshots/assign/3-bag.png screenshots/bag.png
cp test/screenshots/assign/4-grimoire.png screenshots/grimoire.png
cp test/screenshots/assign/5-show-char.png screenshots/character.png

for file in screenshots/*.png; do
  (
    mogrify -resize '75%' "$file"
    name="$(basename "$file" .png)"
    convert "$file" "screenshots/$name.webp"
    rm "$file"
  ) &
done
wait
