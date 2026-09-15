# WO-EVI-05 radio/shape — paquete de cumplimiento para confirmación de revisores

Commit implementado: `2d537ae85` (main, sobre `b87ab7969`). Implementador: Opus
(claude-admin). Auditor: Kimi (kimi-admin) — suites re-ejecutadas por el auditor,
no reportadas por el writer. Debrief original: evi05-radioshape-debrief.md;
veredictos: evi05-review-codex.txt / evi05-review-fable.txt (ambos CHANGES
condicionado). Todo lo citado es verificable en el commit.

## Estado medido por el auditor (comandos reales)

- `node --test packages/core/scripts/check/theme/population/tests/index.test.mjs` → 31/31.
- `node --test packages/core/scripts/check/theme/axis-difference/tests/index.test.mjs` → 62/62.
- `./node_modules/.bin/vitest run tests/integration/axis-difference-pilot` (Chromium, ambas
  orientaciones, ambos modos) → 6/6; registro en
  `test-artifacts/gates/axis-difference-pilot/index.json`: `failures: []` en ambas
  orientaciones + exactamente 1 N/A (radio/shape con razón semántica); controles
  negativos en 0; mutante severed detectado; `decisionRows: 29`.
- Pins: piloto shape = 4 aplicables + 1 N/A ("never 5 and never 4/4 alone"),
  `exclusionsRevision: 34bd866512177f9b`, `exclusionsReview: WO-EVI-05 core review
  2026-09-14`; flota shape 217 → 216 ligado a la revisión de exclusión; mínimos
  absolutos y umbral de seis ejes intactos.
- Liveness 129/129, family-cut drills 62/62, engine-audit 3.310 contadores — sin
  regresión. `typecheck:tests`: el archivo del piloto quedó en 0 errores.

## Cumplimiento condición por condición

### Fable (1) — selector + declaración verbatim, sólo byProperty, mutantes d–g
- Registro cerrado `scripts/check/theme/population/exclusions/index.json`: cada
  declaración pinea selector + property + value VERBATIM (normalizado, sin
  comentarios). `EXCLUSION_PATHS = ['byProperty']` — un head channel jamás se excluye.
- Tokenizer a nivel regla (`SELECTOR_RULE`, el vocabulario de la sonda axis-difference)
  aplicado uniformemente a toda familia.
- Mutantes en `population/tests/index.test.mjs` (los 16 drills nuevos, 31/31 total):
  (d) valor cambiado / canal al frente en el selector excluido → exclusión invalidada,
  radio re-entra, `checkPilotPopulation` falla contra el pin; (e) segunda regla mismo
  selector con otro radius → mismo resultado; (f) selector inexistente → falla sobre
  texto SIN comentarios (clase F-23); (g) familia con radius en selector no excluido →
  sin efecto; conjunto admitido pineado a exactamente `radio/shape`; duplicados y
  solape aplicable/N-A → falla de validación.

### Fable (2) — notApplicable de punta a punta
- `populationReport`/`populationLine` llevan N/A por eje; `pilotReadings` lo lleva
  junto a moved/denominator (diff autorizado por el DT, con drill que demuestra que
  "2/2 + 1 N/A" no puede leerse como todo el eje); el test del piloto aserta
  `notApplicable` derivación-viva == pin publicado, pares == ['radio/shape'],
  `failures == []` en ambas orientaciones, y por lectura `notApplicable` 1 en shape, 0
  en el resto.
- Piloto y flota republicados en el mismo commit con membresía vieja/nueva
  (flota shape 217 → 216 por "reviewed exclusion", ligado a `exclusionsRevision`).
- Conteos publicados reales: población 31/31 (era 15/15 + 16 drills), piloto 6/6.

### Fable (3) — radio-group
- La obligación nombra la familia de población `radio-group`; el drill de continuidad
  monta la opción button-style REAL (`buttonStyle` stamped) y mide la esquina de la
  opción en el positivo shape (test verde en la corrida 6/6); el sandbox de población
  se extendió a la skin de presentación con baseline establecido.
- Wiring: la esquina de radio-group responde a la decisión shape dentro del piloto —
  verificado por el drill de continuidad (la esquina se mide MOVIÉNDOSE en el positivo).

### Codex (i) — propiedad+valor+contexto de regla
- Coincidencia verbatim selector+propiedad+valor; un cambio de valor o un canal
  `var(--ds-x, …)` al frente deja de coincidir → re-entrada automática (mutante d);
  invariante sobre las partes excluidas vía drills d/e.

### Codex (ii) — honestidad N/A
- Conjuntos aplicable/N-A exactos y disjuntos (validación de solape en el registro);
  delta de membresía publicado para piloto y flota en el mismo commit; publicación
  atada al candidato + `exclusionsRevision`, no sólo al digest de catálogo.

### Codex (iii) — mutantes
- (a) esquina en parte no excluida → re-entrada (nivel población: el pin mismatch
  dispara en la primera aserción del piloto, sin navegador); (b) severed intacto y
  detectado en Chromium; (c) continuidad radio-group; (d)(e) deriva en selector
  excluido + regla duplicada; longhands físicos agregados al vocabulario
  (`border-{top,right,bottom}-{left,right}-radius`) — membresía sin cambios PROBADO:
  shape 217→216 es exactamente −1 (card-compounds/detail-header ya eran miembros por
  el shorthand); (f) entrega de CSS mutado: los mutantes de la EXCLUSIÓN se prueban a
  nivel población/pin (el mismatch dispara antes de cualquier corrida de navegador);
  el mutante a nivel navegador sigue siendo el severed-markup existente, que sí llega
  a la medición en Chromium. RE-ENTRADA vs FALLA distinguidas en los drills (esquina
  severa/no-móvil falla; re-entrada restaura aplicabilidad).
- Si considerás que (f) exige además un mutante CSS a nivel navegador, el cableado de
  `run({root})` a `resolveBundle` quedó identificado y se agrega — decídelo en tu
  veredicto.

### Codex (iv) — radio-group
- Mount real button-style + fixture extendido + baseline; ver Fable (3).

### Codex (v) — drift
- Validaciones ejecutables del registro: selectores faltantes/renombrados, duplicados,
  solape aplicable/N-A, existencia sobre texto sin comentarios; exclusión atada a
  revisión; N/A stale imposible (el test del piloto exige igualdad derivación-viva ==
  pin en cada corrida).

## Pregunta a cada revisor

Con las condiciones aterrizadas y auditadas arriba: ACCEPT o CHANGES. Fable pre-aceptó
condicionalmente ("with those three landed and audited, ACCEPT"); este paquete es la
demostración. Codex: tu veredicto final, y tu decisión sobre (iii-f).
