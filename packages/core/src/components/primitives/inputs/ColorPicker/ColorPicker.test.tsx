/**
 * ColorPicker Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from './';

// Mock the engine factory
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockColorPicker = ({
      value,
      defaultValue,
      onChange,
      format,
      onFormatChange,
      presets,
      showText,
      size,
      disabled,
      allowClear,
      trigger,
      open,
      onOpenChange,
      disabledAlpha,
      placement,
      className,
      style,
      panelRender,
    }: any) => {
      const currentValue = value ?? defaultValue ?? '#1677ff';
      const isOpen = open ?? false;

      const mockColor = {
        toHexString: () => currentValue,
        toRgbString: () => `rgb(22, 119, 255)`,
        toHsbString: () => `hsb(215, 91%, 100%)`,
      };

      const getDisplayText = () => {
        if (typeof showText === 'function') {
          return showText(mockColor);
        }
        if (showText) {
          if (format === 'rgb') return mockColor.toRgbString();
          if (format === 'hsb') return mockColor.toHsbString();
          return mockColor.toHexString();
        }
        return null;
      };

      const panelContent = (
        <div data-testid="colorpicker-panel">
          <div data-testid="colorpicker-picker">Color Picker</div>
          {!disabledAlpha && <div data-testid="colorpicker-alpha">Alpha</div>}
          {presets?.map((preset: any, i: number) => (
            <div key={i} data-testid={`preset-group-${i}`}>
              <span>{preset.label}</span>
              {preset.colors.map((color: string, j: number) => (
                <div
                  key={j}
                  data-testid={`preset-color-${i}-${j}`}
                  data-color={color}
                  onClick={() => onChange?.(mockColor, color)}
                />
              ))}
            </div>
          ))}
        </div>
      );

      return (
        <div
          data-testid="colorpicker"
          data-size={size}
          data-format={format}
          data-disabled={disabled}
          data-allow-clear={allowClear}
          data-trigger={trigger}
          data-disabled-alpha={disabledAlpha}
          data-placement={placement}
          data-open={isOpen}
          className={className}
          style={style}
        >
          <div
            data-testid="colorpicker-trigger"
            onClick={() => !disabled && onOpenChange?.(!isOpen)}
          >
            <div
              data-testid="colorpicker-color"
              style={{ backgroundColor: currentValue }}
            />
            {showText && <span data-testid="colorpicker-text">{getDisplayText()}</span>}
          </div>
          {allowClear && currentValue && (
            <button
              data-testid="colorpicker-clear"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(mockColor, '');
              }}
            />
          )}
          {isOpen && (panelRender ? panelRender(panelContent) : panelContent)}
        </div>
      );
    };
    MockColorPicker.displayName = 'ColorPicker';
    return MockColorPicker;
  },
}));

describe('ColorPicker', () => {
  it('renders correctly', () => {
    render(<ColorPicker />);
    expect(screen.getByTestId('colorpicker')).toBeInTheDocument();
  });

  it('renders trigger element', () => {
    render(<ColorPicker />);
    expect(screen.getByTestId('colorpicker-trigger')).toBeInTheDocument();
  });

  describe('value prop', () => {
    it('renders with controlled value', () => {
      render(<ColorPicker value="#ff0000" />);
      expect(screen.getByTestId('colorpicker-color')).toHaveStyle({ backgroundColor: '#ff0000' });
    });

    it('renders with default value', () => {
      render(<ColorPicker defaultValue="#00ff00" />);
      expect(screen.getByTestId('colorpicker-color')).toHaveStyle({ backgroundColor: '#00ff00' });
    });
  });

  describe('size prop', () => {
    it.each(['small', 'middle', 'large'] as const)('renders size %s', (size) => {
      render(<ColorPicker size={size} />);
      expect(screen.getByTestId('colorpicker')).toHaveAttribute('data-size', size);
    });
  });

  describe('format prop', () => {
    it.each(['hex', 'rgb', 'hsb'] as const)('renders format %s', (format) => {
      render(<ColorPicker format={format} />);
      expect(screen.getByTestId('colorpicker')).toHaveAttribute('data-format', format);
    });
  });

  describe('disabled prop', () => {
    it('disables the color picker', () => {
      render(<ColorPicker disabled />);
      expect(screen.getByTestId('colorpicker')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('trigger prop', () => {
    it.each(['click', 'hover'] as const)('renders trigger %s', (trigger) => {
      render(<ColorPicker trigger={trigger} />);
      expect(screen.getByTestId('colorpicker')).toHaveAttribute('data-trigger', trigger);
    });
  });

  describe('showText prop', () => {
    it('shows color text when enabled', () => {
      render(<ColorPicker showText defaultValue="#1677ff" />);
      expect(screen.getByTestId('colorpicker-text')).toBeInTheDocument();
    });

    it('shows rgb format text', () => {
      render(<ColorPicker showText format="rgb" defaultValue="#1677ff" />);
      expect(screen.getByTestId('colorpicker-text')).toHaveTextContent('rgb(22, 119, 255)');
    });
  });

  describe('allowClear prop', () => {
    it('shows clear button', () => {
      render(<ColorPicker allowClear defaultValue="#ff0000" />);
      expect(screen.getByTestId('colorpicker-clear')).toBeInTheDocument();
    });

    it('clears value when clear button is clicked', () => {
      const onChange = vi.fn();
      render(<ColorPicker allowClear defaultValue="#ff0000" onChange={onChange} />);

      fireEvent.click(screen.getByTestId('colorpicker-clear'));
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('onOpenChange callback', () => {
    it('calls onOpenChange when trigger is clicked', () => {
      const onOpenChange = vi.fn();
      render(<ColorPicker onOpenChange={onOpenChange} />);

      fireEvent.click(screen.getByTestId('colorpicker-trigger'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('open state', () => {
    it('shows panel when open', () => {
      render(<ColorPicker open />);
      expect(screen.getByTestId('colorpicker-panel')).toBeInTheDocument();
    });

    it('shows alpha slider when not disabled', () => {
      render(<ColorPicker open />);
      expect(screen.getByTestId('colorpicker-alpha')).toBeInTheDocument();
    });

    it('hides alpha slider when disabled', () => {
      render(<ColorPicker open disabledAlpha />);
      expect(screen.queryByTestId('colorpicker-alpha')).not.toBeInTheDocument();
    });
  });

  describe('disabledAlpha prop', () => {
    it('disables alpha channel', () => {
      render(<ColorPicker disabledAlpha />);
      expect(screen.getByTestId('colorpicker')).toHaveAttribute('data-disabled-alpha', 'true');
    });
  });

  describe('placement prop', () => {
    it.each(['top', 'bottom', 'bottomLeft', 'bottomRight'] as const)('renders placement %s', (placement) => {
      render(<ColorPicker placement={placement} />);
      expect(screen.getByTestId('colorpicker')).toHaveAttribute('data-placement', placement);
    });
  });

  describe('presets prop', () => {
    it('renders preset colors', () => {
      const presets = [
        { label: 'Primary', colors: ['#1677ff', '#52c41a'] },
        { label: 'Neutral', colors: ['#000000', '#ffffff'] },
      ];
      render(<ColorPicker open presets={presets} />);
      expect(screen.getByTestId('preset-group-0')).toBeInTheDocument();
      expect(screen.getByTestId('preset-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('preset-color-0-0')).toHaveAttribute('data-color', '#1677ff');
    });

    it('calls onChange when preset is clicked', () => {
      const onChange = vi.fn();
      const presets = [{ label: 'Primary', colors: ['#ff0000'] }];
      render(<ColorPicker open presets={presets} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('preset-color-0-0'));
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    render(<ColorPicker className="custom-colorpicker" />);
    expect(screen.getByTestId('colorpicker')).toHaveClass('custom-colorpicker');
  });

  it('applies custom style', () => {
    render(<ColorPicker style={{ width: 200 }} />);
    expect(screen.getByTestId('colorpicker')).toHaveStyle({ width: '200px' });
  });
});

describe('ColorPicker engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<ColorPicker engine={engine} />);
    expect(screen.getByTestId('colorpicker')).toBeInTheDocument();
  });
});

describe('ColorPicker tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<ColorPicker />);
    expect(screen.getByTestId('colorpicker')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
