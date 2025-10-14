import React, { useState } from 'react';
import { DataTable, PageHeader, Card, Tag, Button, Space } from '@es-rottay/designsystem-core';
import type { DataTableColumn, BulkAction } from '@es-rottay/designsystem-core';
import { message } from 'antd';
import { DeleteOutlined, DownloadOutlined, EditOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';

interface User {
  key: string;
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  department: string;
  joinDate: string;
  salary: number;
  projects: number;
}

const generateUsers = (count: number): User[] => {
  const roles = ['Admin', 'Developer', 'Designer', 'Manager', 'Analyst'];
  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'];
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
  const names = [
    'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown',
    'Diana Prince', 'Eve Wilson', 'Frank Miller', 'Grace Lee', 'Henry Davis',
    'Ivy Chen', 'Jack Taylor', 'Kate Anderson', 'Leo Martinez', 'Mary Garcia',
    'Nathan White', 'Olivia Moore', 'Paul Jackson', 'Quinn Harris', 'Rachel King',
  ];

  return Array.from({ length: count }, (_, i) => ({
    key: `user-${i}`,
    id: i + 1,
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@company.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
    salary: Math.floor(Math.random() * 100000) + 50000,
    projects: Math.floor(Math.random() * 10) + 1,
  }));
};

export const EnhancedDataTableDemo: React.FC = () => {
  const [users, setUsers] = useState<User[]>(generateUsers(50));
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    message.info('Refreshing data...');
    setTimeout(() => {
      setUsers(generateUsers(50));
      setLoading(false);
      message.success('Data refreshed successfully!');
    }, 1500);
  };

  // Bulk delete
  const handleBulkDelete = (keys: React.Key[], rows: User[]) => {
    message.warning(`Deleting ${keys.length} users...`);
    setTimeout(() => {
      setUsers(prev => prev.filter(user => !keys.includes(user.key)));
      message.success(`${keys.length} users deleted successfully!`);
    }, 1000);
  };

  // Bulk export
  const handleBulkExport = (keys: React.Key[], rows: User[]) => {
    message.success(`Exporting ${rows.length} users...`);
    console.log('Exporting users:', rows);
  };

  // Bulk activate
  const handleBulkActivate = (keys: React.Key[], rows: User[]) => {
    setUsers(prev =>
      prev.map(user =>
        keys.includes(user.key) ? { ...user, status: 'active' as const } : user
      )
    );
    message.success(`${keys.length} users activated!`);
  };

  // Columns definition
  const columns: DataTableColumn<User>[] = [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
      hideable: false, // Cannot be hidden
    },
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Space>
          <UserOutlined />
          <strong>{name}</strong>
        </Space>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      render: (email: string) => (
        <Space>
          <MailOutlined />
          <span style={{ color: '#1890ff' }}>{email}</span>
        </Space>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role: string) => {
        const colors: Record<string, string> = {
          Admin: 'red',
          Developer: 'blue',
          Designer: 'purple',
          Manager: 'orange',
          Analyst: 'cyan',
        };
        return <Tag color={colors[role]}>{role}</Tag>;
      },
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'green',
          inactive: 'red',
          pending: 'orange',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
      hideable: true,
    },
    {
      key: 'department',
      title: 'Department',
      dataIndex: 'department',
      sorter: (a, b) => a.department.localeCompare(b.department),
      hideable: true,
    },
    {
      key: 'joinDate',
      title: 'Join Date',
      dataIndex: 'joinDate',
      sorter: (a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
      hideable: true,
    },
    {
      key: 'salary',
      title: 'Salary',
      dataIndex: 'salary',
      sorter: (a, b) => a.salary - b.salary,
      render: (salary: number) => `$${salary.toLocaleString()}`,
      hideable: true,
    },
    {
      key: 'projects',
      title: 'Projects',
      dataIndex: 'projects',
      sorter: (a, b) => a.projects - b.projects,
      render: (projects: number) => <Tag>{projects}</Tag>,
      hideable: true,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => message.info(`Edit ${record.name}`)}
          >
            Edit
          </Button>
        </Space>
      ),
      hideable: false,
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<User>[] = [
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleBulkDelete,
    },
    {
      key: 'export',
      label: 'Export Selected',
      icon: <DownloadOutlined />,
      onClick: handleBulkExport,
    },
    {
      key: 'activate',
      label: 'Activate',
      onClick: handleBulkActivate,
      disabled: (keys, rows) => rows.every(r => r.status === 'active'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader
        title="Enhanced DataTable Demo"
        subtitle="Showcasing all 10 advanced features"
        breadcrumbs={[
          { title: 'Home' },
          { title: 'Components' },
          { title: 'Enhanced DataTable' },
        ]}
      />

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card size="small">
          <h4>✅ Column Sorting</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Click column headers to sort (ASC/DESC/None)</p>
        </Card>
        <Card size="small">
          <h4>📄 CSV/Excel Export</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Export visible data to CSV or Excel format</p>
        </Card>
        <Card size="small">
          <h4>👁️ Show/Hide Columns</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Toggle column visibility (eye icon)</p>
        </Card>
        <Card size="small">
          <h4>☑️ Bulk Actions</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Select rows and perform batch operations</p>
        </Card>
        <Card size="small">
          <h4>📦 Expandable Rows</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Click arrow to see additional details</p>
        </Card>
        <Card size="small">
          <h4>🎨 Density Modes</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Switch between Compact/Default/Comfortable</p>
        </Card>
        <Card size="small">
          <h4>📍 Sticky Header</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Header stays visible while scrolling</p>
        </Card>
        <Card size="small">
          <h4>💾 State Persistence</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Settings saved to localStorage</p>
        </Card>
        <Card size="small">
          <h4>🔄 Refresh Button</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Reload data with loading state</p>
        </Card>
        <Card size="small">
          <h4>📱 Responsive Mode</h4>
          <p style={{ fontSize: 13, color: '#666' }}>Switches to cards on mobile (below 768px)</p>
        </Card>
      </div>

      {/* Data Table with ALL features enabled */}
      <Card>
        <DataTable
          // Data
          columns={columns}
          data={filteredUsers}
          rowKey="key"
          loading={loading}

          // 1. Search (Sorting is already in columns with sorter prop)
          showSearch
          searchPlaceholder="Search by name, email, or role..."
          onSearch={setSearchTerm}

          // 2. Export to CSV/Excel
          enableCSVExport
          enableExcelExport
          exportFilename="users-data"

          // 3. Show/Hide columns
          showColumnToggle

          // 4. Bulk actions
          showSelection
          bulkActions={bulkActions}

          // 5. Expandable rows
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '16px', background: '#fafafa' }}>
                <h4 style={{ marginTop: 0 }}>Additional Information</h4>
                <p><strong>Full Email:</strong> {record.email}</p>
                <p><strong>Department:</strong> {record.department}</p>
                <p><strong>Join Date:</strong> {record.joinDate}</p>
                <p><strong>Annual Salary:</strong> ${record.salary.toLocaleString()}</p>
                <p><strong>Active Projects:</strong> {record.projects}</p>
                <p><strong>Status:</strong> {record.status}</p>
              </div>
            ),
            rowExpandable: (record) => record.status !== 'inactive', // Only active/pending users can expand
          }}

          // 6. Density modes
          showDensityToggle
          defaultDensity="default"

          // 7. Sticky header
          stickyHeader
          stickyOffset={0}

          // 8. Save state to localStorage
          saveState
          stateKey="enhanced-datatable-demo"

          // 9. Refresh button
          showRefresh
          onRefresh={handleRefresh}

          // 10. Responsive mode
          responsive
          responsiveBreakpoint={768}
          renderCard={(record) => (
            <div>
              <h3 style={{ marginTop: 0 }}>{record.name}</h3>
              <p><strong>Email:</strong> {record.email}</p>
              <p><strong>Role:</strong> <Tag color="blue">{record.role}</Tag></p>
              <p><strong>Status:</strong> <Tag color={record.status === 'active' ? 'green' : 'orange'}>{record.status}</Tag></p>
              <p><strong>Department:</strong> {record.department}</p>
              <p><strong>Salary:</strong> ${record.salary.toLocaleString()}</p>
            </div>
          )}

          // Pagination
          pagination={{
            defaultPageSize: 10,
            pageSizeOptions: [5, 10, 20, 50],
          }}
        />
      </Card>

      {/* Instructions */}
      <Card style={{ marginTop: 24 }} title="💡 Try These Features">
        <ol style={{ paddingLeft: 20 }}>
          <li>🔍 <strong>Search:</strong> Type in the search box to filter users</li>
          <li>⬆️ <strong>Sort:</strong> Click column headers (Name, Email, Role, etc.) to sort</li>
          <li>📥 <strong>Export:</strong> Click "Export" → Choose CSV or Excel</li>
          <li>👁️ <strong>Toggle Columns:</strong> Click eye icon → Check/uncheck columns to hide/show</li>
          <li>☑️ <strong>Select Rows:</strong> Check boxes → See bulk actions appear (Delete, Export, Activate)</li>
          <li>➕ <strong>Expand Row:</strong> Click arrow icon on left to see more details</li>
          <li>📏 <strong>Change Density:</strong> Click height icon → Choose Compact/Default/Comfortable</li>
          <li>🔄 <strong>Refresh:</strong> Click refresh icon to reload data (with 1.5s delay simulation)</li>
          <li>📱 <strong>Responsive:</strong> Resize browser window below 768px to see card view</li>
          <li>💾 <strong>Persistence:</strong> Your settings (hidden columns, density, page size) are saved! Refresh the page to see them persist.</li>
        </ol>
      </Card>
    </div>
  );
};
