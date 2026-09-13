import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FormInstance } from '../contracts';
import { Form as RusticForm } from '../engines/rustic';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nProvider locale="en" fallbackLocale="en">
      {ui}
    </I18nProvider>
  );

describe('Form rustic engine - removed field', () => {
  it('stops blocking submit and drops its errors once the field unmounts', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();

    function ConditionalForm() {
      const [show, setShow] = React.useState(true);
      return (
        <>
          <button type="button" onClick={() => setShow(false)}>
            Hide reason
          </button>
          <RusticForm onFinish={onFinish} onFinishFailed={onFinishFailed}>
            {show && (
              <RusticForm.Item name="reason" label="Reason" rules={[{ required: true, message: 'Reason is required' }]}>
                <input />
              </RusticForm.Item>
            )}
            <RusticForm.ErrorList />
            <button type="submit">Save</button>
          </RusticForm>
        </>
      );
    }

    wrap(<ConditionalForm />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onFinishFailed).toHaveBeenCalledTimes(1));
    expect(onFinish).not.toHaveBeenCalled();
    expect(screen.getAllByText('Reason is required').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Hide reason' }));
    await waitFor(() => expect(screen.queryByText('Reason is required')).toBeNull());

    onFinishFailed.mockClear();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinishFailed).not.toHaveBeenCalled();
  });
});

describe('Form rustic engine - instance methods', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderWithInstance(initialValues: Record<string, unknown> = {}) {
    const ref = React.createRef<FormInstance>();
    wrap(
      <RusticForm ref={ref} initialValues={initialValues}>
        <RusticForm.Item name="email" label="Email" rules={[{ required: true, message: 'Email is required' }]}>
          <input />
        </RusticForm.Item>
        <RusticForm.Item name="role" label="Role">
          <input />
        </RusticForm.Item>
      </RusticForm>
    );
    return ref;
  }

  it('validateFields rejects with errorFields for invalid data and renders the message', async () => {
    const ref = renderWithInstance();

    let rejection: unknown;
    await act(async () => {
      await ref.current!.validateFields().catch((error: unknown) => {
        rejection = error;
      });
    });

    expect(rejection).toEqual(
      expect.objectContaining({
        errorFields: [{ name: 'email', errors: ['Email is required'] }],
      })
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('validateFields resolves with the values once the rules pass', async () => {
    const ref = renderWithInstance({ email: 'ada@rottay.dev' });

    await act(async () => {
      await expect(ref.current!.validateFields()).resolves.toEqual(
        expect.objectContaining({ email: 'ada@rottay.dev' })
      );
    });
  });

  it('scrollToField scrolls the named field into view', () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: scrollIntoView,
    });
    const ref = renderWithInstance();

    ref.current!.scrollToField('email');

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(screen.getByLabelText(/^Email/));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });
});

describe('Form rustic engine - touched field', () => {
  const successIcon = (container: HTMLElement) =>
    container.querySelector('[data-part="feedback-icon"][data-status="success"]');

  it('reaches the hasFeedback success icon from a user edit alone', async () => {
    const { container } = wrap(
      <RusticForm hasFeedback>
        <RusticForm.Item name="email" label="Email" rules={[{ min: 3, message: 'Too short' }]}>
          <input />
        </RusticForm.Item>
      </RusticForm>
    );

    expect(successIcon(container)).toBeNull();

    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'a@b.co' } });

    await waitFor(() => expect(successIcon(container)).not.toBeNull());
  });

  it('re-validates a touched dependent field when its dependency changes', async () => {
    const validator = vi.fn();
    wrap(
      <RusticForm>
        <RusticForm.Item name="password" label="Password">
          <input />
        </RusticForm.Item>
        <RusticForm.Item name="confirm" label="Confirm" dependencies={['password']} rules={[{ validator }]}>
          <input />
        </RusticForm.Item>
      </RusticForm>
    );

    fireEvent.change(screen.getByLabelText(/^Confirm/), { target: { value: 'abc' } });
    await waitFor(() => expect(validator).toHaveBeenCalled());
    const afterOwnEdit = validator.mock.calls.length;

    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'longenough' } });
    await waitFor(() => expect(validator.mock.calls.length).toBeGreaterThan(afterOwnEdit));
  });
});
