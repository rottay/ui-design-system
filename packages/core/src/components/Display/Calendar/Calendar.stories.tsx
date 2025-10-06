import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from './Calendar';
import { Space } from 'antd';

const meta: Meta<typeof Calendar> = {
  title: 'Display/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de calendario para mostrar y seleccionar fechas.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/calendar)
- [🎨 API de Props](https://ant.design/components/calendar#api)
- [💡 Ejemplos](https://ant.design/components/calendar#examples)

## Cuándo usar

- Para mostrar fechas de manera visual en formato de calendario.
- Útil para programación de eventos, selección de fechas y visualización temporal.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Basic: Story = {
  args: {},
};

export const FullScreen: Story = {
  args: {
    fullscreen: true,
  },
};

export const Card: Story = {
  args: {
    fullscreen: false,
  },
};

export const WithCustomHeader: Story = {
  render: () => (
    <Calendar
      fullscreen={false}
      headerRender={({ value, onChange }) => {
        const start = 0;
        const end = 12;
        const monthOptions = [];

        const year = value.year();
        const month = value.month();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = start; i < end; i++) {
          monthOptions.push(
            <option key={i} value={i}>
              {months[i]}
            </option>
          );
        }

        const options = [];
        for (let i = year - 10; i < year + 10; i += 1) {
          options.push(
            <option key={i} value={i}>
              {i}
            </option>
          );
        }
        return (
          <div style={{ padding: 8 }}>
            <Space>
              <select
                value={year}
                onChange={(e) => {
                  const newValue = value.clone().year(Number(e.target.value));
                  onChange(newValue);
                }}
              >
                {options}
              </select>
              <select
                value={month}
                onChange={(e) => {
                  const newValue = value.clone().month(Number(e.target.value));
                  onChange(newValue);
                }}
              >
                {monthOptions}
              </select>
            </Space>
          </div>
        );
      }}
    />
  ),
};
