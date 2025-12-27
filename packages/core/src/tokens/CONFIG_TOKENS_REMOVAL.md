# Config Tokens Duplicate - Removal Documentation

## Summary

The `/config/tokens/` directory contains empty TypeScript placeholder files that were intended to be TypeScript mirrors of the CSS tokens but were never implemented. These files are now superseded by the new `/tokens/ts/` structure.

## Location

`packages/core/src/config/tokens/`

## Current Structure

```
config/tokens/
├── index.ts                        # Exports foundation and utils (empty)
├── foundation/
│   ├── index.ts                    # Re-exports sub-modules
│   ├── colors/
│   │   └── index.ts               # export {};
│   ├── spacing/
│   │   └── index.ts               # export {};
│   ├── typography/
│   │   └── index.ts               # export {};
│   └── effects/
│       └── index.ts               # export {};
└── utils/
    └── index.ts                   # export {};
```

## File Contents

All files export empty objects:

```typescript
// packages/core/src/config/tokens/index.ts
export * from './foundation';
export * from './utils';

// All other files:
export {};
```

## Recommendation

**DELETE** the entire `/config/tokens/` directory because:

1. **Empty implementation**: All files contain only `export {};` with no actual token definitions
2. **Superseded**: The new `/tokens/ts/` structure provides complete TypeScript mirrors of the CSS tokens
3. **Confusing duplication**: Having two token directories creates confusion about which is authoritative
4. **No dependencies**: These files export nothing, so no code depends on them

## Before Deletion

Verify no imports reference these files:

```bash
grep -r "from.*config/tokens" packages/core/src/
grep -r "from.*@.*config/tokens" packages/core/src/
```

**Result:** No files import from `config/tokens` directly. Only the CONFIG_TOKENS_REMOVAL.md file references it.

## Required Changes

The `/config/index.ts` exports from tokens:

```typescript
// packages/core/src/config/index.ts
export * from './tenants';
export * from './themes';
export * from './tokens';  // <-- Remove this line
```

The main `index.ts` re-exports config:

```typescript
// packages/core/src/index.ts
export * from './config';
```

**Action Required:**
1. Remove `export * from './tokens';` from `config/index.ts`
2. Delete the entire `config/tokens/` directory

Since the empty token files export nothing, removing them will not break any imports.

## New Token Import Paths

After deletion, all token imports should use:

```typescript
// TypeScript tokens
import { colors, spacing } from '@rottay/design-system/tokens';

// CSS tokens (in CSS files or via bundler)
@import '@rottay/design-system/tokens/css/index.css';
```

---

*Generated: 2025-12-27*
*Status: Pending deletion approval*
