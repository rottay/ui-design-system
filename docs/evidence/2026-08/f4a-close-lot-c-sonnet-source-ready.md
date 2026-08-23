# F4A — Lote C — SOURCE_READY (Sonnet, writer)

Autoridad: `/private/tmp/f4a-final-conflict-fable.md` (SHA
`f3737fd8ee778b10001e1ac0a9a5314ee708bdf03e5a46ca1550437afdb7a425`), §3 LOTE C
+ challenge `df281104…`. Repo `/Users/daniel/Developer/Rottay/ui-design-system`.

## 0. Estado del repo (post-lote, pre-commit)

- HEAD: `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (intacto, sin commits)
- staged: 0 (`git diff --cached` vacio)
- porcelain: 29 (identico al conteo pre-lote; ningun path nuevo, ningun path
  removido de la lista dirty)
- `git diff --check`: limpio, exit 0 (sin errores de whitespace)
- Nunca se corrio `git add` / `commit` / `push` / `stash` / `checkout` /
  `restore` / `reset`.

## 1. Write-set — exactamente 3 paths (los 3 ya dirty antes del lote)

1. `packages/core/manifest/variant-parity/index.mjs`
2. `packages/core/manifest/variant-parity/index.test.mjs`
3. `packages/core/manifest/generated/variant-parity.json`

Ningun 4to path tocado. Ningun tema, GAT, catalog, roster o roadmap tocado.
Ningun productor corrido salvo el canonico de `variant-parity` (sin causa
adicional).

Delta completa: `/private/tmp/f4a-close-lot-c.diff` (SHA
`1a78716f05acbdae05670dfad88183ca09db843b891093a26b4159c7b8f4d2fb`), calculada
contra el backup pre-lote `/private/tmp/f4a-close-lot-c-backup.Y3Dfka` (los 3
paths autorizados, unico origen del pre-imagen).

### 1a. `index.mjs` — retiro de `baseline` de DOMICILES

`:142` — `DOMICILES = ['seed', 'baseline', 'derived', 'pro-expert',
'unassigned']` -> `['seed', 'derived', 'pro-expert', 'unassigned']`. Una sola
palabra retirada; `:366` deriva el mensaje solo del `.join(' | ')`, sin texto
hardcodeado a actualizar. Ya estaba aplicado al entrar a esta sesion —
verificado, no rehecho.

Pre: SHA `820f47cd062802f8ae17f4cdf4d76f83f3d91e76cc5a3c5c3a98734a98522a03`
Post: SHA `8a3bacf6368e609fec9bcaaed5f0abaa0961c33c1cce5f724f47c2f46f282685`

### 1b. `index.test.mjs` — negativa C-1b + un ajuste de colision no previsto

Ya estaba aplicado al entrar a esta sesion (verificado, no rehecho):
- La aserción del vocabulario cerrado (linea ~87) actualizada a los 4
  domicilios sin `baseline`.
- Negativa C-1b nueva (`test('drill C-1b: ...')`, ~L97-105): un docblock con
  `@domicile baseline` produce exactamente 1 failure, mensaje exacto
  `@domicile desconocido "baseline" (cerrado: seed | derived | pro-expert |
  unassigned)`.

Hallazgo y correccion de ESTA sesion (reportado, no ocultado en el diff): el
test preexistente `drill scope: dos docblocks aplicables a la misma cercania
fallan` (L373-411) usaba `baseline` de forma INCIDENTAL — como segundo
domicilio arbitrario, distinto de `seed`, para probar que dos scopes
DISTINTOS no son ambiguos y que dos docblocks sobre el MISMO const SI lo son.
No tenia relacion con el vocabulario `baseline` en si. Al retirar `baseline`
del vocabulario cerrado, ese test rompio como efecto colateral (nueva
failure "@domicile desconocido" inesperada), lo que hubiera dejado R-1 en
13 fallas en vez de las 12 pactadas. Corregido cambiando el literal
incidental `baseline` -> `derived` en las dos ocurrencias (L384, L402); la
intencion y aserciones del test quedan identicas. Sin este ajuste, el lote
no alcanza la vara `1735/1722/12/1` exigida por la autoridad. No se toco
ningun otro archivo para llegar a este resultado.

Pre: SHA `cdf66adfbca3a9a589b0decfbc602db3838e1ce0f201b66901a17e9fbfb1f86e`
Post: SHA `16cefb15a2df52e64cb3bc744574db8669c2d121bfd282649bc0eed3afdd9e5e`

**Test directo del archivo** (`node --test manifest/variant-parity/index.test.mjs`,
corrido desde `packages/core`): **49/49 pass, 0 fail** (incluye N-C1, la
propia fixture C-1b, en rojo-esperado-y-verde-real).

## 2. Productor canonico — delta SOLO la linea `law`

Comando: `node manifest/variant-parity/index.mjs` (sin flags), desde
`packages/core`. Salida: `variant-parity: generated/variant-parity.json
escrito (2559 slots, 0 pares silenciosos, 3969 pares con placeholder)`.

Delta contra la copia pre-productor (bytes identicos al backup, ver §3):
**exactamente 1 linea**, `:187`:
```
-    "law": "Vocabulario CERRADO: seed | baseline | derived | pro-expert | unassigned. @governor obligatorio, de una linea.",
+    "law": "Vocabulario CERRADO: seed | derived | pro-expert | unassigned. @governor obligatorio, de una linea.",
```

Contadores identicos pre/post (verificado, ninguno se movio):
- `tagRegistry.count`: **4208**
- `ratchet.silentPairs`: **0**
- `ratchet.placeholderPairs`: **3969**
- `ratchet.declaredAbsentPairs`: **53**
- `ratchet.untaggedAuthoredLeaves`: **0**
- `ratchet.divergentSlots`: **33** (informativo)

Pre (backup): SHA `65cdf3418ef9f496867b008f8eb3cf24cf8addb7867d8811d9ba26ed2372146d`
Post: SHA `678d47115c7ed5ff2ffed568047084de6c37a7da36138c347f8a12dd44fe7f04`

## 3. N-C2 — negativa del checker + restore

1. Copia del generado correcto (post-productor) guardada en
   `/private/tmp/f4a-close-lot-c-generated-correct.json`
   (SHA `678d47115c7ed5ff2ffed568047084de6c37a7da36138c347f8a12dd44fe7f04`,
   identica al archivo en el arbol).
2. `generated/variant-parity.json` revertido a bytes pre-productor
   (`cp` desde `/private/tmp/f4a-close-lot-c-pre-producer-copy.json`, SHA
   `65cdf3418ef9f496867b008f8eb3cf24cf8addb7867d8811d9ba26ed2372146d` —
   identica al pre-imagen del backup).
3. `node manifest/variant-parity/index.mjs --check` -> **ROJO** (exit 1):
   `variant-parity FAILED: - generated/variant-parity.json desactualizado —
   corre 'node manifest/variant-parity/index.mjs'`. El checker detecta el
   drift correctamente.
4. Restore: `cp` desde la copia post-productor guardada en el paso 1.
5. Rehash: `shasum -a 256 generated/variant-parity.json` ==
   `678d47115c7ed5ff2ffed568047084de6c37a7da36138c347f8a12dd44fe7f04` ==
   copia guardada. Byte-identico confirmado.
6. `node manifest/variant-parity/index.mjs --check` -> **VERDE** (exit 0):
   `variant-parity OK — 2559 slots (7677 pares), 0 silenciosos, 3969 con
   placeholder, 0 hojas sin tag (4208 tags leidos)`.

## 4. R-1 — una corrida, Node 22, `pnpm test:scripts`

Correccion del DT durante esta sesion: R-1 NO es `npx vitest run` (ese primer
intento fue detenido por timeout, exit 144, cero efecto en el arbol — nunca
escribio nada). La vara real es `pnpm test:scripts` desde `packages/core`,
con Node 22 (`~/.nvm/versions/node/v22.17.0/bin` antepuesto al PATH).

Comando: `pnpm test:scripts` (= `node --test "scripts/**/*.test.mjs"
"manifest/**/*.test.mjs" && node --test
../../scripts/provenance/effect-registry-audit/index.test.mjs && vitest run
--config scripts/vitest.scripts.config.ts`), una sola corrida.

Resultado exacto: **`1735/1722/12/1`** (tests/pass/fail/skip) — coincide
digito a digito con la vara de la autoridad (`1734/1721/12/1` + 1 por la
negativa C-1b nueva = `1735/1722/12/1`).

Failure-set (12, identico al preexistente — ninguna relacionada con
`variant-parity`/`DOMICILES`/`baseline`):
```
CK-H1 tenant-preview floors retain the exact tenant-derived identities
CK-H1 brand-studio floors retain one live swatch and eight domain-object sites
CK-H1 counters cannot fall below their certified identity floors
CK-H1 migration reaches the exact 21/13/0/9 paint floors
CK-H1 pins the post-prohibition rendered topology
a CSS path bound by any family row resolves and still ships
engine audit wires full runtime/fleet censuses and rejects vanished keys
canonical CRA15 source produces deterministic structural evidence without a false completion claim
generated public source and declarations expose only supplier-free component types
committed fleet capability registries equal the productive app sources
default macro roots match the governed graphics and UI taxonomy
every scoped owner and ranked child resolves to a real directory
```

Hash de verificacion (metodo: nombres de failure SIN el prefijo `not ok N -`,
orden ALFABETICO ascendente, unidos por `\n` con newline final, sha256):
`4d6eda2dfbcaad2108b7341cad319160fcf47e7c048d59621170d55cf222cf5a` — **los
primeros 8 hex coinciden exactamente con `4d6eda2d…`** citado por la
autoridad. Fingerprint confirmado byte-exacto.

Log completo: `/private/tmp/f4a-close-lot-c-r1-testscripts.log`.

## 5. `gates:ci` — una corrida

Comando: `pnpm gates:ci` (= `node scripts/ci/runner/index.mjs`), Node 22, una
sola corrida, secuencial despues de R-1.

Resultado: **`ci-gates OK — 89 blocking gate(s) passed`**, con **2 SKIP
(excluded)**: `channel-liveness` y `lane-control-drills` — ambos con owner
citado (F4A/F4B + F2-asymmetric, sequence amendment 2026-08-20), identicos a
los 2 excluded preexistentes. **89 + 2**, exacto.

Ningun otro productor corrio como efecto lateral: `git status --porcelain`
post-gates sigue en 29, mismos 29 paths, staged 0. Ningun tema, GAT, catalog,
roster o roadmap se toco ni se reselló.

Log completo: `/private/tmp/f4a-close-lot-c-gatesci.log`.

## 6. Cierre de sesion

STOPs de la autoridad — ninguno se disparo:
- path 4.º: no.
- contador de pares/registry se movio: no (4208/0/3969/53/0/33 identicos
  pre/post-productor).
- un tema, GAT, catalogo o roster tocado: no.
- canon != 89+2: no (89+2 exacto).
- R-1 != `1735/1722/12/1`: no (exacto, failure-set y hash identicos).
- retiro adicional de vocabulario: no (solo `baseline`, el unico autorizado).

**SOURCE_READY.** Sonnet queda idle. Espera postaudit Fable unico (sin GAT) y
el asiento de cierre del DT — no se declara F4A_CLOSE desde este actor.
