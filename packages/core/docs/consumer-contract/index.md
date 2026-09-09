# Contrato de consumo para las apps (base productiva)

Estado: ejecutable desde WO-CON-01 (2026-09-05). Censo medido sobre el árbol de
trabajo en `5bfae6097` (`packages/core/package.json` v2.19.36, 121 subpaths
publicados); `./surfaces/oauth-transition` salió del paquete con WO-CAN-04
(F-18), de modo que la superficie vigente son 120. Este documento es la **única fuente** de la tabla de disposiciones:
la regla de lint `@rottay/no-unsanctioned-ds-subpath` la ejecuta y un test la
compara byte a byte contra el espejo de código.

Propósito: que las apps se construyan **desde hoy** contra un contrato que no
cambia mientras el DS se termina por detrás. Todo lo que no está en este
contrato puede desaparecer (D-07) sin aviso a las apps.

## 0. Cómo se ejecuta este documento

| Pieza | Ruta | Responsabilidad |
| --- | --- | --- |
| Fuente | `packages/core/docs/consumer-contract/index.md` §1.2 y §1.3 | las dos tablas cercadas son la autoridad de disposición |
| Espejo | `packages/core/src/entrypoints/eslint/rules/no-unsanctioned-ds-subpath/contract/index.ts` | copia derivada que la regla importa (sin `node:fs`, funciona publicada) |
| Lector | `.../no-unsanctioned-ds-subpath/contract/parse/index.ts` | parser puro markdown → filas |
| Regla | `.../no-unsanctioned-ds-subpath/index.ts`, publicada como `@rottay/design-system/eslint` → `@rottay/no-unsanctioned-ds-subpath` | falla en todo lo que no está `guaranteed` |
| Anti-deriva | `.../no-unsanctioned-ds-subpath/tests/index.test.ts` | reparsea este archivo, exige igualdad exacta con el espejo, exige 120/120 contra `package.json` `exports` (mismo conjunto y mismo orden) |

La regla es **fail-closed**: un especificador `@rottay/design-system…` que no
aparezca como `guaranteed` en §1.2 se reporta, incluso si no está en ninguna
tabla (disposición `unknown`). Añadir un `exports` nuevo sin añadir su fila
pone el test en rojo; quitar un `exports` sin quitar su fila también.

### Disposiciones

| Disposición | Significado | Efecto de la regla |
| --- | --- | --- |
| `guaranteed` | publicado y sancionado; no se retira sin changeset 3.0 y codemod | pasa |
| `retire-by` | publicado, **no** sancionado; la WO nombrada adjudica su retiro | falla, nombrando la WO |
| `forbidden` | no publicado en `exports`; nunca sancionado; **sin acción del DS** | falla, remitiendo a la app consumidora |

Regla de admisión (WO-CON-01 «Do NOT»): un subpath solo entra en `guaranteed`
con un consumidor medido en el alcance vigente (app-bithire) o porque el layout
o la configuración de la app lo exigen estructuralmente (`./styles.css`,
`./fonts/*.css`, `./eslint`). Un consumidor solo en el showroom **no** basta:
el showroom es parte del propio paquete y sus sondas no son consumo de producto
(mismo criterio que ya aplicaba el borrador a `./spatial` y a
`./tenant-theme-canary-fixtures`).

## 1. Superficie de importación sancionada (120/120)

Censo: `app-bithire` y `packages/showroom` (alcance del owner, 2026-09-05).
Se cuentan especificadores de módulo reales (`from`, `import`, `import()`,
`require()`, `@import` de CSS), no menciones en prosa ni en comentarios.
Los números son una **fotografía fechada 2026-09-05**, no una promesa; la
disposición es la parte normativa y es la que no puede derivar.

### 1.1 Resumen

| Métrica | Valor |
| --- | --- |
| Subpaths publicados | 120 |
| `guaranteed` | 17 |
| `retire-by WO-RET-01` | 96 |
| `retire-by WO-CAN-03` | 7 |
| Subpaths publicados con 0 consumidores en alcance (bithire + showroom) | 96 |
| Importaciones a superficie garantizada | bithire 2086 · showroom 325 |
| Importaciones a superficie no garantizada (línea base, decrece) | bithire 16 · showroom 14 |

### 1.2 Tabla ejecutable: los 120 subpaths publicados

<!-- consumer-contract:published:start -->
| Subpath | Disposition | Retire-by | app-bithire | showroom |
| --- | --- | --- | --- | --- |
| `.` | guaranteed | — | 1179 | 259 |
| `./server` | guaranteed | — | 9 | 10 |
| `./contracts/foundation` | retire-by | WO-RET-01 | 0 | 0 |
| `./contracts/patterns` | retire-by | WO-RET-01 | 0 | 0 |
| `./contracts/i18n` | retire-by | WO-RET-01 | 0 | 0 |
| `./contracts/runtime` | retire-by | WO-RET-01 | 0 | 0 |
| `./contracts/primitives` | retire-by | WO-RET-01 | 0 | 0 |
| `./contracts/structures` | retire-by | WO-RET-01 | 0 | 0 |
| `./contracts/surfaces` | retire-by | WO-RET-01 | 0 | 0 |
| `./runtime/i18n` | retire-by | WO-RET-01 | 0 | 0 |
| `./runtime/motion` | retire-by | WO-RET-01 | 0 | 0 |
| `./runtime/navigation` | retire-by | WO-RET-01 | 0 | 0 |
| `./runtime/forms` | retire-by | WO-RET-01 | 0 | 0 |
| `./runtime/cross-tab-sync` | retire-by | WO-RET-01 | 0 | 0 |
| `./runtime/provider` | retire-by | WO-RET-01 | 0 | 0 |
| `./runtime/root-attributes` | retire-by | WO-RET-01 | 0 | 1 |
| `./runtime/responsive` | retire-by | WO-RET-01 | 0 | 0 |
| `./runtime/tenant` | retire-by | WO-RET-01 | 0 | 0 |
| `./runtime/visual-authority` | retire-by | WO-RET-01 | 0 | 1 |
| `./runtime/tenant-theme` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/button` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/checkbox` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/date-picker` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/input` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/input-number` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/radio` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/select` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/slider` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/switch` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/textarea` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/toggle` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/breadcrumb` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/float-button` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/segmented` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/steps` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/tabs` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/box` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/divider` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/flex` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/grid` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/responsive` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/stack` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/avatar` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/badge` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/card` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/empty` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/image` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/table` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/tag` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/tooltip` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/typography` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/alert` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/message` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/modal` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/progress` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/skeleton` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/spinner` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/toast` | retire-by | WO-RET-01 | 0 | 0 |
| `./primitives/dropdown` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/presence` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/data-table` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/list-toolbar` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/record-facts` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/stats-grid` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/widget-board` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/adaptive-overlay` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/empty-state` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/command-palette` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/shortcuts-overlay` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/feature-workspace-frame` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/kanban-board` | retire-by | WO-RET-01 | 0 | 0 |
| `./patterns/charts` | retire-by | WO-RET-01 | 0 | 0 |
| `./structures/dashboard-header` | retire-by | WO-RET-01 | 0 | 0 |
| `./structures/record-summary` | retire-by | WO-RET-01 | 0 | 0 |
| `./structures/app-shell` | retire-by | WO-RET-01 | 0 | 0 |
| `./structures/action-dock` | retire-by | WO-RET-01 | 0 | 0 |
| `./structures/column-menu` | retire-by | WO-RET-01 | 0 | 0 |
| `./surfaces/collection-workspace` | retire-by | WO-RET-01 | 0 | 0 |
| `./public-entrypoints-manifest` | retire-by | WO-RET-01 | 0 | 0 |
| `./icons` | guaranteed | — | 864 | 53 |
| `./icons/full` | retire-by | WO-RET-01 | 0 | 0 |
| `./icons/presets/bithire` | retire-by | WO-RET-01 | 11 | 0 |
| `./icons/roles/*` | retire-by | WO-RET-01 | 0 | 0 |
| `./icons/corpus` | retire-by | WO-RET-01 | 0 | 0 |
| `./icons/foundation` | retire-by | WO-RET-01 | 0 | 3 |
| `./icons/bithire` | retire-by | WO-RET-01 | 0 | 0 |
| `./icons/identity` | retire-by | WO-RET-01 | 0 | 1 |
| `./icons/intelligence` | retire-by | WO-RET-01 | 0 | 1 |
| `./icons/operations` | retire-by | WO-RET-01 | 0 | 1 |
| `./marks` | guaranteed | — | 12 | 1 |
| `./marks/brand` | retire-by | WO-RET-01 | 0 | 0 |
| `./marks/cloud` | retire-by | WO-RET-01 | 0 | 0 |
| `./pictograms` | retire-by | WO-RET-01 | 0 | 1 |
| `./charts` | guaranteed | — | 8 | 0 |
| `./charts/spec` | guaranteed | — | 2 | 0 |
| `./charts/access` | guaranteed | — | 2 | 0 |
| `./charts/renderers` | guaranteed | — | 5 | 0 |
| `./motion` | guaranteed | — | 4 | 0 |
| `./effects` | retire-by | WO-RET-01 | 0 | 0 |
| `./spatial` | retire-by | WO-RET-01 | 0 | 2 |
| `./spatial/spec` | retire-by | WO-RET-01 | 0 | 0 |
| `./styles` | retire-by | WO-CAN-03 | 0 | 0 |
| `./styles.css` | guaranteed | — | 0 | 1 |
| `./styles/default` | retire-by | WO-CAN-03 | 0 | 0 |
| `./styles/bithire` | retire-by | WO-CAN-03 | 2 | 0 |
| `./styles/evnto` | retire-by | WO-CAN-03 | 0 | 0 |
| `./styles/rottay` | retire-by | WO-CAN-03 | 0 | 0 |
| `./styles/modern` | retire-by | WO-CAN-03 | 0 | 0 |
| `./eslint` | guaranteed | — | 1 | 0 |
| `./supplier-contract` | retire-by | WO-RET-01 | 0 | 0 |
| `./hooks-manifest` | retire-by | WO-RET-01 | 1 | 0 |
| `./supplier-honesty-cli` | retire-by | WO-RET-01 | 0 | 0 |
| `./fonts/editorial-display.css` | guaranteed | — | 0 | 1 |
| `./fonts/editorial-text.css` | guaranteed | — | 0 | 0 |
| `./fonts/grotesk-display.css` | guaranteed | — | 0 | 0 |
| `./fonts/humanist-text.css` | guaranteed | — | 0 | 0 |
| `./fonts/geometric-display.css` | guaranteed | — | 0 | 0 |
| `./fonts/plex-mono.css` | guaranteed | — | 0 | 0 |
| `./dist/*.css` | retire-by | WO-CAN-03 | 0 | 0 |
| `./tenant-theme-canary-fixtures` | retire-by | WO-RET-01 | 2 | 3 |
<!-- consumer-contract:published:end -->

### 1.3 Tabla ejecutable: subpaths no publicados observados en las apps

<!-- consumer-contract:unpublished:start -->
| Subpath | Disposition | Retire-by | app-bithire | showroom |
| --- | --- | --- | --- | --- |
| `./commercial` | forbidden | — | 0 | 0 |
| `./commercial.css` | forbidden | — | 0 | 0 |
| `./surfaces` | forbidden | — | 0 | 0 |
<!-- consumer-contract:unpublished:end -->

Las columnas `app-bithire` / `showroom` valen 0 en §1.3: estos especificadores
solo aparecen en `app-platform`, fuera de alcance (§1.6).

### 1.4 Línea base por app (regla ejecutada, 2026-09-05)

La regla `@rottay/no-unsanctioned-ds-subpath` corrida con severidad `error`
sobre cada árbol (ESLint 9.39.4 flat config, `@typescript-eslint/parser`
8.61.0, extensiones `.ts .tsx .js .jsx .mjs .cjs`; ESLint no analiza CSS, así
que los `@import` de hoja de estilo quedan fuera de esta cuenta y se ven en
§1.2):

| App | Archivos analizados | Hallazgos | Archivos con hallazgo | Desglose |
| --- | --- | --- | --- | --- |
| `app-bithire` | 1297 | **14** | 14 | `./icons/presets/bithire` 11 · `./tenant-theme-canary-fixtures` 2 · `./hooks-manifest` 1 |
| `packages/showroom` | 212 | **14** | 10 | `./icons/foundation` 3 · `./tenant-theme-canary-fixtures` 3 · `./spatial` 2 · `./icons/{identity,intelligence,operations}` 1+1+1 · `./pictograms` 1 · `./runtime/root-attributes` 1 · `./runtime/visual-authority` 1 |

Reparto por área en `app-bithire`: 11 en `src/**`, 3 en `tests/**`. En el
showroom: 13 en `src/**`, 1 en `scripts/**`.

Ambas cifras son **decrece-only**: la línea base solo puede bajar. El
mecanismo de adopción sin romper la build es la opción `allowSubpaths` de la
regla (lista explícita de subpaths tolerados en esa app, que se vacía a medida
que la app migra); `exempt` acepta globs de archivo con la misma gramática que
las demás reglas de gobernanza del paquete.

Ninguno de los 14 hallazgos de `app-bithire` está en `.` ni en `./icons`: el
**99,2 %** de sus 2102 especificadores medidos ya cae en la superficie
garantizada (2086 de 2102). El trabajo de migración de la app es pequeño y
está acotado a tres subpaths.

Estado de ejecución por árbol (medido 2026-09-05):

- **`packages/showroom`: ejecuta la regla.**
  `packages/showroom/eslint.config.mjs` monta `@rottay/no-unsanctioned-ds-subpath`
  en `error` con los nueve subpaths medidos como línea base
  (`allowSubpaths`), y **solo** esa regla: no monta `configs.recommended`, cuyas
  reglas de HTML crudo y color añadirían rojos nuevos al árbol de marketing del
  showroom. Con esa línea base el showroom da **0** hallazgos de contrato; sin
  ella da 14. El array es decrece-only y está fijado por un test
  (`rules/no-unsanctioned-ds-subpath/tests/index.test.ts`): cada entrada debe ser
  una fila **no** garantizada con conteo de showroom mayor que 0 en §1.2, y no
  puede haber más de nueve.

- **`app-bithire`: todavía no ejecuta la regla, y no puede hacerlo hoy.**
  La app fija `@rottay/design-system` **2.19.37** (`app-bithire/package.json`,
  `pnpm-lock.yaml` y el tarball del registro instalado en `node_modules`; el pin
  `2.19.35` es el de app-platform, no el de bithire). Ese tarball publicado tiene
  **45** claves de `exports`, su `dist/eslint.js` **no** contiene esta regla
  (0 coincidencias de `no-unsanctioned`), y **sigue exportando** `./commercial`,
  `./commercial.css` y `./styles/platform`. Es decir: la superficie publicada que
  bithire consume hoy no es la de §1.2 — §1.2 y §1.5 describen el árbol de
  trabajo (v2.19.36, 121 subpaths menos el retirado por WO-CAN-04 = 120), no el registro.

  `app-bithire/eslint.config.mjs` ya extiende `designSystemConfigs.recommended`,
  así que heredará la regla con la **primera versión publicada desde un árbol que
  la contenga**. En esa subida, `eslint src/ --max-warnings 0` dará **11 errores
  en `src/**`** (10 de `./icons/presets/bithire` + 1 de
  `./tenant-theme-canary-fixtures`; los otros 3 de los 14 están en `tests/**`),
  salvo que la app monte la línea base temporal de tres entradas
  `allowSubpaths: ['./icons/presets/bithire', './tenant-theme-canary-fixtures', './hooks-manifest']`,
  que lleva ambas áreas a **0**. Esa línea base es transitoria y decrece-only: la
  vacía la migración de WO-CON-04, ejecutada en el repo de la app por sus dueños.
  No se toca ningún repo de app desde el DS.

### 1.5 `commercial` / `commercial.css`: prohibido, sin acción del DS

El borrador registraba «NO VERIFICADO cómo resuelve hoy». Verificado
(2026-09-05):

1. `packages/core/package.json` v2.19.36 **no** exporta `./commercial` ni
   `./commercial.css` (ni `./styles/platform`). La copia publicada que
   `app-platform` tiene instalada, v2.19.35, sí exportaba los tres.
2. `app-platform/next.config.ts:53,60` además hace *alias* de webpack de
   `@rottay/design-system/commercial` → `<DS>/dist/commercial.js` y de
   `@rottay/design-system/commercial.css` → `<DS>/dist/commercial.css`,
   saltándose el mapa `exports`.
3. Ninguno de esos dos artefactos existe hoy en `packages/core/dist/`
   (86 archivos, sin `commercial.js` ni `commercial.css`), igual que
   `dist/platform.css`, al que apuntan `./styles/platform` y
   `./dist/platform.css`.

Disposición: `forbidden`, **sin acción del DS** (alcance del owner 2026-09-05:
`app-platform` y el programa comercial quedan fuera; D-13 lo mantiene pausado).
`app-platform` lo resuelve de su lado cuando entre en alcance. La regla lo
reporta si alguna vez aparece en una app en alcance.

### 1.6 Prosa obsoleta corregida en esta revisión

El borrador (`audit/70-plan/roadmap-draft/consumer-contract.md`) describe un
censo de **tres apps** que ya no corresponde al alcance ni a las cifras. Se
corrige aquí; el borrador queda como evidencia histórica y no se edita.

| Afirmación del borrador | Medición 2026-09-05 |
| --- | --- |
| censo «sobre app-bithire, app-evnto, app-platform y showroom», sin columna de showroom | alcance vigente = `app-bithire` + `packages/showroom`; `app-evnto` y `app-platform` son observación fuera de alcance (§1.7) |
| root `1.155 / 383 / 444` | 1179 / 383 / 453 |
| `icons` `860 / 99 / 171` | 864 / 99 / 171 |
| `marks` `10 / 0 / 0` | 12 / 0 / 0 (+1 en showroom) |
| `charts` (+`renderers`,`spec`,`access`) `15 / 0 / 0` | 17 / 0 / 0 |
| `motion` `3 / 0 / 0` | 4 / 0 / 1 |
| `server` `5 / 4 / 6` | 9 / 4 / 12 (+10 en showroom) |
| «`./icons/presets/bithire`, `./icons/bithire` (10 imports en bithire)» | `./icons/presets/bithire` 11; `./icons/bithire` 0 |
| «`./tenant-theme-canary-fixtures` (1 import en bithire, 2 en showroom)» | 2 en bithire, 3 en showroom |
| «`./primitives/*`, `./patterns/*`, `./structures/*`, `./surfaces/*` (69 subpaths por componente)» | 59 subpaths (39 + 13 + 5 + 2) |
| «`./commercial` / `commercial.css` (53 imports en app-platform)» | 53 + 3 = 56, y ninguno resuelve hoy (§1.5) |
| «`./effects`, `./spatial`, `./spatial/spec` sin consumidor productivo» | correcto para producto; el showroom tiene 2 sondas en `./spatial` |
| §7 «Alcance: solo app-bithire importa ahora» | los cuatro árboles importan hoy; lo que decide el owner es el **alcance de trabajo**, no que los otros no importen |

### 1.7 Observación fuera de alcance (no normativa, no la lee ninguna regla)

Medición de los dos árboles que el owner excluyó de este programa. Se registra
para que nadie la vuelva a medir ni la confunda con la línea base:

| Subpath | app-evnto | app-platform |
| --- | --- | --- |
| `.` | 383 | 453 |
| `./icons` | 99 | 171 |
| `./server` | 4 | 12 |
| `./eslint` | 1 | 0 |
| `./styles/evnto` | 1 | 0 |
| `./motion` | 0 | 1 |
| `./commercial` | 0 | 53 |
| `./commercial.css` | 0 | 3 |
| `./dist/platform.css` | 0 | 1 |
| `./surfaces` (no publicado) | 0 | 1 |

## 2. API de tema contra la que programar desde hoy

Servidor (layout raíz de cada app):

```ts
import { mountTenantTheme, staticThemeIntent, documentThemeIntent } from "@rottay/design-system/server";
// vertical fijo (identidad estática, D-28): sin patch
const mounted = await mountTenantTheme(staticThemeIntent("bithire"));
// tenant con documento en DB (v2, §3): el intent nombra al tenant y la app pasa
// el artifact que ya compiló. Es obligatorio para el origen `tenant-document`:
// un ThemeIntent no lleva el tenantId/rowVersion sobre los que se calcula el
// digest, y el cliente admite el montaje contra ese digest. WO-EMI-02 sigue
// aceptando el artifact y lo verifica contra su propio compile.
const mounted = await mountTenantTheme(
  documentThemeIntent({ vertical: "bithire", slug, document }),
  { artifact },
);
// mounted = { rootAttributes, styleElements, artifactDigest, hydrationProof }
```

Cliente: `DesignSystemProvider` con la declaración TIPADA `visualAuthority={{ authority: "compiled-artifact", artifact }}` y nada más (sin `brandTheme`, `tokenOverrides`, `personality`, `appearance`, `engine`). La declaración es evidencia, no un interruptor: la forma de cadena `visualAuthority="compiled-artifact"` está **rechazada** — el proveedor la resuelve como `invalid-declaration` y bloquea, porque una cadena no lleva ni la cobertura que hay que suprimir ni los bytes que hay que verificar. El `artifact` es el mismo que devolvió el servidor; sin DOM montado la declaración lleva además el `ssrReceipt`. Preview en app-platform: componente `TenantPreview` del DS (WO-EMI-01) alimentado con `previewThemeIntent`; nunca `compileTenantTheme` ni reescritura textual de CSS en la app.

Nombres que las apps usan hoy y que quedan **prohibidos** en código nuevo: `compileTenantTheme`, `compileTheme`, `resolveTheme`, `liftAuthoredTheme`, `THEME_ENGINE_ADAPTERS`, `BrandTheme`, `TenantAppearance*`, `tokenOverrides`, `getTenantBranding()` con campos visuales fuera de `companyName/logo/logoMark/favicon/locale`. `mountTenantTheme` está publicado (WO-CON-02). Hasta que cada app ejecute su paquete de migración (WO-CON-04), mantiene sus tres archivos actuales (`runtime-tenant-theme/{ssr,contracts,artifact-resolution}`) sin ampliarlos; el codemod de WO-CON-02 los reemplaza por la llamada única.

## 3. Documento de tenant v2 (lo que escribe app-platform)

```ts
type TenantThemeDocument = {
  version: 2;
  plan: "standard" | "pro" | "internal";
  decisions: Partial<ThemeDecisions>;      // solo ids del catálogo aprobado (kit D-27), dominios cerrados
  overrides?: SanctionedOverrides;         // D-03: canales sancionados, nunca `--ds-*` crudos
};
```

`ThemeDecisions` es el kit de 29 decisiones (`audit/50-matrices/customization-inventory` §5), pendiente de D-27. Los documentos v1 existentes migran con `migrate v1→v2` (total, fail-closed). Un documento v2 puede activar decisiones que **todavía no se propagan** (§4): la puerta lo acepta, lo registra y el indicador lo muestra; cuando el corte de familia llega, la decisión se enciende sin tocar la app ni el documento.

## 4. Qué puede cambiar un tenant HOY con efecto real (HECHO: `audit/50-matrices/cascade` §1)

| Efecto hoy | Decisiones |
| --- | --- |
| Pleno y coherente en static y DB | `palette.seeds` (salvo rampa `accent` y el bloque base vacío de rottay en DB, F-05), `palette.status-seeds`, `typography.pairing`, `typography.families`, `navigation.sidebar-tone`, `experience.profile`, `profiles.expressive` |
| Parcial | `typography.scale` (1 canal), `density.mode` (escala efectiva; 9/123 skins), `motion.dial` (11/25 familias), `surfaces.elevation-posture` (17/25), `surfaces.effect-intensity` (8/25), `shape.button-style` (solo DB), `states.emphasis` (efecto en artefactos vía canales derivados de estado/material; 0/8 familias de la muestra movidas), `states.focus-style` (ídem) |
| Sin efecto útil | `shape.radius-scale` (se auto-cancela, F-07), `spacing.rhythm` (2/25), `recipe-profile` (sin lector), `chrome.anatomy` (4/123), `profiles.icon`, `responsive.posture`, `palette.dark-mode` por tenant (F-05) |
| No existen aún | las 8 decisiones nuevas del kit (`neutral-temperature`, `contrast-posture`, `role-weights`, `numeric`, `nesting`, `control-height`, `border-style`, `motion.character`) |

Indicador "decisiones encendidas" (STATUS, WO-CON-03): hoy **7 plenas / 22** y 0 / 8 nuevas — titular de la evidencia sellada en `scripts/check/decisions-lit/evidence/index.json`: "decisions lit = 7/22 (+0/8 new)"; objetivo 29 / 29 con sonda por eje. Registrado no es medido (DEL-07): las dos decisiones de estados constan como parciales porque los artefactos cambian (canales derivados de estado/material), pero la sonda sobre la muestra de 8 familias aún no mide ninguna familia movida. Dos tenants se ven distintos hoy por color, tipografía y perfil expresivo; forma, ritmo, estados y modo llegan con los cortes (olas 3–4).

## 5. Regla evolutiva

1. Las apps programan contra §1–§3 y no se vuelven a tocar por trabajo interno del DS; solo el changeset 3.0 (WO-RET-01) puede exigir un codemod, y únicamente sobre lo listado como prohibido.
2. Cada corte de familia enciende decisiones y sube el indicador; ninguna WO de las olas 3–5 cambia una firma de §2 ni el esquema de §3.
3. Las fachadas de WO-CON-02 y WO-CON-03 son **excepciones fechadas** a la regla de unicidad (dos caminos durante la transición): las borran WO-EMI-02 (montaje real, misma firma) y WO-DER-06/WO-CAT-02 (derivación real, mismo documento). Una excepción sin WO que la borre no se acepta.
4. Cambios en las apps: las notas X-01…X-06 de `audit/70-plan/risks` son la lista; se ejecutan en el hito A con los codemods del DS, no antes.

## 6. Tres niveles de personalización (dónde vive cada cosa que pidió el owner)

| Nivel | Quién decide | Ejemplos | Mecanismo del DS | WO |
| --- | --- | --- | --- | --- |
| 1 · Decisiones del tenant | el tenant (por plan Standard/Pro) en el documento v2 | paleta, tipografía, radio, densidad, ritmo, elevación, motion, estados, modo, perfil expresivo | catálogo tipado → derivación → canales; sonda por eje | WO-CAT-*, WO-DER-*, WO-FAM-* |
| 2 · Configuración de superficie y de componente (`adapt`) | la app (BitHire), por pantalla y por componente | qué regiones existen, **posturas phone/tablet/desktop** (móvil simplificado: regiones ocultas, barra inferior, densidad), vista por defecto; y por componente el slot `adapt`: **qué columnas quedan en una tabla en phone, cuáles se achican, si pasa a cards**, tamaño de cards de una colección, qué muestra un widget según su propio tamaño (`compact/regular/expanded`) | contrato de posturas + `SurfaceRegion` + slot `adapt` tipado por familia (mismos nombres de postura en todas) + kit de layout adaptativo (auto-fit) + kernel de animación de layout | WO-INV-04, WO-INV-06, WO-INV-07, WO-INV-08, WO-FAM-12, WO-FAM-13 |
| 3 · Props de instancia | el componente en la página | `<Card scale="lg">`, `<Grid autoFit minItem="…">`, variantes | props tipadas mapeadas a canales, nunca a valores | cortes de familia |

Ejemplo del nivel 2 en una tabla (lo declara BitHire, lo resuelve el DS en el servidor):

```tsx
<PatternDataTable
  columns={columns}
  adapt={{
    phone: { columns: { keep: ["name", "status", "owner"], shrink: ["status"] }, presentation: "cards", rowActions: "swipe" },
    tablet: { columns: { keep: ["name", "status", "owner", "updatedAt"] } },
  }}
/>
```

Regla: el DS estipula el lugar y el tipo (`adapt` con posturas iguales en todas las familias); la app decide el contenido; nada de esto espera a que el DS "resuelva" cada pantalla. Los widgets con resize se autoajustan por postura de contenedor, con reflow animado por el kernel de layout (WO-INV-08) y presupuesto de perfección medido en trazas (0 tareas largas durante un resize).

Precedencia: el nivel 1 mueve los canales que los niveles 2 y 3 consumen; una prop de instancia nunca contradice una decisión del tenant (lo verifica el gate de WO-CAN-04). "Cards más grandes con el espacio vacío autoajustado" es nivel 2/3 sobre canales derivados del nivel 1 (`--ds-card-min-inline-size`, `--ds-card-scale`, `--ds-grid-gap`); "que el móvil se vea distinto y muchísimo más simplificado" es nivel 2 (posturas por superficie) resuelto en el servidor para que el primer pintado ya sea el móvil; "responsive" es el contrato único de breakpoints y posturas (WO-DER-04 + WO-INV-04) que alimenta a los tres niveles.

Con el kit de 29 decisiones más los niveles 2 y 3, dos tenants de BitHire se distinguen en color, tipografía, forma, densidad, ritmo, elevación, motion, estados y modo, y cada pantalla de BitHire decide su forma por postura sin tocar el DS. Lo que **no** cubre y queda fuera a propósito: layouts arbitrarios por tenant (el tenant no reordena pantallas), CSS crudo por tenant (D-03) y semántica de producto en el DS.

## 7. Dos carriles autónomos a partir del hito A (owner, 2026-09-05)

"Hasta acá es todo lo que necesitás saber": cuando WO-CON-04 está en verde, §1–§5 es la totalidad de lo que un agente que construye una app necesita leer del DS.

| Carril | Quién | Qué hace | Qué no toca |
| --- | --- | --- | --- |
| APP | un agente (o varios) en `app-bithire` | rediseño total de las páginas en el área de previews de BitHire, contra este contrato (niveles 2 y 3 de §6); registra su trabajo en `app-bithire/roadmap/` | internos del DS; nunca crea un segundo DS en `_shared/`; no importa subpaths prohibidos; no escribe CSS de tenant |
| DS | un agente (o varios) en `ui-design-system` | olas 2–5 del roadmap detrás del contrato; publica versiones con changesets; sube el indicador de decisiones encendidas | repos de las apps; firmas y esquema de §2–§3 |

Alcance (owner, 2026-09-05): el único carril APP en marcha es app-bithire; app-platform, lo comercial y app-evnto quedan fuera del programa y sus paquetes de migración se difieren. (Corrección de medición, WO-CON-01: los cuatro árboles importan el paquete hoy — §1.7 —; lo que el owner acotó es el alcance de trabajo, no el consumo existente.) Mecanismos de desacople (WO-CON-05): versión fijada por la app y actualizada cuando ella decide; changeset obligatorio para cualquier cambio de superficie pública; una sola vía para pedir capacidades al DS (WO en el roadmap con el test promote-to-DS); sección "contract diff" en STATUS. Un cambio del DS que rompa el fixture de consumidor (WO-CON-04) no se mergea.
