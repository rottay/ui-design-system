import React from 'react';
import { Row, Col, Space, Typography, Divider } from 'antd';
import { DashboardCard, EmptyState, PageHeader } from '@es-rottay/designsystem-core';
import { TrendingUp, Users, DollarSign, Activity, ShoppingCart } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

export const Overview: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Design System Showcase"
        subtitle="Sistema de diseño multi-tema basado en Ant Design. Los componentes cambian automáticamente según el tema seleccionado."
        breadcrumbs={[
          { title: 'Home' },
          { title: 'Overview' },
        ]}
      />

      <div style={{ padding: '32px' }}>
        {/* Stats Cards */}
        <Title level={3}>📊 Dashboard Cards (Theme-Aware)</Title>
        <Paragraph type="secondary">
          Estos cards cambian de color, tamaño, padding y sombras según el tema activo.
          Prueba cambiando entre Spotify (dark), Stripe, Notion y Linear.
        </Paragraph>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <DashboardCard
              title="Total Revenue"
              value="$45,231"
              trend={{
                direction: 'up',
                value: 12.5,
                label: 'from last month',
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
                label: 'from last week',
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
                label: 'from yesterday',
              }}
              color="warning"
              icon={<ShoppingCart size={24} />}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <DashboardCard
              title="Conversion Rate"
              value="3.24%"
              trend={{
                direction: 'up',
                value: 5.7,
                label: 'from last month',
              }}
              color="info"
              icon={<Activity size={24} />}
            />
          </Col>
        </Row>

        <Divider style={{ margin: '48px 0' }} />

        {/* Empty States */}
        <Title level={3}>🎨 Empty States (Theme-Aware)</Title>
        <Paragraph type="secondary">
          Los iconos y estilos cambian de tamaño según el tema. Spotify tiene iconos más grandes, Notion más pequeños.
        </Paragraph>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} md={8}>
            <EmptyState
              variant="no-data"
              size="md"
            />
          </Col>

          <Col xs={24} md={8}>
            <EmptyState
              variant="no-results"
              size="md"
            />
          </Col>

          <Col xs={24} md={8}>
            <EmptyState
              variant="error"
              size="md"
            />
          </Col>
        </Row>

        <Divider style={{ margin: '48px 0' }} />

        {/* Theme Instructions */}
        <Title level={3}>🎯 Cómo Ver los Cambios de Tema</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>1. Usa el Theme Switcher arriba para cambiar temas</Text>
            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              Selecciona diferentes temas desde el selector en la parte superior de la barra lateral.
            </Paragraph>
          </div>

          <div>
            <Text strong>2. Observa los cambios OBVIOS:</Text>
            <ul style={{ marginTop: 8 }}>
              <li>
                <Text strong>Spotify:</Text> Fondo NEGRO (#121212), bordes redondeados 8px, sombras intensas, iconos grandes
              </li>
              <li>
                <Text strong>Stripe:</Text> Fondo GRIS CLARO (#FAFAFA), bordes 6px, sombras sutiles, estilo profesional
              </li>
              <li>
                <Text strong>Notion:</Text> Fondo BLANCO (#FFFFFF), bordes cuadrados 3px, minimal, iconos pequeños
              </li>
              <li>
                <Text strong>Linear:</Text> Fondo GRIS (#F9FAFB), bordes muy redondeados 12px, moderno
              </li>
            </ul>
          </div>

          <div>
            <Text strong>3. Explora más componentes:</Text>
            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              Ve a la sección "🎨 Composite (Theme-Aware)" en el menú lateral para ver demos detalladas de:
            </Paragraph>
            <ul>
              <li>AuthLayout - Layouts de autenticación</li>
              <li>DataTable - Tablas con búsqueda y filtros</li>
              <li>EmptyState - Estados vacíos con variantes</li>
            </ul>
          </div>
        </Space>

        <Divider style={{ margin: '48px 0' }} />

        {/* Component Categories */}
        <Title level={3}>📦 Componentes Disponibles</Title>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={8}>
            <div style={{
              padding: 24,
              backgroundColor: 'rgba(24, 144, 255, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(24, 144, 255, 0.3)'
            }}>
              <Title level={4} style={{ color: '#1890ff', margin: 0 }}>🎨 Composite</Title>
              <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
                8 componentes theme-aware
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <div style={{
              padding: 24,
              backgroundColor: 'rgba(82, 196, 26, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(82, 196, 26, 0.3)'
            }}>
              <Title level={4} style={{ color: '#52c41a', margin: 0 }}>📺 Display</Title>
              <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
                17 componentes
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <div style={{
              padding: 24,
              backgroundColor: 'rgba(250, 140, 22, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(250, 140, 22, 0.3)'
            }}>
              <Title level={4} style={{ color: '#fa8c16', margin: 0 }}>💬 Feedback</Title>
              <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
                9 componentes
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <div style={{
              padding: 24,
              backgroundColor: 'rgba(114, 46, 209, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(114, 46, 209, 0.3)'
            }}>
              <Title level={4} style={{ color: '#722ed1', margin: 0 }}>📝 Inputs</Title>
              <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
                17 componentes
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <div style={{
              padding: 24,
              backgroundColor: 'rgba(235, 47, 150, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(235, 47, 150, 0.3)'
            }}>
              <Title level={4} style={{ color: '#eb2f96', margin: 0 }}>🏗️ Layout</Title>
              <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
                9 componentes
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <div style={{
              padding: 24,
              backgroundColor: 'rgba(19, 194, 194, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(19, 194, 194, 0.3)'
            }}>
              <Title level={4} style={{ color: '#13c2c2', margin: 0 }}>🧭 Navigation</Title>
              <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
                11 componentes
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
