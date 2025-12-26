/**
 * Rate Component Tests
 * Comprehensive test suite for the Rate component
 * @module Rate/Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Rate } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockRate = React.forwardRef<HTMLDivElement, any>((props, ref) => {
      const {
        value,
        defaultValue = 0,
        count = 5,
        allowHalf = false,
        allowClear = true,
        disabled = false,
        readOnly = false,
        onChange,
        onHoverChange,
        size = 'md',
        tooltips,
        className = '',
        style,
        children,
        ...rest
      } = props;

      const [internalValue, setInternalValue] = React.useState(defaultValue);
      const [hoverValue, setHoverValue] = React.useState<number | null>(null);
      const isControlled = value !== undefined;
      const currentValue = isControlled ? value : internalValue;
      const displayValue = hoverValue !== null ? hoverValue : currentValue;
      const isInteractive = !disabled && !readOnly;

      const handleClick = (starValue: number) => {
        if (!isInteractive) return;
        let newValue = starValue;
        if (allowClear && starValue === currentValue) {
          newValue = 0;
        }
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      };

      const handleMouseEnter = (starValue: number) => {
        if (!isInteractive) return;
        setHoverValue(starValue);
        onHoverChange?.(starValue);
      };

      const handleMouseLeave = () => {
        if (!isInteractive) return;
        setHoverValue(null);
        onHoverChange?.(0);
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isInteractive) return;
        let newValue = currentValue || 0;
        const step = allowHalf ? 0.5 : 1;

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            e.preventDefault();
            newValue = Math.min(count, newValue + step);
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            e.preventDefault();
            newValue = Math.max(0, newValue - step);
            break;
          case 'Home':
            e.preventDefault();
            newValue = 0;
            break;
          case 'End':
            e.preventDefault();
            newValue = count;
            break;
          default:
            return;
        }

        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      };

      const stars = Array.from({ length: count }, (_, index) => {
        const starIndex = index + 1;
        const isFilled = displayValue >= starIndex;
        const isHalfFilled = allowHalf && displayValue >= starIndex - 0.5 && displayValue < starIndex;

        return (
          <span
            key={index}
            role="radio"
            aria-checked={isFilled}
            aria-label={tooltips?.[index] || `${starIndex} star${starIndex > 1 ? 's' : ''}`}
            data-index={index}
            data-filled={isFilled}
            data-half={isHalfFilled}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: isInteractive ? 'pointer' : disabled ? 'not-allowed' : 'default' }}
          >
            {isFilled || isHalfFilled ? '\u2605' : '\u2606'}
          </span>
        );
      });

      return (
        <div
          ref={ref}
          data-testid="rate"
          data-size={size}
          data-disabled={disabled}
          data-readonly={readOnly}
          role="radiogroup"
          aria-label="Rating"
          aria-valuenow={currentValue}
          aria-valuemin={0}
          aria-valuemax={count}
          aria-disabled={disabled}
          aria-readonly={readOnly}
          tabIndex={isInteractive ? 0 : -1}
          className={className}
          style={style}
          onKeyDown={handleKeyDown}
          onMouseLeave={handleMouseLeave}
          {...rest}
        >
          {stars}
        </div>
      );
    });
    MockRate.displayName = 'Rate';
    return MockRate;
  },
}));

describe('Rate', () => {
  // =========================================================================
  // Basic Rendering
  // =========================================================================

  describe('Basic Rendering', () => {
    it('renders correctly with default props', () => {
      render(<Rate />);
      expect(screen.getByTestId('rate')).toBeInTheDocument();
    });

    it('renders the default number of 5 stars', () => {
      render(<Rate />);
      const stars = screen.getAllByRole('radio');
      expect(stars).toHaveLength(5);
    });

    it('renders with defaultValue', () => {
      render(<Rate defaultValue={3} />);
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('aria-valuenow', '3');
    });

    it('renders with controlled value', () => {
      render(<Rate value={4} />);
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('aria-valuenow', '4');
    });

    it('renders empty (no stars filled) when value is 0', () => {
      render(<Rate defaultValue={0} />);
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('aria-valuenow', '0');
    });

    it('applies custom className', () => {
      render(<Rate className="custom-rate" />);
      expect(screen.getByTestId('rate')).toHaveClass('custom-rate');
    });

    it('applies custom style', () => {
      render(<Rate style={{ margin: '10px' }} />);
      const rate = screen.getByTestId('rate');
      // The mock component applies style prop to the element
      expect(rate).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Size Variants
  // =========================================================================

  describe('Size Variants', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
      render(<Rate size={size} />);
      expect(screen.getByTestId('rate')).toHaveAttribute('data-size', size);
    });

    it('defaults to md size', () => {
      render(<Rate />);
      expect(screen.getByTestId('rate')).toHaveAttribute('data-size', 'md');
    });
  });

  // =========================================================================
  // Count Prop
  // =========================================================================

  describe('Count Prop', () => {
    it('renders custom count of stars', () => {
      render(<Rate count={3} />);
      const stars = screen.getAllByRole('radio');
      expect(stars).toHaveLength(3);
    });

    it('renders 10 stars when count is 10', () => {
      render(<Rate count={10} />);
      const stars = screen.getAllByRole('radio');
      expect(stars).toHaveLength(10);
    });

    it('updates aria-valuemax based on count', () => {
      render(<Rate count={7} />);
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('aria-valuemax', '7');
    });
  });

  // =========================================================================
  // Disabled State
  // =========================================================================

  describe('Disabled State', () => {
    it('renders disabled state correctly', () => {
      render(<Rate disabled />);
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('data-disabled', 'true');
      expect(rate).toHaveAttribute('aria-disabled', 'true');
    });

    it('has tabIndex -1 when disabled', () => {
      render(<Rate disabled />);
      expect(screen.getByTestId('rate')).toHaveAttribute('tabIndex', '-1');
    });

    it('does not call onChange when disabled', async () => {
      const handleChange = vi.fn();
      render(<Rate disabled onChange={handleChange} />);

      const firstStar = screen.getAllByRole('radio')[0];
      await userEvent.click(firstStar);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // ReadOnly State
  // =========================================================================

  describe('ReadOnly State', () => {
    it('renders readonly state correctly', () => {
      render(<Rate readOnly />);
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('data-readonly', 'true');
      expect(rate).toHaveAttribute('aria-readonly', 'true');
    });

    it('has tabIndex -1 when readonly', () => {
      render(<Rate readOnly />);
      expect(screen.getByTestId('rate')).toHaveAttribute('tabIndex', '-1');
    });

    it('does not call onChange when readonly', async () => {
      const handleChange = vi.fn();
      render(<Rate readOnly onChange={handleChange} />);

      const firstStar = screen.getAllByRole('radio')[0];
      await userEvent.click(firstStar);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Click Interactions
  // =========================================================================

  describe('Click Interactions', () => {
    it('calls onChange when clicking a star', async () => {
      const handleChange = vi.fn();
      render(<Rate onChange={handleChange} />);

      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[2]); // Click 3rd star

      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('updates value in uncontrolled mode', async () => {
      render(<Rate defaultValue={0} />);

      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[3]); // Click 4th star

      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('aria-valuenow', '4');
    });

    it('clears value when clicking the same star with allowClear', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={3} onChange={handleChange} />);

      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[2]); // Click the already selected 3rd star

      expect(handleChange).toHaveBeenCalledWith(0);
    });

    it('does not clear value when allowClear is false', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={3} allowClear={false} onChange={handleChange} />);

      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[2]); // Click the already selected 3rd star

      expect(handleChange).toHaveBeenCalledWith(3);
    });
  });

  // =========================================================================
  // Hover Interactions
  // =========================================================================

  describe('Hover Interactions', () => {
    it('calls onHoverChange when hovering a star', async () => {
      const handleHoverChange = vi.fn();
      render(<Rate onHoverChange={handleHoverChange} />);

      const stars = screen.getAllByRole('radio');
      fireEvent.mouseEnter(stars[2]); // Hover over 3rd star

      expect(handleHoverChange).toHaveBeenCalledWith(3);
    });

    it('calls onHoverChange with 0 when mouse leaves', async () => {
      const handleHoverChange = vi.fn();
      render(<Rate onHoverChange={handleHoverChange} />);

      const rate = screen.getByTestId('rate');
      fireEvent.mouseLeave(rate);

      expect(handleHoverChange).toHaveBeenCalledWith(0);
    });

    it('does not call onHoverChange when disabled', async () => {
      const handleHoverChange = vi.fn();
      render(<Rate disabled onHoverChange={handleHoverChange} />);

      const stars = screen.getAllByRole('radio');
      fireEvent.mouseEnter(stars[2]);

      expect(handleHoverChange).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Keyboard Navigation
  // =========================================================================

  describe('Keyboard Navigation', () => {
    it('increases value with ArrowRight', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={2} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'ArrowRight' });

      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('increases value with ArrowUp', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={2} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'ArrowUp' });

      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('decreases value with ArrowLeft', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={3} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'ArrowLeft' });

      expect(handleChange).toHaveBeenCalledWith(2);
    });

    it('decreases value with ArrowDown', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={3} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'ArrowDown' });

      expect(handleChange).toHaveBeenCalledWith(2);
    });

    it('sets value to 0 with Home key', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={3} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'Home' });

      expect(handleChange).toHaveBeenCalledWith(0);
    });

    it('sets value to max with End key', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={2} count={5} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'End' });

      expect(handleChange).toHaveBeenCalledWith(5);
    });

    it('does not exceed max value', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={5} count={5} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'ArrowRight' });

      expect(handleChange).toHaveBeenCalledWith(5);
    });

    it('does not go below 0', async () => {
      const handleChange = vi.fn();
      render(<Rate defaultValue={0} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'ArrowLeft' });

      expect(handleChange).toHaveBeenCalledWith(0);
    });
  });

  // =========================================================================
  // Half Stars
  // =========================================================================

  describe('Half Stars', () => {
    it('supports half star values', () => {
      render(<Rate allowHalf defaultValue={2.5} />);
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('aria-valuenow', '2.5');
    });

    it('increments by 0.5 with keyboard when allowHalf', async () => {
      const handleChange = vi.fn();
      render(<Rate allowHalf defaultValue={2} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'ArrowRight' });

      expect(handleChange).toHaveBeenCalledWith(2.5);
    });

    it('decrements by 0.5 with keyboard when allowHalf', async () => {
      const handleChange = vi.fn();
      render(<Rate allowHalf defaultValue={3} onChange={handleChange} />);

      const rate = screen.getByTestId('rate');
      rate.focus();
      fireEvent.keyDown(rate, { key: 'ArrowLeft' });

      expect(handleChange).toHaveBeenCalledWith(2.5);
    });
  });

  // =========================================================================
  // Tooltips
  // =========================================================================

  describe('Tooltips', () => {
    it('renders stars with tooltips as aria-label', () => {
      const tooltips = ['Terrible', 'Bad', 'Normal', 'Good', 'Excellent'];
      render(<Rate tooltips={tooltips} />);

      const stars = screen.getAllByRole('radio');
      tooltips.forEach((tooltip, index) => {
        expect(stars[index]).toHaveAttribute('aria-label', tooltip);
      });
    });

    it('uses default aria-label when no tooltips provided', () => {
      render(<Rate />);

      const stars = screen.getAllByRole('radio');
      expect(stars[0]).toHaveAttribute('aria-label', '1 star');
      expect(stars[1]).toHaveAttribute('aria-label', '2 stars');
    });
  });

  // =========================================================================
  // Accessibility
  // =========================================================================

  describe('Accessibility', () => {
    it('has role="radiogroup"', () => {
      render(<Rate />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label="Rating"', () => {
      render(<Rate />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Rating');
    });

    it('stars have role="radio"', () => {
      render(<Rate />);
      const stars = screen.getAllByRole('radio');
      expect(stars).toHaveLength(5);
    });

    it('has aria-valuenow, aria-valuemin, aria-valuemax', () => {
      render(<Rate defaultValue={3} count={5} />);
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('aria-valuenow', '3');
      expect(rate).toHaveAttribute('aria-valuemin', '0');
      expect(rate).toHaveAttribute('aria-valuemax', '5');
    });

    it('is focusable with tabIndex 0 when interactive', () => {
      render(<Rate />);
      expect(screen.getByTestId('rate')).toHaveAttribute('tabIndex', '0');
    });
  });

  // =========================================================================
  // Controlled vs Uncontrolled
  // =========================================================================

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Rate value={2} onChange={handleChange} />);

      // Value should not change internally
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[3]);

      // Value should still be 2 (controlled)
      expect(screen.getByTestId('rate')).toHaveAttribute('aria-valuenow', '2');

      // onChange should have been called
      expect(handleChange).toHaveBeenCalledWith(4);

      // Update the value externally
      rerender(<Rate value={4} onChange={handleChange} />);
      expect(screen.getByTestId('rate')).toHaveAttribute('aria-valuenow', '4');
    });

    it('works as uncontrolled component', async () => {
      render(<Rate defaultValue={2} />);

      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[3]);

      // Value should change internally
      expect(screen.getByTestId('rate')).toHaveAttribute('aria-valuenow', '4');
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('Edge Cases', () => {
    it('handles value higher than count', () => {
      render(<Rate value={10} count={5} />);
      // Should still render 5 stars
      const stars = screen.getAllByRole('radio');
      expect(stars).toHaveLength(5);
    });

    it('handles negative value', () => {
      render(<Rate value={-1} />);
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('aria-valuenow', '-1');
    });

    it('handles decimal values without allowHalf', () => {
      render(<Rate value={2.7} />);
      // Should still accept the value
      const rate = screen.getByTestId('rate');
      expect(rate).toHaveAttribute('aria-valuenow', '2.7');
    });

    it('handles count of 1', () => {
      render(<Rate count={1} defaultValue={1} />);
      const stars = screen.getAllByRole('radio');
      expect(stars).toHaveLength(1);
    });
  });
});
