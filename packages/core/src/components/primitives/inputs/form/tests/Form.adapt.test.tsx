import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { Form } from '../engines/modern';

const renderForm = (props: React.ComponentProps<typeof Form>) =>
  render(
    <I18nProvider locale="en" fallbackLocale="en">
      <Form {...props}>
        <Form.Item name="name" label="Name"><input aria-label="Name" /></Form.Item>
      </Form>
    </I18nProvider>,
  ).container.querySelector('form')!;

describe('the form adapt slot', () => {
  it('keeps the declared layout and stamps the postures in force when nothing is adapted', () => {
    const form = renderForm({ layout: 'horizontal' });
    expect(form).toHaveAttribute('data-layout', 'horizontal');
    expect(form.getAttribute('data-posture')).toMatch(/^(phone|tablet|desktop)( (compact|regular|expanded))?$/);
  });

  it('applies the delta declared for the posture in force and ignores the others', () => {
    const posture = renderForm({}).getAttribute('data-posture')!.split(' ')[0] as 'phone' | 'tablet' | 'desktop';
    const others = (['phone', 'tablet', 'desktop'] as const).filter((name) => name !== posture);
    expect(renderForm({ adapt: { [posture]: { layout: 'inline' } } })).toHaveAttribute('data-layout', 'inline');
    expect(renderForm({ adapt: Object.fromEntries(others.map((name) => [name, { layout: 'inline' }])) })).toHaveAttribute('data-layout', 'vertical');
  });

  it('passes the adapted layout to every item', () => {
    const posture = renderForm({}).getAttribute('data-posture')!.split(' ')[0] as 'phone' | 'tablet' | 'desktop';
    const form = renderForm({ layout: 'vertical', adapt: { [posture]: { layout: 'horizontal' } } });
    expect(form.querySelector("[data-part='item']")).toHaveAttribute('data-layout', 'horizontal');
  });
});
