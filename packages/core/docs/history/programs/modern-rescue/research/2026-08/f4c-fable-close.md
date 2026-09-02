# F4C — auditoría independiente de cierre (Fable 5)

- **Fecha:** 2026-08-30 · **Auditor:** Fable 5 (`claude-fable-5`, sesión real, READ-ONLY)
- **Lote:** F4C, canary visual de `palette.status-seeds` (Standard #14)
- **HEAD base:** `e14213be86ee750e702a37f75070a00112a7e733` (árbol sucio)
- **Harness auditado:** `packages/showroom/scripts/f4c-canary-capture.mjs`,
  sha256 `08b70aefd4380e905e8fe957c825fe18cd593a4fdc293adda1fbf0421f9b62cf`
  (coincide con `harnessSelfSha256` de los 5 receipts)
- **Único archivo escrito por esta auditoría:** este informe. Todo lo demás
  fue a `/tmp/fable-*` (re-captura E2, diffs de PNG, logs).

## Veredicto: **DEFECTS-5**

Dos de severidad ALTA bloquean el commit tal como está el árbol; el resto es
remediable en el mismo lote. Ninguno invalida la mecánica del canary: las
fases B/C/D y sus compares se reproducen exactamente. Lo que no se sostiene es
(1) declarar "RESTORE CERTIFIED / A→E PASS" sobre un compare que el propio
instrumento marca `pass=false`, cuando una re-captura limpia cuesta 2.5 min y
sale byte-idéntica; y (2) un archivo tracked fuera del write-set con residuo
de un test de tamper.

---

## 1. Verificación del estado declarado (contra disco, no contra el resumen)

| # | Afirmación del DT | Resultado | Evidencia |
|---|---|---|---|
| 1 | 5 fases, un solo harness, 54/54, pass, serverDrift estable | **RATIFICADA** | 5 receipts: `pass=true crashed=false runMode=full planned=54 captured=54 failures=0 serverDrift.stable=true`, `harnessSelfSha256=08b70aef…`, `controlManifestSha256=27044df1…`, `git.head=e14213be8 dirty=true`. Servidor: A/B/C pid 54260 (lstart 07:46:28), D pid 8020 (10:25:30), E pid 16070 (10:37:59). |
| 2 | A→B, A→C, A→D PASS; A→E PASS con una excepción | **PARCIAL** | Re-ejecutado: A→B `exit 0 pass=true` (18 MOVED / 36 NOT_MOVED), A→C `exit 0`, A→D `exit 0` (36 MOVED / 18 NOT_MOVED). **A→E `exit 1 pass=false`**: `FAIL: labels|the-management|1280 :: el PNG cambio pese a que ningun carrier de esta captura debia moverse`. El "PASS con excepción" es una adjudicación humana sobre un rojo del comparador (ver DEFECT-1). |
| 3 | `--check` verde x5; 5 drills muerden; png-tamper sobre A→E no prueba nada | **RATIFICADA** | `--check` fases A..E: `filas 54, fallos 0`, exit 0 (A verificado con `echo $?`). Drills re-ejecutados sobre A→B: `png-tamper`, `hold-becomes-mover`, `mover-becomes-frozen` → "FALLO como debe", exit 0. Sobre A→E: `la comparacion limpia YA falla; el drill no puede probar nada`, exit 1 (guarda de causalidad correcta). |
| 4 | program-check(.mjs/.test) rojos SOLO por receipts F4B stale, pre-existentes en HEAD | **PARCIAL** | `program-check.mjs`: exit 1, 117 líneas, **todas** `source digest is stale` sobre receipts F4B (widget-board, card, typography, alert, button, flex, grid, space, stack, sidebar-surface). Pre-existencia probada sin worktree ni stash: los 117 receipts tienen `createdAt` 2026-08-29T01:21–02:45Z y al menos un `sourceFile` tracked (`manifest/controls/{experience.profile,typography.families,motion.dial,recipe-profile,navigation.sidebar-tone,spacing.rhythm,density.mode,palette.seeds,responsive.posture}.json`) commiteado después, en `eebef22fb` (2026-08-29 18:53 -04:00) → stale en HEAD por construcción; intersección de sus 210 sourceFiles con el write-set del lote: **0**. `program-check.test.mjs`: `# pass 51 / # fail 2` — test 1 falla por lo mismo, pero **test 52 (A11) falla por una SEGUNDA causa**: `cascade-producers --check FAILED … closedProducer: 66 -> 66 (+0 -0 ~1)` (subtests N13, T-21, TC-7), causada por el residuo de `producers.json` en el árbol (DEFECT-2), que **no** existe en HEAD. |
| — | Ningún archivo foreign en el write-set | **IMPUGNADA** | `docs/reauditoria-cloud/` no es referenciado por F4C/harness/ground (solo `scouts/hardcode-census-top5.md` lo cita como fuente documental y declara que jamás se stagea). Pero `packages/core/manifest/cascade/extracted/producers.json` está **M** en el árbol, no figura en el write-set y no es output legítimo (DEFECT-2). |
| — | Sin bypass silencioso nuevo en el harness | **RATIFICADA** | Únicas variables de entorno: `DS_REFERENCE_CAPTURE_PORT` / `DS_REFERENCE_CAPTURE_BASE_URL` (harness:141-143). Sin `skip/bypass/force`. `--self-test` escribe `receipt.self-test.json` y `runMode` no-`full`, que `certifiableRunFailures` rechaza en `--check` y `--compare`. `--include` valida contra `CAPTURES` y falla cerrado. `--ground` reduce filas pero el comparador exige filas de ambos grounds declarados. |
| — | Typecheck del write-set | **RATIFICADA** | `npx tsc --noEmit -p packages/showroom/tsconfig.json` → exit 0, 0 errores (7.4 s). |

Hechos adicionales verificados:

- Canal `--ds-color-success` leído sobre el carrier `result-success-well` (390):
  A `#327CA8` ambos grounds; B the-management `#2F7A3D` / bithire `#327CA8`;
  D `#7C3AED` ambos; E `#327CA8` ambos. `--ds-color-success-bg` = `#f0fdf4`
  constante en A/B/D/E (propagación parcial medida, no supuesta).
- Digests de artifact leídos del DOM servido: A = C = E =
  `sha256-55a070ebb83c…`, B = `sha256-675ad7b1…`, D = `sha256-0caf3d29…`.
  `cssDigest` de bithire: A = B = C = E (`1459d24fa7…` / `b5d4951d57…`),
  D distinto (`757eabe686…` / `a9c6f19e60…`).
- Fuentes del cambio restauradas: `brand-themes/bithire/index.ts` (mtime 10:34,
  limpio en git), `themanagement-db-row/index.ts` (mtime 09:15, limpio),
  `tenant-theme-canary-fixtures.json` (tracked, limpio); `dist/` reconstruido
  10:36-10:37, servidor E levantado 10:37:59.

---

## 2. Adjudicaciones (a)–(e)

### (a) Ground DB diferido al cliente (`ground/client-only.tsx`) — **RATIFICADA como concesión del lab**, con dos remediaciones

Mecanismo verificado en fuente:
- `MINTED_SSR_RECEIPTS = new WeakSet<object>()` — `visual-authority/foundation/admission/index.ts:535`; la auditoría rechaza receipts no acuñados por esa instancia en `:606-607`. Identidad por objeto + doble instancia de módulo (RSC vs capa SSR de cliente) + serialización flight → el contrato `ssrReceipt` es efectivamente inalcanzable en topología RSC→cliente. No es una rotura de producto escondida: `app-bithire/src` no contiene `emitTenantThemeArtifactForSsr` ni `ssrReceipt` (grep vacío) → exposición latente, como declara la nota de deuda.
- El brazo static pasa `tenantSlug="bithire"` (`DesignSystemProvider` acepta `tenantSlug?: string | null`, `bootstrap/facade/react/provider/index.tsx:168`; vía asíncrona `:825`) → `getTenantConfig` → `getFirstPartyIdentity` → registro code-owned (`tenant/runtime/store/index.ts:158-165`). Las guardas `ReservedTenantIdentityError` siguen activas (`:197`, `:212`). Correcto: el objeto del registro no sobrevive la frontera de bundles y el slug sí.
- El `<style>` del artifact y el stamp script siguen server-rendered; sólo el provider se difiere. Lo que el canary mide (pintura tras hidratación) no cambia.

Remediaciones: la deferral **no está registrada en el receipt** (0 ocurrencias de `defer|ClientOnly|client-only` en `receipt.json`; sólo en README) → DEFECT-5; y la atribución "Opus-seat review" del comentario es falsa según la propia nota de honestidad → DEFECT-3.

### (b) D/the-management `artifactDigest: DIFFERS` — **RATIFICADA**

- `digestSource` incluye `variables` (`admission/index.ts:349`, dentro del bloque `:341-362`).
- `/tmp/f4c-artifact-D.json` vs `/tmp/f4c-artifact-E.json` (compilación offline del DT, 07:15/07:17): difieren **exactamente 9** claves de `variables`: `--ds-color-success-{50,100,200,300,400,500,600,700,800}`; digests `0caf3d29…` → `55a070eb…`.
- Restore exacto probado con el oráculo fuerte: el digest **leído del DOM servido** en C y en E es idéntico al de A (`55a070eb…`) en las 27 filas de the-management de cada fase. Un digest que no se moviera en D sería un oráculo peor, como argumenta el README.

### (c) Tolerancia de ruido PNG — **RATIFICADA**, con el residual explicitado

`PNG_NOISE_TOLERANCE = { maxPixelsRatio: 0.0002, maxChannelDelta: 2 }` (harness:1640). Sólo se consulta en filas **sin** MOVER (`expectsPixelChange === false`), exige `pixels > 0` (por eso `png-tamper`, que sólo altera el sha con archivos idénticos, muerde: re-verificado), `pixels ≤ ceil(0.02% total)` y `Δ ≤ 2`. El computed map de los carriers se compara exacto en todas las filas, con o sin tolerancia. Residual honesto: un drift ≤ 2 LSB en elementos que **no** son carrier queda bajo el umbral por diseño; ningún cambio de seed produce Δ ≤ 2. Filas absueltas observadas: `workbench/bithire/390` (8 px Δ1) recurrente en B, C, E y en mi E2; `dashboard/bithire/768` (28 px), `workbench/bithire/768` (9 px), `workbench/bithire/1280` (9 px) — jitter de hairline/antialiasing, consistente. No absuelve nada semántico.

### (d) Excepción E/labels/the-management/1280 — **IMPUGNADA** → DEFECT-1

Medido por mí (decodificación por canvas de Chromium, mismo método del harness):

| par | px | Δmax | bbox |
|---|---|---|---|
| A→E | 160 | 219 | x41-77, y869-1076 |
| A→C | 0 | 0 | — |
| C→E | 160 | 219 | idéntico a A→E |
| A→D | 5868 | 74 | x63-726 (TONE_RULE; **sin** el corrimiento: D tiene el tooltip donde A) |
| D→E | 6028 | 219 | x41-726 (contiene el corrimiento) |
| A→E (768, 390, bithire/1280) | 0 | 0 | — |

Zoom 6x (`/tmp/fable-zoom-top.png`, `-bottom.png`): lo que se mueve son las **muescas (flechas)** de los dos tooltips forzados-visibles (`display-labels/index.tsx:174` y `:181`), ~5-6 px en x; el panel, el texto y los botones ancla no cambian. Los `rect` de los 6 carriers, `readiness`, `cssSheets`, digest y computed son idénticos A↔E. Es no semántico, sí.

Pero la justificación del README ("frontera de sesión", "orden de llegada de la fuente entre sesiones") **no se sostiene como mecanismo**: D corrió en un servidor fresco (pid 8020) y tiene el tooltip en la posición de A; y mi re-captura **E2** (`/tmp/fable-phase-E2`, mismo servidor pid 16070 que E, mismo harness `08b70aef…`, 54/54, 2m34s) da `A→E2 exit 0 pass=true`, con `A-the-management-labels-1280.png` **byte-idéntico** a A y `drill png-tamper` mordiendo (exit 0). El corrimiento es un flake por lanzamiento de browser (carrera de posicionamiento del tooltip antes de que asienten métricas de fuente), reproducible sólo a veces.

Conclusión: cuando el instrumento dice `pass=false` y una corrida limpia cuesta 2.5 minutos y sale verde, la excepción adjudicada no es la salida correcta. `program/index.json → f4cCanary.stopCondition` nombra "any exact-restore failure" como condición de parada; un compare rojo en la fase de restore es formalmente eso. La escena debe re-capturarse, no re-adjudicarse.

### (e) El receipt declara la verdad completa — **RATIFICADA en lo medible**, con una laguna

- `channelsRead.undeclaredWatched` = `--ds-color-success-{bg,border,ink}`, `--ds-color-alpha-success-10`, `--ds-color-{warning,error,info}-bg`; valores registrados por carrier (bg `#f0fdf4` constante bajo seed movido: propagación parcial **medida**).
- `tierCoverage.tiersWithAMover = [pattern, primitive, structure, surface]`, verificado en A→B: `result/labels/feedback` (primitive), `patterntimeline` (pattern: `timeline-success` paint 26 / hold 0; `timeline-error` HOLD), `dashboard` (structure), `workbench` (surface).
- `AESTHETIC NOT_ACCEPTED` vive sólo en el README (0 ocurrencias en receipts). Es un fallo del owner, no una medición; aceptable, pero conviene un campo `ownerRulings` en el receipt o en un `closure.json` para que no dependa de prosa.
- Laguna → DEFECT-5 (deferral y fuentes del ground fuera del pin).

---

## 3. Defectos

### DEFECT-1 (ALTA) — El cierre declara "RESTORE CERTIFIED / A→E PASS" sobre un compare que el harness marca `pass=false`; una re-captura limpia lo resuelve
- **Dónde:** `F4C/README.md:392-409` (incidente 5), `:445` (tabla: "A→E **PASS con 1 excepcion medida**"), `:450-453` ("RESTORE CERTIFIED"); `F4C/compare-logs/A-E.log` (última línea `pass=false`).
- **Evidencia:** sección 2(d). `/tmp/fable-phase-E2/receipt.json` + `/tmp/fable-AE2.log` (`pass=true`, exit 0) disponibles para el DT.
- **Remedio:** re-capturar `phase-E` (mismo estado restaurado, `--include patterntimeline`), reemplazar `phase-E/`, regenerar `compare-logs/A-E.log` y agregar `compare-logs/drill-png-tamper-A-E.log` (ahora sí prueba algo). Reescribir el incidente 5 como "flake de posicionamiento del tooltip forzado, observado 1/2 corridas, resuelto por re-captura; estabilización de escena queda como deuda" y quitar la palabra "sesión" de la explicación (D y E2 la refutan). Si se conserva la captura roja por provenance, que viva en `F4C/attic/phase-E-flake-2026-08-30/`, nunca como `phase-E`.

### DEFECT-2 (ALTA, integridad del write-set) — `packages/core/manifest/cascade/extracted/producers.json` modificado en el árbol, no declarado, con residuo de un test de tamper
- **Dónde:** archivo tracked, `M` en `git status`, mtime 11:26:22 (posterior a toda la serie F4C, anterior a esta auditoría).
- **Evidencia:** diff semántico contra HEAD: única fila distinta `closedProducer[0].evidence.path`: HEAD `["terminal-at-sink","entriesRecordDomain"]` → árbol `["tampered"]`; formato pretty-print sin newline final, exactamente lo que escribe `cascade-producers.test.mjs:1702-1725` (T-21: `writeFileSync(OUT_PATH, JSON.stringify(parsed, null, 2))` con restore en `finally`). El `finally` no corrió → corrida del test interrumpida. Consecuencia: `cascade-producers --check` rojo (`closedProducer ~1`) y `program-check.test.mjs` test 52 rojo (N13/T-21/TC-7), causa **no** pre-existente en HEAD y **no** atribuible a F4B.
- **Remedio:** restaurar ese único archivo a HEAD (archivo puntual, no directorio; o `node cascade-producers.mjs --write` y verificar `git diff --stat` vacío para ese path), correr `cascade-producers.mjs --check` → OK, y re-correr `program-check.test.mjs` para dejar constancia de que el único rojo restante es el F4B stale de test 1. Jamás stagearlo.

### DEFECT-3 (MEDIA; bloqueante por regla del owner 2026-08-30) — Atribuciones de asiento Claude a revisiones ejecutadas por Kimi K3
- **Regla:** `scouts/f4c-model-honesty-and-prior-reviews.md:3-5`: "ninguna revisión puede llevar nombre de asiento Claude si fue ejecutada por un subagente interno Kimi K3". La misma nota registra que la auditoría del harness (DEFECTS-5) y la revisión arquitectónica ClientOnly + digest D fueron Kimi K3.
- **Sitios:**
  1. `f4c-canary-capture.mjs:1767-1768` — "(Fable DEFECT-1 para el agregado; …)"
  2. `f4c-canary-capture.mjs:1980-1981` — "(Fable DEFECT-2 + auditoria Codex …)"
  3. `f4c-canary-capture.mjs:2052` — "(Fable DEFECT-3)"
     Los tres coinciden uno a uno con DEFECT-1/2/3 de `scouts/f4c-harness-audit.md`, que no lleva atribución de modelo alguna. Yo (Fable) no he auditado este harness antes de hoy; esos defectos no son míos.
  4. `ground/client-only.tsx:31` — "PROGRAMME DEBT (Opus-seat review, 2026-08-30, F4C close)".
  5. `F4C/README.md:464` — "(revision Opus, condiciones (i)-(iv) en `scouts/coh-1-opus-formula-review*` …)": ese archivo (la única revisión Opus real, sobre la fórmula COH-1) **no contiene** `ssrReceipt`, `WeakSet`, `MINTED_SSR` ni `ClientOnly` (grep vacío); las condiciones (i)-(iv) están en la nota de honestidad, bajo Kimi K3.
- **Remedio:** reescribir a "auditoría del harness (Kimi K3, `scouts/f4c-harness-audit.md`)" y "revisión arquitectónica (Kimi K3, `scouts/f4c-model-honesty-and-prior-reviews.md`)"; poner cabecera de modelo en `f4c-harness-audit.md`. Los sitios 1-3 cambian el self-sha del harness: como DEFECT-1 ya obliga a re-capturar E, la vía limpia es corregir el harness y re-correr la serie completa bajo el nuevo sha (los receipts pinean el harness en `sourceFiles`). Si el owner decide no re-correr B/D, corregir 4-5 ahora y dejar 1-3 como follow-up nombrado atado a la próxima edición del harness — pero eso commitea la atribución falsa, así que no es mi recomendación.

### DEFECT-4 (MEDIA) — Glosas numéricas del README contradicen los `compare-logs/`
- **Dónde:** `F4C/README.md:441-446` (tabla de resultado).
- **Evidencia:** A→B: README "ruido medido en 2 filas (8 px Δ1; 155 px Δ2)" vs `A-B.log` **1** fila (`workbench/bithire/390`, 8 px Δ1). A→C: README "1 fila de ruido (15 px Δ1)" vs `A-C.log` **3** filas (28/8/9 px Δ1). A→E: README "2 filas de ruido" vs `A-E.log` 1 fila de ruido (9 px) + 1 FAIL; README "PASS" vs log `pass=false`. Misma clase que los REJECTs de F4B-12: cifras heredadas de la serie descartada.
- **Remedio:** recomputar la tabla desde los logs (o desde un `closure.json` derivado por script) tras la re-captura de E.

### DEFECT-5 (BAJA) — El receipt no pinea las fuentes del ground del lab ni registra la deferral
- **Dónde:** `receipt.sourceFiles` tiene sólo 2 entradas (manifest del control + harness).
- **Evidencia:** `ground/client-only.tsx` mtime 08:40:55 cae **entre** fase A (terminó 08:34:13) y B (empezó 09:02:41); `ground/index.tsx` 06:00. La serie no puede probar por receipt que el ground fue constante; sólo lo prueba indirectamente A↔C byte-idéntico. La deferral del provider DB (server pinta `LoadingScreen` vacío; el canary mide pintura post-hidratación) no aparece en el receipt.
- **Remedio (harness):** añadir `ground/index.tsx`, `ground/client-only.tsx` y `ground/stamp.ts` a `sourceFiles`, y un campo `groundRendering` por ground (`static: provider slug async` / `db: provider deferred to client (ClientOnly), artifact+stamp SSR`). Entra en la misma re-corrida que DEFECT-1/3.

### Observaciones no bloqueantes
- **OBS-A:** `scouts/` mezcla notas F4C con material COH-1 (`coh-1-*.md`, `coh-1-opus-formula-review.log`, `hardcode-census-top5.md`) y logs crudos de tmux (`f4c-fable-close.log`, 0 bytes, es el de esta sesión). El worktree `ui-design-system-coh-1` también tiene `scouts/` untracked → conflicto futuro. Commitear aquí sólo lo F4C; sin `.log`.
- **OBS-B:** incidente 6 confirmado (la línea "dentro de tolerancia" se imprime aunque la fila falle); cosmético, arreglar en la próxima edición del harness.
- **OBS-C:** `--check` no compara `receipt.harnessSelfSha256` con el harness en disco; correcto para evidencia archivada, pero por eso mismo la atribución (DEFECT-3) debe corregirse antes de que el harness quede commiteado como referencia.

---

## 4. Comandos reproducidos (todos en primer plano, esta sesión)

```
node f4c-canary-capture.mjs F4C/phase-{A..E} --check            -> filas 54, fallos 0 (x5), exit 0
node f4c-canary-capture.mjs --compare F4C/phase-A F4C/phase-B   -> pass=true  exit 0
node f4c-canary-capture.mjs --compare F4C/phase-A F4C/phase-C   -> pass=true  exit 0
node f4c-canary-capture.mjs --compare F4C/phase-A F4C/phase-D   -> pass=true  exit 0
node f4c-canary-capture.mjs --compare F4C/phase-A F4C/phase-E   -> pass=false exit 1
… --compare A B --drill {png-tamper,hold-becomes-mover,mover-becomes-frozen} -> exit 0 (muerden)
… --compare A E --drill png-tamper                              -> "limpia YA falla", exit 1
node f4c-canary-capture.mjs /tmp/fable-phase-E2 --phase E --include patterntimeline -> 54/54, exit 0
… --compare F4C/phase-A /tmp/fable-phase-E2                     -> pass=true  exit 0 (labels/tm/1280 byte-idéntico a A)
… --compare F4C/phase-A /tmp/fable-phase-E2 --drill png-tamper  -> exit 0 (muerde)
node program-check.mjs                                          -> exit 1, 117 x "source digest is stale" (todos F4B)
node --test program-check.test.mjs                              -> pass 51 / fail 2 (test 1: F4B stale; test 52: producers.json tamper)
node cascade-producers.mjs --check                              -> FAILED, closedProducer ~1
npx tsc --noEmit -p packages/showroom/tsconfig.json             -> exit 0
```

## 5. Condición de ACCEPT

ACCEPT queda condicionado a: (1) `phase-E` re-capturada verde y `A-E.log` regenerado con `pass=true` + drill png-tamper A→E; (2) `producers.json` restaurado a HEAD y fuera del staging, con `cascade-producers --check` OK; (3) las cinco atribuciones corregidas (con re-corrida de la serie si se toca el harness); (4) tabla del README recomputada desde los logs; (5) DEFECT-5 puede diferirse a la próxima edición del harness si el owner prefiere no re-correr B/D, siempre que quede asentado como deuda con dueño.
