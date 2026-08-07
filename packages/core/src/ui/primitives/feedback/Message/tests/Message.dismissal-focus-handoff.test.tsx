// Dismissing the focused card removes the control the user just activated: focus goes
// to the next surviving dismiss control, or back outside once the stack empties.

import React from 'react';
import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

import { MessageProvider, useMessage } from '../engines/modern';

function Harness() {
  const [api] = useMessage();
  return (
    <button
      type="button"
      data-testid="invoker"
      onClick={() => {
        api.info({ content: 'First', duration: 0, closable: true, key: 'first' });
        api.info({ content: 'Second', duration: 0, closable: true, key: 'second' });
      }}
    >
      Notify
    </button>
  );
}

const renderStack = () =>
  render(
    <MessageProvider>
      <Harness />
    </MessageProvider>,
  );

const closers = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-part="close-button"]')) as HTMLElement[];

/** The exit is animation-gated; in a styleless test env the governed window is 0ms. */
const flushExit = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

describe('Message modern dismissal focus handoff', () => {
  it('moves focus to the next surviving dismiss control', async () => {
    const { container, getByTestId } = renderStack();
    fireEvent.click(getByTestId('invoker'));
    expect(closers(container)).toHaveLength(2);

    act(() => {
      closers(container)[0].focus();
    });
    fireEvent.click(closers(container)[0]);
    await flushExit();

    await waitFor(() => expect(closers(container)).toHaveLength(1));
    expect(document.activeElement).toBe(closers(container)[0]);
  });

  it('hands focus back outside the stack once the last message goes', async () => {
    const { container, getByTestId } = renderStack();
    const invoker = getByTestId('invoker') as HTMLElement;

    act(() => {
      invoker.focus();
    });
    fireEvent.click(invoker);

    // Tabbing into the stack: React's onFocus carries the outside origin.
    act(() => {
      closers(container)[0].focus();
      fireEvent.focus(closers(container)[0], { relatedTarget: invoker });
    });

    fireEvent.click(closers(container)[0]);
    await flushExit();
    await waitFor(() => expect(closers(container)).toHaveLength(1));

    fireEvent.click(closers(container)[0]);
    await flushExit();
    await waitFor(() => expect(closers(container)).toHaveLength(0));

    expect(document.activeElement).toBe(invoker);
  });

  it('leaves focus alone when an unfocused message is dismissed', async () => {
    const { container, getByTestId } = renderStack();
    fireEvent.click(getByTestId('invoker'));

    const initial = closers(container);
    const keptFocused = initial[1];
    act(() => {
      keptFocused.focus();
    });

    // Dismiss the OTHER card; the focused one is untouched.
    fireEvent.click(initial[0]);
    await flushExit();
    await waitFor(() => expect(closers(container)).toHaveLength(1));

    expect(document.activeElement).toBe(keptFocused);
  });
});
