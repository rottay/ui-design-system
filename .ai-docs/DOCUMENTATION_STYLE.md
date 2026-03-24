# Documentation Style

Fecha: 2026-03-15

## Objetivo

Documentar el design system de forma consistente, útil para onboarding y mantenimiento, sin caer en comentarios redundantes o demasiado verbosos.

La documentación debe responder rápido:

1. qué resuelve el archivo
2. por qué existe
3. cuál es la cadena de resolución o precedencia
4. dónde están los extension points
5. qué reglas no obvias no conviene romper

## Principios

- comentar intención, no sintaxis
- documentar decisiones y precedencias
- usar inline comments solo cuando la lógica no es obvia
- evitar comentarios que repitan el código literal
- priorizar archivos backbone, providers, hooks de resolución, engines, tenancy, theming y surfaces base

## Patrón recomendado por archivo

### 1. File overview corto

Usar `@fileoverview` y `@description` cuando el archivo sea backbone o API pública.

Debe explicar:

- dominio del archivo
- responsabilidades principales
- relación con otras capas del DS

### 2. Docstrings en funciones importantes

Agregar docstrings solo a:

- funciones públicas
- funciones de merge/resolution
- bridges
- registries
- loaders
- helpers con reglas no triviales

Evitar docstrings en helpers demasiado obvios o triviales.

### 3. Inline comments

Usar inline comments solo para:

- cadenas de precedencia
- fallbacks
- side effects no obvios
- razones de compatibilidad o backward compatibility
- límites intencionales del diseño

## Qué evitar

- comentar asignaciones obvias
- comentarios “wrapper”, “returns x”, “sets y” sin contexto
- bloques de comentario enormes en componentes chicos
- repetir ejemplos en todos los archivos

## Formato recomendado

### Bueno

```ts
/**
 * Merge order matters here because tenant overrides are intentionally the
 * last write in the chain. That keeps runtime white-labeling predictable.
 */
function mergeTokens(...) { ... }
```

```ts
// Vertical defaults sit between engine defaults and tenant overrides.
const verticalTokens = ...
```

### Malo

```ts
// Set variable
const x = y;
```

```ts
/**
 * Returns the value of the input value.
 */
```

## Priorización de rollout

### P0

- `bootstrap/`
- `hooks/tokens`
- `engines/`
- `tenancy/`
- `theming/`
- `personality/`

### P1

- primitives base
- patterns estructurales
- surfaces base

### P2

- resto del catálogo
- tests complejos
- stories más importantes

## Definition of Done

Un archivo queda “bien documentado” cuando:

- su propósito se entiende por sí solo
- la precedencia de resolución queda explícita si aplica
- los extension points y fallbacks están documentados
- la lógica no obvia tiene comentarios inline cortos
- no hay ruido de comentarios redundantes
