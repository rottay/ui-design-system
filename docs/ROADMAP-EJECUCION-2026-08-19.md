# Roadmap de ejecución — 2026-08-19 (v3, post doble re-auditoría)

Plan final consolidado tras las dos re-auditorías independientes de Fable:
[`REAUDITORIA-FABLE-2026-08-19.md`](REAUDITORIA-FABLE-2026-08-19.md) (el
diagnóstico) y [`REAUDITORIA-FABLE-2-EJECUCION-2026-08-19.md`](REAUDITORIA-FABLE-2-EJECUCION-2026-08-19.md)
(la ejecución, con 5 asientos paralelos). La ley objetivo es
[`ARCHITECTURE.md`](ARCHITECTURE.md). Toda cifra aquí fue medida al menos dos
veces por asientos distintos.

**Veredicto de la segunda ronda:** el plan es ejecutable en su columna
vertebral; los errores eran "de presupuesto, de denominador y de terreno no
relevado — no de dirección". Esta versión integra el terreno.

---

## 0. Hechos del terreno que ningún documento registraba (medidos por Fable, verificados)

1. **`gat-07-exact-proof` está ROJO en HEAD hoy.** El sello (2026-07-18) lista
   123 archivos de maquinaria; el walk actual encuentra 626 trackeados + 5
   fantasmas. El criterio "gates:ci verde" parte de un piso rojo, y cada
   borrado mueve el artefacto → el resello (`gat07:write`) es una tarea propia,
   secuenciada DESPUÉS de los borrados de cada lote.
2. **Existe 2.19.37 publicado desde un commit colgante** (`a037d3a3c`, fuera de
   toda rama) y app-bithire lo clava e instala. Un bump patch/minor desde
   2.19.36 colisiona. Hay que reconciliar la versión antes de cualquier publish.
3. **app-evnto consume la FUENTE LOCAL viva** por symlink manual en
   `node_modules` (ignora su pin 2.19.29). El publish no es su punto de
   coordinación: cualquier retiro en fuente la rompe al instante. Regularizar
   ANTES de F5/F6 (link declarado o pin honesto — decisión del dueño).
4. **La migración de los 53 archivos `/commercial` de app-platform no tiene
   dueño en ningún roadmap.** La reclasificación ya ocurrió (2026-08-12) con
   destino incompleto: `ProductWindow` se fue al showroom (inalcanzable para
   apps) y ~14 tokens `--ds-commercial-*` fueron renombrados a `--ds-color-*` —
   fallo CSS silencioso que un codemod de especificador no cubre. Se crea el
   lote con dueño en F8 (ver §7).
5. **El PAT de GitHub en `.claude/settings.local.json` ya está en la historia
   de git.** Destrackear no basta: **rotación obligatoria incondicional**
   (acción del dueño, fuera del repo).

## 1. Regla de coordinación de releases (v3)

Todo retiro de API pública viaja en **una major (3.0.0)** con changeset y
codemods; ninguna app sube sin correrlos antes. El canal registry cierra bien
(pins exactos + registry privado + prepack gates). Ventanas residuales y su
cierre:

| Ventana | Cierre |
|---|---|
| evnto symlinkeada a fuente local | Regularizar el symlink ANTES de F5 (F0 lo declara; dueño decide cómo) |
| app-platform `USE_LOCAL_DS` + rebuild de dist | La migración /commercial (F8) precede a cualquier rebuild publicado; el modo local hoy está apagado |
| Publish accidental de patch | Changeset major en F0 + candado de CI extendido a pushes directos (hoy solo cubre PRs) |
| Colisión con 2.19.37 | Reconciliación de versión en F0 (merge del commit colgante o supersede explícito a 3.0.0) |
| `pnpm install` en evnto revierte el symlink | Misma regularización de la ventana 1 |

---

## 2. F0 — Piso honesto + gobernanza de versión

**Precondición:** worktree limpio (ya cumplida: commits `3f1eaad94` +
`763417966`).

1. **Versión:** reconciliar 2.19.37 (commit colgante) y crear el changeset
   **major** que declara lo ya retirado en fuente: `-./commercial`,
   `-./commercial.css`, `-./styles/platform`, los ~14 tokens
   `--ds-commercial-*` renombrados, la desaparición de `dist/platform.css` del
   wildcard `./dist/*.css`, y que `ProductWindow` no tiene sucesor en el
   paquete (pendiente decisión §8.3).
2. **Resello de gat-07** (`gat07:write` + commit) DESPUÉS de los borrados de
   este frente — el piso hoy está rojo y cada borrado lo vuelve a mover.
3. **Borrados de riesgo cero confirmado** (verificados 2-3 veces): 23 carpetas
   vacías de src (+8 del repo, con exclusión estándar son 31 — NO barrer
   `KIMI-ANNOTATIONS/inbox`: tiene propósito declarado en contrato vivo
   `tenant-art-direction.json:363`; documentar su recreación o dejarla); 17
   archivos de codemods de febrero; **13 iconos legacy + `LoaderIcon`** (0
   consumidores — cae ya; `AlertIcon` espera: app-platform readiness +
   showroom probe r2) con el recorte del barrel en el mismo commit; monolito
   `probe/cascade-probe.mjs` + test; 2 agentes `.claude/`; `audit-presets.mjs`
   + `audit-report.json`; `CANARY-MANIFEST.json` +
   `LITERAL-OWNERSHIP-MATRIX.json` (0 referencias; el segundo a docs/history/);
   14 alias duplicados (quedan `engine-audit:check`, `hooks:check`,
   `gat07:check`; actualizar en la misma sesión los 3 docs de docs-engineering
   que citan `tokens:catalog:check`, el README de quality-rubric que cita
   `gate:styles-css`, y anotar el recibo R0 en el changeset).
4. **Los 2 gates sin invocador — adjudicación corregida (no eran riesgo cero):**
   - `channel-wiring-zero-delta-gate.mjs` → **SE RETIRA con enmienda escrita**:
     la ley de lane-control lo declara verificación obligatoria de todo WO
     (`work-order/index.mjs:60,305` + drill + `wo-example.json` + README). La
     enmienda de esos 4 archivos va en el mismo lote. Razón de fondo: su
     doctrina (fallback = literal original byte-idéntico) **contradice la de
     F2** (fallback = `var(raíz)`); el choque queda adjudicado por escrito aquí.
   - `cra-17-integral-gate.mjs` → **SE CABLEA al manifiesto** (no se borra): es
     el instrumento de aceptación nombrado de WO-CRA-17, que sigue `todo`.
5. **Gates nuevos:** `--ds_` (canon de prefijos); exports→artefacto
   **post-build** (junto a `distfresh:check`/`packinv:check`; se declara por
   escrito que los canales lifecycle `prebuild`/`prepack`/`postbuild` son
   cableado legítimo junto al manifiesto); frescura de `root-catalog.json`
   (hoy no lo lee NADIE, ni siquiera un `--check`).
6. **Doc-rot del mismo día:** comentario obsoleto en `ci-gates.manifest.mjs:42-55`;
   byte NUL en `daisy-class-consumer-counter.mjs` — **es funcional** (separador
   de clave compuesta): convertir al escape `\0`, nunca eliminar; alias npm
   `:v2:seal` para `seal-round`; comentario en `pack-inventory-gate.mjs:4,61`.
7. **Regularización del symlink de evnto** (declaración; la acción es app-side).
8. **Limpieza de disco:** `coverage*/`, `showroom/.tmp/`, tarballs viejos.
9. **F0.13 — Adjudicación de los gates rojos restantes.** `gates:ci` es
   fail-fast y hoy muere antes de gat-07 (`channel-liveness-drill`: 6 canales
   `--ds-elevation-{0..5}` sin fila en `SEMANTIC_OWNER_RULES`). Quedan ~20
   gates rojos (handoff): 8 artefactos stale, 4 deuda real de canal (material
   de F2/F3 — esos se eximen por escrito o se mueven a su frente), 3 de forma.
   Cada rojo se adjudica: se arregla la ley, se regenera el artefacto, o se
   mueve el gate al frente que le corresponde con nota. Sin esto, el criterio
   de cierre es inalcanzable.

**Criterio de cierre:** `gates:ci` verde DESPUÉS del resello; `find src -type d
-empty` vacío (menos el inbox declarado); changeset major commiteado.

## 3. F0.5 — La ley `folder/index` en todo el repo

Correcciones de la segunda ronda integradas:

- **Fase 0 (helper de raíz):** dos predicados no ambiguos — `repoRoot` (findUp a
  `pnpm-workspace.yaml`) y `packageRoot` (findUp a `package.json` con
  `name: @rottay/design-system`) — porque ambos package.json comparten nombre y
  los consumidores necesitan las dos semánticas. Los 11 archivos fuera de
  `packages/core` (7 root scripts + 4 showroom) reciben el helper en su propio
  árbol o resolución propia: prohibido importar cruzado entre paquetes. El
  helper NO cubre los **536 imports relativos entre scripts** — ese es el coste
  real de Fase 1, contado ahora.
- **Fase 1 (movidas por familia):** los drills de lane-control sobreviven
  (aserciones por basename/glob). Ojo: la regex de changed-files de
  `ci.yml:55` nombra los scripts de raíz por ruta plana — tras agruparlos no
  falla, **deja de disparar jobs en silencio**: se actualiza en el lote.
  El re-sello de GAT-07 es **por-lote desde esta fase** (sella src, scripts,
  ci.yml y los dos package.json), no un paso de Fase 2.
- **Fase 2 (rename a index):** arreglar los drills que aserten sufijos, re-
  sellar, regenerar los **293** headers de procedencia de iconos.
- **Graduación del manifest (lote atómico):** censo correcto: **38
  referenciantes** (20 externos + 18 internos, contando los 9 joins de
  program-check invisibles al grep literal). `families/` se mueve intacto.
  Cirugía de `..` (generator 7→3; fanout/checklist/parity 5→1). Notas:
  (a) `generator.mjs` importa `customization-surface-census.mjs` (plano, lo
  muda Fase 1) y `v2/contracts.mjs` — **la graduación y Fase 1 están acopladas:
  el lote que corra segundo repuntéa lo del primero**; (b) 4 celdas autoradas
  (flex/grid/space/stack) llevan la ruta vieja en `sourceBindings` — edición a
  mano, no regeneración; (c) `checkpoint.intent.json` **no tiene productor** —
  se edita a mano (la frase "regenerar el checkpoint" era inexacta); (d) el
  criterio `git grep → 0` va con scope (`:!docs :!**/test-artifacts/**`) — la
  historia sellada no se reescribe; (e) extender los drills a los 4 tests del
  manifest que quedan fuera del glob `scripts/**`.
- **Raíz del repo: 16 entradas finales** (7 dirs + 9 archivos — el "14" era mi
  error de conteo; `.npmignore` entra al árbol §2.1 o se retira, se decide).
- **Core:** los 4 JSON publicados a `contracts/` (remapear `exports`/`files`;
  `ds-supplier-honesty.mjs` viaja byte-exact a las apps — se distribuye en la
  misma versión); `KIMI-*` al directorio del programa; censos vivos a su
  capacidad productora; docs de core a `docs/` con `history/` y `runtime/`.
- **Showroom:** agrupar `scripts/`; `vercel-ignore-build.sh` es probablemente
  inerte (`vercel.json:3` define `ignoreCommand` inline con precedencia) —
  verificar en dashboard antes de presupuestar cuidado.

## 4. F1 — Vocabulario cerrado gobernado (re-scoped)

- Los 2 enums vacíos: **el vocabulario YA EXISTE** en `cascade/roots/*.json`
  (`chrome.anatomy` 14 variantes, `profiles.expressive` 34, validado blocking
  por program-check). F1 es un **lift de esa autoridad a `controls/`**, no
  autoría nueva — prohibido reinventar vocabulario divergente.
- `internalChannels`: partición exacta de las 5.100 celdas — 1.462 ya migradas,
  **444 con material fuente** en `targetBinding`, **3.194 sin ninguno**
  (autoría nueva del 62,6 % — el plan ya no lo llama "migración"). Borrar
  `targetBinding` al final toca 4.267 celdas.
- Gobernar la exposición (26 tenant-dial / 27 internal-head / 10 gap): gate que
  lea `root-catalog.json` (frescura + lectura de `exposure`).
- `program-check` gana validación de enum no vacío (hoy no existe en ningún
  lado) + celda gobernada (hoy solo a medias en `rules.mjs:633`).

## 5. F2 — La cascada existe en fuente (ratchet corregido)

- Materializar las 12 raíces `por-crear` (tienen `channel: null` — incluye
  bautizarlas; es inerte para la pintura: nadie puede leer un nombre que no
  existe).
- **Ratchet nuevo** (obra nueva; no existe contador que clasifique por nombre):
  ancla en `engine-token-audit.baseline.json`, con dos reglas de construcción:
  (a) **las raíces/rampas quedan FUERA del denominador** (297 nombres que son
  destino de fallback no cuentan como deuda — si no, recablear bien puede subir
  el contador); (b) un fallback **funcional** que alcanza raíz
  (`var(--ds-x, color-mix(… var(--ds-raíz) …))`) SÍ cuenta como cableado —
  ARCHITECTURE §1.6 lo declara. Baseline real tras esas reglas: ~2.055 nombres.
- **Dependencia inversa F2 ← F4:** las **22 raíces con asignaciones asimétricas**
  (9 con un tema en cero, ej. `tier.overlay.bg` con evnto 0) se recablean
  DESPUÉS de asignar el valor del tema (trabajo de F4) o con cero-delta
  estricto — si no, cambia la pintura de ese tema antes de la armonización. El
  recableo se secuencia raíz por raíz: primero las 41 simétricas.
- Enchufar `fanout-facts` y `mirror-parity` al manifiesto con `--check`
  (frescura; la paridad real es F4). La red visual (462 PNG, job `visual` de
  CI) cubre el recableo.

## 6. F3 — La pintura vive en las skins

- Clasificación mecánica estable (confirmada): **17 dinámicas** (resolvers de
  eje en Button/Select/Input/Badge/Avatar — mecanismo legítimo) y **209
  estáticas migrables**. Regex: `var\(--ds-[a-z0-9-]*\$\{`. El ratchet se ancla
  solo en las estáticas.
- Pasada de craft por familia contra raíces (Quiet Premium).
- ~~Cerrar deuda chart-series~~ → se mueve a F5 (depende de la absorción de
  `appearance/`, no de skins).

## 7. F4 — Los tres temas son espejos (scope honesto)

- **Diseñar el esquema de asignación de variantes** (no existe: el catálogo
  tiene conteos, no nombres/valores de variante; 37 de 63 raíces —27
  internal-head + 10 gap— no reciben variantes de ningún control). Esto es
  diseño, no solo ejecución.
- Reescritura de los 3 temas como ~263 asignaciones; aserción de paridad real
  blocking (falla hoy: 19,34 %); regeneración de `styles/*.css`; colapso de
  los ~3.275 canales derivables.
- **Gates que el lote debe satisfacer** (enumerados por Fable):
  `vertical-css-source-staleness`, `first-party-artifacts-source-staleness`,
  los 4 checks de `customization-surface-census` (¡`dead-writers` puede
  disparar), `theme-channel-parity --check` (decrease-only sobre
  declared-but-unemitted — el ratchet real del colapso), regeneración de
  `generated/mirror-parity.json` + `fanout-facts.json` en el mismo lote.

## 8. F5 — Una capacidad, un dueño (lotes completos)

- **Paso transversal por retiro** (ley CLAUDE.md: atómico): owner + entrypoint +
  **skin CSS propio** + **fila de familia del manifest** + showroom (registry,
  navigation, ruta, fixtures compartidos, probes, torture, arrays de prosa) +
  capturas (~9 PNG a borrar, ~8 a regenerar) + contract tests de lote. No hay
  roster genérico para structures/patterns — el checklist manda.
- **Chrome pairs (canónico por par, §0 de la ronda 1):** los 4 retirados tienen
  0 consumidores internos de producción, **pero apps sí**: `TableToolbar` (3
  archivos prod app-platform), `SavedViewsMenu` + `FieldFiltersPanel` (en
  `entity-table-workspace`, el corazón admin), `ColumnSettings` (re-exports en
  bithire/evnto). Codemods nuevos en F8 — ojo: `SavedViewsMenu` →
  `PatternSavedViewsBar` es **cambio de anatomía** (dropdown → barra), se trata
  como el caso Link: migración explícita, no rename silencioso.
- **record-workbench → DetailSurface:** confirmado sin gap de capacidades (las
  3 pantallas de compliance no usan related-records ni history); migración de
  modelo (props → funciones, `metadata` → `sidebar()`); el adapter vive en
  `pages/data/detail/index.tsx:59`; su import directo de rol de icono no migra.
- **`appearance/`:** el orden declarado cubre a los 2 consumidores TS; además
  hay que re-anclar **5 anclajes de tooling** (`audit-integration`,
  `chart-series-reserved-name-gate`, `ds-hook-manifest`, `v2/drills.test`,
  `lane-control/tenant-reach`) + **5 tests cross-unit**. Al absorberlo, el pin
  de chart-series vuelve a 1 (antes F3, ahora aquí).
- **Convergencias:** `mono-stat` sobre `useSmoothCounter` (ejecutable);
  `terminal-block` exige **extraer primero el sustrato de Typewriter** (hoy
  solo exporta componente); `grid-view`/`gallery-view` comparten
  `item-identity`; `command-center` borra interfaces+mappers PERO
  `StatItem`/`ActivityItem` son props de 3 pantallas de app-platform → codemod
  propio en F8; `PatternEmptyState` delega en `Empty`; `calendar-view`/
  `timeline` componen sus primitives.
- **`Callout`→`Alert` es absorción limpia** (las 2 citas son docstrings; mi
  nota de "deshacer dependencia" era un falso positivo — corregida).

## 9. F6 — Frontera pública honesta (coste completo)

- Retirar 75 subpaths granulares (los 2 con importador showroom — ambos desde
  `showroom-tenant/index.tsx` — migran primero). Gates a satisfacer:
  re-anclaje COMPLETO de `pack-inventory.baseline.json` (~6.381 paths de dist,
  no una línea), `core-structure-audit` (identidad decrease-only),
  `v2/inventory-correspondence`, `cra-14-public-barrel-gate`, `analyze-bundle`,
  y reescritura explícita de `public-entrypoints.manifest.json`. La maquinaria
  de `migrate-public-entrypoints.mjs` (condenada) puede servir de base para el
  codemod inverso — evaluar antes de borrarlo.
- Lista explícita de API en el barril raíz (15 `export *` + nombrados hoy).
- **Extirpación platform completa:** lo del plan + `residual-adjudication.json`
  (src, dato vivo), `docs/reference/tokens/README.md`, `docs/premium-styling-track/`,
  `styles/index.css:4`, y **el consumidor real: `app-platform/globals.css:14`
  importa `dist/platform.css`** — migrar a `styles/rottay` (byte-idéntico) en
  F8 antes de regenerar/publicar dist.

## 10. F7 — Higiene del repo

Sin cambios salvo: repuntear 7 scripts (no 8); evidencia `cra-16` huérfana
(decisión §11); v1 de quality-evidence fuera (el receipt R0 queda como
transcripción); plegado de `packages/core/ARCHITECTURE.md` (anexos →
`docs/runtime/`); correcciones de READMEs (263→282, platform→rottay, badge TS);
`CLAUDE.md` del monorepo padre sigue vencido (99 WOs) — fuera de este repo,
anotado.

## 11. F8 — Las apps entran al sistema

- **Precondición:** symlink de evnto regularizado (ventana 1, §1).
- **Codemods (100 % trabajo nuevo — no existen):** `Space`→`Stack` (**36**
  archivos), `ConfirmDialog`→`AlertDialog` (17), `Toggle`→`Switch` (8),
  `Link`→`TextLink` (3; fase 1: crear `TextLink` primero — no existe),
  `FloatButton` (1 archivo con 5 formas de uso), chrome pairs (4 codemods,
  uno con cambio de anatomía), `StatItem`/`ActivityItem` (3 pantallas),
  `AlertIcon` (2 sitios: platform readiness + showroom probe r2),
  `globals.css` → `styles/rottay`.
- **Lote `/commercial` (con dueño, nuevo):** migrar los 53 archivos de
  app-platform: especificadores → barril raíz + **renombre de ~14 tokens
  `--ds-commercial-*` → `--ds-color-*`** (fallo silencioso de CSS — verificación
  visual obligatoria) + decisión de `ProductWindow` (§12.3) + retiro del alias
  webpack + re-anclar `dependency-honesty.mjs` (que hoy EXIGE el alias) +
  `local-ds-boundary.test.mjs` de platform.
- **Ratchet vendor de iconos:** vive en `dependency-honesty` (modo apps, ya
  resuelve `../app-*`) + gate copiado en el CI de cada app (patrón
  `ds-supplier-honesty`). No es ejecutable desde el CI del DS.

## 12. Decisiones del dueño

**Tomadas (2026-08-19):**

1. **Versión:** supersede explícito a **3.0.0** — todos los retiros de API
   pública viajan en una major; 2.19.37 queda como dead-end del registry
   (bithire pineado sigue funcionando hasta su fase vertical).
2. **`cra-17-integral-gate`:** **se cablea al manifiesto** como gate bloqueante
   (respeta el contrato de WO-CRA-17 sin enmienda).
3. **`channel-wiring-zero-delta-gate`:** **se retira con enmienda escrita** de
   los 4 archivos de lane-control que lo exigen (su doctrina contradice F2).
4. **Canales de cableado:** **se declaran legítimos por escrito** — el
   manifiesto + lifecycle hooks (prebuild/prepack/postbuild) + ci.yml son todos
   canales válidos; el gate de wiring los cuenta todos.

**Pendientes — adoptadas las recomendaciones del DT (dueño, 2026-08-19):**

5. **Symlink de evnto:** link declarado y documentado mientras dure la
   reconstrucción; pin honesto al publicar 3.0 (se trata en F5/F8).
6. **`ProductWindow`:** se decide en la fase de app-platform al reclasificar
   commercial; hoy no bloquea nada del DS.
7. **`map-view`:** **se retira** (un placeholder sin provider no es capacidad).
8. **Evidencia `cra-16`:** **se archiva** en test-artifacts con nota de
   "productor retirado" (F7).
9. **Las 10 raíces `gap`:** **backlog aceptado**; se abren diales solo cuando
   un tema los necesite.

**Regla de alcance vigente (del dueño, 2026-08-19):** el DS primero; las apps
después, vertical por vertical. Libertad para **publicar versiones**; **push
prohibido**. Las ventanas de rotura de apps (§1) dejan de bloquear la
ejecución y pasan a ser checklist de la fase de cada vertical. El DT trabaja
autónomo; **Fable audita cada hito antes de pasar al frente siguiente**; este
roadmap se mantiene al estado real (ver §13).

---

*Fuentes: DIAGNOSTICO, DEPURACION-SCRIPTS, CONFORMIDAD-SRC, REAUDITORIA-FABLE
×2. Todo número de este roadmap fue medido al menos dos veces o queda marcado
como heredado.*

---

## 13. Estado de ejecución (vivo — se actualiza con cada lote)

**F0 — CERRADO (2026-08-19).** Criterio de cierre cumplido:
`ci-gates OK — 78 blocking gate(s) passed` (2 excluded visibles con razón y
dueño: channel-liveness y lane-control-drills, ambos esperan a F2); `find src -type d -empty` vacío salvo el inbox
declarado; changeset major commiteado. **Auditoría Fable del hito: APROBADO
("sustancialmente real", 0 bloqueantes)** — sus 5 hallazgos menores quedaron
integrados en el lote F0.14 (`14dee7dc3`): fix del wildcard de
exports-artifact, drills con violaciones plantadas reales, `wiring-coverage-gate`
nuevo (implementa la cuenta de los 3 canales de §1.10), lane-control drills
cableados como excluded visible (tenant-reachability, dueño F2), 7 scripts
adjudicados que faltaban por borrar, y la deuda doc barrida (§1.11 ya no
promete gates que ya existen, prosa de tokens-catalog, recibo R0 en el
changeset). Pendiente fuera de este repo: README de quality-rubric en
docs-engineering (cita `gate:styles-css`; su commit/push es de ese repo).

| Lote | Estado | Commit | Nota |
|---|---|---|---|
| F0.1 changeset major 3.0.0 | ✅ | `de9e71c3f` | `changeset status` valida el bump major |
| F0.2 borrados triviales repo | ✅ | `65bb266f7` | 24 archivos, 5.995 líneas; Sonnet + verificación mía |
| F0.3 carpetas vacías | ✅ | — (disco) | 23 src + 7 extra; queda solo el inbox declarado; structure:check verde |
| F0.4 iconos legacy | ✅ | `959028f90` | 14 carpetas + barrels recortados + re-seed packinv; typecheck 0 errores |
| F0.5 monolito probe | ✅ | `255a86762` | program-check CONSTITUTION_READY; 37/37 tests de la sonda raíz |
| F0.6 aliases | ✅ | `412473315` | 15 fuera; quedan 3 con invocador + `theme-parity:check` |
| F0.7 channel-wiring + enmienda lane-control | ✅ | `feb577197` | la ley de WO ahora lee el registro vivo del manifiesto (mejor que la spec) |
| F0.8 cra-17-integral al manifiesto | ✅ | `feb577197` | corre y pasa; 75 gates bloqueantes |
| F0.9 doc-rot | ✅ | `dc8082f8a` | NUL→`\0` (era funcional, verificado con aislamiento), `:v2:seal`, comentarios |
| F0.10 resello gat-07 | ✅ | `1750cdf46` | Node 22 + DOCS_ENGINEERING_ROOT; re-sello vigente al cierre de F0 |
| F0.11 gates nuevos | ✅ | `cd06b8dee` + `e7ea7c795` | 3 gates + drills 6/6 + wiring postbuild/prepack; root-catalog corregido |
| F0.12 declaración canales | ✅ | `675d2e3b3` | §1.10 ARCHITECTURE + wiring gate los cuenta |
| F0.13 gates rojos | ✅ | ver nota | adjudicados y commiteados: channel-liveness (regla `surfaces.elevation`), contract:check, hooks:check, tokens-catalog (vistas + reconciliación re-derivada), presupuestos de bytes (nota: mueren en F6), tenant-theme-fixtures (seguía mal el re-export), first-party-artifacts (regenerados tras build verde). Censo definitivo: 78 blocking + 2 excluded verdes sobre árbol estable |

**Notas de ejecución:**
- `pnpm build` de core quedó **verde de punta a punta** (prebuild 7 gates + tsc + vite + CSS + postbuild con `exports-artifact` nuevo).
- La regeneración de vistas de tokens escribe en `../docs-engineering` (repo hermano): su worktree tiene 344 cambios ajenos preexistentes — NO tocar; el commit/push de ese repo queda fuera de alcance (CI lo clona del remoto).
- El build por filtro (`pnpm --filter`) captura el paquete desempaquetado de `test-artifacts/release/2.19.29/` y falla ahí — usar `pnpm build` directo en `packages/core` hasta que F7 limpie ese árbol.
- Warnings APCA del build de artefactos (dark-mode colores 900, |Lc|=0) → material de craft para F4, no bloquean.

**Auditoría de hito:** al cerrar F0, Fable audita antes de abrir F0.5. ✅
Aprobado; hallazgos integrados en F0.14.

**F0.5 — CERRADO (2026-08-20).** La ley folder/index gobierna todo el repo:
scripts/ 100% `<familia>/<capability>/index.mjs` con el `scripts-tree-gate`
bloqueante (Paso D), manifest graduado a `packages/core/manifest/`, raíces de
paquete sin artefactos sueltos, `styles/platform.css` borrado, sellos frescos
y **gates:ci 80 blocking + 2 excluded verdes** en HEAD. Auditoría Fable del
frente: **APROBADO, 0 bloqueantes**; condiciones implementadas en `652cf285e`.
Paso C (renombres) y los H1/H2 del auditor abren F1. Detalle lote por lote
abajo. Fase 0 CERRADA (`5ab118884`): helper `repo-root`
(`lib/repo-root/index.mjs`, doble predicado, 5/5 drills, `b222ff311`) y
migración de las resoluciones manuales ejecutada por terminal Opus —
147 archivos usaban idiomas de auto-ubicación, **131 migrados**
(83 producción + 48 tests), 16 no migraban (solo alcanzan vecinos).
Cubre las 3 familias (`dirname(fileURLToPath)/..`, `import.meta.dirname`,
`new URL('..', import.meta.url)`). Suite: 1621 tests, mismas 23 fallas
preexistentes (conjunto idéntico); wiring-coverage OK; escaneo residual
independiente (Python, no grep): 0. Re-sello gat-07 en el mismo commit.
Verificado por el coordinador: diffs de gates sensibles, drills 23/23,
escaneo residual propio.

**Deudas nuevas que destapó la Fase 0** (anotadas para su lote):
- ~~**Bytes NUL en fuentes**~~ ✅ CERRADA (`1f3aa3012`):
  `color-mix-argument-purity-gate.mjs` y `red-inventory-gate.mjs` ya no
  tienen bytes crudos (escape `\0`, runtime idéntico, 28/28 tests); son
  visibles a grep. Queda pendiente SOLO el gate que prohíba bytes de
  control en fuentes — nace post-Fase 1, directamente en su familia.
- **Raíz de repo y showroom**: sus scripts siguen resolviendo raíz a mano
  (no pueden importar el helper sin cruzar paquetes). Se adjudican en la
  fase de raíces de F0.5. ▶ Lote de graduación folder/index de los 4
  capabilities de `scripts/` de raíz EN CURSO (terminal f05-sonnet,
  brief `/tmp/root-scripts-brief.md`).

**Lote raíces (parcial) — `39dd2ae6f`:** los 4 `.md` históricos
(`BACKLOG`, `DESIGN_SYSTEM_FINAL_REVIEW`, `DOCUMENTATION_ENHANCEMENT`,
`WAVE_4_PRIMITIVES`) movidos a `docs/history/` (LOTE 5(a) de
QUE-SE-QUEDA ejecutado); `.claude/settings.local.json` fuera del índice
(rotación del PAT = acción del dueño). Restan de raíz: `scripts/`
(graduación en curso), `test-artifacts/` (unificación §3, con F7).
`roadmap/` queda como está: las 2 fotos datadas (`icon-supplier-decision`,
`iconography-fleet-census`) NO son historia — son evidencia viva referenciada
por `cra-17-integral-gate` (bloqueante) y `craft.md`; verificado 2026-08-19.

**Fase 1 — Paso A (mapeo) CERRADO y ADJUDICADO (2026-08-19).** La terminal
Opus produjo `/tmp/f05-fase1-mapping.md`: 225 filas (78 prod + 86 tests + 31
sidecars + 30 lib), 12 clusters (C1–C12), 17 adjudicaciones (A1–A17), 7
anomalías (AN1–AN7) y checklist de fixups (F1–F10). Decisiones del
coordinador: A1(a) mover-con-basename (renombres anti-redundancia = Paso C,
lote propio posterior); A10 `ci/f0-honesty-gates/`; A11(a) toolchain se queda
(excepción escrita en §1.2, la hace el coordinador); A13 aprobadas
`lib/verticals/` y `lib/source/` (§2.9 lo actualiza el coordinador); A17(a)
permanente por ahora; AN3 aprobado — gate `structure/scripts-structure-gate/`
como Paso D, lo escribe el coordinador; AN4 resuelto por borrado (v1, abajo);
AN5 ya cerrado (`1f3aa3012`); AN1/AN2 → Fase 0-bis (brief
`/tmp/f05-fase0bis-brief.md`, 5 archivos + 4 cadenas, cuarto idioma
`fileURLToPath(new URL('.', …))`). Addendum cross-package verificado a mano:
`/tmp/f05-fase1-addendum.md` (root package.json, showroom package.json,
import real desde `cra-15-assemble.mjs`, `new URL` en spec de whitelabel).

**Retiro de quality-evidence v1 (U2 + §3):** borrados los 7 archivos + su
gate test, entrada `quality-evidence:check` fuera de package.json, README
reescrito v2-only, v2 verificado (inventory exit=0). **Commit PENDIENTE**:
quedó entrelazado en el árbol con el lote de scripts de raíz (f05-sonnet en
vuelo); se commitea inmediatamente después de ese lote, con re-sello.

**Incidente y regla nueva (2026-08-19):** un `git commit` pelado del
coordinador barrió las movidas staged del worker (las `git mv` quedan staged
por diseño). Se deshizo con `reset --soft` sin pérdida. **Reglas duras desde
ya:** (1) UN SOLO lote que toque el corpus del sello (scripts/, src/, ci.yml,
package.json de raíz, roadmap/registry.json) en vuelo a la vez — la
verificación §13 + commiteo mío entre lote y lote; (2) los commits del
coordinador usan `git commit -o -- <paths>` explícitos mientras un worker
tenga trabajo sin commitear en el árbol.

**Cola de F0.5 (orden estricto):**
1. ~~Lote scripts de raíz~~ ✅ `4a674d81c` (+ retiro v1 `6de85d530` con sello).
2. ~~Lote 0: wiring-coverage recursivo~~ ✅ `d3c431df0` + gates:ci 78 verdes.
   Incluye guarda anti-vacío y un-salto por profundidad real (el resolver con
   `resolve()` absolutizaba y flaggeó 3 huérfanos reales al probarlo —
   fail-path ejercido en vivo; fix a `posix.normalize`). 4 drills (13/13).
3. ~~Fase 0-bis~~ ✅ `f310d7d07` (Sonnet): cuarto idioma migrado en 4 scripts
   de producción + 4 cadenas en 3 tests. **`lint-folder-index` excluido a
   propósito** (decisión del coordinador): su self-test lo copia como archivo
   único a un tmpdir pelado — la portabilidad single-file es un invariante
   testeado; excepción declarada, sus 2 sitios se recalculan a mano en el
   lote C del Paso B (callout en el brief).
4. Paso B lotes A–I (Opus, brief `/tmp/f05-pasoB-brief.md` YA corregido con
   la auditoría de Fable): A i18n · B builders+generators+taxonomy ·
   C structure+verticals (SIN audit-vertical-compliance) · D boundaries ·
   E packaging+evidence (C2 atómico) · F ci · G tokens · H engine · I lib.

**Paso B — ritmo de verificación por lote (regla operativa, 2026-08-19):**
`gates:ci` completo NO corre por lote — corre al cierre de los lotes F, H, I y
al final del frente (mínimo de Fable), con el worker EN PAUSA entre lotes (una
corrida concurrente con el lote siguiente lee el árbol a medio mover: falso
rojo garantizado en gat-07 — verificado empíricamente dos veces). En los lotes
intermedios alcanza: batería del worker (3 piernas de suite + gates:ci:list +
wiring + gat07:check + greps) + mi verificación (expectativa exacta + gate del
lote corrido a mano) + re-sello mío al commitear. **Lote A ✅ `7346f6028`**
(calibración del patrón: 3 archivos, 23/23 estables idénticas, wiring 78 OK,
delta de sello = exactamente las 3 rutas del lote). **Lote B ✅ `9b1eeb16a`**
(9 de 11: builders/+generators/+taxonomy/; parada estructural correcta en
`generate-semantic-icons` — estampa su ruta en 293 generados byte-comparados;
va en lote B2 propio). Reglas nuevas que salieron del lote B: (1) puntero vivo
en fuente publicada = instrucción de ejecución → se actualiza (canónica desde
el caso `charts/index.ts`); (2) generadores que estampan su propia ruta:
constante se actualiza en el lote, el artefacto se regenera en lote propio al
cierre (TAXONOMY.generated.md con drift medido: 94→98 primitivas, 122→133
familias); (3) `distfresh:check` ya venía rojo (dist stale desde Fase 0) —
rebuild al cierre del frente, junto con la cadena de regeneración.
**Lote B2 ✅ `0f6790dd3`** (generate-semantic-icons a generators/; 293 iconos
regenerados con diff PROBADO header-only — 293+/293−, filtro exhaustivo vacío;
icons:check verde; la roja estable del test intacta). Deja **1 rojo nuevo de
suite, declarado**: `customization-surface-gate` stale (su inputsDigest cubre
los .ts de iconos). NO es de manifiesto (gates:ci sigue 78 verdes). Se cierra
en el **lote R (mío, DESPUÉS del lote G)**: la cadena C3 entera
(census → reconciliation → preservation manifest → tokens-catalog → vistas) en
un solo acto — antes de G sería doble trabajo porque los 4 owners se mueven en
G y los artefactos estampan la ruta del generador. Inventario de flakies: 2
(channel-liveness + skin-evidence, misma familia de carreras por fixtures en
src/ — el fix tmpdir es deuda post-Paso B).

**Lote C ✅ `37dd92d52`** (15 de 17: structure/ 9 + verticals/ 6).
`lint-folder-index` migró con su excepción declarada (2 sitios a mano +
self-test replantado a la profundidad nueva, 8/8). 4 referencias funcionales
no censadas arregladas — 2 fallaban EN SILENCIO (`filter(existsSync)` traga
rutas muertas; patrón añadido a las reglas duras del brief). Re-sello
red-inventory hecho por el coordinador con las 4 identities que el worker
computó (exactas, gate verde). Enmienda de punteros APROBADA y en el brief:
archivos de corpus hasheado (`src/foundation/tokens/css/**` fuera de
`facade/artifacts/`) NO se tocan en movidas — viajan con la re-derivación del
piso. Deuda nueva: `styles/platform.css` huérfano (sello sin productor —
adjudicar al cierre del frente). **ADJUDICADO (2026-08-19, coordinador): se
BORRA al cierre del frente.** Verificado: el productor actual
(`build-vertical-css`) genera el roster `{index,modern,rottay,bithire,evnto}`
— platform ya no es vertical (contradice platform-identity-zero); ningún
script de core lo sella ni lo referencia (el `dependency-honesty` de RAÍZ sí
espera el alias `dist/platform.css`, línea ~3210: se retira en el mismo
commit del borrado); `dist/platform.css` no existe; el único
"consumidor" es un import fantasma en `app-platform/globals.css:14`
(`@import '@rottay/design-system/dist/platform.css'` — 404 hoy; deuda del
vertical app-platform, fuera de alcance F0.5); la fila de PERFORMANCE_BUDGET
muere con los presupuestos en F6. 5,3 MB de bundle zombie.
**Lote C2 ✅ `27db84b0f`** — `platform-identity-zero-gate` a `verticals/` con
la exención estrecha del propio nombre (constante + lookahead; exime un NOMBRE,
no licencia archivos), dientes probados en dos planos (drill de 6 vecinos +
mutación real revertida), test de exclusión reescrito para no pasar por vacío.
`verticals/` completa 5/5; suite 1619 (el drill nuevo), 24 = 23 estables +
deuda C3.
**Lote C3 ✅ `9a7241252`** — sello `build-vertical-css` unificado en los 5
sitios (3 archivos) + 4 bundles regenerados con diff probado de 1 línea; bonus:
2 tests del resolution-probe pasaron a verde (la regeneración refrescó dist/;
el rebuild completo sigue en el lote R).
**Lote D ✅ `1b47d9fed`** — boundaries/ completa (28/28): 9 capabilities + 3
tests-ley con carpeta propia. 2 roturas reales no censadas arregladas (spawn
por basename; raíz a mano sin helper en un test). **`hooks-manifest.json`
regenerado en el commit** (1 línea, generatedBy): diferirlo dejaba un gate
BLOQUEANTE rojo (manifest-freshness) + 3 de suite — la recomendación del
worker era correcta porque esta regeneración NO cascada, a diferencia de la
C3.
**Lote E ✅ `8ecdbbb1a`** — `packaging/` (10) + `evidence/` (7) completas,
42/42; trinidad CRA-17 atómica (import cruzado resuelto dentro del commit).
**9 roturas no censadas** arregladas por Opus (auto-chequeo del license-gate
re-anclado al directorio —segundo gate que se atrapa solo—, floor sellado de
gat-07, `await import()` de cra-12, `new URL` como raíz a mano, spawn por
basename en generate-supplier-contract). Fix del coordinador al sellar:
`BASELINE_PATH`/`AUDIT_PATH` de gat-07 apuntaban dentro del capability —
corregidas a `'../..'` transitorio **hasta el lote H** (engine-token-audit se
mueve ahí; su F11 debe re-apuntarlas). Re-sello gat-07 con Node 22: write+check
verdes, hash determinista `66000795…a71e`. Suite: 1619 tests, 25 fallas =
23 estables + deuda C3 + **1 víctima nueva DETERMINISTA** de la carrera del
drill cra-12 (`hook-contract` MANIFEST_STALE; 60/60 aislado; misma deuda de
fixtures a tmpdir — cuando se arregle el drill caen las dos). lane-control
sin crecimiento (10/13). **Observación abierta para lote I:** `cra11:check`
sale 1 («stale census») con cifras nominales y su test verde — no está en el
manifiesto CI; Opus no lo verificó contra HEAD; la constante que lo explicaría
(`lib/cra-11-adaptive-contract-census.mjs:1375`, `generatedBy`) es del lote I.

**Nota de índice (procedimiento):** 14 renombres puros del lote F (ci/) se
commitearon por adelantado dentro de `dfcae623f` — error del coordinador:
`git commit` pelado con el índice del worker cargado. Sin daño (renombres
100%, el resto del lote cierra en su propio commit). **Regla dura nueva:**
los commits de docs del coordinador se hacen SIEMPRE con pathspec
(`git commit <path> -m …`) mientras un worker esté en vuelo.

**Lote F ✅ `4953e1c21`** — ci/ completa (14/14): runner, manifiesto, wiring,
workflow-wiring, red-inventory, analyze-bundle, budgets, ratchet, f0-honesty.
4 roturas no censadas arregladas por Opus (channel-liveness leía el manifiesto
plano — un archivo del lote G roto HOY; fixtures a profundidad vieja ×2; HERE
en f0-honesty). **`gates:ci` con worker en pausa: 78 blocking VERDES** — pero
necesitó re-sellar la cadena de artefactos derivados que la migración
repo-root de Fase 0 dejó stale: customization-surface-report (solo digest) →
tokens-catalog (341 vistas + digest en la reconciliation curada) →
reads-adjudication (solo digest; sets 2607=2607) → controls-catalog →
**gat-07 siempre ÚLTIMO** (`a3e50930…`). Regla operativa nueva: los re-sellos
de frescura van antes que gat-07 en cualquier cierre. Lección de fondo: las
"23 estables" de la suite escondían gates BLOQUEANTES rojos (el positivo de
customization-surface) — suite roja ≠ ignorable; en H/I el gates:ci de cierre
puede descubrir más de estos (no quedan artefactos pineados conocidos stale:
la cadena quedó completa).

**Lote G ✅ `1e4770463`** — tokens/ completa (32/32, 15 capabilities). 7
roturas no censadas arregladas (engine-freeze importaba del lote H; 2da
edición en quality-evidence declarada; self-spawn por basename ×4). Suite
**23/23 exactas, 0 nuevas, 0 ausentes** — el sello de F absorbió la deuda C3
y la víctima de la carrera cra-12 dejó de manifestarse. Coordinador: 4 sellos
`generatedBy` actualizados + cadena re-sellada en orden (census →
reconciliation → kimi-preservation → controls → tokens-catalog → gat-07
último `b0b87c61…`).
**Lote R ✅ `1156d1fb3`** (coordinador) — rebuild dist completo (salda H3 de
la auditoría Fable de F0: dist fresco tras los toques de src de F0.10/F0.13)
+ TAXONOMY re-derivado (98 prim/133 fam). Cadena C3 + distfresh + gat-07
verdes.
**Lote H ✅ `b554bdccc`** — engine/ completa (39/39, 12 capabilities + 8
tests-ley + baseline de 6 lectores reubicado con el audit). 9 clusters no
censados arreglados (imports cruzados engine↔engine que wiring-coverage
declaró huérfanos; vitest «no tests» silencioso recuperado; libs que importan
engine/). Constantes transitorias de E re-apuntadas (comentario borrado). C1
aplicado por idioma. Opus detectó y revirtió solo un reemplazo amplio (11
archivos restaurados). Coordinador: cadena tokens + **rebuild dist** (los
productores movidos invalidaban el stamp) + gat-07 último (`565eb6e7…`).
**gates:ci: 78 blocking VERDES**. Plano en scripts/: 1 producción
(audit-vertical-compliance, lote J) + 6 tests.

**Lote I ✅ `45e46d778` — PASO B COMPLETO.** lib/ en sus 10 subfamilias §2.9
(repo-root/ intacto). cra11:check **cerrado**: ya venía stale (drift real
79→74 campos adaptativos, predata el Paso B) → deuda de cierre con
regeneración sighted. 4to caso del patrón existsSync-traga-rutas-muertas
(build-input-hash autonombrado). gates:ci **78 blocking VERDES**. Del
inventario del Paso A (222 movibles): 221 movidos — queda 1 (lote J).

**Lote G2 ✅ `d0a1e8453`** (coordinador) — los 3 artefactos de raíz de
paquete re-alojados en sus capabilities dueñas (report → census, KIMI →
kimi-preservation, reconciliation → tokens-catalog por su `generatedBy`).
Lectores re-apuntados (HERE-relativo); 3 contratos modern-rescue editados con
autorización expresa (CONSTITUTION_READY). Sello gat-07 intacto (esos
artefactos no son input). **Raíz del paquete sin artefactos sueltos.**

**Cierre de deudas del frente:** cra-11 ✅ `9f066d38c` (regen sighted
79→74: salen 6 campos de las surfaces remediadas en el Modern Rescue, entra
adaptivePacking — evolución intencional de `a9264be14`/`dcadb8474`). Drill
cra-12 → **diferido con análisis afilado**: la inyección en el árbol real es
de diseño (el gate digiere el árbol entero; una copia parcial ahoga la señal);
el fix honesto es espejo completo vía `--workspace-root` o una exclusión de
nombres `__drill__` en la re-derivación del hooks-manifest — ambos tocan
artefactos sellados, y la carrera hoy NO se manifiesta (suite 23/23). No es
bloqueante; queda para F1 con su lote propio.
**Graduación del manifest ✅ `a739b988e`** — `packages/core/manifest/`
(families/ intacto, 356 movidos). Censo fresco: 23 externos + 17 internos (5
que el censo viejo no tenía — trio cascade-*, taxonomy-parity — habrían roto
en silencio). Cirugía `..` medida; 5100 paths de index.json byte-idénticos.
Los 3 artefactos stale en HEAD (fanout-facts, mirror-parity, root-checklists)
NO se regeneraron — su regen es de **F2** (su dueño natural). Adjudicaciones:
phase-a no se reescribe (1082 citas selladas; scope `:!**/phase-a/**`); hueco
de wiring-coverage y forma capability de manifest/ (9 planos) anotados para
F1/Paso C; zombi de 12h/100% CPU eliminado. gates:ci **80 VERDES** + sello
gat-07 (`a0f35f34…`).
**F1 §4 — plan de ejecución (coordinador, 2026-08-20).** Alcance medido
contra el árbol: solo 2 enums vacíos (`chrome.anatomy`, `profiles.expressive`)
— los otros 10 dominios sin `enumValues` son kinds no-enum legítimos (scale/
bounded/profile-id/…). Lotes:
- **F1.2** — vocabulario cerrado **SIN lift** (corregido por el worker con
  evidencia, adoptado por el coordinador): el ruling escrito
  `vocabularyDomicile` (customization-model.json) ya adjudicó el domicilio —
  `calibration.catalog` con su `*Law` hermana; el `domain` se regenera entero
  y el lift se auto-cancela. La condición de disparo del ruling NO se cumple
  (el consumidor runtime sigue satisfecho sin el registro). F1.2 es entonces:
  (a) **paridad `calibration.catalog` ↔ `cascade/roots` variants** por eje,
  bloqueante en program-check; (b) ley de forma: `kind enum/closed-enum ⇒
  enumValues no vacío O calibration.catalog presente`; (c) las 3 divergencias
  de datos resueltas contra runtime: `cardComponent`→`card` (la constante
  runtime dice card), `motif` se recorta a los 4 valores runtime (none,
  micro-grid, pinstripe, contour — los otros 3 no existen en fuente),
  `density` entra al catálogo (eje de ExpressiveAxes con 3 valores).
- **F1.3** — exposure gate: lee `cascade/root-catalog.json` (frescura +
  `exposure`): 26 tenant-dial / 27 internal-head / 10 gap gobernados.
- **F1.4** — `internalChannels`: primero las 444 con `targetBinding`
  (mecánico), después las 3.194 de autoría nueva por familia/tier (diseño).
- **F1.5** — `program-check`: validación de celda gobernada (rules:633 hoy a
  medias) + cierre con auditoría Fable del frente.
**F2.3 (en dos pasos)
Estado final: **`b57b8022d`** — 87 gates verdes, suite **1683/13** (la más
honesta del programa: quedan los rojos adjudicados y nada que grite sin
querer). Re-anchor ejecutado con disciplina total (pines desde el artefacto,
dientes por mutación, guarda HISTORICOS viva con nota).
 — regen + cableo del trío stale:** los 3 artefactos de
`manifest/generated/` regenerados y enchufados blocking (87 gates). Delta por
clase revisado: fanout-facts (1 canal entra: `--_ds-chart-legend-swatch-size`;
17 con solo números de línea); root-checklists (summary byte-idéntico; 43/41
canales ganan atribución a las 2 familias que F1.4b cableó — la prueba de que
llegó); mirror-parity (**la paridad mejoró sola**: intersectionPctOfSmallest
85,8→91,9%, sameRoleTwice a 0 en ambos temas — el stale SUBESTIMABA).
Adjudicación sighted del coordinador: re-anclar los pines del control a los
valores medidos del artefacto (la suite baja de 22 a 16 honesta).
**F2.2 ✅ `2d08292a1`** — `cascade-wiring-ratchet` bloqueante (84 gates):
deuda medida por nombre = **2.171** (denominador 4.374; 768 destinos excluidos
por la regla a como está escrita; 2.203 cableados por la regla b). Falla en
las dos direcciones. Adjudicación: regla (a) como está escrita; la variante
estrecha (319 destinos → deuda 2.618) queda documentada no adoptada.
**F2.1 ✅ `0de3acab6`** — las 12 raíces bautizadas (channel: null = 0). La
declaración en CSS quedó fuera por adjudicación **B** (el worker midió que
declarar sin lector = dead writer; el ratchet lo prohíbe por ley): **la
declaración viaja con F2.4** — cada canal nace con su primer consumidor.
Doctrina: "bautizar tampoco es declarar".
**F2.1 bautismo — tabla aprobada con adjudicaciones (coordinador):** 2
ADOPCIONES (state.delta.hover → `--ds-state-hover-shift` y state.delta.disabled
→ `--ds-state-disabled-opacity` — ya existían; el catálogo buscó otros nombres)
+ 10 bautismos nuevos siguiendo las convenciones medidas. Decisiones:
control.ratio.padding = trío (`-label` 0.42 cabeza / `-value` 0.35 / `-block`
0.20 — la fuente ya razona el split); alpha.ladder = `--ds-alpha-<pp>`;
tier.accent.bg queda gap tras bautizarla (el snapshot no se mueve). Propuesta
completa en /tmp/f2-1-bautismo.md (medida contra el árbol).
**F2 — plan de ejecución (coordinador, 2026-08-20).** Lotes:
- **F2.1** — materializar las 12 raíces `por-crear` (bautismo con nombre
  derivado de la nota `derivation` de cada raíz + convenciones `--ds-state-*`/
  `interaction-wash`; inerte para la pintura). En dos pasos: tabla de nombres
  propuesta por el worker → mi aprobación → ejecución (declaración en CSS
  autorado + channelStatus flips + re-sello/rebuild de la cadena).
  `tier.accent.bg` (el gap con channel:null) entra acá.
- **F2.2** — ratchet corregido: gate nuevo anclado en token-audit baseline con
  las 2 reglas (raíces/rampas fuera del denominador; fallback funcional que
  alcanza raíz SÍ cuenta). Baseline real ~2.055.
- **F2.3** — regen + cableo del trío stale (fanout-facts, mirror-parity,
  root-checklists) con --check al manifiesto — salda la deuda de la graduación.
- **F2.4** — recableo raíz por raíz: primero las 41 simétricas con cero-delta
  estricto; las 22 asimétricas esperan a F4 (o cero-delta estricto). La red
  visual (462 PNG) cubre. Pendientes heredados: cra-15 browser evidence (vía
  showroom), 2 sockets huérfanos del chrome chart.
**Auditoría Fable de F1: APROBADO, 0 bloqueantes** (11 mutaciones con
restauración byte-exacta; todos los números duros recomputados). Las 7
correcciones aplicadas en `03ef51b54` (ADMISSION universal 10 raíces/74
variantes, cascade/ al digest, status cerrado, spawn del runner + 2 rojos
re-adjudicados, FORMA dura, piso fail-closed, prosa). **F1 — CERRADO
(2026-08-20).** gates:ci 82+2 verdes en HEAD. Baseline de suite: **1674/22**
(bajó de 24: los 2 rojos escondidos del runner quedaron re-adjudicados).
Anotado para F2: raíces con dominio no enumerado quedan fuera de ADMISSION
con nota (si una pasa a enum, entra sola); los 7 rojos estables sin forma
sellada siguen comparándose por nombre.
**F1.5 ✅ `0f7aeadae`** — celda gobernada bloqueante en program-check
(6 drills, 7 mutaciones, 2 sobre el árbol real; piso anti-vacuo leído del
denominador del índice). Cierra la brecha de rules:633 desde afuera. Con esto
**F1 queda completo de ejecutor** — resta la auditoría Fable del frente.
**F1.4c ✅ (adjudicación del coordinador, medida):** las 5.100 celdas
quedaron 100% gobernadas — 1.472 con filas + 3.628 con ley escrita, **0
peladas**. `targetBinding` **NO se borra** (corrección al §4: el plan decía
"borrar al final"; medido el árbol, es el portador de la ley por celda —
status + prescripciones son adjudicaciones, no andamio). Los 629
uncoveredByDesign son adjudicaciones escritas con puntero a fase 3 — quedan
como están, visibles.
**F1.4b structure+final ✅ `a43ad6550` + `c45e96d69` — F1.4b COMPLETO:**
10 celdas migradas con fila (6 piloto + 4 pattern) + **354 marcas** unificadas
(marca = celda adjudicada). El trabajo real fue ~2% de las candidatas; el
resto eran adjudicaciones escritas esperando lectura (FAM-CHART3, Grupo A,
dedup Grupo B, FAM-20). Adjudicación nueva del coordinador: `semanticOwner` =
el control que la evidencia declara `ownedBy` (en el caso coincidente, el de
la celda) — la ley de cardinalidad lo exigió en primitive. Anotado para F2/
fase 3: `--_ds-page-rule-style` y `--_ds-page-panel-radius` tienen 4+2 familias
consumidoras declaradas y 0 declarantes en CSS; y 7 celdas de structure/record
citan el canal público donde el dueño declara el privado (evidencia con nombre
equivocado, sin veredicto cambiado).
**F1.4b-chart ✅ (sin cambios — `0` filas, verificado contra el árbol).** La
clase ya estaba resuelta por dos adjudicaciones escritas: FAM-CHART3 (54
celdas, premisa "cero lecturas" re-medida y cierta) y Grupo A (36,
chart-foundation.css sin dueño deliberado). Se resta del plan: quedan ~354 en
4 clases. Adjudicaciones del coordinador: (a) `channelId` = **el socket** (el
piloto manda; mi nota anterior era un residuo); (b) la marca
`migratedToInternalChannels` pasa a significar "celda adjudicada" — se unifica
en el lote structure; (c) 2 sockets huérfanos del chrome chart
(legend-tracking, legend-text-transform: leídos, nunca declarados) anotados
para F2/fase 3.
**F1.4 — descomposición medida (coordinador, contra el árbol):** las 5.100
celdas = 1.462 migradas + 449 MUST_REACH (444 con bindings + 1 vacío) + 629
uncoveredByDesign + 2.424 MUST_NOT_REACH + 255×3 (ESCAPE_HATCH/
OVERLAY_OF_ROOTS/NO_CSS_CHANNEL — leyes, no huecos). Ejecución:
- **F1.4a-piloto (mío):** una familia (chart/basic/area-chart) autorada a mano
  como ejemplar — el mapeo binding→fila internalChannels NO es mecánico
  (channelId = el canal gobernado al que debe resolver el socket, no el socket;
  eso es juicio por fila).
- **F1.4b (worker):** réplica del patrón por clases de familia (primitive
  1.532, pattern 787, surface 523, structure 454, chart 342), program-check de
  red, en lotes con commit por clase.
- **F1.4c:** los 629 uncoveredByDesign (prescripciones "fase 3 decide") se
  adjudican con la puerta que F1.5 abre; `targetBinding` solo se borra cuando
  cada celda tiene su ley re-expresada (nunca en masa — las 3.189 con status
  son adjudicaciones, no deuda).
**F1.3 ✅ `5c260b3a0`** — `root-exposure-gate` bloqueante (82 gates en CI).
La exposición de las 63 raíces queda gobernada: 26 tenant-dial con `governedBy`
real, 27 internal-head protegidas de ganar perilla en silencio, 10 gap
decrease-only con adjudicación escrita obligatoria (la nota debe NOMBRAR el
control — ejercitado por 2 gaps vivos). Hallazgo de diseño: `declaredOutputs`
es `representativeOnly` — el vínculo es `governedBy`, no la lista. Anotado
para F2: `tier.accent.bg` es el único gap con `channel: null`.
**F1.2 — la saga completa (2 paradas del worker, ambas correctas).** La
primera versión (lift) se auto-cancelaba: `domain` se regenera entero y solo
`calibration`/`retiredAliases` sobreviven al `--sync`; y contradecía el ruling
escrito `vocabularyDomicile`. La segunda (mis citas de fuente) salía al revés
al leer las líneas: la constante dice `cardComponent`; `catalogLaw` ya había
adjudicado motif (admitido ≠ expandido) y density (dueño: `density.mode`).
**Adjudicaciones finales del coordinador:** (1) alias `card`↔`cardComponent`
declarado UNA vez en la ley de paridad, nada se renombra; (2) motif 7 y
density fuera del catalog: sostenido, cero cambios de datos; (3) paridad en
versión IMPLICATIVA (todo valor que un root emite está admitido por un dueño
gobernado) con el alias + la regla cross-owner density→density.mode.
Entregado ya (2b): la validación FORMA en program-check (kind enum ⇒
enumValues no vacío O catalog presente), 3 drills probados por MUTACIÓN
(25/25). En vuelo (2c): la paridad implicativa. Lección de método para todos
los briefs futuros: citar líneas de fuente solo verificadas en el acto.
**Paso C2 ✅ `fd24be870`** — 16 sidecars a la forma de ley
`<capability>.<sufijo>` (lectura medida contra el gate); baseline **20→4**
(solo los 4 artefactos con nombre propio, razón re-escrita). Deuda anotada:
packinv:check (no CI) rojo por crecimiento de dist preexistente → F7.
**Paso C3 ✅ `8ab678dc1` + `82b800f94`** — manifest/ en forma capability (5
capabilities + 7 owners de datos, cero sueltos) y el scripts-tree-gate lo
cubre (M1): el doble hueco declarado por Fable (H8) queda cerrado. Con esto
**el Paso C queda COMPLETO** y la worklist cerrada de §13 ejecutada entera.
**Paso C1 ✅ `7df088fdf`** — los 13 renombres de capabilities ejecutados
con la maquinaria path-keyed (nunca a mano); baseline del scripts-tree-gate
**29→20** (decrease-only en acción). Cero sellos rotos (ninguno vivía en las
carpetas tocadas). gates:ci **80 VERDES**. Nota operativa: editar un
comentario en cualquier `.ts` de src/ dispara la cadena del censo (inputsDigest)
— vale para todos los lotes de F1+.
**F1 — arranque (lote heredado del cierre F0.5).** H2 ✅: los drills del
scripts-tree-gate ahora plantan archivos reales en un sandbox tmpdir (8 drills
de detección en disco + los de reporte). H1 ✅: R5 extendido a subfamilias de
lib/ (3 casos vivos adjudicados en baseline). **Worklist CERRADA de Paso C**
(Fable: que el alcance no viva solo en la memoria del mapeo): (a) 6 prefijos
de familia: ci-gates.manifest, engine-freeze-gate, engine-token-audit,
i18n-key-parity-gate, taxonomy-parity-gate, tokens-catalog; (b) 3 prefijos de
subfamilia lib/: build-input-hash, engine-corpus, engine-token-governance;
(c) 4 infijos con juicio de producto: run-ci-gates, cra-17-packaging-license-gate,
build-vertical-css, vertical-css-staleness.gate; (d) los 19 sidecars R3 con
nombre histórico → forma corta; (e) forma capability de packages/core/manifest/
(9 .mjs planos). Ejecución con la maquinaria path-keyed, nunca a mano.
**Auditoría Fable del frente F0.5: APROBADO, 0 bloqueantes**
(`/tmp/fable-frente-f05-verdict.md` — verificación de primera mano: gates:ci
propio, sha256 de la cadena computados a mano, 3 corridas de suite 24/24
idénticas al baseline). Condiciones del cierre implementadas en `652cf285e`:
H3 (worklist KIMI a su capability + exención exact-path con drill),
H4 (spacing.rhythm + registry measure fields; leg2-chromium anotado),
H6 (invariante de lint-folder-index en el archivo). H1+H2 = **primer lote de
F1** junto con Paso C; H5 (continue silencioso cross-repo) a F7.
**F0.5 — CERRADO (2026-08-20).** gates:ci final: 80 blocking + 2 excluded
visibles (dueño F2).
**Deuda nueva descubierta en el cierre (NO del frente):** (a) el
`dependency-honesty` de raíz en modos `static`/`check` reporta un unresolved
runtime module edge en `recipes/profiles/index.ts:76` — preexistente a F0.5
(último toque `26299ebff`), adjudicar en F1; (b) la evidencia browser de
cra-15 quedó stale desde el lote F (edit inerte de 9 bytes en
`registry/index.ts`) — cra-15 no está en el manifiesto CI por decisión
documentada; su re-sello corre por la vía de showroom en F1.
**Paso D ✅ `f4d20e30d`** (coordinador) — `scripts-tree-gate` bloqueante:
la ley §1.2/§2.9 sobre scripts/ es mecánica (R1–R6 + A1, baseline
decrease-only de 25 desviaciones adjudicadas con razón, 12/12 tests con 6
drills). **gates:ci: 80 blocking VERDES.** Paso C (acortamiento de nombres
pre-regla) DIFERIDO a F1 — el baseline del gate ya lo exige.
**Lote J ✅ `ece0c92ca`** (coordinador) — `audit-vertical-compliance` a
`structure/`: **scripts/ queda 100% folder/index** (0 producción suelta, 2
excepciones toolchain A11). Hermanos editados sin commitear (Fable H3) —
app-bithire:46, app-evnto:16, app-platform:58 los revisa su dueño. wiring
78/78, re-sello gat-07 (`211d64b6…`).

**Paso B — arranque confirmado y lote A habilitado (2026-08-19).** La
confirmación de Opus verificó todo contra el árbol (no de palabra) y midió la
baseline del Paso B: **1618 tests / 24 fallas = 23 estables + 1 flaky**
(channel-liveness: carrera entre el fixture de `cra-12-motion-governance.
reanchor.test.mjs` que escribe en `src/` y la enumeración CSS del gate;
aislado da 85/85). Adjudicaciones del coordinador sobre sus 7 hallazgos:
(3.1) la flaky se reporta APARTE; el fix real (fixture del drill a tmpdir) es
**deuda nueva post-Paso B**; (3.2) el worker corre `gat07:check` por lote y
reporta — el re-sello sigue siendo mío al commitear; (3.3) la atribución de
idiomas de Fable en F11-H estaba INVERTIDA — se sigue el árbol
(gat-07:58 es HERE-relativo, literal-ownership:37 es ROOT-relativo);
(3.4) 4 referencias vivas más integradas: `work-order/schema.json:158` (F),
`wiring-coverage-gate.mjs:41` ya sabía — se actualiza en F, docs internos del
paquete (B/C/H) con la regla "solo instrucciones de ejecución, no citas
narrativas"; (3.5) receipts sellados bajo test-artifacts/ se pudren sin
romperse — los adjudica F7; (3.6) lote J = 1 archivo. Baselines extra que
capturó: `lane-control-drills` (10/13 rojos fijos: E0-unattributed-emitter,
TOTALITY, PLANT/POSITIVE CONTROL, union 606 vs 625) y `gat07:check` verde
(4e75fec8). Nota operativa: `test:scripts` encadena 3 piernas con `&&` — con
la pierna 1 roja las otras no corren; el worker las corre por separado por
lote.

**Deuda anotada (no bloquea):** `packages/core/docs/TAXONOMY.generated.md` y
`test-artifacts/craft/cra-17/bundle-retention.json` estaban desactualizados
respecto al árbol ANTES de la 0-bis (la regeneración queda para el cierre de
F0.5 o F1, cuando el árbol deje de moverse).
5. Lote J (coordinador): `audit-vertical-compliance` a `structure/` + edición
   de `lint:vertical` en los 3 repos hermanos (SIN commitear allá — las revisa
   el dueño). Diferido por Fable H3 (cross-repo no atómico).
6. Paso C (renombres, opcional) y Paso D (scripts-structure-gate, mío; nace
   DESPUÉS del Paso C o con las excepciones A1/A2 escritas — Fable H10).
7. Graduación del manifest (censo: 32 lit + 7 calc + 15 solo-programa).
8. gates:ci final + auditoría Fable del frente.

**Auditoría Fable del mapeo (previa a Paso B): PROCEDER CON CORRECCIONES**
(`/tmp/fable-mapeo-verdict.md`). 5 bloqueantes, todos integrados al brief:
H1 Lote 0 (ya existía como `d3c431df0` — Fable auditó durante su ejecución);
H2 6+ consumidores en `src/tooling/` no censados → fixup F11 por lote +
lane-control-drills comparado contra su baseline roja en E/F/G/H; H3 tres
repos hermanos invocan `audit-vertical-compliance` → lote J diferido; H4
`dependency-honesty` de raíz importa `cra-17-public-declaration-gate` → lote E;
H5 test de `effect-registry-audit` de raíz rompe dos veces en lote F →
verificación ahora es `pnpm test:scripts` + grep residual desde la RAÍZ del
repo y por basename. Menores integrados: H7 constantes repo-relativas por
lote, H8 pareja pineada de analyze-bundle en lote F, H9 letra de F3 desfasada
(el árbol manda), H10 enmiendas de ley ya commiteadas (`7419d0758`,
`7c6e3bfcc`). Rechazada: smoke `import()` de scripts sin test (son CLIs con
efectos al importar; la ejecución real la cubre gates:ci + build).
