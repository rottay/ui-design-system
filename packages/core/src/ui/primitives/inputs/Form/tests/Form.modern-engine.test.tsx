import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Form as ModernForm } from '../engines/modern';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

/**
 * Form modern-engine ownership contract (K2-V Pass 1): the layout/geometry
 * inline styles were drained into the form.css skin keyed on data-layout /
 * data-size; the engine now stamps anatomy only.
 */
describe('Form modern engine ownership', () => {
  it('stamps anatomy with no inline styles on item/label/field/message parts', () => {
    const view = render(
      <I18nProvider locale="en" fallbackLocale="en">
        <ModernForm layout="horizontal" hasFeedback>
          <ModernForm.Item
            name="email"
            label="Email"
            required
            tooltip="Work email"
            help="We never share it"
            rules={[{ required: true }]}
          >
            <input aria-label="Email" />
          </ModernForm.Item>
        </ModernForm>
      </I18nProvider>
    );

    const partSelectors = [
      '[data-part="item"]',
      '[data-part="label"]',
      '[data-part="label-text"]',
      '[data-part="required-mark"]',
      '[data-part="tooltip-icon"]',
      '[data-part="field"]',
      '[data-part="control-row"]',
      '[data-part="control"]',
      '[data-part="message"]',
      '[data-part="help-text"]',
    ];
    for (const selector of partSelectors) {
      const node = view.container.querySelector(selector);
      expect(node, `${selector} should render`).not.toBeNull();
      expect(node?.getAttribute('style'), `${selector} carries inline styles`).toBeNull();
    }

    // Anatomy channels the skin keys layout/state on.
    expect(view.container.querySelector('[data-part="item"]')).toHaveAttribute('data-layout', 'horizontal');
    expect(view.container.querySelector('[data-part="item"]')).toHaveAttribute('data-required', 'true');
    expect(view.container.querySelector('[data-part="root"]')).toHaveAttribute('data-size', 'md');
  });

  it('keeps the caller style passthrough on the item root', () => {
    const view = render(
      <I18nProvider locale="en" fallbackLocale="en">
        <ModernForm>
          <ModernForm.Item name="x" style={{ marginBottom: 24 }}>
            <input aria-label="x" />
          </ModernForm.Item>
        </ModernForm>
      </I18nProvider>
    );

    const item = view.container.querySelector('[data-part="item"]');
    expect((item as HTMLElement).style.marginBottom).toBe('24px');
  });

  it('error state flows to data-validation and the error help-text channel', async () => {
    render(
      <I18nProvider locale="en" fallbackLocale="en">
        <ModernForm>
          <ModernForm.Item name="email" label="Email" validateStatus="error" help="Invalid email">
            <input aria-label="Email" />
          </ModernForm.Item>
        </ModernForm>
      </I18nProvider>
    );

    expect(screen.getByText('Invalid email')).toHaveAttribute('data-error', 'true');
    expect(document.querySelector('[data-part="item"]')).toHaveAttribute('data-validation', 'error');
  });
});
