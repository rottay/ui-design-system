# P1 — Expert allowlist 290/294/67 y schemaVersion del gate de techos
HEAD verificado: dcc44a6093de0ba4f9dcbdb733ae467008cffb21 (coincide con el contexto). git status inicial = final: 2 modificados ajenos (`public-entrypoint-boundary-gate/index.mjs`, `index.test.mjs`), 1 untracked (`docs/reauditoria-cloud/`). No toqué nada; sin escrituras al repo.

## Reproducción (hecho base, comando → salida)

### Punto 1 — allowlist

Fuente viva, HEAD, `packages/core/src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts:156`:
```ts
export const TENANT_THEME_OVERRIDE_TOKENS = [ /* 67 literales */
  ...TENANT_SEMANTIC_SURFACE_TOKENS,     // 8 roles x 20 facets = 160
  ...TENANT_SEMANTIC_TYPOGRAPHY_TOKENS,  // 9 roles x 7 facets = 63
] as const;
```
Ejecuté la función REAL del programa (`tooling/lane-control/runtime/tenant-reach/index.mjs::overrideTokens`), no una reimplementación:
```
$ node --input-type=module -e "import{overrideTokens}from './packages/core/src/tooling/lane-control/runtime/tenant-reach/index.mjs'; console.log(overrideTokens('.'))"
names.size (total resolved): 290
literals: 67
spreads: [{"name":"TENANT_SEMANTIC_SURFACE_TOKENS","resolved":160},{"name":"TENANT_SEMANTIC_TYPOGRAPHY_TOKENS","resolved":63}]
```
Cruzado con conteo manual independiente (regex sobre el bloque, sin usar el código del programa): 67 literales, coincide. 67+160+63=290.

`git show dcadb84743 -- .../tenant-theme/index.ts`: retira exactamente 4 literales (`--ds-color-dark-primary/-secondary/-accent/-bg`) con nota "removed, not deprecated: no compiler emits that family". Antes de ese commit el conteo era 71 literales + 223 = **294**. Después: 67 + 223 = **290**. `dcadb84743` es un commit-checkpoint gigante (decenas de archivos), no un commit dedicado al allowlist — el cambio de 294→290 quedó enterrado ahí.

Grep de las 4 constitucionales que exigen 294 (todas presentes, todas literales/hardcoded, ninguna deriva de la fuente):
```
program/index.json:65:    "expertExactAllowlist": 294,
README.md:75:  is a closed 294-entry exact allowlist...
rounds/index.json:446:        "expertExactAllowlistBaseline": 294,
customization-model/index.json:296:    "exactAllowlistBaseline": 294,
```
`program-check.mjs` — los 4 checks señalados por Codex:
```
643-644: program.controlBaselines?.expertExactAllowlist !== 294  → falla si no es 294
699-700: model.expert?.exactAllowlistBaseline !== 294            → falla si no es 294
892:     program vs customization-model (copia contra copia)
1276-1277: customization?.expert?.exactAllowlistBaseline !== 294 → falla si no es 294
```
Ninguno de los 4 importa `TENANT_THEME_OVERRIDE_TOKENS` ni `overrideTokens()`. Grep de `tenant-reach\|TENANT_THEME_OVERRIDE` en `program-check.mjs`: 0 resultados. El check es 100% circular: copia-vs-copia-vs-literal-294, nunca copia-vs-fuente.

Manifests de dominio (Kimi, línea 65 controls):
```
manifest/controls/token-overrides.json:65: "...the closed source is TENANT_THEME_OVERRIDE_TOKENS (290 published names)..."
```
Correcto — coincide con la fuente viva.

Manifests de dominio (Codex, "67"):
```
manifest/cascade/roots/token-overrides.json:11:  "...TENANT_THEME_OVERRIDE_TOKENS (...tenant-theme/index.ts:156, 67 nombres; sin motion ni focus)..."
manifest/cascade/roots/token-overrides.json:21:  "...TENANT_THEME_OVERRIDE_TOKENS (...156-233, 67 nombres contados en fuente...) ... los 67 nombres son el DOMINIO DE DESTINO..."
manifest/cascade/materialized/token-overrides.json:12: "...allowlist cerrado (67 nombres); sin derivacion propia"
```
Confirmado LITERALMENTE, tres veces, en dos archivos distintos de la capa `cascade/`. No es "colisión con otra cifra" (p.ej. `collapsesLegacy.total`) — es la MISMA magnitud (67), citando la MISMA línea de fuente (156), y describiéndola explícitamente como "contados en fuente": es decir, quien escribió esa nota leyó las líneas literales del array y NO resolvió los dos spreads (`...TENANT_SEMANTIC_SURFACE_TOKENS`, `...TENANT_SEMANTIC_TYPOGRAPHY_TOKENS`), exactamente la trampa que el propio docstring de `tenant-reach/index.mjs:170-181` advierte y por la que existe `resolveCrossProduct`.

Hallazgo colateral: el docstring de `tenant-reach/index.mjs:178` dice "Reading the literal lines of this array yields 71" — ESO es la cifra pre-`dcadb84743` (71 literales, 294 total); el código no fue actualizado tras el retiro de los 4 tokens muertos y hoy da 67, no 71. El comentario está stale pero es inocuo porque el código no depende del número citado en la prosa (`constArray`/`resolveCrossProduct` re-cuentan siempre).

`program-check.mjs` corre HOY:
```
$ node program-check.mjs
CONSTITUTION_READY
EXIT: 0
```
Verde porque compara `program/index.json` (294) contra `customization-model/index.json` (294) contra el literal `294` — las tres copias stale concuerdan entre sí. Nunca toca la fuente viva (290). El verde es real pero NO es evidencia de que 294 sea correcto: es evidencia de que las copias no divergieron ENTRE SÍ desde que se escribieron.

### Punto 2 — schemaVersion

`evaluateCeilings` en HEAD (`git show HEAD:.../public-entrypoint-boundary-gate/index.mjs`, líneas 70-102): no menciona `schemaVersion` en ningún punto del cuerpo. Reproducción ejecutando la función REAL de HEAD (extracto verbatim en scratchpad, sin reimplementar lógica, import desde fuera del repo):
```
missing_field    -> []
null_version     -> []
version_999      -> []
version_string_1 -> []   # "1" string
version_0        -> []
version_true     -> []
version_correct_1 -> []
```
Las 7 formas pasan idénticas (acepta) en HEAD — confirma el defecto tal como lo describen Codex/Kimi, con reproducción directa, no por lectura.

Worktree: `git diff --stat` sobre `packages/core/scripts/boundaries/public-entrypoint-boundary-gate/` → SOLO 2 archivos (`index.mjs` +30/-0 líneas netas, `index.test.mjs` +95/-9). Repo-wide `git status --short` (no acotado) confirma: no hay `producers.json` ni ningún otro archivo tocado. **La afirmación de Kimi de que el worktree está "mezclado con cambios ajenos en producers.json" es FALSA** — no existe tal archivo en el diff, en ningún lado del repo. El team-lead (2 archivos) tenía razón.

Diff leído completo: agrega `CEILINGS_SCHEMA_VERSION = 1`; en `evaluateCeilings`, tras validar la forma de `baseline.ceilings`, compara `baseline.schemaVersion !== CEILINGS_SCHEMA_VERSION` con `===` estricto (así que `"1"` string también falla) y devuelve fail-closed con mensaje nombrado; en `writeCeilingsBaseline`, el mismo guard sobre `previous?.schemaVersion` ANTES de leer los techos vivos o escribir nada; el documento final fija `schemaVersion: CEILINGS_SCHEMA_VERSION` explícitamente después del spread de `...previous` (para que un spread de formato viejo no lo pise).

Repetí la reproducción contra el worktree real (import directo, sin mutar nada — las funciones puras no escriben):
```
missing/null/999/"1"/0/true/2  -> [1 failure], mensaje "schemaVersion ... y este gate lee la version 1"
version_correct_1 (=== 1)      -> []
```
Confirma que el fix cierra las 7 formas.

`grep -rln "ceilings.baseline\|CEILINGS_BASELINE_RELATIVE"` en `packages/core/scripts`: sólo `index.mjs` e `index.test.mjs` — ningún otro lector bypassa el guard.

Baseline real (`public-entrypoint-boundary-gate.ceilings.baseline.json`): ya declara `"schemaVersion": 1` (producido por "Lote DRILL-77 2026-08-28"), consistente con `CEILINGS_SCHEMA_VERSION`.

Drills nuevos (5, todos en el archivo modificado): cubren lectura (`evaluateCeilings` con `[undefined, null, 999, '1', 0, 2, true]`, superconjunto de lo pedido), el gate cableado end-to-end (`runPublicEntrypointGate` con ancla real de otra versión), la ruta de escritura (`writeCeilingsBaseline` con las mismas 3 versiones malas, más assert de que el archivo NO se tocó), que `--write-baseline` siempre re-escribe `schemaVersion: CEILINGS_SCHEMA_VERSION`, y que el ancla REAL del repo declara la versión correcta. Los helpers de fixture (`runtimeFixture`) escriben sólo en `fs.mkdtempSync(os.tmpdir())`; la única lectura fuera de tmpdir es `fs.readFileSync` (sin escritura) sobre el ancla real. Corrí la suite completa (`node --test index.test.mjs`): **25/25 pass**, incluidas las 5 SCHEMA. `git status --short` post-corrida: sin cambios (confirma que no escribió sobre el repo).

## Adjudicación por afirmación

| Afirmación | Quién | Cifra reproducida | Interpretación | Veredicto | Quién tenía razón |
|---|---|---|---|---|---|
| Fuente viva `TENANT_THEME_OVERRIDE_TOKENS` = 290 | Codex/Kimi/Cloud | 290 (67 literal + 160 + 63, vía `overrideTokens()` real) | Total resuelto correcto | CONFIRMADA | Los tres |
| Constitución (program/index.json/customization-model/index.json/rounds/index.json/README/program-check) exige 294 | Codex | 294 en 4 archivos, 4 checks en program-check.mjs | Stale desde antes de `dcadb84743` (que bajó el total 294→290 sin tocar estos archivos) | CONFIRMADA | Codex |
| `manifest/cascade/roots/token-overrides.json` "todavía dice 67" | Codex | "67 nombres" x2 en ese archivo, x1 más en `cascade/materialized/token-overrides.json` | No es staleness temporal (67 no fue nunca el total histórico ni pre ni post `dcadb84743`, que fueron 71/294 y 67/290 respectivamente) — es un error de LECTURA: cuenta literales del array e ignora los 2 spreads, la trampa que el propio `tenant-reach` docstring nombra | CONFIRMADA | Codex |
| Kimi verificó 290/294 pero no reprodujo el "67" | Kimi (autorreporte) | — | El "67" SÍ es reproducible con grep directo, en texto plano, dos veces en el mismo archivo que Codex citó | REFUTADA (el "67" existe y es localizable; el gap fue de búsqueda de Kimi, no de la afirmación de Codex) | Codex |
| program-check compara copias stale entre sí, no contra la fuente viva | Codex | `node program-check.mjs` → `CONSTITUTION_READY` exit 0 hoy; 0 imports de `tenant-reach`/`TENANT_THEME_OVERRIDE_TOKENS` en el archivo | El verde es real pero no es evidencia de que 294 sea correcto | CONFIRMADA | Codex |
| Worktree del schemaVersion: `evaluateCeilings` de HEAD no verifica schemaVersion (missing/null/999/"1" pasan) | Codex/Kimi | 7/7 formas devuelven `[]` en HEAD | Defecto real, reproducido por ejecución de la función real | CONFIRMADA | Codex/Kimi |
| Fix del worktree existe, con `CEILINGS_SCHEMA_VERSION=1`, fail-closed en lectura y escritura, drills | Codex/Kimi | Diff de 2 archivos, 25/25 tests verdes incl. 5 SCHEMA | Suficiente: cubre ambas rutas, superconjunto de valores pedidos, valida no-escritura sobre ancla ajena, valida re-escritura siempre versionada, valida ancla real | CONFIRMADA — SUFICIENTE | Codex/Kimi |
| Worktree "mezclado con cambios ajenos en producers.json" | Kimi | `git diff --stat` = 2 archivos exactos; `git status --short` repo-wide sin `producers.json` en ningún lado | No existe tal mezcla | REFUTADA | team-lead (2 archivos) |

## Causalidad y severidad

**Allowlist:** severidad documental/gobernanza, no runtime — nadie consume el número 294/67 para computar un límite real en producción; el límite real de escritura (`maxTokenOverrides: 200`) vive en el compilador y es independiente. Pero el programa "modern-rescue" es explícitamente un programa de EVIDENCIA (quality-evidence): su valor es que la prosa describa la fuente con exactitud. Un gate constitucional (`program-check.mjs`) que da `CONSTITUTION_READY` mientras la constitución misma dice 294 y la fuente dice 290 es un falso-verde de gobernanza — exactamente el patrón "T-1 constitucional lee copias, no la fuente" que memoria del programa ya nombra (`[[executable-contract-outranks-reading-source]]`). El "67" en `cascade/roots` y `cascade/materialized` es más grave en un sentido: subestima el dominio real por 4.3x (67 vs 290) en un archivo cuyo propósito es documentar la cobertura del canal para razonamiento downstream (`variantsEmptyReason`, `structuralCeilingNote`); no es un campo numérico que un gate lea (verifiqué: `schemaVersion`, `dependsOn`, `derivations`, `terminalReach`, `variants`, `overlaps` — todos vacíos o no-numéricos, el "67" vive sólo en prosa), pero SÍ es la cifra que un lector humano o un agente confiaría para juzgar "cuánto allowlist hay".

**schemaVersion:** severidad real de runtime — un ancla corrupta/de otro formato pasaba silenciosamente por `--check` (aceptaba cualquier techo) y por `--write-baseline` (podía re-anclar sobre un formato no entendido, propagando basura via `...previous`). El fix en worktree cierra ambas rutas con fail-closed, confirmado por ejecución real, no sólo lectura.

## Fix correcto (tipo, sin implementar) y fixes que NO deben ejecutarse

**Allowlist — fix correcto:**
1. T-1 constitucional: cambiar los 4 literales `294`→`290` en `program/index.json:65`, `customization-model/index.json:296`, `rounds/index.json:446`, `README.md:75`, y los 4 checks de `program-check.mjs` (líneas 643-644, 699-700, 1276-1277) — pero el fix REAL no es sólo cambiar el número mágico, es agregar un quinto check que importe `overrideTokens()` de `tenant-reach/index.mjs` (o re-implemente su misma lectura-con-resolución-de-spreads) y compare el literal contra la FUENTE VIVA, no sólo entre sí. Si no, el próximo commit que toque el allowlist vuelve a stale-ar en silencio (exactamente lo que pasó con `dcadb84743`).
2. `manifest/cascade/roots/token-overrides.json` y `manifest/cascade/materialized/token-overrides.json`: corregir la prosa "67 nombres" → "290 nombres (67 literales + 160 + 63 vía 2 cross-products)", citando la fuente y el mecanismo de resolución, no sólo el conteo de líneas literales.
3. `tenant-reach/index.mjs:178` docstring: "71"→"67" (cosmético, no bloquea nada porque el código no depende de la prosa).

**NO ejecutar:** no "arreglar" el problema subiendo el número en `program/index.json`/`customization-model/index.json` a 290 sin agregar el check contra fuente viva — eso repite el mismo patrón de copia-vs-copia y sólo pospone la próxima divergencia silenciosa.

**schemaVersion — el fix del worktree está listo para commitear tal cual**; no requiere cambios adicionales. Verificar únicamente que sea la persona/rol correcto quien decida commitearlo (no es mi alcance como brazo read-only).

## Hallazgos nuevos que ninguno de los tres vio
- El "67" no es un número arbitrario ni una colisión con otra cifra del programa: es exactamente el conteo de literales PRE-spread-resolution de la fuente actual, citando la línea correcta (156) — es decir, quien escribió esas dos notas de `cascade/` SÍ miró la fuente correcta, pero cayó en la misma trampa de interpolación que el propio `tenant-reach/index.mjs` documenta y existe para evitar (docstring líneas 170-181, "THE SPREADS ARE THEMSELVES CROSS-PRODUCTS... hides every name on the raw-dial allowlist").
- El mismo error de "67" está DUPLICADO en un segundo archivo (`manifest/cascade/materialized/token-overrides.json:12`), no sólo en el que citó Codex — el defecto es sistémico en la capa `cascade/` (que no resuelve spreads), mientras que la capa `manifest/controls/` (que si usa 290) está correcta. Sugiere que ambas capas se generan/mantienen con procesos distintos y uno de los dos no pasa por `overrideTokens()`.
- El docstring de `tenant-reach/index.mjs:178` ("yields 71") es prosa stale post-`dcadb84743`, inofensiva porque el código no depende de ella, pero es evidencia adicional de que el commit-checkpoint gigante dejó residuos textuales sin barrer en más de un lugar.

## Lo que no pude cerrar
- No verifiqué si `dcadb84743` (commit-checkpoint masivo) tiene algún commit ANTERIOR más granular donde el retiro de los 4 tokens se haya hecho y documentado por separado (busqué sólo ese SHA puntual, que el team-lead citó). Si existe un commit más específico con mensaje explicando la intención constitucional, no lo ubiqué — no cambia la adjudicación (la fuente HEAD es la misma cualquiera sea el commit exacto).
- No ejecuté `writeCeilingsBaseline` contra el árbol real (fuera de tmpdir) para no arriesgar una escritura real sobre el ancla del repo; la suficiencia de esa ruta la cerré por lectura de código + ejecución de la suite de tests del propio worktree (que sí la ejercita en tmpdir, 25/25 verde).
