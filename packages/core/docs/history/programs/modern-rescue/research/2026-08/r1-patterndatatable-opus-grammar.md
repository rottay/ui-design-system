# OPUS — DIRECCIÓN DE GRAMÁTICA DEL LOTE PatternDataTable (R1 unidad 2, WO-CRA-23)

- **Fecha:** 2026-08-30
- **HEAD:** `a90af6ebb` (`fix(modern-rescue): cascade-producers COH-1 conservation regression — attribute deriveStatusTintFloor`)
- **Árbol:** 5 tracked modificados AJENOS (el lote Button en escritura ahora mismo:
  `presentation/components/button.css`, `presentation/components/skin/button-group.css`,
  `runtime/engines/modern/skin/button.css`, `Button/compound/Group/index.tsx`,
  `Button/engines/modern/index.tsx`) + untracked ajenos (`docs/reauditoria-cloud/`,
  `scouts/r1-button-opus-grammar.md`). **No leí ni toqué ninguno de los cinco archivos en
  escritura**; nada de lo que propongo aquí los pisa.
- **Regla cumplida:** cero escritura sobre el repo salvo este archivo. Sin builds, sin
  servidores nuevos, sin instalar nada. Todas las sondas viven en `/tmp/opus-r1u2/`
  (fuera del repo) y sólo LEEN del dev server que ya estaba corriendo en :7001.
- **Alcance:** unidad 2 = `pattern/data/pattern-data-table` (canary
  `PatternDataTable-mobile-projection`), su árbol de skins y su escena del lab. Nada
  fuera de eso.
- **Cohorte:** `visual-craft/index.json` `checkpointPolicy.roundCohorts.R1[1]` =
  `Card-SemanticSurface`, `ListToolbar-SavedViews-filters`,
  **`PatternDataTable-mobile-projection`**, `CollectionHeader-PageShell`. Los tres
  hermanos de cohorte importan para el write-set (§7).

---

## 0. Método

Cuatro sondas Chromium read-only contra :7001 (`@playwright/test` resuelto desde
`packages/showroom`, `reducedMotion:'reduce'`, `fonts.ready`, viewport fijo), más un
detector de clase B reescrito desde cero, más lectura real de las 4 capturas que produje
en `/tmp/opus-r1u2/`.

| sonda | qué midió |
|---|---|
| `/tmp/opus-r1u2/classb.mjs` | detector de clase B: lecturas `var(--ds-*, literal)` de un skin contra el universo de productores (declaraciones CSS de `packages/core/src` + estampado TS/TSX de DS, showroom y las 3 apps) |
| `/tmp/opus-r1u2/probe1.mjs` | canales de fundación resueltos, anatomía computada de la tabla y **escalera de densidad estampando `data-density` en la raíz de la tabla** (comfortable/compact/spacious), en ambos grounds a 1440 |
| `/tmp/opus-r1u2/probe2.mjs` | atributos reales de la raíz, proyección mobile y overflow a 390 / 768 / 1440 en ambos grounds + capturas |
| `/tmp/opus-r1u2/probe3+4+5.mjs` | diferencia BitHire↔TMM propiedad por propiedad (21 propiedades × 9 nodos), inventario de todo elemento pintado del subárbol, y la tarjeta mobile real |
| `/tmp/opus-r1u2/trace.mjs` | cadena de herencia de tinta desde la etiqueta de la tarjeta mobile hasta `<html>` |

**Corrección de método frente al censo.** El censo (`hardcode-census-top5.md:82-87`) da
**52** canales clase B en `data-table.css`. Mi detector, reproducido y documentado, da
**53** con la definición estricta del censo (el literal de fallback ES el valor y no hay
productor en ningún plano) y **89** si se cuentan también los fallbacks que delegan a
otro `var()`. La diferencia de 1 sobre 53 es ruido de detector, no de sustancia: el
número es detector-dependiente y el propio censo lo advierte (`:1.3`). **Trabajo sobre
los 53 y los enumero uno por uno en §2**; la cifra que el lote debe mover
monotónicamente es la que salga del detector fijado en el repo, no ésta.

---

## 1. Veredicto visual del estado actual

**Veredicto: NO ACEPTABLE como calibración R1, y por una razón distinta a la del
Button.** Button fallaba por gramática (el grupo no leía como una escalera).
PatternDataTable falla por algo más grave: **es la familia donde el motor de
personalización está más muerto de todo lo medido hasta ahora.** Los dos fixtures —uno
con `radiusScale 1.25` y otro que autora explícitamente esquinas cuadradas— renderizan
la tabla con **el mismo radio, el mismo fondo de cabecera, la misma tinta de cabecera,
el mismo filete y el mismo degradado de tarjeta mobile.** No es que la tabla se vea
mediocre: es que el tenant no la puede mover.

### 1.1 Lo que está bien (y no hay que tocar)

- **Pintura skin-first real.** El engine modern tiene **0 lecturas `var(--ds-` inline** y
  **8 `style={{`, todas geométricas data-driven** (anchos medidos de columna, offsets de
  pinning, spacers de virtualización: `engines/modern/index.tsx:1421,1680,1932,2027,2152,2357,2453,2499`).
  Es el cubo (a) del censo, no pintura. **`fleet.inlinePaint` de esta familia debe quedar
  igual o bajar; nunca subir.**
- **La estructura de raíces en cascada YA existe** y es exactamente la forma que el pivot
  de palancas quiere: 7 raíces `--ds-modern-table-*` declaradas en el propio skin
  (`skin/data-table.css:48-70` y siguientes: `cell-padding`, `leading-cell-padding`,
  `selection-cell-padding`, `action-cell-padding`, `control-size`, `control-radius`,
  `divider`), cada una derivando de canales públicos nombrados con fallback. El lote no
  tiene que inventar la arquitectura: tiene que darle productores.
- **La anatomía declarada es seria:** 88 `stableParts`, 24 `states`, 30 `variantAxes`,
  8 `propertyGroups`, 21 `sourceBindings` (`manifest/families/pattern/data/pattern-data-table.json`,
  `anatomy.*`). `assessmentState: SOURCE_BOUND`.
- **El contrato responsive es semántico, no una media query de app:**
  `@container ds-table (max-width: 52rem)` con `data-col-priority` (`skin/data-table.css:2381+`),
  y las columnas pinneadas nunca ceden.
- **`data-anatomy-table` funciona de punta a punta.** El documento DB de TMM autora
  `chrome.table: { anatomy: 'open' }` (`fixtures/themanagement-db-row/index.ts:171`), el
  compilador lo proyecta (`:455`) y el skin lo consume con reglas vivas
  (`skin/data-table.css:2126,2140,2167-2183`). Es un eje de divergencia REAL y probado.
- **`experience.profile` mueve la tabla de verdad.** Medido: BitHire resuelve
  `data-density="comfortable"` + `data-recipe="minimal"`; TMM resuelve
  `data-density="compact"` + `data-recipe="ruled"`, vía
  `useRecipeProfileDefaults("dataTable")` (`presentation/table/index.tsx:295-306,358-359`)
  con `recipeProfile: 'rottay/technical-sharp@1'` (`fixtures/themanagement-db-row/index.ts:434`).
  **Éste es el control que hoy salva la unidad; hay que protegerlo, no rehacerlo.**
- Bloques de `forced-colors`, `prefers-reduced-motion` y piso a11y de puntero grueso
  escritos (`skin/data-table.css:2385-2400`).

### 1.2 Fallos contra la ley (ordenados por daño)

Todo lo que sigue está MEDIDO en vivo en las dos puertas (BrandTheme estático `bithire`
y documento DB `the-management`), no inferido.

---

**[F1] El radio de la tabla es una anti-puerta de compensación: `shape.radius-scale` no
llega. El tenant pidió cuadrado por escrito y recibe 10px.** — *daño máximo*

Medido: `[data-part="card"]` (el marco dominante de la familia) computa
**`border-radius: 10px` en LOS DOS tenants**.

- BitHire: `--ds-radius-scale: 1.25`, `--ds-radius-md` → `calc(calc(10px / 1.25) * 1.25)` = 12.5px.
- TMM: `--ds-radius-scale: 0.8`, `--ds-radius-md` → `calc(calc(0px / 0.8) * 0.8)` = **0px**,
  porque el documento autora `'--ds-radius-md': '0px'`, `'--ds-radius-lg': '1px'` por
  `tokenOverrides` (`fixtures/themanagement-db-row/index.ts:232-238`) con esta razón
  escrita: *"…son la única vía por la que este tenant llega a cuadrado, porque
  `radiusScale` toca fondo en 0.8 y nunca llega a una esquina de ledger"* (`:227-229`).
- Y sin embargo `--ds-table-radius` resuelve `calc(10px / 1.25 * 1.25)` en BitHire y
  `calc(10px / 0.8 * 0.8)` en TMM → **10px en ambos**. El compilador normaliza por la
  escala propia del tenant y la vuelve a multiplicar por la misma escala: el control se
  cancela a sí mismo. Origen del literal: `artifacts/bithire/index.css:1005`; el mismo
  patrón `calc(10px / <escala> * var(--ds-radius-scale, 1))` aparece en 6 canales más
  (`:124` button-lg, `:432` compact-card, `:587` input-lg, `:1043` tabs-list, `:1114` textarea).
- El skin lee `var(--ds-table-radius, var(--ds-radius-lg))` (`skin/data-table.css:897,898,979,980,1017`).
  **El fallback era el correcto (1px en TMM); nunca dispara porque el canal está declarado.**

Es la clase de defecto ya asentada como *anti-puerta de compensación*. Aquí es
visualmente decisiva: el marco de la tabla es la superficie redondeada más grande del
fixture y el tenant monocromo escribió explícitamente que no la quiere redondeada.
Consecuencia dura: **`shape` produce CERO movimiento observable sobre esta unidad**, que
es el eje no-cromático más fuerte del round.

---

**[F2] Piso tipográfico roto en el estado por defecto, en los dos tenants.** — *veto duro*

`mechanicalFloors`: `defaultControlTextMinimumPx: 13`, `microLabelTextMinimumPx: 11`.
Raíz rem medida: 15px (BitHire, type-scale 1) y 15.6px (TMM, type-scale 1.04).

| nodo | BitHire | TMM | piso | veredicto |
|---|---|---|---|---|
| `header-cell` (micro-etiqueta, uppercase, tracking) | **10.3125px** | **10.725px** | 11 | **FALLA en ambos** |
| `data-cell` (contenido primario) | **12.1875px** | **11.2047px** | 13 | **FALLA en ambos** |
| `data-cell` @ `density=compact` (BitHire) | **10.3594px** | 11.2047px | 11 | **FALLA: texto de cuerpo por debajo del piso de micro-etiqueta** |
| `mobile-card-summary-label` | 10.3125px | 10.725px | 11 | **FALLA en ambos** |

Origen del literal de cabecera: `artifacts/bithire/index.css:996`
(`--ds-table-header-font-size: 0.6875rem`), frente a `default.css:1712` que dice
`0.8125rem`. Es decir: **la línea base vertical baja el tamaño por debajo del piso del
programa y el tenant no puede subirlo.** Y el suelo escrito del propio skin es aún más
bajo: `max(calc(header-font-size * 0.85), 0.6875rem)` (`skin/data-table.css:180-192`)
→ 10.31px, por debajo del piso de 11px que el contrato fija.

Veto que muerde: `tiny-or-optically-unbalanced-control-typography`.

---

**[F3] Las cabeceras de columna están centradas sobre datos alineados a la izquierda.**
— *veto duro, visible en la captura*

Medido: `header-cell` computa `text-align: center` y `data-cell` computa `text-align: start`,
**en los dos tenants**. Visible en `/tmp/opus-r1u2/table-bithire-1440.png` y
`table-the-management-1440.png`: "ENABLED" está en x≈426 (centro de su columna) mientras
"false" está en x≈45.

Causa exacta: el skin sólo gobierna la alineación cuando la columna estampa `data-align`
(`skin/data-table.css:448-467`). Sin `align` explícito **gana el default del user agent
para `<th>`, que es `center`**, mientras el `<td>` se queda en `start`. Es decir: el
camino por defecto —el más usado— nace desalineado y el skin nunca lo mira.

Ley violada: `bindingCraftLaws[6]` — *"Peer panels, rows, fields and action clusters
align optically and share deliberate proportions unless priority explicitly differs."*

---

**[F4] La densidad mueve el TIPO y no mueve la altura de fila: la ley de ortogonalidad
al revés.** — *contrato*

`customization-model/index.json` `orthogonality.requirements` exige
`density-moves-component-size-not-arbitrary-gaps` y
`type-scale-moves-type-with-resilient-reflow`.

Medido estampando `data-density` en la raíz de la tabla (BitHire):

| posture | cell font | cell line-height | cell padding | **alto de fila** |
|---|---|---|---|---|
| comfortable | 12.1875px | 16.4531px | 10px 12px | **36.95px** |
| compact | 10.3594px | 12.9492px | 7px 10px | **36.95px** |
| spacious | 14.0156px | 21.7242px | 14px 16px | 50.22px |

`compact` baja el tipo un 15% y **no baja ni un píxel la altura de fila** en BitHire.
La densidad está moviendo el eje de `typography.scale` y no está moviendo el eje que le
corresponde. En TMM sí baja (38.8 → 29), lo que hace el comportamiento
**inconsistente entre tenants** además de invertido.

Peor: la escalera de tipo multiplica por un **literal fijo** (`0.85`/`1.15`), mientras el
padding sí compone la escala efectiva del tenant. La misma postura "compact" produce un
padding compuesto y un paso de tipo congelado.

---

**[F5] Siete fugas de pintura VIVAS: la tabla del tenant monocromo está pintada con
literales de BitHire.** — *G9 del lote Button, violado*

El ground de The Management estampa `data-vertical="bithire"` (verificado en
`document.documentElement`: `{"data-vertical":"bithire","data-tenant":"themanagement"}`),
que es el diseño correcto del lab —mismo envelope vertical, dos documentos de tenant— y
por eso **todo lo que el documento de TMM no sobrescribe conserva el literal autorado
por BitHire.** Medido idéntico en ambos grounds:

| canal | valor medido (los DOS grounds) | autor | efecto sobre TMM |
|---|---|---|---|
| `--ds-table-header-bg` | `#f3f2ef` | `artifacts/bithire/index.css:991` | banda de cabecera fija; el tenant no la puede mover |
| `--ds-table-header-color` | `#53697E` | `:995` → `var(--ds-color-text-page)` → `:373` `#53697E` | **tinta azul-gris de BitHire en las etiquetas de columna del tenant monocromo** (medido `rgb(83,105,126)`) |
| `--ds-table-header-border` | `color-mix(in srgb, #d4e0ea 82%, transparent)` | `:994` → `var(--ds-color-border)` → `:278` `#d4e0ea` | el único filete que separa cabecera de datos es azul-gris de BitHire |
| borde del `[data-part="card"]` | `1px rgb(212,224,234)` = `#d4e0ea` | idem | **el marco entero de la tabla** |
| `--ds-gradient-surface` (tarjeta mobile) | `linear-gradient(145deg, #FFFFFF 0%, #F7FAFC 58%, #F5F2EC 100%)` | `artifacts/bithire/index.css:504` | degradado diagonal frío→cálido idéntico en los dos tenants, sobre la proyección que da nombre al canary |
| tinta de `mobile-card-summary-label` | `rgb(20,40,59)` = `#14283B` | **la primitiva Card**, no esta familia (traza: el corte ocurre en `[data-part="body"] .rottay-card-body`) | etiqueta con tinta de BitHire dentro de una tarjeta cuya raíz sí es `rgb(20,20,18)` |
| `--ds-table-row-bg` | `#FFFFFF` | `:1009` (delegado a `--ds-surface-card`) | coincidencia, no fuga: ambos tenants tienen `#FFFFFF`. **Lo dejo fuera de la cola.** |

Detalle de honestidad que el DT debe leer: el **arm oscuro** del mismo artifact SÍ está
bien derivado (`:1441`
`--ds-gradient-surface: linear-gradient(145deg, var(--ds-surface-card) 0%, var(--ds-surface-panel) 58%, var(--ds-surface-canvas) 100%)`).
Es sólo el arm claro el que está congelado en hex.

---

**[F6] La proyección mobile —el nombre del canary— tiene tres defectos de anatomía.**

Medido a 390 y 768 (los dos grounds conmutan a `[data-part="mobile-root"]`):

1. **El título de la tarjeta es `false`.** La primera columna se promueve a título sin
   estrategia de título: el identificador primario de la tarjeta es un booleano
   (`[data-part="mobile-card-title"]`, `textContent: "false"`, `font-weight: 600`).
2. **Anatomía asimétrica:** el título pierde su etiqueta ("Enabled" desaparece) mientras
   la fila resumen conserva la suya ("Name / Alpha"). El lector no puede saber qué es
   `false`.
3. **La tarjeta contradice al marco de escritorio en radio:** mobile = 12px (BitHire) y
   **0px (TMM)** — o sea la tarjeta mobile SÍ respeta `shape.radius-scale` mientras el
   `[data-part="card"]` de escritorio está clavado en 10px (F1). **La misma familia tiene
   dos autoridades de radio contradictorias.**

Ley violada: `bindingCraftLaws[12]` (*mobile es recomposición por prioridad y
divulgación*) y `bindingCraftLaws[4]` (gradiente como atajo de jerarquía).

---

**[F7] Dos autoridades del piso táctil en el mismo archivo, y una de ellas está corta.**

- `skin/data-table.css:2234-2236` usa `var(--ds-table-touch-target, 2.75rem)`; a raíz rem
  15px eso es **41.25px**, contra `coarsePointerTargetPx: 44`. El canal **no tiene
  productor en ningún plano** (verificado: 0 declaraciones).
- `skin/data-table.css:2400` usa el canal canónico `var(--ds-touch-target-min, 44px)`,
  que **sí está gobernado** (`themes/default.css:928`, 176 lecturas en el corpus).
- Aritmética derivada (no medida en vivo, porque la escena actual no monta esos nodos):
  `drag-grip` = `calc(--ds-modern-table-control-size − 0.375rem)` con control-size 2rem →
  24.4px, + `2 × --ds-table-touch-hit-expansion(0.5625rem)` = 41.3px. También corto.

Es exactamente el mismo defecto que el lote Button encontró en
`--ds-button-touch-target-min` (2.75rem). **La corrección debe ser la misma en las dos
unidades o la gramática se parte.**

---

**[F8] Un canal, tres significados: `--ds-table-cell-line-height`.**

`skin/data-table.css:161,170,746` lee el MISMO canal con tres fallbacks distintos según
postura (`1.25` compact / `1.35` base / `1.55` spacious). El propio comentario lo admite
(`:159-160`: *"El canal compartido de line-height sigue siendo el override del tenant;
sólo cambia el piso de la postura"*). Consecuencia: **en cuanto un tenant autora
`--ds-table-cell-line-height`, la escalera de densidad de interlineado se colapsa a un
solo valor en las tres posturas.** Personalizar rompe la densidad.

---

**[F9] El namespace `--ds-typography-*` es un fantasma y la tabla es su consumidor
principal.**

Barrido del corpus: **16 nombres `--ds-typography-*` leídos, 5 declarados, 13 sin
productor.** Siete de esos 13 los lee `data-table.css` y otros seis
`data-table-mobile.css` (`body-family`, `label-family`, `label-size`, `label-tracking`,
`label-weight`, `section-title-family`, `section-title-tracking`, `section-title-weight`,
`supporting-family`, `supporting-size`, `display-tracking`…). Es un vocabulario de voz
tipográfica entero que ningún control emite.

Efecto medido y contraintuitivo del único declarado: el skin pide
`text-transform: var(--ds-typography-label-transform, uppercase)`
(`data-table-mobile.css:292`) y el canal resuelve **`none`** en ambos grounds → la
etiqueta de la tarjeta mobile sale en minúsculas contra la intención escrita del skin.

---

**[F10] Los iconos entran por el catálogo de compatibilidad.** — *veto duro*

`engines/modern/index.tsx:37-51` importa **14 nombres** (`AlertTriangleIcon`,
`ArrowDownIcon`, `ArrowUpDownIcon`, `ArrowUpIcon`, `ArrowLeftIcon`, `ArrowRightIcon`,
`CheckIcon`, `ChevronDownIcon`, `ChevronRightIcon`, `EyeOffIcon`, `GripVerticalIcon`,
`PinIcon`, `Table2Icon`, `XIcon`) desde `../../../../../../graphics/icons`, cuyo barrel
declara literalmente *"Compatibility catalog (historical names; do not use for new
roles)"* (`graphics/icons/index.ts:17-18`).

Veto: `functional-unicode-emoji-inline-svg-or-legacy-catalog-bypasses-semantic-facade`;
`iconGovernanceContract.forbidden[0]` (*"historical named catalog component used as a new
semantic role"*) y `canonicalFacade` (*"the historical named catalog is compatibility-only
and **cannot certify accepted Modern craft**"*). Con esos 14 imports vivos, **la unidad
no puede certificar craft aceptado**, por más limpias que salgan las capturas.

---

**[F11] `motion.dial` no llega al skin de la tabla en dos sitios.**

`--ds-motion-ease-standard` (leído en `skin/data-table.css:1060,1080` y
`data-table-mobile.css:490`) **no tiene productor**; el literal `ease-in-out` es el valor
final. El canal gobernado equivalente existe y además es autorado por tenant:
`--ds-motion-ease-move` (`themes/animations/transitions.css:127` +
`artifacts/{bithire,evnto,rottay}/index.css` → `var(--ds-ease-standard)`). El resto del
mismo archivo ya usa `--ds-motion-ease-move` correctamente (`:442-445`) — o sea la
inconsistencia es interna al archivo.

---

**[F12] La escena del lab no puede sostener una aceptación.** — *veto duro sobre la captura*

Única aparición de PatternDataTable en todo `/probe/ds-reference`:
`sections/r2-behavior/index.tsx:1478-1503` — **1 fila, 2 columnas**, engine modern fijo,
y su propósito declarado es comportamiento (un save rechazado se anuncia), no craft.
Medido a 1440: la tabla ocupa 75px de alto en un viewport de 900 → **~91% del frame
vacío** (veto `unjustified-dead-space-or-empty-track`). El detalle de datos también
falla: la columna `enabled` es `editable: {type:'checkbox'}` y en reposo se renderiza
como el string literal **`false`**, que es además el título de la tarjeta mobile (F6).

De los 88 `stableParts` del manifest, la escena ejercita **4** (`root`, `table`,
`header-row`/`header-cell`, `data-cell`/`body-row`). De los 24 `states`, **0**.
De las 5 recetas, **2** por accidente del perfil (`minimal` en BitHire, `ruled` en TMM).

---

**[F13] `statesMotion` del manifest está en `UNKNOWN` con `states: []`.**

`manifest/families/pattern/data/pattern-data-table.json` → `statesMotion.assessmentState:
"UNKNOWN"`, `nextAction: "CENSUS_STATES_TRANSITIONS_INPUTS_AND_REDUCED_MOTION"`, mientras
`anatomy.states` ya lista 24. Las dos secciones del mismo manifest se contradicen. Y
`review.verdict: null` con los 21 `themeControls` en `UNKNOWN`/`NOT_ASSESSED`.

### 1.3 Divergencia de tenant medida sobre esta unidad: 7 ejes reales, 6 anulados

Comparación propiedad a propiedad (21 propiedades × 9 nodos, dos anchos, dos grounds):

**Ejes que SÍ divergen (7, de los cuales 5 no-cromáticos):**

| eje | BitHire | TMM |
|---|---|---|
| tinta de contenido | `rgb(20,40,59)` | `rgb(20,20,18)` |
| raíz rem / type-scale | 15px / 1.0 | 15.6px / 1.04 |
| postura de densidad resuelta | `comfortable` | `compact` |
| receta resuelta | `minimal` | `ruled` |
| peso del filete de cabecera | 1px | **2px** |
| alto de fila | 36.95px | 29px |
| elevación de la tarjeta | `box-shadow: none` | regla dura con offset, sin blur |

**Ejes ANULADOS (6) — el corazón del problema:**

1. radio del marco de escritorio (10px = 10px) — F1
2. fondo de la banda de cabecera (`#f3f2ef` = `#f3f2ef`) — F5
3. tinta de la cabecera (`#53697E` = `#53697E`) — F5
4. color del filete y del borde del marco (`#d4e0ea` = `#d4e0ea`) — F5
5. material de la tarjeta mobile (el mismo `linear-gradient(145deg, …)`) — F5
6. easing de las transiciones del skin (`ease-in-out` = `ease-in-out`) — F11

`rounds/index.json` R1 exige **≥8 ejes con ≥6 no-cromáticos**. Hoy hay 7/5. **La unidad no
alcanza el umbral de divergencia con lo que tiene**, y los 6 ejes que faltan son
exactamente los que están anulados. Es una buena noticia operativa: cerrar F1 y F5
convierte 6 anulaciones en ejes vivos y lleva la unidad a 13/9 sin inventar nada.

---

## 2. Los 53 candidatos clase B del cluster C1

### 2.1 Método y corrección al censo

Definición del censo, aplicada literalmente: canal leído en el skin cuyo **literal de
fallback es el único valor**, sin productor en ningún plano (CSS declarado en
`packages/core/src`, artifacts de tenant, ni estampado TS/TSX en DS + showroom + las 3
apps). Detector: `/tmp/opus-r1u2/classb.mjs`. Universo de productores construido:
**4.426 nombres**.

| archivo | lecturas únicas | clase B estricta (literal puro) | clase B laxa (incluye fallbacks que delegan) |
|---|---|---|---|
| `runtime/engines/modern/skin/data-table.css` | 178 | **53** | 89 |
| `presentation/components/skin/data-table-mobile.css` | 92 | **26** | 35 |
| `presentation/components/skin/data-table-interactions.css` | 19 | 2 | 2 |
| `presentation/components/skin/data-table-actions.css` | 7 | 2 | 2 |

**Aviso al DT nº1 — la cola real de la unidad es 53 + 26 (mobile), no 52.** El canary se
llama `PatternDataTable-mobile-projection`; declarar cerrado el cluster C1 sin drenar
`data-table-mobile.css` sería cerrar el archivo que NO da nombre al canary y dejar abierto
el que sí. Los dos comparten 12 nombres, así que el trabajo marginal es pequeño.

**Aviso al DT nº2 — el radio de explosión sobre la familia hermana es de UN canal.** De
los 53, sólo **`--ds-table-touch-target`** es leído también por `table.css` (el skin de la
primitiva `Table`): `table.css:686,690`. Los otros 52 no cruzan la frontera. El riesgo
que el prep temía (*"blast radius sobre Table"*) está acotado a un nombre, y su corrección
(41.25px → 44px) **mejora también a Table**. Los otros 11 nombres compartidos van a los
skins hermanos de la MISMA familia.

**Aviso al DT nº3 — el censo no ve el plano donde vive el daño de esta unidad.** Igual que
en Button (§4.1 de `r1-button-opus-grammar.md`), las fugas de marca de F5 viven en la
**línea base vertical** (`artifacts/bithire/index.css`), donde el literal ES el valor
declarado y por lo tanto no hay fallback que detectar. Con el detector actual el lote
reportaría "0 hardcodes retirados" mientras retira **cinco fugas vivas**. El detector
fijado en el repo debe cubrir ese plano o la reducción monotónica es incomprobable.

### 2.2 Clasificación de los 53

**Grupo A — DUPLICADOS DE UN CANAL GOBERNADO QUE YA EXISTE (4 nombres, 13 lecturas).
Se RETIRAN.**

| canal | literal | canal gobernado que lo sustituye | paridad de valor |
|---|---|---|---|
| `--ds-density-factor-compact` (`:157,184,202,206`) | `0.85` | **`--ds-density-local-factor`** (`foundation/base/density.css:38`) | **EXACTA por construcción** (ver §3.1) |
| `--ds-density-factor-spacious` (`:168,194,210,214`) | `1.15` | **`--ds-density-local-factor`** (`density.css:46`) | **EXACTA por construcción** |
| `--ds-table-touch-target` (`:2234,2235,2236`) | `2.75rem` = 41.25px | **`--ds-touch-target-min`** (`themes/default.css:928` = 44px) | **NO exacta: +2.75px.** El delta corrige un incumplimiento de piso; es decisión sighted con delta declarado, no mecánica |
| `--ds-motion-ease-standard` (`:1060,1080`) | `ease-in-out` | **`--ds-motion-ease-move`** (`transitions.css:127` = `cubic-bezier(0.2,0,0,1)`, autorado por tenant) | **NO exacta.** Decisión sighted; el resto del mismo archivo ya usa el canal gobernado (`:442-445`) |

**Grupo B — LA TABLA DE POSTURA DE PADDING (9 nombres). Se ADJUDICAN, no se retiran.**

`--ds-table-{action,leading,selection}-cell-padding-{comfortable,compact,spacious}`.
Son las nueve celdas de la tabla de postura que alimentan cuatro de las siete raíces
`--ds-modern-table-*`. Geometría legítima de anatomía: el valor ES el diseño de la
familia. **No hay raíz gobernada con estos nueve valores**, así que sustituir sería
inventar. Vía correcta: **atribución `governed-owner-table`** (la vía 3 de
`root-membership`, con 495 canales ya atribuidos así) hacia la raíz de `density.mode`,
declarando el owner-tier por lote. Disposición de manifest:
`APPLICABLE` con productor de tabla-de-dueño, no `INVARIANT`.

**Grupo C — DEFAULTS NEUTROS EXPRESADOS COMO CANAL (6 nombres). Se ADJUDICAN
`INVARIANT_WITH_REASON`.**

`--ds-table-action-shadow` (`none`), `--ds-table-minimal-shadow` (`none`),
`--ds-table-editorial-header-bg` (`transparent`), `--ds-table-sort-bg` (`transparent`),
`--ds-table-sort-border` (`transparent`), `--ds-table-editorial-header-transform`
(`uppercase`). El canal existe precisamente para que el tenant pueda pintar; el literal
es la ausencia deliberada. Razón escrita: *"neutral default; el canal es la puerta, el
literal es el estado apagado"*. **Prohibido declararlos en `:root` para "cerrar" el
censo** — eso convertiría una puerta abierta en un valor impuesto.

**Grupo D — GEOMETRÍA DE ANATOMÍA SIN RAÍZ CANDIDATA (24 nombres). Se ADJUDICAN con
owner-tier.**

`--ds-table-bulk-bar-padding`, `--ds-table-collapsed-min-inline-size` (34rem),
`--ds-table-drag-grip-offset`, `--ds-table-drag-grip-opacity` (0.58),
`--ds-table-drop-indicator-inset`, `--ds-table-editor-checkbox-size`,
`--ds-table-editor-input-line-height`, `--ds-table-editor-input-padding`,
`--ds-table-editorial-cell-padding-block`, `--ds-table-editorial-header-padding-block`,
`--ds-table-expanded-padding`, `--ds-table-header-content-gap`,
`--ds-table-min-inline-size` (42rem), `--ds-table-open-cell-padding-block`,
`--ds-table-pagination-padding`, `--ds-table-resize-bar-height` (58%),
`--ds-table-resize-bar-width`, `--ds-table-resize-hit-size`,
`--ds-table-sort-control-offset`, `--ds-table-sort-opacity` (0.68),
`--ds-table-state-copy-max-inline-size` (32rem), `--ds-table-touch-hit-expansion`,
`--ds-table-cell-line-height`, `--ds-table-editor-input-font-size`.

Ninguno tiene una raíz gobernada con el mismo valor (verificado nombre a nombre contra el
universo de 4.426 productores). **`--ds-table-cell-line-height` es el único de este grupo
que además es un DEFECTO DE CONTRATO** (F8) y no se cierra por adjudicación: hay que
partirlo en tres canales de postura o dejar de leerlo con tres fallbacks distintos.

**Grupo E — ÓRBITA DEL BLOQUEO T-1 (4 nombres). NO SE TOCAN en este lote.**

`--ds-table-control-size` (2rem), `--ds-table-control-size-compact` (1.75rem),
`--ds-table-control-size-spacious` (2.25rem), `--ds-table-sort-control-size` (1.375rem).
Son tamaño de control por postura. El bloqueo `control.size ↔ density.mode` está asentado
(`customization-model/index.json` `targetControlModel.activationBlocks`; `checkpoint/index.json:4`).
El nombre es local a la familia (`--ds-table-control-size-*`, no `--ds-control-size-*`),
así que **formalmente no está bloqueado** — pero tocarlos es precisamente prejuzgar qué
eje es dueño del tamaño de control. **Adjudicación explícita del DT requerida antes de
que el writer los mire** (§7).

**Grupo F — EL NAMESPACE FANTASMA `--ds-typography-*` (7 nombres en este archivo, 13 en
el corpus). Se ESCALA, no se cierra en la unidad.**

`--ds-typography-{body-family, label-family, label-tracking, section-title-family,
section-title-tracking, section-title-weight, supporting-family}` + los 6 adicionales de
`data-table-mobile.css`. Cerrarlos aquí implicaría declarar una voz tipográfica del DS
desde el skin de una tabla — exactamente el minteo prohibido
(`README.md:446`, *"No family writer mints public `--ds-*` channels"*). Es un hallazgo de
fundación con dueño `architecture-integrator` y consumidor probado. **Recomendación: no-write
en esta unidad, con razón escrita**, igual que `--ds-color-border` en el lote Button.

**Cuadre:** A(4) + B(9) + C(6) + D(24) + E(4) + F(7) = **54**, uno más que 53 porque
`--ds-table-editor-input-font-size` cae en D pero su fallback delega
(`var(--ds-font-size-sm, 0.875rem)`) y por eso está en la clase B laxa, no en la estricta.
Cuenta estricta: A(4) + B(9) + C(6) + D(23) + E(4) + F(7) = **53**. ✔

### 2.3 Plan de paridad de valor ANTES de cualquier sustitución

Ley que manda: *Mechanical-lane safety law* (`README.md:351-360`) — **prohibido declarar
nombres que hoy sólo existen dentro de fallbacks; toda sustitución exige paridad de valor
en los 3 verticales antes de tocarse; donde el literal ≠ el valor de la raíz candidata,
la corrección es decisión sighted del DT, no mecánica.**

Protocolo obligatorio, en este orden:

1. **Congelar el preimagen.** Antes de tocar una línea: capturar el valor computado de
   cada uno de los 53 canales y de las 7 raíces `--ds-modern-table-*`, en los **3**
   verticales (`bithire`, `evnto`, `rottay`) × light/dark × las 3 posturas de densidad ×
   las 5 recetas. Es una sonda de lectura, no un instrumento nuevo.
2. **Clasificar cada sustitución en EXACTA / DELTA.** Sólo el Grupo A es candidato, y
   dentro del A sólo `--ds-density-factor-*` es EXACTA. Las otras dos son DELTA y
   necesitan firma.
3. **Para las EXACTAS, probar la exactitud por construcción, no por muestreo.** Ver §3.1:
   la regla que lee el canal está condicionada por el mismo predicado de selector que lo
   declara, así que la igualdad se demuestra estáticamente y se confirma con una medición.
4. **Para las DELTA, registrar el delta en píxeles renderizados por vertical** y llevarlo
   a la puerta sighted. `--ds-table-touch-target`: +2.75px, corrige un piso. 
   `--ds-motion-ease-standard`: cambio de curva, no de geometría; medible sólo por
   cronometraje, no por captura estática — **recomiendo diferirlo a un lote de motion**
   antes que meter una decisión de curva en un lote de tabla.
5. **Nada se retira sin un consumidor probado del reemplazo.** Cada retirada lleva en el
   receipt: el nombre retirado, el nombre que lo sustituye, su declaración `archivo:línea`,
   y la medición antes/después en los dos grounds.
6. **Los receipts se emiten ÚLTIMOS.** Los manifests están en `sourceFiles`: cualquier
   edición de manifest deja rancios todos los receipts. Congelar el write-set primero.

---

## 3. La gramática de densidad de la tabla

### 3.1 Respuesta de contrato: ¿`density.mode` debe emitir `--ds-density-factor-*` como `declaredOutputs`?

**NO. La respuesta es que el control YA los emite, con otro nombre, y que los nombres del
skin son duplicados inventados.** No hace falta ampliar el contrato del control; hace
falta que el skin lea el canal que ya existe.

La tabla de factores canónica del DS está declarada y viva:

| canal | declaración | valores |
|---|---|---|
| `--ds-density-local-factor` | `foundation/base/density.css:38,42,46`, selector `[data-density='<mode>']:not(:root)` | **0.85 / 1 / 1.15** |
| `--ds-density-mode-factor` | `foundation/base/density.css:176,180`, selector `:root[data-density='<mode>']` | **0.85 / 1.15** |
| `--ds-density-global-effective-scale` | `density.css:64` | `clamp(0.5, scale × modeFactor, 3)` |
| `--ds-density-effective-scale` | `density.css:69` | `clamp(0.5, globalEffective × localFactor, 3)` |

Y el docblock de `density.css:1-25` fija la ley de reparto: el atributo raíz escribe el
canal SEMÁNTICO (`mode-factor`), los límites no-raíz escriben el multiplicador LOCAL, y
`--ds-density-effective-scale` compone ambos. `contracts/composition/tenants/capabilities/index.ts:336`
lo confirma como contrato: `derivedChannels: ['--ds-density-mode-factor', '--ds-density-scale']`.

**Prueba de que la sustitución es exacta por construcción.** La tabla estampa su propia
postura en su raíz (`presentation/table/index.tsx:358` →
`densityScopeAttributes(resolvedDensity)`), que es un límite **no-raíz**. Por lo tanto el
mismo elemento que matchea `[data-density='compact']:not(:root)` —y declara ahí
`--ds-density-local-factor: 0.85`— es el elemento que matchea la regla del skin
`[data-part="root"][data-density="compact"]`. **El predicado que lee el canal es el mismo
predicado que lo declara: la igualdad 0.85 = 0.85 no depende del tenant, la postura ni el
viewport.** Confirmado en vivo: estampando `data-density` en la raíz de la tabla,
`--ds-density-local-factor` resuelve `1 / 0.85 / 1.15` en BitHire y en TMM.

Corolario que el DT debe firmar: `--ds-density-local-factor` **no** compone la postura del
tenant (`mode-factor`), mientras `--ds-density-effective-scale` **sí**. Hoy el padding de
la tabla compone (va por la rampa `--ds-spacing-*` recalculada en el límite) y el tipo no
(usa el literal). Hay dos correcciones posibles y **no son la misma**:

- **(a) mecánica, delta cero:** `--ds-density-factor-compact` → `--ds-density-local-factor`.
  Retira 2 canales clase B, no mueve un píxel, y deja la incoherencia de F4 intacta.
- **(b) coherente, con delta:** la escalera de tipo pasa a componer como el padding.
  En BitHire compact: 0.9 × 1 × 0.85 = 0.765 en vez de 0.85 → el tipo bajaría más, lo que
  **empeora F2**. 

**Mi recomendación: (a) ahora, y F4 se resuelve por el otro lado** — que la densidad deje
de mover el tipo y pase a mover la altura de fila (D2 abajo). Así la sustitución mecánica
es delta cero, la ortogonalidad se arregla en su eje correcto, y F2 mejora en vez de
empeorar.

### 3.2 D1..D6 — la ley de densidad de esta familia

- **D1 — Un solo vocabulario de factor.** La familia lee `--ds-density-local-factor` /
  `--ds-density-effective-scale`. `--ds-density-factor-*` no vuelve a existir. Ningún
  skin declara su propia tabla de factores.
- **D2 — La densidad mueve la ALTURA DE FILA y el ritmo; el tipo lo mueve `typography.scale`.**
  Es la ley del programa (`orthogonality.requirements`), hoy invertida (F4). La fila
  resuelve `max(piso de la postura, contenido + padding)`; el paso de tipo por postura se
  retira o se acota a ±1 paso nombrado, nunca a un multiplicador libre.
- **D3 — Piso tipográfico absoluto e inviolable por postura.** Ninguna celda por debajo de
  **13px**; ninguna micro-etiqueta de cabecera por debajo de **11px**; en las tres
  posturas, en los tres verticales, a type-scale 1 y a type-scale 1.04. Hoy fallan las
  cuatro celdas de la tabla de F2.
- **D4 — Piso táctil único.** `--ds-touch-target-min` es la ÚNICA autoridad del piso de
  44px en la familia. `--ds-table-touch-target` se retira. La expansión de hit no
  sustituye al piso: lo complementa.
- **D5 — Un canal, un significado.** Un canal de postura no puede tener tres fallbacks
  distintos según el selector (F8). Si tres posturas necesitan tres valores, son tres
  canales o una derivación, nunca un canal con tres caras.
- **D6 — La receta manda sobre la anatomía, la densidad sobre el ritmo, y no se cruzan.**
  `minimal|ruled|grid|zebra|editorial` deciden filetes, ground y sombra;
  `compact|comfortable|spacious` deciden alto, padding y gap. Una receta no cambia
  densidad y una densidad no cambia filetes. Hoy se respeta: la receta se resuelve por
  `experience.profile` y la densidad por su propio atributo. **Es lo único de la
  personalización de esta familia que funciona bien y no debe tocarse.**

### 3.3 Cómo la tabla hereda la gramática de acción del lote Button (G1..G10)

La tabla **compone** Buttons por dentro; no los reimplementa. La herencia es literal:

| lugar de la tabla | qué hereda | consecuencia operativa |
|---|---|---|
| **acciones de fila** (`[data-part="actions-cell"]`, `actions-content`) | **G1** (rango × tono) y **G2** (cada rango legible sin matiz) | las acciones de fila son rango **quiet** con tono; la destructiva es `danger` + quiet (`data-tone`), NUNCA un `solid` rojo dentro de una fila. Si G1 cambia después de capturar la tabla, `checkpointPolicy.restartLaw` invalida las capturas de esta unidad |
| **bulk-bar** (`[data-part="bulk-bar"]`, `bulk-bar-action`) | **G1** + **G4** (una frontera dominante por región) | la bulk-bar es UNA región con UN marco; sus botones no traen marco propio. La acción primaria del lote es el único `solid` de la barra |
| **paginación** (`[data-part="pagination"]`) | **G3** (una sola escalera de control) | los controles de paginación resuelven el MISMO paso de control que Button en la misma densidad. Δ de canto ≤1px contra un Button hermano |
| **inline-edit actions** (`[data-part="inline-edit-actions"]`, `skin/data-table.css:215+`) | **G7** (un solo foco) + **G8** (un solo busy) | guardar/cancelar reservan su footprint de reposo; el estado `saving` no colapsa el ancho de la celda ni oculta la etiqueta |
| **toda la familia** | **G5** (la altura tiene piso) y **G6** (piso tipográfico) | son D3/D4 arriba. **Button y tabla deben corregir `2.75rem`→44px en el mismo sentido** (F7) |
| **toda la familia** | **G9** (ningún color fuera del alcance del tenant) | es exactamente F5: 5 fugas vivas |
| **proyección mobile** | **G10** (móvil es prioridad, no estiramiento) | la tarjeta recompone por prioridad de columna y divulgación; no es la fila estrechada. Hoy F6 |

**Consecuencia de secuencia, no de forma:** el lote Button está en escritura AHORA y toca
`skin/button.css` + `presentation/components/button.css`. La tabla renderiza Buttons.
**Ninguna captura de aceptación de la unidad 2 puede tomarse antes de que el lote Button
cierre e integre**, o nace rancia por `restartLaw`. Preparar la escena sí se puede en
paralelo; capturar no.

---

## 4. La escena que falta

Hoy: **una** escena, `r2-behavior?only=celleditorerror`, 1 fila × 2 columnas, EN
solamente, en los dos grounds. Ejercita 4 de 88 partes y 0 de 24 estados (F12).

### 4.1 Dónde debe vivir

**Escena propia nueva, `sections/collection/`**, hermana de `control` y vecina de
`display-collections` (que es la escena de la primitiva `Table`, no del patrón:
`sections/display-collections/index.tsx:25` importa `Table`, no `PatternDataTable`).
Razones:

- Los cuatro nombres de cohorte 2 son `Card`, `ListToolbar-SavedViews`,
  `PatternDataTable` y `CollectionHeader-PageShell`. `collection` es el techo natural de
  los cuatro y evita que la unidad 2 escriba dentro de `r2-behavior`, que es una escena de
  comportamiento con otro dueño.
- **Sólo engine modern en el frame.** Nada de bandas classic/rustic (lección de la
  captura `dashboard` de F4C: 9.983px de alto y bandas fantasma).
- Fail-closed con `?only=` válido o 404, patrón de `bithire/r4-structures/page.tsx`.
- `data-testid` de readiness propio por viñeta, independiente de los nombres de clase
  internos (patrón declarado en `display-collections/index.tsx:18-23`).
- **Sin importar el torture harness** (ley del ground, `ground/index.tsx:17-20`); el
  contenido largo sale de `TORTURE_CONTENT` (`chrome/index.tsx:108-112`), que sí es del
  lab.

### 4.2 Las viñetas que la escena debe tener

| `?only=` | qué monta | qué prueba |
|---|---|---|
| `recipes` | la MISMA data (8 filas, 6 columnas) × las 5 recetas `minimal/ruled/grid/zebra/editorial`, apiladas | D6; que la receta cambie anatomía y NADA más |
| `density` | la misma data × `compact/comfortable/spacious`, con reglas de medición visibles | D2, D3, F4: que la altura de fila se mueva y el tipo no caiga bajo el piso |
| `states` | loading (skeleton), empty, error, sin-resultados-de-filtro, saving, invalid | 6 de los 24 estados; hoy 0 |
| `selection` | selección parcial + total + **bulk-bar activa** con 3 acciones (una destructiva quiet) | herencia G1/G4; el único `solid` de la barra |
| `columns` | resize en curso, reorder con `drop-indicator`, columna pinneada izquierda + scroll horizontal | F7 (pisos táctiles de `drag-grip`/`pin-toggle`), sin overlap |
| `sorting` | cabecera ordenable en `asc`/`desc`/neutro, con foco real | F3 (alineación) y el trío `sort-bg/border/color` |
| `editing` | inline-edit abierto: texto, select, checkbox, y el error de validación (reusa el caso vivo de `r2-behavior`) | G8 en celda; `editor-*` (5 canales del grupo D) |
| `content` | contenido largo, ES, AR y token irrompible **en celda**, con el camino de reveal accesible (precedente `cellreveal`, `r2-behavior:1463-1475`) | `criticalPerCharacterWrap: 0`, truncado con disclosure |
| `mobile` | **la proyección de tarjetas**, con estrategia de título explícita, etiqueta presente, acción de fila y selección | el nombre del canary; F6 |
| `grouping` | 2 grupos colapsables con agregados | `group-header-*` (4 canales del grupo D) |
| `keyboard` | orden de tab, operación por teclado de orden/selección/edición, foco visible | teclado sin evidencia hoy |
| `negative` | la tabla con TODOS los diales en su valor por defecto, junto a un bloque HOLD | control negativo por escena |

### 4.3 Ejes de la matriz

- **Anchos:** 320 / 390 / 768 / 1440 (mandato del owner + piso de `stressMatrix`), más
  contenedores estrechos **280 / 480** para el caso "tabla dentro de un rail". El harness
  vivo captura hoy 390/768/**1280** (`f4c-canary-capture.mjs:151`) → **320 y 1440 no
  tienen productor**; es un cambio de datos en una constante, no un instrumento nuevo.
- **Grounds:** `bithire` (static BrandTheme) y `the-management` (DB compilado por request),
  con digest del artifact registrado por fila.
- **Locales:** EN en ambos; ES y AR existen sólo como segmentos del ground estático
  (`bithire-es/`, `bithire-ar/`) y **no existen para el ground DB**. Decisión que el DT
  debe firmar: o se crean `the-management-es|ar`, o el eje locale se certifica sólo sobre
  static con razón escrita. **Recomiendo la segunda** para esta unidad: AR sobre static ya
  prueba el RTL de la tabla (dirección de columnas, `inset-inline`, alineación end), y
  crear dos segmentos de ground DB es trabajo de lab que no cabe en el 20% instrumental.
- **Puntero grueso** (`hasTouch: true`) en al menos una fila de la matriz: el piso de 44px
  no se ha probado nunca en esta familia.

### 4.4 Nodos MOVE / HOLD por escena (para la prueba de cascada)

Disciplina por ELEMENTO, la que ya usa el harness F4C: delta en una propiedad **pintada**
del portador + **cero** delta en el conjunto HOLD + ancla de estructura. Evita el falso
verde "el canal cambió".

| dial | MOVE (debe moverse, con la propiedad exacta) | HOLD (no debe moverse) |
|---|---|---|
| `shape.radius-scale` | `[data-part="card"]`.borderRadius; `mobile-card`.borderRadius; `sort-control`.borderRadius | altura de fila, font-size de celda y cabecera, todo color |
| `density.mode` | `body-row`.height; `data-cell`.padding; `header-row`.height; gap de `header-content` | todo color, `borderRadius`, familia tipográfica, **y (tras D2) el font-size de celda** |
| `palette.seeds` | `header-row`.backgroundColor; `header-cell`.color; borde del `card`; `row[data-selected]`.backgroundColor; `drop-indicator`.borderColor | geometría completa, tipografía, motion, y el tono `danger` de la acción destructiva |
| `typography.scale` | `data-cell`.fontSize; `header-cell`.fontSize; `mobile-card-title`.fontSize | altura de fila (debe crecer por contenido, no por escala directa), color, radio |
| `surfaces.effect-intensity` | sombra del `card`; keylines de la receta `editorial`; sheen del skeleton | **geometría y tipografía clavadas** |
| `experience.profile` | `data-recipe` resuelto; `data-density` resuelto; `data-anatomy-table` | color de marca, tipografía |

---

## 5. Write-set propuesto

**Aviso de propiedad de dominio (bloqueante, igual que en Button).** El skin de esta
familia vive bajo `packages/core/src/foundation/tokens/**`, que `rounds/index.json` R1 asigna al
dominio `shared-recipes-tokens-styles` → **architecture-integrator**, no al
`family-writer`. El lote es multi-lane por construcción y el DT debe asignar los cinco
dominios explícitamente o repite el bloqueo de la Cohorte 1.

| # | archivo | qué cambia | dominio `rounds/index.json` → lane | ley que sirve |
|---|---|---|---|---|
| 1 | `runtime/engines/modern/skin/data-table.css` (`:157,168,184,194,202,206,210,214`) | `--ds-density-factor-{compact,spacious}` → `--ds-density-local-factor`. **Delta cero, exacto por construcción** (§3.1) | `shared-recipes-tokens-styles` → architecture-integrator | D1; retira 2 clase B |
| 2 | `presentation/components/skin/data-table-mobile.css` (`:103,…`) | idem + `--ds-density-factor-comfortable` (`1` → el mismo canal) | idem | D1; retira 3 clase B |
| 3 | `skin/data-table.css` (`:448-467` + regla nueva) | **La cabecera hereda la alineación de su columna.** El default deja de ser el `center` del user agent | idem | F3; `bindingCraftLaws[6]` |
| 4 | `skin/data-table.css` (`:2234-2236`) | `--ds-table-touch-target` retirado; el piso pasa a `var(--ds-touch-target-min, 44px)`, el canal ya gobernado. **Delta +2.75px declarado** | idem | D4, `coarsePointerTargetPx: 44`; retira 1 clase B (y mejora `table.css:686,690`) |
| 5 | `skin/data-table.css` (`:155-195`) | **La escalera de densidad deja de multiplicar `font-size` y pasa a mover el alto de fila** (`min-block-size` por postura). El paso de tipo por postura se retira | idem | D2, `orthogonality`; corrige F4 **y** alivia F2 |
| 6 | `skin/data-table.css` (`:161,170,746`) | `--ds-table-cell-line-height` deja de leerse con tres fallbacks distintos: tres canales de postura o una derivación | idem | D5; corrige F8 |
| 7 | `skin/data-table.css` (`:180-192`) | El piso escrito `0.6875rem` sube al piso del contrato (11px reales con raíz rem 15px) | idem | D3, `microLabelTextMinimumPx: 11` |
| 8 | `ts/presentation/brand-themes/bithire/index.ts` + regeneración de `css/facade/artifacts/bithire/index.css` (`:991,994,995,996,1005,504`) | **Las cinco fugas de F5**: `--ds-table-header-bg`, `--ds-table-header-font-size`, `--ds-table-radius` (retirar la anti-puerta), el arm claro de `--ds-gradient-surface` (espejar la derivación que el arm oscuro de `:1441` ya tiene). **El artifact NO se edita a mano: se regenera desde el `.ts`** | idem | F1, F2, F5; G9; `README.md:447` |
| 9 | `infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts` (`:2392`) | El compilador deja de emitir `--ds-table-radius` con la forma `authored / ownScale * var(--ds-radius-scale)` cuando `chrome.table.radius` está ausente, para que el fallback gobernado `var(--ds-radius-lg)` del skin gane | **no cubierto por ningún glob de `writeDomains.required`** → **el DT debe asignarlo explícitamente** | F1 |
| 10 | `ui/patterns/data/data-table/engines/modern/index.tsx` (`:37-51`) | Los 14 iconos migran del catálogo de compatibilidad al facade semántico (`@rottay/design-system/icons`, `Icon name="…"`) | `family-source` → **family-writer** (única casilla del lote que es suya) | F10; `iconGovernanceContract.forbidden[0]`, `canonicalFacade` |
| 11 | `ui/patterns/data/data-table/presentation/table/mobile-cards/index.tsx` | Estrategia de título explícita (columna designada, nunca "la primera"), etiqueta presente en el título, y anatomía simétrica | `family-source` → family-writer | F6; `bindingCraftLaws[12]` |
| 12 | `ui/patterns/data/data-table/tests/**` | Aserciones nuevas: alineación por defecto, piso de tipo por postura, piso táctil, alto de fila por densidad, título de tarjeta | `observable-tests` → **quality-integrator** | puertas mecánicas |
| 13 | `packages/showroom/src/app/probe/ds-reference/sections/collection/**` + rutas `?only=` en los dos grounds | La escena de §4 | `reference-lab` → **lab-writer** | `scope.referenceLabLaw` |
| 14 | `packages/showroom/scripts/f4c-canary-capture.mjs` (`:151` y la matriz de escenas) | Anchos `320/390/768/1440` + entrada para `collection` con sus testids y sus nodos MOVE/HOLD. **Cambio de datos, no instrumento nuevo** | **`quality-tooling` está declarado no-write** (`writeDomains.optional`) pero el archivo vive en `packages/showroom/scripts/`, fuera de ese glob → **el DT debe declarar su dueño** | §4.4 |
| 15 | `manifest/families/pattern/data/pattern-data-table.json` | Sacar de `UNKNOWN` **sólo** las celdas con evidencia; cerrar `statesMotion` (F13) | `manifests` (glob actual **no incluye** `packages/core/manifest/families/**`) → **el DT debe extender o asignar** | `README.md:140-145` |
| 16 | `packages/core/artifacts/quality/programs/modern-rescue/checkpoints/reference-grammar/button-action-cluster/2026-08-05/**` | Receipts de checkpoint, **emitidos LOS ÚLTIMOS** | `round-evidence` → quality-integrator | `evidence-contract/index.json` |

**Tres huecos de dominio que el registro no cubre y que el DT tiene que cerrar antes del
arranque** (ítems 9, 14 y 15). El propio `writeDomains.law` dice que dejar un dominio
implícito *"es el defecto que este registro existe para prevenir"*.

**Presupuesto 80/20 del write-set propuesto:** ítems 1-11 (source: skins, engine,
presentación, línea base vertical, compilador) = **11 de 16**; ítems 12-16 (tests, lab,
harness, manifests, receipts) = 5. El lab (ítem 13) es voluminoso en líneas y hay que
vigilarlo: **si la escena se come el diff, el lote incumple el 80/20 y hay que partirlo**
(escena primero como lote de lab, source después).

---

## 6. Cascada a demostrar y criterio GO/NO-GO

### 6.1 Los seis controles y su estado medido HOY

| # | control | estado medido hoy sobre esta unidad | tras el write-set |
|---|---|---|---|
| 1 | `shape.radius-scale` | **INERTE**: 10px = 10px pese a `1.25` vs `0.8` y a un tenant que autora cuadrado por escrito (F1) | eje vivo: 14px vs 1px |
| 2 | `palette.seeds` | **INERTE en 4 portadores** (header-bg, header-ink, filete, borde del marco) (F5) | 4 portadores vivos |
| 3 | `density.mode` | **PARCIAL e INVERTIDO**: mueve tipo, no mueve alto en BitHire (F4) | mueve alto y ritmo; el tipo queda HOLD |
| 4 | `typography.scale` | **VIVO** (15px vs 15.6px de raíz; celda 12.19 vs 13.18 a igual postura) | se conserva; se le añade el piso D3 |
| 5 | `surfaces.effect-intensity` | **VIVO** (sombra `none` vs regla dura con offset) | se conserva; es el eje más rico en negativos |
| 6 | `experience.profile` | **VIVO** (`minimal`+`comfortable` vs `ruled`+`compact`, `data-anatomy-table: open`) | se conserva intacto |

**Cómo se prueba, sin inventar instrumento:** extender la matriz de
`f4c-canary-capture.mjs` con la entrada `collection` (testids obligatorios, testid de
fallback ausente, nodos MOVE/HOLD de §4.4) y correr el protocolo que ya existe:
`--phase A|B|…`, `--compare`, `--check`, `--drill`, con restore byte-exacto. Prerrequisitos
de determinismo ya escritos: `reducedMotion`, `fonts.ready` + doble rAF, viewport fijo,
identidad del servidor registrada, y **servidor estable** (el oráculo de CSS del ground
estático se mueve con HMR en dev).

### 6.2 Puertas mecánicas (todas verdes, o la diferencia explicada por escrito)

1. `pnpm --filter @rottay/design-system structure:check` limpio.
2. `node packages/core/scripts/engine/cascade-wiring-ratchet/index.mjs` ≤ el valor previo
   al lote. **Nunca sube.**
3. `node packages/core/scripts/engine/token-audit/index.mjs --check` verde, y
   `fleet.inlinePaint` de esta familia **no sube** (hoy: 0 lecturas `var(--ds-` inline y
   8 `style={{` geométricos; debe quedar igual o menos).
4. `node packages/core/scripts/tokens/root-membership/index.mjs --check` verde **después
   de un build real** (hoy se niega fail-closed por `dist/` rancio; esa negativa es
   frescura, no drift).
5. `program-check.mjs` + `program-check.test.mjs` sin rojos NUEVOS sobre la línea base
   conocida. Verificar de paso que `producers.json` no arrastra el residuo
   `evidence.path=["tampered"]`.
6. Suites de `data-table/tests/**` verdes; las suites de la primitiva `Table` verdes
   (única frontera compartida: `--ds-table-touch-target`, ítem 4 del write-set).
7. **Censo de hardcodes brandables estrictamente menor** que al inicio del lote, con el
   detector fijado en el repo y **cubriendo el plano de la línea base vertical** (§2.1).
   Cifras verificables por el DT: −5 clase B por los ítems 1/2/4, −5 fugas vivas por el
   ítem 8, y los 44 restantes adjudicados por escrito con su disposición.
8. Los generados se regeneran por generador, jamás a mano (`artifacts/bithire/index.css`
   sale del `.ts`).

### 6.3 Puertas sighted (DT)

9. **Cero vetos duros** de los 24 sobre las capturas nuevas. Los cinco que hoy muerden
   —`tiny-or-optically-unbalanced-control-typography`,
   `unjustified-dead-space-or-empty-track`,
   `functional-unicode-emoji-inline-svg-or-legacy-catalog-bypasses-semantic-facade`,
   `gradient-shadow-or-saturation-used-as-premium-shortcut`,
   `desktop-composition-compressed-into-mobile`— cerrados y fotografiados.
10. **Todos los pisos mecánicos a 320/390/768/1440 en los dos grounds:** ninguna celda
    <13px, ninguna cabecera <11px, 44px reales en puntero grueso, exactamente 1 frontera
    dominante por región, ≤1 tratamiento de borde enfatizado por control, `overlap = 0`,
    `criticalPerCharacterWrap = 0`.
11. **La matriz de §4.2 capturada**, con `focus-visible` probado por aserción de atributo
    antes del obturador, no por parecido visual.
12. **Cascada:** los 6 controles de §6.1 con portadores MOVE y negativos HOLD, por las
    DOS puertas, con restore byte-exacto. Mínimo exigible: los 3 hoy inertes o parciales
    (`shape`, `palette.seeds`, `density.mode`) arreglados o adjudicados por escrito.
13. **Divergencia ≥8 ejes con ≥6 no-cromáticos.** Hoy 7/5 (§1.3). Cerrar F1+F5 lleva a
    13/9 sin inventar nada.
14. **Presupuesto 80/20** verificable en el diff.
15. Celdas del manifest fuera de `UNKNOWN` **sólo donde hay evidencia**; receipts al final.
16. Auditoría independiente Fable 5 al cierre + GO sighted del DT asentado.

### 6.4 Disparadores NO-GO inmediatos

- Una captura presentada que no se reproduzca en vivo (precedente
  `control-bithire-390.png` del lote Button).
- Un canal `--ds-*` público nuevo, o un socket `--_ds-*` sin registro completo
  (`owner`, `producer`, `fallbackAuthority`, `productiveConsumerFamilyIds`,
  `promotionCriteria`, `retirementCriteria`).
- **Declarar cualquiera de los 53 en `:root` para "cerrar" el censo.** La corrección es
  atribuir o que el dueño emita, nunca declarar en la raíz (`README.md:446`,
  `hardcode-census-top5.md:§4.4`).
- Cualquier condicional por tenant en TSX o CSS.
- Ratchet o contadores de pintura inline al alza.
- Cualquier diff en `engines/classic` o `engines/rustic` o en sus skins.
- Capturas de aceptación tomadas **antes** de que el lote Button cierre e integre
  (`restartLaw`).
- Tocar `--ds-color-border`, `--ds-color-text-page` o el namespace `--ds-typography-*`
  dentro de este lote sin la adjudicación de fundación (§7).

---

## 7. Riesgos

### 7.1 Lo que puede romper

- **La sustitución de densidad (ítems 1-2) es delta cero SÓLO mientras la tabla estampe su
  postura en su propia raíz.** Si alguien hace que la tabla herede `data-density` del
  documento en vez de estamparlo, `--ds-density-local-factor` deja de declararse en ese
  elemento y el fallback literal vuelve a ganar. **La prueba de exactitud depende del
  estampado** (`presentation/table/index.tsx:358`): hay que fijarla con un test, no con un
  comentario.
- **El ítem 5 (densidad mueve el alto, no el tipo) cambia píxeles en las 3 posturas × 3
  verticales × 5 recetas.** Es el cambio de mayor superficie del lote y el que más
  capturas invalida. Debe ir en su propio commit dentro del lote, con antes/después.
- **El ítem 8 regenera `artifacts/bithire/index.css`**, que es el artifact que pinta LOS
  DOS grounds del lab. Cualquier error ahí se ve en las 26 escenas, no en una.
  `--ds-gradient-surface` (`:504`) lo lee toda la familia Card, no sólo la tabla.
  **Aviso de paridad medido:** el arm oscuro deriva de
  `var(--ds-surface-{card,panel,canvas})`, pero los valores claros de BitHire son
  `#FFFFFF / #f4f8fd / #f8fbff` mientras el literal es `#FFFFFF / #F7FAFC / #F5F2EC`.
  **Espejar el arm oscuro NO es byte-exacto**: mueve las dos paradas intermedias. Es
  decisión sighted con delta declarado, no una sustitución mecánica. Lo verifiqué
  esperando lo contrario y me equivoqué; lo registro para que nadie lo dé por mecánico.
- **El ítem 9 toca el compilador**, cuyo blast radius son los 6 canales con la misma forma
  de anti-puerta (`button-lg`, `compact-card`, `input-lg`, `table`, `tabs-list`,
  `textarea`) y todos los tests de digest canónico
  (`compilers/composition/tenant-theme/tests/canonical-digest-identity.test.ts:666`).
  **Recomiendo acotarlo a `--ds-table-radius`** y levantar los otros 5 como hallazgo con
  dueño, en vez de arreglar el patrón entero dentro de un lote de tabla.
- **`ListToolbar-SavedViews` es hermano de cohorte y comparte vocabulario `--ds-toolbar-*`**
  con el toolbar de la tabla (cluster C5 del censo). Si los dos lotes corren en paralelo,
  colisión de write-set en `list-toolbar.css` / `table-toolbar.css`.
- **`Card-SemanticSurface` es hermano de cohorte y es el dueño real de la tinta de la
  tarjeta mobile** (traza: el corte de herencia ocurre en `.rottay-card-body`, no en un
  nodo de la tabla). Arreglarlo desde la tabla sería pisar a otra unidad.

### 7.2 Lo que NO debe tocarse en este lote

1. **`--ds-color-border` (`#d4e0ea`) y `--ds-color-text-page` (`#53697E`).** El lote
   Button los difirió *"a la unidad 2 o 3"* con dueño asignado. Mi recomendación es
   **NO absorberlos aquí**: son canales de fundación con radio de explosión sobre todo el
   sistema, y cambiarlos dentro de un lote de tabla convierte una calibración en un
   repintado global. La unidad 2 aporta la evidencia que faltaba (son la tinta de la
   cabecera y el borde del marco, medidos idénticos en los dos tenants) y la entrega
   como **lote de fundación propio, dueño `architecture-integrator`**, con no-write
   escrito aquí.
2. **El namespace `--ds-typography-*`** (13 nombres sin productor en el corpus). Mismo
   tratamiento: hallazgo de fundación, no cola de esta unidad.
3. **`--ds-table-control-size*` y `--ds-table-sort-control-size`** hasta que el DT firme
   (§7.3-iii).
4. **`classic` y `rustic` son read-only** (`README.md:443`). No se tocan
   `engines/{classic,rustic}/index.tsx` ni `rustic/skin/{data-table,table}.css`.
5. **La primitiva `Table`.** Es familia propia; la única frontera es
   `--ds-table-touch-target` y se cruza con nota escrita.
6. **`experience.profile` / `recipeProfile` / `data-anatomy-table`.** Es lo único de la
   personalización de esta familia que funciona; se conserva sin rediseñar.
7. **Ningún artefacto generado, baseline o receipt se edita a mano** (`README.md:447`).
8. **`docs/reauditoria-cloud/` jamás entra al staging**; `roadmap/**` no se edita;
   `packages/core/scripts/**` es no-write (el round es juzgado POR esa herramienta).
9. **Fuera de `probe/ds-reference` no se escribe nada del showroom**; el ground no importa
   el torture harness.
10. **Dark mode no recibe trabajo dedicado** y ningún baseline se degrada. Ojo: el arm
    oscuro de BitHire declara `--ds-table-header-font-size: 0.75rem` (`:1658`) frente al
    `0.6875rem` del claro (`:996`) — el ítem 7 debe dejar el oscuro igual o mejor, nunca
    peor.
11. **Los archivos del lote Button en escritura ahora mismo.** Al cierre de este scout el
    lote Button había crecido de 5 a 11 archivos e incluye **dos que la casilla 8 de §5
    también toca**: `css/facade/artifacts/bithire/index.css` y
    `ts/presentation/brand-themes/bithire/index.ts`. Verifiqué el diff: la colisión es de
    ARCHIVO, no de línea — el lote Button sólo añade canales `--ds-button-*` /
    `--ds-input-*` derivados de `--ds-color-border-secondary`, y no toca ni un canal
    `--ds-table-*`, ni `--ds-gradient-surface`, ni `--ds-color-border`, ni
    `--ds-color-text-page`. **Consecuencia operativa: la unidad 2 arranca desde el árbol
    POSTERIOR al cierre de Button, nunca en paralelo sobre esos dos archivos.**
12. **Nada se propaga a los otros canaries antes del GO explícito del DT**
    (`checkpointPolicy.calibrationLaw`).

### 7.3 Adjudicaciones que el DT debe firmar antes de que el writer escriba

Cinco, acotadas, cada una con mi recomendación para que ninguna bloquee el arranque:

- **(i) La ortogonalidad de la densidad (F4).** ¿La densidad deja de mover el `font-size`
  de celda y pasa a mover el alto de fila? **Recomiendo SÍ.** Es la ley escrita del
  programa (`orthogonality.requirements`), arregla la inconsistencia entre tenants, y es
  la única corrección que alivia F2 en vez de empeorarlo. Es también el cambio de mayor
  superficie del lote: si el DT lo difiere, el ítem 1 sigue siendo válido (delta cero) y
  la unidad cierra el censo pero NO cierra la ortogonalidad.

- **(ii) La anti-puerta del radio (F1).** ¿Se corrige dentro del lote —retirando la
  emisión por defecto de `--ds-table-radius` para que el fallback gobernado
  `var(--ds-radius-lg)` gane— o se adjudica con razón escrita? **Recomiendo corregirlo
  aquí, acotado a `--ds-table-radius`.** Es el eje no-cromático más fuerte del round, el
  tenant lo pidió por escrito, y hoy el control está estructuralmente cancelado. Delta
  declarado: BitHire 10px → 14px, TMM 10px → 1px. Los otros 5 canales con la misma forma
  se levantan como hallazgo con dueño, no se tocan.

- **(iii) `--ds-table-control-size*` (grupo E).** El bloqueo `control.size ↔ density.mode`
  está asentado sobre `--ds-control-size-*`; estos nombres son locales a la familia y
  formalmente no están bloqueados. **Recomiendo declararlos no-write en este lote con
  razón escrita**: tocarlos es prejuzgar la adjudicación T-1 con un caso particular, y la
  unidad cierra su censo sin ellos (4 de 53, adjudicados como `UNKNOWN_BLOCKED_BY_T1`).

- **(iv) Los tres huecos de `writeDomains`** (ítems 9, 14 y 15 de §5:
  `infrastructure/compilers/**`, `packages/showroom/scripts/**`,
  `packages/core/manifest/families/**`). Ninguno cae bajo un glob del registro y el
  propio `writeDomains.law` dice que la omisión es el defecto que el registro existe para
  prevenir. **El DT los asigna o los declara no-write con razón; no hay tercera opción.**

- **(v) El eje locale sobre el ground DB.** ¿Se crean `the-management-es|ar` o el eje se
  certifica sólo sobre static? **Recomiendo lo segundo, con razón escrita**: AR sobre
  `bithire-ar` ya prueba el RTL de columnas, `inset-inline` y alineación `end` de la
  tabla, y crear dos segmentos de ground DB es trabajo de lab que no cabe en el 20%
  instrumental.

---

## Veredicto

**GRAMMAR READY.**

La dirección está cerrada y es ejecutable: seis leyes de densidad (D1..D6) con la
herencia explícita de G1..G10 del lote Button, trece hallazgos medidos en las dos puertas,
los 53 candidatos clase B clasificados uno por uno en seis grupos con su destino y su
prueba de paridad, cinco fugas de marca vivas identificadas con su autor `archivo:línea` y
su efecto medido, una escena de doce viñetas con sus nodos MOVE/HOLD, dieciséis casillas
de write-set con su dominio de `rounds/index.json`, y dieciséis puertas de aceptación. Nada de
esto depende de una decisión que no esté tomada o recomendada aquí.

Tres avisos que el DT debe leer antes de lanzar, y que no bloquean la escritura:

1. **El hallazgo de la unidad no es estético, es de motor.** Seis ejes de divergencia
   están anulados y uno de ellos —el radio— cancela un control público con una fórmula que
   se multiplica por su propio divisor, sobre un tenant que pidió esquinas cuadradas por
   escrito en su documento. Presentar capturas más bonitas sin cerrar eso sería otro
   NOT_ACCEPTED, con razón.
2. **El lote es multi-lane por construcción y tiene tres dominios huérfanos.** Si se
   lanza como un solo writer repite el bloqueo de la Cohorte 1.
3. **La secuencia con Button es dura, no blanda.** La tabla compone Buttons; preparar la
   escena en paralelo es correcto, capturar para aceptación antes del cierre de Button no
   lo es.

---

## Apéndice — comandos de reproducción

```bash
cd /Users/daniel/Developer/Rottay/ui-design-system
git rev-parse --short=9 HEAD          # a90af6ebb

# Detector de clase B (universo de productores = 4426 nombres)
node /tmp/opus-r1u2/classb.mjs packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/data-table.css
node /tmp/opus-r1u2/refine.mjs        # 53 literal puro / 36 delegantes

# Productores de un canal (declaraciones y lecturas, DS + showroom)
node /tmp/opus-r1u2/who.mjs --ds-density-local-factor --ds-touch-target-min --ds-table-radius

# Medición viva (requiere el dev server que YA estaba en :7001)
node /tmp/opus-r1u2/probe1.mjs        # canales + anatomía + escalera de densidad
node /tmp/opus-r1u2/probe2.mjs        # 390/768/1440 + capturas en /tmp/opus-r1u2/
node /tmp/opus-r1u2/probe3.mjs        # divergencia BitHire vs TMM, propiedad a propiedad
node /tmp/opus-r1u2/probe4.mjs        # inventario de elementos pintados + alineación
node /tmp/opus-r1u2/probe5.mjs        # tarjeta mobile real
node /tmp/opus-r1u2/trace.mjs         # cadena de herencia de tinta
node /tmp/opus-r1u2/typo.mjs          # 16 leídos / 5 declarados / 13 sin productor

# Contadores de la familia
grep -c 'style={{' packages/core/src/ui/patterns/data/data-table/engines/modern/index.tsx   # 8
```

Nota de entorno: el `grep` interactivo de esta shell está envuelto con `ugrep` y trata un
patrón que empieza por `--ds-` como opción. Toda reproducción por grep debe usar
`find … | xargs grep`, la herramienta Grep, o los scripts Node de arriba.

Citas `archivo:línea` verificadas una a una contra HEAD `a90af6ebb` el 2026-08-30. Las 4
capturas de §1 fueron leídas como imagen, no inferidas de nombres de archivo. Todo valor
computado de §1 proviene de una medición en Chromium contra el servidor vivo, no de
lectura estática del CSS.
