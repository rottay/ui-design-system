# Design System Audit

Score: `7.4/10`

## What is strong

### Runtime bootstrap is finally credible

`DesignSystemProvider` is now the strongest part of the system:

- merge precedence is explicit
- `brandTheme` normalization is coherent
- `appearance` layers in a technically defensible order

The best evidence is in:

- `src/runtime/bootstrap/DesignSystemProvider.tsx`
- `src/runtime/tenant/storage/static/generator/index.ts`
- `src/compilers/appearance/tests/appearance-runtime.test.tsx`

### The client bridge that used to break `appearance` is fixed

`useTenantBranding` now preserves `data.appearance` into `TenantConfig.appearance`.

That turns the client runtime path from “silently discarding the canonical contract” into a real bridge.

### High-visibility closures are real

`Statistic` and `CommandPalette` are now good examples of actual closure:

- token/bridge story materially improved
- accessibility materially improved

## Premium blockers

### P1. DB tenant first paint is still legacy-skewed

`useTenantBranding` still builds its instant session config from `whitelabelBranding` colors/logo only.

That means DB tenants can still first-paint in a smaller/older visual contract before the async branding fetch lands.

Relevant file:

- `src/hooks/tenant/branding/useTenantBranding/index.ts`

### P1. Preview and authoring are still on the wrong conceptual model

`TenantPreviewProps` still accepts `TenantCreationConfig`, and `create-tenant.ts` still frames authoring around:

- `primaryColor`
- `secondaryColor`
- `personality`
- density-derived overrides

rather than a canonical `appearance.general` / bounded `appearance.advanced` authoring model.

Relevant files:

- `src/components/patterns/misc/tenant-preview/TenantPreview.types.ts`
- `src/runtime/tenant/authoring/create-tenant.ts`

### P1. `TenantPreview` still cheats

The preview still renders hand-built HTML samples for:

- buttons
- cards
- inputs
- badges

instead of real DS primitives/patterns.

That means the preview is not a trustworthy proxy for the actual system it is previewing.

Relevant file:

- `src/components/patterns/misc/tenant-preview/engines/modern.tsx`

### P1. `AppShell` mobile drawer is not yet modal-grade

The mobile drawer opens a fixed `aside` with a backdrop, but it still lacks:

- dialog semantics
- Escape close
- focus return
- stronger focus containment

Relevant file:

- `src/components/structures/shell/index.tsx`

### P2. `Descriptions.Modern` is still hybrid

`Descriptions` improved, but it still mixes:

- bridge classes
- Tailwind utility layout
- generic text tokens

instead of letting a clean Descriptions-specific surface drive the renderer.

Relevant file:

- `src/components/primitives/display/Descriptions/engines/modern.tsx`

### P2. `DataTable` still has a mouse-only advanced interaction

Column reorder still depends on a grip with:

- `role="button"`
- no `tabIndex`
- no keyboard handler

Relevant file:

- `src/components/patterns/data/data-table/engines/modern.tsx`

### P2. Guardrails are still below sign-off strength

Current guardrails are useful, but too shallow:

- small token fidelity matrix
- mostly static string-count assertions
- tenancy boundary tests that prove presence more than behavior

Relevant files:

- `src/_internal/testing/system/tests/token-fidelity.test.ts`
- `src/_internal/testing/system/tests/host-tenancy-boundary.test.ts`
- `scripts/audit-integration.mjs`

### P2. Some rubric docs still encode old truth

Several older rubric files still talk about `brandThemeId` and `appearance` parity as if the program were at a different state than the current runtime.

Relevant files:

- `docs/galactic-integration-rubric/08-premium-customization-and-appearance.md`
- `docs/galactic-integration-rubric/03-runtime-and-tenancy.md`

## DS conclusion

The DS is no longer the main systemic blocker.

It is now:

- good enough to support serious product work
- much more honest than before
- still short of premium-final because preview/authoring truth, first paint, shell hardening, and behavior guardrails are not fully closed

