# Hallazgos consolidados

> **Segunda pasada (2026-08-28):** los encabezados marcados `[SUPERADA → 07·An]` conservan la conclusión original como registro histórico; la conclusión vigente está en `07-correcciones-y-consenso-owner.md` (tabla A) y la evidencia en `06-reauditoria-cloud-sobre-codex-kimi.md`. Nada de lo escrito abajo fue borrado ni reescrito.

Deduplicados entre brazos y adjudicados por Fable. `RC-nn` es el id de esta reauditoría; entre paréntesis, los ids de brazo con el detalle y los comandos (`brazos/<letra>.md`). Severidad: BLOQUEANTE = impide el objetivo del owner o pone en riesgo el trabajo; ALTO = degrada el objetivo de forma medible; MEDIO = deuda con costo acotado; BAJO = higiene.

## BLOQUEANTE

### [SUPERADA en el fix → 07·A1, A2; hecho confirmado en 06 §1] RC-01 · 672 commits en una sola máquina; CI nunca corrió; la cadena de evidencia es efímera (E-5, G-1, G-6)
- `main...origin/main [ahead 672]`; último push 2026-08-03; `HEAD..origin/main` = 0 (no hay divergencia, un push simple alcanza).
- `ci.yml:3-7` dispara en `push`/`pull_request` → los jobs `visual` (462 PNG, whitelabel, responsive), `a11y`, `core`, `showroom` no se ejecutaron ni una vez en 25 días. La reescritura de los 3 themes (F4A) nunca pasó por la red visual.
- 116 rutas `/private/tmp/...` citadas como evidencia de ACCEPT/REJECT en el roadmap; 100 ya no existen (`docs/history/prompts/architecture-refactor/2026-08/design-lead-succession/index.md:27-29` lo admite).
- **Fix:** push a rama `modern-rescue/wip` (la ley "nunca push" protege a las apps consumidoras; una rama no publicada no las toca); `cp` del memo del auditor a `docs/history/programs/modern-rescue/advisories/2026-08/<lote>.md` al cerrar cada lote; correr `test:visual`/`test:responsive` localmente por cohorte mientras no haya CI.

### [SUPERADA en la interpretación → 07·A3, A4; cifras y sighted confirmadas] RC-02 · El producto no mejoró en 25 días: divergencia plana, cero-delta por ley, sighted = 0 (G-2, G-7, evidencia 05)
- Divergencia de valores `--ds-*` entre los 3 artefactos: 34,7 % (`a97ddd736`, 03-ago) → 34,5 % (HEAD). Tipografía 11,5 %, geometría 17,3 % divergentes. Los artefactos crecieron 11,5 %.
- 46 menciones de "cero-delta" en el roadmap; corpus sighted del programa: 6 PNG de una familia (`oauth-transition`, 11-ago); `SIGHTED_ACCEPTED = 0`; `playwright` 0 veces en 8.098 líneas.
- Lectura sighted del auditor (05): bithire vs themanagement en dashboard 1280 = misma composición, misma anatomía, radio 0 y sin sombra en ambos, botón 32 px en ambos; difiere la fuente de título y el papel.
- **Fix:** exigir por lote `DELTA_NULO_DECLARADO` o `DELTA_ESPERADO` con captura A/B; adelantar un vertical slice de F4C (8 familias insignia, 3 verticales, 360/768/1280, light/dark) antes de terminar la normalización.

### [SUPERADA → 07·A5, A6: refutada en su formulación; deuda honesta = 760 canales modern sin productor; ver 06 §2.3] RC-03 · 49,6 % de los canales `--ds-*` no tienen camino a raíz (C-1)
- `node scripts/engine/cascade-wiring-ratchet/index.mjs` → `2169 names still unwired of 4373 (2204 reach a root; 391 skin files)`. Bajó 2171→2169 en toda la ola F3.
- Control positivo: `--ds-envtoggle-accent` leído 17× (`environment-toggle.css:59-203` + rustic), declarado 0× en CSS; sólo lo alimenta JS.
- Desglose (re-verificación con `classifyCascadeWiring` del propio gate): **840 (38,7 %) se leen sin fallback en ninguna ocurrencia** → la propiedad cae a `unset`/heredado, cero pintura silenciosa; **1.329 (61,3 %) caen a un literal de último recurso** → exactamente el hardcode que gana si falla el tenant. Top fan-out: `--ds-elevation-surface-3` (36×, sin fallback), `--ds-motion-intensity` (27×), `--ds-divider-width` (24×), `--ds-state-press-scale` (23×, sin fallback), `--ds-color-primary-600` (23×, sin fallback — por nombre debería ser escala de paleta, no canal huérfano).
- Un canal huérfano es peor que un hardcode declarado: no hay punto de la cascada donde un tenant pueda intervenir. La mitad de la superficie de pintura queda fuera de todo dial.
- **Fix:** usar el ratchet como mapa (agregar `--dump`), drenar por fan-out; cerrar primero el clasificador raíz-legítima vs raíz-posicional (`rootsExcludedNote`, diferido a PRE_F4B).

### [SUPERADA parcialmente → 07·A7, A8, A9: anatomía sí llega en bithire; scope en registro prohibido; tier de instancia existe] RC-04 · Anatomía, recetas y scope no llegan a producción (F-1, F-2, F-3, F-4, F-7, B-3, B-4)
- `chrome.anatomy`: proyección sólo en el compilador DB (`tenant-theme/index.ts:1304-1341`); `grep anatomy brand-theme/index.ts` → 0; ningún BrandTheme estático la autora; `tenantThemeAnatomyAttributes` sin llamador en las 3 apps. app-bithire la re-implementa con literales (`vertical/model/profile/anatomy/index.ts:12-30`, 65 reglas CSS dependientes).
- `recipe-profile`: `getCodeOwnedRuntimeConfig` desestructura `appearance` y no lo restituye (`configuration/registry/index.ts:154-162`) → `recipeProfileSelection = undefined` en los 3 verticales estáticos; bithire selecciona `rottay/network-professional@1` (`brand-themes/bithire/index.ts:3168`) y no se aplica. `--ds-recipe-profile` con 0 lectores.
- Scope: 22/22 capacidades `scope: 'tenant'`; R7 sin eje de scope. `DensityScope` (declarado "the ONE public scoped contract") 0 consumidores en DS y apps; `profileOverrides` (cascada de 3 niveles, trazada hasta `data-variant`) 0 usos en apps; 3 mecanismos paralelos de densidad.
- Consecuencia: la paridad estático/DB está rota en el eje más visible; el pedido "una card en una página" sólo tiene el camino `className` + CSS de app (2.197 usos sin gobierno) o atributos `data-*` off-contract.
- **Fix:** (1) proyección estática de anatomía (función pura `brandTheme.chrome.*.anatomy` → 4 atributos, misma tabla) + autorar `anatomy` en los 3 themes + borrar `BITHIRE_ANATOMY`; (2) añadir `recipes` a `CodeOwnedGovernedBehavior`; (3) `scope: 'tenant' | 'surface' | 'instance'` en el registro; (4) `SurfaceScope` (~60 líneas) que monte `densityScopeAttributes` + `data-anatomy-*` + `RecipeProfileProvider`; (5) montar `densityScopeAttributes(profileDefaults.density)` en las 30 surfaces que ya resuelven `profileDefaults`.

### [SUPERADA en el fix → 07·A10, A11: fallback vacuo; `responsive.posture` ya OPEN_OWNER; defecto confirmado] RC-05 · Controles Standard/Pro que no pintan (A-1, A-4, A-5, B-1, D-1)
- `shape.button-style` emite sólo `--ds-radius-button`; `button.css:73` pinta desde `var(--ds-button-md-radius, var(--ds-radius-md))`; único lector `framework-token-projection.css:43` (`--radius-field`, 0 lectores). Cierre transitivo: 0 declaraciones, 0 archivos. El `productiveConsumerWitness` cita un canal que el control no escribe → el gate `controls-catalog --check` queda neutralizado por un testigo falso.
- `surfaces.elevation-posture`: bithire `flat Δ=0 soft Δ=0 elevated Δ=3`; sólo mueve `--ds-elevation-1/2/3`; en rottay reemplaza 3 de 6 niveles por sombras genéricas y deja 0/4/5 autorales → escalera incoherente.
- Stops Pro a cero canales: `profiles.motif` 6/7, `responsive.posture` 3/3, `profiles.edge hairline`, `profiles.material flat`, `profiles.elevation flat/hairline-lift`. `responsive.posture` no emite canal y `widget-board.css:1517,1532` hardcodea los mismos 639/839.
- **Fix:** `button.css:73` → `var(--ds-button-md-radius, var(--ds-radius-button, var(--ds-radius-md)))` (1 línea) o que la rama `buttonStyle` escriba `--ds-button-{xs..xl}-radius`; corregir el `evidence.symbol`; presets de elevación a 6 niveles derivados del ladder del vertical; retirar del enum los stops sin lowering o implementarlos; emitir `--ds-responsive-posture-*-max` y que los `@container` los lean.

### [SUPERADA en severidad → 07·A12: denominador = andamio de normalización; sobrevive overlay de modo y `palette.dark` silencioso] RC-06 · El transporte DB no puede expresar el 72,6 % de la identidad de un vertical; el dark mode es de tercera clase (A-2, A-3, A-6)
- Documento MAXIMAL derivado del schema v1 → 2.198 hojas alcanzables; los 3 verticales escriben 7.933; sólo-estático 5.763 (5.150 `modes.*`, 168 `materials`, 80 `palette.ramps`, 46 `chrome.premiumCard`, 6 `surfaces.elevations`…).
- `migrateV1` sólo produce `modes.{light,dark}.palette` con 10 seeds; bithire autora 492 hojas en `modes.dark`. Con `backgroundMode:'dark'`, `palette.dark` queda inerte sin aviso (`migrate-v1/index.ts:405-407`).
- Dos emisores CSS asimétricos: el estático emite `color-scheme` y tinta raíz y no sabe `@media (prefers-color-scheme)`; el DB al revés. Sin JS, un tenant DB oscuro conserva el `color-scheme` claro del vertical.
- **Fix:** abrir por reach, no por conteo: `palette.ramps` (80 hojas), `surfaces.elevations` (6), `modes.dark.{typography,surfaces}` (~30); `palette.dark` con `backgroundMode≠auto` → `TenantThemeValidationIssue`; un solo `renderThemeCss` compartido por ambos renderers.

### [SUPERADA en la tesis → 07·A13, A14: hoja ≠ dial es normativo; sobrevive editorMetadata 0 y filtro Expert roto] RC-07 · "Pocas decenas de diales" no se cumple a nivel de esquema ni de editor (B-5, B-6, B-7, B-8, B-12)
- Documento `advanced`: 2.212 hojas (`chrome` 1.875, `tokenOverrides` 290); 2.080 `visual-value` texto libre, 48 `number`, 23 `enum`. `pro.productEditorFieldTarget` dice 20-30; el editor de app-platform recorre el esquema y muestra las 2.212.
- 0/20 controles con `editorMetadata`; el campo no existe en `schema.json`; app-platform etiqueta con `humanizeKey()`; `DENSITY_POSTURES` del runtime (`compact|comfortable|spacious`) ≠ control (`compact|normal|spacious`).
- La columna "lecturas vivas" del catálogo mide canales declarados (`representativeOnly`): `density.mode` publica 8 (real 329), `chrome.families` declara 3 canales y abre 1.875 campos.
- El tenant DB de referencia (`themanagement-db-row`) autora 68 valores: 37 son `tokenOverrides` crudos (54 %) porque los diales no expresan rampa de radio no proporcional, carácter de sombra, material de superficie ni material de control (17 tokens).
- 4 ids del modelo objetivo no existen en ningún tier: `focus.identity` (`--ds-focus-ring*` 164 lecturas, sin dial ni allowlist), `type.weight`, `control.size` (pedido explícito del owner; 104 campos crudos), `motion.character`.
- **Fix:** 6 diales (`focus.identity`, `control.size`, `surface.material`, `shape.geometry`, `surface.depth`, `type.weight`) que colapsan ~159 campos y bajan los 37 overrides a ~5; `editorMetadata` en schema + 20 controles; columna de palanca = cierre transitivo con umbral mínimo en el gate; fusionar `typography.families` en `pairing` (J=0,806) y plegar `radius-scale` en `geometry` (J=0,874) para liberar slots Standard.

### [SUPERADA en severidad → 07·A15-A17: Next minifica a 344 KB gzip; 5/1.024 en allowlist; fallback tipográfico explícito] RC-08 · Entrega: 5,4 MB / 1,05 MB gzip de CSS por vertical, sin minificar, con los 3 engines (E-1, E-2, E-7, E-9)
- `build-css/index.mjs` sólo inlinea `@import`; ningún minificador en `package.json`. 35,4 % del raw son comentarios; sin ellos gzip 1.043.235 → 368.213 B (−64,7 %), brotli −63,9 %.
- `facade/entrypoints/base.css:88-119` importa modern (123) + rustic (111) + classic para cada vertical; bithire (modern-only por `tenant-component-defaults.css:17-20`) paga 615 `.ant-` + 1.999 `rustic`.
- 1.024/3.853 `--ds-*` declarados en `:root` nunca leídos en el bundle: peso muerto y superficie falsa para `token-overrides`.
- `typography.pairing` es Standard pero los `@font-face` se hornean por vertical (bithire 3 packs): un tenant DB puede elegir un pairing sin `@font-face` que lo respalde → fallback silencioso.
- **Fix:** `lightningcss --minify` sobre `dist/*.css` (dejar `styles/` legible para diffs/gates); bundles `dist/{vertical}.{engine}.css`; cruzar los 1.024 no leídos contra la allowlist Expert; validar `pairing` contra los packs embebidos o embeber todos.

### [CONFIRMADA Y AMPLIADA → 07·A18-A20: 49 archivos JS + alias + verifier; gates del DS en contradicción] RC-09 · Versionado irreproducible y deuda cruzada dormida (I-1, E-3, E-4, E-6, I-4)
- `app-platform/src/app/globals.css:14` importa `dist/platform.css`; 3 sitios importan `commercial.css`. Ninguno existe en el DS 2.19.36 (`dd3496343` borró `platform.css` con mensaje "fantasma ya roto hoy… Sin push"); `platform-identity-zero-gate` prohíbe la cadena. Compila hoy sólo porque el 2.19.35 instalado los trae. El próximo repin rompe 4 imports.
- `app-bithire` pin 2.19.37 → commit `a037d3a3c` no es ancestro de ninguna rama: producción no reconstruible desde fuente.
- `app-evnto` declara 2.19.29 y corre 2.19.36 por symlink manual (`readlink` → `packages/core`).
- Bloqueante #1 de la reauditoría del 19-08, abierto 9 días después.
- **Fix:** lote mínimo app-platform (import → `styles/rottay` o bundle propio + `tenant-theme-console` contra DB local); rama `release/2.19.37` anclando `a037d3a3c` antes de que el GC lo pierda; repin honesto de evnto con `USE_LOCAL_DS` explícito; gate en cada app que resuelva sus `@import` contra `exports` del paquete instalado.

### [SUPERADA en foco → 07·A21: el defecto grave es 294/290/67 ×3 + program-check circular] RC-10 · Autoridad y métricas sin fórmula (J-1, J-2, J-5, G-3, J-3, J-4)
- README del programa:3-6, `ROADMAP-EJECUCION:683-684` y `program/index.json.statusAuthority`→`registry.json`→README:45 se declaran única autoridad en círculo; `registry.json` `notes` dice Codex DT y `progressLog` dice Kimi K3 (STATUS.md:53 lo admite STALE).
- Cuatro cifras de avance: 74 % (STATUS:7), 27 % (STATUS:15), 62 %/43 % (ROADMAP ×6, "sin mover" en ≥15 lotes, sin fórmula ni definición de "comercial"), 0/255 (manifest). Los 7 KPIs con fórmula de `customization-model/index.json#kpis` y `quality-rubric/index.json#tenantDivergenceMinimumByProfile` no se reportan.
- `docs-engineering/.../runtime/engines/README.md:52-56` describe modern como "DaisyUI/Tailwind bridge" (drenado a 0 por `token-audit.daisy.test.mjs:316`) y cita WO-ENG-01..11 (lane real hasta 25). Los 4 docs obligatorios de CLAUDE.md llevan 10-38 días de gap.
- **Fix:** una autoridad generada (`registry.json` + `checkpoint/index.json`) y los otros dos como redirección; publicar en cada asiento 4 cifras ancladas: certificación `1 − UNKNOWN/5100`, familias aceptadas `/255`, familias con divergencia mínima `/255`, `SIGHTED_ACCEPTED/255`, más la divergencia medida de artefactos; regenerar `runtime/engines/README.md` desde la prosa de CLAUDE.md "Component paint pattern".

## ALTO

### [SUPERADA → 07·A24: 198, exposición runtime 0; deuda de gobierno] RC-11 · 196/380 nombres `--_ds-*` se leen y nunca se declaran (C-2)
`activity-log.css` lee `var(--_ds-activity-log-dot-fill)` sin declaración en CSS ni TSX → `unset` en runtime. 0 fuga a apps. **Fix:** gate productor/consumidor para `--_ds-*` (no existe); declarar o borrar cada uno de los 196.

### RC-12 · Brand-themes restatean hex como literal en decenas de keypaths (C-3, C-4)
`rottay/index.ts`: `#2A2A2F` 70×, `#FFFFFF` 63×, `#ECECEC` 57×; 45 hex repetidos en 2+ keypaths (44 bithire, 20 evnto). El header del archivo dice que el skeleton "referencia las decisiones" — no las referencia. evnto autora 346 asignaciones vs 1.707/1.510 (placeholders 638 vs ~400). **Fix:** constantes `NEUTRAL_900 = '#2A2A2F'` en el bloque de decisiones; usar el conteo de placeholders por sección como backlog F4C de evnto.

### RC-13 · Gate de ortogonalidad inerte y 2 pares por encima de su techo (B-2)
`validateControlOrthogonality` sólo consume celdas APPLICABLE (0). Medición sobre cierres: `profiles.expressive`×`shape.radius-scale` J=0,874 (un canal, dos ids, dos tiers), `typography.families`×`pairing` J=0,806; ningún control declara `independentSemanticInvariant`. `density.mode` alcanza 203 skins y `spacing.rhythm` 14. **Fix:** medir Jaccard sobre cierre de canales (derivable hoy), no sobre APPLICABLE.

### RC-14 · 25 breakpoints px en condiciones `@media/@container`, 18 sin origen gobernado; 3 sistemas sin converger (D-2)
Kernel Tailwind 640/768/1024/1280/1536, posturas 519-959, y 18 literales sueltos (420, 480, 560, 860, 900…). `640px`×16 el más frecuente. **Fix:** tercer nivel de escala de componente derivado de los 6 canónicos antes de F4C.

### [SUPERADA → 07·A22: no hay bug; el swap sería una regresión] RC-15 · Safe-area con propiedades físicas en los shells móviles (D-3)
`drawer.css:179,183`, `sheet.css:188,194`, `overlay-modal.css:246-247` usan `padding-left/right: env(safe-area-inset-*)`; bajo RTL el inset cae del lado sin notch. `cascader.css:22-23` ya resolvió el patrón. **Fix:** regla `[dir='rtl']` que intercambie los dos `env()` en 3 archivos.

### RC-16 · Guard APCA angosto (D-4)
`validateCompiledThemeContrast` evalúa el cascade compilado y rechaza (no corrige), pero cubre 4 roles fg + 4 pares sidebar + overrides explícitos. Un seed de bajo contraste que sólo se manifiesta en badge/botón/card pasa. Dos comentarios normativos dicen lo contrario del código (A-9). **Fix:** ampliar la atribución a los pares ink/ground que `palette.seeds` mueve; corregir comentarios.

### RC-17 · Card sin canal de override sancionado; `className` es el contrato de facto (F-5, F-6)
Los 3 hooks de Card (`--ds-card-bg/-border/-body-color`) están promovidos como "this family overrides nothing"; radio, sombra, padding, ancho de borde → `UNKNOWN_HOOK`. 91 hooks cubren 15/255 familias; Input 0 hooks. app-bithire: 2.197 `className` sobre componentes no-layout, 0 reglas ESLint. **Fix:** promoción `card-instance-geometry` (5 propiedades; el constraint ya permite geometría y prohíbe color) + prop `tokens` tipada derivada del manifest en 4-6 familias piloto. No cerrar `className`.

### RC-18 · `size` en Card mueve dos canales de tipografía y nada más (F-8)
`card.css:384-392`: `[data-size]` sólo cambia `title/body-font-size`; padding vive en `[data-padding]`. `<Card size="sm">` no compacta. **Fix:** `--ds-card-size-factor` que componga padding/gap/radio, o renombrar el eje.

### RC-19 · F9 sin fecha; F4B cerró 10/20 como diferimiento; la deuda se corre de fase (G-4, G-8, G-9)
0 celdas adjudicadas en 24 días; 94 declaradas siguen UNKNOWN; proyección 51-217 días de flota sólo para F9. 10 `SOURCE_BOUND` sin prueba de que muevan un pixel. ≥12 ítems corridos de fase (channel-liveness 49 no drenables, mode-aware, APCA cascade-aware, token-overrides single-arm, chrome.families ~250 celdas, chart-series, glass A/B, line-height, P0 status-seeds, /commercial, symlink evnto). Un frente no planificado (normalización profunda) consumió ~120 commits. **Fix:** adjudicar por grupo de receta/anatomía (~25-30 grupos) con prueba por representante; lote "10 en uno" de captura A/B para los `SOURCE_BOUND`.

### RC-20 · El instrumento pesa más que el producto (G-5, H-3, H-5)
124.620 líneas de `scripts/` vs 89.080 de skin modern + brand-themes; 38/105 gates son drills; 9 freshness; 29 commits de re-sello `gat-07`; `modern-rescue-checkpoint-state` da verde sobre un intent con 52 commits de atraso; `program-check` es ~100 % documental; los 257 `.mjs` de gates no tienen typecheck. **Fix:** ≤35 gates blocking (drills y freshness a job nocturno); `checkJs` + JSDoc sobre `scripts/`.

### RC-21 · Suite de tests: policy de rojos vacía y 2/123 skins con estilo computado (H-1, H-2)
Baseline `fb1e200ca` (25 rojos, 11-ago) nunca re-corrida en 390 commits; 4/25 clasificados, todos UNVERIFIED y auto-limitados. `environment: 'happy-dom'`; 24/1.205 tests usan `getComputedStyle`; polyfill con acceso tipado (`setup/index.ts:162-169`) — el camino que descarta `var(--x, fallback)`. **Fix:** re-correr y poblar `redTestClassifications`; migrar a `style.getPropertyValue`; documentar que la evidencia de pintura vive en receipts F4B, no en la suite.

### RC-22 · evnto fail-open; platform sin SSR de tema ni e2e de tenant (I-2, I-3)
`app-evnto/.../get-tenant-branding.ts`: `catch { return null }` con comentario "outage falls back to the static baseline"; nunca `notFound()` → impersona Evnto bajo el dominio del tenant. Lo opuesto a la ley que bithire documenta y aplica. app-platform: 4 layouts sin `<style>` SSR (sólo `DesignSystemProvider` `'use client'`), 0 e2e con tenant. **Fix:** alinear evnto con el patrón LKV/fail-closed de bithire; portar `two-systems/divergence.spec.ts` a platform.

### RC-23 · Hardcodes en app-platform y app-evnto (I-5, I-6)
`style={{`: platform 8.792 en 326 archivos, evnto 5.939 en 234, bithire 91 en 53. Hex pelado sólo en platform (`organization/settings/screens/overview.tsx` `#d9d9d9`; `sessions/overview.tsx` `#fff` ×5). 229 `<div>` crudos en platform fuera de excepción. **Fix:** drenar por concentración (`identity/users/screens/overview`, `docs-atlas`, `compliance/*`) hacia `Box/Flex/Grid`.

### RC-24 · Palanca del transporte estático: dos emisores de fuente y `styles/modern.css` muerto (E-8, C-6)
bithire carga Fraunces con `next/font/google` en paralelo al subpath on-demand del DS (`fonts/editorial-display.css`), con métricas potencialmente distintas. `styles/modern.css` (Tailwind preflight) ya vive dentro de cada bundle y no tiene importadores. **Fix:** migrar `layout.tsx` al subpath del DS; retirar `styles/modern` de `exports`.

## MEDIO

- **RC-25** (A-7) Ni digest ni cache key del artefacto DB conocen la versión del DS ni el `baseThemeDigest`; `compilerVersion` constante a mano; ETag → 304 con artefacto pre-upgrade. Fix: añadir `build-stamp.sourceHash` al `digestSource`.
- **RC-26** (A-8) El console de platform clampea 4 de 6 rangos del envelope → `typeScale 1.09`, `radiusScale 1.24`, `effectIntensity 0.9` legales en UI y rechazados al publicar; envelopes por vertical difieren en 1 número. Fix: tabla `keypath → rangeKey` derivada del envelope.
- **RC-27** (B-9) Allowlist Expert: mediana 2 archivos por token; 5 con 0 lectores CSS; 77 % en dos familias; `BrandStudio` con fixtures reales lo consume sólo el showroom. Fix: agrupar por dominio en el console; montar `BrandStudio`; podar ≤2 lectores.
- **RC-28** (B-11) R1 acredita 8 ejes no-color pero 2 sin portador; 4 de 12 `requiredGroups` sin instrumento (`icon-posture`, `motion-cadence`, `background-motif`, `responsive-composition`); `R0/tenant-art-direction-compliance.json` desactualizado (bithire `technical-sharp@1` vs fuente `network-professional@1`).
- **RC-29** (G-10) Deuda real de literales inline en modern: ~13 sitios sin dueño de fase (chart renderers `fontSize` 10-12px ×7, `Progress/Line:286`, `Statistic/Countdown:262-278`, `navigation/examples:430` `#ddd`). Medio día cierra la clase.
- **RC-30** (G-11, G-12) El brazo DB sólo se ejercita por fixture en showroom (F8 = sólo BitHire); `mobile` aparece 1 vez en el roadmap; "Responsive sin medir" admitido 3 veces.
- **RC-31** (F-9) `Card` exporta `COLOR_VARIANT_MAP`/`SHADOW_MAP`/`RADIUS_MAP` con hex que sólo consume classic (congelado): trampa de API. Fix: mover a `engines/classic/`.
- **RC-32** [SUPERADA en la causa → 07·A23: PageShell no tiene slot lateral; causa = `container-type: inline-size` sin `inline-size: 100%`] (D-5, evidencia 05) 13 `grid-template-columns: repeat(N,…)` fijos sin query; en la escena shell a 390 px `PageShell` no colapsa el slot lateral y el texto se apila letra por letra (captura `shell-390-bithire-top.png`).
- **RC-33** (H-4) 17/24 baselines decrease-only congelados desde su alta con deuda no-cero sin dueño (`application-boundary` 1.233, `pattern-surface-ownership` 1.424, `token-audit` 5.580, `core-structure-audit` 9.752).
- **RC-34** (J-6, J-7, J-8, J-9) CLAUDE.md↔AGENTS.md circulares; 14 términos sin definición; theme-builder del showroom no expone los 20 controles; registries 274 vs 237.
- **RC-35** (E-10) 98 MB / 881 archivos de evidencia binaria versionados; `.git` 426 MB y sólo crece.
- **RC-36** (A-10) `surfaces.materials` deprecado pero materializado con 168 hojas `undefined` en cada `Theme`; el `??` de `surfaceRoles ?? materials` es coalescing de mapa entero (bomba con espoleta).
- **RC-37** (I-7) `color-mix()` con literal dominante (≤48 % del token DS) en `detail-editor-chrome.css:193,203,1274,1586` de bithire.

## BAJO

- **RC-38** (C-5) `44px` bare en ~15 archivos junto a `--ds-touch-target-min` en ~40. Envolver por consistencia.
- **RC-39** (E-11) 15 `export *` en `src/index.ts` (§1.11 pendiente); `dist` limpio por el bundler, no por la fuente.
- **RC-40** (E-12) `@keyframes pulse` ×6, `ds-spin` ×3.
- **RC-41** (D-7) "posture" nombra dos conceptos (`ShellPosture` vs `ResponsivePostureId`).
- **RC-42** (J-10) `storybook-static/` local (27 MB, 14-jul), no versionado, stale.
- **RC-43** (H-6) El censo de "23 tests sham" de la memoria del auditor no cubre este repo; muestra propia 0/25.

## Corrección de premisas del auditor durante la auditoría

- Los 2.606 `unadjudicatedReads` de `hooks-manifest.json` son lecturas `var()` internas del DS (41,6 % de sus 6.263), no lecturas desde apps. Las apps escriben 0 canales fuera de contrato (F-10).
- `grep --include` no fue el problema que un brazo sospechó: mis conteos y los de D reprodujeron byte a byte con `find|xargs`. D sí corrigió un defecto propio de regex (37 → 25 breakpoints reales).
- El overflow horizontal a 390 px que midió mi primera pasada (624 px en la escena shell) es un widget del probe (preview card), no producto; el apilado letra por letra de `PageShell` sí es producto.
