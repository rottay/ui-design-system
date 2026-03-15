import React, { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { notification as antNotification } from 'antd';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../core/utils/runtime-logger', () => ({
  warnOnceInDev: vi.fn(),
}));

import { warnOnceInDev } from '../../../../utils/runtime-logger';
import {
  NotificationItem as ClassicNotificationItem,
  notification as classicNotification,
} from './engines/classic';
import {
  NotificationItem as ModernNotificationItem,
  NotificationProvider as ModernNotificationProvider,
  notification as modernNotification,
  useNotification as useModernNotification,
} from './engines/modern';
import {
  NotificationItem as RusticNotificationItem,
  NotificationProvider as RusticNotificationProvider,
  notification as rusticNotification,
  useNotification as useRusticNotification,
} from './engines/rustic';

function ModernHarness({ onReady }: { onReady: (api: ReturnType<typeof useModernNotification>[0]) => void }) {
  const [api] = useModernNotification();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return null;
}

function RusticHarness({ onReady }: { onReady: (api: ReturnType<typeof useRusticNotification>[0]) => void }) {
  const [api] = useRusticNotification();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return null;
}

describe('Notification engine advanced coverage', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('covers the classic static notification api and classic item close flows', () => {
    const successSpy = vi.spyOn(antNotification, 'success').mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(antNotification, 'error').mockImplementation(() => undefined as never);
    const infoSpy = vi.spyOn(antNotification, 'info').mockImplementation(() => undefined as never);
    const warningSpy = vi.spyOn(antNotification, 'warning').mockImplementation(() => undefined as never);
    const openSpy = vi.spyOn(antNotification, 'open').mockImplementation(() => undefined as never);
    const destroySpy = vi.spyOn(antNotification, 'destroy').mockImplementation(() => undefined);

    classicNotification.success({ message: 'Saved', placement: 'bottomLeft' });
    classicNotification.error({ message: 'Failed' });
    classicNotification.info({ message: 'Heads up' });
    classicNotification.warning({ message: 'Careful' });
    classicNotification.open({ message: 'Opened' });
    classicNotification.destroy('saved');
    classicNotification.destroy();

    expect(successSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(warningSpy).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalled();
    expect(destroySpy).toHaveBeenNthCalledWith(1, 'saved');
    expect(destroySpy).toHaveBeenNthCalledWith(2);

    const onRemove = vi.fn();
    const onClose = vi.fn();

    render(
      <ClassicNotificationItem
        id="classic-notification"
        type="open"
        message="Classic notification"
        description="With manual close"
        closable
        duration={0}
        onRemove={onRemove}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onRemove).toHaveBeenCalledWith('classic-notification');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('covers modern provider grouping, direct item behavior, and static warning helpers', async () => {
    let apiRef: ReturnType<typeof useModernNotification>[0] | undefined;

    render(
      <ModernNotificationProvider maxCount={1} placement="topRight" top={12} bottom={20}>
        <ModernHarness onReady={(api) => { apiRef = api; }} />
      </ModernNotificationProvider>
    );

    await waitFor(() => {
      expect(apiRef).toBeDefined();
    });

    act(() => {
      apiRef!.info({ key: 'sync', message: 'Syncing', duration: 0 });
      apiRef!.success({
        key: 'sync',
        message: 'Synced',
        description: 'Everything is current',
        duration: 0,
        placement: 'bottomLeft',
      });
      apiRef!.warning({ message: 'Newest wins', duration: 0 });
    });

    await waitFor(() => {
      expect(screen.queryByText('Synced')).not.toBeInTheDocument();
      expect(screen.getByText('Newest wins')).toBeInTheDocument();
    });

    act(() => {
      apiRef!.destroy();
    });

    await waitFor(() => {
      expect(screen.queryByText('Newest wins')).not.toBeInTheDocument();
    });

    const onRemove = vi.fn();
    const onClose = vi.fn();
    render(
      <ModernNotificationItem
        id="modern-notification"
        type="open"
        message="Direct modern"
        description="Open notification"
        icon={null}
        actions={<button type="button">Resolve</button>}
        closable
        duration={1}
        onRemove={onRemove}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Resolve')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onRemove).toHaveBeenCalledWith('modern-notification');
    expect(onClose).toHaveBeenCalledTimes(1);

    modernNotification.success({ message: 'x' });
    modernNotification.error({ message: 'x' });
    modernNotification.info({ message: 'x' });
    modernNotification.warning({ message: 'x' });
    modernNotification.open({ message: 'x' });
    modernNotification.destroy();

    expect(warnOnceInDev).toHaveBeenCalled();
  });

  it('covers rustic provider placement/destroy-by-key, direct item exit animation, and static warning helpers', async () => {
    let apiRef: ReturnType<typeof useRusticNotification>[0] | undefined;

    render(
      <RusticNotificationProvider maxCount={2} placement="topRight" top={18} bottom={18}>
        <RusticHarness onReady={(api) => { apiRef = api; }} />
      </RusticNotificationProvider>
    );

    await waitFor(() => {
      expect(apiRef).toBeDefined();
    });

    act(() => {
      apiRef!.success({ key: 'first', message: 'First', duration: 0 });
      apiRef!.open({
        key: 'second',
        type: 'open' as any,
        message: 'Second',
        description: 'Pinned',
        placement: 'bottomRight',
        duration: 0,
      } as any);
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

    const onRemove = vi.fn();
    const onClose = vi.fn();
    render(
      <RusticNotificationItem
        id="rustic-notification"
        type="open"
        message="Rustic direct"
        description="Custom close flow"
        closable
        duration={0}
        actions={<button type="button">Undo</button>}
        onRemove={onRemove}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Undo')).toBeInTheDocument();
    vi.useFakeTimers();
    const directAlert = screen.getByText('Rustic direct').closest('[role="alert"]');
    if (!(directAlert instanceof HTMLElement)) {
      throw new Error('Missing rustic direct notification container');
    }

    fireEvent.click(within(directAlert).getByRole('button', { name: 'Close notification' }));
    vi.advanceTimersByTime(240);

    expect(onRemove).toHaveBeenCalledWith('rustic-notification');
    expect(onClose).toHaveBeenCalledTimes(1);

    rusticNotification.success({ message: 'x' });
    rusticNotification.error({ message: 'x' });
    rusticNotification.info({ message: 'x' });
    rusticNotification.warning({ message: 'x' });
    rusticNotification.open({ message: 'x' });
    rusticNotification.destroy();

    expect(warnOnceInDev).toHaveBeenCalled();
  });
});
