# Testing, Docs, and Guardrails

## Overall View

This repo already has better-than-average audit scaffolding.

Strong pieces:

- `lint-folder-index.mjs`
- `audit-integration.mjs`
- `TAXONOMY.generated.md`
- provider-level `appearance` runtime tests

The problem is not absence of scaffolding. It is synchronization drift.

## Strong Today

### Structural hygiene

- `ui-design-system/packages/core/scripts/lint-folder-index.mjs`

### Integration honesty checks

- `ui-design-system/packages/core/scripts/audit-integration.mjs`

### Taxonomy generation

- `ui-design-system/packages/core/docs/TAXONOMY.generated.md`
- `ui-design-system/packages/core/scripts/generate-taxonomy.mjs`

### Runtime appearance tests

- `ui-design-system/packages/core/src/compilers/appearance/tests/appearance-runtime.test.tsx`

## Weak Today

### Stale docs

Most important examples:

- `ui-design-system/packages/core/docs/modern-customization-audit/README.md`
- `ui-design-system/packages/core/docs/audits/2026-04-11-full-ds-audit.md`
- `app-platform/src/config/tenant/index.ts`
- `ui-design-system/packages/core/docs/reference/contracts/README.md`

### Over-mocked integration tests

Example:

- `app-evnto/src/providers/__tests__/providers-boot.test.tsx`

This verifies that boot does not crash, but not the real DS provider contract.

### Guardrail blind spots

Current scripts still do not fully catch:

- `brandThemeId` without consumer
- `appearance` missing from static generator path
- app-owned tenant resolution bypasses in `app-platform`

## Scorecard

| Dimension | Score | Notes |
|---|---:|---|
| Documentation freshness | 5 | too many truth gaps remain |
| Contract honesty | 6 | better than before, still mixed |
| Test realism | 6 | some real provider tests, still too many mocked host tests |
| Guardrail coverage | 7 | useful but not yet broad enough |
| Taxonomy / folder hygiene | 8 | strong |
| Overall auditability | 6 | good structure, incomplete synchronization |

## Recommended Waves

### G1 - Docs Truth Pass

Update stale tracks and contract docs so they describe the actual live state.

### G2 - Contract / Authoring Convergence

Align docs, contracts, and app-platform whitelabel authoring around one tenant model.

### G3 - Static / Preview Parity

Bring preview and static generation in line with live runtime `appearance`.

### G4 - Guardrails + Test Realism

Add checks for:

- contract without consumer
- runtime/static divergence
- app-owned tenant bypasses
- overly mocked provider boot tests in critical hosts
