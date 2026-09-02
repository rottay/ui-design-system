# Modern Rescue — Revisión Fable 5 de las correcciones Kimi K3 (2026-08-23)

**Rol:** Fable 5, auditor independiente estrictamente READ-ONLY. Encargo focal: adjudicar H1–H24, C1–C7 y los 14 puntos `ROADMAP_PATCH_REQUIRED` de la re-auditoría Kimi K3.
**Insumos verificados por SHA-256 (match exacto):**
- `/private/tmp/modern-rescue-kimi3-independent-reaudit-2026-08-23.md` → `2b87b306e2b4d372533dd314f35d8e6c165e027e806eab4b16fecf391791a518` ✓
- `/private/tmp/modern-rescue-kimi3-fresh-session-prompt-2026-08-23.md` → `c328f4254c1509c1894885028c1bd85f5d170f1f84ade0fcee8f6590953fbd62` ✓
- Handoff `/Users/daniel/Developer/Rottay/modern-rescue-kimi-dt-handoff-2026-08-23.md` → `088ddd360676439719a203271a0ff2a067314f3ed0a2d434b33a89a81b84e665` ✓ (recomputado)

**Baseline propio:** HEAD `56fb593fd`, worktree limpio. Esta revisión escribió únicamente los dos archivos de entrega en `/private/tmp`. Checks read-only ejecutados por mí: `program-check.mjs`, `gat07:check` (Node 22.17.0 pineado), `node --test` del drill de receipt, git log/show/reflog/stash list, greps y recomputos de SHA.

---

## 1. Veredicto global

# **ACCEPT_WITH_AMENDMENT** sobre la re-auditoría Kimi — con UNA corrección constitucional obligatoria

El cuerpo técnico de Kimi es **correcto y verificado**: confirmé con evidencia propia H1, H2, H3 (con enmienda de conteo), H5 (con reducción), H6, H7, H8 (mecánicamente), H9 (parcial), H10, H11, H12 (núcleo), H13, H14, H15, H16 y H20. Cero hallazgos técnicos falsos en mi muestreo.

El defecto central es **C1/H4: Kimi confunde un handoff PREPARADO con una transferencia de autoridad CONSUMADA**. Determinación explícita (pregunta vinculante del encargo):

> **La sucesión DT 2026-08-23 (Codex → Kimi K3) NO está consumada.** La última orden explícita del owner fue: Codex no transfiere ni opera la sesión Kimi; sólo deja un prompt; el owner abre/comunica personalmente la sesión fresca. La autorización posterior fue para contactar a Kimi K3 **únicamente para esta re-auditoría** — y el propio header de la re-auditoría lo confirma ("auditor principal independiente, READ-ONLY, por override del owner 2026-08-23"). Un documento de handoff redactado por Codex (SHA `088ddd36…`) no puede consumar una sucesión que sólo una orden del owner consuma. **Toda la autoridad viva verificada nombra hoy a Codex como DT y eso es el estado CORRECTO, no drift**: `program-check.mjs` (`LIVE_COORDINATOR='Codex'`, cadena de 2 records), `AGENTS.md:34-56`, `CLAUDE.md`, `orchestration/index.json` (coordinator.model + succession de 2 records), README del programa (:194,:254,:308), `art-direction/index.json:7,9,367`, `rounds/index.json`, `checkpoint/index.json:10-11`. Aplicar C1 tal como está escrito **fabricaría una mentira de autoridad** (una sucesión con fecha 2026-08-23 que ningún owner ordenó). Ninguna recomendación de este memo declara a Kimi DT vivo; el packet de sucesión queda REDACTADO Y BLOQUEADO hasta orden explícita del owner, y se ejecutará con la fecha REAL de esa orden, no con 2026-08-23 por retroproyección.

Lo demás de la re-auditoría se sostiene: los reds H1/H2 son reales (los corrí yo), la brecha de escribanía H3 es real (grep negativo en el roadmap para los 15 SHAs del drenado; sin memos de doble postaudit en /tmp), y el orden de correcciones C2→C3→C4 antes de F4B 5/20 es el correcto.

---

## 2. Evidencia propia H1–H9 (resumen)

| H | Veredicto | Evidencia propia |
|---|---|---|
| H1 | **CONFIRMADO** | Corrí `program-check.mjs` en HEAD: `BLOCKED`, exactamente **24 fallos**, todos `spacing.rhythm` en `manifest/families/primitive/layout/{flex,grid,space,stack}.json` (4 archivos × 6 clases: mechanism null, internalChannels vacío, evidenceIds `R2:…` fuera del root — los artifacts viven en `artifacts/quality/programs/modern-rescue/cascade-proofs/controls/spacing-rhythm/computed-static-db/` —, evidenceKind sin computed-delta ni exact-restore). "Desde `56847146f`" corroborado por aritmética del propio ledger: roadmap:1350 (25→24 en `5ce42e1b7`, "0 nuevos") y :1456 ("los mismos 24… que ya existían"). |
| H2 | **CONFIRMADO** | Corrí `gat07:check` con Node 22.17.0: `stale/missing` (semantic-evidence.json + semantic-hash.txt). Intersección propia sello vs `git diff 1c127bf0e..HEAD`: **exactamente 18 inputs sellados modificados** de 134 archivos cambiados (el "4 nuevos sin sellar" no lo reconté; el veredicto stale no depende de él). Último resello: `1c127bf0e` (08-22). Ningún resello por packet durante F4B. |
| H3 | **CONFIRMADO con enmienda** | El rango `8d2985638..6cfdcc1a9` inclusive son **15 commits, no 14** (git rev-list). Los 15 con cuerpo vacío (verificado). Exactamente **2 archivos de `packages/core/src/`** tocados: `foundation/tokens/ts/runtime/personality/index.ts` y `infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx` — fuera del write-set mínimo declarado A4/A5/A6 (roadmap:1140-1141). Grep del roadmap: **ningún** asiento cita esos SHAs, ni el ruling de Lote B, ni las dos auditorías que la condición vinculante roadmap:1142-1146 exigía. En /tmp hay logs de corrida, no memos de postaudit. |
| H4 | **RECHAZADO como enmarcado** | Los 8 puntos nombran a Codex — verificado uno por uno — pero eso es el estado vivo CORRECTO (§1). No hay drift; habría drift recién cuando el owner consuma la sucesión. |
| H5 | **CONFIRMADO con reducción** | roadmap:1199 dice "24 receipts, todos válidos y frescos" — cierto bajo el validador v2. Pero **el ledger NO ocultó el gate rojo**: los 24 fallos están asentados como "heredados" packet por packet en :1350-1355, :1456-1458 y :1615-1618, y el handoff los declara en "Reds y deudas honestas" (:46). Es una omisión en la fila-resumen, no "el libro mayor adelantándose a la verificación". La enmienda a :1199 procede igual (claridad del rollup). |
| H6 | **CONFIRMADO** | `packages/core/manifest/controls/experience.profile.json:95` declara `OPEN_VERTICAL_CASCADE_DEFECT` con remediation "Out of scope for a single-control packet". Anclas reales: `artifacts/bithire/index.css:644` (`--ds-letter-spacing-heading: -0.025em`) vs `:1496` (`-0.01em`, bloque dark con selector de mayor especificidad). Sin dueño de packet. |
| H7 | **CONFIRMADO** | `experience.profile.json:103` declara `OPEN_ARM_ASYMMETRY` con remediation "Owner adjudication… a compiler decision above this packet". Sin resolver. |
| H8 | **CONFIRMADO mecánicamente, ENMENDADO procesalmente** | Corrí el suite: **11/12 pass**, el que falla es exactamente `negative drill: the producer may not be the sighted approver` (`tooling/resolution-probe/composition/receipt/tests/index.test.mjs:197`); `SIGHTED_APPROVER='Codex (DT)'` en `quality-evidence/v2/receipts.mjs:7` vs `'Codex'` pasado. **PERO** este rojo ya está asentado con **ruling del dueño** "fuera de alcance" en roadmap:1356-1359 — Kimi lo presenta como hallazgo sin escribanía y no lo es. Reabrirlo requiere asiento que supersede ese ruling (dueño), no un fix colado en un barrido. Y "doblemente stale tras la sucesión" cae con H4. |
| H9 | **DIVIDIDO** | `checkpoint/index.json:3` describe F4A como frente abierto con K4/K5 como próximos packets — **genuinamente stale HOY** (F4A cerró 08-22), independiente de toda sucesión. En cambio `rounds/index.json` (`codex-audit`/`Codex GO`) **no está stale**: Codex ES el DT vivo. La neutralización "asiento DT" es higiene deseable, diferida al packet de sucesión. Nota: `program-check.mjs:145,972-975` lee y valida `checkpoint/index.json` — su edición es contrato máquina bajo cuidado T-1, no documentación. |

Otros verificados: H10 (4 cuerpos vacíos ✓), H11 (reflog: `reset: moving to HEAD~1` 08-19 19:23, re-commit `6de85d530` 19:34 ✓, sin push), H12 (núcleo ✓ — ver §4 patch 5: la corrección de Kimi es a su vez incorrecta), H13 (docs en /tmp ✓; **hallazgo ampliado: son 60, no 9** — ver C5), H14 (import muerto, 1 sola ocurrencia = el import ✓; path real `infrastructure/compilers/composition/tenant-theme/index.ts`), H15 (✓ con matiz: la única mención productiva es un COMENTARIO en el provider; los consumidores reales son tests — "retirar o gate-ar" sigue bien), H16 (✓ en sustancia: ~12-13 formas no literales en el listado de `staticBrandThemePath`), H20 (stash `stash@{0}` pre-programa existe ✓).

---

## 3. Matriz C1–C7

| C | Veredicto | Motivo + evidencia |
|---|---|---|
| **C1** | **REJECT como está escrito → reemplazar por C1′** | Consuma por inferencia una sucesión no ordenada (§1). **C1′ (lo ejecutable AHORA, documental):** asiento en el roadmap que registre (a) el override del owner 2026-08-23 autorizando la re-auditoría Kimi READ-ONLY, su veredicto y los SHA de sus 2 artefactos; (b) que existe un handoff PREPARADO a Kimi (SHA `088ddd36…`) **sin efecto de autoridad** hasta orden del owner; (c) que Codex sigue siendo DT vivo. **C1″ (diferido, owner-gated):** el packet completo de sucesión (patches 6–12 y el lane authority de 13) queda redactado y NO ejecutado; al ejecutarse usa la fecha real de la orden y el procedimiento T-1 (program-check + program-check.test antes y después), como Kimi correctamente especifica. |
| **C2** | **ACCEPT** | Verificado con corrida propia (H1). Bloquea todo commit F4B nuevo. Las dos vías (corregir celdas vs enmendar la ley del gate UNA vez) son decisión DT real: la propia celda documenta el choque de forma (flex.json:408 — dispositionLaw exige staticSourceBindings/dbSourceBindings separados y la celda lleva sourceBindings plano) y el vocabulary `computed-causal-run` vs `static-db-computed-parity` debe unificarse en un solo ruling. **Tranche de implementación (T-A), no del paquete documental.** |
| **C3** | **ACCEPT** | Verificado con corrida propia (H2). Dos mitades: el resello (`gat07:write`) es implementación T-A; la **regla "resello por lote al cierre de cada packet F4B"** es documental y entra en el paquete Opus ahora. |
| **C4** | **ACCEPT_WITH_AMENDMENT** | La brecha es real (H3). Enmiendas: (i) son **15 commits**, no 14; (ii) la acción documental AHORA es **declarar la brecha** en el roadmap (commits, cuerpos vacíos, 2 src fuera de write-set, ausencia de asiento/ruling/doble postaudit) — sin fabricar retroactivamente un ruling que no se registró; (iii) la **doble postaudit retroactiva** del diff `8d2985638~1..6cfdcc1a9` es trabajo de auditoría que el DT agenda (o el owner dispensa explícitamente) ANTES de F4B 5/20 — no es un edit del writer documental. |
| **C5** | **ACCEPT_WITH_AMENDMENT (alcance ampliado)** | Verifiqué que el roadmap referencia **60 memos `/private/tmp/*.md` distintos con SHA asentado y los 60 existen hoy** (0 missing); muestreo de integridad 3/3 SHA exactos (`f4a-final-conflict-fable.md`, `f4b-experience-profile-fable-delta.md`, `pre-f4b-lot-a-unknown-provenance.md`). `/private/tmp` es volátil: la cadena probatoria del ledger entera está en medio efímero, no sólo los 9 que Kimi nombra. **Persistir los 60** con verificación SHA previa (procedimiento exacto en §6.D2). |
| **C6** | **ACCEPT (dividido en dos actos)** | Ambos defectos verificados en `experience.profile.json:95,103`, sin dueño. Acto documental AHORA: asiento OPEN_DT (crear el packet del defecto de cascada bithire — es propiedad del generador de artifacts verticales, no de experience.profile) + asiento OPEN_OWNER (decisión de asimetría de brazos, requerida antes de F2-asimétrico/F3). Asignar el dueño concreto es prerrogativa del DT, no del writer. |
| **C7** | **ACCEPT_WITH_AMENDMENT** | Todo el barrido es **tranche de código separado (T-C)**, jamás parte del commit documental. Enmiendas: (a) la corrección de narrativa :1642 va en el paquete documental pero con MI texto, no el de Kimi — su reemplazo ("sólo spacing.rhythm conservó emisión original") es factualmente falso: `git show 56fb593fd` reescribe los 8 artifacts + 8 receipts de spacing-rhythm (+582 líneas cada artifact) y los receipts llevan `createdAt` 2026-08-23T10:12Z; ambos controles fueron re-emitidos a nivel archivo y sólo conservaron el roundId R2; (b) **el stash NO se "resuelve" en un barrido chore**: toda operación de stash está vetada sin orden explícita del owner (ley vigente del programa) — queda OPEN_OWNER; (c) el fix del fence (patch 14) tiene ruling del dueño "fuera de alcance" en roadmap:1356-1359 — reabrirlo exige superseder ese ruling con asiento, no colarlo; (d) H15 con matiz: `compileAppearanceVariables` tiene consumidores de test (retirarlo rompe tests — el packet T-C debe incluirlos en su write-set). |

---

## 4. Adjudicación de los 14 `ROADMAP_PATCH_REQUIRED`

| # | Patch | Veredicto | Detalle |
|---|---|---|---|
| 1 | roadmap:1199 | **APLICAR AHORA, enmendado** | Texto exacto en §6.D1b. Se añade que los 24 ya estaban asentados como heredados en los asientos de packet (la fila-resumen omite, el ledger no miente). |
| 2 | roadmap:18-22 (§0.1) | **ENMENDAR: no reescribir historia** | §0.1 es un asiento histórico del 08-19 ("no se reescriben asientos históricos" es doctrina del propio ledger). El estado vigente de gat-07 va en el asiento vivo nuevo (§6.D1a); en §0.1 no se toca nada. |
| 3 | roadmap:491,512-524 | **ENMENDAR: append, no rewrite; sin "DT vivo: Kimi"** | :491-524 es el ancla histórica del asiento 08-21 y queda intacta. Se APPENDEA un asiento "estado vigente 2026-08-23" (§6.D1a) con HEAD `56fb593fd`, **DT vivo: Codex**, handoff preparado sin efecto, re-auditoría Kimi owner-authorized. La parte "DT vivo: Kimi K3 por sucesión 2026-08-23" se **RECHAZA** (§1). |
| 4 | asiento PRE_F4B drenado | **APLICAR AHORA, enmendado** | Como declaración de brecha (C4): 15 commits, sin ruling registrado, sin doble postaudit; remediación agendada. Texto en §6.D1d. No se edita el checkpoint histórico :1142-1146. |
| 5 | roadmap:1642 | **APLICAR AHORA, con texto corregido** | El texto de Kimi introduce un error nuevo (§3.C7.a). Texto exacto en §6.D1c. |
| 6 | AGENTS.md | **DIFERIR** (owner-gated, C1″) | Hoy es exacto. Cambiarlo sin orden = mentira de autoridad. |
| 7 | CLAUDE.md | **DIFERIR** (owner-gated) | Ídem. |
| 8 | orchestration/index.json | **DIFERIR** (owner-gated) | Ídem; el 3er record de sucesión se escribe con la fecha real de la orden. |
| 9 | program-check.mjs | **DIFERIR** (owner-gated) | Ídem; procedimiento T-1 correcto cuando ocurra. |
| 10 | README del programa | **DIFERIR** (owner-gated) | Ídem. |
| 11 | art-direction/index.json | **DIFERIR + motivo rechazado** | Su justificación es errónea: ":9 Kimi retired from all live seats" NO está "contradicho por el handoff" — un handoff de Codex no override una orden del owner. El override del 08-23 fue puntual (re-auditoría) y se registra en el roadmap, no reescribiendo la constitución. |
| 12 | rounds/index.json | **DIFERIR** | Hoy no está stale (Codex es DT). Neutralización a "asiento DT" = higiene del packet de sucesión. |
| 13 | checkpoint/index.json | **DIVIDIR** | `currentWave` stale (F4A cerró): corregible YA, pero es contrato máquina leído por program-check (:145,:972-975) → **micro-packet T-A propio** (DT autoriza; program-check antes/después), NO en el commit documental. `authority: codex-dt`: exacto hoy → DIFERIR. |
| 14 | fence index.test.mjs:197 | **TRANCHE SEPARADO, owner-gated** | Defecto real (corrida propia 11/12) pero con ruling del dueño "fuera de alcance" ya asentado (roadmap:1356-1359). Fix = edit de código + superseder un ruling del owner → requiere asiento con esa autorización. No entra en el paquete documental. |

**Resumen:** aplicar ahora (enmendados): 1, 4, 5 + la mitad documental de 2/3. Diferir hasta orden owner: 6, 7, 8, 9, 10, 11, 12, mitad de 13, 14. Ninguno se aplica tal cual está redactado por Kimi sin enmienda.

---

## 5. Separación vinculante (pregunta 4)

**(a) Actualización documental honesta — AHORA (paquete Opus, §6):** asiento vivo 2026-08-23 (autoridad real + re-auditoría + brecha C4 + reglas C3-doc + OPEN de C6), enmiendas :1199 y :1642, persistencia C5 de los 60 memos, prompt fresco corregido.

**(b) Implementación/gates pendiente (fuera del paquete documental):**
- **T-A (writer bajo DT, bloquea F4B 5/20):** C2 (celdas spacing.rhythm o enmienda única de ley + vocabulary), resello gat-07 (`gat07:write`), micro-packet `checkpoint/index.json currentWave`, y la doble postaudit retroactiva C4 (Fable + independiente) o dispensa explícita del owner.
- **T-C (barrido de código C7, no bloqueante):** import muerto + docblocks (tenant-theme), retiro/gate de `compileAppearanceVariables` (con sus tests), poda/re-anclaje de `phase-a/ledger-schema.json`, convención de cuerpo de commit hacia adelante.

**(c) Cambios de autoridad que requieren NUEVA orden del owner:** todo el packet de sucesión C1″ (patches 6–12, lane de 13, y el fence 14 por su ruling previo); la resolución del stash; la política de backup de los 519 commits locales (H20) — decisión operativa del owner, no del DT.

---

## 6. Write-set documental exacto — un solo writer (Opus), un solo commit

Commit: `docs(modern-rescue): asiento 2026-08-23 — re-auditoria Kimi, brecha PRE_F4B, correcciones de narrativa y persistencia de evidencia` (sin push; sin Co-Authored-By; sin emojis). Write-set cerrado = D1 + D2 + D3. **Prohibido tocar:** AGENTS.md, CLAUDE.md, todo `packages/core/scripts/quality-evidence/programs/modern-rescue/*` (constitución/contratos máquina), `packages/core/src/**`, `packages/core/manifest/**`, `test-artifacts/**`, y los archivos de Kimi en /tmp.

### D1 — `docs/ROADMAP-EJECUCION-2026-08-19.md`

**D1a. APPEND** (insertar inmediatamente antes de la línea `**F0 — CERRADO (2026-08-19).**`, hoy :1653, dejando línea en blanco antes y después):

```markdown
#### Asiento de autoridad y auditoría — 2026-08-23 (estado vigente)

- HEAD al abrir este asiento: `56fb593fdc134cf17b5bc9842085e3ff2e798d26`; worktree limpio.
- **DT vivo: Codex.** No hubo sucesión DT el 2026-08-23. Existe un handoff
  PREPARADO a Kimi K3 (`/Users/daniel/Developer/Rottay/modern-rescue-kimi-dt-handoff-2026-08-23.md`,
  SHA `088ddd360676439719a203271a0ff2a067314f3ed0a2d434b33a89a81b84e665`) que
  NO tiene efecto de autoridad: la última orden explícita del owner fue dejar
  un prompt sin transferir ni operar la sesión, y la autorización posterior a
  Codex fue contactar a Kimi K3 únicamente para la re-auditoría. La sucesión
  sólo la consuma una orden explícita del owner; cuando ocurra, el packet de
  autoridad (AGENTS.md, CLAUDE.md, orchestration/index.json, program-check.mjs,
  README del programa, art-direction/index.json, rounds/index.json,
  checkpoint/index.json, fence SIGHTED_APPROVER) se ejecuta en UN packet con
  procedimiento T-1 y con la fecha real de esa orden.
- **Re-auditoría independiente Kimi K3 (owner override 2026-08-23, READ-ONLY):**
  veredicto `ACCEPT_WITH_CORRECTIONS`.
  Memo: `/private/tmp/modern-rescue-kimi3-independent-reaudit-2026-08-23.md`,
  SHA `2b87b306e2b4d372533dd314f35d8e6c165e027e806eab4b16fecf391791a518`.
  Prompt fresco: `/private/tmp/modern-rescue-kimi3-fresh-session-prompt-2026-08-23.md`,
  SHA `c328f4254c1509c1894885028c1bd85f5d170f1f84ade0fcee8f6590953fbd62`.
  Revisión Fable de sus correcciones:
  `/private/tmp/modern-rescue-fable-review-kimi-corrections-2026-08-23.md`
  (SHA registrado en su archivo `.ready`). Los tres persistidos en
  `docs/evidence/2026-08/` por este asiento.
- **Estado de gates en HEAD (medido, no heredado de memos):**
  `program-check.mjs` = `BLOCKED`, 24 fallos, todos celdas `spacing.rhythm` de
  `manifest/families/primitive/layout/{flex,grid,space,stack}.json`
  (mechanism null; internalChannels vacío; evidenceIds `R2:…` fuera del
  evidence root — los artifacts viven en
  `artifacts/quality/programs/modern-rescue/cascade-proofs/controls/spacing-rhythm/computed-static-db/`; evidenceKind
  sin computed-delta ni exact-restore). Heredado desde `56847146f` (25→24 en
  `5ce42e1b7`, 0 nuevos después). `gat07:check` = STALE: sello vigente
  `1c127bf0e` (2026-08-22) invalidado por la serie F4B (18 inputs sellados
  modificados desde el sello). Drill `composition/receipt` 11/12 (rojo
  heredado con ruling del dueño "fuera de alcance", asentado arriba en el
  packet de effect-intensity).
- **Regla vinculante nueva (C3):** cada packet F4B restante cierra con resello
  `gat07:write` como paso obligatorio, antes de su commit.
- **Correcciones que bloquean F4B 5/20 (orden):** C2 (program-check verde:
  corregir las celdas o enmendar la ley del gate UNA sola vez con asiento,
  unificando el vocabulary evidenceKind con los otros 3 controles), C3
  (resello gat-07), C4 (abajo). C2 y el refresh de `checkpoint/index.json`
  (`currentWave` describe F4A como frente abierto; F4A cerró 2026-08-22) son
  contratos máquina: se ejecutan como packets T-A con program-check corrido
  antes y después, nunca como edits documentales.
- **Deudas con dueño (C6):** `OPEN_VERTICAL_CASCADE_DEFECT`
  (`manifest/controls/experience.profile.json:95`; bithire dark:
  `artifacts/bithire/index.css:644` vs `:1496`) queda `OPEN_DT` — crear packet
  propio: es propiedad del generador de artifacts verticales, no de
  `experience.profile`. `OPEN_ARM_ASYMMETRY` (`experience.profile.json:103`)
  queda `OPEN_OWNER` — decisión requerida antes de F2-asimétrico/F3.
- **OPEN_OWNER adicionales:** resolución del `stash@{0}` pre-programa (toda
  operación de stash está vetada sin orden explícita del owner); política de
  backup de los 519 commits locales sin push; reapertura (o no) del fence
  `SIGHTED_APPROVER` cuyo rojo tiene ruling previo del dueño.
```

**D1b. EDIT :1199** — reemplazo exacto de string (una ocurrencia). OLD (literal):

```
**8+6+6+4 = 24 receipts, todos válidos y frescos**, con los
```

NEW (literal, una sola línea):

```
**8+6+6+4 = 24 receipts, todos válidos y frescos bajo el validador v2** — las 8 celdas manifest de `spacing.rhythm` siguen rechazadas por `program-check` (BLOCKED heredado desde `56847146f`, asentado como heredado en los packets 2/3/4; corrección C2 pendiente, ver asiento 2026-08-23) —, con los
```

**D1c. EDIT :1642-1643** — reemplazo exacto (una ocurrencia; ambos strings arrancan con 4 espacios de indentación, verificado byte a byte). OLD (literal, 2 líneas):

```
    `spacing.rhythm` y `surfaces.effect-intensity` **no** se reemitieron y quedan en
    **R2**. Mismos escenarios, mismos binds, mismo árbol final. Revalidación posterior:
```

NEW (literal, 5 líneas):

```
    `spacing.rhythm` y `surfaces.effect-intensity` **no** se re-emitieron con
    roundId nuevo y quedan en **R2**; a nivel archivo ambos SÍ fueron reescritos
    dentro de `56fb593fd` (los 8 artifacts y 8 receipts de spacing-rhythm y los
    receipts de effect-intensity llevan `createdAt` 2026-08-23T10:12Z/10:49Z).
    Mismos escenarios, mismos binds, mismo árbol final. Revalidación posterior:
```

**D1d. APPEND** (a continuación del asiento D1a, como subsección del mismo):

```markdown
##### Brecha de escribanía PRE_F4B→F4B (C4) — declarada, no regularizada

La condición vinculante de apertura del Lote B (asiento PRE_F4B, decisión 6c:
`unknownProvenance == []` real MÁS doble postaudit — reauditoría independiente
A4–A9 y postaudit Fable del diff completo) se cumplió sólo a medias. El drenado
2.024→0 existe: **15 commits** `8d2985638..6cfdcc1a9` (2026-08-22, inclusive),
todos con cuerpo vacío, que además tocaron **2 archivos de `packages/core/src/`**
fuera del write-set mínimo declarado A4/A5/A6
(`foundation/tokens/ts/runtime/personality/index.ts` y
`infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx`).
Ni esos commits, ni el ruling de apertura del Lote B, ni las dos auditorías
exigidas tienen asiento en este ledger, y no se hallaron memos de postaudit en
/tmp (sólo logs de corrida). **Remediación vinculante antes de F4B 5/20:** el
DT agenda la doble postaudit retroactiva del diff `8d2985638~1..6cfdcc1a9`
(incluidos los 2 archivos src) y asienta su resultado acá, o el owner dispensa
la condición explícitamente y la dispensa se asienta. Esta declaración no
inventa retroactivamente un ruling que no se registró.
```

**D1e/D1f:** ya integrados dentro de D1a (regla gat-07 por packet; OPEN de C6). No duplicar.

### D2 — Persistencia de evidencia (C5 ampliado)

1. Crear `docs/evidence/2026-08/`.
2. Enumerar: `grep -o '/private/tmp/[a-z0-9._-]*\.md' docs/ROADMAP-EJECUCION-2026-08-19.md | sort -u` (hoy: 60 paths; los 60 existen).
3. Para cada path: recomputar SHA-256; buscar el SHA asentado para ese path en el roadmap; **copiar sólo si coincide**, preservando basename, a `docs/evidence/2026-08/`. Si un path aparece en el roadmap sin SHA asentado, copiarlo igual y marcarlo `SIN_SHA_ASENTADO` en el índice. Si un SHA no coincide, NO copiar y registrar el mismatch.
4. Copiar además los 3 artefactos del 2026-08-23 (re-auditoría Kimi, prompt fresco Kimi, esta revisión Fable) verificando sus SHA (§0 de este memo).
5. Escribir `docs/evidence/2026-08/INDEX.md`: una fila por archivo — basename, path /tmp de origen, SHA-256 recomputado, `MATCH`/`SIN_SHA_ASENTADO`/`MISMATCH(no copiado)`.
6. Los archivos copiados son **snapshots inmutables**: no se editan jamás; una corrección futura es un archivo nuevo.

### D3 — Prompt fresco corregido: `docs/prompt-dt-fresh-session-2026-08-23.md` (archivo NUEVO)

Base: el texto íntegro del prompt Kimi (SHA `c328f425…`), con EXACTAMENTE estas 8 correcciones (el resto se copia verbatim):

1. Línea 3: reemplazar `Sos el DT entrante del programa Modern Rescue (WO-CRA-23)` por `Sos una sesión de trabajo del programa Modern Rescue (WO-CRA-23). El DT vivo es Codex; asumís el asiento DT SOLO si el owner te lo ordena explícitamente al abrir esta sesión — esa orden, con su fecha real, es la que consuma la sucesión y habilita el packet de autoridad; sin ella, coordiná el trabajo listado sin tocar autoridad viva`.
2. Ítem 4 (C1 — drift de autoridad): reemplazar el ítem completo por: `C1 — packet de sucesión DT: REDACTADO Y BLOQUEADO hasta orden explícita del owner. La autoridad viva (AGENTS.md, CLAUDE.md, orchestration/index.json, program-check.mjs, README, art-direction/index.json, rounds/index.json, checkpoint/index.json) nombra hoy a Codex como DT y ESO ES CORRECTO: no editar ninguno de esos archivos por inferencia. Si el owner ordena la sucesión, ejecutar el packet completo en UN commit con procedimiento T-1 (program-check + program-check.test antes y después) usando la fecha real de la orden. Independiente de la sucesión: el refresh de checkpoint/index.json currentWave (F4A cerró 08-22) es un micro-packet T-1 propio, y el fence SIGHTED_APPROVER (receipts.mjs:7 'Codex (DT)' vs test :197 'Codex') tiene ruling previo del dueño "fuera de alcance" (roadmap, packet effect-intensity) — reabrirlo requiere superseder ese ruling con asiento`.
3. Ítem 3 (C4): reemplazar `los 14 commits` por `los 15 commits` y agregar al final: `; la acción inmediata es la declaración de brecha ya asentada en el roadmap (asiento 2026-08-23) y agendar la doble postaudit retroactiva o la dispensa explícita del owner`.
4. Ítem 5 (C5): reemplazar por: `C5 — evidencia persistida: los memos /tmp con SHA asentado en el roadmap (60) más los 3 artefactos del 2026-08-23 están copiados en docs/evidence/2026-08/ con INDEX.md; verificar que el INDEX no registre MISMATCH antes de confiar en una copia`.
5. Ítem 7 (C7): en la frase del stash, reemplazar `resolver el stash pre-programa (2026-03-17)` por `el stash pre-programa queda OPEN_OWNER: ninguna operación de stash sin orden explícita del owner`; y en la frase de narrativa, reemplazar `(surfaces SÍ fue reemitido)` por `(ya corregida en el roadmap: ambos controles fueron reescritos a nivel archivo en 56fb593fd y sólo conservaron el roundId R2)`.
6. Sección "Estado real verificado": añadir al final del bullet de F4A: `los docs de cierre están persistidos en docs/evidence/2026-08/ (C5 hecho)`; y eliminar la frase `persistirlos es C5`.
7. Sección "Roles y workers": añadir al bullet final (`Vos: DT...`): `— aplican las correcciones del punto 1: sin orden del owner no sos DT y no se toca autoridad viva`.
8. Encabezado: añadir bajo el título una línea: `Versión corregida por revisión Fable 2026-08-23 (ver docs/evidence/2026-08/); reemplaza al prompt de /private/tmp con SHA c328f425… que presuponía una sucesión no consumada.`

**Criterio de aceptación del paquete (mecánico, para el postaudit):** (1) `git diff --name-only` del commit ⊆ {`docs/ROADMAP-EJECUCION-2026-08-19.md`, `docs/prompt-dt-fresh-session-2026-08-23.md`, `docs/evidence/2026-08/*`}; (2) cero cambios bajo `packages/`, `AGENTS.md`, `CLAUDE.md`; (3) los strings OLD de D1b/D1c aparecen exactamente una vez antes del edit y cero después; (4) `INDEX.md` sin filas `MISMATCH` copiadas; (5) `program-check.mjs` produce EXACTAMENTE los mismos 24 fallos antes y después del commit (el paquete documental no puede mover gates); (6) el roadmap no contiene ninguna afirmación de que Kimi K3 sea DT vivo.

---

## 7. ACCEPT_WITH_CORRECTIONS, porcentaje y bloqueantes (pregunta 6)

- **Sí**, el roadmap puede asentar el veredicto `ACCEPT_WITH_CORRECTIONS` de la re-auditoría Kimi (lo hace vía D1a), con la corrección constitucional de este memo: la parte de sucesión (H4/C1) queda rechazada como enmarcada.
- **Porcentaje defendible: 39–43%**, etiquetado como está en roadmap:1203 — "estimación prudente" del DT, cota sin fórmula publicada. La caracterización de Kimi ("cota prudente defendible, no cálculo auditable") es exactamente correcta; publicar la fórmula es opcional, no bloqueante. Nada de lo verificado hoy mueve la cota en ninguna dirección: la re-auditoría no certifica trabajo nuevo y los reds H1/H2 son de gate, no de regresión de contenido.
- **Bloqueantes reales antes de F4B 5/20 (en orden):**
  1. Paquete documental D1–D3 (honestidad del ledger; barato; primero).
  2. **C2** — program-check verde (decisión única del DT: celdas vs ley + vocabulary), verificado con corrida antes del siguiente commit F4B.
  3. **C3** — resello gat-07 (`gat07:write`, Node 22.17.0) + regla por-packet ya vinculante.
  4. **C4** — doble postaudit retroactiva del drenado o dispensa explícita del owner, asentada.
  5. Micro-packet `checkpoint/index.json currentWave` (T-1).
- **No bloquean F4B 5/20** (pero sí frentes posteriores): C6-decisión owner (bloquea F2-asimétrico/F3 y cualquier control que toque cascada vertical bithire; los candidatos 5/20 `responsive.posture`/`density.mode` no dependen del bloque dark de bithire), T-C (barrido C7), packet de sucesión C1″ (sólo si el owner la ordena).

---

## 8. Cierre

Repo intacto: esta revisión no escribió en el repo, no corrió builds ni tests mutantes (los checks ejecutados son el gate constitucional read-only, el check de sello con `--check-artifact`, y un suite de test puro sobre fixtures temporales propios del framework de Node). Entregables: este memo y su `.ready`.

**SOURCE_READY_FOR_DOC_PATCH** — el paquete documental D1+D2+D3 está autorizado para un único writer Opus tal como está especificado en §6, sin ningún edit de código, gates, constitución ni contratos máquina. Los tranches T-A/T-C y el packet de sucesión C1″ quedan explícitamente FUERA de esta autorización.
