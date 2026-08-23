# F4A-close — cierre real-keypath-parity (Claude Sonnet Max, writer mecánico) — SOURCE_READY

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · **staged 0**

**Autoridades verificadas (SHA-256 recomputados al abrir esta sesión, las tres exactas):**
- Fable challenge `/private/tmp/f4a-close-real-parity-fable-challenge.md` = `8a9c7f4815785c1ffa997416bb29664975c53ea2e1c682e34382a9f47bb0cdda`, `ACCEPT_WITH_BINDING_CORRECTIONS`.
- DT ruling `/private/tmp/f4a-close-real-parity-dt-ruling.md` = `ca7c99bf6dd124bebf515610ae1982b66a149334adf8596d48a09a3585960ca7` (adopta íntegro el challenge Fable; amplía el write-set operacional al cierre transitivo de K5).
- Diseño Opus `/private/tmp/f4a-close-real-keypath-parity-opus.md` = `c5115843e3e98be0d1b6b7de8afd580739fda6736dad0e311536be9649647ebe` (evidencia; Fable+DT prevalecen en las correcciones C-B1..C-B6, incorporadas).

---

# VERDICT: SOURCE_READY

Implementado en un solo lote, en el orden A→G mandado. La tercera disposición `@absent <hoja exacta>` + `@governor` quedó cableada en el lexer/analizador de `variant-parity`; los 53 bloques (rottay 19, bithire 1, evnto 33, incluido `evnto × CHROME.table.border` como `declared-absent`) cerraron `silentPairs` 53→0 sin mover `placeholderPairs` (quieto en 3969) ni un solo valor de tema. `tagRegistry` 4155→4208 exacto. `divergentSlots` salió del bucle de pines de `evaluate()` y quedó informativo, congelado en 33. La clausura transitiva de 9 artefactos más y el sello GAT-07 corrieron limpios; `gates:ci` cerró en 89 blocking + 2 excluded. Ningún STOP disparó.

---

## 0. Preestado verificado

| Chequeo | Exigido | Medido |
|---|---|---|
| Node | v22.17.0 | `v22.17.0` |
| HEAD | `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` | idéntico |
| staged | 0 | 0 |
| porcelain | 25 | idéntico |
| `git diff --check` | verde | limpio |
| Los 15 write-set paths | 2 clean (`index.mjs`/`index.test.mjs`), 13 ya dirty de K5/GAT-07 | confirmado, ninguno sucio fuera de lo esperado |

Backup: `/private/tmp/f4a-close-real-parity-backup.BSq4P5/` — los 15 paths, re-verificados byte-idénticos contra el árbol vivo antes de escribir.

## 1. Semántica implementada (§1-2 del encargo)

- **Lexer extendido** (`finishBlock`): regex `@(domicile|governor|placeholder|absent)`; `tags.absent`.
- **`analyzeSource`**: `@absent <hoja>` es una disposición independiente (no requiere `@domicile`); validaciones locales — ruta no vacía, mutuamente exclusiva con `@domicile`/`@placeholder` en el mismo docblock, `@governor` obligatorio, contradicción por **igualdad exacta** (`leaves.has(absent)`, nunca prefijo) si el propio tema autora esa hoja, no cubierta ya por un `@placeholder` del mismo tema (chequeo cruzado post-loop, robusto a orden de aparición), duplicados dentro del mismo tema rechazados.
- **`buildDoc`**: validación GLOBAL — la ruta debe pertenecer al `authoredUniverse` (unión de hojas autoradas por ALGÚN tema), por igualdad exacta; un prefijo de familia (p.ej. `CHROME.table`) nunca pasa porque no es miembro exacto del universo. Nueva disposición `disposition[tenant]` (clon de `positions` + `declared-absent`), de la que salen `silentPairs` (pares sin ninguna disposición — el único defecto) y `placeholderPairs` (agregado, decrease-only aparte). `positions`/`complete`/`divergentSlots` quedan **intactos**, informativos.
- **`evaluate()`**: pines `['silentPairs', 'placeholderPairs', 'untaggedAuthoredLeaves']` — `divergentSlots` retirado del bucle.

## 2. Orden ejecutado (A→G)

**A — maquinaria + tests + rojo intermedio.** `index.mjs`/`index.test.mjs` editados; sintaxis verificada; medido contra el árbol **sin datos**: `silentPairs=53`, `placeholderPairs=3969`, `tagRegistry.count=4155`, 0 failures — exacto a lo predicho por Fable/Opus. 13 tests nuevos agregados (fixtures PASS/silencio/sin-governor/fuera-de-universo/prefijo-prohibido/sobre-autorada/combinación-inválida/ya-cubierta-por-placeholder/duplicado/orphan-intacto + 2 negativas + 1 drill de retiro de `divergentSlots` del vocabulario de pines); **45/47 verdes, 2 rojos** (los que dependen del corpus real aún sin los 53 bloques) — exactamente el rojo intermedio mandado.

**B — 53 docblocks + generado + baseline.** rottay 19, bithire 1, evnto 33 (incluye `evnto × CHROME.table.border`, `declared-absent`, no placeholder). Post-escritura: `silentPairs=0`, `placeholderPairs=3969`, `declaredAbsentPairs=53`, `declaredAbsent={rottay:19,bithire:1,evnto:33}`, `tagRegistry.count=4208`, 0 failures. Baseline migrado: pines nuevos `silentPairs:0`/`placeholderPairs:3969`; nota falsa de `divergentSlots` corregida (el universo ES la unión de autoradas, "ningún tema autora" era imposible por construcción — medido por Opus/Fable); `divergentSlots` congelado en 33, informativo; Baja #15 narrada. `--check` verde: `2559 slots (7677 pares), 0 silenciosos, 3969 con placeholder, 0 hojas sin tag (4208 tags leidos)`. **47/47 tests verdes.**

**C — fanout / root-checklist / mirror, en ese orden.** `fanout-facts`: mismo set de 7504 canales, 0 diferencias de claves — sólo posiciones. `root-checklist --check`: **byte-idéntico** (no proyecta líneas de `brand-themes`, como en K5). `mirror-parity`: sólo las 3 huellas de tema cambiaron (bytes/lines/sha256); `surface`/`valueParity`/`cascadePresence`/`cascadeSeverance`/`sourceSkeleton.union|intersection` intactos.

**D — census / preservation / reconciliation / controls-catalog.** Census `--write`: `universe=7303, dead=266` sin mover; sólo `meta.inputsDigest` cambió. Preservation `--write`: `80 protos, 266 dead` sin mover; sólo `basedOnReportDigest`. Reconciliation: **un solo campo** actualizado (`basedOnReportDigest` → sha256 real del report nuevo, `e5407af8…`), confirmado que era la única delta esperada (`deadWriters` 266=266 sin cambio). Controls-catalog `--write`: sólo el `digest:` embebido; tablas Standard(13)/Pro(7) idénticas.

**E — checks individuales + negativas.** Los 8 productores + `program-state --check`: **todos verdes**. Negativas con restore por `cp`+rehash: **N-1** (revertir `fanout-facts.json` → rojo nombrando el archivo → restore verde); **N-2 central, anti-tapadera** (sustituir el único `@absent` de bithire por `@placeholder` → `placeholderPairs GREW from 3969 to 3970` → restore verde); **N-3** (retirar ese mismo `@absent` sin sustituir → `silentPairs GREW from 0 to 1` → restore verde). Aislamiento: porcelain 27 = 25 preexistentes + exactamente los 2 paths de esta sesión que estaban clean (`index.mjs`, `index.test.mjs`); ningún path 16.

**F — `pnpm test:scripts` (Node 22, una corrida).** `# tests 1732 · pass 1719 · fail 12 · skipped 1`. Frente a R-1 (`1719/1706/12/1`): **+13 tests, todos en `variant-parity/index.test.mjs`** (los fixtures/negativas de este lote); **+13 pass** (cero regresión: los 1706 pass previos siguen pass, más los 13 nuevos); **12 fails idénticos byte a byte** contra `/private/tmp/f4a-r1-run-1-failures.txt` (diff vacío tras ordenar); **skip idéntico**; `export-missing`/`export-unshipped` verdes. **Ninguna identidad previa de R-1 se perdió.**

**G — GAT-07 + `gates:ci`.** `gat07:write`: los cinco sitios de huella autorizados (3 temas bytes/sha256, `inputManifest.digest`, `reproducibility.authorityDigest` — alias exacto, verificado `===`) se movieron; los trece campos inmóviles (`paintAudit`, `publicClaims`, `verticalFacts`, `dataPartEvidence`, `staleClaimGates`, `workOrderDefinition`, `documentationAuthority`, `authority`, `scope`, `schemaVersion`, `reproducibility.{classification,sourceHeadIsAuthority,toolchain}`) **byte-idénticos**; `deterministicRuns.agree=true`, `hashes[0]===hashes[1]`, `semantic-hash.txt` idéntico. `gat07:check` verde; negativa (revertir `semantic-hash.txt`) → rojo nombrando exactamente ese path → restore verde. `gates:ci` una sola corrida: **`ci-gates OK — 89 blocking gate(s) passed`** + 2 excluded conocidos (`channel-liveness`, `lane-control-drills`); `variant-parity` y `gat-07-exact-proof` ambos `PASS`. Cero build, cero browser.

## 3. Contadores finales (todos exactos a lo mandado)

`silentPairs` **53→0** · `placeholderPairs` **3969→3969** (quieto) · `orphanPlaceholders` **0** · `untaggedAuthoredLeaves` **0** · `tagRegistry` **4155→4208** · `divergentSlots` **informativo, congelado en 33, fuera del gate**. Cero cambio de valores (verificado línea por línea: los únicos `+`/`-` en los 3 temas son `/**`, `* @absent`, `* @governor`, `*/`).

## 4. Perímetro y write-set

Exactamente los 15 paths mandados; ninguno más. `root-checklists.json` verificado `--check`, byte-idéntico (no material). Cero `git add/stage/commit/push/stash/checkout/restore/reset/R7`. Cero build/browser. Kimi fuera de la cadena en todo momento.

**Evidencia durable fuera del repo:**
- `/private/tmp/f4a-close-real-parity-backup.BSq4P5/` — backup pre-escritura de los 15 paths.
- `/private/tmp/f4a-close-real-parity.diff` — diff completo del árbol de trabajo.
- `/private/tmp/f4a-close-real-parity-test-scripts.log` — corrida completa de R-1 (1732/1719/12/1).
- `/private/tmp/f4a-close-real-parity-gates-ci.log` — corrida completa de `gates:ci`.
- `/private/tmp/f4a-close-divergent-slots.mjs`, `/private/tmp/f4a-close-real-parity-classify.mjs`, `/private/tmp/f4a-close-real-parity-gen-blocks.mjs`, `/private/tmp/f4a-close-real-parity-patch-baseline.mjs` — scripts usados para derivar/generar los 53 governors y migrar el baseline.

**No declaro cierre de tranche**: sólo el postaudit Fable cierra este frente.

# VERDICT: SOURCE_READY
