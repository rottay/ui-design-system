# Recommended App Template

Recommended model:

- Option B
- shared functional core
- vertical recipe layer

## Ownership model

## Layer 1. Design System

Owned in `ui-design-system`.

Contains:

- primitives
- patterns
- structures
- tenant runtime
- appearance compiler/runtime
- shell contract
- workspace contract
- settings/admin base structures
- typed recipe-compatible configuration contracts

The DS should own all shared behavior and all repeating product grammar.

## Layer 2. Vertical Recipe

Owned per app, with one standardized location and shape.

Contains:

- vertical profile
- shell recipe
- workspace recipe
- dashboard recipe
- page-chrome recipe
- settings recipe
- motion/shape/density defaults
- iconography/copy posture

This is where apps become unique.

## Layer 3. Feature Modules

Owned per app.

Contains:

- domain actions
- data loaders
- route definitions
- domain-specific screens
- feature-specific compositions

Feature modules should consume:

- DS structures
- DS patterns
- vertical recipes

They should not invent new shell/page/workspace systems.

## Hard rules

### Rule 1

No `_shared` dumping ground for mixed concerns.

If something is shared:

- it is either DS-owned
- or it lives in a clearly named `vertical/` layer

### Rule 2

No app-local shell families once a DS shell exists.

### Rule 3

No raw style injection to repaint DS patterns.

If a recurring styling need exists:

- upstream the recipe/config to DS
- or narrow the DS claim

### Rule 4

All apps must share the same folder semantics.

The meaning of the folders must stay stable even if the contents differ.

### Rule 5

Visual uniqueness belongs in recipes, not in hidden behavioral forks.

### Rule 6

Folder fan-out must stay intentional.

If a folder accumulates too many sibling folders and a coherent grouping exists:

- group them under a shared parent
- do not keep growing a flat directory forever

### Rule 7

Every meaningful folder boundary should expose a stable public entrypoint.

Use:

- `index.ts` for code folders
- `README.md` only when the folder is documentation-first

But:

- do not create giant indiscriminate barrels
- do not hide ownership boundaries behind wildcard re-export chaos

## Recommended top-level `src/` shape

```text
src/
  app/
  providers/
  lib/
  vertical/
  features/
  components/
  actions/
  styles/
  types/
```

## Meaning of each top-level folder

### `app/`

Next.js routing only:

- route files
- route-level layout wrappers
- page composition entrypoints

Should stay thin.

### `providers/`

Provider stack only:

- DS provider
- auth/session
- i18n
- breadcrumbs
- app-specific runtime contexts

### `lib/`

Non-visual infrastructure:

- tenancy
- auth helpers
- navigation adapters
- vertical config helpers
- API clients
- utility services

### `vertical/`

The app-owned identity layer.

This defines the vertical’s expression without changing the shared behavior model.

### `features/`

Domain modules.

This is where business screens and flows live.

### `components/`

Only for app-owned components that are:

- truly cross-feature inside that app
- not DS-worthy
- not part of `vertical/`

This should be much smaller than today.

### `actions/`

Server actions or app-side action boundaries, organized by domain.

If the action surface becomes too wide at one level, group by a meaningful family:

- domain family
- platform family
- shared capability family

### `styles/`

Very thin app-level style entrypoints only.

No engine-specific compensation layer unless explicitly temporary and documented.

### `types/`

App-local contracts and view-model types.

## `vertical/` shape

```text
vertical/
  profile/
  shell/
  navigation/
  page-chrome/
  workspace/
  dashboard/
  settings/
  content/
```

## `vertical/` folder meanings

### `vertical/profile/`

One source of truth for:

- shape defaults
- motion defaults
- density defaults
- tonal direction
- shell posture
- workspace posture
- dashboard posture

### `vertical/shell/`

App-specific shell recipe over DS shell:

- slot composition
- sidebar recipe
- topbar recipe
- footer recipe
- shell actions

### `vertical/navigation/`

Navigation config and section recipes:

- nav groups
- labels
- badges
- route-group metadata

### `vertical/page-chrome/`

Shared page header, command header, hero bar, and other vertical-specific framing.

### `vertical/workspace/`

How lists/workspaces feel in this app:

- search placement
- action-strip recipe
- preview-rail recipe
- filter rail recipe
- row emphasis rules

This is where the apps can differ visually while keeping the same behavior.

### `vertical/dashboard/`

Dashboard grammar:

- hero recipe
- widget framing
- metric emphasis
- board composition

### `vertical/settings/`

How settings/admin surfaces are presented in that app.

### `vertical/content/`

Empty states, helper blocks, callout recipes, and copy posture.

## `features/` shape

```text
features/
  <domain>/
    actions/
    data/
    hooks/
    model/
    routes/
    screens/
    components/
```

## Feature rules

### Folder indexing

Each feature should expose a stable public entrypoint:

```text
features/<domain>/index.ts
```

Optional sub-entrypoints are allowed when they represent a real boundary:

```text
features/<domain>/routes/index.ts
features/<domain>/screens/index.ts
features/<domain>/components/index.ts
```

Do this only when the folder has a real external surface.

### `screens/`

Thin screen compositions that assemble:

- DS structures
- vertical recipes
- domain data

### `components/`

Domain-specific pieces only.

If a pattern repeats across domains or apps:

- move it up to `vertical/`
- or upstream it to DS

### Grouping rule

If a feature accumulates too many sibling folders or files, group by a coherent shared noun.

Examples:

- `features/security/policies/*`
- `features/security/incidents/*`
- `features/security/audit/*`

Do not force grouping when it creates fake taxonomy.

## What leaves current `_shared`

Much of today’s `_shared` should be redistributed into:

- `vertical/` for visible app grammar
- `features/` for domain-specific shared pieces
- DS for true system-level patterns

That is how we stop everything mixed together.
