# Contracts - Rottay Design System

Public type contracts for the design system. These define the shapes that
consuming apps, runtime providers, and the brand compiler all agree on.

## Published data contracts

Package-readable JSON contracts live outside runtime source and are owned by
their producing capability:

```text
contracts/
  css/hooks/          Public CSS hooks plus the matching index.d.ts
  package/entrypoints/  Public subpaths and source-size ceilings
  runtime/suppliers/  Supplier reachability for every public entrypoint
  themes/canaries/    Tenant-theme compiler specimens plus index.d.ts
```

These files are published only through the explicit `package.json#files` and
`exports` entries. Generated files (`css/hooks`, `runtime/suppliers`,
`themes/canaries`) change through their producer. The package-entrypoint
contract and its size ceilings change only through the public-boundary gate's
explicit review path.

## Structure

```
foundation/contracts/
  kernel/
    common/           # Shared primitives and component mixins
    engine-identity/  # Supplier-neutral engine names
    product-profile-identity/ # Stable product-profile keys
    responsive/       # Breakpoint and adaptive-value contracts
    spatial/          # Data-only spatial scene vocabulary
    tokens/           # DesignTokens, personality and extension contracts
    verticals/        # Vertical and motion-profile vocabulary
  runtime/
    components/       # Cross-component runtime contracts
    effects/          # Effect policy contracts
    engine/           # Engine-aware runtime contracts
    errors/           # Runtime error vocabulary
    motion/           # Motion policy contracts
  composition/
    components/       # Backward-compatible component base types
    tenants/          # Tenant, product-profile and theme contracts
  index.ts            # Stable package-root aggregation surface
```

## Key Types

### Theme (code-owned premium visual source)

The single source of truth for premium visual identity. Merge precedence:
DS base -> vertical baseline -> Theme -> generated artifacts. Optional families
(`motion`, `charts`, `recipes`, `expressive`, `responsive`) travel as
`Governed<T>` slots, so a withheld capability carries a reason instead of
vanishing.

### FlatTheme (the lowering's read view)

`FlatTheme` is the flat projection the lowering's channel writers consume. It
is NOT an authoring surface and NOT a transport (WO-DER-08): an editor draft
travels as the governed `Theme` and is read once at the ingress door by
`readThemeDraft`. Two registered exceptions remain -- test/fixture material
still authored flat, and the superseded `serializeFlatTheme` /
`deserializeFlatTheme` window.

Published customer writes use the bounded `TenantThemeDocument` schema stored
in the canonical tenancy DB. They are validated and server-compiled into the
exact SSR/hydration artifact; neither shape is an unrestricted DB write
contract.

Categories: palette, typography, surfaces, motion, charts, chrome, engineBridge.

### TenantConfig (runtime/compat root)

Flat JSON-serializable tenant configuration. Holds identity (slug, name, plan,
features, locale, logos) plus compatibility visual fields. Published customer
visual authority comes from a compiled `TenantThemeDocument` artifact;
backward-compatible `brandTheme`, `branding`, `personality`, `appearance` and
`tokenOverrides` fields remain readable at compatibility boundaries.

### DesignTokens (resolved token graph)

Full resolved token set consumed by `useTokens()`. Includes colors, spacing,
typography, borderRadius, shadows, glass, gradients, surface, motion, and
personality dimensions.

### PersonalityTokens (5 visual dimensions)

Animation, chart, typography, accent, and card personality. These define the
"feel" of a product (formal, playful, expressive) independently of colors.

### Reserved compatibility surface

<!-- GAT07-CLAIM component-extensions: reserved-deprecated; runtime=unimplemented; affirmative-behavior=false; owner=DS-IMP-021 -->

GAT07-CONTRACT component-extensions: symbols=[ComponentExtensions, ExtensionHelpers, EngineAwareProps.extensions]; disposition=reserved-deprecated; runtime-status=unimplemented; affirmative-behavior=false; production-consumers=0; executable-assertions=0; owner=design-system-program/DS-IMP-021; target-phase=2A.

The generated contract above is authoritative. Prefer evidenced
component-owned props, compounds, and slots.

## Usage

All contracts are re-exported from the package root:

```typescript
import type { FlatTheme, TenantConfig, DesignTokens, EngineName } from '@rottay/design-system';
```

The governed `Theme` is not on that list: the package root re-exports the theme
contracts barrel, which owns `FlatTheme`, while `Theme` is published as a type
from the server entry.

```typescript
import type { Theme } from '@rottay/design-system/server';
```

A client host that only needs to name the brand-studio draft does not need
either import: the draft type travels with the component, as the root-published
`BrandStudioDraft` or as `ComponentProps<typeof PatternBrandStudio>['value']`.

### PatternBrandStudio.onChange: the declared break and its bridge (WO-DER-08)

`value` and `onChange` are the two directions of one contract and are not
classified together. `value` widened to `BrandStudioDraft` — additive. `onChange`
narrowed from `(next: FlatTheme) => void` to `(next: Theme) => void` — BREAKING:
a handler typed on the flat view stops compiling (TS2322). The release
declaration is `.changeset/der-08-studio-callback-governed-theme.md` (major).

The bridge is the door's own projection; no consumer writes a second lift.

```tsx
// BEFORE (2.19.x)
const legacy = (next: FlatTheme) => save(next);
<PatternBrandStudio vertical="bithire" value={draft} onChange={legacy} />;

// AFTER — the handler keeps its flat type; the wrapper projects once
import { PatternBrandStudio, projectThemeDraft } from '@rottay/design-system';

<PatternBrandStudio
  vertical="bithire"
  value={draft}
  onChange={(next) => legacy(projectThemeDraft(next))}
/>;
```

A handler that moves to the transport names the payload as `BrandStudioDraft`
or `ComponentProps<typeof PatternBrandStudio>['onChange']`. A stored flat draft
still opens as `value` (the superseded arm) or lifts once with `readThemeDraft`;
a file written by `serializeFlatTheme` is read by `deserializeThemeDraft`,
through that same single discriminant. Re-emitting `FlatTheme` from the studio,
or writing a second local discriminant to silence the type error, is refused:
the flat shape is the lowering's read view, not an authoring surface.

The migrated consumer is executed, not only documented, in
`tests/integration/consumer/brand-studio-callback-migration.test.tsx`,
which also pins with `@ts-expect-error` that the old signature is rejected at
compile time (`typecheck:tests`).

Primitive component props (ButtonProps, AvatarProps, etc.) live next to their
component implementations, not in this directory.
