import { describe, expect, it } from 'vitest';

import type { AdaptiveConfig } from '..';
import { resolvePosture } from '..';

describe('adaptive surface posture resolution', () => {
  it('cascades a desktop route posture through tablet and phone', () => {
    const config: AdaptiveConfig = {
      desktop: { pane: 'route' },
    };

    expect(resolvePosture(config, 'desktop').pane).toBe('route');
    expect(resolvePosture(config, 'tablet').pane).toBe('route');
    expect(resolvePosture(config, 'phone').pane).toBe('route');
  });

  it('cascades a tablet route posture to phone without changing desktop', () => {
    const config: AdaptiveConfig = {
      desktop: { pane: 'inline' },
      tablet: { pane: 'route' },
    };

    expect(resolvePosture(config, 'desktop').pane).toBe('inline');
    expect(resolvePosture(config, 'tablet').pane).toBe('route');
    expect(resolvePosture(config, 'phone').pane).toBe('route');
  });

  it('keeps a phone route posture scoped to phone', () => {
    const config: AdaptiveConfig = {
      desktop: { pane: 'inline' },
      tablet: { pane: 'sheet' },
      phone: { pane: 'route' },
    };

    expect(resolvePosture(config, 'desktop').pane).toBe('inline');
    expect(resolvePosture(config, 'tablet').pane).toBe('sheet');
    expect(resolvePosture(config, 'phone').pane).toBe('route');
  });
});
