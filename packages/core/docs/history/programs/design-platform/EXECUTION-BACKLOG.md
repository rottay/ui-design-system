# Candidate Backlog and Roadmap Crosswalk

This is a candidate backlog and roadmap-crosswalk source, not an independent
execution state store. The canonical `roadmap/registry.json` remains the only
authority for claim/progress/done. Before code work, a row must be mapped to a
registered `WO-*` through the roadmap's sanctioned process.

Candidate status vocabulary:

- `proposed`: specified here but not yet mapped to a registered work order;
- `mapped`: a registered `WO-*` owns execution; the registry holds its live
  status and evidence;
- `review`: implementation is complete in the roadmap and awaits independent
  certification;
- `certified`: Codex accepted the artifact and updated the component ledger.

Claude may propose or implement a mapped ticket but cannot change it to
`certified`. Codex alone changes certification state. Every row below is
`proposed` until its explicit roadmap crosswalk is recorded. Parallel lanes may
edit separate owners, but integration builds and live visual validation remain
serial.

## Wave S — bounded supplier acceleration

| Ticket  | Status | Work                                                                 | Depends on | Acceptance                                                                                                                   |
| ------- | ------ | -------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| DS-S001 | proposed | Introduce the Rottay recipe facade backed by Tailwind Variants       | DS-A004, DS-Q001L | public recipes and slots are typed and tenant-compilable; applications do not import or encode raw supplier identity |
| DS-S002 | proposed | React Aria vs Base UI bake-off behind identical Rottay contracts     | DS-A002    | Claude recommends from identical evidence; Codex accepts/rejects and authorizes removal of the loser                        |
| DS-S003 | proposed | Existing DataTable runtime vs stable TanStack Table v8 bake-off      | DS-R002    | same Rottay renderer proves which runtime best serves state, capability, a11y, RTL, performance and maintenance               |
| DS-S004 | proposed | React Grid Layout 2 spike behind `PatternWidgetBoard`                | DS-A008    | continuous sizing, 2D collision/compaction, breakpoint layouts and serialization improve the existing eight-direction/keyboard/persistence baseline |
| DS-S005 | proposed | Extend supplier contract, provenance, import and class leakage gates | DS-S001    | exact versions, adapter-only imports, supplier-neutral public types and registered bundle budgets are enforced               |
| DS-S006 | proposed | Define supplier-neutral AI interaction and runtime contracts         | DS-A002    | streaming, tools, approval, artifacts, citations, cost and recovery render through Rottay contracts without SDK visual leakage |
| DS-S007 | proposed | AI runtime adapter bake-off for a measured product flow              | DS-S006    | assistant-ui, Vercel AI SDK or CopilotKit/AG-UI enters only for the runtime role it demonstrably improves                     |

The supplier ownership and rejection rules live in
[`SUPPLIER-ARCHITECTURE.md`](./SUPPLIER-ARCHITECTURE.md).

## Wave A — authority before polish

| Ticket  | Status | Work                                                                                                                     | Depends on       | Acceptance                                                                                                                             |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| DS-A001 | proposed | Define deterministic cascade layers and remove the universal tenant border floor                                       | —                | flagship surfaces need no specificity escalation or unexplained `!important`                                                           |
| DS-A002 | proposed | Add ownership lint for native interactive elements, local SVG, utilities and shared-chrome literals in patterns/surfaces | —              | violations fail with an allowlisted, documented exception path                                                                         |
| DS-A003 | proposed | Build token parity graph: declared → emitted → consumed → typed owner                                                  | —                | orphan declarations, dead emissions and unowned consumers are reported                                                                 |
| DS-A004 | proposed | Introduce governed semantic surface-role tokens                                                                        | DS-A003          | canvas/panel/card/control/inset/raised/overlay and content/edge/state/depth roles compile for static and DB themes                     |
| DS-A005 | proposed | Move BitHire surface-role paint out of static extension-only CSS                                                       | DS-A004          | contrasting DB tenant can replace surface personality without inheriting BitHire paint                                                 |
| DS-A006 | proposed | Unify CSS and JS density authority                                                                                     | DS-A003          | one density input produces matching runtime, CSS and responsive values                                                                 |
| DS-A007 | proposed | Add semantic typography roles and scalable type ramp                                                                   | DS-A003          | display/heading/title/body/supporting/label/caption/code/numeric are independently brandable                                           |
| DS-A008 | proposed | Add semantic motion recipes                                                                                            | DS-A003          | reflow, resize, drag pickup/drop, disclosure and async result have normal and reduced-motion paths                                     |
| DS-A009 | proposed | Add `DensityScopeContext` and scoped numeric token resolution                                                          | DS-A006          | `useTokens()` and CSS resolve the same structural × appearance × local posture for nested density boundaries                           |
| DS-A010 | proposed | Eliminate DB-theme hydration flash                                                                                     | DS-A003, DS-A006 | appearance variables are serialized or applied before first paint, with no JS/CSS density or material mismatch frame                   |
| DS-A011 | proposed | Retire obsolete specificity escalation from the former unlayered-skin posture                                         | DS-A001          | legacy selector escalation and unexplained `!important` are removed component by component without changing public anatomy             |

## Wave B — recipe architecture

| Ticket  | Status | Work                                                                             | Depends on | Acceptance                                                                                   |
| ------- | ------ | -------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| DS-R001 | proposed | Standardize recipe axes: `purpose`, `anatomy`, `density`, `emphasis`, `surfaceRole` | DS-A004 | recipe selection is typed, bounded and tenant-compilable                                  |
| DS-R002 | proposed | DataTable recipes: minimal, ruled, grid, zebra, editorial                      | DS-R001    | same markup renders five coherent personalities                                              |
| DS-R003 | proposed | ListToolbar recipes: flat, grouped, command, floating                          | DS-R001    | groups and responsive priority adapt by container                                            |
| DS-R004 | proposed | Tabs recipes: underline, contained, segmented, pills                           | DS-R001    | variant-specific tokens do not leak across recipes                                           |
| DS-R005 | proposed | Tooltip recipes: minimal, bordered, inverse, rich                              | DS-R001    | typography, padding, collision, arrow, delay and motion are governed                         |
| DS-R006 | proposed | Pagination recipes: joined, detached, compact, minimal                         | DS-R001    | DataTable and standalone Pagination share one implementation                                 |
| DS-R007 | proposed | Surface/SectionCard recipes                                                    | DS-R001    | nested boundaries, headers and depth remain coherent                                         |
| DS-R008 | proposed | Empty/Loading/Error recipes                                                    | DS-R001    | every data surface has useful, localized and motion-safe states                              |
| DS-R009 | proposed | Control-density recipes with accessibility floors                              | DS-A006    | Button/Input/Select geometry changes coherently without shrinking touch targets below policy |

## Wave C — canonical components

| Ticket    | Status | Work                                                             | Depends on | Acceptance                                                                                |
| --------- | ------ | ---------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| DS-CAN001 | proposed | Consolidate primitive Table and pattern DataTable ownership    | DS-R002    | one capability owns advanced behavior and one documented primitive owns markup            |
| DS-CAN002 | proposed | Repair DataTable contract consumption                          | DS-CAN001  | `bordered`, `compact`, zebra, filters, density and divisors are either honored or removed |
| DS-CAN003 | proposed | Make ListToolbar container-responsive                          | DS-R003    | narrow widgets collapse correctly on a wide viewport                                      |
| DS-CAN004 | proposed | Remove native control reconstruction from ListToolbar          | DS-A002    | Button/IconButton/Tooltip/Popover are canonical primitives                                |
| DS-CAN005 | proposed | Close Tabs token/compiler parity                               | DS-R004    | height, icon, badge, indicator, disabled and panel channels are typed and consumed        |
| DS-CAN006 | proposed | Introduce `BrandTooltipChrome` and remove inline geometry      | DS-R005    | DB tenant can visibly change Tooltip personality                                          |
| DS-CAN007 | proposed | Unify DetailPanel and RecordWorkbench on one RecordDetail shell | DS-R007   | one header/tabs/action anatomy across all entry points                                    |
| DS-CAN008 | proposed | Replace primitive reconstruction in EmptyState, Result and Sheet | DS-A002  | no native shared action, local glyph or untranslated accessible label remains             |
| DS-CAN009 | proposed | Consolidate `feedback/Modal` and `overlay/Modal` ownership     | DS-A002    | one canonical behavior/anatomy owner, compatibility alias and migration/deprecation rule are documented |

## Wave D — WidgetBoard interaction

| Ticket  | Status | Work                                                    | Depends on | Acceptance                                                                            |
| ------- | ------ | ------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| DS-W001 | proposed | Move drag activation from the current card control to the complete free header area | DS-A008 | mouse/touch/pen threshold, live reorder, release commit and Escape/cancel remain; interactive header controls never initiate drag |
| DS-W002 | proposed | Drag overlay, stable placeholder and true collision/compaction geometry | DS-W001 | active item and neighbors move with continuous spatial clarity rather than post-drop surprise |
| DS-W003 | proposed | Auto-scroll and accessible keyboard pickup/move/drop  | DS-W002    | long boards and keyboard users can complete reorder with localized announcements      |
| DS-W004 | proposed | Continuous inline/block sizing on the existing eight logical directions | DS-A008 | preset-only inline spans are removed or explicitly retained by policy; corners change both axes; RTL, cursors, keyboard sliders and stable neighbor motion remain |
| DS-W005 | proposed | Searchable, categorized widget catalog                | DS-R007    | preview, size, value, permissions, tier, compatibility, added state and configuration |
| DS-W006 | proposed | Versioned responsive layout persistence and mobile posture | DS-W001, DS-W004 | breakpoint layouts serialize supplier-neutrally; mobile has no tiny handles or desktop interaction leakage |

Current baseline evidence already covers eight logical/RTL-aware pointer
directions, diagonal resize, keyboard axis sliders, neighboring preview/reflow,
Escape cancellation, `items`/`onItemsChange` output and a focused 9/9 behavior
suite. The current control/card drag activation and preset inline width ramp are
the starting point, not completion claims. None of these candidate tickets is
certified until it is mapped, implemented, independently reviewed and linked to
Pass 2 live evidence.

## Wave E — generic product compounds

| Ticket  | Status | Capability             | Acceptance proof                                                       |
| ------- | ------ | ---------------------- | ---------------------------------------------------------------------- |
| DS-C001 | proposed | WorkspaceTabs          | one navigation grammar, container overflow and mobile adaptation       |
| DS-C002 | proposed | RecordHero             | context, identity, active decision and actions without domain coupling |
| DS-C003 | proposed | ActionDock             | priority, overflow and mobile reduction                                |
| DS-C004 | proposed | PriorityBand           | ranked entity/risk/evidence/impact/cost/action rows                    |
| DS-C006 | proposed | DecisionBrief          | diagnosis, evidence, uncertainty and coordinated plan                  |
| DS-C007 | proposed | AssistantRail          | scoped context, sources, recommendations and cost-aware actions        |
| DS-C008 | proposed | JourneyWorkspace       | temporal groups, event cards, summary rail and channel breakdown       |
| DS-C009 | proposed | DetailFactsEditor      | autosave ledger, provenance, required/protected/readonly/stale states  |
| DS-C012 | proposed | PeekPanel              | focus-safe, responsive universal record preview                        |
| DS-C013 | proposed | SplitDecisionWorkspace | demand selector, ranked slate and secondary analytics                  |

## Wave E2 — canonical surfaces

| Ticket    | Status | Surface             | Depends on                      | Acceptance                                                                                                      |
| --------- | ------ | ------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| DS-SUR001 | proposed | ListSurface         | DS-C001, DS-CAN003, DS-CAN004   | one header/tabs/toolbar/table/pagination grammar; container-responsive and deliberate mobile reduction          |
| DS-SUR002 | proposed | OverviewSurface     | DS-C004, DS-C006, DS-C007       | priority-first hierarchy, balanced main/rail regions, progressive disclosure and complete operational states    |
| DS-SUR003 | proposed | RecordSurface       | DS-C002, DS-C003, DS-C008       | identity, context, active decision, journey and actions share one responsive shell without app chrome repair    |
| DS-SUR004 | proposed | DecisionSurface     | DS-C006, DS-C012, DS-C013       | demand, evidence, comparison and verdict remain aligned, navigable and useful under narrow containers           |
| DS-SUR005 | proposed | WidgetWorkspace     | DS-S004, DS-W001..DS-W006       | catalog, drag, resize, persistence, collision, keyboard and mobile posture are coherent and tenant-customizable  |
| DS-SUR006 | proposed | AIWorkspace         | DS-S006, DS-AI001..DS-AI006     | streaming, plan, tool, approval, artifact and recovery grammar compose without SDK or provider visual leakage   |

## Wave AI — supplier-neutral AI grammar

| Ticket   | Status | Capability                                      | Acceptance                                                                                                             |
| -------- | ------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| DS-AI001 | proposed | AI status, streaming and generation controls    | queued/thinking/streaming/waiting/complete/error/cancel states are localized, announced and motion-safe               |
| DS-AI002 | proposed | Source, confidence and token-cost primitives     | provenance, freshness, uncertainty, estimate/actual cost and permissions are legible without fake precision           |
| DS-AI003 | proposed | PromptComposer and suggestion grammar            | attachments, mentions, scope, voice, context, model/capability and cost preview remain responsive and supplier-neutral |
| DS-AI004 | proposed | RecommendationCard and PlanPreview               | value, evidence, editable scope, side effects, token estimate and execute boundary make usage voluntary and informed  |
| DS-AI005 | proposed | ApprovalGate, AgentRun, Artifact and Diff patterns | interruption, tool status, background work, partial failure, accept/reject and undo have complete recovery paths      |
| DS-AI006 | proposed | AssistantRail, GenerativeSurface, UsageInsight    | entity-scoped copilot and typed generated UI use approved Rottay components and show outcome value after completion    |

## Wave F — visual and tenant proof

| Ticket  | Status | Work                                 | Acceptance                                                                                                                                             |
| ------- | ------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DS-Q001L | proposed | Existing-fixture divergence proof | current radius-zero technical and rounded editorial fixtures render accepted Card/Button/Tabs trees with material structural divergence before new fixtures |
| DS-Q001 | proposed | Expand torture-tenant fixtures       | editorial, technical, humanist, rustic, monochrome, radius-0, ultra-rounded, compact, spacious and dark                                                |
| DS-Q002 | proposed | Story matrix generator               | state × density × container × direction × motion × tenant evidence                                                                                     |
| DS-Q003 | proposed | Visual regression thresholds         | geometry and clipping are blocking; antialias noise is bounded                                                                                         |
| DS-Q004 | proposed | Content torture corpus               | long translations, RTL, missing data, extreme numbers, async states and coarse pointer                                                                 |
| DS-Q005 | proposed | APCA/WCAG surface-content validation | invalid tenant pairs fail compilation or fall back safely                                                                                              |
| DS-Q006 | proposed | Application ownership gate           | app CSS cannot reach private DS anatomy or hardcode shared chrome                                                                                      |
| DS-Q007 | proposed | Real-component tenant preview        | no hand-built HTML approximation remains                                                                                                               |
| DS-Q008 | proposed | Cross-brand locale proof             | identical markup is captured for BitHire static and The Management DB across English/Spanish plus Arabic RTL; brand and locale never imply one another |

## Wave G — Candidates as product proof

| Ticket   | Status | Golden state        | Acceptance                                                                        |
| -------- | ------ | ------------------- | --------------------------------------------------------------------------------- |
| APP-C001 | proposed | Candidates overview | “Today” priority first; secondary movements and analytics progressively disclosed |
| APP-C002 | proposed | Candidate dossier   | RecordHero, journey ribbon, DecisionBrief and AssistantRail                       |
| APP-C003 | proposed | Candidate journey   | timeline primary, summary/channel rail secondary                                  |
| APP-C004 | proposed | Candidate details   | dense facts ledger desktop, deliberate card adaptation mobile                     |
| APP-C005 | proposed | Candidates list     | one tabs/toolbar/table/pagination grammar and universal peek                      |
| APP-C006 | proposed | Candidate matching  | slate-first decision workspace; analytics secondary                               |
| APP-C007 | proposed | Candidate compare   | one toolbar, aligned columns, persistent verdict, no chrome collision             |

## Parallel execution policy

- Lane 1 may change contracts/compiler/tokens.
- Lane 2 may change one isolated primitive family.
- Lane 3 may change one pattern/structure family.
- Lane 4 may prepare stories, fixtures and audit evidence.
- No two lanes edit the same generated artifact or integration barrel.
- Generated artifacts are rebuilt only after source owners merge locally.
- One focused check, one package build and one live validation sequence run
  serially at wave close.
- Every ticket receives Pass 1 and Pass 2 review from different criteria.
