# P6 — Entrega CSS: bloqueante de red vs higiene de distribución

HEAD verificado: `dcc44a6093de0ba4f9dcbdb733ae467008cffb21` al inicio, `f166570d92433fe1437133975732003c1fd29a32` al final (árbol compartido y vivo, otro agente commiteó de en medio; no toqué nada). `git status --short` inicial: 2 `M` en `public-entrypoint-boundary-gate/` (ajenos, no tocados) + `docs/reauditoria-cloud/` sin trackear. Final: sólo `docs/reauditoria-cloud/` sin trackear (los 2 `M` fueron commiteados por otro agente entre medio). `packages/core/styles/bithire.css` y `dist/bithire.css` verificados con el mismo byte-count (5.385.897) al inicio y al final — el artefacto que medí no cambió durante la sesión.

## Reproducción (hecho base, comando → salida)

**1. Bundle base, styles vs dist**
```
wc -c packages/core/styles/bithire.css packages/core/dist/bithire.css
→ 5.385.897 bytes cada uno; diff/md5 → IDÉNTICOS byte a byte (dist es una copia exacta de styles, no hay build/minify entre medio)
gzip -9 -c styles/bithire.css | wc -c → 1.043.235
```
Coincide EXACTO con la cifra que Kimi y el team-lead citan para RC-08. `dist/` no aporta nada distinto de `styles/` hoy — confirma H-E-1 (`build-css/index.mjs` sólo concatena `@import`, cero minify) desde un ángulo adicional: ni siquiera hay DOS artefactos divergentes, hay uno solo con dos nombres.

**2. Qué minifica Next en producción**
- `app-bithire/package.json` script `build`: `next build --webpack` (build de producción usa Webpack explícito, no Turbopack — Turbopack es sólo el `dev` script). Next 16.3.0 (`node_modules/next/package.json:3`).
- `app-bithire/node_modules/next/dist/build/webpack-config.js:974`: `minimize: !dev && (isClient || isEdgeServer || isNodeServer && config.experimental.serverMinification)` — en build de producción (`!dev`) SÍ minimiza.
- Línea ~1010: el minimizador de CSS activo quien NO usa Rspack (este repo no usa Rspack) es `CssMinimizerPlugin` (`webpack/plugins/css-minimizer-plugin.js`), que corre `postcss([cssnanoSimple({colormin:false})])` sobre CADA asset `.css` que Webpack emite — el regex es `/\.css(\?.*)?$/i`, sin distinción de origen (`node_modules` vs app), porque actúa DESPUÉS de que `css-loader`/`mini-css-extract-plugin` ya inlinearon el `@import "@rottay/design-system/styles/bithire"` de `globals.css:21` dentro del asset final. Es decir: el CSS del DS SÍ pasa por este minimizador en un build real.
- No hay ningún `.next` de producción en el repo (`app-bithire/.next` sólo tiene `dev/`) — no había artefacto real que medir; confirmo el minimizador leyendo el código fuente de Next, no ejecutando `next build` (prohibido).

**3. Reproducción del minificado de Codex con el MISMO minificador que usa Next**
Requerí `next/dist/compiled/cssnano-simple` + `postcss@8.5.23` (del pnpm store de `app-bithire`) y corrí exactamente `postcss([cssnanoSimple({colormin:false})]).process(...)` con el parser `postcss-scss` que usa el plugin real, sobre `styles/bithire.css` sin tocar nada más:
```
raw:  3.052.989 bytes   (Codex dijo 3.052.989 → MATCH EXACTO)
gzip -9: 344.487 bytes  (Codex dijo 344.492 → diferencia de 5 bytes, ruido de header gzip/versión, no metodológico)
brotli -q11: 246.220 bytes (no citado por Codex, dato nuevo)
```
Esto es una reproducción independiente byte-exacta del número de Codex, corriendo la MISMA librería que Next invoca en `next build --webpack`, no una aproximación con otro minificador.

Comparación con "sólo quitar comentarios" (Cloud, H-E-1): raw 3.433.363 / gzip 368.213. cssnano real baja más (344.487 vs 368.213 gzip, -6,4% adicional) porque además de comentarios colapsa selectores, fusiona reglas, normaliza colores/unidades — es una minificación real, no sólo un strip de comentarios.

**4. Cuánto del minificado es de otros engines (classic+rustic)**
Parser de bloques con brace-matching (recursivo sobre `@media/@supports/@layer/@container`, colapsa el wrapper si queda vacío) sobre el CSS SIN comentarios (evita el bug de comillas/llaves literales dentro de comentarios JSDoc tipo `var(--ds-{component}-{property})`, verificado por balance de llaves 15.627=15.627 antes de filtrar):
- Selector con `.ant-` o `rustic` → se elimina el bloque completo (o el bloque padre si queda vacío).
- Control positivo: 0 apariciones de `.ant-`/`rustic` sobrevive en el archivo filtrado (antes de filtrar había cientos, incluidos bloques reales como `html[data-tenant] .ant-btn { ... }`).
```
Comments-stripped, engines kept,   minificado: 3.052.923 raw / 344.443 gzip  (≈ igual al full-minify con comentarios: confirma que cssnano ya limpia comentarios, no hay confound)
Comments-stripped, engines removed, minificado: 2.709.760 raw / 306.641 gzip
```
Contribución de classic+rustic al bundle YA MINIFICADO: **343.163/3.052.923 = 11,2% del raw**, **37.802/344.443 = 11,0% del gzip**. Es un piso (no captura tokens `:root` compartidos entre engines ni el `:root` de otras rampas), pero más preciso que el 6,00% de H-E-2 porque opera por bloque completo con recursión real en vez de un scan de línea.

**5. Los 1.024 `--ds-*` declarados-no-leídos: reproducción + clasificación externa**
```
grep -oE -- '--ds-[a-zA-Z0-9_-]+[[:space:]]*:' bithire.css | sed -E 's/[[:space:]]*:$//' | sort -u → 3.853
grep -oE -- 'var\(--ds-[a-zA-Z0-9_-]+' bithire.css | sed -E 's/^var\(//' | sort -u → 5.550
comm -23 declared read → 1.024
```
Match exacto con H-E-7/RC-08 (positive control heredado: mismo comando, mismo resultado).

Allowlist Expert (`TENANT_THEME_OVERRIDE_TOKENS`, `packages/core/src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts:156-231`) reconstruida programáticamente desde la fuente (35 literales + `TENANT_SEMANTIC_SURFACE_TOKENS` 8 roles×20 facets=160 + 13 literales + `TENANT_SEMANTIC_TYPOGRAPHY_TOKENS` 9 roles×7 facets=63 + 19 literales) = **290 exacto** (coincide con el "290 vivo" que Codex/Kimi ya habían anclado en `manifest/controls/token-overrides.json:65` — control positivo cruzado).

**Intersección EXACTA (no muestra) entre los 1.024 no-leídos y los 290 del allowlist**: `comm -12` → **5 tokens**: `--ds-glass-bg`, `--ds-glass-border`, `--ds-overlay-heavy`, `--ds-overlay-light`, `--ds-overlay-medium`. Verificados como reales `:root` declarados (`grep -n -F` → líneas 4863/4866/125219-125221 de `styles/bithire.css`) y genuinamente sin ningún `var(--ds-...)` en las 3 engines del mismo bundle.

Muestra de 40 (semilla determinística sobre el universo de 1.024) clasificada por consumidor EXTERNO al bundle (`app-*/src/**/*.css`, `.ts`/`.tsx` de apps+DS+showroom excluyendo tests/stories, `hooks-manifest.json.publicHooks` [91 nombres], allowlist 290):
- 35/40 (87,5%) tienen AL MENOS una referencia textual externa.
- De esas, la enorme mayoría (26 de 34 hits en `.ts/.tsx`) resuelven a un ÚNICO archivo por token: un "component token mirror" declarativo bajo `foundation/tokens/ts/runtime/components/<componente>/index.ts` (ej. `modal/index.ts:281 dividerWidth: 'var(--ds-modal-divider-width)'`). Verifiqué el caso Modal en profundidad: ese módulo se re-exporta en el barrel `components/index.ts` cuyo propio docstring dice *"provides a single `componentTokens` object for **runtime introspection**"* — es decir, es un catálogo para tooling/documentación (probablemente showroom), no una lectura de pintura (`getPropertyValue` o `style={{...}}` real). 0 importadores del módulo `modal` fuera de ese barrel de introspección.
- Sólo 4/40 (10%) no tienen NINGÚN hit externo en ninguna de las 4 categorías: `--ds-letter-spacing-subtle-wide`, `--ds-rich-card-sheen`, `--ds-tint-info-24`, `--ds-tint-error-16`.
- 1/40 (`--ds-overlay-medium`) cae en el allowlist Y tiene hit en `.ts` — el `.ts` hit es el propio compilador `brand-theme/index.ts:1021`, que sí es un consumidor real (parte del compilador, no un catálogo muerto).

**6. Fuentes — `typography.pairing` y `@font-face` faltante**
`manifest/controls/typography.pairing.json` → enum cerrado `[sober, editorial, geometric, technical]`. `bithire.css` sólo embebe 3 de los 6 font-packs del catálogo (grotesk-display, humanist-text, plex-mono; NO editorial-display/editorial-text/geometric-display — confirmado por los 4 `@font-face` reales: Space Grotesk, Public Sans, IBM Plex Mono×2).

**Corrección importante a H-E-9/RC-08**: `TYPE_PAIRINGS` (`foundation/tokens/ts/presentation/typography/pairings/index.ts:34-58`) — el preset que SÍ está activo en el compilador de producción (`appearance-posture/index.ts`, consumido por `brand-theme/index.ts:1096` vía `appearancePostureToVariables(tenantPosture)`, que es el `compileTheme` único que CLAUDE.md documenta como autoridad tanto para BrandTheme estático como para `TenantThemeDocument` DB) define el fallback de "editorial" así:
```ts
editorial: { heading: "var(--ds-font-pack-editorial-display, Georgia, 'Times New Roman', serif)", ... }
```
No es un fallback accidental "a fuente de sistema sin aviso": es un fallback EXPLÍCITO y curado, hardcodeado en el mismo compilador, con un comentario normativo en el archivo que dice *"Fallbacks MUST live inside the var() parens and terminate in a concrete stack"*. Los 4 presets (`sober/editorial/geometric/technical`) tienen los 4 fallbacks completos. Confirmé que `--ds-font-sans`/`--ds-font-mono` (los fallbacks de los otros 3 presets) SÍ están declarados incondicionalmente en `bithire.css:1647,1649` con stacks reales.

## Adjudicación por afirmación

| Afirmación | Quién | Cifra reproducida | Interpretación | Veredicto | Quién tenía razón |
|---|---|---|---|---|---|
| Bundle sin minificar: 5.385.897 raw / 1.043.235 gzip, 0 minificador en el repo del DS | Cloud/Kimi | Exacto, reproducido | El DS efectivamente no minifica su propio artefacto (`styles/`≡`dist/`) | CONFIRMADA | Cloud/Kimi (el hecho de fuente) |
| Next/Webpack YA minifica en `next build` de producción vía `cssnano-simple`, aplica al CSS importado desde `node_modules` | Codex | 3.052.989 raw / 344.487 gzip — match exacto al raw de Codex, gzip a 5 bytes de diferencia | Reproducido corriendo la MISMA librería (`next/dist/compiled/cssnano-simple`) que invoca `CssMinimizerPlugin`, no una aproximación | CONFIRMADA | Codex |
| "No es el ahorro de red bloqueante para estas 3 apps que Cloud calculó sobre el artefacto sin pipeline consumidor" (RC-08, matriz Codex) | Codex | — | El build real de las 3 apps (`next build --webpack`, confirmado en los 3 `package.json`... verifiqué app-bithire; asumo mismo patrón Next para evnto/platform, no verificado línea por línea) SÍ minifica; 1,04MB gzip nunca es lo que viaja al navegador en producción | CONFIRMADA para app-bithire, PARCIAL (no verificado explícitamente evnto/platform) | Codex |
| Split por engine (classic+rustic incondicional) es "6,00% piso" del bundle sin minificar (H-E-2) | Cloud | Reproducido con metodología propia (bloques con recursión, no scan lineal): **11,2% raw / 11,0% gzip del bundle YA MINIFICADO** | El 6% de Cloud era piso sobre el RAW sin minificar; sobre el artefacto que realmente viaja (minificado) el peso relativo de otros engines es CASI EL DOBLE proporcionalmente (los comentarios que se van con la minificación NO son de código de engine, así que purgarlos concentra el peso restante en selectores reales) | CONFIRMADA CON CORRECCIÓN (la proporción real post-minify es mayor que el piso citado, no menor) | Ninguno lo midió sobre el artefacto real; mi cifra es la más representativa del ahorro real de un split |
| "El split por engine merece un experimento, no es bloqueante" | Codex | 37,8KB gzip de ahorro potencial sobre 344KB ya minificados (11%) | Ahorro real pero modesto una vez resuelto el bloqueante de minify; no bloqueante | CONFIRMADA | Codex |
| 1.024 `--ds-*` no leídos = "peso muerto y superficie falsa" para `token-overrides` (H-E-7, framing de Cloud) | Cloud | Intersección EXACTA con el allowlist de 290: **5 tokens**, no 1.024 | Sólo 5/1.024 (0,5%) son siquiera ALCANZABLES por un tenant vía `tokenOverrides` — los otros 1.019 no están en el contrato público, así que "un tenant puede gastar uno de sus 200 overrides en un canal sin efecto" (el daño concreto que cita Cloud) sólo es cierto para 5 nombres, no para el denominador de 1.024 que usa en el impacto | REFUTADA en alcance (el hecho base 1.024 es correcto; el framing de "superficie pública falsa" no escala al denominador citado) | Codex ("upper bound, no prueba de tokens muertos") — más preciso, aunque tampoco cuantificó la intersección real |
| 1.024 son "upper bound, no prueba de tokens muertos globales" (Codex) | Codex | 35/40 (87,5%) de la muestra tiene algún hit externo, pero la mayoría son catálogos JS declarativos de introspección (mismo patrón que el CSS: nombran el canal sin necesariamente pintarlo) | Codex acierta en que "no leído en ESTE bundle" ≠ "muerto en todo el sistema" — hay consumidores reales fuera del bundle (compilador, apps CSS). Pero tampoco hay que asumir que un hit en `.ts` = pintura real: en el caso Modal profundizado, el propio código documenta que es introspección, no render | PARCIAL (Codex tiene razón en la dirección, pero "upper bound" no implica que los 1.024 estén vivos; sólo implica que el bundle-only grep subestima consumidores no-CSS Y sobreestima "vida" si se confunde catálogo con pintura) | Ambos parcialmente — ninguno diferenció catálogo-de-introspección de consumo real |
| `typography.pairing="editorial"` sin `@font-face` cae en "fallback silencioso a fuente de sistema, sin error, sin gate" (H-E-9/RC-08) | Cloud/Codex (ambos lo listan sin corregirlo) | El propio `TYPE_PAIRINGS` define el fallback exacto: `Georgia, 'Times New Roman', serif` para editorial, hardcodeado en el compilador de producción activo | El fallback es DELIBERADO y curado, documentado en el archivo fuente, no un accidente de cascada CSS sin diseño. Sigue faltando validación de que el pairing elegido tenga el pack embebido (eso sí es real: la fuente REALMENTE servida difiere de la curada sin aviso al operador), pero la severidad "silencioso, sin diseño" está sobredimensionada | CONFIRMADA CON CORRECCIÓN (el gap de validación es real; el framing de "silencioso/accidental" no lo es — hay un fallback explícito de producción) | Ninguno — hallazgo nuevo de esta reproducción |

## Causalidad y severidad (si aplica)

- **RC-08 no es un bloqueante de red para las 3 apps Next tal como está redactado.** El árbol de causalidad completo es: fuente sin minificar (real, confirmado) → productor (`build-css/index.mjs`) → canal (`dist/*.css` publicado a npm, `@import` en `globals.css`) → consumidor (`next build --webpack`, que SÍ inserta un paso de minificación real sobre exactamente ese asset). El bloqueante existe en el ESLABÓN DEL PAQUETE NPM (quien consuma el `dist/` publicado fuera de un pipeline Next — showroom si no usa Next igual de agresivo, Storybook, un email builder, un consumidor no-Next futuro) pero no en las 3 apps de producción actuales, que sí tienen el paso.
- Es sí un bloqueante de **higiene de distribución / DX**: cada `git diff`, cada revisor, cada `npm install` de 5,4MB por archivo × 3 verticales, cada auditoría de bytes (como ésta) parte de una cifra que no representa la realidad de red — eso genera exactamente el tipo de desacuerdo Cloud-vs-Codex que esta reauditoría está resolviendo. El fix (gzip -9/lightningcss sobre `dist/` únicamente, dejar `styles/` legible) sigue siendo correcto y de bajo riesgo — sólo cambia la URGENCIA/etiqueta de "BLOQUEANTE" a "ALTO, no bloqueante de red".
- **El split por engine es de severidad baja-media** (11% del minificado, no 6% del raw) — vale como experimento acotado, no como bloqueante ni como prioridad sobre otros hallazgos (RC-09 versionado sigue siendo objetivamente más grave: ese sí rompe un build hoy).
- **H-E-7/RC-08 "1.024 muertos"**: la severidad real cae en el subconjunto de 5 (allowlist). El resto (1.019) es deuda de higiene interna (tokens declarados que ningún engine consume dentro de ESE bundle) pero no es "superficie pública falsa" salvo para esos 5.

## Fix correcto (tipo, sin implementar) y fixes que NO deben ejecutarse

**Correctos:**
- Agregar `lightningcss --minify` (o el mismo `cssnano-simple` que ya usa Next, para no introducir un segundo comportamiento de minify en el ecosistema) SOLO a `dist/*.css`, manteniendo `styles/*.css` legible para diff/gates — beneficia paquete npm/DX/consumidores no-Next, no promete ahorro de red en las 3 apps.
- Retirar los 5 tokens del allowlist que no tienen consumidor (`--ds-glass-bg/-border`, `--ds-overlay-light/-medium/-heavy`) O darles un consumidor real — es un fix de 5 elementos, no de 1.024.
- Añadir una validación fail-closed (coherente con el resto del sistema de allowlists que ya describe CLAUDE.md) en el compilador de `TenantThemeDocument`: si `typography.pairing` pide un pack que el bundle activo no embebe, emitir un `TenantThemeValidationIssue` en vez de depender silenciosamente del fallback Georgia/serif — el fallback en sí NO hay que tocarlo (es correcto como red de seguridad), sólo falta el aviso.
- Split `dist/{vertical}.{engine}.css` es un experimento válido de baja prioridad (11% de ahorro adicional sobre el bundle ya minificado) — no ejecutar antes de resolver RC-09 (versionado) que es objetivamente más grave.

**NO ejecutar:**
- No borrar los 1.024 tokens en bloque "porque no se leen en el bundle" (advertencia ya en la matriz de Codex/Kimi, y esta reproducción la refuerza: 35/40 de la muestra SÍ tiene algún consumidor fuera del bundle, aunque de introspección).
- No tratar 344KB gzip (el número real post-Next-minify) como si fuera 1,04MB al dimensionar cualquier trabajo de "optimización de red" — dimensionar sobre el número real.
- No aplicar el split por engine como urgente/bloqueante; es un experimento, no una corrección de un defecto activo.

## Hallazgos nuevos que ninguno de los tres vio

1. **`styles/bithire.css` y `dist/bithire.css` son el MISMO archivo (byte-idéntico), no dos artefactos con roles distintos** — el propio H-E-1 de Cloud propone "generar DOS artefactos... ya están separados por `files` en `package.json`" asumiendo que ya existen separados hoy; en realidad hoy son un solo contenido con dos nombres/rutas. El fix debe crear la divergencia real, no asumir que sólo falta minificar uno de los dos.
2. **La proporción de peso de classic+rustic es MAYOR post-minify que pre-minify** (11% vs 6% piso) — contraintuitivo, porque los comentarios purgados no pertenecían a esos engines, así que minificar concentra (no diluye) el peso relativo del problema de H-E-2. Cualquier decisión de "primero minificar, después ver si vale la pena el split" debe usar el 11%, no el 6%.
3. **El fallback tipográfico de "editorial" es explícito y curado en el compilador de producción activo**, no un accidente de cascada — esto cambia la clase de defecto de "bug de diseño" a "gap de validación/aviso", con un fix mucho más acotado (una validación, no rediseñar el mecanismo de fallback).
4. **El "componentTokens" bajo `foundation/tokens/ts/runtime/components/` es un catálogo de introspección con 0 importadores productivos verificados** (caso Modal) — separado del problema de tokens muertos en CSS, hay un SEGUNDO inventario JS que espeja nombres de canal sin necesariamente pintarlos; cualquier censo futuro de "consumidores externos" de un `--ds-*` debe diferenciar explícitamente catálogo-de-documentación de consumo-de-pintura, o va a sobreestimar cuántos tokens están "vivos".

## Lo que no pude cerrar

- No verifiqué línea por línea que `app-evnto` y `app-platform` usen el mismo `next build --webpack` (sin Rspack, sin `useLightningcss` custom) que `app-bithire` — asumí el mismo patrón por ser Next 16 en el mismo monorepo, pero no abrí sus `package.json`/`next.config.ts` completos. Si alguna usa Rspack o Turbopack para build de producción, el minimizador real sería `LightningCssMinimizerRspackPlugin` en vez de `cssnano-simple`, con una cifra final distinta (probablemente similar o mejor, lightningcss suele comprimir más agresivo).
- No pude correr `next build` real (prohibido por las reglas del brazo) para confirmar que el CSS del DS efectivamente termina en UN SOLO asset minificado de producción y no se duplica (H-E-1 de brazo-E ya señaló dos copias de ~4.3MB en `.next/dev`, sin resolver si es duplicación real de HMR o artefacto normal de Turbopack en dev — sigue sin cerrar, y mi reproducción tampoco lo cierra, es un problema de DEV, no de build de producción).
- Los "39,3163 bytes" (11,2%/11,0%) de contribución de classic+rustic son un piso: mi filtro por selector no captura `:root` de tokens compartidos entre engines ni comentarios (ya purgados) que documentaban esos engines — el número real de "peso atribuible a classic+rustic" incluyendo tokens de soporte compartidos podría ser algo mayor, no lo acoté por arriba.
- No crucé los 1.019 tokens NO-allowlist del set de 1.024 contra ningún otro contrato de escritura (por ejemplo, si algún componente interno los escribe vía JS inline style aunque no estén en el allowlist tenant) — sólo hice el crossing contra los 4 canales pedidos explícitamente (CSS de apps, TS/TSX, hooks-manifest, allowlist) sobre una muestra de 40, no sobre los 1.024 completos.
