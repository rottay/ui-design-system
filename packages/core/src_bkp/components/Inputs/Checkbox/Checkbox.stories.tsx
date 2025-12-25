import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from './Checkbox';
import { Space, Checkbox as AntCheckbox } from 'antd';

const meta: Meta<typeof Checkbox> = {
  title: 'Inputs/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de casilla de verificación para selecciones múltiples.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/checkbox)
- [🎨 API de Props](https://ant.design/components/checkbox#api)
- [💡 Ejemplos](https://ant.design/components/checkbox#examples)

## Cuándo usar

- Para permitir al usuario seleccionar múltiples opciones de un conjunto.
- Soporta estados indeterminados y grupos de checkboxes.
        `,
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    indeterminate: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {
  args: {
    children: 'Checkbox',
  },
};

export const Disabled: Story = {
  render: () => (
    <Space direction="vertical">
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox disabled checked>
        Disabled and checked
      </Checkbox>
    </Space>
  ),
};

export const CheckboxGroup: Story = {
  render: () => {
    const options = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Pear', value: 'Pear' },
      { label: 'Orange', value: 'Orange' },
    ];

    return (
      <Space direction="vertical">
        <AntCheckbox.Group options={options} defaultValue={['Apple']} />
        <AntCheckbox.Group
          options={options}
          defaultValue={['Apple', 'Orange']}
          disabled
        />
      </Space>
    );
  },
};

export const Indeterminate: Story = {
  render: () => {
    const CheckboxGroupExample = () => {
      const [checkedList, setCheckedList] = useState<string[]>(['Apple']);
      const [indeterminate, setIndeterminate] = useState(true);
      const [checkAll, setCheckAll] = useState(false);

      const plainOptions = ['Apple', 'Pear', 'Orange'];

      const onChange = (list: string[]) => {
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < plainOptions.length);
        setCheckAll(list.length === plainOptions.length);
      };

      const onCheckAllChange = (e: any) => {
        setCheckedList(e.target.checked ? plainOptions : []);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
      };

      return (
        <Space direction="vertical">
          <Checkbox
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}
          >
            Check all
          </Checkbox>
          <AntCheckbox.Group
            options={plainOptions}
            value={checkedList}
            onChange={onChange as any}
          />
        </Space>
      );
    };

    return <CheckboxGroupExample />;
  },
};

export const WithText: Story = {
  render: () => (
    <Space direction="vertical">
      <Checkbox>Option A</Checkbox>
      <Checkbox>Option B</Checkbox>
      <Checkbox>Option C</Checkbox>
      <Checkbox checked>Checked by default</Checkbox>
    </Space>
  ),
};
