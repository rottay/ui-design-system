# Depuración de scripts y datos — 2026-08-19

Segundo paquete del diagnóstico (complementa a
[`DIAGNOSTICO-Y-PLAN-2026-08-19.md`](/docs/history/programs/architecture-refactor/2026-08/diagnosis/index.md); la ley
objetivo está en [`ARCHITECTURE.md`](ARCHITECTURE.md) §1.9–1.10 y §2.9).

Territorio: `packages/core/scripts/` (633 archivos), `packages/core/governance/{effects,graphics}/`,
`packages/core/tokens/`, los archivos sueltos de `packages/core/`, y el
`governance/manifest/` de Modern Rescue.

**Regla aplicada (del dueño):** no "¿lo llama alguien?" sino **"¿esa capacidad
debería existir en el destino?"** — y en transitivo: si el único llamador de X
es algo que no debería existir, X se retira también. Cada veredicto fue
verificado contra el código (cableado = `package.json#scripts`,
`ci-gates.manifest.mjs`, `.github/workflows/ci.yml`, o importador vivo citado).

**Respuesta corta a "¿hay cientos de files sin sentido?": no.** El ruido real
son ~30 piezas de ~650. El grueso de lo que parece ruido es inventario
gobernado (las 255 celdas-familia del manifiesto son el universo de cierre del
programa, no basura) o evidencia con gate vivo.

---

## 1. `packages/core/scripts/` planos: 81 → 72

Se retiran 9 (con sus tests/json asociados). Los 72 restantes están cableados
y sirven una ley del destino (tabla completa verificada por el agente de
zona; aquí el consolidado).

| # | Se retira | Por qué (evidencia) |
|---|---|---|
| 1 | `channel-wiring-zero-delta-gate.mjs` (+test) | Sin invocador. Su propiedad es **transitoria por construcción** (compara contra un commit pre-oleada fijo); la ley permanente ya la cubren `tenant-channel-consumer-gate` y `theme-channel-parity-gate` (manifiesto:248-250) |
| 2 | `cra-17-integral-gate.mjs` (+test) | Agregador sin invocador; sus dos sub-gates ya corren en `prepack`; el pin de proveedor lo exigen otros dos vivos |
| 3 | `skin-census.mjs` | Su ley ya vive re-implementada en `lib/fleet-inline-paint-census.mjs` (consumida por `engine-token-audit`, vivo); su salida era artefacto congelado en `roadmap/` |
| 4 | `tenant-reach-census.mjs` | Informe a stdout sin test ni artefacto ni invocador; detección permanente cubierta por `tenant-channel-consumer-gate` y `customization-surface-census` |
| 5 | `embedded-css-paint-census.mjs` | CLI huérfano; la capacidad viva está en `lib/embedded-css-paint-counter.mjs` |
| 6 | `skin-orphan-scope-audit.mjs` (+baseline.json) | Cero referencias en todo el repo |
| 7 | `migrate-public-entrypoints.mjs` (+test) | Codemod que migra **hacia** los subpaths granulares que el destino retira (§1.9 ARCHITECTURE); requiere limpiar `package.json:731-732` |
| 8 | `codemod-motion-tokens.mjs` | Aplicado; baseline en 0. Regla: codemod gastado se borra |
| 9 | `codemod-motion-durations.mjs` | Ídem |

**Corrección mía al agente de zona:** `relocate-engine-token-baseline.mjs` (+ su
lib `path-keyed-baseline-relocation.mjs` + test) **SE QUEDA** como herramienta
manual declarada. El agente propuso retirarlo por tener el trabajo agotado (0
claves viejas), pero es la herramienta sancionada para reubicar baselines en
los movimientos físicos que el frente F5 ejecuta (mudanzas de `density`,
`typography-pairings`, migraciones de chrome). Tiene alias npm
(`engine-audit:relocate-paths`). No es un codemod gastado: es una herramienta
de mudanzas futuras.

**JSONs planos: 28 → 27.** Cada uno de los 27 restantes es leído por un gate
vivo verificado por nombre (baselines decrease-only, allowlists, evidencias
GAT/CRA). Cae solo `skin-orphan-scope-baseline/index.json` (con su script).

**Censos que parecían huérfanos y no lo son:** `customization-surface-census`
tiene 4 checks en el manifiesto; `canvas-sink-census` lo importa
`cra-15-runtime-hardening-gate` (prepack); `runtime-svg-paint-census` exporta
`collectSourceFiles` que consumen dos vivos; `generate-surface-capability-
census` no tiene alias npm pero su salida versionada alimenta un test vivo —
queda como MANUAL con recomendación de `--check` de frescura.

## 2. `lib/` (30/30 se quedan) y `codemods/` (3/3 se quedan)

- `lib/`: los 30 módulos tienen consumidores vivos verificados (ningún retiro
  transitivo). Notas: `daisy-class-consumer-counter.mjs` contiene un byte NUL
  (~offset 19071) que lo hace no-UTF-8 para herramientas — corregir;
  `fleet-inline-paint-census.mjs` importa de la raíz (repuntear si esa pieza
  se mueve).
- `codemods/`: `sizetype-to-size` y `variant-tone-split` son herramientas
  manuales para repos de apps, por diseño, con targets vivos. Se quedan.

## 3. `quality-evidence/`: v1 se retira entera (8 archivos + test + línea npm)

v2 es la generación vigente; v1 está declarada "historical baseline only" por
su propio README y **nada la importa** salvo su gate-test (verificado: v2 no
importa v1; CI no la invoca; solo `package.json:680` la enchufa).

Retiran: `cli.mjs`, `registry.mjs`, `pairwise.mjs`, `schema.mjs`,
`scorer.mjs`, `quality-evidence.schema.json`, `scorecard.example.json` (hoy
inválido contra su propio validador), `README.md` (se reescribe a solo v2 — la
sección v2 es doc vigente), `scripts/tooling/quality/evidence-gate.test.mjs` (cae en
transitivo: es el único importador de v1) y la línea `quality-evidence:check`
de package.json.

Pérdida conocida y aceptada: `pairwise.mjs` (matriz de cobertura pairwise
acotada) no fue portado a v2. Es funcionalidad muerta aunque elegante; si
algún día se quiere, se re-deriva.

Deuda de cableado menor en v2: `seal-round.mjs` no tiene alias ni drill —
darle `quality-evidence:v2:seal` o un drill (la ley es "cableado o no
existe", no "se borra": su salida es lo que `round-evidence` verifica).

## 4. `governance/{effects,graphics}/` — SE QUEDA íntegro (10/10)

Es cumplimiento legal con gates vivos, no documentación decorativa:

- `packages/core/governance/effects/sources/index.json` + 5 licencias: los lee y hashea
  `scripts/check/effects/index.mjs` (raíz), que corre en CI
  (`effects:provenance`, ci.yml:181-184) y es reimportado por
  `cra-15-runtime-hardening-gate`. Rechaza licencias archivadas sin referencia.
- `packages/core/governance/graphics/sources/index.json` + licencias phosphor/thesvg: los exige
  `cra-17-packaging-license-gate` (en `prebuild`, `prepack` y `lint`) y
  `pack-inventory-gate` (CI). **Se publican** (`package.json#files` incluye
  `governance/graphics/**`) — son la obligación MIT de redistribución y la
  fuente machine-audited de `THIRD_PARTY_NOTICES.md`.

## 5. El `governance/manifest/` de Modern Rescue — sí es útil; no se mueve ahora; hay un agujero de frescura

**Qué es cada cosa (356 archivos versionados):**

| Pieza | Naturaleza | Veredicto |
|---|---|---|
| `controls/` (20) + `groups/` (3) + `schema.json` | **Autorado**: la constitución de customización (diales, vocabularios, ley de dominios) | PERMANENTE — es la fuente de F1-F4 del plan |
| `cascade/roots/` (20) + `root-catalog.json` (63 raíces) | **Autorado**: la mecánica de cascada, cruzada fail-closed contra controls por `index.mjs:311-328` | PERMANENTE |
| `families/` (255 JSON) | **Mixto** (scaffold generado, celdas autoradas): el universo de cierre — no es ruido | ESENCIAL-PROGRAMA; se archiva como evidencia al cierre |
| `index.json` | Generado, **con gate de frescura bloqueante** ya existente (`modern-rescue-customization-manifest-freshness`) | ESENCIAL-PROGRAMA |
| `generated/` (3 JSON, 23 MB) | Generado, con frescura vía byte-compare de sus tests (hoy alcanzables por el glob recursivo) | ESENCIAL-PROGRAMA |
| `cascade/{extracted,materialized,backlog}/` (43 JSON) | Generado, **SIN gate de frescura** y sin pipeline | EL AGUJERO — ver abajo |
| `generator.mjs`, `rules.mjs`, `index.mjs` | Maquinaria y ley del manifiesto | PERMANENTE (gradúan con él) |

**Ubicación: no mover ahora.** 27 archivos fuera del programa hardcodean la
ruta (gates, tests, lane-control, resolution-probe, v2, showroom diagnostics);
`program-check` es fail-closed sobre rutas relativas exactas; y hay una
remediación en vuelo tocando esos archivos. La superficie visible ya existe por
diseño: `packages/core/docs/generated/customization-controls/index.md` (generado, con dos gates
bloqueantes). **Al cierre del programa**, la constitución (controls, roots,
catalog, groups, schema, rules, generator, program-check, customization-model,
family-inventory) **gradúa a `packages/core/governance/manifest/`** y lo efímero (rounds,
checkpoint, agent-orchestration, phase-a) se archiva. Ese paso queda anotado
como tarea de cierre del programa.

**Regla de frescura — lo que hay y lo que falta:**
- Ya enforceado: `index.json` + controls/groups/families (gate bloqueante);
  `cascade/roots` (program-check); `generated/*` (tests byte-compare).
- **Agujero:** los 43 JSON de `cascade/{extracted,materialized,backlog}` no
  tienen `--check` ni pipeline. Y `cascade-backlog.mjs` está **roto**: lee
  `/private/tmp/_backlog_real.txt` (inexistente) y aborta antes de escribir
  `producers.draft.json` — que es un borrador alimentado por scratch de /tmp.
- Propuesta concreta: (1) arreglar `cascade-backlog.mjs` (re-derivar de
  fuente o cortar la sección "producers v2"); (2) añadir `--check` a los tres
  `cascade-*.mjs`; (3) registrar `modern-rescue-cascade-freshness` como entrada
  bloqueante en `ci-gates.manifest.mjs`.

**Se retira dentro del programa:**
- `probe/index.mjs` + su test (monolito duplicado de la sonda raíz; ya
  adjudicado — NO tocar los otros 5 de `probe/`, son dependencia viva).
- `governance/manifest/cascade/backlog/producers.draft.json` + la sección que lo genera.
- `KIMI-ANNOTATIONS/` (vacío; el protocolo queda como puntero en el contrato).
- `phase-a/index.json` (360 KB; la fase A nunca corrió, cero
  consumidores) → se archiva en `test-artifacts/`.

## 6. Archivos sueltos de `packages/core/`

**Se retira del índice git (5 + 1 config):**
1. `CANARY-MANIFEST.json` — 0 referencias en todo el repo (su función viva la
   cubre `contracts/tenant-themes/canary-fixtures/index.json`, publicado y con gates).
2. `LITERAL-OWNERSHIP-MATRIX.json` — 0 consumidores; la única mención en el
   mapa es falsa (el gate lee otra fuente). Archivar en `docs/history/`.
3. `rottay-design-system-2.0.0.tgz` — tarball viejo versionado (el `.gitignore`
   actual ya cubre `*.tgz`; se commiteó antes de la regla).
4. `test-results.json` — artefacto regenerable sin lector; retirar del índice
   y añadir a `.gitignore`.
5. `packages/core/ARCHITECTURE.md` — **ejecutado**: plegado en
   `docs/ARCHITECTURE.md`; los anexos de mecánica runtime viven en
   `packages/core/docs/architecture/` y el README apunta a la autoridad única.
6. `.npmignore` — config muerta (`package.json#files` tiene precedencia).

**Solo disco (no versionados):** `rottay-design-system-2.7.3.tgz`,
`coverage/`, `coverage-final/`, `storybook-static/` (borrado opcional).

**Correcciones sin retiro:** `README.md` (fila `:118` documenta el export
fantasma `styles/platform`; badge TS 5.7 vs toolchain real 5.9.3 — el badge
React 18|19 es correcto), `docs/quality/performance-budget/index.md:56` (presupuesto de
`platform.css` — muere con la identidad platform), `dependency-honesty.mjs`
(entradas `platform.css` y `commercial` se retiran en F6/F8 del plan).

**Se quedan (verificado uno por uno):** los 8 manifiestos JSON vivos
(`customization-reconciliation`, `customization-surface-report`,
`KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST`, `KIMI-VISUAL-WORKLIST`,
`hooks-manifest`, `public-entrypoints.manifest`, `supplier-contract`,
`tenant-theme-canary-fixtures` — cada uno con gate vivo o publicación),
toolchain configs, `docs/guides/getting-started/index.md`, `docs/architecture/engine-splitting/index.md`,
`THIRD_PARTY_NOTICES.md`, `CHANGELOG.md`, `consumer/`, `test-artifacts/`,
`styles/`.

## 7. Deudas de cableado y doc-rot encontradas (no son retiros)

1. **Comentario obsoleto en `ci-gates.manifest.mjs:42-53`** ("ningún glob
   alcanza estos tests"): falso desde el glob recursivo (probado
   empíricamente en Node 22 — todo test bajo `scripts/` es alcanzable). La
   ley del repo manda corregirlo el mismo día.
2. **`gat-09-full-claim-integrity`**: está en package.json pero no en el
   manifiesto ni en CI — entra al manifiesto o muere con el programa.
3. **Dos canales de cableado**: hay gates cableados vía `ci.yml`/`prepack`/
   `prebuild` que no están en `ci-gates.manifest.mjs` (pack-inventory,
   icon-embed, container-query, cra-11, audits, storybook-budget). La ley
   §1.10 dice "el manifiesto o no existe" → **decisión del dueño**: o el
   manifiesto absorbe esas entradas, o se declara por escrito que
   `ci.yml`/lifecycle-hooks son canales legítimos (y entonces el gate de
   wiring debe contarlos).
4. `public-entrypoint-boundary-gate`: su manifiesto incluye los subpaths
   granulares que F6 retira — re-acotar en F6, no antes.
5. Byte NUL en `lib/daisy-class-consumer-counter.mjs` (corregir).
6. `roadmap/skin-census.json` queda congelado al retirar `skin-census.mjs`
   (anotar en el lote).

## 8. Conteos finales

| Zona | Antes | Después | Retiran/archivan |
|---|---:|---:|---:|
| scripts/ planos (prod) | 81 | 72 | 9 |
| scripts/ tests planos | 86 | 83 | 3 |
| scripts/ JSON planos | 28 | 27 | 1 |
| quality-evidence v1 | 8 + test | 0 | 8 + test + línea npm |
| modern-rescue (piezas) | ~390 | ~386 | monolito+test, draft, inbox, phase-a |
| core sueltos (git) | — | — | 5 + 1 config |
| **Total piezas retiradas** | | | **~30 de ~650** |

El resto está cableado y sirve una ley del destino. Nada de esto se ejecuta
sin el gate que demuestre que no rompió nada (regla del plan, F0).

## 9. Para la re-auditoría (Fable)

Atacar primero: (1) la resolución "se borra" de los 2 gates sin invocador
(§1, ítems 1-2) — ¿la cobertura permanente realmente los cubre?; (2) la
decisión de NO mover el manifest ahora (§5) — ¿el costo de moverlo está bien
medido (27 archivos)?; (3) el agujero de frescura de cascade/ (§5) — ¿los 43
JSON sirven a algo vivo que justifique arreglar cascade-backlog en vez de
borrar todo el subárbol?; (4) los 8 JSON sueltos marcados ESENCIAL — ¿alguno
es en realidad evidencia congelada sin gate? Verificar contra el árbol, no
contra los docs de proceso.
