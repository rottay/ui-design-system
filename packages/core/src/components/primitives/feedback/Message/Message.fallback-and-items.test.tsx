import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  MessageItem as ModernMessageItem,
  MessageProvider as ModernMessageProvider,
  useMessage as useModernMessage,
} from './engines/modern';
import {
  MessageItem as RusticMessageItem,
  MessageProvider as RusticMessageProvider,
  useMessage as useRusticMessage,
} from './engines/rustic';

describe('Message fallback and item coverage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns noop apis outside modern and rustic providers', () => {
    const { result: modernResult } = renderHook(() => useModernMessage());
    const { result: rusticResult } = renderHook(() => useRusticMessage());

    const [modernApi, modernHolder] = modernResult.current;
    const [rusticApi, rusticHolder] = rusticResult.current;

    expect(modernHolder).toBeNull();
    expect(rusticHolder).toBeNull();

    const modernThen = vi.fn();
    const rusticThen = vi.fn();

    modernApi.success('ok').then(modernThen);
    modernApi.error('ok').then(modernThen);
    modernApi.info('ok').then(modernThen);
    modernApi.warning('ok').then(modernThen);
    modernApi.loading('ok').then(modernThen);
    modernApi.open({ content: 'ok' } as any).then(modernThen);
    modernApi.destroy();

    rusticApi.success('ok').then(rusticThen);
    rusticApi.error('ok').then(rusticThen);
    rusticApi.info('ok').then(rusticThen);
    rusticApi.warning('ok').then(rusticThen);
    rusticApi.loading('ok').then(rusticThen);
    rusticApi.open({ content: 'ok' } as any).then(rusticThen);
    rusticApi.destroy();

    expect(modernThen).not.toHaveBeenCalled();
    expect(rusticThen).not.toHaveBeenCalled();
  });

  it('covers modern message item custom icon, timerless close, and provider placement branches', () => {
    const onRemove = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <>
        <ModernMessageProvider placement="bottom" top={18}>
          <div>provider child</div>
        </ModernMessageProvider>
        <ModernMessageItem
          id="modern-message"
          type="warning"
          content="Modern warning"
          duration={0}
          closable
          icon={<span data-testid="modern-custom-icon">!</span>}
          closeIcon={<span data-testid="modern-close-icon">x</span>}
          onRemove={onRemove}
          onClose={onClose}
        />
      </>
    );

    expect(screen.getByText('provider child')).toBeInTheDocument();
    expect(container.querySelector('.toast-bottom')).not.toBeNull();
    expect(screen.getByTestId('modern-custom-icon')).toBeInTheDocument();
    expect(screen.getByTestId('modern-close-icon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onRemove).toHaveBeenCalledWith('modern-message');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('covers rustic style injection, timerless close animation, hover color handlers, and loading icon branch', () => {
    vi.useFakeTimers();

    const onRemove = vi.fn();
    const onClose = vi.fn();

    render(
      <>
        <RusticMessageProvider placement="bottom" top={24}>
          <div>provider child</div>
        </RusticMessageProvider>
        <RusticMessageProvider placement="bottom" top={24}>
          <div>provider child 2</div>
        </RusticMessageProvider>
        <RusticMessageItem
          id="rustic-message"
          type="loading"
          content="Rustic loading"
          duration={0}
          closable
          onRemove={onRemove}
          onClose={onClose}
        />
      </>
    );

    expect(document.head.querySelectorAll('#rustic-message-styles')).toHaveLength(1);
    expect(screen.getAllByRole('log')).toHaveLength(2);

    const closeButton = screen.getByRole('button', { name: 'Close message' });
    fireEvent.mouseEnter(closeButton);
    fireEvent.mouseLeave(closeButton);

    act(() => {
      fireEvent.click(closeButton);
      vi.advanceTimersByTime(220);
    });

    expect(onRemove).toHaveBeenCalledWith('rustic-message');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
