# P8 — Operación: commits sin push, cercas, CI, memos efímeros

HEAD verificado: `dcc44a6093de0ba4f9dcbdb733ae467008cffb21` (dado por el contexto) →
avanzó SOLO durante esta sesión a `f166570d92433fe1437133975732003c1fd29a32`
(2 commits nuevos, `ecdc01a61` + `f166570d9`, actividad DT en vivo — no míos,
cero writes de mi parte, ver §Reproducción 0).
git status inicial: ` M packages/core/scripts/boundaries/public-entrypoint-boundary-gate/index.mjs`,
` M .../index.test.mjs`, `?? docs/reauditoria-cloud/` (los 2 modificados eran
"ajenos", instruidos a no tocar).
git status final: sólo `?? docs/reauditoria-cloud/` — los 2 modificados
desaparecieron entre el inicio y el cierre porque el DT en vivo commiteó
(HEAD avanzó 672→674 respecto de `origin/main`); no los toqué en ningún
momento (cero Edit/Write/git mutante en toda la sesión).

## Reproducción (hecho base, comando → salida)

### 0. Movimiento de HEAD durante la sesión (evidencia de "blanco en movimiento")
```
$ git rev-parse HEAD            # al abrir
dcc44a6093de0ba4f9dcbdb733ae467008cffb21
$ git rev-parse HEAD            # al cerrar
f166570d92433fe1437133975732003c1fd29a32
$ git log --oneline dcc44a609..HEAD
f166570d9 docs(modern-rescue): asiento §13 del MICROFIX CODEX schemaVersion...
ecdc01a61 fix(modern-rescue): MICROFIX CODEX — el ancla de techos exige schemaVersion===1...
$ git rev-list --count origin/main..HEAD   # al cerrar
674
```
`f166570d9` dice textualmente "directorio ajeno docs/reauditoria-cloud sin
tocar" — el DT en vivo respeta la valla read-only de esta reauditoría.

### 1. Commits sin push, remotos, backup
```
$ git remote -v
origin  https://github.com/rottay/ui-design-system.git (fetch)
origin  https://github.com/rottay/ui-design-system.git (push)
$ git rev-list --count origin/main..HEAD   # al abrir
672
$ git rev-list --count HEAD..origin/main
0
$ git log -1 --format='%H %ci' origin/main
a97ddd7361d0a6bade35b47e30a62ed85d5dda40 2026-08-03 01:48:00 -0400
$ git log -1 --format='%H %ci' HEAD        # al abrir
dcc44a6093de0ba4f9dcbdb733ae467008cffb21 2026-08-28 12:48:09 -0400
$ git branch -r
origin/HEAD -> origin/main
origin/chore/ds-cleanup-2026-04        (2026-04-11)
origin/desing-system-multi-tenant      (2025-12-27)
origin/feat/modern-customization-2026-04 (2026-04-12)
origin/main                            (2026-08-03)
```
Ningún remoto/rama remota contiene commits posteriores a `origin/main`
(2026-08-03). `main` local es rama única de trabajo — **no existe** hoy
`modern-rescue/wip` ni ninguna otra rama espejo, local o remota.
Sin `.bundle` en disco (`find . -iname "*.bundle"` → vacío), sin mirror de
`.git/objects`, sin `.git` alterno bajo `..` salvo los de otros repos del
monorepo. `grep -rn "bundle\|respaldo\|backup" docs/*.md` da 11 archivos,
pero salvo el propio ledger, todos son sobre bundles CSS/JS, no sobre backup
de git.

El ledger sí registra el problema como abierto desde antes (25 días atrás en
términos relativos): `docs/history/programs/architecture-refactor/2026-08/execution/index.md:1919-1921`
("OPEN_OWNER adicionales: ... política de backup de los **519** commits
locales sin push"). Es decir, 519→672→674 en el mismo programa: crece con
cada sesión, sin resolución.

### 2. Cercas "never push" — citas textuales exactas
```
AGENTS.md:23-24
  "No stage, commit or push** without an explicit owner order for that exact
   change. `R7` is disabled."

packages/core/.../modern-rescue/README.md:357
  "...committing bounded lots locally under the owner's standing order —
   it never pushes."
packages/core/.../modern-rescue/README.md:408
  "Never push."

packages/core/.../modern-rescue/program/index.json (constitutionalLaws)
  "this program never pushes; publication requires an explicit
   owner-authorized release window"

packages/core/.../modern-rescue/orchestration/index.json:5
  "...push is always forbidden. This does not substitute owner decisions
   nor product-domain adjudications."
  orchestration/index.json .doubleAccept.notAuthorizationFor incluye "push"
  explícitamente (ni el doble-accept Fable+DT autoriza push).

CLAUDE.md (ui-design-system, raíz):35
  "One commit per lot, conventional format, **never push**. Version
   publishes are allowed."

docs/history/prompts/architecture-refactor/2026-08/coordination-continuation/index.md:11-12, :383, :420
  "Rama: `main`. **Nunca push.**" / "NUNCA push." / "push prohibido SIEMPRE."
docs/history/prompts/architecture-refactor/2026-08/code-audit-continuation/index.md:12-13, :120, :201
  idéntico patrón: "Rama: `main`. **Nunca push.**" / "NUNCA push." /
  "push prohibido SIEMPRE."

docs/history/programs/architecture-refactor/2026-08/handoff/index.md:352, :361
  "`push` NUNCA fue autorizado." / "`push` prohibido. El dueño nunca lo
   autorizó. Commitear sí."
```

Ninguna cerca distingue push a rama privada/WIP de publish — todas usan
lenguaje absoluto ("always forbidden", "SIEMPRE", "Never push", sin
excepción de rama). La única distinción textual es commit-local
(permitido bajo verificación DT) vs. **cualquier** push (prohibido) vs.
"version publishes" (permitido — release de npm del paquete, mecanismo
distinto de git push de commits/branches). El texto NO da la razón
"proteger apps consumidoras" — la razón explícita que sí aparece es de
autoridad/ventana: "publication requires an explicit owner-authorized
release window" (program/index.json) y "el dueño nunca lo autorizó" (HANDOFF).
La razón "protege a las apps consumidoras" es una GLOSA de Kimi
(`decisiones-owner.md:11`), no una cita del texto constitucional — la
marco como interpretación, no como hecho textual verificado.

### 3. `ci.yml` — triggers exactos
```
$ sed -n '1,10p' .github/workflows/ci.yml
name: '[ui] Design System'
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```
`branches:` en `pull_request` filtra por **rama base** (destino), no por
rama origen — es la semántica documentada de GitHub Actions. Consecuencia
verificada por lectura directa del archivo (no ejecutado, sólo el `on:`):
- Un `git push` a una rama nueva `modern-rescue/wip` **NO** dispara nada
  (el evento `push` sólo escucha `main`/`develop`) — CONFIRMA a Codex/Kimi.
- Un **Pull Request** abierto DESDE `modern-rescue/wip` HACIA `main` (o
  `develop`) **SÍ** dispara el workflow vía `pull_request.branches:[main,
  develop]`, sin tocar `ci.yml` — esto MATIZA/CORRIGE la formulación
  absoluta "una rama WIP no encendería la CI actual sin cambiar el
  workflow" (Codex, `consenso-triangulado-para-owner.md:30`) y "para que CI
  corra hay que tocar también el workflow" (Kimi, `decisiones-owner.md:17-18,
  25`): cierto para `push` puro, falso si el mecanismo es PR en vez de push
  directo a la rama de trabajo. El cambio mínimo real no es tocar
  `ci.yml` — es abrir un PR contra `main`/`develop` (lo cual, de por sí,
  requiere que exista push previo a alguna rama, y ese push sigue vetado
  por la cerca sin orden del dueño).

### 4. Censo de memos `/private/tmp`
```
$ grep -rhoE '/private/tmp/[A-Za-z0-9._/-]+' docs/*.md | sort -u | wc -l
116
$ grep -rhoE '/private/tmp/[A-Za-z0-9._/-]+' docs/history/programs/architecture-refactor/2026-08/execution/index.md | sort -u | wc -l
110
```
Universo distinto explica la diferencia 116 vs 110: **el ledger
(`ROADMAP-EJECUCION-2026-08-19.md`) aporta 110 de los 116** (subconjunto
exacto, verificado con `comm -23` → 0 líneas fuera). Los 6 restantes de
Cloud vienen de otros 3 archivos top-level de `docs/*.md`:
`docs/history/programs/architecture-refactor/2026-08/scripts-and-data/index.md` (1),
`docs/history/prompts/architecture-refactor/2026-08/design-lead-succession/index.md` (6),
`docs/history/audits/architecture-refactor/2026-08/execution-followup/index.md` (1)
(110+1+6+1=118, dedup a 116 por 2 paths repetidos entre archivos).
Cloud midió sobre TODO `docs/*.md`; Codex/Kimi hablan sólo "del roadmap".
Ambos universos son legítimos y no se contradicen — son alcances distintos
del mismo fenómeno.

Existencia en disco (`test -e` por cada path, script Python reproducido):
```
Universo 116 (Cloud):    exist=16   missing=100   → 100/116 EXACTO a la cita Cloud.
Universo 110 (roadmap):  exist=11   missing=99    → 11 vivas EXACTO a la cita Codex/Kimi.
```

Snapshot en `docs/evidence/2026-08/` (65 entradas por `ls`: 64 archivos planos
+ 1 subdirectorio `h1-experience-advisory/`):
```
missing_disk (99, universo roadmap) → basename-match en docs/evidence/2026-08/:
  con snapshot:     63
  sin snapshot:     36
```
Reproduce EXACTO el 63/11/36 de Codex/Kimi sobre el universo roadmap (110).

Método de "hash-matcheo" verificado por reproducción directa: el propio
`docs/evidence/2026-08/INDEX.md` documenta el procedimiento (enumerar
`/private/tmp/*.md` citados por el roadmap → recomputar SHA-256 en origen →
buscar el SHA asentado adyacente al path en el roadmap ["`, SHA <hex>`" en
prosa o fila de tabla] → copiar sólo si coincide → re-hashear la copia).
Ejemplo verificado a mano:
```
$ grep -n -A1 "/private/tmp/f4a-t0-dt-adjudication.md" docs/history/programs/architecture-refactor/2026-08/execution/index.md
953:`/private/tmp/f4a-t0-dt-adjudication.md`, SHA
954:`0d9b57705609be63533e3ede44a3feaa10b396484790f66ea96a44711fe4d468`.
$ shasum -a 256 docs/evidence/2026-08/f4a-t0-dt-adjudication.md
0d9b57705609be63533e3ede44a3feaa10b396484790f66ea96a44711fe4d468  ...
```
Coincide byte a byte. Reproducción completa en Python sobre los 63
matcheados: **62 MATCH inline + 1 MATCH vía `.ready`** (mismo desglose que
declara `INDEX.md`: "Resultado: 63 filas (MATCH = 62, MATCH(SHA en .ready,
no inline) = 1). Archivos copiados: 63. No copiados: 0.") 0 mismatches, 0
falsos positivos. `docs/evidence/2026-08/INDEX.md` es el mismo documento
fuente que Codex/Kimi debieron leer para citar 63 — no una coincidencia
independiente.

Verificación adicional: `docs/evidence/2026-08/` está commiteado en git
(`git log --diff-filter=A -- docs/evidence/2026-08` → primeros commits
`78dce1f7a`/`83c1a84f5`, 2026-08-23), es decir, es una mitigación PARCIAL ya
adoptada por el DT tras el hallazgo OPEN_OWNER del 2026-08-23 (respaldo por
contenido de los memos citados en el ledger), pero **cubre sólo memos ya
citados en el roadmap**, no el universo completo de `/private/tmp` generado
por el programa, y sólo arrancó ese día — nada anterior fue respaldado
retroactivamente salvo lo que el propio ledger cita.

### 5. Muestreo de `docs/evidence/2026-08/` — ¿son memos de auditoría?
```
$ ls docs/evidence/2026-08/ | sed -E 's/\.(md|log)$//' | sed -E \
  's/^.*-(fable-postaudit|fable-preaudit|fable-reaudit|...)$/\1/' | sort | uniq -c
  10 fable-postaudit
   4 fable-preaudit
   2 fable-reaudit
   3 fable-ratification
   7 sonnet-source-ready
   3 sonnet-inventory
   3 opus-brief
   ... (resto: opus-adjudication, dt-rulings, censos, briefs)
```
Muestra de 5 (`pre-f4b-unknown-sonnet-census-fable-review.md`,
`f4a-pre-k4-t1b-sonnet-source-ready.md`, `f4a-close-lot-b-fable-postaudit.md`,
`f4a-close-semantic-groups-opus.md`, `f4a-close-sonnet-inventory.md`):
las 5 son memos del propio flujo doble-accept del programa (preaudit/
postaudit/reaudit/ratification de Fable, source-ready/inventory de Sonnet,
adjudication de Opus), cada una con HEAD/staged/porcelain declarados al
abrir. **Confirmado: son la cadena de evidencia del doble-accept, no otra
cosa** (no son evidencia de producto/CSS, son evidencia de proceso).

### 6. Referencia desde el roadmap y script de reanclaje
```
$ grep -c "docs/evidence" docs/history/programs/architecture-refactor/2026-08/execution/index.md
3
$ find . -iname "*reanchor*" -o -iname "*re-anchor*" | grep -v node_modules
./docs/evidence/2026-08/f4a-pre-k4-r1-reanchor.md      (memo, no script)
./packages/core/scripts/evidence/cra-12-motion-governance/cra-12-motion-governance.reanchor.test.mjs  (no relacionado — reanclaje de CORPUS de test motion-governance, no de paths /private/tmp)
```
**No existe script de reanclaje** de citas `/private/tmp` → `docs/evidence`.
El único mecanismo es el procedimiento manual documentado en
`docs/evidence/2026-08/INDEX.md` (grep + sha256 + copia), ejecutado una vez
el 2026-08-23. "Reanclar los 63" (recomendación de consenso Codex/Kimi) no
tiene tooling hoy — sería trabajo nuevo, no un botón existente.

## Adjudicación por afirmación

| Afirmación | Quién | Cifra reproducida | Interpretación | Veredicto | Quién tenía razón |
|---|---|---|---|---|---|
| 672 commits sin push, ningún remoto los contiene | Cloud/Codex/Kimi | 672 (al abrir) / 674 (al cerrar) exacto | Riesgo de pérdida real: single point of failure, un disco muerto borra el trabajo | CONFIRMADA | Los 3 |
| Fix = push a `modern-rescue/wip` | Cloud | — | Esa rama no existe; la rama de trabajo es `main` directo. Un push, a cualquier rama, viola la letra absoluta de 8+ citas de "never push" en README/program/index.json/orchestration/index.json/CLAUDE.md/AGENTS.md/prompts DT, sin excepción de rama privada. Ningún agente puede autorizarlo | REFUTADA | Codex/Kimi (push viola la cerca) |
| "Una rama WIP no encendería la CI actual sin cambiar el workflow" | Codex/Kimi | `ci.yml:3-7` push/pull_request ambos `[main, develop]` | Cierto para `push` directo a la rama; **falso** si el mecanismo es un Pull Request desde esa rama hacia `main`/`develop` — `pull_request.branches` filtra por rama BASE (destino), no por rama de origen, así que un PR SÍ dispara CI sin tocar `ci.yml` | PARCIAL — matiz no capturado por ninguno de los 3 | Ninguno tenía el matiz completo; Codex/Kimi más cerca (el push puro efectivamente no dispara nada) |
| Cloud: "100 evidencias perdidas" | Cloud | 100/116 (universo `docs/*.md`) exacto | Cifra correcta en su propio universo pero no distingue "sin snapshot" (irrecuperable hoy) de "sin snapshot pero potencialmente reanclable si se documenta el procedimiento". Además ignora que 63/99 (universo roadmap) sí tienen snapshot hash-verificado | PARCIAL — cifra exacta, conclusión ejecutiva ("perdidas") exagerada | Codex/Kimi en la interpretación |
| Codex/Kimi: 110 rutas, 63 snapshot+SHA, 11 vivas, 36 sin respaldo | Codex/Kimi | 110/63/11/36 EXACTO, reproducido byte a byte con script propio y contra `docs/evidence/2026-08/INDEX.md` | Universo = sólo `ROADMAP-EJECUCION-2026-08-19.md` (no todo `docs/*.md`); es un subconjunto legítimo, no una cifra en competencia con la de Cloud — mide otra cosa | CONFIRMADA | Codex/Kimi |
| Snapshots de `docs/evidence/2026-08` son memos de auditoría (preaudit/postaudit Fable) | (implícito en el consenso) | 10 postaudit + 4 preaudit + 2 reaudit + 3 ratification Fable, + 7 sonnet-source-ready, + otros DT/Opus, sobre 64 archivos + 10 en subcarpeta | Confirmado por muestreo directo de contenido (headers), no sólo por nombre de archivo | CONFIRMADA | — |
| Existe script de reanclaje / la reconciliación 63/36 ya está resuelta | (implícito, ninguno lo afirma explícitamente pero D1 lo recomienda como acción) | 0 scripts encontrados | El procedimiento es manual, documentado, ejecutado una vez; "reanclar" es trabajo pendiente, no hecho | NO REPRODUCIBLE COMO HECHO YA CERRADO — es una recomendación abierta | — |

## Causalidad y severidad (si aplica)

Cadena: el programa opera 100% en `main` local (no hay rama de feature),
bajo cerca absoluta "never push" desde el arranque del programa
(2026-08-17/20). Cada sesión agrega commits sin ningún checkpoint remoto.
Consecuencia medida en el propio ledger: el número de commits sin respaldo
creció 519→672→674 en cuestión de días/horas de una sola sesión de
observación read-only — la ventana de exposición es proporcional al tiempo
transcurrido sin decisión del dueño, no a ningún límite técnico. Severidad:
alta para continuidad operativa (pérdida total de 25+ días de trabajo si el
disco local falla), baja/nula para integridad del producto (nada de esto se
publica ni afecta apps consumidoras mientras no haya push — la cerca
cumple exactamente su función declarada de mantener el árbol privado hasta
ventana de release autorizada).

## Fix correcto (tipo, sin implementar) y fixes que NO deben ejecutarse

Correcto (tipo, requiere orden explícita del dueño — D1 del propio
consenso triangulado):
- Réplica de respaldo SIN push: `git bundle create <ruta-fuera-del-disco>.bundle --all`
  (o `cp -R` del `.git` a otro disco), ejecutado por el dueño o por un
  agente con orden explícita puntual — no cambia ninguna cerca, no requiere
  enmienda constitucional.
- Si el dueño decide permitir push a una rama espejo: requiere (a) enmienda
  escrita explícita de la cerca "never push" (hoy absoluta, sin excepción de
  rama) nombrando la rama permitida y prohibiendo expresamente merge/publish
  desde ella, y (b) si se quiere CI en esa rama, agregarla a
  `on.push.branches` en `ci.yml` — O, más barato, simplemente abrir un PR
  desde esa rama hacia `main`/`develop`, que dispara CI hoy mismo sin tocar
  el workflow (ver §3). ambas piezas (enmienda + decisión CI) son del dueño.
- Reanclaje de los 36 sin respaldo: script que repita el procedimiento de
  `docs/evidence/2026-08/INDEX.md` sobre los 36 restantes — no existe hoy,
  es trabajo nuevo a autorizar, no un fix de una línea.

Fixes que NO deben ejecutarse sin orden explícita del dueño:
- Cualquier `git push` (a cualquier rama, incluida una "sólo para respaldo")
  ejecutado por un agente — viola la letra de las 8+ cercas citadas
  textualmente arriba, sin excepción.
- Editar `ci.yml` para agregar una rama sin decisión del dueño sobre qué
  rama y qué política de merge.
- Copiar "indiscriminadamente" el resto de memos `/private/tmp` sin
  verificación de SHA — el propio `INDEX.md` ya establece que un mismatch
  NO se copia; un script apurado podría copiar contenido corrompido y
  declararlo evidencia válida.

## Hallazgos nuevos que ninguno de los tres vio

1. **El matiz PR vs push en `ci.yml`** (§3): "una rama WIP no dispara CI"
   es cierto sólo para push directo; un PR desde esa rama hacia
   `main`/`develop` SÍ dispara CI sin tocar el workflow, porque
   `pull_request.branches` filtra por rama destino, no origen. Esto cambia
   la opción D1(a) de Kimi ("hay que tocar también el workflow") — no
   necesariamente, si el mecanismo elegido es PR y no push+trigger directo.
2. **HEAD es un blanco en movimiento incluso durante una sesión read-only
   corta**: avancé de 672 a 674 commits sin push simplemente por la
   actividad concurrente de otros agentes del mismo programa durante esta
   auditoría (`ecdc01a61`, `f166570d9`). Cualquier cifra de "commits sin
   push" en cualquiera de los tres informes ya está desactualizada en el
   momento de leerse — es una tasa, no un número fijo.
3. **`docs/evidence/2026-08/` ya es la respuesta parcial al problema D1**,
   commiteada desde 2026-08-23, pero acotada a los memos YA citados en el
   roadmap (no a todo lo que el programa genera en `/private/tmp`) y
   ejecutada manualmente una sola vez — no es un proceso continuo ni
   automatizado. Ninguno de los tres documentos de consenso la menciona
   como mitigación ya en marcha; la tratan como si el hallazgo fuera
   enteramente abierto.
4. La cita "protege a las apps consumidoras" (Kimi, D1) es una glosa/
   interpretación de intención, no una cita textual de ninguna de las 8+
   fuentes canónicas de la cerca — el propio Kimi lo admite ("no fue escrita
   para prohibir réplicas de respaldo, pero el texto es absoluto"). Vale la
   pena que el dueño sepa que es una interpretación, no una ley escrita.

## Lo que no pude cerrar

- No verifiqué si `docs/history/prompts/architecture-refactor/2026-08/design-lead-succession/index.md` (6 de los 116
  paths de Cloud) tiene su propio mecanismo de snapshot — quedó fuera del
  universo roadmap-only que reproduje en detalle.
- No inspeccioné el contenido completo de los 36 paths sin respaldo para
  confirmar que son irrecuperables (podrían existir copias parciales en
  otros memos vivos, en el propio texto del roadmap citado indirectamente,
  o el contenido podría estar sustancialmente repetido en un memo posterior
  del mismo lote) — sólo confirmé ausencia de archivo+ausencia de snapshot
  homónimo, no ausencia de contenido equivalente en otra forma.
- No repetí la comprobación de que `pull_request.branches` filtra por rama
  base contra el comportamiento REAL de GitHub Actions en este repo (no hay
  acceso de red/gh autenticado en esta sesión read-only) — la afirmación se
  apoya en la semántica documentada estándar de GitHub Actions, no en una
  corrida real observada en este repositorio.
