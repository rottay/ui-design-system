# F4A-close — Inventario mecánico READ-ONLY (Sonnet Max)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**HEAD verificado (apertura):** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`
**Worktree:** `git status --porcelain` vacío, staged 0 (verificado a la apertura y re-verificado al cierre — ver §11).
**Rol:** mapper mecánico. Cero writes al repo. Cero tests/build/generadores/browser ejecutados. Toda cifra de censo viene de `python3 -c "json.load(...)"` sobre artefactos ya generados en HEAD, o de lectura directa de fuente (`grep`/`sed`/`Read`) — nunca de correr un script del programa.

---

## 1. Obligaciones explícitas de F4A-close, citadas y clasificadas

### 1.A — MUST_CLOSE (pertenecen al paquete F4A-close mismo)

| # | Obligación | Cita exacta | Autoridad |
|---|---|---|---|
| 1 | **Ratchet a tolerancia cero** sobre `divergentSlots`/`untaggedAuthoredLeaves` (decrease-only, ya en 33/40) | `docs/ROADMAP-EJECUCION-2026-08-19.md:1725-1726` ("F4A-close mío: ratchet a tolerancia cero...") | roadmap §13 (adjudicación del DT) |
| 2 | **Gate `realKeypathParity`**: paridad real sobre keypaths EVALUADOS, separado de la cobertura por `@placeholder` (un placeholder da posición sin materializar keypath) | `docs/ROADMAP-EJECUCION-2026-08-19.md:1726-1728`; también `:931` ("el 0 real lo certifica el gate `realKeypathParity` de F4A-close, adjudicación A4") y `:1324-1329` (brecha de diseño detectada por la auditoría Codex ad-hoc) | roadmap §13, adjudicación A4 = ítem (d) de `docs/f4a/auditoria-codex-2026-08-21.md:111` ("gate de paridad real → F4A-close") |
| 3 | **`gates:ci` final** verde (88 blocking + 2 excluded hoy) | `docs/ROADMAP-EJECUCION-2026-08-19.md:1728` | roadmap §13 |
| 4 | **Auditoría Fable del frente** F4A completo (recibe `docs/f4a/auditoria-codex-2026-08-21.md` como insumo) | `docs/ROADMAP-EJECUCION-2026-08-19.md:1728-1729`; `docs/prompt-codex-continue.md:62-63` | roadmap §13 + prompt-codex-continue §2 |
| 5 | **`checkpoint.intent.json.blockedOn`** repite exactamente los 3 primeros ítems como condición de cierre | `checkpoint.intent.json:4` | checkpoint (autoridad machine-rendered) |
| 6 | **`rottay CHROME.statsGrid`**: `token-overrides` no es dial de rottay en el roster → nota de clase sin tag; adjudicación final pendiente | `docs/ROADMAP-EJECUCION-2026-08-19.md:958-959` ("adjudicación pendiente en F4A-close"); `docs/prompt-codex-continue.md:158-159` | roadmap §13 + prompt-codex-continue §5 |
| 7 | **CHARTS + CHROME.accent (28 hojas)** y el **esqueleto `THEME.*`**: `unassigned` con razón medida en F4A-13, disposición final pendiente | `docs/ROADMAP-EJECUCION-2026-08-19.md:922-924`; `docs/prompt-codex-continue.md:171-173` | F4A-13 (asentado) + prompt-codex-continue §5 |
| 8 | **Las 53 familias "sin control"** del mapa (`mapa-familia-canales.json`, F4A-3a): tagueadas por hoja en sus lotes; la **disposición final de la CLASE** (qué domicilio les corresponde en general) es adjudicación de F4A-close | `docs/ROADMAP-EJECUCION-2026-08-19.md:1621-1623`; `docs/prompt-codex-continue.md:174-175` | F4A-3a (`:1621`) + prompt-codex-continue §5 |
| 9 | **Test-hygiene `cra-12`**: aislar la planta de `__cra12-reanchor-drill.css` (en `src/foundation/tokens/css/`, ver `cra-12-motion-governance.reanchor.test.mjs:50`) del read-set de `deriveHookManifest`, para eliminar la raza export-missing/export-unshipped | `docs/ROADMAP-EJECUCION-2026-08-19.md:1174-1177`; `docs/prompt-codex-continue.md:108-111,164-168` | F4A-7 (`:1162-1177`) + prompt-codex-continue §§3.4, 5 |
| 10 | **Automatización del digest `basedOnReportDigest`** de `customization-reconciliation.json` (huérfano tras cada lote de fuentes — ningún productor lo escribe; contado "9 veces huérfano" al cierre de F4A-13) | `docs/ROADMAP-EJECUCION-2026-08-19.md:1034,1061,1112,1154-1155` (huérfano contado repetidamente); `docs/prompt-codex-continue.md:97-100,169-170` ("deuda escrita de F4A-close") | acumulado F4A-7..13 + prompt-codex-continue §§3.2, 5 |
| 11 | **`control.ratio.iconSize`** (`roots[41]` del root-catalog): K4 v3 lo deja **parcialmente reparado** (postura sí, `channel` NO) — el residuo del canal queda para F4A-close | `/private/tmp/f4a-14a-opus-implementation-brief-v3.md:216-235,400,510-520,529` (§2.8, §5 fila 7, §10, §11) | K4 v3 (Fable ACCEPT) §11 |
| 12 | **Prosa "63 raíces"** en `method.roots` / `reconciliation.statement` de `root-catalog.json` queda registrada como drift (no reescrita) tras K4 — corregirla exige re-medir los 3.275 canales A+B, fuera de alcance de K4; su cierre narrativo (si corresponde) cae en F4A-close/F4B | `/private/tmp/f4a-14a-opus-implementation-brief-v3.md:533-535` (§11) | K4 v3 §11 |
| 13 | **Clase F4B** dentro del roster/fuente (governor `"dial: (raiz autora — dial en F4B)"`, 9 entries en roster + 797/618/95 tags `@governor` en fuente) — K4 explícitamente **no la resuelve**; su disposición formal (si el propio F4A-close debe "cerrar la clase" documentalmente, o si sólo queda como puntero a F4B) no está adjudicada por ningún documento leído | `/private/tmp/f4a-14a-opus-implementation-brief-v3.md:368-381` (invariante 7) | K4 v3 §4.7 — **sin resolución textual explícita de si F4A-close debe tocarla** |

### 1.B — DEFER_F4B / F2-asimétrico (NO son F4A-close, aunque compartan vocabulario)

| # | Ítem | Por qué NO es F4A-close | Cita |
|---|---|---|---|
| 1 | **Calibración causal de los 20 controles** (receipts de 8 puntos: dominio, ingreso estático+DB, normalización, canary, negativos, input inválido, restore) | Es la Salida de F4B, un frente propio posterior | `docs/ROADMAP-EJECUCION-2026-08-19.md:274-295` |
| 2 | **Recableo causal** de cualquier coincidencia de valor detectada en F4A (K-2/K-3/K-4 de K5, H1-H4 de F2) | F4A sólo **documenta** relaciones medidas; F4B/F2-asimétrico **recablea** | roadmap `:297-299`; K5 packet v2 tabla §7 fila "F4B / F2-asimétrico", `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md:411` |
| 3 | **bithire `--ds-button-primary-bg`** congelado (dark `#1a7fe0` ≠ `#1e84e6`) — testigo del "diente (a)" de mirror-parity | Su descongelamiento/unificación es decisión F4B/F2-asimétrico, no F4A | `docs/prompt-codex-continue.md:160-163` |
| 4 | **K-1..K-7 de K5** en cuanto DECISIÓN (no en cuanto medición): todas bloquean tranches de escritura, ninguna es F4A-close per se — pertenecen a K5b/K5c | `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md:220-234` | K5 packet v2 §6 |

### 1.C — DEFER_F4C (craft/premium — expresamente fuera de F4A)

| # | Ítem | Cita |
|---|---|---|
| 1 | **Unificación H4** (`bg`/`rowBg` de `table`; coincide en base, diverge en dark — M-10) | K5 packet v2 §7 fila F4C: "Unificar el par H4 fuera de F4C -> PARAR"; `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md:412` |
| 2 | **Iteración de diseño diferencial** Rottay/BitHire/Evnto sobre el vocabulario ya estabilizado | `docs/ROADMAP-EJECUCION-2026-08-19.md:301-323` |

### 1.D — DEFER_CHECKPOINT (actualizaciones de documento que sólo pueden ocurrir DESPUÉS de K4/K5, no son parte del contenido técnico de F4A-close)

| # | Ítem | Cita |
|---|---|---|
| 1 | Actualizar `docs/f4a/roster-variantes.{json,md}` con el roster post-K4/K5 (ya cubierto como write-set de K4/K5 mismos, no de F4A-close) | K4 v3 §3; K5 packet v2 §7 |
| 2 | Re-render del bloque "Current checkpoint" embebido en `README.md` (`node .../lane-control/public/program-state/index.mjs --write --intent <intent.json>`) | `packages/core/scripts/quality-evidence/programs/modern-rescue/README.md:240-242` (comando de regeneración citado inline) |
| 3 | Actualizar `roadmap/registry.json` → `workOrders[95].progressLog` (WO-CRA-23) con el arco F4A completo | ver §6 abajo |

### 1.E — STALE / DEROGADA (ya resuelto, no reabrir)

| # | Ítem | Estado verificado | Cita |
|---|---|---|---|
| 1 | "registry/checkpoint stale" (`roadmap/registry.json` decía "252 familias" y prosa de sucesión vieja) | **CORREGIDO** en commit `f91df8bc0` (anterior a nuestro HEAD): el campo `notes` de `workOrders[95]` (WO-CRA-23) en `roadmap/registry.json:3491` dice hoy "255 canonical families (the 252 figure predates F4A-0)" y el modelo de sucesión 2026-08-21 correcto | `docs/f4a/auditoria-codex-2026-08-21.md:109` ("corregido en `f91df8bc0`"); verificado por mí contra `roadmap/registry.json:3491` en HEAD actual |
| 2 | "roster stale K3" (doc de plan con nombre de raíz falsado) | **CORREGIDO** en `f91df8bc0` | `docs/f4a/auditoria-codex-2026-08-21.md:110` |
| 3 | La clasificación "33 limpias" (F4A-3a) | **CORREGIDA** por F4A-3c (criterio estricto: 0 limpias, no 33; los 27 tags de familia se estrecharon) | `docs/ROADMAP-EJECUCION-2026-08-19.md:1625-1631` |
| 4 | `NOOP_ALREADY_RESOLVED` como rótulo de 3 raíces intocadas por K4 | **RETIRADO** el rótulo en v3 del brief K4 (no existe en catálogo/roster/docs — sólo vivía en un brief v1 que ya no es autoridad); la instrucción operativa ("no tocar") se conserva | `/private/tmp/f4a-14a-opus-implementation-brief-v3.md:364-367` (invariante 6, nota P2-1) |
| 5 | "K5 tabla bithire = baseline con razón, manta" (premisa original de F4A-1/roadmap `:834`) | **FALSADA por medición** (Fable C-F1, ratificado): las 21/24 hojas "baseline" se parten en 3 (raíz)/~12 (graduadas)/~6 (baseline real) | `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md:159` (M-9), `:465-471` (tabla "errores de v1") |

**Nota de precisión sobre la ruta citada en el prompt de arranque:** el prompt de arranque de esta sesión cita la autoridad de estado como
`packages/core/scripts/quality-evidence/programs/modern-rescue/roadmap/registry.json`. **Esa ruta exacta NO existe en el árbol** (verificado: `packages/core/scripts/quality-evidence/programs/modern-rescue/roadmap/` no existe; `git log --all` no tiene historial de ningún archivo bajo esa ruta). El campo real es `program.json:8` (`"statusAuthority": "roadmap/registry.json"`), una ruta relativa que sólo resuelve de forma coherente contra la raíz del repo: `ui-design-system/roadmap/registry.json` — el registro de 100 work orders del programa DS (WO-CRA-23 es la entrada 95/100), NO un archivo dentro de `modern-rescue/`. Esto no es un hallazgo de drift nuevo (el archivo correcto existe y está razonablemente al día, ver §6), pero la cita literal del handoff/prompt es imprecisa y no debe copiarse tal cual a un futuro prompt.

---

## 2. Grafo de dependencias exacto

```
F4A-13 (CERRADO, HEAD 9d5582dfd)
   │
   ▼
F4A-14 = K4  ["las 16 asimétricas con valor"]
   │  write-set: EXACTAMENTE 3 paths
   │    packages/core/manifest/cascade/root-catalog.json
   │    docs/f4a/roster-variantes.json
   │    docs/f4a/roster-variantes.md
   │  Estado: brief v3 con Fable ACCEPT (`/private/tmp/f4a-14a-v3-fable-reaudit.md`,
   │    verificado). BLOQUEADO: Kimi K3 devolvió 403 (cuota agotada) — sin ACCEPT/REJECT
   │    Kimi. Por orden del owner, NO se implementa sin (a) respuesta Kimi o
   │    (b) excepción explícita del owner para Codex+Fable solos.
   │
   ▼ (K4 debe cerrar PRIMERO — precedencia dura, aunque los write-sets sean disjuntos:
   │  ver `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md:29-63` §0)
   │
F4A-15 = K5  [CHROME.table — 40 hojas]
   │
   ├─ K5a (mínimo mecánico, 6 hojas: 5 ya-derivadas + cellFontSize)
   │    precondición: K4 cerrado + RESPUESTA de Kimi al paquete K5 recibida
   │    (sin excepción, ni siquiera para K5a — C-3 del packet v2)
   │    write-set: bithire/index.ts (1 path)
   │
   ├─ K5a+ (ampliado, +18 hojas rottay) — SÓLO si K-2=(A) y K-4=(A)
   │    write-set: K5a + rottay/index.ts
   │
   ├─ K5b (resto: 3 raíz + ~12 graduadas + ~6 baseline + 10 relación-escrita + 3 seeds evnto)
   │    precondición: K4 cerrado + K-1, K-3, K-6 adjudicadas por escrito (+K-4 si (B))
   │    write-set: bithire/index.ts, evnto/index.ts, variant-parity.baseline.json ("Baja #14")
   │
   ├─ K5c paso 1 (unión semántica) — YA HECHO, MEASURED, ratificado Fable v2 ACCEPT
   │    (37→34 ejes, 46=16/0/30 exacto) — no habilita escritura
   │
   ├─ K5c paso 2 (sentido de los 46 gaps) — precondición: K4 cerrado + K-5 adjudicada
   │    por vertical Y por eje (respuesta "manta" -> PARAR)
   │
   ├─ K5c paso 3 (placeholders) — precondición: K-5 celda por celda + K-7 si toca
   │    plano atributo; cantidad de placeholders es SALIDA de K-5, nunca 46 ni 53
   │
   └─ sidecar/gate semántico opcional — precondición: K-7 adjudicada + brief propio del DT
   │
   ▼ (K5a + K5b + K5c deben estar resueltos — el roadmap no especifica que K5c deba
   │  cerrar del todo antes de F4A-close si su resultado es "no aplica todavía",
   │  pero NINGÚN documento leído autoriza declarar F4A-close con untaggedAuthoredLeaves > 0)
   │
F4A-close (DT, Codex)
   │  1. ratchet a tolerancia cero (divergentSlots, untaggedAuthoredLeaves)
   │  2. gate realKeypathParity (NUEVO — no existe en el árbol hoy, ver §4)
   │  3. gates:ci final verde
   │  4. auditoría Fable del frente completo
   │  + adjudicaciones nombradas en §1.A (statsGrid, CHARTS/accent, THEME.*, 53 sin-control,
   │    test-hygiene cra-12, digest reconciliation, iconSize residual)
   │
   ▼
Auditoría Fable del frente F4A → F4B (20 controles) → F2-asimétrico → F3 → F4C → F5-F8 → F9
```

**Qué puede cerrarse SIN K5 (i.e., independiente de K5a/b/c):**
- El **gate `realKeypathParity`** en sí mismo podría diseñarse/escribirse una vez K4 cierre, PERO no puede *certificar* tolerancia cero mientras `CHROME.table` (las 40 hojas de K5) siga sin tag — el gate mide keypaths evaluados reales, y hoy esos 40 son exactamente las hojas de table. Diseñar el gate no depende de K5; **pasar el gate en verde sí depende de K5**.
- La adjudicación de `rottay CHROME.statsGrid` (ítem 1.A.6) es semánticamente independiente de `CHROME.table` — en principio podría resolverse en paralelo a K5, pero ningún documento leído autoriza explícitamente despachar packets de F4A-close en paralelo con K4/K5 abiertos; el roadmap trata la cola como estrictamente serial ("F4A-14 → F4A-15 → F4A-close", `docs/prompt-codex-continue.md:56-63`).
- **Nada del ratchet-a-cero ni de gates:ci final puede cerrar sin K4+K5**, porque el propio contador `untaggedAuthoredLeaves=40` ES la superficie de K5 y `divergentSlots=33` incluye el residuo `iconSize` de K4 (ítem 1.A.11) más los 33 slots sin autor de ningún tema.

**Qué NO puede cerrarse sin K5 (todo lo demás):** ratchet a cero, `realKeypathParity` en verde, `gates:ci` final, auditoría Fable del frente completo — los cuatro dependen de que `untaggedAuthoredLeaves` llegue a 0, lo cual es exactamente lo que K5b debe producir.

---

## 3. Censo actual (read-only, derivado de artefactos existentes en HEAD — evidencia DIRECTA salvo donde se marca)

Fuente primaria: `packages/core/manifest/generated/variant-parity.json` (generado por `manifest/variant-parity/index.mjs`, última corrida F4A-13 sobre este HEAD — leí el JSON, no corrí el generador). Cruzado contra `packages/core/manifest/variant-parity/variant-parity.baseline.json` y `docs/prompt-codex-continue.md:46-54`.

| Contador | Valor | Fuente directa |
|---|---|---|
| `universe` (union) | **2559** | `variant-parity.json` → `matrix.universe`/`matrix.union` |
| `intersection` (autorada por los 3 temas) | **342** | `matrix.intersection` |
| `positionIntersection` | **2526** | `matrix.positionIntersection` |
| `tagRegistry.count` | **4099** | `tagRegistry.count` |
| `divergentSlots` (ratchet) | **33** | `ratchet.divergentSlots` (baseline coincide) |
| `untaggedAuthoredLeaves` (ratchet) | **40** | `ratchet.untaggedAuthoredLeaves` (baseline coincide) |
| `failures` | **0** | `failures.length` |
| `orphanPlaceholders` | **0** | `matrix.orphanPlaceholders.length` |
| leaves por tema (léxicas) | rottay **1756** · bithire **1504** · evnto **395** | `matrix.leaves.*` |
| exclusive por tema | rottay **1007** · bithire **795** · evnto **3** | `matrix.exclusive.*` |
| paintLeaves por tema | rottay **1744** · bithire **1493** · evnto **384** | `matrix.paintLeaves.*` |
| taggedPaintLeaves por tema | rottay **1744** · bithire **1457** · evnto **380** | `matrix.taggedPaintLeaves.*` |
| → untagged por tema (derivado: paintLeaves−taggedPaintLeaves) | rottay **0** · bithire **36** · evnto **4** = **40** | aritmética mía sobre las dos filas de arriba; coincide EXACTO con `docs/prompt-codex-continue.md:51` y con M-1 del K5 packet |
| `metadataExclusion.count` | **36** | `variant-parity.json` → `metadataExclusion.count` |
| `metadataExclusion.paintDenominator.value` | **3690** | `metadataExclusion.paintDenominator.value` |

**Family/manifest denominators** (`packages/core/manifest/index.json`, leído directo):

| Contador | Valor | Fuente |
|---|---|---|
| `canonicalFamilies` | **255** (105 primitive + 57 pattern + 18 chart + 39 structure + 36 surface) | `denominators` + `family-inventory.json.counts` (cruzado, coincide) |
| `activeStandardControls` | **13** | `denominators.activeStandardControls` |
| `activeProCapabilities` | **7** | `denominators.activeProCapabilities` |
| `activePublicControls` | **20** | `denominators.activePublicControls` |
| `controlFamilyCells` | **5100** | `denominators.controlFamilyCells` |
| `familyReviews.unreviewed` | **255** | `rollups.familyReviews.unreviewed` |
| `familyReviews.accepted` / `assessedNotElevated` | **0 / 0** | `rollups.familyReviews.*` |

**Root-catalog (K4's target — `packages/core/manifest/cascade/root-catalog.json`, PRE-K4 state, leído directo):**

| Contador | Valor | Verificación |
|---|---|---|
| raíces (`roots.length`) | **64** | conteo directo del array |
| suma de `assignments.total` por tema | rottay **101** + bithire **97** + evnto **70** = **268** | sumado por mí desde el JSON crudo (no copiado de prosa) — coincide con `/private/tmp/f4a-14a-v3-fable-reaudit.md:15` |
| `tier.page.ink.assignments` | `{total:5, rottay:2, bithire:2, evnto:1}` | leído directo — explica el drift 263→268 |
| `channelStatus` (pre-K4) | existe **48** · por-crear **10** · solo-artefacto **6** | conteo directo (`Counter` sobre `roots[].channelStatus`) — coincide con "64 roots, 48/10/6" de Fable |
| `reconciliation.byExposure.counts` | internal-head **28** · tenant-dial **26** · gap **10** | leído directo — coincide con "26/28/10" citado en README/roadmap como `root-exposure-gate` |
| `ratchet.baselineToday.value` (residuo irreducible C+D) | **418** (seeds 262 + perFamily 156) | leído directo |

**Post-K4 (proyectado, NO implementado — cifras del brief v3, no verificadas por mí contra un árbol post-cambio porque el cambio no existe):** 261 = 95+96+70; `channelStatus` 47/10/7; `root-exposure-gate` sin cambio 26/28/10.

**K5 census (tabla `chrome.table`) — derivado de `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md` tabla MEASURED, con una verificación independiente propia:**

| Hecho | Valor | Verificación |
|---|---|---|
| `BrandTableChrome` campos declarados | **38** (incluye `anatomy`) | **VERIFICADO POR MÍ**: leí `packages/core/src/foundation/contracts/composition/tenants/themes/index.ts:2060-2103` y conté 38 propiedades de la interfaz — coincide exacto |
| campos emisibles de canal (excluyendo `anatomy`) | **37** | 38 − 1 (`anatomy` es plano atributo, no canal) |
| ejes semánticos (37 léxicos → colapso de padding) | **34** | Sonnet K5c v2, ratificado Fable — no re-verificado por mí a nivel de archivo, ver nota de procedencia abajo |
| canales muertos (autorados, 0 consumo modern) | **3** (`filterRowBg`, `filterFocusShadow`, `loadingOverlayBg`) | ídem — los 3 nombres SÍ están confirmados como campos reales de la interfaz (verificado por mí en la lectura de arriba, líneas 2092-2093 y 2102) |
| silencios semánticos (46 = 16 rottay + 0 bithire + 30 evnto) | **46** | Sonnet K5c v2, ratificado Fable dos veces (v1 y v2) |
| canales consumidos en modern (`table.css`+`data-table.css`) | **132** consumidos · **34** emitidos∩consumidos · **98** consumer-only | Sonnet+Fable, método independiente cruzado (grep+comm vs parser propio) |
| `untaggedAuthoredLeaves` de table | **40** = bithire 36 + evnto 4 + rottay 0 | coincide EXACTO con mi derivación independiente arriba (paintLeaves−taggedPaintLeaves) |

Nota de procedencia: los valores 34/46/132/98 los tomo de Opus v2 + dos rondas de re-verificación independiente de Fable (métodos distintos: grep+comm vs. parser propio en Node), ambas contra el HEAD que pineamos (`9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, confirmado en la apertura y cierre de cada memo). No repetí esas 3726 compilaciones/parses yo mismo en esta sesión — sería ejecutar instrumentación, prohibido por mi mandato. Los marco como evidencia indirecta pero doblemente cruzada por método distinto, sobre el mismo HEAD exacto que este inventario.

---

## 4. Inventario de gates/tests requeridos por F4A-close

Ninguno de estos fue ejecutado por mí. Clasificación por lectura de fuente.

| Gate/test | Path | Clasificación | Evidencia |
|---|---|---|---|
| `root-catalog-freshness-gate` | `packages/core/scripts/tokens/root-catalog-freshness-gate/index.mjs` | **pure read-only** | 0 `writeFileSync` en el archivo (grep) |
| `root-exposure-gate` (+ su test) | `packages/core/scripts/tokens/root-exposure-gate/{index.mjs,index.test.mjs}` | **pure read-only** | 0 `writeFileSync` |
| `mirror-parity` test | `packages/core/manifest/mirror-parity/index.test.mjs` (1197 líneas) | **pure read-only** | 0 `writeFileSync` |
| `variant-parity` test | `packages/core/manifest/variant-parity/index.test.mjs` (607 líneas) | **pure read-only** | 0 `writeFileSync` |
| `program-check.mjs` (el gate, no el test) | `packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs` (1972 líneas) | **pure read-only** | 0 `writeFileSync` |
| **`program-check.test.mjs`** | `packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs` (1169 líneas) | **⚠ MUTANTE sobre archivos vivos** | 30+ `writeFileSync(target, ...)` donde `target = join(manifestRoot, ...)` y `manifestRoot = join(repoRoot, 'packages/core/manifest')` (línea 17) — escribe contenido mutado a `controls/*.json`, `cascade/roots/*.json`, `families/**/*.json`, `index.json` REALES del árbol, y restaura el original al final del mismo `test()`. Patrón: mutate→assert→restore, NUNCA persiste, pero abre una ventana real de inconsistencia en disco. |
| **`manifest/generator/index.test.mjs`** | `packages/core/manifest/generator/index.test.mjs` (1178 líneas) | **mixto: mayormente pure read-only, con UNA llamada que SPAWNEA el generador real contra el árbol vivo** | Línea 45: `const INDEX = JSON.parse(readFileSync(join(MANIFEST_ROOT, 'index.json'), 'utf8'))` — lectura del árbol vivo a nivel de módulo (una vez, al cargar el archivo). Líneas 162-170: `spawnSync(process.execPath, ['packages/core/manifest/generator/index.mjs', '--bootstrap'], {cwd: REPOSITORY_ROOT, ...})` — corre el generador real como subproceso contra el repo real; el generador se auto-protege (`bootstrapCustomizationManifest()` en `generator/index.mjs:552-556` lanza ANTES de escribir si el manifest ya existe) por lo que HOY no escribe, pero es una invocación real del binario de escritura contra el árbol vivo, no un fixture. El resto de los tests usa `mkdtempSync(tmpdir(), ...)` (líneas 219, 267) — fixtures aislados. |
| `cascade-wiring-ratchet` (+ su drill) | `packages/core/scripts/engine/cascade-wiring-ratchet/{index.mjs,index.test.mjs}` | **pure read-only** (el `.mjs` no escribe; el drill de test usa corpus en memoria) | ver §5 |
| `cra-12-motion-governance.reanchor.test.mjs` | `packages/core/scripts/engine/cra-12-motion-governance/reanchor.test.mjs` (o ruta equivalente citada en roadmap `:1164-1165`) | **⚠ MUTANTE sobre árbol real**: planta `src/foundation/tokens/css/__cra12-reanchor-drill.css` durante la suite | `docs/ROADMAP-EJECUCION-2026-08-19.md:1164-1168`; comentario propio del archivo lo justifica ("el digest auditado puede depender del árbol completo") — deuda de test-hygiene nombrada para F4A-close, NO resuelta a este HEAD |
| **`realKeypathParity`** | **NO EXISTE** en el árbol | **generador de F4A-close pendiente** | `grep -rl "realKeypathParity"` sólo encuentra la MENCIÓN en prosa dentro de `variant-parity.baseline.json` (`reading.divergentSlots`); no hay script, ni test, ni entrada en `gates-manifest/index.mjs`. Escribirlo (script + test + wiring en `scripts/ci/gates-manifest/index.mjs`) es trabajo de implementación de F4A-close, no algo que exista para correr. |
| `gates:ci` (runner completo) | `packages/core/scripts/ci/runner/index.mjs` invocado vía `pnpm --filter @rottay/design-system gates:ci` | **build pesado + suite mixta** (~10-18 min, `docs/prompt-codex-continue.md:101-104`) — orquesta 88 blocking + 2 excluded, incluyendo los mutantes de arriba | `scripts/ci/gates-manifest/index.mjs` (537 líneas, enumera cada gate con su comando) |
| `test:scripts` (suite completa, "pierna 1") | `node --test "scripts/**/*.test.mjs" "manifest/**/*.test.mjs" && ... && vitest run ...` (`package.json:664`) | **suite mixta, incluye los dos mutantes de arriba + browser NO** (no hay browser en esta pierna) | `package.json:664`; baseline conocida 1717/13 por nombre |
| `gat-07-exact-proof` | `packages/core/scripts/evidence/gat-07-exact-proof/index.mjs --write` / `--check-artifact` | **generador (`--write`) / read-only (`--check-artifact`)** | citado en `docs/prompt-codex-continue.md:92-94`; el `--write` sella un digest, el `--check-artifact` sólo verifica |
| build completo (`pnpm build` / cadena de regeneración) | cadena: censo → reconciliation → kimi → controls → catalog → fanout-facts → mirror-parity → variant-parity → reads-ledger → gat-07 | **generador + build pesado** | `docs/prompt-codex-continue.md:90-100` |
| Auditoría Fable del frente | no es un script — es un agente independiente | **no ejecutable por mí; agente externo** | roles per `README.md:372-385` |
| browser/sighted evidence | no citado como requisito de F4A-close mismo (F4A no incluye craft visual; eso es F4C) | **N/A para F4A-close** | `docs/ROADMAP-EJECUCION-2026-08-19.md:270-272` ("El valor visual puede seguir siendo el baseline previo; la forma ya no") |

**Señalado explícitamente por el prompt de arranque — `program-check.test.mjs` y su vecino `manifest/generator/index.test.mjs`:** ambos corren HOY bajo una **única invocación `node --test`** con dos paths de archivo (ver §5). El primero muta archivos reales del árbol; el segundo lee el árbol real (a nivel de módulo y en un spawn). Ninguno de los dos debe correrse en paralelo con otra suite que lea `packages/core/manifest/**` concurrentemente — incluyéndose potencialmente el uno al otro.

---

## 5. Verificación en fuente: race conocido y cascade-wiring-ratchet

### 5.1 — Race `program-check.test.mjs` × `manifest/generator/index.test.mjs`

**Confirmado vigente en HEAD, por fuente, no por reporte viejo:**

1. `program-check.test.mjs:17`: `const manifestRoot = join(repoRoot, 'packages/core/manifest')` — la raíz de escritura es el árbol REAL, no un tmpdir.
2. `program-check.test.mjs` tiene ≥15 sitios (`:436,447,472,494,508,781,799,818,843,866,887,905,934,1066,1102,1136,1154`) con el patrón `const target = join(manifestRoot, "<archivo real>.json"); writeFileSync(target, mutado); ...assert...; writeFileSync(target, original)` — mutación real, restaurada dentro del mismo `test()`, nunca dejada sucia si el test pasa.
3. `manifest/generator/index.test.mjs:45`: `const INDEX = JSON.parse(readFileSync(join(MANIFEST_ROOT, 'index.json'), 'utf8'))` — lectura del árbol real, a nivel de módulo (ocurre una vez, al importar el archivo de test, ANTES de que corra ningún `test()`).
4. `manifest/generator/index.test.mjs:162-170` (`test('bootstrap refuses to overwrite the existing manifest', ...)`) spawnea `node packages/core/manifest/generator/index.mjs --bootstrap` con `cwd: REPOSITORY_ROOT` — proceso hijo real contra el repo real, que internamente llama `expectedGeneratedFilesExist()` (`generator/index.mjs:548-550`, hace `existsSync(INDEX_PATH)` sobre el `index.json` real) antes de decidir si escribe.
5. `packages/core/scripts/ci/gates-manifest/index.mjs:95-104` define **UNA sola entrada** `modern-rescue-tooling-drills` que corre `node --test scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs manifest/generator/index.test.mjs` — **los dos archivos en la MISMA invocación de `node --test`**, con el comentario propio del archivo confirmando la intención: "One entry, both files: they are a single drill cohort for a single pair of gates, and `node --test` takes multiple paths" (`:93-94`).
6. **No hay ningún flag `--test-concurrency=1` ni mecanismo de exclusión mutua** en `gates-manifest/index.mjs` ni en `scripts/ci/runner/index.mjs` (88 líneas, revisado) para esta entrada. `node --test` con múltiples paths de archivo, por defecto, ejecuta los archivos de forma concurrente.

**Conclusión (mecánica, no empírica — no corrí la suite):** el hazard estructural sigue vigente. Si el import de `manifest/generator/index.test.mjs` (línea 45, lectura de `index.json`) o su test de `--bootstrap` (spawn) caen dentro de la ventana en que `program-check.test.mjs` tiene un `writeFileSync(target=index.json_u_otro, mutado)` sin restaurar todavía, el resultado depende del timing — la misma clase de raza que ya está nombrada y documentada para `cra-12` × `deriveHookManifest` (`docs/ROADMAP-EJECUCION-2026-08-19.md:1164-1177`), pero **NO es la misma raza**: son dos pares de archivos distintos, ambos con la misma forma (mutación real vs. lectura real concurrente), y NINGUNO de los dos está resuelto en el árbol a este HEAD. Sólo la de `cra-12` está nombrada como deuda explícita en el roadmap; **la de `program-check.test.mjs` × `manifest/generator/index.test.mjs` no tiene una entrada de deuda propia en ningún documento que haya leído** — es un hallazgo de esta sesión, no una deuda ya escrita en otro lado. Lo dejo señalado para adjudicación del DT, no lo adjudico yo.

### 5.2 — `cascade-wiring-ratchet`: ¿confunde cualquier fallback con raíz canónica?

Leí `packages/core/scripts/engine/cascade-wiring-ratchet/index.mjs` completo (210 líneas). Hallazgo verificado:

- El clasificador (`classifyCascadeWiring`, líneas 90-125) construye `fallbackTargets` (línea 92-103) agregando **CUALQUIER** nombre `--ds-*` que aparezca en la posición de fallback de una llamada `var(...)` (regex `DS_IN_FALLBACK = /var\(\s*(--ds-[a-zA-Z0-9_-]+)/g` sobre el texto crudo del fallback, línea 87, 102).
- Un canal se marca `reachesRoot` (línea 106) si **CUALQUIER** referencia `--ds-*` aparece dentro de su fallback — sin verificar que ese nombre sea efectivamente uno de los identificadores canónicos de raíz (no cruza contra `root-catalog.json`, ni contra `manifest/cascade/roots/*.json`, ni contra ninguna lista cerrada de raíces).
- El propio docstring (líneas 22-34) declara esto como **diseño intencional**: regla (a) "las raíces y rampas quedan fuera del denominador" y regla (b) "un fallback funcional que alcanza raíz — incluso envuelto en `color-mix()` — cuenta como cableado". El concepto operacional de "raíz" en este gate es **puramente posicional** (cualquier nombre que alguna vez aparezca como destino de fallback de OTRO canal), no una raíz validada contra el catálogo canónico de 64 (`root-catalog.json`) ni contra los 20 controles gobernados.
- Consecuencia verificada por lectura: una cadena `--ds-componente-a` → fallback → `--ds-componente-b` (canal de OTRO componente, no una raíz de fundación) → fallback → (nada) contaría a `--ds-componente-a` como `reachesRoot=true` en cuanto `--ds-componente-b` aparece en su fallback, SIN que `--ds-componente-b` sea nunca validado como raíz real. `--ds-componente-b` entraría a `fallbackTargets` (por ser destino de fallback de `a`) y por lo tanto quedaría EXCLUIDO del denominador (regla a) aun si `--ds-componente-b` mismo no tiene ningún camino a una raíz de fundación.
- **Esto NO está resuelto en el árbol a este HEAD** — es una característica estructural del gate, no un bug corregido o pendiente en ningún documento F4A que haya leído. No hay mención de esto en `docs/ROADMAP-EJECUCION-2026-08-19.md`, `docs/prompt-codex-continue.md`, ni en los briefs K4/K5. **Dejo esto señalado como hallazgo de esta sesión** para adjudicación del DT — no es parte nombrada de las obligaciones de F4A-close (no cambia el veredicto de §1), pero responde exactamente a la pregunta formulada.

**No corrí `cascade-wiring-ratchet/index.mjs` ni su test** — todo lo anterior es lectura de fuente pura.

---

## 6. Drift de autoridad/status — comparación exacta

| Autoridad | Afirma | Estado real (HEAD `9d5582dfd`) | Drift |
|---|---|---|---|
| `program.json:8` `statusAuthority` | `"roadmap/registry.json"` (ruta relativa, ambigua) | Resuelve correctamente contra la raíz del repo: `ui-design-system/roadmap/registry.json`, `workOrders[95]` (`id: "WO-CRA-23"`). **Ese archivo existe y su campo `notes` (línea 3491) está al día** (255 familias, sucesión 2026-08-21 correcta) | **Ninguno en el campo `notes`.** Ver fila siguiente para el resto del registro |
| `roadmap/registry.json:3` (top-level) | `"updated": "2026-08-05"` | El campo `notes` del mismo WO (línea 3491) fue editado con contenido de eventos del 2026-08-21 | **DRIFT confirmado**: el timestamp global del registro (16 días de antigüedad respecto al HEAD pineado) no refleja la edición real más reciente conocida dentro del mismo archivo |
| `roadmap/registry.json:3579` (`workOrders[95].progressLog`, última entrada) | `"at": "2026-08-11 10:45"`, describe el estado de "252 canonical families... calibrates spacing.rhythm before any broad family propagation" | El programa avanzó F4A-0 → F4A-13, K1-K3, T-1, la sucesión DT completa, y llegó a F4A-14=K4 bloqueado en Kimi — 10+ días y ~14 lotes de trabajo committeados no están reflejados en `progressLog` | **DRIFT confirmado, el más severo de los encontrados**: un lector que confíe en `progressLog` (el campo diseñado para ser el registro cronológico) vería únicamente la ola de spacing.rhythm/252-familias y NO se enteraría de que F4A existe, que K1-K3/T-1 cerraron, ni de que hay un bloqueo activo con Kimi. El campo `notes` (línea 3491, sí actualizado) es la única fuente de verdad reciente dentro de este archivo — y `notes` no es el campo que un lector esperaría consultar para "qué pasó últimamente" |
| `checkpoint.intent.json` (todo el archivo, 54 líneas) | `currentWave`: F4A-14=K4 → F4A-15=K5 → F4A-close; `blockedOn`: ratchet+gate+auditoría Fable | Coincide exactamente con `docs/ROADMAP-EJECUCION-2026-08-19.md:1725-1729` y con el estado real verificado en §3 | **Ninguno** — este archivo está al día |
| `README.md:238-283` (bloque embebido "Current checkpoint", generado por `lane-control/public/program-state/index.mjs`) | Comentario de cabecera: `head=68f258690 written=2026-08-13T16:16:13.760Z` (línea 242). "**Current wave:** Roadmap reconciliation and first control calibration" (línea 246). "Active packet: `spacing.rhythm`" (línea 285 en adelante) | El HEAD real es `9d5582dfd` (8 días y ~20 commits después de `68f258690`). El wave actual es F4A-14=K4, no "roadmap reconciliation / spacing.rhythm calibration" | **DRIFT confirmado y severo**: este bloque es un artefacto machine-rendered con su propio hash de verificación (`intent=aa3a79f7f00ac414 render=adcfc6b9becc8a94`, línea 242) que **nadie volvió a regenerar** desde el 2026-08-13, pese a que `checkpoint.intent.json` (su fuente declarada) sí se mantuvo al día. El comando de regeneración está documentado inline (línea 241) pero no se corrió. La tabla "Derived at write time" (líneas 276-282) SÍ sigue siendo numéricamente correcta hoy (255 familias, 5100 celdas, 0/0/255 accepted/assessedNotElevated/unreviewed — verificado por mí contra `manifest/index.json` en §3) por coincidencia (esos números no se movieron desde F0/F1), pero la prosa de "wave" y "active packet" que la acompaña es categóricamente obsoleta |
| `docs/f4a/auditoria-codex-2026-08-21.md:109-110` | "registry/checkpoint stale — CONFIRMADO — corregido en `f91df8bc0`" | Verificado: el `notes` de `roadmap/registry.json` SÍ está corregido. Pero esa corrección **no alcanzó** ni el `progressLog` del mismo archivo, ni el bloque embebido de `README.md` | La declaración de "corregido" es válida para el campo que efectivamente tocó (`notes` + la clasificación 33→0 de F4A-3c), pero no cubre `progressLog` ni el bloque `README.md` — **ninguno de los dos documentos leídos afirma haber corregido esos dos campos**, así que no hay contradicción de autoría, sólo alcance parcial no declarado como tal |

**Ningún drift encontrado aquí bloquea K4/K5 ni contradice las cifras de censo del §3.** Son inconsistencias de metadatos/narrativa entre documentos-autoridad, no entre documento-autoridad y árbol real. Su corrección (regenerar el bloque README, escribir el `progressLog` que falta) es exactamente el tipo de update que **sólo puede ocurrir después de K4/K5** per el mandato de esta sesión — quedan listados en §1.D, no ejecutados.

---

## 7. Read-set / write-set candidato por tranche de F4A-close

Ningún write-set de abajo toca valores de theme, responsive, premium, el manifest 5100 final, salidas generated/build, ni implica commit — verificado contra cada autoridad citada; no encontré ninguna contradicción que obligara señalar un STOP en este eje.

| Tranche | Read-set | Write-set candidato | Autoridad que lo fija |
|---|---|---|---|
| **Ratchet a cero** | `variant-parity.json` (generado), `variant-parity.baseline.json` | `packages/core/manifest/variant-parity/variant-parity.baseline.json` (edición a mano, "Baja #N", ley decrease-only ya establecida — mismo patrón que las 13 bajas anteriores) | patrón F4A-2..13, ley en `variant-parity.baseline.json:3` |
| **Gate `realKeypathParity`** | `root-catalog.json`, `variant-parity.json`, fuente de los 3 `brand-themes/*/index.ts` (sólo lectura, para evaluar keypaths reales) | **NUEVO archivo** de gate bajo `packages/core/manifest/variant-parity/` o `packages/core/scripts/tokens/` (ubicación exacta NO adjudicada por ningún documento leído) + su test + **una nueva entrada en `scripts/ci/gates-manifest/index.mjs`** (edición del array de gates, no de un artefacto generado) | roadmap `:1726-1728`; adjudicación A4 (`docs/f4a/auditoria-codex-2026-08-21.md:111`) — **la ubicación exacta del archivo nuevo es una decisión de diseño abierta, no una obligación textual de ningún documento** |
| **`gates:ci` final** | ninguno adicional — es el runner corriendo todo lo demás | ninguno directo (el runner no escribe; sus gates individuales sí, cada uno declarado por separado) | `scripts/ci/gates-manifest/index.mjs` |
| **Auditoría Fable** | todo el árbol relevante a F4A (read-only por definición de rol) | Un memo en `/private/tmp/` + su `.ready` (mismo patrón que todos los memos Fable de esta sesión) — **fuera del repo**, no cuenta como write-set del repo | `README.md:372-385` (rol Fable) |
| **`rottay CHROME.statsGrid`** | `docs/f4a/roster-variantes.{json,md}`, `mapa-familia-canales.json`, fuente `rottay/index.ts` (el `@governor` existente, nota de clase) | **NO ADJUDICADO**: ningún documento dice si la "adjudicación final" implica (a) escribir un `@domicile`/tag real en `rottay/index.ts` (tocaría fuente de tema — permitido si es sólo comentario/docblock, prohibido si cambia CSS/valor), o (b) sólo una nota de prosa en `docs/f4a/`. Dado que el propio invariante 1 de K4 ("cero fuente de tema... byte-idéntico") y el patrón general de F4A-3b..13 (docblocks son comentarios, byte-idéntico probado) sugieren que SÍ se puede tocar `rottay/index.ts` con un docblock nuevo sin violar "cero pintura" — pero esto es una inferencia mía, no una instrucción escrita | `docs/ROADMAP-EJECUCION-2026-08-19.md:958-959` no especifica mecanismo de escritura |
| **CHARTS/accent (28) + THEME.\* (26)** | mismos 3 `brand-themes/*/index.ts`, ya tienen `@governor unassigned` con razón (F4A-13) | **Posiblemente NINGUNO** — si la "disposición final" es sólo confirmar que `unassigned` es terminal (no requiere más tags), no hay write-set. Si requiere promoción a otra clase, sí tocaría fuente. **NO ADJUDICADO por ningún documento leído** | `docs/ROADMAP-EJECUCION-2026-08-19.md:922-924` |
| **53 sin-control (clase)** | `mapa-familia-canales.json` (F4A-3a), tags de hoja ya aplicados en lotes F4A-5..13 | **NO ADJUDICADO** — misma ambigüedad que la fila anterior: "disposición final de la CLASE" podría ser puramente documental (`docs/f4a/`) o requerir un campo nuevo en el `@governor` de cada hoja | `docs/ROADMAP-EJECUCION-2026-08-19.md:1621-1623` |
| **Test-hygiene `cra-12`** | `cra-12-motion-governance.reanchor.test.mjs`, `lib/engine/skin-files/index.mjs`, `deriveHookManifest` (su consumidor) | Edición de la suite (excluir `__cra12-*` del read-set del manifest, o mover el scope fuera de `styleRoots` — dos opciones nombradas, sin decidir) — **archivo(s) exacto(s) no nombrados aún**, la decisión de implementación queda "de ese momento" (roadmap `:1176`) | `docs/ROADMAP-EJECUCION-2026-08-19.md:1174-1177` |
| **Digest reconciliation** | `customization-reconciliation.json` (`basedOnReportDigest`), el script censo que lo produce | Automatizar el re-anclaje (probablemente una línea de la cadena de regeneración, `docs/prompt-codex-continue.md:90-100`) — **el productor exacto a modificar no está nombrado** | roadmap múltiples citas (§1.A.10) |
| **`control.ratio.iconSize` residual** | `root-catalog.json` (`roots[41]`), emisión real vía `--ds-input-md-icon-size` | `packages/core/manifest/cascade/root-catalog.json` (completar `channel` del root — el campo que K4 dejó sin tocar "semántica no aprobada") | K4 v3 §2.8, §7 fence ("No cambiar `roots[41].channel` — semántica no aprobada" — la aprobación es justamente lo que falta) |

**Contradicción buscada explícitamente (per instrucción 7 del prompt) — NO ENCONTRADA:** ningún documento vigente exige que el write-set de F4A-close toque theme values (valores de color/medida en `brand-themes/*.ts`), responsive, premium/craft, el manifest 5100 final (celdas `APPLICABLE`/`SIGHTED_ACCEPTED`), salidas `generated/`/`facade/artifacts/`/`dist/`, ni un commit. Todo lo que roza fuente de tema (statsGrid, CHARTS/accent) lo hace en la forma ya establecida por F4A-3b..13: docblocks/comentarios, nunca valores — consistente con el invariante "cero fuente de tema" que K4 mismo declara.

---

## 8. Plan serial de validación posterior (para cuando K4/K5/F4A-close tengan luz verde de implementación)

**No ejecuté nada de esto.** Derivado del protocolo ya escrito y Fable-aceptado en K4 v3 §§1,6,8,9 y K5 packet v2 §7 (ambos across-referenced, mismo protocolo).

1. **Pre-estado (antes de cualquier escritura):**
   - `git rev-parse HEAD` + `git status --porcelain` (debe ser vacío salvo trabajo conocido en vuelo).
   - `shasum -a 256` del write-set exacto de la tranche → `/tmp/<lote>-pre.sha`.
   - `shasum -a 256` de los 3 `brand-themes/*/index.ts` → `/tmp/<lote>-themes-pre.sha` (invariante "cero fuente de tema" salvo tranches que sí tocan fuente con docblocks).
   - `find facade/artifacts styles -type f | sort | xargs shasum -a 256 | shasum -a 256` → `/tmp/<lote>-art-pre.sha` (invariante "cero pintura").
   - Si el write-set ya viene sucio → **PARAR**, no escribir (protocolo K4 v3 §9 punto 2).
2. **Backup:** copiar el write-set exacto a `/tmp/<lote>-backup/`, verificado por hash contra el pre-estado.
3. **Un test/build pesado A LA VEZ, nunca dos en paralelo:**
   - Primero los read-only baratos (freshness/exposure gates, mirror-parity, variant-parity — todos confirmados pure read-only en §4).
   - Luego, SI la tranche tocó fuente: 3 builds reales ida y vuelta con verificación de que los pasos realmente corrieron (lección F4A-7, no confiar en "salió igual" sin confirmar que `tsc`/prebuild efectivamente ejecutaron).
   - `program-check.test.mjs` y `manifest/generator/index.test.mjs` **NUNCA en paralelo entre sí ni con otra suite que lea/escriba `packages/core/manifest/**`** (ver §5.1) — correrlos secuencialmente o aislados, no como parte de una corrida `test:scripts` concurrente sin control.
   - `cra-12-motion-governance.reanchor.test.mjs` tampoco en paralelo con nada que dependa de `deriveHookManifest` (deuda conocida, §1.A.9).
   - Suite completa (`test:scripts`, "pierna 1") sólo al final, comparada POR NOMBRE contra la baseline conocida (1717/13).
   - `gates:ci` completo (~10-18 min) en background, una sola corrida por lote.
4. **Post-escritura, verificación de invariantes:**
   - Hash del write-set vs. lo esperado (cambió lo que debía).
   - Hash de fuente de tema y de `facade/artifacts/`+`styles/` vs. pre-estado (deben ser IDÉNTICOS salvo que la tranche esté explícitamente autorizada a tocarlos).
   - `git diff --name-only` == exactamente el write-set declarado, ni un path más.
5. **Restore (si hace falta abortar):** `git show HEAD:<path> > <path>` **sólo bajo el protocolo completo** (prehash → backup verificado → restore → diff/hash post-restore contra pre-estado → `git status --porcelain` vacío) — nunca como receta suelta, nunca `git checkout`/`reset`/`stash` (ley post-incidente 2026-02-05, repetida en K4 v3 §9 y K5 packet v2 §7).
6. **Pruebas que sólo pueden correr DESPUÉS de escrituras** (no antes): los 3 builds reales de byte-identidad (necesitan contenido nuevo para comparar contra el pre-estado), el negativo obligatorio (mutar una hoja etiquetada y comprobar que el contador se mueve — necesita el tag ya escrito), y el propio gate `realKeypathParity` en su modo de verificación final (necesita que K5b haya llevado `untaggedAuthoredLeaves` a 0 para poder certificar tolerancia cero).
7. **Cadena de regeneración completa** (si la tranche tocó fuente): censo → reconciliation → kimi → controls → catalog → fanout-facts → mirror-parity → variant-parity → reads-ledger → **gat-07 siempre último**, sellado sólo por el DT.
8. **Ley de rosters firmados:** si se tocó fuente de tema, T1/T2/T3 se corren ENTEROS (vitest de los 3 archivos), nunca por nombre ni sólo por hash.

---

## 9. Matriz de bloqueo — quién exige qué

| Decisión/gate | Exige Kimi | Exige Fable | Mecánico Sonnet | Integra Opus |
|---|---|---|---|---|
| K4 (root-catalog + roster, 3 paths) | **SÍ** — respuesta pendiente (403 cuota), brief v3 ya tiene ACCEPT Fable pero espera Kimi o excepción explícita del owner | ACCEPT ya emitido (`/private/tmp/f4a-14a-v3-fable-reaudit.md`) | Podría ejecutar la escritura mecánica una vez autorizada (edición de 3 JSON/MD siguiendo la matriz §5 del brief) | Autor del brief v3; ejecutaría bajo brief pre-auditado |
| K5a (6 hojas, mecánico) | **SÍ** — "sin excepción, tampoco para K5a" (packet v2 §0.3, C-3) | ACCEPT ya emitido sobre el paquete | Ejecutable mecánicamente una vez K4 cierre + Kimi responda | — |
| K5a+ (18 rottay) | **SÍ** — K-2=(A) y K-4=(A) deben adjudicarse primero | pendiente de re-auditar la escritura cuando exista | no aplica hasta adjudicación | — |
| K5b (resto: ~21 hojas + baseline) | **SÍ** — K-1, K-3, K-6 (y K-4 si (B)) | pendiente | no aplica hasta adjudicación | Adjudicador candidato tras Kimi |
| K5c paso 2 (sentido de los 46) | **SÍ** — K-5 por vertical y por eje | ratificado el paso 1 (medición); paso 2 es adjudicación pura, no medición | — | — |
| K5c paso 3 (placeholders) | **SÍ** — K-5 celda por celda + K-7 si toca atributo | pendiente de auditar la escritura | podría sembrar mecánicamente una vez la adjudicación esté escrita | — |
| Sidecar/gate semántico `chrome.table` | **SÍ** — K-7 | forma ya ratificada, condicionada | — | Brief propio del DT requerido antes de cualquier escritura |
| Ratchet a cero (F4A-close) | indirecto (depende de que K5 cierre, que depende de Kimi) | auditoría de frente al final | mecánico (edición de baseline, patrón ya establecido) | — |
| Gate `realKeypathParity` (diseño + escritura) | no nombrado explícitamente como requiriendo Kimi | auditoría de frente lo revisará al final | podría implementarlo mecánicamente UNA VEZ el DT (Codex) escriba el spec — hoy no existe spec de implementación, sólo la obligación en prosa | **DT (Codex) es quien debe diseñar el gate** — "F4A-close mío" (roadmap `:1725`), primera persona del DT |
| `gates:ci` final | no | verá el resultado en la auditoría de frente | ejecutable mecánicamente (correr y reportar, no adjudicar) | — |
| Auditoría Fable del frente F4A completo | no | **es Fable misma la que la ejecuta** | no aplica | — |
| statsGrid / CHARTS+accent / 53-sin-control / iconSize / digest reconciliation / cra-12 (deudas nombradas) | no nombrado explícitamente | revisará en la auditoría de frente | podría ejecutar mecánicamente una vez el DT decida el mecanismo (ver §7, "NO ADJUDICADO") | El DT (Codex) debe primero decidir el mecanismo de escritura para cada una — ninguna tiene brief propio hoy |

**Cero atribución de consenso inexistente:** ninguno de los 7 `OPEN_KIMI` (K-1..K-7) tiene posición registrada de Kimi, Fable, Sonnet u Opus en ningún documento que haya leído — cada tabla fuente (`docs/prompt-codex-continue.md`, K5 packet v2 §6) lo declara explícitamente ("Ninguna adjudicada", "no atribuyo posición a nadie"). Reproduzco esa misma disciplina acá.

---

## 10. Progreso — preparación vs. implementación (denominador explícito, no sube el % del programa)

**No hay un checklist formal de F4A-close** (a diferencia de K4/K5, que sí tienen briefs con matrices verificables). Construyo el denominador yo mismo, explícitamente, a partir de los 4 ítems textuales de `docs/ROADMAP-EJECUCION-2026-08-19.md:1725-1729` + `checkpoint.intent.json:4` (MUST_CLOSE núcleo), más los 9 ítems de deuda nombrada de §1.A (5-13). Denominador total: **13 obligaciones nombradas** (4 núcleo + 9 deudas). Esto es una construcción mía para dar una cifra verificable, no una cifra declarada por ninguna autoridad — señalado como tal.

**Preparación (medición/censo/diseño sin escritura de producto) — 13/13 obligaciones tienen su medición base ya hecha por trabajo previo (F4A-0..13) o por este mismo memo:**
- Los 4 contadores del ratchet están medidos y estables (§3).
- La brecha de diseño del gate `realKeypathParity` está identificada y adjudicada como A4 (aunque el gate mismo no está escrito).
- Las 9 deudas de §1.A(6-13) están todas nombradas con su razón medida, citada por archivo:línea.
- Este memo mismo agrega: verificación cruzada independiente de 2 hechos K5 (BrandTableChrome=38 campos, untaggedAuthoredLeaves=40 derivado por aritmética propia), el hallazgo de la raza `program-check.test.mjs`×`manifest/generator/index.test.mjs` (nuevo, no nombrado antes), y la caracterización del `cascade-wiring-ratchet` (nuevo, no nombrado antes).

→ **Preparación: 13/13 = 100%** bajo este denominador (todo lo que puede medirse/diseñarse en prosa sin depender de K4/K5 está medido).

**Implementación (escritura de producto: gate nuevo, ratchet bajado a cero, adjudicaciones materializadas, gates:ci final, auditoría Fable) — 0/13:**
- Ninguna de las 13 obligaciones tiene una sola línea escrita en el repo a este HEAD. El gate `realKeypathParity` no existe (verificado §4). El ratchet sigue en 33/40, no en 0. Ninguna de las 7 deudas de mecanismo-no-adjudicado (§7) tiene write-set decidido, mucho menos ejecutado.
- Esto es estructural, no un déficit de trabajo: **la implementación de F4A-close está bloqueada en su totalidad por K4 (bloqueado en Kimi 403) y K5 (bloqueado en la misma respuesta Kimi + 7 decisiones OPEN_KIMI)** — no hay ningún camino de implementación parcial de F4A-close disponible hoy (confirmado en §2).

→ **Implementación: 0/13 = 0%.**

**Esto NO sube el progreso del programa.** La cifra "F4A ≈ 86% operativo, cobertura de hojas 2519/2559 = 98.4%" ya está citada en `docs/prompt-codex-continue.md:122` como estimación previa del DT (no mía) — la repito sólo como referencia de contexto, no la recalculo ni la certifico. El programa completo permanece, según la última estimación del DT, en 35-40% realizado / 60-65% pendiente (`docs/prompt-codex-continue.md`, sección de progreso equivalente al handoff citado en el prompt de arranque) — no toco esa cifra.

---

## 11. Cierre — verificación de HEAD/worktree

```
Apertura: HEAD 9d5582dfdf1d02f1d7e8fd468720b1d829e50454, git status --porcelain vacío, staged 0.
Cierre:   (re-verificado antes de escribir este archivo — ver comando abajo)
```

Ningún prompt falso ni archivo inesperado encontrado. Cero writes al repo `ui-design-system` en toda la sesión (todas las escrituras de esta sesión fueron a `/private/tmp/`, fuera del repo). Cero tests/build/generadores/browser ejecutados. Cero git mutante. Cero commits. Cero prompts a otras panes/terminales.

**VERDICT: INVENTORY_READY**
