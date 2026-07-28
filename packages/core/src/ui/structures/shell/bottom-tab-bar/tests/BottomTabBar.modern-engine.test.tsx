/**
 * BottomTabBar modern-engine contract tests (R2+R3).
 *
 * Unlike `BottomTabBar.test.tsx` — which swaps the engine factory for a mock —
 * this suite renders the REAL runtime through the provider stack with the
 * modern engine forced, and pins the properties the R2+R3 pass owns:
 *
 * - navigation-landmark a11y (`<nav>` + accessible name, `aria-current="page"`,
 *   no leftover tablist/tab semantics)
 * - the complete `data-part` anatomy the skin paints from
 * - zero inline layout/typography on the parts (the skin owns 100% of paint)
 * - the i18n English floor for the landmark name
 */

import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { BottomTabBar } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

/**
 * Pre-load the modern engine modules so the lazy `createEngineComponent`
 * imports resolve synchronously inside the test environment.
 */
beforeAll(async () => {
  await Promise.all([
    import('../engines/modern'),
    import('../../../../primitives/layout/Box/engines/modern'),
    import('../../../../primitives/layout/Flex/engines/modern'),
    import('../../../../primitives/display/Typography/engines/modern'),
  ]);
});

const items = [
  { key: 'home', label: 'Home', icon: <span data-testid="icon-home">H</span> },
  { key: 'search', label: 'Search', icon: <span data-testid="icon-search">S</span> },
  { key: 'alerts', label: 'Alerts', icon: <span data-testid="icon-alerts">A</span>, badge: 120 },
];

function renderModern(ui: React.ReactElement) {
  return renderSurface(ui, { engine: 'modern' });
}

describe('BottomTabBar (modern engine)', () => {
  it('is a navigation landmark with the i18n English floor as accessible name', async () => {
    renderModern(<BottomTabBar items={items} />);
    expect(
      await screen.findByRole('navigation', { name: 'Bottom navigation' }),
    ).toBeInTheDocument();
  });

  it('marks the active item with aria-current and drops tab semantics', async () => {
    const { container } = renderModern(<BottomTabBar items={items} activeKey="search" />);

    const search = await screen.findByTestId('tab-item-search');
    expect(search).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('tab-item-home')).not.toHaveAttribute('aria-current');

    // A tab role without an owned tabpanel is a broken APG tabs pattern; the
    // bar is a plain navigation landmark now.
    expect(container.querySelector('[role="tablist"]')).toBeNull();
    expect(container.querySelector('[role="tab"]')).toBeNull();
  });

  it('stamps the complete data-part anatomy the skin paints from', async () => {
    const { container } = renderModern(<BottomTabBar items={items} activeKey="home" />);
    await screen.findByTestId('bottom-tab-bar');

    for (const part of ['root', 'list', 'tab-button', 'icon-wrap', 'icon', 'label']) {
      expect(container.querySelector(`[data-part="${part}"]`), `missing data-part="${part}"`).not.toBeNull();
    }

    const badge = container.querySelector('[data-part="badge"]');
    expect(badge).not.toBeNull();
    expect(container.querySelector('[data-part="badge-text"]')).toHaveTextContent('99+');
    // 120 > 99, so the wide badge variant is stamped for the skin.
    expect(badge).toHaveAttribute('data-wide', 'true');

    const activeTab = screen.getByTestId('tab-item-home');
    expect(activeTab).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('tab-item-search')).toHaveAttribute('data-selected', 'false');
  });

  it('renders link items as anchors and action items as buttons', async () => {
    renderModern(
      <BottomTabBar
        items={[
          { key: 'docs', label: 'Docs', icon: <span>D</span>, href: '/docs' },
          { key: 'act', label: 'Act', icon: <span>A</span> },
        ]}
      />,
    );

    const docs = await screen.findByTestId('tab-item-docs');
    expect(docs.tagName).toBe('A');
    expect(docs).toHaveAttribute('href', '/docs');
    expect(screen.getByTestId('tab-item-act').tagName).toBe('BUTTON');
  });

  it('invokes onChange with the item key', async () => {
    const onChange = vi.fn();
    renderModern(<BottomTabBar items={items} onChange={onChange} />);
    fireEvent.click(await screen.findByTestId('tab-item-search'));
    expect(onChange).toHaveBeenCalledWith('search');
  });

  it('paints no layout or typography inline on its parts', async () => {
    const { container } = renderModern(<BottomTabBar items={items} activeKey="home" />);
    await screen.findByTestId('bottom-tab-bar');

    // The skin owns 100% of layout and paint; the engine may only stamp
    // data hooks. Spot-pin the properties that used to be inline.
    const tab = container.querySelector('[data-part="tab-button"]') as HTMLElement;
    expect(tab.style.display).toBe('');
    expect(tab.style.paddingTop).toBe('');
    expect(tab.style.cursor).toBe('');

    const badge = container.querySelector('[data-part="badge"]') as HTMLElement;
    expect(badge.style.position).toBe('');
    expect(badge.style.top).toBe('');

    const badgeText = container.querySelector('[data-part="badge-text"]') as HTMLElement;
    expect(badgeText.style.color).toBe('');
    expect(badgeText.style.fontSize).toBe('');

    const label = container.querySelector('[data-part="label"]') as HTMLElement;
    expect(label.style.fontSize).toBe('');
    expect(label.style.fontWeight).toBe('');

    const root = screen.getByTestId('bottom-tab-bar');
    expect(root.style.position).toBe('');
  });
});
