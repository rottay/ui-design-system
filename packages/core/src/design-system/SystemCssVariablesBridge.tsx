'use client';

import { useEffect } from 'react';

import { useTokens } from '../hooks/tokens';
import { resolvePersonalityCssVariables } from '../core/personality/primitives';

/**
 * Bridges resolved runtime tokens into CSS variables that non-React styling
 * paths still consume directly.
 *
 * Why this exists:
 * - product profiles and tenant overrides are resolved in JS via `useTokens()`
 * - some primitives still style themselves with CSS variables or keyframes
 * - pushing the resolved values back into the DOM keeps those paths aligned
 *   without forcing every component to re-implement token resolution logic
 */
export function SystemCssVariablesBridge(): null {
  const tokens = useTokens();

  useEffect(() => {
    const rootElement = document.documentElement;
    const cssVariables = Object.entries(resolvePersonalityCssVariables(tokens));

    cssVariables.forEach(([name, value]) => {
      rootElement.style.setProperty(name, String(value));
    });

    return () => {
      cssVariables.forEach(([name]) => {
        rootElement.style.removeProperty(name);
      });
    };
  }, [tokens]);

  return null;
}
