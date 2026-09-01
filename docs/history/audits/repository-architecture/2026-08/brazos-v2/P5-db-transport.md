# P5 — Transporte DB: 72,6 % (Cloud) vs 52,4 % (Codex), hojas vs diales

HEAD verificado: al arrancar `dcc44a6093de0ba4f9dcbdb733ae467008cffb21`; **al cerrar
`f166570d92433fe1437133975732003c1fd29a32`** — otro agente commiteó durante mi corrida
(`ecdc01a6` microfix schemaVersion + `f166570d` asiento §13). `git diff --name-only dcc44a6..f166570`
sobre mis 5 rutas de medición (`themes/`, `brand-themes/`, `tenant-theme/`, `schemas/tenant-theme/`,
`customization-model/index.json`) = **vacío**. Mis cifras valen en ambos SHAs.
git status inicial: 2 modificados ajenos en `scripts/boundaries/public-entrypoint-boundary-gate/` +
`?? docs/reauditoria-cloud/`. git status final: sólo `?? docs/reauditoria-cloud/` (los 2 modificados
entraron en `ecdc01a6`). Cero escritura mía sobre el repo.

Método: `esbuild --bundle` de FUENTE (no `dist`) a scratchpad
(`P5-entry.ts`/`P5-entry2.ts` → `P5-bundle.cjs`/`P5-bundle2.cjs`, alias `@`→`packages/core/src`).
No usé los scripts de Cloud tal cual (hardcodean rutas y dependen de `reaud-A-mig.cjs`); reimplementé
su lógica exacta en `P5-census.mjs`, `P5-maximal.mjs`, `P5-diff.mjs`, `P5-pervert.mjs`, `P5-darkprobe.mjs`.

---

## Reproducción (hecho base, comando → salida)

### R1 · Las CINCO cifras en disputa reproducen EXACTO, las de los dos bandos

`node P5-census.mjs` + `node P5-maximal.mjs` + `node P5-diff.mjs`:

```
--- per vertical (walker de Cloud: undefined cuenta como hoja) ---
bithire   {"total":7935,"defined":1487,"undef":6448}
evnto     {"total":7935,"defined":424, "undef":7511}
rottay    {"total":7935,"defined":1727,"undef":6208}

UNION leaves (sans id/name/extends)   : 7933    <- Cloud 7.933 ✓
  ... definidas en >=1 vertical       : 2746    <- Codex 2.746 ✓
  ... undefined en LAS TRES           : 5187    <- Codex 5.187 ✓
DB-REACHABLE ThemePatch leaves        : 2198    <- Cloud 2.198 ✓
ONLY-STATIC (Cloud)                   : 5763  72.6%   <- Cloud 72,6 % ✓
ONLY-STATIC ∩ DEFINIDAS (Codex)       : 1439  52.4%   <- Codex 52,4 % ✓
ONLY-DB                               :   28
```

Aritmética cerrada: `|static ∩ db| = 2198 − 28 = 2170`; `7933 − 2170 = 5763` ✓.
`1307 (definidas∩db) + 863 (nunca-definidas pero alcanzables) + 28 (sólo-DB) = 2198` ✓.
Ninguna de las dos partes tiene un error de cuenta. **La disputa es 100 % de denominador.**

### R2 · El hallazgo que desarma la palabra "unión": los tres verticales tienen EL MISMO keypath set

`node P5-shapecheck.mjs`:

```
sizes 7935 7935 7935
bithire\evnto 0   evnto\bithire 0   bithire\rottay 0   rottay\bithire 0
```

Los 7.933 no son una unión de tres identidades: son **una sola silueta**, idéntica en los tres.
La causa está escrita en el propio archivo, `themes/iso/shape/index.ts:1-9`:

> "Canonical chrome shape for ISO Theme totality. This object is **the union of every chrome keypath
> authored by the three first-party brand themes**. mergeDefaultShape uses it to normalize every Theme
> to the same nested keypath set while preserving authored values, so the three first-party Themes
> remain **structural mirrors** despite authoring different subsets."

Y `themes/iso/index.ts:762-780` (`normalizeModeOverlays`) aplica ese mismo
`mergeDefaultShape(DEFAULT_CHROME_SHAPE, overlay.chrome)` a `light` **y** a `dark`, para **todo**
vertical, tenga o no overlay. De ahí salen los 2.006 + 2.006 = 4.012 `modes.*.chrome`.

Es decir: el denominador de Cloud es el tamaño de un **dispositivo de normalización** cuyo propósito
declarado es que los tres temas sean espejos estructurales. Contarlo como "identidad de un vertical
que el DB no puede expresar" es contar el andamio como edificio.

### R3 · La cifra que sí decide: por vertical, sobre lo que ESE vertical realmente escribe

`node P5-pervert.mjs`:

```
vertical | autoradas(definidas) | ∩DB | fuera de DB | % inexpresable
bithire      1485    840    645   43.4%
   modes.dark:484  chrome.badge:16  chrome.controls:13  chrome.detail:13  motion.value:12  chrome.surface:11  palette.ramps:10  chrome.premiumCard:10
evnto         422    174    248   58.8%
   modes.dark:129  motion.value:12  chrome.surface:11  palette.ramps:10  chrome.controls:10  chrome.premiumCard:10  charts.value:6  chrome.accent:6
rottay       1725    814    911   52.8%
   modes.light:649  palette.ramps:80  chrome.surface:17  motion.value:12  palette.aliases:11  chrome.list:11  chrome.badge:10  chrome.controls:10
```

Ni 72,6 % ni 52,4 %: **43,4 % / 58,8 % / 52,8 %**, y en los tres el overlay de modo es la causa
dominante (75 % del hueco de bithire, 71 % del de rottay, 52 % del de evnto). Un tenant no compra
"un vertical"; compra *un* vertical. Ésta es la unidad de decisión.

---

## Adjudicación por afirmación

| Afirmación | Quién | Cifra reproducida | Interpretación | Veredicto | Quién tenía razón |
|---|---|---|---|---|---|
| "7.933 hojas Theme escritas por los 3 verticales" | Cloud | 7.933 ✓ | La palabra **"escritas"** es falsa: 5.187 (65,4 %) no tienen valor en ninguno, y las 7.933 son una sola silueta replicada, no una unión | **CONFIRMADA CON CORRECCIÓN** (el número; no el verbo) | Codex |
| "2.198 alcanzables desde el documento DB" | Cloud | 2.198 ✓ | Exacto y no disputado | **CONFIRMADA** | Cloud (y Codex no lo discute) |
| "5.763 (72,6 %) el DB no puede expresar" → **BLOQUEANTE** | Cloud | 5.763 / 72,6 % ✓ | Aritmética correcta; el denominador incluye 4.324 hojas que son andamio de normalización. Como *severidad* no se sostiene | **PARCIAL** (cifra sí, severidad no) | Codex |
| "5.187 nunca definidas; universo real 2.746; 1.439 = 52,4 %" | Codex | los tres ✓ | Denominador honesto a nivel de flota | **CONFIRMADA** | Codex |
| "El DB es overlay bounded fail-closed, no un clon" | Codex | — | Sostenido por la fuente y por la ley escrita (§ Contrato) | **CONFIRMADA** | Codex |
| "La cifra no manda; la pregunta es qué necesita el editor" | Kimi | — | Es la lectura operativa correcta; las dos cifras describen el mismo hecho | **CONFIRMADA** | Kimi |
| H-A-3: `migrateV1` sólo produce 10 hojas de paleta por modo | Cloud | `modes.*` = 20 (10 light + 10 dark), todas `palette.*Color` | Exacto (`migrate-v1/index.ts:381-393`) | **CONFIRMADA** | Cloud |
| H-A-3: `palette.dark` inerte con `backgroundMode≠auto`, sin issue | Cloud | `success:true`, `issues:[]`; patch sin rastro del bloque dark | Confirmado con control positivo | **CONFIRMADA** | Cloud |
| "Es semántica deliberada y documentada" | Kimi | comentario `migrate-v1/index.ts:400-406` | Deliberada y documentada **en el código**; **no** en el editor ni en una issue | **PARCIAL** | empate: Kimi sobre la intención, Cloud sobre el efecto en el editor |
| RC-07: 2.212 hojas / 2.080 `visual-value` / 1.875 chrome / 23 enum / 0 `editorMetadata` | Cloud (conteo), Codex+Kimi (confirmación) | los cinco ✓ | — | **CONFIRMADA** | los tres |
| "2.212 hojas contradice 'pocas decenas de diales'" | Cloud | — | Hoja ≠ dial está **codificado** en la ley: `expert.presentation` = *"Searchable domain browser with preview, **not 294 sliders**"* | **REFUTADA** | Codex |
| "El editor segmenta por familia" | Codex | `Select` de 48 familias + `tokenOverrides`; una familia a la vez | Confirmado en fuente | **CONFIRMADA** | Codex |
| "La ergonomía Expert es el hallazgo que sobrevive" | Kimi/Codex | ver Hallazgo N2 (filtro de profundidad 1: 606 de 607 hojas de `chrome.controls` inalcanzables) | Sobrevive **y es peor de lo que los tres midieron** | **CONFIRMADA Y AGRAVADA** | Kimi/Codex |

---

## Tarea 2 · De dónde salen las 5.187 nunca definidas — top 10 prefijos

`node P5-diff.mjs` (agrupado a 3 segmentos):

```
1711  modes.dark.chrome        <- normalizeModeOverlays (iso/index.ts:777)
1498  modes.light.chrome       <- idem
 361  modes.light.surfaces
 297  modes.dark.surfaces
  81  modes.light.typography
  78  modes.dark.typography
  37  modes.dark.palette
  27  modes.light.palette
  25  chrome.controls.buttonGeometry
 168  surfaces.materials.*     (8 roles x 21 facetas; 21/21 undefined en LOS TRES)
```

Raíces: `modes` 4.090 · `chrome` 739 · `surfaces` 272 · `typography` 65 · `palette` 7 · resto 14.
**El 78,8 % de las nunca-definidas es el skeleton de overlay de modo.**

Corrección directa al desglose de H-A-2 (Cloud) contra el subconjunto DEFINIDO:

| H-A-2 dice | Definidas de verdad | Nota |
|---|---|---|
| `5.150 modes.*` (4.012 chrome) | **1.142** (803 chrome) | 78 % era skeleton |
| `168 surfaces.materials.*` | **0** | `materials` está 21/21 undefined en los tres; cero identidad perdida (Codex tenía razón: familia deprecada) |
| `46 chrome.premiumCard.*` | **10** | |
| `80 palette.ramps.*` | **80** ✓ | pero 80 son de **rottay sola**; bithire y evnto autoran 1 rampa (`neutral`, 10 pasos) |
| `6 surfaces.elevations.*` | **6** ✓ | también **rottay sola**; bithire y evnto no autoran ninguna |
| `18 list / 17 surface / 16 badge / 13 detail` | ✓ ✓ ✓ ✓ | correctos |
| `12 motion.value / 11 palette.aliases / 8 charts.value` | 12 ✓ / 11 ✓ / **7** | |
| `15 capabilities.*` | **13** | |

Consecuencia para la recomendación de Cloud ("priorizar por reach: ramps, elevations, dark"): las dos
primeras aperturas benefician **sólo a rottay**. No es un argumento de flota.

---

## Tarea 3 · Las 1.439 definidas-y-no-alcanzables, por rol

**A. Identidad de vertical — candidatos legítimos a abrir (≈ 190 hojas, sin chrome de modo)**

| Grupo | Hojas | Quién lo autora | Lectura |
|---|---|---|---|
| `palette.ramps.*` | 80 | rottay 80, bithire 10, evnto 10 | rampas afinadas a mano; alimenta 8 familias de color |
| `modes.{light,dark}.palette` más allá de las 10 semillas | 242 (126 light + 116 dark) | rottay light 126, bithire dark 111, evnto dark ~95 | **el núcleo del hueco de color por modo** |
| `modes.dark.surfaces` / `modes.light.surfaces` | 94 | bithire 79 dark, rottay 15 light | superficie autoral por modo |
| `palette.aliases.*` + ~50 colores nombrados | 61 | los tres | derivables de semillas en su mayoría |
| `motion.value.*` | 12 | los tres | dial de movimiento fino |
| `surfaces.elevations.*` | 6 | sólo rottay | escalera 0..5 (cierra H-A-4) |
| `surfaces.shadows.*` | 5 | | `focusRing`, `inner`, `xs`, `xxl` |
| `charts.value.*` | 7 | | |
| `typography.{headingLetterSpacing,headingWeightBias,labelStyle}` | 3 | | |
| `modes.dark.typography` | 3 | bithire | |

**B. Detalle de chrome — un overlay bounded NO debe clonarlo (908 hojas)**

- `modes.light.chrome` 508 (rottay) + `modes.dark.chrome` 295 (bithire 289, evnto 32) = **803**.
  Es art direction por modo, familia por familia. Clonarlo es exactamente lo que revienta el límite
  de 65.536 bytes (`limits.maxDocumentBytes`) y lo que la ley llama "clon exhaustivo".
- `chrome.*` de nivel raíz **105**, y aquí sí hay una distinción útil que ninguno de los tres hizo:
  - **69 hojas en 6 familias que el schema DB no tiene en absoluto**:
    `list`(18) `surface`(17) `detail`(13) `premiumCard`(10) `accent`(6) `card`(5).
    `Object.keys(Theme.chrome)` = 54; el schema admite 48; el delta son exactamente esas 6.
  - **36 hojas en familias que el schema SÍ tiene** pero con llaves distintas:
    `badge`(16) `controls`(13) `sidebar`(4) `shell`/`table`/`tooltip`(1 c/u).

**C. Gobernanza — correctamente fuera (18 hojas)**

`capabilities.*` 13 + `{engineBridge,expressive,recipes,responsive}.disposition` 4 +
`appearance.defaultMode` 1. Que el DB no los alcance es la ley funcionando, no un hueco.

---

## Tarea 4 · El contrato: ¿expresar todo, o producir salida idéntica?

Tres textos, los tres en la misma dirección.

1. `customization-model/index.json:77-87` — `transportEquality.law`:
   > "Static BrandTheme and DB TenantThemeDocument are transports only. Both resolve to the same
   > complete nested Theme and enter exactly one compileTheme. **Equivalent values** produce identical
   > keypaths, channel inventory, deterministic order, CSS and digest."

   La cláusula está **condicionada a `equivalent values`**. Es una ley de determinismo y de
   un-solo-compilador, no de completitud expresiva. Los cinco `forbidden` lo confirman
   (`second compiler`, `subset/intersection parity fixture`, `invented neutral Theme`,
   `silent default vertical`, `slug or product branch in compiler`): todos prohíben *bifurcar el
   compilador o falsear la paridad*; ninguno exige que el DB pueda decir todo.

2. `scripts/quality-evidence/programs/modern-rescue/README.md:86-90` — misma frase, con el matiz
   explícito: *"produce identical keypaths … **for equivalent values**"*.

3. `tests/static-db-channel-vocabulary.test.ts:13-23` — el DS lo dice sin rodeos:
   > "The honest relation between the two sets **is not equality** and this test does not pretend
   > otherwise. The static path is a whole product identity… The DB path is a **BOUNDED subset** a
   > customer is trusted to author. So the law asserted here is: … every channel the DB path emits is
   > also emitted by the static path. … **Static-only channels are expected and inventoried, not
   > failed on.**"

Y `expert.newEntryRequirements` incluye `static-db-path-parity` como requisito **para entradas
nuevas del DB** — es decir, la dirección normativa es **DB ⊆ estático**, la contraria a la que
H-A-2 exige.

**Adjudicación: la ley exige que valores EQUIVALENTES produzcan salida idéntica. NO exige que el DB
exprese todo lo que el estático expresa. Codex tenía razón.** Cloud citó ese mismo test como "nota de
honestidad" y aun así clasificó H-A-2 como **BLOQUEANTE** — es decir, marcó como bloqueante el
cumplimiento de la ley escrita. Un hueco de capacidad de producto puede ser real (§ Tarea 3.A) y a la
vez no ser una violación de contrato; H-A-2 confunde las dos cosas.

**Lo que sí queda en pie de H-A-2**, y merece sobrevivir con otro nombre: 6 familias de chrome
(`list`, `surface`, `detail`, `premiumCard`, `accent`, `card`) existen en el `Theme` y **no existen en
el schema DB**; y el overlay de modo es inexpresable más allá de 10 semillas. Eso es un backlog de
capacidad dirigido, no un 72,6 %.

---

## Tarea 5 · Dark mode: deliberada, documentada… y muda en el editor

**Confirmado (`migrate-v1/index.ts:381-393`)**: `paletteFields()` produce exactamente 10 llaves.
El barrido maximal da `modes.*` = **20 hojas**, 10 en `modes.light.palette` y 10 en
`modes.dark.palette`, cero `typography` / `surfaces` / `chrome`. Contra lo que los verticales autoran
por modo (mismo instrumento, `P5-pervert.mjs`):

```
bithire  dark  palette 121  typography 3  surfaces 79  chrome 289  TOTAL 492
evnto    dark  palette 105  typography 0  surfaces  1  chrome  32  TOTAL 138
rottay   light palette 135  typography 0  surfaces 15  chrome 508  TOTAL 658
```

(reproduce H-A-3 al dígito). Detalle que Cloud no nombró y cambia la lectura: **rottay es dark-first**
— autora un overlay `light`, no `dark`. El transporte DB deja fuera 482/492, 128/138 y 648/658.

**Confirmado que el descarte es silencioso** (`P5-darkprobe.mjs`, con controles positivos):

```
backgroundMode=light -> success:true   (el bloque `dark` completo viaja a `data`, validado)
backgroundMode=dark  -> success:true
backgroundMode=auto  -> success:true
CONTROL unknown key  -> success:false  {"code":"unknown_key","path":"$.appearance.palette.notAKey"}
CONTROL bad color    -> success:false  {"code":"unsafe_value","path":"$.appearance.palette.primary"}
```

Y el patch resultante con `backgroundMode:'dark'` + 12 colores dark autorados:

```json
{"palette":{"primaryColor":"#0F766E", … 10 llaves del bloque SUPERIOR}}
```

Cero rastro de los 12 colores `dark`. El editor: (a) los escribe, (b) recibe `success:true`,
(c) los ve persistidos en `data`, (d) nunca los ve pintados, (e) **no recibe ningún aviso**.
No existe código `ignored_field` / `inert`: los 5 códigos de issue son `invalid_type`, `unknown_key`,
`invalid_value`, `unsafe_value`, `unsupported_schema_version` — todos estructurales.

**Adjudicación**: Kimi tiene razón en que es **deliberada** — está argumentada en dos lugares
(`migrate-v1/index.ts:400-406` y `brand-studio/runtime/file-export/index.ts:315-327`, que razona por
qué "ambos modos existen" ≠ `auto`). Cloud tiene razón en que es **silenciosa**: documentada en el
código, invisible en el editor. Las dos cosas son ciertas y no se contradicen. `deliberada` describe
al autor del compilador; `silenciosa` describe al usuario del editor.

---

## Tarea 6 · Hojas vs diales

**Los cuatro conteos reproducen exactos** (walker sobre `TENANT_THEME_CONFIG_SCHEMA.documents.advanced`
importado de FUENTE):

```
document advanced leaves: 2212   |  by type {"literal":2,"string":2139,"enum":23,"number":48}
  string:visual-value 2080 · string:hex-color 30 · string:color 20 · string:font-family 9
  chrome-prefixed 1875 · enum 23 · editorMetadata 0
document simple  leaves:   38
```

Pero el reparto desarma la lectura de "2.212 diales":

```
1875  visualFoundation.advanced.chrome       (48 familias; mediana 15 hojas; máx controls 607)
 290  visualFoundation.advanced.tokenOverrides   (= S.overrideTokens.length = 290)
  36  visualFoundation.general                (palette 21, typography 4, motion 3, shape 2, surfaces 2,
                                               density/rhythm/navigation/experienceProfile 1 c/u)
   7  visualFoundation.advanced.profiles      (type, geometry, edge, material, elevation, motif, icon)
   4  resto (schemaVersion, mode, responsivePosture, recipeProfile)
```

**36 general + 7 profiles = las 13 Standard + 7 Pro de la constitución.** Los 1.875 + 290 son la
escotilla Expert, un campo por canal — y la ley ya dice qué forma debe tener:
`customization-model/index.json` → `expert.presentation`: **"Searchable domain browser with preview, not 294
sliders."** Hoja ≠ dial no es una opinión de Codex; es texto normativo del programa.

**Qué ve el editor** (`app-platform/.../tenant-theme-console/index.tsx:672-694, 795-836`):
un `Select` de **49 opciones** (48 familias `Chrome · X` + `Token overrides`), un `Input` de filtro, y
`SchemaObjectEditor` sobre **una sola** familia. Nunca recorre el schema entero. Codex tenía razón.

**Veredicto RC-07**: "2.212 hojas contradicen 'pocas decenas de diales'" → **REFUTADA**. El modelo
operativo (13+7) y la superficie Expert son dos objetos distintos y ambos están codificados. Lo que
sobrevive, y con más fuerza de la que los tres le dieron, es la ergonomía Expert (§ N2).

---

## Causalidad y severidad

| Ítem | Productor | Canal | Consumidor | Severidad honesta |
|---|---|---|---|---|
| 72,6 % | `mergeDefaultShape` (normalización) | ninguno — son `undefined`, no se emiten | ninguno | **no es un defecto**: es la métrica mirando el andamio |
| 6 familias chrome fuera del schema | `TENANT_THEME_CONFIG_SCHEMA` | 69 keypaths sin campo | tenant DB | **MEDIA** — hueco de capacidad dirigido y barato de cerrar |
| overlay de modo ≤ 10 semillas | `migrate-v1:381-393` | `modes.*.palette` | tenant DB | **ALTA** — 71-75 % del hueco real por vertical |
| `palette.dark` descartado sin aviso | `migrate-v1:407-409` | ninguno | editor humano | **ALTA para DX** — el editor no puede distinguir "guardado" de "aplicado" |
| filtro Expert de profundidad 1 | `index.tsx:382-388` (no propaga `filter`) | UI | admin | **MEDIA-ALTA** (§ N2) |

---

## Fix correcto (tipo, sin implementar) y fixes que NO deben ejecutarse

**Hacer**

1. `migrate-v1`: emitir un `TenantThemeValidationIssue` nuevo — clase `ignored_field`, no
   `invalid_*` — cuando `palette.dark` está poblado y `backgroundMode !== 'auto'`. Es el fix de mayor
   relación DX/esfuerzo de todo este informe, y no toca ni el compilador ni la ley.
2. Abrir en el schema v1, en este orden (todos son hojas contadas, no familias enteras):
   `modes.dark.surfaces` + `modes.dark.typography` (~30 hojas) · `palette.ramps` (80) ·
   `surfaces.elevations` (6). Cada uno bajo los 8 `expert.newEntryRequirements`, incluido
   `static-db-path-parity`.
3. Reencuadrar RC-06: severidad **MEDIA**, título por capacidad ("el overlay de modo y 6 familias de
   chrome no viajan"), sin porcentaje en el título. Si se quiere un número, que sea el per-vertical
   (43,4 % / 58,8 % / 52,8 %) con su método al lado.
4. `SchemaObjectEditor`: propagar `filter` en la recursión y hacerlo matchear el keypath completo.
5. `editorMetadata` (`group/order/labelKey/helpKey/controlKind/plan`) en el schema — ya está
   especificado en `customization-model/index.json:411-417` y tiene **0 implementación en `src`**.

**No hacer**

- Abrir `modes.*.chrome` (803 definidas / 4.012 declaradas). Revienta `maxDocumentBytes: 65536`,
  y es exactamente el "clon exhaustivo" que la ley excluye.
- Abrir `surfaces.materials` (168 hojas, **0 autoradas por nadie**). Cloud lo listó como pérdida de
  identidad; es una familia muerta.
- Usar 72,6 % como criterio de aceptación o de priorización.
- Los 6 diales nuevos de RC-07 (fuera de mi alcance, pero: `targetControlModel.implementationState`
  = `PROPOSED_NOT_IMPLEMENTED` y su `law` exige migración atómica con retiro del predecesor).

---

## Hallazgos nuevos que ninguno de los tres vio

**N1 · El denominador de Cloud es el tamaño de un dispositivo de normalización, y está documentado
como tal.** `themes/iso/shape/index.ts:1-9` define `DEFAULT_CHROME_SHAPE` como "la unión de todo
keypath de chrome **autorado por los tres temas**", cuyo fin es que los tres sean "structural
mirrors". `normalizeModeOverlays` (`iso/index.ts:762-780`) lo aplica a `light` **y** `dark` para todo
vertical. Prueba: los tres verticales tienen exactamente el mismo set de 7.935 keypaths (0 diferencia
en las 6 direcciones). Ninguno de los tres auditores midió esto; es el hecho que cierra el debate.

**N2 · El filtro Expert del editor sólo mira profundidad 1 — 606 de las 607 hojas de
`chrome.controls` son inalcanzables por búsqueda.** `SchemaObjectEditor` (`index.tsx:340-344`) filtra
las llaves del nivel actual, y la llamada recursiva (`:382-388`) **no propaga `filter`**. Efecto en la
familia más grande:

```
chrome.controls: 607 hojas | hojas directas (filtrables): 1 | 32 subgrupos opacos
  (buttonGeometry 69, fieldGeometry 81, input 70, segmented 41, select 33, upload 22, …)
Agregado sobre las 48 familias: 1.262 de 1.875 filtrables (67,3 %); sólo 2 familias
tienen anidamiento — `controls` (606 ocultas) y `search` (7).
```

Además el filtro matchea `humanizeKey(key)`, no el keypath, y las etiquetas salen de `humanizeKey`
(sin `labelKey`/`helpKey`). Kimi acertó al decir que "la ergonomía Expert es lo que sobrevive"; el
defecto concreto está aquí y es de una línea (pasar `filter` en la recursión).

**N3 · 863 hojas son alcanzables por el DB y no las autora ningún vertical** — el DB puede escribir
donde ningún producto propio escribe. Y 28 keypaths son estrictamente **sólo-DB**:
`chrome.toolbar.{solid,soft,ghost,outline}{Bg,Border,Color,Shadow}` (14),
`chrome.controls.buttonGeometry.*.paddingY` (5), `chrome.controls.fieldGeometry.*.gap` (5),
`chrome.controls.segmented.*.paddingY` (3), `charts.value.categoryColors[]` (1).
**No es violación de ley**: el tipo `BrandToolbarChrome` sí declara `ghostBg`/`outlineBg`/`softBg`/
`solidBg` (`themes/index.ts:1126-1136`); lo que no los materializa es `DEFAULT_CHROME_SHAPE`, que por
diseño es la unión de lo *autorado*, no del tipo. Pero sí desmiente la lectura "el estático es
superconjunto del DB" a nivel de keypath materializado, y `charts.value.categoryColors` es además un
artefacto de normalización de arrays en el propio instrumento de Cloud.

**N4 · Las dos aperturas que Cloud llama de mejor relación esfuerzo/impacto son rottay-only.**
`palette.ramps`: rottay autora las 8 rampas completas (80 hojas), bithire y evnto sólo `neutral`
(10 c/u). `surfaces.elevations`: **sólo** rottay autora los 6 niveles; bithire y evnto autoran cero.
Abrirlas no cierra el hueco de bithire ni de evnto.

**N5 · Discrepancia 294 vs 290 en el allowlist Expert.** `expert.exactAllowlistBaseline: 294` en
`customization-model/index.json`, contra `TENANT_THEME_CONFIG_SCHEMA.overrideTokens.length === 290` y 290
hojas en `tokenOverrides`. Codex la nombra en su §1 como "contradicción 294/290/67"; la confirmo desde
fuente y la dejo a P1 (allowlist/schema), que es su brazo.

---

## Lo que no pude cerrar

- **Bytes reales de un documento maximal** contra `maxDocumentBytes: 65536`. Mi doc maximal es
  sintético (valores sonda), no un documento de tenant real; el argumento "abrir `modes.*.chrome`
  revienta el límite" es dimensional, no medido. Requeriría serializar un documento con valores
  plausibles por hoja.
- **`compileTenantThemeConfig` end-to-end**: medí `validateTenantThemeConfig` + `migrateV1`. No
  compilé a CSS ni comparé digests entre transportes (exigiría el pipeline completo y probablemente
  artefactos de `dist`, fuera de mi mandato read-only).
- **El piso APCA que Cloud dice que "salva por accidente"** el caso `backgroundMode:'dark'` + semillas
  claras: no lo reproduje; mi documento dark usa semillas dark coherentes y pasa validación limpia.
  La afirmación de Cloud sobre `Lc 7.8` queda sin verificar por mí.
- **Si algún tenant real en DB tiene `palette.dark` poblado con `backgroundMode ≠ auto`** — no toqué
  ninguna base. Es la consulta que convertiría N-de-DX en incidente contado.
