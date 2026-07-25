# Pattern/surface presentation ownership gate (DS-A002)

This static census prevents patterns and surfaces from growing a second visual
system beside the primitives and engine skins. It reports raw interactive HTML,
local SVG, Tailwind-like presentation utilities, stable inline chrome literals,
and semantic reconstruction of existing primitives.

```sh
node scripts/pattern-surface-ownership-gate.mjs --check
node scripts/pattern-surface-ownership-gate.mjs --report --details=100
```

The checked-in baseline records existing debt as a path-keyed multiset. Removing
debt is always green; a new site or a duplicated site fails `--check`. Tighten the
baseline after removals with:

```sh
node scripts/pattern-surface-ownership-gate.mjs --write-baseline
```

Raising the baseline requires both review and the explicit
`--allow-increase` flag. A legitimate permanent owner—such as authored supplier
brand vectors—belongs in the allowlist with a narrow path/category/rule selector
and a non-empty reason.

Runtime geometry derived from props, state, pointer coordinates, observers, or
measurements is intentionally exempt. Fixed chrome such as `padding: 12`,
`color: '#fff'`, and `width: '380px'` is not. Values backed by `var(--...)` are
treated as token-owned.

An `onClick` whose entire body only calls `event.stopPropagation()` /
`event.preventDefault()` is event plumbing, not click semantics, and is exempt
from `clickable-noninteractive` (the resize-separator idiom: real interaction
lives in pointer/keyboard handlers). A handler that does any additional work
keeps being flagged.

The gate analyzes productive TypeScript/JavaScript sources under
`src/ui/patterns` and `src/ui/surfaces`. It does not replace CSS paint/token
gates, accessibility interaction tests, or runtime visual regression.
