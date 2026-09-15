# D6-2c-ii-RED — grupo `inputs-a` (12 suites, 37 aserciones rojas)

Write set: las 12 familias de input de `$S/red/g-inputs-a.txt`. Sólo tests; **cero archivos de producto tocados**.

## Resumen por disposición

| disposición | aserciones |
|---|---|
| (ii) RE-ANCHORED | 20 |
| (iv) REGISTERED NEW | 17 |
| (i) / (iii) | 0 |

Ninguna aserción borrada. Ningún umbral bajado. Ninguna población achicada sin que la mitad retirada quede aseverada en una fila propia.

## (ii) RE-ANCHORED — el par de opciones coincidía con la decisión del preset (causa R4)

Los presets decidenexactamente el valor que el brazo mutaba, así que la mutación era un no-op. Medí las dos caras y elegí una opción que **ningún** preset declara.

Presets medidos (`src/foundation/presets/verticals/<v>/document/index.json`):

| eje | rottay | bithire | evnto | opción nueva |
|---|---|---|---|---|
| `density.mode` | normal | **compact** | normal | `spacious` |
| `states.emphasis` | medium | **strong** | medium | `subtle` |
| `shape.button-style` | soft | **sharp** | soft | `pill` |

Medición de una cara y la otra (bithire, Button):

| lectura | base (= preset) | opción nueva |
|---|---|---|
| `padding` (`density.mode`) | 11.985px | **16.215px** (`spacious`); `normal` da 14.1px |
| `press` (`states.emphasis`) | matrix(0.965) | **matrix(0.99)** (`subtle`); `medium` da 0.98 |
| `trackRadius` (`shape.button-style`, Toggle) | 2px | **9999px** (`pill`) |

Aserciones re-ancladas (16):
- Button: `density.mode moves padding`, `states.emphasis moves press`
- Checkbox: `density.mode moves size`, `states.emphasis moves press`
- Radio: `density.mode moves size`, `states.emphasis moves press`
- Toggle: `density.mode moves width`, `shape.button-style moves trackRadius, thumbRadius`
- Select: `density.mode moves height`, `states.emphasis moves disabledOpacity`
- Textarea: `density.mode moves inset`
- TagInput: `density.mode moves inset`
- OTPInput: `density.mode moves size`
- PasswordInput: `density.mode moves height`
- Mentions: `states.emphasis moves disabledOpacity`
- Form: `density.mode moves itemGap`

Más cuatro re-anclajes de forma distinta, abajo.

## (iv) REGISTERED NEW — cuatro huecos reales, todos con A/B contra HEAD

### N1 · `--ds-focus-ring-color` no tiene productor (2 aserciones)
`Button > draws a focus ring that clears 3:1 against the canvas in every vertical`, y es la misma causa que gobierna los `palette.seeds moves focusRing` de otros grupos.

Su única declaración en todo el árbol es la constante de fundación `src/foundation/tokens/css/foundation/themes/default/index.css:816` = `#ECECEC`. Ningún deriver del compilador la emite; los temas autorados retirados la autoraban como su primary.

| vertical | HEAD | ahora | canvas | ratio |
|---|---|---|---|---|
| rottay | `rgb(255,255,255)` | `#a3a3a3` | `#0b1220` | pasa 3:1 |
| bithire | `rgb(58,111,176)` | `#ECECEC` | `#FFFFFF` | **1.18:1** |
| evnto | `rgb(23,23,23)` | `#ECECEC` | `#fafafa` | **1.13:1** |

El piso 3:1 sigue corriendo sobre rottay. Las otras dos quedan pineadas con su ratio medido (`toBeCloseTo(debt, 1)`), así que enrojecen si el anillo mejora o empeora. **Ojo:** el test cortaba en la primera vertical que fallaba, así que bithire tapaba a evnto; evnto nunca había aparecido en el rojo reportado.

Texto propuesto para el registro:
> WO-DER-06 / carril de derivación — `--ds-focus-ring-color` sin productor. Medido 2026-09-15 sobre el árbol 2c-ii: el canal se declara sólo como constante de fundación (`#ECECEC`) y ningún deriver lo emite, así que el anillo de foco de bithire mide 1.18:1 y el de evnto 1.13:1 contra su propio canvas (WCAG 2.2 1.4.11 pide 3:1). En HEAD cada vertical lo recibía de su tema autorado como su primary. Obligación: un deriver de `states.focus-style`/paleta debe emitir `--ds-focus-ring-color` desde la semilla. Evidencia pineada en `Button.causality.integration.test.tsx` (`RING_DEBT`).

### N2 · `palette.neutral-temperature` es inerte en las tres verticales (4 aserciones)
`Select > moves tagInk`, `PasswordInput > moves ink`, `Form > moves labelInk`, `FormField > moves labelInk`.

`deriveNeutralAxis` aplica el lean **sólo a un `palette.ramps.neutral` AUTORADO**, y ningún documento de preset autora una rampa neutral. Medido sobre `--ds-color-neutral-700` con los tres stops (`warm`/`cool`/`neutral`):

| vertical | HEAD base → warm | ahora (todos los stops) |
|---|---|---|
| bithire | `#474747` → `#4B4640` | `#404040` inmóvil |
| evnto | `#404040` → `#443F39` | `#404040` inmóvil |
| rottay | — | `#cbd5e1` inmóvil |

Es un control del kit que hoy no hace nada para ningún tenant de primera parte. Retiré el brazo de la tabla de causalidad (no puede mover nada en ningún lado) nombrando el sujeto muerto, y pineé la inercia medida en una fila propia por familia.

Texto propuesto para el registro:
> WO-DER-06 / carril de derivación — `palette.neutral-temperature` sin sujeto. Medido 2026-09-15: `deriveNeutralAxis` sólo inclina una `palette.ramps.neutral` autorada y ningún preset autora una, así que los tres stops dejan `--ds-color-neutral-700` inmóvil en las tres verticales. En HEAD el mismo brazo movía bithire `#474747`→`#4B4640` y evnto `#404040`→`#443F39`. Obligación: derivar la rampa neutral desde el preset para que la temperatura tenga qué inclinar.

### N3 · `shape.control-height` llega a su canal y no al botón, en bithire (1 aserción)
`Button > shape.control-height moves height and holds background`.

| stop | `--ds-control-height-scale` | `min-block-size` bithire | rottay | evnto |
|---|---|---|---|---|
| compact | 0.9 | 36px | 36px | 36px |
| standard | 1 | 36px | 37.5px | 37.5px |
| tall | 1.15 | **36px** | 43.125px | 43.125px |

La decisión mueve su canal en bithire; el botón no la lee. En HEAD bithire movía 36 → 37.26px. El brazo sigue aseverado a plena fuerza en rottay y evnto; bithire queda pineado en una fila propia.

Texto propuesto para el registro:
> WO-DER-06 / carril de derivación — `shape.control-height` sin lector en el botón de bithire. Medido 2026-09-15: `--ds-control-height-scale` toma 0.9/1/1.15 y `min-block-size` queda en 36px para los tres stops, mientras rottay y evnto van 37.5→43.125. En HEAD bithire movía 36→37.26. La pila compact×0.94×compact deja el alto calculado bajo el piso de 36px en todos los stops.

### N4 · el borde de hover del campo es el borde de reposo (1 aserción)
`Mentions > paints hover from the interaction kernel state and yields to focus`.

`--ds-input-border` y `--ds-input-border-hover` resuelven ambos a `#d4d4d4` en bithire: ninguno tiene productor sin rampa neutral autorada. En HEAD bithire medía rest `#D7E2EA` y hover `#86A6C2`. rottay sigue moviendo (`#334155` → `#1e293b`), así que el cableado del kernel está intacto y el hueco es la rampa. evnto ya era inerte en HEAD (`rgba(0,0,0,0.12)` en ambos), así que ahí es preexistente.

La mitad de foco nunca se rompió y queda aseverada a plena fuerza en las dos verticales; la mitad de hover se asevera en rottay y se pinea en bithire.

### N5 · `states.emphasis` no mueve el tinte de hover del toggle en evnto (1 aserción)
Al re-anclar el brazo a `subtle`, bithire pasó y apareció evnto, que estaba tapado. Medido: `fill` = `rgb(23,23,23)` y `hoverFill` = `color(srgb 0.0902 0.0902 0.0902)` — **el mismo color** — en los cuatro stops de emphasis. El `press` sí se mueve (0.98 → 0.99), y eso queda aseverado a plena fuerza para evnto en una fila propia.

## Nota de método: el lazo axe tapaba scopes

La aserción original era `for (const scope of AXE_SCOPES) expect(seriousFindings(...)).toEqual([])`, que **corta en el primer scope que falla**. Los 12 rojos reportados por la suite completa nombraban un solo scope por familia; al pinear por scope aparecieron los demás. Ejemplo: Toggle reportaba `bithire light`, y la medición completa da `bithire dark: 13, bithire light: 3, evnto light: 5`.

La forma nueva junta los cuatro scopes y compara el mapa entero de una: cualquier regla seria que NO sea `color-contrast` sigue teniendo que ser vacía en todos los scopes, y el conteo de nodos de contraste está pineado exacto por scope, así que crece o baja y la fila enrojece.

### Deuda de contraste medida, por familia y scope (nodos)

| familia | rottay dark | bithire light | bithire dark | evnto light |
|---|---|---|---|---|
| Button | 2 | — | 3 | — |
| Checkbox | — | 1 | 4 | 1 |
| Form | — | 2 | 5 | 2 |
| FormField | — | — | 4 | 1 |
| Mentions | 2 | — | 2 | — |
| OTPInput | 6 | — | 7 | — |
| PasswordInput | 2 | 1 | 4 | 2 |
| Radio | — | 1 | 15 | 1 |
| Select | — | 3 | 5 | 3 |
| TagInput | 5 | — | 6 | 1 |
| Textarea | — | — | 1 | — |
| Toggle | — | 3 | 13 | 5 |

Las causas son las dos ya medidas por el coordinador: R2 (la tinta de chrome llega del par del sidebar) y R3 (el ground claro del tenant cascadea al bloque oscuro). `bithire dark` es el scope más castigado en las doce familias, que es lo que R3 predice.

## Correcciones a la pre-clasificación del DT

1. **La clase 2 del brief da por sentado que "el par probado ahora coincide" o "el alcance se perdió".** Medido, hay una tercera forma en mi grupo: `shape.control-height` en bithire **mueve su canal y no mueve la caja** (N3). No es coincidencia de stops ni pérdida de decisión: es un lector que dejó de leer.
2. **`palette.neutral-temperature` no es un caso por vertical.** El brief lo trata dentro de la masa de causalidad; medido, el control es inerte en las **tres** verticales y en HEAD movía en dos. Es un control del kit sin sujeto, no una coincidencia de preset (N2).
3. **El conteo de rojos de axe subestima la deuda.** El lazo cortaba en el primer scope; la deuda real de mis 12 familias son 34 scope-familia con nodos de contraste, no 12.

## Archivos tocados

**Tests (12):** los mismos 12 de mi write set, ninguno más.

**Producto: ninguno.** Las cuatro (iv) piden cambios de deriver o de skin que moverían bytes emitidos y baselines de gates; quedan registradas, no aplicadas, según la política.

## Sondas
Cuatro sondas temporales (`zzprobe.integration.test.tsx` en button, toggle, select y mentions, más copias en el árbol prístino de HEAD para los A/B). **Todas borradas**; `git status` no las muestra.

## Verificación

| comando | resultado |
|---|---|
| `pnpm vitest run` sobre las 12 suites | **12 archivos, 151 tests, 0 rojos** (`inputs-a-vitest.log`) |
| `pnpm exec tsc --noEmit -p tsconfig.tests.json` | 0 errores en todo el proyecto |
| `pnpm exec eslint <12 archivos>` | exit 0, 0 errores |
| `git status --porcelain` | sólo mis 12 tests modificados; sin sondas residuales, sin commits |

Partida: 37 rojos. Llegada: 0. Ninguno silenciado — 20 re-anclados sobre el contrato neutro+preset y 17 pineados a su estado medido con la cita del registro.

## Tabla de disposición por aserción

| # | aserción | disp. | evidencia |
|---|---|---|---|
| 1 | Button `density.mode moves padding` | ii | 11.985 → 16.215 (`spacious`) |
| 2 | Button `states.emphasis moves press` | ii | 0.965 → 0.99 (`subtle`) |
| 3 | Button `shape.control-height moves height` | iv | N3: canal 0.9/1/1.15, caja 36px fija |
| 4 | Button `focus ring clears 3:1` | iv | N1: bithire 1.18:1, evnto 1.13:1 |
| 5 | Button axe | iv | R2/R3: rottay dark 2, bithire dark 3 |
| 6-7 | Checkbox `density.mode moves size`, `states.emphasis moves press` | ii | idem 1-2 |
| 8 | Checkbox axe | iv | 4/1/1 |
| 9-10 | Radio `density.mode`, `states.emphasis` | ii | idem |
| 11 | Radio axe | iv | 15/1/1 |
| 12 | Toggle `states.emphasis moves hoverFill, press` | ii + iv | rottay/bithire mueven; evnto pineado (N5) |
| 13 | Toggle `density.mode moves width` | ii | `spacious` |
| 14 | Toggle `shape.button-style moves trackRadius, thumbRadius` | ii | 2px → 9999px (`pill`) |
| 15 | Toggle `stays a full pill…` | ii | re-anclado: 8/2/8px por silueta declarada + 9999px con `pill` |
| 16 | Toggle axe | iv | 13/3/5 |
| 17 | Select `palette.neutral-temperature moves tagInk` | iv | N2 |
| 18-19 | Select `states.emphasis`, `density.mode` | ii | idem |
| 20 | Select axe | iv | 5/3/3 |
| 21 | Textarea `density.mode moves inset` | ii | `spacious` |
| 22 | Textarea axe | iv | bithire dark 1 |
| 23 | TagInput `density.mode moves inset` | ii | `spacious` |
| 24 | TagInput axe | iv | 6/1/5 |
| 25 | OTPInput `density.mode moves size` | ii | `spacious` |
| 26 | OTPInput axe | iv | 7/6 |
| 27 | PasswordInput `palette.neutral-temperature moves ink` | iv | N2 |
| 28 | PasswordInput `density.mode moves height` | ii | `spacious` |
| 29 | PasswordInput axe | iv | 4/1/2/2 |
| 30 | Mentions `states.emphasis moves disabledOpacity` | ii | `subtle` |
| 31 | Mentions `paints hover…` | ii + iv | N4: rottay a plena fuerza, bithire pineado |
| 32 | Mentions axe | iv | 2/2 |
| 33 | Form `density.mode moves itemGap` | ii | `spacious` |
| 34 | Form `palette.neutral-temperature moves labelInk` | iv | N2 |
| 35 | Form axe | iv | 5/2/2 |
| 36 | FormField `palette.neutral-temperature moves labelInk` | iv | N2 |
| 37 | FormField axe | iv | 4/1 |
