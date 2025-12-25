import type { Meta, StoryObj } from '@storybook/react';
import { ErrorResult } from './ErrorResult';
import { SuccessResult } from './SuccessResult';
import { ResultPage } from './ResultPage';
import { Button, Space } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const meta: Meta = {
  title: 'Feedback/Result/Variants',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Variantes del componente Result para diferentes estados y contextos de feedback.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/result)
- [🎨 API de Props](https://ant.design/components/result#api)
- [💡 Ejemplos](https://ant.design/components/result#examples)

## Cuándo usar

- Para páginas de resultado de operaciones (éxito, error, etc.)
- Cuando necesitas comunicar el estado final de un proceso
- Para páginas 404, 500 u otros estados especiales
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ErrorResult Stories
export const BasicError: Story = {
  render: () => (
    <ErrorResult
      onRetry={() => console.log('Retry clicked')}
      onGoBack={() => console.log('Go back clicked')}
    />
  ),
};

export const ErrorWithCode: Story = {
  render: () => (
    <ErrorResult
      errorCode="500"
      title="Internal Server Error"
      subTitle="The server encountered an error and could not complete your request."
      onRetry={() => console.log('Retry clicked')}
    />
  ),
};

export const NetworkError: Story = {
  render: () => (
    <ErrorResult
      title="Network Error"
      subTitle="Unable to connect to the server. Please check your internet connection."
      onRetry={() => console.log('Retry clicked')}
      retryText="Reconnect"
    />
  ),
};

export const CustomErrorActions: Story = {
  render: () => (
    <ErrorResult
      errorCode="403"
      title="Access Denied"
      subTitle="You don't have permission to access this resource."
      extra={
        <Space>
          <Button type="primary">Request Access</Button>
          <Button>Contact Support</Button>
          <Button>Go Home</Button>
        </Space>
      }
    />
  ),
};

// SuccessResult Stories
export const BasicSuccess: Story = {
  render: () => (
    <SuccessResult
      onContinue={() => console.log('Continue clicked')}
      onGoHome={() => console.log('Go home clicked')}
    />
  ),
};

export const OrderSuccess: Story = {
  render: () => (
    <SuccessResult
      title="Order Placed Successfully"
      subTitle="Order number: #2023-08-12-001. Your order will be delivered within 3-5 business days."
      onContinue={() => console.log('Track order')}
      onGoHome={() => console.log('Continue shopping')}
      continueText="Track Order"
      goHomeText="Continue Shopping"
    />
  ),
};

export const PaymentSuccess: Story = {
  render: () => (
    <SuccessResult
      title="Payment Successful"
      subTitle="Your payment has been processed successfully. Receipt has been sent to your email."
      extra={
        <Space>
          <Button type="primary">Download Receipt</Button>
          <Button>View Details</Button>
        </Space>
      }
    />
  ),
};

export const RegistrationSuccess: Story = {
  render: () => (
    <SuccessResult
      title="Registration Successful"
      subTitle="Welcome! Your account has been created. Please check your email to verify your account."
      onContinue={() => console.log('Go to dashboard')}
      continueText="Go to Dashboard"
    />
  ),
};

// ResultPage Stories
export const ErrorPage404: Story = {
  render: () => (
    <ResultPage
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={() => console.log('Back home')}>
          Back Home
        </Button>
      }
    />
  ),
};

export const ErrorPage403: Story = {
  render: () => (
    <ResultPage
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button type="primary" onClick={() => console.log('Back home')}>
          Back Home
        </Button>
      }
    />
  ),
};

export const ErrorPage500: Story = {
  render: () => (
    <ResultPage
      status="500"
      title="500"
      subTitle="Sorry, something went wrong on our end."
      extra={
        <Button type="primary" onClick={() => console.log('Retry')}>
          Retry
        </Button>
      }
    />
  ),
};

export const SuccessPage: Story = {
  render: () => (
    <ResultPage
      status="success"
      title="Successfully Purchased Cloud Server ECS!"
      subTitle="Order number: 2017182818828182881. Cloud server configuration takes 1-5 minutes, please wait."
      extra={[
        <Button type="primary" key="console">
          Go Console
        </Button>,
        <Button key="buy">Buy Again</Button>,
      ]}
    />
  ),
};

export const CustomBackgroundPage: Story = {
  render: () => (
    <ResultPage
      status="info"
      title="Maintenance Mode"
      subTitle="We're currently performing scheduled maintenance. We'll be back soon!"
      backgroundColor="#f0f2f5"
      extra={
        <Button type="primary">Notify Me</Button>
      }
    />
  ),
};

export const WarningPage: Story = {
  render: () => (
    <ResultPage
      status="warning"
      title="Your Account Needs Attention"
      subTitle="There are some issues with your account that need to be resolved."
      extra={
        <Space>
          <Button type="primary">Resolve Issues</Button>
          <Button>Contact Support</Button>
        </Space>
      }
    />
  ),
};

export const CustomIconPage: Story = {
  render: () => (
    <ResultPage
      icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
      title="Subscription Expired"
      subTitle="Your subscription has expired. Please renew to continue using our services."
      extra={
        <Space>
          <Button type="primary">Renew Now</Button>
          <Button>View Plans</Button>
        </Space>
      }
      fullHeight={false}
      style={{ padding: '50px 0' }}
    />
  ),
};

export const CompactResultPage: Story = {
  render: () => (
    <ResultPage
      status="success"
      title="Task Completed"
      subTitle="Your task has been completed successfully."
      fullHeight={false}
      style={{ padding: '40px' }}
      extra={
        <Button type="primary">Done</Button>
      }
    />
  ),
};
