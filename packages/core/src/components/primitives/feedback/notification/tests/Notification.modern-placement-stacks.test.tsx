import React, { useEffect, useState } from 'react';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NotificationProvider, useNotification } from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

type ModernApi = ReturnType<typeof useNotification>[0];

const STACK_SELECTOR = '[data-part="stack"][data-variant="notification"]';
const TITLE_PATTERN = /^Notice /;

function createApiHolder() {
  let current: ModernApi | undefined;
  return {
    onReady: (api: ModernApi) => {
      current = api;
    },
    ready: () => current !== undefined,
    api: (): ModernApi => {
      if (!current) throw new Error('Modern notification API is not ready');
      return current;
    },
  };
}

type ApiHolder = ReturnType<typeof createApiHolder>;

function Harness({ onReady }: { onReady: (api: ModernApi) => void }) {
  const [api] = useNotification();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return null;
}

function RerenderingProvider({ holder }: { holder: ApiHolder }) {
  const [top, setTop] = useState(12);
  return (
    <NotificationProvider placement="topRight" top={top} bottom={20} maxCount={10}>
      <Harness onReady={holder.onReady} />
      <button type="button" onClick={() => setTop((value) => value + 1)}>
        Bump top
      </button>
      <span>{`Top ${top}`}</span>
    </NotificationProvider>
  );
}

function stacks(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(STACK_SELECTOR));
}

function placements(): Array<string | null> {
  return stacks().map((stack) => stack.getAttribute('data-placement'));
}

function stackAt(placement: string): HTMLElement {
  const stack = stacks().find((candidate) => candidate.getAttribute('data-placement') === placement);
  if (!stack) throw new Error(`Missing notification stack ${placement}`);
  return stack;
}

function titlesIn(stack: HTMLElement): string[] {
  return within(stack)
    .queryAllByText(TITLE_PATTERN)
    .map((node) => node.textContent ?? '');
}

function offsetOf(stack: HTMLElement): string {
  return stack.style.getPropertyValue('--ds-notifier-stack-offset');
}

async function mountProvider(holder: ApiHolder, maxCount: number) {
  renderWithEngine(
    <NotificationProvider placement="topRight" top={12} bottom={20} maxCount={maxCount}>
      <Harness onReady={holder.onReady} />
    </NotificationProvider>,
    'modern'
  );

  await waitFor(() => {
    expect(holder.ready()).toBe(true);
  });
}

describe('Notification modern placement stacks', () => {
  it('groups entries per placement in first-appearance order and keeps call order inside each stack', async () => {
    const holder = createApiHolder();
    await mountProvider(holder, 10);

    act(() => {
      holder.api().info({ message: 'Notice A', duration: 0 });
      holder.api().success({ message: 'Notice B', duration: 0, placement: 'bottomLeft' });
      holder.api().warning({ message: 'Notice C', duration: 0 });
      holder.api().error({ message: 'Notice D', duration: 0, placement: 'bottom' });
      holder.api().open({ message: 'Notice E', duration: 0, placement: 'topLeft' });
    });

    await waitFor(() => {
      expect(placements()).toEqual(['top-end', 'bottom-start', 'bottom', 'top-start']);
    });

    expect(titlesIn(stackAt('top-end'))).toEqual(['Notice A', 'Notice C']);
    expect(titlesIn(stackAt('bottom-start'))).toEqual(['Notice B']);
    expect(titlesIn(stackAt('bottom'))).toEqual(['Notice D']);
    expect(titlesIn(stackAt('top-start'))).toEqual(['Notice E']);

    expect(stacks().map(offsetOf)).toEqual(['12px', '20px', '20px', '12px']);
  });

  it('a keyed update moves the entry to its new placement stack without duplicating it', async () => {
    const holder = createApiHolder();
    await mountProvider(holder, 10);

    act(() => {
      holder.api().info({ key: 'sync', message: 'Notice Syncing', duration: 0, placement: 'topLeft' });
      holder.api().info({ message: 'Notice F', duration: 0 });
    });

    await waitFor(() => {
      expect(placements()).toEqual(['top-start', 'top-end']);
    });

    act(() => {
      holder.api().success({ key: 'sync', message: 'Notice Moved', duration: 0, placement: 'bottomRight' });
    });

    await waitFor(() => {
      expect(placements()).toEqual(['bottom-end', 'top-end']);
    });

    expect(screen.queryByText('Notice Syncing')).not.toBeInTheDocument();
    expect(screen.getAllByText('Notice Moved')).toHaveLength(1);
    expect(titlesIn(stackAt('bottom-end'))).toEqual(['Notice Moved']);
    expect(titlesIn(stackAt('top-end'))).toEqual(['Notice F']);
  });

  it('destroy by key empties only that stack; destroy() removes every stack', async () => {
    const holder = createApiHolder();
    await mountProvider(holder, 10);

    act(() => {
      holder.api().info({ key: 'a', message: 'Notice Alpha', duration: 0, placement: 'topLeft' });
      holder.api().info({ key: 'b', message: 'Notice Bravo', duration: 0, placement: 'bottom' });
    });

    await waitFor(() => {
      expect(placements()).toEqual(['top-start', 'bottom']);
    });

    act(() => {
      holder.api().destroy('a');
    });

    await waitFor(() => {
      expect(placements()).toEqual(['bottom']);
    });
    expect(screen.queryByText('Notice Alpha')).not.toBeInTheDocument();
    expect(titlesIn(stackAt('bottom'))).toEqual(['Notice Bravo']);

    act(() => {
      holder.api().destroy();
    });

    await waitFor(() => {
      expect(stacks()).toHaveLength(0);
    });
    expect(screen.queryByText('Notice Bravo')).not.toBeInTheDocument();
  });

  it('re-rendering the provider does not accumulate stack members', async () => {
    const holder = createApiHolder();
    renderWithEngine(<RerenderingProvider holder={holder} />, 'modern');

    await waitFor(() => {
      expect(holder.ready()).toBe(true);
    });

    act(() => {
      holder.api().info({ message: 'Notice One', duration: 0, placement: 'bottomLeft' });
      holder.api().info({ message: 'Notice Two', duration: 0, placement: 'bottomLeft' });
    });

    await waitFor(() => {
      expect(placements()).toEqual(['bottom-start']);
    });

    for (let bump = 0; bump < 3; bump += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Bump top' }));
    }

    await waitFor(() => {
      expect(screen.getByText('Top 15')).toBeInTheDocument();
    });

    expect(placements()).toEqual(['bottom-start']);
    expect(titlesIn(stackAt('bottom-start'))).toEqual(['Notice One', 'Notice Two']);
  });

  it('maxCount trims the oldest entry and drops its emptied stack', async () => {
    const holder = createApiHolder();
    await mountProvider(holder, 2);

    act(() => {
      holder.api().info({ message: 'Notice A', duration: 0, placement: 'topLeft' });
      holder.api().info({ message: 'Notice B', duration: 0, placement: 'topRight' });
      holder.api().info({ message: 'Notice C', duration: 0, placement: 'bottom' });
    });

    await waitFor(() => {
      expect(placements()).toEqual(['top-end', 'bottom']);
    });

    expect(screen.queryByText('Notice A')).not.toBeInTheDocument();
    expect(titlesIn(stackAt('top-end'))).toEqual(['Notice B']);
    expect(titlesIn(stackAt('bottom'))).toEqual(['Notice C']);
  });
});
