# GAT-07 — adjudicación de `reproducibility.authorityDigest` (Cloud Opus, READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · porcelain **23** · **los 2 paths del sello: 0 dirty** (restaurados).
**Contexto:** Sonnet corrió el productor, vio moverse `reproducibility.authorityDigest`, aplicó **S-3** y restauró. **K5 sigue ACCEPT.**
**Sesión:** cero writes al repo, cero productor, cero test pesado, cero git mutante.

---

# VERDICT: ACCEPT_REVISED_DELTA — es (A), huella mecánica

**`reproducibility.authorityDigest` es un ALIAS LITERAL de `inputManifest.digest`.** Una línea de fuente
lo prueba:

```js
// packages/core/scripts/evidence/gat-07-exact-proof/index.mjs:1276
authorityDigest: inputManifest.digest,
```

Y el artefacto vigente lo confirma empíricamente: `authorityDigest === inputManifest.digest` → **`true`**,
ambos `2b29a571a7c05620dab5a343114e933c563c7330e45117c2c4b44c8223c1ab2a`.

**No hay contaminación. El defecto fue mío, no del árbol:** mi §3.2 listó `reproducibility` **en bloque**
como inmóvil, sin descomponerlo, cuando uno de sus cuatro subcampos es precisamente el digest que mi
propio §3.1 ya declaraba que **debe** cambiar. Sonnet hizo lo correcto: ante un brief que se
autocontradecía, paró y restauró. **La corrección va al brief, no al gate.**

## 1. Fórmula y transitividad exactas

```
bytes+sha256 de los 3 brand-themes
   └─► inputManifest.entries[3 de 4336]          (buildInputManifest: {path, roles, bytes, sha256})
        └─► inputManifest.digest = sha256(JSON.stringify(entries))      (:1196-1211)
             ├─► reproducibility.authorityDigest = inputManifest.digest  (:1276)   ← ALIAS
             └─► inputManifest (embebido entero)                         (:1291)
                  └─► semantic hash = hash del artefacto completo
                       ├─► deterministicRuns.hashes[0] y [1]
                       └─► semantic-hash.txt
```

`grep 'inputManifest'` sobre el productor devuelve **exactamente tres** sitios: `:1254` (construcción),
`:1276` (el alias) y `:1291` (embebido). **No hay un cuarto consumidor**: la enumeración es exhaustiva.

`inputManifest.digest` **no depende del contenido semántico** de los temas: sólo de
`path + roles + bytes + sha256` de cada entrada (`algorithm:
"sha256(relevant-input-path+roles+bytes+content-sha)-v2"`). Cambiar bytes ⇒ cambia el digest, **por
construcción**, sin que ningún hecho medido se mueva.

## 2. TODOS los campos que deben cambiar — **cinco sitios**, no cuatro

| # | campo | por qué |
|---|---|---|
| 1 | `inputManifest.entries[]` — **exactamente 3** entradas (`bytes`, `sha256`); `path` y `roles` intactos | los 3 temas cambiaron de bytes |
| 2 | `inputManifest.digest` | `sha256` sobre `entries` |
| 3 | **`reproducibility.authorityDigest`** ← **el que mi brief omitió** | alias de (2), `:1276` |
| 4 | `deterministicRuns.hashes[0]` **y** `[1]` (con `agree: true`, `count: 2`) | hash del artefacto completo |
| 5 | `semantic-hash.txt` — **idéntico** al nuevo `hashes[0]` | par solidario con el `.json` |

Valores previos pineados: `inputManifest.digest` / `authorityDigest` = `2b29a571a7c05620…` ·
`hashes` y `semantic-hash.txt` = `9b6c422f8e9913ab…` · entradas de tema
rottay `328425/7e38d1bc…` → `331937/ecda29e9…`, bithire `327452/cd2a39fe…` → `334476/9aba9e79…`,
evnto `208814/55758dff…` → `209701/acf783e0…`.

## 3. TODOS los campos que deben quedar **bit-idénticos**

**Raíz:** `schemaVersion` (**3**) · `authority` (**`WO-GAT-07`**) · `scope` (string literal).

**`reproducibility` — descompuesto (aquí estaba el error):**

| subcampo | veredicto | razón |
|---|---|---|
| `classification` | **inmóvil** | constante literal `'deterministic same-input runs'` |
| `authorityDigest` | **DEBE CAMBIAR** | alias de `inputManifest.digest` |
| `sourceHeadIsAuthority` | **inmóvil** | constante literal `false` |
| `toolchain` | **inmóvil** | de `toolchainEvidence()`: root/core `package.json`, `pnpm-lock.yaml`, `ci.yml NODE_VERSION`, versiones de TypeScript/PostCSS. **Verificado: los cuatro insumos con 0 dirty.** Inmóvil *mientras el toolchain no cambie* — si cambiara, sería otro hallazgo, no éste |

**Resto del artefacto, inmóvil:** `workOrderDefinition` (`path`, `mutableLifecycleFieldsExcluded`,
`projection`, `sha256`) — deriva de `roadmap/registry.json`, **verificado 0 dirty**;
`documentationAuthority` (`seal`, `sealed`, `sealingErrors`) — deriva del documentation-seal, **0 dirty**;
`inputManifest.algorithm` y **las otras 4333 entradas**; `paintAudit`; `publicClaims`; `verticalFacts`;
`dataPartEvidence`; `staleClaimGates`.

**Sigue en pie lo medido en el memo del sello:** los comentarios de K5 **no pueden** mover `staleClaimGates`
ni `paintAudit`, porque `countArc09PaintInFile` se apoya en un módulo con **341 referencias al AST de
TypeScript y cero stripping manual**: un `--ds-*` dentro de `/** */` es trivia, nunca propiedad ni
atributo. Esa invariante **no se relaja**; es la que separa (A) de (B), y se sigue verificando.

## 4. Corrección literal al brief, para **un único reintento**

**En `/private/tmp/f4a-k5-gat07-seal-opus.md`:**

- **§3.1** — añadir el sitio 3: *«3. **`reproducibility.authorityDigest`** — alias literal de
  `inputManifest.digest` (`index.mjs:1276`); cambia con él, siempre y por construcción. Valor previo
  `2b29a571a7c05620…`. Debe quedar **exactamente igual** a `inputManifest.digest` tras el sello: si
  difieren, es defecto.»* Renumerar los sitios siguientes: son **cinco**, no cuatro.
- **§3.2** — **reemplazar** la entrada `reproducibility` por la descomposición de §3 de este memo:
  `classification`, `sourceHeadIsAuthority` y `toolchain` inmóviles; **`authorityDigest` excluido de la
  lista de inmóviles**. La lista de campos inmóviles pasa de once a **trece nombres**, porque
  `reproducibility` se abre en cuatro y uno sale.

**Stops:**

- **S-3 (reemplazo literal):** *«Se mueve cualquiera de los campos inmóviles de §3.2 —incluidos
  `reproducibility.classification`, `reproducibility.sourceHeadIsAuthority` y `reproducibility.toolchain`,
  pero **NO** `reproducibility.authorityDigest`, que es huella— → **PARAR**: sería cambio semántico
  causado por comentarios; se reformula el governor, nunca el gate.»*
- **S-12 (nuevo, positivo):** *«Tras el sello, `reproducibility.authorityDigest !== inputManifest.digest`
  → **PARAR**: el alias se rompió y el artefacto es incoherente consigo mismo.»*
- **S-13 (nuevo, cerca de exhaustividad):** *«Cambia un campo que **no** esté en la lista de cinco de
  §3.1 → **PARAR**: la enumeración de consumidores del digest es exhaustiva (`:1254`, `:1276`, `:1291`);
  un sexto sitio sería un hallazgo, no una huella.»*

**El reintento es UNO y no cambia comandos:** `pnpm gat07:write` bajo **Node v22.17.0**, cwd
`packages/core`, backup `cp` previo de los 2 paths, verificación por campos con la lista corregida,
`pnpm gat07:check` verde, y `gates:ci` **una sola vez** esperando `89 blocking + 2 excluded`.
El resto del brief del sello —write-set de 2 paths, productor, restore, negativa de reversión, S-1/S-2/
S-4…S-11— **queda intacto**.

## 5. Cierre

- **Cero writes al repo.** Write-set de la sesión: este memo y su `.ready`.
- **(A) confirmado**: huella mecánica, transitividad probada por fuente y por el propio artefacto
  (`authorityDigest === inputManifest.digest` → `true`).
- **No es contaminación** y **no se rechaza el sello**. El brief estaba mal en un campo; queda corregido
  para un único reintento.
- No abre deuda nueva, no toca roadmap, no re-ancla R-1.

# VERDICT: ACCEPT_REVISED_DELTA
