import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';
import { Space, Typography as AntTypography } from 'antd';

const { Title, Paragraph, Text } = AntTypography;

const meta: Meta<typeof Typography> = {
  title: 'Display/Typography',
  component: Typography,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de tipografía para mostrar y formatear texto.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/typography)
- [🎨 API de Props](https://ant.design/components/typography#api)
- [💡 Ejemplos](https://ant.design/components/typography#examples)

## Cuándo usar

- Para mostrar títulos, párrafos y texto con estilos consistentes.
- Incluye funcionalidades de edición, copia y truncado de texto.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Basic: Story = {
  render: () => (
    <Typography>
      <Title>Introduction</Title>
      <Paragraph>
        In the process of internal desktop applications development, many different design specs and
        implementations would be involved, which might cause designers and developers difficulties and
        duplication and reduce the efficiency of development.
      </Paragraph>
      <Paragraph>
        After massive project practice and summaries, Ant Design, a design language for background
        applications, is refined by Ant UED Team, which aims to{' '}
        <Text strong>
          uniform the user interface specs for internal background projects, lower the unnecessary
          cost of design differences and implementation and liberate the resources of design and
          front-end development
        </Text>
        .
      </Paragraph>
      <Title level={2}>Guidelines and Resources</Title>
      <Paragraph>
        We supply a series of design principles, practical patterns and high quality design resources
        (<Text code>Sketch</Text> and <Text code>Axure</Text>), to help people create their product
        prototypes beautifully and efficiently.
      </Paragraph>
    </Typography>
  ),
};

export const Titles: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title>h1. Ant Design</Title>
      <Title level={2}>h2. Ant Design</Title>
      <Title level={3}>h3. Ant Design</Title>
      <Title level={4}>h4. Ant Design</Title>
      <Title level={5}>h5. Ant Design</Title>
    </Space>
  ),
};

export const TextVariants: Story = {
  render: () => (
    <Space direction="vertical">
      <Text>Ant Design (default)</Text>
      <Text type="secondary">Ant Design (secondary)</Text>
      <Text type="success">Ant Design (success)</Text>
      <Text type="warning">Ant Design (warning)</Text>
      <Text type="danger">Ant Design (danger)</Text>
      <Text disabled>Ant Design (disabled)</Text>
      <Text mark>Ant Design (mark)</Text>
      <Text code>Ant Design (code)</Text>
      <Text keyboard>Ant Design (keyboard)</Text>
      <Text underline>Ant Design (underline)</Text>
      <Text delete>Ant Design (delete)</Text>
      <Text strong>Ant Design (strong)</Text>
      <Text italic>Ant Design (italic)</Text>
    </Space>
  ),
};

export const Editable: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Paragraph editable>This is an editable text.</Paragraph>
      <Paragraph editable={{ tooltip: 'click to edit text' }}>
        This is an editable text with tooltip.
      </Paragraph>
    </Space>
  ),
};

export const Copyable: Story = {
  render: () => (
    <Space direction="vertical">
      <Paragraph copyable>This is a copyable text.</Paragraph>
      <Paragraph copyable={{ text: 'Hello, Ant Design!' }}>Replace copy text.</Paragraph>
    </Space>
  ),
};

export const Ellipsis: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Paragraph ellipsis>
        Ant Design, a design language for background applications, is refined by Ant UED Team. Ant
        Design, a design language for background applications, is refined by Ant UED Team. Ant Design,
        a design language for background applications, is refined by Ant UED Team.
      </Paragraph>
      <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
        Ant Design, a design language for background applications, is refined by Ant UED Team. Ant
        Design, a design language for background applications, is refined by Ant UED Team. Ant Design,
        a design language for background applications, is refined by Ant UED Team. Ant Design, a design
        language for background applications, is refined by Ant UED Team.
      </Paragraph>
    </Space>
  ),
};
