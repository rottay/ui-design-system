# Modern Supplier Architecture

Status: architecture principles accepted; supplier choices pending bounded bake-offs
Scope: Modern engine first; Classic and Rustic keep their existing contracts
Decision owner: Rottay Design Platform

## Decision

Modern remains a Rottay-owned engine. It is not replaced by Ant, Mantine, MUI,
DaisyUI, Tailwind UI, shadcn/ui, or another visual component system.

The existing Ant-to-Modern replication is an asset, not discarded work:

- all 89 engine-backed public primitives have physical Classic, Modern, and
  Rustic engines, while CodeBlock, MarkdownView and VoiceInputButton are
  specialized public primitive families outside that engine-backed count;
- Modern currently has 132 physical primitive, pattern, and structure
  implementations;
- the public contracts, engine registry, token compiler, BrandTheme,
  Appearance projection, icon facade, motion layer, and CSS distribution stay
  authoritative.

Modern may use narrowly selected headless suppliers for behavior or layout
mathematics that are expensive to reproduce correctly. Suppliers never own
Rottay markup contracts, visual identity, copy, tokens, recipes, slots, motion
personality, or tenant persistence.

```text
BrandTheme static / Appearance DB
                |
                v
     canonical --ds-* channels
                |
                v
       Rottay recipes + slots
                |
                v
       Rottay public components
                |
                +--> headless behavior suppliers
                +--> state/layout math suppliers
                +--> Motion adapter
```

## Why this direction

A wholesale visual-library migration would replace an existing catalog without
solving the main quality deficit. The current deficit is concentrated in:

1. incomplete behavior in complex controls;
2. insufficiently coordinated component recipes and slot anatomy;
3. duplicated or framework-shaped paint;
4. weak pattern and surface composition;
5. incomplete adversarial, brand, locale, RTL, responsive, and motion proof.

Headless suppliers accelerate the first problem. Rottay must solve the other
four because they are the actual white-label product.

## Supplier matrix

| Responsibility | Decision | Ownership boundary |
| --- | --- | --- |
| CSS compilation and authoring | Keep Tailwind CSS 4 | Internal semantic utilities only. Utilities map to canonical `--ds-*`; product code must not encode brand colors, radii, shadows, or density. |
| Typed multi-slot recipes | Adopt Tailwind Variants behind a Rottay recipe facade | Rottay declares recipe axes, slots, defaults, allowed overrides, and tenant compilation. Applications consume Rottay recipes, not `tv()` directly. |
| Accessible complex controls | Bake off `react-aria-components` against `@base-ui/react` | Both are unstyled candidates. One primary supplier may own overlapping focus, collection, keyboard, ARIA, locale and overlay mechanics only after the same Rottay contracts, slots and skins are used in the comparison. |
| Tables and data grids | Bake off the existing Rottay runtime against stable TanStack Table v8 | `PatternDataTable` already owns a broad runtime. TanStack is evaluated for state correctness, advanced functionality, performance, accessibility and maintenance with the same Rottay renderer; it is not adopted for visual reasons. |
| Forms | Standardize React Hook Form + Zod adapters at the pattern layer | Form state and schemas are application/domain concerns. Rottay supplies fields, error anatomy, localized message codes, layout recipes, and adapters without forcing schemas into primitives. |
| Motion | Keep Motion through the existing Rottay motion authority | No direct product animation constants. Rottay motion recipes govern enter/exit, disclosure, feedback, reorder, resize, reduced motion, and tenant personality. |
| Sortable lists and simple reorder | Keep legacy dnd-kit; evaluate the pre-1.0 `@dnd-kit/react` line only through a controlled compatibility spike | Rottay owns drag handles, activation thresholds, overlays, announcements, localized keyboard instructions, reduced motion, and fallback move actions. |
| Responsive widget grid | Bake off the current board runtime against React Grid Layout 2 behind `PatternWidgetBoard` | RGL is the leading candidate for collision, compaction, responsive layouts, serialization and eight-direction pointer resize. It enters only if the same public Rottay board gains measurable capability and quality. |
| Charts | Keep D3 through the current chart layer | D3 supplies visualization math. Rottay owns chart specs, palettes, typography, accessibility, motion, empty states, and tenant styling. |
| Icons | Keep the Rottay semantic icon facade | Applications and components do not import supplier icon names as product semantics. |
| Overlay positioning | Use the winner of the complex-control bake-off; evaluate Floating UI only for a proven uncovered case | No duplicate overlay engine without an explicit gap and removal plan. |
| AI interaction patterns | Own Rottay visual contracts; use current ecosystems as research and runtime candidates | AI Elements is a pattern corpus. assistant-ui, Vercel AI SDK and CopilotKit/AG-UI may supply runtime mechanics behind normalized Rottay event/message adapters; none owns visual identity. |

## Explicit non-decisions

### Do not add another styled component system

Mantine, MUI, Chakra, shadcn/ui, Tailwind UI, and other styled examples may be
used as research or visual references. They are not runtime visual authorities.
Adding one would create a fourth styling language and make radical tenant
personalities harder, not easier.

Base UI is not grouped with those styled systems. It is an unstyled behavior
candidate and may enter only if it wins Spike S-02.

AG Grid and MUI X are also excluded from the first table bake-off: their
commercial/styled surface area and migration cost do not address a visual
problem because both table candidates must render through the same Rottay
presentation. Radix, Ark UI and Ariakit are not rejected categorically, but
they do not enter the initial complex-control bake-off because React Aria and
Base UI already cover that measured responsibility. Reconsider one only when a
named, reproduced gap survives the selected supplier and the existing Modern
contract; never add a third overlapping runtime as speculative insurance.

### Do not rebuild Ant inside Modern

Modern already has the public surface area. The goal is not to independently
reimplement every focus manager, collection model, locale formatter, collision
algorithm, and grid compactor. Those invisible mechanics are where mature
headless suppliers save time.

### Do not expose suppliers to applications

An application may compose public DS components, choose public recipes and
variants, fill documented slots, and apply feature-scoped styles through stable
DS hooks. It must not:

- import React Aria, Base UI, TanStack Table, React Grid Layout, or Tailwind
  Variants to restyle a Rottay component;
- address private supplier anatomy;
- define a second global token authority;
- persist raw arbitrary CSS as tenant identity;
- depend on DaisyUI class names.

## White-label authority

Tokens are necessary but not sufficient for radical white-label.

The platform exposes four bounded layers:

1. **Tokens** change values: color, type, spacing, density, radius, border,
   depth, texture, focus, icon geometry, and motion.
2. **Recipes** change coordinated personality: outlined, soft, solid, ghost,
   borderless; compact, comfortable, spacious; underline, contained,
   segmented, pills; quiet, expressive, technical, editorial.
3. **Slots** expose stable named anatomy for documented feature-level
   customization.
4. **Patterns and surfaces** change composition while preserving data,
   permissions, semantics, responsiveness, and accessibility.

Verticals owned by Rottay select a static BrandTheme and recipe profile.
Customer tenants receive the same closed schema through DB Appearance.
Appearance stores typed values and recipe identifiers, not raw global CSS.

## Dependency rules

1. One supplier per responsibility unless a written exception proves a gap.
2. New suppliers enter through a single Rottay adapter directory.
3. Public component props cannot contain supplier-specific types.
4. Supplier classes and data attributes cannot become application contracts.
5. Supplier CSS cannot own tenant identity or win by specificity.
6. Exact versions are pinned during the spike and added to the supplier
   contract and third-party notices.
7. A spike is rejected if it materially increases duplicate paint, bundle
   weight, hydration instability, RTL defects, or inaccessible interactions.
8. Every accepted supplier has an exit seam: Rottay public APIs and serialized
   product data remain supplier-neutral.
9. Claude may prepare adapters, evidence, scorecards and a recommendation.
   Codex accepts/rejects the decision and authorizes removal of the losing
   spike; the implementer never accepts its own supplier choice.

Version snapshot verified from the npm registry on 2026-07-22:

- `tailwind-variants@3.2.2` (already installed as a spike, not accepted);
- `react-aria-components@1.19.0`;
- `@base-ui/react@1.6.0`;
- `@tanstack/react-table@8.21.3` (stable v8; v9 beta is excluded);
- `react-grid-layout@2.2.3`;
- `@dnd-kit/react@0.5.0` (pre-1.0; migration may be deferred).

Exact versions are pinned again when a spike begins because this snapshot is
evidence, not standing permission to install.

## Implementation sequence

### Spike S-01 — recipes

- Add a Rottay recipe facade backed by Tailwind Variants.
- Prove Card, Button, Tabs, Tag, DataTable, and Surface recipes.
- Prove two strongly different tenant profiles with identical component trees.
- Prevent raw palette/radius/shadow utilities in product code.

### Spike S-02 — complex control behavior

- Implement React Aria and Base UI prototypes behind identical temporary
  Rottay adapters for Select/ComboBox, Drawer/Dialog and one locale-intensive
  field.
- Prove keyboard, screen reader semantics, touch and virtual-keyboard behavior,
  focus restoration, EN/ES/AR, RTL, disabled/read-only/error states, SSR,
  hydration and reduced motion.
- Score both against the current Modern implementation and the supplier
  scorecard.
- Claude recommends one primary supplier for overlapping responsibilities.
  Codex independently accepts/rejects and authorizes removal of the losing
  dependency. A tie means neither enters until a measured differentiator
  exists.

### Spike S-03 — data-table runtime

- Keep the same `PatternDataTable` public contract, renderer, recipes and test
  corpus while running the existing runtime and TanStack Table adapters.
- Compare controlled/server state, sorting, filtering, grouping, expansion,
  selection, column sizing/order/visibility/pinning, RTL, hostile datasets,
  bundle cost, code removed, test complexity and migration risk.
- Do not score visual appearance because both candidates use the same Rottay
  presentation.
- Keep the current runtime if TanStack does not materially improve the weighted
  score. Add virtualization only after profiling demonstrates a rendering
  need.

### Spike S-04 — widget board

- Put the current runtime and React Grid Layout behind identical temporary
  `PatternWidgetBoard` adapters.
- Preserve the existing eight logical/RTL-aware pointer handles, diagonal
  resize, keyboard-axis sliders, live reflow preview, Escape cancellation and
  `items`/`onItemsChange` persistence contract.
- Compare continuous inline sizing, true 2D coordinates, collision/compaction,
  breakpoint-specific layouts and a versioned serialized layout format.
- Animate neighboring-widget reflow using Rottay motion recipes.
- Make the documented header region a drag activator, excluding interactive
  controls.
- Add keyboard move/resize controls, localized live announcements, undo/reset,
  collision previews, minimum/maximum constraints, responsive layouts, touch
  behavior, persistence, and a compact mobile mode.
- Compare capability completeness, interaction quality, source complexity,
  performance, bundle delta, persistence compatibility and migration risk.
- Keep one runtime and remove the losing adapter/dependency.

### Spike S-05 — supplier governance

- Extend supplier-contract generation and source gates.
- Reject direct product imports, supplier-specific public types, leaked
  supplier classes, and non-semantic Tailwind identity utilities.
- Record bundle deltas and exact version provenance.

### Spike S-06 — AI interaction contracts

- Define supplier-neutral `AgentEvent`, message-part, tool-run, approval,
  artifact, citation, cost and recovery contracts.
- Use AI Elements as a pattern and state inventory, not as a visual dependency.
- Prototype one streaming conversation, one inline recommendation, one tool
  approval and one generated artifact with Rottay primitives.
- Evaluate assistant-ui, Vercel AI SDK and CopilotKit/AG-UI only after the
  contracts exist and only for the runtime responsibility each actually
  improves.
- Reject any adapter that leaks provider message types, class names, icons or
  visual assumptions into public DS APIs.

## Acceptance gate

A spike is accepted only when:

- the existing public API remains compatible or has an explicit migration;
- BitHire static BrandTheme and The Management DB Appearance render visibly
  different personalities from the same component tree;
- EN, ES, and AR are localized, and AR is RTL;
- desktop, tablet, and mobile have no overlap, clipping, or empty accidental
  space;
- keyboard and pointer actions have outcome parity;
- reduced motion is useful rather than merely disabled;
- focus, hover, active, selected, disabled, loading, empty, error, and success
  states are visually and semantically complete;
- no supplier visual identity leaks into application code;
- visual review reaches the component ledger threshold before Candidates is
  used as application proof.

## Current position

The catalog replication is substantially complete; supplier architecture is
not. This document does not increase the accepted component percentage by
itself. It prevents the next waves from spending time rebuilding difficult
behavior or introducing another styling authority.

The last measured acceptance remains:

- 14 of 93 public primitives accepted: 15.1%;
- 0 of 15 selected cross-product artifacts accepted;
- 0 of 6 canonical surfaces accepted;
- 0 of 6 AI capability families accepted;
- 14 of 120 certified artifacts accepted overall: 11.7%.
