# Codex Audit — OLA 4 — 2026-07-23

Status: independently audited and remediated; no commit made.

## Verdict

OLA 4 is **accepted as an architectural foundation after Codex remediation**,
with one important boundary:

- Phase 2 is accepted for the public semantic-surface owner and the honest
  reduction of the tenant-channel baseline from 355 to 236.
- Phase 3 is accepted for one exact DaisyUI 5.5.19 projection authority.
- Phase 4 is accepted only as a **private-anatomy sub-gate**. It is not yet the
  complete application-boundary gate described by DS-Q006.
- No primitive or platform certification count changes in this audit.
  Certified quality remains 14/92 public primitives (15.2%) and 14/119 total
  artifacts (11.8%).

The original handoff materially overstated accessibility, test coverage and
the breadth of the application boundary. Those defects were corrected before
this acceptance.

## Canonical vocabulary

The public name introduced in the handoff, `MaterialSurface`, was ambiguous
with Google's Material UI and did not describe the contract precisely. The
canonical public vocabulary is now:

- `SemanticSurface`;
- `SemanticSurfaceSupport`;
- `surfaceRole`;
- `SemanticSurfaceRole`;
- `SemanticSurfaceRoleTokens`;
- `SemanticSurfaceRoleMap`;
- `BrandSurfaces.surfaceRoles`;
- `semanticSurfaceRolesToCssVariables()`.

No Material UI dependency was installed. DaisyUI remains an internal Modern
implementation bridge pinned to 5.5.19; it is not a public tenant, product or
component authority.

The old `SemanticMaterial*`, `BrandSurfaces.materials` and
`semanticMaterialsToCssVariables()` names remain only as explicitly deprecated
schema-v1 compatibility aliases for one migration cycle. The existing
`--ds-material-*` CSS prefix is likewise an internal compatibility channel,
not public product vocabulary. Renaming that persisted schema requires a
versioned migration and must not be done as an untracked search-and-replace.

## Findings in Claude's delivery

1. `interactive` created a tab stop on a `div` without a native action, role or
   keyboard contract.
2. The focused CSS test did not reject hardcoded `rgba()` paint.
3. A comma-separated CSS composition ending in `none` could invalidate the
   complete declaration.
4. Support-copy selectors were not bounded to the intended surface child.
5. The delivery had no deterministic same-tree static-vs-DB inspection route
   for the new primitive.
6. The Daisy projection still had two runtime writers:
   CSS projection plus `ThemeProvider` inline Daisy variables.
7. Generated vertical sources still declared supplier variables, creating a
   second theme authority.
8. The proposed application-boundary census was non-recursive, counted
   comments and only detected private anatomy. It did not prove the full
   boundary promised by the phase.
9. The claimed BitHire canary changed one selector but did not prove that the
   new semantic-surface contract caused an application improvement.
10. Static/DB, high-contrast, locale, RTL and live interaction evidence was
    incomplete or inherited from unrelated suites.

## Remediation performed by Codex

### Public semantic surface

- Replaced `MaterialSurface` with `SemanticSurface`.
- Made `interactive` visual-only; it no longer fabricates accessibility
  semantics.
- Added the native `as="button"` path with `type="button"`, disabled handling
  and native keyboard behavior.
- Bound support copy to the intended child relationship.
- Separated highlight and focus pseudo-elements.
- Covered hover, active, selected, dragging, loading, disabled, reduced-motion
  and forced-colors states.
- Rejected raw hex, RGB(A), HSL(A) and OKLCH paint in the component stylesheet.

### Theme and supplier authority

- Removed the runtime Daisy variable writer from `ThemeProvider`.
- Removed the Daisy compiler from the public theming facade.
- Removed direct supplier-variable declarations from generated vertical
  sources and regenerated their artifacts.
- Strengthened the executable Daisy projection contract so it proves the exact
  supported set for 5.5.19 and rejects additional runtime/public writers.

### Application boundary

- Made the gate recursive and comment-insensitive.
- Named it honestly as the private-anatomy sub-gate.
- Added public `data-part` slots where the application had a legitimate
  composition need.
- Migrated four real BitHire private reaches to those public slots.
- Reduced the measured private-anatomy baseline from 51 distinct reaches to
  47, with 165 total sites remaining.

This does not yet detect every native reconstruction, shared-chrome literal,
undocumented custom property or behavior fork required by the complete
DS-Q006 boundary.

### Deterministic inspection specimen

The Showroom route now renders the same real DS tree under:

- BitHire from static `BrandTheme`;
- The Management Miami from DB-shaped `appearance`;
- English, Spanish and Arabic;
- LTR and RTL;
- all eight semantic surface roles;
- a native `SemanticSurface` button.

Route:

```text
/probe/brand-locale-evidence?fixture=<bithire|themanagementmiami>&locale=<en|es|ar>
```

## Serial verification

All aggregate commands were run one at a time.

- semantic-surface, compiler and torture-tenant focused tests: 17/17 pass;
- semantic-surface focused contract: 5/5 pass;
- Daisy projection contract: 5/5 pass;
- tenant-channel gate: 1,615 inventoried, 236 acknowledged dead, zero new or
  revived dead channels;
- application private-anatomy gate: 165 sites / 47 distinct, zero new reaches;
- engine token audit: pass with 3,232 counters; 1,026 existing hardcoded values
  and six existing APCA exceptions remain visible;
- core typecheck: pass;
- core pretest: pass;
- core build: pass;
- Showroom typecheck: pass.

The core build still emits pre-existing Vite named/default export warnings.
They were not introduced or hidden by this audit.

## Browser evidence sighted by Codex

The in-app browser inspected one reused audit tab.

### BitHire — static — Spanish — LTR

- source marker: `SOURCE:STATIC`;
- base font: Public Sans;
- heading font: Space Grotesk;
- root background: `rgb(243, 242, 239)`;
- semantic card radius: `10px`;
- blue/neutral surface edge and shadow treatment.

### The Management Miami — DB — English — LTR

- source marker: `SOURCE:DB`;
- base font: Optima;
- heading font: Fraunces;
- root background: `rgb(251, 243, 231)`;
- semantic card radius: `6.08px`;
- warm canvas, teal edge and a visibly different surface/shadow treatment.

### The Management Miami — DB — Arabic — RTL

- Arabic content and the localized heading
  `أدوار الأسطح الدلالية` rendered;
- runtime direction was RTL;
- document and body width remained 1,280px with no horizontal overflow;
- inspected tabs and actions stayed within the viewport.

The native semantic-surface action rendered as `BUTTON` with
`type="button"` and responded to Enter. Manual mobile, forced-colors and
reduced-motion rendering could not be emulated by the current in-app browser
surface in this pass. Their code contracts exist, but they are not claimed as
manual visual evidence here.

## Remaining debt and next owners

1. Complete DS-Q006 beyond the private-anatomy sub-gate.
2. Prove dark and high-contrast semantic-surface relationships visually.
3. Migrate real product composition to the public contract; token reads alone
   are not broad adoption.
4. Keep shrinking the 236 acknowledged dead tenant channels.
5. Drain the 1,026 hardcoded-value baseline and six APCA exceptions by owner,
   never by suppressing the gate.
6. Add a repeatable mobile/coarse-pointer visual evidence path.
7. Continue P0 DS quality work through typography, density, motion and central
   primitive recipes before broad BitHire page polish.

## Worktree safety

The pre-existing dirty worktree and stash were preserved. No commit, push, PR,
publish, reset, checkout or snapshot acceptance was performed.
