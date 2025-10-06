import type { Meta, StoryObj } from '@storybook/react';
import { LoadingContainer } from './LoadingContainer';
import { PageLoader } from './PageLoader';
import { SpinContainer } from './SpinContainer';
import { Button, Card, Space, Alert, Typography } from 'antd';
import { useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

const { Paragraph, Title } = Typography;

const meta: Meta = {
  title: 'Feedback/Spin/Variants',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Variantes del indicador de carga Spin para diferentes contextos y estilos.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/spin)
- [🎨 API de Props](https://ant.design/components/spin#api)
- [💡 Ejemplos](https://ant.design/components/spin#examples)

## Cuándo usar

- Para indicar procesos de carga en diferentes tamaños y contextos
- Cuando necesitas feedback visual durante operaciones asíncronas
- Para overlay de carga sobre contenido existente
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// LoadingContainer Stories
export const BasicLoadingContainer: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={() => setLoading(!loading)}>
          {loading ? 'Show Content' : 'Show Loading'}
        </Button>
        <LoadingContainer loading={loading}>
          <Card>
            <Title level={4}>Content Loaded</Title>
            <Paragraph>
              This content is displayed when loading is complete.
            </Paragraph>
          </Card>
        </LoadingContainer>
      </Space>
    );
  },
};

export const LoadingContainerWithTip: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={() => setLoading(!loading)}>Toggle Loading</Button>
        <LoadingContainer
          loading={loading}
          tip="Loading data..."
          minHeight={300}
        >
          <Alert
            message="Data Loaded"
            description="Your data has been successfully loaded."
            type="success"
            showIcon
          />
        </LoadingContainer>
      </Space>
    );
  },
};

export const FullHeightLoadingContainer: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={() => setLoading(!loading)}>Toggle Loading</Button>
        <LoadingContainer loading={loading} fullHeight>
          <div style={{ padding: 20 }}>
            <Title level={2}>Full Page Content</Title>
            <Paragraph>This container takes full viewport height.</Paragraph>
          </div>
        </LoadingContainer>
      </Space>
    );
  },
};

export const LoadingContainerSizes: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <LoadingContainer loading={true} size="small" minHeight={150} />
      <LoadingContainer loading={true} size="default" minHeight={150} />
      <LoadingContainer loading={true} size="large" minHeight={150} />
    </Space>
  ),
};

// PageLoader Stories
export const BasicPageLoader: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setLoading(true)}>
          Show Page Loader
        </Button>
        {loading && (
          <PageLoader tip="Loading page..." />
        )}
        {loading && setTimeout(() => setLoading(false), 3000)}
      </>
    );
  },
};

export const PageLoaderVariants: Story = {
  render: () => {
    const [variant, setVariant] = useState<string | null>(null);

    return (
      <>
        <Space>
          <Button onClick={() => setVariant('default')}>Default</Button>
          <Button onClick={() => setVariant('transparent')}>Transparent</Button>
          <Button onClick={() => setVariant('dark')}>Dark</Button>
        </Space>

        {variant === 'default' && <PageLoader tip="Loading..." />}
        {variant === 'transparent' && (
          <PageLoader tip="Loading..." backgroundColor="rgba(255, 255, 255, 0.5)" />
        )}
        {variant === 'dark' && (
          <PageLoader
            tip="Loading..."
            backgroundColor="rgba(0, 0, 0, 0.7)"
            style={{ color: 'white' }}
          />
        )}
        {variant && setTimeout(() => setVariant(null), 2000)}
      </>
    );
  },
};

export const CustomIconPageLoader: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setLoading(true)}>
          Show Custom Loader
        </Button>
        {loading && (
          <PageLoader
            tip="Processing..."
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          />
        )}
        {loading && setTimeout(() => setLoading(false), 3000)}
      </>
    );
  },
};

// SpinContainer Stories
export const BasicSpinContainer: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);

    const handleLoad = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={handleLoad}>Load Data</Button>
        <SpinContainer loading={loading}>
          <Card title="Content Card" style={{ width: 400 }}>
            <Paragraph>
              This content will be overlaid with a spinner when loading.
            </Paragraph>
            <Paragraph>
              The blur effect helps indicate that the content is being updated.
            </Paragraph>
          </Card>
        </SpinContainer>
      </Space>
    );
  },
};

export const SpinContainerWithDelay: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);

    const handleLoad = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Delay Demo"
          description="The spinner will appear after 500ms delay"
          type="info"
          showIcon
        />
        <Button onClick={handleLoad}>Load with Delay</Button>
        <SpinContainer loading={loading} delay={500} tip="Loading...">
          <Card title="Delayed Spinner" style={{ width: 400 }}>
            <Paragraph>
              The spinner appears after a 500ms delay to avoid flickering for
              quick operations.
            </Paragraph>
          </Card>
        </SpinContainer>
      </Space>
    );
  },
};

export const SpinContainerNoBlur: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);

    const handleLoad = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={handleLoad}>Load Data</Button>
        <SpinContainer loading={loading} blur={false}>
          <Card title="No Blur Effect" style={{ width: 400 }}>
            <Paragraph>
              This container doesn't apply blur effect to the content when loading.
            </Paragraph>
          </Card>
        </SpinContainer>
      </Space>
    );
  },
};

export const MultipleSpinContainers: Story = {
  render: () => {
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(false);

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
          <Button onClick={() => {
            setLoading1(true);
            setTimeout(() => setLoading1(false), 2000);
          }}>
            Load Card 1
          </Button>
          <Button onClick={() => {
            setLoading2(true);
            setTimeout(() => setLoading2(false), 2000);
          }}>
            Load Card 2
          </Button>
          <Button onClick={() => {
            setLoading3(true);
            setTimeout(() => setLoading3(false), 2000);
          }}>
            Load Card 3
          </Button>
        </Space>

        <Space size="large">
          <SpinContainer loading={loading1} size="small">
            <Card title="Card 1" style={{ width: 250 }}>
              <Paragraph>Content for card 1</Paragraph>
            </Card>
          </SpinContainer>

          <SpinContainer loading={loading2} size="default" tip="Loading...">
            <Card title="Card 2" style={{ width: 250 }}>
              <Paragraph>Content for card 2</Paragraph>
            </Card>
          </SpinContainer>

          <SpinContainer loading={loading3} size="large">
            <Card title="Card 3" style={{ width: 250 }}>
              <Paragraph>Content for card 3</Paragraph>
            </Card>
          </SpinContainer>
        </Space>
      </Space>
    );
  },
};

export const ComparisonDemo: Story = {
  render: () => {
    const [scenario, setScenario] = useState<'container' | 'page' | 'loading' | null>(null);

    return (
      <>
        <Space size="large">
          <Button type="primary" onClick={() => setScenario('container')}>
            Spin Container
          </Button>
          <Button type="primary" onClick={() => setScenario('page')}>
            Page Loader
          </Button>
          <Button type="primary" onClick={() => setScenario('loading')}>
            Loading Container
          </Button>
        </Space>

        {scenario === 'container' && (
          <div style={{ marginTop: 20 }}>
            <SpinContainer loading={true} tip="Using SpinContainer...">
              <Card title="Spin Container" style={{ width: 500 }}>
                <Paragraph>
                  Best for inline loading states where content is updated.
                </Paragraph>
              </Card>
            </SpinContainer>
          </div>
        )}

        {scenario === 'page' && <PageLoader tip="Using PageLoader..." />}

        {scenario === 'loading' && (
          <div style={{ marginTop: 20 }}>
            <LoadingContainer loading={true} tip="Using LoadingContainer..." minHeight={300}>
              <Card title="Loading Container">
                <Paragraph>This won't show until loading is false</Paragraph>
              </Card>
            </LoadingContainer>
          </div>
        )}

        {scenario && setTimeout(() => setScenario(null), 3000)}
      </>
    );
  },
};
