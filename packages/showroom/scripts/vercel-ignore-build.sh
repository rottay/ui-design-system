#!/bin/bash

# Vercel Ignored Build Step for Showroom
# Exit 1 = proceed with build (changes detected)
# Exit 0 = skip build (no changes)
#
# Only rebuilds when packages/showroom/ has changes.
# Changes to packages/core/ (design system library) do NOT trigger a rebuild.

echo "Checking for changes in packages/showroom/..."

# Compare current commit with previous
# VERCEL_GIT_PREVIOUS_SHA is set by Vercel on subsequent deploys
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "No previous SHA found (first deploy). Proceeding with build."
  exit 1
fi

# Check if any files changed in packages/showroom/
CHANGED=$(git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" HEAD -- packages/showroom/)

if [ -n "$CHANGED" ]; then
  echo "Changes detected in packages/showroom/:"
  echo "$CHANGED"
  echo "Proceeding with build."
  exit 1
else
  echo "No changes in packages/showroom/. Skipping build."
  exit 0
fi
