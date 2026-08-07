import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernAlert from '../engines/modern';

describe('Modern Alert dismiss control identity', () => {
  it('describes the close button with the message it dismisses', () => {
    render(<ModernAlert type="warning" message="Low disk space" closable />);

    const close = screen.getByRole('button', { name: 'Close' });
    const describedBy = close.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent('Low disk space');
  });

  it('gives a stack of alerts distinguishable close buttons', () => {
    render(
      <>
        <ModernAlert type="error" message="Payment declined" closable />
        <ModernAlert type="info" message="Trial ends Friday" closable />
      </>
    );

    const [first, second] = screen.getAllByRole('button', { name: 'Close' });
    const descriptionOf = (btn: HTMLElement) =>
      document.getElementById(btn.getAttribute('aria-describedby') as string)?.textContent;

    expect(descriptionOf(first)).toBe('Payment declined');
    expect(descriptionOf(second)).toBe('Trial ends Friday');
    expect(first.getAttribute('aria-describedby')).not.toBe(
      second.getAttribute('aria-describedby')
    );
  });

  it('keeps the label element addressable even without a close button', () => {
    render(<ModernAlert type="info" message="All good" />);

    const label = document.querySelector('[data-part="label"]') as HTMLElement;
    expect(label.id).toBeTruthy();
  });
});
