/**
 * ColorPicker Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from '../';
import type { Color, ColorFormat } from '../types';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof ColorPicker> = {
  title: 'Primitives/Inputs/ColorPicker',
  component: ColorPicker,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'ColorPicker component for selecting colors with various formats and presets.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Size of the trigger',
    },
    format: {
      control: 'select',
      options: ['hex', 'rgb', 'hsb'],
      description: 'Color format',
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
      description: 'Trigger method',
    },
    placement: {
      control: 'select',
      options: ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'],
      description: 'Dropdown placement',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the picker is disabled',
    },
    allowClear: {
      control: 'boolean',
      description: 'Allow clearing the color',
    },
    showText: {
      control: 'boolean',
      description: 'Show color text value',
    },
    disabledAlpha: {
      control: 'boolean',
      description: 'Disable alpha channel',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  args: {
    defaultValue: '#1677ff',
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [color, setColor] = useState('#1677ff');

    const handleChange = (_: Color, hex: string) => {
      setColor(hex);
    };

    return (
      <div>
        <ColorPicker value={color} onChange={handleChange} />
        <div style={{ marginTop: 16 }}>
          Selected color: <span style={{ color }}>{color}</span>
        </div>
      </div>
    );
  },
};

export const WithText: Story = {
  args: {
    defaultValue: '#1677ff',
    showText: true,
  },
};

export const Formats: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['hex', 'rgb', 'hsb'] as ColorFormat[]).map((format) => (
        <div key={format}>
          <span style={{ display: 'inline-block', width: 60 }}>{format}:</span>
          <ColorPicker defaultValue="#1677ff" format={format} showText />
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <ColorPicker key={size} defaultValue="#1677ff" size={size} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: '#1677ff',
    disabled: true,
  },
};

export const DisabledAlpha: Story = {
  args: {
    defaultValue: '#1677ff',
    disabledAlpha: true,
  },
};

export const AllowClear: Story = {
  args: {
    defaultValue: '#1677ff',
    allowClear: true,
  },
};

export const WithPresets: Story = {
  args: {
    defaultValue: '#1677ff',
    presets: [
      {
        label: 'Primary Colors',
        colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'],
      },
      {
        label: 'Neutral Colors',
        colors: ['#000000', '#434343', '#8c8c8c', '#d9d9d9', '#ffffff'],
      },
    ],
  },
};

export const Triggers: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Click</h4>
        <ColorPicker defaultValue="#1677ff" trigger="click" />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Hover</h4>
        <ColorPicker defaultValue="#52c41a" trigger="hover" />
      </div>
    </div>
  ),
};

export const Placements: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 100 }}>
      {(['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'] as const).map(
        (placement) => (
          <div key={placement}>
            <ColorPicker defaultValue="#1677ff" placement={placement} />
            <div style={{ fontSize: 12, marginTop: 4 }}>{placement}</div>
          </div>
        )
      )}
    </div>
  ),
};

export const FormatChange: Story = {
  render: function FormatChangeStory() {
    const [format, setFormat] = useState<ColorFormat>('hex');

    return (
      <div>
        <ColorPicker
          defaultValue="#1677ff"
          format={format}
          onFormatChange={setFormat}
          showText
        />
        <div style={{ marginTop: 16 }}>
          Current format: {format}
        </div>
      </div>
    );
  },
};

export const CustomShowText: Story = {
  args: {
    defaultValue: '#1677ff',
    showText: (color: Color) => (
      <span>
        <strong>Hex:</strong> {color.toHexString()}
      </span>
    ),
  },
};

export const ColorPalette: Story = {
  render: function ColorPaletteStory() {
    const [colors, setColors] = useState(['#1677ff', '#52c41a', '#faad14', '#ff4d4f']);

    return (
      <div>
        <div style={{ display: 'flex', gap: 8 }}>
          {colors.map((color, index) => (
            <ColorPicker
              key={index}
              value={color}
              onChange={(_, hex) => {
                const newColors = [...colors];
                newColors[index] = hex;
                setColors(newColors);
              }}
            />
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          {colors.map((color, index) => (
            <div
              key={index}
              style={{
                width: 40,
                height: 40,
                backgroundColor: color,
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <ColorPicker
            engine={engine}
            defaultValue="#1677ff"
            showText
          />
        </div>
      ))}
    </div>
  ),
};
