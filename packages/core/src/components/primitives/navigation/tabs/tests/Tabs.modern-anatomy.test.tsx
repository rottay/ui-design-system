/**
 * The Modern tabs' anatomy contract, executed: one `ds-tabs` namespace, the
 * interaction kernel deciding every destination's state once, the indicator
 * carrying its measurement as runtime channels rather than paint, a tab tree
 * axe accepts, keyboard reach that follows the reading direction, and labels
 * that survive a right-to-left locale.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import ModernTabs from '../engines/modern';
import { TabPane } from '../compound';

const ITEMS = [
  { key: 'overview', label: 'Overview', children: 'Overview body' },
  { key: 'details', label: 'Details 4', icon: <span>i</span>, children: 'Details body' },
  { key: 'billing', label: 'Billing', disabled: true, children: 'Billing body' },
  { key: 'audit', label: 'Audit', loading: true, children: 'Audit body' },
];

const STRUCTURE_RULES = ['nested-interactive', 'aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-allowed-attr'];

async function violationIds(container: HTMLElement, values: string[]): Promise<string[]> {
  const results = await axe.run(container, { runOnly: { type: 'rule', values } });
  return results.violations.map((v) => v.id);
}

afterEach(() => {
  document.documentElement.dir = '';
});

describe('one namespace', () => {
  it('emits ds-tabs classes only, on the engine tree and on the pane compound', () => {
    const { container } = render(
      <>
        <ModernTabs items={ITEMS} defaultActiveKey="overview" />
        <TabPane tab="Static" key="static">Static body</TabPane>
      </>,
    );
    const classes = new Set(Array.from(container.querySelectorAll('[class]')).flatMap((el) => Array.from(el.classList)));
    const own = [...classes].filter((token) => /(^|-)tabs(-|$)/.test(token));
    expect(own.length).toBeGreaterThan(0);
    expect(own.every((token) => token.startsWith('ds-tabs'))).toBe(true);
    expect(container.querySelector('[class*="rottay-tabs"]')).toBeNull();
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-variant', 'line');
  });
});

describe('the kernel decides state once', () => {
  it('stamps hover, press, focus and disabled on destinations as data-state', () => {
    render(<ModernTabs items={ITEMS} defaultActiveKey="overview" />);
    const details = screen.getByRole('tab', { name: /Details/ });
    const billing = screen.getByRole('tab', { name: 'Billing' });

    expect(details).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(details);
    expect(details).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(details);
    expect(details).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(details);
    fireEvent.pointerLeave(details);
    expect(details).not.toHaveAttribute('data-state');

    fireEvent.focus(details);
    expect(details).toHaveAttribute('data-state', 'focused focus-visible');
    expect(details).toHaveAttribute('tabindex', '0');
    fireEvent.blur(details);
    expect(details).not.toHaveAttribute('data-state');

    expect(billing).toHaveAttribute('data-state', 'disabled');
    expect(billing).not.toHaveAttribute('data-disabled');
    fireEvent.pointerEnter(billing);
    expect(billing).toHaveAttribute('data-state', 'disabled');
  });

  it('keeps a loading destination distinct from a disabled one', () => {
    render(<ModernTabs items={ITEMS} defaultActiveKey="overview" />);
    const audit = screen.getByRole('tab', { name: 'Audit' });
    expect(audit).toHaveAttribute('data-loading', 'true');
    expect(audit).toHaveAttribute('aria-busy', 'true');
    expect(audit).not.toHaveAttribute('data-state');
    expect(audit.querySelector('[data-part="loading-indicator"]')).not.toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Audit Loading');
    expect(screen.getByRole('status')).not.toHaveAttribute('data-part');
  });

  it('stamps the panel as a part the kernel governs and the badge as its own part', () => {
    render(<ModernTabs items={ITEMS} defaultActiveKey="details" />);
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('data-part', 'tab-panel');
    fireEvent.focus(panel);
    expect(panel).toHaveAttribute('data-state', 'focused focus-visible');
    const details = screen.getByRole('tab', { name: /Details/ });
    expect(details.querySelector('[data-part="tab-badge"]')).toHaveTextContent('4');
    expect(details.querySelector('[data-part="tab-label"]')).toHaveTextContent('Details');
  });
});

describe('the indicator carries measurement, not paint', () => {
  it('writes its offset and scale as --ds-tabs channels and never an inline transform', () => {
    const { container } = render(<ModernTabs items={ITEMS} defaultActiveKey="overview" />);
    const indicator = container.querySelector('[data-part="indicator"]') as HTMLElement;
    expect(indicator).not.toBeNull();
    const inline = indicator.getAttribute('style') ?? '';
    expect(inline).not.toMatch(/transform/);
    expect(inline).toContain('--ds-tabs-indicator-offset');
    expect(inline).toContain('--ds-tabs-indicator-scale');
  });

  it('paints nothing inline on any other part', () => {
    const { container } = render(<ModernTabs items={ITEMS} defaultActiveKey="overview" />);
    for (const el of container.querySelectorAll('[data-part]')) {
      const part = el.getAttribute('data-part');
      if (part === 'indicator' || part === 'root' || part === 'tab-panel') continue;
      expect((el as HTMLElement).getAttribute('style'), `${part} carries inline style`).toBeNull();
    }
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    for (const declaration of (root.getAttribute('style') ?? '').split(';').map((d) => d.trim()).filter(Boolean)) {
      expect(declaration.startsWith('--ds-'), `root declares ${declaration}`).toBe(true);
    }
  });
});

describe('a tab tree axe accepts', () => {
  it('reports no structural violation with a disabled and a loading destination', async () => {
    const { container } = render(<ModernTabs items={ITEMS} defaultActiveKey="overview" />);
    expect(await violationIds(container, STRUCTURE_RULES)).toEqual([]);
  });

  it('non-vacuity guard: a control nested in a tab trips the same rules', async () => {
    const { container } = render(
      <div role="tablist" aria-label="Rows">
        <div role="tab" aria-selected="true" tabIndex={0}>
          Row
          <button type="button" aria-label="Action" />
        </div>
      </div>,
    );
    expect(await violationIds(container, STRUCTURE_RULES)).toContain('nested-interactive');
  });
});

describe('direction and locale', () => {
  it('walks the tablist with the horizontal arrows mirrored under RTL and both vertical arrows live', () => {
    // Direction arrives through the i18n authority the kernel now reads.
    // `document.documentElement.dir` is what the provider WRITES, not what the
    // components read, so setting it by hand left this case asserting LTR
    // behaviour under an RTL title.
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernTabs items={ITEMS} defaultActiveKey="overview" />
      </I18nProvider>,
    );
    const overview = screen.getByRole('tab', { name: 'Overview' });
    const details = screen.getByRole('tab', { name: /Details/ });
    overview.focus();
    fireEvent.keyDown(overview, { key: 'ArrowLeft' });
    expect(details).toHaveFocus();
    fireEvent.keyDown(details, { key: 'ArrowRight' });
    expect(overview).toHaveFocus();
    fireEvent.keyDown(overview, { key: 'ArrowDown' });
    expect(details).toHaveFocus();
    fireEvent.keyDown(details, { key: 'ArrowUp' });
    expect(overview).toHaveFocus();
    fireEvent.keyDown(overview, { key: 'End' });
    expect(details).toHaveFocus();
    fireEvent.keyDown(details, { key: 'Home' });
    expect(overview).toHaveFocus();
  });

  it('keeps an Arabic label as the tab name and the chrome copy from accessibilityLabels', () => {
    const label = 'نظرة عامة';
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernTabs
          items={[{ key: 'ar', label, children: 'body' }, { key: 'b', label: 'ب', loading: true }]}
          accessibilityLabels={{ loading: 'قيد التحميل' }}
        />
      </I18nProvider>,
    );
    const tab = screen.getByRole('tab', { name: label });
    expect(tab.querySelector('[data-part="tab-label"]')).toHaveTextContent(label);
    expect(tab.closest('[data-part="root"]')).toHaveAttribute('data-direction', 'rtl');
    expect(screen.getByRole('status')).toHaveTextContent('قيد التحميل');
  });
});
