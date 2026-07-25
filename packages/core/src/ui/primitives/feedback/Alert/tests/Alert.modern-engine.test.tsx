/**
 * Alert modern engine -- focused real-engine coverage (K1 Lane C).
 *
 * Renders the actual modern engine (no factory mock) through the shared
 * `renderWithEngine` helper so i18n/engine context match production. Covers
 * the premium anatomy contract, the Daisy drain (no `alert` structural class
 * remains -- the unlayered `skin/alert.css` owns all paint), tone surface,
 * and the dismiss lifecycle.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import ModernAlert from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

describe('Alert modern engine', () => {
  it('renders premium anatomy keyed on data-part/data-tone', () => {
    const { container } = renderWithEngine(
      <ModernAlert
        type="warning"
        message="Review pending"
        description="Two approvals are still outstanding."
        closable
      />,
      'modern',
    );

    const root = screen.getByRole('alert');
    expect(root).toHaveAttribute('data-part', 'root');
    expect(root).toHaveAttribute('data-tone', 'warning');
    expect(root).toHaveAttribute('data-has-icon', 'true');
    expect(root).toHaveAttribute('data-has-description', 'true');
    expect(root).toHaveAttribute('data-closable', 'true');
    expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
    expect(container.querySelector('[data-part="label"]')).not.toBeNull();
    expect(container.querySelector('[data-part="description"]')).not.toBeNull();
    expect(container.querySelector('[data-part="action"]')).not.toBeNull();
    expect(container.querySelector('[data-icon-name="status.warning"]')).not.toBeNull();
    expect(container.querySelector('[data-icon-name="action.close"]')).not.toBeNull();
  });

  it('carries no DaisyUI structural class (drained: paint is skin-owned)', () => {
    renderWithEngine(<ModernAlert message="Token painted" />, 'modern');

    const root = screen.getByRole('alert');
    expect(root.className).toContain('rottay-alert-shell--modern');
    // The drained DaisyUI `alert` class must not reappear; the skin's
    // `.rottay-alert-shell--modern` rules replace its grid/paint entirely.
    expect(root.className.split(/\s+/)).not.toContain('alert');
  });

  it('honours tone precedence over the deprecated type prop', () => {
    renderWithEngine(<ModernAlert message="m" tone="danger" type="info" />, 'modern');
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'error');
  });

  it('dismisses through the localized close control', () => {
    const onClose = vi.fn();
    renderWithEngine(<ModernAlert message="Dismiss me" closable onClose={onClose} />, 'modern');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('omits optional parts when their props are absent', () => {
    const { container } = renderWithEngine(
      <ModernAlert message="Bare" showIcon={false} />,
      'modern',
    );

    expect(container.querySelector('[data-part="icon"]')).toBeNull();
    expect(container.querySelector('[data-part="description"]')).toBeNull();
    expect(container.querySelector('[data-part="action"]')).toBeNull();
    expect(screen.getByRole('alert')).toHaveAttribute('data-has-icon', 'false');
  });

  it('renders long content without losing the dismiss control', () => {
    renderWithEngine(
      <ModernAlert
        type="error"
        closable
        message="Synchronization failed for the quarterly compliance evidence package after three automatic retries"
        description="The remote archive rejected the transfer because the session certificate expired while the payload was streaming. Renew the certificate from the security console, then resume the synchronization from the operations dashboard."
      />,
      'modern',
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'error');
  });
});
