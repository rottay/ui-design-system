# F2A-1 — re-medición con el instrumento corregido (post-Lote F, pre-C/D/E)

Supersede, para todo conteo de lectores, a `baseline.md`/`data.json` (F2A-0
original). Ese documento queda como registro histórico del árbol de esa
fecha; no se edita in-place porque el eje de medición cambió (ver
`data-v2.json` → `formatDecision`).

## 0. Ley adoptada (Codex + DT)

La revisión Codex encontró que incluso la "tabla corregida" de Opus
subcuenta lectores: `--ds-type-scale` tenía 26 en el instrumento viejo
(grep sobre los 3 artefactos renderizados), 35 en la tabla auxiliar de
Opus, pero el **censo AST canónico** (`scripts/foundation/tokens/customization/surface/`)
encuentra **44 reales (33 CSS + 11 TS)**. Reproducido exacto en esta
re-medición: ver §1.

Ley: el instrumento de consumidores de F2A es el censo AST canónico, con el
universo nombrado exacto (`packages/core/src` + `packages/showroom/src`),
nunca "global".

## 1. Paso 1 — re-medición de las 34 asimétricas

**Método** (citado en `data-v2.json` → `meta`/`law`):

- **core**: `scripts/foundation/tokens/customization/surface/report/index.json`
  (ya fresco, verificado `--check` OK en este mismo packet) →
  `rows["<canal>"].reads.{css,ts}`. Ese censo recorre `packages/core/src`
  completo vía PostCSS (declaraciones CSS) + TypeScript AST
  (`classifyTsLiterals`), excluye tests/stories/fixtures y excluye
  `facade/artifacts` (los 3 artefactos renderizados NUNCA cuentan aquí).
- **showroom**: `packages/showroom/src` no está cubierto por ese censo (sólo
  camina `packages/core/src`). Re-escaneado en
  `/private/tmp/f2a1-remedicion.mjs` con la MISMA metodología —
  `classifyTsLiterals` **importada y reutilizada del propio módulo del
  censo**, nunca reimplementada; PostCSS `var(--ds-x)` idéntico para CSS —
  sobre los 354 archivos `.css/.ts/.tsx` de showroom (excluye tests/stories
  con el mismo patrón `isTestPath`).

**Verificación de fidelidad del instrumento** (antes de confiar en él para
las 34): reproduje exacto el número que cita Codex —

```
node /private/tmp/f2a1-remedicion.mjs
→ type.scale: core.css=33, core.ts=11, core.total=44, showroom=0, prodTotal=44
```

**33+11=44**, byte-exacto contra la cifra de Codex. Cross-check independiente
adicional: mi conteo de showroom, calculado por mi propio script sin mirar
la tabla de Opus, coincide **exacto en las 24 raíces con dato de showroom**
contra la columna "s" de `opus-f2a1-tabla-medida.md` (delta 0 en las 24) —
confirma que la parte de showroom del instrumento es correcta de forma
independiente.

**Resultado completo**: `data-v2.json` (las 34, con clase, core/showroom/
prodTotal, comparación byte-a-byte contra la tabla de Opus) y
`data-v2-raw-64.json` (las 64 raíces del set vigente, no sólo las 34 —
paso 1 pide "para cada raíz del set vigente").

**Deltas materiales encontrados** (core, contra la tabla de Opus; todos los
deltas de showroom fueron 0 — ver arriba):

| raíz | clase | core viejo (Opus) | core nuevo | delta |
|---|---|---:|---:|---:|
| type.scale | Clase 5 | 35 | 44 | **+9** |
| ramp.seed.success | Clase 4 | 274 | 282 | +8 |
| effect.intensity | Clase 5 | 57 | 62 | +5 |
| spacing.step | Clase 2 | 543 | 548 | +5 |
| state.delta.focus | Clase 2 | 55 | 58 | +3 |
| tier.overlay.border | Clase 5 | 599 | 602 | +3 |
| tier.overlay.bg | Deuda muerta | 12 | 14 | +2 |
| control.ratio.radius | Escalada (dec.19) | 7 | 8 | +1 |
| ramp.seed.error | Clase 4 | 424 | 422 | −2 |

Las 10 `por-crear` (Clase 1) miden **0/0** con el instrumento nuevo también
— cero cambio, coherente con Lote A. Las demás 15 raíces (incluidas las 5
de Identidad del vertical, exactas 6/3/20/14/6) no movieron ni un lector.

## 2. Paso 2 — `collapses` de `tier.raised.fg` / `tier.overlay.bg`

No requiere re-ejecutar el clasificador A/B/C/D original (ese script vivió
en `/private/tmp`, fuera del repo, y ya no existe). Prueba mecánica en su
lugar, más fuerte que una re-medición aproximada:

```
git show --stat 96b610162 -- packages/core/src/foundation/tokens/css/facade/artifacts/bithire/index.css
→ 1 file changed, 5 deletions(-)
```

Los 5 borrados, verificados línea por línea contra el diff real: la cabeza
propia de `tier.raised.fg` (2 líneas), la cabeza propia de `tier.overlay.bg`
(1 línea) y `--ds-surface-overlay` (2 líneas, canal informativo que la
propia fila de `tier.overlay.bg` ya declaraba excluido de `collapses`).
`rottay`/`evnto` no aparecen en el diff del commit — byte-idénticos,
confirmado independientemente del claim del mensaje de commit.

`collapses` cuenta canales **distintos de la cabeza** que colapsan (por
valor/derivación) sobre esta raíz. Como el diff prueba que NINGÚN canal
fuera de las dos cabezas propias y de `--ds-surface-overlay` (ya excluido)
cambió de valor en todo el árbol compilado de bithire, la atribución A/B de
cualquier otro canal hacia estas dos raíces es idéntica antes y después del
lote — `collapses` es invariante por construcción, no una coincidencia a
falsificar con una re-medición aproximada. **73 bithire** (`tier.raised.fg`)
y **14 bithire** (`tier.overlay.bg`) quedan confirmados sin cambio. Notas
escritas en `root-catalog.json` (ver commit de este packet).

## 3. Paso 3 — veredicto por raíz: ¿cambia alguna clase?

**Ninguna clase cambia.** Verificado explícitamente, no asumido:

- **Clase 1** (10 `por-crear`): 0/0 con ambos instrumentos — sin cambio.
- **Clase 2** (`spacing.step`, `radius.base`, `state.delta.focus`,
  `scrim.opacity`): deltas +5/0/+3/0 en core, 0 en showroom. La clase la da
  `governedBy` (density.mode/spacing.rhythm/etc.), no el conteo de
  lectores — un +5 sobre 548 no cambia "cascada gobernada/intencional".
- **Clase 4** (`ramp.seed.*`): deltas −2/+8/0/0. El outlier ya documentado
  (`ramp.seed.accent` 6 lectores vs 225-433 de sus hermanas) se sostiene
  igual con los números nuevos (422-282 vs 6). Cierre por decisión 18/F5
  no se reabre.
- **Clase 5** (`tier.overlay.border`, `effect.intensity`, `type.scale`,
  `control.height`): deltas +3/+5/+9/0. `type.scale` es la corrección más
  grande (26→35→44) pero sigue siendo "anotación documental" — el conteo
  más alto refuerza, no cambia, el veredicto de que es una raíz muy leída
  con asimetría de declaración, no de uso.
- **Identidad del vertical** (`tier.accent.fg`, `gradient.recipe`,
  `control.ratio.fontSize`, `control.ratio.iconSize`,
  `control.ratio.lineHeight`): **delta 0 en las 5**, exacto. El instrumento
  corregido no mueve ni un lector aquí.
- **Deuda muerta confirmada** (`tier.raised.fg` 1, `tier.overlay.bg` 12→14):
  el veredicto de Lote F fue por CERO-DELTA DE VALOR (cadena de resolución
  probada igual antes/después), no por conteo de lectores — un lector más o
  menos en el conteo agregado no toca esa prueba. Sin cambio.
- **Escalada a owner** (`control.ratio.radius` 7→8, `glass.recipe` 6→6):
  ya resuelta por Decisión 19 del owner (clase "anti-puerta"), anterior a
  esta re-medición y sobre bases distintas (causal, no de conteo). Sin
  reapertura.
- **Fuera del set** (`type.leading` 27→27): exacto, sin cambio.

Ningún FRENA disparado — el brief anticipaba "esperado: ninguna" y así
midió.

## 4. Paso 4 — `tier.overlay.fg`: ¿el dato nuevo decide?

**No. Sigue condicional.** Su conteo no se movió (4 → 4, delta 0, exacto en
core y en showroom) — el instrumento corregido no aporta información nueva
sobre esta raíz. Lo que la mantiene condicional no es un conteo de lectores
sino la ausencia de evidencia A/B **renderizada** sobre el fallback
`inherit` en `semantic-surface.css:223`: eso es un hecho de runtime/pintura
que ningún censo estático de lectores (viejo o nuevo) puede decidir. Nota
añadida a la fila (ver `root-catalog.json`, exposureNote de
`tier.overlay.fg`).

## 5. Paso 5 — ripple + checks + `git status`

Ver el memo de cierre (`sonnet-f2a1-remedicion.md`) para los comandos
exactos corridos y sus resultados.

## Entregables

```
docs/f2a/medicion-f2a0/baseline-v2.md       este documento
docs/f2a/medicion-f2a0/data-v2.json         las 34 asimétricas: clase, core/showroom/prodTotal,
                                             comparación contra la tabla de Opus, delta, veredicto
docs/f2a/medicion-f2a0/data-v2-raw-64.json  las 64 raíces del set vigente (paso 1 completo)
```

Script de medición (fuera del repo, no forma parte de la entrega, resultado
ya volcado): `/private/tmp/f2a1-remedicion.mjs`.
