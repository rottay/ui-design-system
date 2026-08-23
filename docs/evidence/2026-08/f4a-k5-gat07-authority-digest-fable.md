# GAT-07 `reproducibility.authorityDigest` — Ratificación acotada Fable 5 (auditor READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · porcelain 23 · **los 2 paths del sello: 0 dirty** (restore de Sonnet verificado).
**Insumos (SHA-256 recomputados, ambos exactos):** adjudicación Opus `f9ae84ef…f7116`; STOP Sonnet `76299084…0d779d`.
**Leyes:** cero writes al repo, cero productor/tests/suites, cero git mutante; ratificación acotada a la pregunta única — K5 no se reabre (sigue ACCEPT `b4b401ea…`). Write-set de la sesión: este memo y su `.ready`.

---

## VERDICT: ACCEPT_REVISED_DELTA

**Sí: `reproducibility.authorityDigest` es un alias literal y obligatorio de `inputManifest.digest`, y debe autorizarse como quinto sitio de huella**, con `classification`, `sourceHeadIsAuthority`, `toolchain` y todos los campos semánticos inmóviles. Verificado por tres vías independientes:

1. **Fuente, la línea exacta** — `scripts/evidence/gat-07-exact-proof/index.mjs:1276`: `authorityDigest: inputManifest.digest,` — asignación alias, sin transformación. El bloque `reproducibility` leído entero (`:1274-1279`): `classification: 'deterministic same-input runs'` (constante literal), el alias, `sourceHeadIsAuthority: false` (constante literal), `toolchain` (de `toolchainEvidence()`). Exactamente la descomposición de Opus §3.
2. **Exhaustividad de consumidores** — `inputManifest` aparece en el productor en **exactamente tres sitios**: `:1254` (construcción), `:1276` (el alias), `:1291` (embebido en el artefacto). No hay cuarto consumidor. Y `authorityDigest` tiene **cero consumidores fuera del productor** (barrido de `scripts/` y `src/`): nadie lo pinea de forma independiente.
3. **Empírica, sobre el artefacto vivo** — `test-artifacts/gates/gat-07/semantic-evidence.json`: `authorityDigest === inputManifest.digest` → **`true`**, ambos `2b29a571a7c05620…` (el valor previo que Opus pineó); `reproducibility` tiene exactamente las 4 claves declaradas, con los literales confirmados.

**La adjudicación de Opus es correcta también en su honestidad**: el defecto era del brief del sello (listó `reproducibility` en bloque como inmóvil mientras su propio §3.1 exigía que el digest cambiara — autocontradicción), no del gate ni del árbol; Sonnet aplicó S-3 y restauró correctamente. La corrección va al brief. Los tres stops de Opus quedan ratificados como están: **S-3** reformulado (los tres subcampos inmóviles nombrados, `authorityDigest` excluido), **S-12** (coherencia positiva del alias tras el sello: si difieren → PARAR) y **S-13** (cerca de exhaustividad: un sexto sitio de cambio → hallazgo, no huella). La invariante que separa huella de contaminación (AST-based, comentarios jamás propiedades) no se relaja.

**Queda habilitado UN único reintento del sello** bajo la corrección y stops de Opus: `pnpm gat07:write` (Node v22.17.0, cwd `packages/core`), backup `cp` de los 2 paths, verificación por campos con la lista de **cinco** sitios de cambio y **trece** inmóviles, `gat07:check` verde, y `gates:ci` una sola vez esperando `89 blocking + 2 excluded`. Todo lo demás del brief del sello queda intacto.

# VERDICT FINAL: ACCEPT_REVISED_DELTA
