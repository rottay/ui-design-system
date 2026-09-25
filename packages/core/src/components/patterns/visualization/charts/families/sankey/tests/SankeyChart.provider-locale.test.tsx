import React from 'react';
import { describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { SankeyChart } from '..';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

function mount(locale: 'en' | 'es') {
  const { container, unmount } = renderSurface(
    <I18nProvider locale={locale}>
      <SankeyChart
        title="Flow"
        nodes={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]}
        links={[{ source: 'a', target: 'b', value: 12345 }]}
        width={480}
        height={280}
        responsive={false}
        animate={false}
      />
    </I18nProvider>,
  );
  const cells = [...container.querySelectorAll('td')].map((cell) => cell.textContent ?? '');
  unmount();
  return cells;
}

describe('SankeyChart — provider locale', () => {
  it('formats link values in the provider locale when no formatValue is given', () => {
    expect(mount('es')).toContain('12.345');
    expect(mount('en')).toContain('12,345');
  });
});
