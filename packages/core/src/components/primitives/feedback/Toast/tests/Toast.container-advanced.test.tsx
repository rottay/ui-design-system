import React, { useEffect } from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Toast, ToastProvider, useToast } from '..';
import { renderSurface } from '../../../../surfaces/common/test-utils';

function SeededToasts(): React.ReactElement {
  const api = useToast();

  useEffect(() => {
    api.show({
      title: 'Primary stack',
      description: 'Default position',
      duration: 0,
      position: 'top-right',
      closable: true,
    });
    api.show({
      title: 'Secondary stack',
      description: 'Filtered position',
      duration: 0,
      position: 'bottom-center',
      closable: true,
    });
  }, []);

  return null;
}

describe('Toast.Container advanced behavior', () => {
  it('filters by position, respects max, and supports custom renderers', async () => {
    renderSurface(
      <ToastProvider position="top-right">
        <SeededToasts />
        <Toast.Container
          position="bottom-center"
          max={1}
          renderToast={(toast) => <div data-testid="custom-toast">{toast.options.title}</div>}
        />
      </ToastProvider>
    );

    expect(await screen.findByTestId('custom-toast')).toHaveTextContent('Secondary stack');
    expect(screen.queryByText('Primary stack')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByTestId('custom-toast').parentElement as HTMLElement);
    fireEvent.mouseLeave(screen.getByTestId('custom-toast').parentElement as HTMLElement);
  });

  it('dismisses rendered toasts through the default stack and removes them after exit', async () => {
    function Harness(): React.ReactElement {
      const api = useToast();

      return (
        <>
          <button
            type="button"
            onClick={() =>
              api.show({
                title: 'Dismiss me',
                description: 'Close branch',
                duration: 0,
                closable: true,
              })
            }
          >
            Show dismissible
          </button>
          <Toast.Container />
        </>
      );
    }

    renderSurface(
      <ToastProvider>
        <Harness />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show dismissible' }));

    expect(await screen.findByText('Dismiss me')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    });

    await waitFor(() => {
      expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
    });
  });
});
