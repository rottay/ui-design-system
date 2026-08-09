/** SidebarSurface anatomy: the navigation slot is a real landmark and the
 *  collapse toggle carries disclosure semantics. */

import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SidebarSurface } from '..';
import type { SidebarSurfaceConfig } from '../../../../foundation/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../foundation/common/test-utils';

function buildAnatomyConfig(withAside: boolean): SidebarSurfaceConfig {
  return {
    visual: { collapsible: true, bordered: true },
    presentation: {
      header: <span>Workspace header</span>,
      sidebar: <a href="#overview">Overview</a>,
      content: <span>Main content</span>,
      footer: <span>Footer note</span>,
      ...(withAside ? { aside: <span>Context rail</span> } : {}),
    },
    behavior: {},
  };
}

describe('SidebarSurface anatomy', () => {
  it('exposes a real navigation landmark plus distinct data-part hooks for panel, main, and aside', async () => {
    const withAside = renderSurface(<SidebarSurface config={buildAnatomyConfig(true)} />, {
      engine: 'modern',
    });

    const nav = await withAside.findByRole('navigation');
    expect(nav).toHaveAttribute('data-part', 'navigation');

    // Anti-vacuity: the role query and the data-part query must resolve to the exact same element, not two unrelated nodes that both happen to satisfy th...
    const navByPart = withAside.container.querySelector('.ds-sidebar__navigation[data-part="navigation"]');
    expect(navByPart).toBe(nav);

    // Card's own root always self-stamps `data-part="root"` in every engine (classic hardcodes it; modern/rustic spread `partAttributes('root', ...)` aft...
    const panel = withAside.container.querySelector('.ds-sidebar__panel[data-part="root"]');
    expect(panel).not.toBeNull();
    expect(panel?.contains(nav)).toBe(true);

    const aside = withAside.container.querySelector('.ds-sidebar__aside[data-part="root"]');
    expect(aside).not.toBeNull();
    expect(aside?.textContent).toContain('Context rail');
    // Anti-vacuity: panel and aside must be two distinct 'root'-tagged
    // elements, not the same node matched twice by an overlapping selector.
    expect(aside).not.toBe(panel);

    const main = withAside.container.querySelector('.ds-sidebar__main[data-part="main"]');
    expect(main).not.toBeNull();
    expect(main?.textContent).toContain('Workspace header');
    expect(main?.textContent).toContain('Main content');

    withAside.unmount();

    // Anti-vacuity for the aside hook: it must be genuinely conditional, not
    // an always-present node the first assertion happened to match.
    const withoutAside = renderSurface(<SidebarSurface config={buildAnatomyConfig(false)} />, {
      engine: 'modern',
    });
    await withoutAside.findByRole('navigation');
    expect(withoutAside.container.querySelector('.ds-sidebar__aside')).toBeNull();
  });

  it('keeps the collapse toggle keyboard-reachable and its aria-controls linkage real', async () => {
    const onCollapsedChange = vi.fn();
    const user = userEvent.setup();
    const config: SidebarSurfaceConfig = {
      visual: { collapsible: true },
      presentation: {
        sidebar: <span>Nav content</span>,
        content: <span>Body content</span>,
      },
      behavior: { onCollapsedChange },
    };

    renderSurface(<SidebarSurface config={config} />, { engine: 'modern' });

    const toggle = await screen.findByRole('button', { name: 'Collapse' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const controlsId = toggle.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    // Anti-vacuity: aria-controls must resolve to the real navigation
    // landmark in the DOM, not merely to a plausible-looking id string.
    const nav = screen.getByRole('navigation');
    expect(document.getElementById(controlsId as string)).toBe(nav);

    await user.tab();
    expect(document.activeElement).toBe(toggle);

    await user.keyboard('{Enter}');

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(await screen.findByRole('button', { name: 'Expand' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('reflects config-driven stacking rather than a hardcoded attribute', async () => {
    // The surface root, panel Card, and aside Card all carry data-part='root', so the query must pin the outer surface root specifically via its ds-surfa...
    const defaultStacking = renderSurface(
      <SidebarSurface config={buildAnatomyConfig(false)} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    await defaultStacking.findByRole('navigation');
    const stackedRoot = defaultStacking.container.querySelector('.ds-surface.ds-sidebar[data-part="root"]');
    expect(stackedRoot).toHaveAttribute('data-stacked', 'true');
    defaultStacking.unmount();

    const optedOutConfig = buildAnatomyConfig(false);
    optedOutConfig.visual.stackOnMobile = false;
    const optedOut = renderSurface(<SidebarSurface config={optedOutConfig} />, {
      engine: 'modern',
      responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    await optedOut.findByRole('navigation');
    const unstackedRoot = optedOut.container.querySelector('.ds-surface.ds-sidebar[data-part="root"]');
    expect(unstackedRoot).toHaveAttribute('data-stacked', 'false');
  });

  it('renders behavior.actions as individually actionable, access-respecting controls inside the panel', async () => {
    const onApprove = vi.fn();
    const onArchive = vi.fn();
    const config: SidebarSurfaceConfig = {
      visual: { collapsible: false },
      presentation: {
        sidebar: <span>Nav content</span>,
        content: <span>Body content</span>,
      },
      behavior: {
        actions: [
          { id: 'approve', label: 'Approve', onClick: onApprove },
          { id: 'archive', label: 'Archive', disabled: true, onClick: onArchive },
        ],
      },
    };

    const { container } = renderSurface(<SidebarSurface config={config} />, { engine: 'modern' });

    const panel = await (async () => {
      await screen.findByText('Approve');
      return container.querySelector('.ds-sidebar__panel');
    })();
    expect(panel).not.toBeNull();

    const scoped = within(panel as HTMLElement);
    const approveButton = scoped.getByRole('button', { name: 'Approve' });
    const archiveButton = scoped.getByRole('button', { name: 'Archive' });

    expect(archiveButton).toBeDisabled();

    const user = userEvent.setup();
    await user.click(approveButton);
    expect(onApprove).toHaveBeenCalledTimes(1);

    await user.click(archiveButton);
    expect(onArchive).not.toHaveBeenCalled();
  });
});
