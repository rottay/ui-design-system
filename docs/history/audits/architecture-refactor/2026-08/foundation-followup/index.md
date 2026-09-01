# Re-auditoría Fable 3 — cierre del frente F0 (2026-08-19)

Tercera ronda de auditoría independiente (read-only) sobre el cierre de F0
("piso honesto") declarado en `docs/history/programs/architecture-refactor/2026-08/execution/index.md` §13,
commit de cierre `c81e9414e`. Rondas previas:
[`REAUDITORIA-FABLE-2026-08-19.md`](/docs/history/audits/architecture-refactor/2026-08/execution-verification/index.md) y
[`REAUDITORIA-FABLE-2-EJECUCION-2026-08-19.md`](/docs/history/audits/architecture-refactor/2026-08/execution-followup/index.md).

Método: cada afirmación del cierre se verificó con comandos propios contra el
árbol en HEAD (`c81e9414e`, worktree limpio) y contra `git log`. Los gates
nuevos se probaron con fixtures ejecutados FUERA del repo (copias del script en
un scratchpad con árboles sintéticos); ningún archivo del repo fue modificado.
El censo de gates se corrió dos veces: bajo Node 25 (el default de esta
máquina) y bajo Node 22 (el toolchain que gat-07 exige).

## Veredicto global

**El cierre de F0 es sustancialmente REAL.** Los borrados no dejaron ninguna
referencia colgante en código vivo; la enmienda de lane-control es coherente,
fail-closed y mejor que la spec; los 3 gates nuevos están cableados y dos de
ellos detectan exactamente lo que prometen; el único gate rojo restante está
excluido con razón y dueño, y la exclusión está protegida mecánicamente
(`validateManifest` rechaza `blocking: false` sin `excluded.reason` +
`excluded.owner`).

Quedan **cinco hallazgos que el cierre no vio**, ninguno de los cuales reabre
F0, pero tres merecen dueño antes de F2/F6:

| # | Hallazgo | Severidad |
|---|---|---|
| H1 | El wildcard `./dist/*.css` del `exports-artifact-gate` es **vacuo**: lo satisface cualquier `.css` en cualquier parte del paquete (src/, node_modules/), incluso con `dist/` borrado entero. Probado con fixture. | Media — es EL wildcard del que la major 3.0.0 retira `platform.css` |
| H2 | La suite de drills `tenant-reachability` de lane-control está **roja (10/13) y no cableada a ningún canal de CI** — un rojo escondido de la clase que §1.10 de ARCHITECTURE declara ilegal. Preexistente a F0 (emisores del 2026-08-18), no regresión. | Media |
| H3 | `dist/` está **STALE en el HEAD de cierre**: los últimos commits de F0.13 tocaron src después del último build verde. `distfresh:check` falla hoy; `prepack` fallaría hasta rebuild. | Baja — el criterio de cierre (gates:ci pre-build) no lo exige, pero la nota "build verde de punta a punta" ya no describe HEAD |
| H4 | Los drills de los 3 gates nuevos son débiles: solo ds-prefix tiene prueba de violación plantada (y a nivel regex); el drill de exports-artifact **acepta verde y rojo como pass** (no puede fallar); el de root-catalog solo greppea strings del propio script. Contradice la doctrina "a gate that cannot fail is not a gate" del propio archivo. | Baja-media |
| H5 | Deuda documental de F0.6/F0.12 sin cerrar: el README de quality-rubric en docs-engineering sigue citando `gate:styles-css`; `tokens-catalog.mjs:963,1105` instruye el alias muerto `tokens:catalog:check` (y lo propaga a las vistas regeneradas); ARCHITECTURE §1.11 sigue listando como "no materializados" dos gates que F0.11 materializó; §1.10 afirma que "the wiring gate counts all three channels" y ningún script hace ese conteo; el recibo R0 no quedó anotado en el changeset. | Baja (doc-rot), pero §1.10 exige corrección el mismo día |

---

## 1. ¿Algún borrado rompió algo que el plan no vio?

**Veredicto: NO en código vivo. Cero referencias colgantes ejecutables.**

Verificación por lote:

### F0.2 — codemods de febrero + auditoría + agentes (`65bb266f7`)

CONFIRMADO. `git show --shortstat` da exactamente los números de §13: **24
archivos, 5.995 líneas borradas** (23 D + 1 R100: `LITERAL-OWNERSHIP-MATRIX.json`
→ `docs/history/`, donde existe). Composición: 16 `scripts/*.mjs` +
`helper-gaps-report.json` (el "17 codemods + reporte" del acta cuenta 16
codemods + 1 reporte = 17 archivos), `audit-presets.mjs`, `audit-report.json`,
`CANARY-MANIFEST.json`, el tarball 2.0.0, 2 agentes `.claude/`.

```
git grep -nI -E 'add-accent-bars|…|audit-presets|audit-report\.json' -- ':!docs'
→ 0 hits
git grep -nI -E 'CANARY-MANIFEST|LITERAL-OWNERSHIP-MATRIX' -- ':!docs'
→ 0 hits
```

### F0.4 — 14 iconos legacy (`959028f90`)

CONFIRMADO. 14 carpetas D bajo `presentation/legacy/`; el barrel
(`presentation/legacy/index.ts`) exporta solo `AlertIcon` y solo esa carpeta
sobrevive; `icons/index.ts:31` reexporta solo `AlertIcon`. El grep repo-wide de
los 14 nombres devuelve únicamente: nombres de export del adapter Phosphor
(otra clase de asset, p.ej. `XIcon` de `@phosphor-icons/react`), el corpus
semántico (`ActionSearchIcon`), un doc histórico
(`DESIGN_SYSTEM_FINAL_REVIEW.md`) y un string de fixture en el test de gat-07.
Ninguno importa los borrados.

Nota: el changeset dice "the legacy hand-drawn icon set is removed" sin
mencionar que `AlertIcon` sobrevive hasta F8. Es defendible ("finalized at
publish time"), pero si 3.0.0 se publica antes de migrar los 2 consumidores,
la nota será falsa.

### F0.5 — monolito probe (`255a86762`)

CONFIRMADO. Solo `probe/index.mjs` + su test cayeron; la sonda raíz
conserva sus 5 módulos (`css-model`, `css-parse`, `leg1-symbolic`,
`leg2-chromium`, `value-eval`). `git grep 'probe/cascade-probe' -- ':!docs'` →
0 hits.

### F0.6 — aliases npm (`412473315`)

CONFIRMADO en sustancia: **15 aliases** retirados (el acta §13 dice 15; el plan
§2.3 decía 14 — el diff real son 15). Sobreviven los 4 prometidos:
`engine-audit:check`, `hooks:check`, `gat07:check`, `theme-parity:check`.
Ningún invocador vivo roto: los únicos hits del grep de los 15 nombres son
historia sellada (`test-artifacts/`) y **la deuda H5**:

- `packages/core/scripts/foundation/tokens-catalog.mjs:963,1105` — el propio generador
  instruye correr `tokens:catalog:check`, que ya no existe; ese texto se
  propaga a las vistas regeneradas de docs-engineering
  (`tokens/impact-map.md:10`, `tokens/governance/lifecycle-and-deprecations.md:61`).
- `docs-engineering/engineering/design-system/catalog/quality-rubric/README.md:94`
  sigue citando `gate:styles-css` y **no está modificado** en el worktree
  hermano — la tarea "actualizar en la misma sesión" de §2.3 no se ejecutó.

### F0.11 — `.npmignore` raíz (dentro de `cd06b8dee`)

CONFIRMADO. El `.npmignore` de la raíz del repo (inerte) cayó; el de
`packages/core/` existe y el comentario de `pack-inventory-gate.mjs:5` se
refiere correctamente a ese ("this package's own `.npmignore`").

### F0.3 / disco — carpetas vacías, coverage, tmp

CONFIRMADO con matiz. `find packages/core/src -type d -empty` → vacío. En el
repo entero quedan exactamente 3 dirs vacíos: el `KIMI-ANNOTATIONS/inbox`
declarado + `packages/core/coverage/.tmp` y `coverage-final/.tmp` — estos dos
**recreados vacíos a las 15:41 por una corrida de tests posterior a la
limpieza**, no residuo de la limpieza. Los conteos "23+7" no son verificables
post-hoc (borrado de disco sin commit); el estado final sí lo es y cumple.
No queda ningún `*.tgz`.

---

## 2. ¿La enmienda de lane-control es coherente?

**Veredicto: CONFIRMADO. Es coherente, fail-closed, y mejor que lo que la spec
pedía.**

- `git grep 'channel-wiring-zero-delta' -- ':!docs'` deja **un único hit**: el
  comentario de `work-order/index.mjs:68` que documenta la enmienda misma (por
  qué se retiró y por qué la regla nueva lee un registro y no un nombre).
  Ningún archivo exige el gate retirado. Los hits bajo `docs/` son historia de
  auditoría sellada; docs-engineering: 0 hits.
- Los 4 archivos prometidos fueron enmendados en `feb577197`: la ley
  (`index.mjs`), el schema (`schema.json` ahora exige "one registered as
  blocking in ci-gates.manifest.mjs"), el ejemplo (`wo-example.json` pasó a
  `engine-token-audit.mjs --check`, un gate registrado) y el drill.
- La implementación es **fail-closed en ambas direcciones**
  (`index.mjs:372-403`): registro ilegible → rechazo; registro vacío →
  rechazo; y `registeredAcceptanceGates()` solo admite gates `blocking: true`
  ("a gate the manifest has explicitly excluded from CI cannot be the thing
  that accepts a lane") — lo que impide lavar una aceptación contra el gate
  excluido channel-liveness.
- El drill enmendado agrega el caso que separa leer-el-registro de
  matchear-un-filename: un script REAL en disco pero no registrado
  (`cra-14-public-barrel-gate.mjs`) es rechazado, con un fact de setup que
  prueba que el rechazo es por el registro y no por un typo. **Corrido a mano:
  la suite work-order pasa completa.**

Dos notas menores, sin efecto:

1. El borrado del gate (`cd06b8dee`, 15:28) precedió a la enmienda
   (`feb577197`, 15:37) por ~9 minutos y en commits distintos; el plan pedía
   "en el mismo lote". Ventana transitoria dentro del mismo frente, inmaterial.
2. Los drills de lane-control (incluido el enmendado) **no están cableados a
   ningún canal de CI** — solo corren a mano (ver H2). El drill que protege la
   enmienda protege solo cuando alguien lo invoca.

---

## 3. Los 3 gates nuevos: ¿detectan de verdad?

Probados con fixtures sintéticos fuera del repo (copia del script + árbol
mínimo), más lectura del código. Los tres están cableados donde el acta dice:
`ds-prefix` y `root-catalog-freshness` + `f0-honesty-gates-drill` como
blocking en el manifiesto (78 entradas); `exports:artifact:check` en
`postbuild` y `prepack` — canal lifecycle declarado legítimo por ARCHITECTURE
§1.10, correcto que NO esté en el manifiesto pre-build.

### 3.1 `ds-underscore-prefix-gate` — CONFIRMADO

```
fixture: src/skin/button.css con `var(--ds_experimental-red)` → FAIL exit 1,
         archivo:línea reportados
fixture: `--_ds-private-swatch` y `--_ds_weird` → OK exit 0
```

Un `--ds_` en cualquier skin bajo `src/` o en `styles/` hace fallar el gate.
Alcance real (para conocerlo, no como defecto): solo archivos `.css` bajo
`src/` y `styles/` — los artefactos compilados commiteados bajo
`facade/artifacts/` SÍ entran (son .css bajo src); nombres emitidos solo en
runtime desde TS no. El namespace privado `--_ds-*` (introducido por
`dbe76d2a8` para el swatch del tree-map) es deliberadamente invisible al gate:
hoy NADA gobierna ese prefijo — decisión implícita del lote que convendría
declarar por escrito antes de que prolifere.

### 3.2 `exports-artifact-gate` — PARCIAL (H1)

```
fixture: export "./a": "./dist/a.js" sin dist/ → FAIL, target reportado ✓
fixture: export "./dist/*.css" sin dist/ pero con src/anything.css → el
         wildcard NO se reporta (falso pass) ✗
fixture: sin ningún .css en el paquete → recién ahí falla el wildcard
```

Los 325 targets exactos se verifican de verdad. Pero para un wildcard cuyo
prefijo termina en `/`, `dirname(prefix)` sube un nivel de más: para
`./dist/*.css` el directorio de búsqueda es **la raíz del paquete entera**
(node_modules incluido, el walk no excluye nada) y el matcheo es solo por
sufijo. Consecuencia: si el build dejara de emitir TODO css a `dist/`, o si
`dist/` no existiera, el gate seguiría verde por cualquier `.css` de `src/`.
Es exactamente el wildcard del que 3.0.0 retira `dist/platform.css` — la
desaparición silenciosa de un css de dist es el caso que este gate debería
atrapar y hoy no atrapa. Los otros 3 wildcards (roles de iconos) buscan desde
`generated/`, aceptable. **Fix de una línea** (no aplicado por regla dura de
esta auditoría): tratar el prefijo con barra final como el directorio mismo y
exigir que el match esté bajo el prefijo.

### 3.3 `root-catalog-freshness-gate` — CONFIRMADO

```
fixture: raíz `existe` sin declaración en src → FAIL "catalog says 'existe'
         but --ds-fake-head has no declaration in src/" ✓
fixture: raíz `por-crear` que ganó declaración → FAIL "update the catalog" ✓
fixture: canal declarado en src SIN fila en el catálogo → OK (invisible)
```

Las dos direcciones que el catálogo declara se verifican de verdad, con la
exclusión correcta de `facade/artifacts/` (la corrección `ed0bbf6c4` está bien
fundada: un canal nacido en artefacto generado es la clase `solo-artefacto`,
no una declaración autorada). El gate es **unidireccional por diseño**: una
raíz nueva sin fila no puede detectarse mecánicamente (qué es "raíz" es
curaduría). Aceptable; anotado para que nadie lo lea como cobertura total.

### 3.4 Los drills (`f0-honesty-gates.test.mjs`) — H4

Los 6 tests pasan, pero como red de seguridad son desiguales: (1) ds-prefix
green-path real ✓; (2) ds-prefix violación plantada — solo contra el REGEX
extraído por `eval`, no contra el gate end-to-end; (3) exports-artifact —
"assert the current state coherently either way": **pasa tanto en verde como
en rojo**, es un drill que no puede fallar; (4) exports-artifact — asserta que
el fuente contiene el string `collectTargets`; (5) root-catalog green-path
real ✓ (pinnea "63 roots agree"); (6) root-catalog detección — asserta que el
fuente contiene los strings de los mensajes de fallo. Un gate cuyos branches
de fallo fueran código muerto pasaría los drills 3, 4 y 6 igual. Mis fixtures
de arriba son la prueba ejecutable que a esos drills les falta.

---

## 4. ¿Queda algún gate rojo y con qué adjudicación?

**Veredicto: el manifiesto está limpio y la exclusión única está bien
adjudicada; hay un rojo escondido FUERA del manifiesto (H2) y dos rojos
ambientales/post-build que conviene conocer (gat-07 bajo Node ≠ 22; distfresh
por dist stale, H3).**

- Manifiesto: **78 entradas, 77 blocking, 1 excluded** — exactamente
  `channel-liveness`, con `excluded.reason` (deuda real de canal adjudicada a
  F2) y `excluded.owner` ("F2 cascade front (roadmap §5)"), drill del
  clasificador aún blocking. La adjudicación coincide con §2.9 del roadmap
  (los 4 de deuda real de canal se eximen por escrito o van a su frente).
- La forma "excluded con razón y dueño" no depende de disciplina:
  `validateManifest` (manifest.mjs:428) rechaza cualquier `blocking: false`
  sin reason+owner y cualquier blocking con `--optional`. Anti-lavado
  mecánico, verificado en código.
- Censo bajo **Node 25**: muere en `gat-07-exact-proof` — pero es el gate
  haciendo su trabajo ("runtime Node major 25 != CI Node major 22"; el
  toolchain está pinneado). No es un rojo del árbol; es la razón por la que la
  nota de §13 F0.10 dice "Node 22 ya verificado". Quien audite este repo debe
  correr el censo bajo Node 22.
- Censo bajo **Node 22** (reproducido por esta auditoría, corrida completa
  propia): **`ci-gates OK — 77 blocking gate(s) passed`**, con el único SKIP
  siendo `channel-liveness` y su registro de exclusión impreso (razón + owner
  "F2 cascade front (roadmap §5)"). gat-07, cra-17-integral y los 3 gates de
  F0.11 (`ds-prefix` 406ms, `root-catalog-freshness` 168ms,
  `f0-honesty-gates-drill` 638ms) están entre los 77 verdes. El criterio de
  cierre de §2 se reproduce tal como el acta lo declara.
- Barrido de huérfanos: todo `scripts/*gate*.mjs` de producción está cableado
  (manifiesto, package.json o ci.yml); los `.test.mjs` no listados los alcanza
  el glob de `test:scripts`. El único runner huérfano del repo es
  `src/tooling/lane-control/integration/tests/drills/index.mjs` (H2): ningún
  canal lo invoca (el glob de `test:scripts` no llega a `src/`, el vitest de
  scripts solo incluye `scripts/**/*.vitest.test.ts`) y su suite
  tenant-reachability está roja 10/13 — 3 emisores interpolados sin enumerador
  (`setLegacyButtonHoverBgAlias → --ds-button-${prefix}-hover-bg`,
  `brandThemeToCssVariables → --ds-chart-series-${index+1}` y
  `--ds-chart-category-${index+1}`), con lo que el checker se niega a reportar
  número (E0 fail-closed). Preexistente: el emisor data del checkpoint
  2026-08-18 y ni el censo (`tenant-reach-census.mjs`) ni el drill cambiaron
  en F0. No es regresión de F0, pero es exactamente la clase de rojo invisible
  que el "piso honesto" vino a matar: o se cablea (y se adjudica su rojo con
  la misma ley de exclusión) o, por §1.10, "it does not exist".

---

## 5. ¿El estado §13 coincide con git log?

**Veredicto: PARCIAL. Los 11 lotes con commit citado coinciden hash por hash y
contenido por contenido; el cuadro tiene dos filas desactualizadas que
contradicen su propio encabezado, y una afirmación de F0.12 que el código no
respalda.**

| Lote | Acta §13 | git log | Adjudicación |
|---|---|---|---|
| F0.1 | ✅ `de9e71c3f` | ✓ existe; `.changeset/major-canonical-tree.md`; `changeset status` reporta major para `@rottay/design-system` | CONFIRMADO. Falta el recibo R0 anotado en el changeset que pedía §2.3 (H5) |
| F0.2 | ✅ `65bb266f7` "24 archivos, 5.995 líneas" | ✓ `--shortstat`: 24 files, 5995 deletions | CONFIRMADO exacto |
| F0.3 | ✅ disco | estado final verificado (§1 de este reporte) | CONFIRMADO con matiz coverage/.tmp |
| F0.4 | ✅ `959028f90` | ✓ 14 D + barrels + packinv re-seed | CONFIRMADO |
| F0.5 | ✅ `255a86762` | ✓ monolito + test; sonda raíz intacta | CONFIRMADO |
| F0.6 | ✅ `412473315` "15 fuera" | ✓ 15 aliases en el diff | CONFIRMADO (deuda doc H5) |
| F0.7 | ✅ `feb577197` | ✓ enmienda 4 archivos + drill registry | CONFIRMADO |
| F0.8 | ✅ `feb577197` | ✓ `cra-17-integral` blocking `--structural`, con la adjudicación estructural-vs-final bien razonada en el comentario del manifiesto | CONFIRMADO |
| F0.9 | ✅ `dc8082f8a` | ✓ NUL: 0 bytes crudos, 1 escape `\0` en `lib/daisy-class-consumer-counter.mjs`; alias `quality-evidence:v2:seal` existe | CONFIRMADO |
| F0.10 | **⏳ sin commit** | ✗ los commits EXISTEN: `e842ffbce` (resello mayor post-borrados) y `0e1ce4d75` (re-sello final, "ultimo paso de F0") | **Fila desactualizada** — el trabajo se hizo; el acta no lo registra |
| F0.11 | ✅ `cd06b8dee` + `e7ea7c795` | ✓ 3 gates + drills + wiring; `28f2a52d0` los cablea al manifiesto | CONFIRMADO (calidad de drills: H4) |
| F0.12 | ✅ `675d2e3b3` | ✓ ARCHITECTURE §1.10 declara los 3 canales legítimos | PARCIAL: la frase "el wiring gate los cuenta" (y §1.10: "the wiring gate counts all three") **no la implementa ningún script** — `workflow-script-wiring-gate.mjs` solo resuelve `pnpm run` de workflows; nada enumera los 3 canales ni detecta un gate no cableado (H5) |
| F0.13 | **⏳ en curso** | ✗ los 12+ commits de adjudicación existen (`ae1a829e9`…`dbe76d2a8`) y el censo definitivo ya corrió (el encabezado mismo lo declara cerrado) | **Fila desactualizada** — contradice el encabezado "F0 — CERRADO" del mismo §13 |

Spot-checks de las adjudicaciones de F0.13 (muestreo):

- APCA dark-900 (`3a6aac8a6`): baseline `a11y.apcaPairings: 0 → 1` con la
  deuda y su retorno a 0 declarados en el mensaje (los temas oscuros se
  reescriben en F4). Deuda declarada, no lavada. ✓
- Canales muertos (`30b81cb34`): cada fila re-sembrada lleva `reason` textual
  ("accepted debt pending a skin/component consumer or a contract removal";
  la variante modern explicita "never a silent delete"). ✓
- Engine-freeze (`a98bff693`): 8 byte-states re-autorizados en el baseline con
  atribución al trabajo sancionado. ✓
- Presupuestos de bytes (`30adbea00`): 2 subpaths re-anclados con la nota de
  que ambos mueren en F6, consistente con el acta. ✓

Sobre las afirmaciones sueltas del acta:

- "Build de core verde de punta a punta": fue cierto cuando se corrió (stamp
  presente en `dist/build-stamp.json`), pero en HEAD `distfresh:check` FALLA
  (source `e5013e28…` vs stamp `e21f026a…`): los commits finales de F0.13
  (p.ej. `dbe76d2a8`, que toca src de charts y skin) quedaron sin rebuild.
  `exports-artifact` pasa hoy contra ese dist viejo. H3: PARCIAL.
- "78 gates blocking en el manifiesto" (línea de estado `f57431be2`): son 78
  **entradas**, 77 blocking. El commit de cierre `c81e9414e` ya lo dice bien
  ("77 blocking, 1 excluded").

---

## Recomendaciones (no bloqueantes del cierre)

1. **H1**: corregir `wildcardSatisfied` antes de F6 (donde los presupuestos de
   subpaths mueren y este gate queda como única línea sobre `dist/*.css`):
   anclar la búsqueda al prefijo real del patrón y excluir `node_modules`.
2. **H2**: cablear `lane-control/integration/tests/drills/index.mjs` a un
   canal (manifiesto o `test:scripts`) y adjudicar el rojo de
   tenant-reachability con la misma ley (fix de los 3 enumeradores faltantes,
   o exclusión con razón y dueño hacia F2).
3. **H3**: rebuild + re-check de `distfresh`/`exports-artifact` como primer
   paso del próximo frente que toque dist o empaquete.
4. **H4**: reemplazar los drills 3 y 6 por violaciones plantadas ejecutables
   (los fixtures de §3 de este reporte son el patrón: árbol sintético fuera
   del repo, escenario rojo real).
5. **H5**: barrer la deuda doc en una pasada: `tokens-catalog.mjs` (prosa del
   generador) + regenerar vistas, quality-rubric README (docs-engineering),
   ARCHITECTURE §1.11 (dos gates ya materializados) y §1.10 (o se implementa
   el conteo de canales de wiring, o se reescribe la frase), recibo R0 en el
   changeset, y actualizar las filas F0.10/F0.13 de §13.

---

*Auditor: Fable (tercera ronda). Read-only: el único archivo creado es este
reporte. Fixtures y corridas: scratchpad de sesión, fuera del árbol del repo.*
