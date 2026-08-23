# F4A-14a v3 — reparación contractual del plano de raíces (brief durable)

Autor: Cloud Opus (f05-opus). DT: Codex. Auditor: Fable 5.
Reemisión **quirúrgica** tras el segundo **REJECT** de Fable. Insumos, ambos
**verificados byte-exactos en esta ronda**:

| insumo | SHA-256 |
|---|---|
| `f4a-14a-opus-implementation-brief-v2.md` | `99b31ed5fcd849fe008232a2097a971c5442ac5f70b66f184913b6801be00e76` |
| `f4a-14a-v2-fable-reaudit.md` (REJECT, P0-2) | `adb815ef7f30dd2d3be5c860271424fd6dbb562ad9556f22a5051949f8e3e53b` |
| `f4a-14a-fable-preaudit.md` (REJECT previo, 8 correcciones) | `50b307dedc89c751c9b77096d8a0a0dd5470258af76e985faa4c0203932adbd2` |

**v3 = v2 con ediciones quirúrgicas en §0 (celda P2-4), §2.9, §3, §5 y §8.**
Ninguna otra decisión cambia; el write-set sigue siendo exactamente 3 paths.

Decisión del DT vigente (2026-08-21): **se preserva la declinación explícita**;
`effect.intensity` es REPAIR. **K4 = 8 reparaciones de contrato, CERO
materializaciones de tema.**

**Naturaleza: SÓLO DOCUMENTACIÓN DEL PLANO DE RAÍCES.** Cero fuente de tema,
cero materialización, cero pintura, cero commit. Esta ronda es read-only: el
brief no escribió el repo.

---

## 0. Qué cambió respecto de v1, y por qué

| id | hallazgo Fable | estado | mi verificación independiente |
|---|---|---|---|
| **P0-1** | las `assignments` ×1 de §2.1/§2.2 **borran la posición dark autorada de bithire** | **ACEPTADO — era un error mío** | confirmado: mi sonda mutó sólo el brazo **base**, y de ahí inferí ×1. El evaluador dice que bithire autora los **dos** brazos (§2.1) |
| **P1-1** | "190 entries restantes" es aritmética falsa | **ACEPTADO** | medido: 66 raíces × 3 = 198; reparadas 8 → **58 raíces / 174 entries** |
| **P1-2** | el "8" del invariante 7 no tiene ancla | **ACEPTADO, con una corrección al hallazgo** | medido: son **3 entries bithire**, pero el texto del roster es `"dial: (raiz autora — dial en F4B)"`, **no** `"sin control atribuido…"`. Son dos vocabularios distintos (§4.7) |
| P2-1 | `NOOP_ALREADY_RESOLVED` no existe en el árbol | **ACEPTADO** — rótulo retirado (§4.6) | confirmado: sólo vivía en el brief |
| P2-2 | `bithire 17` sólo con predicado case-sensitive | **ACEPTADO** | confirmado: 2 hojas `textareaPaddingX/Y` en bithire |
| P2-3 | `method.assignments` (263/99/95/69) queda stale | **ACEPTADO** — §2.9 | confirmado, y `corrections` existe como domicilio |
| P2-4 | `collapses` es resumen numérico; headers del `.md` | **ACEPTADO** | confirmado: `{total:55,…}`. **Corregido en v3**: los headers son **`.md:503/523/577`**; `:185` NO es header, es el texto-licencia de `effect.intensity` (§2.7) |
| **P0-2** (v2) | el total mandado `256 (93/94/69)` es **medible-mente falso**; el derivable real es **261 (95/96/70)** | **ACEPTADO — era un error mío** | verificado sumando las 64 `assignments`: hoy **268 = 101+97+70**, no 263. Mi 256 restaba el delta correcto sobre una **base equivocada** (§2.9) |
| P2-5 | el canal de `control.ratio.iconSize` tampoco es el que los temas mueven | **ACEPTADO** — §2.8 lo registra como residuo | confirmado |

**Una divergencia con el auditor, a favor del auditor pero por otra razón**
(§4.7): Fable dijo 3 entries bithire con "ese governor". Mi primera medición dio
**0**, porque busqué el texto de los **tags de fuente**
(`"sin control atribuido en mapa-familia-canales F4A-3a"` — 797/618/95
ocurrencias en rottay/bithire/evnto). El roster usa **otro** texto:
`"dial: (raiz autora — dial en F4B)"`, 9 entries = 3 raíces × 3 temas
(`color.border`, `--ds-color-text-secondary`, `--ds-color-text-page`), de las
cuales **3 son de bithire**. El número de Fable es correcto; el vocabulario que
lo ancla no es el que v1 citaba. Ambos quedan escritos.

---

## 1. Pre-estado — verificar ANTES de escribir

```
HEAD esperado   9d5582dfdf1d02f1d7e8fd468720b1d829e50454
                ("chore(modern-rescue): hand DT control back to Codex")
worktree        git status --porcelain → VACÍO
```

SHA-256 del write-set en el pre-estado (los tres limpios en HEAD):

```
35a6912f709f71859eeb7ac7222dc01d8cfb44a0ab11054b9179a13d7e3d6bad  packages/core/manifest/cascade/root-catalog.json
7c8f562b3fb799fe3aff063c7b6402f63267ebb96062fed9c8a0a90f1427f09a  docs/f4a/roster-variantes.json
1808731fb2a1b4781416f5d9ab875667a6a225d2147328dd5aa33629320c8871  docs/f4a/roster-variantes.md
```

Insumos de esta reemisión, para trazabilidad:

```
50b307dedc89c751c9b77096d8a0a0dd5470258af76e985faa4c0203932adbd2  f4a-14a-fable-preaudit.md   (verificado)
bb44393a163e1624b75b2d2fbab572b3c50dc71bfc4dd97526c15cf16fa14837  f4a-14a-…-brief.md (v1, según Fable)
```

Si algún hash difiere: **PARAR** y re-medir antes de tocar nada.

Línea base de los gates en el pre-estado (verde, verificada por Fable y por mí):
```
root-catalog-freshness-gate: OK — 64 roots (48 existe, 10 por-crear, 6 solo-artefacto)
root-exposure-gate:          OK — 26 tenant-dial, 28 internal-head, 10 gap
```

---

## 2. Las 8 reparaciones, campo por campo

Índices `roots[N]` del pre-estado. **Verificar por `rootId`, no por índice.**

### 2.1 `tier.raised.fg` — `roots[7]` · **CORREGIDA POR P0-1**

| campo | actual | corrección |
|---|---|---|
| `channel` | `"--ds-color-text-primary"` | **`"--ds-material-raised-foreground"`** |
| `assignments` | `{total:4, rottay:2, bithire:2, evnto:0, modes:{rottay:["base","light"], bithire:["base","dark"], evnto:[]}}` | **`{total:2, rottay:0, bithire:2, evnto:0, modes:{rottay:[], bithire:["base","dark"], evnto:[]}}`** |

**Lo único que se corrige de `assignments` es rottay 2 → 0.** La mitad de
bithire (`2`, `["base","dark"]`) **ya estaba bien** y se preserva.

**Evidencia del canal**: sonda con centinela sobre el compilador productivo —
mutar `surfaces.surfaceRoles.raised.foreground = "#SENTINEL"` en bithire produce
1 diff: `["--ds-material-raised-foreground","#14283B","#SENTINEL"]`.

**Evidencia de los 2 modos** (la que v1 no tenía): `authoredLeafPaths` sobre
bithire devuelve **ambos brazos** —
`SURFACES.surfaceRoles.raised.foreground` y
`OVERLAY.surfaces.surfaceRoles.raised.foreground`— mientras rottay y evnto
devuelven **ninguno**. Corroborado en el artefacto: el canal se emite en
`artifacts/bithire/index.css:741` (base) **y** `:1566` (dark; el bloque dark
abre en `:1251`).

### 2.2 `tier.overlay.fg` — `roots[15]` · **CORREGIDA POR P0-1**

| campo | actual | corrección |
|---|---|---|
| `channel` | `"--ds-color-text-primary"` | **`"--ds-material-overlay-foreground"`** |
| `channelStatus` | `"existe"` | **`"solo-artefacto"`** |
| `assignments` | `{total:4, rottay:2, bithire:2, evnto:0, …}` | **`{total:2, rottay:0, bithire:2, evnto:0, modes:{rottay:[], bithire:["base","dark"], evnto:[]}}`** |

Mismo patrón: sólo rottay 2 → 0.

**Evidencia**: hojas autoradas en ambos brazos de bithire, ninguna en
rottay/evnto. Emisión en `artifacts/bithire/index.css:717` (base) y `:1545`
(dark). El `channelStatus → solo-artefacto` es **obligado por el freshness
gate**: `--ds-material-overlay-foreground` tiene **0 declaraciones** en CSS
autorado (`default.css` y todo `src/` excluyendo `artifacts/`), así que con
`"existe"` el gate fallaría.

**Nota obligatoria** en `derivation` o `exposureNote`:

> `src/ui/primitives/overlay/Tour/tests/Tour.overlay-material.test.ts:55-64`
> pinea la AUSENCIA de este canal
> (`expect(decl).not.toContain('--ds-material-overlay-foreground')`), con el
> incidente en su propio comentario: *"The overlay-foreground arm is unauthored
> on some tenants, so the chain fell through to the dark on-primary base and
> painted black on black."* **No materializar nunca.**

### 2.3 `tier.overlay.bg` — `roots[22]` · sin cambio respecto de v1

| campo | actual | corrección |
|---|---|---|
| `channel` | `"--ds-surface-overlay"` | **`"--ds-material-overlay-background"`** |
| `assignments` | `{total:4, rottay:2, bithire:2, evnto:0, …}` | **`{total:1, rottay:0, bithire:1, evnto:0, modes:{rottay:[], bithire:["base"], evnto:[]}}`** |

**Por qué acá el ×1 SÍ es correcto y en §2.1/§2.2 no** — la asimetría medida:
el canal cabeza `--ds-material-overlay-background` se emite **sólo en base**
(`artifacts/bithire/index.css:716`); el bloque dark emite únicamente el canal
**secundario** `--ds-surface-overlay` (`:1664`, contra `:965` en base).

**Divergencia de semántica que hay que dejar asentada** (§4.8): bithire **sí**
autora la hoja en los dos brazos (`SURFACES…overlay.background` y
`OVERLAY.surfaces…overlay.background`). Bajo la semántica de *posición autorada
por modo* esto daría ×2; bajo *emisión del canal cabeza por modo* da ×1. Esta
reparación usa **emisión del canal cabeza**, por instrucción del DT. Registrar
la elección en `derivation`, porque el mismo dato admite dos lecturas y la
próxima persona la va a rehacer.

**Segundo canal — destino exacto (P2-4)**: `roots[22].collapses` es un
**resumen numérico** (`{total:55, rottay:41, bithire:14, evnto:0}`),
incompatible de forma. El segundo canal (`--ds-surface-overlay`) va **sólo en
`derivation` y/o `evidence`** (ambos strings, ya existen). **Nunca en
`collapses`.**

**Nota obligatoria**: materializar esta raíz en rottay/evnto produce la
declaración circular `--ds-surface-overlay: var(--ds-surface-overlay)` — medido.
Dejarlo escrito.

### 2.4 `control.ratio.padding` — `roots[35]`

`assignments` actual `{total:2, rottay:1, bithire:1, evnto:0}` cuenta **raíces**,
no hojas. **No se escribe un conteo de hojas** (§2.10).

Lo que se repara es el roster (§3): dice los 3 `unassigned`; medido, **rottay y
bithire sí toman posición**, evnto no.

**Conteo, si se cita — con su predicado al lado (P2-2)**:
predicado case-**sensitive** `Geometry\..*[Pp]adding` → **rottay 15 · bithire 17
· evnto 0**. Los 2 extra de bithire son `textareaPaddingX`/`textareaPaddingY`
autorados (rottay los tiene como placeholders). Con predicado en minúscula
`.*padding` da 15/15/0. **Si se escribe el número, se escribe el predicado.**

### 2.5 `control.ratio.gap` — `roots[47]`

Igual que padding. Predicado `Geometry\..*gap$` → **7 · 7 · 0** (exacto bajo
ambas capitalizaciones).

### 2.6 `control.ratio.lineHeight` — `roots[40]`

`assignments` correcto a nivel raíz; el `channel`
(`--ds-input-md-line-height`) **es** el emitido — verificado. Se repara **sólo
el roster**.

**Evidencia**: rottay `var(--ds-line-height-tight)` · bithire **`20px` literal**
· evnto AUSENTE. La afirmación del roster de que bithire *deriva* de
`--ds-line-height-tight` es falsa.

### 2.7 `effect.intensity` — `roots[63]`

`assignments` `{total:1, rottay:0, bithire:1, evnto:0}` es **correcto** — no se
toca. Se repara la anotación K4 y el roster.

**Texto-licencia a reemplazar**: `docs/f4a/roster-variantes.md:185` —
*"K4: valor = resolucion computada de hoy (base=1); raiz por raiz en F4A-14."*
Esa frase autoriza escribir `1` sobre bithire.

**Nota obligatoria**:

> Medido con el compilador productivo: `--ds-effect-intensity` emite
> rottay `"1"` · bithire **`"0.58"`** · evnto `"1"`. Rottay y evnto **declinan
> explícitamente** (`@placeholder SURFACES.effectIntensity`, `@domicile
> unassigned` — rottay `index.ts:3767-3769`, evnto `2076-2078`) y heredan el
> fallback del lowering. La materialización en rottay/evnto fue **probada
> cero-delta** (0 diffs sobre el mapa completo) y el **DT la declinó el
> 2026-08-21 para preservar la declinación explícita**. Escribir `base=1` sobre
> bithire es **regresión medida** (1 diff: `0.58 → 1`) y está prohibido.

### 2.8 `control.ratio.iconSize` — `roots[41]` · **RESIDUO EXPLÍCITO (P2-5)**

`assignments` correcto a nivel raíz. Se repara **sólo el roster** (§3): dice los
3 `unassigned`; medido, rottay `derived` y bithire `seed`.

**El `channel` NO se toca en este lote.** Registro medido, para F4A-close:

> El catálogo cita `--ds-icon-md-size` (piso en
> `presentation/components/icon.css:21`), pero **no es el canal que los temas
> mueven**: las emisiones corren por `--ds-input-md-icon-size` /
> `--ds-button-md-icon-size` (rottay `var(--ds-icon-sm-size)`, bithire `15px`).
> Es **la misma clase de defecto** que §2.1/§2.2, pero corregirlo exige decidir
> si la raíz nombra el token de figura o el canal por-control — **semántica no
> aprobada**. **Queda como residuo abierto, adjudicación de F4A-close.**

**Fence**: no cambiar `roots[41].channel` en este lote, y **no venderlo como
cerrado** en el reporte. La reparación de esta raíz es **parcial y así se
declara**.

### 2.9 Prosa global del catálogo que queda stale (P2-3)

`method.assignments` clava totales globales:

> *"Una ASIGNACION es un par raiz x modo por tema… Total **263** (rottay **99**,
> bithire **95**, evnto **69**)."*

**Esa prosa está stale por DOS hechos distintos, y hay que narrarlos por
separado.**

#### (a) Drift preexistente de F4A-6 — no lo causa K4

El 263 **sí era derivable**: era la suma exacta del snapshot de **63 raíces**
para el que la prosa fue escrita. **F4A-6 agregó la raíz 64, `tier.page.ink`**,
con `assignments {total:5, rottay:2, bithire:2, evnto:1}`, y **no actualizó la
prosa**. La reconciliación cierra al entero:

```
263 + 5 = 268     99 + 2 = 101     95 + 2 = 97     69 + 1 = 70
```

**Base real de HOY, verificada sumando las `assignments` de las 64 raíces:
268 = rottay 101 + bithire 97 + evnto 70** (coherencia `r+b+e === total` ✓).

#### (b) Delta de las reparaciones K4 — −7

Las reparaciones de §2.1/§2.2/§2.3 cambian los totales: −2 rottay en
`tier.raised.fg`, −2 rottay en `tier.overlay.fg`, −2 rottay y −1 bithire en
`tier.overlay.bg`. Delta: **rottay −6, bithire −1, evnto 0 = −7**.

#### Destino

```
268 − 7 = 261        rottay 101 − 6 = 95
                     bithire  97 − 1 = 96
                     evnto    70 − 0 = 70        95 + 96 + 70 = 261 ✓
```

> **Corrección de v2 (P0-2 de Fable, aceptada):** v2 mandaba escribir
> **256 (93/94/69)**. Restaba el delta correcto sobre la **base equivocada** (el
> 263 de la prosa). El `69` de evnto delataba la herencia: evnto real es 70 y
> las reparaciones no lo tocan. **El destino correcto es 261 (95/96/70).**

**Obligatorio**: escribir **261 (rottay 95, bithire 96, evnto 70)** en
`method.assignments`, **derivado de la suma**, no copiado de este brief; y
**asentar la enmienda en el campo `corrections`** del catálogo (existe, es un
objeto `{statement, items}`), con la ley *"un dato que no se sostiene se corrige
y se dice"*. La entrada de `corrections` narra **los dos hechos por separado**:
(a) el drift de F4A-6 (263→268, nunca asentado, ajeno a K4) y (b) el delta K4
(−7).

**STOP CONDITION (9)**: si la suma post-reparación de las 64 `assignments` **no
da 261 (95/96/70)**, PARAR. No escribir el número a mano para que cierre.

**Tercera línea de `corrections`, ya que el campo se abre igual** (opcional de
Fable, aceptado): `method.roots` dice *"Las **63** raices cubren el 100% de
A+B…"* y `reconciliation.statement` dice *"Las **63** cabezas internas contra los
20 controles…"*. **Mismo vintage F4A-6**: el catálogo tiene 64 raíces desde que
`tier.page.ink` entró. Registrar el drift **sin reescribir las dos frases** en
este lote — corregir la cobertura de A+B exige re-medir el 3275, y eso no es K4.

`reconciliation.byExposure` **no se ve afectada**: renombrar un canal no mueve
raíces entre exposures (verificado por Fable y por mí).

### 2.10 Regla de scope — LEER ANTES DE ESCRIBIR CONTEOS

Los conteos de hoja de `control.ratio.*` son **sensibles al predicado**. El
catálogo **no define el scope** de esas raíces, y esa indefinición es parte de lo
que está stale.

El write-set **no fija un conteo de hojas**. Repara lo inequívoco —**qué temas
toman posición**— y, si cita un número, **escribe el predicado al lado**.

**STOP CONDITION**: si hace falta elegir un scope para que un número "cierre",
**PARAR**. Definir el scope de una raíz es adjudicación del DT.

---

## 3. `docs/f4a/roster-variantes.{json,md}` — 8 raíces × 3 temas

Estructura: `{ root, theme, posture, domicile, governor, ruleSource }`.
**66 raíces × 3 temas = 198 entries** (universe: 63 catalogRoots + 3
authoredRoots).

| raíz | roster ACTUAL | verdad MEDIDA |
|---|---|---|
| `effect.intensity` | los 3 `seed/authored`, `dial: surfaces.effect-intensity` | bithire así; **rottay y evnto `unassigned/placeholder`** |
| `tier.raised.fg` | los 3 `derived/authored`, `deriva de: calc` | sólo bithire (`seed/authored`, base+dark); rottay/evnto `unassigned/placeholder` |
| `tier.overlay.fg` | los 3 `derived/authored` | ídem |
| `tier.overlay.bg` | rottay/evnto `unassigned`, bithire `seed` + `dial: token-overrides` | postura correcta; **el governor de bithire es falso** — en fuente (`bithire/index.ts:~3993`) es el texto genérico F4B, no `token-overrides` |
| `control.ratio.padding` | los 3 `seed/unassigned`, "materializacion pendiente" | rottay `derived` (`calc`), bithire `seed` (literales), evnto `unassigned` |
| `control.ratio.gap` | ídem | ídem |
| `control.ratio.lineHeight` | rottay/bithire `derived/authored`, `deriva de: --ds-line-height-tight` | rottay `derived` OK; **bithire literal `20px`, no derivado**; evnto `unassigned` OK |
| `control.ratio.iconSize` | los 3 `unassigned/placeholder` | rottay `derived`, bithire `seed`, evnto `unassigned` — **postura reparada; canal NO (§2.8)** |

**Headers del `.md` a actualizar con el canal nuevo (P2-4) — los tres, medidos:**

| línea | header actual | canal nuevo |
|---|---|---|
| **`:503`** | ``**`tier.overlay.bg`** · --ds-surface-overlay · exposure `tenant-dial` · status `existe``` | `--ds-material-overlay-background` |
| **`:523`** | ``**`tier.overlay.fg`** · --ds-color-text-primary · exposure `internal-head` · status `existe``` | `--ds-material-overlay-foreground` **y status → `solo-artefacto`** |
| **`:577`** | ``**`tier.raised.fg`** · --ds-color-text-primary · exposure `internal-head` · status `existe``` | `--ds-material-raised-foreground` |

**NO son de este lote y no se tocan**: `:469` (`tier.base.fg`) y `:495`
(`tier.control.fg`) llevan el mismo canal viejo `--ds-color-text-primary` pero
pertenecen a otras raíces; y la prosa de `:717` es cita histórica.
**`:185` NO es un header**: es el texto-licencia de `effect.intensity` (§2.7).

El `.md` debe quedar consistente con el `.json`; si divergen, el `.md` está mal.

**Las 58 raíces restantes (174 entries) no se tocan.** *(P1-1: v1 decía "190",
falso bajo toda lectura.)*

---

## 4. Invariantes

1. **Cero fuente de tema.** Los 3 `brand-themes/*/index.ts` byte-idénticos,
   probado por hash.
2. **Cero pintura.** `facade/artifacts/` y `styles/` byte-idénticos, probado por
   hash.
3. **`root-exposure-gate` clavado en 26/28/10.** Ninguna reparación toca
   `exposure`.
4. **64 raíces.** El único delta de `channelStatus` autorizado es
   `tier.overlay.fg` `existe → solo-artefacto` → reparto **47/10/7**. Es además
   **obligado** por el freshness gate (0 declaraciones autoradas del canal).
5. **Las 5 raíces sin consumidor no se inventan**: `state.delta.pressed`,
   `state.delta.checked`, `state.delta.expanded`, `alpha.ladder`,
   `tier.accent.bg`.
6. **Tres raíces no se tocan**: `tier.overlay.border`, `control.ratio.fontSize`,
   `control.ratio.radius`. *(P2-1: v1 las rotulaba `NOOP_ALREADY_RESOLVED`, un
   rótulo que **no existe** en catálogo, roster ni `docs/f4a/` — sólo en el
   brief. Rótulo retirado; la instrucción operativa, "no tocar", se conserva.)*
7. **La clase F4B no se resuelve acá.** *(P1-2, corregido con su ancla real.)*
   Medido, dos vocabularios distintos:
   - **roster** (`roster-variantes.json`): governor `"dial: (raiz autora — dial
     en F4B)"` — **9 entries = 3 raíces × 3 temas** (`color.border`,
     `--ds-color-text-secondary`, `--ds-color-text-page`), de las cuales **3 son
     bithire**;
   - **fuente** (tags `@governor`): `"dial en F4B (sin control atribuido en
     mapa-familia-canales F4A-3a)"` — **797 rottay / 618 bithire / 95 evnto**.
   El "8" de v1 no tenía ancla en ninguno de los dos. **Se conserva el texto
   donde exista; no se resuelve la clase.**
   **Declarado e intencional**: la reparación de `tier.overlay.bg` (§3)
   **agrega una cuarta entry bithire** con el governor genérico, porque ése es
   el texto real en fuente. Es un aumento **deliberado**, no una violación del
   invariante: el invariante prohíbe **resolver** la clase, no reflejarla.
8. **Ningún valor tenant autorado se degrada.** El `0.58` de bithire es
   intocable — y, por P0-1, tampoco se degrada su posición dark autorada.
9. **Semántica de asignación declarada** (§2.3): esta reparación cuenta
   **emisión del canal cabeza por modo**. Registrarlo en `derivation` de
   `roots[22]`.

---

## 5. Matriz final verificable

| # | raíz | `roots[N]` | acción | qué cambia | verificable con |
|---|---|---|---|---|---|
| 1 | `tier.raised.fg` | 7 | REPAIR | `channel`; `assignments.rottay` 2→0, `total` 4→2 | `authoredLeafPaths` (bithire 2 brazos, rottay 0) + artefacto `:741`/`:1566` |
| 2 | `tier.overlay.fg` | 15 | REPAIR | `channel`; `channelStatus`→`solo-artefacto`; `assignments.rottay` 2→0, `total` 4→2 | ídem + `:717`/`:1545`; 0 declaraciones autoradas del canal |
| 3 | `tier.overlay.bg` | 22 | REPAIR | `channel`; `assignments` →`{1, bithire:["base"]}`; 2º canal en `derivation` | artefacto `:716` (sólo base) vs `:1664` (dark, canal secundario) |
| 4 | `control.ratio.padding` | 35 | REPAIR (roster) | postura rottay/bithire | predicado `Geometry\..*[Pp]adding` → 15/17/0 |
| 5 | `control.ratio.gap` | 47 | REPAIR (roster) | postura rottay/bithire | predicado `Geometry\..*gap$` → 7/7/0 |
| 6 | `control.ratio.lineHeight` | 40 | REPAIR (roster) | governor bithire | emisión `20px` literal |
| 7 | `control.ratio.iconSize` | 41 | **REPAIR PARCIAL** | postura; **`channel` NO** | emisión por `--ds-input-md-icon-size`; residuo a F4A-close |
| 8 | `effect.intensity` | 63 | REPAIR (nota) | anotación K4 + roster | emisión 1/0.58/1; `roster-variantes.md:185` |
| — | `method.assignments` | — | REPAIR global | **268→261** (101→95, 97→96, 70) + `corrections` narrando (a) drift F4A-6 y (b) delta K4 | suma de las 64 `assignments`; `tier.page.ink` = `{5,2,2,1}` |

---

## 6. Batería antes / después

### Antes

```bash
git rev-parse HEAD                                    # 9d5582dfd…
git status --porcelain                                # vacío
shasum -a 256 <los 3 del write-set> > /tmp/f4a14a-pre.sha
shasum -a 256 packages/core/src/foundation/tokens/ts/presentation/brand-themes/*/index.ts \
  > /tmp/f4a14a-themes-pre.sha
find packages/core/src/foundation/tokens/css/facade/artifacts packages/core/styles -type f \
  | sort | xargs shasum -a 256 | shasum -a 256 > /tmp/f4a14a-art-pre.sha
node packages/core/scripts/tokens/root-catalog-freshness-gate/index.mjs
node packages/core/scripts/tokens/root-exposure-gate/index.mjs
node --test packages/core/scripts/tokens/root-exposure-gate/index.test.mjs
```

### Después

```bash
# 1. gates del catálogo — LOS DOS
node packages/core/scripts/tokens/root-catalog-freshness-gate/index.mjs   # 64 roots, 47/10/7
node packages/core/scripts/tokens/root-exposure-gate/index.mjs            # 26/28/10 SIN cambio
node --test packages/core/scripts/tokens/root-exposure-gate/index.test.mjs

# 2. forma
node -e "require('./packages/core/manifest/cascade/root-catalog.json')"
node -e "const r=require('./docs/f4a/roster-variantes.json');
         if(r.entries.length!==198) throw new Error('entries: '+r.entries.length)"

# 3. INVARIANTES DURAS
shasum -a 256 packages/core/src/foundation/tokens/ts/presentation/brand-themes/*/index.ts \
  | diff - /tmp/f4a14a-themes-pre.sha                       # vacío
find packages/core/src/foundation/tokens/css/facade/artifacts packages/core/styles -type f \
  | sort | xargs shasum -a 256 | shasum -a 256 | diff - /tmp/f4a14a-art-pre.sha   # vacío

# 4. write-set
git diff --name-only     # exactamente 3
git diff --check         # limpio

# 5. harness del frente
node --test packages/core/manifest/mirror-parity/index.test.mjs
node --test packages/core/manifest/variant-parity/index.test.mjs
```

**No hace falta `pnpm build`, ni cadena, ni rosters, ni pierna 1**: el write-set
no toca fuente compilable. Si alguno hiciera falta → el lote se salió del carril.

---

## 7. Fences

- Cero cambios visuales. Cero materialización de tema (decisión del DT).
- No inventar las 5 raíces sin consumers.
- No degradar un valor tenant autorado — ni el `0.58` ni la posición dark de
  bithire (P0-1).
- No confundir leaf-tag con root assignment.
- No resolver la clase F4B: pertenece a F4A-close/F4B.
- No cambiar `roots[41].channel` (`iconSize`) — semántica no aprobada.
- No escribir el segundo canal de `overlay.bg` en `collapses`.
- No hand-edit de generados: `manifest/generated/*`, `facade/artifacts/*`,
  `styles/*`, `dist/*`.
- No commit, push, stage, stash, checkout, reset. El `stash@{0}` ajeno no se toca.

---

## 8. Stop conditions

1. Cualquier hash de pre-estado difiere → PARAR.
2. `root-catalog-freshness-gate` pide **regeneración** en vez de aceptar la
   enmienda → PARAR. *(Fable verificó que hoy no puede disparar en falso: el
   gate valida contra el árbol, sin hash ni productor.)*
3. `root-exposure-gate` se mueve de 26/28/10 → PARAR.
4. El conteo se va de 64, o `channelStatus` cambia más allá de 47/10/7 → PARAR.
5. Hace falta **elegir un scope** para que un conteo cierre (§2.10) → PARAR.
6. Aparece un generador de `roster-variantes.*` → PARAR y usarlo. *(Fable
   verificó negativo: cero generadores y cero consumidores de máquina.)*
7. Cualquier hash de tema o artefacto se mueve → PARAR y restaurar (§9).
8. `git diff --name-only` muestra un cuarto path → PARAR y restaurar.
9. **(nueva)** La suma post-reparación de las 64 `assignments` **no da 261
   (rottay 95, bithire 96, evnto 70)** → PARAR (§2.9). No ajustar el número a
   mano para que cierre.

---

## 9. Restore

Los 3 paths están limpios en HEAD; la restauración **no requiere `git checkout`**:

```bash
for f in packages/core/manifest/cascade/root-catalog.json \
         docs/f4a/roster-variantes.json \
         docs/f4a/roster-variantes.md; do
  git show HEAD:$f > $f
done
shasum -a 256 <los 3> | diff - /tmp/f4a14a-pre.sha    # vacío
git status --porcelain                                 # vacío
```

Antes de empezar: copiar los 3 a `/tmp/f4a14a-backup/` y verificar el respaldo
por hash.

---

## 10. Entregable del lote

`/private/tmp/f4a-14a-reporte.md`: hashes pre/post de los 3; campo por campo qué
cambió con su evidencia; salidas de ambos gates antes y después; prueba por hash
de que fuente de tema y artefactos no se movieron; el total nuevo de
`method.assignments` **derivado de la suma de las 64 `assignments`** (debe dar
**261 = 95 + 96 + 70**), no copiado de este brief, con la entrada de
`corrections` narrando por separado el drift F4A-6 y el delta K4; `git status
--porcelain` entero; stop conditions tocadas; y **declaración explícita de que
`control.ratio.iconSize` queda parcialmente reparada** (§2.8). Flag
`/private/tmp/f4a-14a-listo.txt`. **Sin commit.**

---

## 11. Lo que este lote NO cierra

- La **proyección leaf-plane → root-plane** sigue sin instrumento; este lote la
  hace a mano para 8 raíces, las otras 58 siguen sin proyectar.
- El **scope de las raíces `control.ratio.*`** (§2.10).
- El **canal de `control.ratio.iconSize`** (§2.8) — residuo para F4A-close.
- La **semántica de asignación** cuando la hoja está autorada en dos brazos pero
  el canal cabeza se emite en uno (§2.3, §4.9).
- La clase **F4B** (§4.7).
- La prosa de **"63 raíces"** en `method.roots` y `reconciliation.statement`
  (§2.9): se registra el drift, no se reescribe — corregir la cobertura de A+B
  exige re-medir los 3275 canales asignados.
- **K5 / `CHROME.table`**: disjunta, sin dependencia con este lote.
