/** A memoized target resolving null on first mount must not pin to window. */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { BackTop } from '../engines/modern';
import { BackTop as FloatButtonBackTop } from '../../float-button/engines/modern';

/** jsdom has no layout: stamp scrollTop and fire the scroll the engine listens for. */
function scrollElementTo(element: HTMLElement, top: number) {
  Object.defineProperty(element, 'scrollTop', {
    configurable: true,
    writable: true,
    value: top,
  });
  fireEvent.scroll(element);
}

function resetWindowScroll() {
  Object.defineProperty(document.documentElement, 'scrollTop', {
    configurable: true,
    writable: true,
    value: 0,
  });
  fireEvent.scroll(window);
}

function LateContainerHarness({
  render: renderTrigger,
}: {
  render: (target: () => Window | HTMLElement) => React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const target = React.useCallback(
    (): Window | HTMLElement => containerRef.current ?? window,
    [],
  );

  return (
    <>
      {renderTrigger(target)}
      <button type="button" onClick={() => setMounted(true)}>
        mount container
      </button>
      {mounted ? <div ref={containerRef} data-testid="scroller" /> : null}
    </>
  );
}

afterEach(() => {
  resetWindowScroll();
});

describe('BackTop modern: late-attaching scroll target', () => {
  it('binds the container that mounts after the trigger, not the window fallback', async () => {
    render(
      <LateContainerHarness
        render={(target) => <BackTop target={target} visibilityHeight={300} />}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Back to top' })).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'mount container' }));
    });

    const scroller = screen.getByTestId('scroller');
    await act(async () => {
      scrollElementTo(scroller, 400);
    });

    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('does not answer to window scroll once a real container is bound', async () => {
    render(
      <LateContainerHarness
        render={(target) => <BackTop target={target} visibilityHeight={300} />}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'mount container' }));
    });

    await act(async () => {
      Object.defineProperty(document.documentElement, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 900,
      });
      fireEvent.scroll(window);
    });

    expect(screen.queryByRole('button', { name: 'Back to top' })).toBeNull();
  });
});

describe('FloatButton.BackTop modern: late-attaching scroll target', () => {
  it('binds the container that mounts after the trigger, not the window fallback', async () => {
    render(
      <LateContainerHarness
        render={(target) => <FloatButtonBackTop target={target} visibilityHeight={300} />}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Back to top' })).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'mount container' }));
    });

    const scroller = screen.getByTestId('scroller');
    await act(async () => {
      scrollElementTo(scroller, 400);
    });

    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });
});
