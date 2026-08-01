import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  ApolloHeading,
  ApolloLink,
  ApolloParagraph,
  ApolloText,
} from '../engines/rustic';

describe('Typography rustic advanced engine coverage', () => {
  it('covers heading, text, paragraph, and link styling branches in the rustic engine', () => {
    const handleLinkClick = vi.fn();

    render(
      <>
        <ApolloHeading
          level="h2"
          size="lg"
          weight="semibold"
          align="center"
          color="primary"
          truncate
        >
          Heading
        </ApolloHeading>

        <ApolloText
          as="mark"
          size="sm"
          weight="medium"
          color="success"
          underline
          strikethrough
          italic
          monospace
          lineClamp={2}
        >
          Inline text
        </ApolloText>

        <ApolloParagraph
          size="lg"
          weight="light"
          color="muted"
          align="justify"
          truncate
        >
          Paragraph copy
        </ApolloParagraph>

        <ApolloLink
          href="https://example.com"
          target="_blank"
          underline
          strong
          onClick={handleLinkClick}
        >
          External link
        </ApolloLink>

        <ApolloLink href="https://example.com/disabled" disabled>
          Disabled link
        </ApolloLink>
      </>
    );

    const heading = screen.getByText('Heading');
    expect(heading.tagName).toBe('H2');
    expect(heading).toHaveStyle({ textAlign: 'center', whiteSpace: 'nowrap' });

    const text = screen.getByText('Inline text');
    expect(text.tagName).toBe('MARK');
    expect(text).toHaveStyle({
      fontStyle: 'italic',
      fontFamily: 'var(--ds-font-family-mono)',
      textDecoration: 'underline line-through',
      overflow: 'hidden',
    });

    const paragraph = screen.getByText('Paragraph copy');
    expect(paragraph.tagName).toBe('P');
    expect(paragraph).toHaveStyle({
      textAlign: 'justify',
      whiteSpace: 'nowrap',
    });

    const externalLink = screen.getByText('External link');
    fireEvent.click(externalLink);
    expect(handleLinkClick).toHaveBeenCalledTimes(1);
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');

    const disabledLink = screen.getByText('Disabled link');
    fireEvent.click(disabledLink);
    expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    expect(disabledLink).not.toHaveAttribute('href');
  });
});
