/** HeaderSurface anatomy: the actions wrapper must not render when there is
 *  nothing to show, so the pattern header's data-has-actions stays honest. */

import React from 'react';
import { screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { HeaderSurface } from '..';
import type { HeaderSurfaceConfig } from '../../../../../foundation/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<HeaderSurfaceConfig>): HeaderSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: { title: 'Workspace' },
    },
    behavior: {},
    ...overrides,
  };
}

describe('HeaderSurface -- modern engine anatomy', () => {
  beforeAll(async () => {
    await import('../../../../../../primitives/navigation/Tabs/engines/modern');
    await import('../../../../../../primitives/inputs/Button/engines/modern');
  });

  it('renders the surface root, both header-content slots, metadata, footer and tabs through the modern engine', async () => {
    const config = buildConfig({
      presentation: {
        chrome: {
          title: 'Team settings',
          headerContent: <div>Page-header rich content</div>,
        },
        description: 'Manage workspace-level content and controls.',
        metadata: <span>Updated just now</span>,
        headerContent: <div>Body-level rich content</div>,
        footer: <div>Footer content</div>,
      },
      behavior: {
        tabs: [
          {
            key: 'overview',
            label: 'Overview',
            badge: <span>2</span>,
            content: <div>Overview panel</div>,
          },
          { key: 'activity', label: 'Activity', disabled: true, content: <div>Activity panel</div> },
        ],
      },
    });

    renderSurface(<HeaderSurface config={config} />, { engine: 'modern' });

    const heading = await screen.findByRole(
      'heading',
      { level: 1, name: 'Team settings' },
      { timeout: 15000 }
    );

    // Anti-vacuity: the modern pattern engine underneath is genuinely active.
    const patternRoot = heading.closest('[data-part="root"]') as HTMLElement;
    expect(patternRoot).toHaveClass('ds-engine-modern');

    const surfaceRoot = document.querySelector('.ds-surface.ds-header[data-part="root"]') as HTMLElement;
    expect(surfaceRoot).toBeInTheDocument();
    expect(surfaceRoot).toHaveAttribute('data-loading', 'false');
    expect(surfaceRoot).toHaveAttribute('data-mobile-compact', 'false');
    expect(surfaceRoot).toHaveAttribute('data-mobile-actions', 'all');

    expect(
      within(surfaceRoot).getByText('Manage workspace-level content and controls.')
    ).toBeInTheDocument();
    expect(within(surfaceRoot).getByText('Updated just now')).toBeInTheDocument();
    expect(within(surfaceRoot).getByText('Footer content')).toBeInTheDocument();

    // The two `headerContent` slots are independent: chrome-level content lands inside the pattern's own page header, while the surface-level field lands...
    const pageHeader = patternRoot.querySelector('[data-part="header"]') as HTMLElement;
    const pageHeaderContent = pageHeader.querySelector('[data-part="header-content"]') as HTMLElement;
    expect(within(pageHeaderContent).getByText('Page-header rich content')).toBeInTheDocument();
    expect(within(surfaceRoot).getByText('Body-level rich content')).toBeInTheDocument();
    expect(pageHeader).not.toHaveTextContent('Body-level rich content');
    expect(surfaceRoot).not.toHaveTextContent('Page-header rich content');

    const tablist = screen.getByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(2);

    const overviewTab = within(tablist).getByRole('tab', { name: /Overview/ });
    expect(within(overviewTab).getByText('2')).toBeInTheDocument();
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');

    const activityTab = within(tablist).getByRole('tab', { name: 'Activity' });
    expect(activityTab).toHaveAttribute('aria-disabled', 'true');
    expect(activityTab).toBeDisabled();
  });

  it('omits the actions region entirely when there is nothing to show', async () => {
    const config = buildConfig({ presentation: { chrome: { title: 'No actions' } } });

    renderSurface(<HeaderSurface config={config} />, { engine: 'modern' });

    await screen.findByRole('heading', { level: 1, name: 'No actions' }, { timeout: 15000 });
    const header = document.querySelector('[data-part="header"]') as HTMLElement;

    expect(header).toHaveAttribute('data-has-actions', 'false');
    expect(header.querySelector('[data-part="actions"]')).not.toBeInTheDocument();
  });

  it('keeps the actions region when only a leading actionsStart node is provided', async () => {
    const config = buildConfig({
      presentation: {
        chrome: { title: 'Leading content only' },
        actionsStart: <div data-testid="leading-status">Synced</div>,
      },
    });

    renderSurface(<HeaderSurface config={config} />, { engine: 'modern' });

    await screen.findByRole('heading', { level: 1, name: 'Leading content only' }, { timeout: 15000 });
    const header = document.querySelector('[data-part="header"]') as HTMLElement;

    expect(header).toHaveAttribute('data-has-actions', 'true');
    expect(within(header).getByTestId('leading-status')).toBeInTheDocument();
  });

  it('keeps the actions region when real actions are provided', async () => {
    const config = buildConfig({
      presentation: { chrome: { title: 'Real actions' } },
      behavior: { actions: [{ id: 'invite', label: 'Invite', onClick: () => undefined }] },
    });

    renderSurface(<HeaderSurface config={config} />, { engine: 'modern' });

    await screen.findByRole('heading', { level: 1, name: 'Real actions' }, { timeout: 15000 });
    const header = document.querySelector('[data-part="header"]') as HTMLElement;

    expect(header).toHaveAttribute('data-has-actions', 'true');
    // The action button is a separate lazy engine boundary from the heading above (SurfaceActionBar's Button, unlike the pattern's own back button, is no...
    expect(await within(header).findByRole('button', { name: 'Invite' }, { timeout: 15000 })).toBeInTheDocument();
  });

  it('drops the actions region on a resolved phone once hideSecondaryActionsOnMobile hides the only leading content and there are no actions', async () => {
    const config = buildConfig({
      visual: { hideSecondaryActionsOnMobile: true },
      presentation: {
        chrome: { title: 'Mobile, nothing left' },
        actionsStart: <div>Status</div>,
      },
    });

    renderSurface(<HeaderSurface config={config} />, {
      engine: 'modern',
      responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });

    await screen.findByRole('heading', { level: 1, name: 'Mobile, nothing left' }, { timeout: 15000 });
    const header = document.querySelector('[data-part="header"]') as HTMLElement;

    expect(header).toHaveAttribute('data-has-actions', 'false');
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
  });

  it('prefers visual.maxWidth over chrome.maxWidth when both are set', async () => {
    const config = buildConfig({
      visual: { maxWidth: 1200 },
      presentation: { chrome: { title: 'Wide page', maxWidth: 800 } },
    });

    renderSurface(<HeaderSurface config={config} />, { engine: 'modern' });

    const heading = await screen.findByRole('heading', { level: 1, name: 'Wide page' }, { timeout: 15000 });
    const root = heading.closest('[data-part="root"]') as HTMLElement;
    expect(root.style.getPropertyValue('--ds-page-shell-max-width')).toBe('1200px');
  });

  it('falls back to chrome.maxWidth when visual.maxWidth is not set', async () => {
    const config = buildConfig({
      presentation: { chrome: { title: 'Chrome-only width', maxWidth: 800 } },
    });

    renderSurface(<HeaderSurface config={config} />, { engine: 'modern' });

    const heading = await screen.findByRole(
      'heading',
      { level: 1, name: 'Chrome-only width' },
      { timeout: 15000 }
    );
    const root = heading.closest('[data-part="root"]') as HTMLElement;
    expect(root.style.getPropertyValue('--ds-page-shell-max-width')).toBe('800px');
  });
});

describe('HeaderSurface actionsStart renderability', () => {
  /** React paints nothing for null/undefined/booleans, but 0 and '' are real nodes. */
  it('renders a zero actionsStart instead of discarding it as falsey', async () => {
    const { container } = renderSurface(
      <HeaderSurface
        config={{
          visual: {},
          presentation: { chrome: { title: 'Queue' }, actionsStart: 0 },
          behavior: {},
        }}
      />,
      { engine: 'modern' },
    );

    await screen.findByText('Queue');
    const actions = container.querySelector('[data-part="actions"]');
    expect(actions).not.toBeNull();
    expect(actions?.textContent).toContain('0');
  });

  it('still omits the actions region for genuinely absent slots', async () => {
    for (const empty of [undefined, null, false]) {
      const { container, unmount } = renderSurface(
        <HeaderSurface
          config={{
            visual: {},
            presentation: { chrome: { title: 'Queue' }, actionsStart: empty },
            behavior: {},
          }}
        />,
        { engine: 'modern' },
      );
      await screen.findByText('Queue');
      expect(container.querySelector('[data-part="actions"]')).toBeNull();
      unmount();
    }
  });
});
