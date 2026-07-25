import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import ModernCallout from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

describe('Callout modern engine', () => {
  it('renders premium anatomy with a semantic status icon and action tray', () => {
    const { container } = renderWithEngine(
      <ModernCallout
        title="Decision ready"
        action={<button type="button">Review</button>}
        closable
      >
        Evidence is complete.
      </ModernCallout>,
      'modern',
    );

    const root = screen.getByRole('alert');
    expect(root).toHaveAttribute('data-has-title', 'true');
    expect(root).toHaveAttribute('data-has-action', 'true');
    expect(root).toHaveAttribute('data-closable', 'true');
    expect(container.querySelector('[data-icon-name="status.info"]')).not.toBeNull();
    expect(container.querySelector('[data-part="body"]')).not.toBeNull();
    expect(container.querySelector('[data-part="action"]')).not.toBeNull();
    expect(container.querySelector('[data-icon-name="action.close"]')).not.toBeNull();
  });

  it('localizes and executes the close control', () => {
    const onClose = vi.fn();
    renderWithEngine(
      <ModernCallout closable onClose={onClose}>Context</ModernCallout>,
      'modern',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('carries no DaisyUI structural class (drained: paint is skin-owned)', () => {
    renderWithEngine(<ModernCallout title="Token painted">Body</ModernCallout>, 'modern');

    const root = screen.getByRole('alert');
    expect(root.className).toContain('rottay-callout-shell--modern');
    // The drained DaisyUI `alert` class must not reappear; the skin's
    // `.rottay-callout-shell--modern` rules replace its grid/paint entirely.
    expect(root.className.split(/\s+/)).not.toContain('alert');
  });

  it('keeps the dismiss control reachable with overlong title and body', () => {
    renderWithEngine(
      <ModernCallout
        variant="error"
        closable
        title="Payment method declined by the issuing bank during the automated monthly renewal"
      >
        We retried the default card three times over the past 48 hours. Update the billing profile to keep
        premium features active; all data and configurations are preserved for 30 days regardless.
      </ModernCallout>,
      'modern',
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'error');
  });
});
