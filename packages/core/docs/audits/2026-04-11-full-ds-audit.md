# Full Design System Audit — 2026-04-11

Scope: `packages/core/src` — contracts, compilers, runtime, hooks, tokens/CSS, Modern primitives, tests, scripts, docs.

## P1 — Must Fix

| # | Area | File | Line(s) | Finding |
|---|------|------|---------|---------|
| 1 | Tokens/CSS | `modern/theme.css` | 1318-1349 | **Collapse bridge references undefined tokens.** `--ds-collapse-bg`, `--ds-collapse-header-padding`, `--ds-collapse-header-font-weight`, `--ds-collapse-content-padding` are consumed in both DaisyUI selectors and `.rottay-collapse` bridge but never defined in `default.css` or `components/collapse.css`. Default.css defines `--ds-collapse-header-bg` / `--ds-collapse-content-bg` — name mismatch. |
| 2 | Tokens/CSS | `modern/theme.css` | 1922-1983 | **Tree bridge references 10+ undefined tokens.** `--ds-tree-bg`, `--ds-tree-node-padding`, `--ds-tree-icon-size`, `--ds-tree-icon-color`, `--ds-tree-switcher-size`, `--ds-tree-indent`, `--ds-tree-line-color`, `--ds-tree-line-width`, `--ds-tree-checkbox-margin`, `--ds-tree-node-color-disabled` — no `tree.css` component file exists. Bridge `.rottay-tree` also uses undefined `--ds-tree-bg`. |
| 3 | Primitives | `Button/engines/modern.tsx` | 286 | **Circle shape dimension hardcoded to 36.** When `sizeStyle.height` is a CSS var string, the fallback `36` is a magic number. Should use `var(--ds-button-md-height)`. |
| 4 | Primitives | `Select/engines/modern.tsx` | 283-284 | **Dropdown animation transform hardcoded.** `scale(0.98) translateY(-2px)` in keyframe CSS bypasses motion tokens. Should use `var(--ds-motion-scale-in)` / `var(--ds-motion-offset-in)`. |
| 5 | Primitives | `DatePicker/engines/modern.tsx` | 170, 181 | **Time picker select height is a plain number (28).** React treats numbers as pixels, but it's not themeable. Should be `'var(--ds-input-sm-height, 28px)'`. |
| 6 | Hooks | `hooks/tokens/index.ts` | 404 | **Memoization dep uses `config.appearance` (shallow ref).** If `appearance.general` changes without the appearance object reference changing, the memo won't re-run. Should use `config.appearance?.general?.density` explicitly. |

## P2 — Should Fix

| # | Area | File | Line(s) | Finding |
|---|------|------|---------|---------|
| 7 | Tokens/CSS | `modern/theme.css` | 2116-2150 | **Empty bridge references undefined `--ds-empty-icon-size`.** DaisyUI `.empty-*` selectors are dead; bridge `.rottay-empty` is OK but the DaisyUI section wastes CSS. |
| 8 | Tokens/CSS | `modern/theme.css` | 2213-2272 | **QRCode DaisyUI selectors reference undefined loading/status tokens** (`--ds-qrcode-loading-opacity`, `--ds-qrcode-loading-bg`). Bridge `.rottay-qrcode` is functional. |
| 9 | Tokens/CSS | Missing files | — | **No `tree.css` or `empty.css` component token files exist.** No `foundation/tokens/ts/runtime/components/tree/index.ts` or `empty.ts` TS mirrors either. Blocks type-safe token introspection. |
| 10 | Contracts | `appearance/index.ts` | 30-34 | **`--ds-radius-button` emitted by BUTTON_STYLE_RADIUS but no Modern primitive reads it.** The Button engine uses `var(--ds-button-md-radius)` not `var(--ds-radius-button)`. Dead emission. |
| 11 | Contracts | `themes/index.ts` | 275 | **BrandSidebarChrome over-exposed via Appearance Advanced.** Contract accepts full `Partial<BrandSidebarChrome>` (20 fields) but compiler only maps 7 fields. |
| 12 | Runtime | `SystemCssVariablesBridge.tsx` | 41 | **JSON.stringify(tokens) on every render for change detection.** Performance concern — should use shallow fingerprint like ThemeProvider does. |
| 13 | Runtime | `ThemeProvider.tsx` | 1049-1060 | **Verbose console.log in dev mode.** Safe (NODE_ENV gated) but should use DS logger utility for consistency. |
| 14 | Hooks | `hooks/index.ts` | 11-14 | **JSDoc misclassifies useVoiceInput as "core-integrated".** VoiceInputButton is a DS primitive, but voice input is closer to app-facing utility. |
| 15 | Hooks | `hooks/tokens/index.ts` | 207-213 | **Appearance density factor behavior undocumented.** It's multiplicative (compounds with BrandTheme densityScale), but no comment explains this. |
| 16 | Hooks | `hooks/commands/useCommandPaletteItems` | — | **Not re-exported from commands/index.ts barrel.** Only exported from hooks/index.ts. Inconsistent with other command hooks. |
| 17 | Hooks | Compat shims | Multiple | **Deprecation messages lack new import path examples.** `@deprecated` says "moved" but doesn't show `import { useTheme } from '@rottay/design-system'`. |
| 18 | Primitives | `Select/engines/modern.tsx` | 174 | **Dropdown gap hardcoded to 4px.** Should use `var(--ds-spacing-1, 4px)`. |
| 19 | Primitives | `Select/engines/modern.tsx` | 654-713 | **Multi-select badge dimensions hardcoded.** Gap, padding, fontSize, lineHeight all px. |
| 20 | Primitives | `Toggle/engines/modern.tsx` | 105, 118 | **Transition timing hardcoded to 200ms ease-out.** Should use `var(--ds-motion-base)`. |
| 21 | Primitives | `Toggle/engines/modern.tsx` | 151, 156 | **Label font sizes hardcoded as numbers (14, 12).** Should use `var(--ds-font-size-sm/xs)`. |
| 22 | Primitives | `Spinner/engines/modern.tsx` | 109 | **Animation speed hardcoded to 0.6s.** Should use `var(--ds-motion-slow)`. |
| 23 | Primitives | `Input/engines/modern.tsx` | 176-177 | **Clear button dimensions hardcoded to 20px.** Should use `var(--ds-icon-size-sm, 20px)`. |
| 24 | Primitives | `DatePicker/engines/modern.tsx` | 827, 831 | **Calendar clear button positions hardcoded (28, 10).** Should use spacing tokens. |
| 25 | Primitives | `Button/engines/modern.tsx` | 310, 429 | **Icon-to-text gap hardcoded to 6px.** Should use `var(--ds-spacing-2)`. |

## P3 — Nice to Have

| # | Area | File | Line(s) | Finding |
|---|------|------|---------|---------|
| 26 | Tokens/CSS | `modern/theme.css` | Multiple | **~90 lines of dead DaisyUI selectors** for `.collapse-*`, `.tree-*`, `.empty-*`, `.qrcode-*`. Modern engine emits `.rottay-*` classes, not these. Remove to reduce CSS bundle. |
| 27 | Runtime | `DesignSystemProvider.tsx` | 252-265 | **Stale comment references "personality" without BrandTheme context.** Still accurate but could be clearer. |
| 28 | Runtime | `factory.tsx` | 102-106, 131, 161 | **`any` type assertions in engine factory.** Pragmatic but undocumented. |
| 29 | Runtime | `ResponsiveProvider.tsx` | 172-179 | **Legacy Safari <14 addListener/removeListener fallback.** Not a bug, maintenance note. |
| 30 | Primitives | `Spinner/engines/modern.tsx` | 115 | **Label font size hardcoded to 14.** Minor. |
| 31 | Primitives | `Input/engines/modern.tsx` | 402-412 | **Count/error text sizes hardcoded (12px, 16px, 4px).** Minor. |
| 32 | Hooks | `hooks/index.ts` | 136-137 | **Engine hooks comment path vague.** "Exported from src/engines/" — could be clearer. |
| 33 | Hooks | `hooks/commands/useCommandPaletteItems` | 34 | **Hard coupling to components/patterns path for CommandItem type.** Could move type to shared location. |

## Verified OK (No Issues)

| Area | What was checked | Status |
|------|-----------------|--------|
| Merge chain comments | `tenants/index.ts`, `themes/index.ts` | Accurate |
| Token type exports | `foundation/contracts/kernel/tokens/` | All consumed, no orphans |
| Color-math sharing | `infrastructure/compilers/kernel/foundation/css/color-math/` | Dual consumer (ThemeProvider + generator), no drift |
| gridOpacity non-emission | `brand-theme/index.ts` | Intentional, documented |
| Provider composition order | `DesignSystemProvider.tsx` | Correct sequence |
| BrandTheme normalization | `DesignSystemProvider.tsx` | Sound logic |
| Appearance precedence | `DesignSystemProvider.tsx` | Correct hierarchy |
| Feature provider | `FeatureProvider.tsx` | Clean, no issues |
| Bundled tenant detection | `tenant/registry/` | Accurate |
| Product profile registry | 5 profiles complete | Consistent |
| Personality resolution | `personality/primitives.ts` | Correct bounds checking |
| Custom engine packs | `engines/custom.ts` | Well-architected |
| Antd config bridge | `AntdConfigProvider.tsx` | Handles all cases |
| CSS layer order | `entrypoints/styles.css` | Correct |
| Artifact alignment | rottay/bithire/evnto | Current, properly structured |
| All lint scripts | `lint-folder-index`, `audit-integration` | Passing, rules working |
| Docs accuracy | `modern-customization-audit/*` | Truthful, wave table current |
| Premium track docs | `premium-styling-track/README.md` | 21 waves tracked, all complete |
| Test imports (5 random) | brand-compiler, commands, appearance-runtime, Box, compat/theme | All valid |
| Package.json scripts | lint:folders, lint:integration, test | All correct |
| Stale contract comments | Entire foundation/contracts/ | Zero found |

## Recommended Fix Order

1. **P1 #1-2**: Create `tree.css` + fix collapse token names in `modern/theme.css` (biggest gap)
2. **P1 #3-5**: Fix hardcoded magic numbers in Button/Select/DatePicker
3. **P1 #6**: Tighten useTokens memo dep
4. **P2 #10**: Either wire `--ds-radius-button` to Button engine or remove emission
5. **P2 #12**: Replace JSON.stringify with shallow fingerprint in bridge
6. **P2 #26 (P3)**: Remove dead DaisyUI selectors from theme.css
7. Remaining P2s: batch as one cleanup pass
8. P3s: optional polish
