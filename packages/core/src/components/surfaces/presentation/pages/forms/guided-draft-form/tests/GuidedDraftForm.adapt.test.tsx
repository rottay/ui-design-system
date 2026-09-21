/**
 * The guided-draft-form adapt slot (WO-FAM-10) and the ledger doctrine it rides.
 *
 * The surface resolves its stacking and its section navigation through the
 * shared runtime, stamps the postures in force as `data-posture`, and narrows on
 * its OWN box: `adaptive` stays the viewport-keyed baseline and becomes the base
 * layer, the family narrows on a compact box, and `adapt` outranks both. The
 * scroll-mode sections are ledger blocks, not a card stack.
 */
import React from 'react';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { GuidedDraftFormSurface } from '..';
import { renderSurface } from '../../../../../foundation/common/test-utils';

/* The shared setup's ResizeObserver never calls back, so a surface can only
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

const POSTURE = /^(phone|tablet|desktop)( (compact|regular|expanded))?$/;
const UNMEASURED = /^(phone|tablet|desktop)$/;

const SECTIONS = [
  { key: 'info', title: 'Basic info', description: 'What is this called', isComplete: true, render: () => <div>Info fields</div> },
  { key: 'schedule', title: 'Schedule', hasErrors: true, render: () => <div>Schedule fields</div> },
];

async function renderGuided(
  props: Partial<React.ComponentProps<typeof GuidedDraftFormSurface>> = {},
) {
  const view = renderSurface(
    <GuidedDraftFormSurface
      title="Create event"
      subtitle="Drafts save as you type"
      sections={SECTIONS}
      onSubmit={() => undefined}
      {...props}
    />,
  );
  await screen.findByText('Info fields');
  const root = view.container.querySelector('.ds-guided-draft-form[data-part="root"]') as HTMLElement;
  return { view, root };
}

const content = (root: HTMLElement) => root.querySelector('[data-part="content"]') as HTMLElement;
const nav = (root: HTMLElement) => root.querySelector('[data-part="section-nav"]') as HTMLElement;

describe('the guided-draft-form adapt slot', () => {
  it('stamps the postures in force and keeps the sidebar composition when nothing is adapted', async () => {
    const { root } = await renderGuided();
    expect(root.getAttribute('data-posture')).toMatch(POSTURE);
    expect(content(root)).toHaveAttribute('data-layout', 'sidebar');
    expect(nav(root)).toHaveAttribute('data-layout', 'sidebar');
  });

  it('carries the viewport posture alone until the box has been measured -- the server render', async () => {
    const { root } = await renderGuided();
    expect(root.getAttribute('data-posture')).toMatch(UNMEASURED);
  });

  it('stacks and moves the section nav into the dropdown at a measured compact width', async () => {
    const { root } = await renderGuided();

    measure(480);
    expect(root.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(content(root)).toHaveAttribute('data-layout', 'stacked');
    expect(nav(root)).toHaveAttribute('data-layout', 'dropdown');

    measure(1200);
    expect(root.getAttribute('data-posture')).toMatch(/ expanded$/);
    expect(content(root)).toHaveAttribute('data-layout', 'sidebar');
    expect(nav(root)).toHaveAttribute('data-layout', 'sidebar');
  });

  it('keeps the adaptive declaration as the base layer', async () => {
    const { root } = await renderGuided({ adaptive: { xs: { formLayout: 'pill-nav' } } });
    expect(nav(root)).toHaveAttribute('data-layout', 'pills');
  });

  it('lets an adapt delta outrank both the adaptive base and the family default', async () => {
    const { root } = await renderGuided({
      adaptive: { xs: { formLayout: 'pill-nav' } },
      adapt: { compact: { sectionLayout: 'sidebar-nav', stacked: false } },
    });
    measure(480);
    expect(root.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(nav(root)).toHaveAttribute('data-layout', 'sidebar');
    expect(content(root)).toHaveAttribute('data-layout', 'sidebar');
  });
});

describe('the guided-draft-form ledger doctrine', () => {
  it('renders each scroll-mode section as a ledger block, not a card', async () => {
    const { root } = await renderGuided();
    const blocks = root.querySelectorAll('.ds-guided-draft-form__section-card');
    expect(blocks).toHaveLength(SECTIONS.length);
    for (const block of blocks) {
      // The block IS the edit-fields ledger editor; no Card frame wraps it.
      expect(block.classList.contains('ds-edit-fields')).toBe(true);
      expect(block).toHaveAttribute('data-part', 'editor');
      expect(block.querySelector('.rottay-card, [data-part="card-body"]')).toBeNull();
    }
    expect(root.querySelector('[data-part="section-card-header"]')).not.toBeNull();
  });

  it('puts a section\'s fields on the ledger grid, which resolves its own posture', async () => {
    const { root } = await renderGuided();
    const grids = root.querySelectorAll('.ds-guided-draft-form__section-card [data-part="grid"]');
    expect(grids).toHaveLength(SECTIONS.length);
    for (const grid of grids) {
      expect(grid).toHaveAttribute('data-kind', 'primary');
      expect(grid.getAttribute('data-posture')).toMatch(POSTURE);
    }
  });

  it('keeps the section heading level and the state labels the chrome reads', async () => {
    const { root } = await renderGuided();
    expect(screen.getByRole('heading', { level: 1, name: 'Create event' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Basic info' })).toBeInTheDocument();
    expect(root.querySelector('[data-part="section-card-complete"]')).not.toBeNull();
    expect(root.querySelector('[data-part="section-card-errors"]')).not.toBeNull();
    expect(root.querySelector('[data-part="section-card-description"]')).not.toBeNull();
  });

  it('anchors each section so the nav can scroll to it', async () => {
    const { root } = await renderGuided();
    for (const section of SECTIONS) {
      expect(root.querySelector(`#section-${section.key}`)).not.toBeNull();
    }
  });
});
