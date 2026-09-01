# Claude Implementation Runbook

Status: implementation contract
Role: Claude is the implementer; Codex is the independent auditor
Scope: Rottay Design Platform first, BitHire Candidates as canary
Current engagement: no commits

## 1. Purpose

This runbook tells the implementing agent exactly how to execute the Rottay
Design Platform program without inventing a second architecture, optimizing
only BitHire, or declaring progress without evidence.

It is subordinate to the architecture in
`MASTER-IMPLEMENTATION-PLAN.md`. If a conflict is found, stop, record the
conflict and ask the user. Do not silently choose one interpretation.

## 2. Mandatory reading order

Read these files completely before changing code:

1. `/Users/daniel/Developer/Rottay/ui-design-system/CLAUDE.md`
2. `/Users/daniel/Developer/Rottay/ui-design-system/roadmap/README.md`
3. the selected work order and its entry in `roadmap/registry.json`
4. `MASTER-IMPLEMENTATION-PLAN.md`
5. `SUPPLIER-ARCHITECTURE.md`
6. `COMPONENT-LEDGER.md`
7. `EXECUTION-BACKLOG.md`
8. `CLAUDE-IMPLEMENTATION-RUNBOOK.md`
9. the ownership file and tests for the selected component/pattern/surface
10. the current implementation in all three engines when public parity is
   relevant
11. the exact BrandTheme, Appearance compiler and CSS owners affected by the
   ticket

Then report:

- the selected ticket;
- the exact defect;
- the files expected to change;
- the public contract that must remain stable;
- dependencies and non-goals;
- the evidence that will be produced.

Implementation may start only after that report is internally consistent and
the candidate `DS-*` row is cross-walked to a registered `WO-*`. This runbook
does not authorize implementation from an unmapped candidate row.

## 3. Role separation

Claude:

- audits the selected ticket's current code;
- proposes the smallest coherent implementation slice;
- implements it;
- adds focused tests and visual evidence;
- prepares supplier scorecards and a recommendation when relevant;
- reports remaining defects honestly;
- leaves the ledger at `review`.

Claude does not:

- mark a ledger item `accepted`;
- change the accepted percentage;
- approve its own supplier spike;
- reinterpret BrandTheme or Appearance authority;
- broaden a ticket because an adjacent area looks unattractive;
- create commits;
- run concurrent builds/checks;
- repair a shared DS defect in BitHire application CSS.

Codex:

- independently reviews the diff and ownership;
- reruns or inspects relevant evidence;
- performs the second adversarial visual/behavior pass;
- accepts, rejects or returns the ticket with findings;
- accepts/rejects supplier recommendations and authorizes removal of a losing
  spike;
- changes the ledger and percentage only after acceptance.

## 4. Immutable architecture

### 4.1 Identity

- First-party vertical identity is authored in typed static `BrandTheme`
  sources.
- Customer tenant identity comes from validated DB `Appearance`.
- The existing merge order remains:
  DS base → vertical → BrandTheme → Appearance General → Appearance Advanced.
- Canonical `--ds-*` values are the runtime identity authority.
- No `variables.css`, app stylesheet, supplier theme or route module becomes a
  parallel identity source.

### 4.2 Presentation

- Rottay owns public props, DOM-facing contracts, slots, data attributes,
  recipes, icons, motion personality and visual paint.
- `theme.css` consumes canonical values to paint supported Modern anatomy.
- `framework-bridge.css` contains temporary compatibility only. It receives no
  new permanent paint and no token declarations.
- Shared skins cannot contain tenant names.
- Apps may style domain composition through documented public hooks but cannot
  reach private component anatomy.

### 4.3 Suppliers

- A supplier solves invisible mechanics or authoring infrastructure.
- No styled library becomes a visual authority.
- Every supplier is hidden behind one Rottay adapter.
- Public declarations never expose supplier types, class names or serialized
  state.
- Overlapping suppliers require a bake-off; one winner remains.
- A spike is not acceptance.

### 4.4 Product applications

BitHire may own:

- recruiting data and permissions;
- information order;
- action priority;
- route behavior;
- i18n keys and domain copy;
- deliberate desktop/mobile composition;
- recruiting-only compounds;
- scoped feature styling through public DS APIs.

BitHire may not own:

- Button, Input, Card, Table, Tabs, overlay or form-control repair;
- a second token cascade;
- tenant-name visual branching;
- untranslated visible strings;
- raw recreations of DS primitives;
- private selectors or Daisy/supplier classes.

### 4.5 Persisted theme and font safety

- `TenantThemeDocument.schemaVersion` versions document meaning;
  `rowVersion` owns optimistic concurrency.
- Persisted recipe/profile IDs are Rottay-owned, namespaced and migration-safe;
  supplier variant names are never stored.
- Unknown schema/profile versions fail closed to the vertical baseline.
- DB themes may select only code-owned font packs and validated fallback
  stacks. Arbitrary remote font URLs, tenant `@font-face` and CSS injection are
  forbidden.
- New code-owned packs require license, payload, glyph/locale coverage and
  loading evidence.

## 5. Work-unit protocol

One ticket is the maximum implementation unit. A ticket may be split further
when its owner or evidence surface is too broad.

### 5.0 Local DS → BitHire development contract

The local integration already exists. Do not replace it with copying,
republishing or a speculative bundler migration.

Current facts:

- BitHire runs Next through Webpack in `dev`, `dev:local-ds` and `build`;
- `app-bithire/node_modules/@rottay/design-system` is a symlink to
  `ui-design-system/packages/core`;
- `app-bithire/scripts/link-local-ds.mjs` owns link creation and verifies the
  required `dist` artifacts;
- BitHire consumes built DS artifacts from the linked package, not arbitrary
  source paths;
- the published manifest version remains a release concern and is not changed
  merely to develop locally.

Required loop:

1. verify the symlink target with `readlink`;
2. edit DS source;
3. run one focused DS test;
4. run one DS build when the app needs updated `dist` artifacts;
5. start or reuse one BitHire `dev:local-ds` process;
6. verify the rendered app is loading the linked artifact;
7. reuse one browser tab for route validation and close obsolete tabs;
8. stop unused dev/Storybook/browser processes before starting another heavy
   integration.

Do not:

- change to Vite or another bundler just to solve a link that already works;
- run DS build and app build concurrently;
- publish the DS to test a local change;
- copy `dist` into BitHire;
- modify the package version/lockfile to simulate the local link;
- assume hot reload updates `dist` when no DS watch/build process owns it.

### 5.1 Ticket header

Create a temporary work note or include this exact structure in the progress
report:

```text
Ticket:
Layer owner:
Current defect:
Evidence:
Allowed files:
Public contract:
Dependencies:
Supplier responsibility:
Tenant matrix:
Locale/direction matrix:
Responsive/input/motion matrix:
Focused checks:
Visual proofs:
Non-goals:
Dirty-worktree overlaps:
```

### 5.2 Baseline before editing

For the selected owner:

1. read its implementation, contracts, exports, tests and styles;
2. inspect Classic and Rustic only to preserve API/behavior parity, not to copy
   their visual identity;
3. identify every relevant canonical token and current consumer;
4. locate duplicate paint in Modern theme, bridge, skin and app CSS;
5. capture the current story/live state at required sizes;
6. record existing failures separately from new regressions;
7. record exact package/dependency state when a supplier is involved.

Do not describe a component as “basic,” “premium,” or “broken” without naming
the observable defect.

### 5.3 Contract design

Before JSX/CSS changes, define:

- semantic purpose;
- stable slots;
- finite recipe axes;
- all interaction states;
- loading/empty/error/readonly/disabled states where relevant;
- locale-sensitive and direction-sensitive behavior;
- responsive/container behavior;
- keyboard, pointer, touch and assistive-technology outcomes;
- reduced-motion behavior;
- public customization hooks;
- which layer owns every new token/recipe/state.

Do not add props for purely accidental styling. Prefer semantic axes such as
`emphasis`, `material`, `density`, `shape`, `anatomy` and `motion`.

### 5.4 Implementation order

Within a ticket:

1. contracts and types;
2. token/compiler owner;
3. recipe/slot owner;
4. behavior adapter;
5. Modern engine;
6. shared paint;
7. focused tests;
8. stories/fixtures;
9. application canary only if the lower stack is ready;
10. documentation and evidence.

Never start at step 9 and backfill the DS later.

### 5.5 Validation order

Run heavy processes serially:

1. narrow unit/contract tests;
2. typecheck for the affected package;
3. relevant source/ownership gates;
4. one package build;
5. one story/showroom or app integration run;
6. visual/accessibility matrix;
7. final diff and generated-artifact review.

Do not launch a second build, test aggregate or browser integration while one
is running.

## 6. Quality passes

### Pass 1 — robustness and contract

Required:

- public API preserved or migration explicitly documented;
- all states implemented;
- keyboard/pointer/touch outcome parity;
- focus and screen-reader behavior;
- EN, ES and AR;
- LTR and RTL;
- desktop/tablet/mobile;
- normal/reduced motion;
- controlled/uncontrolled behavior where applicable;
- SSR and hydration where applicable;
- hostile content and missing data;
- static BrandTheme and DB Appearance;
- no supplier or private anatomy leakage.

Pass 1 is not a visual-polish acceptance.

### Pass 2 — adversarial craft

Review the rendered component as if Pass 1 had been implemented by another
team. Challenge:

- hierarchy;
- type pairing and line length;
- density and rhythm;
- border consistency;
- radius strategy;
- material nesting;
- icon size, alignment and semantic fit;
- header/body/footer segmentation;
- action priority;
- hover/focus/active/selected/disabled distinction;
- transition continuity;
- reorder/resize neighbor motion;
- empty-space intent;
- long labels, translations and values;
- nested composition;
- high contrast and low-contrast tenant inputs;
- visual divergence between extreme tenants.

Automatic failure:

- overlap, clipping or unreadable text;
- accidental large empty region;
- generic colored left rail;
- mixed square/round geometry with no semantic reason;
- unaligned controls or inconsistent row heights;
- decorative motion that obscures state;
- focus hidden by styling;
- a “customized” tenant that only changes primary color.

## 7. First implementation tranche

Follow this order. Do not jump to Candidates because it is more visible.

### 7.1 DS-A002 — ownership lint

Before new adapters or compounds, add the governed check for:

- native interactive reconstruction;
- local functional SVGs that bypass the semantic icon facade;
- raw identity utilities/shared-chrome literals in patterns and surfaces;
- documented, narrow exceptions with an owner and expiry condition.

The gate must be drilled red and green. It may not baseline current unknown
violations as accepted debt without a named roadmap amendment.

### 7.2 DS-A003 — token ownership graph

Goal:

- prove one typed owner from declaration to emission to consumption.

Inspect:

- BrandTheme contracts and authored themes;
- Appearance contracts/compiler;
- foundation defaults and registrations;
- generated vertical artifacts;
- Modern `theme.css`;
- Modern `framework-bridge.css`;
- shared presentation skins;
- component engines;
- BitHire feature CSS.

Output:

- machine-readable inventory;
- human-readable ownership report;
- orphan declarations;
- dead emissions;
- consumers with no owner;
- duplicate owner pairs;
- retirement owner for bridge/legacy paint;
- failing gate for new violations.

Acceptance:

- no documentation refers to an owner that does not exist;
- no identity declaration enters theme/bridge/app paint;
- generated artifacts are recognized as outputs.

### 7.3 DS-A004 — semantic surface roles

Required roles:

- canvas;
- shell;
- panel;
- card;
- control;
- inset;
- raised;
- overlay.

Each role needs:

- background;
- foreground;
- border/edge;
- depth;
- optional texture;
- hover/active/selected/disabled behavior when interactive;
- light/dark/high-contrast behavior;
- static BrandTheme compilation;
- DB Appearance compilation;
- safe fallback.

Proof:

- same accepted components under at least a radius-zero technical fixture and
  an ultra-rounded editorial fixture;
- different type, border, depth, surface and control personality;
- no markup branch.

### 7.4 DS-Q001L — existing-fixture divergence proof

Use the existing radius-zero technical and rounded editorial fixtures with the
same accepted Card, Button and Tabs trees. Record the exact Showroom probe,
BitHire static artifact, The Management DB-safe Appearance projection,
EN/ES/AR and RTL evidence. This is a bounded proof using existing fixtures; it
does not claim the full DS-Q001 torture matrix is complete.

### 7.5 DS-S001 — Rottay recipe facade

Tailwind Variants is already present only for this spike.

Requirements:

- direct `tv()` is limited to one internal owner;
- public components import Rottay recipe helpers, not the package;
- app code never imports Tailwind Variants for DS customization;
- recipe definitions consume semantic utilities/custom properties;
- raw palette/radius/shadow identity utilities are rejected;
- stable slot names are typed;
- compound variants are bounded;
- recipe profile IDs are valid in static BrandTheme and DB Appearance;
- supplier type names are absent from declarations.

Migration sequence:

1. Card;
2. Button;
3. Tabs;
4. Tag;
5. SectionCard/Surface;
6. DataTable presentation recipes.

The first three are already accepted. Any regression invalidates their previous
evidence and must be repaired before the spike proceeds.

Spike result:

- `accepted` only if two extreme tenants and all focused gates pass;
- otherwise remove the dependency and record why.

### 7.6 DS-S005 — supplier governance

Add gates for:

- adapter-only imports;
- no supplier types in public declarations;
- no supplier classes/data contracts in app code;
- exact version and license provenance;
- bundle delta;
- duplicate supplier responsibility;
- unowned provider/context;
- serialized-state neutrality;
- removal/exit instructions.

### 7.7 DS-S002 — complex behavior bake-off

Candidates:

- React Aria Components;
- Base UI.

Same Rottay facades:

- Select/ComboBox;
- Drawer/Dialog;
- NumberField or locale/date-sensitive field.

Same tests:

- pointer, touch, keyboard;
- focus restoration/trap/escape;
- screen-reader names and state;
- controlled/uncontrolled;
- form integration;
- disabled/readonly/invalid/loading;
- portal and nested overlay;
- virtual keyboard and small viewport;
- EN/ES/AR and RTL;
- SSR/hydration;
- reduced motion;
- bundle delta;
- adapter complexity and code removed.

Decision:

- weighted score >= 85;
- no critical red flag;
- Claude supplies both adapters, evidence, scores and a recommendation;
- Codex accepts/rejects the recommendation and authorizes dependency removal;
- tie means no adoption.

### 7.8 P0 primitive slice

Order:

1. Avatar;
2. Badge;
3. Tag;
4. Input;
5. FormField;
6. Select;
7. Modal/Drawer.

For each:

- write the ticket header;
- complete Pass 1;
- complete Pass 2;
- leave ledger at `review`;
- do not batch-accept a family.

Avatar, Badge, Tag, Input and FormField may proceed in isolated owners after
DS-A002. Select and Modal/Drawer wait for the DS-S002 acceptance decision.

### 7.9 DS-S003 — DataTable runtime bake-off

Keep identical:

- `PatternDataTable` public API;
- renderer;
- DOM/anatomy;
- recipes;
- fixtures;
- visual screenshots.

Compare only runtime responsibility:

- controlled/server state;
- sorting/filtering/faceting;
- selection;
- grouping/aggregation/expansion;
- pagination;
- column visibility/order/pinning/sizing;
- inline edit interaction;
- RTL;
- hostile data;
- large-data performance;
- code/test complexity;
- bundle and migration cost.

Do not select TanStack because an external demo looks good or bad.

### 7.10 DS-S004 — WidgetBoard runtime bake-off

Compare current runtime with React Grid Layout 2 behind the same public
`PatternWidgetBoard`.

Current baseline that must be preserved:

- eight pointer resize directions;
- diagonal resize;
- correct logical/physical cursors in RTL;
- keyboard slider semantics for independent axes;
- `items` plus `onItemsChange` persistence output;
- live neighboring preview/reflow and Escape cancellation;

Measured improvements:

- continuous inline-axis sizing instead of preset-only span snapping;
- true 2D coordinates, collision and compaction;
- breakpoint-specific layouts and a versioned serialized layout format;
- continuous size preview;
- smooth neighboring-widget reflow;
- move activation from the current control/card surface to the full
  non-interactive header region;
- interactive descendants excluded;
- activation threshold for mouse/touch/pen;
- Escape/cancel and undo/reset;
- keyboard move and resize;
- localized instructions/live announcements;
- min/max constraints;
- collision preview;
- responsive persistence;
- deliberate mobile mode;
- no ugly permanent dotted editing frame;
- clear but restrained edit-state affordances.

Claude recommends one runtime from the evidence. Codex accepts/rejects and
authorizes removal of the loser.

### 7.11 Canonical surface slice

Certify in this order:

1. ListSurface;
2. RecordSurface;
3. OverviewSurface;
4. WidgetWorkspace;
5. DecisionSurface;
6. AIWorkspace.

Each surface defines:

- header/no-header rules;
- tabs placement/overflow;
- action priority/overflow;
- main/rail behavior;
- container queries/breakpoints;
- loading/empty/error/permission states;
- mobile subset;
- sticky behavior;
- focus restoration;
- transition boundaries;
- public composition slots;
- domain responsibilities left to the app.

## 8. AI-native platform work

Do not begin by installing a chat kit.

### 8.1 Normalize contracts first

Define provider-neutral:

- agent event;
- message and typed parts;
- stream status;
- tool request/result/error;
- approval request/decision;
- background task;
- artifact/version;
- source/citation;
- confidence/uncertainty;
- token estimate/actual;
- cancellation/retry/recovery;
- generative component specification.

### 8.2 Implement Rottay grammar

Build in the order recorded in the master plan:

- AI status and streaming;
- source/confidence/cost;
- prompt and suggestion;
- recommendation and plan;
- approval/run/artifact/diff;
- assistant rail/generative surface/usage insight.

Use AI Elements as a state/pattern inventory only.
Evaluate assistant-ui, Vercel AI SDK and CopilotKit/AG-UI only against a real
runtime need after the public Rottay contracts exist.

### 8.3 Responsible usage

Every token-consuming action must make value and control legible:

- expected output;
- current reason;
- evidence used;
- estimate;
- scope;
- side effects;
- editable plan;
- cancel/discard/undo;
- actual cost;
- result quality/outcome;
- optional next action.

Do not use undisclosed auto-run, fabricated urgency or cost obfuscation.

## 9. Candidates canary

Candidates begins only after the exact dependent DS slice is accepted.

Route order:

1. `/candidates` list;
2. `/candidates/overview`;
3. matching;
4. compare;
5. record overview;
6. journey;
7. evidence;
8. details;
9. applications/interviews/evaluation/activity/screening/compliance;
10. mobile reductions.

The previews are references for:

- hierarchy;
- information priority;
- candidate identity;
- recent journey placement;
- “today/what cannot wait” actions;
- decision evidence;
- assistant recommendations;
- visible token value.

They are not permission to copy one-off HTML or hardcoded paint.

Canonical reference directory:
`/Users/daniel/Developer/Rottay/app-bithire/audit/2026-07-20-feature-redesign-blueprints/candidates/preview/`.

For every route:

- map preview intent to accepted DS pieces;
- identify missing generic capability;
- build/accept that capability in DS;
- compose domain UX in BitHire;
- preserve real data/actions/permissions;
- localize copy;
- validate static BitHire identity and compatibility with DB Appearance;
- validate desktop and deliberate mobile behavior.

## 10. Evidence package

The implementation handoff for every ticket contains:

```text
Ticket and status:
Outcome:
Architecture decisions:
Files changed:
Public API impact:
Token/recipe/slot map:
Supplier impact:
Focused tests:
Aggregate gates:
Build:
Visual evidence:
Tenant divergence:
Locales/RTL:
Responsive/input/reduced motion:
Performance/bundle:
Known limitations:
Questions for auditor:
Recommended ledger state: review
```

Screenshots include:

- URL/story ID;
- viewport;
- tenant source (static or DB Appearance fixture);
- locale/direction;
- input/motion posture;
- state;
- timestamp or deterministic run identifier.

Store durable evidence under
`test-artifacts/rottay-design-platform/<WO-ID>/`. Cross-brand executable
evidence starts from:

- `packages/showroom/e2e/whitelabel/brand-locale-visual-matrix.spec.ts`;
- `packages/showroom/e2e/whitelabel/layout-foundations-matrix.spec.ts`;
- `packages/showroom/e2e/whitelabel/divergence.spec.ts`;
- `packages/showroom/e2e/whitelabel/torture.spec.ts`.

The work order and ledger must link the exact artifact files. A chat message or
temporary desktop screenshot is not durable evidence.

## 11. Stop-and-ask conditions

Stop and ask the user before:

- changing BrandTheme/Appearance authority or merge order;
- changing the public catalog contract broadly;
- adding a styled component system;
- keeping two overlapping behavior suppliers;
- introducing a new global stylesheet/token layer;
- storing arbitrary tenant CSS;
- changing product data, permission or destructive-action semantics;
- committing;
- deleting user work;
- changing the accepted denominator or percentage;
- accepting a component without Codex audit.

For uncertainty inside an already bounded ticket, present:

- evidence;
- options;
- tradeoff;
- recommended choice;
- exact scope difference.

Do not ask vague aesthetic questions that can be answered through the written
quality rubric and live evidence.

## 12. Definition of implementation complete

Claude's work is implementation-complete when:

- the ticket scope is fully implemented;
- focused tests pass;
- required aggregate gates/build pass serially;
- visual matrix is captured and self-reviewed;
- architecture documentation is updated;
- no known P0/P1 defect is hidden;
- evidence package is complete;
- no commit exists;
- ledger is `review`, not `accepted`.

Only the independent Codex audit can convert that state to `accepted`.
