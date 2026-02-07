/**
 * System Providers Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DesignSystemProvider } from '../root';
import { FeatureGate } from '../../features/gate';
import { Button } from '../../../components/primitives/inputs/Button';
import { Alert } from '../../../components/primitives/feedback/Alert';

const meta: Meta = {
  title: 'System/Providers',
  parameters: {
    docs: {
      description: {
        component: 'Core providers for the Rottay Design System.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const DesignSystemProviderExample: StoryObj = {
  render: () => (
    <DesignSystemProvider
      tenant={{
        slug: 'demo',
        name: 'Demo Tenant',
        engine: 'classic',
        theme: 'bithire',
        plan: 'pro',
        features: ['dashboard', 'analytics', 'api'],
        branding: {
          companyName: 'Demo Company',
          primaryColor: '#4F46E5',
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Design System Provider Demo</h2>
        <p style={{ marginBottom: 16 }}>
          Components are wrapped in the DesignSystemProvider with custom tenant configuration.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </div>
    </DesignSystemProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The DesignSystemProvider wraps your app and provides tenant, engine, and theme context.',
      },
    },
  },
};

export const EngineSelection: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <DesignSystemProvider tenant={{ engine: 'classic' } as any}>
        <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 8px' }}>Classic Engine (Ant Design)</h4>
          <Button variant="primary">Classic Button</Button>
        </div>
      </DesignSystemProvider>

      <DesignSystemProvider tenant={{ engine: 'modern' } as any}>
        <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 8px' }}>Modern Engine (DaisyUI)</h4>
          <Button variant="primary">Modern Button</Button>
        </div>
      </DesignSystemProvider>

      <DesignSystemProvider tenant={{ engine: 'rustic' } as any}>
        <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 8px' }}>Rustic Engine (HTML)</h4>
          <Button variant="primary">Rustic Button</Button>
        </div>
      </DesignSystemProvider>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different engines render components with different underlying UI libraries.',
      },
    },
  },
};

export const FeatureGateExample: StoryObj = {
  render: () => (
    <DesignSystemProvider
      tenant={{
        slug: 'demo',
        name: 'Demo',
        engine: 'classic',
        theme: 'default',
        plan: 'pro',
        features: ['dashboard', 'analytics'],
        branding: { companyName: 'Demo' },
      }}
    >
      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Feature Gate Demo</h2>

        <FeatureGate feature="dashboard">
          <Alert
            type="success"
            message="Dashboard Feature"
            description="This alert is visible because the 'dashboard' feature is enabled."
            showIcon
          />
        </FeatureGate>

        <div style={{ marginTop: 16 }}>
          <FeatureGate
            feature="premium-reports"
            fallback={
              <Alert
                type="warning"
                message="Feature Not Available"
                description="Premium reports require an enterprise plan."
                showIcon
              />
            }
          >
            <Alert
              type="success"
              message="Premium Reports"
              description="You have access to premium reports."
              showIcon
            />
          </FeatureGate>
        </div>
      </div>
    </DesignSystemProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'FeatureGate conditionally renders content based on tenant features.',
      },
    },
  },
};
