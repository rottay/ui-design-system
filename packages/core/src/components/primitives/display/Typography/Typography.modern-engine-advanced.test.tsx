import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  ModernHeading,
  ModernLink,
  ModernParagraph,
  ModernText,
} from './engines/modern';

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

    expect(screen.getByText('Heading')).toHaveClass(
      'text-4xl',
      'font-bold',
      'text-right',
      'text-error',
      'truncate',
      'line-clamp-2',
      'qa-heading'
    );
    expect(screen.getByText('Inline text')).toHaveClass(
      'text-lg',
      'font-medium',
      'text-justify',
      'text-warning',
      'underline',
      'line-through',
      'italic',
      'font-mono',
      'truncate',
      'line-clamp-3',
      'qa-text'
    );
    expect(screen.getByText('Paragraph copy')).toHaveClass(
      'text-sm',
      'font-semibold',
      'text-center',
      'text-primary',
      'leading-relaxed',
      'mb-4',
      'truncate',
      'line-clamp-4',
      'qa-paragraph'
    );

    const externalLink = screen.getByText('External link');
    fireEvent.click(externalLink);
    expect(handleLinkClick).toHaveBeenCalledTimes(1);
    expect(externalLink).toHaveClass(
      'text-xl',
      'font-bold',
      'text-success',
      'font-semibold',
      'hover:underline',
      'transition-colors',
      'qa-link'
    );
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
