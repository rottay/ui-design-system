import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio } from './Radio';
import { Space, Radio as AntRadio } from 'antd';

const meta: Meta<typeof Radio> = {
  title: 'Inputs/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de botón de radio para seleccionar una opción de varias.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/radio)
- [🎨 API de Props](https://ant.design/components/radio#api)
- [💡 Ejemplos](https://ant.design/components/radio#examples)

## Cuándo usar

- Para permitir al usuario seleccionar solo una opción de un conjunto.
- Incluye variantes de botones y grupos de radios.
        `,
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    checked: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Basic: Story = {
  args: {
    children: 'Radio',
  },
};

export const RadioGroup: Story = {
  render: () => {
    const [value, setValue] = useState(1);

    return (
      <AntRadio.Group onChange={(e) => setValue(e.target.value)} value={value}>
        <Radio value={1}>A</Radio>
        <Radio value={2}>B</Radio>
        <Radio value={3}>C</Radio>
        <Radio value={4}>D</Radio>
      </AntRadio.Group>
    );
  },
};

export const RadioGroupVertical: Story = {
  render: () => (
    <AntRadio.Group defaultValue={1}>
      <Space direction="vertical">
        <Radio value={1}>Option A</Radio>
        <Radio value={2}>Option B</Radio>
        <Radio value={3}>Option C</Radio>
        <Radio value={4}>Option D</Radio>
      </Space>
    </AntRadio.Group>
  ),
};

export const RadioButton: Story = {
  render: () => (
    <Space direction="vertical">
      <AntRadio.Group defaultValue="a">
        <AntRadio.Button value="a">Hangzhou</AntRadio.Button>
        <AntRadio.Button value="b">Shanghai</AntRadio.Button>
        <AntRadio.Button value="c">Beijing</AntRadio.Button>
        <AntRadio.Button value="d">Chengdu</AntRadio.Button>
      </AntRadio.Group>
      <AntRadio.Group defaultValue="a" buttonStyle="solid">
        <AntRadio.Button value="a">Hangzhou</AntRadio.Button>
        <AntRadio.Button value="b">Shanghai</AntRadio.Button>
        <AntRadio.Button value="c">Beijing</AntRadio.Button>
        <AntRadio.Button value="d">Chengdu</AntRadio.Button>
      </AntRadio.Group>
    </Space>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Space direction="vertical">
      <Radio disabled>Disabled</Radio>
      <Radio disabled checked>
        Disabled and checked
      </Radio>
      <AntRadio.Group disabled defaultValue={1}>
        <Radio value={1}>Option A</Radio>
        <Radio value={2}>Option B</Radio>
        <Radio value={3}>Option C</Radio>
      </AntRadio.Group>
    </Space>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical">
      <AntRadio.Group defaultValue="a" size="small">
        <AntRadio.Button value="a">Small</AntRadio.Button>
        <AntRadio.Button value="b">Small</AntRadio.Button>
        <AntRadio.Button value="c">Small</AntRadio.Button>
      </AntRadio.Group>
      <AntRadio.Group defaultValue="a" size="middle">
        <AntRadio.Button value="a">Middle</AntRadio.Button>
        <AntRadio.Button value="b">Middle</AntRadio.Button>
        <AntRadio.Button value="c">Middle</AntRadio.Button>
      </AntRadio.Group>
      <AntRadio.Group defaultValue="a" size="large">
        <AntRadio.Button value="a">Large</AntRadio.Button>
        <AntRadio.Button value="b">Large</AntRadio.Button>
        <AntRadio.Button value="c">Large</AntRadio.Button>
      </AntRadio.Group>
    </Space>
  ),
};

export const WithOptions: Story = {
  render: () => {
    const options = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Pear', value: 'Pear' },
      { label: 'Orange', value: 'Orange' },
    ];

    const optionsWithDisabled = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Pear', value: 'Pear' },
      { label: 'Orange', value: 'Orange', disabled: true },
    ];

    return (
      <Space direction="vertical">
        <AntRadio.Group options={options} defaultValue="Apple" />
        <AntRadio.Group options={optionsWithDisabled} defaultValue="Apple" />
      </Space>
    );
  },
};
