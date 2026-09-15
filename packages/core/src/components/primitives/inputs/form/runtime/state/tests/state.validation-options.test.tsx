/**
 * The announced rule options reach the rendered form and the public instance
 * in both engines that own a form runtime: a `warningOnly` rule warns without
 * blocking submit, and the built-in types, ranges and lengths report through
 * `validateFields`, `getFieldsError` and the item message.
 */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { FormInstance } from '../../../contracts';
import ModernForm from '../../../engines/modern';
import RusticForm from '../../../engines/rustic';

const en = (node: React.ReactNode) => render(<I18nProvider locale="en" fallbackLocale="en">{node}</I18nProvider>);
const ENGINES = [['modern', ModernForm], ['rustic', RusticForm]] as const;

describe('warningOnly through the form', () => {
  it.each(ENGINES)('%s: warns on the item, reports it on the instance and still submits', async (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();
    const { container } = en(
      <F ref={ref} onFinish={onFinish} onFinishFailed={onFinishFailed} hasFeedback>
        <F.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Password is required' }, { min: 8, warningOnly: true, message: 'Consider 8 characters' }]}
        >
          <input aria-label="Password" />
        </F.Item>
        <button type="submit">Send</button>
      </F>,
    );
    const instance = ref.current!;

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'abc' } });
    await waitFor(() => expect(screen.getByText('Consider 8 characters')).toBeInTheDocument());
    expect(instance.getFieldError('password')).toEqual([]);
    expect(instance.getFieldsError()).toContainEqual({ name: 'password', errors: [], warnings: ['Consider 8 characters'] });
    expect(container.querySelector('[data-part="feedback-icon"]')).toHaveAttribute('data-status', 'warning');
    expect(screen.getByLabelText('Password')).not.toHaveAttribute('aria-invalid');

    await expect(instance.validateFields()).resolves.toEqual({ password: 'abc' });

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ password: 'abc' }));
    expect(onFinishFailed).not.toHaveBeenCalled();
  });

  it('modern: stamps the warning posture on the item and the message', async () => {
    const { container } = en(
      <ModernForm>
        <ModernForm.Item name="handle" label="Handle" rules={[{ max: 3, warningOnly: true, message: 'Long handle' }]}>
          <input aria-label="Handle" />
        </ModernForm.Item>
      </ModernForm>,
    );
    fireEvent.change(screen.getByLabelText('Handle'), { target: { value: 'adalovelace' } });
    await waitFor(() => expect(screen.getByText('Long handle')).toBeInTheDocument());
    expect(container.querySelector('[data-part="item"]')).toHaveAttribute('data-validation', 'warning');
    expect(container.querySelector('[data-part="help-text"]')).toHaveAttribute('data-tone', 'warning');
    expect(container.querySelector('[data-part="message"]')).not.toHaveAttribute('role', 'alert');
  });

  it.each(ENGINES)('%s: an error still wins over a warning on the same field', async (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    en(
      <F ref={ref}>
        <F.Item name="code" label="Code" rules={[{ pattern: /^\d+$/, message: 'Digits only' }, { min: 6, warningOnly: true, message: 'Short code' }]}>
          <input aria-label="Code" />
        </F.Item>
      </F>,
    );
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'ab' } });
    await waitFor(() => expect(screen.getByText('Digits only')).toBeInTheDocument());
    expect(ref.current!.getFieldError('code')).toEqual(['Digits only']);
    expect(ref.current!.getFieldsError()).toContainEqual({ name: 'code', errors: ['Digits only'], warnings: ['Short code'] });
    await expect(ref.current!.validateFields()).rejects.toMatchObject({ errorFields: [{ name: 'code', errors: ['Digits only'] }] });
  });
});

describe('built-in types, lengths and ranges through the form', () => {
  it.each(ENGINES)('%s: the email type reports the engine catalog message', async (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    en(
      <F ref={ref}>
        <F.Item name="email" label="Email" rules={[{ type: 'email' }]}>
          <input aria-label="Email" />
        </F.Item>
      </F>,
    );
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nope' } });
    await waitFor(() => expect(screen.getByText('Must be a valid email')).toBeInTheDocument());
    await expect(ref.current!.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: 'email', errors: ['Must be a valid email'] }],
    });

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    await waitFor(() => expect(screen.queryByText('Must be a valid email')).toBeNull());
    await expect(ref.current!.validateFields()).resolves.toEqual({ email: 'ada@example.com' });
  });

  it.each(ENGINES)('%s: a numeric range reads the programmatic number value', async (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    en(
      <F ref={ref}>
        <F.Item name="age" label="Age" rules={[{ type: 'number', min: 18, max: 120 }]}>
          <input aria-label="Age" />
        </F.Item>
      </F>,
    );
    act(() => ref.current!.setFieldValue('age', 5));
    await expect(ref.current!.validateFields()).rejects.toMatchObject({ errorFields: [{ name: 'age', errors: ['Minimum value is 18'] }] });
    await waitFor(() => expect(screen.getByText('Minimum value is 18')).toBeInTheDocument());

    act(() => ref.current!.setFieldValue('age', 130));
    await expect(ref.current!.validateFields()).rejects.toMatchObject({ errorFields: [{ name: 'age', errors: ['Maximum value is 120'] }] });

    act(() => ref.current!.setFieldValue('age', 40));
    await expect(ref.current!.validateFields()).resolves.toEqual({ age: 40 });
  });

  it.each(ENGINES)('%s: whitespace strengthens required and len fixes the length', async (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    en(
      <F ref={ref}>
        <F.Item name="pin" label="PIN" rules={[{ required: true, whitespace: true, message: 'PIN is blank' }, { len: 4, message: 'PIN has four digits' }]}>
          <input aria-label="PIN" />
        </F.Item>
      </F>,
    );
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '    ' } });
    await waitFor(() => expect(screen.getByText('PIN is blank')).toBeInTheDocument());
    expect(ref.current!.getFieldError('pin')).toEqual(['PIN is blank']);

    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '123' } });
    await waitFor(() => expect(screen.getByText('PIN has four digits')).toBeInTheDocument());
    expect(ref.current!.getFieldError('pin')).toEqual(['PIN has four digits']);

    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '1234' } });
    await expect(ref.current!.validateFields()).resolves.toEqual({ pin: '1234' });
  });
});
