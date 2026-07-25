import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernConfirmDialog from '../engines/modern';

describe('ConfirmDialog modern engine overlay substrate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('portals into the shared portal root and re-stamps the tenant scope', () => {
    render(
      <div
        data-ds-root=""
        data-tenant="the-management"
        data-theme="editorial"
        style={{ '--ds-motion-glacial': '2s' } as React.CSSProperties}
      >
        <ModernConfirmDialog
          open
          variant="warning"
          title="Archive workspace"
          onCancel={() => {}}
        />
      </div>
    );

    const surface = screen.getByRole('alertdialog');
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
    const scope = surface.closest<HTMLElement>('[data-portal-scope="true"]');
    expect(scope).not.toBeNull();
    expect(scope).toHaveAttribute('data-tenant', 'the-management');
    expect(scope).toHaveAttribute('data-theme', 'editorial');
    expect(scope?.style.getPropertyValue('--ds-motion-glacial')).toBe('2s');
  });

  it('promotes a native dialog and marks the background inert while open', () => {
    const { container, rerender } = render(
      <ModernConfirmDialog open title="Archive workspace" onCancel={() => {}} />
    );

    const dialog = document.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(dialog?.open).toBe(true);
    expect(container).toHaveAttribute('aria-hidden', 'true');
    expect((container as HTMLElement & { inert?: boolean }).inert).toBe(true);

    rerender(<ModernConfirmDialog open={false} title="Archive workspace" onCancel={() => {}} />);
    expect(document.querySelector('dialog')).toBeNull();
    expect(container).not.toHaveAttribute('aria-hidden');
    expect((container as HTMLElement & { inert?: boolean }).inert).toBe(false);
  });

  it('closes on Escape via onCancel (engine parity with rustic)', () => {
    const onCancel = vi.fn();
    render(<ModernConfirmDialog open title="Delete segment" onCancel={onCancel} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('dismisses on backdrop click via onCancel', () => {
    const onCancel = vi.fn();
    render(<ModernConfirmDialog open title="Delete segment" onCancel={onCancel} />);

    fireEvent.click(document.querySelector('dialog') as HTMLDialogElement);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('restores focus to the previously focused element when closed', async () => {
    const { rerender } = render(
      <div>
        <button type="button">Opener</button>
        <ModernConfirmDialog open={false} title="Archive workspace" onCancel={() => {}} />
      </div>
    );

    const opener = screen.getByRole('button', { name: 'Opener' });
    opener.focus();
    expect(opener).toHaveFocus();

    rerender(
      <div>
        <button type="button">Opener</button>
        <ModernConfirmDialog open title="Archive workspace" onCancel={() => {}} />
      </div>
    );
    expect(document.querySelector('dialog')).not.toBeNull();

    rerender(
      <div>
        <button type="button">Opener</button>
        <ModernConfirmDialog open={false} title="Archive workspace" onCancel={() => {}} />
      </div>
    );

    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('keeps confirm/cancel callbacks and loading lock intact', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { rerender } = render(
      <ModernConfirmDialog open title="Publish" onConfirm={onConfirm} onCancel={onCancel} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    rerender(
      <ModernConfirmDialog open title="Publish" loading onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
