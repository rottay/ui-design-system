/**
 * Slider Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Slider> = {
  title: 'Primitives/Inputs/Slider',
  component: Slider,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: '40px 20px' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'A slider component for selecting values from a range with multi-engine support.',
      },
    },
  },
  argTypes: {
    min: { control: { type: 'number' }, description: 'Minimum value' },
    max: { control: { type: 'number' }, description: 'Maximum value' },
    step: { control: { type: 'number' }, description: 'Step increment' },
    range: { control: 'boolean', description: 'Enable range mode (dual handles)' },
    vertical: { control: 'boolean', description: 'Vertical orientation' },
    disabled: { control: 'boolean', description: 'Disabled state' },
    dots: { control: 'boolean', description: 'Show dots on each step' },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    defaultValue: 30,
  },
};

export const Range: Story = {
  args: {
    range: true,
    defaultValue: [20, 70],
  },
};

export const WithMarks: Story = {
  args: {
    marks: {
      0: '0%',
      25: '25%',
      50: '50%',
      75: '75%',
      100: '100%',
    },
    defaultValue: 50,
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Disabled single</p>
        <Slider disabled defaultValue={50} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Disabled range</p>
        <Slider disabled range defaultValue={[20, 80]} />
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, height: 200 }}>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Single</p>
        <Slider vertical defaultValue={30} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Range</p>
        <Slider vertical range defaultValue={[20, 70]} />
      </div>
    </div>
  ),
};

export const Steps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Step: 1 (default)</p>
        <Slider defaultValue={50} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Step: 10</p>
        <Slider step={10} defaultValue={50} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Step: 10 with dots</p>
        <Slider step={10} dots defaultValue={50} />
      </div>
    </div>
  ),
};

export const CustomTooltip: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Percentage formatter</p>
        <Slider defaultValue={30} tooltip={{ formatter: (value) => `${value}%` }} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Currency formatter</p>
        <Slider min={0} max={1000} step={50} defaultValue={500} tooltip={{ formatter: (value) => `$${value}` }} />
      </div>
    </div>
  ),
};

export const ControlledValue: Story = {
  render: () => {
    const [value, setValue] = useState<number>(50);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Slider value={value} onChange={(v) => setValue(v as number)} />
        <p style={{ margin: 0, fontSize: 14 }}>Current value: <strong>{value}</strong></p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setValue(0)}>Set to 0</button>
          <button onClick={() => setValue(50)}>Set to 50</button>
          <button onClick={() => setValue(100)}>Set to 100</button>
        </div>
      </div>
    );
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 16px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Slider engine={engine} defaultValue={30} />
            <Slider engine={engine} range defaultValue={[20, 70]} />
            <Slider engine={engine} disabled defaultValue={40} />
          </div>
        </div>
      ))}
    </div>
  ),
};
