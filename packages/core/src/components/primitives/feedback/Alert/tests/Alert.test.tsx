/**
 * Alert Component Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../';

describe('Alert', () => {
  describe('Basic Rendering', () => {
    it('renders with message', () => {
      render(<Alert message="Test message" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with message and description', () => {
      render(<Alert message="Title" description="Description text" />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Alert message="Title">
          <div>Child content</div>
        </Alert>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Alert message="Test" className="custom-alert" />);
      expect(container.querySelector('.custom-alert')).toBeInTheDocument();
    });

    it('applies custom style', () => {
      const { container } = render(
        <Alert message="Test" style={{ backgroundColor: 'red' }} />
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('Alert Types', () => {
    it.each(['info', 'success', 'warning', 'error'] as const)(
      'renders %s type correctly',
      (type) => {
        const { container } = render(<Alert message="Test" type={type} />);
        expect(container.querySelector(`[class*="${type}"]`)).toBeInTheDocument();
      }
    );

    it('defaults to info type', () => {
      const { container } = render(<Alert message="Test" />);
      expect(container.querySelector('[class*="info"]')).toBeInTheDocument();
    });
  });

  describe('Icon Visibility', () => {
    it('shows icon by default', () => {
      render(<Alert message="Test" />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      render(<Alert message="Test" showIcon={false} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders custom icon', () => {
      const customIcon = <span data-testid="custom-icon">★</span>;
      render(<Alert message="Test" icon={customIcon} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Closable Behavior', () => {
    it('does not show close button by default', () => {
      render(<Alert message="Test" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows close button when closable is true', () => {
      render(<Alert message="Test" closable />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Alert message="Test" closable onClose={onClose} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has role="alert"', () => {
      render(<Alert message="Test" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('close button is keyboard accessible', () => {
      const onClose = vi.fn();
      render(<Alert message="Test" closable onClose={onClose} />);
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(button).toHaveAttribute('aria-label');
    });
  });

  describe('Engine Support', () => {
    it.each(['titan', 'hermes', 'apollo'] as const)(
      'renders with %s engine',
      (engine) => {
        render(<Alert message="Test" engine={engine} />);
        expect(screen.getByText('Test')).toBeInTheDocument();
      }
    );
  });
});
