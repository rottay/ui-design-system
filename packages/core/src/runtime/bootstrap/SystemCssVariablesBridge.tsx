'use client';

/**
 * @fileoverview SystemCssVariablesBridge - Rottay Design System
 * @description Synchronizes JS-resolved design tokens (personality, surface, motion)
 * into CSS custom properties on `document.documentElement`, keeping React-driven
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
 * Variables are cleaned up on unmount so tenant switching and test isolation
 * do not leak values across render trees.
 *
 * @see {@link useTokens} - Hook that resolves the merged token graph
 * @see {@link resolvePersonalityCssVariables} - Maps tokens to CSS variable names
 * @module System/Providers/CssVariablesBridge
 * @category System
 * @package @rottay/design-system
 */

import { useEffect } from 'react';

import { useTokens } from '../../hooks/tokens';
import { resolvePersonalityCssVariables } from '../personality/primitives';

/**
 * Renders nothing visually. Runs a side-effect that writes resolved personality
 * tokens as CSS custom properties on `:root` and cleans them up on unmount.
 */
export function SystemCssVariablesBridge(): null {
  const tokens = useTokens();

  useEffect(() => {
    const rootElement = document.documentElement;
    const cssVariables = Object.entries(resolvePersonalityCssVariables(tokens));

    // Runtime token resolution happens in JS, but several styling paths still
    // consume plain CSS variables. This bridge keeps both worlds in sync.
    cssVariables.forEach(([name, value]) => {
      rootElement.style.setProperty(name, String(value));
    });

    return () => {
      // Cleanup matters for tests, previews, and tenant switching so one render
      // tree does not leak personality values into the next one.
      cssVariables.forEach(([name]) => {
        rootElement.style.removeProperty(name);
      });
    };
  }, [tokens]);

  return null;
}
