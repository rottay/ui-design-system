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

describe('the rendered form and the public FormInstance read one state owner', () => {
  const ENGINES = [['modern', ModernForm], ['rustic', RusticForm]] as const;

  it.each(ENGINES)(
    '%s: initial values, user edits, programmatic edits, errors and both resets agree',
    async (_engine, Engine) => {
      const F = Engine as typeof ModernForm;
      const ref = React.createRef<FormInstance>();
      const { container } = en(
        <F ref={ref} initialValues={{ city: 'Quito', country: 'EC' }}>
          <F.Item name="city" label="City"><input aria-label="City" /></F.Item>
          <F.Item name="country" label="Country"><input aria-label="Country" /></F.Item>
          <F.Item name="email" label="Email" rules={[{ required: true, message: 'Required email' }]}>
            <input aria-label="Email" />
          </F.Item>
        </F>,
      );
      const instance = ref.current!;
      const city = screen.getByLabelText('City');
      const country = screen.getByLabelText('Country');

      expect(city).toHaveValue('Quito');
      expect(instance.getFieldValue('city')).toBe('Quito');
      expect(instance.getFieldsValue()).toEqual({ city: 'Quito', country: 'EC' });
      expect(instance.isFieldTouched('city')).toBe(false);
      expect(instance.isFieldsTouched()).toBe(false);

      fireEvent.change(city, { target: { value: 'Lima' } });
      expect(city).toHaveValue('Lima');
      expect(instance.getFieldValue('city')).toBe('Lima');
      expect(instance.isFieldTouched('city')).toBe(true);
      expect(instance.isFieldsTouched()).toBe(true);

      act(() => instance.setFieldValue('country', 'PE'));
      expect(country).toHaveValue('PE');
      expect(instance.getFieldValue('country')).toBe('PE');

      act(() => instance.setFieldsValue({ country: 'CL' }));
      expect(country).toHaveValue('CL');
      expect(instance.getFieldValue('country')).toBe('CL');

      await act(async () => { await instance.validateFields().catch(() => {}); });
      expect(screen.getAllByText('Required email').length).toBeGreaterThan(0);
      expect(instance.getFieldError('email')).toEqual(['Required email']);
      expect(instance.getFieldsError()).toContainEqual({ name: 'email', errors: ['Required email'] });

      act(() => instance.resetFields(['email']));
      expect(screen.queryByText('Required email')).toBeNull();
      expect(instance.getFieldError('email')).toEqual([]);
      expect(city).toHaveValue('Lima');
      expect(instance.getFieldValue('city')).toBe('Lima');

      act(() => instance.resetFields());
      expect(city).toHaveValue('Quito');
      expect(country).toHaveValue('EC');
      expect(instance.getFieldValue('city')).toBe('Quito');
      expect(instance.getFieldsValue()).toEqual({ city: 'Quito', country: 'EC' });
      expect(instance.isFieldTouched('city')).toBe(false);
      expect(container.querySelector('[data-part="feedback-icon"]')).toBeNull();
    },
  );

  it.each(ENGINES)('%s: the validating window is visible to the instance and to the field', async (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    let release: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => { release = resolve; });
    const { container } = en(
      <F ref={ref} hasFeedback>
        <F.Item name="handle" label="Handle" rules={[{ validator: async () => { await pending; } }]}>
          <input aria-label="Handle" />
        </F.Item>
      </F>,
    );
    const instance = ref.current!;
    expect(instance.isFieldValidating('handle')).toBe(false);

    let settled: Promise<unknown> | undefined;
    await act(async () => { settled = instance.validateFields().catch(() => {}); });
    expect(instance.isFieldValidating('handle')).toBe(true);
    expect(container.querySelector('[data-part="feedback-icon"]')).toHaveAttribute('data-status', 'validating');

    await act(async () => { release!(); await settled; });
    expect(instance.isFieldValidating('handle')).toBe(false);
    expect(container.querySelector('[data-part="feedback-icon"][data-status="validating"]')).toBeNull();
  });
});

describe('reset restores the effective field defaults', () => {
  const ENGINES = [['modern', ModernForm], ['rustic', RusticForm]] as const;

  it.each(ENGINES)('%s: a full and a selective reset both restore a Form.Item initialValue', (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    en(
      <F ref={ref}>
        <F.Item name="city" label="City" initialValue="Quito"><input aria-label="City" /></F.Item>
      </F>,
    );
    const instance = ref.current!;
    const city = screen.getByLabelText('City');
    expect(city).toHaveValue('Quito');
    expect(instance.getFieldValue('city')).toBe('Quito');

    fireEvent.change(city, { target: { value: 'Lima' } });
    expect(instance.getFieldValue('city')).toBe('Lima');
    act(() => instance.resetFields(['city']));
    expect(city).toHaveValue('Quito');
    expect(instance.getFieldValue('city')).toBe('Quito');
    expect(instance.isFieldTouched('city')).toBe(false);

    fireEvent.change(city, { target: { value: 'Lima' } });
    act(() => instance.resetFields());
    expect(city).toHaveValue('Quito');
    expect(instance.getFieldsValue()).toEqual({ city: 'Quito' });
    expect(instance.isFieldsTouched()).toBe(false);
  });

  it.each(ENGINES)('%s: the form initialValues entry wins over the item initialValue at mount and on reset', (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    en(
      <F ref={ref} initialValues={{ city: 'Cusco' }}>
        <F.Item name="city" label="City" initialValue="Quito"><input aria-label="City" /></F.Item>
        <F.Item name="country" label="Country" initialValue="EC"><input aria-label="Country" /></F.Item>
      </F>,
    );
    const instance = ref.current!;
    const city = screen.getByLabelText('City');
    const country = screen.getByLabelText('Country');
    expect(city).toHaveValue('Cusco');
    expect(country).toHaveValue('EC');
    expect(instance.getFieldsValue()).toEqual({ city: 'Cusco', country: 'EC' });

    fireEvent.change(city, { target: { value: 'Lima' } });
    fireEvent.change(country, { target: { value: 'PE' } });
    act(() => instance.resetFields());
    expect(city).toHaveValue('Cusco');
    expect(country).toHaveValue('EC');
    expect(instance.getFieldsValue()).toEqual({ city: 'Cusco', country: 'EC' });

    fireEvent.change(city, { target: { value: 'Lima' } });
    act(() => instance.resetFields(['city']));
    expect(city).toHaveValue('Cusco');
    expect(instance.getFieldValue('city')).toBe('Cusco');
  });

  it.each(ENGINES)('%s: a selective reset leaves the neighbouring edit and its touched state alone', (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    en(
      <F ref={ref}>
        <F.Item name="city" label="City" initialValue="Quito"><input aria-label="City" /></F.Item>
        <F.Item name="country" label="Country" initialValue="EC"><input aria-label="Country" /></F.Item>
      </F>,
    );
    const instance = ref.current!;
    const city = screen.getByLabelText('City');
    const country = screen.getByLabelText('Country');

    fireEvent.change(city, { target: { value: 'Lima' } });
    fireEvent.change(country, { target: { value: 'PE' } });
    act(() => instance.resetFields(['city']));
    expect(city).toHaveValue('Quito');
    expect(country).toHaveValue('PE');
    expect(instance.getFieldsValue()).toEqual({ city: 'Quito', country: 'PE' });
    expect(instance.isFieldTouched('city')).toBe(false);
    expect(instance.isFieldTouched('country')).toBe(true);
  });

  it.each(ENGINES)('%s: a reset clears the failed validation and validates the restored default', async (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    en(
      <F ref={ref}>
        <F.Item name="city" label="City" initialValue="Quito" rules={[{ required: true, message: 'City is required' }]}>
          <input aria-label="City" />
        </F.Item>
      </F>,
    );
    const instance = ref.current!;
    const city = screen.getByLabelText('City');

    fireEvent.change(city, { target: { value: '' } });
    await act(async () => { await instance.validateFields().catch(() => {}); });
    expect(screen.getAllByText('City is required').length).toBeGreaterThan(0);
    expect(instance.getFieldError('city')).toEqual(['City is required']);

    act(() => instance.resetFields(['city']));
    expect(screen.queryByText('City is required')).toBeNull();
    expect(instance.getFieldError('city')).toEqual([]);
    expect(city).toHaveValue('Quito');
    expect(instance.isFieldTouched('city')).toBe(false);
    await expect(instance.validateFields()).resolves.toEqual({ city: 'Quito' });
  });

  it.each(ENGINES)('%s: a remounted field keeps its preserved edit and registers its default for the next reset', (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    function Harness() {
      const [show, setShow] = React.useState(true);
      return (
        <>
          <button type="button" onClick={() => setShow((current) => !current)}>Toggle</button>
          <F ref={ref}>
            {show && <F.Item name="city" label="City" initialValue="Quito"><input aria-label="City" /></F.Item>}
          </F>
        </>
      );
    }
    en(<Harness />);
    const instance = ref.current!;
    const toggle = screen.getByRole('button', { name: 'Toggle' });

    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Lima' } });
    fireEvent.click(toggle);
    expect(screen.queryByLabelText('City')).toBeNull();
    expect(instance.getFieldValue('city')).toBe('Lima');

    fireEvent.click(toggle);
    expect(screen.getByLabelText('City')).toHaveValue('Lima');
    act(() => instance.resetFields());
    expect(screen.getByLabelText('City')).toHaveValue('Quito');
    expect(instance.getFieldValue('city')).toBe('Quito');

    fireEvent.click(toggle);
    act(() => instance.resetFields());
    expect(instance.getFieldValue('city')).toBeUndefined();
    fireEvent.click(toggle);
    expect(screen.getByLabelText('City')).toHaveValue('Quito');
    expect(instance.getFieldValue('city')).toBe('Quito');
  });
});
