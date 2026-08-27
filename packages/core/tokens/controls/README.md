# Controles de customización — API de producto (generado)

> Generado por `scripts/tokens/controls-catalog/index.mjs --write`. NO editar a mano.
> Solo superficie OPERATIVA: governance/dead/frontier viven en sus propios árboles.
> Regla de tiers: pocos inputs que derivan decisiones coherentes ("familia + intensidad");
> Expert es una allowlist CERRADA, no acceso a los --ds-* internos.
> A11y: los envelopes expresivos respetan EXPRESSIVE_A11Y_FLOORS (los floors ganan a todo perfil).
> Rollback: cada control es un INPUT — quitar la autoría restaura el baseline del vertical
> (probado por los legs restore-equals-default del harness no-loss).

digest: 38611e8c43f5053b584a9d9974fdb237666a5f2885403d85bf20f854e3db44fd

## STANDARD — 13 controles (pocos diales, gran superficie)

| id | control | dominio/tipo | default | canal | static path (BrandTheme) | DB path (TenantThemeDocument) | lecturas vivas | consumer probado |
|---|---|---|---|---|---|---|---|---|
| `palette.seeds` | Brand palette seeds | color-set | vertical baseline palette | 5 ch | `palette.{primaryColor,secondaryColor,accentColor,backgroundColor}` | `appearance.general.palette.{primary,secondary,accent,background}` | 1924 | `button.css` |
| `typography.pairing` | Type pairing personality | enum | vertical baseline families | 2 ch | `typography.typePairing` | `appearance.general.typography.typePairing` | 218 | `typography.css` |
| `typography.families` | Explicit font stacks | font-stack | pairing (or vertical baseline) decides | 4 ch | `typography.{fontFamilyBase,fontFamilyHeading,fontFamilyMono,fontFamilyDisplay}` | `appearance.general.typography.{fontFamilyBase,fontFamilyHeading}` | 340 | `default.css` |
| `typography.scale` | Type scale dial | scale | 1 (vertical envelope may clamp tighter) | 1 ch | `typography.scale` | `appearance.general.typography.scale` | 45 | `index.ts` |
| `shape.radius-scale` | Radius scale dial | scale | 1 (vertical envelope may clamp tighter) | 2 ch | `surfaces.radiusScale` | `appearance.general.shape.radiusScale` | 423 | `card.css` |
| `shape.button-style` | Button silhouette | enum | vertical baseline silhouette | 1 ch | `surfaces.buttonStyle` | `appearance.general.shape.buttonStyle` | 2 | `button.css` |
| `density.mode` | Density posture | enum | normal (structural density scale is a separate channel) | 2 ch | `surfaces.density` | `appearance.general.density` | 8 | `index.ts` |
| `spacing.rhythm` | Layout rhythm | enum | normal (factor 1) — byte-identical to the pre-rhythm cascade in every vertical, because the DS floor already resolves --ds-rhythm-effective-scale to 1 | 2 ch | `surfaces.rhythm` | `appearance.general.rhythm` | 94 | `layout-primitives.css` |
| `motion.dial` | Motion intensity and duration | scale | engine cadence unchanged | 2 ch | `motion.{intensity,durationScale,ambient}` | `appearance.general.motion.{intensity,durationScale,ambient}` | 44 | `alert.css` |
| `surfaces.elevation-posture` | Elevation posture | enum | soft (DS shadow ramp untouched) | 3 ch | `surfaces.elevation` | `appearance.general.surfaces.elevation` | 174 | `card.css` |
| `surfaces.effect-intensity` | Decoration intensity | scale | 1 for the DS default; verticals author their own floor | 1 ch | `surfaces.effectIntensity` | `appearance.general.surfaces.effectIntensity` | 62 | `overlay-modal.css` |
| `navigation.sidebar-tone` | Sidebar tone | enum | subtle | 6 ch | `chrome.sidebar.tone` | `appearance.general.navigation.sidebarTone` | 15 | `menu.css` |
| `experience.profile` | Experience profile | profile-id | baseline identity; a selection composes closed per-axis postures whose expansion always loses to any authored field or channel | 5 ch | `expressive.experienceProfile` | `appearance.general.experienceProfile` | 75 | `index.tsx` |

## PRO — 7 controles (familias y perfiles)

| id | control | dominio/tipo | default | canal | static path (BrandTheme) | DB path (TenantThemeDocument) | lecturas vivas | consumer probado |
|---|---|---|---|---|---|---|---|---|
| `chrome.families` | Per-family chrome | chrome-map | family derivations over semantic channels decide | 3 ch | `chrome.*` | `visualFoundation.advanced.chrome.*` | 37 | `table.css` |
| `chrome.anatomy` | Anatomy variants | enum | default anatomy; fails closed unless the vertical envelope opts in | data → compilador → familias | `chrome.{cardComponent,table,sidebar,layout}.anatomy` | `visualFoundation.advanced.chrome.{cardComponent,table,sidebar,layout}.anatomy` | vía compilador (evidence →) | `card.css` |
| `token-overrides` | Bounded raw channel overrides | token-map | none; closed allowlist, max 200 entries, fails closed | 3 ch | `tokenOverrides` | `visualFoundation.advanced.tokenOverrides.{--ds-color-error,--ds-color-bg-overlay}` | 830 | `index.ts` |
| `recipe-profile` | Family recipe profile | profile-id | no profile: family recipe defaults apply | 1 ch | `recipes.profile` | `visualFoundation.recipeProfile` | 0 | `index.tsx` |
| `profiles.expressive` | Explicit expressive axes | enum | each axis independently overrides the experience composition; an unset axis falls back to it, then to baseline | 6 ch | `expressive.profiles.{type,geometry,edge,material,elevation,motif}` | `visualFoundation.advanced.profiles.{type,geometry,edge,material,elevation,motif}` | 35 | `index.tsx` |
| `profiles.icon` | Icon posture profile | enum | baseline role/state weight tables. A posture only selects among the governed PROFILE_ROLE_WEIGHT tables in the icon policy — never a supplier, glyph or local SVG; state weights stay supreme (feedback over decoration). Literal two-hue duotone stays out: the pinned supplier is single-hue/two-opacity by design. | data → compilador → familias | `expressive.profiles.icon` | `visualFoundation.advanced.profiles.icon` | vía compilador (evidence →) | `index.tsx` |
| `responsive.posture` | Responsive posture profile | profile-id | the balanced ladder, whose container thresholds (compact ≤639px, standard ≤839px) and `preferred` span resolution ARE the constants the adaptive runtime and pure solver used before this axis opened — so an absent selection is byte-for-byte the pre-capability layout, and "unset it" is a true rollback rather than an approximate one | data → compilador → familias | `responsive.posture` | `visualFoundation.advanced.responsivePosture` | vía compilador (evidence →) | `index.ts` |

## EXPERT — allowlist cerrada

- **290 tokens** raw-override permitidos (fuente: dist-runtime).
- Dominios: color 27 · semantic-surface 8 · semantic-material 160 · other 32 · semantic-typography 63.
- Overlap con writers vivos: 182.
- Contrato: `TENANT_THEME_OVERRIDE_TOKENS` (bounded); todo lo fuera de la lista es rechazado.

## INTERNAL (no producto) — 1

- `palette.dark-mode` — Mode compatibility (the tenant palette remains authoritative; optional mode data stays an internal compatibility surface)
