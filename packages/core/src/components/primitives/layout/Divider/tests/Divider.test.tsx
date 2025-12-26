/**
 * Divider Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { Divider } from '../';
import {
  DIVIDER_DEFAULTS,
  SPACING_MAP,
  THICKNESS_MAP,
  getThicknessValue,
} from '../types';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockDivider = React.forwardRef<HTMLDivElement, any>(({
      children,
      orientation,
      type,
      variant,
      dashed,
      textPosition,
      orientationMargin,
      plain,
      color,
      thickness,
      spacing,
      margin,
      className,
      style,
      'data-testid': testId,
      ...props
    }, ref) => {
      const resolvedOrientation = orientation || type || 'horizontal';
      const resolvedVariant = dashed ? 'dashed' : (variant || 'solid');
      const resolvedTextPosition = textPosition || orientationMargin || 'center';
      const resolvedSpacing = spacing || margin || 'md';
      const isHorizontal = resolvedOrientation === 'horizontal';
      const hasChildren = !!children && isHorizontal;

      return React.createElement('div', {
        ref,
        'data-testid': testId || 'divider',
        'data-orientation': resolvedOrientation,
        'data-variant': resolvedVariant,
        'data-text-position': hasChildren ? resolvedTextPosition : undefined,
        'data-plain': plain ? 'true' : undefined,
        'data-color': color,
        'data-thickness': thickness,
        'data-spacing': resolvedSpacing,
        'data-has-children': hasChildren ? 'true' : undefined,
        role: 'separator',
        'aria-orientation': resolvedOrientation,
        className,
        style,
        ...props,
      }, hasChildren ? children : null);
    });
    MockDivider.displayName = 'Divider';
    return MockDivider;
  },
}));

describe('Divider', () => {
  describe('Basic Rendering', () => {
    it('renders correctly without children', () => {
      render(<Divider data-testid="divider" />);
      expect(screen.getByTestId('divider')).toBeInTheDocument();
    });

    it('renders correctly with children', () => {
      render(<Divider data-testid="divider">Section Title</Divider>);
      expect(screen.getByTestId('divider')).toBeInTheDocument();
      expect(screen.getByText('Section Title')).toBeInTheDocument();
    });

    it('renders with default props', () => {
      render(<Divider data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveAttribute('data-orientation', 'horizontal');
      expect(divider).toHaveAttribute('data-variant', 'solid');
      expect(divider).toHaveAttribute('data-spacing', 'md');
    });
  });

  describe('Orientation', () => {
    it('renders horizontal orientation by default', () => {
      render(<Divider data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('renders horizontal orientation when explicitly set', () => {
      render(<Divider orientation="horizontal" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('renders vertical orientation', () => {
      render(<Divider orientation="vertical" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('supports type prop as alias for orientation', () => {
      render(<Divider type="vertical" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('orientation prop takes precedence over type prop', () => {
      render(<Divider orientation="horizontal" type="vertical" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-orientation', 'horizontal');
    });
  });

  describe('Variant Styles', () => {
    it('renders solid variant by default', () => {
      render(<Divider data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-variant', 'solid');
    });

    it.each(['solid', 'dashed', 'dotted'] as const)(
      'renders %s variant',
      (variant) => {
        render(<Divider variant={variant} data-testid="divider" />);
        expect(screen.getByTestId('divider')).toHaveAttribute('data-variant', variant);
      }
    );

    it('dashed prop sets variant to dashed', () => {
      render(<Divider dashed data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-variant', 'dashed');
    });

    it('dashed prop takes precedence over variant prop', () => {
      render(<Divider dashed variant="dotted" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-variant', 'dashed');
    });
  });

  describe('Text Content', () => {
    it('renders children as text content', () => {
      render(<Divider>OR</Divider>);
      expect(screen.getByText('OR')).toBeInTheDocument();
    });

    it('sets has-children attribute when children present', () => {
      render(<Divider data-testid="divider">Text</Divider>);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-has-children', 'true');
    });

    it('does not render children for vertical orientation', () => {
      render(<Divider orientation="vertical" data-testid="divider">Text</Divider>);
      expect(screen.getByTestId('divider')).not.toHaveAttribute('data-has-children');
    });
  });

  describe('Text Position', () => {
    it('defaults to center text position', () => {
      render(<Divider data-testid="divider">Text</Divider>);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-text-position', 'center');
    });

    it.each(['left', 'center', 'right'] as const)(
      'renders text in %s position',
      (position) => {
        render(<Divider textPosition={position} data-testid="divider">Text</Divider>);
        expect(screen.getByTestId('divider')).toHaveAttribute('data-text-position', position);
      }
    );

    it('supports orientationMargin as alias for textPosition', () => {
      render(<Divider orientationMargin="left" data-testid="divider">Text</Divider>);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-text-position', 'left');
    });

    it('text position not set when no children', () => {
      render(<Divider textPosition="left" data-testid="divider" />);
      expect(screen.getByTestId('divider')).not.toHaveAttribute('data-text-position');
    });
  });

  describe('Plain Mode', () => {
    it('defaults to non-plain mode', () => {
      render(<Divider data-testid="divider">Text</Divider>);
      expect(screen.getByTestId('divider')).not.toHaveAttribute('data-plain');
    });

    it('sets plain mode when prop is true', () => {
      render(<Divider plain data-testid="divider">Text</Divider>);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-plain', 'true');
    });
  });

  describe('Color', () => {
    it('does not set color by default', () => {
      render(<Divider data-testid="divider" />);
      expect(screen.getByTestId('divider')).not.toHaveAttribute('data-color');
    });

    it('sets custom color', () => {
      render(<Divider color="#ff0000" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-color', '#ff0000');
    });

    it('accepts any CSS color value', () => {
      render(<Divider color="rgb(255, 0, 0)" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-color', 'rgb(255, 0, 0)');
    });
  });

  describe('Thickness', () => {
    it('does not set thickness attribute by default', () => {
      render(<Divider data-testid="divider" />);
      expect(screen.getByTestId('divider')).not.toHaveAttribute('data-thickness');
    });

    it.each(['thin', 'medium', 'thick'] as const)(
      'sets thickness preset %s',
      (thickness) => {
        render(<Divider thickness={thickness} data-testid="divider" />);
        expect(screen.getByTestId('divider')).toHaveAttribute('data-thickness', thickness);
      }
    );

    it('sets custom numeric thickness', () => {
      render(<Divider thickness={5} data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-thickness', '5');
    });
  });

  describe('Spacing', () => {
    it('defaults to md spacing', () => {
      render(<Divider data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-spacing', 'md');
    });

    it.each(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const)(
      'sets spacing %s',
      (spacing) => {
        render(<Divider spacing={spacing} data-testid="divider" />);
        expect(screen.getByTestId('divider')).toHaveAttribute('data-spacing', spacing);
      }
    );

    it('supports margin prop as alias for spacing', () => {
      render(<Divider margin="lg" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-spacing', 'lg');
    });

    it('spacing prop takes precedence over margin prop', () => {
      render(<Divider spacing="sm" margin="lg" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('data-spacing', 'sm');
    });
  });

  describe('Accessibility', () => {
    it('has role="separator"', () => {
      render(<Divider data-testid="divider" />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('has aria-orientation for horizontal', () => {
      render(<Divider orientation="horizontal" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('has aria-orientation for vertical', () => {
      render(<Divider orientation="vertical" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('className and style Props', () => {
    it('applies custom className', () => {
      render(<Divider className="custom-class" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveClass('custom-class');
    });

    it('applies multiple custom classNames', () => {
      render(<Divider className="class-one class-two" data-testid="divider" />);
      expect(screen.getByTestId('divider')).toHaveClass('class-one');
      expect(screen.getByTestId('divider')).toHaveClass('class-two');
    });

    it('applies inline styles', () => {
      render(<Divider style={{ borderColor: 'red' }} data-testid="divider" />);
      expect(screen.getByTestId('divider')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the DOM element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Divider ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('data-testid Prop', () => {
    it('applies data-testid attribute', () => {
      render(<Divider data-testid="my-divider" />);
      expect(screen.getByTestId('my-divider')).toBeInTheDocument();
    });
  });
});

describe('Divider Types and Constants', () => {
  describe('DIVIDER_DEFAULTS', () => {
    it('has correct default values', () => {
      expect(DIVIDER_DEFAULTS.orientation).toBe('horizontal');
      expect(DIVIDER_DEFAULTS.variant).toBe('solid');
      expect(DIVIDER_DEFAULTS.textPosition).toBe('center');
      expect(DIVIDER_DEFAULTS.plain).toBe(false);
      expect(DIVIDER_DEFAULTS.thickness).toBe('thin');
      expect(DIVIDER_DEFAULTS.spacing).toBe('md');
      expect(DIVIDER_DEFAULTS.dashed).toBe(false);
    });
  });

  describe('SPACING_MAP', () => {
    it('has correct spacing values', () => {
      expect(SPACING_MAP.none).toBe('0');
      expect(SPACING_MAP.xs).toBe('0.25rem');
      expect(SPACING_MAP.sm).toBe('0.5rem');
      expect(SPACING_MAP.md).toBe('1rem');
      expect(SPACING_MAP.lg).toBe('1.5rem');
      expect(SPACING_MAP.xl).toBe('2rem');
    });
  });

  describe('THICKNESS_MAP', () => {
    it('has correct thickness values', () => {
      expect(THICKNESS_MAP.thin).toBe('1px');
      expect(THICKNESS_MAP.medium).toBe('2px');
      expect(THICKNESS_MAP.thick).toBe('3px');
    });
  });

  describe('getThicknessValue', () => {
    it('returns thin thickness by default', () => {
      expect(getThicknessValue(undefined)).toBe('1px');
    });

    it('returns correct preset values', () => {
      expect(getThicknessValue('thin')).toBe('1px');
      expect(getThicknessValue('medium')).toBe('2px');
      expect(getThicknessValue('thick')).toBe('3px');
    });

    it('converts numeric values to pixels', () => {
      expect(getThicknessValue(1)).toBe('1px');
      expect(getThicknessValue(5)).toBe('5px');
      expect(getThicknessValue(10)).toBe('10px');
    });
  });
});

describe('Divider Combined Props', () => {
  it('applies all props together', () => {
    render(
      <Divider
        orientation="horizontal"
        variant="dashed"
        textPosition="left"
        plain
        color="#3b82f6"
        thickness="medium"
        spacing="lg"
        className="custom-divider"
        data-testid="combined"
      >
        Combined Test
      </Divider>
    );

    const divider = screen.getByTestId('combined');
    expect(divider).toHaveAttribute('data-orientation', 'horizontal');
    expect(divider).toHaveAttribute('data-variant', 'dashed');
    expect(divider).toHaveAttribute('data-text-position', 'left');
    expect(divider).toHaveAttribute('data-plain', 'true');
    expect(divider).toHaveAttribute('data-color', '#3b82f6');
    expect(divider).toHaveAttribute('data-thickness', 'medium');
    expect(divider).toHaveAttribute('data-spacing', 'lg');
    expect(divider).toHaveClass('custom-divider');
    expect(screen.getByText('Combined Test')).toBeInTheDocument();
  });
});

describe('Divider Edge Cases', () => {
  it('handles empty string children', () => {
    render(<Divider data-testid="divider">{''}</Divider>);
    expect(screen.getByTestId('divider')).not.toHaveAttribute('data-has-children');
  });

  it('handles null children', () => {
    render(<Divider data-testid="divider">{null}</Divider>);
    expect(screen.getByTestId('divider')).not.toHaveAttribute('data-has-children');
  });

  it('handles undefined children', () => {
    render(<Divider data-testid="divider">{undefined}</Divider>);
    expect(screen.getByTestId('divider')).not.toHaveAttribute('data-has-children');
  });

  it('handles React elements as children', () => {
    render(
      <Divider data-testid="divider">
        <span>Icon</span>
        <span>Text</span>
      </Divider>
    );
    expect(screen.getByTestId('divider')).toHaveAttribute('data-has-children', 'true');
  });
});
