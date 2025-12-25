import type { Meta, StoryObj } from '@storybook/react';
import { SecureWatermark } from './SecureWatermark';
import { Card, Typography, Space, Image } from 'antd';

const { Title, Paragraph } = Typography;

const meta: Meta<typeof SecureWatermark> = {
  title: 'Overlay/Watermark/SecureWatermark',
  component: SecureWatermark,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Marca de agua segura con información de usuario y sesión para rastreo de contenido.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/watermark)
- [🎨 API de Props](https://ant.design/components/watermark#api)
- [💡 Ejemplos](https://ant.design/components/watermark#examples)

## Cuándo usar

- Para proteger documentos confidenciales con trazabilidad
- Cuando necesitas identificar quién accedió al contenido
- Para prevenir distribución no autorizada de información sensible
        `,
      },
    },
  },
  argTypes: {
    timestamp: { control: 'boolean' },
    multiLine: { control: 'boolean' },
    showMetadata: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SecureWatermark>;

const SampleContent = () => (
  <Card>
    <Title level={3}>Confidential Document</Title>
    <Paragraph>
      This is a confidential document that contains sensitive information. The
      watermark helps track and identify unauthorized distribution.
    </Paragraph>
    <Paragraph>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </Paragraph>
    <Paragraph>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
      dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </Paragraph>
  </Card>
);

export const Basic: Story = {
  render: () => (
    <SecureWatermark username="john.doe" userId="12345">
      <SampleContent />
    </SecureWatermark>
  ),
};

export const WithTimestamp: Story = {
  render: () => (
    <SecureWatermark
      username="jane.smith"
      userId="67890"
      timestamp={true}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const WithIPAddress: Story = {
  render: () => (
    <SecureWatermark
      username="admin"
      userId="admin001"
      ipAddress="192.168.1.100"
      timestamp={true}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const WithSessionTracking: Story = {
  render: () => (
    <SecureWatermark
      username="developer"
      userId="dev123"
      sessionId="sess-abc123def456ghi789"
      timestamp={true}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const FullSecurityInfo: Story = {
  render: () => (
    <SecureWatermark
      username="john.doe"
      userId="emp-12345"
      ipAddress="192.168.1.100"
      sessionId="sess-xyz789abc123"
      timestamp={true}
      multiLine={true}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const CustomFields: Story = {
  render: () => (
    <SecureWatermark
      username="manager"
      userId="mgr-001"
      customFields={{
        Department: 'Finance',
        Classification: 'Confidential',
        Document: 'FIN-2024-001',
      }}
      timestamp={true}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const SingleLineFormat: Story = {
  render: () => (
    <SecureWatermark
      username="john.doe"
      userId="12345"
      ipAddress="192.168.1.100"
      timestamp={true}
      multiLine={false}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <SecureWatermark
      username="secure.user"
      userId="SEC-999"
      timestamp={true}
      font={{
        color: 'rgba(255, 0, 0, 0.15)',
        fontSize: 16,
        fontWeight: 700,
      }}
      gap={[150, 150]}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const DenseWatermark: Story = {
  render: () => (
    <SecureWatermark
      username="protected.user"
      userId="PROT-456"
      timestamp={true}
      gap={[50, 50]}
      font={{
        color: 'rgba(0, 0, 0, 0.1)',
        fontSize: 12,
      }}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const RotatedWatermark: Story = {
  render: () => (
    <SecureWatermark
      username="audit.user"
      userId="AUD-789"
      timestamp={true}
      rotate={-22}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const WithImage: Story = {
  render: () => (
    <SecureWatermark
      username="viewer"
      userId="VW-001"
      timestamp={true}
      font={{
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
      }}
    >
      <div style={{ padding: 20 }}>
        <Image
          width={600}
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          alt="Sample"
        />
      </div>
    </SecureWatermark>
  ),
};

export const DocumentProtection: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <SecureWatermark
        username="legal.team"
        userId="LEG-001"
        customFields={{
          'Doc Type': 'Legal Contract',
          'Confidentiality': 'High',
        }}
        timestamp={true}
        font={{
          color: 'rgba(139, 0, 0, 0.12)',
          fontSize: 15,
        }}
      >
        <Card title="Legal Document - Confidential">
          <Paragraph strong>Contract Agreement</Paragraph>
          <Paragraph>
            This agreement is entered into on this day between Party A and Party B
            for the purpose of establishing terms and conditions...
          </Paragraph>
          <Paragraph>
            All information contained in this document is confidential and
            proprietary. Any unauthorized use or distribution is strictly
            prohibited.
          </Paragraph>
        </Card>
      </SecureWatermark>
    </Space>
  ),
};

export const MedicalRecords: Story = {
  render: () => (
    <SecureWatermark
      username="dr.smith"
      userId="DOC-456"
      customFields={{
        'Patient ID': 'PAT-789',
        'Record Type': 'Medical History',
        'HIPAA Protected': 'Yes',
      }}
      timestamp={true}
      multiLine={true}
      font={{
        color: 'rgba(0, 0, 139, 0.1)',
        fontSize: 13,
      }}
    >
      <Card title="Patient Medical Record">
        <Paragraph strong>Patient Information</Paragraph>
        <Paragraph>
          This medical record contains protected health information (PHI) and is
          subject to HIPAA regulations.
        </Paragraph>
        <Paragraph>
          Unauthorized access or disclosure of this information may result in
          civil and criminal penalties.
        </Paragraph>
      </Card>
    </SecureWatermark>
  ),
};

export const FinancialData: Story = {
  render: () => (
    <SecureWatermark
      username="finance.analyst"
      userId="FIN-123"
      customFields={{
        'Report': 'Q4-2024',
        'Classification': 'Internal Use Only',
        'Department': 'Finance',
      }}
      timestamp={true}
      font={{
        color: 'rgba(0, 100, 0, 0.12)',
        fontSize: 14,
      }}
    >
      <Card title="Financial Report - Q4 2024">
        <Title level={4}>Revenue Summary</Title>
        <Paragraph>
          This report contains confidential financial information including
          revenue projections, cost analysis, and strategic planning data.
        </Paragraph>
        <Paragraph>
          Distribution of this report is restricted to authorized personnel only.
          Please handle with appropriate care and security measures.
        </Paragraph>
      </Card>
    </SecureWatermark>
  ),
};

export const MinimalWatermark: Story = {
  render: () => (
    <SecureWatermark
      username="user"
      showMetadata={false}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};

export const CustomContent: Story = {
  render: () => (
    <SecureWatermark
      content="CONFIDENTIAL - DO NOT DISTRIBUTE"
      font={{
        color: 'rgba(255, 0, 0, 0.2)',
        fontSize: 18,
        fontWeight: 700,
      }}
      rotate={-15}
    >
      <SampleContent />
    </SecureWatermark>
  ),
};
