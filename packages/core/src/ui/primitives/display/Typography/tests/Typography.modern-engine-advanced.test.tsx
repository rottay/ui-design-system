import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  ModernHeading,
  ModernLink,
  ModernParagraph,
  ModernText,
} from '../engines/modern';

describe('Typography modern advanced engine coverage', () => {
  it('covers heading, text, paragraph, and link styling branches in the modern engine', () => {
    const handleLinkClick = vi.fn();
    const { rerender } = render(
      <>
        <ModernHeading
          level="h2"
          size="2xl"
          weight="bold"
          align="right"
          color="error"
          truncate
          lineClamp={2}
          className="qa-heading"
        >
          Heading
        </ModernHeading>

        <ModernText
          as="label"
          size="lg"
          weight="medium"
          color="warning"
          align="justify"
          underline
          strikethrough
          italic
          monospace
          truncate
          lineClamp={3}
          className="qa-text"
        >
          Inline text
        </ModernText>

        <ModernParagraph
          size="sm"
          weight="semibold"
          color="primary"
          align="center"
          truncate
          lineClamp={4}
          className="qa-paragraph"
        >
          Paragraph copy
        </ModernParagraph>

        <ModernLink
          href="https://example.com"
          target="_blank"
          size="xl"
          weight="bold"
          color="success"
          underlineOnHover
          strong
          onClick={handleLinkClick}
          className="qa-link"
        >
          External link
        </ModernLink>
      </>
    );

    // Color and font-size paint moved into the modern skin: the engine stamps
    // the scope classes plus data-color, and sizes resolve to DS font tokens.
    const heading = screen.getByText('Heading');
    expect(heading).toHaveClass(
      'rottay-typography',
      'rottay-typography--modern',
      'font-bold',
      'text-right',
      'truncate',
      'line-clamp-2',
      'qa-heading'
    );
    expect(heading).toHaveAttribute('data-part', 'root');
    expect(heading).toHaveAttribute('data-color', 'error');
    // Size resolves to a DS font token via inline fontSize; happy-dom drops
    // var() values for validated properties, so probe the plain-literal
    // companions of the 2xl heading ramp instead.
    expect(heading.style.letterSpacing).toBe('-0.025em');
    expect(heading.style.lineHeight).toBe('1.1');

    const inlineText = screen.getByText('Inline text');
    expect(inlineText).toHaveClass(
      'rottay-typography',
      'rottay-typography--modern',
      'font-medium',
      'text-justify',
      'underline',
      'line-through',
      'italic',
      'font-mono',
      'truncate',
      'line-clamp-3',
      'qa-text'
    );
    expect(inlineText).toHaveAttribute('data-color', 'warning');

    const paragraph = screen.getByText('Paragraph copy');
    expect(paragraph).toHaveClass(
      'rottay-typography',
      'rottay-typography--modern',
      'font-semibold',
      'text-center',
      'leading-relaxed',
      'mb-4',
      'truncate',
      'line-clamp-4',
      'qa-paragraph'
    );
    expect(paragraph).toHaveAttribute('data-color', 'primary');

    const externalLink = screen.getByText('External link');
    fireEvent.click(externalLink);
    expect(handleLinkClick).toHaveBeenCalledTimes(1);
    expect(externalLink).toHaveClass(
      'rottay-typography',
      'rottay-typography--modern',
      'font-bold',
      'font-semibold',
      'hover:underline',
      'transition-colors',
      'qa-link'
    );
    expect(externalLink).toHaveAttribute('data-color', 'success');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');

    rerender(
      <ModernLink
        href="https://example.com/disabled"
        rel="external"
        underline
        disabled
      >
        Disabled link
      </ModernLink>
    );

    const disabledLink = screen.getByText('Disabled link');
    fireEvent.click(disabledLink);
    expect(disabledLink).toHaveClass(
      'underline',
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none'
    );
    expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    expect(disabledLink).toHaveAttribute('rel', 'external');
    expect(disabledLink).not.toHaveAttribute('href');
  });
});

describe('Typography inline semantics: sub, sup and selection', () => {
  const SKIN = readFileSync(
    resolve(
      __dirname,
      '../../../../../foundation/tokens/css/runtime/engines/modern/skin/typography.css'
    ),
    'utf8'
  );

  it('accepts sub and sup so a footnote marker needs no raw element', () => {
    render(
      <ModernText as="sup" data-testid="marker">
        1
      </ModernText>
    );

    const marker = screen.getByTestId('marker');
    expect(marker.tagName).toBe('SUP');
    expect(marker).toHaveClass('rottay-typography--modern');
  });

  it('renders sub through the same governed scope', () => {
    render(
      <ModernText as="sub" data-testid="index">
        2
      </ModernText>
    );

    expect(screen.getByTestId('index').tagName).toBe('SUB');
  });

  // The UA pair (vertical-align: sub|super + font-size: smaller) grows the line
  // box, so one marker opens a gap in the leading of the paragraph around it.
  it('keeps sub and sup out of the line-box calculation', () => {
    const rule = SKIN.slice(SKIN.indexOf(':is(sub, sup)'));
    const body = rule.slice(0, rule.indexOf('}'));

    expect(body).toContain('position: relative');
    expect(body).toContain('vertical-align: baseline');
    expect(body).toContain('line-height: 0');
    expect(body).not.toContain('font-size: smaller');
  });

  it('offsets each on its own logical axis through a tenant channel', () => {
    expect(SKIN).toMatch(/:is\(sup\)[\s\S]{0,120}inset-block-end:\s*var\(--_ds-type-sup-offset/);
    expect(SKIN).toMatch(/:is\(sub\)[\s\S]{0,120}inset-block-start:\s*var\(--_ds-type-sub-offset/);
    expect(SKIN).not.toMatch(/:is\(sub, sup\)[\s\S]{0,200}(top|bottom):/);
  });

  // ::selection does not inherit, so nested emphasis inside a governed
  // paragraph fell back to the UA blue mid-sentence.
  it('tints selection on descendants, not just the element itself', () => {
    const rule = SKIN.match(
      /^\.rottay-typography[^{}]*::selection[^{]*\{[^}]*\}/m,
    )?.[0];

    expect(rule).toBeDefined();
    expect(rule).toContain('.rottay-typography--modern::selection');
    expect(rule).toContain('.rottay-typography--modern *::selection');
    expect(rule).toContain('--ds-type-selection-bg');
  });
});
