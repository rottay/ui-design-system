import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Radio,
  Switch,
  DatePicker,
  TimePicker,
  Slider,
  InputNumber,
  Badge,
  Tag,
  Avatar,
  Card,
  Collapse,
  Alert,
  Progress,
  Rate,
  Spin,
  Menu,
  Tabs,
  Breadcrumb,
  Pagination,
  Steps,
  Tooltip,
  Popover,
  Dropdown,
  Space,
  Divider,
} from '../components';

const ComponentGallery = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Galería de Componentes</h1>
      <p style={{ marginBottom: '40px', color: '#666' }}>
        Vista rápida de todos los componentes disponibles en el Design System
      </p>

      {/* General */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #1890ff', paddingBottom: '10px' }}>
          General
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
          <Button danger>Danger</Button>
        </div>
      </section>

      {/* Inputs */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #52c41a', paddingBottom: '10px' }}>
          Inputs
        </h2>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <h4>Input</h4>
            <Input placeholder="Input básico" style={{ maxWidth: '300px' }} />
          </div>

          <div>
            <h4>Select</h4>
            <Select
              placeholder="Selecciona una opción"
              style={{ width: '300px' }}
              options={[
                { value: '1', label: 'Opción 1' },
                { value: '2', label: 'Opción 2' },
                { value: '3', label: 'Opción 3' },
              ]}
            />
          </div>

          <div>
            <h4>Checkbox</h4>
            <Checkbox>Checkbox</Checkbox>
          </div>

          <div>
            <h4>Radio</h4>
            <Radio.Group defaultValue="1">
              <Radio value="1">Opción A</Radio>
              <Radio value="2">Opción B</Radio>
              <Radio value="3">Opción C</Radio>
            </Radio.Group>
          </div>

          <div>
            <h4>Switch</h4>
            <Switch defaultChecked />
          </div>

          <div>
            <h4>Slider</h4>
            <Slider defaultValue={30} style={{ maxWidth: '300px' }} />
          </div>

          <div>
            <h4>InputNumber</h4>
            <InputNumber min={1} max={10} defaultValue={3} />
          </div>

          <div>
            <h4>DatePicker</h4>
            <DatePicker placeholder="Selecciona fecha" />
          </div>

          <div>
            <h4>TimePicker</h4>
            <TimePicker placeholder="Selecciona hora" />
          </div>
        </Space>
      </section>

      {/* Display */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #722ed1', paddingBottom: '10px' }}>
          Display
        </h2>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <h4>Badge</h4>
            <Space size="large">
              <Badge count={5}>
                <Avatar shape="square" size="large" />
              </Badge>
              <Badge count={0} showZero>
                <Avatar shape="square" size="large" />
              </Badge>
              <Badge status="success" text="Success" />
              <Badge status="error" text="Error" />
            </Space>
          </div>

          <div>
            <h4>Tag</h4>
            <Space>
              <Tag>Default</Tag>
              <Tag color="success">Success</Tag>
              <Tag color="processing">Processing</Tag>
              <Tag color="error">Error</Tag>
              <Tag color="warning">Warning</Tag>
            </Space>
          </div>

          <div>
            <h4>Avatar</h4>
            <Space>
              <Avatar size={64}>U</Avatar>
              <Avatar size="large">USER</Avatar>
              <Avatar>U</Avatar>
              <Avatar size="small">U</Avatar>
            </Space>
          </div>

          <div>
            <h4>Card</h4>
            <Card title="Card Title" style={{ maxWidth: '400px' }}>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </div>

          <div>
            <h4>Collapse</h4>
            <Collapse
              style={{ maxWidth: '400px' }}
              items={[
                {
                  key: '1',
                  label: 'Panel 1',
                  children: <p>Contenido del panel 1</p>,
                },
                {
                  key: '2',
                  label: 'Panel 2',
                  children: <p>Contenido del panel 2</p>,
                },
              ]}
            />
          </div>
        </Space>
      </section>

      {/* Feedback */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #fa8c16', paddingBottom: '10px' }}>
          Feedback
        </h2>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <h4>Alert</h4>
            <Space direction="vertical" style={{ width: '100%', maxWidth: '600px' }}>
              <Alert message="Success Alert" type="success" showIcon />
              <Alert message="Info Alert" type="info" showIcon />
              <Alert message="Warning Alert" type="warning" showIcon />
              <Alert message="Error Alert" type="error" showIcon />
            </Space>
          </div>

          <div>
            <h4>Progress</h4>
            <Space direction="vertical" style={{ width: '100%', maxWidth: '400px' }}>
              <Progress percent={30} />
              <Progress percent={50} status="active" />
              <Progress percent={70} status="exception" />
              <Progress percent={100} />
            </Space>
          </div>

          <div>
            <h4>Rate</h4>
            <Rate defaultValue={3} />
          </div>

          <div>
            <h4>Spin</h4>
            <Spin />
          </div>
        </Space>
      </section>

      {/* Navigation */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #13c2c2', paddingBottom: '10px' }}>
          Navigation
        </h2>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <h4>Menu</h4>
            <Menu
              mode="horizontal"
              defaultSelectedKeys={['1']}
              items={[
                { key: '1', label: 'Navigation One' },
                { key: '2', label: 'Navigation Two' },
                { key: '3', label: 'Navigation Three' },
              ]}
            />
          </div>

          <div>
            <h4>Tabs</h4>
            <Tabs
              defaultActiveKey="1"
              items={[
                { key: '1', label: 'Tab 1', children: 'Content of Tab 1' },
                { key: '2', label: 'Tab 2', children: 'Content of Tab 2' },
                { key: '3', label: 'Tab 3', children: 'Content of Tab 3' },
              ]}
            />
          </div>

          <div>
            <h4>Breadcrumb</h4>
            <Breadcrumb
              items={[
                { title: 'Home' },
                { title: 'Application' },
                { title: 'Detail' },
              ]}
            />
          </div>

          <div>
            <h4>Pagination</h4>
            <Pagination defaultCurrent={1} total={50} />
          </div>

          <div>
            <h4>Steps</h4>
            <Steps
              current={1}
              items={[
                { title: 'Finished', description: 'This is a description' },
                { title: 'In Progress', description: 'This is a description' },
                { title: 'Waiting', description: 'This is a description' },
              ]}
            />
          </div>
        </Space>
      </section>

      {/* Overlay */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #eb2f96', paddingBottom: '10px' }}>
          Overlay
        </h2>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <h4>Tooltip</h4>
            <Tooltip title="Tooltip text">
              <Button>Hover me</Button>
            </Tooltip>
          </div>

          <div>
            <h4>Popover</h4>
            <Popover content="Popover content" title="Popover Title">
              <Button>Hover me</Button>
            </Popover>
          </div>

          <div>
            <h4>Dropdown</h4>
            <Dropdown
              menu={{
                items: [
                  { key: '1', label: '1st menu item' },
                  { key: '2', label: '2nd menu item' },
                  { key: '3', label: '3rd menu item' },
                ],
              }}
            >
              <Button>Dropdown</Button>
            </Dropdown>
          </div>
        </Space>
      </section>

      <Divider />

      <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
        Haz clic en cualquier componente en el menú lateral para ver más ejemplos y documentación completa
      </p>
    </div>
  );
};

const meta: Meta<typeof ComponentGallery> = {
  title: 'Introduction/Component Gallery',
  component: ComponentGallery,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Galería visual de todos los componentes disponibles en el Design System',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentGallery>;

export const Gallery: Story = {};
