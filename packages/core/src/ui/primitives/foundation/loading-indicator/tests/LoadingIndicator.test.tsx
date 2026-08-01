import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingIndicator } from '..';

describe('LoadingIndicator', () => {
  it('renders the canonical spinner scope so the family skin can reach it', () => {
    const { container } = render(<LoadingIndicator />);
    const root = container.querySelector('.rottay-spinner') as HTMLElement;

    expect(root.classList.contains('rottay-spinner--modern')).toBe(true);
    expect(root.getAttribute('data-part')).toBe('root');
    expect(root.querySelector('[data-part="indicator"]')).not.toBeNull();
  });

  it('stamps the size axis, defaulting to md', () => {
    const { container: byDefault } = render(<LoadingIndicator />);
    expect(byDefault.querySelector('.rottay-spinner')?.getAttribute('data-size')).toBe('md');

    const { container: explicit } = render(<LoadingIndicator size="sm" />);
    expect(explicit.querySelector('.rottay-spinner')?.getAttribute('data-size')).toBe('sm');
  });

  it('is decorative by default: the glyph is hidden and carries no role', () => {
    const { container } = render(<LoadingIndicator />);
    const glyph = container.querySelector('[data-part="indicator"]') as HTMLElement;

    expect(glyph.getAttribute('aria-hidden')).toBe('true');
    expect(glyph.getAttribute('role')).toBeNull();
    expect(glyph.getAttribute('aria-label')).toBeNull();
  });

  it('announces as a status ONLY when statusLabel is supplied', () => {
    render(<LoadingIndicator statusLabel="Loading results" />);
    const status = screen.getByRole('status', { name: 'Loading results' });

    expect(status.getAttribute('aria-hidden')).toBeNull();
  });

  it('renders visible label copy beside the glyph without announcing it twice', () => {
    const { container } = render(<LoadingIndicator label="Loading" />);

    expect(container.querySelector('[data-part="label"]')).toHaveTextContent('Loading');
    expect(container.querySelector('[data-part="indicator"]')?.getAttribute('role')).toBeNull();
  });

  it('routes the instance ink through the spinner channel, never a literal', () => {
    const { container } = render(<LoadingIndicator color="var(--ds-color-primary)" />);
    const root = container.querySelector('.rottay-spinner') as HTMLElement;

    expect(root.style.getPropertyValue('--ds-spinner-color')).toBe('var(--ds-color-primary)');
  });

  it('lets a host family address the slot through data-part', () => {
    const { container } = render(<LoadingIndicator data-part="loading" />);

    expect(container.querySelector('[data-part="loading"]')).not.toBeNull();
  });
});
