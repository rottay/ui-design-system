import React from 'react';
import { Space, Typography, Divider } from 'antd';
import { SkeletonLoader } from './SkeletonLoader';

const { Title, Text } = Typography;

/**
 * Example usage of all SkeletonLoader variants
 * This file demonstrates the different ways to use the SkeletonLoader component
 */

export const SkeletonLoaderExamples = () => {
  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <Title level={2}>SkeletonLoader Examples</Title>
      <Text type="secondary">
        Theme-aware skeleton loading states for different UI patterns
      </Text>

      <Divider />

      {/* Text Variant */}
      <section style={{ marginBottom: 48 }}>
        <Title level={4}>1. Text Variant</Title>
        <Text type="secondary">Single line text placeholders</Text>
        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
          <div>
            <Text strong>Small:</Text>
            <SkeletonLoader variant="text" size="small" />
          </div>
          <div>
            <Text strong>Default:</Text>
            <SkeletonLoader variant="text" />
          </div>
          <div>
            <Text strong>Large:</Text>
            <SkeletonLoader variant="text" size="large" />
          </div>
        </Space>
      </section>

      {/* Paragraph Variant */}
      <section style={{ marginBottom: 48 }}>
        <Title level={4}>2. Paragraph Variant</Title>
        <Text type="secondary">Multiple lines of text</Text>
        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
          <div>
            <Text strong>2 rows:</Text>
            <SkeletonLoader variant="paragraph" rows={2} />
          </div>
          <div>
            <Text strong>4 rows:</Text>
            <SkeletonLoader variant="paragraph" rows={4} />
          </div>
          <div>
            <Text strong>Small with 3 rows:</Text>
            <SkeletonLoader variant="paragraph" size="small" rows={3} />
          </div>
        </Space>
      </section>

      {/* Card Variant */}
      <section style={{ marginBottom: 48 }}>
        <Title level={4}>3. Card Variant</Title>
        <Text type="secondary">Card layouts with image and content</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
          <SkeletonLoader variant="card" size="small" />
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" size="large" />
        </div>
      </section>

      {/* Table Variant */}
      <section style={{ marginBottom: 48 }}>
        <Title level={4}>4. Table Variant</Title>
        <Text type="secondary">Table layouts with headers and rows</Text>
        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
          <div>
            <Text strong>4 columns, 3 rows:</Text>
            <SkeletonLoader variant="table" columns={4} rows={3} />
          </div>
          <div>
            <Text strong>6 columns, 5 rows:</Text>
            <SkeletonLoader variant="table" columns={6} rows={5} />
          </div>
        </Space>
      </section>

      {/* Profile Variant */}
      <section style={{ marginBottom: 48 }}>
        <Title level={4}>5. Profile Variant</Title>
        <Text type="secondary">User profile layouts with avatar and info</Text>
        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
          <div>
            <Text strong>Small:</Text>
            <SkeletonLoader variant="profile" size="small" />
          </div>
          <div>
            <Text strong>Default:</Text>
            <SkeletonLoader variant="profile" />
          </div>
          <div>
            <Text strong>Large:</Text>
            <SkeletonLoader variant="profile" size="large" />
          </div>
        </Space>
      </section>

      {/* Multiple Items */}
      <section style={{ marginBottom: 48 }}>
        <Title level={4}>6. Multiple Items (Count)</Title>
        <Text type="secondary">Render multiple skeleton items at once</Text>
        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
          <div>
            <Text strong>3 profiles:</Text>
            <SkeletonLoader variant="profile" count={3} />
          </div>
          <div>
            <Text strong>5 text lines:</Text>
            <SkeletonLoader variant="text" count={5} />
          </div>
        </Space>
      </section>

      {/* Real-world Example: Loading State */}
      <section style={{ marginBottom: 48 }}>
        <Title level={4}>7. Real-world Example: Dashboard Loading</Title>
        <Text type="secondary">Typical dashboard loading state</Text>
        <div style={{ marginTop: 16 }}>
          {/* Header skeleton */}
          <SkeletonLoader variant="text" size="large" style={{ marginBottom: 24 }} />

          {/* Cards skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <SkeletonLoader variant="card" count={3} />
          </div>

          {/* Table skeleton */}
          <SkeletonLoader variant="table" columns={5} rows={8} />
        </div>
      </section>

      {/* Real-world Example: Profile Page */}
      <section style={{ marginBottom: 48 }}>
        <Title level={4}>8. Real-world Example: Profile Page Loading</Title>
        <Text type="secondary">User profile page loading state</Text>
        <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
          {/* Sidebar */}
          <div style={{ width: 250 }}>
            <SkeletonLoader variant="profile" size="large" style={{ marginBottom: 16 }} />
            <SkeletonLoader variant="paragraph" rows={3} />
          </div>

          {/* Main content */}
          <div style={{ flex: 1 }}>
            <SkeletonLoader variant="text" size="large" style={{ marginBottom: 16 }} />
            <SkeletonLoader variant="paragraph" rows={5} style={{ marginBottom: 24 }} />
            <SkeletonLoader variant="card" />
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * Usage in your components:
 *
 * import { SkeletonLoader } from '@es-rottay/designsystem-core';
 *
 * function MyComponent() {
 *   const { data, loading } = useData();
 *
 *   if (loading) {
 *     return <SkeletonLoader variant="card" count={3} />;
 *   }
 *
 *   return <div>{data.map(item => <Card {...item} />)}</div>;
 * }
 */
