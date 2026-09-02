# T-1b — aislar el drill CRA-12 en sandbox: brief ejecutable (Opus, diseño READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · **staged 0**

**Autoridades (SHA-256 recomputados por mí):**
- Ruling DT `/private/tmp/f4a-pre-k4-dt-sequence-ruling.md` = `baa48c13d99db39c150c4eb2329d189e24e8bb34340a04a83b391549565c7bd2` ✓
- Ratificación Fable `/private/tmp/f4a-pre-k4-fable-sequence-ratification.md` = `e6a6ba3f60924d8ada3b9d740e43ed30c2d6083439bdb54b1c6149b5d521a263` ✓
- Brief T-1a `/private/tmp/f4a-pre-k4-t1a-opus-brief.md` = `53110c0573ec41e3c208028ad3b0e1046862f46e6f5872519376fe3a67465e02` ✓ **pendiente de preaudit Fable**

**Esta sesión:** cero writes al repo, cero tests, cero gates, cero build, cero generadores. Sólo lectura,
`grep`, `find`, `du`/`ls` y lectura de JSON con `node -e`. **No interferí** con el preaudit T-1a en curso.
**Kimi fuera de la cadena:** ni consultado, ni esperado, ni atribuido.

**CONDICIÓN SUSPENSIVA:** T-1a sigue pendiente de preaudit. T-1b **no se ejecuta antes** de que T-1a esté
aceptado e implementado (§10, S-A). Si T-1a cambia de forma, este brief se re-emite.

---

# VERDICT: READY_FOR_FABLE_PREAUDIT

**Sin STOP.** El inventario se confirma en todo lo estructural; **corrijo dos cosas** (§3 y §8), una de
ellas un error **mío** de la adjudicación de close.

---

## 1. Preestado — y un cambio que hay que registrar

- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, **staged 0**.
- **El roadmap YA NO está en el SHA que T-0 preservó.** Medido ahora:
  `a4aabddee653cf94f66a7d589a4947bda5fef64a270441ded93e44caae83b202` →
  **`fb441fb4941dff55101e9ba91bb15f9d2ddc4f995376c4ac64ab7311b6a08b12`**.
  El diff es **+255 líneas, 0 borradas**, y añade el asiento del DT
  (`#### Hardening pre-K4 / authority-honesty — SELLADO`, la resolución de secuencia y la fila
  `T-1a … diseño 100%; implementación 0%`). Es escritura **legítima del DT sobre su propio libro mayor**,
  no un daño: el pin `a4aabd…` era una invariante **del tranche T-0**, ya cerrado. **T-1b re-pinea el
  roadmap a su propio valor de apertura** y lo preserva byte-idéntico durante SU tranche.
- Los cinco paths de T-0 siguen sin commitear, en sus posthashes del SOURCE_READY
  (`5a86b12ae6369bdd…`, `263779f068cbd465…`, `3b7f906f346c3383…`, `afede1efdd7935c7…` y el README).
- Antes de escribir, T-1b debe re-capturar el porcelain entero y re-pinear **todo** lo dirty.

---

## 2. Verificación del inventario — lo que queda CONFIRMADO en fuente

| Claim del inventario | Verdicto | Evidencia medida |
|---|---|---|
| Único mutador: `cra-12-motion-governance.reanchor.test.mjs` | **CONFIRMADO** | 2 `writeFileSync`, 2 `rmSync`, 0 `mkdtemp`. **Un solo test planta**: `DRILL: a NEW raw motion timing turns the gate red` |
| Planta `packages/core/src/foundation/tokens/css/__cra12-reanchor-drill.css` en árbol real | **CONFIRMADO** | `injected = resolve(packageRoot, 'src/foundation/tokens/css/__cra12-reanchor-drill.css')` (:48-51), escrito en `try`, `rmSync(injected,{force:true})` en `finally` (:71) |
| El gate ya soporta `--workspace-root` | **CONFIRMADO** | `index.mjs:645` `if (argv[index]==='--workspace-root') options.workspaceRoot = resolve(argv[++index])` |
| No tocar productivo/registry/gates-manifest | **CONFIRMADO viable** | ver §4: el redireccionamiento es total con sólo esa bandera |
| Layout `<tmp>/ui-design-system` | **CONFIRMADO OBLIGATORIO** | `scanWorkspace`: `const repoRoot = resolve(workspaceRoot, spec.name)` (:383), `spec.name === 'ui-design-system'` (:24) |
| Copiar `packages/core/src`, `packages/showroom/src` | **CONFIRMADO** | `sourceRoots: ['packages/core/src','packages/showroom/src']` (:25) |
| Copiar los dos `package.json` | **CONFIRMADO** | `manifests: ['packages/core/package.json','packages/showroom/package.json']` (:26) |
| Copiar `pnpm-lock.yaml` | **CONFIRMADO** | `const lockPath = resolve(repoRoot, 'pnpm-lock.yaml')` (:351) — se lee, y alimenta 9 findings de canal `dependency-state` |
| `--repositories ui-design-system --workspace-root <tmp>` siempre | **CONFIRMADO** | `runGate` ya pasa `--repositories ui-design-system` con `cwd: packageRoot` (:28-33); sólo hay que añadir la segunda bandera |
| Registry se lee real y read-only | **CONFIRMADO, y es semánticamente correcto** | `defaultRegistryPath = resolve(HERE, …registry.json)` (:20) — se resuelve desde el **directorio del gate**, no desde `workspaceRoot`: el registry es el **contrato de baseline del gate**, no corpus escaneado. Y el gate **no tiene un solo `writeFileSync`** |
| Ningún `--print-baseline`/registry update | **CONFIRMADO** | `--print-baseline` sólo setea `options.printBaseline = true` (:647): **imprime, no escribe** |
| 0 symlinks en el corpus | **CONFIRMADO** | medido: 0 en ambos `src` |
| 4329 archivos | **CONFIRMADO EXACTO** | `core/src` 3975 + `showroom/src` 354 = **4329** |
| Write-set = sólo ese test | **CONFIRMADO** | §5 |

**Verificación adicional que nadie pidió y que cierra el riesgo real de un sandbox:** las políticas del
registry que **resuelven contra `workspaceRoot`** apuntan **todas** dentro del corpus copiado —
`allowedDynamicKeyframes` son 4 entradas, las 4 con `repo: "ui-design-system"` y `path` bajo
`packages/core/src/**` (sparkline, Toast/AnimatedCheck, Toast/UndoToast ×2), y
`allowedDirectImportRoots` son 2 `pathPrefix` bajo `packages/core/src/**`
(`graphics/motion/`, `infrastructure/runtime/motion/`). Si alguna hubiera nombrado otro repo o una ruta
fuera de la copia, `allowedDynamicDefinition` (:369-371, `resolve(workspaceRoot, entry.repo, entry.path)`)
habría dejado de eximirla y el sandbox habría producido un finding que el árbol real no tiene. **No es el
caso.** Canales de baseline: `dependency-state, direct-motion-import, global-keyframes, raw-motion-timing,
transition-all` (5).

---

## 3. CORRECCIÓN 1 — la cifra de MiB no es reproducible; el conteo sí

El inventario dice "~44 MiB, 4329 archivos". **El conteo es exacto**; la cifra de bytes no reproduce.
Medido sobre el conjunto de copia completo (los dos `src` + los 3 sueltos):

- **4332 archivos** (4329 del corpus + `packages/core/package.json` + `packages/showroom/package.json` + `pnpm-lock.yaml`)
- **38.210.690 bytes = 36,4 MiB de contenido real**
- `du -sh` (bloques asignados) da ≈ **46 MB**

"44 MiB" no es ninguna de las dos. **El brief pinea las dos medidas reproducibles** —
36,4 MiB de contenido / ~46 MB en bloques — y **usa el conteo de archivos (4329 + 3) como la magnitud
verificable**, porque es la única que no depende del sistema de archivos. No es un defecto del
inventario: es una cifra que no debe entrar a un asiento sin decir cómo se midió.

Sin `node_modules`, `dist`, `.next`, `coverage` ni `.git` anidados dentro de los dos `src` (verificado:
no existen), así que la copia byte-completa **no** arrastra árboles pesados y `SKIP_DIRECTORIES` del gate
(`.git`, `.next`, `dist`, `node_modules`, `coverage`) queda sin trabajo que hacer.

---

## 4. Por qué `--workspace-root` basta, y por qué NO hace falta tocar el gate

Tres hechos leídos en fuente:

1. **`designSystemRoot` se usa en UN solo lugar**: `defaultWorkspaceRoot = resolve(designSystemRoot,'..')`
   (:18-19). No hay ninguna otra lectura del árbol real por esa vía. Pasar `--workspace-root` redirige
   **todo** el corpus.
2. **La preservación de digests está probada, no supuesta.** El path de cada record es
   `posix(relative(repoRoot, absolute))` (:389) con `repoRoot = resolve(workspaceRoot, 'ui-design-system')`.
   Una copia en `<tmp>/ui-design-system` con la **misma estructura relativa y el mismo contenido** produce
   **exactamente los mismos paths**; y `groupDigest(records,{includePath:true})` (:522-524, :557, :609)
   sólo mezcla `path\0kind\0symbol\0evidence`. **Digest idéntico ⇒ todas las baselines se conservan.**
   Ésta es la razón por la que la copia debe ser **byte-completa de los dos `sourceRoots`**, no un subárbol:
   un archivo ausente no rompe ruidosamente, cambia el conjunto de records.
3. **El registry sigue siendo el real y sólo se lee.** Es correcto: el registry describe la deuda
   *aceptada* del repo, no el árbol escaneado. Mantenerlo real es lo que hace que el sandbox mida
   **la misma vara** que la corrida de producción.

**Conclusión: `program-check.mjs`-equivalente aquí (`cra-12/index.mjs`), el registry y `gates-manifest`
quedan FUERA del write-set.** No hay STOP por este eje.

---

## 5. Write-set exacto

| # | Path |
|---|---|
| **1 (único)** | `packages/core/scripts/evidence/cra-12-motion-governance/cra-12-motion-governance.reanchor.test.mjs` |

**Fuera del write-set, explícitamente:** `cra-12-motion-governance/index.mjs`,
`cra-12-motion-governance.registry.json`, `cra-12-motion-governance/index.test.mjs`,
`scripts/ci/gates-manifest/index.mjs`, `app-ds-hook-contract-gate/**`, el roadmap y todo lo demás.
**Cero gate nuevo, cero gate editado, cero baseline re-escrita en este tranche.**

---

## 6. Algoritmo exacto de copia

Una copia **por módulo de test** (no por drill), en `test.before`, reutilizada por todos los drills.

```
1. SANDBOX_TMP = mkdtempSync(join(os.tmpdir(), 'cra12-reanchor-'))
   — os.tmpdir(), NUNCA dentro del repo.
2. WS = join(SANDBOX_TMP, 'ui-design-system')      // el nombre es OBLIGATORIO (spec.name)
3. LIVE = findPackageRoot(HERE)/..                 // packages/core -> repo real, sólo para LEER
4. cpSync(join(LIVE,'packages/core/src'),      join(WS,'packages/core/src'),      {recursive:true})
   cpSync(join(LIVE,'packages/showroom/src'),  join(WS,'packages/showroom/src'),  {recursive:true})
   cpSync(join(LIVE,'packages/core/package.json'),     join(WS,'packages/core/package.json'))
   cpSync(join(LIVE,'packages/showroom/package.json'), join(WS,'packages/showroom/package.json'))
   cpSync(join(LIVE,'pnpm-lock.yaml'),                 join(WS,'pnpm-lock.yaml'))
   — byte-completa, preservando rutas relativas. 0 symlinks medidos, así que `cpSync` no necesita
     política de symlink; si algún día aparece uno, `verbatimSymlinks:false` lo materializaría y
     cambiaría el digest: por eso D-7 verifica el conteo de archivos copiados.
5. ASSERT DE CERCA (antes de correr el gate):
      existsSync(join(WS,'packages/core/src')) && existsSync(join(WS,'pnpm-lock.yaml'))
      conteo de archivos copiados bajo los dos src === 4329
6. runGate(extra) := spawnSync(node, [gate, '--repositories','ui-design-system',
                                     '--workspace-root', SANDBOX_TMP, ...extra],
                               { cwd: packageRoot, encoding:'utf8' })
   — OJO: `--workspace-root` recibe SANDBOX_TMP (el padre), no WS. El gate hace
     resolve(workspaceRoot,'ui-design-system') por sí mismo.
7. La planta del drill pasa a  join(WS,'packages/core/src/foundation/tokens/css/__cra12-reanchor-drill.css')
   — mismo contenido, mismo nombre; sólo cambia la raíz. El `finally` con rmSync se conserva.
8. test.after(() => { cleanup })  — borrar SANDBOX_TMP sólo tras re-verificar que la ruta empieza por
   os.tmpdir() y contiene el prefijo 'cra12-reanchor-'. Un rm recursivo sobre una variable mal
   calculada es exactamente el accidente que este tranche existe para evitar.
```

**Todos los `runGate()` del archivo pasan por la misma función**, así que las cuatro invocaciones
(precondición, con planta, tras retiro, y el test 1 "the re-anchored DS slice passes") quedan en sandbox
con un solo cambio de firma. El archivo **no** cambia ni una aserción.

---

## 7. Aceptación

| # | Prueba | Criterio |
|---|---|---|
| **A-1** | **Gate puro contra el sandbox limpio** | `--repositories ui-design-system --workspace-root <tmp>` → **exit 0**, y el **mismo veredicto** que contra el árbol real. Es la prueba de que la copia es completa: una pieza faltante cambia el conjunto de records y por tanto el digest |
| **A-2** | Test directo | `node --test cra-12-motion-governance.reanchor.test.mjs` → verde, mismo número de tests |
| **A-3** | **Cohorte con el walker paralelo** | `node --test <reanchor.test.mjs> <scripts/boundaries/app-ds-hook-contract-gate/index.test.mjs>` → verde, **sin alternancia** de `export-missing`/`export-unshipped`, repetido **3 veces** |
| **A-4** | Suite hermana | `node --test cra-12-motion-governance/index.test.mjs` → verde (no se toca, pero comparte gate) |
| **A-5** | **Pierna 1 dos veces** | `pnpm test:scripts` ×2, **nominalmente idénticas** por nombre de test. Es la prueba de determinismo, no de verdor |
| **A-6** | `gates:ci` serial, **Node 22** | verde; en particular `cra12-motion-governance-drill` (entrada blocking propia) y los 89 blocking de T-0 |
| **A-7** | Diff | `git diff --name-only` = **exactamente 1 path** nuevo respecto del preestado |

---

## 8. CORRECCIÓN 2 — `export-missing` / `export-unshipped`: el inventario tiene razón y **yo estaba equivocado**

En mi adjudicación de close escribí que el par es *"UN slot decidido por el timing"* que *"debe colapsar
de forma determinista"* a uno de los dos. **Es falso, y lo corrijo.** Leídos en fuente
(`app-ds-hook-contract-gate/index.test.mjs:877-903`), son **dos tests independientes**, ambos RED-drills:

```js
test('RED: export-missing …',   … assert.deepEqual(problems.map(p=>p.code), ['EXPORT_MISSING']));
test('RED: export-unshipped …', … assert.deepEqual(problems.map(p=>p.code), ['EXPORT_UNSHIPPED']));
```

Los dos llaman `deriveHookManifest({ coreRoot: CORE_ROOT, postcss })`, que **camina el árbol real** y
parsea su CSS. La aserción es `deepEqual` sobre la lista **exacta** de códigos, de **un solo elemento**.

**Mecanismo del defecto, ahora explícito:** cuando el drill de cra-12 planta
`__cra12-reanchor-drill.css` dentro de `packages/core/src/foundation/tokens/css/`, el manifest derivado
por un walker concurrente deja de coincidir con `hooks-manifest.json` en disco, y
`checkManifestFreshness` **añade un código de staleness** a la lista. La lista pasa a tener 2 elementos y
el `deepEqual` de un elemento **falla** — en uno, en el otro, o en los dos, según dónde caiga la ventana.

**Consecuencia para la baseline:** retirada la planta del árbol vivo, `deriveHookManifest` ve un árbol
limpio, la lista vuelve a tener exactamente su único código, y **ambos tests quedan verdes**. Es decir:
**pierna 1 debe mejorar en DOS**, no en uno. El inventario acierta y mi formulación previa queda retirada.

**Salvedad de método, explícita:** esto es una **derivación desde fuente**, no una corrida — este encargo
prohíbe ejecutar tests. Por eso **no se asienta como hecho**: se asienta como **criterio de aceptación
falsable** (A-3/A-5) con su regla de fallo en §11.

---

## 9. Negativos obligatorios

| # | Negativo | Exigencia |
|---|---|---|
| **D-1** | Sandbox limpio | el gate pasa **verde** contra la copia sin planta (si no, la copia está incompleta o mal enraizada) |
| **D-2** | **Planta en la copia enrojece** | con el `.css` plantado **sólo en el sandbox**: exit ≠ 0, `stderr` matchea `/raw-motion-timing/` **y** `/ds-internal/`, y el finding cita el **path del sandbox**. Sin esto el sandbox es decorativo |
| **D-3** | Retiro devuelve el verde | tras `rmSync` de la planta, exit 0 |
| **D-4** | **El archivo real NUNCA existe** | `existsSync(<LIVE>/packages/core/src/foundation/tokens/css/__cra12-reanchor-drill.css) === false` comprobado **antes, durante (con la planta viva en el sandbox) y después**. Es la aserción central del tranche |
| **D-5** | **Omitir una pieza falla cerrado** | copiar el corpus **sin** `pnpm-lock.yaml` (o sin un `package.json`) debe **cambiar el veredicto** respecto de A-1 — probando que la lista de copia es necesaria y que el gate no ignora silenciosamente lo que falta |
| **D-6** | Cero escritura al registry / cero print-baseline | el `.registry.json` mantiene su hash byte-idéntico tras toda la suite; ninguna invocación pasa `--print-baseline` |
| **D-7** | Integridad de la copia | conteo de archivos bajo los dos `src` del sandbox === **4329**; **0 symlinks** |
| **D-8** | Árbol vivo intacto | `git status --porcelain` sin novedades y sin `__cra12-*` en ningún lado |

---

## 10. Restore

- Precondición: porcelain restringido al write-set **vacío**; si viene sucio → **PARAR**.
- Backup por **contenido** a `/private/tmp/f4a-t1b-backup/<ruta relativa>`, `shasum -a 256` de ambos lados
  con **igualdad exigida**, prehash registrado **antes** de escribir, `existía=yes` anotado.
- Pre-pin adicional: hash del `cra-12-motion-governance.registry.json` y del árbol
  `packages/core/src/foundation/tokens/css/**`, más la ausencia de `__cra12-reanchor-drill.css`.
- Restore = copiar de vuelta → re-hashear → **igualdad con el prehash** → porcelain del write-set vacío →
  **diff del porcelain ENTERO** pre/post, que sólo puede diferir en el path del write-set.
- **Prohibido** `git show HEAD:path > path`, `checkout`, `restore`, `reset`, `stash`, `add`, `commit`,
  `push`, R7; prohibido tocar themes, generados, build, browser y el roadmap.

---

## 11. Baseline exacta y re-ancla (R-1)

**T-1b no re-ancla nada por sí solo.** El re-anclaje ocurre **después de que T-1a y T-1b estén ambos
ACCEPT**, y se asienta en el libro mayor tras el postaudit:

> **A partir del cierre de T-1a/T-1b, la aceptación de K4 y de K5 se compara contra la baseline
> RE-ANCLADA registrada en el libro mayor del DT (`docs/history/programs/architecture-refactor/2026-08/execution/index.md`), que
> SUPERSEDE el literal `1717/13` de los briefs pinneados. Los briefs históricos NO se editan.**

Condiciones exactas, no negociables después:
1. **Dos corridas de pierna 1 nominalmente idénticas** — mismo conjunto de fallas **por nombre**, no sólo
   mismo total. Una sola corrida no distingue "determinista" de "tuvo suerte".
2. **Expectativa declarada por adelantado (§8): `export-missing` y `export-unshipped` quedan los DOS
   verdes.** Se declara **antes** de correr, para que sea falsable.
3. **Regla de fallo, explícita:** si tras T-1a+T-1b **uno de los dos sigue rojo**, eso **no** es la nueva
   baseline: **hay un segundo defecto**. Se investiga y se nombra; **está prohibido bendecir ese rojo
   como línea base**. Re-anclar sobre un rojo sin diagnóstico es exactamente el movimiento que el propio
   archivo del drill documenta como destructor de credibilidad (`one-off-reanchor`, `doNotRepeat`).
4. **T-1b declara a cuál de los dos nombres colapsó el par** si —contra lo esperado— colapsara en vez de
   quedar ambos verdes.
5. El re-anclaje **supersede** el literal `1717/13` **sin editar** los briefs K4/K5 ni ningún asiento
   histórico.

---

## 12. Stop conditions

**S-A** T-1a no aceptado/implementado → no ejecutar T-1b.
**S-B** preestado distinto al §1 (incluido el roadmap: re-pinear a su valor de apertura y preservarlo).
**S-C** el path del write-set viene sucio.
**S-D** el aislamiento **exige tocar** `cra-12/index.mjs`, el registry o `gates-manifest` → **PARAR y
reportar**; no improvisar un parámetro de corpus extra.
**S-E** A-1 no reproduce el veredicto del árbol real → **falta clausura de copia**; añadir la pieza y
repetir. **Prohibido** relajar la aserción o excluir el canal que difiere.
**S-F** D-2 no enrojece (sandbox decorativo) — el fallo más grave: significaría el drill entero en falso verde.
**S-G** D-4 detecta el archivo real en cualquier momento.
**S-H** D-5 no cambia el veredicto (la lista de copia no estaría siendo necesaria ⇒ el gate estaría
ignorando en silencio lo que falta, que es un hallazgo propio a reportar).
**S-I** D-6 detecta cambio en el registry.
**S-J** el costo de la copia resulta prohibitivo → **parar y reportar**, no improvisar un subárbol parcial
(un subárbol parcial es justamente lo que el docstring del drill declara que ahoga la señal).
**S-K** A-5 da dos corridas **no** idénticas por nombre → el determinismo no se logró; no re-anclar.
**S-L** aparece la necesidad de un **segundo path** → parar y reportar; no ampliar el write-set.

---

## 13. Cierre

- **Cero writes al repo.** Write-set de la sesión: este brief y su `.ready`.
- No interferí con el preaudit Fable de T-1a.
- Write-set de T-1b: **un path**. Gate, registry y manifiesto de gates **intactos**.
- Dos correcciones al material recibido: la cifra de MiB (§3) y —la importante— el par `export-*`, donde
  **el inventario tenía razón y mi adjudicación de close estaba equivocada** (§8).
- Kimi fuera de la cadena.

# VERDICT: READY_FOR_FABLE_PREAUDIT
