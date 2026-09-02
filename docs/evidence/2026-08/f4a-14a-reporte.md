# F4A-14a / K4 — reparación contractual del plano de raíces — SOURCE_READY (Claude Sonnet Max, writer mecánico)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · **staged 0**

**Autoridades (SHA-256 recomputados por mí al arrancar esta sesión, los cinco exactos):**
- Brief K4 v3 `/private/tmp/f4a-14a-opus-implementation-brief-v3.md` = `06ecaa76c0a54b018fa91ca5d1bc68326e83e0af8af49c7779361a9ec0622ff1`
- Fable ACCEPT v3 `/private/tmp/f4a-14a-v3-fable-reaudit.md` = `22c39c6de36f75cd78e53f192f00106af249db033cd20a0e3f559d41cc0f5918`
- Addendum/frescura Opus `/private/tmp/f4a-k4-opus-freshness.md` = `f3f6e9959f11e0da1be5c0b0f0220fd3dbcb96eb167da4a011518c5f06b53d44` — `READY_FOR_K4_IMPLEMENTATION`
- T-1b Fable ACCEPT `/private/tmp/f4a-pre-k4-t1b-fable-postaudit.md` = `df8f92c8ce08d48651596d9eaed55b2d4228bd4e04941feff4fb8fe7ed2f1ac9`
- R-1 reanclado `/private/tmp/f4a-pre-k4-r1-reanchor.md` = `09d8a180cd0ab34bbde5656ac77536f66c4c33c2d215c8130038cdeaf23c0c23` — `R1_REANCHORED`

**Puerta de habilitación verificada:** T-1b postaudit ACCEPT + asiento R-1 (`1719/12/1 skip`) presentes antes de escribir. S-12 del addendum: no disparó.

**Leyes cumplidas:** exactamente 3 paths, todos limpios y en sus prehashes exactos antes de escribir; backup **por `cp`** del worktree (nunca `git show`, per V-1 escalada del postaudit T-1b); cero `git add/stage/commit/push/stash/checkout/reset/restore/R7`; cero edición al roadmap; cero build/generated/browser; checks seriales, ninguno en paralelo; no se corrió `pnpm test:scripts` (R-1 ya reanclado) ni `gates:ci`.

---

# VERDICT: SOURCE_READY

Las 8 reparaciones contractuales (3 en el catálogo, 5 sólo-roster) quedan escritas exactamente como derivan brief v3 + addendum. La aritmética post-reparación cierra a **261 = 95 + 96 + 70**, derivada por suma de las 64 `assignments`, no copiada. Ambos gates del catálogo pasan con los valores exigidos (**64 · 47/10/7** freshness; **26/28/10** exposure, sin mover). Los tres invariantes duros (temas, artefactos, exposure) se prueban por hash/valor idénticos. `mirror-parity` y `variant-parity` pasan completos. El delta de porcelain es exactamente los 3 paths de K4 sumados a los 8 preexistentes. Ningún stop condition (v3 1-9, addendum S-10..S-13) disparó.

---

## 0. Preestado verificado (antes de escribir)

| Chequeo | Exigido | Medido |
|---|---|---|
| HEAD | `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` | idéntico |
| staged | 0 | 0 |
| porcelain | 8 paths preexistentes, sorted SHA256 `adceef96a596f31d78526c7ee78dfd0a4b46d9fa43e94ea13a03e5b2596fd967` | idéntico (8 líneas, hash exacto) |
| roadmap SHA | `34aa05a46638b664e20626b10904fd15c85466afe82c59f689e3e63cee3b70cf` | idéntico, y **preservado byte-idéntico** al cierre |
| `root-catalog.json` prehash | `35a6912f709f71859eeb7ac7222dc01d8cfb44a0ab11054b9179a13d7e3d6bad` | idéntico |
| `roster-variantes.json` prehash | `7c8f562b3fb799fe3aff063c7b6402f63267ebb96062fed9c8a0a90f1427f09a` | idéntico |
| `roster-variantes.md` prehash | `1808731fb2a1b4781416f5d9ab875667a6a225d2147328dd5aa33629320c8871` | idéntico |
| write-set target limpio | sí | `git status --porcelain` restringido al write-set = 0 líneas, antes de editar |
| gates línea base | `root-catalog-freshness: 64 roots, 48/10/6`; `root-exposure: 26/28/10` | idéntico, corrido de primera mano antes de tocar nada |

Ningún noveno path. Ningún hash divergente. S-11 y S-10 (addendum) no dispararon.

---

## 1. Backup (V-1: sólo `cp`, nunca `git show`)

```
mkdir -p /private/tmp/f4a14a-backup
cp packages/core/manifest/cascade/root-catalog.json /private/tmp/f4a14a-backup/packages/core/manifest/cascade/root-catalog.json
cp docs/f4a/roster-variantes.json                   /private/tmp/f4a14a-backup/docs/f4a/roster-variantes.json
cp docs/f4a/roster-variantes.md                     /private/tmp/f4a14a-backup/docs/f4a/roster-variantes.md
```

Re-hasheado y comparado contra `/private/tmp/f4a14a-pre.sha`: **igualdad exacta, los tres** (`diff` vacío). Los tres existían pre-lote (`existía=yes`) — el restore, si hiciera falta, es "restaurar", nunca "borrar".

---

## 2. Write-set y hashes

| Path | Pre-hash | Post-hash |
|---|---|---|
| `packages/core/manifest/cascade/root-catalog.json` | `35a6912f709f71859eeb7ac7222dc01d8cfb44a0ab11054b9179a13d7e3d6bad` | `5a8379d18fab5a08213011d1ceda28fb145608b70a1d83dd3cb1149552696ae7` |
| `docs/f4a/roster-variantes.json` | `7c8f562b3fb799fe3aff063c7b6402f63267ebb96062fed9c8a0a90f1427f09a` | `4c80ab9c7ec091d9ea51252fb51c05ce49c86077ec587dacc4ae4276758f41e9` |
| `docs/f4a/roster-variantes.md` | `1808731fb2a1b4781416f5d9ab875667a6a225d2147328dd5aa33629320c8871` | `670dc6ecc415e7cc31789cfa529769b67d205e794d370da846f4ddd4b544a6d5` |

Diffs completos guardados fuera del repo:
- `/private/tmp/f4a14a-diff-catalog.patch` (131 líneas, SHA `fe06a99290189373fd9ba3fd34d63b1cb3b9a55eb143e4b7011210bd2de21503`)
- `/private/tmp/f4a14a-diff-roster-json.patch` (233 líneas, SHA `f44f08bff1679a2370080a2b49f4dc7c9252c7481fdfa6ef1e3c2bb080e42cc1`)
- `/private/tmp/f4a14a-diff-roster-md.patch` (153 líneas, SHA `b84cd27c1d1c7845ed5f3e2cea15d6c5b63f1957978ca699c6c22665a85f912b`)

**Delimitación de escritura, verificada por comparación entrada-a-entrada contra el backup (no por inspección visual):**
- `root-catalog.json`: exactamente **3** de 64 `roots[]` cambiaron (`tier.raised.fg`, `tier.overlay.fg`, `tier.overlay.bg`); **61 byte-idénticos**. De los campos top-level, sólo `method` y `corrections` cambiaron; dentro de `method`, sólo `assignments` (no `roots`, no `channelStatus`, no `denominator`, no `classes`, no `notMeasured`); `corrections.statement` intacto, `corrections.items` 4→7 (3 entradas nuevas, apendeadas); `reconciliation` **byte-idéntico completo**.
- `roster-variantes.json`: exactamente **16** de 198 entries cambiaron (dentro de las 8 raíces objetivo, 24 entries posibles, 8 ya eran correctas y quedan intactas); **174 entries fuera de las 8 raíces objetivo, byte-idénticas** (verificado programáticamente, cero excepciones).

---

## 3. Las 8 reparaciones — campo por campo, con evidencia

### 3.1 `tier.raised.fg` (`roots[7]`) — REPAIR
- `channel`: `--ds-color-text-primary` → **`--ds-material-raised-foreground`**
- `assignments`: `{total:4, rottay:2, bithire:2, evnto:0, modes:{rottay:[base,light], bithire:[base,dark], evnto:[]}}` → **`{total:2, rottay:0, bithire:2, evnto:0, modes:{rottay:[], bithire:[base,dark], evnto:[]}}`** — la posición dark autorada de bithire (P0-1) se **preserva**, sólo rottay 2→0.
- `channelStatus` **no** se toca (queda `existe`) — sólo `tier.overlay.fg` mueve `channelStatus` (invariante 4).

### 3.2 `tier.overlay.fg` (`roots[15]`) — REPAIR
- `channel`: `--ds-color-text-primary` → **`--ds-material-overlay-foreground`**
- `channelStatus`: `existe` → **`solo-artefacto`** (obligado por el freshness gate: 0 declaraciones autoradas del canal en `src/` excluyendo `artifacts/`)
- `assignments`: mismo patrón que 3.1 (bithire preserva base+dark; rottay 2→0)
- `exposureNote`: se **apendea** (no se reemplaza) la nota obligatoria del Tour test:
  > "Nota obligatoria (K4): `src/ui/primitives/overlay/Tour/tests/Tour.overlay-material.test.ts:55-64` pinea la AUSENCIA de este canal (...), con el incidente en su propio comentario: 'The overlay-foreground arm is unauthored on some tenants, so the chain fell through to the dark on-primary base and painted black on black.' No materializar nunca."

### 3.3 `tier.overlay.bg` (`roots[22]`) — REPAIR
- `channel`: `--ds-surface-overlay` → **`--ds-material-overlay-background`**
- `assignments`: `{total:4, rottay:2, bithire:2, evnto:0, modes:{...}}` → **`{total:1, rottay:0, bithire:1, evnto:0, modes:{rottay:[], bithire:[base], evnto:[]}}`** — aquí ×1 es correcto (asimetría real: el canal cabeza sólo se emite en base; el modo dark emite el canal *secundario*).
- `derivation`: se **apendea** (i) la semántica de asignación declarada — "emisión del canal cabeza por modo", instrucción del DT 2026-08-21, registrada explícitamente porque el mismo dato admite la lectura ×2 (hoja autorada en los dos brazos); (ii) el segundo canal `--ds-surface-overlay` **sólo aquí, nunca en `collapses`**; (iii) la advertencia de la declaración circular si se materializa en rottay/evnto.

### 3.4–3.7 Sólo roster (catálogo intacto)
- `control.ratio.padding` (`roots[35]`): assignments a nivel raíz **no se toca** (cuenta raíces, no hojas). Roster: rottay y bithire pasan a `authored` (rottay `derived` vía calc; bithire `seed`, literales por familia).
- `control.ratio.gap` (`roots[47]`): mismo patrón que padding.
- `control.ratio.lineHeight` (`roots[40]`): assignments/channel correctos, **no se tocan**. Sólo bithire: `domicile` `derived`→`seed`, governor corregido (bithire es literal `20px`, no deriva de `--ds-line-height-tight`).
- `control.ratio.iconSize` (`roots[41]`) — **REPARACIÓN PARCIAL, declarada explícitamente**: `roots[41].channel` **NO se toca** en este lote (semántica no aprobada — nombra el token de figura, no el canal por-control real). Sólo roster: rottay y bithire pasan a `authored` (rottay deriva de `--ds-icon-sm-size`; bithire `seed`, 15px literal). El residuo queda registrado en la nota de cada entrada del roster ("REPARACION PARCIAL, el channel queda como residuo abierto para F4A-close") y aquí mismo (§7).

### 3.8 `effect.intensity` (`roots[63]`) — nota, catálogo intacto
- `assignments` correcto — **no se toca**.
- Roster: rottay y evnto pasan de `authored/seed` a `unassigned/unassigned` (declinación explícita medida en fuente: `@placeholder SURFACES.effectIntensity`, `@domicile unassigned`). bithire intacto.
- `roster-variantes.md:185` (texto-licencia) reemplazado por la nota obligatoria completa, verbatim al brief: emisión medida `1 / 0.58 / 1`, declinación explícita de rottay/evnto, materialización probada cero-delta y **declinada por el DT el 2026-08-21**, y prohibición explícita de escribir `base=1` sobre bithire (regresión medida, 1 diff).

---

## 4. `method.assignments` y `corrections` — el post aritmético

**Prosa nueva de `method.assignments`** (derivada de la suma, no copiada):
> "...Total **261** (rottay **95**, bithire **96**, evnto **70**)..."

**Derivación verificada por `node -e` sumando las 64 `assignments` reales del catálogo post-reparación:**
```
261 = 95 + 96 + 70   OK
```

**`corrections.items` — 3 entradas nuevas, narrando los dos hechos por separado (más una tercera aceptada por Fable):**
1. **Drift de F4A-6 (263→268), ajeno a K4**: la prosa citaba el snapshot de 63 raíces; F4A-6 agregó `tier.page.ink` (`{5,2,2,1}`) sin actualizarla. Reconciliación al entero: `263+5=268, 99+2=101, 95+2=97, 69+1=70`.
2. **Delta de K4 (268→261)**: las 3 reparaciones de assignments restan `rottay -6, bithire -1, evnto 0` = **-7**. `268-7=261 = 95+96+70`.
3. **Prosa "63 raíces" de `method.roots`/`reconciliation.statement`**: mismo vintage de F4A-6, **registrada sin reescribir** (reescribirla exige re-medir los 3275 canales A+B, fuera de K4) — opcional de Fable, incorporada.

---

## 5. Batería — comandos, exit codes, salidas

### Antes
```
node root-catalog-freshness-gate/index.mjs   → root-catalog-freshness-gate: OK — 64 roots agree with src/ (48 existe, 10 por-crear, 6 solo-artefacto).   EXIT=0
node root-exposure-gate/index.mjs            → root-exposure-gate OK -- 26 tenant-dial, 28 internal-head, 10 gap; ...   EXIT=0
node --test root-exposure-gate/index.test.mjs → 13/13 pass
shasum themes → /private/tmp/f4a14a-themes-pre.sha
shasum artifacts → /private/tmp/f4a14a-art-pre.sha
```

### Después (serial, en orden)
```
node root-catalog-freshness-gate/index.mjs
  → root-catalog-freshness-gate: OK — 64 roots agree with src/ (47 existe, 10 por-crear, 7 solo-artefacto).   EXIT=0
node root-exposure-gate/index.mjs
  → root-exposure-gate OK -- 26 tenant-dial, 28 internal-head, 10 gap; every dial has an owner and no knobless root gained one   EXIT=0
node --test root-exposure-gate/index.test.mjs
  → 13/13 pass, 0 fail
node -e "require('./packages/core/manifest/cascade/root-catalog.json')"   → OK (parsea)
node -e "entries.length !== 198 → throw"                                  → OK 198
node -e "suma de las 64 assignments"                                     → 261 = 95 + 96 + 70 OK
shasum themes | diff - themes-pre.sha                                     → vacío (THEMES UNCHANGED)
find artifacts+styles | shasum | diff - art-pre.sha                       → vacío (ARTIFACTS UNCHANGED)
git status --porcelain > porcelain-post.txt; diff pre post
  → +3 líneas exactas: root-catalog.json, roster-variantes.json, roster-variantes.md — nada más
git diff --check                                                          → limpio
node --test packages/core/manifest/mirror-parity/index.test.mjs           → 44/44 pass
node --test packages/core/manifest/variant-parity/index.test.mjs          → 34/34 pass
```

**No se corrió** `pnpm build`, `pnpm test:scripts` (R-1 ya reanclado — `/private/tmp/f4a-pre-k4-r1-reanchor.md`, `1719/12/1 skip`), `gates:ci`, ni ningún generador.

---

## 6. Invariantes — prueba, no afirmación

| # | Invariante | Prueba |
|---|---|---|
| 1 | Cero fuente de tema | `shasum` de los 3 `brand-themes/*/index.ts` antes/después: **idéntico** |
| 2 | Cero pintura | `shasum` agregado de `facade/artifacts/**` + `styles/**` antes/después: **idéntico** |
| 3 | `root-exposure-gate` clavado 26/28/10 | Corrido antes y después: **sin cambio** |
| 4 | 64 raíces; único delta de `channelStatus` autorizado (`tier.overlay.fg` existe→solo-artefacto) → 47/10/7 | Freshness gate: `64 roots ... 47 existe, 10 por-crear, 7 solo-artefacto` — **exacto, y obligado por el gate mismo** |
| 5 | Las 5 raíces sin consumidor no se inventan | `state.delta.pressed/checked/expanded`, `alpha.ladder`, `tier.accent.bg` — verificadas presentes, `assignments` intactos (comparación entrada-a-entrada contra backup: 0 diffs en `roots[]` fuera de los 3 objetivo) |
| 6 | 3 raíces no tocadas (`tier.overlay.border`, `control.ratio.fontSize`, `control.ratio.radius`) | Mismo mecanismo — 0 diffs |
| 7 | La clase F4B no se resuelve | `roster-variantes.json`: gobernador `"dial: (raiz autora — dial en F4B)"` pasa de **9 a 10 entries** (la cuarta bithire de `tier.overlay.bg`, deliberada, declarada en el brief §4.7/invariante 7) |
| 8 | Ningún valor tenant autorado se degrada | `0.58` de bithire intocado (assignments/roots de `effect.intensity` sin cambio); posición dark autorada de bithire preservada en `tier.raised.fg`/`tier.overlay.fg` (P0-1) |
| 9 | Semántica de asignación declarada | Registrada en `roots[22].derivation` (§3.3) |

---

## 7. `control.ratio.iconSize` — declaración explícita de reparación PARCIAL

**Esta raíz NO queda cerrada por este lote.** `roots[41].channel` sigue citando `--ds-icon-md-size`, que **no es** el canal que los temas mueven: la emisión real corre por `--ds-input-md-icon-size` / `--ds-button-md-icon-size` (rottay `var(--ds-icon-sm-size)`, bithire `15px` literal). Sólo se reparó la **postura** del roster (rottay/bithire pasan a `authored`, reflejando que SÍ toman posición sobre la figura del ícono, aunque por un canal distinto al citado en el catálogo). El `channel` del catálogo queda **intacto por diseño** (fence del brief §2.8/§7): decidir si la raíz nombra el token de figura o el canal por-control es **semántica no aprobada**, adjudicación pendiente de F4A-close. Registrado en la nota de las dos entradas del roster afectadas y aquí. **No se vende como cerrado.**

---

## 8. Set-difference del porcelain

```
Preestado (8 líneas):
 M docs/ROADMAP-EJECUCION-2026-08-19.md
 M docs/prompt-codex-continue.md
 M packages/core/scripts/ci/gates-manifest/index.mjs
 M packages/core/scripts/evidence/cra-12-motion-governance/cra-12-motion-governance.reanchor.test.mjs
 M packages/core/scripts/quality-evidence/programs/modern-rescue/README.md
 M packages/core/scripts/quality-evidence/programs/modern-rescue/checkpoint/index.json
 M packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
 M packages/core/src/tooling/lane-control/public/program-state/index.mjs

Final (11 líneas) = preestado + exactamente:
 M docs/f4a/roster-variantes.json
 M docs/f4a/roster-variantes.md
 M packages/core/manifest/cascade/root-catalog.json
```

Los 8 preexistentes, re-verificados byte-idénticos al cierre (mismos hashes que al abrir esta sesión): `docs/prompt-codex-continue.md` = `afede1efdd7935c7cd7a64300ba4a1d9ea855403797deb693b4f10ebe28a4c47`; `gates-manifest/index.mjs` = `3b7f906f346c338302ff1a439cf18737b5a72a6f3b14dd9711efb4fb964cb64d`; `modern-rescue/README.md` = `281d079238b42a30ae4ab9a73fbb10b76394f70a45b80a7c9747bec636dc0687`; `checkpoint/index.json` = `5a86b12ae6369bdd0f56f668f0f6ac906274c4a405c7ea383f459db5e23dd5e4`; `program-check.test.mjs` = `6b20d27226c3529971a18e2799c57da3ac383aad2c742bccf2dcaae84b0fa1e2`; `program-state/index.mjs` = `263779f068cbd465d024c604420f657a73bd744e069950f9e7ad3ba9bea47594`; `cra-12-motion-governance.reanchor.test.mjs` = `39d65b6ed18d2ec34e3f69ecb578d3d64c502f88f0f3dbbb0423af2663c82a3c`; roadmap = `34aa05a46638b664e20626b10904fd15c85466afe82c59f689e3e63cee3b70cf`.

`git diff --check`: limpio. `staged`: 0.

---

## 9. Stop conditions — ninguna disparó

**v3 §8 (1-9):**
1. Hash de pre-estado difiere → no disparó (los 3 exactos).
2. Freshness gate pide regeneración → no disparó (acepta la enmienda; valida contra el árbol, no hash/productor).
3. `root-exposure-gate` se mueve de 26/28/10 → no disparó.
4. Conteo se va de 64, o `channelStatus` más allá de 47/10/7 → no disparó.
5. Hace falta elegir un scope para que un conteo cierre → no disparó (§2.10 respetado: no se fijó conteo de hojas de `control.ratio.*`).
6. Aparece un generador de `roster-variantes.*` → no disparó (no se buscó ni se usó; el roster se editó a mano, como manda el brief).
7. Hash de tema o artefacto se mueve → no disparó.
8. `git diff --name-only` muestra un cuarto path → no disparó (exactamente 3).
9. Suma post-reparación ≠ 261 (95/96/70) → no disparó (verificado exacto).

**Addendum §8 (S-10..S-13):**
- S-10 porcelain de apertura ≠ 8 líneas de §1 → no disparó.
- S-11 alguno de los 3 paths de K4 sucio → no disparó.
- S-12 postaudit T-1b ≠ ACCEPT o R-1 ausente → no disparó (ambos verificados antes de escribir).
- S-13 hace falta `git show`/git mutante para restaurar → no disparó (no hubo restore; el backup fue `cp`, per V-1).

---

## 10. Estado final

```
HEAD 9d5582dfdf1d02f1d7e8fd468720b1d829e50454   (sin mover)
staged: 0
git status --short: 11 líneas (8 preexistentes + 3 de K4)
git diff --check: limpio
```

Ningún commit. Ningún stage. Kimi fuera de la cadena en todo momento. `pnpm test:scripts` NO se corrió (R-1 ya reanclado por Codex); `gates:ci` NO se corrió (fuera del carril de este lote, v3 §6).

**Write-set de esta sesión de implementación:** los 3 paths de K4 (únicos, en el repo) + este reporte y su `.listo` + evidencia durable en `/private/tmp/f4a14a-*` (fuera del repo, incl. los scripts de patch usados, para trazabilidad).

# VERDICT: SOURCE_READY
