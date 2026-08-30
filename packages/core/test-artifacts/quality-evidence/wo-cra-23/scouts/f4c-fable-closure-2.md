# F4C — re-auditoría focal de cierre (Fable 5), tras DEFECTS-5

- **Fecha:** 2026-08-30 · **Auditor:** Fable 5 (`claude-fable-5`, sesión real, READ-ONLY)
- **Informe previo:** `scouts/f4c-fable-close.md` (DEFECTS-5, serie con harness `08b70aef…`)
- **Lote:** F4C, canary visual de `palette.status-seeds` (Standard #14)
- **HEAD base:** `e14213be86ee750e702a37f75070a00112a7e733` (árbol sucio, sin staging)
- **Harness auditado:** `packages/showroom/scripts/f4c-canary-capture.mjs`,
  sha256 `e7fd30c4090f9316ff62e744ed233d5c20c0b0c4bc87f3d28299c03deda38aa9`
- **Único archivo escrito por esta auditoría:** este informe. Salidas de
  re-ejecución en `/tmp/fable2-*`. Todo corrió en primer plano en esta sesión;
  ningún background task.

## Veredicto: **ACCEPT**

Las cinco remediaciones se verifican contra disco y contra re-ejecución, no
contra el resumen del DT. La serie A-E nueva corre bajo un solo harness, los
compares A→B/C/D/E dan `pass=true` en los logs almacenados y en mi re-corrida
(logs byte-idénticos módulo rutas absolutas), los 8 drills muerden, el árbol
contiene exactamente el write-set declarado más el directorio foreign
excluido, y el único rojo residual del programa es el F4B stale pre-existente
en HEAD. Quedan tres observaciones no bloqueantes (§3).

---

## 1. Verificación punto por punto (contra disco)

### 1. DEFECT-1 (E roja) — **REMEDIADO**

| Afirmación | Resultado | Evidencia |
|---|---|---|
| Un solo harness `e7fd30c4…` en los 5 receipts | ✓ | `shasum -a 256` del harness = `e7fd30c4…`; `harnessSelfSha256` idéntico en `F4C/phase-{A..E}/receipt.json`; también pineado como `sourceFiles[1].sha256` en los 5. |
| phase-E re-capturada 54/54 | ✓ | `phase-E/receipt.json`: `pass=true crashed=false runMode=full plannedRows=54 capturedRows=54 failures=[]`, `startedAt 16:46:11Z / finishedAt 16:49:14Z`, servidor pid 3352 (lstart 12:42:53) estable before/after. 54 PNG en `phase-E/captures/`. |
| A→E `pass=true` | ✓ | Almacenado: `compare-logs/A-E.log` última línea `pass=true`, 0 líneas `FAIL`. Re-ejecutado: `--compare phase-A phase-E` → exit 0, `pass=true`; `diff` entre el log almacenado y el mío (módulo `/Users/...`) vacío. |
| `labels/the-management/1280` byte-idéntica a A | ✓ | `artifactSha256` de esa fila en receipt A = C = E = `7cb80d81aed6d7e0…`; sha256 de los archivos `phase-{A,C,E}/captures/{A,C,E}-the-management-labels-1280.png` = `7cb80d81aed6d7e0…` (los tres). Filas de la fase E que difieren de A por sha: exactamente 2 (`dashboard/bithire/768`, `workbench/bithire/390`), ambas absueltas por tolerancia (ver DEFECT-4). |
| Drill png-tamper A→E ahora prueba | ✓ | Re-ejecutado: `--compare A E --drill png-tamper` → exit 0, "comparacion limpia verde; con la perturbacion el comparador FALLO como debe / FAIL(inducido): alert\|bithire\|390". Almacenado: `compare-logs/drill-AE-png-tamper.log`, mismo texto. |
| Incidente 5 reescrito con la refutación | ✓ | `F4C/README.md:391-406`: "flake de posicionamiento del tooltip forzado (RESUELTO por re-captura, no por adjudicacion)"; declara FALSA la lectura "frontera de sesion", cita D en servidor fresco y la E2 byte-idéntica, y deja la estabilización de escena como deuda del lab (`:479-482`). `README.md:457-459`: "resuelta por re-captura … byte-identico al de A". La palabra "sesion" sólo aparece dentro de la cita de la explicación refutada (`:397`). |

### 2. DEFECT-2 (producers.json) — **REMEDIADO**

- `git status --porcelain -- packages/core/manifest/cascade/extracted/producers.json` → vacío;
  `git diff --quiet HEAD -- <path>` → igual a HEAD.
- `node …/cascade-producers.mjs --check` → `OK -- producers.json matches the tree`, exit 0.
- `git diff --cached --name-only` → 0 archivos: nada en staging; el path no puede
  entrar al lote sin un `git add` explícito posterior.
- `node --test program-check.test.mjs` → `# tests 53 / pass 52 / fail 1`. El único
  rojo es el test 1 (`live modern-rescue program contracts are internally
  consistent`), 117 x `source digest is stale` sobre receipts **F4B**
  (widget-board/responsive-posture, card/typography-scale, shape-radius-scale,
  surfaces-elevation-posture, …), la causa pre-existente en HEAD que ya probé en
  el informe previo. El subtest a11 (`cascade-producers.test.mjs`) ahora sale
  `status=0` (líneas 4-5 del log): el rojo de test 52 desapareció con el
  archivo restaurado. `producers.json` sigue limpio tras correr el test.

### 3. DEFECT-3 (atribuciones) — **REMEDIADO, 5/5**

| # | Sitio | Estado en disco |
|---|---|---|
| 1 | `f4c-canary-capture.mjs:1774-1775` | "scouts/f4c-harness-audit.md DEFECT-1, auditoria ejecutada por Kimi K3; recomputacion por campos: hallazgo Codex via mandato del owner" |
| 2 | `f4c-canary-capture.mjs:1990-1991` | "(scouts/f4c-harness-audit.md DEFECT-2, auditoria ejecutada por Kimi K3; hallazgo Codex via mandato del owner 2026-08-30 …" |
| 3 | `f4c-canary-capture.mjs:2063-2064` | "(scouts/f4c-harness-audit.md DEFECT-3, auditoria ejecutada por Kimi K3)" |
| 4 | `ground/client-only.tsx:31-32` | "PROGRAMME DEBT (revisión arquitectónica ejecutada por subagente Kimi K3, 2026-08-30, cierre F4C — ver scouts/f4c-model-honesty-and-prior-reviews.md)". `grep -n Opus client-only.tsx` → 0. |
| 5 | `F4C/README.md:473-476` | deuda `ssrReceipt` → "revision arquitectonica ejecutada por subagente Kimi K3, condiciones (i)-(iv) en `scouts/f4c-model-honesty-and-prior-reviews.md`". `grep coh-1-opus README.md` → 0. |
| + | `scouts/f4c-harness-audit.md:1-6` | Cabecera: "**Modelo real: Kimi K3 (subagente interno del DT), 2026-08-30.** Este documento NO es una auditoría Fable …". |

Las dos menciones a "Fable" que quedan en el harness son legítimas: `:18`
("revisiones ciegas Fable DEFECTS-8 / Codex DEFECTS-5", diseño del harness
contra revisiones anteriores del programa, no de este harness) y `:2314-2315`
("Fable DEFECT-5, auditoria real de cierre 2026-08-30"), que es mío.

### 4. DEFECT-4 (glosas) — **REMEDIADO**

Tabla `F4C/README.md:441-446` contra `compare-logs/*.log` (conteo de líneas
`ruido de rasterizado` y `FAIL`, con la fila que las precede):

| par | README | log almacenado | ✓ |
|---|---|---|---|
| A→B | "0 filas de ruido", PASS | 0 ruido, 0 FAIL, `pass=true` | ✓ |
| A→C | "1 fila: workbench/bithire/390, 8 px Δ1", PASS | 1 ruido: `A-C.log:116-117` `workbench/bithire/390` 8 px (0.0023%) Δmax 1; `pass=true` | ✓ |
| A→D | "0 filas de ruido", PASS | 0 ruido, 0 FAIL, `pass=true` | ✓ |
| A→E | "2 filas: dashboard/bithire/768 (155 px Δ2) y workbench/bithire/390 (8 px Δ1)", PASS | 2 ruido: `A-E.log:106-107` `dashboard/bithire/768` 155 px (0.0020%) Δmax 2; `:117-118` `workbench/bithire/390` 8 px Δmax 1; `pass=true` | ✓ |

Los cuatro logs almacenados son byte-idénticos (módulo rutas absolutas) a mi
re-ejecución de hoy, así que la tabla está anclada a artifacts reproducibles,
no a una serie descartada.

### 5. DEFECT-5 (sourceFiles / groundRendering) — **REMEDIADO**

- `phase-A/receipt.json → sourceFiles` tiene 5 entradas:
  `manifest/controls/palette.status-seeds.json` (`27044df1…`), el harness
  (`e7fd30c4…`), `ground/index.tsx` (`3b163a7e…`), `ground/client-only.tsx`
  (`3ffa865a…`), `ground/stamp.ts` (`7b7256b6…`). Los 5 sha coinciden con el
  disco de hoy (recomputados) y son idénticos en los receipts A/B/C/D/E → el
  ground fue constante durante toda la serie, ahora probado por receipt.
- `groundRendering` presente en 54/54 filas de cada fase (0 ausentes), dos
  valores: static "provider por slug (resolucion async): server y primer
  render cliente coinciden en el LoadingScreen vacio"; db "provider diferido
  al cliente (ClientOnly, ground/client-only.tsx): server y primer render
  cliente en vacio; stamp + <style> del artifact quedan SSR fuera del gate".
  Emisión en harness `:174` y `:1501`.

### 6. Serie nueva — **RATIFICADA**

| fase | servidor | pass | 54/54 | drift | digest the-management (DOM) | cssDigest bithire |
|---|---|---|---|---|---|---|
| A | pid 16070 @10:37:59 | true | ✓ | stable | `sha256-55a070eb…` | `1459d24f…`/`b5d4951d…` |
| B | pid 82461 @12:15:25 | true | ✓ | stable | `sha256-675ad7b1…` | idem A |
| C | pid 82461 @12:15:25 | true | ✓ | stable | `sha256-55a070eb…` | idem A |
| D | pid 97861 @12:32:48 | true | ✓ | stable | `sha256-0caf3d29…` | `757eabe6…`/`a9c6f19e…` |
| E | pid 3352 @12:42:53 | true | ✓ | stable | `sha256-55a070eb…` | idem A |

`controlManifestSha256` `27044df1…` y `sourceDigest` `706021d4…` idénticos en
las 5. `--check` sobre las 5 fases: `filas 54, fallos 0`, exit 0.
Compares re-ejecutados: A→B exit 0 (18 MOVED/36 NOT_MOVED), A→C exit 0, A→D
exit 0 (36 MOVED/18 NOT_MOVED), A→E exit 0; todos `pass=true`.
Drills re-ejecutados, todos "FALLO como debe", exit 0: A→B `png-tamper`,
`hold-becomes-mover`, `mover-becomes-frozen`, `count-drift`, `geometry-leak`;
A→E `hold-becomes-mover`, `png-tamper`, `count-drift`. Los dos no aplicables
sobre A→E (`mover-becomes-frozen`, `geometry-leak`) terminan con la excepción
controlada "no hay ningun carrier MOVER en el par comparado", exit 1, como
declara el README `:451-453`. Tras los 10 drills `git status` no cambió (sin
residuo).

### 7. Estado del árbol — **RATIFICADO**

`git status --porcelain` → exactamente 6 entradas: ` M
packages/showroom/src/app/probe/ds-reference/ground/index.tsx` (+47/-21), `??
docs/reauditoria-cloud/`, `?? …/wo-cra-23/F4C/`, `?? …/wo-cra-23/scouts/`,
`?? packages/showroom/scripts/f4c-canary-capture.mjs`, `??
packages/showroom/src/app/probe/ds-reference/ground/client-only.tsx`.
`git diff --check` limpio; staging vacío. `docs/reauditoria-cloud/` no es
referenciado por harness, ground, ni `F4C/README.md`; sólo
`scouts/hardcode-census-top5.md` lo cita como fuente documental y declara que
jamás se stagea. `npx tsc --noEmit -p packages/showroom/tsconfig.json` → exit 0.

---

## 2. Comandos reproducidos (primer plano, esta sesión)

```
shasum -a 256 packages/showroom/scripts/f4c-canary-capture.mjs                -> e7fd30c4…
node f4c-canary-capture.mjs --compare F4C/phase-A F4C/phase-E                 -> exit 0, pass=true (== compare-logs/A-E.log)
node f4c-canary-capture.mjs --compare F4C/phase-A F4C/phase-E --drill png-tamper -> exit 0, muerde
node f4c-canary-capture.mjs --compare F4C/phase-A F4C/phase-{B,C,D}           -> exit 0 x3, pass=true (== logs almacenados)
node f4c-canary-capture.mjs F4C/phase-{A..E} --check                          -> filas 54, fallos 0 (x5), exit 0
… --compare A B --drill {png-tamper,hold-becomes-mover,mover-becomes-frozen,count-drift,geometry-leak} -> exit 0 x5
… --compare A E --drill {hold-becomes-mover,png-tamper,count-drift}           -> exit 0 x3
… --compare A E --drill {mover-becomes-frozen,geometry-leak}                  -> exit 1, "no hay ningun carrier MOVER" (controlado)
node cascade-producers.mjs --check                                            -> OK, exit 0
node --test program-check.test.mjs                                            -> pass 52 / fail 1 (test 1: F4B stale, pre-existente)
git status --porcelain -- packages/core/manifest/cascade/extracted/producers.json -> vacío
git diff --cached --name-only                                                 -> vacío
git diff --check                                                              -> limpio
npx tsc --noEmit -p packages/showroom/tsconfig.json                           -> exit 0
sha256 phase-{A,C,E}/captures/*-the-management-labels-1280.png                -> 7cb80d81aed6d7e0… (x3)
sha256 de los 5 sourceFiles en disco vs receipt                               -> MATCH x5, idénticos en A..E
```

## 3. Observaciones no bloqueantes

- **OBS-1 (harness, próxima edición):** `sourceDigest` (harness `:2322`) sigue
  siendo `sha256(manifest)::selfSha` y no pliega los tres pins del ground; y
  `--check` no recomputa `sourceFiles[].sha256` contra disco (el único uso de
  `sourceFiles` en el harness es la emisión `:2311`). El pin del ground es por
  tanto declarativo por receipt: hoy queda probado porque yo recomputé los sha
  y son idénticos en los 5 receipts y en disco, pero un lector futuro no lo
  obtiene de `--check`. Recomendación: plegar los 5 sha en `sourceDigest` y
  hacer que `--check` verifique cada `sourceFiles[].sha256` cuando el archivo
  exista. No afecta el veredicto de esta serie.
- **OBS-2 (higiene de commit, hereda OBS-A):** `scouts/` contiene tres `.log`
  de tmux (`coh-1-opus-formula-review.log`, `f4c-fable-close.log`,
  `f4c-fable-closure-2.log` — este último es el de esta sesión, 0 bytes al
  momento de escribir) y material COH-1 (`coh-1-*.md`,
  `hardcode-census-top5.md`). Stagear sólo lo F4C y sin `.log`.
- **OBS-3 (informativo):** phase-A corrió sobre el servidor pid 16070 (lstart
  10:37:59), el mismo que sirvió la E de la serie descartada. Es correcto —
  ese servidor ya servía el estado restaurado, que es exactamente el baseline —
  y `serverDrift.stable=true` before/after dentro de la fase; pero conviene
  saberlo si alguien compara pids entre series.

## 4. Condición de ACCEPT

Cumplida en los cinco puntos del informe previo: (1) E re-capturada verde,
`A-E.log` con `pass=true` y `drill-AE-png-tamper.log` presente; (2)
`producers.json` igual a HEAD, fuera del staging, `cascade-producers --check`
OK; (3) cinco atribuciones corregidas y serie completa re-corrida bajo el
harness nuevo; (4) tabla del README anclada a los logs almacenados y
reproducibles; (5) `sourceFiles` con los tres archivos del ground y
`groundRendering` por fila en las 5 fases.

**ACCEPT.** Lote listo para el commit con el write-set declarado (M
`ground/index.tsx`; ?? `f4c-canary-capture.mjs`, `ground/client-only.tsx`,
`F4C/`, `scouts/` sin `.log`), `docs/reauditoria-cloud/` excluido.
