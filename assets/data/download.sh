#!/bin/bash

set -e

for file in roles jinx nightsheet tether game-characters-restrictions; do
  wget -O "$file.json" "https://script.bloodontheclocktower.com/data/$file.json"
done

wget -O botc_online_roles.json "https://raw.githubusercontent.com/bra1n/townsquare/develop/src/roles.json"
