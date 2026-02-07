/**
 * TimePicker Stories
 * Colocated with component following approved architecture
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof TimePicker> = {
  title: 'Primitives/Inputs/TimePicker',
  component: TimePicker,
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
        component: `
TimePicker component for selecting time values with support for multiple engines, 12/24 hour formats, and time ranges.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Time Panel | Built-in | Browser | Custom |
| 12/24h Format | Full | Limited | Full |
| Range Picker | Built-in | Custom | Custom |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size of the picker input',
    },
    status: {
      control: 'select',
      options: [undefined, 'error', 'warning'],
      description: 'Validation status',
    },
    format: {
      control: 'text',
      description: 'Display format string (e.g., "HH:mm:ss")',
    },
    use12Hours: {
      control: 'boolean',
      description: 'Enable 12-hour format with AM/PM',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the picker is disabled',
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button',
    },
    showNow: {
      control: 'boolean',
      description: 'Show "Now" button',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  args: {
    placeholder: 'Select time',
    size: 'default',
    allowClear: true,
  },
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: '14:30:00',
    format: 'HH:mm:ss',
  },
};

export const TwelveHourFormat: Story = {
  args: {
    use12Hours: true,
    format: 'h:mm:ss a',
    placeholder: 'Select time (12h)',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      {(['small', 'default', 'large'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#666' }}>{size}</span>
          <TimePicker size={size} placeholder={`Size: ${size}`} />
        </div>
      ))}
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, color: '#666' }}>Normal</span>
        <TimePicker placeholder="Normal" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, color: '#666' }}>Error</span>
        <TimePicker status="error" placeholder="Error" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, color: '#666' }}>Warning</span>
        <TimePicker status="warning" placeholder="Warning" />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: '09:00:00',
    placeholder: 'Disabled',
  },
};

export const WithSteps: Story = {
  args: {
    hourStep: 2,
    minuteStep: 15,
    secondStep: 10,
    placeholder: 'Select time (with steps)',
  },
  parameters: {
    docs: {
      description: {
        story: 'TimePicker with custom step intervals: hours by 2, minutes by 15, seconds by 10.',
      },
    },
  },
};

export const HideSeconds: Story = {
  args: {
    format: 'HH:mm',
    showSecond: false,
    placeholder: 'HH:mm only',
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the TimePicker component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same TimePicker rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={TimePicker}
      props={{ placeholder: 'Select time', style: { width: 150 } }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all sizes across all engines.
 */
export const SizeMatrix: Story = {
  name: '📏 Size × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={TimePicker}
      baseProps={{ placeholder: 'Time', style: { width: 130 } }}
      sizeProp="size"
      sizes={['small', 'default', 'large']}
    />
  ),
};

/**
 * Status comparison across engines.
 */
export const StatusMatrix: Story = {
  name: '⚠️ Status × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={TimePicker}
      baseProps={{ placeholder: 'Time', style: { width: 130 } }}
      variantProp="status"
      variants={['error', 'warning']}
    />
  ),
};

export const RangePicker: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TimePicker.RangePicker placeholder={['Start time', 'End time']} />
    </div>
  ),
};

export const RangePickerSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['small', 'default', 'large'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#666' }}>{size}</span>
          <TimePicker.RangePicker
            size={size}
            placeholder={['Start', 'End']}
          />
        </div>
      ))}
    </div>
  ),
};

export const RangePickerEngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['classic', 'modern', 'rustic'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <TimePicker.RangePicker engine={engine} placeholder={['Start', 'End']} />
        </div>
      ))}
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    // Using React hooks for controlled state
    const [value, setValue] = React.useState<Date | null>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TimePicker
          value={value}
          onChange={(time, timeString) => {
            setValue(time);
            console.log('Selected:', time, timeString);
          }}
          placeholder="Controlled TimePicker"
        />
        <div style={{ fontSize: 14, color: '#666' }}>
          Selected: {value ? value.toLocaleTimeString() : 'None'}
        </div>
      </div>
    );
  },
};

