# F4A-close real-keypath-parity — Postaudit final Fable 5 (auditor READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Estado verificado:** HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (inmóvil) · staged 0 · porcelain **27 = 25 + los 2 únicos paths antes-limpios** (`variant-parity/index.mjs`, `index.test.mjs`) · `git diff --check` limpio.

**Autoridades (SHA-256 recomputados, las cuatro exactas):** SOURCE_READY `9256c768…be73c` · diff durable `2799b3dc…f4f26` · mi challenge `8a9c7f48…0cdda` (adoptado íntegro) · ruling DT `ca7c99bf…60ca7` (amplía el write-set al cierre transitivo probado por K5 — ampliación mecánica, sin cambio de arquitectura ni canon).

**Leyes:** cero writes al repo, cero producers en escritura/tests/build/browser corridos por mí (sólo `--check` read-only y análisis en memoria), cero git mutante; Kimi fuera. Write-set de la sesión: este memo y su `.ready`.

---

## VERDICT: ACCEPT

El diff VIVO —inspeccionado contra el backup, no contra el memo— es exactamente el mandato del challenge + ruling: **15 paths, ningún 16.º**, parser fail-closed, 53 disposiciones exactas sin un solo valor tocado, contadores al dígito, clausura transitiva con deltas puramente causales, GAT con sus 13 inmóviles, y ambas varas (R-1 y CI) intactas. **Un hallazgo P2** (regex de continuación, dirección segura, arreglo de una palabra) que no bloquea. **F4A-close/paridad real queda cerrado en su tranche.**

---

## 1. Write-set — 15 exactos, contra el backup

Enumeré los 15 archivos del backup `BSq4P5` y comparé cada uno contra el vivo: **los 15 cambiaron, ninguno más** (7 semánticos de mi challenge + 6 transitivos + 2 GAT). `root-checklists.json` correctamente FUERA (verificado byte-idéntico otra vez — no proyecta líneas de temas). Porcelain 27 sin path extra.

## 2. Parser y guardas — fail-closed, con la caza de bugs pedida

Leído el diff completo del productor:

- Lexer: `@(domicile|governor|placeholder|absent)` (:183); `tags.absent` ✓.
- Validaciones locales: ruta vacía, combinación con `@domicile`/`@placeholder` prohibida, `@governor` obligatorio, **contradicción por igualdad EXACTA** (`leaves.has`) ✓; duplicado por tema ✓; cobertura-por-placeholder chequeada **post-loop** (robusta al orden de aparición — bien razonado y comentado) ✓.
- Validación GLOBAL en `buildDoc`: pertenencia al universo por igualdad exacta — **un prefijo de familia nunca pasa** (no es miembro exacto) ✓.
- `disposition` **extiende** `positions` sin tocarla (clon + declared-absent sólo si no había posición — belt correcto sobre las validaciones); `silentPairs`/`placeholderPairs`/`declaredAbsentPairs` computados por par ✓; `evaluate()` ahora pinea `['silentPairs','placeholderPairs','untaggedAuthoredLeaves']` — `divergentSlots` retirado ✓; mensajes OK/write actualizados a la ley nueva ✓; rename `matrix.absent → matrix.silent` con racional escrito (desambiguación correcta; verificado sin consumidores del nombre viejo) ✓.

**P2-1 (único hallazgo — no bloquea):** la regex de continuación `:192` (`nextIsText`) sigue siendo `@(domicile|governor|placeholder)` **sin `absent`**. Efecto: un docblock ordenado `@governor` → `@absent` se rechaza como `malformed: "governor multilinea"` — **fail-closed** (rojo lo que debería ser verde; jamás verde lo que debería ser rojo) pero con mensaje engañoso, y fuerza la forma canónica @absent-primero como única válida. Impacto vivo: **cero** (los 53 bloques usan la forma canónica; 0 failures). **Arreglo mínimo exacto:** en `manifest/variant-parity/index.mjs:192`, cambiar el patrón negativo a `@(domicile|governor|placeholder|absent)\b` — una palabra; para el próximo tranche que toque este archivo, con un fixture de orden invertido.

## 3. Las 53 disposiciones — probadas programáticamente

Diff por tema contra el backup: **@absent +19/+1/+33 = 53**, cada uno con su `@governor` (+19/+1/+33); **líneas no-comentario byte-idénticas en los tres temas** (probado por comparación de conjuntos filtrados — cero valores tocados, la forma más fuerte); **`evnto×CHROME.table.border` = `@absent`, NO `@placeholder`** (C-B3 implementada); todas las rutas son hojas exactas, **cero prefijos de familia**.

## 4. Contadores y baseline — al dígito, en vivo

- `--check` corrido por mí: **`variant-parity OK — 2559 slots (7677 pares), 0 silenciosos, 3969 con placeholder, 0 hojas sin tag (4208 tags leídos)`, EXIT 0.**
- Generado: `{silentPairs 0 · placeholderPairs 3969 · declaredAbsentPairs 53 · untagged 0 · divergentSlots 33 (informativo)}` · registry **4208** — mi predicción 4155+53 exacta.
- Baseline: pines `0/3969/0`; `divergentSlots: 33` **sólo informativo**; **Baja #15 ejemplar** (composición 19/1/33, border-por-declaración con su prong (i), retiro de divergentSlots con racional A4); la **nota falsa corregida por narración** (cita la vieja entre comillas, la declara FALSA con la razón medida y apunta al gate nuevo — mi probe inicial matcheó la cita, no una regresión); **cero** `3661`/`1918`/`1823` en todo el baseline; sin re-anclajes prohibidos; `untagged 0` intacto.

## 5. Clausura transitiva — sólo deltas causales

fanout: **sets de canales 7504 == 7504 idénticos** (posiciones solamente) · census: quitando `meta.inputsDigest`, longitudes idénticas (digest-only) · reconciliation: `basedOnReportDigest` **== sha256 real del report nuevo, verificado por mi propio hash** (`e5407af8…`) · preservation/controls: conforme al patrón ya probado · mirror: **18 líneas = exactamente 6×(bytes/lines/sha256), las 3 huellas de tema** · root-checklists byte-idéntico.

## 6. GAT-07 — 13 inmóviles probados por walker exhaustivo

Deep-compare recursivo backup→vivo del artefacto entero: **cambios = exactamente los 4 caminos** (`authorityDigest`, `inputManifest.digest`, `hashes[0]`, `hashes[1]`) **+ 3 entradas de tema (sólo bytes/sha256)** — ningún sexto sitio; alias `authorityDigest === inputManifest.digest` → true; `agree: true`, `hashes[0]===hashes[1]`; `semantic-hash.txt` solidario (== hashes[0], leído por mí). Los 13 inmóviles: byte-idénticos globalmente por exhaustión.

## 7. Varas — auditadas, no repetidas

- `test:scripts`: **1732 / 1719 / 12 / 1** — +13 tests (los fixtures de este lote, todos verdes; 1706+13=1719 ✓ cero regresión); **las 12 fallas hashean idéntico a R-1** (`4d6eda2d…` == `4d6eda2d…`); skip 1; `export-*` verdes. **Sin re-ancla.**
- `gates:ci`: **89 `PASS` + 2 `SKIP` conocidos**, cierre literal `ci-gates OK — 89 blocking gate(s) passed.`
- Negativas del informe (N-1 artefacto, **N-2 anti-tapadera central**: `placeholderPairs GREW 3969→3970` al sustituir el @absent de bithire por placeholder — la mordida que C-B1 exigía; N-3 silencio `GREW 0→1`) con restore por copia+hash — coherentes con todo lo medido; 47/47 en el test del productor.

---

## Cierre

- HEAD inmóvil · staged 0 · porcelain 27 exacto · cero writes míos · cero pedidos de commit · Kimi fuera.
- **Hallazgos: P0 ninguno · P1 ninguno · P2 uno** (regex `:192`, arreglo de una palabra, dirección segura, para el próximo tranche que toque el archivo).

# VERDICT FINAL: ACCEPT

El tranche real-keypath-parity queda postauditado y **cerrado**: la paridad real de A4 vive como `silentPairs=0` sobre 7677 pares con las 53 exclusividades declaradas y firmadas, `placeholderPairs` en ratchet decrease-only puro (3969, sin el +1 que rechacé), `divergentSlots` retirado a informativo, registry 4208, cero valores tocados, clausura transitiva causal y ambas varas intactas. El asiento en el libro mayor y el commit del frente son decisión del DT — este memo no los ejecuta ni los solicita.
