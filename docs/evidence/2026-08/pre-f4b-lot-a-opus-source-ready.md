# PRE_F4B Lote A — handoff del writer (Opus, Node 22)

## VERDICT: SOURCE_READY_BLOCKED

Esto **no** es un ACCEPT y **no** habilita el Lote B. El lote A esta escrito,
verde en CI y determinista, pero la condicion de entrada del Lote B —
`unknownProvenance == []` en `producers.json` (addendum F-5.1) — **no se
cumple**: quedan **2 024 sitios** cuyo productor no se pudo adjudicar. Por
F-5.3 eso es exactamente `SOURCE_READY_BLOCKED`: B no arranca, el ratchet viejo
sigue siendo el gate de CI verde en `2171/4374`, PRE_F4B no cierra, F4B sigue
bloqueado, y la lista va al DT con archivo, simbolo y razon.

- Fecha: 2026-08-22. Node canon `v22.17.0`.
- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` — identico al abrir y al cerrar.
- `staged 0` — antes y despues.
- Cero `git` mutante: sin add/stage/commit/push/stash/checkout/restore/reset.
  Ninguna restauracion uso `git show`; la unica reversion del lote (A12) se hizo
  **por copia de contenido** desde el backup en `/private/tmp`.

---

## 1. Autoridades verificadas (SHA-256 recomputado, exactas las seis)

| Autoridad | SHA-256 |
|---|---|
| contrato v3 | `636c5c395412ade4e1dd724c0091f09620c4129df6fd0760d50b7faf4b98ec13` |
| addendum DT | `7b704a260fe1cbe5b10902ef68dd381e511524f5aa0d18fb7008b0b5d3145295` |
| adjudicacion Fable | `0dd58125dc55f55f1506eb3e9294b0f11e859c8a826ef204e1a997a397c812af` |
| postaudit Fable del addendum | `96fc0f86818e39c7dca5a561cae088368b592a6c70074d49f21ba4e986be177c` |
| freeze JSON | `96630f8c0e38c3b74227bae6451b88a267ce0592f1475d6c78264577ba959b02` |
| freeze MD | `3768690d9d906959d11e5b4f71050fc3ee2356491e6a04014021c0b5226e04d0` |

Rulings intermedios cumplidos, verificados por SHA:

| Ruling | SHA-256 | Estado |
|---|---|---|
| auditoria A1–A3 (H1–H5) | `079b123e574a0fc319a6526103cccadc5898faca5f8693f18cd90aafcebdb4bb` | aplicado |
| reauditoria A1–A3 (residuo H4) | `3eeb8579f60192988b2aaef96678c0dfc6d9626030a35ea74bef150417de526d` | aplicado |
| auditoria A4–A9 (P0-1..P0-5, P1-1..P1-3, P2) | `be993f9b3e22898d1d70b5a63b4cfeb9d8b4a3a1ff045e08d687c2c679d9dedb` | aplicado |
| ruling DT A12 (sin path 16) | mensaje del DT en sesion | aplicado |

## 2. Precondicion del freeze (54 chequeos, todos PASS antes del primer write)

HEAD, `staged 0`, `porcelain 29` con **lista y digest exactos**
(`ebe286a019241fb82048a66c1a6eaf047910e811cb9aafa7e5bdf7d3d5c6d66e`), los 15
paths del write-set en su estado `EXISTS:<sha>` / `ABSENT` declarado (8 exists /
7 absent), las 31 autoridades read-only con hash individual, y los corpus
466 (arbol CSS) / 391 (skin). Sonda: `/private/tmp/pre-f4b-lot-a-precheck.mjs`.

Unico punto no reproducido: la formula del `rootsDir.aggregateDigest` del freeze
no coincidio con dos reconstrucciones naturales — pero **los 20 hashes
individuales de `cascade/roots/*.json` coinciden exactos**, que es la
comprobacion sustantiva. Se declara, no se silencia.

## 3. Write-set material exacto

12 paths autorizados. **Delta material en 11**; A12 queda byte-identico al
prestate por ruling del DT (§7).

| # | Path | Prestate | Poststate |
|---|---|---|---|
| A1 | `packages/core/scripts/quality-evidence/programs/modern-rescue/cascade-extract.mjs` | `e82d35e6a8caa2e87d0391cf65edd62ebc6e40f3d9382618339225cb6c655787` | `270c8faf100d20013016d9845f74d7b42de22fc5a94b4c79285d6bb109ceb72d` |
| A2 | `packages/core/manifest/cascade/extracted/css-edges.json` | `243e5cc2a88010895e4c49d4bbdc19e4ba3cba11c832b7db4d896997a706d9f9` | `574150a5adeda7dafd9521822da5e39f6a49a1dd056b41534ecdbaa5d22f4139` |
| A3 | `.../cascade-extract.test.mjs` | ABSENT | `3421877220158493b85b71ab8e71134448e589797e8b95383e131ca54e764f34` |
| A4 | `.../cascade-producers.mjs` | ABSENT | `2af8f6c9170d60baf2300df312a849a1ca33a9dba0d0dc243658cd94a7cc7ba6` |
| A5 | `packages/core/manifest/cascade/extracted/producers.json` | ABSENT | `7e977dfd0d8dc0a9bca0df7f4e9324d17360a5deecc4b7aad7dbcad645cdad0f` |
| A6 | `.../cascade-producers.test.mjs` | ABSENT | `5c957e0c0747e15da9f581721258805bcc4d07da00579e2305c600c386cbc9af` |
| A7 | `.../cascade-consumability.mjs` | ABSENT | `37d0b2e45192ed4f43bc3e3f0e8a12f35678067f192eea54b8128fa90b08249f` |
| A8 | `packages/core/manifest/cascade/extracted/consumability.json` | ABSENT | `fa898fe01dcab3c035193f0944c33ae16dc5d47097a176c950cc877caf1d28a0` |
| A9 | `.../cascade-consumability.test.mjs` | ABSENT | `1510376f074119dce0098f8dd2ea65e1571332716e89e3dab16fb209e9614c6b` |
| A10 | `.../program-check.mjs` | `a95ebb927443e4c431da8043a8ab6a312538082d5f9a4f4d9615d9607f72ecda` | `dcfd0dde9708db6a101babfeb2d7165e28857dec21caed07babefcd6a7597dd6` |
| A11 | `.../program-check.test.mjs` | `6b20d27226c3529971a18e2799c57da3ac383aad2c742bccf2dcaae84b0fa1e2` | `9e121a1f66c8a7694fa63b6726472fae1ea27b22902ec1936e80f1776fdc7c8b` |
| A12 | `packages/core/scripts/ci/gates-manifest/index.mjs` | `3b7f906f346c338302ff1a439cf18737b5a72a6f3b14dd9711efb4fb964cb64d` | **identico** |

**Perimetro:** `git status --porcelain` paso de 29 a 39 entradas. Las **10
nuevas** son exactamente A1, A2, A10 (` M`) y A3–A9 (`??`). **Cero entradas
retiradas**, cero paths fuera de A1–A12, cero `src/**`, cero `roots/`,
`root-catalog`, `manifest/index.json`, `materialized/**`, `backlog/**`, docs,
roadmap o GAT.

## 4. Diffs publicados

| Archivo | Tamano | SHA-256 |
|---|---:|---|
| `/private/tmp/pre-f4b-lot-a.diff` (completo, prestate sucio → poststate, los 12 paths) | 37,7 MB | `72b8002b1d788b2d24e40024f16fc07488c78a019884ed8518013b55bcc06186` |
| `/private/tmp/pre-f4b-lot-a-code-only.diff` (los 9 paths de codigo; complemento, no sustituto) | 189 KB | `27ca4eaf38880ebec7818d8359e949e54f1831011bc4f149a50f29bd330f4610` |
| `/private/tmp/pre-f4b-lot-a-unknown-provenance.md` (las 2 024 filas para el DT) | — | `f97642537049b03fc642f5a3ee2f0e2e750b7ee280f247f8cec8572d69f60f3f` |

El diff completo se construyo contra el **prestate sucio** (copias por contenido
en `/private/tmp/pre-f4b-lot-a-backup/`), nunca contra HEAD. Se re-genero al
cierre y dio el **mismo SHA**, prueba de que describe el arbol publicado.

## 5. Resultados de tests

| Suite | Tests | Fail |
|---|---:|---:|
| A3 `cascade-extract.test.mjs` | 23 | 0 |
| A6 `cascade-producers.test.mjs` | 36 | 0 |
| A9 `cascade-consumability.test.mjs` | 18 | 0 |
| A11 `program-check.test.mjs` | 48 | 0 |
| A10 `program-check.mjs` (serial, aislado) | — | `CONSTITUTION_READY` |

## 6. R-1 y CI (Node 22, una corrida cada uno)

```
pnpm test:scripts   ->  1817 / 1804 / 12 / 1
pnpm gates:ci       ->  exit 0 — 89 blocking PASS + 2 excluded (SKIP)
```

- **Fingerprint del failure-set: `4d6eda2dfbcaad2108b7341cad319160fcf47e7c048d59621170d55cf222cf5a`**
  — identico al canon. 12 fallas nominales, 1 skip, **cero fallas nuevas**.
  Metodo: nombres sin el prefijo `not ok N - `, orden alfabetico, join `\n` con
  newline final, sha256. Log: `/private/tmp/pre-f4b-lot-a-r1-final.log`.
- Vara del addendum F-7, con cada `N` contado en fuente:
  `1735 − 10 + N_ratchet(10) + N_extract(23) + N_producers(36) + N_consumability(18) + ΔN_programcheck(+5) = 1817`. Aritmetica exacta.
- `CI_GATES` **91 = 89 blocking + 2 excluded**, `validateManifest() = []`.
  Cero gate id nuevo. R-3 intacto. Log: `/private/tmp/pre-f4b-lot-a-gatesci.log`.

## 7. A12: conflicto vivo y ruling del DT

Anexar A3/A6/A9 al `run[]` de `modern-rescue-tooling-drills` **rompe**
`scripts/ci/runner/index.test.mjs:239`, que hace `assert.deepEqual(drills.run,
DRILLS_ARGV)` sobre un argv exacto de cuatro elementos. Ese archivo esta fuera
del write-set. Medido en vivo: con el append, R-1 daba **13 fallas** (las 12
canonicas + esa). El DT confirmo el conflicto y ordeno:

1. A12 restaurado **exactamente** al prestate por copia+rehash — hecho,
   `3b7f906f…` verificado contra el freeze.
2. A11 — ya transportado por el gate blocking — corre A3, A6 y A9 con
   `spawnSync(node --test)` **secuencial**, exit 0 y `# fail 0` por suite,
   citando las tres rutas exactas y fallando con stdout/stderr reales.
3. Guard estatico: retirar una ruta de la lista transitiva falla en A11.

Defecto atrapado al implementarlo: `node --test` **se niega a correr anidado**
(`run() is being called recursively`) saliendo **0 con stdout vacio** — un verde
que no prueba nada. Se limpia `NODE_TEST_CONTEXT`/`NODE_OPTIONS` en el entorno
del hijo; sin eso el drill era tautologico.

## 8. Determinismo y pureza CLI (Node 22)

| Script | determinismo ×2 | `--check` puro (mtime + bytes) | default sin flag | flag invalido |
|---|---|---|---|---|
| A1 `cascade-extract.mjs` | OK | OK | `--check` | exit 2 |
| A4 `cascade-producers.mjs` | OK | OK | `--check` | exit 2 |
| A7 `cascade-consumability.mjs` | OK | OK | `--check` | exit 2 |

Importar cualquiera de los tres **no escribe**. A3 lo prueba con un proceso
nuevo cuyo cuerpo entero es el `import` (el schemaVersion 1 escribia al
importarse; probarlo desde el propio proceso de test era tautologico — H5).

## 9. Contadores del lote

**A2 `css-edges.json` (schemaVersion 2):** 466 archivos · 5 234 declaraciones ·
3 316 con `var()` · **edges 10 513** (decl 3 559 / decl-fallback 961 /
leaf-fallback 5 993) · **foreignEdges 471** (foreign-head 228 / foreign-both 131
/ foreign-source 112) · literalPins 1 918 (**todos con `scopeId`**) ·
readSites 16 834 · readRefs 26 263 (governed 25 515 / internal socket 748,
**todos con `readRefId`**) · **unclassifiedCalc 0** ·
**unadjudicatedSelectors 0** · **scopeContradictions 0** · scopeTable 11.

`byKind`: alias 1 643 · literal-pin 1 918 · data-attr-select 1 287 · color-mix
155 · identity 132 · calc-multiply 82 · **calc-offset 6** · clamp 5 ·
contest-rank 4 · calc-divide 2 · table-lookup 0 · ramp-derive 0.

**A5 `producers.json`:** producerSites 4 872 · channelEmissions 10 314 ·
canales distintos 4 585 · con raiz causal 186 · **ownershipConflicts 0** ·
precedenceMetadata 2 163 · artifactThemes 3 · wildcards excluidas por forma 6.
Por plano: css 4 519 / ts-compilers 3 848 / ts-chrome-variables 1 717 /
tsx-inline-stamp 230. **Applicability por engine**: `modern+rustic+classic`
9 723 · `modern` 521 · `rustic` 68 · `classic` 2.

**A8 `consumability.json`:** 42 outputs = 20 `UNVERIFIED_PRODUCER_IMPURE` +
22 `UNREPRODUCIBLE_BLOCKED`; **`consumable: 0`**; vocabulario downstream
observado: 20 `absent` + 22 `superseded`.

**Gate viejo, antes y despues, exacto:**
`2171 names still unwired of 4374 (2203 reach a root; 768 roots/ramps excluded; 391 skin files)`.

## 10. Censo AST del plano `tsx-inline-stamp` y su diff

| Figura | Autorada (2026-08-18) | Medida | Δ |
|---|---:|---:|---:|
| excludedFiles | 1 664 | **1 664** | **0** |
| scannedFiles | 1 740 | 1 727 | −13 |
| styleSinks | 3 283 | 3 291 | **+8** |
| stampSites | 513 | 312 | −201 |
| distinctCustomProperties | 236 | 202 | −34 |
| distinctGovernedChannels | 183 | 163 | −20 |
| distinctInternalSockets | 30 | 18 | −12 |
| distinctForeignProperties | 23 | 21 | −2 |

El universo reconcilia (`excludedFiles` exacto; el censo autorado escaneaba
**todo `src`**, no los dos arboles que su prosa nombra). **La lista de canales
gobernados que la prosa nunca publico ahora existe** en
`tsxInlineStamp.governedChannels`, junto a `scannedFileList` completo. El
residuo **no** se expresa como tolerancia numerica: cada sitio no resuelto es
una fila con identidad en `unknownProvenance`.

**Retractacion explicita.** Una version anterior de A4 declaraba el residuo
`ADJUDICABLE_UNDER_APPROXIMATION` con el argumento de que omitir productores
solo infla deuda. **Eso es falso** bajo la semantica contratada: en STRICT una
alternativa de fallback se admite solo si su `guardPrimary` **no** tiene
productor, asi que omitir un productor **abre** la rama, sube
`wiredToAdoptedRoot` y **baja** la deuda. Un sitio sin enumerar puede comprar un
falso verde. La afirmacion queda retirada y A6 la fija como aritmetica.

## 11. Causa del bloqueo: 2 024 `unknownProvenance`

Todas en el plano `tsx-inline-stamp`, en **525 archivos**:

| Razon | Filas |
|---|---:|
| `unresolved-identifier` | 833 |
| `unresolved-spread` | 635 |
| `unresolved-member-access` | 389 |
| `unresolved-call` | 153 |
| `unresolved-expression` | 10 |
| `unresolved-dynamic-setProperty` | **4** |

Las 4 de `dynamic-setProperty` son **irreducibles por analisis estatico** — el
nombre del canal se computa en runtime — y exigen una autoridad de runtime o un
cambio de fuente:

- `infrastructure/runtime/foundation/root-attributes/presentation/index.ts:101` :: `apply`
- `infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx:571` :: `writePersonalityDeclarations`
- `ui/patterns/visualization/charts/runtime/exporting/foundation/file/index.ts:205` y `:208` :: `inlineStyles`

Las otras 2 020 son reducibles con mas alcance de resolucion backward (imports
entre archivos, spreads de props, mapas indexados); ninguna se resolvio a la
ligera. Lista completa con archivo/simbolo/razon:
`/private/tmp/pre-f4b-lot-a-unknown-provenance.md`.

**Por F-5.2, ningun test del lote afirma la vacuidad del inventario real**: los
drills A3/A6/A9 son de fixture, y por eso A aterriza verde con la lista no
vacia, en vez de dejar un gate blocking rojo.

## 12. Estado final del arbol

- HEAD `9d5582dfd…` identico · `staged 0` · porcelain 29 → 39, delta = solo el
  write-set de A.
- **Las 31 autoridades read-only: identicas, cero drift** (root-catalog, los 20
  `cascade/roots/*.json`, fanout-facts, el modulo `tenant-reach`, las 5 fuentes
  de compilador citadas, los 3 artifacts de tenant).
- Corpus 466 / 391 sin cambio.
- A12 byte-identico al prestate.
- Backups por contenido en `/private/tmp/pre-f4b-lot-a-backup/` (5 archivos, con
  sus prehashes verificados). Ninguna restauracion via `git`.

## 13. Lo que este handoff NO hace

No declara ACCEPT. No habilita el Lote B. No escribe B1/B2/B3. No re-ancla
ningun contador. No toca el roadmap: **BC-0 sigue pendiente del DT** en su
proxima escritura documental, fuera de este lote.

## Verdict

**SOURCE_READY_BLOCKED** — `unknownProvenance = 2024 != []`.
Siguiente actor: DT y reauditoria independiente sobre el diff completo
(`72b8002b…`), que ademas debe reauditar A1–A3 sobre el mismo diff.
