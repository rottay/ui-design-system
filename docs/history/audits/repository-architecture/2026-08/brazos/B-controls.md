# B — Palanca de los controles y ergonomía de producto — 10 ópticas (11-20)

Auditor: brazo B (read-only). Fecha 2026-08-28. Repo: `ui-design-system` (worktree local, sin tocar).

## Alcance de mis mediciones (para que cada número tenga scope)

- **M1 · lectores declarados**: para los canales de `manifest/controls/<id>.json#declaredOutputs.channels`, cuento archivos que contienen `var(<canal>` en `src/foundation/tokens/css/runtime/engines/modern/skin/*.css` (123) + `src/foundation/tokens/css/presentation/components/skin/*.css` (157). Script: `scratchpad/reaud-B-leverage.py`.
- **M2 · cierre transitivo CSS**: grafo `--Y → --X` cuando `--X: … var(--Y) …` en los 473 `src/**/*.css`; desde los canales declarados, cierre hacia adelante, y cuento archivos skin que leen cualquier canal del cierre. Script: `scratchpad/reaud-B-closure.py`. **No sigue derivaciones en TS** (es un piso, no un techo).
  - Control positivo: el cierre de `density.mode` contiene `--ds-density-effective-scale`, `--ds-spacing-4`, `--ds-spacing-16` y **no** contiene `--ds-color-primary` ni `--ds-radius-md` (sin falsos positivos).
  - Control negativo: el cierre completo de `shape.button-style` es `['--ds-radius-button','--radius-field']` — dos nombres, y `--radius-field` tiene **0 lectores** (`rg 'var\(--radius-field' src/` → vacío).
- **M3 · censo del programa**: `scripts/tokens/customization-surface-census/customization-surface-report.json` — cuenta **ocurrencias** (no archivos), css+ts. Es la fuente de la columna "lecturas vivas" del catálogo.
- **M4 · esquema real**: importo `packages/core/dist/index.js` y recorro `TENANT_THEME_CONFIG_SCHEMA.documents.{simple,advanced}` hasta las hojas.

---

## Puntaje por óptica

| # | Óptica | Puntaje 0-5 | Evidencia (1 línea) |
|---|---|---|---|
| 11 | Palanca real por control | **2** | La columna "lecturas vivas" mide canales *declarados*, y el propio contrato dice que son "never an exhaustive list" (`capabilities/index.ts:56`): `density.mode` publica 8 y su canal real (`--ds-density-effective-scale`) tiene 329 lecturas; `shape.button-style` publica 2 y su cierre pinta **0** archivos skin. |
| 12 | Ortogonalidad | **2** | El gate Jaccard existe (`manifest/rules/index.mjs:816-836`) pero es **inerte por construcción**: sólo consume celdas `APPLICABLE` (`generator/index.mjs:718-721`) y hay 0 APPLICABLE de 5100. Mi medición sobre cierres da 2 pares > 0.80 y ningún control declara `independentSemanticInvariant`. |
| 13 | Modelo objetivo 9+7 vs 13+7 | **1** | `targetControlModel.implementationState: "PROPOSED_NOT_IMPLEMENTED"`; 4 de los 16 ids objetivo (`focus.identity`, `type.weight`, `control.size`, `motion.character`) **no existen como canal ni como dial en ningún tier** — sólo como 20+20+104+15 campos crudos por familia. |
| 14 | `control.size` / size configurable | **1** | No hay dial de tamaño a nivel tenant en ningún tier. `data-size` es instancia (71 archivos skin) y funciona bien; a nivel tenant hay 104 campos `chrome.*.{xs,sm,md,lg,xl}.*` crudos. "Todos mis inputs son lg" **no es expresable**. |
| 15 | Familia + intensidad | **2** | De 2212 hojas del documento `advanced`, **2080 son `visual-value` de texto libre (94%)** y sólo **23 son enums cerrados**. `pro.groupEmphasis` (quiet/balanced/assertive/hero) **no existe en el esquema**. |
| 16 | Expert allowlist 290 / 200 overrides | **2** | Mediana de **2 archivos CSS** por token de la allowlist; 155/290 mueven ≤2 archivos. El "browser de dominios con preview" existe a medias en `app-platform` (Select de 48 familias chrome + filtro de texto + iframe compilado) pero ignora la clasificación por dominio y muestra los 290 tokens como lista plana. El `BrandStudio` del DS lo consume **sólo el showroom**. |
| 17 | Recipe groups 3 vs 14 | **2** | 2 de 3 grupos son `OPERATIONAL_SOURCE_BOUND`; el tercero — `collection-card-anatomy`, justo el de "cards genéricas" — es `PROPOSED_NOT_OPERATIONAL`. Y `recipe-profile` **no llega al runtime en los 3 verticales estáticos** (el provider descarta `appearance`). |
| 18 | Art direction (12 requiredGroups) | **3** | Contrato real y R1 ejecutado con captura y medición: 9 ejes divergentes, 8 no-color, 0 silenciosos. Pero **2 de los 9 ejes no tienen portador en producción** (`--ds-recipe-profile` 0 lectores; `data-anatomy-*` sin emisor en las 3 apps) → el piso de 6 ejes no-color queda sin margen. R1 = `IMPLEMENTED_PENDING_CODEX_AUDIT`, NO GO en la primera vuelta. |
| 19 | Experiencia del editor | **1** | **0 de 20** controles llevan `editorMetadata` (group/order/labelKey/helpKey/controlKind/previewFixtures), y el campo ni siquiera está en `manifest/schema.json#segments.control`. `app-platform` deriva las etiquetas mecánicamente con `humanizeKey()` sobre la clave del esquema. Cero i18n, cero help, cero defaults explicados. |
| 20 | Veredicto: ¿dos proyectos distintos? | **2** | Sí, pero **no con los diales**: el tenant de referencia DB necesita **37 `tokenOverrides` crudos** (54% de sus 68 valores autorados) y cada vertical estático autora ~289-508 hojas `chrome.*`. La divergencia medida cubre 349 de 1301 canales (27%). |

---

## Hallazgos (ordenados por severidad)

### H-B-1 · BLOQUEANTE · `shape.button-style` es un Standard con palanca CERO: escribe un canal que el Button moderno no lee

- **Qué**: el control emite únicamente `--ds-radius-button` (`appearance-posture/index.ts:145-154`, sólo bajo `if (posture.buttonStyle)`). El skin moderno del Button **nunca** lo lee: pinta `--_ds-button-resolved-radius: var(--ds-button-md-radius, var(--ds-radius-md))` (`skin/button.css:73,364`). Los dos únicos lectores de `--ds-radius-button` son `framework-token-projection.css:43` (`--radius-field`, que tiene **0 lectores**) y el token TS muerto `borders.button` (`tokens/ts/foundation/base/borders/index.ts:35`).
- **Evidencia**:
  - `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/button.css:73`
  - `packages/core/src/infrastructure/compilers/kernel/foundation/css/appearance-posture/index.ts:145-154`
  - `rg 'var\(--radius-field' src/` → vacío (control positivo: la misma búsqueda encuentra `var(--ds-radius-button` en 1 archivo).
  - El repo lo **documenta**: `src/tooling/resolution-probe/foundation/roster/fixtures.json:171` — *"la rama buttonStyle escribe sólo --ds-radius-button, nunca los hermanos por tamaño… un paint chain que el dial no alcanza"*.
  - Sólo la puerta ESTÁTICA `chrome.controls.buttonGeometry.radius` escribe los hermanos por tamaño (`chrome-variables/index.ts:1740-1745`), y eso es otro control (`chrome.families`).
- **Agravante**: el `productiveConsumerWitness` del registro (`capabilities/index.ts:279-281`) cita `button.css` con símbolo `var(--ds-button-md-radius` — **un canal que este control no escribe**. Por eso el gate `controls-catalog --check`, que falla ante "canales con CERO lecturas *y sin consumer probado*", lo deja pasar: la coartada es un testigo que apunta a otra cadena.
- **Impacto**: uno de los 13 diales Standard — precisamente el que un PM tocaría primero ("silueta del botón") — no cambia nada por la puerta DB. Y la excepción escondida es que el efecto medido en R1 (`--ds-radius-button` 9px vs 2px) proviene del artefacto del vertical, no del dial del tenant.
- **Optimización**: hacer que la rama `buttonStyle` escriba también `--ds-button-{xs,sm,md,lg,xl}-radius` (como ya hace `chrome-variables:1742-1746`), o retirar el control y plegar la silueta dentro de `profiles.expressive.geometry`. Y corregir el `evidence.symbol` a un literal que el canal declarado realmente alcance — hoy es un testigo falso que neutraliza el gate.

### H-B-2 · BLOQUEANTE · El gate de ortogonalidad es inerte por construcción, y hay 2 pares por encima de su propio techo

- **Qué**: `validateControlOrthogonality` compara pares `<familyId>::<propertyGroup>` de celdas `APPLICABLE`. El manifest tiene **5100/5100 celdas UNKNOWN, 0 APPLICABLE** (`manifest/index.json#rollups.controlFamilyDispositions`). El filtro `.filter(([, set]) => set.size > 0)` deja la lista vacía → el gate no evalúa ni un par. No es un bug: el comentario lo declara ("The rule is INERT while no control has an APPLICABLE row"). Pero significa que **la ley de ortogonalidad no ha detenido nada nunca**.
- **Evidencia**: `packages/core/manifest/rules/index.mjs:816-836`; `packages/core/manifest/generator/index.mjs:718-721`; rollup en `packages/core/manifest/index.json`.
- **Mi medición independiente** (Jaccard sobre cierre transitivo de canales, M2):
  - `profiles.expressive` × `shape.radius-scale` → **J = 0.874** (|A|=159, |B|=139, ∩=139). Sobre conjuntos de archivos: **J = 1.000** (266 vs 266). Causa: ambos gobiernan `--ds-radius-scale`; el compilador resuelve `dial → si no, perfil geometry → si no, 1` (`brand-theme/index.ts:1888-1903`). Es precedencia legítima, pero son **un canal con dos IDs públicos en dos tiers**.
  - `typography.families` × `typography.pairing` → **J = 0.806** (canales), 0.800 (archivos). `pairing` es el preset que expande a `families`; ambos escriben `--ds-font-family-{base,heading}`.
  - Ningún control de los 20 declara `independentSemanticInvariant` (el campo `optional` de `manifest/schema.json#segments.control`) → si el gate estuviera vivo, ambos pares serían errores hoy.
- **Sobre `density.mode` vs `spacing.rhythm`**: J = 0.167 sobre cierres; **no** se pisan. La separación está genuinamente construida (`themes/default.css:665-690`: density multiplica el ramp `--ds-spacing-*`, rhythm sólo se aplica en el punto de uso sobre relaciones de layout). Pero la asimetría de palanca es brutal: density alcanza **203 archivos skin**, rhythm **14**. Un dial Standard que mueve 14 archivos al lado de uno que mueve 203 no es un par ortogonal, es un dial y un ajuste fino.
- **Sobre `experience.profile` / `profiles.expressive` / `recipe-profile`**: **no** son tres nombres de una idea; son 2 + 1. `experience.profile` y `profiles.expressive` son el mismo sistema de 7 ejes (preset vs override por eje, misma función de expansión `expressive-profiles/expansion/index.ts`). `recipe-profile` es un vocabulario distinto (props por defecto de componente, TS, no canales CSS). Contarlos como 3 capacidades infla el presupuesto de 13+7.
- **Optimización**: (a) fusionar `typography.families` dentro de `typography.pairing` como "pairing + stacks explícitos" (una capacidad, dos formas de autoría); (b) declarar `independentSemanticInvariant` en `shape.radius-scale` explicando la precedencia dial>perfil, o plegarlo dentro de `profiles.expressive.geometry`; (c) hacer que el gate no dependa de APPLICABLE — medir el Jaccard sobre el **cierre de canales**, que es derivable hoy sin esperar a F9.

### H-B-3 · ALTO · `recipe-profile` no llega al runtime por la puerta estática: el vertical elige un perfil y no se aplica

- **Qué**: `bithire` selecciona `recipes.profile = "rottay/network-professional@1"` (`brand-themes/bithire/index.ts:3168`) — botones `primary` rellenos, cards `elevated`, tabs `underline`, tags `radius:'full'`, tabla `comfortable/minimal`. Nada de eso se aplica. El provider resuelve `codeOwnedConfig ?? buildResolvedRuntimeConfig(...)` (`bootstrap/facade/react/provider/index.tsx:1113`), y `getCodeOwnedRuntimeConfig` **desestructura `appearance` fuera y nunca lo restaura** (`runtime/tenant/foundation/configuration/registry/index.ts:154-162`). El único canal alterno, `CodeOwnedGovernedBehavior`, sólo lleva `motion` y `expressive` (ídem `:55-63`). Resultado: `recipeProfileSelection` = `undefined` para los 3 verticales bundled.
- **Confirmación en la app**: `app-bithire/src/core/providers/index.tsx:203-215` — para un slug bundled pasa `getKnownTenantConfig(...)`, que es exactamente el objeto code-owned que el provider desnuda.
- **El canal CSS tampoco pinta**: `--ds-recipe-profile` tiene **0 lecturas css y 0 ts** (`customization-surface-report.json`, `category: "generated-artifact-only"`). Los 6 consumidores reales (`useRecipeProfileDefaults` en Button, Card, Tabs, Tag, surface-chrome, DataTable) leen la ruta TS, que para bithire llega vacía.
- **Impacto en el objetivo del owner**: rompe la igualdad de transporte estático/DB en una capacidad Pro entera. El tenant DB obtiene recetas por familia; el vertical estático — el "tenant uno" del enunciado — no. Y el eje `recipe-profile` **cuenta como uno de los 9 ejes divergentes de R1** midiendo un canal que no pinta en ninguno de los dos lados.
- **Optimización**: añadir `recipes` a `CodeOwnedGovernedBehavior` (es comportamiento, no CSS: la misma justificación que ya se usó para `motion` y `expressive`), y quitar `--ds-recipe-profile` del set medible de R1 o darle un consumidor real.

### H-B-4 · ALTO · `chrome.anatomy` es inalcanzable en producción: nadie estampa `data-anatomy-*`

- **Qué**: la anatomía está implementada en CSS (las variantes no-default aparecen: card `framed|underline|ghost` en 3 archivos, table `ruled|zebra|open` en 2, sidebar `rail|panel` en 3, layout `flat|floating` en 5) y el compilador proyecta los atributos (`compilers/composition/tenant-theme/index.ts:1319-1341`). Pero **`tenantThemeAnatomyAttributes` no tiene ningún llamador en las 3 apps**: `rg 'tenantThemeAnatomyAttributes' app-bithire/src app-platform/src app-evnto/src` → vacío. Los únicos llamadores son el showroom (`divergence-surface`, `visual-authority-probe`) y el CLI de la resolution-probe.
  - Control positivo: la misma búsqueda **sí** encuentra `tenantThemeArtifactRootAttributes` en `app-evnto/src/core/lib/tenancy/runtime-tenant-theme/ssr/index.ts:46` — o sea, mi grep alcanza el patrón real; la ausencia de anatomía es ausencia, no punto ciego.
- **Impacto**: un tenant puede elegir `anatomy: 'framed'` y el DOM nunca lo lleva. El eje `anatomy` de la medición R1 (4 canales, "divergente") mide el **artefacto compilado**, no el documento pintado.
- **Colateral**: `app-bithire` reimplementa los selectores en su propio CSS (`app-bithire/src/styles/tables-collections.css:523-541`, `app-bithire/src/ui/surfaces/styles/index.css:502`) sin que nadie estampe el atributo → CSS muerto de app que además duplica una ley del DS.
- **Optimización**: estampar `tenantThemeAnatomyAttributes(artifact)` en el mismo seam donde ya se estampa `tenantThemeArtifactRootAttributes` (evnto ya tiene el punto exacto), y llevarlo a las 3 apps en el mismo commit; o bajar `chrome.anatomy` a `frontier` hasta que exista el emisor.

### H-B-5 · ALTO · "Pocas decenas de diales" es falso a nivel de esquema: el documento avanzado tiene 2212 hojas, 2080 de texto libre

- **Qué** (M4, sobre `dist/index.js`):
  - documento `simple`: **38 hojas** (de ellas 22 son hexadecimales crudos de paleta: `palette.foreground.*`, `palette.border.*`, `palette.dark.*`).
  - documento `advanced`: **2212 hojas**, repartidas: `visualFoundation.advanced.chrome` **1875**, `tokenOverrides` **290**, `general.palette` 21, `advanced.profiles` 7, resto 19.
  - Por tipo: **2080 `visual-value` (texto libre)**, 30 `hex-color`, 20 `color`, 9 `font-family`, **48 `number`**, **23 `enum`**.
  - `chrome` tiene **48 familias**; la mayor es `controls` con **607 campos**, luego `cardComponent` 147, `tabs` 115, `badge` 109, `tooltip` 85.
- **Contra el propio modelo**: `customization-model/index.json#pro.productEditorFieldTarget` dice `{minimum:20, maximum:30}` "campos agrupados de siete capacidades". El editor real de `app-platform` recorre el esquema genéricamente, así que el PM ve las 2212.
- **Validación de `visual-value`**: es un filtro de **seguridad** (`isSafeVisualValue`, `compilers/composition/tenant-theme/index.ts:734-752`), no un dominio semántico. Lo único acotado son los caps de `limits` (maxPaddingPx 128, maxRadiusPx 64, maxGapPx 64).
- **Impacto**: es exactamente "cientos de customizaciones" — 1875 de ellas — con nombre de capacidad única (`chrome.families`). El presupuesto declarado (13+7 = 20) describe los **ids**, no la **superficie de autoría**.
- **Optimización**: la clave es que 159 de esos campos crudos son cuatro ideas repetidas 48 veces. Ver H-B-7.

### H-B-6 · ALTO · La columna "lecturas vivas" no es una métrica de palanca y no es comparable entre controles

- **Qué**: `controls-catalog/index.mjs:134-147` suma `report.rows[canal].reads.css + .ts` sobre `cap.derivedChannels`, y ese campo está documentado como **"Representative derived channels, never an exhaustive list"** (`capabilities/index.ts:56`; los manifests lo repiten con `representativeOnly: true`). Resultado: el número mide *qué canal eligió declarar el autor*, no la palanca.
- **Evidencia numérica** (M3, ocurrencias css+ts):

| control | tier | "lecturas vivas" publicadas | canal derivado que el consumidor realmente lee | lecturas reales |
|---|---|---|---|---|
| `density.mode` | standard | **8** (`--ds-density-mode-factor`=2, `--ds-density-scale`=6) | `--ds-density-effective-scale` → todo el ramp `--ds-spacing-*` | **329** (+ `--ds-spacing-4` solo: 308) |
| `spacing.rhythm` | standard | 112 | `--ds-rhythm-effective-scale` | 111 (declarado, correcto) |
| `palette.seeds` | standard | 1930 | `--ds-color-primary` | 1593 (declarado, correcto) |
| `shape.button-style` | standard | 2 | ninguno (H-B-1) | 0 pintados |
| `recipe-profile` | pro | 0 | ninguno en CSS | 0 |

  Dos controles con palanca real comparable publican 8 y 1930 según qué canal declararon.
- **Mi medición de palanca (M1/M2), archivos skin (modern 123 + presentation 157 = 280)**:

| control | tier | archivos por canales declarados (M1) | archivos por cierre transitivo (M2) |
|---|---|---|---|
| `density.mode` | standard | 1 | **203** |
| `palette.seeds` | standard | 184 | **197** |
| `profiles.expressive` | pro | 5 | 179 |
| `shape.radius-scale` | standard | 125 | 179 |
| `token-overrides` | pro | 153 | 174 |
| `typography.scale` | standard | 3 | **170** |
| `surfaces.elevation-posture` | standard | 72 | 108 |
| `typography.families` | standard | 70 | 78 |
| `motion.dial` | standard | 9 | 70 |
| `typography.pairing` | standard | 52 | 60 |
| `experience.profile` | standard | 27 | 49 |
| `surfaces.effect-intensity` | standard | 18 | 28 |
| `spacing.rhythm` | standard | 14 | **14** |
| `chrome.families` | pro | 7 | 8 |
| `navigation.sidebar-tone` | standard | 2 | **3** |
| `shape.button-style` | standard | 0 | **0** |
| `recipe-profile` | pro | 0 | **0** |
| `chrome.anatomy` / `profiles.icon` / `responsive.posture` | pro | 0 (sin canal CSS: viajan como data) | 0 |

- **Controles de palanca casi nula confirmados**: `shape.button-style` (0), `recipe-profile` (0), `navigation.sidebar-tone` (3 archivos skin; sus 6 canales suman 18 ocurrencias en todo el árbol — es el chrome más identitario de una app y su dial toca 3 archivos), `spacing.rhythm` (14, 14× menos que density con el que se lo empareja).
- **Optimización**: cambiar el generador para que la columna sea el **cierre transitivo** (derivable hoy, ver M2) y que el gate `--check` falle cuando el cierre de un control Standard toque menos de N archivos skin. Hoy `--check` sólo falla con "cero lecturas Y sin consumer", y un consumer mal citado (H-B-1) desactiva la comprobación.

### H-B-7 · ALTO · Los 4 diales objetivo que faltan son los que colapsarían ~159 campos crudos

- **Qué** (M4 sobre `documents.advanced`): los ids de `targetControlModel` que no existen ni como canal ni como dial, y su forma actual como campos crudos por familia:

| id objetivo | tier | estado real | superficie cruda que sustituiría |
|---|---|---|---|
| `focus.identity` | standard | **no existe** | 20 campos `chrome.*.focusRing*`. No está en la allowlist Expert (`--ds-focus-ring{,-color,-width,-offset}` → todos OUT). `--ds-focus-ring-color` tiene **106 lecturas css** y `--ds-focus-ring` 58: es de los canales de mayor alcance del sistema y **no tiene dial de ningún tier**. |
| `type.weight` | standard | **no existe** | 20 campos `chrome.*.fontWeight*`. `--ds-font-weight-{body,heading,display}` fuera de la allowlist. |
| `control.size` | pro | **no existe** | 104 campos `chrome.*.{xs,sm,md,lg,xl}.*` (`controlSize` = height/paddingX/paddingY/fontSize/lineHeight/iconSize/gap/radius × 5 tamaños × button/field/segmented). |
| `motion.character` | pro | **no existe** (`migrationState: "PROPOSED_ONLY"`, "no lowering or stop table exists") | 15 campos `chrome.*.{motionEasing,transitionTiming,pulseTiming}`. Ningún easing en la allowlist. |
| `surface.edge` | standard | existe como `profiles.expressive.edge` (5 stops) | `migrationState: "BLOCKED_ON_PRODUCT_ADJUDICATION"` — correcto, la ley prohíbe crear el id público al lado del eje Pro. |
- **Impacto**: 159 campos de texto libre serían 4 enums de 3-4 stops. Es la conversión más directa de "cientos de customizaciones" a "un par de decenas de diales" que queda disponible.
- **Optimización priorizada por radio de impacto medido**:
  1. `focus.identity` (3 stops: `subtle | ring | offset-ring`) → 164 lecturas css, cruza toda familia interactiva. **Mayor palanca por dial de todo el sistema hoy sin gobernar.**
  2. `control.size` (2-3 stops: `compact | md | lg`) → sustituye 104 campos, y es el pedido explícito del owner.
  3. `type.weight` (3 stops: `light | regular | strong`) → 20 campos, y es un eje que sobrevive a escala de grises.
  4. `motion.character` (3 stops: `linear | eased | spring`) → 15 campos; necesita primero consolidar la autoridad (`MotionProfile` + `motion.dial` + `BrandMotion` deprecado).

### H-B-8 · ALTO · Cero metadatos de producto: el editor muestra claves de esquema humanizadas

- **Qué**: `customization-model/index.json#controlImpactContract.editorMetadata` exige `group, order, labelKey, helpKey, controlKind, plan, previewFixtures`. **0 de 20 manifests de control lo llevan**, y `manifest/schema.json#segments.control` no lo lista ni en `required` ni en `optional` — el campo no tiene domicilio.
- **Consecuencia medida en la app**: `app-platform/.../tenant-theme-console/index.tsx:365,381` etiqueta con `humanizeKey(key)` (`model.ts:522-527`: quita `--ds-`, parte por `-_.`, camelCase → espacios, capitaliza la inicial). El PM ve "Effect Intensity", "Sidebar Tone", "Color error", "Card Component · Header Eyebrow Size". Sin descripción, sin default, sin qué significa cada stop, sin i18n (todo hardcodeado en inglés).
- **Los nombres del `productEditorIntent`** del modelo (`experience-preset`, `palette-seed-group`, `decoration-intensity`, …) **no aparecen en ninguna parte de `app-platform/src`** (`rg` → 0 hits).
- **Crítica de nombres contra el objetivo**: `surfaces.effect-intensity` no dice qué efecto (es decoración: gradientes, blur, texturas — un PM lee "intensidad de efectos" y espera motion); `navigation.sidebar-tone` mezcla eje (navegación) con propiedad (tono) y su dominio `subtle|strong|inverse` no es interpretable sin ver la UI; `experience.profile` y `profiles.expressive` son indistinguibles por nombre para alguien que no leyó el repo. `spacing.rhythm` con stops `tight|normal|airy` compite verbalmente con `density.mode` `compact|normal|spacious` y el usuario no puede saber cuál mueve qué.
- **Bonus de vocabulario roto**: el runtime declara `DENSITY_POSTURES = ['compact','comfortable','spacious']` con default `'comfortable'` (`infrastructure/runtime/foundation/density/index.ts:27,34`) mientras el control declara `['compact','normal','spacious']` con default `'normal'`. El manifest lo admite ("las tres vocabularios de densidad son deuda registrada") pero el editor expone una y el runtime otra.
- **Optimización**: añadir `editorMetadata` al schema del manifest y poblarlo en los 20 controles (label + help + 1 fixture de preview por control), y que `app-platform` lea el manifest en vez de humanizar claves. Es la diferencia entre 20 diales entendibles y 2212 campos anónimos.

### H-B-9 · MEDIO · La allowlist Expert es un producto a medias: la mediana de un token son 2 archivos, y faltan los de mayor palanca

- **Qué** (M2, archivos css lectores por token de `TENANT_THEME_OVERRIDE_TOKENS`, n=290):
  - distribución: **10+ archivos: 37 tokens · 3-9: 93 · 1-2: 155 · 0: 5**. Mediana = **2**.
  - Por dominio: `--ds-material-*` 160 (55%), `--ds-type-*` 63 (22%) → 77% en dos familias.
  - Los 5 con 0 lectores CSS: `--ds-glass-bg`, `--ds-glass-border`, `--ds-overlay-{light,medium,heavy}`. Dos de ellos (`glass-bg`, `glass-border`) llegan a **un solo componente React** (`graphics/motion/react/presentation/effects/glass-card/index.tsx:54`) — y el tenant de referencia los sobreescribe.
  - Los 5 de mayor alcance (`--ds-color-primary` 227 archivos, `--ds-color-text-primary` 210, `--ds-radius-md` 169, …) **ya están cubiertos por diales Standard** (`palette.seeds`, `shape.radius-scale`), o sea que la allowlist duplica la palanca alta y añade 250 knobs de palanca baja.
  - Fuera de la allowlist quedan `--ds-focus-ring*` (106+58 lecturas), `--ds-font-weight-*`, `--ds-rhythm-scale`, `--ds-sidebar-width`, `--ds-line-height-normal`.
- **"Presentación: browser de dominios con preview"**: existe parcialmente y no donde el modelo dice.
  - En `app-platform`: `Select` de 48 familias `Chrome · {familia}` + entrada `Token overrides` que renderiza los 290 como **una lista plana** filtrable por texto (`index.tsx:673-684`), más un iframe de preview compilado en servidor (`compileTenantThemePreview` → `index.tsx:518-528, 942-951`). No usa la clasificación por dominio (color 27 / semantic-surface 8 / semantic-material 160 / other 32 / semantic-typography 63) que sólo vive en `tokens/controls/README.md`.
  - En el DS existe `ui/patterns/customization/brand-studio` con fixtures de preview reales (list-collection, gallery, dashboard-metrics, form-detail, visual-excellence) — y **lo consume sólo el showroom**: `rg 'BrandStudio' app-platform/src app-bithire/src app-evnto/src` → 0 hits; 9 hits en `packages/showroom/src`.
- **Optimización**: (a) exponer la clasificación por dominio del catálogo como dato en el manifest y agrupar por ella en el console; (b) hacer que `app-platform` monte `BrandStudio` en lugar de su walker propio (elimina una duplicación y gana los fixtures); (c) mover `--ds-focus-ring*` y `--ds-font-weight-*` a la allowlist **o**, mejor, a los diales de H-B-7 y podar los ~155 tokens de ≤2 lectores.

### H-B-10 · MEDIO · Recipe groups: 2 operativos de 14 objetivo, y el que falta es justo el de cards

- **Qué**: `manifest/groups/` tiene 3 archivos. `collection-view-mode` (6 variantes) y `data-table-presentation` (5 recetas) son `OPERATIONAL_SOURCE_BOUND` con bindings verificables. `collection-card-anatomy` es `implementationState: "PROPOSED_NOT_OPERATIONAL"`, `countsAsCapability: false`, `sourceBindings: []`, `selectionAuthority: null`.
- **El denominador miente un poco**: `manifest/index.json#denominators.recipeGroups: 3` cuenta el propuesto. Operativos: **2 de 14** (14%).
- **Lo que sí existe para cards**: `chrome.cardComponent.anatomy = default|framed|underline|ghost` (implementado en CSS) — pero inalcanzable en producción por H-B-4; y `recipe-profile.families.card = {variant}` con 2 valores usados (`outlined`/`elevated`) — inerte para verticales estáticos por H-B-3. O sea, las dos rutas hacia "cards genéricas con receta seleccionable por tenant" existen y **ninguna de las dos llega**.
- **Optimización**: cerrar H-B-3 y H-B-4 desbloquea el 80% de la petición sin escribir un grupo nuevo. Después, `collection-card-anatomy` con las 3 variantes ya redactadas (compact/standard/media) es el siguiente grupo con mejor relación esfuerzo/palanca, porque `cardComponent` es la segunda familia chrome más grande (147 campos).

### H-B-11 · MEDIO · La medición de art direction acredita 8 ejes no-color, pero 2 no tienen portador en producción

- **Qué**: `artifacts/quality/programs/modern-rescue/checkpoints/reference-grammar/button-action-cluster/2026-08-05/receipts/cohort-1-tenant-divergence.json` mide 9 ejes, 8 no-color, 0 silenciosos, contra `divergenceContract.r1MinimumNonColourAxes: 6`. Dos de los 8 no-color son:
  - `recipe-profile` (1 canal: `--ds-recipe-profile`, 0 lectores — H-B-3);
  - `anatomy` (4 canales: `data-anatomy-*`, sin emisor en las 3 apps — H-B-4).
  Descontándolos, los ejes no-color con portador real son **6**, exactamente el piso, sin margen.
- **Alcance de la medición**: `channelsSeen: 1301`, y la suma de `channelsInAxis` de los 9 ejes es **349** (27%). Además, los conteos `channelsAsymmetric` son altos (type 97/101, palette 90/137, material 59/81): la mayoría de los canales están declarados por un solo lado, o sea que la divergencia se produce en gran parte porque un vertical autora un canal que el otro nunca menciona — no porque un dial los separe.
- **Los 12 `requiredGroups` de `artDirectionProjection`**: 9 tienen eje medido; **`icon-posture`, `motion-cadence`, `background-motif` y `responsive-composition` no aparecen en la medición**, y `navigation-chrome` tampoco (los 9 ejes medidos son palette, type, geometry, edge, material, elevation, density, recipe-profile, anatomy). Los 12 grupos no están cubiertos.
- **Estado**: `R1/manifest.json` → `maximumClaim: "IMPLEMENTED_PENDING_CODEX_AUDIT"`, `"NOT a claim that any canary passed"`; `cohort-1-canary-scores.json` → *"Codex returned NO GO on the first submission and the cohort is NOT sealed"*.
- **¿Difieren BitHire y The Management por art direction o sólo por color?** Por art direction, con evidencia: tipografía (Public Sans/Space Grotesk vs Inter/Fraunces serif), geometría (radius md 10px vs 0px, scale 1.25 vs 0.8), material (glass-blur 12px vs 0px), elevación, densidad (1 vs 1.15), edge (1px vs 2px). Es genuino. Pero se consigue con **37 tokenOverrides crudos** del lado DB (ver H-B-12), no con los diales.
- **Optimización**: sacar `recipe-profile` y `anatomy` del set medible hasta que tengan portador, y añadir los 4 grupos ausentes al instrumento antes de pedir el sello.

### H-B-12 · MEDIO · El tenant de referencia consigue su identidad con la escotilla, no con los diales

- **Qué** (fixture `themanagement-db-row/index.ts`, el "tenant DB" del enunciado del owner): autora **68 valores**, así:
  - `appearance.general`: 23 hojas — de las cuales 11 son hexadecimales crudos de paleta y 12 son diales reales (typePairing, fontFamily×2, scale, buttonStyle, radiusScale, motion×2, density, elevation, effectIntensity, sidebarTone);
  - `advanced.profiles`: 3 ejes (edge, material, icon);
  - `advanced.chrome.*.anatomy`: 4 selecciones;
  - `visualFoundation.recipeProfile`: 1;
  - **`advanced.tokenOverrides`: 37 tokens crudos** (54% del total autorado).
- **Qué cubren esos 37** — y por qué el dial no alcanzó, según los comentarios del propio fixture:
  - 4 `--ds-radius-{sm,md,lg,xl}` = `0/0/1/2px`. `shape.radius-scale` es **un multiplicador único** (bounds 0.75-1.25): no puede expresar una rampa no proporcional. → falta `shape.geometry` con forma de rampa, no sólo escala.
  - 4 `--ds-shadow-{sm,md,lg,xl}` = sombras de offset duro sin blur. `surfaces.elevation-posture` sólo tiene `flat|soft|elevated`, que mueven cantidad, no **carácter**. → falta `surface.depth` con eje blur-vs-offset.
  - 8 material/glass/gradient (`--ds-glass-*`, `--ds-gradient-surface`, `--ds-material-overlay-*`) pese a tener `profiles.material: 'paper'` seleccionado → el perfil de material no baja hasta glass/gradient.
  - 4 `--ds-surface-{control,inset,panel,card}` + **17 `--ds-material-control-*`** → **no existe ningún dial para el material de los controles**; es el bloque más grande de la escotilla.
- **Impacto en el objetivo del owner**: la respuesta a "¿alcanzan los diales para que dos tenants parezcan proyectos distintos?" es **hoy no**: alcanzan para ~46% del trabajo y el 54% restante entra por overrides crudos que el propio modelo describe como tier de escape.
- **Optimización**: los 37 overrides se agrupan en exactamente 4 diales faltantes — rampa de radio (4), carácter de sombra (4), material de superficie (12), material de control (17). Ver el set mínimo abajo.

### H-B-13 · BAJO · `chrome.families` declara 3 canales representativos y en el cierre alcanza 8 archivos skin

- **Qué**: la capacidad Pro que abre **1875 campos** de esquema declara `['--ds-button-primary-bg','--ds-table-header-bg','--ds-modal-bg']` y su cierre transitivo toca 8 archivos skin. Es el caso más extremo de `representativeOnly` desinformando: el manifest sugiere una capacidad pequeña y es la mayor superficie de autoría del sistema.
- **Optimización**: declarar el conteo real de campos por familia en el manifest (`chrome.families.fieldCount: 1875`, o por familia) para que el presupuesto "13+7" no se lea como 20 decisiones.

---

## Lo que está bien (con evidencia)

- **La separación density/rhythm está genuinamente construida, no sólo declarada.** `themes/default.css:665-690` documenta y ejecuta la ley: density multiplica el ramp `--ds-spacing-*` (que también dimensiona controles), rhythm se aplica en el punto de uso sólo sobre relaciones de layout. Mi Jaccard sobre cierres da 0.167. Y el manifest de `density.mode` **declara explícitamente lo que NO puede afirmar** ("control height remains fixed" es FALSO para este control, con cita `Input/engines/modern/index.tsx:170`) — eso es honestidad de instrumento, poco común.
- **Los ejes expresivos SÍ cumplen "familia + intensidad"**: 7 ejes con enums cerrados falsables (type 4, geometry 4, edge 5, material 5, elevation 5, motif 7, icon 4), con floors de a11y globales (`EXPRESSIVE_A11Y_FLOORS`, `EXPRESSIVE_EDGE_WIDTH_CHANNELS` vs `STRUCTURAL_WIDTH_CHANNELS`, `expressive-profiles/index.ts:200-230`). Es el subsistema mejor diseñado del conjunto.
- **La precedencia dial > perfil está bien resuelta en `--ds-radius-scale`**: `brand-theme/index.ts:1888-1903` intenta primero el dial explícito, luego los `fieldDefaults` del perfil geometry, luego 1. Es la forma correcta de que un preset y un dial compartan canal.
- **La customización por instancia existe y está acotada** — que es la mitad del pedido del owner ("modificar UNA card en UNA página sin romper el estilo base"): `Card` acepta `size`, `variant` (elevated|outlined|filled|ghost), `radius` (none|sm|md|lg|xl), `padding` responsive (`Card/contracts/index.ts:43-161`), y `data-size` es leído por **71 de 280** archivos skin. Nada de esto pasa por el tenant, así que no puede romper el skin base.
- **La caja de arena del preview del console es real**: `compileTenantThemePreview` compila en el servidor con el compilador canónico y devuelve `variables` + `digest` + `compilerVersion`, y el iframe usa `srcDoc` con `safeStyleCss` (`app-platform/.../tenant-theme-console/index.tsx:136,341-355`). No es un preview falso de CSS local.
- **La medición de divergencia R1 es un instrumento honesto**, con su propio veredicto negativo escrito: nombra 4 defectos abiertos por canario, explica por qué no redondea a 95, y registra el NO GO de Codex. Y localizó una causa raíz real y bien diagnosticada (el literal `--ds-button-{size}-radius` del artefacto del vertical bithire ganándole a la rampa de radio de todo tenant del vertical).
- **La allowlist Expert falla cerrada y es exacta**: 290 tokens, `maxTokenOverrides: 200`, todo lo que no esté en la lista se rechaza, y los caps por unidad (`maxRadiusPx 64`, `maxPaddingPx 128`, `maxGapPx 64`, `maxShadowLayers 4`, `maxGradientStops 8`) están en el esquema, no en la documentación.

---

## Set mínimo de diales que faltan (óptica 20), ordenado por radio de impacto medido

| # | Dial propuesto | Tier | Stops sugeridos | Sustituye | Radio medido |
|---|---|---|---|---|---|
| 1 | `focus.identity` | standard | `subtle \| ring \| offset-ring` | 20 campos `chrome.*.focusRing*` | `--ds-focus-ring-color` 106 lecturas css + `--ds-focus-ring` 58; **109 archivos css leen algún `--ds-focus-ring*`**. Ningún dial hoy. |
| 2 | `control.size` | pro | `compact \| md \| lg` | 104 campos `chrome.*.{xs..xl}.*` | `data-size` ya es leído por 71 archivos skin: el carril de bajada existe, falta el emisor a nivel tenant. Pedido explícito del owner. |
| 3 | `surface.material` (control + superficie) | standard | `flat \| paper \| glass` con intensidad | 21 de los 37 overrides del tenant de referencia (`--ds-surface-*` 4 + `--ds-material-control-*` 17) | `--ds-surface-card` 92 archivos, `--ds-material-*` es el 55% de la allowlist Expert (160 tokens). |
| 4 | `shape.geometry` (forma de rampa, no escala) | standard | `square \| soft \| round` × la escala existente | 4 overrides `--ds-radius-*` | `--ds-radius-md` 169 archivos css, `--ds-radius-lg` 147, `--ds-radius-sm` 111. El dial actual es un multiplicador y no puede hacer `0/0/1/2px`. |
| 5 | `surface.depth` (carácter de sombra) | standard | `none \| soft \| hard-offset` | 4 overrides `--ds-shadow-*` | `--ds-elevation-1` 46 archivos; `surfaces.elevation-posture` mueve cantidad, no carácter. |
| 6 | `type.weight` | standard | `light \| regular \| strong` | 20 campos `chrome.*.fontWeight*` | eje que sobrevive a escala de grises — directamente relevante para `threeSecondGrayscaleRecognitionRequired`. |

Con 1-5 cerrados, los 37 `tokenOverrides` del tenant de referencia bajan a ~4-6, y la relación "diales vs escotilla" se invierte (hoy 46/54). Con los 6, los 159 campos crudos de las 4 ideas repetidas 48 veces se convierten en 6 enums.

Reordenamientos que no cuestan diales nuevos y suben el presupuesto disponible:
- fusionar `typography.families` en `typography.pairing` (J=0.806) → libera 1 slot Standard;
- retirar o reparar `shape.button-style` (palanca 0) → libera 1 slot Standard;
- plegar `shape.radius-scale` bajo `shape.geometry` (J=0.874 con `profiles.expressive`) → 13 Standard pasan a 11 y hay sitio para `focus.identity` y `surface.material` sin pedir decisión del owner sobre el máximo de 15.

---

## Preguntas que no pude cerrar (y qué haría falta)

1. **¿Cuál es la palanca real de `chrome.families`?** Mi M2 la mide en 8 archivos skin porque sólo declara 3 canales representativos, pero abre 1875 campos que emiten cientos de `--ds-*`. Haría falta compilar un documento que autore cada campo y diff-ear el artefacto (requiere ejecutar el compilador con fixtures sintéticos, fuera de mi mandato read-only sobre el árbol).
2. **¿`--ds-density-effective-scale` alcanza 203 archivos skin *pintando* o sólo *resolviendo*?** Mi cierre es estático sobre CSS; no distingue un `var()` que llega a una propiedad pintada de uno que muere en otra custom property. Haría falta la resolution-probe con targets reales.
3. **¿La allowlist de 290 se derivó de `dist-runtime` o de un scan literal?** El censo dice que el scan literal subcuenta 71 vs 294 y que usa el bundle cuando existe (`customization-surface-census/index.mjs:338-354`). No verifiqué que el `dist` local esté fresco respecto de `src`, así que el "290 vs 294" del catálogo puede reflejar un dist con deriva. Haría falta un `pnpm build` (prohibido en este brazo).
4. **`profiles.icon` y `responsive.posture` viajan como data**: verifiqué que `provideServerIconExpressiveProfile` sí se llama en `app-bithire/src/app/layout.tsx:181` (icon OK) y que `AdaptiveLayout` sólo llega a producción vía `WidgetBoard`/dashboard en `app-evnto`. No medí cuántas pantallas reales lo montan, así que no puedo cuantificar el radio de `responsive.posture`.
5. **El artefacto `R0/tenant-art-direction-compliance.json` está desactualizado** respecto de la fuente (dice bithire `recipeProfile: technical-sharp@1` línea 287; la fuente actual dice `network-professional@1` en `brand-themes/bithire/index.ts:3168`). No sé si eso es deriva esperada de R0→R1 o si hay un check de frescura que debería haber fallado.
