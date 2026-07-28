#!/bin/bash
# Count real DS consumers of a channel (var() references outside the generated artifacts).
cd /Users/daniel/Developer/Rottay/ui-design-system/packages/core/src || exit 1
for c in "$@"; do
  n=$(grep -rnF "var(--$c)" . 2>/dev/null | grep -v '/facade/artifacts/' | wc -l | tr -d ' ')
  m=$(grep -rnF "var(--$c," . 2>/dev/null | grep -v '/facade/artifacts/' | wc -l | tr -d ' ')
  echo "--$c: $((n + m))"
done
