import React from 'react';
import { describe, expect, it } from 'vitest';
import { act, waitFor } from '@testing-library/react';

import { PatternCockpitHeader } from '../cockpit-header';
import type { CockpitStatus } from '../cockpit-header';
import { PatternPageShell } from '../page-shell';
import { PatternWorkbenchHeader } from '../workbench-header';
import type { WorkbenchQuickAction } from '../workbench-header';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-B/P -- the patterns/misc header family
// (CockpitHeader, PageShell, WorkbenchHeader) data-part contract evidence.
//
// The pre-step stamps `data-part` plus state attributes (data-loading,
// data-compact, data-sticky, data-variant, data-active, data-interactive,
// data-last, data-has-label) onto the four engine files in this checkpoint
// without moving any paint.
//
// WHY EVERY STAMP IS ASSERTED HERE (P-79): `BaseComponentProps` declares
// `data-part` on every component, so `tsc` accepts the stamp anywhere, but the
// engines build their DOM props from allowlists and Grid/Card/Button silently
// DROP it. A stamp that never reaches the DOM is invisible to tsc, to the paint
// counter, and to jsdom -- a contract test is the only thing in the chain that
// can catch it. All four files in THIS checkpoint render raw DOM exclusively
// (div/span/a/button/nav/h1/h2/p/svg -- zero DS primitives are imported), so
// P-79 cannot bite here and every stamp below is expected to land. That is a
// property of today's source, not a licence to skip the assertion: the day one
// of these files composes a Box or a Button, this test is what notices.
//
// THREE ENGINE FACTS THIS TEST PINS, all of which contradict the delegating
// brief and the checkpoint inventory (code over inventory):
//
//   1. CockpitHeader and WorkbenchHeader HAVE NO RUSTIC ENGINE. Their
//      `createEngineComponent` maps rustic -> `./engines/classic`, and no
//      `engines/rustic.tsx` exists on disk. Only PageShell has a real rustic
//      engine. So only PageShell is asserted under both engines; the other two
//      are modern-only, because under `engine=rustic` they render the CLASSIC
//      file, which this checkpoint does not own and does not stamp.
//
//   2. WorkbenchHeader's `BackButton` IS UNREACHABLE. It is defined
//      (engines/modern.tsx:135) and referenced by nothing: the render tree
//      never mounts it and `WorkbenchHeaderProps` has no `onBack` field at all.
//      The "three BackButtons, no two alike" this checkpoint was briefed to
//      preserve are really TWO reachable ones (cockpit, page-shell) plus one
//      that no consumer can render. The last assertion in the WorkbenchHeader
//      block pins that deadness, so that wiring a back button up later is a
//      deliberate decision with its own baselines rather than a side effect.
//
//   3. PageShell's rustic engine HAS NO INTERACTIVE PAINT -- no hover on its
//      back button, breadcrumb links, or inactive tabs -- while its modern
//      sibling has hover/focus on all three. That asymmetry is behaviour being
//      preserved, not a defect to fix, and it is photographed (twice, at rest
//      and on hover) in headers-patterns-batch.spec.ts.
// ---------------------------------------------------------------------------

/** Every `data-part` an engine file in this checkpoint stamps on its own DOM. */
async function partsOf(container: HTMLElement): Promise<Set<string>> {
  await waitFor(() => {
    expect(container.querySelector('[data-part="root"]')).not.toBeNull();
  });
  return new Set(
    Array.from(container.querySelectorAll('[data-part]')).map(
      (el) => el.getAttribute('data-part') as string,
    ),
  );
}

function partCount(container: HTMLElement, part: string): number {
  return container.querySelectorAll(`[data-part="${part}"]`).length;
}

const noop = () => undefined;

const CRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Event #1234' },
];

const ALL_STATUS_VARIANTS: readonly CockpitStatus['variant'][] = [
  'success',
  'warning',
  'error',
  'info',
  'default',
];

const ALL_ACTION_VARIANTS: readonly NonNullable<WorkbenchQuickAction['variant']>[] = [
  'primary',
  'danger',
  'default',
];

describe('patterns/misc header family -- data-part contract (WO-SKIN-06 CK-B/P)', () => {
  describe('CockpitHeader (modern)', () => {
    /** Every state a skin rule will key on, rendered at once. */
    function renderFull(props: Record<string, unknown> = {}) {
      return renderWithEngine(
        <PatternCockpitHeader
          title="Event #1234"
          subtitle="Summer Music Festival"
          breadcrumbs={CRUMBS}
          status={ALL_STATUS_VARIANTS.map((variant) => ({ label: variant, variant }))}
          actions={<button type="button">Edit</button>}
          onBack={noop}
          {...props}
        />,
        'modern',
      );
    }

    it('stamps every part it renders onto the DOM', async () => {
      const { container } = renderFull();
      const parts = await partsOf(container);

      for (const part of [
        'root',
        'breadcrumb',
        'separator',
        'crumb',
        'back',
        'main-row',
        'lead',
        'titles',
        'title-row',
        'title',
        'status-list',
        'status',
        'subtitle',
        'actions',
      ]) {
        expect(parts, `cockpit-header must stamp data-part="${part}"`).toContain(part);
      }
    });

    it('stamps all five status variants (STATUS_PILL_STYLES is a 5-way map)', async () => {
      const { container } = renderFull();
      await partsOf(container);

      for (const variant of ALL_STATUS_VARIANTS) {
        expect(
          container.querySelector(`[data-part="status"][data-variant="${variant}"]`),
          `status pill variant "${variant}" must reach the DOM`,
        ).not.toBeNull();
      }
    });

    it('distinguishes interactive crumbs from the terminal crumb', async () => {
      const { container } = renderFull();
      await partsOf(container);

      // Two href'd, non-last crumbs render as <a>; the terminal crumb as <span>.
      expect(container.querySelectorAll('[data-part="crumb"][data-interactive="true"]')).toHaveLength(2);
      expect(container.querySelector('[data-part="crumb"][data-last="true"]')).not.toBeNull();
      expect(partCount(container, 'separator')).toBe(2);
    });

    it('reflects sticky + compact as attributes, driven deterministically', async () => {
      const { container } = renderFull({ sticky: true });
      await partsOf(container);

      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      expect(root.getAttribute('data-sticky')).toBe('true');
      expect(root.getAttribute('data-compact')).toBe('false');
      expect(root.getAttribute('data-loading')).toBe('false');

      // isCompact derives from `window.scrollY > 60`. Drive the state, never a
      // real scroll: the scroll position is not a paint value, it only selects
      // between two fixed ones.
      await act(async () => {
        Object.defineProperty(window, 'scrollY', { value: 120, configurable: true, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(root.getAttribute('data-compact')).toBe('true');
      });
    });

    it('stamps the loading skeleton branch (six blocks)', async () => {
      const { container } = renderWithEngine(
        <PatternCockpitHeader title="Event #1234" loading />,
        'modern',
      );
      await partsOf(container);

      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      expect(root.getAttribute('data-loading')).toBe('true');
      expect(partCount(container, 'skeleton')).toBe(6);
    });
  });

  describe('PageShell (modern)', () => {
    function renderFull(props: Record<string, unknown> = {}) {
      return renderWithEngine(
        <PatternPageShell
          title="Users"
          subtitle="Manage platform users"
          breadcrumbs={CRUMBS}
          back={{ label: 'Settings', onClick: noop }}
          badge={<span>beta</span>}
          headerContent={<span>header content</span>}
          actions={<button type="button">Add User</button>}
          tabs={[
            { key: 'all', label: 'All', content: <span>all</span> },
            { key: 'archived', label: 'Archived', content: <span>archived</span> },
          ]}
          activeTab="all"
          onTabChange={noop}
          {...props}
        />,
        'modern',
      );
    }

    it('stamps every part it renders onto the DOM', async () => {
      const { container } = renderFull();
      const parts = await partsOf(container);

      for (const part of [
        'root',
        'header',
        'breadcrumb',
        'separator',
        'crumb',
        'back',
        'header-row',
        'lead',
        'titles',
        'title-row',
        'title',
        'subtitle',
        'actions',
        'header-content',
        'tabs',
        'tab',
        'content',
      ]) {
        expect(parts, `page-shell/modern must stamp data-part="${part}"`).toContain(part);
      }
    });

    it('marks exactly one tab active', async () => {
      const { container } = renderFull();
      await partsOf(container);

      expect(container.querySelectorAll('[data-part="tab"][data-active="true"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="tab"][data-active="false"]')).toHaveLength(1);
    });

    it('marks the back button as labelled (its padding + label branch)', async () => {
      const { container } = renderFull();
      await partsOf(container);
      expect(
        container.querySelector('[data-part="back"][data-has-label="true"]'),
      ).not.toBeNull();
    });

    it('renders the bare rule (not a tab strip) when there are no tabs', async () => {
      const { container } = renderFull({ tabs: undefined, activeTab: undefined });
      const parts = await partsOf(container);

      expect(parts).toContain('rule');
      expect(parts).not.toContain('tabs');
    });

    it('stamps the loading skeleton branch (five blocks)', async () => {
      const { container } = renderWithEngine(<PatternPageShell title="Users" loading />, 'modern');
      await partsOf(container);

      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      expect(root.getAttribute('data-loading')).toBe('true');
      expect(root.className).toContain('ds-pattern-page-shell--loading');
      expect(partCount(container, 'skeleton-group')).toBe(1);
      expect(partCount(container, 'skeleton')).toBe(5);
    });
  });

  describe('PageShell (rustic)', () => {
    function renderFull(props: Record<string, unknown> = {}) {
      return renderWithEngine(
        <PatternPageShell
          title="Users"
          subtitle="Manage platform users"
          breadcrumbs={CRUMBS}
          back={{ label: 'Settings', onClick: noop }}
          badge={<span>beta</span>}
          actions={<button type="button">Add User</button>}
          tabs={[
            { key: 'all', label: 'All', content: <span>all</span> },
            { key: 'archived', label: 'Archived', content: <span>archived</span> },
          ]}
          activeTab="all"
          onTabChange={noop}
          {...props}
        />,
        'rustic',
      );
    }

    it('carries the minted scope class and stamps every part it renders', async () => {
      const { container } = renderFull();
      const parts = await partsOf(container);

      // rustic had NO first-party className before this pre-step -- it passed
      // through only the consumer's own. `ds-pattern-page-shell` is the same
      // free component token modern already carried; `ds-engine-rustic` is the
      // engine marker the shipped detail-panel rustic skin already keys on.
      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      expect(root.className).toContain('ds-pattern-page-shell');
      expect(root.className).toContain('ds-engine-rustic');

      for (const part of [
        'root',
        'breadcrumb',
        'separator',
        'crumb',
        'back',
        'header-row',
        'lead',
        'titles',
        'title-row',
        'title',
        'subtitle',
        'actions',
        'tabs',
        'tab',
      ]) {
        expect(parts, `page-shell/rustic must stamp data-part="${part}"`).toContain(part);
      }
    });

    it('marks exactly one tab active', async () => {
      const { container } = renderFull();
      await partsOf(container);

      expect(container.querySelectorAll('[data-part="tab"][data-active="true"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="tab"][data-active="false"]')).toHaveLength(1);
    });

    it('distinguishes interactive crumbs from plain ones', async () => {
      const { container } = renderFull();
      await partsOf(container);

      expect(container.querySelectorAll('[data-part="crumb"][data-interactive="true"]')).toHaveLength(2);
      expect(container.querySelectorAll('[data-part="crumb"][data-interactive="false"]')).toHaveLength(1);
    });

    it('stamps its loading branch, which is a text line and NOT a skeleton', async () => {
      const { container } = renderWithEngine(<PatternPageShell title="Users" loading />, 'rustic');
      await partsOf(container);

      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      expect(root.getAttribute('data-loading')).toBe('true');
      // Engine asymmetry, preserved: modern renders five pulsing skeleton
      // blocks here; rustic renders the word "Loading...".
      expect(partCount(container, 'skeleton')).toBe(0);
    });
  });

  describe('WorkbenchHeader (modern)', () => {
    function renderFull(props: Record<string, unknown> = {}) {
      return renderWithEngine(
        <PatternWorkbenchHeader
          title="Operations Dashboard"
          subtitle="Morning briefing"
          exceptionCount={3}
          quickActions={ALL_ACTION_VARIANTS.map((variant) => ({
            label: variant,
            onClick: noop,
            variant,
          }))}
          savedViews={[
            { id: 'default', label: 'Default View' },
            { id: 'compact', label: 'Compact View' },
          ]}
          activeViewId="default"
          onViewChange={noop}
          {...props}
        />,
        'modern',
      );
    }

    it('stamps every part it renders onto the DOM', async () => {
      const { container } = renderFull();
      const parts = await partsOf(container);

      for (const part of [
        'root',
        'header-row',
        'lead',
        'titles',
        'title-row',
        'title',
        'exception',
        'subtitle',
        'actions',
        'action',
        'tabs',
        'tab',
      ]) {
        expect(parts, `workbench-header must stamp data-part="${part}"`).toContain(part);
      }
    });

    it('stamps all three quick-action variants (the variantStyles map is 3-way)', async () => {
      const { container } = renderFull();
      await partsOf(container);

      for (const variant of ALL_ACTION_VARIANTS) {
        expect(
          container.querySelector(`[data-part="action"][data-variant="${variant}"]`),
          `quick-action variant "${variant}" must reach the DOM`,
        ).not.toBeNull();
      }
    });

    it('marks exactly one saved-view tab active', async () => {
      const { container } = renderFull();
      await partsOf(container);

      expect(container.querySelectorAll('[data-part="tab"][data-active="true"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="tab"][data-active="false"]')).toHaveLength(1);
    });

    it('stamps the loading skeleton branch (six blocks, one shared PULSE_STYLE)', async () => {
      const { container } = renderWithEngine(
        <PatternWorkbenchHeader title="Operations Dashboard" loading />,
        'modern',
      );
      await partsOf(container);

      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      expect(root.getAttribute('data-loading')).toBe('true');
      expect(partCount(container, 'skeleton')).toBe(6);
    });

    it('renders NO back button -- WorkbenchHeader s BackButton is unreachable', async () => {
      // engines/modern.tsx:135 defines a BackButton. Nothing mounts it, and
      // WorkbenchHeaderProps has no `onBack` field, so no consumer can ask for
      // one. Its three paint sites therefore back no rendered pixel. This
      // assertion pins that: if a back button is ever wired up, it must be a
      // deliberate change with its own baseline, not a migration side effect.
      const { container } = renderFull();
      await partsOf(container);

      expect(container.querySelector('[data-part="back"]')).toBeNull();
      expect(container.querySelector('[aria-label="Go back"]')).toBeNull();
    });
  });
});
