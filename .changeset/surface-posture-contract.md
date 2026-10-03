---
"@rottay/design-system": minor
---

WO-INV-06 — the surface posture contract. Every surface accepts `postures: { phone?, tablet?, desktop? }`: an app-owned per-device declaration (regions that render, collapse or hide by name; the navigation mode `sidebar | bottom-bar | drawer`; the density; the primary action placement), resolved on the server from the responsive runtime's SSR hint so the first paint already carries the phone posture on a phone request — no client measurement anywhere in the new code. The surface itself applies the region disposition (a hidden region ships no markup; a collapsed one keeps its landmark); the region mechanism is internal to the surfaces and is not exported — apps consume the contract through the `postures` surface prop. `DEFAULT_SURFACE_POSTURES` carries the family baselines (app-shell: bottom bar on phone, drawer on tablet, sidebar on desktop; no default hides a region — hiding is app composition). AppShell's navigation presentation gains `'bottom-bar'` — a persistent, never-overlay bar painted by the existing `--ds-app-shell-navigation-*` channels — driven per posture through the existing `adapt` slot; `surfacePosturesToShellAdapt` maps a posture declaration onto that slot with structural typing (the surface tier never imports the structures tier). `NAVIGATION_DEFAULTS` are unchanged: phone/tablet stay `drawer` unless the app opts in. The consumer fixture (WO-CON-04) renders a list surface inside the real AppShell, phone posture hiding the column menu and the preview rail and presenting the bottom bar — SSR-proven.

```contract-diff
export .#SurfacePostures — the `postures` prop shape every surface accepts: per-band deltas of regions/navigation/density/primaryAction (WO-INV-06)
export .#SurfacePostureDeclaration — one band's posture: regions disposition map, navigation mode, density, primary action placement (WO-INV-06)
export .#SurfaceRegionDisposition — 'render' | 'collapse' | 'hide' (WO-INV-06)
export .#SurfaceNavigationMode — 'sidebar' | 'bottom-bar' | 'drawer' (WO-INV-06)
export .#PrimaryActionPlacement — 'app-bar' | 'bottom-bar' | 'floating' (WO-INV-06)
export .#SurfaceFamily — the families with posture defaults: app-shell | list | record | workspace | form (WO-INV-06)
export .#ResolvedSurfacePosture — the posture in force for one rendered surface (WO-INV-06)
export .#DEFAULT_SURFACE_POSTURES — the family baselines per viewport band (WO-INV-06)
export .#resolveSurfacePostures — pure resolution: app delta over the family default, regions merge by name (WO-INV-06)
export .#useSurfacePosture — the render-time hook over the responsive runtime's snapshot (WO-INV-06)
export .#surfacePosturesToShellAdapt — maps postures onto the shell's adapt navigation slot (structural typing, no cross-tier import) (WO-INV-06)
export .#SurfaceShellNavigationAdapt — the adapter's return shape (WO-INV-06)
```
