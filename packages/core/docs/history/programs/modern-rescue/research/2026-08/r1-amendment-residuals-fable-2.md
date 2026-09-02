# Re-auditoría FABLE 5 — delta focal sobre la remediación de DEFECTS-2 (restos de la enmienda R1)

- **Auditor:** Fable 5 (independiente, read-only salvo este informe)
- **Fecha:** 2026-08-30
- **HEAD:** `58e5cd5b0` (sin cambios desde mi pasada previa)
- **Objeto:** el diff sin commitear = los seis restos ya ACCEPTados en
  `scouts/r1-amendment-residuals-fable.md` + la remediación de D1 y D2 de ese
  mismo informe, aplicada por el DT con la mecánica que yo recomendé.
- **Perímetro verificado del diff:** exactamente 7 archivos, 15 inserciones /
  18 borrados (`git diff --stat`). Los dos archivos nuevos respecto de mi
  pasada previa son `quality-rubric/index.json` (−1 línea) y
  `visual-craft/index.json` (−1 línea) — D1; `rounds/index.json` pasó de 1 a 3
  líneas tocadas y `art-direction/index.json` de 2 a 5 — D2. Nada más entró
  al write-set.
- **Regla cumplida:** cero escritura sobre el repo excepto este informe. Sin
  builds, sin servidores, sin mutaciones git, sin ejecutar la suite de tests
  (riesgo de residuo de tamper documentado; la prueba (e) se hizo por barrido).

## VEREDICTO: ACCEPT

Las dos remediaciones son fieles, completas y quirúrgicas sobre la autoridad
vinculante; ninguna re-impone la ley retirada por ninguna puerta; nada del
ACCEPT previo ni de los seis restos quedó deshecho; y la maquinaria queda
verde en el mismo baseline exacto (117 F4B stale pre-existentes, ni uno más).
Queda **una condición de staging** (§D.1: una glosa numérica de una palabra
que D1 dejó stale en un scout del propio write-set) y las observaciones
portadas de la pasada previa (§E). Ninguna toca autoridad vinculante ni
requiere adjudicación del owner, por eso no constituyen DEFECTS.

---

## A. D1 — veto `current-tenant-palette-retained-without-r1-sighted-readjudication` removido atómicamente ✓

El diff remueve exactamente una línea de cada lista: `visual-craft/index.json`
(hunk sobre la vieja `:348`) y `quality-rubric/index.json` (hunk sobre la vieja
`:310`). Verificación punto por punto:

- **(a) El ID no existe en ningún archivo vivo del repo.** Barrido
  `grep -rln --exclude-dir=node_modules --exclude-dir=.git .` → **1 solo
  match**: `scouts/r1-amendment-residuals-fable.md` — mi propio informe previo,
  el registro de auditoría que ordenó esta remoción. Es historia congelada
  (y DEBE citar el ID para que la remoción tenga procedencia), no autoridad.
  Cero contratos, cero manifests, cero docs, cero código.
- **(b) Pisos de program-check cumplidos.** Conteos recomputados desde los
  artifacts con python: `hardVisualVetoes` = **24** (piso ≥ 15,
  `program-check.mjs:1706`), `hardVetoes` = **51** (piso ≥ 20,
  `program-check.mjs:1456` — piso adicional que el mandato no citaba, también
  cumplido). Cero duplicados en ambas listas.
- **(c) Espejo craft ⊆ rubric sigue cierto.** `set(craft) <= set(rubric)` →
  `True` (python), y el loop de espejo `program-check.mjs:1709-1711` produjo
  cero errores en la ejecución real (d).
- **(d) `node program-check.mjs` → exit 1 con exactamente el baseline.**
  118 líneas = 1 cabecera "BLOCKED — constitution drift detected:" + **117**
  "source digest is stale"; las 117 son rutas únicas bajo `wo-cra-23/F4B/`;
  **0** fallos stale fuera de F4B y **0** fallos de cualquier otra familia.
  Identidad del set probada por la vía estructural: **ningún** receipt F4B
  hashea archivo alguno del write-set de 7 (grep de los 7 nombres sobre
  `--include='*.receipt.json'` → 0 de 134 receipts), así que la remediación no
  pudo stalear ni des-stalear ninguno — los 117 son necesariamente los mismos
  117 pre-existentes de mi pasada previa. `node --check program-check.mjs` → OK.
- **(e) Ningún test ni receipt congelado citaba el ID.** El barrido de (a)
  incluyó test-artifacts completo (solo mi informe matchea). El único test que
  toca las listas de vetos es `program-check.test.mjs:1115`, y es agnóstico al
  conteo: muta `hardVetoes.slice(0, 19)` para probar que el piso < 20 dispara —
  sigue válido con 51 exactamente igual que con 52.

**Efecto de fondo verificado:** con el veto fuera, el exit R1 "zero hard
vetoes" (`rounds/index.json:120`) ya no es satisfacible únicamente ejecutando la
readjudicación retirada. La tercera pata de la puerta trasera está cerrada; las
dos primeras (las aserciones gemelas de `program-check.mjs`) siguen removidas
con su comentario fechado (§C).

## B. D2 — ley de reconocimiento retirada de los tres sitios vivos ✓

### B.1 `art-direction/index.json`

- `threeSecondGrayscaleRecognitionRequired` **ausente** de
  `divergenceContract` (verificado por claves del objeto, no por grep: las 10
  claves actuales son axes, mínimos, escenas, anchos, locales, densidades,
  sameTree, acceptanceQuestions).
- `acceptanceQuestions` 1-2 reescritas neutrales (`:306-307`): Q1 = mutación
  controlada de un control público → diferencia observable y predecible en
  ambos fixtures, static BrandTheme y DB TenantTheme con paridad; Q2 =
  distinguibilidad por composición y estructura a través de escenas y anchos
  requeridos, "without any aesthetic-identity evaluation" explícito. Q3-Q5
  intactas byte a byte.
- **La parte sancionada del contrato sigue viva e intacta:** mínimos ≥8
  observable / ≥6 no-color / surface 8, `sameTreeRequired: true`, 10
  `requiredScenes`, `requiredWidthsPx`, locales `en/es/ar`, 3 posturas de
  densidad. El bloque de validación de program-check sobre esta familia corre
  con cero errores (§A.d). La separación vivo/retirado que pedí en D2 quedó
  ejecutada exactamente como la prescribí.

### B.2 `rounds/index.json` R4 y R6

- `:368` (R4): "make each complete screen prove observable fixture divergence
  under controlled public-control mutations through chrome type geometry
  material rhythm and responsive composition, with no aesthetic-identity
  evaluation (owner amendment 2026-08-30)" — la fórmula neutral de R1,
  aplicada a pantallas completas. Verificada la pertenencia al round R4 por
  parseo del JSON, no solo por línea.
- `:422` (R6): "fixture divergence matrix and observable-difference review
  under controlled public-control mutations (owner amendment 2026-08-30: the
  retired recognition review is replaced)". Doble cierre: además de retirar la
  review de reconocimiento, R6 **ya no nombra** la "tenant-art-direction scene
  matrix" como input de certificación — se resuelve también la contradicción
  secundaria que señalé (certificar contra un archivo cuyo purpose declara
  "binds nothing in the current stage"). La palabra "recognition" sobrevive
  solo dentro de la propia nota de retiro, auto-referencial.

### B.3 Barrido por variantes (mi apéndice, re-ejecutado)

`grep -rln -i -e "three.second" -e "three seconds" -e "recognizable by tenant"
--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=test-artifacts .`
desde la raíz del repo → **exactamente 3 archivos**, los tres del lab del
Showroom que ya clasifiqué y diferí en E.3 de la pasada previa, y los tres son
comentarios de bloque, no maquinaria: `probe/ds-reference/page.tsx:21`,
`probe/ds-reference/chrome/index.tsx:5`, `probe/ds-reference/ground/stamp.ts:35`.

Dentro de test-artifacts, el mismo barrido deja solo material congelado o ya
adjudicado: `wo-cra-23/R0/tenant-art-direction-compliance.json` y
`wo-cra-23/R1/receipts/packets/reference-lab.json` (receipts congelados bajo
R0/R1, exactamente el residuo que el owner sancionó), mi informe previo, y
`scouts/r1-button-opus-grammar.md:77` (la cita stale F1 ya adjudicada en E.4,
ajena a este lote). El comentario de provenance de
`themanagement-db-row/index.ts` ni siquiera matchea estas variantes (su
residuo eran los nombres de dirección, ya clasificados como historia): el
residuo real es ⊆ del residuo permitido.

Barrido complementario sobre los archivos del programa
(`threeSecond|three seconds|recognizable|recognition|neutralized|neutralization`
sobre los 6 JSON + checker + test + craft-prep) → 3 matches, todos benignos:
`art-direction/index.json:116` ("recognizable current destination" — sentido
distinto: wayfinding de navegación, dentro de la documentación histórica
diferida), `rounds/index.json:422` (la nota de retiro misma) y
`visual-craft/index.json:425` (observación E.1 portada, §E).

## C. Guardia de regresión: ACCEPT previo + seis restos intactos ✓

Contra disco, punto por punto:

- **Los seis restos:** `program/index.json:100` (invariante de fixtures con la coda
  de retiro) ✓; `art-direction/index.json:11` (purpose "Historical record…
  binds nothing in the current stage") y `:30` (ley RETIRED, fixtures como
  controlled baselines) ✓; `stageStatus` `:4-9` intacto ✓; `rounds/index.json:108`
  (objetivo R1 neutral) ✓; `r1-craft-prep.md:174` (ítem 4 RETIRADA, cabecera
  de corrección intacta — el diff solo toca esa línea del archivo) ✓;
  `program-check.mjs:1656-1661` (aserciones gemelas removidas con el
  comentario fechado y atribuido, único hunk del archivo) ✓;
  `hardcode-census-top5.md` existe (28.160 bytes) y sigue no-ignorado
  (`git check-ignore` → exit 1) ✓.
- **Mi ACCEPT de la enmienda:** `rounds/index.json:103` (fixtures de prueba con
  paridad), `:104` (drenaje censo ~795 + 52 clase-B), `:105` (source-first
  80/20), `:106` (cascada observable), `:107` (≥8/≥6 conservado como propiedad
  de la prueba), `:119` (exit de paridad con obligación retirada), `:121`
  (censo monótono), `:253` (writeDomains "never per-vertical beautification")
  — todos presentes; los tres fences del README del programa en `:452`, `:461`,
  `:469` — presentes; campos machine-checked de `art-direction/index.json`
  (targets con `currentPaletteIsTarget:false` + `paletteRebuildLaw`,
  `kimiProposalBoundary.allowedWrites`, 7 `r0MechanismDecisions`) —
  recomputados desde el artifact, intactos.
- **Frescura de receipts:** 0 de 134 receipts F4B referencian archivo alguno
  del write-set (§A.d); ningún receipt de ninguna familia referencia
  `quality-rubric` ni `visual-craft-contract` (grep sobre todo
  test-artifacts/quality-evidence → 0). La remediación no staleó nada.

## D. Condiciones de staging del lote (no bloquean el ACCEPT; el commit debe cumplirlas)

1. **`r1-craft-prep.md:145` — corregir "de los 25" → "de los 24".** La línea
   dice "Cero vetos duros aplicables de los 25 (`visual-craft/index.json`
   `hardVisualVetoes` …)". Era correcta en HEAD; D1 la dejó stale (ahora son
   24). Es glosa numérica en prosa de evidencia dentro de un archivo que este
   mismo write-set ya toca — edición de una palabra, sin adjudicación del
   owner, sin efecto sobre la obligación (que es "cero vetos aplicables" bajo
   cualquier denominador; los seis vetos que la línea ejemplifica siguen todos
   en la lista). No la elevo a DEFECT porque no es autoridad vinculante ni
   claim de certificación, pero por mi propia ley de glosas numéricas no debe
   commitearse sabidamente falsa. Verifiqué que es la única: los demás "25"/"52"
   del scout son del censo (top-25 clase B, cluster C1), no de vetos.
2. **Condiciones portadas de la pasada previa, sin cambios:** el commit DEBE
   incluir `hardcode-census-top5.md`; NUNCA `docs/reauditoria-cloud/` (fence
   `README.md:423`); `scouts/r1-button-opus-grammar.md` queda FUERA del lote
   (y su cita F1 stale se corrige antes de usarlo como input del lote Button).
3. **Provenance:** mi informe previo (`r1-amendment-residuals-fable.md`) y
   este informe son el registro que ordena y certifica D1/D2; corresponde que
   entren al mismo lote. Son, deliberadamente, los únicos portadores restantes
   del ID del veto en el repo.

## E. Observaciones portadas (no bloquean; sin cambios de disposición)

1. **`visual-craft/index.json:425`** (antes `:426`) — checkpoint artifact
   "tenant grayscale and neutralized-primary comparison when grammar changes".
   El DT NO lo reformuló pese a que D1 tocó el archivo; mi E.1 decía
   "idealmente" en el mismo lote, no era mandato, y el artifact es dual-uso
   legítimo (captura comparativa para los ≥6 ejes no-color retenidos). Sigue
   en pie la recomendación: lenguaje de divergencia neutral la próxima vez que
   ese contrato se abra.
2. **`customization-model/index.json:155`** — `grayscaleAndNeutralizedPrimaryRequired`
   pertenece a los reference postures de R7 (`enabled: false`, no-producto).
   Sin acción, como adjudiqué.
3. **Comentarios del lab del Showroom** (3 archivos, §B.3) — limpiar en el
   próximo lote que toque el lab, nunca como edición suelta.

---

## Apéndice — reproducción

```bash
cd /Users/daniel/Developer/Rottay/ui-design-system
git rev-parse --short HEAD      # 58e5cd5b0
git diff --stat                 # 7 files, 15 insertions(+), 18 deletions(-)
P=packages/core/scripts/quality-evidence/programs/modern-rescue

# D1
grep -rln "current-tenant-palette-retained-without-r1-sighted-readjudication" \
  --exclude-dir=node_modules --exclude-dir=.git .   # SOLO scouts/r1-amendment-residuals-fable.md
python3 -c "import json; vc=json.load(open('$P/visual-craft/index.json')); \
  qr=json.load(open('$P/quality-rubric/index.json')); c=vc['hardVisualVetoes']; r=qr['hardVetoes']; \
  print(len(c), len(r), set(c)<=set(r), len(c)-len(set(c)), len(r)-len(set(r)))"  # 24 51 True 0 0
grep -n "hardVetoes\|hardVisualVetoes" $P/program-check.mjs   # pisos :1456 (>=20), :1706 (>=15); espejo :1709-1711
node --check $P/program-check.mjs                              # OK
node $P/program-check.mjs > /tmp/pc-delta2.log 2>&1; echo $?   # 1
wc -l /tmp/pc-delta2.log                                       # 118
grep -c 'source digest is stale' /tmp/pc-delta2.log            # 117
grep 'source digest is stale' /tmp/pc-delta2.log | grep -cv 'wo-cra-23/F4B/'   # 0
grep -o 'wo-cra-23/F4B/[A-Za-z0-9./_-]*\.receipt\.json' /tmp/pc-delta2.log | sort -u | wc -l  # 117
R=packages/core/artifacts/quality/programs/modern-rescue/cascade-proofs/controls
grep -rl 'rounds\.json\|tenant-art-direction\|program\.json\|program-check\|r1-craft-prep\|hardcode-census\|quality-rubric\|visual-craft-contract' \
  $R --include='*.receipt.json' | wc -l                        # 0 (de 134 receipts)
grep -n "hardVetoes" $P/program-check.test.mjs                 # :1115 slice(0,19) — agnóstico al conteo

# D2
python3 -c "import json; dc=json.load(open('$P/art-direction/index.json'))['divergenceContract']; \
  print(sorted(dc.keys())); print('threeSecondGrayscaleRecognitionRequired' in dc)"   # ... False
grep -n "observable fixture divergence under controlled\|fixture divergence matrix" $P/rounds/index.json  # 368, 422
grep -rln -i -e "three.second" -e "three seconds" -e "recognizable by tenant" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=test-artifacts .
# => solo probe/ds-reference/{page.tsx,chrome/index.tsx,ground/stamp.ts} (comentarios)

# Staging D.1
grep -n "de los 25" packages/core/docs/history/programs/modern-rescue/research/2026-08/r1-craft-prep.md  # 145
```

Veredicto final: **ACCEPT** — D1 y D2 remediados con fidelidad sobre toda la
autoridad vinculante; baseline de maquinaria idéntico (117 F4B stale, 0
adicionales); guardia de regresión intacta. Una condición de staging (§D.1,
"25"→"24" en `r1-craft-prep.md:145`) y las observaciones portadas de §E.
