# F4A — sello GAT-07 posterior a K5, REINTENTO (Claude Sonnet Max, writer mecánico) — SOURCE_READY

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · **staged 0**

**Autoridades verificadas (SHA-256 recomputados al abrir esta sesión, las tres exactas):**
- Adjudicación Opus `/private/tmp/f4a-k5-gat07-authority-digest-opus.md` = `f9ae84efdeb5f9695fc4f30901b003c52e529a5cbe299cc50a64d9d797af7116`, verdict `ACCEPT_REVISED_DELTA`.
- Ratificación Fable `/private/tmp/f4a-k5-gat07-authority-digest-fable.md` = `6e2a800ae0956b3c34db5e6b53e8a178cde888408ea4359d4f341d20d7b6abf2`, verdict `ACCEPT_REVISED_DELTA`.
- Brief base seal `/private/tmp/f4a-k5-gat07-seal-opus.md` = `6024eaf93cef04d4f9d0bc65cfe1c7dc694dda718292ea03424de79e4e12df48`, `READY_FOR_DT`, vigente salvo la corrección de esta adjudicación (que prevalece).

**Antecedente:** el primer intento (`/private/tmp/f4a-k5-gat07-seal-sonnet-source-ready.md`, `76299084…d779d`, verdict STOP) disparó S-3 porque `reproducibility.authorityDigest` se movió; restauré completo y reporté el hallazgo sin decidir por mi cuenta. Opus/Fable adjudicaron: es un alias literal de `inputManifest.digest` (`index.mjs:1276`), huella legítima, defecto del brief (no del árbol) — corregido a **cinco** sitios de huella y **trece** campos inmóviles para este único reintento.

---

# VERDICT: SOURCE_READY

`pnpm gat07:write` produjo exactamente los cinco sitios de huella autorizados y ninguno de los trece campos inmóviles se movió. `gat07:check` corrió verde; la negativa (revertir `semantic-hash.txt` desde backup) dio rojo nombrando exactamente ese path, restauré por copia verificada y volvió a verde. `pnpm --filter @rottay/design-system gates:ci` corrió una sola vez: **89 blocking gate(s) passed** + 2 excluded (`channel-liveness`, `lane-control-drills`, ambos con su texto de exclusión ya conocido), `gat-07-exact-proof` en PASS, cero build, cero browser. Ningún stop (S-1..S-13 de la adjudicación + los del brief base) disparó.

---

## 0. Preestado verificado (antes de escribir)

| Chequeo | Exigido | Medido |
|---|---|---|
| Node | v22.17.0 | `v22.17.0` |
| HEAD | `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` | idéntico |
| staged | 0 | 0 |
| porcelain | 23 (K5 ya escrito) | idéntico |
| `git diff --check` | verde | limpio |
| Los 2 paths GAT-07 | clean | confirmado, 0 dirty (restaurados del intento previo) |
| prehash `semantic-evidence.json` | `599643e5…` | idéntico |
| prehash `semantic-hash.txt` | `4bb91b55…` | idéntico |
| residuo `test-artifacts/**/*.tmp-*` | 0 | 0 |

## 1. Backup

`mktemp -d` → `/private/tmp/f4a-k5-gat07-seal-retry-backup.oOSnF6` (fuera del repo). Copiados los 2 paths, re-verificados byte-idénticos contra el árbol vivo antes de escribir.

## 2. Ejecución

```
pnpm gat07:write
→ WO-GAT-07 exact proof OK — 2 deterministic runs agree (57db74313c2339444cb468be8b8d26c7ee381d3690166c3cc2177a2cb7c6927b);
  3326 counters / 3226 exact zeros; 542 documented data-part entries
EXIT 0
```

## 3. Verificación campo por campo — cinco sitios de huella, trece inmóviles

### 3.1 Los cinco sitios que debían cambiar — verificados exactos

| # | sitio | pre | post | ✓ |
|---|---|---|---|---|
| 1 | `inputManifest.entries[bithire]` bytes/sha256 | `327452`/`cd2a39fe…` | `334476`/`9aba9e79…` | ✓ (path/roles intactos; el resto de las 4333 entradas idéntico) |
| 1 | `inputManifest.entries[evnto]` bytes/sha256 | `208814`/`55758dff…` | `209701`/`acf783e0…` | ✓ |
| 1 | `inputManifest.entries[rottay]` bytes/sha256 | `328425`/`7e38d1bc…` | `331937`/`ecda29e9…` | ✓ |
| 2 | `inputManifest.digest` | `2b29a571a7c05620…` | `49348001656817ff…` | ✓ nuevo |
| 3 | `reproducibility.authorityDigest` | `2b29a571a7c05620…` | `49348001656817ff…` | ✓ **igual a `inputManifest.digest`** (S-12: `authorityDigest === inputManifest.digest` → `True`) |
| 4 | `deterministicRuns.hashes[0]`/`[1]`, `agree`, `count` | `9b6c422f8e9913ab…` ×2, `true`, `2` | `57db74313c233944…` ×2, `true`, `2` | ✓ iguales entre sí |
| 5 | `semantic-hash.txt` | `9b6c422f8e9913ab…` | `57db74313c233944…` | ✓ idéntico a `hashes[0]` — par solidario |

**S-13 (exhaustividad):** ningún sexto sitio cambió — verificado comparando el documento completo pre/post campo por campo; sólo los cinco anteriores se movieron.

### 3.2 Los trece campos inmóviles — verificados byte-idénticos

Diez a nivel raíz: `paintAudit`, `publicClaims`, `verticalFacts`, `dataPartEvidence`, `staleClaimGates`, `workOrderDefinition`, `documentationAuthority`, `authority`, `scope`, `schemaVersion` — **los diez, byte-idénticos**.

Tres dentro de `reproducibility` (la descomposición que corrigió Opus): `classification`, `sourceHeadIsAuthority`, `toolchain` — **los tres, byte-idénticos**. `inputManifest.algorithm` también intacto (no es de la lista de trece pero se verificó por completitud).

## 4. `gat07:check` y negativa

```
pnpm gat07:check
→ WO-GAT-07 exact proof OK — 2 deterministic runs agree (57db74313c2339444cb468be8b8d26c7ee381d3690166c3cc2177a2cb7c6927b); 3326 counters / 3226 exact zeros; 542 documented data-part entries
EXIT 0
```

**Negativa:** revertí `test-artifacts/gates/gat-07/semantic-hash.txt` (sólo ése) al prehash de backup → `gat07:check` **rojo**, nombrando exactamente ese path:

```
Error: WO-GAT-07 authoritative artifact is stale/missing: ui-design-system/test-artifacts/gates/gat-07/semantic-hash.txt; run gat07:write after the documentation seal is committed
```

Restauré desde la copia post verificada (`de7c6606…`, guardada **antes** de la negativa) → hash idéntico, `gat07:check` **verde de nuevo**. Nunca usé HEAD ni ningún otro origen para restaurar.

## 5. `gates:ci` — una sola corrida

```
pnpm --filter @rottay/design-system gates:ci
→ (8827 líneas de log en /private/tmp/f4a-k5-gates-ci.log)
→ ci-gates OK — 89 blocking gate(s) passed.
```

**89/89 blocking en PASS**, incluido `gat-07-exact-proof` (48091ms) en PASS. **2 excluded**, exactamente los conocidos:
- `channel-liveness` — "Channel debt is authorship/theme-value work..." (owner F4A/F4B + F2-asymmetric)
- `lane-control-drills` — "tenant-reachability is red 10/13..." (owner F2-asymmetric)

**Cero build. Cero browser.** Comando terminó limpio (sin `ELIFECYCLE`), coherente con la clasificación de Opus (84 `node <script>` + 3 `pnpm run` resueltos a `node <script>` + 2 `vitest run` sin `globalSetup` ni imports de `dist/`).

## 6. Perímetro final

Porcelain: **25** = 23 preexistentes (K5 ya dentro) + exactamente los 2 del sello. Ningún path 13º/tercero apareció en ningún momento. Residuo `*.tmp-*` bajo `test-artifacts/` y `packages/core/manifest/`: **0**. `git diff --check`: limpio. HEAD/staged sin mover en ningún momento de la sesión.

## 7. Stops — ninguno disparó

S-1 (K5 postauditado ACCEPT, confirmado) · S-2 (ninguna entrada ajena a los 3 temas cambió, `path`/`roles` intactos) · S-3 reformulado (ninguno de los trece inmóviles se movió) · S-4 (`agree === true`, `hashes[0] === hashes[1]`) · S-5 (`semantic-hash.txt` se movió junto con `semantic-evidence.json`, par solidario) · S-6 (ningún tercer path) · S-7 (Node v22.17.0 en todo momento) · S-8 (`--allow-unsealed-documentation` nunca usado) · S-9 (cero residuo tmp) · S-10 (`gates:ci` cerró en 89 blocking + 2 excluded exactos) · S-11 (ningún otro artefacto tocado) · S-12 (`authorityDigest === inputManifest.digest` verificado `True`) · S-13 (ningún sexto sitio cambió).

## 8. Estado final

```
HEAD 9d5582dfdf1d02f1d7e8fd468720b1d829e50454   (sin mover)
staged: 0
git status --porcelain: 25 líneas — 23 preexistentes + los 2 del sello GAT-07
git diff --check: limpio
residuo *.tmp-*: 0
```

Cero commit. Cero stage. Cero push. Kimi fuera de la cadena. No toqué roadmap ni ningún artefacto fuera de los 2 paths del write-set.

**Evidencia durable fuera del repo:**
- `/private/tmp/f4a-k5-gat07-seal-retry-backup.oOSnF6/` — backup pre-escritura de los 2 paths (este reintento).
- `/private/tmp/f4a-k5-gat07-seal.diff` — diff completo del árbol de trabajo (reemplaza al del intento anterior; incluye los 12 de K5 + los 2 del sello).
- `/private/tmp/f4a-k5-gates-ci.log` — corrida completa de `gates:ci` (8827 líneas).
- `/private/tmp/f4a-k5-gat07-seal-retry-n1-post-verified.txt` — copia post verificada de `semantic-hash.txt` usada en la negativa.

**No declaro cierre**: sólo el postaudit Fable cierra este tranche.

# VERDICT: SOURCE_READY
