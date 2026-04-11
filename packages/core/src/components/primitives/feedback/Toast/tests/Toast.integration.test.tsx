import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { message, notification } from 'antd';

import { Toast, ToastProvider, toast, useToast } from '..';
import { getToastMethods } from '../utils';
import { renderSurface } from '../../../../surfaces/common/test-utils';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

function ToastHarness(): React.ReactElement {
  const toast = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          toast.success('Saved', 'Changes persisted', {
            duration: 0,
            action: {
              label: 'Undo',
              onClick: () => undefined,
            },
          })
        }
      >
        Show success
      </button>
      <Toast.Container />
    </>
  );
}

describe('Toast integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a live rustic toast stack through the provider and container', async () => {
    renderSurface(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show success' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    expect(await screen.findByText('Changes persisted')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('renders the live rustic engine directly and closes through the dismiss control', async () => {
    const onClose = vi.fn();

    renderSurface(
      <Toast
        engine="rustic"
        visible
        variant="warning"
        title="Requires review"
        description="Check the final configuration."
        closable
        showProgress
        onClose={onClose}
      />
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Requires review');
    expect(alert).toHaveTextContent('Check the final configuration.');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps semantic token-driven colors on the rustic engine', async () => {
    renderSurface(
      <Toast
        engine="rustic"
        visible
        variant="gradient"
        title="Gradient"
        description="Token driven background"
      />
    );

    const alert = await screen.findByRole('alert');
    expect(alert.getAttribute('style') ?? '').toContain('var(--ds-toast-gradient-bg');
    expect(alert.getAttribute('style') ?? '').toContain('var(--ds-toast-gradient-color');
  });

  it('registers standalone toast methods while the provider is mounted', async () => {
    renderSurface(
      <ToastProvider>
        <Toast.Container />
      </ToastProvider>
    );

    expect(getToastMethods()).not.toBeNull();

    let id: string | null = null;
    await act(async () => {
      id = toast.success('Background task', 'Finished successfully', { duration: 0 });
    });
    expect(id).toBeTruthy();
    expect(await screen.findByText('Background task')).toBeInTheDocument();
  });

  it('warns and returns null when the standalone toast API is used without a provider', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(toast.success('Missing provider')).toBeNull();
    expect(toast.show({ title: 'Missing provider' })).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('routes the classic engine to the Ant message API for simple toasts', async () => {
    const successSpy = vi.spyOn(message, 'success').mockImplementation(() => undefined as never);

    renderWithEngine(
      <Toast engine="classic" visible variant="success" description="Saved successfully" duration={0} />,
      'classic'
    );

    await waitFor(() => {
      expect(successSpy).toHaveBeenCalled();
    });
  });

  it('routes the classic engine to the Ant notification API for titled toasts', async () => {
    const infoSpy = vi.spyOn(notification, 'info').mockImplementation(() => undefined as never);

    renderWithEngine(
      <Toast
        engine="classic"
        visible
        variant="info"
        title="Background sync"
        description="Sync completed"
        duration={0}
        action={{ label: 'Open', onClick: () => undefined }}
      />,
      'classic'
    );

    await waitFor(() => {
      expect(infoSpy).toHaveBeenCalled();
    });
  });

  it('covers hidden classic toasts and default info routing without an explicit variant', async () => {
    const infoSpy = vi.spyOn(message, 'info').mockImplementation(() => undefined as never);

    const { rerender } = renderWithEngine(
      <Toast engine="classic" visible={false} description="Hidden toast" />,
      'classic'
    );

    await waitFor(() => {
      expect(infoSpy).not.toHaveBeenCalled();
    });

    rerender(<Toast engine="classic" visible description="Heads up" />);

    await waitFor(() => {
      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Heads up' })
      );
    });
  });

  it('covers warning notifications with action buttons and error messages on the classic engine', async () => {
    const warningSpy = vi.spyOn(notification, 'warning').mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => undefined as never);
    const destroySpy = vi.spyOn(notification, 'destroy').mockImplementation(() => undefined as never);
    const actionSpy = vi.fn();

    const { rerender } = renderWithEngine(
      <Toast
        engine="classic"
        visible
        variant="warning"
        description="Needs manual review"
        duration={0}
        action={{ label: 'Resolve', onClick: actionSpy }}
      />,
      'classic'
    );

    await waitFor(() => {
      expect(warningSpy).toHaveBeenCalled();
    });

    const warningCall = warningSpy.mock.calls.at(-1)?.[0];
    expect(warningCall?.message).toBe('Needs manual review');
    warningCall?.btn?.props?.onClick?.();
    expect(actionSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalled();

    rerender(
      <Toast
        engine="classic"
        visible
        variant="error"
        description="Upload failed"
        duration={0}
      />
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Upload failed' })
      );
    });
  });

  it('renders the live modern engine directly with action and progress content', async () => {
    renderWithEngine(
      <Toast
        engine="modern"
        visible
        variant="warning"
        title="Needs review"
        description="Check the generated summary."
        showProgress
        action={{ label: 'Resolve', onClick: () => undefined, closeOnClick: false }}
      />,
      'modern'
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Needs review');
    expect(alert).toHaveTextContent('Check the generated summary.');
    expect(await screen.findByRole('button', { name: 'Resolve' })).toBeInTheDocument();
    expect(alert.querySelector('.h-1')).toBeTruthy();
  });
});
