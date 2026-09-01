# Veredicto Fable — auditoría read-only del mapeo F0.5 Fase 1 (previa a ejecución)

Auditor: Fable (independiente). Fecha: 2026-08-19. Repo:
`/Users/daniel/Developer/Rottay/ui-design-system` (read-only puro; cero ediciones).
Insumos auditados: `/tmp/f05-fase1-mapping.md`, `/tmp/f05-pasoB-brief.md`,
`/tmp/f05-fase1-addendum.md`, contrastados contra `docs/ARCHITECTURE.md` §1.2
(líneas 66-108) y §2.9 (líneas 993-1035) y contra el árbol real en disco.

## Veredicto global: **PROCEDER CON CORRECCIONES**

El mapeo es de alta calidad: la tabla de 225 filas es consistente con el árbol
real, las asignaciones de familia siguen §2.9 casi literalmente, los clusters
C1-C12 son reales (verifiqué los imports uno a uno) y la aritmética de lotes
cuadra. Pero hay **cinco agujeros bloqueantes**, todos de la misma clase: el
censo de referenciantes se detuvo en el árbol `scripts/` + los 4 casos del
addendum, y **nunca miró `packages/core/src/`, los scripts de raíz ya
relocados, ni los repos hermanos**. Además el brief fusionado **eliminó el
Lote 0 (F5)**, que el propio mapeo declaraba prerequisito. Ejecutar el Paso B
tal como está escrito deja CI rojo en los lotes C, E y F y toda la
verificación de wiring en falso verde desde el lote A.

---

## Hallazgos

### H1 — BLOQUEANTE: el brief eliminó el Lote 0 (fix de `wiring-coverage-gate`, F5)

**Evidencia:** `packages/core/scripts/wiring-coverage-gate.mjs:69` sigue siendo
`readdirSync(HERE)` plano (verificado hoy en disco); el mapeo lo declara
prerequisito («Lote 0 … Sin esto, todo lo demás pasa vacuamente», mapping:493);
la tabla de lotes del brief (`f05-pasoB-brief.md:53-63`) arranca en A y no
contiene ningún lote 0 ni mención a F5; peor: la verificación transversal
(brief:86) exige `node scripts/wiring-coverage-gate.mjs → exit 0`, que con el
gate plano es **exactamente el falso verde que F5 predijo**.

Adicional no señalado por el mapeo: el resolver de un salto del mismo gate
(`wiring-coverage-gate.mjs:83-90`) hace `join('scripts', match[1])` — asume
imports a profundidad 1. Con árboles `<familia>/<capability>/` los imports
`../../lib/...` se resuelven mal, así que «volverlo recursivo» no basta: hay
que rehacer también la resolución de imports por profundidad real.

**Corrección:** restituir el Lote 0 en el brief antes de habilitar el lote A:
(1) `productionScripts()` recursivo con la semántica nueva
(`**/index.mjs` producción, excluyendo `*.test.mjs` y sidecars), (2) resolver
de imports por path real del archivo importador, (3) drill con huérfano
plantado a profundidad 2 que pruebe que el gate FALLA.

### H2 — BLOQUEANTE: `packages/core/src/` tiene 6+ dependencias reales de scripts planos, ninguna censada

El censo del mapeo («in-tree», «consumidores: N») coincide exactamente con los
archivos del árbol `scripts/` — lo verifiqué recontando importadores de 4
módulos: los números del mapeo son correctos **dentro de `scripts/`** y omiten
sistemáticamente `src/`. Sitios verificados:

| Sitio | Depende de | Rompe en lote |
|---|---|---|
| `src/tooling/resolution-probe/runtime/ingress/index.mjs:47` (import ESM) | `scripts/dist-freshness-gate.mjs` | E |
| `src/tooling/resolution-probe/runtime/bundle/index.mjs:40` (import ESM) | `scripts/libraries/modern-framework-layer.mjs` | I |
| `src/tooling/resolution-probe/foundation/scope/index.mjs:35` (import ESM) | `scripts/libraries/first-party-roster-source.mjs` | I |
| `src/tooling/lane-control/public/work-order/index.mjs:49` (import de `blockingGates`) y `:88` (`CI_MANIFEST_PATH`) | `scripts/check/automation-gates.manifest.mjs` | F |
| `src/tooling/lane-control/integration/tests/drills/work-order/index.mjs:135` (`existsSync` sobre el path plano) | `scripts/cra-14-public-barrel-gate.mjs` | E |
| `src/tooling/lane-control/integration/tests/drills/work-order/index.mjs:117` + `public/work-order/examples/wo-example.json:51` (comando debe seguir REGISTRADO en el manifiesto) | `scripts/check/engine-token-audit.mjs` | H (cuando F2 reescribe el path del manifiesto) |
| `src/tooling/lane-control/public/work-order/synthetic-rows.json:66,67,99` (paths exactos) | manifiesto, `run-ci-gates.mjs`, `tokens-catalog.mjs` | F, G |

Gravedad agravada: `lane-control-drills` es un gate **bloqueante registrado en
el propio manifiesto** (`ci-gates.manifest.mjs:406-407`), y ninguno de estos
archivos está cubierto por `node --test "scripts/**/*.test.mjs"` ni por
`gates:ci:list`, así que la verificación por lote del brief **no detectaría la
rotura**; aparecería recién en el `pretest` de CI. (Los globs
`packages/core/scripts/**/*-gate.mjs` de synthetic-rows sobreviven; los paths
exactos no.)

**Corrección:** añadir un fixup F11 («consumidores en `src/`») al checklist,
asignando cada sitio a su lote (E: ingress + drill cra-14; F: lane-control
work-order + synthetic-rows; G: tokens-catalog en synthetic-rows; H:
wo-example + drill 117; I: bundle + scope), y añadir a la verificación de los
lotes E/F/G/H la corrida del gate `lane-control-drills`.

### H3 — BLOQUEANTE: tres repos hermanos invocan `audit-vertical-compliance.mjs` y el mapeo dice «pkg, docs:1»

**Evidencia:** `app-bithire/package.json:46`, `app-evnto/package.json:16`,
`app-platform/package.json:58` — los tres:
`"lint:vertical": "node ../ui-design-system/packages/core/scripts/audit-vertical-compliance.mjs --app-dir src"`.
La fila del mapeo (mapping:70) no lista ningún consumidor externo; el addendum
tampoco. El script se mueve en el lote C.

Son repos git separados: el commit del lote C **no puede** arreglar esto
atómicamente. **Corrección:** decisión del coordinador antes del lote C —
actualizar los tres `package.json` hermanos en la misma sesión del lote C (y
anotarlo en el reporte del lote), o diferir el movimiento de
`audit-vertical-compliance` a un lote final coordinado. Sugiero también
barrer los `.github/` hermanos (lo hice: sin matches) y dejar constancia.

### H4 — BLOQUEANTE: `dependency-honesty` (raíz, corrido por CI) importa `cra-17-public-declaration-gate`

**Evidencia:** `scripts/check/dependencies/index.mjs:23`:
`import { auditPublicDeclarationClosures } from '../../../packages/core/scripts/cra-17-public-declaration-gate.mjs'`.
CI lo ejecuta directo (`.github/workflows/ci.yml:194,202`). El gate se mueve en
el lote E. La fila del mapeo (mapping:89) sí dice «root-scripts», pero **F8 no
lo enumera** y la regla 5 del brief (los únicos fixups cross-package
operativos) solo cubre los 4 scripts del addendum. Resultado: lote E deja CI
rojo sin que ninguna regla del brief obligue al arreglo.

**Corrección:** añadirlo a la regla 5 del brief (o al F11 de H2) con el path
nuevo ya vigente tras el lote de raíz en vuelo.

### H5 — BLOQUEANTE: el test de `effect-registry-audit` (raíz) rompe dos veces en el lote F y la verificación del brief no lo ve

**Evidencia:** `scripts/check/effects/index.test.mjs:9`
importa `../../../packages/core/scripts/check/automation-gates.manifest.mjs`, y `:204`
aserta literal `coreManifest.scripts['gates:ci'] === 'node scripts/run-ci-gates.mjs'`.
El lote F mueve el manifiesto Y cambia esa entrada de `package.json`: ambas
cosas rompen el test. El mapeo lo sabía (F8, mapping:468-470, con el path
viejo de raíz), pero la regla transversal del brief **nunca invoca F8**, y la
verificación corre «desde `packages/core/`» (brief:80), donde ni `git grep` ni
`node --test "scripts/**/*.test.mjs"` alcanzan la raíz del repo.

Mitigante existente: `packages/core/package.json:664` (`test:scripts`) sí corre
ese test de raíz — pero el brief pide el comando crudo, no `pnpm test:scripts`.
**Corrección:** en el lote F, incluir F8 como paso explícito; y en la regla 7
del brief, sustituir el comando crudo por `pnpm test:scripts` y correr el
`git grep` residual **desde la raíz del repo**, no desde `packages/core/`.

### H6 — MENOR: la verificación por `git grep` de «rutas viejas» es ciega a los imports relativos rancios

Tras un lote temprano, el consumidor movido reapunta a la ubicación plana con
un import relativo que ya no contiene `scripts/` (ej.: tras el lote G,
`tokens/kimi-worklist-gate/index.mjs` importará `../../css-layer-paint-gate.mjs`).
Cuando el lote H mueva el objetivo, un grep por la ruta vieja completa
(`scripts/css-layer-paint-gate.mjs`) **no encuentra** ese import rancio.
Además, los scripts sin test (`analyze-bundle`, `css-source-integrity-gate`,
`dev`, `build-font-packs`, `check-storybook-budget`, …) no tienen ningún check
que resuelva sus imports post-movida: `node --check` no resuelve imports y
`gates:ci:list` no ejecuta gates.

**Corrección:** (1) grep residual por **basename** (`<x>.mjs`) además de la
ruta completa; (2) correr `pnpm gates:ci` completo al cierre de los lotes F, H
e I como mínimo (idealmente en todos); (3) para scripts sin test, un smoke
`node -e "await import(...)"` por archivo movido del lote.

### H7 — MENOR: constantes repo-relativas dentro de scripts que se mueven

No son imports y un fixup «solo imports» las saltaría; todas dentro del
paquete y cazables por grep, pero conviene listarlas para el ejecutor:
`gat-09-full-claim-integrity.mjs:35,41` (evidence JSON y `GAT07_SCRIPT_PATH` —
lote E, intra-lote); `platform-identity-zero-gate.mjs:15-16` (allowlist de sí
mismo — lote C); `relocate-engine-token-baseline.mjs:51` (path del baseline —
lote H); `lib/cra-11-adaptive-contract-census.mjs:1375` (`generatedBy` — el
string apunta al script de producción que se mueve en E, el archivo se mueve
en I); `gat-09-full-claim-integrity.test.mjs:329`.

### H8 — MENOR: pareja pineada del string de evidencia de `analyze-bundle`

`src/infrastructure/runtime/effects/runtime/registry/index.ts:294` y su espejo
pineado en `scripts/check/effects/index.mjs:119` dicen
`'packages/core/scripts/analyze-bundle.mjs --effects'`. Al mover
`analyze-bundle` (lote F) ambos quedan apuntando a un path extinto; si se
actualiza solo uno, el audit de raíz va a rojo. Edición pareada, en el lote F.

### H9 — MENOR: F3 del mapeo cita un path de raíz ya obsoleto

`mapping:436-437` describe el import de `cra-15-runtime-hardening-gate` como
`../../../scripts/effect-registry-audit.mjs`; el árbol real ya dice
`../../../scripts/check/effects/index.mjs`
(`cra-15-runtime-hardening-gate.mjs:8`, actualizado por el lote de raíz en
vuelo). No es rotura — el brief manda recalcular «SIEMPRE desde la ubicación
destino» — pero el ejecutor debe saber que la letra de F3 está desfasada del
árbol en este punto (y en cualquier otro que el lote en vuelo toque).

### H10 — MENOR: las enmiendas de ley comprometidas deben aterrizar con su lote, no después

A10 (test cross-owner en `ci/` contradice §1.2:86-87), A16 (`index.test.mjs` al
lado del dueño contradice «tests live in the owning unit's `tests/` branch»,
§1.2:86), A17 (basename completo contradice el ejemplo `<capability>/baseline.json`
de §1.2:88-89) y A11/AN6 (dos sueltos en `scripts/` contradicen §1.2:74-79 tal
como está escrita) son todas resolubles por enmienda — y el coordinador las
asumió — pero mientras no estén escritas, el árbol del Paso B contradice la
ley vigente. La regla del monorepo exige docs en la misma sesión del cambio:
cada enmienda debe entrar en el commit del lote que la estrena (A16/A17 en el
lote A; A10 en el F; A11/AN6 con AN3). Y el gate de AN3 (Paso D) debe nacer
DESPUÉS del Paso C o con las excepciones A1/A2 escritas: los 12+9 destinos con
nombre de familia repetido violan §1.2:81-83 hasta que el Paso C los renombre.

### H11 — INFO: verificaciones que hice y salieron limpias

AN4 (test de v1 borrado: confirmado ausente), AN5 (0 bytes NUL en ambos
archivos, medido en binario), AN7 (el README de pattern-surface-ownership no
lo referencia nada: grep repo-wide vacío), C2 (`cra-17-integral-gate.mjs:14,17`
importa los dos componentes: fusión E correcta y necesaria), C8 (exactamente
UN import saliente en `quality-evidence/`: `v2/inventory-correspondence.mjs:6`;
el resto de matches son fixtures), C9 (`kimi-worklist-gate.mjs:39`), C1
(`gat-07-exact-proof.mjs:58` y `literal-ownership-gate.mjs:37` leen el baseline
del audit con dos idiomas distintos — HERE-relativo vs ROOT-relativo — el
fixup del lote E/H debe tratar cada uno según su idioma), globs
(`test:scripts` y `vitest.scripts.config.ts` son `**` recursivos: F10 y A12
correctos), runner (`run-ci-gates.mjs:53-54` spawnea con `cwd: packageRoot`,
así que los 71 paths del manifiesto son package-root-relativos y mover el
manifiesto no cambia su semántica), ci.yml (solo el comentario de la línea 165
y el filtro `^packages/core/`, como afirma F8), aritmética de lotes fusionados
(B=11, C=18, E=42: cuadra con la tabla), y el addendum (sus 6 ítems existen
tal cual; el ítem 1, `package.json:65` de raíz, verificado).

---

## Respuestas a las 5 preguntas

**1. ¿Alguna asignación de familia incorrecta o forzada?** No encontré ninguna
que amerite reasignación. Las familias pobladas calcan las descripciones de
§2.9 (verifiqué fila por fila contra las líneas 1002-1029; p.ej.
`audit-vertical-compliance` → `structure/` es literal de §2.9:1005 «vertical
compliance»). Leí los tres casos más dudosos: `canvas-sink-census` (manifiesto
sellado de sinks que alimenta cra-15: coherente en `evidence/`),
`red-inventory-gate` (sella rojos de checkpoint para certificar corridas:
defendible en `ci/`, A7 bien adjudicado) y `css-source-integrity-gate` (su
corpus es TODO `src/`, no solo el motor — A6 sigue siendo la adjudicación más
floja, como el propio mapeo admite, pero `engine/` es defendible por materia).
Las adjudicaciones A3-A9 y A12-A15 son razonables tal como se aprobaron.

**2. ¿Referenciantes fuera del censo?** Sí — es el defecto central del mapeo:
H2 (seis-plus sitios en `packages/core/src/tooling/` + uno en
`src/infrastructure/`), H3 (tres repos hermanos), H4 (`dependency-honesty` de
raíz, corrido por CI), y H5/H8 como casos donde el censo sabía pero las reglas
de ejecución no lo operacionalizan. El patrón: el censo enumeró `scripts/`,
`package.json`, docs y los 4 casos del addendum, y nada más. En `showroom/e2e`
no encontré nada fuera del addendum (está completo ahí); en `.github/` tampoco.

**3. ¿El orden fusionado A-I rompe algún cluster?** No, ningún import queda
roto ENTRE commits si cada lote reapunta a la ubicación vigente del objetivo
(el brief ya lo manda: «calculá SIEMPRE desde la ubicación destino»). La
fusión E=packaging+evidence es correcta y necesaria por C2 (verificado). El
costo real del orden son los dobles retoques diferidos — C1 (gat-07 en E
reapunta al baseline plano, H lo vuelve a tocar), C9 (G→H), C12 (E→I), C6
(B,E→I), C7 (C,E→I) — que son sanos, PERO cuya segunda pata solo la protege el
grep residual, que hoy es ciego a esos imports (H6). El orden está bien; la
red que lo sostiene, no.

**4. ¿Agujeros en las reglas de ejecución?** Cuatro: el Lote 0 eliminado (H1,
el más grave), F8 sin dueño operativo en la regla transversal (H4/H5), la
verificación corrida desde `packages/core/` que no ve raíz ni repos hermanos
(H5, H3), y la ceguera del grep residual + gates sin test jamás ejecutados
(H6). Lo que el brief SÍ cubre bien: la profundidad del helper repo-root
(ambas fórmulas del brief:67-70 son correctas — las verifiqué contra el árbol),
los drills sintéticos (regla explícita con precedente, brief:99-102), el
manifiesto último-de-cada-lote con `gates:ci:list`, y el fixup C8 (existe
exactamente un import que arreglar, y la profundidad `../../lib/...` se
mantiene válida en el destino nuevo).

**5. ¿Algo contradice la ley o la hace incumplible?** Nada la hace
incumplible; cuatro decisiones contradicen su letra actual y viven de
enmiendas prometidas (H10). Mi opinión sobre las dos consultadas:
**A17 (a) permanente: de acuerdo.** El fondo de §1.2:88-89 es «dentro de la
carpeta del gate», y el basename completo lo cumple; el nombre corto es solo
el ejemplo entre paréntesis. Renombrar baselines toca paths que gates sellan
por hash y que hay pins externos contando por nombre — costo real, ganancia
cosmética. Pero entonces hay que enmendar el ejemplo de §1.2, no dejarlo como
letra muerta. **A11 (a): defendible con matiz.** La exención de §1.2:76-79 es
para archivos que «a tool resolves by convention»; `vitest.scripts.config.ts`
no se resuelve por convención — `package.json:664` lo apunta explícitamente
con `--config`. La excepción escrita debe nombrar ambos archivos por su nombre
(AN6 ya lo pide), no apoyarse en la cláusula de convención tal cual está.

---

## Lo que NO revisé (boundary de evidencia)

- No ejecuté ningún gate ni la suite de tests: todo lo afirmado es análisis
  estático (grep/lectura). No valido que la baseline de 44 fallas preexistentes
  siga vigente.
- No leí los 78 scripts de producción; leí completos o parciales ~10 (los
  adjudicados dudosos y los miembros de clusters) y verifiqué el resto por
  imports/paths, no por semántica.
- No audité `codemods/`, `lib/repo-root/` ni el contenido de
  `quality-evidence/` más allá de sus imports salientes (fuera de alcance por
  regla 5 del mapeo).
- No verifiqué F9 (las ~70 citas de docs) fila por fila; asumo el conteo del
  mapeo. Tampoco `docs/history/inventories/repository-map/2026-08/index.md` contra el árbol.
- De los repos hermanos revisé `package.json`, `scripts/` y `.github/` por
  grep dirigido; no barrí sus `src/` completos ni `svc-auth`/`dm-*` (grep a
  `svc-auth/package.json`: sin matches; el resto sin revisar).
- No revisé los lotes en vuelo (raíz del repo, Fase 0-bis) más allá de
  constatar que `cra-15` y `dependency-honesty` ya apuntan a las ubicaciones
  nuevas de raíz; sus propios reportes no pasaron por mí.
- git status muestra movidas en curso de otro worker: no las audité como
  desorden, per instrucciones del brief.

## Condiciones para PROCEDER

1. Restituir el Lote 0 (H1) con el fix ampliado (recursión + resolver de
   imports + drill de huérfano plantado).
2. Emitir un F11 con los sitios de H2/H4 asignados a lote, y la decisión
   cross-repo de H3 antes del lote C.
3. Reescribir la regla 7 del brief: `pnpm test:scripts` en lugar del comando
   crudo, grep residual desde la raíz del repo y también por basename, y
   `pnpm gates:ci` completo al cierre de F, H e I.
4. Las enmiendas de ley (A10/A11/A16/A17/AN6) aterrizan en el commit del lote
   que las estrena (H10).

Con esas cuatro correcciones, el mapeo y el orden A-I son ejecutables tal como
están adjudicados.
