import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { Modal } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('Modal advanced engine coverage', () => {
  it('covers rustic modal branches for placement, callbacks, scroll locking, backdrop guard, and escape handling', async () => {
    const handleClose = vi.fn();
    const handleOpen = vi.fn();
    const handleOpenChange = vi.fn();

    const { container, rerender, unmount } = renderWithEngine(
      <Modal
        engine="rustic"
        open
        title="Rustic modal"
        description="Rustic body"
        footer={<button type="button">Confirm</button>}
        placement="bottom"
        closeOnBackdropClick={false}
        closeOnEscape
        divider
        fullScreen
        blurBackdrop
        preventScroll
        disableAnimation
        onClose={handleClose}
        onOpen={handleOpen}
        onOpenChange={handleOpenChange}
      >
        Rustic content
      </Modal>,
      'rustic'
    );

    expect(await screen.findByText('Rustic content')).toBeInTheDocument();
    expect(handleOpen).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(document.body.querySelector('.rottay-overlay') as HTMLDivElement);
    expect(handleClose).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    rerender(
      <Modal
        engine="rustic"
        open
        title="Rustic modal"
        closeOnBackdropClick
        onClose={handleClose}
      >
        Rustic content
      </Modal>
    );

    fireEvent.click(document.body.querySelector('.rottay-overlay') as HTMLDivElement);
    expect(handleClose).toHaveBeenCalledTimes(2);

    unmount();
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('');
    });
  });

  it('covers modern modal branches for placement classes, divider/header/footer, backdrop guard, and closable=false', async () => {
    const handleClose = vi.fn();

    const { rerender } = renderWithEngine(
      <Modal
        engine="modern"
        open
        title="Modern modal"
        description="Modern body"
        footer={<button type="button">Save</button>}
        placement="top"
        adaptiveFullscreen={false}
        divider
        closeOnBackdropClick={false}
        onClose={handleClose}
      >
        Modern content
      </Modal>,
      'modern'
    );

    expect(await screen.findByText('Modern content')).toBeInTheDocument();
    const dialog = document.body.querySelector('dialog') as HTMLDialogElement | null;
    expect(dialog).toHaveClass('rottay-modal', 'rottay-modal--modern');
    expect(dialog?.style.alignItems).toBe('flex-start');
    expect(dialog?.style.paddingTop).toBe('10vh');

    fireEvent.click(dialog!);
    expect(handleClose).not.toHaveBeenCalled();

    rerender(
      <Modal engine="modern" open title="Static modal" closable={false} onClose={handleClose}>
        Modern content
      </Modal>
    );

    expect(screen.queryByLabelText(/close/i)).not.toBeInTheDocument();
  }, 10000);

  it('covers modern native close, custom header, and no-backdrop branches', async () => {
    const handleClose = vi.fn();

    renderWithEngine(
      <Modal
        engine="modern"
        open
        header={<div>Custom header</div>}
        showBackdrop={false}
        shadow={false}
        padding="sm"
        radius="sm"
        onClose={handleClose}
      >
        Minimal content
      </Modal>,
      'modern'
    );

    expect(await screen.findByText('Minimal content')).toBeInTheDocument();
    expect(screen.getByText('Custom header')).toBeInTheDocument();

    const dialog = document.body.querySelector('dialog') as HTMLDialogElement;
    expect(document.body.querySelector('.modal-backdrop')).toBeNull();

    fireEvent.click(dialog.querySelector('[role="document"]') as HTMLDivElement);
    expect(handleClose).not.toHaveBeenCalled();

    fireEvent(dialog, new Event('close'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('covers modern fullscreen, bottom placement, blur backdrop, preventScroll, and escape-disabled branches', async () => {
    const handleClose = vi.fn();

    const { unmount } = renderWithEngine(
      <Modal
        engine="modern"
        open
        title="Fullscreen modal"
        placement="bottom"
        fullScreen
        blurBackdrop
        preventScroll
        closeOnEscape={false}
        onClose={handleClose}
      >
        Fullscreen content
      </Modal>,
      'modern'
    );

    expect(await screen.findByText('Fullscreen content')).toBeInTheDocument();
    const dialog = document.body.querySelector('dialog') as HTMLDialogElement;
    expect(dialog).toHaveClass('rottay-modal', 'rottay-modal--modern');
    expect(dialog).toHaveStyle({ alignItems: 'flex-end' });
    expect(document.body.style.overflow).toBe('hidden');

    // Sizing stays inline (viewport-derived); the fullscreen radius override is the
    // skin's, keyed on the state attribute the engine stamps.
    const modalBox = dialog.querySelector('[role="document"]') as HTMLDivElement;
    expect(modalBox).toHaveStyle({
      width: '100vw',
      maxWidth: 'none',
      maxHeight: 'none',
    });
    expect(modalBox.getAttribute('data-fullscreen')).toBe('true');

    const backdrop = Array.from(dialog.children).find(
      (node) => !(node as HTMLElement).hasAttribute('role')
    ) as HTMLDivElement;
    // The blur itself is the skin's (--ds-glass-backdrop-filter, WO-ENG-05 glass
    // wiring); the engine's job is to stamp which branch is active.
    expect(backdrop.getAttribute('data-blur')).toBe('true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();

    unmount();
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('');
    });
  });
});
