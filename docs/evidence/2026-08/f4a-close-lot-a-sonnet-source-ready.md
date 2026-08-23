# F4A-close — LOTE A (parser P2 + 52 governors + cerca PRE_F4B + clausura derivada) — Claude Sonnet Max, writer mecánico — SOURCE_READY

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · **staged 0**

**Autoridades verificadas (SHA-256 recomputados al abrir esta sesión, las dos exactas):**
- Fable challenge (vinculante) `/private/tmp/f4a-close-remaining-fable-challenge.md` = `df28110486f9bf9d9f182f8898e018d2c24d2c833437118862077df9941e7b5d`, verdict `ACCEPT_WITH_BINDING_CORRECTIONS`.
- Opus v2 (contexto/evidencia) `/private/tmp/f4a-close-remaining-opus-v2.md` = `9a04a002a4b2eee533a7e312b78add820f1f319164cca520f7986fe9eb1ff9be`.

Implementado exactamente **LOTE A** de Fable §2/§4/§5/§7. Donde Opus v2 y Fable difirieron (numeración del re-anclaje, cita de línea, statsGrid 12 vs 13, y sobre todo los domicilios de CHARTS/accent/statsGrid que Opus dejó como STOP-A/STOP-B sin resolver), mandó Fable. **Lote B (iconSize + catálogo + roster) NO se tocó** — `root-catalog.json` y `manifest/index.json` permanecen exactamente en los hashes que Opus v2 citó (`5a8379d18fab5a08…`, `63785d02253426dd…`), verificados sin mover. **Los 2 artefactos GAT no se escribieron todavía**, por instrucción explícita: este memo es el cierre del *source*; el sello ocurre después del postaudit.

---

# VERDICT: SOURCE_READY

Los cuatro puntos de Lote A quedaron implementados: (1) el parser reconoce `absent` en `nextIsText` y el fixture de orden invertido pasa; (2) los 52 docblocks (10 CHARTS + 18 accent `unassigned→seed` con G-1/G-2; 12 CHROME.statsGrid + 12 OVERLAY gemelas con G-3, domicilio `seed` sin cambio) quedaron reescritos **sólo en texto**, cero valores, cero altas/bajas de docblocks, `tagRegistry` congelado en **4208**; (3) la cerca ejecutable PRE_F4B (`rootsExcludedNote` + el test que consume `classifyCascadeWiring()`) quedó cableada y consumida por la fila bloqueante existente, sin gate nuevo; (4) la clausura derivada corrió en el orden mandado, con `fanout-facts` y `root-checklists` **byte-idénticos** (confirmando que ningún reemplazo de texto movió una línea). R-1 reprodujo **`1734/1721/12/1`** exacto, sin re-anclar. Ningún STOP disparó.

---

## 0. Preestado verificado

| Chequeo | Exigido | Medido |
|---|---|---|
| Node | v22.17.0 | `v22.17.0` |
| HEAD | `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` | idéntico |
| staged | 0 | 0 |
| porcelain | 27 (dirty intencional, heredado) | idéntico |
| `git diff --check` | verde | limpio |

Backup: `/private/tmp/f4a-close-lot-a-backup.qfJ3Mk/` — los 16 paths de Lote A (14 material + 2 operacionales), re-verificados byte-idénticos contra el árbol vivo antes de escribir. Los pines vivos citados por Opus v2 §5.1 para los paths ya dirty coinciden exactos con el backup.

## 1. Parser P2 + fixture (punto 1)

`manifest/variant-parity/index.mjs`: el patrón negativo de `nextIsText` pasa de `@(domicile|governor|placeholder)\b` a `@(domicile|governor|placeholder|absent)\b` (una palabra). `manifest/variant-parity/index.test.mjs`: nuevo test `drill P2-1: orden invertido @governor -> @absent NO es governor multilinea`, con un docblock `@governor` antes que `@absent` — pasa limpio con el fix (`a.failures = []`, `a.absences[0].slot === 'PALETTE.secondary'`). **48/48 tests del productor verdes** (47 previos + 1 nuevo).

## 2. Los 52 governors (punto 2) — sólo texto, cero valores

Reescritos por script determinístico, con reemplazo **escopado por rango de línea** (nunca por texto libre — CHARTS y accent compartían el mismo texto viejo byte a byte, y ese mismo texto también aparece en `spinner`/`statistic`/`steps`/`cardComponent` fuera de mi write-set; un reemplazo global los habría corrompido). Verificado por conteo exacto:

| grupo | entradas | domicilio | wording |
|---|---:|---|---|
| `CHARTS.*` (rottay 3, bithire 4, evnto 3) | 10 | `unassigned` → `seed` | G-1 (personalidad de charts, argumento de renderers, 0/20 ingress) |
| `CHROME.accent.*` (6 ejes × 3 temas) | 18 | `unassigned` → `seed` | G-2 (forma de accent, `PersonalityTokens.accent`, ingress `chrome.families`) |
| `CHROME.statsGrid.*` (rottay, 12) | 12 | `seed` (sin cambio) | G-3 (baja a canal `--ds-stats-grid-*`, ingress `chrome.families`, token-overrides no es su dial) |
| `OVERLAY.chrome.statsGrid.*` (rottay, 12, gemelas) | 12 | `seed` (sin cambio) | G-3, mismo texto — incluye el retiro del contradictorio `dial: token-overrides` en `trendNegative` |
| **Total** | **52** | | |

Verificado: `tagRegistry.count` **4208 → 4208** (ninguna entrada agregada ni quitada); **cero líneas no-comentario tocadas** en los 3 temas (diff filtrado a `@domicile`/`@governor`: vacío); **conteo de líneas de los 3 archivos sin cambio** (rottay 9316, bithire 9308, evnto 5014 — idéntico pre/post, confirmando la clase "material sin renglones" que Fable exige).

## 3. Cerca ejecutable PRE_F4B (punto 3)

- `scripts/engine/cascade-wiring-ratchet/cascade-wiring-ratchet.baseline.json`: agregada **una sola clave** `rootsExcludedNote` (el script sólo lee `debt`, verificado — ninguna otra clave se toca).
- `scripts/engine/cascade-wiring-ratchet/index.test.mjs`: agregado **un** `test()`, verbatim el de Fable §4. Corrida en vivo: `roots === baseline.rootsExcluded` (**768**), `fallbackTargets.has('--ds-input-md-icon-size') === true`, `!reachesRoot.has(...)`, `!denominator.includes(...)` — los cuatro medidos exactos. **10/10 tests del archivo verdes** (9 previos + 1 nuevo). Cero fila de gate nueva; la consume `cascade-wiring-ratchet-drill` (ya bloqueante) + `test:scripts`.

## 4. Clausura derivada (punto 4) — hasta ANTES del sello GAT

Orden ejecutado: `variant-parity` (productor) → `fanout-facts` (productor, **byte-idéntico**) → `root-checklist` (productor, **byte-idéntico**) → `mirror-parity` (productor, sólo 3 huellas de tema) → `customization-surface-census --write` (sólo `meta.inputsDigest`) → `customization-reconciliation.json` (mano, sólo `basedOnReportDigest`, **12.º re-anclaje** — `e5407af8…` → `e15e3be7…`) → `kimi-preservation-manifest --write` (sólo `basedOnReportDigest`) → `controls-catalog --write` (sólo el digest embebido). `root-catalog.json` y `manifest/index.json` **no tocados** (Lote B). Los 2 paths de `test-artifacts/gates/gat-07/` **no escritos** (sello posterior al postaudit).

## 5. Contadores finales (todos exactos)

`tagRegistry.count` **4208 → 4208** · `silentPairs` **0 → 0** · `placeholderPairs` **3969 → 3969** · `declaredAbsentPairs` **53 → 53** · `untaggedAuthoredLeaves` **0 → 0** · `divergentSlots` **33, informativo** (sin cambio) · `roots` (cascade) **768** · cero valores de tema. Los 8 `--check` (variant-parity, fanout-facts, root-checklist, mirror-parity, customization-surface-census, kimi-preservation-manifest, controls-catalog, manifest generator) + `program-state --check`: **todos verdes**.

## 6. Negativas — todas mordieron, todas restauradas por `cp`+rehash

| # | acción | resultado | restore |
|---|---|---|---|
| N-1 | revertir `mirror-parity.json` al pin pre-lote | `✗ desactualizado` (rojo) | verificado byte-idéntico, verde de nuevo |
| N-2 | (cubierta por el test P2-1: orden invertido pasa con el fix; sin el fix habría dado `malformed: governor multilinea`, comportamiento pre-existente ya documentado) | — | — |
| N-3 | borrar el `@governor` de `CHARTS.mountDuration` (rottay) | `rottay:3805: @domicile seed sin @governor` + `untaggedAuthoredLeaves GREW from 0 to 1` | verificado byte-idéntico, verde de nuevo |
| N-4 | cambiar `mountDuration: 800` → `801` (valor) | `mirror-parity` desactualizado (bytes/sha del tema cambiaron) | verificado byte-idéntico, verde de nuevo |
| N-6 | `rootsExcluded` 768→767 en el baseline del ratchet | la cerca falla: `768 !== 767` | verificado byte-idéntico, verde de nuevo |

**N-5 (aislamiento):** porcelain final **29 = 27 + exactamente los 2 paths nuevos** (`cascade-wiring-ratchet.baseline.json`, `cascade-wiring-ratchet/index.test.mjs`) — ningún path 30.º. Coincide exacto con la aritmética de Fable B-2 ("A: 27 → 29").

## 7. R-1 — una sola corrida, vara vigente

`pnpm test:scripts` (Node v22.17.0, serial): **`# tests 1734 · pass 1721 · fail 12 · skipped 1`** — exacto a la vara de Fable B-1 (`1734/1721/12/1`; +2 tests nuevos de este lote sobre la vara previa `1732/1719/12/1`). Las 12 fallas: **diff vacío** contra `/private/tmp/f4a-r1-run-1-failures.txt` (ordenado). Skip: idéntico. `export-missing`/`export-unshipped`: verdes. **Sin re-ancla.**

## 8. Perímetro

Write-set exacto de Lote A: los 16 paths de Fable §5 (14 material + 2 operacionales verificados byte-idénticos) — ningún otro. `root-catalog.json`/`manifest/index.json`/roster: **no tocados** (Lote B). `test-artifacts/gates/gat-07/*`: **no escritos** — sus hashes siguen siendo los pines originales (`512bef39…`, `78670dfde…`). Cero `git add/stage/commit/push/stash/checkout/restore/reset/R7`. Cero build/browser. Kimi fuera de la cadena en todo momento.

**Evidencia durable fuera del repo:**
- `/private/tmp/f4a-close-lot-a-backup.qfJ3Mk/` — backup pre-escritura de los 16 paths.
- `/private/tmp/f4a-close-lot-a.diff` — diff completo del árbol de trabajo.
- `/private/tmp/f4a-close-lot-a-test-scripts.log` — corrida completa de R-1 (1734/1721/12/1).
- `/private/tmp/f4a-close-lot-a-rewrite-governors.mjs`, `/private/tmp/f4a-close-lot-a-flip-domicile.mjs` — scripts deterministas usados para los 52 governors + 28 flips de domicilio.

**PARO antes de GAT/CI**, tal como se instruyó. **Espero postaudit Fable del source** de Lote A antes de sellar `test-artifacts/gates/gat-07/*` y correr `gates:ci`. No declaro cierre de Lote A ni de F4A-close.

# VERDICT: SOURCE_READY
