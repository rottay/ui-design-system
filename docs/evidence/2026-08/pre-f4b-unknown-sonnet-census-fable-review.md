# PRE_F4B — Revisión Fable del censo causal Sonnet (READ-ONLY)

Fecha: 2026-08-22. Repo `/Users/daniel/Developer/Rottay/ui-design-system`.
HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · staged 0 · porcelain 39 —
verificados. Cero writes al repo, cero tests/build; ejecuciones: sondas python
de recomputación sobre el mapping y lecturas de fuente.

Insumos, SHA recomputado exacto: censo `4b0c3e5d…1aab4` · mapping
`2d148e8b…1998` · mi challenge `37dcdf46…f1a2d` · auditoría independiente del
plan `092cd49c…30cc` (leída completa; verdict `REJECT/NEEDS_PLAN_CORRECTION`,
ampliamente convergente con mi challenge y más estricta en dos puntos que
adopto).

---

# VERDICT: ACCEPT (con correcciones C1–C6 vinculantes)

El censo es la mejor pieza de medición del frente unknown hasta ahora:
identidad probada, resolver genuinamente scope-aware, receipts por fila.
Con una precisión central: **el mapping ES preimagen vinculante COMO
IDENTIDAD, y sólo censo exploratorio COMO CLASIFICACIÓN** (§3). No se
autorizan writes ni Lote B.

---

## 1. Verificaciones (recomputadas por mí, no aceptadas del memo)

- **Identidad 2024**: comparé fila a fila el `mapping[]` contra
  `producers.json.unknownProvenance` en orden — **0 discrepancias en
  (file, symbol, reason, template)**; índices 0..2023 exactos y ordenados.
- **Los nueve conteos**: recomputados del mapping — **los 9 EXACTOS**
  (1537 / 244 / 78 / 61 / 60 / 19 / 11 / 10 / 4, suma 2024, cada fila en
  exactamente una familia).
- **Engine split exacto**: rustic 975 / modern 433 / agnostic 338 /
  classic 278; relay dominado por agnostic (185/244) — recomputado.
- **Resolver scope-aware: SÍ, verificado por lectura del código**
  (`classify.mjs:107-178`): camina HACIA ARRIBA desde el nodo del sink —
  parámetros de cada ancestro función-like primero (con destructuring vía
  `paramNamesOf`), luego `const/let` de bloques ancestros (con destructuring
  y resolución recursiva de la fuente), e imports de módulo AL FINAL. La
  precedencia léxica (binding más interno gana; parámetro shadowea import)
  es correcta por construcción del walk. NO es el clasificador plano de
  `unknown-classify2.mjs` que la auditoría independiente refutó — esta
  objeción queda superada por este censo.
- **Receipts de relay completos**: los 244 llevan `bindingDetail` de
  parámetro real — 234 `destructuredParam` + 10 `directParam`, 0 sin
  evidencia (recomputado).
- **Testigos verificados en fuente (6/6)**: Tooltip rustic `:216`
  (`placement.startsWith("top")`, placement destructurado de props), fade-in
  `:180` (`resolvedStyle.style` sobre `useMemo` local), Card classic `:158`
  (rama string `'default'`), grid-pattern `:85` (`… : undefined`), Calendar
  `:242` (spread de ternario), data-table `:406`
  (`DENSITY_STYLES[resolvedDensity]` — y `resolvedDensity` está tipado como
  unión de TRES literales: el dominio del computed-key es enumerable por el
  propio type node, refuerza §3.6).
- **§3.9 convergencia triple**: el censo encontró independientemente el
  MISMO testigo que mi challenge §0 y que la auditoría §2
  (`provider/index.tsx:211`, literal `'color-scheme'`) — el receipt falso
  del plan ("no hay call site") queda triplemente refutado, y la disposición
  correcta (enumeración de call-sites) triplemente confirmada.
- **`resolvePersonalityBridgeCssVariables` existe en el repo**
  (`foundation/tokens/ts/runtime/personality/index.ts`, consumido por el
  bridge) — el requisito de la auditoría de enumerar las claves del bridge
  es aterrizable sin autoridad nueva.

## 2. Defectos y sobre-aproximaciones detectados (ninguno invalida el censo)

1. **Slip aritmético de prosa (C2)**: "154 filas comparten contentId (88
   grupos)" — recomputado: son **66 grupos**; el 88 es el número de filas
   EXCEDENTES (2024 − 1936 distintos). La semántica de identidad no cambia.
2. **Sobre-aproximación declarada del resolver**: sin orden TDZ dentro del
   bloque (el propio código lo declara, `:136-140`). Además las funciones
   locales HOISTED (`function f(){}`) no se indexan como binding local (sólo
   `VariableStatement`) — una llamada a función local declarada como
   `function` podría no caer en `callToLocalFunctionResolvable`. Ambas van a
   los negativos de A4 (C3), no invalidan el mapa.
3. **La familia mayor (1537) es PREDICCIÓN, no adjudicación**: "resolvable"
   afirma resolubilidad del PRIMER salto; la propia salvedad §3.1 y el
   testigo Tooltip/`placement` (destructure cuya fuente es una PROP) prueban
   que la cascada puede terminar en relay/import/unknown. Los conteos
   finales post-resolución pueden diferir de 1537/244/… en cualquier
   dirección.
4. **Relay "puro" no está probado**: el resolver liga el parámetro, pero no
   inspecciona DEFAULT initializers (`style = {'--ds-x': …}` autoraría) ni
   reassignments antes del sink — exactamente los negativos que la auditoría
   independiente ya exige (C3).

## 3. Decisión: estatus del mapping

**PREIMAGEN VINCULANTE como identidad; censo EXPLORATORIO como
clasificación.** Concretamente:

- **VINCULA**: el inventario sellado de las 2024 filas (`index` 0..2023 en
  el orden del artefacto + `contentId` + campos fila), SHA `2d148e8b…1998`.
  Es la base de diff obligatoria del tranche: el writer publica su partición
  final como transformación uno-a-uno de ESTOS índices (ley de la auditoría:
  cada `unknownSiteId` aparece exactamente una vez en `relaySites` /
  `resolvedProducers` / `nonObjectSites` / `dynamicDispositions` /
  `unknownProvenance`; duplicado o ausente = fallo).
- **NO VINCULA**: las etiquetas de familia y sus conteos (1537/244/78/61/60/
  19/11/10/4). Son hipótesis de trabajo de alta calidad — receipts reales,
  resolver correcto — pero A4 debe RE-DERIVAR cada disposición con su
  clasificador fuente-vinculado (con TDZ/hoisting/defaults/reassignment), y
  los conteos esperados del brief se publican como aproximados, jamás como
  valores a "clavar" (el mismo trato BC-2 de siempre). Las dos familias de
  falso positivo (61 undefined + 10 non-object, formas sintácticas cerradas,
  testigos verificados) son las únicas adjudicables por forma — y aun así
  las re-deriva A4, no se importan del censo.

## 4. Reconciliación BC-A / BC-B (y BC-C/D/E)

- **BC-A (frontera de relay) — SUBSUMIDA Y REFORZADA.** El censo aporta la
  base de receipts (los 244 son relays `jsx-prop`; los function-param quedan
  reducidos a `claimRootStyleProperty` + bridge). Se adopta la ley de CINCO
  disposiciones de la auditoría (relay puro / relay+autoría / dynamic writer
  enumerable / copiador marcado / API-o-import no cerrable ⇒ unknown), MÁS:
  (i) mi flag `packageBoundary: exported` con enumeración de call-sites
  in-package (receipt citando `provider:211` y su literal, nunca "no hay
  call sites"); (ii) para el bridge, la exigencia FUERTE de la auditoría:
  enumerar sus claves vía `resolvePersonalityBridgeCssVariables` con
  owner/contexto/applicability — verificado factible, el mapper está en el
  repo; (iii) charts = copiador acreditado por marcador
  `@runtime-svg-paint-copy` + forma AST exacta + origen computed-style, con
  negativo sin marcador.
- **BC-B (tabla E-173 pre-write) — SUPERSEDIDA EN SU VEHÍCULO, CUMPLIDA EN
  SUSTANCIA.** El cajón E del plan Opus queda disuelto: el censo particiona
  las 2024 SIN residuo y el mapping sellado ES la preimagen pre-write que
  BC-B pedía (más fuerte que mi tabla de heads). Sobrevive intacta la
  cláusula: **ninguna clase/disposición nueva durante el write** — el
  vocabulario cerrado es el de las cinco disposiciones + unknown; cualquier
  adición exige ruling DT (STOP).
- **BC-C (write-set 3 paths)** — confirmada también por la auditoría (§6).
- **BC-D — SUPERSEDIDA por decisión DT, que RATIFICO**: `plane` SE MANTIENE
  en `producerSiteId` (la auditoría probó que retirarlo era un cambio de
  contrato v3, no una corrección; mi aceptación condicionada queda
  retirada). El fixture de conflicto usa **claims inyectados al MISMO
  materializador** (las dos formas equivalentes de la auditoría:
  `materializeClaims(claims)` puro invocado desde A6 con dos claims de tupla
  completa idéntica y owners distintos, o `claimFixture` en
  `buildProducers()`), sin cambio de fórmula — coherente con mi rechazo del
  fixture de línea-compartida (imposible: ordinal = offset AST). Residuo de
  mi BC-D que se conserva como corrección C4: dentro de un mismo plano los
  sitios textuales usan LÍNEA como ordinal — cada claim debe portar un
  snippet/span del nodo reclamado, y dos claims con el mismo id pero spans
  DISTINTOS son un error `coordinate-collision`, no un `ownershipConflict`.
- **BC-E (serializador del fingerprint)** — intacta, sigue pendiente, se
  arrastra al brief.

## 5. Correcciones vinculantes de esta revisión

- **C1**: estatus híbrido del mapping (§3) escrito en el brief: identidad
  vincula, clases no; partición uno-a-uno contra los índices sellados;
  conteos esperados aproximados.
- **C2**: corregir la prosa del censo en el asiento: 66 grupos / 88 filas
  excedentes (2024−1936).
- **C3**: el clasificador de A4 añade a los negativos de la auditoría:
  orden TDZ (o sobre-aproximación declarada con negativo), funciones locales
  hoisted como binding, parámetro con default-object que autora, reassignment
  antes del sink.
- **C4**: `plane` se queda; fixture por claims inyectados al materializador
  real; snippet/span por claim con `coordinate-collision` ≠ conflicto.
- **C5**: las tres disposiciones dinámicas con sus receipts fuertes (bridge
  con enumeración de claves del mapper; charts con marcador+forma+origen;
  root-attributes con call-sites enumerados citando `provider:211`).
- **C6**: las dos fronteras que requieren ruling DT ANTES del write quedan
  nombradas: límite cross-file (60 filas — un salto, con detección de
  ciclos) y enumeración de dominio de computed-keys (19 filas — por unión de
  tipos literal o call-sites, técnica V3-3; el testigo `resolvedDensity`
  muestra dominio de 3 literales en el propio type node).

---

**No se autoriza ningún write ni el Lote B.** Cadena vigente: ruling DT
(ratifica plan corregido por la auditoría `092cd49c…` + mi challenge
`37dcdf46…` + esta revisión) → freeze-r2 → writer (A4/A5/A6) → reaudit
independiente → mi postaudit. `SOURCE_READY_BLOCKED` permanece mientras
quede una fila unknown; BC-0 (PAINT_DENOMINATOR) sigue pendiente del DT.

Write-set de esta sesión: este memo y su `.ready`. Repo intacto: HEAD
`9d5582dfd…`, staged 0, porcelain 39 idéntico. Fable queda idle.
