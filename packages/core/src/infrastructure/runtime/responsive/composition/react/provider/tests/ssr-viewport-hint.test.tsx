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

/** The unpatched writer, captured before any drill can intercept it. */
const NATIVE_SET_ATTRIBUTE = Element.prototype.setAttribute;

type Restore = () => void;
/** A prototype slot, which is untyped by nature: the patch only calls through it. */
type AnyFunction = (this: any, ...args: any[]) => any;

/**
 * Every value `data-adaptive-fullscreen` is COMMITTED with, in order, from
 * before the Modal renders until `stop()`.
 *
 * The first entry is the value the surface carried on the render that created
 * it -- the first committed render. A second entry is a correcting frame.
 *
 * IT INTERCEPTS THE WRITES; IT DOES NOT RECONSTRUCT THEM. A `MutationObserver`
 * hands over a batch after every write in it has landed, so the history has to
 * be rebuilt from `oldValue` chains and surviving nodes -- and a reconstruction
 * can only speak about nodes that are still there to be asked. A surface
 * committed fullscreen inside a node that the correcting frame REPLACES leaves
 * no attribute record naming its outgoing value, and the added-node scan reads
 * the replacement's subtree, which by delivery time already holds the corrected
 * value: the batch reports `['false']` for a frame that painted `true` first,
 * indistinguishable from a clean desktop render. Intercepting the write on the
 * caller's stack has no such blind spot -- it records the write when React
 * performs it, before the node it targets can be replaced, removed or read
 * back -- and needs no node to survive.
 *
 * ONE WRITER IS NOT THE DOM'S ONLY WRITER, so intercepting `setAttribute` alone
 * would move the blind spot rather than close it. Every path that can put a
 * value on this attribute is therefore either RECORDED or REFUSED BY NAME:
 *
 *  RECORDED, by calling through and then reading the attribute back off the
 *  element the write landed on -- which is correct whether or not the runner
 *  routes one API into another:
 *    `setAttribute` / `removeAttribute`, `setAttributeNS` / `removeAttributeNS`,
 *    `setAttributeNode(NS)` / `removeAttributeNode`, `toggleAttribute`,
 *    `NamedNodeMap.setNamedItem(NS)` / `removeNamedItem(NS)` -- which is also
 *    the path `cloneNode` plants a copied attribute through -- the `Attr.value`
 *    setter (a live write to an already-attached attribute node, invisible to
 *    every element-level API), and `Attr.nodeValue`.
 *    `element.dataset.adaptiveFullscreen = ...` and `delete` on it are recorded
 *    because they lower to `setAttribute` / `removeAttribute` here; the dataset
 *    drill below is what keeps that true rather than assumed.
 *
 *  REFUSED, loudly, at the write: `innerHTML`, `outerHTML`,
 *  `insertAdjacentHTML`, `document.write(ln)`. These plant attributes through
 *  the HTML parser, which no interception on this side can see. The refusal
 *  fires only when the markup NAMES this attribute, so unrelated markup is
 *  untouched, and it throws instead of returning -- a drill that reaches for one
 *  of them goes red with `UNSUPPORTED-WRITER` rather than reporting a history
 *  the recorder never observed.
 *
 *  ADJUDICATED OUT OF SCOPE, with the reason:
 *    - Reflected IDL properties (`className`, `id`, `title`, `style`, ...) each
 *      write ONE fixed attribute name, none of which is this one. They cannot
 *      plant the carrier.
 *    - `Attr.textContent` has no setter on this runner's `Attr` (assigning to
 *      it throws), so it is not a writer here; `Attr.nodeValue` is patched even
 *      though assigning to it does not currently reach the owner element, so a
 *      runner that made it live would be recorded rather than missed.
 *    - `DOMParser.parseFromString`, `Range.createContextualFragment` and
 *      `importNode`/`adoptNode` build nodes in another document or fragment.
 *      Nothing they build is in this document until it is inserted, and any
 *      carrier that survives insertion is caught by the per-element check in
 *      `stop()` below. React DOM parses no markup it was not handed through
 *      `dangerouslySetInnerHTML`, which the `innerHTML` refusal covers.
 *
 * AND IT FAILS CLOSED PER ELEMENT. Every element in the body that carries the
 * attribute when `stop()` runs must be an element this recorder saw written,
 * with the value it is carrying. A global "did we ever see this value" check is
 * not enough: an unrelated element written `false` would mask a carrier that
 * reached `false` through a path nothing observed. The per-element check is the
 * backstop for every writer not enumerated above, present or future.
 */
let restoreAttributeInterception: Restore | null = null;

function recordAdaptiveFullscreen(): { stop: () => string[] } {
  const seen: (string | null)[] = [];
  const observed = new Map<Element, string | null>();
  const readBack = Element.prototype.getAttribute;

  const push = (value: string | null): void => {
    if (seen.length === 0 || seen[seen.length - 1] !== value) seen.push(value);
  };
  /** What `element` carries now, recorded on the writer's own stack. */
  const commit = (element: Element | null | undefined): void => {
    if (!element) return;
    const value = readBack.call(element, FULLSCREEN_ATTRIBUTE);
    observed.set(element, value);
    push(value);
  };
  const namesAttribute = (name: unknown): boolean => {
    const lowered = String(name).toLowerCase();
    return lowered === FULLSCREEN_ATTRIBUTE || lowered.endsWith(`:${FULLSCREEN_ATTRIBUTE}`);
  };
  const markupNamesAttribute = (markup: unknown): boolean =>
    String(markup).includes(FULLSCREEN_ATTRIBUTE);
  const refuse = (writer: string): never => {
    throw new Error(
      `UNSUPPORTED-WRITER: ${writer} plants ${FULLSCREEN_ATTRIBUTE} through parsed markup, which this recorder cannot observe; it will not report a commit history it did not see`,
    );
  };

  const undo: Restore[] = [];
  const declaringOwner = (start: object | null, key: string): object | null => {
    let owner: object | null = start;
    while (owner && !Object.getOwnPropertyDescriptor(owner, key)) {
      owner = Object.getPrototypeOf(owner) as object | null;
    }
    return owner;
  };
  const patchMethod = (
    owner: object | null | undefined,
    key: string,
    wrap: (original: AnyFunction) => AnyFunction,
  ): void => {
    const target = owner as Record<string, AnyFunction> | null | undefined;
    if (!target || typeof target[key] !== 'function') return;
    const original = target[key];
    target[key] = wrap(original);
    undo.push(() => {
      target[key] = original;
    });
  };
  const patchSetter = (
    start: object | null | undefined,
    key: string,
    wrap: (original: (value: unknown) => void) => (value: unknown) => void,
  ): void => {
    const owner = declaringOwner(start ?? null, key);
    const descriptor = owner ? Object.getOwnPropertyDescriptor(owner, key) : undefined;
    if (!owner || !descriptor?.set || !descriptor.configurable) return;
    const original = descriptor.set as (value: unknown) => void;
    Object.defineProperty(owner, key, { ...descriptor, set: wrap(original) });
    undo.push(() => {
      Object.defineProperty(owner, key, descriptor);
    });
  };

  const element = Element.prototype;
  patchMethod(element, 'setAttribute', (original) =>
    function setAttribute(this: Element, name: unknown, value: unknown) {
      const result = original.call(this, name, value);
      if (namesAttribute(name)) commit(this);
      return result;
    },
  );
  patchMethod(element, 'removeAttribute', (original) =>
    function removeAttribute(this: Element, name: unknown) {
      const result = original.call(this, name);
      if (namesAttribute(name)) commit(this);
      return result;
    },
  );
  patchMethod(element, 'setAttributeNS', (original) =>
    function setAttributeNS(this: Element, namespace: unknown, name: unknown, value: unknown) {
      const result = original.call(this, namespace, name, value);
      if (namesAttribute(name)) commit(this);
      return result;
    },
  );
  patchMethod(element, 'removeAttributeNS', (original) =>
    function removeAttributeNS(this: Element, namespace: unknown, name: unknown) {
      const result = original.call(this, namespace, name);
      if (namesAttribute(name)) commit(this);
      return result;
    },
  );
  patchMethod(element, 'toggleAttribute', (original) =>
    function toggleAttribute(this: Element, name: unknown, force: unknown) {
      const result = original.call(this, name, force);
      if (namesAttribute(name)) commit(this);
      return result;
    },
  );
  for (const key of ['setAttributeNode', 'setAttributeNodeNS', 'removeAttributeNode']) {
    patchMethod(element, key, (original) =>
      function withAttributeNode(this: Element, node: Attr) {
        const result = original.call(this, node);
        if (node && namesAttribute(node.name)) commit(this);
        return result;
      },
    );
  }
  patchSetter(element, 'innerHTML', (original) =>
    function innerHTML(this: Element, markup: unknown) {
      if (markupNamesAttribute(markup)) refuse('Element.innerHTML');
      original.call(this, markup);
    },
  );
  patchSetter(element, 'outerHTML', (original) =>
    function outerHTML(this: Element, markup: unknown) {
      if (markupNamesAttribute(markup)) refuse('Element.outerHTML');
      original.call(this, markup);
    },
  );
  patchMethod(element, 'insertAdjacentHTML', (original) =>
    function insertAdjacentHTML(this: Element, position: unknown, markup: unknown) {
      if (markupNamesAttribute(markup)) refuse('Element.insertAdjacentHTML');
      return original.call(this, position, markup);
    },
  );
  for (const key of ['write', 'writeln']) {
    patchMethod(Document.prototype, key, (original) =>
      function documentWrite(this: Document, ...markup: unknown[]) {
        if (markup.some(markupNamesAttribute)) refuse(`Document.${key}`);
        return original.apply(this, markup);
      },
    );
  }

  // An attribute node is a writer in its own right: once attached, writing its
  // value changes what the element carries without touching the element.
  for (const key of ['value', 'nodeValue']) {
    patchSetter(Attr.prototype, key, (original) =>
      function attributeValue(this: Attr, value: unknown) {
        original.call(this, value);
        if (namesAttribute(this.name)) commit(this.ownerElement);
      },
    );
  }

  // `cloneNode` copies attributes through this map, so a carrier planted by a
  // clone is recorded here and nowhere else.
  const attributes = NamedNodeMap.prototype as unknown as Record<string, AnyFunction>;
  for (const key of ['setNamedItem', 'setNamedItemNS']) {
    patchMethod(attributes, key, (original) =>
      function setNamedItem(this: NamedNodeMap, node: Attr) {
        const result = original.call(this, node);
        if (node && namesAttribute(node.name)) commit(node.ownerElement);
        return result;
      },
    );
  }
  patchMethod(attributes, 'removeNamedItem', (original) =>
    function removeNamedItem(this: NamedNodeMap, name: unknown) {
      const owner = namesAttribute(name)
        ? (this.getNamedItem(String(name))?.ownerElement ?? null)
        : null;
      const result = original.call(this, name);
      if (owner) commit(owner);
      return result;
    },
  );
  patchMethod(attributes, 'removeNamedItemNS', (original) =>
    function removeNamedItemNS(this: NamedNodeMap, namespace: unknown, name: unknown) {
      const owner = namesAttribute(name)
        ? (this.getNamedItemNS(namespace as string | null, String(name))?.ownerElement ?? null)
        : null;
      const result = original.call(this, namespace, name);
      if (owner) commit(owner);
      return result;
    },
  );

  // A patched prototype that outlives a failing assertion would follow the
  // worker into every later file, so the restore is also owned by `afterEach`,
  // and `stop()` restores BEFORE it can throw.
  const restore = (): void => {
    while (undo.length > 0) undo.pop()?.();
    restoreAttributeInterception = null;
  };
  restoreAttributeInterception = restore;
  return {
    stop: () => {
      restore();
      for (const carrier of Array.from(
        document.body.querySelectorAll(`[${FULLSCREEN_ATTRIBUTE}]`),
      )) {
        const settled = carrier.getAttribute(FULLSCREEN_ATTRIBUTE);
        if (!observed.has(carrier) || observed.get(carrier) !== settled) {
          throw new Error(
            `UNOBSERVED-CARRIER: a surface carries ${String(settled)} that this recorder never saw written to it; it is not observing every commit`,
          );
        }
      }
      if (seen.includes(null)) {
        throw new Error(
          `${FULLSCREEN_ATTRIBUTE} was removed mid-history, which this instrument does not model`,
        );
      }
      return seen as string[];
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
  restoreAttributeInterception?.();
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

  /**
   * THE SAME CONTROL, WITH THE COMMIT HIDDEN BY REPLACEMENT.
   *
   * The correction above rewrites the attribute on the node that carries it, so
   * the write leaves a record naming the outgoing value. This one changes the
   * surface's ELEMENT TYPE, which makes React drop the fullscreen node and
   * insert a different one in its place. Nothing then names `true`: the removed
   * node carries no attribute record, and the surviving subtree only ever held
   * `false`. A recorder that rebuilds the history from delivered records
   * therefore reports `['false']` -- byte-identical to the desktop drill's
   * pass, for a frame that painted fullscreen first.
   */
  it('reports a first commit hidden by replacing the surface node, not rewriting it', () => {
    const ReplacedSurface = (): React.ReactElement => {
      const [fullscreen, setFullscreen] = React.useState(true);
      React.useLayoutEffect(() => {
        setFullscreen(false);
      }, []);
      return (
        <section>
          {fullscreen ? (
            <span data-adaptive-fullscreen="true" />
          ) : (
            <div data-adaptive-fullscreen="false" />
          )}
        </section>
      );
    };

    const recorder = recordAdaptiveFullscreen();
    render(<ReplacedSurface />);

    expect(recorder.stop()).toEqual(['true', 'false']);
  });
});

/**
 * A surface that committed fullscreen and is corrected a layout effect later,
 * through whichever DOM writer the drill hands it. The value the frame painted
 * first has to appear in the history no matter which API removed it.
 */
function CorrectedThrough({
  correct,
}: {
  correct: (surface: HTMLDivElement) => void;
}): React.ReactElement {
  const surface = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (surface.current) correct(surface.current);
  }, [correct]);
  return <div ref={surface} data-adaptive-fullscreen="true" />;
}

/** Markup that names the attribute, for the writers this recorder refuses. */
const PLANTED_MARKUP = `<span ${FULLSCREEN_ATTRIBUTE}="true"></span>`;

describe('the recorder observes every writer, or refuses the drill by name', () => {
  it('records a correction written with setAttributeNS', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => surface.setAttributeNS(null, FULLSCREEN_ATTRIBUTE, 'false')}
      />,
    );

    expect(recorder.stop()).toEqual(['true', 'false']);
  });

  it('records a correction attached as an attribute node', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => {
          const node = document.createAttribute(FULLSCREEN_ATTRIBUTE);
          node.value = 'false';
          surface.setAttributeNode(node);
        }}
      />,
    );

    expect(recorder.stop()).toEqual(['true', 'false']);
  });

  /**
   * The element is never touched here: the correction is written straight onto
   * the attribute node the surface already carries. No element-level writer
   * runs at all, which is exactly why this one needs its own interception.
   */
  it('records a correction written through the attribute node itself', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => {
          const node = surface.getAttributeNode(FULLSCREEN_ATTRIBUTE);
          if (node) node.value = 'false';
        }}
      />,
    );

    expect(recorder.stop()).toEqual(['true', 'false']);
  });

  /**
   * `dataset` is the property-assignment path onto this attribute. It lowers to
   * `setAttribute` on this runner rather than being patched itself -- and this
   * drill is what keeps that a measured fact instead of an assumption.
   */
  it('records a correction assigned through dataset', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => {
          surface.dataset.adaptiveFullscreen = 'false';
        }}
      />,
    );

    expect(recorder.stop()).toEqual(['true', 'false']);
  });

  /**
   * `toggleAttribute` plants the EMPTY string, which is a value a surface can
   * be seen carrying and therefore a value the history has to name. A recorder
   * that only watched `setAttribute` with a value would report `['false']`.
   */
  it('records the empty value toggleAttribute plants, then the correction over it', () => {
    const ToggledSurface = (): React.ReactElement => {
      const surface = React.useRef<HTMLDivElement>(null);
      React.useLayoutEffect(() => {
        surface.current?.toggleAttribute(FULLSCREEN_ATTRIBUTE);
        surface.current?.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
      }, []);
      return <div ref={surface} />;
    };

    const recorder = recordAdaptiveFullscreen();
    render(<ToggledSurface />);

    expect(recorder.stop()).toEqual(['', 'false']);
  });

  /**
   * A removal leaves NO carrier in the document, so the per-element backstop
   * cannot catch it: an unobserved `removeAttributeNode` would report the clean
   * `['true']` of a surface that ended up carrying nothing. Observing it is what
   * turns the drill red.
   */
  it('sees a removal through removeAttributeNode rather than reporting a clean history', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => {
          const node = surface.getAttributeNode(FULLSCREEN_ATTRIBUTE);
          if (node) surface.removeAttributeNode(node);
        }}
      />,
    );

    expect(() => recorder.stop()).toThrow(/removed mid-history/);
  });

  /**
   * A clone carries the attribute without anything writing it: no element-level
   * writer runs, and the source it was copied from need never be in the
   * document. The copy goes through the attribute map, which is where this is
   * recorded.
   */
  it('records a carrier planted by cloning a node, not by writing one', () => {
    const source = document.createElement('div');
    NATIVE_SET_ATTRIBUTE.call(source, FULLSCREEN_ATTRIBUTE, 'true');

    const recorder = recordAdaptiveFullscreen();
    const clone = source.cloneNode(true) as Element;
    document.body.appendChild(clone);
    try {
      expect(recorder.stop()).toEqual(['true']);
    } finally {
      clone.remove();
    }
  });

  /**
   * THE MASKING CASE. The value the unobserved carrier settles on is a value
   * the recorder DID see -- written by a different element. A global "have we
   * ever seen this value" check passes here and certifies a history it never
   * observed; only a per-element check can refuse it.
   *
   * The native writer captured before the patch is exactly what an
   * unenumerated writer looks like from the recorder's side.
   */
  it('refuses a carrier it never saw written, even when another element wrote the same value', () => {
    const recorder = recordAdaptiveFullscreen();
    render(<div data-adaptive-fullscreen="false" />);

    const unobserved = document.createElement('div');
    document.body.appendChild(unobserved);
    NATIVE_SET_ATTRIBUTE.call(unobserved, FULLSCREEN_ATTRIBUTE, 'false');
    try {
      expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER/);
    } finally {
      unobserved.remove();
    }
  });

  it('refuses innerHTML that names the attribute, and leaves other markup alone', () => {
    const recorder = recordAdaptiveFullscreen();
    const host = document.createElement('div');
    document.body.appendChild(host);
    try {
      expect(() => {
        host.innerHTML = PLANTED_MARKUP;
      }).toThrow(/UNSUPPORTED-WRITER/);
      expect(host.children.length).toBe(0);

      host.innerHTML = '<span>body</span>';
      expect(host.children.length).toBe(1);
    } finally {
      // Detached first: a refusal that did not fire leaves a carrier behind, and
      // the drill that reports it must not also poison every drill after it.
      host.remove();
      recorder.stop();
    }
  });

  it('refuses outerHTML that names the attribute', () => {
    const recorder = recordAdaptiveFullscreen();
    const parent = document.createElement('div');
    const host = document.createElement('div');
    parent.appendChild(host);
    document.body.appendChild(parent);
    try {
      expect(() => {
        host.outerHTML = PLANTED_MARKUP;
      }).toThrow(/UNSUPPORTED-WRITER/);
      expect(parent.querySelectorAll(`[${FULLSCREEN_ATTRIBUTE}]`).length).toBe(0);
    } finally {
      // Detached first: a refusal that did not fire leaves a carrier behind, and
      // the drill that reports it must not also poison every drill after it.
      parent.remove();
      recorder.stop();
    }
  });

  it('refuses insertAdjacentHTML that names the attribute', () => {
    const recorder = recordAdaptiveFullscreen();
    const host = document.createElement('div');
    document.body.appendChild(host);
    try {
      expect(() => host.insertAdjacentHTML('beforeend', PLANTED_MARKUP)).toThrow(
        /UNSUPPORTED-WRITER/,
      );
      expect(host.children.length).toBe(0);

      host.insertAdjacentHTML('beforeend', '<span>body</span>');
      expect(host.children.length).toBe(1);
    } finally {
      // Detached first: a refusal that did not fire leaves a carrier behind, and
      // the drill that reports it must not also poison every drill after it.
      host.remove();
      recorder.stop();
    }
  });

  /**
   * A patched prototype that survived a drill would follow the worker into
   * every later file in the run. `stop()` restores before it can throw, so even
   * a red drill leaves the DOM as it found it.
   */
  it('leaves every writer it patched exactly as it found it', () => {
    const descriptorSetter = (owner: object, key: string): unknown =>
      Object.getOwnPropertyDescriptor(owner, key)?.set;
    const before = {
      setAttribute: Element.prototype.setAttribute,
      removeAttribute: Element.prototype.removeAttribute,
      setAttributeNS: Element.prototype.setAttributeNS,
      setAttributeNode: Element.prototype.setAttributeNode,
      removeAttributeNode: Element.prototype.removeAttributeNode,
      toggleAttribute: Element.prototype.toggleAttribute,
      insertAdjacentHTML: Element.prototype.insertAdjacentHTML,
      write: Document.prototype.write,
      setNamedItem: NamedNodeMap.prototype.setNamedItem,
      removeNamedItem: NamedNodeMap.prototype.removeNamedItem,
      innerHTML: descriptorSetter(Element.prototype, 'innerHTML'),
      outerHTML: descriptorSetter(Element.prototype, 'outerHTML'),
      attributeValue: descriptorSetter(Attr.prototype, 'value'),
      nodeValue: descriptorSetter(Node.prototype, 'nodeValue'),
    };

    const recorder = recordAdaptiveFullscreen();
    expect(Element.prototype.setAttribute).not.toBe(before.setAttribute);
    expect(descriptorSetter(Element.prototype, 'innerHTML')).not.toBe(before.innerHTML);
    expect(descriptorSetter(Attr.prototype, 'value')).not.toBe(before.attributeValue);
    expect(NamedNodeMap.prototype.setNamedItem).not.toBe(before.setNamedItem);

    recorder.stop();

    expect(Element.prototype.setAttribute).toBe(before.setAttribute);
    expect(Element.prototype.removeAttribute).toBe(before.removeAttribute);
    expect(Element.prototype.setAttributeNS).toBe(before.setAttributeNS);
    expect(Element.prototype.setAttributeNode).toBe(before.setAttributeNode);
    expect(Element.prototype.removeAttributeNode).toBe(before.removeAttributeNode);
    expect(Element.prototype.toggleAttribute).toBe(before.toggleAttribute);
    expect(Element.prototype.insertAdjacentHTML).toBe(before.insertAdjacentHTML);
    expect(Document.prototype.write).toBe(before.write);
    expect(NamedNodeMap.prototype.setNamedItem).toBe(before.setNamedItem);
    expect(NamedNodeMap.prototype.removeNamedItem).toBe(before.removeNamedItem);
    expect(descriptorSetter(Element.prototype, 'innerHTML')).toBe(before.innerHTML);
    expect(descriptorSetter(Element.prototype, 'outerHTML')).toBe(before.outerHTML);
    expect(descriptorSetter(Attr.prototype, 'value')).toBe(before.attributeValue);
    expect(descriptorSetter(Node.prototype, 'nodeValue')).toBe(before.nodeValue);
  });
});
