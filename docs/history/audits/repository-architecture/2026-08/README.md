# Reauditoría Cloud — Modern Rescue (WO-CRA-23)

**Fecha de ejecución:** 2026-08-28 · **Solicitante:** davila · **Auditor:** Fable 5 (orquestación y adjudicación) con 10 brazos de investigación read-only (4 Opus: modelo de theme, palanca de controles, override por instancia, dirección del plan; 6 Sonnet: cascada/hardcodes, responsive, performance, gates, apps, docs).
**HEAD auditado:** `c2e7dcfc5` → `dcc44a609` (el DT commiteó 2 lotes durante la auditoría; cada cifra cita su commit).
**Alcance:** `ui-design-system` (core + showroom), `app-bithire`, `app-evnto`, `app-platform`, `docs-engineering/engineering/design-system`. Cero escrituras sobre los repos; sólo lectura, gates `--check`, y una captura sighted propia contra el showroom en `:7001`.

Este documento es el doble check pedido por el owner: ¿la refactorización va a llegar a la calidad de software necesaria para que dos tenants (uno estático desde vertical, otro desde DB) parezcan proyectos totalmente distintos, con pocas decenas de controles de alta palanca, responsive, premium, cero hardcode que sombree el skin, y customización puntual desde la app?

> **Aviso de revisión (2026-08-28, segunda pasada).** Esta carpeta fue reauditada adversarialmente por Codex (`reauditoria-codex/`) y Kimi (`reauditoria-kimi/`), y Cloud contrastó las tres lecturas contra fuente en `06-reauditoria-cloud-sobre-codex-kimi.md`. **Cinco de los diez bloqueantes originales cambian de severidad, causa o fix**; las conclusiones anteriores se conservan abajo y en `02`/`04` marcadas como `[SUPERADA → 07·An]`. La lista de correcciones aceptadas, los desacuerdos que se mantienen y las decisiones del owner están en `07-correcciones-y-consenso-owner.md`. Las proyecciones "20-25 %" y "51-217 días" quedan **retiradas**. HEAD auditado en la segunda pasada: `dcc44a609` → `f166570d9` (2 commits del DT durante la sesión; cero escrituras de esta reauditoría fuera de esta carpeta).

> **Mesa de conciliación del owner.** Las posturas post-Cloud de Codex y Kimi,
> la interpretación del manifest como source of truth y un roadmap rápido
> propuesto —expresamente no aplicado— están en
> [`mesa-de-conciliacion/README.md`](mesa-de-conciliacion/README.md).

## Cómo leer esta carpeta

| Archivo | Qué contiene |
|---|---|
| `README.md` (este) | Veredicto ejecutivo, scorecard, los 10 bloqueantes, método |
| [`01-rubrica-96-opticas.md`](01-rubrica-96-opticas.md) | Las 96 ópticas puntuadas 0-5 con evidencia de una línea, agrupadas en 10 clusters |
| [`02-hallazgos.md`](02-hallazgos.md) | Hallazgos consolidados y deduplicados, por severidad, con `ruta:línea` y optimización concreta |
| [`03-estado-plan-pendientes.md`](03-estado-plan-pendientes.md) | Estado actual del aplicativo · dirección del plan · situación de lo implementado · lo que falta |
| [`04-optimizaciones-reordenamiento.md`](04-optimizaciones-reordenamiento.md) | Los movimientos propuestos, ordenados por impacto/esfuerzo, y el reordenamiento de fases |
| [`05-evidencia-sighted-fable.md`](05-evidencia-sighted-fable.md) | La lectura visual propia del auditor (4 tenants × 3 escenas × 2 anchos) y sus números |
| [`06-reauditoria-cloud-sobre-codex-kimi.md`](06-reauditoria-cloud-sobre-codex-kimi.md) | **Segunda pasada:** matriz RC-01…RC-10 Cloud/Codex/Kimi/veredicto revisado, los 12 puntos adjudicados desde fuente, refutaciones a Codex y Kimi, 18 hallazgos nuevos |
| [`07-correcciones-y-consenso-owner.md`](07-correcciones-y-consenso-owner.md) | **Segunda pasada:** 28 correcciones que Cloud acepta (con la conclusión anterior marcada SUPERADA), 7 desacuerdos que mantiene, secuencia mínima S0-S5, 14 decisiones del owner con opciones, lista de lo que NO ejecutar, resumen ejecutivo |
| [`mesa-de-conciliacion/README.md`](mesa-de-conciliacion/README.md) | **Conciliación:** posturas preservadas de Cloud/Codex/Kimi, manifest como source of truth, consenso, disensos, decisiones del owner y roadmap propuesto no aplicado |
| `reauditoria-codex/` · `reauditoria-kimi/` | Las dos reauditorías independientes sobre Cloud (no escritas por Cloud) |
| `brazos/` · `brazos-v2/` | Los 10 informes de la primera pasada y los 8 de la segunda (evidencia primaria, comandos reproducibles) |
| `evidencia/` | Capturas, `probe.json`, `diff-vars.txt`, `scripts/` (pasada 1), `scripts-v2/` y `datos-v2/` (pasada 2: listas de nombres de la reconciliación de cascada) |

## Veredicto ejecutivo

**Dirección arquitectónica: CORRECTA. Secuencia y última milla: INCORRECTAS. Probabilidad de cumplir el objetivo del owner con el plan tal cual dentro de 2026: baja (20-25 %).**

La tesis del programa se sostiene en todas las mediciones: un solo `compileTheme` para los dos transportes (A-1), fail-closed real 16/16 (A-4), restore exacto por construcción (A-5), cero hex/rgba en código real de los 123 skins modern (C-21/22), un pipeline theme→DOM ejemplar en app-bithire (I-79), y una honestidad de ledger poco común (0/5100 declarado como tal). El modelo skin-first es el correcto y el trabajo restante es mecánico.

Pero el producto no se movió. En 670 commits y 25 días:

- **La divergencia visual entre verticales pasó de 34,7 % a 34,5 %** (mismo instrumento, dos fechas, sobre los 3 artefactos generados — G-2). El 0,2 % de las líneas agregadas son skin CSS; el 84,4 % son receipts y scripts (G-5).
- **Mi lectura sighted** (05): bithire (estático) vs themanagement (DB) en el dashboard a 1280 px es el mismo producto con otra fuente de título y papel más cálido. Misma composición, misma anatomía de card, radio 0 y sin sombra en ambos, altura de botón idéntica (32 px). De 1.606 canales `--ds-*` en `:root`, difieren 445 — y los que difieren no aterrizan en geometría ni anatomía.
- **La razón está en la última milla, no en el modelo:** `chrome.anatomy` no existe en el brazo estático y nadie estampa `data-anatomy-*` en las tres apps (F-2, B-4); `recipe-profile` no llega al runtime de ningún vertical estático (F-3, B-3); `shape.button-style` escribe un canal que el botón moderno no lee (A-1, B-1); `surfaces.elevation-posture` es identidad en 2 de 3 stops en bithire (A-4); el 49,6 % de los canales `--ds-*` no tiene camino a raíz (C-1). El tenant DB de referencia logra su identidad con **37 `tokenOverrides` crudos = 54 % de su autoría**, no con los diales (B-12).
- **"Pocas decenas de diales" es cierto a nivel de ids (13+7) y falso a nivel de esquema:** el documento avanzado tiene 2.212 hojas, 2.080 de texto libre, y 0 de 20 controles llevan metadatos de editor (B-5, B-8).
- **El pedido "una card en una página" no tiene destino en el modelo:** las 22 capacidades son `scope: 'tenant'` sin excepción; `DensityScope` y `profileOverrides` (los mecanismos correctos) tienen cero consumidores en las tres apps (F-1, F-4, F-7).
- **Riesgo operativo máximo:** 672 commits viven sólo en esta máquina; CI (incluida la red visual de 462 PNG y la suite responsive) no corrió ni una vez en 25 días; 100 de 116 memos de auditoría citados por el ledger ya no existen (E-5, G-1, G-6).

## Scorecard (96 ópticas, 0-5)

| Cluster | Ópticas | Promedio | Lectura |
|---|---|---|---|
| A · Modelo de theme y paridad estático/DB | 1-10 | **3,5** | Lowering único, fail-closed y restore sólidos; DB no expresa el 72,6 % de las hojas que el estático escribe; dark de tercera clase |
| B · Palanca de controles y ergonomía de producto | 11-20 | **1,8** | 2 Standard con palanca 0; ortogonalidad inerte; 2.212 hojas; 0 metadatos de editor; 4 diales objetivo inexistentes |
| C · Cascada y hardcodes | 21-30 | **3,4** | Cero color literal en skins modern (excelente); 49,6 % canales huérfanos; 196 `--_ds-*` sin productor; brand-themes restatean hex 70× |
| D · Responsive, mobile, resiliencia | 31-40 | **3,4** | Touch targets, safe-area, RTL, forced-colors bien; `responsive.posture` no gobierna CSS; 18/25 breakpoints sueltos |
| E · Performance y entrega | 41-48 | **1,6** | 5,4 MB / 1,05 MB gzip sin minificar (35 % comentarios); 3 engines por bundle; versiones irreproducibles; 672 commits sin push |
| F · Override por instancia / contrato app | 49-56 | **2,6** | Cadena prop→`data-*`→skin real; sin scope bajo tenant; `className` es el contrato de facto; Card sin hooks de geometría |
| G · Dirección del plan y honestidad de métricas | 57-68 | **1,6** | Gobernanza > producto; 62 % sin fórmula; F9 sin fecha (0 celdas/24 días); todo lote cero-delta; F4C no arrancó |
| H · Gates, tests e instrumentos | 69-78 | **3,4** | 8/8 gates de frescura verdes; receipts 134/134; pero 2/123 skins con test computado y policy de rojos no poblada |
| I · Integración en apps | 79-88 | **3,1** | bithire ejemplar y con e2e de 2 tenants; platform importa artefactos que el DS ya no produce; evnto fail-open |
| J · Documentación y DX | 89-96 | **1,5** | Tres "únicas autoridades" circulares; 4 cifras de avance; docs-engineering describe DaisyUI; 2.407 líneas antes de una respuesta |
| **Total** | **96** | **2,61 / 5 (52 %)** | |

## Los 10 bloqueantes (ordenados por urgencia) — estado tras la segunda pasada

| RC | Veredicto original | Veredicto revisado (06 §1) |
|---|---|---|
| RC-01 | BLOQUEANTE | Hecho confirmado (674 commits); fix push REFUTADO; PR desde rama espejo sí dispara CI; `docs/evidence/2026-08/` ya mitiga 63/99 |
| RC-02 | BLOQUEANTE | Cifras confirmadas; métrica léxica, no de producto; "20-25 %" RETIRADA; evidencia sighted se sostiene |
| RC-03 | BLOQUEANTE | REFUTADA en su formulación; deuda honesta = 760 canales modern sin productor (clase B); 0 `unset` en modern → ALTO |
| RC-04 | BLOQUEANTE | PARCIAL: `recipes.profile` confirmado; anatomía sí llega en bithire (no en evnto/platform); brecha `transportEquality` real y ya registrada; scope en registro PROHIBIDO, tier de instancia existe |
| RC-05 | BLOQUEANTE | Defecto confirmado; fix de Cloud REFUTADO (vacuo); fix correcto con plantilla existente; `responsive.posture` ya `OPEN_OWNER` |
| RC-06 | BLOQUEANTE | PARCIAL: denominador era andamio de normalización; sobrevive overlay de modo ≤10 semillas y `palette.dark` silencioso → MEDIA/ALTA |
| RC-07 | BLOQUEANTE | Hoja ≠ dial (normativo); sobrevive 0/20 `editorMetadata` + filtro Expert de profundidad 1 → ALTO |
| RC-08 | BLOQUEANTE | Next minifica → 344 KB gzip; higiene/DX, no red; engines 11 %; 5/1.024 en allowlist → ALTO no bloqueante |
| RC-09 | BLOQUEANTE | CONFIRMADO Y MÁS GRAVE: 49 archivos JS + CSS + alias + verifier; gates del DS en contradicción; lote F8 ya escrito |
| RC-10 | BLOQUEANTE | PARCIAL; el defecto grave es el de Codex: 294/290/67 ×3 y `program-check` circular |

La tabla original se conserva a continuación como registro histórico.

| # | Bloqueante | Brazos | Acción de menor costo |
|---|---|---|---|
| RC-01 | 672 commits sin push desde 2026-08-03; CI (visual, a11y, builds) nunca corrió; memos de auditoría efímeros | E-5, G-1, G-6 | `git push origin HEAD:refs/heads/modern-rescue/wip` (rama, no `main`, no publish); copiar memos a `test-artifacts/.../advisory/` |
| RC-02 | Divergencia entre verticales plana (34,7→34,5 %) y `SIGHTED_ACCEPTED = 0`; todo lote es cero-delta por ley; F4C no arrancó | G-2, G-7, 05 | Vertical slice F4C sobre 8 familias insignia con captura A/B 360/768/1280 |
| RC-03 | 2.169 / 4.373 canales `--ds-*` (49,6 %) sin camino a raíz — la mitad de la pintura es inalcanzable para cualquier dial | C-1 | Drenar por fan-out con el propio `cascade-wiring-ratchet` como mapa |
| RC-04 | Anatomía, recipe-profile y scope: `chrome.anatomy` sólo en el brazo DB y sin emisor en apps; `recipe-profile` muerto en estático; 22/22 capacidades `scope: tenant` | F-1, F-2, F-3, B-3, B-4 | Proyección estática de anatomía (1 función) + restituir `recipes` en config code-owned + `scope` en el registro |
| RC-05 | `shape.button-style` alcance 0; `surfaces.elevation-posture` identidad en bithire; 15/34 stops Pro compilan a cero | A-1, A-4, A-5, B-1 | `button.css:73` → `var(--ds-button-md-radius, var(--ds-radius-button, …))`; presets de elevación a 6 niveles; retirar o implementar stops muertos |
| RC-06 | El documento DB no puede expresar 5.763 de 7.933 hojas (72,6 %); dark mode = 10 hojas de paleta vs 492 del estático | A-2, A-3 | Abrir `palette.ramps`, `surfaces.elevations`, `modes.dark.{typography,surfaces}` en schema v1 |
| RC-07 | "Pocas decenas de diales" no se cumple: 2.212 hojas (2.080 texto libre), 0/20 `editorMetadata`, tenant de referencia 54 % por overrides crudos | B-5, B-8, B-12 | 6 diales faltantes (`focus.identity`, `control.size`, `surface.material`, `shape.geometry`, `surface.depth`, `type.weight`) que colapsan ~159 campos + los 37 overrides |
| RC-08 | Bundle 5,4 MB raw / 1,05 MB gzip por vertical, sin minificar, con los 3 engines; 26,6 % de `--ds-*` declarados nunca leídos | E-1, E-2, E-7 | `lightningcss --minify` en `dist/` (−65 % gzip); bundle por vertical×engine |
| RC-09 | app-platform importa `dist/platform.css` y `commercial.css` que el DS ya no produce (gate propio los prohíbe); 2.19.37 publicado desde commit colgante; evnto por symlink | I-1, E-3, E-4, E-6 | Lote mínimo app-platform en F8; anclar `a037d3a3c` en rama `release/2.19.37`; repin honesto de evnto |
| RC-10 | Tres documentos se autoproclaman única autoridad; 4 cifras de avance (74/27/62/0 %); el 62 % no tiene fórmula; docs-engineering describe el engine modern como DaisyUI | J-1, J-5, J-3, G-3 | Una autoridad generada; 4 métricas ancladas al manifest publicadas en cada asiento |

## Lo que está bien (y no hay que perder)

- Un solo lowering real, fail-closed 16/16 con `code`+`path`, restore por construcción (delta puro contra baseline), digest canónico (A).
- Cero hardcode de color en código real de los 123 skins modern; cero color literal en `style={}` de TSX modern; cero fuga de `--_ds-*` a las apps (C).
- app-bithire: pipeline theme→DOM con SSR embed + prepaint, 3 niveles de recuperación, fail-closed, 165 escrituras `--ds-*` 100 % dentro de `publicHooks`, y el único e2e que prueba dos tenants en una app real (I).
- Touch targets gobernados (92 %), safe-area en los 15 archivos que importan, RTL 97 % lógico, forced-colors 97 % / reduced-motion 92 % de los skins, AppShell con drawer real en compact (D).
- Ejes expresivos con enums cerrados y floors de a11y; precedencia dial > perfil bien resuelta en `--ds-radius-scale`; separación density/rhythm genuina (B).
- Instrumentos honestos: 8/8 gates de frescura verdes, 134/134 receipts, baselines decrease-only que sí drenaron donde se trabajó, un ledger que dice 0/5100 sin maquillarlo (H, G).

## Método

1. Marco de gobierno leído por el auditor (README del programa, `program/index.json`, `customization-model/index.json`, roadmap §0-§13, sucesión DT, ARCHITECTURE §1.5-1.11) y volcado a un contexto compartido (`brazos/00-contexto-compartido-briefs.md`) para que ningún brazo re-derivara el marco.
2. 96 ópticas repartidas en 10 clusters; cada brazo recibió sus ópticas numeradas, archivos de arranque y la ley de medición: cada cifra con su comando y alcance; todo grep con control positivo; nada de narrativa.
3. Read-only estricto: sin edits, sin `git` mutante, sin builds, sin vitest; sólo gates `--check`. El árbol es compartido y vivo (el DT commiteó durante la auditoría); cada brazo ancló su HEAD.
4. Verificación cruzada: A y B midieron la palanca de controles con instrumentos distintos (cierre transitivo de `var()` sobre fuente bundleada vs grafo CSS) y coincidieron en los dos controles de palanca cero. C y D re-verificaron sus cifras dependientes de `grep --include` con `find|xargs` (D corrigió 37→25 breakpoints por defecto propio de regex). F corrigió una premisa del brief (los 2.606 `unadjudicatedReads` son internos del DS, no de apps).
5. Lectura sighted propia del auditor con Playwright contra el showroom (`/probe/whitelabel-torture/scenes/*`), 4 tenants × 3 escenas × 2 anchos, con diff de canales `:root` y estilos computados (05).
6. Adjudicación final por Fable: severidad, deduplicación entre brazos, y contraste con la reauditoría del 2026-08-19 (`docs/history/audits/architecture-refactor/2026-08/execution-verification/index.md`): de sus 5 bloqueantes, el #1 (`/commercial` publicado y retirado de fuente) sigue abierto 9 días después; el #6 (gate antes de build) se resolvió cableando el gate post-build.

Escala: 5 cumple con evidencia reproducible · 4 deuda menor conocida · 3 parcial, dirección correcta · 2 parcial, dirección dudosa · 1 sólo intención/documento · 0 ausente o contradicho.

Esta carpeta no es autoridad del programa ni redefine su estado: es una auditoría independiente. Sus hallazgos entran al árbol canónico sólo cuando el DT los reproduce contra fuente, según la ley del programa.
