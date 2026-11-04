import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { I18nProvider, type SupportedLocale } from '@/infrastructure/runtime/i18n';
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

describe('Modern ApprovalWorkflow — preformatted timestamps', () => {
  const locales: SupportedLocale[] = ['en', 'es', 'pt', 'fr', 'ar'];

  it.each(locales)('preserves timestamp strings verbatim under the %s provider', (locale) => {
    const { container, unmount } = render(
      <I18nProvider locale={locale}>
        <ModernApprovalWorkflow
          title="Approval"
          steps={[
            { key: 'iso', approver: 'Ana', status: 'approved', timestamp: '2026-03-14T15:30:05Z' },
            { key: 'host', approver: 'Luis', status: 'approved', timestamp: '  Reviewed 14 Mar 2026 at 15:30 (host time)  ' },
          ]}
        />
      </I18nProvider>,
    );

    expect(
      Array.from(container.querySelectorAll('[data-part="step-timestamp"]'), (node) => node.textContent),
    ).toEqual([
      '2026-03-14T15:30:05Z',
      '  Reviewed 14 Mar 2026 at 15:30 (host time)  ',
    ]);
    unmount();
  });
});
