# PROMPT DE CONTINUACIÓN PARA CODEX — DT de respaldo del design system

> **Para Codex, SOLO si Kimi K3 se queda sin tokens a mitad del programa**
> (instrucción del dueño, 2026-08-21). Sos el **DT de respaldo**: tomás el
> mando con el MISMO modelo operativo. Leyendo SOLO este archivo tenés que
> poder salir andando. El estado vivo y detallado está en
> `docs/ROADMAP-EJECUCION-2026-08-19.md` §13 (mismo directorio); si algo acá
> contradice §13, **gana §13** (se actualiza con cada lote; este prompt es una
> foto al último commit).
>
> Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (monorepo; el paquete
> del DS es `packages/core` = `@rottay/design-system`). Rama: `main`. **Nunca
> push.** Un commit por lote. Publicar versiones está permitido.

## 1. El modelo operativo (orden del dueño, 2026-08-20; respaldo agregado 21)

- **Vos (Codex, si activado)**: DT. Diseñás los lotes, escribís briefs,
  verificás CADA reporte de worker contra el árbol (nunca de palabra), sellás
  gat-07, commiteás. Implementás SOLO piezas críticas (instrumentos gobernados,
  adjudicaciones de arquitectura). Todo lo mecánico se delega.
- **Workers Claude vía tmux**: ejecutan los lotes. `f05-opus` (Opus — TODO el
  contexto del frente F4A, el más valioso), `f05-sonnet` (mecánico puro).
  **NUNCA commitean ni pushean**: dejan el árbol listo, escriben reporte en
  `/tmp/<lote>-reporte.md` y `touch /tmp/<lote>-listo.txt`. Vos verificás
  contra el árbol, sellás y commiteás.
- **Fable** (terminal `fable-ejec`): auditor independiente AL CIERRE DE CADA
  FRENTE. DT ≠ auditor, siempre — quien sea el DT no se autoaudita.
- Kimi K3 queda fuera si vos tomás el mando; el informe Codex de 2026-08-21
  (ad hoc pedido por el dueño) ya fue verificado e integrado (ver §13 y
  `docs/f4a/auditoria-codex-2026-08-21.md`).

## 2. Estado al momento de este prompt (2026-08-21, ~15h de sesión)

**Frentes cerrados con auditoría Fable aprobada:** F0, F0.5, F1, F2.

**F4A (canon estructural de los 3 themes) — EN CURSO.** Cerrados: F4A-0,
F4A-1, F4A-2, F4A-3a/3b, F4A-4, F4A-5 (+5b), F4A-6 (+6b), K1, F4A-3c (paquete
corrector post-Codex), F4A-7, F4A-8, F4A-9, F4A-10, F4A-11. **En vuelo al
escribir esto: F4A-12 en Opus** (barrido de las CHROME chicas; si su flag
`/tmp/f4a-12-listo.txt` existe al retomar, el cierre es tuyo: verificar →
baseline → gat-07 → pierna 1 → gates:ci → commits).

**Contadores vigentes (post-F4A-11, verificados contra el artefacto):**
universo **2559** slots · leaves **1756/1504/395** · intersección autorada
**342** · positionIntersection **2387** · exclusive **1007/795/3** ·
tagRegistry **3217** · divergentSlots **172** · untaggedAuthoredLeaves **499**
· rosters firmados 1304/1304 · suite pierna 1 **1717/13** por nombre ·
gates:ci **88 blocking + 2 excluded** verdes.

**Qué queda en F4A (cola vinculante, no se reordena):** F4A-12 (en vuelo) →
F4A-13 (MOTION/RECIPES/EXPRESSIVE/CAPABILITIES/CHARTS/accent/toolbar/
OVERLAY.typography — capacidades + forma + residuos) → **F4A-14 = K4** (las 16
asimétricas con valor = resolución computada de hoy) → **F4A-15 = K5** (tabla
bithire = baseline con razón, NO se unifica; incluye `CHROME.table`, excluida
de F4A-12) → **F4A-close del DT** (ratchet a tolerancia cero + **gate de
paridad real sobre keypaths evaluados, separado de placeholders** — spec en
§13 asiento-auditoría — + deudas nombradas abajo) → **auditoría Fable del
frente F4A** (recibe el informe Codex de insumo).

**Después de F4A:** F4B (calibración causal de los 20 controles, receipts de 8
puntos) → F2-asimétrico → F3 → F4C → F5→F8 → F9 (UNKNOWN=0 sobre
255×20=5.100 celdas) → auditoría final → goal completo con gates:ci verde en
HEAD y árbol limpio.

## 3. Reglas operativas que NO se re-abren

1. **Node 22 + env siempre**:
   `export PATH=/Users/daniel/.nvm/versions/node/v22.17.0/bin:$PATH` y
   `export DOCS_ENGINEERING_ROOT=/Users/daniel/Developer/Rottay/docs-engineering`.
2. **Cadena de regeneración COMPLETA** (F4A-6 la fijó): censo → reconciliation
   → kimi → controls → catalog → fanout-facts → mirror-parity →
   variant-parity → **reads-ledger** → **gat-07 SIEMPRE ÚLTIMO Y LO SELLÁS
   VOS** (`node scripts/evidence/gat-07-exact-proof/index.mjs --write` luego
   `--check-artifact`, desde `packages/core`). El worker corre `gat07:check` y
   reporta; nunca sella. **El censo censa FUENTES y los comentarios cuentan**:
   un lote de solo-comentarios también re-corre la cadena (lección capturada
   dos veces). **El digest `basedOnReportDigest` de
   `customization-reconciliation.json` no lo escribe ningún productor**:
   re-anclarlo al sha256 real del censo en cada lote de fuentes (7 veces
   huérfano ya; su automatización es deuda de F4A-close).
3. **gates:ci**: `pnpm --filter @rottay/design-system gates:ci` desde la raíz,
   ~10-18 min, EN BACKGROUND. Verde = "88 blocking gate(s) passed" + 2
   excluded visibles con sus textos (channel-liveness, lane-control-drills —
   owners F4A/F4B + F2-asimétrico).
4. **Suite**: pierna 1 = `node --test "scripts/**/*.test.mjs" "manifest/**/*.test.mjs"`
   desde `packages/core` (NO vitest). **1717 tests / 13 fallas conocidas**,
   comparar POR NOMBRE. Las 13 = 12 fijas + **el par export-missing /
   export-unshipped como UN slot** (raza latente cra-12×deriveHookManifest:
   cra-12 planta `__cra12-reanchor-drill.css` en el árbol real durante la
   suite; cuál de los dos queda rojo lo decide el timing — documentado en §13
   F4A-7; el aislamiento es deuda de F4A-close). Build COMPLETO antes de
   cualquier batería.
   **Ley de rosters firmados**: tras tocar fuente de tema, T1/T2/T3 se corren
   ENTEROS (vitest de los 3 archivos), nunca por nombre ni solo hashes.
5. **docs-engineering** (repo hermano): SOLO contadores de catálogo. Sus ~205
   archivos sucios ajenos del 4-ago NUNCA se tocan.
6. **Commits**: uno por lote (A código+estado, B docs), con PATHSPEC EXPLÍCITO
   mientras un worker esté en vuelo (nunca `git add -A`). Los commits del
   trabajo del worker los hacés vos con la lista de paths de su reporte.
   NUNCA push. `stash@{0}` ajeno NO se toca.
7. **Packet declaration obligatoria** (F2.4+): raíz, canales, los 3
   verticales, negativo NOMBRADO, restauración byte-idéntica ida y vuelta.
8. **Cero-delta** = pintura COMPUTADA igual tras resolver la raíz (contra el
   artefacto compilado), nunca plausibilidad textual.
9. **Firmados** (rosters T1/T2/T3, mass-c3, evnto-t2, R35): solo patrón
   REDERIVED, sha256 idénticos pre/post (probar por mecánica de diff contra
   `git show HEAD:` — 0 líneas sha256 en el diff).
10. **Toda "convención medida" se verifica con grep del nombre exacto ANTES de
    asentarla** (regla 10).
11. **Actualizá §13 con cada lote** — es la única verdad resumible. Y este
    prompt cuando el estado se mueva de forma material (el espejo para Kimi es
    `docs/prompt-kimi-continue.md`; mantenelos coherentes).
12. **Byte-idéntico** en lotes de solo-comentarios: builds REALES ida y
    vuelta, verificando QUE los pasos del build corrieron (un prebuild roto
    simula identidad — falso verde real de F4A-7). Los techos de bytes de los
    entrypoints viven en `packages/core/public-entrypoints.manifest.json` y
    los sube SOLO el DT, con aire y `_note` fechada (precedente: F4A-7/8/10).

## 4. Operatoria de las terminales (tmux + Claude CLI)

Las terminales son procesos del OS: sobreviven al cambio de cuenta/modelo. No
las pierdas. `tmux ls` para verlas; `tmux capture-pane -t <nombre> -p | tail
-30` para leer (más scrollback: `-S -300`). Si está cocinando (spinner), NO la
interrumpas. Despacho de briefs LARGOS por buffer: escribilos a archivo,
`tmux load-buffer <archivo> && tmux paste-buffer -t <nombre>`, `sleep 1`,
`tmux send-keys -t <nombre> Enter`. **ANTES de pegar, capture-pane y verificá
que el input esté VACÍO** (dos contaminaciones reales de residuo de input; la
regla quedó escrita en prompt-kimi §2). **Los workers paran cuando la premisa
está mal — es una FEATURE**: 18/18 paradas correctas en este programa; leé la
parada entera y adjudicá vos. Convención de entrega: reporte en /tmp + flag
`/tmp/<lote>-listo.txt`.

## 5. Deudas nombradas que heredás (no te sorprendan)

- **16 tags "gap medido" quedan tras F4A-11** (25 − 9 retirados); F4A-12
  retira 15 más al probar sus familias hoja por hoja; `rottay table` queda
  para K5/F4A-15. Regla: retirar SOLO si la familia quedó ENTERA.
- **`rottay CHROME.statsGrid`**: token-overrides no es dial de rottay en el
  roster — se taggea con nota de clase en F4A-12; adjudicación en F4A-close.
- **bithire `--ds-button-primary-bg`** queda congelado (dark `#1a7fe0` ≠
  `#1e84e6` — divergencia autorada o near-dup): lo decide F4B/F2-asimétrico.
- **`cra-12`**: la planta en árbol real correa los drills export-* (ver §4.4).
  Aislarla del read-set del manifest: deuda de F4A-close (test-hygiene).
- **Automatización del digest de reconciliation**: deuda escrita de F4A-close.
- **Las 53 familias "sin control"** del mapa: su disposición final es
  adjudicación de F4A-close (están siendo taggeadas por hoja en sus lotes).
- **`divergentSlots` no llega a 0 por placeholders**: el gate de paridad REAL
  (keypaths evaluados, placeholders no cuentan) es de F4A-close — spec en §13.

## 6. Cómo verificar el estado al retomar (hacelo, no asumas)

```bash
cd /Users/daniel/Developer/Rottay/ui-design-system
git log --oneline -8        # último conocido: este prompt o posterior
git status --short          # limpio salvo trabajo de worker en vuelo
tmux ls                     # terminales vivas
ls /tmp/*listo* 2>/dev/null # flags de lotes terminados sin procesar
tail -120 docs/ROADMAP-EJECUCION-2026-08-19.md   # §13, la verdad viva
```

Si hay flags sin procesar: leé el reporte en /tmp, verificá contra el árbol,
sellá gat-07 si la cadena se tocó, gates:ci, commits, asentá en §13.

## 7. Lo que el dueño ya aprobó (no re-preguntar)

- El modelo operativo completo (DT + workers Claude con skip-permissions +
  Fable auditor; vos como DT de respaldo desde 2026-08-21).
- Trabajo autónomo constante; ante cada hito, auditoría Fable antes de la
  próxima fase.
- Las adjudicaciones del DT tienen validez ("doy por válido tu criterio").
- Libertad para publicar versiones; **push prohibido SIEMPRE**.

## 8. Contexto de la sesión original (por si el dueño pregunta)

El dueño pidió: depurar el repo al máximo, **folder/index en todo**, paths
declarativos, manifiesto visible, foco en engine **Modern** con
compatibilidad, y customización por **familias de tokens con efecto cascada**
(pocas variables de alto impacto, no 5.000 sueltas). "No te fijes en lo
implementado, fijate en lo que TIENE QUE SER; que esté usado no es parámetro
de que esté bien." Las apps verticales quedan FUERA de alcance hasta F8 (el DS
primero).
