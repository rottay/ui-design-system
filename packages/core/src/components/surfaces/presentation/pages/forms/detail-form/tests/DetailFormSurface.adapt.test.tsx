/**
 * The detail-form-surface adapt slot (WO-FAM-10): the split/stacked decision is
 * resolved through the shared runtime, the postures in force are stamped as
 * `data-posture`, and the surface narrows on its OWN box.
 */
import React from 'react';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DetailFormSurface } from '..';
import type { DetailFormSurfaceConfig } from '../../../../../foundation/contracts';
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

function buildConfig(): DetailFormSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: { title: 'Edit workspace' },
      summary: <div>Workspace summary</div>,
    },
    behavior: {
      fields: [],
      submitAction: { id: 'save', label: 'Save changes', variant: 'primary', onClick: vi.fn() },
    },
  };
}

async function renderDetail(
  props: Partial<React.ComponentProps<typeof DetailFormSurface>> = {},
): Promise<HTMLElement> {
  const view = renderSurface(<DetailFormSurface config={buildConfig()} {...props} />);
  await screen.findByText('Workspace summary');
  const root = () => view.container.querySelector('.ds-detail-form[data-part="root"]') as HTMLElement;
  // The stacked and split branches are different elements, so every assertion
  // re-queries rather than holding the first one.
  return new Proxy({} as HTMLElement, {
    get: (_t, key) => {
      const node = root() as unknown as Record<string | symbol, unknown>;
      const value = node[key];
      return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(node) : value;
    },
  });
}

describe('the detail-form-surface adapt slot', () => {
  it('stamps the postures in force and keeps the split layout when nothing is adapted', async () => {
    const root = await renderDetail();
    expect(root.getAttribute('data-posture')).toMatch(POSTURE);
    expect(root.getAttribute('data-stacked')).toBe('false');
    expect(root.className).toContain('ds-detail-form--split');
  });

  it('carries the viewport posture alone until the box has been measured -- the server render', async () => {
    const root = await renderDetail();
    expect(root.getAttribute('data-posture')).toMatch(UNMEASURED);
  });

  it('stacks the summary under the form at a measured compact width and splits again above the edge', async () => {
    const root = await renderDetail();

    measure(480);
    expect(root.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(root.getAttribute('data-stacked')).toBe('true');
    expect(root.className).toContain('ds-detail-form--stacked');

    measure(1200);
    expect(root.getAttribute('data-posture')).toMatch(/ expanded$/);
    expect(root.getAttribute('data-stacked')).toBe('false');
    expect(root.className).toContain('ds-detail-form--split');
  });

  it('lets an app adapt delta outrank the family default for the same posture', async () => {
    const root = await renderDetail({ adapt: { compact: { stacked: false } } });
    measure(480);
    expect(root.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(root.getAttribute('data-stacked')).toBe('false');
  });
});
