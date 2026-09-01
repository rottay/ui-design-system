import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernLink from '../engines/modern';

const relTokens = (link: HTMLElement): string[] =>
  (link.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean);

describe('Link modern engine outbound hardening', () => {
  it('hardens a caller-supplied target="_blank" that never went through `external`', () => {
    render(
      <ModernLink href="https://example.com" target="_blank">
        Partner
      </ModernLink>
    );

    const link = screen.getByRole('link', { name: 'Partner (opens in new tab)' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(relTokens(link)).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer'])
    );
  });

  it('merges a caller-supplied rel with the hardening tokens instead of clobbering it', () => {
    render(
      <ModernLink href="https://example.com" external rel="nofollow">
        Sponsor
      </ModernLink>
    );

    const link = screen.getByRole('link', { name: 'Sponsor (opens in new tab)' });
    expect(relTokens(link)).toEqual(
      expect.arrayContaining(['nofollow', 'noopener', 'noreferrer'])
    );
  });

  it('does not duplicate hardening tokens the caller already supplied', () => {
    render(
      <ModernLink href="https://example.com" external rel="noopener">
        Docs
      </ModernLink>
    );

    const link = screen.getByRole('link', { name: 'Docs (opens in new tab)' });
    const tokens = relTokens(link);
    expect(tokens.filter((token) => token === 'noopener')).toHaveLength(1);
    expect(tokens).toContain('noreferrer');
  });

  it('leaves same-tab links free of an invented rel', () => {
    render(<ModernLink href="/dashboard">Dashboard</ModernLink>);

    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).not.toHaveAttribute('rel');
    expect(link).not.toHaveAttribute('target');
  });

  it('treats an uppercase _BLANK as the new-context keyword it is', () => {
    render(
      <ModernLink href="https://example.com" target="_BLANK">
        Mirror
      </ModernLink>
    );

    const link = screen.getByRole('link', { name: 'Mirror (opens in new tab)' });
    expect(relTokens(link)).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer'])
    );
  });

  it('never announces a new tab the caller target does not open', () => {
    render(
      <ModernLink href="https://example.com" external target="_self">
        Inline
      </ModernLink>
    );

    const link = screen.getByRole('link', { name: 'Inline' });
    expect(link).toHaveAttribute('target', '_self');
    expect(link).not.toHaveAttribute('rel');
    expect(screen.queryByText('(opens in new tab)')).toBeNull();
  });
});
