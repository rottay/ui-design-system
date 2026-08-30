# Paquete Codex — cierre COH-1 (WO-CRA-23)

Generado por Kimi K3 (DT) al cerrar el candidato integrado. No hay canal
automático para despertar a Codex: queda como evidencia durable para cuando el
owner pida la revisión.

## HEAD y estructura

- `785ccdf48` — commit de integración (árbol final).
- `334bace48` — merge `--no-ff` de la rama `wo-cra-23/coh-1-status-tints`.
- Rama: `e14213be8..3222d4e7c` = `bcccaf9ca` (implementación) + `30d24c0a8`
  (docs) + `3222d4e7c` (remediación DEFECTS-4).

## Qué hace el lote (diff real)

- **Compilador** (`brand-theme/index.ts`, `tenant-theme/index.ts`):
  `deriveStatusTintFloor` (piso por tono con guard de seed presente),
  `applyTenantStatusSeedDerivations` (3 guardas: provenance, shadowing-leaf,
  bakesItsOwnColor), `STATUS_SEED_SHADOWING_FIELDS` (tabla hermana; la primaria
  NO se extendió), y el input hermano `tenantStatusSeedAuthorship` leído del
  patch crudo (la puerta DB real: `tenantPostureFloors` intacta).
- **BitHire light**: retirados 8 literales bg/border verdes legacy + el chrome
  de input (`#2F8B68` → `var(--ds-color-success)`). **Evnto light**: 4 borders
  (cero-delta byte, pin T3) + 4 bgs (corrección mínima). Rottay y ambos dark:
  intactos.
- **Gobernanza**: `capabilities/index.ts` 68→83 canales declarados; manifest
  regenerado por generador (nunca a mano); `slot-inventory.baseline.json`
  3629→3613 con razón escrita; `supplier-contract.json` y `hooks-manifest.json`
  al día; `iso/index.ts` CONSULTED_PROVENANCE_FIELDS une TRES sitios con
  mutante que muerde.
- **Harness F4C**: watch-list post-COH-1 (solo `-ink`, autoridad
  `tinted-well-tone-ink`), `DECLARED_PARTIAL_PROPAGATION = []` (badge-success y
  workbench-status-success DEBEN seguir al seed), flag `--only` fail-closed.
- **Durabilidad**: `F4C/compare-logs/*.txt` trackeables (el defecto Codex de
  los `.log` bajo gitignore, corregido); referencias del README F4C
  actualizadas; historia F4C intacta (6/6 spot-checks de hash).

## Tests y gates (árbol integrado)

- Nuevos: `coh-1-status-tint-floor` 37/37, `coh-1-status-tint-tenant-derivation`
  18/18 (incl. suite afirmativa por la puerta DB real sobre rottay).
- Blast radius: `provenance-acceptance` 24/25 (case D DEFERRED-7,
  pre-existente en HEAD); `brand-authored-residue-retirement` 72/72;
  `modern-tenant-value-free` verde; `rottay-t1-mass-drain` mismos 11 rojos
  pre-existentes de HEAD (ninguno nuevo, ninguno "reparado" fuera de alcance);
  `tone-ink-authority` mismos 2 rojos pre-existentes.
- Gates: build OK, tsc OK, structure:check OK, slot-inventory OK,
  lint:artifacts OK, supplier-contract OK, hooks-manifest OK;
  `manifest/generator --check`: exactamente 117 FAILs, todos receipts F4B
  stale, pre-existentes en HEAD, clasificados y fuera de alcance.

## Auditorías (reales, con sesión y archivo durable)

- Fórmula: revisión Opus real (`coh-1-opus-formula-review.md`) — FORMULA
  AJUSTADA (alphas anclan al seed, no al -500; compilador solo; default.css
  intacto; tabla hermana).
- Fable real sobre la rama: DEFECTS-4 (`coh-1-fable-audit.md`) → remediación →
  ACCEPT (`coh-1-fable-audit-2.md`, con mutantes reales mordiendo).
- Fable real post-integración: ACCEPT, cero defectos
  (`coh-1-fable-integration.md`).

## Evidencia DB + static (el testigo)

`--ds-color-success-bg` sobre `badge-success` (labels, the-management, 1280):
`#f0fdf4` congelado en F4C fase B → `#E8F6FF` baseline (sigue al seed azul
heredado) → `#E2FCE4` con el seed mutado `#2F7A3D` (puerta DB) → `#F7F6FF` con
el seed estático `#7C3AED` (puerta static). Mismo seguimiento en
`workbench-status-success`. Compares focales A→B y A→D: `pass=true`, cero
deltas de geometría/tipografía/motion, hermanos HOLD.

## Pendientes declarados (deuda, no bloqueante)

- 117 receipts F4B stale (pre-existentes en HEAD).
- 14 rojos pre-existentes (case D DEFERRED-7, tone-ink ×2, rottay-t1 ×11).
- Rampa `-50` de rottay ciega al seed del tenant (clase Opus F.1.2) y falso
  positivo de autoría de la familia primaria (`collectPatchAuthoredPaths` sobre
  claves fantasma) — lotes hermanos.
- `evnto` dark: pozos status blancos (rampa authored ciega al modo) — lote
  hermano, NO curado en COH-1.
- `ssrReceipt` inalcanzable en topología RSC→cliente (de F4C; latente).
- Tooltip forzado del lab display-labels: posición no determinista entre
  lanzamientos (estabilización de escena pendiente).
