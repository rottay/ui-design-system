import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { ToastMethods } from './Toast.types';
import {
  ToastProvider,
  useToastContext,
} from './utils/ToastProvider';
import {
  clearToastMethods,
  getToastMethods,
  setToastMethods,
  toast,
  useToast,
} from './utils/useToast';
function ToastHookHarness(): React.ReactElement {
  const api = useToast();

  return (
    <>
      <button type="button" onClick={() => api.success('Saved', 'Changes stored')}>
        Success
      </button>
      <button type="button" onClick={() => api.error('Error', 'Something failed')}>
        Error
      </button>
      <button type="button" onClick={() => api.warning('Warn', 'Review required')}>
        Warning
      </button>
      <button type="button" onClick={() => api.info('Info', 'Heads up')}>
        Info
      </button>
      <button
        type="button"
        onClick={() => {
          const id = api.show({ title: 'Custom', description: 'Body', duration: 1000 });
          api.update(id, { description: 'Updated body' });
          api.pause(id);
          api.resume(id);
          api.dismiss(id);
          api.remove(id);
        }}
      >
        Lifecycle
      </button>
      <div data-testid="toast-count">{api.toasts.length}</div>
    </>
  );
}

function ContextProbe(): React.ReactElement {
  const context = useToastContext();
  return <div data-testid="context-ready">{context.config.position}</div>;
}

describe('Toast utilities advanced coverage', () => {
  afterEach(() => {
    clearToastMethods();
    vi.restoreAllMocks();
    document.getElementById('rottay-toast-animations')?.remove();
  });

  it('hydrates provider methods, context, and hook lifecycle helpers', () => {
    render(
      <ToastProvider position="bottom-left" duration={2000} max={2} gap={6} pauseOnHover={false} reverseOrder>
        <ContextProbe />
        <ToastHookHarness />
      </ToastProvider>
    );

    expect(screen.getByTestId('context-ready')).toHaveTextContent('bottom-left');
    expect(getToastMethods()).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Success' }));
    fireEvent.click(screen.getByRole('button', { name: 'Error' }));
    fireEvent.click(screen.getByRole('button', { name: 'Warning' }));
    fireEvent.click(screen.getByRole('button', { name: 'Info' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lifecycle' }));

    expect(screen.getByTestId('toast-count')).toBeInTheDocument();
  });

  it('throws when useToastContext is used without the provider', () => {
    expect(() => render(<ContextProbe />)).toThrow('useToast must be used within a ToastProvider');
  });

  it('proxies standalone toast methods when explicit methods are registered', () => {
    const methods: ToastMethods = {
      show: vi.fn(() => 'custom-id'),
      success: vi.fn(() => 'success-id'),
      error: vi.fn(() => 'error-id'),
      warning: vi.fn(() => 'warning-id'),
      info: vi.fn(() => 'info-id'),
      dismiss: vi.fn(),
      dismissAll: vi.fn(),
      update: vi.fn(),
    };

    setToastMethods(methods);

    expect(toast.show({ title: 'Standalone' })).toBe('custom-id');
    expect(toast.success('Saved')).toBe('success-id');
    expect(toast.error('Broken')).toBe('error-id');
    expect(toast.warning('Careful')).toBe('warning-id');
    expect(toast.info('FYI')).toBe('info-id');

    toast.dismiss('custom-id');
    toast.dismissAll();

    expect(methods.show).toHaveBeenCalled();
    expect(methods.success).toHaveBeenCalled();
    expect(methods.error).toHaveBeenCalled();
    expect(methods.warning).toHaveBeenCalled();
    expect(methods.info).toHaveBeenCalled();
    expect(methods.dismiss).toHaveBeenCalledWith('custom-id');
    expect(methods.dismissAll).toHaveBeenCalled();
  });

  it('warns and safely no-ops when standalone toast methods are used without a provider', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(toast.show({ title: 'Missing provider' })).toBeNull();
    expect(toast.success('Saved')).toBeNull();
    expect(toast.error('Broken')).toBeNull();
    expect(toast.warning('Warn')).toBeNull();
    expect(toast.info('Info')).toBeNull();
    expect(() => toast.dismiss('missing')).not.toThrow();
    expect(() => toast.dismissAll()).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('resolves animation helpers and injects styles only once', async () => {
    vi.resetModules();
    const { getAnimationName, getToastAnimationStyle, injectToastStyles } = await import('./utils/animations');

    document.documentElement.style.setProperty('--ds-toast-enter-duration', '180ms');
    document.documentElement.style.setProperty('--ds-toast-exit-duration', '240ms');
    document.documentElement.style.setProperty('--ds-toast-enter-easing', 'linear');
    document.documentElement.style.setProperty('--ds-toast-exit-easing', 'ease-in-out');

    expect(getAnimationName('top-right', 'in')).toBe('toast-slide-in-right');
    expect(getAnimationName('bottom-left', 'out')).toBe('toast-slide-out-left');
    expect(getAnimationName('top-center', 'in')).toBe('toast-slide-in-top');
    expect(getToastAnimationStyle('bottom-center', 'out').animation).toContain('toast-slide-out-bottom 240ms ease-in-out');
    expect(getToastAnimationStyle('top-right', 'in', 'fade').animation).toContain('toast-fade-in 180ms linear');

    injectToastStyles();
    injectToastStyles();

    const styles = document.querySelectorAll('#rottay-toast-animations');
    expect(styles).toHaveLength(1);
  });
});
