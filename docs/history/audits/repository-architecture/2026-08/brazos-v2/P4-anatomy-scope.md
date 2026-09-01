# P4 — Anatomía, `recipe-profile` y scope por debajo de tenant

HEAD verificado: **cambió durante el trabajo**. Al iniciar `dcc44a6093de0ba4f9dcbdb733ae467008cffb21`; al cerrar `f166570d92433fe1437133975732003c1fd29a32` (2 commits ajenos: `ecdc01a61` microfix schemaVersion + `f166570d9` asiento §13). `git diff --name-only dcc44a6..HEAD` = 3 archivos: `docs/history/programs/architecture-refactor/2026-08/execution/index.md` y los dos de `scripts/boundaries/public-entrypoint-boundary-gate/`. **Ninguno de los archivos que medí está en ese diff**, así que todas mis cifras valen en los dos commits.

git status inicial: ` M scripts/boundaries/public-entrypoint-boundary-gate/index.{mjs,test.mjs}` + `?? docs/reauditoria-cloud/`.
git status final: `?? docs/reauditoria-cloud/` únicamente — los 2 modificados ajenos fueron **commiteados** por otro agente (esto ejecuta D3 de Kimi; ver §"Estado vivo").
Apps: app-bithire `8abd05578` (14 mods ajenas), app-evnto `6ff6ae9ec` (13), app-platform `44abb819` (10). Cero escritura mía en los 4 repos.

---

## Reproducción (hecho base, comando → salida)

### R1 · Callers de anatomía en las 3 apps

```
$ for app in app-bithire app-evnto app-platform; do rg -n "tenantThemeAnatomyAttributes|BITHIRE_ANATOMY" $app/src; done
app-bithire/src/vertical/model/profile/anatomy/index.ts:12,26-30   (BITHIRE_ANATOMY / _ATTRIBUTES)
app-bithire/src/app/layout.tsx:36,194                              (import + uso)
app-bithire/src/core/lib/theme/runtime-tenant-theme/contracts/index.ts:8,193
app-evnto    → vacío
app-platform → vacío
```
Confirmado con `grep -rn` plano y con `git show HEAD:<path>` (mismas 2 líneas). Historia: `d5e04a3ff` (2026-07-18) creó `BITHIRE_ANATOMY`; `f083d3ae1` (2026-07-18) creó la proyección SSR. **Ambos preceden a la auditoría Cloud por 6 semanas y el archivo no está modificado en el worktree.**

Los dos brazos aterrizan en el MISMO `<html>` (`app-bithire/src/app/layout.tsx:223-236`):
```tsx
<html lang={documentLang} dir={documentDir}
      {...scopedRootAttributes}
      {...bundledAnatomyAttributes}   // estático: BITHIRE_ANATOMY_ATTRIBUTES si NO hay artifact (layout.tsx:192-194)
      {...anatomyAttributes}          // DB: runtimeTenantThemeAnatomyAttributes(runtimeArtifact) (ssr/index.ts:98)
```
Cliente: `app-bithire/src/core/hooks/runtime-tenant-theme/index.ts:177` (montaje) y `:246` (refresh) reconcilian el set vía `claimRootAttributeSet`.

Consumo CSS: app-bithire 65 reglas `data-anatomy` en `.css`; app-evnto 0; app-platform 0. DS: 61 selectores (`card 15 · layout 17 · sidebar 8 · table 23`).

### R2 · Brazo estático del DS — control positivo en las dos mitades

```
$ grep -n anatomy src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts   → 0
$ grep -c chrome  (mismo archivo, control positivo)                                  → 34
$ grep -rn anatomy src/foundation/tokens/ts/presentation/brand-themes/               → 0
$ grep -rn "profile:" (mismos brand-themes, control positivo)                        → bithire:3168, rottay:3361
```
Tipo presente y sin autor: `BrandSidebarChrome.anatomy` `themes/index.ts:880`, `BrandLayoutChrome` `:932`, `BrandTableChrome` `:2061`, `BrandCardChrome` `:2110` — comentario del propio contrato: *"Bounded data-only anatomy selection; never emitted as CSS."* El `chrome` de BrandTheme declara las MISMAS 4 llaves (`:722 sidebar, :724 layout, :740 table, :742 cardComponent`) que `ANATOMY_ATTRIBUTE_BY_FAMILY` (`compilers/composition/tenant-theme/index.ts:1304-1309`).

**Contrato ejecutable** (dist fresco: 0 archivos de `src` más nuevos que `dist/server.js`):
```
$ node -e "compileBrandTheme(base) vs compileBrandTheme(base + las 4 anatomías)"
cssString identical       : true
cssVariables identical    : true
claves de retorno         : cssVariables, cssString, personality, tokenOverrides, engineBridge, recipeProfile
claves de root-attributes : 0
```
Es decir: en la puerta estática las 4 anatomías son **byte-inertes** y `CompiledBrand` **no tiene ninguna superficie de atributos de root**.

### R3 · `recipe-profile`

```
registry/index.ts:154-161   const { branding, tokenOverrides:_, appearance:_appearance, personality:_, brandTheme:_, ...identityAndBehavior } = config;   // _appearance nunca se restituye
registry/index.ts:55-63     interface CodeOwnedGovernedBehavior { motion?: {intensity,entranceDuration}; expressive?: BrandExpressiveSelection }
registry/index.ts:67-85     projectGovernedBehavior lee SOLO theme.motion y theme.expressive
provider/index.tsx:1118-1123 recipeProfileSelection = resolvedRuntimeConfig.appearance?.recipeProfile ? {...} : undefined
provider/index.tsx:1265-1267 <RecipeProfileProvider profileId={recipeProfileSelection?.profileId} …>
brand-themes/bithire/index.ts:3168  RECIPES = { schemaVersion:1, profile:"rottay/network-professional@1" }  → :9233 recipes: RECIPES
```
`createKnownTenant` (`registry/index.ts:95-115`) sí carga `brandTheme: entry.theme` y llama `projectGovernedBehavior(config.brandTheme)`: **el objeto `theme.recipes` está disponible en ese seam exacto** y no se proyecta.

### R4 · Conteo de `scope:`

```
$ grep -c "scope:" src/foundation/contracts/composition/tenants/capabilities/index.ts   → 23
$ grep -n  "scope:" …                                                                    → :43 es el TIPO; 22 literales de valor
$ python3 (parser de entradas)  → 28 `id:` · 22 con tier/scope/status · 6 sin
   tiers  : standard 14, pro 7, internal 1  = 22
   scopes : tenant 22
   status : active 21, frontier 1 (palette.status-seeds)
   internal = palette.dark-mode
```
Los 6 `id:` restantes son `FOUNDATION_AUTHORITIES` (`:896-965`), declarados en el propio archivo como *"Foundation derivation authorities: **NOT tenant dials by design**"*.
La declaración del campo es `readonly scope: 'tenant' | 'vertical';` (`:43`).
`manifest/controls/*.json` = 20 archivos, **20 con `scope: "tenant"`** (faltan los 2 no manifestados: `palette.dark-mode` interno y `palette.status-seeds` frontier).

### R5 · Censo de surfaces (universo declarado)

Universo: 39 archivos `index.tsx` bajo `src/ui/surfaces/presentation/pages/**`.

| Corte | n | Denominador |
|---|---|---|
| Consumen `useSurfaceProfileDefaultsWithOverrides` | **30** | 39 |
| Estampan `densityScopeAttributes` | **8** | 39 |
| Ambas cosas | **7** | 39 |
| Pasan literalmente `profileDefaults.density` | **6** | 30 |
| Resuelven `profileDefaults` y **no** estampan densidad | **23** | 30 |

Los 6: `admin/{billing,import-export,integration,profile,settings,team}`.
`admin/audit/index.tsx:155` estampa pero con `config.visual.density === 'compact' ? 'compact' : 'comfortable'` — **lee el config crudo y saltea el merge de overrides**.
`workspace/collection-workspace/index.tsx:1942,2219` estampa `density` de su hook local (`:899 controls?.density?.value ?? densityMode`), no consume `profileDefaults`.

`densityScopeAttributes` (`runtime/foundation/density/index.ts:95-99`) devuelve exactamente `{'data-density': posture}`; `density.css:37-45,60-62` re-declara la rampa en `[data-density='…']:not(:root)`. La mecánica de subárbol es real.
`DensityScope`: fuera de su definición y sus tests, los únicos hits en `src` son el barrel (`src/index.ts:195-201`) y un comentario (`theming/composition/react/tokens/index.ts:369`). **0 en las 3 apps.**

---

## Adjudicación por afirmación

| Afirmación | Quién | Cifra reproducida | Interpretación | Veredicto | Quién tenía razón |
|---|---|---|---|---|---|
| `tenantThemeAnatomyAttributes` "no tiene llamador en las 3 apps", con control positivo | Cloud H-B-4 | app-bithire `contracts/index.ts:8,193`; evnto 0; platform 0 | **Falso negativo**. El símbolo está commiteado desde 2026-07-18 y lo encuentran `rg` y `grep` plano. El control positivo del propio Cloud (`tenantThemeArtifactRootAttributes` en evnto) sí resolvía las rutas, así que no fue error de path | **REFUTADA** para bithire; CONFIRMADA para evnto/platform | **Codex** |
| "La anatomía sí llega a producción: BitHire estampa el brazo DB y mantiene atributos estáticos propios" | Codex RC-04 | layout.tsx:227-228 (los dos spreads), ssr:98, hook:177/246 | Exacto. Los dos brazos aterrizan en `<html>` y el estático cede ante el DB (`runtimeArtifact ? {} : BITHIRE_ANATOMY_ATTRIBUTES`) | **CONFIRMADA** | Codex |
| …**pero** el alcance es 1 de 3 apps | (nadie) | evnto 0 TS + 0 CSS; platform 0 TS + 0 CSS | `chrome.anatomy` es inalcanzable en **app-platform**, la única app cuya identidad de marca es DB-driven por ley del monorepo. Codex generaliza desde bithire; Cloud generaliza desde un grep roto. **Ninguno midió el reparto** | corrección a ambos | ninguno |
| El compilador estático no proyecta `data-anatomy-*`; `BrandCardChrome.anatomy` existe y nadie lo autora | Cloud H-F-2 | 0/34 y 0/2 con control positivo; compile A vs B byte-idéntico | Hecho **correcto y ahora probado ejecutablemente** | **CONFIRMADA** | Cloud |
| …pero es un hallazgo NUEVO | Cloud (implícito, "BLOQUEANTE") | `manifest/controls/chrome.anatomy.json` → `calibration.staticDoorDisposition.class = "STRUCTURALLY_UNREACHABLE"` | El programa **ya tiene el gap registrado, medido con las dos mismas mitades y con nombre de clase**: *"Gap REGISTRADO con su medicion, no arreglado por este packet"* | **CONFIRMADA CON CORRECCIÓN** (hecho sí, novedad no) | ninguno (tampoco Codex ni Kimi lo citaron) |
| Es "autoridad duplicada, no ausencia total" | Codex RC-04 | 1 solo proyector en el DS (`tenant-theme/index.ts:1312-1341`) | Impreciso. En el **DS** la autoridad es única (DB). La duplicación es **DS-DB vs app-estático**, planos distintos. La clase correcta la escribió el propio manifest: puerta estática *estructuralmente inalcanzable* | **PARCIAL** | corrección a Codex |
| El `BITHIRE_ANATOMY_ATTRIBUTES` de la app viola la frontera | (implicado por `forbiddenInitialDestinations: application-anatomy-patch`) | `root-attributes/registry/index.ts` docblock de `claimRootAttributeSet`, verbatim: *"That is what lets a vertical stamp a static baseline the server rendered and a tenant artifact override only the families it actually declares"* | **No viola**: el DS construyó el seam de set-claim precisamente para esto, y CLAUDE.md exige identidad vertical estática. La app es la **consecuencia registrada** de STRUCTURALLY_UNREACHABLE, no el defecto | **REFUTADA** | Cloud (su "nota de justicia" acierta; la evidencia correcta es más fuerte que la que dio) |
| `recipe-profile` no llega al runtime estático; `getCodeOwnedRuntimeConfig` descarta `appearance` | Cloud H-F-3 / H-B-3, Codex §6, Kimi | `registry:154-161`, `provider:1118-1123`, `projectGovernedBehavior` sólo motion+expressive | Reproducido línea por línea. El único canal alterno **no** lleva `recipes` | **CONFIRMADA** | los tres |
| No hay otro camino | los tres | `CodeOwnedGovernedBehavior` es el único; verificado leyendo su cuerpo | Cierto **en el camino de configuración**… | CONFIRMADA con matiz (ver hallazgo N-2) | los tres |
| `scope: surface\|instance` en el registro "mezcla mecanismos constitucionalmente separados" | Codex RC-04 | `adjudicatedDecisions.vocabularyDomicile.prohibited[2]` | Correcto **en el resultado y flojo en la cita**. La ley real es más dura y más específica: hay una **prohibición escrita, fechada y adjudicada** (2026-08-18, Fable+Kimi por delegación del owner) contra ensanchar `TenantCapabilityDeclaration` sin dos condiciones de disparo conjuntas | **CONFIRMADA CON CORRECCIÓN** | Codex |
| El modelo "no tiene eje de scope por debajo de tenant" | Cloud H-F-1 (BLOQUEANTE) | `customization-model/index.json:65` `resolutionOrder[5] = "caller-instance-props-where-contract-allows"`; `SurfaceVisualOverrides` docblock: *"**Instance-level** visual configuration … the highest typed DS configuration layer"*; `RecipeProfileProvider` docblock: *"Mounts the active recipe profile for **a subtree**"* | **Falso como enunciado.** El tier de instancia existe en la constitución, tiene contrato tipado con 12 ejes y tiene un provider anidable. Lo que falta es (a) alcance al DOM, (b) adopción, (c) dos ejes en ese contrato | **REFUTADA en su formulación** | ninguno (Codex frena bien pero no nombra el mecanismo que ya existe; Kimi se acerca) |
| "22/22 capacidades `scope:'tenant'`" | Cloud (prosa) | 22 registros, 22 literales | Correcto | **CONFIRMADA** | Cloud |
| "capabilities: 28 · scopes Counter({'tenant': **23**})" | Cloud (extracción) | 28 ids, de los cuales 6 son `FOUNDATION_AUTHORITIES` | El 23 sale de contar la **línea del tipo** (`:43`) como si fuera un valor. Su propia extracción contradice su prosa | **REFUTADA** | — |
| "son 23, no 22" | Kimi | idem | Mismo artefacto de conteo | **REFUTADA** | Cloud (prosa) |
| El eje `scope` es unario | los tres, implícitamente | `readonly scope: 'tenant' \| 'vertical'` (`:43`) | **Corrección a los tres**: el eje ya es **binario** y `'vertical'` tiene **0 usuarios**. Hay un valor declarado y muerto en el mismo campo que se discute ampliar | corrección | ninguno |
| "22 capacidades **activas**" | Cloud H-F-1 | 21 `active` + 1 `frontier` (`palette.status-seeds`) | Menor | CONFIRMADA CON CORRECCIÓN | — |
| `densityScopeAttributes` en 8 de 39 surfaces | Cloud H-F-4 | 8/39 exacto | | **CONFIRMADA** | Cloud |
| `profileOverrides.density` "no llega al DOM en 22 de 30" | Cloud H-F-4 | **24 de 30**; llega en **6** | Cloud contó los 8 estampadores como si los 8 estuvieran entre los 30 y pasaran `profileDefaults.density`. `collection-workspace` no consume profileDefaults y `admin/audit` lee el config crudo | **CONFIRMADA CON CORRECCIÓN** (−2) | Cloud, corregido |
| "montar `densityScopeAttributes` en las ~30 surfaces" | Kimi D6 | el trabajo real son **23** archivos (24 con el bypass de `audit`) | La vía intermedia es real y correctamente identificada; el tamaño estaba mal en los dos | **CONFIRMADA CON CORRECCIÓN** | **Kimi** (la vía), corregida la cifra |
| `DensityScope` con 0 consumidores | Cloud H-F-4 | 0 en DS-no-test, 0 en las 3 apps | | **CONFIRMADA** | Cloud |

---

## Causalidad y severidad

**Anatomía — cadena completa, con el punto de corte nombrado.**

```
DB : TenantThemeDocument.visualFoundation.advanced.chrome.<fam>.anatomy
     → compileTheme → artifact.normalizedAppearance.advanced.chrome
     → tenantThemeAnatomyAttributes (tenant-theme/index.ts:1312-1341)
     → data-anatomy-* en <html>  → 61 selectores en skins DS + 65 reglas en app-bithire   ✅ PINTA

Estático : BrandTheme.chrome.<fam>.anatomy
     → compileBrandTheme  ✗ CORTE AQUÍ (0 lecturas; salida byte-idéntica)
     → CompiledBrand no tiene superficie de root-attributes
     → (la app suple con literales: BITHIRE_ANATOMY_ATTRIBUTES)                            ⚠️ SUPLIDO FUERA DEL DS
```

Ley que se rompe, citada literal: `customization-model/index.json` → `transportEquality.inventory` = *"public-layer only: `--ds-*` emissions, **root attributes**, deterministic order, CSS and digest"*. Los atributos de root **están en el inventario de paridad**, y el brazo estático emite 0 donde el DB emite hasta 4 para valores equivalentes. Es una brecha de `transportEquality` por la propia letra de la ley — Cloud tiene razón en esto y Codex lo suaviza sin responder a la palabra "root attributes".

Severidad: **ALTA, no bloqueante**, por dos razones de programa que ninguno de los tres citó:
1. `manifest/controls/chrome.anatomy.json` → `calibration.nextAction` = *"SIGHTED n/a — terminal DATA proyectado a atributos de root. **Cierre por la puerta DB.**"* El programa ya decidió que este control cierra por DB.
2. `adjudicatedDecisions.chromeFamiliesDestination.mandatorySequence` pone `chrome.anatomy` en el **paso (b)** ("las cinco filas de dominio cerrado y **cero autores**") y su `prohibited` incluye *"arrancar por (b) o (c) sin haber ejecutado (a)"*, donde (a) es *productores primero*. **La optimización de Cloud está secuencialmente bloqueada, no equivocada.**

**`recipe-profile` — cadena completa.**
```
BrandTheme.recipes.profile ("rottay/network-professional@1")
  → compileBrandTheme valida (brand-theme/index.ts:2073-2078)
  → 2081: cssVariables["--ds-recipe-profile"] = '"…"'      → 0 lectores CSS/TS   ✗
  → 2139: return { …, ...(recipeProfile ? {recipeProfile} : {}) }  → 0 consumidores ✗  ← NADIE LO VIO
  → único caller de producción: scripts/verticals/build-vertical-artifacts (sólo escribe .css)
provider: appearance?.recipeProfile → undefined para code-owned → RecipeProfileProvider(undefined)
  → useRecipeProfileDefaults('card'|'button'|'tabs'|'tag'|'sectionCard'|'dataTable') → {}
```
Severidad **ALTA y accionable**: 6 familias caen a defaults de engine en las 3 verticales de producción.

---

## Fix correcto (tipo, sin implementar) y fixes que NO deben ejecutarse

**F-1 · `recipe-profile` — el fix correcto es de 2 archivos y ~4 líneas, con precedente escrito en el mismo archivo.**
Ampliar `CodeOwnedGovernedBehavior` con `recipes?: BrandRecipeSelection`, proyectarlo en `projectGovernedBehavior` (que ya recibe el `brandTheme` completo, `registry/index.ts:67-85`), y en `provider/index.tsx:1118-1123` usar `governedBehavior?.recipes?.profile` como fallback del `dbProfile`. El docblock de `registry/index.ts:38-54` **ya justifica exactamente esta figura** para motion y expressive: *"the same field also carried three governed BEHAVIOR channels that no stylesheet can express"*. `recipes.profile` es de esa clase (dato tipado que lee `useRecipeProfileDefaults`, nunca CSS).
Riesgo: **BAJO en mecánica, MEDIO en producto**. Enciende de golpe defaults de 6 familias en 3 verticales → cambio de pintura visible. `manifest/controls/recipe-profile.json` → `calibration.nextAction = "OBTAIN_SIGHTED_ACCEPTANCE"`: el fix **no cierra el control** sin diff sighted. Es un lote con captura A/B, no un one-liner suelto.
Alternativa peor: llevar `CompiledBrand.recipeProfile` (2139) al provider. Existe, pero el provider no recibe `CompiledBrand` (el artefacto vertical es CSS), así que exigiría un canal nuevo. La ruta `governedBehavior` no inventa canal.

**F-2 · Anatomía estática.** El fix es una función pura `brandTheme.chrome.{4}.anatomy → los 4 atributos` reusando `ANATOMY_ATTRIBUTE_BY_FAMILY`, más autoría en los 3 BrandThemes, más borrar `BITHIRE_ANATOMY`. Es correcto y barato — **pero está bajo el paso (b) de una secuencia obligatoria cuyo paso (a) es previo y prohibido saltear**. Recomendación: **no ejecutarlo ahora**; sí ejecutar el paso barato que sí es admisible hoy, abajo.

**F-3 · Cerrar el punto ciego del gate (esto sí es admisible y urgente).** Ver hallazgo N-1. Añadir a `auditDataOnlyProjections` la exigencia de que la proyección rostered sea alcanzable **por cada transporte que declara el owner** (o, mínimo, registrar `staticDoorDisposition` como entrada de gate y no sólo como prosa del manifest). Hoy el gate certifica 4 hojas estáticas con un productor que sólo corre en DB.

**F-4 · Densidad por surface.** Montar `densityScopeAttributes(profileDefaults.density)` en los 23 archivos que ya resuelven `profileDefaults` y no estampan, + corregir el bypass de `admin/audit`. Una línea por archivo, cero API nueva, cero decisión de owner. Es la propuesta de Kimi con el número correcto.

### Fixes que NO deben ejecutarse

- **`scope: 'tenant' | 'surface' | 'instance'` en `TenantCapabilityDeclaration`** (Cloud H-F-1). Prohibido por ley escrita: `adjudicatedDecisions.vocabularyDomicile.prohibited[2]` = *"ensanchar TenantCapabilityDeclaration sin las dos condiciones de disparo cumplidas a la vez"*, con `triggerCondition` = *"un CONSUMIDOR RUNTIME que necesite el mapa estructurado **Y** que NO pueda leerlo del dueño canónico en fuente. Las dos condiciones son conjuntas."* Ninguna se cumple: el consumidor de scope no existe, y el tier de instancia ya tiene dueño (`SurfaceVisualOverrides`). Además `domain` en `manifest/controls/*.json` es **generado** (`manifest/generator/index.mjs:201-236`, sólo preserva `calibration` y `retiredAliases`), así que un campo nuevo ahí se borraría en silencio.
- **`<Box data-anatomy-card="framed">` como scope de subárbol** (el "Camino C" de Cloud). `data-anatomy-*` es un namespace de **root** con un dueño único; el docblock de `claimRootAttributeSet` dice que el prefijo *"is enforced, not decorative: a set claim is an owner of one namespace, and a `reconcile` that could reach `data-theme` would be a second authority over a channel with a different owner"*. Usarlo por subárbol crea la segunda autoridad. Cloud ya lo marca "off-contract"; queda ratificado: **no ejecutar**, y no hay gate que lo detecte (mismo punto ciego que N-1).
- **`tokens?: Partial<Record<CardInstanceHook,string>>` presentada como respuesta al scope.** Es una pregunta de **promociones** (`PROMOTIONS` en `ds-hook-manifest`), no de scope, y arrastra la decisión de inventario de H-F-5. No mezclarla con el eje de instancia.

---

## Separación pedida: qué es admisible sin decisión del owner y qué no

| Pieza de la propuesta de Cloud | Mecanismo (README:161-166) | Veredicto |
|---|---|---|
| Montar `densityScopeAttributes(profileDefaults.density)` en las surfaces que faltan | 2 (anatomía/recetas por atributo) + 3 (instancia) | **Admisible sin decisión.** Monta lo que existe, en su propio tier, sin API nueva |
| Envolver una página en `<RecipeProfileProvider profileId=…>` | 2 — *"selects a finite structure through typed data, **props** or root attributes"* | **Admisible sin decisión.** El provider ya es un Context anidable y `useRecipeProfileDefaults` declara *"Explicit caller props always win"*, que es literalmente `resolutionOrder[5]` |
| Documentar `profileOverrides` como la vía oficial por página | 3 | **Admisible sin decisión.** Su propio docblock ya lo declara instance-level |
| Añadir `anatomy?:` y `recipeProfile?:` a `SurfaceVisualOverrides` | 3 (instance API) | **Admisible con decisión de diseño, NO constitucional.** Es el tier de instancia extendiéndose en su propia casa; no toca `TenantCapabilityDeclaration` ni el pipeline de tenant. Es la forma correcta del pedido "esta página con otra postura" |
| `SurfaceScope` que monte los tres a la vez | 3 | **Admisible** si compone lo anterior y **no** re-estampa `data-anatomy-*` a nivel de subárbol (ver prohibición arriba) |
| `scope: surface\|instance` en el registro de capacidades | 1 (theme control) invadiendo 3 | **PROHIBIDO sin enmienda escrita del owner.** Ley fechada 2026-08-18 |
| `tokens` prop acotada por promociones | promoción de hooks, no scope | **Decisión separada**, no pertenece a este eje |

Respuesta directa a la pregunta del team-lead: **la propuesta de Cloud vive mayoritariamente en el mecanismo "instance API"/"recipe" y NO en "theme control"** — salvo la única pieza que la lleva al registro tenant, que es justamente la que la constitución prohíbe. Codex acierta el freno; se equivoca al implicar que **toda** la propuesta mezcla mecanismos. Cloud acierta la necesidad; se equivoca al enunciar que el eje no existe, cuando existe y él mismo lo documentó tres hallazgos más abajo (H-F-7).

---

## Hallazgos nuevos que ninguno de los tres vio

### N-1 · BLOQUEANTE (instrumento) · El gate de paridad exime las 4 hojas ESTÁTICAS de anatomía citando un productor que sólo corre en DB

`scripts/lib/tokens/theme-channel-parity-graph/index.mjs` congela `DATA_ONLY_THEME_PROJECTIONS` con las 4 hojas `Brand*Chrome.anatomy` y declara: *"a leaf leaves the CSS-channel denominator only if it appears here **AND the compiler source proves the projection**"*. La prueba se busca con `collectDataOnlyAttributeProjections(projectionSources)`, y `projectionSources` es **todo el árbol `compilers/**`** (`theme-channel-parity-gate/index.mjs:135-137`), sin distinguir transporte.

Corrido en lectura:
```
$ node scripts/tokens/theme-channel-parity-gate/index.mjs --current-json
proven      : BrandCardChrome.anatomy, BrandLayoutChrome.anatomy, BrandSidebarChrome.anatomy, BrandTableChrome.anatomy
projections : data-anatomy-card <- [cardComponent].anatomy (tenantThemeAnatomyAttributes)   [×4]
violations  : []
$ node scripts/tokens/theme-channel-parity-gate/index.mjs --check --quiet ; echo $?
0
```
`tenantThemeAnatomyAttributes` lee `artifact.normalizedAppearance` — una forma que el transporte estático **no produce**. O sea: **4 hojas de `BrandTheme` salen del denominador de canales muertos con el recibo de un productor que nunca corre para `BrandTheme`.** El gate está verde mientras el campo es byte-inerte (probado ejecutablemente arriba).

El punto ciego tiene **dirección**: sólo puede conceder la exención, nunca detectar la brecha de transporte. Es el instrumento que mantiene invisible el hecho que Cloud, Codex y Kimi estuvieron discutiendo tres veces sin encontrar quién lo tapa. `anatomy-variant-gate --check` también sale `EXIT=0`: verifica contrato↔selector de skin en ambas direcciones, nunca transporte↔atributo.

**Y el registro que sí describe el defecto no lo lee nadie.** `staticDoorDisposition` — el campo donde el programa escribió `STRUCTURALLY_UNREACHABLE` con su medición — aparece en **exactamente 2 archivos de datos y en cero código**:
```
$ grep -rn "staticDoorDisposition" --include='*.mjs' --include='*.json' --include='*.ts' .   (sin node_modules)
  1 manifest/controls/chrome.anatomy.json
  1 manifest/controls/profiles.icon.json
control positivo (campo hermano de la misma clave `calibration`):
$ grep -rn "catalogLaw" scripts/ --include='*.mjs'  → program-check.mjs:504   ✅ sí tiene lector
```
O sea: el hallazgo está **registrado pero inerte**. Ningún gate lo cuenta, ningún checker lo exige, nada impide que la lista crezca. Es prosa dentro de un JSON, en un programa cuya propia ley dice *"LOS HECHOS SE GENERAN, LAS DECISIONES SE AUTORAN"*.

### N-2 · ALTO · El compilador estático **ya devuelve** `recipeProfile`; el valor existe y nadie lo lee

`compilers/kernel/runtime/brand-theme/index.ts:2139` → `...(recipeProfile ? { recipeProfile } : {})` sobre `CompiledBrand`. Probado ejecutablemente: `compileBrandTheme({brandTheme:{recipes:{schemaVersion:1,profile:'rottay/technical-sharp@1'}},…}).recipeProfile === "rottay/technical-sharp@1"`.
Consumidores de `CompiledBrand.recipeProfile`: **0**. Control positivo en el mismo archivo: `experienceProfile` (`:2088-2097`) **sí** tiene cadena viva → `icons/active-profile/index.ts:146` → `provider/index.tsx:377`.
El `witnessScopeNote` del manifest (DT RULING F4B-15) documenta las dos superficies desacopladas pero **no menciona que el valor ya está validado y devuelto**. Importa para el fix: no hay que re-derivar nada, y `validateRecipeProfileSelection` ya es compartida por los dos transportes.

### N-3 · MEDIO · `chrome.anatomy` es inalcanzable justamente en `app-platform`, la única app DB-driven por ley

app-platform: 0 hits de `data-anatomy` en `.ts/.tsx` y 0 en `.css`. Por `CLAUDE.md` ("System Ownership Rules → Vertical identity vs tenant branding"), app-platform es **la única excepción sancionada para branding DB-driven** porque administra tenants. Es decir: el brazo que sí funciona en el DS (DB) no está montado en la app que existe para ejercerlo, y el brazo que no funciona (estático) es el que la app que sí lo monta (bithire) tuvo que suplir a mano. La asimetría está cruzada respecto de la ley del monorepo. Ninguno de los tres midió por app.

### N-4 · MEDIO · El eje `scope` ya es binario y su segundo valor está muerto

`TenantCapabilityDeclaration.scope: 'tenant' | 'vertical'` (`capabilities/index.ts:43`), con **0 de 22** capacidades usando `'vertical'`. La discusión de los tres ("22/22 son tenant", "hay que agregar surface|instance") ignora que el campo ya tiene un valor declarado sin uso. Cualquier decisión del owner sobre este eje debería resolver primero qué significa `'vertical'` y por qué nadie lo escribe — retirarlo o poblarlo — antes de proponer un tercer y cuarto valor.

### N-6 · ALTO · `recipe-profile` es el único de los tres controles de esta clase **sin clasificar**, y el precedente de su fix ya tiene nombre adjudicado

Sólo dos controles llevan `calibration.staticDoorDisposition`:

| Control | class | Qué dice |
|---|---|---|
| `chrome.anatomy` | `STRUCTURALLY_UNREACHABLE` | el compilador estático no la lee y no hay consumidor del tema crudo |
| `profiles.icon` | `RUNTIME_ONLY_NO_ARTIFACT` | *"Alcanzable en produccion SOLO por lectura de runtime del tema crudo — el provider pasa `governedBehavior` a `resolveActiveIconExpressiveProfile`"* |
| `recipe-profile` | **`null`** | sin clasificar |

`RUNTIME_ONLY_NO_ARTIFACT` **es exactamente la forma que tendría `recipe-profile` después del fix F-1**: valor que viaja por `governedBehavior` y se lee en el provider, sin pasar por el artifact. El precedente no hay que inventarlo — está adjudicado, nombrado y en producción para `profiles.icon`.

Consecuencia práctica: el primer movimiento correcto sobre `recipe-profile` no es el parche, es **clasificarlo**. Hoy no encaja en ninguna de las dos clases existentes (su puerta estática **sí** computa el valor y lo **descarta** — ver N-2), lo cual es una tercera clase que el programa no tiene. Que un control OPERATIONAL con `nextAction: OBTAIN_SIGHTED_ACCEPTANCE` no tenga disposición de puerta estática mientras sus dos hermanos sí la tienen es, por sí solo, un agujero de censo.

### N-5 · BAJO · `admin/audit` estampa densidad salteando el merge de overrides

`admin/audit/index.tsx:155` usa `config.visual.density` crudo en lugar de `profileDefaults.density`, mientras las otras 6 surfaces `admin/*` usan el valor mergeado. Un `profileOverrides.density` puesto en el config de `audit` recalcula `sectionSpacing`/`tabsType` en JS pero **no** cambia el `data-density` del DOM. Es un bypass de una línea dentro del grupo que sí adoptó el mecanismo.

---

## Estado vivo (relevante para el team-lead)

- **D3 de Kimi quedó ejecutado durante esta sesión**: el fix de `schemaVersion` del `public-entrypoint-boundary-gate` fue commiteado como `ecdc01a61`, y `f166570d9` asienta el §13. El worktree del DS ya no tiene modificados ajenos; sólo `?? docs/reauditoria-cloud/`.
- El mensaje de `f166570d9` declara además una **deuda con dueño** no relacionada con este brazo: un drill de `cascade-producers` muta el artefacto real en disco y un Ctrl-C lo deja corrupto y trackeado.

---

## Lo que no pude cerrar

1. **No verifiqué el DOM real.** Todo lo anterior es fuente + contrato ejecutable del compilador. No corrí navegador, así que no tengo computed/sighted de que las 65 reglas `data-anatomy` de app-bithire efectivamente pinten distinto — sólo que el atributo se estampa y los selectores existen. Cerrarlo requiere captura con `data-anatomy-card` presente vs ausente.
2. **No medí si algún tenant DB real autora `advanced.chrome.*.anatomy`.** El proyector funciona; si ningún documento de producción declara anatomía no-`default`, el brazo DB estaría vivo pero sin uso. Requiere leer la DB, vedado en esta sesión.
3. **No adjudiqué si `'vertical'` en `scope` es residuo o reserva** (N-4). No encontré ruling que lo mencione; puede estar en un asiento fuera del repo.
4. ~~No verifiqué si `staticDoorDisposition` tiene lector.~~ **Cerrado**: cero lectores en todo el repo, con control positivo (`catalogLaw` sí lo tiene). Ver N-1 y N-6.
5. **No sondeé si `program-check.mjs` debería exigir `staticDoorDisposition` para todo control con puerta estática declarada en `ingress.staticBrandThemePath`.** Sería el ratchet natural para N-6 (los 20 controles manifestados declaran esa ruta; sólo 2 tienen disposición), pero no leí el checker completo y no quiero convertir una observación en una propuesta de gate sin conocer su modelo de estados.
