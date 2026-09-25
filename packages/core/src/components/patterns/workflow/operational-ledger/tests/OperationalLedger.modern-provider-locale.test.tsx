import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { LedgerEntry } from '../contracts';
import ModernOperationalLedger from '../engines/modern';

const ENTRY: LedgerEntry = {
  id: '1',
  timestamp: '2026-03-14T15:30:00.000Z',
  description: 'Stock received',
  quantity: 12345,
  type: 'credit',
  actor: 'Warehouse Bot',
  reason: 'PO-1234',
};

function mount(locale: 'en' | 'es') {
  const { container, unmount } = render(
    <I18nProvider locale={locale}>
      <ModernOperationalLedger entries={[ENTRY]} />
    </I18nProvider>,
  );
  const read = (part: string) => container.querySelector(`[data-part="${part}"]`)?.textContent ?? '';
  const values = { quantity: read('cell-quantity'), timestamp: read('cell-timestamp') };
  unmount();
  return values;
}

describe('Modern OperationalLedger — provider locale', () => {
  it('formats the quantity and the timestamp in the provider locale, not the runtime one', () => {
    const shape: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const at = new Date(ENTRY.timestamp);

    const es = mount('es');
    expect(es.quantity).toContain('12.345');
    expect(es.timestamp).toBe(new Intl.DateTimeFormat('es-ES', shape).format(at));

    const en = mount('en');
    expect(en.quantity).toContain('12,345');
    expect(en.timestamp).toBe(new Intl.DateTimeFormat('en-US', shape).format(at));
  });
});
