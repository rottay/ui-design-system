# Auditoría F4C — harness `f4c-canary-capture.mjs` (WO-CRA-23)

**Modelo real: Kimi K3 (subagente interno del DT), 2026-08-30.** Este documento
NO es una auditoría Fable: sus DEFECT-1..5 son hallazgos del harness-audit
ejecutado por K3, remediados en el mismo lote. La auditoría Fable real de
cierre vive en `f4c-fable-close.md` (DEFECTS-5, numeración independiente).

Auditoría READ-ONLY del harness `packages/showroom/scripts/f4c-canary-capture.mjs`
(2165 líneas) contra su contrato `packages/core/artifacts/quality/programs/modern-rescue/cascade-proofs/controls/palette-status-seeds/pre-derivation-five-phase-canary/README.md`.
No se modificó ningún archivo existente; este reporte es el único archivo creado.
Fecha de la auditoría: 2026-08-30. Todas las citas `f4c:NNNN` refieren al harness;
las demás rutas son relativas a la raíz del repo.

---

## DEFECTS

### DEFECT-1 (ALTA) — El comparador ignora el `pass`/`crashed`/`serverDrift`/`plannedRows` de los receipts: `pass=true` con evidencia incompleta es alcanzable

`compareRuns` (f4c:1605) valida únicamente: fase B conocida y no-baseline
(f4c:1610-1616), `comparedAgainst` (f4c:1618), `harnessSelfSha256` (f4c:1621),
`widths` (f4c:1624), `controlManifestSha256` (f4c:1627) y paridad del conjunto
de filas A↔B (f4c:1632-1634). **Nunca lee** `receiptA.pass`, `receiptB.pass`,
`crashed`, `serverDrift.stable` ni `plannedRows !== capturedRows`, campos que la
propia captura computa y escribe (f4c:2032-2034, f4c:2108-2114).

Dos reproducciones concretas, sin tocar código:

1. **Cobertura de ground elidida.** `--phase A --ground bithire` y
   `--phase B --ground bithire` producen corridas internamente coherentes
   (`plannedRows === capturedRows === 24`, `pass=true` en cada receipt). Los
   conjuntos de filas coinciden, todas las filas bithire de B son `HOLD_ALL` y
   efectivamente nada se mueve → `--compare A B` termina con `pass=true`,
   exit 0, **con cero evidencia del brazo DB que es justamente el brazo
   intended de la fase B**. El comparador tampoco exige que todo ground de
   `spec.grounds` (f4c:743-744) esté presente en las filas: el bucle de
   veredictos (f4c:1641-1651) itera solo sobre las filas que existen.
2. **Corrida con drift de servidor.** Un restart del dev server a mitad de la
   fase B deja `serverDrift.stable=false` y `pass=false` en el receipt B, pero
   con las 48 filas capturadas. `--compare A B` puede dar `pass=true` porque el
   drift nunca se consulta.

Por qué importa: es exactamente el agujero fail-open que el punto 1 del mandato
pregunta: un veredicto verde sobre evidencia que la propia captura declaró
inválida o incompleta. Corrección mínima: pushear failure cuando
`receiptA/B.pass === false`, cuando `capturedRows !== plannedRows` en cualquiera
de los dos receipts, y cuando algún ground de `spec.grounds` no tiene filas en
la corrida B.

### DEFECT-2 (MEDIA) — `--check` da verde a una corrida crashed o parcial

`runCheck` (f4c:1794) re-hashea los PNG declarados en `receipt.rows` y detecta
PNG faltantes y sobrantes (correcto, verificado leyendo f4c:1798-1819), pero
**no lee** `receipt.pass`, `receipt.crashed` ni compara
`rows.length` contra `plannedRows`. Una corrida que crasheó antes del primer
screenshot escribe un receipt con `rows: []`, `crashed: true`, `pass: false`
(f4c:1999-2007, f4c:2096-2109), y `--check` sobre ese directorio imprime
`filas 0, fallos 0` y sale con código 0. Ídem una corrida parcial con k<48
filas: sus k PNG existen y hashean bien → exit 0.

Por qué importa: el README (líneas 190-197) presenta `--check` como la
"Verificación sin navegar" de una corrida; tal como está, certifica como íntegra
una corrida que el harness mismo declaró fallida. Corrección mínima: fallar si
`receipt.pass !== true`, `receipt.crashed`, o
`receipt.rows.length !== receipt.plannedRows`.

### DEFECT-3 (MEDIA) — Los drills pueden dar verde vacío: `drillWorked = !result.pass` no aísla la causa

En `runCompare` (f4c:1849-1853) el drill tiene éxito si el comparador falla por
**cualquier** motivo. Pero `compareRuns` mete en el mismo `failures` los errores
anteriores a la perturbación: harness hash distinto (f4c:1621), manifiesto
distinto (f4c:1627), filas ausentes (f4c:1633), fase equivocada (f4c:1618).
Reproducción: editar `receipt.json` de B cambiando `controlManifestSha256` (o
correr B tras tocar el manifest del control) y luego
`--compare A B --drill hold-becomes-mover` → el comparador falla por el
manifest, el drill imprime `FALLO como debe` y sale 0 sin que la perturbación
haya contribuido en nada. Los cinco drills comparten el defecto.

Por qué importa: el drill negativo es la prueba exigida por
`evidence-contract/index.json:76` de que el comparador MUERDE la violación nombrada;
un verde vacío certifica esa propiedad sin ejercitarla — el "drill decorativo"
que el propio comentario de `png-tamper` (f4c:1574-1581) dice evitar en la
dimensión de dirección, presente aquí en la dimensión de causalidad. Corrección
mínima: exigir que la comparación sin drill pase (o que al menos un failure
nombre el objetivo del drill) antes de aceptar el verde del drill.

### DEFECT-4 (BAJA) — `mover-becomes-frozen` y `geometry-leak` sobre fases restore (C/E) explotan con excepción cruda

Ambos drills exigen un carrier `MOVE` (`applyDrill`, f4c:1558-1566 y
f4c:1590-1596). En una comparación A→C o A→E (HOLD_ALL en ambos grounds) no
existe ninguno: `applyDrill` lanza, la excepción sale de `runCompare` sin
atrapar y el proceso muere con stack trace. Es fail-closed (exit ≠ 0), así que
no hay falso verde, pero el operador recibe un crash en vez del veredicto
controlado `NO fallo` / mensaje de uso. El README (líneas 199-216) no declara
que esos dos drills solo aplican a fases intent. Robustez, no corrección.

### DEFECT-5 (BAJA) — Citas de línea desactualizadas en la pista de auditoría

El harness declara como disciplina "ningún número mágico sin fuente"
(f4c:303-305) y tres citas ya se movieron:

- `readiness` de `labels` cita `sections/display-labels/index.tsx:76` para
  `lab-display-badge` (f4c:420); el atributo está en la línea **75**.
- `dashboard` cita `sections/r4-structures/index.tsx:131` dos veces
  (readiness f4c:532 y carrier f4c:545) para `[data-export="ActivityCompact"]`;
  está en la línea **134** (la 131 es `MetricsMinimal`).
- `DECLARED_PARTIAL_PROPAGATION` cita `record-workbench.css:94` para el literal
  `backgroundColor` (f4c:230); el `background: var(--ds-color-success-bg, …)`
  está en la línea **95** (la 94 es `border-color`, que sí sigue al seed).

Sin impacto funcional (los selectores son correctos; verificado contra
`activity/compact/index.tsx:89-90`, que sí estampa
`data-part="item-icon-box"[data-type]`), pero la pista archivo:línea es el
mecanismo de navegación del auditor y estas tres ya mienten.

---

## Verificado sano

**Fail-closed de captura (punto 1).** `pass` exige no-crash + cero failures +
server estable + `rows.length === plan.length` (f4c:2032-2034); cada captura va
en try/catch que acumula en `acc.failures` (f4c:1984-1997); el receipt se
escribe siempre, atómico con fsync+rename (f4c:805-819, f4c:2096-2109), y el
exit code espeja `pass`. Un `--include` tipográfico lanza en `selectCaptures`
(f4c:1888-1895) antes de navegar: exit ≠ 0, sin receipt. Un PNG faltante o un
PNG sobrante rompe `--check` (f4c:1803-1805, f4c:1814-1817). Overflow de
`MAX_NODES_PER_MATCH` lanza, nunca trunca en silencio (f4c:1352-1358). Ground
stamp aseverado por captura (f4c:1133-1151); cardinalidad del artifact
(0 en bithire, 1 con digest `sha256-` válido y slug correcto en the-management)
falla cerrado (f4c:1169-1223); judge-mode y fallback de escena aseverados
ausentes (f4c:1113-1130); readiness exacta o aborta (f4c:1091-1110);
HTTP ≠ 200 aborta (f4c:1380-1386); colisión de nombres de salida aborta
(f4c:1962-1966).

**Cobertura de fases (punto 2).** `PHASE_EXPECTATIONS` (f4c:726-787) es
coherente con la arquitectura verificada en la fuente: el digest del artifact se
computa sobre `normalizedAppearance` + `variables` (el delta) + `rowVersion` +
`verticalEnvelopeDigest`
(`visual-authority/foundation/admission/index.ts:341-362`), y el envelope del
vertical contiene SOLO política (`allowedModes`, `advanced`, `ranges` — sin
ningún valor de color;
`compilers/composition/tenant-theme/index.ts:106-186`). Por tanto la afirmación
D/the-management (`paint: TONE_RULE` + `artifactDigest: IDENTICAL`) es **cierta**:
cambiar `palette.successColor` no mueve el digest, y como el fixture DB no
autora canales de status
(`fixtures/themanagement-db-row/index.ts` — comentario "Semantic status colour
is NOT touched here", ~:73-75) el delta tampoco cambia; el ground DB hereda el
cambio vía CSS de baseline rebuildeado, que sí mueve `cssDigest`
(DIFFERS, correcto). B es coherente: tocar
`appearance.general.palette.status.success` mueve `normalizedAppearance` →
digest DIFFERS; bithire HOLD_ALL + cssDigest IDENTICAL.

**Pattern mover (punto 3).** La escena existe con las citas exactas:
`lab-patterntimeline` en `sections/r2-behavior/index.tsx:1625`, items error en
:1630-1631 (uno con `color: 'rgb(10, 20, 30)'` literal) y success en :1632.
`PatternTimeline` modern estampa `data-type` en `data-part="item"` y en
`marker-icon` (`ui/patterns/visualization/timeline/engines/modern/index.tsx:180-226`),
así que ambos selectores matchean. `tierCoverage` se computa sobre la matriz
activa completa (no sobre la muestra de la invocación, f4c:2013-2031) y reporta
el hueco pattern-NON-MOVER-solo; con `--include patterntimeline` el gap se
cierra (`moverTiers` incluye `pattern`).

**Ley MOVER (punto 4).** Confirmada: MOVE exige `paintDeltas.length > 0` Y
`holdDeltas.length === 0` (f4c:1665-1695); `holdDeltas` incluye HOLD_PROPS +
`rect.w`/`rect.h` (f4c:1505-1512); un canal movido sin pintura produce ERROR con
mensaje explícito "Un canal sin pintura NO cuenta como llegada" (f4c:1673-1677);
el pixel se deriva de la composición de carriers
(`expectsPixelChange = inputs.some(MOVE)`, f4c:1701-1709).

**Restore (punto 5).** C y E exigen HOLD_ALL + ambos digests IDENTICAL
(f4c:753-756, 782-785); `cssCache` se crea por corrida (f4c:1980), no persiste
entre fases; `rect.x/y` excluidos del hold quedan cubiertos por la igualdad byte
del PNG (un desplazamiento mueve píxeles). No encontré agujero de restore
incompleto con verde.

**Drills — dirección (punto 6).** Los cinco muerden en la dirección correcta
cuando la comparación base está limpia: `hold-becomes-mover` inyecta pintura en
un HOLD (→ ERROR), `mover-becomes-frozen` copia nodos+canales de A (→ MOVE sin
delta → ERROR), `png-tamper` elige dirección según la fila sea toda-HOLD o tenga
MOVER (f4c:1574-1589, correcto), `count-drift` fuerza structural (→ ERROR),
`geometry-leak` inyecta hold-delta en un MOVER (→ ERROR). El agujero es el del
DEFECT-3 (causalidad), no la dirección.

**Determinismo (punto 7).** `reducedMotion: 'reduce'` por página (f4c:1373-1375),
`document.fonts.ready` + doble rAF antes del obturador (f4c:1363-1367), viewport
fijo y `fullPage: true`, exclusión del dev-chrome de Next con aserción de
overlay (f4c:1046-1088), identidad del server por `lsof`+`ps lstart` antes y
después (f4c:909-948). Las escenas capturadas son estáticas: r3-evidence
declara en comentario la prohibición de `Date.now`/`Math.random` (:19); el
`sla` con fecha fija de `config-b.tsx:134` pertenece a otro case, no al
`record-workbench` capturado; los encabezados de `groupByDate` del timeline son
absolutos (`toLocaleDateString`,
`timeline/engines/modern/index.tsx:67-74`), así que el caveat de cruce de día
declarado en f4c:672-674 es conservador, no un riesgo real. Nada en el HTML
servido por Next dev (sin timestamps renderizados en las regiones capturadas)
rompe la igualdad byte A↔C/E.

**Fix `tenantSlug="bithire"` (punto 8).** Verificado el diff no commiteado de
`ground/index.tsx`: cambia solo cómo se resuelve el tenant en el provider
(registry object → slug; `tenantConfig: undefined`, `tenantSlug: 'bithire'`,
f4c-diff :88-92, :222). El harness no consume `getKnownTenantConfig` ni internos
del provider: sus puntos de contacto son rutas (inalteradas),
`resolveDocumentRootAttributes` (llamada idéntica, :82-87) y la ausencia de
artifact (`emission: null` se mantiene, :88). `tenantSlug` existe en la API
pública del provider
(`infrastructure/runtime/bootstrap/facade/react/provider/tests/tenant-resolution-boundary.integration.test.tsx:154`
y ss.). Nada que el fix haya roto alcanza al harness.

**Citas de selectores principales** (muestreadas y correctas): alert
`tone="danger"`→`data-tone="error"` (`TONE_TO_VARIANT`,
`foundation/contracts/kernel/common/index.ts:143`; stamp en
`Alert/engines/modern/index.tsx:292-298`); pozo del Result con pintura por tono
(`skin/result.css:86-93`, estructura `root > icon > status-icon` en
`Result/engines/modern/index.tsx:150-166`); Badge con dos ramas de render
(`Badge/engines/modern/index.tsx:310-312` y `:385-388`, tal como declara
f4c:434-438); Tag `:171-172`; cockpit `data-part="status"][data-variant` en
`cockpit-header/engines/modern/index.tsx:130-131`; fallbacks de ruta
(`bithire/r2-behavior/page.tsx:104` → tabs; `r2-closure/page.tsx:31` →
image-fallback; `r3-evidence/page.tsx:29-31` → live-feed; 404 en r4/r6
`page.tsx:15`); conteos de feedback (7 alerts / 4 spinners / ≥4 líneas) contra
`sections/feedback/index.tsx:31-93`. Manifest con 68 canales en
`manifest/controls/palette.status-seeds.json:24-94`, ingress :20-22, "No dark
twin" :99.

---

## Veredicto

**DEFECTS-5** — DEFECT-1 (alta: comparador acepta evidencia incompleta o
invalidada; incluye el hueco de cobertura de ground por `--ground` parcial en
ambas corridas), DEFECT-2 (media: `--check` verde sobre corridas
crashed/parciales), DEFECT-3 (media: drills con verde vacío por falta de
causalidad), DEFECT-4 (baja: drills MOVE sobre fases restore crashean sin
veredicto controlado), DEFECT-5 (baja: tres citas de línea desactualizadas).
Los dos primeros son caminos concretos de `pass=true`/exit 0 con evidencia que
no lo merece; el tercero desactiva la prueba de que el comparador muerde. Las
correcciones sugeridas son mínimas (leer campos ya presentes en el receipt;
exigir ground coverage de `spec.grounds`; atar el verde del drill a su propio
failure) y no requieren rediseño.
