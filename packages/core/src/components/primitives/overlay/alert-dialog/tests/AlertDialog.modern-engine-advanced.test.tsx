import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernAlertDialog from '../engines/modern';

describe('AlertDialog modern engine overlay substrate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('portals into the shared portal root and re-stamps the tenant scope', () => {
    render(
      <div
        data-ds-root=""
        data-tenant="bithire"
        data-theme="light"
        style={{ '--ds-modal-padding': '2rem' } as React.CSSProperties}
      >
        <ModernAlertDialog
          open
          onOpenChange={() => {}}
          title="Revoke access?"
          description="All sessions will be terminated."
        />
      </div>
    );

    const surface = screen.getByRole('alertdialog');
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
    const scope = surface.closest<HTMLElement>('[data-portal-scope="true"]');
    expect(scope).not.toBeNull();
    expect(scope).toHaveAttribute('data-tenant', 'bithire');
    expect(scope).toHaveAttribute('data-theme', 'light');
    expect(scope?.style.getPropertyValue('--ds-modal-padding')).toBe('2rem');
  });

  it('promotes a native dialog to the top layer and marks the background inert while open', () => {
    const { container, rerender } = render(
      <ModernAlertDialog open onOpenChange={() => {}} title="Revoke access?" />
    );

    const dialog = document.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(dialog?.open).toBe(true);
    expect(container).toHaveAttribute('aria-hidden', 'true');
    expect((container as HTMLElement & { inert?: boolean }).inert).toBe(true);

    rerender(<ModernAlertDialog open={false} onOpenChange={() => {}} title="Revoke access?" />);
    expect(document.querySelector('dialog')).toBeNull();
    expect(container).not.toHaveAttribute('aria-hidden');
    expect((container as HTMLElement & { inert?: boolean }).inert).toBe(false);
  });

  it('closes on Escape through the shared layer router', () => {
    const onOpenChange = vi.fn();
    render(<ModernAlertDialog open onOpenChange={onOpenChange} title="Revoke access?" />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('restores focus to the previously focused element when closed', async () => {
    const { rerender } = render(
      <div>
        <button type="button">Opener</button>
        <ModernAlertDialog open={false} onOpenChange={() => {}} title="Revoke access?" />
      </div>
    );

    const opener = screen.getByRole('button', { name: 'Opener' });
    opener.focus();
    expect(opener).toHaveFocus();

    rerender(
      <div>
        <button type="button">Opener</button>
        <ModernAlertDialog open onOpenChange={() => {}} title="Revoke access?" />
      </div>
    );
    expect(document.querySelector('dialog')).not.toBeNull();

    rerender(
      <div>
        <button type="button">Opener</button>
        <ModernAlertDialog open={false} onOpenChange={() => {}} title="Revoke access?" />
      </div>
    );

    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('keeps the backdrop guard behind closeOnBackdropClick', () => {
    const lockedChange = vi.fn();
    const { rerender } = render(
      <ModernAlertDialog open onOpenChange={lockedChange} title="Locked" />
    );

    fireEvent.click(document.querySelector('dialog') as HTMLDialogElement);
    expect(lockedChange).not.toHaveBeenCalled();

    const closableChange = vi.fn();
    rerender(
      <ModernAlertDialog open onOpenChange={closableChange} title="Closable" closeOnBackdropClick />
    );
    fireEvent.click(document.querySelector('dialog') as HTMLDialogElement);
    expect(closableChange).toHaveBeenCalledWith(false);
  });

  it('routes the cancel button through onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    render(<ModernAlertDialog open onOpenChange={onOpenChange} title="Revoke access?" />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
