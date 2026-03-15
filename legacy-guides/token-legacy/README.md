# Legacy Token Guides

This folder preserves token-era artifacts that are useful as migration
reference, but are no longer part of the active DS runtime.

What lives here:
- `source/base-colors.css`: the old pre-`--ds-*` color foundation that used the
  `--color-*` naming family

What does **not** live here anymore:
- any file imported by `packages/core`
- any file that participates in the current token cascade

The active token architecture now lives entirely under:
- `packages/core/src/theme/tokens/css`
- `packages/core/src/theme/tokens/ts`

and uses the canonical `--ds-*` naming convention.
