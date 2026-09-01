# Conformidad de `packages/core/src/` — 2026-08-19

Tercer paquete del diagnóstico (complementa
[`DIAGNOSTICO-Y-PLAN-2026-08-19.md`](/docs/history/programs/architecture-refactor/2026-08/diagnosis/index.md) y
[`DEPURACION-SCRIPTS-Y-DATOS-2026-08-19.md`](/docs/history/programs/architecture-refactor/2026-08/scripts-and-data/index.md)).
La ley objetivo es [`ARCHITECTURE.md`](ARCHITECTURE.md); su §2 define el árbol
destino carpeta por carpeta y su §3 el delta. Este documento solo registra la
**verificación mecánica de conformidad** del árbol actual contra esa ley —
todo medido hoy, con comandos, no tomado de auditorías previas.

## 1. Veredicto mecánico (todo verde o adjudicado)

| Chequeo | Resultado | Evidencia |
|---|---|---|
| Archivos sueltos en la raíz de `src/` | solo `index.ts` (el único permitido) | `find -maxdepth 1 -type f` |
| Archivos autorados sueltos en todo el árbol ("authored leaves") | **0** | `core-structure-audit`: `files=3989, source=3452, authored-leaves=0, indexes=1672, barrels=211, findings=0` |
| Gate de estructura (`pnpm structure:check`) | **verde** (`passed — no new structural debt`) | corridas: `core-owner-boundaries.test.mjs` (5/5) + audit |
| Segmentos genéricos prohibidos (`_internal`, `internal`, `misc`, `shared`, `utils`, `hooks`) | **0** | `find -type d -name …` vacío |
| Duplicados exactos de contenido (>2 KB, `.ts/.tsx/.css`) | **0** | barrido md5 sin colisiones |
| Archivos sueltos junto a subcarpetas | **0 violaciones** — los únicos hits son excepciones clasificadas | ver §2 |
| Carpetas vacías | **23**, todas ya adjudicadas para retiro | lista en §3 |
| Carpetas sin propósito | las 23 vacías + las ya marcadas en el delta §3 de ARCHITECTURE | ver §4 |

## 2. Los únicos archivos sueltos del árbol (todos excepciones clasificadas)

El barrido de archivos no-`index` fuera de regla `folder/index.ts` devuelve
exactamente tres grupos, todos dentro de las excepciones clasificadas de la
doctrina ("generated files, fixtures, test support… are classified exceptions,
not patterns for product code"):

1. `graphics/icons/presentation/semantic/generated/roles/*.ts` (282) y
   `generated/packs/*.tsx` (5) — **salida plana del generador de iconos**,
   por diseño; el corpus se regenera con `icons:generate`.
2. `motion/foundation/particles/config/tests/support/inherited-custom-properties.ts`
   — soporte de tests.
3. `ui/primitives/overlay/Dropdown/tests/fixtures/.../runner/entry.tsx` —
   fixture de test.

Ninguno es producto autorado; no requieren acción. (Si se quiere pureza total,
el generador de roles podría emitir `rol/index.ts`, pero sería ceremonial:
cero valor de arquitectura.)

## 3. Las 23 carpetas vacías (todas ya adjudicadas — F0 del plan)

```text
entrypoints/public/{patterns,primitives,structures,surfaces}/{contracts,runtime}  (8)
graphics/icons/runtime/adapters/phosphor-ssr                                      (1)
graphics/motion/.../particles/runtime/governance/animation-lease                  (1)
infrastructure/runtime/graphics/continuous-runtime-governor/**                    (2)
infrastructure/runtime/presentation-profiles/**                                   (3)
infrastructure/runtime/theming/foundation/color/oklch                             (1)
ui/patterns/data/data-table/engines/modern/styles                                 (1)
ui/patterns/visualization/charts/.../renderers/{area,histogram,sparkline,waterfall}/tests (4)
ui/structures/foundation/chrome/runtime/profile-defaults/{attributes,presentation-recipes} (2)
```

Criterio del plan: una carpeta vacía no es una promesa; o tiene contenido o
no está. Se borran en F0 junto con los otros 12 directorios vacíos fuera de
`src/` (35 en el repo completo — recontar al ejecutar).

## 4. "¿Cada folder/subfolder tiene sentido?" — dónde está la respuesta

La respuesta carpeta por carpeta **es** el árbol objetivo de
[`ARCHITECTURE.md` §2](ARCHITECTURE.md): cada owner listado ahí tiene propósito
único verificado leyendo su propio código (docstring, contratos, imports), no
las auditorías. Lo que **no** tiene sentido está ya adjudicado en su §3 —
resumen por área:

- **foundation/infrastructure:** espejos TS muertos de tokens (19 módulos de
  componentes + base + mirrors + facade), `wcag/` (duplica `color/contrast/`),
  `contracts/composition/components/` (reexport pura), `tokens/extensions/`
  (nunca cableado), cascarones vacíos (`presentation-profiles/`, el clon de
  `continuous-runtime-governor/`, `theming/foundation/color/`, `contracts/
  binding/` con solo `export {}`), el shim `provider/theme/`, la duplicación
  `resolution/{subdomain,domain}/`, el segundo compilador `appearance/`, dos
  lápidas CSS.
- **graphics/entrypoints:** `icons/presentation/legacy/` (15 carpetas), el
  cascarón `adapters/`, las 8 carpetas vacías de `public/`.
- **ui/:** los retiros y unificaciones del §3 (Toggle, Stepper, HoverCard,
  Message, Callout, Space, ConfirmDialog, FloatButton.BackTop, el lado
  patterns de los 4 pares de chrome, approval-inbox, stats-header,
  ListSurface, record-workbench, map-view, alias WorkspaceFilterRail) más las
  convergencias (command-center, empty-state, calendar-view/timeline,
  guided-draft-form, tenant-preview).
- **Reubicaciones:** `density` y `typography-pairings` → `foundation/presets/`;
  helpers de Collapse → su owner.

## 5. "¿Nada tiene funcionalidad duplicada?" — la respuesta precisa

- **Duplicación exacta de bytes: cero** (barrido md5). Nunca fue el problema.
- **Duplicación de capacidad (mismo trabajo, otra implementación):** es la
  totalidad del delta §3 de ARCHITECTURE. Cada caso tiene canónico declarado y
  destino (retiro, migración o absorción).
- **Barrido de composición (hecho hoy, agrega 3 casos al §3):** se verificó si
  los tiers altos realmente componen a los bajos o los reimplementan.
  Confirmaciones sanas: `tree-view`→`Tree`, `step-wizard`→`Steps`,
  `surface-lifecycle`→`Skeleton`. Nuevas violaciones encontradas, ya agregadas
  al §3 de ARCHITECTURE: `mono-stat` reimplementa el conteo a mano (ni `CountUp`
  ni `useSmoothCounter`); `terminal-block` reimplementa el motor de tipeo
  (su docstring admite "reuses the same typing feel" de `Typewriter`);
  `grid-view`/`gallery-view` tienen dos copias casi verbatim de
  `item-identity`. Con estos, no quedan duplicados conocidos fuera del §3.

## 6. Para la re-auditoría (Fable)

Puntos de ataque: (1) la lista de 23 vacías — ¿alguna es andamio planificado
y no residuo? (las 8 de `entrypoints/public/` el mapa no pudo determinarlo);
(2) los "parecidos sanos" descartados — ¿alguno es duplicación real?; (3) la
clasificación de excepciones del §2 — ¿el generador de roles debería emitir
carpetas?; (4) cualquier owner del árbol §2 de ARCHITECTURE cuyo propósito
declarado no coincida con lo que su código hace.
