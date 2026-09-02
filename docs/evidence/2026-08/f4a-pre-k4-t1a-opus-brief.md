# T-1a — aislar `program-check.test.mjs` en sandbox: brief ejecutable (Opus, diseño READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · **staged 0**

**Autoridades (SHA-256 verificados byte-exactos en esta sesión):**
- Ruling DT de secuencia `/private/tmp/f4a-pre-k4-dt-sequence-ruling.md` = `baa48c13d99db39c150c4eb2329d189e24e8bb34340a04a83b391549565c7bd2`
- Ratificación Fable `/private/tmp/f4a-pre-k4-fable-sequence-ratification.md` = `e6a6ba3f60924d8ada3b9d740e43ed30c2d6083439bdb54b1c6149b5d521a263`
- SOURCE_READY T-0 `/private/tmp/f4a-pre-k4-hardening-opus-source-ready.md` = `291ff3e9c8e0cecc22e42dcd3a1194059337574a11cafc0ddef707193d27e94a`

**CONDICIÓN SUSPENSIVA:** T-0 está **implementado y sin commit, pendiente de postaudit Fable**. Si Fable
**REJECT**, **este brief no habilita nada** y debe re-emitirse sobre el árbol que resulte del REJECT.
No interferí con esa auditoría: **cero writes al repo, cero tests, cero gates, cero build, cero
generadores** en esta sesión. Sólo lectura, `grep`, `du`/`ls`, y lectura de JSON con `node -e`.
**Kimi fuera de la cadena**: ni consultado, ni esperado, ni atribuido.

---

# VERDICT: READY_FOR_FABLE_PREAUDIT

**Sin STOP.** El único eje que podía forzarlo —tener que editar `program-check.mjs`— quedó **descartado
por medición** (§4). El inventario se confirma casi entero y se **corrige en un punto sustantivo que
REDUCE el write-set de dos paths a uno** (§2).

---

## 1. Preestado exigido al arrancar T-1a

- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, **staged 0**.
- Postaudit Fable de T-0 **ACCEPT** (si REJECT → no ejecutar).
- Dirty esperado: el roadmap `a4aabddee653cf94f66a7d589a4947bda5fef64a270441ded93e44caae83b202`
  **más** los cinco paths de T-0 con los posthashes del SOURCE_READY §1. Cualquier otro dirty → **PARAR**.
- `packages/core/manifest/**` = 360 archivos, censo
  `0944dc2a91713b0852649107914c9cc0bcd38d495f4aa17b3a27c20a4ec29022`; **cero** residuos
  `*.t1-test-backup` / `*.f1-drill-backup`. Si el censo no coincide, el árbol vivo ya está sucio → **PARAR**.

---

## 2. CORRECCIÓN MAYOR: el write-set es UN path, no dos

El inventario propone además tocar `gates-manifest/index.mjs` para insertar `--test-concurrency=1`
después de `--test` en la entrada existente. **Lo rechazo, con tres razones medidas.**

**(a) Rompe una aserción de argv exacto.** `scripts/ci/runner/index.test.mjs:227,239`:
```js
const DRILLS_ARGV = ['node', '--test', PROGRAM_DRILL, GENERATOR_DRILL];
assert.deepEqual(drills.run, DRILLS_ARGV, 'the tooling drill gate must run both suites under node --test');
```
Insertar el flag hace `deepEqual` fallar → **exigiría editar `runner/index.test.mjs` (tercer path)**.

**(b) Rompe el gate de flags phantom.** En `gates-tests/flags/index.test.mjs:30`,
`NODE_OWNED = {'--test','--experimental-vm-modules','--conditions'}`. Medido: `--test-concurrency=1`
parte en `--test-concurrency`, que **no** está en ese conjunto, así que se colecta como flag de script y
se busca entrecomillado en las dos fuentes de la cohorte. Medido: **0 ocurrencias en ambas** →
phantom flag → rojo → **exigiría editar también `flags.test` (cuarto path)**. Es exactamente el defecto
que T-0 acaba de saldar; reintroducirlo un tranche después sería incoherente.

**(c) No hace falta y no alcanza.** La cerca era interina *mientras* se escribía (c1); si (c1) aterriza en
**este mismo** tranche, no compra nada. Y no alcanza por sí sola: mi memo de close §2.4 —ratificado por
Fable §B— ya midió que no hace nada por `test:scripts` (pierna 1), que paraleliza decenas de archivos
sobre el mismo `packages/core/manifest/**`.

**Verificación que cierra el argumento — el otro archivo de la cohorte NO muta el árbol vivo.**
`manifest/generator/index.test.mjs`: 5 `writeFileSync`, **todos** bajo `mkdtempSync(join(tmpdir(),…))`
(líneas 219/267 crean las raíces; 228/229/260/270 escriben dentro); **0** `renameSync`; su único
`spawnSync` corre el generador con `--bootstrap`, que el propio test asevera que **rehúsa**
(`bootstrap requires an absent manifest`, exit ≠ 0). Su comentario lo declara: *"every mutation happens
in memory or in a temp tree"*. Sólo lee el árbol vivo a nivel de módulo.

**Conclusión:** `program-check.test.mjs` es **el único mutador del árbol vivo** de la cohorte. Aislarlo
elimina P0 y P1 por construcción, sin tocar el manifiesto de gates. **Cero gate nuevo, cero gate editado.**

### Write-set exacto de T-1a

| # | Path |
|---|---|
| **1 (único)** | `packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs` |

**Fuera del write-set, explícitamente:** `program-check.mjs`, `gates-manifest/index.mjs`,
`runner/index.test.mjs`, `gates-tests/flags/index.test.mjs`, `manifest/generator/index.test.mjs`,
el roadmap, y todo lo demás.

---

## 3. Censo corregido del archivo a modificar

`program-check.test.mjs`, 1169 líneas:

| Medida | Inventario | Medido | Nota |
|---|---|---|---|
| `writeFileSync` | 37 | **37 sitios** | 38 líneas contienen el token; **una es el `import` de línea 2**. (Mi propio memo de close dijo 38: contaba el import. **Corrijo a favor del inventario.**) |
| `renameSync` | 3 pares | **3 pares (6 sitios)** | 7 líneas contienen el token; **una es el import**. Sitios: 439/443, 512/517, 1105/1113 |
| `manifestRoot` | árbol vivo | `join(repoRoot, 'packages/core/manifest')` (**línea 17**) | |
| `repoRoot` | — | `findRepoRoot(__dirname)` (**línea 13**) | |
| import estático del gate | sí | **líneas 6-9**, `{ readModernRescueContracts, validateModernRescueContracts } from "./program-check.mjs"` | |
| lectura viva en import | — | **`const baseline = readModernRescueContracts();` en línea 19, NIVEL DE MÓDULO** | por eso el import debe volverse dinámico: hoy el árbol vivo se lee **al importar**, antes de cualquier `test()` |

**Los 3 pares de rename, por objetivo y sufijo** (los dos patrones que exige C-5):
1. `manifest/cascade/roots/density.mode.json` → `.t1-test-backup`
2. `manifest/families/primitive/inputs/button.json` → `.t1-test-backup`
3. `manifest/controls/profiles.icon.json` → `.f1-drill-backup`

---

## 4. (c1) es viable SIN editar `program-check.mjs` — mecanismo, no promesa

Tres hechos leídos en fuente:

1. **Guardia de entrypoint** (`program-check.mjs:1968-1971`):
   ```js
   const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
   if (isMain) { main(); }
   ```
   Al **importar** la copia, `import.meta.url` es el archivo copiado y `process.argv[1]` es el test (o el
   runner de `node --test`): `isMain` es **false** → `main()` **no** corre → no hay `process.exit`.
2. **Exporta los dos símbolos** que el test necesita: `readModernRescueContracts` (:142) y
   `validateModernRescueContracts` (:1809).
3. **Toda su resolución es relativa a sí mismo.** `repoRoot = findRepoRoot(__dirname)` y `PROGRAM_DIR` /
   `MANIFEST_DIR` se componen desde ahí; sus imports relativos (`../../v2/contracts.mjs`,
   `../../../../manifest/generator/index.mjs`, `../../../../manifest/rules/index.mjs`,
   `../../../lib/repo-root/index.mjs`) resuelven **dentro de la copia**, y en cascada
   `contracts.mjs` (`REPOSITORY_ROOT = findRepoRoot(HERE)`) y el census
   (`ROOT = findPackageRoot(HERE)`) también caen en el sandbox.

**Por tanto `program-check.mjs` queda fuera del write-set. No hay STOP por este eje.**

**La palanca y su trampa** (`scripts/lib/repo-root/index.mjs`): `repoRoot()` asciende **hasta 12 niveles**
buscando `pnpm-workspace.yaml` y **falla cerrado** (lanza). Desde
`<sandbox>/packages/core/scripts/quality-evidence/programs/modern-rescue` hasta `<sandbox>` hay **6
saltos**, holgado dentro de 12.
**Trampa que el brief debe cerrar explícitamente:** si el sandbox **se creara dentro del repo**, el
ascenso encontraría el `pnpm-workspace.yaml` **real** y el validador leería el **árbol vivo** →
**falso verde silencioso**. De ahí la regla dura: **`mkdtemp` FUERA del repo** (`os.tmpdir()`), y
`pnpm-workspace.yaml` presente en la raíz del sandbox. Si faltara ese marcador, el ascenso sale del
tmpdir y **lanza** (falla cerrado), que es el modo de fallo correcto.
`packageRoot()` exige un `package.json` con `name === '@rottay/design-system'`: por eso
`packages/core/package.json` es **obligatorio** en la clausura, no opcional.

---

## 5. Clausura verificada — los 15 miembros, cada uno con su lector

El inventario acierta en **los 15**. Los atribuí uno por uno:

| # | Miembro | Quién lo lee (medido) |
|---|---|---|
| 1 | `pnpm-workspace.yaml` | marcador de `repoRoot()` — **la cerca del §4** |
| 2 | `AGENTS.md` | `FILES.agents` (`program-check.mjs:36`) |
| 3 | `CLAUDE.md` | `FILES.claude` (:37) |
| 4 | `packages/core/package.json` | marcador de `packageRoot()` (`name === '@rottay/design-system'`) |
| 5 | `roadmap/registry.json` | **`program-check.mjs:1105`** — `readFileSync(join(repoRoot,'roadmap/registry.json'))`, valida que WO-CRA-23 registre `modern-rescue` |
| 6 | `packages/core/manifest/**` | objetivo de las 37 writes y 3 renames + `schema.json`, `rules/index.mjs`, `index.json`, `cascade/roots/*`, `controls/*`, `families/**` |
| 7 | `packages/core/scripts/quality-evidence/**` | dir del programa + `v2/contracts.mjs` + `v2/receipts.mjs` |
| 8 | `packages/core/scripts/lib/**` | `repo-root/index.mjs` |
| 9 | `packages/core/scripts/tokens/customization-surface-census/**` | `parseRegistry` (importado por el generator) + `customization-surface-report.json` (`program/index.json.tokenCensus`) + su baseline `dead-writers` |
| 10 | `packages/core/scripts/tokens/kimi-preservation-manifest/**` | `program/index.json.kimiPreservation` |
| 11 | `packages/core/hooks-manifest.json` | `program/index.json.appHooks` **y** `MANIFEST_PATH` del census (:59) |
| 12 | `packages/core/tokens/controls/README.md` | `program/index.json.controls` |
| 13 | `packages/core/src/**` | `prototypeLedger`; `REGISTRY_PATH`/`ALLOWLIST_PATH`/`EXPRESSIVE_PATH`/`ARTIFACTS_DIR` del census; y **232 de 235 valores `site`** del manifiesto (los otros 3 son centinelas: `engine-inline`, `js-computed-style-read`, `skin-css`) |
| 14 | `packages/showroom/src/**` | `referenceLab.page`, `referenceLab.substrate`, `sceneRegistry` |
| 15 | `packages/showroom/e2e/whitelabel/density-authority-matrix.spec.ts` | **`manifest/controls/spacing.rhythm.json:68`**, `sourceBindings.existingFivePlaneHarness` |

**Hallazgo que corrige mi propio memo de close:** ahí escribí que `statusAuthority` es *sólo* un
string-compare y que "ningún código enlaza las dos cosas". Cierto para la línea 934 — pero
**`roadmap/registry.json` SÍ se lee**, en la 1105, por otra vía. El inventario tenía razón en incluirlo.

**Hallazgo nuevo, y es el que decide la forma de la aceptación.** `v2/receipts.mjs` hashea cada
`sourceBinding` con `fs.existsSync(absolute) ? sha256OfFile(absolute) : 'MISSING'` (:21-24). Es decir:
**un archivo que falte en la copia NO lanza — sustituye el literal `'MISSING'` y sigue**, produciendo un
digest distinto y un veredicto distinto. Sumado a `readText`, que ya falla blando con entrada-de-error
(C-4 de Fable), la consecuencia es dura:

> **La clausura no puede aceptarse por lista. Se acepta por MEDICIÓN: la baseline del sandbox debe dar
> el MISMO veredicto que la del árbol vivo.** Una copia incompleta se manifiesta como diferencia de
> veredicto, no como excepción. Ver A-1 en §7.

**node_modules.** El census hace `require('postcss')` y `require('typescript')` a nivel de módulo;
medido, ambos resuelven a `<repo>/node_modules/.pnpm/…`. **No se copia**: se enlaza por symlink
`node_modules` en la raíz del sandbox **y** `packages/core/node_modules` (los dos, para no depender de
cuál satisface el ascenso de resolución). Es admisible porque **ninguna escritura del test apunta ahí**:
las 37 writes y los 3 renames se computan todos desde `manifestRoot`. La negativa D-4 de §8 lo prueba en
vez de suponerlo.

**Costo de copia medido:** ~**122 MB / ~4.700 archivos** (`core/src` 42 MB/3975 · `manifest` 71 MB/360 ·
`showroom/src` 4 MB/354 · `quality-evidence` 1,5 MB/36 · `lib` 820 K · census 2,6 MB · kimi-preservation
232 K · sueltos < 1 MB). Comparable al precedente cra-12 (46 MB/4264) y del orden de segundos.
**Una sola copia por módulo de test**, reutilizada por los 30+ drills.

---

## 6. Algoritmo exacto de clausura y copia

Se ejecuta **una vez**, a nivel de módulo, **antes** del import dinámico.

```
1. SANDBOX = mkdtempSync(join(os.tmpdir(), 'modern-rescue-program-check-'))
   — os.tmpdir() NUNCA dentro del repo (§4). Registrar la ruta para los asserts.
2. LIVE = findRepoRoot(__dirname)   // el repo real, sólo para LEER de él
3. Para cada miembro de la clausura (§5), copiar PRESERVANDO LA RUTA RELATIVA:
      dst = join(SANDBOX, rel)
      mkdirSync(dirname(dst), {recursive:true}); cpSync(join(LIVE,rel), dst, {recursive:true})
   El orden no importa; la preservación de rutas SÍ (todo el código compone paths relativos a la raíz).
4. symlinkSync(join(LIVE,'node_modules'),            join(SANDBOX,'node_modules'),            'dir')
   symlinkSync(join(LIVE,'packages/core/node_modules'), join(SANDBOX,'packages/core/node_modules'), 'dir')
5. ASSERT DE CERCA (antes de importar nada):
      existsSync(join(SANDBOX,'pnpm-workspace.yaml')) === true
      JSON.parse(read(join(SANDBOX,'packages/core/package.json'))).name === '@rottay/design-system'
      findRepoRoot(join(SANDBOX,'packages/core/scripts/quality-evidence/programs/modern-rescue')) === SANDBOX
   Si el tercero no da SANDBOX, el validador leería el árbol vivo → ABORTAR el módulo.
6. const { readModernRescueContracts, validateModernRescueContracts } =
     await import(pathToFileURL(join(SANDBOX, PROGRAM_DIR, 'program-check.mjs')).href);
7. repoRoot := SANDBOX ; manifestRoot := join(SANDBOX,'packages/core/manifest') ;
   programRoot := join(SANDBOX, PROGRAM_DIR)
   — las 37 writes y los 3 pares de rename quedan así en el sandbox SIN tocar sus cuerpos:
     sólo cambia el valor de las dos constantes de las líneas 13 y 17.
8. const baseline = readModernRescueContracts();   // ahora lee el SANDBOX
```

Notas de implementación que el brief fija:
- El archivo pasa a usar **top-level `await`** para el import dinámico (ESM `.mjs`, soportado).
- **No** se cambia ni un cuerpo de test: los 30+ drills siguen escribiendo contra `manifestRoot`, que
  ahora apunta al sandbox. Ése es todo el arreglo.
- **No** se añade limpieza del sandbox por `process.on('exit')` con `rmSync` recursivo sobre una ruta
  computada: un `rm -rf` sobre una variable mal calculada es la clase de accidente que este tranche
  existe para evitar. El sandbox vive en `os.tmpdir()` y lo recoge el sistema; si se quiere borrar,
  hacerlo **sólo** tras re-verificar que la ruta empieza por `os.tmpdir()` y contiene el prefijo
  `modern-rescue-program-check-`.

---

## 7. Aceptación — pruebas

| # | Prueba | Criterio |
|---|---|---|
| **A-1** | **Paridad de baseline** (la que sustituye a la lista de clausura, §5) | `validateModernRescueContracts(baseline)` en el sandbox devuelve **exactamente el mismo array** que el árbol vivo (hoy: `[]`, con `program-check.mjs` en verde `CONSTITUTION_READY`). Cualquier diferencia = clausura incompleta, y hay que **añadir el archivo que falte, no relajar la aserción** |
| **A-2** | Suite directa | `node --test scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs` → verde, mismo número de tests que hoy |
| **A-3** | Cohorte serial | `node --test <program-check.test.mjs> <manifest/generator/index.test.mjs>` → verde, en la MISMA invocación concurrente que hoy usa el gate (sin `--test-concurrency`), repetida **3 veces** |
| **A-4** | Los dos gates que la cohorte avala | `program-check.mjs` → `CONSTITUTION_READY`; `manifest/generator/index.mjs --check` → verde |
| **A-5** | Pierna 1 | `pnpm test:scripts` → sin regresión respecto de la línea base tomada **antes** de tocar nada |
| **A-6** | Diff | `git diff --name-only` = **exactamente 1 path** (más los 5 de T-0 y el roadmap, si aún no se commiteó) |
| **A-7** | Manifiesto de gates intacto | `runner --list` sigue diciendo `89 blocking, 2 excluded`; `flags.test` y `runner.test` verdes **sin haberlos tocado** |

`gates:ci` completo se corre al final, **serial y sin nada en paralelo**, bajo **Node 22** (el major que
pinea `ci.yml`; T-0 midió que Node 25 enrojece `gat-07-exact-proof` por toolchain, ajeno al contenido).

---

## 8. Negativos obligatorios

| # | Negativo | Exigencia |
|---|---|---|
| **D-1** | **Sandbox no decorativo.** Plantar un defecto **sólo en la copia** (p. ej. romper `manifest/schema.json` del sandbox) | `validateModernRescueContracts` **enrojece**. Sin esto el sandbox podría quedar de adorno con el validador leyendo el árbol vivo → falso verde en los 30+ drills |
| **D-2** | **Invariancia del árbol vivo.** Censo `shasum` de `packages/core/manifest/**` (360 archivos) antes y después de la suite | **byte-idéntico**; `git status --porcelain` sin novedades |
| **D-3** | **Cero residuo.** Buscar `*.t1-test-backup` **y** `*.f1-drill-backup` (los dos patrones) | **0** en el árbol vivo, en los 3 objetivos nombrados en §3 |
| **D-4** | **Ninguna escritura fuera del sandbox.** Envolver `writeFileSync`/`renameSync` en el propio test con un guard que asevere que toda ruta destino empieza por `SANDBOX` | ninguna violación; es lo que hace admisible el symlink de `node_modules` |
| **D-5** | **Crash.** Correr la suite en un **proceso hijo** y mandarle **SIGKILL** a mitad; repetir N veces | árbol vivo **byte-idéntico** y **sin residuo**, siempre. **Post-fix es determinista por construcción** (la mutación vive en el sandbox: no existe instante en que el árbol vivo esté mutado). **Declarado explícitamente:** como refutación del código de HOY sería sólo probabilística (el kill debe caer dentro de la ventana) — **no se vende como rojo determinista pre-fix** (C-5, negativa 4) |
| **D-6** | **La cerca del root funciona.** Con el `pnpm-workspace.yaml` del sandbox ausente | `findRepoRoot` **lanza** (falla cerrado); nunca resuelve al repo real |

**Retirada textual exigida por C-5, negativa 2:** de este brief y de toda evidencia de T-1a queda
**retirada** la frase *"es la aserción que habría cazado el defecto actual"* aplicada a D-2. Con el código
de hoy, una corrida que PASA restaura en `finally` y deja hashes idénticos: D-2 **no** habría cazado el
defecto actual, que es ventana concurrente + residuo de crash. La aserción se conserva por su valor
propio, sin esa justificación.

---

## 9. Restore

Idéntico al protocolo de T-0, sobre **un** path:
- Precondición: `git status --porcelain` restringido al write-set **vacío**; si viene sucio → **PARAR**.
- Backup por **contenido** a `/private/tmp/f4a-t1a-backup/<ruta relativa>`, con `shasum -a 256` de ambos
  lados y **igualdad exigida**; prehash registrado **antes** de escribir; anotar `existía=yes`.
- Censo `shasum` de `packages/core/manifest/**` y búsqueda de los dos patrones de residuo, **pre y post**.
- Restore = copiar de vuelta → re-hashear → **exigir igualdad con el prehash** → porcelain del write-set
  vacío → **diff del porcelain ENTERO** pre/post, que sólo puede diferir en el path del write-set.
- **Prohibido** `git show HEAD:path > path`, `checkout`, `restore`, `reset`, `stash`, `add`, `commit`,
  `push`, R7. `git show` sólo como contraste de lectura.
- Prohibido tocar themes, artefactos generados, build, browser y el roadmap.

---

## 10. Stop conditions

**S-A** postaudit Fable de T-0 = **REJECT** → este brief no habilita nada.
**S-B** preestado distinto al §1 (HEAD, staged, dirty inesperado, censo del manifest, residuo previo).
**S-C** el path del write-set viene sucio.
**S-D** **(c1) exige tocar `program-check.mjs`** → **PARAR y reportar**; no caer a (c2) por cuenta propia.
**S-E** `findRepoRoot(<sandbox>/…/modern-rescue)` **no** devuelve el sandbox (§6 paso 5) → abortar: se
estaría validando el árbol vivo.
**S-F** A-1 no da paridad de veredicto → **falta clausura**; añadir el archivo y repetir. Prohibido
relajar la aserción o excluir el chequeo que difiere.
**S-G** cualquier prueba A-2…A-7 roja.
**S-H** D-1 no enrojece (sandbox decorativo) — es el fallo más grave posible aquí: significaría 30+
drills en falso verde.
**S-I** D-2/D-3 detectan cambio o residuo en el árbol vivo.
**S-J** D-4 detecta una escritura fuera del sandbox.
**S-K** el costo de la copia resulta prohibitivo en la práctica → **parar y reportar**, no improvisar un
subárbol parcial (un subárbol parcial es exactamente lo que `'MISSING'` convierte en veredicto falso).
**S-L** aparece la necesidad de un **segundo path** → parar y reportar; no ampliar el write-set.

---

## 11. Re-ancla de la baseline (R-1) — qué hace y qué NO hace este tranche

T-1a **no** re-ancla nada. La salida obligatoria del re-anclaje pertenece a **T-1b** (cra-12), y la
cláusula se asienta en el libro mayor **después** del postaudit del par:

> **A partir del cierre de T-1a/T-1b, la aceptación de K4 y de K5 se compara contra la baseline
> RE-ANCLADA registrada en el libro mayor del DT (`docs/ROADMAP-EJECUCION-2026-08-19.md`), que
> SUPERSEDE el literal `1717/13` de los briefs pinneados. Los briefs históricos NO se editan.**

Condiciones que el re-anclaje debe cumplir, fijadas aquí para que no se negocien después:
1. Se calcula **recién después** de que T-1a **y** T-1b estén ambos aceptados.
2. Exige **dos corridas nominalmente idénticas** de pierna 1 que den el **mismo** par por nombre — es la
   prueba de que la carrera murió; una sola corrida no distingue "determinista" de "tuvo suerte".
3. **T-1b debe declarar a cuál de `export-missing` / `export-unshipped` colapsó el par**, o la
   comparación queda infalsable.
4. Supersede el literal `1717/13` **sin editar** los briefs K4/K5 ni ningún asiento histórico.

---

## 12. Cierre

- **Cero writes al repo** en esta sesión. Write-set de la sesión: este brief y su `.ready`.
- No interferí con el postaudit Fable de T-0 en curso.
- Write-set de T-1a: **un path**. `program-check.mjs`, el manifiesto de gates y los tests del runner
  quedan **intactos**.
- Kimi fuera de la cadena.

# VERDICT: READY_FOR_FABLE_PREAUDIT
