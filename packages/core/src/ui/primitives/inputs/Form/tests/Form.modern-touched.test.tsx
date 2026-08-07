import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Form as ModernForm } from '../engines/modern';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nProvider locale="en" fallbackLocale="en">
      {ui}
    </I18nProvider>
  );

/**
 * `setFieldTouched` existed and was published on the context, but no code path
 * ever called it, so `touched` stayed permanently empty. Two documented
 * behaviours were therefore unreachable: the `dependencies` re-validation
 * effect (gated on the field being touched) and the `hasFeedback` success
 * posture, which could only appear via an explicit `validateStatus`.
 */
describe('Form modern touched propagation', () => {
  it('re-validates a dependent field when its dependency changes', async () => {
    const validator = vi.fn();
    wrap(
      <ModernForm>
        <ModernForm.Item name="password" label="Password">
          <input data-testid="password" />
        </ModernForm.Item>
        <ModernForm.Item
          name="confirm"
          label="Confirm"
          dependencies={['password']}
          rules={[{ validator }]}
        >
          <input data-testid="confirm" />
        </ModernForm.Item>
      </ModernForm>
    );

    // Touch the dependent field.
    fireEvent.change(screen.getByTestId('confirm'), { target: { value: 'abc' } });
    await waitFor(() => expect(validator).toHaveBeenCalled());
    const afterOwnEdit = validator.mock.calls.length;

    // Changing the declared dependency must re-run the dependent field's rules;
    // the effect that does so is gated on the field being touched.
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'longenough' } });
    await waitFor(() => expect(validator.mock.calls.length).toBeGreaterThan(afterOwnEdit));
  });

  it('reaches the hasFeedback success posture from a user edit alone', async () => {
    const { container } = wrap(
      <ModernForm hasFeedback>
        <ModernForm.Item name="email" label="Email" rules={[{ min: 3, message: 'Too short' }]}>
          <input data-testid="email" />
        </ModernForm.Item>
      </ModernForm>
    );

    const item = container.querySelector('[data-part="item"]') as HTMLElement;
    expect(item).not.toHaveAttribute('data-validation', 'success');

    fireEvent.change(screen.getByTestId('email'), { target: { value: 'a@b.co' } });

    await waitFor(() => expect(item).toHaveAttribute('data-validation', 'success'));
  });

  it('keeps an untouched field out of the success posture', () => {
    const { container } = wrap(
      <ModernForm hasFeedback>
        <ModernForm.Item name="email" label="Email" rules={[{ min: 3, message: 'Too short' }]}>
          <input data-testid="email" />
        </ModernForm.Item>
      </ModernForm>
    );

    const item = container.querySelector('[data-part="item"]') as HTMLElement;
    expect(item).not.toHaveAttribute('data-validation', 'success');
  });
});
