/**
 * DatePicker Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof DatePicker> = {
  title: 'Primitives/Inputs/DatePicker',
  component: DatePicker,
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
A date picker component with various modes and multi-engine support.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Calendar | Built-in | Browser | Custom |
| Range Picker | Full | Limited | Full |
| Time Selection | Built-in | Separate | Combined |
`,
      },
    },
  },
  argTypes: {
    picker: {
      control: 'select',
      options: ['date', 'week', 'month', 'quarter', 'year'],
      description: 'Picker mode',
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size of the picker',
    },
    status: {
      control: 'select',
      options: ['default', 'error', 'warning'],
      description: 'Validation status',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    disabled: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    showToday: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = {
  args: { placeholder: 'Select date' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DatePicker size="small" placeholder="Small" />
      <DatePicker size="default" placeholder="Default" />
      <DatePicker size="large" placeholder="Large" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Disabled picker' },
};

export const PickerModes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DatePicker picker="date" placeholder="Date picker" />
      <DatePicker picker="week" placeholder="Week picker" />
      <DatePicker picker="month" placeholder="Month picker" />
      <DatePicker picker="quarter" placeholder="Quarter picker" />
      <DatePicker picker="year" placeholder="Year picker" />
    </div>
  ),
};

export const WithTime: Story = {
  args: { showTime: true, placeholder: 'Select date and time' },
};

export const DateRange: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ margin: 0, color: '#666' }}>RangePicker for selecting date ranges</p>
      <DatePicker.RangePicker placeholder={['Start date', 'End date']} />
    </div>
  ),
};

export const StatusVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DatePicker status="default" placeholder="Default status" />
      <DatePicker status="error" placeholder="Error status" />
      <DatePicker status="warning" placeholder="Warning status" />
    </div>
  ),
};

export const CustomFormat: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DatePicker format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
      <DatePicker format="MM-DD-YYYY" placeholder="MM-DD-YYYY" />
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the DatePicker component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same DatePicker rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={DatePicker}
      props={{ placeholder: 'Select date', style: { width: 200 } }}
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
      component={DatePicker}
      baseProps={{ placeholder: 'Date', style: { width: 150 } }}
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
      component={DatePicker}
      baseProps={{ placeholder: 'Date', style: { width: 150 } }}
      variantProp="status"
      variants={['default', 'error', 'warning']}
    />
  ),
};
