import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';
import { Space, DatePicker as AntDatePicker } from 'antd';
import dayjs from 'dayjs';

const meta: Meta<typeof DatePicker> = {
  title: 'Inputs/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente selector de fechas para elegir fechas y rangos.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/date-picker)
- [🎨 API de Props](https://ant.design/components/date-picker#api)
- [💡 Ejemplos](https://ant.design/components/date-picker#examples)

## Cuándo usar

- Para seleccionar fechas, rangos de fechas o fechas con hora.
- Soporta diferentes formatos, presets y selectores de semana/mes/año.
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
    showTime: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

const { RangePicker } = AntDatePicker;

export const Basic: Story = {
  args: {
    placeholder: 'Select date',
  },
};

export const RangePickerStory: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <RangePicker />
      <RangePicker showTime />
      <RangePicker picker="week" />
      <RangePicker picker="month" />
      <RangePicker picker="quarter" />
      <RangePicker picker="year" />
    </Space>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <DatePicker disabled placeholder="Disabled" />
      <RangePicker disabled />
    </Space>
  ),
};

export const ShowTime: Story = {
  args: {
    showTime: true,
    placeholder: 'Select date and time',
  },
};

export const CustomFormat: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <DatePicker format="YYYY-MM-DD" />
      <DatePicker format="YYYY/MM/DD" />
      <DatePicker format="DD-MM-YYYY" />
      <DatePicker format="YYYY-MM-DD HH:mm:ss" showTime />
    </Space>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <DatePicker size="small" placeholder="Small" />
      <DatePicker size="middle" placeholder="Middle" />
      <DatePicker size="large" placeholder="Large" />
    </Space>
  ),
};

export const WithPresets: Story = {
  render: () => {
    const presets = [
      { label: 'Today', value: dayjs() },
      { label: 'Yesterday', value: dayjs().add(-1, 'd') },
      { label: 'Last Week', value: dayjs().add(-7, 'd') },
      { label: 'Last Month', value: dayjs().add(-1, 'month') },
    ];

    return <DatePicker presets={presets} />;
  },
};
