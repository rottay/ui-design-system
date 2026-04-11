import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { Form } from '..';
import { renderWithEngine, STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('Form integration', () => {
  it.each(STABLE_ENGINES)('renders the live component with the %s engine', async (engine) => {
    renderWithEngine(<Form name="profile-form">Form content</Form>, engine);

    const content = await screen.findByText('Form content');
    const form = content.closest('form');

    expect(form).toBeTruthy();
    expect(form).toBeInTheDocument();
    if (engine === 'classic') {
      expect(form).toHaveAttribute('id', 'profile-form');
    } else {
      expect(form).toHaveAttribute('name', 'profile-form');
    }
  });

  it.each(STABLE_ENGINES)(
    'forwards refs through the engine factory with the %s engine',
    async (engine) => {
      const ref = createRef<any>();

      renderWithEngine(
        <Form ref={ref} name="ref-form">
          Ref content
        </Form>,
        engine
      );

      await screen.findByText('Ref content');
      expect(ref.current).toBeTruthy();
    }
  );

  it.each(STABLE_ENGINES)('applies layout and size attributes for the %s engine', async (engine) => {
    renderWithEngine(
      <Form layout="vertical" size="large" className="integration-form">
        Form content
      </Form>,
      engine
    );

    const content = await screen.findByText('Form content');
    const form = content.closest('form');

    expect(form).toBeTruthy();
    expect(form).toHaveClass('integration-form');

    if (engine === 'classic') {
      expect(form.className).toContain('ant-form-vertical');
      expect(form.className).toContain('ant-form-large');
    }
  });

  it.each(STABLE_ENGINES)('submits values with the %s engine', async (engine) => {
    const handleFinish = vi.fn();
    const ref = createRef<any>();

    renderWithEngine(
      <Form ref={ref} onFinish={handleFinish}>
        <button type="submit">Submit profile</button>
      </Form>,
      engine
    );

    await screen.findByRole('button', { name: /submit profile/i });
    ref.current?.submit?.();

    await waitFor(() => {
      expect(handleFinish).toHaveBeenCalled();
    });
  });
});

describe('Form compound components', () => {
  it('renders labels through the live Ant Design Form.Item integration', async () => {
    renderWithEngine(
      <Form>
        <Form.Item name="email" label="Email address">
          <input />
        </Form.Item>
      </Form>,
      'classic'
    );

    expect(await screen.findByText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('marks required fields when the prop or rules demand it', async () => {
    const { rerender } = renderWithEngine(
      <Form>
        <Form.Item name="required-prop" label="Required prop" required>
          <input />
        </Form.Item>
      </Form>,
      'classic'
    );

    expect(await screen.findByLabelText('Required prop')).toHaveAttribute('aria-required', 'true');

    rerender(
      <Form>
        <Form.Item name="required-rule" label="Required rule" rules={[{ required: true }]}>
          <input />
        </Form.Item>
      </Form>
    );

    expect(await screen.findByLabelText('Required rule')).toHaveAttribute('aria-required', 'true');
  });

  it('renders help and extra text with the live compound components', async () => {
    renderWithEngine(
      <Form>
        <Form.Item name="details" label="Details" help="Helpful guidance" extra="Additional context">
          <input />
        </Form.Item>
      </Form>,
      'classic'
    );

    expect(await screen.findByText('Helpful guidance')).toBeInTheDocument();
    expect(screen.getByText('Additional context')).toBeInTheDocument();
  });

  it('applies validation status styling through the live item wrapper', async () => {
    renderWithEngine(
      <Form>
        <Form.Item name="status" label="Status" validateStatus="error">
          <input />
        </Form.Item>
      </Form>,
      'classic'
    );

    const field = await screen.findByLabelText('Status');
    const formItem = field.closest('.ant-form-item');

    expect(formItem).toBeTruthy();
    expect(formItem?.className).toContain('ant-form-item-has-error');
  });

  it('renders list content through Ant Design Form.List', async () => {
    renderWithEngine(
      <Form initialValues={{ users: [{ name: 'Ada' }] }}>
        <Form.List name="users">
          {(fields) => (
            <div>
              {fields.map((field) => (
                <div key={field.key}>Field {field.name}</div>
              ))}
            </div>
          )}
        </Form.List>
      </Form>,
      'classic'
    );

    expect(await screen.findByText('Field 0')).toBeInTheDocument();
  });

  it('renders the error list component without crashing', async () => {
    renderWithEngine(
      <Form>
        <Form.ErrorList className="custom-error-list" />
      </Form>,
      'classic'
    );

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form.querySelector('.custom-error-list')).toBeTruthy();
  });

  it.each(['modern', 'rustic'] as const)(
    'keeps the public FormInstance and the live %s engine in sync',
    async (engine) => {
      const ref = createRef<any>();

      renderWithEngine(
        <Form ref={ref} engine={engine}>
          <Form.Item name="email" label="Email">
            <input aria-label="Email" />
          </Form.Item>
        </Form>,
        engine
      );

      const input = await screen.findByLabelText('Email');

      await act(async () => {
        ref.current.setFieldValue('email', 'ada@rottay.dev');
      });
      await waitFor(() => {
        expect(input).toHaveValue('ada@rottay.dev');
      });

      await act(async () => {
        ref.current.setFieldsValue({ email: 'grace@rottay.dev' });
      });
      await waitFor(() => {
        expect(input).toHaveValue('grace@rottay.dev');
      });

      await act(async () => {
        ref.current.resetFields();
      });
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'validates, fails submit, and succeeds submit in the live %s engine',
    async (engine) => {
      const onFinish = vi.fn();
      const onFinishFailed = vi.fn();
      const onValuesChange = vi.fn();

      renderWithEngine(
        <Form
          engine={engine}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          onValuesChange={onValuesChange}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email required' },
              { pattern: /@/, message: 'Invalid email format' },
            ]}
          >
            <input aria-label="Email" />
          </Form.Item>
          <button type="submit">Submit email</button>
        </Form>,
        engine
      );

      const input = await screen.findByLabelText('Email');
      fireEvent.change(input, { target: { value: 'invalid' } });

      expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
      expect(onValuesChange).toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Submit email' }));

      await waitFor(() => {
        expect(onFinishFailed).toHaveBeenCalled();
      });

      fireEvent.change(input, { target: { value: 'valid@rottay.dev' } });

      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Submit email' }));

      await waitFor(() => {
        expect(onFinish).toHaveBeenCalledWith(
          expect.objectContaining({ email: 'valid@rottay.dev' })
        );
      });
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'supports Form.List operations in the live %s engine',
    async (engine) => {
      renderWithEngine(
        <Form engine={engine}>
          <Form.List name="users" initialValue={[{ name: 'Ada' }]}>
            {(fields, { add, remove, move }) => (
              <div>
                <button type="button" onClick={() => add()}>
                  Add row
                </button>
                <button type="button" onClick={() => remove(0)}>
                  Remove first
                </button>
                <button type="button" onClick={() => move(0, 1)}>
                  Move row
                </button>
                {fields.map((field) => (
                  <div key={field.key}>{`Field ${field.name}`}</div>
                ))}
              </div>
            )}
          </Form.List>
        </Form>,
        engine
      );

      expect(await screen.findByText('Field 0')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Add row' }));
      expect(await screen.findByText('Field 1')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Move row' }));
      expect(screen.getAllByText(/Field/)).toHaveLength(2);

      fireEvent.click(screen.getByRole('button', { name: 'Remove first' }));
      await waitFor(() => {
        expect(screen.queryAllByText(/Field/).length).toBe(1);
      });
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'supports checkbox value semantics, hidden items, and partial field resets in the live %s engine',
    async (engine) => {
      const ref = createRef<any>();

      renderWithEngine(
        <Form ref={ref} engine={engine} layout="horizontal" requiredMark={false}>
          <Form.Item name="hidden" label="Hidden field" hidden>
            <input />
          </Form.Item>
          <Form.Item
            name="terms"
            label="Terms"
            valuePropName="checked"
            tooltip="Accept the terms"
            extra="Must be accepted"
          >
            <input type="checkbox" aria-label="Terms" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <input aria-label="Email" />
          </Form.Item>
        </Form>,
        engine
      );

      expect(screen.queryByText('Hidden field')).not.toBeInTheDocument();

      const checkbox = await screen.findByLabelText('Terms');
      const email = screen.getByLabelText('Email');

      expect(screen.getByText('Must be accepted')).toBeInTheDocument();

      fireEvent.click(checkbox);
      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      await act(async () => {
        ref.current.setFieldsValue({ email: 'ada@rottay.dev' });
      });
      await waitFor(() => {
        expect(email).toHaveValue('ada@rottay.dev');
      });

      await act(async () => {
        ref.current.resetFields(['email']);
      });
      await waitFor(() => {
        expect(email).toHaveValue('');
        expect(checkbox).toBeChecked();
      });
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'covers required, min, max, pattern, and async validator branches in the live %s engine',
    async (engine) => {
      const onFinish = vi.fn();
      const onFinishFailed = vi.fn();

      renderWithEngine(
        <Form engine={engine} onFinish={onFinish} onFinishFailed={onFinishFailed}>
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Username required' },
              { min: 3, message: 'Too short' },
              { max: 5, message: 'Too long' },
              { pattern: /^[a-z]+$/, message: 'Letters only' },
              {
                validator: async (_rule, value) => {
                  if (value === 'taken') {
                    throw new Error('Already taken');
                  }
                },
              },
            ]}
            hasFeedback
          >
            <input aria-label="Username" />
          </Form.Item>
          <Form.ErrorList />
          <button type="submit">Submit username</button>
        </Form>,
        engine
      );

      const input = await screen.findByLabelText('Username');

      fireEvent.change(input, { target: { value: '1' } });
      expect(input).toHaveValue('1');

      fireEvent.change(input, { target: { value: 'abcdef' } });
      expect(input).toHaveValue('abcdef');

      fireEvent.change(input, { target: { value: 'taken' } });
      expect(input).toHaveValue('taken');

      fireEvent.click(screen.getByRole('button', { name: 'Submit username' }));
      await waitFor(() => {
        expect(onFinishFailed).toHaveBeenCalled();
      });

      fireEvent.change(input, { target: { value: 'ada' } });
      await waitFor(() => {
        expect(screen.queryByText(/Already taken/)).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Submit username' }));
      await waitFor(() => {
        expect(onFinish).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'ada',
          })
        );
      });
    }
  );
});
