# Legacy Theme Presets

This folder keeps the old `theme/presets` system as a migration reference.

It was removed from `packages/core/src/theme` because the definitive DS
architecture now uses:

- tenant branding
- tenant token overrides
- product profiles
- i18n dictionaries

Keeping the preset registry inside the core created two competing ways to style
the system. That ambiguity hurt DX and made it harder to explain which layer
actually owns runtime theming.

If a preset still contains useful visual ideas, promote those ideas into:

- a tenant config
- a product profile
- or a story/showcase example

Do not re-export this folder from the core package.
