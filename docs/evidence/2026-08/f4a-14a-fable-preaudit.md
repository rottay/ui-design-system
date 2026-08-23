# F4A-14a — preauditoría Fable 5 del brief de implementación (read-only)

VERDICT: REJECT — un P0 accionable de una línea por raíz; el resto del brief está verificado fuerte y puede reemitirse en minutos.

Auditor: Fable 5 (read-only). Fecha: 2026-08-21.
Brief auditado: /private/tmp/f4a-14a-opus-implementation-brief.md — SHA-256 `bb44393a163e1624b75b2d2fbab572b3c50dc71bfc4dd97526c15cf16fa14837` (verificado byte-exacto).

## Snapshot observado

- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` ("chore(modern-rescue): hand DT control back to Codex"), worktree limpio (0 entradas porcelain).
- Los 3 hashes de pre-estado del write-set coinciden exactamente con §0 del brief (root-catalog `35a6912f…`, roster.json `7c8f562b…`, roster.md `1808731f…`).
- La nota de §0 es verdadera: el commit `9d5582dfd` contiene exactamente los 16 paths del relevo constitucional (los 14 T-1+P1 más los 2 GAT-07 que yo mismo audité) y NINGUNO es del write-set — la medición K4 sigue vigente.
- `stash@{0}` ajeno existe (WIP data-table sobre 04d29fac) — el fence de no tocarlo tiene referente real.
- Ambos gates del catálogo corren VERDES en el pre-estado y tienen CERO sitios de escritura (inspeccionados): `root-catalog-freshness-gate: OK — 64 roots (48 existe, 10 por-crear, 6 solo-artefacto)`; `root-exposure-gate OK — 26 tenant-dial, 28 internal-head, 10 gap`.

## Findings

### P0 — bloquea la emisión del lote tal como está escrito

**P0-1. §2.1 y §2.2: las `assignments` corregidas (`{total:1, bithire:1, modes:{bithire:["base"]}}`) borran la posición dark AUTORADA de bithire — dato medible falso en una autoridad gateada.**

- Vocabulario congelado del propio catálogo (`root-catalog.json` → `method.assignments`): *"Una ASIGNACIÓN es un par raíz × modo por tema… cuántas veces un tema tiene que TOMAR POSICIÓN"*.
- Fuente: `brand-themes/bithire/index.ts` — el overlay DARK autora `surfaceRoles.raised.foreground: "var(--ds-color-text-primary)"` (~línea 949, `@domicile derived`) y `surfaceRoles.overlay.foreground: "var(--ds-color-text-primary)"` (~línea 970). No es fallback del lowering: rottay no tiene nada equivalente y su artefacto no emite estos canales en ningún modo.
- Artefacto: el bloque dark de bithire (selector en `artifacts/bithire/index.css:1251`, corre hasta EOF) emite LOS CANALES CABEZA NUEVOS: `--ds-material-overlay-foreground` (línea 1545) y `--ds-material-raised-foreground` (línea 1566). Bajo CUALQUIER semántica defendible (posición autorada por modo, o emisión del canal cabeza por modo) bithire = 2 modos para estas dos raíces.
- La evidencia citada por el brief no alcanza para el ×1: la sonda centinela mutó sólo el brazo BASE (`surfaces.surfaceRoles.raised.foreground`) — "1 diff" prueba causalidad del base, no ausencia del dark; y la línea "Emisión medida" sólo cita base.
- El contraste que lo confirma: **§2.3 (overlay.bg) con ×1 SÍ es correcto** — su canal cabeza nuevo `--ds-material-overlay-background` se emite sólo en base (716); el dark emite únicamente el canal secundario `--ds-surface-overlay` (1664). La copia del patrón ×1 de §2.3 hacia §2.1/§2.2 es exactamente el error.
- Nota agravante: el catálogo ACTUAL ya dice bithire:2 `["base","dark"]` para estas raíces — esa mitad estaba BIEN; la reparación degradaría un dato correcto, en tensión con el propio fence "ningún valor tenant autorado se degrada".

**Corrección mínima**: en §2.1 y §2.2, `assignments` → `{total:2, rottay:0, bithire:2, evnto:0, modes:{rottay:[], bithire:["base","dark"], evnto:[]}}`. Alternativa: si K4 adjudicó una semántica de asignación distinta que dé ×1, el DT debe escribirla como enmienda de vocabulario del catálogo — no puede entrar en silencio por un brief de lote.

### P1 — corregir antes de entregar el brief al worker

**P1-1. §3, "Los 190 entries restantes no se tocan" — aritmética falsa bajo toda lectura.** Medido: 198 entries = 66 raíces × 3 temas (universe: catalogRoots 63 + authoredRoots 3). Las 8 raíces reparadas abarcan 24 entries, de los cuales ~18 cambian según la propia tabla de §3; lo intocado son las **58 raíces restantes = 174 entries** (180 si se cuenta por entry sin cambio). Un worker en frío que lea "quedan 190" toca de menos o desconfía de la tabla. Corrección: "las 58 raíces restantes (174 entries) no se tocan".

**P1-2. Invariante 7, "Las 8 raíces cuyo governor bithire es `dial en F4B (sin control atribuido…)`" — el conteo no tiene ancla en el árbol.** Medido: el roster tiene exactamente **3** entries bithire con ese governor (`color.border`, `--ds-color-text-secondary`, `--ds-color-text-page`; 9 entries en los 3 temas); el catálogo tiene **0**. Si el 8 viene de los tags `@governor` de fuente o de un ledger K4 en /tmp, el brief debe citarlo archivo:línea; como está, el referente es inhallable. Además la propia reparación de §3 (overlay.bg bithire → ese texto genérico) AGREGA una cuarta entry bithire con ese governor, chocando con el conteo congelado del invariante. El contenido operativo (preservar el texto donde exista, no resolver la clase) es conservador y ejecutable; lo roto es el número y la cita.

### P2 — no bloquean; asentar

1. **Invariante 6**: el rótulo `NOOP_ALREADY_RESOLVED` no existe en catálogo, roster ni docs/f4a — sólo en el brief. Los 3 rootIds sí existen (todos `existe`) y la instrucción es "no tocar" (segura); citar la fuente K4 del rótulo o quitarlo.
2. **§2.4, "bithire 17"**: reproducible sólo con predicado que matchee `Padding` con mayúscula — los 2 extra son `textareaPaddingX/Y` autorados (bithire fieldGeometry 5871/5876; rottay los tiene como placeholders, por eso 15). El predicado citado (`.*padding`, minúscula) da 15. Inofensivo porque §2.9 prohíbe escribir conteos — pero si se cita el 17, el predicado real va al lado (la propia regla de §2.9). Verifiqué independientemente: rottay 15 / bithire 17 (con textareaPadding) / evnto 0; gap 7/7/0 exactos.
3. **Prosa del catálogo que queda stale**: `method.assignments` clava totales globales (263; rottay 99, bithire 95, evnto 69) que las reparaciones invalidan; ningún gate lo cuenta, pero el catálogo tiene campo `corrections` con la ley "un dato que no se sostiene se corrige y se dice" — domicilio natural para asentar la enmienda K4. (`reconciliation.byExposure` no se ve afectada: los renombres de canal no mueven raíces entre exposures.)
4. **§2.3, destino del segundo canal**: `roots[22].collapses` es resumen numérico (`{total:55,…}`) — incompatible de forma; usar `derivation`/`evidence` (strings, existen). Y los headers del `.md` citan el canal por raíz (p.ej. línea 503 "· --ds-surface-overlay ·", 577 "· --ds-color-text-primary ·") — deben actualizarse con el cambio de canal; la cláusula de consistencia lo cubre pero conviene nombrarlos.
5. **Residuo observado, fuera de scope de K4 (asentar para F4A-close)**: el canal del catálogo para `control.ratio.iconSize` (`--ds-icon-md-size`, piso en `presentation/components/icon.css:21`) NO es lo que los temas mueven — las emisiones corren por `--ds-input-md-icon-size`/`--ds-button-md-icon-size` (rottay `var(--ds-icon-sm-size)`, bithire `15px`). Misma clase de defecto que §2.1, hoy no reparada ni citada. El de lineHeight (`--ds-input-md-line-height`) SÍ es el emitido — ese está bien.

## Cobertura de los desafíos

1. **Write-set de 3 paths** — VERIFICADO: los 3 existen, hashes de pre-estado exactos, naturalezas correctas (catálogo auto-declarado `"MEDIDO -- inventario de lectura, no artefacto generado"` con `producedOn 2026-08-18`; roster `producedBy F4A-1c v3`). La lista de prohibidos tiene referentes reales (styles/, artifacts/, brand-themes, stash).
2. **Productor del roster** — VERIFICADO NEGATIVO: cero generadores y cero consumidores de máquina de `roster-variantes` en packages/core y docs (grep exit 1). La reparación a mano es legítima; stop condition 6 hoy no puede disparar.
3. **Los 8 rootId/canales/status/assignments/postures/governors** — verificados uno a uno contra catálogo y roster: la columna "actual"/"roster ACTUAL" coincide 8/8 (índices 7/15/22/35/47/40/41/63 = rootIds correctos). Las falsedades del roster que §3 denuncia son reales y medidas: governor bithire de overlay.bg en fuente es el texto genérico F4B (~`bithire/index.ts:3993`), no `token-overrides`; bithire lineHeight es literal `20px` (artefacto 589), no derivación de `--ds-line-height-tight`; iconSize rottay `var(--ds-icon-sm-size)` (580)/bithire `15px` (588). Defecto del brief: sólo el P0-1 (asignaciones §2.1/§2.2).
4. **Conteos 64 y 47/10/7** — VERIFICADO: hoy 64 raíces, 48/10/6. La única movida (`tier.overlay.fg` existe→solo-artefacto) es además OBLIGADA por el freshness gate: `--ds-material-overlay-foreground` tiene 0 declaraciones en CSS autorado (default.css y todo src/ excluyendo artifacts) — con "existe" el gate fallaría. 47/10/7 cierra. Los otros dos canales nuevos tienen piso autorado (`default.css:433` raised, `:434` overlay-bg), así que sus "existe" se sostienen.
5. **Invariantes 26/28/10** — VERIFICADO: exposure gate verde con baseline pineado (`root-exposure-gate.baseline.json`), el write-set no toca `exposure`; simulé las leyes contra las reparaciones: ningún control de `manifest/controls/` declara los 3 canales nuevos (LAW 2 verde post-repair), `token-overrides.json` existe (LAW 1 verde para overlay.bg), `reconciliation.byExposure.counts` queda en 26/28/10.
6. **Batería before/after** — VERIFICADA: todos los paths citados existen (gates + test, mirror-parity, variant-parity, glob de brand-themes que correctamente excluye el index.ts agregador, artifacts/, styles/); los hash-proofs de invariantes 1-2 son bien formados; el chequeo de 198 entries es correcto. El diseño "no hace falta build" es sólido: el write-set no entra a fuente compilable.
7. **Stop conditions** — SÓLIDAS: la 2 no puede disparar en falso (el freshness gate valida contra el árbol, sin hash ni productor — inspeccionado completo, 94 líneas); la 5 guarda correctamente la trampa de scope de §2.9; el restore evita `git checkout` (cumple la ley post-incidente 2026-02-05); la 7/8 tienen pruebas por hash bien definidas.
8. **Cero materialización preserva declinaciones y 0.58** — VERIFICADO: bithire `effectIntensity: 0.58` con `@domicile seed` + `@governor dial: surfaces.effect-intensity` (fuente ~4034); rottay y evnto declinan EXPLÍCITAMENTE con el bloque exacto que el brief cita (`@placeholder SURFACES.effectIntensity` + `@domicile unassigned` + governor "gap aceptado…" — rottay 3767-3769, evnto 2076-2078); emisiones 1 / 0.58 / 1 (artefactos 510/458/233). El texto-licencia a reemplazar existe (`roster-variantes.md:185`: "K4: valor = resolucion computada de hoy (base=1)") y la nota obligatoria del brief coincide con la verdad medida. El pin de ausencia del Tour test es verbatim (`Tour.overlay-material.test.ts:55-64`, incluido el comentario del incidente black-on-black). El write-set no toca ninguna fuente de tema.

## Comandos read-only ejecutados

`git rev-parse HEAD`; `git status --porcelain`; `git log/show --stat HEAD`; `git stash list`; `shasum -a 256` (brief + write-set); `node -e` de inspección sobre root-catalog.json (totales, reparto, vocabulary, method, reconciliation, corrections, las 8 raíces, las 5 sin consumidor, búsqueda NOOP) y roster-variantes.json (198, universe, postureMethod, las 24 entries, governors F4B); greps/lecturas: artefactos de los 3 tenants (canales material, effect-intensity, line-height, icon-size, surface-overlay, límites del bloque dark), fuentes de tema (surfaceRoles base/dark bithire, placeholders rottay/evnto, effectIntensity, textareaPadding, bloques geometry con conteo por llaves exactas en node), default.css, icon.css, Tour test, manifest/controls (canales nuevos: 0 hits), búsqueda de generador/consumidor de roster; lectura completa de ambos gates (cero writes) y ejecución de ambos (verdes). NO corrí suites mutantes ni tests; cero escrituras en el repo; write-set exacto: este archivo y su `.ready`.

## Condición exacta de reemisión

1. (P0-1) §2.1 y §2.2: `assignments` → `{total:2, rottay:0, bithire:2, evnto:0, modes:{rottay:[], bithire:["base","dark"], evnto:[]}}` — o adjudicación de vocabulario escrita por el DT que justifique ×1. §2.3 queda como está.
2. (P1-1) §3: "las 58 raíces restantes (174 entries) no se tocan".
3. (P1-2) Invariante 7: corregir el conteo (3 entries bithire en el roster) o citar archivo:línea de dónde salen las 8; declarar explícitamente que la reparación de overlay.bg AGREGA una entry con ese governor y que eso es intencional.

Con esas tres líneas corregidas (y opcionalmente los P2 asentados), el lote es ACCEPTABLE: todo lo demás — pre-estado, gobernanza del write-set, evidencia de las 8 raíces, aritmética de conteos, simulación de gates, batería, fences, stop conditions y la preservación de declinaciones y del 0.58 — está verificado contra el árbol.
