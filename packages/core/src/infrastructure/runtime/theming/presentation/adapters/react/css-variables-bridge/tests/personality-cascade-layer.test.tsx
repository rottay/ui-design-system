/**
 * @fileoverview Personality cascade-layer tests - Rottay Design System
 * @description Pins WHERE in the cascade the bridge writes, which is what
 * makes runtime personality a subordinate namespaced data channel below the
 * static tenant artifacts.
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

function makeTokens(primary: string, personality = DEFAULT_PERSONALITY) {
  return {
    colors: { primary },
    personality,
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

/**
 * Gives the node the bridge CREATES a layer-capable stylesheet, without putting
 * anything at `#ds-personality-tokens` first.
 *
 * Pre-mounting a node at that id is not a way to hand the bridge a better
 * CSSOM -- it is an INCUMBENT, and the ownership law refuses incumbents
 * outright. A harness that pre-mounted one was therefore not exercising the
 * layered path at all: the bridge published nothing, so its drills either read
 * an empty sheet or passed vacuously against a channel nobody wrote.
 *
 * `.sheet` is shimmed on the created element instead, installed before the
 * bridge first reads it so the claim is taken against THIS object and every
 * later ownership proof compares against the same identity. Only the first
 * `<style>` is shimmed: the bridge creates exactly one, and leaving the rest
 * alone keeps the fallback drills on the real environment.
 */
function shimSheetOnCreatedStyleElement() {
  const sheet = createLayerCapableSheet();
  let created: HTMLStyleElement | null = null;
  const real = document.createElement.bind(document);

  vi.spyOn(document, 'createElement').mockImplementation(((
    tagName: string,
    options?: ElementCreationOptions,
  ) => {
    const element = real(tagName, options);
    if (tagName === 'style' && !created) {
      created = element as HTMLStyleElement;
      Object.defineProperty(element, 'sheet', {
        get: () => sheet,
        configurable: true,
      });
    }
    return element;
  }) as unknown as typeof document.createElement);

  return { sheet, element: () => created as HTMLStyleElement };
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
    // The created-element shim is a spy on `document.createElement`; leaving it
    // installed would follow the next test into a path it did not ask for.
    vi.restoreAllMocks();
    resetDom();
  });

  describe('layer-capable CSSOM (real browsers)', () => {
    it('writes the personality rule inside the personality layer', () => {
      const { sheet } = shimSheetOnCreatedStyleElement();

      render(<SystemCssVariablesBridge />);

      const layerBlock = sheet.cssRules[1] as { layerName?: string };
      expect(layerBlock.layerName).toBe(PERSONALITY_CASCADE_LAYER);
    });

    it('never leaves an unlayered rule behind that would outrank every layer', () => {
      const { sheet } = shimSheetOnCreatedStyleElement();

      render(<SystemCssVariablesBridge />);

      // Pinned first, because "no unlayered rule" is also what an EMPTY sheet
      // says. Without this the drill passed hardest in exactly the case it
      // exists to catch: a bridge that published nothing at all.
      expect(sheet.cssRules).toHaveLength(2);
      const unlayered = sheet.cssRules.filter(
        (rule) => rule.selectorText !== undefined && rule.layerName === undefined,
      );
      expect(unlayered).toEqual([]);
    });

    it('pins the layer position so resolution does not depend on import order', () => {
      // The order statement is emitted BEFORE the rule. Layers are ordered by
      // first appearance, so without this the name would register at whatever
      // position this stylesheet happened to load at.
      const { sheet } = shimSheetOnCreatedStyleElement();

      render(<SystemCssVariablesBridge />);

      const statement = sheet.cssRules[0] as { cssText?: string; isOrderStatement?: boolean };
      expect(statement.isOrderStatement).toBe(true);
      expect(statement.cssText).toBe(`@layer ${ROTTAY_CASCADE_LAYER_ORDER.join(', ')};`);
    });

    it('writes token values into the layered rule', () => {
      const { sheet } = shimSheetOnCreatedStyleElement();

      render(<SystemCssVariablesBridge />);

      const layerBlock = sheet.cssRules[1] as {
        cssRules: { style: { getPropertyValue: (n: string) => string } }[];
      };
      expect(
        layerBlock.cssRules[0].style.getPropertyValue(
          '--_ds-personality-resolved-card-border',
        ),
      ).toBe(
        'var(--ds-color-border-primary)',
      );
      expect(layerBlock.cssRules[0].style.getPropertyValue('--ds-card-border')).toBe('');
    });

    it('reports the layered path in the DOM', () => {
      const { element } = shimSheetOnCreatedStyleElement();

      render(<SystemCssVariablesBridge />);

      expect(element().getAttribute('data-ds-cascade')).toBe('layered');
    });
  });

  describe('CSSOM without @layer support (happy-dom fallback)', () => {
    it('still applies personality rather than emitting nothing', () => {
      render(<SystemCssVariablesBridge />);

      const element = document.getElementById(STYLE_ID) as HTMLStyleElement;
      const rule = element.sheet?.cssRules[0] as CSSStyleRule;
      expect(rule.selectorText).toBe(':root');
      expect(
        rule.style.getPropertyValue('--_ds-personality-resolved-card-border'),
      ).toBe(
        'var(--ds-color-border-primary)',
      );
      expect(rule.style.getPropertyValue('--ds-card-border')).toBe('');
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
      const { sheet } = shimSheetOnCreatedStyleElement();
      const { rerender } = render(<SystemCssVariablesBridge />);

      // The switch has to change something the bridge actually PUBLISHES, or
      // the repaint this test is named for never happens: `colors.primary`
      // alone reaches no personality variable, so the effect correctly skips.
      currentTokens = makeTokens('#0ea5e9', {
        ...DEFAULT_PERSONALITY,
        animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.4 },
      });
      rerender(<SystemCssVariablesBridge />);

      // One order statement + one layer block, not two of each.
      expect(sheet.cssRules).toHaveLength(2);
      const layerBlock = sheet.cssRules[1] as {
        layerName?: string;
        cssRules: { style: { getPropertyValue: (n: string) => string } }[];
      };
      expect(layerBlock.layerName).toBe(PERSONALITY_CASCADE_LAYER);
      expect(
        layerBlock.cssRules[0].style.getPropertyValue(
          '--ds-personality-animation-hover-scale',
        ),
      ).toBe('1.4');
    });

    it('keeps a single stylesheet across a light/dark switch', () => {
      render(<SystemCssVariablesBridge />);
      document.documentElement.setAttribute('data-theme', 'dark');

      currentTokens = makeTokens('#111111');
      cleanup();
      render(<SystemCssVariablesBridge />);

      expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    });

    it('removes a stylesheet it created itself so a switch cannot leak values', () => {
      const { unmount } = render(<SystemCssVariablesBridge />);
      expect(document.getElementById(STYLE_ID)).not.toBeNull();

      unmount();

      expect(document.getElementById(STYLE_ID)).toBeNull();
    });

    /* This drill used to PRE-MOUNT a node at the id to hand the bridge a
       layer-capable CSSOM, then assert the bridge gave it back with its own
       marks removed. Both halves contradicted the ownership law at once: an
       incumbent is never adopted, so there was no mark to remove and no rule
       written, and the "hand-back" it claimed to prove had nothing to hand
       back. The layered drills above now shim the sheet on the node the bridge
       CREATES, which leaves this file free to state what an incumbent is
       actually owed -- nothing happens to it, at mount or at release. */
    it('leaves a layer-capable incumbent untouched instead of adopting its sheet', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const incumbent = document.createElement('style');
        incumbent.id = STYLE_ID;
        const sheet = createLayerCapableSheet();
        Object.defineProperty(incumbent, 'sheet', {
          get: () => sheet,
          configurable: true,
        });
        document.head.appendChild(incumbent);

        const { unmount } = render(<SystemCssVariablesBridge />);

        // Refused: no ownership mark, no cascade mark, no rule, and no second
        // node mounted beside it to publish into instead.
        expect(incumbent.getAttributeNames().sort()).toEqual(['id']);
        expect(sheet.cssRules).toEqual([]);
        expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);

        unmount();

        // And the release deletes nothing, because the claim never took it.
        expect(document.getElementById(STYLE_ID)).toBe(incumbent);
        expect(incumbent.getAttributeNames().sort()).toEqual(['id']);
        expect(sheet.cssRules).toEqual([]);
      } finally {
        warn.mockRestore();
      }
    });

    it('never stamps personality variables inline on the document element', () => {
      shimSheetOnCreatedStyleElement();

      render(<SystemCssVariablesBridge />);

      expect(document.documentElement.style.getPropertyValue('--ds-card-border')).toBe('');
      expect(document.documentElement.getAttribute('style')).toBeNull();
    });
  });
});
