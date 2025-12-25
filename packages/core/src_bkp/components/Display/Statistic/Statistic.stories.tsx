import type { Meta, StoryObj } from '@storybook/react';
import { Statistic } from './Statistic';
import { Space } from 'antd';

const meta: Meta<typeof Statistic> = {
  title: 'Display/Statistic',
  component: Statistic,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente para mostrar datos estadísticos de manera destacada.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/statistic)
- [🎨 API de Props](https://ant.design/components/statistic#api)
- [💡 Ejemplos](https://ant.design/components/statistic#examples)

## Cuándo usar

- Para mostrar métricas clave, números importantes o estadísticas.
- Incluye soporte para contadores regresivos y personalización de formato.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Statistic>;

export const Basic: Story = {
  args: {
    title: 'Active Users',
    value: 112893,
  },
};

export const WithPrefix: Story = {
  render: () => (
    <Space>
      <Statistic title="Account Balance (USD)" value={112893} precision={2} prefix="$" />
      <Statistic title="Growth Rate" value={11.28} precision={2} suffix="%" />
    </Space>
  ),
};

export const InCard: Story = {
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 30 }}>
      <Space size="large">
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
          <Statistic
            title="Active"
            value={11.28}
            precision={2}
            valueStyle={{ color: '#3f8600' }}
            suffix="%"
          />
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
          <Statistic
            title="Idle"
            value={9.3}
            precision={2}
            valueStyle={{ color: '#cf1322' }}
            suffix="%"
          />
        </div>
      </Space>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    title: 'Active Users',
    value: 112893,
    loading: true,
  },
};

export const Countdown: Story = {
  render: () => {
    const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30; // Dayjs is needed
    return (
      <Space>
        {/* @ts-ignore - Countdown is from antd */}
        <Statistic.Countdown title="Countdown" value={deadline} />
      </Space>
    );
  },
};
