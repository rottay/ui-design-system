# AppShell responsive contract

`AppShell` owns the application viewport, desktop sidebar, compact navigation
drawer, safe areas, and the space reserved for fixed bottom chrome.

## Postures

- `phone`: below 640 px; navigation opens in an accessible left Sheet.
- `tablet`: 640–1023 px; navigation uses the same compact Sheet contract.
- `desktop`: 1024 px and above; navigation is fixed and may collapse.

The current posture is exposed as `data-posture` on the root and through
`useShellContext()`. Compact navigation uses the existing `Sheet` primitive, so
focus containment/restoration, Escape, backdrop dismissal, body scroll lock,
and dialog semantics stay under one overlay authority.

## Presentation geometry

The typed `geometry` props remain the fallback and the values exposed through
`useShellContext()`. The static vertical baseline or the published tenant
artifact may declaratively replace their rendered CSS lengths with:

- `--ds-shell-sidebar-width`
- `--ds-shell-sidebar-collapsed-width`
- `--ds-shell-header-block-size`
- `--ds-shell-sidebar-header-block-size`

The same resolved inputs govern the fixed desktop rail, main-area inset,
compact Sheet and safe-area-aware headers. Tenant data stores only bounded
schema fields; it cannot store arbitrary shell CSS, selectors or topology.

## Insets

The root publishes:

- `--ds-shell-top-inset`
- `--ds-shell-bottom-inset`
- `--ds-shell-inline-start-inset`
- `--ds-shell-inline-end-inset`
- `--ds-shell-safe-area-{top,right,bottom,left}`

`geometry.bottomInset` is the total height occupied by fixed bottom chrome. It
accepts either one CSS length or a posture map; a missing posture falls back to
the safe area. `AppShell` reserves the resolved value exactly once on the main
area. A phone-only bottom navigation should include its height and safe area:

```tsx
<AppShell
  geometry={{
    bottomInset: {
      phone: 'calc(58px + env(safe-area-inset-bottom, 0px))',
    },
  }}
  sidebar={{
    navigationLabel: 'Primary navigation',
    nav: <PrimaryNavigation />,
  }}
>
  <Routes />
</AppShell>
```

Consumers must not add a second spacer or duplicate bottom padding. Fixed
surfaces such as `ActionDock` can consume `--ds-shell-bottom-inset` directly.
