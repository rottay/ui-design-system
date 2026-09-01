# Estado actual · dirección del plan · situación de lo implementado · lo que falta

> **Segunda pasada (2026-08-28).** Este documento conserva la lectura original. Tras `06`/`07`, la sección 4 ("Lo que falta") queda **SUPERADA en cuatro puntos**: el 3 (drenar 2.169 → reconstruir el clasificador y re-anclar sobre la clase B de 760, 07·A5), el 4 (6 diales → decisión D5 del owner tras el slice F4C, 07·A14), el 5 (scope en el registro → prohibido; explotar el tier de instancia existente, 07·A8) y el 6 (abrir `ramps`/`elevations` → rottay-only; sólo `modes.dark.{typography,surfaces}` + issue `ignored_field`, 07·A12). En la sección 1, "RC-03 la mitad de la pintura inalcanzable" y "5,4 MB bloqueante" quedan corregidos (0 `unset` en modern; Next minifica a 344 KB gzip). La tabla de los 20 controles se mantiene, con dos precisiones: `chrome.anatomy` sí llega al DOM en bithire (brazo DB + literales de app), no en evnto ni platform; `responsive.posture` ya está `OPEN_OWNER` en su manifest. La secuencia vigente es `07 §D`.

## 1. Estado actual del aplicativo (lo que un usuario vería hoy)

**Qué pinta hoy.** Un tenant DB (`themanagementmiami`, fixture canónico) sobre el vertical bithire mueve 185 variables + 1 modeDelta contra un baseline de 1.229 (15,1 % de los canales) y su cierre transitivo alcanza el 62,6 % de las declaraciones de pintura modern (A-10). En el DOM: 445 de 1.606 canales `:root` distintos (05). Lo que un humano ve: otra fuente de título (Fraunces serif vs Space Grotesk), papel más cálido, tiles grises en vez de azules, escala de tipo 1,04×. Lo que no ve: cambio de anatomía (los atributos `data-anatomy-*` nunca se estampan), de silueta de botón (el canal no se lee), de elevación (identidad en bithire), de radio (0 px en ambos por el fixture), de composición o de shell. Veredicto sighted: **recolor + font swap**, no dos proyectos.

**Qué funciona bien en producción.** app-bithire: SSR embebe el artefacto compilado + prepaint (sin FOUC), compila en request-time con cache acotado y 3 niveles de recuperación, falla cerrado ante un tenant custom sin DB, y tiene el único e2e de dos tenants en app real (`tests/e2e/two-systems/divergence.spec.ts`). Su CSS propio escribe 165 `--ds-*`, 100 % dentro de `publicHooks`. Los 123 skins modern tienen cero color literal en código. Touch targets, safe-area, RTL y forced-colors están gobernados.

**Qué está roto o dormido.** app-platform importa `dist/platform.css` y `commercial.css` que el DS 2.19.36 ya no produce (compila por el 2.19.35 instalado). app-evnto falla abierto (impersona Evnto ante caída de DB) y corre 2.19.36 por symlink declarando 2.19.29. app-bithire corre 2.19.37, publicado desde un commit que no está en ninguna rama. El bundle CSS de cada vertical pesa 5,4 MB / 1,05 MB gzip con los 3 engines y sin minificar. A 390 px, `PageShell` en la escena shell apila el texto del slot lateral letra por letra.

**Estado de los 20 controles públicos (medido, no declarado).**

| Control | Tier | Alcance real (skins por cierre) | Estado F4B | Defecto medido |
|---|---|---|---|---|
| `density.mode` | S | 203 | COMPUTED | vocabulario runtime ≠ control |
| `palette.seeds` | S | 197 | COMPUTED | APCA cubre 8 pares |
| `shape.radius-scale` | S | 179 | COMPUTED | J=0,874 con `profiles.expressive` |
| `typography.scale` | S | 170 | COMPUTED | — |
| `surfaces.elevation-posture` | S | 108 | COMPUTED | identidad en 2/3 stops (bithire); sólo niveles 1-3 |
| `typography.families` | S | 78 | SOURCE_BOUND | J=0,806 con `pairing`; DB acepta 2 de 4 campos |
| `motion.dial` | S | 70 | SOURCE_BOUND | — |
| `typography.pairing` | S | 60 | SOURCE_BOUND | `@font-face` horneados por vertical |
| `experience.profile` | S | 49 (23,6 % de pintura) | COMPUTED | sólo 2 perfiles publicados |
| `surfaces.effect-intensity` | S | 28 | COMPUTED | nombre ambiguo |
| `spacing.rhythm` | S | 14 | COMPUTED | 14× menos que density |
| `navigation.sidebar-tone` | S | 3 | SOURCE_BOUND | el chrome más identitario toca 3 archivos |
| `shape.button-style` | S | **0** | SOURCE_BOUND | canal no leído por `button.css` |
| `profiles.expressive` | P | 179 | SOURCE_BOUND | 15/34 stops a cero canales |
| `token-overrides` | P | 174 | SOURCE_BOUND | techo estructural declarado |
| `chrome.families` | P | 8 declarados / 1.875 campos | BY_REFERENCE | ~250 celdas diferidas a F5 |
| `chrome.anatomy` | P | data (4 atributos) | SOURCE_BOUND | sin brazo estático, sin emisor en apps |
| `profiles.icon` | P | data | SOURCE_BOUND | funciona (cada icono lo consulta) |
| `responsive.posture` | P | data | COMPUTED (terminal DATA) | no gobierna ningún CSS |
| `recipe-profile` | P | **0** | SOURCE_BOUND | no llega a runtime estático |

## 2. Dirección que propone el plan

**Tesis (correcta):** no reescribir primitivas; un solo compilador con dos transportes; pocos controles públicos que bajan por canales gobernados a skins que leen con fallback encadenado; artefacto generado como única autoridad visual; tenant-last; gobernanza mecánica con baselines decrease-only y evidencia reproducible. Todas las mediciones de esta reauditoría confirman que el modelo skin-first es el correcto y que el trabajo restante es mecánico (cableado, drenaje, craft).

**Secuencia (incorrecta para el objetivo del owner):** F0 piso → F0.5 folder/index → F1 vocabulario → F2 cascada en fuente → F4A canon de themes → F4B calibración de controles → [normalización profunda, no planificada, ~120 commits] → F3 pintura a skins → **F4C art direction premium** → F5 → F6 → F7 → F8 (sólo BitHire) → F9 (5.100 celdas). Toda la mejora visible está en F4C, que no arrancó, y detrás de una puerta que se insertó después del plan. Cada lote anterior es cero-delta por ley. Consecuencia medida: 25 días, 670 commits, divergencia entre verticales 34,7 % → 34,5 %, 0,2 % de líneas en skin CSS.

**Ley de trabajo (excelente como red, insuficiente como motor):** cero-delta computado contra los 3 artefactos, contrafactuales, restore exacto, DT ≠ auditor, test-truth policy. Es una estrategia de no-regresión sin estrategia de mejora. Nada señala cuando 20 lotes seguidos declaran delta nulo.

**Gobernanza (se autoalimenta):** 103 gates blocking, 38 drills, 24 baselines, receipts, sellos, un roadmap de 8.098 líneas, 18.416 líneas en `docs/`, 4 relevos de DT en 10 días, memos de auditoría efímeros. Ratio instrumento/producto 1,40:1. ≈51 % de la superficie blocking no mira al producto.

## 3. Situación de lo implementado

| Fase | Declarado | Medido por esta reauditoría |
|---|---|---|
| F0 / F0.5 / F1 | Cerrados | folder/index 0 archivos sueltos (J-94); vocabulario cerrado; gates de frescura 8/8 verdes (H-76). Sólido. |
| F2 cascada | Cerrado "como disposición" | 49,6 % de canales sin camino a raíz (C-1); 196 `--_ds-*` sin productor (C-2); channel-liveness 49 no drenables; tenant-reachability 10/13; 2 gates excluidos. **Cerrado en papel, no en cascada.** |
| F4A canon de 3 themes | Cerrado | Roster estructural idéntico (C-30), pero evnto 346 asignaciones vs 1.707/1.510 y `#2A2A2F` ×70 como literal (C-3, C-4). **Mirror de forma, no de densidad ni de derivación.** |
| F4B calibración 20 controles | Cerrado "en forma honesta" | 9 COMPUTED / 10 SOURCE_BOUND / 1 BY_REFERENCE; 94 celdas declaradas siguen UNKNOWN; 2 Standard con alcance 0 pasaron el gate por testigos que citan otro canal (B-1). **Calibrado en aislamiento, no en pintura.** |
| Normalización profunda (no planificada) | En curso, ~120 commits | Drenó alias, colapsó literales→`var()` en brand-themes (128+3 slots), re-ancló baselines. Cero-delta por definición. Valor: sí, para F4C; costo: F4C sigue sin arrancar. |
| F3 pintura a skins | "Drenada, superficie de un dígito" | Cierto para el pool del regex (construcción de referencias). Deuda real de literales inline en modern: ~13 sitios sin dueño (G-10). Uso bruto de `style=` en engines modern: 370 en 124/135 archivos, sin color literal (C-27). |
| F4C / F5 / F6 / F7 / F8 / F9 | Pendientes | F8 acotado a BitHire deja el brazo DB sin app; F9 a ritmo observado (0 celdas / 24 días) no tiene fecha. |
| R7 (customización avanzada) | `enabled: false` | No introduce scope por debajo de tenant (F-1): tampoco resolverá "una card en una página". |

**Métrica.** El DT reporta 62 % ingeniería / ~43 % comercial sin fórmula. Las cifras ancladas al manifest son: certificación 0/5.100, familias aceptadas 0/255, `SIGHTED_ACCEPTED` 0/255, divergencia medida 34,5 % (plana). La rúbrica de esta reauditoría da 2,61/5 (52 %) sobre 96 ópticas — coincide en orden de magnitud con el 62 % del DT si se lee como "máquina construida", y con el 0 % si se lee como "producto certificado".

## 4. Lo que falta (para llegar al objetivo del owner)

Ordenado por lo que desbloquea más objetivo por unidad de trabajo. Detalle y esfuerzo en `04-optimizaciones-reordenamiento.md`.

1. **Poner el trabajo a salvo y encender la red visual** — push a rama de trabajo; CI corre; memos a `test-artifacts`.
2. **Conectar la última milla de los controles que ya existen** — anatomía en el brazo estático + emisor en las 3 apps; `recipes` en config code-owned; `button.css:73`; presets de elevación a 6 niveles; stops muertos fuera del enum. Con esto la paridad estático/DB deja de estar rota en el eje más visible y 2 Standard vuelven al catálogo.
3. **Drenar los 2.169 canales huérfanos** — hasta que la mitad de la pintura sea alcanzable, ningún dial "cambia todo el skin".
4. **Los 6 diales que faltan** (`focus.identity`, `control.size`, `surface.material`, `shape.geometry`, `surface.depth`, `type.weight`) + metadatos de editor + fusiones (`families`→`pairing`, `radius-scale`→`geometry`). Convierte 159 campos crudos y 37 overrides en enums de 3 stops.
5. **Scope por debajo de tenant** — `scope: surface|instance` en el registro, `SurfaceScope`, `tokens` prop acotada, densidad estampada en las 30 surfaces. Es el pedido "una card en una página".
6. **Abrir el transporte DB por reach** — `palette.ramps`, `surfaces.elevations`, `modes.dark.{typography,surfaces}`; un solo `renderThemeCss`.
7. **Vertical slice de F4C** sobre 8 familias insignia con captura A/B 360/768/1280 light/dark — la primera evidencia visible del programa y la prueba del método antes de las 255.
8. **Entrega** — minificar `dist/*.css`, bundle por vertical×engine, cruzar declarados-no-leídos con la allowlist, fonts por demanda validadas contra el pairing.
9. **Apps** — lote mínimo app-platform (import + `tenant-theme-console` contra DB local + e2e de 2 tenants); evnto fail-closed y repin honesto; rama `release/2.19.37`.
10. **Método de F9** — por grupo de receta/anatomía (~25-30 grupos), no por celda; "10 en uno" para los `SOURCE_BOUND`.
11. **Gobernanza** — una autoridad generada; 4 métricas ancladas en cada asiento; ≤35 gates blocking; docs-engineering regenerados; vocabulario del programa definido.
12. **Responsive** — converger 25 breakpoints en una escala; `responsive.posture` emitiendo canales; safe-area RTL en 3 archivos; corrida responsive por cohorte; `PageShell` a 390 px.

Lo que **no** falta y conviene no volver a hacer: reescribir primitivas, un segundo compilador, más gates que vigilan gates, más documentos que se declaran únicos, más lotes cero-delta sin un lote de delta esperado al lado.
