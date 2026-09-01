# C — Cascada y censo de hardcodes — 10 ópticas

Alcance base salvo indicación contraria: `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/**/*.css` (123 archivos). Todos los comandos corridos read-only desde `/Users/daniel/Developer/Rottay/ui-design-system/packages/core`. Metodología: comentarios `/* */` siempre stripeados antes de censar código; todo censo tiene control positivo (una carpeta hermana donde SÉ que el patrón existe, para probar que el parser no está ciego).

**Re-verificación de método (pedido del team-lead 2026-08-28)**: en este entorno `grep` es una función shell sobre `ugrep`; re-corrí con `find <dir> -name '*.css'/'*.tsx' -print0 | xargs -0 grep ...` las cifras que originalmente usaron `grep -r --include=`. Resultado: **sin cambio** en H-C-5 (44px: 166 líneas bare, 77 archivos con `touch-target-min` — corrijo el "~75" original a la cifra exacta 77 —, 13 líneas `4.5rem`), en la óptica 27 (755 archivos / 5219 ocurrencias `style={` en todo `src/ui`; 124 archivos / 370 ocurrencias en `engines/modern`) y en la óptica 29 (`app-platform/next.config.ts` sigue siendo el único hit para `styles/modern` en todo el monorepo). El control positivo de `--ds-envtoggle-accent` (H-C-1) también reconcilió exacto y agrego que un grep de la forma declarativa exacta (`--ds-envtoggle-accent\s*:`) sobre todo `foundation/` con `find|xargs` da CERO — confirma la ausencia de declaración de forma más estricta que el grep original. **Sí hubo una discrepancia real**: el censo de custom-props seteadas desde TSX (óptica 28, texto "0 matches para una muestra de 3 nombres") estaba mal citado — ver corrección en H-C-2 abajo; no cambia la conclusión pero corrijo la cifra exacta.

## Puntaje por óptica

| # | Óptica | Puntaje 0-5 | Evidencia (1 línea) |
|---|---|---|---|
| 21 | Hex literales por rol en skins modern | **5** | 0 hex en código real (16 hits son `#000` en `mask-image` alpha, no color); control positivo: rustic/skin=303, presentation/components/skin=89 |
| 22 | rgba/hsl/oklch literales en skins modern | **5** | 0 en código; 10 sólo en comentarios |
| 23 | px/rem literales por rol | **3** | 1569 lecturas "bare" (fuera de `var()`) pero mayoría geometría legítima; hallazgo real: floor `44px` tokenizado en ~40 archivos y bare sin canal en ~20 |
| 24 | Canales huérfanos (`--ds-*` sin camino a raíz) | **2** | gate propio en vivo: 2169/4373 (49.6%) sin camino a raíz; de esos, 840 (38.7%) sin fallback alguno (falla silenciosa) y 1329 (61.3%) con literal de último recurso; top fan-out `--ds-elevation-surface-3` (36x, sin fallback) |
| 25 | Profundidad de cadena de fallback | **3** | 74% depth-0, sólo 31% de las 10556 lecturas top-level terminan en un literal; 69% no tiene red de literal alguna |
| 26 | Duplicación presentation/components/skin vs engines/modern/skin | **4** | sólo 4/123 basenames colisionan; en los 4, selectores son namespaces DISJUNTOS → 0 doble-emisores reales |
| 27 | Inline `style=` en TSX engine modern | **4** | 0 blocks con hex/rgb/hsl literal (135 archivos); pero uso bruto de `style=` es 370 ocurrencias en 124/135 archivos, no "un dígito" si se lee como superficie de uso |
| 28 | Namespace `--_ds-*` | **2** | bundle=389 (reconcilia); 196/380 (51.6%) nombres se LEEN pero nunca se DECLARAN ni se setean desde TSX en todo el repo; 0 leakage a apps |
| 29 | Rustic/classic → modern leakage + `styles/modern.css` | **4** | 0 leakage real de canales rustic; `styles/modern.css` (Tailwind base) ya vive DENTRO de cada bundle vertical y no tiene importadores reales — export público muerto |
| 30 | Brand-themes TS "mirror" (F4A) | **2** | roster de 12 secciones idéntico en los 3, pero evnto tiene 346 key-assignments vs rottay 1707/bithire 1510; `#2A2A2F` se repite 70x como string literal en 8+ keypaths distintos de rottay |

## Hallazgos (ordenados por severidad)

### H-C-1 · BLOQUEANTE · Casi la mitad de los canales `--ds-<componente>-<canal>` no tiene camino a raíz

- Qué: el gate propio del programa (`scripts/engine/cascade-wiring-ratchet/index.mjs`), corrido en vivo, reporta 2169 de 4373 nombres (49.6%) sin fallback que alcance ninguna raíz/tema, sobre 391 archivos de skin (corpus completo, no sólo modern). El script implementa exactamente la ley de ARCHITECTURE §1.6 (fallback encadenado hasta raíz) con un walker que balancea paréntesis y excluye raíces/rampas del denominador — no es un censo naive.
- Evidencia:
  ```
  $ node scripts/engine/cascade-wiring-ratchet/index.mjs
  cascade-wiring-ratchet OK -- 2169 names still unwired of 4373 (2204 reach a root;
  769 roots/ramps excluded from the denominator; 391 skin files)
  ```
  Control positivo manual: `--ds-envtoggle-accent` se LEE 10 veces en `runtime/engines/modern/skin/environment-toggle.css:59,73,133,137,155,159,189,190,196,203` y otras 7 en el rustic equivalente, pero no tiene NINGUNA declaración `--ds-envtoggle-accent:` en ningún `.css` del repo (re-verificado con `find foundation -name '*.css' -print0 | xargs -0 grep -nE -- "--ds-envtoggle-accent\s*:"` → 0 matches) — se alimenta sólo desde JS (`activeEnv.color`) sin canal de fallback CSS. El propio baseline (`cascade-wiring-ratchet.baseline.json`) documenta que el gate SÍ puede drenar (bajó de 2171→2169 en la ola F3 2026-08-27) pero también admite que `rootsExcluded` tiene una nota de "reconstrucción diferida a PRE_F4B" — el clasificador de raíz-legítima-vs-raíz-posicional todavía no es completo.
- **Desglose de los 2169 (pedido de re-verificación 2026-08-28)**: importé `classifyCascadeWiring` del propio script vía `node -e` (sin tocar el gate) y crucé cada nombre-deuda contra todas sus ocurrencias en el corpus para separar "nunca tiene fallback" de "tiene fallback pero ninguno alcanza raíz":
  ```
  TOTAL debt names: 2169
  sin fallback en NINGUNA ocurrencia (var(--x) pelado en todos los sitios): 840  (38.7%)
  con fallback en AL MENOS una ocurrencia (literal u otra ref. no-raíz):   1329 (61.3%)

  TOP 10 por fan-out (ocurrencias en el corpus):
    36  --ds-elevation-surface-3      fallback=no
    27  --ds-motion-intensity         fallback=yes
    24  --ds-divider-width            fallback=yes
    23  --ds-state-press-scale        fallback=no
    23  --ds-color-primary-600        fallback=no
    23  --ds-divider-style            fallback=yes
    22  --ds-numeric-tabular          fallback=yes
    22  --ds-slider-thumb-size        fallback=yes
    21  --ds-disabled-opacity         fallback=yes
    19  --ds-stepper-current-item-size fallback=no
  ```
  Es decir: para el 38.7% de la deuda, si el nombre nunca se declara en ningún lado, la propiedad cae directo a `unset`/heredado (falla silenciosa, cero pintura). Para el 61.3% restante SÍ hay un literal de último recurso en al menos un sitio de lectura, así que el navegador no queda en blanco — pero ese literal es exactamente el "hardcode que gana si falla el tenant" de la óptica 25, y aquí el gate confirma que NINGUNA de sus ocurrencias tiene un segundo nivel `var(--ds-...)` detrás. `--ds-color-primary-600` en el top-10 (23 ocurrencias, sin fallback en ninguna) es la más llamativa: por nombre debería ser un token de escala de paleta, no un canal de componente huérfano — candidato a revisar primero, junto con `--ds-elevation-surface-3` (36 ocurrencias, el de mayor fan-out del corpus completo).
- Impacto en el objetivo del owner: "cero hardcodeado; si hay un hardcode, sólo afecta a esa primitiva" — un canal huérfano es funcionalmente PEOR que un hardcode declarado: no hay ningún punto en la cascada donde un tenant (DB o estático) pueda intervenir ese valor. La mitad de la superficie de pintura de componente queda fuera del alcance de la customización, silenciosamente.
- Optimización concreta: usar el propio `cascade-wiring-ratchet` como mapa de trabajo (ya emite por nombre) y bajar la deuda por lotes cerrando primero los canales de mayor fan-out (contar cuántas declaraciones usan cada nombre huérfano); cerrar primero el bloqueo documentado en `rootsExcludedNote` (clasificador raíz-legítima vs raíz-posicional) porque bloquea la entrada a F4B.

### H-C-2 · ALTO · Más de la mitad del namespace privado `--_ds-*` no tiene productor

- Qué: de 380 nombres `--_ds-*` distintos tocados en `src/**/*.css`, 196 (51.6%) se consumen vía `var(--_ds-x)` pero jamás se declaran (`--_ds-x: ...;`) en ningún `.css` del repo, y tampoco se SETEAN como custom-property inline desde ningún componente `.tsx`/`.ts` de producción.
- **Corrección tras re-verificación con `find|xargs` (2026-08-28)**: mi grep original (`--include="*.tsx" --include="*.ts"`) filtró mal y devolvió falsos positivos de `.json`/`.css` — al repetir con `find . \( -name '*.tsx' -o -name '*.ts' \) -print0 | xargs -0 grep -l` para una muestra de 3 nombres (`_ds-activity-log-dot-fill`, `_ds-badge-specular`, `_ds-bottom-tab-bar-pill-bg`) aparecen 2 archivos, no 0: `src/ui/primitives/display/Badge/tests/Badge.i18n.test.tsx:131` y `Badge.pass1-premium.test.tsx:294`. Inspeccionados: ninguno SETEA la custom-property — son asserts de string sobre el CSS compilado (`expect(modernSkin).toContain('--_ds-badge-specular, ...')`, `expect(skin.match(/--_ds-badge-specular/g)?.length).toBe(3)`). Mismo patrón para el diff en el censo agregado de la óptica 28 (45 vs 44 nombres únicos de custom-prop entre `grep --include` y `find|xargs`): el nombre de más (`--_ds-dashboard-panel-block-size`) resultó estar en un `.ts` (`DashboardInsightsPanelCapacity.contract.test.ts:37`, `const PANEL_SIZE_SEAM = '--_ds-dashboard-panel-block-size'`) que el `--include="*.tsx"` NO debería haber capturado pero capturó — mismo patrón: constante de assert, no productor. **Conclusión sin cambio**: cero productores reales en TSX/TS de producción; sí corrijo "0 matches" por "0 productores, 2 archivos de test que sólo assertan el nombre como string contra el CSS compilado" — más preciso, mismo veredicto.
- Evidencia: `foundation/tokens/css/runtime/engines/modern/skin/activity-log.css` lee `var(--_ds-activity-log-dot-fill)` sin declaración en ningún lado del árbol fuente. El conteo del bundle (`grep -c` sobre `styles/rottay.css`) reconcilia exacto con el número que trae el contexto compartido: 389.
  ```
  $ python3 -c "... declared=184 consumed=378 union=380 ..."
  declared but NEVER consumed: 2 (--_ds-markdown-task-fill, --_ds-markdown-task-fill-ring)
  consumed but NEVER declared: 196
  ```
- Impacto en el objetivo del owner: el namespace `--_ds-*` se declara "privado gobernado" — la ley espera productor+consumidor pareados. Con más de la mitad sin productor, en runtime esas propiedades son `unset` (CSS no las puede resolver a nada, ni literal ni heredado explícito) — el navegador cae al valor inicial/heredado de la propiedad host, un comportamiento indistinguible de un bug para quien debuggea.
- Lo bueno (ver abajo): cero fuga hacia las apps — ninguna de las 3 verticales lee o escribe `--_ds-*` desde su propio `src`, así que al menos el namespace no se volvió una superficie pública de facto.
- Optimización concreta: correr el mismo censo productor/consumidor como gate (no existe hoy uno dedicado a `--_ds-*`; `cascade-wiring-ratchet` mide `--ds-*` público). Para cada uno de los 196, decidir explícitamente: declararlo en el `theme.css`/skin correspondiente, o borrar la lectura si es vestigial.

### H-C-3 · ALTO · Los brand-themes TS restatean el mismo hex como string literal en decenas de keypaths, en vez de referenciar una decisión

- Qué: `foundation/tokens/ts/presentation/brand-themes/rottay/index.ts` declara en su propio header que "el objeto exportado... referencia las decisiones" (no las reafirma). En la práctica, los 5 hex más usados en rottay se restatean como STRING LITERAL (no como referencia a una constante) en decenas de sitios: `#2A2A2F` en 70 líneas / 8+ keypaths distintos (`interactiveBgActiveColor`, `borderColor`, `borderColorDefault`, `defaultBg`, `secondaryBg`, `dividerColor`, ...), `#FFFFFF` en 63, `#ECECEC` en 57, `#6B6B72` en 44, `#F4F4F3` en 37. En total 45 valores hex distintos se repiten en 2+ keypaths en rottay (44 en bithire, 20 en evnto, proporcional a su tamaño).
- Evidencia:
  ```
  $ grep -in "'#2a2a2f'" rottay/index.ts | head -8
  3562:  interactiveBgActiveColor: '#2A2A2F',
  3592:    borderColor: '#2A2A2F',
  3593:    borderColorDefault: '#2A2A2F',
  3904:    borderColor: '#2A2A2F',
  3914:    defaultBg: '#2A2A2F',
  3934:    secondaryBg: '#2A2A2F',
  4491:    dividerColor: '#2A2A2F',
  4807:    borderColor: '#2A2A2F',
  $ grep -icn "'#2a2a2f'" rottay/index.ts   →  70
  ```
  Metodología: regex sólo cuenta `identifier: '#hex'` (comillas obligatorias), así que por construcción excluye cualquier caso donde el archivo SÍ use una referencia simbólica (`key: SOME_CONST`) — el resultado son literales de verdad, no falsos positivos de una referencia bien hecha.
- Impacto en el objetivo del owner: contradice directamente la ley de hardcodes F4A citada en el contexto compartido ("un leaf que re-expresa [un seed] debe derivar"). Si mañana cambia el seed gris de rottay, hay que tocar 70 líneas a mano en vez de una constante — y cualquiera de esas 70 puede quedar desincronizada.
- Optimización concreta: extraer un mapa `NEUTRAL_900 = '#2A2A2F'` (y equivalentes para los otros 4-5 valores más repetidos) en el bloque de AUTHORED DECISIONS, y que el skeleton referencie la constante. Esto es exactamente lo que el propio comentario del archivo dice que YA debería pasar.

### H-C-4 · MEDIO · `evnto` no es un mirror real de bithire/rottay en densidad de decisiones, sólo en estructura

- Qué: los 3 brand-themes comparten el mismo roster de 12 secciones (`diff` de headers = vacío), pero `evnto/index.ts` tiene 5003 líneas / 346 asignaciones `key:` contra 9366/1707 en rottay y 9310/1510 en bithire — evnto autoriza ~20-23% de las decisiones que autorizan los otros dos. Consistente con el conteo de marcadores "placeholder": evnto=638, rottay=406, bithire=399.
- Evidencia:
  ```
  rottay: lines=9366 key-assignments~=1707 hex-literals=916 unique-hex=89
  bithire: lines=9310 key-assignments~=1510 hex-literals=573 unique-hex=191
  evnto:   lines=5003 key-assignments~=346  hex-literals=185 unique-hex=103
  ```
- Impacto en el objetivo del owner: "dos tenants deben parecer proyectos totalmente diferentes" — si evnto autoriza 5x menos decisiones que rottay/bithire, gran parte de su render cae en placeholder/fallback compartido, lo que reduce la diferenciación visual real precisamente en el tenant que el owner usa como ejemplo de "estático desde archivo de vertical".
- Optimización concreta: usar el propio conteo de marcadores "placeholder" por sección como backlog de F4C (art direction premium) para evnto específicamente, en vez de tratar los 3 themes como igualmente maduros.

### H-C-5 · MEDIO · `44px` (floor de touch-target a11y) tokenizado en ~40 archivos pero bare sin canal en ~15-20

- Qué: el "physical 44px floor" (WCAG 2.5.5, deliberadamente NUNCA escalado por densidad, según los propios comentarios del código) se expresa de dos formas incompatibles: (a) `var(--ds-<component>-touch-target, 44px)` — tokenizado, un tenant/override puede cambiarlo — en decenas de archivos (`toast.css:378`, `sheet.css:357-358`, `dropdown.css:694`, `select.css:205`, `carousel.css:175-176`, `back-top.css:55-56`, `pagination.css:94`, etc.); (b) literal bare sin ningún canal, ej. `back-top.css:94-95` (`min-inline-size: 44px; min-block-size: 44px;`), `column-settings.css:201,205-206`, `calendar.css:286-287`, `tabs.css:852-853`, `command-palette.css:273`, `shortcuts-overlay.css:181-182`, `layout.css:252`.
- Evidencia: `grep -rn "44px" --include="*.css" .` sobre modern/skin da ~110 líneas; cruzando contra `grep -rl "touch-target-min"` (75 archivos con el canal declarado) quedan ~15 archivos donde el mismo floor se escribe bare, sin token intermedio.
- Impacto: es un caso de "hardcode legítimo en el punto correcto" (constante física, no de marca) que el propio código documenta como ley absoluta — no es un defecto de fidelidad de marca. Pero rompe la promesa de "un hardcode sólo afecta a esa primitiva": en los ~15 archivos bare, si algún día se necesita ajustar el floor por primitiva (p.ej. un modo compacto especial), no hay canal para hacerlo sin tocar CSS.
- Optimización concreta: no es urgente (no es un defecto de marca), pero para consistencia arquitectónica valdría envolver los ~15 casos bare en `var(--ds-<component>-touch-target-min, 44px)` como el resto, aunque el valor por defecto siga siendo el mismo.

### H-C-6 · BAJO · `styles/modern.css` (Tailwind base layer) es export público sin importadores reales

- Qué: `styles/modern.css` (954 líneas fuente / ~24KB, contenido = Tailwind v4 preflight envuelto en `@layer rottay-framework`) ya está DUPLICADO dentro de cada bundle vertical (`grep -c "@layer rottay-framework" styles/{bithire,rottay,evnto}.css` = 1 cada uno). Ninguna de las 3 apps consumidoras importa `@rottay/design-system/styles/modern` en su código fuente real — el único hit en todo el monorepo es un alias defensivo de webpack en `app-platform/next.config.ts:58` que en sí mismo no se referencia desde ningún import real de app-platform (que importa `dist/platform.css` directo).
- Evidencia:
  ```
  $ grep -rln "design-system/styles/modern\b" . | grep -v node_modules
  app-platform/next.config.ts        # sólo el alias, no un import real
  $ grep -c "@layer rottay-framework" styles/bithire.css styles/rottay.css styles/evnto.css
  styles/bithire.css:1
  styles/rottay.css:1
  styles/evnto.css:1
  ```
- Impacto: bajo (no rompe nada), pero es superficie pública muerta que alguien puede terminar importando por error pensando que es necesaria además del bundle vertical (duplicaría 24KB de reset).
- Optimización concreta: documentar en el `package.json`/README que `styles/modern` es legado o eliminarlo del mapa de exports si nada lo necesita.

## Lo que está bien (breve, con evidencia)

- **Cero hardcode de color en código real dentro de `runtime/engines/modern/skin`** (ópticas 21-22): sobre 123 archivos / 52327 líneas, 0 declaraciones `property: #hex` o `rgba()/hsl()/oklch()` fuera de comentarios; los únicos 16 hex de código son `#000` dentro de `mask-image: linear-gradient(...)` (alpha de máscara, no color) — contraste fuerte con rustic/skin (303 hex de código) y presentation/components/skin (89), que confirma que el parser SÍ detecta hardcodes cuando existen.
- **Cero fuga del namespace privado `--_ds-*` hacia las apps** (óptica 28): `grep -rl -- "--_ds-" app-bithire/src app-evnto/src app-platform/src` = 0 en las 3.
- **Cero literal de color dentro de `style={}` en TSX de engines/modern** (óptica 27): sobre 369 bloques `style={}` en 135 archivos, ninguno contiene un hex/rgb/hsl/oklch literal — todo lo "paint-adjacent" que aparece es dato de instancia (color de un marker, swatch de preview de un campo de color, contraste calculado de Avatar) o inyección de custom-property (`ColorPicker` seteando `--ds-colorpicker-swatch-color` vía `style`, que es el patrón correcto, no una violación).
- **Sin leakage real de rustic/classic hacia modern** (óptica 29): la única mención de "rustic" en un `.css` de `runtime/engines/modern` es un comentario (`stats-grid.css:8`), no una referencia de canal viva.
- **El roster estructural de los 3 brand-themes SÍ es idéntico** (óptica 30): 12 encabezados de sección, mismo orden, mismo texto, en los 3 archivos — el defecto está en la densidad de contenido y en la repetición de literales, no en la forma.

## Preguntas que no pude cerrar (y qué haría falta)

- No corrí `csssource:check`/`cascade-ratchet:check`/`root-exposure:check` sobre el árbol completo con `--verbose` para obtener el listado NOMBRE por NOMBRE de los 2169 huérfanos (el script sólo imprime el agregado en modo normal); haría falta leer `scripts/engine/cascade-wiring-ratchet/index.mjs` más a fondo o agregar un modo de dump para producir ese listado y prioritizarlo por fan-out real.
- No pude confirmar con certeza por qué el bundle tiene 389 nombres `--_ds-*` contra 380 en el árbol fuente (diferencia de 9) — podría ser generación adicional en el paso de build o algún archivo fuente que mi glob no capturó (p.ej. `foundation/responsive/*` fuera de `tokens/css`); un `git grep` sobre `dist/` o el script de build resolvería la diferencia exacta.
- No verifiqué el resto de los ~1600 `px`/`rem` bare property-by-property con el mismo nivel de detalle que a `44px`/`4.5rem` (revisé sólo los top-15 archivos y las propiedades de mayor señal); un barrido exhaustivo por familia de componente excede el tiempo de este brazo.
