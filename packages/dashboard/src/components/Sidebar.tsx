import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavItem {
  path: string;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'General',
    items: [
      { path: '/', label: 'Overview' },
    ],
  },
  {
    title: 'Display (17)',
    items: [
      { path: '/display/avatar', label: 'Avatar' },
      { path: '/display/badge', label: 'Badge' },
      { path: '/display/calendar', label: 'Calendar' },
      { path: '/display/carousel', label: 'Carousel' },
      { path: '/display/collapse', label: 'Collapse' },
      { path: '/display/descriptions', label: 'Descriptions' },
      { path: '/display/empty', label: 'Empty' },
      { path: '/display/image', label: 'Image' },
      { path: '/display/list', label: 'List' },
      { path: '/display/qrcode', label: 'QRCode' },
      { path: '/display/statistic', label: 'Statistic' },
      { path: '/display/table', label: 'Table' },
      { path: '/display/tag', label: 'Tag' },
      { path: '/display/timeline', label: 'Timeline' },
      { path: '/display/tooltip', label: 'Tooltip' },
      { path: '/display/tree', label: 'Tree' },
      { path: '/display/typography', label: 'Typography' },
    ],
  },
  {
    title: 'Feedback (9)',
    items: [
      { path: '/feedback/alert', label: 'Alert' },
      { path: '/feedback/drawer', label: 'Drawer' },
      { path: '/feedback/message', label: 'Message' },
      { path: '/feedback/modal', label: 'Modal' },
      { path: '/feedback/notification', label: 'Notification' },
      { path: '/feedback/progress', label: 'Progress' },
      { path: '/feedback/result', label: 'Result' },
      { path: '/feedback/skeleton', label: 'Skeleton' },
      { path: '/feedback/spin', label: 'Spin' },
    ],
  },
  {
    title: 'Inputs (17)',
    items: [
      { path: '/inputs/autocomplete', label: 'AutoComplete' },
      { path: '/inputs/cascader', label: 'Cascader' },
      { path: '/inputs/checkbox', label: 'Checkbox' },
      { path: '/inputs/colorpicker', label: 'ColorPicker' },
      { path: '/inputs/datepicker', label: 'DatePicker' },
      { path: '/inputs/form', label: 'Form' },
      { path: '/inputs/input', label: 'Input' },
      { path: '/inputs/inputnumber', label: 'InputNumber' },
      { path: '/inputs/mentions', label: 'Mentions' },
      { path: '/inputs/radio', label: 'Radio' },
      { path: '/inputs/rate', label: 'Rate' },
      { path: '/inputs/select', label: 'Select' },
      { path: '/inputs/slider', label: 'Slider' },
      { path: '/inputs/switch', label: 'Switch' },
      { path: '/inputs/timepicker', label: 'TimePicker' },
      { path: '/inputs/transfer', label: 'Transfer' },
      { path: '/inputs/upload', label: 'Upload' },
    ],
  },
  {
    title: 'Layout (9)',
    items: [
      { path: '/layout/card', label: 'Card' },
      { path: '/layout/container', label: 'Container' },
      { path: '/layout/divider', label: 'Divider' },
      { path: '/layout/flex', label: 'Flex' },
      { path: '/layout/grid', label: 'Grid' },
      { path: '/layout/layout', label: 'Layout' },
      { path: '/layout/space', label: 'Space' },
      { path: '/layout/splitter', label: 'Splitter' },
      { path: '/layout/stack', label: 'Stack' },
    ],
  },
  {
    title: 'Navigation (11)',
    items: [
      { path: '/navigation/affix', label: 'Affix' },
      { path: '/navigation/anchor', label: 'Anchor' },
      { path: '/navigation/backtop', label: 'BackTop' },
      { path: '/navigation/breadcrumb', label: 'Breadcrumb' },
      { path: '/navigation/button', label: 'Button' },
      { path: '/navigation/floatbutton', label: 'FloatButton' },
      { path: '/navigation/menu', label: 'Menu' },
      { path: '/navigation/pagination', label: 'Pagination' },
      { path: '/navigation/segmented', label: 'Segmented' },
      { path: '/navigation/steps', label: 'Steps' },
      { path: '/navigation/tabs', label: 'Tabs' },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <nav>
      {/* Theme Switcher */}
      <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0', marginBottom: '16px' }}>
        <ThemeSwitcher />
      </div>

      {navGroups.map((group) => (
        <div key={group.title} style={{ marginBottom: '24px' }}>
          <h3
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#999',
              padding: '0 24px',
              marginBottom: '8px',
              letterSpacing: '0.5px',
            }}
          >
            {group.title}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={{
                      display: 'block',
                      padding: '8px 24px',
                      color: isActive ? '#1890ff' : '#333',
                      textDecoration: 'none',
                      fontSize: '14px',
                      backgroundColor: isActive ? '#e6f7ff' : 'transparent',
                      borderLeft: isActive ? '3px solid #1890ff' : '3px solid transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};
