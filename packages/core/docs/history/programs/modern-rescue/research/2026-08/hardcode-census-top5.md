# Scout READ-ONLY — Censo de hardcodes y canales sin raíz (WO-CRA-23)

- **Fecha:** 2026-08-30
- **HEAD:** `e14213be8` (`docs(modern-rescue): asiento roadmap entry 25 — T-1 constitucional cerrado`)
- **Árbol:** 1 modificado ajeno (`packages/showroom/src/app/probe/ds-reference/ground/index.tsx`, trabajo F4C en curso) + untracked ajenos (`docs/reauditoria-cloud/`, `artifacts/quality/programs/modern-rescue/cascade-proofs/controls/palette-status-seeds/pre-derivation-five-phase-canary/`, `packages/showroom/scripts/f4c-canary-capture.mjs`). Ninguno es input de este censo salvo `docs/reauditoria-cloud/` como **fuente documental** (ver §1).
- **Regla cumplida:** cero escritura sobre el repo. Todos los scripts de trabajo en `/tmp/wo-cra-23-scout/` (fuera del repo). Este reporte es el único archivo creado.
- **Advertencia de entorno (confirmada):** el `grep` interactivo de esta shell está envuelto con `ugrep` y su `--include` tiene semántica distinta — falla con `--include=*.css: No such file or directory`. Ya lo documentó `docs/evidence/2026-08/pre-f4b-sonnet-inventory.md` §5. Toda reproducción por grep debe usar `find … | xargs grep` o la herramienta Grep, nunca `grep --include` a mano.

---

## 1. Estado del censo

### 1.1 Fuentes originales encontradas

El censo previo existe en tres capas:

1. **`docs/reauditoria-cloud/brazos-v2/P2-cascade.md`** (287 líneas, medido 2026-08-24 entre `dcc44a609` y `f166570d9`) — la reconciliación canónica de los tres instrumentos de cascada. Es la fuente del número 729 y de la clase B (760/960). **Ojo: este archivo está en `docs/reauditoria-cloud/`, directorio FOREIGN/untracked que la fence del programa prohíbe staged** (`README.md:423-425` del programa: *"no foreign files (never `docs/reauditoria-cloud/`) enter the staging"*). Se cita como evidencia; nunca entra a un commit.
2. **`docs/evidence/2026-08/pre-f4b-sonnet-inventory.md`** (commiteado, medido 2026-08-22 a `9d5582dfd`) — inventario del ratchet y de las pseudo-raíces posicionales (730 de 768).
3. **Artefactos vivos commiteados** — `packages/core/manifest/generated/root-membership.json` (regenerado en `eebef22fb`, 2026-08-29, digest `b219aa52…`), `scripts/engine/token-audit/token-baseline/index.json`, `scripts/engine/cascade-wiring-ratchet/cascade-wiring-ratchet.baseline.json`.

### 1.2 Verificación contra HEAD `e14213be8` (todo reproducido)

| Métrica | Valor previo | Valor HOY | Comando de reproducción |
|---|---|---|---|
| Canales `--ds-*` sin raíz (universo: emitidos por ≥1 slot autorado de los 3 brand themes) | **729** sin atribuir / 1.610 / 881 con raíz (P2, 2026-08-24) | **729 / 1.610 / 881 — SIN DELTA** | `python3 -c "import json; d=json.load(open('packages/core/manifest/generated/root-membership.json')); print(d['stats']['withRoot'], d['stats']['withoutRoot'], d['stats']['byVia'])"` → `881 729 {'unattributed': 729, 'governed-owner-table': 495, 'declared-fallback': 344, 'head-exact': 42}`. Inputs sin cambios desde la generación: `git diff --name-only eebef22fb..HEAD -- packages/core/src` = 1 solo archivo (`tooling/lane-control/runtime/tenant-reach/index.mjs`, tooling, no input del censo). |
| Frescura del gate root-membership | — | **`--check` se niega: `dist/` rancio** | `node packages/core/scripts/tokens/root-membership/index.mjs --check` → `slot-inventory: dist/ esta rancio…` (stamp `64e09ef67daf` vs fuente `77b95913dd1b`). Fail-closed funcionando como diseño; es requisito de frescura de build, NO evidencia de drift de membresía. No reconstruí dist porque este scout es read-only. |
| Ratchet cascade-wiring | 2.169/4.373 (P2) | **2.169/4.373 — idéntico** | `node packages/core/scripts/engine/cascade-wiring-ratchet/index.mjs` → `OK -- 2169 names still unwired of 4373 (2204 reach a root; 769 roots/ramps excluded; 391 skin files)`. Partición 840 sin-fallback / 1.329 con-fallback también reproduce exacta (mi replay, §5). |
| Channel-liveness | 440 universo / 407 LIVE / 33 no-LIVE / **48 findings**; README y checkpoint dicen 49 | **440 / 407 / 33 / 48 — stale por 1 CONFIRMADO otra vez** | `node packages/core/scripts/tokens/channel-liveness-gate/index.mjs` (modo reporte, sin `--write`) → `universe=440 … LIVE_MODERN_PAINTED 394 + FROZEN 1 + EXTERNAL 12 = 407; READ_NO_PRODUCTIVE_TERMINAL 3 + READ_UNPROVEN 1 + AUTHORABLE_UNPROVEN_EFFECT 25 + UNREAD_EMITTED_NO_KNOWN_ROUTE 4 = 33; FAIL -- 48 finding(s)`. El 49 vive en `scripts/quality-evidence/programs/modern-rescue/README.md:258` y `checkpoint/index.json:4`. P2 ya lo reportó (su §"Checkpoint stale"); sigue sin corregirse y está asentado como diferido-con-dueño. |
| Pintura inline en TSX (`fleet.inlinePaint`) | baseline pineado: **210 sitios / 54 archivos** / 818 elegibles | **190 sitios / 54 archivos** / 878 elegibles — **delta −20 sitios, 0 archivos nuevos con pintura** | `node packages/core/scripts/engine/token-audit/index.mjs --current-json` → `fleet.inlinePaint.total: 190`, 54 claves `fleet.inlinePaint.*` > 0, `filesScanned: 878`. Diff contra baseline: 6 archivos bajaron (tenant-preview modern 21→14, bullet 12→6, MarkdownView 18→15, CodeBlock 13→11, story-helpers 6→5, presence 3→2), **ninguno subió**. 60 archivos nuevos entraron al censo con 0 (la red atrapa altas). **Corrección al brief: el "~54 sitios" es en realidad 54 ARCHIVOS; los sitios son 190.** |
| Namespace privado `--_ds-*` | 198 consumidos-sin-declarar / unión 380 (P2, corregido de 196 por comentarios) | **198 / 380 — reproduce EXACTO** | replay del método P2 (script `/tmp/wo-cra-23-scout/private-ns-census.mjs`): postcss `walkDecls` sobre los 473 `.css` de `src` para declaraciones + `var(--_ds-*)` con comentarios stripeados para consumo: `declared 182, consumed 377, union 380, consumidos-sin-declaración 198, declarados-nunca-consumidos 3`. |
| Exposición runtime de `--_ds-*` | 0 (P2) | **0 — verificado nombre por nombre** | lecturas bare (sin fallback en algún sitio) = 4 nombres; los 4 tienen productor TSX de producción verificado a mano: `--_ds-grid-column-gap`/`--_ds-grid-row-gap` → `src/ui/primitives/layout/Grid/engines/modern/index.tsx:260,268` (forma `(computedStyle as GridParameterStyle)["--_ds-…"] = …` — ojo: esta forma con cast NO la captura un regex de `'--ds-x':`, ver §1.3); `--_ds-toast-undo-ring-circumference` → `src/ui/primitives/feedback/Toast/compound/UndoToast/index.tsx:232`; `--_ds-dropdown-arrow-anchor-offset` → `src/ui/primitives/overlay/Dropdown/engines/modern/index.tsx:622`. |
| Clase B (canal cuyo **literal de fallback ES el único valor**: sin productor en ningún plano) | 760 modern / 960 corpus (P2, 2026-08-24) | **795 modern / 995 corpus** (delta +35/+35) | replay documentado en §5. El conjunto `debt` (2.169) y la partición 840/1.329 son idénticos a P2; el delta +35 vive íntegramente en el plano productor (mi detector: 4 formas TSX sobre DS + 3 apps; el de P2 no está archivado). La cifra honesta es **~795 con detector documentado**, no un número pineado. |
| Clase A (sin productor Y sin fallback → `unset` real) | 64 corpus / **0 modern** (P2) | **69 corpus / 0 modern** | mismo replay. La invariante que importa reproduce: **en modern no existe ningún canal leído sin productor ni red → cero "cero pintura" en producción modern.** Los 69 corpus son rustic-only/presentation-only en su mayoría (muestra: `--ds-cascader-*`, `--ds-treeselect-*`). |

### 1.3 Lección de instrumento (confesada)

Mi primer replay de la clase B dio 803/1.007 por un bug mío: el regex de productores TSX aceptaba `"` al abrir pero no al cerrar (`['"\`](name)['\`]`), ciego a la forma `"--ds-x":` con comillas dobles que el repo usa (p.ej. Tooltip). Corregido a `['"\`]…['"\`]` y re-corrido: 795/995 y clase A modern 0. Lo reporto porque demuestra que **la clase B es un número detector-dependiente**: cualquier cohorte que lo use como cola debe fijar el detector en el repo (script versionado), no en scratchpads. Es exactamente el hallazgo P2 §"Fix correcto" nº 2 (re-anclar el ratchet sobre la clase B con clasificador reconstruido).

---

## 2. Clasificación en 4 cubos

Universo inline TSX: 190 sitios / 54 archivos (definición mecánica de "pintura": claves `background*|border*|outline*|color|boxShadow|textShadow|fill|stroke|accentColor|filter|backdropFilter|transform` en sinks de estilo, `scripts/lib/paint/inline-paint-counter/index.mjs:15-31` — nótese que `transform` cuenta como pintura, línea 30). Clasificación exhaustiva de los 15 archivos top (161 sitios), muestreo dirigido del resto (29 sitios).

Universo CSS: 2.169 canales en deuda de forma del ratchet; dentro, 1.329 con fallback; dentro, 995 (corpus) / 795 (modern) clase B.

### Cubo (a) — hardcodes legítimos / estructurales / data-driven

**~95 de los 190 sitios inline.** Ninguno es un color de producto fijado a mano:

- **Adjudicado "undeclared by design":** `structures/feedback/surface-lifecycle/error-boundary/index.tsx:104-107,137-140` — 8 sitios, 4 canales `--ds-error-boundary-*` con hex de respaldo. Docblock `:64-72`: *"STYLING ESCAPE HATCH (documented)… this boundary outlives its own design system. No other component may copy this pattern."* Adjudicación viva en `src/foundation/tokens/reads-adjudication.json:14993-15052` (`"class": "MODERN_PRIVATE"`, `"undeclared by design: N read(s) carry a fallback that governs"`). **Deuda menor detectada:** las rutas de evidencia de esa adjudicación apuntan a `src/ui/surfaces/runtime/error-boundary/index.tsx`, que ya no existe (el owner vive en `structures/feedback/surface-lifecycle/`) — candidata a `engine-audit:relocate-paths` (ley CLAUDE.md sobre contadores path-keyed).
- **Data-driven (el valor ES el dato):** paletas de preview del tenant (`patterns/customization/tenant-preview/engines/modern/index.tsx:73-82,315,322,346` y rústic `:51-60,221` — `mixColor(base,'#ffffff',…)` son extremos de interpolación del color que el tenant está eligiendo); swatches de serie de charts (`patterns/visualization/charts/families/bullet/index.tsx:206`, `bar-chart/index.tsx:272,281`, `waterfall/index.tsx:155`, `sankey/index.tsx:880`, `pie-chart/index.tsx:161`, `histogram/index.tsx:174,179`, `network-graph/index.tsx:483`); `token.color` de CodeBlock (`:194` — la paleta de sintaxis la aporta un highlighter REGISTRADO POR LA APP, `:20` *"delegated to an app-registered"*); colores de usuario/columna/marcador (`presence/index.tsx:191`, `map-view/engines/modern/index.tsx:188`, `kanban-board/engines/rustic/index.tsx:174`, `surfaces/presentation/pages/operations/kanban/index.tsx:104`, `form-builder/engines/modern/index.tsx:325` color-swatch del color-picker); tema hostil sintético de brand-studio (`:370-383` — construye un BrandTheme draft adversarial, es data de prueba).
- **Mecanismo sin equivalente CSS:** Watermark canvas data-URL (`engines/modern/index.tsx:123-131`, docblock *"no static value to lift into CSS"*); QR `#ffffff` floor de escaneabilidad (`QRCode/runtime/encoded-symbol/index.tsx:14`); geometría de motion (`Tabs/engines/modern/index.tsx:519`, `Tooltip/engines/rustic/index.tsx:202` — cuentan porque `transform` está en la lista de claves); passthrough de props del escape hatch Box (`engines/modern/index.tsx:388-420` vía `buildBoxStyles` — *"Box is the style-injection escape hatch"*, `:447-449`) y `textColor` de Avatar (`engines/modern/index.tsx:250-252`).
- **Falso positivo benigno del contador (fail-closed por diseño):** `activity-log/engines/modern/index.tsx:440` — `color: TONE_BY_CATEGORY[category]` es un campo del CONFIG del Timeline con valores `'success'/'blue'/…` (`:87-94`), no una declaración CSS.

### Cubo (b) — fallbacks de `var()` como red (el canal tiene productor)

- **CSS:** 330 canales con fallback Y productor (1.329 − 995). El valor terminal viene de la cascada; el literal es red, no pintura.
- **Inline TSX:** ~75 sitios, la mayoría del censo inline restante: `patterns/foundation/engine-styles/modern/index.ts:5-8,29-31,76-78,94` (18/18 lecturas `var(--ds-*)` + `transparent`/`none` estructurales); MarkdownView (13 de 15, p.ej. `:115-117`); CodeBlock (10 de 11, con color-mix que DERIVA de canales gobernados, p.ej. `:233-234` header-bg, `:343-348` rail de highlight, `:374-378` gutter-ink con ley de contraste K4-B asentada); `list-toolbar/foundation/tokens/index.ts:40-66` (cadenas `var(--ds-search-*, var(--ds-toolbar-*, var(--ds-color-*)))` que además ESTAMPAN canales `--ds-input-*`, `:55-66`); `backdrop/index.tsx:62` (`var(--ds-overlay-bg, var(--ds-modal-overlay-bg, rgba(0,0,0,0.5)))` — `--ds-modal-overlay-bg` está enraizado vía `tier.base.bg`; `--ds-overlay-bg` tiene productor pero `rootId: null` en root-membership — es un miembro vivo de los 729, deuda de ATRIBUCIÓN, no de pintura); `Collapse/runtime/tokens/index.ts` (hook de tokens tenant-aware, 1 sitio).
- Estos sitios son la deuda de FORMA que `CLAUDE.md:566` ya nombra: *"Inline `var(--ds-*)` reads left in engine files are migration debt tracked by the paint censuses (decrease-only), not the pattern to copy."* Carril WO-SKIN, decrease-only, NO es cola de WO-CRA-23.

### Cubo (c) — prototipos privados y no-producto

- **198 nombres `--_ds-*`** consumidos sin declaración CSS (de 380 en unión; 182 sí declarados). Exposición runtime = **0** (los 4 con lecturas bare tienen productor TSX, §1.2). Es deuda de GOBIERNO pura: `customization-model/index.json` → `namespaceLifecycle.privateProvisional` exige `owner, producer, fallbackAuthority, productiveConsumerFamilyIds, promotionCriteria, retirementCriteria` por socket y no existe gate que lo haga cumplir (fix P2 nº 5). La ley de drenaje (`namespaceLifecycle.drainLaw`, línea 50) prohíbe mover deuda a `--_ds-*` como parking.
- `--_ds-markdown-task-fill*` en `MarkdownView/index.tsx:388-392` (prototipo privado con fallback a `--ds-color-primary`, forced-colors documentado).
- **Excepciones clasificadas (no son producto):** `primitives/navigation/examples/index.tsx:430` — `border: '1px solid #ddd'`, literal hex en archivo de EXAMPLES (excepción clasificada de CLAUDE.md: fixtures/examples/stories no son código de producto autorado); `surfaces/foundation/common/story-helpers/index.tsx:88-101` (5 sitios var() en helper de stories). El `#ddd` es el único color literal pelado encontrado en todo el barrido inline — y no vive en producto.

### Cubo (d) — pintura de producto realmente fuera de cascada

**El cubo (d) vive en CSS, no en TSX.** En el barrido inline de producto: **0 sitios de color literal fuera de cascada** (el único hex pelado es el `#ddd` de examples, cubo c). La masa real:

- **795 canales modern (995 corpus) clase B**: leídos en skins, con literal de fallback que ES el valor, sin productor en ningún plano (CSS declarado, bundles `styles/`, artefactos de tenant, ni TSX de los 4 repos).
- Composición de los 795 por tipo de literal: **52 color** (hex/color-mix/named), **691 geometría numérica** (px/rem/scale), **53 otros** (easings, keywords).
- Distribución por archivo de skin (el write-set natural de una cohorte), top 25 medido: `data-table.css 52, tooltip.css 48, approval-workflow.css 33, badge.css 32, list-toolbar.css 26, saved-views.css 24, popover.css 19, descriptions.css 18, kbd.css 18, select.css 18, live-feed.css 17, overlay-modal.css 16, stepper.css 16, tag.css 16, column-settings.css 14, float-button.css 14, steps.css 14, pagination.css 13, sheet.css 12, form-builder.css 11, statistic.css 11, step-wizard.css 10, tour.css 10, workspace-switcher.css 10, form.css 9` (105 clusters por prefijo de nombre en total).

---

## 3. Top-5 clusters del cubo (d), por impacto × mecanicidad

Mecanicidad = fracción sustituible por canal/raíz gobernada EXISTENTE sin decisión de diseño. Ley que condiciona TODO lo mecánico (README del programa, *Mechanical-lane safety law*, :351-360): prohibido declarar nombres que hoy solo existen dentro de fallbacks; **toda sustitución exige paridad de valor en los 3 verticales** antes de tocarse; donde el literal ≠ valor de la raíz candidata, la corrección es decisión sighted del DT, no mecánica. Familias verificadas contra `family-inventory/index.json` (255 filas).

### C1 — `--ds-table-*` / `--ds-density-factor-*` en `data-table.css` — 52 canales (3 color / 48 geometría / 1 otro)

- **Archivo:** `src/foundation/tokens/css/runtime/engines/modern/skin/data-table.css` (122 lecturas `var(--ds-table-` en el archivo).
- **Familias:** `primitive/display/table` + `pattern/data/pattern-data-table` (ambas consumen `--ds-table-*`; verificado por tests del patrón que leen esos canales).
- **Canales ejemplo:** `--ds-table-action-cell-padding-comfortable, 0 0.625rem` (`:60-63`); **`--ds-density-factor-compact, 0.85` (`:157,184`) y `--ds-density-factor-spacious, 1.15` (`:168,194`)** — los factores de densidad del propio dial `density.mode` duplicados como literales en el skin. Es el sub-hallazgo de mayor apalancamiento del censo: el dial existe y es operativo, pero estos canales no tienen productor.
- **Corrección candidata:** atribución por vía `governed-owner-table` (vía 3 de root-membership: 495 canales ya atribuidos así) hacia las raíces de `density.mode`/`spacing.rhythm` ya operativas; para los factores de densidad, la vía correcta es que el CONTROL los emita (declaredOutputs de `density.mode`), no que el skin los declare. Mecanicidad alta en geometría; los 3 color requieren decisión.

### C2 — Flechas de overlay: `tooltip.css` (48) + `popover.css` (19) — 67 canales (13 color / 54 geometría)

- **Archivos:** `…/engines/modern/skin/tooltip.css`, `…/engines/modern/skin/popover.css`.
- **Familias:** `primitive/display/tooltip`, `primitive/overlay/popover`.
- **Canales ejemplo:** `--ds-tooltip-arrow-edge-offset, 1rem` (`tooltip.css:620,627,634`); `--ds-popover-arrow-edge-offset, 1.25rem`; `--ds-popover-arrow-size, 0.6875rem`; `--ds-popover-body-scrollbar-width, thin`.
- **Corrección candidata:** mecánica parcial — max-widths y offsets que coincidan con steps de spacing; **la geometría de flecha (offsets/anchor/size) no tiene raíz existente** → exige adjudicación previa del DT (¿raíz nueva de geometría de flecha? ¿owner-step?) ANTES del lote, no durante. Mecanicidad media.

### C3 — `approval-workflow.css` — 33 canales (0 color / 33 geometría)

- **Archivo:** `…/engines/modern/skin/approval-workflow.css`.
- **Familia:** `pattern/workflow/approval-workflow` (1 sola — blast radius mínimo del top-5).
- **Canales ejemplo:** `--ds-approval-action-font-size, 13px` (`:139`); `--ds-approval-action-height, 32px`; `--ds-approval-action-padding-inline, 12px`.
- **Trampa de paridad medida:** `--ds-font-size-sm` = `0.875rem` = 14px (`foundation/themes/default.css:616` sobre `--ds-font-size-sm-base` en `:606`); el literal es **13px** — sustituir por la escala cambia 1px renderizado → decisión sighted, no mecánica. El resto (heights/paddings) sí tiene candidatos mecánicos en spacing/control-size.
- **Por qué piloto:** 1 familia, 1 skin, composición 100% geométrica, y fuerza a resolver el protocolo de paridad-de-valor con el caso más barato posible.

### C4 — Labels de estado: `badge.css` (32) + `tag.css` (16) — 48 canales (17 color / 31 geometría)

- **Archivos:** `…/engines/modern/skin/badge.css`, `…/engines/modern/skin/tag.css`.
- **Familias:** `primitive/display/badge`, `primitive/display/tag`.
- **Canales ejemplo:** `--ds-badge-avatar-border, color-mix(in srgb, currentColor 18%, transparent)` (`badge.css:200-201`, con `--ds-badge-avatar-border-width, 1px`); `--ds-badge-avatar-radius, 9999px`; `--ds-tag-close-focus-ring, 0 0 0 2px color-mix(in srgb, currentColor 26%, transparent)` (`tag.css:326-331`).
- **Corrección candidata:** las recetas `color-mix(currentColor)` son derivaciones, no colores de marca — candidatas a ley de derivación documentada. **PERO:** badge/tag son carriers del control ACTIVO `palette.status-seeds` (F4C en ejecución, `F4C/README.md`). Secuencia, no forma: este cluster NO se abre hasta el cierre F4C para no contaminar el canary. Mecanicidad bloqueada por calendario.

### C5 — Chrome de workspace: `list-toolbar.css` (26) + `saved-views.css` (24) — 50 canales (7 color / 43 geometría)

- **Archivos:** `…/engines/modern/skin/list-toolbar.css`, `…/engines/modern/skin/saved-views.css`.
- **Familias:** `pattern/data/list-toolbar`, `pattern/data/saved-views`, `structure/workspace/table-toolbar` (comparten vocabulario `--ds-toolbar-*`).
- **Canales ejemplo:** `--ds-toolbar-control-pressed-scale, 0.975` (`list-toolbar.css:303` — candidato mecánico directo a `--ds-state-press-scale`, que SÍ tiene declaración en `default.css:876` según P2 §"top-10 verificado"; exige prueba de paridad 0.975 vs valor de la raíz); **`--ds-control-size-md, 2.5rem` (`:537`) y `--ds-control-size-sm, 32px` (`:879-880`)** — canales de CONTROL SIZE como literales, con inconsistencia de unidad rem/px incluida, en la órbita del bloqueo asentado `control.size ↔ density.mode` (T-1); `--ds-saved-views-bar-min-height, 40px` (`saved-views.css:47` — ¿o el touch-target 44px? decisión).
- **Corrección candidata:** encadena con C1 por `table-toolbar`; los `--ds-control-size-*` NO se tocan hasta que el DT desbloquee la adjudicación control.size↔density.mode (asentada en T-1).

---

## 4. Qué NO debe tocarse (con cita de ley)

1. **`docs/reauditoria-cloud/`** — foreign/untracked; fence explícita: *"no foreign files (never `docs/reauditoria-cloud/`) enter the staging"* (README programa :423-425). Fuente de este censo; jamás en un commit.
2. **Los artefactos generados** (`manifest/generated/root-membership.json`, `manifest/cascade/extracted/*`, baselines de gates): *"No generated artifact, baseline or evidence receipt is hand-edited"* (README :447). El 729 se mueve regenerando con el generador tras cambios de fuente; el baseline del ratchet es **decrease-only** y P2 prohíbe además "subir el baseline o dar el gate por sano: hoy pasa verde midiendo forma de fallback".
3. **Ninguna cola "drenar 2.169"** — P2 la refutó: 739 de la porción modern eran falsos positivos del clasificador viejo y 670 no son modern. La cola honesta es la clase B (~795 modern) con detector fijado en repo.
4. **Minteo de canales públicos prohibido como fix** — *"No family writer mints public `--ds-*` channels"* (README :446) y `customization-model/index.json:9,19`: un canal público nuevo exige migración atómica con lowering static/DB, propagación, restore exacto y retiro del predecesor. **Declarar 795 canales en `:root` NO es la corrección**: la corrección es atribuir a raíces existentes por las 3 vías o que el control dueño los emita.
5. **`--_ds-*` como parking** — `drainLaw` (customization-model/index.json:50): prohibido mover deuda al namespace privado para diferir decisiones.
6. **Classic/Rustic read-only** (README :443) → los 69 canales clase A corpus (cascader/treeselect, rustic-only) NO se drenan en este programa; la pregunta quedó con el owner (P2 §"Lo que no pude cerrar").
7. **El escape hatch de error-boundary** — adjudicado `MODERN_PRIVATE` "undeclared by design" (reads-adjudication.json:14993-15052) con docblock que prohíbe copiar el patrón. Tocarlo rompe la propiedad que justifica su existencia (pintar cuando el DS es la causa del crash).
8. **Expert allowlist congelada durante el drain** (README :80-84) y **dark mode sin trabajo dedicado, sin degradar baselines** (README :432-433).
9. **Channel-liveness (33 no-LIVE / 48 findings)** — diferido con dueño, vuelve a blocking cuando exista su enumerador (README :258). No es cola de cohortes de pintura. Incluye el stale 49→48 por corregir cuando se reabra.
10. **Showroom/lab** — fuera del censo de producto (el corpus fleet.inlinePaint es `packages/core/src/ui`); las escenas del reference lab son harness de F4C, no cubo (d).

---

## 5. Recomendación de cohortes

**Ley de write-set:** cada cohorte = 1-2 archivos de skin EXCLUSIVOS + sus filas en `manifest/cascade/owner-tiers.json` / `owner-step-rules.json` (adjudicación del DT, autorada por lote) + regeneración serializada de `manifest/generated/*` (los generados se comparten entre cohortes pero se REGENERAN por generador al cierre de cada lote — la disyunción se logra serializando, no editando a mano). Gates por lote: ratchet (debe BAJAR, nunca subir), `token-audit --check`, `root-membership --check` (tras build), suites cascade-producers/extract.

| Orden | Cohorte | Write-set primario | Por qué ahí |
|---|---|---|---|
| 1 | **C3 approval-workflow** (33 ch) | `skin/approval-workflow.css` + owner-tiers + regenerados | Piloto: 1 familia, 100% geometría, fuerza el protocolo de paridad-de-valor (13px≠14px) con el blast radius mínimo |
| 2 | **C1 table + density factors** (52 ch) | `skin/data-table.css` + owner-tiers + regenerados | Mayor conteo por archivo; incluye los `--ds-density-factor-*` cuyo dueño natural (`density.mode`) ya es operativo |
| 3 | **C5 toolbar + saved-views** (50 ch) | `skin/list-toolbar.css` + `skin/saved-views.css` + owner-tiers | Encadena con C1 por `table-toolbar`; excluye `--ds-control-size-*` hasta la adjudicación control.size↔density.mode |
| 4 | **C2 overlay arrows** (67 ch) | `skin/tooltip.css` + `skin/popover.css` + owner-tiers/step-rules | Requiere decisiones de diseño de geometría de flecha RESUELTAS antes del lote (adjudicación DT previa) |
| 5 | **C4 badge + tag** (48 ch) | `skin/badge.css` + `skin/tag.css` + owner-tiers | DESPUÉS del cierre F4C: badge/tag son carriers del canary activo `palette.status-seeds`; abrirlos antes contamina la evidencia del control |

**No-cohorte:** los ~190 sitios inline TSX de los cubos (a)/(b) son deuda de FORMA (skin-first, carril WO-SKIN con su propio ratchet decrease-only), no de color ni de cascada; no abrirlos en WO-CRA-23 salvo los que un lote toque por otra razón. Los 198 `--_ds-*` esperan su propio gate de gobierno (fix P2 nº 5), no una cohorte de pintura.

---

## 6. Método exacto (reproducción)

```bash
cd /Users/daniel/Developer/Rottay/ui-design-system
git rev-parse --short=8 HEAD                      # e14213be8
git status --porcelain                            # 1 mod ajeno + 3 untracked ajenos

# 729 (artefacto persistido; --check exige dist fresco, hoy se niega fail-closed)
python3 -c "import json; d=json.load(open('packages/core/manifest/generated/root-membership.json')); print(d['stats']['withRoot'], d['stats']['withoutRoot'], d['stats']['byVia'], d['digest'])"
node packages/core/scripts/tokens/root-membership/index.mjs --check   # FAIL por dist rancio (frescura, no membresía)
git diff --name-only eebef22fb..HEAD -- packages/core/src             # 1 archivo, tooling/lane-control (no input)

# 2169/4373 y 840/1329
node packages/core/scripts/engine/cascade-wiring-ratchet/index.mjs

# 440/407/33/48
node packages/core/scripts/tokens/channel-liveness-gate/index.mjs     # modo reporte, sin --write

# 190 sitios / 54 archivos inline (y baseline pineado 210)
node packages/core/scripts/engine/token-audit/index.mjs --current-json > /tmp/ta.json
python3 - <<'EOF'
import json
cur,_=json.JSONDecoder().raw_decode(open('/tmp/ta.json').read())
nz={k:v for k,v in cur.items() if k.startswith('fleet.inlinePaint.') and isinstance(v,int) and v>0 and not k.endswith(('filesScanned','.total'))}
print(len(nz), sum(nz.values()), cur['fleet.inlinePaint.filesScanned'])
EOF

# 198 --_ds-* y 795/995 clase B: scripts replay en /tmp/wo-cra-23-scout/
#   private-ns-census.mjs  (postcss walkDecls sobre 473 css + var(--_ds-*) con comentarios stripeados)
#   class-b-census.mjs     (importa classifyCascadeWiring/varCalls/collectSkinFiles del repo;
#                           productores: postcss sobre src/**/*.css + styles/*.css + 4 formas TSX
#                           en DS y en app-bithire/app-platform/app-evnto src)
node /tmp/wo-cra-23-scout/private-ns-census.mjs
node /tmp/wo-cra-23-scout/class-b-census.mjs
```

Citas `archivo:línea` verificadas una a una contra HEAD el 2026-08-30. Números con detector propio (795/995, 198) reproducibles con los scripts nombrados; el detector TSX quedó corregido en la corrida final (§1.3).
