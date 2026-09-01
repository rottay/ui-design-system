# Diagnóstico y plan — 2026-08-19

Qué es este documento: el diagnóstico propio de este asiento (Kimi), hecho
**contra el código, no contra las auditorías previas**. Las auditorías
(`MAPA-DEL-REPO`, `VERIFICACION-FABLE`, `AUDITORIA-KIMI`, `QUE-SE-QUEDA-Y-QUE-SE-BORRA`,
`ROADMAP-DE-REMEDIACION`) fueron insumo sospechoso: cada afirmación que este
plan usa fue re-verificada hoy o está marcada como `[heredado]`.

El destino está definido en [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
(reescrito hoy como ley objetivo: doctrina + árbol completo de owners con
propósito y relaciones + delta). Este documento es **el camino**: qué hacer,
qué borrar, en qué orden, con qué criterio de aceptación. Una vez validado,
este par de documentos (ARCHITECTURE + este) reemplaza operativamente a los
cinco de proceso, que se archivan en `docs/history/`.

Regla de evidencia: cada bloque marca si fue **verificado hoy** (con comando o
lectura directa) o **heredado** (sale de una auditoría y no lo re-medí).

---

## 0. La respuesta de fondo: no se reescribe nada

La pregunta que originó este diagnóstico: *¿hay que reescribir las primitivas
modern para que la customización impacte, o el sistema impacta solo desde el
CSS?*

Respuesta verificada: **el modelo ya es el correcto y no requiere reescritura
de componentes**. La primitiva modern estampa anatomía (`data-part`,
`data-state`, `data-variant`) y estado de interacción; la skin
(`tokens/css/runtime/engines/modern/skin/<componente>.css`, 123 archivos) es
dueña de toda la pintura leyendo canales `--ds-*`; el tenant mueve diales y el
compilador regenera el artefacto. Nadie edita un TSX para restylizar — el
contrato está escrito y enforceado (caso Button, incluido el incidente P-79 que
blindó el ancla `[data-variant]`).

Lo que falta son **tres clases de trabajo mecánico**, ninguna es reescritura:

1. **Recablear canales** (trabajo de skins, no de TSX): hoy, de 3.306
   referencias únicas `var(--ds-*)` en la skin modern, 1.365 (41 %) llevan
   fallback encadenado a raíz y 908 (27 %) son `var()` pelado. *[Verificado
   hoy: grep sobre `modern/skin/`. El roadmap cita 2.229/3.548 con otro
   denominador — mismo diagnóstico, distinta base.]*
2. **Drenar la pintura inline**: 41 de 136 archivos de engines modern leen
   `var(--ds-*)` inline en TSX (patrón viejo de 2026-04-17). Se migran a su
   skin. *[Verificado hoy: grep en `ui/**/engines/modern/`.]*
3. **La pasada de craft por familia** (Quiet Premium: motion, elevación,
   estados), escrita contra raíces una vez viva la cascada. Esta es la
   "mejora de calidad" propiamente dicha; hacerla antes de la cascada crearía
   deuda nueva.

Después de eso, re-themear es un swap de artefacto. El sistema impacta
automáticamente **solo donde el cableado existe**; el trabajo es completar el
cableado.

Estado de la cascada (verificado hoy contra `governance/manifest/` del programa):

- 20 diales de tenant (STANDARD 13 / PRO 7 / EXPERT allowlist cerrada /
  INTERNAL 1) — existen como JSON gobernados.
- 63 raíces internas catalogadas (`cascade/root-catalog.json`), reconciliadas
  contra los 20 diales; **algunas marcadas `por-crear`: no existen como
  variables reales en la base modern**.
- 3.693 canales de tema medidos: 88,7 % colapsable (67 % derivable + 21,7 %
  variante). La medida de trabajo de un tema espejo es **263 asignaciones**
  (raíz × modo), no miles de canales.
- `targetControlModel` y los 14 `targetRecipeGroups`:
  `PROPOSED_NOT_IMPLEMENTED` (spec aprobada, sin ejecutar).
- Dos enums vacíos (`chrome.anatomy`, `profiles.expressive`): sin variantes
  nombradas no hay tema espejo posible.
- Sin aserción de espejo: los tres temas tienen 19,3 % de intersección y
  bithire deriva (razón tipográfica 0,308 → 0,435). *[Heredado del roadmap;
  el artefacto de paridad existe y pasa en verde midiendo otra cosa.]*
- `--ds_`: cero usos; el gate no existe. `--_ds-*`: 252 definiciones vivas
  (locales privados de skin) — convención real que nadie había declarado; ya
  declarada en ARCHITECTURE.md §1.6.

---

## 1. Frentes de trabajo (orden secuencial)

Cada frente cierra con `pnpm --filter @rottay/design-system gates:ci` verde y
estado del roadmap actualizado solo vía `scripts/maintain/roadmap/status/index.mjs`. Ningún
borrado ocurre antes de que exista el comando que demostraría que rompió algo.

### F0 — Piso honesto (lo que queda)

Gran parte ya se hizo en la sesión del 2026-08-19 (verificado hoy): el flag
fantasma de gat-07 está corregido (`--check-artifact` en el manifiesto), el
checkout de docs-engineering ya precede a `gates:ci` en CI, el glob de
`test:scripts` ya es recursivo, 3 de los 5 gates huérfanos ya fueron cableados,
y las 802 citas de `platform.css` ya fueron re-ancladas (hoy: 0).

Queda:

- Decisión binaria sobre los 2 gates que siguen sin invocador:
  `channel-wiring-zero-delta-gate.mjs` y `cra-17-integral-gate.mjs` — entran al
  manifiesto o se borran. *[Verificado hoy: 0 referencias en package.json ni
  manifiesto.]*
- **Gate exports→artefacto** (nuevo): recorre `package.json#exports` y falla si
  el destino no lo produce el build. Hoy `./styles/rottay` y `./styles/default`
  apuntan a `dist/rottay.css` que no existe. *[Verificado hoy.]*
- **Gate `--ds_`** (nuevo): el prefijo experimental no llega a artefactos
  publicados.
- Borrados de riesgo cero ya adjudicados (lotes 1, 2, 3 con su paso de barrel +
  re-seed de baselines, 4, 5 archivando los 4 `.md` con cartel, 10, 11, 12):
  23 carpetas vacías bajo `src` (35 en el repo) *[verificado hoy]*, 17
  codemods muertos de febrero, 13 iconos legacy, el monolito
  `probe/index.mjs` + su test, los 2 agentes `.claude/` que describen
  otro DS, alias duplicados de package.json, `audit-presets.mjs` +
  `audit-report.json`, `showroom/.tmp/`, `coverage/` + `coverage-final/`.

Criterio: `find packages/core/src -type d -empty | wc -l` → 0; manifiesto sin
flags que los scripts no parsean; los 2 gates decididos.

### F1 — Vocabulario cerrado completo

- Llenar los 2 enums vacíos (`chrome.anatomy`, `profiles.expressive`).
- Terminar la migración `targetBinding` → `internalChannels` (29 % → 100 %;
  3.638 celdas restantes) *[heredado del roadmap]*.
- Adjudicación de exposición por raíz (`tenant-dial | internal-head | gap`)
  reconciliando las 63 raíces con los 20 diales — el catálogo ya define el
  vocabulario; falta la adjudicación.
- `program-check` gana la regla: enum no vacío + celda gobernada; el campo
  `targetBinding` se borra al terminar.

Por qué primero: las raíces que F2 materializa salen del manifiesto; con el
vocabulario incompleto, F2 materializa un borrador.

### F2 — La cascada existe en fuente

- Materializar las 63 raíces como variables reales en la capa base del motor
  `modern` (las marcadas `por-crear` primero).
- Recablear los canales huérfanos al patrón `var(--ds-canal, var(--ds-raíz))`,
  por familias, siguiendo el checklist del manifiesto.
- Ratchet decrease-only de canales huérfanos (el precedente existe:
  `daisy.classConsumers`, hoy en 0) *[verificado hoy]*.
- Enchufar `fanout-facts` y `mirror-parity` a los runners (sus tests ya son
  alcanzados por el glob recursivo; confirmar en CI).

Criterio: el conteo de canales sin fallback baja y nunca sube (gate nuevo con
baseline). Mi línea base medida hoy: 908 bare de 3.306 en la skin modern.

### F3 — La pintura vive en las skins

- Migrar las 41 lecturas inline `var(--ds-*)` de engines modern a sus skins
  (patrón Button; el censo de pintura inline queda decrease-only).
- Pasada de craft por familia contra raíces (Quiet Premium: motion, elevación,
  estados de interacción) — el orden de familias lo fija el manifiesto.
- Cerrar la deuda anotada del handoff: los dos compiladores derivan los mismos
  10 slots `--ds-chart-series-1..10`; el pin del drill vuelve de 2 a 1 al
  unificar.

Criterio: censo de pintura inline en bajada; visual e2e del showroom verde por
familia (438 PNG de referencia son la red).

### F4 — Los tres temas son espejos

- Reescribir `brand-themes/{rottay,bithire,evnto}/index.ts` como asignaciones
  de variantes nombradas sobre las raíces (~263 asignaciones por tema en vez
  de 1.804/1.482/407 canales a mano).
- Aserción de paridad como gate bloqueante (misma superficie de canales,
  mismos nombres, valores libres): falla hoy (19,3 %), pasa al terminar.
- Regenerar `styles/*.css`; colapsar los ~3.275 canales derivables de los
  temas. Quedan raíces, variantes e irreducibles.

Por qué después de F2/F3: un tema asigna variantes a raíces que deben existir;
y el craft ya estabilizó las skins que los temas alimentan.

### F5 — Una capacidad, un dueño (el §3 de ARCHITECTURE.md)

Retiros y unificaciones, todos adjudicados en el delta del documento de
arquitectura. Los grupos de pasos conocidos se respetan (ej. approval-inbox
arrastra barrel, skin, 5 claves i18n, supplier-contract y manifiestos
fail-closed — no es un `rm`). Orden dentro del frente: primero lo sin
consumidores, después lo que migra consumidores internos, al final lo que toca
API pública publicada.

Incluye la fusión de gramáticas de métricas/actividad (`StatDef` /
`Activity` como formas únicas; `command-center` consume del dueño) y la ley de
composición pattern→primitive (`calendar-view` compone `Calendar`, `timeline`
compone `Timeline`).

### F6 — Frontera pública honesta

- Retirar los 77 subpaths granulares (`./primitives/*` 39, `./patterns/*` 13,
  `./runtime/*` 11, `./contracts/*` 7, `./structures/*` 5, `./surfaces/*` 2) —
  0 importadores en las tres apps. *[Verificado hoy por muestreo de prefijos.]*
  Es semver major: changeset + ventana de migración.
- Lista explícita de API en el barril raíz (reemplaza `export *`).
- Regenerar `dist/` y extirpar la identidad `platform` completa:
  `styles/platform.css` (byte-idéntico a rottay, md5 verificado hoy),
  `dist/platform.css`, presupuesto de performance, exigencia de
  `dependency-honesty.mjs`.
- **No se declara `./commercial`** (ver §3, divergencia 3).

### F7 — Higiene del repo

- Un solo árbol `test-artifacts/` (el de core, 100 % versionado); repuntear los
  8 scripts que hoy resuelven contra la raíz + los carve-outs del `.gitignore`.
  *[Verificado hoy: lista de los 8 en mano.]* La evidencia tracked de `cra-16`
  quedaría huérfana de productor — decidir su destino en el mismo lote.
- quality-evidence v1 fuera junto con `quality-evidence-gate.test.mjs` y la
  línea de package.json (v2 es la vigente). *[Verificado hoy.]*
- `packages/core/ARCHITECTURE.md` se plegó: sus anexos mecánicos (engine
  factory, merge chains y modelo de surfaces) viven en
  `packages/core/docs/architecture/` y el archivo raíz desapareció.
- Los 5 documentos de proceso anteriores + este diagnóstico, a `docs/history/`
  al cerrar el programa.
- README.md: queda como marketing + quickstart + puntero a ARCHITECTURE.md
  (hoy duplica el 75 % y arrastra datos vencidos: 263 roles ×3, `platform` en
  brand-themes). CLAUDE.md ya corregido hoy (patrón de pintura, daisy, WOs,
  compilador único).

### F8 — Las apps entran al sistema

Último, porque toca repos ajenos: 242 archivos con imports directos de
Lucide/Ant icons; retiro coordinado del alias webpack de `/commercial` en
app-platform (53 archivos) cuando la capacidad esté reclasificada; ratchet
decrease-only medido en disco sobre las apps.

---

## 2. Lista maestra de borrado

Consolidada; el detalle y la justificación por ítem están en el §3 de
ARCHITECTURE.md. Nada se borra sin su gate/test de demostración previo.

**Repo (raíz):** 17 codemods de febrero; `audit-presets.mjs` +
`audit-report.json`; `coverage/` + `coverage-final/`; `test-artifacts/` de raíz
(tras repunteo); `.claude/agents/componentes-agent.md` + `storybook-agent.md`;
`showroom/.tmp/` (32 scripts); `probe/kit-inventory` al cerrar su WO;
quality-evidence v1; 4 `.md` históricos de raíz → archivados, no borrados;
10 alias duplicados de package.json; 2 gates sin invocador si la decisión es
"se borra".

**foundation/infrastructure:** 19 espejos `tokens/ts/runtime/components/*`
(helpers de Collapse se mudan primero a su owner); `tokens/ts/foundation/base/*`
+ `runtime/mirrors/*` + `facade/` completo (incl. typography-scale deprecada);
`contracts/composition/components/`; `kernel/accessibility/wcag/` (absorbido
por `color/contrast`); `contracts/kernel/tokens/extensions/` (nunca cableado);
cascarones vacíos: `presentation-profiles/` (7), `graphics/continuous-runtime-
governor/` (6), `theming/foundation/color/` (2), `engines/foundation/contracts/
binding/`; `theming/composition/react/provider/theme/`; `resolution/{subdomain,
domain}/`; `compilers/kernel/runtime/appearance/` (absorbido por el lowering
único); puente duplicado de Collapse ya retirado y
`presentation/components/patterns-paint/index.css` pendiente de asignación;
barriles
intermedios de compilers sin consumidor.

**graphics/entrypoints:** `icons/presentation/legacy/` (15 carpetas; el
catálogo cubre las 15); `icons/runtime/adapters/` vacío; 8 carpetas vacías de
`entrypoints/public/**`; 77 subpaths granulares.

**ui/:** `Toggle` (→ Switch); `Stepper`; `HoverCard`; `Message` (→ Toast);
`Callout` (→ Alert); `Space` (→ Stack); `ConfirmDialog` (→ AlertDialog);
`FloatButton.BackTop`; el lado patterns de los 4 pares de chrome
(`list-toolbar`, `column-settings`, `saved-views`, `filter-panel`);
`workflow/approval-inbox`; `dashboard/stats-header`; `pages/data/list`;
`pages/workspace/record-workbench` (sus 3 deltas reales pasan al contrato de
DetailSurface); `visualization/map-view` (salvo que aterrice un provider real);
alias residual `WorkspaceFilterRail`.

**Renombres:** `Typography.Link` → `TextLink`; pictogramas `candidate-evidence`
y `event-moment` → nombres domain-agnostic (el campo `family` también pierde
los literales de producto).

**Converge (no se borra):** `command-center` consume contratos del dueño;
`PatternEmptyState` delega en `Empty`; `calendar-view`/`timeline` componen sus
primitives; `guided-draft-form` compone `PatternFormBuilder` o queda excepción
documentada; el preview de customización se consolida en `tenant-preview`;
deudas autodeclaradas de `DataTerminalCard` saldadas.

---

## 3. Divergencias deliberadas con las auditorías previas

Puntos donde este plan se aparta de los documentos anteriores, con mi razón.
**Son los puntos que pido que la re-auditoría ataque primero.**

1. **El chrome de colección lo gana `structures/workspace/`** (no patterns).
   Razón: la ley de tiers (el chrome de página es structures) por encima del
   conteo de usos — en etapa de construcción, el uso no legitima. Kimi midió
   ~22 vs ~13 a favor de patterns; el roadmap heredó esa corrección. Yo la
   revierto. Coste aceptado: migrar `collection-workspace`, `data/list`,
   `decision-inbox` y el entrypoint público.
2. **`DetailSurface` canónica**, `record-workbench` se retira. Las auditorías
   lo daban empate 3-3 en apps; medido en JSX real: 45 vs 3. Y el contrato de
   record-workbench es una reimplementación paralela (492 líneas) cuyo delta
   (slot de relacionados, empty-state por tab, badge por tab) cabe en
   DetailSurface. Su autodeclaración "Enhanced DetailSurface" no envuelve
   nada de DetailSurface.
3. **No se declara `./commercial`.** El roadmap proponía declararlo (B5). La
   ley del repo dice que "commercial" es adjetivo de marketing, no rol
   arquitectónico — declararlo institucionaliza la excepción. La capacidad se
   reclasifica por lo que hace y las 53 referencias de app-platform migran en
   F8. El gate exports→artefacto se construye igual (F0).
4. **Unificaciones nuevas** que ninguna auditoría propuso: `Message`→`Toast`,
   `Callout`→`Alert`, `Space`→`Stack`, `ConfirmDialog`→`AlertDialog`,
   `FloatButton.BackTop` fuera (queda `BackTop`), `map-view` fuera salvo
   provider. Criterio: una capacidad, un dueño, un nombre.
5. **`Calendar`/`CalendarView` se quedan los dos** con ley de composición
   (el pattern compone el primitive, como `tree-view` compone `Tree`). Las
   auditorías los daban a elegir entre terminarlos o retirarlos por "0 usos";
   el criterio de uso no aplica en etapa de construcción, y calendar es view
   mode declarado de colecciones.
6. **La métrica que importa es 263 asignaciones, no 3.548 canales.** El
   roadmap mide el dolor en canales; la medida de la cascada terminada es
   cuántas decisiones toma un tema. Con eso se comunica el progreso de F2–F4.
7. **`mono-stat` se queda** como capacidad distinta (idioma de conteo por
   reveal), no como variante de `Statistic`. La frontera se documenta.

## 4. Lo que NO se toca

- `modern-rescue/probe/` (5 módulos vivos de la sonda raíz — solo cae el
  monolito y su test).
- Los 8 componentes que una lectura de solo-liveness marcó huérfanos
  (`decision-panorama`, `widget-board`, `bulk-select-toggle`,
  `status-filter-pills`, `mono-stat`, `ascii-diagram`, `token-inspector`,
  `terminal-block`): los consumen contract tests, fixtures de brand-studio y
  probes del showroom.
- `scripts/maintain/codemods/**/index.mjs` (se corren a mano en los consumidores, por diseño).
- `skin-orphan-scope-audit.mjs` y los censos complementarios (dirección
  opuesta a propósito).
- `Sheet`, `Popover`, `Statistic`, `Tree` (tienen consumidores de producción
  dentro del DS).
- `roadmap-commercial/` (aislamiento firmado 2026-07-07).
- Los monocromos sin engines (tier sancionado de elementos crudos).
- Los 7 scripts vivos de la raíz.

## 5. Riesgos y mitigaciones

- **Recablear skins puede cambiar píxeles**: cada familia se acepta con el
  visual e2e del showroom (438 PNG versionados) + sonda de resolución.
- **Semver major** al retirar 77 subpaths y renombrar `Link`: changeset +
  nota de migración; las apps no usan esos subpaths hoy (verificado), el
  riesgo es consumidores externos del paquete publicado.
- **Manifiestos fail-closed**: los retiros de familias exigen regenerar
  inventarios/baselines en el mismo lote (program-check falla cerrado si no).
- **Deriva de docs**: este plan muere de viejo si no se ejecuta; al cerrar el
  programa, este archivo se archiva con los demás y ARCHITECTURE.md queda solo.

## 6. Decisiones que faltan del dueño

1. Los 2 gates sin invocador: ¿entran al manifiesto o se borran? (uno por uno)
2. `test-artifacts/`: confirmar el árbol de core como único + destino de la
   evidencia tracked de `cra-16` (huérfana de productor).
3. Confirmar las 7 divergencias del §3 (especialmente la 1 y la 3, que
   revierten decisiones de documentos previos).
4. `map-view`: ¿se retira o se le consigue provider?
5. ¿`DetailSurface` absorbe el delta de record-workbench antes o después del
   retiro? (Mi recomendación: antes, en el mismo lote.)

## 7. Qué está verificado hoy vs heredado

**Verificado hoy (este asiento, contra el árbol):** 23/35 carpetas vacías; 0
citas de `platform.css` en manifiestos; flag `--check-artifact` ya corregido y
orden de CI ya correcto; glob recursivo de tests ya puesto; 3/5 gates ya
cableados, 2 restantes; `./commercial` no declarado y 53 archivos vía alias;
`dist/` stale (sin `rottay.css`); 41/136 engines con pintura inline; 908 bare
/ 1.365 encadenados / 3.306 únicos en skin modern; 282 roles de iconos; 18
familias de charts; 20 controles; 63 raíces y su catálogo; `daisy.
classConsumers: 0`; 13 variantes de Button; 100 WOs (74/25/1); md5 idéntico de
platform/rottay.css; árbol completo de owners de `src/` (los 7 sub-agentes
leyeron cada owner).

**Heredado (no re-medido por mí):** 29 % de migración internalChannels; 19,3 %
de intersección de temas; deriva tipográfica de bithire; 242 archivos de apps
con iconos vendor; conteos de consumo en apps de QUE-SE-QUEDA (salvo el 45 vs
3 de Detail/RecordWorkbench, re-medido); el estado de WO-SHW-01/02.

---

## Anexo — prompt sugerido para la re-auditoría (Fable)

> Lee `docs/ARCHITECTURE.md` (ley objetivo) y
> `docs/history/programs/architecture-refactor/2026-08/diagnosis/index.md` (este plan). Verifícalos contra el
> árbol real con comandos propios; no des por válida ninguna cifra sin
> re-medirla. Ataca en este orden: (1) las 7 divergencias del §3 — ¿alguna
> rompe algo que el plan no ve?; (2) la lista maestra de borrado del §2 —
> ¿algún ítem tiene un consumidor que el plan omitió?; (3) el orden de frentes
> del §1 — ¿alguna dependencia está al revés?; (4) el árbol objetivo de
> ARCHITECTURE.md §2 — ¿algún owner tiene propósito falso, duplicado o
> faltante? Reporta afirmación por afirmación: CONFIRMADO / REFUTADO /
> PARCIAL, con evidencia (comando + resultado). Todo lo que dependa de las
> apps externas, márcalo NO VERIFICADO salvo que lo midas en disco.
