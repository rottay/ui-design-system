# Design System Source Structure Proposal

Ruta auditada:

`/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src`

Fecha:

`2026-03-15`

## Executive Summary

La recomendacion final es una estructura **domain-owned + flattened leaves**, con estos principios:

- eliminar buckets ambiguos como `core/`, `theme/`, `shared/` y `types/`
- dar a cada dominio un home unico y obvio
- mantener `components/` como wrapper claro para primitives, patterns y surfaces
- aplanar internals de componente donde hoy hay carpetas por archivo
- co-locar tests, stories y types junto al componente
- reservar `index.ts` solo para boundaries publicos reales, no para leaf files

La meta no es "ordenar por estetica". La meta es que el path de un archivo responda sin contexto extra:

1. de que dominio es
2. si es runtime, token, provider, hook o componente
3. si es publico, privado o de test
4. si implementa un engine especifico

## Evidence From The Current Repo

Foto real del arbol actual:

- `1016` archivos `index.ts` / `index.tsx`
- `1310` directorios
- `1671` archivos
- `148` archivos bajo `src/core`
- `138` archivos bajo `src/theme`
- `28` archivos bajo `src/shared`
- `4` archivos bajo `src/types`
- `1286` archivos bajo `src/components`
- `32` archivos bajo `src/animations`

Top-level actual:

```text
src/
  __tests__/
  animations/
  components/
  core/
  shared/
  testing/
  theme/
  types/
```

Problemas confirmados:

- `core/` mezcla engines, hooks, providers, types, utils, errors, theme y personality
- `theme/` no es solo styling: tambien contiene `i18n`, `product-profiles` y `tenants`
- `shared/` no explica ownership ni direccion de dependencias
- `types/` es solo wrapper legacy sobre `core/types`
- `core/theme/fonts.ts` hoy esta huerfano
- hay demasiados `index.ts` de leaf folders
- hay demasiada profundidad para llegar a la implementacion real
- hay nombres poco declarativos: `core`, `theme`, `shared`, `hooks/components`, `patterns/hooks`
- hay tests y stories dispersos en globales (`components/patterns/tests`, `components/patterns/stories`, `src/__tests__`) y tambien co-locados
- `components/surfaces/tests` y `components/surfaces/stories` ya fueron eliminados (tests y stories co-locados en cada surface + `surfaces/common/`)

## Directory-By-Directory Assessment

### `src/components`

Es el bucket mas sano conceptualmente, pero esta sobrecargado.

Lo bueno:

- el split `primitives / patterns / surfaces` es correcto
- el modelo multi-engine esta claro
- el catalogo real del DS vive aca

Lo malo:

- muchas carpetas usan `engines/classic/index.tsx` cuando deberia ser `engines/classic.tsx`
- muchos componentes usan `types/index.ts`, `tests/`, `stories/` para un solo archivo
- hay buckets globales ambiguos como `patterns/hooks`, `patterns/tests`, `patterns/stories`
- `surfaces/tests` y `surfaces/stories` ya fueron eliminados y co-locados
- la navegacion IDE se degrada por tantos `index.ts`

### `src/core`

Es el problema principal del arbol.

Hoy contiene:

- engines
- errors
- features
- hooks
- personality
- providers
- theme
- types
- utils

Eso convierte `core/` en un junk drawer. El nombre no comunica ownership ni responsabilidad. Leer un path como `src/core/hooks/components/...` no dice si estamos en infraestructura, theming, runtime o UI.

### `src/theme`

Es el segundo bucket ambiguo.

Hoy contiene:

- `tokens/`
- `tenants/`
- `i18n/`
- `product-profiles/`

Eso mezcla al menos cuatro dominios distintos. `theme/tenants/storage/static/generator/` ya no se lee como "theme"; se lee como plataforma/config/runtime.

### `src/shared`

Tiene contenido util, pero el nombre es demasiado generico. "Shared" no responde compartido entre que capas o dominios.

### `src/types`

Es deuda legacy. Los archivos son solo re-exports de `core/types`.

Ejemplos confirmados:

- `src/types/index.ts` -> `export * from '../core/types'`
- `src/types/common/index.ts` -> `export * from '../../core/types/common'`
- `src/types/engine/index.ts` -> `export * from '../../core/types/engine'`

### `src/animations`

El dominio existe de verdad, pero el nombre ya no refleja bien lo que hace el sistema. Hay motion components, effects, hooks y contracts. `motion/` es mejor nombre que `animations/`.

### `src/testing`

Es correcto como home de infraestructura de test, fixtures y helpers. El problema es que hoy convive con `src/__tests__` y con tests globales dispersos dentro de `components/`.

### `src/__tests__`

No deberia existir como bucket general en este repo. Todo lo que sea test de infraestructura va a `src/testing`; todo lo que sea test de un dominio o componente debe vivir junto a ese dominio o componente.

## What Should Be Deleted Or Dissolved First

Estos items ya tienen evidencia suficiente para limpiar:

- `src/types/` -> eliminar
- `src/core/theme/fonts.ts` -> eliminar o mover solo si se revive realmente
- `src/__tests__/` -> migrar a `src/testing/` o a sus dueños
- `components/patterns/tests`, `components/patterns/stories`, `components/patterns/hooks` -> repartir por owner
- ~~`components/surfaces/tests`, `components/surfaces/stories`~~ -> DONE: co-locados en cada surface + `surfaces/common/`

## Final Recommendation

La mejor opcion para Rottay es una variante refinada de Option A:

- `components/` se mantiene porque es un buen wrapper conceptual
- los dominios runtime salen de `core/`
- `theme/` se disuelve en dominios reales
- los internals se flattenean
- hooks/providers/types pasan a vivir con su dominio

No recomiendo:

- un mega `ui/` wrapper por encima de `components/`
- crear carpetas `types/`, `tests/`, `stories/` dentro de cada componente si hay un solo archivo
- seguir agregando buckets ambiguos tipo `shared/`

## Target Top-Level Tree

```text
src/
  design-system/        # Root composition, public provider, package entry orchestration
  components/           # All shipped UI
    primitives/
    patterns/
    surfaces/
  engines/              # Registry, factory, engine boundary, engine contracts
  tokens/               # CSS tokens, TS mirrors, resolution, bridges, useTokens
  tenancy/              # Tenant config, schema, registry, resolver, storage, generator
  personality/          # Contracts, resolvers, CSS variable bridge, helpers
  product-profiles/     # Profile registry, provider, hooks
  i18n/                 # Provider, hooks, locales, formatters
  motion/               # Motion primitives, effects, hooks
  features/             # Feature flags, gates, provider, hooks
  hooks/                # Cross-cutting hooks only
  icons/                # Icon contracts and helpers
  errors/               # Cross-domain error types and helpers
  utils/                # Pure shared utilities
  testing/              # Test infra only, never shipped
```

## Why This Structure Wins

### 1. One Concept, One Home

En el arbol actual hay que adivinar:

- tenancy: `core/hooks/tenant` o `theme/tenants`
- tokens: `core/hooks/tokens` o `theme/tokens`
- i18n: `theme/i18n` pero montado desde `core/providers/root`
- product profiles: `theme/product-profiles` y `core/hooks/product-profile`

Con la estructura target:

- tenancy vive en `tenancy/`
- tokens vive en `tokens/`
- i18n vive en `i18n/`
- product profiles vive en `product-profiles/`
- personality vive en `personality/`

### 2. Components Stay Grouped, Internals Get Simpler

No recomiendo mover todo a archivos como `Avatar.classic.tsx` sueltos en el root del componente. Eso reduce nesting, pero genera ruido visual con este volumen de componentes.

El mejor equilibrio es:

```text
Avatar/
  Avatar.tsx
  Avatar.types.ts
  Avatar.test.tsx
  Avatar.stories.tsx
  engines/
    classic.tsx
    modern.tsx
    rustic.tsx
  subcomponents/
    Group.tsx
    Badge.tsx
    Fallback.tsx
```

Ventajas:

- `engines/` agrupa una multiplicidad real
- `Avatar.tsx` es el entry point obvio
- tests, stories y types son visibles sin subcarpetas innecesarias
- desaparecen subcarpetas del tipo `classic/index.tsx`
- el path es corto, legible y muy greppable

### 3. Hooks Stop Being A Junk Drawer

Regla:

- hooks de dominio viven con su dominio
- `src/hooks` queda reservado para cross-cutting reales

Ejemplos target:

- `tokens/useTokens.ts`
- `tenancy/useTenant.ts`
- `tenancy/useCreateTenant.ts`
- `i18n/useTranslation.ts`
- `motion/useMotionPersonality.ts`
- `product-profiles/useProductProfile.ts`
- `features/useFeatureFlag.ts`

Hooks que si podrian vivir en `src/hooks`:

- `useControllableState.ts`
- `useDebounce.ts`
- `useEventListener.ts`
- `useMediaQuery.ts` solo si se decide mantenerlo cross-cutting

### 4. Providers Become Domain-Owned

No recomiendo un bucket `providers/` enorme.

Regla:

- cada dominio posee su provider
- la composicion final vive en `design-system/`

Ejemplo:

```text
design-system/
  DesignSystemProvider.tsx
  DesignSystemProvider.test.tsx
  SystemCssVariablesBridge.tsx

tenancy/
  TenantProvider.tsx
  useTenant.ts

i18n/
  I18nProvider.tsx
  useTranslation.ts

product-profiles/
  ProductProfileProvider.tsx
  useProductProfile.ts

features/
  FeatureProvider.tsx
  FeatureGate.tsx
  useFeatureFlag.ts
```

## Current To Target Mapping

| Current | Target | Action |
|---|---|---|
| `src/core/engines` | `src/engines` | move |
| `src/core/errors` | `src/errors` | move |
| `src/core/features` + `src/core/hooks/features` | `src/features` | merge |
| `src/core/hooks/tenant` + `src/theme/tenants` | `src/tenancy` | merge |
| `src/core/hooks/tokens` + `src/theme/tokens` | `src/tokens` | merge |
| `src/core/personality` | `src/personality` | move |
| `src/core/hooks/product-profile` + `src/theme/product-profiles` + `src/core/providers/product-profile` | `src/product-profiles` | merge |
| `src/theme/i18n` | `src/i18n` | move |
| `src/animations` | `src/motion` | rename/move |
| `src/shared/icons` | `src/icons` | move |
| `src/shared/utils` + `src/core/utils` | `src/utils` | merge |
| `src/core/providers/root` | `src/design-system` | split + rename |
| `src/core/providers/tenant` | `src/tenancy` | move |
| `src/core/providers/features` | `src/features` | move |
| `src/core/providers/engine` | `src/engines` | move |
| `src/core/types` | domain-owned `.types.ts` files | dissolve over time |
| `src/types` | delete | remove legacy wrapper |
| `src/core/theme/fonts.ts` | delete or move to `tokens/typography.ts` | remove if still orphan |
| `src/__tests__` | `src/testing` or owner domain | move |

## Component Folder Rules

### Primitive / Pattern / Surface

```text
Button/
  Button.tsx
  Button.types.ts
  Button.test.tsx
  Button.stories.tsx
  engines/
    classic.tsx
    modern.tsx
    rustic.tsx
  subcomponents/        # only if compounds or public internals exist
    Icon.tsx
    Group.tsx
  hooks/                # only if this component truly has local hooks
    useButtonState.ts
  internals/            # optional, for private helpers
    resolveLoadingLabel.ts
```

### Pattern Example

```text
DataTable/
  DataTable.tsx
  DataTable.types.ts
  DataTable.test.tsx
  DataTable.integration.test.tsx
  DataTable.stories.tsx
  engines/
    classic.tsx
    modern.tsx
    rustic.tsx
  hooks/
    useDataTable.ts
  internals/
    normalizeColumns.ts
    table-a11y.ts
```

### Surface Example

```text
ListSurface/
  ListSurface.tsx
  ListSurface.types.ts
  ListSurface.test.tsx
  ListSurface.stories.tsx
```

Surface infra compartida:

```text
components/surfaces/common/
  builders/
  responsive.ts
  permissions.ts
  i18n.ts
```

### Rules

- root del componente: solo archivos principales y ownership obvio
- `engines/` existe solo cuando hay implementaciones multi-engine
- `subcomponents/` solo si hay compounds o piezas visibles
- `hooks/` solo si los hooks pertenecen a ese componente
- `internals/` solo para helpers privados de ese componente
- no crear `types/`, `tests/`, `stories/` si hay un solo archivo

## Naming Rules

### Folders

- top-level domains: `kebab-case`
- category folders bajo `components/`: `kebab-case`
- component folders: mantener convencion actual o migrar gradualmente a `PascalCase`, pero una sola convencion por area

### Files

- component entry: `Avatar.tsx`
- component types: `Avatar.types.ts`
- tests: `Avatar.test.tsx`
- integration tests: `Avatar.integration.test.tsx`
- engine parity tests: `Avatar.engines.test.tsx`
- stories: `Avatar.stories.tsx`
- engine implementations: `engines/classic.tsx`, `engines/modern.tsx`, `engines/rustic.tsx`

### `index.ts` Policy

Permitido:

- package root barrels
- category barrels reales
- public API boundaries

No permitido:

- leaf files del tipo `classic/index.tsx`
- `types/index.ts` si contiene un solo export local
- `tests/index.ts` o `stories/index.ts`

## Test And Story Placement

### Tests

Regla principal:

- tests de componente junto al componente
- tests de dominio junto al dominio
- infraestructura de test en `src/testing`

Estandar recomendado de sufijos:

- `.test.tsx`
- `.integration.test.tsx`
- `.engines.test.tsx`
- `.a11y.test.tsx`

Conviene eliminar nombres historicos mas ruidosos como:

- `engine-advanced`
- `runtime-advanced`
- `engine-branches`
- `real-engines`

### Stories

- stories junto al componente, pattern o surface
- eliminar bucket global `patterns/stories` (pendiente)
- ~~`surfaces/stories`~~ -> DONE: co-locados en cada surface + `surfaces/common/`

## What To Keep Out Of The Target Structure

No volver a introducir:

- `core/` como bucket catch-all
- `shared/` como nombre ambiguo
- `theme/` mezclando tokens, i18n, tenancy y profiles
- wrappers legacy de `types/`
- carpetas por archivo
- test buckets globales que rompen ownership

## Migration Plan

### Phase 1: Clean Dead And Legacy Nodes

- borrar `src/types`
- borrar o mover `src/core/theme/fonts.ts`
- inventariar y planear remocion de `@deprecated` sin timeline

### Phase 2: Create The New Top-Level Homes

- crear `engines/`, `tokens/`, `tenancy/`, `personality/`, `product-profiles/`, `i18n/`, `motion/`, `features/`, `design-system/`
- mover primero sin flattenear componentes

### Phase 3: Dissolve `core/`, `theme/`, `shared/`

- mover ownership real a sus dominios
- dejar alias/barrels temporales para no romper imports internos de una sola vez

### Phase 4: Flatten Component Leaves

- `engines/classic/index.tsx` -> `engines/classic.tsx`
- `types/index.ts` -> `Component.types.ts`
- mover `tests/Component.test.tsx` a root del componente
- mover `stories/Component.stories.tsx` a root del componente

### Phase 5: Rebuild Public Barrels

- dejar `index.ts` solo en boundaries reales
- reescribir imports internos
- eliminar barrels intermedios innecesarios

### Phase 6: Enforce The Structure

- agregar script o lint rule que evite:
  - nuevos `index.tsx` leaf
  - nuevas carpetas por archivo
  - reintroduccion de `core/` o `shared/`

## Guardrails

Estas reglas son importantes para que la migracion no vuelva a degradarse:

- profundidad maxima recomendada desde `src` hasta implementacion leaf: `4`
- ningun folder debe existir solo para alojar un `index.ts`
- cada dominio es dueño de sus hooks, provider, types y utils de dominio
- solo usar `src/hooks` para cross-cutting reales
- `src/testing` es solo infraestructura, no dumping ground de tests de feature

## What Claude Should Optimize For

Si esta propuesta se usa como input para una migracion automatizada o semi-automatizada, conviene que Claude priorice:

1. claridad del path por encima de "pureza" abstracta
2. ownership de dominio por encima de buckets genericos
3. menos `index.ts` sin generar folder spam
4. migracion incremental con build verde
5. co-location donde mejora descubribilidad

## Final Recommendation

La decision final recomendada es:

- **mantener `components/`**
- **disolver `core/`, `theme/`, `shared/`, `types/`**
- **mover dominios a homes explicitos**
- **flattenear `engines/*.tsx`**
- **co-locar `Component.types.ts`, `Component.test.tsx`, `Component.stories.tsx`**
- **mantener `engines/` como subcarpeta real**
- **evitar subcarpetas `types/`, `tests/`, `stories/` si contienen un solo archivo**

Eso da la mejor combinacion de:

- claridad de navegacion
- menor nesting
- ownership correcto
- migracion posible
- escalabilidad para multi-engine, tenancy, personality y surfaces
