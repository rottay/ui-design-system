import type { Meta, StoryObj } from '@storybook/react';
import { Result } from './Result';
import { Button, Space } from 'antd';

const meta: Meta<typeof Result> = {
  title: 'Feedback/Result',
  component: Result,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente para mostrar resultados de operaciones o estados de página.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/result)
- [🎨 API de Props](https://ant.design/components/result#api)
- [💡 Ejemplos](https://ant.design/components/result#examples)

## Cuándo usar

- Para mostrar el resultado de una operación (éxito, error, advertencia).
- Para páginas de error (404, 403, 500) con información y acciones sugeridas.
        `,
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'error', 'info', 'warning', '404', '403', '500'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Result>;

export const Success: Story = {
  args: {
    status: 'success',
    title: 'Successfully Purchased Cloud Server ECS!',
    subTitle: 'Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait.',
    extra: [
      <Button type="primary" key="console">
        Go Console
      </Button>,
      <Button key="buy">Buy Again</Button>,
    ],
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    title: 'Submission Failed',
    subTitle: 'Please check and modify the following information before resubmitting.',
    extra: [
      <Button type="primary" key="console">
        Go Console
      </Button>,
      <Button key="buy">Buy Again</Button>,
    ],
  },
};

export const Info: Story = {
  args: {
    status: 'info',
    title: 'Your operation has been executed',
    extra: [
      <Button type="primary" key="console">
        Go Console
      </Button>,
    ],
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
    title: 'There are some problems with your operation.',
    extra: [
      <Button type="primary" key="console">
        Go Console
      </Button>,
    ],
  },
};

export const NotFound: Story = {
  args: {
    status: '404',
    title: '404',
    subTitle: 'Sorry, the page you visited does not exist.',
    extra: <Button type="primary">Back Home</Button>,
  },
};

export const Forbidden: Story = {
  args: {
    status: '403',
    title: '403',
    subTitle: 'Sorry, you are not authorized to access this page.',
    extra: <Button type="primary">Back Home</Button>,
  },
};

export const ServerError: Story = {
  args: {
    status: '500',
    title: '500',
    subTitle: 'Sorry, something went wrong.',
    extra: <Button type="primary">Back Home</Button>,
  },
};

export const AllTypes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Result
        status="success"
        title="Successfully Purchased Cloud Server ECS!"
        subTitle="Order number: 2017182818828182881"
      />
      <Result
        status="error"
        title="Submission Failed"
        subTitle="Please check and modify the following information before resubmitting."
      />
      <Result status="info" title="Your operation has been executed" />
      <Result status="warning" title="There are some problems with your operation." />
      <Result status="404" title="404" subTitle="Sorry, the page you visited does not exist." />
      <Result status="403" title="403" subTitle="Sorry, you are not authorized to access this page." />
      <Result status="500" title="500" subTitle="Sorry, something went wrong." />
    </Space>
  ),
};
