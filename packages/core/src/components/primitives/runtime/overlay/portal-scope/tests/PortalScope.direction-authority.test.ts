/**
 * WO-INV-01 -- the direction authority of the shared portal-scope reader.
 *
 * The geometry side of this law is measured in real Chromium
 * (`OverlayPlacement.browser-geometry.integration.test.ts`), because a DOM
 * runner does not lay out and does not resolve `dir` into computed style. What
 * is asserted here is the part that has no geometry: WHICH source the reader
 * consults, and that the sources it cannot consult -- a server render with no
 * `window`, a runtime with no `getComputedStyle`, a node with no declaring
 * ancestor -- degrade to the declared ancestor instead of throwing.
 *
 * Each case imports the module fresh: the reader probes ONCE whether this
 * runtime resolves `dir` into computed style and caches the answer, so a
 * shared module instance would carry one case's runtime into the next.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

type LocaleReader = typeof import('..')['readLocaleContext'];

/** An anchor inside an `[dir]` ancestor, plus the painted direction to fake. */
function mountAnchor(options: {
  ancestorDir?: 'rtl' | 'ltr';
  paints?: 'rtl' | 'ltr';
}): HTMLElement {
  const host = document.createElement('div');
  if (options.ancestorDir) host.setAttribute('dir', options.ancestorDir);
  const anchor = document.createElement('button');
  if (options.paints) anchor.setAttribute('data-paints', options.paints);
  host.appendChild(anchor);
  document.body.appendChild(host);
  return anchor;
}

/**
 * A runtime that DOES resolve `dir` into computed style, the way a browser
 * does: an element's own `data-paints` wins (the CSS override), otherwise the
 * nearest `[dir]` ancestor decides.
 */
function installBrowserLikeComputedStyle(): void {
  vi.stubGlobal('getComputedStyle', (element: Element) => ({
    direction:
      (element as HTMLElement).getAttribute('data-paints')
      ?? (element.closest('[dir="rtl"]') ? 'rtl' : 'ltr'),
    getPropertyValue: () => '',
  }));
}

async function freshReader(): Promise<LocaleReader> {
  vi.resetModules();
  const module = await import('..');
  return module.readLocaleContext;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('readLocaleContext -- which source answers "what direction is this anchor"', () => {
  it('takes the anchor\'s COMPUTED direction over a contradicting [dir] ancestor', async () => {
    installBrowserLikeComputedStyle();
    const readLocaleContext = await freshReader();
    // The tree the ruling is about: an `rtl` ancestor, a container painting
    // `ltr` below it. What the anchor PAINTS is what the overlay must stamp.
    const anchor = mountAnchor({ ancestorDir: 'rtl', paints: 'ltr' });

    expect(readLocaleContext(anchor).direction).toBe('ltr');
  });

  it('still reports rtl when the computed direction agrees with the ancestor', async () => {
    installBrowserLikeComputedStyle();
    const readLocaleContext = await freshReader();
    const anchor = mountAnchor({ ancestorDir: 'rtl' });

    expect(readLocaleContext(anchor).direction).toBe('rtl');
  });

  it('falls back to the [dir] ancestor when the runtime has no getComputedStyle', async () => {
    // The hydration/SSR shape reachable from a DOM runner: `window` exists but
    // nothing resolves computed style, so the declared ancestor is the only
    // source left. It must answer, not throw.
    vi.stubGlobal('getComputedStyle', undefined);
    const readLocaleContext = await freshReader();
    const anchor = mountAnchor({ ancestorDir: 'rtl', paints: 'ltr' });

    expect(() => readLocaleContext(anchor)).not.toThrow();
    expect(readLocaleContext(anchor).direction).toBe('rtl');
  });

  it('falls back to the [dir] ancestor when `window` is undefined', async () => {
    // This measures the `typeof window` branch, NOT a full document-less
    // runtime: `document` is still the runner's, which is what the `lang` read
    // needs. A server render reaches this branch first, so the branch is what
    // there is to assert here.
    vi.stubGlobal('window', undefined);
    const readLocaleContext = await freshReader();
    const anchor = mountAnchor({ ancestorDir: 'rtl' });

    expect(() => readLocaleContext(anchor)).not.toThrow();
    expect(readLocaleContext(anchor).direction).toBe('rtl');
  });

  it('falls back to the [dir] ancestor when the computed direction is empty', async () => {
    // Chromium answers `''` for a node that has no box -- a detached one, or
    // one whose subtree is `display: none`. The capability is TRUE (the probe
    // below resolves `rtl`), so the computed branch runs and carries no
    // answer; the declared ancestor must still answer.
    let probedDir: string | null = null;
    vi.stubGlobal('getComputedStyle', (element: Element) => {
      // The capability probe is the only node whose root is not the document:
      // it lives in a throwaway shadow tree.
      const isProbe = element.getRootNode() !== document;
      if (isProbe) probedDir = (element as HTMLElement).getAttribute('dir');
      return { direction: isProbe ? 'rtl' : '', getPropertyValue: () => '' };
    });
    const readLocaleContext = await freshReader();
    const anchor = mountAnchor({ ancestorDir: 'rtl' });

    expect(readLocaleContext(anchor).direction).toBe('rtl');
    expect(probedDir).toBe('rtl');
  });

  it('answers ltr for a detached node that declares nothing, without throwing', async () => {
    vi.stubGlobal('window', undefined);
    const readLocaleContext = await freshReader();
    const detached = document.createElement('button');

    expect(() => readLocaleContext(detached)).not.toThrow();
    expect(readLocaleContext(detached).direction).toBe('ltr');
  });
});
