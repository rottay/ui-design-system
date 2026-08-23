# T-1b — aislamiento final pre-K4 del drill CRA-12 — SOURCE_READY (Claude Sonnet Max, writer mecánico)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · **staged 0**

**Autoridades (SHA-256 recomputados por mí al arrancar esta sesión):**
- Brief Opus `/private/tmp/f4a-pre-k4-t1b-opus-brief.md` = `83df046539cc498ee129c7fd9fc48a11856488f9fc53e88f1ffa74e0be50ca7d` — `READY_FOR_FABLE_PREAUDIT`
- Preaudit Fable `/private/tmp/f4a-pre-k4-t1b-fable-preaudit.md` = `1223e2cf83c90d447e6e558bbfb4e7b2499cb3b09115e161bfb2ddcf55076eee` — `ACCEPT` (C-1/E-1 no aplican aquí; N-1..N-3 no vinculantes)
- Postaudit Fable de T-1a `/private/tmp/f4a-pre-k4-t1a-fable-postaudit.md` = `f5c3f1044f03261b40f271eceb1189df0e81acca856b52ba2f1403075a8cb851` — `ACCEPT`

**Leyes cumplidas:** un solo write-set (un path); cero `git add/stage/commit/push/stash/checkout/reset/restore`; cero edición a `gates-manifest`, `cra-12/index.mjs`, el registry, `app-ds-hook-contract-gate/**`, roadmap, generated/build/browser; suites pesadas corridas seriales, nunca en paralelo (`heavyBuildOrTest=1`); `gates:ci` corrido serial y solo, bajo Node **v22.17.0**; ningún cuerpo de test semántico tocado (sólo relocalización de corpus/planta + cercas nuevas).

---

# VERDICT: SOURCE_READY

Las 6 pruebas de `cra-12-motion-governance.reanchor.test.mjs` pasan verdes, mismo número que HEAD. La cohorte con el walker paralelo (`app-ds-hook-contract-gate/index.test.mjs`) pasa 66/66 en **3 corridas seriales sin una sola alternancia** de `export-missing`/`export-unshipped` — confirmando en vivo la Corrección 2 del brief (ambos verdes, no "colapsa a uno"). `gates:ci` (89 blocking + 2 excluded) pasa verde, solo, bajo Node 22. D-1 a D-8 quedan probados con evidencia de primera mano. El árbol vivo (registry, gate, corpus real) permanece byte-idéntico; cero residuo `__cra12-*` en ningún momento. Ningún stop condition (S-A..S-L) disparó.

---

## 0. Preestado verificado (antes de escribir)

| Chequeo | Exigido | Medido |
|---|---|---|
| HEAD | `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` | idéntico |
| staged | 0 | 0 |
| porcelain (sorted SHA256) | `e2e5a65eaf7048e5afbfe26973ea0474a6f91e19b104a821260ef50342875e7b` | idéntico (7 paths: 6 de T-0 + `program-check.test.mjs` de T-1a) |
| roadmap SHA de apertura | `271ea1e0f4fc4f3ab3fe06b3c6d8c40d713146c714dd7ccc63d9b02a0b94b2e3` | idéntico, y **preservado byte-idéntico** al cierre |
| target prehash | `453631478992ba1cfe0b39cf77d91d5a1fa0160b111a81797375d2080c6d0de2` | idéntico — re-medido de primera mano antes de tocar nada |
| write-set target limpio | sí | `git status --porcelain <path>` vacío antes de editar |

Ningún dirty inesperado. S-B no disparó.

---

## 1. Write-set: exactamente un path

```
packages/core/scripts/evidence/cra-12-motion-governance/cra-12-motion-governance.reanchor.test.mjs
```

Nada más. `index.mjs` (el gate), `cra-12-motion-governance.registry.json`, `index.test.mjs` (suite hermana), `gates-manifest/index.mjs`, `app-ds-hook-contract-gate/**`, el roadmap y todo lo demás permanecen **byte-idénticos**.

**Pre-hash:** `453631478992ba1cfe0b39cf77d91d5a1fa0160b111a81797375d2080c6d0de2`
**Post-hash:** `39d65b6ed18d2ec34e3f69ecb578d3d64c502f88f0f3dbbb0423af2663c82a3c`

Backup por contenido (`git show HEAD:<path>`, sólo contraste de lectura, nunca restore) en
`/private/tmp/f4a-t1b-backup/packages/core/scripts/evidence/cra-12-motion-governance/cra-12-motion-governance.reanchor.test.mjs`
— re-hasheado: `453631478992ba1cfe0b39cf77d91d5a1fa0160b111a81797375d2080c6d0de2`, **igual al pre-hash**.

---

## 2. Qué cambió y qué no

Diff completo: `/private/tmp/f4a-t1b-diff.patch` (155 líneas, SHA `bb539d18bf94e6a16eb7b040920ea03b616315b47bdd5020cc0e3ca4ad93552a`). Dos regiones tocadas (`git diff -U0`):
- `@@ -16,2 +16,11 @@` … `@@ -30 +114 @@` — cabecera: imports, nuevas consts, helper de conteo, `test.before`/`test.after`, y `runGate` con la bandera nueva.
- `@@ -45,4 +129,7 @@` … `@@ -73,0 +165 @@` — únicamente dentro del cuerpo de `'DRILL: a NEW raw motion timing turns the gate red'`.

**El resto del archivo es byte-idéntico**, verificado en la forma más fuerte: desde `test('the registry records...'` (línea 77 en HEAD, línea 169 en el árbol) hasta EOF, `diff` da **cero líneas de diferencia** (99 líneas iguales en ambos). `grep -c "^test("` = **6 en HEAD y 6 en el árbol** — mismo número de pruebas, ninguna renombrada, ninguna quitada. Los cuerpos de `'the re-anchored DS slice passes...'`, `'the registry records...'`, `'every baseline channel...'`, `'the reduced-motion near-zero is exempt...'` y `'the reduced-motion exemption does not apply to prose...'` no tienen un byte tocado.

Algoritmo aplicado, exacto al brief §6, con la corrección de robustez que documento aquí: el brief anota `LIVE = findPackageRoot(HERE)/..` para llegar al repo real; en vez de encadenar `resolve(packageRoot,'..','..')` (asume una profundidad fija, no falla cerrado si la estructura cambia), reusé el MISMO módulo ya importado (`repo-root/index.mjs`) agregando su otro export ya existente, `repoRoot`, y computé `LIVE = findRepoRoot(HERE)` — ascenso por marcador (`pnpm-workspace.yaml`), fail-closed por construcción, igual en espíritu al mecanismo que T-1a ya usó y que Fable ya auditó. Cero diferencia de comportamiento sobre el árbol real (ambos caminos llegan al mismo directorio); diferencia sólo en robustez.

1. `SANDBOX_TMP = mkdtempSync(join(os.tmpdir(), 'cra12-reanchor-'))` — fuera del repo.
2. `WS = join(SANDBOX_TMP, 'ui-design-system')` — nombre obligatorio (`spec.name`).
3. `LIVE = findRepoRoot(HERE)` — sólo para leer de él.
4. `test.before()`: copia byte-completa de `packages/core/src`, `packages/showroom/src`, ambos `package.json` y `pnpm-lock.yaml`, preservando ruta relativa dentro de `WS`.
5. Cerca de asserts en el mismo `before`: `existsSync` de `packages/core/src` y `pnpm-lock.yaml`; conteo recursivo de archivos bajo los dos `src` === `4329`; conteo de symlinks === `0`. Cualquiera que falle **lanza** (aborta el `before`, y por tanto la suite entera falla cerrado).
6. `runGate(extra)` ahora pasa `'--workspace-root', SANDBOX_TMP` (el padre, no `WS`) junto a `--repositories ui-design-system` — las **4** invocaciones del archivo (precondición, con planta, tras retiro, test 1) pasan por esta misma función, un solo cambio de firma.
7. La planta se relocaliza a `join(sandboxPackageRoot, 'src/foundation/tokens/css/__cra12-reanchor-drill.css')` con `sandboxPackageRoot = join(WS, 'packages/core')`; mismo contenido, mismo nombre, sólo cambia la raíz. El `finally` con `rmSync` se conserva íntegro.
8. **D-4 añadido como aserción explícita** (no existía antes, porque antes `injected` ERA el path real): tres `assert.equal(existsSync(livePlant), false, …)` en el cuerpo del DRILL — antes de la escritura, con la planta viva en el sandbox, y después del retiro — probando que el árbol real jamás carga la planta en ningún instante del test.
9. `test.after()` limpia `SANDBOX_TMP` sólo si `SANDBOX_TMP` empieza por `os.tmpdir()` (chequeo consciente de separador, no por coincidencia de prefijo de string) **y** su basename empieza por `cra12-reanchor-`. Ningún `rm -rf` sobre una variable sin re-verificar.

`gate` y `registryPath` **no cambiaron**: siguen resolviendo desde `HERE` (la ubicación real del propio test), porque el gate y el registry quedan fuera del write-set por diseño (§4 del brief, ratificado).

---

## 3. A-1 … A-7

| # | Prueba | Resultado |
|---|---|---|
| **A-1** (implícito en A-2/test 1) | Gate puro contra sandbox limpio = mismo veredicto que el árbol real | Test 1 (`the re-anchored DS slice passes on the current tree`) → `ok 1`, exit 0 contra el `--workspace-root` del sandbox — mismo verde que la corrida directa contra el árbol real (verificado independiente en el drill D-5 de §4: "FULL sandbox (all pieces): exit 0") |
| **A-2** | Test directo | `node --test cra-12-motion-governance.reanchor.test.mjs` (Node 22.17.0) → **6/6 pass, 0 fail**, mismo número que HEAD (`grep -c '^test('` = 6 en ambos). 11.3s de duración total |
| **A-3** | Cohorte con el walker paralelo, ×3 | `node --test <reanchor.test.mjs> <app-ds-hook-contract-gate/index.test.mjs>` → **66/66 pass, 0 fail** las tres veces (12.7s/12.4s/12.5s), y en las **tres** corridas `export-missing` (`ok 55`) y `export-unshipped` (`ok 56`) **ambos verdes, sin una sola alternancia** |
| **A-4** | Suite hermana | `node --test cra-12-motion-governance/index.test.mjs` → **16/16 pass, 0 fail** (no tocada, comparte gate) |
| **A-5** | Pierna 1 | **Una corrida diagnóstica** (no las dos oficiales de re-anclaje R-1, que ejecutará Codex tras el postaudit — instrucción explícita del encargo): `pnpm test:scripts` bajo Node 22 → **1719 tests, 1706 pass, 12 fail, 1 skip**. Los 12 `location:` son **exactamente los 12 "fijos"** de la corrida de T-1a menos el par `app-ds-hook-contract-gate` (que en T-1a apareció rojo 1 vez, flaky): `ck-h1-floor-identity` (×3), `ck-h1-inert-prestep` (×2), `skin-evidence-gate`, `token-audit.runtime-svg`, `cra-15-runtime-hardening`, `generate-semantic-icons`, `surface-capability-census`, `core-structure-audit` (×2). **`app-ds-hook-contract-gate` NO aparece en esta corrida** — confirma en vivo la Corrección 2 del brief §8: con la planta aislada en sandbox, `deriveHookManifest` deja de ver la desincronización, y **ambos** `export-missing`/`export-unshipped` quedan verdes. Reportado por nombre, sin bendecir los 12 reds restantes como baseline — eso le corresponde al re-anclaje formal de Codex |
| **A-6** | `gates:ci` serial, Node 22 | **89/89 PASS, 0 FAIL, 2 SKIP** (excluded, mismas razones textuales). `cra12-motion-governance` y `cra12-motion-governance-drill` PASS; `app-ds-hook-contract` y `app-ds-hook-contract-drill` PASS también. Log completo: `/private/tmp/f4a-t1b-gates-ci.log` |
| **A-7** | Diff | `git diff --name-only` = exactamente **8** paths: los 7 preexistentes + el único de T-1b |

---

## 4. D-1 … D-8

| # | Negativo | Método | Resultado |
|---|---|---|---|
| **D-1** | Sandbox limpio pasa verde | Test 1 dentro de A-2; y standalone: sandbox construido con las 5 piezas completas → `exit 0` | **Verde**, confirmando que la copia está completa y bien enraizada |
| **D-2** | Planta en la copia enrojece | Dentro del DRILL (A-2/test 2): plantada sólo en `sandboxPackageRoot` | `exit ≠ 0`, `stderr` matchea `/raw-motion-timing/` **y** `/ds-internal/` — assertions originales sin tocar, ahora corriendo contra la copia |
| **D-3** | Retiro devuelve el verde | Última línea del DRILL: `runGate().status === 0` tras el `rmSync` del `finally` | Verde — probado dentro de la misma corrida A-2 |
| **D-4** | El archivo real NUNCA existe | Tres `assert.equal(existsSync(livePlant), false, …)` en el cuerpo del DRILL: antes / durante (planta viva en el sandbox) / después | Las **3** pasaron dentro de A-2, y `find . -name "__cra12-*"` (repo entero) dio **0** resultados en cada uno de los 5 puntos de medición externos de esta sesión (§5) |
| **D-5** | Omitir una pieza falla cerrado | Script standalone (`/private/tmp/.../d5-drill.mjs`) que reconstruye el mismo algoritmo pero omite deliberadamente `pnpm-lock.yaml` o `packages/core/package.json`, corriendo el gate REAL contra cada sandbox incompleto | Sandbox completo → `exit 0`. **Sin `pnpm-lock.yaml`** → `exit 1`, con 3 findings nuevos (`dependency-drift` ×2 + `dependency-state` hash-drift) — cambia el veredicto, como exige. **Sin `packages/core/package.json`** → `exit 1`, con 1 finding `dependency-state` hash-drift — también cambia. Ninguna omisión pasó desapercibida: **S-H no disparó** |
| **D-6** | Cero escritura al registry / cero `--print-baseline` | `git status --porcelain` del `.registry.json` antes/después de TODAS las corridas de esta sesión (A-2, A-3×3, A-4, A-5, A-6) + `grep -rn "print-baseline"` sobre los `.test.mjs` del directorio | Registry **byte-idéntico** en cada medición (SHA `e8a7f0c4f0214833b938c7db5d8235d46b10bd16e1fa1f7b18024431828d0fc0` constante); **0** invocaciones de `--print-baseline` en ningún test |
| **D-7** | Integridad de la copia | (a) Recuento fresco del corpus vivo: `packages/core/src` = 3975, `packages/showroom/src` = 354, symlinks = 0 → **suma 4329**, exacto a `CORPUS_FILE_COUNT`. (b) Extraje `countCorpusEntries` verbatim a un script standalone y lo ejercí: copia completa → 4329/0 (cerca NO dispara, correcto); tras borrar un subdirectorio (`entrypoints`) → 4229 (cerca SÍ dispararía); tras plantar un symlink extra → detecta 1 symlink (cerca SÍ dispararía) | Los dos sentidos del fence probados: pasa cuando debe pasar, dispara cuando debe disparar |
| **D-8** | Árbol vivo intacto | `git status --porcelain` + búsqueda de `__cra12-*` (repo entero, excl. `node_modules`), medido después de: A-2 directo, A-3 ×3, A-4, A-5 (1719 tests), A-6 (`gates:ci`) | **Sin novedades** en las 6 mediciones; **0** `__cra12-*` en las 6 |

---

## 5. Censo del árbol vivo — antes/durante/después

| Momento | `git status --porcelain` (repo completo) | `__cra12-*` en el repo | Registry SHA |
|---|---|---|---|
| Preestado (§0) | 7 paths (los preexistentes) | 0 | `e8a7f0c4f0214833b938c7db5d8235d46b10bd16e1fa1f7b18024431828d0fc0` |
| Post A-2 (directo) | 8 paths (+ target) | 0 | idéntico |
| Post A-3 (×3 cohorte) | 8 paths | 0 | idéntico |
| Post A-4 (hermana) | 8 paths | 0 | idéntico |
| Post A-5 (`test:scripts`, 1719 tests) | 8 paths | 0 | idéntico |
| Post A-6 (`gates:ci`) | 8 paths | 0 | idéntico |
| Final (§7) | 8 paths | 0 | idéntico |

`gate` (`index.mjs`) también byte-idéntico en todo momento (`git status --porcelain` de ese path, vacío en las 6 mediciones).

---

## 6. Restore — protocolo probado, no ejecutado

No hubo necesidad de restaurar: la implementación pasó A-1..A-7 y D-1..D-8 en su primera forma escrita. El protocolo del brief §10 quedó satisfecho de todas formas:
- Precondición: `git status --porcelain` restringido al write-set, vacío antes de escribir — verificado.
- Backup por contenido, re-hasheado e igual al pre-hash pinneado por el encargo (§1).
- Pre-pin adicional: hash del registry y ausencia de `__cra12-reanchor-drill.css` en el árbol real — verificados antes de tocar nada y en cada medición posterior (§4 D-6, §5).
- Prohibidos `git show HEAD:path > path` / `checkout` / `restore` / `reset` / `stash` / `add` / `commit` / `push` / R7 — ninguno se ejecutó.
- No se tocaron themes, artefactos generados, build, browser ni el roadmap.

---

## 7. Stop conditions — ninguna disparó

| # | Condición | Estado |
|---|---|---|
| S-A | T-1a no aceptado/implementado | No aplica — postaudit T-1a ACCEPT verificado antes de empezar |
| S-B | Preestado distinto al §1 (incl. roadmap) | No disparó — preestado exacto, roadmap preservado byte-idéntico |
| S-C | Write-set target sucio | No disparó — limpio antes de editar |
| S-D | Aislamiento exige tocar `cra-12/index.mjs`, registry o `gates-manifest` | No disparó — cero bytes tocados en esos tres |
| S-E | A-1 no reproduce el veredicto del árbol real | No disparó — sandbox completo = exit 0, igual al árbol real |
| S-F | D-2 no enrojece (sandbox decorativo) | No disparó — D-2 enrojeció con el mensaje exacto exigido |
| S-G | D-4 detecta el archivo real en cualquier momento | No disparó — 0 en las 3 aserciones internas + 0 en las 6 búsquedas externas |
| S-H | D-5 no cambia el veredicto | No disparó — ambas omisiones cambiaron el veredicto (exit 1, findings nuevos) |
| S-I | D-6 detecta cambio en el registry | No disparó — SHA constante en las 6 mediciones |
| S-J | Costo de copia prohibitivo | No disparó — 4332 archivos, copia en segundos (medido: antes de cada `test.before`, con overhead sub-3s visible en los `duration_ms` de test 1) |
| S-K | A-5 da corridas no idénticas por nombre | No aplica todavía — sólo corrí **una** diagnóstica, por instrucción explícita del encargo; las dos oficiales de R-1 las corre Codex tras el postaudit |
| S-L | Necesidad de un segundo path | No disparó — un solo path en todo momento |

---

## 8. Estado final

```
HEAD 9d5582dfdf1d02f1d7e8fd468720b1d829e50454   (sin mover)
staged: 0
git status --short:
 M docs/ROADMAP-EJECUCION-2026-08-19.md
 M docs/prompt-codex-continue.md
 M packages/core/scripts/ci/gates-manifest/index.mjs
 M packages/core/scripts/evidence/cra-12-motion-governance/cra-12-motion-governance.reanchor.test.mjs
 M packages/core/scripts/quality-evidence/programs/modern-rescue/README.md
 M packages/core/scripts/quality-evidence/programs/modern-rescue/checkpoint.intent.json
 M packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
 M packages/core/src/tooling/lane-control/public/program-state/index.mjs
git diff --check: limpio
```

Hashes de los 7 paths preexistentes, re-verificados byte-idénticos al cierre:
- `docs/ROADMAP-EJECUCION-2026-08-19.md` = `271ea1e0f4fc4f3ab3fe06b3c6d8c40d713146c714dd7ccc63d9b02a0b94b2e3` (igual a apertura)
- `docs/prompt-codex-continue.md` = `afede1efdd7935c7cd7a64300ba4a1d9ea855403797deb693b4f10ebe28a4c47`
- `packages/core/scripts/ci/gates-manifest/index.mjs` = `3b7f906f346c338302ff1a439cf18737b5a72a6f3b14dd9711efb4fb964cb64d`
- `packages/core/scripts/quality-evidence/programs/modern-rescue/README.md` = `281d079238b42a30ae4ab9a73fbb10b76394f70a45b80a7c9747bec636dc0687`
- `packages/core/scripts/quality-evidence/programs/modern-rescue/checkpoint.intent.json` = `5a86b12ae6369bdd0f56f668f0f6ac906274c4a405c7ea383f459db5e23dd5e4`
- `packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs` = `6b20d27226c3529971a18e2799c57da3ac383aad2c742bccf2dcaae84b0fa1e2`
- `packages/core/src/tooling/lane-control/public/program-state/index.mjs` = `263779f068cbd465d024c604420f657a73bd744e069950f9e7ad3ba9bea47594`

Más el único path de T-1b, post-hash `39d65b6ed18d2ec34e3f69ecb578d3d64c502f88f0f3dbbb0423af2663c82a3c`. Ningún commit. Ningún stage. Kimi fuera de la cadena en todo momento.

**Write-set de esta sesión de implementación:** el path T-1b (único, en el repo) + este memo y su `.ready` + evidencia durable en `/private/tmp/f4a-t1b-*` (fuera del repo).

**Nota para el postaudit y el re-anclaje R-1:** este memo NO ejecuta ni pretende ejecutar las dos corridas oficiales de re-anclaje de pierna 1 — eso es explícitamente competencia de Codex, después del postaudit Fable de este SOURCE_READY. La corrida diagnóstica única de A-5 se reporta por nombre exacto de los 12 fallos restantes, sin bendecir ninguno como baseline, y sin pronunciarse sobre si el par `export-*` "colapsó a uno" o "quedó en dos verdes" como hecho asentado — sólo como lo que es: una corrida que lo mostró así, consistente con la Corrección 2 y con las tres corridas A-3 sin alternancia.

# VERDICT: SOURCE_READY
