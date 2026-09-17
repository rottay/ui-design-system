/**
 * Vertical mark label: the anchor and its gap must land on the SAME physical
 * side in both reading directions.
 *
 * The defect this pins: the vertical mark label anchored with a PHYSICAL
 * `left: '100%'` while the skin spaced it with a LOGICAL `margin-inline-start`.
 * Under `dir=rtl` the two disagree -- the anchor stays on the physical left
 * edge while the gap moves to the physical right -- so the label lands on the
 * far side of the root and touches the rail with no separation at all.
 *
 * Neither DOM runner lays out or resolves logical properties (happy-dom
 * reports `inset-inline-start` back verbatim and never fills `left`/`right`,
 * and every rect is zero), so the physical side is DERIVED here the way the
 * cascade derives it: the declared inline-axis property is read off
 * `getComputedStyle`, the element's reading direction is resolved from its
 * nearest `[dir]` ancestor, and the pair is mapped to a physical edge. The
 * assertions are about that resolved edge, never about a class or a data
 * attribute.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import ModernSlider from '../engines/modern';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/slider/index.css'),
  'utf8',
);

type PhysicalSide = 'left' | 'right';

/** The reading direction the cascade would give this element. */
function resolvedDirection(element: Element): 'ltr' | 'rtl' {
  let node: Element | null = element;
  while (node) {
    const declared = node.getAttribute('dir');
    if (declared === 'rtl' || declared === 'ltr') return declared;
    node = node.parentElement;
  }
  return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
}

function inlineStartSide(direction: 'ltr' | 'rtl'): PhysicalSide {
  return direction === 'rtl' ? 'right' : 'left';
}

function inlineEndSide(direction: 'ltr' | 'rtl'): PhysicalSide {
  return direction === 'rtl' ? 'left' : 'right';
}

/** The physical edge a declared inline-axis property resolves to. */
function physicalSideOf(property: string, direction: 'ltr' | 'rtl'): PhysicalSide {
  if (property.endsWith('inline-start')) return inlineStartSide(direction);
  if (property.endsWith('inline-end')) return inlineEndSide(direction);
  if (property.endsWith('left')) return 'left';
  if (property.endsWith('right')) return 'right';
  throw new Error(`not an inline-axis property: ${property}`);
}

const INSET_PROPERTIES = ['inset-inline-start', 'inset-inline-end', 'left', 'right'];

/** The element's inline-axis anchor, resolved to a physical edge. */
function anchorOf(element: Element): { side: PhysicalSide; property: string; value: string } {
  const direction = resolvedDirection(element);
  const computed = getComputedStyle(element);
  const declared = INSET_PROPERTIES
    .map((property) => ({ property, value: computed.getPropertyValue(property).trim() }))
    .filter((entry) => entry.value !== '');
  expect(declared.map((entry) => entry.property)).toHaveLength(1);
  const [only] = declared;
  return { side: physicalSideOf(only!.property, direction), property: only!.property, value: only!.value };
}

/**
 * The gap the skin puts between the rail and the vertical label, resolved to a
 * physical edge for the same direction. Read from the skin file because no
 * stylesheet is attached to the test document.
 */
function skinGapSide(direction: 'ltr' | 'rtl'): PhysicalSide {
  const rule = skin.match(
    /\[data-part='mark-label'\]\[data-axis='y'\]\s*\{([^}]*)\}/,
  );
  expect(rule).not.toBeNull();
  const margin = rule![1]!.match(/(margin-(?:inline-start|inline-end|left|right))\s*:/);
  expect(margin).not.toBeNull();
  return physicalSideOf(margin![1]!, direction);
}

function renderVerticalMarks(locale: 'en' | 'ar') {
  return render(
    <I18nProvider locale={locale}>
      <ModernSlider vertical min={0} max={100} defaultValue={40} marks={{ 0: 'Min', 100: 'Max' }} />
    </I18nProvider>,
  );
}

async function verticalMarkLabel(container: HTMLElement, direction: 'ltr' | 'rtl'): Promise<Element> {
  await waitFor(() => {
    expect(document.documentElement.dir).toBe(direction);
  });
  const label = container.querySelector("[data-part='mark-label'][data-axis='y']");
  expect(label).not.toBeNull();
  return label!;
}

afterEach(() => {
  document.documentElement.dir = '';
});

describe('Slider modern vertical mark label -- direction', () => {
  it('keeps the anchor on the gap side under RTL', async () => {
    const { container, unmount } = renderVerticalMarks('ar');
    const label = await verticalMarkLabel(container, 'rtl');

    const anchor = anchorOf(label);
    expect(anchor.value).toBe('100%');
    // dir=rtl: the inline axis runs right-to-left, so the label's anchor edge
    // and the skin's gap must both be the physical RIGHT.
    expect(anchor.side).toBe('right');
    expect(anchor.side).toBe(skinGapSide('rtl'));

    unmount();
  });

  it('keeps the anchor on the gap side under LTR (control)', async () => {
    const { container, unmount } = renderVerticalMarks('en');
    const label = await verticalMarkLabel(container, 'ltr');

    const anchor = anchorOf(label);
    expect(anchor.value).toBe('100%');
    expect(anchor.side).toBe('left');
    expect(anchor.side).toBe(skinGapSide('ltr'));

    unmount();
  });

  /**
   * A part may anchor logically only when its skin centering is
   * direction-mirrored. Since INV-01 that is every vertical part but one: the
   * mark label (`margin-inline-start` + a block-axis `translateY`), the handle
   * (`[data-part='handle']:dir(rtl)`, not orientation-scoped), and the track
   * and step dot, which gained their own `:dir(rtl)` mirrors in that lot. The
   * value tooltip is the exception -- its `placement` vocabulary is physical by
   * contract -- so it keeps a physical anchor, named in the physical-properties
   * baseline, and is asserted by the geometry suite below instead.
   */
  it('anchors the direction-mirrored vertical parts on the inline axis', async () => {
    const { container, unmount } = render(
      <I18nProvider locale="ar">
        <ModernSlider
          vertical
          range
          min={0}
          max={100}
          step={25}
          dots
          defaultValue={[25, 75]}
          marks={{ 0: 'Min', 100: 'Max' }}
          tooltip={{ open: true }}
        />
      </I18nProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
    });

    const parts = Array.from(
      container.querySelectorAll(
        "[data-part='handle'], [data-part='mark-label'], [data-part='track'], [data-part='dot']",
      ),
    );
    expect(parts.length).toBeGreaterThan(0);
    for (const part of parts) {
      expect(anchorOf(part).property).toBe('inset-inline-start');
    }

    unmount();
  });
});

/**
 * Vertical inline-axis GEOMETRY (INV-01 / R-S).
 *
 * The defect this pins: the vertical rail anchored logically
 * (`inset-inline-start: 50%`) while its centering shift stayed the physical
 * `translateX(-50%)`, and the track/dot/handle each anchored on a different
 * spelling. Under `dir=rtl` the logical anchor puts the element's inline-START
 * (= physical RIGHT) edge on the centre line, so an unmirrored `-50%` pulls the
 * element a full box width off the rail: the rail and the track centred 4px
 * apart, and the dots left the rail entirely.
 *
 * Neither DOM runner lays out, so the centres are COMPUTED the way the cascade
 * would: the anchor comes from the element's own declaration when it has one
 * and from the skin rule that owns it when it does not, the inline-axis
 * translate comes from the skin rule (base rule, or its `:dir(rtl)` override),
 * and both are resolved to a physical offset from the root's physical left
 * edge. Nothing here reads a class or a data attribute as evidence: an
 * attribute selector is only the ADDRESS of the rule whose numbers are
 * measured. Because a box's centre is affine in its own inline size, each
 * centre is evaluated at several probe sizes instead of assuming one.
 */

const PROBE_SIZES = [0, 4, 8, 16, 100];
const TOLERANCE_PX = 0.5;

/** The skin with comments removed, so a preceding comment never joins a selector. */
const skinRules = skin.replace(/\/\*[\s\S]*?\*\//g, '');

const squash = (text: string): string => text.replace(/\s+/g, ' ').trim();

/**
 * The rules at the top level of the skin. At-rule blocks are consumed whole so
 * a `@media` variant never reads as a second copy of the rule it overrides.
 */
function topLevelRules(css: string): Array<{ selector: string; body: string }> {
  const rules: Array<{ selector: string; body: string }> = [];
  let index = 0;
  while (index < css.length) {
    const open = css.indexOf('{', index);
    if (open === -1) break;
    const prelude = css.slice(index, open);
    let depth = 1;
    let cursor = open + 1;
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === '{') depth += 1;
      else if (css[cursor] === '}') depth -= 1;
      cursor += 1;
    }
    if (!prelude.trim().startsWith('@')) {
      rules.push({ selector: squash(prelude), body: css.slice(open + 1, cursor - 1) });
    }
    index = cursor;
  }
  return rules;
}

const skinRuleList = topLevelRules(skinRules);

/** The single top-level rule whose selector list is exactly this one. */
function ruleBody(selector: string): string {
  const bodies = skinRuleList.filter((rule) => rule.selector === selector).map((rule) => rule.body);
  expect(bodies, `skin rule \`${selector}\``).toHaveLength(1);
  return bodies[0]!;
}

function declarationOf(body: string, property: string): string | null {
  const match = body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`));
  return match ? match[1]!.trim() : null;
}

/** Split on the commas that are not inside a function. */
function splitArguments(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === ',' && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** The arithmetic a CSS length reduces to: + - * / and parentheses. */
function evaluate(text: string): number {
  let index = 0;
  const skipSpace = () => {
    while (text[index] === ' ') index += 1;
  };
  const parsePrimary = (): number => {
    skipSpace();
    if (text[index] === '(') {
      index += 1;
      const value = parseSum();
      skipSpace();
      index += 1;
      return value;
    }
    if (text[index] === '-') {
      index += 1;
      return -parsePrimary();
    }
    const start = index;
    while (index < text.length && /[\d.]/.test(text[index]!)) index += 1;
    const value = Number(text.slice(start, index));
    if (!Number.isFinite(value)) throw new Error(`not a number in "${text}" at ${start}`);
    return value;
  };
  const parseProduct = (): number => {
    let value = parsePrimary();
    for (;;) {
      skipSpace();
      const operator = text[index];
      if (operator !== '*' && operator !== '/') return value;
      index += 1;
      const right = parsePrimary();
      value = operator === '*' ? value * right : value / right;
    }
  };
  const parseSum = (): number => {
    let value = parseProduct();
    for (;;) {
      skipSpace();
      const operator = text[index];
      if (operator !== '+' && operator !== '-') return value;
      index += 1;
      const right = parseProduct();
      value = operator === '+' ? value + right : value - right;
    }
  };
  const result = parseSum();
  skipSpace();
  if (index !== text.length) throw new Error(`unparsed tail in "${text}"`);
  return result;
}

/**
 * A CSS length in px. No stylesheet is attached to the test document, so a
 * `var()` resolves to its fallback -- which is what the cascade uses too, since
 * the skin declares none of these channels itself. A percentage resolves
 * against `basis`: the containing block for an inset or a margin, the element's
 * own border box for a transform.
 */
function resolveLength(expression: string, basis: number): number {
  let text = expression.trim();
  for (let guard = 0; guard < 8 && text.includes('var('); guard += 1) {
    text = text.replace(/var\(\s*--[\w-]+\s*,\s*([^()]*(?:\([^()]*\)[^()]*)*)\)/, '($1)');
  }
  expect(text, `unresolved var() in "${expression}"`).not.toContain('var(');
  text = text.replace(/calc\(/g, '(');
  text = text.replace(/([\d.]+)%/g, (_match, amount: string) => `(${Number(amount) / 100}*${basis})`);
  text = text.replace(/([\d.]+)px/g, '$1');
  return evaluate(text);
}

/** The inline-axis component of the rule's translate, as a CSS length. */
function inlineTranslateExpression(body: string): string {
  const channel = declarationOf(body, '--tw-translate-x');
  if (channel) return channel;
  const transform = declarationOf(body, 'transform');
  if (!transform) return '0px';
  const single = transform.match(/^translateX\((.*)\)$/);
  if (single) return single[1]!;
  if (/^translateY\(/.test(transform)) return '0px';
  const pair = transform.match(/^translate\((.*)\)$/);
  if (pair) return splitArguments(pair[1]!)[0]!;
  throw new Error(`unrecognised inline-axis transform: ${transform}`);
}

const INSET_DECLARATIONS = ['inset-inline-start', 'inset-inline-end', 'left', 'right'];

/** The element's own inline-axis anchor, or null when the skin owns it. */
function inlineAnchor(element: Element): { property: string; value: string } | null {
  const computed = getComputedStyle(element);
  const declared = INSET_DECLARATIONS
    .map((property) => ({ property, value: computed.getPropertyValue(property).trim() }))
    .filter((entry) => entry.value !== '' && entry.value !== 'auto');
  if (declared.length === 0) return null;
  expect(declared.map((entry) => entry.property)).toHaveLength(1);
  return declared[0]!;
}

function skinAnchor(body: string): { property: string; value: string } {
  for (const property of INSET_DECLARATIONS) {
    const value = declarationOf(body, property);
    if (value !== null) return { property, value };
  }
  throw new Error('the skin rule declares no inline-axis anchor');
}

/** The root's inline size in the vertical orientation, straight from the skin. */
const ROOT_INLINE_SIZE = resolveLength(
  declarationOf(ruleBody(".ds-slider.ds-slider--modern[data-orientation='vertical']"), 'inline-size')!,
  0,
);

type PartGeometry = {
  /** The rule that owns the part's inline-axis placement. */
  base: string;
  /** Its `:dir(rtl)` override, when the skin declares one. */
  rtl?: string;
};

/**
 * The part's inline-axis centre, in px from the root's PHYSICAL left edge, for
 * a box of inline size `size`.
 */
function inlineCentre(
  element: Element,
  geometry: PartGeometry,
  direction: 'ltr' | 'rtl',
  size: number,
): number {
  const baseBody = ruleBody(geometry.base);
  const activeBody = direction === 'rtl' && geometry.rtl ? ruleBody(geometry.rtl) : baseBody;
  const anchor = inlineAnchor(element) ?? skinAnchor(baseBody);
  const side = physicalSideOf(anchor.property, direction);
  const inset = resolveLength(anchor.value, ROOT_INLINE_SIZE);
  const gap = declarationOf(baseBody, 'margin-inline-start');
  const margin = gap ? resolveLength(gap, ROOT_INLINE_SIZE) : 0;
  // The anchored edge is the inline-start edge, and `margin-inline-start` sits
  // on that same side, so both are measured from the anchor's physical edge.
  const startEdge = side === 'left'
    ? inset + margin
    : ROOT_INLINE_SIZE - inset - margin - size;
  const translate = resolveLength(inlineTranslateExpression(activeBody), size);
  return startEdge + size / 2 + translate;
}

const VERTICAL_SCOPE = ".ds-slider.ds-slider--modern[data-orientation='vertical']";
const ROOT_SCOPE = ".ds-slider.ds-slider--modern[data-part='root'][data-orientation='vertical']";

/** The parts the contract centres ON the rail, with the rules that place them. */
const CENTRED_PARTS: Array<{ part: string; geometry: PartGeometry }> = [
  {
    part: 'rail',
    geometry: {
      base: `${VERTICAL_SCOPE} [data-part='rail']`,
      rtl: `${VERTICAL_SCOPE} [data-part='rail']:dir(rtl)`,
    },
  },
  {
    part: 'track',
    geometry: {
      base: `${VERTICAL_SCOPE} [data-part='track']`,
      rtl: `${VERTICAL_SCOPE} [data-part='track']:dir(rtl)`,
    },
  },
  {
    part: 'handle',
    geometry: {
      base: `${VERTICAL_SCOPE} [data-part='handle']`,
      rtl: ".ds-slider.ds-slider--modern [data-part='handle']:dir(rtl)",
    },
  },
  {
    part: 'dot',
    geometry: {
      base: `${ROOT_SCOPE} [data-part='dot']`,
      rtl: `${ROOT_SCOPE} [data-part='dot']:dir(rtl)`,
    },
  },
];

const TOOLTIP_GEOMETRY: PartGeometry = {
  base: `${VERTICAL_SCOPE} [data-part='tooltip'][data-placement='right']`,
};

const MARK_LABEL_GEOMETRY: PartGeometry = {
  base: ".ds-slider.ds-slider--modern [data-part='mark-label'][data-axis='y']",
};

function renderVerticalGeometry(locale: 'en' | 'ar') {
  return render(
    <I18nProvider locale={locale}>
      <ModernSlider
        vertical
        range
        min={0}
        max={100}
        step={25}
        dots
        defaultValue={[25, 75]}
        marks={{ 0: 'Min', 100: 'Max' }}
        tooltip={{ open: true }}
      />
    </I18nProvider>,
  );
}

function firstPart(container: HTMLElement, part: string): Element {
  const element = container.querySelector(`[data-part='${part}']`);
  expect(element, `[data-part='${part}']`).not.toBeNull();
  return element!;
}

describe('Slider modern vertical geometry -- one inline centre line in both directions', () => {
  it.each(['ltr', 'rtl'] as const)(
    'centres the rail, track, handle and dot on the rail line under dir=%s',
    async (direction) => {
      const { container, unmount } = renderVerticalGeometry(direction === 'rtl' ? 'ar' : 'en');
      await waitFor(() => {
        expect(document.documentElement.dir).toBe(direction);
      });

      const railLine = ROOT_INLINE_SIZE / 2;
      for (const { part, geometry } of CENTRED_PARTS) {
        const element = firstPart(container, part);
        for (const size of PROBE_SIZES) {
          const centre = inlineCentre(element, geometry, direction, size);
          expect(
            Math.abs(centre - railLine),
            `${part} centre at inline size ${size}px: ${centre} vs rail line ${railLine}`,
          ).toBeLessThanOrEqual(TOLERANCE_PX);
        }
      }

      unmount();
    },
  );

  it('places the value tooltip identically in both directions (physical placement contract)', async () => {
    const ltr = renderVerticalGeometry('en');
    await waitFor(() => expect(document.documentElement.dir).toBe('ltr'));
    const ltrCentres = PROBE_SIZES.map((size) =>
      inlineCentre(firstPart(ltr.container, 'tooltip'), TOOLTIP_GEOMETRY, 'ltr', size));
    ltr.unmount();

    const rtl = renderVerticalGeometry('ar');
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
    const rtlCentres = PROBE_SIZES.map((size) =>
      inlineCentre(firstPart(rtl.container, 'tooltip'), TOOLTIP_GEOMETRY, 'rtl', size));
    rtl.unmount();

    // `placement` is 'left' | 'right' -- a physical vocabulary -- so the bubble
    // keeps the physical side it was asked for. Moving it under RTL would be
    // the defect, not the fix.
    PROBE_SIZES.forEach((size, index) => {
      expect(
        Math.abs(ltrCentres[index]! - rtlCentres[index]!),
        `tooltip centre at inline size ${size}px: ${ltrCentres[index]} (ltr) vs ${rtlCentres[index]} (rtl)`,
      ).toBeLessThanOrEqual(TOLERANCE_PX);
    });
  });

  it('mirrors the vertical mark label about the rail line (logical placement)', async () => {
    const ltr = renderVerticalGeometry('en');
    await waitFor(() => expect(document.documentElement.dir).toBe('ltr'));
    const ltrCentres = PROBE_SIZES.map((size) =>
      inlineCentre(firstPart(ltr.container, 'mark-label'), MARK_LABEL_GEOMETRY, 'ltr', size));
    ltr.unmount();

    const rtl = renderVerticalGeometry('ar');
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
    const rtlCentres = PROBE_SIZES.map((size) =>
      inlineCentre(firstPart(rtl.container, 'mark-label'), MARK_LABEL_GEOMETRY, 'rtl', size));
    rtl.unmount();

    // The label's anchor AND its gap are logical, so it changes side with the
    // reading direction while keeping the same distance from the rail line.
    PROBE_SIZES.forEach((size, index) => {
      const mirrored = ROOT_INLINE_SIZE - ltrCentres[index]!;
      expect(
        Math.abs(mirrored - rtlCentres[index]!),
        `mark-label centre at inline size ${size}px: ${rtlCentres[index]} vs mirrored ${mirrored}`,
      ).toBeLessThanOrEqual(TOLERANCE_PX);
    });
  });
});
