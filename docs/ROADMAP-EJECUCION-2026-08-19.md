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

**Enmienda de secuencia vinculante (dueño, 2026-08-20):** F2 se agota primero
en todo lo que sea demostrablemente seguro. El lote F2.4 que ya está abierto
**no se cancela ni se revierte** y puede continuar con todos los clusters que
demuestren cero-delta computado contra los artefactos de las tres verticales;
no se limita artificialmente al packet actual. «Misma pintura» significa
igualdad de propiedades computadas tras resolver la raíz; no alcanza una
sustitución textual plausible ni que el gate de frescura pase. Cada packet
debe declarar la raíz, los canales drenados, los tres resultados verticales,
el negativo y la restauración del artefacto.

Se siguen abriendo clusters F2 seguros hasta agotar ese conjunto. No se abre
un cluster si necesita inventar el valor de una raíz, si una
vertical no tiene asignación, si el cambio elimina una restitución que hoy
compensa una asimetría, o si el theme leaf todavía sombrea el control. Esos
casos quedan bloqueados por **F4A + F4B**. Por lo tanto, al cerrar el packet
F2 seguro exhaustivo, la secuencia operativa deja de ser `F2 → F3 → F4` y
pasa a ser:

```text
F2 seguro exhaustivo → F4A canon estructural → F4B calibración de los 20 controles
  → F2 diferido/asimétrico → F3 skins + craft → F4C art direction premium
  → F5 → F6 → F7 → F8 → F9 cierre de certificación
```

La razón es evitar que F3 traslade hardcodes a skins o que F2 cablee miles de
consumidores contra una autoridad de theme que F4 tendría que cambiar después.
La enmienda no cambia la arquitectura decidida: ordena sus dependencias y hace
explícitas dos puertas de aceptación que el plan anterior dejaba implícitas.

## 6. F3 — La pintura vive en las skins (posterior a F4A + F4B)

**Gate de entrada:** F4A cerrado, los 20 controles con F4B cerrado y los
clusters F2 asimétricos que esas decisiones desbloqueen ya recableados. F3 no
puede usarse para decidir la semántica de una raíz, reparar paridad de themes o
ocultar un control que no baja por ambos transportes. Su trabajo es trasladar
pintura ya gobernada y después elevar craft sobre una cascada estable.

- Clasificación mecánica estable (confirmada): **17 dinámicas** (resolvers de
  eje en Button/Select/Input/Badge/Avatar — mecanismo legítimo) y **209
  estáticas migrables**. Regex: `var\(--ds-[a-z0-9-]*\$\{`. El ratchet se ancla
  solo en las estáticas.
- Pasada de craft por familia contra raíces (Quiet Premium).
- ~~Cerrar deuda chart-series~~ → se mueve a F5 (depende de la absorción de
  `appearance/`, no de skins).

## 7. F4 — Themes canónicos, controles causales y art direction premium

F4 se divide en tres cierres distintos. «Theme espejo» describe **la misma
superficie semántica**, no valores iguales ni tres archivos copiados. La
estructura debe coincidir; la identidad de cada vertical debe seguir siendo
propia.

### F4A — Canon estructural de los tres themes

- **Diseñar el esquema de asignación de variantes** (no existe: el catálogo
  tiene conteos, no nombres/valores de variante; 37 de 63 raíces —27
  internal-head + 10 gap— no reciben variantes de ningún control). Esto es
  diseño, no solo ejecución.
- Rottay, BitHire y Evnto quedan con el mismo roster, orden, comentarios,
  keypaths y disposición de capability. Una ausencia debe ser una invariancia
  o gap escrita; nunca una omisión silenciosa ni un roster menor.
- Cada valor autorado se adjudica en uno de cuatro domicilios existentes:
  (a) seed/variante gobernada por un tenant-dial; (b) baseline o invariante
  vertical con razón; (c) internal-head derivado por una función/raíz citada;
  (d) Pro/Expert explícito y acotado. Si no entra en ninguno, no se conserva
  por costumbre: queda bloqueado hasta adjudicación o retiro.
- **Ley de hardcodes:** un literal es legítimo en el punto superior donde la
  vertical elige su seed, variante o invariante. Un leaf que reexpresa esa
  decisión debe derivar de la raíz/canal; no puede repetir un hex, sombra,
  tamaño o mezcla que sombree la personalización. Tampoco se crea un segundo
  `foundation` dentro de `brand-themes`: foundation, compiler y theme tienen
  un dueño cada uno.
- F4A reescribe los 3 themes como el roster mínimo de asignaciones gobernadas
  (estimación vigente: ~263) y registra los ~3.275 canales derivables como
  candidatos de colapso; **todavía no hace craft premium ni colapsa en masa**.
- **Salida F4A:** paridad estructural blocking, cero keypaths sin domicilio,
  cero leaf shadowing no justificado, mismo lowering y artefactos frescos. El
  valor visual puede seguir siendo el baseline previo; la forma ya no.

### F4B — Calibración causal de los 20 controles públicos

El cierre de vocabulario de F1 y el cableado de F2 no prueban que un dial del
usuario funcione. Antes de acreditar propagación mecánica, cada uno de los 13
controles Standard y 7 Pro debe cerrar un receipt con:

1. dominio y stops admitidos por la autoridad viva;
2. path de ingreso estático `BrandTheme` y path DB `TenantThemeDocument`;
3. normalización a un `Theme` total y entrada al mismo `compileTheme` — un
   segundo emisor es STOP;
4. salida normalizada equivalente para ambos transportes;
5. canary representativo que cambia una propiedad computada observable;
6. negativos que prueban qué propiedades/familias no deben cambiar;
7. input inválido fail-closed y límites efectivos cuando correspondan;
8. restauración exacta del default en salida normalizada, variables, atributos
   de raíz y propiedad computada.

Los controles cuyo terminal legítimo sea dato normalizado, no CSS, demuestran
ese terminal y no inventan una variable para «cumplir». Ninguna fila gana
`APPLICABLE`, `COMPUTED_VERIFIED` o equivalentes sólo porque existe un mapping,
un `targetBinding` o una ley escrita. **Salida F4B:** matriz de calibración
20/20, sin segundo lowering, con receipts reproducibles y challenge read-only.

Con F4A + F4B cerrados se retoma F2 exclusivamente para las raíces/colas que
estaban bloqueadas por asimetría. Recién cuando esas colas pasan sus pruebas de
delta y restore se abre F3.

### F4C — Art direction premium sobre controles estabilizados

- Después de F3, los tres themes reciben una iteración de diseño diferencial:
  Rottay, BitHire y Evnto deben comunicar su vertical, no ser recolores de una
  misma composición. El vocabulario es el estabilizado en F4A/F4B; una idea de
  diseño que requiere un eje nuevo vuelve a contrato y no se hardcodea en un
  leaf.
- El craft se expresa mediante seeds, variantes, roots, recetas, anatomía y
  estados gobernados. Classic/Rustic reciben sólo compatibilidad necesaria;
  la inversión de calidad se concentra en Modern.
- La aceptación requiere challenge visual y técnico independiente. Quien actúa
  como DT no se cuenta a la vez como auditor independiente. Se revisan light/
  dark cuando aplique, estados interactivos, contraste, densidad, tipografía,
  motion, superficies, navegación y coherencia entre familias.
- **Gates del lote:** `vertical-css-source-staleness`,
  `first-party-artifacts-source-staleness`, los 4 checks de
  `customization-surface-census` (incluido `dead-writers`),
  `theme-channel-parity --check`, regeneración de
  `generated/mirror-parity.json` + `fanout-facts.json`, canaries F4B intactos y
  revisión sighted de las tres verticales.
- **Salida F4C:** paridad estructural blocking, valores verticales premium,
  cero shadowing regresado y los artefactos generados como salida — nunca como
  fuente editada.

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

## 11-bis. F9 — Cierre final familia × control

F1 hizo que cada celda tuviera ley; no la convirtió en evidencia. El estado
vigente al adoptar esta enmienda sigue siendo **255 familias × 20 controles =
5.100 celdas**, todas `UNKNOWN`, con cero `COMPUTED_VERIFIED` y cero
`SIGHTED_ACCEPTED`. Esa verdad se lee de `manifest/index.json`; **252 permanece
histórico y no reaparece**.

- F9 corre después de estabilizar F5/F6 y migrar F8. Si una absorción de F5
  cambia realmente el roster, el nuevo denominador se actualiza en un solo lote
  atómico en `family-inventory`, `program.json`, segmentos del manifest,
  generator/index y checks. Hasta que ese lote exista y pase, 255×20 sigue
  siendo la única verdad operativa.
- Se visita cada pareja familia/control y se adjudica exactamente como
  `APPLICABLE`, `INVARIANT_WITH_REASON` o `NOT_APPLICABLE_WITH_REASON`.
  `UNKNOWN` bloquea el cierre; ausencia nunca significa «no aplica».
- Las aplicables citan partes/estados/grupos de propiedad, channels y bindings;
  prueban deltas computados, negativos y restore. Las invariantes/no-aplicables
  llevan razón falsable y prueba de no-alcance.
- El mapping, `SOURCE_BOUND`, una fila vacía o una marca de adjudicación no son
  quality points. La promoción a `COMPUTED_VERIFIED` y `SIGHTED_ACCEPTED`
  conserva la escalera del programa y su autoridad de aceptación.
- **Criterio de cierre:** `UNKNOWN = 0`, ninguna familia sin review, receipts
  estático/DB y restore frescos, manifests/artefactos regenerados por su dueño,
  `program-check` y gates blocking verdes, auditoría independiente final y
  checkpoint de punto cero. Sólo entonces «Modern Rescue completo» es una
  afirmación permitida.

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

**Tomadas (2026-08-20, enmienda de secuencia):**

10. **F2 seguro se termina de forma exhaustiva:** el F2.4 en vuelo no se
    revierte y puede encadenar todos los clusters con cero-delta computado en
    las tres verticales. Sólo el residuo que necesita una decisión de theme se
    difiere a F4A/F4B; no se inventa una asignación para declarar F2 cerrado.
11. **F4 se divide y se adelanta en parte:** F4A y F4B preceden a F3; las colas
    F2 asimétricas se cierran entre F4B y F3; F4C premium corre después de F3.
12. **F9 es obligatorio:** gobernado no significa certificado; el programa no
    cierra mientras `UNKNOWN` sea distinto de cero.
13. **Autoridad de agentes:** esta enmienda no permite que un mismo actor sea DT
    y auditor independiente. La identidad operativa vigente debe reconciliarse
    atómicamente en `AGENTS.md` y las autoridades/checkers de Modern Rescue;
    este Markdown no las sobreescribe por sí solo.

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

### Libro mayor único del DT — estado vigente 2026-08-21

**Este roadmap es desde ahora la única escribanía durable del programa.** Toda
medición, adjudicación, implementación, prueba, rechazo, aceptación, bloqueo y
siguiente paso se registra acá. El handoff externo queda deprecado como simple
puntero a este documento; no conserva estado paralelo. La regla de escritura es:

1. trabajo en curso se registra en esta sección con estado explícito
   `READ-ONLY`, `PENDIENTE`, `REJECT` o `ACCEPT_WITH_CORRECTIONS`;
2. sólo una implementación con pruebas causales seriales, inspección DT y
   postaudit Fable `ACCEPT` se registra como cierre `✅`;
3. `roadmap/registry.json` y `checkpoint.intent.json` se actualizan cuando el
   tranche correspondiente los gobierna; no se inventa progreso para hacerlos
   coincidir;
4. cada asiento conserva HEAD/preestado, write-set, hashes de memos, gates,
   stop conditions y próximo paso, para poder reanudar desde cero sin memoria
   de la sesión.

#### Autoridad y roles vigentes

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system`.
- HEAD anclado al abrir este asiento:
  `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`
  (`chore(modern-rescue): hand DT control back to Codex`).
- Preestado: worktree limpio; staged 0.
- Codex: DT y autoridad de adjudicación.
- Claude Opus: arquitectura e implementación de riesgo medio.
- Claude Sonnet Max: medición e implementación mecánica bajo brief cerrado.
- Fable 5: auditor formal estrictamente read-only.
- **Kimi K3 está fuera por varios días y no es gate, auditor, implementador ni
  dependencia**, por aclaración explícita más reciente del owner. Toda cláusula
  histórica `OPEN_KIMI`, `Kimi bloqueante`, `doble ACCEPT Fable+Kimi` o
  equivalente queda superseded. Las decisiones abiertas pasan a `OPEN_DT` y se
  resuelven por Codex con propuesta Opus y challenge Fable.

#### Cierres firmes que sostienen el frente actual

- F0/F0.5/F1/T-1 de transferencia: cerrados según sus asientos históricos.
- F2 seguro: cerrado; la cola asimétrica permanece detrás de F4B.
- `program-check.mjs`: `CONSTITUTION_READY` sobre el HEAD anclado.
- F4A está cerrado hasta F4A-13. No se reescriben sus asientos históricos; las
  correcciones nuevas se registran en la cadena 14/15/close de abajo.

#### F4A-14 / K4 — plano de raíces

K4 es una reparación documental del plano de raíces: 8 repairs contractuales,
3 no-op preservados y 5 ausencias preservadas. No materializa themes, no cambia
pintura y su write-set eventual exacto es:

1. `packages/core/manifest/cascade/root-catalog.json`;
2. `docs/f4a/roster-variantes.json`;
3. `docs/f4a/roster-variantes.md`.

Cadena read-only/preaudit:

- Opus v1 `/private/tmp/f4a-14a-opus-implementation-brief.md`, SHA
  `bb44393a163e1624b75b2d2fbab572b3c50dc71bfc4dd97526c15cf16fa14837`;
  Fable REJECT v1 `/private/tmp/f4a-14a-fable-preaudit.md`, SHA
  `50b307dedc89c751c9b77096d8a0a0dd5470258af76e985faa4c0203932adbd2`.
- Opus v2 SHA
  `99b31ed5fcd849fe008232a2097a971c5442ac5f70b66f184913b6801be00e76`;
  Fable REJECT v2 `/private/tmp/f4a-14a-v2-fable-reaudit.md`, SHA
  `adb815ef7f30dd2d3be5c860271424fd6dbb562ad9556f22a5051949f8e3e53b`.
- Opus v3 final `/private/tmp/f4a-14a-opus-implementation-brief-v3.md`, SHA
  `06ecaa76c0a54b018fa91ca5d1bc68326e83e0af8af49c7779361a9ec0622ff1`;
  Fable `ACCEPT` `/private/tmp/f4a-14a-v3-fable-reaudit.md`, SHA
  `22c39c6de36f75cd78e53f192f00106af249db033cd20a0e3f559d41cc0f5918`.

Verdad reproducida: 64 raíces suman `268 = 101 + 97 + 70`;
`tier.page.ink` explica drift `+5`; K4 resta 7 y debe dejar
`261 = 95 + 96 + 70`. Se preservan BitHire base+dark en raised/overlay
foreground, `effectIntensity=0.58`, declinaciones Rottay/Evnto y cero
materialización.

**K4 CERRADO — implementación y postaudit 100%.** Sonnet Max implementó el
write-set exacto de tres paths y emitió `SOURCE_READY` en
`/private/tmp/f4a-14a-reporte.md`, SHA
`20d748556bc9272cd74331701ee7138c1dde25000d1d3fb3bae971e5f407f088`.
Fable inspeccionó el diff completo, re-derivó la aritmética y dio `ACCEPT` en
`/private/tmp/f4a-k4-fable-postaudit.md`, SHA
`e81d965fd51643e6c2a05f0fbcdddc51b6312e793aa8fd91a23b7768472174f4`.
Resultado: 64 raíces; assignments `261 = 95 + 96 + 70`; estados de canal
`47 existe / 10 por-crear / 7 solo-artefacto`; exposure `26/28/10` intacto;
198 entries de roster, 16 reparadas dentro de las ocho raíces objetivo y 174
fuera byte-idénticas. `control.ratio.iconSize` queda explícitamente parcial y
su canal se adjudica en F4A-close; no se vende como cerrado. Cero cambio de
theme, valor, artefacto o pintura; staged 0 y `git diff --check` verde.

#### F4A-15 / K5 — Table, unión semántica y decisiones abiertas

Cadena de medición/adjudicación, toda read-only:

- Sonnet `/private/tmp/f4a-15-k5-sonnet-inventory.md`, SHA
  `5ea2c0eaef80e802730ae44f139d736565b1f2d51286d8d1adf6b7bd0c2bf2a2`.
- Opus v2 `/private/tmp/f4a-15-k5-opus-adjudication-v2.md`, SHA
  `3590a3234222bb74386e2dac4cfd945ee064ae82bf3f30629924c7686e3869a9`.
- Sonnet semantic map v2
  `/private/tmp/f4a-15-k5c-sonnet-semantic-map-v2.md`, SHA
  `fdf3ccc7a1831dce49636afde07d3d5c2f7c73f33bf9a38bc20caff58b3c9c4b`.
- Fable ratificación semántica
  `/private/tmp/f4a-15-k5c-v2-fable-ratification.md`, SHA
  `f0a972c08134c3c307435db15a86d498c4bd826708d8789ad574a2e622b6f967`,
  `ACCEPT`.
- Packet final Opus v1 fue rechazado por falsa colisión de write-sets:
  `/private/tmp/f4a-15-k5-final-packet-fable-preaudit.md`, SHA
  `44414513d85d4b3d0d34c177be330b26629a8c61abc0d8a29de1dca582d608ca`.
- Packet corregido Opus v2
  `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md`, SHA
  `c29bf3fbfd5cdbf81b106d595c70c4572b2864549fdc52746aaf951f27a3ae15`;
  Fable `ACCEPT` en
  `/private/tmp/f4a-15-k5-final-packet-v2-fable-ratification.md`, SHA
  `d2554c9068836bd364e18d979c058ac8e416871d607bdff16220fbbb3cc3fe20`.

Verdades medidas:

- 40 hojas autoradas sin tag = 36 BitHire + 4 Evnto + 0 Rottay, todas en
  `CHROME.table`;
- K5a mínimo mecánico = 6 hojas BitHire y contador esperado `40→34`;
- unión léxica 37 y conjunto emissible 37 están en biyección 1:1;
- 34 ejes semánticos tras colapsar padding; gaps `46 = 16 + 0 + 30`;
- 132 canales consumidos por Modern: 34 emitidos+consumidos, 3 emitidos muertos
  y 98 consumer-only que no son automáticamente campos del theme;
- `anatomy` es un plano vivo de atributos, no un canal CSS desconectado;
- los tres números `34` del paquete son distintos: ejes semánticos, canales
  emitidos+consumidos y destino del contador K5a.

**K5 CERRADO — implementación, postaudit y sello 100%.**

Brief consolidado Opus `/private/tmp/f4a-k5-full-consolidated-opus-brief.md`,
SHA `7580e63289d7ef2ad3f01e69737ee790e32335d0d6ef8f9809ae2e51a675ace8`. El
preaudit Fable dio `REJECT` y corrigió 6 governors + `radius` + `cellFontSize`;
adenda DT `/private/tmp/f4a-k5-full-dt-corrections-v2.md`, SHA
`f38de26fa8fd20a14825de6ba8f3517a3421dc9de40c83eac0102e6f2336112a`; ratificación
Fable `/private/tmp/f4a-k5-full-fable-ratification.md`, SHA
`d4be41dfc06007a27170d4660e83285f2255bf8f5fe2872982f2c9c666c67b12`, `ACCEPT`.

SOURCE_READY Sonnet `/private/tmp/f4a-k5-full-sonnet-source-ready.md`, SHA
`e3d9adb415abe70e8488e6b295454dac17f4739d6b1f51bead08adb0b62b23e6`; postaudit
Fable `/private/tmp/f4a-k5-full-fable-postaudit.md`, SHA
`b4b401eae4fec10ac976845056f5c8fd6abde65063e2f93f0a66822ecf53a619`, `ACCEPT`.

57 docblocks: rottay 17 + bithire 36 + evnto 4; 7 `derived` + 50 `seed`; −1
family tag stale (rottay), `headerColor` rottay preservado; cero valores
tocados. `untaggedAuthoredLeaves` 40→0, `divergentSlots` quieto en 33,
`tagRegistry` 4099→4155. Una sola `Baja #14`. La clausura derivada dejó 11
diffs materiales de 12 productores porque `root-checklists.json` quedó
byte-idéntico honestamente (no proyecta líneas de `brand-themes`). R-1
reprodujo exacto: `1719/1706/12/1`, identidad nominal.

GAT-07 tuvo un primer intento con `STOP` correcto por el alias
`reproducibility.authorityDigest` (movimiento legítimo mal enumerado en el
brief); restore limpio. Adjudicación Opus
`/private/tmp/f4a-k5-gat07-authority-digest-opus.md`, SHA
`f9ae84efdeb5f9695fc4f30901b003c52e529a5cbe299cc50a64d9d797af7116`; Fable
`/private/tmp/f4a-k5-gat07-authority-digest-fable.md`, SHA
`6e2a800ae0956b3c34db5e6b53e8a178cde888408ea4359d4f341d20d7b6abf2`; reintento
SOURCE_READY `/private/tmp/f4a-k5-gat07-seal-sonnet-retry-source-ready.md`,
SHA `1427ebec193fc249c818d081eb3147b005a2d90435c09db13af006704e419471`;
postaudit Fable `/private/tmp/f4a-k5-gat07-seal-fable-postaudit.md`, SHA
`884d3cbf898ff00cbc25f29b42aaf52522675868eb694b9b268c3ae639ebd01b`, `ACCEPT`.
`gates:ci`: 89 blocking `PASS` + 2 excluded (`channel-liveness`,
`lane-control-drills`); `gat-07-exact-proof` en `PASS`; cero build, cero
browser. El nombre legado `KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json` es un
artefacto histórico, no un actor de la cadena: Kimi sigue fuera de toda
decisión.

Deudas separadas pendientes, no reabren K5: placeholder K5c
`evnto × CHROME.table.border` (posterior al rediseño de `realKeypathParity`,
ver abajo); retirar `baseline` de `DOMICILES`; los tres canales muertos
(`filterRowBg`, `filterFocusShadow`, `loadingOverlayBg`); y el sidecar
`semantic-groups` + su gate como propuesta **posterior, no adjudicada**,
activable sólo si algún tema empieza a autorar `chrome.<familia>.anatomy`
(medido hoy: 0/0/0 en los tres temas). Pertenecen a F4A-close.

#### F4A-close — reconciliación read-only y correcciones vinculantes

- Inventario Sonnet `/private/tmp/f4a-close-sonnet-inventory.md`, SHA
  `d52f36ac4a086bc3f196255573c0d4203032b194bd09685c32a7d569998abd87`,
  `INVENTORY_READY`.
- Adjudicación Opus `/private/tmp/f4a-close-opus-adjudication.md`, SHA
  `9ab5229577259f5bc2df76f31522346f42a9dabb2a74c4ac0be438b8a6d15b2a`,
  `READY_FOR_FABLE_CHALLENGE`.
- Challenge Fable `/private/tmp/f4a-close-opus-fable-challenge.md`, SHA
  `e5375ae35be400a78abb492d3d94b6ad112d57989ca02f85fb0968cde2939845`,
  `ACCEPT_WITH_CORRECTIONS`.

Hallazgos aceptados:

1. `program-check.test.mjs` muta/renombra el manifest real mientras el gate lo
   corre concurrente con `manifest/generator/index.test.mjs`: P1 de carrera y
   P0 de `renameSync`; `try/finally` restaura asserts, no crash/SIGKILL.
2. `cra-12` planta en source real; se aísla separadamente con
   `--workspace-root` y copia de los dos sourceRoots completos (medidos
   ~46 MB/4264 archivos), conservando digest path-relativo+contenido.
3. `cascade-wiring-ratchet` trata cualquier fallback como raíz posicional, no
   consulta root-catalog y sus cuatro invariantes de forma son tautológicos.
   Caso vivo: `--ds-input-md-icon-size`. La reconstrucción queda PRE_F4B; F4A
   sólo deja una cerca honesta.
4. `realKeypathParity` no existe. La fórmula Opus
   `evaluatedUnion - evaluatedIntersection -> 0` queda **rechazada** por
   inalcanzable (`2559-342=2217` con exclusividad legítima); `1918/1823` queda
   prohibido sin derivación reproducible. Debe rediseñarse para certificar cero
   shadowing real sin castigar exclusividad adjudicada ni esconder placeholders.
5. `program.statusAuthority` es un pin literal, no una ruta resuelta. El bloque
   README stampado es el drift operativo severo y `program-state --check` no
   está cableado a CI.
6. Restore universal `git show HEAD:path > path` queda rechazado. Todos los
   tranches usan backup por contenido, prehash, existencia por path, restore por
   copia+rehash y diff completo del porcelain.
7. Denominador F4A-close = 14 salvo subsunción DT citada de la clase
   `evnto compone desde preset canónico`. Preparación honesta tras challenge:
   `14/14` medida, aproximadamente `7/14` diseñada, `0/14` implementada.

Correcciones Fable C-1…C-7 son vinculantes: rediseño de paridad; reapertura
explícita de T-0; autorización explícita para adelantar test-hygiene; clausura
completa del sandbox (`customization-surface-census`, AGENTS/CLAUDE, showroom y
~25 site-files); negativas que cubran ambos backups y crash determinista sólo
post-fix; clase Evnto faltante; postura de roots `por-crear`/`solo-artefacto`.
Las frases del memo Fable que aún tratan a Kimi como gate quedan superseded por
la orden más reciente del owner registrada arriba; las correcciones técnicas
permanecen válidas.

#### Resolución DT de secuencia

Resolución durable preparada en
`/private/tmp/f4a-pre-k4-dt-sequence-ruling.md`, SHA
`baa48c13d99db39c150c4eb2329d189e24e8bb34340a04a83b391549565c7bd2`.
El DT reabre expresamente la adjudicación histórica que enviaba authority/test
hygiene después de K4, porque no se certificará K4/K5 con evidencia dependiente
del timing ni con el punto de entrada humano publicando roles retirados.

Cola vinculante vigente. Los nombres `T-*` son **micro-tranches locales de
hardening pre-K4**; no son F0 ni reinician el roadmap:

1. **Hardening pre-K4 / authority-honesty (antes T-0)**: corregir
   intent/README, cablear `program-state --check`, canon esperado
   `89 blocking + 2 excluded`.
2. **T-1a**: sandbox de `program-check.test.mjs`, clausura derivada y negativas
   de mutación/crash; serialización sólo como cerca interina.
3. **T-1b**: sandbox `cra-12`, corpus completo relevante y baseline pair-aware.
4. **K4 — CERRADO**: brief v3, tres paths, tests seriales y postaudit Fable
   `ACCEPT`.
5. **K5 — CERRADO**: 57 docblocks (7 `derived` + 50 `seed`), `untaggedAuthoredLeaves`
   40→0, `divergentSlots` 33, `tagRegistry` 4155; postaudit Fable `ACCEPT`;
   GAT-07 sellado (reintento) con postaudit Fable `ACCEPT`; `gates:ci` 89
   blocking + 2 excluded.
6. Paridad real — **CERRADA**: `silentPairs` 53→0 sobre 7677 pares,
   `placeholderPairs` quieto en 3969, `tagRegistry` 4208; postaudit Fable
   `ACCEPT`.
7. **F4A-close — CERRADO 14/14 (2026-08-22)**: Lotes A (parser P2 + 52
   governors + cerca PRE_F4B), B (iconSize) y C (retiro de `baseline` de
   `DOMICILES`, la última obligación abierta), cada uno con postaudit
   Fable `ACCEPT`; arbitraje final Fable `F4A_KEEP_OPEN→CERRADO` con los
   ocho requisitos de su §4 resueltos. Ver asiento arriba.
8. `PRE_F4B` (inventario mecánico del gate cascade — `INVENTORY_READY`,
   diseño/implementación NO aceptados) → `F4B 20/20` (bloqueado hasta el
   gate falsable de cascade) → F2 asimétrico → F3 responsive/skins → F4C
   premium → F5 → F6 → F7 → F8 → F9 5100/5100.

#### Hardening pre-K4 / authority-honesty — SELLADO

Fable ratificó la secuencia completa con `ACCEPT` en
`/private/tmp/f4a-pre-k4-fable-sequence-ratification.md`, SHA
`e6a6ba3f60924d8ada3b9d740e43ed30c2d6083439bdb54b1c6149b5d521a263`.
Queda vinculante R-1: K4/K5 se comparan contra la baseline re-anclada después
de que T-1a y T-1b estén aceptados, supersediendo el literal histórico
`1717/13` sin editar sus briefs. También queda vinculante R-3: este lote deja
el canon en `89 blocking + 2 excluded`; si T-5 agrega otro gate debe
re-declararlo y arrastrar todos los contadores vivos.

El DT admitió el write-set exacto de cinco paths en
`/private/tmp/f4a-t0-dt-adjudication.md`, SHA
`0d9b57705609be63533e3ede44a3feaa10b396484790f66ea96a44711fe4d468`.
Opus implementó el lote y emitió `SOURCE_READY` en
`/private/tmp/f4a-pre-k4-hardening-opus-source-ready.md`, SHA
`291ff3e9c8e0cecc22e42dcd3a1194059337574a11cafc0ddef707193d27e94a`.
Fable inspeccionó el diff completo y dio `ACCEPT` final en
`/private/tmp/f4a-pre-k4-hardening-fable-postaudit.md`, SHA
`929870cd5ccfb1fb54fca8474e08733ca2e8a5c0b312b2688a61456f97232997`.

Resultado medido: `program-state --check` verde; `intentDigest`
`5a86b12ae6369bdd`; `renderDigest` `55b37c5b919255e4`; gate nuevo único en
índice 14; `91 total = 89 blocking + 2 excluded`; `validateManifest []`;
`gates:ci` completo bajo Node `v22.17.0` con `89 PASS / 0 FAIL / 2 excluded`.
La primera corrida bajo Node 25 falló honestamente en `gat-07-exact-proof`
porque CI pinea major 22; ese gate sólo lee `ci.yml` y `pnpm-lock.yaml`, fuera
del write-set. Ambas corridas quedaron preservadas. La negativa de edición
manual del bloque dispara P8 sola, no P7+P8: P8 conserva detección blocking y
Fable aceptó explícitamente la corrección. HEAD no se movió, staged sigue 0 y
no hubo commit.

#### T-1a / sandbox de `program-check.test.mjs` — SELLADO

Opus emitió brief read-only
`/private/tmp/f4a-pre-k4-t1a-opus-brief.md`, SHA
`53110c0573ec41e3c208028ad3b0e1046862f46e6f5872519376fe3a67465e02`,
con write-set corregido a un solo path. Fable lo preauditó con `ACCEPT` en
`/private/tmp/f4a-pre-k4-t1a-fable-preaudit.md`, SHA
`be99a11fe11c3bf3d94235659e7fa02ad69ff1aaa5e28f6be4bdb6b4cf23ab6e`.
Sonnet Max implementó el sandbox y emitió `SOURCE_READY` en
`/private/tmp/f4a-pre-k4-t1a-sonnet-source-ready.md`, SHA
`95d695f8190fd4ed4c2e70a59781403ce011609653559f2936b644f700344906`.
Fable inspeccionó el diff completo y dio `ACCEPT` final en
`/private/tmp/f4a-pre-k4-t1a-fable-postaudit.md`, SHA
`f5c3f1044f03261b40f271eceb1189df0e81acca856b52ba2f1403075a8cb851`.

Resultado: las 37 escrituras y tres pares de rename de la suite caen sólo en
un sandbox de clausura completa fuera del repo; imports y resolvers no vuelven
al árbol vivo; los dos symlinks de `node_modules` son read-only y el guard
rechaza write-through. Cohorte causal repetida tres veces, cinco SIGKILL,
manifest vivo `360/360` byte-idéntico y cero residuos. `test:scripts` midió
`1719 tests / 1705 pass / 13 fail / 1 skip`: las mismas 13 fallas nominales
preexistentes y dos tests verdes adicionales. `gates:ci` bajo Node 22 quedó
`89 blocking pass / 0 fail / 2 excluded`.

#### T-1b / sandbox del drill CRA-12 — SELLADO

Brief Opus
`/private/tmp/f4a-pre-k4-t1b-opus-brief.md`, SHA
`83df046539cc498ee129c7fd9fc48a11856488f9fc53e88f1ffa74e0be50ca7d`;
preaudit Fable `ACCEPT` en
`/private/tmp/f4a-pre-k4-t1b-fable-preaudit.md`, SHA
`1223e2cf83c90d447e6e558bbfb4e7b2499cb3b09115e161bfb2ddcf55076eee`.
Sonnet Max implementó el único path y emitió `SOURCE_READY` en
`/private/tmp/f4a-pre-k4-t1b-sonnet-source-ready.md`, SHA
`1a42e6fffc22b1a7dcb1b42c12cb5adbc088de905bb0da9b79ff996fc5c66e86`.
Fable atacó el diff real, cleanup, escapes y false-greens, y dio `ACCEPT`
final en `/private/tmp/f4a-pre-k4-t1b-fable-postaudit.md`, SHA
`df8f92c8ce08d48651596d9eaed55b2d4228bd4e04941feff4fb8fe7ed2f1ac9`.

Resultado: `cra-12-motion-governance.reanchor.test.mjs` copia el corpus
completo gobernado a un sandbox fuera del repo y la planta vive sólo allí.
Directo `6/6`, hermana `16/16`, cohorte con el walker `66/66` por tres
corridas y ambos `export-missing`/`export-unshipped` verdes sin alternancia.
`gates:ci` bajo Node 22: `89/89 blocking PASS`, `0 FAIL`, `2 excluded`.
El árbol vivo, registry y siete dirty preexistentes quedaron byte-idénticos;
staged 0, cero residuos y ningún commit.

La desviación de backup por `git show` fue aceptada por Fable como no material
en este caso limpio, pero queda escalada como ley V-1: desde el próximo tranche
el backup es `cp` del worktree verificado contra prehash y una tercera
reincidencia es `REJECT` procesal.

#### R-1 / baseline de pierna 1 — RE-ANCLADA

Asiento durable del DT:
`/private/tmp/f4a-pre-k4-r1-reanchor.md`, SHA
`09d8a180cd0ab34bbde5656ac77536f66c4c33c2d215c8130038cdeaf23c0c23`.
Después de ambos postaudits `ACCEPT`, Codex ejecutó dos `pnpm test:scripts`
oficiales, seriales, bajo Node `v22.17.0`. Ambas dieron exactamente
`1719 tests / 1706 pass / 12 fail / 1 skip`; el diff de nombres completos,
fallas y skips entre runs fue vacío. Logs:
`/private/tmp/f4a-r1-official-run-1.log` SHA
`9d931a1fa811b2c63bf23a3a70a0d3ef5a1e5fe3886eabe322cb461ddf19e007`
y `/private/tmp/f4a-r1-official-run-2.log` SHA
`e59903275b46a94b56dd2cf0709f3fb9cc22da633654c3fbe636e901c500c260`.

Los dos tests agregados quedan nombrados: `coordinator succession fails
closed` y `tenant art direction creative advisor retirement fails closed`,
ambos verdes. El único skip es `--modern reports the four states over the real
tree and keeps them internally consistent` porque `dist` no está construido.
Los 12 fallos nominales exactos viven en el asiento durable; ninguno es
`export-missing` ni `export-unshipped`, que quedaron verdes en ambas corridas.

R-1 supersede el literal histórico `1717/13` para aceptar K4/K5 sin editar
briefs ni asientos históricos. K4 y K5 están implementados y postauditados
`ACCEPT`; K5 reprodujo R-1 exacto (`1719/1706/12/1`, identidad nominal).

La paridad real (`realKeypathParity`) **CERRÓ**: nueva disposición
`@absent <hoja exacta>` + `@governor` en `variant-parity` (ruling DT + Fable
`ACCEPT_WITH_BINDING_CORRECTIONS`); 53 bloques escritos en los 3 temas
(rottay 19, bithire 1, evnto 33), incluido `evnto × CHROME.table.border`
como `declared-absent` — no placeholder. `silentPairs` 53→0 sobre 7677 pares
(tema,slot); `placeholderPairs` quieto en 3969; `tagRegistry` 4155→4208;
47/47 tests del productor verdes. R-1 reprodujo `1732/1719/12/1`: +13 tests
(los de este lote, todos verdes, cero regresión), los 12 fallos y el skip
idénticos a la referencia. `gates:ci` cerró 89 blocking + 2 excluded.
SOURCE_READY Sonnet
`/private/tmp/f4a-close-real-parity-sonnet-source-ready.md`, SHA
`9256c7688d8b6af488c1cdbf51ee8ae22251fc2f63b4754077d59bb6b8dbe73c`;
postaudit Fable `/private/tmp/f4a-close-real-parity-fable-postaudit.md`, SHA
`c1b081910ad347ad1d6cc02f659e71763186313d08df20fafab4ecc00e90b563`, `ACCEPT`
(un hallazgo P2 no bloqueante, ver abajo).

El sidecar `semantic-groups` sigue sin ancla en el repo y sin adjudicar
(Opus, `/private/tmp/f4a-close-semantic-groups-opus.md`, SHA
`9298efb4fbd690fdfc88722c57b2ea3929b46f0755bda902063bd73ad30f5cdc`,
`VERDICT: STOP`): el plano `attribute` no existe en el universo de
`authoredLeafPaths` porque `anatomy` no está autorado por ningún tema hoy
(0/0/0), así que el sidecar sólo se activaría si eso cambiara. Queda como
propuesta posterior sin adjudicar. El siguiente paso de F4A-close son las
deudas semánticas, el ratchet a cero, la cerca cascade y la auditoría final
(cola vinculante, ítem 6).

**P2 no bloqueante registrado (Fable, postaudit real-keypath-parity):** la
regex de continuación `nextIsText` en `manifest/variant-parity/index.mjs`
(línea ~192 a la fecha del postaudit) sigue siendo
`@(domicile|governor|placeholder)` sin `absent`. Efecto medido: un docblock
ordenado `@governor` antes que `@absent` se rechaza como `malformed:
"governor multilinea"` — fail-closed (rojo de más, nunca verde de menos),
mensaje engañoso nada más; impacto vivo hoy es cero (los 53 bloques usan la
forma canónica `@absent` primero). Arreglo mínimo para la próxima vez que se
toque este archivo: extender el patrón a
`@(domicile|governor|placeholder|absent)\b`, con un fixture de orden
invertido.

#### F4A / F4A-close — CERRADO 14/14 (2026-08-22, acto DT)

Arbitraje final Fable, `/private/tmp/f4a-final-conflict-fable.md`, SHA
`f3737fd8ee778b10001e1ac0a9a5314ee708bdf03e5a46ca1550437afdb7a425`:
veredicto `F4A_KEEP_OPEN` condicionado a un solo lote sustantivo (Lote C);
los otros tres conflictos abiertos (C-1a los tres canales, C-1c el
sidecar, C-3 la clase evnto/preset) quedaron adjudicados en el mismo
arbitraje, sin escritura. Ejecutados en orden, cada uno con SOURCE_READY
Sonnet + postaudit Fable:

- **Lote A** — parser P2 + 52 governors + cerca PRE_F4B + clausura
  derivada. SOURCE_READY Sonnet
  `/private/tmp/f4a-close-lot-a-sonnet-source-ready.md`, SHA
  `376864d0350661cedcffd8d91597baf6852e1fc243eeb7def4625e7eb43c8f24`.
  Postaudit final (sello GAT+CI) Fable
  `/private/tmp/f4a-close-lot-a-fable-final-postaudit.md`, SHA
  `fe593863a4ee9daaa73ec33950dba329f69f6d2817afcd898178a7e1b75f11c9`,
  `ACCEPT`. Cierra el parser (`nextIsText` acepta ahora `@absent`, con el
  fixture de orden invertido exacto que pedía el P2 anotado arriba en el
  asiento de paridad real — **esa deuda queda resuelta, no sólo
  documentada**), 52 docblocks de sólo texto (10 CHARTS + 18
  CHROME.accent `unassigned→seed`; 12 CHROME.statsGrid + 12
  OVERLAY.chrome.statsGrid gemelas confirmadas `seed`, cero valor
  tocado), la cerca ejecutable PRE_F4B (`rootsExcludedNote` + test
  consumido por `cascade-wiring-ratchet-drill`, sin fila de gate nueva) y
  la clausura derivada causal (`fanout-facts`/`root-checklist`
  byte-idénticos). `tagRegistry` queda quieto en 4208. GAT-07 resellado
  sobre este source, `gates:ci` 89+2.
- **Lote B** — iconSize: catálogo + generator + `manifest/index.json` +
  roster. SOURCE_READY Sonnet
  `/private/tmp/f4a-close-lot-b-sonnet-source-ready.md`, SHA
  `57161e5b7c86814c5e8bcf5a945758c0dae0c2ace0687cbf1dd7a97fbee40e86`.
  Postaudit Fable `/private/tmp/f4a-close-lot-b-fable-postaudit.md`, SHA
  `06a624a2bd79c9a3d582ed85cb0added96abc816596060886688fae9af032793`,
  `ACCEPT`. `control.ratio.iconSize.channel` pasa de `--ds-icon-md-size`
  (canal que ningún tema emite) a `--ds-input-md-icon-size` (declarado en
  `input.css:38`, emitido por rottay y bithire); `manifest/index.json`
  mueve sólo `inputsDigest`; los 275 JSON de `manifest/controls/**` +
  `manifest/families/**` byte-idénticos a HEAD; roster 198→198 entradas,
  retirada la cláusula "residuo abierto para F4A-close" en
  rottay/bithire.
- **Lote C** — retiro de `baseline` del vocabulario cerrado `DOMICILES`,
  la ÚNICA obligación implementable que mantenía `F4A_KEEP_OPEN`.
  SOURCE_READY Sonnet
  `/private/tmp/f4a-close-lot-c-sonnet-source-ready.md`, SHA
  `efce37aadebf3e2787ec8c5376040ace54cf33b98859d85793e202400d6a9eed`.
  Postaudit único Fable (sin GAT)
  `/private/tmp/f4a-close-lot-c-fable-postaudit.md`, SHA
  `1c5a9a865ae54cf131d208e4237668949e13fe3782660fe1cca14ea39bb5b3ed`,
  `.ready` (`verdict=ACCEPT`, `f4a_close=HABILITADO`). `DOMICILES` pasa a
  `['seed', 'derived', 'pro-expert', 'unassigned']` (una palabra
  retirada; el mensaje de fallo deriva sólo del `.join`); negativa nueva
  `@domicile baseline` ⇒ exactamente 1 failure con el mensaje exacto;
  `generated/variant-parity.json` cambia únicamente la línea `law`
  (:187). Write-set exacto 3 paths, ningún cuarto path material tocado
  (una anomalía de mtime en `root-catalog.json` fue adjudicada por Fable
  como byte-neutral: el drill `root-exposure-gate` planta y restaura en
  `finally`, hash antes==después de la propia corrida de `gates:ci`).

Con el `ACCEPT` de Lote C sobre la ÚLTIMA obligación abierta, **F4A y
F4A-close quedan CERRADOS, 14/14, por acto del DT**, respaldado por el
`ACCEPT` final de Fable (arbitraje §3/§4 + postaudit del Lote C, que
declara textualmente "F4A PUEDE CERRAR").

**Canon final** (medido en los tres lotes, quieto salvo lo declarado
arriba): `tagRegistry` **4208** · `ratchet.silentPairs` **0** ·
`ratchet.placeholderPairs` **3969** · `ratchet.declaredAbsentPairs`
**53** · `ratchet.untaggedAuthoredLeaves` **0** · `ratchet.divergentSlots`
**33** (informativo — placeholders que ningún tema autora; el cero real
de shadowing lo certifica el gate `realKeypathParity`, ya cerrado en el
asiento de paridad real, no esta cifra). R-1 (`pnpm test:scripts`, Node
22): **`1735/1722/12/1`** (+1 sobre la vara previa `1734/1721/12/1`,
exactamente la negativa nueva de Lote C), **mismo failure-set/hash
`4d6eda2d…`** que la vara anterior — cero regresión, cero re-ancla.
`gates:ci`: **89 blocking + 2 excluded** (`channel-liveness`,
`lane-control-drills`, dueño F2/F2-asimétrico) en los tres lotes.

**Los ocho requisitos del arbitraje (§4), resueltos uno por uno:**

1. `evnto × CHROME.table.border` queda **`@absent`** (paridad real, no
   placeholder) — resuelto antes del arbitraje; este asiento lo ratifica.
2. **Corrección de prosa K5**: los tres canales
   `filterRowBg`/`filterFocusShadow`/`loadingOverlayBg` — la descripción
   previa de "3 emitidos muertos" queda corregida. Medido en el
   arbitraje: **sin lector en el engine Modern, pero compatibility-vivos
   para rustic** (`--ds-table-filter-row-bg` 1 lector rustic;
   `--ds-table-filter-focus-shadow` 1 lector rustic;
   `--ds-table-loading-overlay-bg` 2 lectores rustic + 1 emisión default
   en `default.css:1723`). **No se retira ninguno de los tres.**
3. El sidecar `semantic-groups` queda ratificado tal cual estaba: la
   transferencia ya lleva condición falsable escrita (medido hoy **0/0/0**
   en los tres temas — activable sólo si algún tema empieza a autorar
   `chrome.<familia>.anatomy`); propuesta posterior, no adjudicada.
4. **C-6 / la clase "evnto compone desde preset canónico" — subsumida por
   F4A-12, cita explícita**: las **845 ausencias de evnto** reconciliadas
   una por una en F4A-12 son **todas piso** (medido por placeholder),
   **cero overlay/preset** — evnto no compone desde ningún preset. La
   clase queda disuelta por medición, no por definición.
5. **Obligación del digest `basedOnReportDigest` — cerrada por el
   mecanismo, no por re-anclaje manual**: el gate bloqueante de
   `tokens-catalog` valida fail-closed (`catalog/index.mjs:1186`:
   `recon.basedOnReportDigest !== reportDigest` ⇒ failure "reconciliation
   digest mismatch… regenerate both"), el drill `recon-digest` está
   testeado (`catalog-gate.test.mjs:103`) y el productor de regeneración
   `tokens:catalog:write` existe y corre. El digest no puede quedar
   huérfano en silencio; el re-anclaje manual por sí solo NO habría
   cumplido esta obligación.
6. `baseline` retirado de `DOMICILES` — Lote C, arriba.
7. R-1 nueva vara: `1735/1722/12/1` — canon, arriba.
8. Fase siguiente: **PRE_F4B**, con **F4B bloqueado hasta el gate
   falsable de cascade** — ver bloque siguiente.

**Dos residuos P2, no bloqueantes, registrados para drenar con causa
futura (NO editados en este asiento):**

- `GOVERNOR_CLASS.baseline: 'razon-falsable'` sigue en
  `manifest/variant-parity/index.mjs:149` — inerte: el mapa es
  reporta-no-bloquea y la clave es inalcanzable (el vocabulario cerrado
  falla antes de llegar a leerla); retirarlo habría sido un cuarto edit
  fuera del write-set autorizado de Lote C.
- `docs/f4a/esquema-asignacion.md:18` sigue enumerando la gramática con
  cinco domicilios (`seed | baseline | derived | pro-expert |
  unassigned`) — eco documental stale, superseded por este ledger. No se
  toca ese archivo en este asiento.

#### PRE_F4B — inventario mecánico del gate cascade (en curso, NO aceptado)

Inventario Sonnet, read-only, `/private/tmp/pre-f4b-sonnet-inventory.md`,
SHA `411f29a1fe4a66f63160db12d8c11a66c33b92d5d09f112cb7da578503ddd731`,
verdict `INVENTORY_READY`. **Es medición mecánica, no diseño ni
implementación aceptada** — ningún número de este bloque autoriza a abrir
F4B.

Medición central: `cascade-wiring-ratchet` trata como "raíz" cualquier
`--ds-X` que aparezca como target dentro del fallback de un
`var(--ds-Y, ...)` ajeno — noción **puramente posicional por nombre**,
sin acoplamiento mecánico con `manifest/cascade/root-catalog.json` (64
filas / 60 canales únicos; el script del ratchet no lo importa ni lo
referencia, cero apariciones verificado por lectura completa de sus 211
líneas). De los **768** nombres que hoy excluye del denominador como
"raíz":

- sólo **38** son un canal canónico real del catálogo;
- **730** (95,1%) son **raíces posicionales** — canales de componente
  ordinarios que otro canal usa como su propio fallback, sin ninguna
  cualidad arquitectónica de raíz. El caso ya adjudicado en el hallazgo 3
  del challenge Fable de F4A-close (`--ds-input-md-icon-size`, resuelto
  en Lote B arriba) es la punta de este conjunto de 730, no un caso
  aislado.

Sobre el grafo completo de reachability transitiva (5142 nodos, mismo
parser balanceado del ratchet, ningún parser nuevo): **1563** nodos
alcanzan una raíz canónica siguiendo 1+ saltos de fallback; 45 SON
canónicos; el resto se reparte en terminales legítimos (declarados, con o
sin fallback), terminales sin productor y **68 ciclos** que nunca tocan
una raíz canónica. **El gate actual no prueba ninguna de las dos
preguntas centrales — ni cuántas de sus 768 "raíces" son reales, ni si un
nombre alcanza alguna** — sólo cuenta cableado posicional. Ese es el gate
falsable de cascade que el arbitraje Fable (§4, punto 8) exige antes de
abrir F4B.

Este asiento NO adjudica diseño ni implementación. PRE_F4B queda con
inventario mecánico completo; el diseño del gate real y su implementación
son el siguiente paso, con dueño DT.

##### Checkpoint PRE_F4B — Lote A implementado y BLOQUEADO (2026-08-22)

**Supersedencia declarada.** Este checkpoint supersede, sin reescribirlo, el
cierre del asiento anterior ("el diseño del gate real y su implementación son
el siguiente paso") y la cláusula "diseño/implementación **NO aceptados**" de
la fila `PRE_F4B` de la tabla de progreso: el diseño v3 fue ratificado y el
Lote A está implementado y auditado. Lo que NO cambia: **PRE_F4B no cierra,
F4B sigue bloqueado y el Lote B no está autorizado.** El resto del asiento de
inventario mecánico se conserva íntegro como historia.

**1. Lote A A1–A12, implementado.** Write-set de doce paths, ejecutado por
Opus como único writer bajo Node 22. Diff material: **10 entradas nuevas**
sobre el prestate congelado — `porcelain 29 → 39` — que son exactamente
A1/A2/A10 (` M`) y A3–A9 (`??`); cero entradas retiradas, cero paths fuera de
A1–A12, cero `src/**`, roots, catálogo, `manifest/index.json`, materialized,
backlog, docs o GAT. **A12 (`scripts/ci/gates-manifest/index.mjs`) queda
byte-idéntico al prestate** (`3b7f906f…`): anexar los tres drills nuevos a su
`run[]` rompía `scripts/ci/runner/index.test.mjs:239`, que sella ese argv
exacto desde fuera del write-set, así que por ruling del DT los suites viajan
transitivamente por A11 y no nace gate id (R-3 intacto). **Las 31 autoridades
read-only quedan intactas** (catálogo, 20 roots, fanout-facts, tenant-reach,
5 fuentes de compilador, 3 artifacts), verificadas contra el freeze con cero
drift. HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, `staged 0`, antes y
después.

**2. Postaudit Fable: `ACCEPT_SOURCE_READY_BLOCKED`.** La instrumentación se
**conserva** — honesta, aislada y verificada byte-exacta, con los 12 paths
recomputados uno por uno y B1/B2/B3 intocados. Pero **PRE_F4B queda
abierto-bloqueado** en la rama F-5/S7 contratada: **F4B sigue bloqueado y el
Lote B NO está autorizado.**

**3. Evidencia del lote.** Suites: **A3 23 · A6 36 · A9 18 · A11 48**, cero
fallas. **R-1 `1817/1804/12/1`**, con el **mismo failure-set nominal de 12**
que la vara previa — identidad de conjunto verificada por Fable (diferencia
simétrica vacía contra el log canónico de Lote C) y cero fallas nuevas.
Aritmética F-7 exacta: `1735 − 10 + 10 + 23 + 36 + 18 + 5 = 1817`. Queda
abierta la condición **C-3**: el literal `4d6eda2d…` no se reproduce desde la
receta en prosa, así que el próximo SOURCE_READY publica el serializador
canónico o el DT re-ancla el canon; hasta entonces la vara se verifica por
identidad de conjunto más contadores. `gates:ci` **89 blocking + 2 excluded**,
verde. **El ratchet viejo sigue intacto en `2171/4374`** (corrido por el
postaudit sobre el árbol vivo): el aislamiento S2 queda probado, no reportado.

**4. Causa del bloqueo.** `producers.json` publica **2 024 filas de
`unknownProvenance` en 525 archivos** — cada una con `plane/file/symbol/
reason/template/detail`, identidad y no contador desnudo. La condición de
entrada del Lote B (F-5.1, `unknownProvenance == []`) **no se cumple**. Cuatro
ítems quedan además **PARCIALES**, brechas de garantía y no de honestidad:
**P0-3** (binding léxico AST en V3-3: el guard de chart-category aún se
verifica por substring del `then`), **P0-4** (`srcCompilers` sella sólo tres
archivos; faltan el módulo lector y cuatro fuentes efectivas — hoy el lote
está protegido por el freeze de `/tmp`, no por el artefacto), **P1-1** (el
doble owner sólo se produce desde el helper unitario, no desde
`buildProducers()`) y **P2** (`order` lleva nombres de contexto, no owner IDs).
El **plan de corrección Opus v1 fue RECHAZADO** por auditoría independiente
(cinco defectos bloqueantes: taxonomía heurística, `[]` no demostrado, retirar
`plane` contradice el schema, schema de precedencia sin addendum, y
`CONSTANT_SOURCES` no exportada). **Ningún writer queda liberado.**

**5. Censo Sonnet v1 — identidad ACEPTADA, clasificación RECHAZADA.** El censo
prueba la **identidad exacta de las 2 024 filas** (mismo orden, cero pérdida,
cero duplicado, índice 0..2023 como identidad estable) y esa mitad se acepta.
Su **taxonomía causal terminal se rechaza**: el clasificador detiene el walk
en el primer binding, de modo que **944 filas** rotuladas
`localConstOrDestructureResolvable` llevan en el propio mapping
`isSourceItselfAParamOrImport = directParam` — son destructurings de un
parámetro y su frontera terminal es relay/prop, no "local resolvable"; y
**3 llamadas** quedaron mal domiciliadas en la familia `undefined`
(`spreadOf:noBindingFound`), de modo que el conteo acreditable de `undefined`
literal es 58 y no 61. **Un censo v2 terminal-recursivo está EN CURSO.**
**Prohibido pinear los conteos de v1** — ni las nueve familias, ni el 1626
"sin autoridad nueva", ni el 244 de relay: lo único vinculante hoy es la
identidad de las 2 024 filas y la partición uno-a-uno contra sus índices.

**6. Decisiones DT ya firmes.** (a) **`plane` permanece dentro de
`producerSiteId`**: es la fórmula del contrato v3 y separa dos semánticas
productivas que pueden observar el mismo archivo; el conflicto de ownership se
vuelve falsable inyectando claims al materializador real, no cambiando la
coordenada. (b) El **write-set eventual mínimo es `A4/A5/A6`** — tres paths,
no cuatro: A7/A9 quedan fuera del tranche y A8 no se vuelve stale (cero
referencias a `extracted/producers.json`). (c) El **Lote B sólo abre con
`unknownProvenance == []` real y doble postaudit** (reauditoría independiente
A4–A9 más postaudit Fable del diff completo); mientras quede una sola fila, el
receipt es `SOURCE_READY_BLOCKED`, B2 no existe y el ratchet viejo sigue
siendo el gate de CI.

**7. BC-0 — `PAINT_DENOMINATOR`, deuda asentada (verbatim).** *Tranche propio
con build permitido; **prohibido pinear `3661` / `1918` / `1823`** sin
derivación reproducible.* Este asiento **no fija esas cifras y no las
reinterpreta**: el denominador de pintura y sus contadores se derivan
**únicamente del artefacto vivo y de su fórmula ejecutable**, y sólo entonces
se certifica pintura. La deuda venía arrastrándose en memos volátiles de
`/private/tmp` contra la doctrina de escribanía durable; queda asentada aquí y
sigue con dueño DT.

**8. Progreso de programa — sin cambio.** Sigue en **39–43% realizado /
57–61% pendiente**. Esta instrumentación **no suma certificación de F4B**: el
Lote A reconstruye el instrumento y su procedencia, no drena deuda ni acepta
un solo control. Por la regla de reporte vigente, producir memos e
instrumentación read-only no infla progreso.

**9. Memos de referencia (paths y SHA-256 completos).**

| Memo | Path | SHA-256 |
|---|---|---|
| SOURCE_READY del writer (`SOURCE_READY_BLOCKED`) | `/private/tmp/pre-f4b-lot-a-opus-source-ready.md` | `e81ee0fe30e45951806f7cd930424393f27fa3074f01d4fdf67429f8ecf52611` |
| Postaudit Fable Lote A (`ACCEPT_SOURCE_READY_BLOCKED`) | `/private/tmp/pre-f4b-lot-a-fable-postaudit.md` | `caa9c481e9e5f7adf7220625305da673a8f73ad22921b2847d36ce5f9ed46885` |
| Auditoría independiente del plan de corrección (`REJECT`) | `/private/tmp/pre-f4b-lot-a-correction-plan-independent-audit.md` | `092cd49ce47163e0a514de64fd19732bd7dde94187635de57e0ecb91086330cc` |
| Challenge Fable del plan (`ACCEPT_WITH_BINDING_CORRECTIONS`) | `/private/tmp/pre-f4b-lot-a-correction-plan-fable-challenge.md` | `37dcdf461f4ff7741cec8c04976f01113c6abd27f19e8565148e0ef204ef1a2d` |
| Censo causal Sonnet v1 (`CENSUS_READY`) | `/private/tmp/pre-f4b-unknown-sonnet-census.md` | `4b0c3e5da33b44032a425cff5504c6d59fe4a567110aa47390d028eec4d1aab4` |
| Auditoría del censo (identidad ACCEPT / clasificación REJECT) | `/private/tmp/pre-f4b-unknown-sonnet-census-independent-audit.md` | `43bef9bf9471016ff733255010f4028030f87fb0399dc3aff94526c00b9c1c5a` |
| Revisión Fable del censo (`ACCEPT` con C1–C6) | `/private/tmp/pre-f4b-unknown-sonnet-census-fable-review.md` | `97207ad3bfd9b9f4ae2037e5f15b2171790e593e201a3621bfb5b0efabfdc0e9` |
| Plan de corrección Opus v1 (rechazado) | `/private/tmp/pre-f4b-lot-a-correction-plan-opus.md` | `979b5187e2d97394a1000a66ba264363944709b620c16144b4eff716cbedc459` |
| Lista completa de las 2 024 unknown | `/private/tmp/pre-f4b-lot-a-unknown-provenance.md` | `f97642537049b03fc642f5a3ee2f0e2e750b7ee280f247f8cec8572d69f60f3f` |
| Diff completo del Lote A (prestate sucio → poststate) | `/private/tmp/pre-f4b-lot-a.diff` | `72b8002b1d788b2d24e40024f16fc07488c78a019884ed8518013b55bcc06186` |

**Cadena vigente para el siguiente tranche:** ruling DT sobre el plan corregido
→ freeze-r2 con fórmula de agregado ejecutable → writer (`A4/A5/A6`) →
reauditoría independiente A4–A9 → postaudit Fable del diff completo. Ningún
paso de esa cadena está autorizado por este checkpoint.

#### Progreso operativo, no certificación

| Hito | Avance vigente |
|---|---:|
| F0/F0.5/F1 + transferencia DT | 100% |
| F2 seguro | 100% |
| F4A estructural | 100% CERRADO (F4A-close 14/14, Lotes A/B/C, postaudit Fable `ACCEPT`) |
| Cobertura de hojas F4A | `2559/2559 y 0/7677 pares silenciosos; divergentSlots 33 sólo informativo` |
| Hardening pre-K4 / authority-honesty | 100%; `SOURCE_READY` + postaudit Fable `ACCEPT` |
| T-1a sandbox `program-check.test.mjs` | 100%; `SOURCE_READY` + postaudit Fable `ACCEPT` |
| T-1b sandbox `cra-12` | 100%; `SOURCE_READY` + postaudit Fable `ACCEPT` |
| R-1 baseline de pierna 1 | 100%; `1735/1722/12/1` vigente (Lote C), mismo failure-set/hash `4d6eda2d…` que la vara previa |
| K4 | 100%; implementación + postaudit Fable `ACCEPT` |
| K5 | 100% implementación + postaudit + GAT/CI |
| F4A-close | **14/14 CERRADO** (Lotes A/B/C; canon 4208/0/3969/53/0/divergent33 informativo; gates:ci 89+2) |
| T-1 sucesión DT Codex → Kimi K3 | 100% CONSUMADA (2026-08-23, 3.ª sucesión de la cadena; Fable `ACCEPT`) |
| C2 program-check verde | 100%; 24 fallos spacing.rhythm resueltos causalmente, ley intacta; `CONSTITUTION_READY`; Fable `ACCEPT` con follow-ups vinculantes (H1/H3) |
| C3 resello GAT-07 | 100%; hash `a24805069cf4…`; regla adoptada: resello obligatorio al cierre de cada packet F4B |
| C4 brecha PRE_F4B | 100% REGULARIZADA (doble postaudit Codex DEFECTS 5/5 + Fable REGULARIZA; T-11 anclado, T-12 narrativa, frescura producers.json; D1 aceptado con asiento) |
| PRE_F4B | CERRADO por regularización C4 (ver asiento C4); inventario mecánico `INVENTORY_READY` histórico |
| H-1 brazo estático con baseline | 100%; `base` del vertical publicado sólo en el brazo estático; preaudit Fable `ACCEPT` V1–V5; drills 47/47; los 20 receipts spacing/effect/radius invariantes |
| F4B | **5/20 controles** — `spacing.rhythm`, `surfaces.effect-intensity`, `shape.radius-scale` y `density.mode` en `COMPUTED_VERIFIED` (rank 3), **ninguno `SIGHTED_ACCEPTED`**; `experience.profile` DEGRADADO a `IMPLEMENTED` (su re-medición pintada refutó la equivalencia de brazos bajo el instrumento corregido — asimetría real, `OPEN_ARM_ASYMMETRY` = decisión de PRODUCTO del owner con prueba; receipts R4 re-emitidos sólo por frescura). 30 receipts válidos y frescos bajo validador v2 (R2×14, R3×6, R4×4, R5×6). Escenarios: 8 layout × {tight,airy} + 6 card × {mate,sobrio} + 6 card × {sutil,amplio} + 4 card × {technical,editorial} (supersedidos en conclusión, no en números) + 6 space × {compact,spacious}. Los 15 restantes siguen `UNKNOWN`; `typography.scale` arrastra anti-door + semilla incondicional (anotado para su packet) |
| F2 asimétrico | 0% |
| F3/F4C/F5-F8 pendientes | 0% del tramo pendiente |
| F9 | 0/5100 celdas aceptadas |
| Programa completo | estimación prudente 39–43% realizado; 57–61% pendiente. Cerrar F4A **no certifica** F4B ni F9: ambos con gate/celdas propios, aún pendientes |

**Regla de reporte:** el porcentaje sólo cambia por implementación o aceptación
real; producir memos read-only no infla progreso.

**Enmienda de secuencia vigente (dueño, 2026-08-20).** El frente actual sigue
siendo F2.4 y su packet abierto no se cancela. F2 continúa packet por packet
hasta que no quede ningún cluster con cero-delta computado demostrable. Cerrado
ese conjunto seguro y auditado, el próximo frente es **F4A**, no F3; el residuo
F2 dependiente de theme queda explícitamente detrás de F4B. La cola vinculante es:
`F4A → PRE_F4B → F4B → F2 asimétrico → F3 → F4C → F5 → F6 → F7 → F8 → F9`.
**F4A cerró 14/14 el 2026-08-22** (ver asiento arriba); PRE_F4B tiene
inventario mecánico pero F4B permanece bloqueado hasta el gate falsable de
cascade.
F1 permanece correctamente «gobernado», pero no se reinterpretará como
certificación: el rollup `UNKNOWN` sólo baja con evidencia causal y F9 lo lleva
a cero.

**F4B — `spacing.rhythm` COMPUTED_VERIFIED (2026-08-23), 1/20.** Primer control
con evidencia causal de navegador. Base `6cfdcc1a9`. 8 escenarios
`primitive/layout/{flex,grid,stack,space}` x `{tight,airy}`, cada uno midiendo
**los dos ingress en una sola escena**: preset gap `15px -> 12.75px` (tight,
x0.85) y `15px -> 18px` (airy, x1.2), exactos y monótonos; el `numeric-gap`
contraparte quedó en `8px` en las 16 filas de brazo; `--ds-rhythm-scale`
`1 -> 0.85 / 1 -> 1.2` y `--ds-rhythm-effective-scale` con el mismo clamp en
ambos brazos; `restore.exact = true` y `negativeControls.held = true` en todos
los brazos; `ingressEquivalence` con 0 filas divergentes en los 8; ningún run
`harness-suspect`. Receipts R2 en
`packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/spacing-rhythm/`
(8 artifacts + 8 receipts), los 8 válidos contra
`scripts/quality-evidence/v2/receipts.mjs`.

Para llegar ahí hubo que reparar cuatro defectos reales del arnés, todos
encontrados por la propia corrida y ninguno enmascarado: (1) el brazo DB estaba
atado a `compileAppearanceVariables`, símbolo ausente de todo entrypoint
publicado y retirado del provider — el door productivo es
`compileTenantThemeConfig`, ahora cargado desde el subpath publicado
`@rottay/design-system/server`, con `RETIRED_DB_COMPILER_EXPORTS` que convierte
un rebind en throw de carga; (2) el fixture `button-modern-md` exigía
`[data-part='trigger']`, que `cb1e3645f` había rekeyed a `[data-variant]`, así
que **todas las lecturas de Button venían siendo retenidas** y
control-height/touch-target/icon-size quedaban sin medir en silencio; (3) el
restore inline dejaba un `style=""` vacío que el baseline no tenía, por lo que
el brazo DB no restauraba exacto; (4) el colector de freshness pasaba
`sourceBindings` crudos a un hasher de archivos (un directorio reventaba con
EISDIR y un locator `path:1371-1451` leía como archivo inexistente).

`disposition` de las cuatro celdas sigue `UNKNOWN` **no por falta de medición**
sino porque el `dispositionLaw` de `APPLICABLE` exige `staticSourceBindings` y
`dbSourceBindings` separados, forma que estas celdas no tienen. `SIGHTED_ACCEPTED`
no se reclama: no hay aceptación sighted. El eje `responsive-preset` no lo
cubren estos fixtures y queda sin medir. Deuda no bloqueante registrada:
`compileAppearanceVariables` sigue declarado en un `.d.ts` de `dist` sin existir
en el JS — divergencia tipo/runtime, ajena a este control.

**F4B — `surfaces.effect-intensity` COMPUTED_VERIFIED (2026-08-23), 2/20.**
Segundo control con evidencia causal de navegador; el asiento de `spacing.rhythm`
de arriba queda intacto. Base `56847146f`, worktree limpio, `staged=0`, sin
commit ni push. 6 escenarios `primitive/display/card` x `{rottay,bithire,evnto}`
x `{mate,sobrio}`, cada uno midiendo **los dos ingress en una sola escena** y en
los dos temas: 6 artifacts + 6 receipts (12 archivos) en
`packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/surfaces-effect-intensity/`,
los 6 receipts válidos contra `scripts/quality-evidence/v2/receipts.mjs`. Ningún
run `harness-suspect`; `ingressEquivalence` con 0 filas divergentes en los 6;
`restore.exact = true` y `negativeControls.held = true` en cada brazo de cada
escenario.

Números medidos. Canal directo `--ds-effect-intensity` sobre `token-readout`:
`1 -> 0` y `1 -> 0.6` en rottay y evnto, `0.58 -> 0` y `0.58 -> 0.6` en bithire
(su artifact compila ese piso, que es además el precedente que cita la ley de
`estandar`). Pintura sobre `card-modern-md/root`: el alfa del primer stop de
`background-image` va `0.024 -> 0` en `mate` y `0.024 -> 0.016` en `sobrio`, en
rottay y evnto, en ambos brazos y ambos temas, monótono (`0 < 0.016 < 0.024`).
La rampa autorada es `0.025 * effectIntensity`; Chromium serializa el alfa a 8
bits, así que `0.025` lee `0.024` y `0.015` lee `0.016` — la cuantización es del
navegador, se registra en vez de suavizarse.

Ingress: static `surfaces.effectIntensity` por `compileBrandTheme`; DB
`appearance.general.surfaces.effectIntensity` por `compileTenantThemeConfig`
desde el subpath publicado. Ningún segundo emitter, ningún compilador retirado.

Un defecto real del arnés, encontrado por la propia corrida y no enmascarado:
`buildIngressInput` escribía el **id** del stop en el path de ingress para
cualquier `domain.kind`. `spacing.rhythm` es `closed-enum`, donde el id ES el
valor que un tenant escribe, así que la otra forma nunca se había ejercitado.
Con un control `bounded` habría bajado `--ds-effect-intensity: mate`: la bajada
estática es `String(su.effectIntensity ?? 1)` sin guarda numérica, el nombre
llega literal al canal, y como `--ds-effect-intensity` es un `@property`
registrado con `syntax: '<number>'` e `initial-value: 1`, la declaración es
inválida a computed-value time y el navegador sustituye 1. **Todos los stops
habrían pintado el baseline y la corrida habría reportado como inerte un control
vivo**, con el brazo cargando igual un mapa no vacío, así que ninguna guarda
existente habría disparado. El arnés ahora deriva el valor escrito de
`domain.kind` y falla cerrado ante cualquier kind que no sepa escribir; hay
drill contrafáctico que maneja el `compileBrandTheme` compilado real y clava que
emite el literal `mate` (31 aserciones verdes en
`runtime/ingress/tests/index.test.mjs`).

Sobre `estandar` (1) no se simula paridad. `surfaces-effect-intensity-envelope.test.ts`
(20 aserciones verdes) prueba que el door DB lo **rechaza** en los tres
verticales con `invalid_value` en `$.appearance.surfaces.effectIntensity`, que el
techo mismo (`0.65/0.65/0.75`) **sí** se acepta — que es lo que separa un rechazo
de un clamp — y que el sobre es intervalo cerrado (`-0.1` y `1.5` también
rechazados). El door estático acepta 1 en los tres.

**Límites y deudas, ninguna disimulada.**
1. `estandar` no tiene corrida causal recibida, y la razón es del instrumento,
   no falta de medición: por contrato sólo es alcanzable por el door estático, y
   una corrida causal de un solo brazo reporta `ingressEquivalenceHeld=false`
   (dobla `comparable=false` en «no se sostuvo»), lo que fuerza `pass=false` y
   `exitCode 1`, y el validador rechaza exit no-cero salvo `negative-drill`.
   Forzar los dos brazos es imposible: el brazo DB lanza al bajar, que es
   justamente la conducta bajo prueba. Medido igual: un run estático de un brazo
   en bithire fue `harness-live` (`0.58 -> 1`, negativos sostenidos, restore
   exacto); rottay y evnto se rechazaron correctamente como `harness-suspect`
   por otra razón honesta — su baseline compilado **ya es 1**, así que ahí el
   stop es no-op y no hay movimiento que observar. Queda como
   `openContractQuestion` para adjudicación del DT; este packet **no** tocó esa
   semántica de veredicto: debilitar una regla de gate es decisión del dueño.
2. El keyline óptico intensity-scaled del card elevado **no responde al dial**.
   `card.css` declara `inset 0 1px 0 color-mix(... calc(72% * var(--ds-effect-intensity)) ...)`
   y su propio comentario dice que se disuelve en 0; medido, `box-shadow` es
   idéntico entre baseline y mutación en las 24 filas de brazo de los 6
   escenarios, en ambos temas y ambos doors. Registrado como medido-no-
   diagnosticado por ruling del dueño (no perseguirlo): el control queda probado
   vivo sobre el mismo elemento por una propiedad pintada independiente
   (`background-image`) y por la lectura directa del canal.
3. En bithire el dial llega al canal y **no pinta nada** en el card: su artifact
   declara plano `--ds-gradient-surface` como literal opaco de tres stops sin
   término de intensidad, mientras rottay y evnto heredan la definición escalada
   de `foundation/animations/premium.css`. Divergencia de autoría por tenant, no
   bajada rota: los dos doors coinciden también en bithire (0 filas divergentes).
4. **Responsive sin medir**: la sonda clava un viewport (1280x800, dpr 1).
5. Se midió **una** familia. 21 owners CSS de `runtime/engines/modern/skin` leen
   este canal; el `productiveConsumerWitness` declarado en el manifest
   (`overlay-modal.css`) no tiene fixture en el roster y **no** se midió. Por
   ruling del DT el canary primario es `card-modern-md/card.css` y el witness
   documental no se reemplazó. La afirmación a nivel control es sobre el canal y
   los dos doors, no sobre cada superficie que el canal decora.
6. `disposition` de la celda sigue `UNKNOWN` **no por falta de medición** sino
   porque `APPLICABLE` exige `staticSourceBindings`/`dbSourceBindings` separados
   más `states` y `stressCases`, forma que esta celda no tiene.
   `SIGHTED_ACCEPTED` **no se reclama**: no hay aceptación sighted.
7. `anatomy.propertyGroups` de `primitive/display/card` estaba vacío y bloqueaba
   `IMPLEMENTED`; se declaró **sólo** el grupo que esta calibración midió
   (`surface-decoration`), igual que el packet de `spacing.rhythm` pobló los
   cuatro layout. Taxonomía parcial declarada como tal, no inventada completa.
8. `program-check` pasa de **25 a 24** hallazgos: 0 nuevos, y se resuelve
   `manifest/index.json is stale`. Advertencia honesta: regenerar ese índice
   **también** absorbió cuatro filas que el packet 1/20 había dejado sin
   regenerar (`primitive/layout/{flex,grid,space,stack}`, de `SOURCE_BOUND`
   a `COMPUTED_VERIFIED`). No es trabajo de este packet y se nombra para que no
   viaje escondido. Los 24 restantes son los de `spacing.rhythm` heredados.
9. Rojo heredado fuera de alcance por ruling del dueño: el drill
   `composition/receipt` 11/12 (`producer may not be the sighted approver`)
   compara contra `SIGHTED_APPROVER = 'Codex (DT)'` pasando `'Codex'`. Ajeno a
   este edit-set.

Toolchain: los 6 escenarios se corrieron en Node **v22.17.0** (el pineado);
una corrida previa idéntica en v25.2.1 dio veredictos y conteos byte-iguales, lo
que sirve además de cruce de reproducibilidad. `tsc --noEmit` limpio.

**F4B — `shape.radius-scale` COMPUTED_VERIFIED (2026-08-23), 3/20.** Tercer
control con evidencia causal de navegador; los asientos de `spacing.rhythm` y
`surfaces.effect-intensity` quedan intactos. Base `5ce42e1b7`, `staged=0`, sin
commit ni push. 6 escenarios `primitive/display/card` x `{rottay,bithire,evnto}`
x `{sutil,amplio}`, cada uno midiendo **los dos ingress en una sola escena** y en
los dos temas: 6 artifacts + 6 receipts (12 archivos) en
`packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/shape-radius-scale/`.
Ningún run `harness-suspect`; `ingressEquivalence` con 0 filas divergentes en los
6; `restore.exact = true` y `negativeControls.held = true` en cada brazo.

**El door declarado estaba invertido, y ése es el hallazgo del packet.** El
control venía declarando `surfaces.borderRadius.*` como door estático. No era
sólo un wildcard que `buildIngressInput` no puede caminar: `borderRadius.{sm,md,lg,xl}`
baja a `--ds-radius-{step}-base`, y cuando hay escala viva `compileBrandTheme`
emite esa base como `calc(authored / scale)` **a propósito**, para que el
`calc(base * scale)` de `foundation/themes/default.css` reproduzca el valor
autorado. Es la vía de **compensación** — el anti-door — y apuntar ahí bajaba un
`--ds-radius-scale: 1` **constante** en los 4 stops y las 3 verticales. El guard
de bajada vacía **no** disparaba, porque el compilador emite ese canal como
default incondicional: la corrida habría reportado un control vivo como INERTE.
Preflight y prueba de mutación quedan como evidencia durable en el mismo
directorio (`preflight-ingress-refutation.{mjs,json}`, `drill-mutation-proof.{mjs,txt}`).

Corregido en la autoridad, no en el generado: `capabilities/index.ts`
`brandThemePath` -> `surfaces.radiusScale`, el campo que `BrandSurfaces` documenta
como *"Bounded multiplier for the canonical radius ramp"*. Regeneración con el
productor canónico (`manifest/generator/index.mjs --sync`): **21 archivos**, 19
controles cambian **exclusivamente** `semanticOwner.registryDigest`,
`shape.radius-scale` cambia además `ingress.staticBrandThemePath`, y
`manifest/index.json` sólo sus digests derivados. **Cero deltas semánticos y cero
deltas de familia** en la regeneración — condición de aceptación del DT, verificada
campo por campo.

Números medidos. Canal directo `--ds-radius-scale` sobre `token-readout`, en los
dos brazos y las 6 celdas: rottay y evnto `1 -> 0.9` y `1 -> 1.15`; bithire
`1.25 -> 0.9` y `1.25 -> 1.15`. Pintado en `card-modern-md/root`
(`border-top-left-radius` y `border-bottom-right-radius`, idénticos en ambos
brazos y ambos temas): rottay `14px -> 12.6px` y `14px -> 16.1px`; evnto
`18px -> 16.2px` y `18px -> 20.7px`; bithire `10px -> 7.2px` y `10px -> 9.2px`.

Notas honestas:

1. **bithire es el fork que el README de modern nombraba, y esta corrida lo midió.**
   Autora el par de compensación (`surfaces.borderRadius` junto a `radiusScale: 1.25`),
   así que su base compilada sale como `calc(10px / 1.25) = 8px` y el 10px pintado
   es esa base por su propio 1.25. El dial sigue **plenamente vivo** ahí
   (`8px * 0.9 = 7.2px`, `8px * 1.15 = 9.2px`), pero mueve desde 1.25 y no desde 1.
   Consecuencia práctica: su baseline está en el techo del dominio `{0.75,1.25}` y
   por encima del sobre tenant `{0.8,1.2}`, de modo que un tenant sólo puede
   **reducir** el radio de bithire, nunca aumentarlo.
2. **`suave` (1) no lleva receipt positivo, por diseño.** 1 ES la identidad de la
   rampa. Por el door DB ni siquiera es expresable en dos de tres verticales:
   `compileTenantThemeConfig` no emite `--ds-radius-scale` para rottay ni evnto
   (escribir el default del vertical es un no-op que el compilador elide) y el
   arnés rechaza el brazo como bajada vacía. bithire **sí** emite `"1"` porque su
   baseline es 1.25. Asimetría de los doors, no defecto.
3. **`recto` (0.75) no lleva receipt en ningún brazo, por diseño.** Está bajo el
   sobre tenant en las 3 verticales — el door DB lo **rechaza** con
   `Value exceeds the <vertical> envelope`, rechazo real y no clamp — y es un stop
   vertical-only. Forzar un receipt static-only publicaría una fila de paridad sin
   contraparte. El rechazo queda probado en el artifact de preflight.
4. **Negativo nuevo, y era obligatorio.** `border-fixed` empaqueta los cuatro
   `border-*-radius` junto con anchos y estilos, así que ligarlo aquí habría
   afirmado que el canal bajo prueba no debe moverse. Se agregó **una** entrada al
   vocabulario, `border-width-style-fixed` (misma entrada menos los cuatro
   longhands de radio), y es la que declara el control. `color`, `font-metrics`,
   `motion` y `control-height` se reutilizan sin cambios.
5. **Cerca de regresión focal.** Dos drills nuevos en
   `runtime/ingress/tests/index.test.mjs` fijan que el door siga siendo una ruta
   literal, que nunca vuelva a apuntar a `borderRadius`, y que los stops bajen
   valores **distintos** — esta última es la que atrapa el modo de fallo real, un
   lowering constante que igual satisface el guard de bajada vacía. Probadas por
   mutación contra el manifest de HEAD: ambas fallan sobre el anti-door y pasan
   sobre el corregido.
6. **`anatomy.propertyGroups` de `primitive/display/card`** gana `surface-radius`.
   No es una taxonomía inventada: el propio `propertyGroupsScopeNote` de la familia
   decía que `surface-decoration` es *"deliberately NOT the base fill, the border or
   the radius, which belong to groups a later calibration must name when it measures
   them"*. Ésta es esa calibración. El fill base y el trazo del borde siguen sin
   nombrar, así que la lista sigue siendo parcial por construcción.
7. **Vector false-inert todavía abierto, fuera de este packet.** `lowerStop` falla
   cerrado cuando un compilador no emite **ninguno** de los canales declarados, pero
   no cuando emite uno en un default constante. Cualquier control cuyo canal
   declarado tenga default incondicional puede cargar un brazo no vacío que no
   codifica stop alguno. Reportado, no arreglado.
8. **Los 6 receipts de `surfaces.effect-intensity` se reemitieron.** El repin de la
   autoridad los volvió stale por construcción: su superficie de frescura de 54
   archivos contiene tanto `capabilities/index.ts` como
   `manifest/controls/surfaces.effect-intensity.json`, así que ninguna variante de
   la Opción A los dejaba intactos. Se regeneraron los 6 escenarios (12 archivos)
   contra el árbol final y los 12 validan. **Ningún receipt cerrado queda stale.**
9. `program-check` se mantiene en **24** hallazgos: los mismos 24 de `spacing.rhythm`
   que ya existían en `5ce42e1b7`. **0 nuevos.** Verificado por diff del conjunto
   completo de fallos contra la línea base tomada antes de tocar nada.
10. `disposition` de la celda sigue `UNKNOWN` **no por falta de medición**, misma
    razón que el packet anterior; `SIGHTED_ACCEPTED` **no se reclama**.
11. **Sin medir**: divergencia responsive (un solo viewport), cualquier consumidor
    de `--ds-radius-scale` que no sea Card, y los pasos `sm/md/xl` y `full` de la
    rampa (resuelven en `token-readout` pero ningún fixture pintado los consume).

Toolchain de este packet: los 6 escenarios de `shape.radius-scale`, los 6
reemitidos de `surfaces.effect-intensity`, el build y los focales se corrieron
**sólo** en Node **v22.17.0** (el pineado). No se hizo cruce en otra versión, así
que este packet no reclama el contraste de reproducibilidad que el asiento
anterior sí tenía.

**F4B — `experience.profile` COMPUTED_VERIFIED (2026-08-23), 4/20.** Cuarto
control con evidencia causal de navegador; los asientos de `spacing.rhythm`,
`surfaces.effect-intensity` y `shape.radius-scale` quedan intactos. Base
`48fa4f20a`, `staged=0`, sin commit ni push. **4 escenarios positivos**
`primitive/display/card` x `{rottay,evnto}` x `{technical,editorial}`, cada uno
midiendo **los dos ingress en una sola escena** y en los dos temas: 4 artifacts +
4 receipts en
`packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/experience-profile/`.
Ningún run receipted `harness-suspect`; `ingressEquivalence` con 0 filas
divergentes en los 4; `restore.exact = true` y `negativeControls.held = true` en
cada brazo. **Se planificaron 5 positivos y se entregan 4**: el quinto
(`bithire` x `editorial`) no logró `static=DB` y por eso **no lleva receipt** —
ver nota 3. **24/24 receipts frescos, NO 25/25**; la diferencia es un hallazgo, no
una omisión.

**El instrumento no podía bajar este control, y ése es el primer hallazgo.**
`experience.profile` declara `domain.kind: "profile-id"`, e
`ingressValueForStop` sólo conocía `closed-enum` y `bounded`: `profile-id` estaba
nombrado en un **drill negativo existente** que exigía que fallara cerrado. El
preflight terminó en **STOP** con memo durable
(`PREFLIGHT-STOP-2026-08-23.md`, sha256 `f32379b2…`), y el DT autorizó el packet
expandido después de leerlo. Soporte agregado en
`runtime/ingress/index.mjs`: el id se escribe **verbatim** (sin trim, sin
normalizar, sin quitar `@version`) y falla cerrado en tres direcciones — id que no
sea string no vacío, `calibration.catalog` ausente o vacío, e id fuera de ese
catálogo. La clausura se lee del **REGISTRO** (`calibration.catalog`), nunca de
`domain.enumValues`, que para este kind está vacío por contrato: leerlo de ahí
convertiría "enumValues vacío" en "se puede escribir cualquier cosa". En el drill
negativo se removió **sólo** `'profile-id'`; `token-map`, `color-set`, `scale` y
`undefined` siguen rechazándose. 4 drills nuevos (bajada verbatim en los dos
doors, id fuera de catálogo, catálogo ausente/vacío, id no-string): **37/37**.

**Fixture: Card gana un `title` real.** `--ds-letter-spacing-heading` es el único
canal declarado con cadena pintada inequívoca y no-radial, y sólo existe en
`[data-part='title']`, que el fixture no renderizaba. El markup se obtuvo
**renderizando el `ModernCard` real** con `title="Card title"` y pegando la salida
de `renderToStaticMarkup`, así que el drift test lo cubre igual que al root
(**19/19**). Sin fixture id nuevo; `root` intacto.

Números medidos. Pintado en `card-modern-md/title` (`letter-spacing`, idéntico en
ambos brazos y ambos temas, **8 de 8 celdas**): rottay `-0.196875px -> 0.13125px`
(technical) y `-> normal` (editorial); evnto `-0.3px -> 0.15px` y `-> normal`.
Segundo testigo pintado en `card-modern-md/root` (`background-image` vía
`--ds-elevation-lift-strength`): **6 de 8 celdas** — el stop `technical` (lift 0)
mueve **sólo en dark**, porque en light el canal ya resuelve a 0 y el stop es un
**no-op verdadero** para ese eje. Canal directo `--ds-letter-spacing-heading`
sobre `token-readout`, ambos brazos, los 4 escenarios: rottay
`-0.015em -> 0.01em` (technical) y `-> 0` (editorial).

Notas honestas:

1. **`experience.profile` reaches Card, y eso refuta la razón que la celda traía.**
   El cell pasó de `MUST_NOT_REACH` a **`MUST_REACH`**. La razón vieja era una
   cadena `Idem` hacia *"nobody reads `--ds-experience-profile`"*, que confunde el
   **marcador de procedencia** del control con sus **canales declarados**: el
   marcador efectivamente no lo lee `card.css`, pero dos de los otros cuatro
   canales sí y pintan. De los 5 declarados, sólo 2 pintan en este fixture;
   `--ds-edge-standard-width` no (la variante `elevated` lee el hairline, y ambos
   stops emiten `1px` = baseline) y `--ds-material-canvas-texture` tampoco (es
   canal de `semantic-surface.css`, y sólo el stop editorial lo emite porque
   `motif:'none'` expande a `{}`).
2. **`bithire` x `technical` es `DESIGNED_NULL`, medido y NO receipted.**
   `brand-themes/bithire/index.ts:3190` ya declara
   `experienceProfile: "rottay/bithire-technical@1"`: un tenant de bithire que
   elige ese stop elige **el perfil que el vertical ya tiene**. Se retiene como
   `bithire-technical.DESIGNED-NULL.json`. No debe leerse como control inerte.
3. **`bithire` x `editorial` es una DIVERGENCIA static/DB real, reproducida dos
   veces, y por eso NO lleva receipt.** `harness-live`, restore exacto y negativos
   sostenidos, pero `ingressEquivalence: DIVERGES (3 filas)`. Dos causas distintas,
   ambas confirmadas en fuente. (a) **Sombreado por especificidad, sólo en dark:**
   el artifact de bithire declara `--ds-letter-spacing-heading` dos veces — a
   especificidad de tenant base (`artifacts/bithire/index.css:644`, `-0.025em`) y
   otra vez en un bloque dark cuyo selector lleva atributo/clase extra
   (`…[data-theme='dark'], ….dark`, `:1496`, `-0.01em`). El brazo estático aterriza
   detrás del selector **base**, así que el bloque dark de bithire le gana y el door
   estático queda **inerte en dark**; el door DB escribe inline en `documentElement`
   y siempre gana. Las mismas 2 filas aparecen en el stop technical, así que es
   propiedad de la cascada del vertical, no del stop. (b) **Asimetría de brazos, en
   light:** `--ds-material-canvas-texture` se mueve en estático y no en DB porque
   `compileTenantThemeConfig` emite sólo 3 de los 5 canales declarados para
   bithire/editorial — la expansión **pierde contra un canal que el baseline del
   vertical ya autora**, que es el `defaultBehavior` declarado del propio control.
   El lowering estático no tiene baseline contra el cual perder. Ninguna de las dos
   es defecto *de* `experience.profile`; ambas quedan como `knownDefects` con
   remediación y están **por encima** de un packet de un solo control.
4. **La instrucción B del DT se revirtió, con ruling explícito.** Agregar
   `--ds-table-header-{letter-spacing,text-transform}` a `derivedChannels` estaba
   ordenado para conseguir un direct-read control fixture. Medido: hace lo
   contrario. `directControlFixtureIds` exige que **UN target lea TODOS** los
   canales declarados, así que ensanchar el conjunto **quita** el fixture en vez de
   darlo; y esos dos canales eran la **única** fuente de divergencia static/DB en
   rottay y bithire, porque ambos verticales los **autoran** en su artifact
   (`* 0.75` y `* 0.8125`) mientras evnto no. Revertido: `capabilities/index.ts`
   queda **byte-idéntico a HEAD** y el repin de 20 manifests que el DT había
   preautorizado **no ocurrió**. El fixture se resolvió extendiendo `token-readout`
   con los 5 canales **ya declarados**.
5. **Rojo falso reproducible del guard `unhydrated-target`, arreglado a nivel
   fixture por ruling del DT.** `color remains fixed` es `every-measured-target`, así
   que inyecta `background-color` en el plan de **todos** los targets; en un div
   pelado ese longhand está legítimamente en su valor inicial, y el guard reportó
   como no hidratado a un `token-readout` cuyas custom properties demostrablemente
   se movieron. Lo mismo en `card-modern-md/title` en fase de mutación, porque el
   stop editorial lleva `letter-spacing` legítimamente a `normal`. Experimento de
   control que lo aísla: el mismo par de fixtures bajo los 8 negativos de
   `spacing.rhythm` da **0** guard failures. Arreglado declarando `border-top-style`
   en ambos targets — la capa base del DS lo pone en `solid`, es decidible, no
   inicial y no es canal de ningún control. **No se declaró ningún negativo falso
   para hacer pasar un guard.** El arreglo estructural (que una propiedad inyectada
   por un negativo `every-measured-target` no vuelva decidible a un target por sí
   sola) vive en `foundation/guards`, fuera de los paths autorizados: queda como
   deuda.
6. **Negativos: sólo `color remains fixed`, y es un piso deliberado.**
   `font metrics remain fixed` **no puede** declararse: `--ds-letter-spacing-heading`
   es canal declarado de este control y el testigo pintado principal, así que esa
   entrada afirmaría que el canal bajo prueba no debe moverse. `border-fixed` y
   `border-width-style-fixed` quedan fuera por la misma clase de razón (el eje edge
   posee `--ds-edge-standard-width`; el eje geometry mueve `radiusScale` como field
   default). `motion remains fixed` queda fuera porque es **cierto por stop, no por
   control**: `management-editorial` fija `{intensity 0.7, durationScale 1.1,
   ambient subtle}` como field default, así que declararlo control-wide sería falso
   sobre el control aunque el payload de 5 canales no cargue ningún canal de motion.
7. **`internalChannels` de la celda: `--ds-card-title-letter-spacing`, y el dueño lo
   decide el lector.** `components/card.css:133` lo declara como
   `var(--ds-letter-spacing-heading)` — es decir, el **productor** del socket lo
   resuelve directamente desde el canal declarado de este control — y la skin modern
   lo lee en `card.css:521` con ese mismo canal como fallback. Por eso el dueño es
   `experience.profile` y no `typography.scale`. Único dueño: verificado que ninguna
   otra celda lo reclama.
8. **`anatomy.propertyGroups` de Card NO se tocó, y eso deja un hueco nombrado.**
   La celda declara sólo `surface-decoration`, el único grupo que la anatomía de
   Card posee y que cubre una cadena que este control mueve (root
   `background-image`). El testigo **principal** — title `letter-spacing` — no tiene
   grupo type-metrics en Card, así que se evidencia por `computedProperties` e
   `internalChannels` en vez de por grupo. Agregar ese grupo es una edición de
   `anatomy`, dueño revisado aparte y fuera del alcance autorizado: registrado como
   deuda, no rodeado.
9. **Los 20 receipts previamente cerrados se reemitieron y validan.** Circularidad
   que conviene dejar escrita: `sourceFiles` de un receipt incluye los manifests de
   control y de familia, así que **toda edición de manifest stalea todo receipt que
   lo nombre**. El orden correcto — y el usado — es congelar source y manifests,
   `--sync`, rebuild, y **recién entonces** emitir en una sola pasada. Verificación
   final con `verifyReceipt` (+`loadProgramContracts`) y `artifactStillMatches`
   sobre el árbol congelado: **24/24 VALID+FRESH, 0 stale**. **Ningún receipt
   cerrado queda stale.**
10. `manifest --check` pasa de **36** hallazgos en `48fa4f20a` a **24**: se
    eliminaron los 12 de digest stale y **no se introdujo ninguno nuevo**; los 24
    restantes son los de `spacing.rhythm` que ya existían. Verificado por diff del
    conjunto completo contra la línea base de HEAD.
11. `disposition` de la celda sigue `UNKNOWN` **no por falta de medición**, misma
    razón que los packets anteriores; **`SIGHTED_ACCEPTED` no se reclama** y
    `nextAction` es `OBTAIN_CODEX_SIGHTED_ACCEPTANCE`.
12. **Deuda explícita: 254 de 255 celdas de familia de `experience.profile` siguen
    con la razón conflacionada `MUST_NOT_REACH`.** Sólo se readjudicó
    `primitive/display/card`, y sólo porque ahora tiene testigo pintado. **Este
    packet no es evidencia sobre las otras 254 en ninguna dirección**; cada una
    necesita su propio testigo, y un flip masivo repetiría el error original en
    sentido contrario.
13. **Sin medir**: divergencia responsive (un solo viewport), cualquier consumidor
    de los 5 canales que no sea Card, y los tres canales declarados que no pintan en
    este fixture.
14. **Dos defectos propios, encontrados revisando mi propio diff y corregidos**:
    `json.dump` había escapado los em-dash a `\uXXXX` en todo `fixtures.json`
    (re-serializado con `ensure_ascii=False`), y una nota seguía diciendo "seven
    declared channels" después de la reversión a cinco.

15. **`roundId` cronológico, corregido dentro del packet.** La primera reemisión de
    los 20 receipts previos se corrió con `--round-id R2` para todos, lo que bajó a R2
    los 6 de `shape.radius-scale` que estaban en **R3** y habría contradicho su propio
    asiento. Detectado comparando contra `48fa4f20a` antes de cerrar. Corregido por
    orden del DT: los 6 de `shape.radius-scale` reemitidos con **R3** (cierre previo
    restaurado) y los 4 de `experience.profile` con **R4** como cuarto packet;
    `spacing.rhythm` y `surfaces.effect-intensity` **no** se re-emitieron con
    roundId nuevo y quedan en **R2**; a nivel archivo ambos SÍ fueron reescritos
    dentro de `56fb593fd` (los 8 artifacts y 8 receipts de spacing-rhythm y los
    receipts de effect-intensity llevan `createdAt` 2026-08-23T10:12Z/10:49Z).
    Mismos escenarios, mismos binds, mismo árbol final. Revalidación posterior:
    **24/24 VALID+FRESH**. Ningún asiento anterior queda contradicho.

Toolchain de este packet: los 4 escenarios de `experience.profile`, los 2
artifacts no receipted, los 20 receipts reemitidos, los builds y los focales se
corrieron **sólo** en Node **v22.17.0** (el pineado; el `node` por defecto de la
máquina es v25.2.1 y el PATH se fijó en cada invocación). No se hizo cruce en otra
versión, así que este packet no reclama contraste de reproducibilidad.


#### Asiento de autoridad y auditoría — 2026-08-23 (estado vigente)

- HEAD al abrir este asiento: `56fb593fdc134cf17b5bc9842085e3ff2e798d26`; worktree limpio.
- **DT vivo: Codex.** No hubo sucesión DT el 2026-08-23. Existe un handoff
  PREPARADO a Kimi K3 (`/Users/daniel/Developer/Rottay/modern-rescue-kimi-dt-handoff-2026-08-23.md`,
  SHA `088ddd360676439719a203271a0ff2a067314f3ed0a2d434b33a89a81b84e665`) que
  NO tiene efecto de autoridad: la última orden explícita del owner fue dejar
  un prompt sin transferir ni operar la sesión, y la autorización posterior a
  Codex fue contactar a Kimi K3 únicamente para la re-auditoría. La sucesión
  sólo la consuma una orden explícita del owner; cuando ocurra, el packet de
  autoridad (AGENTS.md, CLAUDE.md, agent-orchestration.json, program-check.mjs,
  README del programa, tenant-art-direction.json, rounds.json,
  checkpoint.intent.json, fence SIGHTED_APPROVER) se ejecuta en UN packet con
  procedimiento T-1 y con la fecha real de esa orden.
- **Re-auditoría independiente Kimi K3 (owner override 2026-08-23, READ-ONLY):**
  veredicto `ACCEPT_WITH_CORRECTIONS`.
  Memo: `/private/tmp/modern-rescue-kimi3-independent-reaudit-2026-08-23.md`,
  SHA `2b87b306e2b4d372533dd314f35d8e6c165e027e806eab4b16fecf391791a518`.
  Prompt fresco: `/private/tmp/modern-rescue-kimi3-fresh-session-prompt-2026-08-23.md`,
  SHA `c328f4254c1509c1894885028c1bd85f5d170f1f84ade0fcee8f6590953fbd62`.
  Revisión Fable de sus correcciones:
  `/private/tmp/modern-rescue-fable-review-kimi-corrections-2026-08-23.md`
  (SHA registrado en su archivo `.ready`). Los tres persistidos en
  `docs/evidence/2026-08/` por este asiento.
- **Estado de gates en HEAD (medido, no heredado de memos):**
  `program-check.mjs` = `BLOCKED`, 24 fallos, todos celdas `spacing.rhythm` de
  `manifest/families/primitive/layout/{flex,grid,space,stack}.json`
  (mechanism null; internalChannels vacío; evidenceIds `R2:…` fuera del
  evidence root — los artifacts viven en
  `test-artifacts/quality-evidence/wo-cra-23/F4B/spacing-rhythm/`; evidenceKind
  sin computed-delta ni exact-restore). Heredado desde `56847146f` (25→24 en
  `5ce42e1b7`, 0 nuevos después). `gat07:check` = STALE: sello vigente
  `1c127bf0e` (2026-08-22) invalidado por la serie F4B (18 inputs sellados
  modificados desde el sello). Drill `composition/receipt` 11/12 (rojo
  heredado con ruling del dueño "fuera de alcance", asentado arriba en el
  packet de effect-intensity).
- **Regla vinculante nueva (C3):** cada packet F4B restante cierra con resello
  `gat07:write` como paso obligatorio, antes de su commit.
- **Correcciones que bloquean F4B 5/20 (orden):** C2 (program-check verde:
  corregir las celdas o enmendar la ley del gate UNA sola vez con asiento,
  unificando el vocabulary evidenceKind con los otros 3 controles), C3
  (resello gat-07), C4 (abajo). C2 y el refresh de `checkpoint.intent.json`
  (`currentWave` describe F4A como frente abierto; F4A cerró 2026-08-22) son
  contratos máquina: se ejecutan como packets T-A con program-check corrido
  antes y después, nunca como edits documentales.
- **Deudas con dueño (C6):** `OPEN_VERTICAL_CASCADE_DEFECT`
  (`manifest/controls/experience.profile.json:95`; bithire dark:
  `artifacts/bithire/index.css:644` vs `:1496`) queda `OPEN_DT` — crear packet
  propio: es propiedad del generador de artifacts verticales, no de
  `experience.profile`. `OPEN_ARM_ASYMMETRY` (`experience.profile.json:103`)
  queda `OPEN_OWNER` — decisión requerida antes de F2-asimétrico/F3.
- **OPEN_OWNER adicionales:** resolución del `stash@{0}` pre-programa (toda
  operación de stash está vetada sin orden explícita del owner); política de
  backup de los 519 commits locales sin push; reapertura (o no) del fence
  `SIGHTED_APPROVER` cuyo rojo tiene ruling previo del dueño.

##### Brecha de escribanía PRE_F4B→F4B (C4) — declarada, no regularizada

La condición vinculante de apertura del Lote B (asiento PRE_F4B, decisión 6c:
`unknownProvenance == []` real MÁS doble postaudit — reauditoría independiente
A4–A9 y postaudit Fable del diff completo) se cumplió sólo a medias. El drenado
2.024→0 existe: **15 commits** `8d2985638..6cfdcc1a9` (2026-08-22, inclusive),
todos con cuerpo vacío, que además tocaron **2 archivos de `packages/core/src/`**
fuera del write-set mínimo declarado A4/A5/A6
(`foundation/tokens/ts/runtime/personality/index.ts` y
`infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx`).
Ni esos commits, ni el ruling de apertura del Lote B, ni las dos auditorías
exigidas tienen asiento en este ledger, y no se hallaron memos de postaudit en
/tmp (sólo logs de corrida). **Remediación vinculante antes de F4B 5/20:** el
DT agenda la doble postaudit retroactiva del diff `8d2985638~1..6cfdcc1a9`
(incluidos los 2 archivos src) y asienta su resultado acá, o el owner dispensa
la condición explícitamente y la dispensa se asienta. Esta declaración no
inventa retroactivamente un ruling que no se registró.

##### T-1 — Sucesión DT Codex → Kimi K3 CONSUMADA (2026-08-23, acto del DT entrante)

**Supersedencia declarada.** La orden explícita del owner del 2026-08-23
(`docs/prompt-dt-fresh-session-2026-08-23.md`, ejecutada por la sesión fresca
del DT entrante) consuma la sucesión Codex → Kimi K3. Este asiento supersede,
sin reescribirlos: el literal "DT vivo: Codex. No hubo sucesión DT el
2026-08-23" del asiento de autoridad de esta misma fecha (escrito antes de la
orden), la fila "Codex: DT y autoridad de adjudicación" del bloque Autoridad
y roles vigentes, y toda cláusula viva que nombraba a Codex como DT. Codex
queda como consultor técnico read-only de baja frecuencia (sin gate, sin
asiento de auditoría, sin autoría). Exactamente un DT vivo antes, durante y
después: es la **tercera** sucesión de la cadena (2026-08-20 Codex→Kimi K3,
2026-08-21 Kimi K3→Codex, 2026-08-23 Codex→Kimi K3), y la regla DT ≠ auditor
(decisión 13) vincula a Kimi K3 desde ya.

**Baseline verificado una vez, no reconstruido:** HEAD `aaa96eef8` (commit
documental del owner con el prompt de sucesión; parent `78dce1f7a`, el HEAD
que la orden declaraba esperado), `main...origin/main [ahead 521]`, worktree
limpio, staged 0, sin push, `stash@{0}` intacto (owner-gated). Sesiones tmux:
f05-opus, f05-sonnet, fable-ejec y f05-kimi3-advisor vivas;
f05-codex-reviewer recreada con bypass de aprobaciones para la consulta
read-only de baja frecuencia.

**Write-set (13 paths, ejecutado por el DT entrante; no se delegó autoría de
autoridades):** `AGENTS.md`, `CLAUDE.md`, `agent-orchestration.json`,
`program-check.mjs`, `program-check.test.mjs`, `README.md` del programa
(sección Roles reescrita; bloque stampado re-renderizado por
`program-state --write`, nunca a mano), `tenant-art-direction.json`,
`rounds.json`, `program.json`, `quality-rubric.json`,
`visual-craft-contract.json`, `checkpoint.intent.json` (currentWave F4B,
blockedOn C2/C3/C4 + deudas con dueño) y este roadmap.

**Rulings DT del packet (decididos una vez):**

1. **Los nombres legacy NO migran.** Los enums `*_PENDING_CODEX_AUDIT` /
   `IMPLEMENTED_PENDING_CODEX_AUDIT`, el campo `codexDecision`, la clave
   `maximumFamiliesBetweenCodexCheckpoints` y el token de fórmula
   `codexSightedApproved` son nombres históricos, no designaciones de asiento
   (precedente K5: `KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json`).
   Renombrarlos sería una migración de datos sobre evidencia sellada y
   tooling v2 sin ningún efecto de autoridad.
2. **El fence `SIGHTED_APPROVER` (`v2/receipts.mjs:7`) queda fuera del
   write-set.** Su rojo tiene ruling previo del dueño y su reapertura es
   `OPEN_OWNER`; la orden T-1 sólo permite tocar fences si el ruling vigente
   lo permite. `finalSightedAuthority` del rubric es contrato vivo
   checker-pinned y SÍ migró; el fence de receipts es una constante
   independiente y sigue owner-gated.
3. **`phase-a/ledger-schema.json` no se toca** (sellado; scope adjudicado
   `:!**/phase-a/**`).
4. **Las aceptaciones futuras nombran al rol, no al actor:** R1–R4 GO, R6
   ("Independent DT certification") y R7 entry/exit quedan en lenguaje de rol
   (`DT`), coherente con `customization-model.json#r7Execution.entryLaw`.

**Pruebas (Node v22.17.0, antes → después):** `program-check.mjs` BLOCKED con
el mismo conjunto de 24 fallos `spacing.rhythm` (4 familias × 6 clases) —
salida byte-idéntica a la baseline (0 nuevos, 0 resueltos; C2 sigue abierto y
es el próximo packet). `program-check.test.mjs`: 46/48 → 46/48 con identidad
de fallos preservada: test 1 = **46 errores** (los 24 heredados de
spacing.rhythm MÁS 22 sobre `card.json` que son artefacto estructural del
sandbox T-1a — `CLOSURE_MEMBERS` no incluye `packages/core/test-artifacts`,
así que dentro del sandbox ningún receipt F4B existe; deuda PREEXISTENTE
T-1a/F4B, invariante bajo T-1, con packet futuro propio: añadir
`test-artifacts` a `CLOSURE_MEMBERS`, NO hacerlo dentro de T-1) y test 47 =
A11 preexistente (`cascade-producers.test.mjs` N13/T-21, deuda PRE_F4B).
`program-state --write` re-renderizó el checkpoint (intent `150b10665e5919da`,
render `ab56c7f91a1b623e`); `program-state --check` sin violaciones.

**Postaudit Fable del diff T-1: `ACCEPT`.** Memo
`/private/tmp/t1-succession-fable-postaudit.md`, SHA-256
`7ed3a67f3a3e353eecbf443046c369c067628fde212f5d6966c8f637df4f3927`
(verdict en `.ready`: 6/6 puntos falsables atacados, ninguno refuta;
autorización de commit condicionada a completar estos placeholders — hecho).
Hallazgos no bloqueantes asentados: (1) la caracterización fina del test 1
(46 errores, arriba); (2) `SIGHTED_APPROVER` queda doblemente stale y sigue
owner-gated (al reabrirse: apuntar al asiento por rol o derivarla de
constante viva, no a otro nombre propio); (3) las sesiones tmux declaradas en
este asiento son declaración del DT, no hecho auditado.

##### C2 — `program-check` VERDE (`CONSTITUTION_READY`) por primera vez desde `56847146f` (2026-08-23)

Los 24 fallos heredados de `spacing.rhythm` (4 familias × 6 clases) se
resolvieron **causalmente**: la ley del gate NO se enmendó (cero diff en
`manifest/rules/**`, `program-check*`, `v2/**`) y ninguna celda se reancló a
otra evidencia. Writer: Claude Opus (único writer), SOURCE_READY
`/private/tmp/c2-spacing-rhythm-opus-source-ready.md`. Postaudit Fable:
**ACCEPT**, memo `/private/tmp/c2-spacing-rhythm-fable-postaudit.md`, SHA-256
`236d1ab34f390ee7db0e6f4d2a429526ea242e6a0a9d1d02c4a0bd55d34963ae`.

**Write-set (14 paths):** 4 celdas `spacing.rhythm`
(flex/grid/space/stack) — `mechanism: THEME_CONTROL`, 11 edges
`internalChannels` reales (subconjunto exacto de los `outputBindings`
preexistentes, `extra=[]`, ley de cardinalidad verificada: cero dueños en
disputa sobre las 255 familias), `evidenceIds` como rutas repo-relativas del
evidence root (la forma de los otros 3 controles); control manifest **+1
línea** (`calibration.evidenceKindLabellingRule`: tight→
`static-db-computed-parity`, airy→`exact-restore`; cada artifact prueba ambas
mitades — Fable muestreó 4/4); `manifest/index.json` regenerado por el
productor canónico (6 hojas digest, cero drift semántico); 8 receipts
**re-emitidos por el productor** (`writeEvidence`/`buildReceipt`, nunca a
mano): 3 campos cada uno (`evidenceKind`, `sourceDigest`, `createdAt`),
artifacts byte-idénticos a HEAD, `roundId` R2 preservado. `disposition`
sigue `UNKNOWN` y `unknownReason` íntegro en las 4 celdas (honesto: sin
aceptación sighted).

**Verificación DT de primera mano:** `program-check.mjs` =
`CONSTITUTION_READY` (corrida propia); validador v2 = 24/24 VALID (corrida
propia); Fable re-verificó por tres validadores: 24/24, 0 stale. Suite
constitucional tras el packet: test 1 pasa de 46 errores a **22** (los 24 de
spacing.rhythm resueltos; los 22 restantes son el artefacto sandbox
`CLOSURE_MEMBERS` sin `test-artifacts`, deuda T-1a/F4B ya asentada con packet
futuro propio).

**Obligaciones vinculantes del ACCEPT (F1/F2 del postaudit):**

1. **ROJO CONOCIDO declarado:** `resolution-probe` negative-controls test #20
   queda **19/20** (verde en HEAD analíticamente). Conflicto de leyes
   PREEXISTENTE: ese test exige `evidenceIds` de celda ⊆ listas del control
   en forma `R2:…` mientras `program-check` (constitucional, blocking) exige
   rutas resolubles bajo el evidence root; ambas son insatisfacibles a la vez
   y el packet obedeció la constitucional. No es gate-wired (`test:scripts`
   no cubre `src/tooling`). Evidencia: el memo Fable de este packet.
2. **FOLLOW-UP OBLIGATORIO** antes del próximo packet que toque
   `spacing.rhythm`: re-legislar **una sola vez** el test negative-controls
   (el test entra en su write-set), preservando la protección causal
   histórica («evidence is OUTPUT, never hashed as source binding») en la
   forma nueva; verificar en ese packet que el runner no hashea
   `evidenceIds` de celda (no asumirlo). Puede fusionarse con el de H1 en UN
   packet atómico.
3. **H1 (follow-up atómico):** 4 canales `--_ds-` reales
   (`--_ds-grid-column-gap`, `--_ds-grid-row-gap`,
   `--_ds-stack-divider-gap-block`, `--_ds-stack-divider-gap-inline`) sin
   declarar porque el cross-check inverso exige fila en `terminalReach` de
   `manifest/cascade/roots/spacing.rhythm.json` (fuera del write-set C2).
   Correspondencia a preservar 1:1: `terminalReach` 88 filas = 88 edges.
   Corrección de censo (F2): las listas `staticDbParityEvidenceIds`/
   `exactRestoreEvidenceIds` las leen el generador Y el test #20; el fix
   cosmético propuesto por el writer queda descartado en favor del follow-up
   legislativo. Observación (F3): criterio `fallbackAuthority` consistente
   al declarar esos 4 edges.
4. **H2/H4/H5:** correctos y asentados (`--ds-density-effective-scale` no
   reclamado — dueño `density.mode`; `SIGHTED_APPROVER` doblemente stale y
   owner-gated; rótulo de flex lista canales de stack — adjudicación DT
   pendiente, no urgente).

**C3 — resello GAT-07 ejecutado como paso obligatorio del cierre (regla
vigente desde T-1):** `gat07:write` + `--check-artifact` verdes — 2 corridas
deterministas idénticas, hash `a24805069cf45ee25cebde62e5feb635052dac3baa2260c996261467c636e6d4`,
3326 counters / 3226 exact zeros / 542 data-part entries. Artefactos:
`packages/core/test-artifacts/gates/gat-07/semantic-evidence.json` y
`semantic-hash.txt`. El sello `1c127bf0e` invalidado por la serie F4B queda
superseded por este. **Regla operativa adoptada:** el resello `gat07:write`
es paso obligatorio del cierre de TODO packet F4B, antes de su commit.

##### C4 — brecha PRE_F4B→F4B REGULARIZADA (2026-08-23)

La brecha declarada arriba queda cerrada por doble postaudit retroactiva más
fixes focales. La condición 6c queda **satisfecha en sustancia** (ver salvedad
de letra abajo); F4B 5/20 queda habilitado.

**Diff auditado:** `8d2985638~1..6cfdcc1a9` (15 commits, 2026-08-22/23), 9
archivos, +12.643/−2.105 — diffstat COMPLETO (lección NEW-1: no sub-declarar
alcance): `cascade-disposition.mjs` (nuevo, 1665), `cascade-governance.mjs`
(nuevo, 651), `cascade-producers.mjs` (+577), `cascade-producers.test.mjs`
(+3816), `cascade-public-surface.mjs` (nuevo, 572),
`cascade-cross-file-resolver.mjs` (nuevo, 3092),
`manifest/cascade/extracted/producers.json` (4156 líneas modificadas), y los
2 src fuera del write-set mínimo:
`src/foundation/tokens/ts/runtime/personality/index.ts`,
`src/infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx`.

**Doble postaudit retroactiva:**

- Reauditoría independiente A4–A9: Codex (consultor read-only, caveat de
  tenure declarado — fue DT cuando aterrizó la brecha; su memo no cuenta como
  asiento organizacionalmente independiente). Veredicto DEFECTS. Memo
  `/private/tmp/c4-a4a9-codex-reaudit.md`, SHA-256
  `5ad31219ba57866522444dd01e93ed891a649d09153db77fc990cfa64ccdbaf8`.
- Postaudit principal del diff completo: Fable 5. Veredicto **REGULARIZA** —
  el trabajo es real, correcto y re-derivable; nada que rehacer. Memo
  `/private/tmp/c4-full-diff-fable-postaudit.md`, SHA-256
  `645c634ef207b065717b222489ab477556e6756c7f71ca61808c0050d78458e4`.
  Reproducciones independientes + muestra semántica disjunta de la de Codex;
  los 5 hallazgos de Codex quedaron 5/5 CONFIRMED contra el árbol.
- **Condición 6c: satisfecha EN SUSTANCIA** (adjudicación Fable): todos los
  invariantes que la reauditoría debía establecer fueron verificados además
  por el asiento independiente. Si el owner exige la letra exacta (reauditor
  organizacionalmente independiente), una tercera pasada es posible; Fable no
  la recomienda por falta de valor marginal identificable. Queda ofrecido al
  owner; por defecto se toma la sustancia.
- Ambos memos entran en `docs/evidence/2026-08/` en el próximo lote
  documental (deuda de persistencia asentada).

**Verdad establecida:** `unknownProvenance == []` es real y re-derivable
(2024 = 69+627+534+728+66; `openBlocking 0`, `ownershipConflicts 0`,
`lotBOpen true`; sin contador pineado). Muestras semánticas disjuntas
(20 Codex + 4 Fable) concordantes con fuente.

**Adjudicación D1 (los 2 src):** el cambio (37 canales `--ds-*` → 37 sockets
`--_ds-personality-resolved-*`, biyección exacta con `personality.css`,
fórmulas byte-intactas, hold con re-derivación y guard de consenso
fail-closed, 23/23 tests focales verdes) es **la corrección de autoridad que
la doctrina exige** (el runtime no emite una capa visual que compita; los
canales los pinta la proyección estática), aterrizada **por canal indebido**
(dentro de una brecha declarada como instrumentación, fuera del write-set
mínimo, sin asiento). **Brecha de PROCESO, no de contenido: se acepta con
este asiento, sin reversión; los 2 src no se tocan.**

**Fixes focales ejecutados (packet C4-fix, writer Opus):**

1. **T-11 anclado** (`cascade-producers.test.mjs`): el test ahora pinea que
   los digests PUBLICADOS son el hash de la proyección productiva sobre las
   filas reales (`relayKinds` incluido — defecto lateral corregido), con
   guarda de vacuidad (534/728/66 filas) y dos negativas de granularidad
   (borrado masivo y alteración de UNA fila mueven el digest publicado).
   Sensibilidad probada por tríada: íntegro+nuevo=PASS, mutado+viejo=PASS
   (el defecto), mutado+nuevo=FAIL exactamente en el anclaje. La desviación
   (anclaje en vez de mutación productiva literal) quedó ACEPTADA en
   sustancia por Fable con fundamento verificado (digest local no
   exportado; `classifyCrossFileRows()` clava REPO_ABS). Observación
   registrada: el anclaje es un PIN — un cambio legítimo futuro de la
   proyección exige actualizar el test en lockstep; ese rojo futuro es
   diseño, no regresión.
2. **T-12 renombrado** con comentarios y banner T-FINAL-352 corregidos,
   CERO cambio de assertions (verificado mecánicamente: las 9 líneas
   `assert.` del diff son todas de T-11); advertencia legítima preservada y
   apuntando a la ley de implicación. Conteo: 209 antes, 209 después.
3. **Frescura:** `producers.json` re-derivado por el productor canónico
   (`--write`); leaf-diff completo = exactamente las 4 hojas de frescura
   (censo 1664→1665 + digest); filas, listas, receipts y stats intactos.

Verificación: `cascade-producers.test.mjs` **209/209** (PRE 207/2; N13 y
T-21 verdes, corridas propias del DT y de Fable); `--check` OK matches the
tree. Postaudit delta Fable: **ACCEPT**, memo
`/private/tmp/c4-fix-fable-postaudit.md`, SHA-256
`5b8af3d9cf04e46db0b3ba52c290b87c2b6ea43b9ef3def905c44b097f3bcdb2`.
Write-set contenido: los 2 src de D1 y el productor con 0 diff.

Con C2, C3 y C4 cerrados, **F4B 5/20 queda habilitado**. Disciplina
operativa adoptada (mandato Fable): stage siempre por paths explícitos; el
DT no escribe el ledger durante la corrida de aceptación de un writer.

##### H-1 + F4B-5 density.mode + degradación honesta de experience.profile (2026-08-23)

Packet consolidado en UN commit, exigido por la cadena de frescura del
instrumento: H-1 stalea los 30 receipts, y el gate sólo vuelve a verde con
todo re-emitido y re-medido contra el árbol final. Writer: Claude Opus
(único writer). SOURCE_READY
`/private/tmp/h1-density-experience-opus-source-ready.md`.

**H-1 — el brazo estático compila SOBRE el baseline del vertical.**
Defecto medido en F4B-5: `cli/index.mjs:581` llamaba `lowerStop` sin
`base`, compilando un BrandTheme monocampo inexpedible en producción; el
`?? 1` de la semilla disparaba y `--ds-density-scale` colapsaba a `1` en
bithire/evnto (rottay inmune por casualidad). Precisión asentada (Fable):
el compilador estaba bien; el instrumento le daba un theme que producción
no despacha. Fix: `base` del vertical publicado sólo en el brazo estático
(el DB resuelve su baseline dentro de `compileTenantThemeConfig` —
asimetría estructural). **Preaudit Fable: ACCEPT con 5 correcciones
vinculantes (V1–V5)**, memo
`/private/tmp/h1-base-arm-fable-preaudit.md`, SHA
`ac2cd7a1fffe0a8b4a5f855d517501a5a3ea5882b0cda522dc835ff1ba8f9cdf`:
prosa fechada en `INGRESS_ARMS` + README, `producedBy.input.baseline`
OBLIGATORIO (la verificación de arm falla sin él), drill 3 construido para
crecer (itera controles cerrados desde el manifest), cargador bajo la ley
de frescura de dist, guard anti-doble-aplicación al brazo DB. Cambio de
significado del instrumento, acto fechado: la puerta estática mide "el
stop compuesto sobre el theme autorado del vertical". Drills **47/47**;
los 20 receipts spacing/effect/radius quedan **invariantes** (drill 3 los
pinea; sus artifacts conservan bytes).

**F4B-5 — `density.mode` COMPUTED_VERIFIED, 5/20.** 6 escenarios
{rottay,bithire,evnto} × {compact,spacious}, ambos brazos sobre una escena,
ambos temas. Pin por canal: `--ds-density-mode-factor` 0.85/1.15 en AMBOS
brazos; el `--ds-density-scale` estático ya no colapsa (1 / 0.9 / 1.125).
Pintado en `space-modern-preset-gap/root`: 15→12.75 / 13.5→11.475 /
16.875→14.3438 (compact) y 15→17.25 / 13.5→15.525 / 16.875→19.4062
(spacious) — **estático = DB en los seis**, ratio idéntico 0.85/1.15 con
absolutos divergentes (multiplicador puro sobre escala estructural).
Rhythm aislado (cero declaraciones en los 3 artifacts + lectura en ambas
fases); gap numérico negativo intacto; restore exacto con asimetría
declarada (bithire parte de un `1` de ORIGEN PERFIL, asentado). Celda
`primitive/layout/space` COMPUTED_VERIFIED (mechanism THEME_CONTROL,
stableParts [root], propertyGroups [preset-and-exact-gap]); control con
listas particionadas desde el inicio, `measuredResult` honesto (UNA
familia medida; el canal tiene 71 lectores), `unmeasuredScope` con la ley
de `normal` (identidad, sin receipt — expresable, a diferencia de `suave`),
`negativeControlsScopeNote` (control-height/touch-target/font-metrics/
icon-size NO se declaran a nivel control: `menu.css:401`,
`Input/engines/modern/index.tsx:170`), `sourceBindings` ×9, y 2
`knownDefects` nuevos (vocabulario triple de density — deuda registrada
breaking, no de este packet; tensión intención-vs-mecanismo en bithire —
registrada como OPEN_DT para revisión de craft). Receipts nuevos R5 ×6.
**Adjudicación DT previa:** fix del anti-door `capabilities/index.ts:248`
→ `surfaces.density` (protocolo radius-scale: repin de 20 manifests, cero
drift semántico fuera del path).

**experience.profile — DEGRADADO honestamente (COMPUTED_VERIFIED →
IMPLEMENTED).** Su re-medición pintada bajo el instrumento corregido
**refuta, no renumera**: en los 6 casos el brazo estático queda INERTE
para `--ds-letter-spacing-heading` mientras el DB lo mueve. Dos causas
distintas: (a) rottay/evnto — el brazo compuesto emite exactamente el
valor que el artifact ya autora (el perfil pierde contra el campo autorado
dentro de `compileBrandTheme`, precedencia `brand-theme:758-773` —
producción-verdadero); (b) bithire — el artifact declara el canal dos
veces y el bloque dark de mayor especificidad gana
(`OPEN_VERTICAL_CASCADE_DEFECT`, ortogonal, ABIERTA). La asimetría es REAL
y general, no artefacto del instrumento ni rareza de bithire. Celda card →
IMPLEMENTED con `verificationNote` (refutación + causa doble + pregunta
owner-pendiente); control → IMPLEMENTED con `knownDefects[0]`
`ARM_ASYMMETRY_REAL_NOT_ARTIFACT` (`OPEN_OWNER`, con la prueba);
`measuredResult` preservado verbatim con `supersededStatus` (supersedida
la conclusión, no los números); 4 receipts re-emitidos SÓLO por frescura
(R4, artifacts byte-idénticos). **`OPEN_ARM_ASYMMETRY` queda como decisión
de PRODUCTO del owner** con prueba nueva; el censo de canales perfil ×
autorado vertical se corre con su respuesta. Las 6 mediciones nuevas
(advisory) persisten en `docs/evidence/2026-08/h1-experience-advisory/`
(10 archivos, INDEX actualizado, 10/10 MATCH).

**Re-emisiones y gates:** 30/30 re-emitidos (R2×14, R3×6, R4×4, R5×6;
**tres** campos movidos: `sourceDigest`, `createdAt` y `toolVersion` — la
huella H-1 del instrumento, corrección F2 del postaudit), validador v2
30/30 VALID+FRESH (corrida propia del DT); `manifest/index.json`
regenerado (2002→2006 hojas: **4 altas** = parts/groups de density y
**25 cambiadas** = los 7 declarados + los 18 digests de los controles
repineados — delta verdadero citado, corrección F1 del postaudit, cero
drift real);
`program-check.mjs` = **CONSTITUTION_READY** (corrida propia del DT);
`tsc --noEmit` limpio; build canónico post-H-1 verde. **Ley de
procedimiento adoptada:** copia previa obligatoria antes de re-medir
evidencia existente (sirvió: el runner sobrescribió los 4 artifacts de
experience y se restauraron byte-idénticos desde la copia).

**Consulta ejecutiva Codex (cierre de tanda de gobernanza), asentada:**
(1) frescura por dependencia semántica — reforma de una vez ANTES de F9
(kernel/guards compartidos invalidan todo; sólo el fixture/vocabulario/
adapter usado invalida su escenario; preaudit + drills + default
conservador); (2) fix estructural de `lowerStop` SÍ — debe cerrar antes
del próximo packet dependiente (el pin por canal queda como redundancia);
(3) responsive.posture por sonda DATA diferencial (adapter que exige delta
exacto en `normalizedAppearance`, igualdad total de variables CSS, prueba
el consumidor real, verifica restore y mutaciones) con guardia nueva +
preaudit Fable. Quedan en la cola con ese orden.

**Postaudit Fable del packet consolidado: `ACCEPT`** con 2 correcciones de
asiento no bloqueantes (F1: delta verdadero del índice 4 altas + 25
cambiadas — incorporado arriba; F2: `toolVersion` como tercer campo de
frescura — incorporado arriba). Memo
`/private/tmp/h1-density-experience-fable-postaudit.md`, SHA-256
`8021cffeeeb25e9926487ec2712e4088976335d67d025f754a549ffe6f19b440`.
Verificado por Fable: V1–V5 completas sin rebaje; density 6/6 pins con
valores físicos inspeccionados; degradación de experience honesta y
completa (measuredResult verbatim, refutación con doble causa sin fundir,
`nextAction: AWAIT_OWNER_DECISION_ON_PROFILE_VS_AUTHORED_PRECEDENCE`);
advisory 10/10 byte-idénticos; GAT-07 `ddec6036…` verificado; la
hipótesis de su propio preaudit (artefacto del instrumento) quedó refutada
por la medición — el flujo V2 funcionando. **F4B queda 5/20 honesto.**

##### H1/H3 — spacing.rhythm íntegro: legislación negative-controls + terminalReach 92=92 (2026-08-23)

Follow-ups vinculantes del ACCEPT C2, cerrados en UN packet atómico (writer
Opus; SOURCE_READY `/private/tmp/h1h3-spacing-opus-source-ready.md`):

1. **Test #20 re-legislado UNA vez** (`negative-controls/tests`): la forma
   nueva es "todo evidence id vive bajo el evidence root y resuelve a un
   receipt válido; las listas del control están particionadas por rol". La
   protección causal («evidence is OUTPUT, nunca un source binding
   hasheado») se preserva en su forma REAL: por RUTA, no por proxy de forma
   — `normaliseBoundPath` (`cli/index.mjs:429-432`) descarta todo path bajo
   el evidence root "however a manifest happens to spell an evidence id",
   así que el defecto histórico es hoy estructuralmente imposible
   (verificado en fuente + observación: 30 receipts, 0 rutas del root en
   `sourceFiles`). El drill muerde si los ids salen del root (inmediato) o
   si el guard del runner se rompe (en la siguiente re-emisión — latencia
   asimétrica asentada como hallazgo-nota Fable; opción barata NO
   vinculante: drillear `normaliseBoundPath` directo vía seam). 19/20 →
   **20/20**.
2. **terminalReach 92 = 92** (`cascade/roots/spacing.rhythm.json`, +4 filas
   `PRESCRIPCION` uniforme con las 88 previas) + **4 edges `--_ds-`**
   (`--_ds-grid-column-gap`, `--_ds-grid-row-gap`,
   `--_ds-stack-divider-gap-block`, `--_ds-stack-divider-gap-inline`) con
   fuente verificada línea por línea, `LIVE`, ∈ `outputBindings`
   preexistentes (cero canales inventados), `fallbackAuthority: null` con
   las dos razones distintas (grid lee sin fallback; stack = recomputación
   aritmética con guard `0px`, no cadena de valor — criterio F3). El 93.º
   edge (`--_ds-stack-gap-current`) es scratch-marked y el cross-check
   inverso lo saltea — el conteo ingenuo 93 no descuadra; censo Fable
   confirma 92 no-scratch = 92 filas.
3. **Listas del control particionadas** (defecto H3 cerrado): tight ×4 en
   `staticDbParityEvidenceIds`, airy ×4 en `exactRestoreEvidenceIds`,
   solape 0; celdas ⊆ set del control.

Verificación: `CONSTITUTION_READY` (corrida DT); test #20 20/20; validador
30/30 VALID+FRESH (re-emisión por frescura del contacto con manifests;
artifacts byte-idénticos; roundIds preservados). Postaudit Fable:
**ACCEPT**, memo `/private/tmp/h1h3-spacing-fable-postaudit.md`
(SHA en su `.ready`), con la nota de latencia asentada arriba.

##### H-2 — guard estructural de discriminación de stops (vector falso-INERTE cerrado) (2026-08-23)

El vector abierto desde `shape.radius-scale#knownDefects[1]` («`lowerStop`
falla cerrado cuando un compilador no emite NADA, pero no cuando emite un
default constante incondicional») queda **cerrado estructuralmente** por un
guard nuevo del instrumento, con preaudit Fable (ACCEPT, W-A…W-E) y la
recomendación Codex registrada. Writer: Opus. SOURCE_READY
`/private/tmp/h2-lowerstop-opus-source-ready.md`.

**Predicado (por brazo/escenario, adjudicado):** `K =
declaredOutputs.channels` (fuente normativa, W-D); FAIL «constant default
encodes no stop» ⟺ |W_ok|≥2 ∧ ningún canal de K discrimina (|valores|≥2
entre stops); FAIL «not decidable» ⟺ |W_ok|<2 (salvo excepción adjudicada
del mecanismo W-B: `calibration.stopDiscriminationException` con
`adjudicatedBy` obligatorio — la lista nace VACÍA y ningún manifest fue
tocado); PASS si ∃ canal discriminante. **∃, no ∀** — density sano da 1/2
(el scale es estructural, no el dial); el stop identidad sale gratis por
construcción (suave=1 convive con stops que discriminan; drill con doble
aserción que impide endurecer a ∀). W = todos los stops normalizados del
dominio: nadie elige su propio examen. Los excluidos viajan con razón
(identidad elidida, rechazo de envelope, domain.kind no soportado) en
`producedBy.stopDiscrimination`.

**W-C (la más filosa):** el guard usa EXACTAMENTE la misma tupla baseline
`{theme, source}` que el brazo del escenario — la firma exige la tupla y un
cross-check de digest por corrida prueba que coincide con
`armBaselineDigest`. La degradación silenciosa (wrapper como base → escala
bithire `1` en vez de `0.9` sin error) quedó reproducida y cerrada por dos
vías independientes.

**Límite honesto asentado en el README (W-A):** el guard prueba que el
brazo CODIFICA el stop, nunca que el stop PINTE — la vida por canal es de
`ingressEquivalence` + testigo pintado + expectativas por canal (caso vivo
citado: `experience.profile/static`, accesorio discrimina con principal
clavado por authored — inercia que encontró el testigo pintado y que
degradó ese control).

**Consecuencia elegida (W-E):** el guard es **blocking desde el aterrizaje**
y `typography.scale/static` queda bloqueado de inmediato en los tres
verticales (FAIL 0/1 medido: `--ds-type-scale` constante `1` — su
`staticBrandThemePath` es prosa no caminable Y su canal es semilla literal;
su packet futuro necesita LAS DOS cosas: keypath real en la autoridad —
mismo fix que density en `capabilities/index.ts` — y verificación de que el
stop sobreescribe la semilla). No tiene receipts: no invalida nada;
convierte una mentira silenciosa en una negativa explícita.

**Retrospectiva regenerada desde K normativo:** 30 PASS / 0 FAIL sobre el
catálogo receipted (spacing.rhythm 1/2, no 1/1 como decía el diseño — el
segundo canal declarado es constante; los veredictos no cambian, los
números ahora salen de la fuente de ley). **Los 30 receipts NO se
re-miden** (invariancia medida); se re-emiten sólo por frescura del
contacto con `ownedSourceFiles`, artifacts byte-idénticos, roundIds
preservados.

Verificación: 56/56 drills (47 H-1 intactos + 9 nuevos; corridas propias
del DT); `CONSTITUTION_READY`; validador 30/30; `tsc --noEmit` limpio.
Preaudit Fable: ACCEPT W-A…W-E, memo
`/private/tmp/h2-lowerstop-fable-preaudit.md`, SHA
`28a772ea654862b5c4f28f356b5e62a618f9e81555eb99e6a038871344ea5ab6`.
Postaudit Fable: **ACCEPT**, memo
`/private/tmp/h2-lowerstop-fable-postaudit.md` (SHA en su `.ready`) — el
guard real ejercitado por el auditor en sus cinco caras (sano PASS,
typography/static THROW vivo, y las tres negativas W-C tirando);
retrospectiva 30/30 coincidente entrada por entrada; sentinel `'\0absent'`
no colisionable verificado. Regla de proceso adoptada (segunda ocurrencia,
mandato Fable): **el asiento del ledger se escribe ANTES de despachar el
postaudit o DESPUÉS de recibirlo, nunca durante** — aplicada desde el
próximo packet.

##### F4B-6 — responsive.posture: primera instrumentación DATA del programa (2026-08-23)

`responsive.posture` queda calibrado como el primer control con terminal
DATA legítimo del programa, con instrumento hermano nuevo y evidencia R6 —
y con la honestidad de rango que la ley de hoy puede sostener: **control
`IMPLEMENTED`, celda `SOURCE_BOUND`**, por la brecha de vocabulario
asentada abajo (enmienda de ley aprobada como packet propio L-1).

**La sonda DATA (puro Node, sin Chromium — el instrumento más barato del
programa):** `composition/data-run/` con `buildDataCausalReport()`, 4
guards DATA nuevos (`data-absent`, `data-constant`, `data-bypass` con dos
capas NO confladas — write-time throw vs render-time fail-closed,
`data-restore` = `undefined` tras remoción, no igualdad), la ley
`data-not-decidable` (<2 testigos = FAIL; excepción sólo adjudicada en
`calibration`, X-D), `witnessesHeld` como pata del veredicto (un testigo
sin medir tira; correr sin verificar no cuenta), y bypass registrado
aunque no dispare. `propertyKind` gana `data-field` con discriminador
EXPLÍCITO (nunca inferencia por forma del nombre; drills de
no-contaminación bidireccional + rechazo cruzado, X-B). Límite verbatim en
el README (X-E): la sonda prueba que el dato LLEGA Y VARÍA, no que la
geometría resultante sea la correcta — la bondad del layout es aceptación
sighted.

**Puerta estática: medida y NO receiptada** (patrón bithire, artifact
`static-door.STRUCTURALLY-UNREACHABLE.json`): la puerta es inalcanzable en
el render de un vertical de primera parte por DOS mecanismos independientes
verificados (el strip `registry/index.ts:155-162` y el rechazo de plano
`:148-151` "Cannot project a non-code-owned tenant config"); viva como
código, alcanzable por config de caller (tenant-preview). Receiptarla
habría medido un camino que producción no toma (la clase de error que H-1
corrigió, sin canal CSS que la delatara).

**Escenarios (3 verticales × 3 stops, 3 receipts R6):** S1 — el campo
lowerea el stop pedido (3 valores distintos) con restore exacto a
`undefined` (0 filas diferentes); S2 — `resolveActiveResponsivePosture`
sobre el artifact real resuelve el pedido (default medido `balanced`);
S3 — 3 `spanBias` → 3 geometrías a misma entrada; predicción falsable
EXACTA: banda 200px invariante, onset ±120px (compact 759/959/`min`,
balanced 639/839/`preferred`, expansive 519/719/`max`); negativo del tier
con las DOS mitades (board constante Y escalera demostrablemente viva a
los mismos anchos); bypass con las dos capas asertadas por separado.
Igualdad-excepto-campo sobre la superficie CERRADA de 4 campos de
`.advanced`: 9 filas, hermanos idénticos.

**Censo (X-A, medido en disco):** 255/255 celdas `NO_CSS_CHANNEL` (251
`DIFFERENTIAL_COMPILE_AND_COMPUTED_FAMILY_BINDING` + 4 layout
`PROVE_NOT_CHANGE` en SOURCE_BOUND); el packet cierra UNA
(`pattern/data/widget-board`, consumidora directa de `spanBias`); **254
intactas**. `measuredResult` declara: una familia medida, tres
consumidoras conocidas sin medir.

**Brecha de la ley del owner (registrada, no inventada):**
`knownDefects OPEN_OWNER` — la simplificación móvil real de
DashboardSurface la gobierna una señal `isMobile` de viewport
(`dashboard/index.tsx:194,206`), no este control; el tier de WidgetBoard
está hardcodeado a 639/839 con fijación razonada en fuente (CSS-co-authored,
`:133-146`); la válvula hide/defer del solver sólo mira items `secondary` y
todos los contratos del dashboard son `priority:'primary'` (`:286`) — el
dial no alcanza ningún trigger de simplificación. El packet certifica el
control que EXISTE (`spanBias` + bucket).

**LADDER_VOCABULARY (OPEN_DT → packet L-1 aprobado):** la escalera exige 5
campos de forma CSS (`rules:937,946,994+426-430`) y un terminal DATA no
tiene ninguno por diseño; la única forma de forzar rango era fabricarlos —
**no se fabricaron**. El roadmap F4B §7 ya declara que un control con
terminal DATA "demuestran ese terminal y no inventan una variable para
cumplir": la ley superior sí contempla DATA; `manifest/rules` no. Ruling
DT: **enmendar la ley UNA sola vez** (rol `data-field-delta` + rama DATA:
`fieldPath` + `equalitySurface` + testigos conductuales), packet propio
con preaudit Fable. Segundo cliente del mismo packet (Fable F1): el drill
5 de H-2 quedó rojo (**ingress 55/56**, no 56/56 — ningún packet
intermedio puede citar 56/56) porque itera controles-con-receipts y el
guard CSS se niega a un terminal DATA; el fix lo excluye con razón escrita
o lo deriva al guard DATA. Regla de proceso adoptada (obligación Fable):
un packet que toque evidencia o manifests de un control corre TAMBIÉN las
suites del instrumento cuyo cerco itera desde el manifest. Precisión (F2):
`calibration.assessmentState` del MANIFEST DE CONTROL no lo valida ninguna
puerta (el de las SECCIONES de familia sí lo valida `rules:1071-1082,1112`)
— el rango se reclama sólo cuando la puerta lo sostiene.

**Gates:** 33/33 receipts VALID+FRESH (30 re-emitidos con superficie +1
`composition/data-run` — `nothing_dropped` verificado — + 3 R6 nuevos);
`CONSTITUTION_READY` (corridas propias del DT y de Fable); data-run drills
15/15; ingress drills **55/56** (causa asentada arriba); `tsc --noEmit`
limpio. Desviaciones del writer, TODAS aceptadas por Fable: export de
`dbTenantIdentity` (una definición, dos llamadores — la clase W-C),
`witnessesHeld`, bypass registrado, `manifestSourceFiles` en la frescura
DATA (probada en vivo), superficie +1.

**Postaudit Fable: ACCEPT**, memo
`/private/tmp/f4b-6-data-probe-fable-postaudit.md` (SHA en su `.ready`) —
con la corrección de su propio preaudit asentada (su Q4 asumía un cierre
COMPUTED_VERIFIED inexistente para un terminal DATA: density llegó a rango
3 porque PINTA; la diferencia es de vocabulario, no de evidencia).

##### L-1 — la escalera aprende terminales DATA (enmienda de ley, 2026-08-23)

`LADDER_VOCABULARY/data-terminal-controls` **CERRADO por enmienda de ley
UNA vez** (el mecanismo del precedente cabeza-nula, segunda aplicación).
`responsive.posture` queda **COMPUTED_VERIFIED honesto: F4B 6/20** (la
puerta sighted es el único paso restante de ese control). Writer: Opus.
Preaudit Fable: ACCEPT Y-1…Y-5. Postaudit Fable: **ACCEPT**, memo
`/private/tmp/l1-ladder-fable-postaudit.md` (SHA en su `.ready`), con
harness Y-1 reconstruido independientemente por el auditor y coincidente
al error exacto.

**La enmienda (bloques A–G en `manifest/rules/` + mirror en
`schema.json`):** rol `data-field-delta` en **clase propia** (una celda
CSS no puede comprar su pata de delta con un receipt sin browser);
selector **derivado de la raíz de cascada** (`channel: null` bajo la
conjunción head-empty — la única autoridad gateada; selecciona 1/20 hoy y
deja fuera a `profiles.icon`/`chrome.anatomy`, que PINTAN); **diente
inverso** (declarar `dataTerminal` con raíz de cabeza no nula es error);
conjunción IMPLEMENTED completa: `terminalReason` (el diente, hermano de
`headEmptyReason`), `fieldPath`, `equalitySurface` **que contiene el
campo** (duro: una superficie que lo excluye vuelve indemostrable la
igualdad-excepto-el-campo), `behaviouralWitnesses`, `mechanism` intacto,
**anti-fabricación** (`internalChannels`/`computedProperties` vacíos —
prohibido comprar el verde); CV rama DATA con restore por la **cadena
mecánica** (verdict.pass solo si restore.exact; exitCode espejo;
v2:139-140 rechaza exit≠0), no por reparto de roles; **techo duro de
`assessmentState`** (`validateControlAssessmentCeiling`, espejo de
`validateMaximumClaim` — un control no puede superar el rango que su
mejor celda sostiene; radio medido 1/20 y la única violación la cura la
propia enmienda; probado en vivo con mutación SIGHTED_ACCEPTED → FAIL y
restore byte-exacto). Precisión asentada (Y-4 + F2 anterior): generator
SÍ valida vocabulario y sourceBindings del control; rules valida
assessmentState de secciones de familia; lo que faltaba era el techo.

**Segundo cliente (Fable F1 de F4B-6, cerrado):** drill 5 de H-2 **RUTEA**
(no excluye) con contadores asertados (30 PASS CSS + 6 REFUSED DATA —
ninguna pata verde por vacía); drill 3 ruteado fuera del selector (su
hueco de traspaso silencioso sólo se abría al subir el control);
comentario del catch corregido (Y-2: razón real medida, código muerto
declarado, angostado como opción futura). Ingress drills **56/56** de
vuelta.

**Evidencia:** las 3 sondas R6 **re-CORRIDAS** (nunca re-etiquetadas) con
`--evidence-kind data-field-delta` (default nuevo del CLI, `causal`
intacto); artifacts byte-idénticos (sonda determinista) y receipts con el
kind nuevo emitido por corrida viva; 33/33 VALID+FRESH (30 re-emitidos
por frescura, unión nunca reemplazo, artifacts intactos).

**Invariancia Y-1 (re-medida en el árbol real por el writer Y por Fable
con harness propio independiente, coincidentes):** 5100 celdas graduadas
con ambos módulos, **1 veredicto cambiado** (la celda del terminal: 6
errores bajo la ley vieja, 0 bajo la nueva), **0 fuera del terminal**; el
drill (d) la vuelve aserción permanente.

**Deudas asentadas:** sub-declaración de `profiles.icon` (reach **118**) y
`chrome.anatomy` (reach **353**) — declaran `channels: []` y emiten
cabezas reales; queda **OPEN_DT** con estos números para que nadie la
"resuelva" por el selector equivocado (Y-3). Los 2 rojos preexistentes
(test 1 sandbox CLOSURE_MEMBERS + A11) quedan para packet de triage
aparte que arranca de la caracterización T-1 (Y-5). Suite constitucional:
46/48 idéntica, L-1 no agregó ni quitó ninguno.

**Gates:** generator 42/42; ingress 56/56; data-run 15/15;
CONSTITUTION_READY (corridas propias del DT y de Fable); `tsc --noEmit`
limpio. Desviaciones del writer, TODAS adjudicadas por Fable:
`CLOSED_BY_LAW_AMENDMENT` (descriptivo, campo libre), default condicional
de 2 líneas, drill (b) con 8 aserciones, especificador re-apuntado del
método `git show`, edición+restore del cableado del techo.

##### B-1 — OPCIÓN B del owner implementada: el tenant prevalece sobre el baseline vertical (2026-08-23)

La decisión de producto del owner (`OPEN_ARM_ASYMMETRY` → opción B) queda
implementada como **ley de precedencia vigente**: `override explícito del
tenant > perfil/config del tenant > theme del vertical > defaults del DS`,
sobre toda la superficie pública de customización, con invariantes
técnicos/accesibilidad protegidos, y **static ≡ DB exacto** bajo criterio
ejecutable escrito. `experience.profile` **vuelve a COMPUTED_VERIFIED** y
`OPEN_ARM_ASYMMETRY` **cierra con la ley nueva, no con excepción** —
`CLOSED_BY_B1_FOR_DECIDABLE_SCOPES`. Writer: Opus. Preaudit Fable: ACCEPT
Z-1…Z-6. Postaudit Fable: **ACCEPT**, memo
`/private/tmp/b1-option-b-fable-postaudit.md` (SHA en su `.ready`), con la
verificación conductual central corrida por el propio auditor con el
instrumento real.

**El defecto raíz (medido):** el brazo DB ya implementaba la opción B (el
perfil entra al patch del tenant y se resuelve sobre el baseline,
`tenant-theme/index.ts:1885-1893` + cadena `:1904-1948`); el estático se
salteaba esa ingestion. El fix: **el transporte estático gana la MISMA
ingestión** — `tenantPatch?: Partial<BrandTheme>` (ausente ⇒ identidad,
garantía de API), `mergeBrandThemeFloors` (merge profundo con guarda de
propiedad propia — exigida por el gate de grafo de módulos en el build
completo), `resolveTenantPosture` (`??` = override explícito > perfil del
tenant; **compuerta estructural**: el perfil aporta SSI la selección vino
de ESE patch; la selección del baseline NUNCA promueve — por eso bithire,
que selecciona su propio perfil Y autora los campos, no regresa), y el
assign final **después del último escritor autorado** dominando los pasos
5 y 7 a la vez. **Evolución de forma registrada como decisión** (Fable
obs. 1): diseño (no tocar el lowering) → ruling B2 (compuerta en pasos 5
Y 7) → **forma final (un solo sitio)**, mejor que ambas: una compuerta por
campo habría tenido que enumerar los canales de cada bloque autorado, y
habría perdido exactamente `--ds-letter-spacing-heading`.

**Historia del proceso (Fable: "el proceso funcionando"):** el packet se
bloqueó honestamente al medir — implementar el ítem 1 habría roto la ley
static≡DB (el canal vive en DOS vocabularios con valores distintos:
`headingTracking` del eje vs `headingLs` del pairing — signo opuesto en
technical; el DB emite el pairing, el eje nunca sobrevive en producción).
Rulings DT (`/private/tmp/b1-rulings-dt.md`): **canónico = PAIRING**
(`headingLs`); B3 (la nota `expansion:86-89` que documentaba la
divergencia como intencional) **DEROGADA por orden explícita del owner**,
re-escrita como "REPEALED (owner order, option B)" — el acid test
localizado no requirió cambio (la divergencia vivía en el comentario);
B4 (escritor del paso 3) retirado **por estructura** (`expansion:421`
deriva `typePairing` de `axes.type` incondicionalmente — muerto en todo
caso presente y futuro; `EXPERIENCE_PROFILES` son 2 perfiles, no 34);
criterio B1 = **valores computados sobre la cascada real** (estático =
tema compilado; DB = base del vertical + delta inline del tenant), con
ausentes resueltos por cascada, medido con el brazo pintado — escrito en
el manifest ANTES de medirse (Z-2).

**Medición:** estático MUEVE `--ds-letter-spacing-heading` en los 3
verticales (era 6/6 inerte); static ≡ DB en 22/22 lecturas de canal; 6
casos pintados light `equivalent: true`, 0 filas diferentes, harness-live
en los 6; la escalera completa del owner demostrada en un canal (bithire
`--ds-motion-intensity`: `0.55` vertical → `0.7` perfil tenant → `0.8`
override explícito). Receipts **R7 ×6** (technical→parity,
editorial→restore; digest por vertical — la trampa de F4B-6 reincidente
esquivada; nombres propios `.R7-light.json` junto al registro histórico
pre-H-1, que NO se sobrescribió por orden del manifest). **39/39**
receipts VALID+FRESH (33 re-emitidos por frescura del cambio de
compilador).

**Regresión cero, por tres vías:** 3 artifacts de producción
byte-idénticos (ausencia de patch ⇒ identidad); drill 1 bithire (sin
override: `-0.025em` y `0.55` intactos — el único vertical donde una
compuerta ingenua regresiona, por eso obligatorio Z-3); delta de suites
cero (33/1114 con y sin el cambio, método copia byte-exacta con sha
verificado). mP6 verde con su negativo intacto (Z-6).

**Residuo dark asentado contra `OPEN_VERTICAL_CASCADE_DEFECT`** (packet
propio del generador/cascada vertical — no de este control): causa
verificada (artifact bithire `:644` vs `:1496`, doble declaración con el
bloque dark de mayor especificidad) + **hueco de instrumento apuntado**:
la sonda no aplica `modeBlocks`, así que ese packet probablemente necesita
tocar el instrumento antes de medir su propio arreglo (la lección Z-1
propagada). Progreso medible del brazo pintado: 3 filas de divergencia
antes de B-1, 2 después (la de scope light cerró). El artifact
`bithire-editorial.RESIDUAL-DARK-SCOPE.json` queda medido SIN receipt
(patrón establecido); el receipt inválido fue borrado por el writer.

**Presupuestos de bytes (ruling DT):** 4 techos de entrypoint subidos a
los valores medidos exactos (+1087/+3409/+2813/+1732), con nota escrita y
el precedente A1 — incremento único para el fix del owner; los techos
siguen decrease-only desde el nuevo ancla y ya están condenados a morir en
F6. El gate de grafo de módulos (activado en el build completo, no en el
de medición) se resolvió recortando prosa (+4123→+3923), sin volver a
subir techos.

**Notas para el futuro (Fable obs. 2, asentadas):** los clamps sobre el
ganador quedan cubiertos por drill 4 ejecutable y por el camino
(expansión sanitiza); el override explícito del transporte estático es
first-party/bounded hoy — si algún día acepta input de tenant real, la
validación de rangos del patch merece su propia puerta.

**`motion.dial` queda `UNKNOWN` honesto** (limitación preexistente del
harness: `domain.kind: "scale"`; medido por compilador, no forzado).

##### T-2 — triage: frescura de producers.json + CLOSURE_MEMBERS; tablero 48/48 (2026-08-23)

Los **dos rojos preexistentes de la suite constitucional quedan cerrados**,
cada uno por su causa verdadera. `program-check.test.mjs` pasa de 46/48 a
**48/48 — completamente verde por primera vez en la historia del asiento**
(Fable: "el piso más limpio que este asiento ha auditado"). Writer: Opus.
Postaudit Fable: **ACCEPT**, memo `/private/tmp/t2-triage-fable-postaudit.md`
(SHA en su `.ready`), con análisis multiset independiente del auditor
coincidente al detalle.

1. **A11 (frescura de producers.json):** el inventario commiteado quedó
   stale por la serie F4B (58.195 hojas cambiadas, medición del writer —
   la clasificación es idéntica al diagnóstico Codex de 57.731; el número
   propio se reporta en vez del ajeno). Inspección ANTES de re-derivar:
   **todas menos 492 hojas son POSICIONALES** (deriva de ordinal/línea tras
   B-1 en `brand-theme/index.ts`); `producerSites` bajo (file, symbol,
   ownerId, plane) = multiset EXACTO (cero reclasificaciones);
   `channelEmissions` bajo identidad sin ordinal = multiset EXACTO. Stats
   invariantes byte a byte: unknown=0, openBlocking=0, conflicts=0,
   lotBOpen=true, cohortes 69/627/534/728/66, producerSites 4872,
   channelEmissions 10313, distinctChannels 4585. Cero filas unknown
   nuevas, cero conflictos de ownership (las condiciones de STOP no se
   dieron). Re-derivado por el productor canónico; `--check` OK;
   `cascade-producers.test.mjs` 209/209 (N13 y T-21 verdes — T-21 sólo
   dentro del packet).
2. **Test 1 (sandbox CLOSURE_MEMBERS):** el fix nombrado en T-1 (añadir
   `packages/core/test-artifacts`) resultó necesario pero NO suficiente —
   con los receipts presentes y sus fuentes ausentes, el error sólo cambió
   de forma (56 → 39 → 0). Las 5 entradas finales: `test-artifacts` + los 4
   build outputs nombrados UNO POR UNO (dist/build-stamp.json, server.js,
   brand-theme/index.js, index.js — 67M del árbol entero vs ~140K;
   dependencia legible; guard D-4 intacto). Aislamiento preservado: 48/48.

**Observación de cobertura asentada como OPEN_DT:**
`expressive-profiles/expansion/index.ts:151-155` escribe 5 canales `--ds-*`
gobernados en un literal y el archivo no aparece en NINGUNA lista del
inventario de productores (causa leída: el plano `ts-compilers` se asigna
POR NOMBRE a una lista cerrada, `:93`). ¿Frontera deliberada o hueco de
cobertura? — decisión posterior, con los datos del postaudit Fable §3.

**Estado del tablero tras T-2:** `program-check.test.mjs` 48/48;
`program-check.mjs` CONSTITUTION_READY; receipts 39/39 VALID+FRESH;
`cascade-producers --check` OK. Sin un solo rojo conocido fuera de las
deudas adjudicadas con dueño.

##### F4B-7 — typography.scale: cierre parcial honesto + clase DB_ARM_SCOPE_SHADOWING (2026-08-23)

El control **no cierra** — y esa es la adjudicación, no una falla: la mitad
de autoridad queda probada y commiteada, y el defecto que impide la
equivalencia queda registrado como CLASE con su packet propio (H-3).
Writer: Opus. Postaudit Fable: **ACCEPT**, memo
`/private/tmp/f4b-7-typography-fable-postaudit.md` (SHA en su `.ready`).

**Lo que SÍ cierra:** el fix de autoridad (`capabilities/index.ts:182`,
`'typography (ramp channels)'` → `'typography.scale'`, protocolo
density.mode, repin de 20 manifests). Guard H-2: static **FAIL 0/1 → PASS
1/1** en los 3 verticales (doble medición: el FAIL que Fable midió con
sonda propia en el preaudit H-2, el PASS que midió hoy con la misma
sonda). `--ds-type-scale` = 0.94/1.06 exactos en ambos brazos; T3
`{0.92,1.08}` verificado en fuente dentro de `{0.9,1.1}` sobre el piso
a11y `0.9`; ningún vertical autora el campo; `normal`=1 como ELIDE en DB
(patrón radius, medido); 3 artifacts de producción byte-idénticos (la
línea corrige una puerta que ningún lowering atravesaba).

**La clase nueva, `DB_ARM_SCOPE_SHADOWING` (registrada, no cerrada):** el
artifact del vertical declara canales en el scope
`:where([data-ds-root][data-vertical])`; una declaración en el ancestro
más cercano gana SIEMPRE sobre el valor heredado de un inline en `html` —
el brazo DB de la sonda (que modela la vía PREVIEW/provider-side) no puede
mover ningún canal que el artifact declare en ese scope (medido: 54/11/54
filas divergentes en rottay/bithire/evnto). **La vía productiva NO tiene
este defecto** (ley CLAUDE.md textual: producción compila en servidor y
embebe el artifact exacto con los valores resueltos del tenant; el
provider no emite una capa competidora). Es una limitación del MODELO del
brazo DB para toda la clase de canales que el artifact hornea en ese
scope. Instancia hermana registrada bajo `OPEN_VERTICAL_CASCADE_DEFECT`.
El control queda `UNKNOWN` con `knownDefects` + evidencia +
`nextAction: H3_DB_ARM_PRODUCTION_SERVING`; la celda de card y los 6
receipts R8 correctamente NO emitidos ("nombrarían una evidencia que no
existe").

**Drills 12/43/53 re-adjudicados como `AGED_EXPECTATION`** (sin debilitar):
12 — expectativa nueva sobre la forma B-1 (stop en `tenantPatch`, baseline
en `brandTheme`); 43 — inversión: la UNIFORMIDAD entre verticales ahora
prueba que el piso del tenant ganó (el renombre era obligatorio: dejar un
título que afirmaba divergencia habría sido el defecto D3 de C4 otra vez);
53 — la lección "veredicto POR BRAZO" se preserva por FIXTURE sintético
anti-door MÁS el pin del manifest real pasando 3/3 (mejora del writer
sobre el ruling, aceptada). Suite de ingress: 53/56 → **56/56**.

**Miss de proceso, asentado completo (TRES partes):** los drills 12/43
quedaron rojos desde B-1 y nadie corrió la suite de ingress — ni el writer
en B-1, ni el DT en su verificación, **ni el postaudit de Fable** (que
corrió brand-compiler y db-row-canary pero no la suite del instrumento
pese a su propio binding Z-1). Regla reforzada y vinculante para los tres
asientos: todo packet/postaudit cuyo write-set toque
`src/tooling/resolution-probe/**` corre la suite de ingress y la de
data-run, sin excepción.

**Cola:** H-3 (diseño → preaudit Fable → implementación) — el brazo DB de
la sonda sirve como producción (artifact compilado del tenant), cerrando
la clase para typography.scale y todo control cuyo canal el artifact
declare en el scope `[data-ds-root]` (incluida la lección ya apuntada: la
sonda tampoco aplica `modeBlocks`). Tras H-3, typography.scale re-corre y
emite sus receipts R8.

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
**F4A-1 — diseño del DT ASENTADO (2026-08-20).** Dos documentos:
`/tmp/f4a-1-adjudicaciones-definicionales.md` (las 5 definiciones que F4A-0
probó no-medibles: metadato = LISTA enumerada de 36, denominador de pintura
3.690; asignación = posición autorada EN FUENTE, el roster es output del
esquema no herencia del catálogo; 2 var() fantasma rastreadas no bloqueantes;
asimétricas = 16; tier.page.fg = 42) y `/tmp/f4a-1-esquema.md` (la decisión
central: **la asignación vive en la fuente como tags JSDoc de vocabulario
cerrado** — `@domicile` + `@governor` — que el harness parsea mecánicamente;
ni metadata paralela ni prosa libre; artefacto compilado byte-idéntico, mismo
export, mismo lowering, sin segunda foundation. Los 6 nudos adjudicados: K1
descongelar primary con valor sin cambiar; K2 `--ds-color-border` raíz
canónica del par, evnto invierte, R35 REDERIVED; K3 raíz NUEVA
`--ds-color-text-page` (VER K3-REVISADO abajo — la primera versión,
`--ds-color-text-secondary` #A0A0A5, quedó FALSADA por medición del worker:
ese canal ya existía con otro valor y 262 lectores), los 42 derivan en
F4A-6; K4
las 16 con valor = resolución de hoy; K5 tabla bithire baseline con razón,
no se unifica; 10 por-crear seed, materialización a F2-asimétrico/F4B). En
producción: roster borrador por worker (F4A-1c, ver estado abajo).
**K3-REVISADO (adjudicación DT, 2026-08-20, tarde).** La medición del worker
de roster falsó la premisa original: `--ds-color-text-secondary` YA EXISTE en
las tres fuentes (baja del campo autorado `textSecondaryColor`; rottay
#B0B0B5 base / #6B6B6B light) y lo leen **262 archivos** en `src/`. Derivar
los 42 de él repintaría (base #A0A0A5→#B0B0B5) o repintaría a sus lectores
(al revés): ambas violan cero-delta. Decisión: (1) text-secondary INTACTO —
raíz seed existente gobernada por `textSecondaryColor`, dial tenant en F4B;
(2) la tinta de página se autora como raíz NUEVA **`--ds-color-text-page`**
(nombre sin colisión, verificado por grep en `src/`): rottay #A0A0A5 (48
literales fuente; bithire/evnto tienen CERO ocurrencias de #A0A0A5 — su
posture la mide el roster, no se inventa), domicilio seed, exposición
tenant-dial como cabeza de la cadena de tinta de tiers
(page→base→raised→overlay), materialización REDERIVED en F4A-6; (3)
overlay.fg citaba "la cabeza K3": ese nombre ahora es text-page. Lección de
método asentada: toda "convención medida" se verifica con grep del nombre
exacto ANTES de asentarla. Universo del roster: 66 raíces por tema donde
text-page se autore (total falsable lo declara el roster regenerado).
**Reconciliación de identidad (decisión 13) EJECUTADA — commit
`85d0583b9`.** 16 archivos: AGENTS.md + contratos modern-rescue + v2
(SIGHTED_APPROVER='Kimi K3 (DT)'; la clave `codexSightedApproval` y los enums
`*_PENDING_CODEX_AUDIT` NO se renombran — romperían receipts) +
`manifest/generator/index.test.mjs` (el drill de conflicto producer=approver
ahora usa la constante SIGHTED_APPROVER — tracción con el seat, no nombre
duro; este archivo era un gate que el worker no corrió y yo lo reparé antes
del commit). Succession = cadena de 2 registros unbroken validada por
program-check; fence DT≠auditor como fallo cerrado. Verificado por mí contra
el árbol (no de palabra): CONSTITUTION_READY, 41/41 + 36/36 + drills 133/133,
gates:ci **87 blocking PASS** + 2 excluded re-adjudicados.
**F4A-3b ✅ (re-ejecutado sobre el harness arreglado; worker Opus; verificado
por el DT contra el árbol).** Canon de comentarios aplicado, **byte-idéntico
probado ida y vuelta** (revert→build→idéntico→re-aplicar→idéntico): **45
docblocks narrativos fuera, 114 del kit adentro, 37 tags** (32 seed + 5
pro-expert — son 5 y no 6 porque evnto no tiene `const MOTION`, el hallazgo de
F4A-2 otra vez consistente; **0 baseline, 0 @placeholder, 0 en el esqueleto**).
**`untaggedAuthoredLeaves` 3686→3029** (baseline bajado por el DT en este
commit, verificado contra el artefacto regenerado); `divergentSlots` **2268
clavado** (los tags no son posiciones; los placeholders de F4A-4 sí);
matriz 2613/345 y sourceSkeleton 1820/1503/397 intactos. Banners ya
canónicos (0 trabajo); orden alfabético NO-OP medido (0 consts movidos). La
excepción única de §3: `rottay CHROME.statsGrid` (`token-overrides` no es dial
de rottay en el roster) → nota de clase, adjudicación pendiente del DT. La
cadena arrastró `fanout-facts.json` (**990 citas file:line movidas por los
comentarios, CERO medición movida** — exactamente lo que un cambio de
comentarios debe producir; el worker lo regeneró y lo reportó en vez de
esconderlo, correcto). mirror-parity: **solo provenance**. docs-engineering:
**vacío** (`tokens:catalog:write` sin un solo diff — ningún valor ni conteo de
lectura cambió). Suite: el worker midió 1711/15 con las **2 forcing functions
diseñadas** (el pin del baseline + el test de F4A-2 que pineaba
`tagRegistry.count === 0`); ambas las resolví YO en este commit: (1) baseline
bajado 3686→3029; (2) ese test reescrito como **AGED_EXPECTATION** (ahora
valida vocabulario cerrado + failures vacíos sobre los 37 tags reales) → suite
de vuelta en **1711/13**. gat-07 **re-sellado por el DT**: digest
`fec98f592242…` (src/ cambió: comentarios entran al digest). Leyes: los 45
docblocks leídos uno por uno, **28 con ley real** → verbatim re-domiciliado en
`docs/f4a/leyes-fuentes-themes.md` (lo escribí yo, del verbatim del worker; la
referencia tema:línea es pre-edición; incluye la memoria de tranches
ROTTAY-T2/MASS-C3/EVNTO-TERMINAL-2/T1/K0.6 que F2 citaba).
**Lote drill→tmpdir ✅ `003b8f7ba` (worker Sonnet, verificado por el DT contra
el árbol).** La 14ª falla de la suite (carrera ENOENT del drill de
cascade-ratchet plantando en `src/`) queda erradicada: el walker compartido
(`lib/engine/skin-files`) gana una costura de raíz con default inerte (los
otros 2 consumidores intactos, 391 archivos igual) y el drill planta en
sandbox tmpdir — dientes probados por el worker en las dos direcciones (sin
planta no hay hallazgo; planta-no-vista tampoco) y gate verde con las cifras
del baseline (2171/4374/391). Suite: **1711/13 ×2 corridas idénticas por
nombre (worker) + mi propia corrida de la pierna 1 (1711/13, 0 ENOENT)** — la
baseline de suite queda **1711/13** (los +6 tests de F4A-2b). gates:ci: **88
blocking + 2 excluded verdes** en este commit. Deuda anotada (no tocada, con
su razón): `cra-12-motion-governance.reanchor.test.mjs:50` tiene la misma
forma de inyección-en-árbol-real PERO su comentario la justifica (el digest
auditado puede depender del árbol completo) — análisis propio cuando se
manifieste; hoy no es roja.
**F4A-13 ✅ (worker Opus; parada 19/19 correcta con DOS premisas falsas mías
medidas contra el árbol, adjudicadas y re-despachadas; verificado por el DT) —
capacidades + forma + residuos. EL FRENTE QUEDA CERRADO SALVO `CHROME.table`
(K5/F4A-15).** Mis premisas falsas, medidas por el worker: (a) mis 8 familias
contenían 67 de las 181 — el resto era **TYPOGRAPHY base huérfana (48)** (el
diseño de lotes la asignó a F4A-6, que hizo el nudo K3, no la familia), el
**esqueleto THEME.\* (26)** (taggeable desde mi fix de F4A-8 — el worker
verificó la línea 225) y **table (40)**, excluida por mi propio brief; (b) 28
de los 67 (CHARTS + CHROME.accent) no encajaban en ninguna de mis 3 categorías
sin inventar un ancla falsa (vocabulario de forma que no baja a canal y sin
capability que lo gobierne — `expressive` solo activa en bithire, medido).
**Adjudicaciones MÍAS**: CAPABILITIES.\* (24) `pro-expert` anclado a SU PROPIA
capability con el estado autorado medido (la hoja ES la declaración — verdadero
en los 3 temas); CHARTS+accent (28) `unassigned` + governor con la razón medida
(vocabulario de forma consumido como argumento; disposición final F4A-close) —
NO se inventó clase nueva; TYPOGRAPHY (48) kit estándar; THEME.\* (26)
`unassigned` + "el esqueleto cablea los planos, no autora pintura" (la ley
F4A-3b por hoja); table intacta para K5. **141 tags + 20 placeholders = 161
docblocks**; `untaggedAuthoredLeaves` 181→**40** (exactamente las de table — mi
predicción, clavada), `divergentSlots` 39→**33** con la nota medida escrita en
el test: el contador NO llega a 0 por esta vía (los 33 restantes son slots que
NINGÚN tema autora — un placeholder no puede darles posición; **el 0 real lo
certifica el gate `realKeypathParity` de F4A-close**, adjudicación A4), espejo
positionIntersection 2520→**2526**, universo 2559 e intersección 342 clavados,
tagRegistry 3938→**4099**. **Dos bugs del worker atrapados por sus propias
verificaciones** (índice sin normalizar `BrandTheme$ → THEME` como el parser;
prefijo de placeholder trepando por encima de la familia → el guard de
@placeholder contradictorio del harness lo rechazó con 4 failures — restauró a
HEAD y acotó: el instrumento hizo su trabajo). Byte-identidad ×3 builds reales.
Cadena completa verde; digest reconciliation `1ec7b2797c05` (NOVENA vez
huérfano). Batería ×2: rosters 1304/1304 enteros, mirror 44/44, variant 34/34
tras la Baja, root-exposure 13/13, pierna 1 MÍA **1717/13** por nombre (par
export-* pair-aware). gat-07 re-sellado por el DT: `8dc47e9bc302…`. gates:ci
**88+2 verdes**. **Siguiente lote: F4A-14 = K4** (las 16 asimétricas con valor
= resolución computada de hoy) y después **F4A-15 = K5** (tabla bithire =
baseline con razón, NO se unifica; cierra las 40 hojas de CHROME.table).
**F4A-12 ✅ (worker Opus; verificado por el DT contra el árbol) — el barrido
de las CHROME chicas (47 pares familia×tema, el lote más ancho).** **527 tags
+ 209 placeholders = 736 docblocks** cubriendo las 533 hojas pendientes (565
totales menos 32 ya taggeadas por K1/F4A-6/9/10/11, respetadas) y **845
ausencias** reconciliadas una por una (todas piso — medido por placeholder;
cero overlay/preset). Cero colapsos a padre: ninguna de las 36 familias usa la
forma multi-clave (medido). **Ciclo de vida: 15 de 15 retirados** (rottay
surface/premiumCard/backTop/liveFeed/skeleton/spinner + bithire
filterPill/badge/premiumCard/surface/signalCard/listingGrid/detail + evnto
premiumCard/cardComponent — todas enteras, medido familia por familia);
**queda UNO: `rottay table` (1/18 cubierta — va con K5 en F4A-15)**.
**Corrección del worker a mi brief, aceptada**: `statsGrid` NO tenía tag de
sección que retener (era una de las 6 parciales sin tag) — sus 13 hojas
llevaron la **nota de clase** en el governor (`token-overrides no es dial de
rottay en el roster — adjudicación pendiente en F4A-close`) y nada quedó
retenido. **La aritmética honesta otra vez**: `untaggedAuthoredLeaves`
499→**181** (−318, no −324: los 6 de diferencia son los booleanos de forma
`CHROME.card.hoverTint`/`showBorder` ×3 temas en METADATA_EXCLUSION — nunca
contaron en el denominador de pintura; tras el lote quedan **0** hojas sin
cubrir en las 36 familias). `divergentSlots` 172→**39** (−133, espejo con
positionIntersection 2387→**2520** — sexta vez la misma ley; la superficie de
ausencia parcial casi agotada), universo **2559** e intersección **342**
clavados, tagRegistry 3217→**3938** (+721 = 527+209−15). **Baja #12 del
baseline, bajada por MÍ.** Byte-identidad ×3 builds reales. **Aviso §8 del
worker adjudicado por el DT**: el cierre del frente faltaba por 6226 B en
`runtime/tenant` → **7 techos con 1,5× de aire** (tenant 1050000→**1100000**,
column-menu 2550000→**2600000**, toast 1750000→**1800000**, presence
1800000→**1850000**, motion 1700000→**1750000**, tag/badge 1600000→**1650000**)
— proyección 39285 B para las 181 hojas restantes a 217 B/hoja medidos; los
subpath mueren en F6. Cadena completa verde; digest reconciliation
`8b566000cfaf` (OCTAVA vez huérfano). Batería ×2: rosters 1304/1304 enteros,
mirror 44/44, variant 34/34 tras la Baja, root-exposure 13/13, pierna 1 MÍA
**1717/13** por nombre (par export-* pair-aware). gat-07 re-sellado por el DT:
`363f99b7a859…`. gates:ci **88+2 verdes**. **Siguiente lote: F4A-13**
(capacidades + forma + residuos: MOTION/RECIPES/EXPRESSIVE/CAPABILITIES/CHARTS/
accent/toolbar/OVERLAY.typography — las 181 hojas restantes).
**F4A-11 ✅ (worker Opus; verificado por el DT contra el árbol) —
navegación/estructura (14 familias chrome chicas y heterogéneas).** **337 tags
+ 171 placeholders = 508 docblocks** cubriendo las 337 hojas pendientes (345
hojas totales menos 8 ya taggeadas por K1/F4A-6, respetadas) — **cero
agrupaciones: ningún subárbol resultó uniforme, medido, así que cada hoja
pendiente recibió su tag propio** — y 339 ausencias reconciliadas (todas piso,
medido por placeholder; cero preset/overlay). **Ciclo de vida: 9 de 9
gap-medido retirados** (rottay popover/modal/tabs/drawer/dropdown/notification
+ bithire shell/modal/tabs) al quedar sus familias ENTERAS hoja por hoja; los
16 restantes intactos (verificado por mí: 7/7/2); `statsGrid` no tocada (es de
F4A-12 con su excepción). **La lectura honesta del contador, medida por el
worker en vez de supuesta:** `untaggedAuthoredLeaves` baja **−64** (563→**499**)
y no −337: solo 64 de las 345 hojas estaban SIN CUBRIR en HEAD (36/19/9); las
otras 281 ya estaban cubiertas por los tags de familia que este lote retira —
el frente cambia DE QUÉ están cubiertas (de afirmación no probada a tag de hoja
medido), que no se ve en el contador. `divergentSlots` 271→**172** (−99, espejo
con positionIntersection 2288→**2387** — quinta vez la misma ley; el worker
anotó que la superficie se agota), universo **2559** e intersección **342**
clavados, tagRegistry 2718→**3217** (+499 = 337+171−9). **Baja #11 del
baseline, bajada por MÍ.** Byte-identidad ×3 builds reales. Cadena completa
verde; digest reconciliation `10d253c69a57` (SÉPTIMA vez huérfano). Batería ×2:
rosters 1304/1304 enteros sin moverse, mirror 44/44, variant 34/34 tras la
Baja, root-exposure 13/13, pierna 1 MÍA **1717/13** por nombre. gat-07
re-sellado por el DT: `2454accb7c20…`. gates:ci **88+2 verdes**. **Siguiente
lote: F4A-12** (barrido de TODAS las CHROME chicas restantes — tarjetas/datos
sin table; el lote más ancho en familias; si el worker proyecta demasiado, se
parte 12a/12b — decisión del DT al despachar).
**F4A-10 ✅ (worker Opus; parada 18/18 correcta y adjudicada; verificado por el
DT contra el árbol) — OVERLAY.chrome SOLA, el lote más grande del frente.**
**636 tags + 436 placeholders = 1072 docblocks** cubriendo las 831 hojas
reales (premisa corregida por el worker y verificada: **507/293/31**, no
571/293/34 del mapa — los 64+3 colapsados por K1/F4A-6/K2 trazan a
adjudicaciones nombradas; `solo-arbol` = 0 en los 3, no apareció ninguna hoja)
y **1299 ausencias** reconciliadas una por una (117 con contraparte en el
CHROME base / 319 piso / 0 preset — medido, no asumido). Cero tags sin línea
resuelta (esta familia no tiene la forma multi-clave de F4A-9 — medido).
**Ciclo de vida confirmado: 0 gap-medido dentro de `const OVERLAY`** (los 25
restantes viven en el CHROME base y se retiran en F4A-11/12). **Parada 18/18:
techo de bytes otra vez** — exceso de 3174 B en `collection-workspace`; mi
subida de 4 techos en F4A-9 promovió a los siguientes. **Adjudicación MÍA de
una vez: los 17 techos dimensionados para el FRENTE COMPLETO** (proyección
325017 B para las 1394 hojas restantes a 233 B/hoja medidos en este lote +
25% de aire; la tasa sube porque el renglón caro son los placeholders y crecen
con la disparidad de la familia — proyectar con la tasa vieja habría repetido
el error). Verifiqué los 17 techos viejos contra el manifiesto: 17/17. Con
eso **el frente restante YA ENTRA**: holgura medida +87557 B para F4A-11..15
(margen mínimo 218823 en runtime/tenant). **Contadores medidos y verificados
por mí contra el artefacto:** `untaggedAuthoredLeaves` 1394→**563** (−831
exacto = 507+293+31), `divergentSlots` 958→**271** (−687, espejo con
positionIntersection 1601→**2288**, re-anclado medido por el worker — cuarta
vez la misma ley), universo **2559** e intersección autorada **342**
clavados, tagRegistry 1646→**2718** (+1072). **Baja #10 del baseline, bajada
por MÍ.** Byte-identidad ×3 builds reales. Cadena completa verde; digest
reconciliation `cee2453dc5f0` (SEXTA vez huérfano — la automatización es deuda
escrita de F4A-close). Batería ×2 (worker + DT): rosters 1304/1304 enteros sin
moverse, mirror 44/44, variant 34/34 tras la Baja, root-exposure 13/13, pierna
1 MÍA **1717/13** por nombre (par export-* pair-aware). gat-07 re-sellado por
el DT: `b15a9a2ab6c1…`. gates:ci **88+2 verdes**. **Siguiente lote: F4A-11**
(navegación/estructura — 14 familias chicas de afinidad chrome; ahí se retiran
los primeros tags gap-medido del CHROME base al quedar probadas hoja por hoja).
**F4A-9 ✅ (worker Opus; verificado por el DT contra el árbol) — CHROME.controls
SOLA (la 2ª familia más grande; el lote más grande del frente).** **584 tags +
295 placeholders = 879 docblocks** cubriendo las 772 hojas pendientes (384
rottay + 295 bithire + 93 evnto; las 18 ya taggeadas por K1/F4A-6 respetadas —
doble docblock = alcance ambiguo) y 550 ausencias reconciliadas una por una
(piso 294 / contraparte 1; el spread de preset NO aplica en chrome — medido, no
asumido). **La trampa de forma a escala, resuelta honesta**: 85 hojas apiñadas
en línea compartida (los controles de botón) — 10 padres de clase única con el
tag exacto + **5 padres de governor mixto con el desglose medido en una línea**
(`mixta medida en linea compartida: N por X; M por Y — …`), cero reformateo; si
hubiera habido DOMICILIOS mixtos en una línea habría parado (el domicilio es de
valor único) — no fue el caso, medido. **Contadores medidos y verificados por
mí contra el artefacto:** `untaggedAuthoredLeaves` 2166→**1394** (−772 exacto),
`divergentSlots` 1414→**958** (−456, espejo con positionIntersection
1145→**1601**, re-anclado medido por el worker — tercera vez la misma ley),
universo **2559** e intersección autorada **342** clavados, tagRegistry
767→**1646** (+879). **Baja #9 del baseline, bajada por MÍ.** Byte-identidad
×3 builds reales (hash conjunto idéntico en ida y vuelta, con verificación de
QUE los 7 pasos corrieron — la lección de su propio casi-falso-verde de F4A-7).
Cadena completa verde; digest reconciliation `9ca6aa1bcb50` (QUINTA vez
huérfano — la automatización ya es deuda escrita de F4A-close). **Aviso del
worker (§8) adjudicado por el DT DE UNA VEZ**: la proyección del resto del
frente es ~271 KB (1394 hojas × 194 B medidos en este lote — la tasa subió
porque controls tiene mucha superficie de ausencia parcial) → techos subidos
con aire para que F4A-10 no arranque parada: `primitives/tag`
1350000→**1550000**, `badge` 1350000→**1550000**, `skeleton`
1450000→**1650000**, `typography` 1450000→**1650000** (bytes de hoy verificados
por mí contra el gate: 4/4 exactos; `_note` fechada; los subpath mueren en F6).
Batería ×2 (worker + DT): rosters 1304/1304 enteros sin moverse, mirror 44/44,
variant 34/34 tras la Baja, root-exposure 13/13, pierna 1 MÍA **1717/13** por
nombre (par export-* pair-aware). gat-07 re-sellado por el DT:
`dcb640f08086…`. gates:ci **88+2 verdes**. **Siguiente lote: F4A-10**
(OVERLAY.chrome, la familia más grande — SOLA; los techos ya tienen aire).
**F4A-8 ✅ (worker Opus + cierre con DOS ediciones del DT; verificado por el DT
contra el árbol).** Tags por hoja de **SURFACES + THEME**: **96 tags** por
subárbol uniforme maximal (rottay 20/30, bithire 75/94, evnto 1/2) + **59
placeholders cubriendo 189 ausencias** con TRES mecanismos medidos (19 evnto
aportadas por el preset congelado `EVNTO_CANONICAL_SURFACES` via spread —
escribirles "lo resuelve el piso" habría sido FALSO; precedente: el placeholder
de MOTION ya usa esa fórmula). **Desviación de premisa medida y aceptada:**
evnto SURFACES autora **2 hojas, no 21** (el mapa cuenta evaluado, el léxico
autorado — la ley de las dos unidades otra vez). Trampa de forma atrapada por
la verificación previa del worker: `gradients` en una línea colapsó a UN tag
con la división medida declarada (cero reformateo — el lote es solo
comentarios). **Parada 17/17 correcta y luego AUTO-CORREGIDA por el worker:**
su "adaptive-overlay al ras" era falso positivo de método (tamaño ≠ alcance —
ese entrypoint no toca las fuentes de tema; medido con gate antes/después:
18 entrypoints crecen +24849, adaptive-overlay clavado). **Adjudicación MÍA
que queda en pie**: los techos se subieron para el FRENTE (proyección 264 KB
restante: divider/typography/badge/tag/card/presence/skeleton/motion/toast
reventaban en uno o dos lotes) — **13 techos se quedan;
`./patterns/adaptive-overlay` se REVIRTIÓ a 338697** (nunca alcanza estas
fuentes: ruido de gobierno que se limpia solo). **Fix del parser MÍO, en dos actos** (instrumento gobernado = pieza
del DT): (1) `pathIndex` exigía `^const` y el esqueleto es `export const
…BrandTheme = {` → ninguna hoja THEME.* podía recibir tag; (2) con la raíz
abierta, la coherencia F4A-2b detectó la ruta fantasma `THEME.surfaces` en
evnto (`surfaces: { ...EVNTO_CANONICAL_SURFACES, ...SURFACES }`) — segunda
edición MÍA: la composición por spread inline CABLEA, no autora, y ya no anota
ruta (la llave sigue contando para el nivel; `malas` medidas: 0 en los 3).
Radio cero medido por el worker (contadores idénticos), por mí (ningún drill
usa `export const` en fixtures — grep), y por la coherencia misma. Con el fix, los 3 tags
`THEME.appearance.defaultMode` entraron (kit estándar; adjudicación MÍA: NO es
metadato inerte — selecciona el bloque emitido; METADATA_EXCLUSION lo
escondería del denominador de pintura y eso sí sería falso).
**Contadores medidos y verificados por mí:** `untaggedAuthoredLeaves`
2295→**2166** (−126 SURFACES exactas − 3 THEME tras el fix), `divergentSlots`
1519→**1414** (−105, espejo con positionIntersection 1040→**1145**, re-anclado
medido por el worker), universo **2559** e intersección **342** clavados,
tagRegistry 609→**767** (+155 del worker + 3 míos). **Baja #8 del baseline,
bajada por MÍ.** Byte-identidad probada ×3 builds reales por el worker + 1 mío
tras mis ediciones. Cadena completa verde; digest reconciliation
`75835e120733` (CUARTA vez huérfano — la automatización queda escrita como
deuda de F4A-close). Batería: rosters 1304/1304 enteros sin moverse, mirror
44/44, root-exposure 13/13, pierna 1 MÍA **1717/13 por nombre** (par export-*
pair-aware). gat-07 re-sellado por el DT: `bb6b0bb1cf88…`. gates:ci **88+2 verdes**.
**Siguiente lote: F4A-9** (CHROME.controls, la 2ª más grande — SOLA).
**F4A-7 ✅ (worker Opus; parada 16/16 correcta y adjudicada; verificado por el
DT contra el árbol).** Tags por hoja de **OVERLAY.palette + OVERLAY.surfaces**
en los 3 temas: **240 docblocks** (por subárbol uniforme maximal, NUNCA a
nivel familia — el tag sobre `OVERLAY.palette.ramps` cubre 80 hojas y es
falsable: las 80 medidas literales y con `control: null`; no es la herencia
que F4A-3c retiró) + **90 placeholders de hoja cubriendo 272 ausencias** con
la razón MEDIDA por mecanismo (14 con contraparte en el plano base / 76 sin
contraparte en ningún plano — escribir una sola razón habría mentido en 76).
Clasificación hoja por hoja MEDIDA (var/color-mix → derived con raíz real;
atribuido en el mapa → seed + dial; sin atribución → seed + `dial en F4B (sin
control atribuido)`, la fórmula del roster). Las 2 `textPageColor` ya tenían
tag de K3 — excluidas (doble docblock = alcance ambiguo). **Ciclo de vida de
los tags "gap medido" estrenado**: `rottay OVERLAY.surfaces` (15/15) y `evnto
OVERLAY.palette` (104/104) quedaron probadas hoja por hoja y sus tags de
sección de F4A-3c se RETIRARON (los otros 25 intactos hasta su lote).
Corrección de premisa del worker verificada: rottay OVERLAY.palette mide
**159** (no 160 del mapa histórico: −borderPrimaryColor K2, −linkHoverColor
K1, +textPageColor K3 — cada delta traza a una adjudicación nombrada). Trampa
de vocabulario asentada: el mapa nombra `modes.light.palette.*` y el léxico
`OVERLAY.palette.*` — intersección literal CERO, se cruza por cola de ruta.
**Contadores medidos y verificados por mí contra el artefacto:**
`untaggedAuthoredLeaves` 2655→**2295** (−360 = 158+121+80+1; las 2 familias
con tag de sección no bajan dos veces), `divergentSlots` 1669→**1519** (−150
por los 90 placeholders; `positionIntersection` 890→**1040** espejo exacto,
re-anclado medido por el worker con la razón escrita en el test), universo
**2559** e intersección autorada **342** CLAVADOS (el lote no agrega hojas),
tagRegistry 281→**609** (+328 = 240 tags − 2 retirados + 90 placeholders).
**Baja #7 del baseline, bajada por MÍ.** **Parada 16/16: techo de bytes** —
las 3 fuentes +48642 B por 330 docblocks reventaron `./runtime/provider`
(+37231) y `./patterns/charts` (+6530) y `prebuild` cortaba antes de `tsc`
(build que nunca corría = byte-identidad NO probada; el worker casi come un
falso verde y lo detectó revisando QUÉ pasos corrieron, no el resultado).
**Adjudicación MÍA: (A) sola** — techos subidos con aire de una vez
(provider 1350925→**1900000**, charts 1821262→**2350000**, `_note` fechada:
el frente proyecta ~medio MB de comentarios en 8…15; los subpath mueren en
F6); (B) descartada (no resolvía provider y re-introducía tags de familia).
Byte-identidad probada con TRES builds reales (ida y vuelta). Cadena completa
verde; digest de reconciliation re-anclado a `5524ba2086ff` (TERCERA vez
huérfano tras un lote de fuentes — candidato a automatizarse, anotado);
reads-ledger 2607/2607; root-catalog 64 OK; root-exposure 26/28/10 OK.
Batería: rosters 1304/1304 ENTEROS (sin moverse: cero valores), mirror 44/44,
root-exposure 13/13, pierna 1 MÍA **1717/13 por nombre** (diff vacío contra
las 13 conocidas). gat-07 re-sellado por el DT: `bfa9b8724a27…`. gates:ci:
**88 blocking + 2 excluded verdes**. Lección operativa del DT asentada en el
prompt §2: verificar input VACÍO antes de pegar briefs (dos contaminaciones
de residuo, una con alcance falso — aclarada al instante). **La deuda cra-12
SE MANIFESTÓ (estaba anotada "análisis propio cuando se manifieste"):
`cra-12-motion-governance.reanchor.test.mjs` planta
`src/foundation/tokens/css/__cra12-reanchor-drill.css` en el árbol REAL durante
la suite, y `deriveHookManifest` lee ese árbol — si la derivación de uno de
los dos drills export-* cae dentro de la ventana de la planta, le llega
MANIFEST_STALE de regalo y el test queda rojo.** Prueba de raza y no de lote:
la derivación es determinista y coincide con el disco en árbol quieto (medido
por mí), y la pierna 1 DEL WORKER sobre el mismo árbol dio el resultado viejo.
Efecto: el par export-missing/export-unshipped es UN slot rojo decidido por la
carrera (estable como export-missing desde F4A-5; rotó a export-unshipped en
mi corrida post-F4A-7 por los timings nuevos). Las 13 conocidas quedan 13 con
el par como slot único (baseline de nombres pair-aware). **Deuda para
F4A-close (test-hygiene): aislar la planta del read-set del manifest**
(exclusión `__cra12-*` o scope fuera de styleRoots — decisión de implementación
de ese momento). gates:ci no se afecta: el GATE no planta nada; la carrera vive
solo en la suite concurrente. **Siguiente lote: F4A-8** (SURFACES + THEME,
mismo molde).
**F4A-3c ✅ (worker Opus; verificado por el DT contra el árbol) — el paquete
corrector post-auditoría Codex.** (a) **Los 27 docblocks de familia quedaron
ESTRECHADOS**: `@domicile unassigned` + `@governor gap medido: gobierno
parcial — <control> alcanza N de N+M canales de la familia (M sin control;
mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja
aterriza en su lote F4A-7…15`. Censo verificado por mí: 14/10/3 = 27
escritos, 0 tags `seed`+`dial:` a nivel sección restantes; los tags de HOJA
(que citan la raíz del recableo — la prueba misma) intactos (resta exacta
22→8 / 17→7 / 10→7). **Desviación deliberada del worker a mi plantilla,
ACEPTADA**: mi "N de M" era aritméticamente "N alcanzados / M sin control"
(total = N+M); escribir "1 de 37" para tabs habría plantado una falsedad
(total real 38) en el lote que existe para retirar falsedades — escribió el
total verdadero conservando mis dos números medidos, y lo reportó con la
prueba (skeleton 2/1 y shell 22/21 tienen N>M, imposible bajo mi letra).
(b) **Mapa republicado con criterio estricto declarado**: `strictClass` en
las 115 familias + regla escrita en `method` + conteos `{limpia-estricta: 0,
gobierno-parcial: 33, mixta: 29, sin-control: 53}`; la medición histórica
quedó BYTE-IDÉNTICA (probado por mí: deepEqual true sin las columnas nuevas);
el .md conserva la lectura débil anotada como superada. (c) Métricas
CLAVADAS como mandó el diseño: divergentSlots 1669, untaggedAuthoredLeaves
2655, tagRegistry 281 — el corrimiento de domicilios ocurrió conservando el
total (seed 54→27, unassigned 152→179). (d) **Byte-identidad probada**: build
exit 0 y los 4 árboles compilados vacíos en git status; mirror-parity.json se
regeneró SOLO por huellas de fuente (6 diffs de provenance, cero métricas —
las líneas ni se movieron). Techo de bytes 423167/900000. Batería verde en
DOS corridas independientes (worker + DT): rosters 1304/1304 ENTEROS (ley del
erratum), mirror-parity 44/44, variant-parity 34/34, root-exposure 13/13,
pierna 1 mía 1717/13 por nombre. gat-07 re-sellado por el DT: `1c42b078f711…`
(invariante al censo — no digiere esos contadores; verificado con doble corrida
determinista).
**Lección de cadena, segunda captura** (primera: F4A-6): el censo censa
FUENTES y los comentarios cuentan — los 27 docblocks dejaron
`customization-surface-report.json` stale y el pin `positive: the full check
passes on the real tree` lo marcó en MI pierna 1 (la prueba de byte-identidad
del worker cubrió los árboles COMPILADOS; el censo de fuentes es otro eje).
Re-corrí la cadena completa yo (cifras clavadas: universo 7303, dead 266,
catalog 341 vistas, kimi 80+266, controls 13+7, fanout sin-clasificar 0,
variant-parity 2559/1669) y re-anclé el digest de reconciliation a
`1b1d21bf6388` (= sha256 real del censo — SEGUNDA vez que este digest queda
huérfano tras un lote de fuentes: no lo escribe ningún productor; queda
anotado como candidato a automatizarse).
**Deuda nombrada (reportada por el worker, adjudicación MÍA):** 6 familias
con gobierno parcial medido nunca tuvieron tag de sección (sidebar ×3,
statsGrid, tooltip, evnto surface) — NO se tocan: ninguna afirmación falsa
que retirar; sus hojas siguen en untaggedAuthoredLeaves y su prueba por hoja
aterriza en F4A-7…15 como todas. **Siguiente lote: F4A-7** por
`/tmp/f4a-lotes-7-13.md`.
**K1 ✅ (lote PROPIO del DT en su parte semántica + cierre mecánico por worker
Opus tras el recordatorio de delegación del dueño; verificado por el DT contra
el árbol, nunca de palabra).** Descongelado `--ds-color-primary` (el esquema
§4-K1 mandaba: literal EN la raíz, valor sin cambiar, raíz dialeable).
**Adjudicaciones nuevas del DT, con evidencia:** (1) **el mecanismo es PISO
LITERAL** — la vía paramétrica del diente (a) quedó falsada por medición (el
paso 500 ≠ literal de marca en 5 de 6 celdas: rottay 500=#A0A0A5/#6B6B6B,
bithire #376BAB en base, evnto #6B6B6B); por la ley del instrumento ("piso
LITERAL, AUSENTE o tema paramétrico = rootPinned"), `default.css:156` pasó de
`var(--ds-color-primary-500)` a `#171717` (su resolución de hoy; cero-delta
global — los 3 temas pisan la raíz). Negativo NOMBRADO: en el tema default la
raíz ya no sigue al paso 500 si se edita la rampa a mano; la derivación
semilla→rampa→primario vive en el control `palette.seeds` (declara ambos
canales como salidas), no en el piso. (2) **`--ds-button-primary-bg`**: rottay
y evnto recableados a `var(--ds-color-primary)` (idéntico en los 2 scopes,
medido) → paramétrico, sale de rootFrozen; **bithire INTACTO** (dark
`#1a7fe0` ≠ `#1e84e6` — intención divergente o near-dup, lo decide
F4B/F2-asimétrico; y mass-c3 no tiene mecanismo REDERIVED: tocar solo el base
rompía los pins firmados). Deuda nombrada. (3) **la marca dialeable YA
EXISTÍA** (root-catalog `ramp.seed.primary` = tenant-dial + palette.seeds — mi
respuesta de F4A-5 se verificó, no se escribió nada). (4) **REDERIVED
autorizado** name-only: T1 +3, T2 +9, T3 +14 (26 canales con colisión);
pre-imágenes y pins intactos — **0 líneas sha256 en los diffs**, probado por
mecánica de diff, no por lectura. **Recableo: 30 rottay + 2 evnto + 0 bithire
con razón** (sus 15 ya eran var; los 3 base-only cambiarían en dark → fuera
por cero-delta estricto). Medición reproducida por el DT dos veces (30/0/2).
rottay: 30 recables + 30 colapsos de overlay + 29 docblocks de hoja
(`@domicile derived / @governor deriva de: --ds-color-primary (semilla de
marca, K1)`); evnto: 2 recables + 2 colapsos (sitios multi-clave inline, sin
docblock — convención F4A-6: `color:` sí, `text:` no). **CERO-DELTA probado
por resolución de cascada contra HEAD: 0 diffs de resolución en los 3
artefactos (1212/1235/470 canales × 2 scopes) NI en el piso (1046 canales);
32 diffs de forma, exactos.** mirror-parity medido post-K1: rootFrozen
**[2,4,2]** (quedan color-error + sidebar-bg, y button-primary-bg solo en
bithire), readerEdges **[7,18,7]**, rootPinned [9,11,8] con la partición
11/15/10 INTACTA (K1 movió clases sin ensanchar alcance), severs [49,99,14]
clavados, reDerives [94,149,54] clavados, severedTotal 51/103/16, y el
trinquete `blockedUpstream` **24 → 4 por decrecimiento PURO** (subconjunto
estricto: salieron los 20 que colgaban de primary — el sexteto de F2.4
incluido —; los 4 supervivientes cuelgan de causas ajenas). **La congelación
murió: la raíz reclasificó a rootPinned floor-literal en los 3 temas, y su
dial ya alcanza a los 135 lectores vía el control.** Parada del worker 15/15
correcta: el **diente (a)** quedó huérfano de sujeto (K1 descongeló al
testigo) — adjudicación MÍA: re-sujetado a bithire `--ds-button-primary-bg`,
la única raíz congelada con lector bloqueado hoy (las 5 asertas siguen
mordiendo: 4→3, 103→102, 18→17, 2→1, bloqueados→0, verificadas por el worker
antes de escribir; nota de mantenimiento: se re-sujeta cuando esa raíz se
descongele; si la clase se vacía, sujeto sintético). Corrección de prosa del
worker aceptada: la caída real del trinquete bithire era 15→2 (13 de 15 por
primary), no 13→2. **ERRATUM F4A-6 confirmado mecánicamente** (`git show
HEAD:` líneas 1853/1865): el pin de vocabulario select de T2 ya medía
`chained`=9 en HEAD con el pin en 7 — nadie corrió T2 entero tras K3; K1
heredó 2 de los 3 deltas y su re-anclaje (chained 10, admitted 4, ∩ []→3 con
razón reescrita) cierra el erratum. Re-anclajes del worker, todos medidos del
artefacto: T2 light 135→126 y omitidos 13→22, T3 lightLeaves 164→150 e
idénticos 26→40 (con la cadena 4→+4→+18→+14=40 escrita y un título stale de
TRES olas corregido), mirror-parity pins completos + testigo del pin + la
coordenada del diente (b) 506→513 (las 7 líneas del comentario K1 del piso —
coordenada que corre, no ley que cambia). Cadena completa en el orden fijado:
universo censo 7303, reconciliation digest `066ccd97db34` (= sha256 real del
censo, verificado por el DT), catalog 341 vistas, fanout sin clasificar 0,
**reads-ledger 2607/2607 sin re-anclaje** (hooks-manifest no se movió),
root-catalog 64 raíces OK, root-exposure 26/28/10 OK. **Baja #6 del baseline,
bajada por MÍ**: divergentSlots 1694→**1669** (universo 2586→**2559** por las
32 restituciones colapsadas, 27 exclusivas; positionIntersection 892→**890**;
la ley universo−positionIntersection cierra: −27−(−2)=−25) y
untaggedAuthoredLeaves 2712→**2655** (−55 rottay + −2 evnto; tagRegistry
252→**281** por los 29 docblocks; 4 de las 32 colapsadas tenían tag:
1393→1338 rottay, 198→196 evnto — aritmética exacta contra HEAD). gat-07
**re-sellado por el DT**: `7ac1f9c2e5d1…`. Suite pierna 1, MI corrida: **1717/13** por
nombre (las 14 previas = 13 conocidas + el pin del baseline que bajé).
**Siguiente lote: F4A-3c** (paquete corrector post-Codex, diseño mío en
§"auditoría Codex", ejecución Opus) y después F4A-7…15 por
`/tmp/f4a-lotes-7-13.md`.
**AUDITORÍA CODEX ad hoc (2026-08-21, pedida por el dueño sobre HEAD
`3af69a654`) + verificación MÍA claim por claim contra el árbol.**
Veredicto: la dirección es correcta (F4A-5/6 van bien; NO se revierten) con
**UNA desviación semántica bloqueante confirmada** + 2 doc-drift + 1 brecha
de gate. (a) **BLOQUEANTE — la clasificación "33 limpias" no prueba lo que
los tags de familia afirman.** Recomputé `mapa-familia-canales.json`: el
criterio del mapa (un solo control ENTRE LOS ATRIBUIDOS) da 33/29/53 ✓
idéntico al .md; el criterio estricto (un solo control + CERO canales con
`control:null` + cero hojas sin atribuir) da **0 limpias** — las 33 cargan
nulos TODAS (rottay modal 1/14, tabs 1/37, sidebar 34 hojas/36 nulos;
bithire badge 1/57, tabs 1/54; evnto OVERLAY.palette 3/115). Los 27 tags de
familia mapeados (`@governor dial: X` a nivel sección) afirman gobierno
probado para una fracción mínima de las hojas; el harness valida sintaxis y
cobertura, no gobierno real. La adjudicación débil fue MÍA (línea ~1173:
"tags de familia SOLO donde limpios" con el criterio del mapa) y el mapa.md
nunca declaró que "limpia" cargaba nulos. Los tags de HOJA de F4A-5/6/K1 son
otra clase (citan la raíz del recableo, que ES la prueba) — intactos.
(b) **registry/checkpoint stale** — `roadmap/registry.json` (declarado
`statusAuthority` en program.json) dice "Codex remains the final machine and
sighted auditor and local committer" y 252 familias (son 255);
`checkpoint.intent.json` habla de spacing.rhythm y carriles retirados;
program-check no mira coherencia temporal. (c) **roster stale (menor)** —
`tier.page.fg` decía "materializa F4A-6" en futuro estando aterrizado.
(d) **brecha de gate (diseño)** — `@placeholder` da posición por prefijo
(variant-parity:437, adjudicación F4A-4 deliberada) y puede bajar
`divergentSlots` sin keypath real; la salida contractual (§"Salida F4A":
paridad estructural real, cero shadowing) exige un **gate final de paridad
sobre keypaths evaluados reales**, separado de placeholders — se escribe en
F4A-close (queda en su definición). Los contadores 1694/2712/5100/0
SIGHTED_ACCEPTED son foto de mitad de frente, no desviación. **Corrección:
entra `F4A-3c` a la cola vinculante (después de K1, antes de F4A-7…15)** —
reclasificación con criterio estricto declarado, estrechamiento o retiro de
los 27 tags de familia (el vocabulario `governanceScope: parcial` ya existe
en root-catalog), updates de roster/registry/checkpoint, y spec del gate de
paridad real. Diseño mío (DT), ejecución de Opus; la auditoría Fable de F4A
recibe el informe Codex como insumo. **ERRATUM F4A-6 (detectado por la
batería de K1):** el pin de vocabulario select de T2 quedó ROJO en HEAD —
`chained` era 9 (no 7 pineados) desde que K3 recableó `clearColorHover`/
`tagColor`, y `admitted` 3 (no 1): nadie corrió T2 ENTERO tras los recableos
(6b verificó hashes contra `git show` + censo T3, no las aserciones de
vocabulario). **Ley: tras tocar fuente de tema, los 3 rosters firmados se
corren ENTEROS (vitest de los 3 archivos), no por nombre ni solo hashes.**
**F4A-6 ✅ (worker Opus + cierre F4A-6b con DOS adjudicaciones mías;
verificado por el DT contra el árbol).** K3 ejecutado: **raíz NUEVA
`--ds-color-text-page` autorada** (rootId `tier.page.ink`, campo tipado
`palette.textPageColor`, lowering nuevo en el compilador — colisión verificada
por grep antes de escribir): rottay `#A0A0A5` base/`#6B6B6B` light, bithire
`#53697E` base/`#9aacbf` dark, evnto `#3d3d3d` base **SIN dark** (mis rulings,
conservados). **35 canales de tinta recableados** en rottay a
`var(--ds-color-text-page)` (con restitución de overlay colapsada); **7
intactos** por el filtro (a) de F2 (coincidencia de valor ≠ derivación: las
raíces rivales y sus rampas); **8 hojas ajenas enumeradas y dispuestas con
razón** (su canal no está entre los 42 medidos). **Cero-delta 136/136** por
resolución de cascada (42 canales × 3 temas × 2 scopes contra HEAD);
restauración ida y vuelta ✓; los 4 sitios multi-clave hechos a mano con el
cuidado correcto (`color:` sí, `text:` no — mismo valor, canales distintos);
0 rutas incoherentes (su propio drill de F4A-2b lo detectó y lo removió).
La cadena arrastró `hooks-manifest.json` (+3 líneas, el gate pidió
`hooks:generate`) y `manifest/index.json` (`generator --sync`; 36/36 y
CONSTITUTION_READY) — **reportado, no escondido**. Negativo nombrado:
`surface.declares` +1 en los tres (una raíz autorada ES un canal más —
esperada-móvil); severs rottay 50→**49** (mejora), reDerives 93→**94**.
Contadores (verificados por mí contra el artefacto): universo 2612→**2586**,
hojas 1819/1502/396 → **1786/1504/397**, intersección autorada **344
intacta**, `divergentSlots` 1720→**1694**, `untaggedAuthoredLeaves`
2772→**2712**, `tagRegistry` 216→**252**, failures 0. **Baja #5 del baseline,
bajada por MÍ.** gat-07 **re-sellado por el DT**: `145083775613…` (el sello
final; hubo uno intermedio, `1b6fe22df0fd…`, que quedó viejo al curar el
ledger de reads — ver abajo).
**Las dos paradas del worker (14/14 correctas), adjudicadas:** (a) la
exposición de la raíz queda **`internal-head` hasta F4B** — es lo que hacen
sus cinco hermanas de tinta `tier.*.fg` y no viola la invariante viva (las 26
tenant-dial existen TODAS con control); F4B la reclasifica cuando el dial
aterrice (el worker corrigió por medición: `channelStatus` es
`solo-artefacto`, no `existe` — la frescura mandó); root-exposure-gate **exit
0** con los conteos re-anclados (26/28/10). (b) **REDERIVED T1/T2/T3
AUTORIZADO por mí y ejecutado**: patrón R35 roster por roster, **22 hashes
firmados IDÉNTICOS vs HEAD, probado mecánicamente contra `git show`** (el
censo de T3 movió 182→164 porque los 18 canales quedaron idénticos entre
modos — el overlay dejó de restatearlos, exacto); `rottay-t1-mass-drain`
548/548. **Y la parada que me tocó a MÍ: `validateTenantThemeDocument`
rechazaba `var(--ds-color-text-page)` como unsafe_value (9 tests rojos)** —
el worker falsó su propia hipótesis (allowlist ≠ exposure: medido, no la usó)
y presentó (A) agregar a la allowlist / (B) re-anclar los 9 = bendecir la
regresión (uno es el censo de la superficie de rechazo, creció de 5 a 7).
**Adjudicación mía: (A)** — `--ds-color-text-page` entró a
`TENANT_THEME_REFERENCE_TOKENS` (raíz autorada por el frente con valor
gobernado; la identidad static=DB no se angosta para que quepa el trabajo;
además F4B la lleva a tenant-dial con consumidores DB). Los 9 volvieron
verdes (19/19 en los archivos de la puerta, corridos por mí). Suite pierna 1,
MI corrida: **1717/13, fallas por nombre idénticas a las 13 conocidas, cero
nuevas** (con una lección mía que la suite detectó: mi línea de la allowlist
dejó el censo stale DESPUÉS de la cadena del worker — el pin "the full check
passes" lo marcó; re-regeneré la cadena completa yo, sin saltarme
fanout-facts ni reconciliation esta vez). Y una segunda lección que me
detectó **gates:ci** ya corriendo para el commit: el ledger
`reads-adjudication.json` quedó con `basedOnManifestDigest` viejo tras el
`hooks:generate` del worker — verifiqué cobertura exacta en ambas direcciones
(2607/2607 rows, cero sin fila, cero sobrantes; `--ds-color-text-page` NO es
hook fenced, correcto) y lo re-anclé yo a `302fe9aa3122e453` (sha256 del
hooks-manifest vigente), con gat-07 sellado otra vez y pierna 1 en tercera
corrida (1717/13 idéntico, diff de nombres vacío). La cadena completa queda
FIJADA: censo → reconciliation → kimi → controls → catalog → fanout-facts →
mirror-parity → variant-parity → **reads-ledger** → gat-07 (siempre último).
**Siguiente lote: K1 propio** (descongelar
`--ds-color-primary`: 32 canales CHROME + `--ds-button-primary-bg` rootFrozen
él mismo + filas REDERIVED; la marca dialeable vive en root-catalog —
adjudicado en F4A-5) y después F4A-7…15 por `/tmp/f4a-lotes-7-13.md`.
**F4A-5b ✅ (worker Opus; verificado por el DT contra el árbol; incluye un
defecto semántico que encontré en verificación y corregí YO en el cierre).**
PALETTE etiquetada: **91 docblocks nuevos = 29 tags + 62 placeholders de
hoja**, las 254 hojas PALETTE cubiertas y las 208 ausencias parciales tapadas
(0/102/106 por tema, reconciliadas contra el roster — **cero desfases**: las
ausencias de PALETTE son de hoja, no de raíz, el plano que el roster no ve).
Contadores medidos y verificados por mí contra el artefacto regenerado:
`untaggedAuthoredLeaves` 3026→**2772** (−254 = exactamente 154+52+48, las
hojas PALETTE de los tres temas, ni una más); `divergentSlots` 1826→**1720**
(−106: un slot deja de divergir solo cuando los TRES lo tienen — manda el que
faltaba en dos); `tagRegistry` 127→218; `positionIntersection` 786→**892**
(pin re-anclado por el worker, leído del artefacto); intersección autorada 344
y universo 2612 **intactos**; failures [] y orphanPlaceholders [].
**Byte-idéntico probado ida y vuelta ×3 builds** (los artefactos ni aparecen
en el change set — la prueba de que el lote es de comentarios);
docs-engineering: **cero diffs** (lo correcto para un lote de comentarios).
**El defecto que corregí yo (4 docblocks)**: en rottay y bithire,
`onPrimaryColor` quedó taggeada "derived de --ds-color-border" (falso — la
cubría la herencia seed del const; borré el docblock erróneo) y `borderColor`
quedó circular ("derived de sí misma" — re-etiquetada a su forma del roster:
`seed`, "raiz autora del par border, K2"). evnto limpio (verificado). Tras la
corrección: `tagRegistry` 216, `--check` verde (2612/892/1720/2772), 34/34
drills corridos por mí, build exit 0 con los artefactos sin mover (mis
ediciones son comentarios). Cadena regenerada por mí tras la corrección —
con una lección mía que la suite detectó: mi primera pasada se salteó
fanout-facts y reconciliation, y la suite lo marcó (1717/15: ORACULO de
determinismo + el pin del catálogo); regenerados ambos, `tokens-catalog
--check OK` (deadWriters 266=266). Baseline **Baja #4, bajada por MÍ**
(1720/2772). gat-07 **re-sellado por el DT**: digest `f9adf7318e83…`.
Suite pierna 1, MI corrida: **1717/13, fallas por nombre idénticas a las 13
conocidas, cero nuevas**. **Decisión que el worker me devolvió, adjudicada**: el kit §1 y el parser se contradecían (la
línea de invariante después de los tags rompe el parseo — la lee como governor
multilínea); el worker la puso ANTES y la fuente quedó así. **Adjudicación:
el kit se corrige para seguir la fuente** (esquema §3 en este commit) — el
harness quedó sellado con 34 drills en F4A-2/2b y no se toca. **Siguiente
lote: F4A-6** (K3: raíz NUEVA `--ds-color-text-page` + los canales de tinta —
borrador en `/tmp/f4a-6-brief.md`).
**F4A-5 ✅ = K2+H3 (worker Opus; verificado por el DT contra el árbol; incluye
PARADA CORRECTA 12/12).** El par border canonizado en los 3 temas: rottay y
bithire derivan `borderPrimaryColor` a `var(--ds-color-border)`; **evnto
invierte completo** — el literal se muda a la raíz en cuerpo Y overlay oscuro
(detalle que la medición obligó y mi brief no describía: hoy `--ds-color-border`
solo se declaraba en base como var, y en oscuro resolvía `#2E2C24` a través de
él; sin esa mitad la inversión habría movido pintura). H3: `--ds-card-border[-color]`
de evnto a la raíz; los color-mix subtle/tertiary re-atados a la canónica.
**Cero-delta 36/36 por resolución de cascada, reproducido por mí** con el
resolver del worker (6 canales × 3 temas × 2 scopes, HEAD vs árbol).
**R35 — patrón REDERIVED por MODO**: la primera versión de la tabla (por tema)
dejó 2 hashes rojos (R35-light, E25-dark: la pre-imagen del overlay era otro
byte que la del cuerpo, y los 6 hashes firmaron los dos); con la tabla por
modo **72/72 verde y los seis sha256 intactos carácter por carácter** —
verificado por MI corrida del test, no de palabra. Negativo nombrado (leído
del artefacto): severs evnto 15→**14** (mejora: `--ds-card-border` pasa de
sever a re-derive), reDerives 53→54, identicalValue 156→**157** (el case
`#d4e0ea`/`#D4E0EA` dejó de separar rottay de bithire), occurrenceTrap y
multiDeclaration bajan, sourceSkeleton 1820/1503/397 → **1819/1502/396**,
universo 2613→**2612**, intersección autorada 345→**344**,
positionIntersection 787→**786** (re-anclajes del worker leídos del artefacto,
con comentario en el test; el universo pierde 1 slot porque
`OVERLAY.palette.borderPrimaryColor` colapsó en los 3 temas). Ratchet:
`divergentSlots` **1826 sin mover** (K2 no agrega placeholders; la baja de
slot compensa la posición ganada — explicado en el reading del baseline);
`untaggedAuthoredLeaves` 3029→**3026** (**Baja #3, baseline bajado por MÍ** —
la ley del archivo: se baja en el mismo commit). Restauración ida y vuelta del
worker ✓ (revert→build→byte-idéntico→re-aplicar→el diff exacto vuelve).
Byte-negativo −71 en las 3 fuentes: por eso entró bajo un techo con aire 0.
**Parada del worker (12/12 correctas): la Parte 1 (tags PALETTE +
placeholders de hoja) proyecta +46.138 bytes contra el techo re-anclado al
valor exacto (aire: 0)** — y extrapolado: el frente entero proyecta ~medio MB
de comentarios de gobierno sobre ese subpath. Adjudicación mía: `maxSourceBytes`
→ **900000 con aire de una vez** (re-anclar exacto garantiza el choque del
lote siguiente — chocó dos veces; los comentarios no llegan al bundle; el
subpath muere en F6). **K1 quedó FUERA con razón medida, aceptada**: los 32
canales computacionalmente idénticos son de CHROME (no de PALETTE — el lote
era la familia), `--ds-button-primary-bg` es él mismo rootFrozen en rottay
(recablearlo cambia su clase = adjudicación, no mecánica), y casi seguro
chocan con los rosters de drenaje T2/T3 (cada uno pide su fila REDERIVED) →
**lote propio**, y su pregunta abierta queda respondida: la marca "dialeable"
se escribe en **root-catalog (exposure tenant-dial)** — se diseña en ese brief.
Cadena regenerada completa y consistente (fanout-facts +3 readers, censo con
inputsDigest nuevo, KIMI/reconciliation con el digest nuevo, controls README).
docs-engineering: solo contadores. Suite: el worker midió 1717/14 donde la +1
era el pin del baseline (mío, cerrado con la Baja #3); **MI corrida de la
pierna 1: 1717/13, fallas por nombre IDÉNTICAS a las 13 conocidas, cero
nuevas** (nota operativa mía: la pierna 1 es `node --test scripts/**+manifest/**`
— la primera del encadenamiento de `test:scripts`, roadmap línea ~1491; mi
primera corrida la hice contra el proyecto vitest `unit` por error, 63 fallas
en 13854 tests = otra cosa entera, sin escribir en el árbol, descartada).
gat-07 **re-sellado por el DT**: digest `b8b343eb2e59d048…` — idéntico al
computado por el worker (confirmación cruzada). Corrección doc asentada en el
mismo commit B: esquema §4-K3 y parte3 §4 citaban `--ds-color-text-secondary`
(falsada) → **`--ds-color-text-page`**. **Siguiente lote: F4A-5b** (tags por
hoja de PALETTE ×3 + placeholders de hoja de las ausencias parciales 0/102/106
— la Parte 1 del brief F4A-5, con aire de techo; brief ya escrito en
`/tmp/f4a-5b-brief.md`); después F4A-6 (K3, raíz NUEVA `--ds-color-text-page`).
**F4A-4 ✅ (worker Opus; verificado por el DT contra el árbol; incluye PARADA
CORRECTA 11/11).** Roster por placeholders aplicado **byte-idéntico** (son
comentarios: el artefacto compilado salió idéntico en la prueba ida y
vuelta): **90 placeholders del kit** — rottay **13** cubriendo 161 slots /
bithire **27**→196 / evnto **50**→573 (los 34/17/10 del plan quedaron
desactualizados: manda el roster commiteado de F4A-1). **`divergentSlots`
2268→1826** (baseline bajado por el DT en este commit, verificado contra el
artefacto regenerado con `--check`: 2613 slots / 787 con posición / 1826
divergentes / 3029 sin tag / 127 tags leídos); `untaggedAuthoredLeaves` **3029
clavado**; `tagRegistry` 37→**127** (32 seed · 5 pro-expert · 90
placeholder/unassigned); matriz 2613/345 y sourceSkeleton intactos. El harness
ganó **cobertura por prefijo** (`@placeholder P` da posición `placeholder` a
todo slot del universo igual a `P` o bajo `P.`) con 5 drills nuevos
(sub-árbol, sobre-autoría FAIL citando la hoja, hoja exacta, huérfano
reportado en `orphanPlaceholders`, dos-placeholder) → **34/34 corridos por
mí**. Mis 3 ediciones al harness en este commit: intersección autorada
explícita **345** y `positionIntersection` **787** (dejan de derivarse del
universo), y los exclusivos pasan a contarse sobre hojas AUTORADAS (ancla
**1061/788/2** restaurada). **Parada del worker (correcta, 11/11):** los 90
docblocks del kit sumaron ~15,6 KB de fuente (rottay +2.259 / bithire +4.741
/ evnto +8.593; ~121 bytes por placeholder) y el subpath techo del manifest
de entrypoints quedó por encima — **los comentarios cuentan como bytes de
fuente** aunque el compilado sea byte-idéntico. Adjudicación mía:
`maxSourceBytes` **387391→398278** con `_note` fechada 2026-08-20 (el subpath
muere en F6; la alternativa de una forma más corta de placeholder queda
anotada y descartada — el kit fijo es contrato de F4A-1). Cadena regenerada:
variant-parity + mirror-parity (**solo provenance**) + fanout-facts (**990
citas file:line movidas, CERO medición**) + censo + kimi + controls README +
catalog **re-derivado por el DT** (digest `cffd2d272b…`, deadWriters 266=266,
2 campos movidos verificados por diff — la 14ª falla de la suite era el
catálogo stale y se cerró así). Hallazgos de clase del reporte: `evnto
MOTION` es **delegación, no gap** (su esqueleto escribe los canales; el
placeholder corresponde); `evnto THEME.surfaces` es ausencia léxica **sin
placeholder**; tercera aparición de la clase "evnto compone desde preset
canónico" → anotada para F4A-close. Las **ausencias parciales** (632 rottay
en 18 familias / 914 bithire en 17 / 1643 evnto en 14) son exactamente el
trabajo de F4A-5…15. Build verde (exports-artifact-gate 325 targets — el
techo ya no bloquea). Suite: **1717/13**. gat-07 **re-sellado por el DT**:
digest `2d5ad3e9760f…`. La excepción `rottay CHROME.statsGrid` sigue
pendiente → adjudicación a más tardar en F4A-close.
**F4A-3b — PARADA CORRECTA (10/10): el consumo encontró un bug en el harness
(mío, sellado en F4A-2).** `pathIndex` solo bajaba la pila si la línea
EMPEZABA con `}`; el corpus cierra con contenido+llave en la misma línea →
**594 rutas incoherentes en rottay (31%), 63 evnto, 0 bithire** (bithire se
salvaba por casualidad: cierra todo en línea propia). Confirmado por mí contra
el árbol, no de palabra: reproduje la firma exacta (` rottay:2188` →
`CHROME.controls.buttonPrimary.…alert` en vez de `CHROME.alert`). Latente
porque con 0 tags el índice nunca se consultaba, y los 22 drills pasaban con
fixtures de forma linda. **Si 3b taggeaba, el harness mentía en verde** — la
parada evitó un progreso falso. Bonus del reporte 3b (vale para el re-run):
clases 33/29/53 reproducidas desde el mapa commiteado; join control→roster
32/33 cierra (excepción: `rottay CHROME.statsGrid` con `token-overrides` —
llevaría nota de clase, no tag); banners canónicos confirmados; generadores
escritos y probados en `/tmp/f4a-3b/` (el lote se re-ejecuta tal cual); 28 de
51 docblocks cargan ley real → su verbatim completo viene en el reporte del
re-run y yo escribo `docs/f4a/leyes-fuentes-themes.md` en ese commit
(adjudicación: la memoria de tranches — ROTTAY-T2, MASS C3, EVNTO TERMINAL-2,
T1, K0.6 — pide docs/f4a/, no la fuente).
**F4A-2b ✅ `6c549af78` (worker Opus, verificado por mí contra el árbol).**
Eran TRES bugs: (a) la pila no bajaba en cierres con contenido; (b) `opens` se
anotaba con la pila ya cerrada de fin de línea (ahora se anota en el `:` de la
clave); (c) los `//` entraban como clave (`blankComments` solo limpia `/* */`)
→ rutas `PALETTE.// Semantic`. Fix: nivel por conteo de llaves carácter a
carácter, string-aware, `//` corta la línea; docstring reescrito con las formas
del corpus que provocan cada caso (ley: el comentario dice lo que el código
hace AHORA). 6 drills nuevos (**28/28**, corridos por mí): el del cierre-inline
probado en las DOS direcciones (viejo falla / nuevo pasa, salida pegada en su
reporte), llaves dentro de strings, `//` con dos puntos, e integración: **0/0/0
rutas incoherentes** sobre las 3 fuentes reales + anclas de familia 54/39/18
(evnto 18 y no 19 porque no tiene `const MOTION` — el hallazgo de F4A-2,
consistente). **Artefacto byte-idéntico** (--check verde sin regenerar: la
matriz no consulta el índice y hoy hay 0 tags). **Desvío declarado y
atribuido**: suite 1705/13 → 1711/14 — la 14ª es la carrera PREEXISTENTE del
drill de cascade-wiring-ratchet plantando en `src/` (el worker probó la
atribución: restaura→13, reaplica→14, los dos archivos solos 73/73). Es la
deuda declarada post-Paso B (fixtures a tmpdir): se paga en lote propio
(Sonnet, en vuelo al escribir esto); NO se acepta como baseline nueva.
Lección de método (del worker, adoptada): el fixture debe tener la forma fea
del corpus real, y todo lexer se cruza contra una verdad independiente antes
de cerrar el lote.
**F4A-3 — PARADA CORRECTA del worker (9/9) + split adjudicado: 3a → 3b.** El
brief original asumía que el roster proyecta sobre familias de fuente. Medido:
**67 familias, solo 3 con match nominal a raíz del roster y las 3 falsos
amigos; 64 sin proyección (82% de las hojas)**. Tag-por-familia hubiera sido
promediar (prohibido); tag-por-hoja = ~3.062 docblocks (no es el kit). El
worker citó la parte 3 §1 contra mi brief — correctamente: la parada ya estaba
contenida en mi propia adjudicación. Adjudicación DT: la cola no se reordena;
F4A-3 se divide EN SITIO: **3a** (el plano que falta, read-only) → **3b** (el
canon de comentarios, ahora con insumo real). Bonus verificado de la parada:
banners ya canónicos (0 trabajo), orden alfabético de consts NO-OP medido (0
movimientos — cada sección tiene exactamente un const de decisión), residuo
esqueleto 35 hojas `THEME.*`. **Nota para el dueño:** existe un `stash@{0}`
(WIP de otra época, rutas `src/tokens/`/`src/tenancy/` que ya no existen) —
ni el worker ni yo lo tocamos; dropearlo o no es llamada del dueño.
**F4A-3a ✅ (worker Opus, read-only, verificado por el DT contra el JSON — NO
de palabra).** El plano medido: `docs/f4a/mapa-familia-canales.{json,md}`.
Método **sonda por hoja** (mutar 1 hoja con centinela, recompilar, diff de
canales cambiados/agregados/quitados): **3.726 compilaciones, ~19 ms, 0
errores**. Anclas: léxicas 1820/1503/397 EXACTAS; partición evaluada
1811/1493/422 exacta. **Hallazgo estructural: son TRES planos, no dos** —
canal→control EXISTE (root-checklists atribuye a los 20 diales); canal→raíz-
de-cascada NO existe en ningún artefacto (intersección 16 rootIds × 66 raíces
= VACÍA; la columna queda declarada, no rellenada). Clases medidas
(recomputadas por mí desde el JSON crudo, idénticas al .md): **33 limpias**
(640 hojas) / **29 mixtas** (2.706) / **53 sin control** (380); las mixtas
están ENTRELAZADAS (24/29; mediana 3,5 tiradas/grupo; rottay CHROME.controls:
4 grupos en 80 tiradas) → tag-por-sub-bloque NO alcanza. 149 hojas sin canal:
8 son metadato A.1; **141 son decisiones autoradas reales** (vocabulario de
forma, enums charts, prosa/estado capability, física motion) hoy invisibles
para gates de canal. Auto-correcciones del worker verificadas en el JSON:
`CHROME.card` emite CERO canales (5 hojas de vocabulario de forma; la que
emite es `cardComponent`, 29 hojas / 38 canales, 30 sin control). **Mi
adjudicación para 3b (registrada acá, brief aparte):** tags de familia SOLO
donde limpios (las 33, domicilio via control→dial del roster) + secciones de
capability (`pro-expert` anclado a la capability activa del tema); las mixtas
entrelazadas NO llevan tag de domicilio en 3b (sería mentira uniforme) — sus
tags por hoja/grupo aterrizan EN su lote de reescritura (F4A-5…15), donde la
re-autoría los hace verdaderos en el mismo commit; las 53 sin-control quedan
con nota de clase (no tag) y su disposición final es adjudicación de
F4A-close, ya enumeradas por el mapa (no silenciosas). El esqueleto `THEME.*`
(35 hojas) no se taggea: cablea, no autora — docblock del kit sin tags.
**CORRECCIÓN 2026-08-21 (auditoría Codex, verificada por mí):** el criterio
"limpia" de arriba cuenta un solo control ENTRE LOS ATRIBUIDOS e ignora los
canales `control:null`; con criterio estricto (cero nulos) las limpias son
**0, no 33**. Los 27 tags de familia escritos bajo esta adjudicación afirman
gobierno probado sobre hojas sin atribución medida — se estrechan o retiran
en **F4A-3c** (cola vinculante, después de K1). Detalle en §13 (asiento de la
auditoría).
**F4A-2 ✅ `e6364e90b` (worker Opus, verificado por el DT contra el árbol, NO de
palabra) — harness `variant-parity` blocking: 87→88 gates.** Productor hermano
de mirror-parity (sub-decisión DT registrada): solo IMPORTA de él
(`authoredLeafPaths`, `TENANTS`, `provenanceOf`, `blankComments` — cero walks
nuevos); parser puramente léxico sobre las 3 fuentes (nunca dist/ ni el
artefacto: corre sin build — él el canon de fuente, mirror el espejo de
salida). **Anclas reproducidas EXACTAS**: 1820/1503/397, unión 2613,
intersección 345, **divergentSlots 2268**, exclusivos 1061/788/2, metadato 36
→ denominador 3690. Artefacto `manifest/generated/variant-parity.json` (5
secciones, tagRegistry hoy vacío y correcto) + baseline AUTORADO
`variant-parity.baseline.json` (2268 / 3686, ley decrease-only escrita, se
edita a mano con revisión del DT). **Dientes verificados por mí con mutaciones
reales sobre el árbol**: baseline 2267 → FAIL (GREW); 9999 → FAIL con la
instrucción de bajarlo; 1 byte al artefacto → FAIL frescura; restaurado →
PASS. 22 drills verdes (corpus en memoria, nunca src/): vocabulario, forma,
placeholder (baja la divergencia del fixture + contradictorio), scope ambiguo,
ratchet en las dos direcciones, frescura, anti-vacío, determinismo + las
anclas contra el corpus REAL. Suite 1683→**1705/13** (los 22 nuevos, 0 delta
por nombre). **Desvío del brief adjudicado por el DT — ACEPTADO:** la lista de
metadato queda en **36** (el universo de A.1 no se baja) con 2 entradas de
evnto marcadas `via: EVNTO_CANONICAL_MOTION` — evnto no autora su motion,
delega en el preset (`experience-baselines/evnto/index.ts:35`); la guarda
anti-rename se bifurca (34 exigen hoja léxica, 2 exigen la referencia al
preset) y las dos ramas están drilladas. `untaggedAuthoredLeaves` inicial =
**3686** (unidad LÉXICA; no confundir con 3690 evaluada — trampa prevista en
el brief, documentada en el baseline). gat-07 SIN MOVER (`9374cb75…`),
mirror-parity intacto, scripts-tree-gate M1 verde. gates:ci: **88 blocking +
2 excluded verdes** en este commit.
**F4A-1 ✅ CERRADO (2026-08-20, tarde).** Roster final `docs/f4a/roster-variantes.json`
(schemaVersion 3; copia duradera de `/tmp/f4a-1c-roster-draft.json` — los
insumos de F4A viven en `docs/f4a/`, ver su README): **66 raíces × 3 temas = 198 entradas**,
universo limpio (fila agregada retirada), **BLOCKED 0 · MISSING-CITATION 0**.
Descomposición: 63 raíces catálogo + color.border (autora #2, fuera del eje de
tiers) + text-secondary (seed existente, intacta) + text-page (NUEVA). Por
domicilio: seed 85 / derived 33 / baseline 0 / unassigned 80; baseline y
pro-expert son 0 A NIVEL RAÍZ por diseño (viven a nivel hoja/familia: K5 se
etiqueta en F4A-15; pro-expert se ancla al roster CAPABILITIES). Posture medido
por tema con `compileBrandTheme` sobre FUENTE (no artefacto) — el roster YA NO
es idéntico ×3. **Medición del punto 4 (page.fg por tema, verificada por mí):**
los TRES temas autoran su literal propio (caso a — ninguno deriva hoy):
rottay `#A0A0A5` base / `#6B6B6B` light; bithire `#53697E` base / `#9aacbf`
dark; evnto `#3d3d3d` base SIN dark. Dos rulings míos sobre lo medido: (1)
**bithire se autora con text-page aunque ya era cero-delta contra
text-secondary** — uniformidad del canon (misma raíz, misma semántica en los 3)
y, sobre todo, independencia de diales: atarlo a text-secondary acoplaría la
tinta de página al dial de tinta secundaria en F4B, un acoplamiento que hoy no
existe; (2) **evnto autora text-page SOLO en base** (sin dark) — su
`sidebar.itemColor` no tiene scope dark y text-secondary sí (#A8A898): atarlos
le daría una tinta en oscuro que hoy no tiene (no cero-delta). Corrección de
conteo registrada: `#A0A0A5` son 50 OCURRENCIAS en fuente rottay (yo cité 48
líneas), 42 canales tier.page.fg + 8 en hojas ajenas — el packet F4A-6 enumera
exacto. Verificado contra el JSON por mí, no de palabra.
**F4A-0 ✅ (worker Opus, read-only, `/tmp/f4a-0-baseline.md` + datos en
`/tmp/f4a-0/`).** Cero escrituras en el repo. **7 predicciones falsifican
EXACTO**: hojas evaluadas 3.726 = 3.738 − 12 (el −12 son exactamente los 12
recables de F2, al canal); sourceSkeleton 1820/1503/397; unión 2.613,
intersección 345; exclusivos 1061/788/2; hex literales 1134/468/188; las 37
internal-head+gap sin `governedBy`; las 10 por-crear inertes (0 declaraciones,
0 lectores). Matriz CHROME completa: 54 familias × 34 subfamilias — el
hallazgo es la asimetría de cobertura (`cardComponent`: 29/36/**4** hojas;
evnto no es más simple, está vacío). **5 NO falsifican — y las 5 son
adjudicaciones de F4A-1, no re-mediciones:** (A.1) las 45 hojas de metadato
del catálogo nunca fueron enumeradas → el denominador 3.693 no es
reproducible (la regla se adjudica y se enumera, no se hereda); (A.2)
"asignación" como la define el catálogo no replica (263 vs 159 re-medidas,
95 divergencias en las dos direcciones — "tomar posición sobre una raíz" ≠
"declarar su canal cabeza"; F4A-1 define qué es una asignación); (A.3) 2
referencias `var()` fantasma en rottay y evnto, inatribuibles; (A.4) raíces
con un tema en cero: son **16**, no 9 — y 14 de las 16 son derivationDebt;
(A.5) `tier.page.fg`: **42** canales, no 43. Nudos medidos hoy: par border
(3 temas, 3 relaciones distintas); tier.page.fg (3 destinos rivales con el
mismo valor); `--ds-color-primary` congelada en los 3 con **135 lectores
arrastrados** (la palanca más grande del frente); H4 bien excluido de W3 (no
era cero-delta contra tier.control.bg — confirmado).
**F4A — plan de ejecución ADOPTADO (coordinador, 2026-08-20; plan completo
medido contra el árbol por subagente plan).** Fases: **F4A-0** medición
pre-rewrite (worker, read-only: reproduce el walk evaluado sobre el árbol de
hoy — denominador ~3693 ±12 recables F2, 263 asignaciones, sourceSkeleton
1820/1503/397 con ∩345, matriz familia×subfamilia completa, exclusivos por
tema); **F4A-1** esquema de asignación de variantes + adjudicación escrita de
los 6 nudos (**MÍO, el DT — lote de diseño irreemplazable**: 63 raíces × 3
temas a 4 domicilios, registro de los 3.275 candidatos de colapso SIN
colapsar, orden/comentario/placeholder canónicos, nudos: par border,
tier.page.fg, descongelar-primary, 22 asimétricas, H4, domicilios de las 10
por-crear); **F4A-2** harness de paridad estructural blocking (worker;
87→88 gates, ratchet decrease-only desde ~2.268 slots divergentes a
tolerancia cero al cierre); **F4A-3** canon de comentarios (byte-idéntico);
**F4A-4** alineación de roster por placeholders (byte-idéntico: evnto +34,
bithire +17, rottay +10); **F4A-5…15** reescritas por familia ejecutando el
esquema (K1/K2→5 palette, K3→6 typography, K4→14 asimétricas, K5→15 tabla
bithire; REDERIVED para firmados); **F4A-3c** (enmendada 2026-08-21 tras
auditoría Codex): reclasificación del mapa con criterio estricto declarado,
estrechamiento/retiro de los 27 tags de familia no probados, updates de
roster/registry/checkpoint; **F4A-close** mío: ratchet a tolerancia
cero + **gate de paridad real sobre keypaths evaluados, separado de la
cobertura por placeholders** (brecha señalada por Codex: `@placeholder` da
posición sin materializar keypath) + gates:ci final + **auditoría Fable del
frente**. Restricciones duras
registradas: F4A-0 antes que todo; F4A-1 antes que cualquier reescritura;
F4A-2 antes que F4A-4+; la cadena censo→reconciliation→kimi→controls→catalog
con gat-07 ÚLTIMO mío en cada lote; suite 1683/13 por nombre; lane-control
10/13 no crece; docs-engineering solo contadores. Riesgos con mitigación en
el plan (dead-writers 266 decrease-only, firmados T1/T2/T3/c3/evnto-t2/R35,
deriva de contadores mirror-parity, red visual 462 PNG primera corrida con
peso = F4A, denominador stale si alguien cita 263/3275 sin F4A-0).
**Veredicto de cierre Fable: CIERRE ACEPTADO, cero discrepancias**
(`/tmp/fable-f2-cierre-verdict.md` — verificación corta sobre `4606444d5`:
ola 3 diffs exactos + negativo a nivel de campo, mass-c3 135/135 standalone,
gat-07 `9374cb75` recomputado OK, deuda channel-liveness idéntica re-medida
por el auditor, gates:ci propio 87 verdes con los textos nuevos visibles).
**F2 CERRADO con conformidad del auditor; F4A procede.**
**F2 — CERRADO (2026-08-20) tras veredicto Fable + condiciones implementadas.**
Auditoría del frente (`/tmp/fable-frente-f2-verdict.md`, primera mano:
gates:ci propio 87 verdes, restauración del packet W2 ejecutada por el
auditor ida y vuelta byte-idéntica, ratchet mutado en las dos direcciones y
restaurado, suite 1683/13 = subconjunto estricto de la baseline histórica de
25, sha256 firmados T2/T3 idénticos pre/post frente): **los 4 lotes
APROBADOS**; la declaración "F2-seguro AGOTADO" fue **devuelta con hallazgos**
y así se resolvió:
- **H1+H2 ejecutados en la ola 3 `cf61da8bb`**: evnto
  `--ds-layout-sider-bg`→`--ds-sidebar-bg` (gemelo literal de W2) y bithire
  `--ds-card-bg`→`--ds-surface-card` (paridad computada sin ciclo; el propio
  tema ya ata ese patrón en otra sección). Con W3 el frente recablea 12
  canales, todos con cero-delta computado + restauración probada.
- **Residuo COMPLETO y domiciliado** (las 4 colas del auditor integradas):
  par border/border-primary (hermanos; R35 firmado digiere valor crudo),
  H3 evnto `--ds-card-border[-color]` (mismo nudo del par), H4 bithire
  `--ds-table-bg`/`--ds-table-row-bg`→tier.control.bg (atribución semántica no
  pre-adjudicada), `tier.page.fg` (43 canales #A0A0A5), descongelar
  `--ds-color-primary` (6+15), las 22 asimétricas → **todo F4A/F4B o
  F2-asimétrico**; las 10 raíces `por-crear` (0 declaraciones, 0 lectores,
  adjudicación B) → **materialización re-domiciliada a F2-asimétrico/F4B**
  cuando nazcan valores/consumidores; ratchet 2171 → F3 (plano skins).
- **Universo re-enunciado con honestidad** (corrección del auditor): el
  universo del frente fue "canales literales del artefacto con paridad
  computada contra una raíz derivationDebt", NO "los 150 severos" — el
  conteo real es 164 (50+99+15) y W2 drenó fuera de severs
  (`--ds-layout-sider-bg` nunca estuvo ahí; lo que se movió fue
  rootFrozen.readerEdges).
- **Excluded re-adjudicados en este cierre** (P1 del auditor, condición de
  aceptación): channel-liveness y lane-control-drills pasan de dueño "F2
  cascade front" (frente hoy cerrado — una exclusión con dueño muerto es el
  anti-patrón que la ley de exclusión visible prohíbe) a "F4A/F4B +
  F2-asimétrico" con trackedSince 2026-08-20 y razón por clase de fila. El
  retorno a blocking sigue siendo "findings drained, not re-baselined".
  Prueba empírica: los 12 recables del frente drenaron CERO hallazgos de
  channel-liveness (medido por el auditor a los 10 y re-verificado por el
  coordinador a los 12, censo idéntico) — la deuda nunca fue drenable por
  el conjunto seguro.
- **Red visual (462 PNG)**: la cobertura del recableo fue byte/computada
  (más fuerte que screenshot para cero-delta); el job `visual` no se
  ejercitó durante F2.4 — corre en el próximo push de CI, y su primera
  corrida real con peso es la de F4A (reescritura de themes).
- **Template de packet corregido** (adoptado en W3): `sourceSkeleton.*` se
  enumera como sección esperada-móvil (el negativo sigue falsable) y el
  permiso de role shape se declara como compromiso a futuro ("cero-delta hoy
  → sigue a la raíz mañana").
**gates:ci final del frente: 87 blocking + 2 excluded (re-adjudicados) verdes
en este commit.** Próximo frente según la enmienda: **F4A**.
**Enmienda de secuencia del dueño (2026-08-20) — ADOPTADA y registrada.**
Reescribe §6/§7/§11-bis/§12 del roadmap: la cola vinculante pasa a ser
`F2 seguro exhaustivo → F4A canon estructural → F4B calibración 20 controles →
F2 asimétrico → F3 skins+craft → F4C premium → F5 → F6 → F7 → F8 → F9`
(F9 nuevo: cierre de certificación familia×control, UNKNOWN=0 sobre 255×20).
Compatibilidad con F2.4 en vuelo: el packet no se cancela; los requisitos
nuevos de declaración (raíz, canales, 3 verticales, negativo, restauración del
artefacto) ya están en el brief de la ola 2. Mis adjudicaciones W1 quedan
consistentes con la enmienda: `tier.page.fg` y descongelar-primary son
decisiones de theme → esperan F4A/F4B; W1 midió que el conjunto seguro se
agota con la ola 2.
**Verificación independiente de la enmienda (agente explore, 2026-08-20):
8/8 afirmaciones VERIFICADAS contra el árbol** — 13 Standard + 7 Pro
(controls/README + manifest `activePublicControls: 20`); 255×20=5.100 celdas
todas UNKNOWN y 252 histórico (manifest rollups + family-inventory);
**263 asignaciones y 3.275 canales derivables EXACTOS** (root-catalog.json,
Σassignments/Σcollapses); 37 de 63 raíces sin `governedBy` (27 internal-head +
10 gap); 606 vs 625 (gates-manifest:441); `BrandTheme`/`TenantThemeDocument`/
`compileTheme` existen y **no hay segundo emisor hoy** ("un segundo emisor es
STOP" es exigible desde ya); 462 PNG + job `visual` (ci.yml:387). Cero
contradicciones duras; única deriva: el rótulo genérico "F4" en notas
pre-enmienda (líneas 188, 192, 535, 886-888, 900, 959). **Regla de lectura
adoptada: todo "F4" genérico anterior a la enmienda se lee como F4A/F4B (o
F4C cuando el contexto es craft premium), sin reescribir el log histórico.**
**F2.4-batch W2 ✅ `a7929df5a` + F2-SEGURO AGOTADO (declaración del
coordinador).** 1 de 2 canales ejecutado: `--ds-layout-sider-bg`→
`--ds-sidebar-bg` (rottay). Declaración de packet completa (enmienda del
dueño): rottay 3 líneas exactas (l.626 sustitución, l.1627 colapso), bithire y
evnto byte-idénticos; negativo nombrado y medido (surface/cascadePresence/
valueParity-common/identical/divergent/severs/severedTotal/floorCorpus
IDÉNTICOS); restauración probada (revert→rebuild→byte-idéntico ×3). Se
movieron solo los campos del permiso enmendado: identicalRoleShape 291→290,
divergentRoleShape 140→141 (entra exactamente `--ds-layout-sider-bg`),
occurrenceTrap 1938→1937, multiDeclaration 727→726, readerEdges 31→32 (la
raíz sigue congelada, patrón del piloto). Bonus gobernanza:
`navigation.sidebar-tone` gana su 6.º consumidor alcanzable — el leaf que
esquivaba la perilla ahora la obedece. Suite 1683/13 por nombre ×2;
mirror-parity 44/44; lane-control 10/13 sin crecer; re-sello gat-07
(`cd6ba2a8…`). Huella docs-engineering: 1 contador (`sidebar.md`).
**El canal 2 (`--ds-color-border-primary`→`--ds-color-border`) se bloqueó y
revirtió:** enrojecía `brand-authored-residue-retirement` (R35 firmado —
el hash digiere valor CRUDO, no resuelto) y tres evidencias dicen que el par
border/border-primary son HERMANOS, no padre-hijo: el piso los declara en
paralelo desde el mismo ancestro, divergen en otro scope del piso, y evnto
los ata AL REVÉS (`--ds-color-border: var(--ds-color-border-primary)`). No
hay raíz única en las tres verticales = la condición de bloqueo de la
enmienda en su forma real. **Adjudicación del coordinador: ADOPTADA — el par
va a F4A/F4B (autoría de vocabulario), como `tier.page.fg`.** Aislamiento:
con el canal 1 fuera, el test firmado vuelve a 72/72.
**Corrección del worker sobre W1 (aceptada):** el rojo intermitente de
`brand-authored-residue-retirement` en la ola 1 pudo ser este mecanismo
asomando, no contaminación cruzada — queda registrado como mecanismo, no
como ruido.
**F2-seguro queda EXHAUSTO:** piloto (sexteto) + W1 (3 canales) + W2 (1
canal) = 10 canales recableados, todos con cero-delta computado; el barrido
de las 41 derivationDebt + los 150 severos no deja ningún candidato
inequívoco. Residuo declarado y domiciliado: par border/border-primary,
`tier.page.fg` (43 canales), descongelar `--ds-color-primary` (6+15), las 22
asimétricas → todos F4A/F4B o la fase F2-asimétrico posterior. Ratchet 2171
sin mover (plano skins, F3). Próximo paso: auditoría Fable del frente F2
completo, y si aprueba, F4A según la enmienda de secuencia.
**F2.4-batch W1 ✅ `8f58229e3`** — 2 raíces / 3 canales recableados
(`tier.base.fg`→`--ds-color-text-primary` en bithire ×2 — raíz VIVA, no
congelada; `tier.page.bg`→`--ds-sidebar-bg` en rottay ×1). Cero-delta probado:
surface/valueParity/cascadePresence IDÉNTICAS; severance sin mover (solo
readerEdges 30→31, mismo patrón del piloto); evnto byte-idéntico; diff del
artefacto = 6 líneas exactas; suite 1683/13 estable por nombre; mirror-parity
44/44; re-sello gat-07 (`91970333…`). Sin rosters T2/T3 (no hizo falta
REDERIVED). **Medición que ordena el frente: dentro de los 150 severos quedan
CERO candidatos inequívocos** — bajar `severs` más allá de 50/99/15 ya no es
mecánico, es decisión semántica. Filtros medidos: (a) coincidencia de valor ≠
derivación (5 raíces: `none`, `12px`, ratios — cero-delta hoy, delta garantizado
mañana); (b) colisión semántica `tier.page.fg`; (c) comunes a los 3 temas
(mueven role shape); (d) las ya conocidas del piloto.
**Adjudicaciones del coordinador (W1 → ola 2):**
(1) `valueParity.identicalRoleShape/divergentRoleShape` **ENTRA al permiso**
"colapso de restitución redundante" — es censo de forma de scope, no pintura.
Desbloquea `--ds-color-border-primary`→`--ds-color-border` y
`--ds-layout-sider-bg`→`--ds-sidebar-bg` (rottay, comunes a los 3 temas) para la
ola 2. (2) `tier.page.fg` (43 canales `#A0A0A5`, 4 destinos posibles, la
correcta —tinta secundaria— NO es raíz del catálogo): **NO se recablea en F2**;
promover una tinta secundaria a raíz es autoría de vocabulario = **F4**.
(3) Descongelar `--ds-color-primary` en rottay (libera 6+15 canales): **F4**
(valor de tema), anotado en las notas de F4, no se toca en F2.
**Nota operativa (cierre W1):** el worker regeneró 4 de los 5 eslabones de la
cadena y se saltó `controls` — gates:ci lo pescó rojo (controls-catalog STALE).
El coordinador regeneró la vista (`tokens/controls/README.md`, digest
dc813e5d→OK), gat-07 no se inmutó (el README no alimenta la prueba) y la huella
en docs-engineering siguió siendo solo los 3 contadores del worker. Lección:
la cadena completa es censo→reconciliation→kimi→**controls**→catalog y gates:ci
es quien la audita — ya quedó explícita en el brief de la ola 2.
**F2.4-piloto ✅ `14262d45c`** — sexteto recableado, cero-delta probado
contra el artefacto (12 líneas exactas; bithire/evnto intactos; mirror-parity
solo a la baja en lo permitido). Patrón REDERIVED preservó los rosters sin
tocar hashes firmados. Enseñanzas para el batch (registradas): descongelar
`--ds-color-primary` en rottay libera 21 canales (es decisión de F4 — tema);
el ratchet no baja con trabajo de tema (otro plano); cero-delta estricto por
literal es raro (20/150) — el criterio operativo del batch es "misma pintura
computada tras resolver la raiz" con revisión sighted por lote.
**F2.4 — correcciones del piloto (parada medida del worker, adoptadas):**
(a) el conjunto batch es `derivationDebt` (41) — mi lectura "simetría de modos"
era otro eje; la intersección segura (4 raíces) no tiene trabajo recableable
(spring = args de física, no pintura; 2 solo-artefacto; motion.duration ya
deriva). (b) **cero-delta redefinido**: la pintura COMPUTADA no cambia (contra
el artefacto compilado, loop tsc→artifacts→mirror-parity); el colapso de
restituciones redundantes cuenta como mejora permitida. (c) rosters T2/T3:
re-anclaje permitido cuando el valor computado no cambia (cambia la forma,
no el drenaje). (d) piloto = el sexteto de `ramp.seed.primary` en rottay — el
único cluster con cero-delta demostrable (el piso ya los deriva).
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
