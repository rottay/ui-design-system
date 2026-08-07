// `{...rest}` lands after the engine's aria attributes, so a caller's `aria-describedby`
// must merge with the switch's own association instead of replacing it.

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ModernToggle from '../engines/modern';

describe('Toggle modern aria-describedby merge', () => {
  it('keeps its own description when a caller supplies aria-describedby', () => {
    const { container } = render(
      <ModernToggle
        label="Sync"
        description="Runs every 15 minutes"
        {...({ 'aria-describedby': 'form-hint' } as Record<string, string>)}
      />,
    );

    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;
    const description = container.querySelector('[data-part="description"]') as HTMLElement;
    const tokens = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);

    expect(tokens).toContain('form-hint');
    expect(tokens).toContain(description.id);
  });

  it('keeps its own error message when a caller supplies aria-describedby', () => {
    const { container } = render(
      <ModernToggle
        label="Sync"
        error
        errorMessage="Sync failed"
        {...({ 'aria-describedby': 'form-hint' } as Record<string, string>)}
      />,
    );

    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;
    const errorNode = container.querySelector('[data-part="error-message"]') as HTMLElement;
    const tokens = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);

    expect(tokens).toContain('form-hint');
    expect(tokens).toContain(errorNode.id);
  });

  it('does not duplicate a token the caller repeats', () => {
    const { container } = render(
      <ModernToggle
        label="Sync"
        helperText="Optional"
        {...({ 'aria-describedby': 'form-hint form-hint' } as Record<string, string>)}
      />,
    );

    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;
    const tokens = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    expect(tokens.filter((token) => token === 'form-hint')).toHaveLength(1);
  });
});
