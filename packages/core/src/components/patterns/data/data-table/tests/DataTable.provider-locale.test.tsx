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
  it('formats the mobile pagination range in the provider locale', async () => {
    expect(await rangeText('es')).toBe('4001 – 5000 of 12.345');
    expect(await rangeText('en')).toBe('4,001 – 5,000 of 12,345');
  });
});
