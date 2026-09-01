import React, { act } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ChartInteraction } from '../../../../foundation/interaction';
import {
  useChartInteraction,
  type ChartInteractionItem,
  type ChartInteractionNavigation,
} from '..';

interface TestDatum {
  readonly id: string;
  readonly value?: number;
}

type TestItem = ChartInteractionItem<TestDatum>;

const HORIZONTAL_ITEMS: readonly TestItem[] = Object.freeze([
  { key: 'series/a]\"', label: 'Alpha', datum: { id: 'a' }, x: 0, y: 20, row: 0, column: 0 },
  { key: 'series/b', label: 'Beta', datum: { id: 'b' }, x: 10, y: 4, row: 0, column: 1 },
  { key: 'series/c', label: 'Gamma', datum: { id: 'c' }, x: 20, y: 12, row: 0, column: 2 },
]);

interface HarnessProps {
  readonly items: readonly TestItem[];
  readonly interaction?: ChartInteraction<TestDatum>;
  readonly navigation?: ChartInteractionNavigation;
}

function Harness({ items, interaction, navigation }: HarnessProps): React.ReactElement {
  const chart = useChartInteraction({ items, interaction, navigation });
  const rootProps = chart.rootProps as unknown as React.SVGProps<SVGSVGElement>;

  return (
    <div
      data-testid="state"
      data-active-key={chart.activeKey ?? ''}
      data-roving-key={chart.rovingKey ?? ''}
      data-focus-key={chart.focusKey ?? ''}
      data-hover-key={chart.hoverKey ?? ''}
      data-pinned-key={chart.pinnedKey ?? ''}
    >
      <svg data-testid="root" aria-label="Test chart" {...rootProps}>
        {items.map((item) => (
          <g
            key={item.key}
            data-testid={`datum-${item.key}`}
            role="img"
            aria-label={item.label}
            {...chart.getDatumProps(item.key)}
          >
            <circle cx={item.x} cy={item.y} r={2} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function datum(key: string): Element {
  return screen.getByTestId(`datum-${key}`);
}

function tabbableData(container: HTMLElement): Element[] {
  return [...container.querySelectorAll('[data-chart-datum-key][tabindex="0"]')];
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('useChartInteraction', () => {
  it('defaults to a static SSR-safe posture with no handlers or tab stops', () => {
    const html = renderToString(<Harness items={HORIZONTAL_ITEMS} />);
    const container = document.createElement('div');
    container.innerHTML = html;

    expect(container.querySelector('[data-testid="root"]'))
      .toHaveAttribute('data-interaction', 'static');
    expect(container.querySelectorAll('[data-chart-datum-key]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-chart-datum-key][tabindex]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-active]')).toHaveLength(0);
  });

  it('uses visual coordinates for one non-wrapping roving tab stop and opaque keys', async () => {
    const items = [HORIZONTAL_ITEMS[2]!, HORIZONTAL_ITEMS[0]!, HORIZONTAL_ITEMS[1]!];
    const { container } = render(
      <Harness items={items} interaction={{ mode: 'explore' }} navigation="horizontal" />,
    );
    const alpha = datum(HORIZONTAL_ITEMS[0]!.key);
    const beta = datum(HORIZONTAL_ITEMS[1]!.key);
    const gamma = datum(HORIZONTAL_ITEMS[2]!.key);

    expect(tabbableData(container)).toEqual([alpha]);

    fireEvent.focus(alpha);
    expect(screen.getByTestId('state')).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[0]!.key);

    fireEvent.keyDown(alpha, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement).toBe(beta));
    expect(tabbableData(container)).toEqual([beta]);

    fireEvent.keyDown(beta, { key: 'End' });
    await waitFor(() => expect(document.activeElement).toBe(gamma));
    expect(tabbableData(container)).toEqual([gamma]);

    fireEvent.keyDown(gamma, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(gamma);
    expect(tabbableData(container)).toEqual([gamma]);

    fireEvent.keyDown(gamma, { key: 'Home' });
    await waitFor(() => expect(document.activeElement).toBe(alpha));
    expect(tabbableData(container)).toEqual([alpha]);

    fireEvent.keyDown(alpha, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(alpha);
    expect(tabbableData(container)).toEqual([alpha]);
  });

  it('navigates a visual grid and invokes keyboard actions with Enter and Space', async () => {
    const action = vi.fn();
    const items: readonly TestItem[] = [
      { key: 'd', label: 'D', datum: { id: 'd' }, x: 10, y: 10, row: 1, column: 1 },
      { key: 'a', label: 'A', datum: { id: 'a' }, x: 0, y: 0, row: 0, column: 0 },
      { key: 'c', label: 'C', datum: { id: 'c' }, x: 0, y: 10, row: 1, column: 0 },
      { key: 'b', label: 'B', datum: { id: 'b' }, x: 10, y: 0, row: 0, column: 1 },
    ];
    render(
      <Harness
        items={items}
        navigation="grid"
        interaction={{
          mode: 'select',
          actionLabel: 'Select datum',
          onAction: action,
        }}
      />,
    );

    const a = datum('a');
    const b = datum('b');
    const d = datum('d');
    fireEvent.focus(a);
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement).toBe(b));
    fireEvent.keyDown(b, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toBe(d));

    fireEvent.keyDown(d, { key: 'Enter' });
    fireEvent.click(d, { detail: 0 });
    fireEvent.keyDown(d, { key: ' ' });
    fireEvent.click(d, { detail: 0 });
    expect(action).toHaveBeenCalledTimes(2);
    expect(action).toHaveBeenNthCalledWith(
      1,
      { key: 'd', label: 'D', datum: { id: 'd' } },
      { input: 'keyboard', reason: 'action' },
    );

    fireEvent.keyDown(d, { key: 'Escape' });
    expect(screen.getByTestId('state')).toHaveAttribute('data-active-key', '');
    expect(screen.getByTestId('state')).toHaveAttribute('data-focus-key', 'd');
  });

  it('accepts assistive-technology clicks and rejects cancelled pointer gestures', () => {
    const action = vi.fn();
    render(
      <Harness
        items={HORIZONTAL_ITEMS}
        interaction={{
          mode: 'select',
          actionLabel: 'Select datum',
          onAction: action,
        }}
      />,
    );
    const alpha = datum(HORIZONTAL_ITEMS[0]!.key);
    const beta = datum(HORIZONTAL_ITEMS[1]!.key);

    fireEvent.click(alpha, { detail: 0 });
    expect(action).toHaveBeenCalledWith(
      { key: HORIZONTAL_ITEMS[0]!.key, label: 'Alpha', datum: { id: 'a' } },
      { input: 'keyboard', reason: 'action' },
    );

    fireEvent.pointerDown(beta, {
      pointerType: 'touch',
      pointerId: 8,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.pointerCancel(beta, { pointerType: 'touch', pointerId: 8 });
    fireEvent.click(beta, { detail: 1 });
    fireEvent.pointerDown(beta, { pointerType: 'mouse', pointerId: 9, button: 2 });
    fireEvent.click(beta, { detail: 1 });
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('keeps focus, hover and pin separate across mouse, touch and pen pointers', async () => {
    const changes = vi.fn();
    render(
      <Harness
        items={HORIZONTAL_ITEMS}
        interaction={{ mode: 'explore', onActiveChange: changes }}
      />,
    );
    const alpha = datum(HORIZONTAL_ITEMS[0]!.key);
    const beta = datum(HORIZONTAL_ITEMS[1]!.key);
    const gamma = datum(HORIZONTAL_ITEMS[2]!.key);
    const state = screen.getByTestId('state');

    fireEvent.pointerOver(alpha, { pointerType: 'mouse' });
    expect(state).toHaveAttribute('data-hover-key', HORIZONTAL_ITEMS[0]!.key);
    expect(state).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[0]!.key);
    expect(changes).toHaveBeenLastCalledWith(
      { key: HORIZONTAL_ITEMS[0]!.key, label: 'Alpha', datum: { id: 'a' } },
      { input: 'pointer', pointerType: 'mouse', reason: 'hover' },
    );

    fireEvent.pointerOut(alpha, { pointerType: 'mouse', relatedTarget: screen.getByTestId('root') });
    expect(state).toHaveAttribute('data-hover-key', '');
    expect(state).toHaveAttribute('data-active-key', '');

    fireEvent.pointerDown(beta, {
      pointerType: 'touch',
      pointerId: 1,
      clientX: 10,
      clientY: 10,
    });
    expect(state).toHaveAttribute('data-pinned-key', '');
    expect(state).toHaveAttribute('data-active-key', '');
    fireEvent.pointerMove(beta, {
      pointerType: 'touch',
      pointerId: 1,
      clientX: 10,
      clientY: 30,
    });
    fireEvent.click(beta, { detail: 1 });
    expect(state).toHaveAttribute('data-pinned-key', '');

    fireEvent.pointerDown(beta, {
      pointerType: 'touch',
      pointerId: 2,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.click(beta, { detail: 1 });
    await waitFor(() => expect(state).toHaveAttribute('data-pinned-key', HORIZONTAL_ITEMS[1]!.key));
    expect(state).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[1]!.key);
    expect(changes).toHaveBeenLastCalledWith(
      { key: HORIZONTAL_ITEMS[1]!.key, label: 'Beta', datum: { id: 'b' } },
      { input: 'pointer', pointerType: 'touch', reason: 'pin' },
    );

    fireEvent.pointerDown(document.body, { pointerType: 'touch', pointerId: 20 });
    await waitFor(() => expect(state).toHaveAttribute('data-pinned-key', ''));
    expect(state).toHaveAttribute('data-active-key', '');

    fireEvent.pointerDown(beta, { pointerType: 'touch', pointerId: 21 });
    fireEvent.click(beta, { detail: 1 });
    await waitFor(() => expect(state).toHaveAttribute('data-pinned-key', HORIZONTAL_ITEMS[1]!.key));

    fireEvent.pointerOver(gamma, { pointerType: 'mouse' });
    expect(state).toHaveAttribute('data-hover-key', HORIZONTAL_ITEMS[2]!.key);
    expect(state).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[1]!.key);

    fireEvent.keyDown(beta, { key: 'Escape' });
    expect(state).toHaveAttribute('data-pinned-key', '');
    expect(state).toHaveAttribute('data-hover-key', '');
    expect(state).toHaveAttribute('data-active-key', '');

    fireEvent.pointerDown(gamma, { pointerType: 'pen', pointerId: 3 });
    fireEvent.click(gamma, { detail: 1 });
    await waitFor(() => expect(state).toHaveAttribute('data-pinned-key', HORIZONTAL_ITEMS[2]!.key));
    expect(changes).toHaveBeenLastCalledWith(
      { key: HORIZONTAL_ITEMS[2]!.key, label: 'Gamma', datum: { id: 'c' } },
      { input: 'pointer', pointerType: 'pen', reason: 'pin' },
    );
  });

  it('reports controlled proposals without mutating the controlled active datum', () => {
    const changes = vi.fn();
    const interaction = (activeKey: string | null): ChartInteraction<TestDatum> => ({
      mode: 'explore',
      activeKey,
      onActiveChange: changes,
    });
    const { rerender } = render(
      <Harness items={HORIZONTAL_ITEMS} interaction={interaction(HORIZONTAL_ITEMS[1]!.key)} />,
    );
    const alpha = datum(HORIZONTAL_ITEMS[0]!.key);
    const state = screen.getByTestId('state');

    expect(state).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[1]!.key);
    fireEvent.pointerOver(alpha, { pointerType: 'mouse' });
    expect(changes).toHaveBeenLastCalledWith(
      { key: HORIZONTAL_ITEMS[0]!.key, label: 'Alpha', datum: { id: 'a' } },
      { input: 'pointer', pointerType: 'mouse', reason: 'hover' },
    );
    expect(state).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[1]!.key);

    rerender(
      <Harness items={HORIZONTAL_ITEMS} interaction={interaction(HORIZONTAL_ITEMS[0]!.key)} />,
    );
    expect(state).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[0]!.key);

    rerender(<Harness items={HORIZONTAL_ITEMS} interaction={interaction(null)} />);
    expect(state).toHaveAttribute('data-active-key', '');
  });

  it('preserves keys across reorder and selects a deterministic neighbor on removal and empty', async () => {
    const changes = vi.fn();
    const interaction: ChartInteraction<TestDatum> = {
      mode: 'explore',
      defaultActiveKey: HORIZONTAL_ITEMS[1]!.key,
      onActiveChange: changes,
    };
    const { container, rerender } = render(
      <Harness items={HORIZONTAL_ITEMS} interaction={interaction} />,
    );
    const state = screen.getByTestId('state');

    expect(state).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[1]!.key);
    expect(tabbableData(container)).toEqual([datum(HORIZONTAL_ITEMS[1]!.key)]);

    const reordered: readonly TestItem[] = [
      { ...HORIZONTAL_ITEMS[2]!, x: 30 },
      { ...HORIZONTAL_ITEMS[0]!, x: 10 },
      { ...HORIZONTAL_ITEMS[1]!, x: 20 },
    ];
    rerender(<Harness items={reordered} interaction={interaction} />);
    expect(state).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[1]!.key);
    expect(tabbableData(container)).toEqual([datum(HORIZONTAL_ITEMS[1]!.key)]);

    const removed: readonly TestItem[] = [reordered[1]!, reordered[0]!];
    rerender(<Harness items={removed} interaction={interaction} />);
    await waitFor(() => {
      expect(state).toHaveAttribute('data-active-key', HORIZONTAL_ITEMS[2]!.key);
      expect(tabbableData(container)).toEqual([datum(HORIZONTAL_ITEMS[2]!.key)]);
    });
    expect(changes).toHaveBeenLastCalledWith(
      { key: HORIZONTAL_ITEMS[2]!.key, label: 'Gamma', datum: { id: 'c' } },
      { input: 'programmatic', reason: 'data-change' },
    );

    rerender(<Harness items={[]} interaction={interaction} />);
    await waitFor(() => {
      expect(state).toHaveAttribute('data-active-key', '');
      expect(state).toHaveAttribute('data-roving-key', '');
      expect(tabbableData(container)).toHaveLength(0);
    });
    expect(changes).toHaveBeenLastCalledWith(
      null,
      { input: 'programmatic', reason: 'data-change' },
    );
  });

  it('hydrates the same interactive tree without client-only state or ids', async () => {
    const interaction: ChartInteraction<TestDatum> = {
      mode: 'explore',
      defaultActiveKey: HORIZONTAL_ITEMS[1]!.key,
    };
    const element = <Harness items={HORIZONTAL_ITEMS} interaction={interaction} />;
    const html = renderToString(element);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;

    expect(tabbableData(container)).toHaveLength(1);
    expect(tabbableData(container)[0]).toHaveAttribute(
      'data-chart-datum-key',
      HORIZONTAL_ITEMS[1]!.key,
    );
    expect(container.querySelector('[data-active="true"]')).toHaveAttribute(
      'data-chart-datum-key',
      HORIZONTAL_ITEMS[1]!.key,
    );

    await act(async () => {
      root = hydrateRoot(container, element);
    });

    expect(tabbableData(container)).toHaveLength(1);
    expect(
      consoleError.mock.calls.some((call) => String(call[0]).toLowerCase().includes('hydration')),
    ).toBe(false);

    await act(async () => root?.unmount());
    container.remove();
  });

  it('rejects duplicate opaque keys and leaves no delegated behavior after unmount', () => {
    expect(() => render(
      <Harness
        items={[
          HORIZONTAL_ITEMS[0]!,
          { ...HORIZONTAL_ITEMS[1]!, key: HORIZONTAL_ITEMS[0]!.key },
        ]}
        interaction={{ mode: 'explore' }}
      />,
    )).toThrow(`[ChartInteraction] Duplicate opaque datum key: ${HORIZONTAL_ITEMS[0]!.key}.`);
    cleanup();

    const changes = vi.fn();
    const { unmount } = render(
      <Harness
        items={HORIZONTAL_ITEMS}
        interaction={{ mode: 'explore', onActiveChange: changes }}
      />,
    );
    const alpha = datum(HORIZONTAL_ITEMS[0]!.key);
    unmount();
    fireEvent.pointerOver(alpha, { pointerType: 'mouse' });
    expect(changes).not.toHaveBeenCalled();
  });
});
