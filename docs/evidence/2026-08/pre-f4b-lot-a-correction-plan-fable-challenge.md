# PRE_F4B Lote A — CHALLENGE del plan de corrección (Fable 5, READ-ONLY)

Fecha: 2026-08-22. Repo `/Users/daniel/Developer/Rottay/ui-design-system`.
HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · staged 0 · porcelain 39 —
verificados. Mandato cumplido: cero writes al repo, cero suites/build; las
únicas ejecuciones fueron la sonda de clasificación del propio plan
(`/private/tmp/unknown-classify2.mjs`, read-only sobre 525 archivos) y
lecturas de fuente.

Insumos, SHA recomputado exacto: plan Opus `979b5187…c459` · mi postaudit
`caa9c481…6885` · reaudit A4–A9 `05970a35…cc70`. El censo Sonnet **no
apareció** (existe sólo su prompt, `pre-f4b-unknown-sonnet-census.prompt.txt`);
este challenge no lo espera ni lo presume.

---

# VERDICT: ACCEPT_WITH_BINDING_CORRECTIONS

La dirección del plan es correcta y verifiqué sus premisas centrales contra el
árbol; pero contiene **una premisa factual falsa** (receipt de root-attributes),
**un fixture imposible** (doble owner por línea compartida — el `ordinal` ya es
offset de nodo), **un write-set mal contado** (dice 4, son 3) y **omite mi
condición C-3** (serializador del fingerprint). Correcciones cerradas abajo.
**NO se autoriza Lote B ni ningún write todavía**: el write queda habilitado
sólo tras ratificación DT de este challenge (§6).

---

## 0. Reconciliación exigida: mis "4 irreducibles" vs los receipts de Opus

**No hay contradicción, y lo verifiqué en fuente.** Mi afirmación fue: el
DOMINIO de nombres de canal no es estáticamente enumerable en esos 4 sinks —
sigue siendo verdad. El plan no enumera dominios: **reclasifica los SITIOS
como no-autores** (relay/copiador), con lo que la enumeración deja de ser
necesaria. Receipt por receipt:

1. **root-attributes `claimRootStyleProperty` (:94-101)** — `property` ES
   parámetro ✓ (leído). **PERO el receipt del plan es FALSO**: "en todo src no
   hay call site de producción" — medido: SÍ HAY,
   `infrastructure/runtime/theming/composition/react/provider/index.tsx:211`
   → `claimRootStyleProperty(rootElement, 'color-scheme', nextResolvedTheme)`
   (producción, no test). Mitigante: el nombre es LITERAL y es `color-scheme`
   — propiedad extranjera, no canal `--ds-*`. La disposición relay SOBREVIVE
   con la corrección BC-A (abajo). Además `claimRootStyleProperty` está
   **exportado en la API pública** (`src/index.ts:228`) — la frontera de
   paquete es real y debe marcarse.
2. **css-variables-bridge (:171/:467/:571)** — VERIFICADO exacto:
   `declarations: Readonly<Record<string,string>>` es parámetro del
   `ClaimHold`, alimentado por `intent.declarations` (documento de tema
   compilado) y el sink itera `Object.entries(declarations)` →
   `rule.style.setProperty(name, value)`. Relay del plano `ts-compilers` ya
   enumerado ✓.
3–4. **chart export `inlineStyles` (:205/:208)** — VERIFICADO: los tres
   marcadores `@runtime-svg-paint-copy` existen (`:111/:202/:225`), el censo
   `runtime-svg-paint-census` existe y **no** está gateado (grep de
   gates-manifest vacío — la nota del plan es exacta, registrarlo sería path
   13/R-3). Copiador de fidelidad: espeja computed style, no autora ✓.

**Conclusión**: los 4 pueden salir de unknown sin tocar `src/**` y sin
enmendar autoridad de repo — pero la "ley de frontera de paquete" y la "ley de
copiador" son LEYES NUEVAS del inventario: las ratifica el DT con este
challenge, jamás el writer (BC-F).

## 1. Punto 1 — Taxonomía R/A/L/E/D: REPRODUCIDA por identidad, con matices

Corrí la sonda del plan: `TOTAL 2024`, con
`B-relay(nombre) 814 + R-relay(binding) 269 + A-local 635 + A-import 61 +
L 68 + E 173 + D 4 = 2024` — **identidad exacta, cero residuo** ✓. Matices
vinculantes:

- **R = 1083 NO es un conteo probado**: son 269 probados por binding + **814
  candidatos por patrón de nombre** (la sonda los separa; la tabla §1 del plan
  los funde). El plan ya ordena binding real para las 1083 — correcto — pero
  **los números por clase de §1/§6.4 quedan NO VINCULANTES** (aproximados):
  lo que gatea es la identidad de suma, el receipt por fila, y S-H.
- **E-173 (BC-B)**: disposición EXACTA antes del write = (i) la **tabla
  completa de los 173 heads se publica ANTES del primer write** (la sonda ya
  la produce — precomputable hoy); (ii) **E no tiene ley propia**: cada fila E
  sólo puede salir por las leyes cerradas R/A/L/D con receipt, o quedar
  unknown; (iii) inventar cualquier clase/disposición nueva durante el write =
  **STOP + ruling DT**. Ningún default bucket — ratificado.

## 2. Punto 2 — Ley de frontera: segura bajo STRICT SÓLO con estas correcciones (BC-A)

El riesgo real, con testigo medido: los relays de FUNCIÓN no son sinks de la
gramática actual (`style=`/`setProperty`), así que sus llamadores in-package
NO "ya se escanean" — `provider/index.tsx:211` sería invisible y un llamador
in-package podría ocultar un productor governed. Vinculante:

1. `relayKind` cerrado: `jsx-prop` (llamadores = sinks `style=` ya
   escaneados) | `function-param` (llamadores NO son sinks).
2. Para cada relay `function-param`: **enumerar sus call sites in-package**
   (por binding del callee, no por nombre) y adjudicar CADA uno como sink:
   argumento literal → productor (governed) o `foreignProperty` (como
   `'color-scheme'`); argumento no literal → fila unknown PROPIA. Receipt:
   `{callSiteFile, line, argKind, disposition}`.
3. Relay alcanzable desde fuera del paquete (símbolo exportado, verificado
   contra `src/index.ts`/entrypoints) → `packageBoundary: "exported"` +
   la ley de frontera citada y digestada. Contrato explícito: escrituras de
   llamadores externos son runtime fuera del universo del instrumento; los
   veredictos STRICT portan esa limitación declarada.
4. Negativo: relay `function-param` con un call site in-package de argumento
   no literal ⇒ esa fila permanece unknown (no se absorbe en el relay).

## 3. Punto 3 — resuelto en §0: sí pueden salir, con BC-A/BC-F. El marcador
`@runtime-svg-paint-copy` prueba el sitio exacto (líneas verificadas); la ley
del copiador se ancla al marcador existente y exige, como el plan ya escribe,
el negativo del `setProperty` dinámico SIN marcador y SIN parámetro ⇒ unknown.

## 4. Punto 4 — Write-set: son **3 paths**, no 4 (BC-C)

Determinado contra el árbol: **A8 NO se vuelve stale** (sus únicas
referencias a "producers" son el miembro `backlog/producers.draft.json` y su
texto de razón — cero referencias a `extracted/producers.json`, sus ids o
digests); **A10 no referencia producers** (grep vacío); A2/A3/A7/A9/A11/A12
intocados. Write-set EXACTO: **A4 + A5 + A6**. El "4 paths" del plan se
corrige a 3. Companions de /tmp (lista unknown regenerada, freeze-r2, diffs)
no son paths de repo. **STOP nuevo S-I**: cualquier byte movido en
A1/A2/A3/A7/A8/A9/A10/A11/A12 o fuera del write-set ⇒ STOP.

## 5. Punto 5 — Coordenada y fixture de doble owner (BC-D)

- **Quitar `plane` de la coordenada: ACEPTADO** — y es más seguro de lo que el
  plan sabe: medido en fuente, `ordinal` YA es el **offset de inicio del nodo
  AST** (`node.getStart(source)`, `:221/:355`, comentario `:509-514`) para
  sitios AST, y la LÍNEA para sitios textuales. Dos statements distintos jamás
  comparten offset ⇒ cero colisiones legítimas nuevas entre nodos distintos.
- **PERO el fixture del plan (§4.3) es IMPOSIBLE**: "misma línea, mismo
  símbolo y mismo ordinal" con DOS statements no puede ocurrir — offsets
  distintos por construcción. Es exactamente la colisión artificial que no se
  acepta. REEMPLAZO vinculante: fixture-tree inyectado donde **un mismo nodo
  AST** recibe DOS claims de owner por el camino real de acumulación
  (`claim()` → `claims.set/owners.set`, `:529-543` — la maquinaria ya
  soporta multi-owner por sitio): p.ej. un archivo fixture cuyo
  `vars[template]=v` dispara DOS adjudicadores que no difieren, o una regla
  duplicada inyectada vía la config de scanners del build. `buildProducers()`
  sobre ese árbol publica ≥1 `ownershipConflicts`; el negativo retira el
  segundo disparador ⇒ 0.
- **Normalización de unidad (nueva)**: antes de quitar `plane`, el `ordinal`
  debe ser UNA sola unidad en todos los planos (offset de nodo para AST;
  offset de inicio de declaración para textuales) o portar el tag de unidad
  en la coordenada — hoy "línea" (textual) y "offset" (AST) comparten espacio
  de ids y con `plane` fuera podrían colisionar accidentalmente entre nodos
  no relacionados.
- Post-cambio, en el árbol real: `ownershipConflicts == 0` sigue siendo gate;
  **todos los `producerSiteId`/`channelEmissionId` cambian** — delta esperada
  declarada; verificado que nada fuera de A5 los consume.

## 6. Puntos 6–8 y fingerprint

- **inputsDigest (§3): ACEPTADO** con dos precisiones: el conjunto
  `srcCompilers` se DERIVA de las constantes exportadas del lector
  (`REACH_SOURCES ∪ CONSTANT_SOURCES ∪ V3_3_SOURCES ∪ el módulo lector`),
  deduplicado por path (un archivo aparece UNA vez aunque esté en dos
  listas), y la matriz de sensibilidad exige por archivo: su clave cambia Y
  las otras cinco NO (exclusividad). Regla ratificada: si `buildProducers()`
  lo lee, entra.
- **Precedence (§5): ACEPTADO** con una precisión: `mutually-exclusive`
  también exige evidencia (dos stamps inline pueden co-aplicar); sin
  evidencia, el default es `unordered`. `ordered` sólo con evidencia; cero
  `winner`; contradicciones entre filas = fallo duro. Owners como
  `<ownerId>@<producerSiteId>` ✓.
- **Fingerprint (BC-E, corrección mínima, sin expandir alcance)**: el plan
  reusa el literal `4d6eda2d…` en S-E/§6.4 ignorando mi C-3 (la receta en
  prosa NO lo reproduce: mi implementación fiel da `999d0d26…` sobre ambos
  logs). Vinculante: el SOURCE_READY publica
  `/private/tmp/pre-f4b-r1-fingerprint.mjs` — el serializador EXACTO cuya
  salida sobre el log R-1 es el canon; si la serialización histórica de
  `4d6eda2d…` no se recupera, el DT re-ancla el canon en la misma
  ratificación al prose-reproducible
  `999d0d26079196942214c42fed5e134047bfc9fc73ec6a5178869522bc74770a`
  (nombres `not ok` únicos, orden alfabético, join `\n` + newline final).
  En AMBOS casos S-E gatea por **identidad del conjunto de 12 nombres** +
  igualdad de salida del serializador publicado. Nada más cambia.

---

## 7. CONTRATO EJECUTABLE (tras ratificación DT; sin ella, cero writes)

**Read-set**: css-edges.json (A2, intocado), `cascade/roots/*.json`,
`root-catalog.json`, 3 artifacts, `tenant-reach/index.mjs`,
`REACH_SOURCES ∪ CONSTANT_SOURCES`, `chart-series/index.ts`,
`src/index.ts`+entrypoints (para el flag exported), árbol `packages/core/src`
(plano TSX). Las **31 autoridades del freeze re-verificadas antes y después**.

**Write-set**: **A4, A5, A6 — 3 paths, nada más** (S-I).

**Precomputado ANTES de autorizar el write** (todo existe o es read-only):
1. Tabla completa de los 173 heads E, publicada y hasheada (la sonda ya la
   emite).
2. Salida completa de `unknown-classify2.mjs` congelada como pre-imagen
   (2024 filas con clase candidata) para diff fila-a-fila en postaudit.
3. `freeze-r2`: prehash de A4/A5/A6, porcelain-39 congelado, 31 autoridades,
   y fórmula de agregado EJECUTABLE (no prosa).
4. Resolución DT del serializador del fingerprint (BC-E).
5. Ratificación DT de: ley de frontera + ley de copiador (BC-F), BC-A..BC-E,
   write-set 3.

**Deltas esperadas (falsables; los números por clase NO vinculan, los
receipts sí)**: `unknownProvenance` 2024 → **0 o SOURCE_READY_BLOCKED**;
`relaySites[]` nuevo (≈269..1085, cada fila con `relayKind`, `paramName`,
`declaredAt`, y para function-param sus call sites adjudicados);
`L` ≈68+2 con `expressionKind`/marcador; E ≤173 adjudicadas una a una
(residuo → unknown); `ownershipConflicts` 0 real / ≥1 fixture;
`inputsDigest` ≥8 archivos con matriz de sensibilidad; precedence por
contexto con owners-IDs y `relation` cerrada; **ids de A5 todos nuevos**
(coordenada sin plane); A1/A2/A3/A7/A8/A9/A10/A11/A12 **byte-idénticos**;
R-1 sube sólo por tests nuevos con failure-set de 12 nombres set-idéntico +
1 skip; `gates:ci` 89+2; ratchet viejo `2171/4374`.

**Stops**: S-A..S-H del plan (con S-E reescrito por BC-E) + **S-I**
(write-set) + **S-J**: una ley nueva no ratificada aparece en el diff ⇒ STOP
+ ruling. S-H intacto: una sola fila unknown al cierre ⇒
`SOURCE_READY_BLOCKED`, B no arranca.

**Negativas mínimas** (además de las del plan): binding-relay vs `const`
local; productor+relay simultáneo; import de segundo salto ⇒ unknown;
ternario-objeto ∉ L; `setProperty` dinámico sin marcador/parámetro ⇒ unknown;
relay `function-param` con call site no-literal ⇒ unknown; fixture doble-owner
same-node + su negativo; sensibilidad por archivo del digest; `ordered` sin
evidencia ⇒ rojo; comentario-en-`then` y shadowing (§2 del plan, ratificados).

---

**NO se autoriza Lote B. NO se autoriza ningún write con este memo**: el
orden es ratificación DT → freeze-r2 + precomputados → writer → reaudit
independiente A4–A9 → mi postaudit del diff completo. F4B sigue bloqueado;
BC-0 (PAINT_DENOMINATOR) sigue pendiente del DT.

Write-set de esta sesión: este memo y su `.ready`. Repo intacto: HEAD
`9d5582dfd…`, staged 0, porcelain 39 idéntico. Fable queda idle.
