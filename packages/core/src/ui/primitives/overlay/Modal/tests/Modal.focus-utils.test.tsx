import React from 'react';
import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { FocusTrap, useFocusTrap } from '../../../runtime/overlay/focus-management/focus-trap';
import { Portal, usePortalContainer } from '../../../runtime/overlay/portal';

function PortalHarness(): React.ReactElement | null {
  const container = usePortalContainer('custom-portal-root');
  return container ? <span data-testid="portal-ready">{container.id}</span> : null;
}

function FocusTrapHookHarness(): React.ReactElement {
  const { trapFocus, releaseFocus } = useFocusTrap();

  return (
    <>
      <button type="button" data-testid="before-hook">Before hook</button>
      <div
        data-testid="hook-container"
        ref={(node) => {
          if (node) {
            Object.defineProperty(node, 'offsetParent', { configurable: true, value: document.body });
          }
        }}
      >
        <button
          type="button"
          data-testid="hook-first"
          ref={(node) => {
            if (node) {
              Object.defineProperty(node, 'offsetParent', { configurable: true, value: document.body });
            }
          }}
        >
          Hook first
        </button>
      </div>
      <button
        type="button"
        onClick={() => trapFocus(screen.getByTestId('hook-container'))}
      >
        Trap
      </button>
      <button type="button" onClick={releaseFocus}>
        Release
      </button>
    </>
  );
}

describe('Modal focus/portal utilities', () => {
  it('traps focus forward and backward within the container', async () => {
    render(
      <FocusTrap active autoFocus initialFocus="#first-focus">
        <button id="first-focus" type="button">First</button>
        <button id="second-focus" type="button">Second</button>
      </FocusTrap>
    );

    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });

    Object.defineProperty(first, 'offsetParent', { configurable: true, value: document.body });
    Object.defineProperty(second, 'offsetParent', { configurable: true, value: document.body });

    await waitFor(() => {
      expect(first).toHaveFocus();
    });

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(second).toHaveFocus();

    fireEvent.keyDown(second, { key: 'Tab' });
    expect(first).toHaveFocus();
  });

  it('focuses the container itself when no focusable descendants exist and restores the final target on unmount', async () => {
    const finalTarget = document.createElement('button');
    finalTarget.textContent = 'Final target';
    document.body.appendChild(finalTarget);

    const { unmount } = render(
      <FocusTrap active autoFocus finalFocus={finalTarget}>
        <div data-testid="content">Plain content</div>
      </FocusTrap>
    );

    const trap = screen.getByTestId('content').parentElement as HTMLElement;
    Object.defineProperty(trap, 'offsetParent', { configurable: true, value: document.body });

    await waitFor(() => {
      expect(trap).toHaveFocus();
      expect(trap).toHaveAttribute('tabindex', '-1');
    });

    unmount();

    await waitFor(() => {
      expect(finalTarget).toHaveFocus();
    });
  });

  it('does not restore focus when restoreFocus is disabled and keeps inactive traps passive', async () => {
    const launcher = document.createElement('button');
    launcher.textContent = 'Launcher';
    document.body.appendChild(launcher);
    launcher.focus();

    const { unmount } = render(
      <FocusTrap active={false} autoFocus={false} restoreFocus={false}>
        <button type="button">Passive child</button>
      </FocusTrap>
    );

    expect(launcher).toHaveFocus();

    const passiveChild = screen.getByRole('button', { name: 'Passive child' });
    fireEvent.keyDown(passiveChild, { key: 'Tab' });
    expect(launcher).toHaveFocus();

    unmount();
    expect(launcher).toHaveFocus();
  });

  it('exposes the useFocusTrap hook helpers for imperative trap and release flows', async () => {
    const launcher = document.createElement('button');
    launcher.textContent = 'Hook launcher';
    document.body.appendChild(launcher);
    launcher.focus();

    render(<FocusTrapHookHarness />);

    const before = screen.getByTestId('before-hook');
    before.focus();
    expect(before).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Trap' }));

    await waitFor(() => {
      expect(screen.getByTestId('hook-first')).toHaveFocus();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Release' }));
    });

    expect(launcher).toHaveFocus();
  });

  it('uses the provided portal container and creates custom portal roots', async () => {
    const customContainer = document.createElement('div');
    customContainer.id = 'provided-portal';
    document.body.appendChild(customContainer);

    render(
      <>
        <Portal container={customContainer}>
          <div data-testid="portal-child">Portal child</div>
        </Portal>
        <PortalHarness />
      </>
    );

    expect(customContainer.textContent).toContain('Portal child');
    expect(await screen.findByTestId('portal-ready')).toHaveTextContent('custom-portal-root');
  });
});
