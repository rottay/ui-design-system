import React from 'react';
import {
  Tag, Space, Timeline, Statistic, Empty, Progress,
  Skeleton, Spin, Result, Modal, Message, Button, Notification,
  Rate, Typography, Tree, Table, QRCode, Image, List,
  Descriptions, Collapse, Carousel, Calendar
} from '@es-rottay/designsystem-core';

const { Title, Text, Paragraph } = Typography;

interface ComponentPageProps {
  component: string;
}

export const ComponentPage: React.FC<ComponentPageProps> = ({ component }) => {
  const [modalOpen, setModalOpen] = React.useState(false);

  const renderContent = () => {
    switch (component) {
      case 'Tag':
        return (
          <>
            <div style={{ marginTop: '48px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
              <Space size="small" wrap>
                <Tag>Tag 1</Tag>
                <Tag>Tag 2</Tag>
                <Tag>Tag 3</Tag>
              </Space>
            </div>
            <div style={{ marginTop: '48px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Colores</h2>
              <Space size="small" wrap>
                <Tag color="success">Success</Tag>
                <Tag color="processing">Processing</Tag>
                <Tag color="error">Error</Tag>
                <Tag color="warning">Warning</Tag>
                <Tag color="#1DB954">Custom</Tag>
              </Space>
            </div>
          </>
        );

      case 'Timeline':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Timeline
              items={[
                { children: 'Create a services site 2015-09-01' },
                { children: 'Solve initial network problems 2015-09-01' },
                { children: 'Technical testing 2015-09-01', color: 'green' },
                { children: 'Network problems being solved 2015-09-01', color: 'red' },
              ]}
            />
          </div>
        );

      case 'Statistic':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Space size="large">
              <Statistic title="Active Users" value={112893} />
              <Statistic title="Account Balance (USD)" value={112893} precision={2} />
              <Statistic title="Growth Rate" value={11.28} suffix="%" />
            </Space>
          </div>
        );

      case 'Empty':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Empty description="No data available" />
          </div>
        );

      case 'Progress':
        return (
          <>
            <div style={{ marginTop: '48px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Línea</h2>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Progress percent={30} />
                <Progress percent={50} status="active" />
                <Progress percent={70} status="exception" />
                <Progress percent={100} />
              </Space>
            </div>
            <div style={{ marginTop: '48px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Círculo</h2>
              <Space size="large">
                <Progress type="circle" percent={75} />
                <Progress type="circle" percent={100} />
              </Space>
            </div>
          </>
        );

      case 'Skeleton':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Skeleton active />
            <Skeleton active avatar paragraph={{ rows: 4 }} style={{ marginTop: '24px' }} />
          </div>
        );

      case 'Spin':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Tamaños</h2>
            <Space size="large">
              <Spin size="small" />
              <Spin />
              <Spin size="large" />
            </Space>
          </div>
        );

      case 'Result':
        return (
          <div style={{ marginTop: '48px' }}>
            <Result
              status="success"
              title="Successfully Completed!"
              subTitle="Order number: 2017182818828182881"
            />
          </div>
        );

      case 'Modal':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Button type="primary" onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
            <Modal
              title="Example Modal"
              open={modalOpen}
              onOk={() => setModalOpen(false)}
              onCancel={() => setModalOpen(false)}
            >
              <p>This is an example modal with Spotify theme!</p>
              <p>Click OK or Cancel to close.</p>
            </Modal>
          </div>
        );

      case 'Message':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Tipos</h2>
            <Space>
              <Button onClick={() => Message.success('Success message')}>Success</Button>
              <Button onClick={() => Message.error('Error message')}>Error</Button>
              <Button onClick={() => Message.warning('Warning message')}>Warning</Button>
              <Button onClick={() => Message.info('Info message')}>Info</Button>
            </Space>
          </div>
        );

      case 'Notification':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Tipos</h2>
            <Space>
              <Button onClick={() => Notification.success({ message: 'Success', description: 'This is a success notification' })}>Success</Button>
              <Button onClick={() => Notification.error({ message: 'Error', description: 'This is an error notification' })}>Error</Button>
              <Button onClick={() => Notification.warning({ message: 'Warning', description: 'This is a warning notification' })}>Warning</Button>
              <Button onClick={() => Notification.info({ message: 'Info', description: 'This is an info notification' })}>Info</Button>
            </Space>
          </div>
        );

      case 'Rate':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Rate defaultValue={3} />
            <div style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Con texto</h2>
              <Rate allowHalf defaultValue={2.5} />
            </div>
          </div>
        );

      case 'Typography':
        return (
          <>
            <div style={{ marginTop: '48px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Títulos</h2>
              <Title>h1. Design System</Title>
              <Title level={2}>h2. Design System</Title>
              <Title level={3}>h3. Design System</Title>
              <Title level={4}>h4. Design System</Title>
            </div>
            <div style={{ marginTop: '48px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Texto</h2>
              <Text>Normal text</Text>
              <br />
              <Text type="secondary">Secondary text</Text>
              <br />
              <Text type="success">Success text</Text>
              <br />
              <Text type="warning">Warning text</Text>
              <br />
              <Text type="danger">Danger text</Text>
            </div>
            <div style={{ marginTop: '48px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Párrafo</h2>
              <Paragraph>
                Este es un párrafo de ejemplo usando el componente Typography de Ant Design.
                Puedes usar este componente para mostrar texto largo con formato.
              </Paragraph>
            </div>
          </>
        );

      case 'Tree':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Tree
              treeData={[
                {
                  title: 'parent 0',
                  key: '0',
                  children: [
                    { title: 'leaf 0-0', key: '0-0' },
                    { title: 'leaf 0-1', key: '0-1' },
                  ],
                },
                {
                  title: 'parent 1',
                  key: '1',
                  children: [
                    { title: 'leaf 1-0', key: '1-0' },
                    { title: 'leaf 1-1', key: '1-1' },
                  ],
                },
              ]}
            />
          </div>
        );

      case 'Table':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Table
              dataSource={[
                { key: '1', name: 'John', age: 32, address: 'New York' },
                { key: '2', name: 'Jane', age: 28, address: 'London' },
                { key: '3', name: 'Joe', age: 35, address: 'Sidney' },
              ]}
              columns={[
                { title: 'Name', dataIndex: 'name', key: 'name' },
                { title: 'Age', dataIndex: 'age', key: 'age' },
                { title: 'Address', dataIndex: 'address', key: 'address' },
              ]}
            />
          </div>
        );

      case 'QRCode':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <QRCode value="https://ant.design" />
          </div>
        );

      case 'Image':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Image
              width={200}
              src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
            />
          </div>
        );

      case 'List':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <List
              dataSource={['Item 1', 'Item 2', 'Item 3', 'Item 4']}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </div>
        );

      case 'Descriptions':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Descriptions title="User Info">
              <Descriptions.Item label="Name">John Doe</Descriptions.Item>
              <Descriptions.Item label="Email">john@example.com</Descriptions.Item>
              <Descriptions.Item label="Location">New York</Descriptions.Item>
              <Descriptions.Item label="Status">Active</Descriptions.Item>
            </Descriptions>
          </div>
        );

      case 'Collapse':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Collapse
              items={[
                { key: '1', label: 'Panel 1', children: <p>Content of panel 1</p> },
                { key: '2', label: 'Panel 2', children: <p>Content of panel 2</p> },
                { key: '3', label: 'Panel 3', children: <p>Content of panel 3</p> },
              ]}
            />
          </div>
        );

      case 'Carousel':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Carousel autoplay>
              <div style={{ height: '160px', backgroundColor: '#364d79', color: '#fff', lineHeight: '160px', textAlign: 'center' }}>
                <h3>Slide 1</h3>
              </div>
              <div style={{ height: '160px', backgroundColor: '#1DB954', color: '#fff', lineHeight: '160px', textAlign: 'center' }}>
                <h3>Slide 2</h3>
              </div>
              <div style={{ height: '160px', backgroundColor: '#364d79', color: '#fff', lineHeight: '160px', textAlign: 'center' }}>
                <h3>Slide 3</h3>
              </div>
            </Carousel>
          </div>
        );

      case 'Calendar':
        return (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
            <Calendar />
          </div>
        );

      default:
        return (
          <div style={{ marginTop: '48px' }}>
            <p style={{ color: '#B3B3B3' }}>Componente en construcción...</p>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: '48px' }}>
      <h1 style={{ fontSize: '36px', margin: 0, color: '#1890ff' }}>{component}</h1>
      <p style={{ fontSize: '16px', color: '#666', marginTop: '8px' }}>
        Componente {component} de Ant Design
      </p>
      {renderContent()}
    </div>
  );
};
