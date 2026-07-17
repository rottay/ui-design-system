import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ClassicPageShell from '../engines/classic';
import ModernPageShell from '../engines/modern';
import RusticPageShell from '../engines/rustic';
import type { PageShellProps } from '../contracts';

const ENGINE_COMPONENTS = [
  ['classic', ClassicPageShell],
  ['modern', ModernPageShell],
  ['rustic', RusticPageShell],
] as const;

function buildProps(overrides: Partial<PageShellProps> = {}): PageShellProps {
  return {
    title: 'Launchpad',
    subtitle: <span>Ready for launch</span>,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Projects', onClick: vi.fn() },
      { label: 'Launchpad' },
    ],
    actions: <button type="button">Create</button>,
    tabs: [
      { key: 'overview', label: 'Overview', content: <div>Overview content</div> },
      { key: 'activity', label: 'Activity', content: <div>Activity content</div> },
    ],
    activeTab: 'overview',
    onTabChange: vi.fn(),
    children: <div>Fallback content</div>,
    back: { label: 'Back', onClick: vi.fn() },
    badge: <span>Beta</span>,
    maxWidth: 960,
    ...overrides,
  };
}

describe('PatternPageShell advanced engine coverage', () => {
  it.each(ENGINE_COMPONENTS)(
    'covers loading and child-only branches in the %s engine',
    (engine, Component) => {
      const { rerender, container } = render(
        <Component {...buildProps({ loading: true })} />
      );

      if (engine === 'classic') {
        expect(container.querySelector('.ant-spin')).toBeTruthy();
      } else if (engine === 'modern') {
        expect(container.querySelector('.ds-pattern-page-shell--loading')).toBeTruthy();
        expect(container.querySelector('.ds-pattern-page-shell__loading-skeleton')).toBeTruthy();
      } else {
        expect(container.textContent?.toLowerCase()).toContain('loading');
      }

      rerender(
        <Component
          {...buildProps({
            subtitle: undefined,
            breadcrumbs: [],
            actions: undefined,
            tabs: undefined,
            back: undefined,
            badge: undefined,
          })}
        />
      );

      expect(screen.getByText('Fallback content')).toBeInTheDocument();
      expect(screen.queryByText('Overview content')).not.toBeInTheDocument();
    }
  );

  it.each(ENGINE_COMPONENTS)(
    'renders breadcrumbs, back action, tabs, and callbacks in the %s engine',
    (engine, Component) => {
      const onProjectsClick = vi.fn();
      const onBack = vi.fn();
      const onTabChange = vi.fn();

      render(
        <Component
          {...buildProps({
            breadcrumbs: [
              { label: 'Home', href: '/home' },
              { label: 'Projects', onClick: onProjectsClick },
              { label: 'Launchpad' },
            ],
            back: { label: 'Back', onClick: onBack },
            onTabChange,
          })}
        />
      );

      expect(screen.getAllByText('Launchpad').length).toBeGreaterThan(0);
      expect(screen.getByText('Ready for launch')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByText('Overview content')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Projects'));
      fireEvent.click(screen.getByRole('button', { name: /back/i }));

      expect(onProjectsClick).toHaveBeenCalledTimes(1);
      expect(onBack).toHaveBeenCalledTimes(1);

      const tabTrigger =
        engine === 'classic'
          ? screen.getByText('Activity')
          : engine === 'modern'
            ? screen.getByRole('tab', { name: 'Activity' })
            : screen.getByRole('button', { name: 'Activity' });

      fireEvent.click(tabTrigger);
      expect(onTabChange).toHaveBeenCalledWith('activity');
    }
  );
});
