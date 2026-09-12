/**
 * Tests for responsive style-property runtime projection.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve as resolvePath } from 'node:path';

import { describe, it, expect } from 'vitest';

import {
  isResponsiveValue,
  generateResponsiveCSS,
  type ResponsiveChannelProjection,
  type ResponsivePropEntry,
} from '..';
import {
  RESPONSIVE_CHANNELS,
  RESPONSIVE_CHANNEL_ATTRIBUTE,
  RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE,
  isPriorityResponsiveChannel,
  isResponsiveChannel,
  responsiveChannelSlug,
  responsiveChannelVariable,
  type ResponsiveChannel,
} from '@/foundation/contracts/kernel/responsive/channels';
import {
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import { normalizeResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import {
  SPACING_MAP,
  type BoxProps,
  type BoxSpacing,
} from '@/components/primitives/layout/box/contracts';
import { collectBoxResponsiveEntries } from '@/components/primitives/layout/box/runtime/responsive';
import {
  FLEX_GAP_MAP,
  type FlexGap,
  type FlexGapToken,
  type FlexProps,
} from '@/components/primitives/layout/flex/contracts';
import { collectFlexResponsiveEntries } from '@/components/primitives/layout/flex/runtime/responsive';
import type { StackProps } from '@/components/primitives/layout/stack/contracts';
import { collectStackResponsiveEntries } from '@/components/primitives/layout/stack/runtime/responsive';
import { SIZE_MAP as BADGE_SIZE_MAP } from '@/components/primitives/display/badge/contracts';
import { PADDING_MAP as CARD_PADDING_MAP } from '@/components/primitives/display/card/contracts';
import {
  LINE_HEIGHT_MAP as TYPOGRAPHY_LINE_HEIGHT_MAP,
  SIZE_MAP as TYPOGRAPHY_SIZE_MAP,
  type TextSize,
} from '@/components/primitives/display/typography/contracts';
import { resolveFluidTypographySize } from '@/components/primitives/display/typography/runtime';
import { SIZE_MAP as BUTTON_SIZE_MAP } from '@/components/primitives/inputs/button/contracts';
import { SIZE_MAP as INPUT_SIZE_MAP } from '@/components/primitives/inputs/input/contracts';
import { SIZE_MAP as SELECT_SIZE_MAP } from '@/components/primitives/inputs/select/contracts';

describe('isResponsiveValue', () => {
  it('returns false for plain string values', () => {
    expect(isResponsiveValue('md')).toBe(false);
    expect(isResponsiveValue('block')).toBe(false);
  });

  it('returns false for numbers', () => {
    expect(isResponsiveValue(16)).toBe(false);
    expect(isResponsiveValue(0)).toBe(false);
  });

  it('returns false for null and undefined', () => {
    expect(isResponsiveValue(null)).toBe(false);
    expect(isResponsiveValue(undefined)).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isResponsiveValue([16, 24])).toBe(false);
  });

  it('returns true for objects with breakpoint keys', () => {
    expect(isResponsiveValue({ xs: 'sm', lg: 'xl' })).toBe(true);
    expect(isResponsiveValue({ sm: 'md' })).toBe(true);
    expect(isResponsiveValue({ md: 'lg', xl: '2xl' })).toBe(true);
  });

  it('returns true for objects with alias keys', () => {
    expect(isResponsiveValue({ base: 'sm' })).toBe(true);
    expect(isResponsiveValue({ phone: 'column', tablet: 'row' })).toBe(true);
    expect(isResponsiveValue({ desktop: 'row' })).toBe(true);
  });

  it('returns false for objects with no valid breakpoint keys', () => {
    expect(isResponsiveValue({ foo: 'bar' })).toBe(false);
    expect(isResponsiveValue({ invalid: 123 })).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* what a projection STANDS FOR                                               */
/* -------------------------------------------------------------------------- */

/**
 * Every declaration a projection will produce once the static sheet applies it.
 *
 * The assembler no longer returns CSS text -- it arms `channel@breakpoint`
 * tokens and publishes one custom property per armed step -- so the unit under
 * test is the pair, read back the way the cascade reads it. The key is
 * `channel@breakpoint`; the value is what the sheet will assign there.
 */
type Declared = Record<string, string>;

const channelFor = (slug: string): ResponsiveChannel | undefined =>
  RESPONSIVE_CHANNELS.find((channel) => responsiveChannelSlug(channel) === slug);

const declarationsOf = (projection: ResponsiveChannelProjection): Declared => {
  const style = projection.channels as Record<string, string>;
  const out: Declared = {};

  for (const [attribute, priority] of [
    [RESPONSIVE_CHANNEL_ATTRIBUTE, false],
    [RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE, true],
  ] as const) {
    const tokens = (projection.attrs[attribute] ?? '').split(' ').filter(Boolean);
    for (const token of tokens) {
      const [slug, step] = token.split('@') as [string, ResponsiveBreakpointKey];
      const channel = channelFor(slug);
      expect(channel, `${token} names no governed channel`).toBeDefined();
      const value = style[responsiveChannelVariable(channel!, step)];
      expect(value, `${token} armed a step with no value`).toBeDefined();
      out[`${channel}@${step}`] = priority ? `${value} !important` : value!;
    }
  }

  return out;
};

/** True when the projection declares nothing at all. */
const isEmptyProjection = (projection: ResponsiveChannelProjection): boolean =>
  Object.keys(projection.attrs).length === 0 &&
  Object.keys(projection.channels as Record<string, string>).length === 0;

/** Every custom-property value a projection publishes, in insertion order. */
const valuesOf = (projection: ResponsiveChannelProjection): string[] =>
  Object.values(projection.channels as Record<string, string>);

describe('generateResponsiveCSS', () => {
  it('declares nothing for empty entries', () => {
    expect(isEmptyProjection(generateResponsiveCSS([]))).toBe(true);
  });

  it('arms the xs step with no media dependency of its own', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'padding', value: { xs: 'sm' }, resolve: (v) => (v === 'sm' ? '0.5rem' : '0') },
    ];
    const projection = generateResponsiveCSS(entries);
    expect(projection.attrs).toEqual({ [RESPONSIVE_CHANNEL_ATTRIBUTE]: 'padding@xs' });
    expect(projection.channels).toEqual({ '--_ds-rsp-padding-xs': '0.5rem' });
  });

  it('arms one token per declared step', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'display', value: { xs: 'none', lg: 'block' } },
    ]);
    expect(projection.attrs[RESPONSIVE_CHANNEL_ATTRIBUTE]).toBe('display@xs display@lg');
    expect(declarationsOf(projection)).toEqual({
      'display@xs': 'none',
      'display@lg': 'block',
    });
  });

  it('arms nothing at a step the ladder does not declare', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'padding', value: { lg: '24px' } },
    ]);
    // The skin keeps the element below 1024px: an unarmed step has no rule at
    // all, which a chained `var()` fallback could not express.
    expect(projection.attrs[RESPONSIVE_CHANNEL_ATTRIBUTE]).toBe('padding@lg');
    expect(declarationsOf(projection)).toEqual({ 'padding@lg': '24px' });
  });

  it('resolves alias keys to canonical breakpoints', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'flex-direction', value: { phone: 'column', tablet: 'row', desktop: 'row-reverse' } },
    ]);
    expect(declarationsOf(projection)).toEqual({
      'flex-direction@xs': 'column',
      'flex-direction@sm': 'row',
      'flex-direction@lg': 'row-reverse',
    });
  });

  it('resolves base alias to xs', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'gap', value: { base: '8px', md: '16px' } },
    ]);
    expect(declarationsOf(projection)).toEqual({ 'gap@xs': '8px', 'gap@md': '16px' });
  });

  it('handles multiple channels at the same breakpoint', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'padding', value: { xs: '8px', lg: '24px' } },
      { cssProperty: 'margin', value: { xs: '4px', lg: '16px' } },
    ]);
    expect(declarationsOf(projection)).toEqual({
      'padding@xs': '8px',
      'padding@lg': '24px',
      'margin@xs': '4px',
      'margin@lg': '16px',
    });
  });

  it('uses a custom resolve function', () => {
    const entries: ResponsivePropEntry<number>[] = [
      { cssProperty: 'gap', value: { xs: 16, lg: 32 }, resolve: (v: number) => `${v}px` },
    ];
    expect(declarationsOf(generateResponsiveCSS(entries))).toEqual({
      'gap@xs': '16px',
      'gap@lg': '32px',
    });
  });

  it('canonical key takes precedence over alias', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'display', value: { xs: 'flex', phone: 'block' } },
    ]);
    expect(declarationsOf(projection)).toEqual({ 'display@xs': 'flex' });
  });

  it('refuses a channel the static sheet does not declare', () => {
    // A rule that does not exist paints nothing; arming it would be a silent
    // no-op rather than a visible refusal.
    expect(isEmptyProjection(generateResponsiveCSS([
      { cssProperty: 'backdrop-filter', value: { xs: 'blur(4px)' } },
    ]))).toBe(true);
  });

  it('refuses priority on a channel outside the priority vocabulary', () => {
    expect(isPriorityResponsiveChannel('display')).toBe(false);
    expect(isEmptyProjection(generateResponsiveCSS([
      { cssProperty: 'display', value: { xs: 'flex !important' } },
    ]))).toBe(true);
  });

  it('carries priority on the attribute, never inside the value', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'height', value: { xs: '32px !important', lg: '48px' } },
    ]);
    // Priority is per ENTRY: a channel important at one width and ordinary at
    // another would invert its own mobile-first cascade.
    expect(projection.attrs).toEqual({
      [RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE]: 'height@xs height@lg',
    });
    expect(projection.channels).toEqual({
      '--_ds-rsp-height-xs': '32px',
      '--_ds-rsp-height-lg': '48px',
    });
  });
});

/* -------------------------------------------------------------------------- */
/* the assembler admits through the canonical value authority                 */
/* -------------------------------------------------------------------------- */

/**
 * The audit payload: a free-string dimension prop that closes the element rule,
 * opens a rule of its own against `body`, and leaves a marker selector behind.
 */
const HOSTILE_WIDTH = '100%; } body { display: none; } .fable-escape {';

describe('generateResponsiveCSS refuses what it cannot safely declare', () => {
  it('omits a hostile free-string dimension value whole, and repairs nothing', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'width', value: { xs: HOSTILE_WIDTH } },
    ]);

    expect(isEmptyProjection(projection)).toBe(true);
    expect(valuesOf(projection).join('')).not.toContain('body');
    expect(valuesOf(projection).join('')).not.toContain('fable-escape');
    // Refused, not escaped: no rewritten remnant of the payload survives.
    expect(valuesOf(projection).join('')).not.toContain('100%');
  });

  it('omits the hostile step and keeps the admissible one', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'width', value: { xs: '100%', lg: HOSTILE_WIDTH } },
    ]);

    expect(declarationsOf(projection)).toEqual({ 'width@xs': '100%' });
  });

  it('drops only the inadmissible declaration, never its siblings', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: 'width', value: { xs: HOSTILE_WIDTH } },
      { cssProperty: 'height', value: { xs: '48px' } },
      { cssProperty: 'display', value: { xs: 'flex' } },
    ]);

    expect(declarationsOf(projection)).toEqual({
      'height@xs': '48px',
      'display@xs': 'flex',
    });
  });

  it.each([
    ['declaration terminator', 'red; color: blue'],
    ['rule close', '100%} body {display:none'],
    ['style element close', '</style><style>body{display:none}'],
    ['comment open', '/* 8px'],
    ['fetch', 'url(https://evil.example/x.css)'],
    ['data url', 'data:text/css,body-display-none'],
    ['escape', '\\7d body'],
    ['at-rule outside quotes', '@import "https://evil.example/x.css"'],
    ['unknown function', 'expression(alert(1))'],
    ['control character', `8px${String.fromCharCode(0)}`],
    ['unbalanced parenthesis', 'calc(8px'],
    ['over the length ceiling', 'a'.repeat(513)],
    ['leading whitespace', ' 8px'],
  ])('omits a %s payload', (_label, payload) => {
    expect(isEmptyProjection(generateResponsiveCSS([
      { cssProperty: 'width', value: { xs: payload } },
    ]))).toBe(true);
  });

  it('refuses a hostile PROPERTY name', () => {
    expect(isEmptyProjection(generateResponsiveCSS([
      { cssProperty: 'width: 1px; } body { color', value: { xs: 'red' } },
      { cssProperty: 'WIDTH', value: { xs: '1px' } },
      { cssProperty: '', value: { xs: '1px' } },
    ]))).toBe(true);

    // The custom-property branch is closed by NAME too: only the channels the
    // static sheet declares exist, so no spelling reaches the cascade.
    for (const cssProperty of [
      '--x}',
      '--x;',
      '--x:y',
      '--x{',
      '--X',
      '--x y',
      '--x</style>',
      '--ds-colour-primary',
    ]) {
      const refused = generateResponsiveCSS([{ cssProperty, value: { xs: '1px' } }]);
      expect(isEmptyProjection(refused), `${cssProperty} was declared`).toBe(true);
    }
  });

  it('refuses a resolver that answers with something that is not a string', () => {
    const projection = generateResponsiveCSS([
      {
        cssProperty: 'gap',
        value: { xs: 'toString' },
        // The prototype leak the collectors own-property guards close: without
        // this refusal a function body would be stamped into the style attribute.
        resolve: ((v: string) => ({} as Record<string, unknown>)[v]) as never,
      },
    ]);
    expect(isEmptyProjection(projection)).toBe(true);
  });
});

describe('generateResponsiveCSS keeps every shape its resolvers really emit', () => {
  it.each([
    ['percentage', '100%'],
    ['viewport unit', '50dvw'],
    ['calc', 'calc(100% - 2rem)'],
    ['fit-content', 'fit-content(20rem)'],
    ['token reference', 'var(--ds-spacing-4, 1rem)'],
    ['nested token reference', 'var(--ds-font-size-fluid-lg, var(--ds-font-size-lg))'],
    ['rhythm calc', 'calc(var(--ds-spacing-4, 1rem) * var(--ds-rhythm-effective-scale, 1))'],
    ['two-axis shorthand', 'var(--ds-spacing-2, 0.5rem) var(--ds-spacing-4, 1rem)'],
    ['keyword', 'flex-start'],
    ['zero', '0'],
    ['clamp', 'clamp(1rem, 2vw, 2rem)'],
  ])('admits a %s value byte-for-byte', (_label, value) => {
    expect(declarationsOf(generateResponsiveCSS([
      { cssProperty: 'width', value: { xs: value } },
    ]))).toEqual({ 'width@xs': value });
  });

  it('admits a number resolved to px', () => {
    const entries: ResponsivePropEntry<number>[] = [
      { cssProperty: 'gap', value: { xs: 16 }, resolve: (v: number) => `${v}px` },
    ];
    expect(declarationsOf(generateResponsiveCSS(entries))).toEqual({ 'gap@xs': '16px' });
  });

  it('admits the priority flag exactly when the value under it is admitted', () => {
    const admitted = generateResponsiveCSS([
      { cssProperty: 'height', value: { xs: '32px !important' } },
      {
        cssProperty: 'padding',
        value: { xs: 'var(--ds-input-md-padding-y) var(--ds-input-md-padding-x) !important' },
      },
    ]);
    expect(declarationsOf(admitted)).toEqual({
      'height@xs': '32px !important',
      'padding@xs':
        'var(--ds-input-md-padding-y) var(--ds-input-md-padding-x) !important',
    });

    // The flag is not a way in: what precedes it is judged exactly as before.
    const refused = generateResponsiveCSS([
      { cssProperty: 'height', value: { xs: '32px; } body { display: none !important' } },
      { cssProperty: 'width', value: { xs: '!important' } },
      { cssProperty: 'padding', value: { xs: '8px !important !important' } },
    ]);
    expect(isEmptyProjection(refused)).toBe(true);
  });

  it('emits custom-property channels, whose names a plain property grammar cannot spell', () => {
    const projection = generateResponsiveCSS([
      { cssProperty: '--ds-button-resolved-height', value: { xs: 'var(--ds-button-lg-height)' } },
      { cssProperty: '--_ds-stack-gap-current', value: { xs: 'var(--ds-spacing-4, 1rem)' } },
      { cssProperty: '--_ds-button-resolved-radius', value: { xs: 'var(--ds-button-2xl-radius)' } },
    ]);
    expect(declarationsOf(projection)).toEqual({
      '--ds-button-resolved-height@xs': 'var(--ds-button-lg-height)',
      '--_ds-stack-gap-current@xs': 'var(--ds-spacing-4, 1rem)',
      '--_ds-button-resolved-radius@xs': 'var(--ds-button-2xl-radius)',
    });
  });
});

/* -------------------------------------------------------------------------- */
/* corpus: the guard drops nothing the primitives legitimately project        */
/* -------------------------------------------------------------------------- */

/**
 * The declarations the assembler WOULD have armed with no VALUE guard at all.
 *
 * Every corpus entry below carries a single `xs` value, so this is the exact
 * pre-guard projection: comparing against it is what makes "no legitimate value
 * is eliminated" a measurement rather than a claim. The channel and priority
 * vocabularies are deliberate refusals of a different kind and are applied here
 * too, so a corpus entry that names an ungoverned channel fails loudly instead
 * of being excused.
 */
const PRIORITY_FLAG = /\s*!\s*important$/i;

const unguardedDeclarations = (entries: ResponsivePropEntry<any>[]): Declared => {
  const out: Declared = {};
  for (const entry of entries) {
    expect(
      isResponsiveChannel(entry.cssProperty),
      `${entry.cssProperty} is not a governed responsive channel`,
    ).toBe(true);
    const resolveValue = (entry.resolve ?? ((value: unknown) => String(value))) as (
      value: unknown,
    ) => string;
    const normalized = normalizeResponsiveValue(entry.value as Record<string, unknown>);
    const declared: Array<[ResponsiveBreakpointKey, string]> = [];
    let priority = false;
    for (const step of RESPONSIVE_BREAKPOINT_ORDER) {
      const raw = normalized[step];
      if (raw === undefined) continue;
      const resolved = resolveValue(raw);
      const hard = PRIORITY_FLAG.test(resolved);
      priority = priority || hard;
      declared.push([step, hard ? resolved.replace(PRIORITY_FLAG, '') : resolved]);
    }
    if (priority) {
      expect(
        isPriorityResponsiveChannel(entry.cssProperty),
        `${entry.cssProperty} is not a priority channel`,
      ).toBe(true);
    }
    for (const [step, value] of declared) {
      out[`${entry.cssProperty}@${step}`] = priority ? `${value} !important` : value;
    }
  }
  return out;
};

/** Asserts the guarded projection equals the unguarded one, and is not empty. */
const expectNothingDropped = (label: string, entries: ResponsivePropEntry<any>[]): number => {
  expect(entries.length, `${label} produced no entries`).toBeGreaterThan(0);
  expect(declarationsOf(generateResponsiveCSS(entries)), label).toEqual(
    unguardedDeclarations(entries),
  );
  return entries.length;
};

const BOX_SPACING_PROPS = [
  'padding', 'paddingX', 'paddingY', 'paddingTop', 'paddingRight', 'paddingBottom',
  'paddingLeft', 'paddingInline', 'paddingBlock', 'paddingInlineStart',
  'paddingInlineEnd', 'paddingBlockStart', 'paddingBlockEnd',
  'margin', 'marginX', 'marginY', 'marginTop', 'marginRight', 'marginBottom',
  'marginLeft', 'marginInline', 'marginBlock', 'marginInlineStart',
  'marginInlineEnd', 'marginBlockStart', 'marginBlockEnd',
] as const;

const BOX_SPACING_SHORTHANDS = [
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl',
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml',
] as const;

const BOX_DIMENSION_PROPS = [
  'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight',
] as const;

const BOX_DIMENSION_SHORTHANDS = ['w', 'minW', 'maxW', 'h', 'minH', 'maxH'] as const;

/** The dimension shapes the free-string props really carry. */
const DIMENSION_VALUES: readonly (string | number)[] = [
  '100%',
  '50vw',
  'calc(100% - 2rem)',
  'fit-content(20rem)',
  'min(100%, 40rem)',
  'max(20rem, 50%)',
  'clamp(20rem, 50%, 60rem)',
  'var(--ds-spacing-4, 1rem)',
  'auto',
  'fit-content',
  '0',
  '24rem',
  320,
];

const DISPLAY_VALUES = [
  'block', 'inline-block', 'flex', 'inline-flex', 'grid', 'contents', 'none',
] as const;

const OVERFLOW_VALUES = ['visible', 'hidden', 'clip', 'scroll', 'auto'] as const;

const SPACING_TOKENS = Object.keys(SPACING_MAP) as BoxSpacing[];

describe('corpus: every entry the Box collector projects survives the guard', () => {
  it.each(SPACING_TOKENS)('keeps every long-form spacing entry at rung %s', (token) => {
    const props = Object.fromEntries(
      BOX_SPACING_PROPS.map((name) => [name, { xs: token }]),
    ) as unknown as BoxProps;
    expectNothingDropped(`box-spacing-${token}`, collectBoxResponsiveEntries(props));
  });

  it.each(SPACING_TOKENS)('keeps every shorthand spacing entry at rung %s', (token) => {
    const props = Object.fromEntries(
      BOX_SPACING_SHORTHANDS.map((name) => [name, { xs: token }]),
    ) as unknown as BoxProps;
    expectNothingDropped(`box-shorthand-${token}`, collectBoxResponsiveEntries(props));
  });

  it.each(DIMENSION_VALUES)('keeps every dimension entry for %s', (value) => {
    const long = Object.fromEntries(
      BOX_DIMENSION_PROPS.map((name) => [name, { xs: value }]),
    ) as unknown as BoxProps;
    expectNothingDropped(`box-dimension-${value}`, collectBoxResponsiveEntries(long));

    const short = Object.fromEntries(
      BOX_DIMENSION_SHORTHANDS.map((name) => [name, { xs: value }]),
    ) as unknown as BoxProps;
    expectNothingDropped(`box-dimension-short-${value}`, collectBoxResponsiveEntries(short));
  });

  it.each(DISPLAY_VALUES)('keeps the display entry for %s', (value) => {
    expectNothingDropped(
      `box-display-${value}`,
      collectBoxResponsiveEntries({ display: { xs: value } } as unknown as BoxProps),
    );
  });

  it.each(OVERFLOW_VALUES)('keeps every overflow entry for %s', (value) => {
    expectNothingDropped(
      `box-overflow-${value}`,
      collectBoxResponsiveEntries({
        overflow: { xs: value },
        overflowX: { xs: value },
        overflowY: { xs: value },
      } as unknown as BoxProps),
    );
  });
});

describe('corpus: every entry the Flex collector projects survives the guard', () => {
  const GAPS = [
    ...(Object.keys(FLEX_GAP_MAP) as FlexGapToken[]),
    0,
    8,
    24,
    ['md', 'lg'],
    [8, 'xl'],
    [-1, 'none'],
  ] as unknown as readonly FlexGap[];

  // A plain loop, not `it.each`: a tuple gap IS an array, and `it.each` would
  // spread it into two arguments instead of passing it as one value.
  for (const rhythm of [false, true]) {
    for (const gap of GAPS) {
      it(`keeps the gap entry for ${JSON.stringify(gap)} with rhythm ${rhythm}`, () => {
        expectNothingDropped(
          `flex-gap-${JSON.stringify(gap)}-${rhythm}`,
          collectFlexResponsiveEntries({ gap: { xs: gap } } as unknown as FlexProps, { rhythm }),
        );
      });
    }
  }

  it('keeps every direction, wrap, justify and align entry', () => {
    const directions = ['row', 'row-reverse', 'column', 'column-reverse'] as const;
    const wraps = ['nowrap', 'wrap', 'wrap-reverse'] as const;
    const justifies = ['start', 'end', 'center', 'between', 'around', 'evenly'] as const;
    const aligns = ['start', 'end', 'center', 'baseline', 'stretch'] as const;

    let covered = 0;
    for (const direction of directions) {
      for (const wrap of wraps) {
        covered += expectNothingDropped(
          `flex-${direction}-${wrap}`,
          collectFlexResponsiveEntries({
            direction: { xs: direction },
            wrap: { xs: wrap },
          } as unknown as FlexProps),
        );
      }
    }
    for (const justify of justifies) {
      for (const align of aligns) {
        covered += expectNothingDropped(
          `flex-${justify}-${align}`,
          collectFlexResponsiveEntries({
            justify: { xs: justify },
            align: { xs: align },
          } as unknown as FlexProps),
        );
      }
    }
    expect(covered).toBe(directions.length * wraps.length * 2 + justifies.length * aligns.length * 2);
  });

  it.each(DIMENSION_VALUES)('keeps every Flex dimension entry for %s', (value) => {
    expectNothingDropped(
      `flex-dimension-${value}`,
      collectFlexResponsiveEntries({
        width: { xs: value },
        minWidth: { xs: value },
        maxWidth: { xs: value },
      } as unknown as FlexProps),
    );
  });

  it.each(OVERFLOW_VALUES)('keeps the Flex overflow entry for %s', (value) => {
    expectNothingDropped(
      `flex-overflow-${value}`,
      collectFlexResponsiveEntries({ overflow: { xs: value } } as unknown as FlexProps),
    );
  });
});

describe('corpus: every entry the Stack collector projects survives the guard', () => {
  const SPACINGS = [...SPACING_TOKENS, 0, 12, 40] as unknown as readonly unknown[];

  for (const rhythm of [false, true]) {
    it.each(SPACINGS)(`keeps the spacing and divider-mirror entries for %s with rhythm ${rhythm}`, (spacing) => {
      expectNothingDropped(
        `stack-gap-${spacing}-${rhythm}`,
        collectStackResponsiveEntries({ gap: { xs: spacing } } as unknown as StackProps, { rhythm }),
      );
      expectNothingDropped(
        `stack-spacing-${spacing}-${rhythm}`,
        collectStackResponsiveEntries({ spacing: { xs: spacing } } as unknown as StackProps, { rhythm }),
      );
    });
  }

  it('keeps the divider channels, whose names carry an underscore', () => {
    for (const direction of ['vertical', 'horizontal'] as const) {
      for (const reverse of [false, true]) {
        const entries = collectStackResponsiveEntries({
          direction: { xs: direction },
          reverse,
          divider: true,
        } as unknown as StackProps);
        expectNothingDropped(`stack-divider-${direction}-${reverse}`, entries);
        expect(entries.map((entry) => entry.cssProperty)).toEqual([
          'flex-direction',
          '--_ds-stack-divider-gap-block',
          '--_ds-stack-divider-gap-inline',
        ]);
      }
    }
  });

  it('keeps every align, justify and wrap entry', () => {
    const aligns = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
    const justifies = [
      'start', 'center', 'end', 'space-between', 'space-around', 'space-evenly',
    ] as const;
    for (const align of aligns) {
      for (const justify of justifies) {
        for (const wrap of [true, false]) {
          expectNothingDropped(
            `stack-${align}-${justify}-${wrap}`,
            collectStackResponsiveEntries({
              align: { xs: align },
              justify: { xs: justify },
              wrap: { xs: wrap },
            } as unknown as StackProps),
          );
        }
      }
    }
  });
});

describe('corpus: every property name the source declares is admitted', () => {
  const SRC_ROOT = resolvePath(__dirname, '../../../../../..');

  const sources = (): string[] => {
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          if (entry !== 'tests' && entry !== '__tests__') walk(full);
        } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
          out.push(full);
        }
      }
    };
    walk(SRC_ROOT);
    return out;
  };

  /**
   * Every name this assembler can be asked to declare: the literals assigned to
   * `cssProperty`, plus the literals passed to a local `...Channel(` helper --
   * the Tabs modern engine routes its four channels through one, so a
   * `cssProperty:` scan alone would not see them.
   */
  const declaredNames = (): string[] => {
    const names = new Set<string>();
    for (const file of sources()) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/cssProperty:\s*(['"])([^'"]+)\1/g)) {
        names.add(match[2]!);
      }
      for (const match of source.matchAll(/[A-Za-z]*Channel\(\s*(['"])([^'"]+)\1/g)) {
        names.add(match[2]!);
      }
    }
    return [...names].sort();
  };

  it('emits every declared property name, and the corpus is not vacuous', () => {
    const names = declaredNames();
    expect(names.length).toBeGreaterThan(50);
    // Every name a production file can hand the assembler must be a channel the
    // static sheet declares; otherwise the prop paints nothing at all.
    expect(names.filter((name) => !isResponsiveChannel(name))).toEqual([]);
    const entries = names.map((cssProperty) => ({
      cssProperty,
      value: { xs: '1px' },
    })) as ResponsivePropEntry<any>[];
    expectNothingDropped('declared-names', entries);
  });
});

describe('corpus: every value the engine size maps project is admitted', () => {
  /**
   * The values the engine-inline responsive entries resolve to. The Classic
   * engines and the TextArea compound append the priority flag, so each shape
   * is exercised both bare and flagged.
   */
  const engineValues = (): string[] => {
    const values = new Set<string>();
    const add = (value: string) => values.add(value);

    for (const size of Object.values(BUTTON_SIZE_MAP)) {
      add(size.height);
      add(size.padding);
      add(size.fontSize);
    }
    for (const size of Object.values(BADGE_SIZE_MAP)) {
      add(size.minWidth);
      add(size.height);
      add(size.fontSize);
    }
    for (const size of Object.values(SELECT_SIZE_MAP)) {
      add(size.height);
      add(size.fontSize);
      add(size.padding);
    }
    for (const size of Object.values(INPUT_SIZE_MAP)) {
      add(size.height);
      add(size.paddingX);
      add(size.fontSize);
    }
    for (const padding of Object.values(CARD_PADDING_MAP)) add(padding);
    for (const kind of ['heading', 'text'] as const) {
      for (const size of Object.keys(TYPOGRAPHY_SIZE_MAP[kind]) as TextSize[]) {
        add(TYPOGRAPHY_SIZE_MAP[kind][size]);
        add(TYPOGRAPHY_LINE_HEIGHT_MAP[kind][size]);
        add(resolveFluidTypographySize(kind, size));
      }
    }

    // Templates the engines build per size token, plus the engine-local values
    // that live inside an engine module rather than in a contract.
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const) {
      add(`var(--ds-button-${size}-padding-y)`);
      add(`calc(var(--ds-button-${size}-padding-x) * var(--ds-density-effective-scale))`);
      add(`var(--ds-button-${size}-line-height)`);
      add(`calc(var(--ds-button-${size}-gap) * var(--ds-density-effective-scale))`);
      add(`var(--ds-button-${size}-icon-size)`);
      add(`var(--ds-button-${size}-radius)`);
      add(`var(--ds-input-${size}-padding-y) var(--ds-input-${size}-padding-x)`);
      add(`var(--ds-input-${size}-font-size)`);
      add(`var(--ds-input-${size}-line-height)`);
      add(`var(--ds-input-${size}-radius)`);
      add(`calc(var(--ds-input-${size}-padding-x) + var(--ds-input-loading-size) + var(--ds-input-gap))`);
      add(`var(--ds-select-${size}-height)`);
      add(`var(--ds-badge-${size}-padding-inline)`);
    }
    for (const value of [
      '4px 12px', '8px 16px', '12px 20px', '0.875rem', '1rem', '1.125rem',
      'var(--ds-tabs-sm-height, 32px)',
      'var(--ds-tabs-sm-padding, 0 var(--ds-spacing-3, 12px))',
      'var(--ds-tabs-sm-font-size, var(--ds-font-size-xs, 12px))',
      '8px 12px', '16px', '0.8125rem', '0.5rem 0.75rem',
      'var(--ds-alert-compact-padding, var(--ds-spacing-sm) var(--ds-spacing-md))',
      'var(--ds-alert-padding)',
      'var(--ds-card-padding-md, var(--ds-card-md-padding, 16px))',
    ]) {
      add(value);
    }

    return [...values].sort();
  };

  it('admits every engine value, bare and under the priority flag', () => {
    const values = engineValues();
    expect(values.length).toBeGreaterThan(100);
    // One projection per value: two entries on the same channel would collide on
    // the same custom property, which says nothing about admission.
    for (const value of values) {
      expectNothingDropped(`engine-value-${value}`, [
        { cssProperty: 'height', value: { xs: value } },
      ] as ResponsivePropEntry<any>[]);
      expectNothingDropped(`engine-value-hard-${value}`, [
        { cssProperty: 'height', value: { xs: `${value} !important` } },
      ] as ResponsivePropEntry<any>[]);
    }
  });
});

describe('corpus: normalization still reaches every breakpoint under the guard', () => {
  it('keeps one declaration per breakpoint and per alias', () => {
    const projection = generateResponsiveCSS([
      {
        cssProperty: 'width',
        value: { xs: '10%', sm: '20%', md: '30%', lg: '40%', xl: '50%', '2xl': '60%' },
      },
      {
        cssProperty: 'height',
        value: { base: '1rem', phone: '2rem', tablet: '3rem', desktop: '4rem' },
      },
    ]);
    // 6 breakpoints for width; base/phone both normalize to xs, so height
    // contributes xs, sm and lg.
    expect(declarationsOf(projection)).toEqual({
      'width@xs': '10%',
      'width@sm': '20%',
      'width@md': '30%',
      'width@lg': '40%',
      'width@xl': '50%',
      'width@2xl': '60%',
      'height@xs': '1rem',
      'height@sm': '3rem',
      'height@lg': '4rem',
    });
  });
});
