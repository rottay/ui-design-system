# Codex Independent Audit Protocol

Status: acceptance authority
Auditor: Codex
Implementer: Claude
Scope: every ticket in the Rottay Design Platform program

## 1. Audit principle

The auditor does not reward effort, elapsed time, dependency adoption, lines
changed or visual novelty. It decides whether the ticket materially improves
the shared platform while preserving architecture, behavior, white-label,
i18n, accessibility and product correctness.

The implementer's evidence is input, not proof by assertion.

## 2. Independence

Codex:

- reads the original ticket and current authoritative documents;
- inspects the actual diff and surrounding owners;
- reproduces a bounded set of tests/evidence;
- performs an independent adversarial review;
- distinguishes pre-existing defects from regressions;
- records findings before changing implementation;
- accepts only when no blocking finding remains.

Codex does not:

- accept because Claude says tests passed;
- repair the ticket during an audit unless the user explicitly requests it;
- broaden the audit into unrelated cleanup;
- infer architecture from temporary code;
- run concurrent heavy checks;
- create a commit.

## 3. Audit inputs

Required:

- ticket ID and implementation report;
- registered `WO-*` crosswalk and current `roadmap/registry.json` state;
- authoritative plan/runbook version;
- baseline and final diff;
- allowed-file list;
- public API statement;
- focused test output;
- aggregate gate/build output;
- visual evidence matrix;
- token/recipe/slot ownership map;
- supplier score/bundle/provenance when relevant;
- known limitations;
- dirty-worktree snapshot.

Missing evidence is a finding. It is not automatically a code defect, but it
blocks acceptance when the acceptance contract requires it.

Durable evidence is linked from the work order/ledger and stored under
`test-artifacts/rottay-design-platform/<WO-ID>/` or the owning Showroom
`e2e/**/__screenshots__` directory. The canonical cross-brand starting points
are `packages/showroom/e2e/whitelabel/brand-locale-visual-matrix.spec.ts`,
`layout-foundations-matrix.spec.ts`, `divergence.spec.ts`, and
`torture.spec.ts`. Temporary desktop screenshots or chat claims are not
acceptance evidence.

## 4. Audit sequence

### A. Scope and worktree

1. Confirm no commit was created.
2. Confirm unrelated user changes were preserved.
3. Compare changed files with the ticket header.
4. Flag generated output changed without its source owner.
5. Flag adjacent refactors with no ticket reason.
6. When BitHire is the canary, confirm its `@rottay/design-system` path resolves
   to the local core package and that the tested `dist` artifacts postdate the
   relevant DS source change.
7. Confirm no copied DS artifact, temporary package version or alternate
   bundler path was introduced.

### B. Architecture

Verify:

- static BrandTheme remains first-party vertical authority;
- DB Appearance remains customer tenant authority;
- merge order is unchanged unless explicitly approved;
- canonical `--ds-*` remains runtime authority;
- no new global variable/theme system exists;
- `theme.css` contains paint, not tenant declarations;
- `framework-bridge.css` contains compatibility, not new permanent paint;
- app CSS does not repair shared primitives;
- no tenant-name branch exists in component behavior/presentation;
- supplier imports stay inside an adapter;
- public types/DOM contracts do not leak the supplier.

### C. Contract and behavior

Verify:

- public API compatibility;
- controlled/uncontrolled behavior;
- all documented states;
- pointer/touch/keyboard outcome parity;
- focus order/restoration;
- screen-reader name, description and state;
- error/recovery/cancel behavior;
- SSR/hydration when relevant;
- data/permissions/actions preserved;
- no hidden side effects.

### D. White-label and i18n

Use identical markup for:

- BitHire static BrandTheme;
- The Management DB Appearance fixture;
- at least two extreme torture tenants for flagship acceptance.

Check material divergence in:

- typography;
- density;
- corner strategy;
- border strategy;
- surface/depth;
- control anatomy;
- icon container treatment;
- focus;
- motion;
- overlay/table recipe where relevant.

Use:

- English LTR;
- Spanish LTR;
- Arabic RTL.

Check:

- text translation;
- plural/date/number/currency formatting;
- logical geometry;
- order and icon direction;
- resize/drag direction;
- long/missing/extreme content.

### E. Responsive and input matrix

Minimum:

- desktop pointer;
- tablet/coarse pointer;
- mobile touch;
- keyboard-only;
- reduced motion.

Pattern/surface audits also include narrow containers inside wide viewports.

Reject:

- viewport-only behavior where the component must respond to its container;
- clipped, overlapped or unreadable content;
- accidental horizontal scroll;
- desktop controls merely shrunk on mobile;
- tiny edit/resize handles;
- important action hidden without an accessible overflow path.

### F. Visual craft

Score independently:

| Category | Weight |
| --- | ---: |
| Hierarchy and typography | 12 |
| Geometry, spacing, alignment, responsive behavior | 12 |
| Borders, material, depth and detail | 10 |
| States and feedback | 10 |
| Motion and transition | 8 |
| Accessibility/input parity | 12 |
| i18n/RTL | 8 |
| White-label divergence and APIs | 15 |
| Content/operational resilience | 8 |
| API/performance/tests/maintainability | 5 |

Inspect pixels, not intentions:

- baseline alignment;
- line height and wrapping;
- icon optical size;
- control heights;
- border continuity;
- radius consistency;
- nested edge contrast;
- header/body/footer separation;
- action hierarchy;
- state contrast;
- hover/focus/active continuity;
- entrance/exit/reflow quality;
- empty-space balance;
- reading order.

### G. Performance and bundle

When relevant:

- inspect bundle delta;
- profile interaction under realistic data;
- verify continuous motion uses appropriate properties;
- check layout animation for text blur/scale distortion;
- verify input remains responsive;
- validate virtualization only against measured need;
- inspect provider/context duplication;
- confirm tree-shaking and SSR posture.

### H. Evidence reproducibility

Reproduce at least:

- one focused unit/contract command;
- one relevant source/ownership gate;
- one live/Storybook visual cell;
- one contrasting tenant/locale cell.

Run one heavy process at a time.

## 5. Supplier audit

Every supplier spike must answer:

1. Which measured problem does it solve?
2. What code/complexity does it remove?
3. What does it add to the bundle/runtime?
4. Does it improve accessibility/input/locale behavior?
5. Is styling/markup neutral?
6. Are public APIs supplier-neutral?
7. Is serialized product/tenant data neutral?
8. Can it be removed behind the adapter?
9. Does another supplier already own the responsibility?
10. Is the loser actually removed?

Minimum score: 85/100 and no critical red flag.

Specific audits:

- Tailwind Variants: direct `tv()` gate, semantic classes, typed slots,
  extreme-tenant proof.
- React Aria/Base UI: identical Rottay facades and test corpus, one winner.
- TanStack: same DataTable renderer; no aesthetic scoring.
- React Grid Layout: same WidgetBoard chrome; keyboard gaps owned by Rottay.
- AI runtimes: normalized events/messages; no SDK visual/public type leakage.

## 6. Finding severity

### P0 — stop

- data loss, security/privacy or destructive-action error;
- theme/tenant authority corrupted;
- permission bypass;
- inaccessible primary path with no alternative;
- hydration/runtime failure;
- public contract broken across products without approved migration.

### P1 — blocks acceptance

- overlap, clipping, unreadable content;
- wrong/missing locale or RTL;
- shared primitive repaired in app CSS;
- supplier leakage;
- incomplete focus/keyboard/touch behavior;
- same output for required contrasting tenants;
- accidental empty region;
- missing loading/error/recovery;
- major motion/performance defect;
- false evidence or undocumented architecture change.

### P2 — must be fixed or explicitly deferred with owner

- visual inconsistency below the target score;
- weak icon/border/type/detail craft;
- minor non-primary state gap;
- maintainability/debt introduced inside the owner;
- incomplete documentation/evidence.

### P3 — improvement

- non-blocking refinement beyond the defined score;
- future pattern or optimization opportunity.

## 7. Automatic rejection

Reject without averaging the score when any applies:

- colored left rail used as generic emphasis;
- overlap/clipping;
- inaccessible interactive control;
- untranslated visible copy;
- private selector patch from an app;
- raw shared-chrome brand literals in app code;
- missing reduced-motion behavior;
- supplier type/class in public API;
- unapproved second theme/token system;
- build/check processes run concurrently and invalidate evidence;
- Claude marks its own ticket accepted;
- commit created during this engagement.

## 8. Audit result states

- `accepted`: all required evidence passes; score threshold met; no P0/P1;
  ledger and percentage may update.
- `changes requested`: implementation direction is valid but findings remain.
- `rejected`: architecture or supplier direction fails; remove/revert the
  ticket's isolated work without touching unrelated user changes.
- `blocked`: evidence cannot be reproduced because of an external condition;
  describe the condition exactly.

## 9. Audit report format

```text
Ticket:
Result:
Score:
Blocking findings:
P2 findings:
Architecture:
Public API:
Supplier boundary:
White-label:
i18n/RTL:
Responsive/input:
Accessibility:
Motion/performance:
Tests/gates/build reproduced:
Visual evidence reviewed:
Pre-existing defects:
Regression risk:
Required changes:
Ledger action:
Certified percentage before/after:
```

Findings lead the report and include file/line evidence where possible.

## 10. Progress accounting

The auditor reports separately:

- catalog breadth;
- certified DS artifacts;
- selected patterns/surfaces;
- Candidates canary coverage;
- supplier spike milestones.

Only accepted ledger artifacts change the certified percentage.

Current baseline:

- 14/93 accepted public primitives = 15.1%;
- 0/15 accepted selected cross-product artifacts;
- 0/6 accepted canonical surfaces;
- 0/6 accepted AI capability families;
- 14/120 accepted overall artifacts = 11.7%.

Documentation and supplier research do not change these values.

## 11. Program-level audit gates

Before calling the design platform 10/10:

- all 93 public primitives complete two passes;
- all 15 selected cross-product artifacts pass at >= 95;
- all 6 canonical surfaces and 6 AI capability families pass their applicable
  scorecard and gates;
- static and DB tenant identities are radically divergent from identical trees;
- EN/ES/AR and RTL matrix passes;
- desktop/tablet/mobile/input/reduced-motion matrix passes;
- no unowned token/paint/bridge/app cascade remains;
- one supplier per responsibility;
- AI grammar covers stream/tool/approval/artifact/recovery/cost;
- Candidates proves the accepted stack without local primitive repair;
- no known P0/P1;
- no unresolved percentage/evidence discrepancy.

The auditor must be able to explain why the system produces premium output by
default. “Candidates looks better” is insufficient.
