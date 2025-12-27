/**
 * Layout - Engine Router (Compound Component)
 *
 * This module exports the Layout component with multi-engine support.
 * Layout is a compound component for creating page structures with
 * Header, Sider, Content, and Footer sub-components.
 *
 * @module Layout
 * @example
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * // Basic layout
 * <Layout>
 *   <Layout.Header>Header</Layout.Header>
 *   <Layout.Content>Content</Layout.Content>
 *   <Layout.Footer>Footer</Layout.Footer>
 * </Layout>
 *
 * // Layout with sidebar
 * <Layout hasSider>
 *   <Layout.Sider width={200}>Sidebar</Layout.Sider>
 *   <Layout>
 *     <Layout.Header>Header</Layout.Header>
 *     <Layout.Content>Content</Layout.Content>
 *   </Layout>
 * </Layout>
 *
 * // Collapsible sidebar
 * <Layout.Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
 *   Menu
 * </Layout.Sider>
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
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
