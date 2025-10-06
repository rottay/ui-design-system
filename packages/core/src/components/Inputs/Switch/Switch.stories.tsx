import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './Switch';
import { Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const meta: Meta<typeof Switch> = {
  title: 'Inputs/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de interruptor para alternar entre dos estados.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/switch)
- [🎨 API de Props](https://ant.design/components/switch#api)
- [💡 Ejemplos](https://ant.design/components/switch#examples)

## Cuándo usar

- Para cambiar entre dos estados opuestos (on/off, yes/no).
- Soporta diferentes tamaños, estados de carga y textos personalizados.
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'default'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Basic: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <Space>
      <Switch size="small" defaultChecked />
      <Switch defaultChecked />
    </Space>
  ),
};

export const Loading: Story = {
  render: () => (
    <Space>
      <Switch loading defaultChecked />
      <Switch loading size="small" />
    </Space>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Space>
      <Switch disabled />
      <Switch disabled defaultChecked />
    </Space>
  ),
};

export const WithText: Story = {
  render: () => (
    <Space direction="vertical">
      <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
      <Switch
        checkedChildren={<CheckOutlined />}
        unCheckedChildren={<CloseOutlined />}
        defaultChecked
      />
    </Space>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <Space direction="vertical">
        <Switch checked={checked} onChange={setChecked} />
        <span>Switch is {checked ? 'ON' : 'OFF'}</span>
      </Space>
    );
  },
};

export const WithOnChange: Story = {
  render: () => {
    const onChange = (checked: boolean) => {
      console.log('Switch changed to:', checked);
    };

    return (
      <Switch
        defaultChecked
        onChange={onChange}
        checkedChildren="Yes"
        unCheckedChildren="No"
      />
    );
  },
};
