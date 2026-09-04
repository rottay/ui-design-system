/**
 * Tests for responsive style-property runtime projection.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve as resolvePath } from 'node:path';

import { describe, it, expect } from 'vitest';

import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '..';
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

describe('generateResponsiveCSS', () => {
  it('returns empty CSS for empty entries', () => {
    const result = generateResponsiveCSS('test-id', []);
    expect(result.css).toBe('');
    expect(result.attrs).toEqual({});
  });

  it('generates base (xs) CSS without media query', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'padding', value: { xs: 'sm' }, resolve: (v) => v === 'sm' ? '0.5rem' : '0' },
    ];
    const result = generateResponsiveCSS('test-1', entries);
    expect(result.css).toContain('[data-responsive-id="test-1"]');
    expect(result.css).toContain('padding: 0.5rem;');
    expect(result.css).not.toContain('@media');
    expect(result.attrs).toEqual({ 'data-responsive-id': 'test-1' });
  });

  it('generates @media queries for non-xs breakpoints', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'display', value: { xs: 'none', lg: 'block' } },
    ];
    const result = generateResponsiveCSS('test-2', entries);
    expect(result.css).toContain('display: none;');
    expect(result.css).toContain('@media (min-width: 1024px)');
    expect(result.css).toContain('display: block;');
  });

  it('resolves alias keys to canonical breakpoints', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'flex-direction', value: { phone: 'column', tablet: 'row', desktop: 'row-reverse' } },
    ];
    const result = generateResponsiveCSS('test-3', entries);
    // phone -> xs (no media query)
    expect(result.css).toContain('flex-direction: column;');
    // tablet -> sm (640px)
    expect(result.css).toContain('@media (min-width: 640px)');
    expect(result.css).toContain('flex-direction: row;');
    // desktop -> lg (1024px)
    expect(result.css).toContain('@media (min-width: 1024px)');
    expect(result.css).toContain('flex-direction: row-reverse;');
  });

  it('resolves base alias to xs', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'gap', value: { base: '8px', md: '16px' } },
    ];
    const result = generateResponsiveCSS('test-4', entries);
    // base -> xs (no media query)
    expect(result.css).toContain('gap: 8px;');
    // md -> 768px
    expect(result.css).toContain('@media (min-width: 768px)');
    expect(result.css).toContain('gap: 16px;');
  });

  it('handles multiple CSS properties in the same breakpoint', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'padding', value: { xs: '8px', lg: '24px' } },
      { cssProperty: 'margin', value: { xs: '4px', lg: '16px' } },
    ];
    const result = generateResponsiveCSS('test-5', entries);
    // Both properties in xs block
    expect(result.css).toContain('padding: 8px;');
    expect(result.css).toContain('margin: 4px;');
    // Both properties in lg block
    const lgBlock = result.css.split('@media (min-width: 1024px)')[1];
    expect(lgBlock).toContain('padding: 24px;');
    expect(lgBlock).toContain('margin: 16px;');
  });

  it('uses custom resolve function', () => {
    const entries: ResponsivePropEntry<number>[] = [
      {
        cssProperty: 'gap',
        value: { xs: 16, lg: 32 },
        resolve: (v: number) => `${v}px`,
      },
    ];
    const result = generateResponsiveCSS('test-6', entries);
    expect(result.css).toContain('gap: 16px;');
    expect(result.css).toContain('gap: 32px;');
  });

  it('canonical key takes precedence over alias', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'display', value: { xs: 'flex', phone: 'block' } },
    ];
    const result = generateResponsiveCSS('test-7', entries);
    // xs should win over phone since it is the canonical key
    expect(result.css).toContain('display: flex;');
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

/** Every declaration line the assembler emitted, in source order. */
const declarationsOf = (css: string): string[] =>
  css
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.endsWith(';'));

describe('generateResponsiveCSS refuses what it cannot safely declare', () => {
  it('omits a hostile free-string dimension value whole, and repairs nothing', () => {
    const { css } = generateResponsiveCSS('hostile-1', [
      { cssProperty: 'width', value: { xs: HOSTILE_WIDTH } },
    ]);

    expect(css).toBe('');
    expect(css).not.toContain('body');
    expect(css).not.toContain('fable-escape');
    // Refused, not escaped: no rewritten remnant of the payload survives.
    expect(css).not.toContain('100%');
  });

  it('omits the hostile declaration inside a media block and leaves the rule shut', () => {
    const { css } = generateResponsiveCSS('hostile-2', [
      { cssProperty: 'width', value: { xs: '100%', lg: HOSTILE_WIDTH } },
    ]);

    expect(css).toContain('width: 100%;');
    expect(css).not.toContain('@media');
    expect(css).not.toContain('body {');
    expect(css.split('{').length).toBe(css.split('}').length);
  });

  it('drops only the inadmissible declaration, never its siblings', () => {
    const { css } = generateResponsiveCSS('hostile-3', [
      { cssProperty: 'width', value: { xs: HOSTILE_WIDTH } },
      { cssProperty: 'height', value: { xs: '48px' } },
      { cssProperty: 'display', value: { xs: 'flex' } },
    ]);

    expect(declarationsOf(css)).toEqual(['height: 48px;', 'display: flex;']);
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
    const { css } = generateResponsiveCSS('hostile-shape', [
      { cssProperty: 'width', value: { xs: payload } },
    ]);
    expect(css).toBe('');
  });

  it('refuses a hostile PROPERTY name', () => {
    const { css } = generateResponsiveCSS('hostile-name', [
      { cssProperty: 'width: 1px; } body { color', value: { xs: 'red' } },
      { cssProperty: 'WIDTH', value: { xs: '1px' } },
      { cssProperty: '', value: { xs: '1px' } },
    ]);
    expect(css).toBe('');

    // The `--` branch is a name grammar too: it admits the underscore and the
    // digits, never a character that closes a declaration, rule or element.
    for (const cssProperty of [
      '--x}',
      '--x;',
      '--x:y',
      '--x{',
      '--X',
      '--x y',
      '--x</style>',
    ]) {
      const refused = generateResponsiveCSS('hostile-custom-name', [
        { cssProperty, value: { xs: '1px' } },
      ]);
      expect(refused.css, `${cssProperty} was declared`).toBe('');
    }
  });

  it('refuses a resolver that answers with something that is not a string', () => {
    const { css } = generateResponsiveCSS('non-string', [
      {
        cssProperty: 'gap',
        value: { xs: 'toString' },
        // The prototype leak the collectors own-property guards close: without
        // this refusal a function body would be stamped into the style element.
        resolve: ((v: string) => ({} as Record<string, unknown>)[v]) as never,
      },
    ]);
    expect(css).toBe('');
  });
});

describe('generateResponsiveCSS keeps every shape its resolvers really emit', () => {
  it.each([
    ['percentage', '100%'],
    ['viewport unit', '50vw'],
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
    const { css } = generateResponsiveCSS('positive', [
      { cssProperty: 'width', value: { xs: value } },
    ]);
    expect(declarationsOf(css)).toEqual([`width: ${value};`]);
  });

  it('admits a number resolved to px', () => {
    const entries: ResponsivePropEntry<number>[] = [
      { cssProperty: 'gap', value: { xs: 16 }, resolve: (v: number) => `${v}px` },
    ];
    const { css } = generateResponsiveCSS('positive-number', entries);
    expect(declarationsOf(css)).toEqual(['gap: 16px;']);
  });

  it('admits the priority flag exactly when the value under it is admitted', () => {
    const admitted = generateResponsiveCSS('priority-ok', [
      { cssProperty: 'height', value: { xs: '32px !important' } },
      {
        cssProperty: 'padding',
        value: { xs: 'var(--ds-input-md-padding-y) var(--ds-input-md-padding-x) !important' },
      },
    ]);
    expect(declarationsOf(admitted.css)).toEqual([
      'height: 32px !important;',
      'padding: var(--ds-input-md-padding-y) var(--ds-input-md-padding-x) !important;',
    ]);

    // The flag is not a way in: what precedes it is judged exactly as before.
    const refused = generateResponsiveCSS('priority-hostile', [
      { cssProperty: 'height', value: { xs: '32px; } body { display: none !important' } },
      { cssProperty: 'width', value: { xs: '!important' } },
      { cssProperty: 'gap', value: { xs: '8px !important !important' } },
    ]);
    expect(refused.css).toBe('');
  });

  it('emits custom properties, whose names a plain property grammar cannot spell', () => {
    const { css } = generateResponsiveCSS('custom-props', [
      { cssProperty: '--ds-button-resolved-height', value: { xs: 'var(--ds-button-lg-height)' } },
      { cssProperty: '--_ds-stack-gap-current', value: { xs: 'var(--ds-spacing-4, 1rem)' } },
      { cssProperty: '--_ds-button-resolved-radius', value: { xs: 'var(--ds-button-2xl-radius)' } },
    ]);
    expect(declarationsOf(css)).toEqual([
      '--ds-button-resolved-height: var(--ds-button-lg-height);',
      '--_ds-stack-gap-current: var(--ds-spacing-4, 1rem);',
      '--_ds-button-resolved-radius: var(--ds-button-2xl-radius);',
    ]);
  });
});

/* -------------------------------------------------------------------------- */
/* corpus: the guard drops nothing the primitives legitimately project        */
/* -------------------------------------------------------------------------- */

/**
 * The declarations the assembler WOULD have emitted with no guard at all.
 *
 * Every corpus entry below carries a single `xs` value, so this is the exact
 * pre-guard output: comparing against it is what makes "no legitimate value is
 * eliminated" a measurement rather than a claim.
 */
const unguardedDeclarations = (entries: ResponsivePropEntry<any>[]): string[] =>
  entries.map((entry) => {
    const raw = (entry.value as Record<string, unknown>).xs;
    const resolveValue = (entry.resolve ?? ((value: unknown) => String(value))) as (
      value: unknown,
    ) => string;
    return `${entry.cssProperty}: ${resolveValue(raw)};`;
  });

/** Asserts the guarded assembly equals the unguarded one, and is not empty. */
const expectNothingDropped = (label: string, entries: ResponsivePropEntry<any>[]): number => {
  expect(entries.length, `${label} produced no entries`).toBeGreaterThan(0);
  const { css } = generateResponsiveCSS(`corpus-${label}`, entries);
  expect(declarationsOf(css), label).toEqual(unguardedDeclarations(entries));
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
   * `cssProperty`, plus every custom-property literal in a file that calls the
   * assembler -- the Tabs modern engine passes its four channels through a
   * helper argument, so a `cssProperty:` scan alone would not see them.
   */
  const declaredNames = (): string[] => {
    const names = new Set<string>();
    for (const file of sources()) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/cssProperty:\s*(['"])([^'"]+)\1/g)) {
        names.add(match[2]!);
      }
      if (source.includes('generateResponsiveCSS(')) {
        for (const match of source.matchAll(/(['"])(--[^'"\s]+)\1/g)) names.add(match[2]!);
      }
    }
    return [...names].sort();
  };

  it('emits every declared property name, and the corpus is not vacuous', () => {
    const names = declaredNames();
    expect(names.length).toBeGreaterThan(60);
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
    const entries = values.flatMap((value) => [
      { cssProperty: 'height', value: { xs: value } },
      { cssProperty: 'height', value: { xs: `${value} !important` } },
    ]) as ResponsivePropEntry<any>[];
    expectNothingDropped('engine-values', entries);
  });
});

describe('corpus: normalization still reaches every breakpoint under the guard', () => {
  it('keeps one declaration per breakpoint and per alias', () => {
    const { css } = generateResponsiveCSS('all-breakpoints', [
      {
        cssProperty: 'width',
        value: { xs: '10%', sm: '20%', md: '30%', lg: '40%', xl: '50%', '2xl': '60%' },
      },
      {
        cssProperty: 'height',
        value: { base: '1rem', phone: '2rem', tablet: '3rem', desktop: '4rem' },
      },
    ]);
    const declarations = declarationsOf(css);
    // 6 breakpoints for width; base/phone both normalize to xs, so height
    // contributes xs, sm and lg.
    expect(declarations).toEqual([
      'width: 10%;',
      'height: 1rem;',
      'width: 20%;',
      'height: 3rem;',
      'width: 30%;',
      'width: 40%;',
      'height: 4rem;',
      'width: 50%;',
      'width: 60%;',
    ]);
  });
});
