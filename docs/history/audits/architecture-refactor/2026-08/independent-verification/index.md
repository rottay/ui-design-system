# Verificación independiente del mapa — asiento Fable

Revisión afirmación por afirmación de `docs/history/inventories/repository-map/2026-08/index.md`, hecha por un lector
que no escribió el mapa, contra el árbol real (`grep -ra`, `find`, `ls` y lectura
directa de archivos). Fecha: 2026-08-18.

Se revisaron las 204 afirmaciones marcadas `[DUPLICA]` o `[SIN CONSUMIDOR]` más las
cinco afirmaciones fuertes de la cabecera.

| bloque | de acuerdo | en desacuerdo | sin poder verificar |
|---|---:|---:|---:|
| `foundation/` + `infrastructure/` | 92 | 1 | 0 |
| `ui/` | 41 | 9 | 0 |
| `graphics/` + `entrypoints/` + `tooling/` | 22 | 0 | 0 |
| `packages/core` fuera de `src/` + raíz | 33 | 4 | 0 |
| **total** | **188** | **14** | **0** |

Los 14 desacuerdos están corregidos en el cuerpo del mapa. Este documento conserva
la evidencia original de cada veredicto.

---

# Bloque 1 — foundation/ + infrastructure/


Repo: /Users/daniel/Developer/Rottay/ui-design-system (solo lectura).
Metodo: grep -ra (ugrep) sobre packages/core/src, packages/core/scripts y packages/showroom/src; find para carpetas vacias; lectura directa de archivos. Rutas citadas relativas a `packages/core/src/` salvo indicacion.

Convencion de evidencia: "path-import" = ninguna sentencia import/require del repo referencia la ruta; "homonimo" = las coincidencias del simbolo fuera de la carpeta son variables/funciones locales con el mismo nombre, no imports.

## Afirmaciones de cabecera

| afirmacion | veredicto | evidencia |
|---|---|---|
| 1. `infrastructure/runtime/presentation-profiles/` = 7 carpetas vacias, calco de `product-profiles/`, cero referencias | ACUERDO | `find infrastructure/runtime/presentation-profiles -type d` → exactamente 7 dirs (root, composition, composition/react, .../provider, .../provider/profile, .../provider/tests, facade); `find ... -type f | wc -l` → 0; `grep -ra 'presentation-profiles' packages/core packages/showroom` → 0 coincidencias. Estructura identica a `product-profiles/` (que tiene facade/ y composition/react/provider/profile/), con una unica dir extra `provider/tests` tambien vacia (el propio mapa lo aclara en su fila). |
| 2. `appearance/` y `brand-theme/` = dos emisores del mismo lowering a los mismos canales `--ds-*`; el camino DB usa solo brand-theme | ACUERDO | Ambos importan las mismas cinco hojas compartidas: `appearance/index.ts:43-72` y `brand-theme/index.ts:55-91` importan `appearance-posture`, `chrome-variables`, `palette-derivations`, `readable-ink`, `interaction-floor` desde `kernel/foundation/css/`. Emision `--ds-`: 59 ocurrencias en appearance, 261 en brand-theme. Camino DB: `compilers/composition/tenant-theme/index.ts:79-81` importa `compileTheme` de brand-theme y compila con el (lineas 1950, 1964); su unico import de appearance es `withExpressiveFieldDefaults` (linea 69), un normalizador de defaults, no un emisor. `entrypoints/server/index.ts:58-66,147-148` solo usa tenant-theme + brand-theme. Los emisores de appearance (`compileAppearanceVariables`, `appearanceToVariables`) los llaman el provider cliente (`runtime/bootstrap/facade/react/provider/index.tsx`) y el sandbox de preview (`ui/patterns/customization/branding-preview-sandbox/index.tsx`), es decir el camino compat/preview. |
| 3. `foundation/tokens/ts/` espejo muerto; el barril `@/foundation/tokens` tiene un unico importador de produccion, solo para dos funciones de Collapse | ACUERDO | `grep -rna "from ['\"]@/foundation/tokens['\"]"` en src+showroom+scripts → un solo hit: `ui/primitives/layout/Collapse/runtime/tokens/index.ts:47`, cuyo bloque importa exactamente `getCollapseTokens`, `getCollapseSlotTokens` (mas dos types: `CollapseTokenOptions`, `CollapseSlot`). Los 5 matches relativos `from '.../foundation/tokens'` resuelven a carpetas locales de componentes (`ui/patterns/data/list-toolbar/foundation/tokens`, `ui/structures/dashboard/insights/foundation/tokens`), no al barril raiz. El propio encabezado de `foundation/tokens/index.ts` declara los `.ts` como "TypeScript mirrors ... package-internal". |

## Claims por carpeta (numeradas por linea del archivo de claims)

| # | ruta | veredicto | evidencia |
|---|---|---|---|
| 3 | foundation/contracts/composition/components/ [DUPLICA kernel/common] | ACUERDO | El archivo (index.ts) dice "The source of truth lives in `kernel/common`; this file keeps older imports working"; reexporta `BaseComponentProps` de `../../kernel/common` y define `WithChildrenProps = WithChildren`. |
| 4 | foundation/i18n/ [SIN CONSUMIDOR] | ACUERDO | `grep -rna "from ['\"]@?/?foundation/i18n['\"]"` → 0; los consumidores usan subrutas: `entrypoints/public/contracts/i18n/index.ts:4` (kernel/contracts), `entrypoints/server/index.ts:27` (runtime/resolution/locale). |
| 5 | foundation/i18n/kernel/ [SIN CONSUMIDOR] | ACUERDO | `grep -rna "foundation/i18n/kernel['\"]"` → 0 fuera del arbol; los imports van a `i18n/kernel/contracts` (p.ej. entrypoints/public/runtime/i18n/index.ts:3). |
| 6 | foundation/i18n/runtime/ [SIN CONSUMIDOR] | ACUERDO | `grep -rna "foundation/i18n/runtime['\"]"` → 0 exacto; se importan sus hijos directo: catalog (entrypoints/public/runtime/i18n/index.ts:4), resolution (entrypoints/server/index.ts:27), formatting (ui/patterns/forms/invoice-template/engines/modern/index.tsx, ui/patterns/data/file-manager/..., ui/surfaces/.../scheduler/). |
| 7 | foundation/kernel/accessibility/wcag/ [DUPLICA color/contrast; SIN CONSUMIDOR] | ACUERDO | wcag/index.ts:123 define su propio `linearize` y :142 su `relativeLuminance` sin importar `foundation/kernel/color/contrast/` (cuyo index.ts:2-4 se declara "The single home of the WCAG 2.2 luminance transfer function"; exporta `linearizeSrgbChannel`, `relativeLuminance`). `accessibility/branding-contrast/` existe como hermano. Consumidores externos de la ruta: solo su propio test. Simbolos: `meetsContrastLevel`/`getContrastingTextColor`/`checkColorAccessibility` → 0 hits externos; `contrastRatio` externos son funciones locales homonimas en tests (p.ej. Link.contrast-channels.test.tsx:60 `function contrastRatio(...)`). |
| 8 | foundation/kernel/math/ [DUPLICA color-math clampValue; 1 importador] | ACUERDO | math/index.ts exporta exactamente clamp/lerp/normalize/remap/roundTo/range (lineas 26-143). `compilers/kernel/foundation/css/color-math/index.ts:48` define `clampValue(value,min,max)` equivalente (mismo comportamiento; orden Math.max/Math.min invertido textualmente) sin importar clamp. Unico importador de kernel/math en el repo: `compilers/kernel/foundation/css/appearance-posture/index.ts:22` (`import { clamp }`). lerp/remap/roundTo: 0 imports externos. |
| 9 | foundation/kernel/performance/ [SIN CONSUMIDOR] | ACUERDO | Unicos hits externos de `arePropsEqual`/`createPropsComparator`: `src/index.ts:261-263` (reexport publico). Ningun componente/script/showroom los usa. |
| 10 | foundation/tokens/css/facade/artifacts/bithire/ [DUPLICA brand-themes/bithire] | ACUERDO | index.css: 2201 lineas, 1862 ocurrencias `--ds-`, 0 `@layer`, scope `:is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire']))` (linea 14). Fuente `ts/presentation/brand-themes/bithire/` existe; `scripts/build-vertical-artifacts.mjs:37,46` genera desde `FIRST_PARTY_VERTICAL_ROSTER` de brand-themes. |
| 11 | foundation/tokens/css/facade/artifacts/evnto/ [DUPLICA brand-themes/evnto] | ACUERDO | index.css existe (575 lineas, sin `@layer`); fuente `brand-themes/evnto/` existe; mismo generador. |
| 12 | foundation/tokens/css/facade/artifacts/rottay/ [DUPLICA brand-themes/platform] | DESACUERDO | La relacion de duplicacion es real (index.css generado, 2888 lineas ~2900, `color-scheme: dark` en linea 15, sin `@layer`), pero la fuente nombrada NO existe: `ls foundation/tokens/ts/presentation/brand-themes/` → `bithire`, `evnto`, `rottay`, `index.ts`. No hay carpeta `platform/`; la fuente correcta es `brand-themes/rottay/` (via `FIRST_PARTY_VERTICAL_ROSTER`, build-vertical-artifacts.mjs:37). El id de vertical `platform` ya no existe en el roster. |
| 13 | foundation/tokens/ts/facade/compat/typography-scale/ [DUPLICA typography.css + ts base/typography] | ACUERDO | El archivo define `typographyScale: Record<string, CSSProperties>` con literales rem (lineas 21-40: '2.25rem', '1.5rem', ...). Contrapartes existen: `css/foundation/base/typography.css` y `ts/foundation/base/typography/`. Unico consumidor externo: reexport en `ts/facade/index.ts:29`. |
| 14 | foundation/tokens/ts/foundation/base/ (barril) [SIN CONSUMIDOR] | ACUERDO | Unico hit externo de `baseTokens`: funcion local homonima en `infrastructure/runtime/bootstrap/facade/react/provider/tests/tenant-overrides-behavior.integration.test.tsx:657` (`function baseTokens(): ...`). El facade del mismo arbol lo importa: `ts/facade/index.ts:32`. Ningun import de la ruta `ts/foundation/base` exacta (solo el subpath `base/density`, que no es esta claim). |
| 15 | .../base/borders/ [DUPLICA borders.css; SIN CONSUMIDOR] | ACUERDO | `css/foundation/base/borders.css` existe. Ningun import de `ts/foundation/base/borders` en todo el repo (el barrido de imports de `tokens/ts/foundation/base` solo devuelve `base/density`). |
| 16 | .../base/colors/ [DUPLICA themes css; SIN CONSUMIDOR] | ACUERDO | Sin import del path. Hits externos de `colorPrimary` son el token homonimo de antd (`engines/presentation/adapters/antd/index.tsx:42,67,82` — mapa de tokens antd, no import de esta carpeta); `colorCommon`/`colorAlphaBlack` → 0 hits. `css/foundation/themes/default.css` existe como dueno de los canales. |
| 17 | .../base/shadows/ [DUPLICA shadows.css; SIN CONSUMIDOR] | ACUERDO | shadows.css existe; `shadowCard`/`shadowFocusRing`/`dropShadow` → 0 hits externos; sin import del path. |
| 18 | .../base/spacing/ [DUPLICA spacing.css; SIN CONSUMIDOR] | ACUERDO | spacing.css existe; `spacingScale`/`spacingNamed`/`spacingGutter` → 0 hits externos; sin import del path. |
| 19 | .../base/typography/ [DUPLICA typography.css; SIN CONSUMIDOR] | ACUERDO | typography.css existe; `fontSizeHeading`/`typeCraft`/`NUMS_TABULAR_CLASS` → 0 hits externos; sin import del path. |
| 20 | .../base/z-index/ [DUPLICA z-index.css; SIN CONSUMIDOR] | ACUERDO | z-index.css existe; `zIndices`/`zIndexUtility`/`zIndexRelative` → 0 hits externos; sin import del path. |
| 21 | .../ts/runtime/components/ (barril) [SIN CONSUMIDOR] | ACUERDO | Hits externos de `componentTokens` son locales homonimos: `QRCode.runtime-engines.test.tsx:148` (`const componentTokens = readFileSync(...)`), `scripts/libraries/ds-hook-manifest.mjs:1427` (`new Set(...)`), tokens-catalog.mjs, etc. Ningun import del path `ts/runtime/components` (solo strings de ruta en censos de scripts, p.ej. fanout-facts.mjs:190). |
| 22 | .../components/avatar/ | ACUERDO | `css/presentation/components/avatar.css` existe; `avatarTokens`/`avatarStatus` → 0 hits externos; sin import del path. |
| 23 | .../components/badge/ | ACUERDO | badge.css existe; `badgeTokens`/`badgeAnatomy` → 0 hits externos. |
| 24 | .../components/button/ | ACUERDO | button.css existe; `buttonTokens`/`buttonSemanticVariant` → 0 hits externos. |
| 25 | .../components/card/ | ACUERDO | card.css existe; `cardTokens`/`cardCover` → 0 hits externos. |
| 26 | .../components/checkbox/ | ACUERDO | checkbox.css existe; `checkboxTokens`/`checkboxRadius` → 0 hits externos. |
| 27 | .../components/collapse/ | ACUERDO | collapse.css existe; `collapseRootTokens`/`collapseTokens` → 0 hits externos. Lo que si se consume son las funciones `getCollapseTokens`/`getCollapseSlotTokens` (definidas en `collapse/token-utils/`, reexportadas en collapse/index.ts:16-27) via el barril `@/foundation/tokens` desde Collapse — coherente con la claim. |
| 28 | .../components/icon/ | ACUERDO | icon.css existe; `iconTokens` → 0; el hit de `iconStroke` en `scripts/runtime-svg-paint-counter.test.mjs:227` es una variable local de JSX (`stroke={iconStroke}`), no un import. |
| 29 | .../components/input/ | ACUERDO | input.css existe; `inputTokens`/`inputAddon` → 0 hits externos. |
| 30 | .../components/list/ | ACUERDO | list.css existe; `listTokens`/`listMeta` → 0 hits externos. |
| 31 | .../components/modal/ | ACUERDO | modal.css existe; `modalTokens`/`modalGlass` → 0 hits externos; el inventario de fan-out lo etiqueta `ts-token-mirror` (`scripts/.../scripts/foundation/tokens/manifest/fanout.test.mjs:204`), tal como dice la claim. |
| 32 | .../components/qrcode/ | ACUERDO | qrcode.css existe; `qrcodeTokens`/`qrcodeRefreshButton` → 0 hits externos. |
| 33 | .../components/radio/ | ACUERDO | radio.css existe; `radioTokens`/`radioDot` → 0 hits externos. |
| 34 | .../components/rate/ | ACUERDO | rate.css existe; `rateTokens`/`rateInteraction` → 0 hits externos. |
| 35 | .../components/select/ | ACUERDO | select.css existe; `selectTokens`/`selectDropdown` → 0 hits externos. |
| 36 | .../components/space/ | ACUERDO | space.css existe; `spaceSize`/`spaceTokens` → 0 hits externos. |
| 37 | .../components/spinner/ | ACUERDO | spinner.css existe; `spinnerTokens`/`spinnerAnimation` → 0 hits externos. |
| 38 | .../components/tag/ | ACUERDO | tag.css existe; `tagTokens`/`tagRadius` → 0 hits externos. |
| 39 | .../components/timeline/ | ACUERDO | timeline.css existe; `timelineTokens` → 0; el hit de `timelinePending` en `showroom/src/components/k3-lane-a/index.tsx:81,114,163` es una clave de copy de demo ("Reference check in progress"), no este simbolo — exactamente como aclara la claim. |
| 40 | .../components/toggle/ | ACUERDO | toggle.css existe; `toggleTokens`/`toggleInner` → 0 hits externos. |
| 41 | .../ts/runtime/mirrors/ (barril) [SIN CONSUMIDOR] | ACUERDO | `tenantTokens` → 0 hits externos. El encabezado de mirrors/index.ts dice "These are NOT authored premium sources — that role belongs to brand-themes/" y "Currently only ships the Rottay reference mirror". Unica mencion externa del path: string en `scripts/lint-folder-index.test.mjs:38`. |
| 42 | .../mirrors/monochrome/ [DUPLICA monochrome/index.css; SIN CONSUMIDOR] | ACUERDO | El archivo se autodeclara "TypeScript mirror of the CSS token contract" citando `css/foundation/monochrome/index.css` (linea 7); ese css existe. `MONO_GRAY_HEX` → 0 hits externos. |
| 43 | .../mirrors/rottay/ [DUPLICA brand-themes/rottay + artifacts/rottay; SIN CONSUMIDOR] | ACUERDO | `brand-themes/rottay/` y `artifacts/rottay/index.css` existen; `rottayTokens`/`rottayBrand` → 0 hits externos. |
| 44 | infrastructure/compilers/composition/ (barril) [SIN CONSUMIDOR] | ACUERDO | `grep "compilers/composition'"` → 0; sin `from './composition'` relativo en compilers; `facade/index.ts:8` importa directo `../composition/tenant-theme`. |
| 45 | infrastructure/compilers/kernel/ (barril) [SIN CONSUMIDOR] | ACUERDO | `grep "compilers/kernel'"` → 0 y sin `from './kernel'`; `facade/index.ts:7` importa directo `../kernel/runtime/brand-theme`. |
| 46 | compilers/kernel/foundation/ (barril) [solo kernel/index.ts] | ACUERDO | Unico importador: `kernel/index.ts:3` (`export * from './foundation'`); `grep "kernel/foundation'"` → nada mas; kernel/ a su vez sin consumidor (fila 45). |
| 47 | kernel/foundation/css/ (barril) [solo foundation/index.ts] | ACUERDO | `grep "foundation/css'"` → unico hit `kernel/foundation/index.ts:1`. Los consumidores reales (brand-theme, appearance) importan subrutas (`css/color-math/...`, `css/appearance-posture`, `css/chrome-variables`), no el barril. |
| 48 | kernel/foundation/motion/ (barril) [solo foundation/index.ts] | ACUERDO | `grep "foundation/motion'"` → unico hit `kernel/foundation/index.ts:2`; `motion/spring-easing` se importa directo desde `kernel/runtime/brand-theme/index.ts` y su test. |
| 49 | kernel/foundation/schemas/ (barril) [solo foundation/index.ts] | ACUERDO | `grep "foundation/schemas'"` → unico hit `kernel/foundation/index.ts:3`; `schemas/tenant-theme` se importa directo desde `composition/tenant-theme/index.ts` y tests. |
| 50 | compilers/kernel/runtime/ (barril) [solo kernel/index.ts] | ACUERDO | Unico importador: `kernel/index.ts:4` (`export * from './runtime'`); `grep "compilers/kernel/runtime'"` exacto → 0. |
| 51 | compilers/kernel/runtime/appearance/ [DUPLICA brand-theme] | ACUERDO | Ver cabecera 2: mismas cinco hojas compartidas importadas en ambos (appearance/index.ts:43-72; brand-theme/index.ts:55-91), ambos emiten canales `--ds-*` (59 vs 261 ocurrencias), ambos bajan chrome via el mismo `chrome-variables` (comentarios cruzados en appearance:754 y brand-theme:1803). |
| 52 | infrastructure/compilers/runtime/ (barril) [SIN CONSUMIDOR] | ACUERDO | `grep "compilers/runtime'"` exacto → 0; consumidores usan `compilers/runtime/tenant-css` directo (tooling/testing/integration/theming-precedence, tooling/testing/system, foundation/tokens/__tests__/brand-themes-ownership.test.ts). |
| 53 | runtime/adapters/presentation/react/compound-components/ [SIN CONSUMIDOR] | ACUERDO | Hits externos de `createSubComponent`/`createCompoundComponent`: solo `src/index.ts` (reexport publico) + su propio test. Ningun componente los usa. |
| 54 | runtime/application/automation/assistant/ [SIN CONSUMIDOR] | ACUERDO | `useStreamingText` y `useChat`: fuera de la carpeta solo `runtime/facade/react-hooks/index.ts:309`. Ningun componente los llama. |
| 55 | runtime/application/data/ (barril) [SIN CONSUMIDOR] | ACUERDO | Unico importador externo del barril: `facade/react-hooks/index.ts:232,252` (`from '../../application/data'`). |
| 56 | .../data/runtime/optimistic/ [SIN CONSUMIDOR] | ACUERDO | `useOptimisticUpdate`/`useOptimisticList`: solo reexports (data/index.ts barril padre y facade react-hooks) + test propio. Nota: la claim nombra solo la fachada; tambien reexporta el barril `data/index.ts`, pero no hay ningun llamador real. |
| 57 | .../data/runtime/pdf-export/ [SIN CONSUMIDOR] | ACUERDO | `usePdfExport`: solo data/index.ts + facade react-hooks + test propio. |
| 58 | .../data/runtime/query/ [SIN CONSUMIDOR] | ACUERDO | `useSurfaceQuery`: solo barril data + facade + test; las menciones en navigation/routing (:35,:123,:256) y navigation/search (:279) son comentarios/docs, no imports. |
| 59 | .../data/runtime/table-export/ [SIN CONSUMIDOR; DUPLICA export-button/file-export] | ACUERDO | `useTableExport`: solo barril + facade + test. Duplicacion confirmada: `ui/structures/workspace/export-button/runtime/file-export/index.ts:79-149` define sus propios `generateCsv`, `generateJson`, `generateClipboardText`, `triggerDownload`; ambos citan RFC 4180 (table-export/index.ts:11,167). |
| 60 | .../forms/auto-save/ [SIN CONSUMIDOR] | ACUERDO | `useAutoSave`: solo forms/index.ts + facade react-hooks (:263,:276) + test. |
| 61 | .../forms/draft-save/ [SIN CONSUMIDOR] | ACUERDO | `useDraftSave`: solo forms/index.ts + facade + test. |
| 62 | .../forms/form-diff/ [SIN CONSUMIDOR] | ACUERDO | `useFormDiff`: solo forms/index.ts + facade + test. |
| 63 | .../interaction/drag-and-drop/ [SIN CONSUMIDOR] | ACUERDO | `useSortableList`: solo facade react-hooks (:355) + test propio. |
| 64 | .../navigation/routing/ [SIN CONSUMIDOR] | ACUERDO | `useRouterState`: solo facade react-hooks (:300) + test propio. |
| 65 | .../navigation/search/ [SIN CONSUMIDOR] | ACUERDO | `useGlobalSearch`: solo facade react-hooks + test propio. |
| 66 | .../application/notifications/ [SIN CONSUMIDOR] | ACUERDO | `useNotificationPreferences`: solo facade react-hooks (:327) + test propio. |
| 67 | .../state/undo-redo/ [SIN CONSUMIDOR] | ACUERDO | `useUndoRedo`: solo state/index.ts + facade react-hooks (:338) + test, como dice la claim ("el barril de state y la fachada"). |
| 68 | runtime/bootstrap/presentation/boundaries/system-error/ [DUPLICA parcial] | ACUERDO | Los tres limites de error existen: `boundaries/system-error/index.tsx`, `ui/structures/feedback/surface-lifecycle/error-boundary/index.tsx`, `runtime/engines/presentation/component-factory/error-boundary/index.tsx` — tres boundaries a distinto alcance, como describe la claim. |
| 69 | runtime/dom/runtime/css-color-resolution/ [DUPLICA ruta charts] | ACUERDO | `ui/patterns/visualization/charts/runtime/foundation/css-color-resolution/index.ts` es un shim que solo reexporta (`resolveCssColor`, `PROVIDER_PAINT_ATTRIBUTE_FILTER`) desde `@/infrastructure/runtime/dom/runtime/css-color-resolution` y se autodeclara "Compatibility shim". |
| 70 | runtime/engines/foundation/contracts/binding/ [SIN CONSUMIDOR] | ACUERDO | El archivo termina en `export {};` ("Reserved module for future engine binding utilities"). Unica referencia en src/scripts/showroom: `engines/facade/index.ts:24` (`export * from '../foundation/contracts/binding'`). |
| 71 | runtime/error-handling/composition/react/use-error-handler/ [SIN CONSUMIDOR] | ACUERDO | Fuera de la carpeta: `src/index.ts` lo publica; la unica otra mencion es un comentario `@see` en `error-handling/runtime/handler/index.ts:16`, no un consumo. Ningun componente ni showroom lo usa. |
| 72 | runtime/facade/react-hooks/ [DUPLICA fachadas de dominio] | ACUERDO | react-hooks/index.ts reexporta lo mismo que las fachadas hermanas: `useTheme`/`useThemeContext` (:139) y `useTokens` (:148) que tambien salen por `theming/facade/index.ts:19,22`; `useMediaQuery`/`useBreakpoints`/`useResponsiveValue` (:181-189) que salen por `responsive/facade/index.ts:25-28`; `useFeatures` (:173) que sale por `features/facade/index.ts:14`. |
| 73 | runtime/features/presentation/gates/feature/ [SIN CONSUMIDOR] | ACUERDO | `FeatureGate`: fuera de su carpeta solo `features/facade/index.ts:15` lo publica; ni src, ni scripts, ni showroom lo usan (unico otro archivo: su propio test). |
| 74 | runtime/graphics/continuous-runtime-governor/ [VACIA; DUPLICA foundation/graphics] | ACUERDO | `find ... -type f | wc -l` → 0 en todo el subarbol; los 5 archivos reales viven en `runtime/foundation/graphics/continuous-runtime-governor/` (index.ts, foundation/contracts/index.ts, runtime/admission/index.ts + 2 tests) con la misma estructura; `grep -ra 'runtime/graphics/continuous-runtime-governor'` (excluyendo foundation/graphics) → 0. |
| 75 | .../continuous-runtime-governor/foundation/ [VACIA] | ACUERDO | 0 archivos (mismo find). |
| 76 | .../foundation/contracts/ [VACIA; DUPLICA] | ACUERDO | 0 archivos; el contrato real existe en `foundation/graphics/.../foundation/contracts/index.ts`. |
| 77 | .../continuous-runtime-governor/runtime/ [VACIA] | ACUERDO | 0 archivos. |
| 78 | .../runtime/admission/ [VACIA; DUPLICA] | ACUERDO | 0 archivos; el real: `foundation/graphics/.../runtime/admission/index.ts`. |
| 79 | .../runtime/admission/tests/ [VACIA; DUPLICA] | ACUERDO | 0 archivos; los dos tests reales existen: `continuous-runtime-governor.test.ts` y `particle-spatial-adapters.integration.test.ts` bajo foundation/graphics. |
| 80 | runtime/presentation-profiles/ [VACIA; DUPLICA product-profiles] | ACUERDO | Ver cabecera 1: 7 dirs, 0 archivos, 0 referencias en core+showroom. |
| 81 | presentation-profiles/composition/ [VACIA] | ACUERDO | 0 archivos (mismo find). |
| 82 | presentation-profiles/composition/react/ [VACIA] | ACUERDO | 0 archivos. |
| 83 | .../react/provider/ [VACIA; DUPLICA product-profiles provider] | ACUERDO | 0 archivos; `product-profiles/composition/react/provider/` existe. |
| 84 | .../react/provider/profile/ [VACIA; DUPLICA] | ACUERDO | 0 archivos; `product-profiles/.../provider/profile/` existe. |
| 85 | .../react/provider/tests/ [VACIA] | ACUERDO | 0 archivos; y el find de product-profiles confirma que este NO tiene carpeta tests, tal como dice la claim. |
| 86 | presentation-profiles/facade/ [VACIA; DUPLICA product-profiles/facade] | ACUERDO | 0 archivos; `product-profiles/facade/` existe. |
| 87 | runtime/tenant/composition/react/authoring/use-create-tenant/ [SIN CONSUMIDOR] | ACUERDO | `useCreateTenant`: fuera de la carpeta solo `tenant/facade/index.ts` + su test propio (`.../use-create-tenant/tests/artifact-mount-restore.test.tsx`). |
| 88 | runtime/tenant/runtime/resolution/request/ [DUPLICA subdomain/ y domain/] | ACUERDO | request/index.ts no tiene ningun import de `../subdomain` ni `../domain` (la unica mencion es un ejemplo en docstring); implementa su propio modelo (`baseDomains`, `customDomainLookup`, `customDomainLookupAsync`, resolucion sync/async por hostname), mientras `subdomain/index.ts:36` (`resolveFromSubdomain`) y `domain/index.ts:25` (`configureDomainLookup`) hacen ese trabajo por su lado. |
| 89 | runtime/theming/composition/react/provider/theme/ [DUPLICA provider useThemeContext] | ACUERDO | `theme/index.ts:70-77`: `useTheme` = `useContext(ThemeContext)` + throw si falta, retorno `ThemeContextValue`; `provider/index.tsx:285-288`: `useThemeContext` identico salvo el texto del error ("useThemeContext must be used within ThemeProvider" vs "useTheme must be..."). Y theme/index.ts reexporta `export { useTheme as useThemeContext }` por compatibilidad. |
| 90 | .../react/tokens/sub-hooks/ [SIN CONSUMIDOR] | ACUERDO | `useColorTokens`/`useSpacingTokens`/`useMotionTokens`/`useTypographyTokens`/`useCardTokens`/`useAccentTokens`: fuera de la carpeta solo aparecen en reexports (tokens/index.ts:44-60 barril padre, theming/facade/index.ts, facade/react-hooks/index.ts); ningun archivo los llama. Nota: la claim enumera dos barriles; hay un tercero (tokens/index.ts), tambien reexport puro. |
| 91 | runtime/theming/foundation/color/ [VACIA] | ACUERDO | `find ... -type f | wc -l` → 0; solo contiene la subcarpeta `oklch/` tambien vacia. |
| 92 | .../foundation/color/oklch/ [VACIA] | ACUERDO | 0 archivos; la implementacion OKLCH real vive en `foundation/kernel/color/oklch/` (index.ts, ramp/, chart-series/, tests/). |

## Conteo

- ACUERDO: 92 (89 filas de carpeta + 3 de cabecera)
- DESACUERDO: 1
- NO-VERIFICADO: 0

## Desacuerdos

1. Fila 12 — `foundation/tokens/css/facade/artifacts/rottay/`: la duplicacion es real, pero la fuente nombrada `ts/presentation/brand-themes/platform/index.ts` no existe; la carpeta es `brand-themes/rottay/` (el vertical `platform` ya no existe en el roster de brand themes).

## Notas menores (no cambian veredictos)

- Fila 8: "mismo cuerpo" de `clampValue` es equivalencia semantica; el texto invierte el orden Math.max/Math.min.
- Filas 56-58 y 90: ademas de la fachada citada, el barril padre inmediato (data/index.ts o tokens/index.ts) tambien reexporta; sigue sin haber ningun llamador real.
- Fila 16: `css/foundation/themes/` contiene hoy un solo archivo de tema (`default.css`) mas tests; la claim habla de "archivos de tema" en plural.

---

# Bloque 2 — ui/ + graphics/ + entrypoints/ + tooling/


Fecha: 2026-08-17. Repo: /Users/daniel/Developer/Rottay/ui-design-system (solo lectura).
Metodo: cada claim verificado contra el arbol real con `grep -ra` (ugrep), `find`, `ls` y lectura directa de archivos, sobre `packages/core/src` y `packages/showroom/src`. "ruta" = linea del mapa original (/tmp/mapa/ui.md o /tmp/mapa/graphics-entrypoints-tooling.md).

Preliminar: las 88 carpetas nombradas por los claims de UI existen (loop `[ -d ]` sobre la lista completa: todas "OK").

## Claims de UI (/tmp/kaudit/claims-ui.txt)

| ruta | veredicto | evidencia |
|---|---|---|
| ui.md:50 (display/Empty cuadruplicado) | ACUERDO | Las 4 existen. `primitives/display/Empty` header: "Placeholder for empty data states"; `patterns/feedback/empty-state`: "engine-aware placeholder component"; `structures/feedback/surface-lifecycle/states/index.tsx:39` "EMPTY keeps SurfaceEmptyState, which delegates to PatternEmptyState"; `surfaces/presentation/pages/experience/empty-state/index.tsx:4` "EmptyStateSurface -- full-page \"nothing here yet\" state". Cuatro vocabularios del mismo estado. |
| ui.md:51 (Timeline/Tree/Calendar vs patterns) | ACUERDO | Headers de los patterns: calendar-view "month/week/day calendar grid with event rendering"; timeline "chronological event display"; tree-view barrel exporta PatternTreeView + TreeViewConnector. Mismo nombre e idea que los primitives display; el pattern agrega interaccion/datos. |
| ui.md:52 (Statistic vs mono-stat / data-terminal-card) | ACUERDO | Statistic: display numerico con animacion; mono-stat header: cifra monoespaciada con count-up; data-terminal-card header: "single metric card... engine-free". Duplicacion parcial confirmada. |
| ui.md:56 (Switch vs Toggle) | ACUERDO | Switch header: "binary toggle control for on/off states"; Toggle header: "Boolean toggle switch for on/off states". Mismo trabajo. |
| ui.md:67 (layout/Layout) | ACUERDO | Layout header: "compound layout component for creating complete page structures with Header, Sider (sidebar), Content, and Footer... foundation for application shells". Se solapa con app-shell y page-shell (ambos existen y hacen marco de pagina). |
| ui.md:71 (Steps vs Stepper) | ACUERDO (matiz) | Ambos dibujan proceso por pasos. Matiz: el header de Steps tambien dice "clickable navigation", asi que el diferenciador declarado ("Stepper ademas navega al hacer clic") es impreciso; la duplicacion en si es real. |
| ui.md:76 (Message/Notification/Toast) | ACUERDO | Headers confirman exactamente: Message imperativa minima; Notification imperativa con titulo+descripcion+acciones ("More prominent than Message/Toast"); Toast familia declarativa. |
| ui.md:77 (Drawer vs Sheet) | ACUERDO | Sheet header: "Semantically different from Drawer: optimized for touch interactions with drag handle and snap points". La diferencia declarada es exactamente la tactil. |
| ui.md:82 (AlertDialog/ConfirmDialog/Popconfirm) | ACUERDO | Headers: AlertDialog con slots de accion y "Backdrop click does NOT close"; ConfirmDialog con callbacks onConfirm/onCancel; Popconfirm "compact confirmation popover for inline destructive actions". |
| ui.md:83 (Popover/HoverCard/Tooltip) | ACUERDO | Popover header: "Unlike Tooltip (plain text), Popover supports complex ReactNode content"; HoverCard: "rich content preview... on mouse hover". |
| ui.md:112 (grid-view / gallery-view) | ACUERDO | Ambos `runtime/item-identity/index.ts` son casi identicos (mismo helper `readRecordValue`, mismo docstring; solo cambia GridViewProps/GalleryViewProps). gallery-view tiene ademas `keyboard-navigation/`. |
| ui.md:115 (list-toolbar) | ACUERDO | list-toolbar fileoverview: "engine-aware two-row toolbar". La contraparte lo admite: ver ui.md:233. |
| ui.md:116 (column-settings) | ACUERDO | `structures/workspace/column-menu/index.tsx:13-19` comenta "Key differences from ColumnSettingsDropdown: ...". Y el detalle de exports es exacto: `column-settings/index.ts:13` `export const PatternColumnSettings`, `:23` `export const ColumnSettingsDropdown = PatternColumnSettings;` — no existe simbolo `PatternColumnSettingsDropdown`. |
| ui.md:117 (saved-views) | ACUERDO | saved-views-menu comenta: "Different from the SavedViewsBar pattern (also in DS)". Reconocimiento escrito del solape. |
| ui.md:118 (stats-grid) | ACUERDO | `patterns/data/stats-grid/foundation/` contiene `layout/` y `personality/` (ls). stats-header es tambien tira de tarjetas de metrica con sparkline y conteo animado (headers leidos). |
| ui.md:119 (record-facts SIN CONSUMIDOR en core) | ACUERDO (matiz) | En core solo lo tocan el barrel `patterns/data/index.ts`, entrypoints y `foundation/tokens/__tests__/reduced-motion-guard.test.ts`. Matiz: en showroom no son solo fixtures — lo renderizan `pattern-preview-fixtures.tsx:1065-1067` y la pagina probe `probe/ds-reference/sections/r3-evidence/index.tsx:48,1759`. |
| ui.md:121 (decision-panorama SIN CONSUMIDOR) | DESACUERDO | Falso que "el unico archivo que lo nombra es su propio index.ts": `core/src/ui/patterns/customization/brand-studio/runtime/tenant-theme-preview/fixtures/visual-excellence/index.tsx:46` lo importa y `:354` renderiza `<DecisionPanorama`. Ademas skin CSS + registro/navegacion del showroom. |
| ui.md:122 (widget-board SIN CONSUMIDOR) | DESACUERDO | El mismo fixture de brand-studio lo importa (`:48`) y renderiza `:726` `<WidgetBoard items={items} labels={BOARD_LABELS} editable />`; showroom `pattern-preview-fixtures.tsx:1227` renderiza WidgetBoardPreview; `src/index.ts:174` exporta widget-board/runtime/adaptive/policy. |
| ui.md:123 (bulk-select-toggle SIN CONSUMIDOR) | DESACUERDO | No es "solo registro del showroom y una prueba de tokens": `core/src/ui/patterns/data/tests/PatternsLongTailBatch.contract.test.tsx:6` lo importa; showroom lo renderiza en `probe/ds-reference/sections/r2-behavior/index.tsx:1458` y `surfaces-long-tail-fixture.tsx:251-253`. |
| ui.md:124 (status-filter-pills SIN CONSUMIDOR) | DESACUERDO | `core/src/ui/structures/workspace/tests/WorkspaceChromeBatch.contract.test.tsx:20` lo importa; showroom `torture-sections/workspace-chrome/index.tsx:101` lo renderiza. |
| ui.md:125 (mono-stat SIN CONSUMIDOR) | DESACUERDO | 3 tests de integracion monochrome lo importan (`tooling/testing/integration/monochrome/{bidi-determinism,cohort,content-anatomy}/tests/index.test.tsx`); showroom lo renderiza en `probe/.../config-b.tsx` y `kit-inventory/page.tsx`. |
| ui.md:131 (filter-panel) | ACUERDO | Misma tarea que field-filters-panel (retícula de filtros); field-filters-panel contrasta en su comentario con FilterBuilder. Duplicacion confirmada. |
| ui.md:143 (calendar-view vs Calendar) | ACUERDO | Header de calendar-view confirma calendario mes/semana/dia; primitive Calendar hace la misma retícula sin datos/eventos ricos. |
| ui.md:145 (timeline vs Timeline) | ACUERDO | Headers confirman: misma idea, el pattern agrega interaccion. |
| ui.md:146 (tree-view vs Tree) | ACUERDO | tree-view barrel: PatternTreeView (interactivo por engine) + TreeViewConnector (estatico). Duplicacion parcial con primitives/display/Tree confirmada. |
| ui.md:148 (ascii-diagram SIN CONSUMIDOR) | DESACUERDO | Tests monochrome (content-anatomy, visual-remediation, cohort) lo importan; showroom `kit-inventory/page.tsx:71` renderiza `<AsciiDiagram`. |
| ui.md:162 (approval-inbox deprecado + duplica) | ACUERDO | `approval-inbox/index.ts:19-21`: "@deprecated Use `DecisionInboxSurface` instead... Will be removed in a future major version." approval-workflow y decision-inbox existen. |
| ui.md:176 (page-shell) | ACUERDO | `structures/shell/page-shell-surface` header: "Minimal surface wrapper around the generic `PatternPageShell`". app-shell y Layout existen y hacen marco de pagina. |
| ui.md:178 (workbench-header) | ACUERDO | cockpit-header: "rich header for detail/workbench pages"; workbench-header: header de "role-home". Los 7 owners de `structures/headers/` existen. Duplicacion parcial confirmada. |
| ui.md:179 (feature-workspace-frame SIN CONSUMIDOR) | ACUERDO | Solo skin CSS, entrypoint publico y metadata del showroom; `pattern-preview-fixtures.tsx:1285` dice literalmente "FeatureWorkspaceFrame adapter pending" (no lo importa ni renderiza). |
| ui.md:185 (token-inspector SIN CONSUMIDOR) | DESACUERDO | `core/src/ui/patterns/tests/cross-capability.contract.test.tsx` lo importa; showroom lo renderiza en `r2-behavior/index.tsx:1686` (`<TokenInspector />`) y `torture-sections/misc-h2/index.tsx:352`. |
| ui.md:186 (trio de customization) | ACUERDO | brand-studio (editor acotado + live preview), tenant-preview ("demonstrates what runtime theming will look like before a tenant config is saved"), branding-preview-sandbox ("preview branding changes before saving"): tres implementaciones de "ver la marca antes de guardar". |
| ui.md:189 (empty-state pattern) | ACUERDO | Mismo cuadruplicado que ui.md:50, visto desde el pattern. Confirmado. |
| ui.md:191 (terminal-block SIN CONSUMIDOR) | DESACUERDO | Tests monochrome lo importan; showroom lo renderiza en `config-b.tsx` y `kit-inventory/page.tsx`; ademas `ascii-diagram/index.tsx` lo referencia. |
| ui.md:226 (headers edit vs form) | ACUERDO (matiz) | Anatomia casi identica (back nav, breadcrumb, hero title cluster, action rail). Matiz: no es puro copy — Edit agrega dirty indicator + save/cancel, Form agrega required badge. |
| ui.md:227 (header-surface) | ACUERDO | Header: "lightweight page chrome with optional tabs". Duplicacion parcial con los demas headers confirmada. |
| ui.md:233 (table-toolbar) | ACUERDO | `table-toolbar/runtime/rendering/index.tsx` comenta: "Unlike the heavier `ListToolbar` pattern (two-row...)... Use `TableToolbar` (chrome) when... Use `ListToolbar` (pattern...) when...". Admision escrita. |
| ui.md:234 (search-command-bar) | ACUERDO | Header: "structures-tier command/search bar". Barra sobre coleccion con busqueda+acciones: duplicacion parcial con table-toolbar confirmada. |
| ui.md:236 (field-filters-panel) | ACUERDO (matiz) | Misma tarea que filter-panel. Matiz: su comentario contrasta con FilterBuilder, no con FilterPanel. |
| ui.md:237 (column-menu) | ACUERDO | Mismo comentario "Key differences from ColumnSettingsDropdown" de ui.md:116, visto desde el lado structure. |
| ui.md:238 (saved-views-menu) | ACUERDO | Comentario "Different from the SavedViewsBar pattern (also in DS)". |
| ui.md:239 (scope-switcher) | ACUERDO | Header: "horizontal scope pill strip". Tira de pildoras que filtra subconjunto de datos, igual que status-filter-pills: duplicacion parcial plausible y verificada por headers. |
| ui.md:254 (form-sections) | ACUERDO (matiz) | edit-fields se declara "Companion to `record`... and `form-sections`" y trae "primary/advanced disclosure region" (solape real). Matiz: la mitad form-builder es debil — no hay concepto de seccion en los contracts de form-builder (1 solo hit de "section" en engines/modern). |
| ui.md:258 (stats-header) | ACUERDO | Header: tira de stat-cards con engines; duplica stats-grid (ver ui.md:118). |
| ui.md:259 (data-terminal-card) | ACUERDO | Header: "single metric card... engine-free". Duplicacion parcial con stats-header y Statistic confirmada. |
| ui.md:271 (page-shell-surface) | ACUERDO | Header: "Minimal surface wrapper around the generic `PatternPageShell`". Adaptador declarado. |
| ui.md:276 (grupo shell, 4 marcos) | ACUERDO (matiz) | Los 4 marcos existen y se solapan con page-shell y Layout. Matiz: workspace-shell se autodeclara "This is page chrome, not a page recipe" y page-shell-surface es adaptador declarado — no todos compiten como implementaciones independientes. |
| ui.md:300 (collection-workspace vs data/list) | ACUERDO | `collection-workspace/index.tsx:4`: "Single canonical workspace surface for all collection/list/table screens." Y ListSurface sigue publicada: `data/list/index.tsx:309` `export function ListSurface` → `data/index.ts:6` → `pages/index.ts:6` → `surfaces/index.ts:130` → `src/index.ts:333` `export * from './ui'`. |
| ui.md:301 (record-workbench vs detail) | ACUERDO | `record-workbench/index.tsx:6`: "Enhanced DetailSurface with: tab management, related records, action toolbar,". |
| ui.md:305 (los cuatro envuelven PatternFormBuilder) | DESACUERDO | Son 3 de 4: `grep -ral FormBuilder` da forms/form, forms/wizard y forms/detail-form; `guided-draft-form/index.tsx` tiene CERO referencias a FormBuilder — compone primitives directamente (Box, Stack, Flex, Typography, Button, Select, Card, Progress, Skeleton). |

Subtotal UI: 41 ACUERDO / 9 DESACUERDO / 0 NO-VERIFICADO.

## Claims graphics / entrypoints / tooling (/tmp/kaudit/claims-graphics-entrypoints-tooling.txt)

| ruta | veredicto | evidencia |
|---|---|---|
| g-e-t.md:93 (presets/bithire entrada del generador) | ACUERDO | `presets/bithire/manifest.json` (expectedCount 104, sourceInventory "app-bithire/tests/architecture/_shared/icon-facade-inventory") es entrada; la salida generada vive en `generated/presets/bithire/index.tsx`. |
| g-e-t.md:122 (legacy DUPLICA catalog) | ACUERDO | `graphics/icons/index.ts:37-42`: "The following legacy components have catalog equivalents with the same name. They are intentionally NOT re-exported here to avoid conflicts. Legacy: UserIcon, UsersIcon, CheckIcon, XIcon, InfoIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, EyeIcon, EyeOffIcon, CameraIcon". Solo AlertIcon y LoaderIcon se re-exportan. |
| g-e-t.md:132 (13 legacy sin refs) | ACUERDO | `grep -ral "legacy/<Nombre>"` = 0 para los 13; el unico importador de `presentation/legacy` es `graphics/icons/index.ts:34`. |
| g-e-t.md:153 (runtime/adapters + phosphor-ssr vacios) | ACUERDO | `find` muestra ambas carpetas con 0 archivos. Resto de relocalizacion; sin consumidor por definicion. |
| g-e-t.md:219 (particles runtime/governance duplica) | ACUERDO | Carpeta vacia (0 archivos); el archivo real esta en `runtime/canvas/governance/animation-lease/index.ts`. |
| g-e-t.md:221 (animation-lease vacia SIN CONSUMIDOR) | ACUERDO | Carpeta vacia (0 archivos, find). |
| g-e-t.md:273 (useSmoothCounter vs CountUp) | ACUERDO | Ambos headers dicen "Animates a numeric value"; uno hook, otro componente. Mismo trabajo, dos formas. |
| g-e-t.md:345 (marks/brand vs ./marks) | ACUERDO | `./marks/brand` es subconjunto enfocado (BrandMark, BRAND_MARK_NAMES...); `./marks` hace `export * from '../../../graphics/brand-marks'` (todo). |
| g-e-t.md:364 (icons/full vs icons) | ACUERDO | Ambos exportan Icon, ICON_CORPUS/ICON_NAMES/isIconName, ICON_PROVENANCE y los mismos types; `./icons` agrega `export * from '../../graphics/icons'` (catalogo legacy); `./icons/full` agrega los exports de gobernanza GRAPHIC_ASSET_*. Exactamente como se afirma. |
| g-e-t.md:422 (public/patterns/contracts vacia) | ACUERDO | find: 0 archivos. |
| g-e-t.md:435 (public/primitives/contracts vacia) | ACUERDO | find: 0 archivos. |
| g-e-t.md:436 (public/primitives/runtime vacia) | ACUERDO | find: 0 archivos. |
| g-e-t.md:443 (runtime/motion duplica parcial) | ACUERDO | `./runtime/motion` exporta exactamente 6 simbolos (GridPattern, NoiseTexture, CountUp, FadeIn, ScaleIn, useInView); todos ya fluyen por la raiz: `src/index.ts:328` `export * from './graphics/motion'` y `graphics/motion/index.ts` reexporta `./react` (effects/index.ts:19 GridPattern, primitives/index.ts:17 CountUp, runtime/index.ts:9 useInView). |
| g-e-t.md:463 (public/structures/contracts vacia) | ACUERDO | find: 0 archivos. |
| g-e-t.md:464 (public/structures/runtime vacia) | ACUERDO | find: 0 archivos. |
| g-e-t.md:469 (public/surfaces/contracts vacia) | ACUERDO | find: 0 archivos. |
| g-e-t.md:470 (public/surfaces/runtime vacia) | ACUERDO | find: 0 archivos. |
| g-e-t.md:531 (examples/i18n sin consumidor de codigo) | ACUERDO | Unicas referencias: `scripts/pack-inventory.baseline.json` y `scripts/tooling/quality/evidence/programs/modern-rescue/scripts/foundation/tokens/manifest/fanout.test.mjs`. Nadie lo importa. |
| g-e-t.md:593 (lane-control sin script npm) | ACUERDO | 0 hits en `package.json`; referencias solo en `scripts/core-structure-audit.test.mjs`, `scripts/libraries/owner-nesting.mjs`, docs de modern-rescue y `index.mjs`. |
| g-e-t.md:678 (resolution-probe sin script npm) | ACUERDO | 0 hits en `package.json`; referencias en `core-structure-audit.mjs/.test.mjs` y manifests de modern-rescue. |
| g-e-t.md:759 (bloque resumen SIN CONSUMIDOR) | ACUERDO | Consistente con los hallazgos verificados arriba (legacy 13, carpetas vacias, examples/i18n, lane-control, resolution-probe). |
| g-e-t.md:771 (bloque resumen DUPLICA) | ACUERDO | Consistente con los hallazgos verificados arriba (catalog vs legacy, marks/brand, icons/full, runtime/motion, useSmoothCounter/CountUp). |

Subtotal graphics/entrypoints/tooling: 22 ACUERDO / 0 DESACUERDO / 0 NO-VERIFICADO.

## Las cinco afirmaciones fuertes

| # | afirmacion | veredicto | evidencia |
|---|---|---|---|
| 1 | El chrome de coleccion esta escrito dos veces (patterns vs structures) y los comentarios de structures lo admiten | ACUERDO (matiz) | table-toolbar ("Unlike the heavier ListToolbar pattern..."), column-menu ("Key differences from ColumnSettingsDropdown"), saved-views-menu ("Different from the SavedViewsBar pattern (also in DS)") nombran por escrito a su contraparte pattern. Matiz: el comentario de field-filters-panel contrasta con FilterBuilder, no con FilterPanel — 3 de los 4 pares tienen admision escrita literal. |
| 2 | Dos recetas de pagina completas para la misma pantalla de coleccion; collection-workspace se declara canonica y ListSurface sigue publicada | ACUERDO | `collection-workspace/index.tsx:4` "Single canonical workspace surface for all collection/list/table screens."; ListSurface exportada por la cadena completa `data/list/index.tsx:309` → `data/index.ts:6` → `pages/index.ts:6` → `surfaces/index.ts:130` → `src/index.ts:333`. |
| 3 | Seis marcos de pagina compitiendo | ACUERDO (matiz) | Los 6 existen y hacen trabajo de marco (Layout, page-shell, app-shell, workspace-shell, page-shell-surface, sidebar-surface). Matiz: page-shell-surface es un adaptador autodeclarado de page-shell y workspace-shell se autodeclara "page chrome, not a page recipe" — no son seis implementaciones independientes, pero el solape de proposito es real. |
| 4 | `ui/patterns/commercial/` y `surface-composition/` ya no existen aunque CLAUDE.md los declara deuda pendiente | ACUERDO | `find packages/core/src -type d -name "*commercial*"` y `-name "*surface-composition*"` devuelven NADA; `ui-design-system/CLAUDE.md` (lineas 154, 201-202, 243-244) sigue mandando adjudicar "los 11 owners de ui/patterns/commercial/" y "los 4 componentes inventariados como surface-composition". La instruccion apunta a carpetas inexistentes. |
| 5 | `graphics/icons/presentation/legacy/` tiene 15 iconos a mano, 13 cubiertos por el catalogo, no re-exportados, 0 referencias | ACUERDO | ls: exactamente 15 carpetas de icono + index.ts; `legacy/index.ts` exporta los 15; `graphics/icons/index.ts` re-exporta solo AlertIcon y LoaderIcon y declara en :37-42 que los otros 13 NO se re-exportan; `grep -ral "legacy/<Nombre>"` = 0 para los 13. |

## Totales

- ACUERDO: 68 (41 UI + 22 graphics/entrypoints/tooling + 5 fuertes; 6 con matiz explicito)
- DESACUERDO: 9 (todos en UI)
- NO-VERIFICADO: 0

## DESACUERDOS (detalle)

1. ui.md:121 decision-panorama: SI tiene consumidor — el fixture visual-excellence de brand-studio en core lo importa y renderiza (`.../fixtures/visual-excellence/index.tsx:46,354`).
2. ui.md:122 widget-board: el mismo fixture de brand-studio lo renderiza (`:48,726`) y el showroom tiene WidgetBoardPreview (`pattern-preview-fixtures.tsx:1227`).
3. ui.md:123 bulk-select-toggle: lo importa un contract test de core (`PatternsLongTailBatch.contract.test.tsx:6`) y lo renderizan dos paginas del showroom.
4. ui.md:124 status-filter-pills: lo importa un contract test de core (`WorkspaceChromeBatch.contract.test.tsx:20`) y lo renderiza una torture-section del showroom.
5. ui.md:125 mono-stat: lo importan 3 tests de integracion monochrome en core y lo renderizan probes del showroom (config-b, kit-inventory).
6. ui.md:148 ascii-diagram: lo importan 3 tests monochrome y lo renderiza `kit-inventory/page.tsx:71`.
7. ui.md:185 token-inspector: lo importa `cross-capability.contract.test.tsx` en core y lo renderizan dos paginas del showroom.
8. ui.md:191 terminal-block: lo importan los tests monochrome, lo renderizan config-b y kit-inventory, y ascii-diagram lo referencia.
9. ui.md:305 "los cuatro envuelven PatternFormBuilder": son 3 de 4 — guided-draft-form no tiene ninguna referencia a FormBuilder; compone primitives directamente.

Patron de los desacuerdos 1-8: el mapeador no conto como consumidores (a) el fixture visual-excellence de brand-studio dentro de core, (b) los contract/integration tests de core, ni (c) las paginas probe/torture/kit-inventory del showroom que importan y renderizan estos componentes. Si la definicion de [SIN CONSUMIDOR] del propio mapa (ui.md:27: "nadie la importa fuera de su propia carpeta" en core+showroom) se aplica literalmente, esos 8 veredictos son falsos.

---

# Bloque 3 — packages/core fuera de src/ + raíz del repo


Auditor: Fable (agente independiente). Fecha: 2026-08-18. Repo: /Users/daniel/Developer/Rottay/ui-design-system (solo lectura).
Nota de método: los extractos estaban truncados; el contexto completo se recuperó de `docs/history/inventories/repository-map/2026-08/index.md` (el mapa vive en el propio repo). Todos los comandos corrieron sobre el árbol actual (git status limpio en las zonas auditadas salvo lo ya listado en el status de sesión).

## A. claims-core-fuera-de-src.txt (27 líneas)

Las líneas 10, 11 (leyenda) y 570, 596 (títulos de sección) no son afirmaciones; se listan como CONTEXTO. Las líneas 412+413 son un solo claim.

| ruta | veredicto | evidencia |
|---|---|---|
| L10, L11 (leyenda) | CONTEXTO | Definiciones de [DUPLICA]/[SIN CONSUMIDOR]; nada que verificar. |
| L111 `packages/core/scripts/theme-channel-parity-gate.mjs` [DUPLICA parcial: dos alias idénticos en package.json] | ACUERDO | packages/core/package.json:674 `"parity:theme:check": "node scripts/theme-channel-parity-gate.mjs --check"` y :679 `"theme-parity:check": "node scripts/theme-channel-parity-gate.mjs --check"` — mismo comando byte a byte. En CI: scripts/check/automation-gates.manifest.mjs:218. |
| L130 `packages/core/scripts/tenant-reach-census.mjs` [SIN CONSUMIDOR] | ACUERDO | `grep -ral "tenant-reach-census" .` (excl. node_modules/.git/dist) → solo el propio .mjs y docs/history/inventories/repository-map/2026-08/index.md. Sin hits en package.json, ci-gates.manifest.mjs ni .github/workflows/ci.yml (grep exit 1). |
| L170 `packages/core/scripts/skin-orphan-scope-audit.mjs` (+ baseline) [SIN CONSUMIDOR] | ACUERDO | Mismo grep repo-wide: solo el propio archivo y el mapa. El baseline existe (scripts/skin-orphan-scope-baseline/index.json) pero nadie invoca el script. |
| L173 `packages/core/scripts/skin-census.mjs` [SIN CONSUMIDOR] | ACUERDO | Los únicos hits fuera de roadmap/docs son comentarios: scripts/libraries/fleet-inline-paint-census.mjs:30 ("This is the executable form of the existing scripts/skin-census.mjs law") y scripts/check/engine-token-audit.mjs:677 ("historical skin-census law"). ci.yml:55 matchea `roadmap/skin-census.json` (archivo de datos en un filtro de cambios), no el script. Sin entrada en package.json ni en ci-gates.manifest.mjs. |
| L204 `packages/core/scripts/cra-17-integral-gate.mjs` [SOLO DRILL]+[DUPLICA] de los dos gates cra-17 | ACUERDO | Importa ambos: cra-17-integral-gate.mjs:14 `import { auditGraphicsPackaging } from './cra-17-packaging-license-gate.mjs'` y :15-17 desde './cra-17-public-declaration-gate.mjs'; :352 los reejecuta. No aparece en package.json (solo cra17:licenses :650 y cra17:declarations :651, que sí corren en prebuild/prepack :638-639) ni en ci-gates.manifest.mjs (grep "cra-17" → 0 hits). Su drill scripts/cra-17-integral-gate.test.mjs existe y cae bajo el glob `scripts/*.test.mjs` de test:scripts (package.json:664). |
| L232 `packages/core/scripts/generate-surface-capability-census.mjs` [SIN CONSUMIDOR] | ACUERDO | grep "surface-capability" en package.json → 0 hits; sin entrada en ci-gates.manifest.mjs. La librería scripts/libraries/surface-capability-census.mjs existe y su drill scripts/surface-capability-census.test.mjs cae bajo `scripts/*.test.mjs`; el CLI no lo llama nadie (hits restantes: mapa y evidencia gat-07, que es corpus, no invocador). |
| L254 `packages/core/scripts/codemod-motion-tokens.mjs` [SIN CONSUMIDOR] | ACUERDO | Hits: el propio archivo, docs/history/inventories/repository-map/2026-08/index.md, roadmap/registry.json:104 (nota narrativa de WO-ENG-01, no invocación) y evidencia gat-07. Sin package.json/ci. |
| L256 `packages/core/scripts/codemod-motion-durations.mjs` [SIN CONSUMIDOR] | ACUERDO | Ídem: registry.json:109 es nota de progreso, no invocación. Sin package.json/ci. |
| L261 [DUPLICA de ubicación: existe `scripts/tooling/maintenance/codemods/` y los codemod-motion-* viven en la raíz] | ACUERDO | `ls packages/core/scripts/` muestra codemod-motion-durations.mjs y codemod-motion-tokens.mjs en la raíz plana, y la carpeta `codemods/` al lado (README.md + sizetype-to-size.mjs + variant-tone-split.mjs). |
| L310 `packages/core/scripts/tooling/maintenance/codemods/sizetype-to-size.mjs` [SIN CONSUMIDOR] dentro del paquete | ACUERDO | Refs fuera de la carpeta: src/tooling/lane-control/integration/tests/drills/work-order/index.mjs:369 lo usa solo como STRING de fixture (`wo.commitPathspecs = ['packages/core/scripts/tooling/maintenance/codemods/sizetype-to-size.mjs']`) y roadmap/architecture.md:110,116 lo documenta ("apps are READ-ONLY — codemods are recorded here and executed by the app orchestrators"). Nadie lo ejecuta en este paquete. |
| L314 `packages/core/scripts/tooling/maintenance/codemods/variant-tone-split.mjs` [SIN CONSUMIDOR] | ACUERDO | Mismas referencias (roadmap/architecture.md:110); ninguna ejecución en el paquete. |
| L369 `packages/core/scripts/check/evidence/cli.mjs` [DUPLICA] de v2/cli.mjs, sigue enchufado pese al README | ACUERDO | Ver afirmación fuerte 1 abajo. package.json:680 `"quality-evidence:check": "node scripts/tooling/quality/evidence/cli.mjs validate-manifest"`; README.md:8 "## v1 — HISTORICAL BASELINE ONLY", :12-13 "is **not current-wave evidence** and may not be cited as coverage, quality". |
| L408 `.../modern-rescue/index.mjs` [SIN CONSUMIDOR] | ACUERDO | Referenciado solo por cascade-materialize.mjs y cascade-backlog.mjs (la propia cadena) y por los JSON que emite en governance/manifest/cascade/. grep "cascade-" en packages/core/package.json, ci-gates.manifest.mjs y .github/workflows/ci.yml → 0 hits: ningún pipeline corre la cadena. |
| L409 `.../modern-rescue/cascade-materialize.mjs` [SIN CONSUMIDOR] | ACUERDO | Ídem: solo sus salidas governance/manifest/cascade/materialized/*.json lo mencionan. Sin pipeline. |
| L410 `.../modern-rescue/cascade-backlog.mjs` [SIN CONSUMIDOR] | ACUERDO | Ídem: solo governance/manifest/cascade/backlog/*.json. Sin pipeline. |
| L412-413 `.../modern-rescue/index.mjs` (+ .test.mjs) [DUPLICA] de probe/index.mjs + [SIN CONSUMIDOR] | ACUERDO (con matiz) | 776 líneas (wc -l), header en inglés, dos patas (simbólica + Chromium). probe/index.mjs (2729 líneas, español) existe y también implementa la sonda → la duplicación es real. Sin consumidor: grep "cascade-probe" repo-wide → solo el mapa, los propios archivos y un string de tmpdir en probe/index.mjs:361; nada en package.json/governance/manifest/ci.yml. Su test no cae en ningún glob (ver análisis de globs en la fila L445). MATIZ: no son árboles ajenos — index.mjs:75-84 importa `./probe/index.mjs`, `./probe/index.mjs`, `./probe/index.mjs`, `./probe/index.mjs`. |
| L421 `.../modern-rescue/probe/` como "segunda implementación partida en módulos" (cascade-probe + leg1 + leg2 + css-model + css-parse + value-eval + test 692 líneas) [DUPLICA] de ../index.mjs; "ninguna de las dos corre" | DESACUERDO (parcial) | La partición está al revés: `../index.mjs` (la sonda raíz) IMPORTA probe/index.mjs, probe/index.mjs, probe/index.mjs y probe/index.mjs (index.mjs:75-84, igual en HEAD, git status limpio) — esos 5 módulos son parte de la sonda raíz, no de una segunda implementación. El único duplicado real es probe/index.mjs: monolito de 2729 líneas, en español, que solo importa node:fs/node:path/node:url (líneas 117-119) y se autodescribe como "la pata SIMBOLICA". Sí es cierto: test de 692 líneas (wc -l), y ninguna de las dos corre (sin invocador, sin glob). |
| L426 `.../modern-rescue/KIMI-ANNOTATIONS/` vacía con inbox/ vacío [SIN CONSUMIDOR] hoy | ACUERDO | `find KIMI-ANNOTATIONS -type f | wc -l` → 0; solo contiene `inbox/`. Menciones (art-direction/index.json, ledgers en test-artifacts) nombran el buzón como protocolo, nadie lo lee hoy. |
| L445 `.../modern-rescue/scripts/foundation/tokens/manifest/fanout.test.mjs` [SIN CONSUMIDOR: ningún glob lo alcanza] | ACUERDO | test:scripts (package.json:664) corre: `v2/*.test.mjs`, index.test.mjs + scripts/foundation/tokens/manifest/generation.test.mjs (explícitos), `scripts/*.test.mjs` (raíz plana, no recursivo) y vitest con scripts/vitest.scripts.config.ts cuyo include es `scripts/**/*.vitest.test.ts` (solo captura certified-data-css-producers.vitest.test.ts). vitest.config.ts incluye `src/**/*.test.{ts,tsx}`. ci.yml solo corre `pnpm ... test:scripts` (línea 167) y no menciona fanout-facts (grep → 0). Ningún camino llega a governance/manifest/*.test.mjs salvo generator.test.mjs. |
| L447 `.../scripts/foundation/tokens/scripts/foundation/tokens/manifest/mirror-parity.test.mjs` [SIN CONSUMIDOR] | ACUERDO | Mismo análisis de globs; grep "mirror-parity" en ci.yml y ci-gates.manifest.mjs → 0. |
| L449 `.../scripts/foundation/tokens/scripts/foundation/tokens/manifest/root-checklistss.test.mjs` [SIN CONSUMIDOR] | ACUERDO | Mismo análisis; grep "root-checklist" en ci.yml/manifest → 0. |
| L466 `packages/core/styles/platform.css` [DUPLICA] de styles/rottay.css | ACUERDO | Ver afirmación fuerte 3. `cmp` sin diferencias; 126218 líneas cada uno; roster `FirstPartyVerticalId = 'rottay' | 'bithire' | 'evnto'` (src/foundation/contracts/kernel/verticals/index.ts:60); brand-themes/ solo tiene bithire/evnto/rottay; scripts/platform-identity-zero-gate.mjs existe (package.json:689); grep "platform" en package.json solo devuelve ese gate — ningún export apunta a platform.css; grep "platform" en build-vertical-css.mjs → 0 (el generador no lo escribe). Ambos headers dicen "platform vertical bundle" (el de rottay.css está desactualizado, como anota el mapa). |
| L570 / L596 (títulos de sección del índice) | CONTEXTO | Encabezados de las listas [DUPLICA]/[SIN CONSUMIDOR]; sin contenido propio. |

## B. claims-raiz-showroom.txt (11 líneas)

Las líneas 166 y 174 son encabezados; CONTEXTO.

| ruta | veredicto | evidencia |
|---|---|---|
| L20 `scripts/maintain/roadmap/commercial-status/index.mjs` [DUPLICA] de scripts/maintain/roadmap/status/index.mjs; "no comparten ni una línea de código: reimplementa desde cero" | DESACUERDO (en el "cómo"; el rótulo [DUPLICA] sí vale) | wc -l: 3177 vs 304 — correcto. Sin imports entre sí — correcto. Pero NO es una reimplementación desde cero: el propio header lo declara — scripts/maintain/roadmap/commercial-status/index.mjs:2 "Copied from ui-design-system scripts/roadmap-status.mjs (2026-07-07)" y :4-9 "Byte-identical ... EXCEPT for exactly TWO functional divergences" (ROADMAP y LANES). `comm -12` sobre líneas ordenadas únicas da 191 líneas no vacías compartidas (lógica sustantiva, no solo llaves). Es una copia congelada que divergió porque el original creció a 3177; "no comparten ni una línea" es falso. |
| L23 los 17 archivos codemod de `scripts/` [SIN CONSUMIDOR], escriben sobre packages/core/src/components/custom/ que ya no existe | ACUERDO | `ls scripts | wc -l` → 24. `grep -la "components/custom" scripts/*.mjs` → 16 scripts (los 16 nombrados); helper-gaps-report.json también contiene esos paths (17 archivos en total). `test -d packages/core/src/components` → NO-EXISTE. grep de add-accent-bars/fix-focus-rings/adopt-helpers en package.json (raíz y core) y ci.yml → 0 hits. |
| L34 `docs/ARCHITECTURE.md` [DUPLICA parcial] con docs-engineering/engineering/design-system/architecture/README.md | ACUERDO | wc -l: 204 vs 198 — coincide. No son copias: headings complementarios (local: "Engine model", "Icons and brand assets", "Charts and responsive behavior", "Public boundaries"; docs-eng: "Custom-Property Namespace Law", "Import Boundary", "Data Boundary") y solapan en ownership/árbol físico/stack UI/pipeline. Ninguno enlaza al otro: grep "docs-engineering" en docs/ARCHITECTURE.md → 0 hits; grep "ARCHITECTURE.md" en el README de docs-eng → exit 1. (Nota lateral fuera del extracto: la frase vecina del mapa "el README de la raíz NO lo enlaza" es falsa — README.md:94 enlaza `docs/ARCHITECTURE.md`.) |
| L60 `roadmap-commercial/` [DUPLICA] a roadmap/ en forma | ACUERDO (con la corrección de L20) | `ls roadmap-commercial/` → README.md, STATUS.md, registry.json, showroom.md — misma estructura (README + lane + registry + STATUS). La maquinaria está duplicada de verdad (3177 vs 304, divergidas), pero "reimplementa" es impreciso: es copia declarada con divergencias registradas. El aislamiento 2026-07-07 consta en el header del script. |
| L72 `.claude/agents/componentes-agent.md` y `storybook-agent.md` [SIN CONSUMIDOR], stack desactualizado | ACUERDO (con nota) | componentes-agent.md:9 "React 18.2.0", :11 "Ant Design 5.21.0: Librería de componentes base", :12 "Vite 5"; storybook-agent.md:9 "Storybook 9.1.10", :11 "Ant Design 5.21.0". grep -ral por sus nombres fuera de .claude/ → 0 hits (exit 1). Nota: los .md de .claude/agents/ son definiciones que el harness descubre por convención de carpeta, así que "nadie los enlaza" no impide que se carguen; pero la afirmación literal (ningún archivo los invoca/enlaza, stack obsoleto) es cierta. |
| L80 `coverage/` y `coverage-final/` vacías [SIN CONSUMIDOR] + [DUPLICA] entre sí | ACUERDO | `find coverage coverage-final -type f` → 0 archivos; cada una contiene solo `.tmp/` vacío. .gitignore:18-19 `coverage/`, `coverage-*/`. |
| L94 `packages/showroom/.tmp/` (32 archivos) [SIN CONSUMIDOR] | ACUERDO | `find packages/showroom/.tmp -type f | wc -l` → 32; nombres coinciden (k2v-debug-cell.mjs, k2v-debug2..4.mjs, k3a-*.mjs, daisy-regression-capture.mjs...). .gitignore:100-101 (`.tmp/`, `packages/showroom/.tmp/`). |
| L135 `test-artifacts/release/` [SIN CONSUMIDOR] | ACUERDO | 5737 archivos (find), 0 en git (git ls-files → 0), 76M (du). 2.19.29/ = .tgz + unpacked/ con 5730 archivos; 2.19.3/ = npm-cache + npm-publish-2.19.3.json + .tgz. Fechas 1985 presentes (`find ... ! -newermt 1990-01-01` devuelve archivos de unpacked/) y nada posterior a 2026-07-17. grep -ra "test-artifacts/release" fuera de test-artifacts/ y del mapa → 0 hits. |
| L141 `test-artifacts/releases/` [DUPLICA] de release/ | ACUERDO | Un único archivo: rottay-design-system-2.19.32.tgz (6.4M). Dos hermanas a una "s" de distancia con la misma función. |
| L166 / L174 (encabezados) | CONTEXTO | Sin contenido propio. |

## C. Afirmaciones fuertes

| # | afirmación | veredicto | evidencia |
|---|---|---|---|
| 1 | v1 y v2 de quality-evidence ambos enchufados; v2 no reusa v1; README declara v1 histórico mientras quality-evidence:check lo ejecuta | ACUERDO | packages/core/package.json:680 `quality-evidence:check` → v1 cli.mjs; :681 y :683 → v2 cli.mjs (inventory, round-evidence). v2/cli.mjs importa solo módulos ./v2 (líneas 6-13); el único import de v2 fuera de su carpeta es scripts/libraries/root-public-resolver.mjs (inventory-correspondence.mjs:6), que es librería compartida, no v1; grep de ../cli|../registry|../schema|../scorer|../pairwise en v2/ → 0. README.md:8 "v1 — HISTORICAL BASELINE ONLY", :12-13 "may not be cited as coverage, quality", :24. Además el drill v1 (scripts/tooling/quality/evidence-gate.test.mjs) existe en la raíz plana y corre por `scripts/*.test.mjs`. |
| 2 | index.mjs (776, inglés) y probe/index.mjs (2729, español) son dos implementaciones independientes; nadie las invoca; ningún glob las alcanza | ACUERDO (con matiz) | Líneas exactas: wc -l → 776 y 2729. Idiomas: headers verificados (inglés "verification for BYTE-EQUIVALENT rewirings" vs español "la pata SIMBOLICA de la sonda de cascada"). Entre esos dos archivos no hay ningún import cruzado (el monolito solo importa node:fs/path/url, líneas 117-119; la raíz no importa probe/index.mjs). Sin invocador: grep repo-wide → nada en package.json/governance/manifest/ci.yml. Sin glob: análisis completo en fila L445. MATIZ que importa para borrados: la sonda raíz SÍ importa 4 módulos hermanos de probe/ (css-model, css-parse, leg1-symbolic, leg2-chromium; index.mjs:75-84), así que la carpeta probe/ NO es enteramente la segunda implementación — solo su monolito index.mjs lo es. Borrar probe/ entero rompería la sonda raíz. |
| 3 | platform.css y rottay.css byte-idénticos; 'platform' fuera del roster | ACUERDO | `cmp` → sin diferencias ("BYTE-IDENTICOS"); ambos 5342714 bytes / 126218 líneas. src/foundation/contracts/kernel/verticals/index.ts:60 `export type FirstPartyVerticalId = 'rottay' | 'bithire' | 'evnto'`; brand-themes/ contiene solo bithire/evnto/rottay; existe platform-identity-zero-gate.mjs (package.json:689). |
| 4 | de los 24 archivos de scripts/, 17 son codemods que escriben sobre packages/core/src/components/custom/, ruta inexistente | ACUERDO (con precisión) | `ls scripts | wc -l` → 24. Precisión: 16 .mjs escriben sobre esa ruta (grep -la "components/custom" scripts/*.mjs → 16); el 17.º archivo del grupo es helper-gaps-report.json, salida congelada que apunta a los mismos paths — o sea 17 archivos del grupo referencian la ruta, pero los que "escriben" son 16 scripts. `packages/core/src/components` → NO-EXISTE. |
| 5 | dos árboles test-artifacts/: raíz (1858 archivos, 203 en git) y packages/core/ (589, todos en git); ambos con release/ y rottay-design-platform/ | DESACUERDO (en el conteo de la raíz) | El conteo 1858 es falso: `find test-artifacts -type f | wc -l` → 7577 hoy (y el propio mapa del repo dice 6523 en docs/history/inventories/repository-map/2026-08/index.md:223); ni siquiera restando release/ (5737) da 1858. Lo demás es cierto: git ls-files test-artifacts → 203; packages/core/artifacts/quality → 589 find = 589 en git; la raíz tiene release/, releases/ y rottay-design-platform/ y core tiene release/ y rottay-design-platform/ (ls verificado). |
| 6 | scripts/maintain/roadmap/status/index.mjs ~3177 líneas, scripts/maintain/roadmap/commercial-status/index.mjs ~304, no comparten código | DESACUERDO (en "no comparten código") | Líneas: exactas (3177 / 304, wc -l). Pero el comercial es una COPIA declarada del principal — header línea 2 "Copied from ui-design-system scripts/roadmap-status.mjs (2026-07-07)", líneas 4-9 "Byte-identical ... EXCEPT for exactly TWO functional divergences" — y comparten 191 líneas no vacías idénticas (comm -12 sobre líneas únicas ordenadas). No comparten módulos importados en ejecución (el comercial solo importa node:fs/path/url), pero "no comparten código" como afirmación de origen/texto es falsa. |
| 7 | coverage/ y coverage-final/ en la raíz completamente vacías | ACUERDO | `find coverage coverage-final -type f` → 0 archivos; solo subdirectorios `.tmp/` vacíos en cada una; ignoradas por .gitignore:18-19. |

## Resumen

- Claims con veredicto: 30 (21 en core-fuera-de-src contando L412-413 como uno, 9 en raiz-showroom) + 7 afirmaciones fuertes = 37.
- ACUERDO: 33 (de ellos, 4 con matiz o precisión: L412, fuerte 2, fuerte 4, L60).
- DESACUERDO: 4 (L421, L20, fuerte 5, fuerte 6 — dos de ellos son la misma raíz: "no comparten código" del par roadmap-status).
- NO-VERIFICADO: 0.
- Líneas de contexto sin afirmación (leyendas/encabezados): 6.

### DESACUERDOS
1. **L421 `modern-rescue/probe/`**: la carpeta no es una "segunda implementación independiente partida en módulos" — la sonda raíz `index.mjs:75-84` importa probe/css-model, css-parse, leg1-symbolic y leg2-chromium; solo el monolito probe/index.mjs (2729 líneas, imports únicamente node builtins) es el duplicado. Borrar probe/ entero rompería la sonda raíz.
2. **L20 `scripts/maintain/roadmap/commercial-status/index.mjs`**: no "reimplementa desde cero sin compartir ni una línea" — su header declara "Copied from ui-design-system scripts/roadmap-status.mjs (2026-07-07) ... Byte-identical EXCEPT for exactly TWO functional divergences", y comparte 191 líneas idénticas; es copia divergida (el original creció a 3177).
3. **Fuerte 5 (test-artifacts)**: el árbol raíz tiene 7577 archivos hoy (el propio mapa dice 6523), no 1858; el resto de la afirmación (203 en git; 589/589 en core; subcarpetas release/ y rottay-design-platform/ en ambos) sí es cierto.
4. **Fuerte 6 (roadmap-status vs commercial)**: las líneas (3177/304) son exactas, pero "no comparten código" es falso en origen y en texto (copia declarada, 191 líneas idénticas); solo es cierto que no comparten módulos en ejecución.
