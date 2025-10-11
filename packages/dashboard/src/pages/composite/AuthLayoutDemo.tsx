import React from 'react';
import { Card, Space, Typography, Form, Input, Button, Checkbox } from 'antd';
import { AuthLayout } from '@es-rottay/designsystem-core';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export const AuthLayoutDemo: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>AuthLayout Component</Title>
          <Paragraph>
            Componente de layout para páginas de autenticación. Cambia el tema para ver diferentes estilos de card, sombras y bordes.
          </Paragraph>
        </div>

        {/* Theme Comparison Guide */}
        <Card title="🎨 Estilos por Tema">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Diferencias visuales por tema:</Text>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Spotify:</strong> Sombra intensa (dark theme), borderRadius 8px</li>
              <li><strong>Stripe:</strong> Sombra suave profesional, borderRadius 8px, borde sutil</li>
              <li><strong>Notion:</strong> Box-shadow signature de Notion, borderRadius 3px (minimal)</li>
              <li><strong>Linear:</strong> Sombra moderna, borderRadius 12px, borde fino</li>
              <li><strong>Base:</strong> Sombra estándar, borderRadius default</li>
            </ul>
            <Text type="secondary">💡 Cambia el tema en el selector superior para ver las diferencias</Text>
          </Space>
        </Card>

        {/* Demo Cards */}
        <Title level={3}>Demos Interactivos</Title>

        {/* Solid Background */}
        <Card title="1. Login - Background Sólido">
          <div style={{ height: '500px', position: 'relative', background: '#f0f2f5', borderRadius: '8px', overflow: 'hidden' }}>
            <AuthLayout
              title="Bienvenido de vuelta"
              subtitle="Inicia sesión en tu cuenta"
              logoSrc="https://via.placeholder.com/120x40/1890ff/ffffff?text=Logo"
              backgroundVariant="solid"
              maxWidth={400}
            >
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: 'Email requerido' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Contraseña requerida' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
                </Form.Item>

                <Form.Item>
                  <Checkbox>Recordarme</Checkbox>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block size="large">
                    Iniciar Sesión
                  </Button>
                </Form.Item>
              </Form>
            </AuthLayout>
          </div>
        </Card>

        {/* Gradient Background */}
        <Card title="2. Login - Background Gradient">
          <div style={{ height: '500px', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
            <AuthLayout
              title="Únete a nosotros"
              subtitle="Crea tu cuenta gratis"
              backgroundVariant="gradient"
              maxWidth={380}
              showBackLink
              backLinkText="← Volver al inicio"
            >
              <Form layout="vertical">
                <Form.Item label="Nombre completo">
                  <Input placeholder="John Doe" size="large" />
                </Form.Item>

                <Form.Item label="Email">
                  <Input type="email" placeholder="john@example.com" size="large" />
                </Form.Item>

                <Form.Item label="Contraseña">
                  <Input.Password placeholder="••••••••" size="large" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" block size="large">
                    Crear Cuenta
                  </Button>
                </Form.Item>
              </Form>
            </AuthLayout>
          </div>
        </Card>

        {/* None Background */}
        <Card title="3. Login - Sin Background (Transparente)">
          <div style={{ height: '500px', position: 'relative', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', overflow: 'hidden' }}>
            <AuthLayout
              title="Restablecer Contraseña"
              subtitle="Te enviaremos un enlace para restablecer tu contraseña"
              backgroundVariant="none"
              maxWidth={420}
              showBackLink
              footer={
                <Text style={{ fontSize: '12px', color: '#999' }}>
                  ¿Recuerdas tu contraseña? <a href="#">Inicia sesión</a>
                </Text>
              }
            >
              <Form layout="vertical">
                <Form.Item>
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Ingresa tu email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" block size="large">
                    Enviar Enlace
                  </Button>
                </Form.Item>
              </Form>
            </AuthLayout>
          </div>
        </Card>

        {/* Visual Comparison */}
        <Card title="4. Comparación de Estilos de Card">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Text>
              Los cards de autenticación cambian su apariencia según el tema activo.
              Observa especialmente:
            </Text>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Box Shadow:</strong> Intensidad y tipo de sombra</li>
              <li><strong>Border Radius:</strong> Qué tan redondeadas son las esquinas</li>
              <li><strong>Borders:</strong> Algunos temas agregan bordes sutiles</li>
            </ul>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginTop: '16px'
            }}>
              {['Spotify', 'Stripe', 'Notion', 'Linear'].map(theme => (
                <div key={theme} style={{
                  padding: '16px',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Text strong>{theme}</Text>
                  <Paragraph type="secondary" style={{ fontSize: '12px', marginTop: '8px' }}>
                    {theme === 'Spotify' && 'Sombra intensa oscura'}
                    {theme === 'Stripe' && 'Sombra suave + borde'}
                    {theme === 'Notion' && 'Box-shadow signature'}
                    {theme === 'Linear' && 'BorderRadius 12px'}
                  </Paragraph>
                </div>
              ))}
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
{`import { AuthLayout } from '@es-rottay/designsystem-core';

<AuthLayout
  title="Bienvenido"
  subtitle="Inicia sesión"
  backgroundVariant="gradient"
  maxWidth={400}
>
  {/* Tu formulario aquí */}
</AuthLayout>`}
          </pre>
        </Card>
      </Space>
    </div>
  );
};
