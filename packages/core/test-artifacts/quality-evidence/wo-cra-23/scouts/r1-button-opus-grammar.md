# OPUS — DIRECCIÓN DE GRAMÁTICA DEL LOTE BUTTON (R1 unidad 1, WO-CRA-23)

> **ERRATUM del DT (2026-08-30, post-auditoría Fable de restos):** la cita de
> la ley "prove three-second tenant recognition…" (§1.2 [F1]) quedó retirada por
> la enmienda del owner y su cierre de restos (`rounds.json` ya no la contiene;
> ver `scouts/r1-amendment-residuals-fable.md` D2). La SUSTANCIA del hallazgo F1
> (link indistinguible de ghost en reposo en el fixture monocromo) se sostiene
> por las otras leyes citadas (L1/L2/V5 + la taxonomía hue-alone) y no depende de
> esa cita. — Kimi K3 (DT)

- **Fecha:** 2026-08-30
- **HEAD:** `58e5cd5b0` (`docs(modern-rescue): enmienda de dirección R1 (owner 2026-08-30) …`)
- **Árbol:** 5 tracked modificados ajenos (`program-check.mjs`, `program.json`, `rounds.json`,
  `tenant-art-direction.json`, `scouts/r1-craft-prep.md` — la enmienda en curso) + untracked
  ajenos (`docs/reauditoria-cloud/`, `scouts/hardcode-census-top5.md`). Leí `rounds.json` del
  ÁRBOL DE TRABAJO, es decir la versión post-enmienda.
- **Regla cumplida:** cero escritura sobre el repo salvo este archivo. Sin builds, sin levantar
  servidores. Los scripts de medición viven en `/tmp/opus-r1-probe*.mjs` (fuera del repo) y sólo
  LEEN del dev server que ya estaba en :7001.
- **Alcance:** unidad 1 = `primitive/inputs/button` + `primitive/navigation/segmented`, con los
  compounds `Button.Group` / `Button.Icon`. Nada fuera de esas dos familias, sus skins y su
  escena `control` del lab.

## 0. Método (y por qué no me quedé en las capturas)

Miré las seis PNG de `/tmp/r1-button-captures/` con lectura de imagen real. Después medí el
DOM vivo en :7001 con Chromium (`@playwright/test` resuelto desde `packages/showroom`), porque
una dirección de gramática que no se apoya en valores computados es opinión. Cuatro sondas
read-only:

| sonda | qué midió |
|---|---|
| `/tmp/opus-r1-diag.mjs` | alturas y conteo de hijos de las 7 bandas de la escena, en `bithire@390`, `the-management@390`, `bithire@768` |
| `/tmp/opus-r1-probe2.mjs` | los 25 botones y 4 segmented de la escena: alto, ancho, font, line-height, gap, radio, border-width, bg/color/border computados, sombra, peso, tracking, familia — en ambos grounds a 1440 |
| `/tmp/opus-r1-probe3.mjs` | CSSOM: qué hoja y qué regla declara cada canal bajo el ground DB |
| `/tmp/opus-r1-probe4/6/7.mjs` | canales de fundación y de estado en ambos grounds; raíz rem; geometría del `Button.Group` conectado |

**Corrección de evidencia, primero que nada.** `control-bithire-390.png` muestra DOS bandas en
blanco: `SEGMENTED — 2 / 3 / 5 OPTIONS` y todo el viñeta `COMPOSITION — ACTION BAR` (título,
subtítulo y los tres botones incluidos). **No es un defecto del producto.** Medido hoy en vivo
en la misma ruta y el mismo ancho: las 7 bandas renderizan, los 4 Segmented existen con
`display:flex`, `visibility:visible`, `opacity:1` y alturas 40px, y el viñeta mide 205px de alto
con sus 3 hijos. Descarté además, estáticamente, las tres hipótesis baratas: no hay error
boundary en `chrome/index.tsx` que pueda tragarse un subárbol; el `runtime/reveal` de Segmented
sólo escribe el eje inline de scroll; y `artifacts/bithire/index.css` no tiene ni una `@media`
ni un `display:none` aplicable. **Conclusión: ese PNG es un artefacto del instrumento de
captura, no del DS. No debe presentarse como evidencia ni aceptarse una corrida cuyo PNG no se
reproduzca en vivo.** Ese es, además, el primer criterio NO-GO de §7.

---

## 1. Veredicto visual del estado actual

**Veredicto: NO ACEPTABLE como calibración R1.** El grupo tiene una base técnica muy buena
(skin-first real, 0 pintura inline en el engine modern, anatomía `data-part` completa, bloques
de forced-colors / reduced-motion / reduced-transparency / print ya escritos) y falla en lo que
R1 mide: **el grupo no lee como una gramática, la escalera de rango no sobrevive sin matiz, y
el motor de personalización no llega parejo a las dos familias.** Trece hallazgos, todos
medidos.

### 1.1 Lo que está bien (y no hay que tocar)

- El engine modern de Button no pinta: `grep -c "style={{"` = 0, todo por `skin/button.css`
  sobre el contrato `data-*`. Es el patrón que `CLAUDE.md` manda copiar.
- La reserva de ancho del camino `pending` funciona: `Submit` mide 108.09px porque reserva el
  máximo de `Submit` y `Submitting`. El comentario del engine sobre el "Su..." truncado está
  cumplido.
- El anillo de foco canónico de Button (`--ds-button-focus-ring` → doble anillo 2px canvas +
  2px primario) es correcto y está testeado (W8, `Button.contrast-focus-ring.test.tsx`).
- Los cuatro modos de accesibilidad tienen bloque propio y no son decorativos.
- La divergencia de tenant SÍ existe en 5 ejes reales medidos: canvas, primario, familia
  tipográfica (`Public Sans` vs `Inter`), `--ds-type-scale` (1 vs 1.04) y `--ds-effect-intensity`
  (0.58 vs 0.2 — la sombra de BitHire contra el `none` de TMM).

### 1.2 Fallos contra la ley (ordenados por daño)

**[F1] La escalera de rango colapsa sin matiz — L1, L2, V5, taxonomía color-ink "state meaning
never depends on hue alone".**
Medido a 1440: en BitHire `ghost` = `rgb(83,105,126)` y `link` = `rgb(58,111,176)` (se separan
por tono). En The Management `ghost` = `rgb(61,59,54)` y `link` = `rgb(26,26,24)`: **dos rangos
distintos, sin cromo, con la misma caja y una diferencia de luminancia de ~35 puntos.** En un
tenant monocromo, `ghost` y `link` son el mismo control. `--ds-button-link-text-decoration` es
`none` en reposo y `underline` sólo en hover (`presentation/components/button.css:177-178`), así
que el único signo no-cromático del rango link **no existe en reposo ni en una captura**. Esto
rompe de frente el exit de R1 "prove three-second tenant recognition in grayscale and after
temporary primary-hue neutralization".

**[F2] `ghost` no tiene presencia en reposo — incidente F4C nº4, incidentes 9 y 10, L1.**
Medido: `background-color: rgba(0,0,0,0)` y `border-color: rgba(0,0,0,0)`. En la fila ACTION
HIERARCHY, "Filter" se lee como texto corrido entre cuatro cajas; en el action bar, "Cancel"
igual. Es exactamente el defecto que el owner ya marcó en F4C ("el trigger se lee como texto
pelado sin cromo de botón").

**[F3] `danger` está modelado como un sexto RANGO y no como un TONO — L1, L2.**
La fila de jerarquía es primary → secondary → outline → ghost → **danger** → link: la rampa de
énfasis sube en el quinto lugar y baja en el sexto. A 390 el wrap parte la fila justo ahí y
`Withdraw` (rojo sólido) abre la segunda línea como si fuera el elemento más importante de la
pantalla. El engine YA tiene la pieza correcta (`data-tone='danger'` para el destructivo
quiet); lo que falta es la ley: **rango × tono**, no una lista plana de 12 variantes.

**[F4] Segmented y Button no comparten la escalera de control — L7, V6,
`unexpectedPeerPanelEdgeDeltaPx: 1`, incidente 3.**
Medido en ambos grounds: pista Segmented = **40.00px** en los dos tenants y en los tres anchos.
Botón por defecto = **32.39px** (BitHire) / **33.11px** (TMM). En el viñeta action bar el
Segmented y los tres botones son pares directos y difieren **7.6px / 6.9px** de alto. El piso
mecánico admite 1px.

**[F5] Segmented está FUERA de tres diales que Button sí obedece — cascada rota, L14.**
- Densidad: `--ds-density-effective-scale` = 0.9 (BitHire) vs 1.035 (TMM) mueve al botón
  (32.39 vs 37.25 en `md`) y **no mueve al Segmented** (40px en ambos): `--ds-segmented-md-height`
  es un literal plano `32px` en la línea base vertical.
- Tipografía: `--ds-type-scale` 1 vs 1.04 mueve las etiquetas de botón (13px → 13.52px) y **no
  mueve** las del Segmented (`--ds-segmented-md-font-size: 12px` literal en ambos).
- Forma: el Segmented lee la rampa de SUPERFICIE (`--ds-segmented-radius: var(--ds-radius-md)`,
  `--ds-segmented-md-radius: var(--ds-radius-sm)`) y el botón lee la rampa de CONTROL. Bajo TMM
  eso da **pista y opción a 0px junto a botones de 8px**, en la misma fila. Es el error que el
  propio `button.css:63-75` ya documentó para sí mismo ("reading `--ds-radius-md` here painted a
  36px-tall button with a card's corner") y que Segmented sigue cometiendo.

**[F6] Doble frontera dominante en Segmented — V2, incidente 6 (NESTED-BORDER-001),
`dominantBoundariesPerSemanticRegion: 1`, `competingEmphasizedEdgeTreatmentsPerControl: 1`.**
Medido: la pista tiene `border-width: 1px` con color real; la opción seleccionada tiene OTRO
`border: 1px solid <color real>` (regla `[data-part='option'][data-part='option']` de
`segmented.css:269`), a 3px de distancia, más — en BitHire — `--ds-segmented-item-shadow-selected`
= `0 3px 10px rgba(20,40,59,.05), 0 0 0 3px rgba(58,111,176,.16)`. Son **tres tratamientos de
borde/énfasis** en un control cuyo piso admite uno. Visible en las seis capturas: dos rectángulos
redondeados concéntricos.

**[F7] `Button.Group connected` no produce geometría unida — V2, incidente 6, taxonomía
geometry "joined controls share boundaries without double borders, clipped corners or doubled
seams".**
Medido en los tres hijos de la fila JOINERY: `border-radius` computado =
**`9px / 9px / 9px / 9px` en los tres**, con `margin-inline-start: -1px`. Es decir: tres píldoras
completamente redondeadas superpuestas 1px, no un control. El `border-radius: 0` de
`button-group.css:113` empata en especificidad (0,3,0) con
`.rottay-button.rottay-button--modern[data-variant]` de `button.css:52` y **pierde por orden de
capa**, así que toda la geometría conectada (radios exteriores en primer/último hijo, costura
gobernada) está muerta. La causa raíz es de contrato: `data-connected` sólo se estampa en el
GRUPO, aunque el manifest de Button ya lo declara entre sus `variantAxes` — o sea, el contrato
esperaba el atributo en el hijo y nadie lo estampó nunca.

**[F8] Pisos mecánicos de altura y de tipografía incumplidos en los dos tenants —
`mechanicalFloors`, V4.**
Medido (raíz rem = **15px**, verificado con una sonda: `2.75rem` = 41.25px):

| medida | BitHire | TMM | piso del contrato | veredicto |
|---|---|---|---|---|
| control por defecto (alto visible) | 32.39px (`md`) | 33.11px (`sm`) | 36 balanced / 44 expansive | FAIL en ambas lecturas |
| `sm` | 28.80px | 33.11px | 32 compact | FAIL BitHire |
| `lg` | 36.00px | 41.39px | 44 expansive | FAIL en ambos |
| etiqueta `sm` | 12.00px | 12.48px | 13 | FAIL |
| etiqueta Segmented (`md`) | 12.00px | 12.00px | 13 | FAIL |
| `--ds-button-touch-target-min` | `2.75rem` = **41.25px** | idem | 44 | FAIL (invisible leyendo el rem) |

El motivo estructural de la altura: `min-block-size: calc(var(--ds-button-resolved-height) *
var(--ds-density-effective-scale))` (`button.css:88-90`) multiplica la escalera autorada por el
dial de densidad **sin piso**, así que la densidad puede empujar un control por debajo del piso
mecánico. Y sí lo hace: 36px × 0.9 = 32.4px. Éste es, con diferencia, el mayor motivo por el que
la captura "no se ve premium": los controles están un escalón por debajo de su tamaño.

**[F9] `density.mode` es INERTE en la puerta static y VIVO en la puerta DB — R1 exige paridad.**
Medido: los DOS grounds estampan `data-density="spacious"` en `documentElement`.
`foundation/base/density.css:180` declara `:root[data-density='spacious'] { --ds-density-mode-factor: 1.15 }`.
El artifact de BitHire declara `--ds-density-mode-factor: 1` (`artifacts/bithire/index.css:445`)
y gana; el documento de TMM emite 1.15 y gana. Resultado: **misma postura estampada, dos
factores distintos, y en el brazo estático el control público no mueve nada.** Es un
rompimiento de paridad static/DB sobre un control público, medido sobre la familia insignia.

**[F10] Dos modelos de "busy" con footprints opuestos — taxonomía states-lifecycle ("loading
reserves the final footprint and late data avoids preventable layout shift"), L9.**
Medido: el botón `loading` ("Saving") mide **40.38px de ancho** — colapsa a ancho de icono, pierde
la etiqueta visible y produce un salto de ~30px al entrar en estado; el botón `pending`
("Submitting") reserva y mide 108.09px. Dos caminos de la misma familia, comportamientos
contrarios.

**[F11] En el camino width-stable el gap spinner↔etiqueta es CERO — L2, L10, incidente 6
("icons and copy cramped into leftover space").**
Medido: `[data-part='busy-content']` computa `gap: normal` y la distancia real spinner→label es
**0.00px**; el mismo part en el camino no-width-stable computa `gap: 6.21px`. Causa exacta:
`button.css:181-184` da `gap: inherit` al part, y en el camino width-stable su padre es
`[data-part='content-frame']`, un `display:grid` **sin gap declarado**, así que hereda 0 en vez
del gap del control. Se ve en las seis capturas como "⟳Submitting" pegado.

**[F12] El anillo de foco del Segmented es de otra gramática — y es la clase que Button ya
retiró — V11, accesibilidad.**
Medido: `--ds-segmented-focus-ring` = `0 0 0 3px rgba(58,111,176,0.18)`. Es exactamente el
"low-alpha single ring" que `Button.contrast-focus-ring.test.tsx` declara retirado del token
chain para Button ("old low-alpha single rings are gone"). Peor: `--ds-segmented-padding` es
**3px** mientras el encabezado del propio `segmented.css:87-92` afirma que son 4px "para que ni
el anillo ni el lift de la opción recorten contra el scrollport", con `overflow-y: hidden` en la
pista y un `transform: translateY(-1px)` en hover de la opción. La invariante escrita del archivo
está incumplida por el valor autorado.

**[F13] `focus-visible` no tiene NINGUNA evidencia visual hoy.**
Medido: el chip "Focused" de la escena computa `background-color`, `color`, `border-color` y
`box-shadow` **byte-idénticos** al chip "Rest" en los dos grounds. El `useEffect` de
`FocusedButton` no sobrevive a la captura (el propio comentario de la escena lo dice). O sea:
el estado más importante del contrato de interacción está sin probar en toda la unidad.

### 1.3 Divergencia de tenant sobre esta unidad: 5 ejes reales, 2 anulados

R1 pide ≥8 ejes con ≥6 no-cromáticos. Hoy, sobre Button+Segmented: canvas, primario, familia
tipográfica, type-scale y effect-intensity (5, de los cuales 3 no-cromáticos). Y **dos ejes
declarados se anulan a sí mismos**:

- *Tamaño de control:* el perfil de receta de TMM pone `size` por defecto en `sm` y el de BitHire
  en `md` (medido: todos los botones sin prop `size` salen `sm` en TMM y `md` en BitHire) — pero
  la densidad va en sentido contrario (0.9 vs 1.035), así que el alto por defecto termina en
  **32.39 vs 33.11px: 0.72px de divergencia observable.** Dos diales gobernados que se cancelan.
- *Radio:* `--ds-button-md-radius` computa `calc(9px / 1.25 * 1.25)` en BitHire y
  `calc(9px / 0.8 * 0.8)` en TMM: **9px en los dos.** El divisor es la escala que el propio tema
  emite (mecanismo deliberado del compilador, `brand-theme/index.ts:1018-1022`), de modo que el
  valor autorado se reproduce al dial de hoy; el problema no es el mecanismo sino que **ningún
  tenant autora la rampa de control**, así que ambos heredan los 9px de la línea base vertical de
  BitHire. El dial de forma mueve la rampa de superficie (10px vs 0px) y por eso **parte el grupo
  en dos** en vez de moverlo junto.

---

## 2. Lista acotada de cambios de source

Ley de encuadre: **rango × tono, una escalera de control, una frontera por región, un piso, un
foco, un busy.** Diez leyes de gramática (G1..G10) al final de esta sección; primero el
write-set.

**Aviso de propiedad de dominio (bloqueante para el DT, ver §7).** El skin de estas dos familias
vive en `packages/core/src/foundation/tokens/**`, que `rounds.json` R1 asigna al dominio
`shared-recipes-tokens-styles` → **architecture-integrator**, no al `family-writer`. Igual pasa
con `ui/**/contracts/**` (shared-contracts), `ui/**/index.ts` (shared-barrels) y `ui/**/tests/**`
(quality-integrator). El lote Button es intrínsecamente multi-lane: el DT tiene que asignar los
cuatro dominios explícitamente o el lote repite el bloqueo de la Cohorte 1.

| # | archivo | qué cambia | ley que sirve | canales / estructura |
|---|---|---|---|---|
| 1 | `runtime/engines/modern/skin/button.css` (~1130-1136) | Retirar la regla muerta `.rottay-btn.rottay-btn--modern[data-part='root']`: el engine emite `rottay-button` y estampa `data-part='trigger'`, así que ese "piso a11y C2b" nunca ha matcheado. El piso real lo da la regla de `:1021`. | governance: "every stylesheet selector … has a live family or foundation owner" | ninguno; sin cambio de pintura |
| 2 | idem (`:181-184` + `:287-300`) | El gap de `busy-content` y de las filas `reserve` deja de ser `gap: inherit` y toma la MISMA expresión de gap que la raíz (o se declara el gap en `content-frame`). Reserva y estado busy deben usar el mismo gap. | L2, L10, incidente 6 | lee `--ds-button-{size}-gap` existente; **no mintea nada** |
| 3 | `Button/engines/modern/index.tsx` | El camino width-stable pasa a ser el ÚNICO camino cuando hay etiqueta: `loading` deja de colapsar el footprint y de ocultar la etiqueta. `resolveButtonBusyState` NO se toca (vive en `contracts/`, dominio ajeno) — la decisión es de render. | states-lifecycle, L9 | estructura: sí (qué subárbol se renderiza). Coordinar con `Button.busy-state.test.tsx` |
| 4 | `skin/button.css` (`:88-90`, `:323-330`) | `min-block-size: max(<piso del modo de densidad activo>, calc(alto × escala))`. El piso se lee de un canal gobernado existente; si no existe, se registra un socket **privado provisional** `--_ds-button-height-floor` con `owner/producer/fallbackAuthority/productiveConsumerFamilyIds/promotionCriteria/retirementCriteria` (namespaceLifecycle). Nunca un literal en el skin, nunca un `--ds-*` público nuevo. | `mechanicalFloors`, L14, spacing-rhythm ("density changes composition … rather than shrinking everything") | privado provisional registrado; **prohibido** tocar `--ds-control-size-*` (bloqueo T-1) |
| 5 | `presentation/components/button.css` (productor de `--ds-button-touch-target-min`) | `2.75rem` → un valor que garantice ≥44 px reales con raíz rem 15px (`max(44px, 2.75rem)`). | `coarsePointerTargetPx: 44` | canal existente, valor corregido |
| 6 | `Button/compound/Group/index.tsx` | El clon de cada hijo estampa `data-connected` y `data-group-position="first\|middle\|last"`. El manifest de Button YA declara `data-connected` en `variantAxes`: esto restituye un contrato, no inventa API. | geometry-boundaries, V2 | estructura: atributos estampados (no API pública) |
| 7 | `skin/button.css` (+ recorte en `presentation/components/skin/button-group.css`) | La geometría unida pasa al skin modern, keyed en los atributos del hijo, al peso de selector del propio engine: radios interiores a 0, radios exteriores sólo en los extremos, una costura gobernada. `button-group.css` conserva layout/gap/mobile y deja de intentar ganar la geometría. | V2, incidente 6, "joined controls share boundaries…" | ninguno nuevo; usa `--_ds-button-resolved-radius` y `--ds-button-group-divider-color` existentes |
| 8 | `skin/segmented.css` | **Una sola frontera:** la pista es dueña del marco; la opción seleccionada se expresa con ground + tinta + peso (+ costura interior de 1px opcional dibujada con el color de borde de la PISTA). Se retira el `border: 1px solid transparent` de `:269` como portador de un segundo marco y el anillo teñido de `--ds-segmented-item-shadow-selected`. Se retira el `linear-gradient(155deg,…)` por defecto (inalcanzable en los dos grounds enviados). | V2, V11, incidente 6, `competingEmphasizedEdgeTreatmentsPerControl: 1` | ninguno nuevo |
| 9 | `skin/segmented.css` + línea base vertical (ítem 12) | Segmented entra en la escalera de control: `track = paso de control`, `option = paso − 2·padding − 2·border`. Alto, tamaño de etiqueta, padding-x, gap, icon-size y radio **derivan** de `--ds-button-{size}-*` y por lo tanto de densidad, type-scale y rampa de control. | L1, L2, L7, V6, F4/F5 | ninguno nuevo; se retiran los literales paralelos |
| 10 | `skin/segmented.css` | Un solo foco: la opción pinta el `--ds-focus-ring` canónico (doble anillo), se retira `--ds-segmented-focus-ring` de baja alfa, y la pista reserva la extensión completa del anillo (padding + margen negativo, el patrón que `button-group.css:61-75` ya usa) para que `overflow` no lo recorte. | V11, accesibilidad, precedente W8 de Button | canal existente `--ds-focus-ring`; se retira uno |
| 11 | `presentation/components/button.css:177` | `--ds-button-link-text-decoration: underline` en REPOSO (con el `--ds-button-link-underline-offset` que ya existe). El subrayado es el signo no-cromático del rango link. | color-ink "state meaning never depends on hue alone"; exit R1 de reconocimiento en grises / hue neutralizado | canal existente, valor por defecto |
| 12 | `skin/button.css` | Presencia en reposo del rango quiet (`ghost`/`text`): ground derivado de `currentColor` con el MISMO mecanismo ya probado en este archivo para el pozo de icon-only (`--_ds-button-icon-plate-bg: color-mix(in srgb, currentColor 7%, transparent)`, `:270-282`), colapsando bajo `prefers-reduced-transparency`. **Decisión adjudicable — mi recomendación es hacerlo; ver §7 (i).** | L1, incidentes 9 y 10, incidente F4C nº4 | socket privado provisional registrado; nunca `--ds-*` público |
| 13 | `ts/presentation/brand-themes/bithire/index.ts` + regeneración de `css/facade/artifacts/bithire/index.css` | Retirar los literales de marca de la familia (§4). El artifact NO se edita a mano: se regenera desde el `.ts`. | R1 objective "drain the brandable hardcode census"; README :447 | ver tabla de §4 |
| 14 | `Segmented/engines/modern/index.tsx` | Estampar explícitamente la parte de la pista y la tripleta `hovered/pressed/focus-visible` con la misma utilidad `partAttributes`/`useInteractionState` que usa Button, para que las dos familias tengan una sola gramática de estado y el skin no dependa del lastre `[role='radiogroup'][role='radiogroup']`. | L2, states-lifecycle, paridad del grupo | estructura: sí (partes y estados estampados). Obliga a actualizar el manifest (hoy `stableParts` = `option/icon/label` y `states` = `selected/disabled`) |
| 15 | `probe/ds-reference/sections/control/index.tsx` (+ chrome si hace falta) | Ampliación de escena de §3. **Sin importar el torture harness** (ley del ground) y con readiness `data-testid` propia. | `rounds.json` R1 `scope.referenceLabLaw` | — |

### G1..G10 — la gramática que estos cambios instalan

- **G1 — Rango × Tono, no lista plana.** Rangos: `solid` → `tinted` → `outlined` → `quiet` →
  `link`. Tonos que los cruzan: `brand` (defecto), `danger` y los status ya existentes. La API
  pública no cambia (`variant`, `danger`, `data-tone` ya existen); el skin pasa de 12 bloques
  independientes a una tabla rango × tono.
- **G2 — Cada rango es legible sin matiz.** Firma por rango: relleno / tinte+borde / borde /
  wash / subrayado. Es lo que hace pasar el test de reconocimiento en grises y con el primario
  neutralizado.
- **G3 — Una sola escalera de control.** Button y Segmented comparten alto, radio y cuerpo de
  etiqueta resueltos en cada paso. El Segmented nunca vuelve a tener rampa propia.
- **G4 — Una frontera dominante por región semántica.** La pista del Segmented y el grupo
  conectado son cada uno UN marco; los hijos usan costuras, no marcos.
- **G5 — La altura tiene piso; la densidad mueve ritmo.** `max(piso, alto × escala)`; nunca por
  debajo del piso del modo activo; 44px reales en puntero grueso.
- **G6 — Piso tipográfico.** Ninguna etiqueta de control por debajo de 13px ni micro-etiqueta por
  debajo de 11px, en ningún paso, en ningún tenant, a type-scale 1.
- **G7 — Un solo foco.** Doble anillo canónico en todo el grupo; los anillos simples de baja alfa
  quedan retirados aquí como ya lo estaban en Button; el anillo nunca se recorta.
- **G8 — Un solo busy.** Reserva el footprint de reposo, conserva la etiqueta visible cuando
  existe, y separa spinner de etiqueta con el gap del control.
- **G9 — Ningún color de esta unidad fuera del alcance del tenant.** Todo color de reposo o de
  estado deriva de un seed, de un neutro gobernado o de `currentColor`.
- **G10 — Móvil es prioridad, no estiramiento.** El apilado a sangre se reserva al rango de
  compromiso; los instrumentos conservan ancho intrínseco o pasan a divulgación por overflow.

---

## 3. Estados y responsive: la matriz que Button debe cerrar

Leyenda: **[E]** existe hoy en la escena `control`; **[E-falso]** existe pero no prueba nada;
**[+]** hay que agregarlo.

### 3.1 Estados

| celda | hoy |
|---|---|
| rest × 6 variantes × (sm, md, lg) | **[E]** (sm/md/lg sólo en primary; los 6 rangos sólo en el paso por defecto) |
| rest × `xs` y `xl` | **[+]** — son los extremos con la peor tipografía (`xs` = 11px) |
| hover | **[+]** — la pintura de hover vive tras `@media (hover: hover)`; se captura con puntero fino real |
| pressed / `:active` | **[+]** |
| focus-visible | **[E-falso]** — medido byte-idéntico a Rest. Debe tomarse foco REAL y **asertar `[data-focus-visible='true']` antes del obturador** |
| focus-visible × selected | **[+]** — colisión medida: la regla de selected sólido `(0,5,0)` gana el `outline` a la de foco `(0,3,0)`; el anillo sobrevive por `box-shadow`. Hay que fotografiarlo |
| selected / `aria-pressed` / `aria-current` | **[+]** — el skin tiene el bloque completo (`:901-955`) y **cero escena** |
| disabled | **[E]** |
| busy `loading` | **[E]** — y es donde se ve el colapso de footprint (F10) |
| busy `pending` + label | **[E]** — y es donde se ve el gap 0 (F11) |
| transición busy → resuelto sin salto | **[+]** (medir ancho antes/después) |
| quiet destructive (`danger` + `variant` quiet → `data-tone`) | **[+]** — CSS existe (`:826-899`), sin escena |
| icon-only (pozo quiet) + nombre accesible | **[+]** — CSS existe (`:263-282`), sin escena |
| icono leading / trailing / ausente sin hueco residual | **[+]** — `emptyOptionalIconSlotPx: 0` sin probar |
| `block` / full-width con etiqueta larga | **[+]** — el bloque de wrap (`:323-330`) sin escena |
| link reposo vs hover (subrayado) | **[+]** |
| `Button.Group` conectado: primer/medio/último, foco dentro del grupo | **[E]** parcial; falta foco dentro del cluster |
| Segmented: hover, pressed, focus-visible, disabled por opción, 5+ opciones con scroll | **[+]** (sólo existe selected) |
| reduced-motion / reduced-transparency / forced-colors / print | **[+]** los cuatro: bloques CSS escritos, **cero evidencia** |
| zoom de texto 200% (el alto crece, no recorta) | **[+]** — la afirmación está en el comentario de `:84-87`, sin prueba |

### 3.2 Responsive y contenido

| celda | hoy |
|---|---|
| 390 / 768 / 1440, ambos grounds | **[E]** — pero el harness vivo captura 390/768/**1280**: 1440 y 320 **no tienen productor** |
| 320 | **[+]** — piso de `stressMatrix` y nombrado por el docblock de la propia escena |
| contenedores estrechos 280 / 320 / 480 | **[+]** — un cluster de acciones dentro de un rail |
| puntero grueso (`hasTouch`) | **[+]** — el piso de 44px no está probado nunca |
| etiqueta larga / español / árabe-RTL / token irrompible | **[E]** — y hay que decidir el camino accesible del truncado: hoy los cuatro elipsan sin `title` ni disclosure |
| documento RTL completo | **[E]** en `bithire-ar/control`; **[+]** en el ground DB (o razón escrita de por qué el eje locale se certifica sólo sobre static) |
| ES/AR en el ground DB | **[+]** o adjudicación escrita |
| line-height / tracking del árabe | **[E]** parcial — medido `letter-spacing: normal` en el botón AR (bien); confirmar que es intencional y conservarlo |
| teclado: orden de tab del cluster, Space/Enter, roving del Segmented (Arrow/Home/End, espejado RTL) | **[+]** — probado en jsdom, sin evidencia visual |
| control negativo por escena ("qué NO debe moverse") | **[+]** — la escena `control` no está en la matriz F4C |

**Deuda del instrumento (bucket D, ≤20%):** ampliar la lista de viewports del harness existente
a 320/390/768/1440 y darle una entrada para la escena `control` con sus nodos MOVE/HOLD. Es un
cambio de datos, no un instrumento nuevo. Y arreglar el defecto de captura de §0 antes de
producir una sola PNG de aceptación.

---

## 4. Hardcodes del write-set

### 4.1 Corrección al censo (importante para el DT)

`scouts/hardcode-census-top5.md` es correcto en lo que mide y **no alcanza a esta unidad**. Su
clase B se define sobre lecturas de SKIN cuyo literal de fallback es el único valor. Los
hardcodes reales de Button/Segmented viven en otro plano: la **línea base vertical**
(`brand-themes/bithire/index.ts` → `artifacts/bithire/index.css`), donde el literal ES el valor
declarado y por lo tanto no hay fallback que detectar. Consecuencia práctica: con el detector
actual el lote Button reportaría "0 hardcodes retirados" mientras retira siete reales. **El
censo del lote debe medirse con la definición del owner ("valor de marca que el tenant no puede
mover"), con el detector fijado en el repo, y ese detector debe incluir el plano de la línea
base vertical.** Sin eso, la reducción monotónica del round es incomprobable para esta cohorte.

La causa por la que estos literales son visibles en los dos tenants está medida: el ground de
The Management estampa `data-vertical="bithire"` (mismo envelope vertical, dos documentos de
tenant — que es el diseño correcto del lab), de modo que **todo lo que el documento de TMM no
sobreescribe conserva el literal autorado por BitHire.**

### 4.2 Fugas VIVAS de pintura (el tenant no las puede mover) — retirar en este lote

| canal | valor medido (ambos grounds) | quién lo lee | efecto visible sobre TMM |
|---|---|---|---|
| `--ds-button-secondary-color` | `#3A6FB0` | `button.css:496` | tinta azul BitHire en `Assign`, `Rest`, `Focused` sobre un tenant monocromo — **medido: `color: rgb(58,111,176)`** |
| `--ds-button-disabled-bg` | `#F8FAFC` | `button.css:999-1002` | chip gris-azulado frío sobre canvas crema |
| `--ds-button-disabled-color` | `#AEBCC8` | idem | idem |
| `--ds-button-disabled-border` / `-border-color` | `#E8EEF3` | idem | idem |
| `--ds-button-link-color-hover` | `#2c5587` | bloque hover de link | el hover del link en TMM pinta azul BitHire |
| `--ds-button-group-divider-color` | `#d4e0ea` | `button-group.css:92,102` | la costura del toolbar unido es azul-gris BitHire en TMM |
| `--ds-segmented-item-shadow-selected` (brazo BitHire) | `… , 0 0 0 3px rgba(58,111,176,0.16)` | `segmented.css` selected | tercer tratamiento de borde, teñido de marca |
| `--ds-segmented-focus-ring` | `0 0 0 3px rgba(58,111,176,0.18)` | foco del Segmented | anillo simple de baja alfa (la clase retirada por W8) |

### 4.3 Muertos o inalcanzables — retirar sin cambio de pintura

- `--ds-button-primary-hover-bg: #2C5587` — el skin lee `--ds-button-primary-bg-hover` (que SÍ
  deriva: medido `#282826` bajo TMM). El alias es un literal muerto.
- La regla `.rottay-btn.rottay-btn--modern[data-part='root']` de `button.css:1132`.
- El `linear-gradient(155deg, …)` por defecto del seleccionado del Segmented (los dos grounds
  autoran `--ds-segmented-item-bg-selected`, así que nunca pinta).

### 4.4 Literales de skin en `segmented.css` — vincular o adjudicar por escrito

`--ds-segmented-gap, 2px`; `--ds-segmented-padding, 4px` (y el valor autorado 3px **contradice la
invariante escrita del propio archivo**, que dice 4px para no recortar el anillo);
`--ds-segmented-item-max-inline-size, 16rem`; `border: 1px solid transparent` en la opción (1px
crudo y `solid` crudo, en vez de `--ds-edge-standard-*`); `--ds-segmented-current-line-height,
normal`; `--ds-segmented-icon-radius, var(--ds-radius-xs)`. Los ítems 8/9/10 de §2 retiran o
vinculan la mayoría; los que sobrevivan necesitan adjudicación escrita, no silencio.

### 4.5 FUERA del write-set — nombrar y enrutar, no tocar aquí

`--ds-color-border: #d4e0ea` es idéntico en los dos tenants y alimenta
`--ds-button-default-border`, o sea **el borde de todos los botones `outline`/`default`**: es el
defecto de color más visible de la captura de TMM (bordes azul-grises sobre crema, junto a una
pista de Segmented que sí usa el `#2A2824` correcto). Pero es un canal de fundación con radio de
explosión sobre todo el sistema. **Recomendación: levantarlo como hallazgo de fundación con dueño
asignado para la unidad 2 o 3, y declarar no-write en este lote con razón escrita.** Cambiarlo
dentro del lote Button convierte una calibración en un repintado global.

Nota de lectura de Button en el censo: `button.css` sigue teniendo 49 lecturas `var()` con
literal de fallback — cubo (b) del censo, red y no pintura, carril WO-SKIN decrease-only. **No es
cola de este lote** salvo las que los cambios de §2 toquen de paso.

---

## 5. Cascada a demostrar

Cinco controles, todos ya existentes, sin instrumentos nuevos. Cada uno con portadores MOVE y
controles negativos HOLD, por las DOS puertas (BrandTheme estático y documento DB), con restore
byte-exacto.

| # | control | portadores MOVE en esta unidad | HOLD (no debe moverse) | estado hoy |
|---|---|---|---|---|
| 1 | `palette.seeds` (primario) | `primary` bg/border, `secondary` bg+border+**tinta**, wash de hover de quiet, tinta de link **y su hover**, color del anillo de foco, ground del segmento seleccionado | tono `danger` (`--ds-color-error: #C5504C`, idéntico en ambos), neutros, geometría, tipografía, motion | Button es el **witness productivo declarado** del control (manifest: `COMPUTED_VERIFIED`, `disposition: UNKNOWN`, "SIGHTED_ACCEPTANCE_PENDING"). Hoy la tinta de `secondary` y el hover de link **no se mueven** (§4.2): hasta retirarlos, el control está probado a medias |
| 2 | `shape` / radio | radio de Button, radio de la pista y de la opción del Segmented, radios exteriores del grupo conectado | alturas, tipografía, color | **el eje no-cromático más fuerte disponible**, y hoy parte el grupo: 10px→0px en Segmented, 9px→9px en Button. Tras G3 los dos se mueven juntos. No requiere tocar el fixture: los dos grounds ya difieren |
| 3 | `density.mode` | alto, padding-inline y gap de Button; alto de la pista del Segmented tras G3; gap del `Button.Group` | color, radio, familia tipográfica | **INERTE en la puerta static** (F9). Debe cerrarse o adjudicarse por escrito antes de que el lote reclame paridad de cascada |
| 4 | tipografía (`--ds-type-scale`) | cuerpo de etiqueta de Button (ya) y de Segmented (tras G6) | geometría, color | parcial: mueve Button, no mueve Segmented |
| 5 | `effectIntensity` | sheen `::before` del sólido, keylines del Segmented, sombras | **geometría y tipografía deben quedar clavadas** | ya funciona (0.58 vs 0.2) y es el eje más rico en negativos |

**Cómo se prueba, sin inventar instrumento.** Extender la matriz de
`packages/showroom/scripts/f4c-canary-capture.mjs` con una entrada para la escena `control` (sus
testids obligatorios, su testid de fallback ausente, sus nodos MOVE/HOLD) y correr el protocolo
que ya existe: `--phase A|B|…`, `--compare`, `--check`, `--drill`. Su disciplina por ELEMENTO
—delta en una propiedad PINTADA más cero delta en el conjunto HOLD, más anclaje de estructura— es
exactamente lo que estos cinco ejes necesitan, y evita el falso verde "el canal cambió". Único
cambio de datos requerido: la lista de viewports (hoy 390/768/1280) debe cubrir 320/390/768/1440.

Prerrequisitos de determinismo ya escritos y que hay que respetar: reducedMotion, `fonts.ready`
+ doble rAF, viewport fijo, identidad del servidor registrada, y servidor estable (el oráculo de
CSS del ground estático se mueve con HMR en dev).

---

## 6. Qué NO debe cambiar (fences del lote)

1. **Ningún canal `--ds-*` público nuevo minteado por estas familias** (README del programa :446;
   `customization-model.json:9,19`). Sólo sockets privados provisionales, **registrados completos**
   (`owner`, `producer`, `fallbackAuthority`, `productiveConsumerFamilyIds`, `promotionCriteria`,
   `retirementCriteria`) y nunca como aparcadero de una decisión diferida (`drainLaw`).
2. **Sin selectores de tenant, sin TSX condicional por tenant, sin segundo compilador, sin skin
   paralelo.** La divergencia sale de canales, no de ramas.
3. **classic y rustic son read-only** (README :443). No se tocan `engines/classic|rustic/index.tsx`
   ni `rustic/skin/{button,segmented}.css`, y sus suites siguen verdes.
4. **No se reabre `control.size ↔ density.mode`** (bloqueo T-1 asentado). El piso de altura del
   ítem 4 CLAMPEA; no resuelve la adjudicación ni introduce `--ds-control-size-*`.
5. **`--ds-input-md-line-height` de BitHire (1.5385) se preserva** (decisión del owner).
6. **Ningún artefacto generado, baseline o receipt se edita a mano** (README :447).
   `artifacts/bithire/index.css` cambia SÓLO regenerando desde el `.ts`.
7. **`--ds-color-border` no se toca en este lote** (§4.5): se levanta con dueño y razón escrita.
8. **`docs/reauditoria-cloud/` jamás entra al staging**; `roadmap/**` no se edita;
   `packages/core/scripts/**` es no-write (el round es juzgado POR esa herramienta).
9. **Fuera de `probe/ds-reference` no se escribe nada del showroom**; el ground no importa el
   torture harness.
10. **No se abren badge/tag (cluster C4) ni `data-table.css` (C1)**: el primero es portador del
    canary de status-seeds, el segundo es la unidad 2.
11. **Iconos:** Button hoy no importa ningún icono. Si la escena necesita glifos, salen del facade
    semántico (`@rottay/design-system/icons`), nunca del catálogo de compatibilidad
    (`iconGovernanceContract.forbidden`).
12. **Dark mode no recibe trabajo dedicado** y ningún baseline se degrada.
13. **Los receipts se emiten ÚLTIMOS**: los manifests están en `sourceFiles`, así que cualquier
    edición de manifest (ítem 14 de §2 la exige) deja rancios todos los receipts. Congelar el
    write-set antes de emitir.
14. **Nada se propaga a los otros 11 canaries antes del GO explícito del DT**
    (`checkpointPolicy.calibrationLaw`: estas tres unidades SON la cohorte de calibración).

---

## 7. Criterio de GO/NO-GO

### 7.1 Puertas mecánicas (todas verdes, o la diferencia explicada por escrito)

1. `pnpm --filter @rottay/design-system structure:check` limpio.
2. `node packages/core/scripts/engine/cascade-wiring-ratchet/index.mjs` ≤ el valor previo al lote
   (hoy 2169/4373). **Nunca sube.**
3. `node packages/core/scripts/engine/token-audit/index.mjs --check` verde, y
   `fleet.inlinePaint` de estas dos familias **no sube**: Button modern está hoy en 0 sitios de
   pintura inline y debe quedar en 0.
4. `node packages/core/scripts/tokens/root-membership/index.mjs --check` verde **después de un
   build real** (hoy se niega por `dist/` rancio; esa negativa es frescura, no drift).
5. `program-check.mjs` + `program-check.test.mjs` sin rojos NUEVOS sobre la línea base conocida
   (receipts F4B stale preexistentes). Verificar de paso que `producers.json` no arrastra el
   residuo `evidence.path=["tampered"]`.
6. Las 24 suites de Button + 4 de Segmented + 2 de `engines/modern/tests` verdes. Cualquier
   aserción cambiada a propósito (busy width-stable, geometría conectada, anillo del Segmented)
   va listada en el receipt con su razón.
7. **Censo de hardcodes brandables estrictamente menor** que al inicio del lote, medido con el
   detector fijado en el repo y que cubra el plano de la línea base vertical (§4.1).

### 7.2 Puertas sighted (DT)

8. **Cero vetos duros** de los 25 sobre las capturas nuevas, y **todos los pisos mecánicos**
   cumplidos a 320/390/768/1440 en los dos grounds: alturas ≥ el piso del modo de densidad
   estampado; 44px reales en puntero grueso; ninguna etiqueta de control <13px; ninguna
   micro-etiqueta <11px; exactamente 1 frontera dominante por región; ≤1 tratamiento de borde
   enfatizado por control; delta de canto Button↔Segmented ≤1px en el action bar.
9. **La matriz de §3 capturada**, con `focus-visible` probado por aserción de
   `[data-focus-visible='true']` antes del obturador — no por parecido visual.
10. **Cascada:** ≥3 de los 5 controles de §5 demostrados con portadores MOVE y negativos HOLD, por
    las dos puertas, con restore byte-exacto; `density.mode` arreglado en ambas puertas o
    adjudicado por escrito.
11. **Divergencia:** ≥8 ejes BitHire↔TMM sobre esta unidad, ≥6 no-cromáticos, cada uno con su par
    de valores medido; y el reconocimiento a tres segundos en grises y con el primario
    neutralizado, sobre el viñeta action bar.
12. **Presupuesto 80/20** verificable en el diff: ≥80% en source (engines, skins, tokens), ≤20% en
    harness y evidencia. Ningún lote sólo de documentos.
13. Las celdas de manifest de las dos familias salen de `UNKNOWN` **sólo donde hay evidencia**;
    receipts al final.
14. Auditoría independiente Fable 5 al cierre + GO sighted del DT asentado.

### 7.3 Disparadores NO-GO inmediatos

- Una captura presentada que no se reproduzca en vivo (el artefacto de `control-bithire-390.png`).
- Un canal `--ds-*` público nuevo, o un socket privado sin registro completo.
- Cualquier condicional por tenant en TSX o CSS.
- Ratchet o contadores de pintura inline al alza.
- Cualquier diff en classic/rustic.
- Un cambio de `--ds-color-border` dentro de este lote.

### 7.4 Tres adjudicaciones que el DT debe firmar antes de que Sonnet escriba

Las tres están acotadas y llevan mi recomendación, para que ninguna bloquee el arranque:

- **(i) Presencia en reposo del rango quiet.** ¿`ghost`/`text` ganan un ground derivado de
  `currentColor` (ítem 12) o siguen sin cromo? **Recomiendo el wash**: sin él, `ghost` y `link`
  quedan como un solo rango visual en el tenant monocromo y el incidente F4C nº4 sigue vivo.
- **(ii) Paridad de `density.mode` static↔DB (F9).** ¿Se arregla dentro del lote o se adjudica con
  razón escrita? **Recomiendo arreglarlo aquí**: es el entregable de cascada de esta unidad, y sin
  él el brazo estático no prueba nada sobre el dial más visible del round.
- **(iii) Asignación de lanes.** El skin, los tokens y la línea base vertical NO son dominio del
  `family-writer`. El DT debe asignar `shared-recipes-tokens-styles`, `shared-contracts`,
  `manifests` y `observable-tests`, y firmar el no-write de `--ds-color-border` con su razón.

---

## Veredicto

**GRAMMAR READY.**

La dirección está cerrada y es ejecutable: G1..G10 como ley, quince cambios de source acotados a
las dos familias y su escena, siete hardcodes de marca con fuga viva identificados uno por uno
con su lector y su efecto visible, cinco ejes de cascada con portadores y negativos, y catorce
puertas de aceptación. Nada de esto depende de una decisión que no esté tomada o recomendada
aquí.

Dos avisos que el DT debe leer antes de lanzar, y que no bloquean la escritura:

1. **La evidencia de entrada está parcialmente corrupta.** `control-bithire-390.png` es un
   artefacto del instrumento (probado en vivo, §0). Cualquier aceptación apoyada en ese PNG es
   falsa. El instrumento de captura necesita su corrección antes de producir evidencia de cierre.
2. **El lote es multi-lane por construcción** (§7.4-iii). Si se lanza como un solo
   `family-writer`, chocará contra los dominios de `rounds.json` exactamente como pasó en la
   Cohorte 1.

