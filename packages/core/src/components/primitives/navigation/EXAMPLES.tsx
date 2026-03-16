/**
 * @fileoverview Navigation primitives usage examples.
 *
 * This file demonstrates how to use the Tabs, Breadcrumb, and Pagination components
 * in real-world scenarios.
 */

import React, { useState } from 'react';
import { Tabs, Breadcrumb, Pagination } from './index';
import type { TabItem, BreadcrumbItem } from './index';
import { Home, User, Settings, ChevronRight, FileText, Folder } from 'lucide-react';

// ============================================================================
// TABS EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Tabs
 */
export function BasicTabsExample() {
  const items: TabItem[] = [
    {
      key: 'tab1',
      label: 'Tab 1',
      children: <div>Content of Tab 1</div>,
    },
    {
      key: 'tab2',
      label: 'Tab 2',
      children: <div>Content of Tab 2</div>,
    },
    {
      key: 'tab3',
      label: 'Tab 3',
      children: <div>Content of Tab 3</div>,
      disabled: true,
    },
  ];

  return <Tabs items={items} />;
}

/**
 * Example 2: Tabs with Icons
 */
export function TabsWithIconsExample() {
  const items: TabItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: <Home size={16} />,
      children: <div>Welcome to the home page</div>,
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: <User size={16} />,
      children: <div>Your profile information</div>,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />,
      children: <div>Application settings</div>,
    },
  ];

  return <Tabs items={items} type="card" size="lg" />;
}

/**
 * Example 3: Controlled Tabs
 */
export function ControlledTabsExample() {
  const [activeKey, setActiveKey] = useState('dashboard');

  const items: TabItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      children: <div>Dashboard content</div>,
    },
    {
      key: 'analytics',
      label: 'Analytics',
      children: <div>Analytics content</div>,
    },
    {
      key: 'reports',
      label: 'Reports',
      children: <div>Reports content</div>,
    },
  ];

  return (
    <div>
      <Tabs
        items={items}
        activeKey={activeKey}
        onChange={setActiveKey}
        type="line"
        centered
      />
      <p>Active tab: {activeKey}</p>
    </div>
  );
}

/**
 * Example 4: Pills Style Tabs
 */
export function PillsTabsExample() {
  const items: TabItem[] = [
    {
      key: 'all',
      label: 'All Items',
      children: <div>Showing all items</div>,
    },
    {
      key: 'active',
      label: 'Active',
      children: <div>Showing active items</div>,
    },
    {
      key: 'archived',
      label: 'Archived',
      children: <div>Showing archived items</div>,
    },
  ];

  return <Tabs items={items} type="pills" size="sm" />;
}

// ============================================================================
// BREADCRUMB EXAMPLES
// ============================================================================

/**
 * Example 5: Basic Breadcrumb
 */
export function BasicBreadcrumbExample() {
  const items: BreadcrumbItem[] = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'products', label: 'Products', href: '/products' },
    { key: 'item', label: 'Item Details' },
  ];

  return <Breadcrumb items={items} />;
}

/**
 * Example 6: Breadcrumb with Icons
 */
export function BreadcrumbWithIconsExample() {
  const items: BreadcrumbItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: <Home size={14} />,
      href: '/',
    },
    {
      key: 'documents',
      label: 'Documents',
      icon: <Folder size={14} />,
      href: '/documents',
    },
    {
      key: 'file',
      label: 'report.pdf',
      icon: <FileText size={14} />,
    },
  ];

  return (
    <Breadcrumb
      items={items}
      separator={<ChevronRight size={12} />}
    />
  );
}

/**
 * Example 7: Breadcrumb with Click Handlers
 */
export function BreadcrumbWithClickHandlersExample() {
  const handleClick = (label: string) => {
    console.log(`Clicked: ${label}`);
  };

  const items: BreadcrumbItem[] = [
    {
      key: 'home',
      label: 'Home',
      onClick: () => handleClick('Home'),
    },
    {
      key: 'category',
      label: 'Category',
      onClick: () => handleClick('Category'),
    },
    {
      key: 'subcategory',
      label: 'Subcategory',
      onClick: () => handleClick('Subcategory'),
    },
    {
      key: 'item',
      label: 'Current Item',
    },
  ];

  return <Breadcrumb items={items} separator=">" />;
}

/**
 * Example 8: Breadcrumb with MaxItems
 */
export function BreadcrumbWithMaxItemsExample() {
  const items: BreadcrumbItem[] = [
    { key: '1', label: 'Level 1', href: '/1' },
    { key: '2', label: 'Level 2', href: '/1/2' },
    { key: '3', label: 'Level 3', href: '/1/2/3' },
    { key: '4', label: 'Level 4', href: '/1/2/3/4' },
    { key: '5', label: 'Level 5', href: '/1/2/3/4/5' },
    { key: '6', label: 'Level 6' },
  ];

  return <Breadcrumb items={items} maxItems={4} />;
}

// ============================================================================
// PAGINATION EXAMPLES
// ============================================================================

/**
 * Example 9: Basic Pagination
 */
export function BasicPaginationExample() {
  const [current, setCurrent] = useState(1);

  return (
    <Pagination
      current={current}
      total={100}
      pageSize={10}
      onChange={(page) => setCurrent(page)}
    />
  );
}

/**
 * Example 10: Pagination with Total
 */
export function PaginationWithTotalExample() {
  const [current, setCurrent] = useState(1);

  return (
    <Pagination
      current={current}
      total={250}
      pageSize={20}
      showTotal
      onChange={(page) => setCurrent(page)}
    />
  );
}

/**
 * Example 11: Small Pagination
 */
export function SmallPaginationExample() {
  const [current, setCurrent] = useState(1);

  return (
    <Pagination
      current={current}
      total={50}
      pageSize={5}
      size="sm"
      onChange={(page) => setCurrent(page)}
    />
  );
}

/**
 * Example 12: Pagination with Size Changer (Classic only)
 */
export function PaginationWithSizeChangerExample() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleChange = (page: number, newPageSize: number) => {
    setCurrent(page);
    setPageSize(newPageSize);
  };

  return (
    <div>
      <Pagination
        current={current}
        total={500}
        pageSize={pageSize}
        showSizeChanger
        showTotal
        onChange={handleChange}
      />
      <p>Current page: {current}, Page size: {pageSize}</p>
    </div>
  );
}

/**
 * Example 13: Disabled Pagination
 */
export function DisabledPaginationExample() {
  return (
    <Pagination
      current={5}
      total={100}
      pageSize={10}
      disabled
    />
  );
}

// ============================================================================
// COMBINED EXAMPLES
// ============================================================================

/**
 * Example 14: Full Page Layout with Navigation Components
 */
export function FullPageExample() {
  const [activeTab, setActiveTab] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);

  const breadcrumbItems: BreadcrumbItem[] = [
    { key: 'home', label: 'Home', icon: <Home size={14} />, href: '/' },
    { key: 'products', label: 'Products', href: '/products' },
    { key: 'category', label: 'Electronics' },
  ];

  const tabItems: TabItem[] = [
    {
      key: 'list',
      label: 'List View',
      children: (
        <div>
          <p>Showing page {currentPage} of items</p>
          <Pagination
            current={currentPage}
            total={200}
            pageSize={20}
            showTotal
            onChange={setCurrentPage}
          />
        </div>
      ),
    },
    {
      key: 'grid',
      label: 'Grid View',
      children: <div>Grid view content</div>,
    },
    {
      key: 'stats',
      label: 'Statistics',
      children: <div>Statistics content</div>,
    },
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <Breadcrumb
        items={breadcrumbItems}
        separator={<ChevronRight size={12} />}
      />
      <h1 style={{ margin: '1rem 0' }}>Electronics</h1>
      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
        type="line"
      />
    </div>
  );
}

/**
 * Example 15: Data Table with Navigation
 */
export function DataTableExample() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 487;

  const breadcrumbItems: BreadcrumbItem[] = [
    { key: 'home', label: 'Dashboard', href: '/dashboard' },
    { key: 'users', label: 'Users', href: '/users' },
    { key: 'list', label: 'User List' },
  ];

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <Breadcrumb items={breadcrumbItems} />

      <h1 style={{ margin: '1rem 0' }}>User List</h1>

      <div style={{ marginBottom: '1rem' }}>
        <p>Total users: {totalItems}</p>
        <p>Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalItems)}</p>
      </div>

      {/* Table would go here */}
      <div style={{ minHeight: '400px', border: '1px solid #ddd', padding: '1rem' }}>
        Table content for page {page}
      </div>

      <Pagination
        current={page}
        total={totalItems}
        pageSize={pageSize}
        showTotal
        showSizeChanger
        onChange={handlePageChange}
      />
    </div>
  );
}

/**
 * Example 16: Settings Page with Tabs and Breadcrumb
 */
export function SettingsPageExample() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { key: 'home', label: 'Home', icon: <Home size={14} />, href: '/' },
    { key: 'settings', label: 'Settings' },
  ];

  const tabItems: TabItem[] = [
    {
      key: 'general',
      label: 'General',
      icon: <Settings size={16} />,
      children: <div style={{ padding: '1rem' }}>General settings form</div>,
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: <User size={16} />,
      children: <div style={{ padding: '1rem' }}>Profile settings form</div>,
    },
    {
      key: 'security',
      label: 'Security',
      children: <div style={{ padding: '1rem' }}>Security settings form</div>,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: <div style={{ padding: '1rem' }}>Notification preferences</div>,
    },
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <Breadcrumb items={breadcrumbItems} />
      <h1 style={{ margin: '1rem 0' }}>Settings</h1>
      <Tabs items={tabItems} type="card" />
    </div>
  );
}

// ============================================================================
// RESPONSIVE EXAMPLE
// ============================================================================

/**
 * Example 17: Responsive Navigation
 */
export function ResponsiveNavigationExample() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabItems: TabItem[] = [
    { key: 'tab1', label: 'Tab 1', children: <div>Content 1</div> },
    { key: 'tab2', label: 'Tab 2', children: <div>Content 2</div> },
    { key: 'tab3', label: 'Tab 3', children: <div>Content 3</div> },
  ];

  return (
    <div>
      <Tabs
        items={tabItems}
        type={isMobile ? 'pills' : 'line'}
        size={isMobile ? 'sm' : 'md'}
        centered={!isMobile}
      />
    </div>
  );
}
