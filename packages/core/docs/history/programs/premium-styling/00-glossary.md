# Glossary And Source-Of-Truth Model

Frozen vocabulary for the premium styling track (H0-H5, I0-I7).
If any other document uses these terms differently, this file wins.

## Canonical Terms

### Authored Source

The human-authored source of premium visual identity.

Location: `foundation/tokens/ts/presentation/brand-themes/`

Examples: `platform/index.ts`, `bithire/index.ts`, `evnto/index.ts`

### Vertical Theme

The full code-owned premium identity for a vertical or first-party product.
This is where the deepest styling decisions belong. It can carry hundreds of
choices: palette, typography, surfaces, motion, charts, chrome, dark-mode
strategy, component family policies.

### Tenant Appearance

The tenant-specific appearance layer applied on top of the vertical theme.
NOT one undifferentiated payload. Split into two explicit tiers:

### Tenant Appearance: General

Safe, high-signal, high-visibility customization for most tenant admins.

Examples: primary/secondary/accent colors, font family, radius scale, density,
logo/media, surface tone presets, button/card/sidebar tone presets,
light/dark preference, chart color family.

Principle: visible in screenshots, understandable by a non-designer, hard to break.

### Tenant Appearance: Advanced

Expert-level, fine-grained customization for guarded use cases.

Examples: exact sidebar values, header/backdrop values, shell/grid treatment,
per-control hover/active/focus states, table header/row styling, motion
tuning, chart behavior, dark-mode overrides, allowlisted raw token overrides.

Principle: role-gated, validated, previewed, reversible, audited.

### Mirror

A typed catalog of already-existing CSS variable handles (`var(--ds-*)`).
Useful for discovery and code ergonomics.

Current location: `foundation/tokens/ts/runtime/mirrors/`

A mirror is NOT authored premium source.

### Artifact

A generated or emitted CSS output consumed by runtime or package users.
Not the primary authored source.

Examples: `foundation/tokens/css/facade/artifacts/rottay/index.css`, `bithire/index.css`, `evnto/index.css`

### Public Entrypoint

A CSS or JS file that exists because it is part of the public package contract.

Examples: `foundation/tokens/css/facade/entrypoints/platform.css`, `bithire.css`, `evnto.css`,
`package.json` style exports (`./styles/*`)

### Compatibility Shim

A file or export kept only to avoid breaking callers during migration.
Must be named honestly, documented as compatibility, and thin.

### Legacy Tenant

A bundled or shipped tenant that is not part of the canonical first-party
premium trio and should not distort the core taxonomy story.

There is no current checked-in customer tenant example. `themanagementmiami`
is DB-owned; its TypeScript fixture exists only to prove the runtime compiler
and must never become an artifact, registry entry, or public bundle.

## Source-Of-Truth Hierarchy

1. Authored source
2. Mirrors
3. Generated artifacts
4. Public entrypoints
5. Compatibility and legacy

## Merge Chain

```
DS base
  -> vertical baseline
    -> Vertical Theme
      -> Tenant Appearance: General
        -> Tenant Appearance: Advanced
          -> runtime safety normalization
            -> generated artifacts / applied CSS
```

## Ownership Matrix

### Code-Owned (keep in code)

- DS base tokens
- Vertical baseline and vertical theme
- Engine bridging
- Premium motion philosophy
- Dark-mode authored strategy
- Component family policies

### DB-Owned: General (safe to expose)

- Major colors (primary, secondary, accent)
- Font family choices
- Density scale
- Shape / radius scale
- Logo / media
- Preset-level button/card/sidebar tone

### DB-Owned: Advanced (expose carefully)

- Chrome sidebar/layout/shell details
- Control hover/active/focus tuning
- Table tuning
- Chart tuning
- Dark-mode overrides
- Allowlisted raw token overrides
