# PROMPT DE CONTINUACIÓN — DT del roadmap de remediación del design system

> Para un agente Kimi (K3, esfuerzo máximo) que retoma el trabajo de DT/coordinador
> desde otra cuenta. Leé este documento entero antes de tocar nada. El estado vivo
> está en `docs/ROADMAP-EJECUCION-2026-08-19.md` §13 (mismo directorio que este
> archivo). Si algo acá contradice el roadmap §13, **gana §13** (se actualiza con
> cada lote; este prompt es una foto).

## 1. Quién sos y cuál es el modelo operativo (orden del dueño, 2026-08-20)

Sos el **DT/coordinador** del programa. La identidad vigente, ordenada por el
dueño en esta sesión y registrada en la enmienda de secuencia (roadmap §12,
decisión 13):

- **Vos (Kimi K3)**: DT. Diseñás los lotes, escribís briefs, verificás CADA
  reporte de worker contra el árbol (nunca de palabra), sellás gat-07,
  commiteás. Implementás SOLO piezas críticas (constitución, gates-manifest,
  adjudicaciones). **Nunca push.** Publicar versiones está permitido.
- **Workers Claude vía tmux** (terminales `f05-opus`, `f05-sonnet`, etc.):
  ejecutan los lotes mecánicos. Opus para riesgo alto, Sonnet para mecánico
  puro. Los workers NUNCA commitean ni pushean: dejan el árbol listo, escriben
  su reporte en /tmp y levantan un flag file. Vos verificás, sellás y commiteás.
- **Fable 5** (terminal `fable-ejec`, Claude CLI con modelo fable): auditor
  independiente. Audita AL CIERRE DE CADA FRENTE antes de abrir el siguiente.
  DT ≠ auditor (decisión 13): vos no te auditás a vos mismo.
- Codex ya no está en el loop (seat DT transferido a vos el 2026-08-20).

## 2. Estado al momento de este prompt (2026-08-20, ~28h de sesión)

**Cerrados con auditoría Fable aprobada:** F0 (piso honesto + gobernanza de
versión), F0.5 (ley folder/index + scripts-tree-gate), F1 (vocabulario cerrado
gobernado), F2 (la cascada existe en fuente — 12 canales recableados con
cero-delta computado + restauración probada; veredicto de cierre Fable CIERRE
ACEPTADO, cero discrepancias).

**Ya ejecutado después de la foto anterior (todo commiteado):**

- **F4A-0 ✅** — medición pre-rewrite, 7 predicciones falsifican EXACTO, 5 no
  falsifican y se adjudicaron en F4A-1 (commit `4d25db448` lo registra).
- **F4A-1 diseño ✅ (MÍO)** — 5 adjudicaciones definicionales + esquema (tags
  JSDoc `@domicile`/`@governor` en fuente, parseables, artefacto
  byte-idéntico) + 6 nudos + parte 3 (commit `c20e16a35`).
- **Reconciliación de identidad (decisión 13) ✅ — commit `85d0583b9`.**
  Incluye el fix MÍO a `manifest/generator/index.test.mjs` (drill
  producer=approver ahora usa la constante `SIGHTED_APPROVER`): era un gate
  que el worker no corrió; gates:ci lo pescó rojo. Moraleja: el argv exacto
  del gate corre AMBOS archivos (`program-check.test.mjs` +
  `manifest/generator/index.test.mjs`); correr uno solo no alcanza.
  gates:ci final: 87 blocking PASS + 2 excluded re-adjudicados.
- **K3 RE-ADJUDICADO (roadmap §13, "K3-REVISADO"):** la premisa original
  (raíz nueva `--ds-color-text-secondary` #A0A0A5) fue FALSADA por el worker
  de roster: el canal ya existía (#B0B0B5 base / #6B6B6B light en rottay,
  262 archivos lectores). Decisión: text-secondary INTACTO; raíz NUEVA
  **`--ds-color-text-page`** (rottay #A0A0A5, 48 literales fuente, cero-delta;
  bithire/evnto: la posture la mide el roster), seed + tenant-dial, cabeza de
  la cadena de tinta de tiers, materialización REDERIVED en F4A-6.

**En vuelo AHORA MISMO (un lote, chequear flag):**

1. **F4A-1c roster en `f05-opus`** — regeneración del roster del esquema con
   la 66ª raíz (text-page) + la medición por tema de bithire/evnto para
   tier.page.fg. Sale: `/tmp/f4a-1c-roster-draft.json` + `.md`
   (schemaVersion 3), flag `/tmp/f4a-1c-listo.txt`. Universo esperado: 66
   raíces × 3 temas (o el mixto medido — el worker declara el total falsable
   y su descomposición). El borrador anterior (schemaVersion 2, 195 limpio)
   ya tenía: posture por tema (authored/unassigned), `color.border` raíz
   autora #2 fuera del eje de tiers, baseline/pro-expert = 0 a nivel raíz con
   nota de nivel. **Vos verificás conteos contra el JSON (nunca de palabra)**
   y cerrás F4A-1 en §13.

**Cuando aterrice:** cierre de F4A-1 en §13 → **F4A-2** (harness de paridad
estructural blocking; primera sub-decisión: extender
`manifest/mirror-parity/index.mjs` vs productor hermano — extender es el diff
menor, ya tiene sourceSkeleton; si el harness lee `variant-assignments.json`
como gate, fijar su schema primero en `manifest/rules.mjs`) → F4A-3…15 →
F4A-close MÍO → auditoría Fable del frente.

## 3. El roadmap por delante (cola vinculante de la enmienda del dueño)

`F4A → F4B → F2 asimétrico → F3 → F4C → F5 → F6 → F7 → F8 → F9`

- **F4A** (en curso): canon estructural de los 3 themes. Plan completo adoptado
  en §13 (commit 6eb622d78): F4A-0 medición → F4A-1 esquema (TUYO) → F4A-2
  harness de paridad estructural blocking (worker; 87→88 gates, ratchet
  decrease-only desde ~2.268 slots divergentes) → F4A-3 canon de comentarios
  (byte-idéntico) → F4A-4 roster por placeholders (byte-idéntico: evnto +34,
  bithire +17, rottay +10) → F4A-5…15 reescritas por familia ejecutando el
  esquema (nudos: K1/K2→F4A-5 palette, K3→F4A-6 typography, K4→F4A-14
  asimétricas, K5→F4A-15 tabla bithire; firmados solo con patrón REDERIVED) →
  F4A-close TUYO (ratchet a tolerancia cero) → **auditoría Fable del frente**.
- Los 6 nudos ya medidos y adjudicados a F4A/F4B (ver §13 cierre F2): par
  border/border-primary (hermanos; R35 firmado digiere valor crudo; evnto los
  ata al revés), tier.page.fg (43 canales #A0A0A5 — la tinta secundaria no es
  raíz del catálogo, hay que autorarla), descongelar `--ds-color-primary` en
  rottay (libera 6+15), las 22 asimétricas (9 con un tema en cero), H4 bithire
  table-bg/row-bg, las 10 por-crear (materialización → F2-asimétrico/F4B).
- **F4B**: calibración causal de los 20 controles (13 Standard + 7 Pro) con
  receipts de 8 puntos (ver §7 F4B del roadmap).
- **F9** (nuevo, obligatorio): certificación familia×control, UNKNOWN=0 sobre
  255×20=5.100 celdas.

## 4. Reglas operativas que NO se re-abren (aprendidas a los golpes)

1. **Node 22 siempre**: `export PATH=/Users/daniel/.nvm/versions/node/v22.17.0/bin:$PATH`
   y `export DOCS_ENGINEERING_ROOT=/Users/daniel/Developer/Rottay/docs-engineering`.
2. **Cadena de regeneración**: censo → reconciliation → kimi → **controls** →
   catalog → **gat-07 SIEMPRE ÚLTIMO Y LO SELLÁS VOS**
   (`node scripts/evidence/gat-07-exact-proof/index.mjs --write` y después
   `--check-artifact`, desde packages/core). El worker corre `gat07:check` y
   reporta; nunca sella.
3. **gates:ci** (`pnpm --filter @rottay/design-system gates:ci` desde la raíz,
   ~10-18 min, background): verde = "87 blocking gate(s) passed" + 2 excluded
   visibles (channel-liveness, lane-control-drills — re-adjudicados el
   2026-08-20 a "F4A/F4B + F2-asimétrico"). Va a 88 cuando F4A-2 enchufe el
   harness de paridad.
4. **Suite**: 1683 tests / 13 fallas, comparar POR NOMBRE contra la baseline.
   lane-control-drills 10/13 NO puede crecer. Hay 4 rojos vitest pre-existentes
   adjudicados (bithire-motion-interaction, cert-fence-conflict9 — probados
   ajenos). Si aparece `brand-authored-residue-retirement` rojo: NO es flake,
   es el mecanismo del par border (ver §13 W2).
5. **docs-engineering** (repo hermano): solo contadores de catálogo. Tiene
   ~205 archivos sucios ajenos del 4-ago que NUNCA se tocan. Mi huella total
   ahí: ~5 líneas contadas. Verificar con find -newermt + diff de contenido.
6. **Commits**: uno por lote. Mientras un worker esté en vuelo, commiteás tus
   docs con PATHSPEC EXPLÍCITO (nunca `git add -A` — te llevás el trabajo del
   worker). Los commits del worker los hacés vos con la lista de paths de su
   reporte.
7. **tmux**: `tmux capture-pane -t <terminal> -p | tail -N` para ver estado;
   `tmux send-keys -t <terminal> "texto" && sleep 1 && tmux send-keys -t
   <terminal> Enter` para despachar. Las terminales conservan contexto — no
   las cierres salvo que el contexto esté corrupto (a fable-ejec le hice
   /clear antes de la auditoría F2 porque tenía 396k tokens de F1).
8. **Los workers paran cuando la premisa está mal** — es una FEATURE. Leé sus
   reportes ENTEROS antes de cerrar. 6 paradas en el programa, todas correctas.
9. **Declaración de packet (enmienda del dueño)**: todo packet F2.4+ declara
   raíz, canales drenados, los 3 resultados verticales (diff exacto o
   byte-idéntico), el negativo NOMBRADO (surface/cascadePresence/valueParity
   salvo roleShape/severs inmóviles; sourceSkeleton enumerado como
   esperada-móvil) y la restauración del artefacto (revert→build
   completo→byte-idéntico, ida y vuelta). El permiso role-shape es compromiso
   a futuro: "cero-delta hoy → sigue a la raíz mañana".
10. **Cero-delta** = pintura COMPUTADA igual tras resolver la raíz (contra el
    artefacto compilado), nunca plausibilidad textual. El build es COMPLETO
    (`pnpm build` en packages/core: tsc+vite+modern-css+vertical+fonts+stamp)
    — el builder lee de dist/, tsc solo no alcanza, y dist parcial da falsos
    rojos de suite.
11. **Firmados** (rosters T1/T2/T3, mass-c3, evnto-t2, R35): NUNCA a mano.
    Solo patrón REDERIVED (re-anclaje permitido cuando el valor computado no
    cambia; los sha256 firmados quedan idénticos pre/post).
12. **Actualizá §13 con cada lote** — es la única verdad resumible. Este
    prompt es secundario a §13.

## 5. Cómo verificar el estado al retomar (hacelo, no asumas)

```bash
cd /Users/daniel/Developer/Rottay/ui-design-system
git log --oneline -8                    # último commit conocido: el plan F4A (6eb622d78) o posterior
git status --short                      # árbol esperado limpio salvo trabajo de worker en vuelo
tmux ls                                 # terminales vivas
ls /tmp/*listo* 2>/dev/null             # flags de lotes terminados sin procesar
tail -60 docs/ROADMAP-EJECUCION-2026-08-19.md   # §13, la verdad viva
```

Si hay flags de lotes sin commitear: leé el reporte correspondiente en /tmp,
verificá contra el árbol, sellá gat-07 si la cadena se tocó, gates:ci, commit.

## 6. Lo que el dueño ya aprobó (no re-preguntar)

- El modelo operativo completo (vos como DT, workers Claude, Fable auditor).
- Trabajo autónomo constante hasta que todo esté resuelto; ante cada hito,
  auditoría de Fable antes de la próxima fase.
- Tus adjudicaciones de coordinador tienen validez ("tomás tus
  recomendaciones y puedo dar por válido tu criterio").
- La enmienda de secuencia entera (F4A/F4B/F4C, F2-asimétrico, F9) — verificada
  8/8 contra el árbol por subagente independiente (commit 2b3cae707).
- Libertad para publicar versiones; push prohibido SIEMPRE.

## 7. Contexto de la sesión original (por si el dueño pregunta)

El dueño pidió: depurar el repo al máximo (scripts/core/src), folder/index en
todo, paths declarativos, manifiesto visible, foco en engine Modern con
compatibilidad a los otros engines, customización por familias de tokens con
efecto cascada (pocas variables con impacto masivo, no 5.000), y "no te fijes
en lo implementado, fijate en lo que tiene que ser". Las auditorías viejas en
`docs/` fueron insumo, no verdad — el criterio propio manda. Las apps quedan
FUERA de alcance hasta F8 (el DS primero).
