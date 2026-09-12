import { describe, expect, it } from 'vitest';

import type { SurfaceAdaptivePosture } from '..';
import { resolveSurfacePosture } from '..';

describe('adaptive surface posture resolution', () => {
  it('carries a desktop-only posture at desktop and leaves the narrower steps alone', () => {
    // The cascade is MOBILE-FIRST now: a step inherits what is declared at or
    // below it, so a posture declared only at `desktop` is a desktop posture.
    // The old `AdaptiveConfig` merged the other way -- desktop fell through to
    // tablet and phone -- which is the inversion this replaces.
    const declaration: SurfaceAdaptivePosture = {
      desktop: { pane: 'route' },
    };

    expect(resolveSurfacePosture(declaration, 'lg').pane).toBe('route');
    expect(resolveSurfacePosture(declaration, 'xl').pane).toBe('route');
    expect(resolveSurfacePosture(declaration, 'sm').pane).toBeUndefined();
    expect(resolveSurfacePosture(declaration, 'xs').pane).toBeUndefined();
  });

  it('cascades a phone posture upward until a wider step restates it', () => {
    const declaration: SurfaceAdaptivePosture = {
      phone: { pane: 'route' },
      desktop: { pane: 'inline' },
    };

    expect(resolveSurfacePosture(declaration, 'xs').pane).toBe('route');
    expect(resolveSurfacePosture(declaration, 'sm').pane).toBe('route');
    expect(resolveSurfacePosture(declaration, 'md').pane).toBe('route');
    expect(resolveSurfacePosture(declaration, 'lg').pane).toBe('inline');
  });

  it('merges fields across steps instead of replacing the whole posture', () => {
    const declaration: SurfaceAdaptivePosture = {
      phone: { collection: 'cards', compactHeader: true },
      desktop: { collection: 'table' },
    };

    expect(resolveSurfacePosture(declaration, 'lg')).toEqual({
      collection: 'table',
      compactHeader: true,
    });
  });

  it('reads the canonical steps and the device aliases as the same ladder', () => {
    const aliases: SurfaceAdaptivePosture = { phone: { pane: 'sheet' }, tablet: { pane: 'inline' } };
    const canonical: SurfaceAdaptivePosture = { xs: { pane: 'sheet' }, sm: { pane: 'inline' } };

    for (const step of ['xs', 'sm', 'md', 'lg'] as const) {
      expect(resolveSurfacePosture(aliases, step)).toEqual(
        resolveSurfacePosture(canonical, step),
      );
    }
  });

  it('cascades bounded card-grid columns across breakpoints', () => {
    const declaration: SurfaceAdaptivePosture = {
      phone: { collection: 'cards', gridColumns: 1 },
      tablet: { gridColumns: 2 },
      desktop: { gridColumns: 3 },
    };

    expect(resolveSurfacePosture(declaration, 'xs').gridColumns).toBe(1);
    expect(resolveSurfacePosture(declaration, 'sm').gridColumns).toBe(2);
    expect(resolveSurfacePosture(declaration, 'lg').gridColumns).toBe(3);
  });

  it.each([-1, 0, 1.5, 7, Number.NaN, Number.POSITIVE_INFINITY])(
    'fails closed for an invalid card-grid column count (%s)',
    (gridColumns) => {
      const declaration: SurfaceAdaptivePosture = {
        desktop: { collection: 'cards', gridColumns },
      };

      expect(resolveSurfacePosture(declaration, 'lg')).toEqual({ collection: 'cards' });
    },
  );

  it('answers an empty posture for an absent declaration', () => {
    expect(resolveSurfacePosture(undefined, 'lg')).toEqual({});
    expect(resolveSurfacePosture({}, 'lg')).toEqual({});
  });
});
