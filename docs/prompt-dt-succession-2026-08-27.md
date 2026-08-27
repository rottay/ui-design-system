# Sucesión DT — Kimi K3 (terminal 1) → Kimi K3 (terminal 2), 2026-08-27

**Orden del owner (2026-08-27, en sesión):** el DT saliente cierra su terminal
por agotamiento de cuota de la cuenta; el DT entrante es otra terminal de Kimi
K3 en la cuenta nueva. **El asiento DT no cambia de manos entre modelos: es la
misma silla (Kimi K3), transferida de terminal.** Exactamente una autoridad DT
antes, durante y después. Fable 5 conserva su auditoría independiente; Codex
sigue como consultor read-only de baja frecuencia (hitos). Este documento es el
equivalente operativo de `docs/prompt-dt-fresh-session-2026-08-23.md` para
esta transferencia.

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`. Programa: Modern
Rescue (WO-CRA-23). La autoridad se lee en este orden: `AGENTS.md` →
`CLAUDE.md` →
`packages/core/scripts/quality-evidence/programs/modern-rescue/README.md` →
`program.json` → `customization-model.json` → `agent-orchestration.json` → y el
roadmap `docs/ROADMAP-EJECUCION-2026-08-19.md` (la escribanía durable).

## 1. Prestate al momento de la sucesión

- HEAD al escribir esto: `2236e9ac045644da60708ce2a32f1502abe4bb6a` (asiento
  de cierre de F2 asimétrico). Verificá con `git rev-parse HEAD` +
  `git status --porcelain` + `git diff --check`.
- **Worktree NO limpio a propósito: ~149 archivos modificados = el piloto F3
  v3 de Opus EN VUELO.** No descartar, no reiniciar, no tocar: es trabajo
  legítimo en curso. Su brief: `/private/tmp/mr-brief-opus-f3-piloto3.md`.
- `/private/tmp` fue preservado hoy (no hubo reinicio desde el 26). Los memos
  citados abajo viven ahí y son EFÍMEROS: ante la duda, el roadmap manda; los
  memos se reconstruyen desde él.
- Nunca push. Jamás reset/checkout/restore/stash sobre trabajo ajeno en vuelo.

## 2. Las terminales tmux (la operatoria)

Sesiones vivas (server tmux sobrevive a esta terminal):

| Sesión | Rol | Estado al escribir |
|---|---|---|
| `modern-rescue-opus` | trabajo arquitectónico/intermedio (writer actual) | ejecutando el piloto F3 v3 |
| `modern-rescue-sonnet` | mecánico/derivados | idle |
| `modern-rescue-fable` | auditor independiente read-only | idle |
| `modern-rescue-codex` | consultor read-only (hito F2A en curso) | revisando |
| `modern-rescue-sonnet-f2a1` | auxiliar (hizo el draft F2A-1) | idle, reutilizable o cerrable |

Observar: `tmux attach -t <sesión>`. Despachar: `tmux send-keys -t <sesión> -l
"<texto>"` y aparte `tmux send-keys -t <sesión> Enter` (si el TUI está en
arranque, el Enter se pierde: verificá con `capture-pane` que el mensaje entró
y reenviá el Enter). Con Codex pasa seguido al abrir la sesión.

**El bus de eventos:** cada brief manda terminar con una línea `SIGNAL: ...` en
su memo + ejecutar `tmux wait-for -S <canal>`. El DT arma un listener por canal
como tarea background (`tmux wait-for <canal>` con timeout largo = watchdog); la
finalización del listener llega como notificación. Cero polling.
**Los listeners de la terminal saliente murieron con ella.** El DT entrante
re-arma los listeners O lee los memos directamente (la línea SIGNAL queda en el
archivo aunque el canal se haya disparado sin waiter):
- `mr-opus-f3-piloto3` → memo `/private/tmp/opus-f3-piloto3.md`
- `mr-codex-f2a-close` → memo `/private/tmp/codex-f2a-close-review.md`

## 3. Disciplina vigente (las leyes de hoy, todas duras)

- **Un solo writer**; los demás read-only o esperando ownership pasado por el DT.
- **Fable audita cada paso, acotado** (preaudit/postaudit por lote); Codex en
  hitos. El DT no audita ni escribe salvo piezas críticas (sellos, contratos).
- **Commits parciales por lote, nunca push.** Formato conventional, sin
  Co-Authored-By ni "Generated with".
- **Test-truth policy** (README del programa): todo rojo se clasifica
  (CURRENT_CONTRACT / AGED_EXPECTATION / INVALID_MECHANISM / UNVERIFIED) antes
  de tocar nada.
- **Batería de cierre de TODO lote:** barrido fail-continue COMPLETO desde el
  gate 0 (`/private/tmp/mr-gate-sweep.mjs` — script listo, 93 gates) **+ la
  suite focal del subsistema tocado** (el agujero histórico: gates:ci no cubre
  las suites vitest unit — el Lote F dejó una roja sin que nadie la corriera).
  Además `gates:ci` completo en los cierres de packet grandes.
- **Receipts F4B:** cualquier edición de fuentes/artefactos los stalea (ligan
  `dist/build-stamp.json`); se re-firman QUIRÚRGICAMENTE (sólo
  `sourceDigest`+`createdAt`, `artifactSha256` intacto, validador
  `scripts/quality-evidence/v2/cli.mjs receipts` → 133/134 con el
  compound-editorial declarado SUPERSEDED_BY_LIVE_FENCE). El método probado 4
  veces hoy; Sonnet lo tiene.
- **Cadena derivada completa medida** (el defecto C5 era no correrla entera):
  generator → cascade-producers → fanout-facts → root-checklists →
  mirror-parity → variant-parity (baseline a mano con ley) → census →
  kimi-preservation → controls-catalog → tokens-catalog (+ reconciliation) →
  vistas docs-engineering (repo hermano: commit propio, SÓLO el subárbol
  `engineering/design-system/tokens/`; su drift preexistente ajeno jamás) →
  GAT-07 reseal del DT (el sello pinea la revisión de docs-engineering:
  actualizar `gat-07-exact-proof.documentation-seal.json` al SHA nuevo antes
  de `gat07:write`).
- **Leyes C5:** toda afirmación de consumidor/lector exige grep citado sobre
  `src/` + `scripts/` + `manifest/`; batería de cierre = gates completo.
- **Leyes F2A:** una prueba de cero-delta acota su propia escena (el veredicto
  de deuda muerta nombra las rutas no cubiertas); el censo de consumidores
  barre la superficie real (censo AST canónico + showroom, universo nombrado);
  un literal de vertical no congela el terminal de un control público sin
  excepción explícita (decisión 19 + gate `dial-authority`); seeds causales
  con factor (decisión 20).
- **Comentarios y notas:** dicen lo que el código hace HOY; una cita errada en
  una nota es defecto de auditoría (pasó dos veces hoy).

## 4. Estado del programa (lo cerrado hoy)

- **C5 CERRADO** (defecto de integración F4B-17B): `fd58f8ba4` (gate-debt) +
  `44b14f521` (correctivo) + docs-eng `46960f2` + asiento `b804815f5`.
  α1: `derivedChannels` = radio de impacto (3 seeds), `calibrationChannels` =
  superficie atribuible (2, subconjunto fail-closed).
- **F2 asimétrico CERRADO**: `2236e9ac0`. Las 34 raíces con disposición
  escrita. Lotes: A `dfc39efcf`, B `2509bdd3d` (T0 `#A8A898`, exclusión
  TEXT_PAGE_COLOR_MODE_ASYMMETRY muerta por su causa raíz —
  `DEFAULT_PALETTE_KEYS`), F `96b610162`, F-2 `fc1b8faf9`, re-medición
  `6f3fbe90c`, F′ `791f86be6`, F″ `9e57502af`, anotaciones `0bd953dbc`.
  Decisiones del owner asentadas en §12: 15 enmendada, 17, 18, 19, 20.
- **Enmienda de paridad profunda del owner** asentada verbatim al inicio de §6
  del roadmap: puerta bloqueante de entrada/salida para F3/F4C.
- gates:ci **91/91** blocking + 2 excluidos con owner; tenant-theme 235/235;
  producers 217/217; drills 28/28; barrido 93 gates 0 fallas.
- Estimación honesta: ingeniería 63–65%, comercial ~43%. F9: 0/5100.

## 5. En vuelo al momento de la sucesión

1. **Piloto F3 v3 (Opus, escribiendo):** migración skin-first de
   `Skeleton/compound/Button` (`height`, patrón hatch del propio archivo) +
   paso 0: verificación de 3 candidatos (presence ×2, cell-renderers ×1).
   Brief completo: `/private/tmp/mr-brief-opus-f3-piloto3.md`. Al llegar su
   señal: postaudit Fable acotado → commit → asiento.
2. **Revisión Codex del cierre F2A** (en curso): 3 preguntas (pendientes que
   podrían ser cierre falso; dependencias antes de la migración masiva F3;
   tensión entre la enmienda de paridad y las decisiones 18/19/20). Memo
   esperado: `/private/tmp/codex-f2a-close-review.md`. Integrar lo que traiga.

## 6. Cola pendiente (en orden)

**Revisión Codex del cierre F2A + estado "amarillo" (recibida 2026-08-27
00:12, integrada por el DT saliente):** dirección correcta, avance real, pero
cuatro hallazgos que quedan como leyes de trabajo del DT entrante:

1. **F3 se abrió sin adjudicar por escrito la puerta de entrada de la
   enmienda de paridad profunda.** Resuelto por adjudicación DT en el asiento
   del roadmap de hoy (ver §"Adjudicación DT — puerta de entrada F3"): la
   entrada rige como ley de trabajo (ley de literales/derivación +
   tenant-last); los 10 gates son de cierre F4C. **Ningún segundo lote F3 se
   abre hasta que el piloto cierre (postaudit Fable + commit + asiento).**
2. **El piloto repite `13px` tres veces en el skin** (hallazgo Codex): eso es
   transportar el hardcode, no normalizarlo. **Condición de commit del
   piloto:** la repetición queda centralizada o clasificada como UNA
   seed/invariante antes del commit — lo verifica Fable en el postaudit.
3. **F2 cerró como disposición, no como drenaje** — los diferidos
   (channel-liveness 49, tenant-reachability 10/13, 2 gates excluidos,
   propagación mode-aware de la decisión 18) NO están resueltos; el asiento
   de la puerta de entrada dice por qué no condicionan F3 (capa de
   contrato/validador, no de migración de pintura) sin pretender que
   desaparecieron.
4. **Ley operativa F3 (Codex, adoptada):** las migraciones se acumulan en
   cohortes coherentes y la cadena derivada se regenera UNA vez por cierre de
   lote — no 147 derivados por microedición.
5. **Métrica corregida:** Codex estima 60–62% (mi 63–65% no descontaba el
   scope nuevo de la enmienda de paridad). Asentado: **62%** ingeniería /
   ~43% comercial, con la nota.

1. Piloto F3 v3 → postaudit → commit → **asiento F3** (debe corregir en §6 del
   roadmap: la cifra "209" muere — el universo medido hoy es 97 producción /
   80 tras las dinámicas; las "17 dinámicas" son **31 por mecanismo**; el pool
   del regex mide construcción de referencias, no deuda de pintura; la
   superficie F3 genuina medida es de UN dígito — ver
   `/private/tmp/sonnet-f3-clasificacion.md`). Adjudicaciones DT ya tomadas:
   criterio de 3 términos (dominio cerrado ∧ skin por data-attribute ∧
   consumido por engine modern que pinta inline); las 7 de indirección
   arquitectónica justificada NO se migran; Avatar classic/rustic intocables
   (fence read-only).
2. **Siguiente lote F3 candidato:** el residuo de `Typography/runtime` (7
   sitios): `resolveTypographyCraftStyle` se aplica inline y SOMBREA al skin
   (que ya pinta la misma matriz) en cada render — deuda real pero con riesgo
   (remover cambia el orden de resolución); prueba de cero-delta propia.
3. **Decisión pendiente del owner (sin apuro):** valor del
   `--ds-input-md-line-height` de bithire — forma ya adjudicada (ratio sin
   unidad, dueño typography.scale por la unidad); recomendación DT: preservar
   1.5385 como ratio seed (identidad exacta, cero-delta). Pregunta satélite:
   convertir también la capa base (`1.5rem` absoluto → ratio) — con qué ratio
   (preservante 1.714 o `normal` 1.5).
4. **Micro-fix candidato adjudicado:** el clear-button de
   `skin/textarea.css:211-212` consume sin el factor de densidad (violación
   probable de la ley C-02 que sus sitios gemelos cumplen) — registrado por
   Fable; corregir con su mini-lote propio.
5. **Para F4C (registrado):** la pregunta sighted del glass de bithire sobre
   backdrop oscuro (modelo aritmético: 81.5→40.4 bajo piso 60 — verificar la
   frecuencia real de vidrio-sobre-oscuro; salida candidata: alpha mínimo en
   el seed, no revertir la decisión 20). Evidencia:
   `/private/tmp/f3-glass-ab-evidence.md`.
6. **Para F5 (registrado):** validador APCA cascade-aware (hoy lee sólo el
   mapa autorado — medido por Opus); override plano mode-aware (decisión 18);
   los 2 gates excluidos (`channel-liveness`, `lane-control-drills`) vuelven a
   blocking cuando sus enumeradores existan; el cableado text-page de evnto
   (35/1/0) es autoría posterior.
7. Observación Fable pendiente de forma: nombrar la "reversión de remoción
   commiteada" como vía propia en la ley de `variant-parity.baseline.json` en
   su próxima edición.

## 7. Primeras acciones del DT entrante

1. Leer la autoridad en orden (arriba) + este documento.
2. Verificar prestate: HEAD, porcelain (esperado: ~149 del piloto en vuelo),
   `git diff --check`. NO mutar nada.
3. Re-armar los listeners de los 2 canales en vuelo (o leer los memos
   directamente si ya escribieron su SIGNAL).
4. Cuando el piloto F3 v3 señale: postaudit Fable → commit → asiento F3 con
   las correcciones de cifras (punto 6.1).
5. Seguir la cola del punto 6. Nunca push. Reportar al owner desviaciones
   concretas y cambios de fase.

*Escrito por el DT saliente (Kimi K3, terminal 1) al cerrar su sesión, por
orden explícita del owner del 2026-08-27.*
