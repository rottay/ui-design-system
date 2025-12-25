import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Display/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de línea de tiempo para mostrar información cronológica.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/timeline)
- [🎨 API de Props](https://ant.design/components/timeline#api)
- [💡 Ejemplos](https://ant.design/components/timeline#examples)

## Cuándo usar

- Para mostrar eventos o actividades en orden cronológico.
- Soporta diferentes modos de visualización y estados de color.
        `,
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['left', 'alternate', 'right'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const items = [
  {
    children: 'Create a services site 2015-09-01',
  },
  {
    children: 'Solve initial network problems 2015-09-01',
  },
  {
    children: 'Technical testing 2015-09-01',
  },
  {
    children: 'Network problems being solved 2015-09-01',
  },
];

export const Basic: Story = {
  args: {
    items,
  },
};

export const WithColors: Story = {
  args: {
    items: [
      {
        color: 'green',
        children: 'Create a services site 2015-09-01',
      },
      {
        color: 'green',
        children: 'Create a services site 2015-09-01',
      },
      {
        color: 'red',
        children: (
          <>
            <p>Solve initial network problems 1</p>
            <p>Solve initial network problems 2</p>
            <p>Solve initial network problems 3 2015-09-01</p>
          </>
        ),
      },
      {
        children: 'Technical testing 2015-09-01',
      },
      {
        color: 'gray',
        children: 'Technical testing 2015-09-01',
      },
      {
        color: 'gray',
        children: 'Technical testing 2015-09-01',
      },
    ],
  },
};

export const Alternate: Story = {
  args: {
    mode: 'alternate',
    items,
  },
};

export const Right: Story = {
  args: {
    mode: 'right',
    items,
  },
};

export const Pending: Story = {
  args: {
    pending: 'Recording...',
    items,
  },
};

export const Reverse: Story = {
  args: {
    reverse: true,
    items,
  },
};
