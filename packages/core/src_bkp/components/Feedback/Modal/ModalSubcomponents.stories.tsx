import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { Button, Tag, Badge } from 'antd';
import { useState } from 'react';
import {
  UserOutlined,
  SettingOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const meta: Meta = {
  title: 'Feedback/Modal/Subcomponents',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Subcomponentes del Modal para construir interfaces modales personalizadas.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/modal)
- [🎨 API de Props](https://ant.design/components/modal#api)
- [💡 Ejemplos](https://ant.design/components/modal#examples)

## Cuándo usar

- Para crear layouts modales complejos con secciones específicas
- Cuando necesitas control granular sobre la estructura del modal
- Para componentes modales reutilizables con estructura consistente
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const BasicSubcomponents: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Modal with Subcomponents
        </Button>
        <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
          <ModalHeader title="User Profile" icon={<UserOutlined />} />
          <ModalBody>
            <p>This modal uses the ModalHeader, ModalBody, and ModalFooter subcomponents.</p>
            <p>You can customize each section independently.</p>
          </ModalBody>
          <ModalFooter
            onOk={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      </>
    );
  },
};

export const HeaderWithSubtitle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Header with Subtitle
        </Button>
        <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
          <ModalHeader
            title="Account Settings"
            subtitle="Manage your account preferences and settings"
            icon={<SettingOutlined />}
          />
          <ModalBody>
            <p>Configure your account settings here.</p>
          </ModalBody>
          <ModalFooter
            onOk={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      </>
    );
  },
};

export const HeaderWithExtra: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Header with Extra Content
        </Button>
        <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
          <ModalHeader
            title="Notifications"
            icon={<InfoCircleOutlined />}
            extra={<Badge count={5} />}
          />
          <ModalBody>
            <p>You have 5 new notifications.</p>
          </ModalBody>
          <ModalFooter
            onOk={() => setOpen(false)}
            okText="Mark as Read"
            cancelText="Close"
          />
        </Modal>
      </>
    );
  },
};

export const CustomBodyPadding: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Custom Body Padding
        </Button>
        <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
          <ModalHeader title="No Padding Content" />
          <ModalBody padding={0}>
            <div style={{ background: '#f0f0f0', padding: '40px' }}>
              <p>This body has no padding, allowing for full-width content.</p>
            </div>
          </ModalBody>
          <ModalFooter onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
        </Modal>
      </>
    );
  },
};

export const FooterAlignment: Story = {
  render: () => {
    const [leftOpen, setLeftOpen] = useState(false);
    const [centerOpen, setCenterOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);

    return (
      <>
        <Button.Group>
          <Button onClick={() => setLeftOpen(true)}>Left Aligned</Button>
          <Button onClick={() => setCenterOpen(true)}>Center Aligned</Button>
          <Button onClick={() => setRightOpen(true)}>Right Aligned</Button>
        </Button.Group>

        <Modal open={leftOpen} onCancel={() => setLeftOpen(false)} footer={null}>
          <ModalHeader title="Left Aligned Footer" />
          <ModalBody>
            <p>This modal has a left-aligned footer.</p>
          </ModalBody>
          <ModalFooter
            align="left"
            onOk={() => setLeftOpen(false)}
            onCancel={() => setLeftOpen(false)}
          />
        </Modal>

        <Modal open={centerOpen} onCancel={() => setCenterOpen(false)} footer={null}>
          <ModalHeader title="Center Aligned Footer" />
          <ModalBody>
            <p>This modal has a center-aligned footer.</p>
          </ModalBody>
          <ModalFooter
            align="center"
            onOk={() => setCenterOpen(false)}
            onCancel={() => setCenterOpen(false)}
          />
        </Modal>

        <Modal open={rightOpen} onCancel={() => setRightOpen(false)} footer={null}>
          <ModalHeader title="Right Aligned Footer" />
          <ModalBody>
            <p>This modal has a right-aligned footer (default).</p>
          </ModalBody>
          <ModalFooter
            align="right"
            onOk={() => setRightOpen(false)}
            onCancel={() => setRightOpen(false)}
          />
        </Modal>
      </>
    );
  },
};

export const CustomFooterContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Custom Footer
        </Button>
        <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
          <ModalHeader title="Custom Footer Content" />
          <ModalBody>
            <p>This modal has completely custom footer content.</p>
          </ModalBody>
          <ModalFooter align="left">
            <Button.Group>
              <Button>Action 1</Button>
              <Button>Action 2</Button>
              <Button type="primary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </Button.Group>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

export const CompleteExample: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Complete Example
        </Button>
        <Modal open={open} onCancel={() => setOpen(false)} footer={null} width={600}>
          <ModalHeader
            title="Project Details"
            subtitle="Review and manage project information"
            icon={<SettingOutlined />}
            extra={<Tag color="success">Active</Tag>}
          />
          <ModalBody>
            <h4>Project Name: Design System</h4>
            <p>Status: In Progress</p>
            <p>Team Members: 5</p>
            <p>Deadline: December 31, 2024</p>
          </ModalBody>
          <ModalFooter
            onOk={() => setOpen(false)}
            onCancel={() => setOpen(false)}
            okText="Save Changes"
            cancelText="Discard"
            okButtonProps={{ type: 'primary' }}
          />
        </Modal>
      </>
    );
  },
};
