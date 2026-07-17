import React from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Form as ModernForm, useForm as useModernForm } from '../engines/modern';
import { Form as RusticForm, useForm as useRusticForm } from '../engines/rustic';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

const ENGINE_HOOKS = [
  ['modern', useModernForm],
  ['rustic', useRusticForm],
] as const;

const ENGINE_FORMS = [
  ['modern', ModernForm],
  ['rustic', RusticForm],
] as const;

const ENGINE_FORM_SUITES = [
  ['modern', ModernForm, useModernForm],
  ['rustic', RusticForm, useRusticForm],
] as const;

function renderEngineForm(node: React.ReactElement, engine: 'modern' | 'rustic') {
  if (engine === 'rustic') {
    return render(
      <I18nProvider locale="en" fallbackLocale="en">
        {node}
      </I18nProvider>
    );
  }

  return render(node);
}

describe('Form engine hooks', () => {
  it.each(ENGINE_HOOKS)('covers the %s useForm instance helpers directly', async (_engine, useEngineForm) => {
    const { result } = renderHook(() => useEngineForm<Record<string, unknown>>());
    const form = (result.current as any)[0];

    expect(form.getFieldsValue()).toEqual({});
    expect(form.isFieldsTouched()).toBe(false);
    expect(form.isFieldTouched('email')).toBe(false);
    expect(form.getFieldError('email')).toEqual([]);
    expect(form.getFieldsError()).toEqual([]);
    expect(form.isFieldValidating('email')).toBe(false);
    expect(form.scrollToField('email')).toBeUndefined();

    act(() => {
      form.setFieldValue('email', 'ada@rottay.dev');
      form.setFieldsValue({ role: 'admin', enabled: true });
    });

    expect(form.getFieldValue('email')).toBe('ada@rottay.dev');
    expect(form.getFieldsValue(['email', 'role'])).toEqual({
      email: 'ada@rottay.dev',
      role: 'admin',
    });

    await expect(form.validateFields()).resolves.toEqual(
      expect.objectContaining({
        email: 'ada@rottay.dev',
        role: 'admin',
        enabled: true,
      })
    );

    if (typeof form.__subscribe === 'function' && typeof form.__getValues === 'function') {
      const listener = vi.fn();
      const unsubscribe = form.__subscribe(listener);

      act(() => {
        form.setFieldValue('locale', 'en');
      });

      expect(listener).toHaveBeenCalled();
      expect(form.__getValues()).toEqual(
        expect.objectContaining({
          locale: 'en',
        })
      );

      unsubscribe();
    }

    act(() => {
      form.resetFields(['email']);
    });

    expect(form.getFieldValue('email')).toBeUndefined();
    expect(form.getFieldValue('role')).toBe('admin');

    act(() => {
      form.resetFields();
      form.submit();
    });

    expect(form.getFieldsValue()).toEqual({});
  });
});

describe('Form engine branch coverage', () => {
  it.each(ENGINE_FORMS)(
    'covers no-context guards, hidden items, initial values, validation branches, and aggregate errors in the %s engine',
    (engine, EngineForm) => {
      expect(() =>
        renderEngineForm(
          <EngineForm.Item label="Orphan item">
            <input />
          </EngineForm.Item>,
          engine
        )
      ).toThrow(/within a Form/i);

      const orphanErrors = renderEngineForm(<EngineForm.ErrorList className="orphan-error-list" />, engine);
      expect(orphanErrors.container.firstChild).toBeNull();
      orphanErrors.unmount();

      renderEngineForm(
        <EngineForm size="middle" layout="horizontal">
          <EngineForm.Item
            name="nickname"
            label="Nickname"
            initialValue="Ada"
            required
            tooltip="Public alias"
            extra="Shown on public profile"
          >
            <input aria-label="Nickname" />
          </EngineForm.Item>
          <EngineForm.Item hidden name="secret" label="Secret">
            <input aria-label="Secret" />
          </EngineForm.Item>
          <EngineForm.Item
            name="password"
            label="Password"
            hasFeedback
            validateStatus="error"
            help="Password branch help"
          >
            <input aria-label="Password" />
          </EngineForm.Item>
          <EngineForm.Item label="Standalone help">
            <input aria-label="Standalone help" />
          </EngineForm.Item>
          <EngineForm.ErrorList className="aggregate-error-list" />
          <button type="submit">Submit secure form</button>
        </EngineForm>,
        engine
      );

      expect(screen.getByLabelText('Nickname')).toHaveValue('Ada');
      expect(screen.getByText('Shown on public profile')).toBeInTheDocument();
      expect(screen.getByText('Password branch help')).toBeInTheDocument();
      expect(screen.queryByLabelText('Secret')).not.toBeInTheDocument();

      expect(document.querySelector('.aggregate-error-list')).toBeNull();
    }
  );

  it.each(ENGINE_FORMS)(
    'covers field-level error lists, checked value semantics, and list operations in the %s engine',
    async (engine, EngineForm) => {
      const handleFinishFailed = vi.fn();

      renderEngineForm(
        <EngineForm layout="inline" colon={false} requiredMark="optional" onFinishFailed={handleFinishFailed}>
          <EngineForm.Item
            name={['profile', 'email']}
            label="Profile email"
            rules={[{ required: true, message: 'Profile email is required' }]}
            tooltip="Primary contact"
            extra="Used for notifications"
          >
            <input aria-label="Profile email" />
          </EngineForm.Item>
          <EngineForm.Item
            name="consent"
            label="Consent"
            valuePropName="checked"
            validateStatus="warning"
            help="Manual consent warning"
          >
            <input type="checkbox" aria-label="Consent" />
          </EngineForm.Item>
          <EngineForm.ErrorList fieldName={['profile', 'email']} className="field-error-list" />
          <button type="submit">Save profile</button>
        </EngineForm>,
        engine
      );

      expect(screen.getByText('Used for notifications')).toBeInTheDocument();
      expect(screen.getByText('Manual consent warning')).toBeInTheDocument();
      expect(screen.queryByText('Profile email:')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

      await waitFor(() => {
        expect(handleFinishFailed).toHaveBeenCalled();
      });

      expect(screen.getAllByText('Profile email is required')).toHaveLength(2);
      expect(document.querySelector('.field-error-list')).toBeInTheDocument();

      const checkbox = screen.getByLabelText('Consent') as HTMLInputElement;
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    }
  );

  it.each(ENGINE_FORMS)(
    'covers insert, move, and array removal branches in Form.List for the %s engine',
    async (engine, EngineForm) => {
      renderEngineForm(
        <EngineForm>
          <EngineForm.List name="contacts" initialValue={[{ name: 'Ada' }, { name: 'Grace' }]}>
            {(fields, { add, remove, move }) => (
              <div>
                <button type="button" onClick={() => add(undefined, 0)}>
                  Insert first
                </button>
                <button type="button" onClick={() => add()}>
                  Append row
                </button>
                <button type="button" onClick={() => move(0, 2)}>
                  Move first to third
                </button>
                <button type="button" onClick={() => remove([0, 2])}>
                  Remove first and third
                </button>
                {fields.map((field) => (
                  <div key={field.key}>{`Contact ${field.name}`}</div>
                ))}
              </div>
            )}
          </EngineForm.List>
        </EngineForm>,
        engine
      );

      expect(screen.getByText('Contact 0')).toBeInTheDocument();
      expect(screen.getByText('Contact 1')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /insert first/i }));
      fireEvent.click(screen.getByRole('button', { name: /append row/i }));
      expect(screen.getAllByText(/Contact/)).toHaveLength(4);

      fireEvent.click(screen.getByRole('button', { name: /move first to third/i }));
      expect(screen.getAllByText(/Contact/)).toHaveLength(4);

      fireEvent.click(screen.getByRole('button', { name: /remove first and third/i }));
      await waitFor(() => {
        expect(screen.getAllByText(/Contact/)).toHaveLength(2);
      });
    }
  );

  it.each(ENGINE_FORM_SUITES)(
    'covers successful submit flows, external form syncing, and validation branches in the %s engine',
    async (engine, EngineForm, useEngineForm) => {
      const handleValuesChange = vi.fn();
      const handleFinish = vi.fn();
      const handleFinishFailed = vi.fn();
      const { result } = renderHook(() => useEngineForm<Record<string, unknown>>());
      const form = (result.current as any)[0];

      renderEngineForm(
        <EngineForm
          form={form}
          initialValues={{ status: 'draft' }}
          onValuesChange={handleValuesChange}
          onFinish={handleFinish}
          onFinishFailed={handleFinishFailed}
        >
          <EngineForm.Item
            name="code"
            label="Code"
            rules={[
              { required: true, message: 'Code required' },
              { min: 3, message: 'Code too short' },
              { max: 4, message: 'Code too long' },
              { pattern: /^[A-Z]+$/, message: 'Uppercase only' },
              {
                validator: async (_rule, value) => {
                  if (value === 'FAIL') {
                    throw new Error('Reserved value');
                  }
                },
              },
            ]}
          >
            <input aria-label="Code" />
          </EngineForm.Item>
          <EngineForm.Item name="enabled" label="Enabled" valuePropName="checked">
            <input type="checkbox" aria-label="Enabled" />
          </EngineForm.Item>
          <button type="submit">Submit valid form</button>
        </EngineForm>,
        engine
      );

      act(() => {
        form.setFieldValue('code', 'ab');
      });

      expect(screen.getByLabelText('Code')).toHaveValue('ab');

      fireEvent.click(screen.getByRole('button', { name: /submit valid form/i }));

      await waitFor(() => {
        expect(handleFinishFailed).toHaveBeenCalledTimes(1);
      });

      expect(handleFinishFailed.mock.calls[0][0].errorFields).toEqual([
        expect.objectContaining({
          name: 'code',
          errors: expect.arrayContaining(['Code too short', 'Uppercase only']),
        }),
      ]);

      act(() => {
        form.setFieldsValue({ code: 'ABCDE', enabled: true });
      });

      expect(screen.getByLabelText('Code')).toHaveValue('ABCDE');
      expect(screen.getByLabelText('Enabled')).toBeChecked();

      fireEvent.click(screen.getByRole('button', { name: /submit valid form/i }));

      await waitFor(() => {
        expect(handleFinishFailed).toHaveBeenCalledTimes(2);
      });

      expect(handleFinishFailed.mock.calls[1][0].errorFields).toEqual([
        expect.objectContaining({
          name: 'code',
          errors: expect.arrayContaining(['Code too long']),
        }),
      ]);

      act(() => {
        form.setFieldValue('code', 'FAIL');
      });

      fireEvent.click(screen.getByRole('button', { name: /submit valid form/i }));

      await waitFor(() => {
        expect(handleFinishFailed).toHaveBeenCalledTimes(3);
      });

      expect(handleFinishFailed.mock.calls[2][0].errorFields).toEqual([
        expect.objectContaining({
          name: 'code',
          errors: expect.arrayContaining(['Error: Reserved value']),
        }),
      ]);

      act(() => {
        form.setFieldValue('code', 'ABC');
      });
      fireEvent.click(screen.getByLabelText('Enabled'));

      await waitFor(() => {
        expect(handleValuesChange).toHaveBeenCalled();
      });

      expect(form.getFieldValue('code')).toBe('ABC');

      act(() => {
        form.submit();
      });

      await waitFor(() => {
        expect(handleFinish).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'ABC',
            enabled: false,
            status: 'draft',
          })
        );
      });

      act(() => {
        form.resetFields();
      });

      expect(screen.getByLabelText('Code')).toHaveValue('');
      expect(screen.getByLabelText('Enabled')).not.toBeChecked();
    }
  );
});
