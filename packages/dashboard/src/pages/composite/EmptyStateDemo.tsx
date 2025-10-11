import React from 'react';
import { Card, Space, Typography, Button, Row, Col } from 'antd';
import { EmptyState } from '@es-rottay/designsystem-core';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export const EmptyStateDemo: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>EmptyState Component</Title>
          <Paragraph>
            Componente para estados vacíos con diferentes variantes. Los iconos se ajustan de tamaño según el tema activo.
          </Paragraph>
        </div>

        {/* Theme Comparison Guide */}
        <Card title="🎨 Estilos por Tema - Icon Sizes">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Los iconos cambian de tamaño según el tema:</Text>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Spotify:</strong> 110% del tamaño base (más grande para dark theme)</li>
              <li><strong>Notion:</strong> 90% del tamaño base (más pequeño para minimal theme)</li>
              <li><strong>Otros temas:</strong> Tamaño base (100%)</li>
            </ul>
            <Text type="secondary">💡 Cambia entre Spotify y Notion para ver la diferencia más notable</Text>
          </Space>
        </Card>

        {/* Demo Grid */}
        <Title level={3}>Variantes de Estados Vacíos</Title>

        <Row gutter={[16, 16]}>
          {/* No Data */}
          <Col xs={24} lg={12}>
            <Card title="1. No Data">
              <EmptyState
                variant="no-data"
                size="md"
                actions={[
                  {
                    label: 'Agregar Datos',
                    type: 'primary',
                    icon: <PlusOutlined />,
                    onClick: () => alert('Agregar datos'),
                  },
                ]}
              />
            </Card>
          </Col>

          {/* No Results */}
          <Col xs={24} lg={12}>
            <Card title="2. No Results">
              <EmptyState
                variant="no-results"
                size="md"
                actions={[
                  {
                    label: 'Limpiar Filtros',
                    type: 'default',
                    onClick: () => alert('Filtros limpiados'),
                  },
                ]}
              />
            </Card>
          </Col>

          {/* Error */}
          <Col xs={24} lg={12}>
            <Card title="3. Error State">
              <EmptyState
                variant="error"
                size="md"
                actions={[
                  {
                    label: 'Reintentar',
                    type: 'primary',
                    icon: <ReloadOutlined />,
                    onClick: () => alert('Reintentando...'),
                  },
                ]}
              />
            </Card>
          </Col>

          {/* 404 */}
          <Col xs={24} lg={12}>
            <Card title="4. Page Not Found (404)">
              <EmptyState
                variant="404"
                size="md"
                actions={[
                  {
                    label: 'Volver al Inicio',
                    type: 'primary',
                    onClick: () => alert('Volver'),
                  },
                ]}
              />
            </Card>
          </Col>

          {/* Offline */}
          <Col xs={24} lg={12}>
            <Card title="5. Offline State">
              <EmptyState
                variant="offline"
                size="md"
                actions={[
                  {
                    label: 'Reintentar',
                    type: 'primary',
                    icon: <ReloadOutlined />,
                    onClick: () => alert('Reintentando conexión...'),
                  },
                ]}
              />
            </Card>
          </Col>

          {/* Maintenance */}
          <Col xs={24} lg={12}>
            <Card title="6. Maintenance Mode">
              <EmptyState
                variant="maintenance"
                size="md"
              />
            </Card>
          </Col>
        </Row>

        {/* Size Comparison */}
        <Card title="📏 Comparación de Tamaños">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div style={{ background: '#fafafa', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <Text strong>Small</Text>
                <EmptyState variant="no-data" size="sm" />
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ background: '#fafafa', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <Text strong>Medium (Default)</Text>
                <EmptyState variant="no-data" size="md" />
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ background: '#fafafa', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <Text strong>Large</Text>
                <EmptyState variant="no-data" size="lg" />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Theme Icon Size Comparison */}
        <Card title="🎨 Comparación de Tamaños por Tema">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              Cambia entre estos temas para ver las diferencias de tamaño de iconos:
            </Paragraph>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ padding: '16px', background: '#121212', borderRadius: '8px', textAlign: 'center' }}>
                <Text strong style={{ color: '#1DB954' }}>Spotify</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: '#B3B3B3' }}>Icons 110% larger</Text>
                <div style={{ marginTop: '8px', color: '#666' }}>🔍 ↑</div>
              </div>

              <div style={{ padding: '16px', background: '#FFFFFF', borderRadius: '3px', textAlign: 'center', border: '1px solid #E3E2E0' }}>
                <Text strong>Notion</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>Icons 90% smaller</Text>
                <div style={{ marginTop: '8px' }}>🔍 ↓</div>
              </div>

              <div style={{ padding: '16px', background: '#FAFAFA', borderRadius: '6px', textAlign: 'center' }}>
                <Text strong style={{ color: '#635BFF' }}>Stripe/Others</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>Icons at 100% (base)</Text>
                <div style={{ marginTop: '8px' }}>🔍 =</div>
              </div>
            </div>
          </Space>
        </Card>

        {/* Custom Content */}
        <Card title="7. Custom Title & Description">
          <EmptyState
            variant="no-data"
            title="No tienes proyectos todavía"
            description="Crea tu primer proyecto para empezar a trabajar con tu equipo"
            size="lg"
            actions={[
              {
                label: 'Crear Proyecto',
                type: 'primary',
                icon: <PlusOutlined />,
                onClick: () => alert('Crear proyecto'),
              },
              {
                label: 'Ver Plantillas',
                type: 'default',
                onClick: () => alert('Ver plantillas'),
              },
            ]}
          />
        </Card>

        {/* Usage Code */}
        <Card title="📝 Código de Ejemplo">
          <pre style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto'
          }}>
{`import { EmptyState } from '@es-rottay/designsystem-core';

<EmptyState
  variant="no-data"
  size="md"
  actions={[
    {
      label: 'Agregar Datos',
      type: 'primary',
      icon: <PlusOutlined />,
      onClick: () => handleAddData(),
    },
  ]}
/>`}
          </pre>
        </Card>
      </Space>
    </div>
  );
};
