'use client';

/**
 * @fileoverview SystemCssVariablesBridge - Rottay Design System
 * @description Synchronizes JS-resolved design tokens (personality, surface, motion)
 * into CSS custom properties scoped to `:root`, keeping React-driven
 * token resolution and CSS-driven styling in lockstep.
 *
 * @remarks
 * Injected CSS variables include personality-derived values such as:
 * - `--ds-personality-animation-*` (entrance, stagger, hover lift/scale)
 * - `--ds-personality-accent-*` (bar position, thickness, icon shape)
 * - `--ds-personality-card-*` (elevation, hover behavior)
 * - `--ds-personality-typography-*` (heading weight, letter spacing, label style)
 *
 * Without this bridge, CSS keyframes, pseudo-elements, and non-React styling
 * paths would fall out of sync whenever a product profile or tenant override
 * changes token values at runtime.
 *
 * PRECEDENCE LAW: personality is the layer everything else in the DS merge
 * chain (DS base -> vertical baseline -> BrandTheme -> generated artifacts) is
 * allowed to override, so its variables are written to a `:root` rule inside
 * a dedicated stylesheet, never as inline styles on `document.documentElement`.
 * Inline styles carry the highest specificity CSS offers and would beat every
 * tenant declaration, including the scoped `html[data-tenant='x'][data-theme=
 * 'dark']` rules `ThemeProvider` injects for a tenant's `generatedChromeCss`.
 * A bare `:root` rule loses to any tenant-scoped selector on specificity alone
 * (no `!important`, no CSS layer needed), so a tenant can always override a
 * personality-derived variable, while personality still supplies the default
 * when a tenant declares none for that variable.
 *
 * Variables are cleaned up on unmount so tenant switching and test isolation
 * do not leak values across render trees.
 *
 * @see {@link useTokens} - Hook that resolves the merged token graph
 * @see {@link resolvePersonalityCssVariables} - Maps tokens to CSS variable names
 * @module System/Providers/CssVariablesBridge
 * @category System
 * @package @rottay/design-system
 */

import { useEffect, useRef } from 'react';

import { resolvePersonalityCssVariables } from '@/foundation/tokens/ts/runtime/personality';

import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';

/** Singleton style element: one bridge instance, one stylesheet, one `:root` rule. */
const PERSONALITY_STYLE_ELEMENT_ID = 'ds-personality-tokens';

/**
 * Renders nothing visually. Runs a side-effect that writes resolved personality
 * tokens as a `:root` CSS rule in a dedicated stylesheet and cleans it up on
 * unmount.
 */
export function SystemCssVariablesBridge(): null {
  const tokens = useTokens();
  // Shallow fingerprint instead of JSON.stringify(tokens) for performance.
  // The bridge only feeds tokens into resolvePersonalityCssVariables which reads
  // tokens.personality and tokens.colors, so we fingerprint just those fields.
  const tokensKey = `${tokens.colors.primary}|${tokens.personality.animation.entrance}|${tokens.personality.card.defaultElevation}|${tokens.personality.typography.headingWeightBias}|${tokens.personality.accent.barPosition}`;
  const lastKeyRef = useRef<string>('');

  useEffect(() => {
    // Skip if tokens haven't actually changed (prevents Fast Refresh loops)
    if (lastKeyRef.current === tokensKey) return;
    lastKeyRef.current = tokensKey;

    let styleElement = document.getElementById(PERSONALITY_STYLE_ELEMENT_ID) as HTMLStyleElement | null;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = PERSONALITY_STYLE_ELEMENT_ID;
      document.head.appendChild(styleElement);
    }

    // Values are written through CSSOM `setProperty` on a stylesheet rule --
    // never through text interpolation -- matching how ThemeProvider applies
    // branding/appearance vars. A value never passes through a CSS text
    // parser, so a malformed token value cannot break out of its declaration.
    const sheet = styleElement.sheet;
    if (sheet) {
      while (sheet.cssRules.length > 0) {
        sheet.deleteRule(0);
      }
      sheet.insertRule(':root {}', 0);
      const rule = sheet.cssRules[0] as CSSStyleRule;
      for (const [name, value] of Object.entries(resolvePersonalityCssVariables(tokens))) {
        rule.style.setProperty(name, String(value));
      }
    }

    return () => {
      // Cleanup matters for tests, previews, and tenant switching so one render
      // tree does not leak personality values into the next one.
      styleElement?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensKey]);

  return null;
}
