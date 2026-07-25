# Kimi Implementation Prompt — Modern K0 + K1 Autonomous Macro-Wave

Copy everything below this line into the Kimi implementation session.

---

You are the lead frontend/design-system implementer for the Rottay Design
Platform 10/10. This is an implementation engagement, not another audit-only
engagement.

Work autonomously for a sustained multi-hour session. Complete as much of the
approved K0 + K1 macro-wave as the environment and context allow. Do not stop
after one small fix, one lane or one report. Implement, test, render, inspect,
iterate and continue.

## 1. Read order

Read these files completely before editing:

1. `CLAUDE.md`
2. `packages/core/docs/rottay-design-platform-10-10/MASTER-IMPLEMENTATION-PLAN.md`
3. `packages/core/docs/rottay-design-platform-10-10/CODEX-RECONCILIATION-KIMI-AUDIT-2026-07-23.md`
4. `packages/core/docs/rottay-design-platform-10-10/COMPONENT-LEDGER.md`
5. `packages/core/docs/rottay-design-platform-10-10/EXECUTION-BACKLOG.md`
6. `packages/core/docs/rottay-design-platform-10-10/CLAUDE-IMPLEMENTATION-RUNBOOK.md`
7. `packages/core/docs/rottay-design-platform-10-10/CODEX-AUDIT-PROTOCOL.md`
8. your two prior Kimi audit/proposal documents
9. `/Users/daniel/Developer/Rottay/docs-engineering/engineering/design-system/capability-map/README.md`

The Codex reconciliation overrides your prior audit/proposal wherever they
conflict.

## 2. Corrections you must acknowledge and apply

Your prior audit was valuable, but these findings were incorrect or
overstated. Do not implement from the incorrect version:

1. `MaterialSurface` is not dead tracked implementation code. There are no
   tracked contracts, tests, exports or implementation to delete. An empty
   local directory is not a code ticket. `SemanticSurface` is canonical.
2. The 1,026 hardcoded-literal number is real. It is the aggregate printed by
   `engine-token-audit --check`, not a top-level JSON key. Preserve it.
3. The missing canonical surface names are queued certification targets, not
   proof that Rottay lacks surface capability. Existing analogues include
   DashboardSurface, DetailSurface, CompareSurface,
   CollectionWorkspaceSurface, RecordWorkbenchSurface and ChatSurface. Later
   work must map/reuse before creating duplicates.
4. Do not root-export `densityScopeAttributes`. Public consumers already have
   `DensityScope` and `useDensity`; the helper remains internal unless a real
   external use case is proven.
5. Density propagation already reaches more than Input/Button. The real gap is
   coordinated geometry and proof breadth.
6. Do not reopen the accepted 14 merely because bridge paint will eventually
   move.
7. Your prior visual scores were not browser-sighted. You must now sight your
   own work and Codex will independently sight it again.
8. The current governed `IconName` corpus is 282. Update stale current-state
   docs, but preserve explicitly historical documents where 50 was a dated
   canary rather than a current claim.

## 3. Dominant product priority

**Modern is the priority. Every component you touch must look genuinely
premium, polished and production-ready.**

Modern is not a Daisy replica, an Ant copy or a functional placeholder. It is
the Rottay-native engine. Classic is compatibility. Rustic is fallback and
contrast. Preserve their public behavior/types, but spend visual authorship
and sighted iteration on Modern.

For every family, “tests pass” is not completion. The default Modern rendering
must be impressive without app repair:

- precise type hierarchy and readable measures;
- coherent icon sizing, optical alignment and icon containers;
- deliberate borders, separators, radii, depth and surface nesting;
- balanced density and whitespace with no accidental voids;
- complete hover, focus-visible, pressed, selected, disabled, loading, error,
  empty and destructive states as applicable;
- calm premium motion and transitions, never abrupt;
- container-responsive desktop/narrow/mobile behavior;
- coarse-pointer and keyboard usability;
- EN/ES/AR, long strings and RTL;
- normal and reduced motion;
- dark and high-contrast behavior where the family exposes relevant paint;
- identical markup that becomes materially different under BitHire static
  BrandTheme and The Management DB Appearance.

Never introduce a generic colored left border/rail. Do not add decoration just
to look “premium”. Gradients, texture, glow and glass are semantic tools and
must be bounded by tokens/recipes. Prefer subtle craft, segmentation and
micro-detail over visual noise.

Release blockers include any overlap, clipping, unreadable text, mixed corner
grammar, misaligned controls, unexplained empty space, private-selector repair,
hardcoded tenant branch or inaccessible interaction.

## 4. Architecture that is frozen

Preserve:

- canonical `--ds-*` value authority;
- static BrandTheme and DB Appearance compilers;
- `visualAuthority="compiled-artifact"`;
- the three-plane density model;
- the 16 motion recipes and reduced-motion policy;
- SemanticSurface and its eight roles;
- supplier confinement behind Rottay contracts;
- app/DS ownership boundaries;
- the accepted 14;
- one integration command at a time;
- no feature flags for unreleased work.

Do not create:

- another token system;
- another theme provider;
- a visual dependency on Daisy/Ant/Tailwind utility classes;
- app-specific or recruiting-specific primitives in core;
- raw product copy in primitives;
- tenant-name branches;
- app-side shared-chrome fixes;
- a blanket refactor of unrelated families.

## 5. Git and worktree safety

- Do not commit.
- Do not push.
- Do not create a PR.
- Do not publish.
- Do not reset, checkout, restore or clean the dirty worktree.
- Preserve the existing stash.
- Treat every pre-existing change as user-owned.
- Do not regenerate broad baselines.
- A decrease-only ceiling may tighten only when the current live count earned
  the reduction and the same-change gate passes.
- Never widen a baseline.

## 6. Autonomous execution model

Use up to four non-overlapping implementation/evidence lanes if your
environment supports delegation:

- coordinator: shared contracts, barrels, generated artifacts, integration;
- Lane A: identity and compact chrome;
- Lane B: text and boolean controls;
- Lane C: feedback and readiness;
- evidence lane may be combined with the coordinator.

No two lanes may edit the same family, shared skin, barrel or generated file.
Writers may run focused tests in their owners, but only the coordinator runs
package builds, broad suites, artifact generation and browser servers.
Those commands run serially, one at a time.

Maintain a durable local checkpoint after K0 and after every lane:

`test-artifacts/rottay-design-platform/K0-K1/IMPLEMENTATION-CHECKPOINT.md`

Record:

- completed and in-progress families;
- changed owners;
- focused commands and results;
- visual URLs/captures;
- unresolved defects;
- exact next action.

Do not stop to ask for approval between K0, Lane A, Lane B and Lane C. Continue
unless a stop condition in section 13 is reached.

## 7. K0 — close the foundation proof first

### K0.1 Density same-tree proof

Close the missing OLA 5 F2 deliverable.

Build a deterministic probe/spec that uses one identical public DS tree and
sweeps:

- BitHire static BrandTheme;
- The Management DB Appearance;
- compact, comfortable and spacious;
- EN, ES and AR;
- LTR and RTL where locale requires;
- root scope and one nested DensityScope override;
- desktop and narrow/mobile geometry;
- coarse-pointer 44px floor.

Prove agreement across:

1. compiler output;
2. root `data-density`;
3. CSS effective scale;
4. `useDensity()` context;
5. rendered control geometry.

Prove:

- DB overrides static without markup branching;
- nested scope affects only its subtree and restores correctly;
- density is independent from layout preference;
- 44px coarse floor cannot be reduced.

This is the full cross-product authority matrix for the macro-wave. Reuse it
for family evidence; do not duplicate its entire Cartesian product 21 times.

### K0.2 Baseline ratchet

Run the live engine audit. If and only if `daisy.classConsumers` remains 12 and
the same-change check is green, tighten 15 → 12. Do not alter other ceilings
unless the current change directly earns a decrease and you document it.

### K0.3 Documentation reconciliation

Apply the factual corrections in the Codex reconciliation:

- current state matrix = 216 total cells; 132 is the older Button subset;
- current icon corpus exposed by IconName = 282;
- current Modern theme.css = 617 lines;
- current counter count = 3,232;
- the 1,026 aggregate remains valid;
- no MaterialSurface deletion ticket;
- canonical surfaces require analogue mapping, not blind duplication.

Do not rewrite historical audit facts as if they never happened. Correct
current-state authorities and add clarifying notes to dated evidence when
needed.

### K0.4 SemanticSurface denominator

The current certification denominator is 93 public primitives and 120 total
artifacts. `SemanticSurface` is the 93rd row at `audit`, not accepted. Do not
claim progress from the denominator correction and do not certify it.

### K0.5 Generated taxonomy

`packages/core/docs/TAXONOMY.generated.md` was regenerated during your prior
audit without proven command attribution. Do not revert it blindly. Once K0
source owners are stable:

- run only the sanctioned taxonomy generator;
- compare its result to the current file;
- verify that each added/removed owner exists;
- keep raw directory counts separate from the 93-family certification
  denominator;
- report any generator inclusion bug such as support/style folders appearing
  as product families.

### K0.6 First-party recipe profiles

The production-theme selection gap is real. First inspect the existing
platform/BitHire/Evnto themes and render the same accepted specimen under both
available profiles.

Only then:

- select an explicit profile for a first-party theme when the mapping improves
  its intended personality;
- keep the selection typed and code-owned;
- prove the same markup changes geometry/anatomy rather than only color;
- do not assign profiles blindly merely to make the field non-empty;
- do not alter The Management customer DB data.

If two available profiles cannot responsibly represent all three verticals,
document the gap and leave the unsupported vertical on a safe default. Do not
invent profiles inside this macro-wave unless a K1 family requires a missing
axis and the profile addition is small, typed and visually proven.

### K0 exit

K0 is complete when focused authority tests, the density proof and relevant
ratchets are green and the probe is sighted. Then continue immediately to K1.

## 8. K1 scope — 21 primitive families

### Lane A — identity and compact chrome

1. Avatar
2. Badge
3. Tag
4. Link
5. Kbd

### Lane B — text and boolean controls

1. Input
2. Textarea
3. PasswordInput
4. FormField
5. Checkbox
6. Radio
7. Switch
8. Toggle

### Lane C — feedback and readiness

1. Alert
2. Callout
3. Message
4. Progress
5. Skeleton
6. Spinner
7. Empty
8. Result

Do not add Select, AutoComplete, DatePicker, TimePicker, Slider, Upload,
InputNumber, Modal or other K2 families. Do not install React Aria, Base UI,
TanStack Table, React Grid Layout or another supplier in K0/K1.

## 9. Required two-iteration method per family

Every family receives two explicit iterations with different lenses.

### Iteration 1 — contract, ownership and resilient default

Before coding, falsify the ticket:

- inspect all three engines, public contracts, stories, tests and consumers;
- identify actual defects rather than copying the audit prose;
- name the single paint owner;
- inventory inline literals, raw utilities, Daisy classes and bridge paint;
- identify states, accessibility behavior, density, direction and content
  risks;
- decide whether recipe axes already exist before adding one.

Then implement:

- preserve the public API unless a documented bug demands a compatible fix;
- Modern uses canonical tokens/recipes and public anatomy;
- Classic/Rustic retain contract parity;
- remove duplicate paint for the family;
- drain Daisy/raw utilities for that family where safe;
- add or improve focused contract and real-engine tests;
- add a deterministic showroom/Storybook specimen.

### Iteration 2 — adversarial premium craft

Render and inspect the real Modern component. Do not review from source alone.
Challenge it with:

- short and long content;
- empty/missing values;
- EN/ES/AR and RTL;
- compact and spacious density;
- narrow and mobile containers;
- coarse pointer and keyboard;
- dark/high contrast when relevant;
- default/hover/focus/press/disabled/error/loading/selected states;
- normal and reduced motion;
- BitHire static and The Management DB with the same markup.

Then refine:

- optical alignment;
- type scale and hierarchy;
- border/radius consistency;
- icon size/container relationship;
- internal and external rhythm;
- surface nesting and separators;
- state transitions and feedback;
- truncation/wrapping;
- touch targets;
- contrast and focus visibility.

Record what changed between Iteration 1 and Iteration 2. A family that looks
generic, crude, flat, heavy, crowded or unfinished after Iteration 2 remains
`review`, not “done”.

## 10. Family-specific minimums

### Lane A

- Avatar: image, initials, fallback, presence/status, group overlap, extreme
  names, loading/error image, small/large optical balance.
- Badge/Tag: counts, dot, dismissible, icon, semantic tones, pill vs squared
  recipe, overflow and dense collection behavior.
- Link: inline and standalone, external affordance, visited/disabled policy,
  focus and RTL icon placement.
- Kbd: multi-key chords, compact density, high contrast, baseline alignment
  inside text.

### Lane B

- Input/Textarea/PasswordInput: label/hint/error/validation, prefix/suffix,
  clear/reveal actions, autofill, disabled/read-only, long localized values,
  mobile keyboard and focus.
- FormField: canonical label/description/error/required/optional anatomy,
  horizontal/vertical responsive layout and correct association.
- Checkbox/Radio: checked/indeterminate, group semantics, long labels,
  disabled, error, focus, coarse pointer.
- Switch/Toggle: on/off/pressed state clarity independent of color, icon/label
  variants, controlled/uncontrolled behavior, reduced motion.

### Lane C

- Alert/Callout: hierarchy, title/body/actions/icon/dismiss, semantic roles,
  dense and spacious layouts; drain their Daisy paint.
- Message: lifecycle, stack placement, async status, accessibility announcement
  and its documented imperative engine-dispatch exception.
- Progress: determinate/indeterminate, label/value, reduced motion, compact
  geometry; drain Daisy paint.
- Skeleton/Spinner: no layout jump, calm cadence, dark/reduced-motion behavior.
- Empty/Result: differentiated empty vs completion/error grammar, useful action
  placement, responsive illustration/icon behavior and no giant blank boxes.

## 11. Evidence strategy

Do not create a full 21-family Cartesian explosion.

Required:

- K0: full density authority matrix;
- one flagship family per lane: full tenant/locale/direction/density/container/
  motion torture matrix;
- every remaining family: pairwise matrix covering all axes across the lane;
- every family: its critical interactive and content states;
- one identical markup comparison of BitHire static vs The Management DB per
  lane;
- focused test suite and real-engine suite per family;
- one lane-level mobile/coarse/RTL/reduced-motion proof;
- visual captures saved under
  `test-artifacts/rottay-design-platform/K0-K1/`.

Create:

`test-artifacts/rottay-design-platform/K0-K1/SIGHTED-REVIEW.md`

For each family record:

- specimen URL;
- captures;
- Iteration 1 defects;
- Iteration 2 refinements;
- BitHire/The Management differentiation;
- EN/ES/AR and RTL result;
- desktop/mobile/coarse result;
- accessibility result;
- remaining defect;
- recommended score, explicitly “proposed, not certified”.

## 12. Validation order

Run commands serially.

For each owner:

1. focused tests;
2. focused typecheck if available;
3. lane-level real-engine tests.

At each lane merge/checkpoint:

1. relevant architecture/paint gates;
2. package typecheck;
3. one aggregate pretest only after focused failures are resolved.

At macro-wave close:

1. final focused suites;
2. `engine-audit:check`;
3. core typecheck;
4. core pretest;
5. core build;
6. showroom typecheck;
7. one showroom production build;
8. browser/e2e visual evidence;
9. `git diff --check`.

Never run builds or broad checks concurrently. Do not accept or regenerate
visual baselines merely to make tests green.

## 13. Stop conditions

Stop only when:

- the same architecture/permission blocker survives three concrete attempts;
- an accepted-14 regression cannot be isolated to one lane;
- a baseline would need to widen;
- a required external dependency would need installation;
- the work would require destructive Git operations;
- execution context is exhausted.

If context is nearly exhausted, do not emit a vague handoff. Finish the current
atomic edit, run its focused check, update the checkpoint file and provide the
exact next file/command/action.

Do not stop because:

- K0 finished;
- one family is hard;
- one lane finished;
- the whole 21-family tranche will take time;
- visual work requires a second iteration.

## 14. Forbidden claims and mutations

You may not:

- mark a family accepted;
- change accepted ledger states;
- claim an increased certification percentage;
- widen baselines;
- say “world-class”, “10/10” or “complete” without the complete evidence
  envelope;
- claim visual validation you did not sight;
- commit, push, PR or publish.

You may state “implementation ready for Codex audit” per family.

## 15. Final handoff

Return one structured handoff:

1. executive summary without claiming acceptance;
2. K0 status and proof;
3. each family by lane: Iteration 1, Iteration 2, tests, visual evidence,
   remaining risks;
4. exact files changed by owner;
5. baseline deltas before/after;
6. supplier changes (expected: none);
7. static BrandTheme vs DB Appearance matrix;
8. EN/ES/AR, RTL, mobile, coarse and reduced-motion matrix;
9. serial command log with pass/fail counts;
10. sighted evidence paths;
11. pre-existing failures separated from introduced failures with bisection;
12. worktree/stash confirmation;
13. implementation-ready family count, explicitly not certified;
14. exact continuation if any K1 family remains;
15. confirmation: no commit, push, PR or publish.

Begin now. Read the authorities, amend your prior factual errors, close K0 and
continue through all three K1 lanes without waiting for another approval.
