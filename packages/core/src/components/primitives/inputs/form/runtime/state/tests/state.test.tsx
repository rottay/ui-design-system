import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { FORM_DEFAULTS } from '../../../contracts';
import type { FormInstance } from '../../../contracts';
import ModernForm from '../../../engines/modern';
import RusticForm from '../../../engines/rustic';
import { useForm } from '..';

const en = (node: React.ReactNode) => render(<I18nProvider locale="en" fallbackLocale="en">{node}</I18nProvider>);

describe('the shared form runtime', () => {
  it.each([['modern', ModernForm], ['rustic', RusticForm]] as const)(
    '%s: validates on submit, reports errors and finishes once the field is valid',
    async (_engine, Form) => {
      const onFinish = vi.fn();
      const onFinishFailed = vi.fn();
      const F = Form as typeof ModernForm;
      en(
        <F onFinish={onFinish} onFinishFailed={onFinishFailed}>
          <F.Item name="email" label="Email" rules={[{ required: true, message: 'Email is required' }]}>
            <input aria-label="Email" />
          </F.Item>
          <button type="submit">Send</button>
        </F>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));
      await waitFor(() => expect(onFinishFailed).toHaveBeenCalledTimes(1));
      expect(onFinishFailed.mock.calls[0]![0].errorFields).toEqual([{ name: 'email', errors: ['Email is required'] }]);

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));
      await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ email: 'ada@example.com' }));
    },
  );

  it('keeps one FormInstance identity and syncs programmatic writes into the rendered field', async () => {
    let instance: FormInstance | undefined;
    function Harness() {
      const [form] = useForm();
      instance = form;
      return (
        <ModernForm form={form}>
          <ModernForm.Item name="city" label="City"><input aria-label="City" /></ModernForm.Item>
        </ModernForm>
      );
    }
    en(<Harness />);
    const first = instance;
    act(() => instance!.setFieldsValue({ city: 'Lima' }));
    expect(screen.getByLabelText('City')).toHaveValue('Lima');
    expect(instance).toBe(first);
    await expect(instance!.validateFields()).resolves.toEqual({ city: 'Lima' });
  });

  it('renders the owner-decided default layout in both engines that own a form runtime', () => {
    expect(FORM_DEFAULTS.layout).toBe('vertical');
    const { container } = en(
      <>
        <ModernForm><ModernForm.Item name="a" label="A"><input aria-label="A" /></ModernForm.Item></ModernForm>
        <RusticForm><RusticForm.Item name="b" label="B"><input aria-label="B" /></RusticForm.Item></RusticForm>
      </>,
    );
    const [modern, rustic] = Array.from(container.querySelectorAll('form'));
    expect(modern).toHaveAttribute('data-layout', FORM_DEFAULTS.layout);
    expect(rustic!.style.flexDirection).toBe('column');
  });
});
