/**
 * The wizard-surface adapt slot (WO-FAM-10): the aside track is resolved through
 * the shared runtime, the postures in force are stamped as `data-posture`, and
 * the surface narrows on its OWN box.
 */
import React from 'react';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WizardSurface } from '..';
import type { WizardSurfaceConfig } from '../../../../../foundation/contracts';
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

function buildConfig(): WizardSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: { title: 'Setup flow' },
      aside: <div>Step guidance</div>,
    },
    behavior: {
      steps: [{ key: 'review', title: 'Review', content: <div>Review the setup</div> }],
      submitAction: { id: 'complete', label: 'Complete setup', variant: 'primary', onClick: vi.fn() },
    },
  };
}

async function renderWizard(
  props: Partial<React.ComponentProps<typeof WizardSurface>> = {},
): Promise<HTMLElement> {
  const view = renderSurface(<WizardSurface config={buildConfig()} {...props} />);
  await screen.findByText('Step guidance');
  return view.container.querySelector('.ds-wizard[data-part="root"]') as HTMLElement;
}

describe('the wizard-surface adapt slot', () => {
  it('stamps the postures in force and keeps the aside track when nothing is adapted', async () => {
    const root = await renderWizard();
    expect(root.getAttribute('data-posture')).toMatch(POSTURE);
    expect(root).toHaveAttribute('data-stacked', 'false');
  });

  it('carries the viewport posture alone until the box has been measured -- the server render', async () => {
    const root = await renderWizard();
    expect(root.getAttribute('data-posture')).toMatch(UNMEASURED);
  });

  it('drops the aside track at a measured compact width and takes it back above the edge', async () => {
    const root = await renderWizard();

    measure(480);
    expect(root.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(root).toHaveAttribute('data-stacked', 'true');

    measure(1200);
    expect(root.getAttribute('data-posture')).toMatch(/ expanded$/);
    expect(root).toHaveAttribute('data-stacked', 'false');
  });

  it('lets an app adapt delta outrank the family default for the same posture', async () => {
    const root = await renderWizard({ adapt: { compact: { stacked: false } } });
    measure(480);
    expect(root.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(root).toHaveAttribute('data-stacked', 'false');
  });
});
