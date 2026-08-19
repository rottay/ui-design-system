# Roadmap de ejecución — 2026-08-19 (post re-auditoría)

Este es el plan final, consolidado después de la re-auditoría de Fable
([`REAUDITORIA-FABLE-2026-08-19.md`](REAUDITORIA-FABLE-2026-08-19.md)).
Reemplaza operativamente a `DIAGNOSTICO-Y-PLAN-2026-08-19.md` (que queda como
el artefacto auditado). La ley objetivo es [`ARCHITECTURE.md`](ARCHITECTURE.md)
(ya corregida con las refutaciones aceptadas). La evidencia de zona está en
`DEPURACION-SCRIPTS-Y-DATOS-2026-08-19.md` y `CONFORMIDAD-SRC-2026-08-19.md`.

## 0. Resultado del cruce Kimi × Fable

**Fable confirmó la tesis central en todas las mediciones:** no hay que
reescribir primitivas; el trabajo es cableado de cascada, drenaje de pintura
inline y craft por familia. Los errores encontrados fueron "de presupuesto, de
orden y de denominador, no de diagnóstico" (sus palabras, §8 de su reporte).

**Refutaciones aceptadas (verificadas una por una por mí antes de aceptar):**

1. **Divergencia 1 corregida.** Mi "gana structures por ley de tiers" se
   contradecía: `data-table` (pattern) compone `PatternFilterPanel` vía facade
   — un pattern no puede importar una structure. Además el lado patterns es el
   engine-backed y concentra el consumo interno (16 vs 2). **Adjudicación
   final, canónico por par sin violar la ley:** `filter-panel`, `list-toolbar`,
   `saved-views` se quedan en patterns (los gemelos de structures se retiran);
   `column-menu` se queda en structures/workspace (modelo draft+apply, ya usado
   por collection-workspace; `column-settings` se retira).
2. **`contracts/kernel/tokens/extensions/` SE QUEDA.** Está cableado en el
   contrato público de engine (`ComponentExtensions`, `engine/index.ts:23,57`)
   y los tres engines de Card lo desestructuran. Mi "nunca cableado" era falso.
3. **`./commercial` ya está retirado en fuente** y sigue publicado en 2.19.35
   (53 consumidores en app-platform). No es una decisión a futuro: es una
   rotura latente que hoy viaja como **patch sin changeset**. Va con changeset
   major explícito.
4. **Space (34), ConfirmDialog (17), Toggle (8) tienen apps**: se retiran solo
   después de los codemods en apps (regla de coordinación, §1 abajo). Y
   `Typography.Link → TextLink` es **cambio silencioso de componente** para 3
   archivos de bithire: se hace en dos fases.
5. **Baseline de F2 corregida:** 1.958 nombres de canal nunca alcanzan una raíz
   (705 solo-pelados + 1.253 con fallback literal), no 908. El contador del
   ratchet debe ser tolerante a `var(` multilínea.
6. **Gate exports→artefacto va post-build** (CI corre `gates:ci` antes de
   `build`); se declara la excepción explícita: los canales de lifecycle
   (`prebuild`/`prepack`/`postbuild`) son cableado legítimo junto al manifiesto.
7. Correcciones de hecho menores ya aplicadas a ARCHITECTURE.md: `--_ds-*` son
   388 declaraciones/184 nombres (no 252); alias duplicados son 17 (no 10) y 3
   tienen invocador propio (se quedan); owners faltantes agregados al árbol
   (`token-inspector`, `branding-preview-sandbox`, `patterns/tooling/`);
   `foundation/tokens/__tests__/` (el único de src) entra al delta;
   Calendar/Timeline marcadas como ley objetivo, no vigente; dueño real de la
   gramática StatDef/Activity corregido.

**Lo que Fable confirmó exacto (muestra):** 23/35 carpetas vacías; 0 citas de
platform.css; 77 subpaths sin importador en apps (exhaustivo); 263
asignaciones / 88,7 %; 19,3 % de intersección (dos métodos); 282 iconos; 18
charts; 100 WOs; daisy 0; los 8 "falsos huérfanos" tienen apps reales
(WidgetBoard 4, MonoStat 8, AsciiDiagram 13, TerminalBlock 8,
StatusFilterPills 3) — el §4 "no se toca" quedó reforzado.

## 1. Regla de coordinación de releases (nueva, la más importante del cruce)

Todo retiro de API pública viaja en **un solo major (3.0.0)**, con changeset y
codemods en `codemods/`. **Ninguna app sube a esa major sin correr antes los
codemods.** Trabajo interno del DS puede avanzar en cualquier orden; el punto
de coordinación es el publish. Mientras tanto, la versión local 2.19.36 acumula
los retiros ya hechos en fuente bajo changeset major — nunca como patch.

## 2. Los frentes (orden final)

### F0 — Piso honesto + gobernanza de versión

- Changeset **major** que declara lo ya retirado en fuente (`./commercial`,
  identidad platform) — la deuda de versión existe hoy.
- Borrados de riesgo cero (verificados dos veces): 23+12 carpetas vacías; 17
  archivos de codemods de febrero; 13 iconos legacy no reexportados
  (`AlertIcon`/`LoaderIcon` esperan a F8: tienen 2 consumidores vivos);
  monolito `probe/cascade-probe.mjs` + test; 2 agentes `.claude/` obsoletos;
  `audit-presets.mjs` + `audit-report.json`; alias duplicados de package.json
  (quedan los 3 con invocador propio: `engine-audit:check`, `hooks:check`,
  `gat07:check`); 2 gates sin invocador + sus tests (la cobertura permanente ya
  existe).
- Gates nuevos: `--ds_` (canon de prefijos); exports→artefacto **post-build**
  (junto a `distfresh:check`/`packinv:check`, con la excepción de canal
  declarada en §1.10).
- Doc-rot del mismo día: comentario obsoleto en `ci-gates.manifest.mjs:42-53`;
  byte NUL en `lib/daisy-class-consumer-counter.mjs`; alias npm para
  `seal-round` (`:v2:seal`); corrección del comentario de `.npmignore` muerto.
- Limpieza de disco (no git): `coverage*/`, `showroom/.tmp/`, tarballs viejos.
- Criterio: `gates:ci` verde + `find src -type d -empty` vacío.

### F0.5 — La ley `folder/index` en todo el repo (reorganización física)

El destino está en ARCHITECTURE.md §1.2/§2.1/§2.2/§2.9. Coste medido: ~600-700
referencias ejecutables; el 70 % del riesgo es que **145 archivos resuelven
rutas relativas a su propia ubicación** (`import.meta.url` + `..`). Por eso el
orden es ley:

- **Precondición:** commitear el trabajo en vuelo (39-40 archivos modificados,
  20 de ellos bajo `manifest/`). Toda movida es un diff limpio o no es.
- **Fase 0 (destraba todo):** `scripts/lib/repo-root/index.mjs` — buscador
  ascendente de raíz (findUp al `package.json` con `name:
  @rottay/design-system`) + migración de las 145 resoluciones al helper.
  Valor propio aunque nunca se mueva nada: cualquier movida futura pasa a ser
  `git mv` + repuntear imports externos.
- **Fase 1:** movidas por familia, sin renombrar a index todavía
  (`tokens/channel-parity-gate.mjs`). Captura ~80 % de la legibilidad con
  ~40 % del coste; no rompe los drills de lane-control que aserten sufijos
  `*-gate.mjs`.
- **Fase 2:** rename a `index.mjs` + re-sellar GAT-07 (128 paths, exige corpus
  `docs-engineering`) + regenerar los ~290 headers de procedencia de iconos +
  arreglar los drills de lane-control.
- **Graduación del manifest (lote atómico propio):** `git mv
  scripts/quality-evidence/programs/modern-rescue/manifest
  packages/core/manifest` — 44 archivos referenciantes (21 externos, 23
  internos), families se mueve intacto (una sola unidad transaccional con
  controls/cascade), cirugía de `..` (generator 7→3, fanout/checklist/parity
  5→1), regeneración de `index.json` + generated/* + checkpoint, y la batería
  de verificación completa antes del commit (program-check, taxonomy-parity,
  los `--check` de frescura, `gates:ci`, `git grep "modern-rescue/manifest"` →
  0). Post-movida: `--check` nuevo para `cascade-{extract,materialize,backlog}`
  + entrada blocking `modern-rescue-cascade-freshness`; extender los drills del
  manifiesto a los 4 tests que quedan fuera del glob `scripts/**`.
- **Raíces:** repo root queda en 14 entradas (§2.1); los 4 `.md` históricos a
  `docs/history/`; `.claude/settings.local.json` sale del índice (contiene un
  token — rotar antes); en `packages/core/`: JSON publicados a `contracts/`,
  worklists `KIMI-*` al directorio de su programa, censos vivos a su
  capacidad productora en `scripts/tokens/`; en `packages/core/docs/`:
  GETTING_STARTED/ENGINE_SPLITTING/PERFORMANCE_BUDGET entran, las 10 carpetas
  de auditoría a `docs/history/`, los anexos del plegado a `docs/runtime/`.
- **Showroom:** `scripts/` se agrupa (`visual-matrix/`, `first-paint/`,
  `deploy/`); ojo: `vercel-ignore-build.sh` está referenciado en el dashboard
  de Vercel — moverlo exige cambiar ese setting fuera del repo.

### F1 — Vocabulario cerrado gobernado

- Llenar los 2 enums vacíos (`chrome.anatomy`, `profiles.expressive`).
- Migrar `targetBinding` → `internalChannels` (1.462/5.100 → 5.100; nadie lee
  `targetBinding`: borrar el campo al terminar).
- **Gobernar** la adjudicación de exposición (ya existe: 63/63 raíces con
  `tenant-dial` 26 / `internal-head` 27 / `gap` 10 — falta que un gate la lea).
- `program-check` exige enum no vacío + celda gobernada.

### F2 — La cascada existe en fuente

- Materializar las **12** raíces `por-crear` (46 ya existen; 5 son
  solo-artefacto) como variables reales de la base modern.
- Recablear canales: baseline **1.958 nombres** (contador tolerante a
  multilínea; fallback literal NO cuenta como cableado), ratchet decrease-only.
- Enchufar `fanout-facts` y `mirror-parity` al manifiesto (sus tests ya corren
  por el glob recursivo). Ojo: `mirror-parity --check` solo mide frescura; la
  aserción de paridad real se construye en F4.

### F3 — La pintura vive en las skins

- Clasificar las 226 ocurrencias inline de los 41 engines: (a) valores de
  pintura migrables → a la skin; (b) selección dinámica de canal por variante
  (los resolvers de eje de Button) → mecanismo legítimo, no deuda. El ratchet
  se ancla solo sobre (a).
- Pasada de craft por familia contra raíces (Quiet Premium).
- Cerrar la deuda `--ds-chart-series-1..10` (pin del drill vuelve a 1).

### F4 — Los tres temas son espejos

- Reescritura como ~263 asignaciones de variantes sobre raíces.
- Aserción de paridad real como gate bloqueante (falla hoy: 19,3 %).
- Regenerar `styles/*.css`; colapsar los ~3.275 canales derivables.

### F5 — Una capacidad, un dueño

Con las adjudicaciones corregidas (§0.1) y estas notas de método:

- Todo retiro de componente incluye el paso showroom: registry, navigation,
  ruta, roster tests y capturas (omisión transversal detectada por Fable).
- `record-workbench` → `DetailSurface`: el lote incluye escribir el
  `EntityAdapter` por pantalla de compliance (3) — es migración de modelo, no
  de 3 campos. Su import directo de rol de icono no migra con él.
- `appearance/` se absorbe en orden: funciones al lowering único → preview
  consolidada en `tenant-preview` → carpeta fuera.
- Convergencias nuevas: `mono-stat` sobre el contador canónico;
  `terminal-block` sobre el sustrato `Typewriter`; `grid-view`/`gallery-view`
  comparten `item-identity`; `command-center` borra sus interfaces y mappers
  locales (ya tiene `mapStatsToStatDefs`/`mapActivityItems`: la convergencia es
  borrar, no reescribir); `PatternEmptyState` delega en `Empty`;
  `calendar-view`/`timeline` componen sus primitives.
- `Callout → Alert`: deshacer primero la dependencia de contrato
  (`Alert/contracts` ya importa de Callout).

### F6 — Frontera pública honesta

- Retirar 75 de 77 subpaths granulares (los 2 con importador en showroom —
  `./runtime/root-attributes`, `./runtime/visual-authority` — migran primero).
- Lista explícita de API en el barril raíz.
- Regenerar `dist/`; extirpar platform completo: `styles/platform.css`,
  baseline de `pack-inventory` (`:13770`), `dependency-honesty.mjs:3194`,
  `PERFORMANCE_BUDGET.md:56`. Re-acotar `public-entrypoint-boundary-gate`.
- Todo retiro de subpath entra en la major de §1.

### F7 — Higiene del repo

- Un solo árbol `test-artifacts/` (core); repuntear los **7** scripts (no 8:
  `platform-identity-zero-gate` solo filtra); decidir la evidencia huérfana de
  `cra-16` (trackeada, sin productor).
- quality-evidence v1 fuera (8 archivos + gate-test + línea npm; el receipt
  R0 en test-artifacts queda intacto como transcripción histórica).
- `packages/core/ARCHITECTURE.md` se pliega (anexos → `packages/core/docs/`);
  correcciones de `packages/core/README.md` (fila fantasma `styles/platform`,
  badge TS 5.7→5.9) y del README raíz (263→282 ×3, platform→rottay).
- Al cerrar el programa: docs de proceso a `docs/history/`; la constitución
  del manifest gradúa a `packages/core/manifest/`.
- Fuera de este repo pero anotado: el `CLAUDE.md` del **monorepo padre** sigue
  diciendo 99 WOs / craft 22 (el de este repo ya está corregido).

### F8 — Las apps entran al sistema

- Codemods primero, upgrade después (§1): `Space`→`Stack` (34),
  `ConfirmDialog`→`AlertDialog` (17), `Toggle`→`Switch` (8), `Link`→`TextLink`
  (3, fase 1), iconos vendor (241 archivos: platform 230, evnto 11, bithire 0),
  `AlertIcon`/`LoaderIcon` → fachada semántica (2 sitios), retiro del alias
  webpack de `/commercial` cuando la capacidad esté reclasificada.
- Ratchet decrease-only de imports vendor medido en disco sobre las apps.

## 3. Decisiones del dueño que quedan

1. ¿El manifiesto de CI absorbe los gates cableados vía `ci.yml`/lifecycle, o se
   declaran esos canales legítimos por escrito? (Mi recomendación: lo segundo —
   ya aplicado para el gate exports→artefacto.)
2. `map-view`: ¿se retira o se le consigue provider?
3. Evidencia `cra-16` huérfana de productor: ¿archivar o re-crear el productor?
4. ¿Las 10 raíces `gap` (canales sin dial que deberían tenerlo) abren controles
   nuevos en F1, o quedan como backlog aceptado?
5. Prioridad entre F2/F3 (cableado vs craft) si hay que elegir una sola cosa
   primero — mi recomendación: F2, porque el craft sin cascada crea deuda.

## 4. Lo que NO se toca

Sin cambios respecto al diagnóstico (§4), reforzado por Fable con consumidores
de apps medidos en disco. Lista completa en el diagnóstico.

---

*Fuentes: DIAGNOSTICO (tesis y frentes), DEPURACION-SCRIPTS (lotes de scripts
y datos), CONFORMIDAD-SRC (barrido mecánico), REAUDITORIA-FABLE (verificación
independiente con grafo de imports resuelto). Todo número de este roadmap fue
medido al menos dos veces por asientos distintos o queda marcado como heredado.*
