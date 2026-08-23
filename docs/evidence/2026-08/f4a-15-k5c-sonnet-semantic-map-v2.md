# F4A-15 / K5c — unión semántica de `CHROME.table` base, v2 corregida (Sonnet, READ-ONLY)

Mapper mecánico. Codex es DT. **K4/K5 writes siguen cercados — no
implemento nada.** Reemisión de
`/private/tmp/f4a-15-k5c-sonnet-semantic-map.md` (v1) incorporando **todas**
las correcciones de la auditoría Fable, verificadas de nuevo por mí — no
copiadas de palabra. Donde re-medí y coincide, lo digo; donde encontré un
matiz que ni v1 ni la auditoría tenían exacto, lo digo también (una fila,
ver §3 nota bajo #9).

HEAD auditado `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (coincide exacto,
verificado apertura y cierre). Worktree limpio (`git status --short` vacío,
`git diff --cached --stat` vacío). **Cero escritura en el repo, cero
build/generador/test mutante, cero git de mutación, cero commit, cero
decisión de diseño propia.** Únicos dos archivos escritos: este informe y su
`.ready`. (Nota de higiene: dos redirecciones `>` mías a `/tmp/...`
—`/private/tmp/...`— se crearon y borraron de inmediato durante el censo de
§6, antes de escribir este archivo; confirmado con `ls` que no queda
rastro. La comparación final del censo se rehizo con `comm` + sustitución
de proceso `<(...)`, que no toca disco.)

## Insumos — verificados byte-exactos, los tres

| insumo | SHA-256 dado | resultado |
|---|---|---|
| mapa v1 (este mismo memo, ronda anterior) | `d60e893cf9e7ffd40b0d420ff6eb14c91aac2215f32ce0eb7a96bf286ee8456f` | **COINCIDE** |
| auditoría Fable K5c | `6e11dca156e62ce7bf9f791961797c9336151822b25962701b012dae98714a3a` | **COINCIDE** |
| Opus K5 v2 | `3590a3234222bb74386e2dac4cfd945ee064ae82bf3f30629924c7686e3869a9` | **COINCIDE** |

Los tres `shasum -a 256` corridos al abrir esta ronda, antes de leer nada.

---

## Núcleo confirmado — NO se pierde, re-verificado esta ronda

**37 lexicales → 34 semánticos, un único colapso (padding), 16/0/30 = 46
silencios exactos.** Repetí las piezas de evidencia del colapso de padding
(docstring del tipo, emisor sin fanout, 3 reglas de densidad del skin, test
del componente con `--ds-density-cell-padding` pineado en `''`) y coinciden
byte a byte con v1. No las vuelvo a citar completas — ver v1 §2 si hace
falta el detalle; lo que sigue son las correcciones.

---

## (1) `anatomy` — corrección F-1: NO desconectado, es un eje vivo en el plano ATRIBUTO

**v1 decía "desconectado del compilador". Falso — verificado por mí,
independiente de la auditoría.** Tres piezas, las tres abiertas y leídas
esta ronda:

**(a) Puerta de policy.**
`packages/core/src/infrastructure/compilers/composition/tenant-theme/index.ts:1180-1193`:
```
if (policy.allowAnatomyVariants !== true) {
  for (const family of Object.keys(TENANT_THEME_ANATOMY_VARIANTS) ...) {
    const anatomyVariant = advanced.chrome?.[family]?.anatomy;
    if (anatomyVariant !== undefined && anatomyVariant !== "default") {
      issues.push({ code: "invalid_value",
        path: `$.visualFoundation.advanced.chrome.${family}.anatomy`,
        message: "Anatomy variants are disabled by this vertical" });
```

**(b) Proyección a atributo.** Mismo archivo, líneas 1299-1334:
`ANATOMY_ATTRIBUTE_BY_FAMILY = { cardComponent: "data-anatomy-card", table:
"data-anatomy-table", sidebar: ..., layout: ... }`, función
`tenantThemeAnatomyAttributes()` — docstring verbatim: *"Pure projection of
the compiled anatomy selections into `data-anatomy-*` root attributes...
skins select on the attribute, one level above the scope class."* Vocabulario
CERRADO (`default`/ausente no estampa nada — nunca interpola texto de
tenant). Verifiqué su llamador: `entrypoints/server/index.ts` (grep directo,
confirmado) — es el path público de SSR, no un experimento sin consumidor.

**(c) El skin YA selecciona sobre el atributo, hoy.** Grep exacto en
`modern/skin/data-table.css`:
```
2114: * `data-anatomy-table` attribute on the DS root; vocabulary in
2126,2131: [data-anatomy-table="ruled"]
2140,2148,2154: [data-anatomy-table="zebra"]
2167,2173,2178,2183: [data-anatomy-table="open"]
```
Los 3 valores no-default del enum (`ruled`/`zebra`/`open`) tienen regla
propia; sockets propios citados por la auditoría (`--ds-table-rule-strong`,
`--ds-table-editorial-*`, `--ds-table-minimal-shadow`,
`--ds-table-open-cell-padding-block`) — confirmados presentes en el censo
de §6.

**(d) El contrato de capability lo documenta como la MISMA ruta estática.**
`packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts:415-428`
(capability "Anatomy variants"):
```
documentPath: 'visualFoundation.advanced.chrome.{cardComponent,table,sidebar,layout}.anatomy',
brandThemePath: 'chrome.{cardComponent,table,sidebar,layout}.anatomy',
derivedChannels: [],
derivedRootAttributes: ['data-anatomy-card','data-anatomy-table','data-anatomy-sidebar','data-anatomy-layout'],
dependsOn: ['chrome.families'],
compat: 'additive; envelope-gated (allowAnatomyVariants)',
```
**Esta línea cierra la duda que v1 dejó abierta**: `brandThemePath:
'chrome.table.anatomy'` es LITERALMENTE la misma ruta que
`BrandTableChrome.anatomy` en `themes/index.ts:2061` — no son dos campos
homónimos en dos esquemas distintos; es el MISMO campo, con `derivedChannels:
[]` (cero canales CSS — por diseño) y `derivedRootAttributes` no vacío. El
contrato lo dice de forma explícita: este campo vive en el plano-atributo,
no en el plano-canal.

**Corrección de marco (no sólo de dato)**: la exclusión de `anatomy` del
universo de 34 **se sostiene** — sigue siendo correcto no contarlo como un
35º canal — pero la razón cambia de *"el emisor no lo lee, está
desconectado"* a *"vive en OTRO transporte (atributo, enum cerrado,
policy-gated), con su propio lowering, su propia selección de skin y su
propia entrada de capability — queda fuera del conteo de CANAL por
pertenecer a otro plano, no por estar muerto"*.

**`OPEN_KIMI` reformulado (no es mío decidirlo, lo dejo planteado
exactamente como debe quedar):** ¿el plano ATRIBUTO (`anatomy`, y por
extensión cualquier otro campo `chrome.<familia>.anatomy` que exista) entra
al mismo roster/placeholder de temas que el plano CSS-canal, con su propio
domicilio (`seed`/`derived`/`baseline`/`unassigned`/`pro-expert`) por
tenant? O es una categoría aparte con su propia ley de cobertura, dado que
"placeholder" hoy sólo tiene definida una semántica de canal-ausente, no de
atributo-ausente. **No lo adjudico.**

---

## (2) Corrección F-2 — fila `headerLetterSpacing`: SÍ hay piso, no es la única ausencia observable

`data-table.css:432-435` (regla completa, releída):
```
letter-spacing: var(
  --ds-table-header-letter-spacing,
  var(--ds-text-eyebrow-letter-spacing, 0.08em)
);
```
**v1 estaba mal** — el grep de una sola línea de v1 cortó la cadena
multilínea y reportó "sin literal de piso" donde hay 2 niveles reales
(eyebrow → `0.08em` literal). Corregido: `Obs.=no` para `PatternDataTable`.

**Matiz que ni v1 ni la auditoría Fable dejaron escrito, medido por mí esta
ronda**: el MISMO canal, consumido por el OTRO componente
(`table.css:131`, primitivo `Table`), **SÍ está a pelo**:
```
letter-spacing: var(--ds-table-header-letter-spacing);
```
Sin segundo argumento. Con la regla de unión de consumo que el punto 5 pide
(§4 abajo), la respuesta correcta no es un `Obs.` único: **`headerLetterSpacing`
es observable-no en `PatternDataTable`, observable-sí en el `Table`
primitivo** — dos consumidores, dos respuestas. Lo marco explícito porque
generalizar la corrección de Fable (que citó sólo `data-table.css`) a "no
observable" sin más habría vuelto a sobre-afirmar, esta vez en la dirección
opuesta.

---

## (3) Corrección F-3 — fila `headerTextTransform`: consumida DOS veces en modern, no sólo rustic

`data-table.css:436-439`:
```
text-transform: var(
  --ds-table-header-text-transform,
  var(--ds-text-eyebrow-transform, uppercase)
);
```
2 niveles, piso real (`uppercase`). **`table.css:132`** (primitivo `Table`):
```
text-transform: var(--ds-table-header-text-transform);
```
Sin piso — **éste es el "var sin piso" real** que v1 le atribuyó por error a
`headerLetterSpacing` (#2 arriba). Mismo patrón que #2: dos consumidores, dos
respuestas — `Obs.=no` en `PatternDataTable`, `Obs.=sí` en `Table`
primitivo.

---

## (4) Corrección F-4 — §1 sobreafirmaba "cero cruces"; son cero ALIAS, cuatro default-inheritance direccionales

**v1 dijo**: "ningún `var(--ds-table-X, var(--ds-table-Y,...))` cruza dos
campos DISTINTOS salvo padding". **Falso tal como estaba escrito** — hay
CUATRO, las cuatro re-verificadas por mí esta ronda con cita exacta:

| hoja | fallback cruzado | cita |
|---|---|---|
| `headerShadow` (data-table.css) | → `headerBorder` → `border` | `box-shadow: var(--ds-table-header-shadow, inset 0 -1px 0 var(--ds-table-header-border, var(--ds-table-border)))` — `data-table.css:1177-1180` |
| `actionBorder` | → `rowBorder` | `border-inline-start: ... var(--ds-table-action-border, var(--ds-table-row-border, transparent))` — `data-table.css:696` |
| `headerShadow` (table.css, cadena DISTINTA a la de arriba) | → `border` directo | `box-shadow: var(--ds-table-header-shadow, inset 0 -1px 0 var(--ds-table-border, var(--ds-color-border)))` — `table.css:153` |
| `headerBgHover` | → `headerBg` | `background: var(--ds-table-header-bg-hover, color-mix(in srgb, var(--ds-color-primary) 5%|8%, var(--ds-table-header-bg, var(--ds-surface-inset))))` — `table.css:180,191` |

**Por qué esto NO cambia la conclusión de 34 ejes / 1 equivalencia**:
herencia-de-default-direccional ≠ equivalencia-de-eje. Autorar `border` no
hace que `headerBorder`/`actionBorder`/`headerShadow` queden "cubiertos" —
son ejes propios, cada uno con su domicilio propio posible; lo único que
comparten es que SI NINGÚN TENANT los autora, el consumidor cae en cascada
hacia una raíz hermana en vez de a un literal fijo. Es exactamente la misma
figura que ya documentaba la columna "FB modern" de la tabla de v1 —lo que
estaba mal era la frase de §1, no la tabla. **Reescritura de la ley**: "cero
ALIAS semánticos (dos nombres para el mismo canal) salvo el colapso de
padding; cuatro default-inheritance DIRECCIONALES catalogadas, que no
colapsan cuenta."

---

## (5) Corrección F-5 — el STOP de "qué skin gobierna" no era de esquema; los 4 fallbacks pendientes, cerrados

**No había ambigüedad de esquema**: son dos componentes distintos, ambos
`modern`, conviviendo bajo `modern/skin/`:
- `table.css` → selector raíz `.ds-table.ds-table--modern` → **primitivo
  `Table`**.
- `data-table.css` → selector raíz
  `.ds-pattern-data-table.ds-engine-modern` → **`PatternDataTable`**.

**El universo de consumo de la familia en modern es la UNIÓN de ambos
archivos** — verificado, no supuesto: los grep de §2-4 arriba ya cruzan
ambos. Con esto, las 8 filas que v1 dejó bajo `STOP_NEEDS_SCHEMA` quedan:

- `headerBgHover` (#5): resuelta arriba (F-4) — `Obs.=no` (fallback
  diseñado a `headerBg`/`surface-inset`).
- `headerLetterSpacing` (#9) y `headerTextTransform` (#10): resueltas en
  §2/§3 — respuesta por-consumidor, ya no ambigua.
- `headerShadow` (#13): resuelta en F-4 — consumido en AMBOS archivos,
  con dos cadenas de fallback ligeramente distintas pero ambas reales.
- **`rowBgSelected` (#17), `rowBorder` (#19), `rowHoverShadow` (#20),
  `rowFocusShadow` (#21) — verificados línea por línea esta ronda,
  `STOP` cerrado, no quedan pendientes:**

| # | canal | fallback verificado | cita |
|---|---|---|---|
| 17 | `--ds-table-row-bg-selected` | `color-mix(in srgb, var(--ds-color-primary) 9%\|7%, transparent\|var(--ds-surface-card))` | data-table.css:1298,1320,1815,1841 (4 sitios, todos con fallback real) |
| 19 | `--ds-table-row-border` | `var(--ds-color-border-subtle)` | data-table.css:70 |
| 20 | `--ds-table-row-hover-shadow` | `inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 10%, transparent)` | data-table.css:1347,1925,1935 (3 sitios) |
| 21 | `--ds-table-row-focus-shadow` | `inset 0 0 0 2px color-mix(in srgb, var(--ds-color-primary) 52%, transparent)` | data-table.css:1327,1946,1956 (3 sitios) |

Los 4 tienen piso real, atado a la raíz viva `--ds-color-primary` o a
`--ds-color-border-subtle`/`--ds-surface-card`. **`Obs.=no` para los 4, en
`PatternDataTable`.** No verifiqué su presencia en `table.css` (el
primitivo) — no encontré ninguna referencia a estos 4 canales en `table.css`
en los greps de §6 (row-selected/hover-shadow/focus-shadow/row-border no
aparecen en la lista de 132 fuera de `data-table.css`), así que **para
`table.css` estos 4 slots simplemente no se consumen** — no es una segunda
respuesta pendiente, es ausencia de consumo en ese archivo, ya reflejado en
el censo de §6.

**El `STOP_NEEDS_SCHEMA` de v1 queda retirado por completo.**

---

## (6) Corrección F-6 — censo de los 98 canales consumer-only en modern

Reproducido independiente, con `grep -oE -- "--ds-table-[a-zA-Z0-9-]+"`
sobre `table.css` + `data-table.css`, `sort -u`, y `comm` con sustitución de
proceso (sin escribir archivo): **132 canales `--ds-table-*` únicos
consumidos en modern.** De ellos, **37 coinciden con los campos de
`BrandTableChrome`** (el universo de autoría de tema); de esos 37, **34
tienen consumo real** (los 3 restantes —`filterRowBg`, `filterFocusShadow`,
`loadingOverlayBg`— son los muertos ya identificados en v1, re-confirmados
por el mismo censo: aparecen en el lado "emitido" pero NO en el lado
"consumido-en-132", prueba cruzada limpia). **98 = 132 − 34: canales que el
skin consume pero que NINGÚN campo de `BrandTableChrome` alimenta hoy.**

Clases observadas en el censo (nombrada, no exhaustiva por sub-categoría,
suficiente para que "34" no se lea como "todos los sockets de table"):
`*-cell-padding-{comfortable,compact,spacious}` para leading/selection/action
(9 canales, paralelos al eje de §2 de v1 pero para columnas especiales, sin
campo de tema); `sort-*` (9); `drag-grip-*`/`drop-indicator-*` (9);
`pinned-cell-bg*` (5); `editor-*` (5); `pagination-*`/`bulk-bar-*` (7);
`editorial-*`/`minimal-*`/`open-cell-padding-block`/`rule-strong` — los
sockets de `anatomy` (6, ver §1); `control-size*`/`control-radius`/
`control-font-size` (4); tipografía auxiliar (`caption-font-size`,
`empty-*-font-size`, `group-*-font-size`, `title-font-weight`, 7);
geometría (`min-inline-size`, `collapsed-min-inline-size`,
`touch-target*`, `resize-hit-size`, `resize-bar-*`, 7); resto disperso
(`border-width`, `cell-numeric`, `footer-margin-block-start`,
`header-focus-shadow`, `header-pinned-bg`, `row-selected-shadow`,
`row-transition`, `shadow`, `skeleton-fill`, `state-copy-max-inline-size`,
`toolbar-gap`). Hoy alcanzables **sólo por `tokenOverrides`** (el mecanismo
de Advanced overrides que CLAUDE.md documenta como tier gobernado de alta
precedencia) o por su literal de piso — nunca por un campo con nombre en
`BrandTableChrome`.

**No rompen el 34** — el universo del mapa es, explícito desde v1, el plano
de AUTORÍA de tema (`BrandTableChrome`), no "todos los ejes customizables de
`table` en modern". Pero deben quedar nombrados para que un gate futuro (§7)
no los confunda con silencios de tema, y para que "34" no se cite fuera de
este informe como si fuera el tamaño completo de la superficie
personalizable.

**Nueva stop condition, exacta**: **ningún `@placeholder`/tag de tema puede
pretender cubrir uno de estos 98 canales como si fuera autoría de
`BrandTableChrome`** — hoy no existe campo del tipo para ellos; darles
domicilio de tema es un cambio de CONTRATO (ampliar la interfaz), no un tag
sobre algo ya declarado. Ver stop 8 en §9.

---

## (7) Sidecar/gate — propuesta corregida, sigue sin escribirse

Incorporo las tres condiciones de la auditoría, sin decidir si el DT las
adopta:

1. **Fuente de la ley = el TIPO**, no el sidecar. `themes/index.ts:2088`
   ("These win over the legacy global value") es la autoridad; el sidecar
   es una **proyección generada** de esa fuente (preferido) o, si la
   extracción automática de docstrings no es viable, un archivo manual con
   `lawSource: archivo:línea` obligatorio y la misma disciplina de revisión
   que el baseline de `variant-parity`.
2. **Domicilio correcto: bajo `variant-parity`, no un root nuevo.** No
   `manifest/semantic-groups/` como directorio de primer nivel (sugiere una
   autoridad nueva) — vive junto al dueño que ya cuenta
   (`manifest/variant-parity/semantic-groups/` o módulo hermano), su
   generador en la misma familia que los generadores del manifest, y el
   colapso como paso DENTRO de `variant-parity` (no un segundo pipeline),
   con guarda anti-rename estilo `metadataGuard`.
3. **El esquema declara `plane` desde el día uno**: `"css-channel" |
   "attribute"`. La razón ya no es hipotética — §1 mide que la familia
   `table` ya tiene un eje real en plano `attribute` (`anatomy`). Un sidecar
   sin esa dimensión repetiría, en código, la exclusión ad-hoc que este
   informe tuvo que hacer en prosa.

**Alcance inicial: 1 familia (`chrome.table`), 1 grupo (`padding-axis`,
plane `css-channel`)** — el barrido de las otras ~114 familias en busca de
más grupos, y de otros campos `anatomy` en plano `attribute`, es lote
aparte. El ratchet léxico existente de `variant-parity` **queda intacto
como unidad propia** — el colapso semántico es una capa ENCIMA, nunca un
reemplazo.

No escribo el sidecar ni el gate. Es una forma propuesta para que el DT
decida.

---

## (8) Read-set / write-set — corregido

**Read-set futuro** (ampliado por F-1): los 3 `brand-themes/*/index.ts`,
`themes/index.ts` (`BrandTableChrome`), `chrome-variables/index.ts`, los 4
skins (`modern/skin/{data-table,table}.css`,
`rustic/skin/{data-table,table}.css`), `PatternDataTable.density.test.tsx`,
`manifest/{mirror-parity,variant-parity}/index.mjs`, **más**
`packages/core/src/infrastructure/compilers/composition/tenant-theme/index.ts`
(policy `allowAnatomyVariants` + `tenantThemeAnatomyAttributes`) y
`packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts`
(capability "Anatomy variants", `brandThemePath`/`derivedRootAttributes`).

**Write-set candidato**: **sin cambios de fondo respecto a v1 — sigue
condicionado a que Kimi adjudique el sentido de los 46, y sigue en CERO
placeholders ahora.** Lo único que cambia es una precisión: si el DT
eventualmente decide que el plano `attribute` (`anatomy`) SÍ entra al
roster de temas (la pregunta reformulada de §1), el write-set de esa
decisión tocaría los mismos 3 `brand-themes/*.ts` pero con un `@domicile`
sobre `chrome.table.anatomy`, no un canal — otra decisión de Kimi/DT, no
mecánica, no habilitada por este informe.

---

## (9) Rustic — fuera de foco, citado para impedir una generalización falsa

**El engine `rustic` INVIERTE la prioridad de padding respecto a modern.**
Verificado, las 6 apariciones en
`data-table/engines/rustic/index.tsx:53,57,63,67,73,77`:
```
padding: 'var(--ds-table-cell-padding, var(--ds-density-cell-padding, 0.5rem 0.75rem))'
```
(y análogas para comfortable `0.875rem 1rem` y una tercera talla sin canal
de densidad, `1rem 1.25rem`). **Rustic NUNCA lee
`--ds-table-padding-{compact,comfortable,spacious}`** — sólo conoce el canal
GENÉRICO (`cellPadding`) primero, y el sistema de densidad compartido
después. Es decir: en rustic, **bithire pierde su especificidad por
densidad por completo** (sus 3 variantes son letra muerta ahí) y **rottay
sigue cubierto igual que en modern** (su canal genérico es justo el que
rustic prioriza). Esto NO cambia el conteo de 46 (que es sobre el universo
de AUTORÍA, no sobre qué engine consume qué) — se cita únicamente para que
nadie generalice la conclusión de §2 de v1 ("cellPadding cubre los 3 modos")
como si fuera universal-por-engine sin la salvedad.

---

## (10) Las decisiones de diseño preservadas — sin tocar

**Los 6 `OPEN_KIMI` de Opus v2 §7, EXACTOS, sin adjudicar por mí:**

1. `seed` vs `baseline` en base/dark.
2. Regla general de root-coincidence governor.
3. Criterio graduado para canales no-raíz.
4. Las 18 de rottay (consecuencia de 2, decidible aparte).
5. **Unión semántica y sentido de los gaps** — la mitad "unión" queda
   `MEASURED` con esta v2 (37→34, 16/0/30=46, exacto); la mitad "sentido"
   (¿evnto deliberadamente mínimo o incompleto?) **sigue abierta,
   intacta**.
6. La razón falsable de cada `baseline`.

**Séptimo ítem, NUEVO de esta ronda, adicional a los 6 de Opus v2 — no
sustituye ninguno**: **¿el plano `attribute` entra al roster/placeholder de
temas?** (§1). Lo nombro aparte porque Opus v2 no lo tenía — nace de la
corrección F-1 de Fable sobre `anatomy`, no estaba en el universo de
preguntas de la v2 original.

**El split de destinos, preservado tal cual Opus v2 §5 lo dejó:**
- **F4A** documenta relaciones (governor con razón medida) — el terreno de
  este informe y de K5a/K5b.
- **F4B / F2-asimétrico** recablea causalidad (¿el valor que hoy coincide
  *debe* moverse junto mañana?) — las 10+3+~12 coincidencias de C-F1/C-F2 de
  la ronda K5 anterior.
- **F4C** unifica H4 (¿la tabla adopta la identidad "superficie de
  control"?) — el par `bg`/`rowBg`, y nada más.

No until muevo ninguna hoja entre estos tres destinos. No adjudico
ninguno de los 7 `OPEN_KIMI`.

---

## Estado git final

```
git rev-parse HEAD    → 9d5582dfdf1d02f1d7e8fd468720b1d829e50454 (sin cambio)
git status --short     → (vacío)
git diff --cached --stat → (vacío)
```

## SHA de todos los insumos (recordatorio, ya tabulado arriba)

```
mapa v1        d60e893cf9e7ffd40b0d420ff6eb14c91aac2215f32ce0eb7a96bf286ee8456f
auditoría Fable 6e11dca156e62ce7bf9f791961797c9336151822b25962701b012dae98714a3a
Opus K5 v2     3590a3234222bb74386e2dac4cfd945ee064ae82bf3f30629924c7686e3869a9
```

## SHA de este informe

No se auto-incluye (cambiaría con la línea que lo citara). Verificar con:
```
shasum -a 256 /private/tmp/f4a-15-k5c-sonnet-semantic-map-v2.md
```

---

## VERDICT: `MEASURED_READY_CORRECTED`

Las 6 correcciones de Fable (F-1…F-6) fueron re-verificadas por mí de forma
independiente, no copiadas — con dos hallazgos propios que ni v1 ni la
auditoría tenían exactos: (a) `headerLetterSpacing` también está a pelo en
el primitivo `Table` (`table.css:131`), simétrico al caso que F-3 encontró
para `headerTextTransform`; (b) el `STOP_NEEDS_SCHEMA` de los 4 fallbacks
de fila (#17/#19/#20/#21) queda **cerrado por completo**, con cita exacta
de los 4 pisos reales. El núcleo — **37→34, un solo colapso semántico
(padding), 16/0/30 = 46 exacto** — sobrevive intacto. `anatomy` queda
correctamente reformulado como eje vivo en plano-atributo, no como campo
desconectado. El censo de 98 canales consumer-only queda anexado con una
stop condition nueva. Sidecar/gate re-adjudicado según las 3 condiciones de
Fable, sin escribirse. Los 6 `OPEN_KIMI` de Opus v2 quedan intactos, más un
séptimo nuevo (plano-atributo) nombrado sin adjudicar. Ninguna verdad dejó
de reproducir — no hubo necesidad de declarar STOP sobre el fondo del
informe.
