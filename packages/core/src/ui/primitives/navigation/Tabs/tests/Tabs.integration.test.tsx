import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../tooling/testing/helpers/engine';

const items = [
  { key: 'overview', label: 'Overview', children: <div>Overview content</div> },
  { key: 'details', label: 'Details', children: <div>Details content</div> },
  { key: 'settings', label: 'Settings', children: <div>Settings content</div>, disabled: true },
];

describe('Tabs integration', () => {
  it.each(STABLE_ENGINES)('renders the live tabs with the %s engine', async (engine) => {
    const { Tabs } = await import('..');

    renderWithEngine(<Tabs engine={engine} items={items} defaultActiveKey="overview" />, engine);

    expect(await screen.findByRole('tablist', undefined, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview content');
  }, 15000);

  it('supports keyboard navigation in the rustic engine', async () => {
    const { Tabs } = await import('..');

    renderWithEngine(<Tabs engine="rustic" items={items} defaultActiveKey="overview" />, 'rustic');

    const overviewTab = await screen.findByRole('tab', { name: 'Overview' }, { timeout: 10000 });
    act(() => {
      overviewTab.focus();
    });
    fireEvent.keyDown(overviewTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: 'Details' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details content');
  });

  it('supports keyboard navigation in the modern engine', async () => {
    const { Tabs } = await import('..');

    renderWithEngine(<Tabs engine="modern" items={items} defaultActiveKey="overview" />, 'modern');

    const overviewTab = await screen.findByRole('tab', { name: 'Overview' }, { timeout: 10000 });
    const root = overviewTab.closest('.rottay-tabs--modern');
    expect(root).toHaveAttribute('data-variant', 'line');
    expect(root).toHaveAttribute('data-recipe', 'underline');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-centered', 'false');
    expect(root).toHaveAttribute('data-has-icons', 'false');
    expect(root).toHaveAttribute('data-active-key', 'overview');
    expect(overviewTab.querySelector('[data-part="tab-label"]')).not.toBeNull();
    act(() => {
      overviewTab.focus();
    });
    fireEvent.keyDown(overviewTab, { key: 'End' });

    // End should skip the disabled tab and land on the last enabled one.
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details content');
  });

  it('keeps focus and selection separate in manual activation mode', async () => {
    const { Tabs } = await import('..');

    renderWithEngine(
      <Tabs
        engine="modern"
        items={items}
        defaultActiveKey="overview"
        activationMode="manual"
      />,
      'modern'
    );

    const overviewTab = await screen.findByRole('tab', { name: 'Overview' });
    act(() => {
      overviewTab.focus();
    });
    fireEvent.keyDown(overviewTab, { key: 'ArrowRight' });

    const detailsTab = screen.getByRole('tab', { name: 'Details' });
    expect(detailsTab).toHaveFocus();
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(detailsTab, { key: 'Enter' });
    expect(detailsTab).toHaveAttribute('aria-selected', 'true');
  });

  it('renders canonical recipes and the explicit badge anatomy', async () => {
    const { Tabs } = await import('..');
    renderWithEngine(
      <Tabs
        engine="modern"
        type="segmented"
        items={[
          {
            key: 'inbox',
            label: 'Inbox',
            badge: 12,
            badgeAriaLabel: '12 unread',
            children: 'Inbox content',
          },
        ]}
      />,
      'modern'
    );

    const tab = await screen.findByRole('tab', { name: /Inbox/ });
    expect(tab.closest('.rottay-tabs--modern')).toHaveAttribute(
      'data-recipe',
      'segmented'
    );
    expect(tab).toHaveAttribute('data-has-badge', 'true');
    expect(tab.querySelector('[data-part="tab-badge"]')).toHaveTextContent('12');
  });

  it('keeps a loading destination readable while excluding it from activation', async () => {
    const { Tabs } = await import('..');
    const onChange = vi.fn();
    renderWithEngine(
      <Tabs
        engine="modern"
        defaultActiveKey="overview"
        onChange={onChange}
        accessibilityLabels={{ loading: 'cargando' }}
        items={[
          ...items.slice(0, 1),
          {
            key: 'intelligence',
            label: 'Inteligencia',
            loading: true,
            children: 'AI content',
          },
          ...items.slice(1, 2),
        ]}
      />,
      'modern'
    );

    const loadingTab = await screen.findByRole('tab', { name: 'Inteligencia' });
    expect(loadingTab).toHaveAttribute('aria-busy', 'true');
    expect(loadingTab).toHaveAttribute('aria-disabled', 'true');
    expect(loadingTab.querySelector('[data-part="loading-indicator"]')).not.toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Inteligencia cargando');

    fireEvent.click(loadingTab);
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      screen.getByRole('tab', { name: 'Overview' }).focus();
    });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Overview' }), {
      key: 'ArrowRight',
    });
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveFocus();
  });

  it('publishes writing direction and keeps localized controls contract-owned', async () => {
    const { Tabs } = await import('..');
    renderWithEngine(
      <div dir="rtl" lang="ar" data-tenant="the-management">
        <Tabs
          engine="modern"
          items={items.slice(0, 2)}
          accessibilityLabels={{
            previous: 'علامات التبويب السابقة',
            next: 'علامات التبويب التالية',
            more: 'جميع علامات التبويب',
            loading: 'قيد التحميل',
          }}
        />
      </div>,
      'modern'
    );

    const root = (await screen.findByRole('tablist')).closest(
      '.rottay-tabs--modern'
    );
    expect(root).toHaveAttribute('data-direction', 'rtl');

    const overviewTab = screen.getByRole('tab', { name: 'Overview' });
    act(() => {
      overviewTab.focus();
    });
    fireEvent.keyDown(overviewTab, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveFocus();
  });
});
