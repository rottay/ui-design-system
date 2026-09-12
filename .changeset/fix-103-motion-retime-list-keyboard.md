---
"@rottay/design-system": patch
---

FIX-103 (audit 103, RUNTIME-02 + RUNTIME-03). Behavior-only corrections; no
export, subpath, prop or signature changed.

- `useTokenEasedLoop` (WO-INV-05): mounted ambient WAAPI loops now follow a
  `motion.character` change — the easing token is re-read after every commit
  and on provider paint-attribute mutations of the ancestor chain, and the
  running animation is retimed in place (`linear` fallback on an unparseable
  curve). Previously a character switch with constant duration left mounted
  effects on the previous curve.
- Data-table `presentation="list"` (WO-INV-07): rows with `onRowClick` now
  offer a focusable `role="button"` opening area with Enter/Space activation;
  nested selection/action controls never open the row. List semantics and
  pointer behaviour are unchanged.
