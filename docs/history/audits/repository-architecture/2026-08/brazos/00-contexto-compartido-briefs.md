# Reauditoría Cloud — contexto compartido para los brazos de investigación

Fecha: 2026-08-28. Auditor principal: Fable (orquesta y adjudica). Vos sos un brazo de investigación READ-ONLY.

## Reglas duras para todo brazo

- **READ-ONLY sobre los repos.** No editar, crear ni borrar archivos bajo `/Users/daniel/Developer/Rottay/**`. Cero `git add/commit/stash/checkout/restore/reset`. Cero `pnpm build`, cero `--write`, cero vitest/jest (algunas suites escriben fixtures en `src/` y no son concurrencia-seguras). Podés correr scripts con `--check` o de solo lectura, `node -e`, `grep/rg/find/wc/python3`, `git log/diff/show/rev-list` (lectura).
- El worktree del DS tiene 3 archivos modificados sin commitear (`normalization-contract-gate/index.mjs`, su test, `root-membership/index.test.mjs`) — trabajo ajeno en vuelo; no lo toques ni lo cuentes como defecto.
- **Escribí tu informe** en `/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad/reaud-<tu-cluster>.md` (ese prefijo es obligatorio; otros brazos escriben en el mismo directorio).
- Un número no es evidencia hasta saber su alcance: cada cifra que reportes lleva el comando que la produjo. Un grep vacío no prueba ausencia — verificá con un control positivo (un caso que sabés que existe y que tu búsqueda debe encontrar).
- Nada de narrativa: directo a hallazgos y optimizaciones. Citá `ruta:línea`.
- Idioma del informe: español (términos técnicos en inglés está bien).

## Formato obligatorio del informe

```
# <cluster> — <N> ópticas

## Puntaje por óptica
| # | Óptica | Puntaje 0-5 | Evidencia (1 línea) |

## Hallazgos (ordenados por severidad)
### H-<cluster>-<n> · <BLOQUEANTE|ALTO|MEDIO|BAJO> · <título corto>
- Qué: ...
- Evidencia: <ruta:línea> / <comando → salida>
- Impacto en el objetivo del owner: ...
- Optimización concreta: ...

## Lo que está bien (breve, con evidencia)
## Preguntas que no pude cerrar (y qué haría falta)
```

Escala: 5 = cumple con evidencia reproducible; 4 = cumple con deuda menor conocida; 3 = parcial, dirección correcta; 2 = parcial, dirección dudosa; 1 = existe sólo como intención/documento; 0 = ausente o contradicho por la evidencia.

## El objetivo del owner (contra qué se mide todo)

Design system multi-tenant, engine `modern`. Dos tenants (uno estático desde archivo de vertical, otro desde DB) deben parecer proyectos totalmente diferentes en la UI. En vez de cientos de customizaciones, un par de decenas de controles ("familias + opciones") cuyo cambio impacte en muchas familias de componentes y cambie el skin real. Responsive, sin espacios en blanco, premium, mobile si es viable. Cero hardcodeado en general; si hay un hardcode, sólo afecta a esa primitiva/ajuste puntual, nunca al skin. El DS baja las directivas a surfaces/estructuras/componentes. Customizaciones (p.ej. size) configurables desde la app, incluyendo modificar el estilo de UNA card en UNA página específica por diseño sin romper el estilo base.

## El programa que se audita (hechos ya establecidos por Fable — no re-derivar, sí podés refutar con evidencia)

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (pnpm workspace: `packages/core` = `@rottay/design-system` 2.19.36 local; `packages/showroom`). Apps consumidoras: `/Users/daniel/Developer/Rottay/app-bithire` (pin 2.19.37), `app-evnto` (pin 2.19.29, consume fuente local por symlink manual), `app-platform` (pin 2.19.35).
- Programa: **Modern Rescue (WO-CRA-23)**. Autoridad en orden: `AGENTS.md` → `CLAUDE.md` → `packages/core/scripts/quality-evidence/programs/modern-rescue/README.md` → `program/index.json` → `customization-model/index.json` → `orchestration/index.json` → roadmap `docs/history/programs/architecture-refactor/2026-08/execution/index.md` (8098 líneas; §12 decisiones del owner, §13 estado vivo). Sucesión: `docs/history/prompts/architecture-refactor/2026-08/design-lead-succession/index.md`. Arquitectura objetivo: `docs/ARCHITECTURE.md` (§1.5 tenant authority, §1.6 cascada, §1.6.1 dónde vive la customización).
- Fases: F0 piso honesto ✅, F0.5 folder/index ✅, F1 vocabulario ✅, F2 cascada en fuente ✅ (asimétrico cerrado 2026-08-27 "como disposición, no drenaje"), F4A canon de 3 themes ✅, F4B calibración causal de 20 controles ✅ "en forma honesta" (9 COMPUTED_VERIFIED, 10 SOURCE_BOUND, 1 BY_REFERENCE), F3 pintura a skins: "superficie genuina de UN dígito, drenada" (2026-08-27). Pendientes: F4C art direction premium, F5 una capacidad un dueño, F6 frontera pública, F7 higiene, F8 apps (sólo BitHire), F9 cierre 255 familias × 20 controles = 5100 celdas. R7 (customización avanzada) `enabled:false`.
- Estimación del DT: **62% ingeniería / ~43% comercial**. Manifest rollup real (`packages/core/manifest/index.json`): 255 familias, 5100 celdas **todas UNKNOWN**, 0 APPLICABLE, 0 familias aceptadas, 252 SOURCE_BOUND, 3 INVENTORIED_ONLY.
- Controles operativos: 13 Standard (`palette.seeds, typography.pairing, typography.families, typography.scale, shape.radius-scale, shape.button-style, density.mode, spacing.rhythm, motion.dial, surfaces.elevation-posture, surfaces.effect-intensity, navigation.sidebar-tone, experience.profile`) + 7 Pro (`chrome.families, chrome.anatomy, token-overrides, recipe-profile, profiles.expressive, profiles.icon, responsive.posture`) + Expert allowlist cerrada 290/294 tokens, máx 200 overrides/documento. Modelo objetivo 9+7 `PROPOSED_NOT_IMPLEMENTED`. Catálogo generado: `packages/core/tokens/controls/README.md`.
- Pipeline: `BrandTheme` (estático, TS en `src/foundation/tokens/ts/presentation/brand-themes`) y `TenantThemeDocument` (DB) → un solo `compileTheme` (`src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts`; DB en `src/infrastructure/compilers/composition/tenant-theme/index.ts`) → artefacto CSS. Contratos: `src/foundation/contracts/composition/tenants/themes/`.
- CSS: skins modern en `src/foundation/tokens/css/runtime/engines/modern/skin/` (123 archivos), presentation/components/skin (157), rustic/skin (111). Total 473 css en src. Artefactos: `packages/core/styles/{rottay,bithire,evnto,index}.css` **~5.3–5.5 MB cada uno**, 15.759 reglas, 7.088 nombres `--ds-*` únicos, 389 `--_ds-*`; `styles/modern.css` 24 KB. `dist/` tiene `bithire/evnto/rottay/styles/modern-engine.css`. app-bithire importa `@rottay/design-system/styles/bithire` desde `globals.css`; app-platform importa `@rottay/design-system/dist/platform.css` (NO existe en dist local).
- Censos crudos de Fable (alcance: `src/**/*.css`): 3.090 literales hex; 3.484 declaraciones con `px` sin `var(`; 79 css con `@container`, 261 con `@media`; 755 tsx en `src/ui` con `style={`.
- `hooks-manifest.json` (frontera app/DS): 91 hooks públicos, **2.606 unadjudicatedReads**, 567 componentTokens, 3.357 foundationTokens, 2.191 tenantChannel.
- Reference lab (autoridad de evidencia visual): showroom `/probe/ds-reference` y `/probe/whitelabel-torture`; tenants `bithire-static` y `themanagement-db` (fixture `src/tooling/testing/fixtures/tenants`).
- Leyes vigentes que importan: ley de hardcodes F4A (un literal es legítimo sólo en el punto superior donde la vertical elige seed/variante/invariante; un leaf que lo re-expresa debe derivar); `--ds-*` público, `--_ds-*` privado gobernado, `data-*` eje DOM; sin selectores por tenant; sin segundo compilador; transport equality estático/DB; artefactos nunca editados a mano; classic/rustic read-only; nunca push.
- Gates: 90 scripts en `packages/core/package.json`, `gates:ci` ~91-103 entradas blocking, baselines decrease-only. `program-check.mjs` en el dir del programa. `gat-07-exact-proof` sello documental.
- Auditoría Fable previa (2026-08-19): `docs/history/audits/architecture-refactor/2026-08/execution-verification/index.md` — no la repitas; sí verificá si sus hallazgos se cerraron cuando toquen tu cluster.
