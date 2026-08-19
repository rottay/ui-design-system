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

**F0 — en curso.**

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
| F0.10 resello gat-07 | ⏳ | | yo; Node 22 + DOCS_ENGINEERING_ROOT local ya verificados |
| F0.11 gates nuevos | ✅ | `cd06b8dee` + `e7ea7c795` | 3 gates + drills 6/6 + wiring postbuild/prepack; root-catalog corregido |
| F0.12 declaración canales | ✅ | `675d2e3b3` | §1.10 ARCHITECTURE + wiring gate los cuenta |
| F0.13 gates rojos | ⏳ en curso | | adjudicados y commiteados: channel-liveness (regla `surfaces.elevation`), contract:check, hooks:check, tokens-catalog (vistas + reconciliación re-derivada), presupuestos de bytes (nota: mueren en F6), tenant-theme-fixtures (seguía mal el re-export), first-party-artifacts (regenerados tras build verde). Censo definitivo de los 78 corriendo sobre árbol estable |

**Notas de ejecución:**
- `pnpm build` de core quedó **verde de punta a punta** (prebuild 7 gates + tsc + vite + CSS + postbuild con `exports-artifact` nuevo).
- La regeneración de vistas de tokens escribe en `../docs-engineering` (repo hermano): su worktree tiene 344 cambios ajenos preexistentes — NO tocar; el commit/push de ese repo queda fuera de alcance (CI lo clona del remoto).
- El build por filtro (`pnpm --filter`) captura el paquete desempaquetado de `test-artifacts/release/2.19.29/` y falla ahí — usar `pnpm build` directo en `packages/core` hasta que F7 limpie ese árbol.
- Warnings APCA del build de artefactos (dark-mode colores 900, |Lc|=0) → material de craft para F4, no bloquean.

**Auditoría de hito:** al cerrar F0, Fable audita antes de abrir F0.5.
