/**
 * DetailHeader tab navigation under NESTED reading directions (S19-F04).
 *
 * The audit's counterexample is an LTR scope inside an RTL one. The handler
 * used to answer it with `currentTab.closest('[dir="rtl"]')`, a selector that
 * walks PAST the nearer `dir="ltr"` because that element does not match it, so
 * locally left-to-right tabs navigated backwards. The reproduction below is the
 * audit's, kept verbatim — including its two controls, so a green run cannot be
 * a green fixture.
 *
 * Direction now comes from the i18n authority, which is also why the sanctioned
 * shape of the same case is asserted beside the DOM one: an LTR locale island
 * (`directionScope="element"`) inside an RTL locale. Both must resolve to the
 * NEAREST scope.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';

import { DetailHeader } from '..';
import { I18nProvider } from '@/infrastructure/runtime/i18n/runtime';
import { renderWithEngine } from '@tests/support/engine';

const WAIT_TIMEOUT = 2000;

const TABS = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two' },
  { id: 'three', label: 'Three' },
];

async function waitForPart(container: HTMLElement, part: string): Promise<HTMLElement> {
  await waitFor(
    () => {
      if (!container.querySelector(`[data-part="${part}"]`)) {
        throw new Error(`expected [data-part="${part}"] in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`[data-part="${part}"]`) as HTMLElement;
}

function header() {
  return <DetailHeader title="X" backHref="/x" tabs={TABS} activeTab="one" onTabChange={vi.fn()} />;
}

describe('DetailHeader tab navigation across nested reading directions', () => {
  it('walks FORWARD on ArrowRight when a local ltr scope sits inside an rtl ancestor', async () => {
    const { container, getByRole } = renderWithEngine(
      <div dir="rtl">
        <div dir="ltr">{header()}</div>
      </div>,
      'modern',
    );
    await waitForPart(container, 'tab-strip');

    const tablist = getByRole('tablist', { name: 'Tabs' });
    const tabs = within(tablist).getAllByRole('tab');

    // The audit's controls: the reading really is locally left-to-right, and
    // the strip really holds three tabs, so "Three" cannot be the neighbour.
    expect(tabs[0].closest('[dir]')?.getAttribute('dir')).toBe('ltr');
    expect(tabs).toHaveLength(3);

    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });

    expect(document.activeElement).toBe(tabs[1]);
  });

  it('walks forward on ArrowRight in an ltr locale ISLAND inside an rtl locale', async () => {
    const { container, getByRole } = renderWithEngine(
      <I18nProvider locale="ar" fallbackLocale="en" directionScope="element">
        <I18nProvider locale="en" fallbackLocale="en" directionScope="element">
          {header()}
        </I18nProvider>
      </I18nProvider>,
      'modern',
    );
    await waitForPart(container, 'tab-strip');

    const tablist = getByRole('tablist', { name: 'Tabs' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs[0].closest('[dir]')?.getAttribute('dir')).toBe('ltr');

    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });

    expect(document.activeElement).toBe(tabs[1]);
  });

  it('still walks BACKWARD on ArrowRight when the nearest scope is itself rtl', async () => {
    const { container, getByRole } = renderWithEngine(
      <I18nProvider locale="en" fallbackLocale="en" directionScope="element">
        <I18nProvider locale="ar" fallbackLocale="en" directionScope="element">
          {header()}
        </I18nProvider>
      </I18nProvider>,
      'modern',
    );
    await waitForPart(container, 'tab-strip');

    const tablist = getByRole('tablist', { name: 'Tabs' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs[0].closest('[dir]')?.getAttribute('dir')).toBe('rtl');

    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });

    // Wrapping backwards from the first tab is the RTL reading of "next
    // inline-start neighbour", and it is what the LTR case must NOT do.
    expect(document.activeElement).toBe(tabs[2]);
  });
});
