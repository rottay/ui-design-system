/**
 * @fileoverview Personality cascade-layer tests - Rottay Design System
 * @description Pins WHERE in the cascade the bridge writes, which is what
 * decides the winner between runtime personality and the static tenant
 * artifacts.
 *
 * Previously the bridge wrote an UNLAYERED `:root` rule. Unlayered
 * declarations outrank every cascade layer, so the bridge beat artifacts that
 * were imported with `layer(rottay-tenants)` (bithire, evnto) and lost to the
 * one imported without it (rottay) -- the winner was decided by entrypoint
 * authoring, not by the declared order. The bridge now writes inside
 * `@layer rottay-personality`.
 *
 * `happy-dom` cannot parse `@layer` through CSSOM at all: `insertRule` throws
 * on any `@layer` text. The bridge therefore degrades to an unlayered rule
 * there, and BOTH paths are covered here -- the layered path against a
 * layer-capable stylesheet shim, the fallback against the real environment.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

import { SystemCssVariablesBridge } from '..';
import {
  PERSONALITY_CASCADE_LAYER,
  ROTTAY_CASCADE_LAYER_ORDER,
} from '@/infrastructure/runtime/theming/foundation/cascade-layers';
import { DEFAULT_PERSONALITY } from '@/infrastructure/runtime/personality/foundation/defaults';

const STYLE_ID = 'ds-personality-tokens';

/** Mutable so tenant/theme switches can be simulated between renders. */
let currentTokens = makeTokens('#4f46e5');

function makeTokens(primary: string) {
  return {
    colors: { primary },
    personality: DEFAULT_PERSONALITY,
    transitions: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  };
}

vi.mock('@/infrastructure/runtime/theming/composition/react/tokens', () => ({
  useTokens: () => currentTokens,
}));

/** Minimal declaration block backed by a Map. */
function createStyleDeclaration() {
  const declarations = new Map<string, string>();
  return {
    declarations,
    setProperty: (name: string, value: string) => declarations.set(name, value),
    getPropertyValue: (name: string) => declarations.get(name) ?? '',
  };
}

/**
 * A stylesheet that understands `@layer`, standing in for a real browser CSSOM.
 * Only the surface the bridge touches is implemented.
 */
function createLayerCapableSheet() {
  const cssRules: Record<string, unknown>[] = [];
  return {
    cssRules,
    insertRule(text: string, index: number) {
      let rule: Record<string, unknown>;
      const blockMatch = text.match(/^@layer\s+([\w-]+)\s*\{/);
      if (/^@layer\s+[^{]+;$/.test(text)) {
        rule = { cssText: text, isOrderStatement: true };
      } else if (blockMatch) {
        rule = {
          layerName: blockMatch[1],
          cssRules: [{ selectorText: ':root', style: createStyleDeclaration() }],
        };
      } else {
        rule = { selectorText: ':root', style: createStyleDeclaration() };
      }
      cssRules.splice(index, 0, rule);
      return index;
    },
    deleteRule(index: number) {
      cssRules.splice(index, 1);
    },
  };
}

/** Pre-mounts the style element the bridge reuses, with a layer-capable sheet. */
function mountLayerCapableStyleElement() {
  const element = document.createElement('style');
  element.id = STYLE_ID;
  const sheet = createLayerCapableSheet();
  Object.defineProperty(element, 'sheet', { get: () => sheet, configurable: true });
  document.head.appendChild(element);
  return { element, sheet };
}

function resetDom() {
  document.head.innerHTML = '';
  document.documentElement.removeAttribute('style');
  document.documentElement.removeAttribute('data-tenant');
  document.documentElement.removeAttribute('data-theme');
}

describe('personality cascade layer', () => {
  beforeEach(() => {
    currentTokens = makeTokens('#4f46e5');
    resetDom();
  });

  afterEach(() => {
    cleanup();
    resetDom();
  });

  describe('layer-capable CSSOM (real browsers)', () => {
    it('writes the personality rule inside the personality layer', () => {
      const { sheet } = mountLayerCapableStyleElement();

      render(<SystemCssVariablesBridge />);

      const layerBlock = sheet.cssRules[1] as { layerName?: string };
      expect(layerBlock.layerName).toBe(PERSONALITY_CASCADE_LAYER);
    });

    it('never leaves an unlayered rule behind that would outrank every layer', () => {
      const { sheet } = mountLayerCapableStyleElement();

      render(<SystemCssVariablesBridge />);

      const unlayered = sheet.cssRules.filter(
        (rule) => rule.selectorText !== undefined && rule.layerName === undefined,
      );
      expect(unlayered).toEqual([]);
    });

    it('pins the layer position so resolution does not depend on import order', () => {
      // The order statement is emitted BEFORE the rule. Layers are ordered by
      // first appearance, so without this the name would register at whatever
      // position this stylesheet happened to load at.
      const { sheet } = mountLayerCapableStyleElement();

      render(<SystemCssVariablesBridge />);

      const statement = sheet.cssRules[0] as { cssText?: string; isOrderStatement?: boolean };
      expect(statement.isOrderStatement).toBe(true);
      expect(statement.cssText).toBe(`@layer ${ROTTAY_CASCADE_LAYER_ORDER.join(', ')};`);
    });

    it('writes token values into the layered rule', () => {
      const { sheet } = mountLayerCapableStyleElement();

      render(<SystemCssVariablesBridge />);

      const layerBlock = sheet.cssRules[1] as {
        cssRules: { style: { getPropertyValue: (n: string) => string } }[];
      };
      expect(layerBlock.cssRules[0].style.getPropertyValue('--ds-card-border')).toBe(
        'var(--ds-color-border-primary)',
      );
    });

    it('reports the layered path in the DOM', () => {
      const { element } = mountLayerCapableStyleElement();

      render(<SystemCssVariablesBridge />);

      expect(element.getAttribute('data-ds-cascade')).toBe('layered');
    });
  });

  describe('CSSOM without @layer support (happy-dom fallback)', () => {
    it('still applies personality rather than emitting nothing', () => {
      render(<SystemCssVariablesBridge />);

      const element = document.getElementById(STYLE_ID) as HTMLStyleElement;
      const rule = element.sheet?.cssRules[0] as CSSStyleRule;
      expect(rule.selectorText).toBe(':root');
      expect(rule.style.getPropertyValue('--ds-card-border')).toBe(
        'var(--ds-color-border-primary)',
      );
    });

    it('reports the fallback path in the DOM', () => {
      render(<SystemCssVariablesBridge />);

      const element = document.getElementById(STYLE_ID) as HTMLStyleElement;
      expect(element.getAttribute('data-ds-cascade')).toBe('unlayered');
    });

    it('leaves no stray layer statement behind when the layered path fails', () => {
      render(<SystemCssVariablesBridge />);

      const element = document.getElementById(STYLE_ID) as HTMLStyleElement;
      expect(element.sheet?.cssRules).toHaveLength(1);
    });
  });

  describe('lifecycle', () => {
    it('replaces rules on a tenant switch instead of stacking them', () => {
      const { sheet } = mountLayerCapableStyleElement();
      const { rerender } = render(<SystemCssVariablesBridge />);

      currentTokens = makeTokens('#0ea5e9');
      rerender(<SystemCssVariablesBridge />);

      // One order statement + one layer block, not two of each.
      expect(sheet.cssRules).toHaveLength(2);
      expect((sheet.cssRules[1] as { layerName?: string }).layerName).toBe(
        PERSONALITY_CASCADE_LAYER,
      );
    });

    it('keeps a single stylesheet across a light/dark switch', () => {
      render(<SystemCssVariablesBridge />);
      document.documentElement.setAttribute('data-theme', 'dark');

      currentTokens = makeTokens('#111111');
      cleanup();
      render(<SystemCssVariablesBridge />);

      expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    });

    it('removes the stylesheet on unmount so a switch cannot leak values', () => {
      mountLayerCapableStyleElement();
      const { unmount } = render(<SystemCssVariablesBridge />);
      expect(document.getElementById(STYLE_ID)).not.toBeNull();

      unmount();

      expect(document.getElementById(STYLE_ID)).toBeNull();
    });

    it('never stamps personality variables inline on the document element', () => {
      mountLayerCapableStyleElement();

      render(<SystemCssVariablesBridge />);

      expect(document.documentElement.style.getPropertyValue('--ds-card-border')).toBe('');
      expect(document.documentElement.getAttribute('style')).toBeNull();
    });
  });
});
