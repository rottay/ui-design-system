import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Transfer } from './Transfer';
import type { TransferProps } from 'antd';

const meta: Meta<typeof Transfer> = {
  title: 'Inputs/Transfer',
  component: Transfer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de transferencia de elementos entre dos columnas con búsqueda y selección.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/transfer)
- [🎨 API de Props](https://ant.design/components/transfer#api)
- [💡 Ejemplos](https://ant.design/components/transfer#examples)

## Cuándo usar

- Para mover elementos entre dos grupos (disponibles y seleccionados)
- Cuando necesitas asignar permisos, roles, o recursos a usuarios
- Para gestionar listas de elementos con selección múltiple
        `,
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    oneWay: {
      control: 'boolean',
    },
    showSearch: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Transfer>;

interface RecordType {
  key: string;
  title: string;
  description: string;
}

const mockData: RecordType[] = Array.from({ length: 20 }).map((_, i) => ({
  key: i.toString(),
  title: `Content ${i + 1}`,
  description: `Description of content ${i + 1}`,
}));

const initialTargetKeys = mockData
  .filter((item) => Number(item.key) % 3 > 1)
  .map((item) => item.key);

export const Basic: Story = {
  render: () => {
    const [targetKeys, setTargetKeys] = useState<string[]>(initialTargetKeys);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const onChange: TransferProps['onChange'] = (nextTargetKeys) => {
      setTargetKeys(nextTargetKeys as string[]);
    };

    const onSelectChange: TransferProps['onSelectChange'] = (
      sourceSelectedKeys,
      targetSelectedKeys
    ) => {
      setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys] as string[]);
    };

    return (
      <Transfer
        dataSource={mockData}
        titles={['Source', 'Target']}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={onChange}
        onSelectChange={onSelectChange}
        render={(item) => item.title}
      />
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    const [targetKeys, setTargetKeys] = useState<string[]>(initialTargetKeys);

    const onChange: TransferProps['onChange'] = (nextTargetKeys) => {
      setTargetKeys(nextTargetKeys as string[]);
    };

    const filterOption = (inputValue: string, option: RecordType) =>
      option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;

    return (
      <Transfer
        dataSource={mockData}
        showSearch
        filterOption={filterOption}
        targetKeys={targetKeys}
        onChange={onChange}
        render={(item) => item.title}
      />
    );
  },
};

export const CustomRender: Story = {
  render: () => {
    const [targetKeys, setTargetKeys] = useState<string[]>(initialTargetKeys);

    const onChange: TransferProps['onChange'] = (nextTargetKeys) => {
      setTargetKeys(nextTargetKeys as string[]);
    };

    return (
      <Transfer
        dataSource={mockData}
        targetKeys={targetKeys}
        onChange={onChange}
        render={(item) => (
          <div>
            <strong>{item.title}</strong>
            <div style={{ fontSize: '12px', color: '#999' }}>{item.description}</div>
          </div>
        )}
        listStyle={{
          width: 300,
          height: 400,
        }}
      />
    );
  },
};

export const OneWay: Story = {
  render: () => {
    const [targetKeys, setTargetKeys] = useState<string[]>(initialTargetKeys);

    const onChange: TransferProps['onChange'] = (nextTargetKeys) => {
      setTargetKeys(nextTargetKeys as string[]);
    };

    return (
      <Transfer
        dataSource={mockData}
        targetKeys={targetKeys}
        onChange={onChange}
        oneWay
        render={(item) => item.title}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Transfer
      dataSource={mockData}
      targetKeys={initialTargetKeys}
      disabled
      render={(item) => item.title}
    />
  ),
};

export const Pagination: Story = {
  render: () => {
    const [targetKeys, setTargetKeys] = useState<string[]>(initialTargetKeys);

    const onChange: TransferProps['onChange'] = (nextTargetKeys) => {
      setTargetKeys(nextTargetKeys as string[]);
    };

    const largeMockData = Array.from({ length: 100 }).map((_, i) => ({
      key: i.toString(),
      title: `Content ${i + 1}`,
      description: `Description ${i + 1}`,
    }));

    return (
      <Transfer
        dataSource={largeMockData}
        targetKeys={targetKeys}
        onChange={onChange}
        render={(item) => item.title}
        pagination
      />
    );
  },
};
