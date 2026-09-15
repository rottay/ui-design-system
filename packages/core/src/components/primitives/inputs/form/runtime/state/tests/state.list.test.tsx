/**
 * Form.List manages its rows' values on the single store in both engines that
 * own a form runtime: the list's initial rows seed the items, every operation
 * keeps values, touched and errors aligned to the index, list rules validate
 * the materialized array into the render meta, and reset restores the rows
 * and each item's effective default.
 */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { FormInstance, FormRule } from '../../../contracts';
import ModernForm from '../../../engines/modern';
import RusticForm from '../../../engines/rustic';

const en = (node: React.ReactNode) => render(<I18nProvider locale="en" fallbackLocale="en">{node}</I18nProvider>);
const ENGINES = [['modern', ModernForm], ['rustic', RusticForm]] as const;

const NAME_RULES: FormRule[] = [{ required: true, message: 'Name required' }];

const DEFAULT_ROWS = [{ name: 'Ada' }, { name: 'Grace' }];

function Users(props: {
  Engine: typeof ModernForm;
  formRef: React.RefObject<FormInstance | null>;
  /** Passed as `undefined` on purpose, the list declares no rows of its own. */
  initialValue?: Array<{ name: string }>;
  listRules?: FormRule[];
  formInitialValues?: Record<string, unknown>;
  onFinish?: (values: unknown) => void;
}) {
  const { Engine, formRef, listRules, formInitialValues, onFinish } = props;
  const initialValue = 'initialValue' in props ? props.initialValue : DEFAULT_ROWS;
  const F = Engine;
  return (
    <F ref={formRef} initialValues={formInitialValues} onFinish={onFinish}>
      <F.List name="users" initialValue={initialValue} rules={listRules}>
        {(fields, { add, remove, move }, meta) => (
          <>
            {fields.map((field) => (
              <div key={field.key} data-testid={`row-${field.name}`}>
                <F.Item name={[field.name, 'name']} label={`Name ${field.name}`} rules={NAME_RULES}>
                  <input aria-label={`Name ${field.name}`} />
                </F.Item>
                <F.Item name={[field.name, 'role']} label={`Role ${field.name}`} initialValue="dev">
                  <input aria-label={`Role ${field.name}`} />
                </F.Item>
              </div>
            ))}
            <button type="button" onClick={() => add({ name: 'Linus' })}>Append</button>
            <button type="button" onClick={() => add({ name: 'Mid' }, 1)}>Insert second</button>
            <button type="button" onClick={() => add()}>Append blank</button>
            <button type="button" onClick={() => remove(0)}>Remove first</button>
            <button type="button" onClick={() => remove([0, 1])}>Remove first two</button>
            <button type="button" onClick={() => move(0, 1)}>Swap</button>
            <div data-testid="meta">{`${meta.errors.join('|')}#${meta.warnings.join('|')}`}</div>
            <button type="submit">Send</button>
          </>
        )}
      </F.List>
    </F>
  );
}

const names = () => screen.queryAllByLabelText(/^Name \d+$/).map((node) => (node as HTMLInputElement).value);
const roles = () => screen.queryAllByLabelText(/^Role \d+$/).map((node) => (node as HTMLInputElement).value);

describe('the list seeds and materializes its rows', () => {
  it.each(ENGINES)('%s: the list initialValue fills the items and the list reads back as an array', (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} />);
    expect(names()).toEqual(['Ada', 'Grace']);
    expect(roles()).toEqual(['dev', 'dev']);
    expect(ref.current!.getFieldValue('users')).toEqual([{ name: 'Ada', role: 'dev' }, { name: 'Grace', role: 'dev' }]);
    expect(ref.current!.getFieldValue(['users', 1, 'name'])).toBe('Grace');
  });

  it.each(ENGINES)('%s: a form initialValues array seeds the rows when the list declares none', (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} initialValue={undefined} formInitialValues={{ users: [{ name: 'Ada' }] }} />);
    expect(names()).toEqual(['Ada']);
    expect(ref.current!.getFieldValue('users')).toEqual([{ name: 'Ada', role: 'dev' }]);
  });

  it.each(ENGINES)('%s: submit and getFieldsValue hand the list over as an array', async (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    const onFinish = vi.fn();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} onFinish={onFinish} />);
    expect(ref.current!.getFieldsValue()).toEqual({ users: [{ name: 'Ada', role: 'dev' }, { name: 'Grace', role: 'dev' }] });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ users: [{ name: 'Ada', role: 'dev' }, { name: 'Grace', role: 'dev' }] }));
  });
});

describe('operations keep values, touched and errors aligned to the index', () => {
  it.each(ENGINES)('%s: add appends and inserts with its default value and shifts the rows after it', (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} />);
    const instance = ref.current!;

    fireEvent.change(screen.getByLabelText('Name 1'), { target: { value: 'Grace H' } });
    expect(instance.isFieldTouched(['users', 1, 'name'])).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Insert second' }));
    expect(names()).toEqual(['Ada', 'Mid', 'Grace H']);
    expect(roles()).toEqual(['dev', 'dev', 'dev']);
    expect(instance.isFieldTouched(['users', 1, 'name'])).toBe(false);
    expect(instance.isFieldTouched(['users', 2, 'name'])).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Append' }));
    expect(names()).toEqual(['Ada', 'Mid', 'Grace H', 'Linus']);

    fireEvent.click(screen.getByRole('button', { name: 'Append blank' }));
    expect(names()).toEqual(['Ada', 'Mid', 'Grace H', 'Linus', '']);
    expect(roles()[4]).toBe('dev');
    expect(instance.getFieldValue('users')).toHaveLength(5);
  });

  it.each(ENGINES)('%s: remove drops the row and carries the survivors with their errors', async (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} />);
    const instance = ref.current!;

    fireEvent.change(screen.getByLabelText('Name 1'), { target: { value: '' } });
    await waitFor(() => expect(screen.getByText('Name required')).toBeInTheDocument());
    expect(instance.getFieldError(['users', 1, 'name'])).toEqual(['Name required']);

    fireEvent.click(screen.getByRole('button', { name: 'Remove first' }));
    expect(names()).toEqual(['']);
    expect(instance.getFieldValue('users')).toEqual([{ name: '', role: 'dev' }]);
    expect(instance.getFieldError(['users', 0, 'name'])).toEqual(['Name required']);
    expect(instance.getFieldError(['users', 1, 'name'])).toEqual([]);
    expect(instance.isFieldTouched(['users', 0, 'name'])).toBe(true);
    expect(screen.getAllByText('Name required')).toHaveLength(1);
  });

  it.each(ENGINES)('%s: remove takes several indices at once', (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} />);
    fireEvent.click(screen.getByRole('button', { name: 'Append' }));
    expect(names()).toEqual(['Ada', 'Grace', 'Linus']);
    fireEvent.click(screen.getByRole('button', { name: 'Remove first two' }));
    expect(names()).toEqual(['Linus']);
    expect(ref.current!.getFieldValue('users')).toEqual([{ name: 'Linus', role: 'dev' }]);
  });

  it.each(ENGINES)('%s: move carries the row state with it', (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} />);
    const instance = ref.current!;

    fireEvent.change(screen.getByLabelText('Name 1'), { target: { value: 'Grace H' } });
    fireEvent.click(screen.getByRole('button', { name: 'Swap' }));
    expect(names()).toEqual(['Grace H', 'Ada']);
    expect(instance.getFieldValue('users')).toEqual([{ name: 'Grace H', role: 'dev' }, { name: 'Ada', role: 'dev' }]);
    expect(instance.isFieldTouched(['users', 0, 'name'])).toBe(true);
    expect(instance.isFieldTouched(['users', 1, 'name'])).toBe(false);
  });

  it.each(ENGINES)('%s: each item validates on its own after the rows shift', async (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} />);
    fireEvent.click(screen.getByRole('button', { name: 'Append blank' }));
    await expect(ref.current!.validateFields()).rejects.toMatchObject({ errorFields: [{ name: 'users.2.name', errors: ['Name required'] }] });
    fireEvent.click(screen.getByRole('button', { name: 'Remove first' }));
    await expect(ref.current!.validateFields()).rejects.toMatchObject({ errorFields: [{ name: 'users.1.name', errors: ['Name required'] }] });
    fireEvent.change(screen.getByLabelText('Name 1'), { target: { value: 'Linus' } });
    await expect(ref.current!.validateFields()).resolves.toEqual({ users: [{ name: 'Grace', role: 'dev' }, { name: 'Linus', role: 'dev' }] });
  });
});

describe('list rules validate the materialized array', () => {
  it.each(ENGINES)('%s: a list rule reports into the render meta and blocks submit', async (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();
    en(
      <Users
        Engine={Engine as typeof ModernForm}
        formRef={ref}
        onFinish={onFinish}
        listRules={[{ type: 'array', min: 2, message: 'Two people at least' }, { max: 2, warningOnly: true, message: 'That is a crowd' }]}
      />,
    );
    const instance = ref.current!;
    await expect(instance.validateFields()).resolves.toBeDefined();
    expect(screen.getByTestId('meta')).toHaveTextContent('#');

    fireEvent.click(screen.getByRole('button', { name: 'Remove first' }));
    await expect(instance.validateFields()).rejects.toMatchObject({ errorFields: [{ name: 'users', errors: ['Two people at least'] }] });
    await waitFor(() => expect(screen.getByTestId('meta')).toHaveTextContent('Two people at least#'));

    fireEvent.click(screen.getByRole('button', { name: 'Append' }));
    await waitFor(() => expect(screen.getByTestId('meta')).toHaveTextContent(/^#$/));

    fireEvent.click(screen.getByRole('button', { name: 'Append' }));
    await expect(instance.validateFields()).resolves.toBeDefined();
    await waitFor(() => expect(screen.getByTestId('meta')).toHaveTextContent('#That is a crowd'));
    expect(instance.getFieldsError()).toContainEqual({ name: 'users', errors: [], warnings: ['That is a crowd'] });
  });
});

describe('reset restores the rows and the effective item defaults', () => {
  it.each(ENGINES)('%s: a full reset returns the initial rows, values and untouched state', (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} />);
    const instance = ref.current!;

    fireEvent.change(screen.getByLabelText('Name 0'), { target: { value: 'Lima' } });
    fireEvent.change(screen.getByLabelText('Role 1'), { target: { value: 'ops' } });
    fireEvent.click(screen.getByRole('button', { name: 'Append' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove first' }));
    expect(names()).toEqual(['Grace', 'Linus']);

    act(() => instance.resetFields());
    expect(names()).toEqual(['Ada', 'Grace']);
    expect(roles()).toEqual(['dev', 'dev']);
    expect(instance.getFieldValue('users')).toEqual([{ name: 'Ada', role: 'dev' }, { name: 'Grace', role: 'dev' }]);
    expect(instance.isFieldsTouched()).toBe(false);
  });

  it.each(ENGINES)('%s: a selective reset of the list or of one item restores just that', (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} />);
    const instance = ref.current!;

    fireEvent.change(screen.getByLabelText('Name 0'), { target: { value: 'Lima' } });
    fireEvent.change(screen.getByLabelText('Role 1'), { target: { value: 'ops' } });
    act(() => instance.resetFields([['users', 1, 'role']]));
    expect(names()).toEqual(['Lima', 'Grace']);
    expect(roles()).toEqual(['dev', 'dev']);
    expect(instance.isFieldTouched(['users', 0, 'name'])).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Append' }));
    act(() => instance.resetFields(['users']));
    expect(names()).toEqual(['Ada', 'Grace']);
    expect(instance.isFieldTouched(['users', 0, 'name'])).toBe(false);
  });

  it.each(ENGINES)('%s: reset clears a failed list rule and the item errors under it', async (_engine, Engine) => {
    const ref = React.createRef<FormInstance>();
    en(<Users Engine={Engine as typeof ModernForm} formRef={ref} listRules={[{ min: 2, message: 'Two people at least' }]} />);
    const instance = ref.current!;
    fireEvent.click(screen.getByRole('button', { name: 'Remove first' }));
    fireEvent.change(screen.getByLabelText('Name 0'), { target: { value: '' } });
    await act(async () => { await instance.validateFields().catch(() => {}); });
    expect(instance.getFieldError('users')).toEqual(['Two people at least']);
    expect(instance.getFieldError(['users', 0, 'name'])).toEqual(['Name required']);

    act(() => instance.resetFields());
    expect(instance.getFieldError('users')).toEqual([]);
    expect(instance.getFieldError(['users', 0, 'name'])).toEqual([]);
    expect(names()).toEqual(['Ada', 'Grace']);
    await expect(instance.validateFields()).resolves.toBeDefined();
  });
});

describe('the list follows the preserve contract when it leaves the tree', () => {
  it.each(ENGINES)('%s: an unmounted list keeps its values and shows them again on remount', (_engine, Engine) => {
    const F = Engine as typeof ModernForm;
    const ref = React.createRef<FormInstance>();
    function Harness() {
      const [show, setShow] = React.useState(true);
      return (
        <>
          <button type="button" onClick={() => setShow((current) => !current)}>Toggle</button>
          <F ref={ref}>
            {show && (
              <F.List name="users" initialValue={[{ name: 'Ada' }]}>
                {(fields, { add }) => (
                  <>
                    {fields.map((field) => (
                      <F.Item key={field.key} name={[field.name, 'name']} label={`Name ${field.name}`}>
                        <input aria-label={`Name ${field.name}`} />
                      </F.Item>
                    ))}
                    <button type="button" onClick={() => add({ name: 'Grace' })}>Append</button>
                  </>
                )}
              </F.List>
            )}
          </F>
        </>
      );
    }
    en(<Harness />);
    fireEvent.change(screen.getByLabelText('Name 0'), { target: { value: 'Lima' } });
    fireEvent.click(screen.getByRole('button', { name: 'Append' }));
    expect(names()).toEqual(['Lima', 'Grace']);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(names()).toEqual([]);
    expect(ref.current!.getFieldValue('users')).toEqual([{ name: 'Lima' }, { name: 'Grace' }]);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(names()).toEqual(['Lima', 'Grace']);
  });
});
