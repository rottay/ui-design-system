import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from './ColorPicker';
import { Space } from 'antd';

const meta: Meta<typeof ColorPicker> = {
  title: 'Inputs/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Selector de color que permite a los usuarios elegir colores de manera intuitiva.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/color-picker)
- [🎨 API de Props](https://ant.design/components/color-picker#api)
- [💡 Ejemplos](https://ant.design/components/color-picker#examples)

## Cuándo usar

- Cuando necesitas permitir la selección de colores personalizados
- Para configuraciones de temas o estilos visuales
- Cuando quieres proporcionar presets de colores predefinidos
        `,
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    showText: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Basic: Story = {
  args: {
    defaultValue: '#1677ff',
  },
};

export const Presets: Story = {
  args: {
    defaultValue: '#1677ff',
    presets: [
      {
        label: 'Recommended',
        colors: [
          '#000000',
          '#000000E0',
          '#000000A6',
          '#00000073',
          '#00000040',
          '#00000026',
          '#0000001A',
          '#00000012',
          '#0000000A',
          '#00000005',
        ],
      },
      {
        label: 'Recent',
        colors: ['#F5222D', '#FA8C16', '#FADB14', '#52C41A', '#1677FF', '#722ED1'],
      },
    ],
  },
};

export const ShowText: Story = {
  render: () => (
    <Space>
      <ColorPicker defaultValue="#1677ff" showText />
      <ColorPicker
        defaultValue="#1677ff"
        showText={(color) => <span>Custom ({color.toHexString()})</span>}
      />
    </Space>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: '#1677ff',
    disabled: true,
    showText: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <Space>
      <ColorPicker defaultValue="#1677ff" size="small" showText />
      <ColorPicker defaultValue="#1677ff" size="middle" showText />
      <ColorPicker defaultValue="#1677ff" size="large" showText />
    </Space>
  ),
};

export const Formats: Story = {
  render: () => (
    <Space direction="vertical">
      <ColorPicker defaultValue="#1677ff" format="hex" showText />
      <ColorPicker defaultValue="#1677ff" format="rgb" showText />
      <ColorPicker defaultValue="#1677ff" format="hsb" showText />
    </Space>
  ),
};
