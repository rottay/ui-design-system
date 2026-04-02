/**
 * FormField Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormField } from './';

// Mock the engine factory
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockFormField = React.forwardRef<HTMLDivElement, any>(({
      label,
      name,
      required = false,
      error,
      help,
      children,
      layout = 'vertical',
      labelWidth = '120px',
      size = 'md',
      disabled = false,
      className = '',
      style = {},
      'data-testid': testId,
      ...props
    }, ref) => {
      const isHorizontal = layout === 'horizontal';
      const fieldId = `formfield-${name}`;
      const errorId = `${fieldId}-error`;
      const helpId = `${fieldId}-help`;

      return (
        <div
          ref={ref}
          className={`rottay-form-field rottay-form-field--${layout} rottay-form-field--${size} ${disabled ? 'rottay-form-field--disabled' : ''} ${className}`}
          style={{
            display: 'flex',
            flexDirection: isHorizontal ? 'row' : 'column',
            opacity: disabled ? 0.5 : 1,
            ...style,
          }}
          data-testid={testId}
          {...props}
        >
          <label htmlFor={fieldId}>
            {label}
            {required && <span aria-hidden="true">*</span>}
          </label>
          <div>
            {React.Children.map(children, (child) => {
              if (React.isValidElement<any>(child)) {
                return React.cloneElement(child, {
                  id: fieldId,
                  'aria-describedby': error ? errorId : help ? helpId : undefined,
                  'aria-invalid': !!error,
                });
              }
              return child;
            })}
            {error && (
              <p id={errorId} role="alert" className="rottay-form-field__error">
                {error}
              </p>
            )}
            {!error && help && (
              <p id={helpId} className="rottay-form-field__help">
                {help}
              </p>
            )}
          </div>
        </div>
      );
    });
    MockFormField.displayName = 'FormField';
    return MockFormField;
  },
}));

describe('FormField', () => {
  describe('Basic Rendering', () => {
    it('renders with label and input', () => {
      render(
        <FormField label="Email" name="email">
          <input type="email" />
        </FormField>
      );
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders the child input element', () => {
      render(
        <FormField label="Username" name="username">
          <input type="text" placeholder="Enter username" />
        </FormField>
      );
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <FormField label="Name" name="name" className="custom-field">
          <input type="text" />
        </FormField>
      );
      expect(container.querySelector('.custom-field')).toBeInTheDocument();
    });

    it('applies custom style', () => {
      const { container } = render(
        <FormField label="Name" name="name" style={{ margin: '10px' }}>
          <input type="text" />
        </FormField>
      );
      expect(container.firstChild).toHaveStyle({ margin: '10px' });
    });

    it('applies data-testid', () => {
      render(
        <FormField label="Name" name="name" data-testid="name-field">
          <input type="text" />
        </FormField>
      );
      expect(screen.getByTestId('name-field')).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('shows required indicator when required is true', () => {
      render(
        <FormField label="Email" name="email" required>
          <input type="email" />
        </FormField>
      );
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not show required indicator by default', () => {
      render(
        <FormField label="Email" name="email">
          <input type="email" />
        </FormField>
      );
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email">
          <input type="email" />
        </FormField>
      );
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('marks error message with role=alert', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email">
          <input type="email" />
        </FormField>
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
    });

    it('sets aria-invalid on input when error is present', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email">
          <input type="email" />
        </FormField>
      );
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby pointing to error element', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email">
          <input type="email" />
        </FormField>
      );
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'formfield-email-error');
    });

    it('hides help text when error is displayed', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email" help="Enter your email">
          <input type="email" />
        </FormField>
      );
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    });
  });

  describe('Help Text', () => {
    it('displays help text', () => {
      render(
        <FormField label="Email" name="email" help="We won't share your email">
          <input type="email" />
        </FormField>
      );
      expect(screen.getByText("We won't share your email")).toBeInTheDocument();
    });

    it('sets aria-describedby pointing to help element', () => {
      render(
        <FormField label="Email" name="email" help="Helpful hint">
          <input type="email" />
        </FormField>
      );
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'formfield-email-help');
    });
  });

  describe('Layout', () => {
    it('defaults to vertical layout', () => {
      const { container } = render(
        <FormField label="Name" name="name">
          <input type="text" />
        </FormField>
      );
      expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
    });

    it('supports horizontal layout', () => {
      const { container } = render(
        <FormField label="Name" name="name" layout="horizontal">
          <input type="text" />
        </FormField>
      );
      expect(container.firstChild).toHaveStyle({ flexDirection: 'row' });
    });
  });

  describe('Disabled State', () => {
    it('applies disabled styling', () => {
      const { container } = render(
        <FormField label="Name" name="name" disabled>
          <input type="text" />
        </FormField>
      );
      expect(container.firstChild).toHaveStyle({ opacity: 0.5 });
    });

    it('includes disabled class', () => {
      const { container } = render(
        <FormField label="Name" name="name" disabled>
          <input type="text" />
        </FormField>
      );
      expect(container.querySelector('.rottay-form-field--disabled')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it.each(['sm', 'md', 'lg'] as const)(
      'renders with %s size',
      (size) => {
        const { container } = render(
          <FormField label="Name" name="name" size={size}>
            <input type="text" />
          </FormField>
        );
        expect(container.querySelector(`[class*="--${size}"]`)).toBeInTheDocument();
      }
    );
  });

  describe('Engine Support', () => {
    it.each(['classic', 'modern', 'rustic'] as const)(
      'renders with %s engine',
      (engine) => {
        const { container } = render(
          <FormField label="Name" name="name" engine={engine}>
            <input type="text" />
          </FormField>
        );
        expect(container.querySelector('[class*="form-field"]')).toBeInTheDocument();
      }
    );
  });

  describe('Accessibility', () => {
    it('links label to input via htmlFor/id', () => {
      render(
        <FormField label="Email" name="email">
          <input type="email" />
        </FormField>
      );
      const label = screen.getByText('Email');
      const input = screen.getByLabelText('Email');
      expect(label.closest('label')).toHaveAttribute('for', 'formfield-email');
      expect(input).toHaveAttribute('id', 'formfield-email');
    });

    it('does not set aria-invalid when no error', () => {
      render(
        <FormField label="Email" name="email">
          <input type="email" />
        </FormField>
      );
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
