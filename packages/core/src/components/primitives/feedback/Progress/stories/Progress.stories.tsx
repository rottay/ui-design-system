/**
 * Progress Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '../';

const meta: Meta<typeof Progress> = {
  title: 'Primitives/Feedback/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    percent: {
      control: { type: 'range', min: 0, max: 100 },
    },
    type: {
      control: 'select',
      options: ['line', 'circle'],
    },
    status: {
      control: 'select',
      options: ['normal', 'success', 'error', 'active'],
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
    },
    showInfo: {
      control: 'boolean',
    },
    strokeWidth: {
      control: { type: 'range', min: 1, max: 20 },
    },
    strokeColor: {
      control: 'color',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    percent: 50,
    type: 'line',
  },
};

export const LineProgress: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <Progress percent={30} />
      <Progress percent={50} status="active" />
      <Progress percent={70} status="error" />
      <Progress percent={100} />
    </div>
  ),
};

export const CircleProgress: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Progress type="circle" percent={30} />
      <Progress type="circle" percent={70} status="error" />
      <Progress type="circle" percent={100} />
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <Progress percent={50} status="normal" />
      <Progress percent={50} status="active" />
      <Progress percent={50} status="success" />
      <Progress percent={50} status="error" />
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <Progress percent={50} strokeColor="#8b5cf6" />
      <Progress percent={70} strokeColor="#06b6d4" />
      <Progress percent={90} strokeColor="#f59e0b" />
    </div>
  ),
};

export const WithoutInfo: Story = {
  args: {
    percent: 50,
    showInfo: false,
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 400 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ marginBottom: 8, textTransform: 'capitalize' }}>{engine}</h4>
          <Progress engine={engine} percent={60} />
        </div>
      ))}
    </div>
  ),
};
