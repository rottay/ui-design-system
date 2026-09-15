# D6-2c-iii — STOP en el Paso 0. La tabla de sustitucion congelada no cierra.

Ejecutor: claude-admin (Opus). Base: `9049d79b0`, arbol limpio salvo `roadmap/STATUS.md` y
`roadmap/registry.json` (del coordinador, fuera de mi write set). **CERO ediciones, cero commits.**

Freno por la instruccion literal del brief, seccion Paso 0:
> "Re-run the census yourself on the integrated base; if ANY identifier differs from this table
> (new one appeared, one vanished), STOP and report — the substitution table is frozen and only
> the DT extends it."

Difiere. Y hay ademas dos contradicciones internas entre guardrails que no puedo resolver yo.

---

## 1. Censo re-corrido sobre la base integrada

Alcance identico al del DT: `packages/core/src` + `packages/core/scripts`, `*.ts *.tsx *.mjs`,
tests incluidos en los conteos, por identificador con `\b` (no por linea).

**Ningun identificador de la tabla desaparecio.** 30 de los 37 miden exactamente lo que dice la
tabla. Siete miden mas alto:

| identificador | tabla DT | medido | delta |
|---|---|---|---|
| BrandTheme | 624 | 686 | +62 |
| brandTheme | 349 | 407 | +58 |
| brandThemeToChromeVariables | 17 | 26 | +9 |
| brandThemeToCssVariables | 1 | 7 | +6 |
| tortureDarkBrandTheme | 22 | 28 | +6 |
| rottayBrandTheme | 66 | 69 | +3 |
| brandThemePath | 32 | 35 | +3 |

Atribucion: el delta entra en `bc1b89a31` ("test(receipts): re-anchor the retired-authority
receipts to the neutral compile (D6-2c-ii RED)"), que es uno de mis propios commits del lote RED.
En ese mismo commit `rottayBrandTheme` BAJA de 87 a 69 y `tortureDarkBrandTheme` SUBE de 13 a 28:
es exactamente el re-anclaje de receipts de rottay hacia bithire/fixtures mas la reparacion de las
fixtures torture. El censo del DT se tomo antes de integrar ese commit. No es deriva anomala.

Esto por si solo no bloquea: son conteos, no identidades. Lo que sigue si bloquea.

---

## 2. La tabla omite 22 identificadores reales

Descubrimiento exhaustivo (tokenizacion de identificadores, no grep de substring) sobre
`src scripts tests`, case-insensitive `brandtheme`: 62 nombres distintos. La tabla nombra 37.
Sobran 22 identificadores reales mas 3 artefactos de regex.

### 2a. Clase A — NO se pueden renombrar. Son pines historicos negativos.

`tests/architecture/theme-lowering-single-door/index.test.ts:33-37` declara:

```ts
/** The lowering doors C2 retired. None may survive in productive code. */
const RETIRED_DOORS = [
  "compileBrandTheme",
  "compileBrandThemeDeprecated",
  "themeToBrandTheme",
] as const;
```

| identificador | ocurrencias | por que no se renombra |
|---|---|---|
| compileBrandTheme | 25 | nombre historico del segundo compilador retirado; el gate vigila que no vuelva |
| compileBrandThemeDeprecated | 7 | idem |
| themeToBrandTheme | 5 | idem |

Renombrarlos convierte un gate vivo en un gate que vigila un nombre que nunca existio. Los
positivos plantados de ese archivo plantan ESA cadena exacta (lineas 951-1031).

Artefactos de regex, NO identificadores: `bcompileBrandTheme`, `ncompileBrandTheme`,
`bthemeToBrandTheme` (1 c/u). Salen de `\bcompileBrandTheme\b` dentro de literales del gate.

### 2b. Clase B — nombres de campo de dato, misma clase que el `brandThemePath` allowlisteado

**`brandTheme` NO es solo una variable local.** La tabla lo lista como "local variables
`brandTheme` -> `flatTheme`", 407 ocurrencias. Es ademas:

1. **Campo tipado del catalogo de control.**
   `src/contracts/theme/runtime/catalog/index.ts:128` -> `readonly brandTheme: string | null;`
   y poblado en ~21 filas del catalogo como keypath en espacio BrandTheme
   (`brandTheme: "palette.neutralTemperature"`, `"surfaces.radiusScale"`, etc.).
   CLAUDE.md: el catalogo es la autoridad unica y la DB decision schema, el documento publico de
   control y todo gate que leia `governance/manifest/controls/**` son VISTAS de el. Renombrar ese
   campo es cambio de DATO, no de tipo. Es exactamente la razon por la que `brandThemePath` quedo
   allowlisteado (Fable guardrail 3).

2. **Propiedad de `TenantConfig` aseverada por nombre** en 13+ suites
   (`expect(...).not.toHaveProperty('brandTheme')`, rosters `['brandTheme','personality',
   'tokenOverrides','appearance','engine']`) y en un archivo NO-test de scripts:
   `scripts/maintain/mount-tenant-theme/fixtures/app-bithire/trio/contracts/index.ts:162` ->
   `!Object.prototype.hasOwnProperty.call(tenantConfig, "brandTheme")`.

3. **Clave del contrato de entrada del adapter de scripts.**
   `scripts/libraries/theme-lowering/index.mjs:231` -> `const { brandTheme, tenantPatch, vertical } = input;`
   con el roster de claves pineado en
   `scripts/check/tokens/cascade/probe/runtime/ingress/tests/index.test.mjs:2957` ->
   `['brandTheme','tenantAuthoredPaths','tenantPatch','tenantSlug','vertical']`.

`staticBrandThemePath` (21) es hermano directo del allowlisteado `brandThemePath` y la tabla no
dice si entra en la excepcion. Vive en `scripts/libraries/theme-catalog/index.mjs` mas generacion
de manifest, normalizacion de cascade y probe ingress.

### 2c. Clase C — identificadores vivos, renombrables, que la tabla no nombra

| identificador | ocurrencias | casa principal |
|---|---|---|
| lowerBrandTheme | 22 | scripts/libraries/theme-lowering/index.mjs |
| brandThemeLoweringAdapter | 17 | scripts/libraries/theme-lowering/index.mjs (exportado) |
| brandThemeSource | 14 | scripts/check/tokens/cascade/channels/liveness |
| loadBrandThemeLowering | 13 | scripts/libraries/theme-lowering (leido por purity/references y cascade/slots) |
| collectBrandThemeCompilerSources | 12 | scripts/libraries/tokens/producers |
| brandThemeSources | 8 | scripts/check/tokens/cascade/channels/liveness |
| brandThemeBody | 7 | scripts/check/contracts/motion/index.test.mjs |
| brandThemeCompilerRoot | 5 | scripts/check/tokens/cascade/channels/liveness |
| brandThemeEmitter | 4 | scripts/libraries/hooks/index.mjs |
| BrandThemeFixtureInput | 3 | tests/support/theme-lowering/index.ts |
| BrandThemeFixtureCompilation | 3 | tests/support/theme-lowering/index.ts |
| brandThemeCompilerPath | 3 | scripts/check/tokens/cascade/channels/liveness/index.test.mjs |
| brandThemeEmitterPath | 2 | scripts/libraries/hooks/index.mjs |
| fixtureBrandTheme | 1 | scripts/check/tokens/cascade/probe/runtime/ingress/tests |
| brandThemes | 1 | tests/fixtures/brand-themes/themanagementmiami/index.ts |
| brandThemeRadiusScale | 1 | scripts/check/architecture/audits/integration/tests |
| brandThemeCompiler | 1 | scripts/check/tokens/cascade/channels/liveness |
| BRANDTHEME | 1 | src/.../themes/iso/index.ts:1322, prosa en docblock ("in BRANDTHEME space") |

`BRANDTHEME` es el unico de esta lista que cae dentro del grep de aceptacion (archivo `.ts` no-test
bajo `src`). Los demas son `.mjs` o `tests/`, fuera del `--include` del guardrail 4.

### 2d. Clase D — entradas de la tabla SIN sujeto vivo

Censo de declaraciones: busque `type|interface|const|function|class|let|var <id>` para los 37.

| entrada de la tabla | ocurrencias | que es realmente |
|---|---|---|
| CompileBrandTheme | 3 | **no existe como tipo.** Unico "sitio de declaracion" es el string `"export type CompileBrandTheme"` dentro de un pin NEGATIVO en `tests/integration/theme-contract-freeze/index.test.ts:975`, que asevera `expect(themes).not.toContain(...)`. Renombrarlo vuelve vacuo el pin. Los otros 2 son comentarios historicos. |
| brandThemeToBranding | 6 | **no existe.** Las 6 son comentarios de procedencia en `lowering/tests/brand-compiler.test.ts` que documentan un mapper YA BORRADO ("deleted with `brandThemeToBranding` above"). Renombrarlos falsifica la historia. |
| BrandThemes | 7 | **no existe como tipo.** Las 7 son prosa en docblocks ("the BrandThemes author palette bodies..."). |
| BrandThemeSurfaces | 1 | **no existe como tipo.** Un solo comentario en `tenant-theme/index.ts:538` que nombra `BrandThemeSurfaces.rhythm`. Ya era doc-rot antes de este lote. |
| brandThemeToCssVariables | 7 | **no existe como funcion.** 6 de las 7 son VALORES DE DATO dentro del arbol SELLADO `scripts/check/modern-rescue/**` (`emission: { owner: 'brandThemeToCssVariables', ... }` y strings de salida esperada en `cascade/extraction/index.mjs:503-504`). La 7a es un comentario. El DT conto 1. |

`brandThemePath` tampoco tiene declaracion, como se esperaba: es campo serializado. Ya allowlisteado.

---

## 3. Contradiccion entre guardrails: el guardrail 8 es insatisfacible por construccion

Lista de referencia: 1523 archivos = `dist/**` (1518) + `artifacts/generated/css/**` (5).
`contracts/**` de la raiz del paquete NO esta en la lista.

**28 de los 1523 archivos de referencia contienen `brandtheme`.** Entre ellos `dist/index.js`, que
re-exporta por nombre:

```
serializeBrandTheme, deserializeBrandTheme,
brandThemeToTenantAppearance, brandThemeToTenantAppearanceAdvanced
```

Los cuatro estan en la tabla congelada y marcados PUBLIC. Un rename correcto DEBE cambiar esos
bytes. El sha256 `f094340028...` no puede volver a dar igual. La condicion "cualquier byte distinto
= STOP" dispararia sobre un rename bien ejecutado.

La parte del guardrail que SI se sostiene, y creo que es la intencion de Codex ("a rename does not
change output"): los 9 archivos CSS de la lista (`dist/{styles,bithire,rottay,evnto}.css` +
los 5 generados) tienen sus ocurrencias **unicamente dentro de comentarios**, heredados de 12
archivos fuente `src/**/*.css` que un rename de identificadores TS no toca. El flujo de valores
CSS, el orden y los canales quedan byte-identicos.

Propuesta para que el DT decida: partir el digest en dos patas.
- **Pata CSS/canales (debe dar identica):** sha256 sobre los 9 CSS de la lista mas los manifests de
  canales. Esa es la prueba de que un rename no cambio la salida.
- **Pata dist JS/d.ts (debe diferir exactamente en los nombres):** diff normalizado aplicando la
  tabla de sustitucion al arbol pre-rename; cualquier diferencia que sobreviva a la normalizacion
  es un defecto real.

Sin esa particion no puedo ejecutar el paso 6 de verificacion.

---

## 4. Segunda contradiccion: arboles sellados

`scripts/check/modern-rescue/**` y `governance/manifest/**` son evidencia historica, nunca se
editan (orden del owner y CLAUDE.md). Llevan:

| arbol | .ts/.tsx | .mjs | .json | .md |
|---|---|---|---|---|
| scripts/check/modern-rescue | 0 | 10 | 22 | 3 |
| governance | 0 | — | 70 total | — |

El grep de aceptacion del guardrail 4 incluye solo `*.ts` y `*.tsx`, y ahi el sellado mide **0**.
O sea: el gate SI puede llegar a 0 sin violar el sello. Pero el rename queda incompleto por diseno
en 105 ocurrencias selladas, y eso debe quedar escrito, no descubierto despues.

---

## 5. Greps de colision (guardrail 7) — LIMPIOS

Los 35 nombres nuevos (`FlatTheme`, `FlatThemeMode`, `FlatThemeModes`, `FlatThemeModeOverlay`,
`FlatThemes`, `FlatThemeSurfaces`, `FlatThemeEditor`, `CompileFlatTheme`, `draftFlatTheme`,
`createTenantFlatTheme`, `liftTenantConfigToFlatTheme`, `evaluateFlatThemeContrast`,
`serializeFlatTheme`, `deserializeFlatTheme`, `cloneFlatTheme`, `normalizeFlatTheme`,
`mergeThemeFloors`, `applyHostileFlatTheme`, `flatTheme`, `flatThemeToPersonality`,
`flatThemeToTokenOverrides`, `flatThemeToChromeVariables`, `flatThemeToTenantAppearance`,
`flatThemeToTenantAppearanceAdvanced`, `flatThemeToBranding`, `flatThemeToCssVariables`,
`flatThemeRampSurface`, `flatThemeVariables`, `flatThemeLeaves`, `bithireFlatTheme`,
`rottayFlatTheme`, `evntoFlatTheme`, `themanagementmiamiFlatTheme`, `tortureDarkFlatTheme`,
`tortureLightFlatTheme`, `lowerFlatThemeFixture`) miden **0 ocurrencias** en
`src scripts tests showroom`. Cero colisiones.

`mergeThemeFloors` en particular: 0 ocurrencias, seguro.
El tipo `ThemeFloors` existe donde el brief dijo: `contracts/composition/tenants/themes/resolved/index.ts:35`
(`export interface ThemeFloors`), 10 ocurrencias, republicado por `compilers/runtime/theme/index.ts:92`.
No se acuna ningun tipo con ese nombre.

---

## 6. Verificaciones colaterales del brief que si confirme

- **Guardrail 3, retired-identity:** confirmado. `scripts/check/verticals/retired-identity/index.mjs`
  arma el detector `['theme-symbol', new RegExp(\`\\b${RETIRED}BrandTheme\\b\`, 'gi')]`, es decir
  `platformBrandTheme` por concatenacion. Nota: caza el nombre HISTORICO de la vertical `platform`
  retirada. Si se le ensena solo el nombre nuevo, deja de cazar el historico. Sugiero que vigile
  ambos; es decision del DT.
- **Guardrail 7, changeset:** `contracts/runtime/suppliers/index.json` nombra por string los 4
  exports publicos renombrados, en 8 lineas (635, 636, 687, 867 y sus duplicados 2909, 2910, 2958,
  3125). Es leido por `scripts/check/automation/bundle`, `graphics-packaging` y
  `check/boundaries/applications/hooks`. No encontre un generador con `--write` que lo reescriba:
  parece mantenido a mano y verificado por gates. Hay que actualizarlo en el lote.
- **`contracts/css/hooks/index.json`** lleva 43 ocurrencias y `index.d.ts` 1. Es el manifest
  publicado de hooks del que salen los "writers". No esta en la lista de referencia del digest,
  pero si se re-deriva despues del rename, cambia.
- **Directorio `tests/fixtures/brand-themes/`** (4 subdirectorios, 4 `index.ts`). El brief no dice
  nada sobre rutas fisicas. No lo toco.

---

## 7. Lo que necesito del DT para arrancar

1. **Extender la tabla** con los 18 identificadores de la clase C (2c), o declararlos fuera de
   alcance por escrito.
2. **Declarar clase A intocable**: `compileBrandTheme`, `compileBrandThemeDeprecated`,
   `themeToBrandTheme` se quedan verbatim, y **sacar `CompileBrandTheme` de la tabla** (su unico
   sitio es un pin negativo; renombrarlo lo vuelve vacuo).
3. **Sacar de la tabla, o reclasificar a prosa,** `BrandThemes`, `BrandThemeSurfaces`,
   `brandThemeToBranding` y `brandThemeToCssVariables`: ninguno tiene declaracion, y las 6
   ocurrencias de `brandThemeToCssVariables` estan en arbol sellado.
4. **Decidir `brandTheme`**: la tabla lo llama variable local, pero es campo tipado del catalogo de
   control (`catalog/index.ts:128` + ~21 filas), propiedad de `TenantConfig` aseverada por nombre, y
   clave del contrato de entrada del adapter de scripts. Necesito saber si se allowlistea como
   `brandThemePath` o si el rename incluye una migracion de dato con sus pines.
5. **Decidir `staticBrandThemePath`**: entra o no en la excepcion allowlisteada de `brandThemePath`.
6. **Reformular el guardrail 8** con la particion de dos patas de la seccion 3, o entregar un digest
   de referencia que excluya los 28 archivos con superficie de simbolo.
7. **Registrar el residual sellado** (105 ocurrencias) como incompletitud aceptada y escrita.

---

## Estado del arbol

```
$ git status --porcelain
 M roadmap/STATUS.md          <- coordinador, fuera de mi write set
 M roadmap/registry.json      <- coordinador, fuera de mi write set
?? node_modules
?? packages/core/node_modules

$ git log --oneline -1
9049d79b0 fix(theme): the light-scope focus ring derives from the primary seed (WO-DER-06 N1)
```

Cero commits. Cero ediciones. Ni un archivo del write set tocado.
