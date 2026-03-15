# Legacy Animation Presets

This folder keeps the previous animation preset helpers as reference only.

They were removed from the live core because the current DS resolves motion
through:

- engine defaults
- product profile personality
- tenant overrides
- component and surface-level explicit props

That gives a single runtime path for motion instead of a parallel preset system
that components were not actually consuming.

If one of these presets still represents a useful interaction pattern, migrate
it into:

- a motion-aware component
- a surface default
- or a story/showcase example

Do not wire this folder back into the public API.
