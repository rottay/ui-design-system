# K5 — brief consolidado y autocontenido: los 57 docblocks en UN lote (Cloud Opus, diseño READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · **staged 0**

**Reemplaza** el brief K5a-prime angosto (`0c8f6452a09b09920fab93c2eb94fc2a7fc10d2c5c02948834ccdcb017c80d00`),
que fragmentaba el frente y dejaba 22 hojas pendientes obligando otra regeneración de la clausura derivada.

**Autoridades reconciliadas (SHA-256 recomputados, los seis byte-exactos):**

| documento | SHA-256 |
|---|---|
| brief K5 corregido v2 `/private/tmp/f4a-k5-opus-corrected-implementation-brief-v2.md` | `82d6680951a8d618873b0334bfa4e7bca9d778bfab1952d51558fb171f2f72b1` |
| convergencia Fable `/private/tmp/f4a-k5-remaining-fable-convergence.md` | `93fdac170f0e85fc888bbb26f486341d3b166928fd4b72782cc20b2c860c3b70` |
| ruling K5a v2 — **nombre real `/private/tmp/f4a-k5a-dt-ruling-v2.md`** (el encargo lo cita como `f4a-k5a-ruling-v2.md`; localizado sin inferir contenido, SHA idéntico) | `d11bdec2beae9f0e8b657738e66d1014300ba554176abca897d27fd8087898cf` |
| brief K5a-prime (superado por éste) `/private/tmp/f4a-k5a-prime-opus-brief.md` | `0c8f6452a09b09920fab93c2eb94fc2a7fc10d2c5c02948834ccdcb017c80d00` |
| inventario exacto Sonnet `/private/tmp/f4a-k5-sonnet-exact-inventory.md` | `5aec638dd0a7d128fbab1c53e0ed62a07565c8fbe54324f28f7634963ba6fa28` |
| las 30 medidas `/private/tmp/f4a-k5-opus-measured-30.md` | `13cb7315cbc964281e92db122fc72135238e139767d2c29d5f5cf0923e94e50d` |

**Sesión:** cero writes al repo, cero tests pesados/generadores/build/browser, cero git mutante. **Kimi fuera.**

**Precondición:** **D-1 (frescura de `manifest/index.json`, deuda K4) cerrado con postaudit Fable ACCEPT**
antes de cualquier write de K5. Medido ahora: D-1 **ya escribió** (`manifest/index.json` dirty) y su
postaudit **está pendiente**. **Al abrir K5 hay que RE-PINEAR HEAD/staged/porcelain** — el pre-estado
esperable pasa a **12 dirty**, no 11.

---

# VERDICT: READY_FOR_FABLE_PREAUDIT

Las cinco verdades auditadas quedan **verificadas de forma independiente contra el árbol**, y el lote es
autocontenido: **los 57 governors están escritos abajo, literales**. Sonnet no inventa ninguno.

---

## 1. Verdad auditada — verificada por mí, no aceptada

| claim | mi medición | ✓ |
|---|---|---|
| 57 docblocks nuevos | rottay **17** + bithire **36** + evnto **4** = **57** | ✓ |
| rottay conserva `headerColor derived` | bloque base rottay: **18 hojas, 1 ya tagueada** (`headerColor`, `@domicile derived`, `deriva de: --ds-color-text-page`) ⇒ 17 a escribir | ✓ |
| bithire +36 | bloque base bithire: **36 hojas, 0 tagueadas** | ✓ |
| evnto +4 | bloque base evnto: **4 hojas, 0 tagueadas** | ✓ |
| retirar 1 family tag stale | `rottay/index.ts:7258-7259`: `@domicile unassigned` / `@governor gap medido: … la prueba por hoja aterriza en su lote **F4A-7…15**` — **estamos en F4A-15: la promesa vence en este lote** | ✓ |
| 8 derived + 49 seed | rottay 3+14 · bithire 5+31 · evnto 0+4 ⇒ **8 + 49 = 57** | ✓ |
| tagRegistry 4099 → 4155 | medido hoy **4099**; `4099 + 57 − 1 = 4155` (el −1 es el family tag retirado) | ✓ |
| untaggedAuthoredLeaves 40 → 0 | medido hoy **40**; las 40 son exactamente bithire 36 + evnto 4 ⇒ **0** | ✓ |
| divergentSlots sigue 33 | medido hoy **33**; ningún paso siembra placeholders (K5c va aparte) | ✓ |
| cero cambio de valores | los 57 son **docblocks**; ningún literal se toca | ✓ |

**Por qué NO fragmentar (el argumento del encargo, confirmado):** un lote de 35 dejaría **22** hojas
pendientes — rottay `bg, rowBg, cellFontSize, rowBorder, cellPadding, loadingOverlayBg, headerFontSize`
(7); bithire `border, actionBorder, headerBorder, headerShadow, headerBg, headerColor, headerBgHover,
resizeBgHover, resizeBg, bg, rowBg, actionBg, headerFontSize, loadingOverlayBg` (14); evnto `headerColor`
(1). **7+14+1 = 22**, y `57 − 35 = 22`: la partición cierra. Ese resto obligaría a **repetir entera** la
clausura derivada de 9 artefactos, con su segundo re-anclaje de `basedOnReportDigest`. **Un solo lote.**

**Nota de vocabulario medida:** la ley del `tagRegistry` todavía enumera
`seed | baseline | derived | pro-expert | unassigned`. **`baseline` sigue vivo en la máquina** — es la
deuda separada de §7, y **ningún governor de este lote lo usa**.

---

## 2. Los 57 governors, literales — ROTTAY (17)

Bloque base `rottay/index.ts` (ancla vigente `:7261`; **identidad = keypath**, la línea se re-ancla).
**Forma exacta del docblock**, inmediatamente encima de la hoja, con la indentación del bloque:

```
    /**
     * @domicile <tag>
     * @governor <texto exacto de la tabla>
     */
```

### 2.1 `derived` (3)

| keypath | governor exacto |
|---|---|
| `CHROME.table.headerBlockSize` | `deriva de: --ds-input-md-height` |
| `CHROME.table.headerLetterSpacing` | `deriva de: --ds-text-eyebrow-letter-spacing` |
| `CHROME.table.cellFontSize` | `deriva de: --ds-text-body-size` |

### 2.2 `seed` (14)

| keypath | governor exacto |
|---|---|
| `CHROME.table.bg` | `coincide en color con la emision de tier.base.bg; byte-identico medido (#0C0C0E)` |
| `CHROME.table.rowBg` | `coincide en color con la emision de tier.base.bg; byte-identico medido (#0C0C0E)` |
| `CHROME.table.rowBorder` | `coincide en color con la emision de --ds-border-color-muted (delta medido +17)` |
| `CHROME.table.cellColor` | `coincide en color con la emision de PALETTE.textColor (rottay/index.ts:3533, #ECECEC), mismo rol de tinta de texto: relacion declarada; la otra coincidencia (linkColor, rottay/index.ts:3484) es de rol distinto; cardinalidad medida 2` |
| `CHROME.table.border` | `sin coincidencia con PALETTE.borderColor (rottay/index.ts:3466, #28282C); la unica coincidencia de valor en PALETTE es interactiveBgActiveColor (rottay/index.ts:3512), rol distinto: accidente declarado; cardinalidad medida 1` |
| `CHROME.table.headerBg` | `sin coincidencia con ninguna clave de PALETTE ni con raiz del catalogo; converge con CHROME.table.rowBgStriped del mismo bloque (mismo valor #131316), convergencia interna de familia declarada; cardinalidad medida 0 en PALETTE` |
| `CHROME.table.rowBgStriped` | `sin coincidencia con ninguna clave de PALETTE ni con raiz del catalogo; converge con CHROME.table.headerBg del mismo bloque (mismo valor #131316), convergencia interna de familia declarada; cardinalidad medida 0 en PALETTE` |
| `CHROME.table.rowBgHover` | `sin coincidencia: el valor no aparece en ninguna otra clave del tema (cardinalidad medida 0); superposicion alfa propia del eje` |
| `CHROME.table.rowBgSelected` | `sin coincidencia: el valor no aparece en ninguna otra clave del tema (cardinalidad medida 0); no coincide con --ds-select-option-bg-selected (artefacto rottay #2A2A2F), a diferencia del mismo eje en bithire` |
| `CHROME.table.headerFontWeight` | `sin coincidencia con PALETTE ni con raiz; converge con el valor autorado por bithire para el mismo eje (600) y diverge de evnto (500); cardinalidad medida 4, toda en claves de rol font-weight` |
| `CHROME.table.sheen` | `valor keyword none: declara ausencia de efecto, no un color; sin coincidencia de color posible` |
| `CHROME.table.cellPadding` | `sin coincidencia medida con raiz ni canal vivo (limpia, K-4 packet v2)` |
| `CHROME.table.loadingOverlayBg` | `sin coincidencia medida con raiz ni canal vivo (limpia, K-4 packet v2)` |
| `CHROME.table.headerFontSize` | `sin coincidencia medida con raiz ni canal vivo (limpia, K-4 packet v2)` |

### 2.3 Retiro del family tag (obligatorio en el mismo lote)

Borrar el docblock de familia de `rottay/index.ts:7257-7260` (`@domicile unassigned` + su `@governor gap
medido: …`). **Su retiro es la prueba del lote**, verificable por `grep`: la promesa "aterriza en su lote
F4A-7…15" vence aquí. **`headerColor` NO se toca**: conserva su tag `derived` existente.

---

## 3. Los 57 governors, literales — BITHIRE (36)

Bloque base `bithire/index.ts` (ancla vigente `:7234`). **No tocar** el bloque overlay dark (`:1580`),
ya tagueado con 12 `seed` + 8 `derived`.

### 3.1 `derived` (5) — las 5 ya-derivadas por su propio valor

| keypath | valor medido | governor exacto |
|---|---|---|
| `CHROME.table.cellColor` | `var(--ds-color-text-primary)` | `deriva de: --ds-color-text-primary` |
| `CHROME.table.reorderBg` | `var(--ds-tint-12)` | `deriva de: --ds-tint-12` |
| `CHROME.table.rowHoverShadow` | `…color-mix(… var(--ds-color-primary) 18% …)` | `deriva de: --ds-color-primary` |
| `CHROME.table.rowFocusShadow` | `…var(--ds-color-primary) 28% … 8% …` | `deriva de: --ds-color-primary` |
| `CHROME.table.filterFocusShadow` | `…var(--ds-color-primary) 14% … 12% …` | `deriva de: --ds-color-primary` |

### 3.2 `seed` (31)

**(a) La hoja de dial (1)**

| keypath | governor exacto |
|---|---|
| `CHROME.table.cellFontSize` | `dial: typography.scale` |

**(b) Coincidencia `PALETTE.*` medida (9)** — PALETTE base de bithire a indentación 2
(`primaryColor:3369 #3A6FB0`, `backgroundSecondaryColor:3411 #f3f2ef`, `textPageColor:3452 #53697E`,
`borderColor:3462 #d4e0ea`)

| keypath | governor exacto |
|---|---|
| `CHROME.table.border` | `coincide en color con la emision de PALETTE.borderColor (#d4e0ea)` |
| `CHROME.table.actionBorder` | `coincide en color con la emision de PALETTE.borderColor (#d4e0ea), literal dentro de color-mix()` |
| `CHROME.table.headerBorder` | `coincide en color con la emision de PALETTE.borderColor (#d4e0ea), literal dentro de color-mix()` |
| `CHROME.table.headerShadow` | `coincide en color con la emision de PALETTE.borderColor (#d4e0ea), literal dentro de color-mix()` |
| `CHROME.table.headerBg` | `coincide en color con la emision de PALETTE.backgroundSecondaryColor (#f3f2ef)` |
| `CHROME.table.headerColor` | `coincide en color con la emision de PALETTE.textPageColor (#53697E)` |
| `CHROME.table.headerBgHover` | `coincide en color con la emision de PALETTE.primaryColor (#3A6FB0), literal dentro de color-mix()` |
| `CHROME.table.resizeBgHover` | `coincide en color con la emision de PALETTE.primaryColor (#3A6FB0)` |
| `CHROME.table.resizeBg` | `coincide en color con las emisiones de PALETTE.primaryColor (#3A6FB0) y PALETTE.borderColor (#d4e0ea), ambos literales dentro de color-mix()` |

**(c) Coincidencia con raíz del catálogo — eje H4 (3)**

| keypath | governor exacto |
|---|---|
| `CHROME.table.bg` | `coincide en color con la emision de las raices tier (tier.control.bg, tier.raised.bg, tier.page.bg, tier.overlay.bg); es el eje H4: coincide en base y diverge en dark; el fallback literal del skin es --ds-surface-card (data-table.css:288)` |
| `CHROME.table.rowBg` | `coincide en color con la emision de las raices tier (tier.control.bg, tier.raised.bg, tier.page.bg, tier.overlay.bg); es el eje H4: coincide en base y diverge en dark; el fallback literal del skin es --ds-surface-card (data-table.css:288)` |
| `CHROME.table.actionBg` | `coincide en color con la emision de las raices tier (tier.control.bg, tier.raised.bg, tier.page.bg, tier.overlay.bg)` |

**(d) Razón falsable ya medida (2)**

| keypath | governor exacto |
|---|---|
| `CHROME.table.headerFontSize` | `sin coincidencia de raiz; razon falsable: converge con el valor autorado por rottay para el mismo eje (mismo valor, convergencia medida)` |
| `CHROME.table.loadingOverlayBg` | `sin coincidencia de raiz; razon falsable: el piso de default.css:1723 ya emite el mismo valor (rgba(255,255,255,0.7)); 0 consumo en modern/skin, consumido en rustic/skin/data-table.css:101` |

**(e) Rol anclado / accidente declarado — las 12 graduadas**

| keypath | governor exacto |
|---|---|
| `CHROME.table.rowBgHover` | `coincide en color con itemBgHover (bithire/index.ts:4411) y resultBgHover (bithire/index.ts:5399), mismo rol de fondo hover: relacion declarada; sin coincidencia con PALETTE; cardinalidad medida 13` |
| `CHROME.table.filterRowBg` | `coincide en color con el tinte compartido #F4F8FD del tema pero en roles distintos (fondos de input/hover): accidente declarado; converge internamente con rowBgHover y rowBgExpanded del mismo bloque; cardinalidad medida 13` |
| `CHROME.table.rowBgExpanded` | `coincide en color con el tinte compartido #F4F8FD del tema pero en roles distintos: accidente declarado; converge internamente con rowBgHover y filterRowBg del mismo bloque; cardinalidad medida 13` |
| `CHROME.table.rowBgSelected` | `coincide en color con --ds-select-option-bg-selected (#e8f3ff), mismo rol de fondo de opcion/fila seleccionada: relacion declarada; sin coincidencia con PALETTE; cardinalidad medida 1` |
| `CHROME.table.rowBorder` | `coincide en color con la familia de rol borde/divisor del tema — divider (bithire/index.ts:4854), resultBorder (:5404), headerBorder (:7380), footerBorder (:7436) —: relacion por rol declarada; no coincide con PALETTE.borderColor (:3462, #d4e0ea); cardinalidad medida 13` |
| `CHROME.table.pageButtonHoverShadow` | `coincide con el peldano sm de la escala de sombra del tema (bithire/index.ts:580), mismo rol de elevacion baja: relacion declarada; cardinalidad medida 8, toda en claves de rol shadow` |
| `CHROME.table.headerTextTransform` | `coincide con --ds-text-eyebrow-transform (uppercase), la rampa a la que default.css:1714 enruta este canal: relacion por rol declarada; cardinalidad medida 1` |
| `CHROME.table.headerBlockSize` | `coincide con mdHeight (bithire/index.ts:8809), mismo rol de altura de control md: relacion declarada; NO coincide con --ds-input-md-height (artefacto bithire, 36px); cardinalidad medida 2` |
| `CHROME.table.headerFontWeight` | `coincide con la familia de rol font-weight del tema — groupFontWeight (bithire/index.ts:4346), itemFontWeightActive (:4391), labelFontWeight (:5791), itemFontWeightSelected (:6099) —: relacion por rol declarada; converge ademas con el valor autorado por rottay para el mismo eje (600) y diverge de evnto (500); cardinalidad medida 7` |
| `CHROME.table.radius` | `el propio archivo declara la relacion en bithire/index.ts:7237 ("Tables/panels ride the lg radius step"), pero el valor DIVERGE del peldano: --ds-radius-lg-base = calc(14px / 1.25) = 11.2px frente a 10px autorado; se declara la relacion escrita y su divergencia medida; cardinalidad medida 14` |
| `CHROME.table.cellPaddingComfortable` | `coincide con padding (bithire/index.ts:8061), mismo rol de padding de celda/control: relacion declarada; cardinalidad medida 2` |
| `CHROME.table.sheen` | `valor keyword none: declara ausencia de efecto, no un color; sin coincidencia de color posible` |

**(f) Valor exclusivo del eje / divergencia de rampa (4)**

| keypath | governor exacto |
|---|---|
| `CHROME.table.rowBgStriped` | `sin coincidencia con PALETTE, con raiz del catalogo ni con ninguna otra clave del tema: valor exclusivo de este eje (cardinalidad medida 1)` |
| `CHROME.table.cellPaddingCompact` | `sin coincidencia con PALETTE ni con ninguna otra clave del tema: valor exclusivo de este eje (cardinalidad medida 1); es el peldano compacto del eje de densidad` |
| `CHROME.table.cellPaddingSpacious` | `sin coincidencia con PALETTE ni con ninguna otra clave del tema: valor exclusivo de este eje (cardinalidad medida 1); es el peldano espacioso del eje de densidad` |
| `CHROME.table.headerLetterSpacing` | `sin coincidencia con PALETTE; DIVERGE de --ds-text-eyebrow-letter-spacing (0.08em), la rampa a la que default.css:1713 enruta este canal: divergencia medida declarada; cardinalidad medida 1` |

**Recuento bithire:** 5 derived + (1+9+3+2+12+4 = 31) seed = **36** ✓

---

## 4. Los 57 governors, literales — EVNTO (4, todas `seed`)

Bloque base `evnto/index.ts` (ancla vigente `:4200`).

| keypath | governor exacto |
|---|---|
| `CHROME.table.headerColor` | `coincide en color con la emision de PALETTE.textMutedColor (#737373)` |
| `CHROME.table.headerBg` | `sin coincidencia con PALETTE, con raiz del catalogo ni con ninguna otra clave del tema: valor exclusivo de este eje (cardinalidad medida 1)` |
| `CHROME.table.headerFontSize` | `sin coincidencia con PALETTE ni con ninguna otra clave del tema (cardinalidad medida 1); NO converge con el valor autorado por bithire para el mismo eje (0.6875rem): la razon de convergencia que aplica en bithire seria falsa aqui` |
| `CHROME.table.headerFontWeight` | `coincide con itemFontWeightActive (evnto/index.ts:2656), mismo rol de font-weight: relacion declarada; DIVERGE del valor autorado por rottay y bithire para el mismo eje (600): divergencia medida declarada; cardinalidad medida 2` |

---

## 5. Write-set: 12 paths absolutos, orden vinculante, comandos Node 22

**Los tres temas primero; después UNA sola clausura derivada, en este orden.** Un paso por vez.
Todos los comandos con **cwd `/Users/daniel/Developer/Rottay/ui-design-system/packages/core`** y **Node v22.17.0**.

| # | path absoluto | modo | comando | delta esperado / invariante |
|---|---|---|---|---|
| 1 | `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/foundation/tokens/ts/presentation/brand-themes/rottay/index.ts` | mano | — | +17 docblocks (§2) y **−1 docblock de familia**; cero valores |
| 2 | `…/packages/core/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts` | mano | — | +36 docblocks (§3); cero valores; post-hash de los 6 de K5a compatible con `c649962d…` sólo si se aplicaran **solamente** esos 6 — **aquí NO aplica**: son 36, el hash será otro |
| 3 | `…/packages/core/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts` | mano | — | +4 docblocks (§4); cero valores |
| 4 | `…/packages/core/manifest/generated/variant-parity.json` | productor | `node manifest/variant-parity/index.mjs` | **check intermedio:** `--check` debe fallar con **EXACTAMENTE** `untaggedAuthoredLeaves SHRANK from 40 to 0`; otro finding → STOP |
| 5 | `…/packages/core/manifest/variant-parity/variant-parity.baseline.json` | **mano** | — | **UNA sola Baja #14: 40 → 0**. Tras editar: `--check` verde, contador **0**, `divergentSlots` **33**, `tagRegistry` **4155** |
| 6 | `…/packages/core/manifest/generated/fanout-facts.json` | productor | `node manifest/fanout-facts/index.mjs` | **sets y conteos de canales IDÉNTICOS**; sólo líneas/posiciones |
| 7 | `…/packages/core/manifest/generated/root-checklists.json` | productor | `node manifest/root-checklist/index.mjs` | **DESPUÉS de 6** (proyecta fanout). **Sets de roots/channels IDÉNTICOS**; cambian **referencias de línea** |
| 8 | `…/packages/core/manifest/generated/mirror-parity.json` | productor | `node manifest/mirror-parity/index.mjs` | **DESPUÉS de 7** (su build lee checklists). Huellas `bytes/lines/sha256` de los **tres** temas actualizadas; resto inmóvil |
| 9 | `…/packages/core/scripts/tokens/customization-surface-census/customization-surface-report.json` | productor | `node scripts/tokens/customization-surface-census/index.mjs --write` | sólo `meta.inputsDigest`. **PROHIBIDO `--write-baseline`** |
| 10 | `…/packages/core/scripts/tokens/catalog/customization-reconciliation.json` | **mano** | — | **un solo campo**: `basedOnReportDigest` `1ec7b279…` → sha256 del report del paso 9. **Décimo re-anclaje** de esa deuda; el asiento lo registra como tal. **Prohibido `tokens:catalog:write`** (su OUT no fue medido) |
| 11 | `…/packages/core/scripts/tokens/kimi-preservation-manifest/KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json` | productor | `node scripts/tokens/kimi-preservation-manifest/index.mjs --write` | deriva del digest del report. **El nombre de archivo es legado, no un actor**: Kimi está fuera de la cadena y esto no lo reintroduce |
| 12 | `…/packages/core/tokens/controls/README.md` | productor | `node scripts/tokens/controls-catalog/index.mjs --write` | tablas Standard/Pro **idénticas**; sólo el digest embebido |

**Cadena obligatoria 6 → 7 → 8.** Invertirla produce un mirror armado sobre checklists viejos: verde por
accidente. **Los únicos pasos manuales son 1, 2, 3, 5 y 10**; cualquier otro archivo editado a mano → STOP.

---

## 6. Aceptación

**Contadores:** `untaggedAuthoredLeaves` **40 → 0** · `divergentSlots` **33 → 33** ·
`tagRegistry` **4099 → 4155** (`+57 −1`).
**`--check` verde de los ocho productores:** variant-parity, fanout, root-checklist, mirror, census,
catalog, kimi-preservation, controls-catalog.
**Positiva semántica central:** sets y conteos de canales **idénticos** en fanout y census; sets de
roots/channels **idénticos** en checklists. Sólo se mueven líneas, posiciones y digests.
**Cero materialización:** hash conjunto de `facade/artifacts/` + `styles/` **inmóvil**.
**Retiro probado:** `grep` del family tag de rottay ⇒ **0 ocurrencias**.
**Porcelain:** los preexistentes (**12**, con D-1 ya dentro) + exactamente los 12 del lote.
**R-1 UNA sola vez, al final:** `1719 / 1706 / 12 / 1`, identidad nominal exacta, `export-*` verdes.
**Sin re-ancla. Sin aceptar fallas nuevas. Sin build.**

**Negativas** (cada una bajo backup, revertida por hash):
- **N-1 mordida por artefacto:** revertir **uno** de los 7 regenerados ⇒ **su** `--check` rojo.
- **N-2 mordida del tag:** retirar el docblock de `bithire CHROME.table.cellColor` ⇒ el contador debe
  reportar **`GREW 1`** (de 0 a 1). Prueba que el tag —no el artefacto— mueve el contador.
- **N-3 mordida del retiro:** retirar los 17 docblocks de rottay **sin** borrar el family tag ⇒ el
  contador **no** debe moverse (seguían cubiertas); borrar el family tag **sin** los 17 ⇒ **sube 17**.
  Es la única negativa que prueba que la cobertura cambió de dueño y no de existencia.
- **N-4 aislamiento:** ningún path 13.º en el porcelain.

---

## 7. Fuera de este lote (explícito, no se mezcla)

- **Sidecar `semantic-groups` + gate** — tranche propio, tras K5.
- **K5c placeholder `evnto × CHROME.table.border`** — único admisible; mueve `divergentSlots`, jamás
  `untaggedAuthoredLeaves`. **No en este lote.**
- **Retirar `baseline` de `DOMICILES`** — deuda separada; medido: el vocabulario cerrado del `tagRegistry`
  aún lo enumera. Ningún governor de §2-§4 lo usa.
- **Los tres canales muertos** (`filterRowBg`, `filterFocusShadow`, `loadingOverlayBg`) — decisión propia,
  con el inventario de **emisiones default** que exige P2-4 (medido: `loading-overlay-bg` **sí** está en el
  `:root` de `default.css`; los dos `filter-*` **no**).
- **GAT-07** — **sello derivado SEPARADO** (`test-artifacts/gates/gat-07/semantic-evidence.json` +
  `semantic-hash.txt`, vía `pnpm gat07:write`), **después del postaudit del source** y **antes de
  `gates:ci`**. Medido: se ensucia (su `broadAuditInputFiles()` camina `packages/core/src/**` y alimenta
  el digest `audit-input`), pero **no enrojece pierna 1** (sus dos tests tienen **0** referencias a
  frescura del artefacto, y gat-07 no está entre las 12 de R-1). Su propio error codifica la ley:
  *"run `gat07:write` **after the documentation seal is committed**"*.

---

## 8. Restore V-1

Prehashes de los 12 + hash conjunto de `facade/artifacts/` + `styles/` **antes** de escribir; porcelain
entero pineado; **write-set limpio path por path** (si uno viene sucio → PARAR); respaldo por **`cp`** a
`/private/tmp/<lote>-backup/<ruta relativa>` verificado por hash, con `existía=yes` por path.
**Restore = copiar de vuelta** → re-hashear → exigir igualdad con el prehash → **diff del porcelain
entero**; sólo pueden diferir los 12. **Restore parcial válido y preferible**: si para en el paso N, se
restauran sólo los ya escritos, en orden inverso, cada uno verificado.
**Prohibidos** `git show HEAD:path > path`, `checkout`, `restore`, `reset`, `stash`, `add`, `stage`,
`commit`, `push`, R7. **Todo dirty ajeno se preserva.**

---

## 9. Stop conditions

**S-0** D-1 sin postaudit ACCEPT → el lote **no se libera**. **S-1** el pre-estado no se re-pinea (12 dirty
esperables) → PARAR. **S-2** un **valor** de tema cambia → PARAR: K5 clasifica, no materializa.
**S-3** aparece `@domicile baseline` en cualquier write → PARAR (§7). **S-4** el paso 4 no falla con
**exactamente** `untaggedAuthoredLeaves SHRANK from 40 to 0` → PARAR. **S-5** el contador final ≠ **0**,
`divergentSlots` ≠ **33** o `tagRegistry` ≠ **4155** → PARAR. **S-6** el family tag de rottay sobrevive →
PARAR: el lote no cumplió su prueba. **S-7** un **conteo semántico** se mueve en fanout, census o
checklists → contaminación por comentario → PARAR y **reformular el governor, nunca el gate**.
**S-8** se edita a mano un generado (los manuales son sólo 1, 2, 3, 5, 10) → PARAR. **S-9** se ejecuta 8
antes de 7, o 7 antes de 6 → PARAR: verde por accidente. **S-10** se invoca `--write-baseline` del censo o
`tokens:catalog:write` → PARAR. **S-11** aparece un **path 13.º** → PARAR y reportar; la clausura medida
es ésta. **S-12** se siembra el placeholder de K5c o se sella GAT-07 dentro del lote → PARAR (§7).
**S-13** drift contra R-1 → PARAR **sin re-anclar**. **S-14** `program-state --check` ≠ EXIT 0 → PARAR.
**S-15** sobrevive residuo `*.tmp-*` bajo `packages/core/manifest` → PARAR y limpiar bajo §8.

---

## 10. Cierre

- **Cero writes al repo.** Write-set de la sesión: este memo y su `.ready`.
- **Autocontenido:** los **57** governors están literales en §2-§4; Sonnet no inventa ninguno.
- Verdad auditada **verificada de forma independiente**: 17+36+4 = 57 · 8 derived + 49 seed ·
  1 family tag a retirar · 40→0 · 33→33 · 4099→4155 · cero valores.
- Un solo lote: fragmentar en 35 dejaría **22** hojas y obligaría a repetir entera la clausura de 9
  artefactos.
- Requiere **preaudit Fable** y ruling DT antes de cualquier write.

# VERDICT: READY_FOR_FABLE_PREAUDIT
