/**
 * F-20: the request's viewport reaches the first paint, and the server and the
 * browser agree about what that paint was.
 *
 * The provider used to seed its snapshot from `useState` and correct it in a
 * passive effect, so the first committed render was a phone on every device and
 * on every server. `<Modal adaptiveFullscreen>` therefore opened fullscreen on a
 * desktop and snapped out of it a frame later.
 *
 * WHAT THIS FILE ASSERTS, STATED EXPLICITLY. Two things, and not a third:
 *
 *  1. THE PUBLISHED SNAPSHOT. `renderToString` on a machine with no browser
 *     globals at all, then `hydrateRoot` over that exact server markup in a
 *     document. The two must publish the same snapshot, which React reports for
 *     us: a disagreement is an `onRecoverableError` and a thrown-away tree.
 *     This is the leg that a happy-dom document populated after the fact cannot
 *     give, because such a "server" render can read `document` and a real one
 *     cannot -- which is precisely how the defect below hid.
 *
 *  2. THE FIRST COMMITTED RENDER, and no correcting frame after it. The modern
 *     Modal renders its dialog through a Portal, which resolves its container
 *     in an effect, so NO server render of any kind emits the dialog:
 *     `renderToString` of an open Modal yields its inline anchor and nothing
 *     else. There is no server dialog to assert on. The replacement criterion
 *     is the complete SEQUENCE of values `data-adaptive-fullscreen` ever holds,
 *     recorded from before the surface exists: a first paint that had to be
 *     corrected shows up as a second entry in that sequence.
 *
 * WHAT IT DOES NOT ASSERT. Browser layout. No relayout/paint measurement is
 * available to this runner, and none is claimed here; that leg belongs to a
 * Playwright run and is an open obligation, not something this file covers.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

import ModernModal from '@/components/primitives/feedback/modal/engines/modern';

import { ResponsiveProvider } from '..';
import { usePhoneBreakpoint } from '../phone-state';
import { resetResponsiveMediaStore } from '../../../../runtime/media-snapshot';

/** A `matchMedia` that answers for one fixed viewport width. */
function viewportMock(width: number) {
  return vi.fn((query: string) => {
    const min = /\(min-width:\s*(\d+)px\)/.exec(query);
    const max = /\(max-width:\s*(\d+)px\)/.exec(query);
    const matches =
      query.includes('pointer: coarse')
        ? width < 640
        : (min ? width >= Number(min[1]) : true) && (max ? width <= Number(max[1]) : true);
    return {
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    } as unknown as MediaQueryList;
  });
}

function withViewport(width: number, run: () => void): void {
  const original = window.matchMedia;
  window.matchMedia = viewportMock(width) as unknown as typeof window.matchMedia;
  resetResponsiveMediaStore();
  try {
    run();
  } finally {
    window.matchMedia = original;
    resetResponsiveMediaStore();
  }
}

const FULLSCREEN_ATTRIBUTE = 'data-adaptive-fullscreen';

/**
 * Every value `data-adaptive-fullscreen` holds, in order, from before the Modal
 * renders until `stop()`.
 *
 * The first entry is the value the surface carried on the render that created
 * it -- the first committed render. A second entry is a correcting frame.
 *
 * IT REPLAYS THE BATCH; IT DOES NOT READ THE DOM. Records arrive together,
 * after every write in them has landed, so asking each target what it carries
 * NOW answers with the settled value for all of them and reports a one-entry
 * sequence for a surface that committed fullscreen and corrected itself a
 * layout effect later -- exactly the history this file exists to forbid, read
 * back as a pass. `attributeOldValue` is what makes the intermediate states
 * recoverable: a record's own `oldValue` is the value before it, and the value
 * AFTER it is the `oldValue` of the next record naming the same attribute on
 * the same element, or -- for the last one -- what the element carries now. The
 * same reconstruction the retained scope watch performs, for the same reason.
 */
function recordAdaptiveFullscreen(): { stop: () => string[] } {
  const seen: string[] = [];
  const push = (value: string | null): void => {
    if (value !== null && seen[seen.length - 1] !== value) seen.push(value);
  };
  const judge = (records: MutationRecord[]): void => {
    /** What `target` carried once every write at or before `index` had landed. */
    const settledAfter = (target: Element, index: number): string | null => {
      for (let later = index + 1; later < records.length; later += 1) {
        const record = records[later];
        if (record.type === 'attributes' && record.target === target) {
          return record.oldValue;
        }
      }
      return target.getAttribute(FULLSCREEN_ATTRIBUTE);
    };
    records.forEach((record, index) => {
      if (record.type === 'attributes') {
        const target = record.target as Element;
        push(record.oldValue);
        push(settledAfter(target, index));
        return;
      }
      for (const node of Array.from(record.addedNodes)) {
        if (node.nodeType !== 1) continue;
        const element = node as Element;
        const carriers = [
          ...(element.hasAttribute(FULLSCREEN_ATTRIBUTE) ? [element] : []),
          ...Array.from(element.querySelectorAll(`[${FULLSCREEN_ATTRIBUTE}]`)),
        ];
        // The value it was CREATED with, not the value it ended up with: a
        // node inserted fullscreen and corrected in the same batch has to show
        // both, in that order.
        for (const carrier of carriers) push(settledAfter(carrier, index));
      }
    });
  };
  const observer = new MutationObserver(judge);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [FULLSCREEN_ATTRIBUTE],
  });
  return {
    // Records are delivered in a microtask and `render()` returns on the same
    // task, so the pending batch is taken on the caller's stack rather than
    // waited for -- the same reason the retention watch drains its own.
    stop: () => {
      judge(observer.takeRecords());
      observer.disconnect();
      return [...seen];
    },
  };
}

function PhoneProbe(): React.ReactElement {
  return <output data-testid="is-phone">{String(usePhoneBreakpoint())}</output>;
}

/**
 * Render the tree the way a real server does: with no browser globals in scope
 * at all, on a module graph loaded in that world.
 *
 * The module registry is reset for the leg, so every `typeof document` guard in
 * the graph evaluates the way it does in a Node process. Restoring the globals
 * afterwards leaves the suite exactly as it found it.
 */
async function renderOnRealServer(ssrViewport?: 'phone' | 'tablet' | 'desktop'): Promise<string> {
  const savedWindow = globalThis.window;
  const savedDocument = globalThis.document;
  const savedMatchMedia = globalThis.matchMedia;
  // @ts-expect-error deliberately simulating a server: there is no window there
  delete globalThis.window;
  // @ts-expect-error ... and no document either
  delete globalThis.document;
  // @ts-expect-error ... and nothing to query media with
  delete globalThis.matchMedia;
  vi.resetModules();
  try {
    expect(typeof document).toBe('undefined');
    const React_ = (await import('react')).default;
    const { renderToString: renderToStringFresh } = await import('react-dom/server');
    const { ResponsiveProvider: Provider } = await import('..');
    const { usePhoneBreakpoint: useIsPhone } = await import('../phone-state');
    const Probe = (): React.ReactElement =>
      React_.createElement('output', { id: 'probe' }, String(useIsPhone()));
    return renderToStringFresh(
      React_.createElement(Provider, {
        ...(ssrViewport ? { ssrViewport } : {}),
        children: React_.createElement(Probe),
      }),
    );
  } finally {
    globalThis.window = savedWindow;
    globalThis.document = savedDocument;
    globalThis.matchMedia = savedMatchMedia;
    vi.resetModules();
  }
}

interface HydrationOutcome {
  readonly recoverableErrors: readonly string[];
  readonly hydratedText: string;
  readonly textSequence: readonly string[];
}

/** Hydrate the EXACT server markup, in a document, and report what React saw. */
async function hydrateServerMarkup(
  serverHtml: string,
  ssrViewport: 'phone' | 'tablet' | 'desktop' | undefined,
  viewportWidth: number,
): Promise<HydrationOutcome> {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = viewportMock(viewportWidth) as unknown as typeof window.matchMedia;
  vi.resetModules();
  const container = document.createElement('div');
  container.innerHTML = serverHtml;
  document.body.appendChild(container);

  const textSequence: string[] = [];
  const probe = container.querySelector('#probe') as Element;
  const record = (): void => {
    const text = probe.textContent ?? '';
    if (textSequence[textSequence.length - 1] !== text) textSequence.push(text);
  };
  record();
  const observer = new MutationObserver(record);
  observer.observe(container, { subtree: true, characterData: true, childList: true });

  try {
    const reactModule = await import('react');
    const React_ = reactModule.default;
    const act = reactModule.act;
    const { hydrateRoot } = await import('react-dom/client');
    const { ResponsiveProvider: Provider } = await import('..');
    const { usePhoneBreakpoint: useIsPhone } = await import('../phone-state');
    const { resetResponsiveMediaStore: reset } = await import(
      '../../../../runtime/media-snapshot'
    );
    reset();

    const recoverableErrors: string[] = [];
    const Probe = (): React.ReactElement =>
      React_.createElement('output', { id: 'probe' }, String(useIsPhone()));
    let root: { unmount: () => void } | undefined;
    act(() => {
      root = hydrateRoot(
        container,
        React_.createElement(Provider, {
          ...(ssrViewport ? { ssrViewport } : {}),
          children: React_.createElement(Probe),
        }),
        { onRecoverableError: (error: unknown) => recoverableErrors.push(String(error)) },
      );
    });
    observer.takeRecords().forEach(record);
    const hydratedText = (container.querySelector('#probe')?.textContent ?? '');
    act(() => {
      root?.unmount();
    });
    reset();
    return { recoverableErrors, hydratedText, textSequence };
  } finally {
    observer.disconnect();
    container.remove();
    window.matchMedia = originalMatchMedia;
    vi.resetModules();
  }
}

afterEach(() => {
  cleanup();
  resetResponsiveMediaStore();
  document.documentElement.removeAttribute('data-ds-viewport');
});

describe('the request viewport reaches the server snapshot', () => {
  it('renders a desktop request as a desktop, not as a phone', () => {
    const html = renderToString(
      <ResponsiveProvider ssrViewport="desktop">
        <PhoneProbe />
      </ResponsiveProvider>,
    );

    expect(html).toContain('>false<');
  });

  it('still renders a request that declared nothing mobile-first', () => {
    const html = renderToString(
      <ResponsiveProvider>
        <PhoneProbe />
      </ResponsiveProvider>,
    );

    // The design system does not invent a viewport it was never told about.
    expect(html).toContain('>true<');
  });

  it('ignores the projected attribute: the hint is a prop, not a document read', () => {
    // `mountTenantTheme` stamps this for CSS. Reading it back here would answer
    // `undefined` on a real server and `desktop` while hydrating, which is a
    // hydration mismatch by construction -- the exact defect this file fences.
    document.documentElement.setAttribute('data-ds-viewport', 'desktop');

    const html = renderToString(
      <ResponsiveProvider>
        <PhoneProbe />
      </ResponsiveProvider>,
    );

    expect(html).toContain('>true<');
  });
});

describe('server and hydration publish the same snapshot', () => {
  it('agrees on a desktop request, with no recoverable error', async () => {
    const serverHtml = await renderOnRealServer('desktop');
    expect(serverHtml).toContain('>false<');

    const outcome = await hydrateServerMarkup(serverHtml, 'desktop', 1440);

    expect(outcome.recoverableErrors).toEqual([]);
    expect(outcome.hydratedText).toBe('false');
    expect(outcome.textSequence).toEqual(['false']);
  });

  it('agrees on a request that declared nothing, with no recoverable error', async () => {
    const serverHtml = await renderOnRealServer(undefined);
    expect(serverHtml).toContain('>true<');

    // The document ALSO carries the attribute a mount would have projected. A
    // provider that read it would answer `desktop` here and `phone` on the
    // server above: this is the reproduction, and it must stay green only
    // because the attribute is not an input.
    document.documentElement.setAttribute('data-ds-viewport', 'desktop');
    const outcome = await hydrateServerMarkup(serverHtml, undefined, 390);

    expect(outcome.recoverableErrors).toEqual([]);
    expect(outcome.hydratedText).toBe('true');
  });

  it('agrees on a phone request served to a desktop browser', async () => {
    const serverHtml = await renderOnRealServer('phone');
    expect(serverHtml).toContain('>true<');

    // Hydration must reproduce the SERVER's answer first and correct after,
    // which is a store update rather than a mismatch.
    const outcome = await hydrateServerMarkup(serverHtml, 'phone', 1440);

    expect(outcome.recoverableErrors).toEqual([]);
    expect(outcome.textSequence[0]).toBe('true');
  });
});

describe('adaptiveFullscreen on the first committed render', () => {
  it('renders a desktop request non-fullscreen, with no correcting frame', () => {
    withViewport(1440, () => {
      const recorder = recordAdaptiveFullscreen();
      render(
        <ResponsiveProvider ssrViewport="desktop">
          <ModernModal open onClose={() => {}} title="Desktop">
            body
          </ModernModal>
        </ResponsiveProvider>,
      );

      expect(recorder.stop()).toEqual(['false']);
    });
  });

  it('still renders a phone request fullscreen', () => {
    withViewport(390, () => {
      const recorder = recordAdaptiveFullscreen();
      render(
        <ResponsiveProvider ssrViewport="phone">
          <ModernModal open onClose={() => {}} title="Phone">
            body
          </ModernModal>
        </ResponsiveProvider>,
      );

      expect(recorder.stop()).toEqual(['true']);
    });
  });

  /**
   * THE RECORDER'S OWN NEGATIVE CONTROL, and the reason the two drills above
   * are evidence of anything.
   *
   * A green sequence proves nothing unless the instrument can go red. This
   * plants exactly the history the criterion forbids -- a surface committed
   * fullscreen and corrected out of it before the frame ends -- and requires
   * the recorder to report both values. A recorder that reads each target's
   * CURRENT attribute when the batch is delivered answers `['false']` here,
   * indistinguishable from the desktop drill's pass.
   */
  it('reports a corrected first commit, which is what makes a clean one evidence', () => {
    const CorrectedSurface = (): React.ReactElement => {
      const surface = React.useRef<HTMLDivElement>(null);
      React.useLayoutEffect(() => {
        surface.current?.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
      }, []);
      return <div ref={surface} data-adaptive-fullscreen="true" />;
    };

    const recorder = recordAdaptiveFullscreen();
    render(<CorrectedSurface />);

    expect(recorder.stop()).toEqual(['true', 'false']);
  });
});
