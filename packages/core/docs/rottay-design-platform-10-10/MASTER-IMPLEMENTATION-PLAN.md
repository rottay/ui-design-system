# Rottay Design Platform — Master Implementation Plan

Status: active platform target and certification specification
Date: 2026-07-22
Primary canary: BitHire Candidates
Product scope: every Rottay vertical and customer tenant
Commit policy for the current engagement: no commits

## 1. Purpose

This plan prevents context drift while Rottay turns the existing design system
into a premium, AI-native, deeply white-label product-construction platform.

It answers five questions:

1. What already exists and must be preserved?
2. Where is quality actually failing?
3. Which third-party suppliers improve a measured problem?
4. In what order should the platform be upgraded?
5. What evidence is required before progress is claimed?

BitHire Candidates is a live proving ground. It is not the architecture owner
and it is not a substitute for design-system acceptance.

### 1.1 Relationship to existing authorities

This package does not replace the repository's existing governance:

- [`../../../../roadmap/README.md`](../../../../roadmap/README.md) and
  [`../../../../roadmap/registry.json`](../../../../roadmap/registry.json)
  remain the only operative work-order and status authorities. A ticket in this
  package is a proposed certification unit until it is cross-walked to a
  registered `WO-*`.
- The canonical Modern visual target remains the
  [Quiet Premium specification](../../../../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md).
  This program raises the quality and cross-product certification bar; it does
  not silently rewrite that engine law.
- The existing roadmap's completed work, evidence, amendments, ratchets and
  historical failure baselines are preserved. This program never restarts or
  reclaims them under a new percentage.
- [`EXECUTION-BACKLOG.md`](./EXECUTION-BACKLOG.md) is a candidate backlog and
  crosswalk, not a second state store. Before implementation, the selected item
  must be mapped to an existing work order or proposed through the roadmap's
  sanctioned intake and registered with its dependencies and evidence rules.
- `COMPONENT-LEDGER.md` owns certification state for this quality program.
  Roadmap completion means the implementation work order is complete; ledger
  acceptance means Codex independently certified the artifact against this
  program. Neither status implies the other.

If these sources conflict, code and verified evidence are inspected first, the
canonical roadmap/spec is amended through its own process, and this package is
then reconciled. No agent may create a competing execution state.

## 2. North star

Rottay must be able to build a new product quickly from a shared material set
whose default result already looks intentional and premium.

The same public component tree must support substantially different products:

- clinical, editorial, technical, humanist, luxurious, compact, expressive,
  monochrome, high-contrast, radius-zero, or highly rounded;
- static code-owned vertical identity through `BrandTheme`;
- customer-controlled tenant identity through validated DB `Appearance`;
- EN, ES, and AR with correct RTL behavior;
- desktop, tablet, mobile, touch, pointer, keyboard, assistive technology, and
  reduced-motion environments;
- traditional workflows and AI-native, agentic, streaming workflows.

The quality target is not “more props.” It is coherent behavior, strong default
craft, bounded but radical personalization, and fast product composition.

## 3. Non-negotiables

1. Modern remains a Rottay engine.
2. The existing public catalog and engine registry are retained.
3. No new styled component library becomes a visual authority.
4. `BrandTheme` and DB `Appearance` remain the only global identity inputs.
5. Canonical `--ds-*` channels remain the runtime value authority.
6. Applications may compose, select public recipes, fill public slots, and add
   feature-scoped styling through documented hooks.
7. Applications may not repair shared chrome or address private supplier
   anatomy.
8. Suppliers are implementation details behind Rottay adapters.
9. User-facing text is localized; no component hardcodes product copy.
10. No colored left border or rail is used as a generic emphasis treatment.
11. Accidental empty space, overlap, clipping, unreadable text, and mixed
    geometry are release-blocking defects.
12. Integration builds and broad checks run serially, never concurrently.
13. No progress percentage is based on lines changed or work started.
14. No commits are created during the current engagement.

### 3.1 Current implementation priority

Modern is the primary product engine and the dominant implementation
priority. Every primitive selected for an active macro-wave receives two
iterations: contract/resilience first, then adversarial premium visual craft.
Classic and Rustic retain public contract parity, but they do not dilute the
Modern sighted-review budget.

The approved current tranche is the sustained K0 + K1 macro-wave defined in
[`CODEX-RECONCILIATION-KIMI-AUDIT-2026-07-23.md`](./CODEX-RECONCILIATION-KIMI-AUDIT-2026-07-23.md).
It closes the remaining density proof and then prepares 21 Modern primitive
families for independent Codex certification. The implementation agent
continues across the internal checkpoints without requesting approval after
each small lane.

## 4. Verified current state

### 4.1 Existing assets

- 93 public primitive families: 89 engine-backed primitives plus the
  specialized public `CodeBlock`, `MarkdownView`, and `VoiceInputButton`
  families and the public CSS-first `SemanticSurface`.
- Physical Classic, Modern, and Rustic implementations for all 89
  engine-backed primitives.
- 136 physical Classic engine implementations.
- 132 physical Modern engine implementations.
- 130 physical Rustic engine implementations.
- 39 Modern pattern engines.
- 46 structure entrypoints.
- 51 surface entrypoints.
- Static-first vertical `BrandTheme` compilation.
- Validated tenant `Appearance` compilation path.
- Semantic icon facade.
- Motion authority and reduced-motion policy.
- D3 chart layer.
- Existing responsive, density, typography, material, and tenant compilers.
- Existing Storybook/showroom, script gates, visual tests, and tenant fixtures.

The Ant-to-Modern replication is already substantial. Replacing Modern would
discard useful contracts and implementations without automatically improving
the visual floor.

Count method:

- Classic = 89 primitive + 43 pattern + 4 structure engine implementations;
- Modern = 89 primitive + 39 pattern + 4 structure engine implementations;
- Rustic = 89 primitive + 37 pattern + 4 structure engine implementations;
- the 46 structure and 51 surface counts are physical public `index` entrypoints,
  not claims that the repository has 46 and 51 top-level product families.

The four-pattern parity gap in Modern and the two public `Modal` families
(`feedback/Modal` and `overlay/Modal`) are explicit catalog debt. They require
ownership/consolidation decisions rather than being hidden by aggregate counts.

### 4.2 Accepted quality, not implementation breadth

The component ledger is the certification authority:

- 14 of 93 public primitives accepted: **15.1%**.
- 0 of 15 selected cross-product artifacts accepted: **0%**.
- 0 of 6 canonical surfaces accepted: **0%**.
- 0 of 6 AI capability families accepted: **0%**.
- 14 of 120 certified artifacts accepted overall: **11.7%**.

The denominator is intentionally explicit: 93 public primitives + 15 selected
cross-product artifacts + 6 canonical surfaces + 6 AI capability families.
Recipes, compiler work, suppliers, infrastructure and application routes are
gates or canary evidence; they do not inflate the artifact percentage.

Accepted work does not restart. Card, Typography, Button, Tabs, Tooltip,
Popover, AspectRatio, Box, Container, Divider, Flex, Grid, Space, and Stack
retain their evidence unless a later architecture change invalidates it.

### 4.3 Current technical debt indicators

The flattened engine-audit baseline currently records:

- 15 residual Daisy class consumers;
- 46 raw font-size literals;
- 33 magic z-index sites;
- 6 compositor-only motion violations;
- 13 Modern hex literals and 1 RGBA literal;
- 152 hand-authored ramp steps;
- aggregate `themeCss.lineCount = 1,345` as a historical/audit counter, not the
  current line count of one file;
- duplicated component paint across global theme, skins, bridges, patterns,
  and application styling;
- complex component runtimes maintained manually without a single explicit
  supplier strategy.

These metrics are not all equal. The most important defect is responsibility
ambiguity: tokens, recipes, skins, framework compatibility, patterns, and
feature CSS can currently influence the same visual result.

Current files are materially smaller than that aggregate baseline:
`modern/theme.css` is 617 lines and `framework-bridge.css` is 450 lines; neither
declares canonical `--ds-*` variables. Those Phase-1 ownership exits are already
partially met and protected by `css-layer-paint-gate`. Future work must drain
remaining duplicate paint without falsely reporting the 1,345 baseline as the
current `theme.css` size.

### 4.4 DataTable reality

`PatternDataTable` is not a superficial table. It already declares:

- controlled and client/server sorting;
- filtering and pagination;
- selection and bulk actions;
- responsive priority and mobile cards;
- column visibility, resizing, ordering, and pinning;
- grouping and aggregation;
- inline editing and keyboard traversal;
- fixed-height virtualization;
- operational toolbar, loading, empty, error, footer, row actions, and
  localization slots;
- finite visual recipes.

Its Modern renderer and shared presentation currently exceed 2,700 lines.
This is both an asset and a maintenance-risk signal. A headless table supplier
is useful only if it improves state correctness, performance, accessibility,
or maintenance while preserving the Rottay API and superior presentation.

## 5. Root-cause diagnosis

### 5.1 Foundation and token layer

What is good:

- broad theme schema;
- static and DB compilation paths;
- many semantic channels;
- tenant projection and testing infrastructure.

What is failing:

- not every declared channel has one typed owner and one proven consumer;
- some visual personality still lives in hand-authored component or vertical
  CSS instead of bounded recipe/profile selection;
- tokens change values, but some desired personality changes require coordinated
  anatomy recipes;
- compatibility projections can be mistaken for a second token system.

Required correction:

- one declared → emitted → consumed ownership graph;
- explicit semantic surface-role, typography, geometry, state, texture, icon, and
  motion channels;
- typed recipe profile identifiers in static BrandTheme and DB Appearance;
- compatibility files project canonical tokens only and never redefine them.

### 5.2 Primitive layer

What is good:

- broad catalog and engine parity;
- several P0 primitives have already passed two quality passes.

What is failing:

- complex controls contain hand-built focus, keyboard, collection, locale, and
  overlay logic with uneven depth;
- component anatomy and state hooks are inconsistent;
- defaults often look mechanically outlined instead of art-directed;
- too many visual variations are cosmetic rather than coordinated.

Required correction:

- preserve public contracts;
- use a single winning headless behavior supplier for complex overlapping
  controls;
- define stable slots and finite recipes;
- perform a robustness pass and a separate craft/adversarial pass per component.

### 5.3 Pattern layer

What is good:

- a large existing catalog including DataTable, list toolbar, saved views,
  detail panel, decision views, WidgetBoard, AI assistant, and customization
  tools.

What is failing:

- patterns can reconstruct primitive chrome or own private paint;
- responsive behavior is sometimes viewport-driven instead of
  container-driven;
- empty/loading/error and toolbar anatomy are inconsistent;
- some product-specific compositions entered the DS before becoming credible
  cross-product grammar.

Required correction:

- explicit pattern ownership documents;
- patterns composed from accepted primitives;
- typed public slots and feature hooks;
- container-responsive priority;
- complete state matrices and localized action grammar.

### 5.4 Surface layer

What is good:

- surface and workspace infrastructure already exists.

What is failing:

- headers, tabs, action rows, content frames, side rails, and mobile reductions
  can diverge between routes;
- surfaces sometimes expose low-level layout decisions to applications;
- information density and visual rhythm are not automatically coherent.

Required correction:

- certify reusable `ListSurface`, `OverviewSurface`, `RecordSurface`,
  `DecisionSurface`, and `WidgetWorkspace`;
- keep domain content and order in the app;
- keep shared framing, responsive collapse, state anatomy, and motion in the DS.

### 5.5 Application layer

What is good:

- applications can add legitimate domain composition and scoped styling.

What is failing:

- feature CSS can repair shared components or fight the cascade;
- preview markup can become a visual target without being translated into
  reusable DS grammar;
- application work can advance before its underlying components are accepted.

Required correction:

- application ownership gate;
- DS-first correction of shared defects;
- preview information hierarchy as guidance, not copied ad hoc markup;
- Candidates work only after the required primitives/patterns pass.

### 5.6 AI-native experience layer

What is good:

- assistant, recommendation, token-cost, and decision concepts already exist in
  BitHire experiments.

What is failing:

- there is no complete cross-product AI interaction grammar;
- chat is treated as the default AI surface even when an inline recommendation,
  plan, diff, background task, or generated artifact is better;
- streaming, tool execution, approval, cost, provenance, retry, interruption,
  and recovery states are not normalized.

Required correction:

- create supplier-neutral AI contracts and patterns;
- use agent runtimes through adapters, never as DS visual authorities;
- make useful token consumption explicit, voluntary, reversible, and connected
  to outcome value.

## 6. Target architecture

```text
Static BrandTheme / DB Appearance
               |
               v
   typed semantic channels + recipe profile
               |
               v
        canonical --ds-* runtime values
               |
               v
      Rottay recipes, slots and motion policy
               |
               v
  Rottay primitives -> patterns -> surfaces -> app
               |
               +-- headless behavior adapters
               +-- state/layout mathematics adapters
               +-- AI runtime adapters
```

### 6.1 Four personalization layers

1. **Tokens**: values such as color, type, spacing, border, radius, depth,
   texture, icon geometry, focus, and motion.
2. **Recipes**: coordinated personality choices such as soft, solid, outlined,
   ghost, borderless, editorial, technical, restrained, or expressive.
3. **Slots**: stable named anatomy for documented product-level composition and
   scoped styling.
4. **Patterns/surfaces**: reusable information and interaction grammar.

Tokens alone cannot turn a pill-based soft UI into a square, borderless
technical UI. Recipes and slots are necessary to make white-label radical
without forking markup.

### 6.2 Concrete repository authority map

This program does not introduce a second theme system. Existing owners remain
the owners:

| Responsibility | Repository owner | Rule |
| --- | --- | --- |
| Code-owned vertical identity | `src/foundation/tokens/ts/presentation/brand-themes/**` | BitHire, Rottay, Evnto and other first-party vertical personalities are authored as typed `BrandTheme` values. Generated CSS artifacts are outputs, not alternate sources. |
| Customer tenant identity | `src/foundation/contracts/composition/tenants/themes/**` plus `src/infrastructure/compilers/composition/tenant-theme/**` | DB documents are validated, normalized and compiled. They may select bounded recipe profiles and appearance values but never arbitrary component code. |
| Runtime Appearance projection | `src/infrastructure/compilers/kernel/runtime/appearance/**` | Maintains the existing merge order: DS base → vertical → BrandTheme → Appearance General → Appearance Advanced. |
| Canonical token defaults and registrations | `src/foundation/tokens/css/foundation/**` | Defines canonical `--ds-*` defaults, typed custom-property registration and platform policy. It is not a tenant source. |
| Modern component paint | `src/foundation/tokens/css/runtime/engines/modern/theme.css` and component-owned presentation files | Consumes canonical tokens and public recipe/anatomy state. It must progressively stop being a monolithic duplicate-paint owner. |
| Temporary framework compatibility | `src/foundation/tokens/css/runtime/engines/modern/framework-bridge.css` | Compatibility shims only. It may consume `--ds-*`; it may not redefine tenant tokens or receive new permanent component paint. Every retained rule needs a retirement owner. |
| Shared presentation skins | `src/foundation/tokens/css/presentation/components/**` | Paints accepted public anatomy. It must not encode a tenant name or compete with Modern theme paint for the same state. |
| Primitives | `src/ui/primitives/**` | Public behavior/anatomy contracts and supplier adapters; no product workflow. |
| Patterns | `src/ui/patterns/**` | Reusable interaction and information grammar composed from accepted primitives. |
| Structures | `src/ui/structures/**` | Reusable layout/shell grammar, not tenant identity. |
| Surfaces | `src/ui/surfaces/**` | Page-scale framing and responsive posture, not domain data or route logic. |
| Product applications | application feature modules and scoped styles | Domain order, data, permissions, copy keys, workflow and legitimate feature composition through public DS APIs only. |

There is no new authoritative `variables.css` layer. If a local file uses that
name for generated or scoped output, it is subordinate to the typed
BrandTheme/Appearance compilers and canonical `--ds-*` contract. Similarly,
`theme.css` is component paint and `framework-bridge.css` is temporary
compatibility; neither is an identity source.

### 6.3 Target CSS ownership and cascade

The end-state order is explicit:

1. reset and invariant platform foundations;
2. canonical default semantic tokens;
3. compiled static BrandTheme;
4. compiled DB Appearance, when present;
5. engine recipe/anatomy paint;
6. pattern, structure and surface composition;
7. documented feature-scoped application styling;
8. transient interaction state written through public data/state contracts.

Later layers may compose or specialize; they may not redeclare the earlier
identity authority. A selector that needs specificity escalation to repair a
shared primitive is evidence that ownership is wrong and blocks acceptance.

### 6.4 Supplier adapter placement

Every accepted supplier receives exactly one adapter owner under the relevant
DS responsibility. No application imports the supplier to control a Rottay
component.

The adapter must:

- translate Rottay public props into supplier mechanics;
- translate supplier state into stable Rottay data attributes and slots;
- keep supplier types out of public declarations;
- normalize SSR/hydration, direction, locale and reduced motion;
- expose instrumentation needed by tests and performance traces;
- include an exit test proving serialized app/tenant data is supplier-neutral.

Temporary bake-off adapters live beside each other and are deleted or archived
with the decision. They do not become permanent dual runtimes.

### 6.5 Theme document, recipe and font policy

- `TenantThemeDocument.schemaVersion` versions the persisted document shape.
  `rowVersion` remains the monotonic concurrency/version identity for a tenant
  row. A new document field or changed meaning requires an explicit schema
  migration; it is never inferred from CSS.
- When recipe profiles are introduced, they are stable, namespaced identifiers
  in the validated static `BrandTheme`/DB Appearance contract. Renaming or
  changing the meaning of a published profile requires a versioned
  alias/migration and fixture proof. Supplier recipe names never become
  persisted identifiers.
- Compiled theme artifacts include the schema/profile provenance needed to
  reproduce first paint. Server and client hydrate the same artifact version;
  unknown future schema/profile versions fail closed to a safe vertical
  baseline.
- Customer documents may select only code-owned font-pack IDs and validated
  fallback stacks. Arbitrary remote `url()`, tenant-hosted `@font-face`, CSS
  injection and unknown font variables are rejected.
- Font binaries are shipped and fingerprinted by the DS/application build,
  use `font-display: swap`, and include locale-appropriate fallbacks. Adding a
  pack requires license/provenance, payload, glyph/locale coverage and loading
  evidence; a DB tenant cannot turn a remote font URL into first-paint code.

## 7. Supplier policy

No supplier is accepted because its demo looks attractive. Styled demos are
irrelevant when the supplier is headless, and attractive styled systems can be
harmful if they become a second identity authority.

Every supplier receives a written scorecard:

| Criterion | Weight |
| --- | ---: |
| Measured problem solved | 20 |
| Accessibility and input parity | 15 |
| i18n and RTL | 10 |
| Public-contract compatibility | 10 |
| Styling and markup neutrality | 10 |
| Performance and bundle cost | 10 |
| Maintenance and release health | 10 |
| SSR, hydration, and React compatibility | 5 |
| Incremental adoption and exit seam | 5 |
| Testability and observability | 5 |

Minimum acceptance: 85/100 and no critical red flag.

Claude may implement both adapters, collect evidence, score them, and recommend
a winner. Codex is the independent acceptance authority and is the only agent
that may accept/reject the recommendation and authorize removal of the losing
spike dependency. The user decides only if a material architecture ambiguity
remains after that audit.

### 7.1 Accepted direction

#### Tailwind CSS 4

Role: internal CSS compiler and semantic utility authoring.

Rules:

- utilities map to canonical `--ds-*`;
- raw product identity utilities are prohibited;
- Tailwind does not define components or tenant authority;
- apps do not freeze identity with literal palette/radius/shadow utilities.

#### Tailwind Variants

Role: internal typed multi-slot recipe engine behind a Rottay facade.

Why:

- variants, compound variants, slots, composition, type inference, Tailwind 4,
  and conflict resolution address an actual recipe-authoring gap;
- it brings no visual identity and does not render DOM.

Current state:

- exact version `3.2.2` added to the core workspace for Spike S-01;
- not accepted until the facade, gates, provenance, bundle evidence, and
  contrasting-tenant proof pass.

#### Motion

Role: animation runtime behind the existing Rottay motion authority.

Rules:

- CSS transitions handle small self-contained state changes;
- Motion handles layout, reorder, interruption, coordinated enter/exit, and
  gesture-driven animation;
- all timings and personalities resolve from Rottay recipes;
- reduced motion preserves state clarity.

#### D3

Role: chart and visualization mathematics behind Rottay chart contracts.

#### Semantic icon facade

Role: stable product semantics independent of the underlying icon supplier.

### 7.2 Required bake-offs

#### Complex interactive behavior: React Aria vs Base UI

React Aria strengths:

- mature unstyled components and hooks;
- strong accessibility, internationalization, touch, locale, date/number, and
  RTL behavior;
- broad coverage useful to the existing 89-component catalog.

Base UI strengths:

- current, actively maintained React-first headless catalog;
- open compound APIs and visible internal parts;
- strong performance, overlay, drawer, combobox, mobile keyboard, and transition
  work;
- no bundled CSS or visual identity.

Package identities at the 2026-07-22 documentation audit are
`react-aria-components@1.19.0` and `@base-ui/react@1.6.0`. Spikes pin exact
versions at execution time and recheck release health; obsolete Base UI package
names are not allowed in adapters or provenance.

Bake-off components:

1. Select/ComboBox.
2. Drawer or Dialog.
3. NumberField or date/locale-intensive control.

Both candidates render through the same temporary Rottay facade and the same
slots/skins. Compare:

- public API adaptation cost;
- focus and keyboard behavior;
- touch and virtual keyboard behavior;
- EN/ES/AR and RTL;
- controlled/uncontrolled forms;
- portal/hydration stability;
- animation integration;
- bundle delta;
- source complexity removed;
- screen-reader results.

One primary supplier wins overlapping responsibilities. The loser is removed.
Specialized use of the loser requires a separate non-overlapping justification.

#### DataTable: existing runtime vs TanStack Table

The visual comparison is irrelevant because TanStack is headless.

The bake-off uses the same Rottay `PatternDataTable` renderer and compares only:

- state correctness;
- controlled/server state;
- column sizing, ordering, visibility, pinning, and RTL;
- selection/grouping/expansion behavior;
- performance under hostile datasets;
- code and test complexity;
- bundle and migration cost.

TanStack enters only if it improves the weighted score. The current Rottay
runtime remains a valid winner.

The stable package line at the 2026-07-22 audit is
`@tanstack/react-table@8.21.3`; v9 is beta and is outside this spike unless a
separate approved decision changes the risk posture.

#### WidgetBoard: current runtime vs React Grid Layout 2

The current Rottay runtime already has:

- eight logical, RTL-aware pointer resize directions;
- diagonal width/height gestures;
- keyboard slider semantics for independent axes;
- `items` plus `onItemsChange` persistence output;
- live neighboring preview/reflow and Escape cancellation;
- card-control drag activation with a focused 9/9 behavior suite.

The bake-off must not claim those as new RGL benefits. Its measured gaps are:

- continuous inline-axis sizing instead of the current preset span ramp;
- true two-dimensional coordinates, collision and compaction;
- breakpoint-specific layouts and a versioned serialized layout format;
- free-header drag activation that excludes interactive controls;
- smoother spatial reflow, pickup/drop craft and hostile-layout behavior.

React Grid Layout is the leading candidate because it explicitly supplies:

- responsive breakpoint layouts;
- drag, collision, compaction, and bounds math;
- serialization;
- mature resize and collision mathematics;
- per-item constraints.

It does not own visible chrome or complete keyboard accessibility.
`PatternWidgetBoard` must add:

- Rottay handles and cursors;
- header-area drag activation with interactive-control exclusion;
- smooth neighboring-widget reflow;
- keyboard move and resize actions;
- localized instructions and live announcements;
- pointer, touch, pen, Escape, undo, reset, and persistence;
- reduced-motion and compact mobile postures.

#### Sortable lists: legacy dnd-kit vs current dnd-kit

BitHire currently uses legacy `@dnd-kit/core`, `sortable`, and `utilities`.
The new `@dnd-kit/react` line is evaluated through a compatibility spike before
migration. The decision is based on accessibility, sensors, animation,
maintenance, and migration risk, not version novelty.

At the 2026-07-22 audit `@dnd-kit/react` is `0.5.0`, a pre-1.0 line. That
increases migration and API-stability risk; keeping the current legacy packages
is acceptable until a bounded spike proves a material benefit.

### 7.3 AI ecosystem research, not immediate visual adoption

#### AI Elements

Useful as a current pattern corpus for:

- conversation;
- messages and branches;
- prompt input;
- sources;
- tool state;
- tasks;
- reasoning-summary disclosure;
- attachments and suggestions.

It is built on shadcn/ui and Lucide. Its source may inform Rottay patterns, but
its visual foundation is not installed as a second DS.

#### assistant-ui

Candidate runtime/pattern supplier for:

- streaming conversation state;
- interruptions and retries;
- thread state;
- tool UI;
- multi-agent/chat experiences.

It is evaluated behind normalized Rottay AI contracts. Its ready-made visual
skin is not authoritative.

#### CopilotKit / AG-UI

Candidate application/runtime adapter for:

- shared agent/application state;
- generative UI;
- human-in-the-loop;
- frontend tools;
- multi-agent and background workflows.

It belongs above DS primitives. The design system must remain usable without
CopilotKit.

#### Vercel AI SDK

Candidate streaming/tool/generative-UI runtime adapter. It must not leak SDK
message-part types into Rottay public component contracts.

### 7.4 Explicitly rejected as global visual authorities

- Mantine;
- MUI;
- Chakra;
- shadcn/ui;
- Tailwind UI;
- DaisyUI;
- wholesale Radix/Ark/Ariakit adoption without a winning bake-off.

These may remain research references or bounded suppliers if a later scorecard
proves a non-overlapping need.

### 7.5 Market evidence snapshot

This snapshot was revalidated against primary sources on 2026-07-22. It
supports a bake-off; it does not pre-accept a dependency.

- [React Aria getting started](https://react-aria.adobe.com/getting-started.html):
  unstyled components/hooks with accessibility, internationalization,
  interaction and cross-modality behavior.
- [Base UI overview](https://base-ui.com/react/overview/about),
  [accessibility](https://base-ui.com/react/overview/accessibility) and
  [releases](https://base-ui.com/react/overview/releases): unstyled/no bundled
  CSS, WAI-ARIA behavior, active stable catalog and open anatomy.
- [TanStack Table overview](https://tanstack.com/table/latest/docs/overview),
  [features](https://tanstack.com/table/latest/docs/guide/features) and
  [column sizing](https://tanstack.com/table/latest/docs/guide/column-sizing):
  headless state engine with controlled feature APIs, RTL resize direction and
  documented performance tradeoffs.
- [React Grid Layout v2](https://github.com/react-grid-layout/react-grid-layout):
  responsive layouts, drag/resize, pluggable compaction, serialization and
  modular layout mathematics.
- [dnd-kit migration](https://dndkit.com/react/guides/migration/) and
  [sensors](https://dndkit.com/react/guides/sensors/): the current React line
  differs materially from the legacy packages and includes pointer plus
  keyboard sensor paths.
- [Tailwind Variants slots](https://www.tailwind-variants.org/docs/slots) and
  [Tailwind 4 guidance](https://www.tailwind-variants.org/docs/tailwind-v4):
  typed recipe machinery, slots and compound variants without rendering a
  component or owning visual identity.
- [AI Elements](https://elements.ai-sdk.dev/docs): current AI component/state
  corpus built on shadcn/ui and AI SDK, useful as research rather than a Rottay
  visual runtime.
- [assistant-ui primitives](https://www.assistant-ui.com/docs/primitives):
  unstyled chat/runtime primitives for streaming, thread, composer, tool and
  viewport mechanics.
- [AG-UI overview](https://docs.copilotkit.ai/ag-ui/introduction): event-based
  agent/frontend protocol with shared state, tool rendering, interrupts and
  generative UI concepts.
- [Vercel AI SDK UI](https://ai-sdk.dev/docs/reference/ai-sdk-ui): streaming
  message/data and tool runtime candidate, kept behind normalized Rottay
  contracts.

Release health and APIs are rechecked when each spike begins. This document is
not permission to install every listed package.

Version snapshot verified from the npm registry on 2026-07-22:
Tailwind Variants `3.2.2`, React Aria Components `1.19.0`,
`@base-ui/react` `1.6.0`, TanStack React Table `8.21.3`, React Grid Layout
`2.2.3`, and `@dnd-kit/react` `0.5.0`.

## 8. Rottay AI-native component roadmap

The goal is not another generic chat shell. Rottay needs reusable AI grammar
that works in recruiting, management, events, and future products.

### 8.1 Core AI primitives

- `AIStatus`: idle, queued, thinking, streaming, waiting, complete, failed,
  cancelled.
- `StreamingText`: stable partial rendering with accessible announcements.
- `ModelBadge`: semantic capability/tier, not provider branding.
- `TokenCost`: estimate, actual, budget relationship, and explanation.
- `SourceCitation`: title, type, freshness, permission, and open action.
- `Confidence`: evidence strength and uncertainty without fake precision.
- `SuggestionChip`: scoped quick action with outcome and estimated cost.
- `GenerationControls`: stop, retry, branch, compare, copy, save.
- `ToolStatus`: requested, awaiting approval, running, success, failure.

### 8.2 AI patterns

- `PromptComposer`: text, commands, mentions, attachments, voice, scope,
  context, model, and cost preview.
- `RecommendationCard`: diagnosis, evidence, projected value, cost, action, and
  dismissal feedback.
- `PlanPreview`: ordered actions, permissions, side effects, token estimate,
  editable steps, and execute boundary.
- `ApprovalGate`: human-in-the-loop confirmation for important external
  actions.
- `AgentRun`: step progress, tool calls, recoverable failures, background mode,
  and completion summary.
- `ArtifactPanel`: generated brief, table, chart, document, or structured
  output with versions.
- `DiffPreview`: proposed changes, accept/reject by scope, and undo.
- `AssistantRail`: entity-scoped copilot with sources and next actions.
- `GenerativeSurface`: typed mapping from structured tool output to approved
  Rottay components.
- `UsageInsight`: outcome achieved, time saved, tokens spent, and suggested next
  high-value action.

### 8.3 Responsible token-consumption UX

The product should encourage voluntary usage by showing value, not hiding cost.

Each paid/high-token action can communicate:

- expected output;
- why it is useful now;
- evidence/context it will use;
- estimated token band;
- estimated time saved or risk reduced;
- editable plan or scope;
- no-send/no-side-effect state before confirmation;
- ability to cancel, discard, retry, compare, or undo;
- actual cost after completion;
- next optional action ranked by value.

Dark patterns, fabricated urgency, and undisclosed automatic execution are not
allowed.

## 9. Execution sequence

### 9.0 Dependency rule

The phase number is an architectural dependency, not permission to perform a
large horizontal rewrite. Work advances in narrow vertical slices:

```text
authority/token channel
  -> recipe/slot contract
    -> one primitive family
      -> one dependent pattern
        -> one dependent surface
          -> Candidates proof
```

A slice may move forward only when its lower layer is accepted. Independent
slices may be prepared in parallel, but generated artifacts, aggregate checks,
builds and live integration remain serial. This preserves speed without
letting application polish outrun the design platform.

### Phase 0 — preserve baseline and authority

Deliverables:

- this master plan;
- supplier architecture;
- component ledger;
- candidate backlog and roadmap crosswalk;
- current visual evidence and audit baselines;
- explicit dirty-worktree preservation.

Exit:

- all authoritative documents agree;
- no supplier proposal contradicts static BrandTheme, DB Appearance, app
  customization, or i18n/RTL.

### Phase 1 — close cascade and theme authority

Work:

- canonical CSS layer order;
- one token ownership graph;
- compatibility projection separated from component paint;
- no token redefinition in framework bridges;
- remove first-party Daisy class dependence wave by wave;
- complete semantic surface-role, typography, geometry, state, icon, texture, and
  motion channels;
- add typed recipe-profile selection to BrandTheme and Appearance.

Exit:

- same tree renders materially different tenant personalities;
- no local selector escalation is needed;
- static → DB Appearance → static can switch in place without leakage;
- token parity and CSS ownership gates pass.

### Phase 2 — recipe engine spike

Work:

- implement the Rottay facade over Tailwind Variants;
- define common axes:
  `purpose`, `anatomy`, `density`, `emphasis`, `material`, `shape`, `motion`;
- define stable slots;
- migrate Card, Button, Tabs, Tag, Surface/SectionCard, and DataTable recipes;
- prohibit direct `tv()` use outside the adapter/recipe owner;
- extend supplier contract and provenance.

Exit:

- two extreme tenants use the same component trees;
- app code does not know Tailwind Variants;
- existing accepted components do not regress;
- bundle and runtime overhead stay inside the recorded budget.

### Phase 3 — behavior supplier bake-off

Work:

- React Aria and Base UI prototypes behind temporary adapters;
- Select/ComboBox, Drawer/Dialog, and locale-intensive field comparison;
- one winner selected and documented;
- losing dependency removed;
- public contracts remain Rottay-owned.

Exit:

- score >= 85;
- WCAG 2.2 AA component behavior;
- EN/ES/AR and RTL;
- pointer/touch/keyboard/screen-reader parity;
- SSR/hydration and reduced-motion proof.

### Phase 4 — P0 primitive families

Order:

1. Avatar, Badge, Tag, Link, Kbd, Icon.
2. Input, Textarea, FormField, Checkbox, Radio, Switch, Select, Date/Time,
   Number, Upload.
3. Alert, Callout, Progress, Skeleton, Spinner, Empty, Result, Toast,
   Notification.
4. Menu, Breadcrumb, Pagination, Segmented, Steps, Timeline.
5. Modal, Drawer, Sheet, Dropdown, ContextMenu, HoverCard, ConfirmDialog.
6. Table, Descriptions, List, Statistic.

Each item receives:

- Pass 1: contract, behavior, accessibility, state completeness, tokens,
  responsive and locale correctness.
- Pass 2: visual hierarchy, typography, border/radius consistency, motion,
  hostile content, nested use, two contrasting personalities, and live review.

Exit:

- ledger score >= 90;
- flagship components >= 95;
- linked visual and test evidence.

### Phase 5 — P0 patterns

Order:

1. WorkspaceTabs and ListToolbar.
2. DataTable and collection states.
3. RecordHero, ActionDock, RecordFacts, DetailFactsEditor.
4. PriorityBand, RankedActionList, DecisionBrief, AssistantRail.
5. JourneyWorkspace, PeekPanel, DecisionComparison.
6. WidgetBoard and widget catalog.

DataTable:

- run native-vs-TanStack bake-off before changing its runtime.

WidgetBoard:

- run native-vs-RGL spike;
- preserve the existing eight-direction, diagonal, RTL-aware resize and
  keyboard-axis parity;
- add continuous inline sizing, true 2D coordinates, collision/compaction and
  breakpoint-specific layouts only if the winning runtime proves them;
- move activation from the current control/card surface to the complete free
  header region while excluding interactive controls;
- preserve and improve harmonious neighboring reflow;
- searchable categorized catalog with meaningful previews;
- versioned serialized persistence, responsive layouts and mobile reduction.

Exit:

- pattern ledger score >= 95;
- no primitive reconstruction;
- no accidental empty state or fixed unused space;
- complete i18n and accessibility.

### Phase 6 — P0 surfaces

Certify:

- `ListSurface`;
- `OverviewSurface`;
- `RecordSurface`;
- `DecisionSurface`;
- `WidgetWorkspace`;
- `AIWorkspace`.

Exit:

- consistent header/no-header rules;
- consistent tabs and action placement;
- container-responsive main/rail layouts;
- balanced heights and full-width occupancy where appropriate;
- deliberate mobile subset;
- all loading/empty/error/permission states.

### Phase 7 — AI-native grammar

Work:

- define normalized agent event and message contracts;
- implement core AI primitives and patterns;
- run assistant-ui, AI SDK, and CopilotKit adapter spikes only where the product
  runtime requires them;
- create generic tool-result to approved-component mapping;
- add cost, source, approval, interruption, retry, background, artifact, diff,
  and undo states.

Exit:

- no SDK-specific public visual contract;
- at least one streaming, one tool, one approval, one background, and one
  generative-surface proof;
- full localization and screen-reader status behavior;
- voluntary cost-aware action UX.

### Phase 8 — torture matrix

Tenants:

- BitHire static identity;
- The Management DB Appearance;
- monochrome radius-zero technical fixture;
- highly rounded soft fixture;
- compact high-information fixture;
- spacious editorial fixture;
- dark high-contrast fixture.

Axes:

- EN, ES, AR;
- LTR and RTL;
- desktop, tablet, mobile;
- pointer, coarse pointer, keyboard;
- normal and reduced motion;
- loading, empty, error, success, disabled, readonly;
- short, long, missing, stale, and extreme-value content.

Exit:

- stable visual matrix;
- no overlap, clipping, accidental scroll, or unreadable content;
- valid focus order and contrast;
- no tenant-specific component markup.

### Phase 9 — BitHire Candidates canary

Order:

1. candidate list;
2. overview;
3. matching;
4. compare;
5. record hero and overview;
6. journey;
7. evidence;
8. details/editor;
9. applications, interviews, evaluation, activity, screening, compliance;
10. mobile reductions.

Rules:

- preserve architecture, data, permissions, and actions;
- use preview information hierarchy as a product reference;
- do not reconstruct shared DS chrome;
- keep domain-specific composition and scoped styles in BitHire;
- validate white-label compatibility without testing every route in both brands.

Exit:

- complete functional path;
- no feature flags;
- no commit;
- desktop and mobile evidence;
- static BitHire identity and DB tenant compatibility verified.

### Phase 10 — long tail and rollout

- normalize the remaining primitives, patterns, structures, and surfaces;
- migrate other Modern consumers;
- keep Classic and Rustic contract compatibility;
- retire residual Daisy compatibility only when its consumer count reaches zero;
- publish migration notes and recipes for future products.

### 9.11 First implementation tranche

This is the exact first tranche after documentation reconciliation. It avoids
another broad, visually noisy rewrite.

0. **Governance crosswalk**
   - map every selected `DS-*` candidate to an existing or newly approved
     `WO-*` in `roadmap/registry.json`;
   - use the roadmap machinery for claim/progress/done; do not implement from
     this document alone.
1. **DS-A002 ownership lint**
   - gate native interactive reconstruction, local functional SVGs, utility
     identity and shared-chrome literals in patterns/surfaces;
   - establish the exception path needed before supplier adapters or new
     product compounds are authored.
2. **DS-A003 ownership graph**
   - inventory declared, emitted and consumed channels;
   - identify duplicate owners in Modern theme, bridge, skins and app CSS;
   - publish owner and retirement path for every flagged channel.
3. **DS-A004 semantic surface roles**
   - complete canvas, shell, panel, card, control, inset, raised and overlay
     roles;
   - compile through static BrandTheme and DB Appearance;
   - prove light, dark and high-contrast fallbacks.
4. **DS-Q001L existing-fixture proof**
   - use the existing technical/radius-zero and editorial/rounded divergence
     fixtures before inventing new tenants;
   - freeze identical-tree evidence for accepted Card, Button and Tabs;
   - treat full torture-fixture expansion as DS-Q001, not a prerequisite to
     learn from the current fixtures.
5. **DS-S001 recipe facade**
   - hide Tailwind Variants behind Rottay-owned typed APIs;
   - prove Card, Button and Tabs first because they are already accepted;
   - prove a radius-zero technical tenant and an ultra-rounded editorial
     tenant with the same trees;
   - only then extend to Tag, SectionCard and DataTable.
6. **DS-S005 supplier gates**
   - block direct `tv()` use outside the owner;
   - record exact version, bundle delta and removal seam;
   - reject supplier classes/types in public declarations and apps.
7. **DS-S002 behavior bake-off**
   - install candidates only for the isolated spike;
   - run identical functional, locale, RTL, SSR, touch and accessibility cases;
   - Claude writes the scorecard and recommendation;
   - Codex accepts/rejects and authorizes removal of the loser.
8. **P0 primitive slice**
   - Avatar, Badge, Tag, Input, FormField, Select and Modal/Drawer;
   - two passes and ledger evidence per item;
   - no app route is counted as progress.
   - Avatar, Badge, Tag, Input and FormField may progress in isolated owners
     after DS-A002; Select and Modal/Drawer wait for DS-S002.
9. **DataTable slice**
   - finish recipe/geometry/pagination/toolbar ownership;
   - run native-vs-TanStack functional adapter comparison;
   - preserve the same visual renderer for both;
   - select one runtime and delete temporary duplication.
10. **WidgetBoard slice**
   - run native-vs-RGL2 comparison;
   - prove eight directions, diagonal resize, neighbor reflow, header-area drag,
     keyboard parity, catalog usability and responsive persistence.
11. **Surface slice**
   - certify ListSurface and RecordSurface with one header/tab/action grammar;
   - certify OverviewSurface and WidgetWorkspace after their patterns pass.
12. **Candidates proof**
    - list and one record overview first;
    - only expand to the remaining routes once the exact dependent DS stack is
      accepted.

No additional supplier is installed before DS-A002, DS-A003, DS-A004,
DS-Q001L, DS-S001 and DS-S005 close and the existing Tailwind Variants spike
is either accepted or rejected.

## 10. Quality score

Each component, pattern, or surface is scored out of 100:

| Category | Weight |
| --- | ---: |
| Information hierarchy and typography | 12 |
| Geometry, spacing, alignment, and responsive behavior | 12 |
| Borders, depth, material, texture, and visual detail | 10 |
| Interaction states and feedback | 10 |
| Motion and transition quality | 8 |
| Accessibility and input parity | 12 |
| i18n and RTL | 8 |
| Tokens, recipes, slots, and white-label divergence | 15 |
| Content resilience and operational states | 8 |
| API, performance, tests, and maintainability | 5 |

Minimum:

- primitive: 90;
- flagship primitive: 95;
- pattern/surface: 95.

Automatic rejection:

- overlap or clipping;
- inaccessible interactive control;
- untranslated product-facing string;
- accidental empty region;
- private DS selector patched by app CSS;
- raw shared-chrome identity in application code;
- same visual output for deliberately contrasting tenants;
- supplier-specific public type or class contract;
- generic colored left rail;
- missing reduced-motion behavior.

## 11. Performance and motion gates

- every supplier/runtime ticket records a pre-change production bundle,
  interaction and rendering baseline plus target and maximum acceptable delta
  in its registered work order before implementation;
- an unbudgeted dependency or bundle increase blocks acceptance; there is no
  universal invented kilobyte allowance that lets unrelated suppliers hide
  inside one aggregate;
- no layout animation may block input;
- transform/opacity are preferred for continuous motion;
- resize/reorder records frame-time distribution on named reference hardware;
  target is a 16.7 ms frame budget and the ticket discloses frames above
  33.3 ms rather than claiming “60 fps” without a trace;
- expensive table modes are profiled before virtualization is added;
- interaction latency is measured under realistic data, with row/item/payload
  counts recorded so later evidence remains comparable;
- Motion `layout` is used for neighboring reflow only when it does not create
  scale distortion or text blur;
- simple hover/focus color changes stay in CSS;
- touch activation thresholds prevent accidental drag;
- long-running AI work moves to background with visible status;
- bundle delta, retained source removed, hydration cost and rollback seam are
  recorded for every supplier spike.

## 12. Accessibility and internationalization gates

- WCAG 2.2 AA component behavior;
- APCA/WCAG color validation in theme compilation;
- automated axe checks use the repository's `@axe-core/playwright` integration
  on stable Showroom probes; Storybook's a11y addon is a development aid, not
  sole acceptance evidence;
- Playwright exercises keyboard sequence, focus visibility/restoration,
  direction, overlay and pointer/touch-equivalent outcomes;
- flagship complex controls receive a manual screen-reader pass on at least one
  desktop platform, with browser/AT/version and findings recorded; automated
  ARIA checks do not claim spoken-output proof;
- visible focus and logical focus order;
- keyboard outcome parity;
- screen-reader labels, instructions, and live status;
- touch target floors;
- EN/ES/AR required for acceptance;
- RTL geometry, ordering, resize direction, and icons;
- locale-aware dates, numbers, currency, and pluralization;
- no English fallback silently accepted in an accepted artifact;
- reduced-motion and high-contrast modes.

## 13. White-label proof

The same component tree must demonstrate meaningful differences in:

- display/body/mono typography;
- type scale and weight hierarchy;
- density and spacing rhythm;
- corner strategy;
- border presence, width, contrast, and style;
- surface materials and depth;
- controls and pills;
- icons and icon containers;
- focus treatment;
- motion energy and duration;
- table recipe;
- overlay material;
- empty/loading/error presentation.

Changing only a primary color does not count as white-label proof.

## 14. Work discipline

### 14.1 Serial integration

- at most one build, typecheck, test aggregate, or browser integration run at a
  time;
- focused unit tests may precede one aggregate gate;
- do not start a second heavy process while another is active.

### 14.2 Two-pass rule

Every item is reviewed twice:

1. product/contract perspective;
2. independent adversarial craft perspective.

The second pass must challenge the first; it cannot merely repeat the same
checklist.

### 14.3 Evidence before percentage

An item counts only when:

- implementation is complete;
- focused tests pass;
- aggregate gates relevant to its owner pass;
- visual matrix is reviewed;
- white-label, locale, RTL, responsive, and reduced-motion evidence is linked;
- ledger status is `accepted`.

### 14.4 Context continuity

At the beginning of future work, read in this order:

1. `MASTER-IMPLEMENTATION-PLAN.md`;
2. `SUPPLIER-ARCHITECTURE.md`;
3. `COMPONENT-LEDGER.md`;
4. `EXECUTION-BACKLOG.md`;
5. `CLAUDE-IMPLEMENTATION-RUNBOOK.md` when implementing;
6. `CODEX-AUDIT-PROTOCOL.md` when auditing;
7. the active ticket's ownership and evidence files.

Any architecture change updates these documents in the same work item.
No agent or future session may infer a new authority from temporary CSS or an
application workaround.

### 14.5 Ticket implementation contract

Every ticket or delegated task must begin with a written header containing:

- ticket ID and layer owner;
- exact files/directories allowed to change;
- public contract being preserved or intentionally migrated;
- current defect with linked evidence;
- expected tenant/locale/responsive/motion matrix;
- tests and visual stories to add;
- supplier involvement and exit seam, if any;
- dependencies and known dirty-worktree overlap;
- explicit non-goals.

Every ticket ends with:

- implementation summary;
- files changed;
- focused test result;
- aggregate gate result, if the ticket owns one;
- visual evidence paths;
- white-label divergence evidence;
- EN/ES/AR and RTL evidence;
- desktop/mobile and reduced-motion evidence;
- unresolved defects;
- ledger status;
- rollback/removal note.

Work without this envelope may be exploratory, but it cannot be merged into an
accepted component or included in the percentage.

### 14.6 Evidence locations and reference policy

- Cross-brand/locale executable evidence lives in
  `packages/showroom/e2e/whitelabel/brand-locale-visual-matrix.spec.ts` and its
  colocated `__screenshots__` directory.
- Layout foundation evidence lives in
  `packages/showroom/e2e/whitelabel/layout-foundations-matrix.spec.ts` and its
  colocated `__screenshots__` directory.
- Extreme-tenant evidence starts from
  `packages/showroom/e2e/whitelabel/divergence.spec.ts`,
  `torture.spec.ts`, and `torture-baseline.json`.
- New ticket-specific captures, traces, screen-reader notes and bundle reports
  go under `test-artifacts/rottay-design-platform/<WO-ID>/`; the registered work
  order and ledger row link the exact files. Evidence is never stored only in a
  chat or temporary desktop path.
- Candidate HTML references live in
  `/Users/daniel/Developer/Rottay/app-bithire/audit/2026-07-20-feature-redesign-blueprints/candidates/preview/`.
  They are product hierarchy references for overview, list, matching, compare,
  dossier, journey, evidence, details/editing and compliance. They are neither
  DS implementations nor pixel-perfect visual authorities.
- A preview may determine information priority (“today”, identity, journey,
  evidence, decision, recommendations and token value). It may not justify raw
  HTML reconstruction, hardcoded paint, Spanish component identifiers, private
  selectors or a route-specific shared-chrome patch.

### 14.7 Decision record

Architecture and supplier decisions use four states:

- `candidate`: researched but not installed;
- `spike`: isolated dependency and adapter under evaluation;
- `accepted`: scorecard and gates passed, production owner named;
- `rejected`: reason, evidence and removal confirmed.

“Recommended” is not a fifth state. A supplier is not architecture merely
because it appeared in a conversation or dependency file.

### 14.8 Progress accounting

Five numbers are reported separately:

1. **catalog breadth**: implementation exists;
2. **certified public primitives**: public primitive ledger item is accepted;
3. **certified cross-product composition**: selected compound/pattern,
   canonical surface and AI-family categories reported separately;
4. **certified platform quality**: accepted artifacts across the full basket;
5. **application canary coverage**: Candidates surface uses only the accepted
   stack and has live evidence.

The main progress percentage is certified platform quality:

```text
accepted public primitives + accepted selected cross-product artifacts
  + accepted canonical surfaces + accepted AI capability families
---------------------------------------------------------------------
                                 120
```

Supplier spikes, documentation, lines changed, provisional stories and
partially passing components do not increase it. They may be reported as named
milestones, never mixed into the percentage.

### 14.9 Risk register and containment

| Risk | Early signal | Containment |
| --- | --- | --- |
| A second visual authority enters | supplier classes, palette names or DOM assumptions appear in public/app code | adapter-only imports, contract lint, immediate rejection |
| Token system duplicates itself | identity values appear in theme/bridge/app files | ownership graph, compiler tests, canonical `--ds-*` gate |
| Recipe explosion | arbitrary strings or tenant-specific variants multiply | finite typed axes, compound recipes, recipe-profile review |
| App polish outruns DS | Candidates local CSS repairs shared chrome | application ownership gate and DS-first ticket |
| Supplier churn | multiple libraries solve the same responsibility | one-winner bake-off and loser removal |
| Broad refactor hides regressions | many families change before evidence | narrow vertical slices and serial integration |
| Visual polish masks behavior defects | beautiful story lacks keyboard/touch/RTL/error proof | automatic rejection and two-pass review |
| Motion becomes decorative or slow | layout blur, input lag, excessive continuous animation | semantic motion recipes, performance trace and reduced-motion proof |
| White-label becomes recoloring | tenant proofs share geometry/type/material | extreme tenant fixtures and 15-point divergence score |
| Context is lost | a new session proposes a conflicting authority | mandatory reading order and decision states in this plan |

## 15. Immediate next work

The immediate work is the long K0 + K1 Modern macro-wave:

1. close the F2 same-tree density authority proof;
2. tighten the Daisy ceiling from 15 to 12 if the live gate still earns it;
3. reconcile current-state documentation and the 93/120 denominator;
4. sight first-party recipe-profile mappings before activating them;
5. run two implementation/craft iterations over Avatar, Badge, Tag, Link and
   Kbd;
6. run two iterations over Input, Textarea, PasswordInput, FormField,
   Checkbox, Radio, Switch and Toggle;
7. run two iterations over Alert, Callout, Message, Progress, Skeleton,
   Spinner, Empty and Result;
8. run one serial aggregate validation and independent Codex browser audit.

No external behavior supplier is installed in this tranche. The React Aria vs
Base UI bake-off remains the entry gate to the later complex-control wave.
Candidates is a read-only canary until this DS tranche is independently
accepted.

## 16. Current progress statement

The platform is not starting over.

- Catalog/engine breadth is high.
- White-label infrastructure is real but not yet radical enough by default.
- Accepted public primitive quality is 15.1% (14/93).
- Accepted platform quality is 11.7% across the explicit 120-artifact basket.
- The supplier strategy and master plan improve execution certainty but do not
  themselves increase the accepted component percentage.

The immediate objective is to make quality emerge from the DS automatically,
then use Candidates to prove it rather than manually beautifying Candidates
route by route.
