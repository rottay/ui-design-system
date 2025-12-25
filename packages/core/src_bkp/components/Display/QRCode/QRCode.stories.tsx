import type { Meta, StoryObj } from '@storybook/react';
import { QRCode } from './QRCode';
import { Space } from 'antd';

const meta: Meta<typeof QRCode> = {
  title: 'Display/QRCode',
  component: QRCode,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente para generar códigos QR.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/qrcode)
- [🎨 API de Props](https://ant.design/components/qrcode#api)
- [💡 Ejemplos](https://ant.design/components/qrcode#examples)

## Cuándo usar

- Para generar códigos QR que enlazan a URLs, texto u otros datos.
- Soporta personalización de tamaño, color y estado.
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['canvas', 'svg'],
    },
    status: {
      control: 'select',
      options: ['active', 'expired', 'loading'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof QRCode>;

export const Basic: Story = {
  args: {
    value: 'https://ant.design/',
  },
};

export const WithIcon: Story = {
  args: {
    value: 'https://ant.design/',
    icon: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  },
};

export const CustomSize: Story = {
  render: () => (
    <Space>
      <QRCode value="https://ant.design/" size={80} />
      <QRCode value="https://ant.design/" size={160} />
      <QRCode value="https://ant.design/" size={240} />
    </Space>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <Space>
      <QRCode value="https://ant.design/" color="#1677ff" />
      <QRCode value="https://ant.design/" color="#52c41a" />
      <QRCode value="https://ant.design/" color="#f5222d" />
    </Space>
  ),
};

export const Status: Story = {
  render: () => (
    <Space direction="vertical">
      <QRCode value="https://ant.design/" status="active" />
      <QRCode value="https://ant.design/" status="expired" />
      <QRCode value="https://ant.design/" status="loading" />
    </Space>
  ),
};

export const SVGType: Story = {
  args: {
    value: 'https://ant.design/',
    type: 'svg',
  },
};
