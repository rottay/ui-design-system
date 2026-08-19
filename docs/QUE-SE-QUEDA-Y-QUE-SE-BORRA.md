# Qué se queda y qué se borra

Documento de decisión. El mapa (`docs/MAPA-DEL-REPO.md`) dice qué hay; este dice
qué hacemos con eso.

Medido el 2026-08-18. Todo lo que aparece acá está verificado contra el árbol real
y revisado por un segundo lector: 188 de acuerdo, 14 desacuerdos, todos corregidos.
Un **tercer lector** independiente lo releyó el 2026-08-19
([`docs/AUDITORIA-KIMI.md`](AUDITORIA-KIMI.md)); sus correcciones ya están
aplicadas acá, y de él salieron el lote 12, la regla 6 y la parte 5.

El documento tiene cinco partes: **1** lo que se borra (12 lotes), **2** lo que
se unifica (13 pares), **3** lo que se queda y por qué no volver a proponerlo,
**4** las reglas que cortan la reincidencia (6), y **5** tres defectos de
cableado — cosas que parecen conectadas y no lo están.

## La regla

> **Cada cosa está representada una única vez.**

De ahí salen cuatro reglas operativas, y de cada una sale una lista concreta:

1. Una capacidad, un dueño. Si dos carpetas hacen el mismo trabajo, una es la
   canónica y la otra desaparece o se convierte en alias declarado.
2. Un archivo sin razón de existir se borra. No hay estado "obsoleto pero
   presente con un cartel".
3. Una carpeta vacía no es una promesa. O tiene contenido o no está.
4. Un documento que describe algo que ya no existe es peor que no tener
   documento. Se corrige el mismo día o se borra.

## Cómo leer los lotes

Cada lote se aprueba entero o no se aprueba. Los lotes están ordenados por riesgo:
el 1 no puede romper nada, el 6 al 9 necesitan trabajo previo.

| campo | significado |
|---|---|
| **qué** | los archivos exactos |
| **por qué** | la prueba de que sobra |
| **riesgo** | qué se puede romper |
| **bloqueo** | trabajo que hay que hacer ANTES de borrar |

Ningún archivo se borra hasta que apruebes el lote.

---

# PARTE 1 — SE BORRA

---

## Evidencia: quién consume qué, en los cuatro lugares donde se consume

Este documento tuvo dos versiones de esta sección y las dos primeras estaban
mal. Vale la pena dejar los tres intentos escritos, porque el error es siempre
el mismo y es el error central de todo el trabajo.

**Intento 1 (mal).** Conté apariciones del nombre en el código de las apps
(`grep -l "\bDetailSurface\b"`). Dio 127. Contaba variables locales, tipos
propios y comentarios que se llaman igual.

**Intento 2 (mal, y es el que casi te hago aprobar).** Conté los `import` reales
de `@rottay/design-system` en las apps. El número era correcto pero el **alcance**
no: una app no es el único consumidor. El propio DS se consume a sí mismo, el
showroom lo consume, y los tests también. Con ese alcance dije que
`approval-inbox` "no rompe nada" — y rompe cinco grupos de cosas acá adentro.

**Intento 3 (el que vale).** Cuatro columnas, contadas por separado:

- **core-ajeno** — archivos de producción de `packages/core/src` que lo importan
  **desde afuera de su propia familia**. Es la columna que decide si algo se
  puede sacar.
- **core-propio** — archivos de su propia carpeta. No cuentan como consumo.
- **tests** — tests, stories y fixtures del core.
- **showroom** y **apps** — los dos consumidores externos.

Y un cuarto error de método, que encontró Kimi y confirmé: contar solo
`import { X }` **pierde los imports por defecto**. `tree-view` consume el
primitive `Tree` como `import ModernTree from '.../Tree/engines/modern'`. Con la
primera regex, `Tree` daba cero. Los números de abajo incluyen imports por
defecto.

### La tabla

| símbolo | core-ajeno | tests | showroom | apps |
|---|---|---|---|---|
| `PageShellSurface` | **29** | 1 | 2 | 1 |
| `SurfaceEmptyState` | **27** | 2 | 2 | 1 |
| `Empty` | 17 | 6 | 6 | 27 |
| `Tooltip` | 12 | 3 | 6 | 199 |
| `PatternFilterPanel` | 9 | 3 | 4 | 1 |
| `PatternStatsGrid` | 5 | 5 | 3 | 1 |
| `Layout` | 4 | 5 | 6 | 0 |
| `Drawer` | 4 | 3 | 4 | 8 |
| `Sheet` | 3 | 7 | 4 | 0 |
| `Popover` | 3 | 8 | 6 | 0 |
| `Notification` | 3 | 3 | 1 | 2 |
| `Statistic` | 2 | 7 | 4 | 0 |
| `Switch` | 2 | 5 | 8 | 35 |
| `PatternListToolbar` | 2 | 4 | 4 | 0 |
| `Tree` | 1 | 9 | 5 | 0 |
| `ColumnMenu` | 1 | 2 | 3 | 2 |
| `WorkspaceShell` | 1 | 3 | 3 | 0 |
| `PatternPageShell` | 1 | 2 | 4 | 6 |
| `PatternEmptyState` | 1 | 2 | 3 | 5 |
| `CollectionWorkspaceSurface` | 0 | 6 | 3 | **61** |
| `DataTerminalCard` | 0 | 2 | 3 | 57 |
| `MonoStat` | 0 | 3 | 3 | 7 |
| `Toggle` | 0 | 3 | 4 | 8 |
| `Steps` | 0 | 4 | 5 | 6 |
| `AppShell` | 0 | 1 | 2 | 3 |
| `DetailSurface` | 0 | 4 | 3 | 3 |
| `RecordWorkbenchSurface` | 0 | 2 | 3 | 3 |
| `TableToolbar` | 0 | 2 | 3 | 3 |
| `Toast` | 0 | 6 | 9 | 3 |
| `TreeView` | 0 | 0 | 0 | 2 |
| `PatternTimeline` | 0 | 1 | 3 | 2 |
| `ListToolbar` | 0 | 0 | 0 | 1 |
| `SavedViewsMenu` | 0 | 1 | 3 | 1 |
| `FieldFiltersPanel` | 0 | 3 | 3 | 1 |
| `Timeline` | 0 | 3 | 5 | 3 |
| `ListSurface` | 0 | 9 | 4 | 0 |
| `SidebarSurface` | 0 | 4 | 3 | 0 |
| `EmptyStateSurface` | 0 | 2 | 2 | 0 |
| `StatsHeader` | 0 | 3 | 4 | 0 |
| `Stepper` | 0 | 8 | 5 | 0 |
| `HoverCard` | 0 | 4 | 4 | 0 |
| `Calendar` | 0 | 3 | 5 | 0 |
| `CalendarView` | 0 | 0 | 0 | 0 |
| `PatternColumnSettings` | 0 | 0 | 2 | 0 |
| `DecisionInboxSurface` | 0 | 3 | 3 | 0 |
| `PatternApprovalInbox` | 0 | 0 | 2 | 0 |
| `ApprovalInbox` | 0 | 0 | 0 | 0 |
| `Message` | 0 | 0 | 0 | 0 |

Escala del lado de las apps: **2000 archivos** de app importan del DS y usan
**546 símbolos**. bithire 1240, platform 441, evnto 319, y `app-bithire-desktop`
**0** — esa app no consume el DS en absoluto.

### Cómo se lee

Un cero en **core-ajeno** no autoriza a borrar: hay que mirar las cuatro
columnas. Lo que sí decide es lo contrario — **un número distinto de cero en
core-ajeno prohíbe el retiro barato**, porque rompe el propio design system.

Cuatro retiros que yo había propuesto por "cero importadores" están prohibidos
por esta columna: `Sheet` (3), `Popover` (3), `Statistic` (2) y `Tree` (1).

Y hay un caso que se lee al revés de lo que yo escribí: `Statistic` tiene 0 en
apps y 2 acá adentro. No es "un primitive que nadie usa"; es un primitive que
solo usa el propio DS y ninguna app.

## LOTE 1 — Carpetas vacías

**Verdicto: BORRAR. Riesgo: ninguno.**

**qué:** 34 carpetas con cero archivos dentro, contadas recursivamente.

| grupo | carpetas | qué prometían |
|---|---:|---|
| `infrastructure/runtime/presentation-profiles/**` | 7 | calco de `foundation/presets/product-profiles/`, que sí existe y funciona |
| `infrastructure/runtime/graphics/continuous-runtime-governor/**` | 5 | un gobernador de runtime continuo que nunca se escribió |
| `entrypoints/public/{patterns,primitives,structures,surfaces}/{contracts,runtime}` | 8 | subpaths públicos que el `package.json` no declara |
| `charts/**/renderers/{area,waterfall,sparkline,histogram}/tests` | 4 | tests de renderer que no existen |
| `graphics/icons/runtime/adapters/` + `phosphor-ssr/` | 2 | resto de la relocalización del adaptador de iconos |
| `motion/**/particles/runtime/governance/` + `animation-lease/` | 2 | el archivo real vive en `runtime/canvas/governance/animation-lease/` |
| `structures/foundation/chrome/runtime/profile-defaults/{presentation-recipes,attributes}` | 2 | — |
| `infrastructure/runtime/theming/foundation/color/` + `oklch/` | 2 | — |
| `patterns/data/data-table/engines/modern/styles/` | 1 | — |
| `.../modern-rescue/KIMI-ANNOTATIONS/inbox/` | 1 | buzón de anotaciones de un agente |

**por qué:** cero archivos. `grep -r presentation-profiles` da cero referencias en
todo el repo. Git no versiona carpetas vacías, así que ni siquiera aparecen en un
`git status`: existen solo en tu disco y en el de quien las creó.

**riesgo:** ninguno. No hay nada que importar.

**bloqueo:** ninguno.

---

## LOTE 2 — Los codemods de febrero de `scripts/` (raíz)

**Verdicto: BORRAR. Riesgo: ninguno.**

**qué:** 17 de los 24 archivos de `scripts/` en la raíz del repo:

```
add-accent-bars.mjs        fix-glass-adoption.mjs      fix-shadow-helpers.mjs
add-hover-transforms.mjs   fix-hardcoded-borders.mjs   fix-transition-tokens.mjs
add-style-memo.mjs         fix-hover-transforms-v2.mjs fix-usememo-v2.mjs
adopt-card-style.mjs       fix-null-array-guards.mjs   audit-helper-gaps.mjs
adopt-helpers.mjs          fix-rgba-overlays.mjs       helper-gaps-report.json
fix-focus-rings.mjs        fix-fontsize.mjs
```

**por qué:** los 17 escriben sobre `packages/core/src/components/custom/`. Esa ruta
**no existe**: `ls packages/core/src/components` → *No such file or directory*.
Desapareció en la reorganización del árbol. Son transformaciones de un solo uso que
se corrieron una vez en febrero, se commitearon y nunca se retiraron. Correr
cualquiera de ellos hoy no hace nada o falla.

**se quedan** los 7 que sí tienen trabajo: `dependency-honesty.mjs` (+ test),
`effect-registry-audit.mjs` (+ test, y este sí corre en CI), `roadmap-status.mjs`
(+ test), `roadmap-commercial-status.mjs`.

**riesgo:** ninguno. Ningún `package.json` los nombra.

**bloqueo:** ninguno.

---

## LOTE 3 — Los 13 iconos legacy no reexportados

**Verdicto: BORRAR. Riesgo: ninguno.**

**qué:** 13 de las 15 carpetas de `graphics/icons/presentation/legacy/`:
`UserIcon`, `UsersIcon`, `CheckIcon`, `XIcon`, `InfoIcon`, `ChevronDownIcon`,
`ChevronUpIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `SearchIcon`, `EyeIcon`,
`EyeOffIcon`, `CameraIcon`.

**por qué:** el propio `graphics/icons/index.ts:37-42` lo dice por escrito:

> *"The following legacy components have catalog equivalents with the same name.
> They are intentionally NOT re-exported here to avoid conflicts."*

Son iconos dibujados a mano que Phosphor ya cubre. `grep -ral "legacy/<Nombre>"`
da **0** para los 13. El único importador de la carpeta `legacy/` es ese
`index.ts`, y solo saca de ahí `AlertIcon` y `LoaderIcon`.

**se quedan:** `AlertIcon` y `LoaderIcon`, que sí se reexportan.

**el dato que lo confirma:** los nombres sí están vivos —  las apps importan
`UsersIcon` 83 veces, `CheckCircleIcon` 73, `SearchIcon` y compañía. Pero todos
resuelven a `presentation/catalog/`, que es Phosphor por debajo
(`catalog/user/index.ts:29`). Ni un solo import llega a `legacy/`. Es el peor
caso posible de segunda copia: un nombre muy usado con dos implementaciones,
donde la copia dibujada a mano es la que nadie alcanza.

**riesgo:** ninguno. No salen por ningún export público.

**bloqueo:** ninguno.

---

## LOTE 4 — El monolito duplicado de la sonda de cascada

**Verdicto: BORRAR 2 archivos. Riesgo: ninguno. LEER LA ADVERTENCIA.**

**qué:** exactamente dos archivos:

```
packages/core/scripts/quality-evidence/programs/modern-rescue/probe/cascade-probe.mjs       (2.729 líneas)
packages/core/scripts/quality-evidence/programs/modern-rescue/probe/cascade-probe.test.mjs  (692 líneas)
```

**por qué:** hay dos implementaciones completas de la misma sonda de dos patas
(simbólica + Chromium), con el mismo nombre de archivo. La de la raíz
(`modern-rescue/cascade-probe.mjs`, 776 líneas) está partida en módulos y los
importa. La de adentro es un monolito que reimplementa todo con solo builtins de
node. Sobra la segunda.

**ADVERTENCIA — no borrar la carpeta `probe/`.** Los otros cinco archivos
(`css-parse.mjs`, `css-model.mjs`, `leg1-symbolic.mjs`, `leg2-chromium.mjs`,
`value-eval.mjs`) son **dependencia directa** de la sonda de la raíz, que los
importa en sus líneas 76-84. La primera versión de este documento decía "borrar
`probe/`" y eso rompía la sonda de arriba. Lo encontró el segundo lector.

**riesgo:** ninguno una vez acotado a esos dos archivos.

**bloqueo:** ninguno.

---

## LOTE 5 — Documentos que describen un repo que ya no existe

**Verdicto: BORRAR (o mover a `docs-engineering/archive/`). Riesgo: ninguno.**

**qué (a):** los cuatro `.md` históricos de la raíz: `BACKLOG.md`,
`DESIGN_SYSTEM_FINAL_REVIEW.md`, `DOCUMENTATION_ENHANCEMENT.md`,
`WAVE_4_PRIMITIVES.md`.

**por qué (a):** son fotos de un momento (una review "final" que no fue final, una
ola de primitives que terminó, un plan de mejora de documentación ya ejecutado). El
backlog vivo es `roadmap/registry.json`. Ninguno se actualiza; los cuatro describen
un árbol que ya cambió. Además eran los únicos que enlazaban
`docs/ARCHITECTURE.md`, o sea que la referencia de arquitectura vivía colgada de
cuatro documentos muertos — ya lo arreglé enlazándola desde el `README.md`.

**qué (b):** `.claude/agents/componentes-agent.md` y
`.claude/agents/storybook-agent.md`.

**por qué (b):** no es que tengan versiones viejas: describen **otro sistema de
diseño**. `componentes-agent.md` declara que los componentes son *"wrappers de Ant
Design"* que *"re-exportan componentes de Ant Design manteniendo su API completa"*
con *"compatibilidad 100 % con Ant Design"*, y enumera *"8 temas predefinidos:
Spotify, Facebook, GitHub, Slack, Notion, Linear, Netflix, Base"*. Nada de eso
existe: hoy hay tres engines físicos (`classic` es el único que envuelve Ant,
`modern` es Rottay nativo, `rustic` es CSS a mano) y los brand themes en fuente
son `bithire`, `evnto` y `rottay`. Un agente que lea ese archivo va a escribir
wrappers de Ant en el engine equivocado. Los datos de versión también están
vencidos (React 18.2.0 → 19.2.5, Ant 5.21.0 → 5.29.3), pero eso es lo de menos.

Nadie los invoca ni los enlaza. Este lote es el ejemplo más caro de la regla 4:
son instrucciones activas para un agente, no documentación pasiva.

**riesgo:** ninguno.

**bloqueo:** ninguno. Decisión tuya: borrar, archivar, o reescribirlos contra el
modelo de engines actual.

---

## LOTE 6 — `styles/platform.css`

**Verdicto: BORRAR, pero hay bloqueo. Riesgo: medio.**

**qué:** `packages/core/styles/platform.css` (5,3 MB).

**por qué:** es byte-idéntico a `styles/rottay.css`. Es el residuo del renombre
`platform` → `rottay`. El generador `build-vertical-css.mjs` declara en su
cabecera que escribe `styles/{index,modern,rottay,bithire,evnto}.css` — platform
no está en la lista, o sea que **ya nadie lo genera**. El `package.json` tampoco
lo exporta: `./styles/default` y `./styles/rottay` apuntan los dos a
`dist/rottay.css`. Y `platform` ya no es un vertical del roster.

**bloqueo:** el manifiesto de modern-rescue tiene **802 citas** a
`packages/core/styles/platform.css:<línea>` repartidas en **19 archivos de
familia**. Hay que reanclarlas a `rottay.css` antes de borrar. Como los dos
archivos son byte-idénticos, los números de línea se mantienen: es un
`sed s#styles/platform.css#styles/rottay.css#g` sobre esos 19 archivos, más
correr la validación del manifiesto.

**riesgo:** si se borra sin reanclar, 802 punteros de evidencia quedan rotos.

**además:** el `README.md` de la raíz todavía documenta
`@rottay/design-system/styles/platform` como export. Ese export no existe. Va en
el LOTE 10.

---

## LOTE 7 — Los dos árboles `test-artifacts/`

**Verdicto: NECESITA TU DECISIÓN. Riesgo: pérdida de evidencia.**

**qué:** dos árboles con el mismo nombre y las mismas subcarpetas
(`release/`, `rottay-design-platform/`):

| | archivos | en git | peso |
|---|---:|---:|---:|
| `test-artifacts/` (raíz) | 7.577 | 203 | 479 MB |
| `packages/core/test-artifacts/` | 589 | 589 | 49 MB |

**por qué:** el `.gitignore` ignora `test-artifacts/*` y después re-admite a mano
una lista corta de artefactos "autoritativos". Resultado: el **97 %** de los
archivos y prácticamente todo el peso **no está versionado**. De los 7.577 de la
raíz, 1.054 son un `node_modules/` de una release embebida. Es un directorio de
descarga, no un repositorio de evidencia.

**la pregunta que tenés que contestar:** ¿cuál de los dos es el árbol
autoritativo? Los 203 archivos versionados de la raíz son evidencia citada por
gates; los 528 MB restantes son basura acumulada de corridas.

**propuesta:** un solo árbol, `packages/core/test-artifacts/` (que está 100 %
versionado), y la raíz se limpia salvo los 203 archivos que gates citan.

**bloqueo:** tu decisión.

---

## LOTE 8 — El espejo TypeScript de los tokens

**Verdicto: BORRAR, con una migración previa. Riesgo: alto sin el bloqueo.**

**qué:** el grueso de `packages/core/src/foundation/tokens/ts/`.

**por qué:** es un espejo en TypeScript de lo que el CSS ya define. 28 carpetas
repiten nombres que el CSS tiene con el valor real; el TS solo guarda la cadena
`var(--ds-...)`. 31 de esas carpetas no las importa nadie. El barril entero tiene
**un** importador de producción, y solo para dos funciones de Collapse. Todo lo
demás es duplicación de una autoridad que ya vive en el CSS.

Esto es la mala práctica en estado puro: se mantiene una segunda copia de la
verdad que no pinta nada, y cada cambio de token hay que hacerlo dos veces o
divergen.

**bloqueo:** mover las dos funciones de Collapse a su dueño real antes de tocar
el barril. Después, borrar por tandas verificando `tsc` en cada una.

**riesgo:** alto si se hace de golpe; bajo por tandas.

---

## LOTE 9 — Lo ya declarado obsoleto en el propio código

**Verdicto: BORRAR. Riesgo: bajo (es API pública).**

**qué:** `ui/patterns/workflow/approval-inbox/`.

**por qué:** su propio `index.ts:19-21` dice
*"@deprecated Use `DecisionInboxSurface` instead... Will be removed in a future
major version."* El reemplazo existe y funciona. "Un futuro major" lleva meses
siendo el estado permanente. La regla 2 dice que no hay estado "obsoleto pero
presente": o se borra o el cartel es mentira.

**riesgo:** sale por el export público. Necesita nota de breaking change.

**bloqueo de las apps: resuelto.** `ApprovalInbox` **0** y
`PatternApprovalInbox` **0** en los 2000 archivos de app.

**bloqueo nuevo, dentro del repo: NO resuelto.** Dije que "no rompe nada" y era
falso; era el alcance de la medición otra vez. Acá adentro sí tiene consumidores:

- el showroom, en 4 archivos (`pattern-preview-fixtures.tsx`, `navigation.ts`,
  `registry/patterns.ts`, y el probe `r2-behavior`);
- 3 tests propios y los dos engines;
- la skin `runtime/engines/modern/skin/approval-inbox.css`, importada desde
  `facade/entrypoints/base.css` y `styles.css`;
- `supplier-contract.json` y los manifiestos de modern-rescue, que fallan
  cerrado.

Sigue siendo borrable, pero es un lote con cinco grupos de pasos, no un `rm`.

**y ojo con el reemplazo:** `DecisionInboxSurface`, que el propio `@deprecated`
señala como sustituto, tiene **0** en las cuatro columnas. Borrar el viejo está
bien; declarar que el nuevo "ya funciona" no, porque no lo usa nadie.

---

## LOTE 10 — Documentación que describe cosas inexistentes

**Verdicto: CORREGIR (no borrar). Riesgo: ninguno.**

**qué y por qué:**

| dónde | qué dice | qué pasa |
|---|---|---|
| `ui-design-system/CLAUDE.md:154,201-202` | manda adjudicar "los 11 owners de `ui/patterns/commercial/`" | esa carpeta **no existe**; `find -type d -name "*commercial*"` no devuelve nada. Los 11 ya se reclasificaron. |
| `ui-design-system/CLAUDE.md:243-244` | manda decidir sobre "los 4 componentes inventariados como `surface-composition`" | tampoco existe |
| `README.md:169` | documenta el export `@rottay/design-system/styles/platform` | ese export no existe en el `package.json` |

Cada una de estas líneas manda a un agente a trabajar sobre algo que no está. Es
la regla 4 incumplida tres veces; la cuarta, `.claude/agents/*.md`, está tan
desactualizada que no se corrige: va al LOTE 5.

**Ya corregidas** (commit de este documento): las dos de `CLAUDE.md`, que ahora
apuntan a este par de documentos en vez de a carpetas inexistentes, y la del
`README.md`, cuya tabla de exports ahora coincide con el `package.json`
(`styles/default`, `styles/rottay`, `styles/bithire`, `styles/evnto`,
`styles/modern`).

**bloqueo:** ninguno.

---

## LOTE 11 — Alias de `package.json` que nadie usa

**Verdicto: BORRAR. Riesgo: ninguno.**

**qué:**

- >=11 alias `pnpm` que duplican una invocación que `ci-gates.manifest.mjs` ya hace
  directo con `node scripts/X.mjs`.
- `parity:theme:check` y `theme-parity:check`: dos nombres, comando idéntico.
- `cra-17-integral-gate.mjs`: importa y reejecuta `cra-17-packaging-license-gate.mjs`
  y `cra-17-public-declaration-gate.mjs`, que además corren por separado. El
  agregado no corre nunca.

**por qué:** dos vías de invocación para el mismo gate significa que cambiar una
no cambia la otra. Una sola vía: el manifiesto de gates.

**bloqueo:** ninguno.

---

## LOTE 12 — Lo que los tres documentos anteriores no vieron

**Verdicto: BORRAR. Riesgo: ninguno.**

Tres borrados de riesgo cero que ningún lote había reclamado. Salieron del tercer
lector, y los verifiqué uno por uno.

**a) `audit-presets.mjs` y `audit-report.json` en la raíz del repo.** Están
muertos por exactamente el mismo motivo que los 17 codemods del lote 2: escanean
`packages/core/src/composition/components/custom`, una ruta que no existe
(`test -d` → no existe). El `.json` es del 19 de febrero. Y no aparecen en el
mapa: `grep "audit-presets\|audit-report" docs/MAPA-DEL-REPO.md` da **0**. El
mapa que dice qué hace cada carpeta se saltó dos archivos de la raíz.

**b) `packages/showroom/.tmp/` — 32 scripts de depuración.** El mapa los marca
borrables en dos lugares y ningún lote los tomó. Además hay una valla escrita en
`AGENTS.md` que prohíbe `.tmp` en el árbol de trabajo final. Están ignorados por
git, así que el borrado no toca historia.

**c) `coverage/`, `coverage-final/` y `packages/core/coverage/`.** El mapa las
declara borrables; la tabla del lote 1 suma 34 carpetas sin ellas. Son salida de
herramienta, regenerable.

**riesgo:** ninguno en los tres casos.

**bloqueo:** ninguno.

---

# PARTE 2 — SE UNIFICA (una queda canónica, la otra se va)

Acá no hay borrado inmediato: hay que declarar cuál es la canónica y migrar. Cada
fila es una decisión tuya.

## U1 — Dos compiladores emitiendo los mismos canales `--ds-*`

`infrastructure/compilers/kernel/runtime/appearance/` y `.../brand-theme/`.

El `CLAUDE.md` dice que el compilador de marca es "the single lowering from Theme
to CSS variables". Son dos. El camino real de base de datos ya usa solo
`brand-theme`.

**Propuesta:** `brand-theme` es el canónico; `appearance` se absorbe o se declara
explícitamente como capa de compatibilidad con fecha de retiro.

## U2 — Dos CLIs de quality-evidence, los dos enchufados

`quality-evidence/cli.mjs` (v1) corre por `quality-evidence:check`.
`quality-evidence/v2/cli.mjs` corre por `quality-evidence:v2:*`. v2 no reusa nada
de v1.

El `README.md` del propio directorio declara que v1 es *"historical baseline only,
may not be cited as coverage, quality or premium status"* — y el comando lo sigue
ejecutando en CI. Un baseline histórico que corre en CI no es histórico.

**Propuesta:** v2 canónico; desenchufar `quality-evidence:check`.

## U3 — El chrome de colección, escrito dos veces

| pattern | structure | admisión escrita |
|---|---|---|
| `list-toolbar` | `table-toolbar` | sí: *"Unlike the heavier `ListToolbar` pattern..."* |
| `column-settings` | `column-menu` | sí: *"Key differences from ColumnSettingsDropdown"* |
| `saved-views` | `saved-views-menu` | sí: *"Different from the SavedViewsBar pattern (also in DS)"* |
| `filter-panel` | `field-filters-panel` | no (su comentario contrasta con `FilterBuilder`) |

Tres de los cuatro pares tienen, en el código, un comentario que nombra a su
duplicado. Nadie decidió cuál gana; se documentó el empate.

**La adopción NO confirma lo que yo había propuesto.** Con las cuatro columnas:

| par | lado `patterns/` (core-ajeno / apps) | lado `structures/` (core-ajeno / apps) |
|---|---|---|
| toolbar | `PatternListToolbar` **2** / 0 | `TableToolbar` **0** / 3 |
| columnas | `PatternColumnSettings` **0** / 0 | `ColumnMenu` **1** / 2 |
| vistas guardadas | (no se exporta con ese nombre) | `SavedViewsMenu` **0** / 1 |
| filtros | `PatternFilterPanel` **9** / 1 | `FieldFiltersPanel` **0** / 1 |

`PatternFilterPanel` lo consumen nueve archivos de producción del propio DS:
`data-table`, y las surfaces `audit`, `list`, `report`, `search`, `kanban`,
`collection-workspace`, `decision-inbox`. Retirarlo rompe el design system por
dentro. `PatternListToolbar` tiene 2.

**Propuesta corregida:** la regla "el chrome de página es tier `structures/`, así
que los de `patterns/` se retiran" **no se sostiene**. Lo que se puede hacer hoy
sin romper nada es retirar `PatternColumnSettings` (0 en las cuatro columnas
salvo 2 páginas del showroom). Para los otros tres pares hay que decidir el
canónico **y migrar los consumidores internos primero**; no es un borrado, es una
refactorización con orden.

## U4 — Dos recetas de página completas para la misma pantalla

- `surfaces/data/list` vs `surfaces/workspace/collection-workspace`
- `surfaces/data/detail` vs `surfaces/workspace/record-workbench`

`collection-workspace/index.tsx:4` se autodeclara *"Single canonical workspace
surface for all collection/list/table screens"* — y `ListSurface` sigue exportada
por la cadena entera hasta `src/index.ts`. Se escribió la palabra "canónica" y no
se retiró la otra.

**La adopción parte el caso en dos mitades distintas:**

| par | core-ajeno | tests | showroom | apps |
|---|---|---|---|---|
| `ListSurface` | 0 | 9 | 4 | **0** |
| `CollectionWorkspaceSurface` | 0 | 6 | 3 | **61** |
| `DetailSurface` | 0 | 4 | 3 | 3 |
| `RecordWorkbenchSurface` | 0 | 2 | 3 | 3 |

**Propuesta (mitad de colección):** cumplir lo que el archivo ya declara.
`ListSurface` tiene cero consumidores en producción y cero en apps, contra 61.
Se retira — pero arrastra 9 tests del core, 4 páginas del showroom, un fixture
del brand studio y dos gates de API pública. Es un lote de trabajo, no un `rm`.

**Propuesta (mitad de detalle): decisión tuya, no la tomo yo.** Es 3 contra 3, y
las dos tienen cero consumo interno. Acá "cumplir lo que el archivo declara" no
aplica, porque ninguna es canónica en la práctica. Las opciones honestas son
elegir una por diseño y migrar 3 archivos, o admitir que la pantalla de detalle
todavía no tiene receta canónica y no fingir que sí.

## U5 — Seis marcos de página

`Layout`, `page-shell`, `app-shell`, `workspace-shell`, `page-shell-surface`,
`sidebar-surface`. Matiz real: `page-shell-surface` es un adaptador autodeclarado
y `workspace-shell` dice de sí mismo *"This is page chrome, not a page recipe"*.
No son seis implementaciones independientes, pero el solape de propósito es real y
un consumidor no tiene forma de elegir.

**Los ceros que yo había citado eran del alcance equivocado.** Con las cuatro
columnas, dos de los "cero" son los dos componentes más consumidos del grupo:

| marco | core-ajeno | tests | showroom | apps |
|---|---|---|---|---|
| `PageShellSurface` | **29** | 1 | 2 | 1 |
| `Layout` | 4 | 5 | 6 | 0 |
| `WorkspaceShell` | 1 | 3 | 3 | 0 |
| `PatternPageShell` | 1 | 2 | 4 | 6 |
| `AppShell` | 0 | 1 | 2 | 3 |
| `SidebarSurface` | 0 | 4 | 3 | 0 |

`PageShellSurface`, que yo había anotado con 1, sostiene **29 surfaces de
producción** más `HeaderSurface`. `WorkspaceShell`, que había anotado con 0,
sostiene a `CollectionWorkspaceSurface`. Ninguno de los dos se toca.

**Propuesta corregida:** no son seis duplicados, son capas. Lo que falta no es
borrar sino escribir el árbol de decisión: cuál usar para qué. Los únicos
candidatos a retiro con daño acotado son `Layout` (0 en apps, pero 4 consumidores
internos que habría que migrar) y `SidebarSurface`.

## U6 — Cuatro vocabularios de "no hay nada acá"

`primitives/display/Empty`, `patterns/feedback/empty-state`,
`structures/feedback/surface-lifecycle` (estado EMPTY),
`surfaces/presentation/pages/experience/empty-state`. Uno por tier.

**Adopción, cuatro columnas:**

| pieza | core-ajeno | tests | showroom | apps |
|---|---|---|---|---|
| `SurfaceEmptyState` | **27** | 2 | 2 | 1 |
| `Empty` | 17 | 6 | 6 | **27** |
| `PatternEmptyState` | 1 | 2 | 3 | 5 |
| `EmptyStateSurface` | 0 | 2 | 2 | 0 |

No hay un huérfano acá: el más usado adentro es `SurfaceEmptyState` (27 surfaces)
y el más usado afuera es `Empty` (27 archivos de app). Son dos hubs distintos
para dos públicos distintos.

**El defecto real no es la duplicación de nombres, es que la cadena no delega
del todo:** `EmptyStateSurface` → `SurfaceEmptyState` → `PatternEmptyState` sí
delega, pero `PatternEmptyState` **no** delega en `Empty`: duplica el markup en
su engine modern. Ahí está la segunda copia, no en los cuatro nombres.

**Propuesta corregida:** cerrar la delegación que falta (que `PatternEmptyState`
dibuje con `Empty`), lo cual exige agrandar la API de `Empty` con slots de
título, icono y acción. Ningún retiro barato en este grupo.

## U7 — Otros duplicados de primitives (decisión de API pública)

| par | qué comparten |
|---|---|
| `Switch` / `Toggle` | los dos headers dicen "toggle control for on/off states" |
| `Steps` / `Stepper` | proceso por pasos; los dos declaran navegación por clic |
| `Message` / `Notification` / `Toast` | tres formas de avisar |
| `Drawer` / `Sheet` | `Sheet` se diferencia solo por lo táctil (drag handle, snap points) |
| `Popover` / `HoverCard` / `Tooltip` | `Popover` acepta ReactNode, `Tooltip` solo texto |
| `Statistic` / `mono-stat` / `data-terminal-card` | una cifra grande con animación |
| `stats-grid` / `stats-header` | tira de tarjetas de métrica |
| `Calendar` / `calendar-view`, `Timeline` / `timeline`, `Tree` / `tree-view` | el primitive dibuja, el pattern agrega datos |

Los tres últimos grupos son duplicación legítima de tier (primitive sin datos vs
pattern con datos) **si está escrita en la doc**. Hoy no lo está, así que un
consumidor elige al azar.

**Cuatro de los retiros que yo propuse por "cero importadores" están
prohibidos: rompen el propio design system.**

| par | core-ajeno | apps | veredicto |
|---|---|---|---|
| `Drawer` 4 / `Sheet` **3** | 8 / 0 | **no retirar `Sheet`**: lo usan `app-shell`, `widget-board` y `adaptive-overlay` |
| `Tooltip` 12 / `Popover` **3** / `HoverCard` 0 | 199 / 0 / 0 | **no retirar `Popover`**: lo usan `list-toolbar` y `column-menu`. Solo `HoverCard` es retirable |
| `Statistic` **2** / `MonoStat` 0 / `DataTerminalCard` 0 | 0 / 7 / 57 | **no retirar `Statistic`**: lo usa `stats-header`. Y el dato interesante se mantiene: es un primitive que solo consume el propio DS |
| `Tree` **1** / `TreeView` 0 | 0 / 2 | **no retirar `Tree`**: `tree-view` lo compone por import por defecto |
| `Steps` 0 / `Stepper` 0 | 6 / 0 | `Stepper` sí es retirable: cero en las cuatro columnas salvo tests y showroom propios |
| `PatternStatsGrid` 5 / `StatsHeader` 0 | 1 / 0 | `StatsHeader` retirable, pero primero hay que ver que no sea el que consume `Statistic` |
| `Calendar` 0 / `CalendarView` 0 | 0 / 0 | ninguno se usa en ningún lado: decisión de producto, no de limpieza |

*Fusión de verdad, con dos lados vivos:* `Switch` (2 internos, 35 apps) contra
`Toggle` (0 internos, 8 apps, todas bithire). Es el único par del grupo que
rompe código de producto real.

*No es duplicación sino documentación:* `Message` **0 en las cuatro columnas**,
`Notification` 3/2, `Toast` 0/3 — pero la función `toast()` tiene **214**
importadores en apps. Nadie usa los componentes; todos usan la función. Existen
además `message()` y `notification()` exportadas. El problema es que hay dos
formas de la misma cosa y la doc no dice cuál es la buena.

**Propuesta corregida:** retirables hoy `HoverCard` y `Stepper`. `Sheet`,
`Popover`, `Statistic` y `Tree` **se quedan**. `Switch`/`Toggle` es una fusión
con migración de 8 archivos de bithire. El grupo de avisos se documenta.

## U10 — Dos sistemas de iconos conviviendo en producción

Este no salió del mapa; salió de medir las apps, y es el caso más claro de "dos
sistemas dentro de uno".

La documentación dice que el código nuevo usa nombres semánticos independientes
del proveedor (`<Icon name="action.search" />`) y que el catálogo con forma de
Lucide es solo compatibilidad. Los números dicen otra cosa:

| sistema | símbolos distintos | archivos que lo importan |
|---|---|---|
| fachada semántica `Icon` | 1 | **704**, todos en bithire |
| nombres con forma de vendor (`UsersIcon`, `AlertTriangleIcon`, …) | **153** | **1770** (platform 888, evnto 606, bithire 276) |

`app-evnto` y `app-platform` importan la fachada semántica **cero** veces. El
sistema declarado "de compatibilidad" es, medido, el sistema mayoritario: más
del doble de uso y 153 nombres de superficie pública contra uno.

No es un borrado, es una migración con costo real, y hasta que se haga la
documentación está describiendo una intención, no el repo.

**Propuesta:** o se migra evnto y platform a la fachada y el catálogo pasa a ser
de verdad compatibilidad, o se admite por escrito que hay dos entradas
soportadas. Lo que no puede seguir es que la doc afirme una cosa y el código haga
la otra.

## U8 — Dos motores de roadmap

`roadmap-status.mjs` (3.177 líneas) y `roadmap-commercial-status.mjs` (304).
Corrección respecto de la primera versión de este documento: **sí comparten
código**. La cabecera del comercial dice *"Copied from scripts/roadmap-status.mjs
(2026-07-07) ... Byte-identical EXCEPT for exactly TWO functional divergences"* y
`comm -12` da 191 líneas idénticas. Es una copia divergida, no una
reimplementación.

El aislamiento fue decisión tuya firmada el 2026-07-07, así que esto **se queda**.
Lo que cambia es la forma: las dos divergencias funcionales se parametrizan y el
comercial pasa a llamar al motor, en vez de ser una copia que ya perdió el 90 % de
las capacidades del original.

## U9 — La arquitectura escrita en tres lugares

`docs/ARCHITECTURE.md`,
`docs-engineering/engineering/design-system/architecture/README.md`, y
`packages/core/ARCHITECTURE.md`. Los dos primeros solapan en cuatro secciones y
ninguno enlaza al otro.

**Corrección del tercer lector, verificada:** el tercer documento es
`packages/core/ARCHITECTURE.md`, no `packages/core/docs/`. Y la frase que manda
usar `docs-engineering/` como fuente está en el `CLAUDE.md` del monorepo padre,
no en el de este repo — este repo, clonado solo, se queda sin arquitectura si
`docs/ARCHITECTURE.md` se convierte en un puntero a un repo externo. Hay cinco
enlaces internos apuntando a él.

**Propuesta corregida:** `docs-engineering/` es la fuente de la arquitectura del
ecosistema; `docs/ARCHITECTURE.md` se queda con la arquitectura **de este
paquete** y enlaza a la otra, en vez de ser un puntero vacío.
`packages/core/ARCHITECTURE.md` se pliega dentro de él.

---

## U11 — Dos `Link` públicos con props incompatibles

Hay dos contratos `LinkProps` distintos, los dos exportados:

- `ui/primitives/navigation/Link/contracts/index.ts:84` extiende
  `AnchorHTMLAttributes<HTMLAnchorElement>`.
- `ui/primitives/display/Typography/contracts/index.ts:398` extiende
  `BaseComponentProps, EngineAwareProps, TypographyCraftProps`.

El segundo es el que sale publicado con el nombre `Link` por el subpath
`./primitives/typography` (`entrypoints/public/primitives/typography/index.ts:4`),
mientras el primero se publica como `NavLink` — y su propio barril
(`ui/primitives/navigation/index.ts:67-71`) dice que *"NavLink is the canonical
navigation-primitive name"*.

Es decir: quien importa `Link` del paquete recibe el que **no** es el canónico
de navegación, con props que no son intercambiables con el otro.

**Propuesta:** un solo nombre `Link` para el primitive de navegación; el de
Typography pasa a llamarse `TextLink` en el subpath público, o deja de
exportarse con ese nombre. Es cambio de API pública: necesita tu firma.

---

## U12 — `command-center` reescribió el vocabulario de dashboard, y ya divergió

`ui/surfaces/presentation/pages/workspace/command-center/index.tsx` define en sus
líneas 40 y 57 sus propios `StatItem` y `ActivityItem`, dos conceptos que ya
tienen dueño:

| concepto | dueño | forma | forma en command-center |
|---|---|---|---|
| `StatItem` | `structures/dashboard/stats-header/contracts/index.ts:41` | `change?: number` + `direction` aparte | `change?: { value, direction }` |
| `ActivityItem` | `structures/dashboard/insights/foundation/contracts/index.ts:21` | `time` / `type` | `timestamp` / `user` |

No es una copia: **ya son formas distintas**, así que hoy no se pueden
intercambiar. Y `command-center` no importa ninguna de las dos structures — solo
primitives.

Esto además corrige a U7: ahí se propone retirar `stats-header` sin notar que su
vocabulario sobrevive bifurcado dentro de una surface.

**Propuesta:** `command-center` consume los contratos de `structures/dashboard/`
y borra sus dos definiciones locales. Si alguna de las dos formas es mejor, gana
esa, pero en el archivo del dueño.

---

## U13 — La fachada `visual-authority` está marcada obsoleta y es el camino real

`infrastructure/runtime/theming/foundation/visual-authority/index.ts` se declara
`@deprecated` en su línea 10 y manda importar de `./foundation/admission` o
`./runtime/retention` directamente.

Lo importan **13 archivos** — 7 de producción y 6 tests — y entre los de
producción están **los dos entrypoints públicos del paquete**:
`entrypoints/server/index.ts` (líneas 92, 97, 116, 121) y
`entrypoints/public/contracts/runtime/index.ts:2`. Los otros cinco son
`tenant-preview/runtime/preview-css`, `brand-studio/.../preview-scope`,
`tenant/.../use-create-tenant`, y el provider de theming.

O sea: la API pública del paquete se sirve a través de un camino que el propio
código declara muerto. Es el caso exacto que prohíbe la regla 6.

**Propuesta:** o se migran los 7 importadores de producción, o se saca el
`@deprecated`. Las dos son baratas; lo que no se sostiene es el estado actual.

---

# PARTE 3 — SE QUEDA (y por qué no volver a proponer borrarlo)

Esta lista existe porque el criterio equivocado ya casi borra estas cosas una vez.

| qué | por qué parece muerto | por qué no lo está |
|---|---|---|
| `modern-rescue/probe/` (5 archivos) | la carpeta se llamó "segunda implementación" | `cascade-probe.mjs` de la raíz los importa en sus líneas 76-84 |
| `skin-orphan-scope-audit.mjs` | ningún gate lo llama | su propia cabecera dice que camina *"the OPPOSITE direction to `skin-dead-part-audit.mjs`, deliberately"*. Es la mitad complementaria de un par cuya otra mitad sí corre |
| `decision-panorama`, `widget-board`, `bulk-select-toggle`, `status-filter-pills`, `mono-stat`, `ascii-diagram`, `token-inspector`, `terminal-block` | "solo el registro del showroom" | los importan tests de contrato de core, el fixture `visual-excellence` de brand-studio, y páginas `probe/`/`torture-sections`/`kit-inventory` del showroom |
| `scripts/codemods/*.mjs` | ningún script npm los corre | por diseño: se corren a mano en el repo de la app consumidora |
| `runtime-svg-paint-census.mjs`, `embedded-css-paint-census.mjs` | parecen duplicarse | son dos CLIs sobre los contadores de `lib/`, donde la medición vive una sola vez |

**La lección de método, que vale más que la lista:** ocho componentes se marcaron
huérfanos porque medí solo contra imports de producción de `ui/`. Contando tests de
contrato, fixtures internos y showroom, tienen consumidor. **El alcance de la
medición es parte del resultado.** Cualquier `[SIN CONSUMIDOR]` futuro tiene que
declarar dónde buscó.

---

# PARTE 4 — Las reglas que cortan la reincidencia

Las cinco formas en que este repo acumuló lo que acumuló, y la regla que corta cada
una. Van al `CLAUDE.md`.

**1. El codemod de un solo uso que se commitea y no se retira.**
→ Un codemod declara en su cabecera la fecha en que expira. Pasada esa fecha se
borra sin discusión. Un codemod cuya ruta de destino no existe se borra ya.

**2. El gate que se escribe con su test, el test entra a CI por glob y el gate
nunca.** → Un script sin un gate que lo corra no se commitea. Si es diagnóstico y
no bloquea, va a una carpeta declarada de diagnósticos, no al mismo directorio que
los gates.

**3. El glob no recursivo que esconde árboles enteros de tests.**
→ `node --test scripts/*.test.mjs` no alcanza subcarpetas. Hoy son **nueve** los
tests que ningún script npm toca; están contados uno por uno en la parte 5. Los
globs de `test:scripts` se hacen recursivos o cada subárbol declara su entrada.

**4. El programa que se documenta como si fuera código y solo se cita a sí mismo.**
→ Un set de documentos que solo enlaza a sus propios hermanos parece vivo en
cualquier chequeo de enlaces. La pregunta correcta es si algo **de afuera** lo cita.

**5. La copia declarada que después diverge.**
→ Copiar está permitido si el aislamiento es una decisión firmada, pero la copia
declara qué diverge y un test lo verifica. `roadmap-commercial-status.mjs` declaró
"dos divergencias funcionales" y hoy es el 10 % del original.

**Y la que las cubre a todas:** un documento que describe algo que ya no existe se
corrige el mismo día o se borra. No hay estado "vigente con cartel de obsoleto".

---

## Regla 6 — La etiqueta no retira

Las cinco reglas anteriores cubren codemods de un solo uso, gates huérfanos,
globs no recursivos, documentación que se autocita y copias que divergen.
Ninguna cubre el mecanismo de acumulación más repetido de este árbol: **declarar
un retiro y no ejecutarlo.**

> Toda declaración de "deprecated", "canonical", "historical" o "legacy" en un
> docstring, README o comentario tiene que llevar fecha límite y un chequeo
> mecánico que falle si lo declarado muerto sigue alcanzable pasada esa fecha.
> Sin eso, la palabra es deuda disfrazada de decisión.

Los cuatro casos que la fundan, todos en este repo y todos en este documento:

- `approval-inbox/index.ts:19-21` dice *"Will be removed in a future major
  version"*. Ese futuro lleva meses siendo el presente (lote 9).
- `collection-workspace/index.tsx:4` se declara *"Single canonical workspace
  surface"* mientras `ListSurface` sigue exportada hasta `src/index.ts` (U4).
- `quality-evidence/README.md:8` dice *"v1 — HISTORICAL BASELINE ONLY"* mientras
  `package.json` sigue ejecutando v1 (U2).
- `graphics/icons/index.ts:37-42` dice que los 13 legacy están
  *"intentionally NOT re-exported"* — y siguen físicamente en el árbol (lote 3).

En los cuatro, alguien tomó la decisión correcta, la escribió, y ahí se quedó. La
palabra escrita hizo de sustituto del trabajo.

---

---

# PARTE 5 — Tres defectos de cableado, verificados hoy

No son borrados ni unificaciones: son cosas que **parecen estar conectadas y no
lo están**. Ninguna aparece en los tres documentos anteriores. Las tres tienen
arreglo de una línea, y las tres son de la misma familia que la regla 2.

## D1 — Un gate bloqueante que corre con una bandera que el script no lee

`ci-gates.manifest.mjs:151` declara:

```
{ id: 'gat-07-exact-proof', run: ['node', 'scripts/gat-07-exact-proof.mjs', '--check'], blocking: true }
```

El script no parsea `--check` en ningún lado. Las banderas que sí lee son
`--print-doc-allowlist`, `--write`, `--check-artifact` y
`--allow-unsealed-documentation` (líneas 1354-1369). Con `--check`, el script
reconstruye el artefacto entero y lo **descarta**: no escribe y no compara. La
entrada bloqueante gasta el tiempo y no verifica nada.

La cobertura real del artefacto existe, pero por otro camino: `ci.yml:183` corre
`gat07:check`, que es `--check-artifact`. O sea que el defecto no dejó el
artefacto sin proteger — dejó una entrada del inventario de gates mintiendo
sobre lo que hace.

**Arreglo:** cambiar `--check` por `--check-artifact` en el manifiesto. Y un test
que falle si un `run:` del manifiesto pasa una bandera que el script destino no
reconoce — porque este mismo error es indetectable a ojo.

## D2 — 53 archivos de app-platform importan un subpath que el paquete no declara

`packages/core/package.json` no tiene ninguna entrada `./commercial` en
`exports` (las únicas con "comm" o "style" son `./patterns/command-palette` y las
seis de `./styles*`). Sin embargo:

- 53 archivos de `app-platform/src` importan `@rottay/design-system/commercial`
  (54 usos) y 3 importan `@rottay/design-system/commercial.css`.
- Resuelven porque `app-platform/next.config.ts:53,60` los alias-ea a mano a
  `dist/commercial.js` y `dist/commercial.css`.

Es una puerta trasera de webpack sosteniendo 53 archivos de producción. El día
que esa app se compile con otro bundler, o que alguien limpie el `next.config`,
se cae sin que ningún gate de este repo se entere.

En el mismo lugar hay un segundo síntoma: `./styles/rottay` y `./styles/default`
apuntan los dos a `dist/rottay.css`, que **no existe** (`dist/platform.css` sí).
El `dist` está viejo, y los `exports` describen un artefacto que no está.

**Arreglo:** declarar `./commercial` y `./commercial.css` en `exports` y sacar el
alias del `next.config`; y un gate que falle cuando un `exports` apunta a un
archivo que el build no produce.

## D3 — Nueve tests y cinco gates que nadie corre

**Nueve `.test.mjs` bajo `packages/core/scripts/` no los alcanza ningún script
npm** — ni por nombre, ni por glob, ni por el `vitest` de `test:scripts`, que
solo incluye `scripts/**/*.vitest.test.ts`:

```
scripts/lib/first-party-roster-source.test.mjs
scripts/lib/modern-framework-layer.test.mjs
scripts/lib/owner-nesting.test.mjs
scripts/lib/root-public-resolver.test.mjs
scripts/quality-evidence/programs/modern-rescue/cascade-probe.test.mjs
scripts/quality-evidence/programs/modern-rescue/manifest/fanout-facts.test.mjs
scripts/quality-evidence/programs/modern-rescue/manifest/mirror-parity.test.mjs
scripts/quality-evidence/programs/modern-rescue/manifest/root-checklist.test.mjs
scripts/quality-evidence/programs/modern-rescue/probe/cascade-probe.test.mjs
```

Son 9 de 97. Los cuatro de `scripts/lib/` prueban los módulos compartidos que
usan los demás gates: es la capa peor cubierta del árbol y no corre.

**Y cinco gates de `scripts/` no los nombra ni `package.json` ni el manifiesto de
CI:** `channel-wiring-zero-delta-gate.mjs`, `chart-series-reserved-name-gate.mjs`,
`color-mix-argument-purity-gate.mjs`, `cra-17-integral-gate.mjs`,
`modern-bundle-framework-gate.mjs`. Cinco de 40.

**Arreglo:** los globs de `test:scripts` se hacen recursivos, y cada gate entra
al manifiesto o se borra. No hay tercera opción: un gate que no corre es un
archivo que miente sobre estar protegiendo algo.

## Qué necesito de vos

Aprobás por lote, no archivo por archivo:

| lote | qué | riesgo | listo para ejecutar |
|---|---|---|---|
| 1 | 34 carpetas vacías | ninguno | sí |
| 2 | 17 codemods de febrero | ninguno | sí |
| 3 | 13 iconos legacy | ninguno | sí |
| 4 | 2 archivos de sonda duplicada | ninguno | sí |
| 5 | 4 `.md` históricos de la raíz + 2 definiciones de agente que describen otro design system | ninguno | sí (borrar o archivar: decidís) |
| 6 | `styles/platform.css` | medio | no: reanclar 802 citas primero |
| 7 | `test-artifacts/` (528 MB) | pérdida de evidencia | no: necesito tu decisión |
| 8 | espejo TS de tokens | alto de golpe | no: migrar 2 funciones primero |
| 9 | `approval-inbox` (ya deprecado) | API pública | no: 0 en apps, pero showroom + skin CSS + manifiestos adentro |
| 10 | doc que describe cosas inexistentes | ninguno | sí (es corrección, no borrado) |
| 11 | alias de `package.json` sin uso | ninguno | sí |
| 12 | `audit-presets.mjs` + `audit-report.json` de la raíz, `showroom/.tmp/` (32 scripts), las 3 carpetas de `coverage` | ninguno | sí |

Los lotes 1 a 5 más el 10, el 11 y el 12 se pueden hacer hoy. El 9 volvió a
bloquearse al medir dentro del repo. El 6 necesita trabajo previo, el 7 una
decisión tuya y el 8 hay que reducirlo de alcance.

**Aparte de los lotes, tres arreglos de cableado (parte 5) que no borran nada y
que puedo hacer sin aprobación si me decís que sí:** la bandera fantasma del
gate `gat-07` (una palabra en un archivo), los globs de `test:scripts` para que
alcancen los 9 tests que hoy nadie corre, y los 5 gates sin invocador — estos
últimos hay que decidirlos uno por uno: entran al manifiesto o se borran. El
cuarto, el subpath `/commercial` sin declarar, toca `app-platform` y por eso no
lo tomo desde acá.

Y cuatro preguntas que no puedo contestar yo, porque son de diseño y no de
archivo:

1. **U4, mitad de detalle.** `DetailSurface` 3 contra `RecordWorkbenchSurface` 3.
   ¿Cuál es la receta canónica de pantalla de detalle, o todavía no hay una?
2. **U7, `Switch` contra `Toggle`.** Fusionar rompe 8 archivos de bithire.
   ¿Se hace ahora o se difiere?
3. **U10, los dos sistemas de iconos.** ¿Se migran evnto y platform a la fachada
   semántica, o se admite por escrito que hay dos entradas soportadas?
4. **U11, los dos `Link`.** Hoy el que se publica con el nombre `Link` no es el
   canónico de navegación. Renombrar el de Typography a `TextLink` es cambio de
   API pública. ¿Se hace?
