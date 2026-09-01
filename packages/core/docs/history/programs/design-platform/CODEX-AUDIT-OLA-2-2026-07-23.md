# Codex audit — OLA 2 / DS-S001

Date: 2026-07-23
Auditor: Codex
Scope: Claude handoff “OLA 2 — Codex decide aceptación”
Repository state: dirty worktree preserved; no commit, push, PR or stash mutation

## Verdict

- **Phase 1 engineering nucleus: accepted after Codex remediation.**
- **DS-S001 ticket: not closed yet.** The exact production-rendered DS-Q001L
  visual matrix remains required.
- Certified program counts remain **14/92 (15.2%)** and **14/119 (11.8%)**.
  Passing this audit does not certify another public artifact.

## Material inaccuracies in the handoff

1. `SurfaceSectionCard` did exist and was already publicly exported from
   `ui/surfaces/runtime/helpers/rendering`; it was not a fictitious future
   family.
2. `RecipeProfileProvider` was not mounted by `DesignSystemProvider`, so the
   claimed static/DB production runtime loop was incomplete.
3. DB `recipeProfile` was omitted by `normalizeAppearance`; a compiled DB
   document could not reach the runtime selection path.
4. `TenantAppearance` did not expose `recipeProfile`, so the DB-owned
   appearance path could not express the selection consumed by production.
5. `RecipeProfileId` widened to `string` because the registry annotation erased
   its literal ids.
6. Tag did not consume profile defaults, DataTable ignored profile density and
   the same-tree test covered only Button and Card.
7. The public manifest omitted the real SectionCard family and had incomplete
   Tag axes.
8. The claim that `engine-token-audit` remained red because of ten pre-existing
   regressions was false. The canonical pretest now reports:
   `engine-token-audit --check OK (3227 counters...)`.

## Codex remediation

- preserved literal, namespaced `RecipeProfileId` values and added the real
  `sectionCard` family to both governed profiles;
- completed opposing defaults for Button, Card, Tabs, Tag, SectionCard and
  DataTable;
- carried the DB selection through schema, normalized Appearance, artifact CSS
  and production runtime;
- mounted the recipe provider inside `DesignSystemProvider` with documented
  precedence: DB Appearance over static BrandTheme;
- kept explicit component/application props sovereign over profile defaults;
- connected Tag radius/border/outline, Button size, DataTable density/recipe
  and SurfaceSectionCard variant;
- published the provider, registry, validation and manifest from the package
  barrel and regenerated the supplier contract;
- added a closed sanitizer exception only for the exact compiler-generated,
  registry-validated `--ds-recipe-profile` declaration;
- updated the immutable DB schema digests;
- added production-provider, static-vs-DB, fail-closed, manifest, same-tree and
  six-family focused tests.

## Evidence

| Gate | Result |
|---|---:|
| Focused DS-S001/compiler/provider/family suite | 73/73 pass |
| Recipe engine/profile/manifest suite | 11/11 pass |
| Source-governance suite | 41/41 pass |
| TypeScript typecheck | pass |
| Full package pretest | pass |
| `engine-token-audit --check` | pass |
| Core production build | pass |
| Showroom production build | pass, 301 static pages |
| Baselines widened | none |
| Dependencies added/removed | none |

The first focused run correctly failed on an unsafe DB channel and stale schema
digests. Codex fixed the causes and reran the suite green; no snapshot or
baseline was relaxed.

## Remaining exit work

1. Build the exact DS-Q001L production specimen using one identical tree for
   the six families.
2. Capture opposing static technical/radius-zero and DB editorial/rounded
   profiles across EN, ES and AR/RTL; desktop, tablet and mobile; normal and
   reduced motion; interaction and content-stress states.
3. Assert DOM parity, computed-style divergence, focus/touch behavior and no
   overflow, overlap, clipping or illegible contrast.
4. Only after that evidence may Codex close DS-S001 or raise certified counts.
5. DS-A004 material-channel debt, the Modern/Daisy projection and the
   application boundary ratchet remain separate later phases.

The optional React Aria/Base UI bake-off is **not part of the next execution
wave** and must not add either supplier without a separately authorized
DS-S002 experiment.
