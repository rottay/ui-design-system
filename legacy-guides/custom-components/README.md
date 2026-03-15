# Legacy Custom Components

This folder preserves the old `custom/` component catalog as migration
reference material.

Why it lives here:

- It is no longer part of `packages/core/src`, so the core design system stays
  focused on primitives, patterns, and surfaces.
- It is no longer part of the public `@rottay/design-system` API.
- It still exists as a guide while teams migrate old product-specific screens
  toward the new surface-based architecture.

Usage rules:

- Do not import components from this folder into the new core design system.
- Do not add new components here.
- Use it only to study prior layouts, behaviors, and data assumptions during
  migrations.

Migration direction:

1. Move reusable page mechanics into `packages/core/src/components/surfaces`.
2. Keep product-specific rendering inside each app.
3. Delete legacy components from this archive once they are no longer needed as
   reference.
