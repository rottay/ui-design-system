import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from './TimePicker';
import { Space } from 'antd';
import dayjs from 'dayjs';

const meta: Meta<typeof TimePicker> = {
  title: 'Inputs/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Selector de tiempo que permite elegir horas y minutos de manera intuitiva.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/time-picker)
- [🎨 API de Props](https://ant.design/components/time-picker#api)
- [💡 Ejemplos](https://ant.design/components/time-picker#examples)

## Cuándo usar

- Para seleccionar horarios específicos en formularios
- Cuando necesitas entrada de tiempo con formato consistente
- Para programación de eventos, citas, o recordatorios
        `,
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
    },
    use12Hours: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Basic: Story = {
  args: {
    placeholder: 'Select time',
  },
};

export const Formats: Story = {
  render: () => (
    <Space direction="vertical">
      <TimePicker format="HH:mm:ss" placeholder="HH:mm:ss" />
      <TimePicker format="HH:mm" placeholder="HH:mm" />
      <TimePicker format="mm:ss" placeholder="mm:ss" />
    </Space>
  ),
};

export const RangePickerStory: Story = {
  render: () => (
    <Space direction="vertical">
      <TimePicker.RangePicker />
      <TimePicker.RangePicker use12Hours format="h:mm A" />
    </Space>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Space direction="vertical">
      <TimePicker disabled placeholder="Disabled" />
      <TimePicker.RangePicker disabled />
    </Space>
  ),
};

export const Use12Hours: Story = {
  render: () => (
    <Space direction="vertical">
      <TimePicker use12Hours format="h:mm A" placeholder="12 hour format" />
      <TimePicker use12Hours format="h:mm:ss A" placeholder="12 hour with seconds" />
    </Space>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical">
      <TimePicker size="small" placeholder="Small" />
      <TimePicker size="middle" placeholder="Middle (default)" />
      <TimePicker size="large" placeholder="Large" />
    </Space>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Space direction="vertical">
      <TimePicker defaultValue={dayjs('12:08:23', 'HH:mm:ss')} />
      <TimePicker.RangePicker
        defaultValue={[dayjs('08:00', 'HH:mm'), dayjs('18:00', 'HH:mm')]}
      />
    </Space>
  ),
};

export const HourStep: Story = {
  render: () => (
    <Space direction="vertical">
      <TimePicker hourStep={2} minuteStep={15} secondStep={10} />
      <TimePicker hourStep={1} minuteStep={30} placeholder="30 min intervals" />
    </Space>
  ),
};

export const AllowClear: Story = {
  args: {
    allowClear: true,
    placeholder: 'Select time',
    defaultValue: dayjs('12:00', 'HH:mm'),
  },
};
