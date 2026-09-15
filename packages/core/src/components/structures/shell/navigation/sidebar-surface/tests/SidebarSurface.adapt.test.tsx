/**
 * The sidebar surface's adaptation contract (WO-INV-07): the stacked posture
 * is resolved through the shared runtime and stamped as `data-posture`, the
 * legacy stacking config becomes the family's per-posture defaults, and an
 * app's `adapt` deltas outrank them; one `ds-sidebar-surface` vocabulary and
 * nothing painted inline but the runtime track channels.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';

import { SidebarSurface } from '..';
import type { SidebarSurfaceConfig } from '../../../../foundation/chrome/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../../surfaces/foundation/common/test-utils';

function config(visual: SidebarSurfaceConfig['visual'] = {}): SidebarSurfaceConfig {
  return {
    visual,
    presentation: { sidebar: <a href="#a">Overview</a>, content: <span>Body</span> },
    behavior: {},
  };
}

const root = (container: HTMLElement) => container.querySelector('.ds-sidebar-surface[data-part="root"]') as HTMLElement;

describe('SidebarSurface adaptation', () => {
  it('stamps the resolved posture and stacks on a phone by the family default', async () => {
    const view = renderSurface(<SidebarSurface config={config()} />, {
      engine: 'modern',
      responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    await view.findByRole('navigation');
    expect(root(view.container)).toHaveAttribute('data-posture', 'phone');
    expect(root(view.container)).toHaveAttribute('data-stacked', 'true');
  });

  it('lets an app adapt delta outrank the family default for the same posture', async () => {
    const view = renderSurface(
      <SidebarSurface config={config()} adapt={{ phone: { stacked: false } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    await view.findByRole('navigation');
    expect(root(view.container)).toHaveAttribute('data-stacked', 'false');
  });

  it('keeps the legacy stackOnMobile opt-out as the phone default', async () => {
    const view = renderSurface(<SidebarSurface config={config({ stackOnMobile: false })} />, {
      engine: 'modern',
      responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    await view.findByRole('navigation');
    expect(root(view.container)).toHaveAttribute('data-stacked', 'false');
  });

  it('emits ds-sidebar-surface classes only and paints nothing inline but the runtime track channels', async () => {
    const view = renderSurface(
      <SidebarSurface config={config({ sidebarWidth: 240, asideWidth: '18rem', collapsible: true })} />,
      { engine: 'modern' },
    );
    await view.findByRole('navigation');
    const classes = new Set(Array.from(view.container.querySelectorAll('[class]')).flatMap((el) => Array.from(el.classList)));
    const own = [...classes].filter((token) => /sidebar/.test(token));
    expect(own.length).toBeGreaterThan(0);
    expect(own.every((token) => token.startsWith('ds-sidebar-surface'))).toBe(true);
    const inline = root(view.container).getAttribute('style') ?? '';
    for (const declaration of inline.split(';').map((d) => d.trim()).filter(Boolean)) {
      expect(declaration.startsWith('--ds-sidebar-surface-'), `root declares ${declaration}`).toBe(true);
    }
    expect(inline).toContain('--ds-sidebar-surface-inline-size');
    for (const part of ['navigation', 'main', 'panel-body']) {
      expect(view.container.querySelector(`[data-part="${part}"]`)?.getAttribute('style')).toBeNull();
    }
  });

  it('leaves the track to the deriver when the config states no width', async () => {
    const view = renderSurface(<SidebarSurface config={config()} />, { engine: 'modern' });
    await view.findByRole('navigation');
    expect(root(view.container).getAttribute('style') ?? '').not.toContain('--ds-sidebar-surface-inline-size');
  });
});
