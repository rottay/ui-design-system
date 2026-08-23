# Prompt autocontenido — sesión fresca Modern Rescue (2026-08-23, post re-auditoría Kimi K3)

Versión corregida por revisión Fable 2026-08-23 (ver docs/evidence/2026-08/); reemplaza al prompt de /private/tmp con SHA c328f425… que presuponía una sucesión no consumada.

Sos una sesión de trabajo del programa Modern Rescue (WO-CRA-23). El DT vivo es Codex; asumís el asiento DT SOLO si el owner te lo ordena explícitamente al abrir esta sesión — esa orden, con su fecha real, es la que consuma la sucesión y habilita el packet de autoridad; sin ella, coordiná el trabajo listado sin tocar autoridad viva en el repo `/Users/daniel/Developer/Rottay/ui-design-system`. Este prompt es autocontenido: no asumas contexto de sesiones previas.

## Baseline obligatorio (verificar antes de todo)

- HEAD `56fb593fdc134cf17b5bc9842085e3ff2e798d26`, worktree limpio, staged 0, `main...origin/main [ahead 519]`.
- **Nunca push, nunca stash, nunca git mutante sin orden explícita del owner para ese cambio exacto.**
- Autoridad canónica: `docs/ROADMAP-EJECUCION-2026-08-19.md`. Constitución: `packages/core/scripts/quality-evidence/programs/modern-rescue/` (README.md, program.json, customization-model.json, agent-orchestration.json) + `AGENTS.md` raíz. Verificación: `node packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs` (hoy **BLOCKED**, ver abajo).
- Handoff previo: `/Users/daniel/Developer/Rottay/modern-rescue-kimi-dt-handoff-2026-08-23.md` (SHA `088ddd360676439719a203271a0ff2a067314f3ed0a2d434b33a89a81b84e665`).
- Re-auditoría independiente completa: `/private/tmp/modern-rescue-kimi3-independent-reaudit-2026-08-23.md` — veredicto **ACCEPT_WITH_CORRECTIONS**. Leéla entera; sus hallazgos H1–H24 y correcciones C1–C7 son tu cola inmediata.

## Estado real verificado por la re-auditoría (no lo re-verifiques salvo regresión concreta)

- F0/F0.5/F1 100%, F2 seguro 100%, F4A 14/14 cerrado (doblemente auditado, evidencia durable en `docs/f4a/` + 5 docs de cierre sólo en /tmp — los docs de cierre están persistidos en docs/evidence/2026-08/ (C5 hecho)).
- F4B 4/20 COMPUTED_VERIFIED: `spacing.rhythm` (56847146f), `surfaces.effect-intensity` (5ce42e1b7), `shape.radius-scale` (48fa4f20a), `experience.profile` (56fb593fd). 24 receipts válidos y frescos bajo el validador v2, causales, sin falsos verdes. Deuda honesta: bithire/technical DESIGNED_NULL, bithire/editorial DIVERGENCE (ambas medidas, NO receipted).
- Estimación del programa: 39–43% realizado (cota prudente, sin fórmula publicada).
- Arquitectura central verificada sólida: emisor único `compileTheme`, ingress dual estático/DB convergente, 20 controles (13 standard + 7 pro), verticales rottay/bithire/evnto divergentes de verdad, `effectIntensity 0.58` preservado.

## Correcciones que bloquean reanudar F4B (hacerlas PRIMERO, en este orden)

1. **C2 — program-check BLOCKED en HEAD desde 56847146f**: 24 fallos en celdas `spacing.rhythm` de `manifest/families/primitive/layout/{flex,grid,space,stack}.json` (evidenceIds `R2:…` apuntan a un root inexistente — los artifacts están en `test-artifacts/.../F4B/spacing-rhythm/`; `mechanism: null`; `internalChannels` vacío; vocabulary evidenceKind `computed-causal-run` no aceptado). Corregir las celdas o enmendar la ley del gate UNA vez, con asiento. Unificar el vocabulary evidenceKind con los otros 3 controles (`static-db-computed-parity`). Gate verde antes de cualquier commit F4B nuevo.
2. **C3 — gat-07 stale otra vez**: resellado 08-22 (`1c127bf0e`), invalidado 08-23 por la serie F4B (18 inputs modificados + 4 archivos nuevos sin sellar). Resellar ahora y hacer el resello paso obligatorio del cierre de cada packet futuro.
3. **C4 — regularizar el desbloqueo de F4B**: los 15 commits que drenaron `unknownProvenance` 2.024→0 (`8d2985638`…`6cfdcc1a9`, 08-22) no tienen asiento en roadmap, ni ruling de apertura de Lote B, ni la doble postaudit que la condición vinculante (roadmap:1142-1146) exigía; tocaron 2 archivos de `src/` fuera del write-set declarado. Producir la doble postaudit retroactiva y asentar, o declarar la brecha y su remedación.; la acción inmediata es la declaración de brecha ya asentada en el roadmap (asiento 2026-08-23) y agendar la doble postaudit retroactiva o la dispensa explícita del owner
4. C1 — packet de sucesión DT: REDACTADO Y BLOQUEADO hasta orden explícita del owner. La autoridad viva (AGENTS.md, CLAUDE.md, agent-orchestration.json, program-check.mjs, README, tenant-art-direction.json, rounds.json, checkpoint.intent.json) nombra hoy a Codex como DT y ESO ES CORRECTO: no editar ninguno de esos archivos por inferencia. Si el owner ordena la sucesión, ejecutar el packet completo en UN commit con procedimiento T-1 (program-check + program-check.test antes y después) usando la fecha real de la orden. Independiente de la sucesión: el refresh de checkpoint.intent.json currentWave (F4A cerró 08-22) es un micro-packet T-1 propio, y el fence SIGHTED_APPROVER (receipts.mjs:7 'Codex (DT)' vs test :197 'Codex') tiene ruling previo del dueño "fuera de alcance" (roadmap, packet effect-intensity) — reabrirlo requiere superseder ese ruling con asiento
5. C5 — evidencia persistida: los memos /tmp con SHA asentado en el roadmap (60) más los 3 artefactos del 2026-08-23 están copiados en docs/evidence/2026-08/ con INDEX.md; verificar que el INDEX no registre MISMATCH antes de confiar en una copia
6. **C6 — deudas con dueño**: asignar packet al defecto de cascada bithire (`OPEN_VERTICAL_CASCADE_DEFECT`, `artifacts/bithire/index.css:644` vs `:1496` — experience.profile no pinta en bithire/dark vía static) y forzar la decisión owner sobre `OPEN_ARM_ASYMMETRY` antes de F2-asimétrico/F3.
7. **C7 — barrido menor** (un solo commit chore): corregir narrativa roadmap:1642 (ya corregida en el roadmap: ambos controles fueron reescritos a nivel archivo en 56fb593fd y sólo conservaron el roundId R2); quitar import muerto `validateResponsivePostureSelection` (`composition/tenant-theme/index.ts:24`) y los dos docblocks falsos asociados; retirar o gate-ar el lowering muerto `compileAppearanceVariables` (`kernel/runtime/appearance/index.ts:1008`); podar o re-anclar `phase-a/ledger-schema.json` (cita paths pre-F0.5, cero consumidores); el stash pre-programa queda OPEN_OWNER: ninguna operación de stash sin orden explícita del owner; considerar backup de los 519 commits locales.

## Roles y workers (no crear sesiones nuevas mientras existan)

- `f05-opus:0.0` — Claude Opus, único writer/runner.
- `f05-sonnet:0.0` — Sonnet Max, mapper mecánico estrictamente read-only.
- `fable-ejec:0.0` — Fable 5, auditor read-only focal. Un solo postaudit por packet.
- Vos: DT. Decidís y coordinás; no escribís source delegado ni delegás authority docs a workers. No reabras F4A/PRE_F4B ni auditorías generales sin regresión concreta. — aplican las correcciones del punto 1: sin orden del owner no sos DT y no se toca autoridad viva

## Secuencia posterior (vinculante)

1. C1–C5 (correcciones) → commit(s) parciales sin push, roadmap actualizado.
2. Reanudar F4B control por control hasta 20/20. El próximo candidato ya estaba en mapping: elegir entre `responsive.posture` (tier pro, DATA NOT CSS, terminal NORMALIZED_APPEARANCE_DATA — consumidor React `resolveActiveResponsivePosture`; cuidado: el harness CSS estático no lo mide) y `density.mode` (tier standard, canal real leído `--ds-density-effective-scale`; prioridad owner responsive/mobile + layout reflow). Re-despachar mapping read-only a Sonnet si el encargo anterior quedó interrumpido sin entregable (verificar `/private/tmp/f4b-control-5-mapping-sonnet.ready`).
3. Por control: mapping Sonnet read-only → decisión DT → preflight + implementación Opus (único writer) → postaudit único Fable → roadmap + resello gat-07 + commit parcial.
4. Después de F4B 20/20: F2 asimétrico → F3 skins/responsive → F4C premium vertical → F5 → F6 → F7 → F8 → F9 (5100/5100).
5. Riesgos estructurales para F4B/F9: reachability probada por cadena/string-contains (no ejecución) en 16/20 controles; 13/20 `staticBrandThemePath` no-literales no caminables por el harness; 254/255 celdas experience.profile con razonamiento MUST_NOT_REACH falsado (no flip masivo — corregir celda por celda con testigo propio).

## Forma de trabajo

- Código y cierre causal antes que memos extensos; un solo writer sobre source compartido.
- Auditoría sólo en puntos de decisión o al final de un packet.
- Stops falsables: problema local → corregir el packet; decisión arquitectónica real → registrar y decidir una sola vez.
- Preservar Modern como prioridad; Classic/Rustic sólo compatibilidad necesaria.
- No build/generated/browser salvo que el packet lo requiera y esté dentro de su write-set.
- **Lección de la re-auditoría: no commitear con gates blocking rojos y no adelantar el libro mayor a la verificación.**
