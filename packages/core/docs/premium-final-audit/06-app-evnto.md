# App-Evnto Audit

Score: `6.8/10`

## What is good

- provider order is sound
- `appearance` now reaches the shared DS pipeline
- bundled-vs-DB tenant handling is structurally healthier
- DS pattern adoption in data surfaces is real

Key files:

- `src/providers/index.tsx`
- `src/lib/tenancy/get-tenant-branding.ts`
- `src/components/_shared/tables/data-table/index.tsx`

## Main problem

Evnto is much healthier at the boundary than on the visible app surface.

It still uses the DS a lot, but often as:

- primitives
- adapters

rather than letting the DS own the app shell and high-level interaction language.

## Top findings

### P1. Shell ownership is still app-local

Evnto still manually coordinates:

- sidebar width
- mobile drawer
- header offset
- breadcrumb offset
- main content offset

Key files:

- `src/app/(dashboard)/layout.tsx`
- `src/components/_shared/layout/sidebar/index.tsx`
- `src/components/_shared/layout/header/index.tsx`
- `src/components/_shared/layout/breadcrumb-bar/index.tsx`
- `src/components/_shared/layout/main-content/index.tsx`

### P1. Search and notification remain custom app surfaces

Evnto still builds major shell interactions locally:

- global search
- notification dropdown shell

Key files:

- `src/components/_shared/search/global-search/index.tsx`
- `src/components/_shared/layout/notification-center/index.tsx`

### P2. Local feedback/widget layer still exists

There are still app-owned systems for:

- confirm dialog
- widget wrapper
- widget empty state

Key files:

- `src/components/_shared/feedback/confirm-dialog/index.tsx`
- `src/components/dashboard/widget-wrapper/index.tsx`
- `src/components/dashboard/widget-empty-state/index.tsx`

### P2. Host CSS still compensates for engine behavior

Evnto still imports:

- local animations
- Classic-engine table overrides

That is a red flag for a premium DS consumer.

Key files:

- `src/app/globals.css`
- `src/styles/table-overrides.css`

## Conclusion

Evnto is no longer weak in provider or tenant plumbing.

Its remaining drag is visible ownership:

- shell
- search
- notifications
- some feedback/widget patterns

The next step is not more tenant plumbing.

It is converging Evnto onto DS-owned structural patterns so it stops behaving like a strong app built on top of DS primitives and starts behaving like a real sibling consumer of the same system.

