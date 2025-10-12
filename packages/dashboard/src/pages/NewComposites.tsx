import React, { useState } from 'react';
import { Card, Row, Col, Typography, Divider, Space, message } from 'antd';
import {
  UserMenu,
  SearchBar,
  NotificationCenter,
  Sidebar,
  FileUploader,
  PageHeader,
} from '@es-rottay/designsystem-core';
import type {
  UserMenuItem,
  SearchResult,
  Notification as NotificationType,
  SidebarGroup,
  UploadedFile,
} from '@es-rottay/designsystem-core';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  Users,
  BarChart,
  FileText,
  Package,
  Folder,
  File as FileIcon,
} from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

export const NewComposites: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([
    {
      id: '1',
      title: 'Sarah Connor mentioned you',
      description: 'Great work on the new feature!',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      id: '2',
      title: 'John Doe assigned you a task',
      description: 'Implement user authentication flow',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: '3',
      title: 'Build completed successfully',
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: true,
      type: 'success',
    },
  ]);

  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'document.pdf',
      size: 1024000,
      type: 'application/pdf',
      status: 'done',
      url: '#',
    },
  ]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // UserMenu data
  const userMenuItems: UserMenuItem[] = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <User size={16} />,
      onClick: () => message.info('Profile clicked'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />,
      onClick: () => message.info('Settings clicked'),
    },
    {
      key: 'divider1',
      label: '',
      divider: true,
    },
    {
      key: 'help',
      label: 'Help & Support',
      icon: <HelpCircle size={16} />,
      onClick: () => message.info('Help clicked'),
    },
    {
      key: 'divider2',
      label: '',
      divider: true,
    },
    {
      key: 'logout',
      label: 'Log out',
      icon: <LogOut size={16} />,
      danger: true,
      onClick: () => message.warning('Logout clicked'),
    },
  ];

  // SearchBar data
  const searchResults: SearchResult[] = [
    {
      id: '1',
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      category: 'Pages',
      icon: <User size={20} />,
    },
    {
      id: '2',
      title: 'Dashboard',
      description: 'View analytics and metrics',
      category: 'Pages',
      icon: <BarChart size={20} />,
    },
    {
      id: '3',
      title: 'Documents',
      description: 'View and manage all documents',
      category: 'Files',
      icon: <FileText size={20} />,
    },
  ];

  // Sidebar data
  const sidebarGroups: SidebarGroup[] = [
    {
      items: [
        { key: 'home', label: 'Home', icon: <Home size={18} />, path: '/' },
        { key: 'users', label: 'Users', icon: <Users size={18} />, badge: 12 },
        {
          key: 'analytics',
          label: 'Analytics',
          icon: <BarChart size={18} />,
          badge: '3',
        },
      ],
    },
    {
      title: 'Content',
      items: [
        { key: 'documents', label: 'Documents', icon: <FileText size={18} /> },
        { key: 'projects', label: 'Projects', icon: <Folder size={18} /> },
        { key: 'packages', label: 'Packages', icon: <Package size={18} /> },
      ],
    },
    {
      title: 'Settings',
      items: [
        { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
        { key: 'help', label: 'Help', icon: <HelpCircle size={18} /> },
      ],
    },
  ];

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    message.success('Notification marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    message.success('All notifications marked as read');
  };

  const handleUpload = (newFiles: File[]) => {
    const uploaded: UploadedFile[] = newFiles.map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
    }));

    setFiles([...files, ...uploaded]);

    // Simulate upload progress
    uploaded.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: 'done', progress: 100 } : f
            )
          );
          message.success(`${file.name} uploaded successfully`);
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        }
      }, 300);
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(files.filter((f) => f.id !== fileId));
    message.info('File removed');
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Nuevos Componentes Composite"
        subtitle="5 componentes avanzados theme-aware: UserMenu, SearchBar, NotificationCenter, Sidebar y FileUploader"
        breadcrumbs={[
          { title: 'Home' },
          { title: 'Composite' },
          { title: 'New Components' },
        ]}
      />

      <div style={{ padding: '32px' }}>
        {/* Instructions */}
        <Card style={{ marginBottom: 32, borderLeft: '4px solid #1890ff' }}>
          <Title level={4}>🎯 Componentes Implementados</Title>
          <Paragraph>
            Estos 5 nuevos componentes composite son <Text strong>theme-aware</Text> y
            cambian completamente según el tema seleccionado:
          </Paragraph>
          <ul>
            <li>
              <Text code>UserMenu</Text> - Menú de usuario con avatar, información y
              opciones
            </li>
            <li>
              <Text code>SearchBar</Text> - Barra de búsqueda con sugerencias y keyboard
              shortcuts
            </li>
            <li>
              <Text code>NotificationCenter</Text> - Centro de notificaciones con badges
              y timestamps
            </li>
            <li>
              <Text code>Sidebar</Text> - Sidebar colapsable con navegación y badges
            </li>
            <li>
              <Text code>FileUploader</Text> - Upload de archivos con drag & drop y
              previews
            </li>
          </ul>
        </Card>

        {/* 1. USER MENU + NOTIFICATION CENTER */}
        <Title level={3}>1. UserMenu & NotificationCenter</Title>
        <Paragraph type="secondary">
          Componentes típicos de un header de aplicación. Click para abrir el dropdown.
        </Paragraph>
        <Card style={{ marginBottom: 48 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 16,
              padding: '16px 0',
            }}
          >
            <SearchBar
              placeholder="Search pages, files..."
              results={searchResults}
              recentSearches={['dashboard', 'users', 'settings']}
              onSearch={(value) => console.log('Search:', value)}
              onSelect={(result) => message.info(`Selected: ${result.title}`)}
              style={{ flex: 1, maxWidth: 400 }}
            />

            <NotificationCenter
              notifications={notifications}
              showBadge
              onNotificationClick={(notification) =>
                message.info(`Clicked: ${notification.title}`)
              }
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClearAll={() => {
                setNotifications([]);
                message.info('All notifications cleared');
              }}
            />

            <UserMenu
              user={{
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: 'Administrator',
                avatar: 'https://i.pravatar.cc/150?img=12',
              }}
              menuItems={userMenuItems}
              showBadge
              notificationCount={3}
            />
          </div>
        </Card>

        <Divider />

        {/* 2. SEARCH BAR */}
        <Title level={3}>2. SearchBar (Standalone)</Title>
        <Paragraph type="secondary">
          Barra de búsqueda con resultados, categorías y keyboard shortcut (Ctrl+K).
        </Paragraph>
        <Card style={{ marginBottom: 48 }}>
          <SearchBar
            placeholder="Press Ctrl+K to search..."
            results={searchResults}
            recentSearches={['dashboard', 'users', 'settings', 'analytics']}
            showShortcut
            onSearch={(value) => console.log('Search:', value)}
            onSelect={(result) => message.info(`Selected: ${result.title}`)}
          />
        </Card>

        <Divider />

        {/* 3. SIDEBAR */}
        <Title level={3}>3. Sidebar</Title>
        <Paragraph type="secondary">
          Sidebar colapsable con grupos, iconos y badges. Click en los items o en el
          botón collapse.
        </Paragraph>
        <Card style={{ marginBottom: 48 }}>
          <Row gutter={24}>
            <Col xs={24} md={sidebarCollapsed ? 4 : 8}>
              <Sidebar
                groups={sidebarGroups}
                collapsed={sidebarCollapsed}
                onCollapse={setSidebarCollapsed}
                activeKey="home"
                onItemClick={(item) => message.info(`Clicked: ${item.label}`)}
                logo={
                  <div
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {sidebarCollapsed ? 'L' : 'Logo'}
                  </div>
                }
                footer={
                  !sidebarCollapsed && (
                    <div
                      style={{
                        padding: '16px',
                        borderTop: '1px solid rgba(0,0,0,0.1)',
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Version 1.0.0
                      </Text>
                    </div>
                  )
                }
              />
            </Col>
            <Col xs={24} md={sidebarCollapsed ? 20 : 16}>
              <div style={{ padding: 24, background: '#f5f5f5', borderRadius: 8 }}>
                <Title level={4}>Main Content Area</Title>
                <Paragraph>
                  Este es el área de contenido principal. El sidebar a la izquierda es
                  completamente funcional y theme-aware.
                </Paragraph>
                <Paragraph>
                  Click en el botón de la parte superior del sidebar para colapsarlo.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* 4. FILE UPLOADER */}
        <Title level={3}>4. FileUploader</Title>
        <Paragraph type="secondary">
          Upload de archivos con drag & drop, previews de imágenes y progress bars.
        </Paragraph>
        <Card style={{ marginBottom: 48 }}>
          <FileUploader
            maxFiles={10}
            maxSize={10 * 1024 * 1024} // 10MB
            accept={['image/*', 'application/pdf', '.doc', '.docx']}
            multiple
            showPreview
            files={files}
            onUpload={handleUpload}
            onRemove={handleRemoveFile}
            dragDropText="Arrastra archivos aquí o haz click para seleccionar"
            browseText="Seleccionar archivos"
          />
        </Card>

        <Divider />

        {/* Summary */}
        <Card
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
          }}
        >
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            ✨ 5 Nuevos Componentes Composite Listos
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0, marginTop: 8 }}>
            Todos los componentes son <Text strong style={{ color: 'white' }}>theme-aware</Text> y
            cambian completamente con cada tema (backgrounds, borders, shadows, padding, etc.).
            Cambia el tema arriba para ver las diferencias.
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};
