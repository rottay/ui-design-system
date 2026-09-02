# F4A-close — Lote C — POSTAUDIT (Fable 5, READ-ONLY, único, sin GAT)

Fecha: 2026-08-22. Repo `/Users/daniel/Developer/Rottay/ui-design-system`.
HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (estable toda la sesión).

Autoridad vinculante, verificada por recomputo:
- `/private/tmp/f4a-final-conflict-fable.md` — SHA-256 recomputado
  `f3737fd8ee778b10001e1ac0a9a5314ee708bdf03e5a46ca1550437afdb7a425` (exacto).
- `/private/tmp/f4a-close-lot-c-sonnet-source-ready.md` — SHA recomputado
  `efce37aadebf3e2787ec8c5376040ace54cf33b98859d85793e202400d6a9eed` == el del `.md.ready`.
- `/private/tmp/f4a-close-lot-c.diff` — SHA recomputado
  `1a78716f05acbdae05670dfad88183ca09db843b891093a26b4159c7b8f4d2fb` == el del `.md.ready`.

Mandato cumplido: cero writes al repo, cero add/commit/push/stash/checkout/restore/reset,
cero build. Única mutación de la sesión: la copia rsync aislada en scratchpad para N-C2
y los artefactos de este postaudit en /private/tmp. Prueba de no-mutación: los 29 paths
dirty hasheados ANTES de mis corridas y DESPUÉS — byte-idénticos los 29
(`/private/tmp/fable-postaudit-c-pre-runs.sha` vs `-post-runs.sha`, diff vacío).

---

## Punto 1 — Delta material exacta en 3 paths, ningún cuarto path: PASS

- Backup pre-lote `/private/tmp/f4a-close-lot-c-backup.Y3Dfka` contiene EXACTAMENTE los
  3 paths autorizados y nada más (find recursivo).
- Pre-imágenes verificadas contra los SHAs del reporte de Sonnet, los tres exactos:
  `index.mjs` `820f47cd…`, `index.test.mjs` `cdf66adf…`, `variant-parity.json` `65cdf341…`.
- Post-imágenes en árbol, los tres exactos: `8a3bacf6…`, `16cefb15…`, `678d4711…`.
- Delta recomputada por mí (diff -u backup→árbol, los 3 paths): las líneas materiales
  son IDÉNTICAS una a una a las del diff publicado. Ningún hunk adicional.
- Cuarto path: barrido de mtimes de los 29 dirty. Todo el conjunto queda FUERA de la
  ventana del lote (01:03–01:23) salvo los 3 del write-set y UNA anomalía:
  `packages/core/manifest/cascade/root-catalog.json` mtime 01:21:27 (durante el
  gates:ci de Sonnet). ADJUDICADA con causa raíz medida: el gate `root-exposure-drill`
  (`gates-manifest/index.mjs:500`) corre `root-exposure-gate/index.test.mjs`, que
  planta una mutación EN EL CATÁLOGO REAL y lo restaura SIEMPRE en `finally` con los
  bytes originales capturados (`index.test.mjs:26-35`). Confirmación empírica en mi
  propia corrida de gates:ci: hash de `root-catalog.json` ANTES == DESPUÉS
  (`6a0e68de3789a5c7b5751582cd485d42b8d71861bc014b7be4a585c04a963e9a`) con el mtime
  bumpeado de nuevo (01:41:02). El drill es byte-neutral; la anomalía de Sonnet es
  mtime-only, no delta material. El freshness-gate (`root-catalog-freshness-gate`)
  solo lee; el drill f0-honesty escribe solo en árboles sintéticos mkdtemp — descartados
  ambos como escritores. NO hay cuarto path material.

## Punto 2 — DOMICILES exacto: PASS

`manifest/variant-parity/index.mjs:142`:
`export const DOMICILES = ['seed', 'derived', 'pro-expert', 'unassigned'];` — exacto.
El mensaje de fallo (`:365-366`) deriva SOLO de `DOMICILES.join(' | ')`, sin texto
hardcodeado; el retiro es de una palabra, como ordena §3.1 de la autoridad.

## Punto 3 — Negativa `@domicile baseline` por vocabulario cerrado: PASS

Drill C-1b en `index.test.mjs:97-105`: docblock con `@domicile baseline` ⇒ exactamente
1 failure con el mensaje EXACTO exigido:
`@domicile desconocido "baseline" (cerrado: seed | derived | pro-expert | unassigned)`.
Corrido por mí (test directo, ver punto 8): en verde-real con la aserción en rojo-esperado.
N-C1 satisfecha.

## Punto 4 — Fixtures de colisión `baseline`→`derived` sin cambiar el propósito: PASS

Verificado contra el backup: pre-lote las dos ocurrencias incidentales estaban en
líneas 367 y 385; post-lote en 384 y 402 (corrimiento +17 por el drill C-1b insertado
antes — aritmética exacta). El test (`drill scope: dos docblocks aplicables a la misma
cercania fallan`) conserva ÍNTEGRAS sus dos aserciones: (i) dos scopes DISTINTOS
(`seed` en PALETTE, `derived` en PALETTE2) ⇒ 0 failures; (ii) dos docblocks sobre el
MISMO const ⇒ `alcance ambiguo`. `derived` cumple el rol de "segundo domicilio
arbitrario distinto de seed" idéntico al que cumplía `baseline`. Sin este ajuste la
vara R-1 habría quedado en 13 fallas; el ajuste fue reportado, no ocultado, y cae
dentro del path 2 del write-set. Legítimo.

## Punto 5 — Generated cambia SOLO la ley del vocabulario: PASS

Delta recomputada backup→árbol de `manifest/generated/variant-parity.json`:
exactamente 1 línea (la `law` de `tagRegistry`, línea 187), vieja con `baseline`,
nueva sin él. Ningún otro byte. La copia pre-productor de Sonnet
(`f4a-close-lot-c-pre-producer-copy.json`) es byte-idéntica al backup (`65cdf341…`) y
la copia post (`-generated-correct.json`) es byte-idéntica al árbol (`678d4711…`).

## Punto 6 — 0 usos vivos, contadores quietos, temas byte-idénticos: PASS

- `@domicile baseline` a nivel REPO (excluidos node_modules/.git): únicos hits son el
  propio drill C-1b (nombre del test + argumento del replace) y dos ecos de PROSA en
  docs (`docs/f4a/adjudicaciones-parte3.md:15`, histórico; y ver hallazgo P2 abajo).
  Cero docblocks vivos en fuentes; cero en los 3 temas.
- Contadores leídos del generated: tagRegistry.count **4208**, silentPairs **0**,
  placeholderPairs **3969**, declaredAbsentPairs **53**, untaggedAuthoredLeaves **0**,
  divergentSlots **33** (informativo) — exactos contra §3 de la autoridad.
- Pines del baseline (`baseline/index.json`): 0 / 3969 / 0 quietos,
  divergentSlots 33 informativo — archivo con mtime 2026-08-21 23:07, fuera de la
  ventana del lote: NO tocado.
- Temas: los 3 `brand-themes/*/index.ts` con mtimes 00:04–00:08 (pre-lote) — ni
  siquiera tocados, byte-identidad trivial. GAT (00:23), roster (00:38),
  manifest/index.json (00:36), catalog/reconciliation (00:06), roadmap (21-ago) —
  todos pre-lote. dist/ del 21-ago 13:02: CERO build.

## Punto 7 — N-C2 (revert generated ⇒ rojo; restore ⇒ verde): PASS

Ejecutada POR MÍ en copia aislada (rsync completo de `packages/core` sin
node_modules/dist al scratchpad; el checker solo importa node builtins +
`../mirror-parity/index.mjs`, resolución por findPackageRoot — la copia es válida):
1. `--check` estado correcto: VERDE exit 0 — `variant-parity OK — 2559 slots
   (7677 pares), 0 silenciosos, 3969 con placeholder, 0 hojas sin tag (4208 tags leidos)`.
2. cp pre-productor sobre generated ⇒ `--check` ROJO exit 1 —
   `generated/variant-parity.json desactualizado — corre 'node manifest/variant-parity/index.mjs'`.
3. Restore desde la copia correcta ⇒ rehash `678d4711…` byte-idéntico ⇒ `--check`
   VERDE exit 0.
El árbol real jamás fue tocado (mandato read-only intacto; snapshot de 29 lo prueba).

## Punto 8 — Test directo, R-1, CI (corridas MÍAS, no delegadas al log de Sonnet): PASS

- Test directo (`node --test manifest/variant-parity/index.test.mjs`, Node 22):
  **49/49 pass, 0 fail, 0 skip**.
- R-1 (`pnpm test:scripts`, Node 22, UNA corrida, log
  `/private/tmp/f4a-close-lot-c-fable-r1.log`): **1735 / 1722 / 12 / 1** exacto.
  12 `not ok`; fingerprint del failure-set (nombres sin prefijo, orden alfabético,
  join \n, sha256): `4d6eda2dfbcaad2108b7341cad319160fcf47e7c048d59621170d55cf222cf5a`
  — IDÉNTICO al de la autoridad y al del log de Sonnet (que además recomputé del log
  ajeno con mi propio método: mismo hash). Mismo failure-set, ninguna falla
  relacionada con variant-parity/DOMICILES/baseline. La vara nueva
  `1735/1722/12/1` = vieja `1734/1721/12/1` + 1 negativa C-1b: aritmética exacta
  (conteo de tests del archivo 70→71 en el fuente, +1).
- `gates:ci` (Node 22, UNA corrida, log `/private/tmp/f4a-close-lot-c-fable-gatesci.log`):
  exit 0, **`ci-gates OK — 89 blocking gate(s) passed`**, y exactamente **2 SKIP
  excluded**: `channel-liveness` y `lane-control-drills`, ambos con owner citado —
  **89+2 exacto**, idéntico al preexistente.

## Punto 9 — Estado git y perímetro: PASS

Al cierre de la sesión de postaudit: HEAD `9d5582dfd…` (idéntico al del arbitraje y
al del SOURCE_READY; cero commits), staged **0**, porcelain **29** (los mismos 29 M,
ningún path nuevo/removido), `git diff --check` VERDE. Cero GAT resellado, cero temas,
cero catálogo, cero roster, cero roadmap, cero build. Mis dos corridas (R-1 +
gates:ci) dejaron los 29 paths byte-idénticos (snapshot pre/post, diff vacío).

STOPs de la autoridad — ninguno disparado: sin 4.º path material; contadores
4208/0/3969/53/0/33 quietos; nada de temas/GAT/catálogo/roster; canon 89+2 exacto;
R-1 exacta; ningún retiro adicional de vocabulario.

---

## Hallazgos menores (P2, para el asiento del DT — NO bloquean el lote)

1. `GOVERNOR_CLASS.baseline: 'razon-falsable'` sigue en `index.mjs:149`. Residuo
   INERTE: el mapa es reporta-no-bloquea y la clave es inalcanzable (el vocabulario
   cerrado falla antes). Retirarlo habría sido un cuarto edit fuera del write-set y
   rozaba el STOP de "retiro adicional de vocabulario" — Sonnet hizo bien en NO
   tocarlo. Que el asiento lo registre como residuo a drenar con causa futura.
2. `docs/f4a/esquema-asignacion.md:18` (committeado, fuera del write-set) aún
   enumera la gramática con 5 domicilios (`seed | baseline | derived | pro-expert |
   unassigned`) — eco documental stale del vocabulario viejo. Corresponde al asiento
   documental del cierre, no al lote.
3. `adjudicaciones-parte3.md:15` menciona `@domicile baseline` como plan histórico de
   F4A-15 — prosa histórica, se conserva como está (los reportes históricos no se
   reescriben).

---

# VERDICT: ACCEPT

El Lote C cumple ÍNTEGRAMENTE el §3 del arbitraje final: write-set exacto de 3 paths,
retiro de una sola palabra, negativa C-1b con mensaje exacto, generated con delta de
una línea, contadores y pines quietos, N-C1 y N-C2 verdes, R-1 en la vara nueva
`1735/1722/12/1` con el mismo failure-set (`4d6eda2d…`), canon `89+2`, perímetro
intacto y cero efectos laterales materiales (la única anomalía de mtime adjudicada a
maquinaria sancionada byte-neutral).

**Declaración sobre la obligación:** la obligación C-1b (retiro de `baseline` del
vocabulario cerrado) — la ÚNICA que mantenía F4A_KEEP_OPEN según mi arbitraje final —
queda **CERRADA** con este postaudit como receipt (§4.4 del arbitraje).

**Declaración sobre el cierre de F4A:** conforme a mi arbitraje final
(`f3737fd8…`, §3 último párrafo y §4), con este ACCEPT **F4A PUEDE CERRAR**. El
F4A_CLOSE queda habilitado INMEDIATAMENTE y lo declara el DT con el asiento de cierre,
que debe cumplir los 8 requisitos vinculantes del §4 — en particular: la cita
explícita de C-6 (F4A-12, 845 ausencias todas piso, cero overlay/preset), la
corrección de prosa K5 (3 canales "muertos en Modern, vivos en rustic",
compatibility-vivo), la base corregida de la obligación 9 (guard `catalog:1186` +
drill + `tokens:catalog:write`), la vara R-1 nueva `1735/1722/12/1`, la ratificación
del sidecar con su condición falsable 0/0/0, `evnto × border` como `@absent`, el
receipt de este lote, y la fase siguiente PRE_F4B con F4B bloqueado hasta el gate
falsable de cascade. Recomiendo incorporar los 3 hallazgos P2 de arriba al asiento.

Este postaudit NO declara F4A_CLOSE por sí mismo (ese acto es del DT), pero certifica
que ya no queda ninguna obligación implementable abierta que lo impida.

Artefactos de esta sesión (write-set completo, todo en /private/tmp + scratchpad):
este memo, su `.ready`, `f4a-close-lot-c-fable-r1.log`,
`f4a-close-lot-c-fable-gatesci.log`, `fable-postaudit-c-{pre,post}-runs.sha`,
`fable-postaudit-c-rootcat-pre.sha`, y la copia aislada N-C2 en scratchpad.

Fable queda idle.
