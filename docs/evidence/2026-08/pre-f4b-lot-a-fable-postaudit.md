# PRE_F4B Lote A — POSTAUDIT FINAL (Fable 5, READ-ONLY)

Fecha: 2026-08-22. Repo `/Users/daniel/Developer/Rottay/ui-design-system`.
HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (verificado al abrir y al
cerrar) · staged **0** · porcelain **39**. Mandato cumplido: cero writes al
repo, cero git mutante, cero builds ni suites productivas — no re-ejecuté
tests; la única ejecución fue el ratchet viejo (script de lectura pura, un
proceso) y sondas python/jq/grep de solo lectura.

Autoridades, SHA-256 recomputado EXACTO (todas):

| Autoridad | SHA |
|---|---|
| contrato v3 | `636c5c39…ec13` |
| addendum DT | `7b704a26…5295` |
| mi adjudicación v3 | `0dd58125…812af` |
| freeze JSON | `96630f8c…9b02` |
| audit final A1–A3 (`ACCEPT`) | `6fe2aefb…f3a8a` |
| reaudit A4–A9 (`REJECT/SOURCE_READY_BLOCKED`) | `05970a35…2cc70` |
| diff completo | `72b8002b1d788b2d24e40024f16fc07488c78a019884ed8518013b55bcc06186` |
| diff code-only | `27ca4eaf…d4610` |
| lista unknown (2024 filas / 525 archivos) | `f9764253…60f3f` |
| SOURCE_READY del writer (`SOURCE_READY_BLOCKED`) | leído completo, apareció durante la auditoría |

Rulings DT leídos completos: H1–H5 (a1a3), P0/P1/P2 (a4a9), A12-sin-path-16.

---

# VERDICT: ACCEPT_SOURCE_READY_BLOCKED

El diff del Lote A es una instrumentación **honesta, materialmente exacta y
segura de conservar**. PRE_F4B **no cierra** y el **Lote B queda BLOQUEADO**
por su propia condición de entrada (F-5.1): `unknownProvenance = 2024 ≠ []`.
Este postaudit NO autoriza el Lote B.

---

## 1. Los seis puntos del encargo, verificados contra el árbol vivo

### 1.1 Write-set material, paths extra, A12, autoridades, git — PASS

- **12/12 paths del Lote A byte-exactos** contra la tabla poststate del
  handoff (SHA vivo recomputado por mí, uno por uno).
- **A12 (`gates-manifest/index.mjs`) byte-idéntico al prestate del freeze**
  (`3b7f906f…`): sin delta material del lote, como ordenó el ruling DT. Por
  identidad de bytes, `CI_GATES` sigue en mi verificación previa en vivo:
  **91 = 89 blocking + 2 excluded, `validateManifest()` = []**.
- **B1/B2/B3 intocados** (los tres en su hash prestate del freeze — el
  ratchet viejo, su baseline y su test siguen exactamente como estaban).
- **31/31 autoridades read-only intactas** (catálogo, 20 roots, fanout-facts,
  tenant-reach, 5 fuentes de compilador, 3 artifacts — recomputadas contra el
  freeze, cero drift).
- **Porcelain 39 = los 29 congelados (cero retirados, cero mutados de lista)
  + exactamente las 10 entradas esperadas** (A1/A2/A10 ` M`, A3–A9 `??`).
  Cero paths fuera de A1–A12; cero `src/**`, roots, catálogo,
  `manifest/index.json`, materialized, backlog, docs, roadmap o GAT.
- HEAD idéntico, staged 0. Los 3 diffs/lista publicados coinciden con sus SHA
  declarados.

### 1.2 A1–A3, H1–H5 — CERRADOS (reverificados en vivo)

Sobre el A2 vivo (37 MB, parseado entero): `unclassifiedCalc` **0** ·
`byKind.calc-offset` **6** (H1) · `literalPins` **1918, 0 sin `scopeId`**
(nota: 1848 llevan `scopeId: 0`, índice VÁLIDO de la scopeTable — un chequeo
por truthiness lo contaría mal; verifiqué por presencia de campo) (H2) ·
`readRefs` **26 263, 0 sin `readRefId`** (H3) · `edges` **10 513** y
`foreignEdges` **471** separados (H4) · `unadjudicatedSelectors` **0** ·
`scopeContradictions` **0**. El audit focal final (`ACCEPT`, `6fe2aefb…`)
recomputó los digests de sellado H4 con MATCH; lo ratifico.

### 1.3 A4–A9: los 2024 unknown son honestos; Lote B necesariamente bloqueado — CONFIRMADO

- `producers.json` vivo: `unknownProvenance` = **2024**, desglose EXACTO
  833/635/389/153/10/4; cada fila con `plane/file/symbol/reason/template/detail`
  — identidad, no contador desnudo.
- Las **4 `unresolved-dynamic-setProperty`** citan exactamente los sitios
  declarados (`root-attributes/presentation`, `css-variables-bridge:571`,
  charts exporting `:205/:208`) — **irreducibles por análisis estático**.
- La lista para el DT (`f9764253…`) dice "2024 filas en 525 archivos",
  consistente con el artefacto.
- `producerSites` 4872 · `channelEmissions` 10 314 · `ownershipConflicts` 0 ·
  main guards `isMain` en A1/A4/A7 (3/3).
- **A8**: 42 outputs = **20 `UNVERIFIED_PRODUCER_IMPURE` + 22
  `UNREPRODUCIBLE_BLOCKED`, `consumable: 0`** — exactamente los estados
  conservadores derivables de V3-4, cero estado inventado.
- La retractación de `ADJUDICABLE_UNDER_APPROXIMATION` es correcta y
  necesaria: bajo STRICT omitir productor ABRE la rama y compra falso verde.
  Con la ley contratada, **mientras quede una fila unknown, B no puede
  arrancar** (F-5.1/F-5.3). Confirmado.

### 1.4 P0-3 / P0-4 / P1-1 / P2 — estado exacto verificado en fuente viva

| Ítem | Estado | Evidencia mía | Severidad |
|---|---|---|---|
| P0-3 binding AST | **PARCIAL** | `cascade-producers.mjs:1170` usa `thenStatement.getText(ast).includes("--ds-chart-category-")` — un comentario dentro del `then` lo satisface; sin resolución léxica de binding | NO invalida el diff (la adjudicación actual es creíble para el source vivo); BLOQUEA re-declarar A4–A9 y B |
| P0-4 inputsDigests | **PARCIAL / BLOQUEANTE para B** | `:619-623`: `compilerSources` = SOLO `[CHROME_VARIABLES, BRAND_THEME, APPEARANCE_POSTURE]`; faltan del digest self-describing: módulo tenant-reach, `appearance/index.ts`, `tenant-theme`, `ramp`, `chart-series`. Mitigante real: el freeze de /tmp SÍ congeló esas 5+1 autoridades y yo verifiqué cero drift — el lote está protegido HOY por el freeze, no por el artefacto | ídem |
| P1-1 doble owner | **PARCIAL** | A6:312 (N10) produce el conflicto vía `ownershipConflictsOf([filas fabricadas])`; el build real solo asserta 0; falta fixture que lo produzca DESDE `buildProducers()` | ídem |
| P2 precedence | **PARCIAL** | fila viva muestreada: `order` = contextos (`["stylesheet cascade","compileTheme document"]`), no owners; honesta (nota explícita "no winner") pero no cumple el schema §5 | ídem |

Los cuatro son brechas de GARANTÍA, no de honestidad: nada de lo escrito
miente ni inventa; lo que falta es fuerza probatoria. Correcto conservar el
diff; incorrecto re-declarar A4–A9 o abrir B sin cerrarlos.

### 1.5 A10/A11/A12 — gate transitorio VÁLIDO — PASS

- Conflicto real verificado: `scripts/ci/runner/index.test.mjs:239` hace
  `assert.deepEqual(drills.run, DRILLS_ARGV)` — argv exacto sellado por un
  archivo FUERA del write-set. La restauración de A12 fue obligada.
- A11 vivo: drill de integración **secuencial con `spawnSync` por suite**,
  las **3 rutas exactas** citadas (`:1368-1370`), limpieza de
  `NODE_TEST_CONTEXT`/`NODE_OPTIONS` (`:1382-1383` — sin ella el drill era un
  verde tautológico, defecto real atrapado), y **guard estático** de la lista
  (`:1407-1409`). A3/A6/A9 quedan transitivamente blocking vía el gate
  existente `modern-rescue-tooling-drills` → sin gate id nuevo, R-3 intacto.
- A10 vivo: importa y llama **SOLO `validateInventory()`** (`:24`, `:415-419`);
  `assertConsumable()` queda como API del consumidor F4B. V3-4 cumplida.

### 1.6 Evidencia reportada — PASS con un hallazgo de receta

- Suites (del reporte del writer, no re-ejecutadas): A3 23 · A6 36 · A9 18 ·
  A11 48, 0 fail. Mis conteos por grep dan A6 37 / A11 50 — artefacto de
  unidad (`grep 'test('` también captura llamadas regex `.test(`); el número
  vinculante 1817 está verificado del log real, abajo.
- **R-1**: leído del log (`pre-f4b-lot-a-r1-final.log`): `# tests 1817 /
  # pass 1804 / # fail 12 / # skipped 1` — EXACTO. Aritmética F-7:
  `1735−10+10+23+36+18+5 = 1817` exacta.
- **Failure-set: verificado por IDENTIDAD DE CONJUNTO**, que es más fuerte
  que el literal: extraje los 12 nombres `not ok` del log del lote y los 12
  del log canónico de mi postaudit de Lote C — **diferencia simétrica VACÍA**
  (mismos 12 nombres, cero fallas nuevas). **Hallazgo**: el literal
  `4d6eda2d…` NO se reproduce desde la receta en prosa ("nombres sin
  prefijo, orden alfabético, join \n, newline final, sha256") — mi
  implementación fiel de esa prosa da `999d0d26…` sobre AMBOS logs
  (incluido el log del que nació el canon). El canon nominal se sostiene por
  identidad de conjunto; la RECETA del literal es ambigua. → condición C-3.
- **gates:ci**: log termina `ci-gates OK — 89 blocking gate(s) passed`, con
  exactamente 2 SKIP excluded (channel-liveness, lane-control-drills) — 89+2.
- **Ratchet viejo, corrido por mí sobre el árbol vivo**:
  `2171 names still unwired of 4374 (2203 reach a root; 768 roots/ramps
  excluded; 391 skin files)` — **byte-exacto al pre-lote. Aislamiento S2
  probado, no reportado.**

---

## 2. Hallazgos propios de este postaudit

1. **(C-3) Receta del fingerprint**: el literal `4d6eda2d…` no es derivable
   de la prosa; la identidad del conjunto sí está probada. Debe publicarse el
   serializador EXACTO como script (o re-anclar el canon a la receta
   prose-reproducible `sorted-unique + '\n' final` = `999d0d26079196942214c…`,
   por ruling DT). Hasta entonces, la vara se verifica por identidad de
   conjunto + contadores, como hice aquí.
2. **Freeze vNext**: el `rootsDir.aggregateDigest` del freeze no fue
   reproducible por el writer con dos reconstrucciones naturales (declarado,
   no ocultado; los 20 hashes individuales SÍ verifican — yo también los
   verifiqué). El próximo freeze debe pinear la FÓRMULA del agregado como
   código ejecutable, no como prosa.
3. **Conteo de tests por grep vs runner**: unidad distinta (`.test(` regex);
   ninguna acción — se registra para que nadie lo lea como drift.

---

## 3. Condiciones vinculantes del siguiente tranche

1. **B cerrado** hasta `unknownProvenance == []` en el `producers.json`
   committeado (F-5.1). Ningún writer toca B1/B2/B3; el ratchet viejo sigue
   siendo el gate CI. **Este postaudit no autoriza Lote B.**
2. **Las 4 filas `unresolved-dynamic-setProperty` requieren ruling DT
   explícito** — son estáticamente irreducibles. Opciones que el DT debe
   adjudicar ANTES del tranche de resolución: (a) autoridad de runtime
   contratada; (b) cambio de fuente — que toca `src/**` y por tanto dispara
   S4/gat-07 y exige su propio tranche regulado; o (c) enmienda contratada de
   F-5/§19.8 (exclusión permanente con ley falsable) — que solo pueden
   escribirla DT + auditoría, jamás el writer. Las otras 2020 filas: mayor
   alcance de resolución backward (imports, spreads, mapas indexados), con la
   MISMA ley fail-closed — nada se resuelve "a la ligera".
3. **Cerrar los cuatro PARCIALES con el brief del reaudit (items 1–4),
   verificados en fuente por mí**: (i) `srcCompilers` digesta TODA autoridad
   efectivamente leída (≥ las 6 que el freeze ya congela: tenant-reach,
   chrome-variables, brand-theme, appearance, tenant-theme, ramp +
   chart-series y APPEARANCE_POSTURE) con un negativo de sensibilidad POR
   autoridad; (ii) binding léxico en V3-3 + negativos de shadowing por
   parámetro y comentario-en-`then`; (iii) fixture de doble owner producido
   DESDE `buildProducers()`; (iv) precedence por contexto con orden de owners
   o marca explícita `unordered/mutually-exclusive`.
4. **Regenerar A5 (y A8 si cambia) tras esos fixes, reauditar A4–A9 completo
   y volver a mi postaudit** antes de cualquier re-declaración.
5. **Publicar el serializador canónico del fingerprint** (hallazgo C-3 §2.1)
   en el próximo SOURCE_READY; el postaudit lo re-corre.
6. **BC-0 sigue pendiente**: la próxima escritura del roadmap asienta
   `PAINT_DENOMINATOR` verbatim (prohibido pinear 3661/1918/1823 sin
   derivación). Se arrastra desde el addendum §13/§18.8; no murió con este
   lote.
7. El freeze del próximo tranche usa fórmula de agregado ejecutable (§2.2).

---

# VERDICT: ACCEPT_SOURCE_READY_BLOCKED

El Lote A se CONSERVA (instrumentación honesta, aislada y verificada
byte-exacta). PRE_F4B queda ABIERTO-BLOQUEADO en la rama F-5/S7 contratada;
**Lote B NO autorizado**; F4B bloqueado.

Write-set de esta sesión: este memo y su `.ready`. Repo intacto: HEAD
`9d5582dfd…`, staged 0, porcelain 39 (= 29 + write-set A, verificado).
Fable queda idle.
