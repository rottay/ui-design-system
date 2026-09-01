# F — Customización por instancia y contrato de override desde la app — 8 ópticas

Alcance de medición: `/Users/daniel/Developer/Rottay/ui-design-system/packages/core` (DS) y
`app-bithire`, `app-evnto`, `app-platform`. Todo comando es de sólo lectura.

## Puntaje por óptica

| # | Óptica | Puntaje 0-5 | Evidencia (1 línea) |
|---|--------|-------------|---------------------|
| 49 | Mecanismos sancionados por instancia (props → `data-*` → skin) | **3** | La cadena prop→`data-*`→skin es real y verificable (`card.css:158,370-391`), pero no hay contrato general: `recipe?:` existe en 3 familias, `emphasis?:` en 3, `data-variant` lo emiten 84/1200 archivos de `src/ui`, `data-size` 76, `data-tone` 43 |
| 50 | Escape hatch (`className`/`style`) y vía oficial | **2** | `className`+`style` llegan al DOM raíz de Card/Button/Input/DataTable sin gobierno (0 reglas ESLint sobre ellos); la vía oficial son 91 public hooks que cubren 15/255 familias (5.9%), y los 3 hooks de Card están declarados como *"this family overrides nothing"* |
| 51 | Theming por subárbol | **3** | `density.css` es un contrato de subárbol completo y correcto (`[data-density]:not(:root)` re-declara toda la rampa) y los selectores de anatomía son descendentes → funcionan en cualquier ancestro; pero `DensityScope` (la API pública) tiene **0 consumidores** en DS y en las 3 apps, y conviven 3 mecanismos paralelos de densidad |
| 52 | `chrome.families`/`chrome.anatomy` por surface/ruta | **1** | Las 22 capacidades del registro tienen **todas** `scope: 'tenant'`; `r7Execution.enabled=false` y su esquema no tiene eje de scope; además `chrome.anatomy` declara `derivedChannels: []` y el compilador estático **no emite ningún** `data-anatomy-*` |
| 53 | Surfaces bajando directivas | **3** | Cascada de 3 niveles real (`config.visual` → product profile → DS defaults) en 30/39 surfaces, con `cardVariant` trazado hasta `data-variant` en el DOM; pero media de **4,33 ejes consumidos de 21** disponibles y **0 usos de `profileOverrides` en las 3 apps** |
| 54 | CSS de la app que sombrea al DS | **4** | Las 165 escrituras `--ds-*` de app-bithire clasifican **100% `PUBLIC_HOOK_SCOPED`**, baseline del gate vacío (`grandfathered: {}`), 44 literales hex en 918 CSS y 1 sola regla que pinta un selector DS con literal → **no** es un segundo emisor; sí hay 911 reglas que apuntan a 84 clases DS (forma especializada en la app) |
| 55 | `hooks-manifest.json` / `unadjudicatedReads` | **3** | **La premisa del brief es incorrecta**: los 2.606 `unadjudicatedReads` son lecturas `var()` **internas del DS** (41,6% de sus 6.263 lecturas), no lecturas desde apps — las apps leen **0** canales internos y el gate `app-ds-hook-contract` corre blocking con 0 hallazgos en las 3 apps |
| 56 | Veredicto de diseño / contrato mínimo | **2** | Existen las 4 piezas (axis `data-*`, promoción de hooks, scope de densidad, `profileOverrides`) pero ninguna está conectada para el caso "una card en una página"; propuesta y costo abajo |

Escala aplicada: 5 cumple con evidencia reproducible · 4 deuda menor conocida · 3 parcial dirección correcta · 2 parcial dirección dudosa · 1 sólo intención/documento · 0 ausente.

---

## Hallazgos (ordenados por severidad)

### H-F-1 · BLOQUEANTE · El modelo de customización no tiene eje de scope por debajo de `tenant`

- **Qué**: Las 22 capacidades activas del registro declaran **`scope: 'tenant'` sin excepción**. No existe `scope: 'surface' | 'route' | 'instance'` en el contrato, ni en R7. El pedido literal del owner ("modificar el estilo de UNA card en UNA página específica por diseño") no tiene destino en el modelo.
- **Evidencia**:
  - `packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts` — extracción programática:
    ```
    capabilities: 28 · scopes: Counter({'tenant': 23}) · tiers: {standard:14, pro:7, internal:1}
    ```
    (23 `scope:` literales para 22 ids activos + 1 interno; ninguno distinto de `tenant`.)
  - `packages/core/scripts/quality-evidence/programs/modern-rescue/customization-model/index.json` → `r7Execution.enabled = false`; sus 18 `familyAnatomyDispositionRequiredFields` incluyen `eligibleAxes` e `inputChannels` pero **ningún campo de scope**. R7 tampoco lo introduce.
- **Impacto**: la promesa "el DS baja las directivas a surfaces/estructuras/componentes" se cumple sólo en el sentido tenant→todo. La dirección "esta página / esta instancia" queda fuera del modelo gobernado, y por lo tanto vive hoy en CSS ad-hoc de la app.
- **Optimización**: agregar `scope: 'tenant' | 'surface' | 'instance'` al registro de capacidades y marcar qué controles admiten re-scope. Los 3 candidatos inmediatos ya tienen mecánica CSS: `density.mode` (`[data-density]` funciona en cualquier contenedor), `chrome.anatomy` (selectores descendentes) y `recipe-profile` (es un React Context anidable).

---

### H-F-2 · BLOQUEANTE · `chrome.anatomy` no existe en el brazo estático; app-bithire lo re-implementa con literales

- **Qué**: El compilador estático (`BrandTheme`) **no emite ningún** `data-anatomy-*`. La proyección existe sólo en el compilador de DB. Como consecuencia app-bithire (vertical estática) hardcodea la selección de anatomía en código de app.
- **Evidencia**:
  - Proyección única, en el compilador DB: `src/infrastructure/compilers/composition/tenant-theme/index.ts:1304-1341` (`ANATOMY_ATTRIBUTE_BY_FAMILY`, `tenantThemeAnatomyAttributes`, lee `artifact.normalizedAppearance.advanced.chrome`).
  - `grep -n "anatomy" src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts` → **0 líneas**.
  - `grep -rn "anatomy" src/foundation/tokens/ts/presentation/brand-themes/` → **0 líneas** (ningún BrandTheme estático autora `anatomy`, pese a que `BrandCardChrome.anatomy` existe en el tipo: `src/foundation/contracts/composition/tenants/themes/index.ts:2110`).
  - `chrome.anatomy` en el registro: `derivedChannels: []`, `defaultBehavior: 'default anatomy; fails closed unless the vertical envelope opts in'`, y `allowAnatomyVariants` sólo se evalúa en el compilador DB (`tenant-theme/index.ts:1185`).
  - La app lo suple: `app-bithire/src/vertical/model/profile/anatomy/index.ts:12-30` →
    ```ts
    const BITHIRE_ANATOMY = { card: "framed", table: "ruled", sidebar: "rail", layout: "flat" } as const;
    export const BITHIRE_ANATOMY_ATTRIBUTES: Record<string,string> = { "data-anatomy-card": …, … };
    ```
  - Y la app escribe 65 reglas CSS que dependen de esos atributos (`grep -rn "data-anatomy" app-bithire/src --include='*.css' | wc -l` → **65**).
- **Impacto en el objetivo del owner**: el owner quiere que "un tenant estático de archivo y uno de DB parezcan proyectos totalmente distintos". Uno de los dos controles Pro que produce divergencia estructural (anatomía de card/tabla/sidebar/layout) **sólo funciona en el brazo DB**. La paridad estático/DB (`transportEquality`) está rota exactamente en el eje más visible.
- **Nota de justicia**: el escritor de la app **no** viola la ley de frontera — pasa por el claim registry del DS (`app-root-writer` gate: `RAW_ROOT_WRITE 0`, `claim usages 4`, 4341 fuentes escaneadas). El defecto es de capacidad ausente, no de disciplina de la app.
- **Optimización**: mover la proyección al compilador estático (una función pura de `brandTheme.chrome.*.anatomy` → los 4 atributos, misma tabla `ANATOMY_ATTRIBUTE_BY_FAMILY`), autorar `anatomy` en los 3 BrandThemes, y borrar `BITHIRE_ANATOMY` de la app. Coste estimado: ~1 función + 3 ediciones de BrandTheme + 1 borrado.

---

### H-F-3 · ALTO · `recipe-profile` (el Pro control de "perfiles de familia") está muerto en las 3 verticales estáticas

- **Qué**: `RecipeProfileProvider` recibe su id **sólo** de `resolvedRuntimeConfig.appearance?.recipeProfile`, y la proyección de configuración code-owned **destruye** `appearance`. Para bithire/evnto/rottay (la producción de hoy, sin tenant DB) el provider nunca recibe valor y las 6 familias caen a defaults de engine.
- **Evidencia**:
  - `src/infrastructure/runtime/bootstrap/facade/react/provider/index.tsx:1118-1123`
    ```ts
    const recipeProfileSelection = (() => {
      const dbProfile = resolvedRuntimeConfig.appearance?.recipeProfile;
      return dbProfile ? { profileId: dbProfile, schemaVersion: … } : undefined;
    })();
    ```
  - `src/infrastructure/runtime/tenant/foundation/configuration/registry/index.ts:154-161` — `getCodeOwnedRuntimeConfig` desestructura `appearance: _appearance` y **nunca lo restituye**.
  - El canal CSS declarado sí se emite pero nadie lo lee: `src/foundation/tokens/css/facade/artifacts/rottay/index.css:767` (`--ds-recipe-profile: "rottay/technical-sharp@1"`), `.../bithire/index.css:815` — y no hay ningún `var(--ds-recipe-profile)` en producción.
  - El propio registro ya lo documenta (F4B-15, `capabilities/index.ts:692-710`): *"The two surfaces are architecturally decoupled, not a bug this control can fix"*.
- **Impacto**: el mecanismo **más cercano** al pedido del owner (un provider React anidable que reasigna defaults de `card`, `button`, `tabs`, `tag`, `sectionCard`, `dataTable` para un subárbol) existe, está exportado (`src/index.ts:58`), tiene 3 perfiles publicados y 6 consumidores reales en engines — y está desconectado del 100% de la producción actual.
- **Optimización (barata y de alto retorno)**: dos movimientos independientes.
  1. Restituir la selección estática: proyectar `brandTheme.recipes.profile` (el `brandThemePath` que el registro ya declara) al provider para configs code-owned.
  2. Exponer `RecipeProfileProvider` como **scope de página**: al ser un `Context.Provider` anidado, `<RecipeProfileProvider profileId="rottay/technical-sharp@1">` alrededor de una sección ya funciona hoy sin tocar CSS. Es la respuesta más directa a "esta página con otra postura", con vocabulario cerrado y tipado.

---

### H-F-4 · ALTO · `DensityScope`, la única API pública de scope visual, tiene cero consumidores

- **Qué**: El DS declara `DensityScope` como *"the ONE public scoped contract for visual density"*, lo exporta en el barrel, y **nadie lo monta** — ni el DS ni ninguna app.
- **Evidencia**:
  - Definición y declaración de autoridad: `src/infrastructure/runtime/foundation/density/index.ts:1-14, 55-67`.
  - Exportado: `src/index.ts:195-201`.
  - `grep -rn "DensityScope" src` → **34 hits**, todos en la definición, su re-export y **tests** (control positivo: `src/ui/patterns/data/widget-board/runtime/adaptive/react/tests/adaptive-runtime.test.tsx:45`).
  - `grep -rn "DensityScope" app-bithire/src app-evnto/src app-platform/src` → **0**.
- **Además hay 3 mecanismos paralelos de densidad**, cada uno con su propia forma:
  1. `DensityScope` (Context + `data-density`) — 0 consumidores.
  2. `densityScopeAttributes(posture)` (sólo el atributo) — 15 consumidores en `src/ui`, de los cuales **8 de 39 surfaces**: `workspace/collection-workspace` y los 7 `admin/*`.
  3. `CollectionWorkspaceSurface` con **su propio** hook local: `--ds-collection-workspace-density-local-factor` + `--ds-density-cell-padding` / `--ds-density-card-padding` (`workspace/collection-workspace/index.tsx:92-105`).
  4. `profileOverrides.density` en surfaces, que en 22 de 30 surfaces **no llega al DOM**: sólo recalcula `listCompact`/`tabsType`/`listCardMinWidth`/`sectionSpacing` en JS (`profile-defaults/overrides/index.ts:44-60`).
- **Impacto**: la mecánica CSS es **excelente** (`foundation/base/density.css` re-declara la rampa completa de spacing en cada frontera, con la ley de cascada bien razonada y `:where()` a especificidad 0 para que la app pueda ganar). Lo que falta es que alguien la monte. `ListSurface`, `DashboardSurface`, `FormSurface` y `DetailSurface` — las 4 surfaces del brief — **no estampan densidad**.
- **Optimización**: montar `densityScopeAttributes(profileDefaults.density)` en la raíz de las 30 surfaces que ya resuelven `profileDefaults` (es una línea por surface), y colapsar los 3 mecanismos en uno.

---

### H-F-5 · ALTO · Para Card no existe hoy ningún canal de override por instancia sancionado

- **Qué**: Los únicos 3 public hooks de la familia Card (`--ds-card-bg`, `--ds-card-border`, `--ds-card-body-color`) están promovidos bajo una promoción cuyo contrato **prohíbe inventar un valor**. Ni radio, ni sombra, ni padding, ni ancho de borde son asignables por la app.
- **Evidencia**:
  - `hooks-manifest.json` → `declaredSlots["--ds-card-bg"]`:
    ```json
    { "family": "table-in-card-bridge",
      "valueType": "the keyword `inherit`, or a var() read of the sibling channel",
      "rationale": "… this family overrides nothing." }
    ```
  - Clasificación de los canales que un diseñador querría mover:
    ```
    --ds-card-radius            componentTokens+foundationTokens+tenantChannel   (NO hook)
    --ds-card-shadow            componentTokens+foundationTokens+tenantChannel   (NO hook)
    --ds-card-padding-md        foundationTokens+tenantChannel                   (NO hook)
    --ds-card-border-width      foundationTokens+tenantChannel                   (NO hook)
    --ds-card-instance-padding  unadjudicatedReads                               (NO hook)
    ```
    Todos caerían en `UNKNOWN_HOOK` → prohibidos por `contract.mustNotAssign`.
  - Distribución de los 91 hooks por familia: `button 25 · shell 16 · tabs 13 · metric 5 · filter 4 · record 4 · tab 4 · table 4 · action 3 · card 3 · listing 2 · signal 2 · chart 1 · command 1 · progress 1 · radius 1 · sheet 1 · workspace 1`. **Input: 0 hooks.**
  - Cobertura del registro de promociones: **15 familias promovidas** de las **255** del manifest (5,9%) — `PROMOTIONS` en `scripts/lib/hooks/ds-hook-manifest/index.mjs:889`.
- **Nota**: la restricción de valor **no** prohíbe geometría, sólo color: `PROMOTED_HOOK_VALUE_CONSTRAINT.forbiddenValue = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/` (`ds-hook-manifest/index.mjs:879-887`), con el comentario explícito *"Geometry literals (12px, 0.045, none, max-content) are structure, not brand"*. **El mecanismo sirve; falta el inventario.**
- **Optimización**: promover una familia `card-instance-geometry` con 5 propiedades — `--ds-card-instance-padding` (ya existe y ya la lee `card.css:396,418,427`), `--ds-card-radius`, `--ds-card-shadow`, `--ds-card-border-width`, `--ds-card-bg-hover` — con `whiteLabelCompat: 'derives-from-palette'` y `subtreeRepaint` acotado. Es 1 entrada en `PROMOTIONS` + regenerar el manifest; el gate ya sabe verificarla.

---

### H-F-6 · MEDIO · `className` es el contrato de facto: 2.197 usos sobre componentes no-layout, sin ninguna regla que lo gobierne

- **Qué**: `className` y `style` llegan al elemento raíz de todos los componentes verificados; ninguna regla ESLint del plugin los toca; el gate de hooks sólo audita **declaraciones `--ds-*`** en CSS, no la pintura arbitraria bajo una clase de la app. El resultado es que el ajuste puntual real se hace con clase de app + CSS de app.
- **Evidencia**:
  - Camino al DOM: Card — `style` pasa intacto (`Card/engines/modern/index.tsx:270` `const cardStyle = style`) y `className` entra al recipe como extra (`…recipe.resolve({…}, { root: className }).root`); Button — `interactiveStyle = { …, ...style }` (`Button/engines/modern/index.tsx:381`); Input — `<div className={\`rottay-input-field ${className}\`} style={style}>` (`Input/engines/modern/index.tsx:443,486`); DataTable — `className={\`ds-pattern-data-table ds-engine-modern ds-table-density-${density} …\`}` (`data-table/engines/modern/index.tsx:1207`).
  - Reglas ESLint publicadas: 6 (`no-motion-literals`, `no-db-in-components`, `no-raw-html`, `no-hardcoded-colors`, `no-direct-lucide`, `no-size-type-outside-classic`). **Ninguna** sobre `className`/`style` en componentes DS.
  - Uso medido en app-bithire (1.425 `.tsx`, 185 símbolos DS importados):
    ```
    className en componentes DS de layout  : 19.160  (Box 6.117, Text 5.765, Flex 4.590, Stack 2.417)
    className en componentes DS NO-layout  :  2.197  (Icon 1.302, Button 250, Card 143, Badge 135, Input 46, …)
    style= sobre componentes DS            :    405  (Box 350, Text 14, Flex 13, …)
    ```
  - No existe alternativa tipada: `sx?:` 0, `css?:` 0, `styleOverride` 0, `tokens?:` 0, `tokenOverrides?:` 0 archivos en todo `src/ui`.
- **Impacto**: `className` es hoy la única vía práctica para el caso del owner, y es la única que el sistema no puede medir ni acotar. Nada distingue "esta card lleva borde en vez de sombra por diseño" de "esta card se pinta a mano".
- **Optimización**: no cerrar `className` (rompería 21k llamadas y es el escape legítimo de layout), sino **darle competencia**: una prop `tokens?: Partial<Record<CardInstanceHook, string>>` acotada al allowlist de la familia, que el engine baje como custom properties inline. Tipada, medible, y compatible con la ley (no hay literal en el skin, no hay selector por tenant).

---

### H-F-7 · MEDIO · `profileOverrides` — el mecanismo correcto para "esta página" — existe en 30 surfaces y ninguna app lo usa

- **Qué**: El DS ya tiene la cascada de 3 niveles que el owner pide, con precedencia documentada (*"1. Surface visual overrides (highest — per-surface instance) · 2. Personality tokens · 3. Product profile · 4. Fallback defaults"*). Está implementada, testeada, trazable hasta el DOM… y desconocida para las apps.
- **Evidencia**:
  - Contrato: `src/ui/structures/foundation/chrome/contracts/index.ts:301-314` — 12 ejes (`density`, `cardVariant`, `sectionSpacing`, `headerWeight`, `animateEntrance`, `entranceStyle`, `entranceDuration`, `staggerDelay`, `badgeShape`, `labelStyle`, `countUpEnabled`, `pulseSpeed`).
  - Merge: `src/ui/structures/foundation/chrome/runtime/profile-defaults/overrides/index.ts:38-82`.
  - **Traza completa verificada** para `cardVariant`: `ListSurface` `config.visual.profileOverrides` → `profileDefaults.cardVariant` → `<Card variant={…}>` (`data/list/index.tsx:528`, `data/dashboard/index.tsx:406`, `forms/form/index.tsx:157`) → `data-variant` (`Card/engines/modern/index.tsx:284`) → `card.css:158` `[data-variant='outlined']`. **Funciona hoy.**
  - Cobertura: 30 de 39 surfaces leen `useSurfaceProfileDefaultsWithOverrides`; media de **4,33 ejes consumidos de 21** posibles:
    ```
     7 data/list · 6 admin/settings · 6 operations/scheduler · 6 data/visualization · 6 data/dashboard
     5 ×9 · 4 ×9 · 3 ×5 · 2 data/detail · 1 data/compare
    ```
    `badgeShape`, `labelStyle`, `countUpEnabled`, `pulseSpeed`, `entranceStyle`, `accentPosition/BarThickness/BarStyle` los consume 0-1 surface.
  - **Uso en apps**: `grep -rn "profileOverrides" app-bithire/src app-evnto/src app-platform/src` → **0**; `grep -rn "cardVariant" …` → **0**. Y sin embargo las surfaces se usan intensamente: `CollectionWorkspaceSurface` 529 referencias, `DetailSurface` 243, `ListSurface` 25, `DashboardSurface` 19, `FormSurface` 7.
- **Impacto**: la brecha no es de capacidad sino de **alcanzabilidad**. El owner pide algo que ya está construido y nadie sabe que existe.
- **Optimización**: (a) documentar `profileOverrides` como *la* vía de override por página en la doc de surfaces; (b) subir la media de ejes consumidos — en particular estampar densidad en las 30; (c) migrar 2-3 pantallas de bithire como prueba de que el camino cierra sin CSS de app.

---

### H-F-8 · MEDIO · `size` en Card mueve dos canales de tipografía y nada más

- **Qué**: El owner pide "size configurable desde la app". En Card el eje `size` (7 valores: `xs…3xl`) colapsa a **3 cubos** y sólo mueve tamaño de título y de cuerpo. Padding, radio, gap y altura son ejes distintos.
- **Evidencia**: `card.css:384-392` — únicas reglas `[data-size]`:
  ```css
  [data-size='xs'], [data-size='sm']  { --_ds-card-title-font-size-current: …; --_ds-card-body-font-size-current: …; }
  [data-size='xl'], [data-size='2xl'], [data-size='3xl'] { --_ds-card-title-font-size-current: …; }
  ```
  `md`/`lg` no tienen regla (son la línea base). El padding vive en `[data-padding='none'|'sm'|'lg']` (`card.css:370-378`), un eje independiente con 4 valores.
- **Impacto**: `<Card size="sm">` no compacta la card; hay que pedir además `padding="sm"`. La expectativa de "size" como dial compuesto no se cumple.
- **Optimización**: o bien componer padding/gap/radio dentro del eje `size` (un `--ds-card-size-factor` que multiplique `--ds-card-padding-current`), o renombrar el eje a `typeScale` y documentar `padding` como el dial de compacidad. La primera es la que se parece a lo que el owner espera.

---

### H-F-9 · BAJO · `Card` exporta públicamente mapas con literales hex que sólo consume el engine `classic` (congelado)

- **Qué**: `COLOR_VARIANT_MAP` (6 entradas con `#3b82f6`, `#22c55e`, `#f59e0b`, `#ef4444`, y `rgba(...)` de fallback), `SHADOW_MAP` y `RADIUS_MAP` se exportan desde el barrel público de Card.
- **Evidencia**: `src/ui/primitives/display/Card/contracts/index.ts:420-470`, re-exportados en `Card/index.tsx:45`. Consumidor único: `Card/engines/classic/index.tsx:55,157` (engine read-only por ley del programa). El engine `modern` importa sólo `CARD_DEFAULTS, PADDING_MAP`.
- **Impacto**: una app que lea `COLOR_VARIANT_MAP.primary.borderColor` para "hacer una card puntual" recibe un hex que ningún tenant puede re-tematizar. Es una trampa de API, no un defecto de pintura.
- **Optimización**: mover los tres mapas a `engines/classic/` (no exportarlos del barrel) o marcarlos `@deprecated` con nota de "classic-only".

---

### H-F-10 · BAJO (corrección al brief) · Los 2.606 `unadjudicatedReads` no son lecturas de las apps

- **Qué**: El brief pregunta *"¿Las apps leen 2.606 canales internos que no son API?"*. **No.** Un `unadjudicatedRead` es una lectura `var()` **hecha por el propio DS** de un nombre que ni un canal de compilador de tenant ni una declaración raíz/interna del DS posee, y que no fue promovido.
- **Evidencia**:
  - Definición canónica, `hooks-manifest.json` → `derivation.unadjudicatedRead`: *"read by the DS via var() but owned by neither a governed tenant compiler channel nor a DS root/internal declaration and not explicitly promoted; decrease-only debt, not API"*.
  - Proporción: `counts.reads = 6263`, `counts.unadjudicatedReads = 2606` → **41,6% de las lecturas propias del DS**. `hooks = 91` → **1,45%** de las lecturas son API pública.
  - Lo que las apps efectivamente escriben, medido corriendo el gate en modo `--json` (sólo lectura) contra cada app:
    ```
    app-bithire   PUBLIC_HOOK_SCOPED 165 · ROOT_EQUIVALENT 0 · UNKNOWN_HOOK 0 · HOOK_VALUE_LITERAL 0   (byReason: public-hook 165)
    app-evnto     0 / 0 / 0 / 0
    app-platform  0 / 0 / 0 / 0
    ```
    Baseline del gate: `{"schemaVersion":1, "grandfathered": {}}` — **cero deuda apadrinada**.
  - El gate es blocking en CI (`scripts/ci/gates-manifest/index.mjs:391`) y falla duro si el corpus falta (`resolveCorpusRoot`, *"a blocking gate must not treat an absent corpus as a pass"*).
- **Precaución medida (no inflar el número)**: `unadjudicated` **no** equivale a "lectura colgada". De las lecturas de nombres unadjudicated en `src/foundation/tokens/css`, **3.317 llevan fallback** y **444 no**. Verifiqué un caso sin fallback — `--ds-collapse-root-bg`, leído en `runtime/bridges/collapse.css:28` sin fallback y sin ninguna declaración CSS — y resulta que **sí** lo declara un emisor TS (`foundation/tokens/ts/runtime/components/collapse/token-utils/index.ts:82`, con cadena de consumidores vía `ui/primitives/layout/Collapse/runtime/tokens/index.ts:136`). O sea: los 444 son una **clase de riesgo a verificar nombre por nombre**, no un conteo de agujeros de pintura.
- **Optimización**: el manifest ya distingue 5 buckets; falta un sexto derivado — "leído sin fallback y sin ningún productor (CSS o TS)" — que es el que realmente pinta nada. Ese número, no 2.606 ni 444, es el que merece un ratchet.

---

## Lo que está bien (con evidencia)

1. **La cadena prop → `data-*` → skin es real y auditable.** El engine moderno de Card estampa 18 atributos de contrato (`Card/engines/modern/index.tsx:275-300`) y `card.css` selecciona sobre 8 de ellos (`data-variant` ×8, `data-radius` ×5, `data-size` ×5, `data-padding` ×3, `data-tone` ×5, `data-interactive` ×10, `data-selected` ×7, `data-shadowed` ×7). Sin literales de pintura en el TSX: el único `style` inline es el del caller (`const cardStyle = style`).
2. **El contrato app/DS existe, está publicado y se cumple.** `hooks-manifest.json` (schemaVersion 4) se exporta como subpath instalable, su `contract.mustNotAssign` es explícito, el gate corre blocking y las 165 escrituras de app-bithire clasifican 100% `PUBLIC_HOOK_SCOPED`. La **ley de redacción** del gate (*"A green run prints 'no growth (N grandfathered)'. It never prints 'legitimate'"*) es un ejemplo de honestidad de instrumento poco común.
3. **Las apps no son un segundo emisor.** app-bithire: 918 CSS, 26.785 reglas, **44 literales hex en total**, **1 sola regla** que pinta un selector DS con literal, y **0** declaraciones `--ds-*` en `:root` desnudo (los dos `:root` que existen — `styles/ramps.css:10` y `styles/foundation.css:16` — declaran exclusivamente `--bh-*` y `--rt-*` derivados de `--ds-*`). app-evnto y app-platform: 0 escrituras `--ds-*`.
4. **`foundation/base/density.css` es un contrato de subárbol bien diseñado.** Re-declara la rampa pública completa en cada frontera (la ley de cascada de custom properties está razonada en el docblock), usa `:where()` para dejar especificidad 0 y que un hook de app pueda ganar, mantiene el suelo táctil de 44px fuera de la escala, y evita la doble aplicación root/local por construcción, no por convención.
5. **Los selectores de anatomía son descendentes, no de raíz.** `[data-anatomy-card='framed'] .ds-card.ds-card--modern[data-part='root'][data-part='root']` (`card.css:616`) alcanza (0,5,0) desde **cualquier** ancestro. La mecánica CSS para "esta sección con otra anatomía" **ya existe**; sólo falta la API que la estampe.
6. **`RECIPE_PROFILES` es el modelo correcto en miniatura**: registro cerrado, ids namespaced y versionados (`rottay/technical-sharp@1`), resolución fail-closed con razón tipada (`malformed-id | unknown-id | unsupported-schema-version`), vocabulario de familias y valores cerrado, y la ley *"caller props always win"* implementada literalmente en cada engine (`variantProp ?? profileDefaults.variant ?? CARD_DEFAULTS.variant`).
7. **`app-root-writer-gate` cierra el hueco que una aserción de valor no ve** — y su diseño (fallar sobre nombres de atributo no conocibles estáticamente, sin baseline) es correcto. Resultado real: `RAW_ROOT_WRITE 0`, `LOCAL_CLAIM_COPY 0` sobre 4.341 fuentes de app-bithire.

---

## Óptica 51 — el caso concreto, respondido

> *"Todas las cards de ESTA página con anatomía compacta y borde en vez de sombra — ¿cuántas líneas y dónde vivirían en app-bithire hoy?"*

**Camino A — sancionado, funciona hoy, 1 línea por card.** `<Card variant="outlined" padding="sm">`. Verificado: `data-variant='outlined'` → `card.css:158`; `data-padding='sm'` → `card.css:373`. Coste: N líneas para N cards; no es "la página", es cada instancia.

**Camino B — sancionado a nivel página, funciona hoy, 1 línea por página, sin uso en ninguna app.**
```tsx
<ListSurface config={{ visual: { profileOverrides: { cardVariant: 'outlined' } }, … }} />
```
Verificado extremo a extremo (H-F-7). **Limitación**: `density: 'compact'` en el mismo objeto **no** llega al DOM en `ListSurface` — sólo recalcula `listCompact`/`listCardMinWidth`/`sectionSpacing` en JS. La anatomía compacta real requiere el camino C o el fix de H-F-4.

**Camino C — funciona por CSS, sin API, off-contract.**
```tsx
<Box data-density="compact" data-anatomy-card="framed">…</Box>
```
Ambos atributos pasan porque `BaseComponentProps` declara la firma índice `[dataAttribute: \`data-${string}\`]` (`foundation/contracts/kernel/common/index.ts`) con **ley de pass-through explícita**. Mecánicamente correcto (`density.css` + `card.css:616`). Pero `data-anatomy-card` está documentado como atributo **de raíz** proyectado por el compilador de tenant, así que usarlo por subárbol es uso no gobernado. **2 líneas, y ningún gate lo detecta.**

**Camino D — el que la app usa hoy.** Clase propia + CSS de app:
```css
.rt-data-table-card { --ds-card-bg: var(--ds-table-bg, …); --ds-card-border: var(--ds-table-border, …); }
```
(`app-bithire/src/ui/tables/data-table/styles/index.css:1-9`). Pasa el gate sólo porque esas 2 propiedades están promovidas — y bajo una promoción cuyo contrato dice *"overrides nothing"* (H-F-5). Para radio/sombra/padding el mismo patrón sería `UNKNOWN_HOOK`.

---

## Óptica 56 — Contrato mínimo propuesto

Compatible con las leyes vigentes: sin selector por tenant, sin segundo compilador, sin literal en el skin, sin hook nuevo que no pase por `PROMOTIONS`.

**Tres piezas, ninguna nueva conceptualmente — las tres ya existen a medias.**

**(1) `SurfaceScope` — un scope de página, no un provider por eje.** Un solo componente que estampa los atributos que las skins ya saben leer y monta los contextos que ya existen:
```tsx
<SurfaceScope density="compact" cardAnatomy="framed" recipeProfile="rottay/technical-sharp@1">
```
Internamente: `densityScopeAttributes(density)` + `data-anatomy-card` + `<RecipeProfileProvider>`. Vocabulario cerrado, tipado desde `TENANT_THEME_ANATOMY_VARIANTS`, `DENSITY_POSTURES` y `RecipeProfileId`.
*Ya existe*: los 3 mecanismos, sus vocabularios y su CSS. *Falta*: el componente que los une (~60 líneas) y `scope: 'surface'` en las capacidades correspondientes (H-F-1).
*Coste*: bajo. *Riesgo*: bajo — no toca compiladores ni skins.

**(2) `tokens` prop por instancia, acotada por familia.**
```tsx
<Card tokens={{ '--ds-card-radius': 'var(--ds-radius-none)' }} />
```
Tipada como `Partial<Record<CardInstanceHook, string>>` donde `CardInstanceHook` se **deriva** del manifest de promociones, y bajada como custom properties inline por el engine (mismo lugar donde hoy va `style`).
*Ya existe*: `PROMOTED_HOOK_VALUE_CONSTRAINT` (que ya permite geometría y prohíbe color), la mecánica de canal por instancia (`--ds-card-instance-padding`, leída en `card.css:396,418,427`) y el gate que la verifica.
*Falta*: 1 entrada `card-instance-geometry` en `PROMOTIONS` (5 propiedades) + la prop en 4-6 familias piloto.
*Coste*: medio. *Beneficio*: convierte los 2.197 `className` sobre componentes no-layout en algo medible y acotado — la deuda deja de ser invisible.

**(3) Paridad estático/DB en anatomía (H-F-2) y restitución de `recipe-profile` (H-F-3).** Sin esto, (1) y (2) sirven a la app pero el objetivo del owner —*dos tenants que parezcan proyectos distintos*— sigue dependiendo de que uno de ellos viva en DB.
*Coste*: bajo (una proyección pura + una línea en la proyección code-owned). *Es el prerequisito, no el remate.*

**Lo que NO haría**: cerrar `className`/`style`. Son 21.357 usos, la mayoría layout legítimo, y cerrarlos empuja el ajuste hacia CSS de app que el gate ve todavía menos. La estrategia correcta es **darles competencia tipada**, no prohibirlos.

---

## Preguntas que no pude cerrar (y qué haría falta)

1. **¿Cuántas de las 444 lecturas sin fallback pintan realmente nada?** Requiere cruzar cada nombre contra los emisores TS de `foundation/tokens/ts/runtime/components/**` (el caso `--ds-collapse-root-bg` prueba que el bucket del manifest no basta). Haría falta un derivado del manifest que una productores CSS **y** TS; sin eso cualquier cifra que reporte sería falsa por arriba.
2. **¿`profileOverrides` produce divergencia visual observable?** Tracé `cardVariant` hasta la regla CSS, pero no ejecuté el reference lab (`/probe/ds-reference`, `/probe/whitelabel-torture`) — el brief prohíbe correr suites. Una captura A/B de una surface con `cardVariant: 'outlined'` vs sin él cerraría la óptica 53 en 5 en vez de 3.
3. **¿El gate de hooks corre en el CI real del repo DS?** Su corpus por defecto es el hermano `../../../app-bithire`, que existe en esta máquina pero probablemente no en un runner. `resolveCorpusRoot` falla duro si falta — habría que leer el workflow de Actions para saber si el gate se ejecuta o si el job entero se salta.
4. **`chrome.families` por surface**: sólo verifiqué que su `scope` es `tenant` y que declara 3 `derivedChannels`. No medí si `chromeToVariables` podría emitirse bajo un selector de scope sin romper `transportEquality` — es la pregunta de diseño que decide si la pieza (1) puede crecer más allá de anatomía+densidad+perfil.
5. **app-platform importa `@rottay/design-system/dist/platform.css`, que no existe en el `dist` local** (dato del contexto compartido, no re-verificado aquí). Si es cierto, ninguna medición sobre app-platform dice nada sobre lo que esa app realmente pinta.
