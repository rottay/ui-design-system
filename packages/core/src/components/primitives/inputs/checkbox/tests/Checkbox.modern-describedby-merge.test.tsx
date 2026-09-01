import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ModernCheckbox from '../engines/modern';

describe('ModernCheckbox aria-describedby merge', () => {
  const tokensOf = (container: HTMLElement) =>
    (container.querySelector('input[type="checkbox"]')?.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(Boolean);

  it('keeps its own description id when a caller adds an external one', () => {
    const { container } = render(
      <ModernCheckbox label="Accept terms" description="Required to continue" aria-describedby="external-error" />,
    );

    const tokens = tokensOf(container);
    // Replacing rather than merging would silence the checkbox's own help text.
    expect(tokens).toContain('external-error');
    expect(tokens.length).toBe(2);

    const ownId = tokens.find((t) => t !== 'external-error');
    expect(container.querySelector(`#${ownId}`)?.textContent).toBe('Required to continue');
  });

  it('forwards an external id when the checkbox has no description of its own', () => {
    const { container } = render(<ModernCheckbox label="Accept terms" aria-describedby="external-error" />);

    expect(tokensOf(container)).toEqual(['external-error']);
  });

  it('does not repeat a token the caller already supplied', () => {
    const { container } = render(
      <ModernCheckbox label="Accept terms" description="Required" aria-describedby="external-error external-error" />,
    );

    const tokens = tokensOf(container);
    expect(tokens.filter((t) => t === 'external-error').length).toBe(1);
  });
});
