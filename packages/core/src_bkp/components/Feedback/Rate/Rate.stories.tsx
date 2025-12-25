import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Rate } from './Rate';
import { Space } from 'antd';

const meta: Meta<typeof Rate> = {
  title: 'Feedback/Rate',
  component: Rate,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de calificación para recopilar opiniones del usuario.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/rate)
- [🎨 API de Props](https://ant.design/components/rate#api)
- [💡 Ejemplos](https://ant.design/components/rate#examples)

## Cuándo usar

- Para evaluar productos, servicios o experiencias mediante estrellas.
- Soporta medias estrellas, iconos personalizados y tooltips.
        `,
      },
    },
  },
  argTypes: {
    allowHalf: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    disabled: { control: 'boolean' },
    count: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Rate>;

export const Basic: Story = {
  args: {
    defaultValue: 3,
  },
};

export const AllowHalf: Story = {
  args: {
    defaultValue: 2.5,
    allowHalf: true,
  },
};

export const AllowClear: Story = {
  args: {
    defaultValue: 3,
    allowClear: true,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 2,
    disabled: true,
  },
};

export const CustomCount: Story = {
  render: () => (
    <Space direction="vertical">
      <Rate defaultValue={3} count={3} />
      <Rate defaultValue={5} count={5} />
      <Rate defaultValue={7} count={10} />
    </Space>
  ),
};

export const WithText: Story = {
  render: () => {
    const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];
    const [value, setValue] = useState(3);

    return (
      <Space>
        <Rate tooltips={desc} onChange={setValue} value={value} />
        {value ? <span>{desc[value - 1]}</span> : null}
      </Space>
    );
  },
};
