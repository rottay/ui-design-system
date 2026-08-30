# COH-1 — evidencia focal: los tints status ahora derivan del seed

Este directorio guarda la evidencia focal del lote COH-1 (derivación de
`--ds-color-{success,warning,error,info}-{bg,border}` y alphas desde los cuatro
seeds status). No es otra serie F4C: es la prueba acotada de que los canales que
F4C midió CONGELADOS (propagación parcial pre-declarada) ahora siguen al seed.

## El testigo

Misma mutación DB que F4C fase B (`palette.status.success = '#2F7A3D'` sobre la
fila de the-management, puerta declarada del control). El canal
`--ds-color-success-bg` leído sobre el carrier `badge-success` (labels,
the-management, 1280):

| corrida | valor del canal |
|---|---|
| F4C fase B (pre-COH-1, seed mutado) | `#f0fdf4` — el literal verde, CONGELADO |
| COH-1 focal-A (post-COH-1, baseline) | `#E8F6FF` — el `-50` del seed azul heredado |
| COH-1 focal-B (post-COH-1, seed mutado) | `#E2FCE4` — el `-50` del seed verde mutado |

El canal que antes no se movía ahora rastrea el seed por las DOS puertas. Lo
mismo en `workbench-status-success` y en la pata static (focal-D, seed estático
de bithire a `#7C3AED`): `--ds-color-success-bg` = `#F7F6FF` (el `-50` del seed
violeta) y `--ds-color-alpha-success-10` = `color-mix(in srgb, #7C3AED 10%,
transparent)` sobre el ground bithire.

## Corridas

- `focal-A/` — baseline post-integración, 24/24 filas (4 escenas × 2 grounds × 3
  anchos: labels, workbench, feedback, dashboard), `--check` verde.
- `focal-B/` — mutación DB, 24/24, `--compare focal-A focal-B` **pass=true**:
  MOVERs success con cero deltas de geometría/tipografía/motion, hermanos HOLD,
  bithire HOLD_ALL byte-exacto (brazo static no puede moverse por una fila DB).
- `focal-D/` — mutación static (BrandTheme bithire) + `pnpm -C packages/core
  build`, 24/24, `--compare focal-A focal-D` **pass=true**: TONE_RULE en ambos
  grounds (el ground DB hereda la baseline vertical, digest del artifact DIFFERS
  — mecanismo ya adjudicado en F4C), digest restaurado tras el revert.

Ruido de raster medido dentro de tolerancia en los compares (2 filas, ≤15 px,
Δ≤1) — misma clase documentada en F4C/README.md.

## Restauración verificada

Tras cada mutación: `git diff` vacío en el fixture DB y en el BrandTheme;
`tenant-theme-canary-fixtures.json` y los artifacts/styles regenerados vuelven
byte-idénticos (build determinista verificado dos veces en la integración).

## Referencias

- Harness: `packages/showroom/scripts/f4c-canary-capture.mjs` (con `--only`
  para corridas focales y la watch-list post-COH-1: solo los `-ink`, que
  derivan por la autoridad `tinted-well-tone-ink`).
- Fórmula adjudicada: `../scouts/coh-1-opus-formula-review.md`.
- Implementación + remediación: `../scouts/coh-1-implementation-report.md`.
- Auditorías Fable reales: `../scouts/coh-1-fable-audit.md` (DEFECTS-4) y
  `../scouts/coh-1-fable-audit-2.md` (ACCEPT).
- F4C histórico (la serie de cierre): `../F4C/README.md`.
