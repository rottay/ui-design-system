# Cross-Vertical and System Coherence

## Score

- `4.9/10`

## Good News

- the DS is now capable of supporting multiple products without total fragmentation
- the bundled first-party model is understandable
- `brandTheme` gives a real path for strong first-party products

## Bad News

- the visible quality of Rotate does not yet prove that the system can produce differentiated first-party products convincingly
- the runtime DB path is still much weaker than the bundled path
- the host still injects too much of its own shell logic
- tenant identity resolution is materially inconsistent across `app-platform`, `app-evnto`, and `app-bithire`
- DS boot and CSS entrypoint strategy are not shared cleanly across the three apps
- shell geometry is still owned by each app, so cross-product coherence breaks immediately

## Coherence Gaps

1. Tenant identity resolution is split across head and runtime, and it differs by app.
   `app-platform` metadata still goes through DB branding while dashboard/auth runtime short-circuits bundled tenants.
   `app-evnto` and `app-bithire` metadata use the raw header slug while runtime remaps `rottay` to the vertical slug.
2. `DesignSystemProvider` boot is not coherent across apps.
   `app-platform` uses a server-fed file-first path with hardcoded `vertical`, `productProfile`, and `forceEngine`.
   `app-evnto` and `app-bithire` rely on client `useTenantBranding()` plus app-owned `tenantOverrides`.
3. Styling/package entrypoints diverge.
   `app-platform` imports tenant CSS and engine CSS separately, while `app-evnto` and `app-bithire` use single vertical artifacts.
4. Shell ownership is still app-local and geometry diverges immediately by vertical.
   `platform` hardcodes `296/96`, while `evnto` and `bithire` carry their own `256`-based offset logic.
5. The DB tenant customization story is still only partially aligned with the frozen DS model.
   `appearance.general` is the intended DB contract, but `app-platform` still maps only a subset and the admin UI remains branding-first.

## Cross-App Scores

- overall cross-app / cross-vertical coherence: `4.9/10`
- tenant identity resolution coherence: `4.0/10`
- `DesignSystemProvider` runtime parity: `5.2/10`
- styling/package entrypoint parity: `4.1/10`
- shell/layout/navigation parity: `3.6/10`
- DB customization/authoring parity: `4.3/10`

## Highest-Impact Fixes

1. Create one shared server-side tenant resolver used by metadata, manifest, layouts, and providers in all apps.
2. Standardize DS boot so `tenantSlug`, `tenantConfig`, `tenantOverrides`, `vertical`, and `productProfile` enter with the same precedence rules everywhere.
3. Standardize CSS entrypoints to one vertical artifact import per app.
4. Extract a canonical DS shell/workspace contract for sidebar width, header, breadcrumb bar, and content offsets.
5. Finish DB tenant v1 so `appearance.general` becomes the authored/admin-facing model and legacy branding fields become migration shims only.

## 10/10 Standard

- every first-party app feels like a sibling, not a clone
- a new runtime tenant can look intentionally branded without custom CSS hacks
- shared DS structures preserve coherence without flattening identity
