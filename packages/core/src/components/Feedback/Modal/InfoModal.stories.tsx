import type { Meta, StoryObj } from '@storybook/react';
import { InfoModal } from './InfoModal';
import { Button, Typography, Space, Divider } from 'antd';
import { useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const meta: Meta<typeof InfoModal> = {
  title: 'Feedback/Modal/InfoModal',
  component: InfoModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Modal informativo para mostrar mensajes, alertas o información al usuario.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/modal)
- [🎨 API de Props](https://ant.design/components/modal#api)
- [💡 Ejemplos](https://ant.design/components/modal#examples)

## Cuándo usar

- Para mostrar información importante que requiere atención
- Cuando necesitas comunicar mensajes de éxito, advertencia o error
- Para notificaciones que requieren confirmación de lectura
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'large', 'centered'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof InfoModal>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Show Info
        </Button>
        <InfoModal
          title={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <span>Information</span>
            </Space>
          }
          open={open}
          onCancel={() => setOpen(false)}
        >
          <Paragraph>
            This is an informational modal that displays important information to
            the user without requiring any action.
          </Paragraph>
          <Paragraph>
            Info modals are perfect for displaying help text, additional details,
            or explanatory content.
          </Paragraph>
        </InfoModal>
      </>
    );
  },
};

export const LargeVariant: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Show Large Info
        </Button>
        <InfoModal
          title="Detailed Information"
          variant="large"
          open={open}
          onCancel={() => setOpen(false)}
        >
          <Title level={4}>What is Lorem Ipsum?</Title>
          <Paragraph>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text ever
            since the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </Paragraph>

          <Divider />

          <Title level={4}>Why do we use it?</Title>
          <Paragraph>
            It is a long established fact that a reader will be distracted by the
            readable content of a page when looking at its layout. The point of
            using Lorem Ipsum is that it has a more-or-less normal distribution of
            letters, as opposed to using 'Content here, content here', making it
            look like readable English.
          </Paragraph>

          <Divider />

          <Title level={4}>Where does it come from?</Title>
          <Paragraph>
            Contrary to popular belief, Lorem Ipsum is not simply random text. It
            has roots in a piece of classical Latin literature from 45 BC, making
            it over 2000 years old.
          </Paragraph>
        </InfoModal>
      </>
    );
  },
};

export const CenteredVariant: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Show Centered Info
        </Button>
        <InfoModal
          title="Centered Information"
          variant="centered"
          open={open}
          onCancel={() => setOpen(false)}
        >
          <Paragraph>
            This modal is vertically centered on the screen, making it more
            visually prominent.
          </Paragraph>
        </InfoModal>
      </>
    );
  },
};

export const WithRichContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Show Rich Content
        </Button>
        <InfoModal
          title="Feature Highlights"
          open={open}
          onCancel={() => setOpen(false)}
          width={600}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={5}>🚀 Fast Performance</Title>
              <Text>
                Our application delivers lightning-fast performance with optimized
                code and efficient algorithms.
              </Text>
            </div>

            <div>
              <Title level={5}>🔒 Secure</Title>
              <Text>
                Built with security in mind, featuring end-to-end encryption and
                secure authentication.
              </Text>
            </div>

            <div>
              <Title level={5}>📱 Responsive Design</Title>
              <Text>
                Works seamlessly across all devices - desktop, tablet, and mobile.
              </Text>
            </div>

            <div>
              <Title level={5}>🎨 Customizable</Title>
              <Text>
                Highly customizable with themes, layouts, and configurations to
                match your needs.
              </Text>
            </div>
          </Space>
        </InfoModal>
      </>
    );
  },
};

export const MultipleInfoModals: Story = {
  render: () => {
    const [modal1Open, setModal1Open] = useState(false);
    const [modal2Open, setModal2Open] = useState(false);
    const [modal3Open, setModal3Open] = useState(false);

    return (
      <>
        <Space>
          <Button onClick={() => setModal1Open(true)}>Info 1</Button>
          <Button onClick={() => setModal2Open(true)}>Info 2</Button>
          <Button onClick={() => setModal3Open(true)}>Info 3</Button>
        </Space>

        <InfoModal
          title="First Information"
          open={modal1Open}
          onCancel={() => setModal1Open(false)}
        >
          <Paragraph>This is the first information modal.</Paragraph>
        </InfoModal>

        <InfoModal
          title="Second Information"
          variant="centered"
          open={modal2Open}
          onCancel={() => setModal2Open(false)}
        >
          <Paragraph>This is the second information modal (centered).</Paragraph>
        </InfoModal>

        <InfoModal
          title="Third Information"
          variant="large"
          open={modal3Open}
          onCancel={() => setModal3Open(false)}
        >
          <Paragraph>This is the third information modal (large).</Paragraph>
        </InfoModal>
      </>
    );
  },
};

export const WithCustomFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Show Info with Footer
        </Button>
        <InfoModal
          title="Information"
          open={open}
          onCancel={() => setOpen(false)}
          footer={
            <Button type="primary" onClick={() => setOpen(false)}>
              Got it!
            </Button>
          }
        >
          <Paragraph>
            This info modal has a custom footer with a single action button.
          </Paragraph>
        </InfoModal>
      </>
    );
  },
};
