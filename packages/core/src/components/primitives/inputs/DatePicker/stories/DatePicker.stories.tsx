/**
 * DatePicker Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

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
        component: 'A date picker component with various modes and multi-engine support.',
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
      options: ['titan', 'hermes', 'apollo'],
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

export const Default: Story = {
  args: {
    placeholder: 'Select date',
  },
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
  args: {
    disabled: true,
    placeholder: 'Disabled picker',
  },
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
  args: {
    showTime: true,
    placeholder: 'Select date and time',
  },
};

export const WithPresets: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ margin: 0, color: '#666' }}>DatePicker with preset ranges (today, this week, etc.)</p>
      <DatePicker placeholder="Select date" />
    </div>
  ),
};

export const DateRange: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ margin: 0, color: '#666' }}>RangePicker for selecting date ranges</p>
      <DatePicker.RangePicker placeholder={['Start date', 'End date']} />
    </div>
  ),
};

export const DisabledDates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ margin: 0, color: '#666' }}>Weekends disabled</p>
      <DatePicker
        placeholder="Select date"
        disabledDate={(current) => {
          const day = current.getDay();
          return day === 0 || day === 6;
        }}
      />
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
      <DatePicker format="YYYY年MM月DD日" placeholder="YYYY年MM月DD日" />
    </div>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <DatePicker engine={engine} placeholder="Select date" />
            <DatePicker engine={engine} disabled placeholder="Disabled" />
            <DatePicker engine={engine} status="error" placeholder="Error" />
          </div>
        </div>
      ))}
    </div>
  ),
};
