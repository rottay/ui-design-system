/**
 * EditFields, WO-FAM-10 cut — the DOM contract the cut changed.
 *
 * What this suite owns, and the family's public suite beside it does not: the
 * width/span props are stamped variants the skin owns arms for (no inline
 * paint survives), the sticky dock's runtime geometry rides the family's
 * `--ds-edit-fields-toggle-*` channels (the one legal inline), the grid's
 * per-instance columns/gap still ride their channels with skin-authored
 * resting defaults, and the label↔control association stays explicit through
 * `htmlFor` — plus the i18n floors the chrome copy resolves through.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor, within } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import {
  InlineEditControl,
  InlineEditField,
  InlineEditFooter,
  InlineEditGrid,
  InlineEditSection,
  MoreFieldsToggle,
} from '..';
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

describe('EditFields (WO-FAM-10 cut)', () => {
  it('stamps every width variant and leaves no inline width on the control', async () => {
    for (const width of ['full', 'wide', 'compact', 'natural'] as const) {
      const { container, unmount } = renderWithEngine(
        <InlineEditControl width={width}>
          <input aria-label="bounded control" />
        </InlineEditControl>,
        'modern',
      );
      const control = await waitForPart(container, 'control');
      expect(control.getAttribute('data-width'), `width ${width}`).toBe(width);
      expect(control.getAttribute('style') ?? '', `width ${width}`).not.toContain('width');
      unmount();
    }
  });

  it('stamps every span variant on the field root and leaves no inline grid-column', async () => {
    for (const span of [1, 2, 3, 'full'] as const) {
      const { container, unmount } = renderWithEngine(
        <InlineEditField label={`Field ${span}`} span={span}>
          <input />
        </InlineEditField>,
        'modern',
      );
      const field = await waitForPart(container, 'field');
      expect(field.getAttribute('data-span'), `span ${span}`).toBe(String(span));
      expect(field.style.gridColumn, `span ${span}`).toBe('');
      unmount();
    }
  });

  it('arms the sticky dock channels only when sticky and expanded coincide', async () => {
    const { container, rerender } = renderWithEngine(
      <MoreFieldsToggle expanded={false} onToggle={() => {}} sticky stickyOffset={96} />,
      'modern',
    );
    let toggle = await waitForPart(container, 'toggle');
    expect(toggle.style.getPropertyValue('--ds-edit-fields-toggle-position')).toBe('');
    expect(toggle.style.getPropertyValue('--ds-edit-fields-toggle-sticky-offset')).toBe('');
    expect(toggle.getAttribute('style') ?? '').not.toContain('position');
    expect(toggle.getAttribute('style') ?? '').not.toContain('z-index');

    rerender(<MoreFieldsToggle expanded onToggle={() => {}} sticky stickyOffset={96} />);
    toggle = await waitForPart(container, 'toggle');
    expect(toggle.style.getPropertyValue('--ds-edit-fields-toggle-position')).toBe('sticky');
    expect(toggle.style.getPropertyValue('--ds-edit-fields-toggle-sticky-offset')).toBe('96px');

    rerender(<MoreFieldsToggle expanded onToggle={() => {}} stickyOffset={96} />);
    toggle = await waitForPart(container, 'toggle');
    expect(toggle.style.getPropertyValue('--ds-edit-fields-toggle-position')).toBe('');
  });

  it('keeps the grid layout values on their per-instance channels', async () => {
    const { container } = renderWithEngine(
      <InlineEditGrid columns="repeat(2, minmax(0, 1fr))" gap={20}>
        <div>grid child</div>
      </InlineEditGrid>,
      'modern',
    );
    const grid = await waitForPart(container, 'grid');
    expect(grid.style.getPropertyValue('--ds-edit-fields-grid-columns')).toBe(
      'repeat(2, minmax(0, 1fr))',
    );
    expect(grid.style.getPropertyValue('--ds-edit-fields-grid-gap')).toBe('20px');
  });

  it('writes the grid channels at the resting defaults the skin also authors', async () => {
    const { container } = renderWithEngine(
      <InlineEditGrid>
        <div>grid child</div>
      </InlineEditGrid>,
      'modern',
    );
    const grid = await waitForPart(container, 'grid');
    // The engine writes the channels per instance (the one legal inline),
    // at the defaults the skin ALSO declares, so a bare read never resolves
    // to a fallback nobody owns.
    expect(grid.style.getPropertyValue('--ds-edit-fields-grid-columns')).toBe(
      'repeat(3, minmax(0, 1fr))',
    );
    expect(grid.style.getPropertyValue('--ds-edit-fields-grid-gap')).toBe('14px');
  });

  it('keeps the label↔control association explicit through htmlFor under RTL', async () => {
    const { container, getByLabelText } = renderWithEngine(
      <I18nProvider locale="ar" fallbackLocale="en">
        <InlineEditField label="الاسم الكامل" htmlFor="full-name-input" hint="كما في العقد.">
          <input id="full-name-input" />
        </InlineEditField>
      </I18nProvider>,
      'modern',
    );
    await waitForPart(container, 'field-label');
    const control = getByLabelText('الاسم الكامل') as HTMLElement;
    expect(control.tagName).toBe('INPUT');
    expect(control.id).toBe('full-name-input');
    const label = container.querySelector('[data-part="field-label"]') as HTMLElement;
    expect(label.getAttribute('data-linked')).toBe('true');
  });

  it('resolves the chrome copy through the i18n channel and never echoes a raw key', async () => {
    const { container, getByText, queryByText } = renderWithEngine(
      <I18nProvider
        locale="es"
        fallbackLocale="en"
        customTranslations={{
          components: {
            editFields: {
              requirement: { required: 'Obligatorio' },
              toggle: { show_more: 'Mostrar más campos' },
            },
          },
        }}
      >
        <InlineEditField label="Salario" requirement="required">
          <input />
        </InlineEditField>
        <MoreFieldsToggle expanded={false} onToggle={() => {}} />
      </I18nProvider>,
      'modern',
    );
    const requirement = await waitForPart(container, 'field-requirement-copy');
    expect(requirement.textContent).toBe('Obligatorio');
    await waitFor(() => {
      expect(within(container as HTMLElement).getByRole('button', { name: 'Mostrar más campos' })).toBeTruthy();
    }, { timeout: WAIT_TIMEOUT });
    expect(getByText('Obligatorio')).toBeTruthy();
    expect(queryByText('editFields.requirement.required')).toBeNull();
  });

  it('stamps the footer impact preview and the section content for the skin to own', async () => {
    const { container } = renderWithEngine(
      <div>
        <InlineEditSection title="Compensation" description="Base pay.">
          <div>section body</div>
        </InlineEditSection>
        <InlineEditFooter
          impactPreview={<span>2 downstream reports change</span>}
          onCancel={() => {}}
          onSave={() => {}}
        />
      </div>,
      'modern',
    );
    const impact = await waitForPart(container, 'footer-impact-preview');
    expect(impact.textContent).toContain('2 downstream reports change');
    const content = await waitForPart(container, 'section-content');
    expect(content.textContent).toContain('section body');
  });
});
