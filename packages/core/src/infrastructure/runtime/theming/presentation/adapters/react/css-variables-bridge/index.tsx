'use client';

/**
 * @fileoverview SystemCssVariablesBridge - Rottay Design System
 * @description Synchronizes JS-resolved personality data into namespaced CSS
 * custom properties scoped to `:root`. A static CSS projection—not this
 * bridge—owns the canonical component aliases.
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
 * PRECEDENCE LAW: personality is resolved per product at runtime, so the
 * cascade contract places `rottay-personality` directly above `rottay-tenants`
 * (see `foundation/tokens/css/facade/entrypoints/base.css`). This bridge writes
 * its `:root` rule INSIDE that layer, never as inline styles on
 * `document.documentElement` and never as an unlayered rule.
 *
 * Both exclusions are load-bearing:
 * - Inline styles carry the highest specificity CSS offers and would beat every
 *   tenant declaration, including the scoped `html[data-tenant='x'][data-theme=
 *   'dark']` rules `ThemeProvider` injects for a tenant's `generatedChromeCss`.
 * - An UNLAYERED `:root` rule is not the safe middle ground it looks like.
 *   Unlayered declarations outrank every cascade layer regardless of
 *   specificity, so a bare `:root` here beat the layered tenant artifacts
 *   outright while losing to any artifact that happened to be imported without
 *   a `layer()`. That made the winner depend on how each vertical's entrypoint
 *   was written rather than on the declared order -- the same variable resolved
 *   to personality for one vertical and to the artifact for another.
 *
 * Writing only namespaced inputs into the named layer removes the precedence
 * ambiguity entirely. Static and DB tenant artifacts remain the sole
 * productive tenant painters; the personality CSS projection consumes these
 * values as a subordinate product/vertical data axis.
 *
 * Variables are cleaned up on unmount so tenant switching and test isolation
 * do not leak values across render trees.
 *
 * @see {@link useTokens} - Hook that resolves the merged token graph
 * @see {@link resolvePersonalityBridgeCssVariables} - Maps tokens to
 * namespaced bridge inputs
 * @module System/Providers/CssVariablesBridge
 * @category System
 * @package @rottay/design-system
 */

import { useEffect, useRef } from 'react';

import { resolvePersonalityBridgeCssVariables } from '@/foundation/tokens/ts/runtime/personality';

import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import {
  buildCascadeLayerOrderStatement,
  buildPersonalityRootRuleText,
} from '@/infrastructure/runtime/theming/foundation/cascade-layers';

/** Singleton style element: one bridge instance, one stylesheet, one `:root` rule. */
const PERSONALITY_STYLE_ELEMENT_ID = 'ds-personality-tokens';

/**
 * Records which cascade path the bridge actually took, so the behavior is
 * observable in the DOM instead of inferred.
 */
const CASCADE_MODE_ATTRIBUTE = 'data-ds-cascade';

/**
 * Inserts the empty `:root` rule the bridge writes into, preferring the
 * personality cascade layer and degrading to an unlayered rule.
 *
 * The layer order statement is emitted first so the layer position is pinned
 * even when this stylesheet is evaluated before the DS entrypoint; re-declaring
 * an already registered name does not move it.
 *
 * Every engine that supports cascade layers (Baseline since March 2022) takes
 * the layered path. The fallback exists for CSSOM implementations that cannot
 * parse `@layer` at all -- notably the `happy-dom` test environment, whose
 * `insertRule` throws on any `@layer` text. Falling back to the previous
 * unlayered rule keeps personality applying there rather than silently
 * emitting nothing.
 *
 * @returns The rule to write declarations into, or `null` if neither path worked.
 */
function insertPersonalityRootRule(sheet: CSSStyleSheet): CSSStyleRule | null {
  try {
    sheet.insertRule(buildCascadeLayerOrderStatement(), 0);
    sheet.insertRule(buildPersonalityRootRuleText(), 1);
    const layerBlock = sheet.cssRules[1] as CSSGroupingRule | undefined;
    const layeredRoot = layerBlock?.cssRules?.[0] as CSSStyleRule | undefined;
    if (layeredRoot?.style) return layeredRoot;
  } catch {
    // CSSOM cannot parse `@layer`; fall through to the unlayered rule.
  }

  while (sheet.cssRules.length > 0) {
    sheet.deleteRule(0);
  }
  sheet.insertRule(':root {}', 0);
  return (sheet.cssRules[0] as CSSStyleRule | undefined) ?? null;
}

/**
 * Renders nothing visually. Runs a side-effect that writes resolved personality
 * tokens as a `:root` CSS rule in a dedicated stylesheet and cleans it up on
 * unmount.
 */
export function SystemCssVariablesBridge(): null {
  const tokens = useTokens();
  // Shallow fingerprint instead of JSON.stringify(tokens) for performance.
  // The bridge only feeds tokens into resolvePersonalityBridgeCssVariables which reads
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
    // Only the static layer/selector scaffolding is inserted as text.
    const sheet = styleElement.sheet;
    if (sheet) {
      while (sheet.cssRules.length > 0) {
        sheet.deleteRule(0);
      }
      const rule = insertPersonalityRootRule(sheet);
      styleElement.setAttribute(
        CASCADE_MODE_ATTRIBUTE,
        sheet.cssRules.length > 1 ? 'layered' : 'unlayered',
      );
      if (rule) {
        for (const [name, value] of Object.entries(
          resolvePersonalityBridgeCssVariables(tokens),
        )) {
          rule.style.setProperty(name, String(value));
        }
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
