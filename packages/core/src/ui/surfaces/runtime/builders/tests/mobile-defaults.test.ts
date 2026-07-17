/**
 * @fileoverview Tests for the surface builders with productive callers.
 */

import { describe, expect, it } from 'vitest';

import {
  createAuthSurfaceConfig,
  createFormSurfaceConfig,
  createMarketingSurfaceConfig,
} from '..';

describe('productive surface config builders', () => {
  it('injects only form defaults consumed by the renderer', () => {
    const config = createFormSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Form' } },
      behavior: { fields: [] },
    } as any);

    expect(config.visual.maxWidth).toBe('100%');
    expect(config.visual.hideAsideOnMobile).toBe(true);
    expect(config.visual.mobileActionsSticky).toBe(true);
  });

  it('preserves explicit form overrides', () => {
    const config = createFormSurfaceConfig({
      visual: {
        maxWidth: 720,
        hideAsideOnMobile: false,
        mobileActionsSticky: false,
      },
      presentation: { chrome: { title: 'Form' } },
      behavior: { fields: [] },
    } as any);

    expect(config.visual.maxWidth).toBe(720);
    expect(config.visual.hideAsideOnMobile).toBe(false);
    expect(config.visual.mobileActionsSticky).toBe(false);
  });

  it('keeps productive responsive defaults for auth and marketing', () => {
    const auth = {
      visual: {},
      presentation: { title: 'Sign in' },
      behavior: {},
    } as any;
    const marketing = {
      visual: {},
      presentation: { title: 'Launch' },
      behavior: {},
    } as any;

    expect(createAuthSurfaceConfig(auth).visual.stackOnMobile).toBe(true);
    expect(createMarketingSurfaceConfig(marketing).visual.stackOnMobile).toBe(true);
  });
});
