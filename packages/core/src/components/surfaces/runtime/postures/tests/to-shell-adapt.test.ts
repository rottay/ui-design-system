import { describe, expect, it } from 'vitest';

import { surfacePosturesToShellAdapt } from '..';

describe('surfacePosturesToShellAdapt', () => {
  it('applies the family defaults when the app declares nothing', () => {
    expect(surfacePosturesToShellAdapt(undefined, 'app-shell')).toEqual({
      phone: { navigation: 'bottom-bar' },
      tablet: { navigation: 'drawer' },
      desktop: { navigation: 'sidebar' },
    });
  });

  it('lets an app delta win over the family default for the same band', () => {
    expect(
      surfacePosturesToShellAdapt({ phone: { navigation: 'drawer' } }, 'app-shell'),
    ).toEqual({
      phone: { navigation: 'drawer' },
      tablet: { navigation: 'drawer' },
      desktop: { navigation: 'sidebar' },
    });
  });

  it('omits bands whose resolved navigation is undefined', () => {
    expect(surfacePosturesToShellAdapt(undefined, 'list')).toEqual({});
    expect(surfacePosturesToShellAdapt(undefined, 'workspace')).toEqual({
      phone: { navigation: 'drawer' },
    });
  });
});
