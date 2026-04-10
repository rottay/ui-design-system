# Claude Master Prompt: Implementation Waves

Wave H5 deliverable. Final prompt and implementation order for the
I-wave code track. This file is the handoff from documentation to
implementation.

## Prerequisites

All documentation waves must be approved before implementation begins:

- H0: Glossary and safety net -- APPROVED
- H1: Target taxonomy -- APPROVED
- H2: Customization model -- APPROVED
- H3: Premium contract parity -- APPROVED
- H4: Vertical style briefs -- APPROVED
- H5: Master prompt -- THIS WAVE

## Canonical References

Read in this order before any implementation wave:

1. `00-glossary.md` -- frozen vocabulary
2. `00-current-role-map.md` -- current tree by role
3. `01-target-taxonomy.md` -- target tree + naming rules
4. `02-customization-model.md` -- vertical theme vs tenant appearance
5. `03-premium-contract-parity.md` -- minimum contract + gap matrix
6. `04-vertical-style-briefs.md` -- per-vertical directions

## Non-Negotiable Invariants

1. No push until Codex approves
2. Stop after every wave for audit
3. Do not weaken existing premium coverage
4. Preserve `--ds-*` as canonical namespace
5. Do not blur authored source, mirrors, artifacts, entrypoints, legacy
6. Do not flatten all customization into one tenant payload
7. Every checkpoint must be deployable
8. Use frozen vocabulary exactly

## Implementation Wave Order

### Wave I0 — Inventory And Test Net

**Goal:** Protect current outputs before any moves.

**Scope:**
- Verify all public CSS exports produce valid output
- Verify all first-party tenant artifacts are intact
- Verify brand-compiler tests cover the contract parity categories
- Add any missing regression tests for areas I1-I7 will touch

**Touches:** Tests only. No source moves, no renames.

**Verification:** All existing + new tests pass. DS typecheck + build.

### Wave I1 — Token Taxonomy Cleanup

**Goal:** Make the physical tree match the target taxonomy from H1.

**Scope:**
- `ts/tenants/` -> `ts/mirrors/` (rename + barrel update)
- `css/tenants/` -> `css/artifacts/` (first-party snapshots)
- Root CSS files -> `css/entrypoints/` grouping
- `css/base/`, `css/themes/`, etc. -> `css/foundation/` grouping
- `themanagementmiami` -> `css/legacy/`
- Remove `index-all.css`
- Update `package.json` exports to point to new internal paths
- Update build scripts (`build-vertical-css.mjs`, etc.)
- Compat shims where needed

**Touches:** File moves, barrel updates, build scripts, package.json.
No visual changes, no contract changes.

**Verification:** DS typecheck + build. All public exports still work.
app-platform typecheck. lint:folders passes.

### Wave I2 — Customization Model Scaffolding

**Goal:** Introduce the docs-aligned model in code and contracts.

**Scope:**
- Introduce `VerticalTheme` type (extends or replaces `BrandTheme`)
- Introduce `TenantAppearanceGeneral` and `TenantAppearanceAdvanced` types
- Update `TenantConfig` to reference the new types
- Update brand-compiler bridge functions for the new types
- Preserve backward compatibility with existing `brandTheme` field

**Touches:** contracts/themes, contracts/tenants, brand-compiler.
No visual changes.

**Verification:** DS typecheck + build. app-platform typecheck.
Brand-compiler tests pass.

### Wave I3 — Parity Normalization

**Goal:** Ensure all three first-party themes express the full minimum
contract from H3, without changing visual direction yet.

**Scope:**
- Fill missing fields in all three BrandTheme sources with
  contract-compliant values
- Surfaces: add borderRadius, shadows, glass/gradient/overlay philosophy
- Controls: complete buttonDefault, buttonGhost, input where missing
- Layout + shell: add to bithire and evnto
- Table: complete evnto table metadata
- Palette: add semantic colors to rottay and evnto
- Dark-mode: add authored baseline for all three
- State semantics: add baseline for all three

**Touches:** brand-themes/*.ts, brand-compiler tests.

**Verification:** DS typecheck + build. Premium parity tests pass for
all contract categories across all three verticals.

### Wave I4 — Rottay Overhaul

**Goal:** Push rottay toward the dark AI/security premium direction.

**Scope:** Apply the H4 rottay brief to the authored source.
- Palette: graphite + cobalt/cyan, muted status tones
- Typography: strong sans + mono
- Motion: controlled spring
- Chrome: command-surface sidebar, graphite header, subtle shell
- Controls: sharper, high-contrast, austere

**Touches:** brand-themes/rottay.ts, possibly tokens/css/artifacts/rottay/.

**Verification:** DS build. Regression tests confirm no contract loss.
Visual review via Storybook.

### Wave I5 — BitHire Overhaul

**Goal:** Push bithire toward premium recruiting trust.

**Scope:** Apply the H4 bithire brief.
- Palette: blue family, structured neutrals
- Typography: clean, efficient
- Motion: low amplitude, reliable
- Chrome: softer radii, trustworthy tables, better sidebar rhythm
- Controls: refined, calm

**Touches:** brand-themes/bithire.ts, possibly tokens/css/artifacts/bithire/.

**Verification:** Same as I4.

### Wave I6 — Evnto Overhaul

**Goal:** Push evnto toward premium wallet/fintech.

**Scope:** Apply the H4 evnto brief.
- Palette: white + charcoal, financial green
- Typography: clean, numeric-friendly
- Motion: smooth spring, reassuring
- Chrome: largest radii, card-stack, tactile
- Controls: soft curves, money-state feedback

**Touches:** brand-themes/evnto.ts, possibly tokens/css/artifacts/evnto/.

**Verification:** Same as I4.

### Wave I7 — Final Cleanup And Guardrails

**Goal:** Docs, lint, taxonomy closeout.

**Scope:**
- Update all docs to reflect final state
- Extend lint:folders for new boundaries
- Update ARCHITECTURE.md and CLAUDE.md
- Update docs-engineering references
- Final taxonomy verification

**Touches:** Docs, lint scripts, CLAUDE.md.

**Verification:** DS typecheck + build. lint:folders. All tests.

## STOP Format Reminder

Every wave must deliver the format from `00-stop-template.md`:
commit hash, files changed, decisions taken, deferred items,
verification, Codex audit request.
