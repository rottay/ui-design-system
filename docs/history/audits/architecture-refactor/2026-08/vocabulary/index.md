# Veredicto Fable — auditoría de cierre del frente F1 (vocabulario cerrado gobernado)

Auditor: Fable (independiente). Fecha: 2026-08-20. Repo:
`/Users/daniel/Developer/Rottay/ui-design-system` @ HEAD `0d72bef1a` (árbol
limpio al inicio y al final; verificado con `git status` tras cada mutación).
Método: verificación de primera mano — corrida propia de `gates:ci` (Node
v22.17.0), corrida propia de la suite, conteos recomputados por mí sobre el
árbol, y **11 mutaciones con restauración byte-exacta** (copia prístina →
mutar → correr la ley → restaurar → `git status` limpio). Ninguna edición
sobrevive en el árbol.

## Veredicto global: **APROBADO — EL FRENTE F1 PUEDE CERRARSE**

0 hallazgos bloqueantes. Los 7 puntos del brief salen afirmativos contra el
árbol; las leyes nuevas tienen dientes reales que yo mismo hice morder. Quedan
7 hallazgos menores — el más sustantivo es que la ley emitido⇒admitido cubre
2 de las 17 raíces que hoy emiten variantes, y lo probé con una mutación que
pasa verde — más un puñado de residuos de prosa. Nada de esto contradice lo
sellado: el alcance de F1 fue adjudicado así en §4/§13; lo que corrijo es la
distancia entre la letra de los claims y la letra del árbol (la vara H7).

---

## Verificación de los 7 puntos del brief

### 1. FORMA + ADMISSION — dientes reales, probados por mutación propia

Todas con restauración verificada (`git status` = 0 tras cada una):

| # | Mutación | Resultado |
|---|---|---|
| M1 | `navigation.sidebar-tone` con `enumValues: []` y sin catálogo | ROJO FORMA con el mensaje exacto («an enum must name its vocabulary in one of the two governed domiciles») |
| M2 | quitar `contour` del catálogo `motif` | ROJO «emits "motif:contour" … does not admit that value» |
| M3 | quitar `framed` de `catalog.cardComponent` | ROJO «emits "card:framed" … calibration.catalog.cardComponent» — **el alias card↔cardComponent está VIVO**, la búsqueda pasó por él |
| M4 | quitar `spacious` de `density.mode.enumValues` | ROJO «emits "density:spacious" but controls/density.mode.json domain.enumValues» — **la excepción cross-owner está VIVA** |
| M5 | `catalog.motif: []` (eje mapeado pero vacío) | 4 ROJOS (uno por valor emitido) — ver pregunta 2 |
| M6 | `enumValues: []` + `catalog: {}` | FORMA calla (agujero de presencia), pero program-check BLOQUEA igual por la red de frescura del índice — ver hallazgo F5 |

### 2. Ruling `vocabularyDomicile` intacto, divergencias sin tocar datos — SÍ

`git log 652cf285e..HEAD -- customization-model/index.json` = vacío (cero toques en
todo F1); el ruling vive en `adjudicatedDecisions.vocabularyDomicile`
(línea 767: «vive en calibration.catalog, con su *Law hermana. El contrato
NO se ensancha»). Datos verificados en vivo: catálogo `motif` = 7 admitidos
con 4 emitidos (implicación, no igualdad — doctrina «admitido ≠ expandido»
del propio catalogLaw); `density` ausente del catálogo y ruteada por
`CROSS_OWNER_AXES` a `density.mode` (enumValues exactos
compact/normal/spacious); la constante runtime dice `cardComponent` y el
alias está declarado UNA vez (`CATALOG_AXIS_ALIASES`, program-check:407).
Sin renombres, sin lift, cero cambios de datos ✓.

### 3. root-exposure-gate — 26/27/10, snapshot bidireccional, ley 3 con nombre

Mi corrida del gate: «OK — 26 tenant-dial, 27 internal-head, 10 gap». Tres
mutaciones más:
- **M9** (ley 3): borré `token-overrides` de la nota de `ramp.seed.error` →
  ROJO nombrando canal y control («exposureNote does not name it») — la
  adjudicación escrita obligatoria es real, no un shrug.
- **M10a**: baseline `gap: 9` → ROJO «gap moved from 9 to 10 … decrease-only».
- **M10b**: flip `internal-head→tenant-dial` sin `governedBy`
  (tier.control.fg) → **5 findings** (ley 1 + reconciliación interna + ambos
  conteos del snapshot).
La regla 0 (vocabulario cerrado de exposure) impide que un typo saque una
raíz de las leyes. El gate y su drill corren BLOQUEANTES en el manifiesto y
pasaron en mi gates:ci.

### 4. La marca unificada y las 10 filas — verificadas contra git y el árbol

- Marcas `migratedToInternalChannels: true`: **1.073 totales** repartidas en
  las 5 capas (chart 108 / primitive 302 / surface 58 / pattern 349 /
  structure 256) — las **354** del claim son el delta F1.4b, que verifiqué
  por commit: `a43ad6550` marca 129 y agrega **0 filas**, `c45e96d69` agrega
  **4 filas** + 225 marcas, `b71a5bc72` (piloto) agrega **6 filas** = 10
  filas reales exactas.
- Patrón del piloto: fila de `sidebar-surface` inspeccionada — `channelId` =
  **el socket** (`--_ds-page-panel-radius`), `semanticOwner` = el control,
  producer/sourceBindings/`replacementDisposition` con razón de fase; y el
  `terminalReach` de la raíz (`shape.radius-scale`) nombra a la familia Y al
  socket — **simetría verificada**.
- Coherente con la deuda anotada en §13: la fila de `--_ds-page-panel-radius`
  es prescriptiva (`REQUIRED_ADDITION`), no un claim de que el CSS lo declare
  hoy.

### 5. Celda gobernada (F1.5) — 5100/5100, recomputado por mí

Mi recorrido del árbol: **5.100 celdas = 1.472 con filas + 3.628 con ley
escrita/adjudicada + 0 peladas**; statuses vivos exactamente la partición
adjudicada (MUST_REACH 449, MUST_NOT_REACH 2.424, ESCAPE_HATCH 255,
OVERLAY_OF_ROOTS 255, NO_CSS_CHANNEL 255); `index.json
denominators.controlFamilyCells = 5100` ✓ y el piso anti-vacuo lo lee de ahí,
no de un número pegado. **M7**: pelé una celda real
(`primitive/display/avatar#typography.pairing`) → ROJO «is bare — nobody ever
said whether this control reaches this family» ✓. Los `uncoveredByDesign`
muestreados llevan adjudicación escrita con puntero a fase 3 ✓.

### 6. gates:ci — corrido por mí: **82 blocking VERDES**

`ci-gates OK — 82 blocking gate(s) passed`, exit 0, con los 2 excluded
visibles con razón y dueño F2 (channel-liveness, lane-control-drills).
`root-exposure` + `root-exposure-drill` en el plan y verdes.

### 7. Paso C — baseline 29→4 y M1 sobre governance/manifest/, verificados

Baseline del scripts-tree-gate: **4 entradas exactas**, todas R3, todas «
artefacto con nombre propio registrado» con razón (incluye el
KIMI-VISUAL-WORKLIST reubicado — mi H3 de F0.5, cerrado). Los 13 renombres
viven en el árbol (`ci/gates-manifest`, `ci/runner`, `engine/token-audit`,
`engine/freeze-gate`, `i18n/key-parity-gate`, `taxonomy/parity-gate`,
`tokens/catalog`, `packaging/cra-17-license-gate`, `verticals/build-css`,
`lib/build/input-hash`, `lib/engine/corpus`, `lib/engine/token-governance`…);
grep residual de los nombres viejos: **0 rutas vivas** (lo que queda es
narrativa en comentarios, permitida por la regla del frente, y una excepción —
hallazgo F4). M1 cubre `packages/core/governance/manifest/` con la división correcta
(capabilities al R3; los 5 data-owners al program-check); mis H1/H2 de F0.5
cerrados: R5 extendido a subfamilias (index.mjs:135-137) y drills que plantan
archivos reales en sandbox tmpdir (index.test.mjs:76-94, con la lección del
leak de M1 documentada).

**Suite (corrida por mí):** 1.668 tests / 1.643 pass / **24 fail / 1 skip**,
y el conjunto de fallas es **IDÉNTICO 24/24** al baseline F1.5 (diff vacío).
Nada nuevo rojo, nada arreglado en silencio.

---

## Hallazgos (0 bloqueantes, 7 menores)

### F1 — MENOR (el sustantivo): emitido⇒admitido cubre 2 de las 17 raíces que emiten

`ADMISSION_ROOTS` está pineado a `['chrome.anatomy','profiles.expressive']`
(program-check:405). Hoy **17 raíces de cascada emiten variantes**; para las
otras 15 no existe ley de admisión, y las de control closed-enum
(density.mode, navigation.sidebar-tone, profiles.icon, responsive.posture,
shape.button-style, spacing.rhythm, surfaces.elevation-posture,
typography.pairing…) tienen vocabulario cerrado contra el que nadie compara lo
emitido. **Probado por mutación**: agregué la variante `ultra` a
`governance/manifest/cascade/roots/density/mode/index.json` (no admitida por sus enumValues) →
**CONSTITUTION_READY** — ni admisión, ni rules, ni la red de digest
(cascade/roots/ está fuera del inputsDigest del índice) la ven. El alcance
2-raíces fue la adjudicación explícita de §4 («los 2 enums vacíos»), así que
no es incumplimiento — pero el claim del brief («ADMISSION: emitido ⇒
admitido», sin acotar) promete más de lo que el árbol cumple (vara H7).
**Corrección F2**: implicación universal barata (para toda raíz con variantes
cuyo control sea enum/closed-enum: `variant.value ∈ enumValues|catalog`),
derivar `ADMISSION_ROOTS` del árbol en vez de pinearla, y meter
`cascade/roots/` al inputsDigest.

### F2 — MENOR: `root-catalog.json` está fuera de la red de digest

Probado: una edición manual trivial del catálogo deja program-check
CONSTITUTION_READY (los controles y familias sí están pineados; el catálogo
no). Sus únicas defensas son los conteos+reading del snapshot y la
re-derivación de `channelStatus`. El ángulo de mentira conjunta de la
pregunta 3 existe: **intercambiar el `channel` de dos raíces** (ambos
declarados en CSS) mantiene verde a freshness (ambos «existe»), a exposure
(los conteos no se mueven; el tripwire mira el canal equivocado) y a
program-check. Requiere edición deliberada del catálogo — revisión humana lo
caza — pero la asimetría con controls/families no tiene razón escrita.
**Corrección**: incluir el catálogo en el inputsDigest del índice o pinear un
digest de contenido en el baseline del exposure-gate.

### F3 — MENOR: el vocabulario de `targetBinding.status` no está cerrado

La ley de celda gobernada acepta cualquier `status` no-nulo como «ley
escrita». Probado: `MUST_NOT_REACHX` (typo) solo lo detiene la frescura del
índice; tras una regeneración legítima quedaría verde y la celda saldría de
todas las particiones por status en silencio. Los 5 valores vivos son un
vocabulario cerrado de facto (449/2424/255/255/255) — cerrarlo de iure son
tres líneas en la ley de celda.

### F4 — MENOR: rojo estable con causa compuesta — el spawn muerto del runner

`scripts/check/automation/runner/index.test.mjs:21` resuelve `run-ci-gates.mjs` en su
propia carpeta — **ese archivo no existe desde el lote F del Paso B** (la
capability es `index.mjs`; C1 actualizó el import de la línea 17 pero no el
spawn). Los 2 tests que lo usan («the real manifest excludes nothing today»,
«the runner --list plan matches…») ya estaban rojos en el baseline por una
causa anterior (asertan cero exclusiones cuando hay 2 adjudicadas), así que
el path muerto quedó invisible dentro del «conjunto idéntico»: la
verificación por NOMBRE de fallas no ve deriva de CAUSA. Solo los 15 rojos
del red-inventory tienen la forma de fallo sellada; los otros 9 estables no.
**Corrección**: repuntar el spawn a `index.mjs`, re-adjudicar los 2 tests
(o asumirlos al red-inventory con su forma), y considerar sellar la forma de
los 9 estables restantes.

### F5 — MENOR: FORMA es un chequeo de presencia, no de contenido

`calibration.catalog: {}` (o no-objeto) satisface FORMA (program-check:359
solo pide `!== undefined/null`). Hoy es inexplotable: los únicos 2 controles
con domicilio catálogo son las 2 raíces ADMISSION, donde el catálogo vacío
enrojece por eje emitido (probado en M5/M6); y la edición manual la caza la
frescura. El riesgo es futuro: un tercer control enum con catálogo que no
entre a ADMISSION_ROOTS podría declarar vocabulario vacío. Se cierra gratis
con F1 (derivar la lista) o endureciendo FORMA («objeto con ≥1 eje no vacío»).

### F6 — MENOR: la guarda del piso anti-vacuo es blanda ante deriva del generador

`typeof declaredCells === 'number'` (program-check:1660): si el generador
dejara de emitir `denominators.controlFamilyCells` (o lo emitiera como
string), el piso se apaga en silencio con índice FRESCO. La deleción manual
la caza la frescura (probado, M8), pero la deriva del productor no.
**Corrección**: fail-closed — «controlFamilyCells ausente o no numérico» es
un failure, no un skip.

### F7 — MENOR: residuos de prosa con la vara H7

(a) 5 archivos citan `scripts/foundation/tokens/manifest/generation.mjs:171-206` como instrucción
ejecutable en campos `*Law` (chrome.anatomy:73, motion.dial:78,
profiles.expressive:99, typography.families:53, +1) — C3 lo movió a
`generator/index.mjs`; la cita apunta a un archivo que no existe.
(b) `scripts/foundation/tokens/scripts/foundation/tokens/manifest/rules/index.mjs:231` dice «solo tres raices llevan
variantsLaw» — hoy lo llevan **6** (experience.profile, chrome.anatomy,
profiles.expressive, recipe-profile, typography.families,
responsive.posture). (c) El mensaje de exclusión de gates:ci sigue
imprimiendo `since=unrecorded` (cosmético, ya señalado en F0.5).

---

## Respuestas a las 5 preguntas del brief

1. **¿Contradicción viva catalogLaw/variantsLaw ↔ leyes nuevas?** No. Los
   catalogLaw adjudican exactamente el domicilio que FORMA implementa; la
   doctrina «admitido ≠ expandido» es la implicación que ADMISSION ejecuta
   (probado M2/M5); las exclusiones de density/motion del catálogo calzan con
   CROSS_OWNER_AXES para el único eje que hoy emite (density), y si `motion`
   emitiera mañana, ADMISSION cae en rojo fail-closed («no governed owner
   admits it») hasta que alguien lo mapee — diseño correcto. Lo único vivo es
   deriva de prosa (F7), no de ley.
2. **¿ADMISSION verde con eje mapeado pero vacío?** No mientras el eje EMITA:
   M5 probó que `motif: []` produce un rojo por valor emitido, y un catálogo
   `{}` enrojece por eje («no governed owner admits it»). El alias y la
   excepción cross-owner no pueden volverse decorativos mientras sus ejes
   emitan (M3/M4 los hicieron morder). Si una raíz deja de emitir un eje, su
   entrada de catálogo queda dormida — pero eso es la implicación deliberada
   («admitir sin emitir es legal»). El límite real no es ese ángulo sino el
   alcance (F1: 2 de 17 raíces).
3. **¿Freshness (channelStatus) vs exposure (exposure) disjuntos?** Por campo,
   sí — ninguno re-deriva el campo del otro, y ambos muerden por separado
   (mutaciones M9/M10 + corrida verde de ambos). El ángulo por el que ambos
   mienten a la vez existe y lo nombro en F2: los dos confían en la identidad
   `channel` del catálogo, que no está pineada por digest — un intercambio de
   canales declarados pasa los dos gates. Cerrable pineando el catálogo.
4. **¿F1.4c (targetBinding no se borra) deja deuda oculta?** La adjudicación
   es sólida y ahora es LEY, no memoria: borrar un targetBinding pela la celda
   y program-check lo grita (M7). La deuda oculta que encontré no es del
   portador sino del contenido: el vocabulario de `status` no está cerrado
   (F3). Los 629 uncoveredByDesign muestreados llevan su prescripción escrita
   con puntero a fase 3, como se adjudicó.
5. **¿Algo promete más de lo que el árbol cumple?** Tres cosas, todas
   menores: el enunciado de ADMISSION sin acotar raíces (F1 — el árbol cumple
   exactamente lo adjudicado en §4, no lo que la frase del brief sugiere);
   «las 5 clases 100% marcadas» — verifiqué marcas en las 5 capas, 0 celdas
   peladas y el delta 354 por commits, pero el denominador de «candidatas»
   por clase vive en los reportes del worker y no lo re-derivé (boundary);
   y los residuos de prosa de F7. Todos los números que el brief pone en
   claims duros los recomputé y dan exactos: 5100/1472/3628/0, 26/27/10,
   82+2, baseline 4, 10 filas, 1668/24 con set idéntico.

## Lo que NO revisé (boundary)

- No corrí `pnpm build`, E2E de showroom, ni tests unitarios de src/.
- No re-derivé el denominador de candidatas por clase de F1.4b (354 delta
  verificado por diff de commits; total 1.073 marcas medido por mí).
- Los 3 artefactos de `governance/manifest/projections/` siguen stale por adjudicación
  (F2 dueño) — no los audité; sus tests rojos están dentro del set 24.
- No verifiqué las deudas con dueño declaradas (cra-15 browser, packinv,
  receipts, dependency-honesty raíz) — ya registradas en §13 con destino.
- Las mutaciones cubren las leyes nombradas en el brief (FORMA, ADMISSION,
  exposure×3, celda gobernada, piso, typo-status, density:ultra, catálogo
  sin digest); no mutés el resto del corpus de program-check (T-1,
  contratos históricos, cascada 6c).
- El test `# skipped 1` de la suite no lo investigué.

## Recomendación de cierre

Cerrar F1. Para F2 (o un lote temprano): F1 (implicación universal + derivar
ADMISSION_ROOTS + roots al digest), F2 (pinear root-catalog.json), F3 (cerrar
vocabulario de status) y F4 (repuntar el spawn del runner y re-adjudicar sus
2 tests) — los cuatro son mecánicos y pequeños; F5/F6/F7 pueden viajar con
ellos. Con eso, la letra de los claims y la letra del árbol quedan idénticas
también en los bordes.
