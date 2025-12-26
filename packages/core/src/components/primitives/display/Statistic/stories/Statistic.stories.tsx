/**
 * @fileoverview Statistic Stories
 * @description Storybook stories for the Statistic component.
 * Demonstrates all features, variants, and engine implementations.
 * @module components/primitives/display/Statistic/stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Statistic } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

/**
 * Statistic component for displaying numerical values with
 * formatting, prefixes, suffixes, and countdown functionality.
 *
 * Supports three rendering engines:
 * - **Titan**: Ant Design (enterprise, feature-rich)
 * - **Hermes**: DaisyUI/Tailwind (lightweight, utility-first)
 * - **Apollo**: Vanilla HTML/CSS (minimal, accessible)
 */
const meta: Meta<typeof Statistic> = {
  title: 'Primitives/Display/Statistic',
  component: Statistic,
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
        component: 'Statistic component for displaying formatted numerical data with optional title, prefix, suffix, and semantic coloring.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text displayed above the value',
    },
    value: {
      control: 'number',
      description: 'The statistic value to display',
    },
    precision: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Number of decimal places',
    },
    prefix: {
      control: 'text',
      description: 'Content displayed before the value',
    },
    suffix: {
      control: 'text',
      description: 'Content displayed after the value',
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show loading skeleton',
    },
    valueType: {
      control: 'select',
      options: ['default', 'positive', 'negative', 'warning'],
      description: 'Semantic type affecting value color',
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
type Story = StoryObj<typeof Statistic>;

/**
 * Default Statistic with title and value.
 */
export const Default: Story = {
  args: {
    title: 'Active Users',
    value: 112893,
  },
};

/**
 * Statistic with currency formatting.
 */
export const Currency: Story = {
  args: {
    title: 'Account Balance',
    value: 125000.5,
    precision: 2,
    prefix: '$',
  },
};

/**
 * Statistic showing percentage.
 */
export const Percentage: Story = {
  args: {
    title: 'Conversion Rate',
    value: 3.75,
    precision: 2,
    suffix: '%',
    valueType: 'positive',
  },
};

/**
 * Loading state with skeleton.
 */
export const Loading: Story = {
  args: {
    title: 'Loading Data',
    loading: true,
  },
};

/**
 * Different semantic value types.
 */
export const ValueTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Statistic title="Default" value={1000} valueType="default" />
      <Statistic title="Positive" value={25.5} suffix="%" valueType="positive" />
      <Statistic title="Negative" value={-12.3} suffix="%" valueType="negative" />
      <Statistic title="Warning" value={89} suffix="%" valueType="warning" />
    </div>
  ),
};

/**
 * Custom number formatting.
 */
export const CustomFormatting: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Statistic
        title="European Format"
        value={1234567.89}
        precision={2}
        groupSeparator="."
        decimalSeparator=","
      />
      <Statistic
        title="Space Separator"
        value={1234567}
        groupSeparator=" "
      />
      <Statistic
        title="Custom Formatter"
        value={0.895}
        formatter={(val) => `${(Number(val) * 100).toFixed(1)}%`}
      />
    </div>
  ),
};

/**
 * Comparison of all three engines.
 */
export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize', fontWeight: 600 }}>
            {engine} Engine
          </h4>
          <div style={{ display: 'flex', gap: 24 }}>
            <Statistic
              engine={engine}
              title="Users"
              value={1128}
            />
            <Statistic
              engine={engine}
              title="Revenue"
              value={125000}
              prefix="$"
              precision={2}
            />
            <Statistic
              engine={engine}
              title="Growth"
              value={15.5}
              suffix="%"
              valueType="positive"
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Countdown timer example.
 */
export const CountdownTimer: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Statistic.Countdown
        title="Sale Ends In"
        value={Date.now() + 1000 * 60 * 60 * 24}
        format="DD:HH:mm:ss"
      />
      <Statistic.Countdown
        title="Time Left"
        value={Date.now() + 1000 * 60 * 60}
        format="HH:mm:ss"
        valueType="warning"
      />
    </div>
  ),
};

/**
 * Countdown with custom format.
 */
export const CountdownFormats: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Statistic.Countdown
        title="Days Format"
        value={Date.now() + 1000 * 60 * 60 * 24 * 3}
        format="D days HH:mm:ss"
      />
      <Statistic.Countdown
        title="Minutes Only"
        value={Date.now() + 1000 * 60 * 30}
        format="mm:ss"
      />
    </div>
  ),
};

/**
 * Dashboard example with multiple statistics.
 */
export const Dashboard: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 24,
      padding: 24,
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
    }}>
      <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
        <Statistic title="Total Users" value={128456} />
      </div>
      <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
        <Statistic title="Revenue" value={1250000} prefix="$" precision={2} />
      </div>
      <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
        <Statistic title="Growth" value={23.5} suffix="%" valueType="positive" />
      </div>
      <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
        <Statistic title="Bounce Rate" value={-5.2} suffix="%" valueType="negative" />
      </div>
    </div>
  ),
};

/**
 * Custom styled statistics.
 */
export const CustomStyles: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Statistic
        title="Custom Value Style"
        value={1000}
        valueStyle={{ color: '#1890ff', fontSize: 32 }}
      />
      <Statistic
        title="Custom Container"
        value={2000}
        className="custom-statistic"
        style={{
          padding: 16,
          backgroundColor: '#f0f5ff',
          borderRadius: 8,
          border: '1px solid #1890ff',
        }}
      />
    </div>
  ),
};
