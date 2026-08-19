# Roadmap de remediación: lo que TENDRÍA que estar

Fecha de medición: 2026-08-19. Alcance: `ui-design-system`, más las tres apps
consumidoras leídas en disco (`app-bithire`, `app-evnto`, `app-platform`).

## Por qué este documento existe y en qué se diferencia de los otros tres

Los tres documentos anteriores miran **lo que hay**:

- [`docs/MAPA-DEL-REPO.md`](MAPA-DEL-REPO.md) — qué hace cada carpeta.
- [`docs/VERIFICACION-FABLE.md`](VERIFICACION-FABLE.md) — verificación afirmación por afirmación.
- [`docs/AUDITORIA-KIMI.md`](AUDITORIA-KIMI.md) — tercer lector independiente.
- [`docs/QUE-SE-QUEDA-Y-QUE-SE-BORRA.md`](QUE-SE-QUEDA-Y-QUE-SE-BORRA.md) — la adjudicación de esas tres lecturas.

Este mira **lo que tendría que haber**. Se armó al revés: primero se escribió el
sistema objetivo sin abrir el árbol (qué capacidad necesita un consumidor, quién
debería ser su dueño único, por qué camino público único se sirve), y recién
después se contrastó contra el repo. De esa resta salen cuatro listas: lo que
falta construir, lo que está mal ubicado, lo que sobra, y en qué orden se toca.

Se armó a tres asientos independientes con el mismo encargo (Fable, Kimi y este
servidor), y las secciones de abajo son el cruce. Donde los tres coinciden va sin
marca; donde uno corrigió a otro, se dice quién y con qué evidencia.

---

## PARTE 1 — El sistema objetivo

Definición de capacidad: algo que un consumidor (una app, un tenant que
white-labellea, o el propio DS componiéndose) necesita poder **hacer**. Los
gates, roadmaps, artefactos de test y la maquinaria de Modern Rescue no son
capacidades: son instrumentos del equipo. No entran a la tabla.

Escala de referencia: **2.034 archivos** de las tres apps importan
`@rottay/design-system`. El paquete declara **121 subpaths**.

### 1.1 Fundación visual

| # | capacidad | dueño único | camino público único | existe | bien ubicado | se usa |
|---|---|---|---|---|---|---|
| A1 | Tokens de fundación (color, espaciado, tipo, radio, sombra, motion) | `foundation/tokens/` con UN pipeline source→generado | variables `--ds-*` acuñadas por contrato | sí, pero declarados en 3 planos a la vez (css, espejo TS, skins) | a medias | sí |
| A2 | **Pocas raíces de cascada con vocabulario cerrado de variantes nombradas** | capa base del motor `modern` + gobierno en `manifest/controls/` y `manifest/cascade/` | las `--ds-*` raíz; el tenant las toca vía los 20 controles | **no en fuente**: hay catálogo textual de 63 raíces y 20 controles, no variables reales | el gobierno sí, la fuente no existe | no puede usarse: 2.229 de 3.548 canales de componente no alcanzan ninguna raíz |
| A3 | `Theme` como contrato único (`BrandTheme` alias deprecado) | `foundation/contracts/composition/tenants/themes/` | tipos vía raíz, compilación vía `./server` | sí | sí | sí |
| A4 | Compilar Theme → CSS: **un solo lowering** | `infrastructure/compilers/kernel/runtime/brand-theme/` | `./server` | sí, pero hay un **segundo compilador paralelo** (`runtime/appearance/`, ~1.000 líneas) emitiendo los mismos canales | el primero sí | sí — 14 archivos de app importan `./server` |
| A5 | **Tres brand themes espejo** (rottay/bithire/evnto): misma estructura, mismos nombres, distintos valores | `foundation/tokens/ts/presentation/brand-themes/` | artefactos `styles/{rottay,bithire,evnto}.css` | los tres existen; **no son espejos**: declaran 1.237/1.282/430 canales, intersección 369 sobre una unión de 1.908 (19,3 %) | sí | sí |
| A6 | White-label de tenant acotado (DB → Theme → compileTheme → artefacto SSR) | contratos de tenancy + el lowering único de A4 | `./server` + `TenantThemeDocument` | sí; el límite de 200 `tokenOverrides` falla cerrado | sí | sí |
| A7 | Motor visual `modern` (classic/rustic solo compatibilidad) | `ui/*/engines/modern/` + su skin | implícito vía provider | sí — cobertura completa en los componentes engine-backed | sí | sí |
| A8 | Skin `data-part` (re-skinnear sin tocar TSX) | `foundation/tokens/css/runtime/engines/modern/skin/` | interno del motor | sí — 123 archivos | sí | sí |
| A9 | Artefactos CSS por vertical, frescos y regenerables | `scripts/build-vertical-css.mjs` | `./styles/*` | sí, con residuo: `styles/platform.css` byte-idéntico a `rottay.css`; `exports` apunta a `dist/rottay.css` que no existe | sí | sí |

### 1.2 Componentes

| # | capacidad | dueño | camino | existe | ubicado | se usa |
|---|---|---|---|---|---|---|
| A10 | Primitivas / Patterns / Structures / Surfaces | `ui/{tier}/` | barril raíz | sí | sí, pero varias capacidades internas tienen DOS dueños (Parte 3) | sí — 2.034 archivos de app |
| A11 | Charts D3 (18 tipos) | `ui/patterns/visualization/charts/` | `./charts` | sí | sí | sí, pero casi solo bithire (94 archivos de app en total) |
| A12 | Iconos semánticos independientes del proveedor (corpus 282) | `graphics/icons/` | `./icons` | sí | sí | **el camino de compatibilidad es el mayoritario**: la fachada `<Icon name=` se usa en 582 archivos de bithire, 1 de platform, 0 de evnto |
| A13 | Marcas de empresa/nube | `graphics/brand-marks/` | `./marks` | sí | sí | poco — 10 archivos |
| A14 | Vocabulario de motion/effects | `graphics/motion/` | `./motion` | sí | sí | poco — 3 archivos de app |
| A15 | Hooks de runtime | `infrastructure/runtime/*` | `./runtime/*` | sí | sí | sí |
| A16 | Contratos TS públicos | `foundation/contracts/` | raíz (viajan con el componente) | sí, con una colisión: dos `LinkProps` incompatibles y el nombre `Link` publicado para el no canónico | casi | sí vía raíz, no vía subpath |

### 1.3 Consumo sano y gobernanza

| # | capacidad | dueño | camino | existe | ubicado | se usa |
|---|---|---|---|---|---|---|
| A17 | Enforcement mecánico en apps (no-raw-html, no-hardcoded-colors, no-db-in-components) | `tooling/eslint/` | `./eslint` | sí | sí | referenciado por configs de app (fuera de `src/`) |
| A18 | Gobernanza mecánica del propio DS (gates, ratchets, evidencia) | `packages/core/scripts/` con `ci-gates.manifest.mjs` como única vía | `pnpm gates:ci` | sí, con cableado deshonesto (Parte 2, B5–B6) | sí | sí |
| A19 | Vitrina navegable | `packages/showroom/` | showroom.rottay.com | sí | sí | sí |
| A20 | Backlog operable con estado mecánico | `roadmap/registry.json` | `pnpm roadmap:status` | sí — 100 WOs: 74 done, 25 todo, 1 en curso | sí | sí |

### 1.4 Lo que NO debe existir y hoy asoma

- **Identidad del vertical `platform`.** Ya no es vertical del roster; sobrevive
  como `styles/platform.css`, `dist/platform.css`, un presupuesto de performance
  y una exigencia de `dependency-honesty.mjs`. Se extirpa, no se completa.
- **`/commercial` como nombre de capacidad.** La ley del repo dice que
  "commercial" es un adjetivo de marketing, no un rol arquitectónico. Hoy
  app-platform importa `@rottay/design-system/commercial` en 53 archivos y el
  subpath **ni siquiera está declarado** en `exports`: resuelve por un alias de
  webpack en el `next.config.ts` de la app.
- **Pictogramas con nombre de producto.** El corpus de 8 incluye
  `candidate-evidence` y `event-moment`: entender esos nombres exige saber qué es
  un candidato. No pasan el promote-to-DS test.
- **Un canal `--ds-` por componente sin fallback a una raíz.** Es el anti-objetivo
  explícito: cada uno de esos canales es deuda contra A2, no una capacidad.

---

## PARTE 2 — Los huecos: lo que tendría que existir y no existe

Ordenados por peso. Los tres primeros son la razón de ser del roadmap; ninguna de
las tres auditorías los podía ver, porque las tres miran lo que hay.

### B1. La cascada no está materializada en fuente

A2 existe como catálogo (63 raíces internas reconciliadas contra los 20
controles) y como medición, pero el motor `modern` real sigue siendo plano:
**3.548 canales de componente, 2.229 sin camino a ninguna raíz**. El gemelo roto
típico es `skin/card.css` con `border-style: var(--ds-card-border-style)` sin
fallback, contra el modelo correcto de `skin/input.css`, que encadena tres
niveles.

Qué rompe hoy: cambiar una decisión visual exige tocar miles de canales — la
frase textual del dueño sobre "una variable por primitiva". Los temas no pueden
colapsar (el 88,7 % de sus 3.693 canales es derivable) y cada marca deriva a mano
y diverge: bithire reconstruyó la razón tipográfica en literales y se le fue de
0.308 a 0.435.

Qué se construye: las raíces como variables reales en la capa base del `modern`,
el recableo de los canales huérfanos al patrón `var(--ds-x-y, var(--raíz))`, y un
ratchet decrease-only de canales huérfanos.

### B2. El vocabulario cerrado está incompleto y su gobierno no sostiene lo cargado

Foto de hoy: 8 controles closed-enum con valores, 4 diales que ya ganaron stops
nombrados (motion 3, radius-scale 4, effect-intensity 3, typography.scale 3), 6
legítimamente no-enum (paletas, fuentes, mapas, ids de perfil). Quedan **dos
enums vacíos**: `chrome.anatomy` y `profiles.expressive`. Un enum sin valores es
un hueco, no un tipo abierto.

Además, el contenido de fase 1 vive a medias en `targetBinding`, campo que ningún
validador lee; la migración al campo gobernado `internalChannels` está al 29 %
(1.462 de 5.100 celdas).

Qué rompe hoy: los temas espejo no pueden escribirse. Un tema asigna a cada raíz
una variante nombrada; para un enum vacío no hay nombre que asignar.

Qué se construye: se llenan los dos enums, se termina la migración, y
`program-check` gana la regla que exige enum no vacío y celda gobernada.

Nota importante para el orden: `customization-model.json` ya declara
`targetRecipeGroups` (14 grupos) y `targetControlModel`, ambos marcados
`PROPOSED_NOT_IMPLEMENTED`. **El hueco no es de especificación sino de
ejecución** — no hay decisión de dueño pendiente acá, hay una spec aprobada
esperando que alguien la baje.

### B3. No existe la aserción de espejo

`mirror-parity.mjs` y su test existen y pasan hoy (44 pass), pero son un oráculo
del **generador**: validan que la medición mide, no que los temas sean espejos.
El artefacto registra 19,3 % de intersección y el test está verde.

El requisito "misma estructura, mismos nombres, distintos valores" no tiene hoy
ningún comando que falle. Se construye la aserción de paridad (superficie de
canales idéntica entre los tres, roles idénticos, valores libres) como gate
bloqueante — que falla hoy y pasa cuando los temas se reescriban. Ese test es,
además, uno de los 9 que ningún glob corre: primero hay que enchufarlo.

### B4. El fan-out se mide pero no tiene freno

El repo ya construyó el medidor (`fanout-facts.json`, determinista byte a byte) y
su test oráculo, pero **ninguno de los dos corre** en npm ni en CI, y no existe
gate que impida que el número de canales crezca. El precedente correcto ya está
en el repo: `daisy.classConsumers` es un contador decrease-only. Se replica sobre
canales huérfanos.

### B5. No existe el gate exports→artefacto

`exports` declara `./styles/rottay` y `./styles/default` apuntando a
`dist/rottay.css`, que el build no produce. Y 53 archivos de producción de
app-platform importan un subpath que `exports` no declara. Cualquier cambio de
bundler o limpieza del `next.config.ts` tira esos 53 archivos sin que ningún gate
de este repo se entere.

Se construye: (a) declarar `./commercial` y `./commercial.css`; (b) un gate que
recorra `exports` y falle si el destino no lo produce el build.

### B6. No existe el test manifiesto→flags

El gate bloqueante `gat-07-exact-proof` se invoca con `--check`, bandera que el
script no parsea: el script solo conoce `--check-artifact`, `--write`,
`--allow-unsealed-documentation` y `--print-doc-allowlist`. Corre, no valida
nada, y sale 0.

Corrección de orden verificada en `.github/workflows/ci.yml`: el manifiesto corre
en la línea 164, **antes** de que la línea 172 haga checkout del repo
`docs-engineering` que el gate necesita. Por eso el arreglo no es cambiar la
bandera en el manifiesto: en ese punto del pipeline no hay corpus de
documentación. El arreglo correcto es sacar la entrada del manifiesto bloqueante
(la cobertura real ya está en la línea 183, `gat07:check`) o mover el checkout
antes. Se acompaña de un test que falle si un `run:` del manifiesto pasa una
bandera que el script destino no reconoce.

### B7. Los ejecutores no alcanzan lo escrito

**9 archivos `.test.mjs` sin ningún invocador** — 4 de `scripts/lib/`, la capa que
todos los gates comparten, y 5 de modern-rescue, incluidos `mirror-parity`,
`fanout-facts` y `root-checklist`. Los 9 pasan si se corren a mano.

**5 gates que ni `package.json` ni el manifiesto nombran**:
`channel-wiring-zero-delta-gate.mjs`, `chart-series-reserved-name-gate.mjs`,
`color-mix-argument-purity-gate.mjs`, `cra-17-integral-gate.mjs`,
`modern-bundle-framework-gate.mjs`.

Se construye: globs recursivos en `test:scripts`, y decisión binaria por gate —
entra al manifiesto o se borra. No hay tercera opción.

### B8. La frontera pública está invertida

Medición exacta de hoy: de los **121 subpaths declarados, 23 tienen al menos un
importador** en las tres apps más el showroom. **98 no tienen ninguno.** Los
muertos por prefijo: `./primitives/*` 39, `./patterns/*` 13, `./runtime/*` 9,
`./contracts/*` 7, `./structures/*` 5, `./fonts/*` 5, `./surfaces/*` 2. En
paralelo, el barril raíz se importa 2.034 veces desde las apps.

La otra mitad de la inversión: el subpath más usado que no existe es
`./commercial` (53 archivos, resuelto por alias de webpack).

El hueco no es "falta un camino" sino **sobran caminos, y el que hace falta no
está declarado**. Se construye la decisión escrita: o el barril raíz es la vía y
los 98 subpaths muertos se retiran, o los subpaths son la vía y hay que migrar
2.034 archivos. La primera es la que ya ganó en los hechos.

### B9. El barril publica los internos de cada componente

Censo propio: **2.657 símbolos** salen por el barril raíz. Valores (componentes,
hooks, funciones, constantes): 955, de los cuales 387 tienen consumo externo, 243
son solo internos del DS y **325 no tienen ningún consumidor**. Tipos: 1.702, de
los cuales 1.297 nadie nombra — cifra que **no autoriza ningún borrado**, porque
el tipo de props de un componente usado se consume estructuralmente.

De esos 325 valores huérfanos, ~79 son constantes `*_DEFAULTS`, `*_MAP`,
`*_COLORS`: la configuración interna de un componente que sí se usa. El resto son
subpartes (`AvatarBadge`, `AvatarGroup`, `CheckboxGroup`) y andamiaje de charts.

El diagnóstico correcto no es "sobran 325 símbolos" sino: **que un owner exporte
no significa que el paquete publique**. Hace falta una lista explícita de API en
el barril raíz, en lugar de un `export *` que arrastra todo lo que el owner
declara.

### B10. El corpus de iconos no satisface la demanda real

app-platform tiene **194 archivos con `lucide-react` y 37 con
`@ant-design/icons`**; evnto tiene 11 con lucide. Son **242 archivos de
producción** que violan la ley "apps MUST NOT import Phosphor, Lucide o Ant
directamente". O la fachada no cubre lo que platform necesita, o la adopción
nunca se exigió ahí.

Lo que es capacidad del DS: el censo de glifos importados por fuera, separado en
"ya tiene nombre semántico" (migración mecánica) y "falta en el corpus" (alta
gobernada). La migración en sí es trabajo de las apps.

### B11. No hay receta canónica de pantalla de detalle

`DetailSurface` 3 consumidores en apps, `RecordWorkbenchSurface` 3, cero consumo
interno en ambas. Es el único punto donde una capacidad directamente **no tiene
dueño**, en vez de tener dos. Decisión de dueño, no de limpieza.

### B12. No está escrito el árbol de decisión de shells

Seis marcos de página que no son seis duplicados sino capas (`Layout` <
`AppShell` < `PatternPageShell` < `WorkspaceShell`), pero un consumidor no tiene
forma de elegir. Se construye un documento normativo de una página: cuál usar
para qué.

### B13. La regla `--ds_` no está instituida

Cero usos hoy. Es el momento barato de convertir la decisión oral en gate: el
canon es `--ds-`, el espacio libre de experimentación es `--ds_`, y un gate
impide que `--ds_` llegue a un artefacto publicado.

### B14. Menores

- **Contraste APCA**: WO-TOK-11 sigue `todo` (lane tokens 10/11 done). Capacidad
  prometida por la spec Quiet Premium, aún no construida.
- **`PatternEmptyState` no delega en `Empty`**: duplica markup en su engine
  modern. Se construye slots de título/icono/acción en la API de `Empty` y la
  delegación. No hay retiro barato en ese grupo: los cuatro nombres tienen
  públicos distintos.

---

## PARTE 3 — Lo que está, pero en el lugar equivocado

Se mueve, no se borra.

| # | qué | dónde está | dónde va | costo |
|---|---|---|---|---|
| C1 | `density` y `typography/pairings` | dentro del espejo TS condenado por el lote 8 | dueño propio fuera de `tokens/ts/` | **antes** del lote 8, o el lote los arrastra (5+ importadores de producción) |
| C2 | La capacidad "appearance de tenant" | segundo compilador `compilers/kernel/runtime/appearance/` | absorbida en `brand-theme/` | 2 consumidores de producción + ~6 tests |
| C3 | La API pública servida por una fachada `@deprecated` | `visual-authority/index.ts` lo importan `/server`, `/contracts/runtime` y 5 archivos de producción | migrar los importadores **o** levantar el cartel | ambas baratas; el estado actual viola la regla de "la etiqueta no retira" |
| C4 | Vocabulario de dashboard bifurcado | `command-center` redefine `StatItem` y `ActivityItem` con formas **ya divergentes** de `structures/dashboard/` | consumir del dueño; si la forma nueva es mejor, gana en el archivo del dueño | 1 surface |
| C5 | Chrome de colección escrito en dos tiers | 4 pares `patterns/` ↔ `structures/` | canónico por par | corrección de Kimi: el consumo interno favorece a `patterns/` (~22 vs ~13), **no** a `structures/` como decía la propuesta original |
| C6 | El nombre público `Link` | el `Link` de Typography sale por `./primitives/typography` mientras el canónico se llama `NavLink` | renombre a `TextLink` | firma del dueño |
| C7 | 802 citas de manifiesto ancladas a `platform.css` | 19 archivos de familia citan `styles/platform.css:<línea>` | re-anclar a `rottay.css` | byte-idéntico ⇒ `sed` sin cambio de líneas + validación. **Condición previa del lote 6** |
| C8 | Dos árboles `test-artifacts/` | los gates resuelven contra la raíz por ruta hardcodeada mientras quality-evidence vive en el de core | decisión de dueño + repunteo explícito de gates | 479 MB |
| C9 | La compatibilidad de iconos es el camino mayoritario | 242 archivos de app importan suppliers directos | o migran, o la doc admite dos entradas soportadas | cruza la frontera del repo |

---

## PARTE 4 — Lo que sobra

Cruce de los 12 lotes de [`QUE-SE-QUEDA-Y-QUE-SE-BORRA.md`](QUE-SE-QUEDA-Y-QUE-SE-BORRA.md) contra el sistema
objetivo. Regla del cruce: **ningún owner que sirva a una capacidad de la Parte 1
puede estar en un lote de borrado.** Se verificó uno por uno; no hubo colisiones
frontales.

**Confirmados tal cual, riesgo cero, ejecutables ya:** lotes 1 (23 carpetas
vacías bajo `packages/core/src`, 35 en todo el repo — recontar al ejecutar, eran
36 hace dos días), 2 (codemods de febrero), 3 (13 iconos legacy, con el paso
extra del barrel interno y el re-seed de `pack-inventory.baseline.json`), 4 (solo
`probe/cascade-probe.mjs` + su test; los otros 5 archivos de `probe/` **no**), 5
(2 agentes que describen otro DS), 10, 11 (alias duplicados; `hooks:check`,
`engine-audit:check` y `gat07:check` se quedan), 12.

**Confirmado con el alcance corregido — lote 8.** El espejo TS de tokens no es de
45 owners sino de **19 módulos** (`ts/runtime/components/`), cuyos exports
individuales no importa nadie fuera del barrel; la única excepción viva es
`getCollapseTokens`. `brand-themes`, `personality`, `recipe-profiles`,
`responsive-postures` y `expressive-profiles` quedan **fuera**. C1 va primero.

**Confirmados con condición previa:** lote 6 (`platform.css`) recién después de
C7, y junto con él se extirpa el resto de la identidad platform (dist huérfano,
presupuesto de performance, exigencia de `dependency-honesty.mjs`). Lote 9
(`approval-inbox`) con sus cinco grupos de consumidores internos. Lote 7 con
decisión de dueño.

**Una objeción, no frontal:** el lote 5 borra 4 `.md` históricos que llevan
cartel de preservación del 2026-07-17. Archivarlos en
`docs-engineering/archive/` es coherente con ese cartel; borrarlos lo revierte.
Propuesta: archivar, no borrar.

**Sobra y ningún lote lo reclamó** (salió del sistema objetivo y de las
unificaciones; se ejecuta como retiro con migración, no como borrado):

- `ListSurface` — la receta no canónica de colección.
- `HoverCard`, `Stepper`, `StatsHeader`, `PatternColumnSettings` — los cuatro
  retiros que sobrevivieron la triple lectura con cero consumidores en las cuatro
  columnas.
- `Calendar` + `CalendarView` — cero en todas las columnas ambos. O se terminan o
  se retiran; no se quedan a medias.
- Los **98 subpaths sin importador** (B8), una vez firmada la decisión de que el
  barril raíz es la vía.
- Los 5 gates sin invocador — cada uno entra al manifiesto o se borra.
- `pairwise.mjs` de quality-evidence v1 — funcionalidad no portada a v2: o se
  porta, o cae con el desenchufe de v1.
- `dist/platform.css` y todo `dist` stale — se regenera, no se conserva.
- La página `showroom/probe/kit-inventory`, autodeclarada TEMPORARY y
  condicionada a WO-SHW-01: verificar estado del WO y retirar si cerró.

**Corrección de hecho a un documento previo:** el comando `quality-evidence:check`
(v1) **no** corre en CI — no aparece en `.github/workflows/`, ni en `gates:ci`, ni
en `pretest`. Desenchufar el script npm no rompe nada. Pero borrar los módulos v1
sí rompe `quality-evidence-gate.test.mjs`, que corre vía `test:scripts`: hay que
retirarlo en el mismo lote.

---

## PARTE 5 — Las siete olas

Regla transversal: cada ola termina con `pnpm --filter @rottay/design-system
gates:ci` verde y el registro del roadmap actualizado solo vía
`scripts/roadmap-status.mjs`. Los criterios de aceptación son comandos de este
repo; donde el comando todavía no existe, **crearlo es parte de la ola** y el
criterio es que falle antes del trabajo y pase después.

Ningún borrado ocurre antes de que exista el comando que demostraría que rompió
algo.

### Ola 1 — Piso honesto

**Objetivo:** que lo que el repo dice de sí mismo sea verdad.

**Por qué primero:** todas las olas siguientes se aceptan con gates y tests. No se
puede aceptar nada con un runner que tiene banderas fantasma, 9 tests que nada
corre y 5 gates sin invocador. Y los borrados de riesgo cero reducen el árbol que
las olas 3–6 tienen que recorrer.

**Entra:** lotes 1, 2, 3, 4, 5 (archivando los 4 `.md` con cartel), 10, 11, 12;
B6 (arreglo del flag fantasma + test manifiesto→flags); B7 (globs recursivos +
decisión entra-o-se-borra por cada gate); C7 (re-anclaje de las 802 citas); B13
(gate `--ds_`); C3 (visual-authority).

**Criterio mecánico:**
```
find packages/core/src -type d -empty | grep -q . && echo FALLA    # hoy: 23
grep -rn "styles/platform.css" .../manifest/families | wc -l       # hoy 802 -> 0
node --test "packages/core/scripts/**/*.test.mjs"                  # alcanza los 9 hoy inalcanzables
pnpm --filter @rottay/design-system gates:ci                       # verde con el flag corregido
```

### Ola 2 — El manifiesto gobierna lo que dice gobernar

**Objetivo:** vocabulario cerrado completo y la adjudicación de fase 1 migrada de
`targetBinding` al campo gobernado.

**Por qué antes que la 3:** manifiestos primero, porque los espejos mantenidos a
mano derivan. Las raíces que la ola 3 materializa salen del manifiesto: si el
vocabulario está incompleto, la ola 3 materializa un borrador.

**Entra:** B2 completo (los 2 enums vacíos; las 3.638 celdas restantes; la regla
en `program-check` que exige enum no vacío y prohíbe `targetBinding` residual);
adjudicación de exposición por raíz (`tenant-dial | internal-head | gap`)
reconciliando las 63 raíces internas con los 20 controles.

**Se puede borrar al terminar:** el campo `targetBinding` de las 5.100 celdas.

### Ola 3 — Las raíces existen en fuente y los canales cuelgan de ellas

**Objetivo:** materializar las raíces adjudicadas como variables reales de la capa
base del `modern` y recablear los canales huérfanos al patrón
`var(--ds-x-y, var(--raíz))`.

**Por qué antes que la 4:** un tema espejo asigna variantes a raíces. Si las
raíces no existen en fuente, los temas seguirían escribiendo identidad canal por
canal y el espejo sería imposible de sostener.

**Entra:** B1; el ratchet decrease-only de canales huérfanos (B4, con la
maquinaria ya enchufada en la ola 1); B14 (delegación de `Empty`, que es recableo
de skin). El trabajo va por familias, siguiendo el checklist variable→lugares del
manifiesto.

**Criterio:** el techo de ~2.229 canales huérfanos baja y nunca sube.

### Ola 4 — Los tres temas son espejos

**Objetivo:** reescribir rottay/bithire/evnto sobre las raíces: misma superficie
de canales, mismos nombres, misma línea y comentario, distintos valores.

**Por qué antes que la 5:** la 5 regenera `dist` y borra `platform.css`. Hacerlo
una sola vez, después de que los temas estén en su forma final, evita regenerar
artefactos y re-anclar evidencia dos veces.

**Entra:** A5/B3 — reescritura de los tres `index.ts`, la aserción de paridad como
gate bloqueante nuevo (falla hoy con 19,3 %, pasa con superficie idéntica),
regeneración de `styles/*.css`.

**Se puede borrar al terminar:** los canales derivables de los temas (los ~3.275
que colapsan). Quedan raíces, variantes e irreducibles.

### Ola 5 — Un compilador, un artefacto, un camino de consumo

**Objetivo:** una sola bajada Theme→CSS, `exports` que dice la verdad, identidad
platform extirpada.

**Entra:** C2 (absorber appearance), B5 (declarar `./commercial` y
`./commercial.css`, coordinar el retiro del alias webpack, y el gate
exports→artefacto), lote 6 completo, lote 7 con decisión de dueño, y la decisión
de B8 sobre los 98 subpaths muertos.

### Ola 6 — Una capacidad, un dueño en `ui/`

**Objetivo:** cada capacidad de UI con un canónico declarado y el otro lado
migrado o retirado.

**Por qué después de la 3:** estos refactors tocan los mismos archivos de skin y
engine que la 3 recablea. Hacerlos después evita migrar dos veces.

**Entra:** B11 (receta de detalle), C4, C5, C6, B12 (documento de shells), lote 9,
los retiros de la Parte 4, la fusión Switch/Toggle, B9 (lista explícita de API en
el barril raíz) y el lote 8 con el alcance corregido.

### Ola 7 — Las apps entran al sistema

**Objetivo:** cerrar la deuda que quedó del otro lado de la frontera: los 242
archivos con suppliers de iconos directos y el alias webpack de `/commercial`.

**Por qué última:** toca repos ajenos. Todo lo anterior es autónomo de este repo.

**Criterio:** ratchet decrease-only del conteo de imports vendor-shaped, medido
en disco sobre las apps.

---

## PARTE 6 — Lo que necesito que firmes

Ninguna bloquea la ola 1.

| # | decisión | opciones | consume |
|---|---|---|---|
| 1 | Los 4 `.md` históricos con cartel de preservación | archivar en `docs-engineering/archive/` **(recomendado)** / borrar | ola 1 |
| 2 | Los 5 gates sin invocador, uno por uno | entra al manifiesto / se borra | ola 1 |
| 3 | La frontera pública | el barril raíz es la vía y se retiran los 98 subpaths muertos **(recomendado: ya ganó en los hechos)** / los subpaths son la vía y se migran 2.034 archivos | ola 5 |
| 4 | Los dos árboles `test-artifacts/` (479 MB) | cuál se queda | ola 5 |
| 5 | Receta canónica de pantalla de detalle | `DetailSurface` / `RecordWorkbenchSurface` (3 a 3, sin desempate técnico) | ola 6 |
| 6 | `Switch` / `Toggle` | fusionar (rompe 8 archivos de bithire) / dejar los dos con roles escritos | ola 6 |
| 7 | El `Link` de Typography | renombrar a `TextLink` **(recomendado)** / dejarlo | ola 6 |
| 8 | Iconos en evnto y platform | migrar los 242 archivos a la fachada / declarar por escrito dos entradas soportadas | ola 7 |
| 9 | `Calendar` / `CalendarView` | terminarlos / retirarlos | ola 6 |

---

## Nota de método

Tres cosas que este trabajo aprendió y que valen como regla:

1. **El alcance de la medición es parte del resultado.** Un conteo de consumidores
   solo vale por las poblaciones que barrió. Cuatro columnas obligatorias: otro
   owner de core, tests, showroom, apps. Cero en la primera no autoriza borrar;
   distinto de cero prohíbe el retiro barato.
2. **Los tipos no son evidencia de borrado.** El tipo de props de un componente
   usado se consume estructuralmente, sin que nadie lo nombre. Un censo que
   mezcla tipos y valores infla el "muerto" por un factor de cuatro.
3. **La etiqueta no retira.** `@deprecated`, "canonical", "historical" y "legacy"
   en un docstring son deuda disfrazada de decisión mientras no exista un comando
   que falle cuando lo declarado muerto sigue alcanzable.
