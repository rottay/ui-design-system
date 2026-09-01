# Rúbrica — 96 ópticas puntuadas

Escala 0-5 (5 cumple con evidencia reproducible · 4 deuda menor conocida · 3 parcial, dirección correcta · 2 parcial, dirección dudosa · 1 sólo intención/documento · 0 ausente o contradicho). Cada fila remite al informe de brazo en `brazos/` donde vive el comando exacto.

## A · Modelo de theme y paridad de transporte (Opus) — promedio 3,5

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 1 | Un solo `compileTheme` para ambos transportes | 4 | Ambos brazos terminan en `compileBrandTheme`; pero hay 2 emisores CSS con salida asimétrica (`color-scheme`, tinta raíz, `@media auto`) |
| 2 | Completitud del contrato `Theme` desde DB | 2 | 5.763 de 7.933 hojas que los 3 verticales escriben son inalcanzables desde el documento DB (72,6 %) |
| 3 | `ThemePatch` / merge determinista | 4 | `resolveTheme` deep-merge fail-closed; el mismo valor del tenant se aplica en 3 posiciones distintas |
| 4 | Fail-closed ante input inválido | 5 | 16/16 casos hostiles rechazados con `code` + `path` tipados |
| 5 | Restore exacto | 5 | Documento identidad → overlay de 0 variables; artefacto = delta puro contra baseline |
| 6 | Determinismo / digest / cache vs versión DS | 3 | Digest canónico, pero ni digest ni cache key incluyen versión del DS ni `baseThemeDigest`; `compilerVersion` es constante a mano (1 commit vs 24 de `package.json`) |
| 7 | Dark mode en contrato y transporte | 2 | Contrato mode-aware (492 hojas en `modes.dark` de bithire); el DB sólo escribe 10 hojas de paleta por modo; `palette.dark` inerte si `backgroundMode≠auto` sin aviso |
| 8 | Envelopes / bounds por vertical | 3 | Se aplican fail-closed; casi idénticos entre verticales (1 número difiere); el editor clampea 4 de 6 rangos → rechazos al publicar |
| 9 | Entrega runtime (SSR, FOUC, un solo camino) | 4 | SSR embebe `artifact.css` + prepaint; provider no pinta; resolver de 6 etapas es compat-only |
| 10 | Dos tenants = proyectos distintos (modelo) | 3 | 185 canales del tenant DB alcanzan 8.636/13.792 declaraciones modern (62,6 %, cota superior de dependencia); 2/13 Standard con alcance cero; engine, dark, rampas y anatomía >4 familias no pueden diferir |

## B · Palanca de controles y ergonomía de producto (Opus) — promedio 1,8

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 11 | Palanca real por control | 2 | "Lecturas vivas" cuenta canales *declarados* (`representativeOnly`): `density.mode` publica 8, su canal real tiene 329; `shape.button-style` publica 2, pinta 0 archivos |
| 12 | Ortogonalidad | 2 | Gate Jaccard inerte por construcción (sólo celdas APPLICABLE; hay 0); medición propia: `profiles.expressive`×`shape.radius-scale` J=0,874, `typography.families`×`pairing` J=0,806 |
| 13 | Modelo objetivo 9+7 vs operativo 13+7 | 1 | `PROPOSED_NOT_IMPLEMENTED`; `focus.identity`, `type.weight`, `control.size`, `motion.character` no existen como canal ni dial en ningún tier |
| 14 | `control.size` / tamaño desde la app | 1 | Sin dial de tamaño a nivel tenant; `data-size` por instancia funciona (71 skins); "todos mis inputs son lg" no es expresable |
| 15 | Familia + intensidad (enums cerrados) | 2 | De 2.212 hojas del documento `advanced`, 2.080 son `visual-value` texto libre (94 %) y 23 enums; `pro.groupEmphasis` no existe en el esquema |
| 16 | Expert allowlist como producto | 2 | Mediana 2 archivos CSS por token; 155/290 mueven ≤2; los 5 de mayor alcance ya son Standard; `--ds-focus-ring*` (164 lecturas) fuera de la lista; console muestra 290 en lista plana |
| 17 | Recipe groups 3 vs 14 | 2 | 2 operativos; `collection-card-anatomy` (el de cards) `PROPOSED_NOT_OPERATIONAL`; `recipe-profile` no llega a runtime estático |
| 18 | Art direction (12 requiredGroups) | 3 | R1 medido: 9 ejes divergentes, 8 no-color; 2 sin portador en producción (`--ds-recipe-profile` 0 lectores, `data-anatomy-*` sin emisor); 4 grupos sin instrumento; R1 = NO GO Codex |
| 19 | Experiencia del editor | 1 | 0/20 controles con `editorMetadata`; campo sin domicilio en `schema.json`; app-platform etiqueta con `humanizeKey()`; vocabulario de densidad distinto entre runtime y control |
| 20 | Veredicto: ¿dos proyectos distintos con los diales? | 2 | Sí, pero no con los diales: el tenant DB de referencia usa 37 `tokenOverrides` crudos (54 % de 68 valores); divergencia medida 349/1.301 canales (27 %) |

## C · Cascada y censo de hardcodes (Sonnet) — promedio 3,4

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 21 | Hex literales por rol en skins modern | 5 | 0 hex en código real de 123 archivos (16 son `#000` en `mask-image`); control positivo rustic=303, presentation=89 |
| 22 | `rgba/hsl/oklch` literales en skins modern | 5 | 0 en código; 10 sólo en comentarios |
| 23 | `px/rem` literales por rol | 3 | 1.569 lecturas bare; mayoría geometría legítima; `44px` tokenizado en ~40 archivos y bare en ~15 |
| 24 | Canales huérfanos (sin camino a raíz) | 2 | `cascade-wiring-ratchet` en vivo: 2.169/4.373 (49,6 %) sin camino; 2171→2169 en toda la ola F3 |
| 25 | Profundidad de fallback | 3 | 74 % depth-0; 31 % de 10.556 lecturas top-level terminan en literal; 69 % sin red |
| 26 | Duplicación presentation/skin vs modern/skin | 4 | 4/123 basenames colisionan, namespaces disjuntos → 0 doble emisor |
| 27 | Inline `style=` en TSX modern | 4 | 0 bloques con color literal en 135 archivos; uso bruto 370 ocurrencias en 124/135 (no "un dígito" como volumen) |
| 28 | Namespace `--_ds-*` | 2 | 196/380 (51,6 %) se leen y nunca se declaran ni setean; 0 fuga a apps |
| 29 | Leakage rustic/classic y `styles/modern.css` | 4 | 0 leakage real; `styles/modern.css` duplicado dentro de cada bundle y sin importadores reales (export muerto) |
| 30 | Brand-themes "mirror" (F4A) | 2 | Roster idéntico (12 secciones) pero evnto 346 asignaciones vs 1.707/1.510; `#2A2A2F` restateado 70× como literal en rottay |

## D · Responsive, mobile, whitespace, resiliencia (Sonnet) — promedio 3,4

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 31 | Cobertura `@container/@media` por capa | 3 | surfaces 28/36 (78 %), structures ~31/39; 4 structures sin evidencia; no hay campo familia→CSS declarativo |
| 32 | `responsive.posture` (Pro) | 1 | Único consumidor `adaptive-layout`; `widget-board.css:1517,1532` hardcodea 639/839 sin leer el axis |
| 33 | Shell / navegación mobile | 4 | `app-shell` usa `useBreakpoints()` real → drawer overlay en compact; `bottom-tab-bar` vía `:has()` |
| 34 | "Sin espacios en blanco" | 3 | 13 `repeat(N,…)` fijos sin query adyacente; `max-width` mayormente en `ch` |
| 35 | Touch targets 44px | 4 | `--ds-touch-target-min` en 107/116 bloques `pointer: coarse` (92 %) |
| 36 | Safe areas / viewport units | 4 | `env(safe-area-inset-*)` en los 15 archivos relevantes; `dvh/svh` siempre tras `@supports` |
| 37 | RTL lógico vs físico | 3 | 4.717 lógicas vs 153 físicas (97 %); las físicas están en `drawer/sheet/overlay-modal` con safe-area (los shells móviles) |
| 38 | `forced-colors` / `reduced-motion` | 4 | 119/123 y 113/123 skins; `MotionPolicy.reduce` también en compilador |
| 39 | Contraste / APCA vs cascada | 3 | `validateCompiledThemeContrast` sí evalúa el cascade compilado y rechaza; cubre 4 roles fg + 4 pares sidebar + overrides explícitos (8 de ~7.088 variables) |
| 40 | Evidencia sighted mobile | 5 | Specs Playwright 280-1440 px con veto de overflow + PNG comiteados; pero su job de CI no corrió en 25 días (ver G-1) |

## E · Performance y entrega (Sonnet) — promedio 1,6

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 41 | Peso del bundle explicado | 1 | 35,4 % del raw son comentarios (1.898.537/5.356.168 B); cero minificador; gzip 1,04 MB → 368 KB al quitarlos (−65 %) |
| 42 | Uso real por página | 1 | classic+rustic embebidos incondicionalmente en `bithire.css` (615 `.ant-` + 1.999 `rustic`); ≥6 % del artefacto por selector |
| 43 | `--ds-*` declarados vs leídos | 2 | 1.024/3.853 (26,6 %) declarados en `:root` nunca leídos en el mismo bundle |
| 44 | Estrategia de carga en apps | 2 | Un `@import` en `globals.css`, cero splitting; chunk único de 4,3 MB en `.next/dev` |
| 45 | Fuentes | 3 | Self-hosted, swap, latin, variable; bithire evita el subpath on-demand del DS y carga Fraunces vía `next/font/google` en paralelo |
| 46 | JS: dist, sideEffects, tree-shaking | 4 | `sideEffects` acotado a CSS; `import()` dinámico por engine; 15 `export *` en `src/index.ts` (§1.11 pendiente) |
| 47 | Versionado / publicación | 0 | 2.19.37 desde commit `a037d3a3c` fuera de toda rama; `dist/platform.css` borrado en `dd3496343` ("Sin push") y aún importado por platform |
| 48 | Commits sin push / higiene | 0 | 672 commits desde 2026-08-05 sólo locales; `.git` 426 MB; `test-artifacts/` 98 MB / 881 archivos versionados |

## F · Override por instancia y contrato app/DS (Opus) — promedio 2,6

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 49 | Mecanismos sancionados por instancia | 3 | Cadena prop→`data-*`→skin real (`card.css:158,370-391`); sin contrato general (`recipe?:` en 3 familias, `data-variant` 84/1.200 archivos) |
| 50 | Escape hatch y vía oficial | 2 | `className`/`style` llegan al DOM raíz sin regla ESLint; 91 hooks cubren 15/255 familias; los 3 hooks de Card "override nothing" |
| 51 | Theming por subárbol | 3 | `density.css` es un contrato de subárbol correcto; `DensityScope` con 0 consumidores; 3 mecanismos paralelos de densidad |
| 52 | `chrome.*` por surface/ruta | 1 | 22/22 capacidades `scope: 'tenant'`; R7 sin eje de scope; `chrome.anatomy` `derivedChannels: []` y sin emisor estático |
| 53 | Surfaces bajando directivas | 3 | Cascada de 3 niveles real en 30/39 surfaces; media 4,33 ejes consumidos de 21; 0 usos de `profileOverrides` en apps |
| 54 | CSS de app que sombrea al DS | 4 | 165 escrituras de bithire 100 % `PUBLIC_HOOK_SCOPED`; 44 hex en 918 CSS; 1 regla pinta selector DS con literal |
| 55 | `hooks-manifest` / `unadjudicatedReads` | 3 | Premisa del brief corregida: son lecturas internas del DS (41,6 % de 6.263); las apps leen 0 canales internos |
| 56 | Contrato mínimo para el caso del owner | 2 | Las 4 piezas existen a medias y ninguna conectada; propuesta `SurfaceScope` + `tokens` prop + paridad de anatomía |

## G · Dirección del plan, métricas y proceso (Opus) — promedio 1,6

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 57 | Secuencia de fases | 2 | 18,7 % de commits tocan pintura; 0,2 % de líneas agregadas son skin CSS; F4C no arrancó |
| 58 | Métrica 62 % / 43 % | 1 | Sin fórmula; "comercial" no definido; 7 KPIs con fórmula en `customization-model/index.json` sin reportar; "sin mover" en ≥15 lotes |
| 59 | Costo de las 5.100 celdas | 1 | 0 celdas adjudicadas en 24 días; F4B declaró 94 y siguen UNKNOWN; proyección 51-217 días de flota sólo para F9 |
| 60 | F3 "un dígito" | 3 | Honesto para el pool del regex; deuda real de literales inline en modern: ~13 sitios (chart renderers `fontSize`, Progress, Countdown, `#ddd`) sin dueño de fase |
| 61 | F4B "cierre honesto" | 2 | 10/20 `SOURCE_BOUND` = diferimiento con nombre nuevo, rotulado honestamente |
| 62 | Deuda diferida F2 | 2 | ≥12 ítems corridos de fase; `channel-liveness` 49 probados no drenables por el conjunto seguro |
| 63 | Peso del instrumento | 1 | 124.620 líneas de scripts vs 89.080 de skin+themes (1,40:1); 38/105 gates son drills; ≈51 % del blocking no mira al producto |
| 64 | Riesgo operativo | 0 | 672 sin push; CI nunca corrió; 100/116 memos citados no existen; 4 relevos de DT en 10 días |
| 65 | Alcance F8 sólo BitHire | 1 | El brazo DB se ejercita sólo por fixture en showroom; app-platform (la DB-driven) en HOLD |
| 66 | Decisiones del owner | 3 | Coherentes salvo la 14; `palette.status-seeds`/P0 pendiente bloquea el frente vivo |
| 67 | Riesgo de regresión visual vs mejora | 1 | Todo lote cero-delta por ley; 6 PNG sighted de una familia (11-ago); `playwright` 0 veces en el roadmap |
| 68 | Veredicto de dirección | 2 | Divergencia real 34,7 → 34,5 % en 670 commits; el plan no mueve el eje del owner |

## H · Gates, tests e instrumentos (Sonnet) — promedio 3,4

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 69 | Inventario de gates | 4 | 103 blocking + 2 excluded con owner/razón; sin timing persistido |
| 70 | Baselines decrease-only | 3 | 24 archivos; 5 drenan de verdad (`tsconfig.tests` 410→0, `scripts-tree` 25→4); 17 congelados desde su alta |
| 71 | `program-check.mjs` | 3 | `CONSTITUTION_READY`, ~145 checkpoints, ~100 % documental (JSON contra JSON) |
| 72 | Política de tests rojos | 1 | Baseline `fb1e200ca` (25 rojos) nunca re-corrida; 4/25 clasificados, todos UNVERIFIED, scope auto-limitado |
| 73 | Tests "sham" | 5 | 0/25 en muestra; el censo de 23 archivos de la memoria es de otros repos |
| 74 | Cobertura de skins por estilo computado | 1 | 24/1.205 test files usan `getComputedStyle`; 2/123 skins con match directo; polyfill con acceso tipado (trampa happy-dom) |
| 75 | Sellos y receipts | 5 | `gat07:check` EXIT 0; 134/134 receipts sin SUPERSEDED |
| 76 | Artefactos generados vs fuente | 5 | 8/8 gates read-only EXIT 0; `dist/` fresco |
| 77 | Typecheck (alcance) | 3 | `tsc` sólo `src/`; 257 `.mjs` de `scripts/`+`manifest/` (los 103 gates) sin typecheck jamás |
| 78 | Flakiness / escritura fuera de tmpdir | 4 | 0 tests escriben fuera de `tmpdir()`; el fixture culpable de hace 9 días está reparado con assert |

## I · Integración en apps (Sonnet) — promedio 3,1

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 79 | Theme→DOM en app-bithire | 5 | SSR embebe `<style id=ds-runtime-tenant-theme>`; request-time, cache acotado, LKV, fail-closed |
| 80 | Theme→DOM + editor en app-platform | 3 | Editor draft/preview/publish real; shell vivo sin `<style>` SSR; `catch { return null }` |
| 81 | Theme→DOM en app-evnto | 2 | Mecánica SSR de bithire pero fail-open: caída de DB → identidad Evnto bajo dominio del tenant |
| 82 | Bounded branding fail-closed | 4 | Allowlist real + `reportDrop` + bloqueo de `javascript:`/backslash |
| 83 | Hardcodes en apps | 2 | `style={{`: bithire 91 (53 archivos) vs platform 8.792 (326) y evnto 5.939 (234); hex pelado sólo en platform (6 archivos) |
| 84 | Consumo de API pública | 2 | 0 imports JS profundos; `@import '@rottay/design-system/dist/platform.css'` es el único subpath profundo y es el que rompe |
| 85 | CSS de apps redeclarando `--ds-*` | 5 | bithire 165/91 nombres 100 % `publicHooks`, 0 en `:root`; platform/evnto 0 |
| 86 | Duplicación de componentes DS | 4 | ~50 carpetas candidatas siguen el patrón `detail/form/table/card`; muestreo consume `Card`/`Table` del DS |
| 87 | Paridad de versión y artefacto | 0 | `platform.css`/`commercial.css` no existen en el DS 2.19.36; gate `platform-identity-zero-gate` los prohíbe; el instalado 2.19.35 aún los trae |
| 88 | E2E del tenant DB | 4 | `app-bithire/tests/e2e/two-systems/divergence.spec.ts` (captura + diff + tokens); evnto y platform sin equivalente |

## J · Documentación, DX y mantenibilidad (Sonnet) — promedio 1,5

| # | Óptica | Pts | Evidencia |
|---|---|---|---|
| 89 | Sprawl de autoridad | 0 | README:3-6, ROADMAP:683-684 y `program/index.json.statusAuthority`→README:45 se declaran única autoridad en círculo |
| 90 | Tres roadmaps | 1 | `ROADMAP-DE-REMEDIACION.md` (Ola 1-7) huérfano; `registry.json` `notes` de WO-CRA-23 STALE por escrito |
| 91 | docs-engineering sync | 1 | Gaps 10-38 días en los 4 docs obligatorios; `runtime/engines/README.md` describe modern como DaisyUI (drenado a 0 por gate vivo) |
| 92 | Onboarding | 1 | CLAUDE.md↔AGENTS.md circulares; 2.407 líneas mandatadas antes del campo operativo (`chrome.cardComponent`) |
| 93 | Idioma y vocabulario | 1 | 14/14 términos del programa sin definición en glosario ni en lugar único |
| 94 | Nombres y estructura | 4 | folder/index: 0 archivos sueltos (control positivo 0); 12/90 scripts con id histórico opaco |
| 95 | Showroom como doc viva | 2 | Registries 274 vs 237 canónicas (+15,6 %); theme-builder no expone ninguno de los 20 controles |
| 96 | Deuda documental | 2 | 0 `TODO:` reales; 84 menciones de "deuda" dispersas en §13 sin registro único con dueño |

## Distribución

| Puntaje | Ópticas | % |
|---|---|---|
| 5 | 14 | 15 % |
| 4 | 19 | 20 % |
| 3 | 22 | 23 % |
| 2 | 22 | 23 % |
| 1 | 15 | 16 % |
| 0 | 4 | 4 % |

Las 4 ópticas en 0 son todas de proceso/entrega (versionado, commits sin push, riesgo operativo, sprawl de autoridad), no de arquitectura. Las 14 en 5 son todas de mecánica ya construida (fail-closed, restore, cero hex en skins, receipts, gates de frescura, pipeline de bithire). La distribución dice lo mismo que el veredicto: la máquina está bien hecha y el producto no la usa todavía.
