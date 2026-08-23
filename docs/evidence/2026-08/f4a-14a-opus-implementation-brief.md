# F4A-14a — reparación contractual del plano de raíces (brief durable)

Autor: Cloud Opus (f05-opus), tras la adjudicación K4 read-only.
DT: Codex. Decisión del DT aplicada: **se preserva la declinación explícita**;
`effect.intensity` pasa a REPAIR. **K4 = 8 reparaciones de contrato, CERO
materializaciones de tema.**

Este brief es **durable**: un worker que lo tome en frío no necesita
conversación previa. Todo lo que hay que saber está acá o citado archivo:línea.

**Naturaleza: SÓLO DOCUMENTACIÓN DEL PLANO DE RAÍCES.** Cero fuente de tema,
cero materialización, cero pintura, cero commit.

---

## 0. Pre-estado — verificar ANTES de escribir

```
HEAD esperado   9d5582dfdf1d02f1d7e8fd468720b1d829e50454
                ("chore(modern-rescue): hand DT control back to Codex")
worktree        git status --porcelain → VACÍO
```

> Nota: la adjudicación K4 se hizo sobre `8f86544c9…`, con 14 paths dirty del
> relevo constitucional. El DT los commiteó en `9d5582dfd`. **Ninguno de los 3
> paths de este write-set estaba entre esos 14** — verificado — así que la
> medición de K4 sigue vigente sin re-medir.

Hashes SHA-256 del write-set en el pre-estado (los tres limpios en HEAD):

```
35a6912f709f71859eeb7ac7222dc01d8cfb44a0ab11054b9179a13d7e3d6bad  packages/core/manifest/cascade/root-catalog.json
7c8f562b3fb799fe3aff063c7b6402f63267ebb96062fed9c8a0a90f1427f09a  docs/f4a/roster-variantes.json
1808731fb2a1b4781416f5d9ab875667a6a225d2147328dd5aa33629320c8871  docs/f4a/roster-variantes.md
```

Si alguno difiere: **PARAR** y re-medir antes de tocar nada.

---

## 1. Write-set exacto — 3 paths, ni un cuarto

| # | path | naturaleza | quién manda |
|---|---|---|---|
| 1 | `packages/core/manifest/cascade/root-catalog.json` | **autoridad de inventario**, auto-declarada `"MEDIDO -- inventario de lectura, no artefacto generado"`, `producedOn: 2026-08-18`. **Enmendable a mano**, pero **gateada** | `root-catalog-freshness-gate` + `root-exposure-gate` |
| 2 | `docs/f4a/roster-variantes.json` | **vista derivada**, `producedBy: "F4A-1c v3 (worker Opus, read-only)"`, **sin consumidor de máquina** | nadie — se corrige re-emitiendo o con errata fechada |
| 3 | `docs/f4a/roster-variantes.md` | vista legible del anterior; debe quedar consistente con él | ídem |

**Prohibido tocar**: los 3 `brand-themes/*/index.ts`, cualquier
`manifest/generated/*`, `src/foundation/tokens/css/facade/artifacts/*`,
`styles/*`, `dist/*`, `docs-engineering/*`, `roadmap/*`, el `stash@{0}` ajeno.

---

## 2. Las 8 reparaciones, campo por campo

Cada fila trae **valor actual medido** y **corrección**. Los índices `roots[N]`
son los de `root-catalog.json` en el pre-estado; verificarlos por `rootId`, no
por índice, antes de escribir.

### 2.1 `tier.raised.fg` — `roots[7]`

| campo | actual | corrección |
|---|---|---|
| `channel` | `"--ds-color-text-primary"` | **`"--ds-material-raised-foreground"`** |
| `assignments` | `{total:4, rottay:2, bithire:2, evnto:0}` | **`{total:1, rottay:0, bithire:1, evnto:0, modes:{rottay:[],bithire:["base"],evnto:[]}}`** |

**Evidencia**: sonda con centinela sobre el compilador productivo —
`mutar surfaces.surfaceRoles.raised.foreground = "#SENTINEL"` en bithire produce
**1 diff**: `["--ds-material-raised-foreground","#14283B","#SENTINEL"]`. El canal
que el catálogo cita hoy no es el que la hoja mueve.
Emisión medida: rottay AUSENTE · bithire `#14283B` · evnto AUSENTE.

### 2.2 `tier.overlay.fg` — `roots[15]`

| campo | actual | corrección |
|---|---|---|
| `channel` | `"--ds-color-text-primary"` | **`"--ds-material-overlay-foreground"`** |
| `channelStatus` | `"existe"` | **`"solo-artefacto"`** |
| `assignments` | `{total:4, rottay:2, bithire:2, evnto:0}` | **`{total:1, rottay:0, bithire:1, evnto:0, modes:{rottay:[],bithire:["base"],evnto:[]}}`** |

**Evidencia**: emisión rottay AUSENTE · bithire `#14283B` · evnto AUSENTE.
`--ds-material-overlay-foreground` tiene **0 declaraciones** en
`src/foundation/tokens/css/foundation/themes/default.css` — no hay piso; sólo
existe en la emisión de bithire, de ahí `solo-artefacto`.

**Nota obligatoria a agregar en `derivation` o `exposureNote`** (el hecho más
importante de esta raíz, y la razón por la que nunca debe materializarse):

> `src/ui/primitives/overlay/Tour/tests/Tour.overlay-material.test.ts:56-64`
> pinea la AUSENCIA de este canal
> (`expect(decl).not.toContain('--ds-material-overlay-foreground')`), con el
> incidente registrado en su propio comentario: *"The overlay-foreground arm is
> unauthored on some tenants, so the chain fell through to the dark on-primary
> base and painted black on black."*

### 2.3 `tier.overlay.bg` — `roots[22]`

| campo | actual | corrección |
|---|---|---|
| `channel` | `"--ds-surface-overlay"` | **`"--ds-material-overlay-background"`** (canal principal) |
| `assignments` | `{total:4, rottay:2, bithire:2, evnto:0}` | **`{total:1, rottay:0, bithire:1, evnto:0, modes:{rottay:[],bithire:["base"],evnto:[]}}`** |

**Evidencia**: la hoja `SURFACES.surfaceRoles.overlay.background` mueve **dos**
canales; registrar el segundo en `collapses` o en `derivation`, no inventar una
raíz nueva. Emisión: rottay/evnto AUSENTES · bithire
`--ds-material-overlay-background = var(--ds-surface-overlay)`.

**Nota obligatoria**: materializarla en rottay/evnto produce la declaración
circular `--ds-surface-overlay: var(--ds-surface-overlay)` — medido. Dejar
escrito para que nadie lo intente.

### 2.4 `control.ratio.padding` — `roots[35]`

| campo | actual | corrección |
|---|---|---|
| `assignments` | `{total:2, rottay:1, bithire:1, evnto:0}` | **ver §2.9 (scope)** |

**Evidencia**: rottay y bithire **sí** autoran; evnto no. Conteo con predicado
`^CHROME\.controls\.(field\|button)Geometry\..*padding`: **rottay 15, bithire 17,
evnto 0**. El `total:2` del catálogo cuenta raíces, no hojas — y el roster dice
lo contrario (los 3 `unassigned`).

### 2.5 `control.ratio.gap` — `roots[47]`

Igual que padding. Predicado `Geometry\..*gap$`: **rottay 7, bithire 7, evnto 0**.

### 2.6 `control.ratio.lineHeight` — `roots[40]`

`assignments` es correcto (1/1/0 a nivel raíz). **Lo que se repara es el
roster**, §3.

**Evidencia**: emisión rottay `var(--ds-line-height-tight)` · bithire **`20px`
literal** · evnto AUSENTE. La afirmación del roster de que bithire *deriva* de
`--ds-line-height-tight` es **falsa**: su valor es un literal sin relación con
ese token.

### 2.7 `control.ratio.iconSize` — `roots[41]`

`assignments` correcto a nivel raíz. **Se repara el roster**, §3.

**Evidencia**: rottay `var(--ds-icon-sm-size)` · bithire `15px` · evnto AUSENTE.
El roster dice los 3 `unassigned`: falso para 2 de 3.

### 2.8 `effect.intensity` — `roots[63]`

`assignments` `{total:1, rottay:0, bithire:1, evnto:0}` es **correcto** —
no se toca.

**Lo que se repara es la anotación K4 y el roster.** El catálogo/roster licencia
hoy *"valor = resolución computada de hoy (base=1)"*, y esa frase autoriza
escribir `1` sobre bithire.

**Corrección obligatoria — la nota que hay que dejar escrita:**

> Medido con el compilador productivo: `--ds-effect-intensity` emite
> rottay `"1"` · bithire **`"0.58"`** · evnto `"1"`. Rottay y evnto **declinan
> explícitamente** la posición (`@placeholder SURFACES.effectIntensity`,
> `@domicile unassigned`) y heredan el fallback del lowering. La materialización
> en rottay/evnto fue **probada cero-delta** (0 diffs sobre el mapa completo) y
> el DT **la declinó el 2026-08-21 para preservar la declinación explícita**.
> Escribir `base=1` sobre bithire es **regresión medida** (1 diff:
> `0.58 → 1`) y está prohibido.

### 2.9 Regla de scope — LEER ANTES DE ESCRIBIR CONTEOS

Los conteos de hoja de `control.ratio.*` son **sensibles al predicado**: el
snapshot de K4-0 contó 1 hoja para `lineHeight` (sólo `fieldGeometry.md`), mi
predicado más ancho cuenta 10 (toda la escalera × field/button). **El catálogo
no define el scope de estas raíces**, y esa indefinición es parte de lo que está
stale.

**Por eso el write-set NO fija un conteo de hojas.** Repara lo que es
inequívoco —**qué temas toman posición**: rottay sí / bithire sí / evnto no— y
deja el conteo fuera, o lo registra **con su predicado escrito al lado**.

**STOP CONDITION**: si el implementador siente que necesita elegir un scope para
que el número "cierre", **PARAR**. Definir el scope de una raíz es adjudicación
del DT, no del worker.

---

## 3. `docs/f4a/roster-variantes.{json,md}` — 8 raíces × 3 temas

Estructura de entrada: `{ root, theme, posture, domicile, governor, ruleSource }`,
198 entradas totales.

| raíz | roster ACTUAL (los 3 temas) | verdad MEDIDA |
|---|---|---|
| `effect.intensity` | los 3 `seed/authored`, `dial: surfaces.effect-intensity` | bithire `seed/authored` con ese dial; **rottay y evnto `unassigned/placeholder`** |
| `tier.raised.fg` | los 3 `derived/authored`, `deriva de: calc` | sólo bithire `seed/authored`; rottay/evnto `unassigned/placeholder` |
| `tier.overlay.fg` | los 3 `derived/authored` | ídem |
| `tier.overlay.bg` | rottay/evnto `unassigned`, bithire `seed` con `dial: token-overrides` | postura correcta; **el governor de bithire es falso** — en fuente es el texto genérico `"dial en F4B (sin control atribuido…)"`, no `token-overrides` |
| `control.ratio.padding` | los 3 `seed/unassigned`, "materializacion pendiente" | rottay `derived` (expresiones `calc`), bithire `seed` (literales), evnto `unassigned` |
| `control.ratio.gap` | ídem | ídem |
| `control.ratio.lineHeight` | rottay/bithire `derived/authored`, `deriva de: --ds-line-height-tight` | rottay `derived` correcto; **bithire es literal `20px`, no derivado**; evnto `unassigned` correcto |
| `control.ratio.iconSize` | los 3 `unassigned/placeholder` | rottay `derived`, bithire `seed`, evnto `unassigned` |

**El `.md` debe quedar consistente con el `.json`** — misma postura, mismo
governor, misma raíz. Si divergen, el `.md` es el que está mal.

**Los 190 entries restantes no se tocan.**

---

## 4. Invariantes que NO cambian

1. **Cero fuente de tema.** Los 3 `brand-themes/*/index.ts` quedan
   **byte-idénticos**. Probarlo por hash.
2. **Cero pintura.** Ningún artefacto compilado puede moverse: el write-set no
   entra al build. Probarlo por hash de
   `src/foundation/tokens/css/facade/artifacts/` y `styles/`.
3. **`root-exposure-gate` clavado en 26 tenant-dial / 28 internal-head / 10 gap.**
   Ninguna reparación toca `exposure`. Si se mueve → PARAR.
4. **`root-catalog` sigue en 64 raíces** (48 existe / 10 por-crear / 6
   solo-artefacto), salvo el único movimiento autorizado: `tier.overlay.fg` pasa
   `existe → solo-artefacto`, que cambia el reparto a **47/10/7**. Ese es el
   único delta de `channelStatus` permitido, y hay que reflejarlo donde el gate
   lo cuente.
5. **Las 5 raíces sin consumidor no se inventan**: `state.delta.pressed`,
   `state.delta.checked`, `state.delta.expanded`, `alpha.ladder`,
   `tier.accent.bg`. No se les agrega canal, valor ni asignación.
6. **Las 3 raíces `NOOP_ALREADY_RESOLVED` no se tocan**: `tier.overlay.border`,
   `control.ratio.fontSize`, `control.ratio.radius`.
7. **La clase `"sin control atribuido"` no se resuelve acá.** Las 8 raíces cuyo
   governor bithire es `"dial en F4B (sin control atribuido en
   mapa-familia-canales F4A-3a)"` conservan ese texto: su disposición es de
   F4A-close/F4B por ley.
8. **Ningún valor tenant autorado se degrada.** `0.58` de bithire es intocable.

---

## 5. Batería antes / después

### Antes (línea base, con el árbol limpio)

```bash
git rev-parse HEAD                                   # 9d5582dfd…
git status --porcelain                               # vacío
shasum -a 256 <los 3 del write-set> > /tmp/f4a14a-pre.sha
shasum -a 256 packages/core/src/foundation/tokens/ts/presentation/brand-themes/*/index.ts \
  > /tmp/f4a14a-themes-pre.sha
find packages/core/src/foundation/tokens/css/facade/artifacts packages/core/styles -type f \
  | sort | xargs shasum -a 256 | shasum -a 256 > /tmp/f4a14a-art-pre.sha

node packages/core/scripts/tokens/root-catalog-freshness-gate/index.mjs
node packages/core/scripts/tokens/root-exposure-gate/index.mjs
node --test packages/core/scripts/tokens/root-exposure-gate/index.test.mjs
```

Anotar las salidas: se comparan literalmente contra las de después.

### Después

```bash
# 1. gates del catálogo — LOS DOS, antes de cualquier otra cosa
node packages/core/scripts/tokens/root-catalog-freshness-gate/index.mjs
node packages/core/scripts/tokens/root-exposure-gate/index.mjs
node --test packages/core/scripts/tokens/root-exposure-gate/index.test.mjs

# 2. el JSON parsea y el roster sigue teniendo 198 entradas
node -e "require('./packages/core/manifest/cascade/root-catalog.json')"
node -e "const r=require('./docs/f4a/roster-variantes.json');
         if(r.entries.length!==198) throw new Error('entries: '+r.entries.length)"

# 3. INVARIANTE DURA: fuente de tema y artefactos, byte-idénticos
shasum -a 256 packages/core/src/foundation/tokens/ts/presentation/brand-themes/*/index.ts \
  | diff - /tmp/f4a14a-themes-pre.sha        # DEBE ser vacío
find packages/core/src/foundation/tokens/css/facade/artifacts packages/core/styles -type f \
  | sort | xargs shasum -a 256 | shasum -a 256 | diff - /tmp/f4a14a-art-pre.sha   # vacío

# 4. el write-set es exactamente 3
git diff --name-only                          # los 3 paths, ni uno más
git diff --check                              # limpio

# 5. el harness del frente no se mueve (no hay build: nada compilado cambió)
node --test packages/core/manifest/mirror-parity/index.test.mjs
node --test packages/core/manifest/variant-parity/index.test.mjs
```

**No hace falta `pnpm build`, ni cadena, ni rosters, ni pierna 1**: el write-set
no toca fuente compilable. Si alguno de esos hubiera que correrlo, es señal de
que el write-set se salió de su carril → PARAR.

---

## 6. Fences

- **Cero cambios visuales.** Ninguno demostrado, ninguno intentado.
- **Cero materialización de tema.** Decisión del DT del 2026-08-21: se preserva
  la declinación explícita.
- **No inventar las 5 raíces sin consumers.**
- **No degradar un valor tenant autorado para uniformar** — en particular el
  `0.58` de bithire.
- **No confundir leaf-tag con root assignment**: los tags de hoja de F4A-7…13
  no son asignaciones de raíz y no se citan como tales.
- **No resolver `"sin control atribuido"`**: pertenece a F4A-close/F4B.
- **No hand-edit de generados**: `manifest/generated/*`, `facade/artifacts/*`,
  `styles/*`, `dist/*`.
- **No commit, no push, no stage, no stash, no checkout, no reset.**
- El `stash@{0}` ajeno **no se toca**.

---

## 7. Stop conditions

1. Cualquier hash de pre-estado difiere → PARAR, re-medir.
2. `root-catalog-freshness-gate` pide **regeneración** en vez de aceptar la
   enmienda → PARAR: existe un productor y la edición a mano sería hand-edit de
   generado.
3. `root-exposure-gate` se mueve de 26/28/10 → PARAR: el reparto de exposure es
   ley aparte de este lote.
4. El conteo de raíces se va de 64, o el reparto de `channelStatus` cambia más
   allá del único movimiento autorizado (47/10/7) → PARAR.
5. Hace falta **elegir un scope** para que un conteo de hojas cierre → PARAR
   (§2.9): es adjudicación del DT.
6. Aparece un generador de `docs/f4a/roster-variantes.*` → PARAR y usarlo en vez
   de editar a mano.
7. Cualquier hash de tema o de artefacto se mueve → PARAR **inmediatamente** y
   restaurar (§8): significa que el lote se salió de su carril.
8. `git diff --name-only` muestra un cuarto path → PARAR y restaurar.

---

## 8. Restore

Los 3 paths están limpios en HEAD, así que la restauración es trivial y **no
requiere `git checkout`**:

```bash
for f in packages/core/manifest/cascade/root-catalog.json \
         docs/f4a/roster-variantes.json \
         docs/f4a/roster-variantes.md; do
  git show HEAD:$f > $f
done
shasum -a 256 <los 3> | diff - /tmp/f4a14a-pre.sha    # DEBE ser vacío
git status --porcelain                                 # DEBE ser vacío
```

Antes de empezar, copiar los 3 a `/tmp/f4a14a-backup/` y verificar el respaldo
por hash — el mismo protocolo que los lotes F4A-7…13.

---

## 9. Entregable del lote

`/private/tmp/f4a-14a-reporte.md` con: hashes pre/post de los 3, campo por campo
qué cambió y con qué evidencia, salidas de los dos gates antes y después, prueba
por hash de que fuente de tema y artefactos no se movieron, `git status
--porcelain` entero, y las stop conditions que se hayan tocado. Flag
`/private/tmp/f4a-14a-listo.txt`. **Sin commit** — el commit es del DT.

---

## 10. Lo que este lote NO cierra

- La **proyección leaf-plane → root-plane** sigue sin instrumento
  (`docs/f4a/mapa-familia-canales.md` ya la nombra como hueco: "el roster… no
  proyecta sobre las familias de fuente"). Este lote la hace a mano para 8
  raíces; las otras 56 siguen sin proyectar.
- El **scope de las raíces `control.ratio.*`** (§2.9) queda sin definir.
- La clase **"53 familias sin control"** sigue reservada a F4A-close.
- **K5 / `CHROME.table`** es disjunta y no depende de este lote.
