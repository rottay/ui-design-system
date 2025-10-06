import type { Meta, StoryObj } from '@storybook/react';
import { Steps } from './Steps';
import { useState } from 'react';
import { Button } from '../../Inputs/Button';
import { Space } from 'antd';

const meta: Meta<typeof Steps> = {
  title: 'Navigation/Steps',
  component: Steps,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Indicador de progreso que muestra los pasos de un proceso o flujo de trabajo.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/steps)
- [🎨 API de Props](https://ant.design/components/steps#api)
- [💡 Ejemplos](https://ant.design/components/steps#examples)

## Cuándo usar

- Para procesos multi-paso como formularios o configuraciones
- Cuando necesitas mostrar el progreso en un flujo secuencial
- Para guiar al usuario a través de tareas complejas paso a paso
        `,
      },
    },
  },
  argTypes: {
    current: {
      control: { type: 'number' },
      description: 'Current step',
      defaultValue: 0,
    },
    direction: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Direction of steps',
      defaultValue: 'horizontal',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'small'],
      description: 'Size of steps',
      defaultValue: 'default',
    },
    status: {
      control: { type: 'select' },
      options: ['wait', 'process', 'finish', 'error'],
      description: 'Status of current step',
    },
    progressDot: {
      control: { type: 'boolean' },
      description: 'Steps with progress dot style',
    },
    items: {
      control: { type: 'object' },
      description: 'Step items',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when step is changed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Steps>;

const items = [
  {
    title: 'Finished',
    description: 'This is a description',
  },
  {
    title: 'In Progress',
    description: 'This is a description',
  },
  {
    title: 'Waiting',
    description: 'This is a description',
  },
];

export const Basic: Story = {
  args: {
    current: 1,
    items: items,
  },
};

export const Small: Story = {
  args: {
    current: 1,
    size: 'small',
    items: items,
  },
};

export const Vertical: Story = {
  args: {
    current: 1,
    direction: 'vertical',
    items: items,
  },
};

export const WithIcons: Story = {
  args: {
    current: 1,
    items: [
      {
        title: 'Login',
        status: 'finish',
        description: 'This is a description',
      },
      {
        title: 'Verification',
        status: 'process',
        description: 'This is a description',
      },
      {
        title: 'Pay',
        status: 'wait',
        description: 'This is a description',
      },
      {
        title: 'Done',
        status: 'wait',
        description: 'This is a description',
      },
    ],
  },
};

export const Error: Story = {
  args: {
    current: 1,
    status: 'error',
    items: items,
  },
};

export const Clickable: Story = {
  render: () => {
    const [current, setCurrent] = useState(0);
    return (
      <Steps
        current={current}
        onChange={setCurrent}
        items={items}
      />
    );
  },
};

export const Navigation: Story = {
  render: () => {
    const [current, setCurrent] = useState(0);

    const next = () => {
      setCurrent(current + 1);
    };

    const prev = () => {
      setCurrent(current - 1);
    };

    return (
      <div>
        <Steps current={current} items={items} />
        <div style={{ marginTop: '24px' }}>
          <Space>
            {current > 0 && (
              <Button onClick={prev}>Previous</Button>
            )}
            {current < items.length - 1 && (
              <Button type="primary" onClick={next}>Next</Button>
            )}
            {current === items.length - 1 && (
              <Button type="primary">Done</Button>
            )}
          </Space>
        </div>
      </div>
    );
  },
};

export const DotStyle: Story = {
  args: {
    current: 1,
    progressDot: true,
    items: items,
  },
};
