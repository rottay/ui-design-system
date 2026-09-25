import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernApprovalWorkflow from '../engines/modern';

const DECIDED_AT = new Date(Date.UTC(2026, 2, 14, 15, 30, 5));

function mount(locale: 'en' | 'es') {
  const { container, unmount } = render(
    <I18nProvider locale={locale}>
      <ModernApprovalWorkflow title="Approval" steps={[{ key: 's1', approver: 'Ana', status: 'approved', timestamp: DECIDED_AT }]} />
    </I18nProvider>,
  );
  const text = container.querySelector('[data-part="step-timestamp"]')?.textContent ?? '';
  unmount();
  return text;
}

describe('Modern ApprovalWorkflow — provider locale', () => {
  it('formats a Date timestamp as date and time in the provider locale', () => {
    const shape: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
    };
    expect(mount('es')).toBe(new Intl.DateTimeFormat('es-ES', shape).format(DECIDED_AT));
    expect(mount('en')).toBe(new Intl.DateTimeFormat('en-US', shape).format(DECIDED_AT));
  });
});
