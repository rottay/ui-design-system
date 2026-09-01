# 07 · Correcciones que Cloud acepta, desacuerdos que mantiene y decisiones del owner

**Fecha:** 2026-08-28 · **Estado:** propuesta para consenso. No modifica roadmap, programa, manifests ni código. Base de evidencia: `06-reauditoria-cloud-sobre-codex-kimi.md` y `brazos-v2/`.

## A. Correcciones que Cloud acepta (con la conclusión anterior marcada como SUPERADA)

| # | Conclusión anterior (SUPERADA) | Conclusión nueva | Evidencia que provocó el cambio | Impacto en severidad / prioridad / roadmap |
|---|---|---|---|---|
| A1 | RC-01 fix: "push a `modern-rescue/wip` resuelve el riesgo en minutos" | El push viola la letra de 8+ cercas absolutas; la rama no existe; sólo el owner puede enmendar. Alternativa sin enmienda: `git bundle` externo. Si se elige rama espejo, **un PR hacia `main` dispara CI sin tocar `ci.yml`** | P8: citas textuales; `ci.yml:3-7` | RC-01 sigue siendo el riesgo operativo #1, pero pasa de "fix de minutos" a **decisión D1 del owner** |
| A2 | RC-01: "100 de 116 memos perdidos" | 100/116 exacto en `docs/*.md`; 63 de los 99 faltantes del roadmap tienen snapshot con SHA en `docs/evidence/2026-08/` (mitigación parcial ya en marcha desde 23-08); 36 sin respaldo; sin script de reanclaje | P8 | Severidad de la pérdida de evidencia baja de "cadena rota" a "36 sin respaldo + proceso manual sin automatizar" |
| A3 | RC-02: "probabilidad 20-25 % de llegar en 2026" | Retirada. Sin modelo. | — | No se comunica |
| A4 | RC-02: la divergencia 34,7→34,5 % como prueba de que "el plan no mueve el eje" | Es señal léxica de artefactos, plana por ley cero-delta; sirve como constatación de que nada visible cambió, no como métrica de programa | Codex (reproducción desde git); P2 | Se mantiene la conclusión de secuencia (F4C no arrancó) con la evidencia sighted, no con el porcentaje |
| A5 | RC-03: "49,6 % de la pintura inalcanzable; 2.169 a drenar; BLOQUEANTE" | El ratchet mide forma de fallback: "raíz" = cualquier target de fallback; 0 `unset` en modern; deuda honesta = **760 canales de modern (960 corpus) con literal de último recurso y sin productor**; 170 contradicciones con `root-membership` | P2 (controles A/B, reconciliación de universos) | RC-03 baja a **ALTO**, se re-titula "clase B" y la Ola 2 de 04 queda SUPERADA: primero reconstruir el clasificador, luego re-anclar, luego drenar |
| A6 | RC-03: "840 sin fallback → `unset`, la clase grave; 1.329 con literal, la leve" | Invertido: 706/840 declarados, 64 huérfanos todos rustic; 960/1.329 sin productor | P2 | Cambia qué se drena |
| A7 | RC-04: "`tenantThemeAnatomyAttributes` sin llamador en las 3 apps" | Falso negativo para bithire (`layout.tsx:36,194`; `ssr:98`; hook `:177/246`); cierto para evnto y platform | P4 | La brecha estático/DB sigue; el "no pinta en producción" queda restringido a evnto/platform |
| A8 | RC-04: "el modelo no tiene eje de scope por debajo de tenant" y "agregar `scope: surface\|instance` al registro" | El tier de instancia existe (`resolutionOrder[5]`, `SurfaceVisualOverrides`, `RecipeProfileProvider`); falta alcance al DOM y adopción. Meter `scope` en `TenantCapabilityDeclaration` está **prohibido** por ley fechada 2026-08-18 | P4 | Ola 4.1 de 04 SUPERADA; 4.2-4.6 se reformulan dentro del tier de instancia |
| A9 | RC-04: "anatomía estática ausente" como hallazgo nuevo | Ya registrado como `STRUCTURALLY_UNREACHABLE` en `manifest/controls/chrome.anatomy.json`; su fix está secuencialmente bloqueado por `chromeFamiliesDestination.mandatorySequence` (paso a antes de b) | P4 | Ola 1.2 de 04 SUPERADA en orden: no ejecutar antes del paso (a) |
| A10 | RC-05 fix: `button.css:73` → `var(--ds-button-md-radius, var(--ds-radius-button, …))` | Vacuo: `--ds-button-md-radius` declarado incondicional en `:root` y re-declarado en el artefacto; fix correcto = fan-out por tamaño en `appearance-posture`, plantilla en `chrome-variables:1742-1746` | P3 | Ola 1.1 SUPERADA; el fix correcto es más chico y ya tiene precedente |
| A11 | RC-05: "`responsive.posture` no gobierna CSS; emitir `--ds-responsive-posture-*-max`" | Ya registrado `OPEN_OWNER` en el manifest con la razón de por qué el CSS espeja los literales; emitir CSS no es fix mecánico | manifest `responsive.posture.json:100-125` | Ola 1.6 SUPERADA; pasa a decisión del owner |
| A12 | RC-06: "el DB no puede expresar el 72,6 % de la identidad; BLOQUEANTE" | Denominador = dispositivo de normalización (mismo keypath set en los 3 verticales); la ley exige DB ⊆ estático, no igualdad; por vertical 43/59/53 %; lo que sobrevive: overlay de modo ≤10 semillas (ALTA), 6 familias chrome sin schema (MEDIA), `palette.dark` silencioso (ALTA DX) | P5 | RC-06 baja a **MEDIA/ALTA por capacidad**; Ola 5.1 se acota: `modes.dark.{typography,surfaces}` sí; `ramps`/`elevations` son rottay-only; `materials` no |
| A13 | RC-07: "2.212 hojas contradicen 'pocas decenas de diales'" | Hoja ≠ dial es texto normativo ("not 294 sliders"); 36+7 hojas `general/profiles` = 13+7; el editor segmenta por familia | P5 | RC-07 baja a **ALTO (ergonomía)**; lo que queda con más fuerza: 0/20 `editorMetadata` y el filtro Expert de profundidad 1 |
| A14 | RC-07: los 6 diales y 2 fusiones como Ola 3 | Decisión del owner nombre a nombre, después del slice F4C; exceden el modelo asentado y exigen migración atómica con retiro del predecesor | Codex, Kimi, `targetControlModel.law` | Ola 3 SUPERADA como backlog; pasa a D5 |
| A15 | RC-08: "bloqueante de red" | Next minifica en `next build --webpack` (cssnano-simple) → 344 KB gzip reproducido byte-exacto; higiene de distribución/DX y bloqueante sólo para consumidores no-Next | P6 | RC-08 baja a **ALTO no bloqueante**; Ola 7.1 se mantiene con etiqueta corregida |
| A16 | RC-08: "1.024 tokens muertos / superficie falsa para overrides" | 1.024 no leídos en el bundle es cota superior; sólo **5** están en la allowlist Expert; 35/40 tienen algún consumidor externo (mayoría catálogos de introspección) | P6 | Ola 7.3 se reduce a 5 tokens |
| A17 | RC-08 (E-9): "pairing sin `@font-face` → fallback silencioso a fuente de sistema" | El fallback es explícito y curado (`Georgia, serif` en `TYPE_PAIRINGS`); el gap es de validación/aviso | P6 | Ola 7.4: sólo la validación |
| A18 | RC-09: "4 imports CSS" | 53 líneas / 49 archivos JS del entrypoint `/commercial` + 4 CSS + 5 alias + verifier que falla; `TreeView` renombrado; `ProductWindow` en showroom | P7, Codex | RC-09 **sube**: es el ítem más urgente si hay repin cercano |
| A19 | RC-09: "evnto symlink manual sin registrar" | Modo gobernado (`link-local-ds.mjs`, `USE_LOCAL_DS`); pero no documentado en la app, frágil ante `pnpm install`, y dispara build en el DS | P7 | Se reformula: no es defecto de disciplina; es deuda de documentación + un efecto cruzado peligroso |
| A20 | RC-09: "riesgo real de GC" para `a037d3a3c` | Empaquetado: no cae por `gc --auto`; sí por poda agresiva. Anclarlo sigue siendo correcto y aditivo | P7 | Urgencia de horas, no de minutos |
| A21 | RC-10: severidad "BLOQUEANTE" de la circularidad documental | La circularidad es hecho textual; su gravedad es juicio. El defecto grave de RC-10 es el que Cloud no vio: 294/290/67 + `program-check` circular | P1 | RC-10 se re-centra en el hallazgo de Codex |
| A22 | RC-15 (safe-area RTL): "intercambiar `env(inset-left/right)` bajo `[dir='rtl']`" | No hay bug; `data-placement` es físico por contrato (`sheet.css:172-176`); el swap sería una regresión | P3 | RC-15 **cerrado sin fix**; Ola 1.7 SUPERADA |
| A23 | RC-32 (PageShell): "no colapsa el slot lateral" | PageShell no tiene slot lateral; causa = `container-type: inline-size` sin `inline-size: 100%` dentro de un flex; fix de 1 línea + regresión Playwright | P3 | Severidad se mantiene (producto real a 390 px); causa y fix corregidos |
| A24 | RC-11 (`--_ds-*`): "196 → `unset` en runtime" | 198 (con comentarios stripeados); 194 con fallback en toda lectura; 4 con productor TSX; exposición runtime 0 | P2 | RC-11 baja a **MEDIO (gobierno)** |
| A25 | 04 · 8.1: "F9 por grupo de receta (~25-30 grupos) en vez de 5.100 celdas" | El denominador 5.100 es constitucional; los grupos generan evidencia y prueba de pertenencia, no reducen la adjudicación por celda | Codex, Kimi | Se reformula como método de evidencia; decisión D10 |
| A26 | 04 · 8.3: "≤35 gates blocking" | Sin perfil de tiempo/riesgo no se recorta; los drills protegen contra gates vacuos | Codex | Se reformula: primero perfil; la observación (≈51 % del blocking no mira al producto) sigue |
| A27 | 02: "22/22 capacidades" (correcto) vs extracción de F "23" | 22; el 23º era la línea del tipo | P4 | Menor |
| A28 | Proyección "51-217 días" | Retirada como métrica; se conserva el hecho anclado: tasa de adjudicación observada 0 celdas en 24 días | P (propio) | No se comunica |

## B. Desacuerdos que Cloud mantiene, con evidencia

| # | Punto | Posición Codex/Kimi | Posición Cloud revisada | Evidencia |
|---|---|---|---|---|
| B1 | Anatomía estática | "Autoridad duplicada, no ausencia; anatomía sí pinta" | Es una **brecha de `transportEquality` por la letra de la ley**: `transportEquality.inventory` incluye "root attributes" y el brazo estático emite 0 donde el DB emite 4 para valores equivalentes. Además el gate de paridad la **oculta** (N-1) y en app-platform (la única DB-driven por ley) no llega ningún brazo | P4 §Causalidad, N-1, N-3 |
| B2 | Cascada | "Usar `root-membership` y `channel-liveness`" | Ninguno de los dos mide la deuda que importa (clase B, 760); sus universos son casi disjuntos del ratchet (33 ∩ 2169 = 0) y `emitted = 117` sub-cuenta. Reconciliar (Kimi) es necesario pero insuficiente: hay que **reconstruir el clasificador** y crear el gate de contradicción (170) | P2 |
| B3 | CSS | "Higiene/DX, no producto" | Higiene sí; pero 344 KB gzip de CSS por página con un 11 % de engines que bithire nunca renderiza es una decisión de producto que merece el experimento de split; no bloqueante | P6 |
| B4 | RC-10 circularidad | "El árbol de entrada es determinista; autoridades especializadas intencionales" | La circularidad es texto (README:3-6 ↔ ROADMAP:683 ↔ `program/index.json`→`registry.json`→README:45) y `registry.json` contradice al DT vigente en su propio record; que sea intencional no la hace determinista para un lector nuevo | J-1, J-2 |
| B5 | Sighted | (aceptado por ambos) | Se mantiene íntegra: bithire vs themanagement = recolor + font swap; anatomía/radio/sombra idénticos | 05 |
| B6 | Gates | "No recortar sin perfil" | Aceptado el perfil como condición; la cifra de 38 drills + 9 freshness sobre 105 y el re-sello `gat-07` ×29 commits siguen siendo costo por lote | G-5 |
| B7 | "Cloud no vio 294/290" | cierto | Cierto; y ninguno de los tres vio que `program-check` es circular por diseño (0 imports de fuente) ni el "67" ×3 | P1 |

## C. Hallazgos nuevos que ninguno detectó

Lista completa en `06 §4`. Los seis que cambian una decisión:

1. `theme-channel-parity-gate` exime las 4 hojas estáticas de anatomía citando un productor DB-only; `staticDoorDisposition` no tiene lectores → el gate está verde sobre un campo inerte. **Instrumento.**
2. `dependency-honesty` (DS) exige el alias `commercial` que `platform-identity-zero` (DS) prohíbe producir → dos gates blocking del mismo repo en contradicción; y `pnpm run dependency:honesty` muere antes por un error ajeno. **Instrumento.**
3. `link-local-ds.mjs` de evnto dispara `pnpm build` en el repo DS si faltan artefactos (faltan hoy). **Riesgo de escritura cruzada.**
4. El filtro Expert del console no propaga en la recursión: 606/607 hojas de `chrome.controls` invisibles. **Producto, fix de 1 línea.**
5. `CompiledBrand.recipeProfile` ya se valida y devuelve; nadie lo lee; `recipe-profile` es el único control de su clase sin `staticDoorDisposition`. **Fix más chico de lo que los tres propusieron.**
6. Un PR desde una rama espejo hacia `main` dispara CI sin tocar `ci.yml`. **Cambia D1.**

## D. Secuencia mínima recomendada (sin implementar)

Ordenada por "instrumentos que pueden mentir → defectos causales con delta visible → evidencia visible → cascada → entrega". Ninguna ola de esta lista abre un modelo nuevo.

**S0 · Hoy, sin decisión de diseño (horas)**
- Respaldo sin push: `git bundle create <fuera del disco> --all` (D1-b); anclar `git branch release/2.19.37 a037d3a3c` (aditivo).
- T-1 Expert: 294→290 en 4 archivos + 4 checks, **más check contra `overrideTokens()`**; "67"→"290 (67+160+63)" en `cascade/roots` y `cascade/materialized`; docstring "71"→"67"; checkpoint 49→48.
- Corregir el `evidence.symbol` de `shape.button-style`.
- ~~`schemaVersion`~~ ya commiteado (`ecdc01a61`).

**S1 · Defectos causales con delta visible (días)**
- `shape.button-style`: fan-out por tamaño en `appearance-posture` (plantilla `chrome-variables:1742-1746`) + computed en 5 tamaños × 3 stops.
- `recipes.profile`: `CodeOwnedGovernedBehavior.recipes` + fallback en el provider; clasificar `staticDoorDisposition` (`RUNTIME_ONLY_NO_ARTIFACT`); es un lote con captura A/B (enciende 6 familias en 3 verticales).
- PageShell: `inline-size: 100%` + regresión Playwright a 390 px.
- `migrate-v1`: issue `ignored_field` para `palette.dark` con `backgroundMode !== 'auto'`.
- Console: propagar `filter` en `SchemaObjectEditor`.
- Elevación: extender preset a 6 niveles derivados del ladder del vertical (adjudicar `soft`/`flat` redundantes).

**S2 · Slice F4C (5-8 días) — requiere excepción escrita del owner a la cola vinculante**
- 6-8 familias insignia, 3 verticales, 390/768/1280, light/dark, estados, `DELTA_ESPERADO` declarado, computed + sighted, suite local al cierre. Ley de lote permanente: `DELTA_NULO_DECLARADO` o `DELTA_ESPERADO` con captura.
- "10 en uno": captura A/B de los 10 `SOURCE_BOUND`.

**S3 · Cascada (después del slice)**
- Reconstruir el clasificador de raíz (PRE_F4B ya declarado) desde `root-catalog.json` leyendo declaraciones en `src/**/*.css` + artefactos; drills = controles A/B de P2.
- Re-anclar el ratchet sobre la clase B (760 modern / 960 corpus); gate de contradicción cruzada (170); gate productor/consumidor `--_ds-*` (198 filas, regla real).
- Montar `densityScopeAttributes(profileDefaults.density)` en las 23 surfaces + bypass de `admin/audit`; documentar `profileOverrides`.

**S4 · Entrega (antes de cualquier publish/repin)**
- Lote F8 `/commercial` tal como está escrito el 19-08: 49 archivos JS + 4 CSS + 5 alias + verifier + re-anclar `dependency-honesty` + ~14 tokens `--ds-commercial-*` + decisión `ProductWindow` + `TreeView`→`TreeViewConnector`/`PatternTreeView`.
- evnto: documentar `USE_LOCAL_DS` en la app, repin honesto, y quitar el build cruzado de `ensureLocalDsArtifacts` o hacerlo explícito.
- Minificar `dist/*.css` (cssnano-simple, el mismo de Next) dejando `styles/` legible; retirar o dar consumidor a los 5 tokens de la allowlist sin lector; validación de pairing vs packs embebidos.

**S5 · Gobernanza (continuo)**
- 4 métricas ancladas en cada asiento (certificación `1−UNKNOWN/5100`, aceptadas/255, divergencia mínima/255, sighted/255); el 62 % rotulado como juicio.
- Perfil de tiempo/riesgo de los 105 gates antes de cualquier recorte.
- Script de reanclaje de memos (36 restantes) con el método de `docs/evidence/2026-08/INDEX.md`.
- Regenerar `docs-engineering/.../runtime/engines/README.md` (DaisyUI) y unificar la autoridad de estado.

## E. Decisiones exclusivas del owner

| # | Decisión | Opciones | Recomendación Cloud | Codex | Kimi |
|---|---|---|---|---|---|
| D1 | Respaldo y CI de 674 commits locales | (a) enmienda escrita: rama espejo `refs/heads/modern-rescue/wip` + PR hacia `main` para CI (no requiere tocar `ci.yml`), nunca merge/publish desde ella · (b) `git bundle` a disco externo + suite visual local por cohorte, sin enmienda · (c) status quo | **(b) hoy mismo** (cero enmienda, minutos) y **decidir (a)** esta semana: la red visual de 462 PNG lleva 25 días apagada y un PR la enciende sin cambiar el workflow | (b) primero; (a) sólo si la rama entra al modelo | (a) con las dos piezas (enmienda + `ci.yml`) — el matiz PR hace innecesaria la segunda |
| D2 | Expert 294→290 + check contra fuente + "67"×3 | (a) T-1 ahora · (b) esperar al cierre de fase | **(a)** — un checker que compara copias es el defecto de RC-10 hecho código | (a) | (a), "primero que cualquier lote" |
| D3 | `schemaVersion` | — | **Consumida**: commiteado `ecdc01a61` por el DT durante esta reauditoría; sólo queda que el asiento (ya `f166570d9`) lo registre como ratificado | ratificar | autorizar |
| D4 | Lote cross-repo app-platform | (a) diseñar ahora, ejecutar antes del próximo repin · (b) ejecutar ya · (c) esperar a F8 completo | **(a)** salvo que haya repin en los próximos días → (b). Incluye decidir `ProductWindow` (§12.6, abierta desde el 19-08) y `TreeView`. Anclar `release/2.19.37` hoy en cualquier caso | (a)/(b) según ventana | "el ítem más urgente" |
| D5 | 6 diales nuevos + 2 fusiones | (a) adjudicar nombre a nombre después del slice F4C · (b) autorizar ahora · (c) rechazar | **(a)**. Si el slice prueba que los diales actuales mueven pintura cuando se cablean (button-style, elevación, recipes), varios de los 6 pierden justificación; `control.size` y `focus.identity` son los que más probablemente sobrevivan | (a) | (a) condicionado al slice |
| D6 | Scope "una card en una página" | (a) explotar lo construido (23 surfaces + `profileOverrides` + `RecipeProfileProvider`) y extender `SurfaceVisualOverrides` con `anatomy?`/`recipeProfile?` como decisión de diseño del tier de instancia · (b) enmienda para `scope` en `TenantCapabilityDeclaration` · (c) nada | **(a)**. (b) está prohibido por ley fechada y no hace falta: el tier existe. Resolver antes qué significa `scope: 'vertical'` (0 usos) | frenar (b); probar `profileOverrides` | (a) |
| D7 | Instrumento canónico de cascada | (a) reconstruir el clasificador de raíz y re-anclar sobre clase B (760/960) + gate de contradicción · (b) adoptar `root-membership`/`channel-liveness` como los únicos · (c) drenar 2.169 | **(a)**. (b) deja sin medir la clase B; (c) es una cola falsa | (b) | reconciliar primero |
| D8 | Orden del próximo tramo | S0→S1→S2→S3→S4 (arriba) vs Codex (instrumentos → causales → slice → escalado) vs Kimi (idem, slice antes que drenaje) | **Convergente con Kimi**: instrumentos (horas) → causales con delta visible → slice F4C → cascada → entrega antes de repin. Cloud retira "drenaje antes de F4C" | igual salvo D7 | igual |
| D9 | Qué cifra comunicar | (a) 4 métricas ancladas + divergencia léxica etiquetada · (b) 62 %/43 % · (c) 2,61/5 | **(a)**; (b) y (c) sólo rotulados como juicio y nunca solos | (a) | (a) |
| D10 | Método de F9 | (a) 5.100 celdas por celda con grupos como generadores de evidencia y prueba de pertenencia · (b) aceptación por representante (reduce el denominador) | **(a)** — Cloud retira (b). La tasa observada es 0; sin (a) F9 no tiene fecha, pero el denominador es constitucional | (a) | (a) |
| D11 | Transporte DB: qué abrir | (a) `modes.dark.{typography,surfaces}` (~30) + issue `ignored_field` · (b) además `palette.ramps` (80) y `surfaces.elevations` (6) · (c) `modes.*.chrome` | **(a)**; (b) beneficia sólo a rottay; (c) revienta `maxDocumentBytes` y es el "clon exhaustivo" prohibido | por capacidad, no por cifra | qué necesita el editor |
| D12 | `responsive.posture` | (a) narrar la capacidad a lo que hace (span bias) · (b) mover los umbrales a CSS gobernado | Ya `OPEN_OWNER` en el manifest; **(a)** hasta que exista consumidor de más de una familia | data deliberada | — |
| D13 | Gates blocking | (a) perfil de tiempo/riesgo y luego recorte · (b) recorte directo a ≤35 | **(a)** — Cloud retira (b) | (a) | — |
| D14 | evnto `link-local-ds.mjs` | (a) documentar + repin + quitar el build cruzado · (b) migrar al patrón read-only de app-platform | **(b)** a mediano plazo, (a) ahora | modo intencional | — |

## F. Propuestas que NO deben ejecutarse

- `git push` a cualquier rama por un agente (cerca absoluta; sólo el owner).
- Cola de "drenar 2.169" (739 falsos positivos en modern; 670 no son modern).
- Fallback de una línea en `skin/button.css:73` y hermanos (vacuo; enmascararía regresiones futuras).
- Swap `[dir='rtl']` de `env(safe-area-inset-left/right)` en drawer/sheet/overlay-modal (regresión).
- Emitir CSS para `responsive.posture` como fix mecánico (`OPEN_OWNER`; el manifest explica por qué el CSS espeja los literales).
- `scope: surface|instance` en `TenantCapabilityDeclaration` (prohibido; `domain` del manifest es generado y borraría el campo).
- `<Box data-anatomy-card=…>` por subárbol (segunda autoridad sobre un namespace de root; ningún gate lo detecta).
- Abrir `modes.*.chrome`, `surfaces.materials` (0 autorías) o `palette.ramps`/`surfaces.elevations` como medida de flota (rottay-only).
- Borrar los 1.024 tokens "no leídos" (sólo 5 están en la allowlist; el resto tiene consumidores fuera del bundle).
- Recortar gates a ≤35 sin perfil de tiempo/riesgo.
- Reducir el denominador F9 por aceptación de representante.
- Cambiar sólo `globals.css` en app-platform (quedan 49 archivos JS + alias + verifier + tokens).
- `pnpm dev:local-ds` en evnto hoy (dispara `pnpm build` en el DS).
- `git gc --aggressive` / `repack -ad` / `prune` en el DS antes de anclar `a037d3a3c`.
- Subir 294→290 en la constitución sin el check contra `overrideTokens()`.
- Copiar memos `/private/tmp` sin verificación de SHA.
- Los 6 diales/fusiones antes del slice F4C.

## G. Resumen ejecutivo para el owner

**Consenso firme (Cloud, Codex, Kimi, verificado por esta pasada):**
1. La arquitectura se sostiene: un lowering, fail-closed 16/16, restore exacto, skin-first sin literales de color. Nadie encontró evidencia para revertirla.
2. El próximo tramo debe ser visible: un slice F4C de 6-8 familias con delta esperado y captura A/B, después de un bloque corto de instrumentos y defectos causales.
3. Instrumentos que hoy mienten y hay que corregir primero: Expert 294/290/67 con `program-check` circular; testigo falso de `shape.button-style`; checkpoint 49/48; `schemaVersion` (ya cerrado por el DT hoy).
4. Defectos causales pequeños con delta visible: `shape.button-style` (fan-out por tamaño, plantilla existente), `recipes.profile` perdido en code-owned (valor ya calculado y descartado), PageShell a 390 px (`inline-size: 100%`), `palette.dark` descartado sin aviso, filtro Expert de profundidad 1.
5. `app-platform` necesita un lote cross-repo (49 archivos JS + CSS + alias + verifier + tokens) **antes de cualquier publish/repin**; el lote ya está escrito con dueño desde el 19-08 y `ProductWindow` sigue sin decidir.
6. Ningún agente hace push. El fix de Cloud fue un error de lectura de la cerca.
7. Las proyecciones 20-25 % y 51-217 días se retiran; 62 %/43 % no tienen fórmula; comunicar cifras ancladas.

**Desacuerdo abierto (con evidencia de ambos lados en 06):**
1. Qué instrumento manda en cascada y cuál es la deuda: Cloud sostiene que ni el ratchet ni `root-membership`/`channel-liveness` miden la clase B (760) y que hay 170 contradicciones; Codex prefiere sus dos instrumentos; Kimi pide reconciliar. La reconciliación ya está hecha en P2; lo que falta es decidir D7.
2. Si la anatomía estática es "autoridad duplicada" o "brecha de `transportEquality`": la ley incluye "root attributes" en el inventario de paridad; además el gate que debería verla la exime.
3. Cuánto pesa RC-08 después de descontar la minificación de Next (344 KB gzip; 11 % de engines ajenos).

**Decisiones que sólo el owner puede tomar (tabla E):** D1 respaldo/CI · D2 T-1 Expert · D4 ventana app-platform · D5 diales · D6 scope · D7 instrumento de cascada · D8 orden · D9 cifra · D10 F9 · D11 apertura DB · D12 responsive · D13 gates · D14 evnto. D3 quedó consumida.

**Lo que esta reauditoría corrige de sí misma en una frase:** Cloud midió bien y calificó mal — cinco de sus diez bloqueantes eran hechos ciertos con severidad, causa o fix equivocados; los dos que Codex y Kimi no vieron (instrumentos que se validan a sí mismos, y la clase B de 760 canales sin productor) son los que más importan para que un dial "cambie todo el skin".
