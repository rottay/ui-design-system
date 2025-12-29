/**
 * @fileoverview Layout Component - Rottay Design System
 * @description A compound layout component for creating complete page structures
 * with Header, Sider (sidebar), Content, and Footer sub-components.
 * Provides a flexible foundation for application shells and admin dashboards.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Layout component follows the common web application pattern with:
 * - **Header**: Top navigation bar or branding area
 * - **Sider**: Collapsible sidebar for navigation menus
 * - **Content**: Main content area with automatic flex growth
 * - **Footer**: Bottom area for copyright, links, etc.
 *
 * Key features:
 * - Compound component pattern (Layout.Header, Layout.Sider, etc.)
 * - Collapsible sidebar with controlled/uncontrolled state
 * - Responsive breakpoint-based auto-collapse
 * - Light and dark theme support for sider
 * - Nested layouts for complex structures
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Titan**: Wraps Ant Design Layout components with full feature parity
 * - **Hermes**: Tailwind CSS implementation with DaisyUI theming
 * - **Apollo**: Pure CSS flexbox layout with inline styles
 *
 * @example Basic Page Layout
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * <Layout>
 *   <Layout.Header>My Application</Layout.Header>
 *   <Layout.Content>
 *     <h1>Welcome</h1>
 *     <p>Main content goes here...</p>
 *   </Layout.Content>
 *   <Layout.Footer>© 2024 My Company</Layout.Footer>
 * </Layout>
 * ```
 *
 * @example Layout with Sidebar
 * ```tsx
 * import { Layout, Menu } from '@rottay/design-system';
 *
 * <Layout hasSider>
 *   <Layout.Sider width={200}>
 *     <Menu mode="inline">
 *       <Menu.Item key="1">Dashboard</Menu.Item>
 *       <Menu.Item key="2">Users</Menu.Item>
 *       <Menu.Item key="3">Settings</Menu.Item>
 *     </Menu>
 *   </Layout.Sider>
 *   <Layout>
 *     <Layout.Header>Dashboard</Layout.Header>
 *     <Layout.Content>Content area</Layout.Content>
 *   </Layout>
 * </Layout>
 * ```
 *
 * @example Collapsible Sidebar
 * ```tsx
 * import { useState } from 'react';
 * import { Layout } from '@rottay/design-system';
 *
 * function App() {
 *   const [collapsed, setCollapsed] = useState(false);
 *
 *   return (
 *     <Layout hasSider>
 *       <Layout.Sider
 *         collapsible
 *         collapsed={collapsed}
 *         onCollapse={setCollapsed}
 *         width={250}
 *         collapsedWidth={80}
 *       >
 *         Navigation Menu
 *       </Layout.Sider>
 *       <Layout>
 *         <Layout.Content>Main Content</Layout.Content>
 *       </Layout>
 *     </Layout>
 *   );
 * }
 * ```
 *
 * @example Responsive Auto-Collapse
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * // Sider auto-collapses on screens smaller than 'md' breakpoint
 * <Layout.Sider
 *   collapsible
 *   breakpoint="md"
 *   onCollapse={(collapsed) => console.log('Collapsed:', collapsed)}
 * >
 *   Responsive Menu
 * </Layout.Sider>
 * ```
 *
 * @example Dark Theme Sidebar
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * <Layout.Sider theme="dark" width={240}>
 *   Dark-themed navigation
 * </Layout.Sider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * // Force Hermes (Tailwind) implementation
 * <Layout engine="hermes">
 *   <Layout.Header engine="hermes">Header</Layout.Header>
 *   <Layout.Content engine="hermes">Content</Layout.Content>
 * </Layout>
 * ```
 *
 * @see {@link Container} - For max-width content containers
 * @see {@link Box} - For flexible box layouts
 * @see {@link Flex} - For flexbox-based layouts
 *
 * @module Layout
 * @category Layout
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
import type {
  LayoutProps,
  LayoutHeaderProps,
  LayoutSiderProps,
  LayoutContentProps,
  LayoutFooterProps,
} from './types';

export {
  type LayoutProps,
  type LayoutHeaderProps,
  type LayoutSiderProps,
  type LayoutContentProps,
  type LayoutFooterProps,
  LAYOUT_DEFAULTS,
} from './types';

const LayoutBase = createEngineComponent<LayoutProps>('Layout', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Layout })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Layout })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Layout })),
});

const Header = createEngineComponent<LayoutHeaderProps>('Layout.Header', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Header })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Header })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Header })),
});

const Sider = createEngineComponent<LayoutSiderProps>('Layout.Sider', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Sider })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Sider })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Sider })),
});

const Content = createEngineComponent<LayoutContentProps>('Layout.Content', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Content })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Content })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Content })),
});

const Footer = createEngineComponent<LayoutFooterProps>('Layout.Footer', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Footer })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Footer })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Footer })),
});

export const Layout = Object.assign(LayoutBase, {
  Header,
  Sider,
  Content,
  Footer,
});

export default Layout;
