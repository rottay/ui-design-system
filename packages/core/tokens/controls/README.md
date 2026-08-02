# Controles de customización — API de producto (generado)

> Generado por `scripts/controls-catalog.mjs --write`. NO editar a mano.
> Solo superficie OPERATIVA: governance/dead/frontier viven en sus propios árboles.
> Regla de tiers: pocos inputs que derivan decisiones coherentes ("familia + intensidad");
> Expert es una allowlist CERRADA, no acceso a los --ds-* internos.
> A11y: los envelopes expresivos respetan EXPRESSIVE_A11Y_FLOORS (los floors ganan a todo perfil).
> Rollback: cada control es un INPUT — quitar la autoría restaura el baseline del vertical
> (probado por los legs restore-equals-default del harness no-loss).

digest: 6878840d8c1e3855c7eded8ae3c112304fe85a1b49eaf3eb704ace0512a2d8a2

## STANDARD — 13 controles (pocos diales, gran superficie)

| id | control | dominio/tipo | default | canal | static path (BrandTheme) | DB path (TenantThemeDocument) | lecturas vivas | consumer probado |
|---|---|---|---|---|---|---|---|---|
| `palette.seeds` | Brand palette seeds | color-set | vertical baseline palette | data → compilador → familias | `palette.{primaryColor,secondaryColor,accentColor,backgroundColor}` | `appearance.general.palette.{primary,secondary,accent,background}` | vía compilador (evidence →) | `button.css` |
| `typography.pairing` | Type pairing personality | enum | vertical baseline families | data → compilador → familias | `typography.{fontFamilyBase,fontFamilyHeading}` | `appearance.general.typography.typePairing` | vía compilador (evidence →) | `typography.css` |
| `typography.families` | Explicit font stacks | font-stack | pairing (or vertical baseline) decides | data → compilador → familias | `typography.{fontFamilyBase,fontFamilyHeading,fontFamilyMono,fontFamilyDisplay}` | `appearance.general.typography.{fontFamilyBase,fontFamilyHeading}` | vía compilador (evidence →) | `default.css` |
| `typography.scale` | Type scale dial | scale | 1 (vertical envelope may clamp tighter) | data → compilador → familias | `typography (ramp channels)` | `appearance.general.typography.scale` | vía compilador (evidence →) | `index.ts` |
| `shape.radius-scale` | Radius scale dial | scale | 1 (vertical envelope may clamp tighter) | data → compilador → familias | `surfaces.borderRadius.*` | `appearance.general.shape.radiusScale` | vía compilador (evidence →) | `card.css` |
| `shape.button-style` | Button silhouette | enum | vertical baseline silhouette | data → compilador → familias | `chrome.controls.button* (radius channels)` | `appearance.general.shape.buttonStyle` | vía compilador (evidence →) | `button.css` |
| `density.mode` | Density posture | enum | normal (structural density scale is a separate channel) | data → compilador → familias | `surfaces.density / surfaces.densityScale` | `appearance.general.density` | vía compilador (evidence →) | `index.ts` |
| `spacing.rhythm` | Layout rhythm | enum | normal (factor 1) — byte-identical to the pre-rhythm cascade in every vertical, because the DS floor already resolves --ds-rhythm-effective-scale to 1 | data → compilador → familias | `surfaces.rhythm` | `appearance.general.rhythm` | vía compilador (evidence →) | `layout-primitives.css` |
| `motion.dial` | Motion intensity and duration | scale | engine cadence unchanged | data → compilador → familias | `motion.*` | `appearance.general.motion.{intensity,durationScale,ambient}` | vía compilador (evidence →) | `button.css` |
| `surfaces.elevation-posture` | Elevation posture | enum | soft (DS shadow ramp untouched) | data → compilador → familias | `surfaces.shadows.*` | `appearance.general.surfaces.elevation` | vía compilador (evidence →) | `card.css` |
| `surfaces.effect-intensity` | Decoration intensity | scale | 1 for the DS default; verticals author their own floor | data → compilador → familias | `surfaces.effectIntensity` | `appearance.general.surfaces.effectIntensity` | vía compilador (evidence →) | `command-palette.css` |
| `navigation.sidebar-tone` | Sidebar tone | enum | subtle | data → compilador → familias | `chrome.sidebar.*` | `appearance.general.navigation.sidebarTone` | vía compilador (evidence →) | `menu.css` |
| `experience.profile` | Experience profile | profile-id | baseline identity; a selection composes closed per-axis postures whose expansion always loses to any authored field or channel | data → compilador → familias | `expressive.experienceProfile` | `appearance.general.experienceProfile` | vía compilador (evidence →) | `index.tsx` |

## PRO — 7 controles (familias y perfiles)

| id | control | dominio/tipo | default | canal | static path (BrandTheme) | DB path (TenantThemeDocument) | lecturas vivas | consumer probado |
|---|---|---|---|---|---|---|---|---|
| `chrome.families` | Per-family chrome | chrome-map | family derivations over semantic channels decide | data → compilador → familias | `chrome.*` | `visualFoundation.advanced.chrome.*` | vía compilador (evidence →) | `table.css` |
| `chrome.anatomy` | Anatomy variants | enum | default anatomy; fails closed unless the vertical envelope opts in | data → compilador → familias | `chrome.{cardComponent,table,sidebar,layout}.anatomy` | `visualFoundation.advanced.chrome.{cardComponent,table,sidebar,layout}.anatomy` | vía compilador (evidence →) | `page-shell.css` |
| `token-overrides` | Bounded raw channel overrides | token-map | none; closed allowlist, max 200 entries, fails closed | data → compilador → familias | `tokenOverrides` | `visualFoundation.advanced.tokenOverrides` | vía compilador (evidence →) | `index.ts` |
| `recipe-profile` | Family recipe profile | profile-id | no profile: family recipe defaults apply | data → compilador → familias | `recipeProfile` | `visualFoundation.recipeProfile` | vía compilador (evidence →) | `index.tsx` |
| `profiles.expressive` | Explicit expressive axes | enum | each axis independently overrides the experience composition; an unset axis falls back to it, then to baseline | data → compilador → familias | `expressive.profiles.*` | `visualFoundation.advanced.profiles.{type,geometry,edge,material,elevation,motif}` | vía compilador (evidence →) | `index.tsx` |
| `profiles.icon` | Icon posture profile | enum | baseline role/state weight tables. A posture only selects among the governed PROFILE_ROLE_WEIGHT tables in the icon policy — never a supplier, glyph or local SVG; state weights stay supreme (feedback over decoration). Literal two-hue duotone stays out: the pinned supplier is single-hue/two-opacity by design. | data → compilador → familias | `expressive.profiles.icon` | `visualFoundation.advanced.profiles.icon` | vía compilador (evidence →) | `index.tsx` |
| `responsive.posture` | Responsive posture profile | profile-id | the balanced ladder, whose container thresholds (compact ≤639px, standard ≤839px) and `preferred` span resolution ARE the constants the adaptive runtime and pure solver used before this axis opened — so an absent selection is byte-for-byte the pre-capability layout, and "unset it" is a true rollback rather than an approximate one | data → compilador → familias | `responsive.posture` | `visualFoundation.advanced.responsivePosture` | vía compilador (evidence →) | `index.ts` |

## EXPERT — allowlist cerrada

- **294 tokens** raw-override permitidos (fuente: dist-runtime).
- Dominios: color 31 · semantic-surface 8 · semantic-material 160 · other 32 · semantic-typography 63.
- Overlap con writers vivos: 182.
- Contrato: `TENANT_THEME_OVERRIDE_TOKENS` (bounded); todo lo fuera de la lista es rechazado.

## INTERNAL (no producto) — 1

- `palette.dark-mode` — Mode compatibility (the tenant palette remains authoritative; optional mode data stays an internal compatibility surface)
