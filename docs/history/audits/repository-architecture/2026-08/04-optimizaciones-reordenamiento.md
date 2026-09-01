# Optimizaciones y reordenamiento propuesto

> **Segunda pasada (2026-08-28) — estado de este plan.** Tras la reauditoría adversarial (`06`, `07`), varios movimientos quedan **SUPERADOS** y se conservan aquí sólo como registro: **0.1** (push: viola la cerca; alternativa `git bundle` y decisión D1) · **1.1** (fallback de botón: vacuo; fix correcto = fan-out por tamaño con plantilla en `chrome-variables:1742-1746`) · **1.2** (anatomía estática: correcto pero bloqueado por la secuencia obligatoria paso (a) antes de (b)) · **1.6** (`responsive.posture`: ya `OPEN_OWNER`, no mecánico) · **1.7** (safe-area RTL: no hay bug; el swap sería una regresión) · **Ola 2.1** (drenar 2.169: cola falsa; primero reconstruir el clasificador y re-anclar sobre la clase B de 760) · **Ola 3** entera (6 diales: decisión del owner tras el slice F4C) · **4.1** (`scope` en el registro: prohibido por ley fechada; el tier de instancia ya existe) · **5.1** (abrir `ramps`/`elevations`: rottay-only; sólo `modes.dark.{typography,surfaces}` + issue `ignored_field`) · **7.1** (minificar: higiene/DX, no bloqueante de red) · **7.3** (1.024 tokens: sólo 5 en la allowlist) · **7.5** (platform: son 49 archivos JS además del CSS) · **8.1** (F9 por grupo: el denominador 5.100 es constitucional; los grupos generan evidencia) · **8.3** (≤35 gates: primero perfil de tiempo/riesgo). **La secuencia vigente es S0-S5 de `07 §D`**, convergente con Kimi: instrumentos → defectos causales con delta visible → slice F4C → cascada → entrega antes de repin. Se mantienen sin cambio: 0.3, 0.4, 1.3, 1.4, 1.5, 1.8, 2.2, 2.3, 2.4, 4.3, 4.6, 5.2-5.6, 6.x, 7.2, 7.4, 7.6-7.8, 8.2, 8.4-8.7.

Cada movimiento nombra el hallazgo que cierra (`RC-nn` en `02-hallazgos.md`), el esfuerzo estimado (en días de un implementador, no de flota) y el impacto sobre el objetivo del owner. Los movimientos 1-4 no requieren decisión de diseño; del 5 en adelante sí, y se indica cuál.

## Ola 0 — Antes de cualquier otra cosa (≤1 día)

| # | Movimiento | Cierra | Esfuerzo | Impacto |
|---|---|---|---|---|
| 0.1 | `git push origin HEAD:refs/heads/modern-rescue/wip` (rama, no `main`, no publish). `HEAD..origin/main` = 0, sin force | RC-01 | minutos | Réplica de 25 días de trabajo; la red visual de 462 PNG, a11y y builds corren por primera vez desde el 3-ago |
| 0.2 | `cp` del memo de auditoría a `docs/history/programs/modern-rescue/advisories/2026-08/<lote>.md` al cerrar cada lote; el asiento cita esa ruta | RC-01 | 0 | La cadena de evidencia de ACCEPT/REJECT vuelve a ser auditable |
| 0.3 | Rama `release/2.19.37` anclando `a037d3a3c` antes del GC | RC-09 | minutos | Producción de bithire reconstruible desde fuente |
| 0.4 | Corregir `evidence.symbol` de `shape.button-style` (hoy cita `--ds-button-md-radius`, que el control no escribe) | RC-05 | minutos | El gate `controls-catalog --check` deja de estar neutralizado por un testigo falso |

## Ola 1 — Última milla de lo que ya existe (3-5 días) · sin decisiones de diseño

| # | Movimiento | Cierra | Esfuerzo | Impacto |
|---|---|---|---|---|
| 1.1 | `button.css:73` → `var(--ds-button-md-radius, var(--ds-radius-button, var(--ds-radius-md)))` (y hermanos por tamaño) | RC-05 | 0,5 d | `shape.button-style` pasa de 0 a la silueta real del botón, el rasgo más rápido de leer entre dos productos |
| 1.2 | Proyección estática de anatomía: función pura `brandTheme.chrome.*.anatomy` → 4 atributos (misma tabla `ANATOMY_ATTRIBUTE_BY_FAMILY`); autorar `anatomy` en los 3 themes; estampar `tenantThemeAnatomyAttributes` en el mismo seam que `tenantThemeArtifactRootAttributes` en las 3 apps; borrar `BITHIRE_ANATOMY` y sus 65 reglas CSS de app | RC-04 | 1,5 d | Paridad estático/DB en el eje más visible; card/table/sidebar/layout cambian de estructura por tenant |
| 1.3 | Añadir `recipes` a `CodeOwnedGovernedBehavior` (misma justificación que `motion`/`expressive`) | RC-04 | 0,5 d | `recipe-profile` vive en los 3 verticales; bithire recibe el perfil que ya seleccionó |
| 1.4 | `ELEVATION_PRESET` a 6 niveles derivados del ladder autoral (multiplicador/atenuación), no literales | RC-05 | 1 d | `surfaces.elevation-posture` deja de ser identidad en bithire y de romper la escalera de rottay |
| 1.5 | Retirar del enum del schema v1 los stops sin lowering (`motif` 6/7, `responsive.posture` 3/3, `edge hairline`, `material flat`, `elevation flat/hairline-lift`) o implementarlos | RC-05 | 0,5 d | El catálogo deja de aceptar lo que no puede honrar (fail-closed en espíritu) |
| 1.6 | Emitir `--ds-responsive-posture-{compact,standard}-max` y que `widget-board.css:1517,1532` los lean | RC-05, RC-14 | 0,5 d | `responsive.posture` gobierna al menos un breakpoint real |
| 1.7 | `[dir='rtl']` que intercambie los `env(safe-area-inset-*)` en `drawer.css`, `sheet.css`, `overlay-modal.css` (patrón ya resuelto en `cascader.css:22-23`) | RC-15 | 0,5 d | Mobile RTL con notch correcto en los 3 shells overlay |
| 1.8 | Mini-lote de ~13 literales inline en modern (chart renderers `fontSize`, `Progress/Line`, `Countdown`, `#ddd`) | RC-29 | 0,5 d | Se puede afirmar "cero literales de pintura inline en modern" |

## Ola 2 — Drenaje de cascada (5-10 días, paralelizable por fan-out) · sin decisiones de diseño

| # | Movimiento | Cierra | Esfuerzo | Impacto |
|---|---|---|---|---|
| 2.1 | Agregar `--dump` al `cascade-wiring-ratchet`; ordenar los 2.169 huérfanos por fan-out; drenar por lotes de familia; cerrar el clasificador raíz-legítima vs raíz-posicional | RC-03 | 5-8 d | La mitad de la pintura pasa a ser alcanzable por diales; es la precondición real de "un dial cambia todo el skin" |
| 2.2 | Gate productor/consumidor para `--_ds-*`; declarar o borrar los 196 sin productor | RC-11 | 1 d | Fin de las propiedades `unset` silenciosas |
| 2.3 | Constantes de decisión en brand-themes (`NEUTRAL_900`, etc.) y el skeleton las referencia; backlog de placeholders por sección para evnto | RC-12 | 1-2 d | La ley de hardcodes F4A se cumple en los propios themes; cambiar un seed toca 1 línea |
| 2.4 | Jaccard del gate de ortogonalidad sobre cierre de canales (derivable hoy), no sobre celdas APPLICABLE | RC-13 | 0,5 d | El gate detiene algo por primera vez |

## Ola 3 — Los diales que faltan y el editor (5-8 días) · **requiere decisión del owner** sobre nombres, stops y el máximo de 15 Standard

| # | Movimiento | Cierra | Esfuerzo | Impacto |
|---|---|---|---|---|
| 3.1 | `focus.identity` (`subtle \| ring \| offset-ring`) — sustituye 20 campos; `--ds-focus-ring*` tiene 164 lecturas y ningún dial | RC-07 | 1 d | Mayor palanca por dial sin gobernar hoy; cruza toda familia interactiva |
| 3.2 | `control.size` (`compact \| md \| lg`) a nivel tenant — sustituye 104 campos; `data-size` ya lo leen 71 skins | RC-07 | 1,5 d | Pedido explícito del owner: "todos mis inputs son lg" |
| 3.3 | `surface.material` (`flat \| paper \| glass` + intensidad) para superficie y control — sustituye 21 de los 37 overrides del tenant de referencia | RC-07 | 1,5 d | El bloque más grande de la escotilla desaparece |
| 3.4 | `shape.geometry` (forma de rampa `square \| soft \| round` × escala) plegando `shape.radius-scale` (J=0,874) | RC-07, RC-13 | 1 d | Rampa no proporcional (`0/0/1/2px`) expresable sin overrides |
| 3.5 | `surface.depth` (`none \| soft \| hard-offset`) — carácter de sombra, no cantidad | RC-07 | 1 d | 4 overrides menos; "premium" vs "ledger" es una decisión de un stop |
| 3.6 | `type.weight` (`light \| regular \| strong`) — sustituye 20 campos | RC-07 | 0,5 d | Eje que sobrevive a escala de grises (`threeSecondGrayscaleRecognitionRequired`) |
| 3.7 | Fusionar `typography.families` en `typography.pairing` (J=0,806) → libera 1 slot Standard | RC-13 | 0,5 d | 13 Standard → 11 antes de sumar 3.1-3.6 |
| 3.8 | `editorMetadata` en `schema.json` + los 20 controles (label, help, 1 fixture de preview); app-platform lee el manifest en vez de `humanizeKey()`; unificar `DENSITY_POSTURES` con el control | RC-07 | 2 d | Un PM entiende 20 diales; deja de ver 2.212 campos anónimos |
| 3.9 | Columna de palanca del catálogo = cierre transitivo; el gate falla si un Standard toca < N skins | RC-07 | 0,5 d | "Lecturas vivas" deja de ser incomparable entre controles |

## Ola 4 — Scope por debajo de tenant (3-5 días) · **requiere decisión del owner** (es un cambio de modelo, hoy R7 tampoco lo prevé)

| # | Movimiento | Cierra | Esfuerzo | Impacto |
|---|---|---|---|---|
| 4.1 | `scope: 'tenant' \| 'surface' \| 'instance'` en el registro de capacidades; candidatos inmediatos `density.mode`, `chrome.anatomy`, `recipe-profile` (ya tienen mecánica CSS/Context) | RC-04 | 1 d | El pedido "esta página / esta card" tiene destino en el modelo |
| 4.2 | `SurfaceScope` (~60 líneas): monta `densityScopeAttributes` + `data-anatomy-*` + `RecipeProfileProvider` con vocabulario cerrado tipado | RC-04 | 1 d | Una línea por página para "todas las cards de ESTA página framed y compactas" |
| 4.3 | Montar `densityScopeAttributes(profileDefaults.density)` en las 30 surfaces que ya resuelven `profileDefaults`; colapsar los 3 mecanismos de densidad en uno | RC-04 | 1 d | `profileOverrides.density` llega al DOM en `ListSurface/DashboardSurface/FormSurface/DetailSurface` |
| 4.4 | Promoción `card-instance-geometry` (5 propiedades: `instance-padding`, `radius`, `shadow`, `border-width`, `bg-hover`) + prop `tokens` tipada derivada del manifest en Card/Button/Input/DataTable/Badge | RC-17 | 2 d | Los 2.197 `className` sobre componentes no-layout tienen competencia tipada y medible; no se cierra `className` |
| 4.5 | `--ds-card-size-factor` que componga padding/gap/radio en `[data-size]` de Card | RC-18 | 0,5 d | `<Card size="sm">` compacta de verdad |
| 4.6 | Documentar `profileOverrides` como la vía oficial de override por página; migrar 2-3 pantallas de bithire como prueba | RC-04 | 1 d | La capacidad que ya existe se vuelve alcanzable |

## Ola 5 — Transporte DB y renderers (4-6 días) · decisión del owner sobre qué abrir

| # | Movimiento | Cierra | Esfuerzo | Impacto |
|---|---|---|---|---|
| 5.1 | Abrir en schema v1 por reach: `palette.ramps` (80 hojas, 8 familias de color), `surfaces.elevations` (6), `modes.dark.{typography,surfaces}` (~30). No abrir `modes.*.chrome` (4.012; explotaría el límite de 64 KB) | RC-06 | 2-3 d | El tenant DB deja de ser "diferente sólo en modo claro" |
| 5.2 | `palette.dark` con `backgroundMode≠auto` → `TenantThemeValidationIssue` explícito | RC-06 | 0,5 d | El editor deja de descartar en silencio |
| 5.3 | Un solo `renderThemeCss(scopes, vars, modeBlocks, opts)` para ambos renderers: `color-scheme` + tinta raíz + `@media auto` en los dos | RC-06 | 1 d | Sin JS, un tenant DB oscuro tiene scrollbars/select/autofill oscuros |
| 5.4 | `build-stamp.sourceHash` (o `baseThemeDigest`) en `digestSource` y en la cache key | RC-25 | 0,5 d | Un artefacto pre-upgrade no sobrevive por ETag |
| 5.5 | Tabla `keypath → rangeKey` derivada del envelope en el console; decidir si los envelopes difieren de verdad (hoy 1 número) o colapsarlos | RC-26 | 0,5 d | Fin de "legal en UI, rechazado al publicar" |
| 5.6 | Publicar más `EXPERIENCE_PROFILES` (hoy 2): cada perfil es composición de ejes ya implementados | RC-02 | 1 d por perfil | La palanca de mayor alcance (23,6 %) deja de ser binaria |

## Ola 6 — Vertical slice de F4C (5-8 días) · **requiere excepción escrita del owner** a la cola vinculante

| # | Movimiento | Cierra | Esfuerzo | Impacto |
|---|---|---|---|---|
| 6.1 | 8 familias insignia (Button, Input, Card, Table, Sidebar, PageHeader, Modal, DashboardSurface) llevadas a `tenantDivergenceMinimumByProfile` en los 3 verticales, con captura A/B 360/768/1280 light/dark. Ninguna requiere un eje nuevo | RC-02 | 5-8 d | Primera evidencia visible en 25 días; prueba el método de art direction sobre la cascada existente y descubre los defectos de F4C ahora |
| 6.2 | Lote "10 en uno": captura A/B de los 10 `SOURCE_BOUND` con el dial en sus dos extremos, 3 verticales (la sonda ya produce los escenarios) | RC-19 | 1 d | La mitad de los diales pasa de "verificado en aislamiento" a "probado que pinta" |
| 6.3 | Ley de lote: `DELTA_NULO_DECLARADO` o `DELTA_ESPERADO` con captura, obligatorio; un frente con 20 nulos seguidos se reordena | RC-02 | 0 | Nada vuelve a pasar 25 días sin mover un pixel sin que se note |

## Ola 7 — Entrega y apps (3-5 días) · sin decisiones de diseño salvo 7.2

| # | Movimiento | Cierra | Esfuerzo | Impacto |
|---|---|---|---|---|
| 7.1 | `lightningcss --minify` sobre `dist/*.css` al final de `build-css`; `styles/*.css` sigue legible para diffs y gates | RC-08 | 0,5 d | gzip −65 % (1,04 MB → ~370 KB) sin tocar compilador ni cascada |
| 7.2 | `dist/{vertical}.{engine}.css` por combinación; cada app importa la suya (el JS ya hace `import()` por engine) | RC-08 | 1-2 d | bithire deja de pagar classic+rustic |
| 7.3 | Cruzar los 1.024 `--ds-*` declarados-no-leídos contra la allowlist Expert (290); retirar o dar consumidor | RC-08, RC-27 | 1 d | Fin de overrides que no pintan nada |
| 7.4 | `typography.pairing` validado contra los font-packs embebidos (fail-closed) o embeber todos; bithire migra Fraunces al subpath del DS | RC-08, RC-24 | 1 d | Un pairing elegido por DB siempre tiene `@font-face` |
| 7.5 | Lote mínimo app-platform: `globals.css` → bundle real (decisión: ¿platform es tenant de rottay o vertical propio?); `tenant-theme-console` contra DB local; portar `two-systems/divergence.spec.ts`; `<style>` SSR en `(dashboard)/layout.tsx` | RC-09, RC-22 | 2 d | El brazo DB del objetivo sale del showroom y se prueba en la app que administra tenants |
| 7.6 | evnto: separar "tenant no existe" de "DB falló"; patrón LKV/fail-closed de bithire; repin a 2.19.36 con `USE_LOCAL_DS` explícito | RC-22, RC-09 | 1 d | Fin de la impersonación bajo dominio del tenant |
| 7.7 | Gate por app: los `@import` de `@rottay/design-system` resuelven contra `exports` del paquete instalado | RC-09 | 0,5 d | El próximo repin no rompe en silencio |
| 7.8 | Hex pelados de platform (6 archivos) → tokens; drenaje de `style={{` por concentración | RC-23 | 0,5 d + backlog | Cumplimiento literal de "NEVER hardcoded colors" |

## Ola 8 — Método de F9 y gobernanza (continuo) · decisión del owner sobre 8.1 y 8.3

| # | Movimiento | Cierra | Esfuerzo | Impacto |
|---|---|---|---|---|
| 8.1 | F9 por grupo de receta/anatomía (~25-30 grupos) con prueba por representante + prueba mecánica de pertenencia; celda por celda sólo para outliers. Charts 18×20 = 360 celdas en 1-2 adjudicaciones | RC-19 | método | 5.100 adjudicaciones sin fecha → ~600 con fecha |
| 8.2 | 4 métricas ancladas en cada asiento (certificación, familias aceptadas, divergencia mínima, sighted) + divergencia de artefactos; el 62 % queda rotulado como juicio | RC-10 | 0,5 d | El owner sabe si el programa avanza |
| 8.3 | ≤35 gates blocking: 38 drills y 9 freshness a job nocturno; retirar `gat-07` re-sello, `checkpoint-state`, `scripts-tree`, `wiring-coverage`, `kimi-worklist` con enmienda escrita. Mantener `import-binding-integrity` | RC-20 | 1 d | Cada lote deja de pagar 103 gates; el instrumento deja de crecer más rápido que el producto |
| 8.4 | Una autoridad generada (`registry.json` + `checkpoint/index.json`); README y roadmap como redirección; grep-gate que falle si "única autoridad" aparece en más de un archivo | RC-10 | 0,5 d | Fin del círculo |
| 8.5 | Regenerar `docs-engineering/.../runtime/engines/README.md` desde CLAUDE.md "Component paint pattern"; apuntar tenancy/tokens/capability-map al pipeline que ya regenera `tokens/*.md`; tabla `## Vocabulario` con los 14 términos | RC-10, RC-34 | 1 d | Un ingeniero nuevo no parte de un modelo mental falso |
| 8.6 | Re-correr la suite completa y poblar `redTestClassifications`; `getComputedStyle` → `style.getPropertyValue`; `checkJs` sobre `scripts/` | RC-21, RC-20 | 1-2 d | La policy de rojos existe fuera del papel |
| 8.7 | Converger los 25 breakpoints en una escala de componente derivada de los 6 canónicos; corrida `test:responsive` por cohorte; `PageShell` a 390 px | RC-14, RC-32 | 2 d | "Responsive" pasa de intención a eje medido en cada lote |

## Reordenamiento de fases propuesto

```
HOY:      F0 → F0.5 → F1 → F2 → F4A → F4B → [normalización] → F3 → F4C → F5 → F6 → F7 → F8(BitHire) → F9(5100 celdas)

PROPUESTO:
  Ola 0  push + evidencia durable                                (≤1 d)
  Ola 1  última milla de controles existentes                    (3-5 d)   ← sin decisión
  Ola 2  drenaje de cascada (2.169 huérfanos, 196 --_ds)         (5-10 d)  ← sin decisión, paralelizable
  Ola 6  vertical slice F4C sobre 8 familias + "10 en uno"       (5-8 d)   ← excepción del owner
  Ola 3  6 diales + editorMetadata + fusiones                    (5-8 d)   ← decisión del owner
  Ola 4  scope surface/instance + SurfaceScope + tokens prop     (3-5 d)   ← decisión del owner
  Ola 5  transporte DB por reach + un renderer                   (4-6 d)
  Ola 7  entrega (minify, engine split) + apps (platform, evnto) (3-5 d)
  Ola 8  F9 por grupo + gobernanza + responsive                  (continuo)
  luego  normalización profunda restante, F5, F6, F7, F8 completo, F9 por grupo
```

Racional: las olas 1, 2 y 6 producen la primera mejora visible del programa con la cascada que ya existe, y descubren los defectos de F4C antes de invertir en 255 familias. Las olas 3-5 son las decisiones de producto que hoy están tomadas implícitamente por omisión (37 overrides, 2.212 campos, scope sólo tenant). Nada de esto invalida la normalización profunda: la posterga detrás de lo que el owner puede ver.

Lo que recortaría: la re-adjudicación exhaustiva de `channel-liveness` (49 probados no drenables: se enumeran o se retiran, no se arrastran 3 fases más); los re-sellos documentales de `gat-07` hasta el cierre del programa; el crecimiento de `docs/` con nuevos documentos de estado.

Lo que automatizaría: la copia del memo del auditor al cierre de lote; la corrida visual/responsive por cohorte; el `--dump` del ratchet; la columna de palanca por cierre transitivo; las 4 métricas del asiento.
