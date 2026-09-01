# Auditoría independiente de Kimi

Tercer lector del mismo repo. Este documento es el resultado crudo de una
auditoría hecha por un segundo modelo (Kimi 0.36.1) sobre los tres documentos que
ya estaban en el repo — [`MAPA-DEL-REPO.md`](/docs/history/inventories/repository-map/2026-08/index.md),
[`QUE-SE-QUEDA-Y-QUE-SE-BORRA.md`](/docs/history/programs/architecture-refactor/2026-08/retention/index.md) y
[`VERIFICACION-FABLE.md`](/docs/history/audits/architecture-refactor/2026-08/independent-verification/index.md) — y sobre el árbol real.

Se ejecutó el 2026-08-19 en cinco bloques independientes, cada uno con su propio
contexto y sus propios subagentes de lectura. Ninguno de los cinco vio la salida
de los otros.

**Por qué está en el repo y no resumido.** Los tres documentos anteriores fueron
escritos por asientos que se equivocaron en cosas concretas, y este los corrigió
en cosas concretas. Dejar solo el resumen convertiría una verificación en una
afirmación más. Lo que sigue es lo que el auditor escribió, con su propia
evidencia citable.

**Qué cambió por culpa de esta auditoría.** Las correcciones ya están aplicadas
en `QUE-SE-QUEDA-Y-QUE-SE-BORRA.md`: el lote 9 volvió a bloquearse, la regla de
U3 se cayó, U5 se invirtió, U6 cambió de diagnóstico, y cuatro retiros que se
proponían por "cero importadores" quedaron prohibidos porque rompen el propio
design system.

**Límite declarado por el propio auditor.** Corrió dentro de este repositorio.
Las apps consumidoras (`app-bithire`, `app-evnto`, `app-platform`) viven fuera
del árbol, así que todo número de adopción de apps queda marcado por él como
NO VERIFICADO. Esa mitad la aporta la medición de cuatro columnas del documento
de decisiones.



---

## Bloque 1 — Los 11 lotes de borrado, verificados contra el árbol

Verificación contra el árbol real del repo, ejecutada el 2026-08-19. Metodología: cada lote fue verificado con comandos reales (`find`, `git ls-files`, `cmp`, `grep` sobre `packages/core/src`, `packages/core/scripts`, `packages/showroom/src` y tests).

| Lote | Veredicto | Evidencia clave |
|---|---|---|
| 1 — Carpetas vacías | DE ACUERDO CON MATIZ | Las carpetas existen y están vacías (find → `files: 0` en todos los grupos). Matices: (a) el total real es **36, no 34** (convención de conteo inconsistente: en (b) no cuenta la raíz, en (a) sí; tampoco cuenta el padre `KIMI-ANNOTATIONS/`); (b) "cero referencias a `continuous-runtime-governor`" es impreciso: la ruta viva `runtime/foundation/graphics/continuous-runtime-governor/` tiene 5 archivos y referencias en `cra-15-runtime-hardening-gate.mjs:47,166` — el borrado debe limitarse a la ruta **sin** `foundation/`; (c) `KIMI-ANNOTATIONS/inbox/` es el canal de propuestas declarado del programa vigente (`art-direction/index.json:363`, `index.mjs:985`): pedir orden explícita del owner antes de borrarlo |
| 2 — Codemods de febrero | DE ACUERDO | `ls packages/core/src/components` → *No such file or directory*. Los 16 `.mjs` + el `.json` apuntan a `components/custom` (ej. `adopt-helpers.mjs:20`); 0 hits en los tres `package.json`; `ls scripts \| wc -l` → 24 exactos (17 + 7); último commit 2026-02-08. Bonus: `fix-null-array-guards.mjs:17` tiene ruta absoluta de la máquina del autor hardcodeada |
| 3 — 13 iconos legacy | DE ACUERDO CON MATIZ | 15 carpetas confirmadas en `graphics/icons/presentation/legacy/`; comentario de `graphics/icons/index.ts:37-42` literal; 0 imports ejecutables de los 13; solo `AlertIcon`/`LoaderIcon` se reexportan (`index.ts:31-34`). **Paso que falta en el lote:** el barrel interno `presentation/legacy/index.ts:7-21` sigue exportando los 13 — borrar las carpetas sin reducirlo rompe el build. Además hay que refrescar `test-artifacts/gates/gat-07/semantic-evidence.json:7662-7802` (re-corriendo `gat-07-exact-proof.mjs`) y el `pack-inventory.baseline.json:1614-1678` |
| 4 — Monolito de la sonda | DE ACUERDO | `wc -l` exacto: monolito 2729, su test 692, sonda raíz 776. La raíz importa los módulos de `probe/` en `index.mjs:75-77,84` (4 directos; `index.mjs` llega vía `index.mjs:51` — la advertencia del doc se sostiene). El monolito solo importa builtins (`node:fs/path/url`, líneas 117-119). Nadie importa `probe/index.mjs` fuera de su propio test, y ningún glob de `test:scripts` alcanza ese test. Dato lateral: la sonda raíz tampoco tiene invocador automatizado (ni gates ni npm scripts la llaman) — no cambia el veredicto, pero "conservarla" es decisión de criterio, no de consumo |
| 5 — Docs de un repo que ya no existe | DE ACUERDO | Los 6 archivos existen y son comprobablemente de otro sistema: `componentes-agent.md:18-21` ("wrappers de Ant Design"), `:26` (8 temas Spotify/Netflix/...), `:9` React 18.2.0. Real: engines `classic/modern/rustic` (`ui/primitives/display/Avatar/engines/`), brand themes `bithire/evnto/rottay`, `react ^19.2.5`/`antd ^5.29.3` (`packages/core/package.json:1015,1005`). Cero enlaces desde cualquier archivo que no sean los tres docs de auditoría. Ojo: los 4 `.md` ya llevan cartel `> [!WARNING]` de preservación (decisión del 2026-07-17) — borrar revierte esa decisión; archivar es coherente con los banners |
| 6 — `styles/platform.css` | DE ACUERDO CON MATIZ | Todo exacto: `cmp` confirma identidad byte a byte (5.342.714 B cada uno); `build-vertical-css.mjs:19` no menciona platform (0 hits); exports en `package.json:535-554` apuntan a `dist/rottay.css`. **Conteo verificado dos veces: 802 ocurrencias en 19 archivos exactos** bajo `modern-rescue/`. Matices que el doc no menciona: existe `dist/platform.css` huérfano (y `dist/rottay.css` ni existe — dist stale); `pack-inventory.baseline.json:13770` espera `dist/platform.css` en el tarball; `dependency-honesty.mjs:3194` exige alias `dist/platform.css` en las apps; `docs/quality/performance-budget/index.md:56` tiene presupuesto para ese archivo. Ampliar el lote o crear lote hermano |
| 7 — `test-artifacts/` | DE ACUERDO CON MATIZ | Cifras exactas: 7.577 archivos / 479 MB / 203 versionados (raíz); 589 / 100 % / 50 MB (core, doc dice 49 — redondeo); 1.054 archivos de `node_modules` embebido exactos; `.gitignore:26-47,106-109` confirma la mecánica. Matiz estructural: los gates resuelven `test-artifacts/` contra la **raíz** por ruta hardcodeada (`gat-09-full-claim-integrity.mjs:33,37-39`, `cra-17-integral-gate.mjs:213-216`), mientras quality-evidence vive **solo** en el árbol de core (`program/index.json:11`). La propuesta "un solo árbol" contradice "dejar los 203 en la raíz": hay que explicitar el repunteo de gates. Extra: la raíz tiene `release/` **y** `releases/` (plural) como carpetas distintas — posible duplicado no mencionado |
| 8 — Espejo TS de tokens | **EN DESACUERDO** | Ver sección siguiente |
| 9 — `approval-inbox` | DE ACUERDO CON MATIZ | `@deprecated` confirmado (`approval-inbox/index.ts:18-22`); `DecisionInboxSurface` existe (`decision-inbox/index.tsx:227`); sale por API pública (cadena hasta `src/index.ts:333`). **Pero el "se puede hacer hoy y no rompe nada" es falso dentro del repo:** el showroom sí lo usa (`pattern-preview-fixtures.tsx:21,743,1352`, `navigation.ts:292`, `registry/patterns.ts:105`), el probe `r2-behavior/index.tsx:92,1770`, 3 tests propios, la skin `skin/approval-inbox.css` importada desde `facade/entrypoints/base.css:376` y `styles.css:395`, y `contracts/dependencies/runtime-suppliers/index.json:350,1796` + manifiestos de modern-rescue (fail-closed vía `index.mjs`). El lote debe incluir esos 5 grupos de pasos. La medición "0 importadores en apps" es externa: NO VERIFICADO desde este repo |
| 10 — Doc que describe lo inexistente | DE ACUERDO CON MATIZ | Las tres correcciones están efectivamente hechas: `CLAUDE.md:160-163` ahora **prohíbe** `patterns/commercial/`; `:206-208` prohíbe `surface-composition`; `find` no devuelve ninguna de las dos carpetas en `src`; la tabla de exports del `README.md:163-178` coincide con `package.json` (13/13) y `styles/platform` no aparece en ninguno. Matiz: las correcciones están en el commit `9e6af9462`, no "en el commit de este documento" (`8fce3e167`) como afirma la línea 357. Dato lateral: el doc dice que las apps importan `/commercial` 53 veces, pero `package.json` no declara ese export — NO VERIFICADO, y si es cierto está roto |
| 11 — Alias de `package.json` | DE ACUERDO CON MATIZ | Los hechos son correctos: cuento **15** alias byte-idénticos al manifiesto (no 11); `parity:theme:check` (package.json:674) y `theme-parity:check` (:679) idénticos; `cra-17-integral-gate.mjs:14-17,352,365` importa y reejecuta los otros dos gates y no está enchufado en manifiesto ni CI. **Pero "riesgo: ninguno" es falso:** `engine-audit:check` lo invoca `verify:core` de la raíz (`package.json:52`); `hooks:check` está encadenado en `prebuild` (`packages/core/package.json:638`); y `cra-17-integral-gate.test.mjs:14-17` importa el módulo y corre en CI vía el glob `scripts/*.test.mjs` (`ci.yml:167`) — hay que borrar el test en el mismo lote. Además `gat07:check` NO debe tocarse: corre en CI (`ci.yml:183`) y difiere del gate del manifiesto |

---

### LO QUE NO SE DEBE BORRAR

#### LOTE 8 — el espejo TS de tokens: el único EN DESACUERDO

El documento propone borrar "el grueso de `packages/core/src/foundation/tokens/ts/`" con el único bloqueo de mover dos funciones de Collapse. Eso está mal en alcance y en bloqueo:

- **`density` (una de las 28 carpetas "espejo") tiene 5 importadores de producción directos** que no pasan por el barril:
  - `infrastructure/runtime/theming/composition/react/tokens/index.ts:37` (runtime de producción)
  - `ui/surfaces/presentation/pages/workspace/collection-workspace/index.tsx:88-89`
  - `ui/structures/dashboard/insights/presentation/metrics/cards/index.tsx:12` (`DENSITY_PRESETS`)
  - `ui/structures/dashboard/insights/foundation/contracts/index.ts:2` (tipo `DensityMode`)
  - `infrastructure/compilers/kernel/foundation/css/appearance-posture/index.ts:28-29` (density + `TYPE_PAIRINGS`)
- **La premisa "el CSS es la autoridad y el TS la copia" está invertida para `brand-themes`:** `styles/platform.css:123332` documenta que el CSS se *compila desde* `foundation/tokens/ts/presentation/brand-themes/`. Es fuente autorada, no espejo. Lo mismo aplica a `recipe-profiles`, `responsive-postures`, `expressive-profiles`, importados por los compiladores de producción (`kernel/runtime/brand-theme/index.ts:44-54`, `composition/tenant-theme/index.ts:23-25`), y a `runtime/personality`, con ~13 importadores de producción (`Button/index.ts:96`, `Badge/index.tsx:29`, `Statistic/index.tsx:34`, etc.).
- El claim del barril sí es cierto: un único importador de producción, `Collapse/runtime/tokens/index.ts:42-47` (2 funciones **+ 2 tipos**, matiz).
- Lo que sí está muerto: los 19 espejos de componentes, 6 base no-density y 2 mirrors. El conteo "31 carpetas sin importador" no lo pude reproducir (57 dirs totales, 28 espejos): **NO VERIFICADO** el número exacto.
- `scripts/lint-folder-index.test.mjs:38` exige que exista `runtime/mirrors` — hay que tocar ese test.

**Corrección al lote:** limitar el alcance a los ~27 espejos realmente huérfanos, y el bloqueo debe incluir, además de Collapse, **mover `density` y `typography/pairings`** (o reapuntar sus 5+ importadores). `personality`, `brand-themes`, `recipe-profiles`, `responsive-postures` y `expressive-profiles` deben quedar explícitamente fuera.

#### Cosas que no se deben borrar dentro de lotes aprobados

- **LOTE 1:** la ruta viva `infrastructure/runtime/foundation/graphics/continuous-runtime-governor/` (5 archivos, citada por `cra-15-runtime-hardening-gate.mjs:47,166`) — solo se borra la ruta homónima sin `foundation/`. Y `KIMI-ANNOTATIONS/inbox/` requiere orden explícita del owner/DT (es el buzón declarado del programa vigente, `art-direction/index.json:363`).
- **LOTE 4:** los 5 módulos de `probe/` (el documento ya lo advierte y la advertencia es correcta: `index.mjs:75-77,84` de la raíz).
- **LOTE 11:** `gat07:check` (corre en CI, `ci.yml:183`) y, sin recableo previo, `engine-audit:check` y `hooks:check`.
- **LOTE 3 y 6:** los artefactos regenerables que fijan rutas (`gat-07/semantic-evidence.json`, `pack-inventory.baseline.json`) no se borran, se **regeneran**; borrarlos rompería gates que sí corren.

#### NO VERIFICADO (por depender de fuera del repo)

- Las mediciones sobre las 2000 apps (LOTE 9: "0 importadores de `ApprovalInbox`/`DecisionInboxSurface`"; LOTE 10: las 53 importaciones de `/commercial`). Las apps no están en este árbol; dentro del repo, `ApprovalInbox` sí tiene consumidores vivos (showroom y probe).

---

## Bloque 2 — Las 9 unificaciones, verificadas contra el árbol

Alcance de la medición: `packages/core/src`, `packages/core/scripts`, `packages/showroom/src`, tests/stories y `.github/workflows/`. Los conteos del documento que incluyen apps externas (bithire/evnto/platform) son **NO VERIFICADO** desde este repo — y en varios casos el conteo interno invierte la conclusión.

| # | ¿Mismo trabajo? | Canónico propuesto | Mi veredicto | Qué se rompe si se unifica |
|---|---|---|---|---|
| U1 appearance vs brand-theme | Parcial: emiten los mismos canales `--ds-*` (appearance `infrastructure/compilers/kernel/runtime/appearance/index.ts:385-452`; brand-theme `:813-877`) pero con entradas distintas (TenantAppearance vs Theme completo) | `brand-theme` | **Correcto.** Cita del CLAUDE.md exacta (`CLAUDE.md:310-311`); brand-theme se autodeclara "single lowering" (`brand-theme/index.ts:2006`); appearance se autodeclara compat (`appearance/index.ts:787,691`) y tiene solo 2 consumidores de producción contra ~10+30 tests de brand-theme | Nada público (appearance no llega a `src/index.ts`). Rompe `composition/tenant-theme/index.ts:69` (usa `withExpressiveFieldDefaults`), `branding-preview-sandbox/index.tsx:52`, ~6 tests de parity |
| U2 cli v1 vs v2 | Sí, y v2 no reusa nada de v1 (`v2/cli.mjs:6-17` solo importa `./`) | v2 | **Correcto, con una corrección:** la afirmación "el comando lo sigue ejecutando en CI" es **falsa** — `quality-evidence:check` no aparece en `.github/workflows/`, ni en `gates:ci` ni `pretest`. La cita del README es exacta (`scripts/tooling/quality/evidence/README.md:8,12-14`) | Desenchufar el script npm no rompe CI. Pero borrar los módulos v1 rompe `quality-evidence-gate.test.mjs:10-24`, que sí corre en CI vía `test:scripts` — hay que retirarlo en el mismo lote |
| U3 chrome de colección (4 pares) | Sí, los cuatro pares; las tres admisiones escritas son textuales (`table-toolbar/runtime/rendering/index.tsx:9`, `column-menu/index.tsx:15`, `saved-views-menu/index.tsx:15`) y la cuarta apunta a FilterBuilder, no a FilterPanel (`field-filters-panel/index.tsx:14`) | `structures/` | **Disentido.** Las cifras "patterns suma 1, structures suma 7" no se reproducen en el repo: contando la familia `Pattern*` (los nombres `SavedViewsBar`/`FilterPanel` ni siquiera se exportan), patterns suma ~22 importadores internos de producción contra ~13 de structures. `collection-workspace` consume ambos lados a la vez. La adopción externa es NO VERIFICADO y la interna favorece a patterns | Retirar los 4 de patterns rompe: 2 surfaces de core (`data/list`, `collection-workspace`), `data-table` (compone `PatternFilterPanel` vía facade), subpath exports `./patterns/list-toolbar` y `./structures/column-menu` en `package.json:322,397`, el contrato público `ListToolbarProps`, el smoke test de sistema y ~11 archivos del showroom |
| U4 list/detail vs workspace | Sí, ambos pares; `record-workbench/index.tsx:6` se autodeclara literalmente "Enhanced DetailSurface" | `collection-workspace`; detalle: sin decidir | **Parcial.** La cita canónica es exacta (`collection-workspace/index.tsx:4`). Pero el "0 vs 61" no se sostiene internamente: `ListSurface` tiene 1 consumidor real en core + 3 showroom + 7 tests; `CollectionWorkspaceSurface` 0 en core + 4 showroom. La diferencia es toda externa: NO VERIFICADO. Aceptable retirar ListSurface, pero no por las cifras citadas | ListSurface: 7 tests de core, fixture de brand-studio (`tenant-theme-preview/fixtures/list-collection/index.tsx:20`), 3 showroom, gates `public-api.contract.test.ts` y `gat-07-exact-proof.test.mjs`. Los cuatro son API pública en raíz |
| U5 seis marcos de página | **No son seis duplicados**: son capas (Layout < AppShell < PatternPageShell < WorkspaceShell) con dos solapes reales: PageShellSurface↔PatternPageShell (delegación 1:1 declarada, `page-shell-surface/index.tsx:16-19`) y SidebarSurface↔sidebar de AppShell (no declarado) | Árbol de decisión + retirar los de "cero" | **Los ceros del documento son engañosos.** `PageShellSurface` (citado con 1) es el componente más consumido internamente: 28 surfaces + `HeaderSurface`. `WorkspaceShell` (citado con 0) sostiene a `CollectionWorkspaceSurface` (`collection-workspace/index.tsx:81`). La cita "page chrome, not a page recipe" es exacta (`workspace-shell/index.tsx:9`); la palabra "adaptador" no existe literal (NO VERIFICADO, dice "wrapper/delegating") | Retirar PatternPageShell rompe en cascada las 28 surfaces vía PageShellSurface. Retirables con daño acotado: `Layout` (0 consumidores core), `AppShell` (0 core, 2 showroom), `SidebarSurface` (1 story core). NO retirar PageShellSurface ni WorkspaceShell |
| U6 cuatro empty state | Parcial: la cadena surface→structure→pattern ya delega (`EmptyStateSurface`→`SurfaceEmptyState`→`PatternEmptyState`), pero `PatternEmptyState` **no delega en `Empty`**: duplica markup (`empty-state/engines/modern/index.tsx:101-171`) | `Empty` dibuja, los otros delegan | **Internamente el más adoptado es `SurfaceEmptyState` (31), no `Empty` (30).** La propuesta "los otros tres delegan en el primitive" requiere agrandar la API de `Empty` (hoy sin slots de título/icono/acción). `EmptyStateSurface` tiene 4 consumidores internos, no es huérfano | Retirar PatternEmptyState rompe SurfaceEmptyState y en cascada las 26 surfaces que lo usan. No hay retiro barato en este grupo |
| U7 pares de primitives | Ver abajo — 4 citas del documento son incorrectas o incompletas | Mixto por par | **Ver tabla detalle.** Hallazgo clave: cuatro retiros propuestos por "0 importadores" sí tienen consumo interno de producción | Ver detalle |
| U8 dos motores de roadmap | Sí: copia divergida, cabecera exacta (`scripts/maintain/roadmap/commercial-status/index.mjs:2-9`), 304/3177 líneas ≈ 9,6 % confirmado | Motor principal parametrizado | **Viable pero el encuadre "dos divergencias" está incompleto:** el motor exige `traceability.ds-improvements` (`scripts/maintain/roadmap/status/index.mjs:1845-1848`) que `roadmap-commercial/registry.json` no tiene — son **tres** divergencias. El número "191 líneas idénticas" es impreciso: `comm -12` da 267 (192 con `sort -u`). Decisión firmada confirmada (`roadmap-commercial/registry.json:9`) | Reencauzar los alias `roadmap:commercial*` (`package.json:63-64`). CI no toca el comercial (`ci.yml:505` corre solo `roadmap:check`). No existe test del comercial |
| U9 arquitectura en tres lugares | Sí el solape, pero **la ubicación citada está mal**: `docs-engineering/` no está en este repo (es el repo hermano `../docs-engineering/`), y el tercer documento real es `packages/core/ARCHITECTURE.md`, no `packages/core/docs/` | `docs-engineering/` como fuente | **Parcial.** Solape de 4 secciones y ausencia de enlaces cruzados: confirmado. Pero la frase "el CLAUDE.md de la raíz lo declara" es del CLAUDE.md del monorepo padre (`../CLAUDE.md:9`), no del de este repo — en este CLAUDE.md esa frase no existe | Convertir `docs/ARCHITECTURE.md` en puntero deja 5 enlaces internos (`README.md:99`, BACKLOG, etc.) apuntando a un puntero a un repo externo: quien clone solo este repo se queda sin arquitectura local. La unificación debería incluir `packages/core/ARCHITECTURE.md` (omitido por U9) |

### U7 — detalle por par

| par | cita verificada | importadores internos (core prod / showroom) | veredicto |
|---|---|---|---|
| Switch / Toggle | Imprecisa: Switch dice "toggle control" (`Switch/index.tsx:4`), Toggle dice "toggle switch" (`Toggle/index.ts:5`); solape semántico real, APIs distintas | Switch 4/8; Toggle 0/4 | Fusión viable; internamente Toggle no rompe producción core. Los "8 archivos de bithire" son NO VERIFICADO |
| Steps / Stepper | Exacta: ambos "clickable navigation" (`Steps/index.tsx:5`, `Stepper/index.tsx:4`) | Steps 2/5; Stepper 0/5 | Retiro de Stepper compatible; rompe 2 suites de tooling y 5 showroom |
| Message / Notification / Toast | Incompleta: también existen las funciones `message()` y `notification()` exportadas (`feedback/index.ts:66,79`) | `toast()` solo 2 internos; el consumo real es `useToast`/`ToastProvider` (showroom); componentes 0 prod | Fondo correcto (fachadas sin consumo directo), análisis incompleto |
| Drawer / Sheet | Exacta (`Sheet/index.tsx:4-6`) | Sheet **3 prod core** (app-shell:45, widget-board:20, adaptive-overlay:58); Drawer 1/4 | **Corrección:** Sheet no tiene 0; retirarlo rompe producción del DS. No retirar |
| Popover / HoverCard / Tooltip | **Falsa:** ambos `content: ReactNode` (`Tooltip/contracts/index.ts:101`, `Popover/contracts/index.ts:116`) | Popover **3 prod core** (column-menu, list-toolbar ×2); HoverCard 0/3; Tooltip 12/6 | Retirable solo HoverCard. Popover no tiene 0 |
| Statistic / MonoStat / DataTerminalCard | Parcial: la animación no es el rasgo central de Statistic | Statistic **2 prod core** (stats-header, stats-grid modern); MonoStat 0/3; DataTerminalCard 0/3 | **Corrección:** retirar Statistic rompe dos familias internas. El "primitive con 0" no tiene 0 dentro del repo |
| PatternStatsGrid / StatsHeader | Confirmado el solape | StatsGrid 5 prod core; StatsHeader 0/4 | Retiro de StatsHeader compatible con la propuesta |
| Calendar / CalendarView, Timeline / timeline, Tree / tree-view | **Parcialmente falsa la regla "el pattern compone el primitive":** solo TreeView compone Tree (`tree-view/engines/modern/index.tsx:38`); CalendarView y PatternTimeline no componen su primitive | Tree 1 prod (tree-view); Calendar 0/5; Timeline 1 prod (activity-log) | Retirar `Tree` rompe `tree-view` en producción — corrección al documento |

### Resumen ejecutivo

- **Veredictos a favor tal cual:** U1, U2 (con la corrección de CI), U8 (con la tercera divergencia).
- **Disentimiento fuerte:** U3 (el conteo interno favorece a patterns, no a structures) y U5 (los "ceros" incluyen los dos componentes con más consumo interno del grupo).
- **Correcciones de hecho al documento:** U2 no corre en CI; U7 tiene cuatro "0 importadores" falsos dentro del repo (Sheet, Popover, Statistic, Tree) y una cita de API falsa (Tooltip); U9 cita mal el tercer documento y atribuye la fuente al CLAUDE.md equivocado; U8 "191 líneas" es impreciso.
- **Patrón transversal:** el documento ya admite en su Parte 3 que el alcance de la medición es parte del resultado, pero las tablas de U3, U5, U6 y U7 siguen presentando conteos de apps externas (NO VERIFICADO desde este repo) como si fueran el criterio. En cada caso donde pude contar dentro del repo, el conteo interno cambia o invierte la conclusión.

---

## Bloque 3 — Barrido independiente de `packages/core/scripts/`

Verificado directamente sobre el arbol: 81 `.mjs` + 2 `.ts` no-test planos, 85 tests planos, 28 `.json`, `codemods/` (3), `lib/` (30), `quality-evidence/` (401). Node del repo: `engines >=20`, CI fija Node 22 (`.github/workflows/ci.yml:14`) — pero los globs de `test:scripts` los expande el shell de pnpm, asi que son planos en cualquier version.

### 1. Familias funcionales entre las 81+2 herramientas

| Familia | Cant. | Archivos (representativos) |
|---|---|---|
| A. Orquestacion CI / inventario de gates | 3 | `ci-gates.manifest.mjs`, `run-ci-gates.mjs`, `workflow-script-wiring-gate.mjs` |
| B. Gates packaging / dist / contrato publico | 12 | `pack-inventory-gate`, `cra-14-public-barrel-gate`, `cra-17-*` (x3), `dist-freshness-gate`, `import-binding-integrity-gate`, `icon-embed-inventory-gate`, ... |
| C. Gates frontera app/DS y canales tenant | 17 | `app-ds-boundary-gate`, `app-ds-hook-contract-gate`, `application-boundary-gate`, `app-root-writer-gate`, `tenant-channel-consumer-gate`, `theme-channel-parity-gate`, `channel-liveness-gate`, ... |
| D. Gates CSS / skins / engines | 12 | `css-layer-paint-gate`, `color-mix-argument-purity-gate`, `container-query-gate`, `engine-freeze-gate`, `engine-token-audit`, `skin-dead-part-audit`, ... |
| E. Gates estructura / arquitectura repo | 11 | `core-structure-audit`, `lint-folder-index`, `taxonomy-parity-gate`, `audit-integration`, `audit-vertical-compliance`, `i18n-key-parity-gate`, ... |
| F. Censos / auditorias de reporte | 8 | `skin-census`, `canvas-sink-census`, `customization-surface-census`, `cra-11-adaptive-contract-census`, `tenant-reach-census`, ... |
| G. Builders / generadores | 9 | `build-vertical-css`, `build-vertical-artifacts`, `build-font-packs`, `generate-semantic-icons`, `tokens-catalog`, `controls-catalog`, ... |
| H. Bundle / performance | 2 | `analyze-bundle.mjs`, `check-storybook-budget.mjs` |
| I. Certificaciones de programa | 3 | `gat-07-exact-proof`, `gat-09-full-claim-integrity`, `cra-15-runtime-hardening-gate` |
| J. Codemods / migraciones | 4 | `codemod-motion-tokens`, `codemod-motion-durations`, `relocate-engine-token-baseline`, `migrate-public-entrypoints` |
| K. Config suite de tests | 2 | `tests-typecheck-ambient.d.ts`, `vitest.scripts.config.ts` |

Clasificacion por encabezado/usage de cada archivo (head por archivo). `lib/` es la capa compartida que importan C–F; `codemods/` pertenece a J.

### 2. Herramientas con DOS vias de invocacion (manifest + alias) que pueden divergir

`run-ci-gates.mjs:49-67` ejecuta los 51 gates blocking del manifest; `pretest` (`package.json:665`) y CI (`ci.yml:161-164`) usan la misma via. La divergencia real es manifest vs alias de `package.json`:

| Herramienta | Via manifest | Via alias | Divergen |
|---|---|---|---|
| `gat-07-exact-proof.mjs` | `--check` (`ci-gates.manifest.mjs:151`) | `gat07:check` = `--check-artifact` (`package.json:660`) | **SI, grave**: el script no reconoce `--check` (`gat-07-exact-proof.mjs:1354-1380` solo procesa `--write`/`--check-artifact`/...); la via manifest nunca byte-compara el artefacto commiteado. Flag fantasma. |
| `cra-12-motion-governance.mjs` | `--repositories ui-design-system` (`ci-gates.manifest.mjs:262`) | `cra12:check` = sin flags, audita 4 repos (`package.json:723`) | SI (scope), documentado en `ci-gates.manifest.mjs:259-261`; `cra12:check:local` si coincide |
| `theme-channel-parity-gate.mjs` | `--check --quiet` (`ci-gates.manifest.mjs:218`) | `parity:theme:check` y `theme-parity:check` = `--check` (`package.json:674,679`) | Solo verbosidad; ademas hay dos aliases duplicados entre si |
| 13 gates mas (engine-token-audit, size-axis-law, app-ds-boundary, channel-liveness, tokens-catalog, etc.) | `--check` | alias identico `--check` | No (misma definicion) |

Divergencias alias-vs-alias fuera del manifest: `cra15:gate` (`--check --structural`, `:648`) vs `cra15:gate:final` (`--check`, `:719`) — `--check` a secas implica modo final mas estricto (`cra-15-runtime-hardening-gate.mjs:740-750`); `cra11:check` (`--check`, `:657`, usado por CI `ci.yml:500-501`) vs `cra11:gate` (`--check --require-clean`, `:658`).

### 3. Tests que NO alcanza ningun glob de `test:scripts`

`find packages/core/scripts -name '*.test.*'` → 98 archivos. Los pasos cubren: raiz plana (85), `v2/*.test.mjs` (1), 2 explicitos de modern-rescue, `../../scripts/check/effects/index.test.mjs`, y vitest con include `scripts/**/*.vitest.test.ts` (`vitest.scripts.config.ts:12`, 1 archivo). **No alcanzados (9)**:

| Test | Por que | Otra via |
|---|---|---|
| `scripts/libraries/first-party-roster-source.test.mjs` | subdirectorio, glob plano | solo `gates:ci` (`ci-gates.manifest.mjs:111`) |
| `scripts/libraries/modern-framework-layer.test.mjs` | idem | **ninguna** — no lo ejecuta ningun comando |
| `scripts/libraries/owner-nesting.test.mjs` | idem | solo `gates:ci` (`:308-311`) |
| `scripts/libraries/root-public-resolver.test.mjs` | idem | solo `gates:ci` (`:316-320`) |
| `quality-evidence/programs/modern-rescue/index.test.mjs` | ni glob v2 ni explicitos | **ninguna** |
| `.../modern-rescue/scripts/foundation/tokens/manifest/fanout.test.mjs` | idem | **ninguna** |
| `.../modern-rescue/scripts/foundation/tokens/scripts/foundation/tokens/manifest/mirror-parity.test.mjs` | idem | **ninguna** |
| `.../modern-rescue/scripts/foundation/tokens/scripts/foundation/tokens/manifest/root-checklistss.test.mjs` | idem | **ninguna** |
| `.../modern-rescue/probe/index.test.mjs` | idem; docblock dice ejecucion manual | **ninguna** |

El propio manifest admite el agujero (`ci-gates.manifest.mjs:44-53`) pero su remediacion solo anadio 2 de los 7 tests de modern-rescue. Existen DOS suites `index.test.mjs` distintas, ninguna ejecutada.

Doble ejecucion: ninguna dentro de `test:scripts`, pero CI corre `gates:ci` (`ci.yml:164`) y `test:scripts` (`ci.yml:167`) como pasos separados → todos los drills registrados en el manifest corren dos veces por CI; `effect-registry-audit.test.mjs` corre tres veces (paso d + `ci.yml:169-172`).

### 4. Pares duplicados vs complementarios

**Duplicacion real entre herramientas planas: ninguna encontrada.** Veredictos por par (ambos archivos leidos):

| Par / grupo | Veredicto | Evidencia |
|---|---|---|
| `codemod-motion-durations` vs `codemod-motion-tokens` | Complementario | durations:45-58 (regex `\d+ms`); tokens:54-91 (strip fallbacks + cubic-bezier) — transforms distintos del mismo WO-ENG-01 |
| codemods raiz vs `codemods/*.mjs` | Complementario | raiz migran el motor moderno interno (`../src/ui`); `codemods/README.md:15-17` son para apps consumidoras, nunca corren desde este repo |
| `*-census.mjs` raiz vs `lib/*-counter.mjs` (embedded-css, runtime-svg, cra-11) | Complementario (patron wrapper) | census:4 `import ... from "./lib/embedded-css-paint-counter.mjs"` — el census ES el CLI del counter |
| 3 paint counters lib + canvas-sink | Complementario | `runtime-svg-paint-counter.mjs:12-16`: "Coverage is intentionally SVG-only… one authored site satisfy two independently-ratcheted channels" — canales disjuntos a proposito |
| 4 boundary gates (app-ds, hook-contract, application, root-writer) | Complementario | `app-ds-hook-contract-gate.mjs:21-24`: "that gate answers a different question"; cada uno mira un corpus distinto (vars `--ds-*` / hooks / selectores de clase / escritores JS del root) |
| `build-vertical-artifacts` vs `build-vertical-css` | Complementario | artifacts:5 (tenant artifacts) vs css:5-8 (bundles shippables dist) |
| `vertical-css-staleness.gate` vs `build-vertical-css --check` | Solapamiento deliberado | staleness:13-17: compila desde source en memoria porque `--check` lee dist (build product) y no puede correr pre-build |
| 3 audits (integration / vertical-compliance / structure) | Complementario | integration:6-11 (internals core); vertical-compliance:18 (`--app-dir` sobre apps); structure:6-21 (arbol fisico src) |
| gate.mjs + gate.test.mjs mismo nombre | No es duplicacion (gate+drill) | tests spawn-ean el CLI real, ej. `app-ds-boundary-gate.test.mjs:9-11` |

Unica copia verbatim de codigo: `vertical-css-staleness.gate.mjs:49` ("helpers copied verbatim" de `build-vertical-css.mjs`) — justificada y documentada, pero es deuda real.

**Duplicacion real detectada en `quality-evidence/` (ver seccion 5): `probe/index.mjs` monolitico vs la pata modular — esa si es segunda copia.**

### 5. `quality-evidence/`: proposito unico vs segunda copia

| Carpeta | Archivos | Proposito | Evidencia |
|---|---|---|---|
| raiz (v1) | 8 | Baseline historico del scorecard, "HISTORICAL BASELINE ONLY" | `README.md:8-24`; consumido por `quality-evidence:check` (`package.json:680`) y `quality-evidence-gate.test.mjs:10-24` |
| `v2/` | 11 | Evaluacion gobernada vigente (eligibility binaria + craft-score separados) | `README.md:26-58`; gate blocking `ci-gates.manifest.mjs:74` |
| `programs/modern-rescue/` | ~390 | Unico programa existente; arbol de autoridad WO-CRA-23 | `programs/modern-rescue/README.md:1-6` |
| `governance/manifest/families/**` | 255 | Un JSON por familia canonica | README:146-149 |
| `governance/manifest/cascade/{roots,extracted,materialized,backlog}` | 64 | roots autorado; resto generado por `cascade-*.mjs` | `"generator":` en cada JSON |
| `probe/` | 7 | Sonda de cascada modular + **segunda implementacion monolitica** | ver tabla siguiente |
| `KIMI-ANNOTATIONS/inbox/` | 0 | Buzon vacio | — |

| Par | Veredicto | Evidencia |
|---|---|---|
| v1 `scorer/registry/schema/cli` vs `v2/craft-score/eligibility/contracts/cli` | Reemplazo gobernado, no copia | `README.md:8-33`; v1 retenida por ley del programa como baseline etiquetado |
| `pairwise.mjs` (v1) | Sin equivalente v2 — funcionalidad no portada | `pairwise.mjs:1-8` |
| `probe/index.mjs` (95 KB, autocontenido, solo builtins, lineas 117-119) vs orquestador raiz `index.mjs` (31 KB) + `probe/index.mjs` + `index.mjs` | **DUPLICACION REAL: segunda implementacion de la misma sonda simbolica** | orquestador importa los modulos (`index.mjs:68-84`); el monolito reexporta su propio `loadSheet/evaluate/restEquivalence/derivative` (`probe/index.mjs:891-2161`). Solo lo consume su propio test; **ninguna de las dos suites corre en CI ni npm**. Cual es la viva: **NO VERIFICADO** |
| `governance/manifest/controls/*.json` vs `cascade/roots/*.json` (mismos nombres de archivo, 20 vs 20) | Complementarios | diff de `spacing.rhythm.json`: controls posee calibracion, roots posee prescripcion de cascada |

### 6. Archivos de un solo uso ya consumido

| Archivo | Estado | Evidencia | Sigue invocado |
|---|---|---|---|
| `codemod-motion-tokens.mjs` | Aplicado: `engine-baseline/index.json` → `"motion.cubicBezierLiterals": 0`; grep de `cubic-bezier(` sin `var(` en engines/modern → 0 | **No** (0 refs en package.json, workflows, manifest, tests) |
| `codemod-motion-durations.mjs` | Aplicado: baseline `"motion.rawDurationLiterals": 0` | **No** |
| `codemods/sizetype-to-size.mjs` y `codemods/variant-tone-split.mjs` | Codemods para apps externas; "never executed… from within this repo" (`codemods/README.md`) | **No** en este repo; consumo en apps: **NO VERIFICADO** |
| `relocate-engine-token-baseline.mjs` + `lib/path-keyed-baseline-relocation.mjs` | Consumido: 0 claves `src/components` en el baseline (`grep -c` → 0) | **Si**: alias `engine-audit:relocate-paths` (`package.json:646`) + drill en CI |
| 17 `*.baseline.json` | Datos vivos decrease-only de sus gates, no archivos muertos | cada uno consumido por su gate en el manifest | Si |
| `migrate-public-entrypoints.mjs` | Herramienta viva (`package.json:731-732`) | Si; si quedan imports por migrar: **NO VERIFICADO** |

Hallazgos adicionales (verificado en package.json, workflows, manifest, run-ci-gates y tests antes de afirmarlo): `skin-orphan-scope-audit.mjs` (gate con baseline pero sin invocador alguno), `tenant-reach-census.mjs` y `generate-surface-capability-census.mjs` (cero invocadores; el test `surface-capability-census.test.mjs` prueba la lib, no el wrapper). Esto no es duplicacion sino wiring faltante — pero bajo el criterio del duenio, un gate que nada ejecuta tampoco representa su proposito.

### Resumen para el duenio

- La duplicacion real del bloque es puntual: **el doble cascade-probe de modern-rescue** (dos implementaciones, ambas sin ejecutor) y el **flag fantasma `--check` de gat-07** (dos vias que verifican cosas distintas).
- El resto de los nombres parecidos (census/counter/gate/audit) son capas deliberadas con anti-solapamiento documentado en el propio codigo.
- Los agujeros de cobertura (9 tests sin ejecutor, 5 de ellos sin ninguna via) y los 3 gates sin invocador son el otro frente concreto: no son segundas copias, son propositos declarados que nada materializa.

---

## Bloque 4 — Barrido independiente en busca de hallazgos nuevos

### 1. La fachada `visual-authority`, declarada obsoleta, sigue siendo la vía de importación real

**Qué es:** `packages/core/src/infrastructure/runtime/theming/foundation/visual-authority/index.ts` se autodeclara `@deprecated` en su línea 10-11 ("*Prefer importing from `./foundation/admission` or `./runtime/retention` directly*"), pero es el camino de importación vigente de **10 archivos**, incluidos dos entrypoints públicos.

**Evidencia:** `grep -rn "theming/foundation/visual-authority['\"]"` en `packages/core/src` devuelve imports desde `entrypoints/server/index.ts:92,97,116,121`, `entrypoints/public/contracts/runtime/index.ts:2`, `ui/patterns/customization/tenant-preview/runtime/preview-css/index.ts:52`, `ui/patterns/customization/brand-studio/runtime/tenant-theme-preview/preview-scope/index.ts:24`, `infrastructure/runtime/tenant/composition/react/authoring/use-create-tenant/index.ts:56`, `infrastructure/runtime/theming/composition/react/provider/index.tsx:79`, más 4 tests.

**Por qué es un problema:** es exactamente el caso "obsoleto pero presente con un cartel" que la regla 2 de `QUE-SE-QUEDA-Y-QUE-SE-BORRA.md` prohíbe, y peor: la API pública del paquete (`/server`, `/contracts/runtime`) se sirve a través del camino deprecado. El mapa lo describe (línea 906) pero ningún lote lo acciona. Hay que migrar los 10 importadores o levantar el `@deprecated`.

### 2. Dos componentes `Link` públicos con dos `LinkProps` divergentes

**Qué es:** hay dos contratos `LinkProps` con formas distintas: `ui/primitives/navigation/Link/contracts/index.ts:84` (extends `AnchorHTMLAttributes`) y `ui/primitives/display/Typography/contracts/index.ts:398` (extends `BaseComponentProps, EngineAwareProps, TypographyCraftProps`). Y dos componentes: `NavLink` y `TypographyLink`, este último reexportado como `Link` (`Typography/index.tsx:61`) y publicado como `Link` por el subpath `./primitives/typography` (`entrypoints/public/primitives/typography/index.ts:4`).

**Evidencia:** comandos `grep -rn "^export interface LinkProps"` (dos definiciones) y lectura de los entrypoints citados. El código lo admite a medias: `ui/primitives/navigation/index.ts:67-71` comenta "*NavLink is the canonical navigation-primitive name*".

**Por qué es un problema:** el consumidor de `@rottay/design-system/primitives/typography` importa un `Link` que no es el `NavLink` canónico, con props incompatibles. El mapa menciona "Link (publicado como NavLink)" (línea 988) pero no registra la segunda implementación pública; ningún documento la nombra.

### 3. `command-center` redefine el vocabulario de dashboard con formas divergentes

**Qué es:** `ui/surfaces/presentation/pages/workspace/command-center/index.tsx:40,57` define localmente `StatItem` y `ActivityItem`, conceptos que ya tienen dueño en `ui/structures/dashboard/stats-header/contracts/index.ts:41` y `ui/structures/dashboard/insights/foundation/contracts/index.ts:21` — y las formas **ya divergieron**: el `StatItem` de stats-header tiene `change?: number` + `direction` aparte; el de command-center tiene `change?: { value, direction }`. El `ActivityItem` de insights usa `time`/`type`; el de command-center usa `timestamp`/`user`.

**Evidencia:** `sed -n` sobre los tres archivos citados arriba; command-center no importa de ninguna de las dos structures (sus imports, líneas 15-22, son solo primitives).

**Por qué es un problema:** dos representaciones del mismo concepto que ya no son intercambiables. El mapa describe `command-center` (línea 1217) sin marcarlo, y el U7 propone retirar `stats-header` sin notar que su vocabulario sobrevive bifurcado en una surface.

### 4. Página del showroom autodeclarada TEMPORARY, sin seguimiento de retiro

**Qué es:** `packages/showroom/src/app/probe/kit-inventory/page.tsx:2` dice "*TEMPORARY kit-inventory probe for WO-SHW-01 sighted capture*" y declara que el chrome real lo construye WO-SHW-02+.

**Evidencia:** lectura directa del archivo (líneas 1-14).

**Por qué es un problema:** menor que los anteriores — el mapa describe `probe/` como lienzos deliberados (línea 232) y el documento de borrado cita esta página como consumidor legítimo — pero ninguno registra que la página se declara a sí misma temporal condicionada a un work order. Si WO-SHW-01 cerró, es un "por ahora" que se quedó. **NO VERIFICADO:** el estado de WO-SHW-01/WO-SHW-02.

### 5. Verificados en negativo (para que no se re-busquen)

- **Barriles:** script propio sobre los ~1.400 `index.ts[x]` de `packages/core/src` resolviendo cada `export ... from './...'`: **0 reexports rotos**. El único `index.ts` sin ningún export es `tooling/testing/setup/index.ts`, que es setup de Vitest por efectos laterales (correcto por diseño).
- **Copias byte-idénticas:** `md5` sobre todos los `.ts/.tsx/.css` >2 KB de `packages/core/src`: **ningún duplicado exacto**.
- **Subpaths huérfanos:** comparé `entrypoints/public/{primitives,patterns,structures,surfaces,contracts,runtime}` contra `packages/core/package.json#exports`: **ninguna carpeta no vacía sin subpath declarado** (las vacías ya son LOTE 1).
- **Autodeclaraciones de retiro:** `grep -i "will be removed|to be removed|slated for removal"` solo encuentra `approval-inbox`, que ya es LOTE 9.

**Límites:** los veredictos de consumo buscaron en `packages/core/src` y `packages/showroom/src` (más `packages/core/scripts` en los greps iniciales). No medí imports desde las apps consumidoras — eso ya lo cubre la medición de 2000 archivos del documento principal.

---

## Bloque 5 — Veredicto general, la lista "se queda" y las reglas

Método: lectura completa de `docs/history/audits/architecture-refactor/2026-08/independent-verification/index.md` (356 líneas) y `docs/history/programs/architecture-refactor/2026-08/retention/index.md` (793 líneas), más verificación propia con `Read`, `Grep`, `cmp`, `comm`, `find` y `git ls-files` contra el árbol actual.

### 1. Los 14 desacuerdos de Fable

Verifiqué 7 afirmaciones de Fable por mi cuenta. **Las 7 se sostienen.**

| # | afirmación de Fable | mi verificación | resultado |
|---|---|---|---|
| a | `modern-rescue/probe/` NO se puede borrar entero: la sonda raíz importa sus módulos | `index.mjs:75-84` importa `./probe/index.mjs`, `index.mjs`, `index.mjs`, `index.mjs` (leído directo). `index.mjs` entra por vía indirecta: `probe/index.mjs:51` | **SE SOSTIENE**, con precisión: `QUE-SE-QUEDA` dice que la raíz importa "5 de sus 7 archivos" en sus líneas 76-84; son **4 directos** (75-84) y `value-eval` es transitivo. El veredicto (borrar solo `probe/index.mjs` + su test) es correcto. |
| b | `decision-panorama` y `widget-board` sí tienen consumidor | `.../brand-studio/runtime/tenant-theme-preview/fixtures/visual-excellence/index.tsx:45-51` importa `DecisionPanorama` y `WidgetBoard` desde `@/ui/patterns/data`; los renderiza en `:354` y `:726` | **SE SOSTIENE** |
| c | `bulk-select-toggle` sí tiene consumidor | `ui/patterns/data/tests/PatternsLongTailBatch.contract.test.tsx:6` lo importa y `:44-64` lo ejercita | **SE SOSTIENE** |
| d | `guided-draft-form` NO envuelve `PatternFormBuilder` (son 3 de 4) | `grep FormBuilder` en `ui/surfaces/presentation/pages/forms/guided-draft-form/` → 0 coincidencias. (Nota: la carpeta vive bajo `surfaces/presentation/pages/forms/`, no bajo `patterns/forms/` como sugiere la redacción de Fable) | **SE SOSTIENE** |
| e | `scripts/maintain/roadmap/commercial-status/index.mjs` es copia declarada, no reimplementación | `head -12` muestra "Copied from ... scripts/roadmap-status.mjs (2026-07-07) ... Byte-identical EXCEPT for exactly TWO functional divergences"; `comm -12` sobre líneas únicas no vacías → **191**; `wc -l` → 3177 / 304 | **SE SOSTIENE** |
| f | `platform.css` y `rottay.css` byte-idénticos | `cmp` → sin diferencias; ambos 126218 líneas / 5342714 bytes | **SE SOSTIENE** |
| g | test-artifacts raíz: 7577 archivos, no 1858 | `find test-artifacts -type f` → **7577**; `git ls-files` → 203; `packages/core/artifacts/quality` → 589/589 | **SE SOSTIENE** |

Un matiz mío sobre LOTE 3 (iconos legacy): el `grep -ral "legacy/<Nombre>"` de Fable **no da exactamente 0** — `packages/core/scripts/pack-inventory.baseline.json` contiene las 13 rutas como strings de inventario congelado (`grep -oE "legacy/[A-Za-z]+"` las lista). No es un consumidor, así que el veredicto se mantiene, y además no es un bloqueo oculto: `pack-inventory-gate.mjs:228-231` trata las entradas removidas como *"allowed shrink"* y el gate corre en CI (`.github/workflows/ci.yml:214`). Lo correcto es re-sembrar el baseline con `--write` después del borrado.

Conclusión del punto: estoy de acuerdo con los 14 desacuerdos en lo sustantivo; el patrón que Fable identifica (el mapeador midió solo imports de producción y omitió contract tests, fixtures internos y páginas probe/torture del showroom) es real y yo mismo lo reproduje en tres casos independientes.

### 2. La lista "SE QUEDA" y las reglas

#### 2a. La lista está incompleta. Agregaría tres filas:

| qué | por qué parece muerto | por qué no lo está |
|---|---|---|
| `tooling/lane-control/` y `tooling/resolution-probe/` | 0 hits en `package.json` (verificado: no hay script npm que los corra) | `core-structure-audit.mjs:187-193,353-375` les fija estructura y ranks por escrito, y `index.mjs:138,502` declara a `lane-control/runtime/tenant-reach` *"el enumerador autoritativo del programa"* |
| la cadena `cascade-extract` → `cascade-materialize` → `cascade-backlog` | ningún pipeline las invoca (0 hits en package.json/CI, confirmado por Fable L408-410) | producen `governance/manifest/cascade/*.json` **versionados en git** (`git ls-files` los lista: `backlog/chrome.anatomy.json`, etc.). Son el generador de evidencia comiteada; borrarlos deja esos JSON sin productor |
| `.claude/agents/*.md` como clase | "nadie los enlaza" | el harness los descubre por convención de carpeta (lo anota el propio Fable en L72). Los dos archivos concretos del LOTE 5 se borran **por contenido falso**, no por falta de enlaces; el criterio "sin enlaces" no debe reaplicarse a otros agentes de esa carpeta |

#### 2b. Las 5 reglas no alcanzan. Sexta regla propuesta:

> **La etiqueta no retira.** Toda declaración de "deprecated", "canonical", "historical" o "legacy" en un docstring, README o comentario tiene que llevar fecha límite y un chequeo mecánico (test o gate) que falle si el artefacto declarado muerto sigue alcanzable pasada esa fecha. Sin eso, la palabra es deuda disfrazada de decisión.

Fundamento — es el mecanismo de acumulación más repetido del árbol y ninguna de las 5 reglas lo cubre:

- `approval-inbox/index.ts:19-21`: `@deprecated ... Will be removed in a future major version` — lleva meses siendo estado permanente (LOTE 9).
- `surfaces/workspace/collection-workspace/index.tsx:4`: *"Single canonical workspace surface..."* — mientras `ListSurface` sigue exportada por la cadena entera hasta `src/index.ts` (U4, verificado por Fable con la cadena `data/list/index.tsx:309` → `src/index.ts:333`).
- `quality-evidence/README.md:8`: *"v1 — HISTORICAL BASELINE ONLY"* — mientras `package.json:680` (`quality-evidence:check`) lo sigue ejecutando (U2).
- `graphics/icons/index.ts:37-42`: los 13 legacy *"intentionally NOT re-exported"* — pero siguen físicamente en el árbol (LOTE 3).

Las reglas 1-5 cubren codemods, gates huérfanos, globs, docs que se autocitan y copias divergidas. Ninguna cubre "declaré el retiro y no lo ejecuté".

### 3. Veredicto general (10 líneas)

1. Los 11 lotes son sólidos: re-verifiqué su evidencia base (carpetas vacías, codemods muertos, iconos, sonda duplicada, platform.css) y se sostiene.
2. Pero ejecutados enteros, **el repo no queda con cada cosa representada una única vez**, porque las duplicaciones más grandes viven en las 9 unificaciones, que el plan deja como "decisión tuya" sin ejecutar: dos compiladores `--ds-*` (U1), dos CLIs de quality-evidence enchufados en CI (U2), los pares de chrome (U3), las recetas de página (U4) y los dos sistemas de iconos (U10).
3. El plan tiene además tres omisiones concretas que ningún asiento anterior cubrió:
4. `audit-presets.mjs` y `audit-report.json` en la **raíz**: muertos por el mismo motivo que el LOTE 2 (escanean `./packages/core/src/composition/components/custom`, ruta inexistente — `test -d` → NO-EXISTE) y **ni siquiera aparecen en el mapa** (`grep "audit-" docs/history/inventories/repository-map/2026-08/index.md` → 0 hits para ambos).
5. `packages/showroom/.tmp/` (32 scripts de depuración): mapeado como borrable (`MAPA:222,306`) pero **sin lote asignado**; viola la valla "no `.tmp` en el worktree final" del propio AGENTS.md.
6. `coverage/` y `coverage-final/`: el mapa las declara borrables (`MAPA:208`) pero no están en las 34 carpetas del LOTE 1 (la tabla suma 7+5+8+4+2+2+2+2+1+1 = 34 sin ellas).
7. Ninguna de las tres omisiones invalida un lote; son borrados de riesgo cero que faltan.
8. En lo metodológico, el documento aprendió su propia lección: la tabla de cuatro columnas y los ocho falsos positivos corregidos son evidencia de que el criterio aplicado ya no es "nadie lo llama".
9. Lo que falta para cumplir el objetivo del dueño: ejecutar las unificaciones (no solo diagnosticarlas), agregar las tres omisiones como lote 12, y adoptar la sexta regla.
10. NO VERIFICADO: no re-conté las 204 afirmaciones del mapa ni las cifras de adopción de apps (bithire/evnto/platform viven fuera de este repo); mi veredicto sobre esos números se apoya en la doble lectura previa, no en recuento propio.
