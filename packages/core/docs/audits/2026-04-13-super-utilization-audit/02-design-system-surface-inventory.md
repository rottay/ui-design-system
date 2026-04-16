# Design-System Surface Inventory

## Executive Read

The design system is not a small widget library anymore. It exposes a full multi-layer platform:

- low-level primitives
- higher-level patterns
- reusable structures
- page/surface builders
- runtime/theme/tenant infrastructure
- server-safe integration points

That matters because the apps are currently consuming the DS very unevenly. They use the primitive layer heavily, but adoption of the higher-level platform surface is much thinner.

## Public Entry Points

Primary public package entry points from [package.json](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/package.json):

- `@rottay/design-system`
- `@rottay/design-system/server`
- `@rottay/design-system/icons`
- `@rottay/design-system/styles`
- `@rottay/design-system/styles.css`
- `@rottay/design-system/styles/platform`
- `@rottay/design-system/styles/bithire`
- `@rottay/design-system/styles/evnto`
- `@rottay/design-system/styles/rottay`
- `@rottay/design-system/styles/modern`

## Public Surface Shape

Measured locally from [src](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src) plus export barrels:

| Layer | Local structural count | Audit read |
| --- | ---: | --- |
| Primitive families | `6` top-level families | about `95` public primitive modules/families |
| Pattern families | `9` top-level families | about `40` major pattern families, about `60` public modules if support modules are included |
| Structure families | `7` top-level families | about `20` structure families |
| Surface families | `3` top-level families | about `35` page-surface families plus `33` typed `create*SurfaceConfig` builders |
| Hook families | `18` top-level families | about `80` exported `use*` APIs package-wide |
| Contract families | `9` top-level families | tokens, themes, product profiles, tenants, verticals, engine contracts |

Top-level component families from source:

- primitives: `display`, `feedback`, `inputs`, `layout`, `navigation`, `overlay`
- patterns: `communication`, `data`, `forms`, `foundation`, `misc`, `navigation`, `visualization`, `workflow`
- structures: `dashboard`, `feedback`, `headers`, `record`, `shell`, `workspace`
- surfaces: `foundation`, `layout`, `pages`

## What The DS Is Strong At

### 1. Primitive depth

The package is extremely deep at the primitive layer. Apps can build almost any screen using:

- layout primitives
- typography/display primitives
- form/input primitives
- feedback/status primitives
- navigation/overlay primitives

Proof:

- [primitives inputs index](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/primitives/inputs/index.ts)
- [primitives layout index](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/primitives/layout/index.ts)

### 2. Pattern and workspace depth

The package already contains a meaningful higher layer for:

- data workspaces
- charts and visualizations
- command/navigation overlays
- workflow and approval patterns
- misc tenant/admin patterns

Proof:

- [patterns index](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/patterns/index.ts)
- [surfaces index](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/index.ts)

### 3. Runtime/theming/tenant capability

The DS is already carrying infrastructure that many teams would keep outside the DS:

- runtime theming
- vertical runtime
- tenant runtime
- product-profile runtime
- brand-theme compilers
- server-safe tenant/domain helpers

Proof:

- [runtime theming](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/runtime/theming/index.ts)
- [runtime tenant](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/runtime/tenant/index.ts)
- [runtime verticals](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/runtime/verticals/index.ts)
- [server entrypoint](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/server.ts)

## What Looks Underused

These are the most important high-value layers that look under-adopted compared with how much capability they expose:

### 1. Surface builders and `create*SurfaceConfig`

The DS exposes a full typed surface/config platform, but the apps still hand-compose many list/detail/dashboard screens.

Proof:

- [surfaces foundation](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/foundation)

### 2. Structures

Structures are present and non-trivial, but app adoption still leans much harder on primitives and local wrappers than on DS-owned workspace/shell/record structures.

Proof:

- [structures index](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/structures/index.ts)

### 3. Motion

Motion exists as a meaningful public layer, but app usage is sparse and often showroom-led rather than product-led.

Proof:

- [motion index](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/motion/index.ts)

### 4. Command and responsive infrastructure

The package already includes:

- command registry/provider hooks
- command palette items
- richer responsive primitives than just raw breakpoints

These are high leverage, but not heavily used cross-app.

Proof:

- [hooks commands](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/hooks/commands/index.ts)
- [runtime responsive](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/runtime/responsive/index.ts)

### 5. Brand-theme compiler bridges

The DS appears ready for much deeper tenant/brand automation than the apps currently exploit.

Proof:

- [compilers index](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/compilers/index.ts)

## Bottom Line

The DS already behaves like a product platform, not just a component library.

That creates a clear strategic tension:

- current app adoption is excellent at the primitive layer
- current app adoption is moderate-to-light at the pattern/structure/surface/runtime layers

So the right question is no longer “do we have enough DS?”  
It is “are we leaving too much leverage on the table by staying primitive-first?”
