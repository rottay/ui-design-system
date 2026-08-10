/**
 * `--ds-type-<role>-<facet>` is the sanctioned tenant typography channel — the
 * `TENANT_SEMANTIC_TYPOGRAPHY_TOKENS` allowlist entry a customer theme can
 * actually write. The family already resolved it, but only for callers that
 * passed an explicit `textStyle`, which application markup essentially never
 * does; the roles were reachable in principle and unreached in practice.
 *
 * These tests hold the three properties that make binding the default render
 * path to those roles safe:
 *
 *   1. a facet is bound only where the role's declared value already equals
 *      what the engine renders today, so no theme that ships can move a pixel;
 *   2. a facet whose role value differs in any theme keeps its current owner —
 *      font-size and letter-spacing are therefore bound nowhere; and
 *   3. an explicit `textStyle`, an explicit prop, and a caller's inline style
 *      all still outrank the tier's role.
 *
 * The invariants below are transcribed from the resolved values of the DS
 * default and the bithire, evnto and rottay artifacts. A difference here is a
 * theme that drifted, not a test to relax.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ModernHeading, ModernLink, ModernParagraph, ModernText } from '../engines/modern';
import type { TextSize } from '../contracts';
import { HEADING_TYPE_ROLE, TEXT_TYPE_ROLE, resolveTypeRoleStyle } from '../runtime';

const SIZES: TextSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

/** What `HEADING_LINE_HEIGHT` paints, unchanged by this wiring. */
const HEADING_LINE_HEIGHT: Record<TextSize, string> = {
  xs: '1.4',
  sm: '1.3',
  md: '1.25',
  lg: '1.2',
  xl: '1.15',
  '2xl': '1.1',
  '3xl': '1.1',
};

/** What `HEADING_SIZE_STYLES` paints, unchanged by this wiring. */
const HEADING_FONT_SIZE: Record<TextSize, string> = {
  xs: 'var(--ds-font-size-base)',
  sm: 'var(--ds-font-size-lg)',
  md: 'var(--ds-font-size-xl)',
  lg: 'var(--ds-font-size-2xl)',
  xl: 'var(--ds-font-size-3xl)',
  '2xl': 'var(--ds-font-size-4xl)',
  '3xl': 'var(--ds-font-size-5xl)',
};

/**
 * React's static renderer writes the style object straight into the attribute,
 * which is the string a real browser receives. happy-dom's CSS parser discards
 * values it cannot validate, so it is not a witness for these assertions.
 */
const styleAttributeOf = (element: React.ReactElement): string =>
  renderToStaticMarkup(element).match(/style="([^"]*)"/)?.[1] ?? '';

describe('Typography semantic roles — which tier reads which role', () => {
  it('reads the two largest heading tiers as the display register', () => {
    expect(HEADING_TYPE_ROLE).toEqual({
      xs: 'sectionTitle',
      sm: 'sectionTitle',
      md: 'sectionTitle',
      lg: 'sectionTitle',
      xl: 'sectionTitle',
      '2xl': 'display',
      '3xl': 'display',
    });
  });

  it('reads inline text as caption, supporting and body', () => {
    expect(TEXT_TYPE_ROLE).toEqual({
      xs: 'caption',
      sm: 'supporting',
      md: 'body',
      lg: 'body',
      xl: 'body',
      '2xl': 'body',
      '3xl': 'body',
    });
  });
});

describe('Typography semantic roles — a facet binds only on equality', () => {
  it('takes the weight where the role already carries what renders', () => {
    expect(resolveTypeRoleStyle({ role: 'display', weight: 700 }).fontWeight).toBe(
      'var(--ds-type-display-font-weight)'
    );
    expect(resolveTypeRoleStyle({ role: 'sectionTitle', weight: 600 }).fontWeight).toBe(
      'var(--ds-type-section-title-font-weight)'
    );
    expect(resolveTypeRoleStyle({ role: 'body', weight: 400 }).fontWeight).toBe(
      'var(--ds-type-body-font-weight)'
    );
  });

  it('leaves the weight alone where the role would change it', () => {
    // `display` is 700; an element rendering 400 there keeps its own weight.
    expect(resolveTypeRoleStyle({ role: 'display', weight: 400 }).fontWeight).toBeUndefined();
    // `body` is 400; an element rendering semibold keeps semibold.
    expect(resolveTypeRoleStyle({ role: 'body', weight: 600 }).fontWeight).toBeUndefined();
    // An element that declares no weight of its own keeps inheriting one.
    expect(resolveTypeRoleStyle({ role: 'body' }).fontWeight).toBeUndefined();
  });

  it('takes the leading only where the role resolves to it in every theme', () => {
    // display is 1.1 in the default and in all three artifacts.
    expect(resolveTypeRoleStyle({ role: 'display', lineHeight: '1.1' }).lineHeight).toBe(
      'var(--ds-type-display-line-height)'
    );
    // The same role at a tier that renders anything else keeps the literal.
    expect(resolveTypeRoleStyle({ role: 'display', lineHeight: '1.2' }).lineHeight).toBeUndefined();
    // sectionTitle leading is 1.25 in the default and 1.3 in every artifact, so
    // it has no bindable value at all.
    expect(
      resolveTypeRoleStyle({ role: 'sectionTitle', lineHeight: '1.25' }).lineHeight
    ).toBeUndefined();
    // Inline text inherits its leading, which no role resolves to.
    expect(resolveTypeRoleStyle({ role: 'body', lineHeight: 'inherit' }).lineHeight).toBeUndefined();
  });

  it('never takes the size or the tracking, whatever the tier', () => {
    for (const role of ['display', 'sectionTitle', 'body', 'supporting', 'caption'] as const) {
      const style = resolveTypeRoleStyle({ role, lineHeight: '1.1', weight: 700 });
      expect(style).not.toHaveProperty('fontSize');
      expect(style).not.toHaveProperty('letterSpacing');
    }
  });

  it('never takes the figure style, which the element inherits', () => {
    // Skins set `font-variant-numeric: tabular-nums` on containers and the
    // child inherits it. An inline declaration outranks inheritance, so reading
    // the role here would strip tabular figures from every Text inside them.
    for (const role of ['display', 'sectionTitle', 'body', 'supporting', 'caption'] as const) {
      expect(resolveTypeRoleStyle({ role, weight: 400 })).not.toHaveProperty(
        'fontVariantNumeric'
      );
    }
  });
});

describe('Typography semantic roles — what the engine renders', () => {
  it.each(SIZES)('keeps the heading scale and tracking untouched at size %s', (size) => {
    const style = styleAttributeOf(
      <ModernHeading level="h2" size={size}>
        Heading
      </ModernHeading>
    );

    expect(style).toContain(`font-size:${HEADING_FONT_SIZE[size]}`);
    expect(style).not.toContain('font-size:var(--ds-type-');
    expect(style).not.toContain('letter-spacing:var(--ds-type-');
  });

  it('hands the display tiers their leading and holds the rest on the literal', () => {
    for (const size of ['2xl', '3xl'] as const) {
      expect(
        styleAttributeOf(
          <ModernHeading level="h2" size={size}>
            Heading
          </ModernHeading>
        )
      ).toContain('line-height:var(--ds-type-display-line-height)');
    }

    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      const style = styleAttributeOf(
        <ModernHeading level="h2" size={size}>
          Heading
        </ModernHeading>
      );
      expect(style).toContain(`line-height:${HEADING_LINE_HEIGHT[size]}`);
      expect(style).not.toContain('line-height:var(--ds-type-');
    }
  });

  it('gives every default heading level its weight channel', () => {
    // h1 and h2 render 700, which is the display role's weight.
    for (const level of ['h1', 'h2'] as const) {
      expect(styleAttributeOf(<ModernHeading level={level}>Heading</ModernHeading>)).toContain(
        'font-weight:var(--ds-type-display-font-weight)'
      );
    }
    // h3-h6 render 600, which is the section-title role's weight.
    for (const level of ['h3', 'h4', 'h5', 'h6'] as const) {
      expect(styleAttributeOf(<ModernHeading level={level}>Heading</ModernHeading>)).toContain(
        'font-weight:var(--ds-type-section-title-font-weight)'
      );
    }
  });

  it('routes inline text, paragraphs and links onto their role', () => {
    expect(styleAttributeOf(<ModernText size="xs">Text</ModernText>)).toContain(
      'font-weight:var(--ds-type-caption-font-weight)'
    );
    expect(styleAttributeOf(<ModernText size="sm">Text</ModernText>)).toContain(
      'font-weight:var(--ds-type-supporting-font-weight)'
    );
    expect(styleAttributeOf(<ModernText>Text</ModernText>)).toContain(
      'font-weight:var(--ds-type-body-font-weight)'
    );
    expect(styleAttributeOf(<ModernParagraph>Paragraph</ModernParagraph>)).toContain(
      'font-weight:var(--ds-type-body-font-weight)'
    );
    // A link declares no weight until one is asked for, so it keeps inheriting.
    expect(styleAttributeOf(<ModernLink href="/roles">Link</ModernLink>)).not.toContain(
      'font-weight'
    );
  });

  it('leaves the paragraph leading with the utility that owns it', () => {
    expect(styleAttributeOf(<ModernParagraph size="sm">Paragraph</ModernParagraph>)).not.toContain(
      'line-height'
    );
  });

  it('lets an explicit text style keep precedence over the tier role', () => {
    render(
      <ModernText size="xl" textStyle="caption">
        Explicit role
      </ModernText>
    );

    expect(screen.getByText('Explicit role').style.fontSize).toBe(
      'var(--ds-type-caption-font-size)'
    );
  });

  it('lets an explicit figure style keep precedence over the role decision', () => {
    render(
      <ModernText size="xl" numeric="tabular">
        1,240
      </ModernText>
    );

    const value = screen.getByText('1,240');
    expect(value).toHaveClass('ds-nums-tabular');
    expect(value.style.fontVariantNumeric).toBe('');
  });

  it('keeps a caller inline style above the role', () => {
    render(
      <ModernText size="xl" style={{ fontWeight: 800 }}>
        Pinned
      </ModernText>
    );

    expect(screen.getByText('Pinned').style.fontWeight).toBe('800');
  });

  it('still refuses to track a joining script', () => {
    const style = styleAttributeOf(
      <ModernHeading level="h1" lang="ar" size="3xl">
        العنوان
      </ModernHeading>
    );

    expect(style).not.toContain('letter-spacing');
  });
});
