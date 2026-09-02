# Modern Rescue — Re-auditoría independiente Kimi K3 (2026-08-23)

**Rol:** auditor principal independiente, READ-ONLY, por override del owner 2026-08-23.
**Objeto:** todo Modern Rescue previo (F0→F4B 4/20) + evaluación crítica de la gestión de Codex como DT.
**Baseline auditado:** HEAD `56fb593fdc134cf17b5bc9842085e3ff2e798d26`, worktree limpio, staged 0, `main...origin/main [ahead 519]`, sin push, sin scratch.
**Método:** 5 subagentes read-only paralelos con lanes disjuntos (A: git/commits; B: implementación y receipts; C: arquitectura fuente; D: scripts/gates/autoridad; E: gestión Codex). Nada se aceptó de memos sin verificación contra árbol/fuente. No se corrieron builds, generadores ni tests mutantes; sólo validadores verificados como read-only puros (`receipts.mjs validateReceipt`, `manifest --check`, `program-check.mjs`).

---

## 1. Veredicto

# **ACCEPT_WITH_CORRECTIONS**

El trabajo técnico verificado es real y sin falsos verdes: los 24 receipts F4B son válidos, frescos y causales; la arquitectura central (emisor único, ingress dual convergente, 20 controles, verticales divergentes) se verifica en fuente con file:line. **Pero HEAD está rojo en dos gates blocking** (`program-check`, `gat-07`) y la gestión Codex deja **una violación procesal significativa** (el desbloqueo de F4B incumple la condición vinculante que el propio DT fijó) más **drift de autoridad total** tras la sucesión del 2026-08-23. No se continúa F4B 5/20 hasta cerrar las correcciones C1–C4 (§5).

## 2. Porcentaje real

La estimación canónica **39–43% realizado** se sostiene como **cota prudente defendible, no como cálculo auditable**: los denominadores son visibles y verificados (F4B 4/20, F9 0/5100 celdas — verificado: exactamente 5100 celdas en `manifest/families/**`, 7 celdas COMPUTED_VERIFIED en 4 controles, 0 SIGHTED_ACCEPTED; F2-asimétrico/F3–F8 en 0%), pero no existe fórmula publicada. Corrección menor: publicar la fórmula o etiquetarla como estimación DT.

## 3. Qué está BIEN (verificado contra árbol, no memos)

- **Git (Lane A):** los 4 commits F4B del handoff existen exactos y en orden (`56847146f`, `5ce42e1b7`, `48fa4f20a`, `56fb593fd`); write-sets coherentes por packet; F4A cerró 14/14 (`1c127bf0e`); cero push (519 commits locales); worktree limpio; cero `.tmp`/scratch trackeados; sin secretos commiteados. Los repins de digest en 19 manifests ajenos (`48fa4f20a`) son sólo digest, verificado en diff.
- **Receipts (Lane B):** 24/24 existen, estructura completa (15 campos del contrato), **24/24 válidos y 0 stale digest** bajo el validador v2; recomputo independiente de `sourceDigest` y `artifactSha256` en 8 muestreados: 8/8 match. Sin duplicados/copias entre escenarios. Medición causal real en 3 fases (baseline/mutation/removal), restore byte-exacto (ej. flex-airy: 1054 filas, 0 divergentes). Deuda BitHire honesta: `bithire-technical` DESIGNED_NULL y `bithire-editorial` DIVERGENCE existen como artefactos medidos **sin receipt** — "deliberately NOT receipted". Manifests: exactamente 4 COMPUTED_VERIFIED / 16 UNKNOWN. Claim "24 fallos manifest --check, todos spacing.rhythm" **exacto** (verificado corriendo el check read-only). F4A 14/14 tiene insumos duraderos en repo y los 5 docs de cierre en /tmp con SHA exacto asentado en roadmap:899-945.
- **Arquitectura (Lane C):** emisor único confirmado (`compileTheme`, `infrastructure/compilers/kernel/runtime/brand-theme/index.ts:2014`); todos los candidatos a segundo emisor descartados con evidencia. Ingress dual real y convergente (`brandThemeToTheme` iso/index.ts:789; `compileTenantThemeConfig` tenant-theme/index.ts:1786 → mismo `compileTheme`). 20 controles = 13 standard + 7 pro ACTIVE en capabilities/index.ts. Adaptive layout: solver puro, thresholds 639/839, spanBias acotado, epoch con artifactRevision, posture como DATA fail-closed — todo verificado. WidgetBoard tier CSS-co-authored real (widget-board.css:1426/1517/1532). Density: el canal leído es efectivamente el derivado `--ds-density-effective-scale` (density.css:69). Verticales divergen de verdad (density, radios, motion, tipografía — no recolores). `effectIntensity: 0.58` preservado (bithire/index.ts:4010 → artifact :458). Baseline BitHire = technical (bithire/index.ts:3190).
- **Maquinaria (Lane D):** `program-check.mjs` es un check real con dientes (fail-closed, deriva admission del árbol, cadena de sucesión pineada, anti shadow-state) — no teatro: atrapó drift real hoy. Denominadores verificados: 255 familias, 105 primitivas, 5100 celdas, 13+7=20. Ley "no tercer estado" en CI cumplida (2 gates no-blocking con reason+owner).
- **Gestión Codex (Lane E):** disciplina de evidencia excepcional (falsabilidad, cadena SHA-256, honestidad no-receipt, un solo writer); T2 con throughput alto: F4A 14/14, cascada reconstruida, 2.024 unknowns drenadas a 0, 4/20 F4B en ~40 h, **0 commits docs-only**; cada REJECT de auditoría cita defectos concretos medidos (no iteración abstracta); decisiones correctas: anti-false-green consistente, stops falsables, catch del anti-door en shape.radius-scale, negativa al flip masivo de 254 celdas, memos no inflan progreso.

## 4. Qué está MAL — hallazgos consolidados

### BLOCKER

- **H1 (Lane D).** `program-check.mjs` (gate blocking de `gates:ci`) está **BLOCKED en HEAD desde `56847146f`**: 24 fallos en celdas `spacing.rhythm` de layout — evidenceIds `R2:…` fuera del evidence root permitido (los artifacts viven en `F4B/spacing-rhythm/`, no en `R2/`), `mechanism: null`, `internalChannels` vacío, falta vocabulary conformance (`computed-causal-run` no aceptado). Los 3 packets posteriores no lo arreglaron: **la ráfaga F4B commiteó celdas que su propio gate constitucional rechaza**. CI core rojo en HEAD.
- **H2 (Lane D).** `gat-07-exact-proof` **stale otra vez en HEAD**: resellado legítimamente el 08-22 (`1c127bf0e`, digest internamente consistente, verificado por recomputo) e invalidado el 08-23 por la serie F4B: **18 inputs modificados + 4 archivos nuevos sin sellar**. La tarea "resello después de cada lote" que el propio roadmap §0.1 secuenció sigue sin ejecutarse por lote.

### MAJOR

- **H3 (Lane E).** **El desbloqueo de F4B no tiene escribanía.** La condición vinculante fijada por el propio DT (roadmap:1142-1146): Lote B sólo abre con `unknownProvenance == []` real **y doble postaudit** (reauditoría independiente A4–A9 + postaudit Fable del diff completo). Los 14 commits que drenaron 2.024 unknowns (`8d2985638`…`6cfdcc1a9`, 08-22) tienen cuerpos vacíos, tocaron **2 archivos de `src/`** fuera del write-set mínimo declarado, y **el roadmap no los registra ni registra el ruling ni las dos auditorías exigidas**. Si existen, están en /tmp (volátil). Brecha más seria: la regla "todo se registra" se rompió exactamente en la frontera de fase que se entregó.
- **H4 (Lane D).** **Drift de autoridad DT total** tras la sucesión owner 2026-08-23 (Codex → Kimi K3): 8 puntos documentales/ejecutables siguen nombrando a Codex como DT vivo, incluido el pin ejecutable `LIVE_COORDINATOR='Codex'` en program-check.mjs — el árbol quedará rojo constitucional en cuanto el sucesor opere. Detalle en §6 ROADMAP_PATCH_REQUIRED.
- **H5 (Lane D).** Roadmap:1199 afirma "24 receipts, todos válidos y frescos" — **contradicho por su propio gate blocking** (H1): los receipts validan en v2 pero las 8 celdas spacing.rhythm son rechazadas por program-check. El libro mayor se adelantó a la verificación.
- **H6 (Lane C).** Defecto de cascada vertical abierto en bithire: el bloque theme-scoped del artifact generado supera en especificidad al brazo estático (`artifacts/bithire/index.css:644` vs `:1496`); un control COMPUTED_VERIFIED (`experience.profile`) no pinta en bithire/dark vía static. Declarado como `OPEN_VERTICAL_CASCADE_DEFECT` con remediation "fuera de scope del packet" — **sigue sin dueño de packet**.
- **H7 (Lane C).** Asimetría de brazos estático/DB (`OPEN_ARM_ASYMMETRY`, bithire/editorial light): decisión elevada al owner, **sin resolver**; bloquea un escenario F4B y se arrastra a F2-asimétrico.
- **H8 (Lane E).** Fence de segregación roto y mal nombrado: drill `composition/receipt` 11/12 compara contra `SIGHTED_APPROVER='Codex (DT)'` pasando `'Codex'` — una valla que no valla, doblemente stale tras la sucesión.
- **H9 (Lane E).** Contratos máquina stale: `rounds/index.json` exige `codex-audit`/`Codex GO` como ley; `checkpoint/index.json` mantiene lane `authority: codex-dt` y `currentWave` describiendo F4A como frente abierto (cerrado 08-22).

### MINOR

- **H10 (Lane A).** Los 4 commits F4B tienen cuerpo vacío; la convención del propio programa (F4A) llevaba evidencia en el mensaje. Trazabilidad existe sólo vía asiento de roadmap.
- **H11 (Lane A).** Reescritura de historia local 2026-08-19 19:23: `reset --mixed HEAD~1` y re-commit (`4d4cadafd`→`6de85d530`) sin orden visible en los mensajes vecinos. Blast radius nulo (sin push), pero mutación git bajo un programa que la veta sin orden explícita.
- **H12 (Lane B).** Narrativa inexacta: roadmap:1642 (punto 15) dice que surfaces.effect-intensity "no se reemitió"; sus receipts en HEAD llevan `createdAt` posterior a la reemisión de radius/experience y cambió en 3 commits.
- **H13 (Lane B).** Los 5 documentos de cierre F4A (postaudits/SOURCE_READY) existen **sólo en /tmp** con SHA asentado en roadmap — evidencia de cierre en medio efímero.
- **H14 (Lane C).** Import muerto `validateResponsivePostureSelection` (tenant-theme/index.ts:24) + dos docblocks que afirman validación del compilador que no existe (el gate real es el enum del schema). Documentación engañosa.
- **H15 (Lane C).** Lowering retirado `compileAppearanceVariables` (appearance/index.ts:1008) sigue en src sin consumidores productivos ni gate de retiro — exactamente el caso que ARCHITECTURE.md §1.2 prohíbe.
- **H16 (Lane C).** 13 de 20 `staticBrandThemePath` son no-literales (wildcard/brace/prosa), no caminables por el harness; expresabilidad static declarada, no probada (shape.radius-scale ya corrigió la suya).
- **H17 (Lane D).** `phase-a/ledger-schema.json` (4.743 líneas) cita paths pre-F0.5 inexistentes, cero consumidores — peso muerto. `cascade-materialize`/`cascade-backlog` (~2,4k líneas) en cuarentena permanente de facto (salidas cercadas UNVERIFIED/UNREPRODUCIBLE).

### OBS

- **H18.** Reachability probada por cadena + string-contains, no por ejecución; los 4 controles verificados midieron UNA familia (Card) cada uno — declarado honestamente, pero F9 hereda 254/255 celdas experience.profile con razonamiento falsado y 16 controles sin evidencia de reachability real.
- **H19.** `56fb593fd` re-emitió ~30 artifacts/receipts de los 3 packets previos (justificado y documentado: fixture nuevo + cadena de sellos), excediendo en lectura estricta el write-set por packet.
- **H20.** Stash pre-programa (2026-03-17) aún presente; resolver antes del cierre final. Autoría git uniforme `davila23`: roles sólo en texto. 519 commits sólo en clone local — riesgo operativo.
- **H21.** K4 necesitó 3 briefs y K5/PRE_F4B múltiples REJECTs: los REJECTs atraparon defectos reales, pero el costo de re-trabajo fue alto; es el punto más cercano a la advertencia del handoff contra auditoría iterativa.
- **H22.** Doble producto de build de verticales (styles/*.css y facade/artifacts/*) con gates de sync — no es segundo emisor, pero es el síntoma de la zona débil (ver §7).
- **H23.** Discrepancia menor handoff (16 pares reemitidos) vs roadmap (20 receipts): dos causas distintas (copy-slip + circularidad staleness); no se contradicen, pero el sucesor debe leer ambos.
- **H24.** Cifra durable del error MUST_NOT_REACH: 254/255 celdas experience.profile con razón falsada (origen: descomposición F1.4 de Codex T1), no "252".

## 5. Correcciones mínimas (bloquean reanudar F4B)

- **C1 (por H4/H8/H9).** Patchear la constitución para la sucesión DT 2026-08-23 con el procedimiento T-1 (program-check + program-check.test antes y después): AGENTS.md, CLAUDE.md, orchestration/index.json (3er record de sucesión + asiento vivo), program-check.mjs (`LIVE_COORDINATOR`, cadena de 3 records), README del programa, art-direction/index.json, rounds/index.json (`codex-audit`/`Codex GO` → ley neutra de DT), checkpoint/index.json, y el fence SIGHTED_APPROVER. Todo en UN packet de autoridad, con evidencia.
- **C2 (por H1).** Resolver el BLOCKED de program-check: corregir las celdas spacing.rhythm (evidenceIds al root real `F4B/spacing-rhythm/`, `mechanism`, `internalChannels`, vocabulary de evidenceKind — unificar `computed-causal-run` vs `static-db-computed-parity` en una decisión única) o enmendar la ley del gate una sola vez, con asiento. Verificar gate verde antes de cualquier commit F4B nuevo.
- **C3 (por H2).** Resellar gat-07 ahora y asignar el resello por lote como paso obligatorio del cierre de cada packet F4B restante (era tarea secuenciada sin dueño desde §0.1).
- **C4 (por H3).** Regularizar el desbloqueo de F4B: producir la doble postaudit retroactiva del diff `8d2985638`…`6cfdcc1a9` (incluidos los 2 archivos src fuera de write-set) y asentar en el roadmap el ruling que autorizó Lote B, o declarar la brecha y su remedación. Sin esto, PRE_F4B/F4B descansan sobre una condición incumplida.
- **C5 (por H13).** Persistir los 5 documentos de cierre F4A (y los 4 de experience.profile) desde /tmp a `docs/f4a/` (o equivalente), con los SHA ya asentados.
- **C6 (por H6/H7).** Asignar dueño/packet al defecto de cascada bithire y forzar la decisión owner sobre asimetría de brazos antes de F2-asimétrico/F3.
- **C7 (menores, un solo barrido).** H10 (convención de cuerpo de commit), H12 (corregir narrativa :1642), H14 (quitar import muerto + docblocks falsos), H15 (retirar o gate-ar `compileAppearanceVariables`), H17 (podar o re-anclar ledger-schema.json), H20 (resolver stash; política de backup de los 519 commits locales).

## 6. ROADMAP_PATCH_REQUIRED (NO aplicado — cambios exactos)

1. **`docs/ROADMAP-EJECUCION-2026-08-19.md:1199`** — Reemplazar "24 receipts, todos válidos y frescos" por: "24 receipts válidos y frescos bajo el validador v2; **las 8 celdas spacing.rhythm son rechazadas por program-check (BLOCKED desde 56847146f)** — ver corrección C2; rounds R2/R2/R3/R4".
2. **`docs/ROADMAP-EJECUCION-2026-08-19.md:18-22`** (§0.1) — Actualizar gat-07: "sello 2026-07-18 con 123 archivos" → estado real: "resellado 2026-08-22 (`1c127bf0e`); **stale nuevamente 2026-08-23: 18 inputs modificados + 4 archivos nuevos sin sellar** tras la serie F4B; resello por lote obligatorio (C3)".
3. **`docs/ROADMAP-EJECUCION-2026-08-19.md:491,512-514,516-524`** — Reemplazar el ancla "estado vigente 2026-08-21", HEAD `9d5582dfd` y "Codex: DT…/Kimi K3 fuera por varios días" por: estado vigente 2026-08-23, HEAD `56fb593fd`, **DT vivo: Kimi K3 por sucesión owner 2026-08-23** (3ra transferencia), Codex fuera del asiento DT y sin asiento de auditoría.
4. **`docs/ROADMAP-EJECUCION-2026-08-19.md` sección PRE_F4B (~:1142-1146)** — Agregar asiento: estado real del drenado `unknownProvenance` 2.024→0 (commits `8d2985638`…`6cfdcc1a9`), la doble postaudit exigida (o su brecha + remedación C4) y el ruling de apertura de Lote B.
5. **`docs/ROADMAP-EJECUCION-2026-08-19.md:1642`** — Corregir: surfaces.effect-intensity **sí fue reemitido** (createdAt 10:49Z en HEAD); sólo spacing.rhythm conservó emisión original.
6. **`AGENTS.md:36,40-56`** — Tabla de roles: DT = Kimi K3; agregar 3ra sucesión (Codex → Kimi K3, 2026-08-23, orden owner con handoff SHA `088ddd36…84e665`); Codex retirado del asiento vivo.
7. **`CLAUDE.md:14-16`** — "Codex is the DT/coordinator" → Kimi K3 (misma referencia de orden).
8. **`orchestration/index.json:15,19,21-36,284,312`** — `coordinator.model` → Kimi K3; agregar record de sucesión {Codex→Kimi K3, 2026-08-23}; re-pointear `r7Execution`/`telemetryLaw` al DT vivo.
9. **`program-check.mjs:63-66,99-102`** — `LIVE_COORDINATOR` y `COORDINATOR_SUCCESSION_CHAIN` de 2→3 records. (T-1: correr program-check y program-check.test.mjs antes y después.)
10. **`packages/core/scripts/quality-evidence/programs/modern-rescue/README.md:194,254,308,352-384`** — roles e historia de sucesión.
11. **`art-direction/index.json:7,9,367`** — adjudicator/promotionAuthority → DT vivo; corregir ":9 Kimi retired from all live seats" (contradicho por el handoff 2026-08-23).
12. **`rounds/index.json`** (checkpointPolicy) — `codex-audit`, `explicit Codex GO`, `IMPLEMENTED_PENDING_CODEX_AUDIT` → ley neutra del asiento DT (quien sea el DT vivo).
13. **`checkpoint/index.json`** — lane `authority` model `codex-dt` → DT vivo; `currentWave` → "F4B 4/20, siguiente: correcciones C1–C4 + control 5/20" (F4A cerrado 08-22).
14. **Fence** `packages/core/src/.../composition/receipt/tests/index.test.mjs:197` — reparar comparación `SIGHTED_APPROVER` ('Codex (DT)' vs 'Codex') y actualizar al asiento vivo.

## 7. Arquitectura equivocada aunque los números cierren

El único punto donde la arquitectura "un emisor" se degrada **no es un segundo lowering sino un segundo orden de cascada**: el generador de artifacts estáticos produce bloques theme-scoped con especificidad que el brazo estático runtime no reproduce (H6), y ya produjo un defecto medido en un control certificado. Sumado a H16 (13/20 puertas estáticas no caminables) y H18 (reachability no probada por ejecución en 16/20 controles), la conclusión es: **la columna vertebral es sólida; la capa de artifacts generados y la cobertura de reachability son el frente de riesgo real para F4B 16/20 restantes y F9.**

## 8. Evaluación de Codex como DT

Gestión **técnicamente sólida y honesta en lo medido** (cero falsos verdes encontrados; REJECTs siempre con defecto concreto; throughput T2 alto), con **una violación procesal significativa justo en la frontera que entrega** (H3) y un patrón a corregir por el sucesor: **commitear con gates blocking rojos** (H1/H2) y **adelantar el libro mayor a la verificación** (H5). La triple re-auditoría general del 08-19 fue corregida por el owner y no se repitió; el costo de re-trabajo K4/K5/PRE_F4B es el riesgo residual de proceso.

## 9. Repo intacto

Verificado al cierre de la auditoría: HEAD `56fb593fdc134cf17b5bc9842085e3ff2e798d26`, `git status --porcelain` vacío. Esta auditoría escribió únicamente en `/private/tmp`. Workers tmux (`f05-opus:0.0`, `f05-sonnet:0.0`, `fable-ejec:0.0`) sin modificar, idle.
