/**
 * AuthLayout Custom Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  MinimalAuthLayout,
  StandardAuthLayout,
  BrandedAuthLayout,
  SocialAuthLayout,
  EnterpriseAuthLayout,
} from '../';
import { DesignSystemProvider } from '../../../../design-system';

const meta: Meta = {
  title: 'Custom/AuthLayout',
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Authentication layout presets for login, registration, and password recovery flows.',
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const handleSubmit = (values: Record<string, unknown>) => {
  console.log('Form submitted:', values);
  alert('Form submitted! Check console for values.');
};

export const Minimal: StoryObj = {
  render: () => (
    <MinimalAuthLayout
      onSubmit={handleSubmit}
      submitLabel="Sign In"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Simple email/password login form.',
      },
    },
  },
};

export const Standard: StoryObj = {
  render: () => (
    <StandardAuthLayout
      onSubmit={handleSubmit}
      submitLabel="Sign In"
      showRememberMe
      showForgotPassword
      onForgotPassword={() => alert('Forgot password clicked')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Standard login with remember me and forgot password options.',
      },
    },
  },
};

export const Branded: StoryObj = {
  render: () => (
    <BrandedAuthLayout
      onSubmit={handleSubmit}
      submitLabel="Sign In"
      title="Welcome Back"
      subtitle="Sign in to continue to your dashboard"
      showRememberMe
      showForgotPassword
      onForgotPassword={() => alert('Forgot password clicked')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Branded login with logo, title, and tenant branding.',
      },
    },
  },
};

export const Social: StoryObj = {
  render: () => (
    <SocialAuthLayout
      onSubmit={handleSubmit}
      submitLabel="Sign In"
      title="Welcome"
      subtitle="Choose how you want to sign in"
      socialProviders={[
        { id: 'google', name: 'Google', onClick: () => alert('Google login') },
        { id: 'github', name: 'GitHub', onClick: () => alert('GitHub login') },
        { id: 'microsoft', name: 'Microsoft', onClick: () => alert('Microsoft login') },
      ]}
      showDivider
      dividerText="or continue with email"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Social login with OAuth providers and email fallback.',
      },
    },
  },
};

export const Enterprise: StoryObj = {
  render: () => (
    <EnterpriseAuthLayout
      onSubmit={handleSubmit}
      submitLabel="Sign In"
      title="Enterprise Sign In"
      subtitle="Access your organization workspace"
      showSSO
      ssoLabel="Sign in with SSO"
      onSSO={() => alert('SSO login')}
      showMFA
      mfaLabel="Use security key"
      onMFA={() => alert('MFA clicked')}
      showTerms
      termsLabel="I agree to the Terms of Service and Privacy Policy"
      showRememberMe
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Enterprise login with SSO, MFA, and terms acceptance.',
      },
    },
  },
};

export const AllPresets: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>Minimal</h3>
        <MinimalAuthLayout onSubmit={handleSubmit} />
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Standard</h3>
        <StandardAuthLayout onSubmit={handleSubmit} showRememberMe showForgotPassword />
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Branded</h3>
        <BrandedAuthLayout onSubmit={handleSubmit} title="Welcome" subtitle="Sign in to continue" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of auth layout presets.',
      },
    },
  },
};
