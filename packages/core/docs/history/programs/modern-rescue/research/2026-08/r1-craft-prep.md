# Scout READ-ONLY — R1 CRAFT CALIBRATION: prep de las tres unidades (WO-CRA-23)

> **CORRECCIÓN DE DIRECCIÓN (owner, 2026-08-30, posterior a este reconocimiento):**
> los verticales (BitHire, The Management) son **fixtures/bancos de prueba del motor
> del DS**, no destinos de dirección artística ni productos a personalizar uno por uno
> ahora. La obligación de implementar las direcciones registradas quedó RETIRADA de la
> aceptación de R1 (ver `rounds/index.json` R1 + `art-direction/index.json.stageStatus`).
> Las referencias de este reporte a "dirección artística por unidad" se leen como
> **gramática del DS que las pruebas A/B de los fixtures deben demostrar**, no como
> embellecimiento de cada vertical. Lo que sí sigue intacto y manda: la identidad
> canónica, los hardcodes vivos como cola de implementación (PatternDataTable cierra o
> adjudica sus 52 clase-B), la cobertura de escena y los gaps, y el criterio de DONE
> por unidad. Reglas nuevas que este lote hereda: presupuesto 80/20 source-vs-
> instrumental; ningún lote compuesto solo por documentos/manifests/scripts/
> evidencia; censo de hardcodes con reducción monotónica por lote; reporte de
> cohorte con las secciones A (source productivo) / B (hardcodes retirados o
> adjudicados) / C (cascadas demostradas) / D (instrumental) / E (siguiente lote
> lanzado).

- **Fecha:** 2026-08-30
- **HEAD:** `b682164f6` (`docs(modern-rescue): asiento roadmap entry 26 — F4C canary CERRADO (23426a0e1, …)`)
- **Árbol:** untracked ajenos (`docs/reauditoria-cloud/`, dos scouts COH-1, `hardcode-census-top5.md`). Ninguno es input salvo como evidencia citada.
- **Regla cumplida:** cero escritura sobre el repo excepto este reporte. Sin builds, sin servidores. Capturas F4C inspeccionadas con lectura de imagen real (5 PNG citados en §4).
- **Marco:** el owner declaró AESTHETIC NOT_ACCEPTED sobre F4C (`F4C/README.md:461-463`) y ordenó el lote R1 CRAFT CALIBRATION: tres unidades completas punta a punta. La secuencia ya estaba escrita en la ley del round: `rounds/index.json` R1 `objectives` — *"attack Button then PatternDataTable then AppShell as the first-failing grammar sequence before the remaining canaries"*.

---

## 1. Identidad canónica

Ninguna de las tres unidades mapea 1:1 a una sola familia canónica; cada una es un **canary de R1** (`rounds/index.json` R1 `scope.families`, 12 canaries) que cubre un conjunto acotado de familias del inventario activo (255 filas, `family-inventory/index.json`). Estado de adjudicación global hoy: `adjudication.unreviewed = 255` (README del programa, tabla derivada, líneas 290-294) — **ninguna familia tiene review**; todos los manifests tienen `review.verdict: null` y las 21 celdas `themeControls` en `UNKNOWN`.

### Unidad 1 — Button/action cluster → canary `Button-and-action-cluster`

| Familia canónica | Manifest | Adjudicación |
|---|---|---|
| `primitive/inputs/button` (Button) | `packages/core/manifest/families/primitive/inputs/button.json` | `review.verdict: null`; 21/21 controles `UNKNOWN`; `palette.seeds` tiene `verificationState: COMPUTED_VERIFIED` con 6 receipts F4B pero `disposition: UNKNOWN` ("SIGHTED_ACCEPTANCE_PENDING… the button fixture is in the measured roster of every one of the six runs") |
| `primitive/navigation/segmented` (Segmented) | `packages/core/manifest/families/primitive/navigation/segmented.json` | `review.verdict: null`; todo `UNKNOWN` |

**Boundary propuesto (ya escrito en la ley):** Button + Segmented, con los compounds `Button.Group`/`Button.Icon` dentro de la unidad Button (viven en el sourceOwner: `primitives/inputs/Button/compound/{Group,Icon}/index.tsx`). Evidencia del boundary: la escena del lab se titula *"CONTROL group scene — Button + Segmented"* (`sections/control/index.tsx:3-4`) y `rounds/index.json` R1 `writeDomains.required[family-source].units` lista exactamente `packages/core/src/ui/primitives/inputs/Button` y `packages/core/src/ui/primitives/navigation/Segmented` como las dos primeras unidades.

**Explícitamente FUERA del cluster** (familias propias con canary propio): `primitive/navigation/float-button`, `primitive/inputs/voice-input-button`, `structure/workspace/export-button`, `structure/workspace/action-dock`, `structure/record/record-action-bar`. Mezclarlas inflaría la unidad y violaría "each canary root is a UNIT and must have exactly one owner" (`rounds/index.json` R1 `writeDomains`).

### Unidad 2 — PatternDataTable → canary `PatternDataTable-mobile-projection`

| Familia canónica | Manifest | Adjudicación |
|---|---|---|
| `pattern/data/pattern-data-table` (PatternDataTable) | `packages/core/manifest/families/pattern/data/pattern-data-table.json` | `review.verdict: null`; 21/21 `UNKNOWN`/`UNKNOWN`; 88 stableParts; 24 estados declarados |

**Boundary propuesto:** solo `pattern/data/pattern-data-table`. La frontera con la hermana `primitive/display/table` (Table) ya está adjudicada en fuente: `packages/core/src/ui/patterns/data/data-table/OWNERSHIP.md:5-26` — Table = documento tabular autocontenido; PatternDataTable = superficie operacional de colección (toolbar, bulk workflow, **proyección mobile-card**, empty/loading/error/pagination, recetas `minimal/ruled/grid/zebra/editorial`, grouping/virtualización/inline-edit). **Riesgo de boundary medido:** ambas familias leen el vocabulario `--ds-table-*` del mismo skin (`hardcode-census-top5.md:85`), así que cualquier cambio en `data-table.css` tiene blast radius sobre Table aunque Table no esté en la unidad — la adjudicación de canales compartidos es decisión previa del DT, no del writer.

### Unidad 3 — AppShell → canary `AppShell-sidebar-BottomTabBar`

| Familia canónica | Manifest | Adjudicación |
|---|---|---|
| `structure/shell/app-shell` (AppShell) | `packages/core/manifest/families/structure/shell/app-shell.json` | `review.verdict: null`; todo `UNKNOWN`; 16 stableParts; estados `active/focus/focus-visible/hover/collapsed/aria-expanded` |
| `structure/shell/bottom-tab-bar` (BottomTabBar) | `packages/core/manifest/families/structure/shell/bottom-tab-bar.json` | `review.verdict: null`; todo `UNKNOWN` |

**Boundary propuesto:** AppShell + BottomTabBar (el nombre del canary manda). El sidebar es un **slot** de AppShell (`sidebar={{ logo, nav, footer }}`), no una familia separada dentro de la unidad. `structure/shell/sidebar-surface` y `structure/shell/page-shell-surface` quedan fuera: PageShell pertenece al canary `CollectionHeader-PageShell` y la cohorte `structure-shell-6` es R4 (`visual-craft/index.json` `checkpointPolicy.roundCohorts`). `rounds/index.json` R1 `writeDomains` da como unidad el directorio completo `packages/core/src/ui/structures/shell` — eso es el dominio de escritura del lane, no el scope del canary; conviene declarar el subconjunto explícito en la propuesta de ownership del lote.

---

## 2. Estado actual del source

### Unidad 1 — Button / Segmented

- **Engine modern:** `packages/core/src/ui/primitives/inputs/Button/engines/modern/index.tsx` (574 líneas). Pintura 100% por skin: el docblock (:6-17) declara que el engine pinta enteramente desde `skin/button.css` keyed por el contrato `data-*` (`data-variant`, `data-size`, `data-shape`, `data-disabled`, `data-loading`, `data-pending`, `data-icon-only`, `data-size-responsive`, `data-tone`, `data-recipe`…). **Cero `style={{` inline** en el engine modern (medido: `grep -c "style={{"` = 0). Variantes conocidas desde `BUTTON_VARIANT_VALUES`; fallback a `primary` si llega una variante desconocida (:72-76).
- **Skins:** `runtime/engines/modern/skin/button.css` (1136 líneas, **252 canales `--ds-*` únicos leídos**; dominante `--ds-button-*` con 280 lecturas, luego `--ds-material-*` 43, `--ds-density-*` 15, `--ds-radius-*` 13; 49 lecturas con fallback literal; **0 hex literales**), más `presentation/components/skin/button-group.css` (164 líneas, 11 canales) y `button-icon.css` (20 líneas, 2 canales).
- **Canales gobernados que ya lee:** es el *productive witness* de `palette.seeds` — el seed llega vía `--ds-button-primary-bg` (manifest button.json, `themeControls[0].unknownReason`).
- **Hardcode vivo:** button.css **no aparece** en el top-25 clase B del censo (`hardcode-census-top5.md:74`); su deuda son los 49 fallbacks `var()` (cubo b: red, no pintura).
- **Segmented:** engine modern `primitives/navigation/Segmented/engines/modern/index.tsx`, skin `runtime/engines/modern/skin/segmented.css` (bindings en `manifest/families/primitive/navigation/segmented.json`).

### Unidad 2 — PatternDataTable

- **Engine modern:** `packages/core/src/ui/patterns/data/data-table/engines/modern/index.tsx` (**2684 líneas**), `<table>` nativo estilado por tokens (docblock :4-11), sin librería de grid. Submódulos: `cell-editor/index.tsx`, `presentation/table/index.tsx`, `presentation/table/mobile-cards/index.tsx` (la proyección mobile del canary), `runtime/{grouping,inline-editing,row-resolution,state}/index.ts`. **8 sitios `style={{`, todos geométricos data-driven** (widths/min/max de columnas, offsets de pinning, spacers de virtual scroll: :1421-1425, :1680-1683, :2152, :2499) — cubo (a) del censo, no pintura.
- **Skins:** `runtime/engines/modern/skin/data-table.css` (**2402 líneas**, 129 canales únicos; `--ds-table-*` 125, `--ds-motion-*` 117, `--ds-color-*` 115; 243 lecturas con fallback; 121 px literales) + presentation `data-table-actions.css` (29), `data-table-interactions.css` (206), `data-table-mobile.css` (591), `cell-renderers.css` (bindings del manifest).
- **Hardcode vivo — el peor del corpus:** `data-table.css` es el **cluster C1** del censo (`hardcode-census-top5.md:82-87`): **52 canales clase B** (3 color / 48 geometría / 1 otro), incluyendo `--ds-density-factor-compact, 0.85` (:157,184) y `--ds-density-factor-spacious, 1.15` (:168,194) — los factores del dial `density.mode` duplicados como literales sin productor. Corrección candidata ya escrita: que el CONTROL los emita (declaredOutputs de `density.mode`), no que el skin los declare.
- **Iconos:** el engine importa del **catálogo de compatibilidad** (`../../../../../../graphics/icons`, :37-51 — barrel declarado "compatibility catalog… do not use for new roles" en `graphics/icons/index.ts:14-15`). `iconGovernanceContract.forbidden` prohíbe nuevos roles por ese camino; el drain de iconos existentes es parte del craft de la unidad.

### Unidad 3 — AppShell

- **Source:** `packages/core/src/ui/structures/shell/app-shell/index.tsx` (**450 líneas, archivo único, sin split de engines**). Postura por breakpoints (`useBreakpoints` → `phone/tablet/desktop`, :130-132); drawer compacto compartido phone/tablet vía la primitiva `Sheet` (:45); geometría por `--ds-shell-*` con defaults de `SHELL_DEFAULTS`; **8 custom properties inline declaradas como "FUNCTIONAL wiring, not paint"** (:284-307: safe-area `env()`, heights resueltos, transición de colapso) — forma permitida y documentada, no deuda. i18n por `useOptionalTranslation` con piso inglés byte-idéntico (:159-171); drawer resuelve lado físico por dirección RTL (:177-178). Target táctil 44px forzado en el header del drawer (:229).
- **Skin:** `presentation/components/skin/app-shell.css` (562 líneas, 80 canales únicos: `--ds-shell-*` 62, `--ds-spacing-*` 32, `--ds-color-*` 17, `--ds-motion-*` 12, `--ds-sidebar-*` 9; 77 lecturas con fallback; 62 px). **No aparece** en el top-25 clase B del censo.
- **BottomTabBar:** `structures/shell/bottom-tab-bar/` + `presentation/components/skin/bottom-tab-bar.css` (bindings del manifest).

---

## 3. Cobertura de escena existente y gaps contra la matriz R1

Grounds del lab (`ground/index.tsx`): `bithire` (static BrandTheme, :71-99) y `the-management` (DB TenantThemeDocument compilado por request, :110-171). Eje locale cerrado `en/es/ar` (:62) con segmentos `bithire-es/` y `bithire-ar/` — **solo sobre el ground static; no existen segmentos locale para el ground DB** (verificado: `the-management/` tiene 24 escenas, ninguna variante es/ar). `ar` es el único documento RTL completo (dir derivado del locale, :55-60).

### Unidad 1 — escena `control` (la mejor cubierta de las tres)

- **Qué renderiza** (`sections/control/index.tsx`, 205 líneas): grammar strip de 6 variantes (`primary/secondary/outline/ghost/danger/link`, :53-60), escala sm/md/lg (:62-72), Segmented 2/3/5 opciones (:77-103), joinery fused vs gapped (`Button.Group connected`, :108-118), fila de estados (rest/**focus real**/disabled/loading/pending, :121-135), viñeta action-bar con heading + Segmented + 3 acciones (:138-171), y content torture con etiqueta larga, español, árabe-RTL y token irrompible, cada una en contenedor acotado (:181-202; fixture `TORTURE_CONTENT` en `chrome/index.tsx:108-112`).
- **Rutas existentes:** `bithire/control`, `the-management/control`, `bithire-es/control`, `bithire-ar/control` (las cuatro verificadas en disco).
- **Gaps contra la matriz R1:**
  - **Estados:** sin `data-tone` quiet-destructive (danger+quiet), sin `icon-only`, sin `selected/aria-pressed`, sin `full-width`, sin hover/pressed capturados como estados (solo focus es real vía harness; el `useEffect` focus de :37-47 es best-effort y el propio comentario :26-36 declara que no sobrevive a captura — depende de `capture-lab.mjs`, hoy **recibo congelado histórico** en `R1/receipts/capture-lab.mjs`, no herramienta viva).
  - **Anchos:** el docblock (:9) nombra 320/390/768/1440; el harness F4C captura 390/768/**1280** (`F4C/README.md:73`) — **320 y 1440 no tienen productor vivo** en el harness actual.
  - **Locales:** EN cubierto en ambos grounds; ES/AR solo en ground static (bithire-es/ar). **Ground DB sin locales.**
  - **static/DB:** cubierto (bithire vs the-management).
  - **negative controls:** ninguna escena declara hoy qué NO debe moverse cuando cambia un dial (el harness F4C lo tiene para status-seeds; la escena control no está en la matriz F4C).

### Unidad 2 — PatternDataTable (cobertura casi nula en el lab)

- **Qué renderiza hoy:** una sola escena, `r2-behavior?only=celleditorerror` (`sections/r2-behavior/index.tsx:1478-1503`): **1 fila, 2 columnas**, engine modern fijo, y su propósito es comportamiento (un save de checkbox rechazado se anuncia), no craft. Es la **única** aparición de PatternDataTable en todo `ds-reference` (grep verificado).
- **Rutas:** `bithire/r2-behavior` y `the-management/r2-behavior` (EN solamente; sin es/ar).
- **Escenas ricas existen FUERA del lab y no son consumibles:** `components/torture-sections/data-table/index.tsx` (95-128: con datos, `loading`, empty) y `app/probe/wl-canary/page.tsx:565` — la ley del ground prohíbe importar el torture harness (`ground/index.tsx:17-20`) y R1 exige que la evidencia salga solo de `/probe/ds-reference` (`rounds/index.json` R1 `scope.referenceLabLaw`).
- **Gaps:** todo lo que define al patrón según `OWNERSHIP.md` está sin escena: **sorting, filtering, pagination, selection/bulk-bar, recetas (minimal/ruled/grid/zebra/editorial), empty/loading/error, grouping, virtualización, inline-edit completo, column resize/reorder/pinning, densidades, y la proyección mobile-card** (`presentation/table/mobile-cards/`) — que es justo el nombre del canary. Contenido largo por celda solo existe para la Table primitiva en `display-collections` (:37-49), no para el patrón.

### Unidad 3 — AppShell (cobertura decorativa, no funcional)

- **Qué renderiza hoy:** `r4-structures?only=app-shell` → `<AppShell children="Page content" />` (`sections/r4-structures/index.tsx:141-142`) — **sin sidebar, sin header, sin collapse, sin footer**: el shell no ejercita ninguna de sus anatomías declaradas. Y la escena lo monta **×3 engines** (`ENGINES = ['modern','classic','rustic']`, :57,155-161) — clásico y rústico son read-only por fence y contaminan el frame (ver §4, captura dashboard).
- **Rutas:** `bithire/r4-structures` y `the-management/r4-structures` (EN solamente; 404 fail-closed sin `?only=` válido — `bithire/r4-structures/page.tsx`).
- **Gaps:** postura phone/tablet (drawer compacto, `Sheet`), collapsed desktop, safe-area/bottom-inset, skip-link, i18n de chrome (`appShell.navigation.*`), RTL del drawer (:177-178), BottomTabBar con badge, y composición con contenido real (una tabla dentro del main-area es el caso de producto que el owner quiere ver). BottomTabBar sí tiene escena propia mínima en `r4-structures?only=bottom-tab-bar` (:143-144), también ×3 engines y sin estados.

---

## 4. Defectos visuales conocidos (capturas F4C inspeccionadas + deuda escrita)

Veredicto de cierre F4C: CAUSAL PASS + STATIC/DB PATH CERTIFIED + RESTORE CERTIFIED, **AESTHETIC NOT_ACCEPTED** (`F4C/README.md:461-463`). Inspeccioné 5 PNG de `F4C/phase-A/captures/` con lectura de imagen; defectos concretos visibles:

1. **`A-bithire-labels-1280.png`** (contiene Buttons: `display-labels/index.tsx:77-84,175-182`): (a) el tooltip forzado-visible "Assigned two days ago" **solapa el rótulo de eje** de su propia sección ("…MENT, FORCED VISIBLE" queda tapado) y un segundo tooltip tapa "…ED VISIBLE" — la deuda de posicionamiento no determinista ya asentada (`F4C/README.md:479-482`) es **visible y presentable-mal**, no solo flaky; (b) el dot del Badge sobre el botón "Live feed" flota despegado de la esquina; (c) avatares "SL"/"JD" del grupo se solapan entre sí; (d) gran región muerta entre la sección KBD y los tooltips.
2. **`A-the-management-workbench-1280.png`** (contiene las acciones `Edit`/`Archive` del surface, `r6-surfaces/config-b.tsx:175-177`): contenido **pegado al borde del viewport** (el título "Ravi Desai" arranca en x=0, sin padding de página), hairline de tabs a sangre completa, y **~60% del frame vacío** bajo el fold — veto `unjustified-dead-space-or-empty-track` y `outline-only-surface-without-anatomy` del catálogo (`visual-craft/index.json` `hardVisualVetoes`).
3. **`A-bithire-dashboard-1280.png`**: página de **9983px de alto** — las 8 familias repetidas ×3 bandas de engine; las bandas classic/rustic salen lavadas/fantasma; cavidades enormes entre bandas. Es la escena `r4-structures` completa: prueba de que cualquier captura de AppShell por esta ruta arrastra el mismo defecto de marco.
4. **`A-bithire-alert-390.png`**: el contenido ocupa ~200px de 900; el trigger "Swap message" se lee como texto pelado sin cromo de botón; el resto es espacio muerto.
5. **`A-the-management-feedback-768.png`**: la más sana; la Alert árabe RTL compone, pero el título "خطأ" queda en una posición ambigua sobre el botón de cierre (zona de esquina superior derecha con dos elementos compitiendo).

Deuda escrita relevante (no de capturas): tooltip forzado no determinista entre lanzamientos (`F4C/README.md:391-406,479-482`); filas de ruido medido dentro de tolerancia en `dashboard/bithire/768` (155px Δ2) y `workbench/bithire/390` (8px Δ1) (`F4C/README.md:444,446`); propagación parcial pre-declarada de `--ds-color-success-{bg,border,ink}` y alphas (`F4C/README.md:465-470`) — **COH-1 la cierra y pisa canales que las tres unidades consumen** (badge/tag en escenas con botones, celdas status de la tabla, status del shell).

---

## 5. Criterio de DONE por unidad

Ley aplicable: "A family is DONE" (`README.md:192-205`), fórmula de elegibilidad (`quality-rubric/index.json` `eligibility.formula`: binaryContractsPass && hardVetoCount===0 && craftScore>=layerThreshold && criticalDimensionsMin>=4 && resilience===1 && canonClosure===1 && evidenceFresh && DT sighted), ley de checkpoint (`visual-craft/index.json` `checkpointPolicy`: 3 familias de calibración, DT GO explícito antes de propagar) y piso de estrés (`quality-rubric/index.json` `stressMatrix`). `calibrationFamilyCount: 3` — **estas tres unidades SON la cohorte de calibración**: nadie propaga nada hasta su DT GO.

### Checklist común a las tres unidades

- [ ] Identidad y ownership resueltos a family id(s) canónicos (§1) y write-set declarado por lane (`rounds/index.json` R1 `writeDomains`: family-source / reference-lab / observable-tests / i18n-catalogs / round-evidence).
- [ ] Escena(s) del lab en `/probe/ds-reference` con readiness `data-testid` propio, fail-closed (`?only=` válido o 404, patrón de `r4-structures/page.tsx`), **solo engine modern en el frame** (nada de bandas classic/rustic en escenas de craft — lección de la captura dashboard §4.3).
- [ ] **Anchos:** 390/768/1440 (mandato owner) + 320 (piso de `stressMatrix.viewportsPx` y docblock de la escena control); contenedores estrechos 280/320/480 donde la unidad viva en uno (tabla en panel, shell en embed).
- [ ] **Locales:** EN en ambos grounds; ES y AR donde aplique — hoy exige **crear los segmentos de ruta** (no existen es/ar para r2-behavior ni r4-structures; no existe ground DB con locale — gap estructural a decidir: ¿se crea `the-management-es/ar` o el eje locale se certifica solo sobre static con razón escrita?).
- [ ] **Estados completos** de la anatomía declarada en el manifest (button: 12 estados :53-65; data-table: 24; app-shell: 6), con focus **real** tomado por el harness (contrato FOCUS del comentario `control/index.tsx:26-36`), hover/pressed capturados, teclado (tab order, skip-link en shell, operación de tabla por teclado).
- [ ] **Contenido largo:** `TORTURE_CONTENT` (long/es/ar/unbroken, `chrome/index.tsx:108-112`) dentro de la unidad, no en una fila aparte.
- [ ] **static BrandTheme + DB TenantTheme** en la misma corrida, con digest del artifact registrado por fila (precedente F4C).
- [ ] **Negative controls nombrados por escena** (qué no debe moverse) y drills que muerden (precedente: 5 drills F4C `F4C/README.md:226-237`).
- [ ] **Cero vetos duros** aplicables de los 24 (`visual-craft/index.json` `hardVisualVetoes` — el veto `current-tenant-palette-retained-without-r1-sighted-readjudication` quedó retirado por la enmienda del owner 2026-08-30, que difirió la readjudicación de paletas — para estas unidades muerden sobre todo: `random-pill-proliferation`, `unjustified-dead-space-or-empty-track`, `content-overlap-clipping-or-per-character-wrap`, `state-expressed-by-abrupt-color-or-outline-alone`, `desktop-composition-compressed-into-mobile`, `stacked-header-strips-without-one-dominant-information-hierarchy`) y **pisos mecánicos** (`mechanicalFloors`: target coarse 44px, alturas de control 36/32/44, texto ≥13px, micro-label ≥11px).
- [ ] Capturas limpias presentables al owner: sin overlap, sin clipping, sin pills indiscriminadas, sin espacios muertos; tooltip forzado estabilizado o fuera de escena (deuda F4C viva).
- [ ] Evidencia ligada a source/artifact hashes congelados; veredicto sighted final de Kimi K3 (DT) con auditoría de cierre Fable 5 (`README.md:204-205`).

### Checklist específico por unidad

**Button/action cluster:** las 6 variantes × 3 tamaños × estados; joinery `Button.Group` (connected/gapped) con radios anidados coherentes; quiet-destructive (`data-tone`); icon-only con nombre accesible; acuerdo de gramática Button↔Segmented (la pregunta 2 de la escena, `control/index.tsx:11-13`); focus-ring único sin competencia de bordes (`competingEmphasizedEdgeTreatmentsPerControl: 1`).

**PatternDataTable:** matriz de recetas (minimal/ruled/grid/zebra/editorial) × densidades × estados (loading/empty/error/selección/bulk-bar/editing/saving) × anchos, con **proyección mobile-card capturada a 390** (es el nombre del canary: `presentation/table/mobile-cards/index.tsx`); contenido largo en celda con reveal path (precedente `cellreveal`, `r2-behavior/index.tsx:1463-1475`); pinned/resize/reorder sin overlap; paginación y toolbar reales; zéro hardcodes clase B del cluster C1 en el write-set o adjudicación escrita de los 52 (`hardcode-census-top5.md:82-87`).

**AppShell:** sidebar+header+footer completos; collapsed desktop vs drawer compacto phone/tablet (nunca hereda collapsed, docblock :7-9); skip-link como primer tab stop; safe-area/bottom-inset; BottomTabBar con badge a 390; RTL: drawer desde el borde inline-start físico correcto (:177-178); i18n de chrome (`appShell.navigation.*`, piso inglés); una composición con contenido real en main-area (tabla o record) para probar que el marco no deja cavidades.

### Evidence receipts y comandos que los producen

- **Constitución íntegra:** `node packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs` y `program-check.test.mjs` (hoy rojo solo por receipts F4B stale pre-existentes — `checkpoint/index.json:4`; no introducir nuevos rojos).
- **Capturas por fases con restore:** el harness vivo es `packages/showroom/scripts/f4c-canary-capture.mjs` (matriz fija de 9 escenas de status-seeds; **no cubre estas unidades** — extenderlo o crear el harness de unidad es trabajo del lane lab/quality-integrator). Comandos precedentes: `node …/f4c-canary-capture.mjs <dir> --phase A|B|C|D|E`, `--compare <A> <B>`, `--check`, `--drill <nombre>`; requieren `pnpm -C packages/showroom dev` en :7001 (`F4C/README.md:49-63`). Prerrequisito de determinismo ya escrito: reducedMotion, fonts.ready + doble rAF, viewport fijo, identidad del servidor (`F4C/README.md:250-263`).
- **Gates de cascada por lote:** `node packages/core/scripts/engine/cascade-wiring-ratchet/index.mjs` (debe bajar, nunca subir), `token-audit --check`, `root-membership --check` (exige dist fresco — hoy se niega fail-closed por dist rancio, `hardcode-census-top5.md:26`), suites `cascade-producers`/`cascade-extract` (`hardcode-census-top5.md:137`).
- **Receipts de checkpoint R1** (`evidence-contract/index.json` `checkpointRequiredFields`): `checkpoint.json`, `visual-craft.json`, pares before/after por familia representativa en ambos tenants, una captura mobile/estrecha por familia, receipts de CSS ownership y causalidad static-DB, reporte de vetos/pisos, y el **DT GO o lista de corrección** — layout en `R1/` con `manifest.json` + `SHA256SUMS` (precedente congelado: `R1/manifest.json`).
- **Manifiestos de familia:** las celdas `themeControls` de los manifests de §1 deben salir de `UNKNOWN` con disposition por control (`APPLICABLE`/`INVARIANT_WITH_REASON`/`NOT_APPLICABLE_WITH_REASON` con prueba negativa source-bound, `README.md:140-145`).

---

## 6. Riesgos y secuencia

### Lo que Opus (dirección artística) debe decidir ANTES de que un writer toque source

1. **La gramática de acción del cluster Button** (jerarquía primary/secondary/outline/ghost/danger/link, edge, material, quiet-destructive) — es la decisión de la que heredan tabla (acciones de fila/bulk-bar) y shell (chrome actions). Sin ella, cualquier captura es otro NOT_ACCEPTED.
2. **La gramática de densidad y recetas de PatternDataTable**, incluyendo la adjudicación de los `--ds-density-factor-*` (¿los emite `density.mode` como declaredOutputs? — respuesta de contrato, no de skin) y el destino de los 52 canales clase B del cluster C1, **con paridad de valor probada en los 3 verticales** antes de cualquier sustitución (Mechanical-lane safety law, `README.md:351-360`; prohibido declarar nombres que hoy solo existen en fallbacks).
3. **La gramática de chrome del AppShell** (qué es dominante: sidebar vs header vs contenido; un boundary owner por región; postura mobile recomposed, no "desktop estrechado" — veto `desktop-composition-compressed-into-mobile`).
4. **Dirección de tenant same-tree:** RETIRADA por la enmienda del owner (2026-08-30): los verticales son fixtures de prueba; NO hay dirección estética que diseñar para ellos en esta etapa (los nombres "Professional Network Hiring OS" / "Monochrome Executive Ledger" ya no son una obligación — ver cabecera de corrección arriba). Lo que Opus decide en su lugar: la gramática del DS que las mutaciones de controles deben demostrar de forma observable entre los dos fixtures (divergencia ≥8 ejes, ≥6 no-color, sigue en `rounds/index.json` R1 como propiedad de la prueba, no como meta estética).
5. **Política de pills** (`random-pill-proliferation` es veto duro; `bindingCraftLaws`: pills limitadas a status/filtros/identidad compacta/acciones cápsula) y **mapa de roles de iconos** para la tabla (hoy importa del catálogo de compatibilidad, `graphics/icons/index.ts:14-15` vs `iconGovernanceContract`).
6. **Bloqueos asentados que NO se reabren en el lote:** `control.size ↔ density.mode` (T-1), `--ds-input-md-line-height` de bithire (owner, recomendación DT preservar 1.5385) — `checkpoint/index.json:4`.

### Lo que Sonnet puede preparar mecánicamente (sin tocar source de producto)

- Escaffolding de escenas del lab (lane `reference-lab`): rutas `?only=` fail-closed, `data-testid` de readiness, fixtures de datos realistas (tabla con N filas, estados, contenido largo), segmentos es/ar faltantes — todo contra la gramática ya adjudicada, sin decisiones de diseño.
- Tablas de sustitución para el censo C1 **solo tras** paridad de valor medida; medición read-only de canales por familia; matriz de capturas y nombres de archivo; plumbing de receipts (sin hand-edit: "No generated artifact, baseline or evidence receipt is hand-edited", `README.md:447`).
- Actualización de las celdas UNKNOWN de los manifests solo cuando la evidencia exista — nunca por adelantado.

### Orden sugerido de las tres unidades

**Button → PatternDataTable → AppShell**, que es además el orden ya legislado (`rounds/index.json` R1 `objectives`: "attack Button then PatternDataTable then AppShell as the first-failing grammar sequence"). Razones medidas:

1. **Button primero:** blast radius mínimo (1 skin principal sin clase B top-25, 0 inline paint, witness ya COMPUTED_VERIFIED de palette.seeds) y es la gramática que las otras dos **componen** — la tabla renderiza Buttons por dentro (`engines/modern/index.tsx:57`) y el shell tiene acciones de chrome. Calibrar la acción primero evita re-capturar las otras dos cuando cambie el botón (`checkpointPolicy.restartLaw`: cambiar gramática compartida tras calibración invalida receipts dependientes).
2. **PatternDataTable segundo:** es la mayor deuda de skin medida del corpus (C1, 52 canales) y la unidad con menos cobertura de escena (1 fila/2 columnas hoy); necesita la gramática de Button cerrada (acciones) y la fórmula COH-1 de tints status **ya mergeada** (sus celdas status son consumidoras directas de `--ds-color-{tone}-{bg,border,ink}` — colisión de write-set si corren en paralelo).
3. **AppShell tercero:** compone todo lo anterior (nav, acciones, contenido real) y su DONE exige que la gramática de acción y superficie ya esté estabilizada; además su escena actual es la más vacía (sin sidebar/header), así que el delta de trabajo de escena es el mayor y no debe bloquear a las otras.

**Riesgo de calendario explícito:** COH-1 (derivación de tints status, compilador-only, fórmula ya adjudicada en `scouts/coh-1-opus-formula-review.md`) toca los canales que badge/tag/status-cells consumen. Secuencia recomendada: COH-1 cierra primero (está en remediación activa), luego R1 unidad 1 arranca; si R1-U1 captura badges con status antes del cierre COH-1, esas capturas nacen stale por la misma `restartLaw`.

**Riesgos de instrumento heredados de F4C:** tooltip forzado no determinista (estabilizar la escena o excluirla), ruido de rasterizado medido en `dashboard`/`workbench` (tolerancias ya calibradas), `--check` exige corridas completas (DEFECT-2 remediado), y el oráculo de CSS servido del ground static se mueve con HMR en dev (`F4C/README.md:311-316`) — las corridas de evidencia deben ir contra servidor estable con identidad de proceso registrada.

---

## Apéndice — comandos de reproducción de este scout

```bash
cd /Users/daniel/Developer/Rottay/ui-design-system
git rev-parse --short=8 HEAD        # b682164f6
# Inventario y manifests
python3 - <<'EOF'
import json
inv = json.load(open('packages/core/scripts/quality-evidence/programs/modern-rescue/family-inventory/index.json'))
print(len(inv['rows']))  # 255
for f in ['primitive/inputs/button','pattern/data/pattern-data-table','structure/shell/app-shell']:
    d = json.load(open(f'packages/core/manifest/families/{f}.json'))
    print(f, d['review']['verdict'], [ (t['controlId'], t['disposition']) for t in d['themeControls'] ][:3])
EOF
# Única aparición de PatternDataTable / AppShell en el lab
grep -rn "PatternDataTable\|AppShell" packages/showroom/src/app/probe/ds-reference/sections/
# Conteos de canales por skin (método: grep -o 'var(--ds-' | sort -u | wc -l)
grep -o 'var(--ds-[a-z0-9-]*' packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/button.css | sort -u | wc -l   # 252
grep -c 'style={{' packages/core/src/ui/primitives/inputs/Button/engines/modern/index.tsx                                        # 0
grep -c 'style={{' packages/core/src/ui/patterns/data/data-table/engines/modern/index.tsx                                        # 8
```

Citas `archivo:línea` verificadas una a una contra HEAD `b682164f6` el 2026-08-30. Las 5 capturas de §4 fueron leídas como imagen, no inferidas de nombres de archivo.
