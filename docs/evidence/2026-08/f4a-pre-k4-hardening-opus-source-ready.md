# T-0 authority-honesty — SOURCE_READY (implementación Opus, hardening pre-K4)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD (sin mover):** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · **staged 0** · **sin commit**

**Autoridades ejecutadas (SHA-256 verificados byte-exactos al abrir):**
- Brief v2 `/private/tmp/f4a-t0-opus-implementation-brief-v2.md` = `e8c5314a920c439fdfa307af80534f9dc6f5fe6b5ffa21918b4ba0d93f58f541`
- Preaudit Fable `/private/tmp/f4a-t0-fable-preaudit.md` = `50733688deb2956ac7757c202ff43373e04b13e14206c219ca2526191126ca7e` — **ACCEPT**
- Adjudicación DT `/private/tmp/f4a-t0-dt-adjudication.md` = `0d9b57705609be63533e3ede44a3feaa10b396484790f66ea96a44711fe4d468` — **ACCEPT, cinco paths**

**Preestado verificado ANTES de escribir:** HEAD exacto · staged 0 · único dirty `docs/ROADMAP-EJECUCION-2026-08-19.md` = `a4aabddee653cf94f66a7d589a4947bda5fef64a270441ded93e44caae83b202`.
**Kimi:** fuera de la cadena. No consultado, no esperado, no atribuido.
**Sin `git add/stage/commit/push/stash/checkout/reset/restore`, sin R7, sin build/generated/browser, sin themes, sin manifests producidos, sin tocar el roadmap.**

---

# VERDICT: SOURCE_READY

Los cinco paths quedaron implementados en el orden definido; las siete pruebas D y las cinco negativas
pasaron; `gates:ci` cierra **`ci-gates OK — 89 blocking gate(s) passed`** con los 2 excluded visibles.
**Ninguna stop condition A–K disparó.** Dos hallazgos honestos se reportan abajo (§7): una predicción del
brief sobre-especificada por una regla, y un rojo de `gates:ci` **ajeno a T-0** cuya causa medí y aislé.

---

## 1. Write-set: pre/post hashes de los cinco paths

| # | Path | Prehash (= brief §1) | Posthash |
|---|---|---|---|
| 1 | `packages/core/scripts/quality-evidence/programs/modern-rescue/checkpoint.intent.json` | `e05c0fc7ae2bb653ee4caabfa39b09071d5ae67ade9ae53f9c63e69f2ba8d766` | `5a86b12ae6369bdd0f56f668f0f6ac906274c4a405c7ea383f459db5e23dd5e4` |
| 2 | `packages/core/src/tooling/lane-control/public/program-state/index.mjs` | `e0a78762e12c13d5110a0c4911bb596d1c29e668b844b7120a130d8bf4ab2930` | `263779f068cbd465d024c604420f657a73bd744e069950f9e7ad3ba9bea47594` |
| 3 | `packages/core/scripts/quality-evidence/programs/modern-rescue/README.md` | `260c08e5d445ccb8a5862f348c55125b7a4e0d2b493df3fa8adeade43d1ef36a` | `281d079238b42a30ae4ab9a73fbb10b76394f70a45b80a7c9747bec636dc0687` |
| 4 | `packages/core/scripts/ci/gates-manifest/index.mjs` | `699b1e5daab4f0799e6806ee8eeb348d996adff2afec1e58980d49d557629703` | `3b7f906f346c338302ff1a439cf18737b5a72a6f3b14dd9711efb4fb964cb64d` |
| 5 | `docs/prompt-codex-continue.md` | `a59e4b47e2741a80bb505ff14efeb9dab1ea75572e55c28ab7c55361821a923c` | `afede1efdd7935c7cd7a64300ba4a1d9ea855403797deb693b4f10ebe28a4c47` |

**Preservado fuera del write-set:** `docs/ROADMAP-EJECUCION-2026-08-19.md` = `a4aabddee653cf94f66a7d589a4947bda5fef64a270441ded93e44caae83b202`
**pre y post — byte-idéntico**, verificado al abrir, antes de `gates:ci` y al cerrar.

**Backup por contenido:** los cinco copiados a `/private/tmp/f4a-t0-backup/<ruta relativa>` con igualdad
de hash verificada (`BACKUP EQUALITY: OK`), `prehashes.txt` registrado **antes** de escribir, y
`existía=yes` anotado por path (restore = restaurar, nunca borrar). `porcelain.pre` capturado entero.

---

## 2. Escrituras, en el orden mandado

**WRITE 1 — intent, tres campos.** `blockedOn` extraído **byte-exacto de la línea 72 del propio brief**
(N-2: nunca retipeado), `currentWave` con la sustitución mínima `(F4A-0…13 cerrados, incluidos` →
`(cerrados desde el arranque del frente hasta F4A-13, incluidos`, y `lanes[0].modelReason` con la
supresión `(85d0583b9, owner order 2026-08-20` → `(owner order 2026-08-20`. Escrito como
`JSON.stringify(o,null,2)+'\n'`. El script **rehusó escribir si el digest no coincidía**:
```
predicted intentDigest 5a86b12ae6369bdd | computed 5a86b12ae6369bdd
WRITE 1 OK — keys: 9 | lanes: 4 | refused: 7
```

**WRITE 2 — `FLAGS` consumida.** Constante exportada con los **seis** flags que el comando parsea, más su
consumo en el mensaje de usage. Comprobación del predicado del test (cada flag entrecomillado, 1 vez):
`--check 1 · --intent 1 · --write 1 · --target 1 · --plan 1 · --json 1`. Comportamiento intacto:
```
usage: program-state --write|--check --intent <intent.json> [--target <README.md>] [--plan <plan.json>] [--json]
accepted flags: --write --check --intent --target --plan --json
EXIT=2   (EXIT.USAGE preservado)
```

**WRITE 3 — re-render.** Pre-write `--check` con **cero P1/P2/P9** (sólo P6/P7/P8, el drift que el write
salda), luego:
```
✓ program-state: checkpoint written against HEAD 9d5582dfd (intent 5a86b12ae6369bdd, render 55b37c5b919255e4)
  target: .../modern-rescue/README.md          EXIT=0
```
**Ambos digests idénticos a la predicción del brief y del preaudit.** STOP-D verificado por medición:
`before` **12284 → 12284 idéntico**, `after` **6904 → 6904 idéntico**, sección 3881 → 5255, doc 23069 →
24443 chars (el 24443 que Fable simuló). `fable-and-kimi-read-only` presente antes, **ausente después**.
Cero `Opus`/`Sonnet` fuera de los nombres gobernados en la sección nueva.

**WRITE 4 — entrada de gate.** Insertada tras `modern-rescue-program-contract`, con su comentario:
```
total 91 | blocking 89 | excluded 2
excluded ids: channel-liveness, lane-control-drills
validateManifest: []
new entry idx: 14 | occurrences: 1
```

**WRITE 5 — contadores vivos.** Sólo dos líneas:
- `:53` `gates:ci **88 blocking +` → `gates:ci **89 blocking +`
- `:102` `Verde = "88 blocking gate(s) passed"` → `Verde = "89 blocking gate(s) passed"`

`88` vivos residuales en ese archivo: **0**. Clase A histórica (10 líneas del roadmap +
`prompt-kimi-continue:366`) **intacta**, como manda la ley de recibos inmutables.

---

## 3. Pruebas antes/después

| | Comando | ANTES | DESPUÉS |
|---|---|---|---|
| A1/D1 | `program-state --check` | **EXIT 1, 5 hallazgos** (2×P1, P6, P7, P8) | **EXIT 0**, `no violations`; provenance: *written against HEAD 9d5582dfd, which is still HEAD* |
| A2/D2 | `runner --list` | `ci-gates: 88 blocking, 2 excluded` | **`ci-gates: 89 blocking, 2 excluded`**; gate presente **1** vez con su argv completo |
| A3/D3 | `gates-manifest.flags.test.mjs` | 2/2 pass | **2/2 pass** — prueba directa de que el path 2 saldó el phantom |
| A4/D4 | `runner/index.test.mjs` | 13/13 pass | **13/13 pass** |
| A5/D5 | `program-check.mjs` | `CONSTITUTION_READY` EXIT 0 | **`CONSTITUTION_READY` EXIT 0** — igual, no peor |
| N-3 | `effect-registry-audit/index.test.mjs` | — | **9/9 pass** (corrido de verdad, no sólo cubierto por G/H) |
| D6 | `git diff --stat` | — | sólo los 5 paths + el roadmap preexistente |
| D7 | `gates:ci` (serial, nada en paralelo) | — | **`ci-gates OK — 89 blocking gate(s) passed`**, 89 PASS / **0 FAIL** / 2 SKIP excluded; `modern-rescue-checkpoint-state` **PASS 441ms** |

`program-check.test.mjs` **no** se corrió como evidencia focal. Nada corrió en paralelo con `gates:ci`.

---

## 4. Negativas

| | Planta | Resultado | Restore |
|---|---|---|---|
| **N1** | 1 byte en prosa renderizada del intent, sin re-render | **EXIT 1** con `P6-intent-drift P7-render-drift P8-body-mismatch` | hash idéntico al post-write; `--check` **EXIT 0** |
| **N2** | 1 byte **dentro** del bloque stampado del README | **EXIT 1** con `P8-body-mismatch`, nombrando la línea 5 y mostrando fichero vs render fresco | hash idéntico (**YES**) |
| **N3** (acotada, opción declarada por el brief) | con N1 plantada, el comando del gate cableado | **EXIT 1** → el runner falla **en** esta entrada y corta por fail-fast | — |
| **N4** | retirar la entrada y repetir | `blocking 88`, gate ausente del plan (**0** ocurrencias) → **el documento mentiroso vuelve a ser invisible** | hash idéntico (**YES**) |
| **N5** | — | `--write` **no** modificó el intent; `before`/`after` del README byte-idénticos | — |

N4 es la prueba de no-vacuidad: sin la entrada, el drift no lo ve nadie.

---

## 5. Censo, residuo y diff-check

- **Censo `packages/core/manifest/**` (360 archivos):** pre `0944dc2a91713b0852649107914c9cc0bcd38d495f4aa17b3a27c20a4ec29022` ·
  post **idéntico** → `MANIFEST CENSUS: byte-identical OK`. Relevante porque `gates:ci` ejecuta
  `modern-rescue-tooling-drills`, que hoy muta ese árbol (P0/P1 de N-A, cuyo arreglo es T-1a).
- **Residuo `*.t1-test-backup` / `*.f1-drill-backup`:** **0** antes y **0** después (ambos patrones, C-5).
- **Diff del porcelain entero:** la única diferencia pre→post son **exactamente las 5 líneas** de los
  paths admitidos; la línea del roadmap está en ambos, sin cambio. **staged 0.**
- **Estado final del repo:** roadmap preexistente + exactamente los cinco paths implementados.

---

## 6. Contadores

| Contador | Antes | Después |
|---|---|---|
| gates totales | 90 | **91** |
| blocking | 88 | **89** |
| excluded | 2 (`channel-liveness`, `lane-control-drills`) | **2, los mismos** |
| hallazgos `program-state --check` | 5 | **0** |
| obligaciones en `blockedOn` | 3 (falso) | **4** |
| lanes que nombran a Kimi como auditor activo en el README | 1 | **0** |
| `88` vivos en `prompt-codex-continue.md` | 2 | **0** |

**No movidos, verificados:** familias 255 · celdas 5100 · unreviewed 255 · accepted 0 ·
assessedNotElevated 0 · syntheticRows 4 · singleOwner 6 · `untaggedAuthoredLeaves` **40** ·
`divergentSlots` **33** · `tagRegistry` **4099** · universo **2559** · `positionIntersection` **2526** ·
`cascade-wiring` 2171/4374/2203/768/391 — todos releídos de la salida de `gates:ci` de esta corrida.

---

## 7. Dos hallazgos honestos

**7.1 — La predicción de N2 estaba sobre-especificada por una regla.** El brief §11 anuncia que mutar el
bloque del README dispara **P7+P8**. Medido: dispara **P8 solo**. La razón es correcta y vale registrarla:
P7 compara el `render` del stamp contra un render **fresco derivado del intent**; editar el README a mano
no toca el intent, así que el render fresco sigue coincidiendo con el stamp y P7 **no puede** disparar.
P7 es el detector de que *una cifra derivada se movió*; **P8 es el detector del documento editado a mano**.
La detección queda intacta (EXIT 1, con la primera línea divergente nombrada). No dispara ninguna stop
condition: la negativa exige que el gate enrojezca, y enrojece.

**7.2 — `gates:ci` falló una primera vez por causa AJENA a T-0, y lo aislé antes de re-correr.**
Primera corrida: `FAIL gat-07-exact-proof`, 55 gates no alcanzados por fail-fast. Causa exacta:
```
Error: GAT-07 toolchain is not reproducibly pinned:
- runtime Node major 25 != CI Node major 22
Node.js v25.2.1
```
No causalidad con T-0, probada por fuente y no por inferencia: el predicado (`index.mjs:1140-1152`)
compara `process.versions.node` contra `NODE_VERSION: '22'` de `.github/workflows/ci.yml` y valida pines
de `pnpm-lock.yaml` — **ninguno de esos dos archivos está en el write-set**, y el gate no lee ninguno de
los cinco paths. Además `modern-rescue-checkpoint-state` ya había **pasado** (429ms) antes del corte.
Verificación aislada bajo el major pineado: `gat-07-exact-proof` → **EXIT 0**
(`2 deterministic runs agree … 3326 counters / 3226 exact zeros; 542 documented data-part entries`).
Re-corrí entonces `gates:ci` completo bajo **Node v22.17.0**, el major que la propia CI pinea, con el
resultado verde de §3. **Reporto las dos corridas**: la evidencia D7 válida es la del major pineado, y el
rojo de Node 25 queda documentado como deriva de entorno local, no del tranche.

---

## 8. R-1 — cláusula vinculante, transcrita verbatim (Fable N-1)

T-0 la **declara y la transporta**; **no la escribe en el libro mayor**, porque el roadmap está fuera del
write-set y debe quedar byte-idéntico. Va aquí para que no se pierda entre tranches y para que el asiento
post-postaudit la copie **verbatim**:

> **A partir del cierre de T-1a/T-1b, la aceptación de K4 y de K5 se compara contra la baseline
> RE-ANCLADA registrada en el libro mayor del DT (`docs/ROADMAP-EJECUCION-2026-08-19.md`), que
> SUPERSEDE el literal `1717/13` de los briefs pinneados. Los briefs históricos NO se editan.**

Obligación asociada: **T-1b debe declarar a cuál de `export-missing`/`export-unshipped` colapsó el par**,
o la comparación queda infalsable.

**R-3 — el canon vivo se mueve dos veces.** T-0 deja establecido **`89 blocking + 2 excluded`** y ya
arrastró los dos textos vivos. Queda registrado: **si el write-set de T-5 (`realKeypathParity`) agrega
otra entrada al manifiesto, el canon vuelve a moverse** y el brief de T-5 debe redeclararlo y volver a
arrastrar todo texto vivo que pinee `89 blocking + 2 excluded`. La cerca interina de T-1a
(`--test-concurrency=1`) **no** mueve el conteo: cambia el argv de una entrada existente.

**N-2 aplicada:** los digests valen sólo con los strings byte-exactos; el paso 1 fue programado para
**abortar antes de escribir** si el digest no coincidía. Coincidió a la primera.
**N-3 aplicada:** D5 corrido completo y `effect-registry-audit` corrido de verdad (9/9), no sólo cubierto
por los stops G/H.

---

## 9. Stop conditions — ninguna disparó

**A** preestado exacto ✓ · **B** ningún path del write-set venía sucio ✓ · **C** intentDigest
`5a86b12ae6369bdd` coincidió con la predicción ✓ · **D** `before`/`after` byte-idénticos, sólo el README
escrito por `--write` ✓ · **E** `--check` post-write EXIT 0 ✓ · **F** `89 blocking + 2 excluded`,
`validateManifest []`, excluidos intactos ✓ · **G** flags.test y runner.test verdes ✓ · **H**
`program-check` igual que la línea base (`CONSTITUTION_READY`), sin hallazgo textual nuevo ✓ · **I** censo
del manifest idéntico y cero residuo ✓ · **J** el diff del porcelain sólo muestra los cinco paths y el
roadmap sigue byte-idéntico ✓ · **K** no hizo falta ningún sexto path ✓.

---

## 10. Cierre

- **Sin commit, sin stage, sin push.** `staged 0`. HEAD sin mover.
- Repo = roadmap preexistente (byte-idéntico) **+ exactamente los cinco paths implementados**.
- Evidencia durable en `/private/tmp/f4a-t0-backup/`: `porcelain.pre`/`porcelain.post`, `prehashes.txt`,
  `posthashes.txt`, `manifest-census.pre`/`.post`, `A1..A5`, `D1..D4`, `D7.out` (Node 25, rojo ajeno),
  `D7b.out` (Node 22, verde), `ERA.out`, `N1.out`, `N2.out` y las copias de backup de los cinco paths.
- Habilita el **postaudit Fable** sobre este diff completo.

# VERDICT: SOURCE_READY
