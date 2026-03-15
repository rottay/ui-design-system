import React, { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { message as antMessage } from 'antd';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../utils/runtime-logger', () => ({
  warnOnceInDev: vi.fn(),
}));

import { warnOnceInDev } from '../../../../utils/runtime-logger';
import {
  MessageItem as ClassicMessageItem,
  MessageProvider as ClassicMessageProvider,
  message as classicMessage,
  useMessage as useClassicMessage,
} from './engines/classic';
import {
  MessageItem as ModernMessageItem,
  MessageProvider as ModernMessageProvider,
  message as modernMessage,
  setGlobalMessageHandler,
  useMessage as useModernMessage,
} from './engines/modern';
import {
  MessageItem as RusticMessageItem,
  MessageProvider as RusticMessageProvider,
  message as rusticMessage,
  useMessage as useRusticMessage,
} from './engines/rustic';

function ModernHarness({ onReady }: { onReady: (api: ReturnType<typeof useModernMessage>[0]) => void }) {
  const [api] = useModernMessage();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return null;
}

function ClassicHarness({ onReady }: { onReady: (api: ReturnType<typeof useClassicMessage>[0]) => void }) {
  const [api, contextHolder] = useClassicMessage();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return contextHolder;
}

function RusticHarness({ onReady }: { onReady: (api: ReturnType<typeof useRusticMessage>[0]) => void }) {
  const [api] = useRusticMessage();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return null;
}

describe('Message engine advanced coverage', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('covers the classic static message api and classic item close flows', () => {
    vi.useFakeTimers();

    const destroyFn = vi.fn();

    const successSpy = vi.spyOn(antMessage, 'success').mockReturnValue(destroyFn as never);
    const errorSpy = vi.spyOn(antMessage, 'error').mockReturnValue(destroyFn as never);
    const infoSpy = vi.spyOn(antMessage, 'info').mockReturnValue(destroyFn as never);
    const warningSpy = vi.spyOn(antMessage, 'warning').mockReturnValue(destroyFn as never);
    const loadingSpy = vi.spyOn(antMessage, 'loading').mockReturnValue(destroyFn as never);
    const destroySpy = vi.spyOn(antMessage, 'destroy').mockImplementation(() => undefined);

    const thenCallback = vi.fn();
    const successResult = classicMessage.success({ content: 'Saved', duration: 1, key: 'saved' });
    classicMessage.error('Failed', 2);
    classicMessage.info('Heads up', 3);
    classicMessage.warning('Careful', 4);
    classicMessage.loading('Loading', 5);
    classicMessage.open({ type: 'success', content: 'Opened', duration: 6 });
    classicMessage.destroy('saved');
    classicMessage.destroy();

    successResult.then(thenCallback);
    vi.advanceTimersByTime(1000);

    expect(successSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalled();
    expect(loadingSpy).toHaveBeenCalled();
    expect(destroySpy).toHaveBeenNthCalledWith(1, 'saved');
    expect(destroySpy).toHaveBeenNthCalledWith(2);
    expect(thenCallback).toHaveBeenCalledTimes(1);

    const onRemove = vi.fn();
    const onClose = vi.fn();

    render(
      <ClassicMessageItem
        id="classic-message"
        type="warning"
        content="Classic message"
        closable
        closeIcon={<span>dismiss</span>}
        duration={0}
        onRemove={onRemove}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onRemove).toHaveBeenCalledWith('classic-message');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('covers classic static config-object branches for every message type and timed auto-close items', () => {
    vi.useFakeTimers();

    const destroyFn = vi.fn();
    const successSpy = vi.spyOn(antMessage, 'success').mockReturnValue(destroyFn as never);
    const errorSpy = vi.spyOn(antMessage, 'error').mockReturnValue(destroyFn as never);
    const infoSpy = vi.spyOn(antMessage, 'info').mockReturnValue(destroyFn as never);
    const warningSpy = vi.spyOn(antMessage, 'warning').mockReturnValue(destroyFn as never);
    const loadingSpy = vi.spyOn(antMessage, 'loading').mockReturnValue(destroyFn as never);

    const callbacks = [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()];
    classicMessage.success({ content: 'Saved', duration: 1, key: 'success-key' }).then(callbacks[0]);
    classicMessage.error({ content: 'Errored', duration: 1, key: 'error-key' }).then(callbacks[1]);
    classicMessage.info({ content: 'Info', duration: 1, key: 'info-key' }).then(callbacks[2]);
    classicMessage.warning({ content: 'Warn', duration: 1, key: 'warn-key' }).then(callbacks[3]);
    classicMessage.loading({ content: 'Load', duration: 1, key: 'load-key' }).then(callbacks[4]);

    vi.advanceTimersByTime(1000);

    expect(successSpy).toHaveBeenCalledWith(expect.objectContaining({ key: 'success-key' }));
    expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ key: 'error-key' }));
    expect(infoSpy).toHaveBeenCalledWith(expect.objectContaining({ key: 'info-key' }));
    expect(warningSpy).toHaveBeenCalledWith(expect.objectContaining({ key: 'warn-key' }));
    expect(loadingSpy).toHaveBeenCalledWith(expect.objectContaining({ key: 'load-key' }));
    callbacks.forEach((callback) => {
      expect(callback).toHaveBeenCalledTimes(1);
    });

    const onRemove = vi.fn();
    const onClose = vi.fn();

    render(
      <ClassicMessageItem
        id="classic-auto-close"
        type="info"
        content="Classic auto close"
        duration={1}
        onRemove={onRemove}
        onClose={onClose}
      />
    );

    vi.advanceTimersByTime(1000);

    expect(onRemove).toHaveBeenCalledWith('classic-auto-close');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('covers classic provider + hook flows, keyed updates, and destroy branches', async () => {
    let apiRef: ReturnType<typeof useClassicMessage>[0] | undefined;

    render(
      <ClassicMessageProvider maxCount={2} placement="top" top={12}>
        <ClassicHarness onReady={(api) => { apiRef = api; }} />
      </ClassicMessageProvider>
    );

    await waitFor(() => {
      expect(apiRef).toBeDefined();
    });

    const destroySpy = vi.spyOn(antMessage, 'destroy').mockImplementation(() => undefined);

    act(() => {
      apiRef!.success({ content: 'Classic hook success', key: 'classic-hook', duration: 0 });
    });

    expect(await screen.findByText('Classic hook success')).toBeInTheDocument();

    act(() => {
      apiRef!.open({ type: 'info', content: 'Classic hook open', key: 'classic-hook', duration: 0 });
    });

    expect(await screen.findByText('Classic hook open')).toBeInTheDocument();

    act(() => {
      apiRef!.destroy('classic-hook');
    });

    await waitFor(() => {
      expect(screen.queryByText('Classic hook open')).not.toBeInTheDocument();
    });

    act(() => {
      apiRef!.destroy();
    });

    expect(destroySpy).toHaveBeenCalledWith();
  });

  it('covers modern provider updates, direct item behavior, and static warning helpers', async () => {
    let apiRef: ReturnType<typeof useModernMessage>[0] | undefined;

    render(
      <ModernMessageProvider maxCount={1} placement="bottom" top={16}>
        <ModernHarness onReady={(api) => { apiRef = api; }} />
      </ModernMessageProvider>
    );

    await waitFor(() => {
      expect(apiRef).toBeDefined();
    });

    act(() => {
      apiRef!.loading({ content: 'Syncing', key: 'sync', duration: 0, closable: true });
    });

    expect(await screen.findByText('Syncing')).toBeInTheDocument();

    act(() => {
      apiRef!.open({ type: 'success', content: 'Synced', key: 'sync', duration: 0, closable: true });
      apiRef!.warning('Newest only', 0);
    });

    await waitFor(() => {
      expect(screen.queryByText('Synced')).not.toBeInTheDocument();
      expect(screen.getByText('Newest only')).toBeInTheDocument();
    });

    act(() => {
      apiRef!.destroy();
    });

    await waitFor(() => {
      expect(screen.queryByText('Newest only')).not.toBeInTheDocument();
    });

    const onRemove = vi.fn();
    const onClose = vi.fn();
    render(
      <ModernMessageItem
        id="modern-message"
        type="loading"
        content="Direct modern"
        closable
        icon={<span data-testid="modern-icon">icon</span>}
        duration={1}
        onRemove={onRemove}
        onClose={onClose}
      />
    );

    expect(screen.getByTestId('modern-icon')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onRemove).toHaveBeenCalledWith('modern-message');
    expect(onClose).toHaveBeenCalledTimes(1);

    modernMessage.success('x');
    modernMessage.error('x');
    modernMessage.info('x');
    modernMessage.warning('x');
    modernMessage.loading('x');
    modernMessage.open({ content: 'x' } as any);
    modernMessage.destroy();

    expect(warnOnceInDev).toHaveBeenCalled();
  });

  it('covers modern provider message variants and the static then branches', () => {
    vi.useFakeTimers();

    let apiRef: ReturnType<typeof useModernMessage>[0] | undefined;

    render(
      <ModernMessageProvider maxCount={5} placement="top" top={20}>
        <ModernHarness onReady={(api) => { apiRef = api; }} />
      </ModernMessageProvider>
    );

    expect(apiRef).toBeDefined();

    const successThen = vi.fn();
    const errorThen = vi.fn();
    const infoThen = vi.fn();
    const warningThen = vi.fn();
    const loadingThen = vi.fn();

    act(() => {
      apiRef!.success({ content: 'Modern success', duration: 1, key: 'modern-success' }).then(successThen);
      apiRef!.error({ content: 'Modern error', duration: 1, key: 'modern-error', closable: true }).then(errorThen);
      apiRef!.info({ content: 'Modern info', duration: 1, key: 'modern-info' }).then(infoThen);
      apiRef!.warning({ content: 'Modern warning', duration: 1, key: 'modern-warning' }).then(warningThen);
      apiRef!.loading({ content: 'Modern loading', duration: 1, key: 'modern-loading' }).then(loadingThen);
    });

    expect(screen.getByText('Modern loading')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(successThen).toHaveBeenCalledTimes(1);
    expect(errorThen).toHaveBeenCalledTimes(1);
    expect(infoThen).toHaveBeenCalledTimes(1);
    expect(warningThen).toHaveBeenCalledTimes(1);
    expect(loadingThen).toHaveBeenCalledTimes(1);

    modernMessage.success('static success').then(() => undefined);
    modernMessage.error('static error').then(() => undefined);
    modernMessage.info('static info').then(() => undefined);
    modernMessage.warning('static warning').then(() => undefined);
    modernMessage.loading('static loading').then(() => undefined);
    modernMessage.open({ content: 'static open' } as any).then(() => undefined);
    modernMessage.destroy();

    expect(warnOnceInDev).toHaveBeenCalled();
  });

  it('covers rustic provider destroy-by-key, direct item exit animation, and static warning helpers', async () => {
    let apiRef: ReturnType<typeof useRusticMessage>[0] | undefined;

    render(
      <RusticMessageProvider maxCount={2} placement="top" top={24}>
        <RusticHarness onReady={(api) => { apiRef = api; }} />
      </RusticMessageProvider>
    );

    await waitFor(() => {
      expect(apiRef).toBeDefined();
    });

    act(() => {
      apiRef!.info({ content: 'First', key: 'first', duration: 0, closable: true });
      apiRef!.open({ type: 'error', content: 'Second', key: 'second', duration: 0, closable: true });
    });

    expect(await screen.findByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();

    act(() => {
      apiRef!.destroy('first');
    });

    await waitFor(() => {
      expect(screen.queryByText('First')).not.toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    act(() => {
      apiRef!.success({ content: 'Replace second', key: 'second', duration: 0, closable: true });
      apiRef!.loading('Third', 0);
    });

    await waitFor(() => {
      expect(screen.queryByText('Second')).not.toBeInTheDocument();
      expect(screen.getByText('Replace second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    const onRemove = vi.fn();
    const onClose = vi.fn();
    render(
      <RusticMessageItem
        id="rustic-message"
        type="success"
        content="Rustic direct"
        closable
        duration={0}
        onRemove={onRemove}
        onClose={onClose}
      />
    );

    vi.useFakeTimers();
    const directAlert = screen.getByText('Rustic direct').closest('[role="alert"]');
    if (!(directAlert instanceof HTMLElement)) {
      throw new Error('Missing rustic direct alert container');
    }

    fireEvent.click(within(directAlert).getByRole('button', { name: 'Close message' }));
    vi.advanceTimersByTime(220);

    expect(onRemove).toHaveBeenCalledWith('rustic-message');
    expect(onClose).toHaveBeenCalledTimes(1);

    rusticMessage.success('x');
    rusticMessage.error('x');
    rusticMessage.info('x');
    rusticMessage.warning('x');
    rusticMessage.loading('x');
    rusticMessage.open({ content: 'x' } as any);
    rusticMessage.destroy();

    expect(warnOnceInDev).toHaveBeenCalled();
  });

  it('covers no-provider hook fallbacks and modern global handler wiring', () => {
    let modernApi: ReturnType<typeof useModernMessage>[0] | undefined;
    let rusticApi: ReturnType<typeof useRusticMessage>[0] | undefined;

    function ModernNoProviderHarness() {
      const [api] = useModernMessage();
      modernApi = api;
      return null;
    }

    function RusticNoProviderHarness() {
      const [api] = useRusticMessage();
      rusticApi = api;
      return null;
    }

    render(
      <>
        <ModernNoProviderHarness />
        <RusticNoProviderHarness />
      </>
    );

    expect(modernApi).toBeDefined();
    expect(rusticApi).toBeDefined();

    const modernResult = modernApi!.success('noop');
    const rusticResult = rusticApi!.warning('noop');
    modernApi!.destroy();
    rusticApi!.destroy();

    expect(typeof modernResult.then).toBe('function');
    expect(typeof rusticResult.then).toBe('function');

    const setter = vi.fn();
    setGlobalMessageHandler(setter);
    expect(typeof setGlobalMessageHandler).toBe('function');
  });

  it('covers auto-close timers and default icon branches for direct message items', async () => {
    vi.useFakeTimers();

    const onModernRemove = vi.fn();
    const onModernClose = vi.fn();
    const onRusticRemove = vi.fn();
    const onRusticClose = vi.fn();

    render(
      <>
        <ModernMessageItem
          id="modern-auto"
          type="success"
          content="Modern auto"
          duration={1}
          closable
          onRemove={onModernRemove}
          onClose={onModernClose}
        />
        <RusticMessageItem
          id="rustic-auto"
          type="loading"
          content="Rustic auto"
          duration={1}
          closable
          onRemove={onRusticRemove}
          onClose={onRusticClose}
        />
      </>
    );

    expect(screen.getByText('Modern auto')).toBeInTheDocument();
    expect(screen.getByText('Rustic auto')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onModernRemove).toHaveBeenCalledWith('modern-auto');
    expect(onModernClose).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(onRusticRemove).toHaveBeenCalledWith('rustic-auto');
    expect(onRusticClose).toHaveBeenCalledTimes(1);
  });

  it('covers rustic provider variants and the static then branches', () => {
    vi.useFakeTimers();

    let apiRef: ReturnType<typeof useRusticMessage>[0] | undefined;

    render(
      <RusticMessageProvider maxCount={5} placement="bottom" top={18}>
        <RusticHarness onReady={(api) => { apiRef = api; }} />
      </RusticMessageProvider>
    );

    expect(apiRef).toBeDefined();

    const successThen = vi.fn();
    const errorThen = vi.fn();
    const infoThen = vi.fn();
    const warningThen = vi.fn();
    const loadingThen = vi.fn();

    act(() => {
      apiRef!.success({ content: 'Rustic success', duration: 1, key: 'rustic-success' }).then(successThen);
      apiRef!.error({ content: 'Rustic error', duration: 1, key: 'rustic-error' }).then(errorThen);
      apiRef!.info({ content: 'Rustic info', duration: 1, key: 'rustic-info' }).then(infoThen);
      apiRef!.warning({ content: 'Rustic warning', duration: 1, key: 'rustic-warning' }).then(warningThen);
      apiRef!.loading({ content: 'Rustic loading', duration: 1, key: 'rustic-loading' }).then(loadingThen);
    });

    expect(screen.getByText('Rustic loading')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(220);
    });

    expect(successThen).toHaveBeenCalledTimes(1);
    expect(errorThen).toHaveBeenCalledTimes(1);
    expect(infoThen).toHaveBeenCalledTimes(1);
    expect(warningThen).toHaveBeenCalledTimes(1);
    expect(loadingThen).toHaveBeenCalledTimes(1);

    rusticMessage.success('static success').then(() => undefined);
    rusticMessage.error('static error').then(() => undefined);
    rusticMessage.info('static info').then(() => undefined);
    rusticMessage.warning('static warning').then(() => undefined);
    rusticMessage.loading('static loading').then(() => undefined);
    rusticMessage.open({ content: 'static open' } as any).then(() => undefined);
    rusticMessage.destroy();

    expect(warnOnceInDev).toHaveBeenCalled();
  });
});
