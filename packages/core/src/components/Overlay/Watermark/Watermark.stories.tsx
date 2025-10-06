import type { Meta, StoryObj } from '@storybook/react';
import { Watermark } from './Watermark';
import { Card, Typography, Space, Image, Divider } from 'antd';

const { Title, Paragraph, Text } = Typography;

const meta: Meta<typeof Watermark> = {
  title: 'Overlay/Watermark',
  component: Watermark,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Marca de agua que se superpone al contenido para protegerlo o identificarlo.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/watermark)
- [🎨 API de Props](https://ant.design/components/watermark#api)
- [💡 Ejemplos](https://ant.design/components/watermark#examples)

## Cuándo usar

- Para proteger imágenes o documentos de uso no autorizado
- Cuando necesitas marcar contenido con branding o copyright
- Para identificar el estado o clasificación de documentos
        `,
      },
    },
  },
  argTypes: {
    rotate: {
      control: { type: 'number', min: -180, max: 180 },
    },
    zIndex: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Watermark>;

const SampleContent = () => (
  <Card>
    <Title level={3}>Document Title</Title>
    <Paragraph>
      This is a sample document that demonstrates the watermark functionality. The watermark helps
      protect your content and identify the source of the document.
    </Paragraph>
    <Paragraph>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </Paragraph>
    <Paragraph>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
      mollit anim id est laborum.
    </Paragraph>
  </Card>
);

/**
 * Basic text watermark.
 * Use to add simple text overlay to your content.
 */
export const Basic: Story = {
  render: () => (
    <Watermark content="Confidential">
      <SampleContent />
    </Watermark>
  ),
};

/**
 * Watermark with multiple lines of text.
 * Use array format to display multi-line watermarks.
 */
export const MultiLineText: Story = {
  render: () => (
    <Watermark content={['Company Name', 'Confidential Document']}>
      <SampleContent />
    </Watermark>
  ),
};

/**
 * Image-based watermark.
 * Use your logo or custom image as a watermark.
 */
export const ImageWatermark: Story = {
  render: () => (
    <Watermark
      height={64}
      width={120}
      image="https://gw.alipayobjects.com/zos/bmw-prod/59a18171-ae17-4fc5-93a0-2645f64a3aca.svg"
    >
      <SampleContent />
    </Watermark>
  ),
};

/**
 * Custom rotation angle for watermark.
 * Default is -22 degrees, adjust to your preference.
 */
export const CustomRotation: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Text strong>No Rotation (0°)</Text>
        <Watermark content="Watermark" rotate={0}>
          <div style={{ height: 200, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Horizontal watermark</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>45° Rotation</Text>
        <Watermark content="Watermark" rotate={45}>
          <div style={{ height: 200, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Diagonal watermark</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>-45° Rotation</Text>
        <Watermark content="Watermark" rotate={-45}>
          <div style={{ height: 200, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Reverse diagonal watermark</Paragraph>
          </div>
        </Watermark>
      </div>
    </Space>
  ),
};

/**
 * Custom gap and offset for watermark density.
 * Adjust spacing between watermark repetitions.
 */
export const CustomGapAndOffset: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Text strong>Small Gap (Dense)</Text>
        <Watermark content="Watermark" gap={[50, 50]}>
          <div style={{ height: 200, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Dense watermark pattern</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>Large Gap (Sparse)</Text>
        <Watermark content="Watermark" gap={[200, 200]}>
          <div style={{ height: 200, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Sparse watermark pattern</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>Custom Offset</Text>
        <Watermark content="Watermark" offset={[50, 50]}>
          <div style={{ height: 200, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Watermark with custom offset</Paragraph>
          </div>
        </Watermark>
      </div>
    </Space>
  ),
};

/**
 * Custom font styling for text watermarks.
 * Adjust color, size, weight, and family.
 */
export const CustomFontStyling: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Text strong>Light Gray (Default)</Text>
        <Watermark content="Default Style">
          <div style={{ height: 150, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Default watermark styling</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>Red Watermark</Text>
        <Watermark
          content="Important"
          font={{
            color: 'rgba(255, 0, 0, 0.15)',
          }}
        >
          <div style={{ height: 150, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Red colored watermark</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>Large Bold Text</Text>
        <Watermark
          content="CONFIDENTIAL"
          font={{
            fontSize: 24,
            fontWeight: 700,
            color: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ height: 150, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Large bold watermark</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>Custom Font Family</Text>
        <Watermark
          content="Stylish"
          font={{
            fontFamily: 'Georgia, serif',
            fontSize: 20,
            fontStyle: 'italic',
            color: 'rgba(0, 100, 200, 0.15)',
          }}
        >
          <div style={{ height: 150, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Custom font family and style</Paragraph>
          </div>
        </Watermark>
      </div>
    </Space>
  ),
};

/**
 * Different opacity levels.
 * Control watermark visibility to balance protection and readability.
 */
export const OpacityVariations: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Text strong>Very Light (5% opacity)</Text>
        <Watermark
          content="Watermark"
          font={{
            color: 'rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ height: 150, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Very subtle watermark</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>Light (15% opacity - Default)</Text>
        <Watermark content="Watermark">
          <div style={{ height: 150, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Default watermark opacity</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>Medium (30% opacity)</Text>
        <Watermark
          content="Watermark"
          font={{
            color: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ height: 150, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>More visible watermark</Paragraph>
          </div>
        </Watermark>
      </div>
    </Space>
  ),
};

/**
 * Watermark on images.
 * Protect images from unauthorized use.
 */
export const OnImages: Story = {
  render: () => (
    <Space direction="vertical" size="large">
      <Watermark content="Copyright © 2024">
        <Image
          width={400}
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          alt="Sample"
        />
      </Watermark>

      <Watermark
        content={['Photo by', 'John Doe']}
        font={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 14,
        }}
      >
        <Image
          width={400}
          src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp"
          alt="Sample"
        />
      </Watermark>
    </Space>
  ),
};

/**
 * Full page watermark.
 * Apply watermark to entire page or large sections.
 */
export const FullPage: Story = {
  render: () => (
    <Watermark content="Internal Use Only" font={{ color: 'rgba(0, 0, 0, 0.08)' }}>
      <div style={{ minHeight: 600 }}>
        <Title level={2}>Full Page Watermark</Title>
        <Paragraph>
          This watermark covers the entire container. Useful for protecting full documents or pages.
        </Paragraph>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Section 1">
            <Paragraph>
              Content here is protected by the full-page watermark. The watermark repeats across
              the entire area.
            </Paragraph>
          </Card>

          <Card title="Section 2">
            <Paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. The watermark remains
              consistent across all sections.
            </Paragraph>
          </Card>

          <Card title="Section 3">
            <Paragraph>
              Multiple cards and sections all share the same continuous watermark pattern.
            </Paragraph>
          </Card>
        </Space>
      </div>
    </Watermark>
  ),
};

/**
 * Combined text and image watermark.
 * Use both logo and text for comprehensive branding.
 */
export const CombinedTextAndImage: Story = {
  render: () => (
    <Watermark
      content="Company Confidential"
      image="https://gw.alipayobjects.com/zos/bmw-prod/59a18171-ae17-4fc5-93a0-2645f64a3aca.svg"
      gap={[100, 100]}
    >
      <SampleContent />
    </Watermark>
  ),
};

/**
 * Draft document watermark.
 * Clear indication of document status.
 */
export const DraftDocument: Story = {
  render: () => (
    <Watermark
      content="DRAFT"
      font={{
        color: 'rgba(255, 140, 0, 0.2)',
        fontSize: 40,
        fontWeight: 700,
      }}
      rotate={-30}
      gap={[150, 150]}
    >
      <Card>
        <Title level={3}>Project Proposal - DRAFT</Title>
        <Paragraph>
          This is a draft document and should not be considered final. All information is subject
          to change.
        </Paragraph>
        <Paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. This draft watermark clearly
          indicates the document status.
        </Paragraph>
        <Paragraph>
          Use this pattern for documents that are still in progress or pending approval.
        </Paragraph>
      </Card>
    </Watermark>
  ),
};

/**
 * Confidential document watermark.
 * High-visibility watermark for sensitive content.
 */
export const ConfidentialDocument: Story = {
  render: () => (
    <Watermark
      content={['CONFIDENTIAL', 'Do Not Distribute']}
      font={{
        color: 'rgba(220, 20, 60, 0.15)',
        fontSize: 18,
        fontWeight: 700,
      }}
      rotate={-22}
      gap={[100, 100]}
    >
      <Card>
        <Title level={3}>Confidential Report</Title>
        <Paragraph>
          This document contains confidential information and is intended only for authorized
          personnel.
        </Paragraph>
        <Divider />
        <Space direction="vertical">
          <Text strong>Classification: Confidential</Text>
          <Text strong>Date: 2024-01-15</Text>
          <Text strong>Authorized Personnel Only</Text>
        </Space>
        <Divider />
        <Paragraph>
          Unauthorized disclosure of this information may result in serious consequences. Please
          handle with appropriate care and security measures.
        </Paragraph>
      </Card>
    </Watermark>
  ),
};

/**
 * Sample/Demo watermark.
 * Indicate content is for demonstration purposes.
 */
export const SampleWatermark: Story = {
  render: () => (
    <Watermark
      content="SAMPLE"
      font={{
        color: 'rgba(0, 100, 255, 0.12)',
        fontSize: 30,
        fontWeight: 700,
      }}
      rotate={-15}
    >
      <Card>
        <Title level={3}>Product Showcase</Title>
        <Paragraph>
          This is a sample/demo content used for presentation or testing purposes only.
        </Paragraph>
        <Image
          width="100%"
          src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          alt="Sample"
        />
      </Card>
    </Watermark>
  ),
};

/**
 * Custom z-index for layering.
 * Control watermark position in the stacking context.
 */
export const CustomZIndex: Story = {
  render: () => (
    <div style={{ position: 'relative' }}>
      <Watermark content="Background Watermark" zIndex={1}>
        <div style={{ height: 300, background: '#f5f5f5', padding: 16 }}>
          <Card style={{ position: 'relative', zIndex: 10 }}>
            <Title level={4}>Content with Higher Z-Index</Title>
            <Paragraph>
              This card has a higher z-index than the watermark, so it appears above the watermark.
            </Paragraph>
          </Card>
        </div>
      </Watermark>
    </div>
  ),
};

/**
 * Watermark with custom height and width.
 * Control the size of each watermark instance.
 */
export const CustomDimensions: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Text strong>Small Watermark Area</Text>
        <Watermark content="Small" width={80} height={40}>
          <div style={{ height: 200, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Compact watermark instances</Paragraph>
          </div>
        </Watermark>
      </div>

      <div>
        <Text strong>Large Watermark Area</Text>
        <Watermark content="Large" width={200} height={100}>
          <div style={{ height: 200, background: '#f5f5f5', padding: 16 }}>
            <Paragraph>Larger watermark instances with more spacing</Paragraph>
          </div>
        </Watermark>
      </div>
    </Space>
  ),
};

/**
 * Real-world use case: Legal document.
 * Complete example for legal/official documents.
 */
export const LegalDocument: Story = {
  render: () => (
    <Watermark
      content={['Legal Document', 'Attorney-Client Privilege']}
      font={{
        color: 'rgba(105, 105, 105, 0.12)',
        fontSize: 16,
        fontWeight: 500,
      }}
      gap={[120, 120]}
    >
      <Card>
        <Title level={3}>Legal Agreement</Title>
        <Text type="secondary">Document ID: LEG-2024-001</Text>
        <Divider />
        <Paragraph strong>PRIVILEGED AND CONFIDENTIAL</Paragraph>
        <Paragraph>
          This document contains privileged attorney-client communications and work product. It is
          intended solely for the use of the individual or entity to whom it is addressed.
        </Paragraph>
        <Paragraph>
          If you are not the intended recipient, you are hereby notified that any disclosure,
          copying, distribution or taking any action in reliance on the contents of this
          information is strictly prohibited.
        </Paragraph>
        <Divider />
        <Paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
        </Paragraph>
      </Card>
    </Watermark>
  ),
};
