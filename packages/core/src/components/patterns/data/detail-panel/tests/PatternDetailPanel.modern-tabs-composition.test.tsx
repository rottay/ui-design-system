import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DetailPanelProps, DetailTab } from '../contracts';
import { RecipeProfileProvider } from '@/infrastructure/runtime/foundation/recipes/profiles';
import ModernDetailPanel from '../engines/modern';

type Customer = { id: string };

const TABS: DetailTab[] = [
  { key: 'overview', label: 'Overview', content: <div>Overview tab</div>, badge: 3 },
  { key: 'phase', label: 'Phase 2', content: <div>Phase tab</div> },
  { key: 'locked', label: 'Locked', content: <div>Locked tab</div>, disabled: true, badge: 'New' },
  { key: 'audit', label: 'Audit', content: <div>Audit tab</div> },
];

function props(overrides: Partial<DetailPanelProps<Customer>> = {}): DetailPanelProps<Customer> {
  return { data: { id: 'c1' }, title: 'Acme Corp', tabs: TABS, ...overrides };
}

describe('Modern DetailPanel composes the canonical Tabs', () => {
  it('renders its strip as the Tabs primitive, with the tablist named by the pattern copy', () => {
    const { container } = render(<ModernDetailPanel {...props()} />);
    const tablist = screen.getByRole('tablist', { name: 'Detail panel tabs' });
    expect(tablist.closest('.ds-tabs.ds-tabs--modern')).not.toBeNull();
    expect(container.querySelector('.ds-tabs')).toHaveAttribute('data-variant', 'contained');
    expect(screen.getByRole('tabpanel').querySelector('[data-part="panel-surface"]')).toHaveTextContent('Overview tab');
  });

  it('keeps labels whole, maps badges and the disabled tab', () => {
    render(<ModernDetailPanel {...props()} />);
    const [overview, phase, locked] = screen.getAllByRole('tab');
    expect(phase).toHaveTextContent('Phase 2');
    expect(phase.querySelector('[data-part="tab-badge"]')).toBeNull();
    expect(overview.querySelector('[data-part="tab-badge"]')).toHaveTextContent('3');
    expect(locked.querySelector('[data-part="tab-badge"]')).toHaveTextContent('New');
    expect(locked).toBeDisabled();
  });

  it('gives every tab and panel an id unique to its instance (the former tab-${key}/panel-${key} collided)', () => {
    render(
      <>
        <div data-testid="a"><ModernDetailPanel {...props()} /></div>
        <div data-testid="b"><ModernDetailPanel {...props()} /></div>
      </>,
    );
    const ids = screen.getAllByRole('tab').map((tab) => tab.id).concat(screen.getAllByRole('tabpanel').map((panel) => panel.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const scope of [screen.getByTestId('a'), screen.getByTestId('b')]) {
      const panel = within(scope).getByRole('tabpanel');
      expect(within(scope).getAllByRole('tab')[0]).toHaveAttribute('aria-controls', panel.id);
    }
  });

  it('activates on click and on the keyboard, skips the disabled tab and never activates it', () => {
    const onTabChange = vi.fn();
    render(<ModernDetailPanel {...props({ onTabChange })} />);
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]);
    expect(onTabChange).not.toHaveBeenCalled();

    tabs[1].focus();
    fireEvent.keyDown(tabs[1], { key: 'ArrowRight' });
    expect(tabs[3]).toHaveFocus();
    expect(onTabChange).toHaveBeenLastCalledWith('audit');
    fireEvent.keyDown(tabs[3], { key: 'Home' });
    expect(tabs[0]).toHaveFocus();
    fireEvent.keyDown(tabs[0], { key: 'End' });
    expect(tabs[3]).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Audit tab');

    fireEvent.click(tabs[1]);
    expect(onTabChange).toHaveBeenLastCalledWith('phase');
  });

  it('holds exactly one tab stop, on the selected tab', () => {
    render(<ModernDetailPanel {...props({ activeTab: 'audit' })} />);
    const stops = screen.getAllByRole('tab').filter((tab) => tab.tabIndex === 0);
    expect(stops).toHaveLength(1);
    expect(stops[0]).toHaveAccessibleName('Audit');
    expect(stops[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('yields the Tabs recipe to the tenant recipe profile, contained as the fallback', () => {
    const { container } = render(
      <RecipeProfileProvider profileId="rottay/technical-sharp@1">
        <ModernDetailPanel {...props()} />
      </RecipeProfileProvider>,
    );
    expect(container.querySelector('.ds-tabs')).toHaveAttribute('data-variant', 'underline');
  });
});
