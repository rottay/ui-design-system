/**
 * @fileoverview Example skin pack - Rottay Design System
 * @description A checked-in, domain-agnostic demonstration of the `SkinPack`
 * contract (WO-ARC-04): a white-label tenant reskinning the custom engine's
 * flagship set through tokens + a small stylesheet, with zero bespoke React
 * components.
 *
 * @remarks
 * Two levers, used for what each is actually good for:
 *
 * - `tokenOverrides` is the mechanism that does almost all of the work. Every
 *   engine in this design system computes its visual properties (background,
 *   border, radius, shadow) from `var(--ds-*, fallback)` inside an inline
 *   `style` object — `Button.types.ts`'s `SHAPE_MAP`/`VARIANT_MAP` are a
 *   representative example (`'var(--ds-button-radius, 6px)'`). A React
 *   inline style always wins a specificity fight against an external
 *   stylesheet, so `css` selectors CANNOT override `border-radius`,
 *   `background`, `box-shadow`, or `border-color` on these components — but
 *   overriding the CUSTOM PROPERTY itself works regardless of where the
 *   `var()` reference lives, inline or in a stylesheet. That is the same
 *   mechanism tenant branding already uses (`ThemeProvider`); this pack
 *   applies it under the custom engine's pack-scoped registration.
 * - `css` is scoped to what genuinely has no inline competitor: pseudo-
 *   elements (`::before`/`::after` — inline `style` can never target these)
 *   and the handful of properties an engine's inline style object omits
 *   (verified: rustic Button never sets `letter-spacing` or `text-transform`).
 *
 * Verified anatomy coverage at the time this pack was written: `trigger`
 * (Button) and `root` (Card) are the only parts stamped with
 * `[data-part]`/`[data-state]` in the rustic engine (custom's default
 * fallback). Input and Select expose stable but pre-anatomy BEM class hooks
 * (`.rottay-input--focused`, `.rottay-select--open`) instead. Badge, Table,
 * Tabs, and Modal expose neither — they render fully from inline styles with
 * only a caller-supplied `className` passthrough — so this pack does not
 * attempt `css` selectors for them; `tokenOverrides` still reskins their
 * colors/radius because they read the same `--ds-*` custom properties.
 *
 * @module System/Engines/ExamplePack
 * @category System
 * @package @rottay/design-system
 */

import type { SkinPack } from '../skin-pack';

/**
 * `css` lever: pseudo-element accents (unreachable by any inline `style`
 * object) plus the two Button properties rustic's inline style never sets.
 * Every color is `var(--ds-color-primary)` with no fallback literal, so the
 * pack repaints under whichever tenant palette is active instead of forcing
 * one brand's color.
 */
const EXAMPLE_PACK_CSS = `
[data-part='trigger'] {
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

[data-part='trigger']::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--ds-color-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--ds-motion-fast) var(--ds-motion-ease-out);
}

[data-part='trigger'][data-state~='hovered']::after,
[data-part='trigger'][data-state~='focus-visible']::after {
  transform: scaleX(1);
}

.rottay-card[data-part='root'] {
  position: relative;
}

.rottay-card[data-part='root']::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: var(--ds-color-primary);
  opacity: 0;
  transition: opacity var(--ds-motion-fast) var(--ds-motion-ease-out);
}

.rottay-card[data-part='root'][data-state~='hovered']::before {
  opacity: 1;
}
`;

/**
 * `tokenOverrides` lever: sharp radius + primary-colored borders/focus rings
 * across Button, Card, Input, and Select. Every value is either a bare
 * literal (radius, never a color) or a `var(--ds-color-*)` reference — no
 * hardcoded color, per the DS's no-hardcoded-colors law. Verified real
 * token names (not guessed): `--ds-button-radius`/`-radius-round` and
 * `VARIANT_MAP.primary.*` from `Button.types.ts`; `--ds-card-border*` from
 * Card's rustic engine; `--ds-input-radius`/`-border-focus` and
 * `--ds-select-radius`/`-border-focus` from their rustic engines.
 */
const EXAMPLE_PACK_TOKEN_OVERRIDES: Record<string, string> = {
  '--ds-button-radius': '2px',
  '--ds-button-radius-round': '2px',
  '--ds-button-primary-bg': 'var(--ds-color-primary)',
  '--ds-button-primary-hover-bg': 'var(--ds-color-primary)',
  '--ds-button-primary-border': 'var(--ds-color-primary)',
  '--ds-button-secondary-border': 'var(--ds-color-border)',
  '--ds-card-border': 'var(--ds-color-border)',
  '--ds-card-border-hover': 'var(--ds-color-primary)',
  '--ds-input-radius': '2px',
  '--ds-input-border-focus': 'var(--ds-color-primary)',
  '--ds-select-radius': '2px',
  '--ds-select-border-focus': 'var(--ds-color-primary)',
};

/**
 * The checked-in demonstration pack. Registers under `ds-example-pack` — set
 * `TenantConfig.componentPack` to this id (with the `custom` engine active)
 * to activate it. Ships no `components`: every part of this pack's look
 * comes from `css` + `tokenOverrides`, proving the pack path without a
 * single bespoke React override.
 */
export const EXAMPLE_SKIN_PACK: SkinPack = {
  id: 'ds-example-pack',
  css: EXAMPLE_PACK_CSS,
  tokenOverrides: EXAMPLE_PACK_TOKEN_OVERRIDES,
};
