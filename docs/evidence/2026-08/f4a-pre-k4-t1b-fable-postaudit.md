# AISLAMIENTO PRE-K4 (T-1b, sandbox del drill CRA-12) — Postaudit final Fable 5 (auditor READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Estado verificado (apertura y cierre de esta ronda):** HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · staged 0 · porcelain = exactamente **8** paths: los 7 preexistentes (5 de T-0 + roadmap + `program-check.test.mjs` de T-1a) + **el único target de T-1b**. Roadmap vigente `271ea1e0f4fc4f3ab3fe06b3c6d8c40d713146c714dd7ccc63d9b02a0b94b2e3`, recomputado dos veces (apertura y post-focal), byte-idéntico. `git diff --check` limpio. Cero residuos `__cra12-*` (repo entero).

**Autoridades (SHA-256 recomputados por mí, todos exactos):**
- Brief Opus `83df046539cc498ee129c7fd9fc48a11856488f9fc53e88f1ffa74e0be50ca7d`
- Mi preaudit `1223e2cf83c90d447e6e558bbfb4e7b2499cb3b09115e161bfb2ddcf55076eee` — ACCEPT
- Postaudit T-1a `f5c3f1044f03261b40f271eceb1189df0e81acca856b52ba2f1403075a8cb851` — ACCEPT (S-A satisfecha)
- SOURCE_READY Sonnet `1a42e6fffc22b1a7dcb1b42c12cb5adbc088de905bb0da9b79ff996fc5c66e86`
- Patch durable `bb539d18bf94e6a16eb7b040920ea03b616315b47bdd5020cc0e3ca4ad93552a`

**Write-set:** prehash `45363147…d0de2` = blob de HEAD (recomputado por mí) · posthash `39d65b6e…82a3c` = archivo vivo (recomputado por mí, dos veces).

**Leyes cumplidas:** cero writes al repo, cero stage/commit, cero edición de autoridad; NO corrí `pnpm test:scripts` ni `gates:ci` (logs completos ya existentes, `heavyBuildOrTest=1`); corrí UN focal serial independiente permitido por el encargo (el test directo del target). Kimi fuera de la cadena. Write-set de la sesión: este memo y su `.ready`.

---

## VERDICT: ACCEPT

El diff real satisface el brief punto por punto, la cerca es fail-closed en ambos sentidos, no existe vía de escape ni false-green, el cleanup es imposible de convertir en un `rm` amplio con los valores que ese código puede tener, y el proceso deja el re-anclaje R-1 habilitado **sin declararlo ejecutado**. La desviación procesal del backup queda adjudicada en (a) — no material, con nota vinculante ESCALADA por reincidencia. Ningún hallazgo de código.

---

## 1. Diff completo y fuente real (encargo 1)

- **El patch durable ES el diff vivo:** comparados byte a byte por mí → idénticos. Cuatro hunks `-U3`: la cabecera (imports + consts + `countCorpusEntries` + `before`/`after` + `runGate`) y tres dentro del cuerpo del DRILL, nada más.
- **Cero cambios de cuerpo ajeno, probado en la forma más fuerte:** `git show HEAD:<target> | tail -n +77` vs `tail -n +169 <vivo>` → **byte-idéntico** (los 4 tests no tocados: registry one-off, canales, reduced-motion ×2). `grep -c '^test('` = **6 en HEAD y 6 en vivo**. Dentro del DRILL, el contenido de la planta, las aserciones rojas, el `finally` y el re-check verde final son **contexto sin tocar**; lo único nuevo es el split `livePlant`/`injected`, los 3 asserts D-4 y el comentario.
- **Todos los `runGate` usan el sandbox:** una sola función (`:111-117`) con `'--workspace-root', SANDBOX_TMP` (el PADRE, correcto contra `resolve(workspaceRoot, spec.name)` del gate) y las **4** invocaciones del archivo (`:120/:142/:157/:166`) pasan por ella. Un solo `spawnSync` real en el archivo.
- **`LIVE` vía `repoRoot` es semánticamente exacto:** `findRepoRoot(HERE)` asciende por marcador y falla cerrado — y de paso corrige el pseudo-código del brief (`findPackageRoot(HERE)/..` quedaba un nivel corto: `packages/`, no el repo). Desviación documentada por el writer, en la dirección de robustez, usando el módulo ya auditado. Adjudicada a favor (nota O-B).
- **Layout/corpus/cercas:** `WS = SANDBOX_TMP/ui-design-system` (nombre obligatorio), copia de las 5 piezas exactas, y en el MISMO `before`: existsSync de corpus+lock, **conteo === 4329**, **symlinks === 0** — cada uno con `throw` (aborta la suite entera, fail-closed). `countCorpusEntries` no desciende symlinks y los cuenta aparte: la materialización futura de un symlink dispararía la cerca.
- **Ninguna lectura de corpus escapa del workspace-root:** el gate hijo lee corpus/lock/manifests desde el sandbox (verificado en fuente en el preaudit: `:383/:351/:26`, políticas `:368-371`); del árbol real sólo lee el registry y su propio script desde `HERE` — **por diseño, read-only probado** (0 writes en el gate) y **byte-pinneado** en esta ronda (`e8a7f0c4…0fc0` constante, incluso tras mi corrida focal).

## 2. Ataque a D-2/D-4 (encargo 2) — SOSTENIDOS

- La planta es sandbox-exclusiva **por construcción**: `injected = join(sandboxPackageRoot, …)` con `sandboxPackageRoot ← WS ← SANDBOX_TMP ← mkdtempSync(os.tmpdir())`. `livePlant` conserva la expresión ORIGINAL del path real y se usa sólo como centinela de ausencia.
- Los **3 asserts D-4** (antes / durante-con-la-planta-viva / después, `:141/:155/:165`) están en el cuerpo y pasaron.
- Retiro en `finally` intacto (`:161-163`) + re-check verde final intacto.
- **Evidencia de primera mano mía:** corrí el test directo una vez, serial y solo → **6/6 pass, EXIT 0** (10,5 s), y DESPUÉS re-medí el árbol vivo: porcelain exactamente 8, **0** `__cra12-*`, registry, target y roadmap byte-idénticos. El drill plantó y enrojeció DENTRO de su sandbox, y el árbol real jamás lo vio — no lo leo del informe: lo medí.

## 3. Ataque al cleanup (encargo 3) — SUFICIENTE, NO HAY REJECT

`test.after` borra sólo si: `SANDBOX_TMP` es no-nulo **y** (`=== tmpdir()` **o** `startsWith(tmpdir()+sep)` — consciente de separador, inmune al hermano `…/T-evil`) **y** `basename(SANDBOX_TMP).startsWith('cra12-reanchor-')`. Análisis adversario: (i) `before` fallido antes del mkdtemp → binding undefined → no borra; (ii) `SANDBOX_TMP === tmpdir()` exacto → el basename de tmpdir jamás empieza por el prefijo → no borra (la rama es inerte, no peligrosa); (iii) el peor valor que pasa el guard es un directorio hoja bajo tmpdir cuyo nombre empieza por `cra12-reanchor-` — es decir, exactamente un sandbox de este drill; (iv) el repo no vive bajo tmpdir y el binding se asigna UNA vez, desde el retorno de `mkdtempSync` (verificado: ninguna otra asignación en el archivo). Borrar el repo o un tmpdir amplio es imposible con los valores que este código puede producir. `force:true` sólo suprime ENOENT.

## 4. Intactos (encargo 4)

Gate, registry (`e8a7f0c4…` recomputado ×2), suite hermana, `gates-manifest`, roadmap (`271ea1e0…` ×2) y los 7 dirty preexistentes: **byte-idénticos** — los 7 hashes del §8 del informe coinciden con mis propias mediciones de las rondas anteriores (`afede1ef…`, `3b7f906f…`, `281d0792…`, `5a86b12a…`, `6b20d272…`, `26377906…`) y con el porcelain de 8 líneas exactas. Staged 0. `git diff --check` limpio. Residuos: 0.

## 5. Contraste de evidencia (encargo 5)

- **Conteos estáticos re-medidos por mí:** reanchor = 6 tests (directo 6/6 ✓, además re-corrido por mí); hermana `index.test.mjs` = **16** tests (16/16 ✓); `app-ds-hook-contract-gate/index.test.mjs` = **60** tests → cohorte 6+60 = **66** (66/66 ×3 ✓).
- **Ambos `export-*` verdes:** consistente en las tres piernas del informe — A-3 ×3 sin una sola alternancia, y A-5 SIN `app-ds-hook-contract-gate` entre los fallos. Es la Corrección 2 del brief confirmada en vivo, reportada como corrida y no como hecho asentado — exactamente la disciplina exigida.
- **Aritmética de pierna 1 coherente al dígito:** T-1a dio 1719/1705/**13**/1 (12 fijas + el slot del par); T-1b da 1719/**1706**/**12**/1 — mismo total, mismo skip, +1 pass y −1 fail = el slot del par muerto. Los **12 nombres** son exactamente las 12 fijas de mi postaudit T-1a (`ck-h1-floor-identity` ×3, `ck-h1-inert-prestep` ×2, `skin-evidence-gate`, `token-audit.runtime-svg`, `cra-15-runtime-hardening`, `generate-semantic-icons`, `surface-capability-census`, `core-structure-audit` ×2). Ningún cambio no explicado.
- **gates:ci:** log durable de 8830 líneas terminando en `ci-gates OK — 89 blocking gate(s) passed`, EXIT 0, bajo Node 22 — verificado el archivo; no re-corrido (prohibido y con log completo).
- **D-5/D-7 del informe** (omisión cambia el veredicto; fence bidireccional) son consistentes con lo que yo mismo verifiqué en fuente en el preaudit (lock soft-fail `existsSync ? read : ''`; conteo/symlinks), y con la forma standalone declarada.

## 6. Único cambio semántico (encargo 6)

Probado byte a byte: **relocalización del corpus/planta + cercas (fence del before, guard del after, 3 asserts D-4) + comentarios**. Ni un nombre de test, ni una aserción preexistente, ni un byte del resto del archivo.

## 7. R-1 (encargo 7)

T-1b deja el re-anclaje **habilitado y NO ejecutado** — correcto en el informe (una sola corrida diagnóstica, S-K "no aplica todavía", cero bendición de los 12 rojos) y así lo asiento: **este postaudit tampoco declara re-anclado nada**. El re-anclaje formal es de Codex, con las dos corridas nominalmente idénticas por nombre, la declaración ex ante (ambos `export-*` verdes), la regla de fallo (§11.3 del brief), y la nota N-1 de mi postaudit T-1a (nombrar los +2 tests y el skip). Recién ese asiento supersede el literal `1717/13`, sin editar briefs históricos.

## 8. DESVIACIÓN ADJUDICADA — backup por `git show`: **(a) defecto procesal NO material, con nota vinculante ESCALADA**

Hechos: la orden exigía backup por `cp` del worktree; el writer generó el backup con `git show HEAD:<path>` hacia `/private/tmp`, lo declaró él mismo, y es la **segunda vez** (O-2 de mi postaudit T-1a ya lo marcó y pidió la forma canónica). Materialidad: **nula en este caso concreto y probada, no supuesta** — el target estaba limpio al abrir (prehash pinneado por el encargo = blob de HEAD = worktree pre-write, los tres iguales, recomputados por mí), el backup re-hasheado da exactamente el prehash, el restore jamás se ejercitó, y la prohibición con dientes (`git show HEAD:path > path` como RESTORE al repo) no se violó. La desviación no oculta ningún defecto de código: el código fue auditado con independencia total del método de backup. **No se inventa reparación retroactiva** (prohibida e innecesaria).

**Nota vinculante V-1 (escalada por reincidencia):** a partir del próximo tranche, "backup = `cp` del worktree, verificado contra el prehash" se escribe como **stop condition** en el brief (no como nota), y una **tercera** ocurrencia es por sí sola materia de REJECT procesal. La razón de fondo queda escrita: el blob de HEAD y el worktree sólo coinciden cuando la precondición de limpieza ya pasó — un backup por `git show` sobre un target sucio restauraría al estado equivocado, que es exactamente la clase del incidente 2026-02-05.

## 9. Notas no bloqueantes

- **O-A** El §2 del informe cita headers de hunk `-U0` mientras el patch durable es `-U3` (4 hunks) — misma sustancia, dos presentaciones; el hecho vinculante es PATCH == DIFF VIVO, probado. (Eco del O-1 de T-1a; conviene unificar la presentación en futuros memos.)
- **O-B** El pseudo-código del brief (`findPackageRoot(HERE)/..`) quedaba un nivel corto del repo real; la implementación (`findRepoRoot(HERE)`) es la forma correcta y fail-closed, y la desviación fue documentada, no escondida. Adjudicada como mejora.
- **O-C** T-1b limpia su sandbox (guard del after) y T-1a deja los suyos al sistema — cada uno conforme a SU brief; no es inconsistencia a reparar.

---

## Cierre

- HEAD sin mover · staged 0 · porcelain = 7 preexistentes byte-idénticos + el target T-1b con posthash `39d65b6e…82a3c` · roadmap `271ea1e0…` intacto · 0 residuos · registry intacto — todo re-medido al cierre, después de mi corrida focal.
- Cero writes al repo; cero pedido de commit; Kimi fuera de la cadena.

# VERDICT FINAL: ACCEPT

El aislamiento pre-K4 queda postauditado y **aceptado**: el diff real satisface el brief, la cerca es fail-closed en ambos sentidos, no hay escape ni false-green (atacados y sostenidos, con evidencia de primera mano), el cleanup no puede degenerar en un borrado amplio, los 12 fallos restantes son exactamente las 12 fijas nominales, y el camino al re-anclaje R-1 queda habilitado — **no ejecutado** — para Codex. La desviación del backup queda adjudicada en (a) con la nota vinculante V-1. El sellado (commit) es decisión del DT; este memo no lo ejecuta ni lo solicita.
