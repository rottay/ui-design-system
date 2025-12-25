import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de paginación para navegar entre páginas de datos o contenido.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/pagination)
- [🎨 API de Props](https://ant.design/components/pagination#api)
- [💡 Ejemplos](https://ant.design/components/pagination#examples)

## Cuándo usar

- Para dividir grandes conjuntos de datos en páginas manejables
- Cuando necesitas navegación entre múltiples páginas de resultados
- Para mejorar el rendimiento cargando datos de forma incremental
        `,
      },
    },
  },
  argTypes: {
    total: {
      control: { type: 'number' },
      description: 'Total number of data items',
    },
    defaultCurrent: {
      control: { type: 'number' },
      description: 'Default initial page number',
      defaultValue: 1,
    },
    defaultPageSize: {
      control: { type: 'number' },
      description: 'Default number of data items per page',
      defaultValue: 10,
    },
    pageSize: {
      control: { type: 'number' },
      description: 'Number of data items per page',
    },
    current: {
      control: { type: 'number' },
      description: 'Current page number',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable pagination',
    },
    hideOnSinglePage: {
      control: { type: 'boolean' },
      description: 'Hide pagination when there is only one page',
    },
    showSizeChanger: {
      control: { type: 'boolean' },
      description: 'Show page size changer',
    },
    showQuickJumper: {
      control: { type: 'boolean' },
      description: 'Show quick jumper',
    },
    simple: {
      control: { type: 'boolean' },
      description: 'Simple mode',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'small'],
      description: 'Size of pagination',
      defaultValue: 'default',
    },
    onChange: {
      action: 'page-changed',
      description: 'Callback when page changes',
    },
    onShowSizeChange: {
      action: 'size-changed',
      description: 'Callback when pageSize changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Basic: Story = {
  args: {
    defaultCurrent: 1,
    total: 50,
  },
};

export const MorePages: Story = {
  args: {
    defaultCurrent: 6,
    total: 500,
  },
};

export const WithPageSize: Story = {
  args: {
    defaultCurrent: 1,
    total: 500,
    showSizeChanger: true,
    defaultPageSize: 10,
  },
};

export const Simple: Story = {
  args: {
    simple: true,
    defaultCurrent: 2,
    total: 50,
  },
};

export const Mini: Story = {
  args: {
    size: 'small',
    defaultCurrent: 1,
    total: 50,
  },
};

export const ShowTotal: Story = {
  args: {
    total: 85,
    showTotal: (total: number) => `Total ${total} items`,
    defaultPageSize: 20,
  },
};

export const QuickJumper: Story = {
  args: {
    total: 500,
    showQuickJumper: true,
    defaultCurrent: 2,
  },
};

export const Disabled: Story = {
  args: {
    defaultCurrent: 1,
    total: 50,
    disabled: true,
  },
};
