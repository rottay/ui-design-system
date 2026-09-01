# P3 — `shape.button-style`, elevación, PageShell mobile, safe-area RTL

HEAD verificado: `dcc44a6093de0ba4f9dcbdb733ae467008cffb21` al inicio; el repo avanzó a
`f166570d92433fe1437133975732003c1fd29a32` durante el trabajo (otro agente comiteó). Diff-stat
entre ambos SHAs sobre los 7 archivos que uso como evidencia (`button.css` skin y presentation,
`page-shell.css`, `drawer.css`, `sheet.css`, `overlay-modal.css`, `appearance-posture/index.ts`)
es **vacío** — ningún archivo citado cambió. Toda cita de línea abajo es válida en ambos SHAs.

git status inicial: `M packages/core/scripts/boundaries/public-entrypoint-boundary-gate/{index.mjs,index.test.mjs}`
+ `?? docs/reauditoria-cloud/`. git status final: sólo `?? docs/reauditoria-cloud/` (los 2
modificados ajenos ya no aparecen — fueron comiteados por otro agente entre medio; no los toqué).

Método: 100% lectura de fuente (`Read`/`grep`/`sed -n`), cero build, cero test, cero browser. Donde
la adjudicación depende de comportamiento real de motor CSS lo digo explícito.

---

## A. `shape.button-style`

### Cadena completa reconstruida

1. **`--ds-button-md-radius` SIEMPRE está declarado**, incondicional, en
   `src/foundation/tokens/css/presentation/components/button.css:47-48`:
   ```css
   :root {
     --ds-button-md-border-radius: var(--ds-radius-md);
     --ds-button-md-radius: var(--ds-button-md-border-radius);
   }
   ```
   Ídem para xs/sm/lg/xl (líneas 23-24, 35-36, 59-60, 71-72). Este archivo se importa en
   `facade/entrypoints/styles.css:64` y `base.css:49` con `layer(rottay-components)`.

2. **Orden de layers** (`facade/entrypoints/styles.css:24`):
   `theme, base, rottay-framework, rottay-reset, rottay-tokens, rottay-motion, rottay-components,
   rottay-engines, rottay-personality, rottay-responsive, components, utilities`.
   `rottay-engines` (donde vive `skin/button.css`) va DESPUÉS de `rottay-components`, pero eso es
   irrelevante para la pregunta: `--ds-button-md-radius` no se REDECLARA en `rottay-engines`, así
   que el valor de `rottay-components` sigue vigente ahí — layers deciden quién gana cuando la
   MISMA propiedad se declara en dos capas para el mismo elemento, no si una propiedad "existe".

3. **El artefacto compilado de bithire la re-declara con más especificidad, no la borra**:
   `facade/artifacts/bithire/index.css:134` → `--ds-button-md-radius: calc(9px / 1.25 *
   var(--ds-radius-scale, 1));` — sigue definida, ahora con el valor autoral del vertical.

4. **`skin/button.css` la lee para los 5 tamaños, nunca lee `--ds-radius-button`**:
   ```
   :338  [data-size='xs']  --_ds-button-resolved-radius: var(--ds-button-xs-radius, var(--ds-radius-sm));
   :351  [data-size='sm']  --_ds-button-resolved-radius: var(--ds-button-sm-radius, var(--ds-radius-sm));
   :364  [data-size='md']  --_ds-button-resolved-radius: var(--ds-button-md-radius, var(--ds-radius-md));
   :377  [data-size='lg']  --_ds-button-resolved-radius: var(--ds-button-lg-radius, var(--ds-radius-lg));
   :390  [data-size='xl']  --_ds-button-resolved-radius: var(--ds-button-xl-radius, var(--ds-radius-xl));
   ```
   `grep -c "var(--ds-radius-button" skin/*.css` → 0 en todo el árbol de skins.

5. **Semántica de `var()`**: el fallback (segundo argumento) sólo se evalúa cuando la custom
   property referenciada es *guaranteed-invalid* o no está declarada en absoluto para ese elemento
   en toda la cascada. `--ds-button-md-radius` cumple (1)-(3): está declarada en `:root`, heredada,
   nunca `unset`/`initial` en el camino hasta `.rottay-button`. Por lo tanto **siempre resuelve al
   primer argumento** — esto no depende de specificity, de layers ni de orden de importación; es
   una propiedad del propio `var()`.

6. **El dial real (`appearance-posture/index.ts:150-153`) escribe SÓLO `--ds-radius-button`**:
   ```ts
   if (posture.buttonStyle) {
     vars["--ds-radius-button"] = dialReachableRadius(
       buttonStyleRadius(posture.buttonStyle)!,   // sharp:"2px" soft:"var(--ds-radius-md,8px)" pill:"9999px"
       resolveRadiusScale(clampedRadiusScale)
     );
   }
   ```
   Ningún canal `--ds-button-{size}-radius` sale de esta rama.

7. **El patrón CORRECTO ya existe en el mismo compilador, para otro eje** —
   `chrome-variables/index.ts:1740-1746` (rama `buttonGeometry.radius`, un canal autoral de
   vertical, no el dial tenant `buttonStyle`):
   ```ts
   if (geometry.radius) {
     vars["--ds-radius-button"] = geometry.radius;
     for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
       vars[`--ds-button-${size}-radius`] = geometry.radius;
     }
   }
   ```
   Escribe el canal legacy Y la familia por tamaño. Es exactamente lo que `appearance-posture`
   necesitaría hacer y no hace.

### Adjudicación por afirmación

| Afirmación | Quién | Veredicto | Nota |
|---|---|---|---|
| `shape.button-style` emite sólo `--ds-radius-button`, ningún skin lo lee, Δ=0 en pintura | Cloud/Codex/Kimi (los 3) | **CONFIRMADA** | Reproducido byte a byte en fuente, puntos 1-6 arriba |
| Fix de Cloud (`var(--ds-button-md-radius, var(--ds-radius-button, var(--ds-radius-md))))`) resuelve el defecto | Cloud | **REFUTADA** | Punto 5: `--ds-button-md-radius` nunca es undefined en el punto de lectura → el fallback intermedio es código muerto, sin importar cascade/layers/specificity |
| El fallback es vacuo porque `--ds-button-md-radius` "ya está siempre definido" | Codex, Kimi (autocrítica) | **CONFIRMADA** | Verificado independientemente vía declaración `:root` incondicional + capas + artefacto |
| El fix correcto es derivación en el compilador, no lectura en el skin | Codex (implícito), Kimi (explícito, "Bloque 1.2") | **CONFIRMADA** | Hay un patrón hermano ya viviente (`chrome-variables`) que hace exactamente esto para el mismo canal |

**Quién tenía razón**: Codex y Kimi. El fix de Cloud es vacuo, confirmado por lectura de cascada,
no sólo por argumento de autoridad.

### Fix correcto (tipo, sin implementar)

Extender la rama `posture.buttonStyle` en `appearance-posture/index.ts:150-153` para que, además de
`--ds-radius-button` (mantenerlo por compat/`framework-token-projection.css:43`), escriba
`--ds-button-{xs,sm,md,lg,xl}-radius` — mismo bucle que `chrome-variables/index.ts:1742-1746`, sobre
el mismo valor `dialReachableRadius(...)`. Es un cambio de ~6 líneas en el compilador, mismo archivo,
mismo patrón que ya pasa sus propios tests (`appearance.test.ts:283-307` ya asertan
`--ds-radius-button`; habría que extender esos tests a los 5 canales por tamaño + un computed test
de los 5 tamaños de `Button` renderizados con cada `buttonStyle`).

**Fix que NO debe ejecutarse**: el fallback de una línea en `skin/button.css:73` (y sus 4 hermanos en
338/351/377/390) que propuso Cloud. No sólo es inerte hoy: si algún día
`--ds-button-md-radius` dejara de declararse incondicionalmente (regresión futura), ese fallback
callaría el error en vez de exponerlo.

---

## B. Elevación

### Reproducción

`appearance-posture/index.ts:80-96`:
```ts
const ELEVATION_PRESET = {
  flat:     { "--ds-elevation-1": "none", "--ds-elevation-2": "none",
              "--ds-elevation-3": "0 1px 2px rgba(0,0,0,0.05)" },
  soft:     {},
  elevated: { "--ds-elevation-1": "0 2px 4px rgba(0,0,0,0.08)",
              "--ds-elevation-2": "0 4px 8px rgba(0,0,0,0.1)",
              "--ds-elevation-3": "0 8px 16px rgba(0,0,0,0.12)" },
};
...
if (posture.elevation) Object.assign(vars, ELEVATION_PRESET[posture.elevation]);
```
Confirmado exacto: sólo 3 canales (`--ds-elevation-1/2/3`), niveles 0/4/5 nunca tocados por ningún
preset. `soft: {}` es identidad literal — Object.assign con objeto vacío no escribe nada.

**bithire flat Δ=0, verificado en el artefacto compilado**:
`facade/artifacts/bithire/index.css:459-461`:
```css
--ds-elevation-1: none;
--ds-elevation-2: none;
--ds-elevation-3: 0 1px 2px rgba(0,0,0,0.05);
```
Byte-idéntico al preset `flat`. bithire autoró su baseline igual al preset "flat" del dial —
elegir `flat` en bithire es un no-op garantizado por construcción, no una coincidencia de instancia.

### Adjudicación

| Afirmación | Quién | Veredicto |
|---|---|---|
| `ELEVATION_PRESET` sólo escribe niveles 1/2/3; `soft={}`; bithire `flat Δ=0` | A (Cloud) | **CONFIRMADA**, reproducida en fuente + artefacto |
| "Escalones incompletos/redundantes" | Codex | **CONFIRMADA CON PRECISIÓN**: *incompleto* = 0/4/5 nunca se mueven, en los 3 verticales, siempre; *redundante* = dos ejes distintos de redundancia — (a) `soft` es idéntico a "no elegir nada" en cualquier vertical (preset vacío); (b) `flat` es idéntico al baseline autoral de bithire específicamente (Δ=0 sólo ahí; evnto/rottay sí mueven, según A) |

**Quién tenía razón**: los tres coinciden en el hecho; la frase de Codex ("incompletos/
redundantes") es la descripción más precisa una vez separados los dos tipos de redundancia.

### Fix correcto (tipo, sin implementar)

Dos piezas independientes, ninguna implementada aquí:
1. Extender `ELEVATION_PRESET` a los 6 niveles (0..5).
2. Derivar los presets del ladder autoral por vertical (multiplicador/atenuación sobre los valores
   ya autorados en `facade/artifacts/<vertical>/index.css`) en vez de sustituir por literales
   genéricos — así `elevated` no pisa la dirección de arte de rottay (6 niveles con inset highlight +
   glow teñido, según H-A-4 de A) con sombras planas sin tinte.

**No pude verificar** desde este cluster el detalle exacto del ladder de rottay (6 niveles,
inset+glow) citado por A — lo doy por bueno porque A lo cita con archivo+línea y no tengo motivo
para dudarlo, pero no lo re-derivé yo mismo.

---

## C. PageShell a 390 px

### Anatomía real de PageShell (root selector `[data-part]`, censo exhaustivo del skin)

`root, header, breadcrumb, crumb, lead, titles, title-row, actions, header-content, content,
metadata, tabs, rule, header-icon, back, skeleton-group, skeleton-title-row, skeleton-title-copy,
skeleton-action-row, skeleton, skeleton-tabs-row`. **Cero** parte llamada `sidebar`/`aside`/`lateral`.
PageShell no tiene, ni tuvo nunca, un slot lateral en su contrato de anatomía — es un shell de
página con header + tabs + content, no un shell con rail.

### Root CSS (`page-shell.css:127-135`)

```css
.ds-pattern-page-shell.ds-engine-modern[data-part='root'] {
  ...
  container-type: inline-size;
  container-name: ds-page;
}
.ds-pattern-page-shell.ds-engine-modern[data-part='root'] {
  max-width: var(--ds-page-shell-max-width, none);
  margin-inline: auto;
}
```
**No hay `width`/`inline-size` explícito en el root.** El comentario propio del archivo (línea 132)
ya reconoce medio problema: *"margin-inline: auto is a no-op without a measure"* — pero eso habla de
CENTRADO (si no hay `--ds-page-shell-max-width`, el auto-margin no hace nada), no de la causa del
colapso de ancho.

### Dónde se monta en la escena reproducida por Cloud

`packages/showroom/src/app/probe/whitelabel-torture/scenes/shell/page.tsx` → `HeadersPatternsFbStates`
(`.../torture-sections/headers-patterns/index.tsx:190-207`):
```tsx
<Box ...>
  <Stack spacing="lg" fullWidth>
    <HeadersPatternsFbCockpit />
    <HeadersPatternsFbCockpitSticky />
    <HeadersPatternsFbPageShell />
    <HeadersPatternsFbPageShellNoTabs />   {/* renderiza el label "PageShell (no tabs — the bare rule branch)" seguido de <PatternPageShell title="Users" subtitle="No tabs"> */}
    ...
  </Stack>
</Box>
```
`Stack` (`presentation/components/skin/layout-primitives.css:293-297`):
```css
.rottay-stack { display: flex; flex-direction: column; align-items: stretch; gap: ...; }
```
`align-items: stretch` es el default — en teoría el PageShell (flex item, cross-axis = ancho en un
stack columna) debería estirarse al ancho completo del Stack sin necesitar `width` propio.

### Mecanismo CSS que explica el colapso (lectura, no ejecución)

`container-type: inline-size` implica `contain: inline-size` (layout + size containment en el eje
inline). Esa containment hace que el elemento **no tome su ancho de su propio contenido** — su
contribución de tamaño intrínseco (min-content) se trata como si no tuviera hijos. Esto interactúa
mal con un invariante de flexbox: por defecto un flex item tiene `min-width: auto`, que normalmente
se resuelve al **min-content size** del item (para no dejarlo encoger por debajo de su contenido);
con size containment ese min-content se colapsa a (cerca de) cero, porque containment corta
justamente la vía por la que el navegador mediría "cuánto necesita este contenido". El resultado
documentado en múltiples motores es que un elemento `container-type: inline-size` que es flex/grid
item SIN un `inline-size`/`width` explícito puede terminar con un ancho final minúsculo en vez del
ancho "stretch" esperado, porque el algoritmo de flex-basis/stretch en algunos pasos cae al tamaño
intrínseco (ya contaminado por la containment) en vez de al tamaño estirado del contenedor.

Esto coincide exactamente con el síntoma reportado: la etiqueta *"PageShell (no tabs — the bare
rule branch)"* (un `<Text>` HERMANO, no interior a PageShell, en el mismo Stack) y el propio
PageShell renderizando a ~24 px con texto apilado letra por letra — consistente con que TODO el
tramo de ese Stack a partir de ahí quedó constreñido por el colapso del container en cascada hacia
arriba/abajo dentro del mismo flujo columna, no con que exista un "slot lateral" que "no colapsa".

El propio `@container ds-page (max-width: 640px)` (línea 696) demuestra que el diseño SÍ tiene un
breakpoint deliberado a 640px con un reordenamiento inteligente de header-row (back → eyebrow →
title → subtitle → actions → metadata, con `display:contents` en `lead`/`titles`) — el query
DISPARA igual (24px < 640px), pero dispara sobre un contenedor que ya midió mal, así que el
reordenamiento ocurre correctamente pero dentro de una caja casi nula.

### Adjudicación

| Afirmación | Quién | Veredicto |
|---|---|---|
| "PageShell no colapsa el slot lateral" | Cloud | **REFUTADA como descripción de causa** — PageShell no tiene ningún `data-part` lateral/sidebar en su anatomía (censo exhaustivo arriba); no hay slot que "debería colapsar y no colapsa" |
| El síntoma visual (texto apilado letra por letra a ~24px en la escena shell a 390px) | Cloud | **CONFIRMADA** — coincide con la evidencia sighted (`shell-390-bithire-top.png`) y con RC-32 |
| Causa real: root con `container-type: inline-size` + `margin-inline: auto` dentro de un flex sin `inline-size: 100%` | Codex | **CONFIRMADA por lectura de CSS** — mecanismo de containment + flex `min-width:auto` descrito arriba explica el colapso sin invocar ningún slot lateral; PageShell root efectivamente carece de `inline-size`/`width` explícito y su contexto de montaje inmediato en la escena reproducida es un flex `Stack` |

**Quién tenía razón**: Codex sobre la causa; Cloud sobre la existencia y severidad del síntoma
(mobile roto en producto real, no ruido del probe) pero con un diagnóstico de anatomía equivocado.

### Fix correcto (tipo, sin implementar)

Añadir `inline-size: 100%;` (equivalente lógico de `width: 100%`) a la misma regla que declara
`container-type: inline-size` en `page-shell.css:126-129`, para que el root nunca dependa de que un
ancestro externo le "empuje" un ancho — es el patrón defensivo estándar para cualquier elemento con
`container-type: inline-size` que pueda aparecer como flex/grid item. Cambio de una línea, mismo
archivo, mismo selector que ya existe.

**Qué prueba lo cierra**: no se puede cerrar sólo con lectura. Hace falta una regresión Playwright
real (la familia `ds-reference-overflow.spec.ts` / `layout-foundations-matrix.spec.ts` que D ya
identificó como existente) que monte `PatternPageShell` dentro de un `Stack`/contexto flex a 390px,
lea el `getBoundingClientRect().width` computado de `[data-part='root']` antes y después de agregar
`inline-size: 100%`, y verifique que el texto de header ya no hace line-break carácter-por-carácter
(ej. contar el número de `<span>`/nodos de texto por línea, o medir que el ancho computado ≥ un
piso razonable como 300px a 390px de viewport).

**Lo que NO until closed**: no reproduje esto en browser (prohibido por las reglas del cluster);
la explicación de containment+flex es un mecanismo CSS bien documentado y coincide con el patrón de
código exacto presente (`container-type` sin `inline-size` explícito dentro de un flex sin
verificar stretch efectivo), pero el team-lead debe tratar la causa como adjudicada por lectura, no
por ejecución.

---

## D. Safe-area RTL

### Los 3 archivos, con el patrón completo (no sólo las 2 líneas citadas)

**`drawer.css:177-191`**:
```css
.rottay-drawer--modern[data-part='surface'][data-placement='left']  { left: 0;  padding-left:  env(safe-area-inset-left, 0px); }
.rottay-drawer--modern[data-part='surface'][data-placement='right'] { right: 0; padding-right: env(safe-area-inset-right, 0px); }
.rottay-drawer--modern[data-part='surface'][data-placement='top']    { padding-block-start: env(safe-area-inset-top, 0px); }
.rottay-drawer--modern[data-part='surface'][data-placement='bottom'] { padding-block-end: env(safe-area-inset-bottom, 0px); }
```

**`sheet.css:175-194`** — con comentario propio explícito:
```css
/* Side panels: ... `data-placement` is physical by contract — see the SIDE note in the header. */
[data-placement='left']  { left: 0;  padding-left:  env(safe-area-inset-left, 0px); }
[data-placement='left']  { /* The flush edge is the PHYSICAL contract side ('left' is the screen
                              edge, not a logical one -- it must NOT mirror under RTL), so its
                              inset and safe-area pad stay physical (drawer.css's sanctioned idiom). */
                            left: 0; padding-left: env(safe-area-inset-left, 0px); }
[data-placement='right'] { right: 0; padding-right: env(safe-area-inset-right, 0px); }
```

**`overlay-modal.css:244-247`** — pads los 4 lados físicos por igual, sin condicionar a `placement`
(es un modal centrado/full-bleed, no anclado a un borde):
```css
padding-top: env(safe-area-inset-top, 0px);
padding-bottom: env(safe-area-inset-bottom, 0px);
padding-left: env(safe-area-inset-left, 0px);
padding-right: env(safe-area-inset-right, 0px);
```

### `data-placement` es físico por diseño, verificado en el componente, no sólo en el CSS

`Drawer/contracts/index.ts`: `DrawerPlacement` = `'left' | 'right' | 'top' | 'bottom'` (no existe
`'start'/'end'`). `Drawer/engines/modern/index.tsx:256-...` — el `switch(placement)` mapea
`case 'left': { left: 0, top: 0, ... }` / `case 'right': { right: 0, ... }` — posicionamiento
`position: fixed` con coordenadas FÍSICAS de viewport, sin ningún cálculo de `dir`. Un drawer
`placement='left'` está en el borde físico izquierdo tanto en LTR como en RTL — no hay remapeo a
`inline-start`/`inline-end` en ningún punto del componente.

**El mismo archivo demuestra que los autores SÍ saben distinguir lo lógico de lo físico cuando
corresponde** — 20 líneas más arriba, en el mismo `engines/modern/index.tsx:181-187`, el
compensado de scrollbar del body usa **`paddingInlineEnd`** (lógico) con el comentario: *"the
scrollbar sits on the inline-END edge in both LTR and RTL documents, so the compensation follows
direction instead of hardcoding the physical right side."* — o sea, en el mismo componente hay un
caso que SÍ debe ser lógico (scrollbar gutter, relativo al orden de lectura) y un caso que NO debe
serlo (posición del panel + su safe-area, relativo al borde físico del dispositivo), y el código
los trata correctamente distinto.

### El precedente `cascader.css:22-23` es un caso DISTINTO, no un precedente aplicable

`border-right` → `border-inline-end` ahí es el separador entre COLUMNAS de un cascader — su lado
correcto depende del ORDEN DE LECTURA de las columnas (la columna N y N+1 se leen en orden inverso
en RTL), un concepto inherentemente lógico. El safe-area de un panel anclado a un borde de
VIEWPORT depende de la geometría física del dispositivo (notch/home-indicator), que no se mueve
con `dir`. Son dos preguntas distintas — "¿en qué orden de lectura estoy?" vs "¿dónde está el
notch del hardware?" — y Cloud las trató como si fueran la misma pregunta.

### El escenario hipotético que el team-lead pidió descartar

*"¿Un drawer que se ancla a `inline-start` usa el inset del lado equivocado cuando en RTL queda
pegado al borde físico derecho?"* — No aplica: no existe ningún drawer/sheet/overlay-modal en este
árbol que se posicione con `inset-inline-start`/`inset-inline-end`. Los tres archivos usan
`data-placement` físico de punta a punta (`left`/`right`/`top`/`bottom`), consistente entre la
posición del panel (`left:0`/`right:0` en TSX) y su padding de safe-area (`padding-left`/
`padding-right` en CSS). No hay mismatch entre "cómo se posiciona" y "qué padding recibe" porque
ambos usan el MISMO sistema de coordenadas (físico) de punta a punta.

### Adjudicación

| Afirmación | Quién | Veredicto | Quién tenía razón |
|---|---|---|---|
| Swap de `env(safe-area-inset-left/right)` bajo `[dir='rtl']` en los 3 archivos | Cloud | **REFUTADA — no hay bug** | Codex, Kimi |
| Los insets son coordenadas físicas del viewport; el notch no se mueve con RTL | Codex, Kimi | **CONFIRMADA**, con evidencia de código adicional (comentario explícito en `sheet.css:172-176` que documenta esta misma regla como contrato deliberado, y el componente TSX que usa placement físico sin remapeo de `dir`) | Codex, Kimi |
| `cascader.css:22-23` es un precedente aplicable al mismo patrón | Cloud (implícito, al citarlo como precedente) | **REFUTADA** | El cascader resuelve un problema de orden de lectura (lógico), no de geometría de dispositivo (física) — casos no comparables |

**Veredicto final**: no hay defecto real en A/B/C de este ítem. El fix de Cloud, de ejecutarse,
introduciría una regresión: un drawer `placement='left'` (que sigue en el borde físico izquierdo
bajo RTL, verificado en el TSX) recibiría bajo `[dir='rtl']` el inset del lado DERECHO físico —
exactamente equivocado, porque el panel no se movió de lado.

### Fix correcto

Ninguno. **No ejecutar el swap `[dir='rtl']` en `drawer.css`, `sheet.css` ni `overlay-modal.css`.**
Si en el futuro se quisiera un drawer con placement lógico (`inline-start`/`inline-end`, que SÍ
cambiaría de borde físico bajo RTL), ese sería un cambio de producto nuevo (agregar valores al enum
`DrawerPlacement`, reescribir el `switch` de posicionamiento en el TSX a coordenadas lógicas
resueltas en runtime) — y sólo EN ESE escenario nuevo el swap de `env()` bajo `[dir='rtl']` tendría
sentido, porque recién ahí el borde físico donde queda el panel dependería de `dir`.

---

## Hallazgos nuevos que ninguno de los tres vio

1. **`sheet.css:172-176` ya documenta, en el código mismo, la regla que Cloud propuso violar** —
   "`data-placement` is physical by contract... it must NOT mirror under RTL... (drawer.css's
   sanctioned idiom)". Esto no es sólo evidencia de que el fix de Cloud está mal: es evidencia de
   que el equipo YA tuvo esta discusión y la resolvió, y lo dejó por escrito en el propio CSS. Ni
   Cloud, Codex ni Kimi citan este comentario — lo habrían visto si hubieran leído `sheet.css`
   completo en vez de sólo las 2 líneas del patrón `padding-left/right`.
2. **El patrón de fan-out correcto para el fix de A ya vive en el mismo compilador**
   (`chrome-variables/index.ts:1742-1746`), copia casi literal de lo que `appearance-posture` line
   150 necesitaría hacer. Ninguno de los tres localizó este hermano como plantilla del fix — todos
   proponen el fix "desde cero" (extender el enum, o cambiar el skin) en vez de señalar que el
   propio código base ya tiene la receta correcta escrita, un archivo más abajo.
3. **La etiqueta de texto que colapsa en la escena shell NO está dentro de PageShell** — es un
   `<Text>` hermano en el mismo `Stack` (`HeadersPatternsFbPageShellNoTabs`). Esto es evidencia
   adicional (no usada por ninguno de los tres) de que el colapso es de un tramo de contenedor
   flex/stack más amplio, no de un componente interno de PageShell — refuerza la lectura de Codex
   sin depender sólo de su afirmación.

## Lo que no pude cerrar

- **C (PageShell)**: la causa está adjudicada por lectura de CSS (containment + flex min-width:auto
  es un mecanismo real y bien documentado, y el patrón de código coincide exactamente), pero no la
  reproduje en browser — prohibido por las reglas del cluster. Falta la regresión Playwright descrita
  arriba para pasar de "causa adjudicada por lectura" a "causa confirmada por ejecución".
- **B (elevación)**: no re-derivé yo mismo el ladder de 6 niveles con inset+glow que A atribuye a
  rottay (`facade/artifacts/rottay/index.css`); lo doy por bueno por la cita de A pero no lo verifiqué
  con mis propios comandos en este cluster.
- No verifiqué si existen OTROS componentes fuera de estos 3 archivos (drawer/sheet/overlay-modal)
  que sí usen `inset-inline-start`/`inset-inline-end` para posicionarse Y además paded con
  `env(safe-area-inset-left/right)` físico sin condicionar — ese sí sería el bug real que el
  team-lead planteó como hipótesis, y no lo encontré, pero tampoco hice un grep exhaustivo de TODO
  `src/**/*.css` para `inset-inline` combinado con `env(safe-area` en el mismo selector; sólo miré
  los 3 archivos que Cloud señaló.

---

git status --short (final): `?? docs/reauditoria-cloud/` (sin cambios propios; los 2 archivos
modificados ajenos de boundaries-gate ya no aparecen modificados — comiteados por otro proceso
durante mi trabajo, no por mí).
