# Modern Rescue — resolución DT de secuencia previa a K4

Fecha UTC: 2026-08-21T21:35:28Z
Repo: `/Users/daniel/Developer/Rottay/ui-design-system`
HEAD: `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`
Preestado: worktree limpio; staged 0.

## Autoridad y roles vigentes

Por aclaración explícita más reciente del owner, Kimi K3 está fuera por varios días y deja de ser gate, auditor, implementador o dependencia. Cualquier cláusula histórica `OPEN_KIMI`, `Kimi bloqueante`, `doble ACCEPT Fable+Kimi` o equivalente queda superseded.

Cadena vigente:

- Codex: DT y autoridad de adjudicación.
- Claude Opus: arquitectura e implementación de riesgo medio.
- Claude Sonnet Max: medición e implementación mecánica bajo brief cerrado.
- Fable 5: auditor formal estrictamente read-only.

## Insumos aceptados

- Inventario Sonnet: `/private/tmp/f4a-close-sonnet-inventory.md`, SHA `d52f36ac4a086bc3f196255573c0d4203032b194bd09685c32a7d569998abd87`.
- Adjudicación Opus: `/private/tmp/f4a-close-opus-adjudication.md`, SHA `9ab5229577259f5bc2df76f31522346f42a9dabb2a74c4ac0be438b8a6d15b2a`.
- Challenge Fable: `/private/tmp/f4a-close-opus-fable-challenge.md`, SHA `e5375ae35be400a78abb492d3d94b6ad112d57989ca02f85fb0968cde2939845`, `ACCEPT_WITH_CORRECTIONS`.

Se adoptan íntegramente C-1…C-7 de Fable. En particular:

- `realKeypathParity` se rediseña; queda prohibida la fórmula inalcanzable `evaluatedUnion - evaluatedIntersection -> 0` y quedan prohibidos `1918/1823` sin derivación reproducible.
- El denominador F4A-close es 14 salvo subsunción citada de la clase `evnto compone desde preset canónico`.
- El sandbox de `program-check.test.mjs` debe derivar/pinear la clausura completa C-4 y cumplir las negativas corregidas C-5.
- El work order PRE_F4B de cascade debe resolver postura de raíces `por-crear`/`solo-artefacto`.

## Reapertura expresa de la cola y decisión DT

La adjudicación histórica ubicaba la corrección de autoridad y `cra-12` después de K4. La reabro expresamente como DT por hechos nuevos verificados:

1. el punto de entrada humano vigente publica roles/wave/checkpoint retirados y todavía nombra a Kimi;
2. `program-state --check` existe pero no protege `gates:ci`;
3. la suite usada como evidencia de K4/K5 contiene una carrera blocking y ventanas P0 de `renameSync` sobre el manifest real;
4. el owner pidió pasos firmes, pruebas sólidas y continuidad durable, y aclaró que Kimi debe desaparecer de la cadena.

No es aceptable certificar K4/K5 con evidencia dependiente del timing y corregir la credibilidad del gate después. Por ello la secuencia vinculante pasa a ser:

1. **T-0 authority-honesty**.
2. **T-1a program-check sandbox**.
3. **T-1b cra-12 sandbox**.
4. **K4** con brief v3 ya preauditado.
5. **K5** con sus siete decisiones renombradas `OPEN_DT`, resueltas por Codex con propuesta Opus y challenge Fable.
6. Deudas semánticas F4A-close.
7. `realKeypathParity` rediseñado + ratchet a cero.
8. Cerca `cascade-wiring` y work order PRE_F4B.
9. `gates:ci` final + auditoría Fable + actualización oficial de roadmap/registry/checkpoint.

Cada tranche es atómico y serial: prehash/backup por contenido, write-set exacto, pruebas causales y negativas, inspección DT del diff, mismo diff completo a Fable, y sólo después registro oficial. Nunca `git show HEAD:path > path`, checkout/restore/reset/stash/add/stage/commit/push/R7.

## Primer tranche a diseñar: T-0

Opus debe producir un brief ejecutable exacto, todavía read-only, que:

- corrija `checkpoint.intent.json` a la autoridad/roles/bloqueos vigentes sin inventar avance;
- regenere exclusivamente el bloque stampado de `packages/core/scripts/quality-evidence/programs/modern-rescue/README.md` mediante la herramienta canónica;
- cablee `program-state --check` como gate blocking y declare el nuevo canon esperado `89 blocking + 2 excluded`;
- derive write-set, comandos antes/después, stop conditions, restore por backups/prehash y pruebas causales;
- no toque roadmap/registry todavía: esos se actualizan tras ACCEPT de implementación;
- no implemente T-1/K4/K5 ni themes.

Este ruling no autoriza writes por sí mismo. Requiere ratificación read-only Fable del orden y preaudit Fable del brief T-0; luego Opus implementa T-0.

## VERDICT DT

`READY_FOR_FABLE_SEQUENCE_RATIFICATION_AND_OPUS_T0_BRIEF`
