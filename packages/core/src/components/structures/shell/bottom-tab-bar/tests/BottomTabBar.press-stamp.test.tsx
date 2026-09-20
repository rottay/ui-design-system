/**
 * The press stamp behind the skin's icon-pill press rule.
 *
 * The skin dips the icon wrap under `:is([data-state~='pressed'], :active)` and
 * withholds the hover wash under the matching `:not(...)`. The `:active` arm is
 * the platform's fallback; the stamped arm is what a keyboard-driven press and
 * the tenant-difference probe can reach. A twin with no producer is a dead
 * selector, so this pins the producer alongside the pair.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { BottomTabBar } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

beforeAll(async () => {
  await Promise.all([
    import('../engines/modern'),
    import('../../../../primitives/layout/box/engines/modern'),
    import('../../../../primitives/layout/flex/engines/modern'),
    import('../../../../primitives/display/typography/engines/modern'),
  ]);
});

const skin = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/bottom-tab-bar/index.css',
  ),
  'utf8',
);

const items = [
  { key: 'home', label: 'Home', icon: <span>H</span> },
  { key: 'search', label: 'Search', icon: <span>S</span> },
];

describe('BottomTabBar press stamp', () => {
  it('pairs both press selectors with the stamped state', () => {
    expect(skin).toContain(
      ".rottay-bottom-tab-bar__tab[data-part='tab-button']:is([data-state~='pressed'], :active)",
    );
    expect(skin).toContain(":not(:is([data-state~='pressed'], :active)):hover");
    // No bare `:active` arm may remain on this family.
    expect(skin).not.toMatch(/\[data-part='tab-button'\](\[[^\]]*\])*:active[\s.]/u);
    expect(skin).not.toContain(':not(:active)');
  });

  it('carries no data-state at rest and stamps pressed on pointer down', async () => {
    const { container } = renderSurface(
      <BottomTabBar items={items} activeKey="home" />,
      { engine: 'modern' },
    );
    // The engine mounts lazily; the deepest testid is the settle signal.
    await screen.findByTestId('tab-item-home');
    const tab = container.querySelector<HTMLElement>('[data-part="tab-button"]')!;
    expect(tab).not.toBeNull();
    expect(tab.hasAttribute('data-state')).toBe(false);

    fireEvent.pointerDown(tab);
    expect(tab.getAttribute('data-state')?.split(' ')).toContain('pressed');

    fireEvent.pointerUp(tab);
    expect(tab.getAttribute('data-state')?.split(' ') ?? []).not.toContain('pressed');
  });

  it('keeps the selection attribute the skin also reads', async () => {
    const { container } = renderSurface(
      <BottomTabBar items={items} activeKey="home" />,
      { engine: 'modern' },
    );
    await screen.findByTestId('tab-item-home');
    const tabs = container.querySelectorAll<HTMLElement>('[data-part="tab-button"]');
    expect(tabs).toHaveLength(items.length);
    expect(tabs[0].getAttribute('data-selected')).toBe('true');
    expect(tabs[1].getAttribute('data-selected')).toBe('false');
  });
});
