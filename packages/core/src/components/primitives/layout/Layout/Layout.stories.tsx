/**
 * Layout Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Layout } from './';
import { DesignSystemProvider } from '../../../../design-system';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Layout> = {
  title: 'Primitives/Layout/Layout',
  component: Layout,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Layout component for creating page structures with Header, Sider, Content, and Footer.',
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Layout>;

const headerStyle: React.CSSProperties = {
  backgroundColor: '#001529',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
};

const siderStyle: React.CSSProperties = {
  backgroundColor: '#001529',
  color: 'white',
  padding: '16px',
};

const contentStyle: React.CSSProperties = {
  backgroundColor: '#f0f2f5',
  padding: '24px',
  minHeight: 280,
};

const footerStyle: React.CSSProperties = {
  backgroundColor: '#001529',
  color: 'white',
  textAlign: 'center',
  padding: '16px',
};

export const Default: Story = {
  render: () => (
    <Layout style={{ minHeight: '400px' }}>
      <Layout.Header style={headerStyle}>Header</Layout.Header>
      <Layout.Content style={contentStyle}>Content</Layout.Content>
      <Layout.Footer style={footerStyle}>Footer</Layout.Footer>
    </Layout>
  ),
};

export const WithSider: Story = {
  render: () => (
    <Layout style={{ minHeight: '400px' }} hasSider>
      <Layout.Sider width={200} style={siderStyle}>
        <div>Menu Item 1</div>
        <div>Menu Item 2</div>
        <div>Menu Item 3</div>
      </Layout.Sider>
      <Layout>
        <Layout.Header style={headerStyle}>Header</Layout.Header>
        <Layout.Content style={contentStyle}>Content</Layout.Content>
        <Layout.Footer style={footerStyle}>Footer</Layout.Footer>
      </Layout>
    </Layout>
  ),
};

export const SiderOnRight: Story = {
  render: () => (
    <Layout style={{ minHeight: '400px' }} hasSider>
      <Layout>
        <Layout.Header style={headerStyle}>Header</Layout.Header>
        <Layout.Content style={contentStyle}>Content</Layout.Content>
        <Layout.Footer style={footerStyle}>Footer</Layout.Footer>
      </Layout>
      <Layout.Sider width={200} style={siderStyle}>
        <div>Right Sider</div>
      </Layout.Sider>
    </Layout>
  ),
};

export const HeaderSiderLayout: Story = {
  render: () => (
    <Layout style={{ minHeight: '400px' }}>
      <Layout.Header style={headerStyle}>Header</Layout.Header>
      <Layout hasSider>
        <Layout.Sider width={200} style={siderStyle}>
          <div>Sider</div>
        </Layout.Sider>
        <Layout.Content style={contentStyle}>Content</Layout.Content>
      </Layout>
      <Layout.Footer style={footerStyle}>Footer</Layout.Footer>
    </Layout>
  ),
};

export const CollapsibleSider: Story = {
  render: function CollapsibleSiderStory() {
    const [collapsed, setCollapsed] = useState(false);

    return (
      <Layout style={{ minHeight: '400px' }} hasSider>
        <Layout.Sider
          width={200}
          collapsedWidth={80}
          collapsed={collapsed}
          collapsible
          onCollapse={setCollapsed}
          style={siderStyle}
        >
          <div>{collapsed ? 'C' : 'Collapsed Sider'}</div>
        </Layout.Sider>
        <Layout>
          <Layout.Header style={headerStyle}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          </Layout.Header>
          <Layout.Content style={contentStyle}>
            <p>Click the button to toggle the sider.</p>
            <p>Sider is currently: {collapsed ? 'Collapsed' : 'Expanded'}</p>
          </Layout.Content>
        </Layout>
      </Layout>
    );
  },
};

export const ThemedSider: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Layout style={{ minHeight: '300px', width: '45%' }} hasSider>
        <Layout.Sider theme="dark" width={150} style={{ backgroundColor: '#001529', color: 'white', padding: 16 }}>
          Dark Theme
        </Layout.Sider>
        <Layout.Content style={{ ...contentStyle, minHeight: 'auto' }}>
          Content
        </Layout.Content>
      </Layout>
      <Layout style={{ minHeight: '300px', width: '45%' }} hasSider>
        <Layout.Sider theme="light" width={150} style={{ backgroundColor: '#fff', borderRight: '1px solid #f0f0f0', padding: 16 }}>
          Light Theme
        </Layout.Sider>
        <Layout.Content style={{ ...contentStyle, minHeight: 'auto' }}>
          Content
        </Layout.Content>
      </Layout>
    </div>
  ),
};

export const CustomHeight: Story = {
  render: () => (
    <Layout style={{ minHeight: '400px' }}>
      <Layout.Header height={80} style={{ ...headerStyle, fontSize: '20px' }}>
        Tall Header (80px)
      </Layout.Header>
      <Layout.Content style={contentStyle}>Content</Layout.Content>
      <Layout.Footer style={footerStyle}>Footer</Layout.Footer>
    </Layout>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Layout across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Layout rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Layout}
      props={{
        children: (
          <>
            <Layout.Header style={headerStyle}>Header</Layout.Header>
            <Layout.Content style={contentStyle}>Content</Layout.Content>
            <Layout.Footer style={footerStyle}>Footer</Layout.Footer>
          </>
        ),
        style: { minHeight: '200px' },
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};
