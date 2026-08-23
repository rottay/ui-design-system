# F4A-close — LOTE B (iconSize: catálogo + generator + manifest/index + roster) — Claude Sonnet Max, writer mecánico — SOURCE_READY

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · **staged 0**

**Autoridades verificadas (SHA-256 recomputados al abrir esta sesión, las dos exactas):**
- Fable challenge (vinculante) `/private/tmp/f4a-close-remaining-fable-challenge.md` = `df28110486f9bf9d9f182f8898e018d2c24d2c833437118862077df9941e7b5d`, §§3/7 — adjudicación `control.ratio.iconSize` disposición `base` única `--ds-input-md-icon-size`.
- Lote A postaudit final `/private/tmp/f4a-close-lot-a-fable-final-postaudit.ready` = `9c7ff03aa60e00261cc2e54406d7bf5073955a8e9a2801558652d45997e4162c`, verdict `ACCEPT` — Lote A cerrado, Lote B liberado.

Implementado **exclusivamente Lote B**: catálogo → generator → manifest/index + roster, con su cierre transitivo completo, cerrando el tramo diferido de K4 (el channel de `control.ratio.iconSize` quedaba como residuo abierto para F4A-close). **No se tocó GAT-07, temas, parser, cerca cascade ni roadmap.**

---

# VERDICT: SOURCE_READY

`control.ratio.iconSize.channel` pasó de `--ds-icon-md-size` (canal que ningún tema emite) a `--ds-input-md-icon-size` (canal real, con declaración base en `input.css:38`, emitido por rottay y bithire con la misma figura en ambos temas); `evidence` se movió al sitio correcto. N-B1 mordió exactamente como se predijo (staleness roja antes de regenerar). El regenerado de `manifest/index.json` movió **sólo `inputsDigest`**; los 275 JSON de `manifest/controls/**` + `manifest/families/**` quedaron **byte-idénticos a HEAD** (`git status --porcelain` vacío sobre ambos directorios — prueba más fuerte que un Merkle, ya que confirma igualdad byte a byte contra el commit). `root-catalog-freshness` y `root-exposure` verdes con los conteos exactos (`64 roots`, `26/28/10`). Roster actualizado en sus 2 entradas exactas, conteo de 198 entradas intacto. R-1 reprodujo **`1734/1721/12/1`** idéntico (Lote B no agrega tests). `gates:ci` cerró **89 blocking + 2 excluded**. Ningún STOP disparó.

---

## 0. Preestado verificado

| Chequeo | Exigido | Medido |
|---|---|---|
| Node | v22.17.0 | `v22.17.0` |
| HEAD | `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` | idéntico |
| staged | 0 | 0 |
| porcelain | 29 (dirty intencional, heredado) | idéntico |
| `git diff --check` | verde | limpio |

Backup: `/private/tmp/f4a-close-lot-b-backup.SMOVf0/` — los 4 paths, re-verificados byte-idénticos contra el árbol vivo antes de escribir (`root-catalog.json` = `5a8379d18fab5a08…`, `manifest/index.json` = `63785d02253426dd…` — ambos coinciden exactos con los pines que Opus v2 y Fable citaron como intactos desde K4/Lote A).

## 1. `root-catalog.json` — sólo `channel` + `evidence`

| campo | pre | post |
|---|---|---|
| `roots[41].channel` | `--ds-icon-md-size` | `--ds-input-md-icon-size` |
| `roots[41].evidence` | `.../components/icon.css:21` | `.../components/input.css:38` |

Verificado por diff estructural campo por campo (Python, recursivo): **exactamente estos 2 campos cambiaron en todo el documento** (64 roots). `channelStatus: "existe"` (sigue honesto: `--ds-input-md-icon-size: 1.25rem` está declarado en `input.css:38`, verificado antes de editar); `governedBy: null`, `governanceScope: "ninguna"`, `exposure: "internal-head"`, `derivationDebt: true`, `assignments {total 2, rottay 1, bithire 1, evnto 0}`, `collapses {total 23, rottay 10, bithire 13, evnto 0}` — **todos intactos**.

## 2. N-B1 + regenerado de `manifest/index.json`

```
node manifest/generator/index.mjs --check
→ customization-manifest FAIL — manifest/index.json is stale; run generator/index.mjs --write
  EXIT 1   ← N-B1, la mordida de staleness, exacta
```

```
node manifest/generator/index.mjs --write
→ customization-manifest OK (20 controls × 255 families = 5100 cells; 5100 unknown; 0 accepted)
node manifest/generator/index.mjs --check
→ customization-manifest OK (20 controls × 255 families = 5100 cells; 5100 unknown; 0 accepted)
  EXIT 0
```

**Delta de `manifest/index.json`: una sola línea, `inputsDigest`** (`9b0b7287… → 85951b03…`). `denominators` (`{255 familias, 13+7=20 controles, 5100 celdas, 3 grupos}`) y `rollups.familyReviews` (`{255/0/0/0}`) — **sin cambio**.

**Footprint operativo de los 275 (`manifest/controls/**` + `manifest/families/**`): byte-idéntico a HEAD.** `git status --porcelain` sobre ambos directorios: **vacío** — prueba directa de que ningún byte de los 20 controles ni las 255 familias se movió, más fuerte que comparar un Merkle contra un pin de sesión anterior.

## 3. Checks de catálogo

```
root-catalog-freshness-gate: OK — 64 roots agree with src/ (47 existe, 10 por-crear, 7 solo-artefacto)
root-exposure-gate OK -- 26 tenant-dial, 28 internal-head, 10 gap; every dial has an owner and no knobless root gained one
```

`roots` sigue **64**; exposure exacto **26/28/10**, idéntico a lo que Opus v2 citó antes de la adjudicación (el cambio de canal no mueve la clasificación de exposure de esta raíz, que sigue `internal-head`).

## 4. Roster — 2 entradas, conteo intacto

`docs/f4a/roster-variantes.json`: retirada la cláusula *"REPARACION PARCIAL, el channel queda como residuo abierto para F4A-close"* de las notas de **rottay** y **bithire** (las 2 entradas con posición autorada); asentado el canal adjudicado y su razón (convención del grupo `geometria-de-controles`, evidencia `input.css:38`). **Entradas: 198 → 198** (sin cambio). La entrada `evnto` (unassigned) no se tocó — no llevaba la cláusula de residuo.

`docs/f4a/roster-variantes.md`: el encabezado `--ds-icon-md-size` → `--ds-input-md-icon-size`; la nota `>` del bloque, misma retirada de cláusula. **2 líneas cambiadas de 729, conteo de líneas idéntico** (729 → 729).

## 5. Aislamiento y perímetro

Porcelain final: **29**, mismo conjunto exacto que el preestado — **ningún path 30.º**. `test-artifacts/gates/gat-07/*`, `manifest/variant-parity/*`, `brand-themes/*`, `cascade-wiring-ratchet.baseline.json` y `docs/ROADMAP-EJECUCION-2026-08-19.md`: **no tocados por esta sesión** (verificado que siguen dentro del mismo conjunto de 29 dirty, sin ningún Write/Edit mío sobre ellos en este lote). Cero `git add/stage/commit/push/stash/checkout/restore/reset/R7`. Cero build/browser. Kimi fuera de la cadena en todo momento.

## 6. R-1 y `gates:ci`

`pnpm test:scripts` (Node v22.17.0, serial, una corrida): **`# tests 1734 · pass 1721 · fail 12 · skipped 1`** — **idéntico** a la vara de Lote A (Lote B no agrega tests). Las 12 fallas: diff vacío contra la lista canónica R-1. Skip idéntico. `export-missing`/`export-unshipped` verdes. **Sin re-ancla.**

`pnpm --filter @rottay/design-system gates:ci` (una corrida): **`ci-gates OK — 89 blocking gate(s) passed.`** + 2 excluded conocidos (`channel-liveness`, `lane-control-drills`). `root-catalog-freshness`, `root-exposure(-drill)`, `cascade-wiring-ratchet(-drill)`, `variant-parity` y `gat-07-exact-proof`: todos **PASS**. Cero build, cero browser.

## 7. Estado final

```
HEAD 9d5582dfdf1d02f1d7e8fd468720b1d829e50454   (sin mover)
staged: 0
git status --porcelain: 29 líneas — mismo conjunto que el preestado
git diff --check: limpio
residuo *.tmp-*: 0
```

Cero commit. Cero stage. Cero push. Kimi fuera de la cadena en todo momento.

**Evidencia durable fuera del repo:**
- `/private/tmp/f4a-close-lot-b-backup.SMOVf0/` — backup pre-escritura de los 4 paths.
- `/private/tmp/f4a-close-lot-b.diff` — diff completo del árbol de trabajo.
- `/private/tmp/f4a-close-lot-b-test-scripts.log` — corrida completa de R-1 (1734/1721/12/1).
- `/private/tmp/f4a-close-lot-b-gates-ci.log` — corrida completa de `gates:ci`.

**No declaro cierre de Lote B ni de F4A-close.** Espero postaudit Fable. Con A y B postauditados, sólo queda la auditoría 14.ª del frente (acto de cierre DT/Fable, no un tranche de escritura) — este memo no la ejecuta ni la solicita.

# VERDICT: SOURCE_READY
