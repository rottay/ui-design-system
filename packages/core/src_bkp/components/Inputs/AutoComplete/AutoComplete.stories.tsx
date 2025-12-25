import type { Meta, StoryObj } from '@storybook/react';
import { AutoComplete } from './AutoComplete';
import { Space } from 'antd';

const meta: Meta<typeof AutoComplete> = {
  title: 'Inputs/AutoComplete',
  component: AutoComplete,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Campo de autocompletado que sugiere opciones mientras el usuario escribe.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/auto-complete)
- [🎨 API de Props](https://ant.design/components/auto-complete#api)
- [💡 Ejemplos](https://ant.design/components/auto-complete#examples)

## Cuándo usar

- Cuando necesitas sugerencias automáticas basadas en la entrada del usuario
- Para mejorar la experiencia de búsqueda con resultados predictivos
- Cuando quieres reducir el esfuerzo de escritura del usuario
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AutoComplete>;

const mockOptions = [
  { value: 'Burns Bay Road' },
  { value: 'Downing Street' },
  { value: 'Wall Street' },
  { value: 'Main Street' },
  { value: 'Park Avenue' },
];

export const Basic: Story = {
  args: {
    options: mockOptions,
    placeholder: 'Type to search...',
    style: { width: 200 },
  },
};

export const WithOptions: Story = {
  render: () => {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <AutoComplete
          options={mockOptions}
          placeholder="Search street"
          filterOption={(inputValue, option) =>
            option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          style={{ width: 300 }}
        />
      </Space>
    );
  },
};

export const CustomFilter: Story = {
  render: () => {
    const options = [
      { value: 'React' },
      { value: 'TypeScript' },
      { value: 'JavaScript' },
      { value: 'Vue' },
      { value: 'Angular' },
    ];

    return (
      <AutoComplete
        options={options}
        placeholder="Search framework..."
        filterOption={(inputValue, option) =>
          option?.value.toLowerCase().includes(inputValue.toLowerCase()) ?? false
        }
        style={{ width: 250 }}
      />
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <AutoComplete
        size="small"
        options={mockOptions}
        placeholder="Small"
        style={{ width: 200 }}
      />
      <AutoComplete
        size="middle"
        options={mockOptions}
        placeholder="Middle (default)"
        style={{ width: 200 }}
      />
      <AutoComplete
        size="large"
        options={mockOptions}
        placeholder="Large"
        style={{ width: 200 }}
      />
    </Space>
  ),
};

export const Disabled: Story = {
  args: {
    options: mockOptions,
    placeholder: 'Disabled',
    disabled: true,
    style: { width: 200 },
  },
};
