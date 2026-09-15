# D6-2c-ii-RED — grupo `inputs-b` (7 suites, 28 aserciones)

Write set: auto-complete, cascader, date-picker, time-picker, tree-select, transfer, color-picker
(sólo los 7 archivos de test). **Ningún archivo de producto tocado. Sin commits.**

## Correcciones a la pre-clasificación (medidas, no inferidas)

**C1 · R1 está mal enunciada en la política.** No es que "ningún deriver emite `--ds-focus-ring-color`":
la hoja de fundación lo declara DOS veces, y sólo el scope oscuro lo deriva.

| | declaración | efecto |
|---|---|---|
| `:root` (claro), `themes/default/index.css:816` | `--ds-focus-ring-color: #ECECEC` | constante fija |
| scope oscuro, `themes/default/index.css:2027` | `--ds-focus-ring-color: var(--ds-color-primary-400)` | sigue a la paleta |

Medido con dos semillas distintas sobre la misma familia:

| vertical | base | seed `#2F6B9A` | seed `#B00020` |
|---|---|---|---|
| rottay (dark-default) | `#a3a3a3` | **`#306B9A`** | **`#BB1C2B`** |
| bithire (light-default) | `#ECECEC` | `#ECECEC` | `#ECECEC` |
| evnto (light-default) | `#ECECEC` | `#ECECEC` | `#ECECEC` |

`--ds-color-primary` SÍ se mueve en las tres: lo único atascado es el anillo. La prosa de la
propia hoja (líneas 814-815) nombra la premisa que este lote invalidó: *"Every first-party tenant
re-declares this as var(--ds-color-primary) in its own artifact block (rottay dark/light, bithire,
evnto — W8)"*. Esos temas están retirados, así que la constante clara es lo que queda.

**C2 · el axe NO es el conteo que dice el rojo.** El `expect` corta en el PRIMER scope que falla, así
que el log del DT muestra 1 scope por familia. Medidos los cuatro scopes de las 7 familias: **21 de
28 pares (familia, scope) tienen hallazgo**, no 7. Y el A/B contra el árbol prístino da **0
hallazgos en los 28 pares**: todo el axe de este grupo es causado por el lote, ninguno heredado.

**C3 · `palette.neutral-temperature` es inerte en las DOS verticales claras**, no sólo en bithire.
Mismo enmascaramiento por corte en el primer fallo.

## Disposición por aserción

### (ii) RE-ANCHORED — 15 aserciones · causa R4
El arma probaba el valor que el preset de bithire ya decide, así que la mutación restataba la
baseline. Re-ancladas a un valor que **ningún** preset decide, manteniendo `in: VERTICALS` y la
fuerza original.

`density.mode: 'compact'` → `'spacious'` (7 aserciones: las 7 familias).
Medido sobre auto-complete, target `height`:

| vertical | base | `compact` | `normal` | `spacious` |
|---|---|---|---|---|
| rottay | 38 | 32 | 38 (=base) | **43** |
| bithire | **27** | **27 (=base)** | 32 | **36** |
| evnto | 38 | 32 | 38 (=base) | **43** |

`states.emphasis: 'strong'` → `'subtle'` (7 aserciones: las 7 familias).
Medido, target `disabledOpacity`:

| vertical | base | `subtle` | `medium` | `strong` |
|---|---|---|---|---|
| rottay | 0.6 | **0.68** | 0.6 (=base) | 0.5 |
| bithire | **0.5** | **0.68** | 0.6 | **0.5 (=base)** |
| evnto | 0.6 | **0.68** | 0.6 (=base) | 0.5 |

`tree-select > indents a child row by its level` (1 aserción): su brazo de control era
`density.mode: 'compact'` sobre bithire — misma coincidencia. Re-anclado a `'spacious'`. Las dos
aserciones de dirección de esa fila (LTR/RTL) no se tocaron: ya pasaban.

### (iv) REGISTERED NEW — 4 aserciones · el anillo de foco
`palette.seeds moves focusRing` en auto-complete, cascader, time-picker, tree-select.
El arma se estrecha a `in: ['rottay']`, la única vertical donde la propiedad existe, con la causa
escrita al lado; y **se agrega un pin vivo por suite** que asevera el hueco sobre bithire: el anillo
queda en `#ECECEC` con y sin semilla, mientras `--ds-color-primary` sí se mueve. Ese pin enrojece el
día que el carril le dé productor al scope claro. Población no perdida: lo que salía del arma entra
como aserción propia.

Nota sobre time-picker: su arma ya excluía a rottay (`in: ['bithire','evnto']`), presumiblemente
porque el chrome autorado de rottay la outrankeaba. Retirado ese chrome, rottay es hoy la única
vertical donde la semilla alcanza el anillo, así que el arma se invierte en vez de morir.

### (i) REGISTERED — 1 aserción · la rampa neutral sin productor
`date-picker > palette.neutral-temperature moves cellHover`. Ya lo posee el registro de la ronda
anterior ("bithire no autora ramp neutral, `--ds-color-neutral-*` queda sin productor").
Causa exacta: `deriveNeutralAxis` (`.../derivation/palette/neutral-temperature/index.ts:69`) sólo
inclina una `palette.ramps.neutral` **autorada**, y ningún preset autora ramps.

Medido en las dos verticales que el arma declaraba, sobre los tres stops del dominio:

| vertical | base | `warm` | `cool` | `neutral` | `--ds-color-neutral-100` |
|---|---|---|---|---|---|
| bithire | `rgb(245,245,245)` | igual | igual | igual | `#f5f5f5` |
| evnto | `rgb(245,245,245)` | igual | igual | igual | `#f5f5f5` |

El arma se retira (sujeto muerto nombrado: el eje no tiene nada que inclinar) y **se reemplaza por
un pin vivo** que asevera la inercia en AMBAS verticales y el valor de fundación de la rampa.
Enrojece cuando el carril entregue la rampa.

### (iv) REGISTERED NEW — 7 aserciones · contraste axe
`has no serious or critical axe violation in any gated vertical mode`, una por familia.
Todas lot-caused (A/B: 0 hallazgos en los 28 pares del árbol prístino). Pineadas por `id`, `impact`
y **conteo de nodos** por scope, de modo que otro tipo de violación, un nodo más, o un hallazgo en
un scope pineado en cero, enrojecen.

Medición pineada (nodos de `color-contrast`, impact `serious`; AXE_SCOPES en orden):

| familia | rottay dark | bithire light | bithire dark | evnto light |
|---|---|---|---|---|
| auto-complete | 3 | 0 | 3 | 0 |
| cascader | 4 | 4 | 4 | 4 |
| date-picker | 4 | 0 | 4 | 0 |
| time-picker | 4 | 0 | 4 | 0 |
| tree-select | 3 | 2 | 3 | 2 |
| transfer | 2 | 7 | 9 | 7 |
| color-picker | 0 | 0 | 1 | 0 |

## Texto propuesto de registro (para que lo entre el coordinador)

> **WO-DER-06 · `--ds-focus-ring-color` no tiene productor en el scope claro.**
> `foundation/tokens/css/foundation/themes/default/index.css` lo declara dos veces: en `:root`
> (línea 816) como la constante `#ECECEC`, y en el scope oscuro (línea 2027) como
> `var(--ds-color-primary-400)`. Sólo la segunda sigue a la paleta. Con los temas autorados
> retirados —que lo re-declaraban como su primary, según dice la propia prosa de las líneas
> 814-815— toda vertical light-default queda con el gris fijo. Medido: rottay `#a3a3a3` →
> `#306B9A` con semilla; bithire y evnto `#ECECEC` con cualquier semilla, mientras
> `--ds-color-primary` sí se mueve. Consecuencia de accesibilidad: el anillo de bithire mide
> **1.18:1** contra su canvas `#FFFFFF` y el de evnto ~**1.06:1** contra `#fafafa`, bajo el piso
> 3:1 de WCAG 1.4.11. Remedio de una línea (derivar el scope claro igual que el oscuro), pero
> mueve `declared-defaults` (proyección generada y gateada) y las baselines de contraste, así que
> es del coordinador. Evidencia: 4 armas `palette.seeds moves focusRing` estrechadas a rottay y 4
> pines vivos en auto-complete, cascader, time-picker, tree-select.

> **WO-DER-06 · contraste axe lot-caused en las familias de campo.** 21 de 28 pares
> (familia, scope) reportan `color-contrast` serio donde el árbol prístino reportaba cero. Pineado
> por id, impact y conteo de nodos en las 7 suites de `inputs-b`. Es la misma clase mode-aware /
> par ink-ground ya registrada, con la población ampliada: el `expect` cortaba en el primer scope
> y ocultaba entre 1 y 3 scopes por familia.

## Archivos tocados

**Tests (7)** — los 7 de mi write set. **Producto: ninguno.**

## Verificación
- `pnpm vitest run` sobre las 7 suites → ver `inputs-b-vitest.log`.
- `pnpm exec tsc --noEmit` → 0 errores.
- `pnpm exec eslint` sobre las 7 → exit 0.
