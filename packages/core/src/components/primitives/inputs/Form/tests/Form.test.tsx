/**
 * Form Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockForm = ({
      layout,
      size,
      disabled,
      colon,
      requiredMark,
      onFinish,
      onFinishFailed,
      children,
      className,
      ...props
    }: any) => (
      <form
        data-testid="form"
        data-layout={layout}
        data-size={size}
        data-disabled={disabled}
        data-colon={colon}
        data-required-mark={requiredMark}
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          onFinish?.({});
        }}
        {...props}
      >
        {children}
      </form>
    );

    MockForm.displayName = 'Form';

    MockForm.Item = ({
      name,
      label,
      required,
      rules,
      validateStatus,
      help,
      extra,
      children,
      className,
      ...props
    }: any) => (
      <div
        data-testid={`form-item-${name || 'unnamed'}`}
        data-name={name}
        data-required={required || rules?.some((r: any) => r.required)}
        data-validate-status={validateStatus}
        className={className}
        {...props}
      >
        {label && <label data-testid={`form-label-${name}`}>{label}</label>}
        {children}
        {help && <span data-testid={`form-help-${name}`}>{help}</span>}
        {extra && <span data-testid={`form-extra-${name}`}>{extra}</span>}
      </div>
    );

    MockForm.List = ({ name, children }: any) => (
      <div data-testid={`form-list-${name}`}>
        {children?.(
          [{ name: 0, key: 0, isListField: true }],
          { add: vi.fn(), remove: vi.fn(), move: vi.fn() },
          { errors: [], warnings: [] }
        )}
      </div>
    );

    MockForm.ErrorList = ({ fieldName, className }: any) => (
      <div data-testid={`form-error-list-${fieldName}`} className={className}>
        Errors
      </div>
    );

    return MockForm;
  },
}));

describe('Form', () => {
  it('renders correctly', () => {
    render(<Form>Content</Form>);
    expect(screen.getByTestId('form')).toBeInTheDocument();
  });

  it.each(['horizontal', 'vertical', 'inline'] as const)('renders layout %s', (layout) => {
    render(<Form layout={layout}>Content</Form>);
    expect(screen.getByTestId('form')).toHaveAttribute('data-layout', layout);
  });

  it.each(['small', 'default', 'large'] as const)('renders size %s', (size) => {
    render(<Form size={size}>Content</Form>);
    expect(screen.getByTestId('form')).toHaveAttribute('data-size', size);
  });

  it('renders disabled state', () => {
    render(<Form disabled>Content</Form>);
    expect(screen.getByTestId('form')).toHaveAttribute('data-disabled', 'true');
  });

  it('renders colon setting', () => {
    render(<Form colon>Content</Form>);
    expect(screen.getByTestId('form')).toHaveAttribute('data-colon', 'true');
  });

  it('renders required mark setting', () => {
    render(<Form requiredMark>Content</Form>);
    expect(screen.getByTestId('form')).toHaveAttribute('data-required-mark', 'true');
  });

  it('calls onFinish when form is submitted', () => {
    const handleFinish = vi.fn();
    render(
      <Form onFinish={handleFinish}>
        <button type="submit">Submit</button>
      </Form>
    );
    fireEvent.submit(screen.getByTestId('form'));
    expect(handleFinish).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Form className="custom-class">Content</Form>);
    expect(screen.getByTestId('form')).toHaveClass('custom-class');
  });
});

describe('Form.Item', () => {
  it('renders correctly', () => {
    render(
      <Form>
        <Form.Item name="test">
          <input />
        </Form.Item>
      </Form>
    );
    expect(screen.getByTestId('form-item-test')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(
      <Form>
        <Form.Item name="test" label="Test Label">
          <input />
        </Form.Item>
      </Form>
    );
    expect(screen.getByTestId('form-label-test')).toHaveTextContent('Test Label');
  });

  it('renders required field', () => {
    render(
      <Form>
        <Form.Item name="test" required>
          <input />
        </Form.Item>
      </Form>
    );
    expect(screen.getByTestId('form-item-test')).toHaveAttribute('data-required', 'true');
  });

  it('renders required from rules', () => {
    render(
      <Form>
        <Form.Item name="test" rules={[{ required: true }]}>
          <input />
        </Form.Item>
      </Form>
    );
    expect(screen.getByTestId('form-item-test')).toHaveAttribute('data-required', 'true');
  });

  it('renders with help text', () => {
    render(
      <Form>
        <Form.Item name="test" help="Help text">
          <input />
        </Form.Item>
      </Form>
    );
    expect(screen.getByTestId('form-help-test')).toHaveTextContent('Help text');
  });

  it('renders with extra text', () => {
    render(
      <Form>
        <Form.Item name="test" extra="Extra info">
          <input />
        </Form.Item>
      </Form>
    );
    expect(screen.getByTestId('form-extra-test')).toHaveTextContent('Extra info');
  });

  it('renders with validate status', () => {
    render(
      <Form>
        <Form.Item name="test" validateStatus="error">
          <input />
        </Form.Item>
      </Form>
    );
    expect(screen.getByTestId('form-item-test')).toHaveAttribute('data-validate-status', 'error');
  });
});

describe('Form.List', () => {
  it('renders correctly', () => {
    render(
      <Form>
        <Form.List name="users">
          {(fields) => (
            <div>
              {fields.map((field) => (
                <div key={field.key}>Field {field.name}</div>
              ))}
            </div>
          )}
        </Form.List>
      </Form>
    );
    expect(screen.getByTestId('form-list-users')).toBeInTheDocument();
  });
});

describe('Form.ErrorList', () => {
  it('renders correctly', () => {
    render(
      <Form>
        <Form.ErrorList fieldName="test" />
      </Form>
    );
    expect(screen.getByTestId('form-error-list-test')).toBeInTheDocument();
  });
});

describe('Form engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Form engine={engine}>Content</Form>);
    expect(screen.getByTestId('form')).toBeInTheDocument();
  });
});

describe('Form tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Form>Test</Form>);
    expect(screen.getByTestId('form')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
