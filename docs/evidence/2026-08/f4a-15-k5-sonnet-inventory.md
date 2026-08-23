# F4A-15 / K5 — inventario falsificable de `CHROME.table` (Sonnet, READ-ONLY)

Mapper mecánico. Codex es DT. **K4 no tocado** (cercado esperando Kimi — no
lo nombro más abajo salvo para deslindar). HEAD auditado
`9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (verificado con `git rev-parse
HEAD`, coincide exacto con el pedido). Worktree limpio (`git status
--short` vacío, verificado antes y después). **Cero escritura en el repo,
cero build/generador/test corrido, cero mutación git.** Todo lo medido sale
de `node -e "..."` (nunca un archivo de script — sólo `import()` en caliente
de los módulos reales del repo, imprimiendo a stdout) y de lectura directa
de fuente. Los únicos archivos que escribí en toda la sesión son estos dos:
este informe y su flag `.ready`. (Nota de higiene: dos redirecciones `>`
mías a `/tmp/...` — que en macOS resuelve a `/private/tmp/...` — se
crearon por error mecánico y se borraron de inmediato con `rm`, antes de
escribir una sola línea de este informe; no queda rastro, confirmado con
`ls`.)

**No es brief de implementación.** No propone valores nuevos, no adjudica,
no cierra nada.

---

## 0. Comandos read-only ejecutados (reproducibles)

```
git rev-parse HEAD
git status --short
node -e 'import(".../manifest/mirror-parity/index.mjs'); import(".../manifest/variant-parity/index.mjs')
  → build(CORE_ROOT) — doc completo recomputado EN VIVO desde HEAD, nunca leído
    de manifest/generated/variant-parity.json cacheado
  → authoredLeafPaths + pathIndex + parseDocblocks + scopeOfBlock, la MISMA
    maquinaria que analyzeSource() usa internamente, para poder devolver la
    LISTA de hojas sin tag (analyzeSource sólo devuelve el conteo,
    coveredCount) — sin reimplementar la identidad de hoja ni el criterio de
    cobertura por scope-más-cercano.
grep/read manual: brand-themes/{rottay,bithire,evnto}/index.ts (secciones
  CHROME.table / OVERLAY.chrome.table), variant-parity.baseline.json,
  docs/f4a/mapa-familia-canales.{json,md}, docs/f4a/roster-variantes.md,
  data-table.css (skin consumer), PALETTE seeds de bithire/evnto.
shasum -a 256 sobre los insumos (tabla §1).
```

## 1. Hashes de insumos relevantes (verificados, no supuestos)

| archivo | SHA-256 |
|---|---|
| `packages/core/src/foundation/tokens/ts/presentation/brand-themes/rottay/index.ts` | `7e38d1bc6bc88f54fc6c2e45922133f8c2e3d34a0d90bc0fadcbba57970cb6e7` |
| `packages/core/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts` | `cd2a39fef4a3a360be6e2abe3406dd7fb53b4aa8eb2c25d3970d2f4a3f0ba9e6` |
| `packages/core/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts` | `55758dff5edc03fc9f0afaa529cbc73f74db84d64acc5b9326a4ce7a850b53ad` |
| `packages/core/manifest/mirror-parity/index.mjs` | `e322fde57f65a6598ee5cebb319e3674b55e9eebf647aecfd6784dcbaf2d3e2a` |
| `packages/core/manifest/variant-parity/index.mjs` | `463111ac45c8d982c909a585bcf746cd7233b5d2b727e4329adf3495b70d6680` |
| `packages/core/manifest/variant-parity/variant-parity.baseline.json` | `6ae848db429f35cbd7d85ef61ef6774def6c312a367d0eb29ac707deb5d6c39a` |
| `packages/core/manifest/cascade/root-catalog.json` | `35a6912f709f71859eeb7ac7222dc01d8cfb44a0ab11054b9179a13d7e3d6bad` |
| `docs/f4a/mapa-familia-canales.json` | `78b9192f5d727bfbe5800166d465cb879cfacb61b649bbff77a83ef00a03fd5f` |
| `docs/f4a/roster-variantes.json` | `7c8f562b3fb799fe3aff063c7b6402f63267ebb96062fed9c8a0a90f1427f09a` |

Freshness probada por construcción, no supuesta: `build(CORE_ROOT)` corrido
en vivo contra estos mismos `index.ts` reprodujo, HOY, exactamente los
contadores que `docs/ROADMAP-EJECUCION-2026-08-19.md` §13 selló al cierre de
F4A-13: `universe=2559 intersection=342 positionIntersection=2526
divergentSlots=33 untaggedAuthoredLeaves=40 tagRegistry.count=4099
leaves={rottay:1756,bithire:1504,evnto:395}`. Coincide dígito a dígito.

---

## (1) Reproducción del total 40 — enumeración completa

**Confirmado: 40/40, exacto, y las 40 son `CHROME.table.*`/`OVERLAY.chrome.table.*`
sin excepción (0 falsos positivos fuera de la familia table).** Por tenant:
**bithire 36, evnto 4, rottay 0.**

### bithire — 36 hojas sin tag (todas en modo BASE, `CHROME.table.*`)

Ninguna tiene docblock ni de scope ni de placeholder — silencio total, no
sólo "sin domicilio asignado". Columna `raíz-viva` marca las que su valor
literal coincide byte-exacto con una raíz `PALETTE.*` ya autorada en el
mismo archivo (ver §5):

| keypath | línea | valor/expresión | raíz-viva coincidente |
|---|---|---|---|
| `CHROME.table.actionBg` | 7271 | `"#FFFFFF"` | — |
| `CHROME.table.actionBorder` | 7272 | `"color-mix(in srgb, #D4E0EA 70%, transparent)"` | `PALETTE.borderColor` `#d4e0ea` |
| `CHROME.table.bg` | 7235 | `"#ffffff"` | — |
| `CHROME.table.border` | 7236 | `"#D4E0EA"` | `PALETTE.borderColor` `#d4e0ea` |
| `CHROME.table.cellColor` | 7264 | `"var(--ds-color-text-primary)"` | ya deriva (ver §5) |
| `CHROME.table.cellFontSize` | 7263 | `"0.8125rem"` | — |
| `CHROME.table.cellPaddingCompact` | 7260 | `"7px 10px"` | — |
| `CHROME.table.cellPaddingComfortable` | 7261 | `"10px 12px"` | — |
| `CHROME.table.cellPaddingSpacious` | 7262 | `"14px 16px"` | — |
| `CHROME.table.filterFocusShadow` | 7266 | `"0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 14%, transparent), 0 0 8px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)"` | ya deriva (ver §5) |
| `CHROME.table.filterRowBg` | 7265 | `"#F4F8FD"` | — |
| `CHROME.table.headerBg` | 7239 | `"#f3f2ef"` | `PALETTE.backgroundSecondaryColor` `#f3f2ef` |
| `CHROME.table.headerBgHover` | 7240 | `"color-mix(in srgb, #3A6FB0 5%, #F5F8FA)"` | `PALETTE.primaryColor` `#3A6FB0` |
| `CHROME.table.headerBlockSize` | 7246 | `"34px"` | — |
| `CHROME.table.headerBorder` | 7247 | `"color-mix(in srgb, #D4E0EA 82%, transparent)"` | `PALETTE.borderColor` `#d4e0ea` |
| `CHROME.table.headerColor` | 7241 | `"#53697E"` | `PALETTE.textPageColor` `#53697E` |
| `CHROME.table.headerFontSize` | 7243 | `"0.6875rem"` | — |
| `CHROME.table.headerFontWeight` | 7242 | `600` | — |
| `CHROME.table.headerLetterSpacing` | 7244 | `"0.065em"` | — |
| `CHROME.table.headerShadow` | 7248 | `"inset 0 -1px 0 color-mix(in srgb, #D4E0EA 82%, transparent)"` | `PALETTE.borderColor` `#d4e0ea` |
| `CHROME.table.headerTextTransform` | 7245 | `"uppercase"` | — |
| `CHROME.table.loadingOverlayBg` | 7275 | `"rgba(255, 255, 255, 0.7)"` | — |
| `CHROME.table.pageButtonHoverShadow` | 7274 | `"0 1px 2px rgba(20, 40, 59, 0.06)"` | — |
| `CHROME.table.radius` | 7238 | `"10px"` | — |
| `CHROME.table.reorderBg` | 7270 | `"var(--ds-tint-12)"` | ya deriva (ver §5) |
| `CHROME.table.resizeBg` | 7268 | `"color-mix(in srgb, #3A6FB0 22%, #D4E0EA)"` | `PALETTE.primaryColor` + `PALETTE.borderColor` |
| `CHROME.table.resizeBgHover` | 7269 | `"#3A6FB0"` | `PALETTE.primaryColor` `#3A6FB0` |
| `CHROME.table.rowBg` | 7250 | `"#ffffff"` | — |
| `CHROME.table.rowBgExpanded` | 7254 | `"#F4F8FD"` | — |
| `CHROME.table.rowBgHover` | 7251 | `"#F4F8FD"` | — |
| `CHROME.table.rowBgSelected` | 7253 | `"#E8F3FF"` | — |
| `CHROME.table.rowBgStriped` | 7252 | `"#FAFCFF"` | — |
| `CHROME.table.rowBorder` | 7255 | `"#E3EAF0"` | — |
| `CHROME.table.rowFocusShadow` | 7258 | `"inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 28%, transparent), 0 4px 14px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)"` | ya deriva (ver §5) |
| `CHROME.table.rowHoverShadow` | 7256 | `"inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 18%, transparent)"` | ya deriva (ver §5) |
| `CHROME.table.sheen` | 7273 | `"none"` | — |

### evnto — 4 hojas sin tag (todas en modo BASE, `CHROME.table.*`)

| keypath | línea | valor | raíz-viva coincidente |
|---|---|---|---|
| `CHROME.table.headerBg` | 4201 | `'rgba(0, 0, 0, 0.02)'` | — |
| `CHROME.table.headerColor` | 4202 | `'#737373'` | `PALETTE.textMutedColor` `#737373` |
| `CHROME.table.headerFontSize` | 4204 | `'0.75rem'` | — |
| `CHROME.table.headerFontWeight` | 4203 | `500` | — |

### rottay — 0 hojas sin tag

Confirmado por la misma corrida. Ver §4 para su forma (no es "cero deuda":
es una forma DISTINTA de deuda, ya cubierta por un tag de familia con su
propia confesión textual de incompletitud — ver abajo).

---

## (2) BitHire vs Rottay/Evnto

**36 de 40 (90%) son bithire; 4 de 40 (10%) son evnto; 0 de 40 son rottay.**
La autoridad narrativa ("K5 preserva la tabla BitHire como baseline") cubre
sólo el 90%. **Los 4 de evnto NO son casos "BitHire baseline" — son un tipo
de deuda distinto** (ver §4): 3 de los 4 (`headerBg`, `headerFontSize`,
`headerFontWeight`) no tienen ninguna raíz viva coincidente medida — parecen
semillas propias de evnto sin más; el cuarto (`headerColor`) sí duplica una
raíz viva (`PALETTE.textMutedColor`, ver §5). Ninguno de los 4 necesita la
adjudicación "no unificar con `tier.control.bg`" — esa es específicamente la
razón H4 de bithire (ver §4), no aplica a evnto.

---

## (3) Subárboles uniformes máximos vs tag por hoja

**No hay un único subárbol uniforme que cubra limpio los 36 de bithire.**
Medido, no supuesto: 5 hojas (`cellColor`, `reorderBg`, `filterFocusShadow`,
`rowFocusShadow`, `rowHoverShadow`) YA son `var(--ds-color-primary)` /
`var(--ds-color-text-primary)` / `var(--ds-tint-12)` — es decir, hoy mismo
son sintácticamente `DERIVED_VALUE` (la regla del propio programa,
`/var\(|calc\(|color-mix\(/`, matchea). Poner un tag único de familia
`@domicile baseline` sobre las 36 sería **falso** para estas 5: no son
literal-independiente-preservado, ya cuelgan de una raíz compartida. La
partición mínima verdadera medida:

- **5 hojas ya-derivadas de raíz compartida real** (`var()` a un token
  `--ds-*` que NO es propio de table): candidatas a tag individual
  `@domicile derived`, cada una con su raíz citada — no a la etiqueta K5.
- **9 hojas que duplican byte-a-byte un seed vivo de PALETTE** vía literal
  plano o `color-mix()` de literales propios (ver tabla completa en §5): NO
  son semánticamente "baseline preservado" en el sentido de "valor
  independiente, con razón" — son un hardcode que coincide con una raíz que
  el propio archivo YA sabe nombrar (`var(--ds-color-primary)` se usa en
  otras 100+ líneas del mismo archivo bithire). Un tag de familia
  `@domicile baseline` sobre estas 9 sería técnicamente aplicable (el
  vocabulario cerrado no exige que un `baseline` sea único-en-el-universo)
  pero **documentalmente engañoso**: registraría como "divergencia de marca
  intencional" lo que la propia evidencia del archivo muestra como
  duplicado accidental. Ver §5, es el hallazgo central de este inventario.
- **22 hojas restantes**: sin coincidencia con ninguna raíz `PALETTE.*` que
  verifiqué (no exhaustivo — verifiqué contra la sección `PALETTE` de
  bithire, no contra las 1504 hojas totales del archivo). Éstas SÍ son
  candidatas limpias a un tag único de familia (o un tag por bloque:
  `header*`, `row*`, `cell*` podrían formar 3 subgrupos uniformes menores
  dentro de esta partición, pero un único `CHROME.table` para las 22 es
  semánticamente defendible con la evidencia que tengo).

**Recomendación mecánica (no adjudicación):** el patrón que ROTTAY ya usa
—un tag de familia `@domicile unassigned` + `@governor "gap medido: gobierno
parcial..."` cubriendo el grueso, MÁS un tag propio para la excepción
(`headerColor`, `derived`)— es la forma que este mismo archivo demuestra que
el harness admite. Bithire necesitaría como mínimo la misma bifurcación,
multiplicada: 1 tag de familia (las ~22 limpias) + 5 tags individuales
(ya-derivadas) + resolución explícita del DT para las 9 duplicadas (§5,
§8) — **no un único tag para las 36.**

**Evnto (4 hojas):** demasiado pequeño para hablar de "subárbol uniforme".
Un tag por hoja, o un tag de familia de 4, ambos son formas válidas — la
única que exige tratamiento aparte es `headerColor` (duplica
`textMutedColor`, ver §5).

---

## (4) Roster / orden / capability — comparación de los 3 temas

**`CHROME.table` no está en el plano ROOT del roster** (`docs/f4a/roster-variantes.md`
— 0 ocurrencias de "table" en todo el archivo, verificado por grep
case-insensitive) — consistente: table nunca fue uno de los 63 roots del
catálogo (`manifest/cascade/root-catalog.json`, verificado: 0 ocurrencias de
"table"). El "mismo roster" de la ley F4A sólo aplica al plano ROOT; table
vive exclusivamente en el plano FAMILIA.

**`CHROME.table` tampoco está en `mapa-familia-canales.{json,md}`** —
verificado, 0 ocurrencias de "table" en ambos, incluso en el JSON completo
(el campo `tree` del JSON es un digest `"dffd3c795"`, no el árbol; el árbol
real vive en un artefacto generado no commiteado a `docs/f4a/` — no lo
localicé y no lo invento). Esto es consistente con lo narrado en
`docs/ROADMAP-EJECUCION-2026-08-19.md` §13 (F4A-13: "table 40 excluida por
mi propio brief") y con `variant-parity.baseline.json` ("Baja #12... queda
sólo rottay table para K5", "Baja #13... exactamente las hojas de
CHROME.table, que van con K5/F4A-15") — **table fue excluida A PROPÓSITO de
CADA sweep de familia F4A-7…13, reservada entera para K5.** Consecuencia
medible: **`table.strictClass` (limpia-estricta / gobierno-parcial / mixta /
sin-control) nunca se calculó** — no hay fila para adjudicar contra.

**Por tenant, lo que SÍ está tagueado hoy (fuera de las 40):**

| tenant | modo | hojas tagueadas | domicilio(s) | patrón |
|---|---|---|---|---|
| rottay | base | 17 | `unassigned` (family, ×17) | 1 tag en línea 7257 cubre las 17; su propio `@governor` dice "gap medido: gobierno parcial — ... 17 sin control..." — **confiesa incompletitud en su propio texto**, no es un cierre limpio |
| rottay | base | 1 (`headerColor`) | `derived` | deriva de `--ds-color-text-page` (raíz K3), tag individual |
| rottay | dark (OVERLAY) | 10 | `seed` (family, ×10) | 1 tag en línea 1635, governor genérico "sin control atribuido F4A-3a" |
| bithire | base | **0 de 36** | — | **silencio total** (§1) |
| bithire | dark (OVERLAY) | 20 | `seed` ×12, `derived` ×8 | YA resuelto correctamente: 8 hojas derivan de raíces reales (`--ds-surface-control`, `--ds-color-border`, `--ds-surface-panel`, `--ds-color-primer`+`--ds-surface-card`, `--ds-radius-lg`); 1 de las 12 seed (`cellFontSize`) tiene control real (`dial: typography.scale`), las otras 11 "sin control atribuido" |
| evnto | base | **0 de 4** | — | silencio total (§1) |
| evnto | dark (OVERLAY) | 3 | `seed` (family, ×3) | 1 tag en línea 664, governor genérico "sin control atribuido F4A-3a" |

**Contradicción interna medida, no adjudicada:** bithire DARK ya usa
`seed` para literales opacos estructuralmente idénticos a los 22+9 de BASE
que este inventario acaba de encontrar sin tag. Si K5 etiqueta BASE como
`baseline` (siguiendo la prosa "preservar como baseline vertical") mientras
DARK sigue siendo `seed` para el mismo tipo de valor, quedan DOS domicilios
distintos para la misma clase de dato dentro de la misma familia y el mismo
tenant — el vocabulario cerrado lo permite sintácticamente, pero es una
inconsistencia de criterio que el DT debería resolver explícitamente (¿por
qué BASE es `baseline` y DARK es `seed`?), no dejar que la nomenclatura de
la prosa del roadmap decida sola. **PRO_EXPERT: 0 ocurrencias en toda la
familia table, en los 3 temas — no hay candidato para ese domicilio aquí.**

**Ausencia explícita (placeholder) fuera de las 40:** evnto tiene 19
placeholders cubriendo casi todo su modo DARK (`OVERLAY.chrome.table.*`:
actionBg, actionBorder, bg, cellColor, cellFontSize, cellPadding,
filterRowBg, headerBgHover, headerBorder, headerFontSize, headerShadow,
radius, rowBg, rowBgExpanded, rowBgHover, rowBgSelected, rowBgStriped,
rowBorder — más `headerFontSize` con nota "el modo no diverge"). **Pero
evnto NO tiene placeholders para las mismas propiedades en su modo BASE**
(`CHROME.table.bg`, `.border`, `.cellColor`, `.cellPadding`, `.rowBg`, etc.
— ninguna existe como leaf autorada NI como placeholder en evnto base). Esto
es un silencio real (universo-slot sin posición en ningún plano para evnto)
pero **fuera del denominador de las 40** — las 40 son "hojas AUTORADAS sin
tag"; estas son "hojas jamás autoradas y sin placeholder", una categoría
distinta que alimenta `divergentSlots`, no `untaggedAuthoredLeaves`. Lo
marco en §8 como violación separada de la ley "cero keypath sin domicilio".

---

## (5) "Baseline BitHire, no unificar" — ¿sombra algún control o repite un hardcode?

**Sí, medido con evidencia byte-exacta. 9 de las 36 hojas de bithire y 1 de
las 4 de evnto duplican literalmente el valor de una raíz `PALETTE.*` ya
autorada y viva en el MISMO archivo**, en vez de referenciarla con `var()`
como sus hojas hermanas (en la misma familia table, o en otras 100+
posiciones del mismo archivo) ya hacen:

| tenant | hoja | valor duplicado | raíz PALETTE (línea) | patrón hermano correcto en el mismo archivo |
|---|---|---|---|---|
| bithire | `resizeBgHover` | `"#3A6FB0"` | `primaryColor` (3369) | `PALETTE.primaryColor` línea 5011 usa `var(--ds-color-primary)` para el MISMO seed en otro contexto |
| bithire | `headerBgHover` | `color-mix(#3A6FB0 5%, #F5F8FA)` | `primaryColor` (3369) | ídem |
| bithire | `resizeBg` | `color-mix(#3A6FB0 22%, #D4E0EA)` | `primaryColor` + `borderColor` (3369, 3462) | ídem |
| bithire | `border` | `"#D4E0EA"` | `borderColor` (3462) | `OVERLAY.chrome.table.border` (dark, línea 1590) usa un valor DISTINTO propio — no ayuda de comparación directa, pero el K2 canónico (`PALETTE.borderPrimaryColor`, verificado en ronda K4 previa) SÍ deriva `var(--ds-color-border)` |
| bithire | `actionBorder` | `color-mix(#D4E0EA 70%, transparent)` | `borderColor` (3462) | ídem |
| bithire | `headerBorder` | `color-mix(#D4E0EA 82%, transparent)` | `borderColor` (3462) | ídem |
| bithire | `headerShadow` | `color-mix(#D4E0EA 82%, transparent)` (dentro de un inset) | `borderColor` (3462) | ídem — MISMO % que `headerBorder`, casi certeza de que ambos deberían compartir una sola raíz |
| bithire | `headerBg` | `"#f3f2ef"` | `backgroundSecondaryColor` (3367) | — |
| bithire | `headerColor` | `"#53697E"` | `textPageColor` (3374) | **el caso más fuerte**: `CHROME.table.headerColor` de ROTTAY (misma family, mismo leaf name) YA deriva de `var(--ds-color-text-page)` — la raíz K3 EXISTE exactamente para este propósito y bithire no la usa para el mismo campo |
| evnto | `headerColor` | `'#737373'` | `textMutedColor` (línea 1866) | — |

**5 hojas de bithire (`cellColor`, `reorderBg`, `filterFocusShadow`,
`rowFocusShadow`, `rowHoverShadow`) YA hacen lo correcto** — derivan de
`--ds-color-text-primary` / `--ds-tint-12` / `--ds-color-primary` — prueba
de que el patrón correcto convive, en el mismo objeto, con el patrón
duplicado.

**Lectura honesta, sin adjudicar:** la ley H4 ("`--ds-table-bg`/
`--ds-table-row-bg` NO se unifican con `tier.control.bg`", K5 tal como está
narrada) es una decisión SEMÁNTICA puntual — que el fondo de la tabla no
adopte la identidad "superficie de control". **No dice, y no debería
leerse como si dijera, "ningún canal de table puede referenciar ninguna
raíz compartida."** Las 10 coincidencias de esta tabla (9 bithire + 1
evnto) no son sobre `tier.control.bg` — son sobre `primaryColor`,
`borderColor`, `textPageColor`/`textMutedColor`, `backgroundSecondaryColor`,
ejes completamente distintos del debate H4. Etiquetarlas en bloque
`@domicile baseline` junto con las ~22 verdaderamente independientes
**shadowearía** silenciosamente una relación real con esos ejes — es
exactamente el "leaf shadowing no justificado" que la ley de salida de F4A
prohíbe (§8). No propongo la corrección (sería escribir brief); dejo la
tabla completa para que el DT decida domicilio por hoja.

---

## (6) Consumidores, gates/tests y métricas que K5 movería

**Consumidor CSS (skin, capa de pintura):**
`packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/data-table.css`
lee `var(--ds-table-bg, var(--ds-surface-card))` y
`var(--ds-table-row-bg, transparent)` (líneas 288-291, 708, 1016, 1103;
`--ds-table-row-bg-striped`/`-selected` también presentes). El fallback
propio del skin YA cae a `--ds-surface-card` cuando el canal de tema no
está seteado — independiente de si la fuente del tema deriva o no de
`tier.control.bg`; K5 (comentario-only) no cambia este fallback.

**Gates / artefactos que un lote K5 movería (todos regenerados por la
cadena estándar, ninguno reanclado por mí):**
- `manifest/variant-parity/variant-parity.baseline.json` — el ratchet
  `untaggedAuthoredLeaves: 40` (y posiblemente `divergentSlots: 33` SI el
  write-set también placeholder-cubre los huecos silenciosos de evnto
  base, ver §4/§7) necesita una entrada "Baja #14" escrita a mano por el
  DT, mismo patrón que las 13 anteriores.
- `manifest/generated/variant-parity.json`, `mirror-parity.json`,
  `fanout-facts.json`, `root-checklists.json` — cadena completa de
  regeneración (censo → reconciliation → kimi → controls → catalog →
  fanout-facts → mirror-parity → variant-parity → reads-ledger), por la ley
  ya asentada: "un lote de solo-comentarios también re-corre la cadena
  entera."
- `packages/core/manifest/generator/index.mjs` / `program-check.mjs` (T-1) —
  no debería tocarlos K5 en absoluto (son de un lote distinto), pero
  cualquier corrida de `gates:ci` posterior a K5 los re-evalúa.
- `docs/f4a/mapa-familia-canales.{json,md}` — table nunca tuvo fila; si el
  DT quiere que la tenga (para que `strictClass` exista para esta familia),
  es una decisión de alcance nueva, no implícita en "tagear las 40".
- `gat-07` (`scripts/evidence/gat-07-exact-proof/`) — re-sello obligatorio,
  último, por el DT.
- Suite pierna 1 (`node --test`) y, por la ley de rosters firmados
  ("tras tocar fuente de tema, T1/T2/T3 se corren ENTEROS"), los 3 archivos
  de rosters firmados enteros — **no corridos por mí, ver prohibiciones**.
- `gates:ci` completo.

**Ninguno de estos lo re-anclé, re-sellé ni regeneré.** Sólo los nombro
como lo que un writer real movería.

---

## (7) Write-set mínimo exacto propuesto (NO es brief — sin valores, sin redacción de docblocks)

Estrictamente comentario/estructura — **cero valor cambia** (las 40 hojas
YA tienen valor autorado real; tagear no es materializar). Igual que
F4A-3b/7…13: byte-idéntico ida y vuelta debe probarse con 3 builds reales.

**Paths tocables (candidato, a confirmar por el DT):**
1. `packages/core/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts`
   — 36 docblocks nuevos (mínimo 1 de familia + 5 individuales
   ya-derivados + resolución de los 9 duplicados, según lo que el DT
   adjudique en §5/§8 — el número final de docblocks depende de esa
   adjudicación, no es mecánico).
2. `packages/core/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts`
   — 4 docblocks nuevos (3 seed limpios + 1 con la misma resolución que
   el caso duplicado de bithire).
3. `packages/core/manifest/variant-parity/variant-parity.baseline.json`
   — "Baja #14" a mano, DESPUÉS de que el artefacto se regenere y el DT lo
   verifique.

**Fuera de alcance salvo decisión explícita del DT:**
- `packages/core/src/foundation/tokens/ts/presentation/brand-themes/rottay/index.ts`
  — sus 17+1+10 hojas YA tienen tag; su tag de familia confiesa
  incompletitud ("gobierno parcial... la prueba por hoja aterriza en su
  lote F4A-7…15") pero ESE lote nunca llegó — si K5 no lo toca, esa deuda
  rottay queda abierta después de K5 también (nombrarla como tal, no
  cerrarla en silencio).
- Los huecos silenciosos de evnto BASE (`bg`/`border`/`cellColor`/etc, sin
  autoría NI placeholder — §4) — decisión de alcance del DT: ¿entra en K5
  o es un lote aparte?
- Cualquier archivo `.css` generado, cualquier `manifest/generated/*`.

**Stop conditions (para el writer futuro, no para mí ahora):**
- STOP si CUALQUIER hoja de las 40 requiere que su valor cambie para que el
  tag sea verdadero (no encontrado — las 40 tienen valor real hoy).
- STOP si aparece una 41ª hoja sin tag fuera de `CHROME.table`/
  `OVERLAY.chrome.table` al re-correr `build()` (universo movido).
- STOP si el DT no ha resuelto §5 (domicilio de las 10 duplicadas) antes de
  escribir — tagear en bloque sin esa resolución es exactamente el
  shadowing que §8 prohíbe.
- STOP si se toca cualquier archivo fuera de los 3 nombrados arriba.
- STOP si `build()` recién corrido, en el momento de escribir, no reproduce
  ya `untaggedAuthoredLeaves: 40` con las mismas 40 rutas de este informe
  (el árbol se habrá movido — no asumir que este inventario sigue vigente
  sin re-medir).

---

## (8) Contradicciones con la ley de salida F4A

1. **"Cero keypath sin domicilio"** — VIOLADA hoy por diseño (es la deuda
   que K5 existe para cerrar): las 40 hojas de este informe. **Violación
   ADICIONAL, fuera del denominador 40**: los huecos silenciosos de evnto
   BASE (§4) — ni autorados ni placeholder-cubiertos, una clase de
   violación más severa (ni siquiera hay una razón escrita) que las 40, que
   sí tienen valor real esperando sólo el tag.
2. **"Cero leaf shadowing no justificado"** — EN RIESGO si K5 se ejecuta
   como "tagear las 36+4 en bloque como `baseline`, no unificar": 10 hojas
   (§5) shadowearían una relación real con raíces `PALETTE.*` vivas. No
   está violada TODAVÍA (nada se escribió) pero el inventario la marca como
   el riesgo concreto más probable de este lote si se despacha sin resolver
   §5 primero.
3. **"Mismo roster"** — no aplica directamente (table nunca fue root), pero
   hay una inconsistencia de PLANO adyacente: table es la ÚNICA familia
   grande que quedó completamente fuera de `mapa-familia-canales`
   (`strictClass` nunca calculado) mientras las otras 114 familias sí lo
   tienen. Si el DT quiere que K5 dé a table una fila de `strictClass`
   coherente con el resto del programa, es una ampliación de alcance
   explícita, no implícita.
4. **Inconsistencia de domicilio entre modos** (§4): bithire ya usa `seed`
   en DARK para la misma clase de dato que K5 nombraría `baseline` en BASE.
   No es una violación de una ley escrita que haya encontrado citada en
   ningún documento, pero es una tensión de criterio real que un auditor
   (Fable) probablemente marcaría P1/P2 si el brief no la nombra primero.

---

## Estado git final

```
git rev-parse HEAD        → 9d5582dfdf1d02f1d7e8fd468720b1d829e50454 (sin cambio)
git status --short         → (vacío)
```

Confirmado inmediatamente antes de escribir este párrafo, cierre de la
ronda.

## SHA del informe

No se auto-incluye (el hash de un archivo cambia con cada byte agregado,
incluida la línea que lo citaría). Verificar con:

```
shasum -a 256 /private/tmp/f4a-15-k5-sonnet-inventory.md
```

---

## VERDICT: `MEASURED_READY`

Los 40 están reproducidos exactos, enumerados con fuente:línea:valor:tag,
la asimetría bithire/evnto/rottay está medida, la partición de subárbol
está falsada (no hay un único tag uniforme verdadero para bithire), el
riesgo de shadowing está identificado con evidencia byte-exacta (10 hojas),
los consumidores/gates están listados sin reanclar nada, y el write-set
mínimo queda propuesto con stop conditions — sin escribir brief, sin
adjudicar domicilio, sin tocar el repo. **No es `STOP`**: no encontré
ninguna condición que impida seguir midiendo o que exija abortar el
inventario — lo que sí exige es que el DT resuelva §5/§8 (domicilio de las
10 hojas duplicadas y del hueco de evnto) ANTES de que cualquier writer
reciba un brief real.
