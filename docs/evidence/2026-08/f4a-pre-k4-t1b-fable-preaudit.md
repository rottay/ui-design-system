# T-1b (sandbox del drill CRA-12) — Preaudit Fable 5 del brief Opus (auditor READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Preestado verificado:** HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · staged 0 · porcelain = los 5 paths de T-0 (sin commit, sellados por mi postaudit) + el roadmap DT-owned en `fb441fb4941dff55101e9ba91bb15f9d2ddc4f995376c4ac64ab7311b6a08b12` (**+255 inserciones / 0 borradas** vs HEAD, con el asiento `Hardening pre-K4 … SELLADO` presente — medido por mí). El §1 del brief maneja ese cambio correctamente: escritura legítima del DT sobre su libro mayor, re-pineada como valor de apertura de T-1b. **No leí el estado ni conclusiones de T-1a** (su path no está dirty aún) y no corrí ningún test — cero interferencia con la implementación en curso.

**Insumos (SHA-256 verificados byte-exactos):**
- Brief T-1b `/private/tmp/f4a-pre-k4-t1b-opus-brief.md` = `83df046539cc498ee129c7fd9fc48a11856488f9fc53e88f1ffa74e0be50ca7d` — `READY_FOR_FABLE_PREAUDIT`
- Mi preaudit T-1a = `be99a11fe11c3bf3d94235659e7fa02ad69ff1aaa5e28f6be4bdb6b4cf23ab6e` — ACCEPT (implementación T-1a en curso)
- Ruling DT de secuencia = `baa48c13d99db39c150c4eb2329d189e24e8bb34340a04a83b391549565c7bd2`

**Leyes cumplidas:** cero writes al repo, cero suites mutantes/gates:ci/builds/generadores, cero git mutante, cero pedido de commit, Kimi no consultado. Sólo lectura, `grep`, `find`, `stat`, `du`, `sed` y `node -e` sobre JSON. Write-set de la sesión: este memo y su `.ready`.

---

## VERDICT: ACCEPT

Cada claim del brief que verifiqué contra la fuente del gate, del test y del registry resultó **exacto** — incluidas sus dos correcciones, una de las cuales corrige también una formulación heredada por mi propia cadena. Intenté refutar toda lectura/escritura que escape del sandbox y todo false-green por copia incompleta: **no encontré vía de escape**, y los false-green posibles están cercados por aceptaciones falsables (A-1, D-5) con stops que prohíben relajarlas (S-E, S-H). Este ACCEPT, **junto con el postaudit ACCEPT de T-1a** (S-A del brief + condición del encargo), habilita la implementación de T-1b sobre su único path.

---

## 1. Write-set de UN solo test — CONFIRMADO

`cra-12-motion-governance.reanchor.test.mjs` es el único mutador: la planta vive en `:56` dentro de `try` con `rmSync(injected,{force:true})` en el `finally` (`:71`), y el path plantado es `resolve(packageRoot, 'src/foundation/tokens/css/__cra12-reanchor-drill.css')` (`:48-51`) con su justificación de digest en el docstring — todo verbatim al brief. Fuera del write-set y verificado intactos por diseño: `index.mjs` del gate (**0 `writeFileSync`/`renameSync`, 0 spawn, 0 `process.cwd`** — medido), el registry (sólo lectura; `--print-baseline` únicamente setea un flag, `:647`), `index.test.mjs` hermano, `gates-manifest` (la entrada blocking `cra12-motion-governance-drill` no cambia: mismo argv, mismo path — y post-fix correrá el test ya sandboxeado también en CI), `app-ds-hook-contract-gate/**` y el roadmap.

## 2. `--workspace-root` redirige TODO el corpus y preserva digests — VERIFICADO EN FUENTE

- `designSystemRoot`/`defaultWorkspaceRoot` (`:18-19`) se usan **sólo como defaults** en `scanWorkspace` (`:377`), `auditWorkspace` (`:625`) y el main (`:681`) — pasar la bandera los reemplaza en los tres. No existe otra vía de lectura del árbol real salvo el registry (por diseño).
- `repoRoot = resolve(workspaceRoot, spec.name)` (`:383`) con `spec.name = 'ui-design-system'` → el layout `<tmp>/ui-design-system` es obligatorio y **`--workspace-root` recibe el PADRE** — el brief lo dice explícitamente y es correcto.
- `sourceRoots`/`manifests`/`pnpm-lock.yaml` exactos (`:25-26`, `:351`). Fail-closed en repo/sourceRoot ausente (**throw**, `:384/:387`).
- Digest: `path = posix(relative(repoRoot, absolute))` (`:389`) y `groupDigest(records,{includePath:true})` (`:522/:557/:609`) mezcla sólo `path\0kind\0symbol\0evidence` → **copia byte-completa con la misma estructura relativa ⇒ digests idénticos ⇒ baselines conservadas.** El argumento es de fuente, no de fe.
- **Matiz que FORTALECE D-5, verificado:** el lock se lee `existsSync(lockPath) ? readFileSync(...) : ''` (`:352`) — **soft-fail**. Su ausencia no lanza: cambia en silencio los findings de `dependency-state` contra la baseline. Exactamente por eso D-5 (omitir una pieza debe cambiar el veredicto) y S-H (si no lo cambia, el gate está ignorando en silencio) son obligatorios y están bien puestos.

## 3. Registry read-only y semánticamente correcto — CONFIRMADO

`defaultRegistryPath = resolve(HERE, …)` (`:19`): el registry es el **contrato de baseline del gate**, no corpus escaneado — mantenerlo real hace que el sandbox mida la misma vara. Verificado además lo que nadie pidió y el brief sí midió: las **4** `allowedDynamicKeyframes` son todas `repo: ui-design-system` bajo `packages/core/src/**` (charts/sparkline + Toast ×3) y los **2** `allowedDirectImportRoots` (`graphics/motion/`, `infrastructure/runtime/motion/`) también — todas las políticas que resuelven contra `workspaceRoot` (`:368-371`) caen **dentro de la copia**, así que ninguna exención se pierde en sandbox. Canales de baseline exactos: `dependency-state, direct-motion-import, global-keyframes, raw-motion-timing, transition-all` (5). D-6 pinea el registry byte-idéntico.

## 4. Corpus: cero symlinks, conteos y la Corrección 1 — BYTE-EXACTA

Medido por mí: **0 symlinks** en ambos `src`; **3975 + 354 = 4329** archivos; conjunto de copia 4329 + 3 = **4332**; contenido real **38.210.690 bytes = 36,44 MiB**; `du` en bloques ≈ 46 MB. La Corrección 1 del brief reproduce exacta, y su disciplina ("ninguna cifra entra a un asiento sin decir cómo se midió") es la correcta — el "~44 MiB" del inventario efectivamente no es ninguna de las dos medidas.

## 5. Corrección 2 (`export-missing`/`export-unshipped`) — ADJUDICADA: ACEPTADA, y corrige también a mi cadena

Leído en fuente (`app-ds-hook-contract-gate/index.test.mjs:877-905`): son **dos tests independientes**, ambos RED-drills, cada uno con `assert.deepEqual(problems.map(code), ['EXPORT_MISSING'])` / `(['EXPORT_UNSHIPPED'])` — lista **exacta de UN elemento** — y ambos llaman `deriveHookManifest({coreRoot: CORE_ROOT, postcss})` sobre el **árbol real**. El mecanismo del defecto es el que el brief nombra: la planta viva de cra-12 desincroniza el manifest derivado del `hooks-manifest.json` en disco, `checkManifestFreshness` añade el código de staleness (la familia `MANIFEST_STALE` existe, `:861`), la lista pasa a 2 elementos y el `deepEqual` falla en uno, en el otro o en ambos según la ventana. Sin planta viva, **ambos quedan verdes**.

Consecuencias que asiento formalmente:
- La formulación *"el par colapsa a uno de los dos"* — que venía de la adjudicación Opus de close **y que mi propia cadena (ratificación R-1, brief T-0 §8, brief T-1a §11) arrastró** — queda **retirada**: la expectativa correcta y declarada ex ante es **ambos verdes**.
- El brief lo maneja con el método honesto: lo declara como **criterio falsable** (A-3/A-5), no como hecho corrido; conserva como contingencia la obligación de declarar a cuál colapsó si —contra lo esperado— colapsara (§11.4); y añade la regla de fallo dura (§11.3): **un rojo sobreviviente es un segundo defecto, prohibido bendecirlo como baseline** — coherente con el `one-off-reanchor`/`doNotRepeat` del propio drill.

## 6. Refutación de escapes y false-greens — INTENTADA Y FALLIDA

- **Un solo `spawnSync` real** en el test (el segundo hit del token es el import de la línea 15), dentro de `runGate` (`:27-33`, `--repositories ui-design-system`, `cwd: packageRoot`); **las 4 invocaciones** pasan por él → un solo cambio de firma sandboxea todo, sin tocar aserciones.
- Los tests `:127`/`:164` son **in-memory puros** (`scanSource` con strings literales; el `path` es etiqueta, no lectura) — cero interacción con árbol alguno.
- El gate hijo lee: corpus/lock/manifests desde `workspaceRoot` (sandbox), registry desde `HERE` (real, **read-only probado**: 0 writes en el gate). Sin `process.cwd`, sin spawns anidados.
- Cleanup del sandbox sólo tras re-verificar prefijo `os.tmpdir()` + `cra12-reanchor-` — la misma disciplina anti-`rm -rf` de T-1a.
- False-green por copia incompleta: cercado tres veces — **A-1** (paridad de veredicto con el árbol real; S-E prohíbe relajar), **D-5** (omisión debe cambiar el veredicto; S-H si no), **D-7** (conteo 4329 + 0 symlinks, que además vigila la materialización de symlinks futura que el propio brief anticipa).
- **D-4 es la aserción central y está bien puesta:** el archivo real no existe antes, durante (con la planta viva en el sandbox) ni después; D-8 remata con porcelain limpio y cero `__cra12-*`.

## 7. Re-ancla (R-1) — CONFORME

T-1b no re-ancla nada por sí solo; el re-anclaje ocurre **sólo después de T-1a y T-1b ambos ACCEPT**, con **dos corridas de pierna 1 nominalmente idénticas por nombre** (S-K si no), expectativa declarada por adelantado, regla de fallo explícita, y supersesión del literal `1717/13` **sin editar** briefs ni asientos históricos. Es exactamente mi R-1 con los dos endurecimientos buenos (doble corrida; prohibición de bendecir rojos).

---

## Notas (no bloqueantes)

- **N-1** El censo del §2 del brief cuenta líneas-token: dice "2 `writeFileSync`, 2 `rmSync`" pero una línea de cada par es el **import** (línea 16). Sitios reales: **1** write (la planta, `:56`) y **1** `rmSync` (el `finally`, `:71`). Dirección segura — la superficie de mutación real es menor que la declarada — y sin consecuencia: todos los sitios se relocalizan al sandbox y D-4/D-8 cercan. (Contraste: el brief T-1a sí descontó el import; éste no.)
- **N-2** A-6 nota: la entrada blocking `cra12-motion-governance-drill` de gates-manifest correrá el test ya sandboxeado también en `gates:ci` sin cambiar un byte del manifiesto — beneficio colateral correcto del diseño.
- **N-3** La aritmética exacta de la mejora de pierna 1 (si el slot par desaparece como 1 o como 2 en el conteo "por nombre") la fija el re-anclaje con sus dos corridas — no se pre-pinea aquí, coherente con §11.

---

## Cierre

- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · staged 0 · porcelain = 5 paths T-0 + roadmap `fb441fb4…`, intactos por mí; estado T-1a no leído.
- **Nota de timing:** al cerrar la redacción de este memo, el path de T-1a (`program-check.test.mjs`) apareció modificado en disco — la implementación Sonnet aterrizó DESPUÉS de que mis verificaciones cerraran. No lo leí ni lo audité (eso es el postaudit T-1a, encargo separado) y no altera nada de este preaudit: S-A ya condiciona la ejecución de T-1b a que T-1a esté aceptado.
- Cero writes al repo; cero pedido de commit; Kimi fuera de la cadena.

# VERDICT FINAL: ACCEPT

El brief T-1b queda aceptado tal como está escrito (SHA `83df0465…ca7d`), con las notas N-1..N-3. Habilitación condicionada exactamente como manda la cadena: **este ACCEPT + el postaudit ACCEPT de T-1a** (S-A) habilitan la implementación del único path `packages/core/scripts/evidence/cra-12-motion-governance/cra-12-motion-governance.reanchor.test.mjs`, con postaudit Fable posterior del diff completo.
