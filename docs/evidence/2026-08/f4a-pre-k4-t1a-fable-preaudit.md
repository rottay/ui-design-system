# T-1a (sandbox de `program-check.test.mjs`) — Preaudit Fable 5 del brief Opus (auditor READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Preestado verificado:** HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · staged 0 · porcelain = los 5 paths sellados de T-0 (postaudit ACCEPT `929870cd…2997`) + el roadmap DT-owned, hoy en SHA `fb441fb4941dff55101e9ba91bb15f9d2ddc4f995376c4ac64ab7311b6a08b12`. La diferencia con el `a4aabd…` que el §1 del brief esperaba está **adjudicada por el encargo** (asiento DT nuevo, posterior al brief) y **no amplía T-1a** — ver enmienda E-1.

**Insumos (SHA-256 verificados byte-exactos):**
- Brief T-1a `/private/tmp/f4a-pre-k4-t1a-opus-brief.md` = `53110c0573ec41e3c208028ad3b0e1046862f46e6f5872519376fe3a67465e02` — `READY_FOR_FABLE_PREAUDIT`
- Mi postaudit T-0 `/private/tmp/f4a-pre-k4-hardening-fable-postaudit.md` = `929870cd5ccfb1fb54fca8474e08733ca2e8a5c0b312b2688a61456f97232997` — **ACCEPT: la condición suspensiva del brief queda resuelta**
- Ruling DT de secuencia = `baa48c13d99db39c150c4eb2329d189e24e8bb34340a04a83b391549565c7bd2`

**Leyes cumplidas:** cero writes al repo, cero suites mutantes/gates:ci/builds/generadores, cero git mutante, cero pedido de commit, Kimi no consultado. Sólo lectura, `grep`, `du`/`find`, `sed` y `wc`. Write-set de la sesión: este memo y su `.ready`.

---

## VERDICT: ACCEPT

Cada claim medible del brief que verifiqué contra el código real resultó **exacto** — incluida la corrección mayor que reduce el write-set a **un solo path** y el hallazgo que corrige mi propio memo de close. Intenté específicamente refutar toda vía de regreso al repo vivo (imports, resolvers, procesos hijo) y **no encontré ninguna**. Una corrección mínima vinculante (C-1, cierra el único agujero teórico del guard D-4) y una enmienda adjudicada (E-1). Este ACCEPT habilita a **Sonnet Max como writer mecánico del único path** `program-check.test.mjs`, bajo las stops S-A..S-L sin relajación.

---

## 1. Write-set de UN path — la corrección mayor es CORRECTA, con las tres razones verificadas

- **(a) VERIFICADA.** `runner/index.test.mjs` pinea `DRILLS_ARGV = ['node','--test',PROGRAM_DRILL,GENERATOR_DRILL]` con `assert.deepEqual` (leído en fuente, con su comentario "Exact argv, not a substring match"). Insertar `--test-concurrency=1` lo rompe → tercer path.
- **(b) VERIFICADA.** `NODE_OWNED = {'--test','--experimental-vm-modules','--conditions'}` (flags.test:30, leído en la sesión T-0); `'--test-concurrency=1'.split('=')[0]` no está en el set → se colecta como flag de script; `test-concurrency` tiene **0 ocurrencias** en scripts+manifest (medido hoy) → phantom → cuarto path. Reintroducir el defecto que T-0 saldó sería incoherente — exacto.
- **(c) VERIFICADA.** La cerca era interina *mientras* (c1) se escribía; aterrizando (c1) en este tranche no compra nada, y mi challenge de close §B ya ratificó que no protege la pierna 1.
- **El cierre del argumento, VERIFICADO:** `manifest/generator/index.test.mjs` tiene **5 `writeFileSync`, todos bajo raíces `mkdtempSync`** (:219/:267), **0 `renameSync`**, y su único `spawnSync` corre el generador con `--bootstrap` aseverando el refusal (`status !== 0` + "bootstrap requires an absent manifest", :162-170). `program-check.test.mjs` es el único mutador vivo de la cohorte. **No corresponde tocar gates-manifest ni ningún test del runner: cero gate nuevo, cero gate editado** — y A-7 lo prueba al cierre (89+2 intactos sin haberlos tocado).

## 2. Censo del archivo — EXACTO en las seis filas

Medido por mí: 1169 líneas; token `writeFileSync` en 38 líneas de las cuales una es el import (línea 2) → **37 sitios** (3 `a` + 3 `b` + 31 `target`); token `renameSync` en 7 líneas menos el import → **6 sitios = 3 pares en 439/443, 512/517, 1105/1113**; `repoRoot = findRepoRoot(__dirname)` línea 13; `programRoot`/`manifestRoot` líneas 15/17; import estático de `./program-check.mjs` líneas 6-9; **`const baseline = readModernRescueContracts()` línea 19 a nivel de módulo** — la razón exacta por la que el import debe volverse dinámico. Verificación adicional mía: **las únicas dos composiciones `join(repoRoot,…)` del archivo son las definiciones de las líneas 15/17** — toda ruta de mutación deriva de las tres constantes que el paso 7 del algoritmo re-apunta. El mecanismo es completo por construcción.

## 3. (c1) sin tocar `program-check.mjs` — los tres hechos, leídos en fuente

1. Guardia de entrypoint en `:1968-1971` **verbatim** (`isMain` por igualdad de URL resuelta) → importar la copia nunca ejecuta `main()`.
2. Exports en `:142` y `:1809` ✓.
3. Resolución íntegramente relativa: imports `../../v2/contracts.mjs`, `../../../../manifest/generator/index.mjs`, `../../../../manifest/rules/index.mjs`, `../../../lib/repo-root/index.mjs` (:20-23); `contracts.mjs` ancla `REPOSITORY_ROOT = findRepoRoot(HERE)` y el census `ROOT = findPackageRoot(HERE)` — todo cae en la copia. **S-D bien puesto: `program-check.mjs` fuera del write-set, sin STOP por este eje.**

**Root fence VERIFICADA:** `repo-root` asciende **hasta 12 niveles** y **lanza** si no encuentra el marcador (fail-closed, leído entero); del test copiado al sandbox hay 6 saltos; `packageRoot()` exige `name === '@rottay/design-system'` → `packages/core/package.json` obligatorio, exacto. La trampa del sandbox-dentro-del-repo (ascenso encontraría el marcador real → falso verde silencioso) está correctamente cerrada por la regla dura `mkdtemp` en `os.tmpdir()` + el assert del paso 5 (`findRepoRoot(<sandbox>/…/modern-rescue) === SANDBOX` ANTES de importar) + S-E.

## 4. Clausura — 15 miembros con lector verificado; la aceptación por MEDICIÓN es la forma correcta

Spot-verifiqué los lectores decisivos: **`roadmap/registry.json` SÍ se lee en `program-check.mjs:1105`** (WO-CRA-23 debe registrar `modern-rescue`) — el hallazgo del brief es verdadero y **corrige mi propio memo de close**, cuya frase "ningún código enlaza las dos cosas" era correcta para `statusAuthority:934` pero sobrebarrida como afirmación general; lo asiento. `receipts.mjs:21-24` verbatim: `existsSync ? sha256OfFile : 'MISSING'` — **falla blando**, así que una copia incompleta produce veredicto distinto, no excepción → **A-1 (paridad de veredicto sandbox vs vivo) es la única aceptación honesta de la clausura, y S-F prohíbe relajarla**. Confirmados además: `require('postcss')`/`require('typescript')` a nivel de módulo en el census (:52-53) — el symlink de node_modules es necesario; `MANIFEST_PATH = join(ROOT,'hooks-manifest.json')` (:59); los cinco punteros de `program.json` (controls README, tokenCensus, appHooks, prototypeLedger, kimiPreservation); y `spacing.rhythm.json:68` → `packages/showroom/e2e/whitelabel/density-authority-matrix.spec.ts` **verbatim** (miembro 15).

**Costo medido por mí:** core/src 42 MB/3975 · manifest 72 MB/360 · showroom/src 4 MB/354 · quality-evidence 2 MB/36 · lib 1 MB · census 3 MB · kimi-preservation 1 MB → **≈122 MB / ≈4.700 archivos**, dentro del redondeo del brief. Una copia por módulo, reutilizada — razonable.

## 5. Refutación de escapes al repo vivo — INTENTADA Y FALLIDA (no hay vía)

Mandato especial del encargo, ejecutado contra todo el grafo:
- **El test:** cero `spawnSync/spawn/execSync/process.cwd` (grep exhaustivo).
- **`program-check.mjs`:** importa de fs sólo `existsSync/readFileSync/readdirSync`; **0** `writeFileSync`/`renameSync`; cero spawn/cwd.
- **El grafo copiado completo** (generator, rules, contracts, receipts, census, repo-root): **cero `process.cwd`, cero child_process** — el único hit del barrido es `varRe.exec(value)`, un `RegExp.exec`, falso positivo.
- **Resolución de módulos:** el import dinámico de la copia resuelve sus imports relativos contra la URL del archivo copiado → dentro del sandbox; un miembro faltante da module-not-found (lanza, falla cerrado) o diferencia de veredicto (A-1). Los paquetes npm resuelven por los dos symlinks de node_modules — uso de sólo lectura.
- **Único proceso hijo de la cohorte:** el `--bootstrap` del generator-test, archivo **no tocado** por T-1a, que corre contra el repo vivo y cuyo refusal está aseverado por el propio test — no puede escribir (bootstrap exige manifest ausente).
- **Anclas:** todas las raíces del grafo derivan de `import.meta.url` vía `findUp` fail-closed; ninguna de `process.cwd()`; ninguna absoluta.

## 6. Pruebas, negativos, restore, stops, re-ancla — CONFORMES

- **A-1..A-7**: completas; A-1 es la pieza clave (§4); A-3 exige la cohorte en la MISMA invocación concurrente del gate ×3; A-7 prueba el manifiesto intacto; `gates:ci` final bajo Node 22, consistente con el hallazgo de T-0.
- **D-1..D-6**: D-1 (sandbox no decorativo) correctamente señalado como el fallo más grave (S-H); D-2 con la **retirada textual exigida por C-5 negativa 2 ejecutada verbatim** en §8; D-3 cubre **ambos** patrones (C-5 negativa 3); D-5 declara el crash **determinista sólo post-fix** y no lo vende como rojo pre-fix (C-5 negativa 4); D-6 prueba la cerca fail-closed.
- **Restore**: protocolo T-0 sobre un path, censo del manifest pre/post, prohibiciones completas.
- **Stops S-A..S-L**: completas; S-K correctamente anclada al peligro real (`'MISSING'` convierte subárbol parcial en veredicto falso); S-L impide ampliar el write-set.
- **Re-ancla (R-1)**: T-1a **no re-ancla nada** ✓; las cuatro condiciones de §11 (después de ambos tranches; **dos corridas nominalmente idénticas con el mismo par por nombre**; T-1b declara a cuál colapsó; supersede sin editar briefs) son exactamente R-1 con un endurecimiento bueno (la doble corrida).
- La no-limpieza del sandbox por `rm -rf` computado: decisión correcta y coherente con la ley del repo.

---

## Corrección mínima vinculante

- **C-1 — cerrar el write-through del symlink en D-4.** El guard propuesto asevera `dest.startsWith(SANDBOX)`; una ruta bajo `join(SANDBOX,'node_modules/…')` **pasa ese guard y escribe en el repo vivo a través del symlink**. Hoy ninguna de las 37 writes/3 renames compone rutas bajo node_modules (verificado: todas derivan de `manifestRoot`/`programRoot`), pero el guard existe para lo imprevisto: debe **además rechazar** todo destino bajo `join(SANDBOX,'node_modules')` y `join(SANDBOX,'packages/core/node_modules')` (o verificar por `realpath` que el destino resuelto sigue bajo el sandbox físico). Una línea; cierra el único agujero teórico que encontré.

## Enmienda adjudicada y notas

- **E-1** §1 del brief queda enmendado por la adjudicación del encargo: el dirty esperado del roadmap es **`fb441fb4941dff55101e9ba91bb15f9d2ddc4f995376c4ac64ab7311b6a08b12`** (asiento DT posterior al brief), no `a4aabd…`. El resto del §1 rige igual; S-B no debe dispararse por esa diferencia ya adjudicada.
- **N-1** La frase de §5 "las 37 writes… se computan todos desde `manifestRoot`" es levemente imprecisa (derivan de `manifestRoot` **y** `programRoot`); sin consecuencia: ambos, junto con `repoRoot`, son re-apuntados en el paso 7, y las líneas 15/17 prueban que no hay otra raíz.
- **N-2** El detalle de los 3 sitios centinela (`engine-inline`, `js-computed-style-read`, `skin-css`) no lo re-verifiqué; inmaterial: la copia toma **todo** `packages/core/src/**` y A-1 + S-F hacen la clausura auto-verificante.
- **N-3** El censo del manifest vivo (360 archivos, porcelain limpio, cero residuo) fue verificado por mí en el postaudit T-0 sobre este mismo estado.

---

## Cierre

- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · staged 0 · porcelain = 5 paths T-0 + roadmap `fb441fb4…` — intactos por mí.
- Cero writes al repo; cero pedido de commit; Kimi fuera.

# VERDICT FINAL: ACCEPT

El brief T-1a queda aceptado con C-1 vinculante y E-1 adjudicada. Queda habilitado **Sonnet Max como writer mecánico del único path** `packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs`, bajo el brief exacto `53110c05…5e02`, sus stops S-A..S-L y el postaudit Fable posterior del diff completo.
