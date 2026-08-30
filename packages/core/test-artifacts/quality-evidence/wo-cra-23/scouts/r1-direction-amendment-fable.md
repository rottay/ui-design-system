# Auditoría FABLE 5 — ENMIENDA DE DIRECCIÓN R1 (corrección del owner 2026-08-30)

- **Auditor:** Fable 5 (independiente, read-only salvo este informe)
- **Fecha:** 2026-08-30
- **HEAD:** `5c1cbac97` (asiento roadmap entry 27 — COH-1 CERRADO e INTEGRADO)
- **Objeto:** el diff sin commitear de la enmienda de dirección R1 (4 archivos:
  `rounds.json`, `tenant-art-direction.json`, `README.md` del programa,
  cabecera de corrección de `scouts/r1-craft-prep.md`)
- **Regla cumplida:** cero escritura sobre el repo excepto este informe. Sin
  builds, sin servidores, sin mutaciones git.

## VEREDICTO: ACCEPT

Los once puntos de la directiva del owner están codificados en el diff con
cita `archivo:línea`, salvo el punto 10 (roles), que adjudico como
no-codificable-en-contrato en su forma literal y ya cubierto en sus asientos
por contrato pre-existente (detalle en §A.10). La estructura machine-checked
está intacta: el `program-check` falla exactamente por los 117 receipts F4B
stale pre-existentes en HEAD, ni uno más. El árbol no contiene nada fuera del
write-set declarado. Los fences nuevos no disparan `routesUngovernedModel`. La
cabecera de `r1-craft-prep.md` es un re-frame fechado y atribuido, no una
falsificación. Tres observaciones menores sin efecto sobre el veredicto (§F).

---

## A. Fidelidad: los once puntos de la directiva, uno a uno

Numeración de líneas contra el working tree (verificada con `grep -n` el
2026-08-30).

### A.1 — Verticales = fixtures/bancos de prueba, no destinos de dirección artística

CODIFICADO.

- `rounds.json:103` — objetivo R1 reemplazado: *"use the BitHire and The
  Management verticals as controlled test fixtures that PROVE the public
  controls produce real, predictable and consistent differences across the
  same tree … the verticals are NOT art-direction destinations in this stage
  and per-vertical aesthetic customization is deferred to a later phase (owner
  amendment 2026-08-30)"*.
- `tenant-art-direction.json:4-8` — campo nuevo `stageStatus` con
  `value: "DEFERRED_AS_R1_TARGETS"`, `asOf: "2026-08-30"` y el `ownerOrder`
  literal ("fixtures/test benches of the engine, not art-direction
  destinations in this stage").
- `README.md:452-456` — fence nuevo *"Owner direction amendment (2026-08-30):
  the verticals are test fixtures of the engine, not art-direction
  destinations"*, dentro de la sección `## Fences` (README.md:414).

### A.2 — Retiro de "Professional Network Hiring OS" / "Monochrome Executive Ledger" como aceptación de R1

CODIFICADO, con verificación negativa repo-wide.

- `rounds.json:119` — el exit viejo *"art-direction contract passes all
  required scenes…"* reemplazado por *"…(owner amendment 2026-08-30: the
  per-vertical art-direction implementation obligation is retired from R1
  acceptance)"*.
- `rounds.json:253` — el `writeDomains.why` de los tenant sources ya no dice
  *"R1 must implement Professional Network Hiring OS… and Monochrome
  Executive Ledger…"*.
- `tenant-art-direction.json:7` — *"the R1 acceptance obligation to implement
  them is retired from rounds.json"*.
- `README.md:459-460` — *"The R1 acceptance obligation to implement the
  recorded directions is retired"*, con puntero cruzado a `rounds.json` R1 y
  `tenant-art-direction.json.stageStatus`.
- **Verificación negativa** (barrido repo-wide, `--exclude-dir=node_modules`):
  las únicas apariciones vivas de los nombres de dirección son (i)
  `tenant-art-direction.json:7,37,164` — documentación conservada por orden
  explícita del owner (punto 3); (ii) `r1-craft-prep.md` — scout histórico con
  cabecera de corrección; (iii) tres receipts congelados bajo
  `wo-cra-23/{R0,R1}/` — evidencia histórica inmutable por ley
  (README.md:473-474); (iv) un comentario de provenance en
  `themanagement-db-row/index.ts:62` que narra el cambio de paleta ya
  integrado en Cohort 1, no un mandato (§F.3). Ninguna autoridad viva sigue
  obligando la implementación.

### A.3 — Fixtures conservados como comparación same-tree con paridad static/DB

CODIFICADO.

- `rounds.json:103` — *"by static BrandTheme and by DB TenantTheme with
  parity between both paths"*.
- `rounds.json:107` — el objetivo pre-existente de divergencia same-tree
  (≥8 ejes, ≥6 no-color) se CONSERVA sin tocar, coherente con "diferencias
  reales, previsibles y consistentes".
- `rounds.json:119` — exit: *"the vertical fixtures prove the public-control
  cascade across all required scenes at 320 390 768 and 1440, by static
  BrandTheme and by DB TenantTheme with parity"*.
- `tenant-art-direction.json:8` (última oración del `ownerOrder`) — *"the two
  fixtures keep serving the same-tree cascade proof, by static BrandTheme and
  by DB TenantTheme with parity"*.
- Los checks mecánicos que blindan esto siguen vivos y verdes:
  `program-check.mjs:1638-1654` (targets en orden, `sameTree`,
  `divergenceContract` ≥8/≥6) — §B.

### A.4 — No editar tenant sources para embellecer; sólo ajustes mínimos como fixtures controlados

CODIFICADO.

- `rounds.json:253` — *"the cascade proof needs write access for bounded
  fixture adjustments (never per-vertical beautification — owner amendment
  2026-08-30)"*.
- `README.md:457-459` — *"no tenant source may be edited to beautify a
  vertical (only bounded fixture adjustments that serve a cascade proof)"*.

### A.5 — R1 = cambios reales; orden Button → PatternDataTable → AppShell

CODIFICADO (la mitad nueva) + PRE-EXISTENTE (el orden).

- `rounds.json:105` — objetivo nuevo: *"every cohort changes real source —
  primitives, patterns, structures, skins, compiler: no lot may consist only
  of documentation, manifests, scripts or evidence"*.
- `README.md:461-463` — fence *"Source-first budget. Every cohort changes real
  source…"*.
- El orden ya estaba legislado antes de la enmienda y no fue tocado:
  `rounds.json:110` — *"attack Button then PatternDataTable then AppShell as
  the first-failing grammar sequence before the remaining canaries"*. No
  necesitaba re-codificación; lo declaro cubierto por contrato pre-existente.

### A.6 — Obligaciones por cohorte (calidad, hardcodes del write-set, cascada, paridad, tests, monotonicidad, no lotes solo-documentación)

CODIFICADO (parte nueva) + PRE-EXISTENTE (calidad visual base).

- Hardcodes del write-set: `rounds.json:104` — *"each cohort retires or
  adjudicates every brandable hardcode in its write-set, with monotonic
  census reduction per lot"*; exit en `rounds.json:121` — *"the brandable
  hardcode census is monotonically lower at each cohort checkpoint than at
  the start of that cohort, with the cohort write-sets drained or adjudicated
  (owner amendment 2026-08-30)"*.
- Cascada observable + paridad + tests: `rounds.json:106` — *"every cohort
  demonstrates the observable cascade when a public control changes, with
  static BrandTheme and DB TenantTheme parity, and adds functional and visual
  tests"*.
- No lotes solo-documentación: `rounds.json:105` y `README.md:461-463`.
- Calidad visual/composición/estados/responsive: pre-existente y conservada —
  objetivos `rounds.json:100-102` (defecto dominante por canary; no overlap /
  clipping / per-character wrap / compresión desktop; 320/390/768/1440 y
  contenedores estrechos) y exit `rounds.json:115-118` (contratos binarios,
  craft score ≥95, dimensiones críticas ≥4-de-5).

### A.7 — PatternDataTable cierra/adjudica sus 52 candidatos clase-B

CODIFICADO.

- `rounds.json:104` — *"PatternDataTable closes or adjudicates its 52 class-B
  candidates rather than documenting them"*.

### A.8 — El roadmap drena el censo Modern (~795) progresivamente

CODIFICADO, con una nota de forma.

- `rounds.json:104` — *"drain the brandable hardcode census as an
  implementation queue distributed across cohorts (about 795 candidates
  measured in the Modern census)"*.
- `README.md:464-468` — ley global del programa (sección Fences, vinculante
  para todas las rondas): *"The brandable-hardcode census is the
  implementation queue: each cohort retires or adjudicates every brandable
  hardcode in its write-set, and the census goes monotonically down per
  lot."*
- **Nota:** rounds.json asienta el drenaje sólo dentro de R1; los bloques
  R2-R6 no fueron re-editados. La progresión R1-R6 queda cubierta por la ley
  global del README (que rige cada cohorte de cada ronda), así que lo doy por
  codificado; si el DT quiere el asiento por-ronda explícito, es una mejora
  futura, no un defecto de fidelidad (§F.2).

### A.9 — Presupuesto ≥80% source / ≤20% harness; no crear instrumentos salvo bloqueo

CODIFICADO.

- `rounds.json:105` — *"at least 80% of the effort goes to source and visible
  quality and at most 20% to harness, audit and evidence; no new instrument
  is created unless a concrete blocker requires it"*.
- `README.md:463-466` — el mismo par de reglas en el fence "Source-first
  budget".

### A.10 — Roles (Opus gramática/arquitectura, Sonnet lotes disjuntos, Fable auditoría, Kimi K3 DT)

NO CODIFICADO EN EL DIFF — adjudicado como no-codificable-en-contrato en su
forma literal, con los asientos ya cubiertos por contrato pre-existente:

- Los asientos están en `agent-orchestration.json` desde antes de la
  enmienda: Kimi K3 = DT/coordinator (:15, :19), Fable 5 = auditoría de
  cierres (:6, :14, :69), implementador = *"Claude implementer pool
  (Sonnet/Opus)"* (:16, :87) con *"the model tier chosen by risk"* en la
  prueba de sucesión (:107). El operating model del CLAUDE.md del repo asienta
  además "Sonnet para lo mecánico, Opus para riesgo medio, Fable para la
  auditoría".
- La sub-asignación literal ("Opus = gramática", "Sonnet = lotes disjuntos")
  no puede escribirse en el README del programa ni en
  `agent-orchestration.modelRouting` sin disparar la regla
  `routesUngovernedModel` (`program-check.mjs:125-128`, aplicada en :459 al
  README y en :1052 al modelRouting): la constitución sólo admite los nombres
  gobernados del pool. Es routing operativo de sesión del DT, no contrato de
  programa.
- La restricción "Opus no diseña verticales" queda además implicada por la
  enmienda misma: en esta fase nadie diseña verticales (A.1-A.2).

### A.11 — Reporte de cohorte con secciones A-E

CODIFICADO.

- `README.md:469-472` — fence *"Cohort report shape. Each cohort closes with:
  (A) productive files modified; (B) hardcodes retired/adjudicated; (C)
  controls whose cascade was demonstrated; (D) instrumental work; (E) the
  next productive lot already launched."*

---

## B. Estructura machine-checked intacta

Comando: `node packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs`
(exit=1, log de 118 líneas capturado en `/tmp/fable-r1-amend-program-check.log`).

- **117 fallos exactos**, los 117 con el mismo patrón *"source digest is
  stale"*, los 117 sobre receipts únicos bajo
  `test-artifacts/quality-evidence/wo-cra-23/F4B/` (conteo por
  `grep -o 'wo-cra-23/[A-Za-z0-9-]*/' | sort | uniq -c` → `117 wo-cra-23/F4B/`;
  receipts únicos `.receipt.json` → 117). La única línea restante del log es
  la cabecera `BLOCKED — constitution drift detected:`. **Ni un fallo más.**
- **Pre-existencia en HEAD probada sin mutación git:** los fallos stale son
  función exclusiva de los archivos owned que cada receipt hashea. Ninguno de
  los tres archivos modificados aparece en ningún receipt F4B
  (`grep -rl 'rounds\.json\|tenant-art-direction\|modern-rescue/README'
  wo-cra-23/F4B --include='*.receipt.json'` → **0 matches**), de modo que el
  conjunto de fallos es byte-idéntico al de HEAD. Concuerda con el asiento
  previo del programa (`checkpoint.intent.json:4`, citado en
  `r1-craft-prep.md:159`: "hoy rojo solo por receipts F4B stale
  pre-existentes").
- **Checks de tenant-art-direction todos verdes:** el bloque
  `program-check.mjs:1638-1698` valida targets en orden exacto
  (`bithire-static,themanagement-db`), `authority.sameTree === true`,
  `creativeAdvisor` exacto, `divergenceContract` ≥8 ejes / ≥6 no-color,
  `currentPaletteIsTarget === false` en ambos targets, `paletteRebuildLaw`
  con "Replace", las cuatro leyes de `kimiProposalBoundary` y las cuatro de
  `r0MechanismDecisions`. Ninguno figura en el log de fallos. El campo nuevo
  `stageStatus` es puramente aditivo: ningún check lo lee y ningún check de
  claves-prohibidas lo alcanza (el único `Object.hasOwn` defensivo del bloque
  apunta a `kimiProposalBoundary.adjudicationRecord`, :1671).

## C. Nada más cambió

- `git status --short`: exactamente los 3 modificados del write-set
  (`README.md`, `rounds.json`, `tenant-art-direction.json` del programa) + 3
  untracked: `docs/reauditoria-cloud/` (foreign, ajeno al lote),
  `scouts/hardcode-census-top5.md` (scout de lote previo, ya presente antes de
  la enmienda) y `scouts/r1-craft-prep.md` (el scout cuyo único delta de la
  enmienda es la cabecera de corrección; el archivo es nuevo-sin-trackear
  desde su lote).
- `git diff --stat`: 3 archivos, **33 inserciones, 3 borrados** — coincide
  línea a línea con los cuatro hunks descriptos en §A. Ningún archivo de
  source, manifest, baseline, receipt o evidencia congelada fue tocado.

## D. Fences nuevos vs `routesUngovernedModel`

- Las 33 líneas añadidas del diff no contienen "Opus" ni "Sonnet"
  (`git diff | grep '^+' | grep -E 'Opus|Sonnet'` → vacío).
- La regla (`program-check.mjs:125-128`) strippea los dos nombres gobernados
  (`Claude implementer pool (Sonnet/Opus)` y el histórico `Cloud Opus
  implementer pool`) y busca residuos; corre sobre el README completo (:459)
  y sobre `agent-orchestration.modelRouting` (:1052). El program-check no
  emitió el fallo *"README.md must not route work to Opus or Sonnet…"*:
  verificación mecánica y textual concuerdan.

## E. Cabecera de corrección de `r1-craft-prep.md`

Re-frame legítimo, no falsificación:

- La cabecera (líneas 3-18) está fechada, atribuida al owner y declarada
  **"posterior a este reconocimiento"**; el cuerpo del scout quedó intacto,
  anclado a su HEAD de escritura `b682164f6` (existe: `git cat-file -t` →
  `commit`), con sus citas contra ese ancla.
- No contradice el contenido: lo que la cabecera declara vigente (identidad
  canónica §1, hardcodes como cola con los 52 clase-B de PatternDataTable
  §2/§5, cobertura de escena y gaps §3, criterio de DONE §5) es exactamente lo
  que el cuerpo desarrolla. Lo único re-leído es la "dirección artística por
  unidad" (§6.1-6.4): §6.1-6.3 son decisiones de gramática del DS y
  sobreviven tal cual; §6.4 (la dirección de tenants con los nombres
  retirados) es precisamente lo que la cabecera re-frame-a, citando los dos
  archivos de contrato donde el retiro quedó codificado.
- La cabecera además importa las reglas nuevas del lote (80/20, no
  lotes-solo-documentos, monotonicidad del censo, reporte A-E), consistentes
  byte-a-byte en sustancia con `rounds.json:104-106,121` y
  `README.md:461-472`.

## F. Observaciones menores (no defectos, no bloquean)

1. **Los tres fences nuevos del README no tienen marcador machine-checked
   propio** en program-check (a diferencia del standing-authorization, que
   ancla frases enteras, `program-check.mjs:465+`). La directiva no lo pedía y
   varios fences pre-existentes tampoco lo tienen; si el DT quiere blindarlos,
   un marcador discriminante por fence (lección del delta T-1) es el patrón.
2. **El drenaje del censo no está re-asentado en los bloques R2-R6 de
   rounds.json**; rige por la ley global del README (§A.8). Asiento por-ronda
   explícito = mejora opcional.
3. **`themanagement-db-row/index.ts:62`** conserva un comentario "R1 Cohort 1:
   Monochrome Executive Ledger" como provenance del cambio de paleta ya
   integrado. Es historia, no mandato; si molesta, se limpia en el próximo
   lote que toque ese fixture (nunca como edición suelta de tenant source).

---

## Apéndice — reproducción

```bash
cd /Users/daniel/Developer/Rottay/ui-design-system
git rev-parse --short HEAD    # 5c1cbac97
git status --short            # 3 M del write-set + 3 untracked conocidos
git diff --stat               # 3 files, 33 insertions(+), 3 deletions(-)
node packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs 2>&1 \
  | tee /tmp/pc.log; grep -c 'source digest is stale' /tmp/pc.log   # 117
grep -o 'wo-cra-23/[A-Za-z0-9-]*/' /tmp/pc.log | sort | uniq -c    # 117 wo-cra-23/F4B/
grep -rl 'rounds\.json\|tenant-art-direction\|modern-rescue/README' \
  packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B \
  --include='*.receipt.json' | wc -l                                # 0
git diff | grep '^+' | grep -E 'Opus|Sonnet'                        # vacío
grep -rln 'Professional Network Hiring OS\|Monochrome Executive Ledger' \
  --exclude-dir=node_modules --exclude-dir=.git .                   # 6 rutas, todas adjudicadas en §A.2
```

Veredicto final: **ACCEPT**.
