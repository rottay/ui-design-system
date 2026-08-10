# Roadmap — el sistema de tenants, paso por paso

Documento de acuerdo. Nada se toca hasta que las dos partes estén conformes con la PARTE 1.

Todo acá está derivado del **código**, no de documentación. Los conteos se obtuvieron bundleando
los módulos reales y recorriendo los objetos, o corriendo el censo. Donde no pude verificar algo,
lo digo en vez de inferirlo.

---

# PARTE 1 — EL MODELO (lo que hay que acordar)

## 1.1 Tres verticales estáticos, y tenants por base de datos sólo en dos

| vertical | archivo fuente (código) | artefacto generado | selector |
|---|---|---|---|
| BitHire | `brand-themes/bithire/index.ts` | `artifacts/bithire/index.css` | `html[data-tenant='bithire']` |
| Evnto | `brand-themes/evnto/index.ts` | `artifacts/evnto/index.css` | `html[data-tenant='evnto']` |
| Rottay | `brand-themes/platform/index.ts` | `artifacts/rottay/index.css` | `html[data-tenant='rottay']` |

**Rottay y Platform son el mismo vertical**: `slug: 'rottay'`, `verticalKey: 'platform'`. La
asimetría de nombres es histórica, no un defecto.

**The Management** es un tenant de **base de datos** del vertical **bithire**
(`slug: 'themanagement'`, `verticalKey: 'bithire'`, `mode: 'advanced'`).

**Rottay no aloja tenants de base de datos, y es intencional.** No tiene envelope registrado, así
que `compileTenantThemeConfig` falla cerrado para él. `app-platform` es el **editor** de los tenants
de bithire y evnto, no un host de tenants propios.

## 1.2 La secuencia exacta — al construir (los tres verticales)

```
1. brand-themes/{bithire,evnto,platform}/index.ts     código versionado, la FUENTE de verdad
2. _source/extension.css                              CSS a mano, con cabeceras @ds-exception
3. build-vertical-artifacts.mjs                       compileBrandTheme() + fusiona la extensión
4. artifacts/{bithire,evnto,rottay}/index.css         PRODUCTO DE BUILD — nunca editar a mano
5. selector html[data-tenant='X']                     especificidad (0,1,1)
```

El artefacto lleva `/* GENERATED — do not edit */` y hay tres gates bloqueantes que lo protegen de
ediciones a mano.

## 1.3 La secuencia exacta — al crear un tenant (base de datos)

```
 1. TenantThemeDocument (JSONB)          lo que el cliente persiste
                                          identidad (tenantId/slug/verticalKey/rowVersion) NO es
                                          escribible: son columnas de fila, de confianza
 2. parseTenantThemeConfig()             valida contra el esquema cerrado
                                          clave desconocida → unknown_key (rechazo)
                                          valor peligroso → unsafe_value (bloquea calc/min/max/clamp)
 3. getTenantThemeVerticalEnvelope()      resuelve la política del vertical
                                          NO REGISTRADO → EXCEPCIÓN, falla cerrado
 4. validateAgainstVerticalEnvelope()     aplica los rangos
                                          FUERA DE RANGO = RECHAZO, no recorte
 5. resolveExpressiveAxes()               ejes expresivos + expansión de perfiles
 6. compileAppearanceVariables()          autocorrección APCA de contraste
 7. validaciones fail-closed              experience / recipe / responsive profile
 8. límites duros                         512 variables compiladas · 90.112 bytes
 9. buildScopes()                         [data-ds-root][data-vertical="bithire"]
                                                     [data-tenant][data-tenant="themanagement"]
10. digest sha256                         → TenantThemeArtifact { variables, css, scopes }
```

## 1.4 La cascada — la ley del sistema

**No hay `@layer` en ningún artefacto.** Todo se resuelve por peso de selector:

```
(0,4,0)   bloque del tenant DB            ← gana sobre todo, siempre
(0,3,1)   artefacto vertical, claro
(0,2,1)   artefacto vertical, oscuro
(0,1,1)   artefacto vertical, base
(0,1,0)   :root  →  default.css + base/*.css  =  el canon del DS
```

**Consecuencia que hay que tener presente en todo el trabajo:** el tenant DB nunca pierde una pelea
de especificidad. Cuando un dial suyo no llega a la pantalla, la causa es **siempre** la misma: el
token *derivado* está declarado plano en un artefacto vertical, por encima del sitio donde ocurre
la derivación. Ese es el defecto de `radiusScale`, y es el canon inerte a escala.

## 1.5 Lo que va por BASE DE DATOS

| modo | hojas escribibles |
|---|---:|
| `simple` → `appearance` | **36** (paleta 21, tipografía 4, forma 2, densidad 1, ritmo 1, motion 3, superficies 2, navegación 1, perfil 1) |
| `advanced` → `visualFoundation` | **1.804** (general 36 + chrome 1.465 en 22 familias + tokenOverrides 294 + profiles 7 + posture 1 + recipe 1) |

**Límites duros, todos aplicados en el compilador:** documento 65.536 B · profundidad 10 · 512
campos de objeto · **200 tokenOverrides como máximo de 294 posibles** · **512 variables
compiladas** · 90.112 bytes compilados.

**Rangos del envelope** (fuera de rango = rechazo):

| dial | bithire | evnto |
|---|---|---|
| typeScale | 0.92–1.08 | 0.92–1.08 |
| radiusScale | 0.8–1.2 | 0.8–1.2 |
| densityScale | 0.85–1.15 | 0.85–1.15 |
| motionDurationScale | 0.75–1.35 | 0.75–1.35 |
| motionIntensity | 0–0.8 | 0–0.8 |
| effectIntensity | 0–**0.65** | 0–**0.75** |

**Prohibido a un tenant:** rawCss, selectores, motor, pack de componentes, topología, permisos,
mapeos semánticos, glifos de iconos, contenedores de iconos, recetas de motion, renderer de charts,
semántica de datos de charts.

## 1.6 Lo que va por ARCHIVO ESTÁTICO

| vertical | hojas escritas | variables CSS compiladas | hojas de chrome | modes.dark |
|---|---:|---:|---:|---:|
| bithire | 1.014 | 1.050 | 673 | 181 |
| rottay | 677 | 505 | 254 | 280 |
| evnto | 300 | 363 | 112 | 116 |

**Lo que un tenant DB NO puede expresar nunca** (sólo el vertical estático):

- `modes.dark` completo — el tenant sólo obtiene `palette.dark` (10 hojas) + `backgroundMode`
- 10 de 13 campos de `motion` — entrance, hoverLift/Scale, spring*, stagger*, pulseSpeed,
  skeletonStyle, countUpEnabled
- `charts` (7 campos)
- `chrome.card` y `chrome.accent` — el BrandTheme tiene 24 familias, el contrato de tenant 22
- `engineBridge`, `typography.headingWeightBias/labelStyle`, `appearance.defaultMode`,
  `shell.gridOpacity`

**Y a la inversa — lo que sólo puede el tenant DB:** la **anatomía** (4 familias × 3 variantes no
default). Ni siquiera es un campo del BrandTheme. Los verticales estáticos no pueden setearla.

## 1.7 El solapamiento, y quién gana

**El chrome se solapa al 100%: los dos lados llaman a la MISMA función `chromeToVariables`.** El
BrandTheme de bithire emite 667 variables de chrome, y **las 667 son alcanzables desde base de
datos**. El vocabulario estático es un **subconjunto estricto** del de DB.

`tokenOverrides`: de los 294 tokens, **191 también los emite el BrandTheme compilado de bithire**
(disputados) y 103 no. La intersección entre variables de chrome y tokens de override es **cero** —
son canales disjuntos.

**Gana la base de datos**, por tres mecanismos independientes: especificidad (0,4,0 vs 0,3,1, sin
depender del orden), orden de merge (`DS base → vertical → BrandTheme → Appearance General →
Appearance Advanced`), y cobertura (`TENANT_THEME_V1_COVERAGE` obliga a los emisores de runtime a
callarse en los canales que el artefacto ya posee).

## 1.8 Los tipos de token — nueve capas, no cinco

Alcance de todos los números: `packages/core/src` solamente (3.811 archivos). **Todos los conteos de
lectura son internos al DS** — no se escanearon las apps, así que un cero significa "cero dentro de
core", nunca "muerto".

| # | Capa | nombres | sitios decl. | lecturas | declarada en |
|---|---|---:|---:|---:|---|
| 1 | Rampas crudas | 594 | 699 | 715 | `tokens/css/foundation/base/*` (6 archivos) |
| 2 | Canales semánticos de rol | 1.075 | 1.124 | 599 | **UN archivo**: `foundation/themes/default.css` |
| 3 | Canales por componente | 1.949 | 2.191 | 2.613 | `presentation/components/*.css` (28) |
| 4 | Canales de skin de familia | 124 | 331 | 7.820 | `presentation/components/skin/*.css` (30) |
| 5 | Canales de skin de motor | 214 modern / 4 rustic | 652 / 15 | 14.656 / 2.885 | `runtime/engines/*/skin/*.css` (54 / 3) |
| 6 | Artefactos verticales generados | 1.910 (577 exclusivos) | 5.406 | 1.088 | `facade/artifacts/*` (6) |
| 7 | Privados `--_ds-*` | 147 decl / 323 leídos | 500 | 658 | 266 presentation, 207 runtime |
| 8 | Proyección a framework | 28 | 28 | **0** | `engines/modern/framework-token-projection.css` |
| 9 | Canales TS de runtime | ~356 | 677 | 2.236 | `tokens/ts/`, `ui/**`, `infrastructure/**` |

Tres precisiones que importan:

- **Crudo y semántico no se separan por carpeta**: los dos viven bajo `foundation/`. Lo que los
  separa es que `themes/default.css` sola carga **1.075 nombres en una hoja**.
- **Las capas 4 y 5 son distintas, y la 5 AUTORA**: **182 de los 214 nombres del skin de modern no
  se declaran en ningún otro lado**. La lane del motor no sobreescribe canales — crea canales
  nuevos, y sin guarda.
- **La capa 8 es vocabulario DaisyUI sin prefijo** (`--radius-field`, `--color-*`, `--size-*`), 28
  nombres, cada valor exactamente un `var(--ds-*)`, cero literales — y **cero lecturas**. Existe una
  décima clase huérfana: 87 `--duration-*`/`--easing-*`/`--delay-*` sin prefijo, también sin lecturas.

**Quién puede escribir cada capa:**

| capa | tenant (DB) | lane de familia | generada |
|---|---|---|---|
| 1, 2 | sólo vía la lista cerrada de overrides | sí (CSS plano) | no |
| **3, 4, 5** | **no vía `tokenOverrides`** | **sí, sin guarda** | no |
| 6 | **sí — ésta es la salida del tenant** | no | sí |
| 7, 8, 9 | no | sí | no |

**Matiz importante:** `tokenOverrides` son 294 nombres cerrados, pero el **chrome es una superficie
de escritura mucho más ancha**. `chrome-variables/index.ts` convierte los objetos de chrome en
nombres `--ds-*` y **alcanza canales de las capas 3 y 4**. Así que el tenant sí llega a canales de
componente — por chrome, no por overrides.

## 1.9 Las familias NO son propiedad. Son una convención de nombres.

Esto estaba en duda y quedó resuelto, con números:

- Sobre las **223 unidades de componente con ≥30 lecturas**: media de **30,3 familias distintas
  leídas por unidad**; mediana de participación de la familia propia: **11%**.
- **72 unidades (32%) leen CERO tokens de su propia familia de nombre.**
- De las 81 familias con ≥40 lecturas de componente, **50 (62%) tienen 0%** de lecturas desde un
  componente del mismo nombre.

Ejemplos en las dos direcciones:

- `skin/data-table.css` hace 614 lecturas sobre **78 familias** y **cero** `--ds-data-table-*`.
- `comp:patterns` hace 942 lecturas sobre 85 familias, 0% propias.
- `--ds-surface-panel`: 207 lecturas repartidas en 65 unidades, ninguna propia.

Incluso la minoría que sí funciona está mal nombrada: `--ds-sidebar-item-*` lo lee `skin/menu.css`.

> **`tokens-catalog.mjs` reporta una propiedad de string, no una estructura.** La pertenencia a
> familia se decide partiendo el nombre por guiones. Un token mal nombrado aterriza en una familia
> plausible y **parece gobernado sin estarlo**.

## 1.10 La profundidad de cadena es bimodal, y el 65% termina en literal

20.144 lecturas `var()` sobre propiedades pintadas:

| grafo | p50 | p90 | máx | termina en literal |
|---|---:|---:|---:|---|
| sólo autorado | 0 | 3 | 5 | **13.195 de 20.144 (65%)** |
| con artefactos generados | 0 | 2 | 4 | 16.517 |

**No hay gradación: el 76% de las lecturas pintadas golpea un literal a profundidad 0.** La cola
—1.928 lecturas a profundidad ≥3— es donde realmente se alcanzan las rampas.

**Y el artefacto generado APLANA el sistema**: redeclara 1.910 nombres como literales (4.711 de sus
5.406 valores son literales), baja la profundidad máxima de 5 a 4, y convierte 3.300 terminales de
runtime-TS en literales. Es el mismo mecanismo del dial de radio, medido a escala de sistema.

**4.739 lecturas nombran algo que core nunca declara** — 1.867 con fallback literal, 2.375 con
fallback `var()`, y **497 sin ningún fallback**: no pintan nada salvo que una app lo declare.
Caso extremo: `--ds-density-*` tiene 46 nombres y **sólo 7 declarados**; los otros 39, incluida la
escalera `--ds-density-spacing-*` entera, viven enteramente de fallbacks.

## 1.11 Coherencia de nombres — lo peor

| # | Ruptura | cantidad |
|---|---|---|
| 1 | **Permutaciones de orden de palabras del mismo conjunto de segmentos** | **100 grupos / 202 nombres** (`--ds-card-shadow-hover` ~ `--ds-shadow-card-hover` ~ `--ds-hover-card-shadow`) |
| 2 | `bg` vs `background` ambos en servicio | 780 vs 81 |
| 3 | Posición de la palabra de estado | 625 al final vs **389 en el medio** |
| 4 | Singular/plural en el primer segmento | `--ds-tab-*` 6 vs `--ds-tabs-*` 123 |
| 5 | Un prefijo con dos significados | `--ds-color-bg-primary` (fondo) vs `--ds-color-primary-bg` (tinte de marca) |
| 6 | Deriva de sinónimos | shadow 370 / elevation 19 · spacing 183 / space 19 · active 225 / pressed 9 |

---

# PARTE 2 — EL OBJETIVO, EN UN NÚMERO

Hoy, medido:

| | |
|---|---:|
| Hojas que The Management **podría** escribir (advanced) | 1.804 |
| Techo de variables compiladas | 512 |
| The Management **escribe** | **35** |
| De esas 35, las que llegan a ≤2 archivos | **11 (31%)** |

> **La capacidad existe y no se usa.** No hay que rediseñar la arquitectura: hay que llenarla y
> arreglar la plomería.

**El objetivo del roadmap, medible:** que cada decisión que le damos al tenant cascadee a **cientos**
de canales, no a uno o dos. Se mide con `tenant-reach-census.mjs`. El programa se declara terminado
cuando el porcentaje de decisiones muertas o casi muertas cae por debajo de un umbral que hay que
acordar.

**Por qué esto importa más que agregar tokens:** el envelope prohíbe usar geometría para
diferenciarse (±8% tipografía, ±20% radio, ±15% densidad — imperceptibles de un vistazo). La
divergencia tiene que venir de **paleta, familia tipográfica y chrome**. Paleta sola es "el mismo
producto pintado distinto". Así que **el chrome es la única palanca grande que queda** — y el chrome
es exactamente lo que está roto.

---

# PARTE 3 — EL TRABAJO

## F0 — Desbloquear (decidido)

| # | Trabajo | Estado |
|---|---|---|
| 0.1 | Los 23 canales detail/list → `tenantChannel` | **decidido: opción A** |
| 0.2 | Un solo camino de lectura del registry para los dos catálogos | pendiente |
| 0.3 | Regenerar el canon; derivar los 4 encabezados de ledger driftados | pendiente |
| 0.4 | Registrar los 83 commits sin log como una entrada: R2/R3/R4 ejecutadas sin sellar | pendiente |

## F1 — El instrumento que falta

**Arnés de computed style resuelto, por tenant, en navegador real.** Es la única forma de medir
resolución en vez de alcanzabilidad. Cierra de una vez: la clase de valor equivocado, la clase de
dial cortado, los 29 canales inciertos, el veto responsive que nunca corrió, y la prueba de
divergencia.

**Nada de F2 en adelante puede validarse honestamente antes de que esto exista.**

## F2 — Reparar la plomería

| # | Trabajo | Tamaño | Tipo |
|---|---|---|---|
| 2.1 | **Destapar el piso del canon** — borrar ~40 declaraciones intermedias de puro paso | ~1.400 cadenas | **borrado** |
| 2.2 | Rebasar los 146 alcances a rampa cruda sobre `--ds-color-border*` | 6 archivos | mecánico |
| 2.3 | Resolver las 64 declaraciones dobles en `:root` que no coinciden (incluye 14px vs 15px) | 64 nombres | mecánico + verificar |
| 2.4 | **Dejar de emitir los 4 valores de radio resueltos** en los artefactos | 3 artefactos | un cambio de compilador |
| 2.5 | Rutear 763 literales `1px` por `--ds-edge-standard-width` | 122 familias | mecánico |
| 2.6 | Sustituir 1.374 literales de espaciado que ya están en la escala | 157 familias | mecánico |
| 2.7 | Cabezas hard-severed + read-but-inert confirmados | 377 decls | mecánico |
| 2.8 | Repuntar `shape.button-style` fuera de la proyección muerta `--radius-field` | 1 cadena | mecánico |
| 2.9 | Emitir los 3 canales de `experience.profile` en runtime | 3 canales | compilador |
| 2.10 | Sombra / rampa de elevación — 154 decls, 0 en rampa | | **contrato, decisión tuya** |

## F3 — Gobernanza

| # | Trabajo |
|---|---|
| 3.1 | **Mecanizar la anti-duplicación**: cada `--ds-*` público nuevo declara una terna `(familia, eje, grupo de propiedad)` y **falla cerrado si la terna ya tiene dueño**. **La familia tiene que ser DECLARADA, no derivada del nombre** — §1.9 prueba que derivarla no describe la realidad (62% de las familias tienen 0% de lecturas propias), así que una terna con familia derivada validaría contra una ficción. El `prototype-ledger` ya lleva `family` y `axis` como campos declarados: ése es el molde |
| 3.1b | **Cerrar el hueco de las capas 3/4/5**: hoy una lane de familia puede crear canales nuevos sin guarda alguna, y **182 de los 214 nombres del skin de modern no existen en ninguna otra capa**. Es el mismo agujero que 3.1 pero del lado del DS en vez del lado del tenant |
| 3.1c | Adjudicar las capas huérfanas: 28 nombres de proyección DaisyUI con **cero** lecturas, 87 `--duration-*`/`--easing-*` sin prefijo con cero lecturas, y **497 lecturas sin ningún fallback** que no pintan nada salvo que una app declare el nombre |
| 3.2 | Ensanchar `NAME_RE` para que los 310 nombres `--_ds-*` dejen de ser invisibles al censo |
| 3.3 | Derivar los totales de encabezado de los ledgers en vez de tipearlos |
| 3.4 | **Registrar `csssource:check` en el manifiesto de CI** — hoy `default.css` y `base/*.css` no tienen ningún gate de obsolescencia, y son el CSS más importante del sistema |
| 3.5 | Registrar `channel-wiring-zero-delta-gate` y `tenant-reach-census --check` |
| 3.6 | Enmendar el pack para nombrar al revisor sustituto de Codex (**autorizado**) |
| 3.7 | Colapsar `--ds-border-color-*` dentro de `--ds-color-border*` (**decidido**) |
| 3.8 | Renombrar o retirar `groupEmphasis` antes de que shipee; resolver `ruled` ×3 y `flat`/`soft-depth` |
| 3.9 | Hacer que `forbiddenCapabilities` se **lea** como chequeo, no sólo se digeste |

## F4 — Unificar los dos programas en uno

Un WO, una autoridad de estado. El alcance entra como **campos en las 252 filas del ledger**, no
como un segundo documento. Renombrar las escenas del lab a su ronda real.

## F5 — Identidad

Sólo después de F1, que es lo que la prueba.

- **BitHire**: estilo LinkedIn pero más premium y más AI, degradados elaborados
- **Evnto**: ticketera, blanco y negro, blanco predominante
- **Rottay**: cloud software, fondo oscuro, texto blanco y gris, detalles de acento
  — **decidido: invertir la postura por defecto a oscuro**

Y la palanca real: **llevar a The Management de 35 decisiones a un uso serio de sus 512.**

## F6 — Craft

**17 de 27 structures y 10 de 18 charts están sin tocar.** Ahí está el trabajo de craft que queda.

---

# PARTE 4 — LO QUE NECESITO QUE CONFIRMES

1. **¿El modelo de la PARTE 1 es correcto?** Si algo de la traza no coincide con lo que tenés en la
   cabeza, es ahora.
2. **¿El objetivo de la PARTE 2 es el correcto** — "cada decisión cascadea a cientos de canales" — y
   qué umbral de decisiones muertas aceptamos como terminado?
3. **Sombra/elevación**: ¿cambia la rampa para reflejar lo que los componentes pintan, o cambian los
   componentes para usar la rampa?
4. **¿14px o 15px** para el texto de cuerpo?
5. **Las 6 familias AI** del programa padre: ¿entran a las 252 como clase nueva, o se declaran un
   entregable separado?

---

*Decisiones ya tomadas y registradas: los 23 canales → opción A · autoridad de borde →
`--ds-color-border*` · enmienda al pack autorizada · Rottay por defecto a oscuro.*
