# J — Documentación, DX, mantenibilidad y coherencia entre fuentes de verdad — 8 ópticas

## Puntaje por óptica

| # | Óptica | Puntaje 0-5 | Evidencia (1 línea) |
|---|---|---|---|
| 89 | Sprawl de autoridad | 0 | 3 documentos se declaran mutuamente "única autoridad de estado" (README.md:3-6, ROADMAP-EJECUCION:683-684, program/index.json `statusAuthority`↔README.md:45 circular) |
| 90 | Tres roadmaps | 1 | ROADMAP-DE-REMEDIACION.md (Ola 1-7) huérfano, nunca citado por README/program/index.json/AGENTS.md; registry.json es mecánicamente consistente (`roadmap:check` OK) pero su `notes` de WO-CRA-23 está auto-declarado STALE en STATUS.md |
| 91 | docs-engineering sync | 1 | gap de 10 a 38 días entre los 4 docs auditados y el último cambio de contrato relacionado en el DS; `runtime/engines/README.md` describe una arquitectura DaisyUI retirada a cero |
| 92 | Onboarding | 1 | CLAUDE.md:5-6 y AGENTS.md:8 se remiten circularmente; ~2.400 líneas de prosa de gobernanza antes de una respuesta operativa; el campo concreto (`chrome.cardComponent`) vive en CLAUDE.md:577/609 |
| 93 | Idioma y vocabulario | 1 | 14/14 términos del programa (raíz, canal, head, dial, seed, cohorte, lote, asiento, drill, receipt, seal, ratchet, lane, packet) sin definición en `docs-engineering/glossary` ni en un único lugar del repo |
| 94 | Nombres y estructura | 4 | folder/index: 0 archivos de producción sueltos en `src/` (comando verificado, control positivo en 0 también) — 5/5; naming de gates: 12/90 scripts con id histórico opaco (`cra11:check`, `gat07:check`) — 3/5 |
| 95 | Showroom como doc viva | 2 | registries del showroom: 274 entradas (`slug:`) en primitives+patterns+structures+surfaces vs 237 del denominador canónico (+15.6%); theme-builder no referencia ninguno de los 20 controles del producto |
| 96 | Deuda documental | 2 | 0 marcadores `TODO:`/`FIXME:`/checklist real (el conteo léxico de 157 "TODO" era falso positivo del español "todo"); deuda vive dispersa en 84 menciones de "deuda" a través de asientos §13, un único párrafo "Blocked on:" consolida sólo lo vigente |

## Hallazgos (ordenados por severidad)

### H-J-1 · BLOQUEANTE · Tres documentos se declaran cada uno "la única autoridad de estado"
- Qué: `modern-rescue/README.md` se autoproclama única fuente de verdad del programa; `docs/history/programs/architecture-refactor/2026-08/execution/index.md` hace la misma afirmación sobre sí mismo en su propia sección de estado vivo; `program/index.json` apunta la autoridad a un tercer archivo que a su vez se remite de vuelta al primero.
- Evidencia:
  - `packages/core/scripts/quality-evidence/programs/modern-rescue/README.md:3-6`: "This is the only human entry point for WO-CRA-23... No other Markdown file may redefine this programme, its status, its denominator, its control model, or its acceptance law."
  - `docs/history/programs/architecture-refactor/2026-08/execution/index.md:683-684`: "**Este roadmap es desde ahora la única escribanía durable del programa.** Toda medición, adjudicación, implementación, prueba, rechazo, aceptación, bloqueo y siguiente paso se registra acá."
  - `packages/core/scripts/quality-evidence/programs/modern-rescue/program/index.json:9`: `"statusAuthority": "roadmap/registry.json"`.
  - `packages/core/scripts/quality-evidence/programs/modern-rescue/README.md:45`: "`roadmap/registry.json` is the machine status index and points here" (es decir, de vuelta al README).
- Impacto en el objetivo del owner: un agente nuevo (o el propio Fable) no tiene un algoritmo determinista para saber cuál de los tres leer como verdad cuando difieren; de hecho difieren (ver H-J-2 y H-J-5). Esto es exactamente el tipo de ambigüedad que el "no other Markdown may redefine" pretendía prevenir, violado por el documento que más volumen de estado acumula (8.098 líneas).
- Optimización concreta: elegir un único archivo literal como autoridad (recomendado: `roadmap/registry.json` + `checkpoint/index.json`, ya generados por comando); reducir `README.md` y `ROADMAP-EJECUCION-2026-08-19.md` a redirecciones de una línea si dejan de ser la fuente; agregar un grep-gate en CI que falle si la frase "only human entry point" / "única escribanía" / "statusAuthority" aparece en más de un archivo `.md`/`.json` a la vez.

### H-J-2 · BLOQUEANTE · El propio `registry.json` (la autoridad que `program/index.json` nombra) se contradice sobre quién es el DT vigente
- Qué: dentro del MISMO record `WO-CRA-23` de `roadmap/registry.json`, el campo `notes` (prosa fija) dice que Codex es el DT, mientras el último `progressLog` dice que es Kimi K3. `roadmap/STATUS.md`, generado desde el mismo registro, tiene que admitir por escrito que su propio dato de origen está obsoleto.
- Evidencia:
  - `roadmap/registry.json` → `workOrders[].notes` para `WO-CRA-23`: "...Codex is DT/coordinator and sole local committer; Claude Opus/Sonnet workers implement via tmux and never commit..." (era del owner order 2026-08-21).
  - `roadmap/registry.json` → `progressLog` última entrada (2026-08-27 02:43): "Sucesion DT 2026-08-27... el asiento DT sigue siendo Kimi K3".
  - `roadmap/STATUS.md:53` (fila "In progress" de WO-CRA-23): "El campo notes superior describe la era 2026-08-21 (Codex DT) y queda STALE en su modelo operativo: el vigente es Kimi K3 DT/coordinador..."
- Impacto en el objetivo del owner: la identidad de quién puede commitear localmente es un hecho de proceso con peso real (AGENTS.md lo trata como gate de escritura), y vive contradicho dentro del archivo que `program/index.json` designa como *la* autoridad de estado. Un lector que abra sólo `notes` (el campo "de contexto" natural) se lleva la respuesta equivocada.
- Optimización concreta: dejar de escribir `notes` a mano; generarlo desde la misma fuente de sucesión (`docs/history/prompts/architecture-refactor/2026-08/design-lead-succession/index.md`) con el mismo comando que regenera `STATUS.md`, para que ambos campos deriven de un único emisor y no puedan divergir.

### H-J-3 · ALTO · `docs-engineering/.../runtime/engines/README.md` describe una arquitectura retirada como si fuera la vigente
- Qué: el doc que CLAUDE.md manda leer para "Change engine behavior" dice que el engine `modern` es un "DaisyUI / Tailwind CSS bridge" que "Uses DaisyUI component classes" y sincroniza tema vía DaisyUI. El propio CLAUDE.md del DS (sección "Project Context") dice lo contrario: la capa DaisyUI está drenada a cero y hay un ratchet decrease-only para que no vuelva. Un test vivo lo hace cumplir.
- Evidencia:
  - `docs-engineering/engineering/design-system/runtime/engines/README.md:52-56`: "DaisyUI / Tailwind CSS bridge... Uses DaisyUI component classes composed with Tailwind utilities... DaisyUI theme is synchronized with DS CSS variables via ThemeProvider... Supports Tailwind JIT compilation for dynamic styles."
  - `ui-design-system/CLAUDE.md` (sección Project Context): "modern — the Rottay-native premium skin. The residual DaisyUI class layer is fully drained (`daisy.classConsumers: 0`, WO-TOK-03); the ratchet stays decrease-only so it never comes back".
  - `packages/core/scripts/engine/token-audit/token-audit.daisy.test.mjs:316`: `assert.equal(counters['daisy.classConsumers'], 0);` — gate vivo.
  - El mismo doc cita "WO-ENG-01..11" como backlog operativo (línea 13); `roadmap/registry.json` mide el lane `engine-modern` en WO-ENG-01..25 (25 WOs, 23 done: `python3` sobre `registry.json`, `grep -o "WO-ENG-[0-9]*" roadmap/engine-modern.md | sort -u` → hasta WO-ENG-25). El doc subcuenta el lane en un 56%.
  - `git log -1 -- engineering/design-system/runtime/engines/README.md` (repo docs-engineering) → 2026-08-17; commits del DS que tocan el skin `modern` desde entonces siguen llegando a diario hasta hoy (`git log -- packages/core/src/foundation/tokens/css/runtime/engines/modern/` en ui-design-system, últimas entradas 2026-08-27/28).
- Impacto en el objetivo del owner: el documento oficial de referencia para "cómo pinta el engine modern" enseña el modelo mental equivocado (clases Tailwind/DaisyUI) para el engine exacto que todo el programa Modern Rescue existe para arreglar (patrón real: skin CSS por `data-part`, ver CLAUDE.md "Component paint pattern"). Cualquier ingeniero que lo lea antes de tocar el engine parte de una premisa falsa.
- Optimización concreta: regenerar esta sección desde la misma prosa que ya vive en `CLAUDE.md` ("Component paint pattern") y reemplazar el literal pineado "WO-ENG-01..11" por un puntero vivo ("ver `roadmap/engine-modern.md` para el rango actual") — el propio CLAUDE.md del DS ya prohíbe justo este patrón de literal pineado para el conteo de familias por la misma razón.

### H-J-4 · ALTO · Documentation Update Rule incumplida en los 4 docs muestreados; el árbol que sí se actualiza no es ninguno de los 4
- Qué: `runtime/tenancy`, `foundations/tokens`, `runtime/engines` y `capability-map` — los cuatro README que CLAUDE.md nombra como destino obligatorio cuando cambia tenancy/tokens/engine/capabilities — están todos desactualizados respecto al último cambio de contrato relacionado en el DS. El árbol que sí se regenera con frecuencia (`docs-engineering/engineering/design-system/tokens/*.md`) es un directorio *distinto*, no uno de los cuatro nombrados, y ninguno de los cuatro lo referencia como fuente más fresca.
- Evidencia (comando: `git log -1 --format=%ad -- <path>` en docs-engineering; `git log -N -- <path>` en ui-design-system):

  | Doc (docs-engineering) | Último commit doc | Último cambio de contrato relacionado en DS |
  |---|---|---|
  | `runtime/tenancy/README.md` | 2026-07-26 | F2A-1 tenant-theme override fix, 2026-08-26 (`fc1b8faf9`, `2509bdd3d`) — 31 días de gap |
  | `foundations/tokens/README.md` | 2026-07-18 | F4B-13..17B cierres de control (motion.dial, typography.families, recipe-profile, profiles.expressive, token-overrides), 2026-08-25/26 — 38 días |
  | `runtime/engines/README.md` | 2026-08-17 | PALETA P1 / colapsos 2B, 2026-08-27/28, más el defecto de H-J-3 — 10-11 días y contando |
  | `capability-map/README.md` | 2026-08-02 | prácticamente todo F2A/F3/F4B (2026-08-11 en adelante) — 26+ días |

- Muestreo pedido de 5 cambios de contrato/control recientes → estado de su doc:
  1. `motion.dial` cierra SOURCE_BOUND (2026-08-25, `48cd4d347`) → documentado en `docs-engineering/.../tokens/impact-map.md` y `exposure-tiers.md` (regenerados 2026-08-26/27), **no** en ninguno de los 4 docs nombrados en la tarea.
  2. `typography.families` (2026-08-25, `b0fd9da42`) → mismo caso: sólo en `tokens/*.md` regenerado.
  3. `recipe-profile` (2026-08-25, `b205a7d54`) → mismo caso.
  4. `profiles.expressive` (2026-08-25, `03f26317a`) → mismo caso.
  5. PACKET K — el nuevo `map-entry` kind del capability registry (2026-08-25, `90e2bfce4`) → `grep -rl "map-entry" docs-engineering/engineering/design-system` → **0 resultados**, no documentado en ningún lado.
- Impacto en el objetivo del owner: la regla "ALWAYS update... in the same session" existe para que un tercero (Fable, un ingeniero nuevo, otra vertical) no tenga que leer el roadmap de 8.098 líneas para saber qué controles existen hoy. Falla exactamente en los 4 puntos de entrada que CLAUDE.md designa para eso.
- Optimización concreta: apuntar `runtime/tenancy`, `foundations/tokens` y `capability-map` al mismo pipeline de regeneración que ya produce `tokens/impact-map.md` / `tokens/exposure-tiers.md` (evidenciado por los commits "regenerate tokens views — C5 re-emission", 2026-08-26), en vez de mantenerlos como prosa manual paralela.

### H-J-5 · ALTO · Tres taxonomías de "fase" y cuatro números de "% avance" coexisten sin fórmula de reconciliación
- Qué: la misma pregunta ("¿en qué fase está el programa?" / "¿cuánto avanzó?") tiene respuestas incompatibles según qué documento se abra, sin que ninguno explique la relación entre ellas.
- Evidencia — fases:
  - F0..F9 — `modern-rescue/README.md:246` ("Current wave: F3").
  - Phase 0/1/2A/2B/2C/3/4/5/6 — `roadmap/STATUS.md:5` ("**Phase scope**: Phase 0 open; Phases 1, 2A, 2B, 2C, 3, 4, 5, 6 locked, ownerGo pending"), numeración distinta para el mismo repo, sección "DS improvements burn-down".
  - Ola 1..7 — `docs/history/programs/architecture-refactor/2026-08/remediation/index.md` (497 líneas, fechado 2026-08-19), tercer modelo, huérfano: `grep -rln "ROADMAP-DE-REMEDIACION" **/*.md **/*.json` sólo devuelve `docs/history/programs/architecture-refactor/2026-08/handoff/index.md`, `docs/ARCHITECTURE.md`, `docs/history/programs/architecture-refactor/2026-08/diagnosis/index.md` — ninguno de ellos parte del árbol de autoridad (README.md/program/index.json/AGENTS.md no lo mencionan) ni lo marca cerrado/superseded en su propio texto (`grep -n "supersed\|retract\|deprecat\|archivad\|cerrado\|obsolet"` no encuentra ese cartel).
- Evidencia — % avance:
  - 74% — `roadmap/STATUS.md:7` ("Burn-down — 74/100 done (74%)").
  - 27% — `roadmap/STATUS.md:15` ("DS improvements burn-down — 22/82 execute source IDs done (27%)"), en el MISMO archivo.
  - 62% / ~43% — `docs/history/programs/architecture-refactor/2026-08/execution/index.md:316,1400,4587,4622,4662` ("**62% / ~43%**", repetido verbatim como "Métrica sin mover").
  - 0% — `modern-rescue/README.md` tabla "Derived at write time": `adjudication.accepted` = 0 de 255 (`packages/core/manifest/index.json` `rollups.familyReviews.accepted`), el número que el propio README llama el denominador honesto.
  - La línea 1400 de `ROADMAP-EJECUCION-2026-08-19.md` reconoce la brecha una vez ("Cerrar F4A/F4B **no certifica** F9: 0/5100 celdas aceptadas") pero esa advertencia no viaja con las repeticiones posteriores del "62%/43%" en 4587/4622/4662.
- Impacto en el objetivo del owner: cuatro cifras de "avance" que difieren hasta 74 puntos, cada una correcta en su propio marco, sin ninguna etiqueta que diga cuál responde qué pregunta. El owner o un auditor externo (Fable) puede citar cualquiera de las cuatro con evidencia real y llegar a un veredicto opuesto.
- Optimización concreta: nombrar cada métrica explícitamente en cada cita ("62% work-item-closure (NO family-acceptance)" vs "0/255 family-acceptance — el denominador honesto"); formalmente cerrar o vincular `ROADMAP-DE-REMEDIACION.md` (Ola 1-7) y la taxonomía "Phase 0-6" o declarar por escrito cuál de las tres numeraciones de fase es la vigente.

### H-J-6 · MEDIO · Bootstrap circular entre CLAUDE.md y AGENTS.md; ~2.400 líneas antes de una respuesta operativa
- Qué: `CLAUDE.md` instruye leer `AGENTS.md` primero para trabajo de Modern Rescue; el primer paso de `AGENTS.md` es leer `CLAUDE.md`. Siguiendo la cadena al pie de la letra para el caso de prueba ("tenant X con cards con borde y sin sombra") no hay salida corta.
- Evidencia:
  - `CLAUDE.md:5-6`: "If you are working on the Modern Rescue programme (WO-CRA-23), read `AGENTS.md` first, then the canonical authorities it lists."
  - `AGENTS.md:8`: "1. `CLAUDE.md` — project-wide bootstrap and general rules." (primer ítem del propio orden de lectura de AGENTS.md).
  - Tamaño de la cadena mandatada por AGENTS.md §"Read order" (comando `wc -l`): `CLAUDE.md` 609 + `AGENTS.md` 79 + `modern-rescue/README.md` 423 + `program/index.json` 97 + `customization-model/index.json` 860 + `orchestration/index.json` 339 = **2.407 líneas**, sin que ninguna contenga el nombre del campo operativo real.
  - El campo concreto (`chrome.cardComponent -- bg, border, shadow, header/body/footer`) vive en `CLAUDE.md:577` de 609 — la sección "Premium white-label model" (línea 315), fuera de la cadena AGENTS.md-mandatada y subordinada por el propio bootstrap ("No section in this file overrides..." programme authorities).
  - El doc corto y directamente al grano — `docs-engineering/.../capability-map/README.md` (155 líneas) — es el que CLAUDE.md pide leer "BEFORE... adding a tenant knob" en su sección "AI Documentation", pero esa sección es "general project rules" que el propio bootstrap subordina cuando el trabajo cae bajo Modern Rescue, y AGENTS.md no lo menciona en absoluto.
  - Formalmente, ninguna de las 255 familias tiene hoy una disposición certificada para ningún control (`adjudication.unreviewed` = 255, `manifest/index.json`), así que "cards con borde y sin sombra para el tenant X" cae exactamente en la zona que el programa llama oficialmente no verificada — el nuevo ingeniero no tiene un ejemplo cerrado al que imitar.
- Impacto en el objetivo del owner: la primera pregunta operativa razonable para un ingeniero nuevo ("¿cómo customizo una card por tenant?") no tiene un camino de lectura corto ni sin ambigüedad, a pesar de que la respuesta concreta existe y es breve.
- Optimización concreta: romper el ciclo explícitamente (el paso 1 de AGENTS.md debería decir "ya estás en el archivo correcto, no lo releas" en vez de listar CLAUDE.md); mover el puntero a `capability-map/README.md` al inicio del orden de lectura de AGENTS.md para el caso "agregar/cambiar una customización de tenant", antes de los tres JSON.

### H-J-7 · MEDIO · Vocabulario del programa no está definido en ningún lugar único
- Qué: de 14 términos operativos usados constantemente en el programa (raíz, canal, head, dial, seed, cohorte, lote, asiento, drill, receipt, seal, ratchet, lane, packet), ninguno tiene una definición explícita en el glosario del monorepo ni en un diccionario único dentro del repo del DS.
- Evidencia:
  - `grep -il` de cada término contra `docs-engineering/glossary/README.md` y `docs-engineering/glossary/naming-registry/README.md`: 14/14 sin resultado real. Los dos únicos matches léxicos ("seed", "lane", "packet") son falsos positivos verificados por control positivo de contexto: "seed" aparece sólo en `isTeam`/"seed-check metadata" (glosario:99, sin relación con `palette.seeds`); "lane" aparece sólo como "control plane" (naming-registry:52); "packet" aparece sólo como "document packets" del módulo `@rottay/documents` (naming-registry:45,90).
  - Dentro del propio repo del DS, "lane" aparece una sola vez como restricción, no como definición: `modern-rescue/README.md:348` ("A lane is mechanical only after value parity is proven..."), sin decir qué ES una lane.
  - Ningún JSON del programa (`program/index.json`, `customization-model/index.json`, `orchestration/index.json`, `quality-rubric/index.json`) trae un diccionario de vocabulario — se verificó por lectura completa de los tres primeros y grep de "definition/meaning/means" sin resultados.
- Impacto en el objetivo del owner: el vocabulario se aprende por acumulación de contexto a través de las 8.098 líneas de `ROADMAP-EJECUCION-2026-08-19.md`, no por consulta puntual — esto es justo el patrón de "conocimiento tribal" que el resto del programa (contratos JSON, gates mecánicos) explícitamente busca evitar en otros ejes.
- Optimización concreta: agregar una tabla `## Vocabulario` término→definición en `modern-rescue/README.md` o un `vocabulary.json` versionado junto a los otros contratos del programa, enlazado desde `AGENTS.md`.

### H-J-8 · MEDIO · El playground/theme-builder del showroom no expone ninguno de los 20 controles del producto
- Qué: la única superficie interactiva "editá y mirá el efecto en vivo" del repo edita campos crudos del shape `BrandTheme` (colores hex, `border-radius` en px, duraciones de motion en ms) en vez de los 13 controles Standard + 7 Pro que son la promesa central del programa.
- Evidencia:
  - `packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx` (118 líneas): construye un `INITIAL_BRAND_THEME` con `palette.primaryColor: '#4f46e5'`, `surfaces.borderRadius: { sm: '6px', ... }`, `motion.entranceDuration: 200`, y lo pasa a `PatternBrandStudio`.
  - `grep -rn` de los 20 ids de control (`palette.seeds`, `typography.pairing`, `typography.families`, `typography.scale`, `shape.radius-scale`, `shape.button-style`, `density.mode`, `spacing.rhythm`, `motion.dial`, `surfaces.elevation-posture`, `surfaces.effect-intensity`, `navigation.sidebar-tone`, `experience.profile`, `chrome.families`, `chrome.anatomy`, `token-overrides`, `recipe-profile`, `profiles.expressive`, `profiles.icon`, `responsive.posture`) contra `theme-builder/page.tsx` → 0 resultados.
  - `modern-rescue/README.md:8-24` ("Product promise"): la promesa central es "a small set of understandable public customization controls" — exactamente lo que el theme-builder no muestra.
- Impacto en el objetivo del owner: un visitante del showroom (incluido un stakeholder comercial) aprende un modelo de personalización distinto al que el programa está construyendo; no hay ningún lugar navegable donde ver los 20 controles operar en vivo con sus ids reales.
- Optimización concreta: recablear `PatternBrandStudio` (o agregar un modo alternativo) para exponer los 13+7 controles por id/etiqueta usando `packages/core/tokens/controls/README.md` (catálogo generado) como fuente, en vez de (o además de) los campos crudos de `BrandTheme`.

### H-J-9 · BAJO · Los registries del showroom no coinciden con el denominador canónico de 255 familias
- Qué: la suma de entradas `slug:` de los cuatro registries de showroom (excluyendo charts e icons) es 274, contra 237 del denominador canónico de `program/index.json` para las mismas cuatro categorías (+18 charts = 255 total canónico).
- Evidencia:
  - `grep -c "slug:" src/data/registry/{primitives,patterns,structures,surfaces}.ts` → 113 + 70 + 47 + 44 = 274.
  - `packages/core/scripts/quality-evidence/programs/modern-rescue/program/index.json` → `denominators`: `primitives:105, patternsExcludingCharts:57, structures:39, pageSurfaces:36` → 237 (+ `charts:18` = 255, igual a `family-inventory/index.json.rows.length`).
  - Diferencia: +37 sobre el subtotal de 4 tiers (274 vs 237, +15.6%).
- Impacto en el objetivo del owner: CLAUDE.md exige "Data registries must stay in sync with packages/core/ components"; el catálogo que debería ser la vidriera pública del inventario canónico diverge de él en más de un séptimo, sin ninguna nota que explique si son variantes deliberadas o deuda de sincronización.
- Optimización concreta: generar `src/data/registry/*.ts` desde `family-inventory/index.json` (fuente única ya existente) en un paso de build, en vez de mantenerlo escrito a mano; si la divergencia es intencional (ej. entradas por variante), documentarlo explícitamente y separar el conteo "familias" de "entradas de catálogo".

### H-J-10 · BAJO · `storybook-static/` es peso muerto local, no versionado, con 44 días de antigüedad — anterior a todo el programa
- Qué: el supuesto de que `storybook-static/` está versionado es incorrecto (está en `.gitignore`), pero el artefacto local sigue siendo confuso: 27 MB / 3.345 archivos, con la modificación más reciente de 2026-07-14 — anterior al arranque real de Modern Rescue (2026-08-04 en adelante) y a toda la ola de commits diarios desde entonces.
- Evidencia:
  - `.gitignore:12-13`: `storybook-static/` y `packages/core/storybook-static/` listados.
  - `git ls-files | grep -c storybook-static` → 0 (nada trackeado).
  - `du -sh packages/core/storybook-static` → 27M; `find packages/core/storybook-static -type f | wc -l` → 3345; `find packages/core/storybook-static -type f -newer packages/core/package.json | wc -l` → 0 (ningún archivo es más nuevo que el `package.json` actual).
- Impacto en el objetivo del owner: menor al enunciado (no hay riesgo de versión inflando el repo remoto), pero sigue siendo un artefacto local potencialmente engañoso si alguien lo abre creyendo que refleja el catálogo actual de 255 familias.
- Optimización concreta: documentar en el README del showroom que Storybook no forma parte del pipeline de documentación viva (el showroom Next.js lo es), o agregar una limpieza automática (`pnpm clean`) que lo borre si su mtime es anterior a N días.

## Lo que está bien (breve, con evidencia)

- Ley folder/index genuinamente cumplida: `find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "index.ts*" ! -path "*/tests/*" ! -name "*.test.*" ! -path "*/fixtures/*" ! -path "*/generated/*" ! -name "*.d.ts" ! -path "*/stories/*" ! -name "*.stories.*"` → **0** archivos de producción sueltos; control positivo también en 0 (`find src -name "types.ts"` / `"constants.ts"` → 0, todo vive en subcarpetas propias, ej. `src/ui/primitives/inputs/Button/{index.ts,contracts/,tests/,engines/,compound/}`). Sólo 7 archivos `use-*.ts(x)` sueltos, explícitamente permitidos por CLAUDE.md.
- La maquinaria `roadmap/registry.json` + `roadmap/STATUS.md` es mecánicamente consistente: `node scripts/roadmap/status/index.mjs check` → `roadmap:check OK — 100 WOs consistent across registry + 6 lane files`.
- `roadmap/STATUS.md:53` se autocorrige por escrito en vez de mentir en silencio: señala explícitamente que el campo `notes` de WO-CRA-23 está STALE y cuál es el dato vigente — buena práctica, poco común en un programa tan denso en prosa.
- `docs/history/BACKLOG.md` está correctamente archivado con cartel explícito: "Backlog histórico cerrado. La cola operativa vigente vive en `roadmap/`..." — contraste positivo contra el huérfano sin cartel de H-J-5 (`ROADMAP-DE-REMEDIACION.md`).
- Cero marcadores `TODO:`/`FIXME:`/checklists sin marcar reales en los documentos auditados (el conteo léxico inicial de 157 "TODO" era casi enteramente la palabra española "todo"; verificado con `grep -c "TODO:"` → 0, `grep -c "TODO("` → 0, `grep -c "^\s*- \[ \]"` → 0). La deuda se declara en prosa explícita, no se esconde en comentarios de código.

## Preguntas que no pude cerrar (y qué haría falta)

- No verifiqué si `docs-engineering` tiene algún gate de CI que debería fallar cuando el DS cambia un contrato sin actualizar su doc — sólo hice grep puntual, no revisé `docs-engineering/package.json` ni sus workflows. Haría falta inspeccionar eso para saber si la Documentation Update Rule es sólo convención o tiene enforcement.
- No pude correr un build del showroom (fuera de alcance read-only) para confirmar si las +37 entradas de registry "de más" (H-J-9) son variantes deliberadas (ej. Button listado por variante) o deuda de sincronización real — sólo grepeé el campo `slug:` sin inspeccionar cada entrada contra `family-inventory/index.json` fila por fila.
- No hice un parseo estructurado de las 84 menciones de "deuda" en `ROADMAP-EJECUCION-2026-08-19.md` para deduplicar ítems repetidos a través de asientos sucesivos (ej. "channel-liveness" aparece en varias entradas) de ítems genuinamente distintos — el número 84 es un conteo léxico de palabra, no de ítems únicos; haría falta un parser de las entradas §13 por encabezado en negrita.
