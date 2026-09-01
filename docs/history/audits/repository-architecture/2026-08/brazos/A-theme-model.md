# A — Modelo de theme y paridad de transporte (estático vs DB) — 10 ópticas

Método: instrumentación ejecutable, no lectura de prosa. Bundleé la fuente con
`node_modules/.bin/esbuild --alias:@=$PWD/src` (read-only, salida en scratchpad) y corrí
`compileTenantThemeConfig` / `compileTheme` / `migrateV1` reales. Los censos de CSS son sobre
`packages/core/src/**/*.css` (473 archivos) con un grafo transitivo de `var()`.

Scripts reproducibles: `scratchpad/reaud-A-{maximal,diff,causal,graph,reach}.mjs`.

## Puntaje por óptica

| # | Óptica | Puntaje | Evidencia (1 línea) |
|---|---|---|---|
| 1 | Un solo `compileTheme` | **4** | Ambos brazos terminan en `compileBrandTheme`; pero hay 2 emisores CSS y un normalizador exclusivo del DB |
| 2 | Completitud del contrato `Theme` | **2** | 5.763 de 7.933 keypaths que los 3 verticales estáticos SÍ escriben son inalcanzables desde el documento DB (72,6%) |
| 3 | `ThemePatch` / merge determinista | **4** | `resolveTheme` = deep-merge fail-closed; pero el mismo valor del tenant se aplica en 3 posiciones distintas |
| 4 | Fail-closed ante input inválido | **5** | 16/16 casos hostiles rechazados con `code` + `path` tipados (matriz abajo) |
| 5 | Restore exacto | **5** | Documento identidad → overlay de **0** variables; el artefacto es delta puro contra el baseline |
| 6 | Determinismo / digest / cache | **3** | Digest canónico correcto, pero ni el digest ni la cache key incluyen la versión del DS ni el baseline vertical |
| 7 | Dark mode / modos | **2** | El contrato es mode-aware (492 hojas en `modes.dark` de bithire); el DB sólo puede escribir 10 hojas de paleta por modo |
| 8 | Envelopes / bounds por vertical | **3** | Existen y se aplican fail-closed, pero son casi idénticos entre verticales y el editor sólo clampea 4 de 6 rangos |
| 9 | Entrega runtime | **4** | Un solo camino productivo, SSR embebe `artifact.css` + prepaint, provider no pinta; resolver de 6 etapas es compat-only |
| 10 | Dos tenants = proyectos distintos | **3** | 185 canales del tenant DB alcanzan 8.636/13.792 declaraciones de pintura modern (62,6%), pero 2 de 13 controles Standard tienen alcance CERO |

---

## Hallazgos (ordenados por severidad)

### H-A-1 · BLOQUEANTE · `shape.button-style` es un control Standard con alcance de pintura CERO

- **Qué**: uno de los 13 controles Standard emite un único canal, `--ds-radius-button`, que NINGUNA
  regla de pintura del DS lee. El skin del botón pinta desde otra cadena. Un tenant que elige
  `pill` no obtiene botones pill.
- **Evidencia**:
  - Compilación real (`reaud-A-causal.mjs`):
    `buttonStyle=sharp → {"--ds-radius-button":"calc(2px / 1.25 * var(--ds-radius-scale, 1))"}`,
    `soft → var(--ds-radius-md, 8px)`, `pill → calc(9999px / 1.25 * ...)`. Δ=1 en los tres.
  - `src/foundation/tokens/css/runtime/engines/modern/skin/button.css:73`
    `--_ds-button-resolved-radius: var(--ds-button-md-radius, var(--ds-radius-md));` — la línea 116
    pinta `border-radius: var(--_ds-button-resolved-radius)`. No lee `--ds-radius-button`.
  - Único lector de `--ds-radius-button` en todo `src/**/*.css`:
    `src/foundation/tokens/css/runtime/engines/modern/framework-token-projection.css:43`
    `--radius-field: var(--ds-radius-button);` → puente al framework, sin consumidores propios.
  - En el bundle publicado: `grep -c "ds-radius-button" styles/bithire.css` → **3** (todas
    declaraciones); `grep -o "var(--radius-field[,)]" styles/bithire.css | wc -l` → **0**.
    Control positivo: `grep -o "var(--ds-button-md-radius[,)]" styles/bithire.css | wc -l` → **6**.
  - Cierre transitivo (`reaud-A-graph.mjs`): closure=2 custom props, **0** declaraciones de pintura,
    **0** archivos.
- **Impacto en el objetivo del owner**: el "par de decenas de controles que cambian el skin real"
  incluye uno que no cambia nada. La silueta del botón es, junto al radio y la tipografía, el rasgo
  que más rápido lee un humano al comparar dos productos.
- **Optimización concreta**: hacer que la rama `buttonStyle` de `appearance-posture` escriba también
  la familia `--ds-button-{xs,sm,md,lg,xl}-radius` (los canales que `button.css` realmente lee), o
  cambiar `button.css:73` a `var(--ds-button-md-radius, var(--ds-radius-button, var(--ds-radius-md)))`.
  La segunda es de una línea y no rompe a quien ya escribe los per-size.

### H-A-2 · BLOQUEANTE · El transporte DB no puede expresar 5.763 keypaths que el estático sí escribe

- **Qué**: la asimetría no es "el DB es un subconjunto acotado" en el sentido benigno; es que la
  mayor parte de la identidad visual de un vertical vive fuera del alcance del documento.
- **Evidencia** (`reaud-A-diff.mjs`; unión de las hojas reales de `FIRST_PARTY_THEMES` de los 3
  verticales, sin `id/name/extends`, contra el conjunto de keypaths que `migrateV1` produce
  alimentándolo con un documento MAXIMAL derivado del propio `TENANT_THEME_CONFIG_SCHEMA` en los
  3 `backgroundMode` × 2 `defaultMode`):

  ```
  hojas Theme escritas por los 3 verticales : 7.933
  hojas alcanzables desde el documento DB   : 2.198
  SÓLO-ESTÁTICO (el DB no puede expresar)   : 5.763   (72,6%)
  SÓLO-DB                                   :    28
  ```

  Desglose de las 5.763:

  ```
  5.150  modes.*   (4.012 chrome, 752 surfaces, 304 palette, 162 typography)
    168  surfaces.materials.*      (8 roles x 21 facetas)
     80  palette.ramps.*           (8 roles x 10 pasos, escalones a mano)
     46  chrome.premiumCard.*      (familia fuera del envelope: 48 familias admitidas)
     18  chrome.list   17 chrome.surface   16 chrome.badge   13 chrome.detail
     12  motion.value.*            11 palette.aliases.*      8 charts.value.*
      6  surfaces.elevations.*     (la escalera 0..5 completa)
      1  appearance.defaultMode
     15  capabilities.*            (correcto: gobernanza, no debe cruzar)
  ```
- **Nota de honestidad**: el propio DS lo reconoce. `tests/static-db-channel-vocabulary.test.ts:16-19`
  declara la ley como *"sobre las familias core compartidas, todo canal que el DB emite lo emite
  también el estático"* — no igualdad. Mi número cuantifica esa desigualdad.
- **Impacto**: un tenant DB nunca podrá tener la profundidad de art direction de un vertical
  code-owned. Para "parecer un proyecto distinto" alcanza (ver H-A-9 / óptica 10), pero para
  "parecer un producto propio con su propia escalera de sombras, sus rampas de color afinadas a mano
  y su modo oscuro autoral" no.
- **Optimización concreta**: priorizar por reach, no por conteo. Las tres aperturas con mejor
  relación esfuerzo/impacto son (a) `palette.ramps` (80 hojas, alimenta 8 familias de color enteras),
  (b) `surfaces.elevations` niveles 0/4/5 (6 hojas, cierra H-A-4), (c) `modes.dark.surfaces` +
  `modes.dark.typography` (ver H-A-3). `modes.*.chrome` (4.012) NO vale la pena: es donde el
  documento explotaría el límite de 65.536 bytes.

### H-A-3 · ALTO · El modo oscuro es de primera clase en el contrato y de tercera en el transporte DB

- **Qué**: `BrandThemeModeOverlay` (`contracts/.../themes/index.ts:160-165`) admite
  `palette | typography | surfaces | chrome` por modo, y el compilador emite `modeBlocks` reales.
  `migrateV1` sólo produce `modes.{light,dark}.palette` y sólo las 10 semillas de
  `paletteFields()` (`migrate-v1/index.ts:381-393`).
- **Evidencia**:
  - Hojas reales por modo en los temas estáticos:
    `bithire modes.dark = 492` (121 palette, 3 typography, 79 surfaces, 289 chrome);
    `rottay = 658`; `evnto = 138`.
  - Keypaths `modes.*` alcanzables desde el DB (salida de `reaud-A-maximal.mjs`): **20**
    (10 en `modes.light.palette`, 10 en `modes.dark.palette`).
  - Semántica silenciosa: con `backgroundMode:'dark'`, las semillas de nivel superior customizan el
    modo oscuro y el sub-objeto `palette.dark` queda **inerte** — `migrate-v1/index.ts:405-407`
    (`lightPalette = mode === "dark" ? undefined : basePalette`). Un editor que rellene ambos ve su
    `dark` descartado sin aviso. Verificado: `backgroundMode:'dark'` + seeds claras → rechazo APCA
    (`dark --ds-color-text-primary has APCA Lc 7.8`), no un aviso de campo ignorado.
  - `backgroundMode:'auto'` SÍ funciona y emite el bloque `@media (prefers-color-scheme: dark)`
    (verificado con las propias seeds claras+oscuras de bithire: `baseΔ=7 modeΔ=dark:6 prefers-cs=true`).
- **Impacto**: el "tenant totalmente diferente" es diferente sólo en modo claro. En oscuro hereda la
  superficie, la tipografía y el chrome del vertical.
- **Optimización concreta**: (1) admitir `dark.typography` / `dark.surfaces` en el schema v1 (unas 30
  hojas, no 4.012); (2) hacer que `palette.dark` con `backgroundMode !== 'auto'` sea un
  `TenantThemeValidationIssue` explícito en vez de un descarte silencioso — hoy sólo lo salva por
  accidente el piso APCA.

### H-A-4 · ALTO · `surfaces.elevation` mueve 0 variables en bithire y sólo 3 de 6 niveles en el resto

- **Qué**: el control de postura de elevación escribe únicamente `--ds-elevation-1/2/3`. Los niveles
  0, 4 y 5 nunca se mueven. En bithire dos de sus tres opciones son identidad.
- **Evidencia** (compilaciones reales, `reaud-A-*`):

  ```
  bithire  flat Δ=0   soft Δ=0   elevated Δ=3
  evnto    flat Δ=3   soft Δ=0   elevated Δ=3
  rottay   flat Δ=3   soft Δ=0   elevated Δ=3
  ```

  `soft` es identidad en los tres verticales (el preset `soft` es `{}`). `elevated` emite siempre
  `{"--ds-elevation-1":"0 2px 4px rgba(0,0,0,0.08)", "--ds-elevation-2":"0 4px 8px rgba(0,0,0,0.1)",
  "--ds-elevation-3":"0 8px 16px rgba(0,0,0,0.12)"}` — genérico, sin tinte ni inset.
- **Agravante en rottay**: rottay escribe una escalera dark-first de 6 niveles con inset highlight y
  glow teñido con `color-mix(... var(--ds-color-primary) 8%)`. Elegir `elevated` **reemplaza los
  niveles 1-3 por sombras genéricas y deja 0/4/5 con el diseño de rottay** → escalera incoherente.
- **Impacto**: la elevación es una de las dimensiones que el owner nombra. Hoy ofrece 1 stop útil
  (bithire) o 2 (evnto/rottay), y el útil degrada la dirección de arte del vertical.
- **Optimización concreta**: extender `ELEVATION_PRESET` a los 6 niveles y derivar los presets del
  ladder autoral del vertical (multiplicador/atenuación) en vez de sustituirlo por literales.
  Alternativamente exponer `surfaces.elevations` (6 hojas) al documento, que es lo que hace el
  transporte estático.

### H-A-5 · ALTO · Ejes Pro con vocabulario sin efecto: 15 de 34 stops compilan a cero canales

- **Qué**: el catálogo comercial ofrece opciones que no producen ningún cambio.
- **Evidencia** (barrido exhaustivo de cada valor de enum contra el envelope de bithire):

  ```
  profiles.type       (4)  technical:10  editorial:7   humanist:4   geometric:10
  profiles.geometry   (4)  sharp:36      soft:36       rounded:36   pill-accented:36
  profiles.edge       (5)  borderless-shadow:2  hairline:0  outlined:2  ruled:1  inset-double:5
  profiles.material   (5)  flat:0        paper:3       soft-depth:1 frosted:1   luminous:2
  profiles.elevation  (5)  flat:0        hairline-lift:0  soft-depth:3  dramatic:6  luminous-glow:6
  profiles.motif      (7)  none:0  micro-grid:0  dots:0  pinstripe:0  deco-fan:0  ambient-orbs:0  contour:1
  profiles.icon       (4)  linear:0  strong-outline:0  duotone:0  solid-active:0
  responsivePosture   (3)  compact:0     balanced:0    expansive:0
  recipeProfile       (3)  → 1 canal (--ds-recipe-profile), 0 lectores CSS
  ```
- **Matices verificados (a favor)**: `profiles.icon` NO es inerte — viaja como DATO y
  `graphics/icons/runtime/semantic/create-icon/index.tsx:162` llama
  `useActiveIconExpressiveProfile()` incondicionalmente en cada icono generado. `chrome.anatomy`
  tampoco es inerte: Δ=0 canales pero estampa 4 atributos `data-anatomy-*`
  (13/21/6/12 selectores CSS respectivamente).
- **Matices verificados (en contra)**: `responsive.posture` no emite canal Y su único consumidor es
  `src/ui/patterns/runtime/adaptive-layout/presentation/react/index.ts` (4 importadores en `src/ui`).
  `profiles.motif` con 6 de 7 stops a cero es un vocabulario decorativo sin implementación.
  `--ds-recipe-profile` aparece 2 veces en todo `src/**/*.css`, ambas como declaración en artefactos
  compilados; cero lectores.
- **Impacto**: el catálogo publicado sobre-promete. Un cliente que elige `motif: deco-fan` o
  `responsivePosture: expansive` no ve nada y no recibe error.
- **Optimización concreta**: o se implementa el lowering de motif/responsive, o se los retira del
  enum del schema hasta que exista. Un enum cerrado que acepta y no hace nada es peor que un enum
  más chico: rompe la ley fail-closed en su espíritu (acepta lo que no puede honrar).

### H-A-6 · MEDIO · Dos emisores CSS con salida asimétrica (`color-scheme`, tinta raíz, orden)

- **Qué**: la óptica 1 se cumple en el LOWERING (un solo `compileBrandTheme`), pero no en la EMISIÓN.
- **Evidencia**:
  - Estático: `runtime/tenant-css/artifact-renderer/index.ts:151-183` → emite `color-scheme: <modo>`,
    `color: var(--ds-color-text-primary)` (con `throw` si falta la tinta), claves **ordenadas**,
    banner, y `projectFirstPartyArtifactScopes`.
  - DB: `composition/tenant-theme/index.ts:1689-1728` (`renderArtifactCss`) → **no** emite
    `color-scheme` en ningún bloque, **no** emite tinta raíz, y es el único que sabe emitir
    `@media (prefers-color-scheme: dark)`.
  - Verificado en los artefactos publicados: `grep -c 'color-scheme:' src/foundation/tokens/css/facade/artifacts/*/index.css`
    → 2 en cada uno; `grep -c 'prefers-color-scheme'` → **0** en los tres. O sea: el estático tiene
    `color-scheme` y no tiene `auto`; el DB tiene `auto` y no tiene `color-scheme`. Asimetría en
    ambas direcciones.
  - El hueco de `color-scheme` está tapado, pero por otro mecanismo:
    `runtime/theming/composition/react/provider/index.tsx:205-211` lo dice explícitamente
    ("the DB compiler emits no `color-scheme` of its own") y lo reclama inline con JS; el prepaint
    (`runtime/foundation/root-attributes/ssr/index.ts:117`) hace `r.style.colorScheme=t`.
- **Impacto**: sin JS, un tenant DB en fondo oscuro conserva el `color-scheme` del vertical →
  scrollbars, `<select>`, date pickers y autofill nativos en claro sobre fondo oscuro.
- **Optimización concreta**: que `renderArtifactCss` emita `color-scheme` cuando
  `normalizedAppearance.general.palette.backgroundMode` lo determina, y que el emisor de bloques de
  modo estático aprenda el `@media` de `auto`. Mejor aún: un solo `renderThemeCss(scopes, vars,
  modeBlocks, opts)` compartido por ambos renderers — hoy hay dos gramáticas para el mismo problema
  (`themeModeSelector` ya está compartido, es el resto lo que no).

### H-A-7 · MEDIO · Ni el digest ni la cache key del artefacto conocen la versión del DS

- **Qué**: el artefacto DB es un **delta** contra `compileTheme(baseTheme)`. El baseline cambia con
  cada release del DS. Nada en la identidad del artefacto refleja eso.
- **Evidencia**:
  - `digestSource` (`tenant-theme/index.ts:2153-2172`) incluye `schemaVersion`, `compilerVersion`,
    `coverage`, identidad, `rowVersion`, `normalizedAppearance`, `variables`, `modeDeltas`, `scopes`,
    `verticalEnvelopeDigest`. No incluye la versión del paquete ni un digest del `baseTheme`.
  - `TENANT_THEME_COMPILER_VERSION = "tenant-theme-compiler@4"` es una constante a mano
    (`composition/tenant-theme/version/index.ts:2`). `git log --oneline -- <ese archivo>` → **1 commit**;
    `git log --oneline --since=2026-08-01 -- packages/core/package.json` → **24 commits**.
  - Cache key en la app: `app-bithire/src/core/lib/theme/runtime-tenant-theme/artifact-resolution/index.ts:254`
    → `` `${config.tenantId}:${config.rowVersion}:${TENANT_THEME_COMPILER_VERSION}` ``.
  - El ETag que llega al navegador es `"tenant-theme-${artifact.digest}"` (ibíd. :267) y se usa para
    304 en `app/api/public/tenant-branding/[slug]/route.ts:103` y `by-host/route.ts:79`.
- **Impacto**: la respuesta a "¿un tenant publicado con DS 2.19.29 sigue válido en 2.19.36?" es
  **sí por construcción, no por verificación**. El mapa de compilación es in-process (se limpia al
  deploy), así que el riesgo real es el 304 del navegador con un ETag anterior al upgrade.
- **Optimización concreta**: añadir el `sourceHash` de `dist/build-stamp.json` (ya existe:
  `5d0ce5fc…`, `sourceFileCount: 2574`) o un `baseThemeDigest` al `digestSource`. Cuesta una línea y
  convierte una invariante asumida en una verificada. No hay hoy ninguna ruta de migración
  `schemaVersion 1 → 2`: `migrateV1` lanza en cualquier otra versión y sólo existe la carpeta
  `migrate-v1`; es correcto hoy, pero conviene registrar que la mecánica de migración no está probada.

### H-A-8 · MEDIO · El editor de producto no ve 3 de los 6 rangos del envelope

- **Qué**: el envelope se aplica fail-closed en el servidor, pero la consola sólo estrecha 4 nodos
  del schema, y no los mismos.
- **Evidencia**:
  - `app-platform/src/features/organization/tenants/screens/tenant-theme-console/model.ts:202-236`
    aplica `constrainNumberNode` a exactamente: `general.motion.intensity`,
    `general.motion.durationScale`, `advanced.tokenOverrides['--ds-density-scale']`,
    `advanced.tokenOverrides['--ds-effect-intensity']`.
  - No aplica a `general.typography.scale`, `general.shape.radiusScale`,
    `general.surfaces.effectIntensity`.
  - Consecuencia medida (matriz de la óptica 4): `typeScale 1.09` REJECTED,
    `radiusScale 1.24` REJECTED, `effectIntensity 0.9` REJECTED — los tres están DENTRO del rango del
    schema que la consola renderiza (0.9..1.1 / 0.75..1.25 / 0..1) y FUERA del envelope
    (0.92..1.08 / 0.8..1.2 / 0..0.65).
- **Segundo problema**: los envelopes casi no diferencian verticales.

  ```
  rottay  effectIntensity 0..0.65   |  bithire 0..0.65  |  evnto 0..0.75
  (los otros 5 rangos, las 48 chromeFamilies y los 2 flags son idénticos en los tres)
  ```

  El mecanismo "envelope por vertical" existe con un solo número diferenciador hoy.
- **Impacto**: el usuario del console mueve un slider a un valor que la UI presenta como legal y
  recibe un rechazo al publicar. Y la política por vertical es, en la práctica, una política única.
- **Optimización concreta**: derivar el schema visible SIEMPRE del envelope (una tabla
  `keypath → rangeKey` en vez de 4 llamadas a mano), y decidir si los envelopes deben diferir de
  verdad — si no, colapsarlos a uno y ahorrarse el `verticalEnvelopeDigest`.

### H-A-9 · BAJO · Comentario normativo desactualizado en `tenantPostureFloors`

- **Qué**: `composition/tenant-theme/index.ts:1846-1847` afirma *"schema v1 rejects
  mono/letterSpacing/lineHeight, so those come only via the static arm"*. Es falso como afirmación de
  schema.
- **Evidencia**: `TENANT_THEME_OVERRIDE_TOKENS` (290 tokens) incluye `--ds-font-family-mono`,
  `--ds-font-family-display`, 4 × `--ds-letter-spacing-*` y 5 × `--ds-line-height-*`, y
  `migrate-v1/index.ts:173-201` los mapea a `typography.fontFamilyMono` / `letterSpacing.*` /
  `lineHeight.*`. Lo que sí es cierto (y es lo que el comentario quería decir) es que la PROYECCIÓN
  DEL PISO sólo carga `fontFamilyBase`/`fontFamilyHeading`, así que esos canales aterrizan en la
  posición del merge y no en la del tenant floor.
- **Impacto**: menor, pero es un comentario que un agente futuro leerá como ley.
- **Optimización concreta**: corregir a "el piso proyecta sólo base/heading; mono/letterSpacing/
  lineHeight cruzan por `tokenOverrides` y aterrizan en la posición del merge".
- **Segundo comentario obsoleto**: `tenant-theme/index.ts:~1946` dice *"The shared runtime/static
  Appearance compiler owns APCA autocorrection"*, pero `adjustments` es literalmente
  `const adjustments: readonly TenantThemeContrastAdjustment[] = [];` (línea 2101) y el docblock de
  `validateCompiledThemeContrast` (línea 1548) declara lo contrario: *"APCA is an ingestion floor,
  never a second compiler… do not rewrite"*. No hay autocorrección; hay rechazo.

### H-A-10 · BAJO · `surfaces.materials` es campo muerto que los tres `Theme` siguen materializando

- **Qué**: `BrandSurfaces.materials` está `@deprecated` con la nota *"new static themes and DB
  payloads must not author this field"* (`contracts/.../themes/index.ts:606-609`), y el compilador
  resuelve con `su.surfaceRoles ?? su.materials` (`brand-theme/index.ts:928` y `:1040`) — coalescing
  de mapa entero, no por rol.
- **Evidencia**: ningún `BrandTheme` crudo escribe `materials` (verificado:
  `bithireBrandTheme.surfaces` = `densityScale, borderRadius, shadows, surfaceRoles, glass,
  gradients, effectIntensity, overlays`), pero `brandThemeToTheme` lo rellena con
  `defaultSemanticSurfaceRoleMap()` (`iso/index.ts:575,598-600`) → 168 hojas `undefined` en cada
  `FIRST_PARTY_THEMES.*`.
- **Impacto**: hoy inocuo porque `surfaceRoles` siempre está presente y gana. Es una bomba con
  espoleta: cualquier `Theme` futuro sin `surfaceRoles` haría que un override parcial del DB pisara
  el mapa entero, porque el `??` no es un merge.
- **Optimización concreta**: retirar `materials` del `Theme` total (dejarlo sólo en `BrandTheme` como
  entrada de compatibilidad, normalizado a `surfaceRoles` en `brandThemeToTheme`), y con eso el `??`
  desaparece.

---

## Lo que está bien (con evidencia)

- **El lowering es genuinamente único.** DB:
  `compileTenantThemeConfig → migrateV1 → resolveTheme(baseTheme, patch) → compileTheme →
  themeToBrandTheme → compileBrandTheme` (`tenant-theme/index.ts:2026`).
  Estático: `renderFirstPartyArtifact → compileBrandTheme` (`artifact-renderer/index.ts:213`).
  No encontré un segundo emisor de variables. Los únicos consumidores no-test de
  `compileBrandTheme` en `src/` son el artifact-renderer, el `brand-studio` (herramienta de autor) y
  el entrypoint público.

- **Fail-closed es real y verificable.** 16/16 rechazos con `code` + `path`:

  ```
  REJECTED  unknown enum density                        invalid_value @ $.appearance.density
  REJECTED  out-of-schema radiusScale 2.0               invalid_value @ $.appearance.shape.radiusScale
  REJECTED  out-of-envelope radiusScale 1.24            invalid_value @ $.appearance.shape.radiusScale
  REJECTED  out-of-envelope typeScale 1.09              invalid_value @ $.appearance.typography.scale
  REJECTED  out-of-envelope effectIntensity 0.9         invalid_value @ $.appearance.surfaces.effectIntensity
  REJECTED  out-of-envelope motionIntensity 0.95        invalid_value @ $.appearance.motion.intensity
  REJECTED  unknown top-level key                       unknown_key   @ $.appearance.bogus
  REJECTED  token fuera del allowlist                   unknown_key   @ $...tokenOverrides["--ds-not-a-token"]
  REJECTED  token permitido, valor js:                  unsafe_value  @ $...tokenOverrides["--ds-color-primary"]
  REJECTED  token permitido, escape de bloque CSS       unsafe_value  @ $...tokenOverrides["--ds-color-primary"]
  REJECTED  experienceProfile desconocido               invalid_value @ $.appearance.experienceProfile
  REJECTED  recipeProfile desconocido                   invalid_value @ $.visualFoundation.recipeProfile
  REJECTED  familia chrome fuera del envelope           unknown_key   @ $...chrome.premiumCard
  REJECTED  inyección en font-family                    unsafe_value  @ $.appearance.typography.fontFamilyBase
  REJECTED  5 capas de sombra (cap 4)                   unsafe_value  @ $...tokenOverrides["--ds-shadow-sm"]
  REJECTED  radius 200px (cap 64)                       unsafe_value  @ $...tokenOverrides["--ds-radius-md"]
  ```

  `resolveTheme` (`iso/index.ts:886-891`) lanza en cualquier clave desconocida:
  *"ThemePatch is ingestion-only"*. El piso APCA rechaza en vez de reescribir, con la
  atribución correcta (sólo pares donde el tenant tocó tinta o fondo).

- **Restore exacto, con control positivo.** Documento identidad (`appearance: {}`) →
  `Object.keys(artifact.variables).length === 0` y `modeDeltas.length === 0`. El artefacto es delta
  puro (`tenant-theme/index.ts:2095-2099`: sólo entra la clave cuyo valor difiere de `baseCompiled`),
  así que quitar la autoría restaura el baseline por construcción, no por convención. Harnesses
  reales: `tests/canonical-digest-identity.test.ts` (*"keeps the null-override artifact digest
  byte-identical"*, :446) y `tests/tenant-theme-artifact-stability.test.ts`.

- **La entrega runtime tiene un solo autor.** El provider lo declara y lo cumple:
  *"NO VISUAL PAINT HERE… so there is exactly one thing that can paint a tenant and it is the
  artifact"* (`runtime/theming/composition/react/provider/index.tsx:154-171`). SSR embebe
  `runtimeArtifact.css` en un `<style>` (`app-bithire/src/app/layout.tsx:249-254`) junto a
  `buildThemePrepaintScript()` (:245) → sin FOUC. Cualquier discordancia de identidad para el render
  antes de pintar otro tenant (`runtime-tenant-theme/ssr/index.ts:78-86`,
  `TENANT_THEME_SSR_IDENTITY_MISMATCH`). El hook cliente reemplaza el MISMO `<style>` guardado por
  digest, no escribe inline en la raíz (`core/hooks/runtime-tenant-theme/index.ts:96-103`).

- **La arquitectura "pocos controles, mucho alcance" funciona donde está implementada.**
  Cierre transitivo del grafo `var()` sobre el engine modern (360 archivos CSS, 13.792 declaraciones
  de pintura):

  ```
  CONTROL                     canales  decls pintura  archivos  % pintura modern
  experience.profile               52          3.256       259      23,6%
  palette.seeds                    28          1.908       215      13,8%
  density.mode                      1          1.850       210      13,4%
  typography.scale                  1            708       173       5,1%
  shape.radius-scale               36            685       188       5,0%
  motion.dial                       2            175        75       1,3%
  typography.pairing                4            166        65       1,2%
  typography.families               2            132        64       1,0%
  spacing.rhythm                    1            112        17       0,8%
  surfaces.effect-intensity         1             68        30       0,5%
  navigation.sidebar-tone           6             14         3       0,1%
  shape.button-style                1              0         0       0,0%   ← H-A-1
  surfaces.elevation (bithire)      0              0         0       0,0%   ← H-A-4
  ```

  `density.mode` es el ejemplo del diseño correcto: UN canal (`--ds-density-mode-factor`) que por
  cadena (`--ds-density-global-effective-scale` → `--ds-density-effective-scale`) alcanza 1.850
  declaraciones en 210 archivos.

---

## Óptica 10 — veredicto sobre "dos tenants como proyectos distintos"

Compilé el fixture DB real (`THEMANAGEMENT_TENANT_THEME_DOCUMENT` +
`THEMANAGEMENT_TENANT_THEME_IDENTITY`, envelope bithire) contra `compileTheme(FIRST_PARTY_THEMES.bithire)`.

```
digest       sha256-55a070ebb83c2c232727bd9c7b586c7aac6f4ce18f8d53ddefb56dceccc13f06
overlay      185 variables + 1 modeDelta   |  css 14.752 bytes
baseline     1.229 variables               →  el tenant mueve el 15,1% de los canales
alcance      8.636 de 13.792 declaraciones de pintura modern (62,6%), 288 de 360 archivos (80,0%)
```

**Sí, hoy dos tenants pueden parecer proyectos distintos.** 185 canales que alcanzan el 62,6% de la
pintura no es un recolor: es un cambio de sistema. Y el fixture lo demuestra con intención de diseño
real (ledger monocromo, serif editorial, radios a 0-2px, sombras de offset duro, 4 anatomías).

**Dimensiones que DIFIEREN hoy** (desglose de las 185 variables movidas):

| dimensión | canales | cómo |
|---|---|---|
| color / materiales | 121 | seeds + 35 `tokenOverrides` + rampas derivadas + 10 series de chart |
| chrome / anatomía | 16 + 4 atributos | `data-anatomy-{card,table,sidebar,layout}` (13/21/6/12 selectores CSS) |
| forma / radio | 8 | `radiusScale` + `--ds-radius-{sm,md,lg,xl}` |
| elevación | 8 | `elevation:'elevated'` + `--ds-shadow-*` overrides |
| tipografía | 6 | `typePairing:'editorial'` + 2 familias + tracking/leading |
| motion | 2 | `--ds-motion-intensity`, `--ds-motion-duration-scale` |
| densidad | 1 | `--ds-density-mode-factor` (alcance 1.850 decls) |
| iconografía | 0 CSS | canal de DATOS vía `useActiveIconExpressiveProfile()` en cada icono |

**Dimensiones que NO PUEDEN diferir por límite del modelo:**

1. **El engine.** `engineBridge` es inalcanzable desde el documento. Dos tenants comparten
   obligatoriamente el mismo engine (`modern`). Es la palanca visual más grande y está cerrada.
2. **El modo oscuro.** 10 hojas de paleta contra las 492 que autor un vertical (H-A-3).
3. **Las rampas de color afinadas a mano** (`palette.ramps`, 80 hojas). Un tenant sólo obtiene la
   rampa derivada perceptualmente de su seed.
4. **La escalera de elevación completa** (niveles 0/4/5) y la silueta del botón (H-A-1, H-A-4).
5. **La anatomía más allá de 4 familias.** Sólo `cardComponent`, `table`, `sidebar`, `layout` tienen
   variantes. Las otras 44 familias del envelope aceptan valores pero no cambian de estructura.
6. **El ritmo responsive.** `responsivePosture` no emite nada y alcanza 1 patrón (H-A-5).
7. **`experience.profile`, la palanca de mayor alcance (23,6%), tiene exactamente 2 opciones**:
   `rottay/bithire-technical@1` y `rottay/management-editorial@1`. El techo del "parece otro
   producto" es, hoy, binario.

**Qué falta exactamente, en orden de impacto por unidad de trabajo:**

1. Arreglar H-A-1 (1 línea de CSS) y H-A-4 (extender el preset a 6 niveles). Devuelve 2 de 13
   controles Standard al catálogo.
2. Publicar más `EXPERIENCE_PROFILES`. Es la palanca con 23,6% de alcance y tiene 2 stops; cada
   perfil nuevo es composición de ejes ya implementados, no código nuevo.
3. Abrir `modes.dark.{typography,surfaces}` en el schema v1 (~30 hojas).
4. Implementar o retirar `profiles.motif` (6/7 stops muertos) y `responsive.posture` (3/3 muertos).
5. Abrir `palette.ramps` al documento (80 hojas, 8 familias de color completas).

---

## Preguntas que no pude cerrar (y qué haría falta)

1. **Cuántas de las 8.636 declaraciones alcanzadas cambian de valor computado.** Mi cierre
   transitivo mide DEPENDENCIA, no cambio: una cadena `var()` puede resolver al mismo valor. Es una
   cota superior honesta. Cerrarlo requiere renderizar ambos tenants en Chromium y diferir
   `getComputedStyle` — el reference lab (`/probe/whitelabel-torture`) es la herramienta, pero
   levantar el showroom en :7001 excede el mandato read-only de este brazo.
2. **Si `dist/` está fresco respecto de `src/`.** Usé el bundle de esbuild desde `src` para todas
   las mediciones causales, así que mis números son de FUENTE. Sólo usé `dist/server.cjs` para
   enumerar `TENANT_THEME_CONFIG_SCHEMA` y los allowlists (2.212 hojas, 290 tokens, 392 reference).
   Los verifiqué contra la fuente en los puntos que cité, pero no corrí `dist-freshness-gate.mjs`.
3. **Si `--radius-field` (el puente framework de `--ds-radius-button`) tiene consumidores en las
   apps.** En el DS son cero. Si `app-bithire` usa utilidades Tailwind `rounded-*` mapeadas a
   `--radius-field`, `shape.button-style` tendría alcance allí y no aquí — lo que sería peor, no
   mejor: el control pintaría el HTML crudo de la app y no las primitivas del DS.
4. **El comportamiento bajo `schemaVersion: 2`.** No existe todavía. No pude verificar que la
   mecánica de migración funcione porque sólo hay un migrador (`migrate-v1`) y `migrateV1` lanza en
   cualquier otra versión.
5. **Si `app-platform` y `app-evnto` consumen exactamente el mismo camino que `app-bithire`.**
   Verifiqué el console de `app-platform` (lee el envelope, clampea 4 nodos) y que
   `initialize-tenant-theme` existe, pero no seguí su cadena de resolución completa; el brazo que
   audite las apps debería confirmar que no hay un tercer resolver.
