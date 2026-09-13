---
"@rottay/design-system": patch
---

Pack hygiene. No export, subpath or signature changed.

- Declarations under any `tests/` folder and the provisional
  `foundation/presets/candidates/**` identity candidates no longer ship in the
  tarball: `tsconfig.json` excludes them, so vite-plugin-dts never emits them.
  Six `.d.ts` files leave the pack (`responsive/tests/projection`,
  `visual-authority/tests/mount-fixture`, `candidates/bithire{,/documents}`,
  `particles/config/tests/support`, `artifact-renderer/tests/support`); none was
  reachable from a declared export.
- The pack-inventory gate refuses any packed path with a `tests` segment, and
  its baseline is re-seeded from a real install.
