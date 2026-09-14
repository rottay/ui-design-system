import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import ModernCallout from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

describe('Callout modern engine (folded into Alert)', () => {
  it('renders the alert surface with a semantic status icon and action tray', () => {
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

    const root = screen.getByRole('status');
    expect(root).toHaveClass('ds-alert', 'ds-alert--modern');
    expect(container.querySelector('[data-part="title"]')).toHaveTextContent('Decision ready');
    expect(container.querySelector('[data-part="description"]')).toHaveTextContent('Evidence is complete.');
    expect(container.querySelector('[data-icon-name="status.info"]')).not.toBeNull();
    expect(container.querySelector('[data-part="actions"]')).not.toBeNull();
    expect(container.querySelector('[data-icon-name="action.close"]')).not.toBeNull();
  });

  it('localizes and executes the close control', () => {
    const onClose = vi.fn();
    renderWithEngine(
      <ModernCallout closable onClose={onClose}>Context</ModernCallout>,
      'modern',
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
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

describe('Callout live-region politeness', () => {
  // Guidance banners render with the page. An assertive live region announces
  // over whatever the user is already reading, so only the urgent half of the
  // severity grammar may claim it.
  it.each([
    ['warning', 'alert'],
    ['danger', 'alert'],
    ['info', 'status'],
    ['success', 'status'],
  ] as const)('gives tone=%s the %s role', (tone, expectedRole) => {
    renderWithEngine(<ModernCallout tone={tone}>Guidance</ModernCallout>, 'modern');

    const root = screen.getByRole(expectedRole);
    expect(root).toHaveAttribute('data-part', 'root');
    expect(root).toHaveTextContent('Guidance');
  });

  it('does not leave a calm tone announcing assertively', () => {
    renderWithEngine(<ModernCallout tone="success">Saved</ModernCallout>, 'modern');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('escalates to assertive when the same banner switches to an urgent tone', () => {
    const { rerender } = renderWithEngine(
      <ModernCallout tone="info">Retrying</ModernCallout>,
      'modern',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<ModernCallout tone="danger">Failed</ModernCallout>);
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'error');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('emits no stray class token when the caller passes no className', () => {
    renderWithEngine(<ModernCallout>Body</ModernCallout>, 'modern');

    const root = screen.getByRole('status');
    expect(root.className).toBe(root.className.trim());
    expect(root.className.split(' ')).not.toContain('');
  });
});
