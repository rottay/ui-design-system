import React, { useState } from 'react';
import { Space, Card, Row, Col, Button, Divider, Typography, message } from 'antd';
import {
  DashboardCard,
  PageHeader,
  EmptyState,
  DataTable,
  FormBuilder,
  SearchableSelect,
  DashboardLayout,
} from '@es-rottay/designsystem-core';
import {
  Users, DollarSign, ShoppingCart, Activity,
  Plus, Download, Edit, Trash2
} from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

export const AllComposites: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);

  // Mock data for DataTable
  const tableData = [
    {
      key: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      role: 'Admin',
    },
    {
      key: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'active',
      role: 'User',
    },
    {
      key: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'inactive',
      role: 'User',
    },
  ];

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
  ];

  // Mock data for SearchableSelect
  const userOptions = [
    { label: 'John Doe', value: '1' },
    { label: 'Jane Smith', value: '2' },
    { label: 'Bob Johnson', value: '3' },
    { label: 'Alice Williams', value: '4' },
  ];

  // Form fields for FormBuilder
  const formFields = [
    {
      name: 'username',
      label: 'Username',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter username',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true,
      placeholder: 'Enter email',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Guest', value: 'guest' },
      ],
    },
    {
      name: 'bio',
      label: 'Biography',
      type: 'textarea' as const,
      placeholder: 'Tell us about yourself',
    },
  ];

  return (
    <div>
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Todos los Componentes Composite"
        subtitle="Estos componentes cambian completamente según el tema seleccionado. Cambia el tema arriba para ver las diferencias."
        breadcrumbs={[
          { title: 'Home' },
          { title: 'Composite' },
          { title: 'All Components' },
        ]}
        actions={
          <Space>
            <Button type="primary" icon={<Plus size={16} />}>
              New Item
            </Button>
            <Button icon={<Download size={16} />}>
              Export
            </Button>
          </Space>
        }
      />

      <div style={{ padding: '32px' }}>
        {/* Instructions */}
        <Card style={{ marginBottom: 32, borderLeft: '4px solid #1890ff' }}>
          <Title level={4}>🎯 Instrucciones</Title>
          <Paragraph>
            <Text strong>Cambia el tema en el selector arriba</Text> y observa cómo TODOS estos componentes cambian:
          </Paragraph>
          <ul>
            <li><Text code>Spotify</Text> → Fondo NEGRO (#121212), sombras intensas, bordes 8px</li>
            <li><Text code>Stripe</Text> → Fondo GRIS (#FAFAFA), sombras sutiles, bordes 6px</li>
            <li><Text code>Notion</Text> → Fondo BLANCO (#FFFFFF), minimal, bordes cuadrados 3px</li>
            <li><Text code>Linear</Text> → Fondo GRIS MODERNO (#F9FAFB), bordes muy redondeados 12px</li>
          </ul>
        </Card>

        {/* 2. DASHBOARD CARDS */}
        <Title level={3}>1. DashboardCard</Title>
        <Paragraph type="secondary">
          Cards con estadísticas. Observa cómo cambian backgrounds, borders, padding y tamaños de icono.
        </Paragraph>
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          <Col xs={24} sm={12} lg={6}>
            <DashboardCard
              title="Total Revenue"
              value="$45,231"
              trend={{
                direction: 'up',
                value: 12.5,
                label: 'vs last month',
              }}
              color="primary"
              icon={<DollarSign size={24} />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <DashboardCard
              title="Active Users"
              value="2,350"
              trend={{
                direction: 'up',
                value: 8.2,
                label: 'vs last week',
              }}
              color="success"
              icon={<Users size={24} />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <DashboardCard
              title="Total Orders"
              value="1,234"
              trend={{
                direction: 'down',
                value: -3.1,
                label: 'vs yesterday',
              }}
              color="warning"
              icon={<ShoppingCart size={24} />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <DashboardCard
              title="Conversion"
              value="3.24%"
              trend={{
                direction: 'up',
                value: 5.7,
                label: 'vs last month',
              }}
              color="info"
              icon={<Activity size={24} />}
            />
          </Col>
        </Row>

        <Divider />

        {/* 3. DATA TABLE */}
        <Title level={3}>2. DataTable</Title>
        <Paragraph type="secondary">
          Tabla con selección y búsqueda. El badge de selección cambia de estilo según el tema.
        </Paragraph>
        <DataTable
          columns={tableColumns}
          dataSource={tableData}
          rowSelection={{
            selectedRowKeys: selectedRows,
            onChange: (keys) => setSelectedRows(keys),
          }}
          searchable
          searchPlaceholder="Search users..."
          actions={
            <Space>
              <Button type="primary" icon={<Plus size={16} />}>
                Add User
              </Button>
              <Button icon={<Download size={16} />}>
                Export
              </Button>
            </Space>
          }
          style={{ marginBottom: 48 }}
        />

        <Divider />

        {/* 4. FORM BUILDER */}
        <Title level={3}>3. FormBuilder</Title>
        <Paragraph type="secondary">
          Formulario dinámico. Observa cómo el container, labels y padding cambian por tema.
        </Paragraph>
        <Row gutter={24} style={{ marginBottom: 48 }}>
          <Col xs={24} lg={12}>
            <FormBuilder
              fields={formFields}
              onSubmit={(values) => {
                console.log('Form submitted:', values);
                message.success('Form submitted successfully!');
              }}
              submitText="Create User"
              showReset
            />
          </Col>
          <Col xs={24} lg={12}>
            <Card>
              <Title level={5}>4. SearchableSelect</Title>
              <Paragraph type="secondary">
                Select con búsqueda. Los borders cambian según el tema.
              </Paragraph>
              <SearchableSelect
                options={userOptions}
                placeholder="Search users..."
                style={{ width: '100%' }}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* 5. EMPTY STATES */}
        <Title level={3}>5. EmptyState</Title>
        <Paragraph type="secondary">
          Estados vacíos. Los iconos cambian de tamaño: Spotify (grandes), Notion (pequeños).
        </Paragraph>
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          <Col xs={24} md={8}>
            <EmptyState variant="no-data" size="md" />
          </Col>
          <Col xs={24} md={8}>
            <EmptyState variant="no-results" size="md" />
          </Col>
          <Col xs={24} md={8}>
            <EmptyState variant="error" size="md" />
          </Col>
        </Row>

        <Divider />

        {/* Summary */}
        <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            ✨ Todos los componentes están actualizados
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0, marginTop: 8 }}>
            Cambia el tema y observa cómo CADA componente cambia su apariencia:
            backgrounds, borders, shadows, padding, tamaños de fuente, y más.
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};
