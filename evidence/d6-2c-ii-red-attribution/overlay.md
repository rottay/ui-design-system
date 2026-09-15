# D6-2c-ii-RED — grupo `overlay` (16 archivos, 22 aserciones)

Resultado: **234 pass / 3 fail** sobre el write set. Los 3 restantes son PREEXISTENTES,
probados por A/B contra HEAD prístino, y los dejé intactos a propósito (ver §D).
Cero archivos de producto tocados. 13 archivos de test modificados.

---

## A · Causalidad R4 — la opción probada coincidía con la decisión del preset (6 aserciones, (ii) RE-ANCHORED)

Las seis suites mutaban `density.mode: 'compact'`, que es **exactamente lo que el preset de
bithire decide**, así que la mutación no movía nada. Medido en los tres documentos de preset:

| vertical | `density.mode` |
|---|---|
| rottay | normal |
| bithire | **compact** |
| evnto | normal |

Dominio cerrado del control: `compact | normal | spacious`. **`spacious` es el único stop que
ningún preset decide**, así que discrimina en las tres verticales. Re-anclado a `spacious` en las
seis, con la razón escrita al lado del arm.

| aserción | antes (bithire, coincidente) | después |
|---|---|---|
| `dropdown > density.mode moves rowHeight and holds radius` | `28.764px` == base | mueve |
| `hover-card > density.mode moves padding and holds radius` | `11.985px` == base | mueve |
| `sheet > density.mode moves padding and holds radius` | `7.64044px` == base | mueve |
| `tour > density.mode moves padding and holds radius` | `10.1873px` == base | mueve |
| `confirm-dialog > density.mode moves padding and holds radius` | `15.2809px` == base | mueve |
| `alert-dialog > density.mode moves padding and holds radius` | `15.2809px` == base | mueve |

No se bajó ningún umbral ni se sacó ninguna vertical: los arms siguen corriendo `in: VERTICALS`.

---

## B · R1 focus ring — la política es correcta pero INCOMPLETA (3 aserciones, (iv) REGISTERED NEW)

**Corrección a la política.** R1 dice que `--ds-focus-ring-color` "no tiene productor". Medido
por mí con una sonda sobre `measureArms` (base vs `palette.seeds {primary:#2F6B9A}`):

| vertical | base | con la semilla | ¿la semilla lo mueve? |
|---|---|---|---|
| rottay | `#a3a3a3` | `#306B9A` | **SÍ** |
| bithire | `#ECECEC` | `#ECECEC` | no |
| evnto | `#ECECEC` | `#ECECEC` | no |

O sea: **el anillo SÍ sigue la semilla en rottay**, y se queda clavado en la constante de
fundación `#ECECEC` en las dos verticales light-default. No es "sin productor" a secas: es
**un productor que sólo responde en una de las tres verticales**.

Hipótesis (NO la asevero, no la pude aislar con este arnés, que no toma `theme`): rottay es la
única dark-default, y esto huele a la misma clase de emisión mode-scoped que WO-EVI-02 ya
registró el 2026-09-11 ("palette.seeds routes to modes.light on dark-default rottay").
Recomiendo que el carril lo verifique antes de escribir el fix.

Re-ancla aplicada, misma forma en las tres suites: el arm `palette.seeds` conserva a plena
fuerza los targets que SÍ mueve, y la alcance del anillo se pinea **por vertical** en un `it`
propio (`focus ring seed reach`), que enrojece en las dos direcciones.

| suite | arm antes | arm después | pin por vertical |
|---|---|---|---|
| dropdown | `moves: ['hoverInk','focusRing']` | `moves: ['hoverInk']` | rottay **true**, bithire false, evnto **true** |
| tour | `moves: ['nextBg','focusRing']` | `moves: ['nextBg']` | rottay true, bithire false, evnto false |
| sheet | `moves: ['focusRing']` (único sujeto) | arm retirado, con la razón escrita | rottay true, bithire false, evnto false |

**Hallazgo extra, medido**: en `dropdown` la semilla SÍ alcanza el `focusRing` en **evnto**, al
revés que en sheet/tour. El target de dropdown es el `box-shadow` compuesto de la fila, y en
evnto la semilla lo alcanza por una capa distinta de `--ds-focus-ring-color`. Por eso el mapa de
alcance se mide POR FAMILIA y no se copia del color del anillo; queda escrito en el docblock.

Nota: el arm de `sheet` era el único cuyo sujeto entero era el anillo. No lo borré en silencio:
la razón está en el código y el `it` nuevo asevera MÁS que el arm viejo (el arm sólo exigía
movimiento; el pin exige movimiento donde lo hay y quietud donde no).

### Texto de registro propuesto (para que lo entre el coordinador)

> WO-DER-06 / carril de derivación — ANILLO DE FOCO SIN PRODUCTOR EN LAS VERTICALES
> LIGHT-DEFAULT (D6-2c-ii-RED, 2026-09-15, medido por el grupo overlay). `--ds-focus-ring-color`
> se declara únicamente como constante de fundación (`foundation/themes/default/index.css:816`,
> `#ECECEC`). Medido base vs `palette.seeds{primary:#2F6B9A}`: rottay `#a3a3a3 -> #306B9A`
> (la semilla SÍ llega), bithire y evnto `#ECECEC -> #ECECEC` (no llega). Los temas autorados
> retirados lo autoraban como su primary (A/B en HEAD: rottay `rgb(255,255,255)`, bithire
> `rgb(58,111,176)`, evnto `rgb(23,23,23)`). Consecuencia de accesibilidad: el anillo de bithire
> mide 1.18:1 contra su propio canvas. Obligación: un deriver debe emitir
> `--ds-focus-ring-color` desde la semilla de paleta en las tres verticales. Sospecha a
> verificar: emisión mode-scoped, misma clase que el hallazgo de seeds/modes.light de
> WO-EVI-02 (2026-09-11). Pines vivos que enrojecen al cerrarlo: `focus ring seed reach` en
> Dropdown/Sheet/Tour.

---

## C · R3 axe — hueco de derivación mode-aware (1 aserción, (i) REGISTERED)

`hover-card > has no serious or critical axe violation in any gated vertical mode`.

Medido por scope sobre el markup real de la suite:

| scope | hallazgos serios |
|---|---|
| rottay dark | 0 |
| bithire light | 0 |
| **bithire dark** | **1 · color-contrast · 1 nodo · `#f3f4f6` sobre `#ffffff` = 1.1:1** |
| evnto light | 0 |

Es R3: ningún preset siembra paleta por modo, el canvas claro del tenant cascadea al bloque
oscuro y la tinta oscura cae encima. Ya registrado por el DT (P3#6, derivación mode-aware).

Pin aplicado **por scope y por hallazgo**, no `toEqual([])` ni un `length` suelto:
- toda violación seria cuyo `id !== 'color-contrast'` sigue exigiendo `[]` en TODOS los scopes;
- los nodos de `color-contrast` se pinean por scope (`bithire dark: 1`, el resto 0).

Enrojece si aparece otro tipo de violación, si aparece en otro scope, o si crece el número de
nodos. El título del test dice ahora "beyond the pinned contrast gap", no "no violation".

---

## D · Ausencias de DOM — TODAS preexistentes (9 aserciones)

A/B corrido por mí en `head-2cii/.../packages/core` **antes** de tocar nada. Las 9 fallan
idénticas en HEAD prístino: **ninguna es del lote**.

Causa raíz (confirmada con la medición que pasó el coordinador): el motor modern se monta con
`React.lazy` dentro de un `Suspense`, así que el primer render de un componente de motor en un
módulo fresco devuelve el fallback vacío.

### D.1 · Reparadas esperando el límite lazy (6 aserciones) — (i) preexistente, ahora verde

La reparación NO debilita: `findBy*` / `waitFor` fallan igual si el elemento no aparece nunca.

| aserción | reparación |
|---|---|
| `LayoutBatch > stamps header/content/footer under the modern engine` | cada compound resuelve su PROPIO boundary: se espera `header`, `content` y `footer`, no sólo `root` |
| `LayoutBatch > ... under the rustic engine` | ídem |
| `CommunicationBatch > PresenceBar: root/avatar/composed-fallback/overflow-badge (modern)` | el Avatar compuesto es su propio componente lazy: `waitFor` alrededor de la aserción de su clase |
| `EmptyState > renders an action button and fires onClick in the modern engine` | `getByText` → `await findByText`; el callback pasa a `async` |
| `AlertDialog.real-engines > renders the action slot and cancel flow through the modern engine` | el slot `action` lleva un Button de motor: segundo boundary. `getByRole` → `await findByRole` en los dos botones |
| `PatternLiveFeed > covers refresh, new-items, load-more, and auto-refresh branches in the modern engine` | ver abajo |

**PatternLiveFeed merece su párrafo.** Instalaba `vi.useFakeTimers()` ANTES del render, y bajo
reloj falso el chunk lazy no asienta nunca. Primer intento: mover los fake timers después del
mount — el mount se arregló pero **rompió la rama de auto-refresh**, porque el intervalo quedaba
registrado con el reloj real (`onRefresh` 1 vez en vez de 2). Solución correcta: dejar el reloj
falso donde estaba y ceder la cola de microtareas SIN mover el reloj, con
`await act(async () => { await vi.advanceTimersByTimeAsync(0); })`. Las dos ramas quedan vivas.

### D.2 · Preexistentes que el límite lazy NO explica — (i) preexistente, NO reparadas (3 aserciones)

Las probé con el idioma lazy, no se arreglaron, y **revertí mis intentos**: el árbol queda
byte-idéntico en estos tres archivos. No las debilité ni las borré.

| aserción | por qué no es lazy | sujeto real |
|---|---|---|
| `Display1Batch > Card > modern: loading renders cover/skeleton/skeleton-bar/loading-overlay/spinner` | esperé `cover` con `waitFor` y **expira**: no aparece nunca | la rama `loading` del Card modern renderiza sólo `loading-content > loading-overlay > spinner` (engines/modern/index.tsx:289-292). No hay `skeleton` ni `skeleton-bar`, y el `coverNode` cuelga de `logicalCoverPosition`, que en este entorno no cae en ninguna de las dos ramas. La aserción afirma una anatomía de carga que el componente no entrega, en HEAD y ahora |
| `FloatButton > shows back-to-top when scroll crosses the threshold and triggers smooth scroll` | el botón SÍ se encuentra (ya usaba `findByRole`); lo que falla es que el click no llega a `window.scrollTo`. Probé asentar el mount antes de despachar el `scroll`: sigue rojo | el camino del click no alcanza el spy de `window.scrollTo` en este entorno |
| `SurfacesLongTailBatch > pins all three layout roots, responsive state and child landing hooks` | ya usaba `waitForSelectors` sobre los tres roots; el selector del sidebar nunca aparece | desajuste de atributos del root de `SidebarSurface` (`[data-collapsed="true"][data-stacked="false"][data-bordered="false"]`), no timing |

**Punteros de registro.** WO-EVI-02, entrada de progreso **2026-09-14 16:40**, nombra el
conjunto base-red verificado test por test contra el pin 25d245167, e incluye por nombre:
`LayoutBatch x2`, `CommunicationBatch PresenceBar`, `FloatButton backtop`,
`AlertDialog.real-engines`, `LiveFeed.engine-advanced`, `EmptyState`. Cita: *"Base-red ownership
routes to the family cuts that own each pattern (FAM-05/06/07/08 wave) and is standing evidence
here, not a waived gate."*

`Display1Batch` y `SurfacesLongTailBatch` **no** están en esa lista de 16 pero mi A/B prueba que
son preexistentes igual. Propuesta de registro:

> WO-EVI-02 — BASE-RED AMPLIADO (D6-2c-ii-RED, 2026-09-15): dos aserciones más del conjunto
> preexistente, A/B verificado en el HEAD prístino del lote 2c-ii (fallan idénticas allí).
> (1) `Display1Batch > Card > modern: loading renders cover/skeleton/...`: la rama de carga del
> Card modern renderiza `loading-content > loading-overlay > spinner` y nada más; la receta pide
> además `cover`, `skeleton` y `skeleton-bar`. Dueño propuesto: el corte de familia que posee
> card (WO-FAM-06), que decide si la anatomía de carga se entrega o la receta se retira.
> (2) `SurfacesLongTailBatch > pins all three layout roots...`: el root de `SidebarSurface` no
> presenta `[data-collapsed][data-stacked][data-bordered]` como la receta los pide. Dueño
> propuesto: el corte que posee sidebar-surface.

---

## E · profile-defaults — ÚNICOS rojos del lote en mi grupo (3 aserciones, (ii) RE-ANCHORED)

A/B: estas dos suites pasan **verdes en HEAD** (`2 passed` en la corrida de A/B). Son del lote.

Causa medida: `tenantDecidedChannels` lee `FIRST_PARTY_ARTIFACT_RUNTIME[slug].decidedChannels`,
o sea el bloque runtime generado del artefacto. Hoy dice, para las tres verticales:
`["animation.intensity","card.paddingDensity"]`. El tema autorado retirado hacía que bithire
decidiera además `accent.badgeShape`; **ningún preset lo decide**, así que ese canal está
legítimamente ABIERTO ahora. No es pérdida de capacidad: es el contrato nuevo.

| aserción | re-ancla |
|---|---|
| `index > refuses the same selection once the tenant decides that channel` | pasa de `badgeShape` (canal ya abierto) a `animateEntrance`, que habla por `animation.intensity`, que bithire **sí** decide. La ley se mide sobre un canal que la vertical realmente posee |
| `index > reads a code-owned vertical's authored decisions and the artifact density` | asevera el conjunto medido en **los dos lados**: `animation.intensity` true, `card.paddingDensity` true, y `accent.badgeShape` **false**. La adjudicación pinea los tres veredictos: density refused, animateEntrance refused, badgeShape **admitted** |
| `real-provider > refuses selections that contradict a decided channel, in all three verticals` | `SELECTION` pasa de `{density, entranceStyle, entranceDuration}` a `{density, sectionSpacing, animateEntrance}`: los tres hablan por canales que las tres verticales deciden, así que **todos** los veredictos siguen teniendo que refusar. La selección se re-apunta, no se acorta |

Agregué además `index > admits a selection on a channel no preset decides` (la otra mitad de la
misma ley): `badgeShape` ahora se admite, y si un preset lo decide más adelante ese test enrojece.

**Dos trampas de coincidencia que encontré y cerré** (no las dejé como spot-check frágil):
- `real-provider` afirmaba `resolved.entranceDuration !== 4000`. Al re-apuntar la selección, medí
  que las bases difieren por vertical (density: bithire `comfortable`, rottay `compact`, evnto
  `spacious`), así que ningún literal único sirve. Lo reemplacé por un bucle **por campo**: donde
  la selección difiere de la base, el valor seleccionado no puede haber aterrizado. Es a prueba
  de coincidencia y cubre los tres campos, no uno.
- `index` afirmaba `not.toHaveTextContent('false')` sobre `animateEntrance`, y el valor resuelto
  del perfil `generic.default` es justamente `false`. Lo reemplacé por una comparación contra el
  MISMO tenant sin selección: el valor tiene que ser idéntico, así que lo que lo sostuvo fue el
  rechazo y no un default afortunado.

---

## F · Verificación

```
pnpm vitest run <los 16 archivos>   → Test Files 3 failed | 13 passed (16)
                                      Tests      3 failed | 234 passed (237)
```
Los 3 son exactamente los de §D.2, preexistentes y sin tocar.

```
pnpm exec tsc --noEmit              → 0 errores
pnpm exec eslint <archivos tocados> → 0 errores
```

Log completo: `red/overlay-vitest.log`. A/B: `red/head-dom.log`, `red/head-dom2.log`.

## G · Archivos

**Producto: NINGUNO.**

**Tests (13):** Dropdown / HoverCard / Sheet / Tour / ConfirmDialog / AlertDialog
`.causality.integration.test.tsx`, `AlertDialog.real-engines.test.tsx`,
`LayoutBatch.contract.test.tsx`, `CommunicationBatch.contract.test.tsx`,
`PatternLiveFeed.engine-advanced.test.tsx`, `EmptyState.test.tsx`,
`profile-defaults/overrides/tests/index.test.tsx`, `.../real-provider.test.tsx`.

**Sin tocar a propósito (3):** `Display1Batch.contract.test.tsx`, `FloatButton.test.tsx`,
`SurfacesLongTailBatch.contract.test.tsx`.
