/**
 * The collection-header adapt slot (WO-FAM-10): the compact composition
 * resolves through the shared runtime, the root stamps the postures in force
 * as `data-posture`, and the header narrows on its OWN box.
 *
 * Why this family needed the slot: `compactLayout` decides WHICH ELEMENTS
 * RENDER -- the editorial-tech divider and rule, the eyebrow's column, the
 * overflow menu, the icon-only action collapse. Keyed on the viewport alone, a
 * header in a narrow rail on a desktop page rendered its full editorial layout
 * into space that cannot hold it. Every measurement below is a CONTAINER width
 * taken under the DESKTOP viewport, which is the whole point.
 */

import React from 'react';
import { act, waitFor, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CollectionHeader, type CollectionHeaderProps } from '..';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../infrastructure/runtime/responsive';
import { EngineProvider } from '../../../../../infrastructure/runtime/engines/composition/react/provider';
import { renderWithEngine } from '@tests/support/engine';

/* The engine component factory resolves its primitives through React.lazy, so
   the mount is a suspense round-trip, not a commit. This suite renders up to
   four headers per arm; 2s is a load-sensitive floor for that. */
const WAIT_TIMEOUT = 15000;

const DESKTOP: ResponsiveContextValue = {
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

const PHONE: ResponsiveContextValue = {
  ...DESKTOP,
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: true,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
};

/* The shared setup's ResizeObserver never calls back, so the header can only
   ever report the unmeasured posture. This one reports a width on demand. */
class WidthObserver {
  static instances: WidthObserver[] = [];
  constructor(readonly callback: ResizeObserverCallback) {
    WidthObserver.instances.push(this);
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

const originalObserver = globalThis.ResizeObserver;

function measure(width: number): void {
  act(() => {
    for (const instance of WidthObserver.instances) {
      instance.callback(
        [{ contentRect: { width } } as ResizeObserverEntry],
        instance as unknown as ResizeObserver,
      );
    }
  });
}

beforeEach(() => {
  WidthObserver.instances = [];
  (globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    WidthObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  (globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = originalObserver;
});

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />;

/* The editorial-tech variant is the loudest structural fork in the family: its
   subtitle divider and rule render ONLY in the full composition, and the three
   actions with a primary are exactly the overflow law's trigger. */
const EDITORIAL: CollectionHeaderProps = {
  eyebrow: 'Workspace',
  title: 'Candidates',
  subtitle: 'All active candidates',
  layoutVariant: 'editorial-tech',
  quickActions: [
    { key: 'invite', label: 'Invite', variant: 'primary', onClick: vi.fn() },
    { key: 'import', label: 'Import', icon: <Icon />, onClick: vi.fn() },
    { key: 'export', label: 'Export', icon: <Icon />, onClick: vi.fn() },
  ],
};

async function renderHeader(
  responsive: ResponsiveContextValue,
  props: Partial<CollectionHeaderProps> = {},
): Promise<HTMLElement> {
  const view = renderWithEngine(
    <ResponsiveContext.Provider value={responsive}>
      <CollectionHeader {...EDITORIAL} {...props} />
    </ResponsiveContext.Provider>,
    'modern',
  );
  /* Every primitive in the chrome is its own lazy engine component, so the
     root appears BEFORE its clusters do. Wait for the deepest parts this
     suite reads, not the root, or the first structural read races the mount. */
  await waitFor(
    () => {
      const root = view.container.querySelector('.ds-collection-header[data-part="root"]');
      if (!root?.querySelector('[data-part="identity"]')) {
        throw new Error('expected the identity column');
      }
      if (!root.querySelector('[data-part="quick-actions"]')) {
        throw new Error('expected the quick-actions cluster');
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  const root = view.container.querySelector(
    '.ds-collection-header[data-part="root"]',
  ) as HTMLElement;
  // Non-vacuity floor: the arms below read absence as a structural decision,
  // so an unmounted subtree must never be able to pass for a retired element.
  expect(root.querySelector('[data-part="title"]')).not.toBeNull();
  expect(root.querySelectorAll('.ds-collection-header__quick-action').length).toBeGreaterThan(0);
  return root;
}

const POSTURE = /^(phone|tablet|desktop)( (compact|regular|expanded))?$/;
const UNMEASURED = /^(phone|tablet|desktop)$/;

/** The elements that exist only in the full composition. */
function fullCompositionParts(root: HTMLElement) {
  return {
    subtitleDivider: root.querySelector('[data-part="subtitle-divider"]'),
    editorialRule: root.querySelector('[data-part="editorial-tech-rule"]'),
    /* The eyebrow lives in the secondary rail at full width and leads the
       identity column when compact -- one element, two columns. */
    eyebrowInIdentity: (root.querySelector('[data-part="identity"]') as HTMLElement).querySelector(
      '[data-part="eyebrow"]',
    ),
    inlineActions: root.querySelectorAll('.ds-collection-header__quick-action').length,
    overflowTrigger: root.querySelector('.ds-collection-header__quick-action--overflow'),
  };
}

describe('the collection-header adapt slot', () => {
  it('stamps the postures in force and keeps the viewport projection when nothing is adapted', async () => {
    const root = await renderHeader(DESKTOP);
    expect(root.getAttribute('data-posture')).toMatch(POSTURE);
    expect(root).toHaveAttribute('data-compact', 'false');
  });

  it('carries the viewport posture alone until the box has been measured -- the server render', async () => {
    const root = await renderHeader(DESKTOP);
    expect(root.getAttribute('data-posture')).toMatch(UNMEASURED);
    expect(root.getAttribute('data-posture')).toBe('desktop');
  });

  it('runs the compact composition at a measured narrow box ON A DESKTOP VIEWPORT, and the layout actually changes', async () => {
    const root = await renderHeader(DESKTOP);

    const full = fullCompositionParts(root);
    expect(full.subtitleDivider).not.toBeNull();
    expect(full.editorialRule).not.toBeNull();
    expect(full.eyebrowInIdentity).toBeNull();
    expect(full.overflowTrigger).toBeNull();
    expect(full.inlineActions).toBe(3);

    // 480px is inside the balanced ladder's compact band (<= 639px).
    measure(480);
    expect(root.getAttribute('data-posture')).toBe('desktop compact');
    expect(root).toHaveAttribute('data-compact', 'true');

    const narrowed = fullCompositionParts(root);
    expect(narrowed.subtitleDivider).toBeNull();
    expect(narrowed.editorialRule).toBeNull();
    expect(narrowed.eyebrowInIdentity).not.toBeNull();
    // The overflow law: the primary keeps its labelled button, the two quiet
    // actions move into a real menu. The Dropdown primitive loads lazily, so
    // the trigger arrives a tick after the box is measured.
    expect(narrowed.subtitleDivider).toBeNull();
    const overflow = await within(root).findByLabelText('More actions', undefined, {
      timeout: WAIT_TIMEOUT,
    });
    expect(overflow).toHaveClass('ds-collection-header__quick-action--overflow');
    expect(fullCompositionParts(root).inlineActions).toBe(2);

    // 1200px is above the standard edge (839px): the full composition returns.
    measure(1200);
    expect(root.getAttribute('data-posture')).toBe('desktop expanded');
    expect(root).toHaveAttribute('data-compact', 'false');
    const restored = fullCompositionParts(root);
    expect(restored.subtitleDivider).not.toBeNull();
    expect(restored.editorialRule).not.toBeNull();
    expect(restored.eyebrowInIdentity).toBeNull();
    expect(restored.overflowTrigger).toBeNull();
    expect(restored.inlineActions).toBe(3);
    expect(within(root).queryByLabelText('More actions')).toBeNull();
  });

  it('reports the regular band between the two edges and keeps the full composition there', async () => {
    const root = await renderHeader(DESKTOP);
    measure(720);
    expect(root.getAttribute('data-posture')).toBe('desktop regular');
    expect(root).toHaveAttribute('data-compact', 'false');
    expect(root.querySelector('[data-part="editorial-tech-rule"]')).not.toBeNull();
  });

  it('narrows and never widens: a wide box on a phone keeps the compact composition', async () => {
    const root = await renderHeader(PHONE);
    measure(1200);
    expect(root.getAttribute('data-posture')).toBe('phone expanded');
    expect(root).toHaveAttribute('data-compact', 'true');
  });

  it('lets an app adapt delta outrank the family default for the same posture', async () => {
    const root = await renderHeader(DESKTOP, { adapt: { compact: { compactLayout: false } } });
    measure(480);
    expect(root.getAttribute('data-posture')).toBe('desktop compact');
    expect(root).toHaveAttribute('data-compact', 'false');
    expect(root.querySelector('[data-part="editorial-tech-rule"]')).not.toBeNull();
  });

  it('ignores a delta declared for a posture that is not in force', async () => {
    const root = await renderHeader(DESKTOP, { adapt: { expanded: { compactLayout: true } } });
    measure(480);
    expect(root).toHaveAttribute('data-compact', 'true');
    measure(720);
    expect(root).toHaveAttribute('data-compact', 'false');
    measure(1200);
    expect(root).toHaveAttribute('data-compact', 'true');
  });

  it('leaves the unmeasured path exactly where it was: the viewport projection, `compact` still the last word on it', async () => {
    expect(await renderHeader(PHONE)).toHaveAttribute('data-compact', 'true');
    expect(await renderHeader(DESKTOP)).toHaveAttribute('data-compact', 'false');
    // An explicit `compact` is the base layer and no viewport default competes
    // with it, so it survives an unmeasured render in both directions.
    expect(await renderHeader(PHONE, { compact: false })).toHaveAttribute('data-compact', 'false');
    expect(await renderHeader(DESKTOP, { compact: true })).toHaveAttribute('data-compact', 'true');
  });

  it('stamps the viewport posture alone in a real server render, where no box can be measured', () => {
    const markup = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <ResponsiveContext.Provider value={DESKTOP}>
          <CollectionHeader {...EDITORIAL} />
        </ResponsiveContext.Provider>
      </EngineProvider>,
    );
    expect(markup).toContain('data-posture="desktop"');
    expect(markup).toContain('data-compact="false"');
    expect(markup).toContain('data-part="editorial-tech-rule"');

    const phoneMarkup = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <ResponsiveContext.Provider value={PHONE}>
          <CollectionHeader {...EDITORIAL} />
        </ResponsiveContext.Provider>
      </EngineProvider>,
    );
    expect(phoneMarkup).toContain('data-posture="phone"');
    expect(phoneMarkup).toContain('data-compact="true"');
    expect(phoneMarkup).not.toContain('data-part="editorial-tech-rule"');
  });
});
