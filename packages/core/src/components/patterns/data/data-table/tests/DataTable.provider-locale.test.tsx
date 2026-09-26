import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { ResponsiveContextValue } from '@/infrastructure/runtime/responsive';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import { PatternDataTable } from '..';

type Row = { id: string; name: string };

const PHONE: ResponsiveContextValue = {
  hasResolvedViewport: true,
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: true,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

async function rangeText(locale: 'en' | 'es') {
  const view = renderSurface(
    <I18nProvider locale={locale}>
      <PatternDataTable<Row>
        data={[{ id: '1', name: 'Alpha' }]}
        rowKey="id"
        adapt={{ phone: { presentation: 'cards' } }}
        columns={[{ key: 'name', dataIndex: 'name', title: 'Name' } as never]}
        pagination={{ current: 5, pageSize: 1000, total: 12345, onChange: () => undefined }}
      />
    </I18nProvider>,
    { engine: 'modern', responsiveContext: PHONE },
  );
  await waitFor(() => {
    expect(view.container.querySelector('[data-part="mobile-pagination-range"]')).not.toBeNull();
  });
  const text = view.container.querySelector('[data-part="mobile-pagination-range"]')?.textContent ?? '';
  view.unmount();
  return text;
}

describe('PatternDataTable — provider locale', () => {
  it('formats and words the mobile pagination range in the provider locale', async () => {
    expect(await rangeText('es')).toBe('4001 – 5000 de 12.345');
    expect(await rangeText('en')).toBe('4,001 – 5,000 of 12,345');
  });

  it('names the mobile pagination steps from the catalog in the provider locale', async () => {
    const view = renderSurface(
      <I18nProvider locale="es">
        <PatternDataTable<Row>
          data={[{ id: '1', name: 'Alpha' }]}
          rowKey="id"
          adapt={{ phone: { presentation: 'cards' } }}
          columns={[{ key: 'name', dataIndex: 'name', title: 'Name' } as never]}
          pagination={{ current: 2, pageSize: 1, total: 3, onChange: () => undefined }}
        />
      </I18nProvider>,
      { engine: 'modern', responsiveContext: PHONE },
    );
    await waitFor(() => {
      expect(view.container.querySelector('[data-part="mobile-pagination-actions"]')).not.toBeNull();
    });
    const labels = [...view.container.querySelectorAll('[data-part="mobile-pagination-actions"] button')]
      .map((button) => button.getAttribute('aria-label'));
    view.unmount();
    expect(labels).toEqual(['Página anterior', 'Página siguiente']);
  });

  it('keeps an explicit messages override above the catalog', async () => {
    const view = renderSurface(
      <I18nProvider locale="es">
        <PatternDataTable<Row>
          data={[{ id: '1', name: 'Alpha' }]}
          rowKey="id"
          adapt={{ phone: { presentation: 'cards' } }}
          columns={[{ key: 'name', dataIndex: 'name', title: 'Name' } as never]}
          messages={{ paginationRange: (start, end, total) => `${start}/${end}/${total}` }}
          pagination={{ current: 1, pageSize: 1, total: 3, onChange: () => undefined }}
        />
      </I18nProvider>,
      { engine: 'modern', responsiveContext: PHONE },
    );
    await waitFor(() => {
      expect(view.container.querySelector('[data-part="mobile-pagination-range"]')).not.toBeNull();
    });
    const text = view.container.querySelector('[data-part="mobile-pagination-range"]')?.textContent;
    view.unmount();
    expect(text).toBe('1/1/3');
  });
});
