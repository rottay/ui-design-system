# Auditoría FABLE 5 — RESTOS de la enmienda de dirección R1 (segunda pasada, owner 2026-08-30)

- **Auditor:** Fable 5 (independiente, read-only salvo este informe)
- **Fecha:** 2026-08-30
- **HEAD:** `58e5cd5b0` (enmienda de dirección R1 commiteada; auditada por mí en
  `scouts/r1-direction-amendment-fable.md`, ACCEPT)
- **Objeto:** el diff sin commitear de la remediación de los SEIS restos que el
  owner mandó cerrar (5 archivos, 11 líneas: `program.json`, `rounds.json`,
  `tenant-art-direction.json`, `program-check.mjs`, `r1-craft-prep.md` §6.4) +
  la entrada al commit de `scouts/hardcode-census-top5.md`.
- **Regla cumplida:** cero escritura sobre el repo excepto este informe. Sin
  builds, sin servidores, sin mutaciones git.

## VEREDICTO: DEFECTS-2

Los seis restos enumerados por el owner están remediados con fidelidad (§A) y
nada de lo ACCEPTado en mi auditoría previa quedó deshecho (§B). Pero el
mandato de esta pasada era cerrar las contradicciones residuales de la
enmienda, y el barrido por variantes morfológicas (no solo por la grafía
exacta de los textos removidos) prueba que la clase residual sigue viva en
autoridad vinculante en dos formas que esta remediación tampoco tocó:

- **D1** — el veto duro `current-tenant-palette-retained-without-r1-sighted-readjudication`
  sobrevive en las dos listas de vetos vivas y muerde R1 HOY: su condición de
  disparo es literalmente el estado que la enmienda sanciona ("los fixtures
  conservan sus valores actuales"). Es la tercera pata de la misma puerta
  trasera cuyas dos aserciones gemelas el resto 5 sí removió de
  `program-check.mjs`.
- **D2** — la prueba de reconocimiento retirada del objetivo R1 sigue REQUERIDA
  en contrato vivo: `divergenceContract.threeSecondGrayscaleRecognitionRequired: true`
  + dos acceptanceQuestions de identidad en `tenant-art-direction.json` (campo
  que el propio resto 2 ordenó congelar), y verbatim en los objetivos R4 y R6
  de `rounds.json`.

Ninguno de los dos es removible por el implementador sin una adjudicación del
owner (D1 exige tocar dos contratos fuera del write-set declarado; D2 choca de
frente con la instrucción "los campos machine-checked NO cambiaron"). Por eso
el veredicto es DEFECTS y no ACCEPT-con-observaciones: si esto se commitea tal
cual, el owner va a encontrar los mismos residuales en una tercera pasada.

---

## A. Los seis restos, uno a uno

### A.1 — `program.json`: invariante reemplazada ✓

- `program.json:100` — la invariante vieja ("BitHire and The Management comply
  with the binding tenant art direction on the same tree") reemplazada por la
  prueba de cascada con paridad static/DB y la coda explícita "(owner
  amendment 2026-08-30: the binding art-direction compliance invariant is
  retired)". Diff de 1 línea, verificado.
- **Ninguna otra invariante re-impone la dirección diferida:** las 25
  invariantes leídas una a una (índices 0-24 del array). Las adyacentes son
  mecanismo (cadena de theming #10, precedencia de canales #21, overrides por
  instancia #22), no dirección estética. El único otro match del scan
  (`program.json:12`) es el puntero de registro `artDirectionContract` al
  archivo — un path, no una imposición.

### A.2 — `tenant-art-direction.json`: diferido en su prosa; campos congelados intactos ✓ (pero ver D2)

- `tenant-art-direction.json:11` — `authority.purpose` ya no dice "Binding
  product-art-direction input for R1-R7"; ahora: "Historical record of the
  deferred art directions… this file binds nothing in the current stage".
- `tenant-art-direction.json:30` — la ley "R1 replaces and sightedly
  readjudicates both palettes" retirada: "the law that R1 replaces and
  readjudicates them is RETIRED (owner amendment 2026-08-30): the fixtures
  keep their current values as controlled baselines until a later
  per-vertical customization phase".
- `tenant-art-direction.json:4-9` — `stageStatus` (`DEFERRED_AS_R1_TARGETS`,
  de la enmienda previa `58e5cd5b0`) presente e intacto.
- **Campos machine-checked NO cambiaron** (el diff toca solo las líneas 11 y
  30): targets en orden `['bithire-static','themanagement-db']` con
  `currentPaletteIsTarget:false` y `paletteRebuildLaw` presentes en ambos;
  `sameTree:true`; `creativeAdvisor` byte-exacto; `divergenceContract` (12
  ejes, ≥8/≥6); `kimiProposalBoundary.allowedWrites = "new proposal files
  under the inbox only"`; `r0MechanismDecisions` con sus 7 entradas. Todos
  recomputados desde el artifact con python, y el bloque de validación
  `program-check.mjs:1638-1698` corre verde (cero errores de esa familia en el
  log, §A.5).
- **PERO** el congelamiento de `divergenceContract` preserva dentro del campo
  la prueba retirada (`:289`, `:307-308`) — el archivo NO quedó
  "inequívocamente diferido" porque ese campo no es histórico: sigue siendo la
  fuente viva de los mínimos ≥8/≥6 que `rounds.json:107` mantiene y que
  program-check valida. Detalle y disposición en **D2**.

### A.3 — `rounds.json` R1: objetivo reemplazado ✓

- `rounds.json:108` — "prove three-second tenant recognition in grayscale and
  after temporary primary-hue neutralization" reemplazado por "prove that
  controlled mutations of public controls produce observable, predictable
  differences between the two fixtures, by static BrandTheme and by DB
  TenantTheme with parity; no aesthetic-identity evaluation of a vertical is
  part of this stage (owner amendment 2026-08-30)". Diff de 1 línea,
  verificado. (Los hermanos verbatim en R4/R6 sobreviven — **D2**.)

### A.4 — `r1-craft-prep.md` §6.4 ítem 4 ✓

- `r1-craft-prep.md:174` — el ítem 4 ya no presenta la dirección vieja como
  algo que Opus debe diseñar: "RETIRADA por la enmienda del owner… NO hay
  dirección estética que diseñar… Lo que Opus decide en su lugar: la gramática
  del DS que las mutaciones de controles deben demostrar…". La afirmación
  interna del ítem es verificada: la divergencia ≥8/≥6 sigue en
  `rounds.json:107` como propiedad de la prueba. La cabecera de corrección de
  la enmienda previa (líneas 3-18) sigue intacta.

### A.5 — `program-check.mjs`: aserciones removidas, comportamiento intacto ✓

- Las dos aserciones (`currentPaletteIsTarget !== false` → "must remain
  rejected as R1 targets"; `paletteRebuildLaw` debe contener "Replace")
  REMOVIDAS con comentario fechado y atribuido
  (`program-check.mjs:1656-1661`); los mínimos de divergencia del fixture
  quedan enforced arriba (":1649-1654"), como el comentario declara.
- (a) `grep -n "paletteRebuildLaw\|currentPaletteIsTarget" program-check.test.mjs`
  → **0 matches** (exit 1). Ningún test depende de ellas.
- (b) `node program-check.mjs` → exit 1 con exactamente **118 líneas**: 1
  cabecera "BLOCKED — constitution drift detected:" + **117** "source digest
  is stale", las 117 bajo `wo-cra-23/F4B/` (117 rutas de receipt únicas). **Ni
  un fallo más.** Set byte-idéntico al pre-existente en HEAD: ningún receipt
  F4B hashea archivo alguno de este write-set
  (`grep -rl 'rounds\.json\|tenant-art-direction\|program\.json\|program-check\|r1-craft-prep\|hardcode-census' wo-cra-23/F4B --include='*.receipt.json'`
  → 0).
- (c) `node --check program-check.mjs` → OK.

### A.6 — `hardcode-census-top5.md` entra al commit ~ (verificable solo hasta donde el pre-commit permite)

- El archivo existe (28.160 bytes), es el input real del programa (reproduce
  el censo 729/1.610/881 contra `root-membership.json`, el ratchet
  2.169/4.373, channel-liveness 440/407/33/48, inline-paint 190/54 y el
  namespace privado 198/380, con comandos de reproducción).
- **No está gitignored** (`git check-ignore` → exit 1), así que un `git add`
  plano lo trackea y, tras el commit, `git status` dejará de listarlo. La
  condición post-commit del owner no es ejecutable antes del commit; queda
  como **condición de staging del lote**: el commit DEBE incluirlo.
- Condiciones de staging adicionales (fence `README.md:423`): NUNCA
  `docs/reauditoria-cloud/` (el propio censo lo advierte en su §1.1), y el
  scout concurrente `r1-button-opus-grammar.md` (§C.4) es ajeno a este
  write-set — no entra a este lote salvo adjudicación explícita del DT.

## B. Guard de regresión: nada del ACCEPT previo quedó deshecho ✓

Contra mi informe `r1-direction-amendment-fable.md`, punto por punto en el
árbol de trabajo actual:

- `rounds.json:103` (fixtures de prueba, paridad static/DB), `:104` (drenaje
  del censo ~795 + 52 clase-B), `:105` (source-first 80/20, no lotes
  solo-documentos), `:106` (cascada observable + tests), `:119` (exit con
  paridad y obligación retirada), `:121` (censo monótono por checkpoint),
  `:253` (writeDomains "never per-vertical beautification") — todos
  presentes; el diff actual solo tocó la línea 108.
- `README.md` del programa: sin tocar en este diff; los tres fences de la
  enmienda siguen: `:452` (Owner direction amendment), `:461` (Source-first
  budget), `:469` (Cohort report shape).
- `tenant-art-direction.json:4-9` `stageStatus` intacto.

---

## D. DEFECTS

### D1 — El veto duro de paleta sobrevive en las dos listas vivas y muerde R1 hoy

**Evidencia:**

- `visual-craft-contract.json:348` — `hardVisualVetoes` (25 entradas) incluye
  `current-tenant-palette-retained-without-r1-sighted-readjudication`.
- `quality-rubric.json:310` — el mismo ID en `hardVetoes` (índice 41 de 52; la
  lista arranca en `:268`), que es elegibilidad de rubric.
- Vinculación actual, no futura: `rounds.json:111` (objetivo R1 "close the
  twelve reproduced visual-craft incidents and every generalized
  hardVisualVeto") + `rounds.json:120` (exit R1 "zero hard vetoes") +
  `program-check.mjs:1709-1713` (todo veto de craft DEBE espejarse en
  `rubric.hardVetoes` — imposible retirarlo de un solo archivo).

**Por qué es defecto:** la condición de disparo del veto es exactamente el
estado que la enmienda sanciona (`tenant-art-direction.json:30`: "the fixtures
keep their current values as controlled baselines"). Con el veto vivo, el exit
"zero hard vetoes" de R1 solo se satisface haciendo la readjudicación de
paletas RETIRADA — la dirección diferida re-impuesta por la puerta trasera. Es
la misma clase que las dos aserciones que el resto 5 removió de
`program-check.mjs`; esta tercera pata quedó fuera del write-set.

**Remediación limpia disponible (para el DT, con orden del owner):** remover
el ID de AMBAS listas atómicamente. `program-check` queda verde: el piso es
`>= 15` vetos (`program-check.mjs:1706`; 25→24 y 52→51 lo cumplen), el espejo
craft⊆rubric se preserva, y repo-wide el ID existe SOLO en esos dos archivos
(barrido con `--exclude-dir=node_modules --exclude-dir=.git`): ningún receipt
congelado, ningún test, ningún baseline lo cita.

### D2 — La prueba de reconocimiento retirada sigue REQUERIDA en contrato vivo (tres sitios)

**Evidencia:**

- `tenant-art-direction.json:289` —
  `"threeSecondGrayscaleRecognitionRequired": true` dentro de
  `divergenceContract`.
- `tenant-art-direction.json:307-308` — `acceptanceQuestions` 1 y 2: "Can an
  observer identify the tenant in three seconds after captures are converted
  to grayscale?" / "Would each tenant still feel distinct if its primary hue
  were temporarily neutralized?" — la evaluación de identidad estética que el
  resto 3 sacó del objetivo R1, formulada como preguntas de aceptación.
- `rounds.json:368` — objetivo R4: "make each complete screen recognizable by
  tenant in grayscale through chrome type geometry material rhythm and
  responsive composition".
- `rounds.json:422` — objetivo R6: "tenant-art-direction scene matrix and
  three-second grayscale review" — verbatim la prueba retirada, y además
  nombra como input de certificación la matriz de escenas de un archivo cuyo
  purpose ahora declara "binds nothing in the current stage"
  (`tenant-art-direction.json:11`).

**Por qué es defecto y no observación:** `divergenceContract` NO es registro
histórico — es la fuente viva de los mínimos ≥8 ejes / ≥6 no-color que
`rounds.json:107` conserva como objetivo R1 y que
`program-check.mjs:1649-1654` valida. Un mismo campo vivo contiene la parte
sancionada (mínimos de divergencia, escenas, anchos) y la parte retirada (flag
de reconocimiento + preguntas de identidad). Y R4/R6 son rondas de ESTE
programa (R0-R6 ejecutan; la "later per-vertical customization phase" del
`stageStatus` no es ninguna de ellas): como están escritas, o re-imponen la
dirección diferida cuando abran, o son insatisfacibles (no habrá identidad
por-vertical diseñada que reconocer).

**Por qué no lo remedió esta pasada y qué necesita:** el resto 2 ordenó
literalmente que `divergenceContract` "NO cambiara", y los restos 1/3 se
acotaron a invariants/R1 — la remediación siguió la letra del owner y la letra
congeló la contradicción. `program-check` NO pinea el flag (grep de
`threeSecond` en `program-check.mjs` y `program-check.test.mjs` → 0 matches),
así que retirarlo no exige tocar el checker. Necesita una adjudicación
explícita del owner que separe, dentro de `divergenceContract`, sub-campos
vivos (ejes, mínimos, escenas, anchos, locales, densidades) de sub-campos
retirados (`threeSecondGrayscaleRecognitionRequired`, acceptanceQuestions 1-2)
y que reescriba o difiera explícitamente `rounds.json:368` y `:422` con la
misma fórmula neutral que ya usó en R1.

---

## E. Observaciones (no bloquean; para el DT)

1. **`visual-craft-contract.json:426`** — checkpoint artifact "tenant
   grayscale and neutralized-primary comparison when grammar changes". Es
   dual-uso: como CAPTURA comparativa sirve legítimamente a la prueba de ≥6
   ejes no-color retenida; como vehículo del test de reconocimiento es
   residuo. No exige evaluación de identidad por sí mismo → no lo elevo a
   defecto. Reformular a lenguaje de divergencia neutral cuando ese contrato
   se abra (idealmente en el mismo lote que D1, que ya lo toca).
2. **`customization-model.json:155`** —
   `grayscaleAndNeutralizedPrimaryRequired: true` pertenece a
   `referencePostures` de R7 (pares de las 5 posturas descriptivas
   no-producto), no a los tenant fixtures. Consistente con la enmienda (los
   postures no son verticales) y R7 está `enabled: false`. Sin acción.
3. **Comentarios del lab de referencia en Showroom** afirman la ley retirada
   en presente: `packages/showroom/src/app/probe/ds-reference/ground/stamp.ts:35`
   ("R1 requires proving three-second tenant recognition…"),
   `chrome/index.tsx:5`, `page.tsx:21`. Son comentarios, no maquinaria —
   mismo tratamiento que di a `themanagement-db-row/index.ts:62` en la
   auditoría previa (§F.3): limpiar en el próximo lote que toque el lab, nunca
   como edición suelta.
4. **Scout concurrente `scouts/r1-button-opus-grammar.md`** (untracked, creado
   17:33 de hoy, DURANTE esta auditoría — trabajo Opus en paralelo; no estaba
   en el snapshot inicial del árbol). Su hallazgo F1 (línea 77) cita "prove
   three-second tenant recognition…" como exit vivo de R1 pese a que su propia
   cabecera declara haber leído el `rounds.json` post-enmienda (donde ese
   texto ya no existe). La sustancia de F1 (link indistinguible de ghost en
   reposo en tenant monocromo) sobrevive con sus otras leyes citadas
   (L1/L2/V5, taxonomía hue-alone); la cita debe corregirse antes de usar el
   scout como input del lote Button. Ajeno al staging de ESTE lote.
5. **Erratum sobre mi auditoría previa (ACCEPT, que mantengo):** mi barrido
   negativo de aquella pasada buscó los NOMBRES de dirección y la grafía
   `three-second` con guion; `threeSecondGrayscaleRecognitionRequired`,
   "three seconds" y el ID del veto no matchean ese patrón, y así D1/D2
   sobrevivieron dos pasadas. La lección operativa (ya asentada para fences
   textuales) aplica a leyes retiradas: barrer por variantes morfológicas y
   por IDs de veto/flag, no por una sola grafía del texto removido. El ACCEPT
   previo sigue siendo correcto sobre su objeto (los once puntos de la
   directiva estaban codificados); estos residuales pertenecían al árbol ya
   antes de aquella enmienda.

---

## Apéndice — reproducción

```bash
cd /Users/daniel/Developer/Rottay/ui-design-system
git rev-parse --short HEAD   # 58e5cd5b0
git diff --stat              # 5 files, 11 insertions(+), 11 deletions(-)
P=packages/core/scripts/quality-evidence/programs/modern-rescue

# A.5 — program-check
node $P/program-check.mjs 2>&1 | tee /tmp/pc.log; wc -l /tmp/pc.log        # 118
grep -c 'source digest is stale' /tmp/pc.log                               # 117
grep -o 'wo-cra-23/F4B/[A-Za-z0-9./_-]*\.receipt\.json' /tmp/pc.log | sort -u | wc -l  # 117
node --check $P/program-check.mjs                                          # OK
grep -n "paletteRebuildLaw\|currentPaletteIsTarget" $P/program-check.test.mjs  # 0 matches

# D1 — veto vivo, solo en dos archivos, no pineado
grep -rln "current-tenant-palette-retained-without-r1-sighted-readjudication" \
  --exclude-dir=node_modules --exclude-dir=.git .   # quality-rubric.json + visual-craft-contract.json
grep -n '"zero hard vetoes"' $P/rounds.json          # 120 (R1), 429, 536
python3 -c "import json; vc=json.load(open('$P/visual-craft-contract.json')); \
  qr=json.load(open('$P/quality-rubric.json')); \
  print(len(vc['hardVisualVetoes']), len(qr['hardVetoes']), \
  set(vc['hardVisualVetoes'])<=set(qr['hardVetoes']))"   # 25 52 True

# D2 — ley de reconocimiento viva (barrido por variantes)
grep -rln -i -e "three.second" -e "three seconds" -e "recognizable by tenant" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=test-artifacts .
grep -n "threeSecondGrayscaleRecognitionRequired\|three seconds\|temporarily neutralized" \
  $P/tenant-art-direction.json                        # 289, 307, 308
grep -n -i "threeSecond" $P/program-check.mjs $P/program-check.test.mjs    # 0 matches

# A.6 — censo
git check-ignore packages/core/test-artifacts/quality-evidence/wo-cra-23/scouts/hardcode-census-top5.md
# exit 1 => no ignorado; git add plano lo trackea
```

Veredicto final: **DEFECTS-2** (D1 veto de paleta en
`visual-craft-contract.json:348` + `quality-rubric.json:310`; D2 ley de
reconocimiento en `tenant-art-direction.json:289,307-308` +
`rounds.json:368,422`). Los seis restos enumerados: remediados. El guard de
regresión: intacto.
