/**
 * FormSections, WO-FAM-10 cut — the DOM contract the cut changed.
 *
 * What this suite owns, and the disclosure suite beside it does not: the
 * facts-card title is skin-owned display type (no inline paint, no tier
 * role), the loading state is BUILT from the card's own anatomy by the
 * shared renderer rather than hand-written bars, and the disclosure's
 * hover/press/focus triad is the shared interaction kernel's decision read
 * off `data-state` — plus the i18n floors the chips resolve through.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { FormFactsCard, FormSections } from '..';
import { renderWithEngine } from '@tests/support/engine';

const WAIT_TIMEOUT = 2000;

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

const collapsibleSection = [
  {
    key: 'profile',
    title: 'Profile',
    required: true,
    children: <div>Profile content</div>,
  },
];

describe('FormSections (WO-FAM-10 cut)', () => {
  it('decides the disclosure hover and press once, in the kernel, and reads them off data-state', async () => {
    const { container } = renderWithEngine(
      <FormSections sections={collapsibleSection} collapsible />,
      'modern',
    );
    const disclosure = await waitForPart(container, 'section-disclosure');
    expect(disclosure.getAttribute('data-state')).toBeNull();

    fireEvent.pointerEnter(disclosure);
    await waitFor(() => expect(disclosure.getAttribute('data-state')).toBe('hovered'));

    fireEvent.pointerDown(disclosure);
    await waitFor(() => expect(disclosure.getAttribute('data-state')).toContain('pressed'));

    fireEvent.pointerUp(disclosure);
    fireEvent.pointerLeave(disclosure);
    await waitFor(() => expect(disclosure.getAttribute('data-state')).toBeNull());
  });

  it('keeps the disclosure contract while stamping state through partAttributes', async () => {
    const { container } = renderWithEngine(
      <FormSections sections={collapsibleSection} collapsible defaultActiveKeys={['profile']} />,
      'modern',
    );
    const disclosure = await waitForPart(container, 'section-disclosure');

    // partAttributes owns the part + state pair: the button's data-part is
    // stamped the same way it always was, and the aria wiring is untouched.
    expect(disclosure.getAttribute('data-part')).toBe('section-disclosure');
    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
    expect(disclosure.getAttribute('aria-controls')).toBeTruthy();
    const header = container.querySelector('[data-part="section-header"]')!;
    expect(header.getAttribute('data-collapsible')).toBe('true');
  });

  it('marks keyboard focus through the kernel state so the skin ring can pair it', async () => {
    const { container } = renderWithEngine(
      <FormSections sections={collapsibleSection} collapsible />,
      'modern',
    );
    const disclosure = await waitForPart(container, 'section-disclosure');

    fireEvent.focus(disclosure);
    await waitFor(() => expect(disclosure.getAttribute('data-state')).toBe('focused focus-visible'));

    fireEvent.blur(disclosure);
    await waitFor(() => expect(disclosure.getAttribute('data-state')).toBeNull());
  });

  it('paints no inline style on the facts-card title: display type is the skin\'s', async () => {
    const { container } = renderWithEngine(
      <FormFactsCard title="Identity" items={[{ label: 'Name', value: 'Ada' }]} />,
      'modern',
    );
    const title = await waitForPart(container, 'facts-card-title');
    expect(title.textContent).toBe('Identity');
    expect(title.getAttribute('style')).toBeNull();
    // The display-type node is a Box, not a Typography tier: no size stamp.
    expect(title.getAttribute('data-size')).toBeNull();
  });

  it('builds the loading state from the card\'s own anatomy, announced once', async () => {
    const { container } = renderWithEngine(
      <FormFactsCard
        title="Resolving"
        eyebrow="Ledger"
        items={[{ label: 'Name', value: 'Ada', helper: 'Legal name' }]}
        loading
      />,
      'modern',
    );
    const root = await waitForPart(container, 'facts-card');
    expect(root.getAttribute('data-loading')).toBe('true');
    expect(root.getAttribute('aria-busy')).toBe('true');

    const skeleton = container.querySelector('.ds-skeleton-anatomy');
    expect(skeleton).not.toBeNull();
    // The host owns the single announcement, so the renderer makes none.
    expect(skeleton!.getAttribute('aria-busy')).toBeNull();
    // The hand-made bars and their part stamps are gone; the renderer reads
    // the card's own parts instead.
    expect(container.querySelector('[data-part="facts-card-item-skeleton-label"]')).toBeNull();
    expect(container.querySelector('[data-part="facts-card-item-skeleton-value"]')).toBeNull();
    const source = skeleton!.querySelector('[data-part="source"]')!;
    expect(source.getAttribute('aria-hidden')).toBe('true');
    for (const part of ['facts-card-body', 'facts-card-items', 'facts-card-item']) {
      expect(source.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
  });

  it('renders the resolved card with no skeleton left behind', async () => {
    const { container, getByText } = renderWithEngine(
      <FormFactsCard title="Ready" items={[{ label: 'Name', value: 'Ada' }]} />,
      'modern',
    );
    const root = await waitForPart(container, 'facts-card');
    expect(root.getAttribute('data-loading')).toBeNull();
    expect(root.getAttribute('aria-busy')).toBeNull();
    expect(container.querySelector('.ds-skeleton-anatomy')).toBeNull();
    expect(getByText('Ada')).toBeTruthy();
  });

  it('resolves the chip copy through the catalog, yields to a custom tier, and never echoes a raw key', async () => {
    const { container, getByText, queryByText, unmount } = renderWithEngine(
      <I18nProvider locale="es" fallbackLocale="en">
        <FormSections
          sections={[
            { key: 'a', title: 'A', required: true, children: <div /> },
            { key: 'b', title: 'B', optional: true, children: <div /> },
          ]}
        />
      </I18nProvider>,
      'modern',
    );
    await waitForPart(container, 'section-chip-label');
    // The catalog's Spanish tier, not the English floor.
    expect(getByText('Requerido')).toBeTruthy();
    expect(getByText('Opcional')).toBeTruthy();
    expect(queryByText('form_sections.required')).toBeNull();
    unmount();

    const overridden = renderWithEngine(
      <I18nProvider
        locale="es"
        fallbackLocale="en"
        customTranslations={{
          components: {
            form_sections: { required: 'Obligatorio', optional: 'Opcional' },
          },
        }}
      >
        <FormSections
          sections={[
            { key: 'a', title: 'A', required: true, children: <div /> },
            { key: 'b', title: 'B', optional: true, children: <div /> },
          ]}
        />
      </I18nProvider>,
      'modern',
    );
    await waitForPart(overridden.container, 'section-chip-label');
    expect(overridden.getByText('Obligatorio')).toBeTruthy();
    expect(overridden.getByText('Opcional')).toBeTruthy();
  });

  it('reaches the Arabic catalog under RTL and keeps the kernel triad direction-free', async () => {
    const { container, getByText } = renderWithEngine(
      <I18nProvider locale="ar" fallbackLocale="en">
        <FormSections sections={collapsibleSection} collapsible />
      </I18nProvider>,
      'modern',
    );
    const disclosure = await waitForPart(container, 'section-disclosure');
    // The Arabic catalog tier carries the chip copy.
    expect(getByText('مطلوب')).toBeTruthy();

    // The kernel triad answers the same under RTL: reading direction changes
    // the arrow, never the state contract.
    fireEvent.pointerEnter(disclosure);
    await waitFor(() => expect(disclosure.getAttribute('data-state')).toBe('hovered'));
    fireEvent.pointerLeave(disclosure);
    await waitFor(() => expect(disclosure.getAttribute('data-state')).toBeNull());

    const chipLabel = container.querySelector('[data-part="section-chip-label"]')!;
    expect(within(chipLabel as HTMLElement).getByText('مطلوب')).toBeTruthy();
  });
});
