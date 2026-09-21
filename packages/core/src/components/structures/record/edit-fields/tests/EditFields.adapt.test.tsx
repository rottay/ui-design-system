/**
 * The edit-fields adapt slot (WO-FAM-10): the field region resolves its tracks
 * through the shared runtime, stamps the postures in force as `data-posture`,
 * and narrows on its OWN box -- the measurement below is a container width, not
 * a viewport.
 */
import React from 'react';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import { InlineEditField, InlineEditGrid } from '..';

/* The shared setup's ResizeObserver never calls back, so the region can only
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

const THREE_TRACKS = 'repeat(3, minmax(0, 1fr))';
const ONE_TRACK = 'minmax(0, 1fr)';

async function renderGrid(
  props: Partial<React.ComponentProps<typeof InlineEditGrid>> = {},
): Promise<HTMLElement> {
  const view = renderSurface(
    <InlineEditGrid columns={THREE_TRACKS} {...props}>
      <InlineEditField label="Name" htmlFor="name">
        <input id="name" aria-label="Name" />
      </InlineEditField>
    </InlineEditGrid>,
    { engine: 'modern' },
  );
  await screen.findByLabelText('Name');
  return view.container.querySelector('[data-part="grid"]') as HTMLElement;
}

const tracks = (grid: HTMLElement): string =>
  grid.style.getPropertyValue('--ds-edit-fields-grid-columns');

describe('the edit-fields adapt slot', () => {
  it('keeps the declared tracks and stamps the postures in force when nothing is adapted', async () => {
    const grid = await renderGrid();
    expect(tracks(grid)).toBe(THREE_TRACKS);
    expect(grid.getAttribute('data-posture')).toMatch(/^(phone|tablet|desktop)( (compact|regular|expanded))?$/);
  });

  it('carries the viewport posture alone until the box has been measured -- the server render', async () => {
    const grid = await renderGrid();
    expect(grid.getAttribute('data-posture')).toMatch(/^(phone|tablet|desktop)$/);
  });

  it('falls to the single-track ledger at a measured compact width and returns above it', async () => {
    const grid = await renderGrid();

    // 480px is inside the balanced ladder's compact band (<= 639px).
    measure(480);
    expect(grid.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(tracks(grid)).toBe(ONE_TRACK);

    // 1200px is above the standard edge (839px), so the caller's tracks return.
    measure(1200);
    expect(grid.getAttribute('data-posture')).toMatch(/ expanded$/);
    expect(tracks(grid)).toBe(THREE_TRACKS);
  });

  it('reports the regular band between the two edges and keeps the declared tracks there', async () => {
    const grid = await renderGrid();
    measure(720);
    expect(grid.getAttribute('data-posture')).toMatch(/ regular$/);
    expect(tracks(grid)).toBe(THREE_TRACKS);
  });

  it('lets an app adapt delta outrank the family default for the same posture', async () => {
    const grid = await renderGrid({ adapt: { compact: { columns: 'repeat(2, minmax(0, 1fr))' } } });
    measure(480);
    expect(grid.getAttribute('data-posture')).toMatch(/ compact$/);
    expect(tracks(grid)).toBe('repeat(2, minmax(0, 1fr))');
  });

  it('ignores a delta declared for a posture that is not in force', async () => {
    const grid = await renderGrid({ adapt: { expanded: { columns: 'repeat(6, minmax(0, 1fr))' } } });
    measure(480);
    expect(tracks(grid)).toBe(ONE_TRACK);
  });
});
