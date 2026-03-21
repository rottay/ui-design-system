'use client';

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
 * - **Classic**: Wraps Ant Design Layout components with full feature parity
 * - **Modern**: Tailwind CSS implementation with DaisyUI theming
 * - **Rustic**: Pure CSS flexbox layout with inline styles
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
 * // Force Modern (Tailwind) implementation
 * <Layout engine="modern">
 *   <Layout.Header engine="modern">Header</Layout.Header>
 *   <Layout.Content engine="modern">Content</Layout.Content>
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
import { createEngineComponent } from '../../../../runtime/engines/factory';
import type {
  LayoutProps,
  LayoutHeaderProps,
  LayoutSiderProps,
  LayoutContentProps,
  LayoutFooterProps,
} from './Layout.types';

export {
  type LayoutProps,
  type LayoutHeaderProps,
  type LayoutSiderProps,
  type LayoutContentProps,
  type LayoutFooterProps,
  LAYOUT_DEFAULTS,
} from './Layout.types';

const LayoutBase = createEngineComponent<LayoutProps>('Layout', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Layout })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Layout })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Layout })),
});

const Header = createEngineComponent<LayoutHeaderProps>('Layout.Header', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Header })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Header })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Header })),
});

const Sider = createEngineComponent<LayoutSiderProps>('Layout.Sider', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Sider })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Sider })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Sider })),
});

const Content = createEngineComponent<LayoutContentProps>('Layout.Content', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Content })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Content })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Content })),
});

const Footer = createEngineComponent<LayoutFooterProps>('Layout.Footer', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Footer })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Footer })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Footer })),
});

export const Layout = Object.assign(LayoutBase, {
  Header,
  Sider,
  Content,
  Footer,
});

export default Layout;
