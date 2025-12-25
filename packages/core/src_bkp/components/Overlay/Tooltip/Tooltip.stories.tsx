import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tooltip } from './Tooltip';
import { Button, Space, Typography, Input } from 'antd';
import {
  QuestionCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

const meta: Meta<typeof Tooltip> = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Texto de ayuda simple que aparece al pasar el cursor sobre un elemento.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/tooltip)
- [🎨 API de Props](https://ant.design/components/tooltip#api)
- [💡 Ejemplos](https://ant.design/components/tooltip#examples)

## Cuándo usar

- Para proporcionar descripciones breves de elementos de la interfaz
- Cuando necesitas aclarar la función de iconos o botones
- Para mostrar información adicional sin saturar la interfaz
        `,
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'left',
        'right',
        'bottom',
        'topLeft',
        'topRight',
        'bottomLeft',
        'bottomRight',
        'leftTop',
        'leftBottom',
        'rightTop',
        'rightBottom',
      ],
    },
    trigger: {
      control: 'select',
      options: ['hover', 'focus', 'click', 'contextMenu'],
    },
    color: {
      control: 'color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/**
 * Basic tooltip that appears on hover.
 * Use for providing additional context or help text.
 */
export const Basic: Story = {
  render: () => (
    <Tooltip title="Prompt text">
      <Button>Hover me</Button>
    </Tooltip>
  ),
};

/**
 * All 12 placement options for tooltips.
 * Choose the placement that best fits your layout and prevents overflow.
 */
export const Placements: Story = {
  render: () => {
    const buttonWidth = 100;

    return (
      <div style={{ padding: '50px' }}>
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <Space size="small">
            <Tooltip title="Top Left" placement="topLeft">
              <Button style={{ width: buttonWidth }}>TL</Button>
            </Tooltip>
            <Tooltip title="Top Center" placement="top">
              <Button style={{ width: buttonWidth }}>Top</Button>
            </Tooltip>
            <Tooltip title="Top Right" placement="topRight">
              <Button style={{ width: buttonWidth }}>TR</Button>
            </Tooltip>
          </Space>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space direction="vertical" size="small">
            <Tooltip title="Left Top" placement="leftTop">
              <Button style={{ width: buttonWidth }}>LT</Button>
            </Tooltip>
            <Tooltip title="Left" placement="left">
              <Button style={{ width: buttonWidth }}>Left</Button>
            </Tooltip>
            <Tooltip title="Left Bottom" placement="leftBottom">
              <Button style={{ width: buttonWidth }}>LB</Button>
            </Tooltip>
          </Space>

          <Space direction="vertical" size="small">
            <Tooltip title="Right Top" placement="rightTop">
              <Button style={{ width: buttonWidth }}>RT</Button>
            </Tooltip>
            <Tooltip title="Right" placement="right">
              <Button style={{ width: buttonWidth }}>Right</Button>
            </Tooltip>
            <Tooltip title="Right Bottom" placement="rightBottom">
              <Button style={{ width: buttonWidth }}>RB</Button>
            </Tooltip>
          </Space>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Space size="small">
            <Tooltip title="Bottom Left" placement="bottomLeft">
              <Button style={{ width: buttonWidth }}>BL</Button>
            </Tooltip>
            <Tooltip title="Bottom Center" placement="bottom">
              <Button style={{ width: buttonWidth }}>Bottom</Button>
            </Tooltip>
            <Tooltip title="Bottom Right" placement="bottomRight">
              <Button style={{ width: buttonWidth }}>BR</Button>
            </Tooltip>
          </Space>
        </div>
      </div>
    );
  },
};

/**
 * Tooltips with different colored backgrounds.
 * Use colors to indicate status or category.
 */
export const Colors: Story = {
  render: () => {
    const colors = [
      { name: 'Default', color: undefined },
      { name: 'Blue', color: '#1890ff' },
      { name: 'Green', color: '#52c41a' },
      { name: 'Red', color: '#f5222d' },
      { name: 'Orange', color: '#fa8c16' },
      { name: 'Purple', color: '#722ed1' },
    ];

    return (
      <Space wrap size="large">
        {colors.map((item) => (
          <Tooltip key={item.name} title={item.name} color={item.color}>
            <Button>{item.name}</Button>
          </Tooltip>
        ))}
      </Space>
    );
  },
};

/**
 * Different trigger methods for showing tooltips.
 * Choose based on the user interaction pattern you need.
 */
export const Triggers: Story = {
  render: () => (
    <Space wrap size="large">
      <Tooltip title="Hover to see tooltip" trigger="hover">
        <Button>Hover</Button>
      </Tooltip>
      <Tooltip title="Focus to see tooltip" trigger="focus">
        <Button>Focus</Button>
      </Tooltip>
      <Tooltip title="Click to toggle tooltip" trigger="click">
        <Button>Click</Button>
      </Tooltip>
    </Space>
  ),
};

/**
 * Control tooltip arrow visibility.
 * Hiding the arrow can create a cleaner look for certain designs.
 */
export const ArrowVariations: Story = {
  render: () => (
    <Space wrap size="large">
      <Tooltip title="Tooltip with arrow" arrow>
        <Button>With Arrow</Button>
      </Tooltip>
      <Tooltip title="Tooltip without arrow" arrow={false}>
        <Button>Without Arrow</Button>
      </Tooltip>
      <Tooltip title="Custom arrow point at center" arrow={{ pointAtCenter: true }}>
        <Button>Arrow Point at Center</Button>
      </Tooltip>
    </Space>
  ),
};

/**
 * Tooltips with rich, multiline content.
 * Use for more detailed explanations or help text.
 */
export const RichContent: Story = {
  render: () => (
    <Space wrap size="large">
      <Tooltip
        title={
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Rich Content Tooltip</div>
            <div>This tooltip can contain multiple lines</div>
            <div>and formatted content</div>
          </div>
        }
      >
        <Button>Multiline Text</Button>
      </Tooltip>

      <Tooltip
        title={
          <div>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            <span>Tooltip with icon</span>
          </div>
        }
      >
        <Button icon={<InfoCircleOutlined />}>With Icon</Button>
      </Tooltip>

      <Tooltip
        title={
          <Space direction="vertical" size="small">
            <Text style={{ color: 'white' }}>Feature highlights:</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>• Fast performance</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>• Easy to use</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>• Fully customizable</Text>
          </Space>
        }
      >
        <Button type="primary">Features</Button>
      </Tooltip>
    </Space>
  ),
};

/**
 * Tooltips on different types of elements.
 * Tooltips work with any HTML element, not just buttons.
 */
export const DifferentElements: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space wrap size="large">
        <Tooltip title="Button tooltip">
          <Button type="primary">Button</Button>
        </Tooltip>

        <Tooltip title="This is the username field">
          <Input placeholder="Username" style={{ width: 200 }} />
        </Tooltip>

        <Tooltip title="Click for more information">
          <QuestionCircleOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
        </Tooltip>
      </Space>

      <Tooltip title="Tooltip on text">
        <Text underline style={{ cursor: 'help' }}>
          Hover over this text
        </Text>
      </Tooltip>

      <Tooltip title="Tooltip on a div element">
        <div
          style={{
            width: 200,
            padding: 16,
            border: '1px dashed #d9d9d9',
            borderRadius: 4,
            textAlign: 'center',
            cursor: 'help',
          }}
        >
          Hover over this div
        </div>
      </Tooltip>
    </Space>
  ),
};

/**
 * Status tooltips with semantic colors and icons.
 * Use to indicate validation states or status information.
 */
export const StatusTooltips: Story = {
  render: () => (
    <Space direction="vertical" size="large">
      <Space wrap size="large">
        <Tooltip title="Operation successful" color="green">
          <Button icon={<CheckCircleOutlined />} type="primary">
            Success
          </Button>
        </Tooltip>

        <Tooltip title="Additional information available" color="blue">
          <Button icon={<InfoCircleOutlined />}>Info</Button>
        </Tooltip>

        <Tooltip title="Warning: Please review" color="orange">
          <Button icon={<QuestionCircleOutlined />} type="default">
            Warning
          </Button>
        </Tooltip>

        <Tooltip title="Error: Operation failed" color="red">
          <Button icon={<CloseCircleOutlined />} danger>
            Error
          </Button>
        </Tooltip>
      </Space>
    </Space>
  ),
};

/**
 * Controlled tooltip visibility.
 * Use when you need programmatic control over tooltip display.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Space direction="vertical" size="large">
        <Space>
          <Button onClick={() => setOpen(!open)}>Toggle from outside</Button>
          <Text type="secondary">Tooltip is {open ? 'open' : 'closed'}</Text>
        </Space>
        <Tooltip title="Controlled tooltip content" open={open} onOpenChange={setOpen}>
          <Button type="primary">Controlled Tooltip</Button>
        </Tooltip>
      </Space>
    );
  },
};

/**
 * Tooltip with custom delay timing.
 * Adjust delays to prevent tooltips from appearing too quickly or slowly.
 */
export const CustomDelay: Story = {
  render: () => (
    <Space wrap size="large">
      <Tooltip title="Default delay" mouseEnterDelay={0.1}>
        <Button>Default (0.1s)</Button>
      </Tooltip>
      <Tooltip title="Longer delay before showing" mouseEnterDelay={1}>
        <Button>Delay 1s</Button>
      </Tooltip>
      <Tooltip title="Stays longer after leaving" mouseLeaveDelay={2}>
        <Button>Leave delay 2s</Button>
      </Tooltip>
    </Space>
  ),
};

/**
 * Tooltip with custom overlay styling.
 * Use to match your brand or design requirements.
 */
export const CustomStyling: Story = {
  render: () => (
    <Space wrap size="large">
      <Tooltip
        title="Custom styled tooltip"
        overlayStyle={{
          maxWidth: 300,
        }}
        overlayInnerStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Button>Gradient Tooltip</Button>
      </Tooltip>

      <Tooltip
        title="Large tooltip with custom width"
        overlayInnerStyle={{
          minWidth: 200,
          fontSize: 16,
          padding: 16,
        }}
      >
        <Button type="primary">Large Tooltip</Button>
      </Tooltip>
    </Space>
  ),
};

/**
 * Real-world example: Form field helpers.
 * Common pattern for providing contextual help in forms.
 */
export const FormFieldHelpers: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: 400 }}>
      <Title level={5}>User Registration Form</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Space>
            <Text>Username</Text>
            <Tooltip title="Username must be 3-20 characters, alphanumeric only">
              <QuestionCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          </Space>
          <Input placeholder="Enter username" />
        </div>

        <div>
          <Space>
            <Text>Password</Text>
            <Tooltip
              title={
                <div>
                  <div>Password requirements:</div>
                  <div>• At least 8 characters</div>
                  <div>• One uppercase letter</div>
                  <div>• One number</div>
                  <div>• One special character</div>
                </div>
              }
            >
              <QuestionCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          </Space>
          <Input.Password placeholder="Enter password" />
        </div>

        <div>
          <Space>
            <Text>Email</Text>
            <Tooltip title="We'll send a verification link to this email" color="blue">
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          </Space>
          <Input placeholder="Enter email" type="email" />
        </div>
      </Space>
    </Space>
  ),
};

/**
 * Long content tooltip with text wrapping.
 * For detailed explanations that need more space.
 */
export const LongContent: Story = {
  render: () => (
    <Tooltip
      title="This is a very long tooltip that contains a lot of information. It will automatically wrap to multiple lines when it exceeds the maximum width. You can use this for detailed explanations, documentation, or help text that requires more space than a simple one-liner."
      overlayStyle={{ maxWidth: 400 }}
    >
      <Button type="primary">Hover for long explanation</Button>
    </Tooltip>
  ),
};

/**
 * Disabled state handling.
 * Show tooltips even when the wrapped element is disabled.
 */
export const DisabledElement: Story = {
  render: () => (
    <Space wrap size="large">
      <Tooltip title="This button is disabled">
        <Button disabled>Disabled Button</Button>
      </Tooltip>

      <Tooltip title="Wrap disabled button in span for better tooltip">
        <span>
          <Button disabled>Better Disabled</Button>
        </span>
      </Tooltip>

      <Tooltip title="Explanation of why this is disabled" color="orange">
        <span>
          <Button disabled type="primary">
            Premium Feature
          </Button>
        </span>
      </Tooltip>
    </Space>
  ),
};
