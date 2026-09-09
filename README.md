<h1 align="center">Rottay Design System</h1>

<p align="center"><strong>SaaS is how it is delivered. Your brand is how it is experienced.</strong></p>

<p align="center">Tenant-first customization · Shared product capabilities · Distinct brand identities</p>

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#what-you-can-build">Use cases</a> ·
  <a href="#personalization-without-a-quality-paywall">Customization levels</a> ·
  <a href="#how-a-decision-becomes-an-interface">The cascade</a> ·
  <a href="#architecture-for-developers">Architecture</a> ·
  <a href="#explore-the-project">Explore</a>
</p>

![Concept illustration: the same application expressed as editorial and technical tenant identities, using the same neutral palette and shared capabilities.](docs/readme/tenant-identities/index.svg)

> **The destination, not a release announcement.** This README presents the completed
> product vision. The [roadmap](roadmap/README.md) and [live status](roadmap/STATUS.md)
> track what is implemented and verified; their contracts remain authoritative.

## Overview

### The software can be shared. The identity should be yours.

**Our belief: the generic, one-look-fits-all SaaS experience is no longer the destination.**
Even when customers use the same underlying product, each should be able to make it feel
like their own brand. Their identity should shape the experience, not stop at the logo.

Rottay is a React and TypeScript design system built around that vision. It turns a
bounded set of tenant decisions into a coherent visual language: typography, shape,
spacing, surfaces, interaction states and motion, from a checkbox to an entire dashboard.

**One application. Many identities. One shared quality standard.**

| For your customers | For your product team | For your business |
|---|---|---|
| A product that feels like their brand | Shared components and behavior across tenants | Offer differentiated white-label experiences |
| Personalization they can understand and preview | One place to improve a reusable capability | Expand customization without a code fork per customer |
| A complete experience at every plan | Brand changes expressed through governed decisions | Monetize editing freedom, not basic visual quality |

This is deeper than swapping a primary color. A tenant changes design decisions; the
system derives their consequences across the relevant families. Shared engineering stays
shared, while the customer's visual identity remains their own.

---

## What you can build

The primary setting is Rottay's multi-tenant applications, with BitHire as the reference
product for proving the experience. A **vertical** supplies a product baseline and its
allowed customization boundaries; a **tenant** is a customer organization using it.

| Use case | The experience | Why it matters |
|---|---|---|
| Launch a branded tenant | Start with a complete vertical identity; personalize the permitted decisions without configuring every component | A coherent starting point, without a bespoke UI project |
| Give two customers distinct identities | Change typography, shape, rhythm, depth, states and motion over the same application capabilities | White-label differentiation beyond a palette swap |
| Refresh an existing brand | Change shared decisions and review their consequences across relevant component families | A coordinated redesign rather than a collection of local patches |
| Offer a tenant theme editor | Expose typed controls, preview their effective result and publish through the same interpretation of the theme | Predictable customization that the application can explain to its users |
| Build a new product workflow | Compose tables, forms, boards, overlays, page structures and surfaces with shared behavior and branding | Product developers can concentrate on the workflow and business rules |
| Create a new vertical or internal brand profile | Define defaults, registered resources and policy boundaries on the common architecture | Expand the product family without cloning the design system |
| Serve different devices and languages | Adapt layout, interaction, text direction and formatting while retaining the tenant's identity | A product that remains usable beyond the original desktop mockup |

## What “distinct identities” means

Imagine two customers of the **same BitHire application**. They use the same workflows
and component families, but want a different character:

| Design axis | An editorial identity | A technical identity |
|---|---|---|
| Typography | Expressive headings and a relaxed reading rhythm | Precise hierarchy and compact information display |
| Shape | Softer controls and rounded surfaces | Crisper geometry and restrained rounding |
| Rhythm | Spacious groups and generous separation | Denser controls and tighter working areas |
| Depth | Layered surfaces with soft elevation | Flatter surfaces with clearer boundaries |
| Interaction states | Gentle emphasis and a distinctive focus signature | More explicit selection and state contrast |
| Motion | Softer transitions | Shorter, more restrained feedback |

These are illustrative art directions, not preset names or a new control specification.
Their available combinations remain subject to the approved catalog and vertical policy.

**Both identities must remain recognizable when color is held constant.** They also owe
the same accessibility, interaction and responsive-quality requirements. A more expressive
skin is not a more functional product, and a quieter skin is not a reduced one.

---

## Personalization without a quality paywall

### More freedom to customize. The same commitment to quality.

| | Standard | Pro | Internal |
|---|---|---|---|
| **For** | Every tenant administrator | Tenants with expanded editing rights | Our brand and system team |
| **Purpose** | Make the product your own through the shared customization controls | Shape the identity more deeply through additional governed controls | Create brand profiles, registered resources and system extensions |
| **Starting point** | A complete inherited identity | The same complete inherited identity | The tools and contracts that define those identities |
| **What changes** | The decisions you are allowed to edit | The breadth of decisions you are allowed to edit | Who can author the system's internal definitions |
| **Commercial role** | Standard customization | Paid customization access | Team-only capability, not a subscription tier |

Standard, Pro and Internal describe **who may author a change**, not which visual tokens
exist or which tenants receive a finished design.

A tenant inherits the complete effective values it needs from its vertical and profiles,
including values it cannot edit directly. Derived defaults are not mistaken for a user's
attempt to override a restricted control.

**The same effective configuration produces the same visual result, regardless of plan.**

An upgrade unlocks more editing freedom. It does not unlock a better-rendered button,
a complete set of interaction states, or a more accessible interface.

Controls use named choices, registered resources, validated values and bounded ranges
appropriate to their purpose. They are not a free-form CSS editor. Any permitted
fine-grained override has an explicit contract rather than an undocumented escape hatch.
Vertical policy can constrain designated decisions, but cannot arbitrarily lock the
identity controls the [customization contract](roadmap/kit-2026-09.md) reserves to tenants.

---

## How a decision becomes an interface

### Choose the direction. Let the cascade carry it.

A cascade is a set of meaningful derivations, not just thousands of variables with
similar names. Choosing a softer shape should affect relevant buttons, fields, cards
and overlays in ways that fit each family's anatomy. It should not paste the same
border radius everywhere or erase the distinction between a radio and a checkbox.

```mermaid
flowchart TD
  D["Tenant decision<br/>Softer shape"] --> R["Shared shape rules"]
  R --> B["Buttons<br/>Control geometry"]
  R --> I["Fields<br/>Input geometry"]
  R --> C["Cards<br/>Surface geometry"]
  R --> O["Overlays<br/>Container geometry"]
  classDef decision fill:#17212b,color:#f7f4ed,stroke:#64748b
  classDef family fill:#f7f4ed,color:#24272b,stroke:#a8a29e
  class D,R decision
  class B,I,C,O family
```

**One decision, multiple appropriate consequences.** Each family owns how it interprets
the shared rule. The full path keeps inputs, permissions and output aligned:

```mermaid
flowchart LR
  S["Static configuration"] --> A["Validate and resolve<br/>Choices · Permissions · Origin"]
  T["Stored document or draft"] --> A
  A --> C["Compile once<br/>Roots · Family derivations"]
  C --> P["Project and emit<br/>Theme artifact"]
  P --> M["Mount consistently<br/>Preview · Publish · Hydrate"]
  classDef shared fill:#17212b,color:#f7f4ed,stroke:#64748b
  classDef input fill:#f7f4ed,color:#24272b,stroke:#a8a29e
  class A,C,P,M shared
  class S,T input
```

The responsibilities are explicit:

1. **The catalog defines the choices.** Each decision declares its type, valid domain,
   editing tier and intended impact. Static and database-backed inputs enter the same
   policy boundary; their transport cannot change their meaning.
2. **Resolution establishes the effective theme.** Defaults, inheritance and permitted
   overrides are reconciled while preserving where a value came from and who authored it.
3. **Family derivations own the consequences.** Small, pure modules consume declared
   inputs and produce declared channels. Shared shape, palette, typography, materials
   and states are derived once, then interpreted for each family.
4. **Skins and runtime have separate jobs.** Runtime owns behavior and stamps anatomy,
   state and variant attributes. The custom skin reads the derived channels to paint
   those parts, with explicit fallback chains back to their roots.
5. **Publication preserves the result.** Production CSS is compiled on the server and
   embedded for server rendering. Hydration consumes the artifact rather than inventing
   a second theme; preview and publication owe the same effective result.

### Who knows what a variable affects?

The **typed catalog and executable derivation contracts** own that knowledge together:
the catalog states intended impact; each deriver declares what it consumes and produces.
A source-derived graph connects those declarations to actual skin and component readers.
Rendered tests verify that changing a decision really changes the promised families.

Documentation and dependency views are generated from those owners. A separate,
hand-maintained manifest is not a competing source of truth. This makes “what will
change if I edit this?” a traceable question rather than tribal knowledge.

---

## Architecture for developers

### Design freedom, with an explicit engineering contract.

The technical foundation is React, TypeScript, CSS custom properties and compiled theme
artifacts. The core package owns reusable UI; the consuming application owns its business
domain, data access, routes and product-specific content.

### Four UI tiers, one direction of composition

```mermaid
flowchart LR
  P["Primitives<br/>Focused elements"] --> T["Patterns<br/>Reusable tasks"]
  T --> S["Structures<br/>Page framing"]
  S --> U["Surfaces<br/>Complete screens"]
  classDef tier fill:#17212b,color:#f7f4ed,stroke:#64748b
  class P,T,S,U tier
```

| Tier | Responsibility | Examples |
|---|---|---|
| **Primitives** | Focused UI elements and their interaction contracts | Button, checkbox, input, dialog |
| **Patterns** | Reusable tasks built from lower-level capabilities | Data table, form builder, kanban board |
| **Structures** | Page framing and chrome around those tasks | Headers, toolbars, record panels |
| **Surfaces** | Declarative composition of complete screens | Collection, dashboard and form surfaces |

The system also supplies shared capabilities such as semantic icons, charts, overlays,
motion and lifecycle presentation. Business concepts stay in the application: a generic
board belongs here; the meaning of a hiring stage does not.

### A path should explain its owner

The final source layout follows the approved D-21 architecture:

```text
packages/core/src/
  contracts/     Public and internal typed contracts, including theme decisions
  kernel/        Shared, domain-independent mechanisms
  tokens/        Semantic channels, skin inputs and CSS ownership
  graphics/      Icons, marks, visual primitives and their supplier boundaries
  compilers/     Theme resolution, derivation and artifact production
  runtime/       Mounting, context and runtime coordination
  components/    primitives / patterns / structures / surfaces
  entrypoints/   Explicit, governed package import boundaries
```

Capabilities are grouped by family and implemented as focused `folder/index` units.
Tests live with their owner. Shared behavior has one implementation; a barrel aggregates
owners without becoming a second implementation. Generated artifacts and exceptional
toolchain files have explicit ownership too.

**Canonical means one responsibility in the real application flow.** Being imported is
not enough: a duplicate implementation does not become legitimate merely because it
has a caller. Retirement removes the competing path and migrates its real consumers.

The [normalization plan](roadmap/retire.md) defines how the remaining tree reaches this
layout; this sketch describes the destination, not today's directory inventory.

### Custom, Ant Design and Vanilla CSS

| Presentation | Purpose |
|---|---|
| **Custom** | Our own presentation layer, designed for deep brand customization through derived tokens and dedicated skins |
| **Ant Design** | A presentation backed by the Ant Design component library |
| **Vanilla CSS** | A presentation built with plain CSS rather than a third-party component framework |

The customization and quality goals described in this README focus on **Custom**.
Ant Design and Vanilla CSS retain their own support scope; they do not implicitly
inherit the same customization coverage.

Presentation adapters use the shared component contracts and compiler. Registered
extension points leave room for additional implementations without creating a second
compilation path. A new tenant identity changes design decisions, not the presentation
implementation. Unsupported configurations are refused rather than silently substituted.

### Adaptation is part of a family

Responsive behavior includes viewport **and container** changes, appropriate touch and
keyboard interaction, and usable loading, empty, error and disabled states. Locale and
direction participate in component behavior; light/dark modes, reduced motion and
forced-color preferences are part of the quality contract.

Mobile in this program means adaptive web interfaces, including their suitability for
mobile web and web-based shells. It is not a promise of a React Native renderer, native
widgets, or offline/PWA infrastructure supplied by the design system.

---

## What “done” means

Completion is demonstrated on consumers, not inferred from token counts, screenshots at
rest, or the number of closed work orders. The acceptance contract requires:

- **Causal personalization:** changing an approved decision moves the applicable rendered
  families. Color-only changes cannot pass a non-color differentiation test.
- **Complete family delivery:** derivation, skin, shared behavior, accessibility tests and
  evidence land together. A generated variable without a working consumer is not a feature.
- **Transport and plan consistency:** static inputs, stored documents, drafts and published
  artifacts preserve the same semantics; editing permissions do not degrade inherited UI.
- **Usable states and contexts:** keyboard, focus, touch, relevant locales and directions,
  adaptive layouts and visual modes are exercised on real components.
- **One traceable ownership graph:** no missing producers, duplicate writers or parallel
  customization paths hiding behind compatibility aliases.
- **A truthful release boundary:** consumer tests use the built package and its declarations,
  and negative tests prove that the checks detect the defects they claim to prevent.

There is a deliberate distinction between **proving one end-to-end family** and **proving
the whole supported population**. A successful pilot does not certify the fleet. The
[evidence plan](roadmap/evidence-graph.md) owns the detailed thresholds and required proofs;
this README does not invent or relax them.

---

## Explore the project

For a quick understanding, start with the use cases and cascade above. For technical
depth, follow the relevant owner rather than reading the entire repository:

| Explore | Start here |
|---|---|
| Product commitments and implementation sequence | [Roadmap](roadmap/README.md) and [current status](roadmap/STATUS.md) |
| Personalization decisions and their boundaries | [Identity kit](roadmap/kit-2026-09.md) and [catalog contract](roadmap/catalog-door.md) |
| A complete component-family implementation | [Family delivery plan](roadmap/family-cuts.md) and [component source](packages/core/src/components/) |
| Cascades and impact evidence | [Derivation plan](roadmap/derivation.md) and [causal verification](roadmap/evidence-graph.md) |
| Consumer integration and public contracts | [Consumer contract plan](roadmap/consumer-contract.md), [public API](docs/api.md) and [installation guide](docs/getting-started.md) |
| Visual exploration | [Showroom application](packages/showroom/) |
| Contributing and release discipline | [Contributing](CONTRIBUTING.md), [ownership](docs/ownership.md) and [releasing](docs/releasing.md) |

The core library lives in `packages/core/`; the showroom is the reference application in
`packages/showroom/`. `roadmap/` owns delivery obligations, while `.changeset/` records
release and public-contract changes. During implementation, consult the roadmap for
superseding amendments before copying an older integration example.

Source is licensed under [MIT](LICENSE). Published packages use a private registry under
the `@rottay` scope and require access; see the installation and release guides above.
Report security issues privately through [SECURITY.md](SECURITY.md).
