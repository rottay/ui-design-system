# 06 · Reauditoría adversarial de Cloud sobre sí misma, Codex y Kimi

**Fecha:** 2026-08-28 (segunda pasada) · **Auditor:** Fable (Cloud), con 8 brazos read-only nuevos (P1-P8, informes íntegros en `brazos-v2/`, scripts en `evidencia/scripts-v2/`, listas de nombres en `evidencia/datos-v2/`).
**Regla:** ninguna de las tres lecturas (Cloud original, Codex, Kimi) tiene razón por autoridad. Cada hecho base se reprodujo desde fuente o desde un instrumento durable del programa; se separa cifra / interpretación / causalidad / severidad / fix.

## 0. Estado del árbol

| | Valor |
|---|---|
| HEAD auditado originalmente | `dcc44a6093de0ba4f9dcbdb733ae467008cffb21` |
| HEAD al abrir esta reauditoría | `dcc44a6093de0ba4f9dcbdb733ae467008cffb21` (18:15 UTC) |
| HEAD al cerrar | `f166570d92433fe1437133975732003c1fd29a32` |
| Commits entre ambos | 2, del DT en vivo: `ecdc01a61` (fix `schemaVersion` fail-closed en `public-entrypoint-boundary-gate`) y `f166570d9` (asiento §13 del microfix + deuda nueva: un drill de `cascade-producers` muta el artefacto real en disco) |
| `git diff --stat dcc44a6..f166570d9` | 3 archivos: `docs/history/programs/architecture-refactor/2026-08/execution/index.md` (+18), `public-entrypoint-boundary-gate/index.mjs` (+30), `index.test.mjs` (+95/−9) |
| `git status --short` al abrir | ` M` los 2 archivos del gate (el fix en worktree, no commiteado) + `?? docs/reauditoria-cloud/` |
| `git status --short` al cerrar | sólo `?? docs/reauditoria-cloud/` |
| Escrituras de esta reauditoría fuera de `docs/reauditoria-cloud/` | **0** (cada brazo cerró con `git status --short`; los 2 archivos modificados los commiteó el DT, no esta sesión) |
| Cambios que los brazos midieron y que el drift toca | **0** — cada brazo verificó que sus archivos de evidencia no están en el diff |

Consecuencia directa: **la decisión D3 de Kimi ("autorizar el commit del fix `schemaVersion`") quedó consumida por el DT durante esta reauditoría**; ya no es una decisión pendiente. La afirmación de Kimi de que el worktree estaba "mezclado con cambios ajenos en `producers.json`" no se reproduce (el diff eran exactamente 2 archivos).

## 1. Matriz final RC-01…RC-10

Leyenda: **C** = CONFIRMADA · **CC** = CONFIRMADA CON CORRECCIÓN · **P** = PARCIAL · **R** = REFUTADA · **NR** = NO REPRODUCIBLE.

| RC | Cloud original | Codex | Kimi | **Veredicto Cloud revisado** | Quién tenía razón |
|---|---|---|---|---|---|
| RC-01 commits/CI/memos | BLOQUEANTE; fix = push a `modern-rescue/wip` | PARCIAL; push viola la cerca; 63/11/36 memos | hecho confirmado; fix refutado; prefiere rama espejo + tocar `ci.yml` | **Hecho: C** (672 → 674 durante la sesión). **Fix: R** (viola 8+ cercas absolutas; la rama no existe; sólo el owner). **CI: CC** — un push a rama WIP no dispara nada, pero un **PR desde esa rama hacia `main`/`develop` sí** (`pull_request.branches` filtra por destino). **Memos: CC** — 100/116 (universo `docs/*.md`) y 63/11/36 (universo roadmap, subconjunto exacto) son ambos correctos; `docs/evidence/2026-08/` (65 snapshots con SHA, commiteado desde 23-08) es una mitigación parcial ya en marcha que ninguno de los tres nombró; no existe script de reanclaje | Codex/Kimi en el fix; Cloud en la cifra; **nadie** en el matiz PR ni en la mitigación existente |
| RC-02 divergencia plana / sighted 0 | BLOQUEANTE; 34,7→34,5 %; "20-25 %" | PARCIAL; métrica léxica, plana por diseño | números confirmados; causalidad parcial | **Cifras: C** (Codex las reprodujo desde git). **Interpretación: CC** — es una señal léxica de artefactos, no computed; plana por ley cero-delta; sirve como señal de que nada visible se movió, no como prueba de arquitectura fallida (Cloud nunca dijo "arquitectura fallida": dijo "dirección correcta, secuencia incorrecta"). **"20-25 %": RETIRADA** (sin modelo). La evidencia sighted propia (recolor + font swap) **se sostiene** y los tres la aceptan | Codex en la etiqueta de la métrica; Cloud en la evidencia sighted |
| RC-03 cascada 2169/4373 | BLOQUEANTE; "mitad de la pintura inalcanzable"; drenar por fan-out | REFUTADO en formulación; usar `root-membership`/`channel-liveness` | número confirmado; interpretación no resuelta; reconciliar primero | **R en su formulación** (ver §2.3). El ratchet llama "raíz" a cualquier nombre dentro de un fallback (control A: un nombre inventado "cablea"; control B: un canal declarado en `:root` del mismo archivo es deuda) y su corpus excluye los archivos de raíz. **0 canales `unset` en modern**; 64 huérfanos reales, todos rustic. **Deuda honesta: 760 canales de modern con literal de último recurso y sin productor** (960 corpus). 170 nombres contradicen `root-membership`. **Pero** los instrumentos de Codex tampoco miden esta deuda: `33 no-LIVE ∩ 2169 = 0`, `channel-liveness.emitted = 117` es un sub-conteo (36 patrones interpolados sin resolver) | Codex en la refutación; **nadie** tenía la cifra honesta (760) ni la contradicción (170); Kimi en "reconciliar primero" |
| RC-04 anatomía / recipes / scope | BLOQUEANTE; anatomía sin emisor en 3 apps; sin eje de scope | PARCIAL; anatomía sí pinta en bithire; scope mezcla mecanismos | PARCIAL; primero explotar lo construido | **P.** `recipes.profile` perdido: **C** (los tres). "Sin llamador en las 3 apps": **R para bithire** (falso negativo de B-4: `layout.tsx:36,194`, `ssr:98`, hook `:177/246`), **C para evnto/platform**. Brazo estático inerte: **C** (compilación A vs B byte-idéntica) **pero no es nuevo**: `manifest/controls/chrome.anatomy.json` ya lo registra como `STRUCTURALLY_UNREACHABLE`. "Autoridad duplicada" (Codex): **P** — en el DS la autoridad es única (DB); la duplicación es DS-DB vs app-estático, y `transportEquality.inventory` **incluye "root attributes"**: es brecha de paridad por la letra de la ley. "Sin eje de scope": **R en su formulación** — el tier de instancia existe (`resolutionOrder[5]`, `SurfaceVisualOverrides`, `RecipeProfileProvider` anidable); lo que falta es alcance al DOM y adopción. Meter `scope` en `TenantCapabilityDeclaration`: **PROHIBIDO** por ley fechada (`vocabularyDomicile.prohibited[2]`, 2026-08-18) | Codex en el freno; Cloud en la brecha de paridad; Kimi en la vía intermedia (con la cifra corregida: 23 surfaces, no ~30) |
| RC-05 button-style / elevación / stops | BLOQUEANTE; fix = fallback de 1 línea | CONFIRMADO; fix vacuo; `responsive.posture` es data deliberada | idem; retira su propio fallback | **Defecto: C** (los tres). **Fix de Cloud: R** — `--ds-button-md-radius` está declarado incondicional en `:root` (`presentation/components/button.css:47-48`) y el artefacto lo re-declara; el fallback intermedio nunca dispara. **Fix correcto:** la rama `buttonStyle` de `appearance-posture` debe escribir `--ds-button-{xs..xl}-radius`; **el patrón ya existe** en `chrome-variables/index.ts:1742-1746`. Elevación: **C** (0/4/5 nunca; `soft={}`; `flat` = baseline autoral de bithire byte a byte). `responsive.posture`: **CC** — el gap ya estaba en el manifest como `OPEN_OWNER`; "emitir CSS" no es fix mecánico (el propio manifest explica por qué el CSS espeja los literales) | Codex/Kimi |
| RC-06 transporte DB 72,6 % / dark | BLOQUEANTE | REFUTADO como métrica; 52,4 % sobre definidas; overlay bounded | PARCIAL; la cifra no manda | **P.** Las cinco cifras reproducen exactas (7.933 / 2.198 / 5.763 / 5.187 / 2.746 / 1.439). **Pero** los tres verticales tienen **el mismo set de 7.935 keypaths** (`DEFAULT_CHROME_SHAPE` normaliza a espejos estructurales): el denominador de Cloud es un dispositivo de normalización, no "hojas escritas". La ley exige salida idéntica para valores equivalentes y **DB ⊆ estático** (`transportEquality`, `static-db-channel-vocabulary.test.ts`), no completitud. Por vertical: 43,4 % / 58,8 % / 52,8 % inexpresable, con el overlay de modo como 71-75 % del hueco. Lo que sobrevive: overlay de modo ≤ 10 semillas (**ALTA**), 6 familias chrome sin campo en el schema (**MEDIA**), `palette.dark` descartado en silencio (deliberado en código, mudo en el editor — **ALTA para DX**). `ramps` y `elevations` son rottay-only; `materials` tiene 0 autorías | Codex en la métrica; Cloud en el hecho del dark silencioso; Kimi en "qué necesita el editor" |
| RC-07 2.212 hojas / editor | BLOQUEANTE | PARCIAL; hoja ≠ dial; 6 diales exceden el modelo | PARCIAL | **Conteos: C.** "2.212 contradice pocas decenas": **R** — 36 `general` + 7 `profiles` son exactamente 13+7; las 1.875 + 290 son la escotilla Expert, y la ley ya dice "not 294 sliders". El editor segmenta por familia (Select de 49). Lo que sobrevive **con más fuerza**: 0/20 `editorMetadata`, y **el filtro Expert del console no propaga en la recursión → 606/607 hojas de `chrome.controls` inalcanzables por búsqueda** (nuevo). Los 6 diales: decisión del owner, no backlog. El tenant de referencia con 54 % por overrides crudos (B-12) queda como evidencia de gap de capacidad, no disputada | Codex; nadie vio el defecto del filtro |
| RC-08 CSS 5,4 MB | BLOQUEANTE de red | PARCIAL; Next ya minifica → ~344 KB gzip | tamaño confirmado; impacto sobredimensionado | **P.** `styles/` ≡ `dist/` byte a byte; Next 16 `next build --webpack` minifica con `cssnano-simple` → **3.052.989 raw / 344.487 gzip**, reproducido con la misma librería (Codex 344.492: 5 bytes de header). **No es bloqueante de red para las 3 apps Next**; es higiene de distribución/DX y bloqueante sólo para consumidores no-Next. Engines classic+rustic: **11,0 % del gzip minificado** (mayor que el 6 % piso de Cloud, porque los comentarios purgados no eran de engine). De los 1.024 declarados-no-leídos, **sólo 5** están en la allowlist Expert. El fallback de `typography.pairing=editorial` es **explícito y curado** (`Georgia, serif` en `TYPE_PAIRINGS`): el gap es de validación/aviso, no de diseño | Codex; nadie midió engines post-minify ni la intersección con la allowlist |
| RC-09 versionado / apps | BLOQUEANTE (4 CSS) | CONFIRMADO y más grave (53 imports JS) | confirmado lado DS | **C y más grave.** 53 líneas / 49 archivos del entrypoint `/commercial` retirado; 13/15 símbolos migran por specifier, `TreeView` cambió de identidad (`TreeViewConnector`/`PatternTreeView`), `ProductWindow` vive sólo en showroom; 5 alias en `next.config.ts`; `USE_LOCAL_DS=true node scripts/verify-local-ds.mjs` → exit 1 hoy. **Nuevo:** un gate del DS (`dependency-honesty:3208`) **exige** el alias que `platform-identity-zero` prohíbe producir; el lote F8 con dueño ya estaba escrito el 19-08 (§0.4/§11/§12.6) y `ProductWindow` sigue sin decidir; `a037d3a3c` está **empaquetado** (no cae por GC rutinario; sí por `gc --prune`/`repack -ad`); el symlink de evnto es un modo gobernado (`link-local-ds.mjs`) **pero** no documentado en la app, no sobrevive a `pnpm install`, y **dispararía un `pnpm build` en el repo DS** si se corre hoy (`ensureLocalDsArtifacts`) | Codex; Cloud subestimó; nadie vio la contradicción de gates ni el build cruzado |
| RC-10 autoridades / métricas | BLOQUEANTE | PARCIAL + hallazgo 294/290/67 | confirmado; 67 no reproducido | **P + hallazgo Codex confirmado y ampliado.** Circularidad textual de las tres autoridades: **C** (es texto, no juicio); su gravedad: juicio. 62 %/43 %: sin fórmula (los tres). **294/290: C** — fuente viva 290 (67 literales + 160 + 63 por spreads), constitución 294 en 4 archivos + 4 checks de `program-check` que comparan copias entre sí. **"67": C, tres veces** (`cascade/roots/token-overrides.json:11,21`, `cascade/materialized/token-overrides.json:12`): error de lectura que ignora los spreads. Kimi "no reproducible": **R** (gap de búsqueda). Docstring `tenant-reach:178` "yields 71" también stale | Codex; Cloud no lo vio; Kimi lo verificó a medias |

## 2. Adjudicación expresa de los 12 puntos

### 2.1 Expert allowlist 290 / 294 / 67
- **Fuente viva:** `TENANT_THEME_OVERRIDE_TOKENS` = **290** ejecutando `overrideTokens()` real (`tenant-reach/index.mjs`): 67 literales + `TENANT_SEMANTIC_SURFACE_TOKENS` 160 + `TENANT_SEMANTIC_TYPOGRAPHY_TOKENS` 63. Antes de `dcadb84743` (commit-checkpoint masivo que retiró 4 `--ds-color-dark-*` muertos): 71 + 223 = 294.
- **Constitución:** `program/index.json:65`, `customization-model/index.json:296`, `rounds/index.json:446`, README:75 = 294; `program-check.mjs` líneas 643-644, 699-700, 892, 1276-1277 comparan copia contra copia contra el literal 294; **0 imports** de la fuente viva. `CONSTITUTION_READY` es verde porque las copias concuerdan entre sí.
- **"67":** literal, tres veces, describiéndolo como "contados en fuente" — cuenta las líneas del array e ignora los dos cross-products, exactamente la trampa que el docstring de `tenant-reach:170-181` advierte. `manifest/controls/token-overrides.json:65` sí dice 290: la capa `controls/` está bien, la capa `cascade/` no.
- **Veredicto:** Codex CONFIRMADO íntegro; Kimi refutado en "no reproducible". **Fix correcto:** T-1 constitucional 294→290 en 4 archivos + 4 checks, **más un quinto check que compare contra `overrideTokens()`** (sin él, vuelve a driftar en silencio); corregir "67" → "290 (67 + 160 + 63)" en los 2 archivos de `cascade/`; docstring "71" → "67". **No hacer:** subir el número sin el check contra fuente.

### 2.2 `schemaVersion`
- **HEAD auditado:** `evaluateCeilings` no mencionaba `schemaVersion`; ejecutando la función real de HEAD, las 7 formas (ausente, `null`, `999`, `"1"`, `0`, `true`, `1`) devolvían `[]`. **Defecto CONFIRMADO.**
- **Worktree → ya HEAD:** `CEILINGS_SCHEMA_VERSION = 1`, `===` estricto en lectura y en `writeCeilingsBaseline` (antes de leer/escribir), re-escritura explícita post-spread; 5 drills nuevos; `node --test` 25/25 (fixtures sólo en `tmpdir`); único lector del baseline son esos 2 archivos; el baseline real ya declara `schemaVersion: 1`. **Suficiente.** Commiteado por el DT como `ecdc01a61` durante esta reauditoría.
- Kimi "mezclado con `producers.json`": **REFUTADA** (diff de 2 archivos exactos).

### 2.3 Cascada — reconciliación sobre el mismo universo
Los tres instrumentos casi no se solapan:

| Instrumento | Unidad | N |
|---|---|---|
| `cascade-wiring-ratchet` | nombre leído como 1er arg de `var(` en 391 skins (modern 123 + rustic 111 + presentation 157; classic 0) | 5.142 read → 4.373 denominador → **2.169** deuda |
| `root-membership` | canal emitido por ≥1 slot autorado de los 3 brand themes | 1.610 → 881 con raíz / **729** sin atribuir |
| `channel-liveness` | override ∪ reference ∪ emitido-concreto | 440 → 407 LIVE / **33** no-LIVE / 48 findings (checkpoint dice 49: stale por uno) |

Intersecciones: `2169 ∩ 1610 = 323` (85 % de la deuda son canales que ningún compilador de tenant emite); `2169 ∩ 881 con raíz = 170` (**contradicción directa**, 3 de ellos `head-exact`: `--ds-color-accent`, `--ds-gradient-primary`, `--ds-motion-intensity`); `2169 ∩ 729 = 153`; `33 ∩ 2169 = 0`.

Los 840 "sin fallback": 706 (84 %) declarados en `src/**/*.css`; 70 con productor TSX; **64 sin productor en ningún plano, todos rustic; 0 en modern**. Los 1.329 "con literal": **960 (72 %) sin productor alguno, 760 en modern**. La severidad que Cloud asignó estaba invertida. Del top-10 de Cloud, los 5 "sin fallback" están todos declarados (`--ds-elevation-surface-3` en `themes/default.css:831`; `--ds-color-primary-600` en los 3 artefactos de tenant).

**Veredicto:** "2.169 a drenar" es interpretación incorrecta. La deuda honesta es **clase B: 760 (modern) / 960 (corpus)** — canales cuyo único valor es el literal de fallback. Ningún instrumento la mide hoy. Fix correcto: reconstruir el clasificador de raíz desde `root-catalog.json` leyendo declaraciones en todo `src/**/*.css` + artefactos (el bloqueo PRE_F4B que el propio baseline documenta), re-anclar el ratchet sobre la clase B, gate de contradicción cruzada (170), corregir checkpoint 49→48. Listas de nombres en `evidencia/datos-v2/`.

### 2.4 `--_ds-*`
Cloud 196 reproduce **sólo con regex sobre texto sin stripear comentarios** (2 "declaraciones" viven en comentarios de `saved-views.css` y `textarea.css`); con PostCSS: **198** consumidos sin declaración, **194 con fallback en toda lectura**, 4 sin fallback con productor TSX real (`--_ds-dropdown-arrow-anchor-offset`, `--_ds-grid-{column,row}-gap`, `--_ds-toast-undo-ring-circumference` en `UndoToast/index.tsx:232`). **Exposición runtime = 0.** Codex CONFIRMADO. Queda un defecto de gobierno (sin gate productor/consumidor), no de pintura.

### 2.5 `shape.button-style`
Defecto confirmado por los tres. Fix de Cloud **vacuo** con prueba de cascada (declaración incondicional en `:root` + re-declaración en artefacto; semántica de `var()`). Fix correcto: fan-out por tamaño en el compilador, ~6 líneas, con plantilla viva en `chrome-variables/index.ts:1742-1746`; prueba computed en 5 tamaños × 3 stops; corregir el `evidence.symbol` del registro (testigo que apunta a un canal que el control no escribe, hoy neutraliza `controls-catalog --check`).

### 2.6 Anatomía / recipes / scope
Ver RC-04. Tres hallazgos de instrumento nuevos (P4): **N-1** `theme-channel-parity-gate` exime las 4 hojas estáticas `Brand*Chrome.anatomy` del denominador citando como productor `tenantThemeAnatomyAttributes`, que sólo corre para el transporte DB (`--check` EXIT 0 mientras el campo es byte-inerte en estático); `staticDoorDisposition` tiene **0 lectores** en código (control positivo: `catalogLaw` sí tiene). **N-2** `CompiledBrand.recipeProfile` ya se valida y devuelve (`brand-theme/index.ts:2139`) y nadie lo consume. **N-6** `recipe-profile` es el único control de su clase sin `staticDoorDisposition`; el precedente correcto ya tiene nombre (`RUNTIME_ONLY_NO_ARTIFACT`, `profiles.icon`).

Separación pedida: montar `densityScopeAttributes` en las 23 surfaces que resuelven `profileDefaults` y no estampan (+ el bypass de `admin/audit:155`), documentar `profileOverrides`, envolver páginas en `RecipeProfileProvider` → **admisibles sin decisión**. Extender `SurfaceVisualOverrides` con `anatomy?`/`recipeProfile?` → **decisión de diseño, no constitucional**. `scope` en el registro tenant → **prohibido sin enmienda**. `data-anatomy-*` por subárbol (Camino C de Cloud) → **no ejecutar** (segunda autoridad sobre un namespace de root). El eje `scope` ya es binario (`'tenant' | 'vertical'`) con `'vertical'` en 0/22 usos — resolverlo antes de proponer un tercer valor.

### 2.7 DB / editor
Ver RC-06 y RC-07. Nuevo: 863 hojas alcanzables por DB que ningún vertical autora y 28 sólo-DB (`chrome.toolbar.*`, `buttonGeometry.*.paddingY`…): "estático ⊇ DB" tampoco es exacto a nivel de keypath materializado, sin violar ley. Fix de mayor relación DX/esfuerzo: issue `ignored_field` cuando `palette.dark` está poblado y `backgroundMode !== 'auto'`.

### 2.8 CSS
Ver RC-08. Clasificación final: **higiene de distribución** (minificar `dist/` únicamente; hoy `styles/` y `dist/` son el mismo byte), **experimento** (split por engine, 11 % del gzip minificado), **gap de aviso** (pairing sin pack embebido). Cloud mantiene un juicio: 344 KB gzip de CSS por página sigue siendo mucho para "premium" (referencias típicas SaaS 50-150 KB), y el 11 % de engines que bithire nunca renderiza es una decisión de producto que merece el experimento — no bloqueante.

### 2.9 Delivery cross-repo
Ver RC-09. Todo read-only; el verifier de platform es de sólo lectura (verificado por su propio test) y falla hoy con exit 1 en modo local.

### 2.10 Operación
Ver RC-01. Ninguna cerca distingue rama privada de publish; "protege a las apps" es glosa de Kimi, no texto. 519 → 672 → 674 commits sin push: es una tasa, no un número.

### 2.11 Visual
PageShell: síntoma confirmado (producto, no probe), **causa de Cloud refutada** — PageShell no tiene ningún `data-part` lateral; el root declara `container-type: inline-size` sin `inline-size`/`width` (`page-shell.css:127-135`) y se monta en un `Stack` flex; la containment anula la contribución min-content y el item colapsa; la etiqueta que colapsa es un `<Text>` hermano fuera de PageShell (evidencia adicional a favor de Codex). Fix: `inline-size: 100%` en esa regla + regresión Playwright a 390 px. Safe-area: **no hay bug**; `data-placement` es físico de punta a punta (`Drawer/engines/modern/index.tsx` posiciona con `left:0` sin mirar `dir`), y `sheet.css:172-176` documenta en el código que "must NOT mirror under RTL"; el precedente `cascader.css` es orden de lectura (lógico), no geometría de dispositivo. El swap sería una regresión. Divergencia léxica y capturas del torture lab: límites declarados en 05; se mantienen como señal, no como métrica.

### 2.12 Proyecciones
- **"20-25 % de probabilidad en 2026": RETIRADA.** Sin modelo ni denominador; era juicio del auditor presentado como cifra.
- **"51-217 días": RETIRADA como métrica.** Sus insumos reproducen (94 celdas declaradas en F4B en 4 días; 0 adjudicadas en 24 días; 0/5.100) pero la extrapolación no tiene modelo. Lo que se mantiene, anclado: la tasa observada de adjudicación de celdas es **0**, y F9 exige 5.100.
- **"62 % / ~43 %": sin fórmula** (los tres coinciden); no comunicar como avance derivado.
- **2,61/5 de la rúbrica:** tiene denominador (96 ópticas, escala explícita) pero es la nota de una rúbrica de auditor, no un KPI del programa; no debe citarse al lado de cifras ancladas del manifest.

## 3. Refutaciones a Codex y Kimi (no sólo defensa de Cloud)

| Afirmación | Autor | Veredicto | Evidencia |
|---|---|---|---|
| "Una rama WIP no encendería la CI actual sin cambiar el workflow" | Codex, Kimi | **PARCIAL** | `pull_request.branches: [main, develop]` filtra por rama base: un PR desde la rama WIP hacia `main` dispara CI hoy (P8) |
| "El worktree del fix `schemaVersion` está mezclado con `producers.json`" | Kimi | **R** | `git diff --stat` = 2 archivos; sin `producers.json` en ningún lado (P1) |
| "El '67' no es reproducible" | Kimi | **R** | tres ocurrencias literales en dos archivos (P1) |
| "23 capacidades `scope: 'tenant'`" | Kimi (y la extracción de F) | **R** | 22 valores; el 23º es la línea del tipo `readonly scope: 'tenant' \| 'vertical'` (P4) |
| "La anatomía llega a producción" (generalizado) | Codex | **CC** | cierto en bithire; **0** en evnto y en app-platform — la única app DB-driven por ley (P4) |
| "Es autoridad duplicada, no ausencia total" | Codex | **P** | en el DS la autoridad es única (DB); la duplicación es DS-DB vs app-estático; y `transportEquality.inventory` incluye "root attributes" — Codex no responde a esa palabra (P4) |
| "Para cascada, usar `root-membership` y `channel-liveness`" | Codex | **P** | son universos casi disjuntos del ratchet (33 ∩ 2169 = 0); `channel-liveness.emitted = 117` sub-cuenta (36 patrones interpolados); ninguno mide la clase B de 760 (P2) |
| "La valla protege a las apps consumidoras" | Kimi | **glosa**, no texto | ninguna de las 8+ citas da esa razón; la razón escrita es ventana de release autorizada (P8) |
| "Montar densidad en las ~30 surfaces" | Kimi | **CC** | son 23 (+1 bypass); 8/39 ya estampan, 7 de ellas con `profileDefaults` (P4) |
| "63 snapshots, 11 vivas, 36 sin respaldo" como medición propia | Codex, Kimi | **CC** | reproduce exacto, pero es la cifra de `docs/evidence/2026-08/INDEX.md`, no una medición independiente; y ninguno la presentó como mitigación en marcha (P8) |
| "Los drills protegen contra gates vacuos; no reducir a ≤35 sin perfil" | Codex | **aceptada** con matiz | el perfil de tiempo/riesgo es la condición correcta; la observación de que ≈51 % del blocking no mira al producto sigue en pie |
| "Sólo hay que cambiar `globals.css`" (atribuido a Cloud) | Codex | atribución parcial | Cloud sí propuso además `tenant-theme-console` contra DB y e2e (04 · 7.5), pero no vio los 53 imports JS: la corrección de alcance de Codex es correcta |

## 4. Hallazgos nuevos que ninguno de los tres detectó

Instrumentos que mienten o callan:
1. `program-check.mjs` es circular respecto de la allowlist (copia vs copia vs literal 294; 0 imports de la fuente); "67" ×3; docstring "71" stale.
2. `cascade-wiring-ratchet`: "raíz" infalsificable (control A), corpus sin archivos de raíz (control B), 69/769 "raíces" sin productor, 170 contradicciones con `root-membership`, severidad de las clases invertida.
3. `channel-liveness`: `emitted = 117` con 36 patrones de emisión interpolados sin resolver; el artefacto R1 `channel-liveness.json` no existe; checkpoint 49 vs 48.
4. `theme-channel-parity-gate` exime 4 hojas estáticas de anatomía con un productor DB-only; `staticDoorDisposition` sin lectores; `anatomy-variant-gate` no verifica transporte↔atributo.
5. `dependency-honesty` (DS) exige un alias que `platform-identity-zero` (DS) prohíbe producir; y `pnpm run dependency:honesty` muere antes por un error ajeno (`recipes/profiles/index.ts:76`).
6. El `evidence.symbol` de `shape.button-style` cita un canal que el control no escribe → `controls-catalog --check` neutralizado.

Código y contratos:
7. `CompiledBrand.recipeProfile` validado, devuelto y no consumido; `recipe-profile` sin `staticDoorDisposition` (sus hermanos sí); precedente `RUNTIME_ONLY_NO_ARTIFACT` ya adjudicado.
8. `TenantCapabilityDeclaration.scope` ya es binario (`'vertical'` con 0 usos).
9. `DEFAULT_CHROME_SHAPE` iguala el keypath set de los 3 verticales (7.935 cada uno); 863 hojas DB-alcanzables sin autor; 28 sólo-DB; `ramps`/`elevations` rottay-only; `materials` 0 autorías.
10. El filtro Expert de `tenant-theme-console` no propaga `filter` en la recursión: 606/607 hojas de `chrome.controls` invisibles a la búsqueda; etiquetas por `humanizeKey`.
11. `styles/*.css` ≡ `dist/*.css` byte a byte; engines = 11 % del gzip minificado; sólo 5/1.024 en la allowlist; `componentTokens` bajo `foundation/tokens/ts/runtime/components/` es un catálogo de introspección con 0 importadores productivos verificados (caso Modal).
12. El fallback tipográfico de `editorial` es explícito (`Georgia, serif`) en `TYPE_PAIRINGS`.
13. `app-evnto/scripts/link-local-ds.mjs` dispara `pnpm build:*` en el repo DS si faltan artefactos (faltan hoy); no documentado en la app; no sobrevive a `pnpm install`. app-platform es la única app con patrón read-only (`verify-local-ds.mjs` + test que prohíbe el script mutante).
14. `a037d3a3c` está empaquetado (pack del 20-08): no cae por `gc --auto`; `test-artifacts/release/` vive en la raíz del repo y sólo tiene 2.19.29/2.19.3.
15. El lote `/commercial` con dueño (F8) estaba escrito el 19-08 e incluye ~14 tokens `--ds-commercial-*`→`--ds-color-*` como "fallo CSS silencioso" que nadie censó.
16. `pull_request.branches` filtra por destino: un PR desde WIP sí dispara CI; `docs/evidence/2026-08/` es mitigación parcial desde el 23-08 sin script de reanclaje.
17. El patrón de fix de `shape.button-style` ya existe en `chrome-variables:1742-1746`; `sheet.css:172-176` documenta que `data-placement` es físico; PageShell no tiene slot lateral y la etiqueta que colapsa es un `<Text>` hermano.
18. `f166570d9` (DT) declara una deuda nueva: un drill de `cascade-producers` muta el artefacto real en disco y un Ctrl-C lo deja corrupto y trackeado.

## 5. Método y límites de esta pasada

- 8 brazos read-only nuevos, aislados de `modern-rescue-*`, con HEAD anclado y `git status` al inicio y al cierre; cero escrituras fuera de `docs/reauditoria-cloud/`.
- Reproducción por ejecución (función real importada) donde fue posible: `overrideTokens()`, `evaluateCeilings` de HEAD y del worktree, `classifyCascadeWiring`, `root-membership --check`, `channel-liveness` reporte, `theme-channel-parity-gate --current-json`, `compileBrandTheme` A/B, `migrateV1` maximal, `cssnano-simple` de Next, `verify-local-ds.mjs`.
- No se ejecutó browser, `next build`, vitest ni ningún gate con `--write`. Las causas de PageShell y la exención de anatomía están adjudicadas por lectura y contrato ejecutable, no por render; ambos brazos nombran la regresión Playwright que las cerraría.
- Los scripts de la pasada original (`evidencia/scripts/`) hardcodean rutas y dependen de intermedios (Codex §9); los brazos re-implementaron la lógica en `evidencia/scripts-v2/` sin usar `dist/` como fuente salvo donde se indica.
