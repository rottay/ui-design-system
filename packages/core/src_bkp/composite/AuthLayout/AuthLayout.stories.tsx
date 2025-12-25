import type { Meta, StoryObj } from '@storybook/react';
import { AuthLayout } from './AuthLayout';
import { Form, Input, Button, Checkbox, Divider } from 'antd';

const meta = {
  title: 'Composite/AuthLayout',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundVariant: {
      control: 'select',
      options: ['solid', 'gradient', 'image', 'none'],
      description: 'Background style variant',
    },
    position: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Form container position',
    },
  },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample Login Form
const LoginForm = () => (
  <Form layout="vertical">
    <Form.Item label="Email" name="email" rules={[{ required: true }]}>
      <Input type="email" placeholder="you@example.com" size="large" />
    </Form.Item>
    <Form.Item label="Password" name="password" rules={[{ required: true }]}>
      <Input.Password placeholder="Enter your password" size="large" />
    </Form.Item>
    <Form.Item>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Checkbox>Remember me</Checkbox>
        <a href="#" style={{ fontSize: '14px' }}>
          Forgot password?
        </a>
      </div>
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" block size="large">
        Sign In
      </Button>
    </Form.Item>
  </Form>
);

// Sample Register Form
const RegisterForm = () => (
  <Form layout="vertical">
    <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
      <Input placeholder="John Doe" size="large" />
    </Form.Item>
    <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
      <Input type="email" placeholder="you@example.com" size="large" />
    </Form.Item>
    <Form.Item label="Password" name="password" rules={[{ required: true }]}>
      <Input.Password placeholder="Create a password" size="large" />
    </Form.Item>
    <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true }]}>
      <Input.Password placeholder="Confirm your password" size="large" />
    </Form.Item>
    <Form.Item>
      <Checkbox>
        I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
      </Checkbox>
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" block size="large">
        Create Account
      </Button>
    </Form.Item>
  </Form>
);

export const LoginDefault: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account to continue',
    backgroundVariant: 'solid',
    children: <LoginForm />,
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const LoginWithLogo: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to continue to Your App',
    logoSrc: 'https://ant.design/img/logo.svg',
    logoAlt: 'App Logo',
    backgroundVariant: 'solid',
    children: <LoginForm />,
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const LoginGradient: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    logoSrc: 'https://ant.design/img/logo.svg',
    backgroundVariant: 'gradient',
    gradientColors: ['#1890ff', '#52c41a'],
    children: <LoginForm />,
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const LoginGradientPurple: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    logoSrc: 'https://ant.design/img/logo.svg',
    backgroundVariant: 'gradient',
    gradientColors: ['#722ed1', '#eb2f96'],
    children: <LoginForm />,
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const LoginWithImage: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    logoSrc: 'https://ant.design/img/logo.svg',
    backgroundVariant: 'image',
    backgroundImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
    children: <LoginForm />,
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const LoginMinimal: Story = {
  args: {
    title: 'Sign In',
    backgroundVariant: 'none',
    children: <LoginForm />,
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const RegisterDefault: Story = {
  args: {
    title: 'Create Account',
    subtitle: 'Get started with your free account',
    logoSrc: 'https://ant.design/img/logo.svg',
    backgroundVariant: 'gradient',
    gradientColors: ['#1890ff', '#722ed1'],
    maxWidth: 450,
    children: <RegisterForm />,
    footer: (
      <div>
        Already have an account? <a href="#">Sign in</a>
      </div>
    ),
  },
};

export const WithBackLink: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    logoSrc: 'https://ant.design/img/logo.svg',
    backgroundVariant: 'gradient',
    showBackLink: true,
    backLinkText: 'Back to Home',
    backLinkUrl: '/',
    children: <LoginForm />,
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const PositionLeft: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    logoSrc: 'https://ant.design/img/logo.svg',
    backgroundVariant: 'gradient',
    position: 'left',
    children: <LoginForm />,
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const PositionRight: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    logoSrc: 'https://ant.design/img/logo.svg',
    backgroundVariant: 'gradient',
    position: 'right',
    children: <LoginForm />,
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const WithSocialLogins: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    logoSrc: 'https://ant.design/img/logo.svg',
    backgroundVariant: 'gradient',
    children: (
      <>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Button block size="large">
            Google
          </Button>
          <Button block size="large">
            GitHub
          </Button>
        </div>
        <Divider>Or continue with email</Divider>
        <LoginForm />
      </>
    ),
    footer: (
      <div>
        Don't have an account? <a href="#">Sign up</a>
      </div>
    ),
  },
};

export const ForgotPassword: Story = {
  args: {
    title: 'Forgot Password?',
    subtitle: 'Enter your email to reset your password',
    logoSrc: 'https://ant.design/img/logo.svg',
    backgroundVariant: 'gradient',
    showBackLink: true,
    backLinkText: 'Back to Login',
    children: (
      <Form layout="vertical">
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
          <Input type="email" placeholder="you@example.com" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>
    ),
    footer: (
      <div>
        Remember your password? <a href="#">Sign in</a>
      </div>
    ),
  },
};
