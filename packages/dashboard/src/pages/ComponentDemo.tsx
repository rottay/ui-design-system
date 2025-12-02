import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Components from '@es-rottay/designsystem-core';
import { Space, Typography, Divider, Row, Col } from 'antd';

const { Title, Paragraph, Text } = Typography;

export const ComponentDemo: React.FC = () => {
  const { category, component } = useParams<{ category: string; component: string }>();

  const componentName = component
    ? component.charAt(0).toUpperCase() + component.slice(1).replace(/([A-Z])/g, ' $1').trim()
    : 'Component';

  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Category';

  return (
    <div style={{ padding: '48px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {categoryName}
        </Text>
        <Title level={1} style={{ marginTop: '8px', marginBottom: '16px' }}>
          {componentName}
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Componente primitivo wrapper de Ant Design {componentName}
        </Paragraph>
      </div>

      <Divider />

      {/* Examples Section */}
      <div style={{ marginTop: '48px' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>
          Ejemplos
        </Title>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {renderComponentExamples(component || '')}
        </Space>
      </div>
    </div>
  );
};

// Función para renderizar ejemplos según el componente
function renderComponentExamples(component: string) {
  const {
    // Navigation
    Button,
    // Inputs
    Input, Select, Checkbox, Radio, Switch, Slider, Form, DatePicker, TimePicker,
    InputNumber, AutoComplete, Cascader, ColorPicker, Mentions, Rate, Transfer,
    TreeSelect, Upload,
    // Display
    Avatar, Badge, Tag, Calendar, Carousel, Collapse, Descriptions, Empty,
    Image, List, QRCode, Statistic, Table, Timeline, Tree, Typography,
    // Feedback
    Alert, Progress, Result, Skeleton, Spin, Drawer, Modal, Notification, Message,
    // Layout
    Card, Container, Divider, Space, Flex, Layout, Splitter, Stack
  } = Components;

  const { Title: AntTitle, Text: AntText, Paragraph: AntParagraph } = Typography || {};

  switch (component?.toLowerCase()) {
    case 'affix':
      const { Affix } = Components;
      return (
        <ExampleSection title="Affix">
          {Affix && (
            <Affix offsetTop={10}>
              <Button type="primary">Affixed Button (scroll to see)</Button>
            </Affix>
          )}
        </ExampleSection>
      );

    case 'anchor':
      const { Anchor } = Components;
      return (
        <ExampleSection title="Anchor">
          {Anchor && (
            <Anchor
              items={[
                { key: '1', href: '#components', title: 'Components' },
                { key: '2', href: '#examples', title: 'Examples' },
                { key: '3', href: '#api', title: 'API' },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'backtop':
      const { BackTop } = Components;
      return (
        <ExampleSection title="BackTop">
          {BackTop && (
            <div style={{ height: 400, overflowY: 'auto', position: 'relative', padding: 24 }}>
              <div style={{ height: 1000 }}>
                <p>Scroll down to see BackTop button</p>
              </div>
              <BackTop />
            </div>
          )}
        </ExampleSection>
      );

    case 'breadcrumb':
      const { Breadcrumb } = Components;
      return (
        <ExampleSection title="Breadcrumb">
          {Breadcrumb && (
            <Breadcrumb
              items={[
                { title: 'Home' },
                { title: 'Application Center' },
                { title: 'Application List' },
                { title: 'An Application' },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'button':
      return (
        <>
          <ExampleSection title="Variantes">
            <Space wrap>
              <Button type="primary">Primary</Button>
              <Button>Default</Button>
              <Button type="dashed">Dashed</Button>
              <Button type="link">Link</Button>
              <Button type="text">Text</Button>
            </Space>
          </ExampleSection>

          <ExampleSection title="Tamaños">
            <Space wrap>
              <Button type="primary" size="large">Large</Button>
              <Button type="primary">Middle</Button>
              <Button type="primary" size="small">Small</Button>
            </Space>
          </ExampleSection>

          <ExampleSection title="Estados">
            <Space wrap>
              <Button type="primary" loading>Loading</Button>
              <Button type="primary" disabled>Disabled</Button>
              <Button type="primary" danger>Danger</Button>
            </Space>
          </ExampleSection>
        </>
      );

    case 'floatbutton':
      const { FloatButton } = Components;
      return (
        <ExampleSection title="FloatButton">
          {FloatButton && (
            <div style={{ position: 'relative', height: 400, border: '1px solid #d9d9d9', padding: 24 }}>
              <p>Ejemplo de FloatButton. El botón flotante aparece en la esquina inferior derecha del contenedor.</p>
              <FloatButton
                style={{ right: 24, bottom: 24 }}
                onClick={() => console.log('FloatButton clicked!')}
              />
            </div>
          )}
        </ExampleSection>
      );

    case 'menu':
      const { Menu } = Components;
      return (
        <ExampleSection title="Menu">
          {Menu && (
            <Menu
              style={{ width: 256 }}
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              mode="inline"
              items={[
                {
                  key: 'sub1',
                  label: 'Navigation One',
                  children: [
                    { key: '1', label: 'Option 1' },
                    { key: '2', label: 'Option 2' },
                  ],
                },
                {
                  key: 'sub2',
                  label: 'Navigation Two',
                  children: [
                    { key: '3', label: 'Option 3' },
                    { key: '4', label: 'Option 4' },
                  ],
                },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'pagination':
      const { Pagination } = Components;
      return (
        <ExampleSection title="Pagination">
          {Pagination && (
            <Space direction="vertical">
              <Pagination defaultCurrent={1} total={50} />
              <Pagination defaultCurrent={6} total={500} />
            </Space>
          )}
        </ExampleSection>
      );

    case 'segmented':
      const { Segmented } = Components;
      return (
        <ExampleSection title="Segmented">
          {Segmented && (
            <Space direction="vertical">
              <Segmented options={['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']} />
              <Segmented
                options={[
                  { label: 'List', value: 'List' },
                  { label: 'Kanban', value: 'Kanban' },
                ]}
              />
            </Space>
          )}
        </ExampleSection>
      );

    case 'steps':
      const { Steps } = Components;
      return (
        <ExampleSection title="Steps">
          {Steps && (
            <Steps
              current={1}
              items={[
                { title: 'Finished', description: 'This is a description' },
                { title: 'In Progress', description: 'This is a description' },
                { title: 'Waiting', description: 'This is a description' },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'tabs':
      const { Tabs } = Components;
      return (
        <ExampleSection title="Tabs">
          {Tabs && (
            <Tabs
              defaultActiveKey="1"
              items={[
                { key: '1', label: 'Tab 1', children: 'Content of Tab Pane 1' },
                { key: '2', label: 'Tab 2', children: 'Content of Tab Pane 2' },
                { key: '3', label: 'Tab 3', children: 'Content of Tab Pane 3' },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'input':
      return (
        <>
          <ExampleSection title="Básico">
            <Space direction="vertical" style={{ width: '300px' }}>
              <Input placeholder="Input básico" />
              <Input placeholder="Input con valor" defaultValue="Texto ejemplo" />
              <Input placeholder="Input deshabilitado" disabled />
            </Space>
          </ExampleSection>

          <ExampleSection title="Tamaños">
            <Space direction="vertical" style={{ width: '300px' }}>
              <Input placeholder="Large" size="large" />
              <Input placeholder="Middle" />
              <Input placeholder="Small" size="small" />
            </Space>
          </ExampleSection>
        </>
      );

    case 'avatar':
      return (
        <>
          <ExampleSection title="Tipos">
            <Space wrap>
              <Avatar>U</Avatar>
              <Avatar icon={<span>👤</span>} />
              <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
            </Space>
          </ExampleSection>

          <ExampleSection title="Tamaños">
            <Space wrap>
              <Avatar size={64}>U</Avatar>
              <Avatar size={48}>U</Avatar>
              <Avatar size={32}>U</Avatar>
              <Avatar size={24}>U</Avatar>
            </Space>
          </ExampleSection>
        </>
      );

    case 'badge':
      return (
        <ExampleSection title="Ejemplos">
          <Space wrap size="large">
            <Badge count={5}>
              <Avatar shape="square" size={40}>U</Avatar>
            </Badge>
            <Badge count={99}>
              <Avatar shape="square" size={40}>U</Avatar>
            </Badge>
            <Badge count={999} overflowCount={999}>
              <Avatar shape="square" size={40}>U</Avatar>
            </Badge>
            <Badge dot>
              <Avatar shape="square" size={40}>U</Avatar>
            </Badge>
          </Space>
        </ExampleSection>
      );

    case 'tag':
      return (
        <>
          <ExampleSection title="Colores">
            <Space wrap>
              <Tag>Default</Tag>
              <Tag color="blue">Blue</Tag>
              <Tag color="green">Green</Tag>
              <Tag color="red">Red</Tag>
              <Tag color="orange">Orange</Tag>
              <Tag color="purple">Purple</Tag>
            </Space>
          </ExampleSection>
        </>
      );

    case 'alert':
      return (
        <>
          <ExampleSection title="Tipos">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert message="Success" type="success" />
              <Alert message="Info" type="info" />
              <Alert message="Warning" type="warning" />
              <Alert message="Error" type="error" />
            </Space>
          </ExampleSection>
        </>
      );

    case 'progress':
      return (
        <>
          <ExampleSection title="Porcentajes">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Progress percent={30} />
              <Progress percent={50} status="active" />
              <Progress percent={70} status="exception" />
              <Progress percent={100} />
            </Space>
          </ExampleSection>
        </>
      );

    case 'card':
      return (
        <>
          <ExampleSection title="Básico">
            <Card title="Card Title" style={{ width: 300 }}>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </ExampleSection>
        </>
      );

    case 'checkbox':
      return (
        <>
          <ExampleSection title="Ejemplos">
            <Space direction="vertical">
              <Checkbox>Checkbox</Checkbox>
              <Checkbox defaultChecked>Checked</Checkbox>
              <Checkbox disabled>Disabled</Checkbox>
              <Checkbox disabled checked>Disabled Checked</Checkbox>
            </Space>
          </ExampleSection>
        </>
      );

    case 'radio':
      return (
        <>
          <ExampleSection title="Ejemplos">
            <Space direction="vertical">
              <Radio>Radio</Radio>
              <Radio checked>Checked</Radio>
              <Radio disabled>Disabled</Radio>
            </Space>
          </ExampleSection>
        </>
      );

    case 'switch':
      return (
        <>
          <ExampleSection title="Ejemplos">
            <Space>
              <Switch defaultChecked />
              <Switch />
              <Switch disabled />
              <Switch disabled checked />
            </Space>
          </ExampleSection>
        </>
      );

    // ===== DISPLAY COMPONENTS =====
    case 'calendar':
      return (
        <ExampleSection title="Calendar">
          {Calendar && <Calendar fullscreen={false} />}
        </ExampleSection>
      );

    case 'carousel':
      return (
        <ExampleSection title="Carousel">
          {Carousel && (
            <Carousel autoplay style={{ background: '#364d79' }}>
              <div style={{ height: '160px', color: '#fff', lineHeight: '160px', textAlign: 'center', background: '#364d79' }}>
                <h3>1</h3>
              </div>
              <div style={{ height: '160px', color: '#fff', lineHeight: '160px', textAlign: 'center', background: '#364d79' }}>
                <h3>2</h3>
              </div>
              <div style={{ height: '160px', color: '#fff', lineHeight: '160px', textAlign: 'center', background: '#364d79' }}>
                <h3>3</h3>
              </div>
            </Carousel>
          )}
        </ExampleSection>
      );

    case 'collapse':
      return (
        <ExampleSection title="Collapse">
          {Collapse && (
            <Collapse
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
                {
                  key: '3',
                  label: 'Panel 3',
                  children: <p>Contenido del panel 3</p>,
                },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'descriptions':
      return (
        <ExampleSection title="Descriptions">
          {Descriptions && (
            <Descriptions title="User Info" bordered>
              <Descriptions.Item label="UserName">Zhou Maomao</Descriptions.Item>
              <Descriptions.Item label="Telephone">1810000000</Descriptions.Item>
              <Descriptions.Item label="Live">Hangzhou, Zhejiang</Descriptions.Item>
              <Descriptions.Item label="Remark">empty</Descriptions.Item>
              <Descriptions.Item label="Address">
                No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
              </Descriptions.Item>
            </Descriptions>
          )}
        </ExampleSection>
      );

    case 'empty':
      return (
        <>
          <ExampleSection title="Básico">
            {Empty && <Empty />}
          </ExampleSection>
          <ExampleSection title="Con descripción">
            {Empty && <Empty description="No hay datos disponibles" />}
          </ExampleSection>
        </>
      );

    case 'image':
      return (
        <ExampleSection title="Image">
          {Image && (
            <Space>
              <Image
                width={200}
                src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
              />
              <Image
                width={200}
                src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp"
              />
            </Space>
          )}
        </ExampleSection>
      );

    case 'list':
      return (
        <ExampleSection title="List">
          {List && (
            <List
              bordered
              dataSource={['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          )}
        </ExampleSection>
      );

    case 'qrcode':
      return (
        <ExampleSection title="QR Code">
          {QRCode && (
            <Space direction="vertical" align="center">
              <QRCode value="https://ant.design/" />
              <QRCode value="https://ant.design/" size={200} />
            </Space>
          )}
        </ExampleSection>
      );

    case 'statistic':
      return (
        <>
          <ExampleSection title="Básico">
            {Statistic && (
              <Space size="large">
                <Statistic title="Active Users" value={112893} />
                <Statistic title="Account Balance (CNY)" value={112893} precision={2} />
                <Statistic title="Active Users" value={112893} suffix="/ 100" />
              </Space>
            )}
          </ExampleSection>
        </>
      );

    case 'table':
      return (
        <ExampleSection title="Table">
          {Table && (
            <Table
              dataSource={[
                { key: '1', name: 'John Brown', age: 32, address: 'New York' },
                { key: '2', name: 'Jim Green', age: 42, address: 'London' },
                { key: '3', name: 'Joe Black', age: 32, address: 'Sidney' },
              ]}
              columns={[
                { title: 'Name', dataIndex: 'name', key: 'name' },
                { title: 'Age', dataIndex: 'age', key: 'age' },
                { title: 'Address', dataIndex: 'address', key: 'address' },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'timeline':
      return (
        <ExampleSection title="Timeline">
          {Timeline && (
            <Timeline
              items={[
                { children: 'Create a services site 2015-09-01' },
                { children: 'Solve initial network problems 2015-09-01' },
                { children: 'Technical testing 2015-09-01' },
                { children: 'Network problems being solved 2015-09-01' },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'tree':
      return (
        <ExampleSection title="Tree">
          {Tree && (
            <Tree
              treeData={[
                {
                  title: 'parent 1',
                  key: '0-0',
                  children: [
                    { title: 'leaf', key: '0-0-0' },
                    { title: 'leaf', key: '0-0-1' },
                  ],
                },
                {
                  title: 'parent 2',
                  key: '0-1',
                  children: [
                    { title: 'leaf', key: '0-1-0' },
                    { title: 'leaf', key: '0-1-1' },
                  ],
                },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'typography':
      return (
        <>
          {AntTitle && AntText && AntParagraph && (
            <>
              <ExampleSection title="Title">
                <Space direction="vertical">
                  <AntTitle>h1. Ant Design</AntTitle>
                  <AntTitle level={2}>h2. Ant Design</AntTitle>
                  <AntTitle level={3}>h3. Ant Design</AntTitle>
                  <AntTitle level={4}>h4. Ant Design</AntTitle>
                  <AntTitle level={5}>h5. Ant Design</AntTitle>
                </Space>
              </ExampleSection>

              <ExampleSection title="Text">
                <Space direction="vertical">
                  <AntText>Ant Design (default)</AntText>
                  <AntText type="secondary">Ant Design (secondary)</AntText>
                  <AntText type="success">Ant Design (success)</AntText>
                  <AntText type="warning">Ant Design (warning)</AntText>
                  <AntText type="danger">Ant Design (danger)</AntText>
                  <AntText disabled>Ant Design (disabled)</AntText>
                </Space>
              </ExampleSection>

              <ExampleSection title="Paragraph">
                <AntParagraph>
                  Ant Design, a design language for background applications, is refined by Ant UED Team.
                  Ant Design, a design language for background applications, is refined by Ant UED Team.
                </AntParagraph>
              </ExampleSection>
            </>
          )}
        </>
      );

    case 'tooltip':
      return (
        <ExampleSection title="Tooltip">
          {Components.Tooltip && (
            <Space>
              <Components.Tooltip title="prompt text">
                <span>Hover me</span>
              </Components.Tooltip>
              <Components.Tooltip title="prompt text" placement="top">
                <Button>Top</Button>
              </Components.Tooltip>
              <Components.Tooltip title="prompt text" placement="bottom">
                <Button>Bottom</Button>
              </Components.Tooltip>
            </Space>
          )}
        </ExampleSection>
      );

    // ===== FEEDBACK COMPONENTS =====
    case 'drawer':
      return <DrawerExample />;

    case 'message':
      return <MessageExample />;

    case 'modal':
      return <ModalExample />;

    case 'notification':
      return <NotificationExample />;

    case 'result':
      return (
        <>
          <ExampleSection title="Success">
            {Result && (
              <Result
                status="success"
                title="Successfully Purchased Cloud Server!"
                subTitle="Order number: 2017182818828182881"
              />
            )}
          </ExampleSection>
        </>
      );

    case 'skeleton':
      return (
        <>
          <ExampleSection title="Básico">
            {Skeleton && <Skeleton />}
          </ExampleSection>
          <ExampleSection title="Avatar">
            {Skeleton && <Skeleton avatar paragraph={{ rows: 4 }} />}
          </ExampleSection>
        </>
      );

    case 'spin':
      return (
        <ExampleSection title="Spin">
          {Spin && (
            <Space size="large">
              <Spin size="small" />
              <Spin />
              <Spin size="large" />
            </Space>
          )}
        </ExampleSection>
      );

    // ===== LAYOUT COMPONENTS =====
    case 'divider':
      return (
        <>
          <ExampleSection title="Horizontal">
            {Divider && (
              <>
                <p>Lorem ipsum dolor sit amet</p>
                <Divider />
                <p>Lorem ipsum dolor sit amet</p>
                <Divider dashed />
                <p>Lorem ipsum dolor sit amet</p>
              </>
            )}
          </ExampleSection>
        </>
      );

    case 'flex':
      return (
        <ExampleSection title="Flex">
          {Flex && (
            <Flex gap="middle" vertical>
              <Flex gap="small">
                <Button type="primary">Primary</Button>
                <Button>Default</Button>
                <Button type="dashed">Dashed</Button>
              </Flex>
              <Flex gap="small" justify="center">
                <Button type="primary">Primary</Button>
                <Button>Default</Button>
                <Button type="dashed">Dashed</Button>
              </Flex>
              <Flex gap="small" justify="flex-end">
                <Button type="primary">Primary</Button>
                <Button>Default</Button>
                <Button type="dashed">Dashed</Button>
              </Flex>
            </Flex>
          )}
        </ExampleSection>
      );

    case 'grid':
      return (
        <ExampleSection title="Grid">
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ background: '#0092ff', padding: '20px', color: 'white' }}>Col 8</div>
            </Col>
            <Col span={8}>
              <div style={{ background: '#0092ff', padding: '20px', color: 'white' }}>Col 8</div>
            </Col>
            <Col span={8}>
              <div style={{ background: '#0092ff', padding: '20px', color: 'white' }}>Col 8</div>
            </Col>
          </Row>
        </ExampleSection>
      );

    case 'container':
      return (
        <>
          <ExampleSection title="Container - Small">
            <Container maxWidth="sm" style={{ backgroundColor: '#f0f0f0', padding: '16px' }}>
              <p>This is a small container (640px max-width)</p>
            </Container>
          </ExampleSection>
          <ExampleSection title="Container - Medium">
            <Container maxWidth="md" style={{ backgroundColor: '#f0f0f0', padding: '16px' }}>
              <p>This is a medium container (768px max-width)</p>
            </Container>
          </ExampleSection>
          <ExampleSection title="Container - Large">
            <Container maxWidth="lg" style={{ backgroundColor: '#f0f0f0', padding: '16px' }}>
              <p>This is a large container (1024px max-width)</p>
            </Container>
          </ExampleSection>
          <ExampleSection title="Container - Extra Large">
            <Container maxWidth="xl" style={{ backgroundColor: '#f0f0f0', padding: '16px' }}>
              <p>This is an extra large container (1280px max-width)</p>
            </Container>
          </ExampleSection>
        </>
      );

    case 'layout':
      return (
        <>
          <ExampleSection title="Basic Layout">
            <Layout style={{ minHeight: '400px' }}>
              <Layout.Header style={{ color: 'white', backgroundColor: '#001529' }}>Header</Layout.Header>
              <Layout.Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>Content</Layout.Content>
              <Layout.Footer style={{ textAlign: 'center' }}>Footer</Layout.Footer>
            </Layout>
          </ExampleSection>
          <ExampleSection title="Layout with Sider">
            <Layout style={{ minHeight: '400px' }}>
              <Layout.Sider style={{ backgroundColor: '#001529' }}>
                <div style={{ color: 'white', padding: '16px' }}>Sider</div>
              </Layout.Sider>
              <Layout>
                <Layout.Header style={{ color: 'white', backgroundColor: '#1890ff' }}>Header</Layout.Header>
                <Layout.Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>Content</Layout.Content>
                <Layout.Footer style={{ textAlign: 'center' }}>Footer</Layout.Footer>
              </Layout>
            </Layout>
          </ExampleSection>
        </>
      );

    case 'space':
      return (
        <ExampleSection title="Space">
          {Space && (
            <Space direction="vertical">
              <Space>
                <Button type="primary">Button</Button>
                <Button>Button</Button>
                <Button>Button</Button>
              </Space>
              <Space size="large">
                <Button type="primary">Button</Button>
                <Button>Button</Button>
                <Button>Button</Button>
              </Space>
            </Space>
          )}
        </ExampleSection>
      );

    case 'splitter':
      return (
        <ExampleSection title="Splitter">
          <Splitter style={{ height: 300, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
            <Splitter.Panel defaultSize="40%" min="20%" max="70%">
              <div style={{ padding: 24, height: '100%', backgroundColor: '#f0f2f5' }}>
                <p>Left Panel</p>
                <p>Resizable</p>
              </div>
            </Splitter.Panel>
            <Splitter.Panel>
              <div style={{ padding: 24, height: '100%', backgroundColor: '#e6f7ff' }}>
                <p>Right Panel</p>
                <p>Resizable</p>
              </div>
            </Splitter.Panel>
          </Splitter>
        </ExampleSection>
      );

    case 'stack':
      return (
        <>
          <ExampleSection title="Stack - Vertical Spacing">
            <Stack spacing={16}>
              <Button>Item 1</Button>
              <Button>Item 2</Button>
              <Button>Item 3</Button>
            </Stack>
          </ExampleSection>
          <ExampleSection title="Stack - With Alignment">
            <Stack spacing={8} align="center" style={{ width: '100%' }}>
              <Button type="primary">Centered Item 1</Button>
              <Button>Centered Item 2</Button>
            </Stack>
          </ExampleSection>
        </>
      );

    case 'slider':
      return (
        <>
          <ExampleSection title="Básico">
            {Slider && <Slider defaultValue={30} />}
          </ExampleSection>
          <ExampleSection title="Range">
            {Slider && <Slider range defaultValue={[20, 50]} />}
          </ExampleSection>
        </>
      );

    case 'select':
      return (
        <>
          <ExampleSection title="Básico">
            {Select && (
              <Space direction="vertical" style={{ width: '200px' }}>
                <Select
                  placeholder="Select option"
                  options={[
                    { value: 'jack', label: 'Jack' },
                    { value: 'lucy', label: 'Lucy' },
                    { value: 'tom', label: 'Tom' },
                  ]}
                  style={{ width: '100%' }}
                />
              </Space>
            )}
          </ExampleSection>
        </>
      );

    // ===== MORE INPUTS =====
    case 'autocomplete':
      return (
        <ExampleSection title="AutoComplete">
          {AutoComplete && (
            <AutoComplete
              style={{ width: 200 }}
              placeholder="input here"
              options={[
                { value: 'Option 1' },
                { value: 'Option 2' },
                { value: 'Option 3' },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'cascader':
      return (
        <ExampleSection title="Cascader">
          {Cascader && (
            <Cascader
              style={{ width: 200 }}
              options={[
                {
                  value: 'zhejiang',
                  label: 'Zhejiang',
                  children: [
                    {
                      value: 'hangzhou',
                      label: 'Hangzhou',
                    },
                  ],
                },
                {
                  value: 'jiangsu',
                  label: 'Jiangsu',
                  children: [
                    {
                      value: 'nanjing',
                      label: 'Nanjing',
                    },
                  ],
                },
              ]}
              placeholder="Please select"
            />
          )}
        </ExampleSection>
      );

    case 'colorpicker':
      return (
        <ExampleSection title="ColorPicker">
          {ColorPicker && (
            <Space>
              <ColorPicker defaultValue="#1890ff" />
              <ColorPicker defaultValue="#52c41a" />
              <ColorPicker defaultValue="#faad14" />
            </Space>
          )}
        </ExampleSection>
      );

    case 'datepicker':
      return (
        <>
          <ExampleSection title="Básico">
            {DatePicker && (
              <Space direction="vertical">
                <DatePicker />
                <DatePicker picker="week" />
                <DatePicker picker="month" />
                <DatePicker picker="year" />
              </Space>
            )}
          </ExampleSection>
          <ExampleSection title="Range Picker">
            {DatePicker && <DatePicker.RangePicker />}
          </ExampleSection>
        </>
      );

    case 'timepicker':
      return (
        <ExampleSection title="TimePicker">
          {TimePicker && (
            <Space>
              <TimePicker />
              <TimePicker use12Hours format="h:mm a" />
            </Space>
          )}
        </ExampleSection>
      );

    case 'form':
      return (
        <ExampleSection title="Form">
          {Form && Input && Button && (
            <Form
              name="basic"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          )}
        </ExampleSection>
      );

    case 'inputnumber':
      return (
        <ExampleSection title="InputNumber">
          {InputNumber && (
            <Space>
              <InputNumber min={1} max={10} defaultValue={3} />
              <InputNumber defaultValue={1000} formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              <InputNumber defaultValue={100} min={0} max={100} suffix="%" />
            </Space>
          )}
        </ExampleSection>
      );

    case 'mentions':
      return (
        <ExampleSection title="Mentions">
          {Mentions && (
            <Mentions
              style={{ width: '100%' }}
              placeholder="@someone"
              options={[
                { value: 'afc163', label: 'afc163' },
                { value: 'zombieJ', label: 'zombieJ' },
                { value: 'yesmeck', label: 'yesmeck' },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'rate':
      return (
        <>
          <ExampleSection title="Básico">
            {Rate && (
              <Space direction="vertical">
                <Rate />
                <Rate defaultValue={3} />
                <Rate allowHalf defaultValue={2.5} />
                <Rate disabled defaultValue={2} />
              </Space>
            )}
          </ExampleSection>
        </>
      );

    case 'transfer':
      return (
        <ExampleSection title="Transfer">
          {Transfer && (
            <Transfer
              dataSource={[
                { key: '1', title: 'Item 1' },
                { key: '2', title: 'Item 2' },
                { key: '3', title: 'Item 3' },
                { key: '4', title: 'Item 4' },
                { key: '5', title: 'Item 5' },
              ]}
              targetKeys={['2', '4']}
              render={(item) => item.title}
            />
          )}
        </ExampleSection>
      );

    case 'treeselect':
      return (
        <ExampleSection title="TreeSelect">
          {TreeSelect && (
            <TreeSelect
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="Please select"
              treeData={[
                {
                  title: 'Node1',
                  value: '0-0',
                  children: [
                    { title: 'Child Node1', value: '0-0-1' },
                    { title: 'Child Node2', value: '0-0-2' },
                  ],
                },
                {
                  title: 'Node2',
                  value: '0-1',
                  children: [
                    { title: 'Child Node3', value: '0-1-1' },
                    { title: 'Child Node4', value: '0-1-2' },
                  ],
                },
              ]}
            />
          )}
        </ExampleSection>
      );

    case 'upload':
      return (
        <ExampleSection title="Upload">
          {Upload && Button && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload>
                <Button>Click to Upload</Button>
              </Upload>
              <Upload listType="picture">
                <Button>Upload Picture</Button>
              </Upload>
            </Space>
          )}
        </ExampleSection>
      );

    default:
      return (
        <ExampleSection title="Componente no implementado">
          <Alert
            message={`El componente "${component}" aún no tiene ejemplos implementados`}
            description="Este componente está disponible en la librería pero los ejemplos del dashboard están pendientes."
            type="info"
            showIcon
          />
        </ExampleSection>
      );
  }
}

// ===== Interactive Example Components =====

function DrawerExample() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'right' | 'bottom' | 'left'>('right');
  const { Drawer, Button, Space, Radio } = Components;

  return (
    <>
      <ExampleSection title="Drawer Interactivo">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text style={{ marginRight: '8px' }}>Placement:</Text>
            <Radio.Group value={placement} onChange={(e) => setPlacement(e.target.value)}>
              <Radio value="top">Top</Radio>
              <Radio value="right">Right</Radio>
              <Radio value="bottom">Bottom</Radio>
              <Radio value="left">Left</Radio>
            </Radio.Group>
          </div>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open Drawer
          </Button>
        </Space>
      </ExampleSection>

      {Drawer && (
        <Drawer
          title="Basic Drawer"
          placement={placement}
          onClose={() => setOpen(false)}
          open={open}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
      )}
    </>
  );
}

function ModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { Modal, Button, Space } = Components;

  const showConfirm = () => {
    Modal?.confirm({
      title: 'Do you want to delete these items?',
      content: 'This action cannot be undone',
      onOk() {
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const showSuccess = () => {
    Modal?.success({
      content: 'Operation completed successfully!',
    });
  };

  const showError = () => {
    Modal?.error({
      title: 'This is an error message',
      content: 'Something went wrong',
    });
  };

  return (
    <>
      <ExampleSection title="Modal Básico">
        <Space wrap>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
          <Button onClick={showConfirm}>Confirm</Button>
          <Button onClick={showSuccess}>Success</Button>
          <Button onClick={showError}>Error</Button>
        </Space>
      </ExampleSection>

      {Modal && (
        <Modal
          title="Basic Modal"
          open={isModalOpen}
          onOk={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      )}
    </>
  );
}

function MessageExample() {
  const { message, Button, Space } = Components;

  const showSuccess = () => {
    message?.success('This is a success message');
  };

  const showError = () => {
    message?.error('This is an error message');
  };

  const showWarning = () => {
    message?.warning('This is a warning message');
  };

  const showInfo = () => {
    message?.info('This is an info message');
  };

  const showLoading = () => {
    message?.loading('Action in progress..', 2.5);
  };

  return (
    <ExampleSection title="Message Tipos">
      <Space wrap>
        <Button onClick={showSuccess}>Success</Button>
        <Button onClick={showError}>Error</Button>
        <Button onClick={showWarning}>Warning</Button>
        <Button onClick={showInfo}>Info</Button>
        <Button onClick={showLoading}>Loading</Button>
      </Space>
    </ExampleSection>
  );
}

function NotificationExample() {
  const { notification, Button, Space } = Components;

  const openNotification = (type: 'success' | 'info' | 'warning' | 'error') => {
    notification?.[type]({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      description: 'This is the content of the notification. This is the content of the notification.',
      placement: 'topRight',
    });
  };

  return (
    <ExampleSection title="Notification Tipos">
      <Space wrap>
        <Button onClick={() => openNotification('success')}>Success</Button>
        <Button onClick={() => openNotification('info')}>Info</Button>
        <Button onClick={() => openNotification('warning')}>Warning</Button>
        <Button onClick={() => openNotification('error')}>Error</Button>
      </Space>
    </ExampleSection>
  );
}

// Componente helper para secciones de ejemplos
function ExampleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '24px',
      background: '#fafafa',
      borderRadius: '8px',
      border: '1px solid #f0f0f0'
    }}>
      <Title level={5} style={{ marginBottom: '16px' }}>
        {title}
      </Title>
      {children}
    </div>
  );
}
