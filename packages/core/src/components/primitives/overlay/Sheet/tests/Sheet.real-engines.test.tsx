import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { Sheet } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

afterEach(() => {
  document.body.style.overflow = '';
  document.querySelectorAll('[data-sheet-test-trigger]').forEach((element) => element.remove());
});

describe('Sheet real engines', () => {
  it('covers overlay and escape guards in the rustic engine', async () => {
    await import('../engines/rustic');
    const handleLockedChange = vi.fn();
    const handleClosableChange = vi.fn();

    const { rerender } = renderWithEngine(
      <Sheet
        engine="rustic"
        open
        side="bottom"
        title="Locked sheet"
        onOpenChange={handleLockedChange}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      >
        Locked content
      </Sheet>,
      'rustic'
    );

    expect(await screen.findByText('Locked content', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(document.querySelector('[role=\"dialog\"]')).toBeTruthy();
    expect(screen.getByText('Locked sheet')).toBeInTheDocument();
    fireEvent.click(document.querySelector('[data-part=\"backdrop\"]') as Element);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleLockedChange).not.toHaveBeenCalled();

    rerender(
      <Sheet
        engine="rustic"
        open
        side="bottom"
        title="Closable sheet"
        onOpenChange={handleClosableChange}
      >
        Closable content
      </Sheet>
    );

    fireEvent.click(document.querySelector('[data-part=\"backdrop\"]') as Element);

    await waitFor(() => {
      expect(handleClosableChange).toHaveBeenCalledWith(false);
    });
  });

  it('switches side-specific layout in the rustic engine', async () => {
    await import('../engines/rustic');
    const handleChange = vi.fn();

    const { rerender } = renderWithEngine(
      <Sheet engine="rustic" open side="bottom" title="Bottom panel" onOpenChange={handleChange}>
        Body
      </Sheet>,
      'rustic'
    );

    expect(await screen.findByText('Bottom panel', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(document.querySelector('[data-placement=\"bottom\"]')).toHaveStyle({
      maxHeight: 'var(--ds-sheet-max-height, var(--ds-sheet-viewport-max-height, 85vh))',
    });

    rerender(
      <Sheet engine="rustic" open side="left" title="Left panel" onOpenChange={handleChange}>
        Body
      </Sheet>
    );

    expect(await screen.findByText('Left panel', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(document.querySelector('[style*=\"width: 380px\"]')).toBeTruthy();
  });

  it('portals the modern surface with stable dialog attributes and non-scrolling footer anatomy', async () => {
    await import('../engines/modern');

    const { container } = renderWithEngine(
      <Sheet
        engine="modern"
        open
        side="bottom"
        title="Advanced filters"
        onOpenChange={() => {}}
        id="candidate-filters"
        data-testid="candidate-filter-sheet"
        aria-label="Advanced filters"
        rootClassName="root-hook"
        surfaceClassName="surface-hook"
        bodyClassName="body-hook"
        footerClassName="footer-hook"
        footer={<button type="button">Apply filters</button>}
      >
        Filter controls
      </Sheet>,
      'modern'
    );

    const dialog = await screen.findByTestId('candidate-filter-sheet', {}, { timeout: 15000 });
    const root = dialog.closest('[data-part="root"]') as HTMLElement;
    const body = dialog.querySelector('[data-part="body"]') as HTMLElement;
    const footer = dialog.querySelector('[data-part="footer"]') as HTMLElement;

    expect(dialog).toHaveAttribute('id', 'candidate-filters');
    expect(dialog).toHaveAccessibleName('Advanced filters');
    expect(dialog).toHaveClass('surface-hook');
    expect(root).toHaveClass('root-hook');
    expect(body).toHaveClass('body-hook');
    expect(footer).toHaveClass('footer-hook');
    expect(body).not.toContainElement(footer);
    expect(container).not.toContainElement(root);
    expect(document.getElementById('rottay-portal-root')).toContainElement(root);
  });

  it('contains focus, restores the trigger, closes once, and restores the previous overflow', async () => {
    await import('../engines/modern');
    const handleChange = vi.fn();
    const trigger = document.createElement('button');
    trigger.textContent = 'Open filters';
    trigger.dataset.sheetTestTrigger = 'true';
    document.body.appendChild(trigger);
    trigger.focus();
    document.body.style.overflow = 'clip';

    const { rerender } = renderWithEngine(
      <Sheet
        engine="modern"
        open
        title="Filters"
        onOpenChange={handleChange}
        initialFocus="#sheet-primary-action"
      >
        <button id="sheet-primary-action" type="button">First action</button>
        <button type="button">Second action</button>
      </Sheet>,
      'modern'
    );

    const firstAction = await screen.findByRole(
      'button',
      { name: 'First action' },
      { timeout: 15000 }
    );
    await waitFor(() => expect(firstAction).toHaveFocus());
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenLastCalledWith(false);

    rerender(
      <Sheet
        engine="modern"
        open={false}
        title="Filters"
        onOpenChange={handleChange}
      >
        Closed content
      </Sheet>
    );

    await waitFor(() => expect(trigger).toHaveFocus());
    expect(document.body.style.overflow).toBe('clip');
    trigger.remove();
    document.body.style.overflow = '';
  });

  it('maps identity and anatomy hooks onto the classic drawer dialog', async () => {
    await import('../engines/classic');

    renderWithEngine(
      <Sheet
        engine="classic"
        open
        title={<span>Classic filters</span>}
        onOpenChange={() => {}}
        id="classic-filter-sheet"
        data-testid="classic-filter-test-hook"
        aria-label="Classic filters"
        rootClassName="classic-root-hook"
        surfaceClassName="classic-surface-hook"
        bodyClassName="classic-body-hook"
        footerClassName="classic-footer-hook"
        footer={<button type="button">Apply classic filters</button>}
      >
        Classic filter controls
      </Sheet>,
      'classic'
    );

    const dialog = await screen.findByTestId('classic-filter-test-hook', {}, { timeout: 15000 });
    const body = document.querySelector('.classic-body-hook') as HTMLElement;
    const footer = document.querySelector('.classic-footer-hook') as HTMLElement;
    const content = document.querySelector(
      '.classic-root-hook .ant-drawer-content'
    ) as HTMLElement;

    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('id', 'classic-filter-sheet');
    expect(document.querySelectorAll('#classic-filter-sheet')).toHaveLength(1);
    expect(dialog).toHaveAccessibleName('Classic filters');
    expect(dialog).toHaveClass('classic-surface-hook');
    expect(document.querySelector('.classic-root-hook')).toBeTruthy();
    expect(body).toHaveTextContent('Classic filter controls');
    expect(footer).toHaveTextContent('Apply classic filters');
    expect(body).not.toContainElement(footer);
    expect(content).toHaveStyle({
      paddingBottom:
        'var(--ds-sheet-safe-area-bottom, env(safe-area-inset-bottom, 0px))',
    });
  });

  it('closes only the topmost sheet on Escape and shares scroll lock across non-LIFO closes', async () => {
    await Promise.all([import('../engines/modern'), import('../engines/rustic')]);
    const firstChange = vi.fn();
    const secondChange = vi.fn();
    document.body.style.overflow = 'clip';

    const renderStack = (firstOpen: boolean, secondOpen: boolean) => (
      <>
        <Sheet engine="modern" open={firstOpen} title="First sheet" onOpenChange={firstChange}>
          First content
        </Sheet>
        <Sheet engine="rustic" open={secondOpen} title="Second sheet" onOpenChange={secondChange}>
          Second content
        </Sheet>
      </>
    );

    const { rerender } = renderWithEngine(renderStack(true, true), 'modern');
    await screen.findByText('Second content', {}, { timeout: 15000 });
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(firstChange).not.toHaveBeenCalled();
    expect(secondChange).toHaveBeenCalledTimes(1);

    // Close the lower sheet first: the upper registration must keep the lock.
    rerender(renderStack(false, true));
    await waitFor(() => expect(document.body.style.overflow).toBe('hidden'));

    rerender(renderStack(false, false));
    await waitFor(() => expect(document.body.style.overflow).toBe('clip'));
    document.body.style.overflow = '';
  });
});
