/**
 * Calendar Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Calendar> = {
  title: 'Primitives/Display/Calendar',
  component: Calendar,
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
        component:
          'Calendar component for displaying and selecting dates with support for multiple engines. Supports month and year view modes, date range restrictions, and custom cell rendering.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['month', 'year'],
      description: 'Display mode of the calendar',
    },
    fullscreen: {
      control: 'boolean',
      description: 'Whether to display in fullscreen mode',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    fullscreen: true,
  },
};

export const Compact: Story = {
  args: {
    fullscreen: false,
  },
};

export const YearMode: Story = {
  args: {
    mode: 'year',
    fullscreen: true,
  },
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: new Date(2024, 6, 15), // July 15, 2024
    fullscreen: true,
  },
};

export const Modes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Month Mode</h4>
        <Calendar mode="month" fullscreen={false} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Year Mode</h4>
        <Calendar mode="year" fullscreen={false} />
      </div>
    </div>
  ),
};

export const WithValidRange: Story = {
  args: {
    validRange: [new Date(2024, 0, 1), new Date(2024, 11, 31)],
    defaultValue: new Date(2024, 6, 15),
    fullscreen: false,
  },
};

export const WithDisabledDates: Story = {
  args: {
    disabledDate: (date: Date) => date.getDay() === 0 || date.getDay() === 6, // Disable weekends
    fullscreen: false,
  },
};

export const WithCustomCellRender: Story = {
  args: {
    fullscreen: false,
    dateCellRender: (date: Date) => {
      const day = date.getDate();
      if (day === 15) {
        return (
          <div style={{ color: 'red', fontSize: 10 }}>Event</div>
        );
      }
      return null;
    },
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 16px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <Calendar engine={engine} fullscreen={false} defaultValue={new Date(2024, 6, 15)} />
        </div>
      ))}
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    // Note: In Storybook, use useState for controlled components
    return (
      <div>
        <p style={{ marginBottom: 16 }}>
          Select a date to see the onChange callback in action (check the Actions panel).
        </p>
        <Calendar
          fullscreen={false}
          onChange={(date) => console.log('Selected date:', date)}
          onSelect={(date, info) => console.log('Selected:', date, 'Source:', info.source)}
          onPanelChange={(date, mode) => console.log('Panel changed:', date, 'Mode:', mode)}
        />
      </div>
    );
  },
};
