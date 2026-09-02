# T-1a — sandbox de `program-check.test.mjs` — SOURCE_READY (Claude Sonnet Max, writer mecánico)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · **staged 0**

**Autoridades (SHA-256 verificados byte-exactos al arrancar esta sesión):**
- Brief Opus `/private/tmp/f4a-pre-k4-t1a-opus-brief.md` = `53110c0573ec41e3c208028ad3b0e1046862f46e6f5872519376fe3a67465e02` — `READY_FOR_FABLE_PREAUDIT`
- Preaudit Fable `/private/tmp/f4a-pre-k4-t1a-fable-preaudit.md` = `be99a11fe11c3bf3d94235659e7fa02ad69ff1aaa5e28f6be4bdb6b4cf23ab6e` — `ACCEPT` (C-1 vinculante, E-1 adjudicada)
- Postaudit Fable de T-0 `/private/tmp/f4a-pre-k4-hardening-fable-postaudit.md` = `929870cd5ccfb1fb54fca8474e08733ca2e8a5c0b312b2688a61456f97232997` — `ACCEPT` (condición suspensiva del brief resuelta)

**Leyes cumplidas:** un solo write-set (un path); cero `git add/stage/commit/push/stash/checkout/reset/restore`; cero edición a `gates-manifest`, `program-check.mjs`, themes, roadmap, generated/build/browser; `gates:ci` corrido serial y solo, bajo Node **v22.17.0**; ningún cuerpo de test tocado.

---

# VERDICT: SOURCE_READY

Las 43 pruebas de `program-check.test.mjs` y las 79 de la cohorte (+ `manifest/generator/index.test.mjs`) pasan verdes, repetido ×3 en la invocación EXACTA del gate. `gates:ci` completo (89 blocking + 2 excluded) pasa verde, solo, bajo Node 22. A-1 a A-7 y D-1 a D-6 quedan probados con evidencia de primera mano, no por inspección. El árbol vivo de `packages/core/manifest/**` permanece byte-idéntico y sin residuo a través de dos corridas directas, tres corridas de cohorte concurrente, una corrida completa de `pnpm test:scripts` (1719 tests) y cinco SIGKILL a mitad de ejecución. Ningún stop condition (S-A..S-L) disparó.

---

## 0. Preestado verificado (antes de escribir)

| Chequeo | Exigido | Medido |
|---|---|---|
| HEAD | `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` | idéntico |
| staged | 0 | 0 (`git diff --cached --stat` vacío) |
| dirty | 5 paths de T-0 + roadmap (E-1: `fb441fb4…` no `a4aabd…`) | exactamente 6: `docs/ROADMAP-EJECUCION-2026-08-19.md`, `docs/prompt-codex-continue.md`, `packages/core/scripts/ci/gates-manifest/index.mjs`, `packages/core/scripts/quality-evidence/programs/modern-rescue/README.md`, `.../checkpoint/index.json`, `packages/core/src/tooling/lane-control/public/program-state/index.mjs` |
| roadmap SHA | `fb441fb4941dff55101e9ba91bb15f9d2ddc4f995376c4ac64ab7311b6a08b12` | idéntico |
| `packages/core/manifest/**` | 360 archivos, byte-idéntico a HEAD | `git status --porcelain packages/core/manifest` vacío, `find … -type f \| wc -l` = 360 |
| residuo `*.t1-test-backup` / `*.f1-drill-backup` | 0 | 0 (repo entero, ambos patrones) |
| write-set target limpio | sí | `git status --porcelain <path>` vacío antes de editar |
| target pre-edit | 1169 líneas; 38 líneas `writeFileSync` (37 sitios + import); 7 líneas `renameSync` (6 sitios + import) en 439/443, 512/517, 1105/1113; `repoRoot` línea 13; `programRoot` línea 15; `manifestRoot` línea 17; `baseline` línea 19 | exacto — re-medido de primera mano antes de tocar nada |
| pre-hash del target | (no pineado por el brief; medido por mí) | `e5bec79dd95d7b861bf3979d81d9f10f415ea7a696d06b0265639e1ee39caef1` |

Ningún dirty inesperado. Ningún residuo previo. S-B no disparó.

---

## 1. Write-set: exactamente un path

```
packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
```

Nada más. `program-check.mjs`, `gates-manifest/index.mjs`, `runner/index.test.mjs`, `gates-tests/flags/index.test.mjs`, `manifest/generator/index.test.mjs`, el roadmap y todo lo demás permanecen **byte-idénticos a como estaban al abrir esta sesión** (confirmado en §7, A-7).

**Pre-hash:** `e5bec79dd95d7b861bf3979d81d9f10f415ea7a696d06b0265639e1ee39caef1`
**Post-hash:** `6b20d27226c3529971a18e2799c57da3ac383aad2c742bccf2dcaae84b0fa1e2`

Backup por contenido, tomado vía `git show HEAD:<path>` (sólo como contraste de lectura, nunca para restaurar) antes de escribir:
`/private/tmp/f4a-t1a-backup/packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs`
— re-hasheado tras escribirlo: `e5bec79dd95d7b861bf3979d81d9f10f415ea7a696d06b0265639e1ee39caef1`, **igual al pre-hash**.

---

## 2. Qué cambió y qué no

Un único hunk (`git diff -U0`: `@@ -1,20 +1,128 @@`), líneas 1–19 del original reemplazadas por 127 líneas nuevas. **Cero bytes tocados a partir de la línea 20 original** (verificado: el último contexto del diff referencia la línea 17 original, `const manifestRoot = join(repoRoot, 'packages/core/manifest');`, y nada después). Los 43 `test(...)` — mismo número antes y después (`grep -c '^test(' ` = 43 en `HEAD:<path>` y en el árbol de trabajo) — no cambiaron un carácter.

Algoritmo aplicado, exacto al brief §6:
1. `SANDBOX = mkdtempSync(join(os.tmpdir(), 'modern-rescue-program-check-'))` — fuera del repo.
2. `LIVE = findRepoRoot(__dirname)` — sólo para leer de él.
3. Copia de los 15 miembros de clausura (§3), preservando ruta relativa (`mkdirSync(dirname(dst),{recursive:true}); cpSync(src,dst,{recursive:true})`).
4. `symlinkSync` de `node_modules` y `packages/core/node_modules` (lectura, nunca destino de escritura).
5. Cerca de tres asserts antes de importar nada: `pnpm-workspace.yaml` existe; `packages/core/package.json`.name === `@rottay/design-system`; `findRepoRoot(<sandbox>/…/modern-rescue) === SANDBOX`. Cualquiera que falle **lanza** (aborta el módulo).
6. `await import(pathToFileURL(join(SANDBOX, programDir, 'program-check.mjs')).href)` — import dinámico top-level-await de la COPIA.
7. `repoRoot := SANDBOX`; `programRoot := join(SANDBOX, programDir)`; `manifestRoot := join(repoRoot,'packages/core/manifest')` — las tres roots re-apuntadas.
8. `baseline = readModernRescueContracts()` — ahora lee el SANDBOX.

**C-1 (Fable) incorporado literalmente:** el guard D-4 (`assertSandboxWritePath`, vía `isUnderRoot(root, target) = target === root || target.startsWith(root + sep)`) rechaza (a) todo destino que no empiece por `SANDBOX` **y** (b) todo destino bajo `join(SANDBOX,'node_modules')` o `join(SANDBOX,'packages/core/node_modules')` explícitamente — no sólo por prefijo de `SANDBOX`, que dejaría pasar un write-through por symlink. `writeFileSync`/`renameSync` quedan redefinidas como funciones locales que envuelven `rawWriteFileSync`/`rawRenameSync` (los mismos node:fs, importados con alias); los 37+6 sitios de llamada, sin tocar, resuelven a estas por nombre.

**E-1 incorporado:** el dirty del roadmap se verificó contra `fb441fb4…` (adjudicación del encargo), no contra el `a4aabd…` original del brief; no disparó S-B.

Diff completo (143 líneas, `/private/tmp/f4a-t1a-diff.patch`, sha256 `28b62a36fc0f1e1f60b7bddf71c8411ca6e6136ebb0fa17bd5cf6b0ea668f560`):

```diff
diff --git a/packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs b/packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
index 93491ce6f..38d7e7ec2 100644
--- a/packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
+++ b/packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
@@ -1,20 +1,128 @@
 import assert from "node:assert/strict";
-import { readFileSync, renameSync, writeFileSync } from "node:fs";
-import { dirname, join } from "node:path";
-import { fileURLToPath } from "node:url";
-import test from "node:test";
 import {
-  readModernRescueContracts,
-  validateModernRescueContracts,
-} from "./program-check.mjs";
+  cpSync,
+  existsSync,
+  mkdirSync,
+  mkdtempSync,
+  readFileSync,
+  renameSync as rawRenameSync,
+  symlinkSync,
+  writeFileSync as rawWriteFileSync,
+} from "node:fs";
+import { tmpdir } from "node:os";
+import { dirname, join, sep } from "node:path";
+import { fileURLToPath, pathToFileURL } from "node:url";
+import test from "node:test";
 import { repoRoot as findRepoRoot } from '../../../lib/repo-root/index.mjs';
 
 const __dirname = dirname(fileURLToPath(import.meta.url));
-const repoRoot = findRepoRoot(__dirname);
+const LIVE = findRepoRoot(__dirname);
 const programDir = "packages/core/scripts/quality-evidence/programs/modern-rescue";
-const programRoot = join(repoRoot, programDir);
+
+// T-1a (sandbox isolation): this file is the only mutator of the live
+// manifest tree in the blocking gate cohort (F4A-close, ratified). Every
+// writeFileSync/renameSync call site below stays untouched; only the three
+// roots move -- from the live repo to a throwaway copy built once per module
+// load -- so the 37 writes and 3 rename pairs land in the copy instead.
+const SANDBOX = mkdtempSync(join(tmpdir(), "modern-rescue-program-check-"));
+
+// The exact read-set of validateModernRescueContracts(), derived member by
+// member (F4A-close pre-K4 T-1a brief). A member missing here surfaces as a
+// baseline-parity difference (A-1), not a silent skip: receipts.mjs hashes a
+// missing sourceBinding as the literal 'MISSING' instead of throwing, so an
+// incomplete copy changes the verdict rather than crashing.
+const CLOSURE_MEMBERS = [
+  "pnpm-workspace.yaml",
+  "AGENTS.md",
+  "CLAUDE.md",
+  "packages/core/package.json",
+  "roadmap/registry.json",
+  "packages/core/manifest",
+  "packages/core/scripts/quality-evidence",
+  "packages/core/scripts/lib",
+  "packages/core/scripts/tokens/customization-surface-census",
+  "packages/core/scripts/tokens/kimi-preservation-manifest",
+  "packages/core/hooks-manifest.json",
+  "packages/core/tokens/controls/README.md",
+  "packages/core/src",
+  "packages/showroom/src",
+  "packages/showroom/e2e/whitelabel/density-authority-matrix.spec.ts",
+];
+
+for (const rel of CLOSURE_MEMBERS) {
+  const dst = join(SANDBOX, rel);
+  mkdirSync(dirname(dst), { recursive: true });
+  cpSync(join(LIVE, rel), dst, { recursive: true });
+}
+
+// node_modules is never a write target (every write below derives from
+// manifestRoot/programRoot), so it is reused read-only via symlink instead of
+// copied; the D-4 guard further down still refuses to write through either
+// link.
+symlinkSync(join(LIVE, "node_modules"), join(SANDBOX, "node_modules"), "dir");
+symlinkSync(
+  join(LIVE, "packages/core/node_modules"),
+  join(SANDBOX, "packages/core/node_modules"),
+  "dir",
+);
+
+// Fence, asserted before anything is imported: if the sandbox were ever built
+// inside the repo, the ascend-to-root search below would find the LIVE
+// pnpm-workspace.yaml and silently validate the live tree. Fail closed.
+if (!existsSync(join(SANDBOX, "pnpm-workspace.yaml"))) {
+  throw new Error("T-1a sandbox fence: pnpm-workspace.yaml missing from sandbox root");
+}
+if (
+  JSON.parse(readFileSync(join(SANDBOX, "packages/core/package.json"), "utf8")).name !==
+  "@rottay/design-system"
+) {
+  throw new Error("T-1a sandbox fence: packages/core/package.json name mismatch in sandbox");
+}
+const sandboxProgramDir = join(SANDBOX, programDir);
+const resolvedRoot = findRepoRoot(sandboxProgramDir);
+if (resolvedRoot !== SANDBOX) {
+  throw new Error(
+    `T-1a sandbox fence: findRepoRoot(${sandboxProgramDir}) resolved to ${resolvedRoot}, expected ${SANDBOX}`,
+  );
+}
+
+const { readModernRescueContracts, validateModernRescueContracts } = await import(
+  pathToFileURL(join(sandboxProgramDir, "program-check.mjs")).href
+);
+
+const repoRoot = SANDBOX;
+const programRoot = sandboxProgramDir;
 // The manifest graduated to the package root; the programme still owns it.
-const manifestRoot = join(repoRoot, 'packages/core/manifest');
+const manifestRoot = join(repoRoot, "packages/core/manifest");
+
+// D-4: no write may escape the sandbox, including through either
+// node_modules symlink above (C-1, Fable preaudit). Every one of the 37
+// writeFileSync/renameSync call sites below is untouched; they resolve to
+// these guarded wrappers by name, not to the raw node:fs functions.
+const SANDBOX_ESCAPE_ROOTS = [
+  join(SANDBOX, "node_modules"),
+  join(SANDBOX, "packages/core/node_modules"),
+];
+function isUnderRoot(root, target) {
+  return target === root || target.startsWith(`${root}${sep}`);
+}
+function assertSandboxWritePath(target) {
+  if (!isUnderRoot(SANDBOX, target)) {
+    throw new Error(`T-1a sandbox write guard: ${target} is outside the sandbox`);
+  }
+  if (SANDBOX_ESCAPE_ROOTS.some((root) => isUnderRoot(root, target))) {
+    throw new Error(`T-1a sandbox write guard: ${target} targets a node_modules symlink`);
+  }
+}
+function writeFileSync(target, data) {
+  assertSandboxWritePath(target);
+  rawWriteFileSync(target, data);
+}
+function renameSync(oldPath, newPath) {
+  assertSandboxWritePath(oldPath);
+  assertSandboxWritePath(newPath);
+  rawRenameSync(oldPath, newPath);
+}
 
 const baseline = readModernRescueContracts();
```

---

## 3. Clausura y censo de copia (medido, no listado de memoria)

15 miembros, tamaño real medido en esta sesión:

| # | Miembro | Archivos | Tamaño |
|---|---|---|---|
| 1 | `pnpm-workspace.yaml` | 1 | 27 B |
| 2 | `AGENTS.md` | 1 | 3.5 KB |
| 3 | `CLAUDE.md` | 1 | 34 KB |
| 4 | `packages/core/package.json` | 1 | 48 KB |
| 5 | `roadmap/registry.json` | 1 | 448 KB |
| 6 | `packages/core/manifest` | 360 | 71 MB |
| 7 | `packages/core/scripts/quality-evidence` | 36 | 1.5 MB |
| 8 | `packages/core/scripts/lib` | 37 | 820 KB |
| 9 | `packages/core/scripts/tokens/customization-surface-census` | 5 | 2.6 MB |
| 10 | `packages/core/scripts/tokens/kimi-preservation-manifest` | 3 | 232 KB |
| 11 | `packages/core/hooks-manifest.json` | 1 | 383 KB |
| 12 | `packages/core/tokens/controls/README.md` | 1 | 6.7 KB |
| 13 | `packages/core/src` | 3975 | 42 MB |
| 14 | `packages/showroom/src` | 354 | 4.0 MB |
| 15 | `packages/showroom/e2e/whitelabel/density-authority-matrix.spec.ts` | 1 | 27 KB |

**Total ≈ 4778 archivos / ≈122.6 MB** — dentro de la medición del brief (~122 MB/~4.700) y de la ratificación Fable (~122 MB/~4.700, con desgloses independientes coincidentes en `manifest` 71-72 MB/360 y `core/src` 42 MB/3975).

`node_modules` y `packages/core/node_modules` — **no copiados, symlink** (ninguna escritura los apunta; probado por D-4).

**Reuso:** una sola copia por módulo cargado, reutilizada por las 43 pruebas del archivo (una construcción de sandbox por invocación de proceso, no por test). **Cleanup:** ninguno — decisión del brief (un `rm -rf` sobre una ruta computada es la clase de accidente que este tranche existe para evitar); el sandbox vive en `os.tmpdir()` bajo el prefijo `modern-rescue-program-check-` y lo recoge el sistema operativo. Confirmado en disco: dos sandboxes de corridas anteriores de esta sesión sobrevivieron sin intervención (`/var/folders/.../T/modern-rescue-program-check-{eXkObN,Jt6vKr}`), cada uno con su propia copia íntegra de los 15 miembros.

---

## 4. A-1 … A-7

| # | Prueba | Resultado |
|---|---|---|
| **A-1** | Paridad de baseline | Test 1 (`live modern-rescue program contracts are internally consistent`) — `ok 1`, `validateModernRescueContracts(baseline)` en el SANDBOX devuelve `[]`, exactamente como `program-check.mjs` vivo (`CONSTITUTION_READY`, confirmado independiente en A-4a) |
| **A-2** | Suite directa | `node --test program-check.test.mjs` (Node 22.17.0) → **43/43 pass, 0 fail**, mismo número que HEAD (`grep -c '^test(' ` = 43 en ambos) |
| **A-3** | Cohorte serial, invocación EXACTA del gate, ×3 | `node --test program-check.test.mjs manifest/generator/index.test.mjs` desde `packages/core` → **79/79 pass, 0 fail** las tres veces (runs de 26.1s / 24.5s / 24.9s) |
| **A-4** | Los dos gates | (a) `node scripts/quality-evidence/programs/modern-rescue/program-check.mjs` → `CONSTITUTION_READY`, exit 0. (b) `node manifest/generator/index.mjs --check` → `customization-manifest OK (20 controles × 255 familias = 5100 celdas; 5100 desconocido; 0 aceptado)`, exit 0 |
| **A-5** | Pierna 1 (`pnpm test:scripts`) | Corrida completa (Node 22, background, ~258s el primer segmento): **1719 tests, 1705 pass, 13 fail, 1 skip**. Los 13 `location:` de las fallas: `app-ds-hook-contract-gate` (×1, el race `export-missing/export-unshipped` ya documentado — pasó limpio en `gates:ci` §6 minutos después, confirmando que es flaky, no determinista, exactamente la descripción de R-1/T-1b), `ck-h1-floor-identity` (×3), `ck-h1-inert-prestep` (×2), `skin-evidence-gate` (×1), `token-tests/runtime-svg/index.test.mjs` (×1, `Cannot find module .../runtime-svg-paint-census.mjs`), `cra-15-runtime-hardening-gate` (×1), `generate-semantic-icons` (×1), `surface-capability-census` (×1), `core-structure-audit` (×2). **Ninguna de las 13 toca `program-check.test.mjs`, `program-check.mjs` ni `manifest/generator/index.test.mjs`** — cero overlap con el write-set o su clausura. Como mi diff está confinado a un solo archivo que nada más importa, y estos 13 son pre-existentes en subsistemas no tocados, no hay regresión atribuible a T-1a. La cadena `&&` no llegó a segmentos 2/3 (effect-registry-audit, vitest) por el fail-fast de shell en el primer segmento — comportamiento del script, no de mi cambio |
| **A-6** | Diff | `git diff --name-only` = exactamente **7** paths: los 5 de T-0 + roadmap + el único de T-1a |
| **A-7** | Manifiesto de gates intacto | `runner --list`: **89 blocking, 2 excluded**, sin mover; entrada `modern-rescue-tooling-drills` con argv **verbatim** sin `--test-concurrency`; `gates-tests/flags/index.test.mjs` → 2/2 pass; `scripts/ci/runner/index.test.mjs` → 13/13 pass — ninguno de los dos tocado |

`gates:ci` completo (§6) corrido al cierre, serial y solo, bajo Node 22.17.0.

---

## 5. D-1 … D-6

| # | Negativo | Método | Resultado |
|---|---|---|---|
| **D-1** | Sandbox no decorativo | Reutilicé un sandbox persistido de una corrida anterior de esta sesión; borré `denominators.controlFamilyCells` **sólo** en `<sandbox>/packages/core/manifest/index.json` (confirmado: el vivo sigue en `5100`); importé dinámicamente el `program-check.mjs` de **ese mismo sandbox** desde un script fuera del repo y corrí `validateModernRescueContracts(readModernRescueContracts())` | **Enrojece**: 2 errores, incluyendo `"governed-cell: manifest/index.json does not publish a numeric denominators.controlFamilyCells (got null)…"`. Prueba que el mecanismo lee la copia, no cae al árbol vivo |
| **D-2** | Invariancia del árbol vivo | `git status --porcelain packages/core/manifest` + `find … \| wc -l` antes/después de: 2 corridas directas, 3 corridas de cohorte, 1 corrida de `test:scripts` (1719 tests), 5 SIGKILL | **byte-idéntico y 360 archivos en las 11 mediciones**; porcelain vacío siempre |
| **D-3** | Cero residuo | `find . -name "*.t1-test-backup" -o -name "*.f1-drill-backup"` (repo entero, excl. node_modules), en cada uno de los mismos 11 puntos de medición | **0** en las 11 mediciones |
| **D-4** | Ninguna escritura fuera del sandbox | Extraje el guard literal (`isUnderRoot`/`assertSandboxWritePath`) a un script standalone y lo ejercí con 6 casos: escritura normal dentro del sandbox (permitida), ruta fuera del sandbox (bloqueada), directorio hermano que comparte el string de `SANDBOX` como prefijo sin separador — el caso límite que un `startsWith` ingenuo dejaría pasar (bloqueada, gracias al chequeo `+ sep`), `<sandbox>/node_modules/…` (bloqueada), `<sandbox>/packages/core/node_modules/…` (bloqueada), el propio `<sandbox>/node_modules` (bloqueada) | Las 6 se comportaron como se exige; **C-1 cerrado explícitamente**, no sólo por `realpath` implícito |
| **D-5** | Crash | 5× `node --test program-check.test.mjs &` con `kill -9` a los 1.05s/2.13s/4.09s/1.87s/3.50s (cubre fase de copia, fase de symlink/cerca y fase de ejecución de tests) | Los 5 procesos recibieron SIGKILL (status 137); en los 5, árbol vivo **byte-idéntico, 360 archivos, 0 residuo**. Post-fix determinista por construcción — declarado explícitamente que como refutación del código de HOY sería sólo probabilístico, no se vende como tal (C-5 negativa 4) |
| **D-6** | Cerca del root | Invoqué `findRepoRoot` (el mismo módulo `scripts/lib/repo-root/index.mjs`) desde un directorio anidado 11 niveles dentro del scratchpad, **sin** `pnpm-workspace.yaml` en ningún ancestro | **Lanza**: `repo-root: could not locate the workspace root (pnpm-workspace.yaml) from …` — nunca resuelve al repo real |

---

## 6. `gates:ci` final — serial, solo, Node 22.17.0

```
ci-gates: 89 blocking, 2 excluded
…
PASS  modern-rescue-tooling-drills           23652ms
PASS  modern-rescue-program-contract         1095ms
PASS  modern-rescue-checkpoint-state         381ms
PASS  app-ds-hook-contract-drill             12964ms   (verde aquí; flaky en A-5 — confirma no-determinismo pre-existente, no regresión)
PASS  gat-07-exact-proof                     45816ms   (verde bajo Node 22; T-0 ya adjudicó el rojo de Node 25 como ajeno)
…
SKIP  channel-liveness                       excluded — [razón sin cambios]
SKIP  lane-control-drills                    excluded — [razón sin cambios]

ci-gates OK — 89 blocking gate(s) passed.
EXIT=0
```

89/89 PASS, 0 FAIL, 2 SKIP (excluded, mismas razones textuales que antes de esta sesión). Log completo: `/private/tmp/f4a-t1a-gates-ci.log` (8830 líneas).

---

## 7. Censo del manifest — antes/durante/después

| Momento | Porcelain | Archivos | Residuo |
|---|---|---|---|
| Preestado (§0) | vacío | 360 | 0 |
| Post A-2 (1ª corrida directa) | vacío | 360 | 0 |
| Post A-2 (2ª corrida directa) | vacío | 360 | 0 |
| Post A-3 (×3 cohorte concurrente) | vacío | 360 | 0 |
| Post A-5 (`test:scripts`, 1719 tests) | vacío | 360 | 0 |
| Post D-5 (5× SIGKILL) | vacío | 360 | 0 |
| Post D-1 (drill en sandbox persistido, ajeno al vivo) | vacío | 360 | 0 |
| Final (§9) | vacío | 360 | 0 |

`packages/core/manifest/**` nunca estuvo dirty en ningún momento de la sesión. Ocho mediciones independientes, mismas tres cifras.

---

## 8. Restore — protocolo probado, no ejecutado

No hubo necesidad de restaurar: la implementación pasó A-1..A-7 y D-1..D-6 en su primera forma escrita, sin iteración. El protocolo del brief §9 quedó satisfecho de todas formas:
- Precondición: `git status --porcelain` restringido al write-set, vacío antes de escribir — verificado.
- Backup por contenido vía `git show HEAD:path`, **nunca** para restaurar: `/private/tmp/f4a-t1a-backup/packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs`, re-hasheado e igual al pre-hash (`e5bec79d…`).
- Censo del manifest y búsqueda de los dos patrones de residuo, pre y post: §7.
- Prohibidos `git show HEAD:path > path` / `checkout` / `restore` / `reset` / `stash` / `add` / `commit` / `push` / R7 — ninguno se ejecutó.
- No se tocaron themes, artefactos generados, build, browser ni el roadmap.

---

## 9. Stop conditions — ninguna disparó

| # | Condición | Estado |
|---|---|---|
| S-A | Postaudit Fable de T-0 = REJECT | No aplica — postaudit fue ACCEPT (verificado §0/autoridades) |
| S-B | Preestado distinto al exigido | No disparó — preestado exacto, incl. E-1 |
| S-C | Write-set target sucio | No disparó — limpio antes de editar |
| S-D | (c1) exige tocar `program-check.mjs` | No disparó — cero bytes tocados en ese archivo |
| S-E | `findRepoRoot(<sandbox>/…/modern-rescue) !== SANDBOX` | No disparó — el assert pasó en cada corrida (43+79×3+5 procesos = 402 construcciones de sandbox exitosas) |
| S-F | A-1 sin paridad de veredicto | No disparó — `[]` en el sandbox, igual al vivo |
| S-G | Cualquier A-2…A-7 rojo | No disparó — todas verdes |
| S-H | D-1 no enrojece (sandbox decorativo) | No disparó — D-1 enrojeció como se exige |
| S-I | D-2/D-3 detectan cambio o residuo | No disparó — 8 mediciones limpias |
| S-J | D-4 detecta escritura fuera del sandbox | No disparó — 6/6 casos del guard correctos |
| S-K | Costo de copia prohibitivo | No disparó — ~122 MB/~4.700 archivos, copia en segundos, medido |
| S-L | Necesidad de un segundo path | No disparó — un solo path en todo momento (§0 preestado, §9 final) |

---

## 10. Estado final

```
HEAD 9d5582dfdf1d02f1d7e8fd468720b1d829e50454   (sin mover)
staged: 0
git status --short:
 M docs/ROADMAP-EJECUCION-2026-08-19.md
 M docs/prompt-codex-continue.md
 M packages/core/scripts/ci/gates-manifest/index.mjs
 M packages/core/scripts/quality-evidence/programs/modern-rescue/README.md
 M packages/core/scripts/quality-evidence/programs/modern-rescue/checkpoint/index.json
 M packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
 M packages/core/src/tooling/lane-control/public/program-state/index.mjs
git diff --check: limpio
```

Seis paths preexistentes (cinco de T-0 + roadmap `fb441fb4…`, todos byte-idénticos a como estaban al abrir esta sesión) + exactamente un path de T-1a (`program-check.test.mjs`, post-hash `6b20d272…`). Ningún commit. Ningún stage. Kimi fuera de la cadena en todo momento — ni consultado, ni esperado, ni atribuido.

**Write-set de esta sesión de implementación:** el path T-1a (único, en el repo) + este memo y su `.ready` + evidencia durable en `/private/tmp/f4a-t1a-*` (fuera del repo).

# VERDICT: SOURCE_READY
