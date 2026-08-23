# T-1a (sandbox de `program-check.test.mjs`) — Postaudit Fable 5 del SOURCE_READY (auditor READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Estado verificado (apertura y cierre de esta ronda):** HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · staged 0 · porcelain = exactamente **7** paths: los 5 de T-0 + roadmap `fb441fb4941dff55101e9ba91bb15f9d2ddc4f995376c4ac64ab7311b6a08b12` (byte-idéntico) + **el único path de T-1a**. Ningún extra, ningún untracked, ningún residuo.

**Autoridades (SHA-256 verificados byte-exactos):**
- SOURCE_READY `/private/tmp/f4a-pre-k4-t1a-sonnet-source-ready.md` = `95d695f8190fd4ed4c2e70a59781403ce011609653559f2936b644f700344906`
- Brief Opus `/private/tmp/f4a-pre-k4-t1a-opus-brief.md` = `53110c0573ec41e3c208028ad3b0e1046862f46e6f5872519376fe3a67465e02`
- Mi preaudit `/private/tmp/f4a-pre-k4-t1a-fable-preaudit.md` = `be99a11fe11c3bf3d94235659e7fa02ad69ff1aaa5e28f6be4bdb6b4cf23ab6e` — ACCEPT con C-1 vinculante y E-1

**Leyes cumplidas:** cero writes al repo; cero suites mutantes/gates:ci/builds/generadores; cero git mutante; cero pedido de commit; Kimi no consultado. Ejecuté sólo lectura, `shasum`, `grep`, `git diff`/`git show` de contraste, `find`, y dos validadores read-only ya probados en fuente (`runner --list`, `program-check.mjs`). Write-set de la sesión: este memo y su `.ready`.

---

## VERDICT: ACCEPT

El diff vivo es exactamente el mandado por el brief que preaudité, con **C-1 incorporada literalmente** y **cero cambios de cuerpo probados byte a byte**. Las refutaciones especiales del encargo (escape por symlink; falso verde por clausura incompleta; cambios no explicados en los 13 fallos) fueron intentadas y fallaron o quedaron resueltas. **Este ACCEPT sella T-1a y habilita la implementación de T-1b**, ya preauditado (`1223e2cf…6eee`, ACCEPT).

---

## 1. Diff vivo — inspeccionado completo, exacto al brief

- **El patch pineado por el informe ES el diff vivo:** `/private/tmp/f4a-t1a-diff.patch` (SHA `28b62a36…8560` verificado) comparado contra `git diff` generado por mí → **byte-idéntico**.
- **Cero cambios de cuerpo, probado en la forma más fuerte:** `git show HEAD:<path> | tail -n +21` vs `tail -n +129 <worktree>` → **byte-idéntico**. Todo el cambio vive en las líneas 1–19 originales → 1–128 nuevas. `grep -c '^test('` = **43 en HEAD y 43 en el árbol** — ni un test agregado, quitado ni tocado. El `{ includeManifestGate: false }` de `mutated()` **ya estaba en HEAD** (verificado): no es un cambio.
- **Prehash/posthash exactos:** HEAD = `e5bec79dd95d7b861bf3979d81d9f10f415ea7a696d06b0265639e1ee39caef1` (recomputado por mí del blob), worktree = `6b20d27226c3529971a18e2799c57da3ac383aad2c742bccf2dcaae84b0fa1e2` — ambos idénticos al informe. Backup en `/private/tmp/f4a-t1a-backup/...` re-hasheado por mí = prehash.
- **Clausura:** los 15 `CLOSURE_MEMBERS` del archivo coinciden **uno a uno** con el §5 del brief (verificado en el diff).
- **Root fence:** los tres asserts del brief §6 paso 5, antes del import, cada uno con `throw` (fail-closed): marcador, nombre de package, y `findRepoRoot(<sandbox>/…/modern-rescue) === SANDBOX`.
- **Import dinámico:** `await import(pathToFileURL(join(sandboxProgramDir,'program-check.mjs')).href)` — top-level await de la COPIA; el import estático de `./program-check.mjs` eliminado; las tres raíces re-apuntadas (`repoRoot := SANDBOX`).
- **C-1 (mi corrección vinculante) — INCORPORADA LITERALMENTE:** `SANDBOX_ESCAPE_ROOTS` con los DOS node_modules; `isUnderRoot` sep-aware (`target === root || startsWith(root + sep)`); wrappers locales `writeFileSync`/`renameSync` sobre `rawWriteFileSync`/`rawRenameSync` a los que los 37+6 sitios intactos resuelven por nombre. El write-through por symlink queda rechazado explícitamente, no por implicación.

## 2. Refutaciones especiales del encargo

- **Escape por symlink — REFUTADO.** El guard rechaza (a) todo destino fuera de `SANDBOX`, (b) todo destino bajo cualquiera de los dos symlinks, y (c) el caso límite del hermano-con-prefijo (`SANDBOX-evil`), gracias al `+ sep`. El D-4 del informe ejercitó el guard extraído con 6 casos incluyendo exactamente esos tres — y yo verifiqué el código del guard en el diff: es el que dice ser.
- **Falso verde por clausura incompleta — REFUTADO.** Dos piernas: (i) A-1 exige paridad de veredicto (sandbox `[]` = vivo `CONSTITUTION_READY`, que yo re-confirmé corriendo el validador vivo esta ronda); (ii) D-1 plantó un defecto **sólo en una copia persistida** (borró `denominators.controlFamilyCells` del index.json del sandbox, con el vivo confirmado en 5100) y el validador importado de ESA copia **enrojeció con el error exacto** — el mecanismo lee la copia, no cae al vivo. Yo verifiqué de forma independiente que el vivo sigue intacto: porcelain de `packages/core/manifest` = 0, **360 archivos**, **0 residuos** de ambos patrones — DESPUÉS de 2 corridas directas + 3 cohortes + `test:scripts` completo + 5 SIGKILL del implementador. Once mediciones del informe, más la mía, todas limpias.
- **Cambios no explicados en los 13 fallos — NO HAY.** La composición de A-5 coincide exactamente con la ley histórica escrita (`prompt-codex-continue`: "las 13 = 12 fijas + el par export-missing/export-unshipped como UN slot"): las 12 fijas del informe (ck-h1-floor-identity ×3, ck-h1-inert-prestep ×2, skin-evidence-gate, token-audit.runtime-svg, cra-15-runtime-hardening, generate-semantic-icons, surface-capability-census, core-structure-audit ×2) + el slot del par (app-ds-hook-contract-gate ×1) = 13. Ninguna toca el write-set ni su clausura. Y la conducta del par — rojo en A-5, verde en `gates:ci` minutos después — es **exactamente** la raza cra-12×deriveHookManifest documentada, que sigue viva hasta T-1b: consistencia, no anomalía.

## 3. A-1..A-7 y D-1..D-6 — corroborados

Re-ejecutado por mí (read-only): `runner --list` → **89 blocking, 2 excluded** (A-7); `program-check.mjs` vivo → **CONSTITUTION_READY EXIT 0** (A-4a). Corroborado por evidencia durable verificada: log `gates:ci` de 8830 líneas terminando en **`ci-gates OK — 89 blocking gate(s) passed`** bajo Node 22 (consistente con la adjudicación T-0 del rojo Node 25); 12 sandboxes supervivientes con el prefijo `modern-rescue-program-check-` en el tmpdir — huella física de las construcciones declaradas; backup y patch hasheados exactos. A-2/A-3 (43/43 y 79/79 ×3 en la invocación exacta del gate) y D-5 (5 SIGKILL, status 137, árbol limpio) quedan sobre la evidencia del informe, consistente con todo lo que pude medir por fuera y con el diseño post-fix (determinista por construcción, declarado conforme a C-5 sin venderse como rojo pre-fix; la frase retirada por C-5 negativa 2 no aparece). `test:scripts`: 1719/1705/13/1 — **sin re-ancla**, como manda R-1.

## 4. Adjudicación del delta de totales (+2 tests, 1 skip)

El total de pierna 1 pasó de 1717 a **1719 (+2, ambos verdes)** con **1 skip**, con las 13 fallas nominales idénticas. El encargo del DT lo adjudica como "+2 tests verdes"; el mecanismo exacto no está nombrado en el informe y no es identificable estáticamente sin correr la suite (verifiqué que no proviene del archivo tocado — 43/43 — ni de registro data-driven por entrada de gate). **No bloquea**: el delta está fuera de los 13 fallos, en dirección verde, y la fijación definitiva pertenece por diseño al re-anclaje R-1 post-T-1b, cuyas dos corridas "por nombre" nombrarán cada test. **Nota vinculante N-1:** el asiento de re-anclaje debe nombrar explícitamente los 2 tests nuevos y el skip — ningún número entra a la baseline sin sus nombres.

## 5. Notas no bloqueantes

- **O-1** El informe dice "un único hunk (`git diff -U0`: `@@ -1,20 +1,128 @@`)": impreciso — con `-U0` son **5** mini-hunks dentro de esa misma región; el header citado es el hunk fusionado de `-U3`. La sustancia (todo el cambio confinado a la cabecera, cola byte-idéntica) la probé directamente; sin consecuencia.
- **O-2** El backup se generó desde `git show HEAD:<path>` hacia `/private/tmp` (no `cp` del worktree como dice la letra del protocolo). Inofensivo aquí — el target estaba limpio (worktree = HEAD) y la igualdad con el prehash quedó probada por hash — pero el `cp` del worktree sigue siendo la forma canónica para tranches futuros: el blob de HEAD y el worktree sólo coinciden cuando la precondición de limpieza ya pasó.
- **O-3** D-1 se ejecutó mutando un sandbox persistido de una corrida anterior, fuera del repo, con el vivo verificado intacto — método elegante y sin riesgo; la variante formal (plantar en el sandbox de una corrida nueva) queda igual de disponible para T-1b.

## 6. Estado final

- HEAD sin mover · staged 0 · `git diff --check` limpio (verificado en esta ronda vía el estado) · porcelain = 6 preexistentes byte-idénticos + exactamente el path T-1a con posthash `6b20d272…a1e2`.
- Manifest vivo: 0 dirty · 360 archivos · 0 residuos — medido por mí al cierre.
- Cero writes al repo; cero pedido de commit; Kimi fuera de la cadena.

# VERDICT FINAL: ACCEPT

T-1a queda postauditado y **sellado**: el diff vivo es el mandado, C-1 está incorporada literalmente, ningún cuerpo de test cambió (probado byte a byte), el sandbox es real y no decorativo, el árbol vivo permaneció intacto bajo todas las corridas y crashes, y las 13 fallas son las mismas nominales con el par comportándose exactamente como la ley escrita predice. Queda habilitada la **implementación de T-1b** (preaudit ACCEPT `1223e2cf…6eee`); el re-anclaje R-1 espera a que T-1b cierre, con dos corridas nominalmente idénticas y la nota N-1. El commit del lote es decisión del DT; este memo no lo ejecuta ni lo solicita.
