import type { Meta, StoryObj } from '@storybook/react';
import { Mentions } from './Mentions';
import { Space } from 'antd';

const meta: Meta<typeof Mentions> = {
  title: 'Inputs/Mentions',
  component: Mentions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Campo de texto que permite mencionar personas u objetos con autocompletado.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/mentions)
- [🎨 API de Props](https://ant.design/components/mentions#api)
- [💡 Ejemplos](https://ant.design/components/mentions#examples)

## Cuándo usar

- Para sistemas de comentarios o mensajes que requieran menciones
- Cuando necesitas notificar a usuarios específicos en texto
- En aplicaciones sociales o colaborativas con funcionalidad de etiquetado
        `,
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Mentions>;

const options = [
  { value: 'afc163', label: 'afc163' },
  { value: 'zombieJ', label: 'zombieJ' },
  { value: 'yesmeck', label: 'yesmeck' },
];

export const Basic: Story = {
  args: {
    options,
    placeholder: 'Type @ to mention people',
    style: { width: '100%' },
  },
};

export const CustomPrefix: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Mentions
        prefix="@"
        options={options}
        placeholder="Use @ to mention"
        style={{ width: '100%' }}
      />
      <Mentions
        prefix="#"
        options={[
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
          { value: 'angular', label: 'Angular' },
        ]}
        placeholder="Use # for tags"
        style={{ width: '100%' }}
      />
      <Mentions
        prefix={['@', '#']}
        options={[
          ...options,
          { value: 'react', label: '#react' },
          { value: 'vue', label: '#vue' },
        ]}
        placeholder="Use @ or # for mentions"
        style={{ width: '100%' }}
      />
    </Space>
  ),
};

export const CustomRender: Story = {
  render: () => {
    const customOptions = options.map((opt) => ({
      value: opt.value,
      label: (
        <div>
          <span style={{ fontWeight: 'bold' }}>{opt.value}</span>
          <span style={{ color: '#999', marginLeft: 8 }}>({opt.label})</span>
        </div>
      ),
    }));

    return (
      <Mentions
        options={customOptions}
        placeholder="Type @ to mention with custom render"
        style={{ width: '100%' }}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    options,
    disabled: true,
    placeholder: 'Disabled mentions',
    style: { width: '100%' },
  },
};

export const Rows: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Mentions
        options={options}
        rows={1}
        placeholder="Single row"
        style={{ width: '100%' }}
      />
      <Mentions
        options={options}
        rows={3}
        placeholder="Three rows"
        style={{ width: '100%' }}
      />
    </Space>
  ),
};

export const WithAutoSize: Story = {
  args: {
    options,
    autoSize: true,
    placeholder: 'Auto size mentions',
    style: { width: '100%' },
  },
};
