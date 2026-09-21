/**
 * The form-surface adapt slot (WO-FAM-10): the surface resolves its stacking
 * through the shared runtime, stamps the postures in force as `data-posture`,
 * and narrows on its OWN box -- the measurements below are container widths,
 * not viewport ones.
 */
import React from 'react';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FormSurface } from '..';
import type { FormSurfaceConfig } from '../../../../../foundation/contracts';
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

function buildConfig(): FormSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: { title: 'Create record' },
      aside: <div>Guidance</div>,
    },
    behavior: {
      fields: [],
      submitAction: { id: 'submit', label: 'Create record', variant: 'primary', onClick: vi.fn() },
    },
  };
}

async function renderForm(
  props: Partial<React.ComponentProps<typeof FormSurface>> = {},
): Promise<HTMLElement> {
  const view = renderSurface(<FormSurface config={buildConfig()} {...props} />);
  await screen.findByText('Guidance');
  return view.container.querySelector('.ds-form-surface[data-part="root"]') as HTMLElement;
}

describe('the form-surface adapt slot', () => {
  it('stamps the postures in force and keeps the declared stacking when nothing is adapted', async () => {
    const root = await renderForm();
    expect(root.getAttribute('data-posture')).toMatch(POSTURE);
    expect(root).toHaveAttribute('data-stacked', 'false');
  });

  it('carries the viewport posture alone until the box has been measured -- the server render', async () => {
    const root = await renderForm();
    expect(root.getAttribute('data-posture')).toMatch(UNMEASURED);
  });

  it('stacks at a measured compact width and returns its aside track above the edge', async () => {
    const root = await renderForm();

    // 480px is inside the balanced ladder's compact band (<= 639px).
    measure(480);
    expect(root.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(root).toHaveAttribute('data-stacked', 'true');

    // 1200px is above the standard edge (839px).
    measure(1200);
    expect(root.getAttribute('data-posture')).toMatch(/ expanded$/);
    expect(root).toHaveAttribute('data-stacked', 'false');
  });

  it('lets an app adapt delta outrank the family default for the same posture', async () => {
    const root = await renderForm({ adapt: { compact: { stacked: false } } });
    measure(480);
    expect(root.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(root).toHaveAttribute('data-stacked', 'false');
  });

  it('ignores a delta declared for a posture that is not in force', async () => {
    const root = await renderForm({ adapt: { expanded: { stacked: true } } });
    measure(480);
    expect(root).toHaveAttribute('data-stacked', 'true');
    measure(720);
    expect(root).toHaveAttribute('data-stacked', 'false');
  });
});
