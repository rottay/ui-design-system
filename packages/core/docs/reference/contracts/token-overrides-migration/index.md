# Migrating stored `tokenOverrides` (the retiring raw escape)

Owner ruling R32 Q2 (2026-10-04) retires the raw `--ds-*` escape in every
document door, v1 included, with an explicit refusal and a documented,
idempotent migration of persisted data. Nothing is dropped silently.

**Current state.**
- The capability `token-overrides` is `retiring` in the tenant capability registry.
- The v2 and v3 decision documents refuse it by name (`THEME_CATALOG_RETIRED`, raw `--ds-*` authorship retired by D-03).
- A stored v1 row is still read: backward-compatible admission is preserved (D-C).
- Every v1 admission carries one named deprecation notice per entry (below).

**This migration is documented, not executed.** No row is rewritten by the
design system, and it does not touch application data.

## What a stored document carrying `tokenOverrides` reads as

A v1 `TenantThemeConfig` (`schemaVersion: 1`, `mode: "advanced"`) may carry `visualFoundation.advanced.tokenOverrides`:

- **Shape:** a map of `--ds-*` names to a string or number.
- **Admission:**
  - closed to `TENANT_THEME_OVERRIDE_TOKENS` (292 names);
  - at most 200 entries;
  - value-checked per token (`TENANT_THEME_TOKEN_VALUE_RULES`);
  - gated by the vertical envelope's `advanced.allowTokenOverrides`.
- **Reading it today:**
  - the v1 door admits and lowers every entry into the Theme exactly as before;
  - the compiled `TenantThemeArtifact` keeps the same digest, CSS and variables;
  - the artifact gains `deprecations`, one `TenantThemeDeprecationNotice` per admitted entry: `{ code: "retiring-capability", capability: "token-overrides", path, ruling, message }`, at the entry's own path (`visualFoundation.advanced.tokenOverrides["--ds-radius-md"]`);
  - the field is outside the digest, so a stored artifact verifies unchanged;
  - a v1 row without the field carries no notice and no field.

## The mapping: the canonical homes

The migration tool is `foldRawTokenOverrides`, exported from `@rottay/design-system/server`:
- it is **pure and idempotent** (its own output reads `unchanged`);
- it is **all-or-nothing**: `migrated` only when every entry folds or is resolved, otherwise `blocked` with the input untouched;
- it reports every entry exactly once.

A raw value folds only into a decision whose domain admits it verbatim. Eleven of the 292 admitted tokens have a canonical home:

| Raw token | Decision | Folds into |
| --- | --- | --- |
| `--ds-color-primary` | `palette.seeds` | `visualFoundation.general.palette.primary` |
| `--ds-color-secondary` | `palette.seeds` | `visualFoundation.general.palette.secondary` |
| `--ds-color-accent` | `palette.seeds` | `visualFoundation.general.palette.accent` |
| `--ds-color-bg`, `--ds-color-bg-primary`, `--ds-color-background` | `palette.seeds` | `visualFoundation.general.palette.background` (two that disagree are reported `ambiguous`) |
| `--ds-color-success` | `palette.status-seeds` | `visualFoundation.general.palette.status.success` |
| `--ds-color-warning` | `palette.status-seeds` | `visualFoundation.general.palette.status.warning` |
| `--ds-color-error` | `palette.status-seeds` | `visualFoundation.general.palette.status.error` |
| `--ds-color-info` | `palette.status-seeds` | `visualFoundation.general.palette.status.info` |
| `--ds-effect-intensity` | `surfaces.effect-intensity` | `visualFoundation.general.surfaces.effectIntensity` |

**Rules:**
- A raw value that replaces a different authored `general` value is reported `folded-over-general`, with the replaced value kept in the report.
- Nothing else moves.

## The unhomed tokens

The other 281 tokens have no canonical home yet. The classes are the tool's own (`unrepresentableReason`):

| Class | Count | Meaning |
| --- | --- | --- |
| leaf without a decision | 265 | the token writes a Theme leaf that no catalog decision owns: radii, shadows, line-heights, letter-spacings, glass, gradients, overlays, chart categories and the rest |
| no own leaf | 12 | the v1 lowering collects the token into a list (the chart categories), so no single leaf owns it |
| closed domain | 4 | `typography.families` admits a registered font pack, never a free font stack |

**What an unhomed entry needs.** Per R32 Q2, the migration of a row is complete only when every unhomed entry has a ruled resolution. The tool accepts these per entry, each with a required note:

- **a canonical home:** a new decision or a sanctioned `overrides.chrome.<family>.<channel>` override;
- **`replace`:** a caller-authored `general` or `advanced.chrome` fragment;
- **`accept-loss`:** a named, noted removal, never a silent one.

An off-allowlist entry blocks the row as `off-allowlist`.

## When the retirement executes

The v1 door refuses `tokenOverrides` by name only when two things are true:
- every stored row reaches `migrated`, measured by the data owner with the tool above;
- no application authors the field any longer.

Then the capability leaves the registry, and its `retiring` status, the notice and this page retire with it.
