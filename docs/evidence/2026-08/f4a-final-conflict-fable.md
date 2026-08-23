# F4A — Arbitraje final de cierre (Fable 5, READ-ONLY, vinculante)

**HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · staged 0 · porcelain 29 · Kimi fuera · cero writes/tests/build/producers (sólo lectura y sondas en memoria). Autoridades recomputadas exactas: Opus `804870d0…` (`F4A_CLOSE_READY`) · mi challenge `df281104…` · ACCEPTs A (`fe593863…`) y B (`06a624a2…`) · roadmap vivo leído en :655-663 y :698-703.

---

# VERDICT: F4A_KEEP_OPEN — por exactamente UNA obligación implementable (retiro de `baseline`), con lote C mínimo definido abajo. Todo lo demás queda adjudicado AQUÍ y cierra con el asiento.

El ledger vivo (:659-663) dice **"Pertenecen a F4A-close"** sobre cuatro deudas y **no existe ninguna transferencia DT durable** que lo supersede — la fila "dueño/fase" de Opus §4 es etiqueta, no transferencia, y queda **rechazada como acto de cierre**. Pero tres de las cuatro se resuelven hoy por adjudicación medida o ya estaban resueltas; sólo una exige escritura.

## 1. Los cuatro conflictos, decididos sin promediar

**C-1a · 3 canales muertos — RESUELTA HOY por adjudicación medida, cero escritura.** Medido en vivo: `--ds-table-filter-row-bg` → **1 lector, rustic** `skin/table.css` (0 modern/classic, 0 default) · `--ds-table-filter-focus-shadow` → **1 lector, rustic** (0/0) · `--ds-table-loading-overlay-bg` → **2 lectores rustic** (`data-table.css`, `table.css`) **+ 1 emisión default** `default.css:1723`. "Muertos" era una medición Modern-scoped: **globalmente están VIVOS para el engine rustic**, y las emisiones de tema les llegan. **Disposición: compatibility-vivo — NO se retira ninguno, cero estética, cero lote.** El inventario de emisiones default que exigía P2-4 queda satisfecho para este trío: **0/0/1**. El asiento corrige la prosa de K5 ("3 emitidos muertos" → "muertos en Modern, vivos en rustic").

**C-1b · retirar `baseline` de `DOMICILES` — BLOQUEA; única obligación abierta.** Medido: `DOMICILES` aún lo contiene (`index.mjs:142`), **0 usos** en los 3 temas, y el generado lo ecoa una vez (`variant-parity.json:187`, la línea `law` del vocabulario). El ledger lo asigna a F4A-close; sin transferencia durable, se hace, no se etiqueta. → **Lote C** (§3).

**C-1c · sidecar `semantic-groups` — NO bloquea: la transferencia YA está escrita.** La propia entrada del ledger (:660-663) lleva condición falsable ("activable sólo si algún tema autora `chrome.<familia>.anatomy`; medido hoy 0/0/0") — eso ES una transferencia explícita con gatillo medible, a diferencia de las otras. Se ratifica tal cual. (El primer ítem de :657, `evnto × border`, ya se resolvió en paridad como `@absent` — el asiento lo marca.)

**C-2 · `basedOnReportDigest` — CERRADA.** La obligación (:1485, "la automatización ya es deuda escrita") queda cumplida en sustancia: el gate bloqueante tokens-catalog **valida fail-closed** (`catalog/index.mjs:1186`: `recon.basedOnReportDigest !== reportDigest` → failure "reconciliation digest mismatch… regenerate both"), el drill `recon-digest` está **testeado** (`catalog-gate.test.mjs:103`), y el camino de regeneración automática existe (`tokens:catalog:write` — su prohibición en los lotes fue perímetro quirúrgico S-8, no ausencia de maquinaria). El digest ya no puede quedar huérfano en silencio. PASS con este mecanismo nombrado en el asiento — no "PASS por re-anclaje" (el re-anclaje manual por sí solo NO habría cumplido).

**C-3 · C-6 Evnto preset canónico — subsunción VÁLIDA pero cita colgante; requisito de asiento, no blocker.** :701 dice "salvo subsunción DT citada" sin destino resoluble. La medición que la subsume existe y es verificable: **F4A-12 reconcilió las 845 ausencias una por una, todas piso, cero overlay/preset** (asiento :1373-1374) — evnto NO compone desde preset; la clase se disuelve por medición. **El asiento de cierre DEBE citar exactamente eso.** Sin la cita, el cierre no se asienta.

## 2. Tabla 14 (ratifico la de Opus con dos correcciones de base)

Filas 1-8, 10-13: **PASS ratificadas** (sus evidencias coinciden con mis postaudits A/B y mediciones de hoy; la cerca §2 de Opus verificada en vivo por mí en el postaudit A). Fila **9**: PASS **con base corregida** — cumple por el guard fail-closed + drill + write-path (C-2), no por el re-anclaje manual. Fila **14**: PASS **condicionada a la cita** de C-3 en el asiento. La vara R-1 vigente es `1734/1721/12/1` (corrección de Opus, exacta) y pasará a **`1735/1722/12/1`** con el lote C.

## 3. LOTE C — el mínimo exacto (un solo lote sustantivo; nada más queda)

**Write-set (3 paths, los tres ya dirty; porcelain queda en 29):**
1. `manifest/variant-parity/index.mjs` — `:142`: `DOMICILES = ['seed', 'derived', 'pro-expert', 'unassigned']` (una palabra retirada; el mensaje `:366` deriva solo del join).
2. `manifest/variant-parity/index.test.mjs` — **una** negativa: docblock con `@domicile baseline` ⇒ failure exacto `@domicile desconocido "baseline" (cerrado: seed | derived | pro-expert | unassigned)`.
3. `manifest/generated/variant-parity.json` — productor; **delta esperado: SÓLO la línea `law` del vocabulario (:187)**; contadores idénticos.

**Operativos byte-idénticos (se verifican, NO se corren productores sin causa):** `variant-parity.baseline.json` (pines 0/3969/0 quietos) · fanout/checklists/mirror/census/recon/preservation/README (sin causa: cero cambio de temas) · GAT (temas intactos — no se resella) · los 3 temas · catalog/index/roster.

**Contadores esperados:** registry **4208** · `0 / 3969 / 53 / 0` · divergent 33 informativo · **R-1 una corrida: `1735/1722/12/1`** (+1 negativa; 12 fallas por hash `4d6eda2d…`, skip 1 — nueva vara declarada, sin re-ancla) · `gates:ci` una corrida: **89 + 2**.

**Negativas:** N-C1 = la propia fixture (baseline ⇒ rojo con el mensaje exacto) · N-C2 = revertir el generado ⇒ `--check` rojo ⇒ restore `cp`+rehash.
**STOPs:** path 4.º · cualquier contador de pares/registry se mueve · un tema, GAT, catálogo o roster tocado · canon ≠ 89+2 · R-1 ≠ `1735/1722/12/1` · cualquier retiro adicional de vocabulario.

**Próximo actor: Sonnet** (writer del lote C, este memo + challenge `df281104…` como autoridad) → **postaudit Fable único** (sin GAT) → **F4A_CLOSE** y asiento del DT.

## 4. Requisitos del asiento de cierre (vinculantes, con el CLOSE)

1. `evnto × border`: resuelta en paridad (`@absent`). 2. **3 canales: cerrada por adjudicación** (rustic 1/1/2 lectores, default `:1723`; compatibility-vivo; prosa K5 corregida). 3. Sidecar: condición falsable ya escrita (0/0/0), ratificada. 4. `baseline`: cerrada por lote C (receipt del postaudit). 5. **C-6: cita explícita** — subsumida por F4A-12 (845 ausencias todas piso, cero overlay/preset, medido). 6. Obligación 9: cerrada por guard `catalog:1186` + drill testeado + `tokens:catalog:write`. 7. Vara R-1 nueva `1735/1722/12/1`. 8. Próxima fase **PRE_F4B** con **F4B bloqueado hasta gate falsable de cascade** (Opus §5, ratificado). Deudas PRE_F4B/F4B/F9 restantes con dueño (PAINT_DENOMINATOR con build permitido y prohibición de pinear 3661/1918/1823; C-7; UNKNOWN 5100 = F9).

---

Cero writes; HEAD/staged/porcelain intactos; writer NO despachado. Write-set de la sesión: este memo y su `.ready`.

# VERDICT: F4A_KEEP_OPEN (sólo lote C pendiente; cierre habilitado inmediatamente después de su postaudit + asiento §4)
