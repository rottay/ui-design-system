import React from 'react';
import { Card, Space, Typography, Tag, Button } from 'antd';
import { DataTable } from '@es-rottay/designsystem-core';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface User {
  key: string;
  name: string;
  age: number;
  email: string;
  status: 'active' | 'inactive';
  role: string;
}

const sampleData: User[] = [
  { key: '1', name: 'John Doe', age: 32, email: 'john@example.com', status: 'active', role: 'Admin' },
  { key: '2', name: 'Jane Smith', age: 28, email: 'jane@example.com', status: 'active', role: 'User' },
  { key: '3', name: 'Bob Johnson', age: 45, email: 'bob@example.com', status: 'inactive', role: 'User' },
  { key: '4', name: 'Alice Williams', age: 35, email: 'alice@example.com', status: 'active', role: 'Editor' },
  { key: '5', name: 'Charlie Brown', age: 50, email: 'charlie@example.com', status: 'active', role: 'Admin' },
];

export const DataTableDemo: React.FC = () => {
  const columns: any[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      sorter: (a: User, b: User) => a.name.localeCompare(b.name),
    },
    {
      key: 'age',
      title: 'Age',
      dataIndex: 'age',
      sorter: (a: User, b: User) => a.age - b.age,
      width: 100,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      render: (role: string) => (
        <Tag color={role === 'Admin' ? 'blue' : role === 'Editor' ? 'purple' : 'default'}>
          {role}
        </Tag>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />} />
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>DataTable Component</Title>
          <Paragraph>
            Tabla de datos con búsqueda, exportación y selección. El badge de selección cambia de estilo según el tema activo.
          </Paragraph>
        </div>

        {/* Theme Comparison Guide */}
        <Card title="🎨 Estilos por Tema - Selection Info Badge">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>El badge de información de selección cambia según el tema:</Text>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Spotify:</strong> BorderRadius 8px, sombra pronunciada para dark theme</li>
              <li><strong>Stripe:</strong> BorderRadius 6px, sombra suave profesional</li>
              <li><strong>Notion:</strong> BorderRadius 3px, box-shadow signature de Notion</li>
              <li><strong>Linear:</strong> BorderRadius 8px, borde fino moderno</li>
              <li><strong>Base:</strong> BorderRadius 4px, estilo estándar</li>
            </ul>
            <Text type="secondary">💡 Selecciona filas en la tabla para ver el badge con estilos diferentes por tema</Text>
          </Space>
        </Card>

        {/* Demo 1: With Selection */}
        <Card title="1. Tabla con Selección (Observa el Badge)">
          <Paragraph type="secondary">
            Selecciona algunas filas para ver el badge de información. El estilo del badge cambia según el tema activo.
          </Paragraph>
          <DataTable
            columns={columns}
            data={sampleData}
            showSelection
            onSelectionChange={(keys, rows) => console.log('Selected:', keys, rows)}
          />
        </Card>

        {/* Demo 2: With All Features */}
        <Card title="2. Tabla Completa (Búsqueda + Export + Selección)">
          <DataTable
            columns={columns}
            data={sampleData}
            showSearch
            showExport
            showSelection
            onSearch={(value) => console.log('Search:', value)}
            onExport={() => alert('Exporting data...')}
            onSelectionChange={(keys) => console.log('Selected:', keys)}
          />
        </Card>

        {/* Demo 3: Large Dataset */}
        <Card title="3. Dataset Grande">
          <Paragraph type="secondary">
            Tabla con más datos para mostrar paginación. Selecciona múltiples filas.
          </Paragraph>
          <DataTable
            columns={columns}
            data={[...sampleData, ...sampleData, ...sampleData]}
            showSelection
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* Visual Comparison */}
        <Card title="📊 Comparación de Estilos">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>
              El badge de selección es el elemento más visible que cambia con los temas.
              Observa estos detalles al cambiar de tema:
            </Text>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Border Radius:</strong> Varía entre 3px (Notion) y 8px (Spotify/Linear)</li>
              <li><strong>Box Shadow:</strong> Desde sutil (Stripe) hasta pronunciada (Spotify)</li>
              <li><strong>Borders:</strong> Algunos temas usan bordes, otros solo sombras</li>
            </ul>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '16px'
            }}>
              <div style={{ padding: '12px', background: '#f0f7ff', borderRadius: '4px', border: '1px solid #91d5ff' }}>
                <Text strong>Base</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>BorderRadius: 4px</Text>
              </div>

              <div style={{ padding: '12px', background: '#f0f7ff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                <Text strong>Spotify</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>BorderRadius: 8px + Shadow</Text>
              </div>

              <div style={{ padding: '12px', background: '#f0f7ff', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <Text strong>Stripe</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>BorderRadius: 6px + Subtle shadow</Text>
              </div>

              <div style={{ padding: '12px', background: '#f0f7ff', borderRadius: '3px', boxShadow: 'rgba(15,15,15,0.05) 0px 0px 0px 1px' }}>
                <Text strong>Notion</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>BorderRadius: 3px + Line</Text>
              </div>
            </div>
          </Space>
        </Card>

        {/* Usage Code */}
        <Card title="📝 Código de Ejemplo">
          <pre style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto'
          }}>
{`import { DataTable } from '@es-rottay/designsystem-core';

<DataTable
  columns={columns}
  data={data}
  showSearch
  showExport
  showSelection
  onSelectionChange={(keys, rows) => {
    console.log('Selected:', keys, rows);
  }}
/>`}
          </pre>
        </Card>
      </Space>
    </div>
  );
};
