# Rottay Design Platform 10/10

Status: active product-platform overview

Start every implementation or review with the authoritative
[`MASTER-IMPLEMENTATION-PLAN.md`](./MASTER-IMPLEMENTATION-PLAN.md). It records
the verified baseline, target architecture, supplier decision gates, execution
order, quality score, evidence policy and context-recovery procedure. This
README summarizes the platform contract; it does not supersede the master plan.

This document is the concise orientation for turning the Rottay design system
into the shared product-construction platform for every vertical and customer
tenant. It is not an execution-state authority. The canonical Modern
specification and `roadmap/registry.json` keep their existing roles; the master
plan defines this program's target and certification contract. BitHire
Candidates is the first live proving ground, not the owner of the visual
grammar.

## Objective

Build a design platform that lets Rottay create many applications quickly from
the same high-quality material while preserving three independent freedoms:

1. The design system guarantees excellent defaults, behavior and accessibility.
2. A product application composes those capabilities into domain-specific UX.
3. A vertical or tenant changes its personality through governed tokens and
   recipes without forking component markup or patching component internals.

The target is not merely token coverage. A component is complete only when it
is attractive by default, robust under real content, adaptive across input and
screen modes, and visibly different under contrasting brand recipes.

## Current baseline

These scores are provisional until the active code audits close:

| Capability | Baseline | Target |
| --- | ---: | ---: |
| White-label runtime and authority | 6.0 / 10 | 9.5 / 10 |
| Internationalization infrastructure | 7.0 / 10 | 9.5 / 10 |
| Primitive breadth | 7.5 / 10 | 9.5 / 10 |
| Compound and pattern breadth | 5.0 / 10 | 9.0 / 10 |
| Default visual quality | 3.5 / 10 | 9.5 / 10 |
| Interaction and motion quality | 4.0 / 10 | 9.5 / 10 |
| App composition discipline | 4.5 / 10 | 9.0 / 10 |
| Visual verification | 3.5 / 10 | 9.5 / 10 |

The repository currently exposes 93 public primitive families: 89
engine-backed Modern primitives plus public CodeBlock, MarkdownView and
VoiceInputButton families plus public SemanticSurface. It also has 39 Modern pattern engines, 46 physical
structure entrypoints and 51 physical surface entrypoints. Those entrypoint
counts are not top-level family counts. Breadth therefore is not the main
blocker. Consistent recipes, authored defaults, state quality and compositional
discipline are.

Certified quality is currently 14/93 public primitives (15.1%) and 14/120
overall artifacts (11.7%); the full basket also includes 15 selected
cross-product artifacts, 6 canonical surfaces and 6 AI capability families.

The bounded third-party strategy and pending bake-offs are defined in
[`SUPPLIER-ARCHITECTURE.md`](./SUPPLIER-ARCHITECTURE.md). Suppliers may provide
headless behavior or layout mathematics behind Rottay contracts; they never
become a second visual or tenant authority.

## Document map

| Document | Purpose |
| --- | --- |
| [`MASTER-IMPLEMENTATION-PLAN.md`](./MASTER-IMPLEMENTATION-PLAN.md) | Platform target, diagnosis, dependency sequence, quality gates and certification policy |
| [`SUPPLIER-ARCHITECTURE.md`](./SUPPLIER-ARCHITECTURE.md) | Supplier boundaries, bake-offs, scorecard and rejection rules |
| [`COMPONENT-LEDGER.md`](./COMPONENT-LEDGER.md) | Per-artifact P1/P2 status, score and accepted evidence |
| [`EXECUTION-BACKLOG.md`](./EXECUTION-BACKLOG.md) | Candidate ticket graph and roadmap crosswalk; `roadmap/registry.json` remains execution-state authority |
| [`CLAUDE-IMPLEMENTATION-RUNBOOK.md`](./CLAUDE-IMPLEMENTATION-RUNBOOK.md) | Exact implementation workflow, stop conditions and evidence package |
| [`CODEX-AUDIT-PROTOCOL.md`](./CODEX-AUDIT-PROTOCOL.md) | Independent audit sequence, finding severity and acceptance authority |
| [`CLAUDE-HANDOFF-PROMPT.md`](./CLAUDE-HANDOFF-PROMPT.md) | Initial-tranche implementation prompt retained for history |
| [`CODEX-AUDIT-2026-07-23.md`](./CODEX-AUDIT-2026-07-23.md) | Independent audit verdict, corrections, verification and remaining closure |
| [`CODEX-AUDIT-OLA-2-2026-07-23.md`](./CODEX-AUDIT-OLA-2-2026-07-23.md) | OLA 2 DS-S001 audit, Codex remediation, evidence and conditional acceptance |
| [`CODEX-AUDIT-OLA-3-2026-07-23.md`](./CODEX-AUDIT-OLA-3-2026-07-23.md) | OLA 3 DS-Q001L audit, Codex remediation, sighted evidence and Phase 1 acceptance |
| [`CODEX-AUDIT-OLA-4-2026-07-23.md`](./CODEX-AUDIT-OLA-4-2026-07-23.md) | OLA 4 semantic-surface, Modern bridge and application-boundary audit with Codex remediation |
| [`CODEX-AUDIT-OLA-5-2026-07-23.md`](./CODEX-AUDIT-OLA-5-2026-07-23.md) | OLA 5 partial-delivery audit, boundary-gate remediation and continuation decision |
| [`CODEX-AUDIT-OLA-5-CONTINUATION-2026-07-23.md`](./CODEX-AUDIT-OLA-5-CONTINUATION-2026-07-23.md) | OLA 5 F2/F3 continuation audit, Codex remediation, sighted evidence and acceptance boundary |
| [`CODEX-AUDIT-OLA-5-F2-CLOSURE-2026-07-23.md`](./CODEX-AUDIT-OLA-5-F2-CLOSURE-2026-07-23.md) | OLA 5 F2 closure-attempt audit, authority remediation, deterministic validation and remaining proof boundary |
| [`CLAUDE-NEXT-WAVE-PROMPT.md`](./CLAUDE-NEXT-WAVE-PROMPT.md) | Ready-to-copy ambitious next-wave closure prompt |
| [`KIMI-INDEPENDENT-AUDIT-PROMPT.md`](./KIMI-INDEPENDENT-AUDIT-PROMPT.md) | Read-only independent Kimi architecture/visual audit and macro-wave proposal; no implementation before approval |
| [`KIMI-INDEPENDENT-DS-AUDIT-2026-07-23.md`](./KIMI-INDEPENDENT-DS-AUDIT-2026-07-23.md) | Kimi's independent audit; useful evidence with mandatory Codex corrections |
| [`CODEX-RECONCILIATION-KIMI-AUDIT-2026-07-23.md`](./CODEX-RECONCILIATION-KIMI-AUDIT-2026-07-23.md) | Authoritative accept/correct/defer verdict and Modern-first macro-wave decision |
| [`KIMI-MODERN-K0-K1-MACRO-WAVE-PROMPT.md`](./KIMI-MODERN-K0-K1-MACRO-WAVE-PROMPT.md) | Ready-to-copy autonomous K0 + 21-family K1 implementation prompt |

## Non-negotiable architecture

### Authority

- Code-owned verticals such as Rottay, BitHire and Evnto use static-first
  `BrandTheme` sources compiled into versioned artifacts.
- Customer tenants are DB-owned and receive a validated, server-compiled
  `TenantThemeDocument` on first paint.
- A hostname selects identity. It never selects an application CSS fork.
- A customer tenant can change bounded appearance and branding; it cannot
  choose arbitrary component code, icon semantics or product behavior.
- Components never fetch theme data and never branch on a tenant name.

### Layer ownership

```text
foundation values
  -> semantic intent tokens
    -> component recipes
      -> compounds and patterns
        -> product composition
          -> vertical/tenant personality artifact
```

| Layer | Owns | Must not own |
| --- | --- | --- |
| Foundation | ramps, scales, raw timing and geometry | product meaning |
| Semantic tokens | intent such as canvas, border, emphasis, danger | component DOM |
| Component recipes | anatomy, states, density and visual relationships | product data |
| Compounds/patterns | reusable interaction and information grammar | tenant identity |
| Application | domain content, ordering, workflow and responsive priority | primitive repair |
| Vertical/tenant | bounded personality and brand expression | behavior forks |

### Application styling boundary

Applications may:

- choose a public variant, density, emphasis or recipe;
- compose responsive layouts using DS primitives and public slots;
- style domain-specific content through documented custom properties and
  public `data-part` hooks;
- create a recruiting-specific compound from DS material when the pattern has
  no credible cross-product meaning;
- decide information hierarchy, action priority and mobile reduction.

Applications may not:

- reach into undocumented DS descendants;
- repair a Button, Tooltip, Card, Table, modal or form control with local CSS;
- introduce raw colors, radii, shadows, font families or motion curves for
  shared chrome;
- recreate a DS primitive with raw HTML because the primitive is inconvenient;
- branch visual behavior by tenant name;
- hardcode user-facing strings outside the i18n contract.

## Customization contract

A tenant recipe must be able to change the following without component markup
changes. Every axis needs a canonical source, a compiled variable and verified
consumption by the rendered component.

### Typography

- display, heading, body, label and mono families;
- size ramps and optical hierarchy;
- weights, tracking, line height and text transforms;
- numeric alignment and tabular behavior;
- truncation, wrapping and maximum readable measure;
- locale-aware fallbacks, including Arabic glyph coverage.

### Geometry

- canvas, panel, card, control, pill and overlay radius families;
- border width, style, contrast and inset treatment;
- control and row heights by density;
- internal padding, inter-part gaps and section rhythm;
- icon container geometry independent from icon meaning;
- compact, comfortable and spacious layout recipes.

### Surfaces and depth

- canvas, recessed, panel, card, raised and overlay roles;
- flat, outlined, soft, elevated and glass-like bounded recipes;
- coordinated border/elevation pairs rather than unrelated shadows;
- header/body/footer separation and surface nesting rules;
- hover, selected, focused, pressed, disabled and drag states;
- light, dark and high-contrast behavior.

### Color and emphasis

- brand and accent ramps;
- neutral temperature and contrast distribution;
- semantic states and subdued state containers;
- action hierarchy, focus ring and selection treatment;
- data visualization palette and categorical differentiation;
- WCAG contrast floors that tenant overrides cannot undercut.

### Icons and assets

- semantic icon role chosen by the component;
- governed size, container, weight and optical alignment recipes;
- brand marks kept separate from functional glyphs;
- no arbitrary tenant replacement of functional meaning;
- accessible labels whenever the icon is not decorative.

### Motion and interaction

- duration, easing, stagger and travel-distance ramps;
- hover lift, press, reveal, selection, layout and overlay recipes;
- pointer, touch and keyboard parity;
- reduced-motion alternatives that preserve state comprehension;
- no decorative animation that blocks action or creates layout instability.

### Content density and responsive behavior

- density changes must alter coordinated height, type, padding and icon scale;
- container queries own continuous component adaptation;
- product runtime contracts own true information-priority changes;
- mobile is allowed to expose a reduced action set, never illegible desktop UX;
- overflow, long translations and extreme values are first-class states.

## Component completion scorecard

The only numeric rubric, thresholds and automatic-rejection list live in
[`MASTER-IMPLEMENTATION-PLAN.md`](./MASTER-IMPLEMENTATION-PLAN.md#10-quality-score).
This README deliberately does not duplicate them.

## Two-pass iteration rule

Every artifact still receives Pass 1 product/contract review and Pass 2
adversarial craft review. The canonical criteria and evidence package live in
the master plan and runbook; passing the first review never implies visual
approval.

## Motion system

Motion is a product language, not decorative polish. The platform distinguishes
three governed levels:

### Productive motion

Used frequently to explain state and preserve context:

- hover, press and focus response;
- expand/collapse and progressive disclosure;
- sorting, filtering and row insertion/removal;
- drag, resize and layout reflow;
- loading-to-content and save confirmation;
- overlay enter/exit and focus transfer.

Productive motion is brief, interruptible and spatially consistent. Layout
changes use continuity rather than teleportation.

### Expressive motion

Reserved for infrequent, meaningful events:

- first successful setup;
- a completed workflow or accepted recommendation;
- a high-impact AI result becoming ready;
- a major page/surface transition where continuity adds comprehension.

Expressive motion may use stagger, depth or animated symbols, but it never
delays work and is never the only carrier of meaning.

### Ambient motion

Extremely subtle, optional personality only:

- slow surface-light or texture response;
- restrained AI processing shimmer;
- low-amplitude status presence.

Ambient motion is disabled under reduced motion, low-power constraints or a
restrained tenant recipe. It never runs across large peripheral regions.

Every motion recipe defines:

- purpose and trigger;
- affected property and travel distance;
- duration and easing tokens;
- interruption/cancellation behavior;
- reduced-motion equivalent;
- input-specific response where touch and pointer should differ;
- performance budget and allowed concurrency.

## AI interaction grammar

The system should feel AI-native through useful behavior, not purple paint,
sparkles or constant animation.

Required generic compounds and states include:

- `AIAction`: intent, expected outcome, cost, latency and reversibility;
- `AIRecommendation`: evidence, confidence, why, alternatives and feedback;
- `AIProgress`: queued, retrieving, reasoning, drafting, validating and ready;
- `AIResult`: sources, freshness, uncertainty and editable output;
- `AIPlan`: coordinated steps with preview-before-run and partial execution;
- `AIFeedback`: useful/not useful, correction and reason capture;
- `AIFailure`: limitation, retained work, retry and manual path;
- `TokenCost`: exact or bounded cost before commitment and actual cost after;
- `AssistantRail`: scoped context, citations and next-best investments.

AI UX requirements:

- establish a truthful mental model of capability and limitation;
- calibrate confidence rather than displaying certainty theater;
- reveal enough evidence to support a decision;
- preserve user control, editability, cancellation and recovery;
- stream or progressively reveal meaningful stages when latency exists;
- never animate fake progress;
- announce important asynchronous changes accessibly;
- show why an action is valuable before encouraging token consumption;
- use cost as informed choice, not a dark pattern.

## Required component evidence matrix

Each upgraded component receives a Storybook or showroom matrix with:

1. default, hover, focus-visible, pressed and disabled;
2. loading, success, warning, error and empty where applicable;
3. compact, comfortable and spacious densities;
4. light, dark and high-contrast canvases;
5. BitHire static vertical plus a contrasting DB-tenant fixture;
6. short, long and pathological content;
7. desktop, narrow container and mobile;
8. LTR and RTL;
9. normal and reduced motion;
10. pointer and keyboard interaction evidence.

Screenshots alone are insufficient for behavioral claims. DOM assertions alone
are insufficient for visual claims. Both are required at wave sign-off.

## Upgrade sequence

The canonical dependency sequence is
[`MASTER-IMPLEMENTATION-PLAN.md`](./MASTER-IMPLEMENTATION-PLAN.md#9-execution-sequence).
Candidate tickets and their roadmap-crosswalk state are in
[`EXECUTION-BACKLOG.md`](./EXECUTION-BACKLOG.md). The README does not maintain a
second wave numbering system.

## DataTable flagship acceptance contract

The Candidates list is the first proof for the operational data stack.

The same table markup must support at least:

- dense enterprise operations;
- refined editorial SaaS;
- warm/rustic personality;
- soft high-legibility recruiting;

through theme/recipe changes. The contract covers:

- coordinated outer, toolbar, header, cell, pill, action and pagination radii;
- column and row separators with stable contrast;
- tokenized row height and horizontal/vertical cell padding;
- header type, tracking, capitalization and icon alignment;
- hover, focus-within, selection, loading and stale-row states;
- icon-only action size, affordance and premium tooltip;
- aligned filters, search, saved views, density and pagination;
- sticky header and pinned-column depth treatment;
- responsive priority, horizontal overflow and compact card fallback;
- empty, error, partial-data and permission states;
- keyboard row and column-management interactions.

## WidgetBoard flagship acceptance contract

- the complete free area of the edit header is a move handle;
- pointer interaction uses a movement threshold and works for mouse and touch;
- neighboring widgets reflow during the gesture rather than after it;
- motion is spatially continuous and token governed;
- release commits, Escape/pointer-cancel restores the original layout;
- keyboard reorder remains available;
- all four edges and four corners resize with honest cursors;
- diagonal resize changes both axes in one gesture;
- controls never overlap content or create permanent colored side rails;
- catalog items explain value, size, category and preview before insertion;
- adding/removing/reordering/resizing is persisted by the host contract;
- mobile receives a deliberate reduced customization mode.

## Internationalization contract

- all DS-owned and app-owned user copy is message-key based;
- English, Spanish and Arabic catalogs are mandatory acceptance locales;
- French and Portuguese may remain supported/future compatibility locales, but
  they are not acceptance blockers for this program until explicitly promoted;
- pluralization, dates, numbers, currency and relative time are locale aware;
- RTL changes logical geometry, ordering and directional icons correctly;
- no fixed width assumes English copy;
- user and tenant content is never treated as a translatable literal;
- component labels, live-region messages and accessible names are localized.

## Working model

- Research and implementation may run in parallel by independent file area.
- Agents do not run builds or broad checks concurrently.
- Changes accumulate into coherent waves.
- Each wave gets one focused behavioral check, one package build and one live
  visual validation sequence, in that order.
- Extra browser tabs and duplicate servers are closed after validation.
- No commits are made during this program unless the user explicitly requests
  one.

## External design references

These references inform the contract; they are not copied visual styles:

- Apple Human Interface Guidelines: purposeful, brief, cancelable motion,
  platform/input adaptation and reduced-motion responsibility.
- Fluent 2 Motion: functional, natural, consistent and appealing transitions;
  duration follows distance and element scale.
- Carbon Motion: productive motion for repeated work and expressive motion for
  occasional important moments.
- Google PAIR Guidebook: mental models, calibrated trust, explainability,
  feedback/control and graceful AI failure.

## Definition of done

The authoritative Definition of Done, thresholds and rejection gates live in
the master plan and Codex audit protocol. At summary level, all 120 basket
artifacts must be certified in their categories, the accepted stack must prove
radically different static and DB tenant personalities plus EN/ES/AR and RTL,
and BitHire Candidates must validate the stack without local primitive repair.
