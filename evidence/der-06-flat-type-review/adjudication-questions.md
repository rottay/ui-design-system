# D6-2c — preguntas de adjudicación (WO-DER-06, el lote L)

Base medida: HEAD `552240919` (F6a integrado en `3aea57452`), worktree `r4-recon-opus`.
Todo lo que sigue es medición sobre el árbol o sobre una copia `git archive` prístina de HEAD;
nada fue editado por este lote (el único diff mío en el árbol es el hunk del barrel de 2a,
ver §3.2).

## 1. Las tres adjudicaciones sobre "el tipo plano"

### 1.0 El hecho que las obliga

- `BrandTheme` (`contracts/composition/tenants/themes/index.ts:240`) es una INTERFAZ PLANA con
  todas las familias opcionales. `Theme` (`themes/iso/index.ts:84`) es el Theme total con
  `motion/charts/recipes/expressive/responsive` como `Governed<T>` (`{ value, disposition }`).
  No son alias: mi §3.7 lo asumía y es falso.
- El lowering lee la forma plana: `readGovernedTheme(theme: Theme): BrandTheme` (intake)
  desenvuelve los slots gobernados y los derivers leen `bt.motion?.intensity`, etc.
- Tamaño medido (no-test, 491 líneas / 99 archivos):

  | Identificador | no-test | tests | dónde (no-test) |
  |---|---|---|---|
  | `BrandTheme` (tipo plano) | 313 | 407 | compilers/runtime 51 archivos, contracts 9, kernel 6, tokens/ts 6, customization 4, runtime 4, presets 2, `src/index.ts` 1 |
  | `BrandThemeMode` | 79 | 9 | compilers/runtime 32, contracts 28, kernel 18, tokens/ts 15, customization 9 |
  | `BrandThemeModes` / `BrandThemeModeOverlay` | 9 / 16 | 0 | contracts, compilers |
  | `FirstPartyBrandTheme` | 19 | 9 | iso, neutral-theme, los tres themes |
  | `brandThemeToTheme` | 9 | 11 | iso, brand-themes/index, neutral-theme |
  | `rottay|bithire|evntoBrandTheme` (valores) | 27 | 706 | facade, src/index, registry, brand-themes, 1 story |
  | `BrandThemeFloors|Authorship` | 4 | 0 | contracts |

- Lecturas planas de familias GOBERNADAS en compilers (lo único semántico de un retipado real):
  **67 líneas en 13 archivos** — `lowering/foundation/personality` 22, `intake` 16,
  `facade/admission/runtime/envelope` 9, `derivation/motion` 4, `derivation/axes` 4,
  `foundation/motion` 3, `foundation/floors` 3, y 1 en pipeline, responsive, motion/character,
  charts, profile-expansion/field-defaults, draft-patch. Los otros ~38 archivos de compilers usan
  `BrandTheme` sólo como anotación de parámetro sobre familias que en `Theme` tienen la misma forma.
- API pública: el TIPO `BrandTheme` (y `BrandThemeMode*`) llega a la raíz por
  `export * from './composition/tenants/themes'` (no lo gobierna `contracts/runtime/suppliers`,
  que sólo lista valores; sí lo rastrea `contract-changeset` como declaración `.#BrandTheme`,
  interfaz). Los tres VALORES `rottayBrandTheme|bithireBrandTheme|evntoBrandTheme` están
  publicados en `.`. `FirstPartyBrandTheme`, `brandThemeToTheme` y `FIRST_PARTY_THEMES` no se
  publican. Showroom: 64 líneas / 26 archivos usan el tipo (`import type { BrandTheme } from
  '@rottay/design-system'` en 2 fixtures, `useState<BrandTheme>` en theme-builder, etc.); 4 líneas
  / 2 archivos usan los valores; 0 usan `BrandThemeMode`.

### 1.1 Opción (a) — renombrar la vista plana por sustitución cerrada

Qué es: tras 2c-ii nadie AUTORA un BrandTheme; la forma plana sobrevive sólo como la vista de
lectura del lowering (intake) y el borrador del studio. Se renombra por lo que es y los tipos de
modo pierden el prefijo:
`BrandTheme` → `ThemeReadView`, `BrandThemeMode` → `ThemeMode`, `BrandThemeModes` → `ThemeModes`,
`BrandThemeModeOverlay` → `ThemeModeOverlay`, `BrandThemeFloors/Authorship` → `ThemeFloors/…`.
`FirstPartyBrandTheme` y `brandThemeToTheme` desaparecen en 2c-ii (el normalizador ISO que hoy se
llama `brandThemeToTheme` pasa a `normalizeThemeView(view: ThemeReadView): Theme`, lo usa
`presets/neutral-theme`).

Diff de ejemplo:

```diff
 // contracts/composition/tenants/themes/index.ts
-export interface BrandTheme {
+/** The lowering's read view of a Theme: every governed family unwrapped, every family optional. Not an authoring surface. */
+export interface ThemeReadView {
   id: string;
   name: string;
   appearance?: BrandAppearance;
-  modes?: BrandThemeModes;
+  modes?: ThemeModes;

 // compilers/.../lowering/foundation/intake/index.ts
-export function readGovernedTheme(theme: Theme): BrandTheme {
+export function readGovernedTheme(theme: Theme): ThemeReadView {

 // compilers/.../lowering/runtime/derivation/motion/index.ts (sin cambio de lectura)
-function deriveMotion(bt: BrandTheme, expansion: ExpressiveExpansion)
+function deriveMotion(bt: ThemeReadView, expansion: ExpressiveExpansion)

 // packages/showroom/src/components/torture-surface/fixtures/torture/index.ts
-import type { BrandTheme } from '@rottay/design-system';
+import type { ThemeReadView } from '@rottay/design-system';
```

Impacto medido: no-test 421 líneas / 99 archivos (313 + 79 + 9 + 16 + 4), tests 416 líneas
(407 + 9) en ~70 de los 118 archivos, showroom 64 líneas / 26 archivos — todo sustitución
cerrada por identificador, verificable con `tsc` y con `grep -c '\bas\b'` invariante (cero casts
nuevos). API pública: `.#BrandTheme` y `.#BrandThemeMode*` desaparecen (renombrados) — MAJOR, que
2c-ii ya fuerza por los tres valores. Cumple el gate `grep "BrandTheme" = 0` con semántica real
(no queda ninguna autoridad autorada; la forma plana se llama por su función).
Costo: elegir el nombre (`ThemeReadView` es mi propuesta; alternativas `LoweredThemeInput`,
`ThemeInputShape`).

### 1.2 Opción (b) — retipado real del lowering a `Theme`

Qué es: la vista plana desaparece; `readGovernedTheme` y `liftAuthoredTheme` se borran; cada
deriver lee el Theme gobernado.

Diff de ejemplo (uno de los 67 sitios):

```diff
 // lowering/foundation/personality/index.ts
-const motion = bt.motion;
-const springEligible = motion && typeof motion.springTension === "number" && ...
+const motion = isGovernedActive(theme.motion) ? theme.motion.value : undefined;
+const springEligible = motion !== undefined && typeof motion.springTension === "number" && ...
```

Impacto medido: 67 líneas semánticas en 13 archivos (lecturas de familias gobernadas) + ~38
archivos de compilers con cambio de anotación (`?.` sobre familias ahora requeridas sigue
compilando) + brand-studio/tenant-preview/file-export (5 archivos, 101 menciones: el borrador
del studio pasa a `Theme` o a documento v2, que es lo que la WO pide de todos modos) + `tests/support/theme-lowering`
(`lowerBrandThemeFixture` recibe `Theme`; 60 archivos de tests) + fixtures (4) a Theme neutro +
patch. API pública: el tipo desaparece sin sustituto plano — MAJOR; showroom 26 archivos
reescritos (sus fixtures pasan a Theme + patch). Riesgo alto de `as` en los 67 sitios y en el
studio; no es sustitución cerrada. Es un lote propio, no parte de 2c.

### 1.3 Opción (c) — enmendar el gate y conservar el nombre

Qué es: el acceptance gate cuenta sólo la AUTORIDAD autorada
(`FirstPartyBrandTheme|brandThemeToTheme|(rottay|bithire|evnto)BrandTheme|FIRST_PARTY_THEMES|brand-themes`)
y `BrandTheme` queda como la vista plana con su doc reescrita.

```diff
-- **Acceptance gate** — `grep -rn "BrandTheme" src … | grep -v tests | wc -l` = 0;
+- **Acceptance gate** — `grep -rnE "FirstPartyBrandTheme|brandThemeToTheme|(rottay|bithire|evnto)BrandTheme|FIRST_PARTY_THEMES|brand-themes" src scripts packages/showroom … | grep -v tests | wc -l` = 0;
```

Impacto: 0 líneas de código; API pública del tipo intacta; hay que reescribir la cláusula de
CLAUDE.md ("BrandTheme may survive only as a deprecated compatibility alias of the complete
Theme", que hoy tampoco es cierta) y la doc de la interfaz. Costo: el nombre sigue diciendo
"Brand" cuando F-11 cierra diciendo que BrandTheme se borró.

### 1.4 Recomendación

**(a)**, por tres razones medidas: es sustitución cerrada verificable (tsc, cero casts, 421 + 416
+ 64 líneas), satisface el gate tal como está escrito con un cambio de semántica real (la forma
plana deja de llamarse por una autoridad que ya no existe), y su cambio de API cabe dentro del
MAJOR que 2c-ii ya fuerza. (b) queda como lote propio posterior con write set exacto (los 13
archivos / 67 líneas de §1.0 + studio + fixtures), si el DT quiere que el lowering lea el Theme
gobernado sin intake. (c) sólo si el DT prefiere no tocar el nombre: entonces cambia la WO, no el
código.

## 2. Sub-lotes 2c-i / 2c-ii / 2c-iii

Precondición común (ver §3.2): integrar el hunk del barrel de 2a antes de cualquiera.

### 2c-i — el pipeline compila desde el neutro (sin borrar nada)

- Write set: `compilers/runtime/tenant-css/artifact-renderer` (`renderFirstPartyArtifact`
  compila con `baselineSource: "neutral-preset"`; `authoredThemePath` pasa a nombrar el preset),
  `scripts/build/verticals/{bundle-build,css-build,compiler-bootstrap}` (theme por slug → compile
  neutro; spring: ver adjudicación), `scripts/libraries/roster` (la proyección deja de leer
  `springTension` del theme), `foundation/tokens/css/facade/artifacts/**` +
  `artifacts/generated/css/**` + `artifact-runtime` (regenerados por el pipeline), y los tests y
  baselines que pinean bytes o canales de los artifacts, re-pineados con provenance en el MISMO
  commit: `first-party-artifacts-{generated,parity}`, `tenant-theme-artifact-stability`,
  `canonical-digest-identity`, `tenant-divergence-matrix`, `provenance-acceptance`,
  `hostile-leaf-sweep`, `artifact-oracle`, `mount/tests`, `semantic-typography` (digests leg-A),
  `artifact-coverage/baseline`, `theme-parity/baseline`, `read-without-producer/baseline`,
  `engine/tokens/audit/baseline` si mueve, `decisions-lit` por vía oficial.
- Adjudicación interna (spring): `--ds-motion-spring` y `--ds-motion-spring-gentle` +
  `personality.spring` se derivan hoy de `springTension/springFriction` AUTORADOS; `motion.dial`
  decide `intensity/durationScale/ambient` y `motion.character` no declara spring. Opciones:
  (s1) el neutro + preset no emite spring y el cubic-bezier base de `foundation/animations` queda
  (medido: los tres presets no lo pueden producir); (s2) nueva derivación `motion.dial +
  motion.character → (tension, friction)` como enmienda del kit (D-27) en el carril de derivación,
  antes de 2c-i; (s3) mantener el spring autorado hasta 2c-ii leyendo el theme sólo para ese
  canal. Recomiendo (s1) en 2c-i con el censo publicado y (s2) como WO del carril.
- Depende de: hunk del barrel; F6a integrado (sí); `pnpm build` serializado por el coordinador
  (css-build y css-freshness leen `dist/`; decisions-lit lee `dist/server.js` + Playwright).
- Aceptación ejecutable: `lint:artifacts` exit 0 y `css-freshness` 5/5 sobre el dist fresco;
  `artifact-coverage` exit 0 con los pins subidos y provenance; las siete paridades verdes con
  provenance; `decisions-lit check` OK; publicado en el commit: intersección de nombres entre los
  tres artifacts regenerados (medida hoy sobre compiles: 91 % vs 65 % con BrandTheme; per artifact
  100/91/100), proxy de root reach `var(--ds-…)` (88/83/88 % vs 64/73/80 %; el instrumento oficial
  `ds:derive --check` de WO-EVI-01 no existe en el árbol) y el contraste evnto dark
  (`--ds-color-primary-600` ausente; fallback CSS 1.06:1, ruteado a derivación mode-aware).

### 2c-ii — retiro de la autoridad autorada

- Write set: `rm -r foundation/tokens/ts/presentation/brand-themes/**` (7 archivos, 23.774
  líneas); iso (`FirstPartyBrandTheme`, `FIRST_PARTY_BRAND_THEME_REQUIRED_KEYS`,
  `brandThemeToTheme` → normalizador con nombre no-Brand que `presets/neutral-theme` sigue usando);
  `runtime/resolution` (`baselineFor(vertical, slug)` = neutro + preset; `THEME_BASELINE_SOURCES`
  colapsa a uno o se retira con `facade/foundation/baseline`); `ingress/foundation/provenance`
  (`carriedFrom` por defecto = baseline neutro); `runtime/tenant/foundation/configuration/registry`
  (`projectGovernedBehavior` lee motion/expressive/canales decididos del theme: el
  `FirstPartyArtifactRuntimeBlock` hoy sólo carga `recipeProfile` → ampliarlo en el generador con
  esos datos del compile neutro, o derivarlos del preset); `foundation/tokens/ts/facade`
  (`tokens.brandThemes` y el `export *`); `src/index.ts` (los tres valores: changeset MAJOR con
  `contract-diff` `export .#rottayBrandTheme — removed`, ×3); `foundation/presets/verticals`
  (`VERTICAL_REGISTRY` pierde `personality`/`tokenOverrides`) y sus 3 lectores
  (`theming/composition/react/tokens:186,234`, `personality/runtime/resolution/chart:48`,
  `bootstrap/facade/react/provider:915` vía `getVerticalPreset`); `presets/policy/experience-baselines/evnto`
  (`satisfies BrandTheme[...]`); `tests/fixtures/brand-themes/**` (4 fixtures, 1.465 líneas → Theme
  neutro + patch con helper en `tests/support/theme-lowering`); los 62 archivos de tests que
  importan los valores (706 líneas → `baselineFor(v, v)` o el helper); showroom 2 archivos con
  valores (`torture-sections/tenant-branding`, fixtures) — los 26 con el TIPO siguen a 2c-iii;
  scripts que nombran el path (16): `css-build`/`compiler-bootstrap` (módulo `brandThemes`),
  `libraries/roster` (proyección), `generate/tokens/manifest/mirror-parity` (`SOURCE_DIR`),
  `folder-naming` (regla 4c `brand-themes-missing` y `requiredOwners`), `theme/keypath-coverage`
  (`THEME_SOURCES` → los tres documentos de preset), `tokens/cascade/roots/membership`,
  `tokens/contracts/spacing-rhythm` (`BRAND_THEME_SOURCE`), `purity/references`, `purity/color-mix`,
  `cascade/slots` (themes desde dist), `theme-parity/baseline` (nota), `verticals/retired-identity`
  (regex de rutas), `package/artifacts/inventory/baseline` (rutas dist), `contracts/motion/registry`,
  `boundaries/public-api/ceilings` (prosa) — cada baseline re-pineado con provenance.
- Depende de: 2c-i integrado (los artifacts ya nacen del neutro, así el `rm` no mueve un byte
  de artifact); la adjudicación §1 sólo para el TIPO en showroom (2c-ii puede dejar el tipo
  plano vivo hasta 2c-iii).
- Aceptación ejecutable: `grep -rnE "FirstPartyBrandTheme|brandThemeToTheme|(rottay|bithire|evnto)BrandTheme|FIRST_PARTY_THEMES|brand-themes" packages/core/src packages/core/scripts packages/showroom/src | grep -v tests | wc -l` = 0;
  `lint:artifacts` exit 0 con artifacts BYTE-IDÉNTICOS a los de 2c-i (prueba de que el borrado no
  movió paint); `gates:ci` pre-build verde o cada rojo con dueño; showroom `build` verde;
  `contract-changeset --base=main` OK con el changeset MAJOR; suite completa por el coordinador.

### 2c-iii — el tipo plano (según §1)

- (a) rename: write set = 99 archivos prod + ~70 tests + 26 showroom + doc de la interfaz +
  cláusula de CLAUDE.md; aceptación: `grep -rn "BrandTheme" src --include=*.ts --include=*.tsx |
  grep -v tests | wc -l` = 0, `tsc` 0, `grep -c '\bas\b'` por archivo sin subir,
  `theme-lowering-single-door` y `no-vertical-branch` verdes, changeset rows
  `export .#BrandTheme — renamed …`.
- (b) retipado: write set = 13 archivos / 67 líneas semánticas + 38 anotaciones + studio 5 +
  `tests/support/theme-lowering` + 60 tests + 4 fixtures; misma aceptación más lecturas
  gobernadas por `isGovernedActive`.
- (c) enmienda: write set = `roadmap/derivation.md` (DT), CLAUDE.md, doc de la interfaz;
  aceptación = el nuevo grep = 0 (ya lo cumple 2c-ii).
- Depende de: 2c-ii. Orden: hunk del barrel → 2c-i → 2c-ii → 2c-iii(a).

## 3. Estado medido actualizado

### 3.1 Refs `BrandTheme` no-test tras 2a/2b

491 líneas en 99 archivos (era 492/97 en la propuesta): 313 tipo plano, 79 + 9 + 16 tipos de
modo, 19 `FirstPartyBrandTheme`, 9 `brandThemeToTheme`, 27 valores, 4 floors/authorship. Tests:
1.449 líneas en 118 archivos (60 vía `lowerBrandThemeFixture`, 62 importan los valores).

### 3.2 Los 3 errores de `tsc -p tsconfig.tests.json` en copia prístina de HEAD `552240919`

```
src/foundation/presets/neutral-theme/tests/index.test.ts(53,54): error TS2554: Expected 2 arguments, but got 3.
src/foundation/presets/neutral-theme/tests/index.test.ts(60,44): error TS2554: Expected 2 arguments, but got 3.
src/infrastructure/compilers/runtime/theme/runtime/ingress/tests/neutral-baseline-draft.test.ts(17,52): error TS2554: Expected 2 arguments, but got 3.
```

Qué son: los tres llaman `baselineFor(vertical, slug, "neutral-preset")` importado de
`@/infrastructure/compilers/runtime/theme`. En HEAD ese barrel sigue en
`export { baselineFor } from "./runtime/resolution"` (la versión de 2 argumentos); el commit de 2a
(`1390ebb82`) integró `facade/foundation/baseline` y `presets/neutral-theme` pero omitió el hunk
del barrel (`+export { THEME_BASELINE_SOURCES, baselineFor } from "./facade/foundation/baseline"`,
`+export type { ThemeBaselineSource } …`, `+export type { ResolveThemeOptions } …`), mientras
`7ad76ca2b` republicó el contrato de suppliers CON `THEME_BASELINE_SOURCES` en la raíz. Ese hunk
(+3/−1) está en mi árbol sin commitear. Consecuencia en HEAD prístino además de los 3 errores:
4 tests rojos (3 de `presets/neutral-theme`, 1 de `neutral-baseline-draft`).

### 3.3 Gates rojos en HEAD prístino, con dueño

| Gate | Medida en HEAD | Dueño |
|---|---|---|
| `lint:artifacts` (`bundle-build --check`) | ✗ los tres artifacts: `committed --ds-card-body-padding` vs `generated --ds-card-body-font-size-sm` | F6a (`3aea57452`) se integró sin regenerar; el árbol carga una regeneración ajena sin commit que sigue out of sync |
| `css-freshness` | 1/5 (los 4 bundles "in sync") | dist stale: build serializado por el coordinador |
| `artifact-coverage` | 2 pins superados: evnto 9808 > 7932, rottay 9818 > 8013 ("it improved; raise the pin") | regeneración `9a6aed854` (olas F5/F6) sin re-pin |
| `typecheck:tests` | 3 errores (§3.2) | integración de 2a |

Residuo ajeno en el árbol además de los artifacts: `read-without-producer/baseline`,
`tests/integration/theme-contract-freeze`.
